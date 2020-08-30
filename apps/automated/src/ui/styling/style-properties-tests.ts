import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { isAndroid, isIOS, Button, Label, TextField, TextView, StackLayout, View, Color, Length, PercentLength, LengthPercentUnit, LengthPxUnit } from '@nativescript/core';
import * as fontModule from '@nativescript/core/ui/styling/font';

export function test_setting_textDecoration_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('textDecoration', 'text-decoration', 'underline');
}

export function test_setting_textTransform_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('textTransform', 'text-transform', 'uppercase');
}

export function test_setting_whiteSpace_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('whiteSpace', 'white-space', 'nowrap');
}

export function test_setting_color_property_from_CSS_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('color', 'color', new Color('#FF0000'), '#FF0000');
}

export function test_setting_backgroundColor_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('backgroundColor', 'background-color', new Color('#FF0000'), '#FF0000');
}

export function test_setting_backgroundRepeat_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('backgroundRepeat', 'background-repeat', 'repeat-x');
}

export function test_setting_backgroundSize_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('backgroundSize', 'background-size', '10% 20%');
}

export function test_setting_backgroundPosition_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('backgroundPosition', 'background-position', 'left center');
}

export function test_setting_backgroundImage_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('backgroundImage', 'background-image', "url('~/pages/test2.png')");
}

export function test_setting_borderWidth_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('borderWidth', 'border-width', 5, '5', true);
}

export function test_setting_borderWidth_dip_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('borderWidth', 'border-width', 5, '5dip', true);
}

export function test_setting_borderWidth_multiple_values_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('borderWidth', 'border-width', '1 2 3 4', '1 2dip 3 4dip');
}

export function test_setting_borderColor_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('borderColor', 'border-color', new Color('#FF0000'), '#FF0000');
}

export function test_setting_borderColorRGB_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('borderColor', 'border-color', new Color('#FF0000'), 'rgb(255, 0, 0)');
}

export function test_setting_borderColorRGBA_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('borderColor', 'border-color', new Color('#FF0000'), 'rgba(255,0,0,1)');
}

export function test_setting_borderRadius_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('borderRadius', 'border-radius', 20, '20', true);
}

export function test_setting_borderRadius_dip_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('borderRadius', 'border-radius', 20, '20dip', true);
}

export function test_setting_borderRadius_multiple_values_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('borderRadius', 'border-radius', '1 2 3 4', '1 2dip 3 4dip');
}

export function test_setting_textAlignment_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('textAlignment', 'text-align', 'center');
}

export function test_setting_width_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('width', 'width', 200, '200', true);
}

export function test_setting_width_dip_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('width', 'width', 200, '200dip', true);
}

export function test_setting_height_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('height', 'height', 200, '200', true);
}

export function test_setting_height_dip_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('height', 'height', 200, '200dip', true);
}

export function test_setting_minWidth_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('minWidth', 'min-width', 200, '200', true);
}

export function test_setting_minWidth_dip_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('minWidth', 'min-width', 200, '200dip', true);
}

export function test_setting_minHeight_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('minHeight', 'min-height', 200, '200', true);
}

export function test_setting_minHeight_dip_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('minHeight', 'min-height', 200, '200dip', true);
}

export function test_setting_verticalAlignment_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('verticalAlignment', 'vertical-align', 'bottom');
}

export function test_setting_verticalAlignment_middle_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('verticalAlignment', 'vertical-align', 'middle');
}

export function test_setting_horizontalAlignment_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('horizontalAlignment', 'horizontal-align', 'right');
}

export function test_setting_visibility_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('visibility', 'visibility', 'collapse');
}

export function test_setting_margin_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('margin', 'margin', 10, '10', true);
}

export function test_setting_margin_dip_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('margin', 'margin', 10, '10dip', true);
}

export function test_setting_margin_percent_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('margin', 'margin', { value: 0.05, unit: '%' }, '5%', true);
}

export function test_setting_margin_multiple_values_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('margin', 'margin', '1 2% 3 4', '1 2% 3 4dip');
}

