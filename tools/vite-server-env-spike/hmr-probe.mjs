// Spike: boot an app's dev server via Vite's config loader, connect to /ns-hmr
// as the device's full HMR client does, apply file edits, and print every
// message the server sends after each edit.
//
// Usage (from the app dir):
//   node --preserve-symlinks <repo>/tools/vite-server-env-spike/hmr-probe.mjs <file> <from> <to> [<to2> ...]
// e.g. ... src/app/home/home.component.css 'color: red;' 'color: blue;' 'color: green;'

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const [file, ...values] = process.argv.slice(2);
process.argv.splice(2);
process.argv.push('--', '--env.ios', '--env.hmr');
process.env.NS_HMR_PORT = process.env.NS_HMR_PORT || '5197';
process.env.NS_VITE_THIN = process.env.NS_VITE_THIN ?? '1';

const req = createRequire(path.join(process.cwd(), 'package.json'));
const { createServer } = await import(req.resolve('vite'));
const configFile = ['vite.config.mts', 'vite.config.ts', 'vite.config.js'].find((f) => fs.existsSync(f));
const server = await createServer({ configFile, mode: 'development' });
await server.listen();
const port = server.config.server.port;

const original = fs.readFileSync(file, 'utf8');
const messages = [];
const ws = new WebSocket(`ws://localhost:${port}/ns-hmr?ns_hmr_role=full`);
ws.addEventListener('message', (event) => {
	let summary = String(event.data);
	try {
		const msg = JSON.parse(summary);
		summary = `${msg.type}${msg.event ? ':' + msg.event : ''} ${JSON.stringify(msg.data ?? msg.path ?? msg.updates ?? '').slice(0, 160)}`;
	} catch {}
	messages.push(summary);
});
await new Promise((resolve) => ws.addEventListener('open', resolve));
// Let the server's connect-time messages (full graph, etc.) arrive first.
await new Promise((r) => setTimeout(r, 1500));
messages.length = 0;

let current = original;
for (let i = 1; i < values.length; i++) {
	const next = current.replace(values[i - 1], values[i]);
	fs.writeFileSync(file, next);
	current = next;
	await new Promise((r) => setTimeout(r, 4000));
	console.log(`--- edit ${i}: ${values[i - 1]} -> ${values[i]}`);
	for (const m of messages.splice(0)) console.log('   ', m);
}

fs.writeFileSync(file, original);
ws.close();
await server.close();
process.exit(0);
