import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import * as sliderTestsNative from './slider-tests-native';
import { Observable, Color } from '@nativescript/core';
import { LinearGradient } from '@nativescript/core/ui/styling/linear-gradient';
import { Slider } from '@nativescript/core/ui/slider';

export function test_linear_gradient_layer_structure() {
	const slider = new Slider();

	function testAction() {
		// Create a test gradient
		const gradient = new LinearGradient();
		gradient.angle = 90;
		gradient.colorStops = [
			{ color: new Color('#FF0000'), offset: { unit: '%', value: 0 } },
			{ color: new Color('#00FF00'), offset: { unit: '%', value: 50 } },
			{ color: new Color('#0000FF'), offset: { unit: '%', value: 100 } },
		];

		// Set the gradient
		slider.minTrackGradient = gradient;

		// Get native drawables
		const nativeProgress = sliderTestsNative.getNativeProgressDrawable(slider);

		if (__ANDROID__) {
			// Test Android layer structure
			TKUnit.assertTrue(nativeProgress instanceof android.graphics.drawable.LayerDrawable, 'Progress drawable should be a LayerDrawable');

			const layerDrawable = nativeProgress as android.graphics.drawable.LayerDrawable;
			TKUnit.assertEqual(layerDrawable.getNumberOfLayers(), 3, 'LayerDrawable should have 3 layers');

			// Test that our gradient layer is in the correct position (progress layer)
			const progressLayer = layerDrawable.getDrawable(layerDrawable.findIndexByLayerId(android.R.id.progress));
			TKUnit.assertTrue(progressLayer instanceof org.nativescript.widgets.LinearGradientDefinition || progressLayer instanceof android.graphics.drawable.ShapeDrawable, 'Progress layer should be a gradient drawable');
		} else if (__IOS__) {
			// Test iOS layer structure
			TKUnit.assertNotNull(nativeProgress, 'Progress image should not be null');
			TKUnit.assertTrue(nativeProgress instanceof UIImage, 'Progress drawable should be a UIImage');
		}
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_gradient_angle_mapping() {
	const slider = new Slider();

	function testAction() {
		const angles = [0, 90, 180, 270];

		angles.forEach((angle) => {
			const gradient = new LinearGradient();
			gradient.angle = angle;
			gradient.colorStops = [{ color: new Color('#FF0000') }, { color: new Color('#0000FF') }];

			slider.minTrackGradient = gradient;
			const nativeProgress = sliderTestsNative.getNativeProgressDrawable(slider);

			if (__ANDROID__) {
				const layerDrawable = nativeProgress as android.graphics.drawable.LayerDrawable;
				const progressLayer = layerDrawable.getDrawable(layerDrawable.findIndexByLayerId(android.R.id.progress));

				// Verify the angle is correctly mapped to the native gradient
				if (progressLayer instanceof org.nativescript.widgets.LinearGradientDefinition) {
					const expectedStartX = angle === 180 ? 1 : angle === 0 ? 0 : 0.5;
					const expectedStartY = angle === 270 ? 1 : angle === 90 ? 0 : 0.5;
					const expectedEndX = angle === 0 ? 1 : angle === 180 ? 0 : 0.5;
					const expectedEndY = angle === 90 ? 1 : angle === 270 ? 0 : 0.5;

					// Validate the coordinates are within acceptable range
					const startXDiff = Math.abs(progressLayer.getStartX() - expectedStartX);
					const startYDiff = Math.abs(progressLayer.getStartY() - expectedStartY);
					const endXDiff = Math.abs(progressLayer.getEndX() - expectedEndX);
					const endYDiff = Math.abs(progressLayer.getEndY() - expectedEndY);

					TKUnit.assertTrue(startXDiff <= 0.1, 'Start X coordinate should be approximately ' + expectedStartX);
					TKUnit.assertTrue(startYDiff <= 0.1, 'Start Y coordinate should be approximately ' + expectedStartY);
					TKUnit.assertTrue(endXDiff <= 0.1, 'End X coordinate should be approximately ' + expectedEndX);
					TKUnit.assertTrue(endYDiff <= 0.1, 'End Y coordinate should be approximately ' + expectedEndY);
				}
			}
		});
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_gradient_color_stops() {
	const slider = new Slider();

	function testAction() {
		const gradient = new LinearGradient();
		gradient.angle = 0;
		gradient.colorStops = [
			{ color: new Color('#FF0000'), offset: { unit: '%', value: 0 } },
			{ color: new Color('#00FF00'), offset: { unit: '%', value: 50 } },
			{ color: new Color('#0000FF'), offset: { unit: '%', value: 100 } },
		];

		slider.minTrackGradient = gradient;
		const nativeProgress = sliderTestsNative.getNativeProgressDrawable(slider);

		if (__ANDROID__) {
			const layerDrawable = nativeProgress as android.graphics.drawable.LayerDrawable;
			const progressLayer = layerDrawable.getDrawable(layerDrawable.findIndexByLayerId(android.R.id.progress));

			if (progressLayer instanceof org.nativescript.widgets.LinearGradientDefinition) {
				const colors = progressLayer.getColors();
				const stops = progressLayer.getStops();

				// Test color count
				TKUnit.assertEqual(colors.length, 3, 'Should have 3 colors in the gradient');

				// Test color values
				TKUnit.assertEqual(colors[0], new Color('#FF0000').android, 'First color should be red');
				TKUnit.assertEqual(colors[1], new Color('#00FF00').android, 'Second color should be green');
				TKUnit.assertEqual(colors[2], new Color('#0000FF').android, 'Third color should be blue');

				// Test stops
				TKUnit.assertEqual(stops[0], 0, 'First stop should be at 0');
				TKUnit.assertEqual(stops[1], 0.5, 'Second stop should be at 0.5');
				TKUnit.assertEqual(stops[2], 1, 'Third stop should be at 1');
			}
		} else if (__IOS__) {
			// iOS-specific color stop tests
			TKUnit.assertNotNull(nativeProgress, 'Progress image should not be null');
		}
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_gradient_updates() {
	const slider = new Slider();

	function testAction() {
		// Initial gradient
		const gradient1 = new LinearGradient();
		gradient1.angle = 0;
		gradient1.colorStops = [{ color: new Color('#FF0000') }, { color: new Color('#0000FF') }];

		slider.minTrackGradient = gradient1;
		let nativeProgress = sliderTestsNative.getNativeProgressDrawable(slider);
		TKUnit.assertNotNull(nativeProgress, 'Initial gradient should be applied');

		// Update gradient
		const gradient2 = new LinearGradient();
		gradient2.angle = 90;
		gradient2.colorStops = [{ color: new Color('#00FF00') }, { color: new Color('#FF00FF') }];

		slider.minTrackGradient = gradient2;
		nativeProgress = sliderTestsNative.getNativeProgressDrawable(slider);
		TKUnit.assertNotNull(nativeProgress, 'Updated gradient should be applied');

		// Remove gradient
		slider.minTrackGradient = null;
		nativeProgress = sliderTestsNative.getNativeProgressDrawable(slider);
		if (__ANDROID__) {
			TKUnit.assertTrue(nativeProgress instanceof android.graphics.drawable.LayerDrawable, 'Should revert to default LayerDrawable');
		}
	}

	helper.buildUIAndRunTest(slider, testAction);
}
