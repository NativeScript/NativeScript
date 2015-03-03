// <snippet module="color" title="color">
// # Color
// Using Colors requires the "color" module.
// ``` JavaScript
import colorModule = require("color");
var Color = colorModule.Color;
// ```
// </snippet>
import TKUnit = require("./TKUnit");

export var test_Hex_Color = function () {
    // <snippet module="color" title="color">
    // ### Creating a Color from a hex value.
    // ``` JavaScript
    //// Creates the red color
    var color = new Color("#FF0000");
    // ```
    // </snippet>
    TKUnit.assert(color.a === 255, "Color.a not properly parsed");
    TKUnit.assert(color.r === 255, "Color.r not properly parsed");
    TKUnit.assert(color.g === 0, "Color.g not properly parsed");
    TKUnit.assert(color.b === 0, "Color.b not properly parsed");
    TKUnit.assert(color.hex === "#FF0000", "Color.hex not properly parsed");
    TKUnit.assert(color.argb === _parseArgb(255, 255, 0, 0), "Color.argb not properly parsed");
}

export var test_ShortHex_Color = function () {
    // <snippet module="color" title="color">
    // ### Creating a Color from a short hex value.
    // ``` JavaScript
    //// Creates the color #FF8800
    var color = new Color("#F80");
    // ```
    // </snippet>
    TKUnit.assert(color.a === 255, "Color.a not properly parsed");
    TKUnit.assert(color.r === 255, "Color.r not properly parsed");
    TKUnit.assert(color.g === 136, "Color.g not properly parsed"); // 0x88 == 136
    TKUnit.assert(color.b === 0, "Color.b not properly parsed");
    TKUnit.assert(color.hex === "#FF8800", "Color.hex not properly parsed");
    TKUnit.assert(color.argb === _parseArgb(255, 255, 136, 0), "Color.argb not properly parsed");
}

export var test_Argb_Color = function () {
    // <snippet module="color" title="color">
    // ### Creating a Color from four ARGB values
    // ``` JavaScript
    //// Creates the color with 100 alpha, 255 red, 100 green, 100 blue
    var color = new Color(100, 255, 100, 100);
    // ```
    // </snippet>
    TKUnit.assert(color.a === 100, "Color.a not properly parsed");
    TKUnit.assert(color.r === 255, "Color.r not properly parsed");
    TKUnit.assert(color.g === 100, "Color.g not properly parsed");
    TKUnit.assert(color.b === 100, "Color.b not properly parsed");
    TKUnit.assert(color.hex === _buildHex(100, 255, 100, 100), "Color.hex not properly parsed");
    TKUnit.assert(color.argb === _parseArgb(100, 255, 100, 100), "Color.argb not properly parsed");
}

export var test_ArgbInt_Color = function () {
    // <snippet module="color" title="color">
    // ### Creating a Color from a single ARGB value
    // ``` JavaScript
    //// Creates the color with 100 alpha, 100 red, 100 green, 100 blue
    var argb = (100 << 24) | (100 << 16) | (100 << 8) | 100;
    var color = new Color(argb);
    // ```
    // </snippet>
    TKUnit.assert(color.a === 100, "Color.a not properly parsed");
    TKUnit.assert(color.r === 100, "Color.r not properly parsed");
    TKUnit.assert(color.g === 100, "Color.g not properly parsed");
    TKUnit.assert(color.b === 100, "Color.b not properly parsed");
    TKUnit.assert(color.hex === _buildHex(100, 100, 100, 100), "Color.hex not properly parsed");
    TKUnit.assert(color.argb === _parseArgb(100, 100, 100, 100), "Color.argb not properly parsed");
}

var _buildHex = function (a: number, r: number, g: number, b: number): string {
    return "#" + _componentToHex(a) + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
}

var _componentToHex = function (component: number): string {
    var hex = component.toString(16);
    if (hex.length === 1) {
        hex = "0" + hex;
    }

    return hex;
}

var _parseArgb = function (a: number, r: number, g: number, b: number): number {
    // Format is ARGB, so alpha takes the first 8 bits, red the next, green the next and the last 8 bits are for the blue component
    return (a << 24) | (r << 16) | (g << 8) | b;
}
