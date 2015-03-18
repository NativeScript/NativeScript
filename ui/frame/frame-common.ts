import definition = require("ui/frame");
import view = require("ui/core/view");
import pages = require("ui/page");
import types = require("utils/types");
import trace = require("trace");
import builder = require("ui/builder");
import fs = require("file-system");
import utils = require("utils/utils");
import platform = require("platform");
import fileResolverModule = require("file-system/file-name-resolver");

var frameStack: Array<Frame> = [];

function buildEntryFromArgs(arg: any): definition.NavigationEntry {
    var entry: definition.NavigationEntry;
    if (arg instanceof pages.Page) {
        throw new Error("Navigating to a Page instance is no longer supported. Please navigate by using either a module name or a page factory function.");
    } else if (types.isString(arg)) {
        entry = {
            moduleName: arg
        };
    } else if (types.isFunction(arg)) {
        entry = {
            create: arg
        }
    } else {
        entry = arg;
    }

    return entry;
}

function resolvePageFromEntry(entry: definition.NavigationEntry): pages.Page {
    var page: pages.Page;

    if (entry.create) {
        page = entry.create();

        if (!(page && page instanceof pages.Page)) {
            throw new Error("Failed to create Page with entry.create() function.");
        }
    }
    else if (entry.moduleName) {
        // Current app full path.
        var currentAppPath = fs.knownFolders.currentApp().path;
        //Full path of the module = current app full path + module name.
        var moduleNamePath = fs.path.join(currentAppPath, entry.moduleName);

        var moduleExports;

        if (fs.File.exists(moduleNamePath + ".js")) {
            trace.write("Loading JS file: " + moduleNamePath + ".js", trace.categories.Navigation);
            moduleExports = require(moduleNamePath);
        }

        if (moduleExports && moduleExports.createPage) {
            trace.write("Calling createPage()", trace.categories.Navigation);
            page = moduleExports.createPage();
        }
        else {
            page = pageFromBuilder(moduleNamePath, entry.moduleName, moduleExports);
        }

        if (!(page && page instanceof pages.Page)) {
            throw new Error("Failed to load Page from entry.moduleName: " + entry.moduleName);
        }
    }

    return page;
}

var fileNameResolver: fileResolverModule.FileNameResolver;
function resolveFilePath(path, ext) {
    if (!fileNameResolver) {
        fileNameResolver = new fileResolverModule.FileNameResolver({
            width: platform.screen.mainScreen.widthDIPs,
            height: platform.screen.mainScreen.heightDIPs,
            os: platform.device.os,
            deviceType: platform.device.deviceType
        });
    }
    return fileNameResolver.resolveFileName(path, ext);
}

function pageFromBuilder(moduleNamePath: string, moduleName: string, moduleExports: any): pages.Page {
    var page: pages.Page;
    var element: view.View;

    // Possible XML file path.
    var fileName = resolveFilePath(moduleNamePath, "xml");
    if (fileName) {
        trace.write("Loading XML file: " + fileName, trace.categories.Navigation);

        // Or check if the file exists in the app modules and load the page from XML.
        element = builder.load(fileName, moduleExports);
        if (element instanceof pages.Page) {
            page = <pages.Page>element;

            // Possible CSS file path.
            var cssFileName = resolveFilePath(moduleName, "css");
            if (cssFileName) {
                page.addCssFile(cssFileName);
            }
        }
    }

    return page;
}

export module knownEvents {
    export module android {
        export var optionSelected = "optionSelected";
    }
}

interface NavigationContext {
    entry: definition.BackstackEntry;
    isBackNavigation: boolean;
}

export class Frame extends view.CustomLayoutView implements definition.Frame {
    private _navigationQueue: Array<NavigationContext>;
    private _backStack: Array<definition.BackstackEntry>;
    public _currentEntry: definition.BackstackEntry;
    private _animated: boolean;

    public _isInFrameStack = false;
    public static defaultAnimatedNavigation = true;

    // TODO: Currently our navigation will not be synchronized in case users directly call native navigation methods like Activity.startActivity.

    constructor() {
        super();

        this._backStack = new Array<definition.BackstackEntry>();
        this._navigationQueue = new Array<NavigationContext>();
    }

    public canGoBack(): boolean {
        return this._backStack.length > 0;
    }

    public goBack() {
        trace.write(this._getTraceId() + ".goBack();", trace.categories.Navigation);
        if (!this.canGoBack()) {
            // TODO: Do we need to throw an error?
            return;
        }

        var backstackEntry = this._backStack.pop();
        var navigationContext: NavigationContext = {
            entry: backstackEntry,
            isBackNavigation: true
        }

        this._navigationQueue.push(navigationContext);

        if (this._navigationQueue.length === 1) {
            this._processNavigationContext(navigationContext);
        }
        else {
            trace.write(this._getTraceId() + ".goBack scheduled;", trace.categories.Navigation);
        }
    }

