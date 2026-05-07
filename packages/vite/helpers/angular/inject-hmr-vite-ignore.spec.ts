import { describe, expect, it } from 'vitest';

import { injectAngularHmrViteIgnore } from './inject-hmr-vite-ignore.js';

describe('injectAngularHmrViteIgnore', () => {
	it('injects /* @vite-ignore */ into Angular HMR initializer dynamic imports', () => {
		const input = `function FooComponent_HmrLoad(t) {
	import(i0.ɵɵgetReplaceMetadataURL(id, t, import.meta.url)).then((m) => m.default && i0.ɵɵreplaceMetadata(FooComponent, m.default, [i0]));
}`;

		const output = injectAngularHmrViteIgnore(input);

		expect(output).toContain('import( /* @vite-ignore */ i0.ɵɵgetReplaceMetadataURL(id, t, import.meta.url))');
	});

	it('is idempotent — does not duplicate the comment when already present', () => {
		const input = `function FooComponent_HmrLoad(t) {
	import(/* @vite-ignore */ i0.ɵɵgetReplaceMetadataURL(id, t, import.meta.url)).then((m) => m.default);
}`;

		const output = injectAngularHmrViteIgnore(input);

		expect(output).toBe(input);
		expect((output.match(/@vite-ignore/g) ?? []).length).toBe(1);
	});

	it('returns the original code unchanged when no qualifying imports exist', () => {
		const input = `import { foo } from './bar';
const x = import('./statically-known-path');
function unrelated() {
	return import(\`./\${name}\`);
}`;

		const output = injectAngularHmrViteIgnore(input);

		expect(output).toBe(input);
	});

	it('handles multiple HMR loaders in the same file', () => {
		const input = `function FooComponent_HmrLoad(t) {
	import(i0.ɵɵgetReplaceMetadataURL(idFoo, t, import.meta.url)).then(() => {});
}
function BarComponent_HmrLoad(t) {
	import(i0.ɵɵgetReplaceMetadataURL(idBar, t, import.meta.url)).then(() => {});
}`;

		const output = injectAngularHmrViteIgnore(input);

		expect((output.match(/@vite-ignore/g) ?? []).length).toBe(2);
		expect(output).toContain('import( /* @vite-ignore */ i0.ɵɵgetReplaceMetadataURL(idFoo,');
		expect(output).toContain('import( /* @vite-ignore */ i0.ɵɵgetReplaceMetadataURL(idBar,');
	});

	it('does not match `import.meta.url` references — only dynamic `import(...)` calls', () => {
		const input = `function FooComponent_HmrLoad(t) {
	const u = import.meta.url;
	import(i0.ɵɵgetReplaceMetadataURL(id, t, u));
}`;

		const output = injectAngularHmrViteIgnore(input);

		expect(output).toContain('import( /* @vite-ignore */ i0.ɵɵgetReplaceMetadataURL');
		expect(output).toContain('const u = import.meta.url;');
		expect((output.match(/@vite-ignore/g) ?? []).length).toBe(1);
	});

	it('leaves unrelated dynamic imports alone — only HMR initializer URLs are rewritten', () => {
		const input = `async function loadFeature() {
	const m = await import('./feature.js');
	return m.default;
}
function FooComponent_HmrLoad(t) {
	import(i0.ɵɵgetReplaceMetadataURL(id, t, import.meta.url));
}`;

		const output = injectAngularHmrViteIgnore(input);

		expect(output).toContain(`await import('./feature.js')`);
		expect(output).toContain('import( /* @vite-ignore */ i0.ɵɵgetReplaceMetadataURL');
		expect((output.match(/@vite-ignore/g) ?? []).length).toBe(1);
	});

	it('recognizes the unicode-escaped form `\\u0275\\u0275getReplaceMetadataURL`', () => {
		const input = `function FooComponent_HmrLoad(t) {
	import(i0.\\u0275\\u0275getReplaceMetadataURL(id, t, import.meta.url));
}`;

		const output = injectAngularHmrViteIgnore(input);

		expect(output).toContain('import( /* @vite-ignore */ i0.\\u0275\\u0275getReplaceMetadataURL');
	});

	it('skips when the file does not mention the identifier at all (cheap pre-check)', () => {
		const input = `import { Foo } from './foo.js';
const x = import('./other');`;

		const output = injectAngularHmrViteIgnore(input);

		expect(output).toBe(input);
	});

	it('returns empty input unchanged', () => {
		expect(injectAngularHmrViteIgnore('')).toBe('');
	});

	it('preserves the original `.then(...)` chain after the import', () => {
		const input = `function FooComponent_HmrLoad(t) {
	import(i0.ɵɵgetReplaceMetadataURL(id, t, import.meta.url))
		.then((m) => m.default && i0.ɵɵreplaceMetadata(FooComponent, m.default, [i0], [], import.meta, id));
}`;

		const output = injectAngularHmrViteIgnore(input);

		expect(output).toContain('.then((m) => m.default && i0.ɵɵreplaceMetadata(FooComponent, m.default, [i0], [], import.meta, id));');
	});
});
