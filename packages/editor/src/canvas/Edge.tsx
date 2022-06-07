import { FC } from "react";
import { XY } from "../types";
import { nodeHeight, nodeWidth } from "./Node";

const c = 30;

const Edge: FC<{ fromNodePos: XY; toNodePos: XY }> = ({ fromNodePos, toNodePos }) => {
  const fromX = fromNodePos.x + nodeWidth;
  const fromY = fromNodePos.y + nodeHeight / 2;
  const toX = toNodePos.x;
  const toY = toNodePos.y + nodeHeight / 2;

  const backlink = fromX > toX;
  const curve = backlink
    ? `h ${c} C ${fromX} ${fromY + c * 3}, ${toX} ${toY + c * 3}, ${toX - c} ${toY} h ${c}`
    : `C ${fromX + c} ${fromY}, ${toX - c} ${toY}, ${toX} ${toY}`;

  return (
    <path
      style={{
        fill: "transparent",
        stroke: "grey",
        strokeWidth: "1",
        shapeRendering: "geometricPrecision",
        pointerEvents: "stroke",
      }}
      className="hover:(!stroke-green-400 !stroke-2) "
      d={`M ${fromX} ${fromY} ${curve}`}
    ></path>
  );
};

export default Edge;
