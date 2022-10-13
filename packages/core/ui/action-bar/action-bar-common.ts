import { ActionBar as ActionBarDefinition, ActionItems as ActionItemsDefinition, ActionItem as ActionItemDefinition, NavigationButton, IOSActionItemSettings, AndroidActionItemSettings, AndroidActionBarSettings } from '.';

import { profile } from '../../profiling';
import { CoreTypes } from '../../core-types';
import { View, CSSType } from '../core/view';
import { ViewBase, booleanConverter } from '../core/view-base';
import { Trace } from '../../trace';
import { ShorthandProperty, CssProperty, Property, unsetValue } from '../core/properties';
import { Length, horizontalAlignmentProperty, verticalAlignmentProperty } from '../styling/style-properties';
import { Style } from '../styling/style';

@CSSType('ActionBar')
export class ActionBarBase extends View implements ActionBarDefinition {
	private _actionItems: ActionItems;
	private _navigationButton: NavigationButton;
	private _titleView: View;

	public title: string;
	public flat: boolean;
	public iosIconRenderingMode: 'automatic' | 'alwaysOriginal' | 'alwaysTemplate';

	public effectiveContentInsetLeft: number;
	public effectiveContentInsetRight: number;

	get navigationButton(): NavigationButton {
		return this._navigationButton;
	}
	disposeNativeView() {
		this._actionItems = null;
		super.disposeNativeView();
	}
	set navigationButton(value: NavigationButton) {
		if (this._navigationButton !== value) {
			if (this._navigationButton) {
				this._removeView(this._navigationButton);
				this._navigationButton.actionBar = undefined;
			}

			this._navigationButton = value;

			if (this._navigationButton) {
				this._navigationButton.actionBar = this;
				this._addView(this._navigationButton);
			}

			this.update();
		}
	}

	get actionItems(): ActionItems {
		return this._actionItems;
	}
	set actionItems(value: ActionItems) {
		throw new Error('actionItems property is read-only');
	}

	get titleView(): View {
		return this._titleView;
	}
	set titleView(value: View) {
		if (this._titleView !== value) {
			if (this._titleView) {
				this._removeView(this._titleView);
				this._titleView.style[horizontalAlignmentProperty.cssName] = unsetValue;
				this._titleView.style[verticalAlignmentProperty.cssName] = unsetValue;
			}

			this._titleView = value;

			if (value) {
				// Addview will reset CSS properties so we first add it then set aligments with lowest priority.
				this._addView(value);
				const style = value.style;

				if (!horizontalAlignmentProperty.isSet(style)) {
					style[horizontalAlignmentProperty.cssName] = 'center';
				}

				if (!verticalAlignmentProperty.isSet(style)) {
					style[verticalAlignmentProperty.cssName] = 'middle';
				}
			}

			this.update();
		}
	}

	public get androidContentInset(): string | CoreTypes.LengthType {
		return this.style.androidContentInset;
	}
	public set androidContentInset(value: string | CoreTypes.LengthType) {
		this.style.androidContentInset = value;
	}

	public get androidContentInsetLeft(): CoreTypes.LengthType {
		return this.style.androidContentInsetLeft;
	}
	public set androidContentInsetLeft(value: CoreTypes.LengthType) {
		this.style.androidContentInsetLeft = value;
	}

	public get androidContentInsetRight(): CoreTypes.LengthType {
		return this.style.androidContentInsetRight;
	}
	public set androidContentInsetRight(value: CoreTypes.LengthType) {
		this.style.androidContentInsetRight = value;
	}

	// @ts-ignore
	get ios(): any {
		return undefined;
	}

	// @ts-ignore
	get android(): AndroidActionBarSettings {
		return undefined;
	}

	get _childrenCount(): number {
		let actionViewsCount = 0;
		this._actionItems?.getItems().forEach((actionItem) => {
			if (actionItem.actionView) {
				actionViewsCount++;
			}
		});

		return actionViewsCount + (this.titleView ? 1 : 0);
	}

	constructor() {
		super();
		this._actionItems = new ActionItems(this);
	}

	public static onTitleChanged;

	public update() {
		//
	}

	public _onTitlePropertyChanged() {
		//
	}

