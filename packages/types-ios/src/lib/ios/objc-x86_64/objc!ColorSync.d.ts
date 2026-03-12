
declare function ColorSyncAPIVersion(): number;

declare const enum ColorSyncAlphaInfo {

	kColorSyncAlphaNone = 0,

	kColorSyncAlphaPremultipliedLast = 1,

	kColorSyncAlphaPremultipliedFirst = 2,

	kColorSyncAlphaLast = 3,

	kColorSyncAlphaFirst = 4,

	kColorSyncAlphaNoneSkipLast = 5,

	kColorSyncAlphaNoneSkipFirst = 6
}

/**
 * @since 16.0
 */
declare function ColorSyncCreateCodeFragment(profileSequence: NSArray<any> | any[], options: NSDictionary<any, any>): any;

declare const enum ColorSyncDataDepth {

	kColorSync1BitGamut = 1,

	kColorSync8BitInteger = 2,

	kColorSync16BitInteger = 3,

	kColorSync16BitFloat = 4,

	kColorSync32BitInteger = 5,

	kColorSync32BitNamedColorIndex = 6,

	kColorSync32BitFloat = 7,

	kColorSync10BitInteger = 8
}

/**
 * @since 16.0
 */
declare function ColorSyncIterateInstalledProfiles(callBack: interop.FunctionReference<(p1: NSDictionary<any, any>, p2: interop.Pointer | interop.Reference<any>) => boolean>, seed: interop.Pointer | interop.Reference<number>, userInfo: interop.Pointer | interop.Reference<any>, error: interop.Pointer | interop.Reference<NSError>): void;

interface ColorSyncMD5 {
	digest: interop.Reference<number>;
}
declare var ColorSyncMD5: interop.StructType<ColorSyncMD5>;

/**
 * @since 16.0
 */
declare function ColorSyncProfileContainsTag(prof: any, signature: string): boolean;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCopyData(prof: any, error: interop.Pointer | interop.Reference<NSError>): NSData;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCopyDescriptionString(prof: any): string;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCopyHeader(prof: any): NSData;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCopyTag(prof: any, signature: string): NSData;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCopyTagSignatures(prof: any): NSArray<any>;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCreate(data: NSData, error: interop.Pointer | interop.Reference<NSError>): any;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCreateLink(profileInfo: NSArray<any> | any[], options: NSDictionary<any, any>): any;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCreateMutable(): any;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCreateMutableCopy(prof: any): any;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCreateWithName(name: string): any;

/**
 * @since 16.0
 */
declare function ColorSyncProfileCreateWithURL(url: NSURL, error: interop.Pointer | interop.Reference<NSError>): any;

/**
 * @since 16.0
 */
declare function ColorSyncProfileGetMD5(prof: any): ColorSyncMD5;

/**
 * @since 16.0
 */
declare function ColorSyncProfileGetTypeID(): number;

/**
 * @since 16.0
 */
declare function ColorSyncProfileGetURL(prof: any, error: interop.Pointer | interop.Reference<NSError>): NSURL;

/**
 * @since 16.0
 */
declare function ColorSyncProfileIsHLGBased(p1: any): boolean;

/**
 * @since 16.0
 */
declare function ColorSyncProfileIsMatrixBased(p1: any): boolean;

/**
 * @since 16.0
 */
declare function ColorSyncProfileIsPQBased(p1: any): boolean;

/**
 * @since 16.0
 */
declare function ColorSyncProfileIsWideGamut(p1: any): boolean;

/**
 * @since 16.0
 */
declare function ColorSyncProfileRemoveTag(prof: any, signature: string): void;

/**
 * @since 16.0
 */
declare function ColorSyncProfileSetHeader(prof: any, header: NSData): void;

/**
 * @since 16.0
 */
declare function ColorSyncProfileSetTag(prof: any, signature: string, data: NSData): void;

/**
 * @since 16.0
 */
