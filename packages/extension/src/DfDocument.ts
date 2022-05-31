import * as vscode from "vscode";
import { Disposable } from "@hediet/std/disposable";
import type DfView from "./DfView";
import type PyServer from "./services/PyServer";
import type { Plot } from "@dialog-flow-designer/shared-types/df-parser-server";
import type { DocumentAction } from "./DfView";

/**
 * Holds onto the `TextDocument` containing the Python source for the DFF plot,
 * and a list of open views onto this document.
 *
 * Responsible for listening to document change events, reparsing, and sending updates.
 */
export default class DfDocument implements vscode.Disposable {
  dispose = Disposable.fn();

  private views: DfView[] = [];

  constructor(
    readonly context: vscode.ExtensionContext,
    readonly pyServer: PyServer,
    readonly document: vscode.TextDocument
  ) {
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        this.handleSourceChange();
      }
    });
    this.dispose.track(changeDocumentSubscription);
  }

  public get numViews(): number {
    return this.views.length;
  }

  addView = async (view: DfView) => {
    this.views.push(view);
    this.dispose.track(view.onEditorAction((action) => this.handleEditorAction(view, action)));
  };

  /**
   * This method handles actions from the webview which are related to the document -
   * eg. changin/adding objects - as opposed to action on the view.
   */
  private handleEditorAction = async (view: DfView, action: DocumentAction) => {
    switch (action.name) {
      /**
       * View ready to accept first update
       */
      case "ready": {
        // Because opening second/third views is quite rare, we do not cache this value
        const { plot } = await this.getPlot();
        view.pushEditorState({ plot });
        break;
      }
    }
  };

  private getPlot = () =>
    this.pyServer.parseSrc(this.document.uri.toString(), this.document.getText());

  private handleSourceChange = async () => {
    const { plot } = await this.getPlot();
    this.views.forEach((view) => view.pushEditorState({ plot }));
  };

  disposeView = (view: DfView) => {
    view.dispose();
    this.views = this.views.filter((v) => v !== view);
  };
}
