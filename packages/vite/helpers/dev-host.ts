/**
 * Canonical resolver for the Vite dev-server origin that a NativeScript
 * device or simulator can actually reach.
 *
 * Why this exists. The Vite dev server commonly binds to `0.0.0.0`
 * (the wildcard "all interfaces" address) so both the host browser and
 * a sibling mobile device can hit it. That bind address is fine for
 * the LISTENING socket — but it is NOT a routable hostname:
 *
 *   - iOS Simulator shares the host's network stack, so `localhost` /
 *     `127.0.0.1` work from inside the simulator and even `0.0.0.0`
 *     sometimes resolves there. The simulator path is forgiving.
 *
 *   - Android Emulator runs inside a virtual NIC with NAT (QEMU
 *     `slirp`). `0.0.0.0` and `localhost` / `127.0.0.1` refer to the
 *     EMULATOR ITSELF, not the development host. Two routable paths
 *     exist:
 *
 *       (a) `adb reverse tcp:<port> tcp:<port>` — multiplexes the
 *           device-side `127.0.0.1:<port>` over the existing ADB
 *           transport to the host. This is the PREFERRED path: slirp
 *           is famously flaky under burst-connect load and drops
 *           ~80% of cold-boot module-loader fetches with
 *           `IOException: unexpected end of stream`. The ADB tunnel
 *           bypasses slirp entirely and is reliable. We try this
 *           automatically — see `tryEnableAdbReverse`. We emit the
 *           IPv4 literal `127.0.0.1` instead of `localhost` because
 *           Android API 36+ system images periodically ship without
 *           a `localhost` mapping in the resolver, and
 *           `UnknownHostException` fires before adb-reverse can do
 *           its job.
 *
 *       (b) `10.0.2.2` (Genymotion: `10.0.3.2`) — slirp's host alias.
 *           Used as a fallback when ADB isn't available or the user
 *           opted out via `NS_HMR_NO_ADB_REVERSE=1`. Works, just less
 *           reliable than the ADB tunnel.
 *
 *   - Physical Android devices over USB get the same automatic
 *     `adb reverse` treatment as emulators. Over Wi-Fi (no ADB
 *     tunnel), the user must opt out of adb reverse via
 *     `NS_HMR_NO_ADB_REVERSE=1` and supply a routable host via
 *     `NS_HMR_HOST=<ip>` or `NS_HMR_PREFER_LAN_HOST=1`.
 *
 * Without this normalization, `bundle.mjs` ships with statically
 * embedded URLs like `http://0.0.0.0:5173/ns/core/xhr` and the very
 * first dynamic import during Application boot fails with
 * `status=0 (network unreachable)` on Android, killing the runtime
 * before any user code runs.
 *
 * Resolution rules (highest precedence first):
 *
 *   1. `process.env.NS_HMR_HOST` — always wins. CI, tunneled setups,
 *      and remote devices use this to point at a known-good origin.
 *
 *   2. A concrete non-wildcard, non-loopback `host` arg — trust the
 *      developer's explicit choice (`server.host: '192.168.1.42'`
 *      already routes from any device on the LAN).
 *
 *   3. `process.env.NS_HMR_PREFER_LAN_HOST` truthy AND a LAN NIC is
 *      detected — emit the LAN IP. Opt-in for physical-device-over-
 *      Wi-Fi dev. Also disables the adb-reverse path below so the
 *      caller actually gets LAN routing.
 *
 *   4. Wildcard bind (`0.0.0.0`, `::`, `true`, empty) OR Android
 *      loopback — emit the platform-appropriate routable address.
 *      For Android, we first try `adb reverse tcp:<port> tcp:<port>`
 *      and emit `127.0.0.1` on success (bypasses slirp NAT entirely
 *      and avoids Android API 36+'s missing-`localhost`-from-resolver
 *      bug); on failure we fall back to `10.0.2.2`. iOS/visionOS get
 *      `localhost` directly. iOS/visionOS loopback passes through
 *      unchanged.
 *
 * Every dev-mode emitter that bakes a URL into `bundle.mjs` or sends
 * one to a device-side fetch site MUST run through this helper so the
 * device receives a single canonical, reachable origin.
 */

