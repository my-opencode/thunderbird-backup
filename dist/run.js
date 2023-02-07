"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const exit_1 = require("./exit");
const prepare_1 = require("./prepare");
const backupRepositories_1 = require("./backupRepositories");
global.MAILFILEEXT = `.msf`;
global.lockFileName = `current_lock`;
global.knownMailFileName = `known_mails`;
global.knownMails = new Set();
async function run() {
    try {
        console.log(`Running.`);
        const { existingDirectories } = await (0, prepare_1.prepare)();
        await (0, backupRepositories_1.backupRepositories)(existingDirectories);
        console.log(`Backup complete.`);
        (0, exit_1.exit)();
    }
    catch (err) {
        console.error(err);
        await (0, exit_1.exit)(err instanceof Error ? err.message : `Unexpected error.`);
    }
}
exports.run = run;
