import contextlib
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import libcst as cst
import libcst.matchers as m

from .graph_types import ErrorMsg, GraphDict, NodeDict, TransitionsDict
from .parse import ExprContainer, Resolver


class NodeKeys:
    response = m.Name("RESPONSE")
    transitions = m.Name("TRANSITIONS")
    misc = m.Name("MISC")
    processing = m.Name("PROCESSING")


VALID_CONDITION_TYPES = {"Call", "Name"}


@dataclass
class Transition:
    condition: ExprContainer
    source: Tuple[str, str]
    target: Optional[Tuple[str, str]] = None
    prob: float = 1
    label: Optional[str] = None
    error: Optional[str] = None

    def as_dict(self, node_idxs: Dict[Tuple[str, str], int]) -> TransitionsDict:
        src = node_idxs[self.source]
        try:
            trg = node_idxs[self.target]
        except KeyError:
            if self.target:
                self.error = ErrorMsg.TRANSITION_TARGET_NOT_FOUND
            else:
                self.error = ErrorMsg.UNPARSABLE_TRANSITION_TARGET
            trg = -1
        trans_dict = {
            "condition": self.condition.as_dict(),
            "source": src,
            "target": trg,
        }
        if self.label:
            trans_dict["label"] = self.label
        if self.error:
            trans_dict["error"] = self.error
        return trans_dict


@dataclass
class InvalidNode:
    flow_name: str
    error: str = ErrorMsg.INVALID_NODE
    name: str = "Invalid node"
    transitions: List = field(default_factory=list)

    def as_dict(self) -> NodeDict:
        return {"flow": self.flow_name, "label": self.name, "error": self.error}


class Node:
    name: str
    transitions: List[Transition] = None
    response: str
    error: Optional[str] = None
    node_dict: cst.Dict
    trans_dict: cst.Dict
    flow_name: str
    res: Resolver

    def __init__(self, dictel: cst.DictElement, flow: str, resolver: Resolver) -> None:
        self.res = resolver
        self.flow_name = flow
        self.node_dict = self.res(dictel.value, cst.Dict)
        self.name = self.res(dictel.key, cst.SimpleString).raw_value
        self.response = self.res(
            self.res.get_from_dict(self.node_dict, NodeKeys.response), cst.SimpleString
        ).raw_value

        self.transitions = []
        self.trans_dict = self.res(
            self.res.get_from_dict(self.node_dict, key=NodeKeys.transitions), cst.Dict
        )
        source = (self.flow_name, self.name)
        for trans_el in self.trans_dict.elements:
            key = trans_el.key
            prob = 1.0
            cond = ExprContainer(cst_node=trans_el.value)
            if cond.expr_type not in VALID_CONDITION_TYPES:
                self.error = ErrorMsg.INVALID_CONDITION
                continue
            try:
                # Just node name given
                target = (self.flow_name, self.res(key, cst.SimpleString).raw_value)
            except Exception:
                try:
                    # Tuple given
                    el1, el2, *rest = self.res(key, cst.Tuple).elements
                    trg_flow = self.res(el1.value, cst.SimpleString).raw_value
                    trg_node = self.res(el2.value, cst.SimpleString).raw_value
                except Exception:
                    label = self.res.get_code(key)
                    self.transitions.append(Transition(cond, source, label=label))
                    continue
                with contextlib.suppress(IndexError, ValueError, Exception):
                    # Try to get prob
                    prob = float(
                        self.res(rest[0].value, (cst.Integer, cst.Float)).value
                    )
                target = (trg_flow, trg_node)
            self.transitions.append(Transition(cond, source, target, prob))

    def as_dict(self) -> NodeDict:
        node_dict = {"label": self.name, "flow": self.flow_name}
        if self.error:
            node_dict["error"] = self.error
        return node_dict


class Flow:
    name: str
    nodes: List["Node"]
    flow_dict: cst.Dict
    res: Resolver

    def __init__(self, dictel: cst.DictElement, resolver: Resolver) -> None:
        self.res = resolver
        self.flow_dict = self.res(dictel.value, cst.Dict)
        self.name = self.res(dictel.key, cst.SimpleString).raw_value
        self.nodes = []
        for el in self.flow_dict.elements:
            try:
                self.nodes.append(Node(el, self.name, self.res))
            except Exception:
                self.nodes.append(InvalidNode(self.name))

    def get_transitions(self) -> List[Transition]:
        return [trans for node in self.nodes for trans in node.transitions]


class Plot:
    flows: List[Flow]
    plot_dict: cst.Dict
    res: Resolver
    error: Optional[str] = None

    def __init__(self, dict_node: cst.Dict, resolver: Resolver) -> None:
        self.res = resolver
        self.plot_dict = dict_node
        self.flows = []
        for el in dict_node.elements:
            try:
                self.flows.append(Flow(el, self.res))
            except Exception:
                self.error = ErrorMsg.FLOW_NOT_FOUND

    def as_dict(self) -> GraphDict:
        all_nodes = [node for flow in self.flows for node in flow.nodes]
        node_idxs = {(n.flow_name, n.name): i for i, n in enumerate(all_nodes)}
        transitions = []
        for flow in self.flows:
            for trans in flow.get_transitions():
                transitions.append(trans.as_dict(node_idxs))
        graph = {
            "nodes": [n.as_dict() for n in all_nodes],
            "transitions": transitions,
        }
        if self.error:
            graph["error"] = self.error
        return graph

    def update(self, new_graph: GraphDict) -> cst.Dict:
        pass
