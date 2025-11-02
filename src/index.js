import { REPL } from "./repl/repl.js";
import { parseScriptArgs } from "./utils/index.js";

const { username } = parseScriptArgs();

new REPL({ username }).run();
