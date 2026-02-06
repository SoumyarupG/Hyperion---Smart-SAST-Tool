from abc import ABC, abstractmethod
from typing import List, Dict, Any
from hyperion.core.node import HIRNode

class BaseParser(ABC):
    """
    Abstract base class for language-specific parsers.
    Converts source code -> HIR.
    """
    @abstractmethod
    def parse(self, file_path: str) -> HIRNode:
        pass

class TaintEngine(ABC):
    """
    Core engine for tracking data flow from Sources to Sinks.
    """
    @abstractmethod
    def propagate(self, entry_node: HIRNode) -> List[Dict[str, Any]]:
        pass

class Vulnerability:
    def __init__(self, rule_id: str, severity: str, message: str, source: HIRNode, sink: HIRNode):
        self.rule_id = rule_id
        self.severity = severity
        self.message = message
        self.source = source
        self.sink = sink
        self.path: List[HIRNode] = [] # The path from source to sink

    def to_dict(self):
        return {
            "rule_id": self.rule_id,
            "severity": self.severity,
            "message": self.message,
            "file": self.source.file_path,
            "line": self.sink.line, # Report at the sink location
            "code": self.sink.content,
            "trace": [n.id for n in self.path]
        }
