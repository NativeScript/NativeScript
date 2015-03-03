import contentView = require("ui/content-view");
import view = require("ui/core/view");
import dts = require("ui/page");
import frame = require("ui/frame");
import styleScope = require("ui/styling/style-scope");
import fs = require("file-system");
import fileSystemAccess = require("file-system/file-system-access");
import trace = require("trace");

export module knownEvents {
    export var navigatedTo = "navigatedTo";
}

export class Page extends contentView.ContentView implements dts.Page {
    private _navigationContext: any;

    private _cssApplied: boolean;
    private _styleScope: styleScope.StyleScope = new styleScope.StyleScope();

    constructor(options?: dts.Options) {
        super(options);
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
        this._styleScope.addCss(cssString);
        this._refreshCss();
    }

    public addCssFile(cssFileName: string) {
        var cssString;
        var realCssFileName = fs.path.join(fs.knownFolders.currentApp().path, cssFileName);
        if (fs.File.exists(realCssFileName)) {
            new fileSystemAccess.FileSystemAccess().readText(realCssFileName, r => { cssString = r; });
            this.addCss(cssString);
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

        try {
            this._styleScope.ensureSelectors();

            var scope = this._styleScope;
            var checkSelectors = (view: view.View): boolean => {
                scope.applySelectors(view);
                return true;
            }

            checkSelectors(this);
            view.eachDescendant(this, checkSelectors);

            this._cssApplied = true;
        } catch (e) {
            trace.write("Css styling failed: " + e, trace.categories.Style);
        }
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