"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const Directory_1 = require("./Directory");
async function loadConfig() {
    console.log(`Loading config.`);
    const config = JSON.parse(await promises_1.default.readFile(path_1.default.resolve(__dirname, `..`, `config.json`), { encoding: `utf-8` }));
    if (config.exportDirectory) {
        global.exportDirAbs = new Directory_1.Directory(config.exportDirectory);
    }
    else {
        global.exportDirAbs = new Directory_1.Directory(`out`);
        config.exportDirectory = `out`;
    }
    global.lockFileAbs = path_1.default.resolve(global.exportDirAbs.path, global.lockFileName);
    console.log(`Config loaded.`);
    return config;
}
exports.loadConfig = loadConfig;
