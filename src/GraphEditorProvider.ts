import * as vscode from "vscode";
import * as path from "path";
import { TextDocument, WebviewPanel, CancellationToken } from "vscode";
import { PythonShell } from "python-shell";
import { Graph } from "./types";

class GraphEditorProvider implements vscode.CustomTextEditorProvider {
  public static viewType = "deeppavlov.dd-idde-graph";
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
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
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    const updateWebview = async () => {
      const graph = await this.py2Graph(document.getText());
      console.log('sending', graph)
      webviewPanel.webview.postMessage({
        type: "setGraph",
        payload: { graph },
      });
    };

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          updateWebview();
        }
      }
    );

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage((e) => {
      switch (e.type) {
      }
    });

    updateWebview();
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "webview", "main.js")
    );
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "webview", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "webview", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "webview", "editor.css")
    );

    return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleVSCodeUri}" rel="stylesheet" />
				<link href="${styleMainUri}" rel="stylesheet" />

				<title>Graph Editor</title>
			</head>
			<body>
				<div id="root"></div>
				<script src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  private async py2Graph(pythonCode: string): Promise<Graph> {
    const b64Py = Buffer.from(pythonCode, "utf-8").toString("base64");
    const result = (await this.runPythonScript("py2json", {
      pycode: b64Py,
    })) as { graph: Graph };
    console.log('got graph from python', result)
    return result.graph;
  }

  private runPythonScript(script: string, input: object): Promise<object> {
    return new Promise((resolve) => {
      const pathToScript = vscode.Uri.file(
        path.join(this.context.extensionPath, `python/${script}.py`)
      ).fsPath;
      console.log('running', pathToScript)
      const shell = new PythonShell(pathToScript, { mode: "json" });
      shell.on("end", (err) => {
        console.log('script exited')
        if (err) throw err;
      });
      shell.send(input);
      console.log('sending', input)

      shell.on("message", resolve);
      console.error(shell.stderr.read())
      console.error(shell.stdout.read())
    });
  }
}

export default GraphEditorProvider;
