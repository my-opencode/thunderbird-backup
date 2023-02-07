import path from "path";
import { Directory } from "./Directory";
import { listChildrenToBackup } from "./sourceDirectories";
import { backupMailBox } from "./mailBox";


export async function backupRepositories(existingDirs: Directory[]) {
  for (const dir of existingDirs)
    await backupRepository(dir);
}

async function backupRepository(dir: Directory) {
  console.log(`Backing "${dir.relPath}".`);
  const { directories, mailFiles } = await listChildrenToBackup(dir);
  for (const mailFile of mailFiles)
    await backupMailBox(dir, mailFile);
  for (const directory of directories)
    await backupRepository(new Directory(
      path.join(dir.path, directory),
      { relativePath: dir.appendRel(directory) }
    ));
  console.log(`"${dir.relPath}" backed.`);
}

