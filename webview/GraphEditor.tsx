import React from "react";
import ReactFlow, {
  ReactFlowProvider,
  ConnectionLineType,
} from "react-flow-renderer";

import { useGraphElements, useMessage } from "./hooks";

function GraphEditor() {
  const { handlers, elements } = useGraphElements();
  useMessage({ ...handlers });

  return (
    <div className="graph">
      <ReactFlowProvider>
        <ReactFlow
          elements={elements}
          connectionLineType={ConnectionLineType.SmoothStep}
        />
      </ReactFlowProvider>
    </div>
  );
}

export default GraphEditor;
