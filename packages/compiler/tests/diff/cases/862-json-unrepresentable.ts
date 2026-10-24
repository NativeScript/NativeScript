// What JSON reads or writes past a Swift string's and the stack's reach: a lone surrogate parsed from an escape, and
// an array nested 5000 deep, which V8 writes without recursing.
const lone: string = JSON.parse('"\\ud83d"');
console.log(lone.length, lone.charCodeAt(0), JSON.stringify(lone), JSON.stringify(JSON.parse('["\\ude00x"]')));
const deep = '['.repeat(5000) + ']'.repeat(5000);
console.log(JSON.stringify(JSON.parse(deep)).length);
