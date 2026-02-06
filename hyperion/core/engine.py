from typing import List, Dict, Any, Set
from hyperion.core.node import HIRNode, NodeType
from hyperion.core.interfaces import TaintEngine, Vulnerability

class HyperionTaintEngine(TaintEngine):
    def __init__(self):
        self.sources = ["request", "input", "sys.argv", "params"]
        
        # Mapping Sinks to Rule IDs
        self.sink_rules = {
            "eval": "HYP-RCE-001",
            "exec": "HYP-RCE-001",
            "system": "HYP-OS-CMD-001",
            "subprocess": "HYP-OS-CMD-001",
            "popen": "HYP-OS-CMD-001",
            "execute": "HYP-SQL-001",  # cursor.execute
            "query": "HYP-SQL-001",
            "open": "HYP-PATH-001",
            "read": "HYP-PATH-001",
            "send_file": "HYP-PATH-001", # Flask send_file
            "write": "HYP-PATH-001"
        }
        
        self.sanitizers = ["escape", "sanitize", "int", "float"]

    def propagate(self, root_node: HIRNode) -> List[Vulnerability]:
        vulnerabilities = []
        MAX_STEPS = 5000  # Safety limit to prevent hangs on massive files
        
        # 1. Identify Sources
        source_nodes = self._find_sources(root_node)
        
        # 2. Propagate Taint (Iterative Worklist)
        for source in source_nodes:
            # Format: (current_node, path_history_ids)
            worklist = [(source, [source.id])]
            visited_states = set()  # (node_id) to avoid cycles efficiently
            steps = 0
            
            while worklist:
                steps += 1
                if steps > MAX_STEPS:
                    print(f"DEBUG: Taint analysis hit step limit ({MAX_STEPS}) for source {source.content}")
                    break
                
                current_node, path_ids = worklist.pop(0) # BFS for shortest path
                
                state_key = current_node.id
                if state_key in visited_states:
                    continue
                visited_states.add(state_key)
                
                # Check Sink
                rule_id = self._get_sink_rule_id(current_node)
                if rule_id:
                    vuln = Vulnerability(
                        rule_id=rule_id,
                        severity="CRITICAL",
                        message=f"Taint flow detected from '{source.content}' to '{current_node.content}'",
                        source=source,
                        sink=current_node
                    )
                    vulnerabilities.append(vuln)
                    continue # Stop this path
                
                # Check Sanitizer
                if self._is_sanitizer(current_node):
                    continue
                
                # Collect next nodes
                next_nodes = []
                
                # DFG Out
                next_nodes.extend(current_node.dfg_out)
                
                # CFG Next (Control Flow)
                next_nodes.extend(current_node.cfg_next)
                
                # Call Edges
                if current_node.type == NodeType.CALL:
                    for target_def in current_node.call_edges:
                        # Simplified param propagation
                        params = [child for child in target_def.children if child.type == NodeType.VARIABLE_DECL]
                        next_nodes.extend(params)
                
                # Add to worklist
                for next_node in next_nodes:
                    if next_node.id not in visited_states:
                        new_path = path_ids + [next_node.id]
                        worklist.append((next_node, new_path))
            
        return vulnerabilities

    def _find_sources(self, node: HIRNode) -> List[HIRNode]:
        sources = []
        if any(s in node.content for s in self.sources):
            sources.append(node)
        
        for child in node.children:
            sources.extend(self._find_sources(child))
        return sources

    def _get_sink_rule_id(self, node: HIRNode) -> str:
        if node.type == NodeType.CALL:
            # Simple check for function name
            func_name = node.content.split("(")[0].lower() # normalizing to lower
            # Check against map
            for sink, rule_id in self.sink_rules.items():
                if sink in func_name:
                    return rule_id
        return None
        
    def _is_sanitizer(self, node: HIRNode) -> bool:
        return any(s in node.content for s in self.sanitizers)
