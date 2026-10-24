// The subscribe/unsubscribe pattern: listeners removed by identity, including a method bound once, a listener stored
// through a generic emitter, and one passed through an untyped value.
class Notifier<T> {
	private listeners: ((v: T) => void)[] = [];
	on(fn: (v: T) => void): void {
		if (this.listeners.indexOf(fn) < 0) this.listeners.push(fn);
	}
	off(fn: (v: T) => void): void {
		this.listeners = this.listeners.filter((l) => l !== fn);
	}
	has(fn: (v: T) => void): boolean {
		return this.listeners.includes(fn);
	}
	emit(v: T): void {
		for (const l of this.listeners) l(v);
	}
	get count(): number {
		return this.listeners.length;
	}
}

class Box<T> {
	constructor(public value: T) {}
	is(v: T): boolean {
		return this.value === v;
	}
}

const log: string[] = [];
class View {
	name = 'view';
	readonly onValue = (v: string) => log.push(`${this.name}:${v}`);
}
function run(): void {
	const e = new Notifier<string>();
	const v = new View();
	const plain = (s: string) => log.push(`plain:${s}`);
	e.on(v.onValue);
	e.on(v.onValue);
	e.on(plain);
	console.log(e.count, e.has(v.onValue), e.has(plain));
	e.emit('a');
	e.off(v.onValue);
	console.log(e.count, e.has(v.onValue));
	e.emit('b');
	const loose: any = plain;
	e.off(loose);
	console.log(e.count);

	const byKey = new Map<string, ((n: number) => void)[]>();
	const h1 = (n: number) => log.push(`h1:${n}`);
	const h2 = (n: number) => log.push(`h2:${n}`);
	byKey.set('tap', [h1, h2]);
	const list = byKey.get('tap')!;
	list.splice(list.indexOf(h1), 1);
	for (const h of byKey.get('tap')!) h(3);
	console.log(byKey.get('tap')!.length, byKey.get('tap')![0] === h2);
	const box = new Box(plain);
	console.log(box.value === plain, box.is(plain), box.is(v.onValue));
	console.log(log.join(','));
}
run();
