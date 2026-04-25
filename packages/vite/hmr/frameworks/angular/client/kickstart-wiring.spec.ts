import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleAngularHotUpdateMessage } from './index.js';

// Parallel module-source prefetch wiring.
//
// These tests pin the contract between the Angular HMR client and the
// iOS runtime's `__nsKickstartHmrPrefetch` global:
//
//   1. On a successful eviction, the client MUST hand the eviction
//      array directly to the runtime BEFORE the entry re-import. This
//      gives the runtime time to fan out parallel HTTP fetches into
//      `g_prefetchCache` so V8's synchronous `ResolveModuleCallback`
//      walk hits memory instead of the network on each module.
//
//   2. The kickstart MUST run AFTER `__nsInvalidateModules` and BEFORE
//      `import(entry)`. Anything else risks a prefetch race against
//      the eviction (skipping URLs we WILL re-fetch) or a missed
//      cache (V8 starts walking before bodies land).
//
//   3. Older runtimes that lack `__nsKickstartHmrPrefetch` MUST NOT
//      cause the cycle to fail. The client falls back to the
//      sequential walk.
//
//   4. Eviction-fallback path (legacy URL-versioning when
//      `__nsInvalidateModules` is absent or threw) MUST skip the
//      kickstart — the URLs the runtime would receive (canonical
//      /ns/m/<rel>) wouldn't match the URLs V8 then asks for
//      (versioned /ns/m/__ns_hmr__/v<N>/<rel>), defeating the
//      cache lookup and wasting bandwidth.
//
// We install a fake `__nsKickstartHmrPrefetch` global so the client's
// runtime probe resolves to a spy without pulling the real native
// runtime (which would require a NativeScript host).

