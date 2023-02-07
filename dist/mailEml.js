"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveEmail = exports.saveEmail = exports.getEmailName = exports.getDefaultEmailName = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const knownMails_1 = require("./knownMails");
const knownMailLocations_1 = require("./knownMailLocations");
function getDefaultEmailName(m) {
    return ((0, sanitize_filename_1.default)(`${m.date?.toISOString?.().slice?.(0, 10)}_${(m.subject || m.messageId || `Empty Subject ${m.count}`).slice(0, 99)}.eml`)).toLowerCase().replaceAll(/ +/g, `_`);
}
exports.getDefaultEmailName = getDefaultEmailName;
async function getEmailName(dir, m) {
    const baseName = getDefaultEmailName(m);
    // exists ?
    try {
        await promises_1.default.lstat(dir.appendAbs(baseName));
        const base = baseName.slice(0, -4).toLowerCase(); // removed extension
        const similar = (await promises_1.default.readdir(dir.path)).filter(fn => fn.slice(0, base.length).toLowerCase() === base);
        if (similar.length === 1)
            return base + `_0001.eml`;
        const re = /_(\d+).eml$/;
        const maxIndex = similar.filter(n => re.test(n)).map(n => parseInt(n.match(re)?.[1] || `0`)).sort((a, b) => b - a)[0];
        return base + `_` + String(maxIndex + 1).padStart(4, `0`) + `.eml`;
    }
    catch (err) {
        // name is available
        return baseName;
    }
}
exports.getEmailName = getEmailName;
async function saveEmail(dir, currentMail) {
    // console.log(`Saving email.`);
    (0, knownMails_1.rememberEmail)(currentMail.messageId);
    const filename = await getEmailName(dir, currentMail);
    await promises_1.default.writeFile(dir.appendAbs(filename), currentMail.contents, { encoding: `utf-8` });
    (0, knownMailLocations_1.rememberMailLocation)(currentMail.messageId, dir.relPath, filename);
    // console.log(`Email saved.`);
    console.log(`Saved email ${currentMail.count + 1}. (${currentMail.messageId})`);
}
exports.saveEmail = saveEmail;
const moveCalls = [];
async function moveEmail(id, outDir) {
    moveCalls.push(id);
    const { dir: prevLocation, name: filename } = (0, knownMailLocations_1.getMailLocationAndName)(id) || {};
    if (!prevLocation || !filename)
        throw new Error(`Cannot move unknown mail`);
    await promises_1.default.rename(prevLocation.appendAbs(filename), outDir.appendAbs(filename));
    (0, knownMailLocations_1.rememberMailLocation)(id, outDir.relPath, filename);
    console.log(`Moved "${filename}" from "${prevLocation.relPath}" to "${outDir.relPath}"`);
}
exports.moveEmail = moveEmail;
