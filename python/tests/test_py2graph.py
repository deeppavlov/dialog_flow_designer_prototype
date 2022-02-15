import json
from typing import Dict, List, Set, Tuple

import jsonschema

from server import DfDslConverter

from .dff_plots import (
    code_with_one_flow,
    code_with_vars,
    dslnode,
    empty_plot,
    fake_plot_no_flow,
    flow_with_nodes,
    func_prsd,
    grnode_str,
    grtrans,
    name_prsd,
    plot_with_flows,
    str_prsd,
    transitions,
)


def cmp_graphs(g1, g2):
    def dictlist_to_set(lst: List[Dict]) -> Set[Tuple]:
        return set(tuple(d[key] for key in sorted(d)) for d in lst)

    assert dictlist_to_set(g1["nodes"]) == dictlist_to_set(g2["nodes"])
    assert dictlist_to_set(g1["transitions"]) == dictlist_to_set(g2["transitions"])


with open("../schemas/graph.json") as schema_file:
    graph_schema = json.load(schema_file)


def validate_graph(graph):
    jsonschema.validate(instance=graph, schema=graph_schema)


def py2graph(src: str):
    server = DfDslConverter()
    return server.dsl_to_graph("test.py", src)


def test_converts_empty_plot():
    src = code_with_vars(empty_plot)
    graph = py2graph(src)
    validate_graph(graph)
    target = {
        "nodes": [grnode_str("start_node", "flow")],
        "transitions": [],
    }
    cmp_graphs(graph, target)


