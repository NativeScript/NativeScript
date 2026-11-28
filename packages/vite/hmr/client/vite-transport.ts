/**
 * Port of Vite's WebSocket module-runner transport
 * (`createWebSocketModuleRunnerTransport` + `normalizeModuleRunnerTransport`)
 * and `waitForSuccessfulPing`, for the device's WebSocket polyfill.
 */
import { SendBeforeConnectError, type HMRTransport } from './hmr-client.js';

export interface WebSocketLike {
	readonly readyState: number;
	readonly OPEN: number;
	send(data: string): void;
	close(code?: number, reason?: string): void;
	addEventListener(type: string, listener: (event: any) => void, options?: { once?: boolean }): void;
	removeEventListener(type: string, listener: (event: any) => void): void;
}

export type WebSocketFactory = (url: string, protocol: string) => WebSocketLike;

export interface TransportHandlers {
	onMessage(payload: any): void;
	onDisconnection(): void;
}

export interface ViteSocketTransport extends HMRTransport {
	/** Resolves once the socket is open; rejects when it closes before opening. */
	connect(handlers: TransportHandlers): Promise<void>;
	disconnect(): void;
	readonly connected: boolean;
}

export const VITE_PING_WS_PROTOCOL = 'vite-ping';

export function createViteSocketTransport(options: { url: string; protocol: string; createSocket: WebSocketFactory; pingInterval?: number }): ViteSocketTransport {
	const pingInterval = options.pingInterval ?? 30_000;
	let ws: WebSocketLike | undefined;
	let pingIntervalId: ReturnType<typeof setInterval> | undefined;
	let isConnected = false;
	let connectingPromise: Promise<void> | undefined;

	const open = async ({ onMessage, onDisconnection }: TransportHandlers): Promise<void> => {
		const socket = options.createSocket(options.url, options.protocol);
		socket.addEventListener('message', ({ data }) => {
			let payload: unknown;
			try {
				payload = JSON.parse(data);
			} catch {
				return;
			}
			onMessage(payload);
		});
		let isOpened = socket.readyState === socket.OPEN;
		if (!isOpened) {
			await new Promise<void>((resolve, reject) => {
				socket.addEventListener(
					'open',
					() => {
						isOpened = true;
						resolve();
					},
					{ once: true },
				);
				socket.addEventListener('close', () => {
					if (!isOpened) {
						reject(new Error('WebSocket closed without opened.'));
						return;
					}
					clearInterval(pingIntervalId);
					onMessage({ type: 'custom', event: 'vite:ws:disconnect', data: { webSocket: socket } });
					onDisconnection();
				});
			});
		}
		onMessage({ type: 'custom', event: 'vite:ws:connect', data: { webSocket: socket } });
		ws = socket;
		pingIntervalId = setInterval(() => {
			if (socket.readyState === socket.OPEN) {
				socket.send(JSON.stringify({ type: 'ping' }));
			}
		}, pingInterval);
	};

	return {
		get connected() {
			return isConnected;
		},
		async connect(handlers) {
			if (isConnected) return;
			if (connectingPromise) {
				await connectingPromise;
				return;
			}
			connectingPromise = open({
				onMessage: handlers.onMessage,
				onDisconnection() {
					isConnected = false;
					handlers.onDisconnection();
				},
			});
			try {
				await connectingPromise;
				isConnected = true;
			} finally {
				connectingPromise = undefined;
			}
		},
		disconnect() {
			clearInterval(pingIntervalId);
			isConnected = false;
			ws?.close();
		},
		async send(data) {
			if (!isConnected) {
				if (connectingPromise) await connectingPromise;
				else throw new SendBeforeConnectError('send was called before connect');
			}
			ws!.send(JSON.stringify(data));
		},
	};
}

/**
 * Resolves once a `vite-ping` handshake to `socketUrl` succeeds, retrying
 * every `ms`. Vite's server closes a ping socket right after the upgrade.
 */
export async function waitForSuccessfulPing(socketUrl: string, createSocket: WebSocketFactory, ms = 1000): Promise<void> {
	const wait = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));
	const ping = (): Promise<boolean> => {
		try {
			const socket = createSocket(socketUrl, VITE_PING_WS_PROTOCOL);
			return new Promise((resolve) => {
				const onOpen = () => {
					resolve(true);
					close();
				};
				const onError = () => {
					resolve(false);
					close();
				};
				const close = () => {
					socket.removeEventListener('open', onOpen);
					socket.removeEventListener('error', onError);
					socket.close();
				};
				socket.addEventListener('open', onOpen);
				socket.addEventListener('error', onError);
			});
		} catch {
			return Promise.resolve(false);
		}
	};
	if (await ping()) return;
	await wait(ms);
	while (!(await ping())) {
		await wait(ms);
	}
}