import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

import type { Platform } from './platform-types.js';
export type DevHostPlatform = Platform;

const WILDCARD_HOSTS = new Set(['0.0.0.0', '::', '', 'true']);
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

/**
 * Per-port cache of `adb reverse` setup attempts. Keyed by port so
 * dev servers that switch ports across restarts get a clean attempt
 * each time. The cache is required because every entry point that
 * embeds a device-reachable URL (the bundle.mjs boot path, the
 * `/ns/core/*` external resolver, the websocket URL emitter, the
 * served-module rewriter) hits `resolveDeviceReachable*` — if we
 * spawned `adb reverse` on every call we'd fork ~half a dozen
 * subprocesses per Vite startup and the cold-boot would slow
 * noticeably.
 *
 * The cache also gives us a stable answer across all consumers: once
 * the first caller learns that adb reverse is available, every later
 * caller in the same process gets the same `localhost`/`10.0.2.2`
 * decision. URL identity is what keeps the iOS HTTP ESM realm from
 * splitting and what keeps the Android HMR client and bundle.mjs
 * pointing at the same origin.
 */
interface AdbReverseStatus {
	attempted: boolean;
	succeeded: boolean;
	error?: string;
	/** Device serials that successfully received the reverse mapping. */
	devices: string[];
	/**
	 * Set when the mapping was established by the NativeScript CLI (it
	 * exported `NS_ADB_REVERSE_READY=1`) rather than by this plugin.
	 * In that case the plugin never spawned `adb` at all — it simply
	 * trusts that `127.0.0.1:<port>` already tunnels to the host. See
	 * the CLI-handoff note in `tryEnableAdbReverse`.
	 */
	viaCli?: boolean;
}
const adbReverseCache = new Map<number, AdbReverseStatus>();

/**
 * Returns the first non-internal IPv4 address on the host machine, or
 * `undefined` if no LAN NIC is up. Pure wrapper around
 * `os.networkInterfaces()` so callers and tests can stub it cleanly.
 */
export function guessLanHost(): string | undefined {
	try {
		const nets = os.networkInterfaces();
		for (const name of Object.keys(nets)) {
			const addrs = nets[name] || [];
			for (const addr of addrs) {
				if (!addr) continue;
				// Node typings vary across versions; keep checks defensive.
				const family = (addr as any).family;
				const internal = !!(addr as any).internal;
				const address = String((addr as any).address || '');
				if (internal) continue;
				if (family !== 'IPv4' && family !== 4) continue;
				if (address && address !== '127.0.0.1') return address;
			}
		}
	} catch {}
	return undefined;
}

function normalizeHostInput(host: unknown): string {
	if (host === true) return '0.0.0.0';
	if (host === false || host == null) return '';
	const s = String(host).trim();
	return s;
}

/**
 * Whether the given host string is a wildcard "all interfaces" bind
 * address rather than a routable hostname. `host` may be the literal
 * string from a Vite config (`'0.0.0.0'`), an empty string, or `'true'`
 * (some older Vite/CLI surfaces stringify the boolean).
 */
export function isWildcardHost(host: string): boolean {
	return WILDCARD_HOSTS.has(host);
}

/**
 * Whether the given host string is loopback. On Android the loopback
 * address is the device itself, NOT the development host — so callers
 * must remap it for Android consumers.
 */
export function isLoopbackHost(host: string): boolean {
	return LOOPBACK_HOSTS.has(host);
}

export interface DeviceHostResolution {
	/** Final host string baked into the device-side URL. */
	host: string;
	/**
	 * How the value was chosen. `'env'` / `'explicit'` mean the result
	 * is locked-in; `'lan'`, `'adb-reverse'`, and `'platform-default'`
	 * are fallbacks selected by this helper.
	 */
	source: 'env' | 'explicit' | 'lan' | 'adb-reverse' | 'platform-default';
}

function isTruthyEnvFlag(value: string | undefined): boolean {
	if (typeof value !== 'string') return false;
	const v = value.trim().toLowerCase();
	if (!v) return false;
	return v !== '0' && v !== 'false' && v !== 'off' && v !== 'no';
}

