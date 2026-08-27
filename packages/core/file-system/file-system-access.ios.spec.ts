import { describe, it, expect } from 'vitest';
import { FileSystemAccess } from './file-system-access.ios';

function getBuffer(buffer: any) {
	return FileSystemAccess.getBuffer(buffer) as unknown as { selector: string; args: any[] };
}

// Views reach the runtime's pointer marshalling as backingStore->Data() + byteOffset, so the
// view can be handed straight to a copying selector. Wrapping their bytes no-copy would hand
// Foundation memory V8 owns, and at a non-zero offset a pointer that is not a chunk start.
const views: [string, () => ArrayBufferView][] = [
	['Uint8Array', () => new Uint8Array(new ArrayBuffer(16))],
	['offset Uint8Array', () => new Uint8Array(new ArrayBuffer(32), 4, 10)],
	['offset Uint8ClampedArray', () => new Uint8ClampedArray(new ArrayBuffer(32), 4, 10)],
	['offset DataView', () => new DataView(new ArrayBuffer(32), 4, 10)],
];

describe('FileSystemAccess.getBuffer (iOS)', () => {
	it('copies a whole ArrayBuffer', () => {
		const buffer = new ArrayBuffer(8);
		const data = getBuffer(buffer);

		expect(data.selector).toBe('dataWithData');
		expect(data.args[0]).toBe(buffer);
	});

	it.each(views)('passes an %s itself and copies only its window', (_name, makeView) => {
		const view = makeView();
		const data = getBuffer(view);

		expect(data.selector).toBe('dataWithBytesLength');
		expect(data.args[0]).toBe(view);
		expect(data.args[1]).toBe(view.byteLength);
	});
});
