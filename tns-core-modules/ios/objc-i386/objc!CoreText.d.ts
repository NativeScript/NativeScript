
interface ALMXGlyphEntry {
	GlyphIndexOffset: number;
	HorizontalAdvance: number;
	XOffsetToHOrigin: number;
	VerticalAdvance: number;
	YOffsetToVOrigin: number;
}
declare var ALMXGlyphEntry: interop.StructType<ALMXGlyphEntry>;

interface AnchorPoint {
	x: number;
	y: number;
}
declare var AnchorPoint: interop.StructType<AnchorPoint>;

interface AnchorPointTable {
	nPoints: number;
	points: interop.Reference<AnchorPoint>;
}
declare var AnchorPointTable: interop.StructType<AnchorPointTable>;

interface AnkrTable {
	version: number;
	flags: number;
	lookupTableOffset: number;
	anchorPointTableOffset: number;
}
declare var AnkrTable: interop.StructType<AnkrTable>;

interface BslnFormat0Part {
	deltas: interop.Reference<number>;
}
declare var BslnFormat0Part: interop.StructType<BslnFormat0Part>;

interface BslnFormat2Part {
	stdGlyph: number;
	ctlPoints: interop.Reference<number>;
}
declare var BslnFormat2Part: interop.StructType<BslnFormat2Part>;

declare const enum CTCharacterCollection {

	kCTCharacterCollectionIdentityMapping = 0,

	kCTCharacterCollectionAdobeCNS1 = 1,

	kCTCharacterCollectionAdobeGB1 = 2,

	kCTCharacterCollectionAdobeJapan1 = 3,

	kCTCharacterCollectionAdobeJapan2 = 4,

	kCTCharacterCollectionAdobeKorea1 = 5,

	kCTIdentityMappingCharacterCollection = 0,

	kCTAdobeCNS1CharacterCollection = 1,

	kCTAdobeGB1CharacterCollection = 2,

	kCTAdobeJapan1CharacterCollection = 3,

	kCTAdobeJapan2CharacterCollection = 4,

	kCTAdobeKorea1CharacterCollection = 5
}

declare function CTFontCollectionCreateCopyWithFontDescriptors(original: any, queryDescriptors: NSArray<any>, options: NSDictionary<any, any>): any;

declare function CTFontCollectionCreateFromAvailableFonts(options: NSDictionary<any, any>): any;

declare function CTFontCollectionCreateMatchingFontDescriptors(collection: any): NSArray<any>;

declare function CTFontCollectionCreateMatchingFontDescriptorsSortedWithCallback(collection: any, sortCallback: interop.FunctionReference<(p1: UIFontDescriptor, p2: UIFontDescriptor, p3: interop.Pointer) => CFComparisonResult>, refCon: interop.Pointer): NSArray<any>;

declare function CTFontCollectionCreateWithFontDescriptors(queryDescriptors: NSArray<any>, options: NSDictionary<any, any>): any;

declare function CTFontCollectionGetTypeID(): number;

declare function CTFontCopyAttribute(font: UIFont, attribute: string): any;

declare function CTFontCopyAvailableTables(font: UIFont, options: CTFontTableOptions): NSArray<any>;

declare function CTFontCopyCharacterSet(font: UIFont): NSCharacterSet;

declare function CTFontCopyDefaultCascadeListForLanguages(font: UIFont, languagePrefList: NSArray<any>): NSArray<any>;

declare function CTFontCopyDisplayName(font: UIFont): string;

declare function CTFontCopyFamilyName(font: UIFont): string;

declare function CTFontCopyFeatureSettings(font: UIFont): NSArray<any>;

declare function CTFontCopyFeatures(font: UIFont): NSArray<any>;

declare function CTFontCopyFontDescriptor(font: UIFont): UIFontDescriptor;

declare function CTFontCopyFullName(font: UIFont): string;

declare function CTFontCopyGraphicsFont(font: UIFont, attributes: interop.Reference<UIFontDescriptor>): any;

declare function CTFontCopyLocalizedName(font: UIFont, nameKey: string, actualLanguage: interop.Reference<string>): string;

declare function CTFontCopyName(font: UIFont, nameKey: string): string;

declare function CTFontCopyPostScriptName(font: UIFont): string;

declare function CTFontCopySupportedLanguages(font: UIFont): NSArray<any>;

declare function CTFontCopyTable(font: UIFont, table: number, options: CTFontTableOptions): NSData;

declare function CTFontCopyTraits(font: UIFont): NSDictionary<any, any>;

declare function CTFontCopyVariation(font: UIFont): NSDictionary<any, any>;

declare function CTFontCopyVariationAxes(font: UIFont): NSArray<any>;

declare function CTFontCreateCopyWithAttributes(font: UIFont, size: number, matrix: interop.Reference<CGAffineTransform>, attributes: UIFontDescriptor): UIFont;

declare function CTFontCreateCopyWithFamily(font: UIFont, size: number, matrix: interop.Reference<CGAffineTransform>, family: string): UIFont;

declare function CTFontCreateCopyWithSymbolicTraits(font: UIFont, size: number, matrix: interop.Reference<CGAffineTransform>, symTraitValue: CTFontSymbolicTraits, symTraitMask: CTFontSymbolicTraits): UIFont;

declare function CTFontCreateForString(currentFont: UIFont, string: string, range: CFRange): UIFont;

declare function CTFontCreatePathForGlyph(font: UIFont, glyph: number, matrix: interop.Reference<CGAffineTransform>): any;

declare function CTFontCreateUIFontForLanguage(uiType: CTFontUIFontType, size: number, language: string): UIFont;

declare function CTFontCreateWithFontDescriptor(descriptor: UIFontDescriptor, size: number, matrix: interop.Reference<CGAffineTransform>): UIFont;

declare function CTFontCreateWithFontDescriptorAndOptions(descriptor: UIFontDescriptor, size: number, matrix: interop.Reference<CGAffineTransform>, options: CTFontOptions): UIFont;

declare function CTFontCreateWithGraphicsFont(graphicsFont: any, size: number, matrix: interop.Reference<CGAffineTransform>, attributes: UIFontDescriptor): UIFont;

declare function CTFontCreateWithName(name: string, size: number, matrix: interop.Reference<CGAffineTransform>): UIFont;

declare function CTFontCreateWithNameAndOptions(name: string, size: number, matrix: interop.Reference<CGAffineTransform>, options: CTFontOptions): UIFont;

declare function CTFontDescriptorCopyAttribute(descriptor: UIFontDescriptor, attribute: string): any;

declare function CTFontDescriptorCopyAttributes(descriptor: UIFontDescriptor): NSDictionary<any, any>;

declare function CTFontDescriptorCopyLocalizedAttribute(descriptor: UIFontDescriptor, attribute: string, language: interop.Reference<string>): any;

declare function CTFontDescriptorCreateCopyWithAttributes(original: UIFontDescriptor, attributes: NSDictionary<any, any>): UIFontDescriptor;

declare function CTFontDescriptorCreateCopyWithFamily(original: UIFontDescriptor, family: string): UIFontDescriptor;

declare function CTFontDescriptorCreateCopyWithFeature(original: UIFontDescriptor, featureTypeIdentifier: number, featureSelectorIdentifier: number): UIFontDescriptor;

