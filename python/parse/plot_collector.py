import libcst.matchers as m
import libcst as cst
from parse.get_hash import *


class PlotCollector(m.MatcherDecoratableVisitor):
    plots = {}
    global_ = m.DictElement(m.Name("GLOBAL"))
    local = m.DictElement(m.Name("LOCAL"))
    response = m.DictElement(m.Name("RESPONSE"))
    transitions = m.DictElement(m.Name("TRANSITIONS"))
    processing = m.DictElement(m.Name("PROCESSING"))
    misc = m.DictElement(m.Name("MISC"))
    bool_type = m.TypeOf(m.Name("True") | m.Name("False"))
    func_type = m.TypeOf(m.Call | m.Name | m.Attribute)
    defs = set()

    def are_keys_valid(self, node: cst.DictElement):
        # all keys inside node should be one of `RESPONSE`, `TRANSITIONS`, `PROCESSING`, `MISC`
        is_all_valid = all(
            m.matches(elem, m.OneOf(self.response, self.transitions, self.processing, self.misc))
            for elem in node.value.elements
        )

        if not is_all_valid:
            raise Exception("All keys should be one of `RESPONSE`, `TRANSITIONS`, `PROCESSING`, `MISC`")

        # is occurred once or never?
        for kw in (self.response, self.transitions, self.processing, self.misc):
            occur = sum(1 for elem in node.value.elements if m.matches(elem, kw))
            if occur > 1:
                raise Exception(f"Key {kw.name.value} can be used once!")

    def check_node_structure(self, node: cst.DictElement):
        self.are_keys_valid(node)
        for elem in node.value.elements:
            if m.matches(elem, self.response):
                self.check_response_structure(elem)
            elif m.matches(elem, self.transitions):
                self.check_transitions_structure(elem)
            elif m.matches(elem, self.misc):
                self.check_misc_structure(elem)
            elif m.matches(elem, self.processing):
                self.check_procs_structure(elem)
        return True

    def check_response_structure(self, node: cst.DictElement):
        if not m.matches(
            node.value, m.TypeOf(m.Dict | m.SimpleString | m.Integer | m.Float | m.Call | m.Name | m.Attribute)
        ):
            raise Exception(f"Response {node.value} is not a valid type!")

    def check_transitions_structure(self, node: cst.DictElement):
        if m.matches(node.value, m.TypeOf(m.Dict)):
            for elem in node.value.elements:
                key_condition = m.matches(
                    elem.key, m.TypeOf(m.SimpleString | m.Integer | m.Float | m.Name | m.Attribute | m.Tuple | m.Call)
                )
                if not key_condition:
                    raise Exception(f"Transition to {elem.key} is a wrong key!")
                # check if tuple has len=2 or len=3
                if m.matches(elem.key, m.TypeOf(m.Tuple)):
                    len_t = len(elem.key.elements)
                    if len_t >= 2 and len_t <= 3:
                        check_type_flow_node = any(
                            1
                            for tuple_elem in elem.key.elements[:-1]
                            if not m.matches(tuple_elem.value, m.TypeOf(m.SimpleString | m.Integer))
                        )
                        if check_type_flow_node:
                            raise Exception(f"Transition ({elem.key.elements[:-1]}) has incorrect structure!")
                        if len_t == 3:
                            check_priority_type = m.matches(elem.key.elements[-1].value, m.TypeOf(m.Integer | m.Float))
                            if not check_priority_type:
                                raise Exception(f"Priority {elem.key.elements[-1]} is not a number!")
                    else:
                        raise Exception(f"Transition to {elem.key} has incorrect structure!")
                transition_condition = m.matches(elem.value, m.TypeOf(m.Name | m.Call | m.Attribute))
                if not transition_condition:
                    raise Exception(f"Transition to {elem.key} by condition {elem.value} has wrong type!")
        else:
            raise Exception(f"{node.value} should be dict!")

    def check_misc_structure(self, node: cst.DictElement):
        dict_condition = m.matches(node.value, m.TypeOf(m.Dict | self.func_type))
        if not dict_condition:
            raise Exception(f"Misc {node.value} has wrong type!")

    def check_procs_structure(self, node: cst.DictElement):
        # should be dict of simple str, simple str
        if m.matches(node.value, m.TypeOf(m.Dict)):
            for elem in node.value.elements:
                key_condition = m.matches(elem.key, m.TypeOf(m.Integer | m.Float | m.SimpleString))
                if not key_condition:
                    raise Exception(f"Processing key {elem.key} has wrong type!")
                proc_condition = m.matches(elem.value, m.TypeOf(self.func_type))
                if not proc_condition:
                    raise Exception(f"Processing key {elem.key} has wrong value {elem.value}")
        elif m.matches(node.value, m.TypeOf(self.func_type)) and not m.matches(node.value, self.bool_type):
            pass
        else:
            raise Exception(f"Processing {node.value} has incorrect type {type(node.value)}!")

    @m.call_if_not_inside(global_)
    def check_flow_structure(self, node):
        # if this is flow, this should be DictElement with str key
        if not m.matches(node, m.TypeOf(m.DictElement)) and not m.matches(node.key, m.TypeOf(m.SimpleString | m.Name)):
            return False
        # loop by possible nodes of flow
        for elem in node.value.elements:
            # node should be a dict, its name should be str or number
            if not m.matches(elem, m.TypeOf(m.DictElement)) and not m.matches(
                elem.key, m.TypeOf(m.SimpleString | m.Name | m.Integer | m.Float)
            ):
                return False
            # this is not a node by structure, all nodes have to be dict
            if not m.matches(elem.value, m.TypeOf(m.Dict)):
                return False
            self.check_node_structure(elem)
        # if we get here, all checks were passed successfully
        return True

    @m.call_if_inside(m.Assign(value=m.TypeOf(m.Dict)))
    def visit_Assign(self, node):
        plot_dict = node.value.elements
        global_condition = sum(1 for elem in plot_dict if m.matches(elem, self.global_))
        if global_condition > 1:
            raise Exception(f"Only one `GLOBAL` can be used! ({global_condition} found)")
        # loop by plot of DictElements
        plot_name = node.targets[0].target.value.replace('"', "")
        parsed_flows = []
        for elem in plot_dict:
            if m.matches(elem, self.global_) and self.check_node_structure(elem):
                parsed_nodes = self.parse_node(elem)
            elif self.check_flow_structure(elem):
                flow_name = elem.key.value.replace('"', "")
                parsed_nodes = self.get_parsed_nodes(elem.value.elements, flow_name)
            else:
                # this is not a flow
                return
            parsed_flows.append(parsed_nodes)
        self.plots.update({plot_name: parsed_flows})

    def parse_args_kwargs(self, func_args: list):
        output_list = []
        kwarg_name = None
        for arg in func_args:
            if m.matches(arg, m.TypeOf(m.Arg)):
                kwarg_name = arg.keyword.value.replace('"', "") if arg.keyword is not None else None
                arg = arg.value
            elif m.matches(arg, m.TypeOf(m.Element)):
                arg = arg.value

            if m.matches(arg, m.TypeOf(m.ListComp)):
                res = cst.parse_module("").code_for_node(arg)
                if kwarg_name:
                    res = {"output": res}
            elif m.matches(arg, m.TypeOf(m.List | m.Set | m.Dict | m.Tuple)):
                res = {"output": self.parse_args_kwargs(arg.elements), "type": str(type(arg))}
            elif m.matches(arg, m.TypeOf(m.DictElement)):
                res = {"output": {arg.key: self.parse_args_kwargs(arg.value)}}
            elif m.matches(arg, m.TypeOf(self.func_type)):
                res = self.process_call(arg)
            elif m.matches(arg, m.TypeOf(m.SimpleString | m.Integer | m.Float)) or m.matches(arg, self.bool_type):
                res = arg.value
                if not m.matches(arg, m.TypeOf(m.SimpleString)):
                    res = res.replace('"', "")
                if kwarg_name:
                    res = {"output": res}
            # type is not defined, we will not parse it
            else:
                res = cst.parse_module("").code_for_node(arg)
                if kwarg_name:
                    res = {"output": res}
            if kwarg_name:
                res["kwarg_name"] = kwarg_name
            output_list.append(res)

        return output_list

    def generate_response(self, response):
        if m.matches(response, m.TypeOf(self.func_type)):
            response_object = self.process_call(response)
        elif m.matches(response, m.TypeOf(m.Dict)):
            output = self.parse_args_kwargs(response.elements)
            response_object = {"output": output}
        else:
            response_object = cst.parse_module("").code_for_node(response)
            response_object = {"output": response_object}
        response_object["response_id"] = get_response_id()
        return response_object

    def generate_transitions(self, transitions, current_flow=None):
        parsed_transitions = []
        for transition in transitions:
            transition_dict = {}
            # check destination structure
            if m.matches(transition.key, m.TypeOf(self.func_type)):
                transition_dict["dest"] = self.process_call(transition.key)
            elif m.matches(transition.key, m.TypeOf(m.SimpleString)):
                transition_dict["dest"] = {"flow": current_flow, "node": transition.key.value.replace('"', "")}
            elif m.matches(transition.key, m.TypeOf(m.Tuple)):
                flow = transition.key.elements[0].value.value.replace('"', "")
                node = transition.key.elements[1].value.value.replace('"', "")
                transition_dict["dest"] = {"flow": flow, "node": node}
                if len(transition.key.elements) == 3:
                    transition_dict["dest"]["priority"] = transition.key.elements[2].value.value.replace('"', "")
            # check condition structure
            if m.matches(transition.value, m.TypeOf(self.func_type)):
                transition_dict["condition"] = self.process_call(transition.value)
            else:
                raise Exception(f"Condition should be Callable! (got {type(transition.value)})")
            transition_dict["transition_id"] = get_transition_id()
            parsed_transitions.append(transition_dict)
        return parsed_transitions

    def process_call(self, node):
        if not m.matches(node, m.TypeOf(self.func_type)):
            raise Exception(f"Function call is incorrect: node should be some function! (got {type(node)})")
        full_name = cst.helpers.get_full_name_for_node(node)
        res = {"func_name": full_name}
        if m.matches(node, m.TypeOf(m.Call)) and len(node.args):
            res["output"] = self.parse_args_kwargs(node.args)
        self.defs.add(full_name)
        return res

    def generate_processing(self, processing):
        proc_seq = {"proc_id": get_processing_id(), "proc_object": []}
        if m.matches(processing, m.TypeOf(m.Dict)):
            for dict_element in processing.elements:
                key = dict_element.key.value.replace('"', "")
                if m.matches(dict_element.value, m.TypeOf(self.func_type)):
                    proc_object = self.process_call(dict_element.value)
                else:
                    proc_object = cst.parse_module("").code_for_node(dict_element.value)
                proc_seq["proc_object"].append({"proc_name": key, "proc_object": proc_object})
        else:
            proc_object = self.process_call(processing)
            proc_seq["proc_object"].append({"proc_object": proc_object, "proc_id": get_processing_id()})
        return proc_seq

    def generate_misc(self, misc):
        misc_object = cst.parse_module("").code_for_node(misc)
        return {"misc_id": get_misc_id(), "misc_object": misc_object}

    def parse_node(self, node, flow_name=None):
        node_dict = {}
        for elem in node.value.elements:
            if m.matches(elem, self.response):
                response_object = self.generate_response(elem.value)
                node_dict["response"] = response_object
            elif m.matches(elem, self.transitions):
                transitions_object = self.generate_transitions(elem.value.elements, current_flow=flow_name)
                node_dict["transitions"] = transitions_object
            elif m.matches(elem, self.processing):
                processing_object = self.generate_processing(elem.value)
                node_dict["processing"] = processing_object
            elif m.matches(elem, self.misc):
                misc_object = self.generate_misc(elem.value)
                node_dict["misc"] = misc_object
            else:
                raise Exception(f"Unknown keyword {elem.key.value} occurred!")
        node_dict["node_name"] = node.key.value.replace('"', "")
        node_dict["node_id"] = get_node_id()
        if node.key.value == "LOCAL":
            node_type = "local"
        elif node.key.value == "GLOBAL":
            node_type = "global"
        else:
            node_type = "regular"
        node_dict["type"] = node_type
        return node_dict

    def get_parsed_nodes(self, nodes: list, flow_name: str):
        parsed_flow_nodes = []
        for node in nodes:
            node_dict = self.parse_node(node, flow_name)
            parsed_flow_nodes.append(node_dict)
        flow_id = get_flow_id()
        return {"flow_id": flow_id, "flow_name": flow_name, "nodes": parsed_flow_nodes}
