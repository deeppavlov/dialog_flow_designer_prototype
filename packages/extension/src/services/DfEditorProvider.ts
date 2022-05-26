import * as vscode from "vscode";
import { TextDocument, WebviewPanel, CancellationToken } from "vscode";
import DfView from "../DfView";
import DfDocument from "../DfDocument";
import PyServer from "./PyServer";

export default class DfEditorProvider
  implements vscode.CustomTextEditorProvider, vscode.Disposable
{
  viewType = "deeppavlov.df-designer-graph";
  openDocuments: Record<string, DfDocument> = {};

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly pyServer: PyServer
  ) {
    const registration = vscode.window.registerCustomEditorProvider(this.viewType, this);
    context.subscriptions.push(registration);
  }

  resolveCustomTextEditor(
    document: TextDocument,
    webviewPanel: WebviewPanel,
    _token: CancellationToken
  ) {
    const uri = document.uri.toString();
    if (!this.openDocuments[uri]) {
      // First open of this document
      this.openDocuments[uri] = new DfDocument(this.context, this.pyServer, document);
    }
    const dfDoc = this.openDocuments[uri];

    // Create view wrapper
    const dfView = new DfView(this.context, webviewPanel);
    dfDoc.addView(dfView);
    dfView.onDidPanelDispose(() => {
      dfDoc.disposeView(dfView);
      if (dfDoc.numViews === 0) {
        // No more views open to this document, dispose
        dfDoc.dispose();
        delete this.openDocuments[uri];
      }
    });
  }

  dispose() {
    Object.values(this.openDocuments).forEach((dfDoc) => dfDoc.dispose());
    this.openDocuments = {};
  }
}
