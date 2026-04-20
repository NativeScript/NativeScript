import { describe, expect, it } from 'vitest';

import { rewriteImports } from './websocket.js';

describe('rewriteImports Angular dynamic app imports', () => {
	it('rewrites relative dynamic app imports through the runtime HMR helper', () => {
		const input = `const loadLogin = () => import('./components/login/login.component');\n`;
		const output = rewriteImports(input, '/src/app/app.routes.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(output).toContain('const __nsDynamicHmrImport =');
		expect(output).toContain('__nsDynamicHmrImport("/ns/m/src/app/components/login/login.component")');
		expect(output).not.toContain('import("/ns/m/src/app/components/login/login.component")');
	});

	it('preserves the boot-tagged app module family for dynamic imports during startup', () => {
		const input = `const loadSignup = () => import('./components/signup/signup.component');\n`;
		const output = rewriteImports(input, '/src/app/app.routes.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(output).toContain("import.meta.url.includes('/__ns_boot__/b1/') ? '/__ns_boot__/b1' : ''");
		expect(output).toContain('import.meta.url.match(/\\/__ns_hmr__\\/([^/]+)\\//)');
		expect(output).toContain("const graphVersion = typeof g.__NS_HMR_GRAPH_VERSION__ === 'number' ? g.__NS_HMR_GRAPH_VERSION__ : 0;");
		expect(output).toContain("const __nsActiveBootPrefix = graphVersion || nonce ? '' : __nsBootPrefix;");
		expect(output).toContain("const __preservedSpec = !nonce && __nsBootPrefix && spec.startsWith(__nsm + '/__ns_hmr__/') && !spec.includes('/node_modules/') ? __nsm + __nsBootPrefix + spec.slice(__nsm.length) : spec;");
		expect(output).toContain("const nextPath = __nsm + __nsActiveBootPrefix + '/__ns_hmr__/' + encodeURIComponent(tag) + spec.slice(__nsm.length);");
		expect(output).toContain("const tag = nonce ? `n${nonce}` : (graphVersion ? `v${graphVersion}` : (__nsImporterTag || 'live'));");
		expect(output).toContain("spec.startsWith(__nsm + '/node_modules/')");
	});

	it('prefers the incrementing HMR nonce over the graph version for app dynamic imports after hot updates', () => {
		const input = `const loadLogin = () => import('./components/login/login.component');\n`;
		const output = rewriteImports(input, '/src/app/app.routes.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(output).toContain("const tag = nonce ? `n${nonce}` : (graphVersion ? `v${graphVersion}` : (__nsImporterTag || 'live'));");
	});

	it('keeps static app imports on the standard HTTP path', () => {
		const input = `import { HKFeature } from '/src/app/common/constants/feature.enum.ts';\n`;
		const output = rewriteImports(input, '/src/app/app.routes.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(output).toContain('/ns/m/src/app/common/constants/feature.enum');
		expect(output).not.toContain('__nsDynamicHmrImport');
	});
});
