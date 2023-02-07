import fs from "fs/promises";
import path from "path";
import { Directory } from "./Directory";

export async function loadKnownMailLocations() {
  console.log(`Loading known mail locations.`);
  try {
    if (!exportDirAbs?.path) return;
    const km = await fs.readFile(path.resolve(exportDirAbs?.path, global.knownMailLocationFileName), { encoding: `utf-8` });
    km.split(`\n`).forEach(s => {
      if (!s) return;
      const p = s.trim().split(`;`);
      global.knownMailLocations.set(p[0], [p[1], p[2]]);
    });
    console.log(`Known mail locations loaded.`);
  } catch (err) {
    // do nothing
  }
}

export function rememberMailLocation(id: string, location: string, filename: string) {
  // console.log(`Memorizing email location.`);
  if (exportDirAbs?.path) // accept updates
    fs.appendFile(path.resolve(exportDirAbs.path, global.knownMailLocationFileName), `${id};${location};${filename}\n`);
  global.knownMailLocations.set(id, [location, filename]);
  // console.log(`Email location memorized.`);
}

export function isEmailLocationDiff(id: string, location: string) {
  return global.knownMailLocations.get(id)?.[0] !== location;
}

export function getMailLocationAndName(id: string): undefined | { dir: Directory, name: string } {
  const [relLocation, filename] = global.knownMailLocations.get(id) || [];
  if (!relLocation || !filename)
    return;
  return {
    dir: new Directory(path.resolve(
      global.exportDirAbs?.path || ``,
      relLocation
    ), { relativePath: relLocation }),
    name: filename
  };
}