// A capture group that took no part in a match: undefined to a replacer's untyped or optional parameter, and in a split
// read untyped.
console.log('abaab'.replace(/a(b)?/g, (m, g) => `<${g}>`), 'test'.split(/(t)?/));
console.log('x1y'.replace(/(\d)|(z)/, (m, d, z) => `${d}:${z === undefined}:${z ?? 'none'}`));
console.log('ab'.replace(/a(x)?/, (m: string, g?: string) => (g === undefined ? 'U' : 'D')));
const pieces: any = 'a1b'.split(/(\d)|(-)/);
console.log(pieces, pieces.length, pieces[2] === undefined, 'a-b'.split(/(\d)?-/).length);
