"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLogger = void 0;
function setLogger() {
    global.logger = function (...a) {
        if (!process.argv.includes(`--silent`)) {
            console.log(...a);
        }
    };
}
exports.setLogger = setLogger;
