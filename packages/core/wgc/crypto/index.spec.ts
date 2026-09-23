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
	/** Runs `fn` and returns the arguments SecRandomCopyBytes received. */
	function captureSecRandom(fn: () => void) {
		const spy = vi.spyOn(globalThis as any, 'SecRandomCopyBytes');

		try {
			fn();
			expect(spy).toHaveBeenCalledTimes(1);

			return spy.mock.calls[0] as any[];
		} finally {
			spy.mockRestore();
		}
	}

	// The view itself goes to Security: the runtime resolves it to V8's backing store at the
	// view's byte offset, so the fill lands in the caller's array with nothing in between.
	it('hands a byte view straight to SecRandomCopyBytes and the bytes land in it', () => {
		const bytes = new Uint8Array(16);
		const [rnd, count, target] = captureSecRandom(() => crypto.getRandomValues(bytes));

		expect(rnd).toBe((globalThis as any).kSecRandomDefault);
		expect(count).toBe(16);
		expect(target).toBe(bytes);
		expect(Array.from(bytes)).toEqual(new Array(16).fill(0xab));
	});

	it('fills only the window of an offset byte view', () => {
		const buffer = new ArrayBuffer(32);
		const view = new Uint8Array(buffer, 4, 10);
		const [, count, target] = captureSecRandom(() => crypto.getRandomValues(view));

		expect(count).toBe(10);
		expect(target).toBe(view);
		const all = new Uint8Array(buffer);
		expect(Array.from(all.subarray(0, 4))).toEqual([0, 0, 0, 0]);
		expect(Array.from(all.subarray(4, 14))).toEqual(new Array(10).fill(0xab));
		expect(Array.from(all.subarray(14))).toEqual(new Array(18).fill(0));
	});

	it('reinterprets a non-byte typed array over its window only', () => {
		const buffer = new ArrayBuffer(32);
		const words = new Uint32Array(buffer, 8, 2);
		const [, count, target] = captureSecRandom(() => crypto.getRandomValues(words));

		expect(count).toBe(8);
		expect(target).toBeInstanceOf(Uint8Array);
		expect(target.buffer).toBe(buffer);
		expect(target.byteOffset).toBe(8);
		expect(target.byteLength).toBe(8);
		expect(Array.from(words)).toEqual([0xabababab, 0xabababab]);
	});

	it('throws when Security reports a failure', () => {
		const spy = vi.spyOn(globalThis as any, 'SecRandomCopyBytes').mockReturnValue(-50);

		try {
			expect(() => crypto.getRandomValues(new Uint8Array(8))).toThrow(/SecRandomCopyBytes failed \(-50\)/);
		} finally {
			spy.mockRestore();
		}
	});

	// NSMutableData copies bytes it does not own and frees ones it does, so no NSData wrapper
	// can ever alias V8's memory: the shim must not route through the framework at all.
	it('never wraps the bytes in NSData or calls the framework', () => {
		const crypto_ = vi.spyOn((globalThis as any).NSCCrypto, 'getRandomValues');
		const mutable = vi.spyOn((globalThis as any).NSMutableData, 'dataWithBytesNoCopyLengthFreeWhenDone');

		try {
			crypto.getRandomValues(new Uint8Array(8));
			expect(crypto_).not.toHaveBeenCalled();
			expect(mutable).not.toHaveBeenCalled();
		} finally {
			crypto_.mockRestore();
			mutable.mockRestore();
		}
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
