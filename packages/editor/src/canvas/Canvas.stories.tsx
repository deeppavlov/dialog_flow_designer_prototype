import React, { useMemo } from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";

import Canvas from "./Canvas";
import musicPlot from "../__mocks__/mockPlot";
import { GEdge, GNode, Graph, Turn } from "../types";
import { useState } from "react";
import { plotToGraph } from "../utils/plot";
import { Plot } from "@dialog-flow-designer/shared-types/df-parser-server";
import { resetState, State, useStore } from "../store";
import { getLayout } from "../utils/layout";

function createNodesAndEdges(xNodes = 10, yNodes = 10): Graph {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  let nodeId = 1;
  let recentNodeId = null;

  for (let y = 0; y < yNodes; y++) {
    for (let x = 0; x < xNodes; x++) {
      const data = { label: `Node ${nodeId}` };
      const node: GNode = {
        id: `stress-${nodeId.toString()}`,
        label: data.label,
        properties: [],
        turn: Turn.BOT,
      };
      nodes.push(node);

      if (recentNodeId && nodeId <= xNodes * yNodes) {
        edges.push({
          fromId: `stress-${recentNodeId.toString()}`,
          toId: `stress-${nodeId.toString()}`,
        });
      }

      recentNodeId = nodeId;
      nodeId++;
    }
  }

  return { nodes, edges };
}

type CanvasType = typeof Canvas;

export default {
  component: Canvas,
  decorators: [
    (Story, { parameters: { state } }) => {
      resetState();
      useStore.setState(state);

      return (
        <div
          style={{
            margin: "3em",
            width: "calc(100% - 6em)",
            height: "500px",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
} as ComponentMeta<CanvasType>;

const Template: ComponentStory<typeof Canvas> = () => <Canvas />;

export const SingleNode = Template.bind({});
SingleNode.parameters = {
  state: {
    graph: {
      nodes: [{ id: "id", label: "Start node", turn: Turn.BOT, properties: [] }],
      edges: [],
    },
    selectedNodeId: "id",
  } as Partial<State>,
};

export const NodeWithTwoChildren = Template.bind({});
NodeWithTwoChildren.parameters = {
  state: {
    graph: {
      nodes: [
        { id: "1", label: "Start node", turn: Turn.BOT, properties: [] },
        { id: "2", label: "Node 1", turn: Turn.USER, properties: [] },
        { id: "3", label: "Node 2", turn: Turn.USER, properties: [] },
      ],
      edges: [
        { fromId: "1", toId: "2" },
        { fromId: "1", toId: "3" },
      ],
    },
  } as Partial<State>,
};

export const ThreeLevelTree = Template.bind({});
ThreeLevelTree.parameters = {
  state: {
    graph: {
      nodes: [
        { id: "1", label: "Start node", turn: Turn.BOT, properties: [] },
        { id: "2", label: "Node 1", turn: Turn.USER, properties: [] },
        { id: "3", label: "Node 2", turn: Turn.USER, properties: [] },
        { id: "4", label: "Node 3", turn: Turn.BOT, properties: [] },
        { id: "5", label: "Node 4", turn: Turn.BOT, properties: [] },
        { id: "6", label: "Node 5", turn: Turn.BOT, properties: [] },
      ],
      edges: [
        { fromId: "1", toId: "2" },
        { fromId: "1", toId: "3" },
        { fromId: "2", toId: "4" },
        { fromId: "2", toId: "5" },
        { fromId: "3", toId: "6" },
      ],
    },
  } as Partial<State>,
};

export const WithBacklink = Template.bind({});
WithBacklink.parameters = {
  state: {
    graph: {
      nodes: [
        { id: "1", label: "Start node", turn: Turn.BOT, properties: [] },
        { id: "2", label: "Node 1", turn: Turn.USER, properties: [] },
        { id: "3", label: "Node 2", turn: Turn.USER, properties: [] },
        { id: "4", label: "Node 3", turn: Turn.BOT, properties: [] },
        { id: "5", label: "Node 4", turn: Turn.BOT, properties: [] },
        { id: "6", label: "Node 5", turn: Turn.BOT, properties: [] },
      ],
      edges: [
        { fromId: "1", toId: "2" },
        { fromId: "1", toId: "3" },
        { fromId: "2", toId: "4" },
        { fromId: "2", toId: "5" },
        { fromId: "3", toId: "6" },
        { fromId: "5", toId: "2" },
      ],
    },
  } as Partial<State>,
};

export const WithForwardLink = Template.bind({});
WithForwardLink.parameters = {
  state: {
    graph: {
      nodes: [
        { id: "1", label: "Start node", turn: Turn.BOT, properties: [] },
        { id: "2", label: "Node 1", turn: Turn.USER, properties: [] },
        { id: "3", label: "Node 2", turn: Turn.USER, properties: [] },
        { id: "4", label: "Node 3", turn: Turn.BOT, properties: [] },
        { id: "5", label: "Node 4", turn: Turn.BOT, properties: [] },
        { id: "6", label: "Node 5", turn: Turn.BOT, properties: [] },
      ],
      edges: [
        { fromId: "1", toId: "2" },
        { fromId: "1", toId: "3" },
        { fromId: "2", toId: "4" },
        { fromId: "2", toId: "5" },
        { fromId: "3", toId: "6" },
        { fromId: "1", toId: "5" },
      ],
    },
  } as Partial<State>,
};

export const MusicSkill = Template.bind({});
MusicSkill.parameters = {
  state: {
    graph: plotToGraph(musicPlot),
  } as Partial<State>,
};

export const StressTest = Template.bind({});
StressTest.parameters = {
  state: {
    graph: createNodesAndEdges(20, 20),
  } as Partial<State>,
};
