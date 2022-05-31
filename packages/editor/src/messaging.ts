import type { EditorAction, EditorState } from "@dialog-flow-designer/shared-types/editor";

export type MsgSub = (msg: { data: EditorState }) => void;

let _postMessage: (msg: any) => void;
let _addMsgSub: (sub: MsgSub) => void;
let _removeMsgSub: (sub: MsgSub) => void;
if ("acquireVsCodeApi" in window) {
  _postMessage = window.acquireVsCodeApi().postMessage;
  _addMsgSub = (sub) => window.addEventListener("message", sub);
  _removeMsgSub = (sub) => window.removeEventListener("message", sub);
} else {
  // TODO: handle running outside of VS Code
}

/**
 * Posts a message to the backend, be it VS Code or a web server.
 */
export function postMessage(msg: EditorAction) {
  _postMessage(msg);
}

/**
 * Subscribe to messages from the backend.
 */
export const addMessageListener = (sub: MsgSub) => _addMsgSub(sub);

/**
 * Unsubscribe from messages from the backend.
 */
export const removeMessageListener = (sub: MsgSub) => _removeMsgSub(sub);
