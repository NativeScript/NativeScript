// Object.assign with its sources spread from an array, and an array copied by spreading it.
const parts = [{ a: 1 }, { b: 2 }, { a: 3, c: 4 }];
const merged = Object.assign({}, ...parts.map((p) => ({ ...p })));
const [first, second] = [...parts];
console.log(JSON.stringify(merged), JSON.stringify(first), JSON.stringify(second));
