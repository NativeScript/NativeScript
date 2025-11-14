import { PageBase, actionBarHiddenProperty, statusBarStyleProperty, androidStatusBarBackgroundProperty } from './page-common';
import { View } from '../core/view';
import { Color } from '../../color';
import { ActionBar } from '../action-bar';
import { GridLayout } from '../layouts/grid-layout';
import { SDK_VERSION } from '../../utils/constants';
import { profile } from '../../profiling';
import { getLastFocusedViewOnPage } from '../../accessibility/accessibility-common';
import { AndroidAccessibilityEvent } from '../../accessibility/accessibility-types';
import { isAccessibilityServiceEnabled } from '../../accessibility';

export * from './page-common';

export class Page extends PageBase {
	declare nativeViewProtected: org.nativescript.widgets.GridLayout;

	public createNativeView() {
		const layout = new org.nativescript.widgets.GridLayout(this._context);
		layout.addRowsFromJSON(
			JSON.stringify([
				{ value: 1, type: 0 /* org.nativescript.widgets.GridUnitType.auto */ },
				{ value: 1, type: 2 /* org.nativescript.widgets.GridUnitType.star */ },
			]),
		);
		return layout;
	}

	public initNativeView(): void {
		super.initNativeView();
		this.nativeViewProtected.setBackgroundColor(-1); // White color.
	}

	public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
		// Set the row property for the child
		if (this.nativeViewProtected && child.nativeViewProtected) {
			if (child instanceof ActionBar) {
				GridLayout.setRow(child, 0);
				child.horizontalAlignment = 'stretch';
				child.verticalAlignment = 'top';
			} else {
				GridLayout.setRow(child, 1);
			}
		}

		return super._addViewToNativeVisualTree(child, atIndex);
	}

	@profile
	public onLoaded() {
		super.onLoaded();
		if (!this.hasActionBar && this.actionBarHidden !== true) {
			// ensure actionBar is created
			// but we only need to do that if the actionBarHidden is not hidden
			this.actionBar = new ActionBar();
		}
		if (this.hasActionBar) {
			this.updateActionBar();
		}
	}

	private updateActionBar() {
		// the test is actually to ensure the actionBar is created
		// it will be created if not
		if (this.actionBar) {
			this.actionBar.update();
		}
	}

	[actionBarHiddenProperty.setNative](value: boolean) {
		// in case the actionBar is not created and actionBarHidden is changed to true
		// the actionBar will be created by updateActionBar
		if (!value || this.hasActionBar) {
			this.updateActionBar();
		}
	}

	[androidStatusBarBackgroundProperty.getDefault](): number {
		if (SDK_VERSION >= 21) {
			const window = this.getClosestWindow();
			return window.getStatusBarColor();
		}

		return null;
	}
	[androidStatusBarBackgroundProperty.setNative](value: number | Color) {
		if (SDK_VERSION >= 21) {
			const window = this.getClosestWindow();
			const color = value instanceof Color ? value.android : value;
			window.setStatusBarColor(color);
		}
	}

	public accessibilityScreenChanged(refocus = false): void {
		if (!isAccessibilityServiceEnabled()) {
			return;
		}

		if (refocus) {
			const lastFocusedView = getLastFocusedViewOnPage(this);
			if (lastFocusedView) {
				const announceView = lastFocusedView.nativeViewProtected;
				if (announceView) {
					announceView.sendAccessibilityEvent(android.view.accessibility.AccessibilityEvent.TYPE_VIEW_FOCUSED);
					announceView.sendAccessibilityEvent(android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED);

					return;
				}
			}
		}

		if (this.actionBarHidden || this.accessibilityLabel) {
			this.sendAccessibilityEvent({
				androidAccessibilityEvent: AndroidAccessibilityEvent.WINDOW_STATE_CHANGED,
			});

			return;
		}
		if (this.hasActionBar) {
			this.actionBar.accessibilityScreenChanged();
		}
	}
}
