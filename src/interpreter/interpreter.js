import { CommandLineInterface } from "./cli/cli.js";
import cmd from "./commands/index.js";

export class Interpreter {
  static instance;
  #cli;

  constructor(props) {
    if (Interpreter.instance) {
      return Interpreter.instance;
    }
    this.#cli = new CommandLineInterface(props);
    this.#init();
    Interpreter.instance = this;
  }

  run() {
    this.#cli.run();
  }

  #init() {
    this.#cli.onLine = async (line) => {
      if (/^cd\s+/.test(line)) {
        const [_, path] = line.split(/\s+/);
        console.log("resolved:", cmd.cd(path));
      } else if (line === 'up') {
        console.log("resolved:", cmd.cd('..'));
      } else if (line === 'ls') {
        console.table(await cmd.ls());
      } else if (/^cat\s+/.test(line)) {
        const [_, path] = line.split(/\s+/);
        await cmd.cat(path);
      } else if (/^add\s+/.test(line)) {
        const [_, path] = line.split(/\s+/);
        await cmd.add(path);
      } else if (/^mkdir\s+/.test(line)) {
        const [_, path] = line.split(/\s+/);
        await cmd.mkdir(path);
      } else if (/^rn\s+/.test(line)) {
        const [_, src, dst] = line.split(/\s+/);
        await cmd.rn(src, dst);
      }
    }
  }
}