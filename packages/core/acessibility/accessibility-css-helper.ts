import { applyCssClass, getRootView } from '../application';
import type { View } from '../ui/core/view';
import { AccessibilityServiceEnabledObservable } from './accessibility-service';
import { FontScaleObservable } from './fontscale-observable';

// CSS-classes
const fontExtraSmallClass = `a11y-fontscale-xs`;
const fontExtraMediumClass = `a11y-fontscale-m`;
const fontExtraLargeClass = `a11y-fontscale-xl`;

const fontScaleCategoryClasses = [fontExtraSmallClass, fontExtraMediumClass, fontExtraLargeClass];

const a11yServiceEnabledClass = `a11y-service-enabled`;
const a11yServiceDisabledClass = `a11y-service-disabled`;

const a11yServiceClasses = [a11yServiceEnabledClass, a11yServiceDisabledClass];

let fontScaleObservable: FontScaleObservable;
let a11yServiceObservable: AccessibilityServiceEnabledObservable;
let fontScaleCssClasses: Map<number, string>;

let currentFontScaleClass = '';
let currentFontScaleCategory = '';
let currentA11YServiceClass = '';

function ensureClasses() {
	if (fontScaleObservable) {
		return;
	}

	fontScaleCssClasses = new Map(FontScaleObservable.VALID_FONT_SCALES.map((fs) => [fs, `a11y-fontscale-${Number(fs * 100).toFixed(0)}`]));

	fontScaleObservable = new FontScaleObservable();
	a11yServiceObservable = new AccessibilityServiceEnabledObservable();
}

function applyRootCssClass(cssClasses: string[], newCssClass: string): void {
	const rootView = getRootView();
	if (!rootView) {
		return;
	}

	applyCssClass(rootView, cssClasses, newCssClass);

	const rootModalViews = <Array<View>>rootView._getRootModalViews();
	rootModalViews.forEach((rootModalView) => {
		applyCssClass(rootModalView, cssClasses, newCssClass);
	});
}

export function initA11YCssHelper(): void {
	ensureClasses();

	fontScaleObservable.on(FontScaleObservable.propertyChangeEvent, updateCurrentHelperClasses);
	a11yServiceObservable.on(AccessibilityServiceEnabledObservable.propertyChangeEvent, updateCurrentHelperClasses);

	// TODO: handle displayed and resumed events
	// TODO: hanndle modal views
}

/**
 * Update the helper CSS-classes.
 * Return true is any changes.
 */
function updateCurrentHelperClasses(): void {
	const { fontScale, isExtraSmall, isExtraLarge } = fontScaleObservable;

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
	if (global.isAndroid) {
		currentFontScaleCategory = fontExtraMediumClass;
	} else {
		if (isExtraSmall) {
			currentFontScaleCategory = fontExtraSmallClass;
		} else if (isExtraLarge) {
			currentFontScaleCategory = fontExtraLargeClass;
		} else {
			currentFontScaleCategory = fontExtraMediumClass;
		}
	}

	if (oldActiveFontScaleCategory !== currentFontScaleCategory) {
		applyRootCssClass(fontScaleCategoryClasses, currentFontScaleCategory);
	}

	const oldA11YStatusClass = currentA11YServiceClass;
	if (a11yServiceObservable.accessibilityServiceEnabled) {
		currentA11YServiceClass = a11yServiceEnabledClass;
	} else {
		currentA11YServiceClass = a11yServiceDisabledClass;
	}

	if (oldA11YStatusClass !== currentA11YServiceClass) {
		applyRootCssClass(a11yServiceClasses, currentA11YServiceClass);
	}
}
