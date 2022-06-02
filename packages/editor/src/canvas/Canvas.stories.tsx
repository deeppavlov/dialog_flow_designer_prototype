import React from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";

import Canvas from "./Canvas";
import { Turn } from "../types";

type CanvasType = typeof Canvas;

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Canvas",
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
