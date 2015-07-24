import common = require("ui/action-bar/action-bar-common");
import trace = require("trace");
import frame = require("ui/frame");
import types = require("utils/types");
import utils = require("utils/utils");
import imageSource = require("image-source");
import enums = require("ui/enums");
import application = require("application");
import dts = require("ui/action-bar");

var ACTION_ITEM_ID_OFFSET = 1000;
var API_LVL = android.os.Build.VERSION.SDK_INT;

declare var exports;
require("utils/module-merge").merge(common, exports);

export class ActionItem extends common.ActionItemBase implements dts.ActionItem {
    private _androidPosition: dts.AndroidActionItemSettings = { position: enums.AndroidActionItemPosition.actionBar };

    public get android(): dts.AndroidActionItemSettings {
        return this._androidPosition;
    }
    public set android(value: dts.AndroidActionItemSettings) {
        throw new Error("ActionItem.android is read-only");
    }

    // Not used in Android
    public ios: dts.IOSActionItemSettings;
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

export class ActionBar extends common.ActionBar {
    private _appResources: android.content.res.Resources;
    private _android: AndroidActionBarSettings;

    get android(): AndroidActionBarSettings {
        return this._android;
    }

    set android(value: AndroidActionBarSettings) {
        throw new Error("ActionBar.android is read-only");
    }

    get _nativeView() {
        return undefined;
    }

    constructor() {
        super();

        this._appResources = application.android.context.getResources();
        this._android = new AndroidActionBarSettings(this);
    }

    public update() {
        if (this.page && this.page.frame && this.page.frame.android && this.page.frame.android.activity) {
            this.page.frame.android.activity.invalidateOptionsMenu();
        }
    }

    public _onAndroidItemSelected(itemId: number): boolean {
        var menuItem = this.actionItems.getItemAt(itemId - ACTION_ITEM_ID_OFFSET);
        if (menuItem) {
            menuItem._raiseTap();
            return true;
        }

        if (this.navigationButton && itemId === (<any>android).R.id.home) {
            this.navigationButton._raiseTap();
            return true;
        }

        return false;
    }

    public _updateAndroid(menu: android.view.IMenu) {
        var actionBar: android.app.ActionBar = frame.topmost().android.actionBar;

        if (this.page.actionBarHidden) {
            if (actionBar.isShowing()) {
                actionBar.hide();
            }

            // If action bar is hidden - no need to fill it with items.
            return;
        }

        // Assure action bar is showing;
        if (!actionBar.isShowing()) {
            actionBar.show();
        }

        this._addActionItems(menu);

        // Set title
        this._updateTitleAndTitleView(actionBar);

        // Set home icon
        this._updateIcon(actionBar);

        // Set navigation button
        this._updateNavigationButton(actionBar);
    }

    public _updateNavigationButton(actionBar: android.app.ActionBar) {
        var navButton = this.navigationButton;
        if (navButton) {
            // No API to set the icon in pre-lvl 18 
            if (API_LVL >= 18) {
                var drawableOrId = getDrawableOrResourceId(navButton.icon, this._appResources);
                if (!drawableOrId) {
                    drawableOrId = 0;
                }

                setHomeAsUpIndicator(actionBar, drawableOrId);
            }
            actionBar.setDisplayHomeAsUpEnabled(true);
        }
        else {
            actionBar.setDisplayHomeAsUpEnabled(false);
        }
    }

    public _updateIcon(actionBar: android.app.ActionBar) {
        var icon = this.android.icon;
        if (types.isDefined(icon)) {
            var drawableOrId = getDrawableOrResourceId(icon, this._appResources);
            if (drawableOrId) {
                actionBar.setIcon(drawableOrId);
            }
        }
        else {
            var defaultIcon = application.android.nativeApp.getApplicationInfo().icon;
            actionBar.setIcon(defaultIcon);
        }

        var visibility = getIconVisibility(this.android.iconVisibility);
        actionBar.setDisplayShowHomeEnabled(visibility);
    }

