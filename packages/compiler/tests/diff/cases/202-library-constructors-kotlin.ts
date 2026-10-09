// @lenient-kotlin
// The Android kit's library mode: statements before super(), a class a function gives constructed,
// counters of untyped objects, Object.defineProperties.
class Base {
	message: string;
	constructor(message?: string) {
		this.message = message;
	}
}

class Wrapped extends Base {
	extra: string;
	constructor(inner: Base, message?: string) {
		let formatted;
		if (message && inner.message) {
			formatted = message + ' > ' + inner.message;
		} else {
			formatted = message || inner.message;
		}
		super(formatted);
		this.extra = formatted + '!';
	}
}

const w = new Wrapped(new Base('inner'), 'outer');
console.log(w.message, w.extra);
console.log(new Wrapped(new Base('only')).message);

let Held: typeof Base;
function init() {
	if (!Held) {
		Held = Base;
	}
	return Held;
}
console.log(new (init())('held').message);

const info: any = { count: 0 };
info.count++;
info.count += 2;
info.count *= 3;
console.log(info.count);

const o: any = {};
Object.defineProperties(o, { x: { value: 1, enumerable: true }, y: { get: () => 2, enumerable: true } });
console.log(o.x, o.y, Object.keys(o).join(','));
