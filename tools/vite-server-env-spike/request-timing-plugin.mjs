// Measurement-only Vite plugin for the spike fixtures (phase 5c).
// NS_SPIKE_REQUEST_LOG=<file> appends one tab-separated line per request:
// start ms, end ms, requests in flight at start, status, bytes, url, remote address.
// NS_SPIKE_REQUEST_DELAY_MS=<n> holds every request for n ms before any other
// middleware sees it (serial vs concurrent fetch discriminator).
import fs from 'node:fs';

export function requestTimingPlugin(env = process.env) {
	const logFile = env.NS_SPIKE_REQUEST_LOG || '';
	const delayMs = Number(env.NS_SPIKE_REQUEST_DELAY_MS || 0) || 0;
	if (!logFile && !delayMs) return [];
	let inFlight = 0;
	const middleware = (req, res, next) => {
		const start = Date.now();
		const url = req.url || '';
		inFlight += 1;
		const atStart = inFlight;
		let bytes = 0;
		const write = res.write.bind(res);
		const end = res.end.bind(res);
		res.write = (chunk, ...rest) => {
			if (chunk) bytes += typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length;
			return write(chunk, ...rest);
		};
		res.end = (chunk, ...rest) => {
			if (chunk && typeof chunk !== 'function') bytes += typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length;
			return end(chunk, ...rest);
		};
		res.on('close', () => {
			inFlight -= 1;
			if (logFile) fs.appendFileSync(logFile, `${start}\t${Date.now()}\t${atStart}\t${res.statusCode}\t${bytes}\t${url}\t${req.socket?.remoteAddress ?? ''}\n`);
		});
		if (delayMs) setTimeout(next, delayMs);
		else next();
	};
	return [
		{
			name: 'spike-request-timing',
			apply: 'serve',
			// Runs after the other plugins' configureServer, so the unshift lands first.
			enforce: 'post',
			configureServer(server) {
				server.middlewares.stack.unshift({ route: '', handle: middleware });
			},
		},
	];
}
