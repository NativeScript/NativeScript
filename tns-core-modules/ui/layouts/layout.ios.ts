import { Layout as LayoutDefinition } from "ui/layouts/layout";
import { LayoutBase } from "ui/layouts/layout-base";

export class Layout extends LayoutBase implements LayoutDefinition {
    private _view: UIView;

    constructor() {
        super();
        this._view = UIView.new();
    }

    get ios(): UIView {
        return this._view;
    }

    get _nativeView(): UIView {
        return this._view;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will measure the native element.
    }
}