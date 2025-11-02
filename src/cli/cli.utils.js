import os from 'os';
import { styleText as style } from 'util';

export const DefaultProps = {
  Prompt: '# ',
  Username: 'anonymous',
  ExitCmd: '.exit',
  WorkingDir: os.homedir()
}
export const salutation = (username = DefaultProps.Username) => {
  return style("cyan", `\nWelcome to the File Manager, ${username}`
    + `\nEnter "${DefaultProps.ExitCmd}" or use "CTRL+C" to finish`
  );
}
export const farewell = (username = DefaultProps.Username) => {
  return style("cyan", `Thank you for using File Manager, ${username}, goodbye!`
  );
}
export const currentlyIn = (workingDir) => {
  return style("gray", `You are currently in `) + workingDir;
}