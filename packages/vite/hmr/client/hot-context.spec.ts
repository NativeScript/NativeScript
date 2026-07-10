import { describe, expect, it, vi } from 'vitest';

import { getNsHotRegistry } from './hot-context.js';

// The registry is a process-wide singleton (globalThis.__NS_HOT_REGISTRY__),
// so every test uses a UNIQUE module key/event to stay isolated from its
// neighbours instead of resetting shared state.

describe('hot-context custom-event listener lifecycle', () => {
	it('fires hot.on listeners registered by the current module evaluation', () => {
		const registry = getNsHotRegistry();
		const hot = registry.createHotContext('/src/app/one.component.ts');
		const cb = vi.fn();
		hot.on('spec:one-update', cb);

		expect(registry.dispatchHotEvent('spec:one-update', { id: 'x' })).toBe(1);
		expect(cb).toHaveBeenCalledWith({ id: 'x' });
	});

	it('prunes the previous evaluation’s hot.on listeners when the module re-evaluates (Vite parity)', () => {
		const registry = getNsHotRegistry();
		const staleCb = vi.fn();
		const freshCb = vi.fn();

		// First evaluation registers a listener — e.g. a compiled Angular
		// component's `angular:component-update` hook closing over its class.
		const firstEval = registry.createHotContext('/src/app/two.component.ts');
		firstEval.on('spec:two-update', staleCb);

		// Eviction + re-import re-runs the injected prelude → a second
		// createHotContext for the SAME canonical key. The stale listener must
		// not survive, or every dispatch would fan out to dead module closures.
		const secondEval = registry.createHotContext('/src/app/two.component.ts');
		secondEval.on('spec:two-update', freshCb);

		expect(registry.dispatchHotEvent('spec:two-update', { t: 1 })).toBe(1);
		expect(staleCb).not.toHaveBeenCalled();
		expect(freshCb).toHaveBeenCalledWith({ t: 1 });
	});

	it('only prunes the re-evaluated module’s listeners — other modules on the same event keep theirs', () => {
		const registry = getNsHotRegistry();
		const otherCb = vi.fn();
		const replacedCb = vi.fn();

		const other = registry.createHotContext('/src/app/three-a.component.ts');
		other.on('spec:three-update', otherCb);
		const replaced = registry.createHotContext('/src/app/three-b.component.ts');
		replaced.on('spec:three-update', replacedCb);

		// Re-evaluate ONLY three-b.
		registry.createHotContext('/src/app/three-b.component.ts');

		expect(registry.dispatchHotEvent('spec:three-update', {})).toBe(1);
		expect(otherCb).toHaveBeenCalledTimes(1);
		expect(replacedCb).not.toHaveBeenCalled();
	});

	it('hot.off removes a listener registered by the current evaluation', () => {
		const registry = getNsHotRegistry();
		const cb = vi.fn();
		const hot = registry.createHotContext('/src/app/four.component.ts');
		hot.on('spec:four-update', cb);
		hot.off('spec:four-update', cb);

		expect(registry.dispatchHotEvent('spec:four-update', {})).toBe(0);
		expect(cb).not.toHaveBeenCalled();
	});
});
