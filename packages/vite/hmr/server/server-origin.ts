import type { ViteDevServer } from 'vite';
import { resolveDeviceReachableOrigin, type DevHostPlatform } from '../../helpers/dev-host.js';
import { getCliFlags } from '../../helpers/cli-flags.js';

/**
 * Dev-server origin baked into every module served to the device
 * (`/ns/core/...`, `/ns/m/...`). MUST match the origin `dev-host.ts` bakes
 * into `bundle.mjs`; if they disagree V8 keys them as different modules and
 * the app ends up with two `@nativescript/core` realms (a singleton-state
 * split). `resolveDeviceReachableOrigin` keeps every platform in lock-step:
 * Android wildcard/loopback -> `127.0.0.1`-via-adb-reverse / `10.0.2.2`,
 * iOS/visionOS wildcard -> the host's LAN IP when a NIC is up (reachable
 * from both physical devices and the Simulator) else `localhost`, explicit
 * non-loopback `server.host` -> trusted verbatim. `NS_HMR_HOST` overrides
 * everything; `NS_HMR_PREFER_LAN_HOST=0` forces loopback.
 */
// Per-session memo: the device-reachable origin is stable for a dev server's
// lifetime, but `getServerOrigin` is called multiple times per `/ns/m` request
// (each call re-runs CLI-flag parsing + NIC enumeration via
// `resolveDeviceReachableOrigin`). Cache it on the server instance via a
// WeakMap so a long-running session computes it once and a fresh server (new
// session) recomputes.
const ORIGIN_CACHE = new WeakMap<object, string>();

export function getServerOrigin(server: ViteDevServer): string {
	const cached = ORIGIN_CACHE.get(server as unknown as object);
	if (cached) return cached;
	const origin = computeServerOrigin(server);
	ORIGIN_CACHE.set(server as unknown as object, origin);
	return origin;
}

function computeServerOrigin(server: ViteDevServer): string {
	const platform: DevHostPlatform = detectDevHostPlatform();
	const isHttps = !!server.config.server?.https;
	const protocol: 'http' | 'https' = isHttps ? 'https' : 'http';
	const httpServer = server.httpServer as any;
	const addr = httpServer?.address?.();
	const port = Number(server.config.server?.port || addr?.port || 5173);

	try {
		const { origin } = resolveDeviceReachableOrigin({
			host: server.config.server?.host,
			platform,
			protocol,
			port,
		});
		if (/^https?:\/\/[\w\-.:\[\]]+$/.test(origin)) {
			return origin;
		}
		console.warn('[hmr][origin] invariant failed for resolveDeviceReachableOrigin:', origin);
	} catch (err) {
		console.warn('[hmr][origin] resolveDeviceReachableOrigin threw:', (err as any)?.message || String(err));
	}

	// Last-ditch fallback for the implausible case where the resolver
	// throws (CI containers with no NICs, exotic `process.env` shapes,
	// etc.). We deliberately do NOT consult `resolvedUrls.network[0]`
	// here — see the doc comment above for why.
	const hostCfg = server.config.server?.host;
	const fallbackHost = typeof hostCfg === 'string' && hostCfg && hostCfg !== '0.0.0.0' ? hostCfg : platform === 'android' ? '10.0.2.2' : '127.0.0.1';
	const origin = `${protocol}://${fallbackHost}:${port}`;
	if (!/^https?:\/\/[\w\-.:\[\]]+$/.test(origin)) {
		console.warn('[hmr][origin] invariant failed for constructed origin:', origin);
	}
	return origin;
}

/**
 * Resolve the device target platform from the CLI flags the dev server
 * was launched with. The `--env.android` / `--env.visionos` flags are
 * surfaced by the NativeScript CLI when it spawns Vite; iOS is the
 * safe default when no flag is set so the helper stays a pure
 * function and standalone `vite serve` sessions still get sensible
 * URLs.
 */
function detectDevHostPlatform(): DevHostPlatform {
	try {
		const flags = (getCliFlags() || {}) as Record<string, unknown>;
		if (flags.android) return 'android';
		if (flags.visionos) return 'visionos';
	} catch {}
	return 'ios';
}
