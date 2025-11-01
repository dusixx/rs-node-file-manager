import { Log } from "../../utils/misc.js";

const $ = Log.style;

export const DefaultProps = {
  Prompt: '# ',
  Username: 'anonymous',
  ExitCmd: '.exit',
  SalutationStyle: 'cyan',
  AccentStyle: 'yellow',
  HintStyle: 'magenta'
}

export const salutation = (username = DefaultProps.Username) => {
  return $(DefaultProps.SalutationStyle, `Welcome to the File Manager, `)
    + $(DefaultProps.HintStyle, username);
}

export const farewell = (username = DefaultProps.Username) => {
  return $(DefaultProps.SalutationStyle, `Thank you for using File Manager, `)
    + $(DefaultProps.HintStyle, username)
    + $(DefaultProps.SalutationStyle, `, goodbye!`);
}

export const currentlyIn = (workingDir) => {
  return $(DefaultProps.HintStyle, `You are currently in `)
    + $(DefaultProps.AccentStyle, workingDir);
}