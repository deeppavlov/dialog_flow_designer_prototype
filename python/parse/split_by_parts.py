import parse.get_hash as gh


class PlotSplitter(object):
    def __init__(self, init_plots, imports_dict=None, plot_defs=None, defs_cache=None):
        self.init_plots = init_plots
        self.plot_defs = plot_defs
        self.defs_cache = defs_cache
        self.defs_names = dict()

        self.imports_dict = imports_dict
        self.flow_node_pairs = dict()
        self.defs_dict = dict()
        self.plots = dict()  # {plot_id: [flow_ids]}
        self.flows = dict()
        self.miscs = dict()
        self.transitions = dict()
        self.responses = dict()
        self.processings = dict()
        self.nodes = dict()
        self.linking = dict()

    def get_transition_ids(self, transitions_seq):
        transition_ids = [transition_dict["transition_id"] for transition_dict in transitions_seq]
        return transition_ids

    def get_response_id(self, response_dict):
        return response_dict["response_id"]

    def get_processing_id(self, processing_dict):
        return processing_dict["proc_id"]

    def get_misc_id(self, misc_dict):
        return misc_dict["misc_id"]

    def generate_linking(self, func_object, parent_linking=None):
        linking_id = gh.get_linking_id()
        linking_item = dict()
        func_name = func_object["func_name"]

        try:
            func_id = self.defs_names[func_name]
        except:
            print(f"Function name {func_name} is not defined!")
            exit()

        linking_item["object"] = func_id
        if parent_linking is not None:
            linking_item["parent"] = parent_linking

        if func_object.get("output", False):
            args, kwargs = self.process_args_kwargs_list(func_object["output"], parent_linking=linking_id)
            if len(args):
                linking_item["args"] = args
            if len(kwargs):
                linking_item["kwargs"] = kwargs

        self.linking.update({linking_id: linking_item})
        return linking_id

    def process_args_kwargs_list(self, output, parent_linking=None):
        if isinstance(output, str):
            return [output], {}
        args = []
        kwargs = {}
        for arg in output:
            if isinstance(arg, dict) and arg.get("func_name", False):
                if arg.get("output", False):
                    obj = self.generate_linking(arg, parent_linking)
                else:
                    obj = self.defs_names[arg["func_name"]]
                if arg.get("kwarg_name", False):
                    kwargs.update({arg["kwarg_name"]: obj})
                else:
                    args.append(obj)
            elif isinstance(arg, dict) and arg.get("output", False):
                args_, kwargs_ = self.process_args_kwargs_list(arg["output"], parent_linking)
                if arg.get("kwarg_name", False):
                    kwargs.update({arg["kwarg_name"]: args_})
                else:
                    args.append(args_)
            else:
                args.append(arg)
        return args, kwargs

    def generate_transition_item(self, transitions):
        for transition in transitions:
            dest = transition["dest"]
            cond = transition["condition"]
            id = transition["transition_id"]

            priority = None
            transition_item = dict()
            if dest.get("flow", None) and dest.get("node", None):
                label = self.flow_node_pairs[(dest["flow"], dest["node"])]
                transition_item["label"] = label
                if dest.get("priority"):
                    priority = float(dest["priority"])
                    transition_item["priority"] = priority
            # transition is a lbl of func object
            else:
                label = self.generate_linking(dest)
                transition_item["label"] = label
            transition_item["condition"] = self.generate_linking(cond)
            self.transitions.update({id: transition_item})

    def generate_response_item(self, response):
        id = response["response_id"]
        if response.get("func_name", None):
            obj = self.generate_linking(response)
        else:
            obj = response["output"]
        self.responses.update({id: {"response_object": obj}})

    def generate_processing_item(self, processing):
        id = processing["proc_id"]
        # this is dict
        if all("proc_name" in proc for proc in processing["proc_object"]):
            proc_list = []
            for obj in processing["proc_object"]:
                proc_list.append({obj["proc_name"]: self.generate_linking(obj["proc_object"])})
            self.processings.update({id: {"items": proc_list}})
        # this is callable
        else:
            proc_object = self.generate_linking(processing["proc_object"][0]["proc_object"])
            self.processings.update({id: {"items": proc_object}})

    def generate_misc_item(self, misc):
        id = misc["misc_id"]
        misc_object = eval(misc["misc_object"])
        self.miscs.update({id: {"items": misc_object}})

    def process_node(self, node_dict: dict):
        node = dict(type=node_dict["type"])
        if (
            node_dict.get("node_name", None)
            and node_dict["node_name"] != "LOCAL"
            and node_dict["node_name"] != "GLOBAL"
        ):
            node["name"] = node_dict["node_name"]
        if node_dict.get("transitions", None):
            node["transitions"] = self.get_transition_ids(node_dict["transitions"])
            # list, inside it - dict(dest, condition, transition_id)
            self.generate_transition_item(node_dict["transitions"])
        if node_dict.get("response", None):
            node["response"] = self.get_response_id(node_dict["response"])
            self.generate_response_item(node_dict["response"])
        if node_dict.get("processing", None):
            node["processing"] = self.get_processing_id(node_dict["processing"])
            self.generate_processing_item(node_dict["processing"])
        if node_dict.get("misc", None):
            node["misc"] = self.get_misc_id(node_dict["misc"])
            self.generate_misc_item(node_dict["misc"])
        self.nodes.update({node_dict["node_id"]: node})

    def process_defs(self):
        if self.plot_defs is None:
            return
        self.defs_cache = {} if self.defs_cache is None else self.defs_cache
        for def_name in self.plot_defs:
            if def_name not in self.defs_cache:
                self.defs_cache[def_name] = {"name": def_name}
        # generate ids
        defs_keys = list(self.defs_cache.keys())
        for name in defs_keys:
            def_id = gh.get_def_id()
            self.defs_cache[def_id] = self.defs_cache.pop(name)
        self.defs_names = {v["name"]: k for k, v in self.defs_cache.items()}

    # for transitions
    def generate_flow_node_pairs(self):
        for flows in self.init_plots.values():
            for flow in flows:
                if not flow.get("flow_name", None):
                    continue
                flow_name = flow["flow_name"]
                for node in flow["nodes"]:
                    node_name = node["node_name"]
                    node_id = node["node_id"]
                    self.flow_node_pairs.update({(flow_name, node_name): node_id})

    def process_plots(self):
        self.process_defs()
        self.generate_flow_node_pairs()
        for plot_name, flows in self.init_plots.items():
            plot_id = gh.get_plot_id()
            self.plots[plot_id] = {"name": plot_name, "flows": []}
            # loop by flow list (special case: global occured, should be processed as node)
            for flow in flows:
                node_list = []
                # this is global
                if not flow.get("flow_name", None):
                    node_list.append(flow["node_id"])
                    self.process_node(flow)
                else:
                    flow_id = flow["flow_id"]
                    flow_name = flow["flow_name"]
                    self.plots[plot_id]["flows"].append(flow_id)
                    for node in flow["nodes"]:
                        node_id = node["node_id"]
                        node_list.append(node_id)
                        self.process_node(node)
                    self.flows.update({flow_id: {"name": flow_name, "nodes": node_list}})
        return dict(
            imports=self.imports_dict,
            py_defs=self.defs_cache,
            plots=self.plots,
            flows=self.flows,
            nodes=self.nodes,
            transitions=self.transitions,
            responses=self.responses,
            linking=self.linking,
            processings=self.processings,
            miscs=self.miscs,
        )
