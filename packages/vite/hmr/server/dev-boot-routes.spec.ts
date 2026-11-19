import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import { registerDevBootRoutes } from './dev-boot-routes.js';
import { NS_DEV_BOOT_FAILED_PATH, NS_DEV_RESTART_PATH, NS_DEV_WARM_PATH } from './dev-routes.js';

type Handler = (req: any, res: any, next: () => void) => unknown;

const TOKEN = 'tok+en';
const T = `token=${encodeURIComponent(TOKEN)}`;

function fakeServer(env: { warmupRequest: (url: string) => Promise<void>; waitForRequestsIdle: () => Promise<void> }) {
	const handlers: Handler[] = [];
	const watcher = new EventEmitter();
	const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
	const sent: unknown[] = [];
	const server: any = { config: { logger, webSocketToken: TOKEN }, environments: { client: env }, httpServer: null, watcher, ws: { clients: new Set(['device']), send: (payload: unknown) => sent.push(payload) }, middlewares: { use: (fn: Handler) => handlers.push(fn) } };
	return { server, handlers, watcher, logger, sent };
}

function call(handler: Handler, url: string): Promise<{ body?: any; status?: number; nextCalled: boolean }> {
	return new Promise((resolve) => {
		const res: any = { statusCode: 200, setHeader: () => {}, end: (body: string) => resolve({ body: JSON.parse(body), status: res.statusCode, nextCalled: false }) };
		void handler({ url }, res, () => resolve({ nextCalled: true }));
	});
}

const idleEnv = () => ({ warmupRequest: vi.fn(async () => {}), waitForRequestsIdle: vi.fn(async () => {}) });

