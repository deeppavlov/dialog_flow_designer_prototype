import { FC } from "react";
import { Graph, Mode } from "../types";

import Node from "./Node";
import useLayout from "./useLayout";

const Canvas: FC<{
  graph: Graph;
  mode: Mode;
  selectedNodeId?: string;
  onSelectNode: (id: string) => void;
  onChangeMode: (mode: Mode) => void;
}> = ({ graph, mode, selectedNodeId, onChangeMode, onSelectNode }) => {
  const cols = useLayout(graph);

  return (
    <div className="h-full flex-1 flex">
      {/* <div className="h-0 flex-1"></div> */}
      {cols.map((nodes, idx) => (
        <div
          key={idx}
          className="w-70 overflow-y-auto flex flex-col justify-center"
        >
          {nodes.map((node, idx) => (
            <Node
              key={idx}
              node={node}
              selected={node.id === selectedNodeId}
              onClick={() => onSelectNode(node.id)}
              onClickAdd={() => onChangeMode(Mode.ADD)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Canvas;
