import { getFileReplacementsFromEnv } from '../../src/helpers/fileReplacements';

describe('getFileReplacementsFromEnv', () => {
	it('handles no replacements', () => {
		const res = getFileReplacementsFromEnv({});
		expect(res).toEqual({});
	});

	it('ignores invalid env', () => {
		const res = getFileReplacementsFromEnv({
			// @ts-ignore
			replace: {},
		});
		expect(res).toEqual({});
	});

	it('resolves replacements relative to the project root', () => {
		const res = getFileReplacementsFromEnv({
			replace: './src/foo.ts:./src/bar.ts',
		});
		const entries = Object.entries(res);
		expect(res).toBeDefined();
		expect(entries.length).toBe(1);
		expect(entries[0]).toEqual(['__jest__/src/foo.ts', '__jest__/src/bar.ts']);
	});

	it('ignores invalid replacements', () => {
		const res = getFileReplacementsFromEnv({
			replace: ['one', 'two:', 'three:four'],
		});
		const entries = Object.entries(res);
		expect(res).toBeDefined();
		expect(entries.length).toBe(1);
		expect(entries[0]).toEqual(['__jest__/three', '__jest__/four']);
	});

	it('can parse replacements from a string', () => {
		const res = getFileReplacementsFromEnv({
			replace: 'one:two',
		});
		const entries = Object.entries(res);
		expect(res).toBeDefined();
		expect(entries.length).toBe(1);
		expect(entries[0]).toEqual(['__jest__/one', '__jest__/two']);
	});

	it('can parse multiple replacements from a string', () => {
		const res = getFileReplacementsFromEnv({
			replace: 'one:two,three:four',
		});
		const entries = Object.entries(res);
		expect(res).toBeDefined();
		expect(entries.length).toBe(2);
		expect(entries).toEqual([
			['__jest__/one', '__jest__/two'],
			['__jest__/three', '__jest__/four'],
		]);
	});

	it('can parse replacements from an array', () => {
		const res = getFileReplacementsFromEnv({
			replace: ['one:two', 'three:four'],
		});
		const entries = Object.entries(res);
		expect(res).toBeDefined();
		expect(entries.length).toBe(2);
		expect(entries).toEqual([
			['__jest__/one', '__jest__/two'],
			['__jest__/three', '__jest__/four'],
		]);
	});

	it('can parse multiple replacements from an array', () => {
		const res = getFileReplacementsFromEnv({
			replace: ['one:two,three:four', 'five:six'],
		});
		const entries = Object.entries(res);
		expect(res).toBeDefined();
		expect(entries.length).toBe(3);
		expect(entries).toEqual([
			['__jest__/one', '__jest__/two'],
			['__jest__/three', '__jest__/four'],
			['__jest__/five', '__jest__/six'],
		]);
	});
});
