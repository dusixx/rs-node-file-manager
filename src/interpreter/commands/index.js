import fs from 'fs';
import fsPromises from 'fs/promises';
import { getDirents, resolvePath } from "../../utils/index.js";

const changeDir = (path) => {
  process.chdir(resolvePath(path));
}

const listDirItems = async (path) => {
  const src = resolvePath(path);
  return (await getDirents(src) ?? []).reduce((res, ent) => {
    return res.concat({ name: ent.name, type: ent.isFile() ? 'file' : 'dir' });
  }, []);
}

const readFile = async (path) => {
  const src = resolvePath(path);
  const readStream = fs.createReadStream(src);
  await new Promise((resolve) => {
    readStream.on('end', () => {
      console.log();
      resolve();
    }).pipe(process.stdout);
  })
}

const createFile = async (path) => {
  let fd;
  const src = resolvePath(path);
  try {
    fd = await fsPromises.open(src, 'wx');
  } finally {
    await fd?.close();
  }
}

const createDir = async (path) => {
  await fsPromises.mkdir(resolvePath(path), {
    recursive: true
  });
}

const rename = async (oldPath, newPath) => {
  const src = resolvePath(oldPath);
  const dst = resolvePath(newPath);
  await fsPromises.rename(src, dst)
}

const copyFile = async (srcFile, dstDir) => {
  const src = resolvePath(srcFile);
  const dst = resolvePath(dstDir);

  const rs = fs.createReadStream(src);
  const ws = fs.createWriteStream(dst);

  await new Promise((resolve) => rs.on('end', resolve).pipe(ws));
}

export default {
  cd: changeDir,
  ls: listDirItems,
  cat: readFile,
  add: createFile,
  mkdir: createDir,
  rn: rename,
  cp: copyFile
};

