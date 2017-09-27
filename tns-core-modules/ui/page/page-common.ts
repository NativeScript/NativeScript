import { Page as PageDefinition, NavigatedData, ShownModallyData } from ".";
import {
    ContentView, View, eachDescendant, Property, CssProperty, Color, isIOS,
    booleanConverter, resetCSSProperties, Style, EventData
} from "../content-view";
import { Frame, topmost as topmostFrame, resolvePageFromEntry } from "../frame";
import { ActionBar } from "../action-bar";
import { KeyframeAnimationInfo } from "../animation/keyframe-animation";
import { StyleScope } from "../styling/style-scope";
import { File, path, knownFolders } from "../../file-system";
import { profile } from "../../profiling";

export * from "../content-view";

export class PageBase extends ContentView implements PageDefinition {

    public static navigatingToEvent = "navigatingTo";
    public static navigatedToEvent = "navigatedTo";
    public static navigatingFromEvent = "navigatingFrom";
    public static navigatedFromEvent = "navigatedFrom";
    public static shownModallyEvent = "shownModally";
    public static showingModallyEvent = "showingModally";

    protected _closeModalCallback: Function;

    private _modalContext: any;
    private _navigationContext: any;

    private _actionBar: ActionBar;

    public _modal: PageBase;
    public _fragmentTag: string;
    public _frame: Frame;
    
    public actionBarHidden: boolean;
    public enableSwipeBackNavigation: boolean;
    public backgroundSpanUnderStatusBar: boolean;

    constructor() {
        super();
        this._styleScope = new StyleScope();
    }

    get navigationContext(): any {
        return this._navigationContext;
    }

    get css(): string {
        return this._styleScope.css;
    }
    set css(value: string) {
        this._styleScope.css = value;
        this._onCssStateChange();
    }

    get actionBar(): ActionBar {
        if (!this._actionBar) {
            this._actionBar = new ActionBar();
            this._addView(this._actionBar);
        }
        return this._actionBar;
    }
    set actionBar(value: ActionBar) {
        if (!value) {
            throw new Error("ActionBar cannot be null or undefined.");
        }

        if (this._actionBar !== value) {
            if (this._actionBar) {
                this._removeView(this._actionBar);
            }
            this._actionBar = value;
            this._addView(this._actionBar);
        }
    }

    get statusBarStyle(): "light" | "dark" {
        return this.style.statusBarStyle;
    }
    set statusBarStyle(value: "light" | "dark") {
        this.style.statusBarStyle = value;
    }

    public get androidStatusBarBackground(): Color {
        return this.style.androidStatusBarBackground;
    }
    public set androidStatusBarBackground(value: Color) {
        this.style.androidStatusBarBackground = value;
    }

    get page(): PageDefinition {
        return this;
    }

    public addCss(cssString: string): void {
        this._styleScope.addCss(cssString);
        this._onCssStateChange();
    }

    public addCssFile(cssFileName: string) {
        this._styleScope.addCssFile(cssFileName);
        this._onCssStateChange();
    }

    public getKeyframeAnimationWithName(animationName: string): KeyframeAnimationInfo {
        return this._styleScope.getKeyframeAnimationWithName(animationName);
    }

    get frame(): Frame {
        const frame = this.parent;
        return frame instanceof Frame ? frame : undefined;
    }

    private createNavigatedData(eventName: string, isBackNavigation: boolean): NavigatedData {
        return {
            eventName: eventName,
            object: this,
            context: this.navigationContext,
            isBackNavigation: isBackNavigation
        };
    }

    @profile
    public onNavigatingTo(context: any, isBackNavigation: boolean, bindingContext?: any) {
        this._navigationContext = context;

        //https://github.com/NativeScript/NativeScript/issues/731
        if (!isBackNavigation && bindingContext !== undefined && bindingContext !== null) {
            this.bindingContext = bindingContext;
        }
        this.notify(this.createNavigatedData(PageBase.navigatingToEvent, isBackNavigation));
    }

    @profile
    public onNavigatedTo(isBackNavigation: boolean) {
        this.notify(this.createNavigatedData(PageBase.navigatedToEvent, isBackNavigation));
    }

    @profile
    public onNavigatingFrom(isBackNavigation: boolean) {
        this.notify(this.createNavigatedData(PageBase.navigatingFromEvent, isBackNavigation));
    }

    @profile
    public onNavigatedFrom(isBackNavigation: boolean) {
        this.notify(this.createNavigatedData(PageBase.navigatedFromEvent, isBackNavigation));

        this._navigationContext = undefined;
    }

