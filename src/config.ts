import fs from "fs/promises";
import path from "path";
import { Directory } from "./Directory";

import { IConfig, IConfigRaw } from "./types";

export async function loadConfig(): Promise<IConfig> {
  console.log(`Loading config.`);
  const config : IConfigRaw = JSON.parse(await fs.readFile(path.resolve(__dirname, `..`, `config.json`), { encoding: `utf-8` }));
  if (config.exportDirectory) {
    global.exportDirAbs = new Directory(config.exportDirectory);
  } else {
    global.exportDirAbs = new Directory(`out`);
    config.exportDirectory = `out`;
  }
  global.lockFileAbs = path.resolve(global.exportDirAbs.path, global.lockFileName);
  console.log(`Config loaded.`);
  return config as IConfig;
}