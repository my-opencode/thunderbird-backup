import fs from "fs/promises";

export async function abortIfLocked() {
  try {
    await fs.readFile(lockFileAbs || ``, { encoding: `utf-8` });
    console.log(`Locked! Close all instances or delete lock file before running.`);
    process.exit(2);
  } catch (err) {
    // do nothing
  }
}

export async function createLockFile() {
  console.log(`Creating lock file.`);
  if (lockFileAbs)
    await fs.writeFile(lockFileAbs, ``, { encoding: `utf-8` });
  console.log(`Lock file created.`);
}