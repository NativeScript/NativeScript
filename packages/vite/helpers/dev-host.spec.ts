import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { __resetAdbReverseCacheForTests, isLoopbackHost, isWildcardHost, resolveAdbPath, resolveDeviceReachableHost, resolveDeviceReachableOrigin, tryEnableAdbReverse } from './dev-host.js';

// Adb subprocess stub helper. The production seam is now argv-based
// (`(adbPath, args, opts) => string`, backed by `execFileSync` with no
// shell). Tests describe behavior by matching on the FIRST meaningful
// argv token: `start-server`, `devices`, or a `-s <serial> <verb>`
// shape. `record` collects `args.join(' ')` so assertions can read like
// the command line a human would type.
function adbStub(handler: (verb: string, args: string[]) => string, record?: string[]) {
	return (_adbPath: string, args: string[]): string => {
		if (record) record.push(args.join(' '));
		// `start-server` and `devices` are top-level; `-s <serial> <verb>`
		// puts the verb at index 2.
		const verb = args[0] === '-s' ? args[2] : args[0];
		return handler(verb, args);
	};
}

// All tests pass an explicit `env: {}` (and a stubbed `lanHostResolver`
// where relevant) so they never read ambient `process.env.NS_HMR_HOST`
// or hit real network interfaces.

describe('dev-host — host classification helpers', () => {
	it('flags wildcard binds', () => {
		expect(isWildcardHost('0.0.0.0')).toBe(true);
		expect(isWildcardHost('::')).toBe(true);
		expect(isWildcardHost('')).toBe(true);
		expect(isWildcardHost('true')).toBe(true);
	});

	it('does not flag concrete hosts as wildcard', () => {
		expect(isWildcardHost('localhost')).toBe(false);
		expect(isWildcardHost('127.0.0.1')).toBe(false);
		expect(isWildcardHost('10.0.2.2')).toBe(false);
		expect(isWildcardHost('192.168.1.42')).toBe(false);
		expect(isWildcardHost('example.dev')).toBe(false);
	});

	it('flags loopback addresses', () => {
		expect(isLoopbackHost('localhost')).toBe(true);
		expect(isLoopbackHost('127.0.0.1')).toBe(true);
		expect(isLoopbackHost('::1')).toBe(true);
	});

	it('does not flag LAN / wildcard / hostnames as loopback', () => {
		expect(isLoopbackHost('0.0.0.0')).toBe(false);
		expect(isLoopbackHost('10.0.2.2')).toBe(false);
		expect(isLoopbackHost('192.168.1.42')).toBe(false);
		expect(isLoopbackHost('myhost.local')).toBe(false);
	});
});

describe('resolveDeviceReachableHost — precedence', () => {
	it('honors NS_HMR_HOST above every other rule (Android wildcard)', () => {
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: { NS_HMR_HOST: 'ci.example.com' },
			lanHostResolver: () => '10.20.30.40',
		});
		expect(r.host).toBe('ci.example.com');
		expect(r.source).toBe('env');
	});

	it('honors NS_HMR_HOST above every other rule (iOS loopback)', () => {
		const r = resolveDeviceReachableHost({
			host: 'localhost',
			platform: 'ios',
			env: { NS_HMR_HOST: 'staging.tunnel.dev' },
			lanHostResolver: () => '10.20.30.40',
		});
		expect(r.host).toBe('staging.tunnel.dev');
		expect(r.source).toBe('env');
	});

	it('trusts an explicit non-wildcard non-loopback host (iOS)', () => {
		const r = resolveDeviceReachableHost({
			host: '192.168.1.42',
			platform: 'ios',
			env: {},
		});
		expect(r.host).toBe('192.168.1.42');
		expect(r.source).toBe('explicit');
	});

	it('trusts an explicit non-wildcard non-loopback host (Android)', () => {
		const r = resolveDeviceReachableHost({
			host: '192.168.1.42',
			platform: 'android',
			env: {},
		});
		expect(r.host).toBe('192.168.1.42');
		expect(r.source).toBe('explicit');
	});

	it('trims whitespace from the input host', () => {
		const r = resolveDeviceReachableHost({
			host: '  192.168.1.42  ',
			platform: 'android',
			env: {},
		});
		expect(r.host).toBe('192.168.1.42');
		expect(r.source).toBe('explicit');
	});
});

