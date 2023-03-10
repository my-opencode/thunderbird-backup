"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmailKnown = exports.rememberEmail = exports.loadKnownMails = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function loadKnownMails() {
    global.logger(`Loading known mails.`);
    try {
        if (!exportDirAbs?.path)
            return;
        const km = await promises_1.default.readFile(path_1.default.resolve(exportDirAbs?.path, global.knownMailFileName), { encoding: `utf-8` });
        km.split(`\n`).forEach(s => { if (s)
            global.knownMails.add(s.trim()); });
        global.logger(`Known mails loaded.`);
    }
    catch (err) {
        // do nothing
    }
}
exports.loadKnownMails = loadKnownMails;
function rememberEmail(id) {
    // global.logger(`Memorizing email ID.`);
    if (!global.knownMails.has(id) && exportDirAbs?.path)
        promises_1.default.appendFile(path_1.default.resolve(exportDirAbs.path, global.knownMailFileName), `${id}\n`);
    global.knownMails.add(id);
    // global.logger(`Email ID memorized.`);
}
exports.rememberEmail = rememberEmail;
function isEmailKnown(id) {
    return global.knownMails.has(id);
}
exports.isEmailKnown = isEmailKnown;
