
declare const enum ColorSyncAlphaInfo {

	kColorSyncAlphaNone = 0,

	kColorSyncAlphaPremultipliedLast = 1,

	kColorSyncAlphaPremultipliedFirst = 2,

	kColorSyncAlphaLast = 3,

	kColorSyncAlphaFirst = 4,

	kColorSyncAlphaNoneSkipLast = 5,

	kColorSyncAlphaNoneSkipFirst = 6
}

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

declare function ColorSyncIterateInstalledProfiles(callBack: interop.FunctionReference<(p1: NSDictionary<any, any>, p2: interop.Pointer | interop.Reference<any>) => boolean>, seed: interop.Pointer | interop.Reference<number>, userInfo: interop.Pointer | interop.Reference<any>, error: interop.Pointer | interop.Reference<NSError>): void;

interface ColorSyncMD5 {
	digest: interop.Reference<number>;
}
declare var ColorSyncMD5: interop.StructType<ColorSyncMD5>;

declare function ColorSyncProfileContainsTag(prof: any, signature: string): boolean;

declare function ColorSyncProfileCopyData(prof: any, error: interop.Pointer | interop.Reference<NSError>): NSData;

declare function ColorSyncProfileCopyDescriptionString(prof: any): string;

declare function ColorSyncProfileCopyHeader(prof: any): NSData;

declare function ColorSyncProfileCopyTag(prof: any, signature: string): NSData;

declare function ColorSyncProfileCopyTagSignatures(prof: any): NSArray<any>;

declare function ColorSyncProfileCreate(data: NSData, error: interop.Pointer | interop.Reference<NSError>): any;

declare function ColorSyncProfileCreateLink(profileInfo: NSArray<any> | any[], options: NSDictionary<any, any>): any;

declare function ColorSyncProfileCreateMutable(): any;

declare function ColorSyncProfileCreateMutableCopy(prof: any): any;

declare function ColorSyncProfileCreateWithName(name: string): any;

declare function ColorSyncProfileCreateWithURL(url: NSURL, error: interop.Pointer | interop.Reference<NSError>): any;

declare function ColorSyncProfileGetMD5(prof: any): ColorSyncMD5;

declare function ColorSyncProfileGetTypeID(): number;

declare function ColorSyncProfileGetURL(prof: any, error: interop.Pointer | interop.Reference<NSError>): NSURL;

declare function ColorSyncProfileIsHLGBased(p1: any): boolean;

declare function ColorSyncProfileIsMatrixBased(p1: any): boolean;

declare function ColorSyncProfileIsPQBased(p1: any): boolean;

declare function ColorSyncProfileIsWideGamut(p1: any): boolean;

declare function ColorSyncProfileRemoveTag(prof: any, signature: string): void;

declare function ColorSyncProfileSetHeader(prof: any, header: NSData): void;

declare function ColorSyncProfileSetTag(prof: any, signature: string, data: NSData): void;

declare function ColorSyncProfileVerify(prof: any, errors: interop.Pointer | interop.Reference<NSError>, warnings: interop.Pointer | interop.Reference<NSError>): boolean;

declare function ColorSyncTransformConvert(transform: any, width: number, height: number, dst: interop.Pointer | interop.Reference<any>, dstDepth: ColorSyncDataDepth, dstLayout: number, dstBytesPerRow: number, src: interop.Pointer | interop.Reference<any>, srcDepth: ColorSyncDataDepth, srcLayout: number, srcBytesPerRow: number, options: NSDictionary<any, any>): boolean;

declare function ColorSyncTransformCopyProperty(transform: any, key: any, options: NSDictionary<any, any>): any;

declare function ColorSyncTransformCreate(profileSequence: NSArray<any> | any[], options: NSDictionary<any, any>): any;

declare function ColorSyncTransformGetProfileSequence(transform: any): NSArray<any>;

declare function ColorSyncTransformGetTypeID(): number;

declare function ColorSyncTransformSetProperty(transform: any, key: any, property: any): void;

declare var kColorSyncACESCGLinearProfile: string;

declare var kColorSyncAdobeRGB1998Profile: string;

declare const kColorSyncAlphaInfoMask: number;

declare var kColorSyncBestQuality: string;

declare var kColorSyncBlackPointCompensation: string;

declare const kColorSyncByteOrder16Big: number;

declare const kColorSyncByteOrder16Little: number;

declare const kColorSyncByteOrder32Big: number;

declare const kColorSyncByteOrder32Little: number;

declare const kColorSyncByteOrderDefault: number;

declare const kColorSyncByteOrderMask: number;

declare var kColorSyncConversion1DLut: string;

declare var kColorSyncConversion3DLut: string;

declare var kColorSyncConversionBPC: string;

declare var kColorSyncConversionChannelID: string;

declare var kColorSyncConversionGridPoints: string;

declare var kColorSyncConversionInpChan: string;

declare var kColorSyncConversionMatrix: string;

declare var kColorSyncConversionNDLut: string;

declare var kColorSyncConversionOutChan: string;

declare var kColorSyncConversionParamCurve0: string;

declare var kColorSyncConversionParamCurve1: string;