export function test_setting_padding_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('padding', 'padding', 10, '10', true);
}

export function test_setting_padding_dip_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('padding', 'padding', 10, '10dip', true);
}

export function test_setting_padding_multiple_values_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('padding', 'padding', '1 2 3 4', '1 2dip 3 4dip');
}

export function test_setting_opacity_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('opacity', 'opacity', 0.5);
}

export function test_setting_fontSize_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('fontSize', 'font-size', 32);
}

export function test_setting_fontFamily_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('fontFamily', 'font-family', 'Helvetica');
}

export function test_setting_fontWeight_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('fontWeight', 'font-weight', 'bold');
}

export function test_setting_fontStyle_property_from_CSS_is_applied_to_Style() {
	test_property_from_CSS_is_applied_to_style('fontStyle', 'font-style', 'italic');
}

function test_property_from_CSS_is_applied_to_style(propName: string, cssName: string, value: any, cssValue?: string, useDeepEquals: boolean = false) {
	if (!cssValue) {
		cssValue = value + '';
	}

	const btn = new Button();
	btn.id = 'testBtn';

	const page = helper.getCurrentPage();
	page.css = '#testBtn { ' + cssName + ': ' + cssValue + ' }';
	page.content = btn;

	if (useDeepEquals) {
		TKUnit.assertDeepEqual(btn.style[propName], value);
	} else {
		TKUnit.assertEqual(btn.style[propName], value, 'Setting property ' + propName + ' with CSS name ' + cssName);
	}
}

export function test_width_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('width', 200);
}

export function test_height_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('height', 200);
}

export function test_minWidth_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('minWidth', 200);
}

export function test_minHeight_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('minHeight', 200);
}

export function test_verticalAlignment_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('verticalAlignment', 'bottom');
}

export function test_horizontalAlignment_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('horizontalAlignment', 'right');
}

export function test_borderTopColor_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderTopColor', new Color('red'));
}

export function test_borderRightColor_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderRightColor', new Color('green'));
}

export function test_borderBottomColor_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderBottomColor', new Color('blue'));
}

export function test_borderLeftColor_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderLeftColor', new Color('yellow'));
}

export function test_borderTopWidth_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderTopWidth', 10);
}

export function test_borderRightWidth_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderRightWidth', 20);
}

export function test_borderBottomWidth_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderBottomWidth', 30);
}

export function test_borderLeftWidth_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderLeftWidth', 40);
}

export function test_borderTopLeftRadiusWidth_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderTopLeftRadius', 10);
}

export function test_borderTopRightRadius_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderTopRightRadius', 20);
}

export function test_borderBottomRightRadius_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderBottomRightRadius', 30);
}

export function test_borderBottomLeftRadius_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('borderBottomLeftRadius', 40);
}

export function test_marginLeft_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('marginLeft', 10);
}

export function test_marginTop_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('marginTop', 10);
}

export function test_marginBottom_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('marginBottom', 10);
}

export function test_marginRight_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('marginRight', 10);
}

export function test_paddingLeft_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_layout_view('paddingLeft', 10);
}

export function test_paddingTop_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_layout_view('paddingTop', 10);
}

export function test_paddingBottom_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_layout_view('paddingBottom', 10);
}

export function test_paddingRight_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_layout_view('paddingRight', 10);
}

export function test_visibility_property_is_synced_in_style_and_view() {
	test_property_is_synced_in_style_and_view('visibility', 'collapse');
}

function test_property_is_synced_in_style_and_view(propName: string, value: any) {
	const testView = new Button();
	testView[propName] = value;
	TKUnit.assertEqual(testView.style[propName], value, 'Setting view property ' + propName + ' does not set style property.');

	const testView2 = new Button();
	testView2[propName] = value;
	TKUnit.assertEqual(testView2.style[propName], value, 'Setting style property ' + propName + ' does not set view property.');
}

