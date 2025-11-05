import fs, { Dirent } from "fs";
import path from "path";
import { CustomError } from "./misc.js";

/**
 * @param {string} path 
 * @param {string} mode 
 */
const checkAccess = async (path, mode) => {
  try {
    await fs.promises.access(path, mode);
    return true;
  } catch {
    return false;
  }
};

/**
 * @param {string} path
 * @returns {Promise<{
 * exists: boolean, 
 * readable: boolean, 
 * writeable: boolean, 
 * isFile: boolean, 
 * isDirectory: boolean}>}
 */
export const checkPath = async (path) => {
  const result = {};
  const flags = [fs.constants.F_OK, fs.constants.R_OK, fs.constants.W_OK];
  const keys = ["exists", "readable", "writeable"];

  for (let i = 0; i < keys.length; i += 1) {
    result[keys[i]] = await checkAccess(path, flags[i]);
    if (!result.exists) {
      return result;
    }
  }
  const stats = await fs.promises.stat(path);
  result.isFile = stats.isFile();
  result.isDirectory = stats.isDirectory();

  return result;
};

/**
 * @param {string} path 
 */
export const isFileExists = async (path) => {
  const { exists, isFile } = await checkPath(path);
  return exists && isFile;
}

/**
 * @param {string[]} args 
 * @returns {string}
 */
export const resolvePath = (...args) => {
  const parts = args.map(v => path.normalize(v ?? ''));
  return path.resolve(process.cwd(), ...parts);
}

/**
 * @param {string} dirPath 
 * @returns {Promise<Dirent<string>[] | null>}
 */
export const getDirents = async (dirPath) => {
  try {
    const dirents = await fs.promises.readdir(dirPath, {
      withFileTypes: true
    });
    return dirents.length > 0 ? dirents : null;
  } catch {
    return null;
  }
};

/**
 * @param {Dirent} ent 
 */
export const getDirentType = ent => {
  const Types = {
    isFile: 'file',
    isDirectory: 'dir',
    isSymbolicLink: 'symlnk',
    isBlockDevice: 'blckdev',
    isCharacterDevice: 'chrdev',
    isFIFO: 'fifo',
    isSocket: 'sckt'
  }
  for (const [method, type] of Object.entries(Types)) {
    if (ent[method]()) {
      return type;
    }
  }
  return 'unk';
}

/**
 * @param {string} path 
 */
export const createDir = async (path) => {
  const dst = resolvePath(path);
  const info = await checkPath(dst);
  if (info.exists) {
    throw new CustomError('already exists', dst);
  }
  await fs.promises.mkdir(resolvePath(dst), {
    recursive: true
  });
}

/**
 * @param {string} oldName 
 * @param {string} newName 
 */
export const renameFile = async (oldName, newName) => {
  const src = resolvePath(oldName);
  const dst = resolvePath(newName);
  const info = await checkPath(dst);
  if (info.exists) {
    throw new CustomError('file already exists', dst);
  }
  await fs.promises.rename(src, dst);
}

/**
 * @param {string} path 
 */
export const removeDir = async (path, silent = true) => {
  const src = resolvePath(path);
  if (!silent) {
    const info = await checkPath(src);
    if (!info.exists || info.isFile) {
      throw new CustomError('no such directory', src);
    }
  }
  await fs.promises.rm(src, { recursive: true, force: true });
}

/**
 * @param {string} path 
 */
export const printFileContents = async (path) => {
  const src = resolvePath(path);
  const readStream = fs.createReadStream(src);
  await new Promise((resolve, reject) => {
    readStream.on('end', () => {
      console.log();
      resolve();
    }).on('error', reject).pipe(process.stdout);
  })
}

/**
 * @param {string} path 
 */
export const createEmptyFile = async (filePath, recursive = true) => {
  let handle;
  const src = resolvePath(filePath);

  if (recursive) {
    const srcDir = path.dirname(src);
    const srcInfo = await checkPath(srcDir);
    // create if does not exists
    if (!srcInfo.exists) {
      await createDir(srcDir);
    }
  }
  try {
    handle = await fs.promises.open(src, 'wx');
  } finally {
    await handle?.close();
  }
}

/**
 * @returns {Promise<{name: string, type: string}[]>}
 */
export const getCurrentDirItems = async () => {
  const src = resolvePath();
  const dirs = [];
  const files = [];

  for (const ent of await getDirents(src) ?? []) {
    const item = { name: ent.name, type: getDirentType(ent) }
    if (ent.isDirectory()) {
      dirs.push(item);
    } else if (ent.isFile()) {
      files.push(item);
    }
  }
  const collator = new Intl.Collator(['en-us', 'ru-ru']);
  const comp = (a, b) => collator.compare(a.name, b.name);

  return [...dirs.sort(comp), ...files.sort(comp)];
}