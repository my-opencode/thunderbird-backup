"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupRepositories = void 0;
const path_1 = __importDefault(require("path"));
const Directory_1 = require("./Directory");
const sourceDirectories_1 = require("./sourceDirectories");
const mailBox_1 = require("./mailBox");
async function backupRepositories(existingDirs) {
    for (const dir of existingDirs)
        await backupRepository(dir);
}
exports.backupRepositories = backupRepositories;
async function backupRepository(dir) {
    console.log(`Backing "${dir.relPath}".`);
    const { directories, mailFiles } = await (0, sourceDirectories_1.listChildrenToBackup)(dir);
    for (const mailFile of mailFiles)
        await (0, mailBox_1.backupMailBox)(dir, mailFile);
    for (const directory of directories)
        await backupRepository(new Directory_1.Directory(path_1.default.join(dir.path, directory), { relativePath: dir.appendRel(directory) }));
    console.log(`"${dir.relPath}" backed.`);
}
