export interface Graph {
  nodes: {
    type: string;
    data: object;
    position: {
      x: number;
      y: number;
    }
  }[];
  edges: {
    source: number;
    target: number;
  }[];
}

interface SetGraph {
  type: "setGraph";
  payload: {
    graph: Graph;
  };
}

export type Action = SetGraph;