def test_converts_single_transition():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({'"node1"': cond}, response='"hello"'),
        dslnode({}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    cond_parsed = func_prsd("cnd.regex_match", str_prsd("hello", "r"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [grtrans(0, 1, cond_parsed)],
    }
    cmp_graphs(graph, target)


def test_returns_error_if_target_node_is_not_found():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({'"node1"': cond}, response='"hello"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    assert graph["nodes"][0]["error"] == "transition_target_not_found"


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
    cond1_parsed = func_prsd("cnd.regex_match", str_prsd("hello"))
    cond2_parsed = func_prsd("cnd.regex_match", str_prsd("bye"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
            grnode_str("node2", "flow0"),
        ],
        "transitions": [
            grtrans(0, 1, cond1_parsed),
            grtrans(0, 2, cond2_parsed),
        ],
    }
    cmp_graphs(graph, target)


def test_correctly_parses_lbl_forward():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({"lbl.forward()": cond}, response='"hello"'),
        dslnode({}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    cond_parsed = func_prsd("cnd.regex_match", str_prsd("hello", "r"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [grtrans(0, 1, cond_parsed)],
    }
    cmp_graphs(graph, target)


def test_correctly_parses_lbl_backward():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({'"node1"': cond}, response='"hello"'),
        dslnode({"lbl.backward()": cond}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    cond_parsed = func_prsd("cnd.regex_match", str_prsd("hello", "r"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [grtrans(0, 1, cond_parsed), grtrans(1, 0, cond_parsed)],
    }
    cmp_graphs(graph, target)


def test_correctly_parses_lbl_repeat():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({"lbl.repeat()": cond}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    cond_parsed = func_prsd("cnd.regex_match", str_prsd("hello", "r"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [grtrans(0, -1, cond_parsed, "repeat")],
    }
    cmp_graphs(graph, target)


def test_transition_labeled_if_target_is_not_parsable():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        dslnode({"unknown_label()": cond}, response='"hello"'),
        dslnode({}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    cond_parsed = func_prsd("cnd.regex_match", str_prsd("hello", "r"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [grtrans(0, -1, cond_parsed, "unknown_label()")],
    }
    cmp_graphs(graph, target)
    assert graph["transitions"][0]["error"] == "unparsable_transition_target"


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
    cond1_parsed = func_prsd("cnd.regex_match", str_prsd("hello"))
    cond2_parsed = func_prsd("cnd.regex_match", str_prsd("bye"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
            grnode_str("node0", "flow1"),
        ],
        "transitions": [
            grtrans(0, 1, cond1_parsed),
            grtrans(0, 2, cond2_parsed),
        ],
    }
    cmp_graphs(graph, target)


def test_condition_is_parsed():
    conds = [
        'cnd.regex_match("hello")',  # attribute
        'regex_match("hello")',  # function call
        "cnd",  # name
    ]
    src = code_with_one_flow(
        dslnode(
            {f"node{i + 1}": cond for i, cond in enumerate(conds)}, response='"hello"'
        ),
        *([dslnode({}, response='"how are you"')] * len(conds)),
    )
    graph = py2graph(src)
    validate_graph(graph)
    conds_parsed = [
        func_prsd("cnd.regex_match", str_prsd("hello")),
        func_prsd("regex_match", str_prsd("hello")),
        name_prsd("cnd"),
    ]
    target = {
        "nodes": [grnode_str(f"node{i}", "flow0") for i in range(len(conds) + 1)],
        "transitions": [grtrans(0, i + 1, cond) for i, cond in enumerate(conds_parsed)],
    }
    cmp_graphs(graph, target)


def test_parsed_nested_function_conditions():
    # fmt: off
    cond = (
        "cnd.all("
            "cnd.any("  # noqa: E131
                'cnd.exact_match("hello"),'  # noqa: E131
                'cnd.regex_match(r"hey|hello?"),'  # noqa: E131
            "),"
            "cnd.any("
                'cnd.exact_match(get_string("greet"))'
            ")"  # noqa: E131
        ")"
    )
    # fmt: on
    src = code_with_one_flow(
        dslnode({'"node1"': cond}, response='"hello"'),
        dslnode({}, response='"how are you"'),
    )
    graph = py2graph(src)
    validate_graph(graph)
    cond_parsed = func_prsd(
        "cnd.all",
        func_prsd(
            "cnd.any",
            func_prsd("cnd.regex_match", str_prsd("hello")),
            func_prsd("cnd.regex_match", str_prsd("hey|hello?", "r")),
        ),
        func_prsd(
            "cnd.any",
            func_prsd("cnd.exact_match", func_prsd("get_string", str_prsd("greet"))),
        ),
    )
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [grtrans(0, 1, cond_parsed)],
    }
    cmp_graphs(graph, target)


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
    cond1_parsed = func_prsd("cnd.regex_match", str_prsd("hello"))
    cond2_parsed = func_prsd("cnd.regex_match", str_prsd("bye"))
    cond3_parsed = func_prsd("cnd.exact_match", str_prsd("hey again"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
            grnode_str("node0", "flow1"),
            grnode_str("node1", "flow1"),
            grnode_str("node0", "flow2"),
        ],
        "transitions": [
            grtrans(0, 1, cond1_parsed),
            grtrans(0, 4, cond2_parsed),
            grtrans(1, 2, cond3_parsed),
            grtrans(2, 0, cond3_parsed),
            grtrans(2, 4, cond2_parsed),
        ],
    }
    cmp_graphs(graph, target)


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
    graph = py2graph(src)
    validate_graph(graph)
    cond1_parsed = func_prsd("cnd.regex_match", str_prsd("hello"))
    cond2_parsed = func_prsd("cnd.regex_match", str_prsd("bye"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
            grnode_str("node0", "flow1"),
        ],
        "transitions": [
            grtrans(0, 1, cond1_parsed),
            grtrans(0, 2, cond2_parsed),
        ],
    }
    cmp_graphs(graph, target)


def test_returns_error_if_separate_flow_not_found():
    src = code_with_vars(
        plot_with_flows(
            "var0",
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
    graph = py2graph(src)
    validate_graph(graph)
    cond_parsed = func_prsd("cnd.regex_match", str_prsd("hello"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
        ],
        "transitions": [
            grtrans(0, 1, cond_parsed),
        ],
    }
    cmp_graphs(graph, target)


def test_returns_error_if_transitions_not_found():
    src = code_with_vars(
        plot_with_flows(
            flow_with_nodes(
                dslnode("var0", response='"hello"'),
                dslnode({}, response='"how are you"'),
            ),
        ),
    )
    graph = py2graph(src)
    validate_graph(graph)
    assert graph["nodes"][0]["error"] == "transitions_not_found"


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
            "var0",
            flow_with_nodes(dslnode({}, response='"how are you"')),
        ),
    )
    graph = py2graph(src)
    validate_graph(graph)
    cond1_parsed = func_prsd("cnd.regex_match", str_prsd("hello"))
    cond2_parsed = func_prsd("cnd.regex_match", str_prsd("bye"))
    target = {
        "nodes": [
            grnode_str("node0", "flow0"),
            grnode_str("node1", "flow0"),
            grnode_str("node0", "flow1"),
        ],
        "transitions": [
            grtrans(0, 1, cond1_parsed),
            grtrans(0, 2, cond2_parsed),
        ],
    }
    cmp_graphs(graph, target)
