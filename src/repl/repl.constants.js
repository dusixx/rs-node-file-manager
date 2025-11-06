export const NESTED_CMD_PREFIX = '--';
export const HOMEDIR_PATH_ALIAS = '~';
export const EXIT_CMD = '.exit';
export const HELP_CMD = '.help';

export const EXTRA_DESC =
  `Enter "${EXIT_CMD}" or use "CTRL+C" to finish.\nEnter "${HELP_CMD}" to display a list of commands.`

export const CommandDescList = {
  cls: 'clear screen',
  cd: 'change directory',
  home: 'change directory to homedir',
  up: 'change directory to parent',
  ls: 'list of directory entities',
  cat: 'display file contents',
  add: 'create empty file',
  mkdir: 'create directory',
  rmdir: 'remove directory',
  rn: 'rename file',
  rm: 'remove file',
  cp: 'copy file to specified directory',
  mv: 'move file to specified directory',
  hash: 'display hash for specified file',
  compress: 'create brotli archive',
  decompress: 'decompress brotli archive',
  os: {
    cpus: 'show logical CPU cores info',
    test: {
      test: {
        test: 'test'
      }
    },
  }
}