export interface ResolveDeviceHostOptions {
	/** The raw host value from the Vite config (`server.host`). */
	host?: unknown;
	/** Target device platform. Drives the loopback / wildcard fallback. */
	platform: DevHostPlatform;
	/**
	 * Override for `process.env`. Tests pass a fixture object; runtime
	 * callers omit this and pick up the ambient process environment.
	 */
	env?: NodeJS.ProcessEnv;
	/**
	 * Override for `guessLanHost()`. Tests stub a fixed return value;
	 * runtime callers omit this and the helper hits real NICs.
	 */
	lanHostResolver?: () => string | undefined;
	/**
	 * Dev-server port. When set AND `platform === 'android'`, this
	 * helper will lazily attempt `adb reverse tcp:<port> tcp:<port>`
	 * on first call and, if it succeeds, emit `localhost` instead of
	 * `10.0.2.2`. See `tryEnableAdbReverse` for the full rationale.
	 *
	 * Optional for backwards compatibility — callers that already have
	 * the port (which is everyone except a couple of legacy test
	 * fixtures) should pass it so Android emulator users get the
	 * reliable ADB tunnel path instead of QEMU slirp's flaky NAT.
	 */
	port?: number;
	/**
	 * Test seam for the adb-reverse subprocess. When passed, this
	 * helper uses the injected exec function instead of spawning
	 * `child_process.execFileSync`. Runtime callers omit this and pick
	 * up the SDK-resolved adb binary (see `resolveAdbPath`).
	 */
	adbExec?: AdbExec;
}

/**
 * Subprocess shim used by `tryEnableAdbReverse`. Production code
 * routes through `child_process.execFileSync` — argv form, NO
 * `/bin/sh -c` wrapper. That matters for two reasons:
 *
 *   1. On timeout, `execFileSync` signals the actual `adb` child
 *      directly. The old `execSync('adb …')` form spawned a shell
 *      that spawned adb; killing the shell on timeout ORPHANED the
 *      adb grandchild, and a half-handshaked orphan can wedge the
 *      adb daemon out from under the CLI's device tracker.
 *
 *   2. No shell means no quoting / `$PATH` surprises — we invoke an
 *      absolute, SDK-resolved adb binary (see `resolveAdbPath`) with
 *      a literal argv.
 *
 * Tests stub this so the suite can exercise success / failure /
 * "multiple devices" / "no ADB" paths without touching a real
 * Android emulator. The shim receives the resolved adb path and the
 * argv array (e.g. `['-s', 'emulator-5554', 'reverse', …]`).
 */
export type AdbExec = (adbPath: string, args: string[], opts: { timeout: number }) => string;

/**
 * Resolve the `adb` executable the way the Android SDK tooling does,
 * so the plugin and the NativeScript CLI drive the *same* adb client.
 *
 * Why this is load-bearing. A bare `adb` from `$PATH` is frequently a
 * DIFFERENT version than the one the CLI resolves from the SDK. When
 * two adb *clients* of differing versions talk to the one global adb
 * server (port 5037), the newer client prints
 * `adb server version (NN) doesn't match this client (MM); killing...`
 * and restarts the daemon — severing the CLI's `track-devices` stream
 * and hanging it at "Searching for devices…" forever. Resolving the
 * exact SDK adb eliminates that mismatch.
 *
 * Precedence:
 *   1. `NS_ADB_PATH` — the CLI exports the absolute path to the adb it
 *      itself uses. Always wins so the two processes are byte-identical.
 *   2. `$ANDROID_HOME/platform-tools/adb` (+ `.exe` on Windows).
 *   3. `$ANDROID_SDK_ROOT/platform-tools/adb`.
 *   4. Bare `adb` — last-resort PATH lookup (kept only so a machine
 *      with adb on PATH but no SDK env still limps along).
 *
 * Candidates from (2)/(3) are existence-checked; a stale env var that
 * points at a missing binary falls through rather than guaranteeing a
 * spawn failure.
 */
