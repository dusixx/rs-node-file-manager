import os from 'os';
import { isFunc } from "../../common/utils/misc.js";

const getCPUs = () => {
  return os.cpus().map(({ model, speed }) => {
    return {
      model: model.trim(),
      speed: `${(speed / 1000).toFixed(1)}GHz`
    }
  });
}

const getOSModuleFuncs = () => {
  const funcs = Object.entries(os).filter(([, v]) => isFunc(v));
  return Object.fromEntries(funcs);
}

export default {
  ...getOSModuleFuncs(),
  cpus() {
    const items = getCPUs();
    console.log('Cores total:', items.length);
    return items;
  },
  username: () => os.userInfo().username,
  architecture: () => os.arch(),
  EOL: () => os.EOL.replace(/\r/, '\\r').replace(/\n/, '\\n'),
  test: {
    test: {
      test: (s) => console.log(s)
    }
  },
}