// lastIndexOf searches back from its position: NaN or none is the end, and a position past either end is clamped.
const s = 'canal';
console.log(s.lastIndexOf('a'), s.lastIndexOf('a', 2), s.lastIndexOf('a', 0), s.lastIndexOf('x'), s.lastIndexOf('a', -5), s.lastIndexOf('c', -5));
console.log(s.lastIndexOf(''), s.lastIndexOf('', 2), s.lastIndexOf('a', NaN), s.lastIndexOf('a', Infinity), 'aaa'.lastIndexOf('a', 1));
const u: any = s;
console.log(u.lastIndexOf('a', 2));
