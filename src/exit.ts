import fs from "fs/promises";
import { readlineInterface } from "./readlineInterface";

export async function exit(msg?: string) {
  if (msg) global.logger(`Exit:`, msg);
  // try {
  if (global.lockFileAbs) {
    await fs.rm(global.lockFileAbs);
  }
  // } catch (err) {
  //   global.logger(fs);
  //   global.logger(fs.rm);
  //   console.error(err);
  // }
  // global.logger(process.argv);
  if (!process.argv.includes(`--silent`) && !process.argv.includes(`--quiet`)) {
    readlineInterface.pause();
    await new Promise(r => {
      readlineInterface.question('Press enter to close', () => {
        readlineInterface.write('Closing');
        readlineInterface.close();
        r(1);
      });
    });
  }
  process.exit(1);
}
