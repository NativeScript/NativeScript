import {Button} from "ui/button";
import {StackLayout} from "ui/layouts/stack-layout";
import {GridLayout} from "ui/layouts/grid-layout";

import * as utils from "utils/utils";
import * as TKUnit from "../../TKUnit";
import * as def from "./layout-helper";

var DELTA = 0.1;

class NativeButton extends android.widget.Button {    
    private owner: def.MeasuredView;

    constructor(context: android.content.Context, owner: def.MeasuredView) {
        super(context);
        this.owner = owner;
        return global.__native(this);
    }

    protected onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this.owner.widthMeasureSpec = widthMeasureSpec;
        this.owner.heightMeasureSpec = heightMeasureSpec;
        this.owner.measureCount++;
    }

    protected onLayout(changed: boolean, left: number, top: number, right: number, bottom: number): void {
        super.onLayout(changed, left, top, right, bottom);
        this.owner.arrangeCount++;
    }
}

class NativeStackLayout extends org.nativescript.widgets.StackLayout {
    private owner: def.MeasuredView;

    constructor(context: android.content.Context, owner: def.MeasuredView) {
        super(context);
        this.owner = owner;
        return global.__native(this);
    }

    protected onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this.owner.widthMeasureSpec = widthMeasureSpec;
        this.owner.heightMeasureSpec = heightMeasureSpec;
        this.owner.measureCount++;
    }

    protected onLayout(changed: boolean, left: number, top: number, right: number, bottom: number): void {
        super.onLayout(changed, left, top, right, bottom);
        this.owner.arrangeCount++;
    }
}

class NativeGridLayout extends org.nativescript.widgets.GridLayout {
    private owner: def.MeasuredView;

    constructor(context: android.content.Context, owner: def.MeasuredView) {
        super(context);
        this.owner = owner;
        return global.__native(this);
    }

    protected onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this.owner.widthMeasureSpec = widthMeasureSpec;
        this.owner.heightMeasureSpec = heightMeasureSpec;
        this.owner.measureCount++;
    }

    protected onLayout(changed: boolean, left: number, top: number, right: number, bottom: number): void {
        super.onLayout(changed, left, top, right, bottom);
        this.owner.arrangeCount++;
    }
}

export class MyButton extends Button implements def.MyButton {
    private _layout: android.view.View;

    get android(): android.view.View {
        return this._layout;
    }

    get _nativeView(): android.view.View {
        return this._layout;
    }

    public _createUI() {
        this._layout = new NativeButton(this._context, this);
    }

    public measureCount: number = 0;
    public arrangeCount: number = 0;

    public widthMeasureSpec: number = Number.NaN;
    public heightMeasureSpec: number = Number.NaN;

    public get measureWidth() {
        return utils.layout.getMeasureSpecSize(this.widthMeasureSpec);
    }
    public get measureHeight() {
        return utils.layout.getMeasureSpecSize(this.heightMeasureSpec);
    }

    public get measured(): boolean {
        return this.measureCount > 0;
    }

    public get arranged(): boolean {
        return this.arrangeCount > 0;
    }

    get layoutWidth(): number {
        return this._layout.getWidth();
    }

    get layoutHeight(): number {
        return this._layout.getHeight();
    }

    get layoutLeft(): number {
        return this._layout.getLeft();
    }

    get layoutTop(): number {
        return this._layout.getTop();
    }
}

export class MyStackLayout extends StackLayout implements def.MyStackLayout {
    private _layout: android.view.View;

    get android(): android.view.View {
        return this._layout;
    }

    get _nativeView(): android.view.View {
        return this._layout;
    }

    public _createUI() {
        this._layout = new NativeStackLayout(this._context, this);
    }

    public measureCount: number = 0;
    public arrangeCount: number = 0;

    public widthMeasureSpec: number = Number.NaN;
    public heightMeasureSpec: number = Number.NaN;

    public get measureWidth() {
        return utils.layout.getMeasureSpecSize(this.widthMeasureSpec);
    }
    public get measureHeight() {
        return utils.layout.getMeasureSpecSize(this.heightMeasureSpec);
    }

    public get measured(): boolean {
        return this.measureCount > 0;
    }

    public get arranged(): boolean {
        return this.arrangeCount > 0;
    }

    get layoutWidth(): number {
        return this._layout.getWidth();
    }

    get layoutHeight(): number {
        return this._layout.getHeight();
    }

    get layoutLeft(): number {
        return this._layout.getLeft();
    }

    get layoutTop(): number {
        return this._layout.getTop();
    }
}

export class MyGridLayout extends GridLayout implements def.MyGridLayout {
    private _layout: android.view.View;

    get android(): android.view.View {
        return this._layout;
    }

    get _nativeView(): android.view.View {
        return this._layout;
    }

    public _createUI() {
        this._layout = new NativeGridLayout(this._context, this);
    }

    public measureCount: number = 0;
    public arrangeCount: number = 0;

    public widthMeasureSpec: number = Number.NaN;
    public heightMeasureSpec: number = Number.NaN;

    public get measureWidth() {
        return utils.layout.getMeasureSpecSize(this.widthMeasureSpec);
    }
    public get measureHeight() {
        return utils.layout.getMeasureSpecSize(this.heightMeasureSpec);
    }

    public get measured(): boolean {
        return this.measureCount > 0;
    }

    public get arranged(): boolean {
        return this.arrangeCount > 0;
    }

    get layoutWidth(): number {
        return this._layout.getWidth();
    }

    get layoutHeight(): number {
        return this._layout.getHeight();
    }

    get layoutLeft(): number {
        return this._layout.getLeft();
    }

    get layoutTop(): number {
        return this._layout.getTop();
    }
}

export function assertMeasure(view: def.MeasuredView, width: number, height: number, name?: string) {
    name = name ? "[" + name + "]" : "";

    TKUnit.assertAreClose(view.measureWidth, width, DELTA, name + "width");
    TKUnit.assertAreClose(view.measureHeight, height, DELTA, name + "height");
}

export function assertLayout(view: def.MeasuredView, left: number, top: number, width: number, height: number, name?: string): void {
    name = name ? "[" + name + "]" : "";

    TKUnit.assertAreClose(view.layoutLeft, left, DELTA, name + "left");
    TKUnit.assertAreClose(view.layoutTop, top, DELTA, name + "top");
    TKUnit.assertAreClose(view.layoutWidth, width, DELTA, name + "width");
    TKUnit.assertAreClose(view.layoutHeight, height, DELTA, name + "height");
}

export function dp(value: number): number {
    return utils.layout.toDeviceIndependentPixels(value);
}

export function dip(value: number): number {
    return utils.layout.toDevicePixels(value);
}
