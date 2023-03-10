import fs from "fs/promises";
import path from "path";

export async function loadKnownMails() {
  global.logger(`Loading known mails.`);
  try {
    if (!exportDirAbs?.path) return;
    const km = await fs.readFile(path.resolve(exportDirAbs?.path, global.knownMailFileName), { encoding: `utf-8` });
    km.split(`\n`).forEach(s => { if (s) global.knownMails.add(s.trim()); });
    global.logger(`Known mails loaded.`);
  } catch (err) {
    // do nothing
  }
}

export function rememberEmail(id: string) {
  // global.logger(`Memorizing email ID.`);
  if (!global.knownMails.has(id) && exportDirAbs?.path)
    fs.appendFile(path.resolve(exportDirAbs.path, global.knownMailFileName), `${id}\n`);
  global.knownMails.add(id);
  // global.logger(`Email ID memorized.`);
}

export function isEmailKnown(id: string) {
  return global.knownMails.has(id);
}