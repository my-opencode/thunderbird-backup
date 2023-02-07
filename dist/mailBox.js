"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupMailBox = void 0;
const fs_1 = require("fs");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const Directory_1 = require("./Directory");
const knownMails_1 = require("./knownMails");
const mailEml_1 = require("./mailEml");
const mimeWords_1 = require("./mimeWords");
const knownMailLocations_1 = require("./knownMailLocations");
const mimeDecoder = new mimeWords_1.Decoder();
async function backupMailBox(dir, mailFile) {
    console.log(`Backing emails of "${dir.appendRel(mailFile)}".`);
    const outRelPath = dir.appendRel(mailFile);
    const outDir = new Directory_1.Directory(exportDirAbs?.appendAbs?.(outRelPath) || ``, { relativePath: outRelPath });
    await promises_1.default.mkdir(outDir.path, { recursive: true });
    const currentMail = {
        count: 0,
        contents: ``,
        subject: ``,
        messageId: ``,
        date: undefined,
        known: false,
        awaitingId: false,
        awaitingSubject: false
    };
    const readStream = (0, fs_1.createReadStream)(path_1.default.resolve(dir.path, mailFile));
    let previous = '';
    for await (const chunk of readStream) {
        previous += chunk;
        let eolIndex = previous.indexOf('\n');
        while (eolIndex > -1) {
            const line = previous.slice(0, eolIndex + 1);
            await processMBoxLine(outDir, currentMail, line);
            previous = previous.slice(eolIndex + 1);
            eolIndex = previous.indexOf('\n');
        }
    }
    if (previous.length > 0) {
        await processMBoxLine(outDir, currentMail, previous, true);
    }
    if (currentMail.count) {
        console.log(`Backed ${currentMail.count} emails of "${dir.appendRel(mailFile)}".`);
    }
    else {
        console.log(`No email backed for "${dir.appendRel(mailFile)}".`);
    }
}
exports.backupMailBox = backupMailBox;
async function processMBoxLine(outDir, currentMail, line, isLast) {
    if (line.slice(0, 5) === `From `) {
        if (!currentMail.known && currentMail.contents.length) {
            await (0, mailEml_1.saveEmail)(outDir, currentMail);
            currentMail.count++;
        }
        else if (currentMail.known && (0, knownMailLocations_1.isEmailLocationDiff)(currentMail.messageId, outDir.relPath)) {
            await (0, mailEml_1.moveEmail)(currentMail.messageId, outDir);
        }
        currentMail.contents = line;
        currentMail.subject = ``;
        currentMail.messageId = ``;
        currentMail.date = undefined;
        currentMail.known = false;
        currentMail.awaitingId = false;
        currentMail.awaitingSubject = false;
    }
    else {
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
                    currentMail.known = (0, knownMails_1.isEmailKnown)(currentMail.messageId);
                    if (currentMail.known)
                        currentMail.contents = ``;
                }
            }
            if (!currentMail.date && line.slice(0, 5).toLowerCase() === `Date:`.toLowerCase())
                currentMail.date = new Date(line.slice(5).trim());
        }
    }
    if (isLast && !currentMail.known) {
        await (0, mailEml_1.saveEmail)(outDir, currentMail);
        currentMail.count++;
    }
}
