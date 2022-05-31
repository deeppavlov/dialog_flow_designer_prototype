from abc import ABC, abstractmethod
from collections import defaultdict
import contextlib
from pprint import pprint
from uuid import uuid4
import libcst as cst
import libcst.matchers as m
from typing import Dict, List, Optional, Type, TypeVar, Union, cast


AssignmentValue = Union[cst.BaseExpression, cst.FunctionDef, cst.ClassDef]

ResolveT = TypeVar("ResolveT")


class DfParseVisitor(m.MatcherDecoratableVisitor):
    def __init__(self, mod: "DfModule") -> None:
        super().__init__()
        self.mod = mod
        self.results: Dict[str, List[DfObj]] = defaultdict(list)

    # Scope bookkeeping
    def visit_ClassDef(self, _) -> Optional[bool]:
        self.mod.enter_scope()
        return True

    def leave_ClassDef(self, _) -> None:
        self.mod.leave_scope()

    # Refrain from entering "dynamic" (function, comprehension) scopes
    @m.visit(m.FunctionDef() | m.ListComp())
    def vist_non_class_scope(self, _) -> bool:
        return False

    def visit_Assign(self, node: cst.Assign) -> Optional[bool]:
        # Handle multi-target assigns eg. `a = b = 12`
        names = [
            trg.target.value for trg in node.targets if isinstance(trg.target, cst.Name)
        ]
        if len(names) > 0:
            # Try pasring a plot
            with contextlib.suppress(Exception):
                self.results["plots"].append(Plot(self.mod, node.value, names[0]))
            # Add definitions
            for name in names:
                self.mod.add_def(name, node.value)
        return False


class DfModule:
    _scope_stack: List[Dict[str, AssignmentValue]]
    _replaces: Dict[cst.CSTNode, cst.CSTNode]

    def __init__(self, tree: cst.Module) -> None:
        self._scope_stack = [{}]
        self._replaces = {}
        self._tree = tree

    def enter_scope(self):
        self._scope_stack.append({})

    def leave_scope(self):
        if len(self._scope_stack) == 1:
            raise Exception("Can't leave the global scope!")
        self._scope_stack.pop()

    def add_def(self, name: str, node: AssignmentValue):
        self._scope_stack[-1][name] = node

    def resolve_name(self, name: str) -> AssignmentValue:
        for scope in reversed(self._scope_stack):
            if name in scope:
                return scope[name]
        raise KeyError(f"{name} not found in any scope!")

    def resolve(
        self, node: cst.BaseExpression, target_type: Type[ResolveT]
    ) -> ResolveT:
        while True:
            try:
                if issubclass(target_type, DfObj):
                    return target_type(self, node)
                else:
                    return cst.ensure_type(node, target_type)
            except Exception:
                name = cst.ensure_type(node, cst.Name).value
                node = self.resolve_name(name)

    def add_replace(self, old_node: cst.CSTNode, new_node: cst.CSTNode) -> None:
        self._replaces[old_node] = new_node

    def code_for_node(self, node: cst.CSTNode) -> str:
        return self._tree.code_for_node(node)

    # def parse(self) -> None:
    #     for line in self._tree.body:


class DfObj(ABC):
    mod: DfModule
    type_prefix: str
    _id: str = None

    def __init__(self, mod: DfModule, node: cst.CSTNode) -> None:
        self.mod = mod

    @abstractmethod
    def update(self, new_data: Dict) -> None:
        ...

    @abstractmethod
    def get_data(self) -> Dict:
        ...

    def replace(self, attr_name: str, new_node: cst.CSTNode) -> None:
        old_node = getattr(self, attr_name)
        self.mod.add_replace(old_node, new_node)
        setattr(self, attr_name, new_node)

    def get_id(self) -> str:
        if self._id is None:
            self._id = f"id#{self.type_prefix}_{uuid4().hex.split('-')[0]}"
        return self._id


class Response(DfObj):
    type_prefix: str = "rs"

    def __init__(self, mod: DfModule, node: cst.CSTNode) -> None:
        super().__init__(mod, node)
        try:
            self._res = self.resolve(node, cst.SimpleString)
        except Exception:
            self._res = node

    def get_data(self) -> Dict:
        return {
            "response_object": self._res.raw_value
            if isinstance(self._res, cst.SimpleString)
            # TODO: Replace with linking
            else self.mod.code_for_node(self._res)
        }


class Node(DfObj):
    type_prefix: str = "nd"

    def __init__(self, mod: DfModule, node: cst.DictElement) -> None:
        super().__init__(mod, node)
        self._name = self.resolve(node.key, cst.SimpleString)
        self._dict = self.resolve(node.value, cst.Dict)
        for el in self._dict.elements:
            with contextlib.suppress(Exception):
                key = cst.ensure_type(el.key, cst.Name).value
                if key == "RESPONSE":
                    self._resp = Response(mod, cst.ensure_type(el.value, cst.Dict))
                # TODO: Parse other props

    def get_data(self) -> Dict:
        return {"name": self._name.raw_value, "response": self._resp.get_id()}


class Flow(DfObj):
    type_prefix: str = "fl"

    def __init__(self, mod: DfModule, node: cst.DictElement) -> None:
        super().__init__(mod, node)
        self._name = self.resolve(node.key, cst.SimpleString)
        self._dict = self.resolve(node.value, cst.Dict)
        self.nodes: List[Node] = []
        for el in self._dict.elements:
            with contextlib.suppress(Exception):
                self.nodes.append(Node(mod, el))

    def get_data(self) -> Dict:
        return {
            "name": self._name.raw_value,
            "nodes": [nd.get_id() for nd in self.nodes],
        }


class Plot(DfObj):
    type_prefix: str = "pl"

    def __init__(self, mod: DfModule, node: cst.Dict, name: str) -> None:
        super().__init__(mod, node)
        self.name = name
        self._dict = node
        self.flows: List[Flow] = []
        for el in node.elements:
            with contextlib.suppress(Exception):
                self.flows.append(Flow(el))

    def get_data(self) -> Dict:
        return {"name": self.name, "flows": [fl.get_id() for fl in self.flows]}

    # def update(self, new_data: Dict) -> None:
    #     pass


if __name__ == "__main__":
    with open("test_plot.py") as f:
        module = cst.parse_module(f.read())
        df_module = DfModule(module)
        Plot()