declare function ColorSyncProfileVerify(prof: any, errors: interop.Pointer | interop.Reference<NSError>, warnings: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 16.0
 */
declare function ColorSyncTransformConvert(transform: any, width: number, height: number, dst: interop.Pointer | interop.Reference<any>, dstDepth: ColorSyncDataDepth, dstLayout: number, dstBytesPerRow: number, src: interop.Pointer | interop.Reference<any>, srcDepth: ColorSyncDataDepth, srcLayout: number, srcBytesPerRow: number, options: NSDictionary<any, any>): boolean;

/**
 * @since 16.0
 */
declare function ColorSyncTransformCopyProperty(transform: any, key: any, options: NSDictionary<any, any>): any;

/**
 * @since 16.0
 */
declare function ColorSyncTransformCreate(profileSequence: NSArray<any> | any[], options: NSDictionary<any, any>): any;

/**
 * @since 16.0
 */
declare function ColorSyncTransformGetProfileSequence(transform: any): NSArray<any>;

/**
 * @since 16.0
 */
declare function ColorSyncTransformGetTypeID(): number;

/**
 * @since 16.0
 */
declare function ColorSyncTransformSetProperty(transform: any, key: any, property: any): void;

/**
 * @since 16.0
 */
declare var kColorSyncACESCGLinearProfile: string;

/**
 * @since 16.0
 */
declare var kColorSyncAdobeRGB1998Profile: string;

declare const kColorSyncAlphaInfoMask: number;

/**
 * @since 16.0
 */
declare var kColorSyncBestQuality: string;

/**
 * @since 16.0
 */
declare var kColorSyncBlackPointCompensation: string;

declare const kColorSyncByteOrder16Big: number;

declare const kColorSyncByteOrder16Little: number;

declare const kColorSyncByteOrder32Big: number;

declare const kColorSyncByteOrder32Little: number;

declare const kColorSyncByteOrderDefault: number;

declare const kColorSyncByteOrderMask: number;

/**
 * @since 16.0
 */
declare var kColorSyncConversion1DLut: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversion3DLut: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionBPC: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionChannelID: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionGridPoints: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionInpChan: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionMatrix: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionNDLut: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionOutChan: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionParamCurve0: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionParamCurve1: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionParamCurve2: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionParamCurve3: string;

/**
 * @since 16.0
 */
declare var kColorSyncConversionParamCurve4: string;

/**
 * @since 16.0
 */
declare var kColorSyncConvertQuality: string;

/**
 * @since 16.0
 */
declare var kColorSyncConvertUseExtendedRange: string;

/**
 * @since 16.0
 */
declare var kColorSyncDCIP3Profile: string;

/**
 * @since 16.0
 */
declare var kColorSyncDisplayP3Profile: string;

/**
 * @since 16.0
 */
declare var kColorSyncDraftQuality: string;

/**
 * @since 16.0
 */
declare var kColorSyncExtendedRange: string;

/**
 * @since 16.0
 */
declare var kColorSyncFixedPointRange: string;

/**
 * @since 16.0
 */
declare var kColorSyncGenericCMYKProfile: string;

/**
 * @since 16.0
 */
declare var kColorSyncGenericGrayGamma22Profile: string;

/**
 * @since 16.0
 */
declare var kColorSyncGenericGrayProfile: string;

/**
 * @since 16.0
 */
declare var kColorSyncGenericLabProfile: string;

/**
 * @since 16.0
 */
declare var kColorSyncGenericRGBProfile: string;

/**
 * @since 16.0
 */
declare var kColorSyncGenericXYZProfile: string;

/**
 * @since 17.0
 */
declare var kColorSyncHDRDerivative: string;

/**
 * @since 17.0
 */
declare var kColorSyncHLGDerivative: string;

/**
 * @since 16.0
 */
declare var kColorSyncITUR2020Profile: string;

/**
 * @since 16.0
 */
declare var kColorSyncITUR709Profile: string;

/**
 * @since 16.0
 */
declare var kColorSyncNormalQuality: string;

/**
 * @since 17.0
 */
declare var kColorSyncPQDerivative: string;

/**
 * @since 16.0
 */
declare var kColorSyncProfile: string;

declare var kColorSyncProfileCacheSeed: string;

/**
 * @since 16.0
 */
declare var kColorSyncProfileClass: string;

/**
 * @since 16.0
 */
declare var kColorSyncProfileColorSpace: string;

/**
 * @since 16.0
 */
declare var kColorSyncProfileDescription: string;

/**
 * @since 16.0
 */
declare var kColorSyncProfileHeader: string;

/**
 * @since 16.0
 */
declare var kColorSyncProfileIsValid: string;

/**
 * @since 16.0
 */
declare var kColorSyncProfileMD5Digest: string;

/**
 * @since 16.0
 */
declare var kColorSyncProfilePCS: string;

/**
 * @since 16.0
 */
declare var kColorSyncProfileURL: string;

/**
 * @since 16.0
 */
declare var kColorSyncROMMRGBProfile: string;

/**
 * @since 16.0
 */
declare var kColorSyncRenderingIntent: string;

/**
 * @since 16.0
 */
declare var kColorSyncRenderingIntentAbsolute: string;

/**
 * @since 16.0
 */
declare var kColorSyncRenderingIntentPerceptual: string;

/**
 * @since 16.0
 */
declare var kColorSyncRenderingIntentRelative: string;

/**
 * @since 16.0
 */
declare var kColorSyncRenderingIntentSaturation: string;

/**
 * @since 16.0
 */
declare var kColorSyncRenderingIntentUseProfileHeader: string;

/**
 * @since 16.0
 */
declare var kColorSyncSRGBProfile: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigAToB0Tag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigAToB1Tag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigAToB2Tag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigAbstractClass: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigBToA0Tag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigBToA1Tag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigBToA2Tag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigBlueColorantTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigBlueTRCTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigCmykData: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigColorSpaceClass: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigCopyrightTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigDeviceMfgDescTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigDeviceModelDescTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigDisplayClass: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigGamutTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigGrayData: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigGrayTRCTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigGreenColorantTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigGreenTRCTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigInputClass: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigLabData: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigLinkClass: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigMediaBlackPointTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigMediaWhitePointTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigNamedColor2Tag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigNamedColorClass: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigOutputClass: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigPreview0Tag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigPreview1Tag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigPreview2Tag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigProfileDescriptionTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigProfileSequenceDescTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigRedColorantTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigRedTRCTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigRgbData: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigTechnologyTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigViewingCondDescTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigViewingConditionsTag: string;

/**
 * @since 16.0
 */
declare var kColorSyncSigXYZData: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformCodeFragmentMD5: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformCodeFragmentType: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformCreator: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformDeviceToDevice: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformDeviceToPCS: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformDstSpace: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformFullConversionData: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformGamutCheck: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformInfo: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformPCSToDevice: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformPCSToPCS: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformParametricConversionData: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformProfileSequnce: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformSimplifiedConversionData: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformSrcSpace: string;

/**
 * @since 16.0
 */
declare var kColorSyncTransformTag: string;

/**
 * @since 18.0
 */
declare var kColorSyncTransformUseITU709OETF: string;

/**
 * @since 16.1
 */
declare var kColorSyncWebSafeColorsProfile: string;
