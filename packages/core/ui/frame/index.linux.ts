import type { BackstackEntry } from './frame-common';
import { FrameBase, NavigationType } from './frame-common';
import { profile } from '../../profiling';
import type { Page } from '../page';
import { View } from '../core/view';
import { layout } from '../../utils';

export * from './frame-common';

export class Frame extends FrameBase {
	private _attachedPage: Page | null = null;

	get linux(): any {
		return this.nativeViewProtected;
	}

	public get navigationBarHeight(): number {
		const bar = this.currentPage?.hasActionBar ? this.currentPage.actionBar : null;
		return bar ? bar.getMeasuredHeight() : 0;
	}

	@profile
	public _navigateCore(backstackEntry: BackstackEntry) {
		super._navigateCore(backstackEntry);
		this.setCurrent(backstackEntry, this._executingContext?.navigationType ?? NavigationType.forward);
		this._showPage(backstackEntry.resolvedPage);
	}

	public _goBackCore(backstackEntry: BackstackEntry) {
		super._goBackCore(backstackEntry);
		this.setCurrent(backstackEntry, NavigationType.back);
		this._showPage(backstackEntry.resolvedPage);
	}

	public setCurrent(entry: BackstackEntry, navigationType: NavigationType): void {
		const current = this._currentEntry;
		if (entry?.resolvedPage && current !== entry) {
			this._updateBackstack(entry, navigationType);
			super.setCurrent(entry, navigationType);
			this._processNavigationQueue(entry.resolvedPage);
		} else {
			this._executingContext = null;
			this._processNextNavigationEntry();
		}
	}

	/** Pages aren't NativeScript visual children (see FrameBase): swap the native child here. */
	private _showPage(page: Page): void {
		const host = this.nativeViewProtected;
		const native = page?.nativeViewProtected;
		if (!host || !native) {
			return;
		}
		const previous = this._attachedPage?.nativeViewProtected;
		if (previous && previous !== native && gtk_widget_get_parent(previous)) {
			gtk_widget_unparent(previous);
		}
		if (!gtk_widget_get_parent(native)) {
			gtk_widget_set_parent(native, host);
		}
		this._attachedPage = page;
		this._updateActionBar(page);
		this.requestLayout();
	}

	public _updateActionBar(page?: Page, disableNavBarAnimation?: boolean): void {
		super._updateActionBar(page, disableNavBarAnimation);
		page = page ?? this.currentPage;
		if (page?.hasActionBar) {
			page.actionBar.update();
			page.requestLayout();
		}
	}

	public _getNavBarVisible(page: Page): boolean {
		switch (this.actionBarVisibility) {
			case 'always':
				return true;
			case 'never':
				return false;
			default:
				if (page && page.actionBarHidden !== undefined) {
					return !page.actionBarHidden;
				}
				return !!(this.backStack.length > 0 || (page?.hasActionBar && !page.actionBar._isEmpty()));
		}
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);
		const page = this.currentPage;
		const result = page ? View.measureChild(this, page, widthMeasureSpec, heightMeasureSpec) : { measuredWidth: 0, measuredHeight: 0 };
		this.setMeasuredDimension(View.resolveSizeAndState(Math.max(result.measuredWidth, width), width, widthMode, 0), View.resolveSizeAndState(Math.max(result.measuredHeight, height), height, heightMode, 0));
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		const page = this.currentPage;
		if (page) {
			View.layoutChild(this, page, 0, 0, right - left, bottom - top);
		}
	}

	public disposeNativeView(): void {
		this._attachedPage = null;
		super.disposeNativeView();
	}
}

// attach on global, so it can be overwritten in NativeScript Angular
global.__onLiveSyncCore = Frame.reloadPage;

export function setActivityCallbacks(_callbacks: any): void {}
export function setWindowContent(_view: any): void {}
