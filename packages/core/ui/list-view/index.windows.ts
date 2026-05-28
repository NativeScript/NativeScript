export * from './list-view-common';

import { ListViewBase, itemTemplatesProperty, rowHeightProperty, separatorColorProperty } from './list-view-common';
import { KeyedTemplate, View } from '../core/view';
import { ChangedData } from '../../data/observable-array';
import { Color } from '../../color';
import { layout } from '../../utils';

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const ITEMTAP = ListViewBase.itemTapEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;

export class ListView extends ListViewBase {
	nativeViewProtected!: Windows.UI.Xaml.Controls.ListView;

	private _itemClickDelegate: any = null;
	// All NS views in tree, keyed by item index
	private _views = new Map<number, View>();
	// All native views in ItemsSource, in order
	private _nativeItems: any[] = [];

	public createNativeView(): Windows.UI.Xaml.Controls.ListView {
		const lv = new Windows.UI.Xaml.Controls.ListView();
		(lv as any).IsItemClickEnabled = true;
		(lv as any).SelectionMode = 0; // None
		(lv as any).HorizontalAlignment = 3; // Stretch
		(lv as any).HorizontalContentAlignment = 3; // Stretch
		(lv as any).VerticalAlignment = 3; // Stretch
		return lv;
	}

	public initNativeView(): void {
		super.initNativeView();
		const lv = this.nativeViewProtected;
		if (!lv) return;
		const ref = new WeakRef(this);

		this._itemClickDelegate = new (Windows.UI.Xaml.Controls as any).ItemClickEventHandler((_sender: any, e: any) => {
			const owner = ref.deref();
			if (!owner) return;
			try {
				const clicked = e?.ClickedItem;
				if (clicked == null) return;
				const index: number = (clicked as any).__ns_index ?? -1;
				if (index < 0) return;
				const view = owner._views.get(index) ?? null;
				const section = (clicked as any).__ns_section;
				// Include section when available (sectioned lists)
				owner.notify({ eventName: ITEMTAP, object: owner, index, view, section });
			} catch (_e) {}
		});
		try { (lv as any).ItemClick = this._itemClickDelegate; } catch (_e) {}
	}

	public disposeNativeView(): void {
		try { (this.nativeViewProtected as any).ItemClick = null; } catch (_e) {}
		this._itemClickDelegate = null;
		this._destroyAllViews();
		super.disposeNativeView?.();
	}

