import { FC, useEffect, useRef } from "react";
import shallow from "zustand/shallow";
import { hoverEdge, useStore } from "../store";
import { GEdge, XY } from "../types";
import pick from "../utils/pick";
import { nodeHeight, nodeWidth } from "./Node";

const c = 30;

const getPathD = (fromPos: XY, toPos: XY) => {
  const fromX = fromPos.x + nodeWidth;
  const fromY = fromPos.y + nodeHeight / 2;
  const toX = toPos.x;
  const toY = toPos.y + nodeHeight / 2;
  const backlink = fromX > toX;
  const curve = backlink
    ? `h ${c} C ${fromX} ${fromY + c * 3}, ${toX} ${toY + c * 3}, ${toX - c} ${toY} h ${c}`
    : `C ${fromX + c} ${fromY}, ${toX - c} ${toY}, ${toX} ${toY}`;
  const d = `M ${fromX} ${fromY} ${curve}`;
  return d;
};

const Edge: FC<{ edge: GEdge; fromLayoutPos: XY; toLayoutPos: XY }> = ({
  edge: { fromId, toId },
  fromLayoutPos,
  toLayoutPos,
}) => {
  const { highlightedEdges } = useStore(pick("highlightedEdges"), shallow);
  const highlighted = highlightedEdges.has(`${fromId}-${toId}`);

  // const hoverPathRef = useRef<SVGPathElement>(null);
  // const displayPathRef = useRef<SVGPathElement>(null);
  // const fromPosRef = useRef<XY>({ x: 0, y: 0 });
  // const toPosRef = useRef<XY>({ x: 0, y: 0 });
  // useEffect(
  //   () =>
  //     useStore.subscribe((state) => {
  //       const newFromPos = addXY(fromLayoutPos, state.nodeOffsets[fromId]);
  //       const newToPos = addXY(toLayoutPos, state.nodeOffsets[toId]);
  //       if (
  //         newFromPos.x !== fromPosRef.current.x ||
  //         newFromPos.y !== fromPosRef.current.y ||
  //         newToPos.x !== toPosRef.current.x ||
  //         newToPos.y !== toPosRef.current.y
  //       ) {
  //         const d = computePathD(fromPosRef.current, toPosRef.current);
  //         hoverPathRef.current?.setAttribute("d", d);
  //         displayPathRef.current?.setAttribute("d", d);
  //       }
  //     }),
  //   [fromId, fromLayoutPos, toId, toLayoutPos]
  // );

  return (
    <>
      {/* Invisible wide path for easier hovering */}
      <path
        style={{
          fill: "transparent",
          stroke: "transparent",
          strokeWidth: "20",
          pointerEvents: "stroke",
        }}
        d={getPathD(fromLayoutPos, toLayoutPos)}
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
        d={getPathD(fromLayoutPos, toLayoutPos)}
      />
    </>
  );
};

export default Edge;
