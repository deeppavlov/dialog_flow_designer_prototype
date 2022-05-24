import * as vscode from "vscode";
import GraphEditorProvider from "./GraphEditorProvider";

// Hot-reloading of the extension's main services could be implemented here
// via @hediet/node-reload. The build system should already support this usecase.
// The main issue is that reloading a custom editor would require some extra
// logic, so this is a TODO for now.

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(GraphEditorProvider.register(context));
}
