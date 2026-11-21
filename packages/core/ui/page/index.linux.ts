export * from './page-common';

import { PageBase, actionBarHiddenProperty } from './page-common';
import { View } from '../core/view';
import { layout } from '../../utils';

export class Page extends PageBase {
	get linux(): any {
		return this.nativeViewProtected;
	}

	private _showsActionBar(): boolean {
		return !!(this.hasActionBar && this.frame && this.frame._getNavBarVisible(this));
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		let barHeight = 0;
		if (this._showsActionBar()) {
			const bar = View.measureChild(this, this.actionBar, layout.makeMeasureSpec(width, layout.EXACTLY), layout.makeMeasureSpec(0, layout.UNSPECIFIED));
			barHeight = bar.measuredHeight;
		}
		const contentHeightSpec = heightMode === layout.UNSPECIFIED ? heightMeasureSpec : layout.makeMeasureSpec(Math.max(0, height - barHeight), heightMode);
		const result = View.measureChild(this, this.layoutView, widthMeasureSpec, contentHeightSpec);

		const measureWidth = Math.max(result.measuredWidth, this.effectiveMinWidth);
		const measureHeight = Math.max(result.measuredHeight + barHeight, this.effectiveMinHeight);
		this.setMeasuredDimension(View.resolveSizeAndState(measureWidth, width, widthMode, 0), View.resolveSizeAndState(measureHeight, height, heightMode, 0));
	}

	public onLayout(left: number, top: number, right: number, bottom: number) {
		let barHeight = 0;
		if (this._showsActionBar()) {
			barHeight = this.actionBar.getMeasuredHeight();
			View.layoutChild(this, this.actionBar, 0, 0, right - left, barHeight);
		} else if (this.hasActionBar) {
			View.layoutChild(this, this.actionBar, 0, 0, 0, 0);
		}
		View.layoutChild(this, this.layoutView, 0, barHeight, right - left, bottom - top);
	}

	[actionBarHiddenProperty.setNative](value: boolean) {
		if (this.hasActionBar) {
			this.actionBar.visibility = value ? 'collapse' : 'visible';
		}
		this.requestLayout();
	}
}
