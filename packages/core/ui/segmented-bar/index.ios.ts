import { Font } from '../styling/font';
import { SegmentedBarItemBase, SegmentedBarBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty } from './segmented-bar-common';
import { colorProperty, fontInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { iOSNativeHelper } from '../../utils';
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
		const currentOsVersion = iOSNativeHelper.MajorVersion;

		return currentOsVersion < 13 ? this.ios.tintColor : this.ios.selectedSegmentTintColor;
	}
	[selectedBackgroundColorProperty.setNative](value: UIColor | Color) {
		const currentOsVersion = iOSNativeHelper.MajorVersion;
		const color = value instanceof Color ? value.ios : value;
		if (currentOsVersion < 13) {
			this.ios.tintColor = color;
		} else {
			this.ios.selectedSegmentTintColor = color;
		}
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
		const owner = this._owner.get();
		if (owner) {
			owner.selectedIndex = sender.selectedSegmentIndex;
		}
	}

	public static ObjCExposedMethods = {
		selected: { returns: interop.types.void, params: [UISegmentedControl] },
	};
}