	public _addArrayFromBuilder(name: string, value: Array<any>) {
		if (name === 'actionItems') {
			this.actionItems?.setItems(value);
		}
	}

	public eachChildView(callback: (child: View) => boolean) {
		const titleView = this.titleView;
		if (titleView) {
			callback(titleView);
		}
	}

	public eachChild(callback: (child: ViewBase) => boolean) {
		const titleView = this.titleView;
		if (titleView) {
			callback(titleView);
		}

		const navigationButton = this._navigationButton;
		if (navigationButton) {
			callback(navigationButton);
		}

		this.actionItems?.getItems().forEach((actionItem) => {
			callback(actionItem);
		});
	}

	public _isEmpty(): boolean {
		if (this.title || this.titleView || (this.android && this.android.icon) || this.navigationButton || this.actionItems?.getItems().length > 0) {
			return false;
		}

		return true;
	}
}

export class ActionItems implements ActionItemsDefinition {
	private _items = new Array<ActionItemDefinition>();
	private _actionBar: ActionBarDefinition;

	constructor(actionBar: ActionBarDefinition) {
		this._actionBar = actionBar;
	}

	public addItem(item: ActionItemDefinition): void {
		if (!item) {
			throw new Error('Cannot add empty item');
		}

		this._items.push(item);
		item.actionBar = this._actionBar;

		this._actionBar._addView(item);

		this.invalidate();
	}

	public removeItem(item: ActionItemDefinition): void {
		if (!item) {
			throw new Error('Cannot remove empty item');
		}

		const itemIndex = this._items.indexOf(item);
		if (itemIndex < 0) {
			throw new Error('Cannot find item to remove');
		}

		this._items.splice(itemIndex, 1);
		this._actionBar._removeView(item);

		item.actionBar = undefined;
		this.invalidate();
	}

	public getItems(): Array<ActionItemDefinition> {
		return this._items.slice();
	}

	public getVisibleItems(): Array<ActionItemDefinition> {
		const visibleItems = [];
		this._items.forEach((item) => {
			if (isVisible(item)) {
				visibleItems.push(item);
			}
		});

		return visibleItems;
	}

	public getItemAt(index: number): ActionItemDefinition {
		if (index < 0 || index >= this._items.length) {
			return undefined;
		}

		return this._items[index];
	}

	public setItems(items: Array<ActionItemDefinition>) {
		// Remove all existing items
		while (this._items.length > 0) {
			this.removeItem(this._items[this._items.length - 1]);
		}

		// Add new items
		for (let i = 0; i < items.length; i++) {
			this.addItem(items[i]);
		}

		this.invalidate();
	}

	private invalidate() {
		if (this._actionBar) {
			this._actionBar.update();
		}
	}
}

export class ActionItemBase extends ViewBase implements ActionItemDefinition {
	public static tapEvent = 'tap';

	private _actionBar: ActionBarDefinition;
	private _actionView: View;

	// @ts-ignore
	public ios: IOSActionItemSettings;
	// @ts-ignore
	public android: AndroidActionItemSettings;

	public text: string;
	public icon: string;
	public visibility: string;

	get actionView(): View {
		return this._actionView;
	}
	set actionView(value: View) {
		if (this._actionView !== value) {
			if (this._actionView) {
				this._actionView.style[horizontalAlignmentProperty.cssName] = unsetValue;
				this._actionView.style[verticalAlignmentProperty.cssName] = unsetValue;
				this._removeView(this._actionView);
			}

			this._actionView = value;

			if (this._actionView) {
				this._addView(this._actionView);
			}

			if (this._actionBar) {
				this._actionBar.update();
			}
		}
	}

	get actionBar(): ActionBarDefinition {
		return this._actionBar;
	}
	set actionBar(value: ActionBarDefinition) {
		if (value !== this._actionBar) {
			this._actionBar = value;
		}
	}

	@profile
	public onLoaded() {
		if (this._actionView) {
			this._actionView.style[horizontalAlignmentProperty.cssName] = 'center';
			this._actionView.style[verticalAlignmentProperty.cssName] = 'middle';
		}
		super.onLoaded();
	}

	public _raiseTap() {
		this._emit(ActionItemBase.tapEvent);
	}

