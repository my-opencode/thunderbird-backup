import fs from "fs/promises";
import sanitize from "sanitize-filename";
import { rememberEmail } from "./knownMails";
import { rememberMailLocation, getMailLocationAndName } from "./knownMailLocations";
import { ICurrentMail } from "./types";
import { Directory } from "./Directory";

export function getDefaultEmailName(m: ICurrentMail): string {
  return (sanitize(`${m.date?.toISOString?.().slice?.(0, 10)}_${(m.subject || m.messageId || `Empty Subject ${m.count}`).slice(0, 99)}.eml`)).toLowerCase().replaceAll(/ +/g,`_`);
}

export async function getEmailName(dir:Directory, m:ICurrentMail){
  const baseName = getDefaultEmailName(m);
  // exists ?
  try {
    await fs.lstat(dir.appendAbs(baseName));
    const base = baseName.slice(0,-4).toLowerCase(); // removed extension
    const similar = (await fs.readdir(dir.path)).filter(fn => fn.slice(0,base.length).toLowerCase() === base);
    if(similar.length === 1)
      return base + `_0001.eml`;
    const re = /_(\d+).eml$/;
    const maxIndex = similar.filter(n => re.test(n)).map(n=>parseInt(n.match(re)?.[1]||`0`)).sort((a,b)=>b-a)[0];
    return base + `_` + String(maxIndex+1).padStart(4,`0`) + `.eml`;
  } catch (err){
    // name is available
    return baseName;
  }
}

export async function saveEmail(dir: Directory, currentMail: ICurrentMail) {
  // console.log(`Saving email.`);
  rememberEmail(currentMail.messageId);
  const filename = await getEmailName(dir, currentMail);
  await fs.writeFile(dir.appendAbs(filename), currentMail.contents, { encoding: `utf-8` });
  rememberMailLocation(currentMail.messageId, dir.relPath, filename);
  // console.log(`Email saved.`);
  console.log(`Saved email ${currentMail.count + 1}. (${currentMail.messageId})`);
}

const moveCalls : string[] = [];

export async function moveEmail(id: string, outDir: Directory) {
  moveCalls.push(id);
  const { dir: prevLocation, name: filename } = getMailLocationAndName(id) || {};
  if (!prevLocation || !filename)
    throw new Error(`Cannot move unknown mail`);
  await fs.rename(
    prevLocation.appendAbs(filename),
    outDir.appendAbs(filename)
  );
  rememberMailLocation(id, outDir.relPath, filename);
  console.log(`Moved "${filename}" from "${prevLocation.relPath}" to "${outDir.relPath}"`);
}