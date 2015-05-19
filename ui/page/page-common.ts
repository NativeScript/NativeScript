import contentView = require("ui/content-view");
import view = require("ui/core/view");
import dts = require("ui/page");
import frame = require("ui/frame");
import styleScope = require("ui/styling/style-scope");
import fs = require("file-system");
import fileSystemAccess = require("file-system/file-system-access");
import bindable = require("ui/core/bindable");
import dependencyObservable = require("ui/core/dependency-observable");
import enums = require("ui/enums");
import frameCommon = require("ui/frame/frame-common");

var OPTIONS_MENU = "optionsMenu";

export module knownCollections {
    export var optionsMenu = "optionsMenu";
}

export class Page extends contentView.ContentView implements dts.Page, view.AddArrayFromBuilder {
    public static navigatingToEvent = "navigatingTo";
    public static navigatedToEvent = "navigatedTo";
    public static navigatingFromEvent = "navigatingFrom";
    public static navigatedFromEvent = "navigatedFrom";
    public static shownModallyEvent = "shownModally";

    private _navigationContext: any;

    private _cssApplied: boolean;
    private _styleScope: styleScope.StyleScope = new styleScope.StyleScope();
    private _optionsMenu: OptionsMenu;

    constructor(options?: dts.Options) {
        super(options);
        this._optionsMenu = new OptionsMenu(this);
    }

    public onLoaded() {
        this._applyCss();
        super.onLoaded();
    }

    get navigationContext(): any {
        return this._navigationContext;
    }

    get css(): string {
        if (this._styleScope) {
            return this._styleScope.css;
        }
        return undefined;
    }
    set css(value: string) {
        this._styleScope.css = value;
        this._refreshCss();
    }

    get optionsMenu(): OptionsMenu {
        return this._optionsMenu;
    }
    set optionsMenu(value: OptionsMenu) {
        throw new Error("optionsMenu property is read-only");
    }

    private _refreshCss(): void {
        if (this._cssApplied) {
            this._resetCssValues();
        }

        this._cssApplied = false;
        if (this.isLoaded) {
            this._applyCss();
        }
    }

    public addCss(cssString: string): void {
        this._addCssInternal(cssString, undefined);
    }

    private _addCssInternal(cssString: string, cssFileName: string): void {
        this._styleScope.addCss(cssString, cssFileName);
        this._refreshCss();
    }

    public addCssFile(cssFileName: string) {
        if (cssFileName.indexOf(fs.knownFolders.currentApp().path) !== 0) {
            cssFileName = fs.path.join(fs.knownFolders.currentApp().path, cssFileName);
        }

        var cssString;
        if (fs.File.exists(cssFileName)) {
            new fileSystemAccess.FileSystemAccess().readText(cssFileName, r => { cssString = r; });
            this._addCssInternal(cssString, cssFileName);
        }
    }

    get frame(): frame.Frame {
        return <frame.Frame>this.parent;
    }

    public onNavigatingTo(context: any) {
        this._navigationContext = context;

        this.notify({
            eventName: Page.navigatingToEvent,
            object: this,
            context: this.navigationContext
        });
    }

    public onNavigatedTo() {
        this.notify({
            eventName: Page.navigatedToEvent,
            object: this,
            context: this.navigationContext
        });
    }

    public onNavigatingFrom() {
        this.notify({
            eventName: Page.navigatingFromEvent,
            object: this,
            context: this.navigationContext
        });
    }

    public onNavigatedFrom(isBackNavigation: boolean) {
        this.notify({
            eventName: Page.navigatedFromEvent,
            object: this,
            context: this.navigationContext
        });

        this._navigationContext = undefined;
    }

    public showModal(moduleName: string, context: any, closeCallback: Function) {
        var page = frameCommon.resolvePageFromEntry({ moduleName: moduleName });
        (<Page>page)._showNativeModalView(this, context, closeCallback);
    }

    protected _showNativeModalView(parent: Page, context: any, closeCallback: Function) {
        //
    }

    protected _hideNativeModalView(parent: Page) {
        //
    }

