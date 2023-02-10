"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearErrorLogFiles = void 0;
const promises_1 = __importDefault(require("fs/promises"));
async function clearErrorLogFiles() {
    if (!global.exportDirAbs?.path)
        return;
    if (global.errorsDecodeFileName)
        try {
            await promises_1.default.rm(global.exportDirAbs.appendAbs(global.errorsDecodeFileName));
        }
        catch (err) {
            // do nothing;
        }
    if (global.errorsNoIdFileName)
        try {
            await promises_1.default.rm(global.exportDirAbs.appendAbs(global.errorsNoIdFileName));
        }
        catch (err) {
            // do nothing;
        }
    if (global.errorsMoveFileName)
        try {
            await promises_1.default.rm(global.exportDirAbs.appendAbs(global.errorsMoveFileName));
        }
        catch (err) {
            // do nothing;
        }
}
exports.clearErrorLogFiles = clearErrorLogFiles;
