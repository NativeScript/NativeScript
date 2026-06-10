export * from './list-view-common';

import { ListViewBase, itemTemplatesProperty, rowHeightProperty, separatorColorProperty } from './list-view-common';
import { KeyedTemplate, View } from '../core/view';
import { ChangedData } from '../../data/observable-array';
import { Color } from '../../color';
import { Builder } from '../builder';

declare const NSWinRT: any;

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const ITEMTAP = ListViewBase.itemTapEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;
const HEADER_KEY = '__ns_header';

const CHOOSING_TYPE = 'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Controls.ListViewBase,Microsoft.UI.Xaml.Controls.ChoosingItemContainerEventArgs>';
const CC_TYPE = 'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Controls.ListViewBase,Microsoft.UI.Xaml.Controls.ContainerContentChangingEventArgs>';

interface Row {
	header: boolean;
	templateKey: string;
	globalIndex: number;
	section?: number;
	indexInSection?: number;
	data: any;
}

// Virtualized + recycling ListView (RecyclerView/UITableView model).
// ItemsSource is a native IVector<IInspectable> (NSWinRT.makeItemsSource) — JS arrays can't marshal to ItemsSource.
// ChoosingItemContainer supplies our own ListViewItem containers so WinUI virtualizes + recycles them, avoiding the
// DataTemplate ContentTemplateRoot typing problem. ContainerContentChanging binds each NS view as a ViewHolder —
// reusing on rebind, building only on first use or template change.
export class ListView extends ListViewBase {
	nativeViewProtected!: Microsoft.UI.Xaml.Controls.ListView;

	private _clickDelegate: Microsoft.UI.Xaml.Controls.ItemClickEventHandler | null = null;
	// Held so their JS wrappers aren't GC'd. If collected, ChoosingItemContainer/ContainerContentChanging
	// fire into dead callbacks → rows never bind → blank/white on scroll. (GC problem, NOT thread-marshal;
	// JS and these XAML events share the UI thread.)
	private _choosingDelegate: any = null;
	private _ccDelegate: any = null;
	private _rows: Row[] = [];
	private _viewPool = new Map<string, View[]>();
	private _active = new Set<View>();
	// Bumped on every refresh() so containers holding a view from a previous data set
	// (torn down by _teardown) are detected and never reused.
	private _generation = 0;

	public createNativeView(): Microsoft.UI.Xaml.Controls.ListView {
		const lv = new Microsoft.UI.Xaml.Controls.ListView();
		lv.IsItemClickEnabled = true;
		lv.SelectionMode = 0; // None
		lv.HorizontalAlignment = 3; // Stretch
		lv.HorizontalContentAlignment = 3;
		lv.VerticalAlignment = 3;
		return lv;
	}

