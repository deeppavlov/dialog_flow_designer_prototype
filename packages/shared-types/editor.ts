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
 * Load the latest plot. Called on first load.
 */
interface LoadAction {
  name: "load";
}

/**
 * Add a new node to the plot
 */
interface AddNodeAction {
  name: "add_node";
  payload: {
    parentNodeId: string;
  };
}

export type EditorAction = LoadAction | AddNodeAction;