declare function CTFontDescriptorCreateCopyWithSymbolicTraits(original: UIFontDescriptor, symTraitValue: CTFontSymbolicTraits, symTraitMask: CTFontSymbolicTraits): UIFontDescriptor;

declare function CTFontDescriptorCreateCopyWithVariation(original: UIFontDescriptor, variationIdentifier: number, variationValue: number): UIFontDescriptor;

declare function CTFontDescriptorCreateMatchingFontDescriptor(descriptor: UIFontDescriptor, mandatoryAttributes: NSSet<any>): UIFontDescriptor;

declare function CTFontDescriptorCreateMatchingFontDescriptors(descriptor: UIFontDescriptor, mandatoryAttributes: NSSet<any>): NSArray<any>;

declare function CTFontDescriptorCreateWithAttributes(attributes: NSDictionary<any, any>): UIFontDescriptor;

declare function CTFontDescriptorCreateWithNameAndSize(name: string, size: number): UIFontDescriptor;

declare function CTFontDescriptorGetTypeID(): number;

declare function CTFontDescriptorMatchFontDescriptorsWithProgressHandler(descriptors: NSArray<any>, mandatoryAttributes: NSSet<any>, progressBlock: (p1: CTFontDescriptorMatchingState, p2: NSDictionary<any, any>) => boolean): boolean;

declare const enum CTFontDescriptorMatchingState {

	kCTFontDescriptorMatchingDidBegin = 0,

	kCTFontDescriptorMatchingDidFinish = 1,

	kCTFontDescriptorMatchingWillBeginQuerying = 2,

	kCTFontDescriptorMatchingStalled = 3,

	kCTFontDescriptorMatchingWillBeginDownloading = 4,

	kCTFontDescriptorMatchingDownloading = 5,

	kCTFontDescriptorMatchingDidFinishDownloading = 6,

	kCTFontDescriptorMatchingDidMatch = 7,

	kCTFontDescriptorMatchingDidFailWithError = 8
}

declare function CTFontDrawGlyphs(font: UIFont, glyphs: interop.Reference<number>, positions: interop.Reference<CGPoint>, count: number, context: any): void;

declare const enum CTFontFormat {

	kCTFontFormatUnrecognized = 0,

	kCTFontFormatOpenTypePostScript = 1,

	kCTFontFormatOpenTypeTrueType = 2,

	kCTFontFormatTrueType = 3,

	kCTFontFormatPostScript = 4,

	kCTFontFormatBitmap = 5
}

declare function CTFontGetAdvancesForGlyphs(font: UIFont, orientation: CTFontOrientation, glyphs: interop.Reference<number>, advances: interop.Reference<CGSize>, count: number): number;

declare function CTFontGetAscent(font: UIFont): number;

declare function CTFontGetBoundingBox(font: UIFont): CGRect;

declare function CTFontGetBoundingRectsForGlyphs(font: UIFont, orientation: CTFontOrientation, glyphs: interop.Reference<number>, boundingRects: interop.Reference<CGRect>, count: number): CGRect;

declare function CTFontGetCapHeight(font: UIFont): number;

declare function CTFontGetDescent(font: UIFont): number;

declare function CTFontGetGlyphCount(font: UIFont): number;

declare function CTFontGetGlyphWithName(font: UIFont, glyphName: string): number;

declare function CTFontGetGlyphsForCharacters(font: UIFont, characters: interop.Reference<number>, glyphs: interop.Reference<number>, count: number): boolean;

declare function CTFontGetLeading(font: UIFont): number;

declare function CTFontGetLigatureCaretPositions(font: UIFont, glyph: number, positions: interop.Reference<number>, maxPositions: number): number;

declare function CTFontGetMatrix(font: UIFont): CGAffineTransform;

declare function CTFontGetOpticalBoundsForGlyphs(font: UIFont, glyphs: interop.Reference<number>, boundingRects: interop.Reference<CGRect>, count: number, options: number): CGRect;

declare function CTFontGetSize(font: UIFont): number;

declare function CTFontGetSlantAngle(font: UIFont): number;

declare function CTFontGetStringEncoding(font: UIFont): number;

declare function CTFontGetSymbolicTraits(font: UIFont): CTFontSymbolicTraits;

declare function CTFontGetTypeID(): number;

declare function CTFontGetUnderlinePosition(font: UIFont): number;

declare function CTFontGetUnderlineThickness(font: UIFont): number;

declare function CTFontGetUnitsPerEm(font: UIFont): number;

declare function CTFontGetVerticalTranslationsForGlyphs(font: UIFont, glyphs: interop.Reference<number>, translations: interop.Reference<CGSize>, count: number): void;

declare function CTFontGetXHeight(font: UIFont): number;

declare const enum CTFontManagerAutoActivationSetting {

	kCTFontManagerAutoActivationDefault = 0,

	kCTFontManagerAutoActivationDisabled = 1,

	kCTFontManagerAutoActivationEnabled = 2,

	kCTFontManagerAutoActivationPromptUser = 3
}

declare function CTFontManagerCreateFontDescriptorFromData(data: NSData): UIFontDescriptor;

declare function CTFontManagerCreateFontDescriptorsFromURL(fileURL: NSURL): NSArray<any>;

declare const enum CTFontManagerError {

	kCTFontManagerErrorFileNotFound = 101,

	kCTFontManagerErrorInsufficientPermissions = 102,

	kCTFontManagerErrorUnrecognizedFormat = 103,

	kCTFontManagerErrorInvalidFontData = 104,

	kCTFontManagerErrorAlreadyRegistered = 105,

	kCTFontManagerErrorNotRegistered = 201,

	kCTFontManagerErrorInUse = 202,

	kCTFontManagerErrorSystemRequired = 203
}

declare function CTFontManagerRegisterFontsForURL(fontURL: NSURL, scope: CTFontManagerScope, error: interop.Reference<NSError>): boolean;

declare function CTFontManagerRegisterFontsForURLs(fontURLs: NSArray<any>, scope: CTFontManagerScope, errors: interop.Reference<NSArray<any>>): boolean;

declare function CTFontManagerRegisterGraphicsFont(font: any, error: interop.Reference<NSError>): boolean;

declare const enum CTFontManagerScope {

	kCTFontManagerScopeNone = 0,

	kCTFontManagerScopeProcess = 1,

	kCTFontManagerScopeUser = 2,

	kCTFontManagerScopeSession = 3
}

declare function CTFontManagerUnregisterFontsForURL(fontURL: NSURL, scope: CTFontManagerScope, error: interop.Reference<NSError>): boolean;

declare function CTFontManagerUnregisterFontsForURLs(fontURLs: NSArray<any>, scope: CTFontManagerScope, errors: interop.Reference<NSArray<any>>): boolean;

declare function CTFontManagerUnregisterGraphicsFont(font: any, error: interop.Reference<NSError>): boolean;

declare const enum CTFontOptions {

	kCTFontOptionsDefault = 0,

	kCTFontOptionsPreventAutoActivation = 1,

	kCTFontOptionsPreferSystemFont = 4
}

declare const enum CTFontOrientation {

	kCTFontOrientationDefault = 0,

	kCTFontOrientationHorizontal = 1,

	kCTFontOrientationVertical = 2,

	kCTFontDefaultOrientation = 0,

	kCTFontHorizontalOrientation = 1,

	kCTFontVerticalOrientation = 2
}

