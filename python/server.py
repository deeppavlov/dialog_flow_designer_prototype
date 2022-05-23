# from hashlib import sha1
from typing import Dict, Optional, Tuple
import libcst as cst

from parse.defs_collector import PyDefsCollector
from parse.import_collector import ImportWithCommentsCollector
from parse.plot_collector import PlotCollector
from parse.split_by_parts import PlotSplitter


# class DfFile:
#     """Parsed python module with one or more DF plots."""

#     source: str
#     hash: str
#     change_id: int = 0
#     available_plots: List[str]

#     module: cst.Module
#     plot_nodes: Dict[str, cst.Dict]

#     def __init__(self, source: str) -> None:
#         self.source = source
#         self.hash = sha1(source.encode("UTF-8")).hexdigest()
#         self.change_id = 0
#         self.module = cst.parse_module(source)

#     def _find_and_rank_plots(self):
#         pass

#     def apply_update(self, plot: str, graph: GraphDict) -> str:
#         pass


class DfDslConverter:
    """Main service that converts between DSL and graph."""

    # parsed_files: Dict[str, DfFile]

    def __init__(self) -> None:
        self.parsed_files = {}

    def graph_to_dsl(
        self,
        filepath: str,
        source: str,
        graph: Dict,
        parent_hash_change_id: Tuple[str, str],
        plot: Optional[str] = None,
    ) -> str:
        """Update the source to match the graph given in JSON format.

        Args:
            filepath (str):
                Path to the python module being updated. Used as cache key.
            source (str):
                Source of the whole python module containing the DF plot(s).
            graph (Dict):
                The target graph in JSON-format (see schemas/graph.json).
            parent_hash_change_id (int):
                The hash of the base source and sequential id of the last
                update applied to this module.
            plot (Optional[str]):
                The name of the plot that should be updated.
                If None, the longest plot will be updated.

        Returns:
            Updated source for the entire python module.
        """
        pass

    def dsl_to_graph(
        self, filepath: str, source: str, plot: Optional[str] = None
    ) -> Dict:
        """Convert the selected plot to a JSON-format graph.

        Args:
            filepath (str):
                Path to the python module being updated. Used as cache key.
            source (str):
                Source of the whole python module containing the DF plot(s).
            plot (Optional[str]):
                The name of the plot that should be converted. If None, the
                longest plot will be selected.

        Returns:
            Graph in JSON-format (see schemas/graph.json).
        """
        module = cst.parse_module(source)

        imports = ImportWithCommentsCollector()
        defs = PyDefsCollector()
        plot_collector = PlotCollector()

        module.visit(imports)
        module.visit(defs)
        module.visit(plot_collector)

        splitter = PlotSplitter(
            plot_collector.plots,
            imports_dict=imports.import_dict,
            defs_cache=defs.defs_dict,
            plot_defs=plot_collector.defs,
        )
        output_dict = splitter.process_plots()
        return output_dict
