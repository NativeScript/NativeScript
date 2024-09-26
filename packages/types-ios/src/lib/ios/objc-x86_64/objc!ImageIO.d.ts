
/**
 * @since 13.0
 */
declare function CGAnimateImageAtURLWithBlock(url: NSURL, options: NSDictionary<any, any>, block: (p1: number, p2: any, p3: interop.Pointer | interop.Reference<boolean>) => void): number;

/**
 * @since 13.0
 */
declare function CGAnimateImageDataWithBlock(data: NSData, options: NSDictionary<any, any>, block: (p1: number, p2: any, p3: interop.Pointer | interop.Reference<boolean>) => void): number;

declare const enum CGImageAnimationStatus {

	kCGImageAnimationStatus_ParameterError = -22140,

	kCGImageAnimationStatus_CorruptInputImage = -22141,

	kCGImageAnimationStatus_UnsupportedFormat = -22142,

	kCGImageAnimationStatus_IncompleteInputImage = -22143,

	kCGImageAnimationStatus_AllocationFailure = -22144
}

/**
 * @since 11.0
 */
declare function CGImageDestinationAddAuxiliaryDataInfo(idst: any, auxiliaryImageDataType: string, auxiliaryDataInfoDictionary: NSDictionary<any, any>): void;

/**
 * @since 4.0
 */
declare function CGImageDestinationAddImage(idst: any, image: any, properties: NSDictionary<any, any>): void;

/**
 * @since 7.0
 */
declare function CGImageDestinationAddImageAndMetadata(idst: any, image: any, metadata: any, options: NSDictionary<any, any>): void;

/**
 * @since 4.0
 */
declare function CGImageDestinationAddImageFromSource(idst: any, isrc: any, index: number, properties: NSDictionary<any, any>): void;

/**
 * @since 7.0
 */