function test_property_is_synced_in_style_and_layout_view(propName: string, value: any) {
	const testView = new StackLayout();
	testView[propName] = value;
	TKUnit.assertEqual(testView.style[propName], value, 'Setting view property ' + propName + ' does not set style property.');

	const testView2 = new StackLayout();
	testView2[propName] = value;
	TKUnit.assertEqual(testView2.style[propName], value, 'Setting style property ' + propName + ' does not set view property.');
}

export function test_setting_same_color_does_not_trigger_property_change() {
	const testView = new Button();
	testView.style.color = new Color('#FF0000');

	let changed = false;
	testView.style.on('colorChange', (data) => {
		changed = true;
	});

	testView.style.color = new Color('#FF0000');
	TKUnit.assert(!changed, 'Property changed triggered.');
}

export function test_setting_different_color_triggers_property_change() {
	const testView = new Button();
	testView.style.color = new Color('#FF0000');

	let changed = false;
	testView.style.on('colorChange', (data) => {
		changed = true;
	});

	testView.style.color = new Color('#00FF00');
	TKUnit.assert(changed, 'Property changed not triggered.');
}

export function test_setting_same_textDecoration_does_not_trigger_property_change() {
	const testView = new Button();
	testView.style.textDecoration = 'underline';

	let changed = false;
	testView.style.on('textDecorationChange', (data) => {
		changed = true;
	});

	testView.style.textDecoration = 'underline';
	TKUnit.assert(!changed, 'Property changed triggered.');
}

export function test_setting_different_textDecoration_triggers_property_change() {
	const testView = new Button();
	testView.style.textDecoration = 'underline';

	let changed = false;
	testView.style.on('textDecorationChange', (data) => {
		changed = true;
	});

	testView.style.textDecoration = 'none';
	TKUnit.assert(changed, 'Property changed not triggered.');
}

export function test_setting_same_textTransform_does_not_trigger_property_change() {
	const testView = new Button();
	testView.style.textTransform = 'uppercase';

	let changed = false;
	testView.style.on('textTransformChange', (data) => {
		changed = true;
	});

	testView.style.textTransform = 'uppercase';
	TKUnit.assert(!changed, 'Property changed triggered.');
}

export function test_setting_different_textTransform_triggers_property_change() {
	const testView = new Button();
	testView.style.textTransform = 'uppercase';

	let changed = false;
	testView.style.on('textTransformChange', (data) => {
		changed = true;
	});

	testView.style.textTransform = 'none';
	TKUnit.assert(changed, 'Property changed not triggered.');
}

export function test_setting_same_whiteSpace_does_not_trigger_property_change() {
	const testView = new Button();
	testView.style.whiteSpace = 'normal';

	let changed = false;
	testView.style.on('whiteSpaceChange', (data) => {
		changed = true;
	});

	testView.style.whiteSpace = 'normal';
	TKUnit.assert(!changed, 'Property changed triggered.');
}

export function test_setting_different_whiteSpace_triggers_property_change() {
	const testView = new Button();
	testView.style.whiteSpace = 'normal';

	let changed = false;
	testView.style.on('whiteSpaceChange', (data) => {
		changed = true;
	});

	testView.style.whiteSpace = 'nowrap';
	TKUnit.assert(changed, 'Property changed not triggered.');
}

export function test_setting_same_backgroundColor_does_not_trigger_property_change() {
	const testView = new Button();
	testView.style.backgroundColor = new Color('#FF0000');

	let changed = false;
	testView.style.on('backgroundColorChange', (data) => {
		changed = true;
	});

	testView.style.backgroundColor = new Color('#FF0000');
	TKUnit.assert(!changed, 'Property changed triggered.');
}

export function test_setting_different_backgroundColor_triggers_property_change() {
	const testView = new Button();
	testView.style.backgroundColor = new Color('#FF0000');

	let changed = false;
	testView.style.on('backgroundColorChange', (data) => {
		changed = true;
	});

	testView.style.backgroundColor = new Color('#00FF00');
	TKUnit.assert(changed, 'Property changed not triggered.');
}

