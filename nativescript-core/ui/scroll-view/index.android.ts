import { ScrollEventData } from '.';
import { ScrollViewBase, scrollBarIndicatorVisibleProperty, isScrollEnabledProperty } from './scroll-view-common';
import { layout } from '../../utils';
import { isUserInteractionEnabledProperty } from '../core/view';

export * from './scroll-view-common';

export class ScrollView extends ScrollViewBase {
	nativeViewProtected: org.nativescript.widgets.VerticalScrollView | org.nativescript.widgets.HorizontalScrollView;
	private _androidViewId: number = -1;
	private handler: android.view.ViewTreeObserver.OnScrollChangedListener;

	get horizontalOffset(): number {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return 0;
		}

		return nativeView.getScrollX() / layout.getDisplayDensity();
	}

	get verticalOffset(): number {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return 0;
		}

		return nativeView.getScrollY() / layout.getDisplayDensity();
	}

	get scrollableWidth(): number {
		const nativeView = this.nativeViewProtected;
		if (!nativeView || this.orientation !== 'horizontal') {
			return 0;
		}

		return nativeView.getScrollableLength() / layout.getDisplayDensity();
	}

	get scrollableHeight(): number {
		const nativeView = this.nativeViewProtected;
		if (!nativeView || this.orientation !== 'vertical') {
			return 0;
		}

		return nativeView.getScrollableLength() / layout.getDisplayDensity();
	}

	[isUserInteractionEnabledProperty.setNative](value: boolean) {
		// NOTE: different behavior on iOS & Android:
		// iOS disables user interaction recursively for all subviews as well
		this.nativeViewProtected.setClickable(value);
		this.nativeViewProtected.setFocusable(value);
		this.nativeViewProtected.setScrollEnabled(value);
	}

	[isScrollEnabledProperty.getDefault](): boolean {
		return this.nativeViewProtected.getScrollEnabled();
	}
	[isScrollEnabledProperty.setNative](value: boolean) {
		this.nativeViewProtected.setScrollEnabled(value);
	}

	[scrollBarIndicatorVisibleProperty.getDefault](): boolean {
		return true;
	}
	[scrollBarIndicatorVisibleProperty.setNative](value: boolean) {
		if (this.orientation === 'horizontal') {
			this.nativeViewProtected.setHorizontalScrollBarEnabled(value);
		} else {
			this.nativeViewProtected.setVerticalScrollBarEnabled(value);
		}
	}

	public scrollToVerticalOffset(value: number, animated: boolean) {
		const nativeView = this.nativeViewProtected;
		if (nativeView && this.orientation === 'vertical' && this.isScrollEnabled) {
			value *= layout.getDisplayDensity();

			if (animated) {
				nativeView.smoothScrollTo(0, value);
			} else {
				nativeView.scrollTo(0, value);
			}
		}
	}

	public scrollToHorizontalOffset(value: number, animated: boolean) {
		const nativeView = this.nativeViewProtected;
		if (nativeView && this.orientation === 'horizontal' && this.isScrollEnabled) {
			value *= layout.getDisplayDensity();

			if (animated) {
				nativeView.smoothScrollTo(value, 0);
			} else {
				nativeView.scrollTo(value, 0);
			}
		}
	}

	public createNativeView() {
		return this.orientation === 'horizontal' ? new org.nativescript.widgets.HorizontalScrollView(this._context) : new org.nativescript.widgets.VerticalScrollView(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		if (this._androidViewId < 0) {
			this._androidViewId = android.view.View.generateViewId();
		}

		this.nativeViewProtected.setId(this._androidViewId);
	}

	public _onOrientationChanged() {
		if (this.nativeViewProtected) {
			const parent = this.parent;
			if (parent) {
				parent._removeView(this);
				parent._addView(this);
			}
		}
	}

	protected attachNative() {
		const that = new WeakRef(this);
		this.handler = new android.view.ViewTreeObserver.OnScrollChangedListener({
			onScrollChanged: function () {
				const owner: ScrollView = that.get();
				if (owner) {
					owner._onScrollChanged();
				}
			},
		});

		this.nativeViewProtected.getViewTreeObserver().addOnScrollChangedListener(this.handler);
	}

	private _lastScrollX: number = -1;
	private _lastScrollY: number = -1;
	private _onScrollChanged() {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			// Event is only raised if the scroll values differ from the last time in order to wokraround a native Android bug.
			// https://github.com/NativeScript/NativeScript/issues/2362
			let newScrollX = nativeView.getScrollX();
			let newScrollY = nativeView.getScrollY();
			if (newScrollX !== this._lastScrollX || newScrollY !== this._lastScrollY) {
				this.notify(<ScrollEventData>{
					object: this,
					eventName: ScrollView.scrollEvent,
					scrollX: newScrollX / layout.getDisplayDensity(),
					scrollY: newScrollY / layout.getDisplayDensity(),
				});
				this._lastScrollX = newScrollX;
				this._lastScrollY = newScrollY;
			}
		}
	}

	protected dettachNative() {
		this.nativeViewProtected.getViewTreeObserver().removeOnScrollChangedListener(this.handler);
		this.handler = null;
	}
}

ScrollView.prototype.recycleNativeView = 'never';
