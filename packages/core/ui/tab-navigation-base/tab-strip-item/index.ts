// Types
import { TabStripItem as TabStripItemDefinition } from '.';
import { PropertyChangeData } from '../../../data/observable';
import { TabNavigationBase } from '../tab-navigation-base';
import { TabStrip } from '../tab-strip';
import { Color } from '../../../color';
import { AddChildFromBuilder, PseudoClassHandler } from '../../core/view';

// Requires
import { View, CSSType } from '../../core/view';
import { ViewBase } from '../../core/view-base';
import { backgroundColorProperty, backgroundInternalProperty } from '../../styling/style-properties';
import { Image } from '../../image';
import { Label } from '../../label';
import { textTransformProperty, TextTransform } from '../../text-base';

@CSSType('TabStripItem')
export class TabStripItem extends View implements TabStripItemDefinition, AddChildFromBuilder {
	public static tapEvent = 'tap';
	public static selectEvent = 'select';
	public static unselectEvent = 'unselect';

	public image: Image;
	public label: Label;
	public _index: number;

	private _title: string;
	private _iconSource: string;
	private _iconClass: string;

	private _highlightedHandler: () => void;
	private _normalHandler: () => void;

	private _labelColorHandler: (args: PropertyChangeData) => void;
	private _labelFontHandler: (args: PropertyChangeData) => void;
	private _labelTextTransformHandler: (args: PropertyChangeData) => void;
	private _labelTextHandler: (args: PropertyChangeData) => void;

	private _imageColorHandler: (args: PropertyChangeData) => void;
	private _imageFontHandler: (args: PropertyChangeData) => void;
	private _imageSrcHandler: (args: PropertyChangeData) => void;

	get title(): string {
		if (this.isLoaded) {
			return this.label.text;
		}

		return this._title;
	}

	set title(value: string) {
		this._title = value;

		if (this.isLoaded) {
			this.label.text = value;
		}
	}

	get iconClass(): string {
		if (this.isLoaded) {
			return this.image.className;
		}

		return this._iconClass;
	}

	set iconClass(value: string) {
		this._iconClass = value;

		if (this.isLoaded) {
			this.image.className = value;
		}
	}

	get iconSource(): string {
		if (this.isLoaded) {
			return this.image.src;
		}

		return this._iconSource;
	}

	set iconSource(value: string) {
		this._iconSource = value;

		if (this.isLoaded) {
			this.image.src = value;
		}
	}

	public onLoaded() {
		if (!this.image) {
			const image = new Image();
			image.src = this.iconSource;
			image.className = this.iconClass;
			this.image = image;
			this._addView(this.image);
		}

		if (!this.label) {
			const label = new Label();
			label.text = this.title;
			this.label = label;
			this._addView(this.label);
		}

		super.onLoaded();

		this._labelColorHandler =
			this._labelColorHandler ||
			((args: PropertyChangeData) => {
				const parent = <TabStrip>this.parent;
				const tabStripParent = parent && <TabNavigationBase>parent.parent;

				return tabStripParent && tabStripParent.setTabBarItemColor(this, args.value);
			});
		this.label.style.on('colorChange', this._labelColorHandler);

		this._labelFontHandler =
			this._labelFontHandler ||
			((args: PropertyChangeData) => {
				const parent = <TabStrip>this.parent;
				const tabStripParent = parent && <TabNavigationBase>parent.parent;

				return tabStripParent && tabStripParent.setTabBarItemFontInternal(this, args.value);
			});
		this.label.style.on('fontInternalChange', this._labelFontHandler);

		this._labelTextTransformHandler =
			this._labelTextTransformHandler ||
			((args: PropertyChangeData) => {
				const parent = <TabStrip>this.parent;
				const tabStripParent = parent && <TabNavigationBase>parent.parent;

				return tabStripParent && tabStripParent.setTabBarItemTextTransform(this, args.value);
			});
		this.label.style.on('textTransformChange', this._labelTextTransformHandler);

		this._labelTextHandler =
			this._labelTextHandler ||
			((args: PropertyChangeData) => {
				const parent = <TabStrip>this.parent;
				const tabStripParent = parent && <TabNavigationBase>parent.parent;

				return tabStripParent && tabStripParent.setTabBarItemTitle(this, args.value);
			});
		this.label.on('textChange', this._labelTextHandler);

		this._imageColorHandler =
			this._imageColorHandler ||
			((args: PropertyChangeData) => {
				const parent = <TabStrip>this.parent;
				const tabStripParent = parent && <TabNavigationBase>parent.parent;

				return tabStripParent && tabStripParent.setTabBarIconColor(this, args.value);
			});
		this.image.style.on('colorChange', this._imageColorHandler);

		this._imageFontHandler =
			this._imageFontHandler ||
			((args: PropertyChangeData) => {
				const parent = <TabStrip>this.parent;
				const tabStripParent = parent && <TabNavigationBase>parent.parent;

				return tabStripParent && tabStripParent.setTabBarIconColor(this, args.value);
			});
		this.image.style.on('fontInternalChange', this._imageFontHandler);

		this._imageSrcHandler =
			this._imageSrcHandler ||
			((args: PropertyChangeData) => {
				const parent = <TabStrip>this.parent;
				const tabStripParent = parent && <TabNavigationBase>parent.parent;

				return tabStripParent && tabStripParent.setTabBarIconSource(this, args.value);
			});
		this.image.on('srcChange', this._imageSrcHandler);
	}