export function test_setting_border_color_shorthand_property_sets_all_border_colors() {
	let red = new Color('red');
	let green = new Color('green');
	let blue = new Color('blue');
	let yellow = new Color('yellow');
	test_border_color_shorthand_property('red', red, red, red, red);
	test_border_color_shorthand_property('red green', red, green, red, green);
	test_border_color_shorthand_property('red green blue', red, green, blue, green);
	test_border_color_shorthand_property('red green blue yellow', red, green, blue, yellow);
}

function test_border_color_shorthand_property(short: string, top: Color, right: Color, bottom: Color, left: Color) {
	const testView = new Button();
	testView.style.borderColor = short;

	TKUnit.assertEqual(testView.style.borderTopColor, top, 'top');
	TKUnit.assertEqual(testView.style.borderRightColor, right, 'right');
	TKUnit.assertEqual(testView.style.borderBottomColor, bottom, 'bottom');
	TKUnit.assertEqual(testView.style.borderLeftColor, left, 'left');
}

export function test_setting_border_width_shorthand_property_sets_all_border_widths() {
	test_border_width_shorthand_property('10', 10, 10, 10, 10);
	test_border_width_shorthand_property('10 20', 10, 20, 10, 20);
	test_border_width_shorthand_property('10 20 30', 10, 20, 30, 20);
	test_border_width_shorthand_property('10 20 30 40', 10, 20, 30, 40);
}

function test_border_width_shorthand_property(short: string, top: number, right: number, bottom: number, left: number) {
	const testView = new Button();
	testView.style.borderWidth = short;

	TKUnit.assertTrue(Length.equals(testView.style.borderTopWidth, top));
	TKUnit.assertTrue(Length.equals(testView.style.borderRightWidth, right));
	TKUnit.assertTrue(Length.equals(testView.style.borderBottomWidth, bottom));
	TKUnit.assertTrue(Length.equals(testView.style.borderLeftWidth, left));
}

export function test_setting_border_radius_shorthand_property_sets_all_border_radii() {
	test_border_radius_shorthand_property('10', 10, 10, 10, 10);
	test_border_radius_shorthand_property('10 20', 10, 20, 10, 20);
	test_border_radius_shorthand_property('10 20 30', 10, 20, 30, 20);
	test_border_radius_shorthand_property('10 20 30 40', 10, 20, 30, 40);
}

function test_border_radius_shorthand_property(short: string, topLeft: number, topRight: number, bottomRight: number, bottomLeft: number) {
	const testView = new Button();
	testView.style.borderRadius = short;

	TKUnit.assertTrue(Length.equals(testView.style.borderTopLeftRadius, topLeft), 'topLeft');
	TKUnit.assertTrue(Length.equals(testView.style.borderTopRightRadius, topRight), 'topRight');
	TKUnit.assertTrue(Length.equals(testView.style.borderBottomRightRadius, bottomRight), 'bottomRight');
	TKUnit.assertTrue(Length.equals(testView.style.borderBottomLeftRadius, bottomLeft), 'bottomLeft');
}

export function test_setting_margin_shorthand_property_sets_all_margins() {
	test_margin_shorthand_property('10', 10, 10, 10, 10);
	test_margin_shorthand_property('10 20', 10, 20, 10, 20);
	test_margin_shorthand_property('10 20 30', 10, 20, 30, 20);
	test_margin_shorthand_property('10 20 30 40', 10, 20, 30, 40);
}

function test_margin_shorthand_property(short: string, top: number, right: number, bottom: number, left: number) {
	const testView = new Button();
	testView.style.margin = short;

	TKUnit.assertTrue(PercentLength.equals(testView.style.marginTop, top));
	TKUnit.assertTrue(PercentLength.equals(testView.style.marginRight, right));
	TKUnit.assertTrue(PercentLength.equals(testView.style.marginBottom, bottom));
	TKUnit.assertTrue(PercentLength.equals(testView.style.marginLeft, left));
}