	// Views are managed manually — skip the default native visual tree placement.
	public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
		if (this._views.has((child as any).__ns_index ?? -2)) return true;
		return super._addViewToNativeVisualTree(child, atIndex);
	}

	private _destroyAllViews(): void {
		for (const view of this._views.values()) {
			try { this._removeView(view); } catch (_e) {}
		}
		this._views.clear();
		this._nativeItems = [];
	}

	private _getItemCount(): number {
		if (!this.items) return 0;
		if (!this.sectioned) {
			const src = this.items as any;
			return typeof src.length === 'number' ? src.length : 0;
		}

		// Sectioned: sum lengths of all sections
		let total = 0;
		const sections = this._getSectionCount();
		for (let s = 0; s < sections; s++) {
			const itemsInSection = this._getItemsInSection(s) as any;
			if (!itemsInSection) continue;
			if (typeof itemsInSection.length === 'number') {
				total += itemsInSection.length;
			}
		}
		return total;
	}

	public refresh(): void {
		const lv = this.nativeViewProtected;
		if (!lv) return;

		this._destroyAllViews();

		const count = this._getItemCount();
		const nativeItems: any[] = [];

		if (this.sectioned) {
			let globalIndex = 0;
			const sections = this._getSectionCount();
			for (let s = 0; s < sections; s++) {
				const itemsInSection = this._getItemsInSection(s) as any;
				const sectionLen = itemsInSection && typeof itemsInSection.length === 'number' ? itemsInSection.length : 0;
				for (let j = 0; j < sectionLen; j++) {
					try {
						// Determine data item for template selection
						const dataItem = this._getDataItemInSection(s, j);
						let templateKey = 'default';
						try {
							if ((this as any)._itemTemplateSelector) {
								templateKey = (this as any)._itemTemplateSelector(dataItem, globalIndex, this.items);
							}
						} catch (_e) {}
						let template = this._itemTemplatesInternal[0];
						for (let t of this._itemTemplatesInternal) {
							if (t.key === templateKey) { template = t; break; }
						}

						// Create the view first
						let view: View | null = null as any;
						try { view = template.createView(); } catch (_e) {}
						if (!view) view = this._getDefaultItemContent(globalIndex);
						if (!view) { globalIndex++; continue; }

						(view as any).__ns_index = globalIndex;
						// Prepare (set bindingContext) before firing itemLoading so handlers see data-bound context
						this._prepareItemInSection(view, s, j);

						const args: any = { eventName: ITEMLOADING, object: this, index: globalIndex, view: view, section: s };
						this.notify(args);
						// If handler replaced the view, ensure it is prepared and indexed
						view = args.view || view;
						if (!(view as any).__ns_index) (view as any).__ns_index = globalIndex;
						this._prepareItemInSection(view, s, j);
						this._views.set(globalIndex, view as View);
						this._addView(view as View);

						const nativeContent = (view as any).nativeViewProtected;
						if (nativeContent) {
							(nativeContent as any).__ns_index = globalIndex;
							(nativeContent as any).__ns_section = s;
							(nativeContent as any).__ns_indexInSection = j;
							nativeItems.push(nativeContent);
						}
						globalIndex++;
					} catch (_e) {}
				}
			}
		} else {
			for (let i = 0; i < count; i++) {
				try {
					const template = this._getItemTemplate(i);
					// Create and prepare view before notifying so bindingContext is available in handlers
					let view: View | null = null as any;
					try { view = template.createView(); } catch (_e) {}
					if (!view) view = this._getDefaultItemContent(i);
					if (!view) continue;

					(view as any).__ns_index = i;
					this._prepareItem(view, i);
					const args: any = { eventName: ITEMLOADING, object: this, index: i, view: view };
					this.notify(args);
					view = args.view || view;
					if (!(view as any).__ns_index) (view as any).__ns_index = i;
					this._prepareItem(view, i);
					try { console.log('[ListView.win] prepared item', i, 'bindingContext=', (view as any).bindingContext ? 'object' : typeof (view as any).bindingContext, 'hasNative=', !!(view as any).nativeViewProtected); } catch (_e) {}
					this._views.set(i, view as View);
					this._addView(view as View);

					const nativeContent = (view as any).nativeViewProtected;
					if (nativeContent) {
						(nativeContent as any).__ns_index = i;
						nativeItems.push(nativeContent);
					}
				} catch (_e) {}
			}
		}

		this._nativeItems = nativeItems;
		try { (lv as any).ItemsSource = nativeItems; } catch (_e) {}

		if (count > 0) {
			this.notify({ eventName: LOADMOREITEMS, object: this });
		}
	}

	public eachChildView(callback: (child: View) => boolean): void {
		for (const view of this._views.values()) {
			if (!callback(view)) break;
		}
	}

	public isItemAtIndexVisible(index: number): boolean {
		try { return !!this.nativeViewProtected?.ContainerFromIndex(index); } catch (_e) { return false; }
	}

	public scrollToIndex(index: number): void {
		const item = this._nativeItems[index];
		if (!item) return;
		try { this.nativeViewProtected?.ScrollIntoView(item); } catch (_e) {}
	}

	public scrollToIndexAnimated(index: number): void {
		this.scrollToIndex(index);
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
		if (this.nativeViewProtected) this.refresh();
	}

	[rowHeightProperty.getDefault]() {
		return 'auto' as any;
	}
	[rowHeightProperty.setNative](_value: any) {
		// Applied per-item via _effectiveRowHeight in refresh().
	}

	[separatorColorProperty.getDefault](): Color {
		return null as unknown as Color;
	}
	[separatorColorProperty.setNative](_value: Color) {
		// WinUI ListView separators are style-based; not directly settable.
	}
}
