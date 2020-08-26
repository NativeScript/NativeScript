import { ListView as ListViewDefinition, ItemsSource, ItemEventData, TemplatedItemsView } from '.';
import { View, ContainerView, Template, KeyedTemplate, CSSType } from '../core/view';
import { Property, CoercibleProperty, CssProperty } from '../core/properties';
import { Length } from '../styling/style-properties';
import { Style } from '../styling/style';
import { Color } from '../../color';
import { Builder } from '../builder';
import { Label } from '../label';
import { Observable, EventData } from '../../data/observable';
import { ObservableArray, ChangedData } from '../../data/observable-array';
import { addWeakEventListener, removeWeakEventListener } from '../core/weak-event-listener';

const autoEffectiveRowHeight = -1;

@CSSType('ListView')
export abstract class ListViewBase extends ContainerView implements ListViewDefinition, TemplatedItemsView {
	public static itemLoadingEvent = 'itemLoading';
	public static itemTapEvent = 'itemTap';
	public static loadMoreItemsEvent = 'loadMoreItems';
	// TODO: get rid of such hacks.
	public static knownFunctions = ['itemTemplateSelector', 'itemIdGenerator']; //See component-builder.ts isKnownFunction

	private _itemIdGenerator: (item: any, index: number, items: any) => number = (_item: any, index: number) => index;
	private _itemTemplateSelector: (item: any, index: number, items: any) => string;
	private _itemTemplateSelectorBindable = new Label();
	public _defaultTemplate: KeyedTemplate = {
		key: 'default',
		createView: () => {
			if (this.itemTemplate) {
				return Builder.parse(this.itemTemplate, this);
			}

			return undefined;
		},
	};

	public _itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);
	public _effectiveRowHeight: number = autoEffectiveRowHeight;
	public rowHeight: Length;
	public iosEstimatedRowHeight: Length;
	public items: any[] | ItemsSource;
	public itemTemplate: string | Template;
	public itemTemplates: string | Array<KeyedTemplate>;

	get separatorColor(): Color {
		return this.style.separatorColor;
	}
	set separatorColor(value: Color) {
		this.style.separatorColor = value;
	}

	get itemTemplateSelector(): string | ((item: any, index: number, items: any) => string) {
		return this._itemTemplateSelector;
	}
	set itemTemplateSelector(value: string | ((item: any, index: number, items: any) => string)) {
		if (typeof value === 'string') {
			this._itemTemplateSelectorBindable.bind({
				sourceProperty: null,
				targetProperty: 'templateKey',
				expression: value,
			});
			this._itemTemplateSelector = (item: any, index: number, items: any) => {
				item['$index'] = index;

				if (this._itemTemplateSelectorBindable.bindingContext === item) {
					this._itemTemplateSelectorBindable.bindingContext = null;
				}

				this._itemTemplateSelectorBindable.bindingContext = item;

				return this._itemTemplateSelectorBindable.get('templateKey');
			};
		} else if (typeof value === 'function') {
			this._itemTemplateSelector = value;
		}
	}

	get itemIdGenerator(): (item: any, index: number, items: any) => number {
		return this._itemIdGenerator;
	}
	set itemIdGenerator(generatorFn: (item: any, index: number, items: any) => number) {
		this._itemIdGenerator = generatorFn;
	}

	public refresh() {
		//
	}

	public scrollToIndex(index: number) {
		//
	}

	public scrollToIndexAnimated(index: number) {
		//
	}

	public _getItemTemplate(index: number): KeyedTemplate {
		let templateKey = 'default';
		if (this.itemTemplateSelector) {
			let dataItem = this._getDataItem(index);
			templateKey = this._itemTemplateSelector(dataItem, index, this.items);
		}

		for (let i = 0, length = this._itemTemplatesInternal.length; i < length; i++) {
			if (this._itemTemplatesInternal[i].key === templateKey) {
				return this._itemTemplatesInternal[i];
			}
		}

		// This is the default template
		return this._itemTemplatesInternal[0];
	}

	public _prepareItem(item: View, index: number) {
		if (item) {
			item.bindingContext = this._getDataItem(index);
		}
	}

	private _getDataItem(index: number): any {
		let thisItems = <ItemsSource>this.items;

		return thisItems.getItem ? thisItems.getItem(index) : thisItems[index];
	}

	public _getDefaultItemContent(index: number): View {
		let lbl = new Label();
		lbl.bind({
			targetProperty: 'text',
			sourceProperty: '$value',
		});

		return lbl;
	}

	public _onItemsChanged(args: ChangedData<any>) {
		this.refresh();
	}

	public _onRowHeightPropertyChanged(oldValue: Length, newValue: Length) {
		this.refresh();
	}

	public isItemAtIndexVisible(index: number) {
		return false;
	}

	protected updateEffectiveRowHeight(): void {
		rowHeightProperty.coerce(this);
	}
}
ListViewBase.prototype.recycleNativeView = 'auto';