declare const enum CTFontStylisticClass {

	kCTFontClassUnknown = 0,

	kCTFontClassOldStyleSerifs = 268435456,

	kCTFontClassTransitionalSerifs = 536870912,

	kCTFontClassModernSerifs = 805306368,

	kCTFontClassClarendonSerifs = 1073741824,

	kCTFontClassSlabSerifs = 1342177280,

	kCTFontClassFreeformSerifs = 1879048192,

	kCTFontClassSansSerif = 2147483648,

	kCTFontClassOrnamentals = 2415919104,

	kCTFontClassScripts = 2684354560,

	kCTFontClassSymbolic = 3221225472,

	kCTFontUnknownClass = 0,

	kCTFontOldStyleSerifsClass = 268435456,

	kCTFontTransitionalSerifsClass = 536870912,

	kCTFontModernSerifsClass = 805306368,

	kCTFontClarendonSerifsClass = 1073741824,

	kCTFontSlabSerifsClass = 1342177280,

	kCTFontFreeformSerifsClass = 1879048192,

	kCTFontSansSerifClass = 2147483648,

	kCTFontOrnamentalsClass = 2415919104,

	kCTFontScriptsClass = 2684354560,

	kCTFontSymbolicClass = 3221225472
}

declare const enum CTFontSymbolicTraits {

	kCTFontTraitItalic = 1,

	kCTFontTraitBold = 2,

	kCTFontTraitExpanded = 32,

	kCTFontTraitCondensed = 64,

	kCTFontTraitMonoSpace = 1024,

	kCTFontTraitVertical = 2048,

	kCTFontTraitUIOptimized = 4096,

	kCTFontTraitColorGlyphs = 8192,

	kCTFontTraitComposite = 16384,

	kCTFontTraitClassMask = 4026531840,

	kCTFontItalicTrait = 1,

	kCTFontBoldTrait = 2,

	kCTFontExpandedTrait = 32,

	kCTFontCondensedTrait = 64,

	kCTFontMonoSpaceTrait = 1024,

	kCTFontVerticalTrait = 2048,

	kCTFontUIOptimizedTrait = 4096,

	kCTFontColorGlyphsTrait = 8192,

	kCTFontCompositeTrait = 16384,

	kCTFontClassMaskTrait = 4026531840
}

declare const enum CTFontTableOptions {

	kCTFontTableOptionNoOptions = 0,

	kCTFontTableOptionExcludeSynthetic = 1
}

declare const enum CTFontUIFontType {

	kCTFontUIFontNone = 4294967295,

	kCTFontUIFontUser = 0,

	kCTFontUIFontUserFixedPitch = 1,

	kCTFontUIFontSystem = 2,

	kCTFontUIFontEmphasizedSystem = 3,

	kCTFontUIFontSmallSystem = 4,

	kCTFontUIFontSmallEmphasizedSystem = 5,

	kCTFontUIFontMiniSystem = 6,

	kCTFontUIFontMiniEmphasizedSystem = 7,

	kCTFontUIFontViews = 8,

	kCTFontUIFontApplication = 9,

	kCTFontUIFontLabel = 10,

	kCTFontUIFontMenuTitle = 11,

	kCTFontUIFontMenuItem = 12,

	kCTFontUIFontMenuItemMark = 13,

	kCTFontUIFontMenuItemCmdKey = 14,

	kCTFontUIFontWindowTitle = 15,

	kCTFontUIFontPushButton = 16,

	kCTFontUIFontUtilityWindowTitle = 17,

	kCTFontUIFontAlertHeader = 18,

	kCTFontUIFontSystemDetail = 19,

	kCTFontUIFontEmphasizedSystemDetail = 20,

	kCTFontUIFontToolbar = 21,

	kCTFontUIFontSmallToolbar = 22,

	kCTFontUIFontMessage = 23,

	kCTFontUIFontPalette = 24,

	kCTFontUIFontToolTip = 25,

	kCTFontUIFontControlContent = 26,

	kCTFontNoFontType = 4294967295,

	kCTFontUserFontType = 0,

	kCTFontUserFixedPitchFontType = 1,

	kCTFontSystemFontType = 2,

	kCTFontEmphasizedSystemFontType = 3,

	kCTFontSmallSystemFontType = 4,

	kCTFontSmallEmphasizedSystemFontType = 5,

	kCTFontMiniSystemFontType = 6,

	kCTFontMiniEmphasizedSystemFontType = 7,

	kCTFontViewsFontType = 8,

	kCTFontApplicationFontType = 9,

	kCTFontLabelFontType = 10,

	kCTFontMenuTitleFontType = 11,

	kCTFontMenuItemFontType = 12,

	kCTFontMenuItemMarkFontType = 13,

	kCTFontMenuItemCmdKeyFontType = 14,

	kCTFontWindowTitleFontType = 15,

	kCTFontPushButtonFontType = 16,

	kCTFontUtilityWindowTitleFontType = 17,

	kCTFontAlertHeaderFontType = 18,

	kCTFontSystemDetailFontType = 19,

	kCTFontEmphasizedSystemDetailFontType = 20,

	kCTFontToolbarFontType = 21,

	kCTFontSmallToolbarFontType = 22,

	kCTFontMessageFontType = 23,

	kCTFontPaletteFontType = 24,

	kCTFontToolTipFontType = 25,

	kCTFontControlContentFontType = 26
}

declare function CTFrameDraw(frame: any, context: any): void;

declare function CTFrameGetFrameAttributes(frame: any): NSDictionary<any, any>;

declare function CTFrameGetLineOrigins(frame: any, range: CFRange, origins: interop.Reference<CGPoint>): void;

declare function CTFrameGetLines(frame: any): NSArray<any>;

declare function CTFrameGetPath(frame: any): any;

declare function CTFrameGetStringRange(frame: any): CFRange;

declare function CTFrameGetTypeID(): number;

declare function CTFrameGetVisibleStringRange(frame: any): CFRange;

declare const enum CTFramePathFillRule {

	kCTFramePathFillEvenOdd = 0,

	kCTFramePathFillWindingNumber = 1
}

declare const enum CTFrameProgression {

	kCTFrameProgressionTopToBottom = 0,

	kCTFrameProgressionRightToLeft = 1,

	kCTFrameProgressionLeftToRight = 2
}

declare function CTFramesetterCreateFrame(framesetter: any, stringRange: CFRange, path: any, frameAttributes: NSDictionary<any, any>): any;

declare function CTFramesetterCreateWithAttributedString(string: NSAttributedString): any;

declare function CTFramesetterGetTypeID(): number;

declare function CTFramesetterGetTypesetter(framesetter: any): any;

declare function CTFramesetterSuggestFrameSizeWithConstraints(framesetter: any, stringRange: CFRange, frameAttributes: NSDictionary<any, any>, constraints: CGSize, fitRange: interop.Reference<CFRange>): CGSize;

declare function CTGetCoreTextVersion(): number;

declare function CTGlyphInfoCreateWithCharacterIdentifier(cid: number, collection: CTCharacterCollection, baseString: string): any;

declare function CTGlyphInfoCreateWithGlyph(glyph: number, font: UIFont, baseString: string): any;

declare function CTGlyphInfoCreateWithGlyphName(glyphName: string, font: UIFont, baseString: string): any;

