import { Font as FontBase, parseFontFamily, FontStyle, FontWeight, FontStyleType, FontWeightType } from './font-common';
import { Trace } from '../../trace';
import * as fs from '../../file-system';
export * from './font-common';

interface FontDescriptor {
	fontFamily: string[];
	fontSize: number;
	fontWeight: number;
	isBold: boolean;
	isItalic: boolean;
}

const uiFontCache = new Map<string, UIFont>();

function computeFontCacheKey(fontDescriptor: FontDescriptor) {
	const { fontFamily, fontSize, fontWeight, isBold, isItalic } = fontDescriptor;
	const sep = ':';
	return fontFamily.join(sep) + sep + fontSize + sep + fontWeight + sep + isBold + sep + isItalic;
}

function getUIFontCached(fontDescriptor: FontDescriptor) {
	const cacheKey = computeFontCacheKey(fontDescriptor);

	if (uiFontCache.has(cacheKey)) {
		if (Trace.isEnabled()) {
			Trace.write(`UIFont reuse from cache: ${JSON.stringify(fontDescriptor)}, cache size: ${uiFontCache.size}`, Trace.categories.Style, Trace.messageType.info);
		}
		return uiFontCache.get(cacheKey);
	}
	const uiFont = NativeScriptUtils.createUIFont(fontDescriptor as any);
	uiFontCache.set(cacheKey, uiFont);
	if (Trace.isEnabled()) {
		Trace.write(`UIFont creation: ${JSON.stringify(fontDescriptor)}, cache size: ${uiFontCache.size}`, Trace.categories.Style, Trace.messageType.info);
	}

	return uiFont;
}

export class Font extends FontBase {
	public static default = new Font(undefined, undefined);

	constructor(family: string, size: number, style?: FontStyleType, weight?: FontWeightType, scale?: number) {
		super(family, size, style, weight, scale);
	}

	public withFontFamily(family: string): Font {
		return new Font(family, this.fontSize, this.fontStyle, this.fontWeight, this.fontScale);
	}

	public withFontStyle(style: FontStyleType): Font {
		return new Font(this.fontFamily, this.fontSize, style, this.fontWeight, this.fontScale);
	}

	public withFontWeight(weight: FontWeightType): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight, this.fontScale);
	}

	public withFontSize(size: number): Font {
		return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight, this.fontScale);
	}

	public withFontScale(scale: number): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, this.fontWeight, scale);
	}

	public getUIFont(defaultFont: UIFont): UIFont {
		return getUIFontCached({
			fontFamily: parseFontFamily(this.fontFamily),
			fontSize: this.fontSize || defaultFont.pointSize,
			fontWeight: getNativeFontWeight(this.fontWeight),
			isBold: this.isBold,
			isItalic: this.isItalic,
		});
	}

	public getAndroidTypeface(): android.graphics.Typeface {
		return undefined;
	}
}

function getNativeFontWeight(fontWeight: FontWeightType): number {
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
