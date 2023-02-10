"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailLocationAndName = exports.isEmailLocationDiff = exports.rememberMailLocation = exports.cleanKnownMailLocations = exports.loadKnownMailLocations = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const Directory_1 = require("./Directory");
async function loadKnownMailLocations() {
    global.logger(`Loading known mail locations.`);
    try {
        if (!exportDirAbs?.path)
            return;
        const km = await promises_1.default.readFile(path_1.default.resolve(exportDirAbs?.path, global.knownMailLocationFileName), { encoding: `utf-8` });
        km.split(`\n`).forEach(s => {
            if (!s)
                return;
            const p = s.trim().split(`;`);
            global.knownMailLocations.set(p[0], [p[1], p[2]]);
        });
        global.logger(`Known mail locations loaded.`);
    }
    catch (err) {
        // do nothing
    }
}
exports.loadKnownMailLocations = loadKnownMailLocations;
async function cleanKnownMailLocations() {
    global.logger(`Cleaning known mail locations.`);
    try {
        if (!global.exportDirAbs?.path)
            return;
        const filePath = global.exportDirAbs.appendAbs(global.knownMailLocationFileName);
        await promises_1.default.rename(filePath, filePath + `_bak`);
        const appendTasks = [];
        for (const [id, [relPath, name]] of global.knownMailLocations.entries())
            appendTasks.push(promises_1.default.appendFile(filePath, `${id};${relPath};${name}\n`, { encoding: `utf-8` }));
        await Promise.all(appendTasks);
        global.logger(`Known mail locations cleaned.`);
    }
    catch (err) {
        // do nothing
    }
}
exports.cleanKnownMailLocations = cleanKnownMailLocations;
function rememberMailLocation(id, location, filename) {
    // global.logger(`Memorizing email location.`);
    if (exportDirAbs?.path) // accept updates
        promises_1.default.appendFile(path_1.default.resolve(exportDirAbs.path, global.knownMailLocationFileName), `${id};${location};${filename}\n`);
    global.knownMailLocations.set(id, [location, filename]);
    // global.logger(`Email location memorized.`);
}
exports.rememberMailLocation = rememberMailLocation;
function isEmailLocationDiff(id, location) {
    return global.knownMailLocations.get(id)?.[0] !== location;
}
exports.isEmailLocationDiff = isEmailLocationDiff;
function getMailLocationAndName(id) {
    const [relLocation, filename] = global.knownMailLocations.get(id) || [];
    if (!relLocation || !filename)
        return;
    return {
        dir: new Directory_1.Directory(path_1.default.resolve(global.exportDirAbs?.path || ``, relLocation), { relativePath: relLocation }),
        name: filename
    };
}
exports.getMailLocationAndName = getMailLocationAndName;
