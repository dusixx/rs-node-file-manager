import fs from 'fs';
import path from 'path';
import streamPromises from 'stream/promises';
import zlib from 'zlib';
import { checkPath, createDir, isFileExists, resolvePath } from './fs.js';
import { CustomError } from './misc.js';

const MethodExtensionMap = {
  BrotliCompress: '.br',
  BrotliDecompress: '',
  ZstdCompress: '.zst',
  ZstdDecompress: '',
  Gzip: '.gz',
  Gunzip: '',
}

/**
 * @param {string} srcFile 
 * @param {string} dstFile 
 */
const validatePaths = async (srcFile, dstFile) => {
  let wasDstDirJustCreated = false;
  srcFile = resolvePath(srcFile);
  dstFile = resolvePath(dstFile);

  if (!await isFileExists(srcFile)) {
    throw new CustomError('no such file', srcFile);
  }
  if ((await checkPath(dstFile)).isDirectory) {
    throw new CustomError('destination file is not specified', dstFile);
  }
  const dstDir = path.dirname(dstFile);
  const dstInfo = await checkPath(dstDir);
  if (dstInfo.isFile) {
    throw new CustomError('not a directory', dstDir);
  }
  // create if does not exists
  if (!dstInfo.exists) {
    await createDir(dstDir);
    wasDstDirJustCreated = true;
  }
  return { srcFile, dstFile, dstDir, wasDstDirJustCreated };
}

/**
 * @typedef {keyof typeof MethodExtensionMap} CompressionMethod
 * @param {string} srcFilePath
 * @param {string} dstFilePath
 * @param {{ method: CompressionMethod, deleteSource: boolean, appendExtension: boolean }} options
 */
export const compressDecompressFile = async (srcFilePath, dstFilePath, {
  method,
  deleteSource = true,
  appendExtension = true
} = {}) => {
  if (!Object.hasOwn(MethodExtensionMap, method)) {
    throw Error(`unsupported method: ${method}`);
  }
  let { wasDstDirJustCreated, srcFile, dstFile, dstDir } = await validatePaths(srcFilePath, dstFilePath);

  // append ext for file to be compressed only
  if (appendExtension) {
    dstFile += MethodExtensionMap[method] ?? '';
  }
  if (await isFileExists(dstFile)) {
    throw new CustomError('file already exists', dstFile);
  }
  let wasDstFileJustCreated;
  try {
    const zlibStream = zlib[`create${method}`]();
    const readStream = fs.createReadStream(srcFile);
    const writeStream = fs.createWriteStream(dstFile);

    // wait until dstFile is created
    wasDstFileJustCreated = await new Promise((resolve) => {
      writeStream.on('open', () => resolve(true));
    });

    await streamPromises.pipeline(readStream, zlibStream, writeStream);
    // remove src file
    if (deleteSource) {
      await fs.promises.unlink(srcFile);
    }
  } catch (err) {
    // clean up
    if (wasDstDirJustCreated) {
      await fs.promises.rm(dstDir, { recursive: true, force: true });
    } else if (wasDstFileJustCreated) {
      await fs.promises.unlink(dstFile);
    }
    throw err;
  }
};

/**
 * @param {string} src 
 * @param {string} dst 
 */
export const compressBrotli = async (src, dst) => {
  await compressDecompressFile(src, dst, {
    method: 'BrotliCompress',
    deleteSource: true
  });
}

/**
 * @param {string} src 
 * @param {string} dst 
 */
export const decompressBrotli = async (src, dst) => {
  await compressDecompressFile(src, dst, {
    method: 'BrotliDecompress',
    deleteSource: true
  });
}