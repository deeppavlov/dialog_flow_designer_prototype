import type { EditorAction, EditorState } from "@dialog-flow-designer/shared-types/editor";
import { useEffect } from "react";

export type EditorMessage = Partial<EditorState>;
export type MsgSub = (msg: { data: EditorMessage }) => void;

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
 * Post a message to the backend.
 */
export const sendMessage = (action: EditorAction) => _postMessage(action);

/**
 * Subscribe the component to messages from the backend, regardless as to whether that is
 * VSCode or someting else.
 */
export const useMessages = (handler: MsgSub) => {
  useEffect(() => {
    _addMsgSub(handler);
    return () => _removeMsgSub(handler);
  }, [handler]);
};
