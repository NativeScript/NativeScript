import { Layout as LayoutDefinition } from "./layout";
import { LayoutBase } from "./layout-base";

export * from "./layout-base";
export class Layout extends LayoutBase implements LayoutDefinition {
    nativeView: UIView;

    constructor() {
        super();
        this.nativeView = UIView.new();
    }

    get ios(): UIView {
        return this.nativeView;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will measure the native element.
    }
}
