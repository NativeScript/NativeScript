import { FontBase, parseFontFamily, genericFontFamilies, parseFont, FontStyle, FontWeight } from "./font-common";
import { enabled as traceEnabled, write as traceWrite, categories as traceCategories, messageType as traceMessageType } from "trace";
import fs = require("file-system");
import * as utils from "utils/utils";

export class Font extends FontBase {
    public static default = new Font(undefined, undefined, FontStyle.NORMAL, FontWeight.NORMAL);

    private _uiFont: UIFont;

    constructor(family: string, size: number, style: FontStyle, weight: FontWeight) {
        super(family, size, style, weight);
    }

    public withFontFamily(family: string): Font {
        return new Font(family, this.fontSize, this.fontStyle, this.fontWeight);
    }

    public withFontStyle(style: FontStyle): Font {
        return new Font(this.fontFamily, this.fontSize, style, this.fontWeight);
    }

    public withFontWeight(weight: FontWeight): Font {
        return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight);
    }

    public withFontSize(size: number): Font {
        return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight);
    }

    public getUIFont(defaultFont: UIFont): UIFont {
        if (!this._uiFont) {
            this._uiFont = createUIFont(this, defaultFont);
        }
        return this._uiFont;
    }

    public getAndroidTypeface(): android.graphics.Typeface {
        return undefined;
    }
}


export const systemFontFamilies = new Set<string>();
export const systemFonts = new Set<string>();

let areSystemFontSetsValid: boolean = false;
export function ensureSystemFontSets() {
    if (areSystemFontSetsValid) {
        return;
    }

    const nsFontFamilies = utils.ios.getter(UIFont, UIFont.familyNames);
    for (let i = 0; i < nsFontFamilies.count; i++) {
        const family = nsFontFamilies.objectAtIndex(i);
        systemFontFamilies.add(family);

        const nsFonts = UIFont.fontNamesForFamilyName(family);
        for (let j = 0; j < nsFonts.count; j++) {
            const font = nsFonts.objectAtIndex(j);
            systemFonts.add(font);
        }
    }
    areSystemFontSetsValid = true;
}

const DEFAULT_SERIF = "Times New Roman";
const DEFAULT_MONOSPACE = "Courier New";

function getFontFamilyRespectingGenericFonts(fontFamily: string): string {
    if (!fontFamily) {
        return fontFamily;
    }

    switch (fontFamily.toLowerCase()) {
        case genericFontFamilies.serif:
            return DEFAULT_SERIF;

        case genericFontFamilies.monospace:
            return DEFAULT_MONOSPACE;

        default:
            return fontFamily;
    }
}

function createUIFont(font: Font, defaultFont: UIFont) {
    let size = font.fontSize || defaultFont.pointSize;
    let descriptor: UIFontDescriptor;

    let symbolicTraits: number = 0;
    if (font.isBold) {
        symbolicTraits |= UIFontDescriptorSymbolicTraits.TraitBold;
    }
    if (font.isItalic) {
        symbolicTraits |= UIFontDescriptorSymbolicTraits.TraitItalic;
    }

    descriptor = tryResolveWithSystemFont(font, size, symbolicTraits);

    if (!descriptor) {
        descriptor = tryResolveByFamily(font);
    }

    if (!descriptor) {
        descriptor = utils.ios.getter(defaultFont, defaultFont.fontDescriptor).fontDescriptorWithSymbolicTraits(symbolicTraits);
    }

    return UIFont.fontWithDescriptorSize(descriptor, size);
}

