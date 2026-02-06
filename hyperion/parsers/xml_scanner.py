import os
import re
from typing import List, Dict, Any
from rules import XML_RULES

class XMLConfigScanner:
    """
    Scanner for XML and .config files (ASP.NET Web.config, etc.)
    Uses regex-based pattern matching for security vulnerabilities.
    """
    
    def scan(self, file_path: str) -> List[Dict[str, Any]]:
        findings = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines):
                for rule in XML_RULES:
                    if re.search(rule.pattern, line, re.IGNORECASE):
                        findings.append({
                            "rule_id": rule.id,
                            "severity": rule.severity,
                            "message": rule.message,
                            "file": file_path,
                            "line": i + 1,
                            "code": line.strip()
                        })
        except Exception as e:
            print(f"Error scanning XML/config file {file_path}: {e}")
        
        return findings
