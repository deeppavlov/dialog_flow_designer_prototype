import React, { useState, useRef, useEffect, useContext } from "react";
import ReactFlow, {
  Handle,
  Controls,
  Background,
  updateEdge,
  addEdge,
  removeElements,
  OnLoadParams,
  Elements,
  NodeTypesType,
  Position,
  BackgroundVariant,
  Node
} from "react-flow-renderer";
import { styled } from "goober";
import { nanoid } from "nanoid";

// import { useMenu } from "../contextMenu"
// import { useComponent, useData } from "../resourcesSlice";
// import type { Flow } from "@dp-builder/cotypes/ts/data";

interface NodeData {
  [k: string]: any;
}

const UpdateNodeDataContext = React.createContext(
  (_: string, __: NodeData) => {}
);
const ActiveComponentIdContext = React.createContext<undefined | number>(
  undefined
);

const Dropdown = ({
  options,
  onSelect,
  selected,
}: {
  options: string[];
  onSelect: (opt: string) => void;
  selected?: string;
}) => {
  if (!selected) selected = options[0];

  return (
    <select
      onChange={(ev) => onSelect(ev.target.value)}
      value={selected}
      style={{ width: "100%" }}
    >
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  );
};

const UtteranceNode = 
  ({ id, data: { selectedIntent } }: { id: string; data: NodeData }) => {
    const onDataChange = useContext(UpdateNodeDataContext);
    const compId = useContext(ActiveComponentIdContext);
    const { data: intentsData } = useData(compId, "intent");
    const intents = intentsData.map((d) => d.content);

    useEffect(() => {
      if (intentsData && !selectedIntent) {
        onDataChange(id, { selectedIntent: intentsData[0] });
      }
    }, [intentsData, selectedIntent]);

    return (
      <NodeContainer>
        <NodeTitle>User Utterance</NodeTitle>
        <Handle
          type="target"
          position={Position.Left}
          id="a"
          style={{ top: "50%", borderRadius: 0 }}
        />
        <NodeBody>
          {(intents.length > 0 && (
            <Dropdown
              options={intents.map((int) => int.name)}
              onSelect={(newOpt) =>
                onDataChange(id, { selectedIntent: newOpt })
              }
              selected={selectedIntent}
            />
          )) ||
            "No intents to select, create one"}
        </NodeBody>
        <Handle
          type="source"
          position={Position.Right}
          id="a"
          style={{ top: "50%", borderRadius: 0 }}
        />
      </NodeContainer>
    );
  }

const ApiCallNode = ({ id, data }: { id: string; data: NodeData }) => {
  const onDataChange = useContext(UpdateNodeDataContext);
  const onInputChange =
    (field: string) => (ev: React.ChangeEvent<HTMLInputElement>) =>
      onDataChange(id, { ...data, [field]: ev.target.value });

  useEffect(() => {
    if (!data.endpoint) onInputChange("");
  }, []);

  return (
    <NodeContainer>
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ top: "50%", borderRadius: 0 }}
      />

      <NodeTitle>Api Call</NodeTitle>
      <NodeBody>
        {["endpoint"].map((n) => (
          <div key={n}>
            <span>{n.charAt(0).toUpperCase() + n.slice(1)}:</span>{" "}
            <input
              type="text"
              value={data[n] || ""}
              onChange={onInputChange(n)}
              style={{ width: "100%" }}
            />
          </div>
        ))}
      </NodeBody>
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ top: "50%", borderRadius: 0 }}
      />
    </NodeContainer>
  );
};

const ResponseNode = 
  ({ id, data: { respStr } }: { id: string; data: NodeData }) => {
    const onDataChange = useContext(UpdateNodeDataContext);
    const onInputChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
      onDataChange(id, { respStr: ev.target.value });

    useEffect(() => {
      if (!respStr) onDataChange(id, { respStr: "" });
    }, []);

    return (
      <NodeContainer>
        <Handle
          type="target"
          position={Position.Left}
          id="a"
          style={{ top: "50%", borderRadius: 0 }}
        />

        <NodeTitle>Response</NodeTitle>
        <NodeBody>
          <input
            type="text"
            value={respStr || ""}
            onChange={onInputChange}
            style={{ width: "100%" }}
          />
        </NodeBody>
        <Handle
          type="source"
          position={Position.Right}
          id="b"
          style={{ top: "50%", borderRadius: 0 }}
        />
      </NodeContainer>
    );
  }
;

