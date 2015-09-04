import contentView = require("ui/content-view");
import view = require("ui/core/view");
import dts = require("ui/page");
import frame = require("ui/frame");
import styleModule = require("ui/styling/style");
import styleScope = require("ui/styling/style-scope");
import fs = require("file-system");
import frameCommon = require("ui/frame/frame-common");
import actionBar = require("ui/action-bar");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

var actionBarHiddenProperty = new dependencyObservable.Property(
    "actionBarHidden",
    "Page",
    new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsLayout)
    );

function onActionBarHiddenPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var page = <Page>data.object;
    if (page.isLoaded) {
        page._updateActionBar(data.newValue);
    }
}

(<proxy.PropertyMetadata>actionBarHiddenProperty.metadata).onSetNativeValue = onActionBarHiddenPropertyChanged;

export class Page extends contentView.ContentView implements dts.Page {
    public static actionBarHiddenProperty = actionBarHiddenProperty;
    public static navigatingToEvent = "navigatingTo";
    public static navigatedToEvent = "navigatedTo";
    public static navigatingFromEvent = "navigatingFrom";
    public static navigatedFromEvent = "navigatedFrom";
    public static shownModallyEvent = "shownModally";

    private _navigationContext: any;

    private _cssApplied: boolean;
    private _styleScope: styleScope.StyleScope = new styleScope.StyleScope();
    private _actionBar: actionBar.ActionBar;

    constructor(options?: dts.Options) {
        super(options);
        this.actionBar = new actionBar.ActionBar();
    }

    public onLoaded() {
        // The default style of the page should be white background
        this.style._setValue(styleModule.backgroundColorProperty, "white", dependencyObservable.ValueSource.Inherited);

        this._applyCss();
        
        if (this.actionBarHidden !== undefined) {
            this._updateActionBar(this.actionBarHidden);
        }

        super.onLoaded();
    }

    get actionBarHidden(): boolean {
        return this._getValue(Page.actionBarHiddenProperty);
    }

    set actionBarHidden(value: boolean) {
        this._setValue(Page.actionBarHiddenProperty, value);
    }

    public _updateActionBar(hidden: boolean) {
        //
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

    get actionBar(): actionBar.ActionBar {
        return this._actionBar;
    }
    set actionBar(value: actionBar.ActionBar) {
        if (!value) {
            throw new Error("ActionBar cannot be null or undefined.");
        }

        if (this._actionBar !== value) {
            if (this._actionBar) {
                this._actionBar.page = undefined;
                this._removeView(this._actionBar);
            }
            this._actionBar = value;
            this._actionBar.page = this;
            this._addView(this._actionBar);
        }
    }

    get page(): view.View {
        return this;
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

    private _cssFiles = {};
    public addCssFile(cssFileName: string) {
        if (cssFileName.indexOf("~/") === 0) {
            cssFileName = fs.path.join(fs.knownFolders.currentApp().path, cssFileName.replace("~/", ""));
        }
        if (!this._cssFiles[cssFileName]) {
            if (fs.File.exists(cssFileName)) {
                var file = fs.File.fromPath(cssFileName);
                var text = file.readTextSync();
                if (text) {
                    this._addCssInternal(text, cssFileName);
                    this._cssFiles[cssFileName] = true;
                }
            }
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

    public showModal(moduleName: string, context: any, closeCallback: Function, fullscreen?: boolean) {
        var page = frameCommon.resolvePageFromEntry({ moduleName: moduleName });
        (<Page>page)._showNativeModalView(this, context, closeCallback, fullscreen);
    }

    public _addChildFromBuilder(name: string, value: any) {
        if (value instanceof actionBar.ActionBar) {
            this.actionBar = value;
        }
        else {
            super._addChildFromBuilder(name, value);
        }
    }

    protected _showNativeModalView(parent: Page, context: any, closeCallback: Function, fullscreen?: boolean) {
        //
    }

    protected _hideNativeModalView(parent: Page) {
        //
    }

    protected _raiseShownModallyEvent(parent: Page, context: any, closeCallback: Function) {
        var that = this;
        var closeProxy = function () {
            that._hideNativeModalView(parent);
            if (closeCallback){
                closeCallback.apply(undefined, arguments);
            }
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

    public _eachChildView(callback: (child: view.View) => boolean) {
        super._eachChildView(callback);

        callback(this.actionBar);
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
}
