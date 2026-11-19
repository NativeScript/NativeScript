import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import { registerDevBootRoutes } from './dev-boot-routes.js';
import { NS_DEV_BOOT_FAILED_PATH, NS_DEV_RESTART_PATH, NS_DEV_WARM_PATH } from './dev-routes.js';

type Handler = (req: any, res: any, next: () => void) => unknown;

function fakeServer(env: { warmupRequest: (url: string) => Promise<void>; waitForRequestsIdle: () => Promise<void> }) {
	const handlers: Handler[] = [];
	const watcher = new EventEmitter();
	const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
	const sent: unknown[] = [];
	const server: any = { config: { logger }, environments: { client: env }, httpServer: null, watcher, ws: { clients: new Set(['device']), send: (payload: unknown) => sent.push(payload) }, middlewares: { use: (fn: Handler) => handlers.push(fn) } };
	return { server, handlers, watcher, logger, sent };
}

function call(handler: Handler, url: string): Promise<{ body?: any; nextCalled: boolean }> {
	return new Promise((resolve) => {
		const res = { setHeader: () => {}, end: (body: string) => resolve({ body: JSON.parse(body), nextCalled: false }) };
		void handler({ url }, res, () => resolve({ nextCalled: true }));
	});
}

const idleEnv = () => ({ warmupRequest: vi.fn(async () => {}), waitForRequestsIdle: vi.fn(async () => {}) });

describe('registerDevBootRoutes', () => {
	it('restarts the app on a device request, with its reason', async () => {
		const request = vi.fn();
		const { server, handlers } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request });
		expect((await call(handlers[0], `${NS_DEV_RESTART_PATH}?reason=back%20online`)).body).toEqual({ ok: true });
		expect(request).toHaveBeenCalledWith('back online');
	});

	it('after a failed boot, restarts the app on the next file change only', async () => {
		const request = vi.fn();
		const { server, handlers, watcher } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request });
		watcher.emit('change', '/app/src/before.ts');
		expect(request).not.toHaveBeenCalled();
		await call(handlers[0], `${NS_DEV_BOOT_FAILED_PATH}?reason=boom`);
		watcher.emit('change', '/app/src/main.ts');
		watcher.emit('change', '/app/src/again.ts');
		expect(request.mock.calls).toEqual([['/app/src/main.ts changed after the app failed to boot']]);
	});

	it("drops the edit's full-reload, which Vite would keep for the restarted app's first connection", async () => {
		const { server, handlers, watcher, sent } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request: vi.fn() });
		server.ws.send({ type: 'full-reload', path: '*' });
		await call(handlers[0], NS_DEV_BOOT_FAILED_PATH);
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
		expect((await call(handlers[0], NS_DEV_BOOT_FAILED_PATH)).body).toEqual({ serverError: 'main.ts:7:28: Property assignment expected.' });
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

	it('passes other requests on', async () => {
		const { server, handlers } = fakeServer(idleEnv());
		registerDevBootRoutes(server, { bootGraphUrls: () => [], request: vi.fn() });
		expect((await call(handlers[0], '/src/main.ts')).nextCalled).toBe(true);
	});
});
