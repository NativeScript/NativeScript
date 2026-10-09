// @lenient-kotlin
// The Android kit's library mode: each module's functions and variables in its object, read past a member
// of the same name; a class decorator writing the prototype; a method put on a prototype under a symbol.
const count = 2;
function describe(n: number) {
	return 'n' + n;
}

const setValue = Symbol('setValue');

class Box {
	count = 5;
	tag: string;
	value: number;
	report() {
		return describe(count) + ' ' + this.count;
	}
}

function Tagged(tag: string): ClassDecorator {
	return (cls) => {
		cls.prototype.tag = tag;
	};
}

@Tagged('boxed')
class Labeled extends Box {}

Box.prototype[setValue] = function (this: Box, v: number) {
	this.value = v * 2;
};

const b = new Labeled();
console.log(b.report());
console.log(b.tag);
(b as any)[setValue](21);
console.log(b.value);
console.log(new Box().tag);
b.tag = 'own';
console.log(b.tag, new Labeled().tag);
