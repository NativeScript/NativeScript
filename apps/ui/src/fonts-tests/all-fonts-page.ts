import { View } from '@nativescript/core/ui/core/view';
import { Page, NavigatedData } from '@nativescript/core/ui/page';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { ScrollView } from '@nativescript/core/ui/scroll-view';
import { Label } from '@nativescript/core/ui/label';
import { CoreTypes } from '@nativescript/core';
import * as typeUtils from '@nativescript/core/utils/types';
import { Color } from '@nativescript/core/color';
import { isIOS } from '@nativescript/core/platform';

const genericFontFamilies = ['system', 'sans-serif', 'serif', 'monospace'];
let fontFamilies = [];
let fontNames = [];
const embeddedFontNames = ['FontAwesome', 'Pacifico', 'Sofia'];
const fontStyles = [CoreTypes.FontStyle.normal, CoreTypes.FontStyle.italic];
const fontWeights = [CoreTypes.FontWeight.thin, CoreTypes.FontWeight.extraLight, CoreTypes.FontWeight.light, CoreTypes.FontWeight.normal, CoreTypes.FontWeight.medium, CoreTypes.FontWeight.semiBold, CoreTypes.FontWeight.bold, CoreTypes.FontWeight.extraBold, CoreTypes.FontWeight.black];

const green = new Color('Green');
const red = new Color('Red');
const white = new Color('White');
const black = new Color('Black');

const compareIgnoreCase = function (a, b) {
	return a.toLowerCase().localeCompare(b.toLowerCase());
};

if (isIOS) {
	const nsFontFamilies = UIFont.familyNames;
	for (let i = 0; i < nsFontFamilies.count; i++) {
		const family = nsFontFamilies.objectAtIndex(i);
		fontFamilies.push(family);

		const nsFonts = UIFont.fontNamesForFamilyName(family);
		for (let j = 0; j < nsFonts.count; j++) {
			const font = nsFonts.objectAtIndex(j);
			fontNames.push(font);
		}
	}

	fontFamilies = fontFamilies.sort(compareIgnoreCase);
	fontNames = fontNames.sort(compareIgnoreCase);
}

export function onPageLoaded(args: NavigatedData) {
	const page = <Page>args.object;
	const scrollView = new ScrollView();
	const stackLayout = new StackLayout();
	generateLabels(stackLayout);
	scrollView.content = stackLayout;
	page.content = scrollView;
}

function generateLabels(layout: StackLayout) {
	layout.addChild(prepareTitle('Generic Font Families', 24));
	for (let f = 0; f < genericFontFamilies.length; f++) {
		layout.addChild(prepareTitle(genericFontFamilies[f], 20));
		for (let s = 0; s < fontStyles.length; s++) {
			for (let w = 0; w < fontWeights.length; w++) {
				const view = prepareLabel(genericFontFamilies[f], fontStyles[s], fontWeights[w]);
				layout.addChild(view);
			}
		}
	}

	if (fontFamilies.length > 0) {
		layout.addChild(prepareTitle('Font Families', 24));
	}
	for (let f = 0; f < fontFamilies.length; f++) {
		layout.addChild(prepareTitle(fontFamilies[f], 20));
		for (let s = 0; s < fontStyles.length; s++) {
			for (let w = 0; w < fontWeights.length; w++) {
				const view = prepareLabel(fontFamilies[f], fontStyles[s], fontWeights[w]);
				layout.addChild(view);
			}
		}
	}

	if (fontNames.length > 0) {
		layout.addChild(prepareTitle('Phone Fonts', 24));
	}
	for (let f = 0; f < fontNames.length; f++) {
		const view = prepareLabel(fontNames[f], 'normal', 'normal');
		layout.addChild(view);
	}

	if (embeddedFontNames.length > 0) {
		layout.addChild(prepareTitle('Embedded Fonts', 24));
	}
	for (let f = 0; f < embeddedFontNames.length; f++) {
		const view = prepareLabel(embeddedFontNames[f], 'normal', 'normal');
		layout.addChild(view);
	}
}

function prepareTitle(text: string, fontSize: number) {
	const title = new Label();
	title.text = text;
	title.height = 100;
	title.backgroundColor = black;
	title.color = white;
	title.fontSize = fontSize;
	title.style.fontStyle = 'italic';
	title.borderWidth = 1;
	title.borderColor = white;
	title.textAlignment = 'center';

	return title;
}

function prepareLabel(fontFamily: string, fontStyle: string, fontWeight: string): View {
	const label = new Label();
	label['font-family'] = fontFamily;
	const fontFamilyCss = `font-family: ${fontFamily}; `;
	const fontStyleCss = fontStyle !== CoreTypes.FontStyle.normal ? `font-style: ${fontStyle}; ` : '';
	const fontWeightCss = fontWeight !== CoreTypes.FontWeight.normal ? `font-weight: ${fontWeight}; ` : '';
	const css = `${fontFamilyCss}${fontStyleCss}${fontWeightCss}`;
	label.text = `${typeUtils.getClass(label)} {${css}};`;
	label.textWrap = true;
	label.style.textAlignment = 'left';
	label.borderWidth = 1;
	label.borderColor = black;
	label.style.padding = '2';
	label.setInlineStyle(css);
	label.on('loaded', (args) => {
		const sender = <Label>args.object;
		if (sender.ios) {
			const uiFont = _getUIFont(label);
			sender.text += `\niOS Font: ${uiFont.fontName};`;
			if (genericFontFamilies.indexOf(fontFamily) !== -1) {
				return;
			}
			if (uiFont.fontName.replace(' ', '').indexOf((<string>sender['font-family']).replace(' ', '')) !== -1) {
				sender.color = green;
			} else {
				sender.color = red;
			}
		}
	});
	if (fontFamily === 'FontAwesome') {
		label.text += '\uF17B\uF10B';
	}

	return label;
}

function _getUIFont(view: any): UIFont {
	if (view.ios) {
		if (view.ios instanceof UIButton) {
			return view.ios.titleLabel.font;
		} else if (view.ios.font) {
			return view.ios.font;
		}
	}
}
