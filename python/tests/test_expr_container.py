import libcst as cst

from ..parse.expr_container import ExprContainer
from .utils import wrap_in_module

simple_code = 'asd.f(12, "asd", True)'
simple_serialized = {
    "exprType": "Call",
    "func": "asd.f",
    "args": [
        {
            "exprType": "Integer",
            "value": "12",
        },
        {
            "exprType": "SimpleString",
            "value": "asd",
        },
        {
            "exprType": "Name",
            "value": "True",
        },
    ],
}

complex_code = 'f(12, "asd", a, [asd.f((a, "asd"), 12)])'
complex_serialized = {
    "exprType": "Call",
    "func": "f",
    "args": [
        {
            "exprType": "Integer",
            "value": "12",
        },
        {
            "exprType": "SimpleString",
            "value": "asd",
        },
        {
            "exprType": "Name",
            "value": "a",
        },
        {
            "exprType": "List",
            "els": [
                {
                    "exprType": "Call",
                    "func": "asd.f",
                    "args": [
                        {
                            "exprType": "Tuple",
                            "els": [
                                {
                                    "exprType": "Name",
                                    "value": "a",
                                },
                                {
                                    "exprType": "SimpleString",
                                    "value": "asd",
                                },
                            ],
                        },
                        {
                            "exprType": "Integer",
                            "value": "12",
                        },
                    ],
                }
            ],
        },
    ],
}


def test_simple_serialize():
    og_node = cst.parse_expression(simple_code)
    serialized = ExprContainer(cst_node=og_node).as_dict()
    assert simple_serialized == serialized


def test_complex_serialize():
    og_node = cst.parse_expression(complex_code)
    serialized = ExprContainer(cst_node=og_node).as_dict()
    assert complex_serialized == serialized


def test_complex_deserialize():
    tg_node = cst.parse_expression("f()")
    node = ExprContainer(serialized=complex_serialized).update_node(tg_node)
    module = wrap_in_module(node)
    assert complex_code == module.code_for_node(node)


def test_simple_round_trip():
    og_node = cst.parse_expression(simple_code)

    cont1 = ExprContainer(cst_node=og_node)
    serialized = cont1.as_dict()
    serialized["func"] = "new_func"
    cont2 = ExprContainer(serialized=serialized)
    new_node = cont2.update_node(og_node)
    assert 'new_func(12, "asd", True)' == wrap_in_module(new_node).code_for_node(
        new_node
    )
    assert cont2.as_dict() == serialized


def test_nested_round_trip():
    og_node = cst.parse_expression(complex_code)

    cont1 = ExprContainer(cst_node=og_node)
    serialized = cont1.as_dict()
    serialized["args"][3]["els"][0]["args"][0]["els"][1]["value"] = "new_str"
    cont2 = ExprContainer(serialized=serialized)
    new_node = cont2.update_node(og_node)
    assert 'f(12, "asd", a, [asd.f((a, "new_str"), 12)])' == wrap_in_module(
        new_node
    ).code_for_node(new_node)
    assert cont2.as_dict() == serialized
