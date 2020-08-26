import { TabView as TabViewDefinition, TabViewItem as TabViewItemDefinition, SelectedIndexChangedEventData } from '.';
import { View, AddArrayFromBuilder, AddChildFromBuilder, CSSType } from '../core/view';
import { ViewBase, booleanConverter } from '../core/view-base';
import { Style } from '../styling/style';
import { EventData } from '../../data/observable';
import { Color } from '../../color';
import { Property, CssProperty, CoercibleProperty } from '../core/properties';
import { TextTransform } from '../text-base';
import { Trace } from '../../trace';

export const traceCategory = 'TabView';

@CSSType('TabViewItem')
export abstract class TabViewItemBase extends ViewBase implements TabViewItemDefinition, AddChildFromBuilder {
	private _title: string = '';
	private _view: View;
	private _iconSource: string;

	get textTransform(): TextTransform {
		return this.style.textTransform;
	}
	set textTransform(value: TextTransform) {
		this.style.textTransform = value;
	}

	public _addChildFromBuilder(name: string, value: any): void {
		if (value instanceof View) {
			this.view = value;
		}
	}

	get title(): string {
		return this._title;
	}
	set title(value: string) {
		if (this._title !== value) {
			this._title = value;
			this._update();
		}
	}

	get view(): View {
		return this._view;
	}
	set view(value: View) {
		if (this._view !== value) {
			if (this._view) {
				throw new Error('Changing the view of an already loaded TabViewItem is not currently supported.');
			}

			this._view = value;
			this._addView(value);
		}
	}

	get iconSource(): string {
		return this._iconSource;
	}
	set iconSource(value: string) {
		if (this._iconSource !== value) {
			this._iconSource = value;
			this._update();
		}
	}

	public eachChild(callback: (child: ViewBase) => boolean) {
		const view = this._view;
		if (view) {
			callback(view);
		}
	}

	public loadView(view: ViewBase): void {
		const tabView = this.parent as TabViewBase;
		if (tabView && tabView.items) {
			// Don't load items until their fragments are instantiated.
			if ((<TabViewItemDefinition>this).canBeLoaded) {
				super.loadView(view);
			}
		}
	}

	public abstract _update();
}

@CSSType('TabView')
export class TabViewBase extends View implements TabViewDefinition, AddChildFromBuilder, AddArrayFromBuilder {
	public static selectedIndexChangedEvent = 'selectedIndexChanged';

	public items: TabViewItemDefinition[];
	public selectedIndex: number;
	public androidOffscreenTabLimit: number;
	public androidTabsPosition: 'top' | 'bottom';
	public androidSwipeEnabled: boolean;
	public iosIconRenderingMode: 'automatic' | 'alwaysOriginal' | 'alwaysTemplate';

	get androidSelectedTabHighlightColor(): Color {
		return this.style.androidSelectedTabHighlightColor;
	}
	set androidSelectedTabHighlightColor(value: Color) {
		this.style.androidSelectedTabHighlightColor = value;
	}

	get tabTextFontSize(): number {
		return this.style.tabTextFontSize;
	}
	set tabTextFontSize(value: number) {
		this.style.tabTextFontSize = value;
	}

	get tabTextColor(): Color {
		return this.style.tabTextColor;
	}
	set tabTextColor(value: Color) {
		this.style.tabTextColor = value;
	}

	get tabBackgroundColor(): Color {
		return this.style.tabBackgroundColor;
	}
	set tabBackgroundColor(value: Color) {
		this.style.tabBackgroundColor = value;
	}

	get selectedTabTextColor(): Color {
		return this.style.selectedTabTextColor;
	}
	set selectedTabTextColor(value: Color) {
		this.style.selectedTabTextColor = value;
	}

	public _addArrayFromBuilder(name: string, value: Array<any>) {
		if (name === 'items') {
			this.items = value;
		}
	}

	public _addChildFromBuilder(name: string, value: any): void {
		if (value instanceof TabViewItemBase) {
			if (!this.items) {
				this.items = new Array<TabViewItemBase>();
			}
			this.items.push(<TabViewItemBase>value);
			this._addView(value);
			selectedIndexProperty.coerce(this);
		}
	}

	get _selectedView(): View {
		let selectedIndex = this.selectedIndex;

		return selectedIndex > -1 ? this.items[selectedIndex].view : null;
	}

