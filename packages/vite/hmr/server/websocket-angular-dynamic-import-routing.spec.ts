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

	it('keeps static app imports on the standard HTTP path', () => {
		const input = `import { HKFeature } from '/src/app/common/constants/feature.enum.ts';\n`;
		const output = rewriteImports(input, '/src/app/app.routes.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(output).toContain('/ns/m/src/app/common/constants/feature.enum');
		expect(output).not.toContain('__nsDynamicHmrImport');
	});
});
