import { minTrackGradientProperty, maxTrackGradientProperty } from '../ui/slider/slider-common';

describe('Slider gradient properties (unit)', () => {
	test('minTrackGradientProperty is exported', () => {
		expect(minTrackGradientProperty).toBeDefined();
		expect(minTrackGradientProperty.name).toBe('minTrackGradient');
	});

	test('maxTrackGradientProperty is exported', () => {
		expect(maxTrackGradientProperty).toBeDefined();
		expect(maxTrackGradientProperty.name).toBe('maxTrackGradient');
	});
});