	get _childrenCount(): number {
		const items = this.items;

		return items ? items.length : 0;
	}

	public eachChild(callback: (child: ViewBase) => boolean) {
		const items = this.items;
		if (items) {
			items.forEach((item, i) => {
				callback(item);
			});
		}
	}

	public eachChildView(callback: (child: View) => boolean) {
		const items = this.items;
		if (items) {
			items.forEach((item, i) => {
				callback(item.view);
			});
		}
	}

	public onItemsChanged(oldItems: TabViewItemDefinition[], newItems: TabViewItemDefinition[]): void {
		if (oldItems) {
			oldItems.forEach((item) => this._removeView(item));
		}

		if (newItems) {
			newItems.forEach((item) => {
				if (!item.view) {
					throw new Error(`TabViewItem must have a view.`);
				}

				this._addView(item);
			});
		}
	}

	public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
		// to be overridden in platform specific files
		this.notify(<SelectedIndexChangedEventData>{
			eventName: TabViewBase.selectedIndexChangedEvent,
			object: this,
			oldIndex,
			newIndex,
		});
	}
}

export interface TabViewBase {
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
	on(event: 'selectedIndexChanged', callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
}

export function traceMissingIcon(icon: string) {
	Trace.write('Could not load tab bar icon: ' + icon, Trace.categories.Error, Trace.messageType.error);
}

export const selectedIndexProperty = new CoercibleProperty<TabViewBase, number>({
	name: 'selectedIndex',
	defaultValue: -1,
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		target.onSelectedIndexChanged(oldValue, newValue);
	},
	coerceValue: (target, value) => {
		let items = target.items;
		if (items) {
			let max = items.length - 1;
			if (value < 0) {
				value = 0;
			}
			if (value > max) {
				value = max;
			}
		} else {
			value = -1;
		}

		return value;
	},
	valueConverter: (v) => parseInt(v),
});
selectedIndexProperty.register(TabViewBase);

export const itemsProperty = new Property<TabViewBase, TabViewItemDefinition[]>({
	name: 'items',
	valueChanged: (target, oldValue, newValue) => {
		target.onItemsChanged(oldValue, newValue);
	},
});
itemsProperty.register(TabViewBase);

export const iosIconRenderingModeProperty = new Property<TabViewBase, 'automatic' | 'alwaysOriginal' | 'alwaysTemplate'>({ name: 'iosIconRenderingMode', defaultValue: 'automatic' });
iosIconRenderingModeProperty.register(TabViewBase);

export const androidOffscreenTabLimitProperty = new Property<TabViewBase, number>({
	name: 'androidOffscreenTabLimit',
	defaultValue: 1,
	affectsLayout: global.isIOS,
	valueConverter: (v) => parseInt(v),
});
androidOffscreenTabLimitProperty.register(TabViewBase);

export const androidTabsPositionProperty = new Property<TabViewBase, 'top' | 'bottom'>({ name: 'androidTabsPosition', defaultValue: 'top' });
androidTabsPositionProperty.register(TabViewBase);

export const androidSwipeEnabledProperty = new Property<TabViewBase, boolean>({
	name: 'androidSwipeEnabled',
	defaultValue: true,
	valueConverter: booleanConverter,
});
androidSwipeEnabledProperty.register(TabViewBase);

export const tabTextFontSizeProperty = new CssProperty<Style, number>({
	name: 'tabTextFontSize',
	cssName: 'tab-text-font-size',
	valueConverter: (v) => parseFloat(v),
});
tabTextFontSizeProperty.register(Style);

export const tabTextColorProperty = new CssProperty<Style, Color>({
	name: 'tabTextColor',
	cssName: 'tab-text-color',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
tabTextColorProperty.register(Style);

export const tabBackgroundColorProperty = new CssProperty<Style, Color>({
	name: 'tabBackgroundColor',
	cssName: 'tab-background-color',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
tabBackgroundColorProperty.register(Style);

export const selectedTabTextColorProperty = new CssProperty<Style, Color>({
	name: 'selectedTabTextColor',
	cssName: 'selected-tab-text-color',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
selectedTabTextColorProperty.register(Style);

export const androidSelectedTabHighlightColorProperty = new CssProperty<Style, Color>({
	name: 'androidSelectedTabHighlightColor',
	cssName: 'android-selected-tab-highlight-color',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
androidSelectedTabHighlightColorProperty.register(Style);
