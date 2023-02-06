"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveEmail = exports.getEmailName = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const knownMails_1 = require("./knownMails");
function getEmailName(m) {
    return `${m.date?.toISOString?.().slice?.(0, 10)}_${encodeURI(m.subject).slice(0, 99)}.eml`;
}
exports.getEmailName = getEmailName;
async function saveEmail(dirPathAbs, currentMail) {
    console.log(`Saving email.`);
    (0, knownMails_1.rememberEmail)(currentMail.messageId);
    await promises_1.default.writeFile(path_1.default.resolve(dirPathAbs, getEmailName(currentMail)), currentMail.contents, { encoding: `utf-8` });
    console.log(`Email saved.`);
}
exports.saveEmail = saveEmail;
