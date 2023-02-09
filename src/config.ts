import fs from "fs/promises";
import path from "path";
import { Directory } from "./Directory";

import { IConfig, IConfigRaw } from "./types";

export async function loadConfig(): Promise<IConfig> {
  const confPath = getConfigPath();
  global.logger(`Loading config from ${confPath}.`);
  const config: IConfigRaw = JSON.parse(await fs.readFile(confPath, { encoding: `utf-8` }));
  if (config.exportDirectory) {
    global.exportDirAbs = new Directory(config.exportDirectory);
  } else {
    global.exportDirAbs = new Directory(`out`);
    config.exportDirectory = `out`;
  }
  global.lockFileAbs = path.resolve(global.exportDirAbs.path, global.lockFileName);
  global.logger(`Config loaded.`);
  return config as IConfig;
}

export function getConfigPath() {
  // check argv
  if (process.argv.includes(`--config`)) {
    const configDirPath = process.argv[process.argv.indexOf(`--config`) + 1].trim();
    if (configDirPath?.length)
      if (path.isAbsolute(configDirPath))
        return configDirPath;
      else return path.resolve(global.__dirname, configDirPath);
  }
  // get default (executable folder)
  return path.resolve(global.__dirname, `config.json`);
}