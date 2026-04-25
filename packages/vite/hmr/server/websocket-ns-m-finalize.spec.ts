import { describe, expect, it } from 'vitest';

import type { FrameworkServerStrategy } from './framework-strategy.js';
import { finalizeNsMServedModule } from './websocket-ns-m-finalize.js';

const strategy: FrameworkServerStrategy = {
	flavor: 'typescript',
	matchesFile: () => true,
	preClean: (code) => code,
	rewriteFrameworkImports: (code) => code,
	postClean: (code) => code,
	ensureVersionedImports: (code) => code,
	async processFile() {},
	async buildRegistry() {},
};

const baseHelpers = {
	requireGuardSnippet: '',
	cleanCode: (value: string) => value,
	processCodeForDevice: (value: string) => value,
	rewriteImports: (value: string) => value,
	rewriteAngularEntry: (value: string) => value,
	expandStarExports: async (value: string) => value,
};

describe('finalizeNsMServedModule', () => {
	// alpha.59 — Stable URL + Explicit Invalidation.
	//
	// Pre-alpha.59 the finalizer stamped every emitted `/ns/m/<rel>` URL
	// with `__ns_hmr__/v<N>/`. The version segment forced V8 to refetch
	// the entire dependency closure on every save (the URL was V8's
	// cache key). alpha.59 emits stable URLs so the closure stays hot;
	// only modules in the explicit eviction set are refetched.
	it('emits stable canonical URLs for app /ns/m imports under HMR', async () => {
		const code = 'import "/ns/m/src/app/app.routes";\nexport const ok = true;\n';
		const out = await finalizeNsMServedModule({
			code,
			spec: '/src/app.ts',
			resolvedCandidate: '/src/app.ts',
			forcedVer: 'v7',
			bootTaggedRequest: false,
			graphVersion: 7,
			serverOrigin: 'http://localhost:5173',
			strategy,
			helpers: baseHelpers,
		});

		expect(out).toContain('import "/ns/m/src/app/app.routes";');
		expect(out).not.toContain('__ns_hmr__');
	});

	it('preserves the boot prefix for boot-tagged requests but never adds an hmr tag', async () => {
		const code = 'import "/ns/m/src/app/app.routes";\nexport const ok = true;\n';
		const out = await finalizeNsMServedModule({
			code,
			spec: '/src/app.ts',
			resolvedCandidate: '/src/app.ts',
			forcedVer: null,
			bootTaggedRequest: true,
			graphVersion: 7,
			serverOrigin: 'http://localhost:5173',
			strategy,
			helpers: baseHelpers,
		});

		// Boot prefix preserved (cold-boot progress instrumentation
		// reads it server-side), but no `__ns_hmr__/<tag>/` segment.
		expect(out).toContain('import "/ns/m/__ns_boot__/b1/src/app/app.routes";');
		expect(out).not.toContain('__ns_hmr__');
	});

	it('strips legacy `__ns_hmr__/<tag>/` segments from emitted URLs', async () => {
		// A historical caller (e.g. a vendor file) might still carry a
		// legacy tag in its source. The finalizer must canonicalize it
		// to a stable URL so it shares a cache identity with current
		// emissions. This is symmetric with the runtime canonicalizer
		// (HMRSupport.mm) which collapses inbound URL shapes too.
		const code = 'import "/ns/m/__ns_hmr__/v491/src/app/app.routes";\nexport const ok = true;\n';
		const out = await finalizeNsMServedModule({
			code,
			spec: '/src/app.ts',
			resolvedCandidate: '/src/app.ts',
			forcedVer: 'v7',
			bootTaggedRequest: false,
			graphVersion: 7,
			serverOrigin: 'http://localhost:5173',
			strategy,
			helpers: baseHelpers,
		});

		expect(out).toContain('import "/ns/m/src/app/app.routes";');
		expect(out).not.toContain('__ns_hmr__');
	});

	it('keeps node_modules paths on the canonical /ns/m/node_modules URL', async () => {
		const code = 'import "/ns/m/node_modules/foo-pkg/index.js";\nexport const ok = true;\n';
		const out = await finalizeNsMServedModule({
			code,
			spec: '/src/app.ts',
			resolvedCandidate: '/src/app.ts',
			forcedVer: 'v7',
			bootTaggedRequest: false,
			graphVersion: 7,
			serverOrigin: 'http://localhost:5173',
			strategy,
			helpers: baseHelpers,
		});

		expect(out).toContain('import "/ns/m/node_modules/foo-pkg/index.js";');
		expect(out).not.toContain('__ns_hmr__');
		expect(out).not.toContain('__ns_boot__');
	});
});
