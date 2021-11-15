import * as vscode from "vscode";

import GraphEditorProvider from "./GraphEditorProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(GraphEditorProvider.register(context));
}
