// An app generic class whose name the kit also has (renamed in Swift), made with explicit type arguments.
class Emitter<T> {
	constructor(private items: T[] = []) {}
	add(v: T): number {
		return this.items.push(v);
	}
}
const o = new Emitter<string>();
o.add('a');
const p: Emitter<number> = new Emitter<number>([1]);
console.log(o.add('b'), p.add(2));
