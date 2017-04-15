import { ScrollView as ScrollViewDefinition, Orientation } from ".";
import { ContentView, Property, makeParser, makeValidator } from "../content-view";

export * from "../content-view";

export abstract class ScrollViewBase extends ContentView implements ScrollViewDefinition {
    private _scrollChangeCount: number = 0;
    public static scrollEvent = "scroll";

    public orientation: Orientation;

    public addEventListener(arg: string, callback: any, thisArg?: any) {
        super.addEventListener(arg, callback, thisArg);

        if (arg === ScrollViewBase.scrollEvent) {
            this._scrollChangeCount++;
            this.attach();
        }
    }

    public removeEventListener(arg: string, callback: any, thisArg?: any) {
        super.addEventListener(arg, callback, thisArg);

        if (arg === ScrollViewBase.scrollEvent) {
            this._scrollChangeCount--;
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
        if (this._scrollChangeCount > 0 && this.isLoaded) {
            this.attachNative();
        }
    }

    private dettach() {
        if (this._scrollChangeCount === 0 && this.isLoaded) {
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

    public abstract scrollToVerticalOffset(value: number, animated: boolean);
    public abstract scrollToHorizontalOffset(value: number, animated: boolean);
    public abstract _onOrientationChanged();
}

const converter = makeParser<Orientation>(makeValidator("horizontal", "vertical"));
export const orientationProperty = new Property<ScrollViewBase, Orientation>({
    name: "orientation", defaultValue: "vertical", affectsLayout: true,
    valueChanged: (target: ScrollViewBase, oldValue: Orientation, newValue: Orientation) => {
        target._onOrientationChanged();
    },
    valueConverter: converter
});
orientationProperty.register(ScrollViewBase);