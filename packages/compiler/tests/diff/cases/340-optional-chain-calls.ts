// Calls and reads after an optional chain's call (`xs?.map(f).join(',')`) are part of the chain: undefined when it stops.
function lookup(id: number): number[] | undefined { return id > 0 ? [3, 1, 2] : undefined; }
const found = lookup(1);
const missing = lookup(0);
console.log(found?.map((x) => x * 2).join(','), missing?.map((x) => x * 2).join(','));
console.log(found?.filter((x) => x > 1).length, missing?.filter((x) => x > 1).length);
console.log(found?.slice().sort().reverse().join('<'), found?.map((x) => x + 1)[0], missing?.map((x) => x + 1)[0]);
function title(name: string | undefined) { return name?.trim().split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '); }
console.log(title('  ada lovelace '), title(undefined));
interface Profile { tags?: string[] }
const profiles: Profile[] = [{ tags: ['b', 'a'] }, {}];
for (const p of profiles) console.log(p.tags?.slice().sort().join('+') ?? 'no tags', p.tags?.map((t) => t.length).reduce((a, b) => a + b, 0));