declare function CTGlyphInfoGetCharacterCollection(glyphInfo: any): CTCharacterCollection;

declare function CTGlyphInfoGetCharacterIdentifier(glyphInfo: any): number;

declare function CTGlyphInfoGetGlyphName(glyphInfo: any): string;

declare function CTGlyphInfoGetTypeID(): number;

declare const enum CTLineBoundsOptions {

	kCTLineBoundsExcludeTypographicLeading = 1,

	kCTLineBoundsExcludeTypographicShifts = 2,

	kCTLineBoundsUseHangingPunctuation = 4,

	kCTLineBoundsUseGlyphPathBounds = 8,

	kCTLineBoundsUseOpticalBounds = 16,

	kCTLineBoundsIncludeLanguageExtents = 32
}

declare const enum CTLineBreakMode {

	kCTLineBreakByWordWrapping = 0,

	kCTLineBreakByCharWrapping = 1,

	kCTLineBreakByClipping = 2,

	kCTLineBreakByTruncatingHead = 3,

	kCTLineBreakByTruncatingTail = 4,

	kCTLineBreakByTruncatingMiddle = 5
}

declare function CTLineCreateJustifiedLine(line: any, justificationFactor: number, justificationWidth: number): any;

declare function CTLineCreateTruncatedLine(line: any, width: number, truncationType: CTLineTruncationType, truncationToken: any): any;

declare function CTLineCreateWithAttributedString(attrString: NSAttributedString): any;

declare function CTLineDraw(line: any, context: any): void;

declare function CTLineEnumerateCaretOffsets(line: any, block: (p1: number, p2: number, p3: boolean, p4: interop.Reference<boolean>) => void): void;

declare function CTLineGetBoundsWithOptions(line: any, options: CTLineBoundsOptions): CGRect;

declare function CTLineGetGlyphCount(line: any): number;

declare function CTLineGetGlyphRuns(line: any): NSArray<any>;

declare function CTLineGetImageBounds(line: any, context: any): CGRect;

declare function CTLineGetOffsetForStringIndex(line: any, charIndex: number, secondaryOffset: interop.Reference<number>): number;

declare function CTLineGetPenOffsetForFlush(line: any, flushFactor: number, flushWidth: number): number;

declare function CTLineGetStringIndexForPosition(line: any, position: CGPoint): number;

declare function CTLineGetStringRange(line: any): CFRange;

declare function CTLineGetTrailingWhitespaceWidth(line: any): number;

declare function CTLineGetTypeID(): number;

declare function CTLineGetTypographicBounds(line: any, ascent: interop.Reference<number>, descent: interop.Reference<number>, leading: interop.Reference<number>): number;

declare const enum CTLineTruncationType {

	kCTLineTruncationStart = 0,

	kCTLineTruncationEnd = 1,

	kCTLineTruncationMiddle = 2
}

declare function CTParagraphStyleCreate(settings: interop.Reference<CTParagraphStyleSetting>, settingCount: number): any;

declare function CTParagraphStyleCreateCopy(paragraphStyle: any): any;

declare function CTParagraphStyleGetTypeID(): number;

declare function CTParagraphStyleGetValueForSpecifier(paragraphStyle: any, spec: CTParagraphStyleSpecifier, valueBufferSize: number, valueBuffer: interop.Pointer): boolean;

interface CTParagraphStyleSetting {
	spec: CTParagraphStyleSpecifier;
	valueSize: number;
	value: interop.Pointer;
}
declare var CTParagraphStyleSetting: interop.StructType<CTParagraphStyleSetting>;

declare const enum CTParagraphStyleSpecifier {

	kCTParagraphStyleSpecifierAlignment = 0,

	kCTParagraphStyleSpecifierFirstLineHeadIndent = 1,

	kCTParagraphStyleSpecifierHeadIndent = 2,

	kCTParagraphStyleSpecifierTailIndent = 3,

	kCTParagraphStyleSpecifierTabStops = 4,

	kCTParagraphStyleSpecifierDefaultTabInterval = 5,

	kCTParagraphStyleSpecifierLineBreakMode = 6,

	kCTParagraphStyleSpecifierLineHeightMultiple = 7,

	kCTParagraphStyleSpecifierMaximumLineHeight = 8,

	kCTParagraphStyleSpecifierMinimumLineHeight = 9,

	kCTParagraphStyleSpecifierLineSpacing = 10,

	kCTParagraphStyleSpecifierParagraphSpacing = 11,

	kCTParagraphStyleSpecifierParagraphSpacingBefore = 12,

	kCTParagraphStyleSpecifierBaseWritingDirection = 13,

	kCTParagraphStyleSpecifierMaximumLineSpacing = 14,

	kCTParagraphStyleSpecifierMinimumLineSpacing = 15,

	kCTParagraphStyleSpecifierLineSpacingAdjustment = 16,

	kCTParagraphStyleSpecifierLineBoundsOptions = 17,

	kCTParagraphStyleSpecifierCount = 18
}

declare const enum CTRubyAlignment {

	kCTRubyAlignmentInvalid = 255,

	kCTRubyAlignmentAuto = 0,

	kCTRubyAlignmentStart = 1,

	kCTRubyAlignmentCenter = 2,

	kCTRubyAlignmentEnd = 3,

	kCTRubyAlignmentDistributeLetter = 4,

	kCTRubyAlignmentDistributeSpace = 5,

	kCTRubyAlignmentLineEdge = 6
}

declare function CTRubyAnnotationCreate(alignment: CTRubyAlignment, overhang: CTRubyOverhang, sizeFactor: number, text: interop.Reference<string>): any;

declare function CTRubyAnnotationCreateCopy(rubyAnnotation: any): any;

declare function CTRubyAnnotationGetAlignment(rubyAnnotation: any): CTRubyAlignment;

declare function CTRubyAnnotationGetOverhang(rubyAnnotation: any): CTRubyOverhang;

declare function CTRubyAnnotationGetSizeFactor(rubyAnnotation: any): number;

declare function CTRubyAnnotationGetTextForPosition(rubyAnnotation: any, position: CTRubyPosition): string;

declare function CTRubyAnnotationGetTypeID(): number;

declare const enum CTRubyOverhang {

	kCTRubyOverhangInvalid = 255,

	kCTRubyOverhangAuto = 0,

	kCTRubyOverhangStart = 1,

	kCTRubyOverhangEnd = 2,

	kCTRubyOverhangNone = 3
}

declare const enum CTRubyPosition {

	kCTRubyPositionBefore = 0,

	kCTRubyPositionAfter = 1,

	kCTRubyPositionInterCharacter = 2,

	kCTRubyPositionInline = 3,

	kCTRubyPositionCount = 4
}

interface CTRunDelegateCallbacks {
	version: number;
	dealloc: interop.FunctionReference<(p1: interop.Pointer) => void>;
	getAscent: interop.FunctionReference<(p1: interop.Pointer) => number>;
	getDescent: interop.FunctionReference<(p1: interop.Pointer) => number>;
	getWidth: interop.FunctionReference<(p1: interop.Pointer) => number>;
}
declare var CTRunDelegateCallbacks: interop.StructType<CTRunDelegateCallbacks>;

declare function CTRunDelegateCreate(callbacks: interop.Reference<CTRunDelegateCallbacks>, refCon: interop.Pointer): any;

declare function CTRunDelegateGetRefCon(runDelegate: any): interop.Pointer;

