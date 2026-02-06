"""
Hyperion LLM Client

Provides a unified interface for calling different LLM providers
to verify security findings and reduce false positives.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import os
import time
import json


class LLMResponse:
    """Represents a response from an LLM"""
    def __init__(self, verdict: str, reasoning: str, exploitability: str, 
                 recommended_action: str, raw_response: str = ""):
        self.verdict = verdict  # REAL_VULNERABILITY or FALSE_POSITIVE
        self.reasoning = reasoning
        self.exploitability = exploitability  # EASY, MEDIUM, HARD, THEORETICAL
        self.recommended_action = recommended_action
        self.raw_response = raw_response


class LLMClient(ABC):
    """Abstract base class for LLM clients"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.api_key = config.get('api_key') or os.getenv(self._get_env_var_name())
        self.model = config.get('model', self._get_default_model())
        self.temperature = config.get('temperature', 0.0)
        self.max_tokens = config.get('max_tokens', 768)
        self.retry_count = config.get('retry_on_failure', 2)
        
        if not self.api_key:
            raise ValueError(f"API key not found. Set {self._get_env_var_name()} environment variable or configure in hyperion.yaml")
    
    @abstractmethod
    def _get_env_var_name(self) -> str:
        """Get the environment variable name for the API key"""
        pass
    
    @abstractmethod
    def _get_default_model(self) -> str:
        """Get the default model name"""
        pass
    
    @abstractmethod
    def _call_api(self, system_prompt: str, user_prompt: str) -> str:
        """Call the LLM API and return the response"""
        pass
    
    def verify_finding(self, system_prompt: str, user_prompt: str, 
                      finding: Dict[str, Any], context: Dict[str, Any]) -> LLMResponse:
        """
        Verify a security finding using the LLM
        
        Args:
            system_prompt: The system-level prompt (from config)
            user_prompt: The rule-specific prompt (from config)
            finding: The security finding to verify
            context: Additional context (code snippet, file path, etc.)
        
        Returns:
            LLMResponse with verdict and reasoning
        """
        # Build the complete prompt
        full_user_prompt = self._build_prompt(user_prompt, finding, context)
        
        # Call the API with retries
        for attempt in range(self.retry_count + 1):
            try:
                raw_response = self._call_api(system_prompt, full_user_prompt)
                return self._parse_response(raw_response)
            except Exception as e:
                if attempt < self.retry_count:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
                else:
                    # Final attempt failed, return conservative verdict
                    return LLMResponse(
                        verdict="REAL_VULNERABILITY",
                        reasoning=f"AI verification failed: {str(e)}. Treating as real for safety.",
                        exploitability="MEDIUM",
                        recommended_action="Manual review required - AI verification unavailable",
                        raw_response=""
                    )
    
    def _build_prompt(self, user_prompt: str, finding: Dict[str, Any], 
                     context: Dict[str, Any]) -> str:
        """Build the complete user prompt with finding details"""
        prompt = f"""
{user_prompt}

**Finding Details:**
- Rule ID: {finding.get('rule_id', 'UNKNOWN')}
- Severity: {finding.get('severity', 'UNKNOWN')}
- Message: {finding.get('message', 'No message')}
- File: {context.get('file', 'Unknown')}
- Line: {finding.get('line', 'Unknown')}

**Code Snippet:**
```
{finding.get('code', 'No code available')}
```

**Taint Trace (if available):**
{', '.join(finding.get('trace', [])) if finding.get('trace') else 'No trace available'}

Please provide your analysis in the following JSON format:
{{
  "verdict": "REAL_VULNERABILITY" or "FALSE_POSITIVE",
  "reasoning": "Short, clear explanation",
  "exploitability": "EASY" or "MEDIUM" or "HARD" or "THEORETICAL",
  "recommended_action": "What the developer should do"
}}
"""
        return prompt
    
    def _parse_response(self, raw_response: str) -> LLMResponse:
        """Parse the LLM response into an LLMResponse object"""
        try:
            # Try to extract JSON from the response
            # LLMs sometimes wrap JSON in markdown code blocks
            if "```json" in raw_response:
                json_start = raw_response.find("```json") + 7
                json_end = raw_response.find("```", json_start)
                json_str = raw_response[json_start:json_end].strip()
            elif "```" in raw_response:
                json_start = raw_response.find("```") + 3
                json_end = raw_response.find("```", json_start)
                json_str = raw_response[json_start:json_end].strip()
            else:
                json_str = raw_response.strip()
            
            data = json.loads(json_str)
            
            return LLMResponse(
                verdict=data.get('verdict', 'REAL_VULNERABILITY'),
                reasoning=data.get('reasoning', 'No reasoning provided'),
                exploitability=data.get('exploitability', 'MEDIUM'),
                recommended_action=data.get('recommended_action', 'Review and fix'),
                raw_response=raw_response
            )
        except Exception as e:
            # If parsing fails, try to extract information from text
            verdict = "REAL_VULNERABILITY"
            if "FALSE_POSITIVE" in raw_response.upper() or "FALSE POSITIVE" in raw_response.upper():
                verdict = "FALSE_POSITIVE"
            
            return LLMResponse(
                verdict=verdict,
                reasoning=raw_response[:200],  # First 200 chars
                exploitability="MEDIUM",
                recommended_action="Manual review recommended",
                raw_response=raw_response
            )


