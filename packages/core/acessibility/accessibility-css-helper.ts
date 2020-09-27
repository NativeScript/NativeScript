import * as Application from '../application';
import { View } from '../ui/core/view';
import { CSSUtils } from '../css/system-classes';
import { AccessibilityServiceEnabledObservable } from './accessibility-service';
import { FontScaleObservable } from './fontscale-observable';

// CSS-classes
const fontExtraSmallClass = `a11y-fontscale-xs`;
const fontExtraMediumClass = `a11y-fontscale-m`;
const fontExtraLargeClass = `a11y-fontscale-xl`;
const a11yServiceEnabledClass = `a11y-service-enabled`;
const a11yServiceDisabledClass = `a11y-service-disabled`;

class A11YCssClassHelper {
	private readonly cls = `CssClassesHelper`;

	private readonly fontScaleCssClasses = new Map(FontScaleObservable.VALID_FONT_SCALES.map((fs) => [fs, `a11y-fontscale-${Number(fs * 100).toFixed(0)}`]));

	private currentFontScaleClass = '';
	private currentFontScaleCategory = '';
	private currentA11YStatusClass = '';

	private readonly fontScaleObservable = new FontScaleObservable();
	private readonly a11yServiceObservable = new AccessibilityServiceEnabledObservable();

	/**
	 * Keep a list of WeakRefs to loaded modal views.
	 *
	 * This is needed to trigger UI updates if the fontscale or a11y-service status changes
	 **/
	private loadedModalViewRefs = new Map<string, WeakRef<View>>();

	constructor() {
		this.fontScaleObservable.on(FontScaleObservable.propertyChangeEvent, this.fontScaleChanged, this);
		this.a11yServiceObservable.on(AccessibilityServiceEnabledObservable.propertyChangeEvent, this.a11yServiceChanged, this);

		// TODO: handle displayed and resumed events
		// TODO: hanndle modal views
	}

	/**
	 * Update css-helper classes on root and modal-views
	 */
	private updateRootViews() {
		if (!this.updateCurrentHelperClasses()) {
			return;
		}

		for (const view of [Application.getRootView(), ...this.getModalViews()]) {
			if (!view) {
				continue;
			}

			view._onCssStateChange();
		}
	}

	/**
	 * Get loaded modal views
	 */
	private getModalViews() {
		const views = [] as View[];
		for (const [id, viewRef] of this.loadedModalViewRefs) {
			const view = viewRef.get();
			if (!view) {
				// This view doesn't exists anymore, remove the WeakRef from the set.
				this.loadedModalViewRefs.delete(id);
				continue;
			}

			views.push(view);
		}

		return views;
	}

	/**
	 * Add modal view to list loaded modals.
	 *
	 * These are used to the UI if fontscale or the a11y-service status changes while the modal is active.
	 */

	public addModalViewRef(modalView: View) {
		for (const [id, viewRef] of this.loadedModalViewRefs) {
			const otherView = viewRef.get();
			if (!otherView) {
				// This view doesn't exists anymore, remove the WeakRef from the set.
				this.loadedModalViewRefs.delete(id);
				continue;
			}
		}

		this.loadedModalViewRefs.set(`${modalView}`, new WeakRef(modalView));
	}

	private removeCssClass(cssClass: string) {
		CSSUtils.removeSystemCssClass(cssClass);

		const rootView = Application.getRootView();
		if (!rootView) {
			return;
		}

		rootView.cssClasses.delete(cssClass);
	}

	private addCssClass(cssClass: string) {
		CSSUtils.pushToRootViewCssClasses(cssClass);

		const rootView = Application.getRootView();
		if (!rootView) {
			return;
		}

		rootView.cssClasses.add(cssClass);
	}

	/**
	 * Update the helper CSS-classes.
	 * Return true is any changes.
	 */

	private updateCurrentHelperClasses(): boolean {
		const { fontScale, isExtraSmall, isExtraLarge } = this.fontScaleObservable;

		let changed = false;

		const oldFontScaleClass = this.currentFontScaleClass;
		if (this.fontScaleCssClasses.has(fontScale)) {
			this.currentFontScaleClass = this.fontScaleCssClasses.get(fontScale);
		} else {
			this.currentFontScaleClass = this.fontScaleCssClasses.get(1);
		}

		if (oldFontScaleClass !== this.currentFontScaleClass) {
			this.removeCssClass(oldFontScaleClass);
			this.addCssClass(this.currentFontScaleClass);

			changed = true;
		}

		const oldActiveFontScaleCategory = this.currentFontScaleCategory;
		if (global.isAndroid) {
			this.currentFontScaleCategory = fontExtraMediumClass;
		} else {
			if (isExtraSmall) {
				this.currentFontScaleCategory = fontExtraSmallClass;
			} else if (isExtraLarge) {
				this.currentFontScaleCategory = fontExtraLargeClass;
			} else {
				this.currentFontScaleCategory = fontExtraMediumClass;
			}
		}

		if (oldActiveFontScaleCategory !== this.currentFontScaleCategory) {
			this.removeCssClass(oldActiveFontScaleCategory);
			this.addCssClass(this.currentFontScaleCategory);

			changed = true;
		}

		const oldA11YStatusClass = this.currentA11YStatusClass;
		if (this.a11yServiceObservable.accessibilityServiceEnabled) {
			this.currentA11YStatusClass = a11yServiceEnabledClass;
		} else {
			this.currentA11YStatusClass = a11yServiceDisabledClass;
		}

		if (oldA11YStatusClass !== this.currentA11YStatusClass) {
			this.removeCssClass(oldA11YStatusClass);
			this.addCssClass(this.currentA11YStatusClass);

			changed = true;
		}

		return changed;
	}

	private fontScaleChanged() {
		this.updateRootViews();
	}

	private a11yServiceChanged() {
		this.updateRootViews();
	}
}

export const cssClassHelper = new A11YCssClassHelper();
