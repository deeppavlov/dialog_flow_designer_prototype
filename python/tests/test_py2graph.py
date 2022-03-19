import json
from pathlib import Path

import jsonschema
import libcst as cst
import libcst.matchers as m
from libcst import metadata

from ..parse import ExprContainer, Resolver

# from server import DfDslConverter
from ..plot import Plot
from .dff_plots import (
    code_with_one_flow,
    code_with_vars,
    dslnode,
    empty_plot,
    fake_plot_no_flow,
    flow_with_nodes,
    grnode_str,
    grtrans,
    plot_with_flows,
    transitions,
)

if Path.cwd().name != "python":
    root_dir = Path.cwd()
else:
    root_dir = Path.cwd().parent

with open(root_dir / "schemas" / "graph.json") as schema_file:
    graph_schema = json.load(schema_file)


def validate_graph(graph):
    jsonschema.validate(instance=graph, schema=graph_schema)


def parse_cond(cond: str):
    return ExprContainer(cst_node=cst.parse_expression(cond)).as_dict()


def py2graph(src: str, plot_idx=0):
    # server = DfDslConverter()
    # return server.dsl_to_graph("test.py", src)
    wrapper = cst.MetadataWrapper(cst.parse_module(src))
    module = wrapper.module
    scope_data = wrapper.resolve(metadata.ScopeProvider)
    parent_data = wrapper.resolve(metadata.ParentNodeProvider)
    resolver = Resolver(module, scope_data, parent_data)
    d = m.findall(module, m.Assign(value=m.Dict()))[plot_idx].value
    return Plot(d, resolver).as_dict()


def test_converts_empty_plot():
    src = code_with_vars(empty_plot)
    graph = py2graph(src)
    validate_graph(graph)
    target = {
        "nodes": [grnode_str("start_node", "flow")],
        "transitions": [],
    }
    assert graph == target


def test_converts_single_transition():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({'"node1"': cond}, response='"hello"'),
        dslnode({}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [grtrans(0, 1, parse_cond(cond))],
    }
    assert graph == target


def test_returns_error_if_target_node_is_not_found():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({'"node1"': cond}, response='"hello"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    assert graph["transitions"][0]["error"] == "transition_target_not_found"


def test_converts_branching_transition():
    cond1 = 'cnd.regex_match("hello")'
    cond2 = 'cnd.regex_match("bye")'
    src = code_with_one_flow(
        dslnode({'"node1"': cond1, '"node2"': cond2}, response='"hello"'),
        dslnode({}, response='"how are you"'),
        dslnode({}, response='"bye"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
            grnode_str("node2", "flow0"),
        ],
        "transitions": [
            grtrans(0, 1, parse_cond(cond1)),
            grtrans(0, 2, parse_cond(cond2)),
        ],
    }
    assert target == graph


def test_correctly_parses_lbl_forward():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({"lbl.forward()": cond}, response='"hello"'),
        dslnode({}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [grtrans(0, 1, parse_cond(cond))],
    }
    assert target == graph


def test_correctly_parses_lbl_backward():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({'"node1"': cond}, response='"hello"'),
        dslnode({"lbl.backward()": cond}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [
            grtrans(0, 1, parse_cond(cond)),
            grtrans(1, 0, parse_cond(cond)),
        ],
    }
    assert target == graph


def test_correctly_parses_lbl_repeat():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({"lbl.repeat()": cond}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [grtrans(0, -1, parse_cond(cond), "repeat")],
    }
    assert target == graph


def test_transition_labeled_if_target_is_not_parsable():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({"unknown_label()": cond}, response='"hello"'),
        dslnode({}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    trans = grtrans(0, -1, parse_cond(cond), "unknown_label()")
    trans["error"] = "unparsable_transition_target"
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [trans],
    }
    assert target == graph


def test_transition_to_other_flow():
    cond1 = 'cnd.regex_match("hello")'
    cond2 = 'cnd.regex_match("bye")'
    src = code_with_vars(
        plot_with_flows(
            flow_with_nodes(
                dslnode(
                    {'("flow0", "node1")': cond1, '("flow1", "node0")': cond2},
                    response='"hello"',
                ),
                dslnode({}, response='"how are you"'),
            ),
            flow_with_nodes(dslnode({}, response='"bye"')),
        )
    )
    graph = py2graph(src)
    validate_graph(graph)
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
            grnode_str("node0", "flow1"),
        ],
        "transitions": [
            grtrans(0, 1, parse_cond(cond1)),
            grtrans(0, 2, parse_cond(cond2)),
        ],
    }
    assert target == graph


def test_returns_error_if_condition_invalid():
    invalid_conds = [
        "12",  # number
        "f'condition'",  # string
        '(r"string", cnd)',  # tuple
    ]
    for cond in invalid_conds:
        src = code_with_one_flow(
            dslnode({'"node1"': cond}, response='"hello"'),
            dslnode({}, response='"hello"'),
        )
        graph = py2graph(src)
        validate_graph(graph)
        assert graph["nodes"][0]["error"] == "invalid_condition"


