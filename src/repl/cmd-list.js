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
  getSHA256,
  moveFile,
  printFileContents,
  removeDir,
  renameFile,
  resolvePath
} from "../utils/index.js";

const getCPUs = () => {
  return os.cpus().map(({ model, speed }) => {
    return {
      model: model.trim(),
      speed: `${(speed / 1000).toFixed(1)}GHz`
    }
  });
}

export const CommandList = {
  home: () => process.chdir(resolvePath(os.homedir())),
  cls: () => console.clear(),
  cd: (path) => {
    path = path === '?' ? import.meta.dirname + '/..' : path;
    process.chdir(resolvePath(path));
  },
  up: () => {
    process.chdir(resolvePath('..'));
  },
  ls: getCurrentDirItems,
  cat: printFileContents,
  add: createEmptyFile,
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
  hash: async (path) => {
    return style('gray', 'SHA256: ') + await getSHA256(path);
  },
  compress: compressBrotli,
  decompress: decompressBrotli,
  os: {
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
