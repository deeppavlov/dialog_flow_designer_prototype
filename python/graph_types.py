from typing import Dict, List, Optional, TypedDict


class ErrorMsg:
    PARSE_ERROR = "parse_error"
    NO_PLOT = "no_plot"
    TRANSITION_TARGET_NOT_FOUND = "transition_target_not_found"


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
