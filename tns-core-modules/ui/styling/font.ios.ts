import enums = require("ui/enums");
import common = require("./font-common");
import fs = require("file-system");
import * as traceModule from "trace";

export class Font extends common.Font {
    public static default = new Font(undefined, undefined, enums.FontStyle.normal, enums.FontWeight.normal);

    private _uiFont: UIFont;

    constructor(family: string, size: number, style: string, weight: string) {
        super(family, size, style, weight);
    }

    public getUIFont(defaultFont: UIFont): UIFont {
        if (!this._uiFont) {
            this._uiFont = createUIFont(this, defaultFont);
        }
        return this._uiFont;
    }

    public withFontFamily(family: string): Font {
        return new Font(family, this.fontSize, this.fontStyle, this.fontWeight);
    }

    public withFontStyle(style: string): Font {
        return new Font(this.fontFamily, this.fontSize, style, this.fontWeight);
    }

    public withFontWeight(weight: string): Font {
        return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight);
    }

    public withFontSize(size: number): Font {
        return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight);
    }
}

var areSystemFontSetsValid: boolean = false;
export var systemFontFamilies = new Set<string>();
export var systemFonts = new Set<string>();

export function ensureSystemFontSets() {
    if (areSystemFontSetsValid) {
        return;
    }

    var nsFontFamilies = UIFont.familyNames();
    for (var i = 0; i < nsFontFamilies.count; i++) {
        var family = nsFontFamilies.objectAtIndex(i);
        systemFontFamilies.add(family);

        var nsFonts = UIFont.fontNamesForFamilyName(family);
        for (var j = 0; j < nsFonts.count; j++) {
            var font = nsFonts.objectAtIndex(j);
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
        case common.genericFontFamilies.serif:
            return DEFAULT_SERIF;

        case common.genericFontFamilies.monospace:
            return DEFAULT_MONOSPACE;

        default:
            return fontFamily;
    }
}

function createUIFont(font: Font, defaultFont: UIFont) {
    var size = font.fontSize || defaultFont.pointSize;
    var descriptor: UIFontDescriptor;

    var symbolicTraits: number = 0;
    if (font.isBold) {
        symbolicTraits |= UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitBold;
    }
    if (font.isItalic) {
        symbolicTraits |= UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitItalic;
    }

    descriptor = tryResolveWithSystemFont(font, size, symbolicTraits);

    if (!descriptor) {
        descriptor = tryResolveByFamily(font);
    }

    if (!descriptor) {
        descriptor = defaultFont.fontDescriptor().fontDescriptorWithSymbolicTraits(symbolicTraits);
    }

    return UIFont.fontWithDescriptorSize(descriptor, size);
}

function tryResolveWithSystemFont(font: Font, size: number, symbolicTraits: number): UIFontDescriptor {
    var systemFont: UIFont;
    switch (font.fontFamily) {
        case common.genericFontFamilies.sansSerif:
        case common.genericFontFamilies.system:
            if ((<any>UIFont).systemFontOfSizeWeight) {// This method is available on iOS 8.2 and later.
                systemFont = (<any>UIFont).systemFontOfSizeWeight(size, getiOSFontWeight(font.fontWeight));
            }
            else {
                systemFont = UIFont.systemFontOfSize(size);
            }
            result = systemFont.fontDescriptor().fontDescriptorWithSymbolicTraits(symbolicTraits);
            break;

        case common.genericFontFamilies.monospace:
            if ((<any>UIFont).monospacedDigitSystemFontOfSizeWeight) {// This method is available on iOS 9.0 and later.
                systemFont = (<any>UIFont).monospacedDigitSystemFontOfSizeWeight(size, getiOSFontWeight(font.fontWeight));
                result = systemFont.fontDescriptor().fontDescriptorWithSymbolicTraits(symbolicTraits);
            }
            break;
    }

    if (systemFont) {
        var result = systemFont.fontDescriptor().fontDescriptorWithSymbolicTraits(symbolicTraits);
        return result;
    }

    return null;
}

function tryResolveByFamily(font: Font): UIFontDescriptor {
    var fonts = common.parseFontFamily(font.fontFamily);
    var result: UIFontDescriptor = null;
    if (fonts.length === 0) {
        return null;
    }

    ensureSystemFontSets();

    for (var i = 0; i < fonts.length; i++) {
        var fontFamily = getFontFamilyRespectingGenericFonts(fonts[i]);
        var fontFace = getiOSFontFace(fontFamily, font.fontWeight, font.isItalic);
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

function createFontDescriptor(fontFamily: string, fontFace: string): UIFontDescriptor  {
    var fontAttributes = NSMutableDictionary.alloc().init();
    fontAttributes.setObjectForKey(fontFamily, "NSFontFamilyAttribute");
    if (fontFace) {
        fontAttributes.setObjectForKey(fontFace, "NSFontFaceAttribute");
    }
    return UIFontDescriptor.fontDescriptorWithFontAttributes(fontAttributes);
}

// Available in iOS 8.2 and later. 
declare var UIFontWeightThin: number;       //0.8
declare var UIFontWeightUltraLight: number; //0.6
declare var UIFontWeightLight: number;      //0.4
declare var UIFontWeightRegular: number;    //0
declare var UIFontWeightMedium: number;     //0.23
declare var UIFontWeightSemibold: number;   //0.3
declare var UIFontWeightBold: number;       //0.4
declare var UIFontWeightHeavy: number;      //0.56
declare var UIFontWeightBlack: number;      //0.62
function getiOSFontWeight(fontWeight: string): number {
    if (!(<any>UIFont).systemFontOfSizeWeight) {
        throw new Error("Font weight is available in iOS 8.2 and later.");
    }

    switch (fontWeight) {
        case enums.FontWeight.thin:
            return UIFontWeightThin;
        case enums.FontWeight.extraLight:
            return UIFontWeightUltraLight;
        case enums.FontWeight.light:
            return UIFontWeightLight;
        case enums.FontWeight.normal:
        case "400":
        case undefined:
        case null:
            return UIFontWeightRegular;
        case enums.FontWeight.medium:
            return UIFontWeightMedium;
        case enums.FontWeight.semiBold:
            return UIFontWeightSemibold;
        case enums.FontWeight.bold:
        case "700":
            return UIFontWeightBold;
        case enums.FontWeight.extraBold:
            return UIFontWeightHeavy;
        case enums.FontWeight.black:
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
    var trialDescriptor = createFontDescriptor(fontFamily, fontFace);
    var trialFont = UIFont.fontWithDescriptorSize(trialDescriptor, 0);
    return trialFont.familyName === fontFamily;
}

function findCorrectWeightString(fontFamily: string, weightStringAlternatives: Array<string>, isItalic: boolean) {
    var i = 0;
    let length = weightStringAlternatives.length;
    for (; i < length; i++) {
        var possibleFontFace = combineWeightStringWithItalic(weightStringAlternatives[i], isItalic);
        if (canLoadFont(fontFamily, possibleFontFace)) {
            return weightStringAlternatives[i];
        }
    }
    return weightStringAlternatives[0];
} 

function getiOSFontFace(fontFamily: string, fontWeight: string, isItalic: boolean): string {
    // ... with a lot of fuzzy logic and artificial intelligence thanks to the lack of font naming standards.
    var weight: string;
    switch (fontWeight) {
        case enums.FontWeight.thin:
            weight = "Thin";
            break;
        case enums.FontWeight.extraLight:
            weight = findCorrectWeightString(fontFamily, ["Ultra Light", "UltraLight", "Extra Light", "ExtraLight", "Ultra light", "Ultralight", "Extra light", "Extralight"], isItalic);
            break;
        case enums.FontWeight.light:
            weight = "Light";
            break;
        case enums.FontWeight.normal:
        case "400":
        case undefined:
        case null:
            weight = ""; // We dont' need to write Regular
            break;
        case enums.FontWeight.medium:
            weight = "Medium";
            break;
        case enums.FontWeight.semiBold:
            weight = findCorrectWeightString(fontFamily, ["Demi Bold", "DemiBold", "Semi Bold", "SemiBold", "Demi bold", "Demibold", "Semi bold", "Semibold"], isItalic);
            break;
        case enums.FontWeight.bold:
        case "700":
            weight = "Bold";
            break;
        case enums.FontWeight.extraBold:
            weight = findCorrectWeightString(fontFamily, ["Heavy", "Extra Bold", "ExtraBold", "Extra bold", "Extrabold"], isItalic);
            break;
        case enums.FontWeight.black:
            weight = "Black";
            break;
        default:
            throw new Error(`Invalid font weight: "${fontWeight}"`);
    }

    return combineWeightStringWithItalic(weight, isItalic);
}

export module ios {
    export function registerFont(fontFile: string) {
        var filePath = fs.path.join(fs.knownFolders.currentApp().path, "fonts", fontFile);
        if (!fs.File.exists(filePath)) {
            filePath = fs.path.join(fs.knownFolders.currentApp().path, fontFile);
        }
        var fontData = NSFileManager.defaultManager().contentsAtPath(filePath);
        if (!fontData) {
            throw new Error("Could not load font from: " + fontFile);
        }
        var provider = CGDataProviderCreateWithCFData(fontData);
        var font = CGFontCreateWithDataProvider(provider);

        if (!font) {
            throw new Error("Could not load font from: " + fontFile);
        }

        var error = new interop.Reference();
        if (!CTFontManagerRegisterGraphicsFont(font, error)) {
            var trace: typeof traceModule = require("trace");

            if (trace.enabled) {
                trace.write("Error occur while registering font: " + CFErrorCopyDescription(<NSError>error.value), trace.categories.Error, trace.messageType.error);
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
