import uuid
from typing import Optional


def get_hash(truncated: Optional[bool] = True):
    hash = str(uuid.uuid4())
    if truncated:
        hash = hash.split("-")[0]
    return hash


def get_id(prefix: str):
    return f"id#{prefix}_{get_hash()}"


def get_plot_id():
    return get_id("pl")


def get_flow_id():
    return get_id("fl")


def get_node_id():
    return get_id("nd")


def get_linking_id():
    return get_id("ln")


def get_response_id():
    return get_id("rs")


def get_transition_id():
    return get_id("tr")


def get_processing_id():
    return get_id("pr")


def get_misc_id():
    return get_id("ms")


def get_def_id():
    return get_id("df")


def get_import_id():
    return get_id("im")
