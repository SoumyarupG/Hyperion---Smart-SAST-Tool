import yaml
import os
from typing import Dict, Any, Optional
from hyperion.ai.llm_client import create_llm_client, LLMClient

class Verdict:
    def __init__(self, is_safe: bool, confidence: float, reasoning: str, exploitability: str = "MEDIUM", recommended_action: str = ""):
        self.is_safe = is_safe
        self.confidence = confidence
        self.reasoning = reasoning
        self.exploitability = exploitability
        self.recommended_action = recommended_action

    def to_dict(self):
        return {
            "is_safe": self.is_safe,
            "confidence": self.confidence,
            "reasoning": self.reasoning,
            "exploitability": self.exploitability,
            "recommended_action": self.recommended_action
        }

class AIVerifier:
    """
    Hybrid AI verifier that combines fast heuristics with LLM-based deep verification.
    """
    def __init__(self, config_path: str = "hyperion.yaml"):
        self.config = self._load_config(config_path)
        self.llm_client = None
        
        if self.config.get('ai_engine', {}).get('enabled', True):
            try:
                self.llm_client = create_llm_client(self.config.get('ai_engine', {}))
            except Exception as e:
                print(f"Warning: Could not initialize LLM client: {e}. Falling back to heuristics.")

    def _load_config(self, path: str) -> Dict[str, Any]:
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    return yaml.safe_load(f)
            except Exception as e:
                print(f"Error loading {path}: {e}")
        return {}

    def verify(self, finding: Dict[str, Any], code_context: str) -> Verdict:
        """
        Verify a finding using hybrid logic:
        1. Fast-path: Check heuristics (low latency, 0 cost)
        2. Deep-verify: If heuristics are unsure, call LLM (high latency, low cost)
        """
        code_lower = code_context.lower()
        
        # --- PHASE 1: Fast-Path Heuristics ---
        
        # A. License / Documentation Links
        if any(keyword in code_lower for keyword in ["license", "copyright", "documentation", "author", "http://www.apache.org"]):
            return Verdict(True, 0.98, "Heuristics: Identified as license or documentation header.")
        
        # B. Commented-out Code
        if "@*" in code_context or "<!--" in code_context or code_context.strip().startswith("//") or code_context.strip().startswith("#"):
             return Verdict(True, 0.95, "Heuristics: Code is commented out.")

        # C. Local Dev/Loopback
        if any(keyword in code_lower for keyword in ["localhost", "127.0.0.1", "::1"]):
             return Verdict(True, 0.99, "Heuristics: Local development address detected.")

        # D. Auth/Sanitization Logic (common pseudo-findings)
        if any(keyword in code_lower for keyword in ["if (", "if(", "===", "!==", "==", "!="]) and ("req." in code_lower):
             return Verdict(True, 0.92, "Heuristics: Conditional check involving user input (auth/validation).")

        # --- PHASE 2: Deep-Verify via LLM ---
        
        if self.llm_client:
            rule_id = finding.get('rule_id', 'UNKNOWN')
            
            # Get rule-specific prompt from config if available
            rule_config = next((r for r in self.config.get('rules', []) if r['id'] == rule_id), None)
            user_prompt = rule_config.get('ai_assist', {}).get('prompt', "Verify this security finding.") if rule_config else "Verify this finding."
            system_prompt = self.config.get('ai_engine', {}).get('system_prompt', "You are a senior security researcher.")
            
            try:
                llm_response = self.llm_client.verify_finding(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    finding=finding,
                    context={"file": finding.get('file', 'Unknown')}
                )
                
                return Verdict(
                    is_safe=(llm_response.verdict == "FALSE_POSITIVE"),
                    confidence=0.95, # LLMs are generally confident
                    reasoning=f"LLM: {llm_response.reasoning}",
                    exploitability=llm_response.exploitability,
                    recommended_action=llm_response.recommended_action
                )
            except Exception as e:
                print(f"LLM Verification failed: {e}")
        
        # --- PHASE 3: Conservative Fallback ---
        return Verdict(False, 0.85, "Conservative: Heuristics couldn't confirm safety and LLM was unavailable.")

