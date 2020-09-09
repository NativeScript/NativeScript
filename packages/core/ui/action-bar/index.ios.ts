import { IOSActionItemSettings, ActionItem as ActionItemDefinition } from '.';
import { ActionItemBase, ActionBarBase, isVisible, flatProperty, iosIconRenderingModeProperty, traceMissingIcon } from './action-bar-common';
import { View } from '../core/view';
import { Color } from '../../color';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { ImageSource } from '../../image-source';
import { layout, iOSNativeHelper, isFontIconURI } from '../../utils';

export * from './action-bar-common';

const majorVersion = iOSNativeHelper.MajorVersion;
const UNSPECIFIED = layout.makeMeasureSpec(0, layout.UNSPECIFIED);

function loadActionIcon(item: ActionItemDefinition): any /* UIImage */ {
	let is = null;
	let img = null;

	const itemIcon = item.icon;
	const itemStyle = item.style;
	if (isFontIconURI(itemIcon)) {
		const fontIconCode = itemIcon.split('//')[1];
		const font = itemStyle.fontInternal;
		const color = itemStyle.color;
		is = ImageSource.fromFontIconCodeSync(fontIconCode, font, color);
	} else {
		is = ImageSource.fromFileOrResourceSync(itemIcon);
	}

	if (is && is.ios) {
		img = is.ios;
	} else {
		traceMissingIcon(itemIcon);
	}

	return img;
}

@NativeClass
class TapBarItemHandlerImpl extends NSObject {
	private _owner: WeakRef<ActionItemDefinition>;

	public static initWithOwner(owner: WeakRef<ActionItemDefinition>): TapBarItemHandlerImpl {
		let handler = <TapBarItemHandlerImpl>TapBarItemHandlerImpl.new();
		handler._owner = owner;

		return handler;
	}

	public tap(args) {
		let owner = this._owner.get();
		if (owner) {
			owner._raiseTap();
		}
	}

	public static ObjCExposedMethods = {
		tap: { returns: interop.types.void, params: [interop.types.id] },
	};
}

export class ActionItem extends ActionItemBase {
	private _ios: IOSActionItemSettings = {
		position: 'left',
		systemIcon: undefined,
	};

	public get ios(): IOSActionItemSettings {
		return this._ios;
	}
	public set ios(value: IOSActionItemSettings) {
		throw new Error('ActionItem.ios is read-only');
	}
}

export class NavigationButton extends ActionItem {
	_navigationItem: UINavigationItem;

	public _onVisibilityChanged(visibility: string): void {
		if (this._navigationItem) {
			const visible: boolean = visibility === 'visible';
			this._navigationItem.setHidesBackButtonAnimated(!visible, true);
		}
	}
}

export class ActionBar extends ActionBarBase {
	get ios(): UIView {
		const page = this.page;
		if (!page || !page.parent) {
			return;
		}

		const viewController = <UIViewController>page.ios;
		if (viewController.navigationController !== null) {
			return viewController.navigationController.navigationBar;
		}

		return null;
	}

	public createNativeView(): UIView {
		return this.ios;
	}

	public _addChildFromBuilder(name: string, value: any) {
		if (value instanceof NavigationButton) {
			this.navigationButton = value;
		} else if (value instanceof ActionItem) {
			this.actionItems.addItem(value);
		} else if (value instanceof View) {
			this.titleView = value;
		}
	}

	public get _getActualSize(): { width: number; height: number } {
		const navBar = this.ios;
		if (!navBar) {
			return { width: 0, height: 0 };
		}

		const frame = navBar.frame;
		const size = frame.size;
		const width = layout.toDevicePixels(size.width);
		const height = layout.toDevicePixels(size.height);

		return { width, height };
	}

	public layoutInternal(): void {
		const { width, height } = this._getActualSize;
		const widthSpec = layout.makeMeasureSpec(width, layout.EXACTLY);
		const heightSpec = layout.makeMeasureSpec(height, layout.EXACTLY);

		this.measure(widthSpec, heightSpec);
		this.layout(0, 0, width, height, false);
	}

	private _getIconRenderingMode(): UIImageRenderingMode {
		switch (this.iosIconRenderingMode) {
			case 'alwaysOriginal':
				return UIImageRenderingMode.AlwaysOriginal;
			case 'alwaysTemplate':
				return UIImageRenderingMode.AlwaysTemplate;
			case 'automatic':
			default:
				return UIImageRenderingMode.AlwaysOriginal;
		}
	}

