import { FC } from "react";

const nodeWidth = 160;
const nodeHeight = 69;
const curve = 30;

const Edge: FC<{ fromNodePos: [number, number]; toNodePos: [number, number] }> = ({
  fromNodePos,
  toNodePos,
}) => {
  const fromX = fromNodePos[0] + nodeWidth;
  const fromY = fromNodePos[1] + nodeHeight / 2;
  const toX = toNodePos[0];
  const toY = toNodePos[1] + nodeHeight / 2;
  return (
    <path
      style={{
        fill: "transparent",
        stroke: "grey",
        strokeWidth: "1",
        shapeRendering: "geometricPrecision",
      }}
      d={`M ${fromX} ${fromY} C ${fromX + curve} ${fromY}, ${toX - curve} ${toY}, ${toX} ${toY}`}
      //   d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
    ></path>
  );
};

export default Edge;
