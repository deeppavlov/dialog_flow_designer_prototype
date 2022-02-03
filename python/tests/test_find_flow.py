import libcst as cst

from parse import find_plot

from .dff_plots import (
    code_with_plots,
    empty_plot,
    fake_plot_no_flow,
    fake_plot_no_transitions,
    plot_with_misc_only,
    plot_with_processing_only,
    plot_with_response_only,
    simple_plot,
)


def test_finds_simple_plot():
    src = code_with_plots(simple_plot)
    tree = cst.parse_module(src)
    plot = find_plot(tree)
    assert plot is not None
    assert tree.code_for_node(plot) == simple_plot


def test_finds_plot_without_transition_but_valid_keys():
    src_plots = [
        plot_with_response_only,
        plot_with_processing_only,
        plot_with_misc_only,
    ]
    for plot in src_plots:
        src = code_with_plots(plot)
        tree = cst.parse_module(src)
        found_plot = find_plot(tree)
        print(src)
        assert found_plot is not None
        assert tree.code_for_node(found_plot) == plot


def test_does_not_find_plot_with_invalid_keys():
    src = code_with_plots(fake_plot_no_transitions)
    tree = cst.parse_module(src)
    plot = find_plot(tree)
    assert plot is None


def test_does_not_find_plot_where_plot_is_not_a_dict():
    src = code_with_plots(fake_plot_no_flow)
    tree = cst.parse_module(src)
    plot = find_plot(tree)
    assert plot is None


def test_finds_correct_plot_among_incorrect_ones():
    src = code_with_plots(fake_plot_no_flow, simple_plot, fake_plot_no_transitions)
    tree = cst.parse_module(src)
    plot = find_plot(tree)
    assert plot is not None
    assert tree.code_for_node(plot) == simple_plot


def test_from_multiple_correct_plots_it_returns_the_first():
    src = code_with_plots(
        fake_plot_no_flow, simple_plot, empty_plot, fake_plot_no_transitions
    )
    tree = cst.parse_module(src)
    plot = find_plot(tree)
    assert plot is not None
    assert tree.code_for_node(plot) == simple_plot
