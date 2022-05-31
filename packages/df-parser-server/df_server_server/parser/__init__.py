import libcst as cst
from .import_collector import ImportWithCommentsCollector
from .defs_collector import PyDefsCollector
from .plot_collector import PlotCollector
from .split_by_parts import PlotSplitter


def parse_module(module: cst.Module):
    """Parse a cst module and return a freshly parsed plot(s)

    Args:
        module (cst.Module): Module to parse

    Returns:
        PlotDict:
            Dictionary with the parsed plot. For details see
            https://github.com/kudep/dff-parser/blob/896dae2e86f5e78b75dc51bae7423394e3c21529/parser_output.yaml
    """
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
    return splitter.process_plots()


__all__ = ["parse_module"]
