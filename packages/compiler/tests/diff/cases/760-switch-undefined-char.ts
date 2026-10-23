// A string's character read past its end is undefined, though TypeScript types it `string`: as a switch's subject.
function kind(s: string, i: number): string {
  const c = s[i];
  switch (c) {
    case 'a':
    case 'b':
      return 'letter';
    case undefined:
      return 'end';
    default:
      return 'other ' + c;
  }
}
console.log(kind('ab', 0), kind('ab', 1), kind('ab', 2), kind('a?', 1));

function digits(s: string): number {
  let n = 0;
  for (let i = 0; ; i++) {
    switch (s[i]) {
      default:
        n++;
        continue;
      case '0':
        continue;
      case undefined:
        return n;
    }
  }
}
console.log(digits('1020'), digits(''));
