from typing import Dict, List, Set, Tuple

from py2json import py2json

from .dff_plots import (
    code_with_one_flow,
    code_with_plots,
    empty_plot,
    flow_with_nodes,
    plot_with_flows,
)


def dict_to_tuple(d: Dict) -> Tuple:
    return tuple(d[key] for key in sorted(d))


def cmpable_list(lst: List[Dict]) -> Set[Tuple]:
    return set(dict_to_tuple(el) for el in lst)


def cmp_graphs(graph1, graph2):
    assert cmpable_list(graph1["nodes"]) == cmpable_list(graph2["nodes"])
    assert cmpable_list(graph1["transitions"]) == cmpable_list(graph2["transitions"])


def test_converts_empty_plot():
    src = code_with_plots(empty_plot)
    graph = py2json(src)
    target = {
        "nodes": [{"label": "start_node", "flow": "flow"}],
        "transitions": [],
    }
    cmp_graphs(graph, target)


def test_converts_single_transition():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        '{ TRANSITIONS: { "node1": %s }, RESPONSE: "hello" }' % cond,
        '{ TRANSITIONS: {}, RESPONSE: "how are you" }',
    )
    graph = py2json(src)
    target = {
        "nodes": [
            {"label": "node0", "flow": "flow0"},
            {"label": "node1", "flow": "flow0"},
        ],
        "transitions": [{"source": 0, "target": 1, "condition": cond}],
    }
    cmp_graphs(graph, target)


def test_converts_branching_transition():
    cond1 = 'cnd.regex_match("hello")'
    cond2 = 'cnd.regex_match("bye")'
    src = code_with_one_flow(
        '{ TRANSITIONS: { "node1": %s, "node2": %s }, RESPONSE: "hello" }'
        % (cond1, cond2),
        '{ TRANSITIONS: {}, RESPONSE: "how are you" }',
        '{ TRANSITIONS: {}, RESPONSE: "bye" }',
    )
    graph = py2json(src)
    target = {
        "nodes": [
            {"label": "node0", "flow": "flow0"},
            {"label": "node1", "flow": "flow0"},
            {"label": "node2", "flow": "flow0"},
        ],
        "transitions": [
            {"source": 0, "target": 1, "condition": cond1},
            {"source": 0, "target": 2, "condition": cond2},
        ],
    }
    cmp_graphs(graph, target)


def test_transition_to_other_flow():
    cond1 = 'cnd.regex_match("hello")'
    cond2 = 'cnd.regex_match("bye")'
    src = code_with_plots(
        plot_with_flows(
            flow_with_nodes(
                """{ TRANSITIONS: {
                        ("flow0", "node1"): %s,
                        ("flow1", "node0"): %s
                    },
                    RESPONSE: "hello" }"""
                % (cond1, cond2),
                '{ TRANSITIONS: {}, RESPONSE: "how are you" }',
            ),
            flow_with_nodes('{ TRANSITIONS: {}, RESPONSE: "bye" }'),
        )
    )
    graph = py2json(src)
    target = {
        "nodes": [
            {"label": "node0", "flow": "flow0"},
            {"label": "node1", "flow": "flow0"},
            {"label": "node0", "flow": "flow1"},
        ],
        "transitions": [
            {"source": 0, "target": 1, "condition": cond1},
            {"source": 0, "target": 2, "condition": cond2},
        ],
    }
    cmp_graphs(graph, target)


def test_condition_can_be_any_type():
    conds = [
        'cnd.regex_match("hello")',  # attribute
        'regex_match("hello")',  # function call
        "cnd",  # name
        'f"condition"',  # string
        '(r"string", cnd)',  # tuple
    ]

    src = code_with_one_flow(
        '{ TRANSITIONS: {%s}, RESPONSE: "hello" }'
        % ", ".join(f"node{i + 1}: {cond}" for i, cond in enumerate(conds)),
        *(['{ TRANSITIONS: {}, RESPONSE: "how are you" }'] * len(conds)),
    )
    graph = py2json(src)
    target = {
        "nodes": [
            {"label": f"node{i}", "flow": "flow0"} for i in range(len(conds) + 1)
        ],
        "transitions": [
            {"source": 0, "target": i + 1, "condition": cond}
            for i, cond in enumerate(conds)
        ],
    }
    cmp_graphs(graph, target)


def test_transition_key_can_be_non_string():
    cond = 'cnd.regex_match(r"hello")'
    src = code_with_one_flow(
        '{ TRANSITIONS: { lbl.forward(1): %s }, RESPONSE: "hello" }' % cond,
        '{ TRANSITIONS: {}, RESPONSE: "how are you" }',
    )
    graph = py2json(src)
    target = {
        "nodes": [
            {"label": "node0", "flow": "flow0"},
            {"label": "node1", "flow": "flow0"},
        ],
        "transitions": [],
    }
    cmp_graphs(graph, target)


def test_transitions_can_be_not_a_dictionary():
    src = code_with_one_flow(
        '{ TRANSITIONS: not_a_dict, RESPONSE: "hello" }',
        '{ TRANSITIONS: {}, RESPONSE: "how are you" }',
    )
    graph = py2json(src)
    target = {
        "nodes": [
            {"label": "node0", "flow": "flow0"},
            {"label": "node1", "flow": "flow0"},
        ],
        "transitions": [],
    }
    cmp_graphs(graph, target)


def test_more_complex_plot():
    cond1 = 'cnd.regex_match("hello")'
    cond2 = 'cnd.regex_match("bye")'
    cond3 = 'cnd.exact_match("hey again")'
    src = code_with_plots(
        plot_with_flows(
            flow_with_nodes(
                """{ TRANSITIONS: {
                        ("flow0", "node1"): %s,
                        ("flow2", "node0"): %s
                    },
                    RESPONSE: "hello" }"""
                % (cond1, cond2),
                '{ TRANSITIONS: {("flow1", "node0"): %s}, RESPONSE: "how are you" }'
                % cond3,
            ),
            flow_with_nodes(
                """{ TRANSITIONS: {
                        ("flow0", "node0"): %s,
                        ("flow2", "node0"): %s
                    },
                    RESPONSE: "hello" }"""
                % (cond3, cond2),
                '{ TRANSITIONS: {}, RESPONSE: "how are you" }',
            ),
            flow_with_nodes('{ TRANSITIONS: {}, RESPONSE: "bye" }'),
        )
    )
    graph = py2json(src)
    target = {
        "nodes": [
            {"label": "node0", "flow": "flow0"},
            {"label": "node1", "flow": "flow0"},
            {"label": "node0", "flow": "flow1"},
            {"label": "node1", "flow": "flow1"},
            {"label": "node0", "flow": "flow2"},
        ],
        "transitions": [
            {"source": 0, "target": 1, "condition": cond1},
            {"source": 0, "target": 4, "condition": cond2},
            {"source": 1, "target": 2, "condition": cond3},
            {"source": 2, "target": 0, "condition": cond3},
            {"source": 2, "target": 4, "condition": cond2},
        ],
    }
    cmp_graphs(graph, target)
