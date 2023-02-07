import { listExistingSourceDirectories } from "./sourceDirectories";
import { exit } from "./exit";
import { loadConfig } from "./config";
import { createLockFile, abortIfLocked } from "./lockFile";
import { loadKnownMails } from "./knownMails";
import { loadKnownMailLocations } from "./knownMailLocations";
import { createExportRootDirectories } from "./targetDirectories";

export async function prepare() {
  global.logger(`preparing`);
  const { sourceDirectories } = await loadConfig();
  await abortIfLocked();
  await createLockFile();
  await loadKnownMails();
  await loadKnownMailLocations();
  const existingDirectories = await listExistingSourceDirectories(sourceDirectories);
  if (!existingDirectories.length) {
    await exit(`No source directory exists.`);
    throw new Error(`No source directory exists.`); // for ts conditional types
  }
  await createExportRootDirectories(existingDirectories);
  global.logger(`Prepared.`);
  return { existingDirectories };
}


