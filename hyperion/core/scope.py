from enum import Enum
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from .node import HIRNode

class SymbolType(Enum):
    FUNCTION = "FUNCTION"
    CLASS = "CLASS"
    VARIABLE = "VARIABLE"
    IMPORT = "IMPORT"

class ScopeType(Enum):
    GLOBAL = "GLOBAL"
    FUNCTION = "FUNCTION"
    CLASS = "CLASS"

@dataclass
class Symbol:
    name: str
    type: SymbolType
    definition_node: Optional[HIRNode]
    file_path: str
    line_number: int
    scope: 'Scope'

class Scope:
    def __init__(self, type: ScopeType, name: str, parent: Optional['Scope'] = None, file_path: str = ""):
        self.type = type
        self.name = name
        self.parent = parent
        self.file_path = file_path
        self.symbols: Dict[str, Symbol] = {}
        self.children: List['Scope'] = []
        
        if parent:
            parent.children.append(self)

    def define(self, symbol: Symbol):
        self.symbols[symbol.name] = symbol

    def resolve(self, name: str) -> Optional[Symbol]:
        if name in self.symbols:
            return self.symbols[name]
        if self.parent:
            return self.parent.resolve(name)
        return None

class SymbolTable:
    def __init__(self):
        self.file_scopes: Dict[str, Scope] = {}

    def get_file_scope(self, file_path: str) -> Scope:
        # ALWAYS create a fresh scope - don't cache!
        # This ensures each scan gets clean symbol data
        self.file_scopes[file_path] = Scope(ScopeType.GLOBAL, "global", file_path=file_path)
        return self.file_scopes[file_path]

    def resolve_global_function(self, name: str) -> Optional[HIRNode]:
        """
        Searches all file scopes for a function with the given name.
        Simplified resolution for prototype.
        """
        for scope in self.file_scopes.values():
            sym = scope.resolve(name)
            if sym and sym.type == SymbolType.FUNCTION:
                return sym.definition_node
        return None

# Alias for backward compatibility if needed
ScopeManager = SymbolTable
