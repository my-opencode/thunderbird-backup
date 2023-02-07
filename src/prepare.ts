import { listExistingSourceDirectories } from "./sourceDirectories";
import { exit } from "./exit";
import { loadConfig } from "./config";
import { createLockFile, abortIfLocked } from "./lockFile";
import { loadKnownMails } from "./knownMails";
import { createExportRootDirectories } from "./targetDirectories";

export async function prepare() {
  console.log(`preparing`);
  const { sourceDirectories } = await loadConfig();
  await abortIfLocked();
  await createLockFile();
  await loadKnownMails();
  const existingDirectories = await listExistingSourceDirectories(sourceDirectories);
  if (!existingDirectories.length) {
    await exit(`No source directory exists.`);
    throw new Error(`No source directory exists.`); // for ts conditional types
  }
  await createExportRootDirectories(existingDirectories);
  console.log(`Prepared.`);
  return { existingDirectories };
}


