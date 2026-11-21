import { Label, TextField, TextView, StackLayout } from '@nativescript/core';
import { Font } from '@nativescript/core/ui/styling/font';
import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';

type TextControl = Label | TextField | TextView;

const css = `
Label, TextField, TextView { font-family: 'SN Pro'; font-size: 24; }
.medium { font-weight: 500; }
.semibold { font-weight: 600; }
.bold { font-weight: 700; }
`;

function coordinate(font: UIFont): number | undefined {
	const axes = CTFontCopyVariationAxes(font);
	for (let index = 0; index < (axes?.count ?? 0); index++) {
		const axis: NSDictionary<string, unknown> = axes.objectAtIndex(index);
		if (Number(axis.objectForKey(kCTFontVariationAxisIdentifierKey)) === 0x77676874) {
			return Number(CTFontCopyVariation(font)?.objectForKey(0x77676874) ?? axis.objectForKey(kCTFontVariationAxisDefaultValueKey));
		}
	}
	return undefined;
}

function nativeFont(control: TextControl): UIFont {
	const native: UILabel | UITextField | UITextView = control.ios;
	return native.font;
}

function assertWeight(controls: TextControl[], expected: number) {
	for (const control of controls) {
		const font = nativeFont(control);
		TKUnit.assertEqual(font.familyName, 'SN Pro');
		TKUnit.assertAreClose(coordinate(font), expected, 0.5, control.typeName + ' weight');
		TKUnit.assertAreClose(font.pointSize, 24, 0.5);
	}
}

function withControls(test: (controls: TextControl[], parent: StackLayout) => void) {
	const parent = new StackLayout();
	const controls: TextControl[] = [new Label(), new TextField(), new TextView()];
	for (const control of controls) {
		control.text = 'Variable font weight';
		parent.addChild(control);
	}
	helper.buildUIAndRunTest(parent, () => test(controls, parent), { pageCss: css });
}

export function test_variable_font_default_and_computed_weights() {
	withControls((controls) => {
		// SN Pro defaults to 200; normal CSS must still select 400.
		assertWeight(controls, 400);
		for (const [className, expected] of [
			['medium', 500],
			['semibold', 600],
			['bold', 700],
		] as const) {
			for (const control of controls) {
				control.className = className;
			}
			assertWeight(controls, expected);
		}
		for (const control of controls) {
			control.fontWeight = '100';
		}
		assertWeight(controls, 200);
	});
}

export function test_variable_font_inheritance_and_retained_updates() {
	withControls((controls, parent) => {
		const natives = controls.map((control) => control.ios);
		parent.className = 'bold';
		for (const control of controls) {
			control.className = 'semibold';
		}
		assertWeight(controls, 600);
		for (const control of controls) {
			control.className = 'medium';
		}
		assertWeight(controls, 500);
		for (const control of controls) {
			control.className = '';
		}
		assertWeight(controls, 700);
		parent.className = '';
		assertWeight(controls, 400);
		for (const control of controls) {
			control.fontFamily = 'Courier';
			TKUnit.assertEqual(nativeFont(control).familyName, 'Courier');
			TKUnit.assertEqual(coordinate(nativeFont(control)), undefined);
			control.fontFamily = 'SN Pro';
		}
		assertWeight(controls, 400);
		controls.forEach((control, index) => TKUnit.assertEqual(control.ios, natives[index]));
	});
}

export function test_variable_font_explicit_axis_precedence_and_removal() {
	withControls((controls) => {
		for (const control of controls) {
			control.className = 'bold';
			control.style.fontVariationSettings = [{ axis: 'wght', value: 550 }];
		}
		assertWeight(controls, 550);
		for (const control of controls) {
			control.className = 'medium';
		}
		assertWeight(controls, 550);
		for (const control of controls) {
			control.style.fontVariationSettings = null;
		}
		assertWeight(controls, 500);
	});

	const font = new Font('SN Pro', 24, 'normal', '700', 1.5, [{ axis: 'wght', value: 550 }]);
	const resolved = font.getUIFont(UIFont.systemFontOfSize(17));
	TKUnit.assertAreClose(coordinate(resolved), 550, 0.5);
	TKUnit.assertAreClose(resolved.pointSize, 36, 0.5);
	TKUnit.assertEqual(font.fontVariationSettings.length, 1);
	const derived = font.withFontVariationSettings(null);
	TKUnit.assertAreClose(coordinate(derived.getUIFont(UIFont.systemFontOfSize(17))), 700, 0.5);
	TKUnit.assertNull(derived.fontVariationSettings);
}