	public update() {
		const page = this.page;
		// Page should be attached to frame to update the action bar.
		if (!page || !page.frame) {
			return;
		}

		const viewController = <UIViewController>page.ios;
		const navigationItem: UINavigationItem = viewController.navigationItem;
		const navController = <UINavigationController>viewController.navigationController;

		if (!navController) {
			return;
		}

		const navigationBar = navController.navigationBar;
		let previousController: UIViewController;

		// Set Title
		navigationItem.title = this.title;
		const titleView = this.titleView;
		if (titleView && titleView.ios) {
			navigationItem.titleView = titleView.ios;
		} else {
			navigationItem.titleView = null;
		}

		// Find previous ViewController in the navigation stack
		const indexOfViewController = navController.viewControllers.indexOfObject(viewController);
		if (indexOfViewController > 0 && indexOfViewController < navController.viewControllers.count) {
			previousController = navController.viewControllers[indexOfViewController - 1];
		}

		// Set back button text
		if (previousController) {
			if (this.navigationButton) {
				let tapHandler = TapBarItemHandlerImpl.initWithOwner(new WeakRef(this.navigationButton));
				let barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(this.navigationButton.text + '', UIBarButtonItemStyle.Plain, tapHandler, 'tap');
				previousController.navigationItem.backBarButtonItem = barButtonItem;
			} else {
				previousController.navigationItem.backBarButtonItem = null;
			}
		}

		// Set back button image
		let img: UIImage;
		if (this.navigationButton && isVisible(this.navigationButton) && this.navigationButton.icon) {
			img = loadActionIcon(this.navigationButton);
		}

		// TODO: This could cause issue when canceling BackEdge gesture - we will change the backIndicator to
		// show the one from the old page but the new page will still be visible (because we canceled EdgeBackSwipe gesutre)
		// Consider moving this to new method and call it from - navigationControllerDidShowViewControllerAnimated.
		if (img) {
			let image = img.imageWithRenderingMode(UIImageRenderingMode.AlwaysOriginal);
			navigationBar.backIndicatorImage = image;
			navigationBar.backIndicatorTransitionMaskImage = image;
		} else {
			navigationBar.backIndicatorImage = null;
			navigationBar.backIndicatorTransitionMaskImage = null;
		}

		// Set back button visibility
		if (this.navigationButton) {
			this.navigationButton._navigationItem = navigationItem;
			navigationItem.setHidesBackButtonAnimated(!isVisible(this.navigationButton), false);
		}

		// Populate action items
		this.populateMenuItems(navigationItem);

		// update colors explicitly - they may have to be cleared form a previous page
		this.updateColors(navigationBar);

		// the 'flat' property may have changed in between pages
		this.updateFlatness(navigationBar);

		if (!this.isLayoutValid) {
			this.layoutInternal();
		}
	}

	private populateMenuItems(navigationItem: UINavigationItem) {
		const items = this.actionItems.getVisibleItems();
		const leftBarItems = NSMutableArray.new();
		const rightBarItems = NSMutableArray.new();
		for (let i = 0; i < items.length; i++) {
			const barButtonItem = this.createBarButtonItem(items[i]);
			if (items[i].ios.position === 'left') {
				leftBarItems.addObject(barButtonItem);
			} else {
				rightBarItems.insertObjectAtIndex(barButtonItem, 0);
			}
		}

		navigationItem.setLeftBarButtonItemsAnimated(<any>leftBarItems, false);
		navigationItem.setRightBarButtonItemsAnimated(<any>rightBarItems, false);
		if (leftBarItems.count > 0) {
			navigationItem.leftItemsSupplementBackButton = true;
		}
	}

	private createBarButtonItem(item: ActionItemDefinition): UIBarButtonItem {
		const tapHandler = TapBarItemHandlerImpl.initWithOwner(new WeakRef(item));
		// associate handler with menuItem or it will get collected by JSC.
		(<any>item).handler = tapHandler;

		let barButtonItem: UIBarButtonItem;
		if (item.actionView && item.actionView.ios) {
			let recognizer = UITapGestureRecognizer.alloc().initWithTargetAction(tapHandler, 'tap');
			item.actionView.ios.addGestureRecognizer(recognizer);
			barButtonItem = UIBarButtonItem.alloc().initWithCustomView(item.actionView.ios);
		} else if (item.ios.systemIcon !== undefined) {
			let id: number = item.ios.systemIcon;
			if (typeof id === 'string') {
				id = parseInt(id);
			}

			barButtonItem = UIBarButtonItem.alloc().initWithBarButtonSystemItemTargetAction(id, tapHandler, 'tap');
		} else if (item.icon) {
			const img = loadActionIcon(item);
			if (img) {
				const image = img.imageWithRenderingMode(this._getIconRenderingMode());
				barButtonItem = UIBarButtonItem.alloc().initWithImageStyleTargetAction(image, UIBarButtonItemStyle.Plain, tapHandler, 'tap');
			}
		} else {
			barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(item.text + '', UIBarButtonItemStyle.Plain, tapHandler, 'tap');
		}

		if (item.text) {
			barButtonItem.isAccessibilityElement = true;
			barButtonItem.accessibilityLabel = item.text;
			barButtonItem.accessibilityTraits = UIAccessibilityTraitButton;
		}

		return barButtonItem;
	}

