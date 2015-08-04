import button = require("ui/button");
import utils = require("utils/utils");
import TKUnit = require("../TKUnit");
import {StackLayout} from "ui/layouts/stack-layout";

var DELTA = 0.1;

export class MyStackLayout extends StackLayout {
    public measureCount: number = 0;
    public arrangeCount: number = 0;

    public get measured(): boolean {
        return this.measureCount > 0;
    }

    public get arranged(): boolean {
        return this.arrangeCount > 0;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this.measureCount++;
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);
        this.arrangeCount++;
    }
}

export class MyButton extends button.Button {
    public measureCount: number = 0;
    public arrangeCount: number = 0;

    private _layoutLeft;
    private _layoutTop;
    private _layoutWidth;
    private _layoutHeight;

    private _measureWidth;
    private _measureHeight;

    public get measured(): boolean {
        return this.measureCount > 0;
    }

    public get arranged(): boolean {
        return this.arrangeCount > 0;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this._measureWidth = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        this._measureHeight = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        this.measureCount++;
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        this._layoutLeft = left;
        this._layoutTop = top;
        this._layoutWidth = right - left;
        this._layoutHeight = bottom - top;

        super.onLayout(left, top, right, bottom);
        this.arrangeCount++;
    }

    get measureHeight(): number {
        return this._measureHeight;
    }

    get measureWidth(): number {
        return this._measureWidth;
    }

    get layoutWidth(): number {
        return this._layoutWidth;
    }

    get layoutHeight(): number {
        return this._layoutHeight;
    }
    
    get layoutLeft(): number {
        return this._layoutLeft;
    }

    get layoutTop(): number {
        return this._layoutTop;
    }

    _getCurrentMeasureSpecs(): { widthMeasureSpec: number; heightMeasureSpec: number } {
        return {
            widthMeasureSpec: (<any>this)._oldWidthMeasureSpec,
            heightMeasureSpec: (<any>this)._oldHeightMeasureSpec
        };
    }
}

export function assertMeasure(btn: MyButton, width: number, height: number, name?: string) {
    var density = utils.layout.getDisplayDensity();

    var delta = Math.floor(density) !== density ? 1.1 : DELTA;
    name = name ? "[" + name + "]" : "";

    TKUnit.assertAreClose(Math.floor(btn.measureWidth / density), width, delta, name + "width");
    TKUnit.assertAreClose(Math.floor(btn.measureHeight / density), height, delta, name + "height");
}

export function assertLayout(btn: MyButton, left: number, top: number, width: number, height: number, name?: string): void {
    var density = utils.layout.getDisplayDensity();

    var delta = Math.floor(density) !== density ? 1.1 : DELTA;
    name = name ? "[" + name + "]" : "";

    TKUnit.assertAreClose(Math.floor(btn.layoutLeft / density), left, delta, name + "left");
    TKUnit.assertAreClose(Math.floor(btn.layoutTop / density), top, delta, name + "top");
    TKUnit.assertAreClose(Math.floor(btn.layoutWidth / density), width, delta, name + "width");
    TKUnit.assertAreClose(Math.floor(btn.layoutHeight / density), height, delta, name + "height");
}

export function dip(value: number): number {
    var density = utils.layout.getDisplayDensity();
    return Math.floor(value * density);
}