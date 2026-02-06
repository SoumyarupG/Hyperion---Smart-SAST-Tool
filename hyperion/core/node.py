from enum import Enum
from typing import List, Optional, Any, Dict

class NodeType(Enum):
    PROGRAM = "PROGRAM"
    FUNCTION_DEF = "FUNCTION_DEF"
    CLASS_DEF = "CLASS_DEF"
    VARIABLE_DECL = "VARIABLE_DECL"
    ASSIGNMENT = "ASSIGNMENT"
    CALL = "CALL"
    IF_STMT = "IF_STMT"
    LOOP_STMT = "LOOP_STMT"
    RETURN_STMT = "RETURN_STMT"
    LITERAL = "LITERAL"
    IDENTIFIER = "IDENTIFIER"
    UNKNOWN = "UNKNOWN"

class HIRNode:
    """
    Hyperion Intermediate Representation Node.
    Normalized node structure for all languages.
    """
    def __init__(self, type: NodeType, content: str, file_path: str, line: int, column: int = 0):
        self.id = f"{file_path}:{line}:{column}"
        self.type = type
        self.content = content
        self.file_path = file_path
        self.line = line
        self.column = column
        self.parent: Optional['HIRNode'] = None
        self.children: List['HIRNode'] = []
        self.metadata: Dict[str, Any] = {}
        
        # Graph edges
        self.cfg_next: List['HIRNode'] = [] # Control Flow
        self.dfg_in: List['HIRNode'] = []   # Data Flow In (Sources)
        self.dfg_out: List['HIRNode'] = []  # Data Flow Out (Sinks)
        self.call_edges: List['HIRNode'] = [] # Edges to function definitions

    def add_child(self, node: 'HIRNode'):
        node.parent = self
        self.children.append(node)

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type.value,
            "content": self.content,
            "location": f"{self.file_path}:{self.line}",
            "children": [c.to_dict() for c in self.children]
        }

    def __repr__(self):
        return f"<HIRNode {self.type.value} '{self.content}' at {self.line}>"
