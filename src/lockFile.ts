import fs from "fs/promises";
import { readlineInterface } from "./readlineInterface";
export async function abortIfLocked() {
  try {
    await fs.readFile(lockFileAbs || ``, { encoding: `utf-8` });
    global.logger(`Locked! Close all instances or delete lock file in your destination folder before running.`);
    readlineInterface.pause();
    readlineInterface.question('Press enter to close', () => {
      readlineInterface.write('Closing');
      readlineInterface.close();
      process.exit(2);
    });
  } catch (err) {
    // do nothing
  }
}

export async function createLockFile() {
  global.logger(`Creating lock file.`);
  if (lockFileAbs)
    await fs.writeFile(lockFileAbs, ``, { encoding: `utf-8` });
  global.logger(`Lock file created.`);
}