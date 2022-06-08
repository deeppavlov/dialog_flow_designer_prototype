import React, { FC, useEffect, useRef, useState } from "react";
import * as Rematrix from "rematrix";
import FloatingNode from "./FloatingNode";
import { nodeHeight, nodeWidth } from "./Node";
import Edge from "./Edge";
import cn from "classnames";
import { useStore } from "../store";
import shallow from "zustand/shallow";
import pick from "../utils/pick";

const maxZoom = 1;
const minZoom = 0.1;

const Canvas: FC = () => {
  const { graph, selectedNodeId, nodeLayoutPositions } = useStore(
    pick("graph", "selectedNodeId", "nodeLayoutPositions"),
    shallow
  );

  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { nodes, edges } = graph;
  const [jumping, setJumping] = useState(false);
  const [viewTransform, setTransfrom] = useState<Rematrix.Matrix3D>(Rematrix.identity());

  /**
   * Applies the given transforms to the current transforms, **from left to right**.
   */
  const applyTransforms = (...matrices: Rematrix.Matrix3D[]) =>
    setTransfrom((prevTransform) =>
      [prevTransform, ...matrices]
        .reverse() // We reverse so arguments can be given in more intuitive, l->r order
        .reduce(Rematrix.multiply)
    );

  // Jump to selected node
  useEffect(() => {
    setTransfrom((prevTrans) => {
      if (!selectedNodeId || !viewportRef.current || !canvasRef.current) return prevTrans;
      // Get the view's offset relative to the canvas origin
      const { x: viewClientX, y: viewClientY } = viewportRef.current.getBoundingClientRect();
      const { x: canvasX, y: canvasY, width, height } = canvasRef.current.getBoundingClientRect();
      const viewXInCanvas = viewClientX - canvasX;
      const viewYInCanvas = viewClientY - canvasY;

      // Get the selected node's offset relative to the canvas origin
      const zoom = prevTrans[/* scale */ 0];
      const selectedPos = nodeLayoutPositions[selectedNodeId];
      const xInCanvas = viewXInCanvas + (selectedPos.x + nodeWidth / 2) * zoom;
      const yInCanvas = viewYInCanvas + (selectedPos.y + nodeHeight / 2) * zoom;

      // Calculate offset to jump
      const dX = width / 2 - xInCanvas;
      const dY = height / 2 - yInCanvas;
      setJumping(true);
      return [prevTrans, Rematrix.translate(dX, dY)].reverse().reduce(Rematrix.multiply);
    });
  }, [nodeLayoutPositions, selectedNodeId]);

  const handleTransitionEnd = () => setJumping(false);

  // Handle panning
  const handlePointerMove: React.PointerEventHandler = (ev) => {
    if (ev.buttons !== 1) return;
    ev.preventDefault();
    ev.stopPropagation();
    applyTransforms(Rematrix.translate(ev.movementX, ev.movementY));
  };

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
    applyTransforms(
      Rematrix.translate(-mouseX, -mouseY),
      Rematrix.scale(zoomMul),
      Rematrix.translate(mouseX, mouseY)
    );
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
        className={cn("h-full w-full relative origin-top-left", jumping && "transition-transform")}
        onTransitionEnd={handleTransitionEnd}
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
