import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BOOT_RECORDING_VERSION, createBootRecorder, getBootRecordingFilePath, isPrefetchableBootPath, loadPersistedBootRecording, type BootRecorder } from './boot-recording.js';

describe('isPrefetchableBootPath', () => {
	it('accepts device module-loader routes', () => {
		expect(isPrefetchableBootPath('/ns/m/src/main')).toBe(true);
		expect(isPrefetchableBootPath('/ns/m/node_modules/rxjs/dist/esm/internal/Observable.js')).toBe(true);
		expect(isPrefetchableBootPath('/ns/rt')).toBe(true);
		expect(isPrefetchableBootPath('/ns/core')).toBe(true);
		expect(isPrefetchableBootPath('/ns/core/ui/frame')).toBe(true);
		expect(isPrefetchableBootPath('/ns/core-bundle.mjs')).toBe(true);
		expect(isPrefetchableBootPath('/ns/sfc/src/App.vue')).toBe(true);
		expect(isPrefetchableBootPath('/@nativescript/vendor.mjs')).toBe(true);
		expect(isPrefetchableBootPath('/__ns_dev__/client')).toBe(true);
	});

	it('rejects non-module and non-JS routes', () => {
		expect(isPrefetchableBootPath('/ns/import-map.json')).toBe(false);
		expect(isPrefetchableBootPath('/__ns_dev__/session')).toBe(false);
		expect(isPrefetchableBootPath('/__ns_dev__/boot-closure')).toBe(false);
		expect(isPrefetchableBootPath('/ns/m/src/app.css')).toBe(false);
		expect(isPrefetchableBootPath('/ns/m/src/assets/logo.png')).toBe(false);
		expect(isPrefetchableBootPath('/assets/font.woff2')).toBe(false);
		expect(isPrefetchableBootPath('')).toBe(false);
		expect(isPrefetchableBootPath('not-absolute')).toBe(false);
	});

	it('ignores query strings when checking extensions', () => {
		expect(isPrefetchableBootPath('/ns/m/src/main?import')).toBe(true);
		expect(isPrefetchableBootPath('/ns/m/src/app.css?inline')).toBe(false);
	});

	it('rejects volatile ?t= cache-busted URLs (never byte-identical on the next boot)', () => {
		expect(isPrefetchableBootPath('/ns/m/src/app/foo/@ng/component?c=src%2Fapp%2Ffoo.ts%40FooComponent&t=1783187007461')).toBe(false);
		expect(isPrefetchableBootPath('/ns/m/src/main?t=1783187007461')).toBe(false);
		expect(isPrefetchableBootPath('/ns/m/src/app/foo/@ng/component?c=src%2Fapp%2Ffoo.ts%40FooComponent')).toBe(true);
		// A non-numeric or embedded 't' is not the volatile param.
		expect(isPrefetchableBootPath('/ns/m/src/main?target=x')).toBe(true);
	});
});

type FakeTimer = { handler: () => void; ms: number; cleared: boolean };

function createFakeClock() {
	let nowMs = 1000;
	const timers: FakeTimer[] = [];
	return {
		now: () => nowMs,
		advance: (ms: number) => {
			nowMs += ms;
		},
		setTimer: (handler: () => void, ms: number) => {
			const timer: FakeTimer = { handler, ms, cleared: false };
			timers.push(timer);
			return timer;
		},
		clearTimer: (handle: unknown) => {
			if (handle) (handle as FakeTimer).cleared = true;
		},
		fireIdle: () => {
			// Fire the most recently armed, uncleared timer (idle close).
			for (let i = timers.length - 1; i >= 0; i--) {
				if (!timers[i].cleared) {
					timers[i].cleared = true;
					timers[i].handler();
					return;
				}
			}
		},
	};
}

