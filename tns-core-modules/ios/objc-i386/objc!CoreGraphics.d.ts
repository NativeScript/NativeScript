
interface CGAffineTransform {
	a: number;
	b: number;
	c: number;
	d: number;
	tx: number;
	ty: number;
}
declare var CGAffineTransform: interop.StructType<CGAffineTransform>;

declare function CGAffineTransformConcat(t1: CGAffineTransform, t2: CGAffineTransform): CGAffineTransform;

declare function CGAffineTransformEqualToTransform(t1: CGAffineTransform, t2: CGAffineTransform): boolean;

declare var CGAffineTransformIdentity: CGAffineTransform;

declare function CGAffineTransformInvert(t: CGAffineTransform): CGAffineTransform;

declare function CGAffineTransformIsIdentity(t: CGAffineTransform): boolean;

declare function CGAffineTransformMake(a: number, b: number, c: number, d: number, tx: number, ty: number): CGAffineTransform;

declare function CGAffineTransformMakeRotation(angle: number): CGAffineTransform;

declare function CGAffineTransformMakeScale(sx: number, sy: number): CGAffineTransform;

declare function CGAffineTransformMakeTranslation(tx: number, ty: number): CGAffineTransform;

declare function CGAffineTransformRotate(t: CGAffineTransform, angle: number): CGAffineTransform;

declare function CGAffineTransformScale(t: CGAffineTransform, sx: number, sy: number): CGAffineTransform;

declare function CGAffineTransformTranslate(t: CGAffineTransform, tx: number, ty: number): CGAffineTransform;

declare function CGBitmapContextCreate(data: interop.Pointer, width: number, height: number, bitsPerComponent: number, bytesPerRow: number, space: any, bitmapInfo: number): any;

declare function CGBitmapContextCreateImage(context: any): any;

declare function CGBitmapContextCreateWithData(data: interop.Pointer, width: number, height: number, bitsPerComponent: number, bytesPerRow: number, space: any, bitmapInfo: number, releaseCallback: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>, releaseInfo: interop.Pointer): any;

declare function CGBitmapContextGetAlphaInfo(context: any): CGImageAlphaInfo;

declare function CGBitmapContextGetBitmapInfo(context: any): CGBitmapInfo;

declare function CGBitmapContextGetBitsPerComponent(context: any): number;

declare function CGBitmapContextGetBitsPerPixel(context: any): number;

declare function CGBitmapContextGetBytesPerRow(context: any): number;

declare function CGBitmapContextGetColorSpace(context: any): any;

declare function CGBitmapContextGetData(context: any): interop.Pointer;

declare function CGBitmapContextGetHeight(context: any): number;

declare function CGBitmapContextGetWidth(context: any): number;

declare const enum CGBitmapInfo {

	kCGBitmapAlphaInfoMask = 31,

	kCGBitmapFloatInfoMask = 3840,

	kCGBitmapFloatComponents = 256,

	kCGBitmapByteOrderMask = 28672,

	kCGBitmapByteOrderDefault = 0,

	kCGBitmapByteOrder16Little = 4096,

	kCGBitmapByteOrder32Little = 8192,

	kCGBitmapByteOrder16Big = 12288,

	kCGBitmapByteOrder32Big = 16384
}

declare const enum CGBlendMode {

	kCGBlendModeNormal = 0,

	kCGBlendModeMultiply = 1,

	kCGBlendModeScreen = 2,

	kCGBlendModeOverlay = 3,

	kCGBlendModeDarken = 4,

	kCGBlendModeLighten = 5,

	kCGBlendModeColorDodge = 6,

	kCGBlendModeColorBurn = 7,

	kCGBlendModeSoftLight = 8,

	kCGBlendModeHardLight = 9,

	kCGBlendModeDifference = 10,

	kCGBlendModeExclusion = 11,

	kCGBlendModeHue = 12,

	kCGBlendModeSaturation = 13,

	kCGBlendModeColor = 14,

	kCGBlendModeLuminosity = 15,

	kCGBlendModeClear = 16,

	kCGBlendModeCopy = 17,

	kCGBlendModeSourceIn = 18,

	kCGBlendModeSourceOut = 19,

	kCGBlendModeSourceAtop = 20,

	kCGBlendModeDestinationOver = 21,

	kCGBlendModeDestinationIn = 22,

	kCGBlendModeDestinationOut = 23,

	kCGBlendModeDestinationAtop = 24,

	kCGBlendModeXOR = 25,

	kCGBlendModePlusDarker = 26,

	kCGBlendModePlusLighter = 27
}

declare function CGColorConverterCreateSimple(from: any, to: any): interop.Pointer;

declare function CGColorConverterGetTypeID(): number;

declare function CGColorConverterRelease(p1: interop.Pointer): void;

declare const enum CGColorConverterTransformType {

	kCGColorConverterTransformFromSpace = 0,

	kCGColorConverterTransformToSpace = 1,

	kCGColorConverterTransformApplySpace = 2
}

declare function CGColorCreate(space: any, components: interop.Reference<number>): any;

declare function CGColorCreateCopy(color: any): any;

declare function CGColorCreateCopyByMatchingToColorSpace(p1: any, intent: CGColorRenderingIntent, color: any, options: NSDictionary<any, any>): any;

declare function CGColorCreateCopyWithAlpha(color: any, alpha: number): any;

declare function CGColorCreateWithPattern(space: any, pattern: any, components: interop.Reference<number>): any;

declare function CGColorEqualToColor(color1: any, color2: any): boolean;

declare function CGColorGetAlpha(color: any): number;

declare function CGColorGetColorSpace(color: any): any;

declare function CGColorGetComponents(color: any): interop.Reference<number>;

declare function CGColorGetNumberOfComponents(color: any): number;

declare function CGColorGetPattern(color: any): any;

declare function CGColorGetTypeID(): number;

declare function CGColorRelease(color: any): void;

declare const enum CGColorRenderingIntent {

	kCGRenderingIntentDefault = 0,

	kCGRenderingIntentAbsoluteColorimetric = 1,

	kCGRenderingIntentRelativeColorimetric = 2,

	kCGRenderingIntentPerceptual = 3,

	kCGRenderingIntentSaturation = 4
}

declare function CGColorRetain(color: any): any;

declare function CGColorSpaceCopyICCProfile(space: any): NSData;