declare function CTRunDelegateGetTypeID(): number;

declare function CTRunDraw(run: any, context: any, range: CFRange): void;

declare function CTRunGetAdvances(run: any, range: CFRange, buffer: interop.Reference<CGSize>): void;

declare function CTRunGetAdvancesPtr(run: any): interop.Reference<CGSize>;

declare function CTRunGetAttributes(run: any): NSDictionary<any, any>;

declare function CTRunGetGlyphCount(run: any): number;

declare function CTRunGetGlyphs(run: any, range: CFRange, buffer: interop.Reference<number>): void;

declare function CTRunGetGlyphsPtr(run: any): interop.Reference<number>;

declare function CTRunGetImageBounds(run: any, context: any, range: CFRange): CGRect;

declare function CTRunGetPositions(run: any, range: CFRange, buffer: interop.Reference<CGPoint>): void;

declare function CTRunGetPositionsPtr(run: any): interop.Reference<CGPoint>;

declare function CTRunGetStatus(run: any): CTRunStatus;

declare function CTRunGetStringIndices(run: any, range: CFRange, buffer: interop.Reference<number>): void;

declare function CTRunGetStringIndicesPtr(run: any): interop.Reference<number>;

declare function CTRunGetStringRange(run: any): CFRange;

declare function CTRunGetTextMatrix(run: any): CGAffineTransform;

declare function CTRunGetTypeID(): number;

declare function CTRunGetTypographicBounds(run: any, range: CFRange, ascent: interop.Reference<number>, descent: interop.Reference<number>, leading: interop.Reference<number>): number;

declare const enum CTRunStatus {

	kCTRunStatusNoStatus = 0,

	kCTRunStatusRightToLeft = 1,

	kCTRunStatusNonMonotonic = 2,

	kCTRunStatusHasNonIdentityMatrix = 4
}

declare const enum CTTextAlignment {

	kCTTextAlignmentLeft = 0,

	kCTTextAlignmentRight = 1,

	kCTTextAlignmentCenter = 2,

	kCTTextAlignmentJustified = 3,

	kCTTextAlignmentNatural = 4,

	kCTLeftTextAlignment = 0,

	kCTRightTextAlignment = 1,

	kCTCenterTextAlignment = 2,

	kCTJustifiedTextAlignment = 3,

	kCTNaturalTextAlignment = 4
}

declare function CTTextTabCreate(alignment: CTTextAlignment, location: number, options: NSDictionary<any, any>): any;

declare function CTTextTabGetAlignment(tab: any): CTTextAlignment;

declare function CTTextTabGetLocation(tab: any): number;

declare function CTTextTabGetOptions(tab: any): NSDictionary<any, any>;

declare function CTTextTabGetTypeID(): number;

declare function CTTypesetterCreateLine(typesetter: any, stringRange: CFRange): any;

declare function CTTypesetterCreateLineWithOffset(typesetter: any, stringRange: CFRange, offset: number): any;

declare function CTTypesetterCreateWithAttributedString(string: NSAttributedString): any;

declare function CTTypesetterCreateWithAttributedStringAndOptions(string: NSAttributedString, options: NSDictionary<any, any>): any;

declare function CTTypesetterGetTypeID(): number;

declare function CTTypesetterSuggestClusterBreak(typesetter: any, startIndex: number, width: number): number;

declare function CTTypesetterSuggestClusterBreakWithOffset(typesetter: any, startIndex: number, width: number, offset: number): number;

declare function CTTypesetterSuggestLineBreak(typesetter: any, startIndex: number, width: number): number;

declare function CTTypesetterSuggestLineBreakWithOffset(typesetter: any, startIndex: number, width: number, offset: number): number;

declare const enum CTUnderlineStyle {

	kCTUnderlineStyleNone = 0,

	kCTUnderlineStyleSingle = 1,

	kCTUnderlineStyleThick = 2,

	kCTUnderlineStyleDouble = 9
}

declare const enum CTUnderlineStyleModifiers {

	kCTUnderlinePatternSolid = 0,

	kCTUnderlinePatternDot = 256,

	kCTUnderlinePatternDash = 512,

	kCTUnderlinePatternDashDot = 768,

	kCTUnderlinePatternDashDotDot = 1024
}

declare const enum CTWritingDirection {

	kCTWritingDirectionNatural = -1,

	kCTWritingDirectionLeftToRight = 0,

	kCTWritingDirectionRightToLeft = 1
}

interface FontVariation {
	name: number;
	value: number;
}
declare var FontVariation: interop.StructType<FontVariation>;

interface JustPCAction {
	actionCount: number;
	actions: interop.Reference<JustPCActionSubrecord>;
}
declare var JustPCAction: interop.StructType<JustPCAction>;

interface JustPCActionSubrecord {
	theClass: number;
	theType: number;
	length: number;
	data: number;
}
declare var JustPCActionSubrecord: interop.StructType<JustPCActionSubrecord>;

interface JustPCConditionalAddAction {
	substThreshold: number;
	addGlyph: number;
	substGlyph: number;
}
declare var JustPCConditionalAddAction: interop.StructType<JustPCConditionalAddAction>;

interface JustPCDecompositionAction {
	lowerLimit: number;
	upperLimit: number;
	order: number;
	count: number;
	glyphs: interop.Reference<number>;
}
declare var JustPCDecompositionAction: interop.StructType<JustPCDecompositionAction>;

interface JustPCDuctilityAction {
	ductilityAxis: number;
	minimumLimit: number;
	noStretchValue: number;
	maximumLimit: number;
}
declare var JustPCDuctilityAction: interop.StructType<JustPCDuctilityAction>;

interface JustPCGlyphRepeatAddAction {
	flags: number;
	glyph: number;
}
declare var JustPCGlyphRepeatAddAction: interop.StructType<JustPCGlyphRepeatAddAction>;

interface JustTable {
	version: number;
	format: number;
	horizHeaderOffset: number;
	vertHeaderOffset: number;
}
declare var JustTable: interop.StructType<JustTable>;

interface JustWidthDeltaEntry {
	justClass: number;
	beforeGrowLimit: number;
	beforeShrinkLimit: number;
	afterGrowLimit: number;
	afterShrinkLimit: number;
	growFlags: number;
	shrinkFlags: number;
}
declare var JustWidthDeltaEntry: interop.StructType<JustWidthDeltaEntry>;

interface JustWidthDeltaGroup {
	count: number;
	entries: interop.Reference<JustWidthDeltaEntry>;
}
declare var JustWidthDeltaGroup: interop.StructType<JustWidthDeltaGroup>;

interface KernIndexArrayHeader {
	glyphCount: number;
	kernValueCount: number;
	leftClassCount: number;
	rightClassCount: number;
	flags: number;
	kernValue: interop.Reference<number>;
	leftClass: interop.Reference<number>;
	rightClass: interop.Reference<number>;
	kernIndex: interop.Reference<number>;
}
declare var KernIndexArrayHeader: interop.StructType<KernIndexArrayHeader>;

interface KernKerningPair {
	left: number;
	right: number;
}
declare var KernKerningPair: interop.StructType<KernKerningPair>;

interface KernOffsetTable {
	firstGlyph: number;
	nGlyphs: number;
	offsetTable: interop.Reference<number>;
}
declare var KernOffsetTable: interop.StructType<KernOffsetTable>;

