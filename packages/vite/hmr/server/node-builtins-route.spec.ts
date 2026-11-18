import { describe, expect, it } from 'vitest';
import { builtinModules } from 'node:module';

import { getNodeBuiltinSpecifiers } from './node-builtins-route.js';

describe('getNodeBuiltinSpecifiers', () => {
	it('lists every node: builtin, nested names included, and no bare or prefix forms', () => {
		const specifiers = getNodeBuiltinSpecifiers();

		expect(specifiers).toContain('node:url');
		expect(specifiers).toContain('node:path');
		expect(specifiers).toContain('node:fs/promises');
		for (const spec of specifiers) {
			expect(spec.startsWith('node:')).toBe(true);
			expect(spec.endsWith('/')).toBe(false);
		}

		// Vocabulary is Node's own builtin list — nothing hand-maintained.
		const unprefixed = builtinModules.filter((name) => !name.startsWith('node:'));
		expect(specifiers.length).toBe(new Set(unprefixed).size);
	});
});
