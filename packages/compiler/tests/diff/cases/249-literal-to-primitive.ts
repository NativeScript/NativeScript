// An object literal with its own [Symbol.toPrimitive], and with both toString and valueOf: each conversion calls the one JavaScript does.
const temp = { [Symbol.toPrimitive](hint: string) { return hint === 'number' ? 21 : 'warm'; } };
console.log(`${temp}`, +(temp as any), (temp as any) + '', (temp as any) * 2, String(temp));
const both = { toString() { return 'str'; }, valueOf() { return 42; } };
console.log(`${both}`, (both as any) + '', String(both), (both as any) * 1, [both].join());
const a = { v: 3, valueOf() { return this.v; } };
const b = { v: 5, valueOf() { return this.v; } };
console.log(a < b, (a as any) + 1, Math.max(a as any, b as any));
