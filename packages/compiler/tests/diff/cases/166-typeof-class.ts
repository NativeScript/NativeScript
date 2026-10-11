// @kotlin
// `typeof` a class is "function", whether the class is named or held untyped.
class K {}
abstract class Shape { abstract area(): number; }
const ctor: any = K;
const kinds: any[] = [K, Shape, () => 1, {}, new K()];
console.log(typeof K, typeof Shape, typeof ctor, typeof ctor === 'function', kinds.map((x) => typeof x).join(','));
function make(c: any): string { return typeof c === 'function' ? 'ctor' : 'value'; }
console.log(make(K), make(new K()));
