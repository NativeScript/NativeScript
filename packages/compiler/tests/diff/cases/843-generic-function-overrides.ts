// A generic class's function-typed parameters, overridden by a subclass that binds the type parameter.
class Emitter<T> {
	protected list: ((v: T) => void)[] = [];
	on(fn: (v: T) => void): void {
		this.list.push(fn);
	}
	off(fn: (v: T) => void): void {
		const at = this.list.indexOf(fn);
		if (at >= 0) this.list.splice(at, 1);
	}
	emit(v: T): void {
		for (const f of this.list) f(v);
	}
	get size(): number {
		return this.list.length;
	}
}
class Words extends Emitter<string> {
	on(fn: (v: string) => void): void {
		super.on(fn);
		super.on(fn);
	}
}
const out: string[] = [];
const w = new Words();
const f = (s: string) => out.push(s);
w.on(f);
w.emit('x');
w.off(f);
console.log(w.size);
w.off(f);
console.log(w.size, out.join(','));
