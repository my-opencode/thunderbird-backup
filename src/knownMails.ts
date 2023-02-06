import fs from "fs/promises";
import path from "path";

export async function loadKnownMails() {
  console.log(`Loading known mails.`);
  try {
    if (!exportDirAbs?.path) return;
    const km = await fs.readFile(path.resolve(exportDirAbs?.path, global.knownMailFileName), { encoding: `utf-8` });
    km.split(`\n`).forEach(s => { if (s) global.knownMails.add(s.trim()); });
    console.log(`Known mails loaded.`);
  } catch (err) {
    // do nothing
  }
}

export function rememberEmail(id: string) {
  console.log(`Memorizing email ID.`);
  global.knownMails.add(id);
  if (exportDirAbs?.path)
    fs.appendFile(path.resolve(exportDirAbs.path, global.knownMailFileName), `${id}\n`);
  console.log(`Email ID memorized.`);
}

export function isEmailKnown(id: string) {
  return global.knownMails.has(id);
}