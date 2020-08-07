import { LayoutBase } from '@nativescript/core/ui/layouts/layout-base';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { Label } from '@nativescript/core/ui/label';

const average = 3;
const noValue = 'noValue';
const colors = ['red', 'green'];

export function addRemove(counts: Array<number>, parent: LayoutBase): string {
	let result = `addRemove`;
	counts.forEach((count) => {
		if (count > 10000) {
			result += setResultTime(noValue);

			return;
		}

		const lbl = new Label();
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				parent.addChild(lbl);
				parent.removeChild(lbl);
			}
		});

		result += setResultTime(time);
	});

	return result;
}

export function setText(counts: Array<number>, parent?: LayoutBase): string {
	let result = `setText ${parent ? 'with nativeView' : ''}`;
	counts.forEach((count) => {
		const lbl = setup(parent);
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				lbl.text = colors[i % 2];
			}
		});
		result += setResultTime(time);
	});

	return result;
}

export function setBackgroundColor(counts: Array<number>, parent?: LayoutBase): string {
	let result = `setBackgroundColor ${parent ? 'with nativeView' : ''}`;
	counts.forEach((count) => {
		if (parent && count > 10000) {
			result += setResultTime(noValue);

			return;
		}

		const lbl = setup(parent);
		const style = lbl.style;
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				style.backgroundColor = <any>colors[i % 2];
			}
		});
		result += setResultTime(time);
	});

	return result;
}

const borders = [1, 2, 3];
export function setBorderWidths(counts: Array<number>, parent?: LayoutBase): string {
	let result = `setBorderWidths ${parent ? 'with nativeView' : ''}`;
	counts.forEach((count) => {
		if (count > 10000 && parent) {
			result += setResultTime(noValue);

			return;
		}

		const lbl = setup(parent);
		const style = lbl.style;
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				style.borderLeftWidth = borders[i % 3];
				style.borderTopWidth = borders[i % 3];
				style.borderRightWidth = borders[i % 3];
				style.borderBottomWidth = borders[i % 3];
			}
		});
		result += setResultTime(time);
	});

	return result;
}

export function setColor(counts: Array<number>, parent?: LayoutBase): string {
	let result = `setColor ${parent ? 'with nativeView' : ''}`;
	counts.forEach((count) => {
		const lbl = setup(parent);
		const style = lbl.style;
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				style.color = <any>colors[i % 2];
			}
		});
		result += setResultTime(time);
	});

	return result;
}

export function setColorWithParents(counts: Array<number>, parent: LayoutBase): string {
	let result = `setColorWithParents`;
	const style = parent.style;
	counts.forEach((count) => {
		if (count > 10000) {
			result += setResultTime(noValue);

			return;
		}

		setupParents(parent);
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				style.color = <any>colors[i % 2];
			}
		});
		result += setResultTime(time);
	});

	return result;
}

const fontSizes = [10, 20];
export function setFontSize(counts: Array<number>, parent?: LayoutBase): string {
	let result = `setFontSize ${parent ? 'with nativeView' : ''}`;
	counts.forEach((count) => {
		const lbl = setup(parent);
		const style = lbl.style;
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				style.fontSize = fontSizes[i % 2];
			}
		});
		result += setResultTime(time);
	});

	return result;
}

export function setFontSizeWithParents(counts: Array<number>, parent: LayoutBase): string {
	let result = `setFontSizeWithParents`;
	const style = parent.style;
	counts.forEach((count) => {
		if (count > 1000) {
			result += setResultTime(noValue);

			return;
		}

		setupParents(parent);
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				style.fontSize = fontSizes[i % 2];
			}
		});
		result += setResultTime(time);
	});

	return result;
}

export function setFontWeight(counts: Array<number>, parent?: LayoutBase): string {
	let result = `setFontWeight ${parent ? 'with nativeView' : ''}`;
	counts.forEach((count) => {
		const lbl = setup(parent);
		const style = lbl.style;
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				style.fontWeight = i % 2 === 0 ? 'bold' : 'normal';
			}
		});
		result += setResultTime(time);
	});

	return result;
}

export function setFontWeightWithParents(counts: Array<number>, parent: LayoutBase): string {
	let result = `setFontWeightWithParents`;
	const style = parent.style;
	counts.forEach((count) => {
		if (count > 1000) {
			result += setResultTime(noValue);

			return;
		}

		setupParents(parent);
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				style.fontWeight = i % 2 === 0 ? 'bold' : 'normal';
			}
		});
		result += setResultTime(time);
	});

	return result;
}

export function setBindingContext(counts: Array<number>, parent?: LayoutBase): string {
	let result = `setBindingContext ${parent ? 'with nativeView' : ''}`;
	counts.forEach((count) => {
		const lbl = setup(parent);
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				lbl.bindingContext = colors[i % 2];
			}
		});
		result += setResultTime(time);
	});

	return result;
}

export function setBindingContextWithParents(counts: Array<number>, parent: LayoutBase): string {
	let result = `setBindingContextWithParents`;
	counts.forEach((count) => {
		if (count > 10000) {
			result += setResultTime(noValue);

			return;
		}
		setupParents(parent);
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				parent.bindingContext = colors[i % 2];
			}
		});
		result += setResultTime(time);
	});

	return result;
}

export function setBindingContextWithParentsBound(counts: Array<number>, parent: LayoutBase): string {
	let result = `setBindingContextWithParentsBound`;
	counts.forEach((count) => {
		if (count > 1000) {
			result += setResultTime(noValue);

			return;
		}

		setupParents(parent, true);
		const time = executeTest(() => {
			for (let i = 0; i < count; i++) {
				parent.bindingContext = colors[i % 2];
			}
		});
		result += setResultTime(time);
	});

	return result;
}

function setupParents(parent: LayoutBase, bindToContext: boolean = false): void {
	for (let i = 0; i < 3; i++) {
		let stack = new StackLayout();
		parent.addChild(stack);
		for (let j = 0; j < 3; j++) {
			let innerStack = new StackLayout();
			stack.addChild(innerStack);
			for (let k = 0; k < 3; k++) {
				const lbl = new Label();
				if (bindToContext) {
					lbl.bind({ sourceProperty: '$value', targetProperty: 'text' });
				}

				innerStack.addChild(lbl);
			}
		}
	}
}

function setup(parent?: LayoutBase): Label {
	let lbl = new Label();
	if (parent) {
		parent.addChild(lbl);
	} else {
		(<any>lbl)._ios = (<any>lbl).nativeView = undefined;
	}

	return lbl;
}

function time(): number {
	if (global.android) {
		return (<any>global).java.lang.System.nanoTime() / 1000000;
	} else {
		return (<any>global).CACurrentMediaTime() * 1000;
	}
}

function executeTest(func: Function): string {
	let total = 0;
	for (let i = 0; i < average; i++) {
		const start = time();
		func();
		const end = time();
		const duration = end - start;
		total += duration;
	}

	const avg = total / average;
	const res = `${avg.toFixed(2)}`;

	return res;
}

function setResultTime(time: string) {
	return `\t${time}`;
}
