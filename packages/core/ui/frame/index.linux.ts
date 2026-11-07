import type { BackstackEntry } from './frame-common';
import { FrameBase, NavigationType } from './frame-common';
import { profile } from '../../profiling';
import type { Page } from '../page';
import { View } from '../core/view';
import { eachDescendant, type ViewBase } from '../core/view-base';
import { layout } from '../../utils';
import { addressOf } from '../../utils/gtk.linux';

export * from './frame-common';

export class Frame extends FrameBase {
	private _attachedPage: Page | null = null;
	private _pageFocus = new WeakMap<Page, WeakRef<ViewBase>>();

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
			this._saveFocus(this._attachedPage);
			gtk_widget_unparent(previous);
		}
		if (!gtk_widget_get_parent(native)) {
			gtk_widget_set_parent(native, host);
			// Without it GTK focuses the window's first focusable widget, and a ScrollView holding it
			// scrolls there
			const focus = this._pageFocus.get(page)?.deref()?.nativeViewProtected;
			if (focus && gtk_widget_is_ancestor(focus, native)) {
				gtk_widget_grab_focus(focus);
			}
		}
		this._attachedPage = page;
		this._updateActionBar(page);
		this.requestLayout();
	}

	/** Remembers the view holding keyboard focus in a page that's leaving. */
	private _saveFocus(page: Page): void {
		const native = page.nativeViewProtected;
		const root = gtk_widget_get_root(native);
		const focus = root && gtk_root_get_focus(root);
		this._pageFocus.delete(page);
		if (!focus || !gtk_widget_is_ancestor(focus, native)) {
			return;
		}
		// widget -> distance from the focus widget; the closest NativeScript view wins
		const depth = new Map<number, number>();
		for (let widget = focus, i = 0; widget && addressOf(widget) !== addressOf(native); widget = gtk_widget_get_parent(widget), i++) {
			depth.set(addressOf(widget), i);
		}
		let best: ViewBase | null = null;
		let bestDepth = Infinity;
		eachDescendant(page, (view) => {
			const d = depth.get(addressOf(view.nativeViewProtected));
			if (d !== undefined && d < bestDepth) {
				best = view;
				bestDepth = d;
			}
			return bestDepth > 0;
		});
		if (best) {
			this._pageFocus.set(page, new WeakRef(best));
		}
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

export function setActivityCallbacks(_callbacks: any): void {}
export function setWindowContent(_view: any): void {}
