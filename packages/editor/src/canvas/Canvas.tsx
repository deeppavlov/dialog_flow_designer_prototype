import React, { FC, useRef, useState, useEffect } from "react";
import * as Rematrix from "rematrix";
import CanvasNode from "./CanvasNode";
import Edge from "./Edge";
import cn from "classnames";
import useStore, { applyViewTransforms, endJump, useGraph } from "../store";
import shallow from "zustand/shallow";
import pick from "../utils/pick";
import { columnGap, rowGap, useLayout } from "../utils/layout";
import useResizeObserver from "use-resize-observer";
import { nodeHeight, nodeWidth } from "./Node";

const scrollSpeedModifier = 0.5;
const maxZoom = 1;
const minZoom = 0.1;

// This coloring was added last-minute for demo purposes
// It should be replaced by something more robust
const colors = ["#e9a7a1", "#ecbaa2", "#edd9a3", "#a2e2b0", "#b1c8ed", "#b3abdf", "#edc2d5"];
const colorMap = new Map<string, string>();
const colorFlow = (flowName: string) => {
  if (!colorMap.has(flowName)) {
    colorMap.set(flowName, colors[colorMap.size % colors.length]);
  }
  return colorMap.get(flowName);
};

const Canvas: FC<{ zoomWithControl?: boolean }> = ({ zoomWithControl = true }) => {
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

  // Handle control key (used for panning with mouse when held), and prevent ctrl+scroll
  // causing page level zoom
  const [ctrlHeld, setCtrlHeld] = useState(false);
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => ev.key === "Control" && setCtrlHeld(true);
    const handleKeyUp = (ev: KeyboardEvent) => ev.key === "Control" && setCtrlHeld(false);
    const preventZoom = (ev: MouseEvent) => ev.preventDefault();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("wheel", preventZoom, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("wheel", preventZoom);
    };
  }, []);
  // Just in case control was pressed/released outside of our window
  const handleMouseEnter: React.MouseEventHandler = (ev) =>
    ctrlHeld !== ev.ctrlKey && setCtrlHeld(ev.ctrlKey);

  // Handle panning with mouse
  const [isPanning, setPanning] = useState(false);
  const handleMouseMove: React.MouseEventHandler = (ev) => {
    if (isPanning && ev.buttons === 1 && ev.ctrlKey) {
      ev.preventDefault();
      ev.stopPropagation();
      applyViewTransforms(Rematrix.translate(ev.movementX, ev.movementY));
      // The window might not have had the focus when the panning started,
      // but it definitely has it now
      if (!ctrlHeld) setCtrlHeld(true);
    }
  };
  const handleMouseDown = () => setPanning(true);
  const handleMouseUp = () => setPanning(false);

  // Handle scrolling
  const handleWheel: React.WheelEventHandler = (ev) => {
    const { deltaX, deltaY, clientX, clientY } = ev;
    if ((ev.ctrlKey && zoomWithControl) || (!zoomWithControl && ev.shiftKey)) {
      // The window might not have had the focus when the panning started,
      // but it definitely has it now
      if (!ctrlHeld) setCtrlHeld(true);

      // Zooming with control/shift pressed
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
    } else {
      // Scrolling (panning)
      if (ev.shiftKey) {
        // Shift pressed -> scroll horizontally
        applyViewTransforms(Rematrix.translate(-deltaY * scrollSpeedModifier, 0));
      } else {
        applyViewTransforms(Rematrix.translate(-deltaX, -deltaY * scrollSpeedModifier));
      }
    }
  };

  return (
    <div
      ref={canvasRef}
      className="h-full bg-neutral-200 w-full overflow-hidden"
      style={{ cursor: ctrlHeld ? "move" : "default" }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
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
        {graph.nodes.map((node) => {
          const pos = nodeLayoutPositions[node.id];
          const width = nodeWidth + columnGap + 6;
          const height = nodeHeight + rowGap + 6;
          return (
            <div
              key={"bg" + node.id}
              className="absolute pointer-events-none"
              style={{
                transform: `translate(${pos.x - columnGap / 2 - 3}px, ${pos.y - rowGap / 2 - 3}px)`,
                background: `${colorFlow(node.flow)}`,
                width,
                height,
                zIndex: -2,
              }}
            ></div>
          );
        })}

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
