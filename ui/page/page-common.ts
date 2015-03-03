import contentView = require("ui/content-view");
import view = require("ui/core/view");
import dts = require("ui/page");
import frame = require("ui/frame");
import styleScope = require("ui/styling/style-scope");
import fs = require("file-system");
import fileSystemAccess = require("file-system/file-system-access");
import trace = require("trace");
import observable = require("data/observable");

var OPTIONS_MENU = "optionsMenu";

export module knownEvents {
    export var navigatedTo = "navigatedTo";
    export var tap = "tap";
}

export module knownCollections {
    export var optionsMenu = "optionsMenu";
}

export class Page extends contentView.ContentView implements dts.Page, view.AddArrayFromBuilder {
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
    }

    public onNavigatedTo(context: any) {
        this._navigationContext = context;
        this.notify({
            eventName: knownEvents.navigatedTo,
            object: this,
            context: context
        });
    }

    public onNavigatingFrom() {
        //
    }

    public onNavigatedFrom(isBackNavigation: boolean) {
        // TODO: Should we clear navigation context here or somewhere else
        this._navigationContext = undefined;
    }

    public _getStyleScope(): styleScope.StyleScope {
        return this._styleScope;
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
        this._items = items;
        this.invalidate();
    }

    private invalidate() {
        if (this._page.frame) {
            this._page.frame._invalidateOptionsMenu();
        }
    }
}

export class MenuItem extends observable.Observable implements dts.MenuItem {
    public text: string = "";
    public icon: string;
    public priority: number = 0;

    public _raiseTap() {
        this._emit(knownEvents.tap);
    }
}