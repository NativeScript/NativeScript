export * from './dock-layout-common';

import { DockLayoutBase, stretchLastChildProperty } from './dock-layout-common';
import { View } from '../../core/view';
import type { CoreTypes } from '../../../core-types';

export class DockLayout extends DockLayoutBase {
	nativeViewProtected!: Microsoft.UI.Xaml.Controls.Canvas;
	private _canvas!: Microsoft.UI.Xaml.Controls.Canvas;
	private _layoutBusy = false;

	constructor() {
		super();
		// WinRT deferred to createNativeView() — keeps constructor pure-JS.
	}

	public createNativeView(): Microsoft.UI.Xaml.Controls.Canvas {
		this._canvas = new Microsoft.UI.Xaml.Controls.Canvas();
		return this._canvas;
	}

	public initNativeView(): void {
		super.initNativeView();
		const canvas = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.Canvas;
		const ref = new WeakRef(this);
		canvas.SizeChanged = NSWinRT.asDelegate('Microsoft.UI.Xaml.SizeChangedEventHandler', () => {
			ref.deref()?._runDockLayout();
		});
	}

	public disposeNativeView(): void {
		const native = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.Canvas;
		if (native) {
			native.SizeChanged = null;
			native.LayoutUpdated = null;
		}
		super.disposeNativeView();
	}

	[stretchLastChildProperty.getDefault](): boolean {
		return true;
	}

	[stretchLastChildProperty.setNative](value: boolean) {
		this.stretchLastChild = value;
		this._runDockLayout();
	}

	public onDockChanged(_view: View, _oldValue: CoreTypes.DockType, _newValue: CoreTypes.DockType) {
		this._runDockLayout();
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
		super._addViewToNativeVisualTree(child, atIndex);
		const nativeChild = child.nativeViewProtected as Microsoft.UI.Xaml.UIElement;
		const children = this._canvas?.Children;
		if (!nativeChild || !children) {
			return false;
		}
		try {
			const size: number = children.Size;
			if (atIndex >= 0 && atIndex < size && atIndex < Number.MAX_SAFE_INTEGER) {
				children.InsertAt(atIndex, nativeChild);
			} else {
				children.Append(nativeChild);
			}
			try { (nativeChild as any).__ns_view = child; } catch (_e) { }
		} catch {
			return false;
		}
		this._runDockLayout();
		return true;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		const nativeChild = child.nativeViewProtected as Microsoft.UI.Xaml.UIElement;
		const children = this._canvas?.Children;
		if (nativeChild && children) {
			const count: number = children.Size ?? 0;
			for (let i = 0; i < count; i++) {
				try {
					if (children.GetAt(i) === nativeChild) {
						children.RemoveAt(i);
						break;
					}
				} catch (_e) { }
			}
		}
		super._removeViewFromNativeVisualTree(child);
		this._runDockLayout();
	}

	// XAML Canvas has no native dock; children are measured and placed manually (same pattern as Wrap/Flex).
	private _runDockLayout(): void {
		if (this._layoutBusy) {
			return;
		}
		const canvas = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.Canvas;
		if (!canvas) {
			return;
		}

		const children = canvas.Children;
		const count: number = children?.Size ?? 0;
		if (count === 0) {
			return;
		}

		const padLeft = (this.effectiveBorderLeftWidth || 0) + (this.effectivePaddingLeft || 0);
		const padTop = (this.effectiveBorderTopWidth || 0) + (this.effectivePaddingTop || 0);
		const padRight = (this.effectiveBorderRightWidth || 0) + (this.effectivePaddingRight || 0);
		const padBottom = (this.effectiveBorderBottomWidth || 0) + (this.effectivePaddingBottom || 0);

		const availW = Math.max(0, ((canvas.ActualWidth as number) || 0) - padLeft - padRight);
		const availH = Math.max(0, ((canvas.ActualHeight as number) || 0) - padTop - padBottom);

		this._layoutBusy = true;
		try {
			let remainingW = availW;
			let remainingH = availH;
			let x = padLeft;
			let y = padTop;

			const visibleIndices: number[] = [];
			for (let i = 0; i < count; i++) {
				const nc = children.GetAt(i) as Microsoft.UI.Xaml.FrameworkElement;
				if (nc.Visibility !== Microsoft.UI.Xaml.Visibility.Collapsed) {
					visibleIndices.push(i);
				}
			}

			for (let vi = 0; vi < visibleIndices.length; vi++) {
				const i = visibleIndices[vi];
				const nc = children.GetAt(i) as Microsoft.UI.Xaml.FrameworkElement;
				const childView = (nc as any).__ns_view as View;
				const dock = childView ? DockLayout.getDock(childView) : 'left';
				const stretch = this.stretchLastChild && vi === visibleIndices.length - 1;

				let childW = 0;
				let childH = 0;

				if (stretch) {
					childW = remainingW;
					childH = remainingH;
				} else {
					let measureW = remainingW > 0 ? remainingW : Number.POSITIVE_INFINITY;
					let measureH = remainingH > 0 ? remainingH : Number.POSITIVE_INFINITY;
					if (dock === 'top' || dock === 'bottom') {
						measureW = availW > 0 ? availW : Number.POSITIVE_INFINITY;
					} else {
						measureH = availH > 0 ? availH : Number.POSITIVE_INFINITY;
					}
					try {
						nc.Measure(Microsoft.UI.Xaml.SizeHelper.FromDimensions(measureW, measureH));
						const d = nc.DesiredSize;
						childW = d.Width;
						childH = d.Height;
					} catch (_e) {
						childW = 0;
						childH = 0;
					}
				}

				let left = x;
				let top = y;
				let width = childW;
				let height = childH;

				switch (dock) {
					case 'top':
						width = availW;
						left = padLeft;
						top = y;
						y += childH;
						remainingH = Math.max(0, remainingH - childH);
						break;
					case 'bottom':
						width = availW;
						left = padLeft;
						top = padTop + remainingH - childH;
						remainingH = Math.max(0, remainingH - childH);
						break;
					case 'right':
						height = availH;
						left = padLeft + remainingW - childW;
						top = padTop;
						remainingW = Math.max(0, remainingW - childW);
						break;
					case 'left':
					default:
						height = availH;
						left = x;
						top = padTop;
						x += childW;
						remainingW = Math.max(0, remainingW - childW);
						break;
				}

				try {
					Microsoft.UI.Xaml.Controls.Canvas.SetLeft(nc, left);
					Microsoft.UI.Xaml.Controls.Canvas.SetTop(nc, top);
					if (width > 0) {
						nc.Width = width;
					}
					if (height > 0) {
						nc.Height = height;
					}
				} catch (_e) { }

				if (stretch) {
					break;
				}
			}
		} finally {
			this._layoutBusy = false;
		}
	}
}
