import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Label } from '../label';
import { Color } from '../../color';

function onAndroid(): void {
	let previousApple: boolean;
	let previousIOS: boolean;
	let previousAndroid: boolean;

	beforeEach(() => {
		previousApple = (globalThis as any).__APPLE__;
		previousIOS = (globalThis as any).__IOS__;
		previousAndroid = (globalThis as any).__ANDROID__;
		(globalThis as any).__APPLE__ = false;
		(globalThis as any).__IOS__ = false;
		(globalThis as any).__ANDROID__ = true;
	});

	afterEach(() => {
		(globalThis as any).__APPLE__ = previousApple;
		(globalThis as any).__IOS__ = previousIOS;
		(globalThis as any).__ANDROID__ = previousAndroid;
	});
}

describe('border-color shorthand', () => {
	it('applies a function color with nested arguments to all sides', () => {
		const label = new Label();
		label.style.borderColor = 'color-mix(in srgb, red 50%, blue)' as any;

		const expected = new Color('color-mix(in srgb, red 50%, blue)');
		expect(label.style.borderTopColor).toEqual(expected);
		expect(label.style.borderRightColor).toEqual(expected);
		expect(label.style.borderBottomColor).toEqual(expected);
		expect(label.style.borderLeftColor).toEqual(expected);
	});

	it('splits per-side colors around function values', () => {
		const label = new Label();
		label.style.borderColor = 'red rgb(1, 2, 3) blue color-mix(in srgb, red 35%, blue)' as any;

		expect(label.style.borderTopColor).toEqual(new Color('red'));
		expect(label.style.borderRightColor).toEqual(new Color('rgb(1, 2, 3)'));
		expect(label.style.borderBottomColor).toEqual(new Color('blue'));
		expect(label.style.borderLeftColor).toEqual(new Color('color-mix(in srgb, red 35%, blue)'));
	});

	it('still accepts comma-separated colors', () => {
		const label = new Label();
		label.style.borderColor = 'red,blue' as any;

		expect(label.style.borderTopColor).toEqual(new Color('red'));
		expect(label.style.borderBottomColor).toEqual(new Color('red'));
		expect(label.style.borderRightColor).toEqual(new Color('blue'));
		expect(label.style.borderLeftColor).toEqual(new Color('blue'));
	});
});

describe('corner-shape', () => {
	it('defaults to round', () => {
		const label = new Label();

		expect(label.style.cornerShape).toBe('round');
		expect(label.style.backgroundInternal.cornerShape).toBe('round');
	});

	it('accepts squircle and reaches the background', () => {
		const label = new Label();
		label.style.cornerShape = 'squircle';

		expect(label.style.backgroundInternal.cornerShape).toBe('squircle');

		label.style.cornerShape = 'round';

		expect(label.style.backgroundInternal.cornerShape).toBe('round');
	});

	it('rejects unknown keywords', () => {
		const label = new Label();

		expect(() => (label.style.cornerShape = 'bevel' as any)).toThrow();
	});

	it('accepts continuous on Apple platforms', () => {
		const label = new Label();
		label.style.cornerShape = 'continuous';

		expect(label.style.backgroundInternal.cornerShape).toBe('continuous');
	});
});

describe('-ios-corner-shape', () => {
	it('sets corner-shape and reads it back', () => {
		const label = new Label();
		label.style.iosCornerShape = 'continuous';

		expect(label.style.cornerShape).toBe('continuous');
		expect(label.style.iosCornerShape).toBe('continuous');
		expect(label.style.backgroundInternal.cornerShape).toBe('continuous');
	});

	it('rejects unknown keywords', () => {
		const label = new Label();

		expect(() => (label.style.iosCornerShape = 'bevel' as any)).toThrow();
	});
});

describe('corner-shape on Android', () => {
	onAndroid();

	it('keeps the spec grammar', () => {
		const label = new Label();

		expect(() => (label.style.cornerShape = 'continuous')).toThrow();
		label.style.cornerShape = 'squircle';
		expect(label.style.backgroundInternal.cornerShape).toBe('squircle');
	});

	it('ignores -ios-corner-shape', () => {
		const label = new Label();
		label.style.iosCornerShape = 'continuous';

		expect(label.style.cornerShape).toBe('round');
		expect(label.style.iosCornerShape).toBe('round');
		expect(label.style.backgroundInternal.cornerShape).toBe('round');
	});
});
