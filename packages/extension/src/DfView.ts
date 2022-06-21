import type { EditorAction, EditorState } from "@dialog-flow-designer/shared-types/editor";
import * as vscode from "vscode";

/**
 * Discriminated union of actions not handled by `DfView`
 */
// If an action is added that is handled by DfView, change this line to
// Exclude<EditorAction, {union of handled actions}>
// see https://www.typescriptlang.org/docs/handbook/utility-types.html#excludeuniontype-excludedmembers
export type DocumentAction = EditorAction;

type ActionSub = (action: DocumentAction) => void;

/**
 * Holds onto an open webview panel and communicates with the editor in it.
 *
 * When initializing, it sets up the webview, resetting it completely, therefore
 * should only be constructed once with each panel.
 */
export default class DfView implements vscode.Disposable {
  private actionSubs = new Set<ActionSub>();

  constructor(readonly context: vscode.ExtensionContext, readonly panel: vscode.WebviewPanel) {
    panel.webview.options = {
      enableScripts: true,
    };
    panel.webview.html = this.getHtmlForWebview();
    panel.webview.onDidReceiveMessage(this.handleAction);
  }

  public pushEditorState = (newState: EditorState) => this.panel.webview.postMessage(newState);

  public onDidPanelDispose = this.panel.onDidDispose;

  public onEditorAction = (cb: ActionSub) => {
    this.actionSubs.add(cb);
    return <vscode.Disposable>{
      dispose: () => this.actionSubs.delete(cb),
    };
  };

  private handleAction = (action: EditorAction) => {
    switch (action.name) {
      // Handle view related actions here
      default:
        this.actionSubs.forEach((sub) => sub(action));
    }
  };

  /**
   * Populate the webview with html, scripts, and styles required for the editor.
   *
   * In development mode (`NODE_ENV == "development"`) it connects to a vite dev
   * server runnning at http://localhost:3000. Be sure to test the webview in
   * production mode if you've changed this function.
   */
  private getHtmlForWebview = (): string => {
    const devServer = process.env.VITE_SERVER;
    const useDevServer = devServer && process.env.NODE_ENV === "development";
    // TODO: figure out production bundle
    const scriptUri = useDevServer
      ? "/src/main.tsx"
      : this.panel.webview.asWebviewUri(
          vscode.Uri.joinPath(this.context.extensionUri, "dist", "editor", "index.js")
        );
    const cssUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "dist", "editor", "index.css")
    );

    return /* html */ `
    <html lang="en">
      <head>
${
  useDevServer
    ? `
        <!-- Using development server for HMR -->
        <base href="${devServer}" />
        <script type="module" src="/@vite/client"></script>
        <script type="module">
import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
        </script>`
    : // We only need to link our stylesheet in production
      `<link rel="stylesheet" href="${cssUri}">`
}

      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Dialog Flow Editor</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="${scriptUri}"></script>
    </body>
  </html>`;
  };

  /**
   * The extension is **not** responsible for disposing of the webview panel,
   * only the subscriptions attached to the panel.
   */
  dispose = () => {};
}
