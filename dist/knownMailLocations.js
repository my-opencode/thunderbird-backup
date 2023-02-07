"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailLocationAndName = exports.isEmailLocationDiff = exports.rememberMailLocation = exports.loadKnownMailLocations = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const Directory_1 = require("./Directory");
async function loadKnownMailLocations() {
    console.log(`Loading known mail locations.`);
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
        console.log(`Known mail locations loaded.`);
    }
    catch (err) {
        // do nothing
    }
}
exports.loadKnownMailLocations = loadKnownMailLocations;
function rememberMailLocation(id, location, filename) {
    // console.log(`Memorizing email location.`);
    if (exportDirAbs?.path) // accept updates
        promises_1.default.appendFile(path_1.default.resolve(exportDirAbs.path, global.knownMailLocationFileName), `${id};${location};${filename}\n`);
    global.knownMailLocations.set(id, [location, filename]);
    // console.log(`Email location memorized.`);
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
