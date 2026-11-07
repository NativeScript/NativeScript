export * from './scroll-view-common';

import { ScrollEventData } from '.';
import { ScrollViewBase, scrollBarIndicatorVisibleProperty, isScrollEnabledProperty } from './scroll-view-common';
import { View } from '../core/view';
import { layout } from '../../utils';
import { connect } from '../../utils/gtk.linux';

/** GtkScrolledWindow; the content is laid out by NativeScript at its measured size. */
export class ScrollView extends ScrollViewBase {
	private _contentMeasuredWidth = 0;
	private _contentMeasuredHeight = 0;
	private _disconnect: (() => void)[] = [];
	_linuxScrollable = true;

	createNativeView() {
		return gtk_scrolled_window_new();
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	initNativeView(): void {
		super.initNativeView();
		this._updatePolicy();
	}

	private _adjustment(horizontal: boolean): any {
		const view = this.nativeViewProtected;
		return view && (horizontal ? gtk_scrolled_window_get_hadjustment(view) : gtk_scrolled_window_get_vadjustment(view));
	}

	protected attachNative() {
		const owner = new WeakRef(this);
		const changed = () => {
			const view = owner.deref();
			view?.notify(<ScrollEventData>{ object: view, eventName: ScrollViewBase.scrollEvent, scrollX: view.horizontalOffset, scrollY: view.verticalOffset });
		};
		for (const horizontal of [true, false]) {
			const adjustment = this._adjustment(horizontal);
			if (adjustment) {
				this._disconnect.push(connect(adjustment, 'value-changed', changed));
			}
		}
	}

	protected detachNative() {
		for (const disconnect of this._disconnect.splice(0)) {
			disconnect();
		}
	}

	get horizontalOffset(): number {
		const adjustment = this._adjustment(true);
		return adjustment ? gtk_adjustment_get_value(adjustment) : 0;
	}

	get verticalOffset(): number {
		const adjustment = this._adjustment(false);
		return adjustment ? gtk_adjustment_get_value(adjustment) : 0;
	}

	get scrollableWidth(): number {
		const adjustment = this._adjustment(true);
		return adjustment ? Math.max(0, gtk_adjustment_get_upper(adjustment) - gtk_adjustment_get_page_size(adjustment)) : 0;
	}

	get scrollableHeight(): number {
		const adjustment = this._adjustment(false);
		return adjustment ? Math.max(0, gtk_adjustment_get_upper(adjustment) - gtk_adjustment_get_page_size(adjustment)) : 0;
	}

	[isScrollEnabledProperty.setNative](value: boolean) {
		this._updatePolicy();
	}

	[scrollBarIndicatorVisibleProperty.setNative](value: boolean) {
		this._updatePolicy();
	}

	private _updatePolicy() {
		const view = this.nativeViewProtected;
		if (!view) {
			return;
		}
		const enabled = this.isScrollEnabled !== false;
		const visible = this.scrollBarIndicatorVisible !== false;
		const along = !enabled ? GtkPolicyType.EXTERNAL : visible ? GtkPolicyType.AUTOMATIC : GtkPolicyType.EXTERNAL;
		const horizontal = this.orientation === 'horizontal';
		gtk_scrolled_window_set_policy(view, horizontal ? along : GtkPolicyType.NEVER, horizontal ? GtkPolicyType.NEVER : along);
		gtk_scrolled_window_set_overlay_scrolling(view, visible ? 1 : 0);
	}

	private _scrollTo(horizontal: boolean, value: number) {
		const adjustment = this._adjustment(horizontal);
		if (adjustment) {
			gtk_adjustment_set_value(adjustment, value);
		}
	}

	public scrollToVerticalOffset(value: number, animated: boolean) {
		this._scrollTo(false, layout.toDeviceIndependentPixels(value));
	}

	public scrollToHorizontalOffset(value: number, animated: boolean) {
		this._scrollTo(true, layout.toDeviceIndependentPixels(value));
	}

	public _onOrientationChanged() {
		this._updatePolicy();
		this.requestLayout();
	}

	public _addViewToNativeVisualTree(child: View): boolean {
		const view = this.nativeViewProtected;
		if (view && child.nativeViewProtected) {
			gtk_scrolled_window_set_child(view, child.nativeViewProtected);
			return true;
		}
		return false;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		if (this.nativeViewProtected) {
			gtk_scrolled_window_set_child(this.nativeViewProtected, null);
		}
		child._isAddedToNativeVisualTree = false;
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		const child = this.layoutView;
		this._contentMeasuredWidth = this.effectiveMinWidth;
		this._contentMeasuredHeight = this.effectiveMinHeight;
		if (child) {
			const childSize = this.orientation === 'vertical' ? View.measureChild(this, child, widthMeasureSpec, layout.makeMeasureSpec(0, layout.UNSPECIFIED)) : View.measureChild(this, child, layout.makeMeasureSpec(0, layout.UNSPECIFIED), heightMeasureSpec);
			this._contentMeasuredWidth = Math.max(childSize.measuredWidth, this.effectiveMinWidth);
			this._contentMeasuredHeight = Math.max(childSize.measuredHeight, this.effectiveMinHeight);
		}
		this.setMeasuredDimension(View.resolveSizeAndState(this._contentMeasuredWidth, width, widthMode, 0), View.resolveSizeAndState(this._contentMeasuredHeight, height, heightMode, 0));
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		const child = this.layoutView;
		if (!child) {
			return;
		}
		const width = right - left;
		const height = bottom - top;
		if (this.orientation === 'horizontal') {
			View.layoutChild(this, child, 0, 0, Math.max(this._contentMeasuredWidth, width), height);
		} else {
			View.layoutChild(this, child, 0, 0, width, Math.max(this._contentMeasuredHeight, height));
		}
		// the viewport sizes the content from its frame
		if (child.nativeViewProtected) {
			gtk_widget_queue_resize(child.nativeViewProtected);
		}
	}
}
