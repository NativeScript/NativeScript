// Spike: serve an app's whole module graph from a `consumer: 'server'`
// environment through a thin, AST-free post-step, and compare it to `/ns/m`.
//
// Usage (from the repo root):
//   node tools/vite-server-env-spike/crawl.mjs [--app apps/toolbox] [--flavor typescript]
//     [--platform ios|android] [--entry /src/main.ts] [--no-nsm]
// Output: tools/vite-server-env-spike/out/crawl-<app>/{thin/,report.json}

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const spikeDir = import.meta.dirname;
const repoRoot = path.resolve(spikeDir, '../..');

const args = process.argv.slice(2);
const opt = (name, dflt) => {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : dflt;
};
const appRoot = path.resolve(repoRoot, opt('--app', 'apps/toolbox'));
const flavor = opt('--flavor', 'typescript');
const platform = opt('--platform', 'ios');
const appMain = JSON.parse(fs.readFileSync(path.join(appRoot, 'package.json'), 'utf8')).main || 'src/main.ts';
const entry = opt('--entry', `/${appMain.replace(/^\.?\//, '')}`);
const compareNsm = !args.includes('--no-nsm');
const outDir = path.join(spikeDir, 'out', `crawl-${path.basename(appRoot)}`);

process.chdir(appRoot);
process.argv.push('--', `--env.${platform}`, '--env.hmr');
process.env.NS_HMR_PORT ??= '5199';

const { createServer, mergeConfig } = await import('vite');
const { init, parse } = await import('es-module-lexer');
const flavorModule = await import(pathToFileURL(path.join(appRoot, `node_modules/@nativescript/vite/configuration/${flavor}.js`)).href);
const flavorConfig = flavorModule[`${flavor}Config`];

const ENV = 'nativescript';
const THIN_PREFIX = '/ns/e';

// Vite only treats an id as CSS when the `.css`/`lang.css` suffix ends it,
// so `inline` must go before a trailing `lang.*` param, never after it.
const CSS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)|[?&]lang\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)$/;
const INLINE_RE = /[?&]inline\b/;
function withInlineQuery(id) {
	const langParam = id.match(/[?&]lang\.[a-z]+$/);
	if (langParam) {
		const at = langParam.index + 1;
		return `${id.slice(0, at)}inline&${id.slice(at)}`;
	}
	return `${id}${id.includes('?') ? '&' : '?'}inline`;
}
const cssInlinePlugin = {
	name: 'ns-spike:css-inline',
	enforce: 'pre',
	applyToEnvironment: (env) => env.name === ENV,
	async resolveId(source, importer, options) {
		if (!CSS_RE.test(source) || INLINE_RE.test(source)) return;
		const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
		if (!resolved || resolved.external) return resolved;
		return { ...resolved, id: withInlineQuery(resolved.id) };
	},
};

const config = mergeConfig(await flavorConfig({ mode: 'development' }), {
	root: appRoot,
	plugins: [cssInlinePlugin],
	environments: {
		[ENV]: { consumer: 'server', dev: { moduleRunnerTransform: false } },
	},
});
const server = await createServer({ ...config, configFile: false });
await server.listen();
const origin = `http://localhost:${server.config.server.port}`;
await init;

/** `/@id/__x00__foo` → `\0foo`, `/@id/foo` → `foo`; what `transformRequest` expects for virtual modules. */
const unwrapViteId = (url) => (url.startsWith('/@id/') ? url.slice('/@id/'.length).replace(/^__x00__/, '\0') : url);

/** Vite URL → device URL. One rule: prefix, keep path, extension and query. */
const toDeviceUrl = (viteUrl) => `${THIN_PREFIX}${viteUrl}`;

/**
 * The whole post-step: rewrite root-relative specifiers to device URLs,
 * leave bare ones for the import map, hook `import.meta.hot` up, and
 * register inlined CSS. Offsets come from es-module-lexer; no AST, no regex
 * over code.
 */
