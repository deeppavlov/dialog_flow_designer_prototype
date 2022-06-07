// This module contains the types shared by the python server and the typescript
// process talking to it (either the extension or Dream Builder)

export type NodeType = "global" | "local" | "regular";

/**
 * Parsed form of plot, as received from the parser
 */
export interface Plot {
  imports: {
    [id: string]: {
      name: string;
      code: string;
      comment?: string;
    };
  };

  py_defs: {
    [id: string]: {
      name: string;
      code?: string;
    };
  };

  plots: {
    [id: string]: {
      name: string;
      flows: string[];
    };
  };

  flows: {
    [id: string]: {
      name: string;
      nodes: string[];
    };
  };

  nodes: {
    [id: string]: {
      type: NodeType;
      name?: string;
      transitions?: string[];
      response?: string;
      processing?: string;
      misc?: string;
    };
  };

  transitions: {
    [id: string]: {
      label: string;
      priority?: number;
      condition: string;
    };
  };

  responses: {
    [id: string]: {
      response_object: string;
    };
  };

  processings: {
    [id: string]: {
      items: Record<string, string>[];
    };
  };

  miscs: {
    [id: string]: {
      items: Record<string, string>;
    };
  };

  linking: {
    [id: string]: {
      object: string;
      parent?: string;
      args?: string[] | string[][];
      kwargs?: Record<string, string | string[]>;
    };
  };
}

// Message types passed to python from parent process

/**
 * Base interface for message passed from parent process -> Python
 */
interface MessageBase {
  /**
   * Random unique id
   */
  id: string;

  /**
   * Type of message (action)
   */
  name: string;

  /**
   * Optional payload
   */
  payload?: object;
}

/**
 * Parse a new or changed python module and return the parsed plot ({@link Plot})
 */
export interface ParseSrc extends MessageBase {
  name: "parse_src";
  payload: {
    source: string;
  };
}

/**
 * Update (patch) and object in the plot and return the updated source code
 */
export interface PutObj extends MessageBase {
  name: "put_obj";
  payload: {
    objid: string;
    update: Record<string, string>;
  };
}

/**
 * Create a new object in the plot and return the updated source code
 */
export interface PostObject extends MessageBase {
  name: "post_obj";
  payload: {
    type: string;
    props: Record<string, string>;
  };
}

// Messages (replies) passed from Python -> parent process

interface ReplyBase {
  /**
   * Unique identifier of the message we are replying to
   */
  msgId: string;

  /**
   * Optional payload
   */
  payload?: object;
}

/**
 * Result of parsing a dff plot (script)
 */
export interface PlotReply extends ReplyBase {
  payload: {
    plot: Plot;
  };
}

/**
 * Resulting python source code after updating a dff plot
 */
export interface SrcReply extends ReplyBase {
  payload: {
    source: string;
  };
}

/**
 * Discriminated union of message-reply tuples passed between Python and the
 * parent process. Rememeber to add new message and reply types here.
 */
export type MessageAndReply = [ParseSrc, PlotReply] | [PutObj, SrcReply] | [PostObject, SrcReply];
