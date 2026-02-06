"""
Hyperion Feedback Store

SQLite-based storage for developer feedback on security findings.
"""
import sqlite3
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from hyperion.feedback.models import Feedback, generate_finding_hash


class FeedbackStore:
    """Stores and retrieves developer feedback"""
    
    def __init__(self, db_path: str = ".hyperion/feedback.db"):
        self.db_path = db_path
        self._ensure_db_exists()
    
    def _ensure_db_exists(self):
        """Create database and tables if they don't exist"""
        # Create directory if needed
        os.makedirs(os.path.dirname(self.db_path) if os.path.dirname(self.db_path) else '.', exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                finding_hash TEXT NOT NULL,
                verdict TEXT NOT NULL,
                project_path TEXT NOT NULL,
                rule_id TEXT NOT NULL,
                file_path TEXT NOT NULL,
                line_number INTEGER NOT NULL,
                timestamp TEXT NOT NULL,
                user TEXT,
                reasoning TEXT,
                UNIQUE(finding_hash, project_path)
            )
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_finding_hash 
            ON feedback(finding_hash)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_project_rule 
            ON feedback(project_path, rule_id)
        ''')
        
        conn.commit()
        conn.close()
    
    def add_feedback(self, feedback: Feedback) -> bool:
        """
        Add or update feedback for a finding
        
        Returns: True if successful
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO feedback 
                (finding_hash, verdict, project_path, rule_id, file_path, line_number, timestamp, user, reasoning)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                feedback.finding_hash,
                feedback.verdict,
                feedback.project_path,
                feedback.rule_id,
                feedback.file_path,
                feedback.line_number,
                feedback.timestamp.isoformat(),
                feedback.user,
                feedback.reasoning
            ))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error storing feedback: {e}")
            return False
    
    def get_feedback(self, finding_hash: str, project_path: str) -> Optional[Feedback]:
        """Get feedback for a specific finding"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT finding_hash, verdict, project_path, rule_id, file_path, line_number, timestamp, user, reasoning
            FROM feedback
            WHERE finding_hash = ? AND project_path = ?
        ''', (finding_hash, project_path))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return Feedback(
                finding_hash=row[0],
                verdict=row[1],
                project_path=row[2],
                rule_id=row[3],
                file_path=row[4],
                line_number=row[5],
                timestamp=datetime.fromisoformat(row[6]),
                user=row[7],
                reasoning=row[8]
            )
        return None
    
    def get_all_feedback_for_project(self, project_path: str) -> Dict[str, Feedback]:
        """Get all feedback for a project as a dictionary indexed by finding_hash"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT finding_hash, verdict, project_path, rule_id, file_path, line_number, timestamp, user, reasoning
            FROM feedback
            WHERE project_path = ?
        ''', (project_path,))
        
        rows = cursor.fetchall()
        conn.close()
        
        feedback_dict = {}
        for row in rows:
            f = Feedback(
                finding_hash=row[0],
                verdict=row[1],
                project_path=row[2],
                rule_id=row[3],
                file_path=row[4],
                line_number=row[5],
                timestamp=datetime.fromisoformat(row[6]),
                user=row[7],
                reasoning=row[8]
            )
            feedback_dict[row[0]] = f
        return feedback_dict
    
    def get_feedback_for_rule(self, rule_id: str, project_path: str) -> List[Feedback]:
        """Get all feedback for a specific rule in a project"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT finding_hash, verdict, project_path, rule_id, file_path, line_number, timestamp, user, reasoning
            FROM feedback
            WHERE rule_id = ? AND project_path = ?
            ORDER BY timestamp DESC
        ''', (rule_id, project_path))
        
        rows = cursor.fetchall()
        conn.close()
        
        feedbacks = []
        for row in rows:
            feedbacks.append(Feedback(
                finding_hash=row[0],
                verdict=row[1],
                project_path=row[2],
                rule_id=row[3],
                file_path=row[4],
                line_number=row[5],
                timestamp=datetime.fromisoformat(row[6]),
                user=row[7],
                reasoning=row[8]
            ))
        
        return feedbacks
    
    def get_false_positive_patterns(self, project_path: str) -> Dict[str, int]:
        """
        Get patterns of false positives for a project
        
        Returns: Dict of rule_id -> count of false positives
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT rule_id, COUNT(*) as count
            FROM feedback
            WHERE project_path = ? AND verdict = 'FALSE_POSITIVE'
            GROUP BY rule_id
            ORDER BY count DESC
        ''', (project_path,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return {row[0]: row[1] for row in rows}
    
    def get_stats(self, project_path: str) -> Dict[str, Any]:
        """Get feedback statistics for a project"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN verdict = 'VALID_VULNERABILITY' THEN 1 ELSE 0 END) as valid,
                SUM(CASE WHEN verdict = 'FALSE_POSITIVE' THEN 1 ELSE 0 END) as false_positive,
                SUM(CASE WHEN verdict = 'ACCEPT_RISK' THEN 1 ELSE 0 END) as accepted
            FROM feedback
            WHERE project_path = ?
        ''', (project_path,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            total = row[0] or 0
            return {
                'total': total,
                'valid': row[1] or 0,
                'false_positive': row[2] or 0,
                'accepted': row[3] or 0,
                'false_positive_rate': (row[2] / total * 100) if total > 0 else 0
            }
        
        return {'total': 0, 'valid': 0, 'false_positive': 0, 'accepted': 0, 'false_positive_rate': 0}


# Global feedback store instance
_feedback_store = None

def get_feedback_store(db_path: str = ".hyperion/feedback.db") -> FeedbackStore:
    """Get the global feedback store instance"""
    global _feedback_store
    if _feedback_store is None:
        _feedback_store = FeedbackStore(db_path)
    return _feedback_store
