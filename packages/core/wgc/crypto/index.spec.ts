import { describe, it, expect, vi } from 'vitest';
import { Crypto } from './index';

/** Runs `fn` and returns the NSMutableData stub that reached the native crypto shim. */
function captureNativeData(fn: () => void) {
	const spy = vi.spyOn((globalThis as any).NSCCrypto, 'getRandomValues');

	try {
		fn();
		expect(spy).toHaveBeenCalledTimes(1);

		return spy.mock.calls[0][0] as unknown as { selector: string; args: any[] };
	} finally {
		spy.mockRestore();
	}
}

describe('Crypto.getRandomValues (iOS)', () => {
	const crypto = new Crypto();

	// The bytes belong to V8's BackingStore. freeWhenDone:NO is what keeps Foundation from
	// freeing an allocation that V8's ArrayBufferSweeper also frees.
	it('wraps the buffer without donating ownership to Foundation', () => {
		const bytes = new Uint8Array(16);
		const data = captureNativeData(() => crypto.getRandomValues(bytes));

		expect(data.selector).toBe('dataWithBytesNoCopyLengthFreeWhenDone');
		expect(data.args[0]).toBe(bytes);
		expect(data.args[1]).toBe(16);
		expect(data.args[2]).toBe(false);
	});

	it('wraps only the view window of an offset byte view', () => {
		const view = new Uint8Array(new ArrayBuffer(32), 4, 10);
		const data = captureNativeData(() => crypto.getRandomValues(view));

		expect(data.selector).toBe('dataWithBytesNoCopyLengthFreeWhenDone');
		expect(data.args[0]).toBe(view);
		expect(data.args[1]).toBe(10);
		expect(data.args[2]).toBe(false);
	});

	it('wraps only the view window of a non-byte typed array', () => {
		const buffer = new ArrayBuffer(32);
		const data = captureNativeData(() => crypto.getRandomValues(new Uint32Array(buffer, 8, 2)));
		const wrapped = data.args[0] as Uint8Array;

		expect(data.selector).toBe('dataWithBytesNoCopyLengthFreeWhenDone');
		expect(wrapped.buffer).toBe(buffer);
		expect(wrapped.byteOffset).toBe(8);
		expect(wrapped.byteLength).toBe(8);
		expect(data.args[1]).toBe(8);
		expect(data.args[2]).toBe(false);
	});
});
