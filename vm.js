"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const process_1 = require("process");
const operations_js_1 = require("./operations.js");
const MAX_VALUE = 32776;
const REGISTER_START_ADDRESS = 32768;
process_1.stdin.setRawMode(true);
class Vm {
    constructor(program, state) {
        this.isHalted = false;
        this.ip = 0;
        this.memory = new Uint16Array(MAX_VALUE);
        this.stack = [];
        // executedInstructions: string[] = [];
        this.operationsMap = {
            [operations_js_1.Operation.Halt]: this.halt,
            [operations_js_1.Operation.Set]: this.set,
            [operations_js_1.Operation.Push]: this.push,
            [operations_js_1.Operation.Pop]: this.pop,
            [operations_js_1.Operation.Eq]: this.eq,
            [operations_js_1.Operation.Gt]: this.gt,
            [operations_js_1.Operation.Jmp]: this.jmp,
            [operations_js_1.Operation.Jt]: this.jt,
            [operations_js_1.Operation.Jf]: this.jf,
            [operations_js_1.Operation.Add]: this.add,
            [operations_js_1.Operation.Mult]: this.mult,
            [operations_js_1.Operation.Mod]: this.mod,
            [operations_js_1.Operation.And]: this.and,
            [operations_js_1.Operation.Or]: this.or,
            [operations_js_1.Operation.Not]: this.not,
            [operations_js_1.Operation.Rmem]: this.rmem,
            [operations_js_1.Operation.Wmem]: this.wmem,
            [operations_js_1.Operation.Call]: this.call,
            [operations_js_1.Operation.Ret]: this.ret,
            [operations_js_1.Operation.Out]: this.out,
            [operations_js_1.Operation.In]: this.in,
            [operations_js_1.Operation.Noop]: this.noop,
        };
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
        await this.operationsMap[operation].bind(this)();
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
            throw new Error(`Instruction = ${instruction} is bigger than the max permitted value = ${MAX_VALUE}`);
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
        process_1.stdout.write(String.fromCharCode(a));
    }
    in() {
        return new Promise(resolve => {
            const a = this.fetchInstruction();
            process_1.stdin.on('data', data => {
                let charCode = data.readUInt8();
                if (charCode === 13) {
                    charCode = 10;
                }
                if (charCode === 49) {
                    this.dump();
                }
                process_1.stdout.write(String.fromCharCode(charCode));
                this.memory[a] = charCode;
                process_1.stdin.removeAllListeners('data');
                resolve();
            });
        });
    }
    noop() {
        return;
    }
    dump() {
        const memory = [];
        this.memory.forEach((value, index) => {
            if (index % 16 === 0) {
                memory.push(`\n${toHex(index)}`);
            }
            const mappedValue = value <= 21
                ? this.operationsMap[value].name
                : value < 256
                    ? String.fromCharCode(value)
                    : toHex(value);
            memory.push(` ${mappedValue}`);
        });
        (0, promises_1.writeFile)('memory-view.txt', memory.join(''));
        (0, promises_1.writeFile)('memory-dump.txt', this.memory);
        const state = {
            ip: toHexWithPrefix(this.ip),
            stack: this.stack.map(toHexWithPrefix),
        };
        (0, promises_1.writeFile)('state.txt', JSON.stringify(state, null, 2));
    }
}
exports.default = Vm;
function toHex(value) {
    return value.toString(16).padStart(4, '0');
}
function toHexWithPrefix(value) {
    return `0x${toHex(value)}`;
}
function parseNumber(value) {
    return typeof value === 'string' ? parseInt(value) : value;
}
//# sourceMappingURL=vm.js.map