describe('resolveDeviceReachableHost — wildcard binds (emulator-safe default)', () => {
	it('iOS: wildcard → localhost (simulator shares host network stack)', () => {
		// LAN IP not picked even when available — `localhost` works
		// transparently in the iOS Simulator and avoids the LAN-IP
		// firewall headaches the Android branch hits.
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'ios',
			env: {},
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('localhost');
		expect(r.source).toBe('platform-default');
	});

	it('iOS: wildcard → localhost when no LAN NIC detected', () => {
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'ios',
			env: {},
			lanHostResolver: () => undefined,
		});
		expect(r.host).toBe('localhost');
		expect(r.source).toBe('platform-default');
	});

	it('Android: wildcard → 10.0.2.2 (NOT the LAN IP — standard emulator NAT drops LAN-IP packets)', () => {
		// Even when a LAN NIC is detected we deliberately route to
		// `10.0.2.2` on Android. Picking the LAN IP here regressed
		// `npm run dev:android` on standard emulators because the
		// emulator's NAT cannot reach the host's LAN address. The
		// physical-device path opts in via `NS_HMR_PREFER_LAN_HOST=1`.
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: {},
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
	});

	it('Android: wildcard → 10.0.2.2 fallback when no LAN NIC detected', () => {
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: {},
			lanHostResolver: () => undefined,
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
	});

	it('treats boolean true (older Vite/CLI surfaces) as a wildcard bind', () => {
		const r = resolveDeviceReachableHost({
			host: true,
			platform: 'android',
			env: {},
			lanHostResolver: () => undefined,
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
	});

	it('treats undefined host as wildcard / unspecified', () => {
		const r = resolveDeviceReachableHost({
			host: undefined,
			platform: 'android',
			env: {},
			lanHostResolver: () => undefined,
		});
		expect(r.host).toBe('10.0.2.2');
	});

	it('treats empty-string host as wildcard / unspecified', () => {
		const r = resolveDeviceReachableHost({
			host: '',
			platform: 'android',
			env: {},
			lanHostResolver: () => undefined,
		});
		expect(r.host).toBe('10.0.2.2');
	});
});

