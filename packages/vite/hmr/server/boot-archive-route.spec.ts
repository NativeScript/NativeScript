import { describe, expect, it } from 'vitest';

import { buildBootArchive } from './boot-archive-route.js';
import { parseBootArchiveText, serializeBootArchiveLine } from '../shared/runtime/boot-archive-format.js';

describe('boot archive NDJSON round trip', () => {
	it('serializes and parses module entries, ignoring meta/junk lines', () => {
		const text = [serializeBootArchiveLine({ kind: 'meta', version: 1, source: 'recorded', urls: 2 }), serializeBootArchiveLine({ kind: 'mod', url: 'http://h:5173/ns/m/src/main', body: 'export {};' }), 'not json\n', serializeBootArchiveLine({ kind: 'mod', url: 'http://h:5173/ns/rt', body: 'export const x = 1;' }), serializeBootArchiveLine({ kind: 'mod', url: 'http://h:5173/ns/m/src/empty', body: '' }), '\n'].join('');
		const entries = parseBootArchiveText(text);
		expect(entries).toEqual([
			{ url: 'http://h:5173/ns/m/src/main', body: 'export {};' },
			{ url: 'http://h:5173/ns/rt', body: 'export const x = 1;' },
		]);
	});

	it('tolerates empty and malformed input', () => {
		expect(parseBootArchiveText('')).toEqual([]);
		expect(parseBootArchiveText(undefined as any)).toEqual([]);
		expect(parseBootArchiveText('{"kind":"mod"}\n{"kind":"mod","url":1,"body":"x"}\n')).toEqual([]);
	});
});

describe('buildBootArchive', () => {
	const urls = ['http://h:5173/ns/m/src/main', 'http://h:5173/ns/m/src/missing', 'http://h:5173/ns/rt?x=1'];

	it('emits only 2xx non-empty bodies and reports served URLs', async () => {
		const requestedPaths: string[] = [];
		const entries: Array<{ url: string; body: string }> = [];
		const served = await buildBootArchive(
			urls,
			async (pathWithSearch) => {
				requestedPaths.push(pathWithSearch);
				if (pathWithSearch.includes('missing')) return { status: 404, body: 'nope' };
				return { status: 200, body: `// ${pathWithSearch}` };
			},
			(entry) => entries.push({ url: entry.url, body: entry.body }),
			2,
		);
		expect(requestedPaths).toContain('/ns/m/src/main');
		expect(requestedPaths).toContain('/ns/rt?x=1');
		expect(served).toEqual(['http://h:5173/ns/m/src/main', 'http://h:5173/ns/rt?x=1']);
		expect(entries.map((e) => e.url)).toEqual(served);
	});

	it('skips unparseable URLs without failing the wave', async () => {
		const served = await buildBootArchive(
			['%%%not-a-url%%%', 'http://h:5173/ns/core'],
			async () => ({ status: 200, body: 'export {};' }),
			() => {},
		);
		expect(served).toEqual(['http://h:5173/ns/core']);
	});
});
