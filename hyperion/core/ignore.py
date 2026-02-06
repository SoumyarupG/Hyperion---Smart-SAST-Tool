import os
import re
from typing import List, Set

class IgnoreManager:
    """Manages file and directory exclusions using a single combined regex (performance optimized)"""
    
    def __init__(self, root_path: str):
        self.root_path = os.path.abspath(root_path)
        self.patterns = self._load_ignore_file()
        
        # Build a single giant regex for all patterns
        regex_parts = [self._glob_to_re(p) for p in self.patterns]
        self.combined_re = re.compile("|".join(f"(?:{p})" for p in regex_parts), re.IGNORECASE)
        self._cache = {}

    def _glob_to_re(self, glob: str) -> str:
        """Converts glob pattern to regex segment"""
        p = glob.replace(".", "\\.").replace("*", "[^/]*").replace("?", ".")
        # If it's a simple folder name (no /), allow it anywhere in the path
        if "/" not in p and "\\" not in p:
            return f"(^|/){p}(/|$)"
        return p

    def _load_ignore_file(self) -> List[str]:
        ignore_path = os.path.join(self.root_path, ".hyperionignore")
        patterns = {
            "node_modules", "venv", ".git", "__pycache__", 
            "bower_components", "dist", "build", "static", "assets",
            "images", "fonts", "media", "uploads", "test", "tests",
            "bin", "obj", ".vs", ".idea", ".vscode",
            ".next", ".nuxt"
        }
        # Extensions as patterns
        exts = ["png", "jpg", "jpeg", "svg", "ico", "pdf", "zip", "exe", "dll", "so", "pyc", "map", "min.js", "min.css"]
        for ext in exts:
            patterns.add(f"*.{ext}")
        
        if os.path.exists(ignore_path):
            try:
                with open(ignore_path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#"):
                            patterns.add(line)
            except Exception as e:
                print(f"Warning: Could not read .hyperionignore: {e}")
                
        return list(patterns)

    def should_ignore(self, path: str) -> bool:
        abs_path = os.path.abspath(path)
        if abs_path in self._cache:
            return self._cache[abs_path]
            
        # Fast relpath replacement
        if not abs_path.startswith(self.root_path):
            return False
            
        rel_path = abs_path[len(self.root_path):].lstrip(os.path.sep).replace(os.path.sep, "/")
        if not rel_path: 
            return False
            
        # Match against combined regex
        is_ignored = bool(self.combined_re.search(rel_path))
        self._cache[abs_path] = is_ignored
        return is_ignored
