"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupMailBox = void 0;
const fs_1 = require("fs");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const knownMails_1 = require("./knownMails");
const mailEml_1 = require("./mailEml");
async function backupMailBox(dir, mailFile) {
    console.log(`Backing emails of "${dir.appendRel(mailFile)}".`);
    const outDirAbs = exportDirAbs?.appendAbs?.(dir.appendRel(mailFile)) || ``;
    await promises_1.default.mkdir(outDirAbs, { recursive: true });
    const currentMail = {
        count: 0,
        contents: ``,
        subject: ``,
        messageId: ``,
        date: undefined,
        known: false
    };
    const readStream = (0, fs_1.createReadStream)(path_1.default.resolve(dir.path, mailFile));
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
    }
    else {
        console.log(`No email backed for "${dir.appendRel(mailFile)}".`);
    }
}
exports.backupMailBox = backupMailBox;
async function processMBoxLine(outDirAbs, currentMail, line, isLast) {
    if (line.slice(0, 5) === `From `) {
        if (!currentMail.known && currentMail.contents.length) {
            await (0, mailEml_1.saveEmail)(outDirAbs, currentMail);
            currentMail.count++;
        }
        currentMail.contents = line;
        currentMail.subject = ``;
        currentMail.messageId = ``;
        currentMail.date = undefined;
        currentMail.known = false;
    }
    else {
        if (!currentMail.known) {
            currentMail.contents += line;
            if (!currentMail.subject && line.slice(0, 9) === `Subject: `)
                currentMail.subject = encodeURI(line.slice(9)).trim();
            if (!currentMail.messageId && line.slice(0, 12) === `Message-ID: `) {
                currentMail.messageId = line.slice(12).trim();
                currentMail.known = (0, knownMails_1.isEmailKnown)(currentMail.messageId);
                if (currentMail.known)
                    currentMail.contents = ``;
            }
            if (!currentMail.date && line.slice(0, 6) === `Date: `)
                currentMail.date = new Date(line.slice(6));
        }
    }
    if (isLast && !currentMail.known) {
        await (0, mailEml_1.saveEmail)(outDirAbs, currentMail);
        currentMail.count++;
    }
}
