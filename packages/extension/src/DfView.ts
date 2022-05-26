import type { EditorAction, EditorState } from "@dialog-flow-designer/shared-types/editor";
import * as vscode from "vscode";

/**
 * Holds onto an open webview panel and communicates with the editor in it.
 *
 * When initializing, it sets up the webview, resetting it completely, therefore
 * should only be constructed once with each panel.
 */
export default class DfView implements vscode.Disposable {
  constructor(readonly context: vscode.ExtensionContext, readonly panel: vscode.WebviewPanel) {
    panel.webview.options = {
      enableScripts: true,
    };
    panel.webview.html = this.getHtmlForWebview();
    panel.webview.onDidReceiveMessage(this.handleAction);
  }

  public pushEditorState = (newState: EditorState) => this.panel.webview.postMessage(newState);

  public onDidPanelDispose = this.panel.onDidDispose;

  private handleAction = (action: EditorAction) => {};

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
      ? ""
      : this.panel.webview.asWebviewUri(
          vscode.Uri.joinPath(this.context.extensionUri, "webview", "main.js")
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
    : ""
}

      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Dialog Flow Editor</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="${useDevServer ? "/src/main.tsx" : scriptUri}"></script>
    </body>
  </html>`;
  };

  /**
   * The extension is **not** responsible for disposing of the webview panel,
   * only the subscriptions attached to the panel.
   */
  dispose = () => {};
}
