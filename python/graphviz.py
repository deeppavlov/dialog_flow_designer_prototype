import sys
import json
from grandalf.graphs import Vertex, Edge, Graph
from grandalf.layouts import SugiyamaLayout

graph = json.load(sys.stdin)['graph']
nodes = graph['nodes']
edges = graph['edges']


def label_to_name(label: str):
    return '"' + label.replace('"', '\\"') + '"'

vertices = [Vertex(label_to_name(node['data']['label'])) for node in nodes]
class defaultview(object):
    w,h = 172,36
for v in vertices: v.view = defaultview()
conn = [Edge(vertices[edge['source']], vertices[edge['target']])
        for edge in edges]
graph = Graph(vertices, conn)
layout = SugiyamaLayout(graph.C[0])
layout.init_all()
layout.draw()


for v in graph.C[0].sV: print("%s: (%d,%d)"%(v.data,v.view.xy[0],v.view.xy[1]))

# print(f"digraph {{ rankdir=LR \n {connections} }}")
