import * as Application from '../application';
import { Observable } from '../data/observable';
import { FontScaleObservableBase, getClosestValidFontScale } from './fontscale-observable-common';

let internalObservable: Observable;
function fontScaleChanged(origFontScale: number) {
	const fontScale = getClosestValidFontScale(origFontScale);

	internalObservable.set(FontScaleObservable.FONT_SCALE, fontScale);
	internalObservable.set(FontScaleObservable.IS_EXTRA_SMALL, fontScale < 0.85);
	internalObservable.set(FontScaleObservable.IS_EXTRA_LARGE, fontScale > 1.5);
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

function setupConfigListener(attempt = 0) {
	if (!Application.ios.nativeApp) {
		if (attempt > 100) {
			fontScaleChanged(1);

			return;
		}

		// Couldn't get launchEvent to trigger.
		setTimeout(() => setupConfigListener(attempt + 1), 1);

		return;
	}

	const fontSizeObserver = Application.ios.addNotificationObserver(UIContentSizeCategoryDidChangeNotification, (args) => {
		const fontSize = args.userInfo.valueForKey(UIContentSizeCategoryNewValueKey);
		contentSizeUpdated(fontSize);
	});

	Application.on(Application.exitEvent, () => {
		Application.ios.removeNotificationObserver(fontSizeObserver, UIContentSizeCategoryDidChangeNotification);
		internalObservable = null;

		Application.off(Application.resumeEvent, useIOSFontScale);
	});

	Application.on(Application.resumeEvent, useIOSFontScale);

	useIOSFontScale();
}

export class FontScaleObservable extends FontScaleObservableBase {
	protected _setupNativeObservable(): Observable {
		if (!internalObservable) {
			internalObservable = new Observable();
			setupConfigListener();
		}

		return internalObservable;
	}
}
