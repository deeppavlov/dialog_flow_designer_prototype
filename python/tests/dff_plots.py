from typing import Any, Dict, Optional, Union

import black

code_header = """
from dff.core.keywords import TRANSITIONS, RESPONSE, MISC, PROCESSING
from dff.core import Actor
import dff.conditions as cnd

"""


def code_with_vars(*vars: str):
    return code_header + "\n\n".join(f"var{i} = {var}" for i, var in enumerate(vars))


def plot_with_flows(*flows: str):
    return (
        "{\n" + ",\n".join(f'"flow{i}": {flow}' for i, flow in enumerate(flows)) + "\n}"
    )


def flow_with_nodes(*nodes: str):
    return (
        "{\n" + ",\n".join(f'"node{i}": {node}' for i, node in enumerate(nodes)) + "\n}"
    )


def transitions(conditions: Dict[str, str]):
    return (
        "{\n" + ",\n".join(f"{trg}: {cond}" for trg, cond in conditions.items()) + "\n}"
    )


def dslnode(
    conditions: Union[Dict[str, str], str],
    response: Optional[str] = '""',
    misc: Optional[Dict[str, str]] = None,
    processing: Optional[Dict[str, str]] = None,
) -> str:
    if len(conditions) > 0:
        if isinstance(conditions, dict):
            trans = transitions(conditions)
        else:
            trans = conditions
    else:
        trans = "{}"
    node_src = "{\nTRANSITIONS: " + trans
    if response:
        node_src += ",\nRESPONSE: " + response
    if misc:
        node_src += (
            ",\nMISC: "
            + "{\n"
            + ",\n".join(f"{key}: {val}" for key, val in misc.items())
            + "\n}"
        )
    if processing:
        node_src += (
            ",\nPROCESSING: "
            + "{\n"
            + ",\n".join(f"{key}: {val}" for key, val in processing.items())
            + "\n}"
        )
    node_src += "\n}"
    return node_src


def code_with_one_flow(*nodes: str):
    return code_with_vars(plot_with_flows(flow_with_nodes(*nodes)))


def normalize_formatting(src: str) -> str:
    return black.format_str(src, mode=black.FileMode(magic_trailing_comma=False))


def name_prsd(cont: str):
    return {"tmpl": "$s", "data": {"s": cont}, "type": "name"}


def str_prsd(cont: str, prefix: str = "", quote='"'):
    return {"tmpl": f"{prefix}{quote}$s{quote}", "data": {"s": cont}, "type": "str"}


def tuple_prsd(*elements: Any):
    return {
        "tmpl": "(" + ", ".join(f"$s{i}" for i in range(len(elements))) + ")",
        "data": {f"s{i}": el for i, el in enumerate(elements)},
        "type": "tuple",
    }


def func_prsd(func: str, *args: Any):
    return {
        "tmpl": "$func(" + ", ".join(f"$arg{i}" for i in range(len(args))) + ")",
        "data": {"func": func, **{f"arg{i}": arg for i, arg in enumerate(args)}},
        "type": "func",
    }


def grnode_str(lbl: str, flow: str):
    return {"label": lbl, "flow": flow}


def grtrans(src: int, trg: int, cond: Dict, label: Optional[str] = None):
    trans = {"source": src, "target": trg, "condition": cond}
    if label:
        trans["label"] = label
    return trans


simple_plot = """{
    "flow": {
        "start_node": {
            TRANSITIONS: {("flow2", "fallback_node"): cnd},
            RESPONSE: "",
            MISC: {
                "speech_functions": ["React.Rejoinder.Support.Response.Resolve"],
            }
        }
    }
}"""

plot_with_response_only = """{
    "flow": {
        "start_node": {
            RESPONSE: "",
        }
    }
}"""

plot_with_processing_only = """{
    "flow": {
        "start_node": {
            PROCESSING: {"key": value},
        }
    }
}"""

plot_with_misc_only = """{
    "flow": {
        "start_node": {
            MISC: {"key": value},
        }
    }
}"""

empty_plot = """{
    "flow": {
        "start_node": {
            TRANSITIONS: {},
            RESPONSE: ""
        }
    }
}"""

fake_plot_no_transitions = """{
    "fake_flow": {
        "fake_node": {
            "NOT_TRANSITION": {}
        }
    }
}"""

fake_plot_no_flow = """{
    "fake_flow": {
        "fake_node": {
            "TRANSITIONS": {}
        }
    },
    "not_a_flow": "just a string"
}"""
