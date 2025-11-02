import fs from 'fs';
import os from 'os';
import {
  compressBrotli,
  copyFile,
  createDir,
  createFile,
  decompressBrotli,
  getSHA256,
  listDirItems,
  moveFile,
  printFileContents,
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

export const Commands = {
  clear: () => console.clear(),
  cd: (path) => {
    path = path === '?' ? import.meta.dirname + '/..' : path;
    process.chdir(resolvePath(path));
  },
  up: () => {
    process.chdir(resolvePath('..'));
  },
  ls: listDirItems,
  cat: printFileContents,
  add: createFile,
  mkdir: createDir,
  rmdir: async (path) => {
    await fs.promises.rmdir(path);
  },
  rn: async (oldPath, newPath) => {
    await fs.promises.rename(resolvePath(oldPath), resolvePath(newPath))
  },
  cp: copyFile,
  mv: moveFile,
  rm: async (path) => {
    await fs.promises.unlink(resolvePath(path));
  },
  hash: getSHA256,
  compress: compressBrotli,
  decompress: decompressBrotli,
  os: {
    cpus: getCPUs,
    homedir: () => os.userInfo().homedir,
    username: () => os.userInfo().username,
    architecture: () => os.arch(),
    EOL: () => os.EOL.replace(/\r/, '\\r').replace(/\n/, '\\n')
  }
};
