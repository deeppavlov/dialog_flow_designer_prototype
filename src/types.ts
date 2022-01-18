export interface Graph {
  nodes: {
    type: string;
    data: {
      label: string;
      flow: string;
    };
    position: {
      x: number;
      y: number;
    };
  }[];
  edges: {
    source: number;
    target: number;
  }[];
}

/*
 * The state passed to the webview in each message
 */
export interface ViewState {
  graph: Graph;
}

interface LoadAction {
  type: "load";
}

interface AddAction {
  type: "add";
  payload: {
    parentId: number;
    parentFlow: string;
  };
}

/*
 * The action type passed from view to the extension
 */
export type ViewAction = LoadAction | AddAction;
