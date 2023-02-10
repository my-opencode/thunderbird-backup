"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare = void 0;
const sourceDirectories_1 = require("./sourceDirectories");
const exit_1 = require("./exit");
const config_1 = require("./config");
const lockFile_1 = require("./lockFile");
const knownMails_1 = require("./knownMails");
const knownMailLocations_1 = require("./knownMailLocations");
const targetDirectories_1 = require("./targetDirectories");
const errorLogFile_1 = require("./errorLogFile");
const previousUpdate_1 = require("./previousUpdate");
async function prepare() {
    global.logger(`preparing`);
    const { sourceDirectories } = await (0, config_1.loadConfig)();
    await (0, lockFile_1.abortIfLocked)();
    await (0, lockFile_1.createLockFile)();
    await (0, errorLogFile_1.clearErrorLogFiles)();
    await (0, knownMails_1.loadKnownMails)();
    await (0, knownMailLocations_1.loadKnownMailLocations)();
    await (0, previousUpdate_1.refreshLastUpdateFile)();
    const existingDirectories = await (0, sourceDirectories_1.listExistingSourceDirectories)(sourceDirectories);
    if (!existingDirectories.length) {
        await (0, exit_1.exit)(`No source directory exists.`);
        throw new Error(`No source directory exists.`); // for ts conditional types
    }
    await (0, targetDirectories_1.createExportRootDirectories)(existingDirectories);
    global.logger(`Prepared.`);
    return { existingDirectories };
}
exports.prepare = prepare;
