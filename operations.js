"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operation = void 0;
var Operation;
(function (Operation) {
    Operation[Operation["Halt"] = 0] = "Halt";
    Operation[Operation["Set"] = 1] = "Set";
    Operation[Operation["Push"] = 2] = "Push";
    Operation[Operation["Pop"] = 3] = "Pop";
    Operation[Operation["Eq"] = 4] = "Eq";
    Operation[Operation["Gt"] = 5] = "Gt";
    Operation[Operation["Jmp"] = 6] = "Jmp";
    Operation[Operation["Jt"] = 7] = "Jt";
    Operation[Operation["Jf"] = 8] = "Jf";
    Operation[Operation["Add"] = 9] = "Add";
    Operation[Operation["Mult"] = 10] = "Mult";
    Operation[Operation["Mod"] = 11] = "Mod";
    Operation[Operation["And"] = 12] = "And";
    Operation[Operation["Or"] = 13] = "Or";
    Operation[Operation["Not"] = 14] = "Not";
    Operation[Operation["Rmem"] = 15] = "Rmem";
    Operation[Operation["Wmem"] = 16] = "Wmem";
    Operation[Operation["Call"] = 17] = "Call";
    Operation[Operation["Ret"] = 18] = "Ret";
    Operation[Operation["Out"] = 19] = "Out";
    Operation[Operation["In"] = 20] = "In";
    Operation[Operation["Noop"] = 21] = "Noop";
})(Operation = exports.Operation || (exports.Operation = {}));
//# sourceMappingURL=operations.js.map