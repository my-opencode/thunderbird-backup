import { cleanKnownMailLocations } from "./knownMailLocations";

export async function cleanup(){
  global.logger(`Cleaning.`);
  await cleanKnownMailLocations();
  global.logger(`Cleaned.`);
}