"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = void 0;
const knownMailLocations_1 = require("./knownMailLocations");
async function cleanup() {
    global.logger(`Cleaning.`);
    await (0, knownMailLocations_1.cleanKnownMailLocations)();
    global.logger(`Cleaned.`);
}
exports.cleanup = cleanup;
