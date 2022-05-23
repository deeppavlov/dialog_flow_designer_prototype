import sys
import pathlib
import json
deps_path = pathlib.Path(__file__).parent.absolute() / "deps.zip"
sys.path.insert(0, str(deps_path))

from server import DfDslConverter

server = DfDslConverter()
content = sys.stdin.read()
result = server.dsl_to_graph("", content)
json.dump(result, sys.stdout)
