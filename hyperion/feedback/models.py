"""
Hyperion Feedback Models

Data models for developer feedback on security findings.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
import hashlib
import json


@dataclass
class Feedback:
    """Represents developer feedback on a finding"""
    finding_hash: str
    verdict: str  # VALID_VULNERABILITY, FALSE_POSITIVE, ACCEPT_RISK
    project_path: str
    rule_id: str
    file_path: str
    line_number: int
    timestamp: datetime
    user: Optional[str] = None
    reasoning: Optional[str] = None
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'finding_hash': self.finding_hash,
            'verdict': self.verdict,
            'project_path': self.project_path,
            'rule_id': self.rule_id,
            'file_path': self.file_path,
            'line_number': self.line_number,
            'timestamp': self.timestamp.isoformat(),
            'user': self.user,
            'reasoning': self.reasoning
        }
    
    @staticmethod
    def from_dict(data: dict) -> 'Feedback':
        """Create from dictionary"""
        return Feedback(
            finding_hash=data['finding_hash'],
            verdict=data['verdict'],
            project_path=data['project_path'],
            rule_id=data['rule_id'],
            file_path=data['file_path'],
            line_number=data['line_number'],
            timestamp=datetime.fromisoformat(data['timestamp']),
            user=data.get('user'),
            reasoning=data.get('reasoning')
        )


def generate_finding_hash(finding: dict) -> str:
    """
    Generate a stable hash for a finding
    
    Uses: rule_id + file_path + line + code snippet
    This allows us to track the same finding across scans
    """
    components = [
        finding.get('rule_id', ''),
        finding.get('file', ''),
        str(finding.get('line', 0)),
        finding.get('code', '')[:100]  # First 100 chars of code
    ]
    
    hash_input = '|'.join(components)
    return hashlib.sha256(hash_input.encode()).hexdigest()[:16]
