import cn from "classnames";
import { FC } from "react";
import shallow from "zustand/shallow";
import { useStore } from "../store";
import { GNode, Mode } from "../types";
import pick from "../utils/pick";
import Node from "./Node";

/**
 * Smart component, wraps {@link Node} and hooks it up to the store.
 */
const FloatingNode: FC<{ node: GNode }> = ({ node }) => {
  const { x, y } = useStore((s) => s.nodeLayoutPositions[node.id], shallow);
  const { selectedNodeId, highlightedNodes, setSelectedNodeId, setMode, hoverNode } = useStore(
    pick("selectedNodeId", "setSelectedNodeId", "setMode", "hoverNode", "highlightedNodes"),
    shallow
  );

  return (
    <div
      className={cn("absolute", highlightedNodes.has(node.id) && "ring ring-green-400")}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onClick={(ev) => (ev.stopPropagation(), setSelectedNodeId(node.id))}
      onMouseEnter={() => hoverNode(node.id)}
      onMouseLeave={() => hoverNode(null)}
    >
      <Node
        node={node}
        selected={selectedNodeId === node.id}
        onClickAdd={() => setMode(Mode.ADD)}
      />
    </div>
  );
};

export default FloatingNode;
