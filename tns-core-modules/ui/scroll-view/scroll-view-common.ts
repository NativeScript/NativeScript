import { ScrollView as ScrollViewDefinition } from "ui/scroll-view";
import { Property } from "ui/core/properties";
import { ContentView } from "ui/content-view";
import { EventData } from "data/observable";

export abstract class ScrollViewBase extends ContentView implements ScrollViewDefinition {
    private _scrollChangeCount: number = 0;
    public static scrollEvent = "scroll";

    public orientation: "horizontal" | "vertical";

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
}


export const orientationProperty = new Property<ScrollViewBase, "horizontal" | "vertical">({
    name: "orientation", defaultValue: "vertical", affectsLayout: true, valueConverter: (value) => {
        if (value !== "vertical" && value !== "horizontal") {
            throw new Error(`Orientation should be 'horizontal' or 'vertical'. Value: ${value}`);
        }

        return value;
    }
});
orientationProperty.register(ScrollViewBase);