import path = require("path");
import * as vscode from "vscode";
import { PythonShell } from "python-shell";
import type {
  MessageAndReply,
  Plot,
  PlotReply,
  SrcReply,
} from "@dialog-flow-designer/shared-types/df-parser-server";
import { findVenv } from "@dialog-flow-designer/utils";
import { nanoid } from "nanoid";
import * as yaml from "js-yaml";

type ReplyCb = (reply: MessageAndReply[1]["payload"]) => void;

const typePrefixes = {
  flow: "fl",
  import: "im",
  linking: "ln",
  misc: "ms",
  plot: "pl",
  processing: "pr",
  py_def: "df",
  response: "rs",
  transition: "tr",
};
const fakeDb: Record<string, Plot> = {};
/**
 * Find a DfObj in given plot.
 *
 * **For testing only, not efficient!**
 */
const findObj = (objid: string, plot: Plot): [string, any] | undefined => {
  for (const typ in plot) {
    if (Object.prototype.hasOwnProperty.call(plot, typ)) {
      const dfObjects = plot[typ as keyof Plot];
      if (objid in dfObjects) return [typ, dfObjects[objid]];
    }
  }
};
export default class PyServer {
  name = "pyserver";

  // Definetely gets intialized in constructor
  pyProc!: PythonShell;
  private replyCallbacks: Record<string, ReplyCb> = {};
  private disposed = false;

  constructor() {
    // COMMENTED FOR YAML TEST MODE ONLY
    // this.ensureServerRunning();

    // In practice, dispose does not always get called, so it's best to make sure
    // in this case, so we don't leave any zombie processes behind.
    process.on("exit", () => this.dispose());
  }

  public parseSrc = async (uri: string, yamlSrc: string) => {
    const plot = yaml.load(yamlSrc) as Plot;
    fakeDb[uri] = plot;
    return <PlotReply["payload"]>{
      plot,
    };
  };

  public putPlotObj = async (uri: string, objid: string, update: Record<string, string>) => {
    const oldPlot = fakeDb[uri];
    const [objType, obj] = findObj(objid, oldPlot)!;
    const newPlot: Plot = {
      ...oldPlot,
      [objType as keyof Plot]: {
        ...oldPlot[objType as keyof Plot],
        [objid]: {
          ...obj,
          ...update,
        },
      },
    };
    fakeDb[uri] = newPlot;
    return <SrcReply["payload"]>{
      source: yaml.dump(newPlot),
    };
  };

  public postPlotObj = async (
    uri: string,
    type: keyof typeof typePrefixes,
    props: Record<string, string>
  ) => {
    const oldPlot = fakeDb[uri];
    const typePlural = type === "linking" ? type : type + "s";
    const newId = `id#${typePrefixes[type]}_${nanoid(8)}`;
    const newPlot: Plot = {
      ...oldPlot,
      [typePlural as keyof Plot]: {
        ...oldPlot[typePlural as keyof Plot],
        [newId]: props,
      },
    };
    fakeDb[uri] = newPlot;
    return <SrcReply["payload"]>{
      source: yaml.dump(newPlot),
    };
  };

  // COMMENTED FOR YAML TEST MODE ONLY
  // public parseSrc = async (pythonSrc: string) =>
  //   (await this.sendMessage({
  //     name: "parse_src",
  //     payload: { source: pythonSrc },
  //   })) as PlotReply["payload"];

  // COMMENTED FOR YAML TEST MODE ONLY
  // public putPlotObj = async (objid: string, update: Record<string, string>) =>
  //   (await this.sendMessage({
  //     name: "put_obj",
  //     payload: { objid, update },
  //   })) as SrcReply["payload"];

  // COMMENTED FOR YAML TEST MODE ONLY
  // public postPlotObj = async (type: string, props: Record<string, string>) =>
  //   (await this.sendMessage({
  //     name: "post_obj",
  //     payload: { type, props },
  //   })) as SrcReply["payload"];

  private ensureServerRunning = () => {
    if (this.pyProc && this.pyProc.exitCode === null) return;
    if (process.env.NODE_ENV === "development") {
      console.info("Starting Python process in development mode");
      // For some reason cwd is messed up when running in development
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
