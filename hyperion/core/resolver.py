import os
from typing import Optional, Tuple

class ImportResolver:
    """
    Resolves Python imports to absolute file paths.
    """
    def __init__(self, root_path: str):
        self.root_path = root_path
        
    def resolve_import(self, module_name: str, current_file_dir: str = None) -> Optional[str]:
        """
        Resolve a module name (e.g. 'hyperion.core.scope') to a file path.
        Handles absolute imports from root_path and relative imports if current_file_dir is provided.
        """
        # 1. Try relative import if starts with .
        if module_name.startswith('.') and current_file_dir:
            # This is a simplified handling of relative imports
            # In reality, we'd need to handle multiple dots (..)
            # For now, let's just strip one dot and join with current dir
            clean_name = module_name.lstrip('.')
            rel_path = clean_name.replace('.', os.sep)
            
            # Check .py
            path = os.path.join(current_file_dir, rel_path + '.py')
            if os.path.exists(path):
                return path
                
            # Check package
            path = os.path.join(current_file_dir, rel_path, '__init__.py')
            if os.path.exists(path):
                return path

        # 2. Try absolute import from project root
        rel_path = module_name.replace('.', os.sep)
        
        # Check .py
        path = os.path.join(self.root_path, rel_path + '.py')
        if os.path.exists(path):
            return path
            
        # Check package
        path = os.path.join(self.root_path, rel_path, '__init__.py')
        if os.path.exists(path):
            return path
            
        return None
