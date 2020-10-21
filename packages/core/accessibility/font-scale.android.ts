import * as Application from '../application';
import { FontScaleCategory, getClosestValidFontScale } from './font-scale-common';
export * from './font-scale-common';

let currentFontScale: number = null;
function fontScaleChanged(origFontScale: number) {
	const oldValue = currentFontScale;
	currentFontScale = getClosestValidFontScale(origFontScale);

	if (oldValue !== currentFontScale) {
		Application.notify({
			eventName: Application.fontScaleChangedEvent,
			object: Application,
		});
	}
}

export function getCurrentFontScale(): number {
	setupConfigListener();

	return currentFontScale;
}

export function getFontScaleCategory(): FontScaleCategory {
	return FontScaleCategory.Medium;
}

function useAndroidFontScale() {
	fontScaleChanged(Number(Application.android.context.getResources().getConfiguration().fontScale));
}

let configChangedCallback: android.content.ComponentCallbacks2;
function setupConfigListener() {
	if (configChangedCallback) {
		return;
	}

	Application.off(Application.launchEvent, setupConfigListener);
	const context = Application.android?.context as android.content.Context;
	if (!context) {
		Application.on(Application.launchEvent, setupConfigListener);

		return;
	}

	useAndroidFontScale();

	configChangedCallback = new android.content.ComponentCallbacks2({
		onLowMemory() {
			// Dummy
		},
		onTrimMemory() {
			// Dummy
		},
		onConfigurationChanged(newConfig: android.content.res.Configuration) {
			fontScaleChanged(Number(newConfig.fontScale));
		},
	});

	context.registerComponentCallbacks(configChangedCallback);
	Application.on(Application.resumeEvent, useAndroidFontScale);
}

export function initAccessibilityFontScale(): void {
	setupConfigListener();
}
