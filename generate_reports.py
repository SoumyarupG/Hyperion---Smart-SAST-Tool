
import os
import csv
import json
import asyncio
import argparse
from datetime import datetime
from hyperion.scanner import HyperionScanner

# 1. Compliance Mapping Registry
COMPLIANCE_MAP = {
    "TAINT-001": {
        "name": "Remote Code Execution (RCE)",
        "pci": "6.5.1 - Injection Flaws",
        "owasp_2017": "A1:2017-Injection",
        "owasp_2021": "A03:2021-Injection",
        "cwe": "CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code",
        "desc": "The application uses 'eval' or similar functions with untrusted input, allowing arbitrary code execution."
    },
    "HYP-RCE-001": {
        "name": "Remote Code Execution (RCE)",
        "pci": "6.5.1 - Injection Flaws",
        "owasp_2017": "A1:2017-Injection",
        "owasp_2021": "A03:2021-Injection",
        "cwe": "CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code",
        "desc": "The application uses 'eval' or similar functions with untrusted input, allowing arbitrary code execution."
    },
    "HYP-OS-CMD-001": {
        "name": "OS Command Injection",
        "pci": "6.5.1 - Injection Flaws",
        "owasp_2017": "A1:2017-Injection",
        "owasp_2021": "A03:2021-Injection",
        "cwe": "CWE-78: Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')",
        "desc": "The application executes OS commands with untrusted input."
    },
    "HYP-SQL-001": {
        "name": "SQL Injection",
        "pci": "6.5.1 - Injection Flaws",
        "owasp_2017": "A1:2017-Injection",
        "owasp_2021": "A03:2021-Injection",
        "cwe": "CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')",
        "desc": "The application constructs SQL queries using untrusted input."
    },
    "HYP-PATH-001": {
        "name": "Path Traversal",
        "pci": "6.5.1 - Injection Flaws",
        "owasp_2017": "A1:2017-Injection",
        "owasp_2021": "A01:2021-Broken Access Control",
        "cwe": "CWE-22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')",
        "desc": "The application uses untrusted input to construct file paths, allowing access to unauthorized files."
    },
    "DJ002": {
        "name": "Insecure CORS Configuration",
        "pci": "6.5.8 - Security Misconfiguration",
        "owasp_2017": "A6:2017-Security Misconfiguration",
        "owasp_2021": "A05:2021-Security Misconfiguration",
        "cwe": "CWE-942: Permissive Cross-domain Policy with Untrusted Domains",
        "desc": "CORS_ORIGIN_ALLOW_ALL is set to True, effectively disabling Same-Origin Policy."
    },
    "DJ003": {
        "name": "Hardcoded Cryptographic Key",
        "pci": "6.3.1 - Review of Security Controls",
        "owasp_2017": "A3:2017-Sensitive Data Exposure",
        "owasp_2021": "A07:2021-Identification and Authentication Failures",
        "cwe": "CWE-798: Use of Hard-coded Credentials",
        "desc": "SECRET_KEY is hardcoded in the settings file, which can lead to session hijacking."
    },
    "DJ004": {
        "name": "Cross-Site Request Forgery (CSRF) Protection Disabled",
        "pci": "6.5.9 - Cross-Site Request Forgery (CSRF)",
        "owasp_2017": "A6:2017-Security Misconfiguration",
        "owasp_2021": "A01:2021-Broken Access Control",
        "cwe": "CWE-352: Cross-Site Request Forgery (CSRF)",
        "desc": "CsrfViewMiddleware is commented out or missing, leaving the application vulnerable to CSRF."
    },
    "DJ005": {
        "name": "Hardcoded Redis Credentials",
        "pci": "8.2.1 - Use strong authentication methods",
        "owasp_2017": "A3:2017-Sensitive Data Exposure",
        "owasp_2021": "A07:2021-Identification and Authentication Failures",
        "cwe": "CWE-798: Use of Hard-coded Credentials",
        "desc": "Redis connection string contains hardcoded password."
    }
}