def test_more_complex_plot():
    cond1 = 'cnd.regex_match("hello")'
    cond2 = 'cnd.regex_match("bye")'
    cond3 = 'cnd.exact_match("hey again")'
    src = code_with_vars(
        plot_with_flows(
            flow_with_nodes(
                dslnode(
                    {'("flow0", "node1")': cond1, '("flow2", "node0")': cond2},
                    response='"hello"',
                ),
                dslnode({'("flow1", "node0")': cond3}, response='"how are you"'),
            ),
            flow_with_nodes(
                dslnode(
                    {'("flow0", "node0")': cond3, '("flow2", "node0")': cond2},
                    response='"hello"',
                ),
                dslnode({}, response='"how are you"'),
            ),
            flow_with_nodes(dslnode({}, response='"how are you"')),
        )
    )
    graph = py2graph(src)
    validate_graph(graph)
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
            grnode_str("node0", "flow1"),
            grnode_str("node1", "flow1"),
            grnode_str("node0", "flow2"),
        ],
        "transitions": [
            grtrans(0, 1, parse_cond(cond1)),
            grtrans(0, 4, parse_cond(cond2)),
            grtrans(1, 2, parse_cond(cond3)),
            grtrans(2, 0, parse_cond(cond3)),
            grtrans(2, 4, parse_cond(cond2)),
        ],
    }
    assert target == graph


def test_returns_parse_error_on_graph_if_not_valid_python():
    src = "plot = {"
    graph = py2graph(src)
    validate_graph(graph)
    assert graph["error"] == "parse_error"


def test_returns_no_plot_error_if_there_is_no_valid_plot():
    src = code_with_vars(fake_plot_no_flow)
    graph = py2graph(src)
    validate_graph(graph)
    assert graph["error"] == "no_plot"


def test_finds_flow_in_separate_variable_in_same_module():
    cond1 = 'cnd.regex_match("hello")'
    cond2 = 'cnd.regex_match("bye")'
    src = code_with_vars(
        flow_with_nodes(
            dslnode(
                {'("flow0", "node1")': cond1, '("flow1", "node0")': cond2},
                response='"hello"',
            ),
            dslnode({}, response='"how are you"'),
        ),
        plot_with_flows(
            "var0",
            flow_with_nodes(dslnode({}, response='"how are you"')),
        ),
    )
    graph = py2graph(src, 1)
    validate_graph(graph)
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
            grnode_str("node0", "flow1"),
        ],
        "transitions": [
            grtrans(0, 1, parse_cond(cond1)),
            grtrans(0, 2, parse_cond(cond2)),
        ],
    }
    assert target == graph


def test_returns_error_if_separate_flow_not_found():
    src = code_with_vars(
        plot_with_flows(
            "var2",
            flow_with_nodes(dslnode({}, response='"how are you"')),
        ),
    )
    graph = py2graph(src)
    validate_graph(graph)
    assert graph["error"] == "flow_not_found"


def test_finds_transitions_in_separate_variable_in_same_module():
    cond = 'cnd.regex_match("hello")'
    src = code_with_vars(
        transitions({'"node1"': cond}),
        plot_with_flows(
            flow_with_nodes(
                dslnode("var0", response='"hello"'),
                dslnode({}, response='"how are you"'),
            ),
        ),
    )
    graph = py2graph(src, 1)
    validate_graph(graph)
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [
            grtrans(0, 1, parse_cond(cond)),
        ],
    }
    assert target == graph


def test_returns_error_if_transitions_not_found():
    src = code_with_vars(
        plot_with_flows(
            flow_with_nodes(
                dslnode("var1", response='"hello"'),
                dslnode({}, response='"how are you"'),
            ),
        ),
    )
    graph = py2graph(src)
    validate_graph(graph)
    assert graph["nodes"][0]["error"] == "invalid_node"


def test_recursively_resolve_references():
    cond1 = 'cnd.regex_match("hello")'
    cond2 = 'cnd.regex_match("bye")'
    src = code_with_vars(
        transitions({'("flow0", "node1")': cond1, '("flow1", "node0")': cond2}),
        "var0",
        flow_with_nodes(
            dslnode("var1", response='"hello"'),
            dslnode({}, response='"how are you"'),
        ),
        plot_with_flows(
            "var2",
            flow_with_nodes(dslnode({}, response='"how are you"')),
        ),
    )
    graph = py2graph(src, 2)
    validate_graph(graph)
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
            grnode_str("node0", "flow1"),
        ],
        "transitions": [
            grtrans(0, 1, parse_cond(cond1)),
            grtrans(0, 2, parse_cond(cond2)),
        ],
    }
    assert target == graph
