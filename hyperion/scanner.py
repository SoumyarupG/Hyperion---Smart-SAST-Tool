import os
from typing import List, Dict, Any
from hyperion.core.node import HIRNode
from hyperion.core.graph import GraphBuilder
from hyperion.core.engine import HyperionTaintEngine
from hyperion.core.scope import SymbolTable
from hyperion.parsers.python_parser import PythonParser
from hyperion.parsers.xml_scanner import XMLConfigScanner
from hyperion.parsers.html_scanner import HTMLScanner
from hyperion.ai.verifier import AIVerifier
from hyperion.core.ignore import IgnoreManager

# Import Legacy components for fallback
from analyzer import Detector, Scanner as LegacyScanner
from rules import get_rules_for_stack

class HyperionScanner:
    def __init__(self):
        # SymbolTable is shared across the project scan
        self.symbol_table = SymbolTable()
        self.parser = PythonParser(self.symbol_table)
        self.graph_builder = GraphBuilder()
        self.engine = HyperionTaintEngine()
        self.ai_verifier = AIVerifier()
        
        # Specialized scanners for different file types
        self.xml_scanner = XMLConfigScanner()
        self.html_scanner = HTMLScanner()
        
        # Legacy components for non-Python support
        self.detector = Detector()
        self.legacy_scanner = LegacyScanner()

    def scan_project(self, root_path: str) -> Dict[str, Any]:
        all_project_files = []
        python_files = []
        other_files = []
        xml_files = []
        html_files = []

        print(f"DEBUG: Starting file discovery in {root_path}")
        ignore_manager = IgnoreManager(root_path)
        
        file_count = 0
        for root, dirs, files in os.walk(root_path):
            # Prune directories using IgnoreManager
            dirs[:] = [d for d in dirs if not ignore_manager.should_ignore(os.path.join(root, d))]
            
            for file in files:
                file_count += 1
                if file_count % 5000 == 0:
                    print(f"DEBUG: Discovered {file_count} files so far...")
                
                file_path = os.path.join(root, file)
                
                # Check if file should be ignored
                if ignore_manager.should_ignore(file_path):
                    continue
                
                all_project_files.append(file_path)
                
                ext = os.path.splitext(file)[1].lower()
                if ext == ".py":
                    python_files.append(file_path)
                elif ext in [".js", ".jsx", ".ts", ".tsx", ".rb", ".yaml", ".yml"]:
                    other_files.append(file_path)
                elif ext in [".config", ".xml"]:
                    xml_files.append(file_path)
                elif ext in [".html", ".htm", ".cshtml"]:
                    html_files.append(file_path)

        print(f"DEBUG: Discovery complete. Found {len(all_project_files)} relevant files.")

        # Now detect languages and frameworks from discovered files (Fast, no I/O)
        languages = self.detector.detect_languages_from_files(all_project_files)
        frameworks = self.detector.detect_frameworks_from_files(all_project_files, languages)
        
        all_findings = []
        
        # Get legacy rules for fallback
        legacy_rules = []
        for lang in languages:
            legacy_rules.extend(get_rules_for_stack(lang, frameworks))

        # Parse and Register
        project_hir = {}
        for file_path in python_files:
            try:
                # Parser populates self.symbol_table
                hir = self.parser.parse(file_path)
                project_hir[file_path] = hir
            except Exception as e:
                print(f"Error parsing {file_path}: {e}")

        # --- PASS 2: Analyze Files ---
        
        # 1. Python: Use Hyperion Engine
        # 1. Python: Use Hyperion Engine
        for file_path, hir in project_hir.items():
            findings = self.analyze_file(file_path, hir)
            all_findings.extend(findings)
            
            # [HYBRID] Also run Regex Rules on Python files to catch Config/Static issues (Safe to run double)
            regex_findings = self.legacy_scanner.scan_file(file_path, legacy_rules)
            all_findings.extend(regex_findings)
            
        # 2. JS/Ruby/YAML: Use Legacy Regex (Fallback)
        for file_path in other_files:
             findings = self.legacy_scanner.scan_file(file_path, legacy_rules)
             all_findings.extend(findings)
        
        # 3. XML/Config: Use XML Scanner
        for file_path in xml_files:
            findings = self.xml_scanner.scan(file_path)
            all_findings.extend(findings)
        
        # 4. HTML/Razor: Use HTML Scanner
        for file_path in html_files:
            findings = self.html_scanner.scan(file_path)
            all_findings.extend(findings)

        # --- PASS 3: AI Smart Verification (Efficient) ---
        verified_findings = []
        # Limit total findings to verify to 500 for performance
        candidates = all_findings[:500]
        
        for i, f in enumerate(candidates):
            # Skip if already verified (Python path)
            if "ai_analysis" in f:
                verified_findings.append(f)
                continue
                
            code_context = f.get('code', 'N/A')
            verdict = self.ai_verifier.verify(f, code_context)
            f["ai_analysis"] = verdict.to_dict()
            
            if verdict.is_safe and verdict.confidence > 0.8:
                f["severity"] = "SAFE"
                f["message"] = f"[AI SAFE] {f['message']} ({verdict.reasoning})"
            
            verified_findings.append(f)

        return {

            "meta": {
                "languages": languages,
                "frameworks": frameworks,
                "engine": "Hyperion v1.5 (Iterative Scalable Engine)",
                "total_issues": len(all_findings),
                "verified_issues": len(verified_findings)
            },
            "findings": verified_findings

        }

    def analyze_file(self, file_path: str, hir_root: HIRNode) -> List[Dict[str, Any]]:
        # 2. Build Graphs (CFG/DFG)
        self.graph_builder.build_cfg(hir_root)
        self.graph_builder.build_dfg(hir_root)
        # Link calls using the populated symbol table
        self.graph_builder.build_call_graph(hir_root, self.symbol_table)
        
        # 3. Run Taint Analysis
        vulns = self.engine.propagate(hir_root)
        
        findings = []
        for v in vulns:
            f_dict = v.to_dict()
            
            # 4. AI Verification
            # Extract context (simplified: just the message/code for now)
            context = f"{f_dict['message']} Code: {f_dict.get('code', '')}"
            verdict = self.ai_verifier.verify(f_dict, context)
            
            f_dict["ai_analysis"] = verdict.to_dict()
            
            # Filter if AI is confident it's safe
            if verdict.is_safe and verdict.confidence > 0.9:
                print(f"🛡️ AI Suppressed False Positive: {f_dict['message']} ({verdict.reasoning})")
                # We can either drop it or mark it as suppressed.
                # Let's mark it for the UI to show "AI Safe"
                f_dict["severity"] = "SAFE"
            
            findings.append(f_dict)
            
        return findings

    def scan_file(self, file_path: str) -> List[Dict[str, Any]]:
        # Single file scan
        hir_root = self.parser.parse(file_path)
        self.graph_builder.build_cfg(hir_root)
        self.graph_builder.build_dfg(hir_root)
        self.graph_builder.build_call_graph(hir_root, self.symbol_table)
        vulns = self.engine.propagate(hir_root)
        
        findings = []
        for v in vulns:
            f_dict = v.to_dict()
            
            # 4. AI Verification
            context = f"{f_dict['message']} Code: {f_dict.get('code', '')}"
            verdict = self.ai_verifier.verify(f_dict, context)
            
            f_dict["ai_analysis"] = verdict.to_dict()
            
            if verdict.is_safe and verdict.confidence > 0.9:
                print(f"🛡️ AI Suppressed False Positive: {f_dict['message']} ({verdict.reasoning})")
                f_dict["severity"] = "SAFE"
            
            findings.append(f_dict)
            
        return findings
