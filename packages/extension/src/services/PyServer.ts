import path = require("path");
import * as vscode from "vscode";
import { PythonShell } from "python-shell";
import type {
  MessageAndReply,
  PlotReply,
  SrcReply,
} from "@dialog-flow-designer/shared-types/df-parser-server";
import { findVenv } from "@dialog-flow-designer/utils";
import { nanoid } from "nanoid";

type ReplyCb = (reply: MessageAndReply[1]["payload"]) => void;

export default class PyServer {
  name = "pyserver";

  // Definetely gets intialized in constructor
  pyProc!: PythonShell;
  private replyCallbacks: Record<string, ReplyCb> = {};
  private disposed = false;

  constructor() {
    this.ensureServerRunning();
    // In practice, dispose does not always get called, so it's best to make sure
    // in this case, so we don't leave any zombie processes behind.
    process.on("exit", () => this.dispose());
  }

  public parseSrc = async (pythonSrc: string) =>
    (await this.sendMessage({
      name: "parse_src",
      payload: { source: pythonSrc },
    })) as PlotReply["payload"];

  public putPlotObj = async (objid: string, update: Record<string, string>) =>
    (await this.sendMessage({
      name: "put_obj",
      payload: { objid, update },
    })) as SrcReply["payload"];

  public postPlotObj = async (type: string, props: Record<string, string>) =>
    (await this.sendMessage({
      name: "post_obj",
      payload: { type, props },
    })) as SrcReply["payload"];

  private ensureServerRunning = () => {
    if (this.pyProc && this.pyProc.exitCode === null) return;
    if (process.env.NODE_ENV === "development") {
      console.info("Starting Python process in development mode");
      // For some reason cwd is messed up when running in development
      // __dirname == extension/dist
      const venvPath = findVenv();
      const serverPkgPath = path.resolve(venvPath, "..", "packages", "df-parser-server");
      this.pyProc = new PythonShell("server.py", {
        cwd: serverPkgPath,
        pythonPath: path.join(venvPath, "bin", "python"),
        // Yes, there's a json mode, but it does not seem to work
        // Just stick to text mode
      });
    } else {
      console.info("Starting Python process");
      this.pyProc = new PythonShell("server.py", {
        pythonPath: path.join("venv", "bin", "python"),
        // Yes, there's a json mode, but it does not seem to work
        // Just stick to text mode
      });
    }
    this.pyProc.on("message", this.receiveReply);
    this.pyProc.on("close", (code: number) => {
      console.error(`Python process exited with code ${code}`);
    });
  };

  private sendMessage = <T extends MessageAndReply>(
    message: Omit<T[0], "id">
  ): Promise<T[1]["payload"]> =>
    new Promise((resolve) => {
      const id = nanoid();
      this.replyCallbacks[id] = resolve;
      console.log("Send message to py\n", message);
      this.pyProc.send(JSON.stringify(<T[0]>{ ...message, id }));
    });

  private receiveReply = (replyStr: string) => {
    console.log("Data from Python\n", replyStr);
    const { msgId, payload } = JSON.parse(replyStr) as MessageAndReply[1];
    if (msgId in this.replyCallbacks) {
      this.replyCallbacks[msgId](payload);
      delete this.replyCallbacks[msgId];
    } else console.error(`Reply callback for ${msgId} was not found!`);
  };

  dispose() {
    if (this.disposed || this.pyProc.exitCode !== null) return;
    console.info("killing python process");
    this.pyProc.end(() => {});
    this.pyProc.kill();
    this.disposed = true;
  }
}
