import path from "path";
export function setRootPath(exePath?: string) {
  global.logger(`Setting root path`, exePath||``);
  if (exePath) {
    global.logger(JSON.stringify(path.parse(exePath)));
    global.__dirname = path.parse(exePath).dir;
  } else exePath = __dirname;
}