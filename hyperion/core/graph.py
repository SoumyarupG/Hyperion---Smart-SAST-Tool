from typing import List, Dict, Set, Optional
from hyperion.core.node import HIRNode, NodeType
from hyperion.core.scope import SymbolTable

class GraphBuilder:
    """
    Constructs Control Flow Graph (CFG), Data Flow Graph (DFG), and Call Graph from HIR.
    """
    def build_cfg(self, root: HIRNode):
        """
        Builds CFG by linking nodes sequentially and handling branches.
        Simplified implementation: Just links children sequentially for now.
        """
        previous_node = None
        
        def visit(node: HIRNode):
            nonlocal previous_node
            
            # Link CFG
            if previous_node:
                previous_node.cfg_next.append(node)
            previous_node = node
            
            for child in node.children:
                visit(child)
                
        visit(root)

    def build_dfg(self, root: HIRNode):
        """
        Builds DFG by resolving variable assignments and usages.
        """
        # Symbol table: variable_name -> definition_node
        local_symbols: Dict[str, HIRNode] = {}
        
        def visit(node: HIRNode):
            if node.type == NodeType.ASSIGNMENT:
                # Naive parsing of "x = y"
                if "=" in node.content:
                    parts = node.content.split("=")
                    target = parts[0].strip()
                    value = parts[1].strip()
                    
                    # If value uses a known variable, add DFG edge
                    if value in local_symbols:
                        source_node = local_symbols[value]
                        source_node.dfg_out.append(node)
                        node.dfg_in.append(source_node)
                    
                    # Register target in symbol table
                    local_symbols[target] = node

            elif node.type == NodeType.VARIABLE_DECL:
                # Register function parameter or variable declaration
                local_symbols[node.content] = node
                    
            elif node.type == NodeType.CALL:
                # Check if call arguments use known variables
                for var_name, source_node in local_symbols.items():
                    if var_name in node.content:
                        source_node.dfg_out.append(node)
                        node.dfg_in.append(source_node)
            
            for child in node.children:
                visit(child)
                
        visit(root)

    def build_call_graph(self, root: HIRNode, symbol_table: SymbolTable):
        """
        Builds Call Graph by linking CALL nodes to their definitions using SymbolTable.
        Note: Function registration is done by PythonParser.
        """
        def link(node: HIRNode):
            if node.type == NodeType.CALL:
                # Extract name "func(arg)" -> "func"
                func_name = node.content.split("(")[0].strip()
                
                # Resolve using SymbolTable
                target_def = symbol_table.resolve_global_function(func_name)
                
                if target_def:
                    # Link Call -> Def
                    node.call_edges.append(target_def)
            
            for child in node.children:
                link(child)
                
        link(root)
