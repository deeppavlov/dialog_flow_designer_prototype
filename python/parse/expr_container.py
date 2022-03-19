"""A serializable container which keeps a fragment of parsed python code."""

from typing import Dict, List, Optional, TypedDict, Union

import libcst as cst

from .update_cst import get_node_value, update_elements


def _wrap_in_module(node: cst.BaseExpression) -> cst.Module:
    """Wrap BaseExpression into a module for printing."""
    return cst.Module([cst.SimpleStatementLine([cst.Expr(node)])])


class SerializedExprContainer(TypedDict):
    """Serialized JSON format of ExprContainer, as returned by as_dict.

    The dict also contains keys whose names depend on `exprType` and thus
    cannot be expressed in a `TypedDict`.
    """

    exprType: str


class ExprContainer:
    """A serializable object which keeps a fragment of parsed python code as a
    dictionary for easy modification and round-tripping.

    Attributes:
        expr_type:
            The type of the stored root expression, same as the CSTNode's type
            (eg. `"Name"`, `"SimpleString"`, `"Call"`, etc.).  See
            https://libcst.readthedocs.io/en/latest/nodes.html for all node names.

    Example:
        >>> node = cst.parse_expressions('f(var1)')
        >>> ex = ExprContainer(cst_node=node)
        >>> ex.as_dict()
        {"exprType": "Call", "args": [{"exprType": "Name", "value": "var1"}]}
    """

    expr_type: str

    _data: Dict[str, Union[SerializedExprContainer, str]]

    def __init__(
        self,
        *,
        serialized: Optional[SerializedExprContainer] = None,
        cst_node: Optional[cst.BaseExpression] = None,
    ) -> None:
        if serialized is None and cst_node is None:
            raise ValueError("Either template_json or cst_node has to be provided.")

        if cst_node:
            self.expr_type = type(cst_node).__name__
            if (
                self.expr_type == "Attribute"
            ):  # For the UI the difference does not matter
                self.expr_type = "Name"
            self._data = {}
            module = _wrap_in_module(cst_node)
            if hasattr(cst_node, "elements"):
                # List-like
                self._data["els"] = [
                    ExprContainer(cst_node=el.value).as_dict()
                    for el in cst_node.elements
                ]
            elif hasattr(cst_node, "args") and hasattr(cst_node, "func"):
                # Function call
                self._data["func"] = module.code_for_node(cst_node.func)
                self._data["args"] = [
                    ExprContainer(cst_node=el.value).as_dict() for el in cst_node.args
                ]
            else:
                # Try if it's a value node
                val = get_node_value(cst_node)
                if isinstance(val, str):
                    self._data["value"] = val
                else:
                    # Fall back to saving raw code
                    self._data["value"] = module.code_for_node(cst_node)
        elif serialized:
            self.expr_type = serialized["exprType"]
            self._data = {k: v for k, v in serialized.items() if k != "exprType"}

    def as_dict(self) -> SerializedExprContainer:
        """Serialize the container to JSON."""
        return {"exprType": self.expr_type, **self._data}

    def update_node(self, old_node: cst.BaseExpression) -> cst.BaseExpression:
        """Return the given node updated to match the serialized expression."""
        if self.expr_type != type(old_node).__name__:
            # Expression type changed, restart
            return self._node_from_scratch()
        elif hasattr(old_node, "elements"):
            # List-like or Dict
            new_els = self._get_updated_elements(self._data["els"], old_node.elements)
            return update_elements(old_node, new_els, allow_extra=True)
        elif hasattr(old_node, "args") and hasattr(old_node, "func"):
            # Function call
            func = cst.parse_expression(self._data["func"])
            new_els = self._get_updated_elements(self._data["args"], old_node.args)
            with_new_els = update_elements(old_node, new_els, allow_extra=True)
            return with_new_els.with_changes(func=func)
        elif hasattr(old_node, "raw_value"):
            # SimpleString
            new_val = old_node.value.replace(old_node.raw_value, self._data["value"])
            return old_node.with_changes(value=new_val)
        elif hasattr(old_node, "value") and isinstance(old_node.value, str):
            # Name
            return old_node.with_changes(value=self._data["value"])
        else:
            # Anything else
            return cst.parse_expression(self._data["value"])

    def _get_updated_elements(
        self, serialized_els: List[SerializedExprContainer], old_els: List[cst.Element]
    ):
        upd_els = []
        for i in range(len(serialized_els)):
            ex = ExprContainer(serialized=serialized_els[i])
            if i < len(old_els):
                upd_els.append(ex.update_node(old_els[i].value))
            else:
                upd_els.append(ex._node_from_scratch())
        return upd_els

    def _node_from_scratch(self):
        Node = getattr(cst, self.expr_type)
        if self.expr_type == "SimpleString":
            return Node(f'"{self._data["value"]}"')
        elif self.expr_type in ("List", "Tuple", "Set"):
            return self.update_node(Node([]))
        elif self.expr_type == "Call":
            return self.update_node(Node("func", []))
        elif "value" in self._data:
            return cst.parse_expression(self._data["value"])
        else:
            raise Exception(f"{self.expr_type} cannot be created from scratch")