const nodeTypes: NodeTypesType = {
  utterance: UtteranceNode,
  apicall: ApiCallNode,
  response: ResponseNode,
};

const Palette = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <PaletteContainer>
      {Object.keys(nodeTypes).map((type) => (
        <DndNode
          key={type}
          onDragStart={(event) => onDragStart(event, type)}
          draggable
        >
          {type.replace(/^\w/, (c) => c.toUpperCase())} Node
        </DndNode>
      ))}
    </PaletteContainer>
  );
};

const getId = () => nanoid();

export default () => {
  const [elements, setElements] = useState<Elements>([]);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<OnLoadParams | null>(null);

  const {
    component,
    canTrain,
    trainingStatus,
    isFetchingTestRes,
    messages,
    interact,
    train,
    reset,
  } = useComponent("gobot");

  const {
    data: flows,
    isLoading: isLoadingFlows,
    createData: createFlow,
    updateData: updateFlow,
  } = useData(component?.id, "flow");

  useEffect(() => {
    if (!isLoadingFlows && flows.length === 0) {
      createFlow({ el: elements as Flow["el"] });
    }
    if (flows.length > 1) console.error("Too many flows!");
  }, [flows, component]);

  const currentFlowId: number | undefined = flows[0]?.id;
  const flow: typeof flows[number]["content"] | undefined = flows[0]?.content;

  useEffect(() => {
    if (flow && currentFlowId !== undefined)
      updateFlow(currentFlowId, { el: elements as Flow["el"] });
  }, [elements]);

  useEffect(() => {
    if (flow) setElements(flow.el as Elements);
  }, [flow]);

  const { show: showMenu } = useMenu<Node<any>>({
    onDelete: (node) => setElements((els) =>
      removeElements(
        els.filter(({ id }) => id === node.id),
        els
      )),
      onRename: () => {}
  })

  if (!flow || !component) return <div>Loading...</div>;

  const onElementsRemove = (elementsToRemove: any) =>
    setElements((els) => removeElements(elementsToRemove, els) as any);
  const onEdgeUpdate = (oldEdge: any, newConnection: any) =>
    setElements((els) => updateEdge(oldEdge, newConnection, els) as any);
  const onConnect = (params: any) =>
    setElements((els) => addEdge(params, els) as any);

  const onDataChange = (nodeId: string, newData: object) =>
    setElements((els) =>
      els.map((el) => {
        if (el.id === nodeId) return { ...el, data: { ...newData } };
        else return el;
      })
    );

  const onNodeDragStop = () => reactFlowInstance && setElements(reactFlowInstance.getElements())

  const onLoad = (reactFlowInstance: OnLoadParams) => {
    setReactFlowInstance(reactFlowInstance);
    // reactFlowInstance.fitView();
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event: React.DragEvent) => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData("application/reactflow");
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const id = getId();
    const newNode = {
      id,
      type,
      position,
      sourcePosition: "right",
      targetPosition: "left",
      data: {},
    } as Elements[number];

    setElements((es) => es.concat(newNode));
  };

  const handleTrain = train;
  const handleTest = (testMsg: string) =>
    interact({
      user_type: "user",
      text: testMsg,
    });

  return (
    <ColumnsContainer>
      <Column>
          <ActiveComponentIdContext.Provider value={component.id}>
            <UpdateNodeDataContext.Provider value={onDataChange}>
              <FlowWrapper ref={reactFlowWrapper}>
                <ReactFlow
                  snapToGrid
                  zoomOnScroll={false}
                  preventScrolling={false}
                  nodeTypes={nodeTypes}
                  elements={elements}
                  onLoad={onLoad}
                  onEdgeUpdate={onEdgeUpdate}
                  onConnect={onConnect}
                  onElementsRemove={onElementsRemove}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onNodeDragStop={onNodeDragStop}
                  onNodeContextMenu={showMenu}
                >
                  <Controls />
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1}
                    color="#81818a88"
                  />
                </ReactFlow>
              </FlowWrapper>
            </UpdateNodeDataContext.Provider>
          </ActiveComponentIdContext.Provider>
      </Column>

      <Column maxwidth="400px">
        <RowContainer>
          <Row>
            <Palette />
          </Row>
          <Row>
            <ColumnHeader>
              <ColumnTitle>test out the bot</ColumnTitle>
            </ColumnHeader>

            {canTrain ? (
              <_CentMsgCont>
                <button onClick={handleTrain}>Click here to train!</button>
              </_CentMsgCont>
            ) : trainingStatus === "RUNNING" ? (
              <_CentMsgCont>Training...</_CentMsgCont>
            ) : isFetchingTestRes || !messages ? (
              <_CentMsgCont>Fetching...</_CentMsgCont>
            ) : (
              <>
                <Chat>
                  {messages.map(({ user_type, text = "" }, idx) =>
                    user_type == "user" ? (
                      <ChatBubbleLeft key={idx}>
                        <ChatBubbleCont>{text}</ChatBubbleCont>
                      </ChatBubbleLeft>
                    ) : (
                      <ChatBubbleRight key={idx}>
                        <ChatBubbleContDark>{text}</ChatBubbleContDark>
                      </ChatBubbleRight>
                    )
                  )}
                </Chat>
                <ChatBottomCont>
                  <button onClick={reset}>Reset</button>
                  <ChatInput
                    type="text"
                    placeholder="Type a message here..."
                    onKeyDown={(ev) =>
                      ev.key === "Enter" &&
                      (ev.target as HTMLInputElement).value !== "" &&
                      handleTest((ev.target as HTMLInputElement).value)
                    }
                  />
                </ChatBottomCont>
              </>
            )}
          </Row>
        </RowContainer>
      </Column>
    </ColumnsContainer>
  );
};