function tryResolveWithSystemFont(font: Font, size: number, symbolicTraits: number): UIFontDescriptor {
    let systemFont: UIFont;
    let result: UIFontDescriptor;
    switch (font.fontFamily) {
        case genericFontFamilies.sansSerif:
        case genericFontFamilies.system:
            if ((<any>UIFont).systemFontOfSizeWeight) {// This method is available on iOS 8.2 and later.
                systemFont = (<any>UIFont).systemFontOfSizeWeight(size, getiOSFontWeight(font.fontWeight));
            }
            else {
                systemFont = UIFont.systemFontOfSize(size);
            }
            result = utils.ios.getter(systemFont, systemFont.fontDescriptor).fontDescriptorWithSymbolicTraits(symbolicTraits);
            break;

        case genericFontFamilies.monospace:
            if ((<any>UIFont).monospacedDigitSystemFontOfSizeWeight) {// This method is available on iOS 9.0 and later.
                systemFont = (<any>UIFont).monospacedDigitSystemFontOfSizeWeight(size, getiOSFontWeight(font.fontWeight));
                result = utils.ios.getter(systemFont, systemFont.fontDescriptor).fontDescriptorWithSymbolicTraits(symbolicTraits);
            }
            break;
    }

    if (systemFont) {
        result = utils.ios.getter(systemFont, systemFont.fontDescriptor).fontDescriptorWithSymbolicTraits(symbolicTraits);
        return result;
    }

    return null;
}

function tryResolveByFamily(font: Font): UIFontDescriptor {
    const fonts = parseFontFamily(font.fontFamily);
    let result: UIFontDescriptor = null;
    if (fonts.length === 0) {
        return null;
    }

    ensureSystemFontSets();

    for (let i = 0; i < fonts.length; i++) {
        const fontFamily = getFontFamilyRespectingGenericFonts(fonts[i]);
        const fontFace = getiOSFontFace(fontFamily, font.fontWeight, font.isItalic);
        if (systemFonts.has(fontFamily) && !fontFace) { // This is an actual font like `HelveticaNeue-UltraLightItalic` - don't apply font face attribute
            result = UIFontDescriptor.fontDescriptorWithNameSize(fontFamily, 0);
        }
        else if (systemFontFamilies.has(fontFamily)) { // This is a font family like `Helvetica Neue` - apply font face attribute
            result = createFontDescriptor(fontFamily, fontFace);
        }

        if (result) {
            return result;
        }
    }

    return null;
}

function createFontDescriptor(fontFamily: string, fontFace: string): UIFontDescriptor {
    let fontAttributes = NSMutableDictionary.alloc<string, any>().init();
    fontAttributes.setObjectForKey(fontFamily, "NSFontFamilyAttribute");
    if (fontFace) {
        fontAttributes.setObjectForKey(fontFace, "NSFontFaceAttribute");
    }
    return UIFontDescriptor.fontDescriptorWithFontAttributes(fontAttributes);
}

// Available in iOS 8.2 and later. 
declare const UIFontWeightThin: number;       //0.8
declare const UIFontWeightUltraLight: number; //0.6
declare const UIFontWeightLight: number;      //0.4
declare const UIFontWeightRegular: number;    //0
declare const UIFontWeightMedium: number;     //0.23
declare const UIFontWeightSemibold: number;   //0.3
declare const UIFontWeightBold: number;       //0.4
declare const UIFontWeightHeavy: number;      //0.56
declare const UIFontWeightBlack: number;      //0.62

function getiOSFontWeight(fontWeight: FontWeight): number {
    if (!(<any>UIFont).systemFontOfSizeWeight) {
        throw new Error("Font weight is available in iOS 8.2 and later.");
    }

    switch (fontWeight) {
        case FontWeight.THIN:
            return UIFontWeightThin;
        case FontWeight.EXTRA_LIGHT:
            return UIFontWeightUltraLight;
        case FontWeight.LIGHT:
            return UIFontWeightLight;
        case FontWeight.NORMAL:
        case "400":
        case undefined:
        case null:
            return UIFontWeightRegular;
        case FontWeight.MEDIUM:
            return UIFontWeightMedium;
        case FontWeight.SEMI_BOLD:
            return UIFontWeightSemibold;
        case FontWeight.BOLD:
        case "700":
            return UIFontWeightBold;
        case FontWeight.EXTRA_BOLD:
            return UIFontWeightHeavy;
        case FontWeight.BLACK:
            return UIFontWeightBlack;
        default:
            throw new Error(`Invalid font weight: "${fontWeight}"`);
    }
}

function combineWeightStringWithItalic(weight: string, isItalic: boolean) {
    if (!isItalic) {
        return weight;
    }

    if (!weight) {
        return "Italic";
    }

    return weight + " Italic";
}

function canLoadFont(fontFamily: string, fontFace: string) {
    const trialDescriptor = createFontDescriptor(fontFamily, fontFace);
    const trialFont = UIFont.fontWithDescriptorSize(trialDescriptor, 0);
    return trialFont.familyName === fontFamily;
}

