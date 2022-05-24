import * as vscode from "vscode";
import { TextDocument, WebviewPanel, CancellationToken } from "vscode";
import type { Graph, Plot, ViewAction, ViewState } from "@dialog-flow-designer/types";

export default class GraphEditorProvider implements vscode.CustomTextEditorProvider {
  public static viewType = "deeppavlov.df-designer-graph";
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    console.log("GraphEditorProvider registered");
    const provider = new GraphEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      GraphEditorProvider.viewType,
      provider
    );

    return providerRegistration;
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveCustomTextEditor(
    document: TextDocument,
    webviewPanel: WebviewPanel,
    _token: CancellationToken
  ): Thenable<void> | void {
    console.log("resolveCustomTextEditor");

    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        console.log("document changed");
      }
    });

    webviewPanel.onDidDispose(() => {
      console.log("dispose webview");
      changeDocumentSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage(async (e: ViewAction) => {
      console.log("msg from webview", e);
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const isProd = process.env.NODE_ENV !== "development";
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "webview", "main.js")
    );

    return /* html */ `
    <html lang="en">
      <head>
${
  isProd
    ? `
        <base href="http://localhost:3000" />
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
      <script type="module" src="${isProd ? "/src/main.tsx" : scriptUri}"></script>
    </body>
  </html>`;
  }
}
