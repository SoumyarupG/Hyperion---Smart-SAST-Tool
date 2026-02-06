import os
import re
from typing import List, Dict, Any
from rules import get_rules_for_stack, Rule
from hyperion.core.ignore import IgnoreManager

import ast
from typing import List, Dict, Any, Set
from rules import get_rules_for_stack, Rule, RUBY_RULES

class Detector:
    def detect_languages_from_files(self, all_files: List[str]) -> List[str]:
        """Detects all languages used from a pre-discovered file list."""
        detected = set()
        for file_path in all_files:
            file = os.path.basename(file_path)
            if file.endswith(".py"):
                detected.add("python")
            elif file.endswith(".js") or file.endswith(".jsx") or file.endswith(".ts") or file.endswith(".tsx"):
                detected.add("javascript")
            elif file.endswith(".java"):
                detected.add("java")
            elif file.endswith(".rb"):
                detected.add("ruby")
            elif file.endswith(".yaml") or file.endswith(".yml"):
                detected.add("yaml")
            elif file.endswith(".config") or file.endswith(".xml"):
                detected.add("xml")
            elif file.endswith(".html") or file.endswith(".htm") or file.endswith(".cshtml"):
                detected.add("html")
        return list(detected)

    def detect_frameworks_from_files(self, all_files: List[str], languages: List[str]) -> List[str]:
        """Detects frameworks from pre-discovered file list."""
        frameworks = []
        files_by_dir = {}
        for f in all_files:
            d = os.path.dirname(f)
            if d not in files_by_dir: files_by_dir[d] = []
            files_by_dir[d].append(os.path.basename(f))

        for directory, files in files_by_dir.items():
            if "python" in languages:
                if "manage.py" in files:
                    frameworks.append("django")
                if "requirements.txt" in files:
                    try:
                        with open(os.path.join(directory, "requirements.txt"), 'r', errors='ignore') as f:
                            content = f.read().lower()
                            if "flask" in content: frameworks.append("flask")
                            if "django" in content and "django" not in frameworks: frameworks.append("django")
                            if "fastapi" in content: frameworks.append("fastapi")
                    except: pass
            if "javascript" in languages:
                if "package.json" in files:
                    try:
                        with open(os.path.join(directory, "package.json"), 'r', errors='ignore') as f:
                            content = f.read().lower()
                            if "\"express\"" in content: frameworks.append("express")
                            if "\"sails\"" in content: frameworks.append("sails")
                            if "\"react\"" in content: frameworks.append("react")
                            if "\"vue\"" in content: frameworks.append("vue")
                            if "\"angular\"" in content: frameworks.append("angular")
                    except: pass
        return list(set(frameworks))

class PythonASTScanner:
    def scan(self, file_path: str) -> List[Dict[str, Any]]:
        findings = []
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            tree = ast.parse(content)
            
            for node in ast.walk(tree):
                # Check for hardcoded passwords in assignments
                if isinstance(node, ast.Assign):
                    for target in node.targets:
                        if isinstance(target, ast.Name) and isinstance(node.value, (ast.Str, ast.Constant)):
                            var_name = target.id.lower()
                            # Check if variable name suggests a secret
                            if any(s in var_name for s in ['password', 'secret', 'api_key', 'token']):
                                # Check if value is a string literal (and not empty/short)
                                val = node.value.s if isinstance(node.value, ast.Str) else node.value.value
                                if isinstance(val, str) and len(val) > 3:
                                    findings.append({
                                        "rule_id": "PY001-AST",
                                        "severity": "HIGH",
                                        "message": f"Possible hardcoded secret in variable '{target.id}'",
                                        "file": file_path,
                                        "line": node.lineno,
                                        "code": f"{target.id} = '***'"
                                    })
                                    
        except SyntaxError:
            # Failed to parse python file (might be python 2 or invalid syntax)
            pass
        except Exception as e:
            print(f"AST Scan error {file_path}: {e}")
            
        return findings

class Scanner:
    def __init__(self):
        self.detector = Detector()

    def scan_file(self, file_path: str, rules: List[Rule]) -> List[Dict[str, Any]]:
        print(f"DEBUG: Scanning {file_path}")
        findings = []
        
        # 1. Skip very large files
        try:
            file_size = os.path.getsize(file_path)
            if file_size > 5 * 1024 * 1024: return []
        except: pass

        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # 2. Optimized combined scan using finditer
            for rule in rules:
                try:
                    # Case insensitive by default for better coverage
                    matches = list(re.finditer(rule.pattern, content, re.IGNORECASE | re.MULTILINE))
                    for match in matches:
                        match_text = match.group(0)
                        
                        # Whitelist check
                        if rule.whitelist and any(w in match_text for w in rule.whitelist):
                            continue
                            
                        # Find line number
                        line_no = content.count('\n', 0, match.start()) + 1
                        
                        # Get the actual line text
                        line_start = content.rfind('\n', 0, match.start()) + 1
                        line_end = content.find('\n', match.end())
                        if line_end == -1: line_end = len(content)
                        line_content = content[line_start:line_end].strip()[:200]
                        
                        findings.append({
                            "rule_id": rule.id,
                            "severity": rule.severity,
                            "message": rule.message,
                            "file": file_path,
                            "line": line_no,
                            "code": line_content
                        })
                        
                        # Limit findings per file to avoid noise/hangs
                        if len(findings) > 100: break
                except Exception as e:
                    print(f"Regex error for rule {rule.id} on {file_path}: {e}")
                
                if len(findings) > 500: break # Global file limit

        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
        return findings

    def scan_project(self, root_path: str) -> Dict[str, Any]:
        languages = self.detector.detect_languages(root_path)
        frameworks = self.detector.detect_frameworks(root_path, languages)
        
        all_findings = []
        ast_scanner = PythonASTScanner()
        
        # Get regex rules for all detected languages
        rules = []
        for lang in languages:
            rules.extend(get_rules_for_stack(lang, frameworks))
        
        for root, _, files in os.walk(root_path):
            if "node_modules" in root or "venv" in root or ".git" in root or "__pycache__" in root:
                continue
                
            for file in files:
                # Skip minified files
                if file.endswith(".min.js") or file.endswith(".min.css"):
                    continue
                    
                file_path = os.path.join(root, file)

                
                # Python Scanning
                if file.endswith(".py") and "python" in languages:
                    # Run AST Scan
                    all_findings.extend(ast_scanner.scan(file_path))
                    # Run Regex Scan (excluding the replaced password rule if we wanted, but for now running all non-conflicting)
                    all_findings.extend(self.scan_file(file_path, rules))
                
                # JS Scanning
                elif (file.endswith(".js") or file.endswith(".jsx") or file.endswith(".ts") or file.endswith(".tsx")) and "javascript" in languages:
                    all_findings.extend(self.scan_file(file_path, rules))
                    
                # Ruby Scanning
                elif file.endswith(".rb") and "ruby" in languages:
                    all_findings.extend(self.scan_file(file_path, rules))
                
                # YAML Scanning
                elif (file.endswith(".yaml") or file.endswith(".yml")) and "yaml" in languages:
                    all_findings.extend(self.scan_file(file_path, rules))
                
        return {
            "meta": {
                "languages": languages,
                "frameworks": frameworks,
                "total_files_scanned": "Calculated during scan (omitted for brevity)", 
                "total_issues": len(all_findings)
            },
            "findings": all_findings
        }