function findCorrectWeightString(fontFamily: string, weightStringAlternatives: Array<string>, isItalic: boolean) {
    for (let i = 0, length = weightStringAlternatives.length; i < length; i++) {
        const possibleFontFace = combineWeightStringWithItalic(weightStringAlternatives[i], isItalic);
        if (canLoadFont(fontFamily, possibleFontFace)) {
            return weightStringAlternatives[i];
        }
    }
    return weightStringAlternatives[0];
}

function getiOSFontFace(fontFamily: string, fontWeight: FontWeight, isItalic: boolean): string {
    // ... with a lot of fuzzy logic and artificial intelligence thanks to the lack of font naming standards.
    let weight: string;
    switch (fontWeight) {
        case FontWeight.THIN:
            weight = "Thin";
            break;
        case FontWeight.EXTRA_LIGHT:
            weight = findCorrectWeightString(fontFamily, ["Ultra Light", "UltraLight", "Extra Light", "ExtraLight", "Ultra light", "Ultralight", "Extra light", "Extralight"], isItalic);
            break;
        case FontWeight.LIGHT:
            weight = "Light";
            break;
        case FontWeight.NORMAL:
        case "400":
        case undefined:
        case null:
            weight = ""; // We dont' need to write Regular
            break;
        case FontWeight.MEDIUM:
            weight = "Medium";
            break;
        case FontWeight.SEMI_BOLD:
            weight = findCorrectWeightString(fontFamily, ["Demi Bold", "DemiBold", "Semi Bold", "SemiBold", "Demi bold", "Demibold", "Semi bold", "Semibold"], isItalic);
            break;
        case FontWeight.BOLD:
        case "700":
            weight = "Bold";
            break;
        case FontWeight.EXTRA_BOLD:
            weight = findCorrectWeightString(fontFamily, ["Heavy", "Extra Bold", "ExtraBold", "Extra bold", "Extrabold"], isItalic);
            break;
        case FontWeight.BLACK:
            weight = "Black";
            break;
        default:
            throw new Error(`Invalid font weight: "${fontWeight}"`);
    }

    return combineWeightStringWithItalic(weight, isItalic);
}

export module ios {
    export function registerFont(fontFile: string) {
        let filePath = fs.path.join(fs.knownFolders.currentApp().path, "fonts", fontFile);
        if (!fs.File.exists(filePath)) {
            filePath = fs.path.join(fs.knownFolders.currentApp().path, fontFile);
        }
        const fontData = utils.ios.getter(NSFileManager, NSFileManager.defaultManager).contentsAtPath(filePath);
        if (!fontData) {
            throw new Error("Could not load font from: " + fontFile);
        }
        const provider = CGDataProviderCreateWithCFData(fontData);
        const font = CGFontCreateWithDataProvider(provider);

        if (!font) {
            throw new Error("Could not load font from: " + fontFile);
        }

        const error = new interop.Reference<NSError>();
        if (!CTFontManagerRegisterGraphicsFont(font, error)) {
           

            if (traceEnabled) {
                traceWrite("Error occur while registering font: " + CFErrorCopyDescription(<NSError>error.value), traceCategories.Error, traceMessageType.error);
            }
        }

        areSystemFontSetsValid = false;
    }
}

function registerFontsInFolder(fontsFolderPath) {
    const fontsFolder = fs.Folder.fromPath(fontsFolderPath);

    fontsFolder.eachEntity((fileEntity: fs.FileSystemEntity) => {
        if (fs.Folder.exists(fs.path.join(fontsFolderPath, fileEntity.name))) {
            return true;
        }

        if (fileEntity instanceof fs.File &&
            ((<fs.File>fileEntity).extension === ".ttf" || (<fs.File>fileEntity).extension === ".otf")) {
            ios.registerFont(fileEntity.name);
        }
        return true;
    });
}

function registerCustomFonts() {
    const appDir = fs.knownFolders.currentApp().path
    const fontsDir = fs.path.join(appDir, "fonts");
    if (fs.Folder.exists(fontsDir)) {
        registerFontsInFolder(fontsDir);
    }
}

registerCustomFonts();