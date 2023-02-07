import path from "path";

interface IDirectoryOptions {
  relativePath?: string
}

export class Directory {
  _path: string;
  _name: string;
  _relPath: string;
  constructor(pathlike:string, o?:IDirectoryOptions) {
    this._path = Directory.getAbsolutePath(pathlike);
    this._name = path.parse(pathlike).name;
    this._relPath = o?.relativePath || this._name;
  }
  get path(): string {
    return this._path;
  }
  get name(): string {
    return this._name;
  }
  get relPath(): string {
    return this._relPath || this._name;
  }

  appendRel(name:string){
    return path.join(this.relPath,name);
  }
  appendAbs(pathlike:string){
    return path.resolve(this._path, pathlike);
  }

  static getAbsolutePath(p: string) {
    return path.isAbsolute(p) ? p : path.resolve(global.__dirname, p);
  }
}