export function resolveAdbPath(env: NodeJS.ProcessEnv = process.env): string {
	const explicit = (env.NS_ADB_PATH || '').trim();
	if (explicit) return explicit;

	const exe = process.platform === 'win32' ? 'adb.exe' : 'adb';
	for (const root of [env.ANDROID_HOME, env.ANDROID_SDK_ROOT]) {
		const r = (root || '').trim();
		if (!r) continue;
		const candidate = path.join(r, 'platform-tools', exe);
		try {
			if (fs.existsSync(candidate)) return candidate;
		} catch {
			// fs probe failed (perms, race) — fall through to the next root.
		}
	}
	return exe;
}

export interface TryEnableAdbReverseOptions {
	/** Port to forward on both sides of the ADB bridge. */
	port: number;
	/** Override for `process.env`; tests pass a fixture object. */
	env?: NodeJS.ProcessEnv;
	/** Test seam — see `AdbExec`. */
	exec?: AdbExec;
}

/**
 * Read-only view of the current `adb reverse` status for a given
 * dev-server port. Returns `undefined` if `tryEnableAdbReverse` has
 * never been called for that port.
 */
export function getAdbReverseStatus(port: number): AdbReverseStatus | undefined {
	return adbReverseCache.get(port);
}

/**
 * Test hook — clears the per-port cache so unit tests can exercise
 * fresh "first call" behavior without leaking state between cases.
 * NOT exported from the package barrel; spec files import via the
 * file path directly.
 */
export function __resetAdbReverseCacheForTests(): void {
	adbReverseCache.clear();
}

/**
 * Try to set up `adb reverse tcp:<port> tcp:<port>` for every
 * connected Android device / emulator so device-side `localhost:port`
 * routes through the ADB transport to the host's dev server.
 *
 * Why this beats `10.0.2.2`. The Android emulator's stock NAT is
 * QEMU's `slirp` user-mode network stack, which is well-known to
 * drop bursts of concurrent TCP setups to the host. In practice this
 * surfaces as ~80% of synchronous module-loader fetches failing with
 * `IOException: unexpected end of stream` — the connection establishes,
 * the request goes out, and then slirp drops the response before
 * okhttp can read the status line. The failures are random per-module
 * across runs, retries help but don't eliminate them, and the symptom
 * masquerades as a server-side bug.
 *
 * `adb reverse` bypasses the emulator NIC entirely — the device-side
 * connection is multiplexed over the existing ADB USB / TCP channel
 * to the host. It's the same mechanism React Native, Expo, and
 * Flutter use for Android dev, and it works for both emulators and
 * USB-connected physical devices.
 *
 * Caching. The result is cached per-port so repeat callers don't
 * fork extra subprocesses. The cache is keyed on port (not platform)
 * because the wildcard "Android-ness" of the call is already implied
 * by the caller — only Android consumers hit this path.
 *
 * CLI handoff (the preferred path). When the NativeScript CLI drives
 * the run it already owns device discovery, install, and launch — it
 * knows the exact target serial and exactly when the device is ready.
 * In that mode the CLI performs the `adb reverse` itself, with its own
 * SDK-resolved adb, AFTER the device is up, and exports
 * `NS_ADB_REVERSE_READY=1`. Seeing that flag, this function returns a
 * synthetic success WITHOUT spawning adb at all — removing the second,
 * racing adb owner that used to collide with the CLI's device search
 * during cold start. `NS_DEVICE_SERIAL` (the CLI's deploy target) and
 * `NS_ADB_PATH` (the CLI's adb) are honored in the self-managed
 * fallback below for setups where the CLI did NOT pre-wire the reverse.
 *
 * Self-managed hardening (fallback). When `NS_ADB_REVERSE_READY` is
 * absent we still set the mapping ourselves, but defensively:
 *   - resolve adb from the SDK (`resolveAdbPath`) — never a bare PATH
 *     `adb` that could version-mismatch and kill the CLI's daemon;
 *   - `adb start-server` once up front so a cold daemon is owned by a
 *     single, version-matched client before anything else touches it;
 *   - argv `execFileSync` (no shell) with a child-killing timeout so a
 *     hung adb is reaped rather than orphaned;
 *   - `wait-for-device` per serial so we don't issue `reverse` against
 *     an emulator whose `adbd` hasn't finished coming up.
 *
 * Failure modes (all surface as a cached `succeeded: false`):
 *   - `NS_HMR_NO_ADB_REVERSE=1` — explicit opt-out for unusual
 *     setups (e.g. Wi-Fi-connected device with no ADB tunnel, CI
 *     containers without ADB installed).
 *   - `adb` not resolvable / not runnable.
 *   - No connected devices — user started Vite before booting the
 *     emulator. We do NOT keep retrying after the first failure
 *     because the URL is baked into bundle.mjs at config-load time
 *     and there's no point in flipping it later.
 *   - "more than one device" — fatal for unqualified `adb reverse`,
 *     so we target each serial individually with `-s <serial>`. As
 *     long as at least one device gets the mapping we treat the whole
 *     call as a success.
 */
