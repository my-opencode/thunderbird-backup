import fs from "fs/promises";
import path from "path";
import { rememberEmail } from "./knownMails";
import { ICurrentMail } from "./types";

export function getEmailName(m: ICurrentMail) {
  return `${m.date?.toISOString?.().slice?.(0, 10)}_${encodeURI(m.subject).slice(0, 99)}.eml`;
}

export async function saveEmail(dirPathAbs: string, currentMail: ICurrentMail) {
  console.log(`Saving email.`);
  rememberEmail(currentMail.messageId);
  await fs.writeFile(path.resolve(dirPathAbs, getEmailName(currentMail)), currentMail.contents, { encoding: `utf-8` });
  console.log(`Email saved.`);
}