export function test_setting_padding_shorthand_property_sets_all_paddings() {
	test_padding_shorthand_property('10', 10, 10, 10, 10);
	test_padding_shorthand_property('10 20', 10, 20, 10, 20);
	test_padding_shorthand_property('10 20 30', 10, 20, 30, 20);
	test_padding_shorthand_property('10 20 30 40', 10, 20, 30, 40);
}

function test_padding_shorthand_property(short: string, top: number, right: number, bottom: number, left: number) {
	const testView = new Button();
	testView.style.padding = short;

	TKUnit.assertTrue(Length.equals(testView.style.paddingTop, top));
	TKUnit.assertTrue(Length.equals(testView.style.paddingRight, right));
	TKUnit.assertTrue(Length.equals(testView.style.paddingBottom, bottom));
	TKUnit.assertTrue(Length.equals(testView.style.paddingLeft, left));
}

export function test_setting_font_shorthand_property() {
	test_font_shorthand_property('15px Arial', 'Arial', 15, 'normal', 'normal');
	test_font_shorthand_property('bold 15px Arial', 'Arial', 15, 'normal', 'bold');
	test_font_shorthand_property('italic 15px Arial', 'Arial', 15, 'italic', 'normal');
	test_font_shorthand_property('bold italic 15px Arial', 'Arial', 15, 'italic', 'bold');
	test_font_shorthand_property('italic normal bold 15px Arial, serif', 'Arial, serif', 15, 'italic', 'bold');
	test_font_shorthand_property('small-caps normal bold 15px Arial', 'Arial', 15, 'normal', 'bold');
	test_font_shorthand_property('normal normal normal 15px Arial', 'Arial', 15, 'normal', 'normal');
	test_font_shorthand_property('normal normal normal 15px/30px Arial', 'Arial', 15, 'normal', 'normal');
}

function test_font_shorthand_property(short: string, family: string, size: number, style: string, weight: string) {
	const testView = new Button();
	(<any>testView.style)['font'] = short;

	TKUnit.assertEqual(testView.style.fontFamily, family, 'style.fontFamily');
	TKUnit.assertEqual(testView.style.fontStyle, style, 'style.fontStyle');
	TKUnit.assertEqual(testView.style.fontWeight, weight, 'style.fontWeight');
	TKUnit.assertEqual(testView.style.fontSize, size, 'style.fontSize');
}
export function test_setting_font_properties_sets_native_font() {
	if (fontModule.ios) {
		const basePath = 'fonts';
		fontModule.ios.registerFont(basePath + '/Roboto-Regular.ttf');
		fontModule.ios.registerFont(basePath + '/Roboto-Bold.ttf');
		fontModule.ios.registerFont(basePath + '/Roboto-BoldItalic.ttf');
		fontModule.ios.registerFont(basePath + '/Roboto-Italic.ttf');
	}

	test_native_font('normal', 'normal');
	test_native_font('italic', 'normal');
	test_native_font('normal', 'bold');
	test_native_font('italic', 'bold');
}

function test_native_font(style: 'normal' | 'italic', weight: '100' | '200' | '300' | 'normal' | '400' | '500' | '600' | 'bold' | '700' | '800' | '900') {
	const testView = new Button();

	const page = helper.getCurrentPage();
	page.content = testView;

	const fontName = 'Roboto';
	let fontNameSuffix = '';

	testView.style.fontFamily = fontName;
	testView.style.fontWeight = weight;
	testView.style.fontStyle = style;

	if (style === 'normal' && weight === 'normal') {
		fontNameSuffix += 'Regular';
	}
	if (weight === 'bold') {
		fontNameSuffix += 'Bold';
	}
	if (style === 'italic') {
		fontNameSuffix += 'Italic';
	}

	if (testView.ios) {
		TKUnit.assertEqual((<UIButton>testView.ios).titleLabel.font.fontName.toLowerCase(), (fontName + '-' + fontNameSuffix).toLowerCase(), 'native font ' + weight + ' ' + style);
	}
	//TODO: If needed add tests for other platforms
}

