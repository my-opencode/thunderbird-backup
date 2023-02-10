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
    // global.logger(`Saving email.`);
    (0, knownMails_1.rememberEmail)(currentMail.messageId);
    const filename = await getEmailName(dir, currentMail);
    await promises_1.default.writeFile(dir.appendAbs(filename), currentMail.contents, { encoding: `utf-8` });
    (0, knownMailLocations_1.rememberMailLocation)(currentMail.messageId, dir.relPath, filename);
    // global.logger(`Email saved.`);
    global.logger(`Saved email ${currentMail.count + 1}. (${currentMail.messageId})`);
}
exports.saveEmail = saveEmail;
const moveCalls = [];
async function moveEmail(dir, currentMail) {
    let prevLocation, filename;
    try {
        moveCalls.push(currentMail.messageId);
        ({ dir: prevLocation, name: filename } = (0, knownMailLocations_1.getMailLocationAndName)(currentMail.messageId) || {});
        if (!prevLocation || !filename)
            throw new Error(`Cannot move unknown mail`);
        await promises_1.default.rename(prevLocation.appendAbs(filename), dir.appendAbs(filename));
        (0, knownMailLocations_1.rememberMailLocation)(currentMail.messageId, dir.relPath, filename);
        global.logger(`Moved "${filename}" from "${prevLocation.relPath}" to "${dir.relPath}"`);
    }
    catch (err) {
        let errorLog = `==== Move Email Error ====\n\n`;
        errorLog += err instanceof Error ? `${err.message}\n\n${err.stack}` : typeof err === `string` ? err : `Unexpected error.`;
        errorLog += `\n\n`;
        errorLog += `ID: "${currentMail.messageId}"\n`;
        errorLog += `To: "${dir.relPath}"\n`;
        if (prevLocation)
            errorLog += `From: "${prevLocation.relPath}"\n`;
        if (filename)
            errorLog += `FileName: "${filename}"\n`;
        errorLog += `\n`;
        if (global.exportDirAbs?.path)
            promises_1.default.appendFile(global.exportDirAbs.appendAbs(global.errorsMoveFileName), errorLog, { encoding: `utf-8` });
    }
}
exports.moveEmail = moveEmail;
