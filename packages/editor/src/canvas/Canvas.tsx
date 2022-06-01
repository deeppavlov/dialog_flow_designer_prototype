import { FC } from "react";
import { Graph, Mode } from "../types";
import FloatingNode from "./FloatingNode";
import useLayout from "./useLayout";

const Canvas: FC<{
  graph: Graph;
  mode: Mode;
  selectedNodeId?: string;
  onSelectNode: (id: string) => void;
  onChangeMode: (mode: Mode) => void;
}> = ({ graph, mode, selectedNodeId, onChangeMode, onSelectNode }) => {
  const nodePositions = useLayout(graph);

  return (
    <div className="h-full bg-neutral-200 w-full">
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
  );
};

export default Canvas;
