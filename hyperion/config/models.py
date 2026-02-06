"""
Hyperion Configuration Models

Data classes representing the structure of hyperion.yaml configuration.
"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class Source:
    """Represents a taint source (e.g., HTTP request, user input)"""
    id: str
    description: str
    attacker_controlled: bool
    languages: List[str]
    patterns: Dict[str, List[str]]
    trusted_by_default: bool = False


@dataclass
class Sink:
    """Represents a dangerous sink (e.g., OS command, SQL execution)"""
    id: str
    severity: str
    description: str
    patterns: Dict[str, List[str]]


@dataclass
class Sanitizer:
    """Represents a sanitization function"""
    id: str
    description: str
    patterns: Dict[str, List[str]]


@dataclass
class Rule:
    """Represents a security rule"""
    id: str
    name: str
    category: str
    severity: str
    languages: List[str]
    source_ids: List[str] = field(default_factory=list)
    sink_ids: List[str] = field(default_factory=list)
    pattern_based: bool = False
    patterns: List[str] = field(default_factory=list)
    ai_assist: Optional[Dict[str, Any]] = None
    suppression: Optional[Dict[str, Any]] = None


@dataclass
class SuppressionRule:
    """Represents a suppression rule for false positives"""
    id: str
    description: str
    when: Dict[str, Any]
    action: Dict[str, Any]


@dataclass
class FrameworkSafe:
    """Framework-specific safe patterns"""
    cli_dispatchers: List[Dict[str, Any]] = field(default_factory=list)
    test_file_patterns: List[str] = field(default_factory=list)
    generated_code_patterns: List[str] = field(default_factory=list)


@dataclass
class AIEngine:
    """AI engine configuration"""
    name: str
    mode: str
    provider: str = 'openai'
    model: Optional[str] = None
    api_key: Optional[str] = None
    temperature: float = 0.0
    max_tokens: int = 768
    retry_on_failure: int = 2
    store_explanations: bool = True
    redact_sensitive_data: bool = True
    max_verifications_per_scan: int = 100
    enable_caching: bool = True
    system_prompt: str = ''


@dataclass
class HyperionConfig:
    """Main Hyperion configuration"""
    version: int
    engine: str
    description: str
    meta: Dict[str, Any]
    ai_engine: AIEngine
    settings: Dict[str, Any]
    sources: List[Source]
    sinks: List[Sink]
    sanitizers: List[Sanitizer]
    rules: List[Rule]
    framework_safe: FrameworkSafe
    suppression: Dict[str, Any]
    risk_scoring: Dict[str, Any] = field(default_factory=dict)
    learning_and_feedback: Dict[str, Any] = field(default_factory=dict)
    ci_cd: Dict[str, Any] = field(default_factory=dict)
    correlation: Dict[str, Any] = field(default_factory=dict)
