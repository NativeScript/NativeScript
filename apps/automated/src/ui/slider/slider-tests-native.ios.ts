import { Slider } from '@nativescript/core/ui/slider';

export function getNativeMinTrackImage(slider: Slider) {
	if (!slider || !slider.ios) {
		return null;
	}
	try {
		return slider.ios.minimumTrackImageForState(UIControlState.Normal);
	} catch (e) {
		return null;
	}
}

export function getNativeProgressDrawable(slider: Slider) {
	// On iOS the equivalent for progress drawable is minimum/maximum track images; return minimum track image
	return getNativeMinTrackImage(slider);
}
