"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const exit_1 = require("./exit");
const prepare_1 = require("./prepare");
const backupRepositories_1 = require("./backupRepositories");
require("core-js/modules/es.string.replace-all");
const rootPath_1 = require("./rootPath");
const logger_1 = require("./logger");
const cleanup_1 = require("./cleanup");
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
async function run(exePath) {
    global.runStartTime = process.hrtime();
    (0, logger_1.setLogger)();
    (0, rootPath_1.setRootPath)(exePath);
    try {
        global.logger(`Running.`);
        const { existingDirectories } = await (0, prepare_1.prepare)();
        await (0, backupRepositories_1.backupRepositories)(existingDirectories);
        global.logger(`Backup complete.`);
        await (0, cleanup_1.cleanup)();
        await (0, exit_1.exit)();
    }
    catch (err) {
        console.error(err);
        await (0, exit_1.exit)(err instanceof Error ? err.message : `Unexpected error.`);
    }
}
exports.run = run;
