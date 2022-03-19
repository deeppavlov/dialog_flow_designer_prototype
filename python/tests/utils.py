import black
import libcst as cst


def wrap_in_module(node: cst.BaseExpression) -> cst.Module:
    """Wrap BaseExpression into a module for printing."""
    return cst.Module([cst.SimpleStatementLine([cst.Expr(node)])])


def fmtcode(code):
    """Reproducably formats a string of python code."""
    return black.format_str(code, mode=black.Mode(magic_trailing_comma=False))
