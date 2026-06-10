import { ColorBase } from './color-common';
import type { IColor } from './color-types';

export class Color extends ColorBase implements IColor {
    private _windows: Windows.UI.Color | undefined;

    get windows(): Windows.UI.Color {
        if (!this._windows) {
            // Windows.UI.Color is a plain {A,R,G,B} struct — bridge reads fields directly,
            // no need to round-trip through ColorHelper.FromArgb.
            this._windows = { A: Math.round(this.a), R: Math.round(this.r), G: Math.round(this.g), B: Math.round(this.b) } as unknown as Windows.UI.Color;
        }
        return this._windows;
    }

    get windowsArgb(): number {
        // _argb already stores the packed unsigned ARGB integer — no WinRT round-trip needed.
        return this.argb;
    }

    public static fromWindowsColor(value: Windows.UI.Color): Color {
        return new Color(Math.round(value.A), Math.round(value.R), Math.round(value.G), Math.round(value.B));
    }
}
