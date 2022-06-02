import { FC, useRef, useState } from "react";
import useSize from "@react-hook/size";
import { Graph, Mode } from "../types";
import FloatingNode from "./FloatingNode";
import useLayout from "./useLayout";
import Edge from "./Edge";

const zoomSpeed = 0.99;
const maxZoom = 1;
const minZoom = 0.1;

const Canvas: FC<{
  graph: Graph;
  mode: Mode;
  selectedNodeId?: string;
  onSelectNode: (id: string) => void;
  onChangeMode: (mode: Mode) => void;
}> = ({ graph, mode, selectedNodeId, onChangeMode, onSelectNode }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const nodePositions = useLayout(graph);
  const [pan, setPan] = useState([0, 0]);
  const [zoom, setZoom] = useState(1);

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
        className="h-full w-full"
        style={{
          transform: `translate(${pan[0]}px, ${pan[1]}px) scale(${zoom})`,
        }}
      >
        <svg
          version="1.1"
          baseProfile="full"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full top-0 left-0 absolute"
          style={{ zIndex: -1 }}
        >
          {graph.edges.map(({ fromId, toId }) => (
            <Edge fromNodePos={nodePositions.get(fromId)!} toNodePos={nodePositions.get(toId)!} />
          ))}
        </svg>
        {graph.nodes.map((node) => (
          <FloatingNode
            key={node.id}
            x={nodePositions.get(node.id)![0]}
            y={nodePositions.get(node.id)![1]}
            node={node}
            selected={node.id === selectedNodeId}
            onClick={() => onSelectNode(node.id)}
            onClickAdd={() => onChangeMode(Mode.ADD)}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