interface KernOrderedListEntry {
	pair: KernKerningPair;
	value: number;
}
declare var KernOrderedListEntry: interop.StructType<KernOrderedListEntry>;

interface KernOrderedListHeader {
	nPairs: number;
	searchRange: number;
	entrySelector: number;
	rangeShift: number;
	table: interop.Reference<number>;
}
declare var KernOrderedListHeader: interop.StructType<KernOrderedListHeader>;

interface KernSimpleArrayHeader {
	rowWidth: number;
	leftOffsetTable: number;
	rightOffsetTable: number;
	theArray: number;
	firstTable: interop.Reference<number>;
}
declare var KernSimpleArrayHeader: interop.StructType<KernSimpleArrayHeader>;

interface KernStateEntry {
	newState: number;
	flags: number;
}
declare var KernStateEntry: interop.StructType<KernStateEntry>;

interface KernStateHeader {
	header: STHeader;
	valueTable: number;
	firstTable: interop.Reference<number>;
}
declare var KernStateHeader: interop.StructType<KernStateHeader>;

interface KernTableHeader {
	version: number;
	nTables: number;
	firstSubtable: interop.Reference<number>;
}
declare var KernTableHeader: interop.StructType<KernTableHeader>;

interface KernVersion0Header {
	version: number;
	nTables: number;
	firstSubtable: interop.Reference<number>;
}
declare var KernVersion0Header: interop.StructType<KernVersion0Header>;

interface KerxAnchorPointAction {
	markAnchorPoint: number;
	currAnchorPoint: number;
}
declare var KerxAnchorPointAction: interop.StructType<KerxAnchorPointAction>;

interface KerxControlPointAction {
	markControlPoint: number;
	currControlPoint: number;
}
declare var KerxControlPointAction: interop.StructType<KerxControlPointAction>;

interface KerxControlPointEntry {
	newState: number;
	flags: number;
	actionIndex: number;
}
declare var KerxControlPointEntry: interop.StructType<KerxControlPointEntry>;

interface KerxControlPointHeader {
	header: STXHeader;
	flags: number;
	firstTable: interop.Reference<number>;
}
declare var KerxControlPointHeader: interop.StructType<KerxControlPointHeader>;

interface KerxCoordinateAction {
	markX: number;
	markY: number;
	currX: number;
	currY: number;
}
declare var KerxCoordinateAction: interop.StructType<KerxCoordinateAction>;

interface KerxIndexArrayHeader {
	glyphCount: number;
	kernValueCount: number;
	leftClassCount: number;
	rightClassCount: number;
	flags: number;
	kernValue: interop.Reference<number>;
	leftClass: interop.Reference<number>;
	rightClass: interop.Reference<number>;
	kernIndex: interop.Reference<number>;
}
declare var KerxIndexArrayHeader: interop.StructType<KerxIndexArrayHeader>;

interface KerxKerningPair {
	left: number;
	right: number;
}
declare var KerxKerningPair: interop.StructType<KerxKerningPair>;

interface KerxOrderedListEntry {
	pair: KerxKerningPair;
	value: number;
}
declare var KerxOrderedListEntry: interop.StructType<KerxOrderedListEntry>;

interface KerxOrderedListHeader {
	nPairs: number;
	searchRange: number;
	entrySelector: number;
	rangeShift: number;
	table: interop.Reference<number>;
}
declare var KerxOrderedListHeader: interop.StructType<KerxOrderedListHeader>;

interface KerxSimpleArrayHeader {
	rowWidth: number;
	leftOffsetTable: number;
	rightOffsetTable: number;
	theArray: number;
	firstTable: interop.Reference<number>;
}
declare var KerxSimpleArrayHeader: interop.StructType<KerxSimpleArrayHeader>;

interface KerxStateEntry {
	newState: number;
	flags: number;
	valueIndex: number;
}
declare var KerxStateEntry: interop.StructType<KerxStateEntry>;

interface KerxStateHeader {
	header: STXHeader;
	valueTable: number;
	firstTable: interop.Reference<number>;
}
declare var KerxStateHeader: interop.StructType<KerxStateHeader>;

interface KerxTableHeader {
	version: number;
	nTables: number;
	firstSubtable: interop.Reference<number>;
}
declare var KerxTableHeader: interop.StructType<KerxTableHeader>;

interface LcarCaretClassEntry {
	count: number;
	partials: interop.Reference<number>;
}
declare var LcarCaretClassEntry: interop.StructType<LcarCaretClassEntry>;

interface LtagStringRange {
	offset: number;
	length: number;
}
declare var LtagStringRange: interop.StructType<LtagStringRange>;

interface LtagTable {
	version: number;
	flags: number;
	numTags: number;
	tagRange: interop.Reference<LtagStringRange>;
}
declare var LtagTable: interop.StructType<LtagTable>;

interface MortChain {
	defaultFlags: number;
	length: number;
	nFeatures: number;
	nSubtables: number;
	featureEntries: interop.Reference<MortFeatureEntry>;
}
declare var MortChain: interop.StructType<MortChain>;

interface MortContextualSubtable {
	header: STHeader;
	substitutionTableOffset: number;
}
declare var MortContextualSubtable: interop.StructType<MortContextualSubtable>;

interface MortFeatureEntry {
	featureType: number;
	featureSelector: number;
	enableFlags: number;
	disableFlags: number;
}
declare var MortFeatureEntry: interop.StructType<MortFeatureEntry>;

interface MortInsertionSubtable {
	header: STHeader;
}
declare var MortInsertionSubtable: interop.StructType<MortInsertionSubtable>;

interface MortLigatureSubtable {
	header: STHeader;
	ligatureActionTableOffset: number;
	componentTableOffset: number;
	ligatureTableOffset: number;
}
declare var MortLigatureSubtable: interop.StructType<MortLigatureSubtable>;

interface MortRearrangementSubtable {
	header: STHeader;
}
declare var MortRearrangementSubtable: interop.StructType<MortRearrangementSubtable>;

interface MortTable {
	version: number;
	nChains: number;
	chains: interop.Reference<MortChain>;
}
declare var MortTable: interop.StructType<MortTable>;

interface MorxChain {
	defaultFlags: number;
	length: number;
	nFeatures: number;
	nSubtables: number;
	featureEntries: interop.Reference<MortFeatureEntry>;
}
declare var MorxChain: interop.StructType<MorxChain>;

interface MorxContextualSubtable {
	header: STXHeader;
	substitutionTableOffset: number;
}
declare var MorxContextualSubtable: interop.StructType<MorxContextualSubtable>;

interface MorxInsertionSubtable {
	header: STXHeader;
	insertionGlyphTableOffset: number;
}
declare var MorxInsertionSubtable: interop.StructType<MorxInsertionSubtable>;

interface MorxLigatureSubtable {
	header: STXHeader;
	ligatureActionTableOffset: number;
	componentTableOffset: number;
	ligatureTableOffset: number;
}
declare var MorxLigatureSubtable: interop.StructType<MorxLigatureSubtable>;

interface MorxRearrangementSubtable {
	header: STXHeader;
}
declare var MorxRearrangementSubtable: interop.StructType<MorxRearrangementSubtable>;

interface MorxTable {
	version: number;
	nChains: number;
	chains: interop.Reference<MorxChain>;
}
declare var MorxTable: interop.StructType<MorxTable>;

