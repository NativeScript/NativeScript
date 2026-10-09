// @lenient-kotlin
// The Android kit's library mode: functions taking the `this` their callers give (a property's setter held in a
// field, called with `.call` and as a descriptor's), an override taking more parameters than its base, and a
// promise whose `then` script replaces.
class Prop {
	name: string;
	set: (value: number) => void;
	get: () => number;
	constructor(name: string) {
		this.name = name;
		const key = '_' + name;
		this.set = function (this: any, value: number) {
			this[key] = value * 10;
		};
		this.get = function (this: any) {
			return this[key];
		};
	}
}
const p = new Prop('size');
const target: any = {};
p.set.call(target, 4);
console.log(target._size, p.get.call(target));
const setBase = p.set;
setBase.call(target, 7);
console.log(target._size);
const holder: any = {};
Object.defineProperty(holder, 'size', { get: p.get, set: p.set });
holder.size = 3;
console.log(holder.size, holder._size);

class Shape {
	describe(): string {
		return 'shape';
	}
}
class Circle extends Shape {
	describe(detail?: boolean): string {
		return detail ? 'circle, detailed' : 'circle';
	}
}
class Ring extends Circle {
	describe(detail?: boolean): string {
		return 'ring/' + super.describe(detail);
	}
}
const shapes: Shape[] = [new Shape(), new Circle(), new Ring()];
for (const s of shapes) console.log(s.describe());
console.log(new Circle().describe(true), new Ring().describe(true));

function patch(promise: Promise<number>, tag: string) {
	const _then = promise.then;
	(promise as any).then = function () {
		const r = _then.apply(promise, arguments);
		patch(r, tag);
		(r as any).tag = tag;
		return r;
	};
}
const base = Promise.resolve(2);
patch(base, 'patched');
const derived = base.then((v) => v * 3);
console.log((derived as any).tag);
derived.then((v) => console.log('value', v, (derived as any).tag));
