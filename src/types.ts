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
  function logger(...args:(string|number|string[])[]):void
  var __dirname:string;
  var MAILFILEEXT:string;
  var exportDirAbs: Directory | undefined;
  var lockFileName:string;
  var errorsDecodeFileName:string;
  var errorsNoIdFileName:string;
  var knownMailFileName:string;
  var knownMailLocationFileName:string;
  var lockFileAbs: string | undefined;
  var knownMails: Set<string>;
  var knownMailLocations: Map<string,[string,string]>;
}

export interface ICurrentMail {
  count: number;
  contents: string;
  subject: string;
  messageId: string;
  date: Date | undefined;
  known: boolean;
  awaitingId: boolean;
  awaitingSubject: boolean;
}