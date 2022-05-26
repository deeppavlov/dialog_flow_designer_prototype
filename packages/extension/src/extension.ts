import * as vscode from "vscode";
import DfEditorProvider from "./services/DfEditorProvider";
import PyServer from "./services/PyServer";

/**
 * Main entrypoint. Holds onto all resources used by the extension.
 */
class Extension {
  editorProvider: DfEditorProvider;
  pyServer: PyServer;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.pyServer = new PyServer(context);
    this.editorProvider = new DfEditorProvider(context, this.pyServer);
    this.context.subscriptions.push(this.pyServer, this.editorProvider)
  }

  /**
   * Free up the extension's resources.
   *
   * Use this only for objects that are not of type `Disposable`. All disposable
   * objects should be just added to `context.subscriptions`.
   */
  dispose() {}
}

// Hot-reloading of the extension's main services could be implemented here
// via @hediet/node-reload. The build system should already support this usecase.
// The main issue is that reloading a custom editor would require some extra
// logic, so this is a TODO for now.

export function activate(context: vscode.ExtensionContext) {
  // If possible, keep this function empty and all logic to Extension
  context.subscriptions.push(new Extension(context));
}
