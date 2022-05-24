export enum NodeType {
  GLOBAL = "global",
  LOCAL = "local",
  REGULAR = "regular",
}

export interface Plot {
  imports: {
    [id: string]: {
      name: string;
      code: string;
      comment?: string;
    };
  };

  py_defs: {
    [id: string]: {
      name: string;
      code?: string;
    };
  };

  plots: {
    [id: string]: {
      name: string;
      flows: string[];
    };
  };

  flows: {
    [id: string]: {
      name: string;
      nodes: string[];
    };
  };

  nodes: {
    [id: string]: {
      type: NodeType;
      name?: string;
      transitions?: string[];
      response?: string;
      processing?: string;
      misc?: string;
    };
  };

  transitions: {
    [id: string]: {
      label: string;
      priority?: number;
      condition: string;
    };
  };

  responses: {
    [id: string]: {
      response_object: string;
    };
  };

  processings: {
    [id: string]: {
      items: Record<string, string>[];
    };
  };

  miscs: {
    [id: string]: {
      items: Record<string, string>;
    };
  };

  linking: {
    [id: string]: {
      object: string;
      parent?: string;
      args?: string[];
      kwargs?: Record<string, string>;
    };
  };
}

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
  plot: Plot;
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
