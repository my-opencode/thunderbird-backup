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
    else if (dirent.isFile() && global.MAILFILEEXT === dirent.name.slice(-4)){
      const mboxFileName = dirent.name.slice(0, -4);
      const mboxFile = dirents.find(d => d.name === mboxFileName);
      // there are msf files for folders, make sure only to open files
      if (mboxFile?.isFile())
        mailFiles.push(mboxFileName);
      }
  }
  global.logger(`Children to backup listed.`);
  return { directories, mailFiles };
}