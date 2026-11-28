import { describe, expect, it } from 'vitest';
import { createUpdateModules, viteUrlCandidates } from './update-modules.js';

const ROOT = '/Users/dev/app';

describe('viteUrlCandidates', () => {
	it.each([
		['http://192.168.1.5:5173/src/app/home.ts?t=1795055998219', ['/src/app/home.ts']],
		['http://192.168.1.5:5173/src/app/home.ts?import&t=1795055998219', ['/src/app/home.ts']],
		['http://192.168.1.5:5173/src/App.vue?vue&type=style&index=0&t=1&lang.css', ['/src/App.vue?vue&type=style&index=0&lang.css']],
		['http://10.0.2.2:5173/@fs/repo/libs/x.ts?t=2', ['/@fs/repo/libs/x.ts']],
		['/src/app/home.ts', ['/src/app/home.ts', '/@fs/src/app/home.ts']],
		['/@fs/repo/libs/x.ts', ['/@fs/repo/libs/x.ts']],
		[`${ROOT}/src/app/home.ts`, ['/src/app/home.ts']],
		['/repo/libs/x.ts', ['/repo/libs/x.ts', '/@fs/repo/libs/x.ts']],
		['C:\\Users\\dev\\app\\src\\x.ts', []],
		['', []],
	])('%s → %j', (id, expected) => {
		expect(viteUrlCandidates(id, ROOT)).toEqual(expected);
	});
});

describe('createUpdateModules', () => {
	const modules = createUpdateModules({ changed: ['/src/app/child1.ts'], rerun: ['/src/main.ts', '/src/app/one.ts', '/src/app/child1.ts', '/@fs/repo/libs/util.ts'], root: ROOT });

	it('lists every re-run module once, with why it re-runs', () => {
		expect([...modules.modules]).toEqual([
			['/src/main.ts', 'rerun'],
			['/src/app/one.ts', 'rerun'],
			['/src/app/child1.ts', 'changed'],
			['/@fs/repo/libs/util.ts', 'rerun'],
		]);
		expect(modules.changed).toEqual(['/src/app/child1.ts']);
	});

	it("answers for a module's own import.meta.url, its Vite URL, or its file path", () => {
		expect(modules.isRerun('http://192.168.1.5:5173/src/app/one.ts?t=1795055998219')).toBe(true);
		expect(modules.isChanged('http://192.168.1.5:5173/src/app/one.ts?t=1795055998219')).toBe(false);
		expect(modules.isChanged('/src/app/child1.ts')).toBe(true);
		expect(modules.isChanged(`${ROOT}/src/app/child1.ts`)).toBe(true);
		expect(modules.isRerun('/repo/libs/util.ts')).toBe(true);
		expect(modules.isRerun('http://192.168.1.5:5173/src/app/three.ts')).toBe(false);
		expect(modules.isRerun(`${ROOT}/src/app/four.ts`)).toBe(false);
	});

	it('counts an edited file as re-run even when the server listed it only as changed', () => {
		const only = createUpdateModules({ changed: ['/src/x.ts'], rerun: [] });
		expect(only.isRerun('/src/x.ts')).toBe(true);
	});
});