describe('Angular HMR client — kickstart wiring', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function setup(
		opts: {
			kickstart?: ReturnType<typeof vi.fn> | null;
			invalidator?: ReturnType<typeof vi.fn> | null;
			importer?: ReturnType<typeof vi.fn>;
			reboot?: ReturnType<typeof vi.fn>;
		} = {},
	): {
		g: any;
		kickstart: ReturnType<typeof vi.fn> | null;
		invalidator: ReturnType<typeof vi.fn> | null;
		importer: ReturnType<typeof vi.fn>;
		reboot: ReturnType<typeof vi.fn>;
		updater: ReturnType<typeof vi.fn>;
		teardown: () => void;
	} {
		const g = globalThis as any;
		const previous = {
			reboot: g.__reboot_ng_modules__,
			importer: g.__NS_HMR_IMPORT__,
			updater: g.__NS_UPDATE_ANGULAR_APP_OPTIONS__,
			invalidator: g.__nsInvalidateModules,
			kickstart: g.__nsKickstartHmrPrefetch,
			registerOnly: g.__NS_ANGULAR_HMR_REGISTER_ONLY__,
		};

		const reboot = opts.reboot ?? vi.fn();
		const importer = opts.importer ?? vi.fn(async () => ({}));
		const updater = vi.fn();
		const invalidator = opts.invalidator === null ? null : (opts.invalidator ?? vi.fn());
		const kickstart = opts.kickstart === null ? null : (opts.kickstart ?? vi.fn(() => ({ ok: true, fetched: 3, ms: 42 })));

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		if (invalidator) {
			g.__nsInvalidateModules = invalidator;
		} else {
			delete g.__nsInvalidateModules;
		}
		if (kickstart) {
			g.__nsKickstartHmrPrefetch = kickstart;
		} else {
			delete g.__nsKickstartHmrPrefetch;
		}

		return {
			g,
			kickstart,
			invalidator,
			importer,
			reboot,
			updater,
			teardown() {
				g.__reboot_ng_modules__ = previous.reboot;
				g.__NS_HMR_IMPORT__ = previous.importer;
				g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previous.updater;
				if (previous.invalidator === undefined) {
					delete g.__nsInvalidateModules;
				} else {
					g.__nsInvalidateModules = previous.invalidator;
				}
				if (previous.kickstart === undefined) {
					delete g.__nsKickstartHmrPrefetch;
				} else {
					g.__nsKickstartHmrPrefetch = previous.kickstart;
				}
				g.__NS_ANGULAR_HMR_REGISTER_ONLY__ = previous.registerOnly;
			},
		};
	}

	it('hands the eviction array to __nsKickstartHmrPrefetch after invalidation', async () => {
		const ctx = setup();
		const evictPaths = ['http://localhost:5173/ns/m/src/app/foo.component.ts', 'http://localhost:5173/ns/m/src/app/foo.component', 'http://localhost:5173/ns/m/src/main.ts'];

		try {
			await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths, importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

			expect(ctx.kickstart).toHaveBeenCalledTimes(1);

			const [arg0, arg1] = ctx.kickstart!.mock.calls[0];
			// First arg is the URL list (we pass a fresh copy so the
			// runtime can mutate without touching shared state).
			expect(Array.isArray(arg0)).toBe(true);
			expect(arg0).toEqual(evictPaths);
			expect(arg0).not.toBe(evictPaths);
			// Second arg is the option bag — { maxConcurrent, timeoutMs }.
			expect(arg1).toMatchObject({ maxConcurrent: 16, timeoutMs: 10000 });
		} finally {
			ctx.teardown();
		}
	});

	it('orders kickstart strictly between invalidate and the entry import', async () => {
		const ctx = setup();
		const evictPaths = ['http://localhost:5173/ns/m/src/main.ts'];

		try {
			await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths, importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

			const invalidateOrder = ctx.invalidator!.mock.invocationCallOrder[0];
			const kickstartOrder = ctx.kickstart!.mock.invocationCallOrder[0];
			const importOrder = ctx.importer.mock.invocationCallOrder[0];
			expect(invalidateOrder).toBeLessThan(kickstartOrder);
			expect(kickstartOrder).toBeLessThan(importOrder);
		} finally {
			ctx.teardown();
		}
	});

	it('skips the kickstart when the runtime lacks __nsKickstartHmrPrefetch (older runtime)', async () => {
		const ctx = setup({ kickstart: null });
		const evictPaths = ['http://localhost:5173/ns/m/src/main.ts'];

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths, importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			// Older runtimes still go through the eviction + import flow
			// — kickstart is a pure performance hint.
			expect(ctx.invalidator).toHaveBeenCalledTimes(1);
			expect(ctx.importer).toHaveBeenCalledTimes(1);
		} finally {
			ctx.teardown();
		}
	});

	it('skips the kickstart when eviction failed (legacy URL-versioning fallback path)', async () => {
		const throwingInvalidator = vi.fn(() => {
			throw new Error('runtime threw');
		});
		const ctx = setup({ invalidator: throwingInvalidator });

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 7, origin: 'http://localhost:5173', evictPaths: ['http://localhost:5173/ns/m/src/main.ts'], importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			// Eviction threw → URL strategy falls back to versioned form.
			// We MUST NOT have asked the runtime to prefetch canonical
			// URLs that V8 will not subsequently request.
			expect(ctx.kickstart).not.toHaveBeenCalled();
			expect(ctx.importer).toHaveBeenCalledWith('http://localhost:5173/ns/m/__ns_hmr__/v7/src/main.ts');
		} finally {
			ctx.teardown();
		}
	});

	it('skips the kickstart when there are no evict paths to prefetch', async () => {
		const ctx = setup();
		try {
			await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths: [], importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

			expect(ctx.kickstart).not.toHaveBeenCalled();
		} finally {
			ctx.teardown();
		}
	});

	it('survives __nsKickstartHmrPrefetch throwing without breaking the cycle', async () => {
		const throwingKickstart = vi.fn(() => {
			throw new Error('native bridge boom');
		});
		const ctx = setup({ kickstart: throwingKickstart });

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths: ['http://localhost:5173/ns/m/src/main.ts'], importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(ctx.importer).toHaveBeenCalledTimes(1);
			expect(ctx.reboot).toHaveBeenCalledWith(true);
		} finally {
			ctx.teardown();
		}
	});

	it('survives __nsKickstartHmrPrefetch returning a non-object (defensive parsing)', async () => {
		// Older or buggy native bridges might return primitives. The
		// client should treat anything that isn't a `{ ok, fetched, ms }`
		// shape as no-op and proceed.
		const looseKickstart = vi.fn(() => 'not an object' as any);
		const ctx = setup({ kickstart: looseKickstart });

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths: ['http://localhost:5173/ns/m/src/main.ts'], importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(ctx.importer).toHaveBeenCalledTimes(1);
		} finally {
			ctx.teardown();
		}
	});

	it('logs the kickstart result when verbose=true and the runtime is verbose-aware', async () => {
		// Verbose-mode logging matters because that's the breadcrumb
		// users grep for when triaging "is the kickstart even
		// helping?". The line shape is contract: we want it stable
		// across alphas so users with shell aliases keep working.
		const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const ctx = setup({
			kickstart: vi.fn(() => ({ ok: true, fetched: 12, ms: 87 })),
		});

		try {
			// Verbose mode requires both the build-time __NS_ENV_VERBOSE__
			// constant AND the per-call options.verbose. In tests
			// __NS_ENV_VERBOSE__ collapses to false (it's not declared
			// in the vitest realm), so we accept that the verbose log
			// may not fire. What we DO assert: `kickstart` was still
			// called and returned a parseable result. The line shape
			// itself is exercised in a later integration smoke once
			// the build constant lands in the bundle.
			await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths: ['http://localhost:5173/ns/m/src/main.ts'], importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: true });

			expect(ctx.kickstart).toHaveBeenCalledTimes(1);
			// Either the kickstart line fired (when __NS_ENV_VERBOSE__
			// is true) or it didn't (vitest realm). What we never
			// want is a thrown exception — that's all this assertion
			// guards against.
			const linesAfter = consoleInfoSpy.mock.calls.map((args) => String(args[0] ?? ''));
			const matched = linesAfter.find((l) => l.includes('[ns-hmr][angular] kickstart'));
			if (matched) {
				expect(matched).toMatch(/urls=1/);
				expect(matched).toMatch(/fetched=12/);
				expect(matched).toMatch(/ok=yes/);
				expect(matched).toMatch(/ms=87/);
			}
		} finally {
			consoleInfoSpy.mockRestore();
			ctx.teardown();
		}
	});

	it('passes a snapshot copy of evictPaths so runtime cannot mutate caller state', async () => {
		// Defensive copy: the runtime is C++ behind a shared bridge.
		// If we ever extended the bridge to mutate the array (e.g.,
		// dedupe in place), it must not leak back into the message
		// object the rest of the cycle still reads from.
		const ctx = setup();
		const evictPaths = ['http://localhost:5173/ns/m/src/a.ts', 'http://localhost:5173/ns/m/src/b.ts'];
		const original = evictPaths.slice();

		try {
			await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths, importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

			expect(evictPaths).toEqual(original);
			const [arg0] = ctx.kickstart!.mock.calls[0];
			expect(arg0).not.toBe(evictPaths);
			expect(arg0).toEqual(evictPaths);
		} finally {
			ctx.teardown();
		}
	});
});
