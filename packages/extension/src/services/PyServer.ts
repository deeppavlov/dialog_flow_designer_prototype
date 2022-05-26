import path = require("path");
import * as vscode from "vscode";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import type {
  MessageAndReply,
  PlotReply,
  SrcReply,
} from "@dialog-flow-designer/shared-types/df-parser-server";
import { nanoid } from "nanoid";

type ReplyCb = (reply: MessageAndReply[1]["payload"]) => void;

export default class PyServer {
  name = "pyserver";

  // Definetely gets intialized in constructor
  private pyProc!: ChildProcessWithoutNullStreams;
  private replyCallbacks: Record<string, ReplyCb> = {};
  private currentChunk = "";
  private disposed = false;

  constructor(context: vscode.ExtensionContext) {
    this.ensureServerRunning();
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
      // Special dev script
      this.pyProc = spawn("node", ["dev.js"], { cwd: path.resolve("..", "df-parser-server") });
    } else {
      console.info("Starting Python process");
      const pyPath = path.join(".", "venv", "bin", "python");
      this.pyProc = spawn(pyPath, ["-m", "df_parser_server"]);
    }
    this.pyProc.stdout.on("data", (chunk) => {
      console.log("chunk", typeof chunk, "\n", chunk);
      this.receiveData(chunk);
    });
    this.pyProc.on("close", (code) => {
      console.error(`Python process exited with code ${code}`);
    });
  };

  private sendMessage = <T extends MessageAndReply>(
    message: Omit<T[0], "id">
  ): Promise<T[1]["payload"]> =>
    new Promise((resolve) => {
      const id = nanoid();
      this.replyCallbacks[id] = resolve;
      this.pyProc.stdin.write(JSON.stringify(message));
    });

  private receiveData = (chunk: string) => {
    this.currentChunk += chunk;
    const parts = this.currentChunk.split("\n");
    this.currentChunk = parts[parts.length - 1];
    parts.slice(0, -1).forEach((line) => {
      // Received a reply
      const { msgId, payload } = JSON.parse(line) as MessageAndReply[1];
      if (msgId in this.replyCallbacks) {
        this.replyCallbacks[msgId](payload);
        delete this.replyCallbacks[msgId];
      } else console.error(`Reply callback for ${msgId} was not found!`);
    });
  };

  dispose() {
    if (this.disposed || this.pyProc.exitCode !== null) return;
    this.pyProc.kill();
    this.disposed = true;
  }
}
