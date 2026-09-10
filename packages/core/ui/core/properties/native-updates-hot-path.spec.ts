import { describe, it, expect } from 'vitest';

import { View } from '../view';
import { Style } from '../../styling/style';
import { CssProperty, Property } from './index';

/**
 * Invariant I6: a set on a live view reaches `[setNative]` directly. The numbers are
 * printed rather than asserted - the assertion is only that every set arrived.
 */
const ITERATIONS = 100000;

let calls = 0;

class TestView extends View {
	createNativeView(): Object {
		return {};
	}

	public _addViewToNativeVisualTree(): boolean {
		return true;
	}
}

const hotProperty = new Property<TestView, number>({ name: 'hot', defaultValue: -1 });
hotProperty.register(TestView);
(TestView.prototype as any)[hotProperty.setNative] = function () {
	calls++;
};

const hotCssProperty = new CssProperty<Style, number>({ name: 'hotCss', cssName: 'hot-css', defaultValue: -1 });
hotCssProperty.register(Style);
(TestView.prototype as any)[hotCssProperty.setNative] = function () {
	calls++;
};

function loadedView(): any {
	const view: any = new TestView();
	view._setupUI({});
	view.callLoaded();

	return view;
}

function measure(label: string, run: (iterations: number) => void): void {
	run(ITERATIONS / 10);

	calls = 0;
	const started = performance.now();
	run(ITERATIONS);
	const elapsed = performance.now() - started;

	console.log(`I6 ${label}: ${ITERATIONS} live sets in ${elapsed.toFixed(1)}ms (${((elapsed * 1e6) / ITERATIONS).toFixed(0)}ns/set)`);
	expect(calls).toBe(ITERATIONS);
}

describe('hot path cost', () => {
	it('applies 100k live Property sets', () => {
		const view = loadedView();

		measure('Property', (iterations) => {
			for (let i = 0; i < iterations; i++) {
				view.hot = i;
			}
		});
	});

	it('applies 100k live CssProperty sets', () => {
		const view = loadedView();
		const style = view.style;

		measure('CssProperty', (iterations) => {
			for (let i = 0; i < iterations; i++) {
				style.hotCss = i;
			}
		});
	});
});
