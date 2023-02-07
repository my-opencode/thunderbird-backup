"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRootPath = void 0;
const path_1 = __importDefault(require("path"));
function setRootPath(exePath) {
    global.logger(`Setting root path`, exePath || ``);
    if (exePath) {
        global.logger(JSON.stringify(path_1.default.parse(exePath)));
        global.__dirname = path_1.default.parse(exePath).dir;
    }
    else
        exePath = __dirname;
}
exports.setRootPath = setRootPath;
