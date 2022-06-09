import cn from "classnames";
import { FC } from "react";
import shallow from "zustand/shallow";
import { useStore } from "../store";
import { GEdge, XY } from "../types";
import pick from "../utils/pick";
import { nodeHeight, nodeWidth } from "./Node";

const c = 30;

const Edge: FC<{ edge: GEdge }> = ({ edge: { fromId, toId } }) => {
  const { highlightedEdges, hoverEdge, nodeLayoutPositions } = useStore(
    pick("highlightedEdges", "hoverEdge", "nodeLayoutPositions"),
    shallow
  );
  const { fromNodePosX, fromNodePosY, toNodePosX, toNodePosY } = useStore((s) => {
    const { x: fromNodeDragX = 0, y: fromNodeDragY = 0 } = s.nodeOffsets[fromId] ?? {};
    const { x: toNodeDragX = 0, y: toNodeDragY = 0 } = s.nodeOffsets[toId] ?? {};
    return {
      fromNodePosX: s.nodeLayoutPositions[fromId].x + fromNodeDragX,
      fromNodePosY: s.nodeLayoutPositions[fromId].y + fromNodeDragY,
      toNodePosX: s.nodeLayoutPositions[toId].x + toNodeDragX,
      toNodePosY: s.nodeLayoutPositions[toId].y + toNodeDragY,
    };
  }, shallow);

  const fromX = fromNodePosX + nodeWidth;
  const fromY = fromNodePosY + nodeHeight / 2;
  const toX = toNodePosX;
  const toY = toNodePosY + nodeHeight / 2;

  const backlink = fromX > toX;
  const curve = backlink
    ? `h ${c} C ${fromX} ${fromY + c * 3}, ${toX} ${toY + c * 3}, ${toX - c} ${toY} h ${c}`
    : `C ${fromX + c} ${fromY}, ${toX - c} ${toY}, ${toX} ${toY}`;
  const d = `M ${fromX} ${fromY} ${curve}`;

  const highlighted = highlightedEdges.has(`${fromId}-${toId}`);

  return (
    <>
      {/* Invisible wide path for easier hovering */}
      <path
        style={{
          fill: "transparent",
          stroke: "transparent",
          strokeWidth: "20",
          pointerEvents: "stroke",
          shapeRendering: "geometricPrecision",
        }}
        d={d}
        onMouseEnter={() => hoverEdge(fromId, toId)}
        onMouseLeave={() => hoverEdge(null)}
      />

      {/* Actual visible path */}
      <path
        style={{
          fill: "transparent",
          stroke: highlighted ? "rgba(52, 211, 153)" : "grey",
          strokeWidth: highlighted ? "3" : "1",
          shapeRendering: "geometricPrecision",
          pointerEvents: "none",
        }}
        d={d}
      />
    </>
  );
};

export default Edge;
