import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import enums = require("ui/enums");
import definition = require("ui/scroll-view");
import contentView = require("ui/content-view");

function isValidOrientation(value: any): boolean {
    return value === enums.Orientation.vertical || value === enums.Orientation.horizontal;
}

export var orientationProperty = new dependencyObservable.Property(
    "orientation",
    "ScrollView",
    new proxy.PropertyMetadata(enums.Orientation.vertical,
        dependencyObservable.PropertyMetadataSettings.AffectsLayout,
        undefined,
        isValidOrientation)
);

export class ScrollView extends contentView.ContentView implements definition.ScrollView {
    private _scrollEventAttached: boolean;
    public static scrollEvent = "scroll";

    get orientation(): string {
        return this._getValue(orientationProperty);
    }
    set orientation(value: string) {
        this._setValue(orientationProperty, value);
    }

    public addEventListener(arg: string, callback: any, thisArg?: any) {
        super.addEventListener(arg, callback, thisArg);

        if (arg === definition.ScrollView.scrollEvent) {
            this.attach();
        }
    }

    public removeEventListener(arg: string, callback: any, thisArg?: any) {
        super.addEventListener(arg, callback, thisArg);

        if (arg === definition.ScrollView.scrollEvent) {
            this.dettach();
        }
    }

    public onLoaded() {
        super.onLoaded();

        this.attach();
    }

    public onUnloaded() {
        super.onUnloaded();

        this.dettach();
    }

    private attach() {
        if (!this._scrollEventAttached && this.isLoaded) {
            this._scrollEventAttached = true;

            this.attachNative();
        }
    }

    private dettach() {
        if (this._scrollEventAttached && this.isLoaded) {
            this._scrollEventAttached = false;

            this.dettachNative();
        }
    }

    protected attachNative() {
       //
    }

    protected dettachNative() {
        //
    }

    get horizontalOffset(): number {
        return 0;
    }

    get verticalOffset(): number {
        return 0;
    }

    get scrollableWidth(): number {
        return 0;
    }

    get scrollableHeight(): number {
        return 0;
    }

    public scrollToVerticalOffset(value: number, animated: boolean) {
        //
    }

    public scrollToHorizontalOffset(value: number, animated: boolean) {
        //
    }
}