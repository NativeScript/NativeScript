// @swift
// `typeof` of a class is "function": by its name, held untyped, and typed as its constructor.
class K {}
class L extends K {}
const ctor: any = K;
const typed: typeof K = L;
const registry: Record<string, any> = { k: K, n: 1, s: 'x', o: new K() };
console.log(typeof K, typeof ctor, typeof ctor === 'function', typeof typed, typeof L === 'function');
console.log(Object.keys(registry).map((key) => key + ':' + typeof registry[key]).join(' '));
function make(c: any): string { return typeof c === 'function' ? 'a constructor' : 'not a constructor'; }
console.log(make(L), make(new K()));
