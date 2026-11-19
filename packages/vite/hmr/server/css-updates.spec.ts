import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appCssRootRelPath, handleAppCssHotUpdate, nsCssUpdatesPlugin, sendConnectCssSync } from './css-updates.js';
import * as serverOriginModule from './server-origin.js';
import { setAppCssState, type AppCssState } from '../../helpers/app-css-state.js';
import { NS_CSS_UPDATES_EVENT } from '../shared/protocol.js';

const APP_CSS = '/proj/src/app.css';
const PARTIAL = '/proj/src/theme.css';
const TEMPLATE = '/proj/src/home.component.html';
const COMPONENT = '/proj/src/home.component.ts';

let originSpy: ReturnType<typeof vi.spyOn>;
let infoSpy: ReturnType<typeof vi.spyOn>;

type Node = { id: string | null; file: string; importers: Set<Node> };
const node = (file: string, id: string | null, importers: Node[] = []): Node => ({ id, file, importers: new Set(importers) });

function makeServer() {
	return { config: { root: '/proj', server: {} }, ws: { send: vi.fn(), on: vi.fn() } } as any;
}

function registerState(server: any, refreshResult = { changed: true, changedSinceStartup: true }): AppCssState {
	const state: AppCssState = {
		path: APP_CSS,
		deps: new Set([APP_CSS, PARTIAL, TEMPLATE]),
		refresh: vi.fn(async () => refreshResult),
	};
	setAppCssState(server, state);
	return state;
}

const update = (server: any, file: string, modules: Node[] = []) => handleAppCssHotUpdate({ type: 'update', file, modules: modules as any, server });

beforeEach(() => {
	originSpy = vi.spyOn(serverOriginModule, 'getServerOrigin').mockReturnValue('http://test:5173');
	infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
});
afterEach(() => {
	originSpy.mockRestore();
	infoSpy.mockRestore();
});

describe('handleAppCssHotUpdate', () => {
	it('sends ns:css-updates for an app.css edit and returns [] so Vite does not update it too', async () => {
		const server = makeServer();
		const state = registerState(server);
		const fetched = node(APP_CSS, `${APP_CSS}?direct`);

		await expect(update(server, APP_CSS, [fetched])).resolves.toEqual([]);

		expect(state.refresh).not.toHaveBeenCalled();
		expect(server.ws.send).toHaveBeenCalledOnce();
		const [event, data] = server.ws.send.mock.calls[0];
		expect(event).toBe(NS_CSS_UPDATES_EVENT);
		expect(data).toEqual({ origin: 'http://test:5173', updates: [{ type: 'css-update', path: '/src/app.css', acceptedPath: '/src/app.css', timestamp: expect.any(Number) }] });
	});

	it('returns [] for an app.css edit with no module in the graph', async () => {
		const server = makeServer();
		registerState(server);
		await expect(update(server, APP_CSS)).resolves.toEqual([]);
	});

	it('sends the app stylesheet for an @import partial without re-running the pipeline', async () => {
		const server = makeServer();
		const state = registerState(server);
		const appCss = node(APP_CSS, `${APP_CSS}?direct`);
		const partialEntry = node(PARTIAL, null, [appCss]);

		await expect(update(server, PARTIAL, [partialEntry])).resolves.toEqual([]);
		expect(state.refresh).not.toHaveBeenCalled();
		expect(server.ws.send.mock.calls[0][1].updates[0].path).toBe('/src/app.css');
	});

	it('sends for a content file whose edit changed the generated CSS, leaving its modules to Vite and the framework', async () => {
		const server = makeServer();
		const state = registerState(server, { changed: true, changedSinceStartup: true });
		const appCss = node(APP_CSS, `${APP_CSS}?direct`);
		const tailwindOnly = node(TEMPLATE, null, [appCss]);

		// An empty list would make Vite full-reload an `.html` edit.
		await expect(update(server, TEMPLATE, [tailwindOnly])).resolves.toBeUndefined();
		expect(state.refresh).toHaveBeenCalledOnce();
		expect(server.ws.send).toHaveBeenCalledOnce();
	});

	it('sends nothing and leaves the modules alone when the content edit did not change the CSS', async () => {
		const server = makeServer();
		registerState(server, { changed: false, changedSinceStartup: true });
		const own = node(TEMPLATE, TEMPLATE);

		await expect(update(server, TEMPLATE, [own])).resolves.toBeUndefined();
		expect(server.ws.send).not.toHaveBeenCalled();
	});

	it('ignores files outside the stylesheet dependency set, non-update events, and a missing state', async () => {
		const server = makeServer();
		const state = registerState(server);
		await expect(update(server, COMPONENT, [node(COMPONENT, COMPONENT)])).resolves.toBeUndefined();
		await expect(handleAppCssHotUpdate({ type: 'create', file: APP_CSS, modules: [], server })).resolves.toBeUndefined();
		await expect(update(makeServer(), APP_CSS)).resolves.toBeUndefined();
		expect(state.refresh).not.toHaveBeenCalled();
		expect(server.ws.send).not.toHaveBeenCalled();
	});

	it('skips a stylesheet outside the project root', async () => {
		const server = makeServer();
		setAppCssState(server, { path: '/elsewhere/app.css', deps: new Set(['/elsewhere/app.css']), refresh: vi.fn() as any });
		await expect(update(server, '/elsewhere/app.css')).resolves.toBeUndefined();
		expect(server.ws.send).not.toHaveBeenCalled();
	});
});

