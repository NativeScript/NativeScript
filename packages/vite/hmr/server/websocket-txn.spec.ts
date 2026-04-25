import { describe, expect, it } from 'vitest';

import { buildTxnModuleCode } from './websocket-txn.js';

describe('websocket txn module builder', () => {
	it('builds an empty transactional module when there are no ids', () => {
		const code = buildTxnModuleCode(5, []);
		expect(code).toContain('// [txn] version=5 count=0');
		expect(code.trim().endsWith('export default true;')).toBe(true);
		expect(code).not.toContain('await import(');
	});

	it('routes vue modules through /ns/asm and app modules through /ns/m', () => {
		const code = buildTxnModuleCode(12, ['/app/main.ts', '/app/App.vue']);
		expect(code).toContain('await import("/ns/m/app/main.ts");');
		expect(code).toContain('await import("/ns/asm/12?path=%2Fapp%2FApp.vue");');
	});
});
