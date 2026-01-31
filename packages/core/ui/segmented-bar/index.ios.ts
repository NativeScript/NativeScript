import { Font } from '../styling/font';
import { SegmentedBarItemBase, SegmentedBarBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty } from './segmented-bar-common';
import { colorProperty, fontInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { Trace } from '../../trace';
import { SDK_VERSION } from '../../utils';
export * from './segmented-bar-common';

export class SegmentedBarItem extends SegmentedBarItemBase {
	public _update() {
		const parent = <SegmentedBar>this.parent;
		if (parent?.ios) {
			const tabIndex = parent.items.indexOf(this);
			let title = this.title;
			title = title === null || title === undefined ? '' : title;
			parent.ios.setTitleForSegmentAtIndex(title, tabIndex);
		}
	}
}

export class SegmentedBar extends SegmentedBarBase {
	nativeViewProtected: UISegmentedControl;
	private _selectionHandler: NSObject;

	createNativeView() {
		return UISegmentedControl.new();
	}

	initNativeView() {
		super.initNativeView();
		this._selectionHandler = SelectionHandlerImpl.initWithOwner(new WeakRef(this));
		this.nativeViewProtected.addTargetActionForControlEvents(this._selectionHandler, 'selected', UIControlEvents.ValueChanged);
	}

	disposeNativeView() {
		this._selectionHandler = null;
		super.disposeNativeView();
	}

	onLoaded() {
		super.onLoaded();
		// Force background redraw to ensure border radius is applied.
		// This fixes the visual glitch where backgroundColor initially has sharp corners.
		if (this.nativeBackgroundState === 'invalid') {
			this._redrawNativeBackground(this.style.backgroundInternal);
		}
	}

	// @ts-ignore
	get ios(): UISegmentedControl {
		return this.nativeViewProtected;
	}

	[selectedIndexProperty.getDefault](): number {
		return -1;
	}
	[selectedIndexProperty.setNative](value: number) {
		this.ios.selectedSegmentIndex = value;
	}

	[itemsProperty.getDefault](): SegmentedBarItem[] {
		return null;
	}
	[itemsProperty.setNative](value: SegmentedBarItem[]) {
		const segmentedControl = this.ios;
		segmentedControl.removeAllSegments();
		const newItems = value;

		if (newItems && newItems.length) {
			newItems.forEach((item, index, arr) => {
				let title = item.title;
				title = title === null || title === undefined ? '' : title;
				segmentedControl.insertSegmentWithTitleAtIndexAnimated(title, index, false);
			});
		}

		selectedIndexProperty.coerce(this);
	}

	[selectedBackgroundColorProperty.getDefault](): UIColor {
		return SDK_VERSION < 13 ? this.ios.tintColor : this.ios.selectedSegmentTintColor;
	}
	[selectedBackgroundColorProperty.setNative](value: UIColor | Color) {
		const color = value instanceof Color ? value.ios : value;
		if (SDK_VERSION < 13) {
			this.ios.tintColor = color;
		} else {
			this.ios.selectedSegmentTintColor = color;
		}
		this.setSelectedTextColor(this.ios);
	}

	[colorProperty.getDefault](): UIColor {
		return null;
	}
	[colorProperty.setNative](value: Color | UIColor) {
		const color = value instanceof Color ? value.ios : value;
		const bar = this.ios;
		const currentAttrs = bar.titleTextAttributesForState(UIControlState.Normal);
		const attrs = currentAttrs ? currentAttrs.mutableCopy() : NSMutableDictionary.new();
		attrs.setValueForKey(color, NSForegroundColorAttributeName);
		bar.setTitleTextAttributesForState(attrs, UIControlState.Normal);
		// Set the selected text color
		this.setSelectedTextColor(bar);
	}

	[fontInternalProperty.getDefault](): Font {
		return null;
	}
	[fontInternalProperty.setNative](value: Font) {
		const font: UIFont = value ? value.getUIFont(UIFont.systemFontOfSize(UIFont.labelFontSize)) : null;
		const bar = this.ios;
		const currentAttrs = bar.titleTextAttributesForState(UIControlState.Normal);
		const attrs = currentAttrs ? currentAttrs.mutableCopy() : NSMutableDictionary.new();
		attrs.setValueForKey(font, NSFontAttributeName);
		bar.setTitleTextAttributesForState(attrs, UIControlState.Normal);
	}
	setSelectedTextColor(bar: UISegmentedControl) {
		try {
			const selectedTextColor = this.getColorForIOS(this?.selectedTextColor ?? this?.color ?? '#000000');
			if (!selectedTextColor) {
				Trace.write(`unable te set selectedTextColor`, Trace.categories.Error);
			}
			const selectedText = bar.titleTextAttributesForState(UIControlState.Selected);
			const attrsSelected = selectedText ? selectedText.mutableCopy() : NSMutableDictionary.new();
			attrsSelected.setValueForKey(selectedTextColor, NSForegroundColorAttributeName);
			bar.setTitleTextAttributesForState(attrsSelected, UIControlState.Selected);
		} catch (e) {
			console.error(`SegmentedBar:`, e);
		}
	}
	private getColorForIOS(color: string | Color): UIColor {
		if (typeof color === 'string') {
			return new Color(color).ios;
		} else if (color instanceof Color) {
			return color.ios;
		}
	}
}

@NativeClass
class SelectionHandlerImpl extends NSObject {
	private _owner: WeakRef<SegmentedBar>;

	public static initWithOwner(owner: WeakRef<SegmentedBar>): SelectionHandlerImpl {
		const handler = <SelectionHandlerImpl>SelectionHandlerImpl.new();
		handler._owner = owner;

		return handler;
	}

	public selected(sender: UISegmentedControl) {
		const owner = this._owner?.deref();
		if (owner) {
			owner.selectedIndex = sender.selectedSegmentIndex;
			owner.setSelectedTextColor(sender);
		}
	}

	public static ObjCExposedMethods = {
		selected: { returns: interop.types.void, params: [UISegmentedControl] },
	};
}
