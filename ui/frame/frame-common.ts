import * as definition from "ui/frame";
import {View, CustomLayoutView} from "ui/core/view";
import {Page} from "ui/page";
import {isString, isFunction, isDefined} from "utils/types";
import * as trace from "trace";
import {resolveFileName} from "file-system/file-name-resolver";
import * as fs from "file-system";
import * as builderModule from "ui/builder";
import * as platform from "platform";

var builder: typeof builderModule;
function ensureBuilder() {
    if (!builder) {
        builder = require("ui/builder");
    }
}

var frameStack: Array<Frame> = [];

function buildEntryFromArgs(arg: any): definition.NavigationEntry {
    var entry: definition.NavigationEntry;
    if (arg instanceof Page) {
        throw new Error("Navigating to a Page instance is no longer supported. Please navigate by using either a module name or a page factory function.");
    } else if (isString(arg)) {
        entry = {
            moduleName: arg
        };
    } else if (isFunction(arg)) {
        entry = {
            create: arg
        }
    } else {
        entry = arg;
    }

    return entry;
}

export function reloadPage(): void {
    let frame = topmost();
    if (frame) {
        let currentEntry = frame._currentEntry.entry;
        let newEntry: definition.NavigationEntry = {
            animated: false,
            clearHistory: true,
            context: currentEntry.context,
            create: currentEntry.create,
            moduleName: currentEntry.moduleName,
            backstackVisible: currentEntry.backstackVisible
        }

        frame.navigate(newEntry);
    }
}

export function resolvePageFromEntry(entry: definition.NavigationEntry): Page {
    var page: Page;

    if (entry.create) {
        page = entry.create();

        if (!(page && page instanceof Page)) {
            throw new Error("Failed to create Page with entry.create() function.");
        }
    }
    else if (entry.moduleName) {
        // Current app full path.
        var currentAppPath = fs.knownFolders.currentApp().path;
        //Full path of the module = current app full path + module name.
        var moduleNamePath = fs.path.join(currentAppPath, entry.moduleName);

        var moduleExports;
        if (global.moduleExists(entry.moduleName)) {
            trace.write("Loading pre-registered JS module: " + entry.moduleName, trace.categories.Navigation);
            moduleExports = global.loadModule(entry.moduleName);
        } else {
            var moduleExportsResolvedPath = resolveFileName(moduleNamePath, "js");
            if (moduleExportsResolvedPath) {
                trace.write("Loading JS file: " + moduleExportsResolvedPath, trace.categories.Navigation);

                // Exclude extension when doing require.
                moduleExportsResolvedPath = moduleExportsResolvedPath.substr(0, moduleExportsResolvedPath.length - 3)
                moduleExports = global.loadModule(moduleExportsResolvedPath);
            }
        }

        if (moduleExports && moduleExports.createPage) {
            trace.write("Calling createPage()", trace.categories.Navigation);
            page = moduleExports.createPage();
        }
        else {
            page = pageFromBuilder(moduleNamePath, moduleExports);
        }

        if (!(page && page instanceof Page)) {
            throw new Error("Failed to load Page from entry.moduleName: " + entry.moduleName);
        }

        // Possible CSS file path. Add it only if CSS not already specified and loaded from cssFile Page attribute in XML.
        var cssFileName = resolveFileName(moduleNamePath, "css");
        if (cssFileName && !page["cssFile"]) {
            page.addCssFile(cssFileName);
        }
    }

    return page;
}

function pageFromBuilder(moduleNamePath: string, moduleExports: any): Page {
    var page: Page;
    var element: View;

    // Possible XML file path.
    var fileName = resolveFileName(moduleNamePath, "xml");
    if (fileName) {
        trace.write("Loading XML file: " + fileName, trace.categories.Navigation);

        ensureBuilder();

        // Or check if the file exists in the app modules and load the page from XML.
        element = builder.load(fileName, moduleExports);
        if (element instanceof Page) {
            page = <Page>element;
        }
    }

    return page;
}

export interface NavigationContext {
    entry: definition.BackstackEntry;
    isBackNavigation: boolean;
}

export class Frame extends CustomLayoutView implements definition.Frame {
    public static androidOptionSelectedEvent = "optionSelected";

    private _navigationQueue: Array<NavigationContext>;
    private _backStack: Array<definition.BackstackEntry>;
    public _currentEntry: definition.BackstackEntry;
    private _animated: boolean;
    private _transition: definition.NavigationTransition;

    public _isInFrameStack = false;
    public static defaultAnimatedNavigation = true;
    public static defaultTransition: definition.NavigationTransition;

    // TODO: Currently our navigation will not be synchronized in case users directly call native navigation methods like Activity.startActivity.

    constructor() {
        super();

        this._backStack = new Array<definition.BackstackEntry>();
        this._navigationQueue = new Array<NavigationContext>();
    }

    public canGoBack(): boolean {
        return this._backStack.length > 0;
    }

