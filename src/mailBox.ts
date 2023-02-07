
import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { Directory } from "./Directory";
import { ICurrentMail } from "./types";
import { isEmailKnown } from "./knownMails";
import { saveEmail } from "./mailEml";
import { Decoder } from "./mimeWords";
const mimeDecoder = new Decoder();

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
    known: false,
    awaitingId: false,
    awaitingSubject: false
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
    currentMail.awaitingId = false;
    currentMail.awaitingSubject = false;
  } else {
    if (!currentMail.known) {
      currentMail.contents += line;
      if (!currentMail.subject && (currentMail.awaitingSubject || line.slice(0, 8).toLowerCase() === `Subject:`.toLowerCase())) {
        if (!currentMail.awaitingSubject || !/^\s*[^:]+:\s/.test(line)) {
          // to do capture following lines if subject was folded
          currentMail.subject = mimeDecoder.decodeMimeWord((currentMail.awaitingSubject ? line : line.slice(8)).trim());
          if (!currentMail.subject)
            currentMail.awaitingSubject = true;
          else
            currentMail.awaitingSubject = false;
        }
      }
      if (!currentMail.messageId && (currentMail.awaitingId || line.slice(0, 11).toLowerCase() === (`Message-ID:`).toLowerCase())) {
        currentMail.messageId = currentMail.awaitingId ? line.trim() : line.slice(11).trim();
        if (!currentMail.messageId)
          currentMail.awaitingId = true;
        else {
          currentMail.awaitingId = false;
          currentMail.known = isEmailKnown(currentMail.messageId);
          if (currentMail.known) currentMail.contents = ``;
        }
      }
      if (!currentMail.date && line.slice(0, 5).toLowerCase() === `Date:`.toLowerCase())
        currentMail.date = new Date(line.slice(5).trim());
    }
  }
  if (isLast && !currentMail.known) {
    await saveEmail(outDirAbs, currentMail);
    currentMail.count++;
  }
}
