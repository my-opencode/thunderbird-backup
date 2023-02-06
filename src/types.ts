import { Directory } from "./Directory";

export type pathArray = string[]

export interface IConfigRaw {
  sourceDirectories: pathArray;
  exportDirectory?: string;
}
export interface IConfig {
  sourceDirectories: pathArray;
  exportDirectory: string;
}

declare global {
  var MAILFILEEXT:string;
  var exportDirAbs: Directory | undefined;
  var lockFileName:string;
  var knownMailFileName:string;
  var lockFileAbs: string | undefined;
  var knownMails: Set<string>;
}

export interface ICurrentMail {
  count: number;
  contents: string;
  subject: string;
  messageId: string;
  date: Date | undefined;
  known: boolean
}