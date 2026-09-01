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

describe('hot-context accept callbacks', () => {
	it('exposes the current evaluation’s accept callbacks (a bare accept() counts)', () => {
		const registry = getNsHotRegistry();
		const hot = registry.createHotContext('/src/accept-one.tsx');
		const cb = vi.fn();
		hot.accept(cb);
		hot.accept();

		const callbacks = registry.getAcceptCallbacks('/src/accept-one');
		expect(callbacks).toHaveLength(2);
		callbacks[0]({ fresh: true });
		expect(cb).toHaveBeenCalledWith({ fresh: true });
	});

	it('returns a copy keyed canonically, and a fresh evaluation resets the list', () => {
		const registry = getNsHotRegistry();
		registry.createHotContext('/src/accept-two.tsx').accept(() => {});
		const snapshot = registry.getAcceptCallbacks('http://localhost:5173/ns/m/src/accept-two?t=1');
		expect(snapshot).toHaveLength(1);

		// The re-evaluated body has not called accept yet → nothing registered,
		// while the snapshot taken before eviction is unaffected.
		registry.createHotContext('/src/accept-two.tsx');
		expect(registry.getAcceptCallbacks('/src/accept-two')).toEqual([]);
		expect(snapshot).toHaveLength(1);
	});

	it('returns an empty list for a module that never evaluated', () => {
		expect(getNsHotRegistry().getAcceptCallbacks('/src/never-seen')).toEqual([]);
	});
});

describe('hot-context dependency accepts', () => {
	it('resolves relative dependency paths against the owner and indexes the acceptor', () => {
		const registry = getNsHotRegistry();
		const cb = vi.fn();
		registry.createHotContext('/src/features/flame.ts').accept('./flame.worker', cb);
		registry.createHotContext('/src/features/other.ts').accept(['../util/shared.ts'], () => {});

		expect(registry.acceptsDep('/src/features/flame', '/src/features/flame.worker')).toBe(true);
		expect(registry.acceptsDep('/src/features/other', '/src/util/shared')).toBe(true);
		expect(registry.acceptsDep('/src/features/flame', '/src/util/shared')).toBe(false);

		const acceptors = registry.getDepAcceptors('http://localhost:5173/ns/m/src/features/flame.worker?t=1');
		expect(acceptors.map((a) => a.owner)).toEqual(['/src/features/flame']);
		acceptors[0].callback([undefined]);
		expect(cb).toHaveBeenCalledWith([undefined]);
	});

	it('does not treat a dependency accept as a self accept, and drops it on re-evaluation', () => {
		const registry = getNsHotRegistry();
		registry.createHotContext('/src/spawner.ts').accept('./spawner.worker', () => {});
		expect(registry.getAcceptCallbacks('/src/spawner')).toEqual([]);
		expect(registry.getDepAcceptors('/src/spawner.worker')).toHaveLength(1);

		registry.createHotContext('/src/spawner.ts');
		expect(registry.getDepAcceptors('/src/spawner.worker')).toEqual([]);
		expect(registry.acceptsDep('/src/spawner', '/src/spawner.worker')).toBe(false);
	});

	it('ignores bare specifiers in the dependency form', () => {
		const registry = getNsHotRegistry();
		registry.createHotContext('/src/bare.ts').accept('octane', () => {});
		expect(registry.getAcceptCallbacks('/src/bare')).toEqual([]);
		expect(registry.getDepAcceptors('octane')).toEqual([]);
	});
});
