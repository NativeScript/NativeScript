import { FontBase, parseFontFamily, FontWeight, FontVariationSettings, fuzzySearch } from './font-common';
import { FontStyleType, FontWeightType, FontVariationSettingsType } from './font-interfaces';
import { Trace } from '../../trace';
import * as fs from '../../file-system';
export { FontStyle, FontWeight, FontVariationSettings, parseFont } from './font-common';

interface FontDescriptor {
	fontFamily: string[];
	fontSize: number;
	fontWeight: number;
	fontVariationSettings: Array<FontVariationSettingsType> | null;
	isBold: boolean;
	isItalic: boolean;
}

type FontVariationAxisType = 'kCGFontVariationAxisDefaultValue' | 'kCGFontVariationAxisMaxValue' | 'kCGFontVariationAxisMinValue' | 'kCGFontVariationAxisName';

const uiFontCache = new Map<string, UIFont>();

function computeFontCacheKey(fontDescriptor: FontDescriptor) {
	const { fontFamily, fontSize, fontWeight, fontVariationSettings, isBold, isItalic } = fontDescriptor;
	const sep = ':';
	return [fontFamily.join(sep), fontSize, fontWeight, String(FontVariationSettings.toString(fontVariationSettings)).replace(/'/g, '').replace(/[\s,]/g, '_'), isBold, isItalic].join(sep);
}

function getUIFontCached(fontDescriptor: FontDescriptor) {
	const cacheKey = computeFontCacheKey(fontDescriptor);

	if (uiFontCache.has(cacheKey)) {
		if (Trace.isEnabled()) {
			Trace.write(`UIFont reuse from cache: ${JSON.stringify(fontDescriptor)}, cache size: ${uiFontCache.size}`, Trace.categories.Style, Trace.messageType.info);
		}
		return uiFontCache.get(cacheKey);
	}
	let uiFont = NativeScriptUtils.createUIFont(fontDescriptor as any);
	if (fontDescriptor.fontVariationSettings?.length) {
		let font = CGFontCreateWithFontName(uiFont.fontName);
		const variationAxes: NSArray<NSDictionary<FontVariationAxisType, string | number>> = CGFontCopyVariationAxes(font);
		// This can be null if font doesn't support axes
		if (variationAxes?.count) {
			const variationSettings = NSMutableDictionary.new();
			const variationAxesCount = variationAxes.count;
			const variationAxesNames: string[] = [];

			for (let i = 0, length = variationAxes.count; i < length; i++) {
				variationAxesNames.push(String(variationAxes[i].objectForKey('kCGFontVariationAxisName')));
			}

			for (const variationSetting of fontDescriptor.fontVariationSettings) {
				const axisName = fuzzySearch(variationSetting.axis, variationAxesNames);
				if (axisName?.length) {
					variationSettings.setValueForKey(variationSetting.value, axisName[0]);
				}
			}

			font = CGFontCreateCopyWithVariations(font, variationSettings);
			uiFont = CTFontCreateWithGraphicsFont(font, fontDescriptor.fontSize, null, null);
		}
	}

	uiFontCache.set(cacheKey, uiFont);
	if (Trace.isEnabled()) {
		Trace.write(`UIFont creation: ${JSON.stringify(fontDescriptor)}, cache size: ${uiFontCache.size}`, Trace.categories.Style, Trace.messageType.info);
	}

	return uiFont;
}

export class Font extends FontBase {
	static default = new Font(undefined, undefined);

	constructor(family: string, size: number, style?: FontStyleType, weight?: FontWeightType, scale?: number, variationSettings?: Array<FontVariationSettingsType>) {
		super(family, size, style, weight, scale, variationSettings);
	}

	getUIFont(defaultFont: UIFont): UIFont {
		return getUIFontCached({
			fontFamily: parseFontFamily(this.fontFamily),
			// Apply a11y scale and calculate proper font size (avoid applying multiplier to native point size as it's messing calculations)
			fontSize: this.fontSize ? this.fontSize * this.fontScale : defaultFont.pointSize * this.fontScale,
			fontWeight: getNativeFontWeight(this.fontWeight),
			fontVariationSettings: this.fontVariationSettings,
			isBold: this.isBold,
			isItalic: this.isItalic,
		});
	}

	getAndroidTypeface(): android.graphics.Typeface {
		return undefined;
	}
}

function getNativeFontWeight(fontWeight: FontWeightType): number {
	if (typeof fontWeight === 'number') {
		fontWeight = (fontWeight + '') as any;
	}
	switch (fontWeight) {
		case FontWeight.THIN:
			return UIFontWeightUltraLight;
		case FontWeight.EXTRA_LIGHT:
			return UIFontWeightThin;
		case FontWeight.LIGHT:
			return UIFontWeightLight;
		case FontWeight.NORMAL:
		case '400':
		case undefined:
		case null:
			return UIFontWeightRegular;
		case FontWeight.MEDIUM:
			return UIFontWeightMedium;
		case FontWeight.SEMI_BOLD:
			return UIFontWeightSemibold;
		case FontWeight.BOLD:
		case '700':
			return UIFontWeightBold;
		case FontWeight.EXTRA_BOLD:
			return UIFontWeightHeavy;
		case FontWeight.BLACK:
			return UIFontWeightBlack;
		default:
			console.log(`Invalid font weight: "${fontWeight}"`);
	}
}

export namespace ios {
	export function registerFont(fontFile: string) {
		let filePath = fs.path.join(fs.knownFolders.currentApp().path, 'fonts', fontFile);
		if (!fs.File.exists(filePath)) {
			filePath = fs.path.join(fs.knownFolders.currentApp().path, fontFile);
		}
		const fontData = NSFileManager.defaultManager.contentsAtPath(filePath);
		if (!fontData) {
			throw new Error('Could not load font from: ' + fontFile);
		}
		const provider = CGDataProviderCreateWithCFData(fontData);
		const font = CGFontCreateWithDataProvider(provider);

		if (!font) {
			throw new Error('Could not load font from: ' + fontFile);
		}

		const error = new interop.Reference<NSError>();
		if (!CTFontManagerRegisterGraphicsFont(font, error)) {
			if (Trace.isEnabled()) {
				Trace.write('Error occur while registering font: ' + CFErrorCopyDescription(<NSError>error.value), Trace.categories.Error, Trace.messageType.error);
			}
		}
	}
}

function registerFontsInFolder(fontsFolderPath) {
	const fontsFolder = fs.Folder.fromPath(fontsFolderPath);

	fontsFolder.eachEntity((fileEntity: fs.FileSystemEntity) => {
		if (fs.Folder.exists(fs.path.join(fontsFolderPath, fileEntity.name))) {
			return true;
		}
		if (fileEntity instanceof fs.File && ((<fs.File>fileEntity).extension === '.ttf' || (<fs.File>fileEntity).extension === '.otf')) {
			ios.registerFont(fileEntity.name);
		}

		return true;
	});
}

function registerCustomFonts() {
	const appDir = fs.knownFolders.currentApp().path;
	const fontsDir = fs.path.join(appDir, 'fonts');
	if (fs.Folder.exists(fontsDir)) {
		registerFontsInFolder(fontsDir);
	}
}
registerCustomFonts();