declare function CGColorSpaceCreateCalibratedGray(whitePoint: interop.Reference<number>, blackPoint: interop.Reference<number>, gamma: number): any;

declare function CGColorSpaceCreateCalibratedRGB(whitePoint: interop.Reference<number>, blackPoint: interop.Reference<number>, gamma: interop.Reference<number>, matrix: interop.Reference<number>): any;

declare function CGColorSpaceCreateDeviceCMYK(): any;

declare function CGColorSpaceCreateDeviceGray(): any;

declare function CGColorSpaceCreateDeviceRGB(): any;

declare function CGColorSpaceCreateICCBased(nComponents: number, range: interop.Reference<number>, profile: any, alternate: any): any;

declare function CGColorSpaceCreateIndexed(baseSpace: any, lastIndex: number, colorTable: string): any;

declare function CGColorSpaceCreateLab(whitePoint: interop.Reference<number>, blackPoint: interop.Reference<number>, range: interop.Reference<number>): any;

declare function CGColorSpaceCreatePattern(baseSpace: any): any;

declare function CGColorSpaceCreateWithICCProfile(data: NSData): any;

declare function CGColorSpaceCreateWithName(name: string): any;

declare function CGColorSpaceCreateWithPlatformColorSpace(ref: interop.Pointer): any;

declare function CGColorSpaceGetBaseColorSpace(space: any): any;

declare function CGColorSpaceGetColorTable(space: any, table: string): void;

declare function CGColorSpaceGetColorTableCount(space: any): number;

declare function CGColorSpaceGetModel(space: any): CGColorSpaceModel;

declare function CGColorSpaceGetNumberOfComponents(space: any): number;

declare function CGColorSpaceGetTypeID(): number;

declare const enum CGColorSpaceModel {

	kCGColorSpaceModelUnknown = -1,

	kCGColorSpaceModelMonochrome = 0,

	kCGColorSpaceModelRGB = 1,

	kCGColorSpaceModelCMYK = 2,

	kCGColorSpaceModelLab = 3,

	kCGColorSpaceModelDeviceN = 4,

	kCGColorSpaceModelIndexed = 5,

	kCGColorSpaceModelPattern = 6
}

declare function CGColorSpaceRelease(space: any): void;

declare function CGColorSpaceRetain(space: any): any;

declare function CGContextAddArc(c: any, x: number, y: number, radius: number, startAngle: number, endAngle: number, clockwise: number): void;

declare function CGContextAddArcToPoint(c: any, x1: number, y1: number, x2: number, y2: number, radius: number): void;

