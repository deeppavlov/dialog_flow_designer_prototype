from json2py import json2py  # type:ignore

from .dff_plots import (
    code_with_one_flow,
    dslnode,
    func_prsd,
    grnode_str,
    grtrans,
    normalize_formatting,
    str_prsd,
)


def test_add_node():
    src = normalize_formatting(code_with_one_flow(dslnode({})))
    cond = func_prsd("cnd.regex_match", str_prsd("hello", "r"))
    update = {
        "nodes": [grnode_str("node0", "flow0"), grnode_str("node1", "flow0")],
        "transitions": [grtrans(0, 1, cond)],
    }
    out = json2py(src, update)
    expected = code_with_one_flow(
        dslnode({"node1": 'cnd.regex_match(r"hello")'}), dslnode({})
    )
    assert normalize_formatting(out) == normalize_formatting(expected)
