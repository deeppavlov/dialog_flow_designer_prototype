import React, { useMemo } from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";

import Canvas from "./Canvas";
import musicPlot from "../__mocks__/mockPlot";
import { GEdge, GNode, Turn } from "../types";
import { useState } from "react";
import useGraph, { plotToGraph } from "./useGraph";
import { Plot } from "@dialog-flow-designer/shared-types/df-parser-server";

type CanvasType = typeof Canvas;

export default {
  component: Canvas,
  decorators: [
    (Story) => (
      <div
        style={{
          margin: "3em",
          width: "calc(100% - 6em)",
          height: "500px",
        }}
      >
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<CanvasType>;

const Template: ComponentStory<typeof Canvas> = (args) => <Canvas {...args} />;

export const SingleNode = Template.bind({});
SingleNode.args = {
  graph: {
    nodes: [{ id: "id", label: "Start node", turn: Turn.BOT, properties: [] }],
    edges: [],
  },
  selectedNodeId: "id",
};

export const NodeWithTwoChildren = Template.bind({});
NodeWithTwoChildren.args = {
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
};

export const ThreeLevelTree = Template.bind({});
ThreeLevelTree.args = {
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
};

export const SelectingChildren: ComponentStory<typeof Canvas> = (args) => {
  const [selected, setSelected] = useState("1");
  return <Canvas {...args} onSelectNode={setSelected} selectedNodeId={selected} />;
};
SelectingChildren.args = {
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
};

export const WithBacklink = Template.bind({});
WithBacklink.args = {
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
};

export const WithForwardLink = Template.bind({});
WithForwardLink.args = {
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
};

export const MusicSkill: ComponentStory<typeof Canvas> = (args) => {
  const [selected, setSelected] = useState<string>();
  const graph = useMemo(() => plotToGraph(musicPlot as unknown as Plot), []);
  return <Canvas {...args} graph={graph} onSelectNode={setSelected} selectedNodeId={selected} />;
};
