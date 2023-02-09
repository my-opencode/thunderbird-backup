"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRootPath = void 0;
const path_1 = __importDefault(require("path"));
function setRootPath(exePath) {
    if (exePath) {
        // global.logger(JSON.stringify(path.parse(exePath)));
        global.__dirname = path_1.default.parse(exePath).dir;
    }
    else
        exePath = __dirname;
    global.logger(`Setting root path to`, exePath);
}
exports.setRootPath = setRootPath;
