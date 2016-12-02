import { FontBase, parseFontFamily, genericFontFamilies, parseFont } from "./font-common";
import { enabled as traceEnabled, write as traceWrite, categories as traceCategories, messageType as traceMessageType } from "trace";
import fs = require("file-system");
import * as utils from "utils/utils";

export class Font extends FontBase {
    public static default = new Font(undefined, undefined, "normal", "normal");

    private _uiFont: UIFont;

    constructor(family: string, size: number, style: "normal" | "italic", weight: "100" | "200" | "300" | "normal" | "400" | "500" | "600" | "bold" | "700" | "800" | "900") {
        super(family, size, style, weight);
    }

    public withFontFamily(family: string): Font {
        return new Font(family, this.fontSize, this.fontStyle, this.fontWeight);
    }

    public withFontStyle(style: "normal" | "italic"): Font {
        return new Font(this.fontFamily, this.fontSize, style, this.fontWeight);
    }

    public withFontWeight(weight: "100" | "200" | "300" | "normal" | "400" | "500" | "600" | "bold" | "700" | "800" | "900"): Font {
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

function getiOSFontWeight(fontWeight: string): number {
    if (!(<any>UIFont).systemFontOfSizeWeight) {
        throw new Error("Font weight is available in iOS 8.2 and later.");
    }

    switch (fontWeight) {
        case "100":
            return UIFontWeightThin;
        case "200":
            return UIFontWeightUltraLight;
        case "300":
            return UIFontWeightLight;
        case "normal":
        case "400":
        case undefined:
        case null:
            return UIFontWeightRegular;
        case "500":
            return UIFontWeightMedium;
        case "600":
            return UIFontWeightSemibold;
        case "bold":
        case "700":
            return UIFontWeightBold;
        case "800":
            return UIFontWeightHeavy;
        case "900":
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

function getiOSFontFace(fontFamily: string, fontWeight: string, isItalic: boolean): string {
    // ... with a lot of fuzzy logic and artificial intelligence thanks to the lack of font naming standards.
    let weight: string;
    switch (fontWeight) {
        case "100":
            weight = "Thin";
            break;
        case "200":
            weight = findCorrectWeightString(fontFamily, ["Ultra Light", "UltraLight", "Extra Light", "ExtraLight", "Ultra light", "Ultralight", "Extra light", "Extralight"], isItalic);
            break;
        case "300":
            weight = "Light";
            break;
        case "normal":
        case "400":
        case undefined:
        case null:
            weight = ""; // We dont' need to write Regular
            break;
        case "500":
            weight = "Medium";
            break;
        case "600":
            weight = findCorrectWeightString(fontFamily, ["Demi Bold", "DemiBold", "Semi Bold", "SemiBold", "Demi bold", "Demibold", "Semi bold", "Semibold"], isItalic);
            break;
        case "bold":
        case "700":
            weight = "Bold";
            break;
        case "800":
            weight = findCorrectWeightString(fontFamily, ["Heavy", "Extra Bold", "ExtraBold", "Extra bold", "Extrabold"], isItalic);
            break;
        case "900":
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