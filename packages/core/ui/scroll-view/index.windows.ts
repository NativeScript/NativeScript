export * from './scroll-view-common';

import { ScrollViewBase, isScrollEnabledProperty, scrollBarIndicatorVisibleProperty } from './scroll-view-common';
import type { ScrollEventData } from '.';
import type { ViewCommon } from '../core/view/view-common';

// Viewport sizing is the parent's responsibility: NativeScript.Widgets.StackLayout/Grid size a
// Stretch/height:100% ScrollView to the bounded extent in MeasureOverride, giving the ScrollViewer
// a proper scrollable viewport without any JS clamping.
export class ScrollView extends ScrollViewBase {
	declare nativeViewProtected: Microsoft.UI.Xaml.Controls.ScrollViewer;

	private _scrollToken: any = null;
	private _windows: Microsoft.UI.Xaml.Controls.ScrollViewer;

	constructor() {
		super();
		// WinRT deferred to createNativeView() — keeps constructor pure-JS.
	}

	public createNativeView() {
		this._windows = new Microsoft.UI.Xaml.Controls.ScrollViewer();
		return this._windows;
	}

	get windows(): Microsoft.UI.Xaml.Controls.ScrollViewer {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		this._applyOrientation();
	}

	public disposeNativeView(): void {
		this._scrollToken = null;
		super.disposeNativeView();
	}

	private _applyOrientation(): void {
		const viewer = this.windows;
		if (!viewer) {
			return;
		}

		const HorizontalAlignment = Microsoft.UI.Xaml.HorizontalAlignment;
		const VerticalAlignment = Microsoft.UI.Xaml.VerticalAlignment;
		const ScrollBarVisibility = Microsoft.UI.Xaml.Controls.ScrollBarVisibility;
		const ScrollMode = Microsoft.UI.Xaml.Controls.ScrollMode;

		if (this.orientation === 'horizontal') {
			viewer.HorizontalScrollBarVisibility = ScrollBarVisibility.Auto;
			viewer.VerticalScrollBarVisibility = ScrollBarVisibility.Disabled;
			viewer.HorizontalScrollMode = ScrollMode.Enabled;
			viewer.VerticalScrollMode = ScrollMode.Disabled;
			viewer.HorizontalContentAlignment = HorizontalAlignment.Left;
			viewer.VerticalContentAlignment = VerticalAlignment.Stretch;
		} else {
			viewer.VerticalScrollBarVisibility = ScrollBarVisibility.Auto;
			viewer.HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled;
			viewer.VerticalScrollMode = ScrollMode.Enabled;
			viewer.HorizontalScrollMode = ScrollMode.Disabled;
			viewer.VerticalContentAlignment = VerticalAlignment.Top;
			viewer.HorizontalContentAlignment = HorizontalAlignment.Stretch;
		}
	}

	public _onOrientationChanged(): void {
		this._applyOrientation();
		const nativeChild = this.layoutView?.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
		if (nativeChild) {
			this._alignContent(nativeChild);
		}
	}

	private _alignContent(nativeChild: Microsoft.UI.Xaml.FrameworkElement): void {
		const HorizontalAlignment = Microsoft.UI.Xaml.HorizontalAlignment;
		const VerticalAlignment = Microsoft.UI.Xaml.VerticalAlignment;
		// Critically, the content must be aligned to the scroll-axis start (not Stretch on
		// that axis) so the ScrollViewer measures it with infinite extent and lets it overflow.
		if (this.orientation === 'horizontal') {
			nativeChild.HorizontalAlignment = HorizontalAlignment.Left;
			nativeChild.VerticalAlignment = VerticalAlignment.Stretch;
		} else {
			nativeChild.VerticalAlignment = VerticalAlignment.Top;
			nativeChild.HorizontalAlignment = HorizontalAlignment.Stretch;
		}
	}

	public _addViewToNativeVisualTree(child: ViewCommon, _atIndex?: number): boolean {
		super._addViewToNativeVisualTree(child);

		const nativeParent = this.nativeViewProtected;
		const nativeChild = child.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;

		if (nativeParent && nativeChild) {
			this._alignContent(nativeChild);
			nativeParent.Content = nativeChild;
			return true;
		}

		return false;
	}

