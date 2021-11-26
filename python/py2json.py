#!/usr/bin/env python3.9
import sys, pathlib
deps_path = pathlib.Path(__file__).parent.absolute() / "deps.zip"
sys.path.insert(0, str(deps_path))

import ast
import json
import base64
import libcst as cst

from grandalf.graphs import graph_core, Edge, Vertex, Graph
from grandalf.layouts import SugiyamaLayout,DigcoLayout,VertexViewer,Layer,DummyVertex
from grandalf.routing import EdgeViewer, route_with_rounded_corners

class Node:
    """
    Representation of global or local nodes.
    """

    def __init__(self, name, tr,  misc):
        self.name = name
        self.transitions = tr
        self.misc = misc

    @classmethod
    def parse_node(cls, flow_name, node_name, node, imports, source):
        node_tuple = (flow_name, node_name)
        transitions = {}
        misc = ""
        for key, value in zip(node.keys, node.values):
            if key.id == 'TRANSITIONS':
                func_args = []
                for tr_k, tr_v in zip(value.keys, value.values):
                    # Check type of target node data. If tuple, get flow and node names
                    target_title = ()
                    if isinstance(tr_k, ast.Tuple):  # Target node in another flow
                        if len(tr_k.elts) > 1:
                            target_title = (
                                tr_k.elts[0].value, tr_k.elts[1].value)
                        else:  # Len of tuple < 1. Data is not correct.
                            continue
                    elif isinstance(tr_k, ast.Constant):  # Target node in the same flow
                        target_title = (flow_name, tr_k.value)
                    else:
                        target_title = (flow_name, ast.get_source_segment(
                            source, tr_k))

                    # Check type of values in Transitions dict
                    if isinstance(tr_v, ast.Constant):
                        tr_description = f'"{tr_v.value}"'
                    elif isinstance(tr_v, ast.Call):
                        # print(ast.get_source_segment(content, tr_v))
                        # Check imports and functions
                        """try:
                            imports[tr_v.func.value.id]
                        except KeyError:
                            # print(f'Missing Function "{tr_v.func.value.id}": Show Error Message in VS Code')
                            ...
                        for arg in tr_v.args:
                            func_args.append(arg.value)
                        tr_description = f'{tr_v.func.value.id}.{tr_v.func.attr}({", ".join(func_args)})'"""
                        tr_description = ast.get_source_segment(
                            source, tr_v)
                    elif isinstance(tr_v, ast.Attribute):
                        tr_description = f"{ast.get_source_segment(source, tr_v.value)}.{tr_v.attr}"
                    elif hasattr(tr_v, "value"):
                        tr_description = tr_v.value
                    elif hasattr(tr_v, "id"):
                        tr_description = tr_v.id
                    else:
                        tr_description = '""'
                    transitions[target_title] = tr_description
            elif key.id == "MISC":
                misc = []
                if not isinstance(value, ast.Dict):
                    continue
                if value.values:
                    if not isinstance(value.values[0], ast.List):
                        continue
                    arr = value.values[0]
                    for element in arr.elts:
                        if isinstance(element, ast.Constant):
                            misc.append(element.value)

        return cls(node_tuple, transitions, misc)


class Flows:
    """
    Representation of DFF flow.
    """

    def __init__(self, source, tree):
        self.source = source
        self.tree = tree
        self.imports = {}
        self.flows_name = ""
        self.global_flow = {}
        self.local_flows = {}
        self.keywords = [
            "GLOBAL",
            "LOCAL",
            "TRANSITIONS",
            "PROCESSING"
            "RESPONSE",
            "GLOBAL_TRANSITIONS"
        ]

        # Initialize flows
        self.flow = self.get_flow()
        self.get_imports()
        self.get_flows()

    def __str__(self):
        return ast.get_source_segment(self.source, self.flow)

    def get_flows(self):
        """
        Parse nodes within flows
        """
        for child in ast.iter_child_nodes(self.flow):
            if isinstance(child, ast.Name):
                self.flows_name = child.id
            elif isinstance(child, ast.Dict):
                for key, value in zip(child.keys, child.values):
                    # Flow parsing begins here
                    flow_name = self.get_name(key)
                    # print('FLOW Name:', flow_name)
                    if flow_name == "GLOBAL":
                        self.global_flow['GLOBAL'] = Node.parse_node(
                            flow_name, flow_name, value, self.imports, self.source)
                    else:
                        local_flow = {}
                        for node_key, node_val in zip(value.keys, value.values):
                            node_name = self.get_name(node_key)
                            local_flow[(flow_name, node_name)] = Node.parse_node(
                                flow_name, node_name, node_val, self.imports, self.source)
                        self.local_flows[flow_name] = local_flow

    def get_flow(self) -> ast.Assign:
        """
        Detect line with flow and return its AST.
        """
        for node in self.tree.body:
            if isinstance(node, ast.Assign):
                for child in ast.iter_child_nodes(node):
                    if isinstance(child, ast.Dict):
                        inner_data = ast.get_source_segment(self.source, child)
                        for kword in self.keywords:
                            if kword in inner_data:
                                return node
        return None

    def get_imports(self):
        """
        Parse imports in python script
        """
        for node in self.tree.body:
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                for name in node.names:
                    if name.asname:
                        self.imports[name.asname] = name.name
                    else:
                        self.imports[name.name] = name.name

    def get_name(self, name):
        if isinstance(name, ast.Name):
            return name.id
        elif isinstance(name, ast.Constant):
            return name.value
        elif isinstance(name, str):
            return name


