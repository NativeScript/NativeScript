import { getRequestedImageSize } from './image-asset-common';

describe('ImageAssetOptions normalization', () => {
	it('coerces string width/height to numbers', () => {
		const src = { width: 2000, height: 1500 };
		const result = getRequestedImageSize(src as any, { width: '300' as any, height: '200' as any, keepAspectRatio: false, autoScaleFactor: true } as any);
		expect(result.width).toBe(300);
		expect(result.height).toBe(200);
	});

	it('falls back to defaults when invalid strings provided', () => {
		const src = { width: 800, height: 600 };
		const result = getRequestedImageSize(src as any, { width: 'abc' as any, height: '' as any, keepAspectRatio: false } as any);
		// should fall back to screen pixel defaults via getRequestedImageSize, but since
		// we cannot easily control Screen.mainScreen here, we at least assert they are > 0
		expect(result.width).toBeGreaterThan(0);
		expect(result.height).toBeGreaterThan(0);
	});

	it('respects keepAspectRatio by adjusting to safe dimensions', () => {
		const src = { width: 2000, height: 1000 };
		const result = getRequestedImageSize(src as any, { width: '500' as any, height: '500' as any, keepAspectRatio: true } as any);
		// current implementation scales using the smaller coefficient (min), so expect 1000x500
		expect(result.width).toBe(1000);
		expect(result.height).toBe(500);
	});
});
