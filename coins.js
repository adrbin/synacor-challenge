"use strict";
const choices = [2, 7, 3, 5, 9];
for (const a of choices) {
    const choicesWithoutA = choices.filter(x => x !== a);
    for (const b of choicesWithoutA) {
        const choicesWithoutAb = choicesWithoutA.filter(x => x !== b);
        for (const c of choicesWithoutAb) {
            const choicesWithoutAbc = choicesWithoutAb.filter(x => x !== c);
            for (const d of choicesWithoutAbc) {
                const choicesWithoutAbcd = choicesWithoutAbc.filter(x => x !== d);
                for (const e of choicesWithoutAbcd) {
                    if (a + b * c ** 2 + d ** 3 - e === 399) {
                        console.log(a, b, c, d, e);
                    }
                }
            }
        }
    }
}
// 9 2 5 7 3
//# sourceMappingURL=coins.js.map