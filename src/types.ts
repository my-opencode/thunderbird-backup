export type pathArray = string[]

export interface IConfig {
  sourceDirectories: pathArray;
  exportDirectory: string;
}

export interface IDirectory {
  name: string;
  path: string;
  relPath?: string;
}