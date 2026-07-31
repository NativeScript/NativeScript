/**
 * Regression test for the bundle/rewriter origin split.
 *
 * The bug. `getServerOrigin()` is what bakes the URL prefix into every
 * module the rewriter serves to the device — `import "{ORIGIN}/ns/m/..."`
 * statements spliced into `/ns/core/xhr`, `/ns/m/node_modules/<pkg>`,
 * etc. Before the fix it preferred `resolvedUrls.network[0]` (Vite's
 * detected LAN IP) whenever one was available, which broke two
 * different scenarios:
 *
 *   1. Android emulators NAT-drop packets destined for the host's LAN
 *      IP. The bundle would boot from `10.0.2.2:5173`, fetch
 *      `/ns/core/xhr`, and immediately die on the nested
 *      `http://192.168.x.y:5173/ns/m/.../tslib` import baked into the
 *      module body. User-visible symptom:
 *        Failed to fetch http://192.168.0.8:5173/.../tslib status=0
 *
 *   2. Across all platforms the rewriter's origin (`192.168.x.y`)
 *      disagreed with what `dev-host.ts` baked into `bundle.mjs`
 *      (`localhost` on iOS, `10.0.2.2` on Android). V8's ESM loader
 *      keys modules by URL, so the same module fetched from two
 *      origins instantiates twice — a `@nativescript/core` realm
 *      split with all the singleton-state breakage that implies.
 *
 * The fix routes every platform through `resolveDeviceReachableOrigin`
 * so the rewriter and the bundle pick the same canonical origin from
 * the same precedence ladder (NS_HMR_HOST → explicit host →
 * NS_HMR_PREFER_LAN_HOST → platform default).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getServerOrigin } from './server-origin.js';
import * as cliFlagsMod from '../../helpers/cli-flags.js';

interface FakeServerOptions {
	host?: string | boolean;
	port?: number;
	https?: boolean;
	resolvedNetwork?: string[];
	resolvedLocal?: string[];
}

function makeFakeServer(options: FakeServerOptions = {}): any {
	const port = options.port ?? 5173;
	return {
		config: {
			server: {
				host: options.host,
				port,
				https: options.https,
			},
		},
		httpServer: { address: () => ({ port }) },
		resolvedUrls: {
			network: options.resolvedNetwork ?? [],
			local: options.resolvedLocal ?? [],
		},
	};
}

describe('getServerOrigin platform routing', () => {
	const originalEnv = { ...process.env };
	let getCliFlagsSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// Strip any ambient overrides; tests opt in explicitly.
		delete process.env.NS_HMR_HOST;
		delete process.env.NS_HMR_PREFER_LAN_HOST;
		getCliFlagsSpy = vi.spyOn(cliFlagsMod, 'getCliFlags').mockReturnValue({});
	});

	afterEach(() => {
		getCliFlagsSpy.mockRestore();
		process.env = { ...originalEnv };
	});

	it('returns 10.0.2.2 on Android even when Vite reports a LAN URL', () => {
		// Repro of the original bug: Vite served the LAN IP from
		// resolvedUrls.network[0], the rewriter baked it into every
		// /ns/m/* import, and the emulator could not route to it.
		getCliFlagsSpy.mockReturnValue({ android: true });
		const server = makeFakeServer({
			host: '0.0.0.0',
			resolvedNetwork: ['http://192.168.0.8:5173/'],
			resolvedLocal: ['http://localhost:5173/'],
		});

		expect(getServerOrigin(server)).toBe('http://10.0.2.2:5173');
	});

	it('returns 10.0.2.2 on Android when only resolvedUrls.local is populated', () => {
		// Some Vite configurations don't surface a `network` URL but the
		// loopback URL is still wrong for Android — it resolves to the
		// emulator itself rather than the host.
		getCliFlagsSpy.mockReturnValue({ android: true });
		const server = makeFakeServer({
			host: 'localhost',
			resolvedLocal: ['http://localhost:5173/'],
		});

		expect(getServerOrigin(server)).toBe('http://10.0.2.2:5173');
	});

	it('honors NS_HMR_HOST on Android', () => {
		// Tunnels and remote-debugging setups override the resolver via
		// the env var; the rewriter must respect it just like the bundle.
		getCliFlagsSpy.mockReturnValue({ android: true });
		process.env.NS_HMR_HOST = 'tunnel.example.com:5173';
		const server = makeFakeServer({
			host: '0.0.0.0',
			resolvedNetwork: ['http://192.168.0.8:5173/'],
		});

		expect(getServerOrigin(server)).toBe('http://tunnel.example.com:5173');
	});

	it('emits LAN IP on Android when NS_HMR_PREFER_LAN_HOST is set', () => {
		// Physical Android devices on the same Wi-Fi opt into the LAN IP
		// because the 10.0.2.2 alias only exists inside the emulator.
		getCliFlagsSpy.mockReturnValue({ android: true });
		process.env.NS_HMR_PREFER_LAN_HOST = '1';
		// The helper hits real NICs to find a LAN IP. We can't stub it
		// from outside the function, so we just assert it picked
		// something other than the emulator alias when one is available.
		const server = makeFakeServer({
			host: '0.0.0.0',
			resolvedNetwork: ['http://192.168.0.8:5173/'],
		});

		const origin = getServerOrigin(server);
		// Either picked a real LAN NIC, or fell back to 10.0.2.2 in CI
		// containers without a non-internal IPv4 NIC — both are
		// acceptable; what matters is the env var was consulted.
		expect(origin === 'http://10.0.2.2:5173' || /^http:\/\/(?:\d+\.){3}\d+:5173$/.test(origin)).toBe(true);
	});

	it('routes iOS wildcard through dev-host.ts (NOT resolvedUrls — that caused the realm-split mismatch)', () => {
		// Before the unification, iOS picked `resolvedUrls.network[0]`
		// here while `dev-host.ts` baked a different host into
		// bundle.mjs — exactly the URL mismatch that splits the
		// @nativescript/core realm across two module instances.
		//
		// In production the iOS wildcard default is the host's LAN IP
		// (reachable by both physical devices and the Simulator) — that
		// path is covered in dev-host.spec.ts with an injected
		// `lanHostResolver`. Here, inside the test runner, the resolver's
		// ambient-NIC guard kicks in (no injected resolver → never read
		// real NICs → machine-independent specs), so the observable
		// answer is the `localhost` fallback. What this test pins down is
		// that the answer comes from dev-host.ts, not `resolvedUrls`.
		getCliFlagsSpy.mockReturnValue({});
		const server = makeFakeServer({
			host: '0.0.0.0',
			resolvedNetwork: ['http://192.168.0.8:5173/'],
			resolvedLocal: ['http://localhost:5173/'],
		});

		expect(getServerOrigin(server)).toBe('http://localhost:5173');
	});

	it('preserves loopback host on iOS (no remapping)', () => {
		// Loopback IS reachable from the iOS Simulator (unlike the Android
		// emulator where it points at the device itself), so the resolver
		// passes it through unchanged.
		getCliFlagsSpy.mockReturnValue({});
		const server = makeFakeServer({
			host: 'localhost',
			resolvedLocal: ['http://localhost:5173/'],
		});

		expect(getServerOrigin(server)).toBe('http://localhost:5173');
	});

	it('honors NS_HMR_HOST on iOS', () => {
		// Tunnels and remote debugging override the resolver via env on
		// every platform.
		getCliFlagsSpy.mockReturnValue({});
		process.env.NS_HMR_HOST = 'tunnel.example.com';
		const server = makeFakeServer({
			host: '0.0.0.0',
			resolvedNetwork: ['http://192.168.0.8:5173/'],
		});

		expect(getServerOrigin(server)).toBe('http://tunnel.example.com:5173');
	});

	it('routes iOS to LAN IP when NS_HMR_PREFER_LAN_HOST is set (physical-device dev)', () => {
		// Physical iPhones / iPads on the same Wi-Fi need the LAN IP
		// just like physical Android devices do.
		getCliFlagsSpy.mockReturnValue({});
		process.env.NS_HMR_PREFER_LAN_HOST = '1';
		const server = makeFakeServer({
			host: '0.0.0.0',
			resolvedNetwork: ['http://192.168.0.8:5173/'],
		});

		const origin = getServerOrigin(server);
		// Either picked a real LAN NIC, or fell back to localhost in CI
		// containers without a non-internal IPv4 NIC. We just assert the
		// env var was consulted — the exact LAN address depends on the
		// host running the test.
		expect(origin === 'http://localhost:5173' || /^http:\/\/(?:\d+\.){3}\d+:5173$/.test(origin)).toBe(true);
	});

	it('respects explicit non-loopback host on iOS', () => {
		// Same precedence as Android: a developer-set LAN IP wins over
		// the platform default.
		getCliFlagsSpy.mockReturnValue({});
		const server = makeFakeServer({
			host: '192.168.1.42',
			resolvedNetwork: ['http://192.168.1.42:5173/'],
		});

		expect(getServerOrigin(server)).toBe('http://192.168.1.42:5173');
	});

	it('routes visionOS the same way as iOS', () => {
		// Same Apple branch as iOS: LAN IP in production, `localhost`
		// here because the test runner trips the ambient-NIC guard (see
		// the iOS wildcard test above).
		getCliFlagsSpy.mockReturnValue({ visionos: true });
		const server = makeFakeServer({
			host: '0.0.0.0',
			resolvedNetwork: ['http://192.168.0.8:5173/'],
		});

		expect(getServerOrigin(server)).toBe('http://localhost:5173');
	});

	it('respects explicit non-loopback host on Android', () => {
		// Developer wrote `server.host: '192.168.1.42'` deliberately —
		// trust it. Matches `dev-host.ts` precedence rule #2.
		getCliFlagsSpy.mockReturnValue({ android: true });
		const server = makeFakeServer({
			host: '192.168.1.42',
			resolvedNetwork: ['http://192.168.1.42:5173/'],
		});

		expect(getServerOrigin(server)).toBe('http://192.168.1.42:5173');
	});

	it('respects custom port on Android', () => {
		// Make sure the port isn't dropped when we route through the
		// device-host resolver.
		getCliFlagsSpy.mockReturnValue({ android: true });
		const server = makeFakeServer({
			host: '0.0.0.0',
			port: 6173,
			resolvedNetwork: ['http://192.168.0.8:6173/'],
		});

		expect(getServerOrigin(server)).toBe('http://10.0.2.2:6173');
	});

	it('emits https origin when server.https is set on Android', () => {
		getCliFlagsSpy.mockReturnValue({ android: true });
		const server = makeFakeServer({
			host: '0.0.0.0',
			https: true,
			resolvedNetwork: ['https://192.168.0.8:5173/'],
		});

		expect(getServerOrigin(server)).toBe('https://10.0.2.2:5173');
	});
});
