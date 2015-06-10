import common = require("ui/action-bar/action-bar-common");
import trace = require("trace");
import frame = require("ui/frame");
import types = require("utils/types");
import utils = require("utils/utils");
import imageSource = require("image-source");
import enums = require("ui/enums");
import application = require("application");

var ACTION_ITEM_ID_OFFSET = 1000;
var API_LVL = android.os.Build.VERSION.SDK_INT;

declare var exports;
require("utils/module-merge").merge(common, exports);

export class ActionBar extends common.ActionBar {
    private _appResources: android.content.res.Resources;

    constructor() {
        super();

        this._appResources = application.android.context.getResources();
        this.actionItems
    }

    public updateActionBar() {
        if (this.page && this.page.frame && this.page.frame.android && this.page.frame.android.activity) {
            this.page.frame.android.activity.invalidateOptionsMenu();
        }
    }

    public _onAndroidItemSelected(itemId: number): boolean{
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

    public _updateAndroidActionBar(menu: android.view.IMenu) {
        var actionBar: android.app.ActionBar = frame.topmost().android.actionBar;

        this._addActionItems(menu);

        // Set title
        this._updateTitle(actionBar);

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
                try {
                    // TODO: Find a better way to set the icon instead of using reflection
                    var drawableOrId = getDrawableOrResourceId(navButton.icon, this._appResources);
                    if (!drawableOrId) {
                        drawableOrId = 0;
                    }

                    var arr, arr2, method;
                    if (types.isNumber(drawableOrId)) {
                        arr[0] = java.lang.Integer.TYPE;
                        method = actionBar.getClass().getMethod("setHomeAsUpIndicator", arr);

                        arr2 = java.lang.reflect.Array.newInstance(java.lang.Object.class, 1);
                        arr2[0] = new java.lang.Integer(drawableOrId);
                        method.invoke(actionBar, arr2);
                    } else {
                        arr = java.lang.reflect.Array.newInstance(java.lang.Class.class, 1);
                        arr[0] = android.graphics.drawable.Drawable.class;
                        method = actionBar.getClass().getMethod("setHomeAsUpIndicator", arr);

                        arr2 = java.lang.reflect.Array.newInstance(java.lang.Object.class, 1);
                        arr2[0] = drawableOrId;
                        method.invoke(actionBar, arr2);
                    }
                }
                catch (e) {
                    trace.write("Failed to set navigation icon: " + e, trace.categories.Error, trace.messageType.error);
                }
            }
            actionBar.setDisplayHomeAsUpEnabled(true);
        }
        else {
            actionBar.setDisplayHomeAsUpEnabled(false);
        }
    }

    public _updateIcon(actionBar: android.app.ActionBar) {
        var icon = this.icon;
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

        var iconVisibility: boolean;
        if (this.androidIconVisibility === enums.AndroidActionBarIconVisibility.always) {
            iconVisibility = true;
        }

        var visibility = getIconVisibility(this.androidIconVisibility);
        actionBar.setDisplayShowHomeEnabled(visibility);
    }

    public _updateTitle(actionBar: android.app.ActionBar) {
        var title = this.title;
        if (types.isDefined(title)) {
            actionBar.setTitle(title);
        } else {
            var defaultLabel = application.android.nativeApp.getApplicationInfo().labelRes;
            actionBar.setTitle(defaultLabel);
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
        if (frame.topmost().currentPage === this.page) {
            this._updateTitle(frame.topmost().android.actionBar);
        }
    }

    public _onIconPropertyChanged() {
        if (frame.topmost().currentPage === this.page) {
            this._updateIcon(frame.topmost().android.actionBar);
        }
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

function getShowAsAction(menuItem: common.ActionItem): number {
    switch (menuItem.androidPosition) {
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