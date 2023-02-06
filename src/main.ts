import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { createInterface } from "readline";

import { IConfig, pathArray, IDirectory } from "./types";

const MAILFILEEXT = `.msf`;
let exportDirAbs: IDirectory | undefined = undefined;
const lockFileName = `current_lock`;
const knownMailFileName = `known_mails`;
let lockFileAbs: string | undefined = undefined;
let knownMails: string[] = [];

run();

async function run() {
  try {
    console.log(`Running.`);
    const { existingDirectories } = await prepare();
    await backupRepositories(existingDirectories);
    console.log(`Backup complete.`);
    exit();
  } catch (err) {
    console.error(err);
    await exit(err instanceof Error ? err.message : `Unexpected error.`);
  }
}


async function exit(msg?: string) {
  if (msg) console.log(`Exit:`, msg);
  if (lockFileAbs)
    await fs.rm(lockFileAbs);
  process.exit(1);
}


async function prepare() {
  console.log(`preparing`);
  const { sourceDirectories } = await loadConfig();
  await abortIfLocked();
  await createLockFile();
  await loadKnownMails();
  const existingDirectories = await listExistingSourceDirectories(sourceDirectories);
  if (!existingDirectories.length) {
    await exit(`No source directory exists.`);
    throw new Error(`No source directory exists.`); // for ts conditional types
  }
  await createExportRootDirectories(existingDirectories);
  console.log(`Prepared.`);
  return { existingDirectories };
}

async function backupRepositories(existingDirs: IDirectory[]) {
  for (const dir of existingDirs)
    await backupRepository(dir);
}

async function loadConfig(): Promise<IConfig> {
  console.log(`Loading config.`);
  const config = JSON.parse(await fs.readFile(path.resolve(__dirname, `..`, `config.json`), { encoding: `utf-8` }));
  if (config.exportDirectory) {
    exportDirAbs = { path: getAbsolutePath(config.exportDirectory), name: path.parse(config.exportDirectory).name };
  } else {
    exportDirAbs = { path: getAbsolutePath(`out`), name: `out` };
  }
  lockFileAbs = path.resolve(exportDirAbs.path, lockFileName);
  console.log(`Config loaded.`);
  return config;
}

function getAbsolutePath(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(__dirname, `..`, p);
}

async function abortIfLocked() {
  try {
    await fs.readFile(lockFileAbs || ``, { encoding: `utf-8` });
    await exit(`Locked! Close all instances or delete lock file before running.`);
  } catch (err) {
    // do nothing
  }
}

async function listExistingSourceDirectories(paths: pathArray): Promise<IDirectory[]> {
  console.log(`Listing existing source directories.`);
  const existing: IDirectory[] = [];
  for (const p of paths) {
    try {
      const dirEn = await fs.lstat(getAbsolutePath(p));
      if (dirEn.isDirectory()) {
        const name = path.parse(p).name;
        existing.push({
          name,
          path: p,
          relPath: name
        });
      }
    } catch (err) {
      // do nothing
    }
  }
  console.log(`Existing source directories listed.`);
  return existing;
}

async function createExportRootDirectories(directories: IDirectory[]) {
  console.log(`Creating export root directories.`);
  if (!exportDirAbs?.path) {
    await exit(`Export directory not set.`);
    throw new Error(`No source directory exists.`); // for ts conditional types
  }
  for (const p of directories) {
    await fs.mkdir(path.resolve(exportDirAbs.path, p.name), { recursive: true });
  }
  console.log(`Export root directories created.`);
}

async function createLockFile() {
  console.log(`Creating lock file.`);
  if (lockFileAbs)
    await fs.writeFile(lockFileAbs, ``, { encoding: `utf-8` });
  console.log(`Lock file created.`);
}

async function loadKnownMails() {
  console.log(`Loading known mails.`);
  try {
    if (!exportDirAbs?.path) return;
    const km = await fs.readFile(path.resolve(exportDirAbs?.path, knownMailFileName), { encoding: `utf-8` });
    knownMails = km.split(`\n`);
    console.log(`Known mails loaded.`);
  } catch (err) {
    // do nothing
  }
}

function relPath(dir: IDirectory) {
  return dir.relPath || dir.name;
}

async function backupRepository(dir: IDirectory) {
  const rpath = relPath(dir);
  console.log(`Backing "${rpath}".`);
  const { directories, mailFiles } = await listChildrenToBackup(dir);
  for (const mailFile of mailFiles)
    await backupMailFile(dir, mailFile);
  for (const directory of directories)
    await backupRepository({
      name: directory,
      relPath: path.join(rpath, directory),
      path: path.join(dir.path, directory)
    });
  console.log(`"${rpath}" backed.`);
}

interface ICurrentMail {
  contents: string;
  subject: string;
  messageId: string;
  date: Date | undefined;
  known: boolean
}
async function backupMailFile(dir: IDirectory, mailFile: string) {
  console.log(`Backing emails of "${path.join(relPath(dir), mailFile)}".`);
  const outDirAbs = path.resolve(exportDirAbs?.path || ``, relPath(dir), mailFile);
  await fs.mkdir(outDirAbs, { recursive: true });

  let count = 1;
  const currentMail: ICurrentMail = {
    contents: ``,
    subject: ``,
    messageId: ``,
    date: undefined,
    known: false
  };
  const readStream = createReadStream(path.resolve(dir.path, mailFile));
  const rl = createInterface(readStream, process.stdout);
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
    } else {
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
    console.log(`Backed ${count} emails of "${path.join(relPath(dir), mailFile)}".`);
  } else {
    console.log(`No email backed for "${path.join(relPath(dir), mailFile)}".`);
  }
}

function isEmailKnown(id: string) {
  return knownMails.includes(id);
}

function getEmailName(m: ICurrentMail) {
  return `${m.date?.toISOString?.().slice?.(0, 10)}_${encodeURI(m.subject).slice(0, 99)}.eml`;
}

function rememberEmail(id: string) {
  console.log(`Memorizing email ID.`);
  knownMails.push(id);
  if (exportDirAbs?.path)
    fs.appendFile(path.resolve(exportDirAbs.path, knownMailFileName), `${id}\n`);
  console.log(`Email ID memorized.`);
}

async function saveEmail(dirPathAbs: string, currentMail: ICurrentMail) {
  console.log(`Saving email.`);
  rememberEmail(currentMail.messageId);
  await fs.writeFile(path.resolve(dirPathAbs, getEmailName(currentMail)), currentMail.contents, { encoding: `utf-8` });
  console.log(`Email saved.`);
}

async function listChildrenToBackup(dir: IDirectory) {
  console.log(`Listing children to backup.`);
  const dirents = await fs.readdir(dir.path, { withFileTypes: true });
  const directories: string[] = [];
  const mailFiles: string[] = [];
  for (const dirent of dirents) {
    if (dirent.isDirectory())
      directories.push(dirent.name);
    else if (dirent.isFile() && MAILFILEEXT === dirent.name.slice(-4))
      mailFiles.push(dirent.name.slice(0, -4));
  }
  console.log(`Children to backup listed.`);
  return { directories, mailFiles };
}