
/**
 * @since 2.0
 */
declare function CGAffineTransformConcat(t1: CGAffineTransform, t2: CGAffineTransform): CGAffineTransform;

/**
 * @since 16.0
 */
declare function CGAffineTransformDecompose(transform: CGAffineTransform): CGAffineTransformComponents;

/**
 * @since 2.0
 */
declare function CGAffineTransformEqualToTransform(t1: CGAffineTransform, t2: CGAffineTransform): boolean;

/**
 * @since 2.0
 */
declare var CGAffineTransformIdentity: CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGAffineTransformInvert(t: CGAffineTransform): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGAffineTransformIsIdentity(t: CGAffineTransform): boolean;

/**
 * @since 2.0
 */
declare function CGAffineTransformMake(a: number, b: number, c: number, d: number, tx: number, ty: number): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGAffineTransformMakeRotation(angle: number): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGAffineTransformMakeScale(sx: number, sy: number): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGAffineTransformMakeTranslation(tx: number, ty: number): CGAffineTransform;

/**
 * @since 16.0
 */
declare function CGAffineTransformMakeWithComponents(components: CGAffineTransformComponents): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGAffineTransformRotate(t: CGAffineTransform, angle: number): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGAffineTransformScale(t: CGAffineTransform, sx: number, sy: number): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGAffineTransformTranslate(t: CGAffineTransform, tx: number, ty: number): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGBitmapContextCreate(data: interop.Pointer | interop.Reference<any>, width: number, height: number, bitsPerComponent: number, bytesPerRow: number, space: any, bitmapInfo: number): any;

/**
 * @since 2.0
 */
declare function CGBitmapContextCreateImage(context: any): any;

/**
 * @since 4.0
 */
declare function CGBitmapContextCreateWithData(data: interop.Pointer | interop.Reference<any>, width: number, height: number, bitsPerComponent: number, bytesPerRow: number, space: any, bitmapInfo: number, releaseCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, releaseInfo: interop.Pointer | interop.Reference<any>): any;

/**
 * @since 2.0
 */
declare function CGBitmapContextGetAlphaInfo(context: any): CGImageAlphaInfo;

/**
 * @since 2.0
 */
declare function CGBitmapContextGetBitmapInfo(context: any): CGBitmapInfo;

/**
 * @since 2.0
 */
declare function CGBitmapContextGetBitsPerComponent(context: any): number;

/**
 * @since 2.0
 */
declare function CGBitmapContextGetBitsPerPixel(context: any): number;

/**
 * @since 2.0
 */
declare function CGBitmapContextGetBytesPerRow(context: any): number;

/**
 * @since 2.0
 */
declare function CGBitmapContextGetColorSpace(context: any): any;

/**
 * @since 2.0
 */
declare function CGBitmapContextGetData(context: any): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGBitmapContextGetHeight(context: any): number;

/**
 * @since 2.0
 */
declare function CGBitmapContextGetWidth(context: any): number;

/**
 * @since 2.0
 */
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

/**
 * @since 10.0
 */
declare function CGColorConversionInfoCreate(src: any, dst: any): any;

/**
 * @since 13
 */
declare function CGColorConversionInfoCreateWithOptions(src: any, dst: any, options: NSDictionary<any, any>): any;

declare function CGColorConversionInfoGetTypeID(): number;

declare const enum CGColorConversionInfoTransformType {

	kCGColorConversionTransformFromSpace = 0,

	kCGColorConversionTransformToSpace = 1,

	kCGColorConversionTransformApplySpace = 2
}

/**
 * @since 2.0
 */
declare function CGColorCreate(space: any, components: interop.Pointer | interop.Reference<number>): any;

/**
 * @since 2.0
 */
declare function CGColorCreateCopy(color: any): any;

/**
 * @since 9.0
 */
declare function CGColorCreateCopyByMatchingToColorSpace(p1: any, intent: CGColorRenderingIntent, color: any, options: NSDictionary<any, any>): any;

/**
 * @since 2.0
 */
declare function CGColorCreateCopyWithAlpha(color: any, alpha: number): any;

/**
 * @since 13.0
 */
declare function CGColorCreateGenericCMYK(cyan: number, magenta: number, yellow: number, black: number, alpha: number): any;

/**
 * @since 13.0
 */
declare function CGColorCreateGenericGray(gray: number, alpha: number): any;

/**
 * @since 13.0
 */
declare function CGColorCreateGenericGrayGamma2_2(gray: number, alpha: number): any;

/**
 * @since 13.0
 */
declare function CGColorCreateGenericRGB(red: number, green: number, blue: number, alpha: number): any;

/**
 * @since 13.0
 */
declare function CGColorCreateSRGB(red: number, green: number, blue: number, alpha: number): any;

/**
 * @since 2.0
 */
declare function CGColorCreateWithPattern(space: any, pattern: any, components: interop.Pointer | interop.Reference<number>): any;

interface CGColorDataFormat {
	version: number;
	colorspace_info: any;
	bitmap_info: CGBitmapInfo;
	bits_per_component: number;
	bytes_per_row: number;
	intent: CGColorRenderingIntent;
	decode: interop.Pointer | interop.Reference<number>;
}
declare var CGColorDataFormat: interop.StructType<CGColorDataFormat>;

/**
 * @since 2.0
 */
declare function CGColorEqualToColor(color1: any, color2: any): boolean;

/**
 * @since 2.0
 */
declare function CGColorGetAlpha(color: any): number;

/**
 * @since 2.0
 */
declare function CGColorGetColorSpace(color: any): any;

/**
 * @since 2.0
 */
declare function CGColorGetComponents(color: any): interop.Pointer | interop.Reference<number>;

/**
 * @since 14.0
 */
declare function CGColorGetConstantColor(colorName: string): any;

/**
 * @since 2.0
 */
declare function CGColorGetNumberOfComponents(color: any): number;

/**
 * @since 2.0
 */
declare function CGColorGetPattern(color: any): any;

/**
 * @since 2.0
 */
declare function CGColorGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGColorRelease(color: any): void;

declare const enum CGColorRenderingIntent {

	kCGRenderingIntentDefault = 0,

	kCGRenderingIntentAbsoluteColorimetric = 1,

	kCGRenderingIntentRelativeColorimetric = 2,

	kCGRenderingIntentPerceptual = 3,

	kCGRenderingIntentSaturation = 4
}

/**
 * @since 2.0
 */
declare function CGColorRetain(color: any): any;

/**
 * @since 10.0
 */
declare function CGColorSpaceCopyICCData(space: any): NSData;

/**
 * @since 2.0
 * @deprecated 11.0
 */
declare function CGColorSpaceCopyICCProfile(space: any): NSData;

/**
 * @since 10.0
 */
declare function CGColorSpaceCopyName(space: any): string;

/**
 * @since 10.0
 */
declare function CGColorSpaceCopyPropertyList(space: any): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceCreateCalibratedGray(whitePoint: interop.Reference<number>, blackPoint: interop.Reference<number>, gamma: number): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceCreateCalibratedRGB(whitePoint: interop.Reference<number>, blackPoint: interop.Reference<number>, gamma: interop.Reference<number>, matrix: interop.Reference<number>): any;

/**
 * @since 16.0
 */
declare function CGColorSpaceCreateCopyWithStandardRange(s: any): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceCreateDeviceCMYK(): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceCreateDeviceGray(): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceCreateDeviceRGB(): any;

/**
 * @since 14.0
 */
declare function CGColorSpaceCreateExtended(space: any): any;

/**
 * @since 14.0
 */
declare function CGColorSpaceCreateExtendedLinearized(space: any): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceCreateICCBased(nComponents: number, range: interop.Pointer | interop.Reference<number>, profile: any, alternate: any): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceCreateIndexed(baseSpace: any, lastIndex: number, colorTable: string | interop.Pointer | interop.Reference<any>): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceCreateLab(whitePoint: interop.Reference<number>, blackPoint: interop.Reference<number>, range: interop.Reference<number>): any;

/**
 * @since 14.0
 */
declare function CGColorSpaceCreateLinearized(space: any): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceCreatePattern(baseSpace: any): any;

/**
 * @since 15.0
 */
declare function CGColorSpaceCreateWithColorSyncProfile(p1: any, options: NSDictionary<any, any>): any;

/**
 * @since 10.0
 */
declare function CGColorSpaceCreateWithICCData(data: any): any;

/**
 * @since 2.0
 * @deprecated 11.0
 */
declare function CGColorSpaceCreateWithICCProfile(data: NSData): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceCreateWithName(name: string): any;

/**
 * @since 9.0
 * @deprecated 15.0
 */
declare function CGColorSpaceCreateWithPlatformColorSpace(ref: interop.Pointer | interop.Reference<any>): any;

