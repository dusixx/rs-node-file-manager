import { CLI } from "../cli/cli.js";
import { evaluate } from "./repl.utils.js";

export class REPL {
  static instance;
  #cli;

  constructor(props) {
    if (REPL.instance) {
      return REPL.instance;
    }
    this.#cli = new CLI(props);
    this.#init();
    REPL.instance = this;
  }
  run() {
    this.#cli.run();
  }
  #init() {
    this.#cli.onLine = async (line) => {
      await evaluate(line);
    }
    this.#cli.onClose = () => {
      process.exit(0);
    }
  }
}