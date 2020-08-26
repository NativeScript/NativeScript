import { AndroidActionItemSettings, AndroidActionBarSettings as AndroidActionBarSettingsDefinition, ActionItem as ActionItemDefinition } from '.';
import { ActionItemBase, ActionBarBase, isVisible, flatProperty, traceMissingIcon, androidContentInsetLeftProperty, androidContentInsetRightProperty } from './action-bar-common';
import { View } from '../core/view';
import { Color } from '../../color';
import { layout, RESOURCE_PREFIX, isFontIconURI } from '../../utils';
import { colorProperty } from '../styling/style-properties';
import { ImageSource } from '../../image-source';
import * as application from '../../application';

export * from './action-bar-common';

const R_ID_HOME = 0x0102002c;
const ACTION_ITEM_ID_OFFSET = 10000;
const DEFAULT_ELEVATION = 4;

let AppCompatTextView;
let actionItemIdGenerator = ACTION_ITEM_ID_OFFSET;
function generateItemId(): number {
	actionItemIdGenerator++;

	return actionItemIdGenerator;
}

function loadActionIconDrawableOrResourceId(item: ActionItemDefinition): any {
	const itemIcon = item.icon;
	const itemStyle = item.style;
	let drawableOrId = null;

	if (isFontIconURI(itemIcon)) {
		const fontIconCode = itemIcon.split('//')[1];
		const font = itemStyle.fontInternal;
		const color = itemStyle.color;
		const is = ImageSource.fromFontIconCodeSync(fontIconCode, font, color);

		if (is && is.android) {
			drawableOrId = new android.graphics.drawable.BitmapDrawable(appResources, is.android);
		}
	} else {
		drawableOrId = getDrawableOrResourceId(itemIcon, appResources);
	}

	if (!drawableOrId) {
		traceMissingIcon(itemIcon);
	}

	return drawableOrId;
}

interface MenuItemClickListener {
	new (owner: ActionBar): androidx.appcompat.widget.Toolbar.OnMenuItemClickListener;
}

let appResources: android.content.res.Resources;
let MenuItemClickListener: MenuItemClickListener;

function initializeMenuItemClickListener(): void {
	if (MenuItemClickListener) {
		return;
	}

	apiLevel = android.os.Build.VERSION.SDK_INT;

	AppCompatTextView = androidx.appcompat.widget.AppCompatTextView;

	@NativeClass
	@Interfaces([androidx.appcompat.widget.Toolbar.OnMenuItemClickListener])
	class MenuItemClickListenerImpl extends java.lang.Object implements androidx.appcompat.widget.Toolbar.OnMenuItemClickListener {
		constructor(public owner: ActionBar) {
			super();

			return global.__native(this);
		}

		onMenuItemClick(item: android.view.MenuItem): boolean {
			let itemId = item.getItemId();

			return this.owner._onAndroidItemSelected(itemId);
		}
	}

	MenuItemClickListener = MenuItemClickListenerImpl;
	appResources = application.android.context.getResources();
}

let apiLevel: number;

export class ActionItem extends ActionItemBase {
	private _androidPosition: AndroidActionItemSettings = {
		position: 'actionBar',
		systemIcon: undefined,
	};

	private _itemId;
	constructor() {
		super();
		this._itemId = generateItemId();
	}

	public get android(): AndroidActionItemSettings {
		return this._androidPosition;
	}
	public set android(value: AndroidActionItemSettings) {
		throw new Error('ActionItem.android is read-only');
	}

	public _getItemId() {
		return this._itemId;
	}
}

export class AndroidActionBarSettings implements AndroidActionBarSettingsDefinition {
	private _actionBar: ActionBar;
	private _icon: string;
	private _iconVisibility: 'auto' | 'never' | 'always' = 'auto';

	constructor(actionBar: ActionBar) {
		this._actionBar = actionBar;
	}

	public get icon(): string {
		return this._icon;
	}
	public set icon(value: string) {
		if (value !== this._icon) {
			this._icon = value;
			this._actionBar._onIconPropertyChanged();
		}
	}

	public get iconVisibility(): 'auto' | 'never' | 'always' {
		return this._iconVisibility;
	}
	public set iconVisibility(value: 'auto' | 'never' | 'always') {
		if (value !== this._iconVisibility) {
			this._iconVisibility = value;
			this._actionBar._onIconPropertyChanged();
		}
	}
}

export class NavigationButton extends ActionItem {}

export class ActionBar extends ActionBarBase {
	private _android: AndroidActionBarSettings;
	public nativeViewProtected: androidx.appcompat.widget.Toolbar;

	constructor() {
		super();
		this._android = new AndroidActionBarSettings(this);
	}

