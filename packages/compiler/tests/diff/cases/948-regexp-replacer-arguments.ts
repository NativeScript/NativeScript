// A replace callback is given the match, each group, the index, the input, then the groups object where the pattern names any.
const show = (v: unknown) => (v === undefined ? 'u' : JSON.stringify(v));
const date = /(?<y>\d{4})-(?<m>\d{2})(?:-(?<d>\d{2}))?/;
console.log('on 2024-01 ok'.replace(date, (all: string, y: string, m: string, d: string, at: number, input: string, groups: any) => [all, y, m, show(d), at, input, JSON.stringify(groups)].join('|')));
console.log('xb'.replace(/(a)|(b)/, (m: string, ...rest: any[]) => rest.map(show).join(',')));
console.log('ab'.replace(/(?<p>a)(?<q>z)?/, (...all: any[]) => all.map(show).join(',')));
const named = (...args: any[]) => show(args[args.length - 1]);
console.log('2024-01'.replace(date, named), 'xb'.replace(/(a)|(b)/, named));
function plain(m: string, a: string, b: string, at: number) { return [m, show(a), b, at].join(':'); }
console.log('xb'.replace(/(a)|(b)/, plain), 'k'.replace(/k/, (m: string, at: number, input: string) => `${m}${at}${input}`));
console.log('a-b'.replace(/(-)/g, (m: string, dash: string, at: number) => `[${dash}@${at}]`));
function joined(first: string, ...more: string[]) { return first + '/' + more.length; }
console.log('a1'.replace(/(\d)/, joined));
