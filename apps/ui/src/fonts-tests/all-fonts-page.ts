import { View } from '@nativescript/core/ui/core/view';
import { Page, NavigatedData } from '@nativescript/core/ui/page';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { ScrollView } from '@nativescript/core/ui/scroll-view';
import { Label } from '@nativescript/core/ui/label';
import { FontStyle, FontWeight } from '@nativescript/core/ui/enums';
import * as typeUtils from '@nativescript/core/utils/types';
import { Color } from '@nativescript/core/color';
import { isIOS } from '@nativescript/core/platform';

const genericFontFamilies = ['system', 'sans-serif', 'serif', 'monospace'];
let fontFamilies = [];
let fontNames = [];
const embeddedFontNames = ['FontAwesome', 'Pacifico', 'Sofia'];
const fontStyles = [FontStyle.normal, FontStyle.italic];
const fontWeights = [FontWeight.thin, FontWeight.extraLight, FontWeight.light, FontWeight.normal, FontWeight.medium, FontWeight.semiBold, FontWeight.bold, FontWeight.extraBold, FontWeight.black];

let green = new Color('Green');
let red = new Color('Red');
let white = new Color('White');
let black = new Color('Black');

let compareIgnoreCase = function (a, b) {
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
	let page = <Page>args.object;
	let scrollView = new ScrollView();
	let stackLayout = new StackLayout();
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
				let view = prepareLabel(genericFontFamilies[f], fontStyles[s], fontWeights[w]);
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
				let view = prepareLabel(fontFamilies[f], fontStyles[s], fontWeights[w]);
				layout.addChild(view);
			}
		}
	}

	if (fontNames.length > 0) {
		layout.addChild(prepareTitle('Phone Fonts', 24));
	}
	for (let f = 0; f < fontNames.length; f++) {
		let view = prepareLabel(fontNames[f], 'normal', 'normal');
		layout.addChild(view);
	}

	if (embeddedFontNames.length > 0) {
		layout.addChild(prepareTitle('Embedded Fonts', 24));
	}
	for (let f = 0; f < embeddedFontNames.length; f++) {
		let view = prepareLabel(embeddedFontNames[f], 'normal', 'normal');
		layout.addChild(view);
	}
}

function prepareTitle(text: string, fontSize: number) {
	let title = new Label();
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
	let label = new Label();
	label['font-family'] = fontFamily;
	let fontFamilyCss = `font-family: ${fontFamily}; `;
	let fontStyleCss = fontStyle !== FontStyle.normal ? `font-style: ${fontStyle}; ` : '';
	let fontWeightCss = fontWeight !== FontWeight.normal ? `font-weight: ${fontWeight}; ` : '';
	let css = `${fontFamilyCss}${fontStyleCss}${fontWeightCss}`;
	label.text = `${typeUtils.getClass(label)} {${css}};`;
	label.textWrap = true;
	label.style.textAlignment = 'left';
	label.borderWidth = 1;
	label.borderColor = black;
	label.style.padding = '2';
	label.setInlineStyle(css);
	label.on('loaded', (args) => {
		let sender = <Label>args.object;
		if (sender.ios) {
			let uiFont = _getUIFont(label);
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