	public _addChildFromBuilder(name: string, value: any) {
		this.actionView = value;
	}

	public _onVisibilityChanged(visibility: string) {
		if (this.actionBar) {
			this.actionBar.update();
		}
	}

	public eachChild(callback: (child: ViewBase) => boolean) {
		if (this._actionView) {
			callback(this._actionView);
		}
	}
}

export function isVisible(item: ActionItemDefinition) {
	return item.visibility === 'visible';
}

function onTitlePropertyChanged(actionBar: ActionBarBase, oldValue: string, newValue: string) {
	actionBar._onTitlePropertyChanged();
}

export const titleProperty = new Property<ActionBarBase, string>({
	name: 'title',
	valueChanged: onTitlePropertyChanged,
});
titleProperty.register(ActionBarBase);

function onItemChanged(item: ActionItemBase, oldValue: string, newValue: string) {
	if (item.actionBar) {
		item.actionBar.update();
	}
}

function onVisibilityChanged(item: ActionItemBase, oldValue: string, newValue: string) {
	item._onVisibilityChanged(newValue);
}

export function traceMissingIcon(icon: string) {
	Trace.write('Could not load action bar icon: ' + icon, Trace.categories.Error, Trace.messageType.error);
}

function convertToContentInset(this: void, value: string | CoreTypes.LengthType): [CssProperty<any, any>, any][] {
	if (typeof value === 'string' && value !== 'auto') {
		const insets = value.split(/[ ,]+/);

		return [
			[androidContentInsetLeftProperty, Length.parse(insets[0])],
			[androidContentInsetRightProperty, Length.parse(insets[1] || insets[0])],
		];
	} else {
		return [
			[androidContentInsetLeftProperty, value],
			[androidContentInsetRightProperty, value],
		];
	}
}

export const iosIconRenderingModeProperty = new Property<ActionBarBase, 'automatic' | 'alwaysOriginal' | 'alwaysTemplate'>({ name: 'iosIconRenderingMode', defaultValue: 'alwaysOriginal' });
iosIconRenderingModeProperty.register(ActionBarBase);

export const textProperty = new Property<ActionItemBase, string>({
	name: 'text',
	defaultValue: '',
	valueChanged: onItemChanged,
});
textProperty.register(ActionItemBase);

export const iconProperty = new Property<ActionItemBase, string>({
	name: 'icon',
	valueChanged: onItemChanged,
});
iconProperty.register(ActionItemBase);

export const visibilityProperty = new Property({
	name: 'visibility',
	defaultValue: 'visible',
	valueChanged: onVisibilityChanged,
});
visibilityProperty.register(ActionItemBase);

export const flatProperty = new Property<ActionBarBase, boolean>({
	name: 'flat',
	defaultValue: false,
	valueConverter: booleanConverter,
});
flatProperty.register(ActionBarBase);

const androidContentInsetProperty = new ShorthandProperty<Style, string | CoreTypes.LengthType>({
	name: 'androidContentInset',
	cssName: 'android-content-inset',
	getter: function (this: Style) {
		if (Length.equals(this.androidContentInsetLeft, this.androidContentInsetRight)) {
			return this.androidContentInsetLeft;
		}

		return `${Length.convertToString(this.androidContentInsetLeft)} ${Length.convertToString(this.androidContentInsetRight)}`;
	},
	converter: convertToContentInset,
});
androidContentInsetProperty.register(Style);

export const androidContentInsetLeftProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'androidContentInsetLeft',
	cssName: 'android-content-inset-left',
	defaultValue: 'auto',
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const view = <ActionBarBase>target.viewRef.deref();
		if (view) {
			view.effectiveContentInsetLeft = Length.toDevicePixels(newValue);
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
	},
	valueConverter: Length.parse,
});
androidContentInsetLeftProperty.register(Style);

export const androidContentInsetRightProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'androidContentInsetRight',
	cssName: 'android-content-inset-right',
	defaultValue: 'auto',
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const view = <ActionBarBase>target.viewRef.deref();
		if (view) {
			view.effectiveContentInsetRight = Length.toDevicePixels(newValue);
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
	},
	valueConverter: Length.parse,
});
androidContentInsetRightProperty.register(Style);
