// >> color-require
import * as colorModule from '@nativescript/core/color';
const { Color } = colorModule;
// << color-require
import * as TKUnit from '../tk-unit';

export * from './color-tests-common';

export function testFromIosColorWhite() {
	// >> color-ios-white
	// Creates the white color
	const color = Color.fromIosColor(UIColor.whiteColor);
	// << color-ios-white
	TKUnit.assertEqual(color.a, 255, 'Color.a not properly parsed');
	TKUnit.assertEqual(color.r, 255, 'Color.r not properly parsed');
	TKUnit.assertEqual(color.g, 255, 'Color.g not properly parsed');
	TKUnit.assertEqual(color.b, 255, 'Color.b not properly parsed');
	TKUnit.assertEqual(color.hex, '#FFFFFF', 'Color.hex not properly parsed');
	TKUnit.assertEqual(color.argb, 0xffffffff, 'Color.argb not properly parsed');
}
