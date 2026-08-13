export * from './wrap-layout-common';

import { WrapLayoutBase, orientationProperty, itemWidthProperty, itemHeightProperty } from './wrap-layout-common';
import { View } from '../../core/view';

// XAML owns measure/arrange so the shared onMeasure/onLayout is a no-op on Windows.
// Wrapping is implemented manually (same as FlexboxLayout): a Canvas whose children are
// measured and placed via Canvas.SetLeft/SetTop, re-running on every size change.
export class WrapLayout extends WrapLayoutBase {
	nativeViewProtected!: Microsoft.UI.Xaml.Controls.Canvas;
	private _canvas!: Microsoft.UI.Xaml.Controls.Canvas;
	private _layoutBusy = false;
	// The cross-axis size we set on the Canvas ourselves, so we can tell it apart from a user value.
	private _ownCross = NaN;

	constructor() {
		super();
		// WinRT deferred to createNativeView() — keeps constructor pure-JS.
	}

	createNativeView(): Microsoft.UI.Xaml.Controls.Canvas {
		this._canvas = new Microsoft.UI.Xaml.Controls.Canvas();
		return this._canvas;
	}

	initNativeView(): void {
		super.initNativeView(); // preserves LayoutUpdated = _onSizeChanged (background, clip, etc.)
		const canvas = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.Canvas;
		const ref = new WeakRef(this);
		canvas.SizeChanged = NSWinRT.asDelegate('Microsoft.UI.Xaml.SizeChangedEventHandler', () => {
			ref.deref()?._runWrapLayout();
		});
	}

	disposeNativeView(): void {
		const native = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.Canvas;
		if (native) {
			native.SizeChanged = null;
			native.LayoutUpdated = null;
		}
		super.disposeNativeView();
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
		super._addViewToNativeVisualTree(child, atIndex);
		const nativeChild = (child as any).nativeViewProtected as Microsoft.UI.Xaml.UIElement;
		const children = this._canvas?.Children;
		if (!nativeChild || !children) return false;
		try {
			const size: number = children.Size;
			if (atIndex >= 0 && atIndex < size && atIndex < Number.MAX_SAFE_INTEGER) {
				children.InsertAt(atIndex, nativeChild);
			} else {
				children.Append(nativeChild);
			}
		} catch {
			return false;
		}
		this._runWrapLayout();
		return true;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		const nativeChild = (child as any).nativeViewProtected as Microsoft.UI.Xaml.UIElement;
		const children = this._canvas?.Children;
		if (nativeChild && children) {
			const count: number = children.Size ?? 0;
			for (let i = 0; i < count; i++) {
				try {
					if (children.GetAt(i) === nativeChild) {
						children.RemoveAt(i);
						break;
					}
				} catch (_e) {}
			}
		}
		super._removeViewFromNativeVisualTree(child);
		this._runWrapLayout();
	}

	[orientationProperty.setNative](_v: 'horizontal' | 'vertical') {
		this._runWrapLayout();
	}
	//@ts-ignore — itemWidth/itemHeight use valueChanged for effective* but we still relayout natively
	[itemWidthProperty.setNative]() {
		this._runWrapLayout();
	}
	//@ts-ignore
	[itemHeightProperty.setNative]() {
		this._runWrapLayout();
	}