# 2. Main Generation Logic
async def generate_professional_reports(scan_root: str, output_dir: str = None) -> dict:
    """
    Generates professional CSV and HTML reports for the given project path.
    Returns a dictionary with paths to the generated files.
    """
    if not os.path.exists(scan_root):
        raise FileNotFoundError(f"Path not found: {scan_root}")

    if not output_dir:
        output_dir = scan_root

    print(f"🚀 Scanning Target: {scan_root}")
    scanner = HyperionScanner()
    
    # Run Generic Project Scan
    # (My patch in scanner.py ensures that Python Config/Regex rules are run)
    results = scanner.scan_project(scan_root)
    findings = results['findings']
    
    print(f"✅ Scan Complete. Total Findings: {len(findings)}")
    
    # 3. Enrich Findings
    enriched_findings = []
    for f in findings:
        rule_id = f.get('rule_id', 'UNKNOWN')
        meta = COMPLIANCE_MAP.get(rule_id, {
            "name": f.get('message', 'Unknown Issue'),
            "pci": "", "owasp_2017": "", "owasp_2021": "", "cwe": "", "desc": f.get('message', '')
        })
        
        # Normalize file path
        # Use simple basename or relative path depending on need.
        # Checkmarx often uses relative.
        abs_path = f.get('file_path', f.get('file', ''))
        rel_path = os.path.relpath(abs_path, scan_root).replace("\\", "/") if abs_path else "N/A"
        
        enriched_findings.append({
            **f,
            "rel_path": rel_path,
            "compliance": meta
        })
        
    # 4. Generate CSV
    timestamp = datetime.now().strftime("%Y-%m-%d_T%H-%M-%S")
    csv_filename = f"hyperion_professional_report_{timestamp}.csv"
    csv_file_path = os.path.join(output_dir, csv_filename)
    
    headers = ["Query", "QueryPath", "PCI DSS v3.1", "OWASP Top 10 2013", "FISMA 2014", "NIST SP 800-53", "OWASP Top 10 2017", "OWASP Mobile Top 10 2016", "OWASP Top 10 API", "OWASP Top 10 2010", "ASD STIG 4.10", "Custom", "CWE top 25", "MOIS(KISA) Secure Coding 2021", "OWASP ASVS", "OWASP Top 10 2021", "PCI DSS v3.2.1", "SANS top 25", "SrcFileName", "Line", "Column", "NodeId", "Name", "DestFileName", "DestLine", "DestColumn", "DestNodeId", "DestName", "Result State", "Result Severity", "Assigned To", "Comment", "Link", "Result Status", "Detection Date"]
    
    with open(csv_file_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        for f in enriched_findings:
            mapping = f['compliance']
            writer.writerow([
                mapping['name'], # Query
                f"Python\\Hyperion\\{f['severity']}\\{mapping['name']}", # QueryPath
                mapping['pci'], # PCI 3.1
                "", # OWASP 2013
                "", # FISMA
                "", # NIST
                mapping['owasp_2017'], # OWASP 2017
                "", # Mobile
                "", # API
                "", # 2010
                "", # STIG
                "", # Custom
                mapping['cwe'], # CWE
                "", # MOIS
                "", # ASVS
                mapping['owasp_2021'], # OWASP 2021
                mapping['pci'], # PCI 3.2.1
                "", # SANS
                f['rel_path'], # SrcFileName
                f.get('line', 0), # Line
                0, # Column
                1, # NodeId
                "HyperionEngine", # Name
                f['rel_path'], # DestFileName
                f.get('line', 0), # DestLine
                0, # DestColumn
                1, # DestNodeId
                "HyperionEngine", # DestName
                "To Verify", # Result State
                f.get('severity', 'Medium'), # Result Severity
                "", # Assigned To
                mapping['desc'], # Comment
                "", # Link
                "New", # Result Status
                datetime.now().strftime("%d/%m/%Y %H:%M:%S") # Date
            ])
            
    print(f"📝 CSV Report Generated: {os.path.abspath(csv_file_path)}")

    # 5. Generate Professional HTML Report
    html_file_path = None
    try:
        import jinja2
        
        # Prepare Metrics
        sev_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "SAFE": 0}
        cat_counts = {}
        
        html_findings = []
        for f in enriched_findings:
            sev = f.get('severity', 'MEDIUM').upper()
            sev_counts[sev] = sev_counts.get(sev, 0) + 1
            
            cat_name = f['compliance']['name']
            if cat_name not in cat_counts:
                cat_counts[cat_name] = {
                    "name": cat_name,
                    "pci": f['compliance']['pci'],
                    "owasp": f['compliance']['owasp_2021'],
                    "count": 0
                }
            cat_counts[cat_name]['count'] += 1
            
            # Prepare for template display
            f['severity_class'] = sev.lower()
            if sev == 'CRITICAL': f['severity_class'] = 'critical' # match css
            
            # Ensure findings have code snippet if not present
            if 'code' not in f:
                f['code'] = "Code snippet not available in this view."
                
            html_findings.append(f)

        summary_by_category = sorted(cat_counts.values(), key=lambda x: x['count'], reverse=True)
        
        # Calculate Unique Findings
        unique_findings = set()
        for f in enriched_findings:
            # Create a unique signature based on Rule + File + Line
            sig = f"{f.get('rule_id')}::{f['rel_path']}::{f.get('line')}"
            unique_findings.add(sig)
        unique_count = len(unique_findings)
        
        # Load Template
        template_path = r"d:\SmartAudit\templates\hyperion_report_template.html"
        if not os.path.exists(template_path):
             # Fallback check relative to script
             template_path = os.path.join(os.path.dirname(__file__), "templates", "hyperion_report_template.html")
             
        with open(template_path, 'r', encoding='utf-8') as tf:
            template_str = tf.read()
            
        template = jinja2.Template(template_str)
        rendered_html = template.render(
            project_name=os.path.basename(scan_root),
            date=datetime.now().strftime("%Y-%m-%d %H:%M"),
            total_count=len(enriched_findings),
            unique_count=unique_count,
            critical_count=sev_counts['CRITICAL'],
            high_count=sev_counts['HIGH'],
            medium_count=sev_counts['MEDIUM'],
            low_count=sev_counts['LOW'],
            summary_by_category=summary_by_category,
            findings=html_findings
        )
        
        html_filename = f"hyperion_professional_report_{timestamp}.html"
        html_file_path = os.path.join(output_dir, html_filename)
        
        with open(html_file_path, 'w', encoding='utf-8') as hf:
            hf.write(rendered_html)
            
        print(f"📄 HTML Report Generated: {os.path.abspath(html_file_path)}")
        
    except ImportError:
        print("⚠️ Jinja2 not found. Skipping HTML report generation.")
    except Exception as e:
        print(f"⚠️ Error generating HTML report: {e}")
        
    return {
        "csv": csv_file_path,
        "html": html_file_path
    }

async def main():
    parser = argparse.ArgumentParser(description="Hyperion Professional SAST Report Generator")
    parser.add_argument("project_path", nargs='?', help="Absolute path to the codebase to scan")
    parser.add_argument("--output-dir", default=None, help="Directory to save reports (default: project_path)")
    
    args = parser.parse_args()
    
    scan_path = None
    if args.project_path:
        scan_path = os.path.abspath(args.project_path)
    else:
        # Default for backward compatibility/testing
        print("ℹ️ No path provided, using default test path...")
        scan_path = r"d:\SmartAudit\Meter-Data-Processing--main"
        
    await generate_professional_reports(scan_path, args.output_dir)

if __name__ == "__main__":
    asyncio.run(main())
