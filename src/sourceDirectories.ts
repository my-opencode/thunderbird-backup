import fs from "fs/promises";
import { pathArray } from "./types";
import { Directory } from "./Directory";

export async function listExistingSourceDirectories(paths: pathArray): Promise<Directory[]> {
  global.logger(`Listing existing source directories.`);
  const existing: Directory[] = [];
  for (const p of paths) {
    try {
      const dirEn = await fs.lstat(Directory.getAbsolutePath(p));
      if (dirEn.isDirectory()) {
        existing.push(new Directory(p));
      }
    } catch (err) {
      // do nothing
    }
  }
  global.logger(`Existing source directories listed.`);
  return existing;
}

export async function listChildrenToBackup(dir: Directory) {
  global.logger(`Listing children to backup.`);
  const dirents = await fs.readdir(dir.path, { withFileTypes: true });
  const directories: string[] = [];
  const mailFiles: string[] = [];
  for (const dirent of dirents) {
    if (dirent.isDirectory())
      directories.push(dirent.name);
    else if (dirent.isFile() && global.MAILFILEEXT === dirent.name.slice(-4) && dirents.find(d => d.name === dirent.name.slice(0,-4)))
      mailFiles.push(dirent.name.slice(0, -4));
  }
  global.logger(`Children to backup listed.`);
  return { directories, mailFiles };
}