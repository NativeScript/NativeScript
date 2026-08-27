import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Crypto } from './index';

/** Runs `fn` and returns the single argument that reached a platform's native crypto shim. */
function captureNativeCall(shim: any, fn: () => void) {
	const spy = vi.spyOn(shim, 'getRandomValues');

	try {
		fn();
		expect(spy).toHaveBeenCalledTimes(1);

		return spy.mock.calls[0][0] as any;
	} finally {
		spy.mockRestore();
	}
}

const crypto = new Crypto();

describe('Crypto.getRandomValues', () => {
	it.each([
		['byte view', () => new Uint8Array(8)],
		['non-byte typed array', () => new Uint32Array(4)],
		['offset non-byte typed array', () => new Uint32Array(new ArrayBuffer(32), 8, 2)],
	])('returns the very %s it was handed', (_name, makeArray) => {
		const typedArray = makeArray();

		expect(crypto.getRandomValues(typedArray)).toBe(typedArray);
	});
});

describe('Crypto.getRandomValues (iOS)', () => {
	// The bytes belong to V8's BackingStore. freeWhenDone:NO is what keeps Foundation from
	// freeing an allocation that V8's ArrayBufferSweeper also frees.
	it('wraps the buffer without donating ownership to Foundation', () => {
		const bytes = new Uint8Array(16);
		const data = captureNativeCall((globalThis as any).NSCCrypto, () => crypto.getRandomValues(bytes));

		expect(data.selector).toBe('dataWithBytesNoCopyLengthFreeWhenDone');
		expect(data.args[0]).toBe(bytes);
		expect(data.args[1]).toBe(16);
		expect(data.args[2]).toBe(false);
	});

	it('wraps only the view window of an offset byte view', () => {
		const view = new Uint8Array(new ArrayBuffer(32), 4, 10);
		const data = captureNativeCall((globalThis as any).NSCCrypto, () => crypto.getRandomValues(view));

		expect(data.selector).toBe('dataWithBytesNoCopyLengthFreeWhenDone');
		expect(data.args[0]).toBe(view);
		expect(data.args[1]).toBe(10);
		expect(data.args[2]).toBe(false);
	});

	it('wraps only the view window of a non-byte typed array', () => {
		const buffer = new ArrayBuffer(32);
		const data = captureNativeCall((globalThis as any).NSCCrypto, () => crypto.getRandomValues(new Uint32Array(buffer, 8, 2)));
		const wrapped = data.args[0] as Uint8Array;

		expect(data.selector).toBe('dataWithBytesNoCopyLengthFreeWhenDone');
		expect(wrapped.buffer).toBe(buffer);
		expect(wrapped.byteOffset).toBe(8);
		expect(wrapped.byteLength).toBe(8);
		expect(data.args[1]).toBe(8);
		expect(data.args[2]).toBe(false);
	});
});

describe('Crypto.getRandomValues (Android)', () => {
	let previousAndroid: boolean;
	let previousIOS: boolean;

	beforeEach(() => {
		previousAndroid = (globalThis as any).__ANDROID__;
		previousIOS = (globalThis as any).__IOS__;
		(globalThis as any).__ANDROID__ = true;
		(globalThis as any).__IOS__ = false;
	});

	afterEach(() => {
		(globalThis as any).__ANDROID__ = previousAndroid;
		(globalThis as any).__IOS__ = previousIOS;
	});

	it('hands a byte view straight through', () => {
		const view = new Uint8Array(new ArrayBuffer(32), 4, 10);
		const bytes = captureNativeCall((globalThis as any).org.nativescript.winter_tc.Crypto, () => crypto.getRandomValues(view));

		expect(bytes).toBe(view);
	});

	// The runtime maps the view to a direct ByteBuffer over backingStore->Data() + byteOffset with
	// capacity byteLength, and the Java side fills the whole capacity — so a view any wider than
	// the caller's window overwrites bytes past it.
	it('reinterprets a non-byte typed array over its window only', () => {
		const buffer = new ArrayBuffer(32);
		const bytes = captureNativeCall((globalThis as any).org.nativescript.winter_tc.Crypto, () => crypto.getRandomValues(new Uint32Array(buffer, 8, 2)));

		expect(bytes.buffer).toBe(buffer);
		expect(bytes.byteOffset).toBe(8);
		expect(bytes.byteLength).toBe(8);
	});
});
