"""
Hyperion Configuration Loader

Loads and parses hyperion.yaml configuration file.
"""
import os
import yaml
from typing import Optional
from hyperion.config.models import (
    HyperionConfig, Source, Sink, Sanitizer, Rule, 
    FrameworkSafe, AIEngine, SuppressionRule
)


class ConfigLoader:
    """Loads Hyperion configuration from YAML file"""
    
    def __init__(self, config_path: str = "hyperion.yaml"):
        self.config_path = config_path
        self.config: Optional[HyperionConfig] = None
    
    def load(self) -> HyperionConfig:
        """Load configuration from YAML file"""
        if not os.path.exists(self.config_path):
            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")
        
        with open(self.config_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        self.config = self._parse_config(data)
        return self.config
    
    def _parse_config(self, data: dict) -> HyperionConfig:
        """Parse YAML data into HyperionConfig object"""
        
        # Parse AI Engine
        ai_engine_data = data.get('ai_engine', {})
        ai_engine = AIEngine(
            name=ai_engine_data.get('name', 'antigravity'),
            mode=ai_engine_data.get('mode', 'verification'),
            provider=ai_engine_data.get('provider', 'openai'),
            model=ai_engine_data.get('model'),
            api_key=ai_engine_data.get('api_key'),
            temperature=ai_engine_data.get('temperature', 0.0),
            max_tokens=ai_engine_data.get('max_tokens', 768),
            retry_on_failure=ai_engine_data.get('retry_on_failure', 2),
            store_explanations=ai_engine_data.get('store_explanations', True),
            redact_sensitive_data=ai_engine_data.get('redact_sensitive_data', True),
            max_verifications_per_scan=ai_engine_data.get('max_verifications_per_scan', 100),
            enable_caching=ai_engine_data.get('enable_caching', True),
            system_prompt=ai_engine_data.get('system_prompt', '')
        )
        
        # Parse Sources
        sources = []
        for src_data in data.get('sources', []):
            sources.append(Source(
                id=src_data['id'],
                description=src_data.get('description', ''),
                attacker_controlled=src_data.get('attacker_controlled', False),
                languages=src_data.get('languages', []),
                patterns=src_data.get('patterns', {}),
                trusted_by_default=src_data.get('trusted_by_default', False)
            ))
        
        # Parse Sinks
        sinks = []
        for sink_data in data.get('sinks', []):
            sinks.append(Sink(
                id=sink_data['id'],
                severity=sink_data.get('severity', 'MEDIUM'),
                description=sink_data.get('description', ''),
                patterns=sink_data.get('patterns', {})
            ))
        
        # Parse Sanitizers
        sanitizers = []
        for san_data in data.get('sanitizers', []):
            sanitizers.append(Sanitizer(
                id=san_data['id'],
                description=san_data.get('description', ''),
                patterns=san_data.get('patterns', {})
            ))
        
        # Parse Rules
        rules = []
        for rule_data in data.get('rules', []):
            rules.append(Rule(
                id=rule_data['id'],
                name=rule_data.get('name', ''),
                category=rule_data.get('category', ''),
                severity=rule_data.get('severity', 'MEDIUM'),
                languages=rule_data.get('languages', []),
                source_ids=rule_data.get('source_ids', []),
                sink_ids=rule_data.get('sink_ids', []),
                pattern_based=rule_data.get('pattern_based', False),
                patterns=rule_data.get('patterns', []),
                ai_assist=rule_data.get('ai_assist'),
                suppression=rule_data.get('suppression')
            ))
        
        # Parse Framework Safe
        framework_safe_data = data.get('framework_safe', {})
        framework_safe = FrameworkSafe(
            cli_dispatchers=framework_safe_data.get('cli_dispatchers', []),
            test_file_patterns=framework_safe_data.get('test_file_patterns', []),
            generated_code_patterns=framework_safe_data.get('generated_code_patterns', [])
        )
        
        return HyperionConfig(
            version=data.get('version', 1),
            engine=data.get('engine', 'hyperion'),
            description=data.get('description', ''),
            meta=data.get('meta', {}),
            ai_engine=ai_engine,
            settings=data.get('settings', {}),
            sources=sources,
            sinks=sinks,
            sanitizers=sanitizers,
            rules=rules,
            framework_safe=framework_safe,
            suppression=data.get('suppression', {}),
            risk_scoring=data.get('risk_scoring', {}),
            learning_and_feedback=data.get('learning_and_feedback', {}),
            ci_cd=data.get('ci_cd', {}),
            correlation=data.get('correlation', {})
        )

    def load_project_suppressions(self, project_path: str):
        """Load project-specific suppressions and merge into config"""
        if not self.config:
            return

        suppression_path = os.path.join(project_path, '.hyperion', 'suppressions.yaml')
        if not os.path.exists(suppression_path):
            return
            
        try:
            with open(suppression_path, 'r') as f:
                data = yaml.safe_load(f)
                
            if not data or 'suppressions' not in data:
                return
                
            # Merge suppressions into config
            # We store them in the suppression dict under a 'generated' key
            if 'generated' not in self.config.suppression:
                self.config.suppression['generated'] = []
                
            self.config.suppression['generated'].extend(data['suppressions'])
            print(f"Loaded {len(data['suppressions'])} project-specific suppression rules")
            
        except Exception as e:
            print(f"Error loading project suppressions: {e}")
    
    def get_sources_by_language(self, language: str) -> list:
        """Get all sources applicable to a specific language"""
        if not self.config:
            return []
        return [s for s in self.config.sources if language in s.languages]
    
    def get_sinks_by_language(self, language: str) -> list:
        """Get all sinks applicable to a specific language"""
        if not self.config:
            return []
        return [s for s in self.config.sinks if language in s.patterns]
    
    def get_rules_by_language(self, language: str) -> list:
        """Get all rules applicable to a specific language"""
        if not self.config:
            return []
        return [r for r in self.config.rules if language in r.languages]
    
    def is_file_suppressed(self, file_path: str) -> bool:
        """Check if a file should be suppressed based on patterns"""
        if not self.config:
            return False
        
        # Check test file patterns
        for pattern in self.config.framework_safe.test_file_patterns:
            if self._matches_pattern(file_path, pattern):
                return True
        
        # Check generated code patterns
        for pattern in self.config.framework_safe.generated_code_patterns:
            if self._matches_pattern(file_path, pattern):
                return True
        
        return False
    
    def _matches_pattern(self, path: str, pattern: str) -> bool:
        """Simple pattern matching (can be enhanced with regex)"""
        import re
        try:
            return bool(re.search(pattern, path))
        except:
            return False


# Global configuration instance
_config_loader = None

def get_config() -> HyperionConfig:
    """Get the global Hyperion configuration"""
    global _config_loader
    if _config_loader is None:
        _config_loader = ConfigLoader()
        _config_loader.load()
    return _config_loader.config

def reload_config(config_path: str = "hyperion.yaml"):
    """Reload configuration from file"""
    global _config_loader
    _config_loader = ConfigLoader(config_path)
    _config_loader.load()
    return _config_loader.config
