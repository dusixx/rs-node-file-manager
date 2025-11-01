import { Interpreter } from "./interpreter/interpreter.js";
import { parseArgs } from "./utils/index.js";

const { username } = parseArgs();

new Interpreter({ username }).run();
