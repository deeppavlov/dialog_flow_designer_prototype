"""Functions for incrementally updating CST nodes, with minimal changes."""

from typing import List, Tuple, TypeVar

import libcst as cst
import libcst.matchers as m

CollNode = cst.Dict | cst.List
ElemNode = cst.DictElement | cst.BaseElement
T = TypeVar("T")


def ensure_has_elements(
    node: T,
    elements: List[cst.BaseExpression]
    | List[Tuple[cst.BaseExpression, cst.BaseExpression]],
    allow_extra: bool = False,
) -> T:
    """Makes sure the collection in the CST has the given elements, with
    no respect to their order. This is useful for dictionaries, where we
    don't want to impose our own ordering of keys, as well as lists or
    sets where we only care about certain elements.

    WARNING 1:
        If `allow_extra=True`, changing keys will not work as the old ones will be
        kept.

    WARNING 2:
        New elements are deep-compared with each old one, and therefore have an
        exponential time complexity. Only use with simple elements like string or
        names.

    Args:
        node: The node whose child elements are to be updated. Should be one of
        `List`, `Set`, `Tuple`, `Call` or `Dict`.
        elements: Either tuples of key-value pairs or just the values. If keys
                are provided, new elements are matched to old ones based on their
                values. Keys have are matched to nodes by value (or raw_value).
        allow_extra: If true, items already in node but not in elements
                            will be kept. If false, only specified elements are
                            allowed in the new node.

    Returns:
        New CST node with updated elements.

    Example:
        >>> node = cst.parse_expression(\"\"\"{
        ...     TRANSITIONS: transitions,
        ...     MISC: misc,
        ...     RESPONSE: "hello",
        ... }\"\"\")
        >>> updated = ensure_has_elements(
        ...     node,
        ...     elements=[ # Notice the mixed up order of keys
        ...         (cst.Name("RESPONSE"), cst.SimpleString('"hello there"')),
        ...         (cst.Name("TRANSITIONS"), cst.Name("transitions_new")),
        ...         # MISC removed, PROCESSING added
        ...         (cst.Name("PROCESSING"), cst.Name("processing"))
        ...     ])
        >>> print(cst.Module([updated]).code_for_node(updated))
        {
            TRANSITIONS: transitions_new,
            RESPONSE: "hello there",
            PROCESSING: processing,
        }
    """
    new_els = []
    node_elements = node.args if hasattr(node, "args") else node.elements
    els_to_place = set(elements)
    for og_el in node_elements:
        og_key = og_el.key if hasattr(og_el, "key") else og_el.value
        for new_el in els_to_place:
            if isinstance(new_el, tuple):
                new_key, new_value = new_el
            else:
                new_key = new_value = new_el
            if node_values_match(og_key, new_key):
                new_els.append(og_el.with_changes(value=new_value))
                # It's okay to mutate the set we're iterating,
                # because we break right after
                els_to_place.remove(new_el)
                break
        else:
            # Original element not in update, only add if allow_extra
            if allow_extra:
                new_els.append(og_el)
    # Add remaining (new) elements
    for new_el in els_to_place:
        if isinstance(new_el, tuple):
            new_els.append(create_element_wrapper(node, key=new_el[0], value=new_el[1]))
        else:
            new_els.append(create_element_wrapper(node, value=new_el))
    if hasattr(node, "args"):
        return node.with_changes(args=new_els)
    return node.with_changes(elements=new_els)


def update_elements(
    node: T,
    elements: List[cst.BaseExpression]
    | List[Tuple[cst.BaseExpression, cst.BaseExpression]],
    allow_extra: bool = False,
) -> T:
    """Update the elements of a collection-type node (`List`, `Dict`, `Call`, etc.).

    Preserves existing ordering and formatting, inserts indent markers for `format_node`.

    Args:
        node: Collection node whose elements are to be updated.
        elements: The new elements in the desired order.
        allow_extra: Whether to keep elements after the index of the last inserted element.
                    Defaults to False.

    Retuns:
        T: The updated node.
    """
    node_elements = node.args if hasattr(node, "args") else node.elements
    new_els = []
    for i, el in enumerate(elements):
        if isinstance(el, tuple):
            wrapper_args = {"key": el[0], "value": el[1]}
        else:
            wrapper_args = {"value": el}
        if i < len(node_elements):
            new_els.append(node_elements[i].with_changes(**wrapper_args))
        else:
            new_els.append(create_element_wrapper(node, **wrapper_args))
    if allow_extra:
        new_els.extend(node_elements[len(elements) :])
    if hasattr(node, "args"):
        return node.with_changes(args=new_els)
    return node.with_changes(elements=new_els)


CST_ELEMENT_WRAPPERS = {
    cst.Dict: cst.DictElement,
    cst.List: cst.Element,
    cst.Set: cst.Element,
    cst.Tuple: cst.Element,
    cst.Call: cst.Arg,
}


def create_element_wrapper(
    collection_node: cst.BaseExpression, **wrapper_args
) -> cst.BaseExpression:
    """Create an appropriate element wrapper (eg. `Element` for `List`, `Arg` for `Call`)"""
    if isinstance(collection_node, cst.Call) and "key" in wrapper_args:
        wrapper_args["keyword"] = wrapper_args["key"]
        del wrapper_args["key"]
    return CST_ELEMENT_WRAPPERS[type(collection_node)](**wrapper_args)


