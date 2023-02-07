"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directory = void 0;
const path_1 = __importDefault(require("path"));
class Directory {
    _path;
    _name;
    _relPath;
    constructor(pathlike, o) {
        this._path = Directory.getAbsolutePath(pathlike);
        this._name = path_1.default.parse(pathlike).name;
        this._relPath = o?.relativePath || this._name;
    }
    get path() {
        return this._path;
    }
    get name() {
        return this._name;
    }
    get relPath() {
        return this._relPath || this._name;
    }
    appendRel(name) {
        return path_1.default.join(this.relPath, name);
    }
    appendAbs(pathlike) {
        return path_1.default.resolve(this._path, pathlike);
    }
    static getAbsolutePath(p) {
        return path_1.default.isAbsolute(p) ? p : path_1.default.resolve(__dirname, `..`, p);
    }
}
exports.Directory = Directory;
