import { Label } from '../label';
import { LayoutBase } from '../layouts/layout-base';
import { View, CSSType, CustomLayoutView, Template, KeyedTemplate } from '../core/view';
import { Property } from '../core/properties';
import { layout } from '../../utils';
import { StackLayout } from '../layouts/stack-layout';
import { ObservableArray, ChangedData } from '../../data/observable-array';
import { addWeakEventListener, removeWeakEventListener } from '../core/weak-event-listener';
import { Builder } from '../builder';
import { profile } from '../../profiling';
import { isFunction } from '../../utils/types';

export interface ItemsSource {
	length: number;
	getItem(index: number): any;
}

/**
 * Represents a UI Repeater component.
 *
 * @nsView Repeater
 */
@CSSType('Repeater')
export class Repeater extends CustomLayoutView {
	// TODO: get rid of such hacks.
	public static knownFunctions = ['itemTemplateSelector']; // See component-builder.ts isKnownFunction

	private _isDirty = false;
	private _itemTemplateSelector: (item: any, index: number, items: any) => string;
	private _itemTemplateSelectorBindable;
	public ios;
	public android;

	constructor() {
		super();
		// TODO: Do we need this as property?
		this.itemsLayout = new StackLayout();
	}

	@profile
	public onLoaded() {
		if (this._isDirty) {
			this.refresh();
		}

		super.onLoaded();
	}

	/**
	 * Gets or set the items collection of the Repeater.
	 * The items property can be set to an array or an object defining length and getItem(index) method.
	 */
	public items: any[] | ItemsSource;
	/**
	 * Gets or set the item template of the Repeater.
	 */
	public itemTemplate: string | Template;
	/**
	 * Gets or set the item templates of the Repeater.
	 */
	public itemTemplates: string | Array<KeyedTemplate>;
	/**
	 * Gets or set the items layout of the Repeater. Default value is StackLayout with orientation="vertical".
	 */
	public itemsLayout: LayoutBase;

	get itemTemplateSelector(): string | ((item: any, index: number, items: any) => string) {
		return this._itemTemplateSelector;
	}
	set itemTemplateSelector(value: string | ((item: any, index: number, items: any) => string)) {
		if (typeof value === 'string') {
			if (!this._itemTemplateSelectorBindable) {
				this._itemTemplateSelectorBindable = new Label();
			}

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

	public _requestRefresh() {
		this._isDirty = true;
		if (this.isLoaded) {
			this.refresh();
		}
	}

	/**
	 * Forces the Repeater to reload all its items.
	 */
	public refresh() {
		if (this.itemsLayout) {
			this.itemsLayout.removeChildren();
		}

		if (!this.items) {
			return;
		}

		const length = this.items.length;
		for (let i = 0; i < length; i++) {
			const dataItem = this._getDataItem(i);
			let viewToAdd = null;

			if (this._itemTemplateSelector && this.itemTemplates) {
				const key = this._itemTemplateSelector(dataItem, i, this.items);
				const length2 = this.itemTemplates.length;
				for (let j = 0; j < length2; j++) {
					const template = <KeyedTemplate>this.itemTemplates[j];
					if (template.key === key) {
						viewToAdd = template.createView();
						break;
					}
				}
			}

			if (!viewToAdd) {
				if (__UI_USE_EXTERNAL_RENDERER__) {
					viewToAdd = isFunction(this.itemTemplate) ? (<Template>this.itemTemplate)() : this._getDefaultItemContent(i);
				} else {
					viewToAdd = this.itemTemplate ? Builder.parse(this.itemTemplate, this) : this._getDefaultItemContent(i);
				}
			}

			viewToAdd.bindingContext = dataItem;
			this.itemsLayout.addChild(viewToAdd);
		}

		this._isDirty = false;
	}

	public _onItemsChanged(data: ChangedData<any>) {
		// TODO: use the event args and optimize this code by remove/add single items instead of full rebuild.
		this._requestRefresh();
	}

	public _getDefaultItemContent(index: number): View {
		const lbl = new Label();
		lbl.bind({
			targetProperty: 'text',
			sourceProperty: '$value',
		});

		return lbl;
	}

	private _getDataItem(index: number): any {
		const items = <ItemsSource>this.items;

		return items.getItem ? items.getItem(index) : this.items[index];
	}

	get _childrenCount(): number {
		return this.itemsLayout ? 1 : 0;
	}

	public eachChildView(callback: (child: View) => boolean) {
		if (this.itemsLayout) {
			callback(this.itemsLayout);
		}
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		const insets = this.getSafeAreaInsets();

		const paddingLeft = this.effectiveBorderLeftWidth + this.effectivePaddingLeft + insets.left;
		const paddingTop = this.effectiveBorderTopWidth + this.effectivePaddingTop + insets.top;
		const paddingRight = this.effectiveBorderRightWidth + this.effectivePaddingRight + insets.right;
		const paddingBottom = this.effectiveBorderBottomWidth + this.effectivePaddingBottom + insets.bottom;

		const childLeft = paddingLeft;
		const childTop = paddingTop;
		const childRight = right - left - paddingRight;
		const childBottom = bottom - top - paddingBottom;
		View.layoutChild(this, this.itemsLayout, childLeft, childTop, childRight, childBottom);
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const result = View.measureChild(this, this.itemsLayout, widthMeasureSpec, heightMeasureSpec);

		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		const widthAndState = View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
		const heightAndState = View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);

		this.setMeasuredDimension(widthAndState, heightAndState);
	}
}

Repeater.prototype.recycleNativeView = 'auto';

/**
 * Represents the item template property of each Repeater instance.
 */
export const itemTemplateProperty = new Property<Repeater, string | Template>({
	name: 'itemTemplate',
	affectsLayout: true,
	valueChanged: (target) => {
		target._requestRefresh();
	},
});
itemTemplateProperty.register(Repeater);

/**
 * Represents the items template property of each Repeater instance.
 */
export const itemTemplatesProperty = new Property<Repeater, string | Array<KeyedTemplate>>({
	name: 'itemTemplates',
	affectsLayout: true,
	valueConverter: (value) => {
		if (typeof value === 'string') {
			if (__UI_USE_XML_PARSER__) {
				return Builder.parseMultipleTemplates(value, null);
			} else {
				return null;
			}
		}

		return value;
	},
	valueChanged: (target) => {
		target._requestRefresh();
	},
});
itemTemplatesProperty.register(Repeater);

/**
 * Represents the property backing the items property of each Repeater instance.
 */
export const itemsProperty = new Property<Repeater, any[] | ItemsSource>({
	name: 'items',
	affectsLayout: true,
	valueChanged: (target, oldValue, newValue) => {
		if (oldValue instanceof ObservableArray) {
			removeWeakEventListener(oldValue, ObservableArray.changeEvent, target._onItemsChanged, target);
		}

		if (newValue instanceof ObservableArray) {
			addWeakEventListener(newValue, ObservableArray.changeEvent, target._onItemsChanged, target);
		}

		target._requestRefresh();
	},
});
itemsProperty.register(Repeater);

export const itemsLayoutProperty = new Property<Repeater, LayoutBase>({
	name: 'itemsLayout',
	affectsLayout: true,
	valueChanged: (target, oldValue, newValue) => {
		if (oldValue) {
			target._removeView(oldValue);
			oldValue.removeChildren();
		}

		if (newValue) {
			target._addView(newValue);
		}

		target._requestRefresh();
	},
});
itemsLayoutProperty.register(Repeater);
