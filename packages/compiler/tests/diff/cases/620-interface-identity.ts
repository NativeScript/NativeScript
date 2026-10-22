// The same object read as an interface type twice is the same object (===), as a memoized selector compares it.
interface Child { id: number; name?: string }
interface State { children: Child[]; current: Child | null }
function main() {
  const raw: any = { children: [{ id: 1 }], current: null };
  raw.current = raw.children[0];
  const a: State = raw;
  const b: State = raw;
  console.log(a === b, a.children === b.children, a.current === a.children[0]);
  const pick = (s: State): Child[] => s.children;
  const first = (s: State): Child => s.children[0];
  console.log(pick(raw) === pick(raw), first(raw) === first(raw), first(a) === a.current);
  const kids: Child[] = raw.children;
  const again: Child[] = raw.children;
  console.log(kids === again, kids[0] === again[0], kids.map((c) => c)[0] === raw.children[0]);
  const memo = new Map<State, number>([[a, 1]]);
  console.log(memo.get(b), memo.has(raw));
}
main();
