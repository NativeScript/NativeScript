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
	if (currentFontScale < 0.85) {
		return FontScaleCategory.ExtraSmall;
	}

	if (currentFontScale > 1.5) {
		return FontScaleCategory.ExtraLarge;
	}

	return FontScaleCategory.Medium;
}

const sizeMap = new Map<string, number>([
	[UIContentSizeCategoryExtraSmall, 0.5],
	[UIContentSizeCategorySmall, 0.7],
	[UIContentSizeCategoryMedium, 0.85],
	[UIContentSizeCategoryLarge, 1],
	[UIContentSizeCategoryExtraLarge, 1.15],
	[UIContentSizeCategoryExtraExtraLarge, 1.3],
	[UIContentSizeCategoryExtraExtraExtraLarge, 1.5],
	[UIContentSizeCategoryAccessibilityMedium, 2],
	[UIContentSizeCategoryAccessibilityLarge, 2.5],
	[UIContentSizeCategoryAccessibilityExtraLarge, 3],
	[UIContentSizeCategoryAccessibilityExtraExtraLarge, 3.5],
	[UIContentSizeCategoryAccessibilityExtraExtraExtraLarge, 4],
]);

function contentSizeUpdated(fontSize: string) {
	if (sizeMap.has(fontSize)) {
		fontScaleChanged(sizeMap.get(fontSize));

		return;
	}

	fontScaleChanged(1);
}

function useIOSFontScale() {
	if (Application.ios.nativeApp) {
		contentSizeUpdated(Application.ios.nativeApp.preferredContentSizeCategory);
	} else {
		fontScaleChanged(1);
	}
}

let fontSizeObserver;
function setupConfigListener(attempt = 0) {
	if (fontSizeObserver) {
		return;
	}

	if (!Application.ios.nativeApp) {
		if (attempt > 100) {
			fontScaleChanged(1);

			return;
		}

		// Couldn't get launchEvent to trigger.
		setTimeout(() => setupConfigListener(attempt + 1), 1);

		return;
	}

	fontSizeObserver = Application.ios.addNotificationObserver(UIContentSizeCategoryDidChangeNotification, (args) => {
		const fontSize = args.userInfo.valueForKey(UIContentSizeCategoryNewValueKey);
		contentSizeUpdated(fontSize);
	});

	Application.on(Application.exitEvent, () => {
		if (fontSizeObserver) {
			Application.ios.removeNotificationObserver(fontSizeObserver, UIContentSizeCategoryDidChangeNotification);
			fontSizeObserver = null;
		}

		Application.off(Application.resumeEvent, useIOSFontScale);
	});

	Application.on(Application.resumeEvent, useIOSFontScale);

	useIOSFontScale();
}

export function initAccessibilityFontScale(): void {
	setupConfigListener();
}