export function tryEnableAdbReverse(opts: TryEnableAdbReverseOptions): AdbReverseStatus {
	const cached = adbReverseCache.get(opts.port);
	if (cached) return cached;

	const env = opts.env || process.env;

	// Explicit opt-out wins over everything — the user wants the
	// `10.0.2.2` / LAN path, so don't claim a tunnel exists even if the
	// CLI thinks it wired one.
	if (isTruthyEnvFlag(env.NS_HMR_NO_ADB_REVERSE)) {
		const status: AdbReverseStatus = { attempted: false, succeeded: false, devices: [], error: 'opt-out via NS_HMR_NO_ADB_REVERSE' };
		adbReverseCache.set(opts.port, status);
		return status;
	}

	// CLI handoff. The CLI already established the reverse with its own
	// adb after the device was ready; we trust it and never spawn adb.
	// This is what removes the cold-start race entirely.
	if (isTruthyEnvFlag(env.NS_ADB_REVERSE_READY)) {
		const serial = (env.NS_DEVICE_SERIAL || '').trim();
		const status: AdbReverseStatus = {
			attempted: false,
			succeeded: true,
			devices: serial ? [serial] : [],
			viaCli: true,
		};
		adbReverseCache.set(opts.port, status);
		try {
			console.log(`[NativeScript] adb reverse for tcp:${opts.port} provided by the NativeScript CLI${serial ? ` (device ${serial})` : ''} — device-side 127.0.0.1:${opts.port} tunnels to host.`);
		} catch {}
		return status;
	}

	// Test-safety guard. When we're running inside vitest / jest /
	// any other test runner AND the caller did NOT inject an explicit
	// exec stub, refuse to spawn a real `adb` subprocess. Spec files
	// that pass `env: {}` aren't expecting us to mutate the dev's real
	// device state (set up an actual `adb reverse` mapping on
	// `port:5173` they didn't ask for) just by exercising the host
	// resolver. We DO NOT cache this skip — a subsequent call with a
	// real `exec` stub from the same suite should still run.
	const ambient = process.env;
	const inTestRunner = ambient.VITEST === 'true' || ambient.NODE_ENV === 'test' || typeof ambient.JEST_WORKER_ID === 'string';
	if (!opts.exec && inTestRunner) {
		return { attempted: false, succeeded: false, devices: [], error: 'test environment (auto-skip)' };
	}

	const adbPath = resolveAdbPath(env);
	const exec: AdbExec =
		opts.exec ||
		((bin, args, o) =>
			execFileSync(bin, args, {
				timeout: o.timeout,
				// No `/bin/sh` wrapper: on timeout the signal lands on the
				// real adb child, not a shell that would orphan it.
				killSignal: 'SIGKILL',
				stdio: ['ignore', 'pipe', 'pipe'],
				encoding: 'utf8',
			}) as string);

	// Ensure a single, version-matched adb daemon is up and owned by
	// THIS client before any other command. Best-effort: if it throws,
	// the `adb devices` call below reports the real failure.
	try {
		exec(adbPath, ['start-server'], { timeout: 10000 });
	} catch {
		// start-server failures are reported via the enumerate step.
	}

	// Determine target serials. When the CLI handed us the deploy
	// target (`NS_DEVICE_SERIAL`) we scope to exactly that serial and
	// skip enumeration — no `adb devices`, no multi-device ambiguity.
	// Otherwise enumerate so we (a) bail cleanly when there's no device
	// and (b) target each connected device individually.
	let devices: string[] = [];
	const targetSerial = (env.NS_DEVICE_SERIAL || '').trim();
	if (targetSerial) {
		devices = [targetSerial];
	} else {
		try {
			const raw = exec(adbPath, ['devices'], { timeout: 5000 });
			devices = parseAdbDevicesOutput(raw);
		} catch (err: any) {
			const status: AdbReverseStatus = {
				attempted: true,
				succeeded: false,
				devices: [],
				error: `adb not available: ${String(err?.message || err)}`,
			};
			adbReverseCache.set(opts.port, status);
			return status;
		}

		if (devices.length === 0) {
			const status: AdbReverseStatus = {
				attempted: true,
				succeeded: false,
				devices: [],
				error: 'no connected Android devices',
			};
			adbReverseCache.set(opts.port, status);
			try {
				console.warn(`[NativeScript] adb reverse skipped — no Android devices connected yet. Bundle URLs will use 10.0.2.2 (emulator NAT). For best reliability boot the emulator BEFORE \`ns run android\` so adb reverse can wire 127.0.0.1:${opts.port} through ADB instead.`);
			} catch {}
			return status;
		}
	}

	// Apply per-device so multi-device setups don't hit the "more
	// than one device" failure. We tolerate per-device failures so
	// long as at least one mapping landed — the user's target device
	// is almost always the first connected one.
	const successes: string[] = [];
	const errors: string[] = [];
	for (const serial of devices) {
		try {
			// Don't `reverse` against a device whose adbd isn't accepting
			// yet (emulators report `device` state before `adbd` is ready).
			// `wait-for-device` blocks only until the transport is up, then
			// returns immediately on an already-ready device.
			try {
				exec(adbPath, ['-s', serial, 'wait-for-device'], { timeout: 10000 });
			} catch {
				// Non-fatal: fall through and let `reverse` surface the real
				// error if the device truly isn't reachable.
			}
			exec(adbPath, ['-s', serial, 'reverse', `tcp:${opts.port}`, `tcp:${opts.port}`], { timeout: 5000 });
			successes.push(serial);
		} catch (err: any) {
			errors.push(`${serial}: ${String(err?.message || err)}`);
		}
	}

	const status: AdbReverseStatus = {
		attempted: true,
		succeeded: successes.length > 0,
		devices: successes,
		error: successes.length === 0 ? errors.join('; ') || 'all devices failed' : undefined,
	};
	adbReverseCache.set(opts.port, status);

	// One-line user-facing receipt so the dev knows why bundle.mjs
	// suddenly switched from `10.0.2.2` to `127.0.0.1`. We only log
	// outside test runners (covered above) so spec output stays clean.
	try {
		if (status.succeeded) {
			console.log(`[NativeScript] adb reverse tcp:${opts.port} tcp:${opts.port} → ${successes.join(', ')} (Android device-side 127.0.0.1:${opts.port} now tunnels to host — bypasses emulator NAT)`);
		} else if (errors.length > 0) {
			console.warn(`[NativeScript] adb reverse failed for tcp:${opts.port} — falling back to 10.0.2.2 (slirp NAT). Module fetches may hit IOException: unexpected end of stream under load. Reasons: ${status.error}`);
		}
	} catch {
		// Logging is best-effort. We never want a console misbehavior
		// to take down dev-server boot.
	}
	return status;
}

