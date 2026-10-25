// An unset group's split element read back through an object's values: undefined, as JavaScript gives it.
const parts = Object.values({ p: 'a b'.split(/(x)? /) });
console.log(parts[0][1] === undefined, JSON.stringify(parts));