	private _runWrapLayout(): void {
		if (this._layoutBusy) return;
		const canvas = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.Canvas;
		if (!canvas) return;

		const children = canvas.Children;
		const count: number = children?.Size ?? 0;
		if (count === 0) return;

		const isVertical = this.orientation === 'vertical';

		const padLeft = (this.effectiveBorderLeftWidth || 0) + (this.effectivePaddingLeft || 0);
		const padTop = (this.effectiveBorderTopWidth || 0) + (this.effectivePaddingTop || 0);
		const padRight = (this.effectiveBorderRightWidth || 0) + (this.effectivePaddingRight || 0);
		const padBottom = (this.effectiveBorderBottomWidth || 0) + (this.effectivePaddingBottom || 0);

		// Canvas does not self-size; in an auto-sized parent the relevant axis can be 0 → treat as unconstrained.
		const actualW = (canvas.ActualWidth as number) || 0;
		const actualH = (canvas.ActualHeight as number) || 0;
		const availW = actualW > 0 ? actualW - padLeft - padRight : Infinity;
		const availH = actualH > 0 ? actualH - padTop - padBottom : Infinity;

		const mainAvail = isVertical ? availH : availW;

		const fixedW = this.effectiveItemWidth > 0 ? this.effectiveItemWidth : NaN;
		const fixedH = this.effectiveItemHeight > 0 ? this.effectiveItemHeight : NaN;

		this._layoutBusy = true;
		try {
			let mainPos = isVertical ? padTop : padLeft;
			let crossPos = isVertical ? padLeft : padTop;
			let lineCross = 0; // max cross-extent of the current line
			let maxMain = 0; // furthest main extent reached (for self-sizing on vertical)

			for (let i = 0; i < count; i++) {
				const nc = children.GetAt(i) as Microsoft.UI.Xaml.FrameworkElement;
				if (nc.Visibility === Microsoft.UI.Xaml.Visibility.Collapsed) continue;

				let w = fixedW;
				let h = fixedH;
				if (isNaN(w) || isNaN(h)) {
					try {
						nc.Measure(Microsoft.UI.Xaml.SizeHelper.FromDimensions(Infinity, Infinity));
						const d = nc.DesiredSize;
						if (isNaN(w)) w = d.Width;
						if (isNaN(h)) h = d.Height;
					} catch (_e) {
						if (isNaN(w)) w = 0;
						if (isNaN(h)) h = 0;
					}
				}

				const itemMain = isVertical ? h : w;
				const itemCross = isVertical ? w : h;

				const lineStart = isVertical ? padTop : padLeft;
				const lineHasItems = mainPos > lineStart + 0.001;
				if (Number.isFinite(mainAvail) && lineHasItems && mainPos + itemMain > (isVertical ? padTop + mainAvail : padLeft + mainAvail) + 0.001) {
					mainPos = lineStart;
					crossPos += lineCross;
					lineCross = 0;
				}

				Microsoft.UI.Xaml.Controls.Canvas.SetLeft(nc, isVertical ? crossPos : mainPos);
				Microsoft.UI.Xaml.Controls.Canvas.SetTop(nc, isVertical ? mainPos : crossPos);
				// Only force size when a uniform itemWidth/itemHeight was requested;
				// otherwise let the child render at its natural (measured) size.
				if (!isNaN(fixedW)) nc.Width = fixedW;
				if (!isNaN(fixedH)) nc.Height = fixedH;

				mainPos += itemMain;
				if (itemCross > lineCross) lineCross = itemCross;
				if (mainPos > maxMain) maxMain = mainPos;
			}

			const contentCross = crossPos + lineCross + (isVertical ? padRight : padBottom);
			const contentMain = maxMain + (isVertical ? padBottom : padRight);

			// Self-size the Canvas on the unconstrained axis so the parent re-measures correctly (mirrors FlexboxLayout).
			this._selfSizeCanvas(canvas, isVertical ? contentMain : contentCross, isVertical);
		} finally {
			this._layoutBusy = false;
		}
	}

	private _selfSizeCanvas(canvas: Microsoft.UI.Xaml.Controls.Canvas, crossContent: number, isVertical: boolean): void {
		const current = (isVertical ? canvas.Width : canvas.Height) as number;
		const actual = (isVertical ? canvas.ActualWidth : canvas.ActualHeight) as number;
		const inAutoMode = isNaN(current) || (!isNaN(this._ownCross) && Math.abs(current - this._ownCross) < 0.5);
		if (inAutoMode && crossContent > 0 && Math.abs(actual - crossContent) > 0.5) {
			this._ownCross = crossContent;
			if (isVertical) {
				canvas.Width = crossContent;
			} else {
				canvas.Height = crossContent;
			}
		}
	}
}
