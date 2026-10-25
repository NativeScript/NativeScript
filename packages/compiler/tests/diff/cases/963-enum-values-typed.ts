// Object.values and Object.entries of an enum with numeric members hold its names too, where TypeScript types them members.
enum Level { Low = 1, High = 3 }
const out: string[] = [];
for (const v of Object.values(Level)) out.push(String(v));
Object.values(Level).forEach((v) => out.push(`${v}`));
console.log(out.join());
const all = Object.values(Level);
console.log(all.length, all.join(), String(all[0]), all.indexOf(Level.High), all.includes(Level.Low));
console.log(Object.entries(Level).map(([k, v]) => `${k}:${v}`).join(), Object.entries(Level).length);
const numbers = Object.values(Level).filter((v) => typeof v === 'number');
console.log(numbers.join(), numbers.length);
