import { Slider } from '@nativescript/core/ui/slider';

export function getNativeMinTrackImage(slider: Slider) {
	if (!slider || !slider.android) {
		return null;
	}
	try {
		const seekBar = slider.android as android.widget.SeekBar;
		return seekBar.getProgressDrawable();
	} catch (e) {
		return null;
	}
}

export function getNativeProgressDrawable(slider: Slider) {
	return getNativeMinTrackImage(slider);
}
