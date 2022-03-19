"""Functions for extracting structured information from a parsed libCST tree."""

from typing import Any, Mapping, Tuple, Type, TypeVar

import libcst as cst
from libcst import matchers as m
from libcst import metadata

T = TypeVar("T")
E = TypeVar("E")
K = TypeVar("K")
V = TypeVar("V")


class Resolver:
    """Resolve variable references within a module."""

    module: cst.Module
    scope_data: Mapping[cst.CSTNode, metadata.Scope]
    parent_data: Mapping[cst.CSTNode, cst.CSTNode]

    def __init__(self, module, scope_data, parent_data) -> None:
        self.module = module
        self.scope_data = scope_data
        self.parent_data = parent_data

    def __call__(
        self,
        ref: cst.BaseExpression,
        target_type: Type[T] | Tuple[Type[T], ...],
    ) -> T:
        """Given a name node, try recursively resolving its definition within the same
        module until `target_type` node is reached.

        Args:
            ref: The referee Name node.
            target_type: The expected type of the final defintion.

        Raises:
            Exception: Defintion not found inside the module.

        Returns:
            cst.BaseExpression: The referenced value.
        """
        if isinstance(ref, target_type):
            return ref
        ref = cst.ensure_type(ref, cst.Name)
        return cst.ensure_type(self._recurse_ref(ref, target_type), target_type)

    def get_from_dict(
        self,
        node: Any,
        key: m.BaseMatcherNode,
    ) -> cst.BaseExpression:
        """Get the dictionary value associated with the matching key.

        Args:
            node: Dictionary node.
            key: A libcst.matchers matcher object that should match the key whose value
                we want.

        Raises:
            Exception: No key matches the given matcher.

        Returns:
            cst.BaseExpression: Value of the matched key.
        """
        node = self(node, cst.Dict)
        res = m.findall(node, m.DictElement(key=key))
        if len(res) != 1:
            raise Exception(f"{key} not found")
        return res[0].value

    def get_code(self, node: cst.BaseExpression):
        """Shortcut to get the string representation of a target node."""
        return self.module.code_for_node(node)

    def _recurse_ref(self, _ref: cst.Name, target_type):
        scope = self.scope_data[_ref]
        assigns = scope[_ref.value]
        for assign in assigns:
            if isinstance(assign.node, target_type):
                # FunctionDef or ClassDef
                return assign.node
            # Try getting the assign value
            try:
                node = cst.ensure_type(assign.node, cst.Name)
                assign_target = cst.ensure_type(
                    self.parent_data[node], cst.AssignTarget
                )
                assign = cst.ensure_type(self.parent_data[assign_target], cst.Assign)
                value = assign.value
                if isinstance(value, cst.Name):
                    value = self._recurse_ref(value, target_type)
                if isinstance(value, target_type):
                    return value
            except Exception:
                pass
        return None
