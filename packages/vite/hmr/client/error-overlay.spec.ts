import { describe, expect, it } from 'vitest';
import { describeRuntimeError, describeServerError, deviceModuleUrlsInStack, formatErrorLocation, stripAnsi } from './error-overlay.js';

const ORIGIN = 'http://192.168.1.5:5173';

describe('formatErrorLocation', () => {
	it('shows a file under the root relative to it, with line and column', () => {
		expect(formatErrorLocation({ id: '/repo/app/src/a.ts', loc: { file: '/repo/app/src/a.ts', line: 3, column: 7 } }, '/repo/app/')).toBe('src/a.ts:3:7');
	});

	it('shows a file outside the root, or without a known root, as given', () => {
		expect(formatErrorLocation({ loc: { file: '/repo/lib/b.ts', line: 1, column: 0 } }, '/repo/app')).toBe('/repo/lib/b.ts:1:0');
		expect(formatErrorLocation({ id: '/repo/app/src/a.ts' }, undefined)).toBe('/repo/app/src/a.ts');
	});

	it('falls back to the module id when the location has no file, and is empty without either', () => {
		expect(formatErrorLocation({ id: 'C:\\repo\\app\\src\\a.ts', loc: { line: 2, column: 1 } }, 'C:/repo/app')).toBe('src/a.ts:2:1');
		expect(formatErrorLocation({}, '/repo/app')).toBeUndefined();
	});
});

describe('describeServerError', () => {
	it('puts the location above the message, strips ANSI escapes and keeps the frame apart', () => {
		const text = describeServerError({ message: '\u001b[31mUnexpected token\u001b[39m', stack: 'server', id: '/r/src/a.ts', frame: '\n\u001b[33m1 | x(\u001b[39m\n  |   ^\n', loc: { file: '/r/src/a.ts', line: 1, column: 2 } }, '/r');
		expect(text).toEqual({ detail: 'src/a.ts:1:2\nUnexpected token', code: '1 | x(\n  |   ^' });
	});

	it('omits the code block without a frame and caps a long message', () => {
		const message = Array.from({ length: 10 }, (_, i) => `line ${i}`).join('\n');
		const text = describeServerError({ message, stack: '' }, undefined);
		expect(text.code).toBeUndefined();
		expect(text.detail.split('\n')).toEqual(['line 0', 'line 1', 'line 2', 'line 3', 'line 4', 'line 5', '…']);
	});
});

describe('describeRuntimeError', () => {
	it('lists the stack frames with device URLs shortened to their Vite URL', () => {
		const err = new Error('boom');
		err.stack = `Error: boom\n    at f (${ORIGIN}/ns/v/src/a.ts?t=1:2:3)\n    at ${ORIGIN}/ns/v/src/main.ts?t=1:9:1`;
		expect(describeRuntimeError(err, ORIGIN)).toEqual({ detail: 'boom', code: 'at f (/src/a.ts?t=1:2:3)\nat /src/main.ts?t=1:9:1' });
	});

	it('handles a thrown non-Error', () => {
		expect(describeRuntimeError('plain', ORIGIN)).toEqual({ detail: 'plain' });
	});
});

describe('deviceModuleUrlsInStack', () => {
	it('collects each device module URL once, without its line and column, keeping the query', () => {
		const stack = [`Error: x`, `    at f (${ORIGIN}/ns/v/src/a.ts?t=1:2:3)`, `    at ${ORIGIN}/ns/v/src/a.ts?t=1:8:1`, `    at g (${ORIGIN}/ns/v/src/b.vue?vue&type=script:4)`, `    at h (http://other:1/ns/v/src/c.ts:1:1)`, `    at native`].join('\n');
		expect(deviceModuleUrlsInStack(stack, ORIGIN)).toEqual([`${ORIGIN}/ns/v/src/a.ts?t=1`, `${ORIGIN}/ns/v/src/b.vue?vue&type=script`]);
	});

	it('is empty for a missing stack', () => {
		expect(deviceModuleUrlsInStack(undefined, ORIGIN)).toEqual([]);
	});
});

describe('stripAnsi', () => {
	it('removes color and hyperlink sequences', () => {
		expect(stripAnsi('\u001b[1m\u001b[31mred\u001b[39m\u001b[22m \u001b]8;;http://x\u0007link\u001b]8;;\u0007')).toBe('red link');
	});
});