const ChatBottomCont = styled("div")({
  display: "flex",
  flexDirection: "row",
  margin: "5px 5px 10px 5px",
});

const Chat = styled("div")({
  width: "100%",
  flex: "1 1 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  overflowY: "auto",
  position: "relative",
  marginBottom: "10px",
});

const ChatInput = styled("input")({
  height: "2rem",
  borderRadius: "5px",
  flex: 1,
  marginLeft: "5px",
});

const ChatBubbleLeft = styled("div")({
  display: "flex",
  flexDirection: "row",
  justifyContent: "start",
});

const ChatBubbleRight = styled("div")({
  display: "flex",
  flexDirection: "row",
  justifyContent: "end",
});

const ChatBubbleCont = styled("div")({
  padding: "10px",
  margin: "7px",
  borderRadius: "20px",
  maxWidth: "60%",
  border: "solid 1px #444141",
  borderBottomLeftRadius: 0,
  wordWrap: "break-word",
});

const ChatBubbleContDark = styled(ChatBubbleCont)({
  backgroundColor: "#444141",
  color: "white",
  borderBottomLeftRadius: "20px !important",
  borderBottomRightRadius: "0 !important",
});

const NodeContainer = styled("div")(({ theme }) => ({
  width: "250px",
  borderRadius: "15px",
  backgroundColor: "white",
  border: `1px solid ${theme.logoBg}`,
}));

const NodeTitle = styled("div")(({ theme }) => ({
  padding: "15px",
  width: "100%",
  textAlign: "center",
  borderRadius: "15px",
  borderBottom: `1px solid ${theme.logoBg}`,
}));

const NodeBody = styled("div")({
  padding: "10px",
  width: "100%",
});

const DndNode = styled(NodeContainer)({
  padding: "15px",
  width: "100%",
  marginBottom: "20px",
  cursor: "grab",
});

const PaletteContainer = styled("aside")({
  padding: "15px",
});

const FlowWrapper = styled(
  "div",
  React.forwardRef
)({
  width: "100%",
  height: "100%",
});

const ColumnsContainer = styled("div")({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
});

const Column = styled("div")(
  ({ maxwidth = "unset" }: { maxwidth?: string }) => ({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    maxWidth: maxwidth,
    "&:not(:last-child)": {
      borderRight: "#DDDDDD 1px solid",
    },
  })
);

const RowContainer = styled("div")({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
});

const Row = styled("div")(
  ({ maxheight = "unset" }: { maxheight?: string }) => ({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    maxHeight: maxheight,
    "&:not(:last-child)": {
      borderBottom: "#DDDDDD 1px solid",
    },
  })
);

const ColumnHeader = styled("div")({
  padding: "10px 10px",
  borderBottom: "1px solid #DDDDDD",
  display: "flex",
  alignItems: "center",
  height: "50px",
});

const ColumnTitle = styled("span")({
  fontVariant: "small-caps",
  color: "gray",
  fontWeight: "bold",
  fontSize: "1.15em",
  flexGrow: 1,
});

const _CentMsgCont = styled("div")({
  alignSelf: "stretch",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
});
