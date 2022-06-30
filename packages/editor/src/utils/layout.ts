import { useMemo } from "react";
import { nodeHeight, nodeWidth } from "../canvas/Node";
import { GNode, Graph, XY } from "../types";

// This is a basic (kinda hacky, but functional) layout algo. Might need serious rework.
// The idea is to use a osrt of constrained force-based layout: we make N iterations,
// in each we calculate our constraints (minimizing edge length and the distance between nodes in
// the same flow) then update the vertical index to change the nodes vertical position.
// Lower indices get placed higher on the canvas.

/**
 * Gap between columns (**X axis**)
 */
export const columnGap = 100;
/**
 * Gap between rows (**Y axis**)
 */
export const rowGap = 40;

/**
 * Layout nodes hold the parameters we are optimizing during layout
 */
interface LayoutNode {
  /**
   * The vertical position of this node relative to it's immediate parent.
   *
   * Not an exact coordinate or index, just used for ranking: ie. higher indices
   * come first, lower ones last.
   */
  verticalIndex: number;
}

/**
 * The weight of edge lengths (think of it as spring stiffness)
 */
const K = 0.1;
/**
 * The weight of node distances in the same flow (think of it as spring stiffness)
 */
const F = 0.01;
/**
 * Iterations to make when calculating the vertical indices
 */
const maxIter = 100;

export const getLayout = (graph: Graph) => {
  const { nodes, edges } = graph;

  /**
   * Map node IDs to nodes
   */
  const nodeMap = new Map<string, GNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  /**
   * Map of node IDs to list of their children IDs
   */
  const childMap = new Map<string, string[]>();
  edges.forEach(({ fromId, toId }) => {
    // It's a weird parser thing, sometimes edges lead nowhere
    if (!nodeMap.has(toId)) return;
    if (!childMap.has(fromId)) childMap.set(fromId, []);
    childMap.get(fromId)!.push(toId);
  });

  // PHASE I.

  // Construct the containers for the vertical index
  const layoutNodes = new Map<string, LayoutNode>();
  const addLayoutNode = (id: string, verticalIndex: number, depth: number) => {
    if (layoutNodes.has(id)) return;
    layoutNodes.set(id, { verticalIndex });
    if (childMap.has(id))
      childMap.get(id)!.forEach((cid, idx) => addLayoutNode(cid, idx, depth + 1));
  };

  const firstColumn = nodes
    .filter(({ id }) => edges.every(({ toId }) => toId !== id))
    .map((n) => n.id);
  firstColumn.forEach((id, idx) => addLayoutNode(id, idx, 0));

  const edgeTension = (id: string) => {
    const connectedNodes = [
      // Outgoing
      ...(childMap.get(id) ?? []),
      // Incoming
      ...edges.filter(({ toId }) => toId === id).map((e) => e.fromId),
    ];
    const ourIdx = layoutNodes.get(id)!.verticalIndex;
    const signedYDist = connectedNodes.reduce(
      (sum, nid) => sum + (layoutNodes.get(nid)!.verticalIndex - ourIdx),
      0
    );
    const tension = signedYDist * K;
    return tension;
  };

  const flowTensions = (id: string) => {
    const flow = nodeMap.get(id)!.flow;
    const flowNodes = nodes.filter((n) => n.flow === flow && n.id !== id).map((n) => n.id);
    const ourIdx = layoutNodes.get(id)!.verticalIndex;
    const signedYDist = flowNodes.reduce(
      (sum, nid) => sum + (layoutNodes.get(nid)!.verticalIndex - ourIdx),
      0
    );
    const tension = signedYDist * F;
    return tension;
  };

  const visited = new Set<string>();
  const recurseUpdateLayoutNodes = (children = firstColumn) => {
    if (children === firstColumn) visited.clear();
    children.forEach((id) => {
      if (visited.has(id)) return;
      visited.add(id);
      // Update vertical index
      const tension = edgeTension(id) + flowTensions(id);
      layoutNodes.get(id)!.verticalIndex += tension;
      // Recurse
      if (childMap.has(id)) recurseUpdateLayoutNodes(childMap.get(id));
    });
  };

  for (let i = 0; i < maxIter; i++) {
    recurseUpdateLayoutNodes();
  }

  const sortByVertIdx = (nodes: string[]) => {
    const sorted = nodes.sort(
      (a, b) => layoutNodes.get(a)!.verticalIndex - layoutNodes.get(b)!.verticalIndex
    );
    return sorted;
  };

  // Regular layout

  /**
   * Final result
   */
  const positions: Record<string, XY> = Object.create(null);
  const visitedNodes = new Set<string>();

  /**
   * Call `computePostion` on each child and sum up their height, excluding the row
   * gap of the last child
   */
  const getChildrenHeight = (children: string[], nodeAboveY: number, depth = 0) =>
    Math.max(
      sortByVertIdx(children).reduce((heightUpToThisChild, childId) => {
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
    if (visitedNodes.has(id)) return 0;
    visitedNodes.add(id);
    const children = childMap.get(id) ?? [];
    const childrenHeight = getChildrenHeight(children, nodeAboveY, depth + 1);
    const x = depth * (nodeWidth + columnGap);
    const y = nodeAboveY + rowGap + Math.max(childrenHeight / 2 - nodeHeight / 2, 0);
    positions[id] = { x, y };
    return Math.max(nodeHeight, childrenHeight);
  };

  getChildrenHeight(firstColumn, 0);

  return positions;
};

export const useLayout = (graph: Graph) => useMemo(() => getLayout(graph), [graph]);
