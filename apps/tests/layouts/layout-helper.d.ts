import button = require("ui/button");
import {StackLayout} from "ui/layouts/stack-layout";

export class MyButton extends button.Button {
    public measureCount: number;
    public arrangeCount: number;

    measured: boolean;
    arranged: boolean;

    measureHeight: number;
    measureWidth: number;
    layoutWidth: number;
    layoutHeight: number;
    layoutLeft: number;
    layoutTop: number;

    _getCurrentMeasureSpecs(): { widthMeasureSpec: number; heightMeasureSpec: number };
}

export class MyStackLayout extends StackLayout {
    public measureCount: number;
    public arrangeCount: number;

    public measured: boolean;
    public arranged: boolean;
}

export function assertMeasure(btn: MyButton, width: number, height: number, name?: string);
export function assertLayout(btn: MyButton, left: number, top: number, width: number, height: number, name?: string): void;
export function dip(value: number): number;
export function dp(value: number): number;