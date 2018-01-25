// Definitions.
import { Frame as FrameDefinition, NavigationEntry, BackstackEntry, NavigationTransition } from ".";
import { Page } from "../page";

// Types.
import { View, CustomLayoutView, isIOS, isAndroid, traceEnabled, traceWrite, traceCategories, EventData, Property } from "../core/view";
import { resolveFileName } from "../../file-system/file-name-resolver";
import { knownFolders, path } from "../../file-system";
import { parse, createViewFromEntry } from "../builder";
import { profile } from "../../profiling";

export * from "../core/view";

let frameStack: Array<FrameBase> = [];

function buildEntryFromArgs(arg: any): NavigationEntry {
    let entry: NavigationEntry;
    if (typeof arg === "string") {
        entry = {
            moduleName: arg
        };
    } else if (typeof arg === "function") {
        entry = {
            create: arg
        }
    } else {
        entry = arg;
    }

    return entry;
}

export interface NavigationContext {
    entry: BackstackEntry;
    isBackNavigation: boolean;
}

export class FrameBase extends CustomLayoutView implements FrameDefinition {
    public static androidOptionSelectedEvent = "optionSelected";

    private _animated: boolean;
    private _transition: NavigationTransition;
    private _backStack = new Array<BackstackEntry>();
    private _navigationQueue = new Array<NavigationContext>();

    public _currentEntry: BackstackEntry;
    public _executingEntry: BackstackEntry;
    public _isInFrameStack = false;
    public static defaultAnimatedNavigation = true;
    public static defaultTransition: NavigationTransition;

    // TODO: Currently our navigation will not be synchronized in case users directly call native navigation methods like Activity.startActivity.

    public _addChildFromBuilder(name: string, value: any) {
        throw new Error(`Frame should not have a view. Use 'defaultPage' property instead.`);
    }

    @profile
    public onLoaded() {
        super.onLoaded();
        this._processNextNavigationEntry();
    }

    public canGoBack(): boolean {
        let backstack = this._backStack.length;
        let previousForwardNotInBackstack = false;
        this._navigationQueue.forEach(item => {
            const entry = item.entry;
            if (item.isBackNavigation) {
                previousForwardNotInBackstack = false;
                if (!entry) {
                    backstack--;
                } else {
                    const backstackIndex = this._backStack.indexOf(entry);
                    if (backstackIndex !== -1) {
                        backstack = backstackIndex;
                    } else {
                        // NOTE: We don't search for entries in navigationQueue because there is no way for 
                        // developer to get reference to BackstackEntry unless transition is completed.
                        // At that point the entry is put in the backstack array.
                        // If we start to return Backstack entry from navigate method then
                        // here we should check also navigationQueue as well.
                        backstack--;
                    }
                }
            } else if (entry.entry.clearHistory) {
                previousForwardNotInBackstack = false;
                backstack = 0;
            } else {
                backstack++;
                if (previousForwardNotInBackstack) {
                    backstack--;
                }

                previousForwardNotInBackstack = entry.entry.backstackVisible === false;
            }
        });

        // this is our first navigation which is not completed yet.
        if (this._navigationQueue.length > 0 && !this._currentEntry) {
            backstack--;
        }

        return backstack > 0;
    }

    /**
     * Navigates to the previous entry (if any) in the back stack.
     * @param to The backstack entry to navigate back to.
     */
    public goBack(backstackEntry?: BackstackEntry): void {
        if (traceEnabled()) {
            traceWrite(`GO BACK`, traceCategories.Navigation);
        }

        if (!this.canGoBack()) {
            return;
        }

        if (backstackEntry) {
            const index = this._backStack.indexOf(backstackEntry);
            if (index < 0) {
                return;
            }
        }

        const navigationContext: NavigationContext = {
            entry: backstackEntry,
            isBackNavigation: true
        }

        this._navigationQueue.push(navigationContext);
        this._processNextNavigationEntry();
    }

    public _removeEntry(removed: BackstackEntry): void {
        const page = removed.resolvedPage;
        const frame = page.frame;
        page._frame = null;
        if (frame) {
            frame._removeView(page);
        } else {
            page._tearDownUI(true);
        }
    }

    // Attempts to implement https://github.com/NativeScript/NativeScript/issues/1311
    // private _subscribedToOrientationChangedEvent = false;
    // private _onOrientationChanged(){
    //     if (!this._currentEntry){
    //         return;
    //     }

    //     let currentPage = this._currentEntry.resolvedPage;
    //     let currentNavigationEntry = this._currentEntry.entry; 
    //     if (currentPage["isBiOrientational"] && currentNavigationEntry.moduleName) {
    //         if (this.canGoBack()){
    //             this.goBack();
    //         }
    //         else {
    //             currentNavigationEntry.backstackVisible = false;
    //         }
    //         // Re-navigate to the same page so the other (.port or .land) xml is loaded.
    //         this.navigate(currentNavigationEntry);                   
    //     }
    // }

