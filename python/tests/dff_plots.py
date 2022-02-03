code_header = """
from dff.core.keywords import TRANSITIONS, RESPONSE, MISC, PROCESSING
from dff.core import Actor
import dff.conditions as cnd

"""


def code_with_plots(*plots: str):
    return code_header + "\n\n".join(
        f"plot{i} = {plot}" for i, plot in enumerate(plots)
    )


def plot_with_flows(*flows: str):
    return (
        "{\n" + ",\n".join(f'"flow{i}": {flow}' for i, flow in enumerate(flows)) + "\n}"
    )


def flow_with_nodes(*nodes: str):
    return (
        "{\n" + ",\n".join(f'"node{i}": {node}' for i, node in enumerate(nodes)) + "\n}"
    )


def code_with_one_flow(*nodes: str):
    return code_with_plots(plot_with_flows(flow_with_nodes(*nodes)))


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
