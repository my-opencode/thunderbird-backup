"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExportRootDirectories = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const exit_1 = require("./exit");
async function createExportRootDirectories(directories) {
    console.log(`Creating export root directories.`);
    if (!exportDirAbs?.path) {
        await (0, exit_1.exit)(`Export directory not set.`);
        throw new Error(`No source directory exists.`); // for ts conditional types
    }
    for (const p of directories) {
        await promises_1.default.mkdir(path_1.default.resolve(exportDirAbs.path, p.name), { recursive: true });
    }
    console.log(`Export root directories created.`);
}
exports.createExportRootDirectories = createExportRootDirectories;