describe('resolveDeviceReachableHost — Android loopback remapping', () => {
	it('Android: localhost → 10.0.2.2 (loopback on Android refers to the emulator itself)', () => {
		const r = resolveDeviceReachableHost({
			host: 'localhost',
			platform: 'android',
			env: {},
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
	});

	it('Android: 127.0.0.1 → 10.0.2.2', () => {
		const r = resolveDeviceReachableHost({
			host: '127.0.0.1',
			platform: 'android',
			env: {},
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
	});

	it('Android: ::1 → 10.0.2.2', () => {
		const r = resolveDeviceReachableHost({
			host: '::1',
			platform: 'android',
			env: {},
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
	});

	it('Android: loopback still resolves to 10.0.2.2 when no LAN NIC detected', () => {
		const r = resolveDeviceReachableHost({
			host: 'localhost',
			platform: 'android',
			env: {},
			lanHostResolver: () => undefined,
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
	});
});

describe('resolveDeviceReachableHost — NS_HMR_PREFER_LAN_HOST opt-in', () => {
	it('Android: wildcard + NS_HMR_PREFER_LAN_HOST=1 picks up LAN IP', () => {
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: { NS_HMR_PREFER_LAN_HOST: '1' },
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('192.168.1.42');
		expect(r.source).toBe('lan');
	});

	it('Android: loopback + NS_HMR_PREFER_LAN_HOST=true picks up LAN IP', () => {
		const r = resolveDeviceReachableHost({
			host: 'localhost',
			platform: 'android',
			env: { NS_HMR_PREFER_LAN_HOST: 'true' },
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('192.168.1.42');
		expect(r.source).toBe('lan');
	});

	it('NS_HMR_PREFER_LAN_HOST falsy values (0, false, off, no) do NOT switch to LAN IP', () => {
		for (const v of ['0', 'false', 'off', 'no', '']) {
			const r = resolveDeviceReachableHost({
				host: '0.0.0.0',
				platform: 'android',
				env: { NS_HMR_PREFER_LAN_HOST: v },
				lanHostResolver: () => '192.168.1.42',
			});
			expect(r.host).toBe('10.0.2.2');
			expect(r.source).toBe('platform-default');
		}
	});

	it('NS_HMR_PREFER_LAN_HOST=1 with no LAN NIC detected falls through to platform default (better than emitting nothing)', () => {
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: { NS_HMR_PREFER_LAN_HOST: '1' },
			lanHostResolver: () => undefined,
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
	});

	it('NS_HMR_HOST still wins over NS_HMR_PREFER_LAN_HOST', () => {
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: { NS_HMR_HOST: 'tunnel.example.com', NS_HMR_PREFER_LAN_HOST: '1' },
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('tunnel.example.com');
		expect(r.source).toBe('env');
	});

	it('iOS: NS_HMR_PREFER_LAN_HOST=1 also works (parity for cross-platform scripts)', () => {
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'ios',
			env: { NS_HMR_PREFER_LAN_HOST: '1' },
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('192.168.1.42');
		expect(r.source).toBe('lan');
	});
});

describe('resolveDeviceReachableHost — loopback passthrough (Apple)', () => {
	it('iOS: localhost stays localhost (simulator shares host network stack)', () => {
		const r = resolveDeviceReachableHost({
			host: 'localhost',
			platform: 'ios',
			env: {},
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('localhost');
		expect(r.source).toBe('explicit');
	});

	it('iOS: 127.0.0.1 stays 127.0.0.1', () => {
		const r = resolveDeviceReachableHost({
			host: '127.0.0.1',
			platform: 'ios',
			env: {},
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('127.0.0.1');
		expect(r.source).toBe('explicit');
	});

	it('visionOS: localhost stays localhost', () => {
		const r = resolveDeviceReachableHost({
			host: 'localhost',
			platform: 'visionos',
			env: {},
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.host).toBe('localhost');
		expect(r.source).toBe('explicit');
	});
});

describe('resolveDeviceReachableOrigin', () => {
	it('assembles the full origin from the resolved host + protocol + port (Android wildcard → 10.0.2.2)', () => {
		const r = resolveDeviceReachableOrigin({
			host: '0.0.0.0',
			platform: 'android',
			env: {},
			lanHostResolver: () => '192.168.1.42',
			protocol: 'http',
			port: 5173,
		});
		expect(r.origin).toBe('http://10.0.2.2:5173');
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
		expect(r.protocol).toBe('http');
		expect(r.port).toBe(5173);
	});

	it('Android wildcard + NS_HMR_PREFER_LAN_HOST=1 routes to the LAN IP for physical-device dev', () => {
		const r = resolveDeviceReachableOrigin({
			host: '0.0.0.0',
			platform: 'android',
			env: { NS_HMR_PREFER_LAN_HOST: '1' },
			lanHostResolver: () => '192.168.1.42',
		});
		expect(r.origin).toBe('http://192.168.1.42:5173');
		expect(r.source).toBe('lan');
	});

	it('defaults to http://...:5173 when protocol / port omitted', () => {
		const r = resolveDeviceReachableOrigin({
			host: 'localhost',
			platform: 'ios',
			env: {},
		});
		expect(r.origin).toBe('http://localhost:5173');
		expect(r.protocol).toBe('http');
		expect(r.port).toBe(5173);
	});

	it('honors https protocol', () => {
		const r = resolveDeviceReachableOrigin({
			host: 'dev.example.com',
			platform: 'ios',
			env: {},
			protocol: 'https',
		});
		expect(r.origin).toBe('https://dev.example.com:5173');
		expect(r.protocol).toBe('https');
	});

	it('honors custom port', () => {
		const r = resolveDeviceReachableOrigin({
			host: 'localhost',
			platform: 'ios',
			env: {},
			port: 8443,
		});
		expect(r.origin).toBe('http://localhost:8443');
		expect(r.port).toBe(8443);
	});

	it('splits host:port from NS_HMR_HOST so the origin never doubles up the port', () => {
		// Common tunneling shape — ngrok / Cloudflared / corporate proxies
		// hand out `host:port` strings that historically leaked through as
		// `http://host:port:5173`, which Android's `URL` parser then
		// rejected with `Invalid URL` long before the `status=0` fetch
		// even fired.
		const r = resolveDeviceReachableOrigin({
			host: '0.0.0.0',
			platform: 'android',
			env: { NS_HMR_HOST: 'tunnel.example.com:8443' },
			protocol: 'http',
			port: 5173,
		});
		expect(r.origin).toBe('http://tunnel.example.com:8443');
		expect(r.host).toBe('tunnel.example.com');
		expect(r.port).toBe(8443);
		expect(r.source).toBe('env');
	});

	it('falls back to the requested port when NS_HMR_HOST omits one', () => {
		const r = resolveDeviceReachableOrigin({
			host: '0.0.0.0',
			platform: 'android',
			env: { NS_HMR_HOST: 'tunnel.example.com' },
			port: 5173,
		});
		expect(r.origin).toBe('http://tunnel.example.com:5173');
		expect(r.host).toBe('tunnel.example.com');
		expect(r.port).toBe(5173);
	});

	it('preserves bracketed IPv6 hosts and parses their suffix port', () => {
		// `[::1]:5173` is the only legal way to spell an IPv6 host:port,
		// so splitting it requires bracket-aware parsing — splitting on
		// the first colon would otherwise mangle the address.
		const r = resolveDeviceReachableOrigin({
			host: '[::1]:5173',
			platform: 'ios',
			env: {},
		});
		expect(r.origin).toBe('http://[::1]:5173');
		expect(r.host).toBe('[::1]');
		expect(r.port).toBe(5173);
	});

	it('keeps unbracketed IPv6 hosts intact (no spurious colon split)', () => {
		// An unbracketed `::1` has multiple colons; we MUST NOT treat the
		// last segment as a port.
		const r = resolveDeviceReachableOrigin({
			host: '::1',
			platform: 'ios',
			env: {},
			port: 5173,
		});
		expect(r.origin).toBe('http://::1:5173');
		expect(r.host).toBe('::1');
		expect(r.port).toBe(5173);
	});
});

describe('resolveAdbPath — SDK resolution', () => {
	it('prefers NS_ADB_PATH verbatim (the exact adb the CLI uses), without existence-checking it', () => {
		expect(resolveAdbPath({ NS_ADB_PATH: '/custom/sdk/platform-tools/adb', ANDROID_HOME: '/other' })).toBe('/custom/sdk/platform-tools/adb');
	});

	it('trims surrounding whitespace from NS_ADB_PATH', () => {
		expect(resolveAdbPath({ NS_ADB_PATH: '  /custom/adb  ' })).toBe('/custom/adb');
	});

	it('falls back to bare `adb` when no SDK env is set', () => {
		// On non-Windows CI / dev the bare lookup is `adb`. (We can't
		// assert the Windows `.exe` form from here without stubbing
		// `process.platform`.)
		const resolved = resolveAdbPath({});
		expect(resolved === 'adb' || resolved === 'adb.exe').toBe(true);
	});

	describe('with a real $ANDROID_HOME/platform-tools/adb on disk', () => {
		let sdkRoot: string;
		let adbBin: string;
		beforeEach(() => {
			sdkRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-adb-sdk-'));
			const platformTools = path.join(sdkRoot, 'platform-tools');
			fs.mkdirSync(platformTools, { recursive: true });
			adbBin = path.join(platformTools, process.platform === 'win32' ? 'adb.exe' : 'adb');
			fs.writeFileSync(adbBin, '');
		});
		afterAll(() => {
			try {
				fs.rmSync(sdkRoot, { recursive: true, force: true });
			} catch {}
		});

		it('builds $ANDROID_HOME/platform-tools/adb when it exists', () => {
			expect(resolveAdbPath({ ANDROID_HOME: sdkRoot })).toBe(adbBin);
		});

		it('falls back to $ANDROID_SDK_ROOT when ANDROID_HOME is unset', () => {
			expect(resolveAdbPath({ ANDROID_SDK_ROOT: sdkRoot })).toBe(adbBin);
		});

		it('falls through to bare `adb` when the SDK env points at a missing binary', () => {
			const resolved = resolveAdbPath({ ANDROID_HOME: path.join(os.tmpdir(), 'ns-adb-does-not-exist') });
			expect(resolved === 'adb' || resolved === 'adb.exe').toBe(true);
		});
	});
});

// Adb-reverse wiring tests. Every case in this block injects an
// explicit `exec` stub (argv form) so the VITEST auto-skip in
// `tryEnableAdbReverse` doesn't short-circuit us and we exercise the
// real subprocess logic. `beforeEach` clears the per-port cache so a
// previous case can't leak its decision into a later one.
//
// Self-managed runs now always lead with `start-server`, then
// `devices` (unless scoped by NS_DEVICE_SERIAL), then per-serial
// `wait-for-device` + `reverse`.
describe('tryEnableAdbReverse — subprocess orchestration', () => {
	beforeEach(() => {
		__resetAdbReverseCacheForTests();
	});

	it('opts out cleanly when NS_HMR_NO_ADB_REVERSE is set', () => {
		let execCalls = 0;
		const status = tryEnableAdbReverse({
			port: 5173,
			env: { NS_HMR_NO_ADB_REVERSE: '1' },
			exec: () => {
				execCalls++;
				return '';
			},
		});
		expect(status.attempted).toBe(false);
		expect(status.succeeded).toBe(false);
		expect(status.error).toContain('opt-out');
		expect(execCalls).toBe(0);
	});

	it('opt-out wins even when the CLI signalled NS_ADB_REVERSE_READY', () => {
		const status = tryEnableAdbReverse({
			port: 5173,
			env: { NS_HMR_NO_ADB_REVERSE: '1', NS_ADB_REVERSE_READY: '1' },
		});
		expect(status.succeeded).toBe(false);
		expect(status.error).toContain('opt-out');
	});

	it('trusts the CLI handoff (NS_ADB_REVERSE_READY=1) and never spawns adb', () => {
		let execCalls = 0;
		const status = tryEnableAdbReverse({
			port: 5173,
			env: { NS_ADB_REVERSE_READY: '1', NS_DEVICE_SERIAL: 'emulator-5554' },
			exec: () => {
				execCalls++;
				return '';
			},
		});
		expect(status.attempted).toBe(false);
		expect(status.succeeded).toBe(true);
		expect(status.viaCli).toBe(true);
		expect(status.devices).toEqual(['emulator-5554']);
		expect(execCalls).toBe(0);
	});

	it('CLI handoff succeeds even without a serial (NS_DEVICE_SERIAL absent)', () => {
		const status = tryEnableAdbReverse({
			port: 5173,
			env: { NS_ADB_REVERSE_READY: '1' },
		});
		expect(status.succeeded).toBe(true);
		expect(status.viaCli).toBe(true);
		expect(status.devices).toEqual([]);
	});

	it('returns no-devices status when `adb devices` returns just the header', () => {
		const status = tryEnableAdbReverse({
			port: 5173,
			env: {},
			exec: adbStub((verb) => {
				if (verb === 'devices') return 'List of devices attached\n';
				return '';
			}),
		});
		expect(status.attempted).toBe(true);
		expect(status.succeeded).toBe(false);
		expect(status.devices).toEqual([]);
		expect(status.error).toContain('no connected Android devices');
	});

	it('returns adb-not-available status when `adb devices` throws (no PATH entry)', () => {
		const status = tryEnableAdbReverse({
			port: 5173,
			env: {},
			exec: adbStub((verb) => {
				if (verb === 'devices') throw new Error('spawn adb ENOENT');
				return '';
			}),
		});
		expect(status.attempted).toBe(true);
		expect(status.succeeded).toBe(false);
		expect(status.error).toContain('adb not available');
		expect(status.error).toContain('ENOENT');
	});

	it('runs `start-server` before enumerating devices', () => {
		const cmds: string[] = [];
		tryEnableAdbReverse({
			port: 5173,
			env: {},
			exec: adbStub((verb) => {
				if (verb === 'devices') return 'List of devices attached\nemulator-5554\tdevice\n';
				return '';
			}, cmds),
		});
		expect(cmds[0]).toBe('start-server');
		expect(cmds.indexOf('start-server')).toBeLessThan(cmds.indexOf('devices'));
	});

	it('tolerates a failing `start-server` and surfaces the real `devices` error', () => {
		const status = tryEnableAdbReverse({
			port: 5173,
			env: {},
			exec: adbStub((verb) => {
				if (verb === 'start-server') throw new Error('cannot bind 5037');
				if (verb === 'devices') throw new Error('spawn adb ENOENT');
				return '';
			}),
		});
		expect(status.succeeded).toBe(false);
		expect(status.error).toContain('adb not available');
	});

	it('sets up reverse mapping for a single connected emulator (start-server → devices → wait-for-device → reverse)', () => {
		const cmds: string[] = [];
		const status = tryEnableAdbReverse({
			port: 5173,
			env: {},
			exec: adbStub((verb) => {
				if (verb === 'devices') return 'List of devices attached\nemulator-5554\tdevice\n';
				return '';
			}, cmds),
		});
		expect(status.attempted).toBe(true);
		expect(status.succeeded).toBe(true);
		expect(status.devices).toEqual(['emulator-5554']);
		expect(cmds).toEqual(['start-server', 'devices', '-s emulator-5554 wait-for-device', '-s emulator-5554 reverse tcp:5173 tcp:5173']);
	});

	it('still maps the device when wait-for-device errors (non-fatal)', () => {
		const status = tryEnableAdbReverse({
			port: 5173,
			env: {},
			exec: adbStub((verb) => {
				if (verb === 'devices') return 'List of devices attached\nemulator-5554\tdevice\n';
				if (verb === 'wait-for-device') throw new Error('transient');
				return '';
			}),
		});
		expect(status.succeeded).toBe(true);
		expect(status.devices).toEqual(['emulator-5554']);
	});

	it('scopes to NS_DEVICE_SERIAL and skips `adb devices` enumeration', () => {
		const cmds: string[] = [];
		const status = tryEnableAdbReverse({
			port: 5173,
			env: { NS_DEVICE_SERIAL: 'emulator-5556' },
			exec: adbStub(() => '', cmds),
		});
		expect(status.succeeded).toBe(true);
		expect(status.devices).toEqual(['emulator-5556']);
		expect(cmds).not.toContain('devices');
		expect(cmds).toEqual(['start-server', '-s emulator-5556 wait-for-device', '-s emulator-5556 reverse tcp:5173 tcp:5173']);
	});

	it('applies the reverse to EVERY connected device (multi-device dev setup)', () => {
		const cmds: string[] = [];
		const status = tryEnableAdbReverse({
			port: 5173,
			env: {},
			exec: adbStub((verb) => {
				if (verb === 'devices') return ['List of devices attached', 'emulator-5554\tdevice', 'ABCDEF12\tdevice', ''].join('\n');
				return '';
			}, cmds),
		});
		expect(status.succeeded).toBe(true);
		expect(status.devices).toEqual(['emulator-5554', 'ABCDEF12']);
		expect(cmds).toContain('-s emulator-5554 reverse tcp:5173 tcp:5173');
		expect(cmds).toContain('-s ABCDEF12 reverse tcp:5173 tcp:5173');
	});

	it('counts the call as a success when at least one device accepts the mapping', () => {
		const status = tryEnableAdbReverse({
			port: 5173,
			env: {},
			exec: adbStub((verb, args) => {
				if (verb === 'devices') return ['List of devices attached', 'goodsim\tdevice', 'badsim\tdevice', ''].join('\n');
				if (verb === 'reverse' && args.includes('badsim')) throw new Error('device disconnected during reverse');
				return '';
			}),
		});
		expect(status.succeeded).toBe(true);
		expect(status.devices).toEqual(['goodsim']);
	});

	it('skips non-`device` entries in `adb devices` (unauthorized, offline, recovery)', () => {
		const cmds: string[] = [];
		const status = tryEnableAdbReverse({
			port: 5173,
			env: {},
			exec: adbStub((verb) => {
				if (verb === 'devices') return ['List of devices attached', 'emulator-5554\tdevice', 'physical-phone\tunauthorized', 'offline-emu\toffline', 'recovery-device\trecovery', ''].join('\n');
				return '';
			}, cmds),
		});
		expect(status.devices).toEqual(['emulator-5554']);
		// Should only have called reverse for the one valid device.
		expect(cmds.filter((c) => c.includes('reverse'))).toEqual(['-s emulator-5554 reverse tcp:5173 tcp:5173']);
	});

	it('skips ADB daemon startup chatter prefixed with `*`', () => {
		// `adb devices` on a cold daemon often prints:
		//   * daemon not running; starting now at tcp:5037
		//   * daemon started successfully
		//   List of devices attached
		//   emulator-5554\tdevice
		const status = tryEnableAdbReverse({
			port: 5173,
			env: {},
			exec: adbStub((verb) => {
				if (verb === 'devices') return ['* daemon not running; starting now at tcp:5037', '* daemon started successfully', 'List of devices attached', 'emulator-5554\tdevice', ''].join('\n');
				return '';
			}),
		});
		expect(status.succeeded).toBe(true);
		expect(status.devices).toEqual(['emulator-5554']);
	});

	it('caches its decision per-port so repeat callers do not fork extra subprocesses', () => {
		let execCalls = 0;
		const exec = adbStub((verb) => {
			if (verb === 'devices') return 'List of devices attached\nemulator-5554\tdevice\n';
			return '';
		});
		const counting = (adbPath: string, args: string[]) => {
			execCalls++;
			return exec(adbPath, args);
		};
		const first = tryEnableAdbReverse({ port: 5173, env: {}, exec: counting });
		const second = tryEnableAdbReverse({ port: 5173, env: {}, exec: counting });
		expect(first).toEqual(second);
		// start-server + devices + wait-for-device + reverse = 4 calls on
		// the first invocation, ZERO on the second.
		expect(execCalls).toBe(4);
	});

	it('keeps separate cache entries per port (dev server restart on a new port reattempts)', () => {
		let execCalls = 0;
		const exec = adbStub((verb) => {
			if (verb === 'devices') return 'List of devices attached\nemulator-5554\tdevice\n';
			return '';
		});
		const counting = (adbPath: string, args: string[]) => {
			execCalls++;
			return exec(adbPath, args);
		};
		tryEnableAdbReverse({ port: 5173, env: {}, exec: counting });
		tryEnableAdbReverse({ port: 5174, env: {}, exec: counting });
		// Each port runs its own start-server + devices + wait-for-device
		// + reverse — 8 calls total.
		expect(execCalls).toBe(8);
	});
});

describe('resolveDeviceReachableHost — adb-reverse path', () => {
	beforeEach(() => {
		__resetAdbReverseCacheForTests();
	});

	it('Android wildcard + port + working adb → emits 127.0.0.1 (IPv4 literal, avoids API-36+ resolver bug)', () => {
		// We emit the literal IPv4 instead of `localhost` because
		// recent Android system images (API 36+) periodically ship
		// without a `localhost` entry in the resolver, and the
		// HttpURLConnection path then throws
		// `UnknownHostException: No address associated with hostname`
		// BEFORE adb-reverse can intercept the loopback connect.
		// `127.0.0.1` bypasses DNS entirely.
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: {},
			port: 5173,
			adbExec: adbStub((verb) => {
				if (verb === 'devices') return 'List of devices attached\nemulator-5554\tdevice\n';
				return '';
			}),
		});
		expect(r.host).toBe('127.0.0.1');
		expect(r.source).toBe('adb-reverse');
	});

	it('Android loopback + port + working adb → still emits 127.0.0.1 (adb-reverse, not passthrough)', () => {
		const r = resolveDeviceReachableHost({
			host: 'localhost',
			platform: 'android',
			env: {},
			port: 5173,
			adbExec: adbStub((verb) => {
				if (verb === 'devices') return 'List of devices attached\nemulator-5554\tdevice\n';
				return '';
			}),
		});
		expect(r.host).toBe('127.0.0.1');
		expect(r.source).toBe('adb-reverse');
	});

	it('Android wildcard + port + failing adb → falls back to 10.0.2.2', () => {
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: {},
			port: 5173,
			adbExec: () => {
				throw new Error('spawn adb ENOENT');
			},
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
	});

	it('Android wildcard + port + NS_HMR_NO_ADB_REVERSE → falls back to 10.0.2.2 without calling adb', () => {
		let execCalls = 0;
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: { NS_HMR_NO_ADB_REVERSE: '1' },
			port: 5173,
			adbExec: () => {
				execCalls++;
				return '';
			},
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
		expect(execCalls).toBe(0);
	});

	it('NS_HMR_PREFER_LAN_HOST=1 outranks adb-reverse so users opting into LAN routing get LAN routing', () => {
		let execCalls = 0;
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: { NS_HMR_PREFER_LAN_HOST: '1' },
			port: 5173,
			lanHostResolver: () => '192.168.1.42',
			adbExec: () => {
				execCalls++;
				return 'List of devices attached\nemulator-5554\tdevice\n';
			},
		});
		expect(r.host).toBe('192.168.1.42');
		expect(r.source).toBe('lan');
		// adb subprocess should NOT have been invoked.
		expect(execCalls).toBe(0);
	});

	it('NS_HMR_HOST still outranks adb-reverse', () => {
		let execCalls = 0;
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: { NS_HMR_HOST: 'tunnel.example.com' },
			port: 5173,
			adbExec: () => {
				execCalls++;
				return '';
			},
		});
		expect(r.host).toBe('tunnel.example.com');
		expect(r.source).toBe('env');
		expect(execCalls).toBe(0);
	});

	it('iOS wildcard + port: adb-reverse is Android-only (iOS continues to emit localhost via platform-default)', () => {
		let execCalls = 0;
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'ios',
			env: {},
			port: 5173,
			adbExec: () => {
				execCalls++;
				return '';
			},
		});
		expect(r.host).toBe('localhost');
		expect(r.source).toBe('platform-default');
		expect(execCalls).toBe(0);
	});

	it('Android wildcard WITHOUT port → legacy behavior (no adb attempted, emits 10.0.2.2)', () => {
		// Older callers that don't pass `port` keep getting the
		// pre-adb behavior. This keeps backward compatibility for
		// the few fixtures and any third-party plugins that built
		// against the older API.
		let execCalls = 0;
		const r = resolveDeviceReachableHost({
			host: '0.0.0.0',
			platform: 'android',
			env: {},
			adbExec: () => {
				execCalls++;
				return '';
			},
		});
		expect(r.host).toBe('10.0.2.2');
		expect(r.source).toBe('platform-default');
		expect(execCalls).toBe(0);
	});
});

describe('resolveDeviceReachableOrigin — adb-reverse threaded through', () => {
	beforeEach(() => {
		__resetAdbReverseCacheForTests();
	});

	it('Android wildcard + port + working adb → http://127.0.0.1:5173', () => {
		const r = resolveDeviceReachableOrigin({
			host: '0.0.0.0',
			platform: 'android',
			env: {},
			port: 5173,
			adbExec: adbStub((verb) => {
				if (verb === 'devices') return 'List of devices attached\nemulator-5554\tdevice\n';
				return '';
			}),
		});
		expect(r.origin).toBe('http://127.0.0.1:5173');
		expect(r.source).toBe('adb-reverse');
	});

	it('Android wildcard + port + failing adb → http://10.0.2.2:5173', () => {
		const r = resolveDeviceReachableOrigin({
			host: '0.0.0.0',
			platform: 'android',
			env: {},
			port: 5173,
			adbExec: () => {
				throw new Error('no adb on PATH');
			},
		});
		expect(r.origin).toBe('http://10.0.2.2:5173');
		expect(r.source).toBe('platform-default');
	});
});
