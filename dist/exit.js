"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exit = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const readlineInterface_1 = require("./readlineInterface");
async function exit(msg) {
    if (msg)
        global.logger(`Exit:`, msg);
    // try {
    if (global.lockFileAbs) {
        await promises_1.default.rm(global.lockFileAbs);
    }
    // } catch (err) {
    //   global.logger(fs);
    //   global.logger(fs.rm);
    //   console.error(err);
    // }
    // global.logger(process.argv);
    if (!process.argv.includes(`--silent`) && !process.argv.includes(`--quiet`)) {
        readlineInterface_1.readlineInterface.pause();
        await new Promise(r => {
            readlineInterface_1.readlineInterface.question('Press enter to close', () => {
                readlineInterface_1.readlineInterface.write('Closing');
                readlineInterface_1.readlineInterface.close();
                r(1);
            });
        });
    }
    process.exit(msg ? 1 : 0);
}
exports.exit = exit;
