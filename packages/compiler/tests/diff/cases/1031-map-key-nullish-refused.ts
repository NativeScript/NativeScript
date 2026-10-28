// Refused: a Map key that may be null or undefined both, which no form holds apart (only a Map's value has one).
const keys = new Map<string | null | undefined, number>();
keys.set(null, 1);
keys.set(undefined, 2);
console.log(keys.size, keys.get(null), keys.get(undefined));
