import { writeFile } from 'fs/promises';
import { stdin, stdout } from 'process';
import { Operation } from './operations.js';

const MAX_VALUE = 32776;
const REGISTER_START_ADDRESS = 32768;

stdin.setRawMode(true);

export interface State {
  ip: number | string;
  stack: number[] | string[];
}

export default class Vm {
  isHalted = false;
  ip = 0;
  memory = new Uint16Array(MAX_VALUE);
  stack: number[] = [];
  // executedInstructions: string[] = [];

  operationsMap = {
    [Operation.Halt]: this.halt,
    [Operation.Set]: this.set,
    [Operation.Push]: this.push,
    [Operation.Pop]: this.pop,
    [Operation.Eq]: this.eq,
    [Operation.Gt]: this.gt,
    [Operation.Jmp]: this.jmp,
    [Operation.Jt]: this.jt,
    [Operation.Jf]: this.jf,
    [Operation.Add]: this.add,
    [Operation.Mult]: this.mult,
    [Operation.Mod]: this.mod,
    [Operation.And]: this.and,
    [Operation.Or]: this.or,
    [Operation.Not]: this.not,
    [Operation.Rmem]: this.rmem,
    [Operation.Wmem]: this.wmem,
    [Operation.Call]: this.call,
    [Operation.Ret]: this.ret,
    [Operation.Out]: this.out,
    [Operation.In]: this.in,
    [Operation.Noop]: this.noop,
  };

  constructor(program: Buffer, state?: State) {
    for (let i = 0; i * 2 < program.length - 2; i++) {
      this.memory[i] = program.readUInt16LE(i * 2);
    }
    if (state) {
      this.ip = parseNumber(state.ip);
      this.stack = state.stack.map(parseNumber);
    }
  }

  async run() {
    while (!this.isHalted && !this.isProgramFinished) {
      await this.executeOperation();
    }

    // console.log(`\n\n\n\n${this.executedInstructions.join('\n')}`);
  }

  async executeOperation() {
    const operation = this.fetchInstruction();
    if (!(operation in this.operationsMap)) {
      throw new Error(`Unknown operation = ${operation}`);
    }

    // const func = this.operationsMap[operation as Operation];

    // this.executedInstructions.push(`#${this.ip} ${func.name}`);

    await this.operationsMap[operation as Operation].bind(this)();
  }

  get ipByte() {
    return this.ip * 2;
  }

  get isProgramFinished() {
    return this.ip >= MAX_VALUE;
  }

  fetchInstruction() {
    if (this.isProgramFinished) {
      throw new Error(`Reached the end of the program: ip = ${this.ip}`);
    }
    const instruction = this.memory[this.ip++];
    if (instruction > MAX_VALUE) {
      throw new Error(
        `Instruction = ${instruction} is bigger than the max permitted value = ${MAX_VALUE}`,
      );
    }
    return instruction;
  }

  fetchValue() {
    const value = this.fetchInstruction();
    // this.executedInstructions[
    //   this.executedInstructions.length - 1
    // ] += ` ${value}`;
    if (value >= REGISTER_START_ADDRESS) {
      // this.executedInstructions[
      //   this.executedInstructions.length - 1
      // ] += ` (${this.memory[value]})`;
      return this.memory[value];
    }

    return value;
  }

  fetchRegister() {
    const value = this.fetchInstruction();
    if (value < REGISTER_START_ADDRESS) {
      throw new Error(`Argument = ${value} is not a register`);
    }

    // this.executedInstructions[
    //   this.executedInstructions.length - 1
    // ] += ` ${value}`;

    return value;
  }

  halt() {
    this.isHalted = true;
  }

  set() {
    const a = this.fetchRegister();
    const b = this.fetchValue();

    this.memory[a] = b;
  }

  push() {
    const a = this.fetchValue();
    this.stack.push(a);
  }

  pop() {
    const a = this.fetchRegister();
    const value = this.stack.pop();
    if (value === undefined) {
      throw new Error(`Tried to pop from the empty stack`);
    }
    this.memory[a] = value;
  }