interface OpbdSideValues {
	leftSideShift: number;
	topSideShift: number;
	rightSideShift: number;
	bottomSideShift: number;
}
declare var OpbdSideValues: interop.StructType<OpbdSideValues>;

interface PropLookupSegment {
	lastGlyph: number;
	firstGlyph: number;
	value: number;
}
declare var PropLookupSegment: interop.StructType<PropLookupSegment>;

interface PropLookupSingle {
	glyph: number;
	props: number;
}
declare var PropLookupSingle: interop.StructType<PropLookupSingle>;

interface ROTAGlyphEntry {
	GlyphIndexOffset: number;
	HBaselineOffset: number;
	VBaselineOffset: number;
}
declare var ROTAGlyphEntry: interop.StructType<ROTAGlyphEntry>;

interface SFNTLookupArrayHeader {
	lookupValues: interop.Reference<number>;
}
declare var SFNTLookupArrayHeader: interop.StructType<SFNTLookupArrayHeader>;

interface SFNTLookupBinarySearchHeader {
	unitSize: number;
	nUnits: number;
	searchRange: number;
	entrySelector: number;
	rangeShift: number;
}
declare var SFNTLookupBinarySearchHeader: interop.StructType<SFNTLookupBinarySearchHeader>;

interface SFNTLookupSegment {
	lastGlyph: number;
	firstGlyph: number;
	value: interop.Reference<number>;
}
declare var SFNTLookupSegment: interop.StructType<SFNTLookupSegment>;

interface SFNTLookupSegmentHeader {
	binSearch: SFNTLookupBinarySearchHeader;
	segments: interop.Reference<SFNTLookupSegment>;
}
declare var SFNTLookupSegmentHeader: interop.StructType<SFNTLookupSegmentHeader>;

interface SFNTLookupSingle {
	glyph: number;
	value: interop.Reference<number>;
}
declare var SFNTLookupSingle: interop.StructType<SFNTLookupSingle>;

interface SFNTLookupSingleHeader {
	binSearch: SFNTLookupBinarySearchHeader;
	entries: interop.Reference<SFNTLookupSingle>;
}
declare var SFNTLookupSingleHeader: interop.StructType<SFNTLookupSingleHeader>;

interface SFNTLookupTrimmedArrayHeader {
	firstGlyph: number;
	count: number;
	valueArray: interop.Reference<number>;
}
declare var SFNTLookupTrimmedArrayHeader: interop.StructType<SFNTLookupTrimmedArrayHeader>;

interface STClassTable {
	firstGlyph: number;
	nGlyphs: number;
	classes: interop.Reference<number>;
}
declare var STClassTable: interop.StructType<STClassTable>;

interface STEntryOne {
	newState: number;
	flags: number;
	offset1: number;
}
declare var STEntryOne: interop.StructType<STEntryOne>;

interface STEntryTwo {
	newState: number;
	flags: number;
	offset1: number;
	offset2: number;
}
declare var STEntryTwo: interop.StructType<STEntryTwo>;

interface STEntryZero {
	newState: number;
	flags: number;
}
declare var STEntryZero: interop.StructType<STEntryZero>;

interface STHeader {
	filler: number;
	nClasses: number;
	classTableOffset: number;
	stateArrayOffset: number;
	entryTableOffset: number;
}
declare var STHeader: interop.StructType<STHeader>;

interface STXEntryOne {
	newState: number;
	flags: number;
	index1: number;
}
declare var STXEntryOne: interop.StructType<STXEntryOne>;

interface STXEntryTwo {
	newState: number;
	flags: number;
	index1: number;
	index2: number;
}
declare var STXEntryTwo: interop.StructType<STXEntryTwo>;

interface STXEntryZero {
	newState: number;
	flags: number;
}
declare var STXEntryZero: interop.StructType<STXEntryZero>;

interface STXHeader {
	nClasses: number;
	classTableOffset: number;
	stateArrayOffset: number;
	entryTableOffset: number;
}
declare var STXHeader: interop.StructType<STXHeader>;

interface TrakTable {
	version: number;
	format: number;
	horizOffset: number;
	vertOffset: number;
}
declare var TrakTable: interop.StructType<TrakTable>;

interface TrakTableData {
	nTracks: number;
	nSizes: number;
	sizeTableOffset: number;
	trakTable: interop.Reference<TrakTableEntry>;
}
declare var TrakTableData: interop.StructType<TrakTableData>;

interface TrakTableEntry {
	track: number;
	nameTableIndex: number;
	sizesOffset: number;
}
declare var TrakTableEntry: interop.StructType<TrakTableEntry>;

declare var kCTBaselineClassAttributeName: string;

declare var kCTBaselineClassHanging: string;

declare var kCTBaselineClassIdeographicCentered: string;

declare var kCTBaselineClassIdeographicHigh: string;

declare var kCTBaselineClassIdeographicLow: string;

declare var kCTBaselineClassMath: string;

declare var kCTBaselineClassRoman: string;

declare var kCTBaselineInfoAttributeName: string;

declare var kCTBaselineOriginalFont: string;

declare var kCTBaselineReferenceFont: string;

declare var kCTBaselineReferenceInfoAttributeName: string;

declare var kCTCharacterShapeAttributeName: string;

declare var kCTFontAttributeName: string;

declare var kCTFontBaselineAdjustAttribute: string;

declare var kCTFontCascadeListAttribute: string;

declare var kCTFontCharacterSetAttribute: string;

declare var kCTFontCollectionRemoveDuplicatesOption: string;

declare var kCTFontCopyrightNameKey: string;

declare var kCTFontDescriptionNameKey: string;

declare var kCTFontDescriptorMatchingCurrentAssetSize: string;

declare var kCTFontDescriptorMatchingDescriptors: string;

declare var kCTFontDescriptorMatchingError: string;

declare var kCTFontDescriptorMatchingPercentage: string;

declare var kCTFontDescriptorMatchingResult: string;

declare var kCTFontDescriptorMatchingSourceDescriptor: string;

declare var kCTFontDescriptorMatchingTotalAssetSize: string;

declare var kCTFontDescriptorMatchingTotalDownloadedSize: string;

declare var kCTFontDesignerNameKey: string;

declare var kCTFontDesignerURLNameKey: string;

declare var kCTFontDisplayNameAttribute: string;

declare var kCTFontDownloadableAttribute: string;

declare var kCTFontDownloadedAttribute: string;

declare var kCTFontEnabledAttribute: string;

declare var kCTFontFamilyNameAttribute: string;

declare var kCTFontFamilyNameKey: string;

declare var kCTFontFeatureSelectorDefaultKey: string;

declare var kCTFontFeatureSelectorIdentifierKey: string;

declare var kCTFontFeatureSelectorNameKey: string;

declare var kCTFontFeatureSelectorSettingKey: string;

declare var kCTFontFeatureSettingsAttribute: string;

declare var kCTFontFeatureTypeExclusiveKey: string;

declare var kCTFontFeatureTypeIdentifierKey: string;

declare var kCTFontFeatureTypeNameKey: string;

declare var kCTFontFeatureTypeSelectorsKey: string;

declare var kCTFontFeaturesAttribute: string;

declare var kCTFontFixedAdvanceAttribute: string;

declare var kCTFontFormatAttribute: string;

