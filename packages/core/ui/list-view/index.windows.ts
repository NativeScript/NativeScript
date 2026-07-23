export * from './list-view-common';

import { ListViewBase, itemTemplatesProperty, rowHeightProperty, separatorColorProperty } from './list-view-common';
import { KeyedTemplate, View } from '../core/view';
import { ChangedData, ChangeType } from '../../data/observable-array';
import { Color } from '../../color';
import { Builder } from '../builder';

declare const NSWinRT: any;

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const ITEMTAP = ListViewBase.itemTapEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;
const HEADER_KEY = '__ns_header';
// Fire loadMoreItems when a container this many rows from the end is realized during scroll.
const LOAD_MORE_THRESHOLD = 8;
// Above this many touched rows in one mutation, granular updates stop being a win: WinRT has no range
// event (only per-item or whole-collection Reset), so we defer to a single Reset via refresh() instead.
const GRANULAR_MAX = 64;

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
	// Held so their JS wrappers aren't GC'd — if collected, the events fire into dead callbacks and rows never bind.
	private _choosingDelegate: any = null;
	private _ccDelegate: any = null;
	private _rows: Row[] = [];
	// Data-set length at which loadMoreItems last fired; reset to -1 on refresh so a longer list can fire again.
	private _lastLoadMoreLen = -1;
	private _cacheLengthSet = false;
	// The observable index vector assigned to ItemsSource. Kept so growth can extend it in place
	// (NSWinRT.extendItemsSource) — reading lv.ItemsSource back yields an untyped proxy without IVector methods.
	private _itemsSource: any = null;
	private _viewPool = new Map<string, View[]>();
	private _active = new Set<View>();
	// Bumped on every refresh() so containers holding a view from a previous data set
	// (torn down by _teardown) are detected and never reused.
	private _generation = 0;
	// Row-separator colour (drawn as a 1px composition line at each container's bottom edge); null = none.
	private _separatorColor: Windows.UI.Color | null = null;

	public createNativeView(): Microsoft.UI.Xaml.Controls.ListView {
		const lv = new Microsoft.UI.Xaml.Controls.ListView();
		lv.IsItemClickEnabled = true;
		lv.SelectionMode = 0; // None
		lv.HorizontalAlignment = 3; // Stretch
		lv.HorizontalContentAlignment = 3;
		lv.VerticalAlignment = 3;
		// Kill the per-container entrance/reposition animations WinUI runs on realize — pointless work
		// per row in a recycling virtualized list.
		try { lv.ItemContainerTransitions = new Microsoft.UI.Xaml.Media.Animation.TransitionCollection(); } catch (_e) {}

		// ShowsScrollingPlaceholders defaults true: WinUI defers ContainerContentChanging until a fling
		// settles, leaving blank placeholder rows mid-scroll. Off = realize+bind synchronously as rows
		// enter view, and recycled containers keep prior content until rebound.
		try { (lv as any).ShowsScrollingPlaceholders = false; } catch (_e) {}

		// Replace the stock ListViewItem template (selection / pointer-over / pressed / focus visual states
		// + reveal brushes we never use, re-evaluated per realized container) with a bare ContentPresenter
		// so each container is cheap to realize. Tap still works via ItemClick.
		try {
			const itemStyle = Microsoft.UI.Xaml.Markup.XamlReader.Load(
				'<Style xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" TargetType="ListViewItem">' +
					'<Setter Property="Margin" Value="0"/><Setter Property="Padding" Value="0"/>' +
					'<Setter Property="MinHeight" Value="0"/><Setter Property="MinWidth" Value="0"/>' +
					'<Setter Property="HorizontalContentAlignment" Value="Stretch"/>' +
					'<Setter Property="Template"><Setter.Value>' +
					'<ControlTemplate TargetType="ListViewItem">' +
					'<ContentPresenter Content="{TemplateBinding Content}" ContentTemplate="{TemplateBinding ContentTemplate}" ' +
					'HorizontalContentAlignment="{TemplateBinding HorizontalContentAlignment}" ' +
					'VerticalContentAlignment="{TemplateBinding VerticalContentAlignment}" ' +
					'Padding="{TemplateBinding Padding}"/>' +
					'</ControlTemplate></Setter.Value></Setter></Style>',
			) as Microsoft.UI.Xaml.Style;
			if (itemStyle) lv.ItemContainerStyle = itemStyle;
		} catch (_e) {}
		return lv;
	}

	public initNativeView(): void {
		super.initNativeView();
		const lv = this.nativeViewProtected;
		if (!lv) return;
		const ref = new WeakRef(this);

		// ChoosingItemContainer/ContainerContentChanging are generic TypedEventHandlers — the runtime can't
		// derive their parameterized GUID from a plain assignment, so build them via asDelegate.
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

	// True when the bound items are identical to what's already realized (same count + same data refs).
	// nativescript-vue re-assigns `items` on unrelated re-renders (e.g. a loadingMore toggle); a naive
	// refresh() would then replace the ItemsSource, resetting scroll to 0 and re-realizing every cell.
	private _itemsUnchanged(): boolean {
		if (!this._itemsSource || this.sectioned) return false;
		const items = this.items as any;
		const newCount = items && typeof items.length === 'number' ? items.length : 0;
		const oldCount = this._rows.length;
		if (oldCount === 0 || newCount !== oldCount) return false;
		for (let i = 0; i < oldCount; i++) {
			const data = (this as any)._getDataItem ? (this as any)._getDataItem(i) : items[i];
			if (this._rows[i].data !== data) return false;
		}
		return true;
	}

	// Append-only growth (infinite-scroll loadMore appends a page): extend the existing observable
	// ItemsSource in place so WinUI adds the new rows at the bottom — preserving scroll and realized cells
	// — instead of replacing the source (which reset scroll to top and re-realized every cell). Returns
	// false (→ full rebuild) for any non-append change (replace / filter / reorder / shrink).
	private _tryAppendRows(lv: any): boolean {
		const extend = (typeof NSWinRT !== 'undefined') ? (NSWinRT as any).extendItemsSource : null;
		if (!extend || !this._itemsSource) return false;

		const items = this.items as any;
		const newCount = items && typeof items.length === 'number' ? items.length : 0;
		const oldCount = this._rows.length;
		if (oldCount === 0 || newCount <= oldCount) return false;

		// Only an append if the existing prefix is unchanged (same data refs) — otherwise it's a
		// replace/filter and must go through the full rebuild.
		for (let i = 0; i < oldCount; i++) {
			const data = (this as any)._getDataItem ? (this as any)._getDataItem(i) : items[i];
			if (this._rows[i].data !== data) return false;
		}

		// Extend the row map first so the new indices resolve when WinUI realizes them, then grow the
		// native observable vector (fires VectorChanged → WinUI adds just the new rows, scroll intact).
		for (let i = oldCount; i < newCount; i++) {
			const data = (this as any)._getDataItem ? (this as any)._getDataItem(i) : items[i];
			this._rows.push({ header: false, templateKey: this._keyForData(data, i), globalIndex: i, data });
		}
		try {
			extend(this._itemsSource, newCount);
		} catch (_e) {
			return false; // let the full rebuild recover (replaces the source)
		}
		this._lastLoadMoreLen = -1; // re-arm loadMore at the new end
		return true;
	}

	// Replace the data set (filter / search / sort / reorder) WITHOUT tearing down realized cells: a full
	// _teardown bumps the generation and rebuilds every visible cell (element creation is the expensive
	// part on Windows). Instead keep the views, pool and generation, rebuild only the row map, and reset
	// the index ItemsSource — WinUI re-realizes the containers and rebinds their existing cells.
	// Returns false (→ full rebuild) for the sectioned case or if no items source can be made.
	private _tryReplaceRows(lv: any): boolean {
		const make = (typeof NSWinRT !== 'undefined') ? (NSWinRT as any).makeItemsSource : null;
		if (!make) return false;

		const src = this.items as any;
		const count = src && typeof src.length === 'number' ? src.length : 0;
		const rows: Row[] = [];
		for (let i = 0; i < count; i++) {
			const data = (this as any)._getDataItem ? (this as any)._getDataItem(i) : src[i];
			rows.push({ header: false, templateKey: this._keyForData(data, i), globalIndex: i, data });
		}

		let source: any = null;
		try { source = make(count); } catch (_e) { return false; }

		this._rows = rows;
		this._itemsSource = source;
		try { lv.ItemsSource = source; } catch (_e) { return false; }
		this._lastLoadMoreLen = -1;
		return true;
	}

	public refresh(): void {
		const lv = this.nativeViewProtected as any;
		if (!lv) return;

		if (this._itemsUnchanged()) return; // no-op: items identical → keep scroll + realized cells
		if (!this.sectioned && this._tryAppendRows(lv)) return; // append-only growth → extend in place
		if (!this.sectioned && this._tryReplaceRows(lv)) return; // replace/filter → reuse cells, rebind

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
			this._itemsSource = typeof NSWinRT !== 'undefined' && NSWinRT.makeItemsSource ? NSWinRT.makeItemsSource(rows.length) : null;
			lv.ItemsSource = this._itemsSource;
		} catch (_e) {}
		// loadMoreItems fires from _onContainerContentChanging on scroll, not here — firing on every
		// items-set would cascade (each appended page would immediately request the next).
		this._lastLoadMoreLen = -1;
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

	// Draw (or clear) the row separator as a 1px composition line pinned to the container's bottom edge.
	// (ListViewItem.BorderBrush isn't honoured by the ListViewItemPresenter template, so a child visual
	// is used instead.) The sprite is created once per container and reused on recycle.
	private _applySeparator(container: any): void {
		if (!container) return;
		try {
			const EP = Microsoft.UI.Xaml.Hosting.ElementCompositionPreview;
			if (!this._separatorColor) {
				if (container.__ns_sepVisual) {
					EP.SetElementChildVisual(container, null as never);
					container.__ns_sepVisual = null;
				}
				return;
			}
			let sprite = container.__ns_sepVisual as Microsoft.UI.Composition.SpriteVisual;
			if (!sprite) {
				const N = Windows.Foundation.Numerics;
				const c = EP.GetElementVisual(container).Compositor;
				sprite = c.CreateSpriteVisual();
				sprite.RelativeSizeAdjustment = new N.Vector2(1, 0); // full width
				sprite.Size = new N.Vector2(0, 1); // 1px tall
				sprite.RelativeOffsetAdjustment = new N.Vector3(0, 1, 0); // anchor to the bottom edge
				sprite.Offset = new N.Vector3(0, -1, 0); // sit just inside it
				sprite.Brush = c.CreateColorBrush();
				container.__ns_sepVisual = sprite;
				EP.SetElementChildVisual(container, sprite);
			}
			(sprite.Brush as Microsoft.UI.Composition.CompositionColorBrush).Color = this._separatorColor;
		} catch (_e) {}
	}

	// Size the virtualizing panel's realization buffer once it exists. CacheLength = how many viewports
	// of containers WinUI keeps realized (and recycled) around the visible area; a larger buffer means
	// more fling before the recycle pool runs dry and WinUI has to mint blank containers. Cheap now that
	// a bind is O(1), so favor a deeper buffer.
	private _ensureCacheLength(): void {
		if (this._cacheLengthSet) return;
		try {
			const panel = (this.nativeViewProtected as any)?.ItemsPanelRoot;
			if (panel && 'CacheLength' in panel) {
				panel.CacheLength = 8.0;
				this._cacheLengthSet = true;
			}
		} catch (_e) {}
	}

	private _onContainerContentChanging(args: any): void {
		const container = args?.ItemContainer;
		if (!container) return;
		this._ensureCacheLength();

		// Container leaving the viewport: keep its current view + content (do NOT clear) so it shows prior
		// content until rebound and never flashes blank on a fling. The realize pass below reuses it for a
		// new row by swapping the data in place.
		if (args.InRecycleQueue) {
			try { args.Handled = true; } catch (_e) {}
			return;
		}

		const idx = args.ItemIndex;
		const row = this._rows[idx];
		if (!row) { try { args.Handled = true; } catch (_e) {} return; }
		(container as any).__ns_row_index = idx;

		// Scroll-driven loadMoreItems: when a container within LOAD_MORE_THRESHOLD rows of the end is
		// realized, request the next page — once per data-set length so it never cascades.
		const total = this._rows.length;
		if (total > 0 && idx >= total - LOAD_MORE_THRESHOLD && this._lastLoadMoreLen !== total) {
			this._lastLoadMoreLen = total;
			this.notify({ eventName: LOADMOREITEMS, object: this });
		}

		// Reuse the container's current view only if it's from this data set AND the same template;
		// otherwise repool it and obtain the right one.
		let view = (container as any).__ns_view as View;
		const stale = !!view && ((view as any).__ns_gen !== this._generation || (view as any).__ns_templateKey !== row.templateKey);

		// Fast path — container already displays this exact row with a live view: do nothing. WinUI
		// re-raises ContainerContentChanging for the SAME item on every layout / scroll-settle / re-measure
		// pass, not just on genuine recycle; without this guard each re-fires itemLoading and re-binds the
		// cell, starving layout during a fling (blank rows, dropped frames). Bind only when data changed.
		if (view && !stale && (container as any).__ns_boundData === row.data) {
			const boundNative = (view as any)?.nativeViewProtected;
			// WinUI can null a reused container's Content even when we keep the view — restore it cheaply.
			try { if (boundNative && container.Content !== boundNative) container.Content = boundNative; } catch (_e) {}
			try { container.IsHitTestVisible = !row.header; } catch (_e) {}
			try { args.Handled = true; } catch (_e) {}
			return;
		}

		// View currently hosted by this container (null once stale) — lets us tell a plain rebind, where
		// _bind hands back the SAME view, from a real attach.
		const attachedView = stale ? null : view;
		if (stale) {
			this._detach(container);
			view = null as any;
		}
		if (!view) {
			view = this._obtain(row) as View;
		}

		// Fire itemLoading and honor a view the handler may supply/replace via args.view (the cross-platform
		// contract; e.g. nativescript-vue builds the cell in its handler). _bind returns the effective view,
		// which may differ from the obtained one.
		view = this._bind(view, row);
		const native = (view as any)?.nativeViewProtected;

		// Reusing the same cell for a new row is just a rebind (itemLoading already updated the data), so
		// the one-time per-view setup runs only when the hosted view actually changes: first realize,
		// template switch, or a handler that swapped the view.
		if (view !== attachedView) {
			this._attach(container, view);
			try { native.HorizontalAlignment = 3; } catch (_e) {}
			try { native.MinHeight = (this._effectiveRowHeight && this._effectiveRowHeight > 0) ? this._effectiveRowHeight : 44; } catch (_e) {}
			try { container.IsHitTestVisible = !row.header; } catch (_e) {}
			this._applySeparator(container);
		}
		// Remember the row so the fast path above can skip redundant re-binds.
		(container as any).__ns_boundData = row.data;
		// Safety net: a recycled container can come back with its Content nulled; restore it.
		try { if (native && container.Content !== native) container.Content = native; } catch (_e) {}
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
			// prev no longer holds a view → drop its bound-row marker so it re-binds when next realized.
			prev.__ns_boundData = null;
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
		container.__ns_boundData = null;
		if (!view) return;
		const native = (view as any)?.nativeViewProtected;
		try { if (container.Content === native) container.Content = null; } catch (_e) {}
		if ((view as any).__ns_container === container) (view as any).__ns_container = null;
		if ((view as any).__ns_gen === this._generation) {
			this._recycle(view);
		}
	}

	private _obtain(row: Row): View | null {
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
			// No view from the template (e.g. nativescript-vue supplies the cell from its itemLoading
			// handler instead) — _bind defers to itemLoading and only then falls back to default content.
		}
		if (!view) {
			return null;
		}

		this._track(view, key);
		return view;
	}

	// Register a view with the ListView (logical child + active set), set it up, and tag it for
	// recycling / generation checks. Idempotent: a view already tracked is left as-is.
	private _track(view: View, key: string): void {
		(view as any).__ns_templateKey = key;
		(view as any).__ns_gen = this._generation;
		if (!(view as any).nativeViewProtected) {
			try { view._setupUI(this._context || ({} as any)); } catch (_e) {}
		}
		if (!this._active.has(view)) {
			this._addView(view);
			this._active.add(view);
		}
	}

	private _bind(view: View | null, row: Row): View {
		let effective = view;
		if (!row.header) {
			// itemLoading lets a handler provide or replace the cell view via args.view.
			const args: any = { eventName: ITEMLOADING, object: this, index: row.globalIndex, view: effective ?? undefined, bindingContext: row.data, section: row.section };
			this.notify(args);
			if (args.view) {
				if (args.view !== effective) {
					this._track(args.view, row.templateKey);
				}
				effective = args.view;
			}
		}
		// Fall back to default content only if neither the template nor the handler supplied a view.
		if (!effective) {
			effective = this._getDefaultItemContent(row.globalIndex);
			this._track(effective, row.templateKey);
		}
		try { (effective as any).bindingContext = row.data; } catch (_e) {}
		return effective;
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
		this._itemsSource = null;
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
		this._scrollToIndexCore(index, false);
	}

	public scrollToIndexAnimated(index: number): void {
		this._scrollToIndexCore(index, true);
	}

	private _scrollToIndexCore(index: number, animated: boolean): void {
		const lv = this.nativeViewProtected as any;
		if (!lv) return;
		try {
			const count = this._rows.length || 1;
			const extent = NativeScript.Widgets.ScrollHelper.GetExtentHeight(lv);
			if (extent > 0) {
				const clamped = Math.max(0, Math.min(index, count - 1));
				NativeScript.Widgets.ScrollHelper.ScrollToVerticalOffset(lv, (extent / count) * clamped, !animated);
			}
		} catch (_e) {}
	}

	public onLoaded(): void {
		super.onLoaded();
		this.refresh();
	}

	// Granular ObservableArray updates — edit `_rows` and the native index ItemsSource in place (each op
	// fires VectorChanged → WinUI realizes/drops only the touched containers), preserving scroll and every
	// other realized cell. Anything we can't map to a reliable position (sectioned list, missing source,
	// an insert whose prefix we can't verify, unknown action) falls back to refresh(). Safe because the
	// native lookup is position-based (_rows[args.ItemIndex]), so the vector only needs the right length
	// and VectorChanged events; element values go unread.
	public _onItemsChanged(data: ChangedData<any>): void {
		const lv = this.nativeViewProtected as any;
		const NS: any = typeof NSWinRT !== 'undefined' ? NSWinRT : null;
		if (!lv || this.sectioned || !this._itemsSource || !NS || !data) {
			this.refresh();
			return;
		}

		const items = this.items as any;
		const newCount = items && typeof items.length === 'number' ? items.length : 0;
		const oldCount = this._rows.length;
		const removedCount = data.removed ? data.removed.length : 0;
		const addedCount = data.addedCount || 0;

		try {
			switch (data.action) {
				case ChangeType.Update: {
					// setItem(i, value): one row's data replaced; count unchanged → fire ItemChanged.
					const i = data.index;
					if (i == null || i < 0 || i >= oldCount || newCount !== oldCount || !NS.updateItemsSource) break;
					this._rows[i] = this._makeRow(i);
					NS.updateItemsSource(this._itemsSource, i, 1);
					return;
				}
				case ChangeType.Delete: {
					// pop() reports index null → it removed the trailing `count` items. A front/middle
					// removal (e.g. shift) reports null too but shifts positions, so the prefix check rejects it.
					const count = removedCount || oldCount - newCount;
					const start = data.index == null ? oldCount - count : data.index;
					if (count <= 0 || start < 0 || start + count > oldCount || newCount !== oldCount - count) break;
					if (count > GRANULAR_MAX) { this._resetRowsAndSource(); return; } // bulk → one Reset, not N events
					if (!NS.removeItemsSource || !this._prefixMatches(start)) break;
					this._rows.splice(start, count);
					this._renumberRowsFrom(start);
					NS.removeItemsSource(this._itemsSource, start, count);
					this._lastLoadMoreLen = -1;
					return;
				}
				case ChangeType.Add: {
					// push() reports index null → appended at the end. unshift() also reports null but
					// inserts at the front; the prefix check rejects it (positions shifted) → refresh().
					const count = addedCount || newCount - oldCount;
					const start = data.index == null ? oldCount : data.index;
					if (count <= 0 || start < 0 || start > oldCount || newCount !== oldCount + count) break;
					if (!NS.insertItemsSource || !this._prefixMatches(start)) break;
					this._spliceRowsIn(start, count);
					this._renumberRowsFrom(start);
					NS.insertItemsSource(this._itemsSource, start, count);
					this._lastLoadMoreLen = -1;
					return;
				}
				case ChangeType.Splice: {
					const start = data.index;
					if (start == null || start < 0 || start > oldCount || start + removedCount > oldCount) break;
					if (newCount !== oldCount - removedCount + addedCount) break;
					if (removedCount + addedCount > GRANULAR_MAX) { this._resetRowsAndSource(); return; } // bulk → one Reset
					if (!NS.removeItemsSource || !NS.insertItemsSource || !this._prefixMatches(start)) break;
					// Remove first, then insert at the same start — the intermediate state (both shrunk by
					// removedCount) is self-consistent for any synchronous WinUI re-realize.
					if (removedCount > 0) {
						this._rows.splice(start, removedCount);
						NS.removeItemsSource(this._itemsSource, start, removedCount);
					}
					if (addedCount > 0) {
						this._spliceRowsIn(start, addedCount);
						NS.insertItemsSource(this._itemsSource, start, addedCount);
					}
					this._renumberRowsFrom(start);
					this._lastLoadMoreLen = -1;
					return;
				}
			}
		} catch (_e) {
			// fall through to refresh
		}
		// Couldn't apply granularly (or it threw) → safe full rebuild.
		this.refresh();
	}

	// Bulk change → rebuild the row map from the mutated collection and fire ONE VectorChanged(Reset) on
	// the existing index vector (same ItemsSource instance), since WinRT has no range event. WinUI then
	// re-realizes only the visible containers; off-screen rows rebind lazily from `_rows`. Falls back to
	// refresh() if the reset shim is unavailable.
	private _resetRowsAndSource(): void {
		const NS: any = typeof NSWinRT !== 'undefined' ? NSWinRT : null;
		const lv = this.nativeViewProtected as any;
		if (!lv || this.sectioned || !this._itemsSource || !NS || !NS.resetItemsSource) {
			this.refresh();
			return;
		}
		const items = this.items as any;
		const count = items && typeof items.length === 'number' ? items.length : 0;
		const rows: Row[] = [];
		for (let i = 0; i < count; i++) {
			const data = (this as any)._getDataItem ? (this as any)._getDataItem(i) : items[i];
			rows.push({ header: false, templateKey: this._keyForData(data, i), globalIndex: i, data });
		}
		this._rows = rows;
		try {
			NS.resetItemsSource(this._itemsSource, count);
		} catch (_e) {
			this.refresh();
			return;
		}
		this._lastLoadMoreLen = -1;
	}

	// Build the non-sectioned Row for position `i` (globalIndex === position) from the mutated items collection.
	private _makeRow(i: number): Row {
		const items = this.items as any;
		const data = (this as any)._getDataItem ? (this as any)._getDataItem(i) : items[i];
		return { header: false, templateKey: this._keyForData(data, i), globalIndex: i, data };
	}

	// Insert `count` freshly-built rows at `start` (call BEFORE the native insert so a synchronous
	// re-realize finds them).
	private _spliceRowsIn(start: number, count: number): void {
		const made: Row[] = [];
		for (let k = 0; k < count; k++) {
			made.push(this._makeRow(start + k));
		}
		this._rows.splice(start, 0, ...made);
	}

	// Re-sync globalIndex (== array position when not sectioned) for rows shifted by an insert/remove.
	private _renumberRowsFrom(start: number): void {
		for (let i = start; i < this._rows.length; i++) {
			this._rows[i].globalIndex = i;
		}
	}

	// True when realized rows [0, n) still hold the same data refs as the mutated collection — i.e. the
	// mutation was at/after `n`, so earlier positions line up and a granular edit at `n` is safe.
	private _prefixMatches(n: number): boolean {
		if (n > this._rows.length) return false;
		const items = this.items as any;
		for (let i = 0; i < n; i++) {
			const data = (this as any)._getDataItem ? (this as any)._getDataItem(i) : items[i];
			if (this._rows[i].data !== data) return false;
		}
		return true;
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
	[separatorColorProperty.setNative](value: Color) {
		this._separatorColor = value instanceof Color ? value.windows : null;
		const lv = this.nativeViewProtected as any;
		if (!lv) return;
		// Update already-realized containers; off-screen ones pick it up via _onContainerContentChanging.
		for (let i = 0; i < this._rows.length; i++) {
			try { this._applySeparator(lv.ContainerFromIndex(i)); } catch (_e) {}
		}
	}
}