/**
 * @since 10.0
 */
declare function CGColorSpaceCreateWithPropertyList(plist: any): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceGetBaseColorSpace(space: any): any;

/**
 * @since 2.0
 */
declare function CGColorSpaceGetColorTable(space: any, table: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function CGColorSpaceGetColorTableCount(space: any): number;

/**
 * @since 2.0
 */
declare function CGColorSpaceGetModel(space: any): CGColorSpaceModel;

/**
 * @since 11.0
 */
declare function CGColorSpaceGetName(space: any): string;

/**
 * @since 2.0
 */
declare function CGColorSpaceGetNumberOfComponents(space: any): number;

/**
 * @since 2.0
 */
declare function CGColorSpaceGetTypeID(): number;

/**
 * @since 13.0
 */
declare function CGColorSpaceIsHDR(p1: any): boolean;

/**
 * @since 15.0
 */
declare function CGColorSpaceIsHLGBased(s: any): boolean;

/**
 * @since 15.0
 */
declare function CGColorSpaceIsPQBased(s: any): boolean;

/**
 * @since 10.0
 */
declare function CGColorSpaceIsWideGamutRGB(p1: any): boolean;

declare const enum CGColorSpaceModel {

	kCGColorSpaceModelUnknown = -1,

	kCGColorSpaceModelMonochrome = 0,

	kCGColorSpaceModelRGB = 1,

	kCGColorSpaceModelCMYK = 2,

	kCGColorSpaceModelLab = 3,

	kCGColorSpaceModelDeviceN = 4,

	kCGColorSpaceModelIndexed = 5,

	kCGColorSpaceModelPattern = 6,

	kCGColorSpaceModelXYZ = 7
}

/**
 * @since 2.0
 */
declare function CGColorSpaceRelease(space: any): void;

/**
 * @since 2.0
 */
declare function CGColorSpaceRetain(space: any): any;

/**
 * @since 10.0
 */
declare function CGColorSpaceSupportsOutput(space: any): boolean;

/**
 * @since 10.0
 */
declare function CGColorSpaceUsesExtendedRange(space: any): boolean;

/**
 * @since 14.0
 */
declare function CGColorSpaceUsesITUR_2100TF(p1: any): boolean;

/**
 * @since 2.0
 */
declare function CGContextAddArc(c: any, x: number, y: number, radius: number, startAngle: number, endAngle: number, clockwise: number): void;

/**
 * @since 2.0
 */
declare function CGContextAddArcToPoint(c: any, x1: number, y1: number, x2: number, y2: number, radius: number): void;

/**
 * @since 2.0
 */
declare function CGContextAddCurveToPoint(c: any, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

/**
 * @since 2.0
 */
declare function CGContextAddEllipseInRect(c: any, rect: CGRect): void;

/**
 * @since 2.0
 */
declare function CGContextAddLineToPoint(c: any, x: number, y: number): void;

/**
 * @since 2.0
 */
declare function CGContextAddLines(c: any, points: interop.Pointer | interop.Reference<CGPoint>, count: number): void;

/**
 * @since 2.0
 */
declare function CGContextAddPath(c: any, path: any): void;

/**
 * @since 2.0
 */
declare function CGContextAddQuadCurveToPoint(c: any, cpx: number, cpy: number, x: number, y: number): void;

/**
 * @since 2.0
 */
declare function CGContextAddRect(c: any, rect: CGRect): void;

/**
 * @since 2.0
 */
declare function CGContextAddRects(c: any, rects: interop.Pointer | interop.Reference<CGRect>, count: number): void;

/**
 * @since 2.0
 */
declare function CGContextBeginPage(c: any, mediaBox: interop.Pointer | interop.Reference<CGRect>): void;

/**
 * @since 2.0
 */
declare function CGContextBeginPath(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextBeginTransparencyLayer(c: any, auxiliaryInfo: NSDictionary<any, any>): void;

/**
 * @since 2.0
 */
declare function CGContextBeginTransparencyLayerWithRect(c: any, rect: CGRect, auxInfo: NSDictionary<any, any>): void;

/**
 * @since 2.0
 */
declare function CGContextClearRect(c: any, rect: CGRect): void;

/**
 * @since 2.0
 */
declare function CGContextClip(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextClipToMask(c: any, rect: CGRect, mask: any): void;

/**
 * @since 2.0
 */
declare function CGContextClipToRect(c: any, rect: CGRect): void;

/**
 * @since 2.0
 */
declare function CGContextClipToRects(c: any, rects: interop.Pointer | interop.Reference<CGRect>, count: number): void;

/**
 * @since 2.0
 */
declare function CGContextClosePath(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextConcatCTM(c: any, transform: CGAffineTransform): void;

/**
 * @since 2.0
 */
declare function CGContextConvertPointToDeviceSpace(c: any, point: CGPoint): CGPoint;

/**
 * @since 2.0
 */
declare function CGContextConvertPointToUserSpace(c: any, point: CGPoint): CGPoint;

/**
 * @since 2.0
 */
declare function CGContextConvertRectToDeviceSpace(c: any, rect: CGRect): CGRect;

/**
 * @since 2.0
 */
declare function CGContextConvertRectToUserSpace(c: any, rect: CGRect): CGRect;

/**
 * @since 2.0
 */
declare function CGContextConvertSizeToDeviceSpace(c: any, size: CGSize): CGSize;

/**
 * @since 2.0
 */
declare function CGContextConvertSizeToUserSpace(c: any, size: CGSize): CGSize;

/**
 * @since 2.0
 */
declare function CGContextCopyPath(c: any): any;

/**
 * @since 17.0
 */
declare function CGContextDrawConicGradient(c: any, gradient: any, center: CGPoint, angle: number): void;

/**
 * @since 2.0
 */
declare function CGContextDrawImage(c: any, rect: CGRect, image: any): void;

/**
 * @since 18.0
 */
declare function CGContextDrawImageApplyingToneMapping(c: any, r: CGRect, image: any, method: CGToneMapping, options: NSDictionary<any, any>): boolean;

/**
 * @since 2.0
 */
declare function CGContextDrawLayerAtPoint(context: any, point: CGPoint, layer: any): void;

/**
 * @since 2.0
 */
declare function CGContextDrawLayerInRect(context: any, rect: CGRect, layer: any): void;

/**
 * @since 2.0
 */
declare function CGContextDrawLinearGradient(c: any, gradient: any, startPoint: CGPoint, endPoint: CGPoint, options: CGGradientDrawingOptions): void;

/**
 * @since 2.0
 */
declare function CGContextDrawPDFPage(c: any, page: any): void;

/**
 * @since 2.0
 */
declare function CGContextDrawPath(c: any, mode: CGPathDrawingMode): void;

/**
 * @since 2.0
 */
declare function CGContextDrawRadialGradient(c: any, gradient: any, startCenter: CGPoint, startRadius: number, endCenter: CGPoint, endRadius: number, options: CGGradientDrawingOptions): void;

/**
 * @since 2.0
 */
declare function CGContextDrawShading(c: any, shading: any): void;

/**
 * @since 2.0
 */
declare function CGContextDrawTiledImage(c: any, rect: CGRect, image: any): void;

/**
 * @since 2.0
 */
declare function CGContextEOClip(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextEOFillPath(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextEndPage(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextEndTransparencyLayer(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextFillEllipseInRect(c: any, rect: CGRect): void;

/**
 * @since 2.0
 */
declare function CGContextFillPath(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextFillRect(c: any, rect: CGRect): void;

/**
 * @since 2.0
 */
declare function CGContextFillRects(c: any, rects: interop.Pointer | interop.Reference<CGRect>, count: number): void;

/**
 * @since 2.0
 */
declare function CGContextFlush(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextGetCTM(c: any): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGContextGetClipBoundingBox(c: any): CGRect;

/**
 * @since 18.0
 */
declare function CGContextGetEDRTargetHeadroom(c: any): number;

/**
 * @since 2.0
 */
declare function CGContextGetInterpolationQuality(c: any): CGInterpolationQuality;

/**
 * @since 2.0
 */
declare function CGContextGetPathBoundingBox(c: any): CGRect;

/**
 * @since 2.0
 */
declare function CGContextGetPathCurrentPoint(c: any): CGPoint;

/**
 * @since 2.0
 */
declare function CGContextGetTextMatrix(c: any): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGContextGetTextPosition(c: any): CGPoint;

/**
 * @since 2.0
 */
declare function CGContextGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGContextGetUserSpaceToDeviceSpaceTransform(c: any): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGContextIsPathEmpty(c: any): boolean;

/**
 * @since 2.0
 */
declare function CGContextMoveToPoint(c: any, x: number, y: number): void;

/**
 * @since 2.0
 */
declare function CGContextPathContainsPoint(c: any, point: CGPoint, mode: CGPathDrawingMode): boolean;

/**
 * @since 2.0
 */
declare function CGContextRelease(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextReplacePathWithStrokedPath(c: any): void;

declare function CGContextResetClip(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextRestoreGState(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextRetain(c: any): any;

/**
 * @since 2.0
 */
declare function CGContextRotateCTM(c: any, angle: number): void;

/**
 * @since 2.0
 */
declare function CGContextSaveGState(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextScaleCTM(c: any, sx: number, sy: number): void;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CGContextSelectFont(c: any, name: string | interop.Pointer | interop.Reference<any>, size: number, textEncoding: CGTextEncoding): void;

/**
 * @since 2.0
 */
declare function CGContextSetAllowsAntialiasing(c: any, allowsAntialiasing: boolean): void;

/**
 * @since 2.0
 */
declare function CGContextSetAllowsFontSmoothing(c: any, allowsFontSmoothing: boolean): void;

/**
 * @since 2.0
 */
declare function CGContextSetAllowsFontSubpixelPositioning(c: any, allowsFontSubpixelPositioning: boolean): void;

/**
 * @since 2.0
 */
declare function CGContextSetAllowsFontSubpixelQuantization(c: any, allowsFontSubpixelQuantization: boolean): void;

/**
 * @since 2.0
 */
declare function CGContextSetAlpha(c: any, alpha: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetBlendMode(c: any, mode: CGBlendMode): void;

/**
 * @since 2.0
 */
declare function CGContextSetCMYKFillColor(c: any, cyan: number, magenta: number, yellow: number, black: number, alpha: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetCMYKStrokeColor(c: any, cyan: number, magenta: number, yellow: number, black: number, alpha: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetCharacterSpacing(c: any, spacing: number): void;

/**
 * @since 18.0
 */
declare function CGContextSetEDRTargetHeadroom(c: any, headroom: number): boolean;

/**
 * @since 2.0
 */
declare function CGContextSetFillColor(c: any, components: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 */
declare function CGContextSetFillColorSpace(c: any, space: any): void;

/**
 * @since 2.0
 */
declare function CGContextSetFillColorWithColor(c: any, color: any): void;

/**
 * @since 2.0
 */
declare function CGContextSetFillPattern(c: any, pattern: any, components: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 */
declare function CGContextSetFlatness(c: any, flatness: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetFont(c: any, font: any): void;

/**
 * @since 2.0
 */
declare function CGContextSetFontSize(c: any, size: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetGrayFillColor(c: any, gray: number, alpha: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetGrayStrokeColor(c: any, gray: number, alpha: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetInterpolationQuality(c: any, quality: CGInterpolationQuality): void;

/**
 * @since 2.0
 */
declare function CGContextSetLineCap(c: any, cap: CGLineCap): void;

/**
 * @since 2.0
 */
declare function CGContextSetLineDash(c: any, phase: number, lengths: interop.Pointer | interop.Reference<number>, count: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetLineJoin(c: any, join: CGLineJoin): void;

/**
 * @since 2.0
 */
declare function CGContextSetLineWidth(c: any, width: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetMiterLimit(c: any, limit: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetPatternPhase(c: any, phase: CGSize): void;

/**
 * @since 2.0
 */
declare function CGContextSetRGBFillColor(c: any, red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetRGBStrokeColor(c: any, red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetRenderingIntent(c: any, intent: CGColorRenderingIntent): void;

/**
 * @since 2.0
 */
declare function CGContextSetShadow(c: any, offset: CGSize, blur: number): void;

/**
 * @since 2.0
 */
declare function CGContextSetShadowWithColor(c: any, offset: CGSize, blur: number, color: any): void;

/**
 * @since 2.0
 */
declare function CGContextSetShouldAntialias(c: any, shouldAntialias: boolean): void;

/**
 * @since 2.0
 */
declare function CGContextSetShouldSmoothFonts(c: any, shouldSmoothFonts: boolean): void;

/**
 * @since 2.0
 */
declare function CGContextSetShouldSubpixelPositionFonts(c: any, shouldSubpixelPositionFonts: boolean): void;

/**
 * @since 2.0
 */
declare function CGContextSetShouldSubpixelQuantizeFonts(c: any, shouldSubpixelQuantizeFonts: boolean): void;

/**
 * @since 2.0
 */
declare function CGContextSetStrokeColor(c: any, components: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 */
declare function CGContextSetStrokeColorSpace(c: any, space: any): void;

/**
 * @since 2.0
 */
declare function CGContextSetStrokeColorWithColor(c: any, color: any): void;

/**
 * @since 2.0
 */
declare function CGContextSetStrokePattern(c: any, pattern: any, components: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 */
declare function CGContextSetTextDrawingMode(c: any, mode: CGTextDrawingMode): void;

/**
 * @since 2.0
 */
declare function CGContextSetTextMatrix(c: any, t: CGAffineTransform): void;

/**
 * @since 2.0
 */
declare function CGContextSetTextPosition(c: any, x: number, y: number): void;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CGContextShowGlyphs(c: any, g: interop.Pointer | interop.Reference<number>, count: number): void;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CGContextShowGlyphsAtPoint(c: any, x: number, y: number, glyphs: interop.Pointer | interop.Reference<number>, count: number): void;

/**
 * @since 2.0
 */
declare function CGContextShowGlyphsAtPositions(c: any, glyphs: interop.Pointer | interop.Reference<number>, Lpositions: interop.Pointer | interop.Reference<CGPoint>, count: number): void;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CGContextShowGlyphsWithAdvances(c: any, glyphs: interop.Pointer | interop.Reference<number>, advances: interop.Pointer | interop.Reference<CGSize>, count: number): void;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CGContextShowText(c: any, string: string | interop.Pointer | interop.Reference<any>, length: number): void;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CGContextShowTextAtPoint(c: any, x: number, y: number, string: string | interop.Pointer | interop.Reference<any>, length: number): void;

/**
 * @since 2.0
 */
declare function CGContextStrokeEllipseInRect(c: any, rect: CGRect): void;

/**
 * @since 2.0
 */
declare function CGContextStrokeLineSegments(c: any, points: interop.Pointer | interop.Reference<CGPoint>, count: number): void;

/**
 * @since 2.0
 */
declare function CGContextStrokePath(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextStrokeRect(c: any, rect: CGRect): void;

/**
 * @since 2.0
 */
declare function CGContextStrokeRectWithWidth(c: any, rect: CGRect, width: number): void;

/**
 * @since 2.0
 */
declare function CGContextSynchronize(c: any): void;

/**
 * @since 2.0
 */
declare function CGContextTranslateCTM(c: any, tx: number, ty: number): void;

declare function CGConvertColorDataWithFormat(width: number, height: number, dst_data: interop.Pointer | interop.Reference<any>, dst_format: CGColorDataFormat, src_data: interop.Pointer | interop.Reference<any>, src_format: CGColorDataFormat, options: NSDictionary<any, any>): boolean;

interface CGDataConsumerCallbacks {
	putBytes: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>;
	releaseConsumer: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
}
declare var CGDataConsumerCallbacks: interop.StructType<CGDataConsumerCallbacks>;

/**
 * @since 2.0
 */
declare function CGDataConsumerCreate(info: interop.Pointer | interop.Reference<any>, cbks: interop.Pointer | interop.Reference<CGDataConsumerCallbacks>): any;

/**
 * @since 2.0
 */
declare function CGDataConsumerCreateWithCFData(data: NSData): any;

/**
 * @since 2.0
 */
declare function CGDataConsumerCreateWithURL(url: NSURL): any;

/**
 * @since 2.0
 */
declare function CGDataConsumerGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGDataConsumerRelease(consumer: any): void;

/**
 * @since 2.0
 */
declare function CGDataConsumerRetain(consumer: any): any;

/**
 * @since 2.0
 */
declare function CGDataProviderCopyData(provider: any): NSData;

/**
 * @since 2.0
 */
declare function CGDataProviderCreateDirect(info: interop.Pointer | interop.Reference<any>, size: number, callbacks: interop.Pointer | interop.Reference<CGDataProviderDirectCallbacks>): any;

/**
 * @since 2.0
 */
declare function CGDataProviderCreateSequential(info: interop.Pointer | interop.Reference<any>, callbacks: interop.Pointer | interop.Reference<CGDataProviderSequentialCallbacks>): any;

/**
 * @since 2.0
 */
declare function CGDataProviderCreateWithCFData(data: NSData): any;

/**
 * @since 2.0
 */
declare function CGDataProviderCreateWithData(info: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>, size: number, releaseData: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>): any;

/**
 * @since 2.0
 */
declare function CGDataProviderCreateWithFilename(filename: string | interop.Pointer | interop.Reference<any>): any;

/**
 * @since 2.0
 */
declare function CGDataProviderCreateWithURL(url: NSURL): any;

interface CGDataProviderDirectCallbacks {
	version: number;
	getBytePointer: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	releaseBytePointer: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>;
	getBytesAtPosition: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number) => number>;
	releaseInfo: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
}
declare var CGDataProviderDirectCallbacks: interop.StructType<CGDataProviderDirectCallbacks>;

/**
 * @since 11.0
 */
declare function CGDataProviderGetInfo(provider: any): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGDataProviderGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGDataProviderRelease(provider: any): void;

/**
 * @since 2.0
 */
declare function CGDataProviderRetain(provider: any): any;

interface CGDataProviderSequentialCallbacks {
	version: number;
	getBytes: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>;
	skipForward: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>;
	rewind: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	releaseInfo: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
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

declare function CGErrorSetCallback(callback: interop.FunctionReference<() => void>): void;

/**
 * @since 2.0
 */
declare function CGFontCanCreatePostScriptSubset(font: any, format: CGFontPostScriptFormat): boolean;

/**
 * @since 2.0
 */
declare function CGFontCopyFullName(font: any): string;

/**
 * @since 2.0
 */
declare function CGFontCopyGlyphNameForGlyph(font: any, glyph: number): string;

/**
 * @since 2.0
 */
declare function CGFontCopyPostScriptName(font: any): string;

/**
 * @since 2.0
 */
declare function CGFontCopyTableForTag(font: any, tag: number): NSData;

/**
 * @since 2.0
 */
declare function CGFontCopyTableTags(font: any): NSArray<any>;

/**
 * @since 2.0
 */
declare function CGFontCopyVariationAxes(font: any): NSArray<any>;

/**
 * @since 2.0
 */
declare function CGFontCopyVariations(font: any): NSDictionary<any, any>;

/**
 * @since 2.0
 */
declare function CGFontCreateCopyWithVariations(font: any, variations: NSDictionary<any, any>): any;

/**
 * @since 2.0
 */
declare function CGFontCreatePostScriptEncoding(font: any, encoding: interop.Reference<number>): NSData;

/**
 * @since 2.0
 */
declare function CGFontCreatePostScriptSubset(font: any, subsetName: string, format: CGFontPostScriptFormat, glyphs: interop.Pointer | interop.Reference<number>, count: number, encoding: interop.Reference<number>): NSData;

/**
 * @since 2.0
 */
declare function CGFontCreateWithDataProvider(provider: any): any;

/**
 * @since 2.0
 */
declare function CGFontCreateWithFontName(name: string): any;

/**
 * @since 2.0
 */
declare function CGFontGetAscent(font: any): number;

/**
 * @since 2.0
 */
declare function CGFontGetCapHeight(font: any): number;

/**
 * @since 2.0
 */
declare function CGFontGetDescent(font: any): number;

/**
 * @since 2.0
 */
declare function CGFontGetFontBBox(font: any): CGRect;

/**
 * @since 2.0
 */
declare function CGFontGetGlyphAdvances(font: any, glyphs: interop.Pointer | interop.Reference<number>, count: number, advances: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 2.0
 */
declare function CGFontGetGlyphBBoxes(font: any, glyphs: interop.Pointer | interop.Reference<number>, count: number, bboxes: interop.Pointer | interop.Reference<CGRect>): boolean;

/**
 * @since 2.0
 */
declare function CGFontGetGlyphWithGlyphName(font: any, name: string): number;

/**
 * @since 2.0
 */
declare function CGFontGetItalicAngle(font: any): number;

/**
 * @since 2.0
 */
declare function CGFontGetLeading(font: any): number;

/**
 * @since 2.0
 */
declare function CGFontGetNumberOfGlyphs(font: any): number;

/**
 * @since 2.0
 */
declare function CGFontGetStemV(font: any): number;

/**
 * @since 2.0
 */
declare function CGFontGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGFontGetUnitsPerEm(font: any): number;

/**
 * @since 2.0
 */
declare function CGFontGetXHeight(font: any): number;

declare const enum CGFontPostScriptFormat {

	kCGFontPostScriptFormatType1 = 1,

	kCGFontPostScriptFormatType3 = 3,

	kCGFontPostScriptFormatType42 = 42
}

/**
 * @since 2.0
 */
declare function CGFontRelease(font: any): void;

/**
 * @since 2.0
 */
declare function CGFontRetain(font: any): any;

interface CGFunctionCallbacks {
	version: number;
	evaluate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>) => void>;
	releaseInfo: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
}
declare var CGFunctionCallbacks: interop.StructType<CGFunctionCallbacks>;

/**
 * @since 2.0
 */
declare function CGFunctionCreate(info: interop.Pointer | interop.Reference<any>, domainDimension: number, domain: interop.Pointer | interop.Reference<number>, rangeDimension: number, range: interop.Pointer | interop.Reference<number>, callbacks: interop.Pointer | interop.Reference<CGFunctionCallbacks>): any;

/**
 * @since 2.0
 */
declare function CGFunctionGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGFunctionRelease(_function: any): void;

/**
 * @since 2.0
 */
declare function CGFunctionRetain(_function: any): any;

declare const enum CGGlyphDeprecatedEnum {

	Min = 0,

	Max = 1
}

/**
 * @since 2.0
 */
declare function CGGradientCreateWithColorComponents(space: any, components: interop.Pointer | interop.Reference<number>, locations: interop.Pointer | interop.Reference<number>, count: number): any;

/**
 * @since 2.0
 */
declare function CGGradientCreateWithColors(space: any, colors: NSArray<any> | any[], locations: interop.Pointer | interop.Reference<number>): any;

declare const enum CGGradientDrawingOptions {

	kCGGradientDrawsBeforeStartLocation = 1,

	kCGGradientDrawsAfterEndLocation = 2
}

/**
 * @since 2.0
 */
declare function CGGradientGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGGradientRelease(gradient: any): void;

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
declare const enum CGImageByteOrderInfo {

	kCGImageByteOrderMask = 28672,

	kCGImageByteOrderDefault = 0,

	kCGImageByteOrder16Little = 4096,

	kCGImageByteOrder32Little = 8192,

	kCGImageByteOrder16Big = 12288,

	kCGImageByteOrder32Big = 16384
}

/**
 * @since 18.0
 */
declare function CGImageContainsImageSpecificToneMappingMetadata(image: any): boolean;

/**
 * @since 2.0
 */
declare function CGImageCreate(width: number, height: number, bitsPerComponent: number, bitsPerPixel: number, bytesPerRow: number, space: any, bitmapInfo: CGBitmapInfo, provider: any, decode: interop.Pointer | interop.Reference<number>, shouldInterpolate: boolean, intent: CGColorRenderingIntent): any;

/**
 * @since 2.0
 */
declare function CGImageCreateCopy(image: any): any;

/**
 * @since 2.0
 */
declare function CGImageCreateCopyWithColorSpace(image: any, space: any): any;

/**
 * @since 18.0
 */
declare function CGImageCreateCopyWithContentHeadroom(headroom: number, image: any): any;

/**
 * @since 18.0
 */
declare function CGImageCreateWithContentHeadroom(headroom: number, width: number, height: number, bitsPerComponent: number, bitsPerPixel: number, bytesPerRow: number, space: any, bitmapInfo: CGBitmapInfo, provider: any, decode: interop.Pointer | interop.Reference<number>, shouldInterpolate: boolean, intent: CGColorRenderingIntent): any;

/**
 * @since 2.0
 */
declare function CGImageCreateWithImageInRect(image: any, rect: CGRect): any;

/**
 * @since 2.0
 */
declare function CGImageCreateWithJPEGDataProvider(source: any, decode: interop.Pointer | interop.Reference<number>, shouldInterpolate: boolean, intent: CGColorRenderingIntent): any;

/**
 * @since 2.0
 */
declare function CGImageCreateWithMask(image: any, mask: any): any;

/**
 * @since 2.0
 */
declare function CGImageCreateWithMaskingColors(image: any, components: interop.Pointer | interop.Reference<number>): any;

/**
 * @since 2.0
 */
declare function CGImageCreateWithPNGDataProvider(source: any, decode: interop.Pointer | interop.Reference<number>, shouldInterpolate: boolean, intent: CGColorRenderingIntent): any;

/**
 * @since 2.0
 */
declare function CGImageGetAlphaInfo(image: any): CGImageAlphaInfo;

/**
 * @since 2.0
 */
declare function CGImageGetBitmapInfo(image: any): CGBitmapInfo;

/**
 * @since 2.0
 */
declare function CGImageGetBitsPerComponent(image: any): number;

/**
 * @since 2.0
 */
declare function CGImageGetBitsPerPixel(image: any): number;

/**
 * @since 12.0
 */
declare function CGImageGetByteOrderInfo(image: any): CGImageByteOrderInfo;

/**
 * @since 2.0
 */
declare function CGImageGetBytesPerRow(image: any): number;

/**
 * @since 2.0
 */
declare function CGImageGetColorSpace(image: any): any;

/**
 * @since 18.0
 */
declare function CGImageGetContentHeadroom(image: any): number;

/**
 * @since 2.0
 */
declare function CGImageGetDataProvider(image: any): any;

/**
 * @since 2.0
 */
declare function CGImageGetDecode(image: any): interop.Pointer | interop.Reference<number>;

/**
 * @since 2.0
 */
declare function CGImageGetHeight(image: any): number;

/**
 * @since 12.0
 */
declare function CGImageGetPixelFormatInfo(image: any): CGImagePixelFormatInfo;

/**
 * @since 2.0
 */
declare function CGImageGetRenderingIntent(image: any): CGColorRenderingIntent;

/**
 * @since 2.0
 */
declare function CGImageGetShouldInterpolate(image: any): boolean;

/**
 * @since 2.0
 */
declare function CGImageGetTypeID(): number;

/**
 * @since 9.0
 */
declare function CGImageGetUTType(image: any): string;

/**
 * @since 2.0
 */
declare function CGImageGetWidth(image: any): number;

/**
 * @since 2.0
 */
declare function CGImageIsMask(image: any): boolean;

/**
 * @since 2.0
 */
declare function CGImageMaskCreate(width: number, height: number, bitsPerComponent: number, bitsPerPixel: number, bytesPerRow: number, provider: any, decode: interop.Pointer | interop.Reference<number>, shouldInterpolate: boolean): any;

/**
 * @since 12.0
 */
declare const enum CGImagePixelFormatInfo {

	kCGImagePixelFormatMask = 983040,

	kCGImagePixelFormatPacked = 0,

	kCGImagePixelFormatRGB555 = 65536,

	kCGImagePixelFormatRGB565 = 131072,

	kCGImagePixelFormatRGB101010 = 196608,

	kCGImagePixelFormatRGBCIF10 = 262144
}

/**
 * @since 2.0
 */
declare function CGImageRelease(image: any): void;

/**
 * @since 2.0
 */
declare function CGImageRetain(image: any): any;

/**
 * @since 18.0
 */
declare function CGImageShouldToneMap(image: any): boolean;

declare const enum CGInterpolationQuality {

	kCGInterpolationDefault = 0,

	kCGInterpolationNone = 1,

	kCGInterpolationLow = 2,

	kCGInterpolationMedium = 4,

	kCGInterpolationHigh = 3
}

/**
 * @since 2.0
 */
declare function CGLayerCreateWithContext(context: any, size: CGSize, auxiliaryInfo: NSDictionary<any, any>): any;

/**
 * @since 2.0
 */
declare function CGLayerGetContext(layer: any): any;

/**
 * @since 2.0
 */
declare function CGLayerGetSize(layer: any): CGSize;

/**
 * @since 2.0
 */
declare function CGLayerGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGLayerRelease(layer: any): void;

/**
 * @since 2.0
 */
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

declare const enum CGPDFAccessPermissions {

	kCGPDFAllowsLowQualityPrinting = 1,

	kCGPDFAllowsHighQualityPrinting = 2,

	kCGPDFAllowsDocumentChanges = 4,

	kCGPDFAllowsDocumentAssembly = 8,

	kCGPDFAllowsContentCopying = 16,

	kCGPDFAllowsContentAccessibility = 32,

	kCGPDFAllowsCommenting = 64,

	kCGPDFAllowsFormFieldEntry = 128
}

/**
 * @since 12.0
 */
declare function CGPDFArrayApplyBlock(array: interop.Pointer | interop.Reference<any>, block: (p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => boolean, info: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetArray(array: interop.Pointer | interop.Reference<any>, index: number, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetBoolean(array: interop.Pointer | interop.Reference<any>, index: number, value: string | interop.Pointer | interop.Reference<any>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetCount(array: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetDictionary(array: interop.Pointer | interop.Reference<any>, index: number, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetInteger(array: interop.Pointer | interop.Reference<any>, index: number, value: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetName(array: interop.Pointer | interop.Reference<any>, index: number, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetNull(array: interop.Pointer | interop.Reference<any>, index: number): boolean;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetNumber(array: interop.Pointer | interop.Reference<any>, index: number, value: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetObject(array: interop.Pointer | interop.Reference<any>, index: number, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetStream(array: interop.Pointer | interop.Reference<any>, index: number, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFArrayGetString(array: interop.Pointer | interop.Reference<any>, index: number, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare const enum CGPDFBox {

	kCGPDFMediaBox = 0,

	kCGPDFCropBox = 1,

	kCGPDFBleedBox = 2,

	kCGPDFTrimBox = 3,

	kCGPDFArtBox = 4
}

/**
 * @since 2.0
 */
declare function CGPDFContentStreamCreateWithPage(page: any): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFContentStreamCreateWithStream(stream: interop.Pointer | interop.Reference<any>, streamResources: interop.Pointer | interop.Reference<any>, parent: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFContentStreamGetResource(cs: interop.Pointer | interop.Reference<any>, category: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFContentStreamGetStreams(cs: interop.Pointer | interop.Reference<any>): NSArray<any>;

/**
 * @since 2.0
 */
declare function CGPDFContentStreamRelease(cs: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function CGPDFContentStreamRetain(cs: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFContextAddDestinationAtPoint(context: any, name: string, point: CGPoint): void;

/**
 * @since 4.0
 */
declare function CGPDFContextAddDocumentMetadata(context: any, metadata: NSData): void;

/**
 * @since 2.0
 */
declare function CGPDFContextBeginPage(context: any, pageInfo: NSDictionary<any, any>): void;

/**
 * @since 13.0
 */
declare function CGPDFContextBeginTag(context: any, tagType: CGPDFTagType, tagProperties: NSDictionary<any, any>): void;

/**
 * @since 2.0
 */
declare function CGPDFContextClose(context: any): void;

/**
 * @since 2.0
 */
declare function CGPDFContextCreate(consumer: any, mediaBox: interop.Pointer | interop.Reference<CGRect>, auxiliaryInfo: NSDictionary<any, any>): any;

/**
 * @since 2.0
 */
declare function CGPDFContextCreateWithURL(url: NSURL, mediaBox: interop.Pointer | interop.Reference<CGRect>, auxiliaryInfo: NSDictionary<any, any>): any;

/**
 * @since 2.0
 */
declare function CGPDFContextEndPage(context: any): void;

/**
 * @since 13.0
 */
declare function CGPDFContextEndTag(context: any): void;

/**
 * @since 2.0
 */
declare function CGPDFContextSetDestinationForRect(context: any, name: string, rect: CGRect): void;

declare function CGPDFContextSetIDTree(context: any, IDTreeDictionary: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 11.0
 */
declare function CGPDFContextSetOutline(context: any, outline: NSDictionary<any, any>): void;

declare function CGPDFContextSetPageTagStructureTree(context: any, pageTagStructureTreeDictionary: NSDictionary<any, any>): void;

declare function CGPDFContextSetParentTree(context: any, parentTreeDictionary: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function CGPDFContextSetURLForRect(context: any, url: NSURL, rect: CGRect): void;

declare const enum CGPDFDataFormat {

	Raw = 0,

	JPEGEncoded = 1,

	JPEG2000 = 2
}

/**
 * @since 12.0
 */
declare function CGPDFDictionaryApplyBlock(dict: interop.Pointer | interop.Reference<any>, block: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => boolean, info: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryApplyFunction(dict: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => void>, info: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryGetArray(dict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryGetBoolean(dict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryGetCount(dict: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryGetDictionary(dict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryGetInteger(dict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryGetName(dict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryGetNumber(dict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryGetObject(dict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryGetStream(dict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDictionaryGetString(dict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDocumentAllowsCopying(document: any): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDocumentAllowsPrinting(document: any): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDocumentCreateWithProvider(provider: any): any;

/**
 * @since 2.0
 */
declare function CGPDFDocumentCreateWithURL(url: NSURL): any;

/**
 * @since 11.0
 */
declare function CGPDFDocumentGetAccessPermissions(document: any): CGPDFAccessPermissions;

/**
 * @since 2.0
 */
declare function CGPDFDocumentGetCatalog(document: any): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFDocumentGetID(document: any): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFDocumentGetInfo(document: any): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFDocumentGetNumberOfPages(document: any): number;

/**
 * @since 11.0
 */
declare function CGPDFDocumentGetOutline(document: any): NSDictionary<any, any>;

/**
 * @since 2.0
 */
declare function CGPDFDocumentGetPage(document: any, pageNumber: number): any;

/**
 * @since 2.0
 */
declare function CGPDFDocumentGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGPDFDocumentGetVersion(document: any, majorVersion: interop.Pointer | interop.Reference<number>, minorVersion: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 */
declare function CGPDFDocumentIsEncrypted(document: any): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDocumentIsUnlocked(document: any): boolean;

/**
 * @since 2.0
 */
declare function CGPDFDocumentRelease(document: any): void;

/**
 * @since 2.0
 */
declare function CGPDFDocumentRetain(document: any): any;

/**
 * @since 2.0
 */
declare function CGPDFDocumentUnlockWithPassword(document: any, password: string | interop.Pointer | interop.Reference<any>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFObjectGetType(object: interop.Pointer | interop.Reference<any>): CGPDFObjectType;

/**
 * @since 2.0
 */
declare function CGPDFObjectGetValue(object: interop.Pointer | interop.Reference<any>, type: CGPDFObjectType, value: interop.Pointer | interop.Reference<any>): boolean;

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

/**
 * @since 2.0
 */
declare function CGPDFOperatorTableCreate(): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFOperatorTableRelease(table: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function CGPDFOperatorTableRetain(table: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFOperatorTableSetCallback(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 2.0
 */
declare function CGPDFPageGetBoxRect(page: any, box: CGPDFBox): CGRect;

/**
 * @since 2.0
 */
declare function CGPDFPageGetDictionary(page: any): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFPageGetDocument(page: any): any;

/**
 * @since 2.0
 */
declare function CGPDFPageGetDrawingTransform(page: any, box: CGPDFBox, rect: CGRect, rotate: number, preserveAspectRatio: boolean): CGAffineTransform;

/**
 * @since 2.0
 */
declare function CGPDFPageGetPageNumber(page: any): number;

/**
 * @since 2.0
 */
declare function CGPDFPageGetRotationAngle(page: any): number;

/**
 * @since 2.0
 */
declare function CGPDFPageGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGPDFPageRelease(page: any): void;

/**
 * @since 2.0
 */
declare function CGPDFPageRetain(page: any): any;

/**
 * @since 2.0
 */
declare function CGPDFScannerCreate(cs: interop.Pointer | interop.Reference<any>, table: interop.Pointer | interop.Reference<any>, info: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFScannerGetContentStream(scanner: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFScannerPopArray(scanner: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFScannerPopBoolean(scanner: interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFScannerPopDictionary(scanner: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFScannerPopInteger(scanner: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFScannerPopName(scanner: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFScannerPopNumber(scanner: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFScannerPopObject(scanner: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFScannerPopStream(scanner: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFScannerPopString(scanner: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 2.0
 */
declare function CGPDFScannerRelease(scanner: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function CGPDFScannerRetain(scanner: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFScannerScan(scanner: interop.Pointer | interop.Reference<any>): boolean;

declare function CGPDFScannerStop(s: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function CGPDFStreamCopyData(stream: interop.Pointer | interop.Reference<any>, format: interop.Pointer | interop.Reference<CGPDFDataFormat>): NSData;

/**
 * @since 2.0
 */
declare function CGPDFStreamGetDictionary(stream: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFStringCopyDate(string: interop.Pointer | interop.Reference<any>): Date;

/**
 * @since 2.0
 */
declare function CGPDFStringCopyTextString(string: interop.Pointer | interop.Reference<any>): string;

/**
 * @since 2.0
 */
declare function CGPDFStringGetBytePtr(string: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPDFStringGetLength(string: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 13.0
 */
declare const enum CGPDFTagType {

	Document = 100,

	Part = 101,

	Art = 102,

	Section = 103,

	Div = 104,

	BlockQuote = 105,

	Caption = 106,

	TOC = 107,

	TOCI = 108,

	Index = 109,

	NonStructure = 110,

	Private = 111,

	Paragraph = 200,

	Header = 201,

	Header1 = 202,

	Header2 = 203,

	Header3 = 204,

	Header4 = 205,

	Header5 = 206,

	Header6 = 207,

	List = 300,

	ListItem = 301,

	Label = 302,

	ListBody = 303,

	Table = 400,

	TableRow = 401,

	TableHeaderCell = 402,

	TableDataCell = 403,

	TableHeader = 404,

	TableBody = 405,

	TableFooter = 406,

	Span = 500,

	Quote = 501,

	Note = 502,

	Reference = 503,

	Bibliography = 504,

	Code = 505,

	Link = 506,

	Annotation = 507,

	Ruby = 600,

	RubyBaseText = 601,

	RubyAnnotationText = 602,

	RubyPunctuation = 603,

	Warichu = 604,

	WarichuText = 605,

	WarichuPunctiation = 606,

	Figure = 700,

	Formula = 701,

	Form = 702,

	Object = 800
}

/**
 * @since 13.0
 */
declare function CGPDFTagTypeGetName(tagType: CGPDFTagType): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function CGPathAddArc(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, x: number, y: number, radius: number, startAngle: number, endAngle: number, clockwise: boolean): void;

/**
 * @since 2.0
 */
declare function CGPathAddArcToPoint(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, x1: number, y1: number, x2: number, y2: number, radius: number): void;

/**
 * @since 2.0
 */
declare function CGPathAddCurveToPoint(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

/**
 * @since 2.0
 */
declare function CGPathAddEllipseInRect(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, rect: CGRect): void;

/**
 * @since 2.0
 */
declare function CGPathAddLineToPoint(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, x: number, y: number): void;

/**
 * @since 2.0
 */
declare function CGPathAddLines(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, points: interop.Pointer | interop.Reference<CGPoint>, count: number): void;

/**
 * @since 2.0
 */
declare function CGPathAddPath(path1: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, path2: any): void;

/**
 * @since 2.0
 */
declare function CGPathAddQuadCurveToPoint(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, cpx: number, cpy: number, x: number, y: number): void;

/**
 * @since 2.0
 */
declare function CGPathAddRect(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, rect: CGRect): void;

/**
 * @since 2.0
 */
declare function CGPathAddRects(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, rects: interop.Pointer | interop.Reference<CGRect>, count: number): void;

/**
 * @since 5.0
 */
declare function CGPathAddRelativeArc(path: any, matrix: interop.Pointer | interop.Reference<CGAffineTransform>, x: number, y: number, radius: number, startAngle: number, delta: number): void;

/**
 * @since 7.0
 */
declare function CGPathAddRoundedRect(path: any, transform: interop.Pointer | interop.Reference<CGAffineTransform>, rect: CGRect, cornerWidth: number, cornerHeight: number): void;

/**
 * @since 2.0
 */
declare function CGPathApply(path: any, info: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<CGPathElement>) => void>): void;

/**
 * @since 11.0
 */
declare function CGPathApplyWithBlock(path: any, block: (p1: interop.Pointer | interop.Reference<CGPathElement>) => void): void;

/**
 * @since 2.0
 */
declare function CGPathCloseSubpath(path: any): void;

/**
 * @since 2.0
 */
declare function CGPathContainsPoint(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, point: CGPoint, eoFill: boolean): boolean;

/**
 * @since 2.0
 */
declare function CGPathCreateCopy(path: any): any;

/**
 * @since 5.0
 */
declare function CGPathCreateCopyByDashingPath(path: any, transform: interop.Pointer | interop.Reference<CGAffineTransform>, phase: number, lengths: interop.Pointer | interop.Reference<number>, count: number): any;

/**
 * @since 16.0
 */
declare function CGPathCreateCopyByFlattening(path: any, flatteningThreshold: number): any;

/**
 * @since 16.0
 */
declare function CGPathCreateCopyByIntersectingPath(path: any, maskPath: any, evenOddFillRule: boolean): any;

/**
 * @since 16.0
 */
declare function CGPathCreateCopyByNormalizing(path: any, evenOddFillRule: boolean): any;

/**
 * @since 5.0
 */
declare function CGPathCreateCopyByStrokingPath(path: any, transform: interop.Pointer | interop.Reference<CGAffineTransform>, lineWidth: number, lineCap: CGLineCap, lineJoin: CGLineJoin, miterLimit: number): any;

/**
 * @since 16.0
 */
declare function CGPathCreateCopyBySubtractingPath(path: any, maskPath: any, evenOddFillRule: boolean): any;

/**
 * @since 16.0
 */
declare function CGPathCreateCopyBySymmetricDifferenceOfPath(path: any, maskPath: any, evenOddFillRule: boolean): any;

/**
 * @since 5.0
 */
declare function CGPathCreateCopyByTransformingPath(path: any, transform: interop.Pointer | interop.Reference<CGAffineTransform>): any;

/**
 * @since 16.0
 */
declare function CGPathCreateCopyByUnioningPath(path: any, maskPath: any, evenOddFillRule: boolean): any;

/**
 * @since 16.0
 */
declare function CGPathCreateCopyOfLineByIntersectingPath(path: any, maskPath: any, evenOddFillRule: boolean): any;

/**
 * @since 16.0
 */
declare function CGPathCreateCopyOfLineBySubtractingPath(path: any, maskPath: any, evenOddFillRule: boolean): any;

/**
 * @since 2.0
 */
declare function CGPathCreateMutable(): any;

/**
 * @since 2.0
 */
declare function CGPathCreateMutableCopy(path: any): any;

/**
 * @since 5.0
 */
declare function CGPathCreateMutableCopyByTransformingPath(path: any, transform: interop.Pointer | interop.Reference<CGAffineTransform>): any;

/**
 * @since 16.0
 */
declare function CGPathCreateSeparateComponents(path: any, evenOddFillRule: boolean): NSArray<any>;

/**
 * @since 5.0
 */
declare function CGPathCreateWithEllipseInRect(rect: CGRect, transform: interop.Pointer | interop.Reference<CGAffineTransform>): any;

/**
 * @since 4.0
 */
declare function CGPathCreateWithRect(rect: CGRect, transform: interop.Pointer | interop.Reference<CGAffineTransform>): any;

/**
 * @since 7.0
 */
declare function CGPathCreateWithRoundedRect(rect: CGRect, cornerWidth: number, cornerHeight: number, transform: interop.Pointer | interop.Reference<CGAffineTransform>): any;

declare const enum CGPathDrawingMode {

	kCGPathFill = 0,

	kCGPathEOFill = 1,

	kCGPathStroke = 2,

	kCGPathFillStroke = 3,

	kCGPathEOFillStroke = 4
}

interface CGPathElement {
	type: CGPathElementType;
	points: interop.Pointer | interop.Reference<CGPoint>;
}
declare var CGPathElement: interop.StructType<CGPathElement>;

declare const enum CGPathElementType {

	kCGPathElementMoveToPoint = 0,

	kCGPathElementAddLineToPoint = 1,

	kCGPathElementAddQuadCurveToPoint = 2,

	kCGPathElementAddCurveToPoint = 3,

	kCGPathElementCloseSubpath = 4
}

/**
 * @since 2.0
 */
declare function CGPathEqualToPath(path1: any, path2: any): boolean;

/**
 * @since 2.0
 */
declare function CGPathGetBoundingBox(path: any): CGRect;

/**
 * @since 2.0
 */
declare function CGPathGetCurrentPoint(path: any): CGPoint;

/**
 * @since 4.0
 */
declare function CGPathGetPathBoundingBox(path: any): CGRect;

/**
 * @since 2.0
 */
declare function CGPathGetTypeID(): number;

/**
 * @since 16.0
 */
declare function CGPathIntersectsPath(path1: any, path2: any, evenOddFillRule: boolean): boolean;

/**
 * @since 2.0
 */
declare function CGPathIsEmpty(path: any): boolean;

/**
 * @since 2.0
 */
declare function CGPathIsRect(path: any, rect: interop.Pointer | interop.Reference<CGRect>): boolean;

/**
 * @since 2.0
 */
declare function CGPathMoveToPoint(path: any, m: interop.Pointer | interop.Reference<CGAffineTransform>, x: number, y: number): void;

/**
 * @since 2.0
 */
declare function CGPathRelease(path: any): void;

/**
 * @since 2.0
 */
declare function CGPathRetain(path: any): any;

interface CGPatternCallbacks {
	version: number;
	drawPattern: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: any) => void>;
	releaseInfo: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
}
declare var CGPatternCallbacks: interop.StructType<CGPatternCallbacks>;

/**
 * @since 2.0
 */
declare function CGPatternCreate(info: interop.Pointer | interop.Reference<any>, bounds: CGRect, matrix: CGAffineTransform, xStep: number, yStep: number, tiling: CGPatternTiling, isColored: boolean, callbacks: interop.Pointer | interop.Reference<CGPatternCallbacks>): any;

/**
 * @since 2.0
 */
declare function CGPatternGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGPatternRelease(pattern: any): void;

/**
 * @since 2.0
 */
declare function CGPatternRetain(pattern: any): any;

declare const enum CGPatternTiling {

	kCGPatternTilingNoDistortion = 0,

	kCGPatternTilingConstantSpacingMinimalDistortion = 1,

	kCGPatternTilingConstantSpacing = 2
}

/**
 * @since 2.0
 */
declare function CGPointApplyAffineTransform(point: CGPoint, t: CGAffineTransform): CGPoint;

/**
 * @since 2.0
 */
declare function CGPointCreateDictionaryRepresentation(point: CGPoint): NSDictionary<any, any>;

/**
 * @since 2.0
 */
declare function CGPointEqualToPoint(point1: CGPoint, point2: CGPoint): boolean;

declare function CGPointMake(x: number, y: number): CGPoint;

/**
 * @since 2.0
 */
declare function CGPointMakeWithDictionaryRepresentation(dict: NSDictionary<any, any>, point: interop.Pointer | interop.Reference<CGPoint>): boolean;

/**
 * @since 2.0
 */
declare var CGPointZero: CGPoint;

/**
 * @since 2.0
 */
declare function CGRectApplyAffineTransform(rect: CGRect, t: CGAffineTransform): CGRect;

/**
 * @since 2.0
 */
declare function CGRectContainsPoint(rect: CGRect, point: CGPoint): boolean;

/**
 * @since 2.0
 */
declare function CGRectContainsRect(rect1: CGRect, rect2: CGRect): boolean;

/**
 * @since 2.0
 */
declare function CGRectCreateDictionaryRepresentation(p1: CGRect): NSDictionary<any, any>;

/**
 * @since 2.0
 */
declare function CGRectDivide(rect: CGRect, slice: interop.Pointer | interop.Reference<CGRect>, remainder: interop.Pointer | interop.Reference<CGRect>, amount: number, edge: CGRectEdge): void;

/**
 * @since 2.0
 */
declare function CGRectEqualToRect(rect1: CGRect, rect2: CGRect): boolean;

/**
 * @since 2.0
 */
declare function CGRectGetHeight(rect: CGRect): number;

/**
 * @since 2.0
 */
declare function CGRectGetMaxX(rect: CGRect): number;

/**
 * @since 2.0
 */
declare function CGRectGetMaxY(rect: CGRect): number;

/**
 * @since 2.0
 */
declare function CGRectGetMidX(rect: CGRect): number;

/**
 * @since 2.0
 */
declare function CGRectGetMidY(rect: CGRect): number;

/**
 * @since 2.0
 */
declare function CGRectGetMinX(rect: CGRect): number;

/**
 * @since 2.0
 */
declare function CGRectGetMinY(rect: CGRect): number;

/**
 * @since 2.0
 */
declare function CGRectGetWidth(rect: CGRect): number;

/**
 * @since 2.0
 */
declare var CGRectInfinite: CGRect;

/**
 * @since 2.0
 */
declare function CGRectInset(rect: CGRect, dx: number, dy: number): CGRect;

/**
 * @since 2.0
 */
declare function CGRectIntegral(rect: CGRect): CGRect;

/**
 * @since 2.0
 */
declare function CGRectIntersection(r1: CGRect, r2: CGRect): CGRect;

/**
 * @since 2.0
 */
declare function CGRectIntersectsRect(rect1: CGRect, rect2: CGRect): boolean;

/**
 * @since 2.0
 */
declare function CGRectIsEmpty(rect: CGRect): boolean;

/**
 * @since 2.0
 */
declare function CGRectIsInfinite(rect: CGRect): boolean;

/**
 * @since 2.0
 */
declare function CGRectIsNull(rect: CGRect): boolean;

declare function CGRectMake(x: number, y: number, width: number, height: number): CGRect;

/**
 * @since 2.0
 */
declare function CGRectMakeWithDictionaryRepresentation(dict: NSDictionary<any, any>, rect: interop.Pointer | interop.Reference<CGRect>): boolean;

/**
 * @since 2.0
 */
declare var CGRectNull: CGRect;

/**
 * @since 2.0
 */
declare function CGRectOffset(rect: CGRect, dx: number, dy: number): CGRect;

/**
 * @since 2.0
 */
declare function CGRectStandardize(rect: CGRect): CGRect;

/**
 * @since 2.0
 */
declare function CGRectUnion(r1: CGRect, r2: CGRect): CGRect;

/**
 * @since 2.0
 */
declare var CGRectZero: CGRect;

/**
 * @since 2.0
 */
declare function CGShadingCreateAxial(space: any, start: CGPoint, end: CGPoint, _function: any, extendStart: boolean, extendEnd: boolean): any;

/**
 * @since 2.0
 */
declare function CGShadingCreateRadial(space: any, start: CGPoint, startRadius: number, end: CGPoint, endRadius: number, _function: any, extendStart: boolean, extendEnd: boolean): any;

/**
 * @since 2.0
 */
declare function CGShadingGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CGShadingRelease(shading: any): void;

/**
 * @since 2.0
 */
declare function CGShadingRetain(shading: any): any;

/**
 * @since 2.0
 */
declare function CGSizeApplyAffineTransform(size: CGSize, t: CGAffineTransform): CGSize;

/**
 * @since 2.0
 */
declare function CGSizeCreateDictionaryRepresentation(size: CGSize): NSDictionary<any, any>;

/**
 * @since 2.0
 */
declare function CGSizeEqualToSize(size1: CGSize, size2: CGSize): boolean;

declare function CGSizeMake(width: number, height: number): CGSize;

/**
 * @since 2.0
 */
declare function CGSizeMakeWithDictionaryRepresentation(dict: NSDictionary<any, any>, size: interop.Pointer | interop.Reference<CGSize>): boolean;

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare const enum CGTextEncoding {

	kCGEncodingFontSpecific = 0,

	kCGEncodingMacRoman = 1
}

/**
 * @since 18.0
 */
declare const enum CGToneMapping {

	kCGToneMappingDefault = 0,

	kCGToneMappingImageSpecificLumaScaling = 1,

	kCGToneMappingReferenceWhiteBased = 2,

	kCGToneMappingITURecommended = 3,

	kCGToneMappingEXRGamma = 4,

	kCGToneMappingNone = 5
}

declare function CGVectorMake(dx: number, dy: number): CGVector;

declare var kCGBitmapByteOrder16Host: CGBitmapInfo;

declare var kCGBitmapByteOrder32Host: CGBitmapInfo;

/**
 * @since 14.0
 */
declare var kCGColorBlack: string;

/**
 * @since 14.0
 */
declare var kCGColorClear: string;

/**
 * @since 10.0
 */
declare var kCGColorConversionBlackPointCompensation: string;

/**
 * @since 11.0
 */
declare var kCGColorConversionTRCSize: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceACESCGLinear: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceAdobeRGB1998: string;

/**
 * @since 18.0
 */
declare var kCGColorSpaceCoreMedia709: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceDCIP3: string;

/**
 * @since 9.3
 */
declare var kCGColorSpaceDisplayP3: string;

/**
 * @since 12.6
 */
declare var kCGColorSpaceDisplayP3_HLG: string;

/**
 * @since 13.4
 */
declare var kCGColorSpaceDisplayP3_PQ: string;

/**
 * @since 12.6
 * @deprecated 13.4
 */
declare var kCGColorSpaceDisplayP3_PQ_EOTF: string;

/**
 * @since 14.0
 */
declare var kCGColorSpaceExtendedDisplayP3: string;

/**
 * @since 10.0
 */
declare var kCGColorSpaceExtendedGray: string;

/**
 * @since 14.0
 */
declare var kCGColorSpaceExtendedITUR_2020: string;

/**
 * @since 12.3
 */
declare var kCGColorSpaceExtendedLinearDisplayP3: string;

/**
 * @since 10.0
 */
declare var kCGColorSpaceExtendedLinearGray: string;

/**
 * @since 12.3
 */
declare var kCGColorSpaceExtendedLinearITUR_2020: string;

/**
 * @since 10.0
 */
declare var kCGColorSpaceExtendedLinearSRGB: string;

declare var kCGColorSpaceExtendedRange: string;

/**
 * @since 10.0
 */
declare var kCGColorSpaceExtendedSRGB: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceGenericCMYK: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceGenericGray: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceGenericGrayGamma2_2: string;

/**
 * @since 11.0
 */
declare var kCGColorSpaceGenericLab: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceGenericRGB: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceGenericRGBLinear: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceGenericXYZ: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceITUR_2020: string;

/**
 * @since 12.6
 * @deprecated 14.0
 */
declare var kCGColorSpaceITUR_2020_HLG: string;

/**
 * @since 13.4
 * @deprecated 14.0
 */
declare var kCGColorSpaceITUR_2020_PQ: string;

/**
 * @since 12.6
 * @deprecated 13.4
 */
declare var kCGColorSpaceITUR_2020_PQ_EOTF: string;

/**
 * @since 15.1
 */
declare var kCGColorSpaceITUR_2020_sRGBGamma: string;

/**
 * @since 14.0
 */
declare var kCGColorSpaceITUR_2100_HLG: string;

/**
 * @since 14.0
 */
declare var kCGColorSpaceITUR_2100_PQ: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceITUR_709: string;

/**
 * @since 15.1
 */
declare var kCGColorSpaceITUR_709_HLG: string;

/**
 * @since 15.1
 */
declare var kCGColorSpaceITUR_709_PQ: string;

/**
 * @since 15.0
 */
declare var kCGColorSpaceLinearDisplayP3: string;

/**
 * @since 10.0
 */
declare var kCGColorSpaceLinearGray: string;

/**
 * @since 15.0
 */
declare var kCGColorSpaceLinearITUR_2020: string;

/**
 * @since 10.0
 */
declare var kCGColorSpaceLinearSRGB: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceROMMRGB: string;

/**
 * @since 9.0
 */
declare var kCGColorSpaceSRGB: string;

/**
 * @since 14.0
 */
declare var kCGColorWhite: string;

/**
 * @since 18.0
 */
declare var kCGDefaultHDRImageContentHeadroom: number;

/**
 * @since 18.0
 */
declare var kCGEXRToneMappingGammaDefog: string;

/**
 * @since 18.0
 */
declare var kCGEXRToneMappingGammaExposure: string;

/**
 * @since 18.0
 */
declare var kCGEXRToneMappingGammaKneeHigh: string;

/**
 * @since 18.0
 */
declare var kCGEXRToneMappingGammaKneeLow: string;

declare var kCGFontIndexInvalid: number;

declare var kCGFontIndexMax: number;

/**
 * @since 2.0
 */
declare var kCGFontVariationAxisDefaultValue: string;

/**
 * @since 2.0
 */
declare var kCGFontVariationAxisMaxValue: string;

/**
 * @since 2.0
 */
declare var kCGFontVariationAxisMinValue: string;

/**
 * @since 2.0
 */
declare var kCGFontVariationAxisName: string;

declare var kCGGlyphMax: number;

/**
 * @since 11.0
 */
declare var kCGPDFContextAccessPermissions: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextAllowsCopying: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextAllowsPrinting: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextArtBox: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextAuthor: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextBleedBox: string;

/**
 * @since 14.0
 */
declare var kCGPDFContextCreateLinearizedPDF: string;

/**
 * @since 14.0
 */
declare var kCGPDFContextCreatePDFA: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextCreator: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextCropBox: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextEncryptionKeyLength: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextKeywords: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextMediaBox: string;

/**
 * @since 14.0
 */
declare var kCGPDFContextOutputIntent: string;

/**
 * @since 14.0
 */
declare var kCGPDFContextOutputIntents: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextOwnerPassword: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextSubject: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextTitle: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextTrimBox: string;

/**
 * @since 2.0
 */
declare var kCGPDFContextUserPassword: string;

/**
 * @since 11.0
 */
declare var kCGPDFOutlineChildren: string;

/**
 * @since 11.0
 */
declare var kCGPDFOutlineDestination: string;

/**
 * @since 11.0
 */
declare var kCGPDFOutlineDestinationRect: string;

/**
 * @since 11.0
 */
declare var kCGPDFOutlineTitle: string;

/**
 * @since 13.0
 */
declare var kCGPDFTagPropertyActualText: string;

/**
 * @since 13.0
 */
declare var kCGPDFTagPropertyAlternativeText: string;

/**
 * @since 13.0
 */
declare var kCGPDFTagPropertyLanguageText: string;

/**
 * @since 13.0
 */
declare var kCGPDFTagPropertyTitleText: string;

/**
 * @since 14.0
 */
declare var kCGPDFXDestinationOutputProfile: string;

/**
 * @since 14.0
 */
declare var kCGPDFXInfo: string;

/**
 * @since 14.0
 */
declare var kCGPDFXOutputCondition: string;

/**
 * @since 14.0
 */
declare var kCGPDFXOutputConditionIdentifier: string;

/**
 * @since 14.0
 */
declare var kCGPDFXOutputIntentSubtype: string;

/**
 * @since 14.0
 */
declare var kCGPDFXRegistryName: string;

/**
 * @since 18.0
 */
declare var kCGSkipBoostToHDR: string;

/**
 * @since 18.0
 */
declare var kCGUse100nitsHLGOOTF: string;

/**
 * @since 18.0
 */
declare var kCGUseBT1886ForCoreVideoGamma: string;
