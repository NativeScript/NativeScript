import * as Utils from '../utils';
import { Application, ApplicationEventData } from '../application';
import { FontScaleCategory, getClosestValidFontScale } from './font-scale-common';
export * from './font-scale-common';

let currentFontScale: number = null;
export function fontScaleChanged(origFontScale: number) {
	const oldValue = currentFontScale;
	// currentFontScale = getClosestValidFontScale(origFontScale);
	currentFontScale = origFontScale;

	if (oldValue !== currentFontScale) {
		console.log('fontScaleChanged', oldValue, origFontScale);
		Application.notify({
			eventName: Application.fontScaleChangedEvent,
			object: Application,
			newValue: currentFontScale,
		} as ApplicationEventData);
	}
}

export function getCurrentFontScale(): number {
	return currentFontScale;
}

export function getFontScaleCategory(): FontScaleCategory {
	return FontScaleCategory.Medium;
}

function useAndroidFontScale() {
	fontScaleChanged(Number(Utils.android.getResources().getConfiguration().fontScale));
}

export function initAccessibilityFontScale(): void {
	useAndroidFontScale();
}
