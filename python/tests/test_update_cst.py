import libcst as cst

from ..parse import ensure_has_elements, update_elements
from .dff_plots import dslnode, flow_with_nodes
from .utils import fmtcode, wrap_in_module


def cmpcode(code, out_node):
    out_code = wrap_in_module(out_node).code_for_node(out_node)
    assert fmtcode(out_code) == fmtcode(code)


######################
# ensure_has_elements
######################


def test_just_add_key_to_dict():
    code1 = dslnode("trans", None)
    code2 = dslnode("trans", '"hello"')
    og_node = cst.parse_expression(code1)
    new_el = (cst.Name("RESPONSE"), cst.SimpleString('"hello"'))
    new_node = ensure_has_elements(og_node, [new_el], allow_extra=True)
    cmpcode(code2, new_node)


def test_add_key_dont_allow_extra():
    code1 = dslnode("trans", '"hello"')
    code2 = dslnode("trans", None)
    og_node = cst.parse_expression(code1)
    new_el = (cst.Name("TRANSITIONS"), cst.Name("trans"))
    new_node = ensure_has_elements(og_node, [new_el])
    cmpcode(code2, new_node)


def test_add_kwd_arg():
    code1 = "f(a=1, b=2)"
    og_node = cst.parse_expression(code1)
    new_el = (cst.Name("c"), cst.Integer("3"))
    new_node = ensure_has_elements(og_node, [new_el], allow_extra=True)
    cmpcode("f(a=1, b=2, c=3)", new_node)


def test_add_set_el():
    code1 = "{1, 2}"
    og_node = cst.parse_expression(code1)
    new_el = cst.Integer("3")
    new_node = ensure_has_elements(og_node, [new_el], allow_extra=True)
    cmpcode("{1, 2, 3}", new_node)


def test_update_key_keeping_extra():
    code1 = dslnode("trans", "hello")
    code2 = dslnode("trans", '"hello there"')
    og_node = cst.parse_expression(code1)
    new_el = (cst.Name("RESPONSE"), cst.SimpleString('"hello there"'))
    new_node = ensure_has_elements(og_node, [new_el], allow_extra=True)
    cmpcode(code2, new_node)


def test_update_key_dont_allow_extra():
    code1 = dslnode("trans", '"hello"')
    code2 = dslnode("trans_new", None)
    og_node = cst.parse_expression(code1)
    new_el = (cst.Name("TRANSITIONS"), cst.Name("trans_new"))
    new_node = ensure_has_elements(og_node, [new_el])
    cmpcode(code2, new_node)


def test_update_kwd_arg():
    code1 = "f(a=1, b=2)"
    og_node = cst.parse_expression(code1)
    new_els = [(cst.Name("a"), cst.Integer("1")), (cst.Name("b"), cst.Integer("4"))]
    new_node = ensure_has_elements(og_node, new_els)
    cmpcode("f(a=1, b=4)", new_node)


######################
# update_elements
######################


def test_add_list_element():
    code1 = "[a, b]"
    og_node = cst.parse_expression(code1)
    new_els = [cst.Name("a"), cst.Name("b"), cst.Name("c")]
    new_node = update_elements(og_node, new_els)
    cmpcode("[a, b, c]", new_node)


def test_add_dict_element():
    dict_code = dslnode({})
    dict_node = cst.parse_expression(dict_code)
    code1 = flow_with_nodes(dict_code)
    og_node = cst.parse_expression(code1)
    code2 = flow_with_nodes(*([dict_code] * 2))
    new_els = [
        (cst.SimpleString('"node0"'), dict_node),
        (cst.SimpleString('"node1"'), dict_node),
    ]
    new_node = update_elements(og_node, new_els)
    cmpcode(code2, new_node)


def test_add_arg():
    code1 = "f(a)"
    og_node = cst.parse_expression(code1)
    new_els = [cst.Name("a"), cst.Name("b")]
    new_node = update_elements(og_node, new_els)
    cmpcode("f(a, b)", new_node)


def test_update_just_first_list_element():
    code1 = "[a, b]"
    og_node = cst.parse_expression(code1)
    new_els = [cst.Name("b")]
    new_node = update_elements(og_node, new_els, allow_extra=True)
    cmpcode("[b, b]", new_node)


def test_update_dict_elements():
    code1 = flow_with_nodes(dslnode({}, '"hello"'), dslnode({}, '"bye"'))
    og_node = cst.parse_expression(code1)
    code2 = flow_with_nodes(dslnode({}, '"hello there"'), dslnode({}, '"see ya"'))
    new_els = [
        (
            cst.SimpleString('"node0"'),
            cst.parse_expression(dslnode({}, '"hello there"')),
        ),
        (
            cst.SimpleString('"node1"'),
            cst.parse_expression(dslnode({}, '"see ya"')),
        ),
    ]
    new_node = update_elements(og_node, new_els)
    cmpcode(code2, new_node)


def test_update_dict_keys():
    code1 = "{a: 12, b: 14}"
    og_node = cst.parse_expression(code1)
    new_els = [
        (cst.Name("a_new"), cst.Integer("12")),
        (cst.Name("b_new"), cst.Integer("14")),
    ]
    new_node = update_elements(og_node, new_els)
    cmpcode("{a_new: 12, b_new: 14}", new_node)