declare function CGContextAddCurveToPoint(c: any, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

declare function CGContextAddEllipseInRect(c: any, rect: CGRect): void;

declare function CGContextAddLineToPoint(c: any, x: number, y: number): void;

declare function CGContextAddLines(c: any, points: interop.Reference<CGPoint>, count: number): void;

declare function CGContextAddPath(c: any, path: any): void;

declare function CGContextAddQuadCurveToPoint(c: any, cpx: number, cpy: number, x: number, y: number): void;

declare function CGContextAddRect(c: any, rect: CGRect): void;

declare function CGContextAddRects(c: any, rects: interop.Reference<CGRect>, count: number): void;

declare function CGContextBeginPage(c: any, mediaBox: interop.Reference<CGRect>): void;

declare function CGContextBeginPath(c: any): void;

declare function CGContextBeginTransparencyLayer(c: any, auxiliaryInfo: NSDictionary<any, any>): void;

declare function CGContextBeginTransparencyLayerWithRect(c: any, rect: CGRect, auxInfo: NSDictionary<any, any>): void;

declare function CGContextClearRect(c: any, rect: CGRect): void;

declare function CGContextClip(c: any): void;

declare function CGContextClipToMask(c: any, rect: CGRect, mask: any): void;

declare function CGContextClipToRect(c: any, rect: CGRect): void;

declare function CGContextClipToRects(c: any, rects: interop.Reference<CGRect>, count: number): void;

declare function CGContextClosePath(c: any): void;

declare function CGContextConcatCTM(c: any, transform: CGAffineTransform): void;

declare function CGContextConvertPointToDeviceSpace(c: any, point: CGPoint): CGPoint;

declare function CGContextConvertPointToUserSpace(c: any, point: CGPoint): CGPoint;

declare function CGContextConvertRectToDeviceSpace(c: any, rect: CGRect): CGRect;

declare function CGContextConvertRectToUserSpace(c: any, rect: CGRect): CGRect;

declare function CGContextConvertSizeToDeviceSpace(c: any, size: CGSize): CGSize;

declare function CGContextConvertSizeToUserSpace(c: any, size: CGSize): CGSize;

declare function CGContextCopyPath(c: any): any;

declare function CGContextDrawImage(c: any, rect: CGRect, image: any): void;

declare function CGContextDrawLayerAtPoint(context: any, point: CGPoint, layer: any): void;

declare function CGContextDrawLayerInRect(context: any, rect: CGRect, layer: any): void;

declare function CGContextDrawLinearGradient(c: any, gradient: any, startPoint: CGPoint, endPoint: CGPoint, options: CGGradientDrawingOptions): void;

declare function CGContextDrawPDFPage(c: any, page: any): void;

declare function CGContextDrawPath(c: any, mode: CGPathDrawingMode): void;

declare function CGContextDrawRadialGradient(c: any, gradient: any, startCenter: CGPoint, startRadius: number, endCenter: CGPoint, endRadius: number, options: CGGradientDrawingOptions): void;

declare function CGContextDrawShading(c: any, shading: any): void;

declare function CGContextDrawTiledImage(c: any, rect: CGRect, image: any): void;

declare function CGContextEOClip(c: any): void;

declare function CGContextEOFillPath(c: any): void;

declare function CGContextEndPage(c: any): void;

declare function CGContextEndTransparencyLayer(c: any): void;

declare function CGContextFillEllipseInRect(c: any, rect: CGRect): void;

declare function CGContextFillPath(c: any): void;

declare function CGContextFillRect(c: any, rect: CGRect): void;

declare function CGContextFillRects(c: any, rects: interop.Reference<CGRect>, count: number): void;

declare function CGContextFlush(c: any): void;

declare function CGContextGetCTM(c: any): CGAffineTransform;

declare function CGContextGetClipBoundingBox(c: any): CGRect;

declare function CGContextGetInterpolationQuality(c: any): CGInterpolationQuality;

declare function CGContextGetPathBoundingBox(c: any): CGRect;

declare function CGContextGetPathCurrentPoint(c: any): CGPoint;

declare function CGContextGetTextMatrix(c: any): CGAffineTransform;

declare function CGContextGetTextPosition(c: any): CGPoint;

declare function CGContextGetTypeID(): number;

declare function CGContextGetUserSpaceToDeviceSpaceTransform(c: any): CGAffineTransform;

declare function CGContextIsPathEmpty(c: any): boolean;

declare function CGContextMoveToPoint(c: any, x: number, y: number): void;

declare function CGContextPathContainsPoint(c: any, point: CGPoint, mode: CGPathDrawingMode): boolean;

declare function CGContextRelease(c: any): void;

declare function CGContextReplacePathWithStrokedPath(c: any): void;

declare function CGContextRestoreGState(c: any): void;

declare function CGContextRetain(c: any): any;

declare function CGContextRotateCTM(c: any, angle: number): void;

declare function CGContextSaveGState(c: any): void;

declare function CGContextScaleCTM(c: any, sx: number, sy: number): void;

declare function CGContextSelectFont(c: any, name: string, size: number, textEncoding: CGTextEncoding): void;

declare function CGContextSetAllowsAntialiasing(c: any, allowsAntialiasing: boolean): void;

declare function CGContextSetAllowsFontSmoothing(c: any, allowsFontSmoothing: boolean): void;

declare function CGContextSetAllowsFontSubpixelPositioning(c: any, allowsFontSubpixelPositioning: boolean): void;

declare function CGContextSetAllowsFontSubpixelQuantization(c: any, allowsFontSubpixelQuantization: boolean): void;

declare function CGContextSetAlpha(c: any, alpha: number): void;

declare function CGContextSetBlendMode(c: any, mode: CGBlendMode): void;

declare function CGContextSetCMYKFillColor(c: any, cyan: number, magenta: number, yellow: number, black: number, alpha: number): void;

declare function CGContextSetCMYKStrokeColor(c: any, cyan: number, magenta: number, yellow: number, black: number, alpha: number): void;

declare function CGContextSetCharacterSpacing(c: any, spacing: number): void;

declare function CGContextSetFillColor(c: any, components: interop.Reference<number>): void;

declare function CGContextSetFillColorSpace(c: any, space: any): void;

declare function CGContextSetFillColorWithColor(c: any, color: any): void;

declare function CGContextSetFillPattern(c: any, pattern: any, components: interop.Reference<number>): void;

declare function CGContextSetFlatness(c: any, flatness: number): void;

declare function CGContextSetFont(c: any, font: any): void;

declare function CGContextSetFontSize(c: any, size: number): void;

declare function CGContextSetGrayFillColor(c: any, gray: number, alpha: number): void;

declare function CGContextSetGrayStrokeColor(c: any, gray: number, alpha: number): void;

declare function CGContextSetInterpolationQuality(c: any, quality: CGInterpolationQuality): void;

declare function CGContextSetLineCap(c: any, cap: CGLineCap): void;

declare function CGContextSetLineDash(c: any, phase: number, lengths: interop.Reference<number>, count: number): void;

declare function CGContextSetLineJoin(c: any, join: CGLineJoin): void;

declare function CGContextSetLineWidth(c: any, width: number): void;

declare function CGContextSetMiterLimit(c: any, limit: number): void;

declare function CGContextSetPatternPhase(c: any, phase: CGSize): void;

declare function CGContextSetRGBFillColor(c: any, red: number, green: number, blue: number, alpha: number): void;

declare function CGContextSetRGBStrokeColor(c: any, red: number, green: number, blue: number, alpha: number): void;

declare function CGContextSetRenderingIntent(c: any, intent: CGColorRenderingIntent): void;

declare function CGContextSetShadow(c: any, offset: CGSize, blur: number): void;

declare function CGContextSetShadowWithColor(c: any, offset: CGSize, blur: number, color: any): void;

declare function CGContextSetShouldAntialias(c: any, shouldAntialias: boolean): void;

declare function CGContextSetShouldSmoothFonts(c: any, shouldSmoothFonts: boolean): void;

declare function CGContextSetShouldSubpixelPositionFonts(c: any, shouldSubpixelPositionFonts: boolean): void;

declare function CGContextSetShouldSubpixelQuantizeFonts(c: any, shouldSubpixelQuantizeFonts: boolean): void;

declare function CGContextSetStrokeColor(c: any, components: interop.Reference<number>): void;

declare function CGContextSetStrokeColorSpace(c: any, space: any): void;

declare function CGContextSetStrokeColorWithColor(c: any, color: any): void;

declare function CGContextSetStrokePattern(c: any, pattern: any, components: interop.Reference<number>): void;

declare function CGContextSetTextDrawingMode(c: any, mode: CGTextDrawingMode): void;

declare function CGContextSetTextMatrix(c: any, t: CGAffineTransform): void;

declare function CGContextSetTextPosition(c: any, x: number, y: number): void;

declare function CGContextShowGlyphs(c: any, g: interop.Reference<number>, count: number): void;

declare function CGContextShowGlyphsAtPoint(c: any, x: number, y: number, glyphs: interop.Reference<number>, count: number): void;

declare function CGContextShowGlyphsAtPositions(c: any, glyphs: interop.Reference<number>, Lpositions: interop.Reference<CGPoint>, count: number): void;

declare function CGContextShowGlyphsWithAdvances(c: any, glyphs: interop.Reference<number>, advances: interop.Reference<CGSize>, count: number): void;

declare function CGContextShowText(c: any, string: string, length: number): void;

declare function CGContextShowTextAtPoint(c: any, x: number, y: number, string: string, length: number): void;

declare function CGContextStrokeEllipseInRect(c: any, rect: CGRect): void;

declare function CGContextStrokeLineSegments(c: any, points: interop.Reference<CGPoint>, count: number): void;

declare function CGContextStrokePath(c: any): void;

declare function CGContextStrokeRect(c: any, rect: CGRect): void;

declare function CGContextStrokeRectWithWidth(c: any, rect: CGRect, width: number): void;

declare function CGContextSynchronize(c: any): void;

declare function CGContextTranslateCTM(c: any, tx: number, ty: number): void;

interface CGDataConsumerCallbacks {
	putBytes: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number) => number>;
	releaseConsumer: interop.FunctionReference<(p1: interop.Pointer) => void>;
}
declare var CGDataConsumerCallbacks: interop.StructType<CGDataConsumerCallbacks>;

