import { Children, useMemo } from "react";
import { Graph, GNode } from "../types";

const nodeWidth = 160;
const nodeHeight = 69;
const columnGap = 100;
const rowGap = 40;

const useLayout = (graph: Graph) => {
  const positions = useMemo(() => {
    const { nodes, edges } = graph;

    /**
     * Final result
     */
    const positions = new Map<string, [number, number]>();

    /**
     * Map of node IDs to list of their children IDs
     */
    const edgeMap = new Map<string, string[]>();
    edges.forEach(({ fromId, toId }) => {
      if (!edgeMap.has(fromId)) edgeMap.set(fromId, []);
      edgeMap.get(fromId)!.push(toId);
    });

    /**
     * Call `computePostion` on each child and sum up their height, excluding the row
     * gap of the last child
     */
    const getChildrenHeight = (children: string[], nodeAboveY: number, depth = 0) =>
      Math.max(
        children.reduce((heightUpToThisChild, childId) => {
          const prevChildY = nodeAboveY + heightUpToThisChild;
          return heightUpToThisChild + computePosition(childId, prevChildY, depth) + rowGap;
        }, 0) - rowGap,
        0
      );

    /**
     * Compute position of node with `id`, place results in `positions`,
     * and return bounding height of sub-tree
     */
    const computePosition = (id: string, nodeAboveY: number, depth = 0): number => {
      // If this node has already placed, act like it's not even there
      if (positions.has(id)) return 0;
      const children = edgeMap.get(id) ?? [];
      const childrenHeight = getChildrenHeight(children, nodeAboveY, depth + 1);
      const x = depth * (nodeWidth + columnGap);
      const y = nodeAboveY + rowGap + Math.max(childrenHeight / 2 - nodeHeight / 2, 0);
      positions.set(id, [x, y]);
      return Math.max(nodeHeight, childrenHeight);
    };

    const firstColumn = nodes
      .filter(({ id }) => edges.every(({ toId }) => toId !== id))
      .map((n) => n.id);
    getChildrenHeight(firstColumn, 0);

    return positions;
  }, [graph]);

  return positions;
};

export default useLayout;