	get android(): AndroidActionBarSettings {
		return this._android;
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

	public createNativeView() {
		return new androidx.appcompat.widget.Toolbar(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		initializeMenuItemClickListener();
		const menuItemClickListener = new MenuItemClickListener(this);
		nativeView.setOnMenuItemClickListener(menuItemClickListener);
		(<any>nativeView).menuItemClickListener = menuItemClickListener;
	}

	public disposeNativeView() {
		(<any>this.nativeViewProtected).menuItemClickListener.owner = null;
		super.disposeNativeView();
	}

	public onLoaded() {
		super.onLoaded();
		this.update();
	}

	public update() {
		if (!this.nativeViewProtected) {
			return;
		}

		const page = this.page;
		if (!page.frame || !page.frame._getNavBarVisible(page)) {
			this.nativeViewProtected.setVisibility(android.view.View.GONE);

			// If action bar is hidden - no need to fill it with items.
			return;
		}

		this.nativeViewProtected.setVisibility(android.view.View.VISIBLE);

		// Add menu items
		this._addActionItems();

		// Set title
		this._updateTitleAndTitleView();

		// Set home icon
		this._updateIcon();

		// Set navigation button
		this._updateNavigationButton();
	}

	public _onAndroidItemSelected(itemId: number): boolean {
		// Handle home button
		if (this.navigationButton && itemId === R_ID_HOME) {
			this.navigationButton._raiseTap();

			return true;
		}

		// Find item with the right ID;
		let menuItem: ActionItem = undefined;
		let items = this.actionItems.getItems();
		for (let i = 0; i < items.length; i++) {
			if ((<ActionItem>items[i])._getItemId() === itemId) {
				menuItem = <ActionItem>items[i];
				break;
			}
		}

		if (menuItem) {
			menuItem._raiseTap();

			return true;
		}

		return false;
	}

	public _updateNavigationButton() {
		const navButton = this.navigationButton;
		if (navButton && isVisible(navButton)) {
			const systemIcon = navButton.android.systemIcon;
			if (systemIcon !== undefined) {
				// Try to look in the system resources.
				const systemResourceId = getSystemResourceId(systemIcon);
				if (systemResourceId) {
					this.nativeViewProtected.setNavigationIcon(systemResourceId);
				}
			} else if (navButton.icon) {
				const drawableOrId = loadActionIconDrawableOrResourceId(navButton);
				if (drawableOrId) {
					this.nativeViewProtected.setNavigationIcon(drawableOrId);
				}
			}

			// Set navigation content description, used by screen readers for the vision-impaired users
			this.nativeViewProtected.setNavigationContentDescription(navButton.text || null);

			let navBtn = new WeakRef(navButton);
			this.nativeViewProtected.setNavigationOnClickListener(
				new android.view.View.OnClickListener({
					onClick: function (v) {
						let owner = navBtn.get();
						if (owner) {
							owner._raiseTap();
						}
					},
				})
			);
		} else {
			this.nativeViewProtected.setNavigationIcon(null);
		}
	}

	public _updateIcon() {
		let visibility = getIconVisibility(this.android.iconVisibility);
		if (visibility) {
			let icon = this.android.icon;
			if (icon !== undefined) {
				let drawableOrId = getDrawableOrResourceId(icon, appResources);
				if (drawableOrId) {
					this.nativeViewProtected.setLogo(drawableOrId);
				} else {
					traceMissingIcon(icon);
				}
			} else {
				let defaultIcon = application.android.nativeApp.getApplicationInfo().icon;
				this.nativeViewProtected.setLogo(defaultIcon);
			}
		} else {
			this.nativeViewProtected.setLogo(null);
		}
	}

	public _updateTitleAndTitleView() {
		if (!this.titleView) {
			// No title view - show the title
			let title = this.title;
			if (title !== undefined) {
				this.nativeViewProtected.setTitle(title);
			} else {
				let appContext = application.android.context;
				let appInfo = appContext.getApplicationInfo();
				let appLabel = appContext.getPackageManager().getApplicationLabel(appInfo);
				if (appLabel) {
					this.nativeViewProtected.setTitle(appLabel);
				}
			}
		}
	}

	public _addActionItems() {
		let menu = this.nativeViewProtected.getMenu();
		let items = this.actionItems.getVisibleItems();

		menu.clear();
		for (let i = 0; i < items.length; i++) {
			let item = <ActionItem>items[i];
			let menuItem = menu.add(android.view.Menu.NONE, item._getItemId(), android.view.Menu.NONE, item.text + '');

			if (item.actionView && item.actionView.android) {
				// With custom action view, the menuitem cannot be displayed in a popup menu.
				item.android.position = 'actionBar';
				menuItem.setActionView(item.actionView.android);
				ActionBar._setOnClickListener(item);
			} else if (item.android.systemIcon) {
				// Try to look in the system resources.
				let systemResourceId = getSystemResourceId(item.android.systemIcon);
				if (systemResourceId) {
					menuItem.setIcon(systemResourceId);
				}
			} else if (item.icon) {
				const drawableOrId = loadActionIconDrawableOrResourceId(item);
				if (drawableOrId) {
					menuItem.setIcon(drawableOrId);
				}
			}

			let showAsAction = getShowAsAction(item);
			menuItem.setShowAsAction(showAsAction);
		}
	}

	private static _setOnClickListener(item: ActionItem): void {
		const weakRef = new WeakRef(item);
		item.actionView.android.setOnClickListener(
			new android.view.View.OnClickListener({
				onClick: function (v: android.view.View) {
					const owner = weakRef.get();
					if (owner) {
						owner._raiseTap();
					}
				},
			})
		);
	}

	public _onTitlePropertyChanged() {
		if (this.nativeViewProtected) {
			this._updateTitleAndTitleView();
		}
	}

	public _onIconPropertyChanged() {
		if (this.nativeViewProtected) {
			this._updateIcon();
		}
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number = Number.MAX_VALUE): boolean {
		super._addViewToNativeVisualTree(child);

		if (this.nativeViewProtected && child.nativeViewProtected) {
			if (atIndex >= this.nativeViewProtected.getChildCount()) {
				this.nativeViewProtected.addView(child.nativeViewProtected);
			} else {
				this.nativeViewProtected.addView(child.nativeViewProtected, atIndex);
			}

			return true;
		}

		return false;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		super._removeViewFromNativeVisualTree(child);

		if (this.nativeViewProtected && child.nativeViewProtected) {
			this.nativeViewProtected.removeView(child.nativeViewProtected);
		}
	}

	[colorProperty.getDefault](): number {
		const nativeView = this.nativeViewProtected;
		if (!defaultTitleTextColor) {
			let tv: android.widget.TextView = getAppCompatTextView(nativeView);
			if (!tv) {
				const title = nativeView.getTitle();
				// setTitle will create AppCompatTextView internally;
				nativeView.setTitle('');
				tv = getAppCompatTextView(nativeView);
				if (title) {
					// restore title.
					nativeView.setTitle(title);
				}
			}

			// Fallback to hardcoded falue if we don't find TextView instance...
			// using new TextView().getTextColors().getDefaultColor() returns different value: -1979711488
			defaultTitleTextColor = tv ? tv.getTextColors().getDefaultColor() : -570425344;
		}

		return defaultTitleTextColor;
	}
	[colorProperty.setNative](value: number | Color) {
		const color = value instanceof Color ? value.android : value;
		this.nativeViewProtected.setTitleTextColor(color);
	}

	[flatProperty.setNative](value: boolean) {
		const compat = <any>androidx.core.view.ViewCompat;
		if (compat.setElevation) {
			if (value) {
				compat.setElevation(this.nativeViewProtected, 0);
			} else {
				const val = DEFAULT_ELEVATION * layout.getDisplayDensity();
				compat.setElevation(this.nativeViewProtected, val);
			}
		}
	}

	[androidContentInsetLeftProperty.setNative]() {
		if (apiLevel >= 21) {
			this.nativeViewProtected.setContentInsetsAbsolute(this.effectiveContentInsetLeft, this.effectiveContentInsetRight);
		}
	}

	[androidContentInsetRightProperty.setNative]() {
		if (apiLevel >= 21) {
			this.nativeViewProtected.setContentInsetsAbsolute(this.effectiveContentInsetLeft, this.effectiveContentInsetRight);
		}
	}
}

function getAppCompatTextView(toolbar: androidx.appcompat.widget.Toolbar): typeof AppCompatTextView {
	for (let i = 0, count = toolbar.getChildCount(); i < count; i++) {
		const child = toolbar.getChildAt(i);
		if (child instanceof AppCompatTextView) {
			return child;
		}
	}

	return null;
}

ActionBar.prototype.recycleNativeView = 'auto';

let defaultTitleTextColor: number;

function getDrawableOrResourceId(icon: string, resources: android.content.res.Resources): any {
	if (typeof icon !== 'string') {
		return null;
	}

	let result = null;
	if (icon.indexOf(RESOURCE_PREFIX) === 0) {
		let resourceId: number = resources.getIdentifier(icon.substr(RESOURCE_PREFIX.length), 'drawable', application.android.packageName);
		if (resourceId > 0) {
			result = resourceId;
		}
	} else {
		let drawable: android.graphics.drawable.BitmapDrawable;
		let is = ImageSource.fromFileOrResourceSync(icon);
		if (is) {
			drawable = new android.graphics.drawable.BitmapDrawable(appResources, is.android);
		}

		result = drawable;
	}

	return result;
}

function getShowAsAction(menuItem: ActionItem): number {
	switch (menuItem.android.position) {
		case 'actionBarIfRoom':
			return android.view.MenuItem.SHOW_AS_ACTION_IF_ROOM;

		case 'popup':
			return android.view.MenuItem.SHOW_AS_ACTION_NEVER;

		case 'actionBar':
		default:
			return android.view.MenuItem.SHOW_AS_ACTION_ALWAYS;
	}
}

function getIconVisibility(iconVisibility: string): boolean {
	switch (iconVisibility) {
		case 'always':
			return true;

		case 'auto':
		case 'never':
		default:
			return false;
	}
}

function getSystemResourceId(systemIcon: string): number {
	return android.content.res.Resources.getSystem().getIdentifier(systemIcon, 'drawable', 'android');
}
