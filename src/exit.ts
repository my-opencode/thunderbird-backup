import fs from "fs/promises";

export async function exit(msg?: string) {
  if (msg) console.log(`Exit:`, msg);
  if (global.lockFileAbs)
    await fs.rm(global.lockFileAbs);
  process.exit(1);
}