declare function CGDataConsumerCreate(info: interop.Pointer, cbks: interop.Reference<CGDataConsumerCallbacks>): any;

declare function CGDataConsumerCreateWithCFData(data: NSData): any;

declare function CGDataConsumerCreateWithURL(url: NSURL): any;

declare function CGDataConsumerGetTypeID(): number;

declare function CGDataConsumerRelease(consumer: any): void;

declare function CGDataConsumerRetain(consumer: any): any;

declare function CGDataProviderCopyData(provider: any): NSData;

declare function CGDataProviderCreateDirect(info: interop.Pointer, size: number, callbacks: interop.Reference<CGDataProviderDirectCallbacks>): any;

declare function CGDataProviderCreateSequential(info: interop.Pointer, callbacks: interop.Reference<CGDataProviderSequentialCallbacks>): any;

declare function CGDataProviderCreateWithCFData(data: NSData): any;

declare function CGDataProviderCreateWithData(info: interop.Pointer, data: interop.Pointer, size: number, releaseData: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number) => void>): any;

declare function CGDataProviderCreateWithFilename(filename: string): any;

declare function CGDataProviderCreateWithURL(url: NSURL): any;

interface CGDataProviderDirectCallbacks {
	version: number;
	getBytePointer: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	releaseBytePointer: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>;
	getBytesAtPosition: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number, p4: number) => number>;
	releaseInfo: interop.FunctionReference<(p1: interop.Pointer) => void>;
}
declare var CGDataProviderDirectCallbacks: interop.StructType<CGDataProviderDirectCallbacks>;

declare function CGDataProviderGetTypeID(): number;

declare function CGDataProviderRelease(provider: any): void;

declare function CGDataProviderRetain(provider: any): any;

interface CGDataProviderSequentialCallbacks {
	version: number;
	getBytes: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number) => number>;
	skipForward: interop.FunctionReference<(p1: interop.Pointer, p2: number) => number>;
	rewind: interop.FunctionReference<(p1: interop.Pointer) => void>;
	releaseInfo: interop.FunctionReference<(p1: interop.Pointer) => void>;
}
declare var CGDataProviderSequentialCallbacks: interop.StructType<CGDataProviderSequentialCallbacks>;

declare const enum CGError {

	kCGErrorSuccess = 0,

	kCGErrorFailure = 1000,

	kCGErrorIllegalArgument = 1001,

	kCGErrorInvalidConnection = 1002,

	kCGErrorInvalidContext = 1003,

	kCGErrorCannotComplete = 1004,

	kCGErrorNotImplemented = 1006,

	kCGErrorRangeCheck = 1007,

	kCGErrorTypeCheck = 1008,

	kCGErrorInvalidOperation = 1010,

	kCGErrorNoneAvailable = 1011
}

declare function CGFontCanCreatePostScriptSubset(font: any, format: CGFontPostScriptFormat): boolean;

declare function CGFontCopyFullName(font: any): string;

declare function CGFontCopyGlyphNameForGlyph(font: any, glyph: number): string;

declare function CGFontCopyPostScriptName(font: any): string;

declare function CGFontCopyTableForTag(font: any, tag: number): NSData;

declare function CGFontCopyTableTags(font: any): NSArray<any>;

declare function CGFontCopyVariationAxes(font: any): NSArray<any>;

declare function CGFontCopyVariations(font: any): NSDictionary<any, any>;

declare function CGFontCreateCopyWithVariations(font: any, variations: NSDictionary<any, any>): any;

declare function CGFontCreatePostScriptEncoding(font: any, encoding: interop.Reference<number>): NSData;

declare function CGFontCreatePostScriptSubset(font: any, subsetName: string, format: CGFontPostScriptFormat, glyphs: interop.Reference<number>, count: number, encoding: interop.Reference<number>): NSData;

declare function CGFontCreateWithDataProvider(provider: any): any;

declare function CGFontCreateWithFontName(name: string): any;

declare function CGFontGetAscent(font: any): number;

declare function CGFontGetCapHeight(font: any): number;

declare function CGFontGetDescent(font: any): number;

declare function CGFontGetFontBBox(font: any): CGRect;

declare function CGFontGetGlyphAdvances(font: any, glyphs: interop.Reference<number>, count: number, advances: interop.Reference<number>): boolean;

declare function CGFontGetGlyphBBoxes(font: any, glyphs: interop.Reference<number>, count: number, bboxes: interop.Reference<CGRect>): boolean;

declare function CGFontGetGlyphWithGlyphName(font: any, name: string): number;

declare function CGFontGetItalicAngle(font: any): number;

declare function CGFontGetLeading(font: any): number;

declare function CGFontGetNumberOfGlyphs(font: any): number;

declare function CGFontGetStemV(font: any): number;

declare function CGFontGetTypeID(): number;

declare function CGFontGetUnitsPerEm(font: any): number;

declare function CGFontGetXHeight(font: any): number;

declare const enum CGFontPostScriptFormat {

	kCGFontPostScriptFormatType1 = 1,

	kCGFontPostScriptFormatType3 = 3,

	kCGFontPostScriptFormatType42 = 42
}

declare function CGFontRelease(font: any): void;

declare function CGFontRetain(font: any): any;

interface CGFunctionCallbacks {
	version: number;
	evaluate: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<number>, p3: interop.Reference<number>) => void>;
	releaseInfo: interop.FunctionReference<(p1: interop.Pointer) => void>;
}
declare var CGFunctionCallbacks: interop.StructType<CGFunctionCallbacks>;

declare function CGFunctionCreate(info: interop.Pointer, domainDimension: number, domain: interop.Reference<number>, rangeDimension: number, range: interop.Reference<number>, callbacks: interop.Reference<CGFunctionCallbacks>): any;

declare function CGFunctionGetTypeID(): number;

declare function CGFunctionRelease(_function: any): void;

declare function CGFunctionRetain(_function: any): any;

declare const enum CGGlyphDeprecatedEnum {

	Min = 0,

	Max = 1
}

declare function CGGradientCreateWithColorComponents(space: any, components: interop.Reference<number>, locations: interop.Reference<number>, count: number): any;

declare function CGGradientCreateWithColors(space: any, colors: NSArray<any>, locations: interop.Reference<number>): any;