/**
 * Parse the line-oriented output of `adb devices`:
 *
 *   List of devices attached
 *   emulator-5554\tdevice
 *   ABCDEF12\tdevice
 *   somemodel\tunauthorized
 *
 * We keep only entries whose second column is exactly `device`
 * (skip `unauthorized`, `offline`, `recovery`, etc. — none of those
 * can accept an `adb reverse` command).
 */
function parseAdbDevicesOutput(raw: string): string[] {
	const out: string[] = [];
	const lines = String(raw || '').split(/\r?\n/);
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		if (trimmed.startsWith('List of devices')) continue;
		if (trimmed.startsWith('*')) continue; // daemon startup chatter
		const parts = trimmed.split(/\s+/);
		if (parts.length < 2) continue;
		if (parts[1] !== 'device') continue;
		out.push(parts[0]);
	}
	return out;
}

/**
 * Pick the host string a device or simulator can actually reach.
 *
 * See the file-level comment for the full resolution-precedence
 * narrative. Returns the chosen host alongside a `source` tag so
 * callers (and logs) can explain why a given URL was emitted.
 */
export function resolveDeviceReachableHost(opts: ResolveDeviceHostOptions): DeviceHostResolution {
	const env = opts.env || process.env;
	const lanHostResolver = opts.lanHostResolver || guessLanHost;

	// 1. Explicit env override always wins.
	const envOverride = env.NS_HMR_HOST;
	if (typeof envOverride === 'string' && envOverride.length > 0) {
		return { host: envOverride, source: 'env' };
	}

	const raw = normalizeHostInput(opts.host);

	// 2. Explicit non-wildcard, non-loopback host — trust the developer.
	//    Loopback addresses on Android still need remapping (see step 4),
	//    so we only short-circuit here for the truly routable case.
	if (raw && !isWildcardHost(raw) && !isLoopbackHost(raw)) {
		return { host: raw, source: 'explicit' };
	}

	// 3. Physical-device opt-in. The Android emulator default below
	//    (`10.0.2.2`) doesn't reach a real device on the LAN, so users
	//    running on hardware set `NS_HMR_PREFER_LAN_HOST=1` to pick up
	//    the host's LAN IP at build time. iOS/visionOS rarely needs
	//    this (the simulator stays on the loopback path) but the same
	//    opt-in works on those platforms for parity.
	//
	//    `NS_HMR_PREFER_LAN_HOST` ALSO suppresses the adb-reverse path
	//    below — when the user has explicitly asked for LAN routing
	//    we don't want to silently bypass them with an ADB tunnel.
	if (isTruthyEnvFlag(env.NS_HMR_PREFER_LAN_HOST)) {
		const lan = lanHostResolver();
		if (lan) {
			return { host: lan, source: 'lan' };
		}
		// Fall through to the platform default when no LAN NIC was
		// detected (e.g. running in a CI container) — better to fail
		// at the always-works fallback than emit nothing.
	}

	// 4. Wildcard bind — fall back to the platform-appropriate routable
	//    address. We DELIBERATELY do NOT auto-pick a LAN IP here on
	//    Android: standard emulator NAT drops packets destined for the
	//    host's LAN IP, even when those IPs resolve fine from the
	//    host's own browser. `10.0.2.2` is the next-best fallback when
	//    adb reverse isn't available; otherwise the emulator slirp NAT
	//    drops a meaningful fraction of TCP setups under burst load and
	//    cold-boot hits `IOException: unexpected end of stream` for
	//    random modules each run.
	if (isWildcardHost(raw)) {
		return platformDefault(opts);
	}

	// 5. Loopback. iOS / visionOS keeps `localhost` (simulator network
	//    stack reaches the host); Android remaps to `10.0.2.2` /
	//    `localhost`-via-adb-reverse (loopback on Android refers to
	//    the EMULATOR ITSELF, not the host).
	if (isLoopbackHost(raw)) {
		if (opts.platform === 'android') {
			return platformDefault(opts);
		}
		return { host: raw, source: 'explicit' };
	}

	// 6. Empty / unrecognised — fall back to platform default.
	return platformDefault(opts);
}