class OpenAIClient(LLMClient):
    """OpenAI GPT client"""
    
    def _get_env_var_name(self) -> str:
        return "OPENAI_API_KEY"
    
    def _get_default_model(self) -> str:
        return "gpt-4o-mini"  # Cost-effective model
    
    def _call_api(self, system_prompt: str, user_prompt: str) -> str:
        """Call OpenAI API"""
        try:
            import openai
        except ImportError:
            raise ImportError("openai package not installed. Run: pip install openai")
        
        client = openai.OpenAI(api_key=self.api_key)
        
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens
        )
        
        return response.choices[0].message.content


class AnthropicClient(LLMClient):
    """Anthropic Claude client"""
    
    def _get_env_var_name(self) -> str:
        return "ANTHROPIC_API_KEY"
    
    def _get_default_model(self) -> str:
        return "claude-3-5-sonnet-20241022"
    
    def _call_api(self, system_prompt: str, user_prompt: str) -> str:
        """Call Anthropic API"""
        try:
            import anthropic
        except ImportError:
            raise ImportError("anthropic package not installed. Run: pip install anthropic")
        
        client = anthropic.Anthropic(api_key=self.api_key)
        
        response = client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )
        
        return response.content[0].text


class GoogleClient(LLMClient):
    """Google Gemini client"""
    
    def _get_env_var_name(self) -> str:
        return "GOOGLE_API_KEY"
    
    def _get_default_model(self) -> str:
        return "gemini-1.5-flash"
    
    def _call_api(self, system_prompt: str, user_prompt: str) -> str:
        """Call Google Gemini API"""
        try:
            import google.generativeai as genai
        except ImportError:
            raise ImportError("google-generativeai package not installed. Run: pip install google-generativeai")
        
        genai.configure(api_key=self.api_key)
        model = genai.GenerativeModel(
            model_name=self.model,
            system_instruction=system_prompt
        )
        
        response = model.generate_content(
            user_prompt,
            generation_config=genai.GenerationConfig(
                temperature=self.temperature,
                max_output_tokens=self.max_tokens
            )
        )
        
        return response.text


def create_llm_client(config: Dict[str, Any]) -> LLMClient:
    """Factory function to create the appropriate LLM client"""
    provider = config.get('provider', 'openai').lower()
    
    if provider == 'openai':
        return OpenAIClient(config)
    elif provider == 'anthropic':
        return AnthropicClient(config)
    elif provider == 'google':
        return GoogleClient(config)
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}. Supported: openai, anthropic, google")
