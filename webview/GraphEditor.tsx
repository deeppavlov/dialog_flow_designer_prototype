import React from "react";
import { styled, css } from "goober";
import { FcPlus } from "react-icons/fc";
import ReactFlow, {
  ReactFlowProvider,
  ConnectionLineType,
  Controls,
  Handle,
  Position,
  NodeTypesType,
} from "react-flow-renderer";

import { useGraphElements, useViewState, sendAction } from "./hooks";

function ResponseNode({ id, data }: { id: string; data: any }) {
  const onAdd = () => {
    sendAction({
      type: "add",
      payload: {
        parentId: data.label,
        parentFlow: data.flow,
      },
    });
  };
  return (
    <NodeCont className="react-flow__node react-flow__node-default selectable">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ background: "#555" }}
      />
      <div className={iconContClass}>
        <FcPlus size="2em" style={{ cursor: "pointer" }} onClick={onAdd} />
      </div>
    </NodeCont>
  );
}

const nodeTypes: NodeTypesType = {
  response: ResponseNode,
};

function GraphEditor() {
  const state = useViewState();
  const elements = useGraphElements(state);

  return (
    <div className="graph">
      <ReactFlowProvider>
        <ReactFlow
          elements={elements}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

const iconContClass = css({
  position: "absolute",
  top: "0",
  left: "100%",
  height: "100%",
  width: "60px",
  display: "none",
  alignItems: "center",
  justifyContent: "center",
  cursor: "default",

  "&:hover": {
    display: "flex",
  },
});

const NodeCont = styled("div")({
  position: "relative",

  [`&:hover > .${iconContClass}`]: {
    display: "flex",
  },
});

const Sidebar = styled('div')({
  position: "absolute",
  width: "350px",
  right: 0,
  top: 0,
  bottom: 0
})

export default GraphEditor;
