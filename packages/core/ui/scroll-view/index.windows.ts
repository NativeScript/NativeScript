export * from './scroll-view-common';

import { ScrollViewBase, isScrollEnabledProperty, scrollBarIndicatorVisibleProperty } from './scroll-view-common';
import type { ScrollEventData } from '.';
import type { ViewCommon } from '../core/view/view-common';

export class ScrollView extends ScrollViewBase {
	declare nativeViewProtected: Windows.UI.Xaml.Controls.ScrollViewer;

	private _scrollToken: any = null;
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
	}

	public disposeNativeView(): void {
		this._scrollToken = null;
		super.disposeNativeView();
	}

	get windows(): Windows.UI.Xaml.Controls.ScrollViewer {
		return this._windows;
	}

	private _applyOrientation(): void {
		const viewer = this.windows as any;
		if (!viewer) {
			return;
		}

		const HorizontalAlignment = Windows.UI.Xaml.HorizontalAlignment;
		const VerticalAlignment = Windows.UI.Xaml.VerticalAlignment;
		const ScrollBarVisibility = Windows.UI.Xaml.Controls.ScrollBarVisibility;
		const ScrollMode = Windows.UI.Xaml.Controls.ScrollMode;

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
	}

	public _addViewToNativeVisualTree(child: ViewCommon, _atIndex: number): boolean {
		super._addViewToNativeVisualTree(child);

		const nativeParent = this.nativeViewProtected as any;
		const nativeChild = (child as any).nativeViewProtected as any;

		if (nativeParent && nativeChild) {
			const HorizontalAlignment = Windows.UI.Xaml.HorizontalAlignment;
			const VerticalAlignment = Windows.UI.Xaml.VerticalAlignment;

			
			if (this.orientation === 'horizontal') {
				nativeChild.HorizontalAlignment = HorizontalAlignment.Left;
				nativeChild.VerticalAlignment = VerticalAlignment.Stretch;
			} else {
				nativeChild.VerticalAlignment = VerticalAlignment.Top;
				nativeChild.HorizontalAlignment = HorizontalAlignment.Stretch;
			}

			nativeParent.Content = nativeChild;

			// Force remeasure/layout so extent updates correctly.
			try {
				nativeChild.InvalidateMeasure();
				nativeChild.UpdateLayout();
			} catch (_e) {}

			try {
				nativeParent.InvalidateMeasure();
				nativeParent.UpdateLayout();
			} catch (_e) {}

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

		return Math.max(
			0,
			this.nativeViewProtected.ExtentWidth - this.nativeViewProtected.ViewportWidth
		);
	}

	get scrollableHeight(): number {
		if (!this.nativeViewProtected || this.orientation !== 'vertical') {
			return 0;
		}

		return Math.max(
			0,
			this.nativeViewProtected.ExtentHeight - this.nativeViewProtected.ViewportHeight
		);
	}

	public scrollToVerticalOffset(value: number, animated: boolean) {
		if (
			this.nativeViewProtected &&
			this.orientation === 'vertical' &&
			this.isScrollEnabled
		) {
			this.nativeViewProtected.ChangeView(
				null as never,
				value as never,
				null as never,
				!animated
			);
		}
	}

	public scrollToHorizontalOffset(value: number, animated: boolean) {
		if (
			this.nativeViewProtected &&
			this.orientation === 'horizontal' &&
			this.isScrollEnabled
		) {
			this.nativeViewProtected.ChangeView(
				value as never,
				null as never,
				null as never,
				!animated
			);
		}
	}

	[isScrollEnabledProperty.setNative](value: boolean): void {
		const viewer = this.nativeViewProtected as any;

		if (!viewer) {
			return;
		}

		const ScrollMode = Windows.UI.Xaml.Controls.ScrollMode;

		if (this.orientation === 'horizontal') {
			viewer.HorizontalScrollMode = value
				? ScrollMode.Enabled
				: ScrollMode.Disabled;
		} else {
			viewer.VerticalScrollMode = value
				? ScrollMode.Enabled
				: ScrollMode.Disabled;
		}
	}

	[scrollBarIndicatorVisibleProperty.setNative](value: boolean): void {
		const viewer = this.nativeViewProtected as any;

		if (!viewer) {
			return;
		}

		const ScrollBarVisibility =
			Windows.UI.Xaml.Controls.ScrollBarVisibility;

		if (this.orientation === 'horizontal') {
			viewer.HorizontalScrollBarVisibility = value
				? ScrollBarVisibility.Auto
				: ScrollBarVisibility.Hidden;
		} else {
			viewer.VerticalScrollBarVisibility = value
				? ScrollBarVisibility.Auto
				: ScrollBarVisibility.Hidden;
		}
	}
}