import fs from 'fs';
import os from 'os';
import { styleText as style } from 'util';
import {
  compressBrotli,
  copyFile,
  createDir,
  createEmptyFile,
  decompressBrotli,
  getCurrentDirItems,
  getHash,
  isFunc,
  moveFile,
  printFileContents,
  removeDir,
  renameFile,
  resolvePath
} from "../../common/utils/index.js";
import { CommandDescList, EXIT_CMD, HELP_CMD } from '../repl.constants.js';
import { REPL } from '../repl.js';
import { buildUsage } from './usage.js';

const getCPUs = () => {
  return os.cpus().map(({ model, speed }) => {
    return {
      model: model.trim(),
      speed: `${(speed / 1000).toFixed(1)}GHz`
    }
  });
}

const SpecialCommandList = {
  [EXIT_CMD]: () => REPL.getInstance().exit(),
  [HELP_CMD]: () => buildUsage(CommandList, CommandDescList),
}

const getOSModuleFuncs = () => {
  const funcs = Object.entries(os).filter(([, v]) => isFunc(v));
  return Object.fromEntries(funcs);
}

export const CommandList = {
  ...SpecialCommandList,
  cls: () => console.clear(),
  cd: (path) => {
    path = path === '~' ? os.homedir() : path;
    process.chdir(resolvePath(path));
  },
  up: () => {
    process.chdir(resolvePath('..'));
  },
  ls: getCurrentDirItems,
  cat: printFileContents,
  add: (path) => createEmptyFile(path),
  mkdir: createDir,
  rmdir: async (path) => {
    await removeDir(path, false);
  },
  rn: renameFile,
  cp: copyFile,
  mv: moveFile,
  rm: async (path) => {
    await fs.promises.unlink(resolvePath(path));
  },
  hash: async (path, alg = 'sha256') => {
    return style('gray', `${alg}: `) + await getHash(path, alg);
  },
  compress: async (src, dst = src) => {
    await compressBrotli(src, dst);
  },
  decompress: decompressBrotli,
  os: {
    ...getOSModuleFuncs(),
    test: {
      test: {
        test: (s) => console.log(s)
      }
    },
    cpus() {
      const items = getCPUs();
      console.log('Cores total:', items.length);
      return items;
    },
    homedir: () => os.userInfo().homedir,
    username: () => os.userInfo().username,
    architecture: () => os.arch(),
    EOL: () => os.EOL.replace(/\r/, '\\r').replace(/\n/, '\\n')
  }
};