describe('registerDevBootRoutes', () => {
	it('restarts the app on a device request, with its reason', async () => {
		const request = vi.fn();
		const { server, handlers } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request, cliLaunchesApp: () => false });
		expect((await call(handlers[0], `${NS_DEV_RESTART_PATH}?${T}&reason=back%20online`)).body).toEqual({ ok: true });
		expect(request).toHaveBeenCalledWith('back online');
	});

	it("leaves a process older than the server to the CLI's own launch, and restarts younger ones", async () => {
		const request = vi.fn();
		let clock = 1_000;
		const httpServer = Object.assign(new EventEmitter(), { listening: false });
		const { server, handlers } = fakeServer(idleEnv());
		server.httpServer = httpServer;
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request, cliLaunchesApp: () => true, now: () => clock });
		clock = 5_000;
		httpServer.emit('listening');
		clock = 8_000;

		const older = await call(handlers[0], `${NS_DEV_RESTART_PATH}?${T}&reason=back&age=3001`);
		expect(older.status).toBe(409);
		expect(request).not.toHaveBeenCalled();

		expect((await call(handlers[0], `${NS_DEV_RESTART_PATH}?${T}&reason=younger&age=2999`)).status).toBe(200);
		expect((await call(handlers[0], `${NS_DEV_RESTART_PATH}?${T}&reason=no%20age`)).status).toBe(200);
		expect(request.mock.calls).toEqual([['younger'], ['no age']]);
	});

	it('restarts an older process when the CLI does not launch the app after this server start', async () => {
		const request = vi.fn();
		const { server, handlers } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request, cliLaunchesApp: () => false, now: () => 0 });
		expect((await call(handlers[0], `${NS_DEV_RESTART_PATH}?${T}&reason=back&age=60000`)).status).toBe(200);
		expect(request).toHaveBeenCalledWith('back');
	});

	it('after a failed boot, restarts the app on the next file change only', async () => {
		const request = vi.fn();
		const { server, handlers, watcher } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request });
		watcher.emit('change', '/app/src/before.ts');
		expect(request).not.toHaveBeenCalled();
		await call(handlers[0], `${NS_DEV_BOOT_FAILED_PATH}?${T}&reason=boom`);
		watcher.emit('change', '/app/src/main.ts');
		watcher.emit('change', '/app/src/again.ts');
		expect(request.mock.calls).toEqual([['/app/src/main.ts changed after the app failed to boot']]);
	});

	it("drops the edit's full-reload, which Vite would keep for the restarted app's first connection", async () => {
		const { server, handlers, watcher, sent } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request: vi.fn() });
		server.ws.send({ type: 'full-reload', path: '*' });
		await call(handlers[0], `${NS_DEV_BOOT_FAILED_PATH}?${T}`);
		watcher.emit('change', '/app/src/main.ts');
		server.ws.send({ type: 'full-reload', path: '/src/main.ts' });
		server.ws.send({ type: 'update', updates: [] });
		expect(sent).toEqual([
			{ type: 'full-reload', path: '*' },
			{ type: 'update', updates: [] },
		]);
	});

	it('drops error payloads while no device is connected, which Vite would replay to the next connection', () => {
		const { server, sent } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request: vi.fn() });
		server.ws.send({ type: 'error', err: { message: 'connected' } });
		server.ws.clients.clear();
		server.ws.send({ type: 'error', err: { message: 'nobody listening' } });
		expect(sent).toEqual([{ type: 'error', err: { message: 'connected' } }]);
	});

	it("answers a failed boot with the server's recent transform error", async () => {
		const { server, handlers } = fakeServer(idleEnv());
		const onError = registerDevBootRoutes(server, { bootGraphUrls: () => [], request: vi.fn() });
		const forwarded = vi.fn();
		onError(new Error('main.ts:7:28: Property assignment expected.'), {} as any, {} as any, forwarded);
		expect(forwarded).toHaveBeenCalledOnce();
		expect((await call(handlers[0], `${NS_DEV_BOOT_FAILED_PATH}?${T}`)).body).toEqual({ serverError: 'main.ts:7:28: Property assignment expected.' });
	});

	it('warms the boot graph and holds the warm route until its crawl is idle', async () => {
		let idle!: () => void;
		const env = { warmupRequest: vi.fn(async () => {}), waitForRequestsIdle: vi.fn(() => new Promise<void>((resolve) => (idle = resolve))) };
		const { server, handlers } = fakeServer(env);
		registerDevBootRoutes(server, { bootGraphUrls: () => ['/@id/__x00__virtual:ns-dev-boot', '/src/main.ts'], request: vi.fn() });
		const answer = call(handlers[0], NS_DEV_WARM_PATH);
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(env.warmupRequest.mock.calls.map((c) => c[0])).toEqual(['/@id/__x00__virtual:ns-dev-boot', '/src/main.ts']);
		let answered = false;
		void answer.then(() => (answered = true));
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(answered).toBe(false);
		idle();
		expect((await answer).body).toMatchObject({ warm: true });
	});

	it("rejects the action routes without this server's token, and warns once per route", async () => {
		const request = vi.fn();
		const { server, handlers, logger, watcher } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request, cliLaunchesApp: () => false });
		expect((await call(handlers[0], `${NS_DEV_RESTART_PATH}?reason=x`)).status).toBe(403);
		expect((await call(handlers[0], `${NS_DEV_RESTART_PATH}?reason=x&token=wrong`)).status).toBe(403);
		expect((await call(handlers[0], `${NS_DEV_BOOT_FAILED_PATH}?reason=x&token=tok%2Ben%2B`)).status).toBe(403);
		watcher.emit('change', '/app/src/main.ts');
		expect(request).not.toHaveBeenCalled();
		expect(logger.warn).toHaveBeenCalledTimes(2);
		expect((await call(handlers[0], NS_DEV_WARM_PATH)).status).toBe(200);
	});

	it('under legacy.skipWebSocketTokenCheck, takes requests without a token and still leaves an older process to the CLI', async () => {
		const request = vi.fn();
		const { server, handlers } = fakeServer(idleEnv());
		server.config.legacy = { skipWebSocketTokenCheck: true };
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request, cliLaunchesApp: () => true, now: () => 10_000 });
		expect((await call(handlers[0], `${NS_DEV_RESTART_PATH}?reason=old&age=20000`)).status).toBe(409);
		expect((await call(handlers[0], `${NS_DEV_RESTART_PATH}?reason=young&age=0`)).status).toBe(200);
		expect(request.mock.calls).toEqual([['young']]);
	});

	it('passes other requests on', async () => {
		const { server, handlers } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request: vi.fn() });
		expect((await call(handlers[0], '/src/main.ts')).nextCalled).toBe(true);
	});
});
