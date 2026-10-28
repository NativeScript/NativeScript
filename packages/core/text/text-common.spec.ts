import { describe, it, expect } from 'vitest';
import { TextDecoder, TextEncoder } from './text-common';

describe('TextDecoder', () => {
	const decoder = new TextDecoder();

	it('decodes an ArrayBuffer', () => {
		expect(decoder.decode(new Uint8Array([0x68, 0x69]).buffer)).toBe('hi');
	});

	it('decodes only the bytes inside a typed array view', () => {
		const bytes = new Uint8Array([0x78, 0x78, 0x68, 0x69, 0x78]);
		expect(decoder.decode(bytes.subarray(2, 4))).toBe('hi');
	});

	it('decodes only the bytes inside a DataView', () => {
		const bytes = new Uint8Array([0x78, 0x68, 0x69, 0x78]);
		expect(decoder.decode(new DataView(bytes.buffer, 1, 2))).toBe('hi');
	});

	it('round-trips multi-byte characters through TextEncoder', () => {
		const encoded = new TextEncoder().encode('héllo ✓');
		expect(decoder.decode(encoded)).toBe('héllo ✓');
	});

	it('rejects values that are not buffers', () => {
		expect(() => decoder.decode('abc' as any)).toThrow();
	});
});
