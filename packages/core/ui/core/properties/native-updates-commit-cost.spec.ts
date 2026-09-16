import { describe, it, expect } from 'vitest';

import { View } from '../view';
import { Property } from './index';

/**
 * What a commit costs per node, where the batch is built. The numbers are printed rather than
 * asserted - the assertion is only that every pending value arrived.
 */
const COMMIT_PROPERTIES = 8;
const RELOAD_PROPERTIES = 4;

let calls = 0;

class TestView extends View {
	createNativeView(): Object {
		return {};
	}

	public _addViewToNativeVisualTree(): boolean {
		return true;
	}
}

const propertyNames: string[] = [];
for (let i = 0; i < COMMIT_PROPERTIES; i++) {
	const property = new Property<TestView, number>({ name: `commit${i}`, defaultValue: -1 });
	property.register(TestView);
	(TestView.prototype as any)[property.setNative] = function () {
		calls++;
	};
	propertyNames.push(property.name);
}

function write(view: any, count: number, value: number): void {
	for (let i = 0; i < count; i++) {
		view[propertyNames[i]] = value;
	}
}

function loadedView(): any {
	const view: any = new TestView();
	view._setupUI({});
	view.callLoaded();

	return view;
}

function measure(label: string, iterations: number, unit: string, callsEach: number, run: (iterations: number) => void): void {
	run(Math.max(1, Math.round(iterations / 10)));

	calls = 0;
	const started = performance.now();
	run(iterations);
	const elapsed = performance.now() - started;

	console.log(`commit ${label}: ${iterations} ${unit} in ${elapsed.toFixed(1)}ms (${((elapsed * 1000) / iterations).toFixed(2)}us each)`);
	expect(calls).toBe(callsEach * iterations);
}

describe('commit cost', () => {
	it('loads views carrying pending properties', () => {
		measure('load', 2000, 'views', COMMIT_PROPERTIES, (iterations) => {
			for (let i = 0; i < iterations; i++) {
				const view: any = new TestView();
				write(view, COMMIT_PROPERTIES, i);
				view._setupUI({});
				view.callLoaded();
			}
		});
	});

	it('reloads views written to while unloaded', () => {
		const views: any[] = [];
		for (let i = 0; i < 2200; i++) {
			views.push(loadedView());
		}
		let next = 0;

		measure('reload', 2000, 'views', RELOAD_PROPERTIES, (iterations) => {
			for (let i = 0; i < iterations; i++) {
				const view = views[next++ % views.length];
				view.callUnloaded();
				write(view, RELOAD_PROPERTIES, i);
				view.callLoaded();
			}
		});
	});

	it('commits batched writes on a live view', () => {
		const view = loadedView();

		measure('_batchUpdate', 5000, 'batches', COMMIT_PROPERTIES, (iterations) => {
			for (let i = 0; i < iterations; i++) {
				view._batchUpdate(() => {
					write(view, COMMIT_PROPERTIES, i);
				});
			}
		});
	});
});
