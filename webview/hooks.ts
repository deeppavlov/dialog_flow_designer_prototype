import { useEffect, useMemo, useState } from "react";
import dagre from "dagre";
import { Elements, Position, isNode } from "react-flow-renderer";
import { ViewState, ViewAction, Graph, Plot, NodeType } from "../src/types";

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

const edgeId = ([src, trg]: [string, string]) => `e${src}-${trg}`;

const getElements = (plot: Plot): Elements => {
  const globalEdges = Object.values(plot.nodes)
    .filter(({ type }) => type === NodeType.GLOBAL)
    .flatMap((node) => node.transitions ?? [])
    .map((transId) => [transId, plot.transitions[transId]] as [string, Plot["transitions"][string]])
    .filter(([_, trans]) => trans.label.startsWith("id#nd"))
    .map(([id, trans]) => ({
      id,
      cond: plot.py_defs[plot.linking[trans.condition]?.object]?.name ?? "unknown",
      target: trans.label,
    }));

  const edgeIds = new Set<string>();
  const edges: [string, string][] = [];
  const transitions: { id: string; cond: string }[] = [
    ...globalEdges.map(({ id, cond }) => ({ id, cond })),
  ];
  Object.entries(plot.nodes).forEach(([id, node]) => {
    if (node.type !== NodeType.REGULAR || !node.transitions) return;
    node.transitions?.forEach((transId) => {
      const trans = plot.transitions[transId];
      if (!trans.label.startsWith("id#nd")) return;

      // Find condition
      let cond = "unknown";
      const condId = trans.condition;
      if (condId.startsWith("id#ln")) {
        const link = plot.linking[condId];
        const objId = link.object;
        if (objId.startsWith("id#df")) {
          const obj = plot.py_defs[objId];
          cond = obj.name;
        }
      }

      // Condition node
      transitions.push({ id: transId, cond });

      // Edge from node to condition
      const eid1 = edgeId([id, transId]);
      if (!edgeIds.has(eid1)) {
        edgeIds.add(eid1);
        edges.push([id, transId]);
      }

      // Edge from condition to target node
      const eid2 = edgeId([transId, trans.label]);
      if (!edgeIds.has(eid2)) {
        edgeIds.add(eid2);
        edges.push([transId, trans.label]);
      }
    });

    globalEdges.forEach(({ id: transId, cond, target }) => {
      if (target === id) return;
      // Edge from node to condition
      const eid1 = edgeId([id, transId]);
      if (!edgeIds.has(eid1)) {
        edgeIds.add(eid1);
        edges.push([id, transId]);
      }
      // Edge from condition to target
      const eid2 = edgeId([transId, target]);
      if (!edgeIds.has(eid2)) {
        edgeIds.add(eid2);
        edges.push([transId, target]);
      }
    });
  });

  const elements: Elements = [
    ...transitions.map(({ id, cond }) => ({
      id,
      data: { label: cond },
      type: "condition",
      position: { x: 0, y: 0 },
    })),
    ...Object.entries(plot.nodes)
      .filter(([_, node]) => node.type === NodeType.REGULAR)
      .map(([id, node]) => ({
        id,
        data: { label: node.name || "noname" },
        type: "response",
        // position: { ...node.position }
        position: { x: 0, y: 0 },
      })),
    ...edges.map(([srcId, trgId]) => ({
      id: `e${srcId}-${trgId}`,
      source: `${srcId}`,
      target: `${trgId}`,
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
  const elements = useMemo(() => (state ? getElements(state.plot) : []), [state?.plot]);
  return elements;
}
