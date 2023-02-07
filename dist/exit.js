"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exit = void 0;
const promises_1 = __importDefault(require("fs/promises"));
async function exit(msg) {
    if (msg)
        console.log(`Exit:`, msg);
    if (global.lockFileAbs)
        await promises_1.default.rm(global.lockFileAbs);
    process.exit(1);
}
exports.exit = exit;
