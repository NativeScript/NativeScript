import common = require("./action-bar-common");
import frame = require("ui/frame");
import types = require("utils/types");
import enums = require("ui/enums");
import application = require("application");
import dts = require("ui/action-bar");
import view = require("ui/core/view");
import * as traceModule from "trace";
import * as utilsModule from "utils/utils";
import * as imageSourceModule from "image-source";
import style = require("ui/styling/style");
import font = require("ui/styling/font");
import styling = require("ui/styling");

const R_ID_HOME = 0x0102002c;
const ACTION_ITEM_ID_OFFSET = 1000;

global.moduleMerge(common, exports);

var actionItemIdGenerator = ACTION_ITEM_ID_OFFSET;
function generateItemId(): number {
    actionItemIdGenerator++;
    return actionItemIdGenerator;
}

export class ActionItem extends common.ActionItem {
    private _androidPosition: dts.AndroidActionItemSettings = {
        position: enums.AndroidActionItemPosition.actionBar,
        systemIcon: undefined
    };
    private _itemId;
    constructor() {
        super();
        this._itemId = generateItemId(); 
    }

    public get android(): dts.AndroidActionItemSettings {
        return this._androidPosition;
    }
    public set android(value: dts.AndroidActionItemSettings) {
        throw new Error("ActionItem.android is read-only");
    }

    public _getItemId() {
        return this._itemId;
    }
}

export class AndroidActionBarSettings implements dts.AndroidActionBarSettings {
    private _actionBar: ActionBar;
    private _icon: string;
    private _iconVisibility: string = enums.AndroidActionBarIconVisibility.auto;

    public get icon(): string {
        return this._icon;
    }
    public set icon(value: string) {
        if (value !== this._icon) {
            this._icon = value;
            this._actionBar._onIconPropertyChanged();
        }
    }

    public get iconVisibility(): string {
        return this._iconVisibility;
    }
    public set iconVisibility(value: string) {
        if (value !== this._iconVisibility) {
            this._iconVisibility = value;
            this._actionBar._onIconPropertyChanged();
        }
    }

    constructor(actionBar: ActionBar) {
        this._actionBar = actionBar;
    }
}

export class NavigationButton extends ActionItem {

}

export class ActionBar extends common.ActionBar {
    private _appResources: android.content.res.Resources;
    private _android: AndroidActionBarSettings;
    private _toolbar: android.support.v7.widget.Toolbar;

    get android(): AndroidActionBarSettings {
        return this._android;
    }

    set android(value: AndroidActionBarSettings) {
        throw new Error("ActionBar.android is read-only");
    }

    get _nativeView() {
        return this._toolbar;
    }

    constructor() {
        super();

        this._appResources = application.android.context.getResources();
        this._android = new AndroidActionBarSettings(this);
    }

    public _createUI() {
        this._toolbar = new android.support.v7.widget.Toolbar(this._context);
        var owner = this;
        this._toolbar.setOnMenuItemClickListener(new android.support.v7.widget.Toolbar.OnMenuItemClickListener({
            onMenuItemClick: function (item: android.view.IMenuItem): boolean {
                var itemId = item.getItemId();
                return owner._onAndroidItemSelected(itemId);
            }
        }));
        this.update();
    }

