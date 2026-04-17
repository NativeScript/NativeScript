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
		const input = [`const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';`, `export function renderMermaid(diagram) {`, `  return \``, `    <script type="module">`, `      import mermaid from '\${MERMAID_CDN}';`, `      mermaid.initialize({ startOnLoad: true });`, `      mermaid.run();`, `    </script>`, `    <pre class="mermaid">\${diagram}</pre>`, `  \`;`, `}`].join('\n');

		const out = processCodeForDevice(input, false, true, true);

		expect(out).toContain(`import mermaid from '\${MERMAID_CDN}';`);
		expect(collectTopLevelImportSources(out)).not.toContain('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs');
	});

	it('does not rewrite bare imports that only appear inside template literals', () => {
		const input = [`import { Component } from "http://localhost:5173/ns/m/node_modules/@angular/core/fesm2022/core.mjs";`, `const example = \``, `  <script type="module">`, `    import { Component } from '@angular/core';`, `    console.log(Component);`, `  </script>`, `\`;`, `export { example, Component };`].join('\n');

		const out = processCodeForDevice(input, false, true, true);

		expect(out).toContain(`import { Component } from '@angular/core';`);
		expect(out).not.toContain(`import { Component } from "http://localhost:5173/ns/m/node_modules/@angular/core/fesm2022/core.mjs";\nimport { Component } from "http://localhost:5173/ns/m/node_modules/@angular/core/fesm2022/core.mjs";`);
	});
});
