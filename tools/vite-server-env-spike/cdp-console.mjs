// Spike: record console output and uncaught exceptions from a NativeScript app
// through the CLI's debug proxy (`ns debug ios --start`), which speaks the
// Chrome DevTools Protocol.
//
// Usage: node tools/vite-server-env-spike/cdp-console.mjs [ws://[::1]:41000] [seconds] [--expr-file <file.js>]

const args = process.argv.slice(2);
const exprIdx = args.indexOf('--expr-file');
const evalExpr = exprIdx >= 0 ? (await import('node:fs')).readFileSync(args.splice(exprIdx, 2)[1], 'utf8') : null;
const url = args[0] || 'ws://[::1]:41000';
const seconds = Number(args[1] || 60);

const ws = new WebSocket(url);
let id = 0;
const send = (method, params = {}) => ws.send(JSON.stringify({ id: ++id, method, params }));
const stamp = () => new Date().toISOString().slice(11, 23);
const fmt = (arg) => (arg.value !== undefined ? (typeof arg.value === 'string' ? arg.value : JSON.stringify(arg.value)) : arg.description || arg.type);

ws.addEventListener('open', () => {
	send('Runtime.enable');
	send('Console.enable');
	if (evalExpr) send('Runtime.evaluate', { expression: evalExpr, returnByValue: true, awaitPromise: true });
	console.log(`${stamp()} connected ${url}`);
});
ws.addEventListener('message', (event) => {
	const msg = JSON.parse(String(event.data));
	if (msg.method === 'Runtime.consoleAPICalled') {
		console.log(`${stamp()} [${msg.params.type}] ${msg.params.args.map(fmt).join(' ').slice(0, 400)}`);
	} else if (msg.method === 'Console.messageAdded') {
		console.log(`${stamp()} [console] ${String(msg.params.message.text).slice(0, 400)}`);
	} else if (msg.method === 'Runtime.exceptionThrown') {
		const d = msg.params.exceptionDetails;
		console.log(`${stamp()} [EXCEPTION] ${(d.exception && d.exception.description) || d.text}`.slice(0, 800));
	} else if (msg.id && msg.result && msg.result.result && evalExpr) {
		console.log(`${stamp()} [eval] ${JSON.stringify(msg.result.result.value ?? msg.result.result.description).slice(0, 800)}`);
	}
});
ws.addEventListener('error', (e) => console.log(`${stamp()} ws error ${e.message || e}`));
setTimeout(() => {
	ws.close();
	process.exit(0);
}, seconds * 1000);
