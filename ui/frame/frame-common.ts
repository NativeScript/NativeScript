import frame = require("ui/frame");
import view = require("ui/core/view");
import pages = require("ui/pages");

enum NavigationType {
    New,
    Back,
    Forward
}

export class Frame extends view.View implements frame.Frame {
    private _backStack: Array<frame.PageNavigationEntry>;
    private _forwardStack: Array<frame.PageNavigationEntry>;
    private _currentEntry: frame.PageNavigationEntry;
    private _currentPage: pages.Page;
    private _navigationType: NavigationType;

    // TODO: Currently our navigation will not be synchronized in case users directly call native navigation methods like Activity.startActivity.

    constructor() {
        super();

        this._backStack = new Array<frame.PageNavigationEntry>();
        this._forwardStack = new Array<frame.PageNavigationEntry>();
        this._navigationType = NavigationType.New;
    }

    public canGoBack(): boolean {
        return this._backStack.length > 0;
    }

    public canGoForward(): boolean {
        return this._forwardStack.length > 0;
    }

    public goBack() {
        if (!this.canGoBack()) {
            // TODO: Do we need to throw an error?
            return;
        }

        var entry = this._backStack.pop();
        this._navigationType = NavigationType.Back;
        this.navigate(entry);
    }

    public goForward() {
        if (!this.canGoForward()) {
            // TODO: Do we need to throw an error?
            return;
        }

        var entry = this._forwardStack.pop();
        this._navigationType = NavigationType.Forward;
        this.navigate(entry);
    }

    public navigate(entry: frame.PageNavigationEntry) {
        if (this._currentPage) {
            this._backStack.push(this._currentEntry);
        }

        // perform the actual navigation, depending on the requested navigation type
        switch (this._navigationType) {
            case NavigationType.New:
                this.navigateCore(entry.context);
                break;
            case NavigationType.Back:
                this.goBackCore();
                if (this._currentPage) {
                    this._forwardStack.push(this._currentEntry);
                }
                break;
            case NavigationType.Forward:
                this.goForwardCore();
                if (this._currentPage) {
                    this._backStack.push(this._currentEntry);
                }
                break;
        }

        // TODO: We assume here that there is a Page object in the exports of the required module. This should be well documented.
        this._currentPage = require(entry.pageModuleName).Page;
        this._currentPage.frame = this;
        this._currentEntry = entry;

        // notify the page
        this._currentPage.onNavigatedTo(entry.context);

        // reset the navigation type back to new
        this._navigationType = NavigationType.New;
    }

    public goBackCore() {
    }

    public goForwardCore() {
    }

    public navigateCore(context: any) {
    }

    get backStack(): Array<frame.PageNavigationEntry> {
        return this._backStack;
    }

    get forwardStack(): Array<frame.PageNavigationEntry> {
        return this._forwardStack;
    }

    get currentPage(): pages.Page {
        return this._currentPage;
    }
}