	public initNativeView(): void {
		super.initNativeView();
		const lv = this.nativeViewProtected;
		if (!lv) return;
		const ref = new WeakRef(this);

		// ChoosingItemContainer/ContainerContentChanging are generic TypedEventHandlers — runtime can't derive
		// their parameterized GUID from a plain assignment, so build via asDelegate (can throw; keep guarded).
		try {
			this._choosingDelegate = NSWinRT.asDelegate(CHOOSING_TYPE, (_s: any, args: any) => {
				ref.deref()?._onChoosingItemContainer(args);
			});
			lv.ChoosingItemContainer = this._choosingDelegate;
		} catch (_e) {}

		try {
			this._ccDelegate = NSWinRT.asDelegate(CC_TYPE, (_s: any, args: any) => {
				ref.deref()?._onContainerContentChanging(args);
			});
			lv.ContainerContentChanging = this._ccDelegate;
		} catch (_e) {}

		this._clickDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.Controls.ItemClickEventHandler', (_s: any, e: any) => {
			const owner = ref.deref();
			if (!owner) return;
			try {
				const lv2 = owner.nativeViewProtected;
				const container = lv2.ContainerFromItem(e.ClickedItem);
				const idx = container ? (container as any).__ns_row_index ?? -1 : -1;
				const row = owner._rows[idx];
				if (!row || row.header || row.globalIndex < 0) return;
				owner.notify({ eventName: ITEMTAP, object: owner, index: row.globalIndex, view: owner._findActive(row.globalIndex), section: row.section });
			} catch (_e) {}
		});
		lv.ItemClick = this._clickDelegate;
	}

	public disposeNativeView(): void {
		const lv = this.nativeViewProtected;
		lv.ChoosingItemContainer = null;
		lv.ContainerContentChanging = null;
		lv.ItemClick = null;
		this._clickDelegate = null;
		this._choosingDelegate = null;
		this._ccDelegate = null;
		this._teardown();
		super.disposeNativeView?.();
	}

	public _addViewToNativeVisualTree(_child: View, _atIndex?: number): boolean {
		return true;
	}

	private _keyForData(data: any, globalIndex: number): string {
		const selector = (this as any)._itemTemplateSelector;
		if (typeof selector === 'function') {
			try { return selector(data, globalIndex, this.items); } catch (_e) {}
		}
		return 'default';
	}

	private _templateByKey(key: string): KeyedTemplate {
		for (const t of this._itemTemplatesInternal) {
			if (t.key === key) return t;
		}
		return this._itemTemplatesInternal[0];
	}

	public refresh(): void {
		const lv = this.nativeViewProtected as any;
		if (!lv) return;

		this._teardown();

		const rows: Row[] = [];
		if (this.sectioned) {
			let gi = 0;
			const sections = this._getSectionCount();
			for (let s = 0; s < sections; s++) {
				const sectionData = (this as any)._getSectionData ? this._getSectionData(s) : null;
				if (this.stickyHeaderTemplate) {
					rows.push({ header: true, templateKey: HEADER_KEY, globalIndex: -1, section: s, data: sectionData ?? { title: '' } });
				}
				const itemsInSection = this._getItemsInSection(s) as any;
				const len = itemsInSection && typeof itemsInSection.length === 'number' ? itemsInSection.length : 0;
				for (let j = 0; j < len; j++) {
					const data = this._getDataItemInSection(s, j);
					rows.push({ header: false, templateKey: this._keyForData(data, gi), globalIndex: gi, section: s, indexInSection: j, data });
					gi++;
				}
			}
		} else {
			const src = this.items as any;
			const count = src && typeof src.length === 'number' ? src.length : 0;
			for (let i = 0; i < count; i++) {
				const data = (this as any)._getDataItem ? (this as any)._getDataItem(i) : src[i];
				rows.push({ header: false, templateKey: this._keyForData(data, i), globalIndex: i, data });
			}
		}

		this._rows = rows;
		try {
			lv.ItemsSource = typeof NSWinRT !== 'undefined' && NSWinRT.makeItemsSource ? NSWinRT.makeItemsSource(rows.length) : null;
		} catch (_e) {}

		if (rows.length) {
			this.notify({ eventName: LOADMOREITEMS, object: this });
		}
	}

	private _onChoosingItemContainer(args: any): void {
		try {
			if (!args.ItemContainer) {
				args.ItemContainer = this._makeContainer();
			}
			args.IsContainerPrepared = true;
		} catch (_e) {}
	}

	private _makeContainer(): Microsoft.UI.Xaml.Controls.ListViewItem {
		const lvi = new Microsoft.UI.Xaml.Controls.ListViewItem();
		lvi.HorizontalContentAlignment = 3; // Stretch
		lvi.VerticalContentAlignment = 0; // Top
		lvi.Padding = Microsoft.UI.Xaml.ThicknessHelper.FromUniformLength(0);
		// Reserve a deterministic min height so a recycled container never collapses to 0
		// before its content re-measures (0-height rows render blank and skew scroll math).
		lvi.MinHeight = this._effectiveRowHeight && this._effectiveRowHeight > 0 ? this._effectiveRowHeight : 52;
		return lvi;
	}

	private _onContainerContentChanging(args: any): void {
		const container = args?.ItemContainer;
		if (!container) return;

		// Container leaving the viewport: return its view to the pool (bounded view creation = virtualization).
		// _detach clears Content so re-attaching to another container doesn't throw "element already has a parent".
		if (args.InRecycleQueue) {
			this._detach(container);
			try { args.Handled = true; } catch (_e) {}
			return;
		}

		const idx = args.ItemIndex;
		const row = this._rows[idx];
		if (!row) { try { args.Handled = true; } catch (_e) {} return; }
		(container as any).__ns_row_index = idx;

		// Reuse the container's current view only if it's from this data set AND the same template;
		// otherwise repool it and obtain the right one.
		let view = (container as any).__ns_view as View;
		if (view && ((view as any).__ns_gen !== this._generation || (view as any).__ns_templateKey !== row.templateKey)) {
			this._detach(container);
			view = null as any;
		}
		if (!view) {
			view = this._obtain(row);
			this._attach(container, view);
		}

		this._bind(view, row);

		const native = (view as any)?.nativeViewProtected;
		try { native.HorizontalAlignment = 3; } catch (_e) {}
		try { native.MinHeight = (this._effectiveRowHeight && this._effectiveRowHeight > 0) ? this._effectiveRowHeight : 44; } catch (_e) {}
		try { container.IsHitTestVisible = !row.header; } catch (_e) {}
		// WinUI may have cleared a reused container's Content; re-attach if needed.
		try { if (container.Content !== native) container.Content = native; } catch (_e) {}
		try { args.Handled = true; } catch (_e) {}
	}

	// Host a view's native element inside a container, first detaching it from any previous
	// container so one native element never has two parents.
	private _attach(container: any, view: View): void {
		const native = (view as any)?.nativeViewProtected;
		const prev = (view as any).__ns_container;
		if (prev && prev !== container) {
			try { if (prev.Content === native) prev.Content = null; } catch (_e) {}
			if (prev.__ns_view === view) prev.__ns_view = null;
		}
		container.__ns_view = view;
		(view as any).__ns_container = container;
		try { if (container.Content !== native) container.Content = native; } catch (_e) {}
	}

	// Detach the container's view, clear its Content, and return the view to the pool
	// (unless it's stale from a previous data set, in which case just drop it).
	private _detach(container: any): void {
		const view = (container as any).__ns_view as View;
		container.__ns_view = null;
		if (!view) return;
		const native = (view as any)?.nativeViewProtected;
		try { if (container.Content === native) container.Content = null; } catch (_e) {}
		if ((view as any).__ns_container === container) (view as any).__ns_container = null;
		if ((view as any).__ns_gen === this._generation) {
			this._recycle(view);
		}
	}

	private _obtain(row: Row): View {
		const key = row.templateKey;
		const free = this._viewPool.get(key);
		if (free && free.length) {
			return free.pop() as View;
		}

		let view: View | null = null;
		if (row.header) {
			const tmpl = this.stickyHeaderTemplate as any;
			try { view = typeof tmpl === 'function' ? tmpl() : Builder.parse(tmpl, this); } catch (_e) {}
		} else {
			const t = this._templateByKey(key);
			try { view = t?.createView() ?? null; } catch (_e) {}
			if (!view) view = this._getDefaultItemContent(row.globalIndex);
		}
		if (!view) view = this._getDefaultItemContent(row.globalIndex);

		(view as any).__ns_templateKey = key;
		(view as any).__ns_gen = this._generation;
		(view as any).__ns_isNew = true;
		if (!(view as any).nativeViewProtected) {
			try { view._setupUI(this._context || ({} as any)); } catch (_e) {}
		}
		this._addView(view);
		this._active.add(view);
		return view;
	}

	private _bind(view: View, row: Row): void {
		try { (view as any).bindingContext = row.data; } catch (_e) {}
		if (!row.header && (view as any).__ns_isNew) {
			const args: any = { eventName: ITEMLOADING, object: this, index: row.globalIndex, view, bindingContext: row.data, section: row.section };
			this.notify(args);
		}
		(view as any).__ns_isNew = false;
	}

	private _recycle(view: View): void {
		const key = (view as any).__ns_templateKey || 'default';
		let arr = this._viewPool.get(key);
		if (!arr) { arr = []; this._viewPool.set(key, arr); }
		arr.push(view);
	}

	private _findActive(globalIndex: number): View | null {
		const row = this._rows[globalIndex];
		if (!row) return null;
		for (const v of this._active) {
			if ((v as any).bindingContext === row.data) return v;
		}
		return null;
	}

	private _teardown(): void {
		// Invalidate any views still referenced by live containers — the generation guard in
		// _onContainerContentChanging will discard them instead of reusing torn-down views.
		this._generation++;
		for (const v of this._active) {
			try { this._removeView(v); } catch (_e) {}
		}
		this._active.clear();
		this._viewPool.clear();
		this._rows = [];
		try { (this.nativeViewProtected as any).ItemsSource = null; } catch (_e) {}
	}

	public eachChildView(callback: (child: View) => boolean): void {
		for (const v of this._active) {
			if (!callback(v)) break;
		}
	}

	public isItemAtIndexVisible(index: number): boolean {
		try { return !!this.nativeViewProtected?.ContainerFromIndex(index); } catch (_e) { return false; }
	}

	public scrollToIndex(index: number): void {
		try { this.nativeViewProtected?.ScrollIntoView((this.nativeViewProtected as any).Items.GetAt(index)); } catch (_e) {}
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
	[rowHeightProperty.setNative](_value: any) {}

	[separatorColorProperty.getDefault](): Color {
		return null as unknown as Color;
	}
	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[separatorColorProperty.setNative](_value: Color) {}
}
