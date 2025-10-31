export const parseArgs = () => {
  const map = {};
  let cur;

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--")) {
      cur = arg;
      continue;
    }
    (map[cur] = map[cur] ?? []).push(arg);
  }
  return map;
};
