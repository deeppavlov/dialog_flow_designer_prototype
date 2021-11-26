import sys, json

graph = json.load(sys.stdin)['graph']
nodes = graph['nodes']
edges = graph['edges']

def label_to_name(label: str):
    return '"' + label.replace('"', '\\"') + '"'

connections = ""
for edge in edges:
    connections += f"{label_to_name(nodes[edge['source']]['data']['label'] + str(edge['source']))} -> {label_to_name(nodes[edge['target']]['data']['label'] + str(edge['target']))}\n"

print(f"digraph {{ rankdir=LR \n {connections} }}")
