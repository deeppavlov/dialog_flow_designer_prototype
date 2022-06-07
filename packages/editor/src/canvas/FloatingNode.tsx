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
  const { selectedNodeId, setSelectedNodeId, setMode } = useStore(
    pick("selectedNodeId", "setSelectedNodeId", "setMode"),
    shallow
  );

  return (
    <div
      className="absolute"
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onClick={(ev) => (ev.stopPropagation(), setSelectedNodeId(node.id))}
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
