import shallow from "zustand/shallow";
import create from "zustand";
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
   * Editor mode (eg. adding, debugging etc.)
   */
  mode: Mode;

  /**
   * Convert plot to graph and recompute layout.
   */
  setPlot: (newPlot: Plot) => void;
  setSelectedNodeId: (id: string | null) => void;
  setMode: (newMode: Mode) => void;
}

/**
 * Connect component to the global store.
 *
 * @see https://github.com/pmndrs/zustand#recipes
 */
export const useStore = create<State>((set) => ({
  graph: { edges: [], nodes: [] },
  nodeLayoutPositions: Object.create(null),
  nodeOffsets: Object.create(null),
  selectedNodeId: null,
  mode: Mode.DEFAULT,

  setPlot: (plot) => {
    const graph = plotToGraph(plot);
    const nodeLayoutPositions = getLayout(graph);
    set({ graph, nodeLayoutPositions });
  },
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setMode: (mode) => set({ mode }),
}));

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
