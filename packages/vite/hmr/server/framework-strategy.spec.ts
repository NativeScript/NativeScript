import { describe, expect, it } from 'vitest';
import type { FrameworkRouteContext, FrameworkServedModuleContext, FrameworkServerStrategy } from './framework-strategy.js';
import { typescriptServerStrategy } from '../frameworks/typescript/server/strategy.js';
import { vueServerStrategy } from '../frameworks/vue/server/strategy.js';
import { angularServerStrategy } from '../frameworks/angular/server/strategy.js';
import { solidServerStrategy } from '../frameworks/solid/server/strategy.js';

// Mirrors the production STRATEGY_REGISTRY in websocket.ts.
const REGISTRY: FrameworkServerStrategy[] = [typescriptServerStrategy, vueServerStrategy, angularServerStrategy, solidServerStrategy];

describe('FrameworkServerStrategy contract', () => {
	it('every registered strategy implements the required surface', () => {
		for (const strategy of REGISTRY) {
			expect(typeof strategy.flavor).toBe('string');
			expect(typeof strategy.matchesFile).toBe('function');
			expect(typeof strategy.processFile).toBe('function');
			expect(typeof strategy.buildRegistry).toBe('function');
		}
	});

	it('P2-A4 routes served-module transforms to their owning strategy; later-phase hooks stay unwired', () => {
		for (const strategy of REGISTRY) {
			// Not wired yet: handleHotUpdate → P2-A3; the remaining hooks → P2-A5.
			expect(strategy.handleHotUpdate).toBeUndefined();
			expect(strategy.processSfcCode).toBeUndefined();
			expect(strategy.registerRoutes).toBeUndefined();
			expect(strategy.importMapEntries).toBeUndefined();
			expect(strategy.volatilePatterns).toBeUndefined();
			// deferDeltaBroadcast (P2-A3) absent ⇒ falsy ⇒ today's broadcastDelta=true (TS/Vue) path.
			expect(strategy.deferDeltaBroadcast ?? false).toBe(false);
		}
		// P2-A4 (wired): only Angular overrides the `/ns/m` served-module rewrite
		// (register-only entry pass); only Solid patches served node_modules
		// (`@solid-refresh`). Every other flavor keeps the shared rewriteImports
		// default / identity transformNodeModule.
		expect(typeof angularServerStrategy.rewriteServedModule).toBe('function');
		expect(typeof solidServerStrategy.transformNodeModule).toBe('function');
		expect(typescriptServerStrategy.rewriteServedModule).toBeUndefined();
		expect(vueServerStrategy.rewriteServedModule).toBeUndefined();
		expect(solidServerStrategy.rewriteServedModule).toBeUndefined();
		expect(typescriptServerStrategy.transformNodeModule).toBeUndefined();
		expect(vueServerStrategy.transformNodeModule).toBeUndefined();
		expect(angularServerStrategy.transformNodeModule).toBeUndefined();
	});

	it('a strategy can implement every P2-A1 hook with the declared types', () => {
		const calls: string[] = [];
		const fixture: FrameworkServerStrategy = {
			flavor: 'fixture',
			matchesFile: (id) => id.endsWith('.fix'),
			deferDeltaBroadcast: true,
			async handleHotUpdate(ctx, deps) {
				// Exercises both context types. Not invoked here — the production
				// dispatcher (P2-A3) supplies the live HmrContext + injected deps.
				calls.push(`hot:${deps.strategy.flavor}:${ctx.file}`);
			},
			rewriteServedModule(code, ctx: FrameworkServedModuleContext) {
				return `${code}/* ${ctx.moduleId} @ ${ctx.serverOrigin} */`;
			},
			transformNodeModule(code, moduleId) {
				return moduleId.includes('@solid-refresh') ? `${code}\n/* patched */` : code;
			},
			processSfcCode: (code) => code.replace('export default', '__ns_sfc__'),
			registerRoutes(ctx: FrameworkRouteContext) {
				calls.push(`routes:${ctx.verbose}:${ctx.wss === null}`);
			},
			importMapEntries: (origin) => ({ 'fixture-runtime': `${origin}/ns/m/fixture` }),
			volatilePatterns: () => ['/@ns/fix/'],
			async processFile() {},
			async buildRegistry() {},
		};

		expect(fixture.deferDeltaBroadcast).toBe(true);
		expect(typeof fixture.handleHotUpdate).toBe('function');
		expect(
			fixture.rewriteServedModule!('CODE', {
				moduleId: '/src/a.fix',
				sfcFileMap: new Map(),
				depFileMap: new Map(),
				projectRoot: '/proj',
				serverOrigin: 'http://localhost:5173',
				verbose: false,
			}),
		).toBe('CODE/* /src/a.fix @ http://localhost:5173 */');
		expect(fixture.transformNodeModule!('M', '/node_modules/@solid-refresh/dist/index.js')).toBe('M\n/* patched */');
		expect(fixture.transformNodeModule!('M', '/node_modules/lodash/index.js')).toBe('M');
		expect(fixture.processSfcCode!('export default {}')).toBe('__ns_sfc__ {}');
		expect(fixture.importMapEntries!('http://localhost:5173')).toEqual({ 'fixture-runtime': 'http://localhost:5173/ns/m/fixture' });
		expect(fixture.volatilePatterns!()).toEqual(['/@ns/fix/']);

		fixture.registerRoutes!({ server: {} as any, wss: null, sfcFileMap: new Map(), depFileMap: new Map(), verbose: true });
		expect(calls).toContain('routes:true:true');
	});
});