    public navigate(param: any) {
        trace.write(this._getTraceId() + ".navigate();", trace.categories.Navigation);

        var entry = buildEntryFromArgs(param);
        var page = resolvePageFromEntry(entry);

        this._pushInFrameStack();

        var backstackEntry: definition.BackstackEntry = {
            entry: entry,
            resolvedPage: page,
        };

        var navigationContext: NavigationContext = {
            entry: backstackEntry,
            isBackNavigation: false
        }

        this._navigationQueue.push(navigationContext);

        if (this._navigationQueue.length === 1) {
            this._processNavigationContext(navigationContext);
        }
        else {
            trace.write(this._getTraceId() + ".navigation scheduled;", trace.categories.Navigation);
        }
    }

    public _processNavigationQueue(page: pages.Page) {
        if (this._navigationQueue.length === 0) {
            // This could happen when showing recreated page after activity has been destroyed.
            return;
        }

        var entry = this._navigationQueue[0].entry;
        var currentNavigationPage = entry.resolvedPage;
        if (page !== currentNavigationPage) {
            throw new Error("Corrupted navigation stack.");
        }

        // remove completed operation.
        this._navigationQueue.shift();

        if (this._navigationQueue.length > 0) {
            var navigationContext = this._navigationQueue[0];
            this._processNavigationContext(navigationContext);
        }
    }

    private _processNavigationContext(navigationContext: NavigationContext) {
        if (navigationContext.isBackNavigation) {
            this.performGoBack(navigationContext);
        }
        else {
            this.performNavigation(navigationContext);
        }
    }

    private performNavigation(navigationContext: NavigationContext) {
        var navContext = navigationContext.entry;
        this._onNavigatingTo(navContext);

        if (this.currentPage) {
            this._backStack.push(this._currentEntry);
        }

        this._navigateCore(navContext);
        this._onNavigatedTo(navContext, false);
    }

    private performGoBack(navigationContext: NavigationContext) {
        var navContext = navigationContext.entry;
        this._onNavigatingTo(navContext);
        this._goBackCore(navContext);
        this._onNavigatedTo(navContext, true);
    }

    public _goBackCore(backstackEntry: definition.BackstackEntry) {
        //
    }

    public _navigateCore(backstackEntry: definition.BackstackEntry) {
        //
    }

    public _onNavigatingTo(backstackEntry: definition.BackstackEntry) {
        if (this.currentPage) {
            this.currentPage.onNavigatingFrom();
        }

        backstackEntry.resolvedPage.onNavigatingTo(backstackEntry.entry.context);
    }

    public _onNavigatedTo(backstackEntry: definition.BackstackEntry, isBack: boolean) {
        if (this.currentPage) {
            this.currentPage.onNavigatedFrom(isBack);
        }
    }

    public get animated(): boolean {
        return this._animated;
    }
    public set animated(value: boolean) {
        this._animated = value;
    }

    get backStack(): Array<definition.BackstackEntry> {
        return this._backStack;
    }

    get currentPage(): pages.Page {
        if (this._currentEntry) {
            return this._currentEntry.resolvedPage;
        }

        return null;
    }

    get currentEntry(): definition.BackstackEntry {
        return this._currentEntry;
    }

    public _pushInFrameStack() {
        if (this._isInFrameStack) {
            return;
        }

        frameStack.push(this);
        this._isInFrameStack = true;
    }

    public _popFromFrameStack() {
        if (!this._isInFrameStack) {
            return;
        }

        var top = _topmost();
        if (top !== this) {
            throw new Error("Cannot pop a Frame which is not at the top of the navigation stack.");
        }

        frameStack.pop();
        this._isInFrameStack = false;
    }

    get _childrenCount(): number {
        if (this.currentPage) {
            return 1;
        }

        return 0;
    }

    public _eachChildView(callback: (child: view.View) => boolean) {
        if (this.currentPage) {
            callback(this.currentPage);
        }
    }

    public _getIsAnimatedNavigation(entry: definition.NavigationEntry) {
        if (entry && types.isDefined(entry.animated)) {
            return entry.animated;
        }

        if (types.isDefined(this.animated)) {
            return this.animated;
        }

        return Frame.defaultAnimatedNavigation;
    }

    private _getTraceId(): string {
        return "Frame<" + this._domId + ">";
    }

    protected get navigationBarHeight(): number {
        return 0;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var result = view.View.measureChild(this, this.currentPage, widthMeasureSpec, utils.layout.makeMeasureSpec(height - this.navigationBarHeight, heightMode));

        var widthAndState = view.View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
        var heightAndState = view.View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        view.View.layoutChild(this, this.currentPage, 0, this.navigationBarHeight, right - left, bottom - top);
    }

    // We don't need to put Page as visual child. Don't call super.
    public _addViewToNativeVisualTree(child: view.View): boolean {
        return true;
    }

    // We don't need to put Page as visual child. Don't call super.
    public _removeViewFromNativeVisualTree(child: view.View): void {
        child._isAddedToNativeVisualTree = false;
    }
}

var _topmost = function (): Frame {
    if (frameStack.length > 0) {
        return frameStack[frameStack.length - 1];
    }

    return undefined;
}

export var topmost = _topmost;

export function goBack(): boolean {
    var top = _topmost();
    if (top.canGoBack()) {
        top.goBack();
        return true;
    }

    if (frameStack.length > 1) {
        top._popFromFrameStack();
    }

    return false;
}

export function stack(): Array<definition.Frame> {
    return frameStack;
}