  eq() {
    const a = this.fetchRegister();
    const b = this.fetchValue();
    const c = this.fetchValue();

    this.memory[a] = b === c ? 1 : 0;
  }

  gt() {
    const a = this.fetchRegister();
    const b = this.fetchValue();
    const c = this.fetchValue();

    this.memory[a] = b > c ? 1 : 0;
  }

  jmp() {
    const a = this.fetchValue();

    this.ip = a;
  }

  jt() {
    const a = this.fetchValue();
    const b = this.fetchValue();

    if (a !== 0) {
      this.ip = b;
    }
  }

  jf() {
    const a = this.fetchValue();
    const b = this.fetchValue();

    if (a === 0) {
      this.ip = b;
    }
  }

  add() {
    const a = this.fetchRegister();
    const b = this.fetchValue();
    const c = this.fetchValue();

    this.memory[a] = (b + c) % REGISTER_START_ADDRESS;
  }

  mult() {
    const a = this.fetchRegister();
    const b = this.fetchValue();
    const c = this.fetchValue();

    this.memory[a] = (b * c) % REGISTER_START_ADDRESS;
  }

  mod() {
    const a = this.fetchRegister();
    const b = this.fetchValue();
    const c = this.fetchValue();

    this.memory[a] = (b % c) % REGISTER_START_ADDRESS;
  }

  and() {
    const a = this.fetchRegister();
    const b = this.fetchValue();
    const c = this.fetchValue();

    this.memory[a] = b & c;
  }

  or() {
    const a = this.fetchRegister();
    const b = this.fetchValue();
    const c = this.fetchValue();

    this.memory[a] = b | c;
  }

  not() {
    const a = this.fetchRegister();
    const b = this.fetchValue();

    this.memory[a] = ~b & 0b0111111111111111;
  }

  rmem() {
    const a = this.fetchRegister();
    const b = this.fetchValue();

    this.memory[a] = this.memory[b];
  }

  wmem() {
    const a = this.fetchValue();
    const b = this.fetchValue();

    this.memory[a] = b;
  }

  call() {
    const a = this.fetchValue();

    this.stack.push(this.ip);
    this.ip = a;
  }

  ret() {
    const ip = this.stack.pop();
    if (ip === undefined) {
      this.isHalted = true;
      return;
    }

    this.ip = ip;
  }

  out() {
    const a = this.fetchValue();

    stdout.write(String.fromCharCode(a));
  }

  in() {
    return new Promise<void>(resolve => {
      const a = this.fetchInstruction();
      stdin.on('data', data => {
        let charCode = data.readUInt8();
        if (charCode === 13) {
          charCode = 10;
        }
        if (charCode === 49) {
          this.dump();
        }
        stdout.write(String.fromCharCode(charCode));
        this.memory[a] = charCode;
        stdin.removeAllListeners('data');
        resolve();
      });
    });
  }

  noop() {
    return;
  }

  dump() {
    const memory: string[] = [];
    this.memory.forEach((value, index) => {
      if (index % 16 === 0) {
        memory.push(`\n${toHex(index)}`);
      }

      const mappedValue =
        value <= 21
          ? this.operationsMap[value as Operation].name
          : value < 256
          ? String.fromCharCode(value)
          : toHex(value);
      memory.push(` ${mappedValue}`);
    });
    writeFile('memory-view.txt', memory.join(''));
    writeFile('memory-dump.txt', this.memory);

    const state = {
      ip: toHexWithPrefix(this.ip),
      stack: this.stack.map(toHexWithPrefix),
    };
    writeFile('state.txt', JSON.stringify(state, null, 2));
  }
}

function toHex(value: number) {
  return value.toString(16).padStart(4, '0');
}

function toHexWithPrefix(value: number) {
  return `0x${toHex(value)}`;
}

function parseNumber(value: number | string) {
  return typeof value === 'string' ? parseInt(value) : value;
}
