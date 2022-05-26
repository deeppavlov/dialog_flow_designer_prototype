import { nanoid } from "nanoid";
import { useState } from "react";
import { Graph, GNode, NewNode } from "../types";

const useGraph = (intialGraph: Graph) => {
  const [graph, setGraph] = useState<Graph>(intialGraph);
  const addNode = (node: NewNode, fromId: string) => {
    const id = nanoid();
    const newNode: GNode = { id, ...node };
    setGraph(({ edges, nodes }) => ({
      edges: [...edges, { fromId, toId: id }],
      nodes: [...nodes, newNode],
    }));
  };

  return { graph, addNode };
};

export default useGraph;
