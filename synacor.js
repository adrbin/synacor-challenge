"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
const vm_js_1 = __importDefault(require("./vm.js"));
async function main() {
    var _a;
    const argv = await (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
        .options({
        memory: {
            alias: 'm',
            type: 'string',
            description: 'Load memory or program to run',
        },
        state: {
            alias: 's',
            type: 'string',
            description: 'Load state to run',
        },
    })
        .usage('Synacor challenge VM\nUse the "1" key to dump the VM memory and state').argv;
    const memoryFilename = (_a = argv.memory) !== null && _a !== void 0 ? _a : 'challenge.bin';
    const program = await (0, promises_1.readFile)(memoryFilename);
    let state;
    if (argv.state) {
        const stateFile = await (0, promises_1.readFile)(argv.state, 'utf8');
        state = JSON.parse(stateFile);
    }
    const vm = new vm_js_1.default(program, state);
    await vm.run();
}
main();
//# sourceMappingURL=synacor.js.map