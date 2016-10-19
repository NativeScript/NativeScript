import definition = require("ui/layouts/layout-base");
import types = require("utils/types");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import {PropertyChangeData, Property } from "ui/core/dependency-observable";
import {PropertyMetadata } from "ui/core/proxy";

var clipToBoundsProperty = new Property(
    "clipToBounds",
    "LayoutBase",
    new PropertyMetadata(true, dependencyObservable.PropertyMetadataSettings.None));

function onClipToBoundsPropertyChanged(data: PropertyChangeData) {
    var layout = <LayoutBase>data.object;
    layout._onClipToBoundsChanged(data.oldValue, data.newValue);
}

(<PropertyMetadata>clipToBoundsProperty.metadata).onSetNativeValue = onClipToBoundsPropertyChanged;

export class LayoutBase extends view.CustomLayoutView implements definition.LayoutBase, view.AddChildFromBuilder {

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

    public _registerLayoutChild(child: view.View) {
        //Overridden
    }

    public _unregisterLayoutChild(child: view.View) {
        //Overridden
    }

    public addChild(child: view.View): void {
        // TODO: Do we need this method since we have the core logic in the View implementation?
        this._subViews.push(child);
        this._addView(child);
        this._registerLayoutChild(child);
    }

    public insertChild(child: view.View, atIndex: number): void {
        this._subViews.splice(atIndex, 0, child);
        this._addView(child, atIndex);
        this._registerLayoutChild(child);
    }

    public removeChild(child: view.View): void {
        this._removeView(child);

        // TODO: consider caching the index on the child.
        var index = this._subViews.indexOf(child);
        this._subViews.splice(index, 1);
        this._unregisterLayoutChild(child);
    }

    public removeChildren(): void {
        while (this.getChildrenCount() !== 0) {
            this.removeChild(this._subViews[this.getChildrenCount() - 1]);
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

    public get clipToBounds(): boolean {
        return this._getValue(LayoutBase.clipToBoundsProperty);
    }
    public set clipToBounds(value: boolean) {
        this._setValue(LayoutBase.clipToBoundsProperty, value);
    }

    public _onClipToBoundsChanged(oldValue: boolean, newValue: boolean) {
        //
    }

    public _childIndexToNativeChildIndex(index?: number): number {
        if (types.isUndefined(index)) {
            return undefined;
        }
        var result = 0;
        for (let i = 0; i < index && i < this._subViews.length; i++) {
            result += this._subViews[i]._getNativeViewsCount();
        }
        return result;
    }

    public _eachChildView(callback: (child: view.View) => boolean): void {
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

    public eachLayoutChild(callback: (child: view.View, isLast: boolean) => void): void {
        var lastChild: view.View = null;
        
        this._eachChildView((cv) => {
            cv._eachLayoutView((lv) => {
                if (lastChild && lastChild._isVisible) {
                    callback(lastChild, false);
                }

                lastChild = lv;
            });

            return true;
        });
        
        if (lastChild && lastChild._isVisible) {
            callback(lastChild, true);
        }

    }

    protected static adjustChildrenLayoutParams(layoutBase: LayoutBase, widthMeasureSpec: number, heightMeasureSpec: number): void {
        for (let i = 0, count = layoutBase.getChildrenCount(); i < count; i++) {
            let child = layoutBase.getChildAt(i);
            view.View.adjustChildLayoutParams(child, widthMeasureSpec, heightMeasureSpec);
        }
    }

    protected static restoreOriginalParams(layoutBase: LayoutBase): void {
        for (let i = 0, count = layoutBase.getChildrenCount(); i < count; i++) {
            let child = layoutBase.getChildAt(i);
            view.View.restoreChildOriginalParams(child);
        }
    }
}