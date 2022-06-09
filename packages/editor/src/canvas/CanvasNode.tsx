import cn from "classnames";
import { FC, useEffect, useState } from "react";
import shallow from "zustand/shallow";
import { useStore } from "../store";
import { GNode, Mode, XY } from "../types";
import pick from "../utils/pick";
import Node from "./Node";

/**
 * Smart component, wraps {@link Node} and hooks it up to the store.
 */
const CanvasNode: FC<{ node: GNode }> = ({ node }) => {
  const { x: baseX, y: baseY } = useStore((s) => s.nodeLayoutPositions[node.id], shallow);
  const { x: dragX = 0, y: dragY = 0 } = useStore(
    (s) => s.nodeOffsets[node.id] ?? ({} as Partial<XY>),
    shallow
  );
  const { selectedNodeId, highlightedNodes, setSelectedNodeId, setMode, hoverNode, addNodeOffset } =
    useStore(
      pick(
        "selectedNodeId",
        "setSelectedNodeId",
        "setMode",
        "addNodeOffset",
        "hoverNode",
        "highlightedNodes"
      ),
      shallow
    );

  const [isDragging, setDragging] = useState(false);
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (ev: MouseEvent) =>
      addNodeOffset(node.id, { x: ev.movementX, y: ev.movementY });
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    // Only need to update when dragging starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const x = baseX + dragX;
  const y = baseY + dragY;

  return (
    <div
      className={cn("absolute", highlightedNodes.has(node.id) && "ring ring-green-400")}
      style={{ transform: `translate(${x}px, ${y}px)`, cursor: "grab" }}
      onDoubleClick={() => setSelectedNodeId(node.id)}
      onMouseEnter={() => hoverNode(node.id)}
      onMouseLeave={() => hoverNode(null)}
      // Keep it from bubbling up to the canvas and trigger pan
      onMouseDown={(ev) => (ev.stopPropagation(), setDragging(true))}
    >
      <Node
        node={node}
        selected={selectedNodeId === node.id}
        onClickAdd={() => setMode(Mode.ADD)}
      />
    </div>
  );
};

export default CanvasNode;
