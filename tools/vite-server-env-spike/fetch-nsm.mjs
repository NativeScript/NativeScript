// Spike: boot an app's real flavor config (iOS, --env.hmr) on its own port and
// fetch the given /ns/m (or other device) URLs, printing a short summary.
//
// Usage (from the repo root):
//   node tools/vite-server-env-spike/fetch-nsm.mjs --app tools/vite-server-env-spike/apps/ng --flavor angular /ns/m/node_modules/rxjs/dist/esm/index.js

import path from 'node:path';
import { pathToFileURL } from 'node:url';

const spikeDir = import.meta.dirname;
const repoRoot = path.resolve(spikeDir, '../..');
const args = process.argv.slice(2);
const take = (name, dflt) => {
	const i = args.indexOf(name);
	return i >= 0 ? args.splice(i, 2)[1] : dflt;
};
const appRoot = path.resolve(repoRoot, take('--app', 'apps/toolbox'));
const flavor = take('--flavor', 'typescript');
const platform = take('--platform', 'ios');
const urls = args;

process.chdir(appRoot);
process.argv.push('--', `--env.${platform}`, '--env.hmr');
process.env.NS_HMR_PORT = process.env.NS_HMR_PORT || '5199';

const { createServer } = await import('vite');
const mod = await import(pathToFileURL(path.join(appRoot, `node_modules/@nativescript/vite/configuration/${flavor}.js`)).href);
const config = await mod[`${flavor}Config`]({ mode: 'development' });
const server = await createServer({ ...config, root: appRoot, configFile: false });
await server.listen();
const origin = `http://localhost:${server.config.server.port}`;
// `T:<url>` runs server.transformRequest(url) directly; `G:<url>` fetches it
// through the dev server's middleware stack; anything else is fetched too.
const grepRe = process.env.NS_SPIKE_GREP ? new RegExp(process.env.NS_SPIKE_GREP) : null;
for (const raw of urls) {
	// `R:<spec>|<importer>` resolves through the client environment's plugin
	// container and reports which plugin answered first.
	if (raw.startsWith('R:')) {
		const [spec, importer] = raw.slice(2).split('|');
		const env = server.environments.client;
		const r = await env.pluginContainer.resolveId(spec, importer);
		let answeredBy = null;
		for (const p of env.plugins) {
			const hook = typeof p.resolveId === 'function' ? p.resolveId : p.resolveId?.handler;
			if (!hook) continue;
			try {
				const out = await hook.call({ ...env.pluginContainer.minimalContext, environment: env, resolve: (s, i, o) => env.pluginContainer.resolveId(s, i, o) }, spec, importer, { isEntry: false, attributes: {} });
				if (out) {
					answeredBy = `${p.name} -> ${typeof out === 'string' ? out : out.id}`;
					break;
				}
			} catch {}
		}
		console.log(`resolveId ${spec} from ${importer}\n  => ${r?.id}\n  first plugin: ${answeredBy}`);
		continue;
	}
	if (raw.startsWith('T:')) {
		const u = raw.slice(2);
		const r = await server.transformRequest(u);
		const code = r?.code ?? '';
		console.log(`transformRequest ${u} (${code.length} bytes)${grepRe ? ' ' + JSON.stringify(code.match(grepRe)?.[0] ?? null) : ''}`);
		continue;
	}
	const u = raw.replace(/^G:/, '');
	const res = await fetch(origin + u);
	const body = await res.text();
	console.log(`${res.status} ${u} (${body.length} bytes)${grepRe ? ' ' + JSON.stringify(body.match(grepRe)?.[0] ?? null) : ''}`);
}
await server.close();
process.exit(0);
