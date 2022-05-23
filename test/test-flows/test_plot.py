# this is a very first comment
from df_engine.core.keywords import TRANSITIONS, RESPONSE, PROCESSING, GLOBAL, LOCAL, MISC
import df_engine.conditions as cnd
import df_engine.labels as lbl
import re
from df_engine.core.types import NodeLabel3Type
from df_engine.core import Actor, Context

# this is test comment
import df_engine.responses as rsp  # this is another one
from typing import Any


# NodeLabel3Type == tuple[str, str, float]
def greeting_flow_n2_transition(ctx: Context, actor: Actor, *args, **kwargs) -> NodeLabel3Type:
    return ("greeting_flow", "node2", 1.0)


def high_priority_node_transition(flow_label, label):
    def transition(ctx: Context, actor: Actor, *args, **kwargs) -> NodeLabel3Type:
        return (flow_label, label, 2.0)

    return transition


def cannot_talk_about_topic_response(ctx: Context, actor: Actor, *args, **kwargs) -> Any:
    request = ctx.last_request
    topic_pattern = re.compile(r"(.*talk about )(.*)\.")
    topic = topic_pattern.findall(request)
    topic = topic and topic[0] and topic[0][-1]
    if topic:
        return f"Sorry, I can not talk about {topic} now."
    else:
        return "Sorry, I can not talk about that now."


def upper_case_response(response: str):
    # wrapper for internal response function
    def cannot_talk_about_topic_response(ctx: Context, actor: Actor, *args, **kwargs) -> Any:
        return response.upper()

    return cannot_talk_about_topic_response


def add_prefix(prefix):
    def add_prefix_processing(ctx: Context, actor: Actor, *args, **kwargs) -> Context:
        processed_node = ctx.a_s.get("processed_node", ctx.a_s["next_node"])
        processed_node.response = f"{prefix}: {processed_node.response}"
        ctx.a_s["processed_node"] = processed_node
        return ctx

    return add_prefix_processing


plot = {
    GLOBAL: {
        TRANSITIONS: {
            ("greeting_flow", "node1", 1.1): cnd.regexp(r"\b(hi|hello)\b", re.I),
            ("music_flow", "node1", 1.1): cnd.regexp(r"talk about music"),
            lbl.to_fallback(0.1): cnd.true(),
            lbl.forward(): cnd.all(
                [cnd.regexp(r"next\b"), cnd.has_last_labels(labels=[("music_flow", i) for i in ["node2", "node3"]])]
            ),
            lbl.repeat(0.2): cnd.all(
                [cnd.regexp(r"repeat", re.I), cnd.negation(cnd.has_last_labels(flow_labels=["global_flow"]))]
            ),
        },
        PROCESSING: {1: add_prefix("l1_global"), 2: add_prefix("l2_global")},
        MISC: {"var1": "global_data", "var2": "global_data", "var3": "global_data",},
        RESPONSE: "",
    },
    "global_flow": {
        LOCAL: {PROCESSING: {2: add_prefix("l2_local"), 3: add_prefix("l3_local")}},
        "start_node": {  # This is an initial node, it doesn't need an `RESPONSE`
            RESPONSE: "",
            TRANSITIONS: {
                ("music_flow", "node1"): cnd.regexp(r"talk about music"),  # first check
                ("greeting_flow", "node1"): cnd.regexp(r"hi|hello", re.IGNORECASE),  # second check
                # ("global_flow", "fallback_node"): cnd.true(),  # third check
                "fallback_node": cnd.true(),  # third check
                # "fallback_node" is equivalent to ("global_flow", "fallback_node")
            },
        },
        "fallback_node": {  # We get to this node if an error occurred while the agent was running
            RESPONSE: "Ooops",
            TRANSITIONS: {
                ("music_flow", "node1"): cnd.regexp(r"talk about music"),  # first check
                ("greeting_flow", "node1"): cnd.regexp(r"hi|hello", re.IGNORECASE),  # second check
                lbl.previous(): cnd.regexp(r"previous", re.IGNORECASE),  # third check
                # lbl.previous() is equivalent to ("PREVIOUS_flow", "PREVIOUS_node")
                lbl.repeat(): cnd.true(),  # fourth check
                # lbl.repeat() is equivalent to ("global_flow", "fallback_node")
            },
        },
    },
    "greeting_flow": {
        "node1": {
            RESPONSE: rsp.choice(
                ["Hi, what is up?", "Hello, how are you?"]
            ),  # When the agent goes to node1, we return "Hi, how are you?"
            TRANSITIONS: {
                ("global_flow", "fallback_node", 0.1): cnd.true(),  # second check
                "node2": cnd.regexp(r"how are you"),  # first check
                # "node2" is equivalent to ("greeting_flow", "node2", 1.0)
            },
            MISC: {"var3": "info_of_step_1"},
        },
        "node2": {
            RESPONSE: "Good. What do you want to talk about?",
            TRANSITIONS: {
                lbl.to_fallback(0.1): cnd.true(),  # third check
                # lbl.to_fallback(0.1) is equivalent to ("global_flow", "fallback_node", 0.1)
                lbl.forward(0.5): cnd.regexp(r"talk about"),  # second check
                # lbl.forward(0.5) is equivalent to ("greeting_flow", "node3", 0.5)
                ("music_flow", "node1"): cnd.regexp(r"talk about music"),  # first check
                lbl.previous(): cnd.regexp(r"previous", re.IGNORECASE),  # third check
                # ("music_flow", "node1") is equivalent to ("music_flow", "node1", 1.0)
            },
        },
        "node3": {RESPONSE: cannot_talk_about_topic_response, TRANSITIONS: {lbl.forward(): cnd.regexp(r"bye")}},
        "node4": {
            RESPONSE: upper_case_response("bye"),
            TRANSITIONS: {
                "node1": cnd.regexp(r"hi|hello", re.IGNORECASE),  # first check
                lbl.to_fallback(): cnd.true(),  # second check
            },
        },
    },
    "music_flow": {
        "node1": {
            RESPONSE: "I love `System of a Down` group, would you like to tell about it? ",
            TRANSITIONS: {lbl.forward(): cnd.regexp(r"yes|yep|ok", re.IGNORECASE), lbl.to_fallback(): cnd.true()},
        },
        "node2": {
            RESPONSE: "System of a Downis an Armenian-American heavy metal band formed in in 1994.",
            TRANSITIONS: {
                lbl.forward(): cnd.regexp(r"next", re.IGNORECASE),
                lbl.repeat(): cnd.regexp(r"repeat", re.IGNORECASE),
                lbl.to_fallback(): cnd.true(),
            },
        },
        "node3": {
            RESPONSE: "The band achieved commercial success with the release of five studio albums.",
            TRANSITIONS: {
                lbl.forward(): cnd.regexp(r"next", re.IGNORECASE),
                lbl.backward(): cnd.regexp(r"back", re.IGNORECASE),
                lbl.repeat(): cnd.regexp(r"repeat", re.IGNORECASE),
                lbl.to_fallback(): cnd.true(),
            },
        },
        "node4": {
            RESPONSE: "That's all what I know",
            TRANSITIONS: {
                greeting_flow_n2_transition: cnd.regexp(r"next", re.IGNORECASE),  # second check
                high_priority_node_transition("greeting_flow", "node4"): cnd.regexp(r"next time", re.IGNORECASE),
                lbl.to_fallback(): cnd.true(),  # third check
            },
        },
    },
}
