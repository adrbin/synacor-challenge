import { readFile } from 'fs/promises';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import Vm, { State } from './vm.js';

async function main() {
  const argv = await yargs(hideBin(process.argv))
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
    .usage(
      'Synacor challenge VM\nUse the "1" key to dump the VM memory and state',
    ).argv;

  const memoryFilename = argv.memory ?? 'challenge.bin';

  const program = await readFile(memoryFilename);

  let state: State | undefined;
  if (argv.state) {
    const stateFile = await readFile(argv.state, 'utf8');
    state = JSON.parse(stateFile);
  }

  const vm = new Vm(program, state);
  await vm.run();
}

main();
