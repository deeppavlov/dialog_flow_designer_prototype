import libcst as cst


class PyDefsCollector(cst.CSTVisitor):
    def __init__(self):
        self.defs_dict = {}

    def visit_FunctionDef(self, node):
        func_name = node.name.value
        func_code = cst.parse_module("").code_for_node(node)
        self.defs_dict[func_name] = dict(name=func_name, code=func_code)

    def visit_ClassDef(self, node):
        class_name = node.name.value
        class_code = cst.parse_module("").code_for_node(node)
        self.defs_dict[class_name] = dict(name=class_name, code=class_code)

    """
    def visit_Assign(self, node):
        # TODO: ensure that it is not inside class
        for target in node.targets:
            name = target.target.value
            code = cst.parse_module("").code_for_node(node)
            self.defs_dict[f"id#df_{get_hash()}"] = dict(name=name, code=code)
    """
