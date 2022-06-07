import { FC, useEffect, useRef, useState } from "react";
import FloatingNode from "./FloatingNode";
import { nodeHeight, nodeWidth } from "./Node";
import Edge from "./Edge";
import cn from "classnames";
import { useStore } from "../store";
import shallow from "zustand/shallow";
import pick from "../utils/pick";

const zoomSpeed = 0.99;
const maxZoom = 1;
const minZoom = 0.1;

const Canvas: FC = () => {
  const { graph, selectedNodeId, nodeLayoutPositions } = useStore(
    pick("graph", "selectedNodeId", "nodeLayoutPositions"),
    shallow
  );

  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  let { nodes, edges } = graph;
  const [jumping, setJumping] = useState(false);
  const [pan, setPan] = useState([0, 0]);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!selectedNodeId || !viewportRef.current) return;
    const selectedPos = nodeLayoutPositions[selectedNodeId];
    const selectedCenterX = pan[0] + (selectedPos.x + nodeWidth / 2) * zoom;
    const selectedCenterY = pan[1] + (selectedPos.y + nodeHeight / 2) * zoom;
    const { width, height } = viewportRef.current.getBoundingClientRect();
    const dx = width / 2 - selectedCenterX;
    const dY = height / 2 - selectedCenterY;
    setJumping(true);
    setPan(([x, y]) => [x + dx, y + dY]);
  }, [selectedNodeId]);

  const handlePointerMove: React.PointerEventHandler = (ev) => {
    if (ev.buttons !== 1) return;
    ev.preventDefault();
    ev.stopPropagation();
    setPan(([x, y]) => [x + ev.movementX, y + ev.movementY]);
  };

  const handleWheel: React.WheelEventHandler = (ev) => {
    const { deltaY } = ev;
    if (
      !viewportRef.current ||
      !canvasRef.current ||
      (zoom >= maxZoom && deltaY < 0) ||
      (zoom <= minZoom && deltaY > 0)
    )
      return;

    const dZoom = Math.pow(zoomSpeed, deltaY / 10);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const viewRect = viewportRef.current.getBoundingClientRect();
    const currentCenterX = viewRect.x + canvasRect.width / 2;
    const currentCenterY = viewRect.y + canvasRect.height / 2;
    const mousePosToCurrentCenterDistanceX = ev.clientX - currentCenterX;
    const mousePosToCurrentCenterDistanceY = ev.clientY - currentCenterY;
    const dX = mousePosToCurrentCenterDistanceX * (1 - dZoom);
    const dY = mousePosToCurrentCenterDistanceY * (1 - dZoom);

    setZoom((z) => z * dZoom);
    setPan(([x, y]) => [x + dX, y + dY]);
  };

  return (
    <div
      ref={canvasRef}
      className="h-full bg-neutral-200 w-full overflow-hidden"
      onPointerMove={handlePointerMove}
      onWheel={handleWheel}
    >
      <div
        ref={viewportRef}
        className={cn("h-full w-full", jumping && "transition-transform")}
        onTransitionEnd={() => setJumping(false)}
        style={{
          transform: `translate(${pan[0]}px, ${pan[1]}px) scale(${zoom})`,
        }}
      >
        <svg
          version="1.1"
          baseProfile="full"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full top-0 left-0 absolute overflow-visible"
          style={{ zIndex: -1 }}
        >
          {edges.map((e) => (
            <Edge key={e.fromId + e.toId} edge={e} />
          ))}
        </svg>
        {nodes.map((node) => (
          <FloatingNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
