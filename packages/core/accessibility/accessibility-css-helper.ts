import { Application } from '../application';
import type { View } from '../ui/core/view';
import { AccessibilityServiceEnabledObservable } from './accessibility-service';
import { FontScaleCategory, getCurrentFontScale, getFontScaleCategory, VALID_FONT_SCALES } from './font-scale';
import { SDK_VERSION } from '../utils/constants';

// CSS-classes
const fontScaleExtraSmallCategoryClass = `a11y-fontscale-xs`;
const fontScaleMediumCategoryClass = `a11y-fontscale-m`;
const fontScaleExtraLargeCategoryClass = `a11y-fontscale-xl`;

const fontScaleCategoryClasses = [fontScaleExtraSmallCategoryClass, fontScaleMediumCategoryClass, fontScaleExtraLargeCategoryClass];

const a11yServiceEnabledClass = `a11y-service-enabled`;
const a11yServiceDisabledClass = `a11y-service-disabled`;
const a11yServiceClasses = [a11yServiceEnabledClass, a11yServiceDisabledClass];

// SDK Version CSS classes
let sdkVersionClasses: string[] = [];

let accessibilityServiceObservable: AccessibilityServiceEnabledObservable;
let fontScaleCssClasses: Map<number, string>;

let currentFontScaleClass = '';
let currentFontScaleCategory = '';
let currentA11YServiceClass = '';

function ensureClasses() {
	if (accessibilityServiceObservable) {
		return;
	}

	fontScaleCssClasses = new Map(VALID_FONT_SCALES.map((fs) => [fs, `a11y-fontscale-${Number(fs * 100).toFixed(0)}`]));

	accessibilityServiceObservable = new AccessibilityServiceEnabledObservable();
}

function applyRootCssClass(cssClasses: string[], newCssClass: string): void {
	const rootView = Application.getRootView();
	if (!rootView) {
		return;
	}

	Application.applyCssClass(rootView, cssClasses, newCssClass);

	const rootModalViews = <Array<View>>rootView._getRootModalViews();
	rootModalViews.forEach((rootModalView) => Application.applyCssClass(rootModalView, cssClasses, newCssClass));

	// Note: SDK version classes are applied separately to avoid redundant work
}

function applyFontScaleToRootViews(): void {
	const rootView = Application.getRootView();
	if (!rootView) {
		return;
	}

	const fontScale = getCurrentFontScale();

	rootView.style.fontScaleInternal = fontScale;

	const rootModalViews = <Array<View>>rootView._getRootModalViews();
	rootModalViews.forEach((rootModalView) => (rootModalView.style.fontScaleInternal = fontScale));
}

export function initAccessibilityCssHelper(): void {
	ensureClasses();

	Application.on(Application.fontScaleChangedEvent, () => {
		updateCurrentHelperClasses();

		applyFontScaleToRootViews();
	});

	accessibilityServiceObservable.on(AccessibilityServiceEnabledObservable.propertyChangeEvent, updateCurrentHelperClasses);
}

/**
 * Update the helper CSS-classes.
 * Return true is any changes.
 */
function updateCurrentHelperClasses(): void {
	const fontScale = getCurrentFontScale();
	const fontScaleCategory = getFontScaleCategory();

	const oldFontScaleClass = currentFontScaleClass;
	if (fontScaleCssClasses.has(fontScale)) {
		currentFontScaleClass = fontScaleCssClasses.get(fontScale);
	} else {
		currentFontScaleClass = fontScaleCssClasses.get(1);
	}

	if (oldFontScaleClass !== currentFontScaleClass) {
		applyRootCssClass([...fontScaleCssClasses.values()], currentFontScaleClass);
	}

	const oldActiveFontScaleCategory = currentFontScaleCategory;
	switch (fontScaleCategory) {
		case FontScaleCategory.ExtraSmall: {
			currentFontScaleCategory = fontScaleExtraSmallCategoryClass;
			break;
		}
		case FontScaleCategory.Medium: {
			currentFontScaleCategory = fontScaleMediumCategoryClass;
			break;
		}
		case FontScaleCategory.ExtraLarge: {
			currentFontScaleCategory = fontScaleExtraLargeCategoryClass;
			break;
		}
		default: {
			currentFontScaleCategory = fontScaleMediumCategoryClass;
			break;
		}
	}

	if (oldActiveFontScaleCategory !== currentFontScaleCategory) {
		applyRootCssClass(fontScaleCategoryClasses, currentFontScaleCategory);
	}

	const oldA11YStatusClass = currentA11YServiceClass;
	if (accessibilityServiceObservable.accessibilityServiceEnabled) {
		currentA11YServiceClass = a11yServiceEnabledClass;
	} else {
		currentA11YServiceClass = a11yServiceDisabledClass;
	}

	if (oldA11YStatusClass !== currentA11YServiceClass) {
		applyRootCssClass(a11yServiceClasses, currentA11YServiceClass);
	}
}
