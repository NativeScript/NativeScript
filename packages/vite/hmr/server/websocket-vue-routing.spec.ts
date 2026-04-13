import { describe, expect, it } from 'vitest';
import { rewriteImports } from './websocket.js';

describe('rewriteImports Vue HTTP routing', () => {
	it('rewrites a relative Vue import to a single /ns/sfc path', () => {
		const input = `import Home from "./components/Home.vue";\n`;
		const out = rewriteImports(input, '/app/app.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173');

		expect(out).toContain('from "/ns/sfc/app/components/Home.vue"');
		expect(out).not.toContain('/ns/sfc/ns/sfc/');
	});

	it('preserves already routed SFC imports during the fallback Vue import pass', () => {
		const input = `import { render } from "/ns/sfc/42/app/components/Home.vue?vue&type=template";\n`;
		const out = rewriteImports(input, '/app/app.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173');

		expect(out).toContain('from "http://localhost:5173/ns/sfc/42/app/components/Home.vue?vue&type=template"');
		expect(out).not.toContain('/ns/sfc/42/ns/sfc/');
		expect(out).not.toContain('/ns/sfc/http:/');
	});
});
