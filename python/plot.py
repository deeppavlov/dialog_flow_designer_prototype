import contextlib
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import libcst as cst
import libcst.matchers as m

from python.parse.resolve import ResolveError

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
    label: Optional[str] = None
    error: Optional[str] = None

    def as_dict(self, node_idxs: Dict[Tuple[str, str], int]) -> TransitionsDict:
        src = node_idxs[self.source]
        try:
            trg = node_idxs[self.target] if self.target else -1
        except KeyError:
            self.error = ErrorMsg.TRANSITION_TARGET_NOT_FOUND
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


class Node:
    name: str
    transitions: List[Transition] = None
    response: str
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
            cond = ExprContainer(cst_node=trans_el.value)
            if cond.expr_type in VALID_CONDITION_TYPES:
                key = trans_el.key
                try:
                    # Just node name given
                    target = (self.flow_name, self.res(key, cst.SimpleString).raw_value)
                    self.transitions.append(Transition(cond, source, target))
                except ResolveError:
                    try:
                        # Tuple given
                        el1, el2, *_ = self.res(key, cst.Tuple).elements
                        trg_flow = self.res(el1.value, cst.SimpleString).raw_value
                        trg_node = self.res(el2.value, cst.SimpleString).raw_value
                        self.transitions.append(
                            Transition(cond, source, (trg_flow, trg_node))
                        )
                    except (ResolveError, ValueError):
                        # Target not parseable, might be a label
                        label = self.res.get_code(key)
                        self.transitions.append(Transition(cond, source, label=label))

    def as_dict(self) -> NodeDict:
        node_dict = {"label": self.name, "flow": self.flow_name}
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
            with contextlib.suppress(ResolveError):
                self.nodes.append(Node(el, self.name, self.res))

    def get_transitions(self) -> List[Transition]:
        return [trans for node in self.nodes for trans in node.transitions]


class Plot:
    flows: List[Flow]
    plot_dict: cst.Dict
    res: Resolver

    def __init__(self, dict_node: cst.Dict, resolver: Resolver) -> None:
        self.res = resolver
        self.plot_dict = dict_node
        self.flows = []
        for el in dict_node.elements:
            with contextlib.suppress(ResolveError):
                self.flows.append(Flow(el, self.res))

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
        return graph

    def update(self, new_graph: GraphDict) -> cst.Dict:
        pass
