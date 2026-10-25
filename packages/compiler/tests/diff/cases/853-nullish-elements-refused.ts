// An array element that may be null or undefined both is refused: the array's element type holds them as one nil.
const items: (string | null | undefined)[] = ['a', null, undefined];
items.push(null);
console.log(items.map((x) => (x === null ? 'null' : x === undefined ? 'undefined' : x)).join(','), JSON.stringify(items));
