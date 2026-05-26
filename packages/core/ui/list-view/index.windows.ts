export * from './list-view-common';

import { ListViewBase } from './list-view-common';
import { View } from '../core/view';
import { ChangedData } from '../../data/observable-array';

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;
const ITEMTAP = ListViewBase.itemTapEvent;

export class ListView extends ListViewBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.ScrollViewer;

	private _stackPanel: Windows.UI.Xaml.Controls.StackPanel | null = null;
	private _itemViews: View[] = [];

	public createNativeView() {
		const scrollViewer = new Windows.UI.Xaml.Controls.ScrollViewer();
		this._stackPanel = new Windows.UI.Xaml.Controls.StackPanel();
		try { (this._stackPanel as any).HorizontalAlignment = 3; } catch (_e) {}
		try { (scrollViewer as any).Content = this._stackPanel; } catch (_e) {}
		try { (scrollViewer as any).HorizontalScrollBarVisibility = 0; } catch (_e) {} // Disabled
		try { (scrollViewer as any).VerticalScrollBarVisibility = 1; } catch (_e) {}   // Auto
		return scrollViewer;
	}

	get windows(): Windows.UI.Xaml.Controls.ScrollViewer {
		return this.nativeViewProtected;
	}

	// ScrollViewer has no .Children panel — suppress default child-add
	public _addViewToNativeVisualTree(_child: any): boolean {
		return true;
	}

	public eachChildView(callback: (child: View) => boolean): void {
		for (const view of this._itemViews) {
			if (!callback(view)) break;
		}
	}

	public onLoaded() {
		super.onLoaded();
		this.refresh();
	}

	public refresh() {
		const panel = this._stackPanel;
		if (!panel) return;

		const oldViews = this._itemViews.slice();
		this._itemViews = [];
		try { (panel as any).Children.Clear(); } catch (_e) {}
		for (const view of oldViews) {
			try { this._removeView(view); } catch (_e) {}
		}

		if (!this.items) return;

		const len = (this.items as any)?.length ?? 0;
		for (let i = 0; i < len; i++) {
			const view = this._makeItemView(i);
			if (!view) continue;

			this._itemViews.push(view);

			try { this._addView(view); } catch (_e) { continue; }

			const nativeEl = (view as any).nativeViewProtected;
			if (nativeEl) {
				try { (nativeEl as any).HorizontalAlignment = 3; } catch (_e) {}
				try { (panel as any).Children.Append(nativeEl); } catch (_e) {}
				// Wire itemTap: fire on Tapped (covers taps from any child element via bubbling)
				const capturedIndex = i;
				const capturedView = view;
				try {
					(nativeEl as any).Tapped = (_s: any, _e: any) => {
						this.notify({
							eventName: ITEMTAP,
							object: this,
							index: capturedIndex,
							view: capturedView,
						});
					};
				} catch (_e) {}
			}
		}

		if (len > 0) {
			this.notify({ eventName: LOADMOREITEMS, object: this });
		}
	}

	private _makeItemView(index: number): View | null {
		const template = this._getItemTemplate(index);

		const args: any = {
			eventName: ITEMLOADING,
			object: this,
			index,
			view: null as any,
			android: undefined,
			ios: undefined,
		};

		try { args.view = template.createView(); } catch (_e) {}
		if (!args.view) args.view = this._getDefaultItemContent(index);

		this.notify(args);
		if (!args.view) args.view = this._getDefaultItemContent(index);

		const view: View = args.view;
		this._prepareItem(view, index);
		return view;
	}

	public scrollToIndex(index: number) {
		const panel = this._stackPanel;
		if (!panel) return;
		try {
			const children = (panel as any).Children;
			if (index >= 0 && index < children.Size) {
				const child = children.GetAt(index);
				child?.BringIntoView?.();
			}
		} catch (_e) {}
	}

	public _onItemsChanged(_data: ChangedData<any>) {
		this.refresh();
	}

	public disposeNativeView(): void {
		const oldViews = this._itemViews.slice();
		this._itemViews = [];
		for (const view of oldViews) {
			try { this._removeView(view); } catch (_e) {}
		}
		super.disposeNativeView?.();
	}
}
