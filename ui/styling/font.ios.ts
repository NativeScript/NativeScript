import enums = require("ui/enums");
import common = require("./font-common");
import fs = require("file-system");
import trace = require("trace");

var DEFAULT_SERIF = "Times New Roman";
var DEFAULT_SANS_SERIF = "Helvetica";
var DEFAULT_MONOSPACE = "Courier New";

export class Font extends common.Font {
    public static default = new Font(undefined, undefined, enums.FontStyle.normal, enums.FontWeight.normal);

    private _uiFont: UIFont;

    constructor(family: string, size: number, style: string, weight: string) {
        super(family, size, style, weight);
    }

    public getUIFont(defaultFont: UIFont): UIFont {
        if (!this._uiFont) {
            var symbolicTraits: number = 0;
            if (this.isBold) {
                symbolicTraits |= UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitBold;
            }
            if (this.isItalic) {
                symbolicTraits |= UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitItalic;
            }

            var descriptor = resolveFontDescriptor(this.fontFamily, symbolicTraits);
            if (!descriptor) {
                descriptor = defaultFont.fontDescriptor().fontDescriptorWithSymbolicTraits(symbolicTraits);
            }
            var size = this.fontSize || defaultFont.pointSize;

            this._uiFont = UIFont.fontWithDescriptorSize(descriptor, size);
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
var systemFontFamilies = new Set();
var systemFonts = new Set();

function assureSystemFontSets() {
    if (!areSystemFontSetsValid) {
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
}

function resolveFontDescriptor(fontFamilyValue: string, symbolicTraits: number): UIFontDescriptor {
    var fonts = common.parseFontFamily(fontFamilyValue);
    var result: UIFontDescriptor = null;
    if (fonts.length === 0) {
        return null;
    }

    assureSystemFontSets();

    for (var i = 0; i < fonts.length; i++) {
        var fontFamily = getFontFamilyRespectingGenericFonts(fonts[i]);
        if (systemFontFamilies.has(fontFamily)) {
            // This is a font family - we should apply symbolic traits if there are such
            var fontFaceAttribute = "";

            if (!symbolicTraits) {
                fontFaceAttribute = "Regular";
            }
            else {
                if (symbolicTraits & UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitBold) {
                    fontFaceAttribute += " Bold";
                }
                if (symbolicTraits & UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitItalic) {
                    fontFaceAttribute += " Italic";
                }
            }

            var fontAttributes = NSMutableDictionary.alloc().init();
            fontAttributes.setObjectForKey(fontFamily, "NSFontFamilyAttribute");
            fontAttributes.setObjectForKey(fontFaceAttribute.trim(), "NSFontFaceAttribute");

            result = UIFontDescriptor.fontDescriptorWithFontAttributes(fontAttributes);
        }
        else if (systemFonts.has(fontFamily)) {
            // This is an actual font - don't apply symbolic traits
            result = UIFontDescriptor.fontDescriptorWithNameSize(fontFamily, 0);
        }

        if (result) {
            return result;
        }
    }

    return null;
}

function getFontFamilyRespectingGenericFonts(fontFamily: string): string {
    if (!fontFamily) {
        return fontFamily;
    }

    switch (fontFamily.toLowerCase()) {
        case common.genericFontFamilies.serif:
            return DEFAULT_SERIF;

        case common.genericFontFamilies.sansSerif:
            return DEFAULT_SANS_SERIF;

        case common.genericFontFamilies.monospace:
            return DEFAULT_MONOSPACE;

        default:
            return fontFamily;
    }
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
            trace.write("Error occur while registering font: " + CFErrorCopyDescription(<NSError>error.value), trace.categories.Error, trace.messageType.error);
        }

        areSystemFontSetsValid = false;
    }
}

function registerCustomFonts() {
    var fontsFolderPath = fs.path.join(__dirname.substring(0, __dirname.indexOf("/tns_modules")), "fonts");
    if (fs.Folder.exists(fontsFolderPath)) {
        var fontsFolder = fs.Folder.fromPath(fontsFolderPath);
        var onEachEntityFunc = function (fileEntity: fs.FileSystemEntity): boolean {
            if (fs.Folder.exists(fs.path.join(fontsFolderPath, fileEntity.name))) {
                return true;
            }

            if (fileEntity instanceof fs.File &&
                ((<fs.File>fileEntity).extension === ".ttf" || (<fs.File>fileEntity).extension === ".otf")) {
                ios.registerFont(fileEntity.name);
            }
            return true;
        }

        fontsFolder.eachEntity(onEachEntityFunc);
    }
}

registerCustomFonts();