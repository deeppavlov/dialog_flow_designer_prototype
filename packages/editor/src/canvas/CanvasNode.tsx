import cn from "classnames";
import { FC } from "react";
import shallow from "zustand/shallow";
import useStore, { selectNode, setMode, hoverNode, addTransToStaging, centerPoint } from "../store";
import { GNode, Mode, Turn, XY } from "../types";
import pick from "../utils/pick";
import Node, { nodeHeight, nodeWidth } from "./Node";

/**
 * Smart component, wraps {@link Node} and hooks it up to the store.
 */
const CanvasNode: FC<{ node: GNode; layoutPos: XY }> = ({
  node,
  layoutPos: { x: layoutX, y: layoutY },
}) => {
  const { selectedNodeId, highlightedNodes } = useStore(
    pick("selectedNodeId", "highlightedNodes"),
    shallow
  );

  // Handle add
  const handleClickAdd = () => {
    selectNode(node.id);
    if (node.turn === Turn.BOT) {
      // Focus node
      centerPoint({ x: layoutX + nodeWidth / 2, y: layoutY + nodeHeight / 2 });
      setMode(Mode.ADD);
    }
  };

  // <NOTE>
  // The following section implements free node dragging.
  // From a product perspective, this feature is, as of now, non-priority
  // and its values is up for debate.
  // Originally this was only implemented as a tech demo, to show that replacing
  // react-flow is possible.
  // </NOTE>

  // // Transitive update on position update
  // const nodeRef = useRef<HTMLDivElement>(null);
  // useNodePositionsEffect(
  //   ({ x, y }) => {
  //     if (!nodeRef.current) return;
  //     nodeRef.current.style.transform = `translate(${x + layoutX}px, ${y + layoutY}px)`;
  //   },
  //   node.id,
  //   [layoutX, layoutY]
  // );

  // // Handle dragging event
  // const [isDragging, setDragging] = useState(false);
  // useEffect(() => {
  //   if (!isDragging) return;
  //   const handleMove = (ev: MouseEvent) =>
  //     addNodeOffset(node.id, { x: ev.movementX / zoom, y: ev.movementY / zoom });
  //   const handleUp = () => setDragging(false);
  //   window.addEventListener("mousemove", handleMove);
  //   window.addEventListener("mouseup", handleUp);
  //   return () => {
  //     window.removeEventListener("mousemove", handleMove);
  //     window.removeEventListener("mouseup", handleUp);
  //   };
  //   // Only need to update when dragging starts
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isDragging]);

  return (
    <div
      className={cn(
        "absolute",
        highlightedNodes.has(node.id) && "ring ring-green-400"
        // isDragging && "z-10"
      )}
      style={{ transform: `translate(${layoutX}px, ${layoutY}px)` }}
      onMouseEnter={() => hoverNode(node.id)}
      onMouseLeave={() => hoverNode(null)}
    >
      <Node node={node} selected={selectedNodeId === node.id} onClickAdd={handleClickAdd} />
    </div>
  );
};

export default CanvasNode;
