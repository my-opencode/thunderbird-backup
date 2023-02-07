"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLockFile = exports.abortIfLocked = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const readlineInterface_1 = require("./readlineInterface");
async function abortIfLocked() {
    try {
        await promises_1.default.readFile(lockFileAbs || ``, { encoding: `utf-8` });
        global.logger(`Locked! Close all instances or delete lock file before running.`);
        readlineInterface_1.readlineInterface.pause();
        readlineInterface_1.readlineInterface.question('Press enter to close', () => {
            readlineInterface_1.readlineInterface.write('Closing');
            readlineInterface_1.readlineInterface.close();
            process.exit(2);
        });
    }
    catch (err) {
        // do nothing
    }
}
exports.abortIfLocked = abortIfLocked;
async function createLockFile() {
    global.logger(`Creating lock file.`);
    if (lockFileAbs)
        await promises_1.default.writeFile(lockFileAbs, ``, { encoding: `utf-8` });
    global.logger(`Lock file created.`);
}
exports.createLockFile = createLockFile;
