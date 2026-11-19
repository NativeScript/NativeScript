import { describe, expect, it } from 'vitest';
import { listBundlerContextCodeFiles } from './bundler-context.js';

describe('listBundlerContextCodeFiles', () => {
	const files = ['src/main.ts', 'src/main.xml', 'src/pages/b.xml', 'src/pages/b.ts', 'src/pages/b.js', 'src/pages/a.xml', 'src/pages/a.js', 'src/pages/no-xml.ts', 'src/app.js', 'src/pages/c.xml'];

	it("TypeScript: each XML file's code-behind, preferring .ts, sorted, never the entry", () => {
		expect(listBundlerContextCodeFiles('typescript', files, 'src/main.ts')).toEqual(['src/pages/a.js', 'src/pages/b.ts']);
	});

	it('JavaScript: every .js file except the entry', () => {
		expect(listBundlerContextCodeFiles('javascript', files, 'src/app.js')).toEqual(['src/pages/b.js', 'src/pages/a.js']);
		expect(listBundlerContextCodeFiles('javascript', files)).toEqual(['src/pages/b.js', 'src/pages/a.js', 'src/app.js']);
	});
});