export function test_setting_label_whiteSpace_nowrap_sets_native() {
	const testView = new Label();
	testView.style.whiteSpace = 'nowrap';

	helper.buildUIAndRunTest(testView, function (views: Array<View>) {
		if (isAndroid) {
			TKUnit.assertEqual((<android.widget.TextView>testView.android).getEllipsize(), android.text.TextUtils.TruncateAt.END);
		} else if (isIOS) {
			TKUnit.assertEqual((<UILabel>testView.ios).lineBreakMode, NSLineBreakMode.ByTruncatingTail);
			TKUnit.assertEqual((<UILabel>testView.ios).numberOfLines, 1);
		}
	});
}

export function test_setting_label_whiteSpace_normal_sets_native() {
	const testView = new Label();
	testView.style.whiteSpace = 'normal';

	helper.buildUIAndRunTest(testView, function (views: Array<View>) {
		if (isAndroid) {
			TKUnit.assertNull((<android.widget.TextView>testView.android).getEllipsize(), null);
		} else if (isIOS) {
			TKUnit.assertEqual((<UILabel>testView.ios).lineBreakMode, NSLineBreakMode.ByWordWrapping);
			TKUnit.assertEqual((<UILabel>testView.ios).numberOfLines, 0);
		}
	});
}

export function test_setting_button_whiteSpace_nowrap_sets_native() {
	const testView = new Button();
	testView.style.whiteSpace = 'nowrap';

	helper.buildUIAndRunTest(testView, function (views: Array<View>) {
		if (isAndroid) {
			TKUnit.assertEqual((<android.widget.Button>testView.android).getEllipsize(), android.text.TextUtils.TruncateAt.END);
		} else if (isIOS) {
			TKUnit.assertEqual((<UIButton>testView.ios).titleLabel.lineBreakMode, NSLineBreakMode.ByTruncatingMiddle);
			TKUnit.assertEqual((<UIButton>testView.ios).titleLabel.numberOfLines, 1);
		}
	});
}

export function test_setting_button_whiteSpace_normal_sets_native() {
	const testView = new Button();
	testView.style.whiteSpace = 'normal';

	helper.buildUIAndRunTest(testView, function (views: Array<View>) {
		if (isAndroid) {
			TKUnit.assertNull((<android.widget.Button>testView.android).getEllipsize(), null);
		} else if (isIOS) {
			TKUnit.assertEqual((<UIButton>testView.ios).titleLabel.lineBreakMode, NSLineBreakMode.ByWordWrapping);
			TKUnit.assertEqual((<UIButton>testView.ios).titleLabel.numberOfLines, 0);
		}
	});
}

const initial = 'text Text';
const capitalized = 'Text Text';
const upper = 'TEXT TEXT';
const lower = 'text text';

function executeTransformTest(testView: View, androidTextFunc: (testView: View) => string, iOSTextFunc: (testView: View) => string) {
	helper.buildUIAndRunTest(testView, function (views: Array<View>) {
		if (isAndroid) {
			TKUnit.assertEqual(androidTextFunc(testView) + '', capitalized);
		} else if (isIOS) {
			TKUnit.assertEqual(iOSTextFunc(testView), capitalized);
		}

		testView.style.textTransform = 'uppercase';

		if (isAndroid) {
			TKUnit.assertEqual(androidTextFunc(testView) + '', upper);
		} else if (isIOS) {
			TKUnit.assertEqual(iOSTextFunc(testView), upper);
		}

		testView.style.textTransform = 'lowercase';

		if (isAndroid) {
			TKUnit.assertEqual(androidTextFunc(testView) + '', lower);
		} else if (isIOS) {
			TKUnit.assertEqual(iOSTextFunc(testView), lower);
		}

		testView.style.textTransform = 'none';

		if (isAndroid) {
			TKUnit.assertEqual(androidTextFunc(testView) + '', initial);
		} else if (isIOS) {
			TKUnit.assertEqual(iOSTextFunc(testView), initial);
		}
	});
}

