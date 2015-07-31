import definition = require("ui/layouts/layout");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import native_api = require("native-api");

function onClipToBoundsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var nativeView = (<Layout>data.object)._nativeView;
    if (!nativeView) {
        return;
    }
    var value = <boolean>data.newValue;

    if (nativeView instanceof native_api.UIView) {
        (<native_api.UIView>nativeView).clipsToBounds = value;
    }
    else if (nativeView instanceof native_api.android.view.ViewGroup) {
        (<native_api.android.view.ViewGroup>nativeView).setClipChildren(value);
    }
}

var clipToBoundsProperty = new dependencyObservable.Property(
    "clipToBounds",
    "Layout",
    new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None, onClipToBoundsPropertyChanged)
    );

export class Layout extends view.CustomLayoutView implements definition.Layout, view.AddChildFromBuilder {
    public static clipToBoundsProperty = clipToBoundsProperty;

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

    public insertChild(atIndex: number, child: view.View) {
        this._addView(child);
        this._subViews.splice(atIndex, 0, child);
    }

    public removeChild(child: view.View) {
        this._removeView(child);

        // TODO: consider caching the index on the child.
        var index = this._subViews.indexOf(child);
        this._subViews.splice(index, 1);
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

    get clipToBounds(): boolean {
        return this._getValue(Layout.clipToBoundsProperty);
    }
    set clipToBounds(value: boolean) {
        this._setValue(Layout.clipToBoundsProperty, value);
    }
} 
