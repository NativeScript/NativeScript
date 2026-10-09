// An optional chain read into an element (`group?.items[i]`), its receiver an element that may be missing.
type Groups = Array<{ title: string; items: string[] }>;
const groups: Groups = [{ title: 'A', items: ['a1', 'a2'] }];
function pick(section: number, index: number): string {
  const group = groups[section];
  const item = group?.items[index];
  return item ? `${group.title}:${item}` : 'none';
}
console.log(pick(0, 1), pick(0, 5), pick(3, 0));
