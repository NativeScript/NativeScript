// A function value whose last parameter is a rest, held untyped and called by script with however many arguments.
const restTyped: (m: string, ...rest: any[]) => string = (m, ...rest) => m + rest.length;
const g: any = restTyped;
console.log(g('a', 1, 2), g('b'));
const h: any = Math.min(1, 2) > 1 ? restTyped : (m: string, x?: string) => m + x;
const k: any = Math.min(1, 2) < 1 ? (m: string, x?: string) => m + x : restTyped;
console.log(h('c', 'd'), k('e', 'f', 'g'));
const maybe: ((...parts: number[]) => number) | undefined = (...parts) => parts.reduce((a, b) => a + b, 0);
const held: any[] = [maybe];
console.log(held[0](1, 2, 3), typeof held[0]);
