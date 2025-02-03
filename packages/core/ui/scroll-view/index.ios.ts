import { ScrollEventData } from '.';
import { ScrollViewBase, scrollBarIndicatorVisibleProperty, isScrollEnabledProperty } from './scroll-view-common';
import { layout } from '../../utils';
import { SDK_VERSION } from '../../utils/constants';
import { View } from '../core/view';

export * from './scroll-view-common';

@NativeClass
class UIScrollViewDelegateImpl extends NSObject implements UIScrollViewDelegate {
	private _owner: WeakRef<ScrollView>;

	public static initWithOwner(owner: WeakRef<ScrollView>): UIScrollViewDelegateImpl {
		const impl = <UIScrollViewDelegateImpl>UIScrollViewDelegateImpl.new();
		impl._owner = owner;

		return impl;
	}

	public scrollViewDidScroll(sv: UIScrollView): void {
		const owner = this._owner?.deref();
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

	private _contentMeasuredWidth = 0;
	private _contentMeasuredHeight = 0;
	private _isFirstLayout: boolean = true;
	private _delegate: UIScrollViewDelegateImpl;

	public createNativeView() {
		return UIScrollView.new();
	}

	initNativeView() {
		super.initNativeView();
		this.updateScrollBarVisibility(this.scrollBarIndicatorVisible);
		this._setNativeClipToBounds();
	}

	public disposeNativeView() {
		super.disposeNativeView();

		this._isFirstLayout = true;
	}

	_setNativeClipToBounds() {
		if (!this.nativeViewProtected) {
			return;
		}
		// Always set clipsToBounds for scroll-view
		this.nativeViewProtected.clipsToBounds = true;
	}

	protected attachNative() {
		if (!this._delegate) {
			this._delegate = UIScrollViewDelegateImpl.initWithOwner(new WeakRef(this));
			this.nativeViewProtected.delegate = this._delegate;
		}
	}

	protected detachNative() {
		if (this._delegate) {
			if (this.nativeViewProtected) {
				this.nativeViewProtected.delegate = null;
			}
			this._delegate = null;
		}
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
		if (!this.nativeViewProtected) {
			return;
		}

		const insets = this.getSafeAreaInsets();

		let scrollWidth = right - left - insets.right - insets.left;
		let scrollHeight = bottom - top - insets.bottom - insets.top;

		if (SDK_VERSION > 10) {
			// Disable automatic adjustment of scroll view insets
			// Consider exposing this as property with all 4 modes
			// https://developer.apple.com/documentation/uikit/uiscrollview/contentinsetadjustmentbehavior
			this.nativeViewProtected.contentInsetAdjustmentBehavior = 2;
		}

		let scrollInsetWidth = scrollWidth + insets.left + insets.right;
		let scrollInsetHeight = scrollHeight + insets.top + insets.bottom;

		if (this.orientation === 'horizontal') {
			scrollInsetWidth = Math.max(this._contentMeasuredWidth + insets.left + insets.right, scrollInsetWidth);
			scrollWidth = Math.max(this._contentMeasuredWidth, scrollWidth);
		} else {
			scrollInsetHeight = Math.max(this._contentMeasuredHeight + insets.top + insets.bottom, scrollInsetHeight);
			scrollHeight = Math.max(this._contentMeasuredHeight, scrollHeight);
		}

		this.nativeViewProtected.contentSize = CGSizeMake(layout.toDeviceIndependentPixels(scrollInsetWidth), layout.toDeviceIndependentPixels(scrollInsetHeight));

		// RTL handling
		if (this.orientation === 'horizontal') {
			if (this._isFirstLayout) {
				this._isFirstLayout = false;

				if (this.direction === 'rtl') {
					const scrollableWidth = scrollInsetWidth - this.getMeasuredWidth();
					if (scrollableWidth > 0) {
						this.nativeViewProtected.contentOffset = CGPointMake(layout.toDeviceIndependentPixels(scrollableWidth), this.verticalOffset);
					}
				}
			}
		}

		View.layoutChild(this, this.layoutView, insets.left, insets.top, insets.left + scrollWidth, insets.top + scrollHeight);
	}

	public _onOrientationChanged() {
		this._isFirstLayout = true;
		this.updateScrollBarVisibility(this.scrollBarIndicatorVisible);
	}
}

ScrollView.prototype.recycleNativeView = 'auto';
