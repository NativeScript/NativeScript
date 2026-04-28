import { describe, expect, it } from 'vitest';
import { parse as babelParse } from '@babel/parser';

import { __test_processCodeForDevice as processCodeForDevice } from './websocket.js';

const MODULE_IMPORT_ANALYSIS_PLUGINS = ['typescript', 'jsx', 'importMeta', 'topLevelAwait', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'decorators-legacy'] as any;

function collectTopLevelImportSources(code: string): string[] {
	const ast = babelParse(code, {
		sourceType: 'module',
		plugins: MODULE_IMPORT_ANALYSIS_PLUGINS,
	}) as any;

	return (ast?.program?.body || []).filter((node: any) => node?.type === 'ImportDeclaration' && typeof node?.source?.value === 'string').map((node: any) => node.source.value as string);
}

describe('processCodeForDevice import safety', () => {
	it('does not hoist template-literal imports into top-level module scope', () => {
		const input = [
			`const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';`,
			`const MERMAID_CDN$1 = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';`,
			`export function renderMermaid(diagram) {`,
			`  return \``,
			`    <script type="module">`,
			`      import mermaid from '\${MERMAID_CDN}';`,
			`      mermaid.initialize({ startOnLoad: true });`,
			`      mermaid.run();`,
			`    </script>`,
			`    <pre class="mermaid">\${diagram}</pre>`,
			`  \`;`,
			`}`,
			`export function renderFullscreenMermaid(diagram) {`,
			`  return \``,
			`    <script type="module">`,
			`      import mermaid from '\${MERMAID_CDN$1}';`,
			`      mermaid.initialize({ startOnLoad: true });`,
			`      mermaid.run();`,
			`    </script>`,
			`    <pre class="mermaid fullscreen">\${diagram}</pre>`,
			`  \`;`,
			`}`,
		].join('\n');

		const out = processCodeForDevice(input, false, true, true);
		const topLevelSources = collectTopLevelImportSources(out);

		expect(out).toContain(`import mermaid from '\${MERMAID_CDN}';`);
		expect(out).toContain(`import mermaid from '\${MERMAID_CDN$1}';`);
		expect(topLevelSources).not.toContain('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs');
		expect(topLevelSources.some((source) => source.includes('${MERMAID_CDN'))).toBe(false);
	});

	it('does not rewrite bare imports that only appear inside template literals', () => {
		const input = [`import { Component } from "http://localhost:5173/ns/m/node_modules/@angular/core/fesm2022/core.mjs";`, `const example = \``, `  <script type="module">`, `    import { Component } from '@angular/core';`, `    console.log(Component);`, `  </script>`, `\`;`, `export { example, Component };`].join('\n');

		const out = processCodeForDevice(input, false, true, true);

		expect(out).toContain(`import { Component } from '@angular/core';`);
		expect(out).not.toContain(`import { Component } from "http://localhost:5173/ns/m/node_modules/@angular/core/fesm2022/core.mjs";\nimport { Component } from "http://localhost:5173/ns/m/node_modules/@angular/core/fesm2022/core.mjs";`);
	});

	it('rewrites resolved NativeScript core paths to the /ns/core bridge', () => {
		const input = ['import { Device } from "/node_modules/@nativescript/core/index.js?v=abc123";', 'export { Device };'].join('\n');

		const out = processCodeForDevice(input, false, true, true);

		expect(out).toMatch(/import\s+__ns_core_ns\d+\s+from\s+["']\/ns\/core["']/);
		expect(out).toMatch(/const\s+\{\s*Device\s*}\s*=\s*__ns_core_ns\d+\s*;/);
		expect(out).not.toContain('/node_modules/@nativescript/core/index.js');
		expect(collectTopLevelImportSources(out)).toContain('/ns/core');
	});

	// Regression: @supabase/realtime-js's RealtimeClient.js throws an Error whose
	// message contains the literal example text:
	//
	//   '  import ws from "ws"\n' +
	//
	// The "splitConcatenatedImports" pass on processCodeForDevice used to include
	// `'`, `"`, and `` ` `` in its delimiter character class, which caused the
	// regex to fire INSIDE that string literal — splitting it into two lines
	// (`'\nimport ws from "..."`) and producing a SyntaxError on device. This
	// test pins the safe behavior: example imports inside string literals must
	// remain inside the same string-literal expression.
	it('does not rewrite example imports inside string-literal error messages', () => {
		const input = [`function explainNodeWebSocket(error) {`, `    throw new Error(\`\${error}\\n\\n\` +`, `        'To use Realtime in Node.js, you need to provide a WebSocket implementation:\\n\\n' +`, `        'Option 1: Use Node.js 22+ which has native WebSocket support\\n' +`, `        'Option 2: Install and provide the "ws" package:\\n\\n' +`, `        '  npm install ws\\n\\n' +`, `        '  import ws from "ws"\\n' +`, `        '  const client = new RealtimeClient(url, {\\n' +`, `        '    transport: ws\\n' +`, `        '  })');`, `}`, `export { explainNodeWebSocket };`].join('\n');

		const out = processCodeForDevice(input, false, true, true);

		// The string literal must remain a single literal — apostrophe, two
		// spaces, then `import`, all on the same line. If the regex fired
		// inside the literal it would split this into `'\nimport`.
		expect(out).toContain(`'  import ws from "ws"\\n' +`);
		expect(out).not.toMatch(/'\s*\n\s*import ws from/);

		// And the example imports must NOT have been hoisted into top-level
		// import declarations of the module.
		const topLevelSources = collectTopLevelImportSources(out);
		expect(topLevelSources).not.toContain('ws');
	});

	it('still recognizes genuinely concatenated imports after structural delimiters', () => {
		// After fixing the splitConcatenatedImports regex to drop `'`, `"`, `` ` ``
		// from its delimiter character class, we still need to make sure the
		// regex fires for the structural delimiters (`;`, `}`, `)`, `]`).
		// `processCodeForDevice` runs `ensureNativeScriptModuleBindings` which
		// uses Babel to extract top-level imports, so the strongest assertion
		// here is that each example produces a recognized top-level import.
		const cases: Array<{ name: string; input: string; expectedSource: string }> = [
			{
				name: 'after semicolon',
				input: `const x = 1;import { a } from "/ns/m/a.js";`,
				expectedSource: '/ns/m/a.js',
			},
			{
				name: 'after closing brace',
				input: `function f() { return 1 }import { b } from "/ns/m/b.js";`,
				expectedSource: '/ns/m/b.js',
			},
			{
				name: 'after closing bracket',
				input: `const arr = [1, 2, 3]\nimport { d } from "/ns/m/d.js";`,
				expectedSource: '/ns/m/d.js',
			},
		];
		for (const { name, input, expectedSource } of cases) {
			const out = processCodeForDevice(input, false, true, true);
			expect(collectTopLevelImportSources(out), `case: ${name}`).toContain(expectedSource);
		}
	});
});
