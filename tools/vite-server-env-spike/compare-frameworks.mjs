// Spike: does framework plugin output survive a `consumer: 'server'`
// environment? Vite passes `ssr: true` to plugin hooks for server consumers,
// and plugin-vue / vite-plugin-solid switch to SSR codegen on that flag.
//
// Usage (from the repo root): node tools/vite-server-env-spike/compare-frameworks.mjs

import fs from 'node:fs';
import path from 'node:path';

const spikeDir = import.meta.dirname;
const fixtures = path.join(spikeDir, 'fixtures');
const outDir = path.join(spikeDir, 'out', 'frameworks');

const { createServer } = await import('vite');
const vue = (await import('@vitejs/plugin-vue')).default;
const solid = (await import('vite-plugin-solid')).default;

const SIGNALS = {
	vueSsrRender: /ssrRender|_push\(|ssrInterpolate|serverPrefetch/g,
	vueRender: /function _sfc_render|_createElementBlock|_createElementVNode|_createVNode/g,
	vueHmr: /__VUE_HMR_RUNTIME__/g,
	solidSsr: /ssrElement|ssrHydrationKey|escape\(|\bssr\(/g,
	solidUniversal: /createElement\(|insertNode|setProp|effect\(/g,
	solidDom: /template\(|delegateEvents|insert\(/g,
	solidRefresh: /solid-refresh|\$\$component|\$\$registry/g,
	viteClient: /\/@vite\/client/g,
	importMetaHot: /import\.meta\.hot/g,
};

function signals(code) {
	return Object.fromEntries(
		Object.entries(SIGNALS)
			.map(([k, re]) => [k, (code.match(re) || []).length])
			.filter(([, v]) => v),
	);
}

async function run(label, plugins, environments, urls) {
	const server = await createServer({
		configFile: false,
		root: fixtures,
		logLevel: 'error',
		server: { middlewareMode: true, hmr: { port: 24699 } },
		appType: 'custom',
		optimizeDeps: { noDiscovery: true, include: [] },
		plugins,
		environments,
	});
	const results = {};
	for (const url of urls) {
		for (const env of Object.keys(server.environments)) {
			const key = `${label}:${env}:${url}`;
			try {
				const r = await server.environments[env].transformRequest(url);
				const code = r?.code ?? '';
				fs.writeFileSync(path.join(outDir, `${label}.${env}.${url.replace(/\W+/g, '_')}.js`), code);
				results[key] = signals(code);
			} catch (e) {
				results[key] = { error: String(e?.message || e).split('\n')[0] };
			}
		}
	}
	await server.close();
	return results;
}

// Run a framework plugin with client codegen inside the given environments
// while Vite itself still treats them as server consumers (externals, no
// /@vite/client injection).
function withClientCodegen(plugins, envNames) {
	const wrapHook = (hook, argIndex) => {
		if (!hook) return hook;
		const handler = typeof hook === 'function' ? hook : hook.handler;
		const wrapped = function (...args) {
			if (envNames.includes(this.environment?.name)) {
				args[argIndex] = { ...(args[argIndex] || {}), ssr: false };
			}
			return handler.apply(this, args);
		};
		return typeof hook === 'function' ? wrapped : { ...hook, handler: wrapped };
	};
	return [plugins].flat().map((p) => ({
		...p,
		resolveId: wrapHook(p.resolveId, 2),
		load: wrapHook(p.load, 1),
		transform: wrapHook(p.transform, 2),
	}));
}

// Non-client environments drop CSS content; `?inline` CSS still exports the
// processed text, so resolve every CSS request in `nativescript` with it.
const CSS_LANG_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)|[?&]lang\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)\b/;
const INLINE_RE = /[?&]inline\b/;
const nsCssInline = {
	name: 'ns-spike:css-inline',
	enforce: 'pre',
	applyToEnvironment: (env) => env.name === 'nativescript',
	async resolveId(source, importer, opts) {
		if (!CSS_LANG_RE.test(source) || INLINE_RE.test(source)) return;
		const resolved = await this.resolve(source, importer, { ...opts, skipSelf: true });
		if (!resolved || resolved.external) return resolved;
		return { ...resolved, id: withInlineQuery(resolved.id) };
	},
};

// Vite only treats an id as CSS when the `.css`/`lang.css` suffix ends it,
// so `inline` must go before a trailing `lang.*` param, never after it.
function withInlineQuery(id) {
	const langParam = id.match(/[?&]lang\.[a-z]+$/);
	if (langParam) {
		const at = langParam.index + 1;
		return `${id.slice(0, at)}inline&${id.slice(at)}`;
	}
	return `${id}${id.includes('?') ? '&' : '?'}inline`;
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const serverEnv = { consumer: 'server', dev: { moduleRunnerTransform: false } };
const all = {
	...(await run('vue', [vue({ template: { compilerOptions: { isCustomElement: () => false } } })], { nativescript: serverEnv }, ['/App.vue'])),
	...(await run('vue-wrapped', withClientCodegen(vue({ template: { compilerOptions: { isCustomElement: () => false } } }), ['nativescript']), { nativescript: serverEnv }, ['/App.vue', '/App.vue?vue&type=style&index=0&scoped=7a7a37b1&lang.css'])),
	...(await run('vue-css', [nsCssInline, ...withClientCodegen(vue({ template: { compilerOptions: { isCustomElement: () => false } } }), ['nativescript'])], { nativescript: serverEnv }, ['/App.vue', '/App.vue?vue&type=style&index=0&scoped=f13b4d11&inline&lang.css'])),
	...(await run('solid-universal', [solid({ ssr: false, hot: true, solid: { generate: 'universal', moduleName: 'solid-js/universal' } })], { nativescript: serverEnv }, ['/Counter.tsx'])),
};

for (const [k, v] of Object.entries(all)) console.log(k.padEnd(40), JSON.stringify(v));
process.exit(0);
