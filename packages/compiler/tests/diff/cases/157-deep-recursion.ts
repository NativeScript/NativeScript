// Recursion deeper than the stack: JavaScript's RangeError, caught, and the program goes on; shallow recursion is unchanged.
function depth(n: number): number {
  return n === 0 ? 0 : 1 + depth(n - 1);
}
try {
  console.log(depth(1e7));
} catch (e) {
  console.log('caught', (e as Error).name, (e as Error).message);
}
console.log(depth(1000));

class Tree {
  kids: Tree[];
  constructor(n: number) {
    this.kids = n ? [new Tree(n - 1)] : [];
  }
  count(): number {
    let c = 1;
    for (const k of this.kids) c += k.count();
    return c;
  }
}
console.log(new Tree(200).count());
