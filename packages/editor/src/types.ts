// Private types of the editor

export interface XY {
  x: number;
  y: number;
}

export interface Property {
  type: string;
  value: string;
}
export enum Turn {
  USER,
  BOT,
}

export interface GNode {
  id: string;
  label: string;
  turn: Turn;
  properties: Property[];
}

export interface GEdge {
  fromId: string;
  toId: string;
}

export interface Graph {
  nodes: GNode[];
  edges: GEdge[];
}

export type NewNode = Omit<GNode, "id">;

export interface AutocompArgs {
  // Input
  input: string;

  // Context
  turn: Turn;
  currentProp: Partial<Property>;
  otherProps: Property[];
  previousProps: Property[];

  // Options
  limit: number;

  // Cache
  cache: Record<string, any>;
}

export type SuggestionData = Partial<Property> & {
  /**
   * Scores go from `-Infinity` to `0`.
   */
  score: number;
};

export enum Mode {
  DEFAULT,
  EDIT,
  ADD,
}

/**
 * Renderable form of plot as an edge list
 */
// export interface Graph {
//   nodes: {
//     type: string;
//     data: {
//       label: string;
//       flow: string;
//     };
//     position: {
//       x: number;
//       y: number;
//     };
//   }[];
//   edges: {
//     source: number;
//     target: number;
//   }[];
// }