declare var kColorSyncConversionParamCurve2: string;

declare var kColorSyncConversionParamCurve3: string;

declare var kColorSyncConversionParamCurve4: string;

declare var kColorSyncConvertQuality: string;

declare var kColorSyncConvertUseExtendedRange: string;

declare var kColorSyncDCIP3Profile: string;

declare var kColorSyncDisplayP3Profile: string;

declare var kColorSyncDraftQuality: string;

declare var kColorSyncExtendedRange: string;

declare var kColorSyncFixedPointRange: string;

declare var kColorSyncGenericCMYKProfile: string;

declare var kColorSyncGenericGrayGamma22Profile: string;

declare var kColorSyncGenericGrayProfile: string;

declare var kColorSyncGenericLabProfile: string;

declare var kColorSyncGenericRGBProfile: string;

declare var kColorSyncGenericXYZProfile: string;

declare var kColorSyncITUR2020Profile: string;

declare var kColorSyncITUR709Profile: string;

declare var kColorSyncNormalQuality: string;

declare var kColorSyncProfile: string;

declare var kColorSyncProfileCacheSeed: string;

declare var kColorSyncProfileClass: string;

declare var kColorSyncProfileColorSpace: string;

declare var kColorSyncProfileDescription: string;

declare var kColorSyncProfileHeader: string;

declare var kColorSyncProfileIsValid: string;

declare var kColorSyncProfileMD5Digest: string;

declare var kColorSyncProfilePCS: string;

declare var kColorSyncProfileURL: string;

declare var kColorSyncROMMRGBProfile: string;

declare var kColorSyncRenderingIntent: string;

declare var kColorSyncRenderingIntentAbsolute: string;

declare var kColorSyncRenderingIntentPerceptual: string;

declare var kColorSyncRenderingIntentRelative: string;

declare var kColorSyncRenderingIntentSaturation: string;

declare var kColorSyncRenderingIntentUseProfileHeader: string;

declare var kColorSyncSRGBProfile: string;

declare var kColorSyncSigAToB0Tag: string;

declare var kColorSyncSigAToB1Tag: string;

declare var kColorSyncSigAToB2Tag: string;

declare var kColorSyncSigAbstractClass: string;

declare var kColorSyncSigBToA0Tag: string;

declare var kColorSyncSigBToA1Tag: string;

declare var kColorSyncSigBToA2Tag: string;

declare var kColorSyncSigBlueColorantTag: string;

declare var kColorSyncSigBlueTRCTag: string;

declare var kColorSyncSigCmykData: string;

declare var kColorSyncSigColorSpaceClass: string;

declare var kColorSyncSigCopyrightTag: string;

declare var kColorSyncSigDeviceMfgDescTag: string;

declare var kColorSyncSigDeviceModelDescTag: string;

declare var kColorSyncSigDisplayClass: string;

declare var kColorSyncSigGamutTag: string;

declare var kColorSyncSigGrayData: string;

declare var kColorSyncSigGrayTRCTag: string;

declare var kColorSyncSigGreenColorantTag: string;

declare var kColorSyncSigGreenTRCTag: string;

declare var kColorSyncSigInputClass: string;

declare var kColorSyncSigLabData: string;

declare var kColorSyncSigLinkClass: string;

declare var kColorSyncSigMediaBlackPointTag: string;

declare var kColorSyncSigMediaWhitePointTag: string;

declare var kColorSyncSigNamedColor2Tag: string;

declare var kColorSyncSigNamedColorClass: string;

declare var kColorSyncSigOutputClass: string;

declare var kColorSyncSigPreview0Tag: string;

declare var kColorSyncSigPreview1Tag: string;

declare var kColorSyncSigPreview2Tag: string;

declare var kColorSyncSigProfileDescriptionTag: string;

declare var kColorSyncSigProfileSequenceDescTag: string;

declare var kColorSyncSigRedColorantTag: string;

declare var kColorSyncSigRedTRCTag: string;

declare var kColorSyncSigRgbData: string;

declare var kColorSyncSigTechnologyTag: string;

declare var kColorSyncSigViewingCondDescTag: string;

declare var kColorSyncSigViewingConditionsTag: string;

declare var kColorSyncSigXYZData: string;

declare var kColorSyncTransformCodeFragmentMD5: string;

declare var kColorSyncTransformCodeFragmentType: string;

declare var kColorSyncTransformCreator: string;

declare var kColorSyncTransformDeviceToDevice: string;

declare var kColorSyncTransformDeviceToPCS: string;

declare var kColorSyncTransformDstSpace: string;

declare var kColorSyncTransformFullConversionData: string;

declare var kColorSyncTransformGamutCheck: string;

declare var kColorSyncTransformInfo: string;

declare var kColorSyncTransformPCSToDevice: string;

declare var kColorSyncTransformPCSToPCS: string;

declare var kColorSyncTransformParametricConversionData: string;

declare var kColorSyncTransformProfileSequnce: string;

declare var kColorSyncTransformSimplifiedConversionData: string;

declare var kColorSyncTransformSrcSpace: string;

declare var kColorSyncTransformTag: string;

declare var kColorSyncWebSafeColorsProfile: string;
