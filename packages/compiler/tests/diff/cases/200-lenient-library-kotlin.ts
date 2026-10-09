// @lenient-kotlin
// What core's own code does that the Android kit generated from it translates in library mode.
const setNative = Symbol('setNative');

class Base {
	log: string[] = [];
	flag: boolean;
	[setNative](value: string) {
		this.log.push('base ' + value);
	}
	apply(value: string) {
		(this as Base)[setNative](value);
	}
	static describe() {
		return 'described';
	}
	onDone() {
		return 'done';
	}
}

class Derived extends Base {
	[setNative](value: string) {
		super[setNative](value.toUpperCase());
		this.log.push('derived ' + value);
	}
}

// A prototype's value, read by each instance until it sets its own.
Derived.prototype.flag = true;

const d = new Derived();
d.apply('x');
console.log(d.log.join(', '), d.flag, new Base().flag === undefined || new Base().flag === false);
console.log(Derived.describe(), d.onDone?.());

// A function declaring `this`, called with one.
const getter = function (this: Base) {
	return this.log.length;
};
console.log(getter.call(d));

// A module's function as a value.
function twice(n: number) {
	return n * 2;
}
const options = { converter: twice };
console.log(options.converter(21));

// A class declared in a function reads nothing of the function's.
function make() {
	class Local {
		value = 7;
	}
	return new Local().value;
}
console.log(make());

// An object declared without a value holds undefined.
let holder: Base;
console.log(holder === undefined);
holder = d;
console.log(holder.log.length);
