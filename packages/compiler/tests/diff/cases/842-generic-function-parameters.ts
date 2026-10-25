// Functions passed to generic code by parameters typed with the type parameter, kept, compared and removed by identity:
// a field, a Set, a Map key, an optional parameter, a generic function, and the function handed back.
class Slot<T> {
	private handler: ((v: T) => void) | null = null;
	private seen = new Set<(v: T) => void>();
	private names = new Map<(v: T) => void, string>();
	set(fn: (v: T) => void, name: string): void {
		this.handler = fn;
		this.seen.add(fn);
		this.names.set(fn, name);
	}
	holds(fn: (v: T) => void): boolean {
		return this.handler === fn;
	}
	saw(fn?: (v: T) => void): boolean {
		return fn ? this.seen.has(fn) : false;
	}
	nameOf(fn: (v: T) => void): string {
		return this.names.get(fn) ?? 'none';
	}
	clear(fn: (v: T) => void): void {
		if (this.handler === fn) this.handler = null;
		this.seen.delete(fn);
		this.names.delete(fn);
	}
	pass(fn: (v: T) => void): (v: T) => void {
		return fn;
	}
	fire(v: T): void {
		if (this.handler) this.handler(v);
	}
}

function without<T>(list: ((v: T) => void)[], fn: (v: T) => void): ((v: T) => void)[] {
	return list.filter((l) => l !== fn);
}

const log: string[] = [];
const a = (n: number) => log.push(`a${n}`);
const b = (n: number) => log.push(`b${n}`);
const s = new Slot<number>();
s.set(a, 'first');
s.fire(1);
console.log(s.holds(a), s.holds(b), s.saw(a), s.saw(b), s.saw(), s.nameOf(a), s.nameOf(b));
console.log(s.pass(a) === a, s.pass(b) === a);
s.clear(b);
console.log(s.holds(a), s.saw(a));
s.clear(a);
console.log(s.holds(a), s.saw(a), s.nameOf(a));
s.fire(2);
const kept = without<number>([a, b, a], a);
console.log(kept.length, kept[0] === b);
console.log(log.join(','));