def flow2graph(flow):
    """
    Convert flow to a simple graph
    """
    nodes = {}
    # ID for XML file, {1, 2, 3} IDs are reserved for XML root nodes
    node_id = 4
    for local_flow in flow.local_flows.keys():
        nodes[local_flow] = {}
        for name, node in flow.local_flows[local_flow].items():
            if name == "LOCAL":
                continue
            node_data = {}
            edges = {}
            for path, description in node.transitions.items():
                edges[path] = {"title": description, "id": node_id}
                node_id += 3 # Each edge will need three cells
            node_data['misc'] = node.misc
            node_data['edges'] = edges
            node_data['id'] = node_id
            nodes[local_flow][name] = node_data
            node_id += 3 # Each node will need to ids
    return nodes


def graph2json(graph):
    """
    Convert graph to .drawio data
    """
    nodes = []
    node_ids = {}
    for _, flow_data in graph.items():
        for node, data in flow_data.items():
            # sys.stderr.write(f"{node[1]}: {data['id']}\n")
            nodes.append({
                'type': 'node',
                'data': {'label': node[1]}
            })
            node_ids[data['id']] = len(nodes) - 1

    edges = []
    for _, flow_data in graph.items():
        for node, data in flow_data.items():
            for target, edge_data in data['edges'].items():
                # sys.stderr.write(f"{edge_data}\n")
                target_id = ""
                try:
                    target_id = flow_data[target]['id']
                except KeyError:
                    for _, f_data in graph.items():
                        try:
                            target_id = f_data[target]['id']
                            break
                        except KeyError:
                            continue
                if target_id == "":
                    continue
                parsed = cst.parse_expression(edge_data['title'])
                cndlist = []
                if isinstance(parsed, cst.Call) and len(parsed.args) > 0:
                    mod = cst.parse_module(edge_data['title'])
                    if isinstance(parsed.args[0].value, cst.List):
                        cndlist = [mod.code_for_node(el.value) for el in parsed.args[0].value.elements]
                        if isinstance(parsed.func, cst.Attribute):
                            title = parsed.func.attr.value.capitalize()
                        else:
                            title = edge_data['title']
                    elif "sf" in mod.code_for_node(parsed.func):
                        title = mod.code_for_node(parsed.args[0])
                        # title= edge_data['title']
                    else:
                        title = edge_data['title']
                else:
                    title = edge_data['title']

                conn_node_id = len(nodes)
                edges.append({
                    'source': node_ids[data["id"]],
                    'target': conn_node_id
                })
                nodes.append({
                    'type': 'node',
                    'data': {'label': title}
                })
                edges.append({
                    'source': conn_node_id,
                    'target': node_ids[target_id]
                })
    return {
        'nodes': nodes,
        'edges': edges
    }

def layout(graph_dict):
    vertices = [ Vertex(n['data']['label']) for n in graph_dict['nodes'] ]
    for vert in vertices: vert.view = VertexViewer(172, 36)
    edges = [ Edge(vertices[e['source']], vertices[e['target']]) for e in graph_dict['edges'] ]
    graph = Graph(vertices, edges)
    sug = SugiyamaLayout(graph.C[0])
    sug.init_all()
    sug.draw()
    for i, v in enumerate(graph.C[0].sV):
        graph_dict['nodes'][i]['position'] = {
            'x': v.view.xy[0],
            'y': v.view.xy[1],
        }
    return graph_dict


def py2json(content):
    tree = ast.parse(content)
    flow = Flows(content, tree)
    nodes = flow2graph(flow)
    graph = graph2json(nodes)
    graph = layout(graph)
    return graph


py_code = base64.b64decode(json.loads(sys.stdin.readline())['pycode']).decode('utf-8')
data = py2json(py_code)
json.dump({'graph': data}, sys.stdout)
