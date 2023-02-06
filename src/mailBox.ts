
import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { Directory } from "./Directory";
import { ICurrentMail } from "./types";
import { isEmailKnown } from "./knownMails";
import { saveEmail } from "./mailEml";

export async function backupMailBox(dir: Directory, mailFile: string) {
  console.log(`Backing emails of "${dir.appendRel(mailFile)}".`);
  const outDirAbs = exportDirAbs?.appendAbs?.(dir.appendRel(mailFile)) || ``;
  await fs.mkdir(outDirAbs, { recursive: true });

  const currentMail: ICurrentMail = {
    count: 0,
    contents: ``,
    subject: ``,
    messageId: ``,
    date: undefined,
    known: false
  };

  const readStream = createReadStream(path.resolve(dir.path, mailFile));
  let previous = '';

  for await (const chunk of readStream) {
    previous += chunk;
    let eolIndex = previous.indexOf('\n');
    while (eolIndex > -1) {
      const line = previous.slice(0, eolIndex + 1);
      await processMBoxLine(outDirAbs, currentMail, line);
      previous = previous.slice(eolIndex + 1);
      eolIndex = previous.indexOf('\n');
    }
  }
  if (previous.length > 0) {
    await processMBoxLine(outDirAbs, currentMail, previous, true);
  }

  if (currentMail.count) {
    console.log(`Backed ${currentMail.count} emails of "${dir.appendRel(mailFile)}".`);
  } else {
    console.log(`No email backed for "${dir.appendRel(mailFile)}".`);
  }
}

async function processMBoxLine(outDirAbs: string, currentMail: ICurrentMail, line: string, isLast?: boolean) {
  if (line.slice(0, 5) === `From `) {
    if (!currentMail.known && currentMail.contents.length) {
      await saveEmail(outDirAbs, currentMail);
      currentMail.count++;
    }
    currentMail.contents = line;
    currentMail.subject = ``;
    currentMail.messageId = ``;
    currentMail.date = undefined;
    currentMail.known = false;
  } else {
    if (!currentMail.known) {
      currentMail.contents += line;
      if (!currentMail.subject && line.slice(0, 9) === `Subject: `)
        currentMail.subject = encodeURI(line.slice(9)).trim();
      if (!currentMail.messageId && line.slice(0, 12) === `Message-ID: `) {
        currentMail.messageId = line.slice(12).trim();
        currentMail.known = isEmailKnown(currentMail.messageId);
        if(currentMail.known) currentMail.contents = ``;
      }
      if (!currentMail.date && line.slice(0, 6) === `Date: `)
        currentMail.date = new Date(line.slice(6));
    }
  }
  if (isLast && !currentMail.known) {
    await saveEmail(outDirAbs, currentMail);
    currentMail.count++;
  }
}
