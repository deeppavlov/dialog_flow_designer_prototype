import { useEffect, useMemo, useState } from "react";
import dagre from "dagre";
import { Elements, Position, isNode } from "react-flow-renderer";
import type { ViewState, ViewAction, Graph } from "../src/types";

const vscode = acquireVsCodeApi();

export const sendAction = (a: ViewAction) => {
  vscode.postMessage(a);
};

export function useViewState(): ViewState | null {
  const [state, setState] = useState<ViewState | null>(null);
  useEffect(() => {
    const handler = (event: MessageEvent<ViewState>) => {
      setState(event.data);
    };
    window.addEventListener("message", handler);
    sendAction({ type: "load" });

    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  return state;
}

const nodeWidth = 172;
const nodeHeight = 36;

const getElements = (graph: Graph): Elements => {
  const elements: Elements = [
    ...graph.nodes.map((node, idx) => ({
      id: `${idx}`,
      data: node.data,
      type: node.type || "default",
      // position: { ...node.position }
      position: { x: 0, y: 0 },
    })),
    ...graph.edges.map((edge) => ({
      id: `e${edge.source}-${edge.target}`,
      source: `${edge.source}`,
      target: `${edge.target}`,
    })),
  ];

  console.log("new graph");
  console.log(elements);
  // elements.forEach((el) => {
  //   if (!el.id.startsWith('e') && !el.position) console.warn("POS", el)
  //   })

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

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

export function useGraphElements(state: ViewState | null): Elements {
  const elements = useMemo(
    () => (state ? getElements(state.graph) : []),
    [state?.graph]
  );
  return elements;
}
