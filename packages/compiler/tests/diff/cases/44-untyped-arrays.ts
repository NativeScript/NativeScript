// @lenient
// Arrays held untyped, as core's CSS matching reads `[class~=word]` and its lists.
const words: any = 'a b c b'.split(' ');
console.log(words.indexOf('b'), words.lastIndexOf('b'), words.indexOf('z'), words.indexOf('b', 2), words.lastIndexOf('b', -2));
console.log(words.findIndex((w) => w === 'c'), words.findLast((w) => w < 'c'), words.findLastIndex((w) => w === 'z'), words.at(-1));
console.log(words.reduce((s, w) => s + w, '>'), words.reduceRight((s, w) => s + w), words.slice(1, -1).join('|'), words.concat(['d'], 'e').length);
const list: any = [3, 1, 2];
console.log(list.push(4, 5), list.pop(), list.shift(), list.unshift(0), list.join());
console.log(list.splice(1, 2, 'x', 'y', 'z').join(), list.join(), list.splice(-1).join(), list.join());
const holes: any = [10, 9, 1, undefined, null];
console.log(list.sort().join(), holes.sort().join(), [10, 9, 1].sort((a, b) => a - b).join());
console.log(list.reverse().join(), list.fill(7, 1, 2).join(), list.includes(7), list.includes(7, 2));
console.log([[1, [2]], 3].flat().length, list.flatMap((x) => [x, x]).length, [...list.keys()].join(), [...list.entries()].length, list.toString());
const typed: string[] = ['b', 'a'];
const loose: any = typed;
loose.push('c');
loose.sort();
console.log(typed.join(), typed.length);
