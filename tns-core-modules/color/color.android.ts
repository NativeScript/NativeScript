import common = require("./color-common");

export class Color extends common.Color {
    get android(): number {
        return this.argb;
    }

    public _argbFromString(hex: string): number {
        return android.graphics.Color.parseColor(hex);
    }
}
