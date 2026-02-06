"""
Hyperion Dynamic Suppression Generator

Analyzes developer feedback to generate project-specific suppression rules.
"""
import os
import yaml
from typing import List, Dict, Any
from hyperion.feedback.store import get_feedback_store, FeedbackStore

class SuppressionGenerator:
    """Generates suppression rules from feedback"""
    
    def __init__(self, feedback_store: FeedbackStore = None):
        self.feedback_store = feedback_store or get_feedback_store()
        
    def generate_suppressions(self, project_path: str) -> List[Dict[str, Any]]:
        """
        Generate suppression rules for a project based on FALSE_POSITIVE feedback.
        
        Strategy:
        1. If a specific finding (hash) is marked FP, suppress that specific instance.
        2. If a rule has > 3 FPs in a file, suppress the rule for that file.
        3. If a rule has > 5 FPs across the project, suggest reviewing the rule (but don't auto-suppress globally to be safe).
        """
        suppressions = []
        
        # Get all FP feedback for this project
        fps = self.feedback_store.get_false_positive_patterns(project_path)
        
        # We need more detailed feedback data than just the counts
        # So we'll query the store directly for the raw feedback entries
        conn = self.feedback_store._ensure_db_exists() # Ensure DB exists
        # Re-open connection for query
        import sqlite3
        conn = sqlite3.connect(self.feedback_store.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT finding_hash, rule_id, file_path, line_number, reasoning
            FROM feedback
            WHERE project_path = ? AND verdict = 'FALSE_POSITIVE'
        ''', (project_path,))
        
        rows = cursor.fetchall()
        conn.close()
        
        # Group by file and rule
        file_rule_counts = {}
        
        for row in rows:
            finding_hash, rule_id, file_path, line_number, reasoning = row
            
            # 1. Per-finding suppression (most granular)
            suppressions.append({
                'id': f"suppress-fp-{finding_hash[:8]}",
                'description': f"Auto-suppressed based on developer feedback: {reasoning or 'Marked as FP'}",
                'when': {
                    'rule_id': rule_id,
                    'file': os.path.basename(file_path),
                    'line': line_number
                },
                'action': 'suppress'
            })
            
            # Track for broader suppression
            key = (file_path, rule_id)
            file_rule_counts[key] = file_rule_counts.get(key, 0) + 1
            
        # 2. File-level rule suppression
        for (file_path, rule_id), count in file_rule_counts.items():
            if count >= 3:
                suppressions.append({
                    'id': f"suppress-rule-{rule_id}-in-{os.path.basename(file_path)}",
                    'description': f"Auto-suppressed rule {rule_id} in {os.path.basename(file_path)} due to {count} FPs",
                    'when': {
                        'rule_id': rule_id,
                        'file': os.path.basename(file_path)
                    },
                    'action': 'suppress'
                })
                
        return suppressions

    def save_suppressions(self, project_path: str, suppressions: List[Dict[str, Any]]):
        """Save generated suppressions to .hyperion/suppressions.yaml"""
        if not suppressions:
            return
            
        hyperion_dir = os.path.join(project_path, '.hyperion')
        os.makedirs(hyperion_dir, exist_ok=True)
        
        suppression_file = os.path.join(hyperion_dir, 'suppressions.yaml')
        
        data = {
            'version': 1,
            'generated_at': str(import_datetime().now()),
            'suppressions': suppressions
        }
        
        with open(suppression_file, 'w') as f:
            yaml.dump(data, f, default_flow_style=False)
            
def import_datetime():
    from datetime import datetime
    return datetime
