import { useState } from "react";
import Autocomplete from "./autocomp/Autocomplete";
import Canvas from "./canvas/Canvas";
import useGraph from "./canvas/useGraph";
import { Mode, GNode, Turn } from "./types";

function App() {
  const { graph, addNode } = useGraph({
    edges: [],
    nodes: [
      { id: "start", label: "Start Node", properties: [], turn: Turn.BOT },
    ],
  });
  const [selectedNode, setSelectedNode] = useState<GNode>();
  const [mode, setMode] = useState<Mode>(Mode.DEFAULT);

  // const nextCol = () => (
  //   currentCol >= cols.length - 1 && setCols((c) => [...c, []]),
  //   setCurrentCol((c) => c + 1)
  // );

  return (
    <div className="h-full flex flex-col bg-#dadbde ">
      <div className="w-70 ml-a p-2 p-t-5 p-b-5">
        {selectedNode && mode === Mode.ADD && (
          <Autocomplete
            previousProps={selectedNode.properties}
            turn={selectedNode.turn}
            onEnter={(newNode) => addNode(newNode, selectedNode.id)}
          />
        )}
      </div>

      <Canvas
        graph={graph}
        mode={mode}
        selectedNodeId={selectedNode?.id}
        onChangeMode={setMode}
        onSelectNode={(selId) =>
          setSelectedNode(graph.nodes.find(({ id }) => id === selId))
        }
      />
    </div>
  );
}

export default App;
