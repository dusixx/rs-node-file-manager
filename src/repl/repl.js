import { CLI } from "../cli/cli.js";
import { EXTRA_DESC } from "./repl.constants.js";
import { evaluate } from './utils/eval.js';

export class REPL {
  /** @type {REPL} */
  static #instance;
  #cli;

  constructor(props) {
    if (REPL.#instance) {
      return REPL.#instance;
    }
    this.#cli = new CLI(props);
    this.#init();
    REPL.#instance = this;
  }
  /**
   * @param {{
   * username: string, 
   * prompt: string, 
   * workingDir: string}} props 
   */
  static getInstance(props) {
    return this.#instance ?? (this.#instance = new REPL(props));
  }
  run() {
    this.#cli.run(EXTRA_DESC);
  }
  exit() {
    this.#cli.close();
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