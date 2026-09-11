import { describe, expect, it } from 'vitest';
import { assertPositiveInteger, getScaledDimensions, hammingDistance, normalizeFilters, normalizeFormat, normalizeQuality, normalizeTransformOptions, toImageMetadata } from './image-source-common';

describe('image-source-common', () => {
	describe('getScaledDimensions', () => {
		it('keeps images that already fit', () => {
			expect(getScaledDimensions(100, 50, 200)).toEqual({ width: 100, height: 50 });
		});

		it('bounds the longest edge and keeps the aspect ratio', () => {
			expect(getScaledDimensions(400, 200, 100)).toEqual({ width: 100, height: 50 });
			expect(getScaledDimensions(200, 400, 100)).toEqual({ width: 50, height: 100 });
		});
	});

	describe('normalizeQuality', () => {
		it('defaults to maximum quality', () => {
			expect(normalizeQuality(undefined)).toBe(100);
			expect(normalizeQuality(NaN)).toBe(100);
		});

		it('keeps zero and clamps out-of-range values', () => {
			expect(normalizeQuality(0)).toBe(0);
			expect(normalizeQuality(150)).toBe(100);
			expect(normalizeQuality(-5)).toBe(0);
			expect(normalizeQuality(72.6)).toBe(73);
		});
	});

	describe('normalizeFormat', () => {
		it('treats jpg and jpeg the same and everything else as png only when asked', () => {
			expect(normalizeFormat('jpg')).toBe('jpeg');
			expect(normalizeFormat('JPEG')).toBe('jpeg');
			expect(normalizeFormat('png')).toBe('png');
			expect(normalizeFormat('PNG')).toBe('png');
		});
	});

	describe('assertPositiveInteger', () => {
		it('rounds valid values and rejects the rest', () => {
			expect(assertPositiveInteger(10.4, 'x')).toBe(10);
			expect(() => assertPositiveInteger(0, 'maxSize')).toThrow(/maxSize/);
			expect(() => assertPositiveInteger(-1, 'x')).toThrow();
			expect(() => assertPositiveInteger(NaN, 'x')).toThrow();
		});
	});

	describe('normalizeFilters', () => {
		it('passes known filters through with only their numeric fields', () => {
			expect(normalizeFilters([{ type: 'grayscale' }, { type: 'brightness', amount: 0.5 }, { type: 'blur', radius: -3 }])).toEqual([{ type: 'grayscale' }, { type: 'brightness', amount: 0.5 }, { type: 'blur', radius: 0 }]);
		});

		it('rejects unknown filters and non-arrays', () => {
			expect(() => normalizeFilters([{ type: 'posterize' } as any])).toThrow(/posterize/);
			expect(() => normalizeFilters(null as any)).toThrow();
		});
	});

	describe('normalizeTransformOptions', () => {
		it('rounds the crop rect and defaults the resize mode', () => {
			expect(normalizeTransformOptions({ crop: { x: 1.4, y: 2.6, width: 10.2, height: 20.7 }, rotate: 90, flip: 'both', resize: { width: 30, height: 40 } })).toEqual({
				crop: { x: 1, y: 3, width: 10, height: 21 },
				rotate: 90,
				flip: 'both',
				resize: { width: 30, height: 40, mode: 'fit' },
			});
		});

		it('supports the maxSize resize form and validates sizes', () => {
			expect(normalizeTransformOptions({ resize: { maxSize: 100 } })).toEqual({ resize: { maxSize: 100 } });
			expect(() => normalizeTransformOptions({ crop: { x: 0, y: 0, width: 0, height: 10 } })).toThrow(/crop.width/);
			expect(() => normalizeTransformOptions(null)).toThrow();
		});
	});

	describe('toImageMetadata', () => {
		it('converts the native shape and drops missing optionals', () => {
			const metadata = toImageMetadata({ width: '10', height: 20, orientation: 6, hasAlpha: 0, dateTaken: 1700000000000, gps: { latitude: 1.5, longitude: -2.5 }, dpi: 72 });
			expect(metadata).toEqual({
				width: 10,
				height: 20,
				orientation: 6,
				hasAlpha: false,
				dpi: 72,
				dateTaken: new Date(1700000000000),
				gps: { latitude: 1.5, longitude: -2.5 },
			});
			expect(toImageMetadata(null)).toBeNull();
			expect(toImageMetadata({ width: 1, height: 1 }).orientation).toBe(1);
		});
	});

	describe('hammingDistance', () => {
		it('counts differing bits between two hex hashes', () => {
			expect(hammingDistance('0000000000000000', '0000000000000000')).toBe(0);
			expect(hammingDistance('0000000000000000', 'ffffffffffffffff')).toBe(64);
			expect(hammingDistance('000000000000000f', '0000000000000001')).toBe(3);
		});

		it('returns -1 for invalid input', () => {
			expect(hammingDistance('abc', '0000000000000000')).toBe(-1);
			expect(hammingDistance('zzzzzzzzzzzzzzzz', '0000000000000000')).toBe(-1);
			expect(hammingDistance(null, undefined)).toBe(-1);
		});
	});
});