declare const enum CGGradientDrawingOptions {

	kCGGradientDrawsBeforeStartLocation = 1,

	kCGGradientDrawsAfterEndLocation = 2
}

declare function CGGradientGetTypeID(): number;

declare function CGGradientRelease(gradient: any): void;

declare function CGGradientRetain(gradient: any): any;

declare const enum CGImageAlphaInfo {

	kCGImageAlphaNone = 0,

	kCGImageAlphaPremultipliedLast = 1,

	kCGImageAlphaPremultipliedFirst = 2,

	kCGImageAlphaLast = 3,

	kCGImageAlphaFirst = 4,

	kCGImageAlphaNoneSkipLast = 5,

	kCGImageAlphaNoneSkipFirst = 6,

	kCGImageAlphaOnly = 7
}

declare function CGImageCreate(width: number, height: number, bitsPerComponent: number, bitsPerPixel: number, bytesPerRow: number, space: any, bitmapInfo: CGBitmapInfo, provider: any, decode: interop.Reference<number>, shouldInterpolate: boolean, intent: CGColorRenderingIntent): any;

declare function CGImageCreateCopy(image: any): any;

declare function CGImageCreateCopyWithColorSpace(image: any, space: any): any;

declare function CGImageCreateWithImageInRect(image: any, rect: CGRect): any;

declare function CGImageCreateWithJPEGDataProvider(source: any, decode: interop.Reference<number>, shouldInterpolate: boolean, intent: CGColorRenderingIntent): any;

declare function CGImageCreateWithMask(image: any, mask: any): any;

declare function CGImageCreateWithMaskingColors(image: any, components: interop.Reference<number>): any;

declare function CGImageCreateWithPNGDataProvider(source: any, decode: interop.Reference<number>, shouldInterpolate: boolean, intent: CGColorRenderingIntent): any;

declare function CGImageGetAlphaInfo(image: any): CGImageAlphaInfo;

declare function CGImageGetBitmapInfo(image: any): CGBitmapInfo;

declare function CGImageGetBitsPerComponent(image: any): number;

declare function CGImageGetBitsPerPixel(image: any): number;

declare function CGImageGetBytesPerRow(image: any): number;

declare function CGImageGetColorSpace(image: any): any;

declare function CGImageGetDataProvider(image: any): any;

declare function CGImageGetDecode(image: any): interop.Reference<number>;

declare function CGImageGetHeight(image: any): number;

declare function CGImageGetRenderingIntent(image: any): CGColorRenderingIntent;

declare function CGImageGetShouldInterpolate(image: any): boolean;

declare function CGImageGetTypeID(): number;

declare function CGImageGetUTType(image: any): string;

declare function CGImageGetWidth(image: any): number;

declare function CGImageIsMask(image: any): boolean;

declare function CGImageMaskCreate(width: number, height: number, bitsPerComponent: number, bitsPerPixel: number, bytesPerRow: number, provider: any, decode: interop.Reference<number>, shouldInterpolate: boolean): any;

declare function CGImageRelease(image: any): void;

declare function CGImageRetain(image: any): any;

declare const enum CGInterpolationQuality {

	kCGInterpolationDefault = 0,

	kCGInterpolationNone = 1,

	kCGInterpolationLow = 2,

	kCGInterpolationMedium = 4,

	kCGInterpolationHigh = 3
}

declare function CGLayerCreateWithContext(context: any, size: CGSize, auxiliaryInfo: NSDictionary<any, any>): any;

declare function CGLayerGetContext(layer: any): any;

declare function CGLayerGetSize(layer: any): CGSize;

declare function CGLayerGetTypeID(): number;

declare function CGLayerRelease(layer: any): void;

declare function CGLayerRetain(layer: any): any;

declare const enum CGLineCap {

	kCGLineCapButt = 0,

	kCGLineCapRound = 1,

	kCGLineCapSquare = 2
}

declare const enum CGLineJoin {

	kCGLineJoinMiter = 0,

	kCGLineJoinRound = 1,

	kCGLineJoinBevel = 2
}

