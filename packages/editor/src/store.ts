import shallow from "zustand/shallow";
import create, { StateCreator } from "zustand";
import { Plot } from "@dialog-flow-designer/shared-types/df-parser-server";
import { Graph, Mode, XY } from "./types";
import { getLayout } from "./utils/layout";
import { plotToGraph } from "./utils/plot";
import { MsgSub, sendMessage, useMessages } from "./messaging";
import { useCallback, useEffect } from "react";

/**
 * Global store state type
 */
export interface State {
  graph: Graph;
  /**
   * Positions resulting from the auto-layout
   */
  nodeLayoutPositions: Record<string, XY>;
  /**
   * Position offset to add to objects on top of the computed
   * layout positions. Result of dragging and etc.
   */
  nodeOffsets: Record<string, XY | undefined>;
  /**
   * ID of the selected node or transition
   */
  selectedNodeId: string | null;
  /**
   * IDs of nodes that are connected to hovered node, or an edge between them is hovered
   */
  highlightedNodes: Set<string>;
  /**
   * Concatenated IDs of edges to be highlighted, ie. `${fromId}-${toId}`
   */
  highlightedEdges: Set<string>;
  /**
   * Editor mode (eg. adding, debugging etc.)
   */
  mode: Mode;

  /**
   * Convert plot to graph and recompute layout.
   */
  setPlot: (newPlot: Plot) => void;
  setSelectedNodeId: (id: string | null) => void;
  setMode: (newMode: Mode) => void;
  /**
   * Highlight this node, its edges, and all the nodes connected to it.
   */
  hoverNode: (id: string | null) => void;
  /**
   * Hightlight the edge and the two nodes connected by it.
   */
  hoverEdge: (fromId: string | null, toId?: string | null) => void;
  /**
   * Set the offset for the given node.
   */
  addNodeOffset: (id: string, delta: XY) => void;

  /**
   * Recreates the state with default values.
   *
   * **For testing only!**
   */
  resetState: () => void;
}

const createDefaultState: StateCreator<State, [], [], State> = (set, get, api, mut) => ({
  graph: { edges: [], nodes: [] },
  nodeLayoutPositions: Object.create(null),
  nodeOffsets: Object.create(null),
  selectedNodeId: null,
  mode: Mode.DEFAULT,
  highlightedNodes: new Set(),
  highlightedEdges: new Set(),

  setPlot: (plot) => {
    const graph = plotToGraph(plot);
    const nodeLayoutPositions = getLayout(graph);
    set({ graph, nodeLayoutPositions });
  },
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setMode: (mode) => set({ mode }),
  hoverNode: (id) => {
    if (!id) return set({ highlightedNodes: new Set(), highlightedEdges: new Set() });
    const { graph } = get();
    const highlightedNodes = new Set([id]);
    const highlightedEdges = new Set([id]);
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
  },
  hoverEdge: (fromId, toId = null) => {
    if (!fromId || !toId) return set({ highlightedNodes: new Set(), highlightedEdges: new Set() });
    set({
      highlightedNodes: new Set([fromId, toId]),
      highlightedEdges: new Set([`${fromId}-${toId}`]),
    });
  },
  addNodeOffset: (id, { x, y }) => {
    const { x: oldX = 0, y: oldY = 0 } = get().nodeOffsets[id] ?? {};
    set((s) => ({
      nodeOffsets: {
        ...s.nodeOffsets,
        [id]: { x: oldX + x, y: oldY + y },
      },
    }));
  },

  resetState: () => set(createDefaultState(set, get, api, mut), true),
});

/**
 * Connect component to the global store.
 *
 * @see https://github.com/pmndrs/zustand#recipes
 */
export const useStore = create<State>(createDefaultState);

/**
 * Bind the store to backend messages and send the ready message.
 * Should be used only once, in the root component.
 */
export const useEditorMessages = () => {
  const setPlot = useStore((s) => s.setPlot);
  const handler = useCallback<MsgSub>(
    ({ data }) => {
      console.log("Got message:\n" + JSON.stringify(data, undefined, 4));
      if (data.plot) setPlot(data.plot);
      // TODO: Handle new types of state here
    },
    [setPlot]
  );
  useMessages(handler);

  // Send ready signal
  useEffect(() => {
    sendMessage({ name: "ready" });
  }, []);
};
