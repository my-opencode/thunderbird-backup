import fs from "fs/promises";

export async function refreshLastUpdateFile() {
  if (!global.exportDirAbs?.path)
    return;
  const fullPreviousUpdateFileName = global.exportDirAbs.appendAbs(previousUpdateFileName);
  let previousUpdate = ``;
  try {
    const previousContents = await fs.readFile(fullPreviousUpdateFileName, { encoding: `utf-8` });
    previousUpdate = previousContents.match(/Last Update: ([^\n]+)\n/)?.[1] || ``;
  } catch (err) {
    // do nothing
  }
  const contents = `Previous to last update: ${previousUpdate}
Last update: ${new Date().toISOString()}`;
  try {
    await fs.writeFile(fullPreviousUpdateFileName, contents, { encoding: `utf-8` });
  } catch (err) {
    throw new Error(`Unable to save previous update file.
Please check that your export directory exists and that you have write permissions.

${err instanceof Error ? err.message : String(err)}\n\n`);
  }
}

export async function saveCompletionStatus(status: string) {
  if (!global.exportDirAbs?.path)
    return;
  const completionText = ` - Completion Status: ${status}
 
${getCompletionTime()}

${getCompletionStatus()}

`;
  await fs.appendFile(global.exportDirAbs.appendAbs(global.previousUpdateFileName), completionText, { encoding: `utf-8` });
}

export function getCompletionStatus(){
  const f = (n:number) => String(n).padStart(6,` `);
  return `Completion Statistic:
+--------------------+----------+
| Saved:             |  ${f(global.savedCount)}  |
| Moved:             |  ${f(global.movedCount)}  |
+--------------------+----------+
| Errors total:      |  ${f(global.idErrorCount+global.encodingErrorCount+global.moveErrorCount)}  |
+--------------------+----------+
| Subject encoding:  |  ${f(global.idErrorCount)}  |
| Message Id:        |  ${f(global.encodingErrorCount)}  |
| Moving message:    |  ${f(global.moveErrorCount)}  |
+-------------------------------+`;
}

export function getCompletionTime(){
  let [sec] = process.hrtime(global.runStartTime);
  let tm = ``;
  const hr = Math.trunc(sec / 3600);
  if(hr) tm += ` ${hr} hour(s)`;
  sec = sec % 3600;
  const min = Math.trunc(sec / 60);
  if(min) tm += ` ${min} minute(s)`;
  sec = sec % 60;
  if(sec) tm += ` ${sec} second(s)`;
  return `Completed in${tm}.`;
}