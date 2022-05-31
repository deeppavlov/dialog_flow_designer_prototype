import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { Graph, GNode, NewNode, Turn, GEdge } from "../types";
import { postMessage, addMessageListener, removeMessageListener, MsgSub } from "../messaging";
import { NodeType, Plot } from "@dialog-flow-designer/shared-types/df-parser-server";

const plotToGraph = (plot: Plot): Graph => {
  const edgeId = ([src, trg]: [string, string]) => `e${src}-${trg}`;
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

  return {
    nodes: [
      ...transitions.map(
        ({ id, cond }) =>
          <GNode>{
            id,
            label: cond,
            turn: Turn.USER,
            properties: {},
          }
      ),
      ...Object.entries(plot.nodes)
        .filter(([_, node]) => node.type === NodeType.REGULAR)
        .map(
          ([id, node]) =>
            <GNode>{
              id,
              label: node.name || "noname",
              turn: Turn.BOT,
              properties: {},
            }
        ),
    ],
    edges: edges.map(
      ([srcId, trgId]) =>
        <GEdge>{
          id: `e${srcId}-${trgId}`,
          fromId: `${srcId}`,
          toId: `${trgId}`,
        }
    ),
  };
};

const useGraph = (intialGraph: Graph = { nodes: [], edges: [] }) => {
  const [graph, setGraph] = useState<Graph>(intialGraph);

  useEffect(() => {
    const handler: MsgSub = ({ data }) => {
      console.log("got plot from ext\n", JSON.stringify(data.plot, undefined, 4));
      setGraph(plotToGraph(data.plot));
    };
    addMessageListener(handler);
    postMessage({ name: "ready" });
    return () => removeMessageListener(handler);
  }, []);

  const addNode = (node: NewNode, fromId: string) => {
    // const id = nanoid();
    // const newNode: GNode = { id, ...node };
    // setGraph(({ edges, nodes }) => ({
    //   edges: [...edges, { fromId, toId: id }],
    //   nodes: [...nodes, newNode],
    // }));
  };

  return { graph, addNode };
};

export default useGraph;
