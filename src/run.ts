import { exit } from "./exit";
import { prepare } from "./prepare";
import { backupRepositories } from "./backupRepositories";

global.MAILFILEEXT = `.msf`;
global.lockFileName = `current_lock`;
global.knownMailFileName = `known_mails`;
global.knownMailLocationFileName = `known_mail_locations`;
global.knownMails = new Set();
global.knownMailLocations = new Map();

export async function run() {
  try {
    console.log(`Running.`);
    const { existingDirectories } = await prepare();
    await backupRepositories(existingDirectories);
    console.log(`Backup complete.`);
    exit();
  } catch (err) {
    console.error(err);
    await exit(err instanceof Error ? err.message : `Unexpected error.`);
  }
}
