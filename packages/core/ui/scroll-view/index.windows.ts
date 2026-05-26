export * from './scroll-view-common';

import { ScrollViewBase, isScrollEnabledProperty, scrollBarIndicatorVisibleProperty } from './scroll-view-common';
import type { ScrollEventData } from '.';
import type { ViewCommon } from '../core/view/view-common';

export class ScrollView extends ScrollViewBase {
	declare nativeViewProtected: Windows.UI.Xaml.Controls.ScrollViewer;
	private _scrollToken: any = null;
	private _sizeToken: any = null;
	private _windows: Windows.UI.Xaml.Controls.ScrollViewer;
	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.ScrollViewer();
	}

	public createNativeView() {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		this._applyOrientation();
		this._constrainToWindow();
		this._attachWindowSizeChanged();
	}

	public disposeNativeView(): void {
		this._detachWindowSizeChanged();
		this._scrollToken = null;
		super.disposeNativeView();
	}

	get windows(): Windows.UI.Xaml.Controls.ScrollViewer {
		return this._windows;
	}

	private _constrainToWindow(): void {
		const viewer = this.windows;
		if (!viewer) return;
		const current = Windows.UI.Xaml.Window.Current;
		if (!current) return;
		const bounds = current.Bounds;
		// Window has not rendered yet — skip; _attachWindowSizeChanged will apply once bounds are known
		if (!bounds || bounds.Height === 0 || bounds.Width === 0) return;
		if (this.orientation === 'vertical') {
			viewer.MaxHeight = bounds.Height;
		} else {
			viewer.MaxWidth = bounds.Width;
		}
	}

	private _attachWindowSizeChanged(): void {
		const viewer = this.windows;
		if (!viewer) return;
		const that = new WeakRef(this);
		// Loaded fires once the control enters the visual tree; Window.Bounds are valid by then.
		this._sizeToken = NSWinRT.asDelegate((_sender: any, _args: any) => {
			const owner = that.deref();
			if (!owner) return;
			owner._constrainToWindow();
			// One-shot: detach after first successful constraint application.
			(owner as any)._detachWindowSizeChanged();
		});
		viewer.Loaded = this._sizeToken;
	}

	private _detachWindowSizeChanged(): void {
		const viewer = this.windows;
		if (viewer && this._sizeToken) {
			viewer.Loaded = null as never;
		}
		this._sizeToken = null;
	}

	private _applyOrientation(): void {
		const viewer = this.windows;
		if (!viewer) return;
		// ScrollBarVisibility: Disabled=0, Auto=1, Hidden=2, Visible=3
		// ScrollMode: Disabled=0, Enabled=1
		if (this.orientation === 'horizontal') {
			viewer.HorizontalScrollBarVisibility = 1; // Auto
			viewer.VerticalScrollBarVisibility = 0; // Disabled
			viewer.HorizontalScrollMode = 1; // Enabled
			viewer.VerticalScrollMode = 0; // Disabled
		} else {
			viewer.VerticalScrollBarVisibility = 1; // Auto
			viewer.HorizontalScrollBarVisibility = 0; // Disabled
			viewer.VerticalScrollMode = 1; // Enabled
			viewer.HorizontalScrollMode = 0; // Disabled
		}
	}

	public _onOrientationChanged(): void {
		this._applyOrientation();
		this._constrainToWindow();
	}

	// ScrollViewer is a ContentControl — child goes into Content, not Children
	public _addViewToNativeVisualTree(child: ViewCommon, _atIndex: number): boolean {
		super._addViewToNativeVisualTree(child);

		const nativeParent = this.nativeViewProtected as any;
		const nativeChild = (child as any).nativeViewProtected as any;

		if (nativeParent && nativeChild) {
			nativeParent.Content = nativeChild;
			return true;
		}

		return false;
	}

	public _removeViewFromNativeVisualTree(child: ViewCommon): void {
		if (this.nativeViewProtected) {
			(this.nativeViewProtected as any).Content = null;
		}
		super._removeViewFromNativeVisualTree(child);
	}

	protected attachNative(): void {
		const viewer = this.windows;
		if (!viewer) return;
		const that = new WeakRef(this);
		this._scrollToken = NSWinRT.asDelegate((_sender: any, _args: any) => {
			const owner = that.deref();
			if (!owner) return;
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
		if (!viewer) return;
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
			this.nativeViewProtected.ChangeView(null as never, value as never, null as never, !animated);
		}
	}

	public scrollToHorizontalOffset(value: number, animated: boolean) {
		if (this.nativeViewProtected && this.orientation === 'horizontal' && this.isScrollEnabled) {
			this.nativeViewProtected.ChangeView(value as never, null as never, null as never, !animated);
		}
	}

	[isScrollEnabledProperty.setNative](value: boolean): void {
		const viewer = this.nativeViewProtected;
		if (!viewer) return;
		// ScrollMode: Disabled=0, Enabled=1
		if (this.orientation === 'horizontal') {
			viewer.HorizontalScrollMode = value ? 1 : 0;
		} else {
			viewer.VerticalScrollMode = value ? 1 : 0;
		}
	}

	[scrollBarIndicatorVisibleProperty.setNative](value: boolean): void {
		const viewer = this.nativeViewProtected as any;
		if (!viewer) return;
		// ScrollBarVisibility: Disabled=0, Auto=1, Hidden=2
		if (this.orientation === 'horizontal') {
			viewer.HorizontalScrollBarVisibility = value ? 1 : 2; // Auto or Hidden
		} else {
			viewer.VerticalScrollBarVisibility = value ? 1 : 2;
		}
	}
}
