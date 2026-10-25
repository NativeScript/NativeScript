// An enum is an object: a numeric member has a reverse mapping (value to name), a string member none.
enum Color { Red, Green = 5, Blue }
enum Dir { Up = 'UP', Down = 'DOWN' }
enum Mixed { A = 1, B = 'b' }
enum Bits { None = 0, Read = 1 << 1, Write = 1 << 2, Both = Read | Write }
console.log(Object.keys(Color).join(), Object.values(Color).join(), JSON.stringify(Object.entries(Color)));
console.log(Object.keys(Dir).join(), Object.values(Dir).join(), Object.entries(Dir).join(';'));
console.log(Object.keys(Mixed).join(), Object.values(Mixed).join(), Object.keys(Bits).join(), Object.values(Bits).join());
console.log(Color[0], Color[Color.Blue], Color[7], JSON.stringify(Color), JSON.stringify(Dir));
const forIn: string[] = [];
for (const k in Color) forIn.push(k);
console.log(forIn.join(), 'Red' in Color, 0 in Color, Color.hasOwnProperty('Blue'), Object.keys(Color).length);
const numeric = Object.values(Color).filter((v) => typeof v === 'number');
const names = Object.keys(Color).filter((k) => isNaN(Number(k)));
console.log(numeric.join(), names.join(), Object.entries(Dir).map(([k, v]) => k + '=' + v).join(' '));
const viaAny: any = Color;
console.log(viaAny.Red, viaAny[6], viaAny['Green'], Object.keys(viaAny).length, typeof Color);
function namesOf(e: object): string { return Object.keys(e).join('|'); }
console.log(namesOf(Dir), namesOf(Bits), Object.assign({}, Dir).Up, JSON.stringify({ ...Mixed }));
namespace Shapes {
  export enum Kind { Square = 4, Circle }
}
function total(e: typeof Bits): number { return e.Read + e.Write; }
console.log(Object.keys(Shapes.Kind).join(), Object.values(Shapes.Kind).join(), total(Bits), Color.Green + 1, Dir.Up.toLowerCase());
const lookup: Record<string, string | number> = Color;
console.log(lookup['Blue'], lookup['6'], Object.entries(lookup).length, Shapes.Kind[5], Color['Green'], Dir['Up'], Shapes.Kind['Circle']);
