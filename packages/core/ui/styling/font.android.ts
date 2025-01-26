import { Font as FontBase, parseFontFamily, genericFontFamilies, FontWeight, FontVariationSettings, FONTS_BASE_PATH } from './font-common';
import { FontStyleType, FontWeightType, FontVariationSettingsType } from './font-interfaces';
import { Trace } from '../../trace';
import { SDK_VERSION } from '../../utils/constants';
import * as fs from '../../file-system';
import { ad } from '../../utils';

export * from './font-common';

const typefaceCache = new Map<string, android.graphics.Typeface>();
let appAssets: android.content.res.AssetManager;

export class Font extends FontBase {
	static default = new Font(undefined, undefined);

	private _typeface: android.graphics.Typeface;

	public withFontFamily(family: string): Font {
		return new Font(family, this.fontSize, this.fontStyle, this.fontWeight, 1, this.fontVariationSettings);
	}

	public withFontStyle(style: FontStyleType): Font {
		return new Font(this.fontFamily, this.fontSize, style, this.fontWeight, 1, this.fontVariationSettings);
	}

	public withFontWeight(weight: FontWeightType): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight, 1, this.fontVariationSettings);
	}

	public withFontSize(size: number): Font {
		return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight, 1, this.fontVariationSettings);
	}

	public withFontScale(scale: number): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, this.fontWeight, 1, this.fontVariationSettings);
	}

	public withFontVariationSettings(variationSettings: Array<FontVariationSettingsType> | null): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, this.fontWeight, 1, variationSettings);
	}

	getAndroidTypeface(): android.graphics.Typeface {
		if (!this._typeface) {
			this._typeface = createTypeface(this);
		}

		return this._typeface;
	}

	getUIFont(defaultFont: any): any {
		return undefined;
	}
}

function computeFontCacheKey(fontFamily: string, font: Font) {
	const sep = ':';
	return [fontFamily, String(FontVariationSettings.toString(font.fontVariationSettings)).replace(/'/g, '').replace(/[\s,]/g, '_')].join(sep);
}

function loadFontFromFile(fontFamily: string, font: Font): android.graphics.Typeface {
	const cacheKey = SDK_VERSION >= 26 ? computeFontCacheKey(fontFamily, font) : fontFamily;

	appAssets = appAssets || (ad.getApplicationContext() as android.content.Context).getAssets();
	if (!appAssets) {
		return null;
	}

	let result: android.graphics.Typeface;

	if (typefaceCache.has(cacheKey)) {
		result = typefaceCache.get(cacheKey);
	} else {
		const basePath = fs.path.join(fs.knownFolders.currentApp().path, FONTS_BASE_PATH, fontFamily);

		let fontAssetPath: string;

		if (fs.File.exists(basePath + '.ttf')) {
			fontAssetPath = basePath + '.ttf';
		} else if (fs.File.exists(basePath + '.otf')) {
			fontAssetPath = basePath + '.otf';
		} else {
			fontAssetPath = null;

			if (Trace.isEnabled()) {
				Trace.write('Could not find font file for ' + fontFamily, Trace.categories.Error, Trace.messageType.error);
			}
		}

		result = null; // Default

		if (fontAssetPath) {
			try {
				if (SDK_VERSION >= 26) {
					const builder = new android.graphics.Typeface.Builder(fontAssetPath);
					if (builder) {
						builder.setFontVariationSettings(font.fontVariationSettings?.length ? FontVariationSettings.toString(font.fontVariationSettings) : '');
						result = builder.build();
					} else {
						result = android.graphics.Typeface.createFromFile(fontAssetPath);
						if (Trace.isEnabled()) {
							Trace.write('Could not create builder for ' + fontFamily, Trace.categories.Error, Trace.messageType.error);
						}
					}
				} else {
					result = android.graphics.Typeface.createFromFile(fontAssetPath);
				}
			} catch (e) {
				if (Trace.isEnabled()) {
					Trace.write('Error loading font asset: ' + fontAssetPath, Trace.categories.Error, Trace.messageType.error);
				}
			}
		}

		// The value will be null if there has already been an attempt to load the font but failed
		typefaceCache.set(cacheKey, result);
	}

	return result;
}

function createTypeface(font: Font): android.graphics.Typeface {
	const fontFamilies = parseFontFamily(font.fontFamily);
	const fontWeight = font.fontWeight;
	const isNumericFontWeightSupported = SDK_VERSION >= 28;

	let result: android.graphics.Typeface;
	let fontStyle: number = 0;
	// https://stackoverflow.com/questions/19691530/valid-values-for-androidfontfamily-and-what-they-map-to
	let fontSuffix: string;

	if (isNumericFontWeightSupported) {
		fontSuffix = '';
	} else {
		if (font.isBold) {
			fontStyle |= android.graphics.Typeface.BOLD;
		}
		if (font.isItalic) {
			fontStyle |= android.graphics.Typeface.ITALIC;
		}

		fontSuffix = getFontWeightSuffix(fontWeight);
	}

	for (const fontFamily of fontFamilies) {
		switch (fontFamily.toLowerCase()) {
			case genericFontFamilies.serif:
				result = android.graphics.Typeface.create('serif' + fontSuffix, fontStyle);
				break;
			case genericFontFamilies.sansSerif:
			case genericFontFamilies.system:
				result = android.graphics.Typeface.create('sans-serif' + fontSuffix, fontStyle);
				break;
			case genericFontFamilies.monospace:
				result = android.graphics.Typeface.create('monospace' + fontSuffix, fontStyle);
				break;
			default: {
				result = loadFontFromFile(fontFamily, font);
				if (result && fontStyle) {
					result = android.graphics.Typeface.create(result, fontStyle);
				}
				break;
			}
		}

		// Found the font!
		if (result) {
			break;
		}
	}

	if (!result) {
		result = android.graphics.Typeface.create('sans-serif' + fontSuffix, fontStyle);
	}

	// Newer android versions can accept a numeric font weight
	if (isNumericFontWeightSupported) {
		result = android.graphics.Typeface.create(result, getNumericFontWeight(fontWeight), font.isItalic);
	}

	return result;
}

function getFontWeightSuffix(fontWeight: FontWeightType): string {
	if (typeof fontWeight === 'number') {
		fontWeight = (fontWeight + '') as any;
	}
	switch (fontWeight) {
		case FontWeight.THIN:
			return SDK_VERSION >= 16 ? '-thin' : '';
		case FontWeight.EXTRA_LIGHT:
		case FontWeight.LIGHT:
			return SDK_VERSION >= 16 ? '-light' : '';
		case FontWeight.NORMAL:
		case '400':
		case undefined:
		case null:
			return '';
		case FontWeight.MEDIUM:
		case FontWeight.SEMI_BOLD:
			return SDK_VERSION >= 21 ? '-medium' : '';
		case FontWeight.BOLD:
		case '700':
		case FontWeight.EXTRA_BOLD:
			return '';
		case FontWeight.BLACK:
			return SDK_VERSION >= 21 ? '-black' : '';
		default:
			throw new Error(`Invalid font weight: "${fontWeight}"`);
	}
}

function getNumericFontWeight(fontWeight: FontWeightType): number {
	let value: number;

	if (typeof fontWeight === 'number') {
		value = fontWeight;
	} else {
		switch (fontWeight) {
			case FontWeight.NORMAL:
			case undefined:
			case null:
				value = 400;
				break;
			case FontWeight.BOLD:
				value = 700;
				break;
			default:
				value = parseInt(fontWeight);
				break;
		}
	}

	return value;
}
