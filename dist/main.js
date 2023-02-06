"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const promises_2 = require("readline/promises");
let exportDirAbs = undefined;
const lockFileName = `current_lock`;
const knownMailFileName = `known_mails`;
let lockFileAbs = undefined;
let knownMails = [];
run();
async function run() {
    try {
        const { existingDirectories } = await prepare();
        await backupRepositories(existingDirectories);
    }
    catch (err) {
        console.error(err);
        exit(err instanceof Error ? err.message : `Unexpected error.`);
    }
}
async function exit(msg) {
    if (msg)
        console.log(msg);
    if (lockFileAbs)
        await promises_1.default.rm(lockFileAbs);
    process.exit(1);
}
async function prepare() {
    const { sourceDirectories } = await loadConfig();
    await abortIfLocked();
    await createLockFile();
    await loadKnownMails();
    const existingDirectories = await listExistingSourceDirectories(sourceDirectories);
    if (!existingDirectories.length) {
        exit(`No source directory exists.`);
        throw new Error(`No source directory exists.`); // for ts conditional types
    }
    await createExportRootDirectories(existingDirectories);
    return { existingDirectories };
}
async function backupRepositories(existingDirs) {
    for (const dir of existingDirs)
        await backupRepository(dir);
}
async function loadConfig() {
    const config = JSON.parse(await promises_1.default.readFile(path_1.default.resolve(__dirname, `..`, `config.json`), { encoding: `utf-8` }));
    if (config.exportDirectory) {
        exportDirAbs = { path: getAbsolutePath(config.exportDirectory), name: path_1.default.parse(config.exportDirectory).name };
    }
    else {
        exportDirAbs = { path: getAbsolutePath(`out`), name: `out` };
    }
    lockFileAbs = path_1.default.resolve(exportDirAbs.path, lockFileName);
    return config;
}
function getAbsolutePath(p) {
    return path_1.default.isAbsolute(p) ? p : path_1.default.resolve(__dirname, `..`, p);
}
async function abortIfLocked() {
    try {
        await promises_1.default.readFile(lockFileAbs || ``, { encoding: `utf-8` });
        exit(`Locked! Close all instances or delete lock file before running.`);
    }
    catch (err) {
        // do nothing
    }
}
async function listExistingSourceDirectories(paths) {
    const existing = [];
    for (const p of paths) {
        try {
            const dirEn = await promises_1.default.lstat(getAbsolutePath(p));
            if (dirEn.isDirectory()) {
                const name = path_1.default.parse(p).name;
                existing.push({
                    name,
                    path: p,
                    relPath: name
                });
            }
        }
        catch (err) {
            // do nothing
        }
    }
    return existing;
}
async function createExportRootDirectories(directories) {
    if (!exportDirAbs?.path) {
        exit(`Export directory not set.`);
        throw new Error(`No source directory exists.`); // for ts conditional types
    }
    for (const p of directories) {
        await promises_1.default.mkdir(path_1.default.resolve(exportDirAbs.path, p.name), { recursive: true });
    }
}
async function createLockFile() {
    if (lockFileAbs)
        await promises_1.default.writeFile(lockFileAbs, ``, { encoding: `utf-8` });
}
async function loadKnownMails() {
    try {
        if (!exportDirAbs?.path)
            return;
        const km = await promises_1.default.readFile(path_1.default.resolve(exportDirAbs?.path, knownMailFileName), { encoding: `utf-8` });
        knownMails = km.split(`\n`);
    }
    catch (err) {
        // do nothing
    }
}
function relPath(dir) {
    return dir.relPath || dir.name;
}
async function backupRepository(dir) {
    const rpath = relPath(dir);
    console.log(`backup of ${rpath}`);
    const { directories, mailFiles } = await listChildrenToBackup(dir);
    for (const mailFile of mailFiles)
        await backupMailFile(dir, mailFile);
    for (const directory of directories)
        await backupRepository({
            name: directory,
            relPath: path_1.default.join(rpath, directory),
            path: path_1.default.join(dir.path, directory)
        });
}
async function backupMailFile(dir, mailFile) {
    const outDirAbs = path_1.default.resolve(dir.path, mailFile);
    await promises_1.default.mkdir(outDirAbs, { recursive: true });
    let count = 1;
    const currentMail = {
        contents: ``,
        subject: ``,
        messageId: ``,
        date: undefined,
        known: false
    };
    const readStream = (0, fs_1.createReadStream)(path_1.default.resolve(dir.path, mailFile));
    const rl = (0, promises_2.createInterface)(readStream, process.stdout);
    rl.on('line', async function (line) {
        if (line.slice(0, 7) === `From - `) {
            if (!currentMail.known)
                await saveEmail(outDirAbs, currentMail);
            currentMail.contents = line;
            currentMail.subject = ``;
            currentMail.messageId = ``;
            currentMail.date = undefined;
            currentMail.known = false;
            count++;
        }
        else {
            if (!currentMail.known) {
                currentMail.contents += line;
                if (!currentMail.subject && line.slice(0, 9) === `Subject: `)
                    currentMail.subject = encodeURI(line.slice(9));
                if (!currentMail.messageId && line.slice(0, 12) === `Message-ID: `) {
                    currentMail.messageId = encodeURI(line.slice(12));
                    currentMail.known = isEmailKnown(currentMail.messageId);
                }
                if (!currentMail.date && line.slice(0, 6) === `Date: `)
                    currentMail.date = new Date(line.slice(6));
            }
        }
    });
    if (!currentMail.known && currentMail.contents.length) {
        await saveEmail(outDirAbs, currentMail);
        console.log(`Saved ${count} emails`);
    }
    else {
        console.log(`No email saved for ${path_1.default.join(dir.relPath || ``, mailFile)}`);
    }
}
function isEmailKnown(id) {
    return knownMails.includes(id);
}
function getEmailName(m) {
    return `${m.date?.toISOString?.().slice?.(0, 10)}_${encodeURI(m.subject).slice(0, 99)}.eml`;
}
function rememberEmail(id) {
    knownMails.push(id);
    if (exportDirAbs?.path)
        promises_1.default.appendFile(path_1.default.resolve(exportDirAbs.path, knownMailFileName), `${id}\n`);
}
async function saveEmail(dirPathAbs, currentMail) {
    rememberEmail(currentMail.messageId);
    await promises_1.default.writeFile(path_1.default.resolve(dirPathAbs, getEmailName(currentMail)), currentMail.contents, { encoding: `utf-8` });
}
async function listChildrenToBackup(dir) {
    const dirents = await promises_1.default.readdir(dir.path, { withFileTypes: true });
    const directories = [];
    const mailFiles = [];
    for (const dirent of dirents) {
        if (dirent.isDirectory())
            directories.push(dirent.name);
        else if (dirent.isFile() && `.mst` === dirent.name.slice(-4))
            mailFiles.push(dirent.name.slice(0, -4));
    }
    return { directories, mailFiles };
}
