import fs, { Dirent } from "fs";
import fsPromises from "fs/promises";
import path from "path";

const checkAccess = async (path, mode) => {
  try {
    await fsPromises.access(path, mode);
    return true;
  } catch {
    return false;
  }
};

/**
 * @param {string} path
 * @returns {Promise<{exists: boolean, readable: boolean, writeable: boolean, isFile: boolean}>}
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
  const stats = await fsPromises.stat(path);
  result.isFile = stats.isFile();

  return result;
};

/**
 * @param {string[]} args 
 * @returns {string}
 */
export const resolvePath = (...args) => {
  return path.resolve(process.cwd(), ...args.map(v => path.normalize(v ?? '')));
}

/**
 * @param {string} dirPath 
 * @returns {Promise<Dirent<string>[] | null>}
 */
export const getDirents = async (dirPath) => {
  try {
    const dirents = await fsPromises.readdir(dirPath, {
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
  await fsPromises.mkdir(resolvePath(path), {
    recursive: true
  });
}

/**
 * @param {string} path 
 */
export const printFileContents = async (path) => {
  const src = resolvePath(path);
  const readStream = fs.createReadStream(src);
  await new Promise((resolve) => {
    readStream.on('end', () => {
      console.log();
      resolve();
    }).pipe(process.stdout);
  })
}

/**
 * @param {string} path 
 */
export const createFile = async (path) => {
  let handle;
  const src = resolvePath(path);
  try {
    handle = await fs.promises.open(src, 'wx');
  } finally {
    await handle?.close();
  }
}

export const listDirItems = async () => {
  const src = resolvePath();
  return (await getDirents(src) ?? []).reduce((res, ent) => {
    return res.concat({
      name: ent.name,
      type: getDirentType(ent)
    });
  }, []);
}