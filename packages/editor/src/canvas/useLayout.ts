import { useMemo } from "react";
import { Graph, GNode } from "../types";

const useLayout = (graph: Graph) => {
  const columns = useMemo(() => {
    const { nodes, edges } = graph;

    const cols: GNode[][] = [];
    // Find first column
    let lastCol = nodes.filter(({ id }) =>
      edges.every(({ toId }) => toId !== id)
    );
    cols.push(lastCol);
    while (lastCol.length > 0) {
      lastCol = edges
        // Find edges coming from the previous column
        .filter(({ fromId }) => lastCol.find(({ id }) => id === fromId))
        // Find the corresponding nodes
        .map(({ toId }) => nodes.find(({ id }) => id === toId) as GNode);
      cols.push(lastCol);
    }

    return cols;
  }, [graph]);

  return columns;
};

export default useLayout;
