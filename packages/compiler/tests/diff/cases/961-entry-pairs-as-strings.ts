// An entry pair is an array: joined or made a string, it reads `k,v`.
const m = new Map<string, number>([['a', 1], ['b', 2]]);
console.log([...m.entries()].join(), [...m].join(';'), String([...m][0]), `${[...m.entries()][1]}`, [...m.entries()].toString());
const first = m.entries().next().value!;
console.log(String(first), first + '', [...m].map(String).join('|'), Array.from(m).join(' '), Array.from(m.entries()).join('/'));
const s = new Set<number>([1, 2]);
console.log([...s.entries()].join(), String([...s.entries()][0]));
console.log(Object.entries({ x: 1, y: 'z' }).join(), [...['p', 'q'].entries()].join(), String(Object.entries({ k: true })[0]));
console.log(JSON.stringify([...m]), JSON.stringify(first), first.length, first[0], first[1]);
const nested = new Map<string, number[]>([['k', [1, 2]]]);
console.log([...nested].join(), `${[...nested][0]}`);
const pairs: [string, number][] = [['u', 3], ['v', 4]];
console.log(pairs.join(), String(pairs[0]), `${pairs}`);
const objects = new Map<number, { n: number }>([[1, { n: 1 }]]);
console.log([...objects].join(), [...new Map<string, string | null>([['z', null]])].join());
for (const entry of m) console.log(`${entry}`, entry.join('='));