    /**
     * Navigates to the previous entry (if any) in the back stack.
     * @param to The backstack entry to navigate back to.
     */
    public goBack(backstackEntry?: definition.BackstackEntry) {
        trace.write(`GO BACK`, trace.categories.Navigation);
        if (!this.canGoBack()) {
            // TODO: Do we need to throw an error?
            return;
        }

        if (!backstackEntry) {
            backstackEntry = this._backStack.pop();
        } else {
            let backIndex = this._backStack.indexOf(backstackEntry);
            if (backIndex < 0) {
                return;
            }
            this._backStack.splice(backIndex);
        }

        var navigationContext: NavigationContext = {
            entry: backstackEntry,
            isBackNavigation: true
        }

        this._navigationQueue.push(navigationContext);

        if (this._navigationQueue.length === 1) {
            this._processNavigationContext(navigationContext);
        }
        else {
            trace.write(`Going back scheduled`, trace.categories.Navigation);
        }
    }

    public navigate(param: any) {
        trace.write(`NAVIGATE`, trace.categories.Navigation);

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
            trace.write(`Navigation scheduled`, trace.categories.Navigation);
        }
    }

    public _processNavigationQueue(page: Page) {
        if (this._navigationQueue.length === 0) {
            // This could happen when showing recreated page after activity has been destroyed.
            return;
        }

        var entry = this._navigationQueue[0].entry;
        var currentNavigationPage = entry.resolvedPage;
        if (page !== currentNavigationPage) {
            throw new Error(`Corrupted navigation stack; page: ${page.id}; currentNavigationPage: ${currentNavigationPage.id}`);
        }

        // remove completed operation.
        this._navigationQueue.shift();

        if (this._navigationQueue.length > 0) {
            var navigationContext = this._navigationQueue[0];
            this._processNavigationContext(navigationContext);
        }

        this._updateActionBar();
    }

    public navigationQueueIsEmpty() {
        return this._navigationQueue.length === 0;
    }

    public _isEntryBackstackVisible(entry: definition.BackstackEntry): boolean {
        if (!entry) {
            return false;
        }

        var backstackVisibleValue = entry.entry.backstackVisible;
        var backstackHidden = isDefined(backstackVisibleValue) && !backstackVisibleValue;

        return !backstackHidden;
    }

    public _updateActionBar(page?: Page) {
        //trace.write("calling _updateActionBar on Frame", trace.categories.Navigation);
    }

    protected _processNavigationContext(navigationContext: NavigationContext) {
        if (navigationContext.isBackNavigation) {
            this.performGoBack(navigationContext);
        }
        else {
            this.performNavigation(navigationContext);
        }
    }

    private performNavigation(navigationContext: NavigationContext) {
        var navContext = navigationContext.entry;
        this._onNavigatingTo(navContext, navigationContext.isBackNavigation);

        // TODO: This should happen once navigation is completed.
        if (navigationContext.entry.entry.clearHistory) {
            this._backStack.length = 0;
        }
        else if (this._isEntryBackstackVisible(this._currentEntry)) {
            this._backStack.push(this._currentEntry);
        }

        this._navigateCore(navContext);
        this._onNavigatedTo(navContext, false);
    }

    private performGoBack(navigationContext: NavigationContext) {
        var navContext = navigationContext.entry;
        this._onNavigatingTo(navContext, navigationContext.isBackNavigation);
        this._goBackCore(navContext);
        this._onNavigatedTo(navContext, true);
    }

    public _goBackCore(backstackEntry: definition.BackstackEntry) {
        //
    }

    public _navigateCore(backstackEntry: definition.BackstackEntry) {
        //
    }

    public _onNavigatingTo(backstackEntry: definition.BackstackEntry, isBack: boolean) {
        if (this.currentPage) {
            this.currentPage.onNavigatingFrom(isBack);
        }

        backstackEntry.resolvedPage.onNavigatingTo(backstackEntry.entry.context, isBack);
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

    public get transition(): definition.NavigationTransition {
        return this._transition;
    }

    public set transition(value: definition.NavigationTransition) {
        this._transition = value;
    }

    get backStack(): Array<definition.BackstackEntry> {
        return this._backStack.slice();
    }

    get currentPage(): Page {
        if (this._currentEntry) {
            return this._currentEntry.resolvedPage;
        }

        return null;
    }

    get currentEntry(): definition.NavigationEntry {
        return this._currentEntry.entry;
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

    public _eachChildView(callback: (child: View) => boolean) {
        if (this.currentPage) {
            callback(this.currentPage);
        }
    }

    public _getIsAnimatedNavigation(entry: definition.NavigationEntry): boolean {
        if (entry && isDefined(entry.animated)) {
            return entry.animated;
        }

        if (isDefined(this.animated)) {
            return this.animated;
        }

        return Frame.defaultAnimatedNavigation;
    }

    public _getNavigationTransition(entry: definition.NavigationEntry): definition.NavigationTransition {
        if (entry) {
            if (platform.device.os === platform.platformNames.ios && isDefined(entry.transitioniOS)) {
                return entry.transitioniOS;
            }

            if (platform.device.os === platform.platformNames.android && isDefined(entry.transitionAndroid)) {
                return entry.transitionAndroid;
            }

            if (entry && isDefined(entry.transition)) {
                return entry.transition;
            }
        }

        if (isDefined(this.transition)) {
            return this.transition;
        }

        return Frame.defaultTransition;
    }

    public get navigationBarHeight(): number {
        return 0;
    }

    public _getNavBarVisible(page: Page): boolean {
        throw new Error();
    }

    // We don't need to put Page as visual child. Don't call super.
    public _addViewToNativeVisualTree(child: View): boolean {
        return true;
    }

    // We don't need to put Page as visual child. Don't call super.
    public _removeViewFromNativeVisualTree(child: View): void {
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
