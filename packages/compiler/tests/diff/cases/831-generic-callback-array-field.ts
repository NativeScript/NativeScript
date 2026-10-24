// A generic class's fields holding callbacks over its type parameter: added, called in order, compared, read and
// replaced untyped.
class Subject<T> {
  private subs: ((v: T) => void)[] = [];
  last: ((v: T) => void) | null = null;
  subscribe(fn: (v: T) => void): () => void {
    const at = this.subs.length;
    this.subs.push(fn);
    this.last = fn;
    return () => {
      this.subs.splice(at, 1);
    };
  }
  isLast(fn: (v: T) => void): boolean {
    return this.last === fn;
  }
  next(v: T): void {
    for (const s of this.subs) s(v);
  }
  count(): number {
    return this.subs.length;
  }
}

const seen: string[] = [];
const numbers = new Subject<number>();
const a = (n: number) => {
  seen.push(`a${n}`);
};
const off = numbers.subscribe(a);
numbers.subscribe((n) => seen.push(`b${n * 2}`));
numbers.next(1);
console.log(numbers.isLast(a), numbers.count());
off();
numbers.next(2);
const names = new Subject<{ name: string }>();
names.subscribe((p) => seen.push(p.name));
names.next({ name: 'ada' });
const untyped: any = numbers;
untyped.last(5);
untyped.last = (n: number) => seen.push(`c${n}`);
numbers.last!(6);
console.log(seen.join(), numbers.count(), names.count(), typeof untyped.subs);
