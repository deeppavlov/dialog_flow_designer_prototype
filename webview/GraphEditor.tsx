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
    // sendAction({
    //   type: "add",
    //   payload: {
    //     parentId: data.label,
    //     parentFlow: data.flow,
    //   },
    // });
  };
  return (
    <NodeCont color="blue" className="selectable">
      <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
      {data.label}
      <Handle type="source" position={Position.Right} id="a" style={{ background: "#555" }} />
      <div className={iconContClass}>
        <FcPlus size="2em" style={{ cursor: "pointer" }} onClick={onAdd} />
      </div>
    </NodeCont>
  );
}

function ConditionNode({ id, data }: { id: string; data: any }) {
  return (
    <NodeCont color="yellow" className="selectable">
      <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
      {data.label}
      <Handle type="source" position={Position.Right} id="a" style={{ background: "#555" }} />
    </NodeCont>
  );
}

const nodeTypes: NodeTypesType = {
  response: ResponseNode,
  condition: ConditionNode,
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

const NodeCont = styled("div")<{ color: string }>(({ color }) => ({
  position: "relative",
  borderRadius: "5px",
  backgroundColor: "white",
  padding: "10px 20px",
  borderTop: "solid 5px " + color,
  textAlign: "center",
  boxShadow: "0 0 7px 2px rgba(0.5, 0.5, 0.5, 0.2)",

  [`&:hover > .${iconContClass}`]: {
    display: "flex",
  },
}));

export default GraphEditor;