    protected _raiseShownModallyEvent(parent: Page, context: any, closeCallback: Function) {
        var that = this;
        var closeProxy = function () {
            that._hideNativeModalView(parent);
            closeCallback.apply(undefined, arguments);
        };

        this.notify({
            eventName: Page.shownModallyEvent,
            object: this,
            context: context,
            closeCallback: closeProxy
        });
    }

    public _getStyleScope(): styleScope.StyleScope {
        return this._styleScope;
    }

    public _invalidateOptionsMenu() {
        // 
    }

    private _applyCss() {
        if (this._cssApplied) {
            return;
        }

        this._styleScope.ensureSelectors();

        var scope = this._styleScope;
        var checkSelectors = (view: view.View): boolean => {
            scope.applySelectors(view);
            return true;
        }

        checkSelectors(this);
        view.eachDescendant(this, checkSelectors);

        this._cssApplied = true;
    }

    private _resetCssValues() {
        var resetCssValuesFunc = (view: view.View): boolean => {
            view.style._resetCssValues();
            return true;
        }

        resetCssValuesFunc(this);
        view.eachDescendant(this, resetCssValuesFunc);

    }

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === OPTIONS_MENU) {
            this.optionsMenu.setItems(value);
        }
    }
}

export class OptionsMenu implements dts.OptionsMenu {
    private _items: Array<MenuItem> = new Array<MenuItem>();
    private _page: Page;

    constructor(page: Page) {
        this._page = page;
    }

    public addItem(item: MenuItem): void {
        if (!item) {
            throw new Error("Cannot add empty item");
        }

        this._items.push(item);
        item.menu = this;
        item.bind({
            sourceProperty: "bindingContext",
            targetProperty: "bindingContext"
        }, this._page);

        this.invalidate();
    }

    public removeItem(item: MenuItem): void {
        if (!item) {
            throw new Error("Cannot remove empty item");
        }

        var itemIndex = this._items.indexOf(item);
        if (itemIndex < 0) {
            throw new Error("Cannot find item to remove");
        }

        item.menu = undefined;
        item.unbind("bindingContext");
        this._items.splice(itemIndex, 1);
        this.invalidate();
    }

    public getItems(): Array<MenuItem> {
        return this._items.slice();
    }

    public getItemAt(index: number): MenuItem {
        return this._items[index];
    }

    public setItems(items: Array<MenuItem>) {
        // Remove all existing items
        while (this._items.length > 0) {
            this.removeItem(this._items[this._items.length - 1]);
        }

        // Add new items
        for (var i = 0; i < items.length; i++) {
            this.addItem(items[i]);
        }

        this.invalidate();
    }

    invalidate() {
        if (this._page) {
            this._page._invalidateOptionsMenu();
        }
    }
}

export class MenuItem extends bindable.Bindable implements dts.MenuItem {
    public static tapEvent = "tap";

    public static textProperty = new dependencyObservable.Property(
        "text", "MenuItem", new dependencyObservable.PropertyMetadata("", null, MenuItem.onItemChanged));

    public static iconProperty = new dependencyObservable.Property(
        "icon", "MenuItem", new dependencyObservable.PropertyMetadata(null, null, MenuItem.onItemChanged));

    private static onItemChanged(data: dependencyObservable.PropertyChangeData) {
        var menuItem = <MenuItem>data.object;
        if (menuItem.menu) {
            menuItem.menu.invalidate();
        }
    }

    private _android: dts.AndroidMenuItemOptions;

    constructor() {
        super();
        if (global.android) {
            this._android = {
                position: enums.MenuItemPosition.actionBar
            };
        }
    }

    get android(): dts.AndroidMenuItemOptions {
        return this._android;
    }

    get text(): string {
        return this._getValue(MenuItem.textProperty);
    }
    set text(value: string) {
        this._setValue(MenuItem.textProperty, value);
    }

    get icon(): string {
        return this._getValue(MenuItem.iconProperty);
    }
    set icon(value: string) {
        this._setValue(MenuItem.iconProperty, value);
    }

    public _raiseTap() {
        this._emit(MenuItem.tapEvent);
    }

    menu: OptionsMenu;
}