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
  const fromNodePos = nodeLayoutPositions[fromId];
  const toNodePos = nodeLayoutPositions[toId];

  const fromX = fromNodePos.x + nodeWidth;
  const fromY = fromNodePos.y + nodeHeight / 2;
  const toX = toNodePos.x;
  const toY = toNodePos.y + nodeHeight / 2;

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
