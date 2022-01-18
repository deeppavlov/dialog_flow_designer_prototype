import * as vscode from "vscode";
import * as path from "path";
import { TextDocument, WebviewPanel, CancellationToken } from "vscode";
import { PythonShell } from "python-shell";
import { Graph, ViewAction, ViewState } from "./types";

function getPos(text: string, substring: string): {line: number, col: number} {
  var line = 1,
    col = 1,
    matchedChars = 0;

  for (var i = 0; i < text.length; i++) {
    text[i] === substring[matchedChars] ? matchedChars++ : (matchedChars = 0);

    if (matchedChars === substring.length) {
      return {line,col};
    }
    if (text[i] === "\n") {
      line++;
      col = 1;
    } else if (matchedChars === 0) {
      col++;
    }
  }
  throw "Not found"
}

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
      const newState: ViewState = {
        graph,
      };
      console.log("sending to webview", newState);
      webviewPanel.webview.postMessage(newState);
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

    webviewPanel.webview.onDidReceiveMessage(async (e: ViewAction) => {
      console.log("msg from webview", e);
      switch (e.type) {
        case "load":
          updateWebview();
          break;
        case "add":
          const newPy = await this.addNode(
            document.getText(),
            e.payload.parentId,
            e.payload.parentFlow
          );
          const workspaceEdit = new vscode.WorkspaceEdit();
          workspaceEdit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            newPy
          );
          await vscode.workspace.applyEdit(workspaceEdit);
          updateWebview();

          for (let editor of vscode.window.visibleTextEditors) {
            if (editor.document.uri === document.uri) {
              vscode.window.showTextDocument(document, {
                preview: false,
                viewColumn: editor.viewColumn,
              });
              setTimeout(() => {
                const pos = getPos(newPy, '<Rename new node>')
                editor.selection = new vscode.Selection(
                  pos.line - 1,
                  pos.col - 1,
                  pos.line - 1,
                  pos.col + 16
                );
                vscode.commands.executeCommand("editor.action.selectHighlights")
              }, 10);
            }
          }

          break;
      }
    });
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
    console.log("got graph from python", result);
    return result.graph;
  }

  private async addNode(
    pythonCode: string,
    parentId: number,
    parentFlow: string
  ): Promise<string> {
    const b64Py = Buffer.from(pythonCode, "utf-8").toString("base64");
    const result = (await this.runPythonScript("addsuggs", {
      pyData: b64Py,
      title: "'<Rename new node>'",
      flow: parentFlow,
      cnd: "lambda ctx, actor, *args, **kwargs: True",
      parent: parentId,
    })) as { pycode: string };
    const code = Buffer.from(result.pycode, "base64").toString("utf-8");
    return code;
  }

  private runPythonScript(script: string, input: object): Promise<object> {
    return new Promise((resolve) => {
      const pathToScript = vscode.Uri.file(
        path.join(this.context.extensionPath, `python/${script}.py`)
      ).fsPath;
      console.log("running", pathToScript);
      const shell = new PythonShell(pathToScript, { mode: "text" });
      shell.send(JSON.stringify(input) + "\n");
      console.log("sending to py", input);

      shell.on("message", (msg) => resolve(JSON.parse(msg)));
      shell.end((err) => {
        console.log("script exited");
        if (err) {
          console.error(shell.stderr.read());
          console.error(shell.stdout.read());
          throw err;
        }
      });
    });
  }
}

export default GraphEditorProvider;
