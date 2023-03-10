"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigPath = exports.loadConfig = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const Directory_1 = require("./Directory");
async function loadConfig() {
    const confPath = getConfigPath();
    global.logger(`Loading config from ${confPath}.`);
    const config = JSON.parse(await promises_1.default.readFile(confPath, { encoding: `utf-8` }));
    if (config.exportDirectory) {
        global.exportDirAbs = new Directory_1.Directory(config.exportDirectory);
    }
    else {
        global.exportDirAbs = new Directory_1.Directory(`out`);
        config.exportDirectory = `out`;
    }
    global.lockFileAbs = path_1.default.resolve(global.exportDirAbs.path, global.lockFileName);
    global.logger(`Config loaded.`);
    return config;
}
exports.loadConfig = loadConfig;
function getConfigPath() {
    // check argv
    if (process.argv.includes(`--config`)) {
        const configDirPath = process.argv[process.argv.indexOf(`--config`) + 1].trim();
        if (configDirPath?.length)
            if (path_1.default.isAbsolute(configDirPath))
                return configDirPath;
            else
                return path_1.default.resolve(global.__dirname, configDirPath);
    }
    // get default (executable folder)
    return path_1.default.resolve(global.__dirname, `config.json`);
}
exports.getConfigPath = getConfigPath;