declare function CGImageDestinationCopyImageSource(idst: any, isrc: any, options: NSDictionary<any, any>, err: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 4.0
 */
declare function CGImageDestinationCopyTypeIdentifiers(): NSArray<any>;

/**
 * @since 4.0
 */
declare function CGImageDestinationCreateWithData(data: NSData, type: string, count: number, options: NSDictionary<any, any>): any;

/**
 * @since 4.0
 */
declare function CGImageDestinationCreateWithDataConsumer(consumer: any, type: string, count: number, options: NSDictionary<any, any>): any;

/**
 * @since 4.0
 */
declare function CGImageDestinationCreateWithURL(url: NSURL, type: string, count: number, options: NSDictionary<any, any>): any;

/**
 * @since 4.0
 */
declare function CGImageDestinationFinalize(idst: any): boolean;

/**
 * @since 4.0
 */
declare function CGImageDestinationGetTypeID(): number;

/**
 * @since 4.0
 */
declare function CGImageDestinationSetProperties(idst: any, properties: NSDictionary<any, any>): void;

/**
 * @since 7.0
 */
declare function CGImageMetadataCopyStringValueWithPath(metadata: any, parent: any, path: string): string;

/**
 * @since 7.0
 */
declare function CGImageMetadataCopyTagMatchingImageProperty(metadata: any, dictionaryName: string, propertyName: string): any;

/**
 * @since 7.0
 */
declare function CGImageMetadataCopyTagWithPath(metadata: any, parent: any, path: string): any;

/**
 * @since 7.0
 */
declare function CGImageMetadataCopyTags(metadata: any): NSArray<any>;

/**
 * @since 7.0
 */
declare function CGImageMetadataCreateFromXMPData(data: NSData): any;

/**
 * @since 7.0
 */
declare function CGImageMetadataCreateMutable(): any;

/**
 * @since 7.0
 */
declare function CGImageMetadataCreateMutableCopy(metadata: any): any;

/**
 * @since 7.0
 */
declare function CGImageMetadataCreateXMPData(metadata: any, options: NSDictionary<any, any>): NSData;

/**
 * @since 7.0
 */
declare function CGImageMetadataEnumerateTagsUsingBlock(metadata: any, rootPath: string, options: NSDictionary<any, any>, block: (p1: string, p2: any) => boolean): void;

declare const enum CGImageMetadataErrors {

	kCGImageMetadataErrorUnknown = 0,

	kCGImageMetadataErrorUnsupportedFormat = 1,

	kCGImageMetadataErrorBadArgument = 2,

	kCGImageMetadataErrorConflictingArguments = 3,

	kCGImageMetadataErrorPrefixConflict = 4
}

declare function CGImageMetadataGetTypeID(): number;

/**
 * @since 7.0
 */
declare function CGImageMetadataRegisterNamespaceForPrefix(metadata: any, xmlns: string, prefix: string, err: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 7.0
 */
declare function CGImageMetadataRemoveTagWithPath(metadata: any, parent: any, path: string): boolean;

/**
 * @since 7.0
 */
declare function CGImageMetadataSetTagWithPath(metadata: any, parent: any, path: string, tag: any): boolean;

/**
 * @since 7.0
 */
declare function CGImageMetadataSetValueMatchingImageProperty(metadata: any, dictionaryName: string, propertyName: string, value: any): boolean;

/**
 * @since 7.0
 */
declare function CGImageMetadataSetValueWithPath(metadata: any, parent: any, path: string, value: any): boolean;

/**
 * @since 7.0
 */
declare function CGImageMetadataTagCopyName(tag: any): string;

/**
 * @since 7.0
 */
declare function CGImageMetadataTagCopyNamespace(tag: any): string;

/**
 * @since 7.0
 */
declare function CGImageMetadataTagCopyPrefix(tag: any): string;

/**
 * @since 7.0
 */
declare function CGImageMetadataTagCopyQualifiers(tag: any): NSArray<any>;

/**
 * @since 7.0
 */
declare function CGImageMetadataTagCopyValue(tag: any): any;

/**
 * @since 7.0
 */
declare function CGImageMetadataTagCreate(xmlns: string, prefix: string, name: string, type: CGImageMetadataType, value: any): any;

/**
 * @since 7.0
 */
declare function CGImageMetadataTagGetType(tag: any): CGImageMetadataType;

/**
 * @since 7.0
 */
declare function CGImageMetadataTagGetTypeID(): number;

declare const enum CGImageMetadataType {

	kCGImageMetadataTypeInvalid = -1,

	kCGImageMetadataTypeDefault = 0,

	kCGImageMetadataTypeString = 1,

	kCGImageMetadataTypeArrayUnordered = 2,

	kCGImageMetadataTypeArrayOrdered = 3,

	kCGImageMetadataTypeAlternateArray = 4,

	kCGImageMetadataTypeAlternateText = 5,

	kCGImageMetadataTypeStructure = 6
}

declare const enum CGImagePropertyOrientation {

	kCGImagePropertyOrientationUp = 1,

	kCGImagePropertyOrientationUpMirrored = 2,

	kCGImagePropertyOrientationDown = 3,

	kCGImagePropertyOrientationDownMirrored = 4,

	kCGImagePropertyOrientationLeftMirrored = 5,

	kCGImagePropertyOrientationRight = 6,

	kCGImagePropertyOrientationRightMirrored = 7,

	kCGImagePropertyOrientationLeft = 8
}

declare const enum CGImagePropertyTGACompression {

	kCGImageTGACompressionNone = 0,

	kCGImageTGACompressionRLE = 1
}

/**
 * @since 11.0
 */
declare function CGImageSourceCopyAuxiliaryDataInfoAtIndex(isrc: any, index: number, auxiliaryImageDataType: string): NSDictionary<any, any>;

/**
 * @since 7.0
 */
declare function CGImageSourceCopyMetadataAtIndex(isrc: any, index: number, options: NSDictionary<any, any>): any;

/**
 * @since 4.0
 */
declare function CGImageSourceCopyProperties(isrc: any, options: NSDictionary<any, any>): NSDictionary<any, any>;

/**
 * @since 4.0
 */
declare function CGImageSourceCopyPropertiesAtIndex(isrc: any, index: number, options: NSDictionary<any, any>): NSDictionary<any, any>;

/**
 * @since 4.0
 */
declare function CGImageSourceCopyTypeIdentifiers(): NSArray<any>;

/**
 * @since 4.0
 */
declare function CGImageSourceCreateImageAtIndex(isrc: any, index: number, options: NSDictionary<any, any>): any;

/**
 * @since 4.0
 */
declare function CGImageSourceCreateIncremental(options: NSDictionary<any, any>): any;

/**
 * @since 4.0
 */
declare function CGImageSourceCreateThumbnailAtIndex(isrc: any, index: number, options: NSDictionary<any, any>): any;

/**
 * @since 4.0
 */
declare function CGImageSourceCreateWithData(data: NSData, options: NSDictionary<any, any>): any;

/**
 * @since 4.0
 */
declare function CGImageSourceCreateWithDataProvider(provider: any, options: NSDictionary<any, any>): any;

/**
 * @since 4.0
 */
declare function CGImageSourceCreateWithURL(url: NSURL, options: NSDictionary<any, any>): any;

/**
 * @since 4.0
 */
declare function CGImageSourceGetCount(isrc: any): number;

/**
 * @since 12.0
 */
declare function CGImageSourceGetPrimaryImageIndex(isrc: any): number;

/**
 * @since 4.0
 */
declare function CGImageSourceGetStatus(isrc: any): CGImageSourceStatus;

/**
 * @since 4.0
 */
declare function CGImageSourceGetStatusAtIndex(isrc: any, index: number): CGImageSourceStatus;

/**
 * @since 4.0
 */
declare function CGImageSourceGetType(isrc: any): string;

/**
 * @since 4.0
 */
declare function CGImageSourceGetTypeID(): number;

/**
 * @since 7.0
 */
declare function CGImageSourceRemoveCacheAtIndex(isrc: any, index: number): void;

/**
 * @since 17.2
 */
declare function CGImageSourceSetAllowableTypes(allowableTypes: NSArray<any> | any[]): number;

declare const enum CGImageSourceStatus {

	kCGImageStatusUnexpectedEOF = -5,

	kCGImageStatusInvalidData = -4,

	kCGImageStatusUnknownType = -3,

	kCGImageStatusReadingHeader = -2,

	kCGImageStatusIncomplete = -1,

	kCGImageStatusComplete = 0
}

/**
 * @since 4.0
 */
declare function CGImageSourceUpdateData(isrc: any, data: NSData, final: boolean): void;

/**
 * @since 4.0
 */
declare function CGImageSourceUpdateDataProvider(isrc: any, provider: any, final: boolean): void;

declare var kCFErrorDomainCGImageMetadata: string;

/**
 * @since 13.0
 */
declare var kCGImageAnimationDelayTime: string;

/**
 * @since 13.0
 */
declare var kCGImageAnimationLoopCount: string;

/**
 * @since 13.0
 */
declare var kCGImageAnimationStartIndex: string;

/**
 * @since 18.0
 */
declare var kCGImageAuxiliaryDataInfoColorSpace: string;

/**
 * @since 11.0
 */
declare var kCGImageAuxiliaryDataInfoData: string;

/**
 * @since 11.0
 */
declare var kCGImageAuxiliaryDataInfoDataDescription: string;

/**
 * @since 11.0
 */
declare var kCGImageAuxiliaryDataInfoMetadata: string;

/**
 * @since 11.0
 */
declare var kCGImageAuxiliaryDataTypeDepth: string;

/**
 * @since 11.0
 */
declare var kCGImageAuxiliaryDataTypeDisparity: string;

/**
 * @since 14.1
 */
declare var kCGImageAuxiliaryDataTypeHDRGainMap: string;

/**
 * @since 18
 */
declare var kCGImageAuxiliaryDataTypeISOGainMap: string;

/**
 * @since 12.0
 */
declare var kCGImageAuxiliaryDataTypePortraitEffectsMatte: string;

/**
 * @since 14.1
 */
declare var kCGImageAuxiliaryDataTypeSemanticSegmentationGlassesMatte: string;

/**
 * @since 13.0
 */
declare var kCGImageAuxiliaryDataTypeSemanticSegmentationHairMatte: string;

/**
 * @since 13.0
 */
declare var kCGImageAuxiliaryDataTypeSemanticSegmentationSkinMatte: string;

/**
 * @since 14.1
 */
declare var kCGImageAuxiliaryDataTypeSemanticSegmentationSkyMatte: string;

/**
 * @since 13.0
 */
declare var kCGImageAuxiliaryDataTypeSemanticSegmentationTeethMatte: string;

/**
 * @since 4.0
 */
declare var kCGImageDestinationBackgroundColor: string;

/**
 * @since 7.0
 */
declare var kCGImageDestinationDateTime: string;

/**
 * @since 8.0
 */
declare var kCGImageDestinationEmbedThumbnail: string;

/**
 * @since 18.0
 */
declare var kCGImageDestinationEncodeBaseIsSDR: string;

/**
 * @since 18.0
 */
declare var kCGImageDestinationEncodeRequest: string;

/**
 * @since 18.0
 */
declare var kCGImageDestinationEncodeRequestOptions: string;

/**
 * @since 18.0
 */
declare var kCGImageDestinationEncodeToISOGainmap: string;

/**
 * @since 18.0
 */
declare var kCGImageDestinationEncodeToISOHDR: string;

/**
 * @since 18.0
 */
declare var kCGImageDestinationEncodeToSDR: string;

/**
 * @since 18.0
 */
declare var kCGImageDestinationEncodeTonemapMode: string;

/**
 * @since 8.0
 */
declare var kCGImageDestinationImageMaxPixelSize: string;

/**
 * @since 4.0
 */
declare var kCGImageDestinationLossyCompressionQuality: string;

/**
 * @since 7.0
 */
declare var kCGImageDestinationMergeMetadata: string;

/**
 * @since 7.0
 */
declare var kCGImageDestinationMetadata: string;

/**
 * @since 9.3
 */
declare var kCGImageDestinationOptimizeColorForSharing: string;

/**
 * @since 7.0
 */
declare var kCGImageDestinationOrientation: string;

/**
 * @since 14.1
 */
declare var kCGImageDestinationPreserveGainMap: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataEnumerateRecursively: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataNamespaceDublinCore: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataNamespaceExif: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataNamespaceExifAux: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataNamespaceExifEX: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataNamespaceIPTCCore: string;

/**
 * @since 11.3
 */
declare var kCGImageMetadataNamespaceIPTCExtension: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataNamespacePhotoshop: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataNamespaceTIFF: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataNamespaceXMPBasic: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataNamespaceXMPRights: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataPrefixDublinCore: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataPrefixExif: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataPrefixExifAux: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataPrefixExifEX: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataPrefixIPTCCore: string;

/**
 * @since 11.3
 */
declare var kCGImageMetadataPrefixIPTCExtension: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataPrefixPhotoshop: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataPrefixTIFF: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataPrefixXMPBasic: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataPrefixXMPRights: string;

/**
 * @since 8.0
 */
declare var kCGImageMetadataShouldExcludeGPS: string;

/**
 * @since 7.0
 */
declare var kCGImageMetadataShouldExcludeXMP: string;

/**
 * @since 4.0
 */
declare var kCGImageProperty8BIMDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImageProperty8BIMLayerNames: string;

/**
 * @since 8.0
 */
declare var kCGImageProperty8BIMVersion: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyAPNGCanvasPixelHeight: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyAPNGCanvasPixelWidth: string;

/**
 * @since 8.0
 */
declare var kCGImagePropertyAPNGDelayTime: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyAPNGFrameInfoArray: string;

/**
 * @since 8.0
 */
declare var kCGImagePropertyAPNGLoopCount: string;

/**
 * @since 8.0
 */
declare var kCGImagePropertyAPNGUnclampedDelayTime: string;

/**
 * @since 16.0
 */
declare var kCGImagePropertyAVISDictionary: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyAuxiliaryData: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyAuxiliaryDataType: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyBytesPerRow: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFCameraSerialNumber: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFContinuousDrive: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFDescription: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFFirmware: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFFlashExposureComp: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFFocusMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFImageFileName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFImageName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFImageSerialNumber: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFLensMaxMM: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFLensMinMM: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFLensModel: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFMeasuredEV: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFMeteringMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFOwnerName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFRecordID: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFReleaseMethod: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFReleaseTiming: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFSelfTimingTime: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFShootingMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyCIFFWhiteBalanceIndex: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyColorModel: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyColorModelCMYK: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyColorModelGray: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyColorModelLab: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyColorModelRGB: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGActiveArea: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGAnalogBalance: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGAntiAliasStrength: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGAsShotICCProfile: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGAsShotNeutral: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGAsShotPreProfileMatrix: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGAsShotProfileName: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGAsShotWhiteXY: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyDNGBackwardVersion: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGBaselineExposure: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGBaselineExposureOffset: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGBaselineNoise: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGBaselineSharpness: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGBayerGreenSplit: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGBestQualityScale: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGBlackLevel: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGBlackLevelDeltaH: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGBlackLevelDeltaV: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGBlackLevelRepeatDim: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGCFALayout: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGCFAPlaneColor: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGCalibrationIlluminant1: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGCalibrationIlluminant2: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGCameraCalibration1: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGCameraCalibration2: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGCameraCalibrationSignature: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyDNGCameraSerialNumber: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGChromaBlurRadius: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGColorMatrix1: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGColorMatrix2: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGColorimetricReference: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGCurrentICCProfile: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGCurrentPreProfileMatrix: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGDefaultBlackRender: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGDefaultCropOrigin: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGDefaultCropSize: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGDefaultScale: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGDefaultUserCrop: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyDNGDictionary: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGExtraCameraProfiles: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGFixVignetteRadial: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGForwardMatrix1: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGForwardMatrix2: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyDNGLensInfo: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGLinearResponseLimit: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGLinearizationTable: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyDNGLocalizedCameraModel: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGMakerNoteSafety: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGMaskedAreas: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGNewRawImageDigest: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGNoiseProfile: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGNoiseReductionApplied: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGOpcodeList1: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGOpcodeList2: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGOpcodeList3: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGOriginalBestQualityFinalSize: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGOriginalDefaultCropSize: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGOriginalDefaultFinalSize: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGOriginalRawFileData: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGOriginalRawFileDigest: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGOriginalRawFileName: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGPreviewApplicationName: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGPreviewApplicationVersion: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGPreviewColorSpace: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGPreviewDateTime: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGPreviewSettingsDigest: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGPreviewSettingsName: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGPrivateData: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGProfileCalibrationSignature: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileCopyright: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileEmbedPolicy: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileHueSatMapData1: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileHueSatMapData2: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileHueSatMapDims: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileHueSatMapEncoding: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileLookTableData: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileLookTableDims: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileLookTableEncoding: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileName: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGProfileToneCurve: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGRawDataUniqueID: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGRawImageDigest: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGRawToPreviewGain: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGReductionMatrix1: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGReductionMatrix2: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGRowInterleaveFactor: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGShadowScale: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyDNGSubTileBlockSize: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyDNGUniqueCameraModel: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyDNGVersion: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGWarpFisheye: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGWarpRectilinear: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyDNGWhiteLevel: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyDPIHeight: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyDPIWidth: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyDepth: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifApertureValue: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifAuxDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifAuxFirmware: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifAuxFlashCompensation: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifAuxImageNumber: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifAuxLensID: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifAuxLensInfo: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifAuxLensModel: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifAuxLensSerialNumber: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifAuxOwnerName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifAuxSerialNumber: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyExifBodySerialNumber: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifBrightnessValue: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifCFAPattern: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyExifCameraOwnerName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifColorSpace: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifComponentsConfiguration: string;

/**
 * @since 13.1
 */
declare var kCGImagePropertyExifCompositeImage: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifCompressedBitsPerPixel: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifContrast: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifCustomRendered: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifDateTimeDigitized: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifDateTimeOriginal: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifDeviceSettingDescription: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifDigitalZoomRatio: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifExposureBiasValue: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifExposureIndex: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifExposureMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifExposureProgram: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifExposureTime: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifFNumber: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifFileSource: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifFlash: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifFlashEnergy: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifFlashPixVersion: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifFocalLenIn35mmFilm: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifFocalLength: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifFocalPlaneResolutionUnit: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifFocalPlaneXResolution: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifFocalPlaneYResolution: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifGainControl: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifGamma: string;

/**
 * @since 7.0
 */
declare var kCGImagePropertyExifISOSpeed: string;

/**
 * @since 7.0
 */
declare var kCGImagePropertyExifISOSpeedLatitudeyyy: string;

/**
 * @since 7.0
 */
declare var kCGImagePropertyExifISOSpeedLatitudezzz: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifISOSpeedRatings: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifImageUniqueID: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyExifLensMake: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyExifLensModel: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyExifLensSerialNumber: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyExifLensSpecification: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifLightSource: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifMakerNote: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifMaxApertureValue: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifMeteringMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifOECF: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyExifOffsetTime: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyExifOffsetTimeDigitized: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyExifOffsetTimeOriginal: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifPixelXDimension: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifPixelYDimension: string;

/**
 * @since 7.0
 */
declare var kCGImagePropertyExifRecommendedExposureIndex: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifRelatedSoundFile: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSaturation: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSceneCaptureType: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSceneType: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSensingMethod: string;

/**
 * @since 7.0
 */
declare var kCGImagePropertyExifSensitivityType: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSharpness: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifShutterSpeedValue: string;

/**
 * @since 13.1
 */
declare var kCGImagePropertyExifSourceExposureTimesOfCompositeImage: string;

/**
 * @since 13.1
 */
declare var kCGImagePropertyExifSourceImageNumberOfCompositeImage: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSpatialFrequencyResponse: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSpectralSensitivity: string;

/**
 * @since 7.0
 */
declare var kCGImagePropertyExifStandardOutputSensitivity: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSubjectArea: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSubjectDistRange: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSubjectDistance: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSubjectLocation: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSubsecTime: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifSubsecTimeDigitized: string;

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare var kCGImagePropertyExifSubsecTimeOrginal: string;

/**
 * @since 10.0
 */
declare var kCGImagePropertyExifSubsecTimeOriginal: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifUserComment: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifVersion: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyExifWhiteBalance: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyFileContentsDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyFileSize: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyGIFCanvasPixelHeight: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyGIFCanvasPixelWidth: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGIFDelayTime: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGIFDictionary: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyGIFFrameInfoArray: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGIFHasGlobalColorMap: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGIFImageColorMap: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGIFLoopCount: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGIFUnclampedDelayTime: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSAltitude: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSAltitudeRef: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSAreaInformation: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDOP: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDateStamp: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDestBearing: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDestBearingRef: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDestDistance: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDestDistanceRef: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDestLatitude: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDestLatitudeRef: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDestLongitude: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDestLongitudeRef: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSDifferental: string;

/**
 * @since 8.0
 */
declare var kCGImagePropertyGPSHPositioningError: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSImgDirection: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSImgDirectionRef: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSLatitude: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSLatitudeRef: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSLongitude: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSLongitudeRef: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSMapDatum: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSMeasureMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSProcessingMethod: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSSatellites: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSSpeed: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSSpeedRef: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSStatus: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSTimeStamp: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSTrack: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSTrackRef: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyGPSVersion: string;

/**
 * @since 16.0
 */
declare var kCGImagePropertyGroupImageBaseline: string;

/**
 * @since 16.0
 */
declare var kCGImagePropertyGroupImageDisparityAdjustment: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroupImageIndexLeft: string;

/**
 * @since 18.0
 */
declare var kCGImagePropertyGroupImageIndexMonoscopic: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroupImageIndexRight: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroupImageIsAlternateImage: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroupImageIsLeftImage: string;

/**
 * @since 18.0
 */
declare var kCGImagePropertyGroupImageIsMonoscopicImage: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroupImageIsRightImage: string;

/**
 * @since 18.0
 */
declare var kCGImagePropertyGroupImageStereoAggressors: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroupImagesAlternate: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroupIndex: string;

/**
 * @since 18.0
 */
declare var kCGImagePropertyGroupMonoscopicImageLocation: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroupType: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroupTypeAlternate: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroupTypeStereoPair: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyGroups: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyHEICSCanvasPixelHeight: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyHEICSCanvasPixelWidth: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyHEICSDelayTime: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyHEICSDictionary: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyHEICSFrameInfoArray: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyHEICSLoopCount: string;

/**
 * @since 13.0
 */
declare var kCGImagePropertyHEICSUnclampedDelayTime: string;

/**
 * @since 16.0
 */
declare var kCGImagePropertyHEIFDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyHasAlpha: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyHeight: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCActionAdvised: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCByline: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCBylineTitle: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCCaptionAbstract: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCCategory: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCCity: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContact: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContactInfoAddress: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContactInfoCity: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContactInfoCountry: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContactInfoEmails: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContactInfoPhones: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContactInfoPostalCode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContactInfoStateProvince: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContactInfoWebURLs: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContentLocationCode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCContentLocationName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCCopyrightNotice: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCCountryPrimaryLocationCode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCCountryPrimaryLocationName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCCreatorContactInfo: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCCredit: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCDateCreated: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCDigitalCreationDate: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCDigitalCreationTime: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCEditStatus: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCEditorialUpdate: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCExpirationDate: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCExpirationTime: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtAboutCvTerm: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtAboutCvTermCvId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtAboutCvTermId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtAboutCvTermName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtAboutCvTermRefinedAbout: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtAddlModelInfo: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkCircaDateCreated: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkContentDescription: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkContributionDescription: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkCopyrightNotice: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkCopyrightOwnerID: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkCopyrightOwnerName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkCreator: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkCreatorID: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkDateCreated: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkLicensorID: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkLicensorName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkOrObject: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkPhysicalDescription: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkSource: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkSourceInvURL: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkSourceInventoryNo: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkStylePeriod: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtArtworkTitle: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtAudioBitrate: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtAudioBitrateMode: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtAudioChannelCount: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtCircaDateCreated: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtContainerFormat: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtContainerFormatIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtContainerFormatName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtContributor: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtContributorIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtContributorName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtContributorRole: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtControlledVocabularyTerm: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtCopyrightYear: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtCreator: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtCreatorIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtCreatorName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtCreatorRole: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDataOnScreen: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDataOnScreenRegion: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDataOnScreenRegionD: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDataOnScreenRegionH: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDataOnScreenRegionText: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDataOnScreenRegionUnit: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDataOnScreenRegionW: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDataOnScreenRegionX: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDataOnScreenRegionY: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDigitalImageGUID: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDigitalSourceFileType: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDigitalSourceType: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDopesheet: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDopesheetLink: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDopesheetLinkLink: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtDopesheetLinkLinkQualifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtEmbdEncRightsExpr: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtEmbeddedEncodedRightsExpr: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtEmbeddedEncodedRightsExprLangID: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtEmbeddedEncodedRightsExprType: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtEpisode: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtEpisodeIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtEpisodeName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtEpisodeNumber: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtEvent: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtExternalMetadataLink: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtFeedIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtGenre: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtGenreCvId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtGenreCvTermId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtGenreCvTermName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtGenreCvTermRefinedAbout: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtHeadline: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtIPTCLastEdited: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLinkedEncRightsExpr: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLinkedEncodedRightsExpr: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLinkedEncodedRightsExprLangID: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLinkedEncodedRightsExprType: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationCity: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationCountryCode: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationCountryName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationCreated: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationGPSAltitude: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationGPSLatitude: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationGPSLongitude: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationLocationId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationLocationName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationProvinceState: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationShown: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationSublocation: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtLocationWorldRegion: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtMaxAvailHeight: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtMaxAvailWidth: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtModelAge: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtOrganisationInImageCode: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtOrganisationInImageName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonHeard: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonHeardIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonHeardName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonInImage: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonInImageCharacteristic: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonInImageCvTermCvId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonInImageCvTermId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonInImageCvTermName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonInImageCvTermRefinedAbout: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonInImageDescription: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonInImageId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonInImageName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPersonInImageWDetails: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtProductInImage: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtProductInImageDescription: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtProductInImageGTIN: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtProductInImageName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPublicationEvent: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPublicationEventDate: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPublicationEventIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtPublicationEventName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRating: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRatingRegion: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionCity: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionCountryCode: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionCountryName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionGPSAltitude: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionGPSLatitude: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionGPSLongitude: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionLocationId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionLocationName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionProvinceState: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionSublocation: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingRegionWorldRegion: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingScaleMaxValue: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingScaleMinValue: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingSourceLink: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingValue: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRatingValueLogoLink: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRegistryEntryRole: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRegistryID: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRegistryItemID: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtRegistryOrganisationID: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtReleaseReady: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtSeason: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtSeasonIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtSeasonName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtSeasonNumber: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtSeries: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtSeriesIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtSeriesName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtShownEvent: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtShownEventIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtShownEventName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtStorylineIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtStreamReady: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtStylePeriod: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtSupplyChainSource: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtSupplyChainSourceIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtSupplyChainSourceName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtTemporalCoverage: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtTemporalCoverageFrom: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtTemporalCoverageTo: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtTranscript: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtTranscriptLink: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtTranscriptLinkLink: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtTranscriptLinkLinkQualifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtVideoBitrate: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtVideoBitrateMode: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtVideoDisplayAspectRatio: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtVideoEncodingProfile: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtVideoShotType: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtVideoShotTypeIdentifier: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtVideoShotTypeName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtVideoStreamsCount: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtVisualColor: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtWorkflowTag: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtWorkflowTagCvId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtWorkflowTagCvTermId: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtWorkflowTagCvTermName: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyIPTCExtWorkflowTagCvTermRefinedAbout: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCFixtureIdentifier: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCHeadline: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCImageOrientation: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCImageType: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCKeywords: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCLanguageIdentifier: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCObjectAttributeReference: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCObjectCycle: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCObjectName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCObjectTypeReference: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCOriginalTransmissionReference: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCOriginatingProgram: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCProgramVersion: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCProvinceState: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCReferenceDate: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCReferenceNumber: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCReferenceService: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCReleaseDate: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCReleaseTime: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCRightsUsageTerms: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCScene: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCSource: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCSpecialInstructions: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCStarRating: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCSubLocation: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCSubjectReference: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCSupplementalCategory: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCTimeCreated: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCUrgency: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIPTCWriterEditor: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyImageCount: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyImageIndex: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyImages: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIsFloat: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyIsIndexed: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyJFIFDensityUnit: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyJFIFDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyJFIFIsProgressive: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyJFIFVersion: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyJFIFXDensity: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyJFIFYDensity: string;

/**
 * @since 7.0
 */
declare var kCGImagePropertyMakerAppleDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerCanonAspectRatioInfo: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerCanonCameraSerialNumber: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerCanonContinuousDrive: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerCanonDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerCanonFirmware: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerCanonFlashExposureComp: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerCanonImageSerialNumber: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerCanonLensModel: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerCanonOwnerName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerFujiDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerMinoltaDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonCameraSerialNumber: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonColorMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonDigitalZoom: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonFlashExposureComp: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonFlashSetting: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonFocusDistance: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonFocusMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonISOSelection: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonISOSetting: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonImageAdjustment: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonLensAdapter: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonLensInfo: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonLensType: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonQuality: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonSharpenMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonShootingMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonShutterCount: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerNikonWhiteBalanceMode: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerOlympusDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyMakerPentaxDictionary: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyNamedColorSpace: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyOpenEXRAspectRatio: string;

/**
 * @since 11.3
 */
declare var kCGImagePropertyOpenEXRDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyOrientation: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyPNGAuthor: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyPNGChromaticities: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyPNGComment: string;

/**
 * @since 9.0
 */
declare var kCGImagePropertyPNGCompressionFilter: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyPNGCopyright: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyPNGCreationTime: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyPNGDescription: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyPNGDictionary: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyPNGDisclaimer: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyPNGGamma: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyPNGInterlaceType: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyPNGModificationTime: string;

/**
 * @since 15.0
 */
declare var kCGImagePropertyPNGPixelsAspectRatio: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyPNGSoftware: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyPNGSource: string;

/**
 * @since 5.0
 */
declare var kCGImagePropertyPNGTitle: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyPNGTransparency: string;

/**
 * @since 12.0
 */
declare var kCGImagePropertyPNGWarning: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyPNGXPixelsPerMeter: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyPNGYPixelsPerMeter: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyPNGsRGBIntent: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyPixelFormat: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyPixelHeight: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyPixelWidth: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyPrimaryImage: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyProfileName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyRawDictionary: string;

/**
 * @since 14.0
 */
declare var kCGImagePropertyTGACompression: string;

/**
 * @since 14.0
 */
declare var kCGImagePropertyTGADictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFArtist: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFCompression: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFCopyright: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFDateTime: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFDictionary: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFDocumentName: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFHostComputer: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFImageDescription: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFMake: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFModel: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFOrientation: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFPhotometricInterpretation: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFPrimaryChromaticities: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFResolutionUnit: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFSoftware: string;

/**
 * @since 9.0
 */
declare var kCGImagePropertyTIFFTileLength: string;

/**
 * @since 9.0
 */
declare var kCGImagePropertyTIFFTileWidth: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFTransferFunction: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFWhitePoint: string;

/**
 * @since 17.4
 */
declare var kCGImagePropertyTIFFXPosition: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFXResolution: string;

/**
 * @since 17.4
 */
declare var kCGImagePropertyTIFFYPosition: string;

/**
 * @since 4.0
 */
declare var kCGImagePropertyTIFFYResolution: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyThumbnailImages: string;

/**
 * @since 14.0
 */
declare var kCGImagePropertyWebPCanvasPixelHeight: string;

/**
 * @since 14.0
 */
declare var kCGImagePropertyWebPCanvasPixelWidth: string;

/**
 * @since 14.0
 */
declare var kCGImagePropertyWebPDelayTime: string;

/**
 * @since 14.0
 */
declare var kCGImagePropertyWebPDictionary: string;

/**
 * @since 14.0
 */
declare var kCGImagePropertyWebPFrameInfoArray: string;

/**
 * @since 14.0
 */
declare var kCGImagePropertyWebPLoopCount: string;

/**
 * @since 14.0
 */
declare var kCGImagePropertyWebPUnclampedDelayTime: string;

/**
 * @since 11.0
 */
declare var kCGImagePropertyWidth: string;

/**
 * @since 4.0
 */
declare var kCGImageSourceCreateThumbnailFromImageAlways: string;

/**
 * @since 4.0
 */
declare var kCGImageSourceCreateThumbnailFromImageIfAbsent: string;

/**
 * @since 4.0
 */
declare var kCGImageSourceCreateThumbnailWithTransform: string;

/**
 * @since 17.0
 */
declare var kCGImageSourceDecodeRequest: string;

/**
 * @since 17.0
 */
declare var kCGImageSourceDecodeRequestOptions: string;

/**
 * @since 17.0
 */
declare var kCGImageSourceDecodeToHDR: string;

/**
 * @since 17.0
 */
declare var kCGImageSourceDecodeToSDR: string;

/**
 * @since 18.0
 */
declare var kCGImageSourceGenerateImageSpecificLumaScaling: string;

/**
 * @since 4.0
 */
declare var kCGImageSourceShouldAllowFloat: string;

/**
 * @since 4.0
 */
declare var kCGImageSourceShouldCache: string;

/**
 * @since 7.0
 */
declare var kCGImageSourceShouldCacheImmediately: string;

/**
 * @since 9.0
 */
declare var kCGImageSourceSubsampleFactor: string;

/**
 * @since 4.0
 */
declare var kCGImageSourceThumbnailMaxPixelSize: string;

/**
 * @since 4.0
 */
declare var kCGImageSourceTypeIdentifierHint: string;

/**
 * @since 16.0
 */
declare var kIIOCameraExtrinsics_CoordinateSystemID: string;

/**
 * @since 16.0
 */
declare var kIIOCameraExtrinsics_Position: string;

/**
 * @since 16.0
 */
declare var kIIOCameraExtrinsics_Rotation: string;

/**
 * @since 16.0
 */
declare var kIIOCameraModelType_GenericPinhole: string;

/**
 * @since 16.0
 */
declare var kIIOCameraModelType_SimplifiedPinhole: string;

/**
 * @since 16.0
 */
declare var kIIOCameraModel_Intrinsics: string;

/**
 * @since 16.0
 */
declare var kIIOCameraModel_ModelType: string;

/**
 * @since 16.0
 */
declare var kIIOMetadata_CameraExtrinsicsKey: string;

/**
 * @since 16.0
 */
declare var kIIOMetadata_CameraModelKey: string;

/**
 * @since 18.0
 */
declare var kIIOMonoscopicImageLocation_Center: string;

/**
 * @since 18.0
 */
declare var kIIOMonoscopicImageLocation_Left: string;

/**
 * @since 18.0
 */
declare var kIIOMonoscopicImageLocation_Right: string;

/**
 * @since 18.0
 */
declare var kIIOMonoscopicImageLocation_Unspecified: string;

/**
 * @since 18.0
 */
declare var kIIOStereoAggressors_Severity: string;

/**
 * @since 18.0
 */
declare var kIIOStereoAggressors_SubTypeURI: string;

/**
 * @since 18.0
 */
declare var kIIOStereoAggressors_Type: string;
