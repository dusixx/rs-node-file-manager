import os from 'os';
import { styleText as style } from 'util';
import { isNonEmptyStr } from '../common/utils/misc.js';

export const DefaultProps = {
  Prompt: '# ',
  Username: 'anonymous',
  WorkingDir: os.homedir()
}
export const salutation = (username = DefaultProps.Username, extraDesc = '') => {
  return style("cyan", `\nWelcome to the File Manager, ${username}`
    + (isNonEmptyStr(extraDesc) ? `\n${extraDesc}` : '')
  );
}
export const farewell = (username = DefaultProps.Username) => {
  return style("cyan", `Thank you for using File Manager, ${username}, goodbye!`
  );
}
export const currentlyIn = (workingDir) => {
  return style("gray", `You are currently in `) + workingDir;
}