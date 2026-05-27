export * from './list-view-common';

import { ListViewBase, itemTemplatesProperty } from './list-view-common';
import { KeyedTemplate, View } from '../core/view';
import { ChangedData } from '../../data/observable-array';

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const ITEMTAP = ListViewBase.itemTapEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;

export class ListView extends ListViewBase {
	nativeViewProtected!: Windows.UI.Xaml.Controls.ListView;

	private _itemClickDelegate: any = null;
	private _containerChangingDelegate: any = null;
	// Views waiting to be reused, keyed by template key
	private _pool = new Map<string, View[]>();
	// WinUI container element → NS view
	private _containerToView = new Map<any, View>();
	// All NS views in the NS tree (active + pooled), for _addViewToNativeVisualTree interception
	private _managedViews = new Set<View>();

	public createNativeView(): Windows.UI.Xaml.Controls.ListView {
		const lv = new Windows.UI.Xaml.Controls.ListView();
		lv.IsItemClickEnabled = true;
		lv.SelectionMode = 0; // None
		lv.HorizontalAlignment = 3; // Stretch
		lv.HorizontalContentAlignment = 3; // Stretch
		lv.VerticalAlignment = 3; // Stretch
		return lv;
	}

	public initNativeView(): void {
		super.initNativeView();
		const lv = this.nativeViewProtected;
		if (!lv) return;
		const ref = new WeakRef(this);

		this._itemClickDelegate = new Windows.UI.Xaml.Controls.ItemClickEventHandler((_sender: any, e: Windows.UI.Xaml.Controls.ItemClickEventArgs) => {
			const owner = ref.deref();
			if (!owner) return;
			try {
				const marker = e?.ClickedItem;
				if (marker == null) return;
				const index: number = (marker as any).__ns_index ?? -1;
				if (index < 0) return;
				const container = lv.ContainerFromIndex(index);
				const view = owner._containerToView.get(container) ?? null;
				owner.notify({ eventName: ITEMTAP, object: owner, index, view });
			} catch (_e) {}
		});
		lv.ItemClick = this._itemClickDelegate;

		// ContainerContentChanging fires when a virtualised container enters or
		// leaves the viewport. InRecycleQueue === true means the container is
		// being returned to the pool — treat that as "clear container".
		// ContainerContentChanging uses TypedEventHandler — assign a raw function via any
		this._containerChangingDelegate = (_sender: any, args: any) => {
			const owner = ref.deref();
			if (!owner) return;
			try {
				if (args.InRecycleQueue) {
					owner._recycleContainer(args.ItemContainer);
				} else {
					owner._prepareContainer(args.ItemContainer, args.ItemIndex as number);
					args.Handled = true;
				}
			} catch (_e) {}
		};
		(lv as any).ContainerContentChanging = this._containerChangingDelegate;
	}

	public disposeNativeView(): void {
		const lv = this.nativeViewProtected;
		if (lv) {
			lv.ItemClick = null;
			try { (lv as any).ContainerContentChanging = null; } catch (_e) {}
		}
		this._itemClickDelegate = null;
		this._containerChangingDelegate = null;
		this._destroyAllViews();
		super.disposeNativeView?.();
	}

	// Item views are placed as container.Content — skip adding to our own native children.
	public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
		if (this._managedViews.has(child)) return true;
		return super._addViewToNativeVisualTree(child, atIndex);
	}

	public _prepareContainer(element: any, index: number): void {
		const template = this._getItemTemplate(index);
		const key = template.key;

		let view: View | undefined = this._pool.get(key)?.pop();
		if (view) {
			this._prepareItem(view, index);
		} else {
			const args: any = { eventName: ITEMLOADING, object: this, index, view: null as any };
			try { args.view = template.createView(); } catch (_e) {}
			if (!args.view) args.view = this._getDefaultItemContent(index);
			this.notify(args);
			if (!args.view) args.view = this._getDefaultItemContent(index);
			view = args.view as View;
			this._prepareItem(view, index);

			// Mark before _addView so _addViewToNativeVisualTree skips native placement.
			this._managedViews.add(view);
			this._addView(view);
		}

		if (!view) return;

		try {
			(element as any).HorizontalAlignment = 3; // Stretch
			(element as any).HorizontalContentAlignment = 3; // Stretch
			(element as any).Padding = Windows.UI.Xaml.ThicknessHelper.FromUniformLength(0);
		} catch (_e) {}

		const nativeContent = (view as any).nativeViewProtected;
		if (nativeContent) {
			try { (element as any).Content = nativeContent; } catch (_e) {}
		}

		this._containerToView.set(element, view);
		(element as any).__ns_templateKey = key;

		if (index === this._getItemCount() - 1) {
			this.notify({ eventName: LOADMOREITEMS, object: this });
		}
	}

	public _recycleContainer(element: any): void {
		const view = this._containerToView.get(element);
		if (view) {
			try { (element as any).Content = null; } catch (_e) {}
			const key: string = (element as any).__ns_templateKey ?? 'default';
			let pool = this._pool.get(key);
			if (!pool) { pool = []; this._pool.set(key, pool); }
			pool.push(view);
			this._containerToView.delete(element);
		}
		try { delete (element as any).__ns_templateKey; } catch (_e) {}
	}

	private _destroyAllViews(): void {
		for (const [container] of this._containerToView) {
			try { (container as any).Content = null; } catch (_e) {}
		}
		this._containerToView.clear();
		this._pool.clear();
		for (const view of this._managedViews) {
			try { this._removeView(view); } catch (_e) {}
		}
		this._managedViews.clear();
	}

	private _getItemCount(): number {
		if (!this.items) return 0;
		const src = this.items as any;
		return typeof src.length === 'number' ? src.length : 0;
	}

	public refresh(): void {
		const lv = this.nativeViewProtected;
		if (!lv) return;

		// Clear ItemsSource first; ContainerContentChanging with InRecycleQueue
		// fires for visible containers, returning their views to the pool.
		(lv as any).ItemsSource = null;

		// Destroy everything so stale views are not reused across a full refresh.
		this._destroyAllViews();

		const count = this._getItemCount();
		const markers: any[] = new Array(count);
		for (let i = 0; i < count; i++) {
			markers[i] = { __ns_index: i };
		}
		(lv as any).ItemsSource = markers;
	}

	public eachChildView(callback: (child: View) => boolean): void {
		for (const view of this._managedViews) {
			if (!callback(view)) break;
		}
	}

	public isItemAtIndexVisible(index: number): boolean {
		return !!this.nativeViewProtected?.ContainerFromIndex(index);
	}

	public scrollToIndex(index: number): void {
		const lv = this.nativeViewProtected;
		if (!lv || index < 0 || index >= this._getItemCount()) return;
		try {
			const item = (lv as any).Items?.GetAt(index);
			if (item) lv.ScrollIntoView(item);
		} catch (_e) {}
	}

	public onLoaded(): void {
		super.onLoaded();
		this.refresh();
	}

	public _onItemsChanged(_data: ChangedData<any>): void {
		this.refresh();
	}

	[itemTemplatesProperty.getDefault](): KeyedTemplate[] {
		return null as unknown as KeyedTemplate[];
	}
	[itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
		this._itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);
		if (value) {
			this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
		}
		if (this.nativeViewProtected) {
			this.refresh();
		}
	}
}
