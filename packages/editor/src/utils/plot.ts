import { Graph, GNode, Turn, GEdge } from "../types";
import { Plot } from "@dialog-flow-designer/shared-types/df-parser-server";

/**
 * Convert a parsed DF plot in the format outputted by the parser to a graph (nodes and edges).
 *
 * @see https://github.com/kudep/dff-parser/blob/896dae2e86f5e78b75dc51bae7423394e3c21529/parser_output.yaml
 */
export const plotToGraph = (plot: Plot): Graph => {
  // Code for extracting global nodes
  // How exactly these should be rendered is currently TBD from a design perspective
  // const globalEdges: any[] = [];
  // Object.values(plot.nodes)
  //   .filter(({ type }) => type === "global")
  //   .flatMap((node) => node.transitions ?? [])
  //   .map((transId) => [transId, plot.transitions[transId]] as [string, Plot["transitions"][string]])
  //   .filter(([_, trans]) => trans.label.startsWith("id#nd"))
  //   .map(([id, trans]) => ({
  //     id,
  //     cond: plot.py_defs[plot.linking[trans.condition]?.object]?.name ?? "unknown",
  //     target: trans.label,
  //   }));

  const edgeIds = new Set<string>();
  const edges: GEdge[] = [];
  /**
   * Add an edge to the edges list, if it does not exists yet
   */
  const addEdge = (srcId: string, trgId: string) => {
    const id = `e${srcId}-${trgId}`;
    if (!edgeIds.has(id)) {
      edgeIds.add(id);
      edges.push({
        fromId: `${srcId}`,
        toId: `${trgId}`,
      });
    }
  };

  const nodes: GNode[] = [];
  const nodeIds = new Set<string>(
    Object.entries(plot.nodes)
      .filter(([_, node]) => node.type === "regular")
      .map(([k]) => k)
  );
  Object.entries(plot.nodes).forEach(([id, node]) => {
    if (node.type !== "regular") return;

    // 1. Add current response node
    const flow = Object.values(plot.flows).find((fl) => fl.nodes.includes(id))?.name ?? "noflow";
    nodes.push({
      id,
      label: node.name || "noname",
      turn: Turn.BOT,
      flow,
      properties: [],
    });

    // 2. Add transitions from the current node
    node.transitions?.forEach((transId) => {
      const trans = plot.transitions[transId];
      if (!trans.label.startsWith("id#nd") || !nodeIds.has(trans.label)) return;

      // 2.1. Add edge from node to condition
      addEdge(id, transId);

      // 2.2. Find condition name/type
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

      // 2.3. Add condition node
      nodes.push({
        id: transId,
        label: cond,
        turn: Turn.USER,
        flow,
        properties: [],
      });

      // 2.4. Add edge from condition to target node
      addEdge(transId, trans.label);
    });
  });

  return { nodes, edges };
};
