import fs from "fs/promises";
export async function clearErrorLogFiles() {
  if (!global.exportDirAbs?.path) return;
  if (global.errorsDecodeFileName)
    try {
      await fs.rm(global.exportDirAbs.appendAbs(global.errorsDecodeFileName));
    } catch (err) {
      // do nothing;
    }
  if (global.errorsNoIdFileName)
    try {
      await fs.rm(global.exportDirAbs.appendAbs(global.errorsNoIdFileName));
    } catch (err) {
      // do nothing;
    }
  if (global.errorsMoveFileName)
    try {
      await fs.rm(global.exportDirAbs.appendAbs(global.errorsMoveFileName));
    } catch (err) {
      // do nothing;
    }
}