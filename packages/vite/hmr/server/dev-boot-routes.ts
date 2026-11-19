import type { Connect, ViteDevServer } from 'vite';
import { requestAppRestart } from './app-restart.js';
import { NS_DEV_BOOT_FAILED_PATH, NS_DEV_RESTART_PATH, NS_DEV_WARM_PATH } from './dev-routes.js';

/** How long {@link NS_DEV_WARM_PATH} holds a request before answering anyway. */
const WARM_WAIT_CAP_MS = 30_000;
const RECENT_ERROR_MS = 60_000;
/** How long after a restart for a failed boot a `full-reload` for the same edit is dropped. */
const STALE_RELOAD_MS = 5_000;

export interface DevBootRoutesOptions {
	/** Vite URLs whose static import graph the device loads before the app launches. */
	bootGraphUrls: () => string[];
	request?: (reason: string) => void;
}

/**
 * Transforms the boot graph once the server listens, so the first device
 * boot doesn't pay for cold transforms inside the iOS launch watchdog.
 * Resolves once the static-import crawl from `urls` is idle.
 */
export function warmBootGraph(server: Pick<ViteDevServer, 'environments' | 'httpServer' | 'config'>, urls: () => string[]): Promise<void> {
	return new Promise((resolve) => {
		const run = () => {
			const env = server.environments.client;
			const started = Date.now();
			Promise.resolve()
				.then(() => Promise.all(urls().map((url) => env.warmupRequest(url))))
				.then(() => env.waitForRequestsIdle())
				.then(
					() => server.config.logger.info(`[NativeScript] boot graph warmed up in ${Date.now() - started} ms`, { timestamp: true }),
					(error) => server.config.logger.warn(`[NativeScript] boot graph warm-up failed: ${error?.message ?? error}`),
				)
				.finally(resolve);
		};
		// Vite initializes the environments' plugin containers when it starts listening.
		const httpServer = server.httpServer;
		if (!httpServer || httpServer.listening) run();
		else httpServer.once('listening', run);
	});
}

function reasonOf(req: Connect.IncomingMessage, fallback: string): string {
	try {
		const reason = new URL(req.url || '', 'http://localhost').searchParams.get('reason');
		return reason ? reason.slice(0, 500) : fallback;
	} catch {
		return fallback;
	}
}

function sendJson(res: import('node:http').ServerResponse, body: unknown): void {
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(body));
}

/**
 * Routes the dev boot loader in `bundle.mjs` calls when the boot never
 * reached the app's own launch (it then owns `UIApplicationMain`, so only a
 * new process can boot the app), plus the warm-up gate the HMR build waits on
 * before the CLI launches the app.
 *
 * Returns the error middleware to install after Vite's transform middleware.
 */
export function registerDevBootRoutes(server: ViteDevServer, options: DevBootRoutesOptions): Connect.ErrorHandleFunction {
	const request = options.request ?? requestAppRestart;
	const warm = warmBootGraph(server, options.bootGraphUrls);
	// Only an error from the failed boot's own requests belongs on its screen.
	let lastServerError: { message: string; at: number } | undefined;
	let failedBoot: string | undefined;

	// With no device connected Vite keeps a `full-reload` for the next socket
	// connection, which would restart the app this edit's restart just booted.
	let dropReloadsUntil = 0;
	const ws = server.ws as unknown as { send: (...args: unknown[]) => void; clients?: Set<unknown> };
	const send = ws.send.bind(ws);
	ws.send = (...args: unknown[]) => {
		const payload = args[0] as { type?: string } | undefined;
		if (payload && typeof payload === 'object') {
			if (payload.type === 'full-reload' && Date.now() < dropReloadsUntil) return;
			// Kept by Vite for the next connection, it would show a stale error on an
			// app that booted fine since: with no socket open, the device met the
			// error in its own failed request, and the update gate re-checks missed
			// updates on connect.
			if (payload.type === 'error' && ws.clients && ws.clients.size === 0) return;
		}
		send(...args);
	};

	const onFileEvent = (file: string) => {
		if (failedBoot === undefined) return;
		failedBoot = undefined;
		dropReloadsUntil = Date.now() + STALE_RELOAD_MS;
		request(`${file} changed after the app failed to boot`);
	};
	server.watcher.on('change', onFileEvent);
	server.watcher.on('add', onFileEvent);

	server.middlewares.use((req, res, next) => {
		const pathname = (req.url || '').split('?', 1)[0];
		if (pathname === NS_DEV_RESTART_PATH) {
			request(reasonOf(req, 'the device requested a restart'));
			return sendJson(res, { ok: true });
		}
		if (pathname === NS_DEV_BOOT_FAILED_PATH) {
			failedBoot = reasonOf(req, 'unknown error');
			server.config.logger.error(`[NativeScript] the app failed to boot: ${failedBoot}. The next saved edit restarts it.`, { timestamp: true });
			const recent = lastServerError && Date.now() - lastServerError.at < RECENT_ERROR_MS ? lastServerError.message : undefined;
			return sendJson(res, { serverError: recent });
		}
		if (pathname === NS_DEV_WARM_PATH) {
			const started = Date.now();
			let timer: ReturnType<typeof setTimeout> | undefined;
			const capped = new Promise<boolean>((resolve) => {
				timer = setTimeout(() => resolve(false), WARM_WAIT_CAP_MS);
			});
			void Promise.race([warm.then(() => true), capped]).then((warmed) => {
				clearTimeout(timer);
				sendJson(res, { warm: warmed, waitedMs: Date.now() - started });
			});
			return;
		}
		next();
	});

	return (err, _req, _res, next) => {
		lastServerError = { message: err?.message ? String(err.message) : String(err), at: Date.now() };
		next(err);
	};
}
