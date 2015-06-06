import definition = require("ui/layouts/layout-base");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

export class LayoutBase extends view.CustomLayoutView implements definition.LayoutBase, view.AddChildFromBuilder {

    public static clipToBoundsProperty = new dependencyObservable.Property("clipToBounds", "LayoutBase",
        new proxy.PropertyMetadata(true, dependencyObservable.PropertyMetadataSettings.None, LayoutBase.onClipToBoundsPropertyChanged));

    private _subViews: Array<view.View> = new Array<view.View>();

    public _addChildFromBuilder(name: string, value: any) {
        if (value instanceof view.View) {
            this.addChild(value);
        }
    }

    getChildrenCount(): number {
        return this._subViews.length;
    }

    // overrides the base property.
    get _childrenCount(): number {
        return this._subViews.length;
    }

    getChildAt(index: number): view.View {
        return this._subViews[index];
    }

    getChildIndex(child: view.View): number {
        return this._subViews.indexOf(child);
    }

    public getChildById(id: string) {
        return view.getViewById(this, id);
    }

    public addChild(child: view.View) {
        // TODO: Do we need this method since we have the core logic in the View implementation?
        this._addView(child);
        this._subViews.push(child);
    }

    public insertChild(child: view.View, atIndex: number) {
        this._addView(child, atIndex);
        this._subViews.splice(atIndex, 0, child);
    }

    public removeChild(child: view.View) {
        this._removeView(child);

        // TODO: consider caching the index on the child.
        var index = this._subViews.indexOf(child);
        this._subViews.splice(index, 1);
    }

    public removeChildren() {
        while (this.getChildrenCount() != 0) {
            this.removeChild(this._subViews[this.getChildrenCount() - 1]);
        }
    }

    public _eachChildView(callback: (child: view.View) => boolean) {
        var i;
        var length = this._subViews.length;
        var retVal: boolean;

        for (i = 0; i < length; i++) {
            retVal = callback(this._subViews[i]);
            if (retVal === false) {
                break;
            }
        }
    }

    get padding(): string {
        return this.style.padding;
    }
    set padding(value: string) {
        this.style.padding = value;
    }

    public get paddingTop(): number {
        return this.style.paddingTop;
    }
    public set paddingTop(value: number) {
        this.style.paddingTop = value;
    }

    public get paddingRight(): number {
        return this.style.paddingRight;
    }
    public set paddingRight(value: number) {
        this.style.paddingRight = value;
    }

    public get paddingBottom(): number {
        return this.style.paddingBottom;
    }
    public set paddingBottom(value: number) {
        this.style.paddingBottom = value;
    }

    public get paddingLeft(): number {
        return this.style.paddingLeft;
    }
    public set paddingLeft(value: number) {
        this.style.paddingLeft = value;
    }

    protected onClipToBoundsChanged(oldValue: boolean, newValue: boolean) {
        var nativeView = this._nativeView;
        if (!nativeView) {
            return;
        }

        if (nativeView instanceof UIView) {
            nativeView.clipsToBounds = newValue;
        }

        else if (nativeView instanceof android.view.ViewGroup) {
            nativeView.setClipChildren(newValue);
        }
    }

    private static onClipToBoundsPropertyChanged(data: dependencyObservable.PropertyChangeData): void {
        var layout = <LayoutBase>data.object;
        layout.onClipToBoundsChanged(data.oldValue, data.newValue);
    }
} 
