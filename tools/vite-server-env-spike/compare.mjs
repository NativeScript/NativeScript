// Spike: compare what a `consumer: 'server'` Vite environment with
// `moduleRunnerTransform: false` emits against Vite's client environment and
// the current `/ns/m` device output, for the same toolbox modules.
//
// Usage (from the repo root):
//   node tools/vite-server-env-spike/compare.mjs [--platform ios|android] [/src/a.ts ...]
// Output: tools/vite-server-env-spike/out/<module>.{client,server,nsm}.js + summary.json

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const spikeDir = import.meta.dirname;
const repoRoot = path.resolve(spikeDir, '../..');
const toolbox = path.join(repoRoot, 'apps/toolbox');
const outDir = path.join(spikeDir, 'out');

const args = process.argv.slice(2);
const platformIdx = args.indexOf('--platform');
const platform = platformIdx >= 0 ? args.splice(platformIdx, 2)[1] : 'ios';
const modules = args.length ? args : ['/src/main.ts', '/src/main-page.ts', '/src/main-view-model.ts', '/src/pages/list-page.ts', '/src/pages/dialogs.ts'];

// @nativescript/vite derives platform/HMR/project root from argv (after `--`,
// as `vite serve -- --env.<platform> --env.hmr`) and cwd at import time.
process.chdir(toolbox);
process.argv.push('--', `--env.${platform}`, '--env.hmr');
process.env.NS_HMR_PORT ??= '5199';

const { createServer, mergeConfig } = await import('vite');
const { init, parse } = await import('es-module-lexer');
const { typescriptConfig } = await import(pathToFileURL(path.join(toolbox, 'node_modules/@nativescript/vite/configuration/typescript.js')).href);

const config = mergeConfig(typescriptConfig({ mode: 'development' }), {
	root: toolbox,
	environments: {
		nativescript: {
			consumer: 'server',
			dev: { moduleRunnerTransform: false },
		},
	},
});

const server = await createServer({ ...config, configFile: false });
await server.listen();
const port = server.config.server.port;
const origin = `http://localhost:${port}`;
await init;

const MARKERS = {
	viteClient: /\/@vite\/client/g,
	createHotContext: /__vite__createHotContext/g,
	importMetaHot: /import\.meta\.hot/g,
	tStamp: /[?&]t=\d+/g,
	vStamp: /[?&]v=[0-9a-f]+/g,
	atId: /\/@id\//g,
	atFs: /\/@fs\//g,
	viteDeps: /\.vite\/deps/g,
	ssrImport: /__vite_ssr_import__/g,
	nsCore: /\/ns\/core/g,
	nsM: /\/ns\/m\//g,
};

function analyze(code) {
	if (code == null) return null;
	const counts = Object.fromEntries(Object.entries(MARKERS).map(([k, re]) => [k, (code.match(re) || []).length]));
	let imports = [];
	try {
		const [imps] = parse(code);
		imports = imps.map((i) => i.n ?? code.slice(i.s, i.e)).filter(Boolean);
	} catch (e) {
		imports = [`<lexer error: ${e.message}>`];
	}
	return { lines: code.split('\n').length, bytes: code.length, counts, imports };
}

async function capture(label, fn) {
	try {
		return { code: await fn(), error: null };
	} catch (e) {
		return { code: null, error: `${label}: ${e?.message || e}`.split('\n').slice(0, 6).join('\n') };
	}
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const summary = { platform, vite: (await import('vite')).version, environments: Object.keys(server.environments), modules: {} };

for (const url of modules) {
	const name = url.replace(/^\//, '').replace(/[\/]/g, '__');
	const results = {
		client: await capture('client', async () => (await server.environments.client.transformRequest(url))?.code),
		server: await capture('server', async () => (await server.environments.nativescript.transformRequest(url))?.code),
		nsm: await capture('nsm', async () => {
			const res = await fetch(`${origin}/ns/m${url}`);
			const body = await res.text();
			if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
			return body;
		}),
	};
	summary.modules[url] = {};
	for (const [kind, r] of Object.entries(results)) {
		if (r.code != null) fs.writeFileSync(path.join(outDir, `${name}.${kind}.js`), r.code);
		summary.modules[url][kind] = r.error ? { error: r.error } : analyze(r.code);
	}
}

fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

for (const [url, kinds] of Object.entries(summary.modules)) {
	console.log(`\n${url}`);
	for (const [kind, a] of Object.entries(kinds)) {
		if (a.error) {
			console.log(`  ${kind.padEnd(6)} ERROR ${a.error}`);
			continue;
		}
		const nonzero = Object.entries(a.counts)
			.filter(([, v]) => v)
			.map(([k, v]) => `${k}=${v}`)
			.join(' ');
		console.log(`  ${kind.padEnd(6)} ${String(a.lines).padStart(5)} lines  ${nonzero}`);
		console.log(`         imports: ${a.imports.join(', ')}`);
	}
}

await server.close();
process.exit(0);