declare function CGPDFArrayGetArray(array: interop.Pointer, index: number, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFArrayGetBoolean(array: interop.Pointer, index: number, value: string): boolean;

declare function CGPDFArrayGetCount(array: interop.Pointer): number;

declare function CGPDFArrayGetDictionary(array: interop.Pointer, index: number, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFArrayGetInteger(array: interop.Pointer, index: number, value: interop.Reference<number>): boolean;

declare function CGPDFArrayGetName(array: interop.Pointer, index: number, value: interop.Reference<string>): boolean;

declare function CGPDFArrayGetNull(array: interop.Pointer, index: number): boolean;

declare function CGPDFArrayGetNumber(array: interop.Pointer, index: number, value: interop.Reference<number>): boolean;

declare function CGPDFArrayGetObject(array: interop.Pointer, index: number, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFArrayGetStream(array: interop.Pointer, index: number, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFArrayGetString(array: interop.Pointer, index: number, value: interop.Reference<interop.Pointer>): boolean;

declare const enum CGPDFBox {

	kCGPDFMediaBox = 0,

	kCGPDFCropBox = 1,

	kCGPDFBleedBox = 2,

	kCGPDFTrimBox = 3,

	kCGPDFArtBox = 4
}

declare function CGPDFContentStreamCreateWithPage(page: any): interop.Pointer;

declare function CGPDFContentStreamCreateWithStream(stream: interop.Pointer, streamResources: interop.Pointer, parent: interop.Pointer): interop.Pointer;

declare function CGPDFContentStreamGetResource(cs: interop.Pointer, category: string, name: string): interop.Pointer;

declare function CGPDFContentStreamGetStreams(cs: interop.Pointer): NSArray<any>;

declare function CGPDFContentStreamRelease(cs: interop.Pointer): void;

declare function CGPDFContentStreamRetain(cs: interop.Pointer): interop.Pointer;

declare function CGPDFContextAddDestinationAtPoint(context: any, name: string, point: CGPoint): void;

declare function CGPDFContextAddDocumentMetadata(context: any, metadata: NSData): void;

declare function CGPDFContextBeginPage(context: any, pageInfo: NSDictionary<any, any>): void;

declare function CGPDFContextClose(context: any): void;

declare function CGPDFContextCreate(consumer: any, mediaBox: interop.Reference<CGRect>, auxiliaryInfo: NSDictionary<any, any>): any;

declare function CGPDFContextCreateWithURL(url: NSURL, mediaBox: interop.Reference<CGRect>, auxiliaryInfo: NSDictionary<any, any>): any;

declare function CGPDFContextEndPage(context: any): void;

declare function CGPDFContextSetDestinationForRect(context: any, name: string, rect: CGRect): void;

declare function CGPDFContextSetURLForRect(context: any, url: NSURL, rect: CGRect): void;

declare const enum CGPDFDataFormat {

	Raw = 0,

	JPEGEncoded = 1,

	JPEG2000 = 2
}

declare function CGPDFDictionaryApplyFunction(dict: interop.Pointer, _function: interop.FunctionReference<(p1: string, p2: interop.Pointer, p3: interop.Pointer) => void>, info: interop.Pointer): void;

declare function CGPDFDictionaryGetArray(dict: interop.Pointer, key: string, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFDictionaryGetBoolean(dict: interop.Pointer, key: string, value: string): boolean;

declare function CGPDFDictionaryGetCount(dict: interop.Pointer): number;

declare function CGPDFDictionaryGetDictionary(dict: interop.Pointer, key: string, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFDictionaryGetInteger(dict: interop.Pointer, key: string, value: interop.Reference<number>): boolean;

declare function CGPDFDictionaryGetName(dict: interop.Pointer, key: string, value: interop.Reference<string>): boolean;

declare function CGPDFDictionaryGetNumber(dict: interop.Pointer, key: string, value: interop.Reference<number>): boolean;

declare function CGPDFDictionaryGetObject(dict: interop.Pointer, key: string, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFDictionaryGetStream(dict: interop.Pointer, key: string, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFDictionaryGetString(dict: interop.Pointer, key: string, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFDocumentAllowsCopying(document: any): boolean;

declare function CGPDFDocumentAllowsPrinting(document: any): boolean;

declare function CGPDFDocumentCreateWithProvider(provider: any): any;

declare function CGPDFDocumentCreateWithURL(url: NSURL): any;

declare function CGPDFDocumentGetCatalog(document: any): interop.Pointer;

declare function CGPDFDocumentGetID(document: any): interop.Pointer;

declare function CGPDFDocumentGetInfo(document: any): interop.Pointer;

declare function CGPDFDocumentGetNumberOfPages(document: any): number;

declare function CGPDFDocumentGetPage(document: any, pageNumber: number): any;

declare function CGPDFDocumentGetTypeID(): number;

declare function CGPDFDocumentGetVersion(document: any, majorVersion: interop.Reference<number>, minorVersion: interop.Reference<number>): void;

declare function CGPDFDocumentIsEncrypted(document: any): boolean;

declare function CGPDFDocumentIsUnlocked(document: any): boolean;

declare function CGPDFDocumentRelease(document: any): void;

declare function CGPDFDocumentRetain(document: any): any;

declare function CGPDFDocumentUnlockWithPassword(document: any, password: string): boolean;

declare function CGPDFObjectGetType(object: interop.Pointer): CGPDFObjectType;

declare function CGPDFObjectGetValue(object: interop.Pointer, type: CGPDFObjectType, value: interop.Pointer): boolean;

declare const enum CGPDFObjectType {

	kCGPDFObjectTypeNull = 1,

	kCGPDFObjectTypeBoolean = 2,

	kCGPDFObjectTypeInteger = 3,

	kCGPDFObjectTypeReal = 4,

	kCGPDFObjectTypeName = 5,

	kCGPDFObjectTypeString = 6,

	kCGPDFObjectTypeArray = 7,

	kCGPDFObjectTypeDictionary = 8,

	kCGPDFObjectTypeStream = 9
}

declare function CGPDFOperatorTableCreate(): interop.Pointer;

declare function CGPDFOperatorTableRelease(table: interop.Pointer): void;

declare function CGPDFOperatorTableRetain(table: interop.Pointer): interop.Pointer;

declare function CGPDFOperatorTableSetCallback(table: interop.Pointer, name: string, callback: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>): void;

declare function CGPDFPageGetBoxRect(page: any, box: CGPDFBox): CGRect;

declare function CGPDFPageGetDictionary(page: any): interop.Pointer;

declare function CGPDFPageGetDocument(page: any): any;

declare function CGPDFPageGetDrawingTransform(page: any, box: CGPDFBox, rect: CGRect, rotate: number, preserveAspectRatio: boolean): CGAffineTransform;

declare function CGPDFPageGetPageNumber(page: any): number;

declare function CGPDFPageGetRotationAngle(page: any): number;

declare function CGPDFPageGetTypeID(): number;

declare function CGPDFPageRelease(page: any): void;

declare function CGPDFPageRetain(page: any): any;

declare function CGPDFScannerCreate(cs: interop.Pointer, table: interop.Pointer, info: interop.Pointer): interop.Pointer;

declare function CGPDFScannerGetContentStream(scanner: interop.Pointer): interop.Pointer;

declare function CGPDFScannerPopArray(scanner: interop.Pointer, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFScannerPopBoolean(scanner: interop.Pointer, value: string): boolean;

declare function CGPDFScannerPopDictionary(scanner: interop.Pointer, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFScannerPopInteger(scanner: interop.Pointer, value: interop.Reference<number>): boolean;

declare function CGPDFScannerPopName(scanner: interop.Pointer, value: interop.Reference<string>): boolean;

declare function CGPDFScannerPopNumber(scanner: interop.Pointer, value: interop.Reference<number>): boolean;

declare function CGPDFScannerPopObject(scanner: interop.Pointer, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFScannerPopStream(scanner: interop.Pointer, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFScannerPopString(scanner: interop.Pointer, value: interop.Reference<interop.Pointer>): boolean;

declare function CGPDFScannerRelease(scanner: interop.Pointer): void;

declare function CGPDFScannerRetain(scanner: interop.Pointer): interop.Pointer;

declare function CGPDFScannerScan(scanner: interop.Pointer): boolean;

declare function CGPDFStreamCopyData(stream: interop.Pointer, format: interop.Reference<CGPDFDataFormat>): NSData;

declare function CGPDFStreamGetDictionary(stream: interop.Pointer): interop.Pointer;

declare function CGPDFStringCopyDate(string: interop.Pointer): Date;

declare function CGPDFStringCopyTextString(string: interop.Pointer): string;

declare function CGPDFStringGetBytePtr(string: interop.Pointer): string;

declare function CGPDFStringGetLength(string: interop.Pointer): number;

declare function CGPathAddArc(path: any, m: interop.Reference<CGAffineTransform>, x: number, y: number, radius: number, startAngle: number, endAngle: number, clockwise: boolean): void;

declare function CGPathAddArcToPoint(path: any, m: interop.Reference<CGAffineTransform>, x1: number, y1: number, x2: number, y2: number, radius: number): void;

declare function CGPathAddCurveToPoint(path: any, m: interop.Reference<CGAffineTransform>, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

declare function CGPathAddEllipseInRect(path: any, m: interop.Reference<CGAffineTransform>, rect: CGRect): void;

declare function CGPathAddLineToPoint(path: any, m: interop.Reference<CGAffineTransform>, x: number, y: number): void;

declare function CGPathAddLines(path: any, m: interop.Reference<CGAffineTransform>, points: interop.Reference<CGPoint>, count: number): void;

declare function CGPathAddPath(path1: any, m: interop.Reference<CGAffineTransform>, path2: any): void;

declare function CGPathAddQuadCurveToPoint(path: any, m: interop.Reference<CGAffineTransform>, cpx: number, cpy: number, x: number, y: number): void;

declare function CGPathAddRect(path: any, m: interop.Reference<CGAffineTransform>, rect: CGRect): void;

declare function CGPathAddRects(path: any, m: interop.Reference<CGAffineTransform>, rects: interop.Reference<CGRect>, count: number): void;

declare function CGPathAddRelativeArc(path: any, matrix: interop.Reference<CGAffineTransform>, x: number, y: number, radius: number, startAngle: number, delta: number): void;

declare function CGPathAddRoundedRect(path: any, transform: interop.Reference<CGAffineTransform>, rect: CGRect, cornerWidth: number, cornerHeight: number): void;

declare function CGPathApply(path: any, info: interop.Pointer, _function: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<CGPathElement>) => void>): void;

declare function CGPathCloseSubpath(path: any): void;

declare function CGPathContainsPoint(path: any, m: interop.Reference<CGAffineTransform>, point: CGPoint, eoFill: boolean): boolean;

declare function CGPathCreateCopy(path: any): any;

declare function CGPathCreateCopyByDashingPath(path: any, transform: interop.Reference<CGAffineTransform>, phase: number, lengths: interop.Reference<number>, count: number): any;

declare function CGPathCreateCopyByStrokingPath(path: any, transform: interop.Reference<CGAffineTransform>, lineWidth: number, lineCap: CGLineCap, lineJoin: CGLineJoin, miterLimit: number): any;

declare function CGPathCreateCopyByTransformingPath(path: any, transform: interop.Reference<CGAffineTransform>): any;

declare function CGPathCreateMutable(): any;

declare function CGPathCreateMutableCopy(path: any): any;

declare function CGPathCreateMutableCopyByTransformingPath(path: any, transform: interop.Reference<CGAffineTransform>): any;

declare function CGPathCreateWithEllipseInRect(rect: CGRect, transform: interop.Reference<CGAffineTransform>): any;

declare function CGPathCreateWithRect(rect: CGRect, transform: interop.Reference<CGAffineTransform>): any;

declare function CGPathCreateWithRoundedRect(rect: CGRect, cornerWidth: number, cornerHeight: number, transform: interop.Reference<CGAffineTransform>): any;

declare const enum CGPathDrawingMode {

	kCGPathFill = 0,

	kCGPathEOFill = 1,

	kCGPathStroke = 2,

	kCGPathFillStroke = 3,

	kCGPathEOFillStroke = 4
}

interface CGPathElement {
	type: CGPathElementType;
	points: interop.Reference<CGPoint>;
}
declare var CGPathElement: interop.StructType<CGPathElement>;

declare const enum CGPathElementType {

	kCGPathElementMoveToPoint = 0,

	kCGPathElementAddLineToPoint = 1,

	kCGPathElementAddQuadCurveToPoint = 2,

	kCGPathElementAddCurveToPoint = 3,

	kCGPathElementCloseSubpath = 4
}

declare function CGPathEqualToPath(path1: any, path2: any): boolean;

declare function CGPathGetBoundingBox(path: any): CGRect;

declare function CGPathGetCurrentPoint(path: any): CGPoint;

declare function CGPathGetPathBoundingBox(path: any): CGRect;

declare function CGPathGetTypeID(): number;

declare function CGPathIsEmpty(path: any): boolean;

declare function CGPathIsRect(path: any, rect: interop.Reference<CGRect>): boolean;

declare function CGPathMoveToPoint(path: any, m: interop.Reference<CGAffineTransform>, x: number, y: number): void;

declare function CGPathRelease(path: any): void;

declare function CGPathRetain(path: any): any;

interface CGPatternCallbacks {
	version: number;
	drawPattern: interop.FunctionReference<(p1: interop.Pointer, p2: any) => void>;
	releaseInfo: interop.FunctionReference<(p1: interop.Pointer) => void>;
}
declare var CGPatternCallbacks: interop.StructType<CGPatternCallbacks>;

declare function CGPatternCreate(info: interop.Pointer, bounds: CGRect, matrix: CGAffineTransform, xStep: number, yStep: number, tiling: CGPatternTiling, isColored: boolean, callbacks: interop.Reference<CGPatternCallbacks>): any;

declare function CGPatternGetTypeID(): number;

declare function CGPatternRelease(pattern: any): void;

declare function CGPatternRetain(pattern: any): any;

declare const enum CGPatternTiling {

	kCGPatternTilingNoDistortion = 0,

	kCGPatternTilingConstantSpacingMinimalDistortion = 1,

	kCGPatternTilingConstantSpacing = 2
}

interface CGPoint {
	x: number;
	y: number;
}
declare var CGPoint: interop.StructType<CGPoint>;

declare function CGPointApplyAffineTransform(point: CGPoint, t: CGAffineTransform): CGPoint;

declare function CGPointCreateDictionaryRepresentation(point: CGPoint): NSDictionary<any, any>;

declare function CGPointEqualToPoint(point1: CGPoint, point2: CGPoint): boolean;

declare function CGPointMake(x: number, y: number): CGPoint;

declare function CGPointMakeWithDictionaryRepresentation(dict: NSDictionary<any, any>, point: interop.Reference<CGPoint>): boolean;

declare var CGPointZero: CGPoint;

interface CGRect {
	origin: CGPoint;
	size: CGSize;
}
declare var CGRect: interop.StructType<CGRect>;

declare function CGRectApplyAffineTransform(rect: CGRect, t: CGAffineTransform): CGRect;

declare function CGRectContainsPoint(rect: CGRect, point: CGPoint): boolean;

declare function CGRectContainsRect(rect1: CGRect, rect2: CGRect): boolean;

declare function CGRectCreateDictionaryRepresentation(p1: CGRect): NSDictionary<any, any>;

declare function CGRectDivide(rect: CGRect, slice: interop.Reference<CGRect>, remainder: interop.Reference<CGRect>, amount: number, edge: CGRectEdge): void;

declare const enum CGRectEdge {

	MinXEdge = 0,

	MinYEdge = 1,

	MaxXEdge = 2,

	MaxYEdge = 3
}

declare function CGRectEqualToRect(rect1: CGRect, rect2: CGRect): boolean;

declare function CGRectGetHeight(rect: CGRect): number;

declare function CGRectGetMaxX(rect: CGRect): number;

declare function CGRectGetMaxY(rect: CGRect): number;

declare function CGRectGetMidX(rect: CGRect): number;

declare function CGRectGetMidY(rect: CGRect): number;

declare function CGRectGetMinX(rect: CGRect): number;

declare function CGRectGetMinY(rect: CGRect): number;

declare function CGRectGetWidth(rect: CGRect): number;

declare var CGRectInfinite: CGRect;

declare function CGRectInset(rect: CGRect, dx: number, dy: number): CGRect;

declare function CGRectIntegral(rect: CGRect): CGRect;

declare function CGRectIntersection(r1: CGRect, r2: CGRect): CGRect;

declare function CGRectIntersectsRect(rect1: CGRect, rect2: CGRect): boolean;

declare function CGRectIsEmpty(rect: CGRect): boolean;

declare function CGRectIsInfinite(rect: CGRect): boolean;

declare function CGRectIsNull(rect: CGRect): boolean;

declare function CGRectMake(x: number, y: number, width: number, height: number): CGRect;

declare function CGRectMakeWithDictionaryRepresentation(dict: NSDictionary<any, any>, rect: interop.Reference<CGRect>): boolean;

declare var CGRectNull: CGRect;

declare function CGRectOffset(rect: CGRect, dx: number, dy: number): CGRect;

declare function CGRectStandardize(rect: CGRect): CGRect;

declare function CGRectUnion(r1: CGRect, r2: CGRect): CGRect;

declare var CGRectZero: CGRect;

declare function CGShadingCreateAxial(space: any, start: CGPoint, end: CGPoint, _function: any, extendStart: boolean, extendEnd: boolean): any;

declare function CGShadingCreateRadial(space: any, start: CGPoint, startRadius: number, end: CGPoint, endRadius: number, _function: any, extendStart: boolean, extendEnd: boolean): any;

declare function CGShadingGetTypeID(): number;

declare function CGShadingRelease(shading: any): void;

declare function CGShadingRetain(shading: any): any;

interface CGSize {
	width: number;
	height: number;
}
declare var CGSize: interop.StructType<CGSize>;

declare function CGSizeApplyAffineTransform(size: CGSize, t: CGAffineTransform): CGSize;

declare function CGSizeCreateDictionaryRepresentation(size: CGSize): NSDictionary<any, any>;

declare function CGSizeEqualToSize(size1: CGSize, size2: CGSize): boolean;

declare function CGSizeMake(width: number, height: number): CGSize;

declare function CGSizeMakeWithDictionaryRepresentation(dict: NSDictionary<any, any>, size: interop.Reference<CGSize>): boolean;

declare var CGSizeZero: CGSize;

declare const enum CGTextDrawingMode {

	kCGTextFill = 0,

	kCGTextStroke = 1,

	kCGTextFillStroke = 2,

	kCGTextInvisible = 3,

	kCGTextFillClip = 4,

	kCGTextStrokeClip = 5,

	kCGTextFillStrokeClip = 6,

	kCGTextClip = 7
}

declare const enum CGTextEncoding {

	kCGEncodingFontSpecific = 0,

	kCGEncodingMacRoman = 1
}

interface CGVector {
	dx: number;
	dy: number;
}
declare var CGVector: interop.StructType<CGVector>;

declare function CGVectorMake(dx: number, dy: number): CGVector;

declare var kCGColorSpaceACESCGLinear: string;

declare var kCGColorSpaceAdobeRGB1998: string;

declare var kCGColorSpaceDCIP3: string;

declare var kCGColorSpaceDisplayP3: string;

declare var kCGColorSpaceGenericCMYK: string;

declare var kCGColorSpaceGenericGray: string;

declare var kCGColorSpaceGenericGrayGamma2_2: string;

declare var kCGColorSpaceGenericRGB: string;

declare var kCGColorSpaceGenericRGBLinear: string;

declare var kCGColorSpaceGenericXYZ: string;

declare var kCGColorSpaceITUR_2020: string;

declare var kCGColorSpaceITUR_709: string;

declare var kCGColorSpaceROMMRGB: string;

declare var kCGColorSpaceSRGB: string;

declare var kCGFontIndexInvalid: number;

declare var kCGFontIndexMax: number;

declare var kCGFontVariationAxisDefaultValue: string;

declare var kCGFontVariationAxisMaxValue: string;

declare var kCGFontVariationAxisMinValue: string;

declare var kCGFontVariationAxisName: string;

declare var kCGGlyphMax: number;

declare var kCGPDFContextAllowsCopying: string;

declare var kCGPDFContextAllowsPrinting: string;

declare var kCGPDFContextArtBox: string;

declare var kCGPDFContextAuthor: string;

declare var kCGPDFContextBleedBox: string;

declare var kCGPDFContextCreator: string;

declare var kCGPDFContextCropBox: string;

declare var kCGPDFContextEncryptionKeyLength: string;

declare var kCGPDFContextKeywords: string;

declare var kCGPDFContextMediaBox: string;

declare var kCGPDFContextOwnerPassword: string;

declare var kCGPDFContextSubject: string;

declare var kCGPDFContextTitle: string;

declare var kCGPDFContextTrimBox: string;

declare var kCGPDFContextUserPassword: string;
