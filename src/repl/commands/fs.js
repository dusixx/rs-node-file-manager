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
  moveFile,
  printFileContents,
  removeDir,
  renameFile,
  resolvePath
} from "../../common/utils/index.js";
import { HOMEDIR_PATH_ALIAS } from '../repl.constants.js';

export default {
  cls: () => console.clear(),
  cd: (path) => {
    path = path === HOMEDIR_PATH_ALIAS ? os.homedir() : path;
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
};