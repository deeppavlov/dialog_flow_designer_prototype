import React, { FC, useRef, useState } from "react";
import * as Rematrix from "rematrix";
import CanvasNode from "./CanvasNode";
import Edge from "./Edge";
import cn from "classnames";
import useStore, { applyViewTransforms, endJump, useGraph } from "../store";
import shallow from "zustand/shallow";
import pick from "../utils/pick";
import { useLayout } from "../utils/layout";
import useResizeObserver from "use-resize-observer";

const maxZoom = 1;
const minZoom = 0.1;

const Canvas: FC = () => {
  const { viewTransform, viewportJumping } = useStore(
    pick("viewTransform", "viewportJumping"),
    shallow
  );
  const graph = useGraph();
  const nodeLayoutPositions = useLayout(graph);
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Update the canvas size in store, which is used for calculating viewport transform
  // when focusing a set point.
  useResizeObserver<HTMLDivElement>({
    ref: canvasRef,
    onResize: ({ height = 0, width = 0 }) => {
      useStore.setState({ canvasSize: { width, height } });
    },
  });

  // Handle panning
  const [isPanning, setPanning] = useState(false);
  const handleMouseMove: React.MouseEventHandler = (ev) => {
    if (!isPanning || ev.buttons !== 1) return;
    ev.preventDefault();
    ev.stopPropagation();
    applyViewTransforms(Rematrix.translate(ev.movementX, ev.movementY));
  };
  const handleMouseDown = () => setPanning(true);
  const handleMouseUp = () => setPanning(false);

  // Handle zooming
  const handleWheel: React.WheelEventHandler = (ev) => {
    const { deltaY, clientX, clientY } = ev;
    const zoom = viewTransform[/* scale */ 0];
    if (
      !viewportRef.current ||
      !canvasRef.current ||
      (zoom >= maxZoom && deltaY < 0) ||
      (zoom <= minZoom && deltaY > 0)
    )
      return;
    const zoomMul = deltaY < 0 ? 1.1 : 0.9;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = clientX - canvasRect.x;
    const mouseY = clientY - canvasRect.y;
    applyViewTransforms(
      Rematrix.translate(-mouseX, -mouseY),
      Rematrix.scale(zoomMul),
      Rematrix.translate(mouseX, mouseY)
    );
  };

  return (
    <div
      ref={canvasRef}
      className="h-full bg-neutral-200 w-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      <div
        ref={viewportRef}
        className={cn(
          "h-full w-full relative origin-top-left",
          viewportJumping && "transition-transform"
        )}
        onTransitionEnd={endJump}
        style={{
          transform: Rematrix.toString(viewTransform),
        }}
      >
        <svg
          version="1.1"
          baseProfile="full"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full top-0 left-0 absolute overflow-visible"
          style={{ zIndex: -1 }}
        >
          {graph.edges.map((e) => (
            <Edge
              key={e.fromId + e.toId}
              edge={e}
              fromLayoutPos={nodeLayoutPositions[e.fromId]}
              toLayoutPos={nodeLayoutPositions[e.toId]}
            />
          ))}
        </svg>
        {graph.nodes.map((node) => (
          <CanvasNode key={node.id} node={node} layoutPos={nodeLayoutPositions[node.id]} />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
