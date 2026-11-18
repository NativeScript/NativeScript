import { describe, expect, it } from 'vitest';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { typescriptServerStrategy } from '../frameworks/typescript/server/strategy.js';
import { vueServerStrategy } from '../frameworks/vue/server/strategy.js';
import { angularServerStrategy } from '../frameworks/angular/server/strategy.js';
import { solidServerStrategy } from '../frameworks/solid/server/strategy.js';
import { javascriptServerStrategy } from '../frameworks/javascript/server/strategy.js';

// Mirrors the production STRATEGY_REGISTRY in websocket.ts.
const REGISTRY: FrameworkServerStrategy[] = [typescriptServerStrategy, vueServerStrategy, angularServerStrategy, solidServerStrategy, javascriptServerStrategy];

describe('FrameworkServerStrategy contract', () => {
	it('every registered strategy implements the required surface', () => {
		for (const strategy of REGISTRY) {
			expect(typeof strategy.flavor).toBe('string');
			expect(typeof strategy.matchesFile).toBe('function');
			expect(typeof strategy.processFile).toBe('function');
			expect(typeof strategy.buildRegistry).toBe('function');
		}
	});

	it('routes each strategy hook to its owning flavor; the rest keep the shared default', () => {
		// handleHotUpdate: every flavor owns its hot-update handler (shared prologue
		// + its own tail); the WebSocket plugin calls the active strategy's hook
		// directly — there is no shared inline dispatcher tail left.
		expect(typeof typescriptServerStrategy.handleHotUpdate).toBe('function');
		expect(typeof javascriptServerStrategy.handleHotUpdate).toBe('function');
		expect(typeof solidServerStrategy.handleHotUpdate).toBe('function');
		expect(typeof vueServerStrategy.handleHotUpdate).toBe('function');
		expect(typeof angularServerStrategy.handleHotUpdate).toBe('function');

		// deferDeltaBroadcast: the flavors whose client re-fetches the changed
		// module (Solid, Angular) defer the prologue's common-block delta
		// broadcast until after their own module-graph invalidation; TS/Vue
		// broadcast inline.
		expect(solidServerStrategy.deferDeltaBroadcast).toBe(true);
		expect(angularServerStrategy.deferDeltaBroadcast).toBe(true);
		expect(typescriptServerStrategy.deferDeltaBroadcast ?? false).toBe(false);
		expect(vueServerStrategy.deferDeltaBroadcast ?? false).toBe(false);

		// skipDefaultGraphUpdate: only Angular opts its HTML templates out of the
		// prologue's default graph-delta upsert (its tail re-queries the graph and
		// drives Analog's in-place swap / the reboot path itself).
		expect(typeof angularServerStrategy.skipDefaultGraphUpdate).toBe('function');
		expect(angularServerStrategy.skipDefaultGraphUpdate!('/src/app/home.component.html')).toBe(true);
		expect(angularServerStrategy.skipDefaultGraphUpdate!('/src/app/home.component.ts')).toBe(false);
		expect(typescriptServerStrategy.skipDefaultGraphUpdate).toBeUndefined();
		expect(solidServerStrategy.skipDefaultGraphUpdate).toBeUndefined();
		expect(vueServerStrategy.skipDefaultGraphUpdate).toBeUndefined();

		// Vue+Solid contribute import-map specifiers; Angular contributes the
		// /@ng/component URL vocabulary (volatile + preserve-query). Everyone else
		// keeps the shared (empty) default.
		expect(vueServerStrategy.importMapSpecifiers!()).toEqual(['nativescript-vue', 'vue']);
		expect(solidServerStrategy.importMapSpecifiers!()).toEqual(['solid-js']);
		expect(angularServerStrategy.importMapSpecifiers).toBeUndefined();
		expect(typescriptServerStrategy.importMapSpecifiers).toBeUndefined();

		expect(vueServerStrategy.volatilePatterns).toBeUndefined();
		expect(angularServerStrategy.volatilePatterns!()).toEqual(['/@ng/component']);
		expect(solidServerStrategy.volatilePatterns).toBeUndefined();
		expect(typescriptServerStrategy.volatilePatterns).toBeUndefined();

		expect(vueServerStrategy.preserveQueryPaths).toBeUndefined();
		expect(angularServerStrategy.preserveQueryPaths!()).toEqual(['/@ng/component']);
		expect(solidServerStrategy.preserveQueryPaths).toBeUndefined();
		expect(typescriptServerStrategy.preserveQueryPaths).toBeUndefined();
	});

	it('a strategy can implement every optional hook with the declared types', () => {
		const calls: string[] = [];
		const fixture: FrameworkServerStrategy = {
			flavor: 'fixture',
			matchesFile: (id) => id.endsWith('.fix'),
			deferDeltaBroadcast: true,
			async handleHotUpdate(ctx, deps) {
				// Exercises both context types. Not invoked here — the production
				// dispatcher supplies the live HmrContext + injected deps.
				calls.push(`hot:${deps.strategy.flavor}:${ctx.file}`);
			},
			importMapSpecifiers: () => ['fixture-runtime'],
			volatilePatterns: () => ['/@ns/fix/'],
			preserveQueryPaths: () => ['/@ns/fix/keep'],
			async processFile() {},
			async buildRegistry() {},
		};

		expect(fixture.deferDeltaBroadcast).toBe(true);
		expect(typeof fixture.handleHotUpdate).toBe('function');
		expect(fixture.importMapSpecifiers!()).toEqual(['fixture-runtime']);
		expect(fixture.volatilePatterns!()).toEqual(['/@ns/fix/']);
		expect(fixture.preserveQueryPaths!()).toEqual(['/@ns/fix/keep']);
	});
});