def get_node_value(node: cst.BaseExpression) -> str | cst.BaseExpression:
    """Try getting the (raw_)value of a CST node."""
    if hasattr(node, "raw_value"):
        return node.raw_value
    elif hasattr(node, "value"):
        return node.value
    return node


def node_values_match(node1: cst.BaseExpression, node2: cst.BaseExpression) -> bool:
    """Tries matching two CST nodes by their (raw_)value, falls back to deep_equals.

    Useful for matching simple nodes that might have non-significant differences.

    Example:
        >>> node_values_match(cst.SimpleString('r"asd"'), cst.SimpleString("'asd'"))
        True
    """
    if type(node1) == type(node2):
        val1 = get_node_value(node1)
        val2 = get_node_value(node2)
        return val2 == val1 or node1.deep_equals(node2)
    return False


def format_node(
    node: T,
    module: cst.Module,
    base_indent: str,
    has_trailing_comma: bool,
) -> T:
    """Updates collection node formatting according to arguments, expands collection
    if it exceeds 80 characters.

    Indent needs to be added with this function, because LibCST considers indent inside
    collections to be "extra_whitespace", so it is not added/updated automatically.

    Args:
        node (T): Collection node to be formatted.
        module (cst.Module): Parsed CST module that owns this node. Required for checking
                            line lenghts and inferred formatting defaults.
        base_indent (str): The indentation level of the whole collection.
        has_trailing_comma (bool): Whether to add a trailing comma to the last element.
                                   Call has_trailing_comma before updating the elements and pass
                                   the value here.

    Returns:
        T: The formatted node
    """
    default_indent = module.default_indent
    max_line_len = max(len(line) for line in module.code_for_node(node).splitlines())
    should_expand = is_expanded(node) or max_line_len > 80
    # Enclosing whitespace
    if should_expand:
        lws = left_ws(node)
        if isinstance(lws, cst.ParenthesizedWhitespace):
            lws = lws.with_changes(
                indent=True,
                last_line=cst.SimpleWhitespace(
                    offset_indent(base_indent, +1, default_indent)
                ),
            )
        else:
            lws = cst.ParenthesizedWhitespace(
                indent=True,
                last_line=cst.SimpleWhitespace(
                    offset_indent(base_indent, +1, default_indent)
                ),
            )

        rws = right_ws(node)
        if isinstance(rws, cst.ParenthesizedWhitespace):
            rws = rws.with_changes(
                indent=True, last_line=cst.SimpleWhitespace(base_indent)
            )
        else:
            rws = cst.ParenthesizedWhitespace(
                indent=True, last_line=cst.SimpleWhitespace(base_indent)
            )
    else:
        lws = cst.SimpleWhitespace("")
        rws = cst.SimpleWhitespace("")
    # Whitespace between elements
    new_elements = []
    for el in node.elements:
        if el.comma != cst.MaybeSentinel.DEFAULT:
            if should_expand:
                if isinstance(el.comma.whitespace_after, cst.ParenthesizedWhitespace):
                    comma_ws = el.comma.whitespace_after
                else:
                    comma_ws = cst.ParenthesizedWhitespace()
                new_comma = el.comma.with_changes(
                    whitespace_after=comma_ws.with_changes(
                        indent=True,
                        last_line=cst.SimpleWhitespace(
                            offset_indent(base_indent, +1, default_indent)
                        ),
                    )
                )
            else:
                new_comma = cst.Comma(whitespace_after=cst.SimpleWhitespace(" "))
            new_elements.append(el.with_changes(comma=new_comma))
        else:
            new_elements.append(el)
    if len(new_elements) > 0:
        new_elements[-1] = new_elements[-1].with_changes(
            comma=cst.Comma() if has_trailing_comma else cst.MaybeSentinel.DEFAULT
        )
    if isinstance(node, cst.List):
        return node.with_changes(
            elements=new_elements,
            lbracket=node.lbracket.with_changes(whitespace_after=left_ws),
            rbracket=node.rbracket.with_changes(whitespace_before=right_ws),
        )
    else:
        return node.with_changes(
            elements=new_elements,
            lbrace=node.lbrace.with_changes(whitespace_after=left_ws),
            rbrace=node.rbrace.with_changes(whitespace_before=right_ws),
        )


def has_trailing_comma(node: CollNode) -> bool:
    if len(node.elements) > 0:
        return node.elements[-1].comma != cst.MaybeSentinel.DEFAULT
    return False


def left_ws(node: CollNode) -> cst.BaseParenthesizableWhitespace:
    if isinstance(node, cst.Dict):
        return node.lbrace.whitespace_after
    else:
        return node.lbracket.whitespace_after


def right_ws(node: CollNode) -> cst.BaseParenthesizableWhitespace:
    if isinstance(node, cst.Dict):
        return node.rbrace.whitespace_after
    else:
        return node.rbracket.whitespace_after


def is_expanded(node: CollNode) -> bool:
    return len(m.findall(left_ws(node), m.Newline())) > 0


def get_collection_indent(node: CollNode) -> str:
    if is_expanded(node) and isinstance(left_ws(node), cst.ParenthesizedWhitespace):
        return left_ws(node).last_line.value
    return ""


def offset_indent(indent: str, offset: int, default_indent: str) -> str:
    if offset < 0:
        return indent.replace(default_indent, "", abs(offset))
    else:
        return indent + (default_indent * offset)