function thinPostStep(viteUrl, code) {
	const [imports] = parse(code);
	const bare = new Set();
	const deps = new Set();
	let out = '';
	let last = 0;
	for (const imp of imports) {
		const spec = imp.n;
		if (spec == null || imp.d === -2) continue; // import.meta / non-literal dynamic import
		if (spec.startsWith('/') && !spec.startsWith('//')) {
			deps.add(spec);
			out += code.slice(last, imp.s) + toDeviceUrl(spec);
			last = imp.e;
			continue;
		}
		if (!/^[a-z][a-z0-9+.-]*:/i.test(spec) && !spec.startsWith('.')) bare.add(spec);
	}
	out += code.slice(last);

	const prelude = [];
	if (code.includes('import.meta.hot')) {
		prelude.push(`import.meta.hot = globalThis.__NS_HOT_REGISTRY__?.createHotContext(${JSON.stringify(viteUrl)});`);
	}
	if (INLINE_RE.test(viteUrl) && CSS_RE.test(viteUrl.replace(/[?&]inline\b/, ''))) {
		out = out.replace(/^export default /m, 'const __ns_css__ = ') + `\nglobalThis.__NS_REGISTER_CSS__?.(${JSON.stringify(viteUrl)}, __ns_css__);\nexport default __ns_css__;\n`;
	}
	return { code: prelude.length ? `${prelude.join('\n')}\n${out}` : out, deps, bare };
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, 'thin'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'nsm'), { recursive: true });

const env = server.environments[ENV];
const seen = new Set();
const queue = [entry];
const modules = [];
const errors = [];
const bareSpecifiers = new Map();
let thinBytes = 0;
let nsmBytes = 0;
const nsmErrors = [];
const started = Date.now();

while (queue.length) {
	const viteUrl = queue.shift();
	if (seen.has(viteUrl)) continue;
	seen.add(viteUrl);
	let result;
	try {
		result = await env.transformRequest(unwrapViteId(viteUrl));
	} catch (e) {
		errors.push({ url: viteUrl, error: String(e?.message || e).split('\n')[0] });
		continue;
	}
	if (!result) {
		errors.push({ url: viteUrl, error: 'no result' });
		continue;
	}
	const thin = thinPostStep(viteUrl, result.code);
	thinBytes += thin.code.length;
	modules.push({ url: viteUrl, bytes: thin.code.length, deps: thin.deps.size });
	fs.writeFileSync(path.join(outDir, 'thin', `${viteUrl.replace(/\W+/g, '_').slice(-180)}.js`), thin.code);
	for (const b of thin.bare) {
		if (!bareSpecifiers.has(b)) bareSpecifiers.set(b, []);
		bareSpecifiers.get(b).push(viteUrl);
	}
	for (const d of thin.deps) if (!seen.has(d)) queue.push(d);

	if (compareNsm && !viteUrl.includes('?')) {
		const nsmPath = viteUrl.startsWith('/@fs/') ? viteUrl.replace(/^\/@fs\/.*?\/(packages\/|node_modules\/)/, '/$1') : viteUrl;
		try {
			const res = await fetch(`${origin}/ns/m${nsmPath}`);
			const body = await res.text();
			if (res.ok) {
				nsmBytes += body.length;
				fs.writeFileSync(path.join(outDir, 'nsm', `${viteUrl.replace(/\W+/g, '_').slice(-180)}.js`), body);
			} else nsmErrors.push({ url: nsmPath, status: res.status });
		} catch (e) {
			nsmErrors.push({ url: nsmPath, error: String(e?.message || e) });
		}
	}
}

const report = {
	platform,
	entry,
	elapsedMs: Date.now() - started,
	modules: modules.length,
	errors,
	bareSpecifiers: Object.fromEntries([...bareSpecifiers].map(([k, v]) => [k, { importers: v.length, example: v[0] }])),
	thinBytes,
	...(compareNsm ? { nsmBytes, nsmComparedModules: modules.filter((m) => !m.url.includes('?')).length - nsmErrors.length, nsmErrors: nsmErrors.slice(0, 20) } : {}),
	largestModules: [...modules].sort((a, b) => b.bytes - a.bytes).slice(0, 5),
	queryModules: modules.filter((m) => m.url.includes('?')).map((m) => m.url),
};
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

console.log(JSON.stringify({ ...report, largestModules: undefined, queryModules: report.queryModules.slice(0, 10) }, null, 2));
await server.close();
process.exit(0);