    public navigate(param: any) {
        if (traceEnabled()) {
            traceWrite(`NAVIGATE`, traceCategories.Navigation);
        }

        const entry = buildEntryFromArgs(param);
        const page = createViewFromEntry(entry) as Page;

        // Attempts to implement https://github.com/NativeScript/NativeScript/issues/1311
        // if (page["isBiOrientational"] && entry.moduleName && !this._subscribedToOrientationChangedEvent){
        //     this._subscribedToOrientationChangedEvent = true;
        //     let app = require("application");
        //     if (trace.enabled) {
        //         trace.write(`${this} subscribed to orientationChangedEvent.`, trace.categories.Navigation);
        //     }
        //     app.on(app.orientationChangedEvent, (data) => this._onOrientationChanged());
        // }

        this._pushInFrameStack();

        const backstackEntry: BackstackEntry = {
            entry: entry,
            resolvedPage: page,
            navDepth: undefined,
            fragmentTag: undefined
        };

        const navigationContext: NavigationContext = {
            entry: backstackEntry,
            isBackNavigation: false
        }

        this._navigationQueue.push(navigationContext);
        this._processNextNavigationEntry();
    }

    public isCurrent(entry: BackstackEntry): boolean {
        return this._currentEntry === entry;
    }

    public setCurrent(entry: BackstackEntry, isBack: boolean): void {
        const newPage = entry.resolvedPage;
        // In case we navigated forward to a page that was in the backstack
        // with clearHistory: true
        if (!newPage.frame) {
            this._addView(newPage);
            newPage._frame = this;
        }

        this._currentEntry = entry;
        this._executingEntry = null;
        newPage.onNavigatedTo(isBack);
    }

    public _updateBackstack(entry: BackstackEntry, isBack: boolean): void {
        this.raiseCurrentPageNavigatedEvents(isBack);
        const current = this._currentEntry;

        if (isBack) {
            const index = this._backStack.indexOf(entry);
            this._backStack.splice(index + 1).forEach(e => this._removeEntry(e));
            this._backStack.pop();
        } else {
            if (entry.entry.clearHistory) {
                this._backStack.forEach(e => this._removeEntry(e));
                this._backStack.length = 0;
            } else if (FrameBase._isEntryBackstackVisible(current)) {
                this._backStack.push(current);
            }
        }

        if (current && this._backStack.indexOf(current) < 0) {
            this._removeEntry(current);
        }
    }

    private raiseCurrentPageNavigatedEvents(isBack: boolean) {
        const page = this.currentPage;
        if (page) {
            if (page.isLoaded) {
                // Forward navigation does not remove page from frame so we raise unloaded manually.
                page.callUnloaded();
            }

            page.onNavigatedFrom(isBack);
        }
    }

    public _processNavigationQueue(page: Page) {
        if (this._navigationQueue.length === 0) {
            // This could happen when showing recreated page after activity has been destroyed.
            return;
        }

        const entry = this._navigationQueue[0].entry;
        const currentNavigationPage = entry.resolvedPage;
        if (page !== currentNavigationPage) {
            // If the page is not the one that requested navigation - skip it.
            return;
        }

        // remove completed operation.
        this._navigationQueue.shift();
        this._processNextNavigationEntry();
        this._updateActionBar();
    }

    public _findEntryForTag(fragmentTag: string): BackstackEntry {
        let entry: BackstackEntry;
        if (this._currentEntry && this._currentEntry.fragmentTag === fragmentTag) {
            entry = this._currentEntry;
        } else {
            entry = this._backStack.find((value) => value.fragmentTag === fragmentTag);
            // on API 26 fragments are recreated lazily after activity is destroyed.
            if (!entry) {
                const navigationItem = this._navigationQueue.find((value) => value.entry.fragmentTag === fragmentTag);
                entry = navigationItem ? navigationItem.entry : undefined;
            }
        }

        return entry;
    }

    public navigationQueueIsEmpty(): boolean {
        return this._navigationQueue.length === 0;
    }

    public static _isEntryBackstackVisible(entry: BackstackEntry): boolean {
        if (!entry) {
            return false;
        }

        const backstackVisibleValue = entry.entry.backstackVisible;
        const backstackHidden = backstackVisibleValue !== undefined && !backstackVisibleValue;

        return !backstackHidden;
    }

    public _updateActionBar(page?: Page, disableNavBarAnimation?: boolean) {
        //traceWrite("calling _updateActionBar on Frame", traceCategories.Navigation);
    }

    protected _processNextNavigationEntry() {
        if (!this.isLoaded || this._executingEntry) {
            return;
        }

        if (this._navigationQueue.length > 0) {
            const navigationContext = this._navigationQueue[0];
            if (navigationContext.isBackNavigation) {
                this.performGoBack(navigationContext);
            } else {
                this.performNavigation(navigationContext);
            }
        }
    }

    @profile
    private performNavigation(navigationContext: NavigationContext) {
        const navContext = navigationContext.entry;
        this._executingEntry = navContext;
        this._onNavigatingTo(navContext, navigationContext.isBackNavigation);
        this._navigateCore(navContext);
    }