function platformDefault(opts: ResolveDeviceHostOptions): DeviceHostResolution {
	if (opts.platform === 'android') {
		// Try to bring up an `adb reverse` tunnel first. When that
		// succeeds, `localhost` on the device routes through the
		// existing ADB channel to the host's dev server — which
		// sidesteps the QEMU slirp NAT entirely (see
		// `tryEnableAdbReverse` for why that matters). When adb is
		// unavailable, the device is disconnected, or the user opted
		// out via `NS_HMR_NO_ADB_REVERSE`, we fall through to
		// `10.0.2.2` so the cold boot still has *some* working path.
		//
		// We only attempt adb reverse when we know the port — without
		// it we can't issue a valid `adb reverse` command. Older
		// fixtures that call `resolveDeviceReachableHost` without a
		// port still get the legacy `10.0.2.2` answer.
		if (typeof opts.port === 'number' && Number.isFinite(opts.port)) {
			const status = tryEnableAdbReverse({ port: opts.port, env: opts.env, exec: opts.adbExec });
			if (status.succeeded) {
				// Emit `127.0.0.1` (IPv4 literal) instead of `localhost`.
				// Android API 36+ system images periodically ship without
				// a `localhost` entry in the resolver's `/etc/hosts`, so
				// `getaddrinfo("localhost")` throws
				// `UnknownHostException: No address associated with
				// hostname` BEFORE the TCP connect even starts. The IPv4
				// literal bypasses DNS entirely and ADB reverse intercepts
				// loopback traffic regardless of how it's spelled. This is
				// the same workaround React Native, Expo, and Chrome
				// DevTools port forwarding all use.
				return { host: '127.0.0.1', source: 'adb-reverse' };
			}
		}
		// Stock Android emulator host alias. Physical devices that
		// can't use `adb reverse` need NS_HMR_HOST=<LAN IP> or
		// NS_HMR_PREFER_LAN_HOST=1.
		return { host: '10.0.2.2', source: 'platform-default' };
	}
	return { host: 'localhost', source: 'platform-default' };
}

