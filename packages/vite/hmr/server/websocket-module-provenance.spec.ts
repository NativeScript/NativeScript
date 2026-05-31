import { describe, expect, it } from 'vitest';

import { processCodeForDevice } from './websocket-device-transform.js';

describe('processCodeForDevice module provenance', () => {
	it('records node_modules HTTP provenance when a source id is provided', () => {
		const out = processCodeForDevice('export const ok = true;\n', false, true, true, '/node_modules/stacktrace-js/stacktrace.js');

		expect(out).toContain('__NS_RECORD_MODULE_PROVENANCE__');
		expect(out).toContain('"stacktrace-js"');
		expect(out).toContain('"http-esm"');
		expect(out).toContain('"/node_modules/stacktrace-js/stacktrace.js"');
	});
});
