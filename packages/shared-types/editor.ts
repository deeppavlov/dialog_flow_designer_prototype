import type { Plot } from "./df-parser-server";

// Types shared between the editor UI and the backend (either the extension
// or Dream Builder)

/**
 * The current state of the editor view
 */
export interface EditorState {
  plot: Plot;
}

// Actions are sent from the UI to the backend

/**
 * Indicate that the newly opened view is ready to get the state
 */
interface ReadyAction {
  name: "ready";
}

/**
 * Drop an unconnected node on the canvas
 */
interface DropNodeAction {
  name: "drop_node";
}

/**
 * Add a new transition (condition) to the plot
 */
interface AddTransAction {
  name: "add_trans";
  payload: {
    sourceNodeId: string;
  };
}

/**
 * Add a new node to the plot
 */
interface AddNodeAction {
  name: "add_node";
  payload: {
    sourceTransId: string;
  };
}

/**
 * Connect an existing transition to another node, or vica versa
 */
interface ConnectTransToNodeAction {
  name: "connect_trans_to_node";
  payload: {
    sourceId: string;
    targetId: string;
  };
}

/**
 * Connect two existing nodes and create a transition in-between.
 */
interface ConnectNodeToNodeAction {
  name: "connect_node_to_node";
  payload: {
    sourceId: string;
    targetId: string;
  };
}

export type EditorAction =
  | ReadyAction
  | DropNodeAction
  | AddTransAction
  | AddNodeAction
  | ConnectTransToNodeAction
  | ConnectNodeToNodeAction;
