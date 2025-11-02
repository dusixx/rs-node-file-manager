import { REPL } from "./repl/repl.js";

const [key, value] = (process.argv.slice(2)[0] ?? '').split('=');
const username = key === '--username' ? value.replace(/\W/g, '') : '';

REPL.getInstance({ username, prompt: '> ' }).run();
