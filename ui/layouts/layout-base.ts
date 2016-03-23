import definition = require("ui/layouts/layout-base");
import types = require("utils/types");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import utils = require("utils/utils");
import style = require("ui/styling/style");

export class LayoutBase extends view.CustomLayoutView implements definition.LayoutBase, view.AddChildFromBuilder {

    public static clipToBoundsProperty = new dependencyObservable.Property("clipToBounds", "LayoutBase",
        new proxy.PropertyMetadata(true, dependencyObservable.PropertyMetadataSettings.None, LayoutBase.onClipToBoundsPropertyChanged, null, LayoutBase.onClipToBoundsPropertyChanged));

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

    private static onClipToBoundsPropertyChanged(data: dependencyObservable.PropertyChangeData): void {
        var layout = <LayoutBase>data.object;
        layout.onClipToBoundsChanged(data.oldValue, data.newValue);
    }

    protected static adjustChildrenLayoutParams(layoutBase: LayoutBase, widthMeasureSpec: number, heightMeasureSpec: number): void {
        let availableWidth = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        let widthSpec = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        let availableHeight = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        let heightSpec = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        for (let i = 0, count = layoutBase.getChildrenCount(); i < count; i++) {
            let child = layoutBase.getChildAt(i);
            let lp: style.CommonLayoutParams = child.style._getValue(style.nativeLayoutParamsProperty);

            if (widthSpec !== utils.layout.UNSPECIFIED) {
                if (lp.widthPercent > 0) {
                    lp.width = Math.round(availableWidth * lp.widthPercent);
                }

                if (lp.leftMarginPercent > 0) {
                    lp.leftMargin = Math.round(availableWidth * lp.leftMarginPercent);
                }

                if (lp.rightMarginPercent > 0) {
                    lp.rightMargin = Math.round(availableWidth * lp.rightMarginPercent);
                }
            }

            if (heightSpec !== utils.layout.UNSPECIFIED) {
                if (lp.heightPercent > 0) {
                    lp.height = Math.round(availableHeight * lp.heightPercent);
                }

                if (lp.topMarginPercent > 0) {
                    lp.topMargin = Math.round(availableHeight * lp.topMarginPercent);
                }

                if (lp.bottomMarginPercent > 0) {
                    lp.bottomMargin = Math.round(availableHeight * lp.bottomMarginPercent);
                }
            }
        }
    }

    protected static restoreOriginalParams(layoutBase: LayoutBase): void {
        for (let i = 0, count = layoutBase.getChildrenCount(); i < count; i++) {
            let child = layoutBase.getChildAt(i);
            let lp: style.CommonLayoutParams = child.style._getValue(style.nativeLayoutParamsProperty);

            if (lp.widthPercent > 0) {
                lp.width = -1;
            }

            if (lp.heightPercent > 0) {
                lp.height = -1;
            }
            if (lp.leftMarginPercent > 0) {
                lp.leftMargin = 0;
            }
            if (lp.topMarginPercent > 0) {
                lp.topMargin = 0;
            }
            if (lp.rightMarginPercent > 0) {
                lp.rightMargin = 0;
            }
            if (lp.bottomMarginPercent > 0) {
                lp.bottomMargin = 0;
            }
        }
    }
}
