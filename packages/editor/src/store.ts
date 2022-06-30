import produce from "immer";
import create from "zustand";
import { Plot } from "@dialog-flow-designer/shared-types/df-parser-server";
import { GEdge, GNode, Graph, Mode, Size, Turn, XY } from "./types";
import { plotToGraph } from "./utils/plot";
import { MsgSub, sendMessage, useMessages } from "./messaging";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { nanoid } from "nanoid";
import * as Rematrix from "rematrix";
import shallow from "zustand/shallow";
import pick from "./utils/pick";

/**
 * Global store state type
 */
export interface State {
  /**
   * Editor mode (eg. adding, debugging etc.)
   */
  mode: Mode;
  /**
   * Nodes parsed from the plot
   *
   * **Do NOT use this property from components directly!**
   *
   * Use {@link useGraph} to get all visible nodes and edges.
   */
  graph: Graph;
  /**
   * Nodes which need to be displayed but are not part of the plot. Includes:
   *  - Staging transitions - transitions not yet connected to anything
   *  - GLOBAL/LOCAL transitions shown for the selected node
   *
   * **Do NOT use this property from components directly!**
   *
   * Use {@link useGraph} to get all visible nodes and edges.
   *
   * _NOTE: For now, only staging is implemented, GLOBAL/LOCAL tranistions are TBD. If they
   * are added, perhaps separating staging and GLOBALs would make sense._
   */
  virtualGraph: Graph;
  /**
   * ID of the selected node or transition
   */
  selectedNodeId: string | null;
  /**
   * Matrix representing the view transform (pan + zoom)
   */
  viewTransform: Rematrix.Matrix3D;
  /**
   * Size of the canvas (the outer, static wrapper). Used for focusing coordinates in the
   * viewport center. {@link Canvas} should make sure this value is up to date.
   */
  canvasSize: Size;
  /**
   * Indicates whether the viewport is currently "jumping", ie. programatically
   * moving with CSS transitions enabled
   */
  viewportJumping: boolean;
  /**
   * IDs of nodes that are connected to hovered node, or an edge between them is hovered
   */
  highlightedNodes: Set<string>;
  /**
   * Concatenated IDs of edges to be highlighted, ie. `${fromId}-${toId}`
   */
  highlightedEdges: Set<string>;
}

// UTILS

const emptyGraph = (): Graph => ({ nodes: [], edges: [] });

const getVisibleGraph = (graph: Graph, virtualGraph: Graph) => ({
  nodes: [...graph.nodes, ...virtualGraph.nodes],
  edges: [...graph.edges, ...virtualGraph.edges],
});

// STORE SETUP

const createDefaultState = (): State => ({
  graph: emptyGraph(),
  virtualGraph: emptyGraph(),
  viewTransform: Rematrix.identity(),
  canvasSize: { width: 0, height: 0 },
  viewportJumping: false,
  selectedNodeId: null,
  mode: Mode.DEFAULT,
  highlightedNodes: new Set(),
  highlightedEdges: new Set(),
});

/**
 * Connect component to the global store.
 *
 * @see https://github.com/pmndrs/zustand#recipes
 */
export const useStore = create<State>(createDefaultState);

// ACTIONS

const set = useStore.setState;
const get = useStore.getState;

/**
 * Set (replace) the visible nodes on the canvas. Completely resets virtual nodes.
 */
export const setGraph = (newGraph: Graph) =>
  set({
    graph: newGraph,
    virtualGraph: emptyGraph(),
  });

/**
 * Convert plot to graph and replace it on canvas.
 */
export const setPlot = (plot: Plot) => setGraph(plotToGraph(plot));

/**
 * Add a new transition to staging connected to the selected node
 */
export const addTransToStaging = () => {
  const { selectedNodeId } = get();
  if (!selectedNodeId) throw new Error("Cannot add to staging with no node selected");
  const newId = `id#tr_${nanoid(8)}`;
  set(
    produce<State>((draft) => {
      draft.virtualGraph.nodes.push({
        id: newId,
        label: "New Transition",
        properties: [],
        // TODO: fix
        flow: "noflow",
        turn: Turn.USER,
      });
      draft.virtualGraph.edges.push({
        fromId: selectedNodeId,
        toId: newId,
      });
    })
  );
};

/**
 * Create a new node connected to a staging transition,
 * dispatch both the new node and the transition to the backend,
 * and optimistically insert them in the graph.
 */
