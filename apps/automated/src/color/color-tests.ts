// >> color-require
import * as colorModule from '@nativescript/core/color';
var Color = colorModule.Color;
// << color-require
import * as TKUnit from '../tk-unit';

export var test_Hex_Color = function () {
	// >> color-hex
	// Creates the red color
	var color = new Color('#FF0000');
	// << color-hex
	TKUnit.assertEqual(color.a, 255, 'Color.a not properly parsed');
	TKUnit.assertEqual(color.r, 255, 'Color.r not properly parsed');
	TKUnit.assertEqual(color.g, 0, 'Color.g not properly parsed');
	TKUnit.assertEqual(color.b, 0, 'Color.b not properly parsed');
	TKUnit.assertEqual(color.hex, '#FF0000', 'Color.hex not properly parsed');
	TKUnit.assertEqual(color.argb, 0xffff0000, 'Color.argb not properly parsed');
};

export var test_ShortHex_Color = function () {
	// >> color-hex-short
	// Creates the color #FF8800
	var color = new Color('#F80');
	// << color-hex-short
	TKUnit.assertEqual(color.a, 255, 'Color.a not properly parsed');
	TKUnit.assertEqual(color.r, 255, 'Color.r not properly parsed');
	TKUnit.assertEqual(color.g, 136, 'Color.g not properly parsed'); // 0x88 == 136
	TKUnit.assertEqual(color.b, 0, 'Color.b not properly parsed');
	TKUnit.assertEqual(color.hex, '#FF8800', 'Color.hex not properly parsed');
	TKUnit.assertEqual(color.argb, 0xffff8800, 'Color.argb not properly parsed');
};

export var test_Argb_Color = function () {
	// >> color-rgb
	// Creates the color with 100 alpha, 255 red, 100 green, 100 blue
	var color = new Color(100, 255, 100, 100);
	// << color-rgb
	TKUnit.assertEqual(color.a, 100, 'Color.a not properly parsed');
	TKUnit.assertEqual(color.r, 255, 'Color.r not properly parsed');
	TKUnit.assertEqual(color.g, 100, 'Color.g not properly parsed');
	TKUnit.assertEqual(color.b, 100, 'Color.b not properly parsed');
	TKUnit.assertEqual(color.hex, '#64FF6464', 'Color.hex not properly parsed');
	TKUnit.assertEqual(color.argb, 0x64ff6464, 'Color.argb not properly parsed');
};

export var test_ArgbInt_Color = function () {
	// >> color-rgb-single
	// Creates the color with 100 alpha, 100 red, 100 green, 100 blue
	var color = new Color(0x64646464);
	// << color-rgb-single
	TKUnit.assertEqual(color.a, 100, 'Color.a not properly parsed');
	TKUnit.assertEqual(color.r, 100, 'Color.r not properly parsed');
	TKUnit.assertEqual(color.g, 100, 'Color.g not properly parsed');
	TKUnit.assertEqual(color.b, 100, 'Color.b not properly parsed');
	TKUnit.assertEqual(color.hex, '#64646464', 'Color.hex not properly parsed');
	TKUnit.assertEqual(color.argb, 0x64646464, 'Color.argb not properly parsed');
};

export var test_rgb_Color_CSS = function () {
	// <snippet module="color" title="color">
	// ### Creating a Color from four RGB values
	// ``` JavaScript
	// Creates the color with 255 red, 100 green, 100 blue
	var color = new Color('rgb(255, 100, 100)');
	// ```
	// </snippet>
	TKUnit.assertEqual(color.a, 255, 'Color.a not properly parsed');
	TKUnit.assertEqual(color.r, 255, 'Color.r not properly parsed');
	TKUnit.assertEqual(color.g, 100, 'Color.g not properly parsed');
	TKUnit.assertEqual(color.b, 100, 'Color.b not properly parsed');
	TKUnit.assertEqual(color.hex, '#FF6464', 'Color.hex not properly parsed');
	TKUnit.assertEqual(color.argb, 0xffff6464, 'Color.argb not properly parsed');
};

export var test_rgba_Color_CSS = function () {
	var alpha = 0.5;
	var expected = 0x80;
	// <snippet module="color" title="color">
	// ### Creating a Color from four RGB values
	// ``` JavaScript
	// Creates the color with 255 red, 100 green, 100 blue and 0 alpha
	var color = new Color(`rgba(255, 100, 100, ${alpha})`);
	// ```
	// </snippet>
	TKUnit.assertEqual(color.a, expected, 'Color.a not properly parsed');
	TKUnit.assertEqual(color.r, 255, 'Color.r not properly parsed');
	TKUnit.assertEqual(color.g, 100, 'Color.g not properly parsed');
	TKUnit.assertEqual(color.b, 100, 'Color.b not properly parsed');
	TKUnit.assertEqual(color.hex, '#80FF6464', 'Color.hex not properly parsed');
	TKUnit.assertEqual(color.argb, 0x80ff6464, 'Color.argb not properly parsed');
};
