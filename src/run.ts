import { exit } from "./exit";
import { prepare } from "./prepare";
import { backupRepositories } from "./backupRepositories";
import "core-js/modules/es.string.replace-all";
import { setRootPath } from "./rootPath";
import { setLogger } from "./logger";
import { cleanup } from "./cleanup";

global.MAILFILEEXT = `.msf`;
global.lockFileName = `current_lock`;
global.previousUpdateFileName = `last_update`;
global.knownMailFileName = `known_mails`;
global.knownMailLocationFileName = `known_mail_locations`;
global.errorsDecodeFileName = `errors_decode`;
global.errorsNoIdFileName = `errors_id`;
global.errorsMoveFileName = `errors_move`;
global.knownMails = new Set();
global.knownMailLocations = new Map();

global.savedCount = 0;
global.movedCount = 0;
global.idErrorCount = 0;
global.encodingErrorCount = 0;
global.moveErrorCount = 0;

export async function run(exePath?: string) {
  global.runStartTime = process.hrtime();
  setLogger();
  setRootPath(exePath);
  try {
    global.logger(`Running.`);
    const { existingDirectories } = await prepare();
    await backupRepositories(existingDirectories);
    global.logger(`Backup complete.`);
    await cleanup();
    await exit();
  } catch (err) {
    console.error(err);
    await exit(err instanceof Error ? err.message : `Unexpected error.`);
  }
}