	private updateColors(navBar: UINavigationBar) {
		const color = this.color;
		this.setColor(navBar, color);

		const bgColor = <Color>this.backgroundColor;
		navBar.barTintColor = bgColor ? bgColor.ios : null;
	}

	private setColor(navBar: UINavigationBar, color?: Color) {
		if (color) {
			navBar.titleTextAttributes = <any>{
				[NSForegroundColorAttributeName]: color.ios,
			};
			navBar.largeTitleTextAttributes = <any>{
				[NSForegroundColorAttributeName]: color.ios,
			};
			navBar.tintColor = color.ios;
		} else {
			navBar.titleTextAttributes = null;
			navBar.largeTitleTextAttributes = null;
			navBar.tintColor = null;
		}
	}

	public _onTitlePropertyChanged() {
		const page = this.page;
		if (!page) {
			return;
		}

		if (page.frame) {
			page.frame._updateActionBar();
		}

		let navigationItem: UINavigationItem = (<UIViewController>page.ios).navigationItem;
		navigationItem.title = this.title;
	}

	private updateFlatness(navBar: UINavigationBar) {
		if (this.flat) {
			navBar.setBackgroundImageForBarMetrics(UIImage.new(), UIBarMetrics.Default);
			navBar.shadowImage = UIImage.new();
			navBar.translucent = false;
		} else {
			navBar.setBackgroundImageForBarMetrics(null, null);
			navBar.shadowImage = null;
			navBar.translucent = true;
		}
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const height = layout.getMeasureSpecSize(heightMeasureSpec);

		if (this.titleView) {
			View.measureChild(this, this.titleView, UNSPECIFIED, UNSPECIFIED);
		}

		this.actionItems.getItems().forEach((actionItem) => {
			const actionView = actionItem.actionView;
			if (actionView) {
				View.measureChild(this, actionView, UNSPECIFIED, UNSPECIFIED);
			}
		});

		// We ignore our width/height, minWidth/minHeight dimensions because it is against Apple policy to change height of NavigationBar.
		this.setMeasuredDimension(width, height);
	}

	public onLayout(left: number, top: number, right: number, bottom: number) {
		const titleView = this.titleView;
		if (titleView) {
			if (majorVersion > 10) {
				// On iOS 11 titleView is wrapped in another view that is centered with constraints.
				View.layoutChild(this, titleView, 0, 0, titleView.getMeasuredWidth(), titleView.getMeasuredHeight());
			} else {
				// On iOS <11 titleView is direct child of UINavigationBar so we give it full width and leave
				// the layout to center it.
				View.layoutChild(this, titleView, 0, 0, right - left, bottom - top);
			}
		}

		this.actionItems.getItems().forEach((actionItem) => {
			const actionView = actionItem.actionView;
			if (actionView && actionView.ios) {
				const measuredWidth = actionView.getMeasuredWidth();
				const measuredHeight = actionView.getMeasuredHeight();
				View.layoutChild(this, actionView, 0, 0, measuredWidth, measuredHeight);
			}
		});

		super.onLayout(left, top, right, bottom);
	}

	public layoutNativeView(left: number, top: number, right: number, bottom: number) {
		return;
	}

	private get navBar(): UINavigationBar {
		const page = this.page;
		// Page should be attached to frame to update the action bar.
		if (!page || !page.frame) {
			return undefined;
		}

		return (<UINavigationController>page.frame.ios.controller).navigationBar;
	}

	[colorProperty.getDefault](): UIColor {
		return null;
	}
	[colorProperty.setNative](color: Color) {
		const navBar = this.navBar;
		this.setColor(navBar, color);
	}

	[backgroundColorProperty.getDefault](): UIColor {
		// This getter is never called.
		// CssAnimationProperty use default value form their constructor.
		return null;
	}
	[backgroundColorProperty.setNative](value: UIColor | Color) {
		let navBar = this.navBar;
		if (navBar) {
			let color = value instanceof Color ? value.ios : value;
			navBar.barTintColor = color;
		}
	}

	[backgroundInternalProperty.getDefault](): UIColor {
		return null;
	}
	[backgroundInternalProperty.setNative](value: UIColor) {
		// tslint:disable-line
	}

	[flatProperty.setNative](value: boolean) {
		// tslint:disable-line
		const navBar = this.navBar;
		if (navBar) {
			this.updateFlatness(navBar);
		}
	}

	[iosIconRenderingModeProperty.getDefault](): 'automatic' | 'alwaysOriginal' | 'alwaysTemplate' {
		return 'alwaysOriginal';
	}
	[iosIconRenderingModeProperty.setNative](value: 'automatic' | 'alwaysOriginal' | 'alwaysTemplate') {
		this.update();
	}
}