declare var kCTFontFullNameKey: string;

declare var kCTFontLanguagesAttribute: string;

declare var kCTFontLicenseNameKey: string;

declare var kCTFontLicenseURLNameKey: string;

declare var kCTFontMacintoshEncodingsAttribute: string;

declare var kCTFontManagerErrorDomain: string;

declare var kCTFontManagerErrorFontURLsKey: string;

declare var kCTFontManagerRegisteredFontsChangedNotification: string;

declare var kCTFontManufacturerNameKey: string;

declare var kCTFontMatrixAttribute: string;

declare var kCTFontNameAttribute: string;

declare var kCTFontOpenTypeFeatureTag: string;

declare var kCTFontOpenTypeFeatureValue: string;

declare var kCTFontOrientationAttribute: string;

declare var kCTFontPostScriptCIDNameKey: string;

declare var kCTFontPostScriptNameKey: string;

declare var kCTFontPriorityAttribute: string;

declare var kCTFontRegistrationScopeAttribute: string;

declare var kCTFontSampleTextNameKey: string;

declare var kCTFontSizeAttribute: string;

declare var kCTFontSlantTrait: string;

declare var kCTFontStyleNameAttribute: string;

declare var kCTFontStyleNameKey: string;

declare var kCTFontSubFamilyNameKey: string;

declare var kCTFontSymbolicTrait: string;

declare var kCTFontTrademarkNameKey: string;

declare var kCTFontTraitsAttribute: string;

declare var kCTFontURLAttribute: string;

declare var kCTFontUniqueNameKey: string;

declare var kCTFontVariationAttribute: string;

declare var kCTFontVariationAxisDefaultValueKey: string;

declare var kCTFontVariationAxisIdentifierKey: string;

declare var kCTFontVariationAxisMaximumValueKey: string;

declare var kCTFontVariationAxisMinimumValueKey: string;

declare var kCTFontVariationAxisNameKey: string;

declare var kCTFontVendorURLNameKey: string;

declare var kCTFontVersionNameKey: string;

declare var kCTFontWeightTrait: string;

declare var kCTFontWidthTrait: string;

declare var kCTForegroundColorAttributeName: string;

declare var kCTForegroundColorFromContextAttributeName: string;

declare var kCTFrameClippingPathsAttributeName: string;

declare var kCTFramePathClippingPathAttributeName: string;

declare var kCTFramePathFillRuleAttributeName: string;

declare var kCTFramePathWidthAttributeName: string;

declare var kCTFrameProgressionAttributeName: string;

declare var kCTGlyphInfoAttributeName: string;

declare var kCTKernAttributeName: string;

declare var kCTLanguageAttributeName: string;

declare var kCTLigatureAttributeName: string;

declare var kCTParagraphStyleAttributeName: string;

declare var kCTRubyAnnotationAttributeName: string;

declare var kCTRunDelegateAttributeName: string;

declare var kCTStrokeColorAttributeName: string;

declare var kCTStrokeWidthAttributeName: string;

declare var kCTSuperscriptAttributeName: string;

declare var kCTTabColumnTerminatorsAttributeName: string;

declare var kCTTypesetterOptionDisableBidiProcessing: string;

declare var kCTTypesetterOptionForcedEmbeddingLevel: string;

declare var kCTUnderlineColorAttributeName: string;

declare var kCTUnderlineStyleAttributeName: string;

declare var kCTVerticalFormsAttributeName: string;

declare var kCTWritingDirectionAttributeName: string;

interface sfntCMapEncoding {
	platformID: number;
	scriptID: number;
	offset: number;
}
declare var sfntCMapEncoding: interop.StructType<sfntCMapEncoding>;

interface sfntCMapExtendedSubHeader {
	format: number;
	reserved: number;
	length: number;
	language: number;
}
declare var sfntCMapExtendedSubHeader: interop.StructType<sfntCMapExtendedSubHeader>;

interface sfntCMapHeader {
	version: number;
	numTables: number;
	encoding: interop.Reference<sfntCMapEncoding>;
}
declare var sfntCMapHeader: interop.StructType<sfntCMapHeader>;

interface sfntCMapSubHeader {
	format: number;
	length: number;
	languageID: number;
}
declare var sfntCMapSubHeader: interop.StructType<sfntCMapSubHeader>;

interface sfntDescriptorHeader {
	version: number;
	descriptorCount: number;
	descriptor: interop.Reference<sfntFontDescriptor>;
}
declare var sfntDescriptorHeader: interop.StructType<sfntDescriptorHeader>;

interface sfntDirectory {
	format: number;
	numOffsets: number;
	searchRange: number;
	entrySelector: number;
	rangeShift: number;
	table: interop.Reference<sfntDirectoryEntry>;
}
declare var sfntDirectory: interop.StructType<sfntDirectory>;

interface sfntDirectoryEntry {
	tableTag: number;
	checkSum: number;
	offset: number;
	length: number;
}
declare var sfntDirectoryEntry: interop.StructType<sfntDirectoryEntry>;

interface sfntFeatureHeader {
	version: number;
	featureNameCount: number;
	featureSetCount: number;
	reserved: number;
	names: interop.Reference<sfntFeatureName>;
	settings: interop.Reference<sfntFontFeatureSetting>;
	runs: interop.Reference<sfntFontRunFeature>;
}
declare var sfntFeatureHeader: interop.StructType<sfntFeatureHeader>;

interface sfntFeatureName {
	featureType: number;
	settingCount: number;
	offsetToSettings: number;
	featureFlags: number;
	nameID: number;
}
declare var sfntFeatureName: interop.StructType<sfntFeatureName>;

interface sfntFontDescriptor {
	name: number;
	value: number;
}
declare var sfntFontDescriptor: interop.StructType<sfntFontDescriptor>;

interface sfntFontFeatureSetting {
	setting: number;
	nameID: number;
}
declare var sfntFontFeatureSetting: interop.StructType<sfntFontFeatureSetting>;

interface sfntFontRunFeature {
	featureType: number;
	setting: number;
}
declare var sfntFontRunFeature: interop.StructType<sfntFontRunFeature>;

interface sfntInstance {
	nameID: number;
	flags: number;
	coord: interop.Reference<number>;
}
declare var sfntInstance: interop.StructType<sfntInstance>;

interface sfntNameHeader {
	format: number;
	count: number;
	stringOffset: number;
	rec: interop.Reference<sfntNameRecord>;
}
declare var sfntNameHeader: interop.StructType<sfntNameHeader>;

interface sfntNameRecord {
	platformID: number;
	scriptID: number;
	languageID: number;
	nameID: number;
	length: number;
	offset: number;
}
declare var sfntNameRecord: interop.StructType<sfntNameRecord>;

interface sfntVariationAxis {
	axisTag: number;
	minValue: number;
	defaultValue: number;
	maxValue: number;
	flags: number;
	nameID: number;
}
declare var sfntVariationAxis: interop.StructType<sfntVariationAxis>;

interface sfntVariationHeader {
	version: number;
	offsetToData: number;
	countSizePairs: number;
	axisCount: number;
	axisSize: number;
	instanceCount: number;
	instanceSize: number;
	axis: interop.Reference<sfntVariationAxis>;
	instance: interop.Reference<sfntInstance>;
}
declare var sfntVariationHeader: interop.StructType<sfntVariationHeader>;