function androidText(testView: View) {
	const tv = <android.widget.TextView>testView.android;
	const transform = tv.getTransformationMethod();
	const text = tv.getText();
	if (transform) {
		return transform.getTransformation(text, tv);
	} else {
		return text;
	}
}

function iOSText(testView: View) {
	return (<UITextView | UILabel | UITextField>testView.ios).attributedText.string;
}

export const test_setting_label_textTransform_sets_native = function () {
	const testView = new Label();
	testView.text = initial;
	testView.style.textTransform = 'capitalize';

	executeTransformTest(testView, androidText, iOSText);
};

export const test_setting_textField_textTransform_sets_native = function () {
	if (isIOS) {
		const testView = new TextField();
		testView.text = initial;
		testView.style.textTransform = 'capitalize';

		executeTransformTest(testView, androidText, iOSText);
	}
};

export const test_setting_textView_textTransform_sets_native = function () {
	if (isIOS) {
		const testView = new TextView();
		testView.text = initial;
		testView.style.textTransform = 'capitalize';

		executeTransformTest(testView, androidText, iOSText);
	}
};

export const test_setting_textField_textTransform_and_textDecoration_sets_native = function () {
	if (isIOS) {
		const testView = new TextField();
		testView.text = initial;
		testView.style.textTransform = 'capitalize';
		testView.style.textDecoration = 'underline';

		executeTransformTest(testView, androidText, iOSText);
	}
};

export const test_setting_textView_textTransform_and_textDecoration_sets_native = function () {
	if (isIOS) {
		const testView = new TextView();
		testView.text = initial;
		testView.style.textTransform = 'capitalize';
		testView.style.textDecoration = 'underline';

		executeTransformTest(testView, androidText, iOSText);
	}
};

export const test_setting_button_textTransform_sets_native = function () {
	const testView = new Button();
	testView.text = initial;
	testView.style.textTransform = 'capitalize';

	executeTransformTest(testView, androidText, function (v) {
		return (<UIButton>v.ios).titleForState(UIControlState.Normal);
	});
};

export const test_setting_label_textTransform_and_textDecoration_sets_native = function () {
	const testView = new Label();
	testView.text = initial;
	testView.style.textTransform = 'capitalize';
	testView.style.textDecoration = 'underline';

	executeTransformTest(testView, androidText, iOSText);
};

export const test_setting_button_textTransform_and_textDecoration_sets_native = function () {
	const testView = new Button();
	testView.text = initial;
	testView.style.textTransform = 'capitalize';
	testView.style.textDecoration = 'underline';

	executeTransformTest(testView, androidText, function (v) {
		return (<UIButton>v.ios).attributedTitleForState(UIControlState.Normal).string;
	});
};

export function test_border_color() {
	let testView = new Button();

	let red = new Color('red');
	testView.style.borderColor = red;
	TKUnit.assertEqual(testView.style.borderColor, red, 'all');
	TKUnit.assertEqual(testView.style.borderTopColor, red, 'top');
	TKUnit.assertEqual(testView.style.borderRightColor, red, 'right');
	TKUnit.assertEqual(testView.style.borderBottomColor, red, 'bottom');
	TKUnit.assertEqual(testView.style.borderLeftColor, red, 'left');

	let blue = new Color('blue');
	let hex = blue.hex;
	testView.style.borderColor = hex;
	TKUnit.assertEqual(<any>testView.style.borderColor, blue, 'all');
	TKUnit.assertEqual(testView.style.borderTopColor, blue, 'top');
	TKUnit.assertEqual(testView.style.borderRightColor, blue, 'right');
	TKUnit.assertEqual(testView.style.borderBottomColor, blue, 'bottom');
	TKUnit.assertEqual(testView.style.borderLeftColor, blue, 'left');
}