	public _removeViewFromNativeVisualTree(child: ViewCommon): void {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.Content = null as never;
		}
		super._removeViewFromNativeVisualTree(child);
	}

	private _changeViewSafe(viewer: Microsoft.UI.Xaml.Controls.ScrollViewer, horizontal?: number | null, vertical?: number | null, disableAnimation: boolean = true): void {
		if (!viewer || typeof viewer.ChangeView !== 'function') {
			return;
		}

		// ChangeView is a native call that can throw mid-layout; guard it.
		try {
			const currentH = typeof viewer.HorizontalOffset === 'number' ? viewer.HorizontalOffset : 0;
			const currentV = typeof viewer.VerticalOffset === 'number' ? viewer.VerticalOffset : 0;
			const zoom = typeof viewer.ZoomFactor === 'number' && viewer.ZoomFactor > 0 ? viewer.ZoomFactor : 1;

			const h = typeof horizontal === 'number' ? horizontal : currentH;
			const v = typeof vertical === 'number' ? vertical : currentV;

			if (Math.abs(h - currentH) < 0.5 && Math.abs(v - currentV) < 0.5) {
				return;
			}

			viewer.ChangeView(h, v, zoom, disableAnimation);
		} catch (_err) {}
	}

	protected attachNative(): void {
		const viewer = this.windows;
		if (!viewer) {
			return;
		}

		const that = new WeakRef(this);

		this._scrollToken = NSWinRT.asDelegate((_sender: any, _args: any) => {
			const owner = that.deref();
			if (!owner) {
				return;
			}
			owner.notify<ScrollEventData>({
				eventName: ScrollViewBase.scrollEvent,
				object: owner,
				scrollX: owner.horizontalOffset,
				scrollY: owner.verticalOffset,
			});
		});

		viewer.ViewChanged = this._scrollToken;
	}

	protected detachNative(): void {
		const viewer = this.windows;
		if (!viewer) {
			return;
		}

		viewer.ViewChanged = null as never;
		this._scrollToken = null;
	}

	get horizontalOffset(): number {
		return this.nativeViewProtected ? this.nativeViewProtected.HorizontalOffset : 0;
	}

	get verticalOffset(): number {
		return this.nativeViewProtected ? this.nativeViewProtected.VerticalOffset : 0;
	}

	get scrollableWidth(): number {
		if (!this.nativeViewProtected || this.orientation !== 'horizontal') {
			return 0;
		}

		return Math.max(0, this.nativeViewProtected.ExtentWidth - this.nativeViewProtected.ViewportWidth);
	}

	get scrollableHeight(): number {
		if (!this.nativeViewProtected || this.orientation !== 'vertical') {
			return 0;
		}

		return Math.max(0, this.nativeViewProtected.ExtentHeight - this.nativeViewProtected.ViewportHeight);
	}

	public scrollToVerticalOffset(value: number, animated: boolean) {
		if (this.nativeViewProtected && this.orientation === 'vertical' && this.isScrollEnabled) {
			this._changeViewSafe(this.nativeViewProtected, undefined, value, !animated);
		}
	}

	public scrollToHorizontalOffset(value: number, animated: boolean) {
		if (this.nativeViewProtected && this.orientation === 'horizontal' && this.isScrollEnabled) {
			this._changeViewSafe(this.nativeViewProtected, value, undefined, !animated);
		}
	}

	[isScrollEnabledProperty.setNative](value: boolean): void {
		const viewer = this.nativeViewProtected;
		if (!viewer) {
			return;
		}

		const ScrollMode = Microsoft.UI.Xaml.Controls.ScrollMode;

		if (this.orientation === 'horizontal') {
			viewer.HorizontalScrollMode = value ? ScrollMode.Enabled : ScrollMode.Disabled;
		} else {
			viewer.VerticalScrollMode = value ? ScrollMode.Enabled : ScrollMode.Disabled;
		}
	}

	[scrollBarIndicatorVisibleProperty.setNative](value: boolean): void {
		const viewer = this.nativeViewProtected;
		if (!viewer) {
			return;
		}

		const ScrollBarVisibility = Microsoft.UI.Xaml.Controls.ScrollBarVisibility;

		if (this.orientation === 'horizontal') {
			viewer.HorizontalScrollBarVisibility = value ? ScrollBarVisibility.Auto : ScrollBarVisibility.Hidden;
		} else {
			viewer.VerticalScrollBarVisibility = value ? ScrollBarVisibility.Auto : ScrollBarVisibility.Hidden;
		}
	}
}