export const addNewNode = (stagingTransId: string) => {
  const newTrans = get().virtualGraph.nodes.find((n) => n.id === stagingTransId);
  if (!newTrans) throw new Error("There is no staging transition with the id " + stagingTransId);
  const sourceNodeId = get().selectedNodeId;
  if (!sourceNodeId) throw new Error("No node selected, can't add new node");
  const newNodeId = `id#nd_${nanoid(8)}`;
  // Save the transition and the response nodes
  sendMessage({
    name: "add_node",
    payload: {
      sourceNodeId,
      newNodeId: newNodeId,
      newTransId: newTrans.id,
    },
  });
  // Apply optimistic update
  const newNode: GNode = {
    id: newNodeId,
    label: "New Node",
    properties: [],
    // TODO: fix
    flow: "noflow",
    turn: Turn.BOT,
  };
  set((s) => ({
    // Remove from staging
    virtualGraph: {
      nodes: s.virtualGraph.nodes.filter((n) => n.id !== stagingTransId),
      edges: s.virtualGraph.edges.filter((e) => e.toId !== stagingTransId),
    },
    // Add to graph
    graph: {
      nodes: [...s.graph.nodes, newTrans, newNode],
      edges: [
        ...s.graph.edges,
        { fromId: sourceNodeId, toId: stagingTransId },
        { fromId: stagingTransId, toId: newNodeId },
      ],
    },
  }));
};

/**
 * Set the view transform
 *
 * @param update New transform matrix. Can be a callback producing the new matrix.
 * @param jump If enabled, animate the transition to the new transform. Defaults to false
 */
export const setViewTransform = (update: Rematrix.Matrix3D, jump = false) =>
  set({
    viewTransform: update,
    viewportJumping: jump,
  });

/**
 * Applies the given transforms to the current view transform, **from left to right**.
 */
export const applyViewTransforms = (...matrices: Rematrix.Matrix3D[]) =>
  setViewTransform(
    [get().viewTransform, ...matrices]
      .reverse() // We reverse so arguments can be given in more intuitive, l->r order
      .reduce(Rematrix.multiply)
  );

export const centerPoint = (pos: XY) => {
  // Calculate jump target
  const { width, height } = get().canvasSize;
  const x = width / 2 - pos.x;
  const y = height / 2 - pos.y;

  // Reset the transfrom, disregarding any previous pan/zoom
  setViewTransform(Rematrix.translate(x, y), true);
};
/**
 * Canvas should call this to end animated transition
 */
export const endJump = () => set({ viewportJumping: false });

/**
 * Set the selected node and reset the virtual nodes.
 */
export const selectNode = (id: string | null) =>
  set({ selectedNodeId: id, virtualGraph: emptyGraph() });

/**
 * Set the editor mode.
 */
export const setMode = (mode: Mode) => set({ mode });

/**
 * Highlight this node, its edges, and all the nodes connected to it.
 */
export const hoverNode = (id: string | null) => {
  if (!id) return set({ highlightedNodes: new Set(), highlightedEdges: new Set() });
  const graph = getVisibleGraph(get().graph, get().virtualGraph);
  const highlightedNodes = new Set([id]);
  const highlightedEdges = new Set<string>();
  graph.edges.forEach(({ fromId, toId }) => {
    if (fromId === id) {
      highlightedNodes.add(toId);
      highlightedEdges.add(`${fromId}-${toId}`);
    } else if (toId === id) {
      highlightedNodes.add(fromId);
      highlightedEdges.add(`${fromId}-${toId}`);
    }
  });
  set({ highlightedNodes, highlightedEdges });
};

/**
 * Hightlight this edge and the two nodes connected by it.
 */
export const hoverEdge = (fromId: string | null, toId: string | null = null) => {
  if (!fromId || !toId) return set({ highlightedNodes: new Set(), highlightedEdges: new Set() });
  set({
    highlightedNodes: new Set([fromId, toId]),
    highlightedEdges: new Set([`${fromId}-${toId}`]),
  });
};

/**
 * Recreate the state with default values.
 *
 * **For testing only!**
 */
export const resetState = () => set(createDefaultState(), true);

// MISC HOOKS

/**
 * Subscribe the component to the current graph state, which includes nodes from the plot
 * and all virtual and staging nodes.
 */
export const useGraph = () => {
  const { graph, virtualGraph } = useStore(pick("graph", "virtualGraph"), shallow);
  return useMemo(() => getVisibleGraph(graph, virtualGraph), [graph, virtualGraph]);
};

/**
 * Subscribe component to zoom level.
 */
export const useZoom = () => useStore((s) => s.viewTransform[0]);

/**
 * Bind the store to backend messages and send the ready message.
 * Should be used only once, in the root component.
 */
export const useEditorMessages = () => {
  const handler = useCallback<MsgSub>(({ data }) => {
    console.log("Got message:\n" + JSON.stringify(data, undefined, 4));
    if (data.plot) setPlot(data.plot);
    // TODO: Handle new types of state here
  }, []);
  useMessages(handler);

  // Send ready signal
  useEffect(() => {
    sendMessage({ name: "ready" });
  }, []);
};

export default useStore;