export interface ResolveDeviceOriginOptions extends ResolveDeviceHostOptions {
	/** Wire protocol; usually 'http' unless `server.https` is set. */
	protocol?: 'http' | 'https';
	/** Server port; defaults to 5173 to match the Vite dev default. */
	port?: number;
}

export interface DeviceOriginResolution extends DeviceHostResolution {
	/** Fully assembled `protocol://host:port` string. */
	origin: string;
	protocol: 'http' | 'https';
	port: number;
}

/**
 * Convenience wrapper that returns the full `protocol://host:port`
 * origin string alongside the host-resolution metadata. The vast
 * majority of callers want the assembled origin to splice into a
 * `/ns/...` URL, so this saves them the trivial template string.
 *
 * When the resolved host already includes a `:port` suffix (a common
 * shape for `NS_HMR_HOST=tunnel.example.com:5173`), we split it back
 * out so the assembled origin never doubles up the port.
 */
export function resolveDeviceReachableOrigin(opts: ResolveDeviceOriginOptions): DeviceOriginResolution {
	const protocol: 'http' | 'https' = opts.protocol === 'https' ? 'https' : 'http';
	const requestedPort = typeof opts.port === 'number' && Number.isFinite(opts.port) ? opts.port : 5173;
	// Forward the resolved port to the host resolver so the Android
	// `platformDefault` step can attempt `adb reverse` for the same
	// port the dev server is actually listening on.
	const { host: rawHost, source } = resolveDeviceReachableHost({ ...opts, port: requestedPort });
	const { host, port } = splitHostAndPort(rawHost, requestedPort);
	return {
		host,
		source,
		protocol,
		port,
		origin: `${protocol}://${host}:${port}`,
	};
}

function splitHostAndPort(rawHost: string, fallbackPort: number): { host: string; port: number } {
	// Bracketed IPv6 — `[::1]:5173` — keep the brackets on the host so
	// callers can splice it straight into a URL without re-escaping.
	if (rawHost.startsWith('[')) {
		const closing = rawHost.indexOf(']');
		if (closing !== -1) {
			const bracketed = rawHost.slice(0, closing + 1);
			const rest = rawHost.slice(closing + 1);
			if (rest.startsWith(':')) {
				const parsed = Number(rest.slice(1));
				if (Number.isFinite(parsed) && parsed > 0) {
					return { host: bracketed, port: parsed };
				}
			}
			return { host: bracketed, port: fallbackPort };
		}
	}

	// `host:port` for IPv4 / DNS names. We deliberately do NOT split on
	// the first colon when more than one is present (that would
	// misinterpret an unbracketed IPv6 literal), and we leave the host
	// alone if the trailing segment isn't a positive integer.
	const colonCount = (rawHost.match(/:/g) || []).length;
	if (colonCount === 1) {
		const idx = rawHost.indexOf(':');
		const candidatePort = Number(rawHost.slice(idx + 1));
		if (Number.isFinite(candidatePort) && candidatePort > 0) {
			return { host: rawHost.slice(0, idx), port: candidatePort };
		}
	}

	return { host: rawHost, port: fallbackPort };
}