    public showModal(): PageBase {
        if (arguments.length === 0) {
            this._showNativeModalView(<any>topmostFrame().currentPage, undefined, undefined, true);
            return this;
        } else {
            const context: any = arguments[1];
            const closeCallback: Function = arguments[2];
            const fullscreen: boolean = arguments[3];

            let page: PageBase;
            if (arguments[0] instanceof PageBase) {
                page = arguments[0];
            } else {
                page = <PageBase>resolvePageFromEntry({ moduleName: arguments[0] });
            }

            page._showNativeModalView(this, context, closeCallback, fullscreen);
            return page;
        }
    }

    public closeModal() {
        if (this._closeModalCallback) {
            this._closeModalCallback.apply(undefined, arguments);
        }
    }

    public get modal(): PageBase {
        return this._modal;
    }

    public _addChildFromBuilder(name: string, value: any) {
        if (value instanceof ActionBar) {
            this.actionBar = value;
        } else {
            super._addChildFromBuilder(name, value);
        }
    }

    protected _showNativeModalView(parent: PageBase, context: any, closeCallback: Function, fullscreen?: boolean) {
        parent._modal = this;
        const that = this;
        this._modalContext = context;
        this._closeModalCallback = function () {
            if (that._closeModalCallback) {
                that._closeModalCallback = null;
                that._modalContext = null;
                that._hideNativeModalView(parent);
                if (typeof closeCallback === "function") {
                    closeCallback.apply(undefined, arguments);
                }
            }
        };
    }

    protected _hideNativeModalView(parent: PageBase) {
        //
    }

    public _raiseShownModallyEvent() {
        const args: ShownModallyData = {
            eventName: PageBase.shownModallyEvent,
            object: this,
            context: this._modalContext,
            closeCallback: this._closeModalCallback
        };
        this.notify(args);
    }

    protected _raiseShowingModallyEvent() {
        const args: ShownModallyData = {
            eventName: PageBase.showingModallyEvent,
            object: this,
            context: this._modalContext,
            closeCallback: this._closeModalCallback
        }
        this.notify(args);
    }

    public eachChildView(callback: (child: View) => boolean) {
        super.eachChildView(callback);
        callback(this.actionBar);
    }

    get _childrenCount(): number {
        return (this.content ? 1 : 0) + (this._actionBar ? 1 : 0);
    }

    _inheritStyleScope(styleScope: StyleScope): void {
        // The Page have its own scope.
    }
}

PageBase.prototype.recycleNativeView = "never";

export interface PageBase {
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void;
    on(event: "navigatingTo", callback: (args: NavigatedData) => void, thisArg?: any): void;
    on(event: "navigatedTo", callback: (args: NavigatedData) => void, thisArg?: any): void;
    on(event: "navigatingFrom", callback: (args: NavigatedData) => void, thisArg?: any): void;
    on(event: "navigatedFrom", callback: (args: NavigatedData) => void, thisArg?: any): void;
    on(event: "showingModally", callback: (args: ShownModallyData) => void, thisArg?: any): void;
    on(event: "shownModally", callback: (args: ShownModallyData) => void, thisArg?: any);
}

/**
 * Dependency property used to hide the Navigation Bar in iOS and the Action Bar in Android.
 */
export const actionBarHiddenProperty = new Property<PageBase, boolean>({ name: "actionBarHidden", affectsLayout: isIOS, valueConverter: booleanConverter });
actionBarHiddenProperty.register(PageBase);

/**
 * Dependency property that specify if page background should span under status bar.
 */
export const backgroundSpanUnderStatusBarProperty = new Property<PageBase, boolean>({ name: "backgroundSpanUnderStatusBar", defaultValue: false, affectsLayout: isIOS, valueConverter: booleanConverter });
backgroundSpanUnderStatusBarProperty.register(PageBase);

/**
 * Dependency property used to control if swipe back navigation in iOS is enabled.
 * This property is iOS specific. Default value: true
 */
export const enableSwipeBackNavigationProperty = new Property<PageBase, boolean>({ name: "enableSwipeBackNavigation", defaultValue: true, valueConverter: booleanConverter });
enableSwipeBackNavigationProperty.register(PageBase);

/**
 * Property backing statusBarStyle.
 */
export const statusBarStyleProperty = new CssProperty<Style, "light" | "dark">({ name: "statusBarStyle", cssName: "status-bar-style" });
statusBarStyleProperty.register(Style);

/**
 * Property backing androidStatusBarBackground.
 */
export const androidStatusBarBackgroundProperty = new CssProperty<Style, Color>({
    name: "androidStatusBarBackground", cssName: "android-status-bar-background",
    equalityComparer: Color.equals, valueConverter: (v) => new Color(v)
});
androidStatusBarBackgroundProperty.register(Style);