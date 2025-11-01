import { EOL } from "os";
import { chdir, cwd, stdin, stdout } from "process";
import readline from "readline";
import { isFunc, isStr } from "../../utils/misc.js";
import { currentlyIn, DefaultProps, farewell, salutation } from "./cli.utils.js";

export class CommandLineInterface {
  static instance;
  /** @type {readline.Interface} */
  #readline;
  #username;
  #prompt;
  #onLine;
  #onClose;
  #closed = true;

  constructor({ username, prompt } = {}) {
    if (CommandLineInterface.instance) {
      return CommandLineInterface.instance;
    }
    this.username = username;
    this.prompt = prompt;
    CommandLineInterface.instance = this;
  }

  run() {
    const rl = this.#readline = readline.createInterface({
      input: stdin,
      output: stdout
    });
    this.#closed = false;
    this.#salutation();
    this.#updatePrompt({ show: true });

    rl.on("line", async (line) => {
      const trimmed = line.trim();

      if (trimmed === DefaultProps.ExitCmd) {
        rl.close();
        return;
      }
      await this.#onLine?.(trimmed);
      if (this.isClosed) {
        return;
      }
      console.log();
      this.#updatePrompt({ show: true });
    })
      .on('SIGINT', () => {
        console.log(`^C`);
        rl.close();
      })
      .on("close", () => {
        console.log(EOL, farewell(this.#username));
        this.#onClose?.();
        this.#closed = true;
      });
  }

  close() {
    this.#readline.close();
  }

  /** @param {{show: boolean, preserveCursor: boolean}} props */
  #updatePrompt({ show, preserveCursor } = {}) {
    if (!this.isClosed) {
      this.#readline.setPrompt(`${currentlyIn(this.workingDirectory)}${EOL}${this.#prompt}`);
      if (show) {
        this.#readline.prompt(preserveCursor);
      }
    }
  }

  #salutation() {
    console.clear();
    console.log(EOL, salutation(this.#username), EOL);
  }

  get isClosed() {
    return this.#closed;
  }

  set prompt(s) {
    this.#prompt = isStr(s) ? s : DefaultProps.Prompt;
  }

  set username(s) {
    this.#username = isStr(s) && s ? s : DefaultProps.Username;
  }

  get workingDirectory() {
    return cwd();
  }

  set workingDirectory(path) {
    try {
      chdir(path);
    } catch { }
  }
  /**
   * @typedef {(line: string) => Promise<void> | (line: string) => void} OnLineHandler
   * @param {OnLineHandler | null} handler 
   */
  set onLine(handler) {
    this.#onLine = isFunc(handler) ? handler : null;
  }
  /** 
   * @typedef {() => Promise<void> | () => void} OnCloseHandler
   * @param {OnCloseHandler | null} handler 
   */
  set onClose(handler) {
    this.#onClose = isFunc(handler) ? handler : null;
  }
}