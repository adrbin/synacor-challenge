let reg8000 = 4,
  reg8001 = 1,
  reg8007 = 0;

function verification() {
  if (reg8000 === 0) {
    reg8000 = (reg8001 + 1) % 0x8000;
    return;
  }
  if (reg8001 === 0) {
    reg8000 = (reg8000 + 0x7fff) % 0x8000; // (reg8000 - 1) % 0x8000
    reg8001 = reg8007;
    verification();
    return;
  }

  const tmp = reg8000;
  reg8001 = (reg8001 + 0x7fff) % 0x8000; // (reg8001 - 1) % 0x8000
  verification();
  reg8001 = reg8000;
  reg8000 = tmp;
  reg8000 = (reg8000 + 0x7fff) % 0x8000; // (reg8000 - 1) % 0x8000
  verification();
  return;
}

// Maximum call stack size exceeded :(
function verificationOptimized(reg8007: number, memo: Map<string, RegPair>) {
  const regMemoVal = memo.get(`${reg8000},${reg8001}`);

  if (regMemoVal !== undefined) {
    reg8000 = regMemoVal.reg8000;
    reg8001 = regMemoVal.reg8001;
    return;
  }

  const initialRegPair = {
    reg8000,
    reg8001,
  };

  if (reg8000 === 0) {
    reg8000 = (reg8001 + 1) % 0x8000;
    setMemo(memo, initialRegPair, { reg8000, reg8001 });
    return;
  }

  if (reg8001 === 0) {
    reg8000 = (reg8000 + 0x7fff) % 0x8000; // (reg8000 - 1) % 0x8000
    reg8001 = reg8007;
    verificationOptimized(reg8007, memo);
    setMemo(memo, initialRegPair, { reg8000, reg8001 });
    return;
  }

  const tmp = reg8000;
  reg8001 = (reg8001 + 0x7fff) % 0x8000; // (reg8001 - 1) % 0x8000
  verificationOptimized(reg8007, memo);
  reg8001 = reg8000;
  reg8000 = (tmp + 0x7fff) % 0x8000; // (reg8000 - 1) % 0x8000
  verificationOptimized(reg8007, memo);
  setMemo(memo, initialRegPair, { reg8000, reg8001 });
}

interface RegPair {
  reg8000: number;
  reg8001: number;
}

function setMemo(
  memo: Map<string, RegPair>,
  initialRegPair: RegPair,
  resultRegPair: RegPair,
) {
  memo.set(`${initialRegPair.reg8000},${initialRegPair.reg8001}`, {
    reg8000: resultRegPair.reg8000,
    reg8001: resultRegPair.reg8001,
  });
}

enum Position {
  Position0 = 0,
  Position1,
  Position2,
  Position3,
  Position4,
}

interface CallRecord {
  initialRegPair: RegPair;
  position: Position;
}

function verificationOptimized2(reg8007: number) {
  const regPair = {
    reg8000: 4,
    reg8001: 1,
  };
  const stack: number[] = [];
  const callStack: CallRecord[] = [];
  let callRecord: CallRecord | undefined = {
    initialRegPair: regPair,
    position: Position.Position0,
  };
  const memo = new Map<string, RegPair>();

  while (callRecord !== undefined) {
    switch (callRecord.position) {
      case Position.Position0:
        const regMemoVal = memo.get(`${regPair.reg8000},${regPair.reg8001}`);

        if (regMemoVal !== undefined) {
          regPair.reg8000 = regMemoVal.reg8000;
          regPair.reg8001 = regMemoVal.reg8001;
          callRecord = callStack.pop();
          continue;
        }

        callRecord.initialRegPair = { ...regPair };

        if (regPair.reg8000 === 0) {
          regPair.reg8000 = (regPair.reg8001 + 1) % 0x8000;
          setMemo(memo, callRecord.initialRegPair, regPair);
          callRecord = callStack.pop();
          continue;
        }

        if (regPair.reg8001 === 0) {
          regPair.reg8000 = (regPair.reg8000 + 0x7fff) % 0x8000; // (reg8000 - 1) % 0x8000
          regPair.reg8001 = reg8007;
          callStack.push({
            initialRegPair: callRecord.initialRegPair,
            position: Position.Position1,
          });
          callRecord.position = Position.Position0;
          continue;
        }

        stack.push(regPair.reg8000);
        regPair.reg8001 = (regPair.reg8001 + 0x7fff) % 0x8000; // (reg8001 - 1) % 0x8000
        callStack.push({
          initialRegPair: callRecord.initialRegPair,
          position: Position.Position2,
        });
        callRecord.position = Position.Position0;
        continue;
      case Position.Position1:
        setMemo(memo, callRecord.initialRegPair, regPair);
        callRecord = callStack.pop();
        continue;
      case Position.Position2:
        regPair.reg8001 = regPair.reg8000;
        regPair.reg8000 = stack.pop()!;
        regPair.reg8000 = (regPair.reg8000 + 0x7fff) % 0x8000; // (reg8000 - 1) % 0x8000
        callStack.push({
          initialRegPair: callRecord.initialRegPair,
          position: Position.Position3,
        });
        callRecord.position = Position.Position0;
        continue;
      case Position.Position3:
        setMemo(memo, callRecord.initialRegPair, regPair);
        callRecord = callStack.pop();
        continue;
    }
  }

  return regPair.reg8000;
}

// for (let i = 1; i <= 0x7fff; i++) {
//   reg8000 = 4;
//   reg8001 = 1;
//   const memo = new Map<string, RegPair>();
//   verificationOptimized(i, memo);
//   if (reg8000 === 6) {
//     console.log(i);
//     break;
//   }
// }

for (let i = 1; i <= 0x7fff; i++) {
  // const memo = new Map<string, RegPair>();
  const result = verificationOptimized2(i);
  if (result === 6) {
    console.log(i);
    break;
  }
}

// 25734