export function test_border_width() {
	let testView = new Button();

	testView.style.borderWidth = 10;
	TKUnit.assertEqual(testView.style.borderWidth, 10, 'all');
	let expected: Length = { value: 10, unit: 'dip' };
	TKUnit.assertTrue(Length.equals(testView.style.borderTopWidth, expected));
	TKUnit.assertTrue(Length.equals(testView.style.borderRightWidth, expected));
	TKUnit.assertTrue(Length.equals(testView.style.borderBottomWidth, expected));
	TKUnit.assertTrue(Length.equals(testView.style.borderLeftWidth, expected));

	testView.style.borderWidth = '20';
	expected = { value: 20, unit: 'dip' };

	TKUnit.assert(Length.equals(<any>testView.style.borderWidth, expected), 'all');
	TKUnit.assertTrue(Length.equals(testView.style.borderTopWidth, expected));
	TKUnit.assertTrue(Length.equals(testView.style.borderRightWidth, expected));
	TKUnit.assertTrue(Length.equals(testView.style.borderBottomWidth, expected));
	TKUnit.assertTrue(Length.equals(testView.style.borderLeftWidth, expected));
}

export function test_border_radius() {
	let testView = new Button();

	testView.style.borderRadius = 10;
	let expected: Length = { value: 10, unit: 'dip' };

	TKUnit.assertTrue(Length.equals(testView.style.borderRadius, expected), 'all');
	TKUnit.assertTrue(Length.equals(testView.style.borderTopLeftRadius, expected), 'top');
	TKUnit.assertTrue(Length.equals(testView.style.borderTopRightRadius, expected), 'right');
	TKUnit.assertTrue(Length.equals(testView.style.borderBottomRightRadius, expected), 'bottom');
	TKUnit.assertTrue(Length.equals(testView.style.borderBottomLeftRadius, expected), 'left');

	testView.style.borderRadius = '20';
	expected = { value: 20, unit: 'dip' };

	TKUnit.assertTrue(Length.equals(<any>testView.style.borderRadius, expected), 'all');
	TKUnit.assertTrue(Length.equals(testView.style.borderTopLeftRadius, expected), 'top');
	TKUnit.assertTrue(Length.equals(testView.style.borderTopRightRadius, expected), 'right');
	TKUnit.assertTrue(Length.equals(testView.style.borderBottomRightRadius, expected), 'bottom');
	TKUnit.assertTrue(Length.equals(testView.style.borderBottomLeftRadius, expected), 'left');
}

function assertPercentLengthParseInputOutputPairs(pairs: [string, any][]) {
	pairs.forEach((pair: [string, any]) => {
		const output = PercentLength.parse(pair[0]) as LengthPxUnit | LengthPercentUnit;
		TKUnit.assertEqual(pair[1].unit, output.unit, `PercentLength.parse('${pair[0]}') should return unit '${pair[1].unit}' but returned '${output.unit}'`);
		TKUnit.assertEqual(pair[1].value.toFixed(2), output.value.toFixed(2), `PercentLength.parse('${pair[0]}') should return value '${pair[1].value}' but returned '${output.value}'`);
	});
}

export function test_PercentLength_parses_pixel_values_from_string_input() {
	assertPercentLengthParseInputOutputPairs([
		['4px', { unit: 'px', value: 4 }],
		['-4px', { unit: 'px', value: -4 }],
	]);
}

export function test_PercentLength_parses_percentage_values_from_string_input() {
	assertPercentLengthParseInputOutputPairs([
		['4%', { unit: '%', value: 0.04 }],
		['17%', { unit: '%', value: 0.17 }],
		['-27%', { unit: '%', value: -0.27 }],
	]);
}

export function test_PercentLength_parse_throws_given_string_input_it_cannot_parse() {
	const inputs: any[] = ['-l??%', 'qre%', 'undefinedpx', 'undefined', '-frog%'];
	inputs.forEach((input) => {
		TKUnit.assertThrows(() => {
			PercentLength.parse(input);
		}, `PercentLength.parse('${input}') should throw.`);
	});
}

export function test_PercentLength_returns_unsupported_types_untouched() {
	const inputs: any[] = [null, undefined, { baz: true }];
	inputs.forEach((input) => {
		const result = PercentLength.parse(input);
		TKUnit.assertEqual(input, result, `PercentLength.parse(${input}) should return input value`);
	});
}
