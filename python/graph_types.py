from typing import Dict, List, Optional, TypedDict


class ErrorMsg:
    PARSE_ERROR = "parse_error"
    NO_PLOT = "no_plot"
    FLOW_NOT_FOUND = "flow_not_found"
    INVALID_NODE = "invalid_node"
    TRANSITION_TARGET_NOT_FOUND = "transition_target_not_found"
    UNPARSABLE_TRANSITION_TARGET = "unparsable_transition_target"
    INVALID_CONDITION = "invalid_condition"


class NodeDict(TypedDict):
    label: str
    flow: str
    error: Optional[ErrorMsg]


class ParsedObjDict(TypedDict):
    type: str
    tmpl: str
    data: Dict[str, str]


class TransitionsDict(TypedDict):
    source: int
    target: int
    condition: ParsedObjDict
    label: Optional[str]
    error: Optional[ErrorMsg]


class GraphDict(TypedDict):
    nodes: List[NodeDict]
    transitions: List[TransitionsDict]
    error: Optional[ErrorMsg]


class DfFile:
    """Parsed python module with one or more DF plots."""

    hash: str
    change_id: str
    available_plots: List[str]
