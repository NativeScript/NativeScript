import { describe, expect, it } from 'vitest';

import { createNsMResponseMemo } from './ns-m-response-memo.js';

describe('createNsMResponseMemo', () => {
	it('keys on spec + context + input-code hash', () => {
		const memo = createNsMResponseMemo();
		const key = memo.buildKey('/src/main', 'const a = 1;', 'angular|http://h:5173|0|0|/src/main.ts');
		expect(memo.get(key)).toBeUndefined();
		memo.set(key, '// served body');
		expect(memo.get(key)).toBe('// served body');

		// Same spec, different input code → different key (HMR edit invalidates implicitly).
		const editedKey = memo.buildKey('/src/main', 'const a = 2;', 'angular|http://h:5173|0|0|/src/main.ts');
		expect(editedKey).not.toBe(key);
		expect(memo.get(editedKey)).toBeUndefined();

		// Same code, different context (e.g. SFC map growth) → different key.
		const contextKey = memo.buildKey('/src/main', 'const a = 1;', 'angular|http://h:5173|1|1|/src/main.ts');
		expect(contextKey).not.toBe(key);
	});

	it('evicts least-recently-used entries beyond maxEntries', () => {
		const memo = createNsMResponseMemo({ maxEntries: 2 });
		const k1 = memo.buildKey('/a', 'a', 'ctx');
		const k2 = memo.buildKey('/b', 'b', 'ctx');
		const k3 = memo.buildKey('/c', 'c', 'ctx');
		memo.set(k1, 'A');
		memo.set(k2, 'B');
		// Touch k1 so k2 becomes the LRU entry.
		expect(memo.get(k1)).toBe('A');
		memo.set(k3, 'C');
		expect(memo.size()).toBe(2);
		expect(memo.get(k2)).toBeUndefined();
		expect(memo.get(k1)).toBe('A');
		expect(memo.get(k3)).toBe('C');
	});

	it('overwrites an existing key without growing', () => {
		const memo = createNsMResponseMemo({ maxEntries: 2 });
		const key = memo.buildKey('/a', 'a', 'ctx');
		memo.set(key, 'first');
		memo.set(key, 'second');
		expect(memo.size()).toBe(1);
		expect(memo.get(key)).toBe('second');
	});
});
