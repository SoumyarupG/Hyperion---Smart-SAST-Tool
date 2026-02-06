import ast
from typing import Any, Optional
from hyperion.core.node import HIRNode, NodeType
from hyperion.core.interfaces import BaseParser
from hyperion.core.scope import SymbolTable, Symbol, SymbolType, Scope, ScopeType

class PythonParser(BaseParser):
    def __init__(self, symbol_table: Optional[SymbolTable] = None):
        self.symbol_table = symbol_table

    def parse(self, file_path: str) -> HIRNode:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            tree = ast.parse(content)
            root_node = HIRNode(NodeType.PROGRAM, "root", file_path, 1)
            
            # Initialize scope if symbol table is present
            current_scope = None
            if self.symbol_table:
                current_scope = self.symbol_table.get_file_scope(file_path)
            
            self._visit(tree, root_node, file_path, current_scope)
            return root_node
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")
            return HIRNode(NodeType.UNKNOWN, "error", file_path, 0)

    def _visit(self, ast_node: Any, hir_parent: HIRNode, file_path: str, current_scope: Optional[Scope] = None):
        """
        Recursively visits Python AST nodes and converts them to HIR nodes.
        Populates SymbolTable if available.
        """
        
        # Handle Function Definitions
        if isinstance(ast_node, ast.FunctionDef):
            node = HIRNode(NodeType.FUNCTION_DEF, ast_node.name, file_path, ast_node.lineno)
            hir_parent.add_child(node)
            
            # Register symbol
            new_scope = current_scope
            if current_scope:
                symbol = Symbol(
                    name=ast_node.name,
                    type=SymbolType.FUNCTION,
                    definition_node=node,
                    file_path=file_path,
                    line_number=ast_node.lineno,
                    scope=current_scope
                )
                current_scope.define(symbol)
                
                # Create function scope
                new_scope = Scope(ScopeType.FUNCTION, ast_node.name, parent=current_scope, file_path=file_path)
            
            hir_parent = node # Scope entry for HIR
            current_scope = new_scope # Scope entry for SymbolTable
            
        # Handle Class Definitions
        elif isinstance(ast_node, ast.ClassDef):
            node = HIRNode(NodeType.CLASS_DEF, ast_node.name, file_path, ast_node.lineno)
            hir_parent.add_child(node)
            
            # Register symbol
            new_scope = current_scope
            if current_scope:
                symbol = Symbol(
                    name=ast_node.name,
                    type=SymbolType.CLASS,
                    definition_node=node,
                    file_path=file_path,
                    line_number=ast_node.lineno,
                    scope=current_scope
                )
                current_scope.define(symbol)
                
                # Create class scope
                new_scope = Scope(ScopeType.CLASS, ast_node.name, parent=current_scope, file_path=file_path)
                
            hir_parent = node
            current_scope = new_scope

        # Handle Assignments
        elif isinstance(ast_node, ast.Assign):
            content = "assignment"
            try:
                content = ast.unparse(ast_node)
            except:
                pass
            node = HIRNode(NodeType.ASSIGNMENT, content, file_path, ast_node.lineno)
            hir_parent.add_child(node)
            
            # Register variable symbols
            if current_scope:
                for target in ast_node.targets:
                    if isinstance(target, ast.Name):
                        symbol = Symbol(
                            name=target.id,
                            type=SymbolType.VARIABLE,
                            definition_node=node,
                            file_path=file_path,
                            line_number=ast_node.lineno,
                            scope=current_scope
                        )
                        current_scope.define(symbol)
            
        # Handle Calls
        elif isinstance(ast_node, ast.Call):
            content = "call"
            try:
                content = ast.unparse(ast_node)
            except:
                pass
            node = HIRNode(NodeType.CALL, content, file_path, ast_node.lineno)
            hir_parent.add_child(node)
            
        # Handle Imports
        elif isinstance(ast_node, ast.Import):
            for alias in ast_node.names:
                if current_scope:
                    symbol = Symbol(
                        name=alias.asname or alias.name,
                        type=SymbolType.IMPORT,
                        definition_node=None, # TODO: Link to module
                        file_path=file_path,
                        line_number=ast_node.lineno,
                        scope=current_scope
                    )
                    current_scope.define(symbol)
                    
        elif isinstance(ast_node, ast.ImportFrom):
            module = ast_node.module or ''
            for alias in ast_node.names:
                if current_scope:
                    symbol = Symbol(
                        name=alias.asname or alias.name,
                        type=SymbolType.IMPORT,
                        definition_node=None, # TODO: Link to module
                        file_path=file_path,
                        line_number=ast_node.lineno,
                        scope=current_scope
                    )
                    current_scope.define(symbol)

        # Handle Function Arguments
        elif isinstance(ast_node, ast.arg):
            node = HIRNode(NodeType.VARIABLE_DECL, ast_node.arg, file_path, ast_node.lineno)
            hir_parent.add_child(node)
            
            # Register argument as variable in current scope (function scope)
            if current_scope:
                symbol = Symbol(
                    name=ast_node.arg,
                    type=SymbolType.VARIABLE,
                    definition_node=node,
                    file_path=file_path,
                    line_number=ast_node.lineno,
                    scope=current_scope
                )
                current_scope.define(symbol)

        # Recurse for all children
        for field, value in ast.iter_fields(ast_node):
            if isinstance(value, list):
                for item in value:
                    if isinstance(item, ast.AST):
                        self._visit(item, hir_parent, file_path, current_scope)
            elif isinstance(value, ast.AST):
                self._visit(value, hir_parent, file_path, current_scope)
