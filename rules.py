from typing import List, Dict

class Rule:
    def __init__(self, id: str, severity: str, message: str, pattern: str, whitelist: List[str] = None):
        self.id = id
        self.severity = severity
        self.message = message
        self.pattern = pattern
        self.whitelist = whitelist or []


# Common patterns for vulnerability detection
# In a real-world scenario, these would be more complex regexes or AST-based checks.

PYTHON_RULES = [
    # Rule("PY001", "HIGH", "Possible hardcoded password", r"password\s*=\s*['\"][^'\"]+['\"]"), # REPLACED BY AST
    Rule("PY002", "MEDIUM", "Use of 'eval' detected", r"eval\("),
    Rule("PY003", "HIGH", "SQL Injection risk (f-string in query)", r"execute\s*\(\s*f['\"].*['\"]\s*\)"),
    Rule("PY004", "LOW", "Print statement found (debug leftover)", r"print\("),
]

JAVASCRIPT_RULES = [
    Rule("JS001", "HIGH", "Possible hardcoded password", r"const\s+password\s*=\s*['\"][^'\"]+['\"]"),
    Rule("JS002", "MEDIUM", "Use of 'eval' detected", r"eval\("),
    Rule("JS003", "HIGH", "InnerHtml usage (XSS Risk)", r"\.innerHTML\s*="),
    Rule("JS004", "LOW", "Console.log found (debug leftover)", r"console\.log\("),
]

RUBY_RULES = [
    Rule("RB001", "HIGH", "Possible hardcoded password", r"password\s*=\s*['\"][^'\"]+['\"]"),
    Rule("RB002", "MEDIUM", "Use of 'eval' detected", r"eval\("),
    Rule("RB003", "HIGH", "System command execution", r"system\("),
]

FRAMEWORK_RULES = {
    "django": [
        Rule("DJ001", "HIGH", "Debug mode enabled in production", r"DEBUG\s*=\s*True"),
        Rule("DJ002", "HIGH", "Insecure CORS Configuration (Allow All)", r"CORS_ORIGIN_ALLOW_ALL\s*=\s*True"),
        Rule("DJ003", "CRITICAL", "Hardcoded Django Secret Key", r"SECRET_KEY\s*=\s*['\"][^'\"]{10,}['\"]"),
        Rule("DJ004", "HIGH", "CSRF Protection Disabled (Commented Middleware)", r"#\s*['\"].*CsrfViewMiddleware['\"]"),
        Rule("DJ005", "MEDIUM", "Hardcoded Redis Credentials", r"redis://.*:.*@"),
    ],
    "flask": [
        Rule("FL001", "HIGH", "Debug mode enabled", r"debug\s*=\s*True"),
    ],
    "react": [
        Rule("RC001", "MEDIUM", "DangerouslySetInnerHTML used", r"dangerouslySetInnerHTML"),
    ]
}

YAML_RULES = [
    Rule("K8S001", "CRITICAL", "Privileged container detected", r"privileged:\s*true"),
    Rule("YML001", "HIGH", "Possible hardcoded secret", r"(password|secret|key|token)\s*:\s*['\"][^'\"]+['\"]"),
    Rule("AWS001", "CRITICAL", "AWS Access Key detected", r"AKIA[0-9A-Z]{16}"),
]

# XML/Config file rules
XML_RULES = [
    Rule("XML001", "CRITICAL", "Hardcoded password in config", r"[Pp]assword\s*=\s*['\"]?[^'\";\s]{4,}['\"]?"),
    Rule("XML002", "HIGH", "Debug mode enabled", r"debug\s*=\s*['\"]?true['\"]?"),
    Rule("XML003", "MEDIUM", "Unencrypted connection string", r"connectionString.*[Pp]assword"),
    Rule("XML004", "LOW", "Version header enabled", r"enableVersionHeader\s*=\s*['\"]?true['\"]?"),
]

# HTML/Razor file rules
HTML_RULES = [
    Rule("HTML001", "MEDIUM", "Unsafe target blank (Tabnabbing)", r"target\s*=\s*['\"]_blank['\"](?!.*rel\s*=\s*['\"].*noopener)"),
    Rule("HTML002", "MEDIUM", "iframe without sandbox", r"<iframe(?![^>]*sandbox)"),
]

# Enhanced JavaScript rules
JAVASCRIPT_RULES.extend([
    Rule("JS005", "LOW", "Hardcoded external domain", r"https?://(?!localhost|127\.0\.0\.1)[a-zA-Z0-9.-]+\.[a-z]{2,}", 
         whitelist=["apache.org", "jquery.com", "jquery.org", "w3.org", "microsoft.com", "google.com", "jssor.com", "bootstrap.com", "asp.net", "induswebsolutions.in"]),
    Rule("JS006", "MEDIUM", "Unchecked loop condition", r"for\s*?\(.*?<\s*?[a-zA-Z_$][a-zA-Z0-9_$]*?\.[a-zA-Z_$]"),
    Rule("JS007", "CRITICAL", "Authentication Backdoor risk (Env-based user fallback)", r"process\.env\.user"),
    Rule("JS008", "HIGH", "Unrestricted File Upload risk", r"fs\.rename\s*?\(.*?req\.files\[\d+?\]\.path"),
    Rule("JS009", "HIGH", "Reflected XSS risk (Unsanitized User Input Assignment)", r"req\.(body|query)\.[a-zA-Z0-9_]+?"),
    Rule("JS010", "CRITICAL", "Path Traversal risk (User input in path)", r"req\.(query|params|body).*?[/\\]|[/\\]\s*?.*?\+.*?req\.(query|params|body)"),
    Rule("JS011", "HIGH", "Hardcoded Secret/Token", r"(secret|key|token|password|auth|credential)\s*?[:=]\s*?['\"].{20,128}?['\"]"),
])


def get_rules_for_stack(language: str, frameworks: List[str]) -> List[Rule]:
    rules = []
    if language.lower() == "python":
        rules.extend(PYTHON_RULES)
    elif language.lower() in ["javascript", "typescript"]:
        rules.extend(JAVASCRIPT_RULES)
    elif language.lower() == "ruby":
        rules.extend(RUBY_RULES)
    elif language.lower() == "yaml":
        rules.extend(YAML_RULES)
    elif language.lower() in ["xml", "config"]:
        rules.extend(XML_RULES)
    elif language.lower() in ["html", "cshtml", "razor"]:
        rules.extend(HTML_RULES)
    
    for fw in frameworks:
        if fw.lower() in FRAMEWORK_RULES:
            rules.extend(FRAMEWORK_RULES[fw.lower()])
            
    return rules

