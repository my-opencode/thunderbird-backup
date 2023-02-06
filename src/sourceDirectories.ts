import fs from "fs/promises";
import { pathArray } from "./types";
import { Directory } from "./Directory";

export async function listExistingSourceDirectories(paths: pathArray): Promise<Directory[]> {
  console.log(`Listing existing source directories.`);
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
  console.log(`Existing source directories listed.`);
  return existing;
}

export async function listChildrenToBackup(dir: Directory) {
  console.log(`Listing children to backup.`);
  const dirents = await fs.readdir(dir.path, { withFileTypes: true });
  const directories: string[] = [];
  const mailFiles: string[] = [];
  for (const dirent of dirents) {
    if (dirent.isDirectory())
      directories.push(dirent.name);
    else if (dirent.isFile() && global.MAILFILEEXT === dirent.name.slice(-4))
      mailFiles.push(dirent.name.slice(0, -4));
  }
  console.log(`Children to backup listed.`);
  return { directories, mailFiles };
}