    @profile
    private performGoBack(navigationContext: NavigationContext) {
        let backstackEntry = navigationContext.entry;
        const backstack = this._backStack;
        if (!backstackEntry) {
            backstackEntry = backstack[backstack.length - 1];
            navigationContext.entry = backstackEntry;
        }

        this._executingEntry = backstackEntry;
        this._onNavigatingTo(backstackEntry, true);
        this._goBackCore(backstackEntry);
    }

    public _goBackCore(backstackEntry: BackstackEntry) {
        if (traceEnabled()) {
            traceWrite(`GO BACK CORE(${this._backstackEntryTrace(backstackEntry)}); currentPage: ${this.currentPage}`, traceCategories.Navigation);
        }
    }

    public _navigateCore(backstackEntry: BackstackEntry) {
        if (traceEnabled()) {
            traceWrite(`NAVIGATE CORE(${this._backstackEntryTrace(backstackEntry)}); currentPage: ${this.currentPage}`, traceCategories.Navigation);
        }
    }

    public _onNavigatingTo(backstackEntry: BackstackEntry, isBack: boolean) {
        if (this.currentPage) {
            this.currentPage.onNavigatingFrom(isBack);
        }

        backstackEntry.resolvedPage.onNavigatingTo(backstackEntry.entry.context, isBack, backstackEntry.entry.bindingContext);
    }

    public get animated(): boolean {
        return this._animated;
    }

    public set animated(value: boolean) {
        this._animated = value;
    }

    public get transition(): NavigationTransition {
        return this._transition;
    }

    public set transition(value: NavigationTransition) {
        this._transition = value;
    }

    get backStack(): Array<BackstackEntry> {
        return this._backStack.slice();
    }

    get currentPage(): Page {
        if (this._currentEntry) {
            return this._currentEntry.resolvedPage;
        }

        return null;
    }

    get currentEntry(): NavigationEntry {
        if (this._currentEntry) {
            return this._currentEntry.entry;
        }

        return null;
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

        const top = topmost();
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

    public eachChildView(callback: (child: View) => boolean) {
        const page = this.currentPage;
        if (page) {
            callback(page);
        }
    }

    public _getIsAnimatedNavigation(entry: NavigationEntry): boolean {
        if (entry && entry.animated !== undefined) {
            return entry.animated;
        }

        if (this.animated !== undefined) {
            return this.animated;
        }

        return FrameBase.defaultAnimatedNavigation;
    }

    public _getNavigationTransition(entry: NavigationEntry): NavigationTransition {
        if (entry) {
            if (isIOS && entry.transitioniOS !== undefined) {
                return entry.transitioniOS;
            }

            if (isAndroid && entry.transitionAndroid !== undefined) {
                return entry.transitionAndroid;
            }

            if (entry.transition !== undefined) {
                return entry.transition;
            }
        }

        if (this.transition !== undefined) {
            return this.transition;
        }

        return FrameBase.defaultTransition;
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

    public _printFrameBackStack() {
        const length = this.backStack.length;
        let i = length - 1;
        console.log(`Frame Back Stack: `);
        while (i >= 0) {
            let backstackEntry = <BackstackEntry>this.backStack[i--];
            console.log(`\t${backstackEntry.resolvedPage}`);
        }
    }

    public _backstackEntryTrace(b: BackstackEntry): string {
        let result = `${b.resolvedPage}`;

        const backstackVisible = FrameBase._isEntryBackstackVisible(b);
        if (!backstackVisible) {
            result += ` | INVISIBLE`;
        }

        if (b.entry.clearHistory) {
            result += ` | CLEAR HISTORY`;
        }

        const animated = this._getIsAnimatedNavigation(b.entry);
        if (!animated) {
            result += ` | NOT ANIMATED`;
        }

        const t = this._getNavigationTransition(b.entry);
        if (t) {
            result += ` | Transition[${JSON.stringify(t)}]`;
        }

        return result;
    }

    public _onLivesync(): boolean {
        super._onLivesync();

        const currentEntry = this._currentEntry.entry;
        const newEntry: NavigationEntry = {
            animated: false,
            clearHistory: true,
            context: currentEntry.context,
            create: currentEntry.create,
            moduleName: currentEntry.moduleName,
            backstackVisible: currentEntry.backstackVisible
        }

        // If create returns the same page instance we can't recreate it.
        // Instead of navigation set activity content.
        // This could happen if current page was set in XML as a Page instance.
        if (newEntry.create) {
            const page = newEntry.create();
            if (page === this.currentPage) {
                return false;
            }
        }

        this.navigate(newEntry);
        return true;
    }
}

export function topmost(): FrameBase {
    if (frameStack.length > 0) {
        return frameStack[frameStack.length - 1];
    }

    return undefined;
}

export function goBack(): boolean {
    const top = topmost();
    if (top && top.canGoBack()) {
        top.goBack();
        return true;
    }

    if (frameStack.length > 1) {
        top._popFromFrameStack();
    }

    return false;
}

export function stack(): Array<FrameBase> {
    return frameStack;
}

export const defaultPage = new Property<FrameBase, string>({
    name: "defaultPage", valueChanged: (frame: FrameBase, oldValue: string, newValue: string) => {
        frame.navigate({ moduleName: newValue });
    }
});

defaultPage.register(FrameBase)