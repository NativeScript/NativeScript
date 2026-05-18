export * from './list-view-common';

import { ListViewBase } from './list-view-common';
import { View } from '../core/view';
import { Builder } from '../builder';
import { Label } from '../label';
import { StackLayout } from '../layouts/stack-layout';
import { ProxyViewContainer } from '../proxy-view-container';
import { LayoutBase } from '../layouts/layout-base';
import { ChangedData } from '../../data/observable-array';

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;

export class ListView extends ListViewBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.ListView;
	private _windows: Windows.UI.Xaml.Controls.ListView;
	private _containerChangingHandler: any = null;
	private _containerChangingHandlerUsedAddListener: boolean = false;

	public _realizedItems = new Map<any, { view: View; templateKey: string }>();
	public _availableViews = new Map<string, Set<any>>();
	public _realizedTemplates = new Map<string, Map<any, View>>();

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.ListView();
	}

	public createNativeView() {
		const lv = this._windows;

		const that = new WeakRef(this);
		let usedAddListener = false;

		const handlerBody = (s: any, e: any) => {
			const owner = that.deref();
			if (!owner) return;

			const data = e.Item as any;
			const index = e.ItemIndex;

			// Debug: log container content change events
			try { console.log(`[ListView] ContainerContentChanging index=${index} isHeader=${data && data.__ns_isHeader} InRecycleQueue=${!!e.InRecycleQueue}`); } catch (err) {}

			if (e.InRecycleQueue) {
				const prev = e.ItemContainer.Content;
				if (prev && owner._realizedItems.has(prev)) {
					owner._markViewUnused(prev);
				}

				return;
			}

			const total = owner.items && (owner.items as any).length ? (owner.items as any).length : 0;
			if (!owner.sectioned && index === total - 1) {
				owner.notify({ eventName: LOADMOREITEMS, object: owner });
			}

			const isHeader = data && data.__ns_isHeader;

			let nativeEl: any = null;
			let nsView: View | null = null;
			let templateKey = '';

			if (isHeader) {
				templateKey = `header_${data.__ns_section}`;
				nativeEl = owner._getAvailableView(templateKey);
				if (nativeEl) {
					nsView = owner._realizedTemplates.get(templateKey).get(nativeEl);
					owner._markViewUsed(nativeEl);
				} else {
					let headerView: View | null = null;
					if (owner.stickyHeaderTemplate) {
						if (typeof owner.stickyHeaderTemplate === 'string') {
							try {
								headerView = Builder.parse(owner.stickyHeaderTemplate, owner);
							} catch (err) {
								headerView = new Label();
								(headerView as Label).text = 'Header Error';
							}
						}
					}

					if (!headerView) {
						headerView = new Label();
						(headerView as Label).text = `Section ${data.__ns_section}`;
					}

					headerView._setupAsRootView(this._context);

					nativeEl = (headerView as any).nativeViewProtected;
					nsView = headerView;
					owner._registerViewToTemplate(templateKey, nativeEl, nsView);
					owner._markViewUsed(nativeEl);
				}

				const sectionData = owner._getSectionData(data.__ns_section);
				if (sectionData) {
					nsView.bindingContext = sectionData;
				} else {
					nsView.bindingContext = { title: `Section ${data.__ns_section}`, section: data.__ns_section };
				}
			} else {
				const itemIndex = (data && typeof data.__ns_index === 'number') ? data.__ns_index : index;
				const template = owner._getItemTemplate(itemIndex);
				templateKey = template.key;

				nativeEl = owner._getAvailableView(templateKey);
				if (nativeEl) {
					nsView = owner._realizedTemplates.get(templateKey).get(nativeEl);
					owner._markViewUsed(nativeEl);
				} else {
					let view: View | null = null;
					try {
						view = template.createView();
					} catch (err) {
						view = null;
					}

					if (!view) {
						view = owner._getDefaultItemContent(itemIndex);
					}

					const args = {
						eventName: ITEMLOADING,
						object: owner,
						index: itemIndex,
						view: view,
						android: undefined,
						ios: undefined,
					} as any;
					owner.notify(args);

					if (!args.view) {
						args.view = owner._getDefaultItemContent(itemIndex);
					}

					owner._prepareItem(args.view, itemIndex);
					args.view._setupAsRootView(this._context);

					nativeEl = (args.view as any).nativeViewProtected;
					nsView = args.view;

					owner._registerViewToTemplate(templateKey, nativeEl, nsView);
					owner._markViewUsed(nativeEl);
				}
			}

			e.ItemContainer.Content = nativeEl;
			e.Handled = true;
		};

		// Try to attach a native handler in several ways (TypedEventHandler, direct assignment, addEventListener)
		let attached = false;
		try {
			this._containerChangingHandler = new Windows.Foundation.TypedEventHandler(handlerBody) as any;
			try {
				lv.ContainerContentChanging = this._containerChangingHandler as never;
				attached = true;
			} catch (_e) {
				// Even if delegate created, property assignment may fail — fall through to other methods
			}
		} catch (_e) {
			// Could not create TypedEventHandler — fall back to plain function
			this._containerChangingHandler = handlerBody;
		}

		if (!attached) {
			// Try direct property assignment with a plain function
			try {
				lv.ContainerContentChanging = this._containerChangingHandler as never;
				attached = true;
			} catch (_e2) {
				// Try multiple event names via addEventListener if available
				try {
					const addEv = (lv as any).addEventListener;
					if (typeof addEv === 'function') {
						const names = ['containercontentchanging', 'ContainerContentChanging', 'containerContentChanging'];
						for (const n of names) {
							try {
								addEv.call(lv, n, this._containerChangingHandler);
								usedAddListener = true;
								attached = true;
								break;
							} catch (_e3) {
								// ignore and try next
							}
						}
					}
				} catch (_e4) {
					// give up silently — handler couldn't be attached
				}
			}
		}

			this._containerChangingHandlerUsedAddListener = usedAddListener;

			try { console.log(`[ListView] createNativeView handlerAttached=${attached} usedAddListener=${usedAddListener} handlerExists=${!!this._containerChangingHandler}`); } catch (err) {}

			return lv;
	}

	get windows(): Windows.UI.Xaml.Controls.ListView {
		return this._windows;
	}

	private _ensureAvailableViews(templateKey: string) {
		if (!this._availableViews.has(templateKey)) {
			this._availableViews.set(templateKey, new Set());
		}
	}

	public _registerViewToTemplate(templateKey: string, nativeView: any, view: View) {
		this._realizedItems.set(nativeView, { view, templateKey });
		if (!this._realizedTemplates.has(templateKey)) {
			this._realizedTemplates.set(templateKey, new Map());
		}
		this._realizedTemplates.get(templateKey).set(nativeView, view);
		this._ensureAvailableViews(templateKey);
		this._availableViews.get(templateKey).add(nativeView);
	}

	public _markViewUsed(nativeView: any) {
		const viewData = this._realizedItems.get(nativeView);
		if (!viewData) {
			return;
		}
		this._ensureAvailableViews(viewData.templateKey);
		this._availableViews.get(viewData.templateKey).delete(nativeView);
	}

	public _markViewUnused(nativeView: any) {
		const viewData = this._realizedItems.get(nativeView);
		if (!viewData) {
			return;
		}
		this._ensureAvailableViews(viewData.templateKey);
		this._availableViews.get(viewData.templateKey).add(nativeView);
	}

	public _getKeyFromView(nativeView: any) {
		const entry = this._realizedItems.get(nativeView);
		return entry ? entry.templateKey : null;
	}

	public _hasAvailableView(templateKey: string) {
		this._ensureAvailableViews(templateKey);
		return this._availableViews.get(templateKey).size > 0;
	}

	public _getAvailableView(templateKey: string) {
		this._ensureAvailableViews(templateKey);
		if (!this._hasAvailableView(templateKey)) return null;
		const iter = this._availableViews.get(templateKey).values();
		const native = iter.next().value;
		this._markViewUsed(native);
		return native;
	}

	public refresh() {
		const native = this.nativeViewProtected;
		if (!native) return;

		// Clear realized cache (we will recreate as needed)
		this.clearRealizedCells();

		try { console.log(`[ListView.refresh] sectioned=${this.sectioned} itemsLen=${this.items ? (this.items as any).length : 0}`); } catch (err) {}

		native.Items.Clear();

		if (!this.items) return;

		if (this.sectioned) {
			const sectionCount = this._getSectionCount();
			for (let s = 0; s < sectionCount; s++) {
				const sectionItems = this._getItemsInSection(s) || [];
				if (!sectionItems || (sectionItems as any).length === 0) continue;

				// Add header wrapper
				native.Items.Append({ __ns_isHeader: true, __ns_section: s });

				// Add items
				for (let i = 0; i < (sectionItems as any).length; i++) {
					native.Items.Append({ __ns_item: (sectionItems as any)[i], __ns_index: i, __ns_section: s });
				}
			}
		} else {
			const len = (this.items as any).length || 0;
			for (let i = 0; i < len; i++) {
				const dataItem = this._getDataItem(i);
				native.Items.Append({ __ns_item: dataItem, __ns_index: i });
			}
		}
	}

	private clearRealizedCells(): void {
		this._realizedItems.forEach(({ view }, native) => {
			// Tear down view UI to free native resources
			if (view) {
				view.destroyNode(true);
			}
		});

		this._realizedItems.clear();
		this._availableViews.clear();
		this._realizedTemplates.clear();
	}

	public disposeNativeView(): void {
		const native = this.nativeViewProtected as any;
		if (native && this._containerChangingHandler) {
			try { native.ContainerContentChanging = null as never; } catch (_e) {}
			if (this._containerChangingHandlerUsedAddListener) {
				try { native.removeEventListener('containercontentchanging', this._containerChangingHandler); } catch (_e) {}
			}
			this._containerChangingHandler = null;
			this._containerChangingHandlerUsedAddListener = false;
		}

		this.clearRealizedCells();
		super.disposeNativeView?.();
	}

	public scrollToIndex(index: number) {
		const native = this.nativeViewProtected;
		if (!native || !native.Items || index < 0) return;
		if (index >= 0 && index < native.Items.Size) {
			const item = native.Items.GetAt(index);
			native.ScrollIntoView(item);
		}
	}


	public _onItemsChanged(data: ChangedData<any>) {
		// For sectioned lists fallback to full refresh
		if (this.sectioned) {
			this.refresh();
			return;
		}

		const native = this.nativeViewProtected;
		if (!native || !native.Items) {
			this.refresh();
			return;
		}

		const action = data && data.action;
		const index = typeof data.index === 'number' ? data.index : 0;

		switch (action) {
			case 'add': {
				const addedCount = typeof data.addedCount === 'number' ? data.addedCount : 1;
				for (let i = 0; i < addedCount; i++) {
					const item = this._getDataItem(index + i);
					native.Items.InsertAt(index + i, { __ns_item: item, __ns_index: index + i });
				}
				// Update subsequent indexes
				for (let j = index + addedCount; j < native.Items.Size; j++) {
					const obj = native.Items.GetAt(j);
					if (obj) obj.__ns_index = j;
				}
				break;
			}
			case 'delete': {
				const removed = data.removed || [];
				for (let i = 0; i < removed.length; i++) {
					native.Items.RemoveAt(index);
				}
				for (let j = index; j < native.Items.Size; j++) {
					const obj = native.Items.GetAt(j);
					if (obj) obj.__ns_index = j;
				}
				break;
			}
			case 'splice': {
				const removed = data.removed || [];
				const addedCount = typeof data.addedCount === 'number' ? data.addedCount : 0;
				for (let i = 0; i < removed.length; i++) {
					native.Items.RemoveAt(index);
				}
				for (let i = 0; i < addedCount; i++) {
					const item = this._getDataItem(index + i);
					native.Items.InsertAt(index + i, { __ns_item: item, __ns_index: index + i });
				}
				for (let j = index; j < native.Items.Size; j++) {
					const obj = native.Items.GetAt(j);
					if (obj) obj.__ns_index = j;
				}
				break;
			}
			default: {
				this.refresh();
				break;
			}
		}
	}
}
