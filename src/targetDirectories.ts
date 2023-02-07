import fs from "fs/promises";
import path from "path";
import { Directory } from "./Directory";
import { exit } from "./exit";

export async function createExportRootDirectories(directories: Directory[]) {
  console.log(`Creating export root directories.`);
  if (!exportDirAbs?.path) {
    await exit(`Export directory not set.`);
    throw new Error(`No source directory exists.`); // for ts conditional types
  }
  for (const p of directories) {
    await fs.mkdir(path.resolve(exportDirAbs.path, p.name), { recursive: true });
  }
  console.log(`Export root directories created.`);
}