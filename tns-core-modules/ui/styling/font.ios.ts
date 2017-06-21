import enums = require("ui/enums");
import common = require("./font-common");
import fs = require("file-system");
import * as traceModule from "trace";
import * as utils from "utils/utils";
import { device } from "platform"

const EMULATE_OBLIQUE = true;
const OBLIQUE_TRANSFORM = CGAffineTransformMake(1, 0, 0.2, 1, 0, 0);
const DEFAULT_SERIF = "Times New Roman";
const DEFAULT_MONOSPACE = "Courier New";
const SUPPORT_FONT_WEIGHTS = parseFloat(device.osVersion) >= 10.0;

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

function shouldUseSystemFont(fontFamily: string) {
    return !fontFamily ||
        fontFamily === common.genericFontFamilies.sansSerif ||
        fontFamily === common.genericFontFamilies.system;
}

function getNativeFontWeight(fontWeight: string): number {
    switch (fontWeight) {
        case enums.FontWeight.thin:
            return UIFontWeightUltraLight;
        case enums.FontWeight.extraLight:
            return UIFontWeightThin;
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

function getSystemFont(size: number, nativeWeight: number, italic: boolean, symbolicTraits: number): UIFont {
    let result = UIFont.systemFontOfSizeWeight(size, nativeWeight);
    if (italic) {
        let descriptor = utils.ios.getter(result, result.fontDescriptor).fontDescriptorWithSymbolicTraits(symbolicTraits);
        result = UIFont.fontWithDescriptorSize(descriptor, size);
    }

    return result;
}

function createUIFont(font: Font, defaultFont: UIFont): UIFont {
    let result: UIFont;
    const size = font.fontSize || defaultFont.pointSize;
    const nativeWeight = getNativeFontWeight(font.fontWeight);
    const fontFamilies = common.parseFontFamily(font.fontFamily);

    let symbolicTraits: number = 0;
    if (font.isBold) {
        symbolicTraits |= UIFontDescriptorSymbolicTraits.TraitBold;
    }
    if (font.isItalic) {
        symbolicTraits |= UIFontDescriptorSymbolicTraits.TraitItalic;
    }

    let fontDescriptorTraits = {
        [UIFontSymbolicTrait]: symbolicTraits
    };

    // IOS versions below 10 will not return the correct font when UIFontWeightTrait is set
    // In this case - rely on UIFontSymbolicTrait only
    if (SUPPORT_FONT_WEIGHTS) {
        fontDescriptorTraits[UIFontWeightTrait] = nativeWeight;
    }

    for (let i = 0; i < fontFamilies.length; i++) {
        const fontFamily = getFontFamilyRespectingGenericFonts(fontFamilies[i]);

        if (shouldUseSystemFont(fontFamily)) {
            result = getSystemFont(size, nativeWeight, font.isItalic, symbolicTraits);
            break;
        } else {
            const fontAttributes = {
                [UIFontDescriptorFamilyAttribute]: fontFamily,
                [UIFontDescriptorTraitsAttribute]: fontDescriptorTraits
            };

            let descriptor = UIFontDescriptor.fontDescriptorWithFontAttributes(<any>fontAttributes);
            result = UIFont.fontWithDescriptorSize(descriptor, size);

            let actualItalic = utils.ios.getter(result, result.fontDescriptor).symbolicTraits & UIFontDescriptorSymbolicTraits.TraitItalic;
            if (font.isItalic && !actualItalic && EMULATE_OBLIQUE) {
                // The font we got is not actually italic so emulate that with a matrix
                descriptor = descriptor.fontDescriptorWithMatrix(OBLIQUE_TRANSFORM);
                result = UIFont.fontWithDescriptorSize(descriptor, size);
            }

            // Check if the resolved font has the correct font-family
            // If not - fallback to the next font-family
            if (result.familyName === fontFamily) {
                break;
            } else {
                result = null;
            }
        }
    }

    // Couldn't resolve font - fallback to the system font
    if (!result) {
        result = getSystemFont(size, nativeWeight, font.isItalic, symbolicTraits);
    }

    return result;
}

export module ios {
    export function registerFont(fontFile: string) {
        var filePath = fs.path.join(fs.knownFolders.currentApp().path, "fonts", fontFile);
        if (!fs.File.exists(filePath)) {
            filePath = fs.path.join(fs.knownFolders.currentApp().path, fontFile);
        }
        var fontData = utils.ios.getter(NSFileManager, NSFileManager.defaultManager).contentsAtPath(filePath);
        if (!fontData) {
            throw new Error("Could not load font from: " + fontFile);
        }
        var provider = CGDataProviderCreateWithCFData(fontData);
        var font = CGFontCreateWithDataProvider(provider);

        if (!font) {
            throw new Error("Could not load font from: " + fontFile);
        }

        var error = new interop.Reference<NSError>();
        if (!CTFontManagerRegisterGraphicsFont(font, error)) {
            var trace: typeof traceModule = require("trace");

            if (trace.enabled) {
                trace.write("Error occur while registering font: " + CFErrorCopyDescription(<NSError>error.value), trace.categories.Error, trace.messageType.error);
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
