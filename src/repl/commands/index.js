import { CommandDescList, EXIT_CMD, HELP_CMD } from '../repl.constants.js';
import { REPL } from '../repl.js';
import { buildUsage } from '../utils/usage.js';
import fsCommands from './fs.js';
import osCommands from './os.js';

export const CommandList = {
  [EXIT_CMD]: () => REPL.getInstance().exit(),
  [HELP_CMD]: () => buildUsage(CommandList, CommandDescList),
  ...fsCommands,
  os: {
    ...osCommands
  },
}