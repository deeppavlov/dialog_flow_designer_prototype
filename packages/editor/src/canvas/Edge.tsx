import { FC } from "react";
import { nodeHeight, nodeWidth } from "./useLayout";

const c = 30;

const Edge: FC<{ fromNodePos: [number, number]; toNodePos: [number, number] }> = ({
  fromNodePos,
  toNodePos,
}) => {
  const fromX = fromNodePos[0] + nodeWidth;
  const fromY = fromNodePos[1] + nodeHeight / 2;
  const toX = toNodePos[0];
  const toY = toNodePos[1] + nodeHeight / 2;

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
      }}
      d={`M ${fromX} ${fromY} ${curve}`}
    ></path>
  );
};

export default Edge;
