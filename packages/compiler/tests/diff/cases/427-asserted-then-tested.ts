// A value asserted from unknown and then tested: undefined stays undefined, so truthiness and comparisons see it as JavaScript does.
const meta: Record<string, unknown> = { url: 'https://openjsf.org', open: false, level: 0 };

function describe(key: string): string {
  const value = meta[key] as string;
  if (value) return `${key}: ${value}`;
  if (value === undefined) return `${key}: missing`;
  return `${key}: falsy`;
}
console.log(describe('url'), describe('nothing'));
const open = meta['open'] as boolean;
const shown = meta['shown'] as boolean;
console.log(open, !open, shown === undefined, !shown, open === false);
const level = meta['level'] as number;
const depth = meta['depth'] as number;
console.log(level, level === 0, depth === undefined, typeof depth, depth > 0, !depth);
const flag = (meta['shown'] as boolean) && 'shown';
console.log(flag, (meta['url'] as string) && 'linked');
