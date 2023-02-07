"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listChildrenToBackup = exports.listExistingSourceDirectories = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const Directory_1 = require("./Directory");
async function listExistingSourceDirectories(paths) {
    global.logger(`Listing existing source directories.`);
    const existing = [];
    for (const p of paths) {
        try {
            const dirEn = await promises_1.default.lstat(Directory_1.Directory.getAbsolutePath(p));
            if (dirEn.isDirectory()) {
                existing.push(new Directory_1.Directory(p));
            }
        }
        catch (err) {
            // do nothing
        }
    }
    global.logger(`Existing source directories listed.`);
    return existing;
}
exports.listExistingSourceDirectories = listExistingSourceDirectories;
async function listChildrenToBackup(dir) {
    global.logger(`Listing children to backup.`);
    const dirents = await promises_1.default.readdir(dir.path, { withFileTypes: true });
    const directories = [];
    const mailFiles = [];
    for (const dirent of dirents) {
        if (dirent.isDirectory())
            directories.push(dirent.name);
        else if (dirent.isFile() && global.MAILFILEEXT === dirent.name.slice(-4) && dirents.find(d => d.name === dirent.name.slice(0, -4)))
            mailFiles.push(dirent.name.slice(0, -4));
    }
    global.logger(`Children to backup listed.`);
    return { directories, mailFiles };
}
exports.listChildrenToBackup = listChildrenToBackup;