	public onUnloaded() {
		super.onUnloaded();

		this.label.style.off('colorChange', this._labelColorHandler);
		this.label.style.off('fontInternalChange', this._labelFontHandler);
		this.label.style.off('textTransformChange', this._labelTextTransformHandler);
		this.label.style.off('textChange', this._labelTextHandler);

		this.image.style.off('colorChange', this._imageColorHandler);
		this.image.style.off('fontInternalChange', this._imageFontHandler);
		this.image.style.off('srcChange', this._imageSrcHandler);
	}

	public eachChild(callback: (child: ViewBase) => boolean) {
		if (this.label) {
			callback(this.label);
		}

		if (this.image) {
			callback(this.image);
		}
	}

	public _addChildFromBuilder(name: string, value: any): void {
		if (value instanceof Image) {
			this.image = <Image>value;
			this.iconSource = (<Image>value).src;
			this.iconClass = (<Image>value).className;
			this._addView(value);
			// selectedIndexProperty.coerce(this);
		}

		if (value instanceof Label) {
			this.label = <Label>value;
			this.title = (<Label>value).text;
			this._addView(value);
			// selectedIndexProperty.coerce(this);
		}
	}

	public requestLayout(): void {
		// Default implementation for non View instances (like TabViewItem).
		const parent = this.parent;
		if (parent) {
			parent.requestLayout();
		}
	}

	@PseudoClassHandler('normal', 'highlighted', 'pressed', 'active')
	_updateTabStateChangeHandler(subscribe: boolean) {
		if (subscribe) {
			this._highlightedHandler =
				this._highlightedHandler ||
				(() => {
					this._goToVisualState('highlighted');
				});

			this._normalHandler =
				this._normalHandler ||
				(() => {
					this._goToVisualState('normal');
				});

			this.on(TabStripItem.selectEvent, this._highlightedHandler);
			this.on(TabStripItem.unselectEvent, this._normalHandler);

			const parent = <TabStrip>this.parent;
			const tabStripParent = parent && <TabNavigationBase>parent.parent;
			if (this._index === tabStripParent.selectedIndex && !(global.isIOS && tabStripParent.cssType.toLowerCase() === 'tabs')) {
				// HACK: tabStripParent instanceof Tabs creates a circular dependency
				// HACK: tabStripParent.cssType === "Tabs" is a hacky workaround
				this._goToVisualState('highlighted');
			}
		} else {
			this.off(TabStripItem.selectEvent, this._highlightedHandler);
			this.off(TabStripItem.unselectEvent, this._normalHandler);
		}
	}

	[backgroundColorProperty.getDefault](): Color {
		const parent = <TabStrip>this.parent;
		const tabStripParent = parent && <TabNavigationBase>parent.parent;

		return tabStripParent && tabStripParent.getTabBarBackgroundColor();
	}
	[backgroundColorProperty.setNative](value: Color) {
		const parent = <TabStrip>this.parent;
		const tabStripParent = parent && <TabNavigationBase>parent.parent;

		return tabStripParent && tabStripParent.setTabBarItemBackgroundColor(this, value);
	}

	[textTransformProperty.getDefault](): TextTransform {
		const parent = <TabStrip>this.parent;
		const tabStripParent = parent && <TabNavigationBase>parent.parent;

		return tabStripParent && tabStripParent.getTabBarItemTextTransform(this);
	}
	[textTransformProperty.setNative](value: TextTransform) {
		const parent = <TabStrip>this.parent;
		const tabStripParent = parent && <TabNavigationBase>parent.parent;

		return tabStripParent && tabStripParent.setTabBarItemTextTransform(this, value);
	}

	[backgroundInternalProperty.getDefault](): any {
		return null;
	}
	[backgroundInternalProperty.setNative](value: any) {
		// disable the background CSS properties
	}
}