    public update() {
        if (!this._toolbar) {
            return;
        }

        if (!this.page.frame || !this.page.frame._getNavBarVisible(this.page)) {
            this._toolbar.setVisibility(android.view.View.GONE);

            // If action bar is hidden - no need to fill it with items.
            return;
        }
        this._toolbar.setVisibility(android.view.View.VISIBLE);

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
        var menuItem: dts.ActionItem = undefined;
        var items = this.actionItems.getItems();
        for (let i = 0; i < items.length; i++) {
            if ((<ActionItem>items[i])._getItemId() === itemId) {
                menuItem = items[i];
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
        var navButton = this.navigationButton;
        if (navButton && common.isVisible(navButton)) {
            if (navButton.android.systemIcon) {
                // Try to look in the system resources.
                let systemResourceId = getSystemResourceId(navButton.android.systemIcon);
                if (systemResourceId) {
                    this._toolbar.setNavigationIcon(systemResourceId);
                }
            }
            else if (navButton.icon) {
                let drawableOrId = getDrawableOrResourceId(navButton.icon, this._appResources);
                this._toolbar.setNavigationIcon(drawableOrId);
            }

            this._toolbar.setNavigationOnClickListener(new android.view.View.OnClickListener({
                onClick: function (v) {
                    if (navButton) {
                        navButton._raiseTap();
                    }
                }
            }));
        }
        else {
            this._toolbar.setNavigationIcon(null);
        }
    }

    public _updateIcon() {
        var visibility = getIconVisibility(this.android.iconVisibility);
        if (visibility) {
            var icon = this.android.icon;
            if (types.isDefined(icon)) {
                var drawableOrId = getDrawableOrResourceId(icon, this._appResources);
                if (drawableOrId) {
                    this._toolbar.setLogo(drawableOrId);
                }
            }
            else {
                var defaultIcon = application.android.nativeApp.getApplicationInfo().icon;
                this._toolbar.setLogo(defaultIcon);
            }
        }
        else {
            this._toolbar.setLogo(null);
        }
    }

    public _updateTitleAndTitleView() {
        if (!this.titleView) {
            // No title view - show the title
            var title = this.title;
            if (types.isDefined(title)) {
                this._toolbar.setTitle(title);
            } else {
                var appContext = application.android.context;
                var appInfo = appContext.getApplicationInfo();
                var appLabel = appContext.getPackageManager().getApplicationLabel(appInfo);
                if (appLabel) {
                    this._toolbar.setTitle(appLabel);
                }
            }
        }
    }

    public _addActionItems() {
        var menu = this._toolbar.getMenu();
        var items = this.actionItems.getVisibleItems();

        menu.clear();
        for (var i = 0; i < items.length; i++) {
            var item = <ActionItem>items[i];
            var menuItem = menu.add(android.view.Menu.NONE, item._getItemId(), android.view.Menu.NONE, item.text + "");

            if (item.android.systemIcon) {
                // Try to look in the system resources.
                let systemResourceId = getSystemResourceId(item.android.systemIcon);
                if (systemResourceId) {
                    menuItem.setIcon(systemResourceId);
                }
            }
            else if (item.icon) {
                var drawableOrId = getDrawableOrResourceId(item.icon, this._appResources);
                if (drawableOrId) {
                    menuItem.setIcon(drawableOrId);
                }
                else {
                    throw new Error("Error loading icon from " + item.icon);
                }
            }

            var showAsAction = getShowAsAction(item);
            menuItem.setShowAsAction(showAsAction);
        }
    }

    public _onTitlePropertyChanged() {
        var topFrame = frame.topmost();
        if (topFrame && topFrame.currentPage === this.page) {
            this._updateTitleAndTitleView();
        }
    }

    public _onIconPropertyChanged() {
        var topFrame = frame.topmost();
        if (topFrame && topFrame.currentPage === this.page) {
            this._updateIcon();
        }
    }

    public _clearAndroidReference() {
        // don't clear _android field!
        this._toolbar = undefined;
    }

    public _addViewToNativeVisualTree(child: view.View, atIndex?: number): boolean {
        super._addViewToNativeVisualTree(child);

        if (this._toolbar && child._nativeView) {

            if (types.isNullOrUndefined(atIndex) || atIndex >= this._nativeView.getChildCount()) {
                this._toolbar.addView(child._nativeView);
            }
            else {
                this._toolbar.addView(child._nativeView, atIndex);
            }
            return true;
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: view.View): void {
        super._removeViewFromNativeVisualTree(child);

        if (this._toolbar && child._nativeView) {
            this._toolbar.removeView(child._nativeView);

            var trace: typeof traceModule = require("trace");

            trace.notifyEvent(child, "childInLayoutRemovedFromNativeVisualTree");
        }
    }
}

function getDrawableOrResourceId(icon: string, resources: android.content.res.Resources): any {
    if (!types.isString(icon)) {
        return undefined;
    }

    var utils: typeof utilsModule = require("utils/utils");

    if (icon.indexOf(utils.RESOURCE_PREFIX) === 0) {
        var resourceId: number = resources.getIdentifier(icon.substr(utils.RESOURCE_PREFIX.length), 'drawable', application.android.packageName);
        if (resourceId > 0) {
            return resourceId;
        }
    }
    else {
        var drawable: android.graphics.drawable.BitmapDrawable;

        var imageSource: typeof imageSourceModule = require("image-source");

        var is = imageSource.fromFileOrResource(icon);
        if (is) {
            drawable = new android.graphics.drawable.BitmapDrawable(is.android);
        }

        return drawable;
    }

    return undefined;
}

function getShowAsAction(menuItem: dts.ActionItem): number {
    switch (menuItem.android.position) {
        case enums.AndroidActionItemPosition.actionBarIfRoom:
            return android.view.MenuItem.SHOW_AS_ACTION_IF_ROOM;

        case enums.AndroidActionItemPosition.popup:
            return android.view.MenuItem.SHOW_AS_ACTION_NEVER;

        case enums.AndroidActionItemPosition.actionBar:
        default:
            return android.view.MenuItem.SHOW_AS_ACTION_ALWAYS;
    }
}

function getIconVisibility(iconVisibility: string): boolean {
    switch (iconVisibility) {
        case enums.AndroidActionBarIconVisibility.always:
            return true;

        case enums.AndroidActionBarIconVisibility.auto:
        case enums.AndroidActionBarIconVisibility.never:
        default:
            return false;
    }
}

function getSystemResourceId(systemIcon: string): number {
    return android.content.res.Resources.getSystem().getIdentifier(systemIcon, "drawable", "android");
}

export class ActionBarStyler implements style.Styler {
    // color
    private static setColorProperty(v: view.View, newValue: any) {
        var toolbar = (<android.support.v7.widget.Toolbar>v._nativeView);
        toolbar.setTitleTextColor(newValue);

    }

    private static resetColorProperty(v: view.View, nativeValue: any) {
        // there is no toolbar.getTitleTextColor - so default to black
        if (types.isNullOrUndefined(nativeValue)) {
            nativeValue = android.graphics.Color.BLACK;
        }
        (<android.support.v7.widget.Toolbar>v._nativeView).setTitleTextColor(nativeValue);
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            ActionBarStyler.setColorProperty,
            ActionBarStyler.resetColorProperty), "ActionBar");
    }
}

ActionBarStyler.registerHandlers();
