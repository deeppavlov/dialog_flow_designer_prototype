import { useEffect, useState } from "react";
import dagre from "dagre";
import { Elements, Position, isNode } from "react-flow-renderer";
import type { Action, Graph } from "../src/types";

type ActionHandlers = {
  [key in `on${Capitalize<Action["type"]>}`]?: (
    payload: Action["payload"]
  ) => void;
};

type UseGraphElementsReturn = {
  elements: Elements;
  handlers: Partial<ActionHandlers>;
};

export function useMessage(handlers: ActionHandlers) {
  useEffect(() => {
    window.addEventListener("message", (event) => {
      const message: Action = event.data;
      console.log('message', message)
      const handlerName = `on${message.type
        .charAt(0)
        .toUpperCase()}${message.type.slice(1)}` as keyof ActionHandlers;
      handlers?.[handlerName]?.(message.payload);
    });
  }, []);
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getElements = (graph: Graph): Elements => {
  const elements: Elements = [
    ...graph.nodes.map((node, idx) => ({
      id: `${idx}`,
      data: node.data,
      position: { x: 0, y: 0 },
    })),
    ...graph.edges.map((edge) => ({
      id: `e${edge.source}-${edge.target}`,
      source: `${edge.source}`,
      target: `${edge.target}`,
    })),
  ];

  console.log('new graph')
  console.log(elements)

  dagreGraph.setGraph({ rankdir: "LR" });

  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });

  dagre.layout(dagreGraph);

  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = Position.Left;
      el.sourcePosition = Position.Right;

      // unfortunately we need this little hack to pass a slightly different position
      // to notify react flow about the change. Moreover we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      el.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }

    return el;
  });
};

export function useGraphElements(): UseGraphElementsReturn {
  const [elements, setElements] = useState<Elements>([]);
  return {
    elements,
    handlers: {
      onSetGraph: ({ graph }) => setElements(getElements(graph)),
    },
  };
}