describe('createBootRecorder', () => {
	let clock: ReturnType<typeof createFakeClock>;
	let recorder: BootRecorder;

	const make = (overrides: Partial<Parameters<typeof createBootRecorder>[0]> = {}) =>
		createBootRecorder({
			platform: 'ios',
			flavor: 'angular',
			projectRoot: '/tmp/nonexistent-project',
			persist: false,
			minEntries: 2,
			now: clock.now,
			setTimer: clock.setTimer,
			clearTimer: clock.clearTimer,
			...overrides,
		});

	beforeEach(() => {
		clock = createFakeClock();
		recorder = make();
	});

	it('returns null before a boot signal opens a session', () => {
		expect(recorder.noteRequest('/ns/m/src/main')).toBeNull();
		expect(recorder.getRecordedPaths()).toBeNull();
	});

	it('records 2xx completions in request order after a boot signal', () => {
		expect(recorder.noteRequest('/__ns_dev__/session')).toBeNull();
		const a = recorder.noteRequest('/ns/m/src/main');
		const b = recorder.noteRequest('/ns/m/node_modules/rxjs/dist/esm/index.js');
		a?.(200);
		b?.(200);
		clock.fireIdle();
		expect(recorder.getRecordedPaths()).toEqual(['/ns/m/src/main', '/ns/m/node_modules/rxjs/dist/esm/index.js']);
	});

	it('skips non-2xx completions and duplicate URLs', () => {
		recorder.noteRequest('/__ns_dev__/boot-closure');
		recorder.noteRequest('/ns/m/src/gone')?.(404);
		recorder.noteRequest('/ns/m/src/main')?.(200);
		recorder.noteRequest('/ns/m/src/main')?.(200);
		recorder.noteRequest('/ns/rt')?.(200);
		clock.fireIdle();
		expect(recorder.getRecordedPaths()).toEqual(['/ns/m/src/main', '/ns/rt']);
	});

	it('is idempotent per finish callback (finish + close both fire)', () => {
		recorder.noteRequest('/__ns_dev__/session');
		const finish = recorder.noteRequest('/ns/m/src/main');
		finish?.(200);
		finish?.(200);
		recorder.noteRequest('/ns/core')?.(200);
		clock.fireIdle();
		expect(recorder.getRecordedPaths()).toEqual(['/ns/m/src/main', '/ns/core']);
	});

	it('discards windows below minEntries', () => {
		recorder.noteRequest('/__ns_dev__/session');
		recorder.noteRequest('/ns/m/src/main')?.(200);
		clock.fireIdle();
		expect(recorder.getRecordedPaths()).toBeNull();
	});

	it('a new boot signal closes and persists the previous window first', () => {
		recorder.noteRequest('/__ns_dev__/session');
		recorder.noteRequest('/ns/m/src/a')?.(200);
		recorder.noteRequest('/ns/m/src/b')?.(200);
		// Fast restart before the idle window elapsed:
		recorder.noteRequest('/__ns_dev__/session');
		expect(recorder.getRecordedPaths()).toEqual(['/ns/m/src/a', '/ns/m/src/b']);
		// The new window replaces it once it closes with enough entries.
		recorder.noteRequest('/ns/m/src/c')?.(200);
		recorder.noteRequest('/ns/m/src/d')?.(200);
		recorder.noteRequest('/ns/m/src/e')?.(200);
		clock.fireIdle();
		expect(recorder.getRecordedPaths()).toEqual(['/ns/m/src/c', '/ns/m/src/d', '/ns/m/src/e']);
	});

	it('seedActiveSession pre-populates the window (archive-served bodies)', () => {
		recorder.noteRequest('/__ns_dev__/boot-archive');
		recorder.seedActiveSession(['/ns/m/src/main', '/ns/core-bundle.mjs']);
		// A straggler miss recorded after the seed appends, deduped.
		recorder.noteRequest('/ns/m/src/main')?.(200);
		recorder.noteRequest('/ns/m/src/late')?.(200);
		clock.fireIdle();
		expect(recorder.getRecordedPaths()).toEqual(['/ns/m/src/main', '/ns/core-bundle.mjs', '/ns/m/src/late']);
	});

	it('caps recordings at maxEntries', () => {
		recorder = make({ maxEntries: 3 });
		recorder.noteRequest('/__ns_dev__/session');
		for (let i = 0; i < 5; i++) {
			recorder.noteRequest(`/ns/m/src/mod-${i}`)?.(200);
		}
		clock.fireIdle();
		expect(recorder.getRecordedPaths()).toHaveLength(3);
	});
});

describe('boot recording persistence', () => {
	let projectRoot: string;

	beforeEach(() => {
		projectRoot = mkdtempSync(path.join(tmpdir(), 'ns-boot-rec-'));
	});

	afterEach(() => {
		rmSync(projectRoot, { recursive: true, force: true });
	});

	it('persists closed windows and reloads them in a fresh recorder', () => {
		const clock = createFakeClock();
		const recorder = createBootRecorder({ platform: 'ios', flavor: 'angular', projectRoot, minEntries: 1, now: clock.now, setTimer: clock.setTimer, clearTimer: clock.clearTimer });
		recorder.noteRequest('/__ns_dev__/session');
		recorder.noteRequest('/ns/m/src/main')?.(200);
		clock.fireIdle();

		const file = getBootRecordingFilePath(projectRoot, 'ios', 'angular');
		const parsed = JSON.parse(readFileSync(file, 'utf-8'));
		expect(parsed.version).toBe(BOOT_RECORDING_VERSION);
		expect(parsed.paths).toEqual(['/ns/m/src/main']);

		const fresh = createBootRecorder({ platform: 'ios', flavor: 'angular', projectRoot, now: clock.now, setTimer: clock.setTimer, clearTimer: clock.clearTimer });
		expect(fresh.getRecordedPaths()).toEqual(['/ns/m/src/main']);
	});

	it('rejects mismatched platform/flavor/version recordings', () => {
		const file = getBootRecordingFilePath(projectRoot, 'ios', 'angular');
		mkdirSync(path.dirname(file), { recursive: true });
		writeFileSync(file, JSON.stringify({ version: BOOT_RECORDING_VERSION, platform: 'android', flavor: 'angular', paths: ['/ns/m/src/main'] }));
		expect(loadPersistedBootRecording(projectRoot, 'ios', 'angular')).toBeNull();

		writeFileSync(file, JSON.stringify({ version: 999, platform: 'ios', flavor: 'angular', paths: ['/ns/m/src/main'] }));
		expect(loadPersistedBootRecording(projectRoot, 'ios', 'angular')).toBeNull();

		writeFileSync(file, 'not json');
		expect(loadPersistedBootRecording(projectRoot, 'ios', 'angular')).toBeNull();

		expect(existsSync(file)).toBe(true);
	});
});
