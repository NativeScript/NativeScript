import { ColorBase } from './color-common';
import type { IColor } from './color-types';

export class Color extends ColorBase implements IColor {
    private _windows: Windows.UI.Color | undefined;

    get windows(): Windows.UI.Color {
        if (!this._windows) {
            this._windows = Windows.UI.ColorHelper.FromArgb(Math.round(this.a * 255), Math.round(this.r * 255), Math.round(this.g * 255), Math.round(this.b * 255));
        }

        return this._windows;
    }

    public static fromWindowsColor(value: Windows.UI.Color): Color {
        return new Color(Math.round(value.A / 255), Math.round(value.R / 255), Math.round(value.G / 255), Math.round(value.B / 255));
    }
}
