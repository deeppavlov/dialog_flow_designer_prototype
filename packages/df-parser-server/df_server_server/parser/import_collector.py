import copy
import libcst as cst
from .get_hash import get_hash


class ImportWithCommentsCollector(cst.CSTVisitor):
    def __init__(self):
        self.import_dict = {}
        self.header_comments = []
        self.footer_comments = []

    @staticmethod
    def collect_leading_line_comments(node):
        comments = []
        for elem in node:
            if isinstance(elem, cst.EmptyLine) and elem.comment is not None:
                comments.append(elem.comment.value)
        return comments

    def visit_Module(self, node):
        self.header_comments.extend(self.collect_leading_line_comments(node.header))
        self.footer_comments.extend(self.collect_leading_line_comments(node.footer))

    def visit_SimpleStatementLine(self, node):
        for i, elem in enumerate(node.body):
            if isinstance(elem, cst.Import):
                imports = ImportWithCommentsCollector.collect_imports(elem)
            elif isinstance(elem, cst.ImportFrom):
                imports = ImportWithCommentsCollector.collect_imports_from(elem)

            if any(isinstance(elem, import_type) for import_type in [cst.Import, cst.ImportFrom]):
                # collect comments for imports
                if i == 0:
                    self.header_comments.extend(
                        ImportWithCommentsCollector.collect_leading_line_comments(node.leading_lines)
                    )
                    if node.trailing_whitespace.comment is not None:
                        self.header_comments.append(node.trailing_whitespace.comment.value)

                comment = "\n".join(self.header_comments)
                del self.header_comments[:]

                if i == len(node.body):  # last import element occured
                    footer_comments = "\n".join(self.footer_comments)
                    comment = "\n".join([comment, footer_comments]) if len(comment) else footer_comments
                else:
                    self.header_comments = copy.deepcopy(self.footer_comments)
                del self.footer_comments[:]
                if len(comment):
                    imports[0]["comment"] = comment

                imports = {f"id#im_{get_hash()}": import_dict for import_dict in imports}
                self.import_dict.update(imports)

    @staticmethod
    def collect_imports(node):
        imports = []
        for import_alias in node.names:
            asname, import_statement = ImportWithCommentsCollector.visit_import(import_alias)
            import_dict = dict(name=asname, code=import_statement)
            imports.append(import_dict)
        return imports

    @staticmethod
    def collect_imports_from(node):
        imports = []
        full_module_name = ImportWithCommentsCollector.collect_full_module_name(node.module)
        for import_alias in node.names:
            asname, import_statement = ImportWithCommentsCollector.visit_import_from(full_module_name, import_alias)
            import_dict = dict(name=asname, code=import_statement)
            imports.append(import_dict)
        return imports

    @staticmethod
    def visit_import(node):
        full_module_name = ImportWithCommentsCollector.collect_full_module_name(node.name)
        asname = node.asname.name.value if node.asname is not None else full_module_name
        import_statement = f"import {full_module_name}"
        if asname != full_module_name:
            import_statement = f"{import_statement} as {asname}"
        return asname, import_statement

    @staticmethod
    def visit_import_from(full_module_name, node):
        asname = node.asname.name.value if node.asname is not None else node.name.value
        import_statement = f"from {full_module_name} import {node.name.value}"
        if asname != node.name.value:
            import_statement = f"{import_statement} as {asname}"
        return asname, import_statement

    @staticmethod
    def collect_full_module_name(node):
        attrs = []
        while not isinstance(node.value, str):
            attrs.insert(0, node.attr.value)
            node = node.value
        attrs.insert(0, node.value)
        full_module_name = ".".join(attrs)
        return full_module_name