export interface ListViewBase {
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void;
	on(event: 'itemLoading', callback: (args: ItemEventData) => void, thisArg?: any): void;
	on(event: 'itemTap', callback: (args: ItemEventData) => void, thisArg?: any): void;
	on(event: 'loadMoreItems', callback: (args: EventData) => void, thisArg?: any): void;
}

/**
 * Represents the property backing the items property of each ListView instance.
 */
export const itemsProperty = new Property<ListViewBase, any[] | ItemsSource>({
	name: 'items',
	valueChanged: (target, oldValue, newValue) => {
		if (oldValue instanceof Observable) {
			removeWeakEventListener(oldValue, ObservableArray.changeEvent, target._onItemsChanged, target);
		}

		if (newValue instanceof Observable) {
			addWeakEventListener(newValue, ObservableArray.changeEvent, target._onItemsChanged, target);
		}

		target.refresh();
	},
});
itemsProperty.register(ListViewBase);

/**
 * Represents the item template property of each ListView instance.
 */
export const itemTemplateProperty = new Property<ListViewBase, string | Template>({
	name: 'itemTemplate',
	valueChanged: (target) => {
		target.refresh();
	},
});
itemTemplateProperty.register(ListViewBase);

/**
 * Represents the items template property of each ListView instance.
 */
export const itemTemplatesProperty = new Property<ListViewBase, string | Array<KeyedTemplate>>({
	name: 'itemTemplates',
	valueConverter: (value) => {
		if (typeof value === 'string') {
			return Builder.parseMultipleTemplates(value, null);
		}

		return value;
	},
});
itemTemplatesProperty.register(ListViewBase);

const defaultRowHeight: Length = 'auto';
/**
 * Represents the observable property backing the rowHeight property of each ListView instance.
 */
export const rowHeightProperty = new CoercibleProperty<ListViewBase, Length>({
	name: 'rowHeight',
	defaultValue: defaultRowHeight,
	equalityComparer: Length.equals,
	coerceValue: (target, value) => {
		// We coerce to default value if we don't have display density.
		return target.nativeViewProtected ? value : defaultRowHeight;
	},
	valueChanged: (target, oldValue, newValue) => {
		target._effectiveRowHeight = Length.toDevicePixels(newValue, autoEffectiveRowHeight);
		target._onRowHeightPropertyChanged(oldValue, newValue);
	},
	valueConverter: Length.parse,
});
rowHeightProperty.register(ListViewBase);

export const iosEstimatedRowHeightProperty = new Property<ListViewBase, Length>({
	name: 'iosEstimatedRowHeight',
	valueConverter: (v) => Length.parse(v),
});
iosEstimatedRowHeightProperty.register(ListViewBase);

export const separatorColorProperty = new CssProperty<Style, Color>({
	name: 'separatorColor',
	cssName: 'separator-color',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
separatorColorProperty.register(Style);
