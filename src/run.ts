import { exit } from "./exit";
import { prepare } from "./prepare";
import { backupRepositories } from "./backupRepositories";
import "core-js/modules/es.string.replace-all";
import { setRootPath } from "./rootPath";
import { setLogger } from "./logger";

global.MAILFILEEXT = `.msf`;
global.lockFileName = `current_lock`;
global.knownMailFileName = `known_mails`;
global.knownMailLocationFileName = `known_mail_locations`;
global.errorsDecodeFileName = `errors_decode`;
global.errorsNoIdFileName = `errors_id`;
global.knownMails = new Set();
global.knownMailLocations = new Map();

export async function run(exePath?: string) {
  setLogger();
  setRootPath(exePath);
  try {
    global.logger(`Running.`);
    const { existingDirectories } = await prepare();
    await backupRepositories(existingDirectories);
    global.logger(`Backup complete.`);
    await exit();
  } catch (err) {
    console.error(err);
    await exit(err instanceof Error ? err.message : `Unexpected error.`);
  }
}
