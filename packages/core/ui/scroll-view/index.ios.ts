import { ScrollEventData } from '.';
import { ScrollViewBase, scrollBarIndicatorVisibleProperty, isScrollEnabledProperty } from './scroll-view-common';
import { iOSNativeHelper, layout } from '../../utils';
import { View } from '../core/view';

export * from './scroll-view-common';

const majorVersion = iOSNativeHelper.MajorVersion;

@NativeClass
class UIScrollViewDelegateImpl extends NSObject implements UIScrollViewDelegate {
	private _owner: WeakRef<ScrollView>;

	public static initWithOwner(owner: WeakRef<ScrollView>): UIScrollViewDelegateImpl {
		let impl = <UIScrollViewDelegateImpl>UIScrollViewDelegateImpl.new();
		impl._owner = owner;

		return impl;
	}

	public scrollViewDidScroll(sv: UIScrollView): void {
		let owner = this._owner.get();
		if (owner) {
			owner.notify(<ScrollEventData>{
				object: owner,
				eventName: 'scroll',
				scrollX: owner.horizontalOffset,
				scrollY: owner.verticalOffset,
			});
		}
	}

	public static ObjCProtocols = [UIScrollViewDelegate];
}

export class ScrollView extends ScrollViewBase {
	public nativeViewProtected: UIScrollView;
	private _contentMeasuredWidth: number = 0;
	private _contentMeasuredHeight: number = 0;
	private _delegate: UIScrollViewDelegateImpl;

	public createNativeView() {
		const view = UIScrollView.new();

		return view;
	}

	initNativeView() {
		super.initNativeView();
		this.updateScrollBarVisibility(this.scrollBarIndicatorVisible);
		this._setNativeClipToBounds();
	}

	_setNativeClipToBounds() {
		// Always set clipsToBounds for scroll-view
		this.nativeViewProtected.clipsToBounds = true;
	}

	protected attachNative() {
		this._delegate = UIScrollViewDelegateImpl.initWithOwner(new WeakRef(this));
		this.nativeViewProtected.delegate = this._delegate;
	}

	protected dettachNative() {
		this.nativeViewProtected.delegate = null;
	}

	protected updateScrollBarVisibility(value) {
		if (!this.nativeViewProtected) {
			return;
		}
		if (this.orientation === 'horizontal') {
			this.nativeViewProtected.showsHorizontalScrollIndicator = value;
		} else {
			this.nativeViewProtected.showsVerticalScrollIndicator = value;
		}
	}

	get horizontalOffset(): number {
		return this.nativeViewProtected ? this.nativeViewProtected.contentOffset.x : 0;
	}

	get verticalOffset(): number {
		return this.nativeViewProtected ? this.nativeViewProtected.contentOffset.y : 0;
	}

	get scrollableWidth(): number {
		if (!this.nativeViewProtected || this.orientation !== 'horizontal') {
			return 0;
		}

		return Math.max(0, this.nativeViewProtected.contentSize.width - this.nativeViewProtected.bounds.size.width);
	}

	get scrollableHeight(): number {
		if (!this.nativeViewProtected || this.orientation !== 'vertical') {
			return 0;
		}

		return Math.max(0, this.nativeViewProtected.contentSize.height - this.nativeViewProtected.bounds.size.height);
	}

	[isScrollEnabledProperty.getDefault](): boolean {
		return this.nativeViewProtected.scrollEnabled;
	}
	[isScrollEnabledProperty.setNative](value: boolean) {
		this.nativeViewProtected.scrollEnabled = value;
	}

	[scrollBarIndicatorVisibleProperty.getDefault](): boolean {
		return true;
	}
	[scrollBarIndicatorVisibleProperty.setNative](value: boolean) {
		this.updateScrollBarVisibility(value);
	}

	public scrollToVerticalOffset(value: number, animated: boolean) {
		if (this.nativeViewProtected && this.orientation === 'vertical' && this.isScrollEnabled) {
			const bounds = this.nativeViewProtected.bounds.size;
			this.nativeViewProtected.scrollRectToVisibleAnimated(CGRectMake(0, value, bounds.width, bounds.height), animated);
		}
	}

	public scrollToHorizontalOffset(value: number, animated: boolean) {
		if (this.nativeViewProtected && this.orientation === 'horizontal' && this.isScrollEnabled) {
			const bounds = this.nativeViewProtected.bounds.size;
			this.nativeViewProtected.scrollRectToVisibleAnimated(CGRectMake(value, 0, bounds.width, bounds.height), animated);
		}
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		// Don't call measure because it will measure content twice.
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		const child = this.layoutView;
		this._contentMeasuredWidth = this.effectiveMinWidth;
		this._contentMeasuredHeight = this.effectiveMinHeight;

		if (child) {
			let childSize: { measuredWidth: number; measuredHeight: number };
			if (this.orientation === 'vertical') {
				childSize = View.measureChild(this, child, widthMeasureSpec, layout.makeMeasureSpec(0, layout.UNSPECIFIED));
			} else {
				childSize = View.measureChild(this, child, layout.makeMeasureSpec(0, layout.UNSPECIFIED), heightMeasureSpec);
			}

			this._contentMeasuredWidth = Math.max(childSize.measuredWidth, this.effectiveMinWidth);
			this._contentMeasuredHeight = Math.max(childSize.measuredHeight, this.effectiveMinHeight);
		}

		const widthAndState = View.resolveSizeAndState(this._contentMeasuredWidth, width, widthMode, 0);
		const heightAndState = View.resolveSizeAndState(this._contentMeasuredHeight, height, heightMode, 0);

		this.setMeasuredDimension(widthAndState, heightAndState);
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		const insets = this.getSafeAreaInsets();
		let width = right - left - insets.right - insets.left;
		let height = bottom - top - insets.bottom - insets.top;

		const nativeView = this.nativeViewProtected;

		if (majorVersion > 10) {
			// Disable automatic adjustment of scroll view insets
			// Consider exposing this as property with all 4 modes
			// https://developer.apple.com/documentation/uikit/uiscrollview/contentinsetadjustmentbehavior
			nativeView.contentInsetAdjustmentBehavior = 2;
		}

		let scrollWidth = width + insets.left + insets.right;
		let scrollHeight = height + insets.top + insets.bottom;
		if (this.orientation === 'horizontal') {
			scrollWidth = Math.max(this._contentMeasuredWidth + insets.left + insets.right, scrollWidth);
			width = Math.max(this._contentMeasuredWidth, width);
		} else {
			scrollHeight = Math.max(this._contentMeasuredHeight + insets.top + insets.bottom, scrollHeight);
			height = Math.max(this._contentMeasuredHeight, height);
		}

		nativeView.contentSize = CGSizeMake(layout.toDeviceIndependentPixels(scrollWidth), layout.toDeviceIndependentPixels(scrollHeight));
		View.layoutChild(this, this.layoutView, insets.left, insets.top, insets.left + width, insets.top + height);
	}

	public _onOrientationChanged() {
		this.updateScrollBarVisibility(this.scrollBarIndicatorVisible);
	}
}

ScrollView.prototype.recycleNativeView = 'auto';