describe('appCssRootRelPath', () => {
	it('is root-relative with a leading slash, or null outside the root', () => {
		expect(appCssRootRelPath('/proj', '/proj/src/app.css')).toBe('/src/app.css');
		expect(appCssRootRelPath('/proj/', '/proj/app.css')).toBe('/app.css');
		expect(appCssRootRelPath('/proj', '/other/app.css')).toBeNull();
	});
});

describe('sendConnectCssSync', () => {
	const client = (readyState = 1) => ({ send: vi.fn(), socket: { readyState } });

	it('sends a connect-sync ns:css-updates to the connecting client when app.css drifted since startup', async () => {
		const server = makeServer();
		registerState(server, { changed: false, changedSinceStartup: true });
		const c = client();

		await expect(sendConnectCssSync(server, c)).resolves.toBe(true);
		expect(c.send).toHaveBeenCalledWith(NS_CSS_UPDATES_EVENT, { origin: 'http://test:5173', updates: [expect.objectContaining({ path: '/src/app.css' })], reason: 'connect-sync' });
		expect(server.ws.send).not.toHaveBeenCalled();
	});

	it('sends nothing without drift, to a socket closed during the compile, or without state', async () => {
		const server = makeServer();
		registerState(server, { changed: false, changedSinceStartup: false });
		const c = client();
		await expect(sendConnectCssSync(server, c)).resolves.toBe(false);

		const drifted = makeServer();
		registerState(drifted, { changed: false, changedSinceStartup: true });
		const closed = client(3);
		await expect(sendConnectCssSync(drifted, closed)).resolves.toBe(false);

		await expect(sendConnectCssSync(makeServer(), c)).resolves.toBe(false);
		expect(c.send).not.toHaveBeenCalled();
		expect(closed.send).not.toHaveBeenCalled();
	});
});

describe('nsCssUpdatesPlugin', () => {
	it("syncs on Vite's vite:client:connect", async () => {
		const server = makeServer();
		registerState(server, { changed: false, changedSinceStartup: true });
		const plugin = nsCssUpdatesPlugin({});
		(plugin.configureServer as (s: unknown) => void)(server);

		expect(server.ws.on).toHaveBeenCalledWith('vite:client:connect', expect.any(Function));
		const listener = server.ws.on.mock.calls[0][1];
		const c = { send: vi.fn(), socket: { readyState: 1 } };
		listener(undefined, c);
		await vi.waitFor(() => expect(c.send).toHaveBeenCalledWith(NS_CSS_UPDATES_EVENT, expect.objectContaining({ reason: 'connect-sync' })));
	});

	it('handles hot updates for the client environment only', async () => {
		const server = makeServer();
		registerState(server);
		const hook = nsCssUpdatesPlugin({}).hotUpdate as (this: unknown, options: unknown) => Promise<unknown>;
		const options = { type: 'update', file: APP_CSS, modules: [], server };

		await expect(hook.call({ environment: { name: 'ssr' } }, options)).resolves.toBeUndefined();
		expect(server.ws.send).not.toHaveBeenCalled();
		await expect(hook.call({ environment: { name: 'client' } }, options)).resolves.toEqual([]);
		expect(server.ws.send).toHaveBeenCalledOnce();
	});
});
