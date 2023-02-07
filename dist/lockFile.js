"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLockFile = exports.abortIfLocked = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const exit_1 = require("./exit");
async function abortIfLocked() {
    try {
        await promises_1.default.readFile(lockFileAbs || ``, { encoding: `utf-8` });
        await (0, exit_1.exit)(`Locked! Close all instances or delete lock file before running.`);
    }
    catch (err) {
        // do nothing
    }
}
exports.abortIfLocked = abortIfLocked;
async function createLockFile() {
    console.log(`Creating lock file.`);
    if (lockFileAbs)
        await promises_1.default.writeFile(lockFileAbs, ``, { encoding: `utf-8` });
    console.log(`Lock file created.`);
}
exports.createLockFile = createLockFile;
