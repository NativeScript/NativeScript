import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Animation } from './index.ios';
import { ios as iosBackground } from '../styling/background';

function shadowLayer() {
	return { shadowPath: 'old-shadow', mask: null, addAnimationForKey: vi.fn() };
}

function animateSize(boxShadows: any[], layers: any[]) {
	const view = { style: { backgroundInternal: { getBoxShadows: () => boxShadows } } };
	const nativeView = {
		layer: { mask: null, cornerRadius: 0 },
		hasNonUniformBorder: false,
		outerShadowContainerLayer: { mask: null, sublayers: Object.assign([...layers], { count: layers.length }) },
	};
	const bounds = { origin: { x: 0, y: 0 }, size: { width: 100, height: 50 } };

	(Animation as any).animateNestedLayerSizeUsingBasicAnimation(nativeView, bounds, { target: view }, {}, {});

	return { view, bounds };
}

describe('iOS Animation size with box shadows', () => {
	beforeAll(() => {
		vi.stubGlobal('CAShapeLayer', class {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('animates each shadow layer to the paths of its own box shadow', () => {
		vi.spyOn(Animation as any, '_createBasicAnimation').mockImplementation((args: any) => args);
		const generate = vi.spyOn(iosBackground, 'generateShadowLayerPaths').mockImplementation((_view, boxShadow: any) => ({ maskPath: `mask-${boxShadow.id}`, shadowPath: `shadow-${boxShadow.id}` }));
		const boxShadows = [{ id: 'a' }, { id: 'b' }];
		const layers = [shadowLayer(), shadowLayer()];

		const { view, bounds } = animateSize(boxShadows, layers);

		expect(generate.mock.calls).toEqual([
			[view, boxShadows[0], bounds],
			[view, boxShadows[1], bounds],
		]);
		expect(layers[0].addAnimationForKey.mock.calls[0][0].toValue).toBe('shadow-a');
		expect(layers[1].addAnimationForKey.mock.calls[0][0].toValue).toBe('shadow-b');
	});

	it('skips shadow layers that have no matching box shadow', () => {
		vi.spyOn(Animation as any, '_createBasicAnimation').mockImplementation((args: any) => args);
		const generate = vi.spyOn(iosBackground, 'generateShadowLayerPaths').mockImplementation(() => ({ maskPath: null, shadowPath: null }));
		const layers = [shadowLayer(), shadowLayer()];

		animateSize([{ id: 'a' }], layers);

		expect(generate).toHaveBeenCalledTimes(1);
		expect(layers[1].addAnimationForKey).not.toHaveBeenCalled();
	});
});