    public _updateTitleAndTitleView(actionBar: android.app.ActionBar) {
        if (this.titleView) {
            actionBar.setCustomView(this.titleView.android);
            actionBar.setDisplayShowCustomEnabled(true);
            actionBar.setDisplayShowTitleEnabled(false);
        }
        else {
            actionBar.setCustomView(null);
            actionBar.setDisplayShowCustomEnabled(false);
            actionBar.setDisplayShowTitleEnabled(true);

            // No title view - show the title
            var title = this.title;
            if (types.isDefined(title)) {
                actionBar.setTitle(title);
            } else {
                var defaultLabel = application.android.nativeApp.getApplicationInfo().labelRes;
                actionBar.setTitle(defaultLabel);
            }
        }
    }

    public _addActionItems(menu: android.view.IMenu) {
        var items = this.actionItems.getItems();

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var menuItem = menu.add(android.view.Menu.NONE, i + ACTION_ITEM_ID_OFFSET, android.view.Menu.NONE, item.text);
            if (item.icon) {
                var drawableOrId = getDrawableOrResourceId(item.icon, this._appResources);
                if (drawableOrId) {
                    menuItem.setIcon(drawableOrId);
                }
            }

            var showAsAction = getShowAsAction(item);
            menuItem.setShowAsAction(showAsAction);
        }
    }

    public _onTitlePropertyChanged() {
        var topFrame = frame.topmost();
        if (topFrame && topFrame.currentPage === this.page) {
            this._updateTitleAndTitleView(frame.topmost().android.actionBar);
        }
    }

    public _onIconPropertyChanged() {
        var topFrame = frame.topmost();
        if (topFrame && topFrame.currentPage === this.page) {
            this._updateIcon(frame.topmost().android.actionBar);
        }
    }

    public _clearAndroidReference() {
        // don't clear _android field!
    }
}

var setHomeAsUpIndicatorWithResoruceId: java.lang.reflect.Method;
var setHomeAsUpIndicatorWithDrawable: java.lang.reflect.Method;
function setHomeAsUpIndicator(actionBar: android.app.ActionBar, drawableOrId: any) {
    try {
        // TODO: Remove reflection as soon as AppCopmat libs are available
        var paramsArr = java.lang.reflect.Array.newInstance(java.lang.Object.class, 1);
        if (types.isNumber(drawableOrId)) {
            if (!setHomeAsUpIndicatorWithResoruceId) {
                // get setHomeAsUpIndicator(resourceId: number) method with reflection and cache it
                let typeArr = java.lang.reflect.Array.newInstance(java.lang.Class.class, 1);
                typeArr[0] = java.lang.Integer.TYPE;
                setHomeAsUpIndicatorWithResoruceId = actionBar.getClass().getMethod("setHomeAsUpIndicator", typeArr);
            }

            paramsArr[0] = new java.lang.Integer(drawableOrId);
            setHomeAsUpIndicatorWithResoruceId.invoke(actionBar, paramsArr);
        } else {
            if (!setHomeAsUpIndicatorWithDrawable) {
                // get setHomeAsUpIndicator(drawable) method with reflection and cache it
                let typeArr = java.lang.reflect.Array.newInstance(java.lang.Class.class, 1);
                typeArr[0] = android.graphics.drawable.Drawable.class;
                setHomeAsUpIndicatorWithDrawable = actionBar.getClass().getMethod("setHomeAsUpIndicator", typeArr);
            }

            paramsArr[0] = drawableOrId;
            setHomeAsUpIndicatorWithDrawable.invoke(actionBar, paramsArr);
        }
    }
    catch (e) {
        trace.write("Failed to set navigation icon: " + e, trace.categories.Error, trace.messageType.error);
    }
}

function getDrawableOrResourceId(icon: string, resources: android.content.res.Resources): any {
    if (!types.isString(icon)) {
        return undefined;
    }

    if (icon.indexOf(utils.RESOURCE_PREFIX) === 0) {
        var resourceId: number = resources.getIdentifier(icon.substr(utils.RESOURCE_PREFIX.length), 'drawable', application.android.packageName);
        if (resourceId > 0) {
            return resourceId;
        }
    }
    else {
        var drawable: android.graphics.drawable.BitmapDrawable;
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

        case enums.AndroidActionBarIconVisibility.never:
            return false;

        case enums.AndroidActionBarIconVisibility.auto:
        default:
            return API_LVL <= 20;
    }
}