import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { maybeSendConnectCssSync } from './css-connect-sync.js';
import * as serverOriginModule from './server-origin.js';
import { setAppCssState, type AppCssState } from '../../helpers/app-css-state.js';

let originSpy: ReturnType<typeof vi.spyOn>;
let infoSpy: ReturnType<typeof vi.spyOn>;

function makeServer(root = '/proj'): any {
	return { config: { root, server: {} } };
}

function makeSocket(readyState = 1) {
	return { readyState, OPEN: 1, send: vi.fn() };
}

function registerState(server: any, overrides: Partial<AppCssState> = {}): AppCssState {
	const state: AppCssState = {
		path: '/proj/src/app.css',
		deps: new Set(['/proj/src/app.css']),
		refresh: vi.fn(async () => ({ changed: false, changedSinceStartup: true })),
		...overrides,
	};
	setAppCssState(server, state);
	return state;
}

describe('maybeSendConnectCssSync', () => {
	beforeEach(() => {
		originSpy = vi.spyOn(serverOriginModule, 'getServerOrigin').mockReturnValue('http://test:5173');
		infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
	});
	afterEach(() => {
		originSpy.mockRestore();
		infoSpy.mockRestore();
	});

	it('pushes a connect-sync ns:css-updates message when app.css drifted since startup', async () => {
		const server = makeServer();
		registerState(server);
		const ws = makeSocket();

		expect(await maybeSendConnectCssSync(server, ws)).toBe(true);

		expect(ws.send).toHaveBeenCalledTimes(1);
		const msg = JSON.parse(String(ws.send.mock.calls[0][0]));
		expect(msg).toMatchObject({
			type: 'ns:css-updates',
			origin: 'http://test:5173',
			reason: 'connect-sync',
		});
		expect(msg.updates).toHaveLength(1);
		expect(msg.updates[0]).toMatchObject({ type: 'css-update', path: '/src/app.css', acceptedPath: '/src/app.css' });
	});

	it('sends nothing when the stylesheet has not drifted', async () => {
		const server = makeServer();
		registerState(server, { refresh: vi.fn(async () => ({ changed: false, changedSinceStartup: false })) });
		const ws = makeSocket();

		expect(await maybeSendConnectCssSync(server, ws)).toBe(false);
		expect(ws.send).not.toHaveBeenCalled();
	});

	it('sends nothing when no app-css state is registered', async () => {
		const ws = makeSocket();
		expect(await maybeSendConnectCssSync(makeServer(), ws)).toBe(false);
		expect(ws.send).not.toHaveBeenCalled();
	});

	it('skips sockets that are no longer open (checked after the drift compile)', async () => {
		const server = makeServer();
		registerState(server);
		const ws = makeSocket(3);

		expect(await maybeSendConnectCssSync(server, ws)).toBe(false);
		expect(ws.send).not.toHaveBeenCalled();
	});

	it('skips an app.css path outside the project root without running the drift check', async () => {
		const server = makeServer('/proj');
		const refresh = vi.fn(async () => ({ changed: false, changedSinceStartup: true }));
		registerState(server, { path: '/elsewhere/app.css', refresh });
		const ws = makeSocket();

		expect(await maybeSendConnectCssSync(server, ws)).toBe(false);
		expect(refresh).not.toHaveBeenCalled();
		expect(ws.send).not.toHaveBeenCalled();
	});

	it('returns false when send throws', async () => {
		const server = makeServer();
		registerState(server);
		const ws = {
			readyState: 1,
			OPEN: 1,
			send: vi.fn(() => {
				throw new Error('socket write failed');
			}),
		};

		expect(await maybeSendConnectCssSync(server, ws)).toBe(false);
	});
});
