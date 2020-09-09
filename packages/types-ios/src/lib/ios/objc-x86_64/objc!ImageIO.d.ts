
declare function CGAnimateImageAtURLWithBlock(url: NSURL, options: NSDictionary<any, any>, block: (p1: number, p2: any, p3: interop.Pointer | interop.Reference<boolean>) => void): number;

declare function CGAnimateImageDataWithBlock(data: NSData, options: NSDictionary<any, any>, block: (p1: number, p2: any, p3: interop.Pointer | interop.Reference<boolean>) => void): number;

declare const enum CGImageAnimationStatus {

	kCGImageAnimationStatus_ParameterError = -22140,

	kCGImageAnimationStatus_CorruptInputImage = -22141,

	kCGImageAnimationStatus_UnsupportedFormat = -22142,

	kCGImageAnimationStatus_IncompleteInputImage = -22143,

	kCGImageAnimationStatus_AllocationFailure = -22144
}

declare function CGImageDestinationAddAuxiliaryDataInfo(idst: any, auxiliaryImageDataType: string, auxiliaryDataInfoDictionary: NSDictionary<any, any>): void;

declare function CGImageDestinationAddImage(idst: any, image: any, properties: NSDictionary<any, any>): void;

declare function CGImageDestinationAddImageAndMetadata(idst: any, image: any, metadata: any, options: NSDictionary<any, any>): void;

declare function CGImageDestinationAddImageFromSource(idst: any, isrc: any, index: number, properties: NSDictionary<any, any>): void;

declare function CGImageDestinationCopyImageSource(idst: any, isrc: any, options: NSDictionary<any, any>, err: interop.Pointer | interop.Reference<NSError>): boolean;

declare function CGImageDestinationCopyTypeIdentifiers(): NSArray<any>;

declare function CGImageDestinationCreateWithData(data: NSData, type: string, count: number, options: NSDictionary<any, any>): any;

declare function CGImageDestinationCreateWithDataConsumer(consumer: any, type: string, count: number, options: NSDictionary<any, any>): any;

declare function CGImageDestinationCreateWithURL(url: NSURL, type: string, count: number, options: NSDictionary<any, any>): any;

declare function CGImageDestinationFinalize(idst: any): boolean;

declare function CGImageDestinationGetTypeID(): number;

declare function CGImageDestinationSetProperties(idst: any, properties: NSDictionary<any, any>): void;

declare function CGImageMetadataCopyStringValueWithPath(metadata: any, parent: any, path: string): string;

declare function CGImageMetadataCopyTagMatchingImageProperty(metadata: any, dictionaryName: string, propertyName: string): any;

declare function CGImageMetadataCopyTagWithPath(metadata: any, parent: any, path: string): any;

declare function CGImageMetadataCopyTags(metadata: any): NSArray<any>;

declare function CGImageMetadataCreateFromXMPData(data: NSData): any;

declare function CGImageMetadataCreateMutable(): any;

declare function CGImageMetadataCreateMutableCopy(metadata: any): any;

declare function CGImageMetadataCreateXMPData(metadata: any, options: NSDictionary<any, any>): NSData;

declare function CGImageMetadataEnumerateTagsUsingBlock(metadata: any, rootPath: string, options: NSDictionary<any, any>, block: (p1: string, p2: any) => boolean): void;

declare const enum CGImageMetadataErrors {

	kCGImageMetadataErrorUnknown = 0,

	kCGImageMetadataErrorUnsupportedFormat = 1,

	kCGImageMetadataErrorBadArgument = 2,

	kCGImageMetadataErrorConflictingArguments = 3,

	kCGImageMetadataErrorPrefixConflict = 4
}

declare function CGImageMetadataGetTypeID(): number;

declare function CGImageMetadataRegisterNamespaceForPrefix(metadata: any, xmlns: string, prefix: string, err: interop.Pointer | interop.Reference<NSError>): boolean;

declare function CGImageMetadataRemoveTagWithPath(metadata: any, parent: any, path: string): boolean;

declare function CGImageMetadataSetTagWithPath(metadata: any, parent: any, path: string, tag: any): boolean;

declare function CGImageMetadataSetValueMatchingImageProperty(metadata: any, dictionaryName: string, propertyName: string, value: any): boolean;

declare function CGImageMetadataSetValueWithPath(metadata: any, parent: any, path: string, value: any): boolean;

declare function CGImageMetadataTagCopyName(tag: any): string;

declare function CGImageMetadataTagCopyNamespace(tag: any): string;

declare function CGImageMetadataTagCopyPrefix(tag: any): string;

declare function CGImageMetadataTagCopyQualifiers(tag: any): NSArray<any>;

declare function CGImageMetadataTagCopyValue(tag: any): any;

declare function CGImageMetadataTagCreate(xmlns: string, prefix: string, name: string, type: CGImageMetadataType, value: any): any;

declare function CGImageMetadataTagGetType(tag: any): CGImageMetadataType;

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

declare function CGImageSourceCopyAuxiliaryDataInfoAtIndex(isrc: any, index: number, auxiliaryImageDataType: string): NSDictionary<any, any>;

declare function CGImageSourceCopyMetadataAtIndex(isrc: any, index: number, options: NSDictionary<any, any>): any;

declare function CGImageSourceCopyProperties(isrc: any, options: NSDictionary<any, any>): NSDictionary<any, any>;

declare function CGImageSourceCopyPropertiesAtIndex(isrc: any, index: number, options: NSDictionary<any, any>): NSDictionary<any, any>;

declare function CGImageSourceCopyTypeIdentifiers(): NSArray<any>;

declare function CGImageSourceCreateImageAtIndex(isrc: any, index: number, options: NSDictionary<any, any>): any;

declare function CGImageSourceCreateIncremental(options: NSDictionary<any, any>): any;

declare function CGImageSourceCreateThumbnailAtIndex(isrc: any, index: number, options: NSDictionary<any, any>): any;

declare function CGImageSourceCreateWithData(data: NSData, options: NSDictionary<any, any>): any;

declare function CGImageSourceCreateWithDataProvider(provider: any, options: NSDictionary<any, any>): any;

declare function CGImageSourceCreateWithURL(url: NSURL, options: NSDictionary<any, any>): any;

declare function CGImageSourceGetCount(isrc: any): number;

declare function CGImageSourceGetPrimaryImageIndex(isrc: any): number;

declare function CGImageSourceGetStatus(isrc: any): CGImageSourceStatus;

declare function CGImageSourceGetStatusAtIndex(isrc: any, index: number): CGImageSourceStatus;

declare function CGImageSourceGetType(isrc: any): string;

declare function CGImageSourceGetTypeID(): number;

declare function CGImageSourceRemoveCacheAtIndex(isrc: any, index: number): void;

declare const enum CGImageSourceStatus {

	kCGImageStatusUnexpectedEOF = -5,

	kCGImageStatusInvalidData = -4,

	kCGImageStatusUnknownType = -3,

	kCGImageStatusReadingHeader = -2,

	kCGImageStatusIncomplete = -1,

	kCGImageStatusComplete = 0
}

declare function CGImageSourceUpdateData(isrc: any, data: NSData, final: boolean): void;

declare function CGImageSourceUpdateDataProvider(isrc: any, provider: any, final: boolean): void;

declare var kCFErrorDomainCGImageMetadata: string;

declare var kCGImageAnimationDelayTime: string;

declare var kCGImageAnimationLoopCount: string;

declare var kCGImageAnimationStartIndex: string;

declare var kCGImageAuxiliaryDataInfoData: string;

declare var kCGImageAuxiliaryDataInfoDataDescription: string;

declare var kCGImageAuxiliaryDataInfoMetadata: string;

declare var kCGImageAuxiliaryDataTypeDepth: string;

declare var kCGImageAuxiliaryDataTypeDisparity: string;

declare var kCGImageAuxiliaryDataTypePortraitEffectsMatte: string;

declare var kCGImageAuxiliaryDataTypeSemanticSegmentationHairMatte: string;

declare var kCGImageAuxiliaryDataTypeSemanticSegmentationSkinMatte: string;

declare var kCGImageAuxiliaryDataTypeSemanticSegmentationTeethMatte: string;

declare var kCGImageDestinationBackgroundColor: string;

declare var kCGImageDestinationDateTime: string;

declare var kCGImageDestinationEmbedThumbnail: string;

declare var kCGImageDestinationImageMaxPixelSize: string;

declare var kCGImageDestinationLossyCompressionQuality: string;

declare var kCGImageDestinationMergeMetadata: string;

declare var kCGImageDestinationMetadata: string;

declare var kCGImageDestinationOptimizeColorForSharing: string;

declare var kCGImageDestinationOrientation: string;

declare var kCGImageMetadataEnumerateRecursively: string;

declare var kCGImageMetadataNamespaceDublinCore: string;

declare var kCGImageMetadataNamespaceExif: string;

declare var kCGImageMetadataNamespaceExifAux: string;

declare var kCGImageMetadataNamespaceExifEX: string;

declare var kCGImageMetadataNamespaceIPTCCore: string;

declare var kCGImageMetadataNamespaceIPTCExtension: string;

declare var kCGImageMetadataNamespacePhotoshop: string;

declare var kCGImageMetadataNamespaceTIFF: string;

declare var kCGImageMetadataNamespaceXMPBasic: string;

declare var kCGImageMetadataNamespaceXMPRights: string;

declare var kCGImageMetadataPrefixDublinCore: string;

declare var kCGImageMetadataPrefixExif: string;

declare var kCGImageMetadataPrefixExifAux: string;

declare var kCGImageMetadataPrefixExifEX: string;

declare var kCGImageMetadataPrefixIPTCCore: string;

declare var kCGImageMetadataPrefixIPTCExtension: string;

declare var kCGImageMetadataPrefixPhotoshop: string;

declare var kCGImageMetadataPrefixTIFF: string;

declare var kCGImageMetadataPrefixXMPBasic: string;

declare var kCGImageMetadataPrefixXMPRights: string;

declare var kCGImageMetadataShouldExcludeGPS: string;

declare var kCGImageMetadataShouldExcludeXMP: string;

declare var kCGImageProperty8BIMDictionary: string;

declare var kCGImageProperty8BIMLayerNames: string;

declare var kCGImageProperty8BIMVersion: string;

declare var kCGImagePropertyAPNGCanvasPixelHeight: string;

declare var kCGImagePropertyAPNGCanvasPixelWidth: string;

declare var kCGImagePropertyAPNGDelayTime: string;

declare var kCGImagePropertyAPNGFrameInfoArray: string;

declare var kCGImagePropertyAPNGLoopCount: string;

declare var kCGImagePropertyAPNGUnclampedDelayTime: string;

declare var kCGImagePropertyAuxiliaryData: string;

declare var kCGImagePropertyAuxiliaryDataType: string;

declare var kCGImagePropertyBytesPerRow: string;

declare var kCGImagePropertyCIFFCameraSerialNumber: string;

declare var kCGImagePropertyCIFFContinuousDrive: string;

declare var kCGImagePropertyCIFFDescription: string;

declare var kCGImagePropertyCIFFDictionary: string;

declare var kCGImagePropertyCIFFFirmware: string;

declare var kCGImagePropertyCIFFFlashExposureComp: string;

declare var kCGImagePropertyCIFFFocusMode: string;

declare var kCGImagePropertyCIFFImageFileName: string;

declare var kCGImagePropertyCIFFImageName: string;

declare var kCGImagePropertyCIFFImageSerialNumber: string;

declare var kCGImagePropertyCIFFLensMaxMM: string;

declare var kCGImagePropertyCIFFLensMinMM: string;

declare var kCGImagePropertyCIFFLensModel: string;

declare var kCGImagePropertyCIFFMeasuredEV: string;

declare var kCGImagePropertyCIFFMeteringMode: string;

declare var kCGImagePropertyCIFFOwnerName: string;

declare var kCGImagePropertyCIFFRecordID: string;

declare var kCGImagePropertyCIFFReleaseMethod: string;

declare var kCGImagePropertyCIFFReleaseTiming: string;

declare var kCGImagePropertyCIFFSelfTimingTime: string;

declare var kCGImagePropertyCIFFShootingMode: string;

declare var kCGImagePropertyCIFFWhiteBalanceIndex: string;

declare var kCGImagePropertyColorModel: string;

declare var kCGImagePropertyColorModelCMYK: string;

declare var kCGImagePropertyColorModelGray: string;

declare var kCGImagePropertyColorModelLab: string;

declare var kCGImagePropertyColorModelRGB: string;

declare var kCGImagePropertyDNGActiveArea: string;

declare var kCGImagePropertyDNGAnalogBalance: string;

declare var kCGImagePropertyDNGAntiAliasStrength: string;

declare var kCGImagePropertyDNGAsShotICCProfile: string;

declare var kCGImagePropertyDNGAsShotNeutral: string;

declare var kCGImagePropertyDNGAsShotPreProfileMatrix: string;

declare var kCGImagePropertyDNGAsShotProfileName: string;

declare var kCGImagePropertyDNGAsShotWhiteXY: string;

declare var kCGImagePropertyDNGBackwardVersion: string;

declare var kCGImagePropertyDNGBaselineExposure: string;

declare var kCGImagePropertyDNGBaselineExposureOffset: string;

declare var kCGImagePropertyDNGBaselineNoise: string;

declare var kCGImagePropertyDNGBaselineSharpness: string;

declare var kCGImagePropertyDNGBayerGreenSplit: string;

declare var kCGImagePropertyDNGBestQualityScale: string;

declare var kCGImagePropertyDNGBlackLevel: string;

declare var kCGImagePropertyDNGBlackLevelDeltaH: string;

declare var kCGImagePropertyDNGBlackLevelDeltaV: string;

declare var kCGImagePropertyDNGBlackLevelRepeatDim: string;

declare var kCGImagePropertyDNGCFALayout: string;

declare var kCGImagePropertyDNGCFAPlaneColor: string;

declare var kCGImagePropertyDNGCalibrationIlluminant1: string;

declare var kCGImagePropertyDNGCalibrationIlluminant2: string;

declare var kCGImagePropertyDNGCameraCalibration1: string;

declare var kCGImagePropertyDNGCameraCalibration2: string;

declare var kCGImagePropertyDNGCameraCalibrationSignature: string;

declare var kCGImagePropertyDNGCameraSerialNumber: string;

declare var kCGImagePropertyDNGChromaBlurRadius: string;

declare var kCGImagePropertyDNGColorMatrix1: string;

declare var kCGImagePropertyDNGColorMatrix2: string;

declare var kCGImagePropertyDNGColorimetricReference: string;

declare var kCGImagePropertyDNGCurrentICCProfile: string;

declare var kCGImagePropertyDNGCurrentPreProfileMatrix: string;

declare var kCGImagePropertyDNGDefaultBlackRender: string;

declare var kCGImagePropertyDNGDefaultCropOrigin: string;

declare var kCGImagePropertyDNGDefaultCropSize: string;

declare var kCGImagePropertyDNGDefaultScale: string;

declare var kCGImagePropertyDNGDefaultUserCrop: string;

declare var kCGImagePropertyDNGDictionary: string;

declare var kCGImagePropertyDNGExtraCameraProfiles: string;

declare var kCGImagePropertyDNGFixVignetteRadial: string;

declare var kCGImagePropertyDNGForwardMatrix1: string;

declare var kCGImagePropertyDNGForwardMatrix2: string;

declare var kCGImagePropertyDNGLensInfo: string;

declare var kCGImagePropertyDNGLinearResponseLimit: string;

declare var kCGImagePropertyDNGLinearizationTable: string;

declare var kCGImagePropertyDNGLocalizedCameraModel: string;

declare var kCGImagePropertyDNGMakerNoteSafety: string;

declare var kCGImagePropertyDNGMaskedAreas: string;

declare var kCGImagePropertyDNGNewRawImageDigest: string;

declare var kCGImagePropertyDNGNoiseProfile: string;

declare var kCGImagePropertyDNGNoiseReductionApplied: string;

declare var kCGImagePropertyDNGOpcodeList1: string;

declare var kCGImagePropertyDNGOpcodeList2: string;

declare var kCGImagePropertyDNGOpcodeList3: string;

declare var kCGImagePropertyDNGOriginalBestQualityFinalSize: string;

declare var kCGImagePropertyDNGOriginalDefaultCropSize: string;

declare var kCGImagePropertyDNGOriginalDefaultFinalSize: string;

declare var kCGImagePropertyDNGOriginalRawFileData: string;

declare var kCGImagePropertyDNGOriginalRawFileDigest: string;

declare var kCGImagePropertyDNGOriginalRawFileName: string;

declare var kCGImagePropertyDNGPreviewApplicationName: string;

declare var kCGImagePropertyDNGPreviewApplicationVersion: string;

declare var kCGImagePropertyDNGPreviewColorSpace: string;

declare var kCGImagePropertyDNGPreviewDateTime: string;

declare var kCGImagePropertyDNGPreviewSettingsDigest: string;

declare var kCGImagePropertyDNGPreviewSettingsName: string;

declare var kCGImagePropertyDNGPrivateData: string;

declare var kCGImagePropertyDNGProfileCalibrationSignature: string;

declare var kCGImagePropertyDNGProfileCopyright: string;

declare var kCGImagePropertyDNGProfileEmbedPolicy: string;

declare var kCGImagePropertyDNGProfileHueSatMapData1: string;

declare var kCGImagePropertyDNGProfileHueSatMapData2: string;

declare var kCGImagePropertyDNGProfileHueSatMapDims: string;

declare var kCGImagePropertyDNGProfileHueSatMapEncoding: string;

declare var kCGImagePropertyDNGProfileLookTableData: string;

declare var kCGImagePropertyDNGProfileLookTableDims: string;

declare var kCGImagePropertyDNGProfileLookTableEncoding: string;

declare var kCGImagePropertyDNGProfileName: string;

declare var kCGImagePropertyDNGProfileToneCurve: string;

declare var kCGImagePropertyDNGRawDataUniqueID: string;

declare var kCGImagePropertyDNGRawImageDigest: string;

declare var kCGImagePropertyDNGRawToPreviewGain: string;

declare var kCGImagePropertyDNGReductionMatrix1: string;

declare var kCGImagePropertyDNGReductionMatrix2: string;

declare var kCGImagePropertyDNGRowInterleaveFactor: string;

declare var kCGImagePropertyDNGShadowScale: string;

declare var kCGImagePropertyDNGSubTileBlockSize: string;

declare var kCGImagePropertyDNGUniqueCameraModel: string;

declare var kCGImagePropertyDNGVersion: string;

declare var kCGImagePropertyDNGWarpFisheye: string;

declare var kCGImagePropertyDNGWarpRectilinear: string;

declare var kCGImagePropertyDNGWhiteLevel: string;

declare var kCGImagePropertyDPIHeight: string;

declare var kCGImagePropertyDPIWidth: string;

declare var kCGImagePropertyDepth: string;

declare var kCGImagePropertyExifApertureValue: string;

declare var kCGImagePropertyExifAuxDictionary: string;

declare var kCGImagePropertyExifAuxFirmware: string;

declare var kCGImagePropertyExifAuxFlashCompensation: string;

declare var kCGImagePropertyExifAuxImageNumber: string;

declare var kCGImagePropertyExifAuxLensID: string;

declare var kCGImagePropertyExifAuxLensInfo: string;

declare var kCGImagePropertyExifAuxLensModel: string;

declare var kCGImagePropertyExifAuxLensSerialNumber: string;

declare var kCGImagePropertyExifAuxOwnerName: string;

declare var kCGImagePropertyExifAuxSerialNumber: string;

declare var kCGImagePropertyExifBodySerialNumber: string;

declare var kCGImagePropertyExifBrightnessValue: string;

declare var kCGImagePropertyExifCFAPattern: string;

declare var kCGImagePropertyExifCameraOwnerName: string;

declare var kCGImagePropertyExifColorSpace: string;

declare var kCGImagePropertyExifComponentsConfiguration: string;

declare var kCGImagePropertyExifCompositeImage: string;

declare var kCGImagePropertyExifCompressedBitsPerPixel: string;

declare var kCGImagePropertyExifContrast: string;

declare var kCGImagePropertyExifCustomRendered: string;

declare var kCGImagePropertyExifDateTimeDigitized: string;

declare var kCGImagePropertyExifDateTimeOriginal: string;

declare var kCGImagePropertyExifDeviceSettingDescription: string;

declare var kCGImagePropertyExifDictionary: string;

declare var kCGImagePropertyExifDigitalZoomRatio: string;

declare var kCGImagePropertyExifExposureBiasValue: string;

declare var kCGImagePropertyExifExposureIndex: string;

declare var kCGImagePropertyExifExposureMode: string;

declare var kCGImagePropertyExifExposureProgram: string;

declare var kCGImagePropertyExifExposureTime: string;

declare var kCGImagePropertyExifFNumber: string;

declare var kCGImagePropertyExifFileSource: string;

declare var kCGImagePropertyExifFlash: string;

declare var kCGImagePropertyExifFlashEnergy: string;

declare var kCGImagePropertyExifFlashPixVersion: string;

declare var kCGImagePropertyExifFocalLenIn35mmFilm: string;

declare var kCGImagePropertyExifFocalLength: string;

declare var kCGImagePropertyExifFocalPlaneResolutionUnit: string;

declare var kCGImagePropertyExifFocalPlaneXResolution: string;

declare var kCGImagePropertyExifFocalPlaneYResolution: string;

declare var kCGImagePropertyExifGainControl: string;

declare var kCGImagePropertyExifGamma: string;

declare var kCGImagePropertyExifISOSpeed: string;

declare var kCGImagePropertyExifISOSpeedLatitudeyyy: string;

declare var kCGImagePropertyExifISOSpeedLatitudezzz: string;

declare var kCGImagePropertyExifISOSpeedRatings: string;

declare var kCGImagePropertyExifImageUniqueID: string;

declare var kCGImagePropertyExifLensMake: string;

declare var kCGImagePropertyExifLensModel: string;

declare var kCGImagePropertyExifLensSerialNumber: string;

declare var kCGImagePropertyExifLensSpecification: string;

declare var kCGImagePropertyExifLightSource: string;

declare var kCGImagePropertyExifMakerNote: string;

declare var kCGImagePropertyExifMaxApertureValue: string;

declare var kCGImagePropertyExifMeteringMode: string;

declare var kCGImagePropertyExifOECF: string;

declare var kCGImagePropertyExifOffsetTime: string;

declare var kCGImagePropertyExifOffsetTimeDigitized: string;

declare var kCGImagePropertyExifOffsetTimeOriginal: string;

declare var kCGImagePropertyExifPixelXDimension: string;

declare var kCGImagePropertyExifPixelYDimension: string;

declare var kCGImagePropertyExifRecommendedExposureIndex: string;

declare var kCGImagePropertyExifRelatedSoundFile: string;

declare var kCGImagePropertyExifSaturation: string;

declare var kCGImagePropertyExifSceneCaptureType: string;

declare var kCGImagePropertyExifSceneType: string;

declare var kCGImagePropertyExifSensingMethod: string;

declare var kCGImagePropertyExifSensitivityType: string;

declare var kCGImagePropertyExifSharpness: string;

declare var kCGImagePropertyExifShutterSpeedValue: string;

declare var kCGImagePropertyExifSourceExposureTimesOfCompositeImage: string;

declare var kCGImagePropertyExifSourceImageNumberOfCompositeImage: string;

declare var kCGImagePropertyExifSpatialFrequencyResponse: string;

declare var kCGImagePropertyExifSpectralSensitivity: string;

declare var kCGImagePropertyExifStandardOutputSensitivity: string;

declare var kCGImagePropertyExifSubjectArea: string;

declare var kCGImagePropertyExifSubjectDistRange: string;

declare var kCGImagePropertyExifSubjectDistance: string;

declare var kCGImagePropertyExifSubjectLocation: string;

declare var kCGImagePropertyExifSubsecTime: string;

declare var kCGImagePropertyExifSubsecTimeDigitized: string;

declare var kCGImagePropertyExifSubsecTimeOrginal: string;

declare var kCGImagePropertyExifSubsecTimeOriginal: string;

declare var kCGImagePropertyExifUserComment: string;

declare var kCGImagePropertyExifVersion: string;

declare var kCGImagePropertyExifWhiteBalance: string;

declare var kCGImagePropertyFileContentsDictionary: string;

declare var kCGImagePropertyFileSize: string;

declare var kCGImagePropertyGIFCanvasPixelHeight: string;

declare var kCGImagePropertyGIFCanvasPixelWidth: string;

declare var kCGImagePropertyGIFDelayTime: string;

declare var kCGImagePropertyGIFDictionary: string;

declare var kCGImagePropertyGIFFrameInfoArray: string;

declare var kCGImagePropertyGIFHasGlobalColorMap: string;

declare var kCGImagePropertyGIFImageColorMap: string;

declare var kCGImagePropertyGIFLoopCount: string;

declare var kCGImagePropertyGIFUnclampedDelayTime: string;

declare var kCGImagePropertyGPSAltitude: string;

declare var kCGImagePropertyGPSAltitudeRef: string;

declare var kCGImagePropertyGPSAreaInformation: string;

declare var kCGImagePropertyGPSDOP: string;

declare var kCGImagePropertyGPSDateStamp: string;

declare var kCGImagePropertyGPSDestBearing: string;

declare var kCGImagePropertyGPSDestBearingRef: string;

declare var kCGImagePropertyGPSDestDistance: string;

declare var kCGImagePropertyGPSDestDistanceRef: string;

declare var kCGImagePropertyGPSDestLatitude: string;

declare var kCGImagePropertyGPSDestLatitudeRef: string;

declare var kCGImagePropertyGPSDestLongitude: string;

declare var kCGImagePropertyGPSDestLongitudeRef: string;

declare var kCGImagePropertyGPSDictionary: string;

declare var kCGImagePropertyGPSDifferental: string;

declare var kCGImagePropertyGPSHPositioningError: string;

declare var kCGImagePropertyGPSImgDirection: string;

declare var kCGImagePropertyGPSImgDirectionRef: string;

declare var kCGImagePropertyGPSLatitude: string;

declare var kCGImagePropertyGPSLatitudeRef: string;

declare var kCGImagePropertyGPSLongitude: string;

declare var kCGImagePropertyGPSLongitudeRef: string;

declare var kCGImagePropertyGPSMapDatum: string;

declare var kCGImagePropertyGPSMeasureMode: string;

declare var kCGImagePropertyGPSProcessingMethod: string;

declare var kCGImagePropertyGPSSatellites: string;

declare var kCGImagePropertyGPSSpeed: string;

declare var kCGImagePropertyGPSSpeedRef: string;

declare var kCGImagePropertyGPSStatus: string;

declare var kCGImagePropertyGPSTimeStamp: string;

declare var kCGImagePropertyGPSTrack: string;

declare var kCGImagePropertyGPSTrackRef: string;

declare var kCGImagePropertyGPSVersion: string;

declare var kCGImagePropertyHEICSCanvasPixelHeight: string;

declare var kCGImagePropertyHEICSCanvasPixelWidth: string;

declare var kCGImagePropertyHEICSDelayTime: string;

declare var kCGImagePropertyHEICSDictionary: string;

declare var kCGImagePropertyHEICSFrameInfoArray: string;

declare var kCGImagePropertyHEICSLoopCount: string;

declare var kCGImagePropertyHEICSUnclampedDelayTime: string;

declare var kCGImagePropertyHasAlpha: string;

declare var kCGImagePropertyHeight: string;

declare var kCGImagePropertyIPTCActionAdvised: string;

declare var kCGImagePropertyIPTCByline: string;

declare var kCGImagePropertyIPTCBylineTitle: string;

declare var kCGImagePropertyIPTCCaptionAbstract: string;

declare var kCGImagePropertyIPTCCategory: string;

declare var kCGImagePropertyIPTCCity: string;

declare var kCGImagePropertyIPTCContact: string;

declare var kCGImagePropertyIPTCContactInfoAddress: string;

declare var kCGImagePropertyIPTCContactInfoCity: string;

declare var kCGImagePropertyIPTCContactInfoCountry: string;

declare var kCGImagePropertyIPTCContactInfoEmails: string;

declare var kCGImagePropertyIPTCContactInfoPhones: string;

declare var kCGImagePropertyIPTCContactInfoPostalCode: string;

declare var kCGImagePropertyIPTCContactInfoStateProvince: string;

declare var kCGImagePropertyIPTCContactInfoWebURLs: string;

declare var kCGImagePropertyIPTCContentLocationCode: string;

declare var kCGImagePropertyIPTCContentLocationName: string;

declare var kCGImagePropertyIPTCCopyrightNotice: string;

declare var kCGImagePropertyIPTCCountryPrimaryLocationCode: string;

declare var kCGImagePropertyIPTCCountryPrimaryLocationName: string;

declare var kCGImagePropertyIPTCCreatorContactInfo: string;

declare var kCGImagePropertyIPTCCredit: string;

declare var kCGImagePropertyIPTCDateCreated: string;

declare var kCGImagePropertyIPTCDictionary: string;

declare var kCGImagePropertyIPTCDigitalCreationDate: string;

declare var kCGImagePropertyIPTCDigitalCreationTime: string;

declare var kCGImagePropertyIPTCEditStatus: string;

declare var kCGImagePropertyIPTCEditorialUpdate: string;

declare var kCGImagePropertyIPTCExpirationDate: string;

declare var kCGImagePropertyIPTCExpirationTime: string;

declare var kCGImagePropertyIPTCExtAboutCvTerm: string;

declare var kCGImagePropertyIPTCExtAboutCvTermCvId: string;

declare var kCGImagePropertyIPTCExtAboutCvTermId: string;

declare var kCGImagePropertyIPTCExtAboutCvTermName: string;

declare var kCGImagePropertyIPTCExtAboutCvTermRefinedAbout: string;

declare var kCGImagePropertyIPTCExtAddlModelInfo: string;

declare var kCGImagePropertyIPTCExtArtworkCircaDateCreated: string;

declare var kCGImagePropertyIPTCExtArtworkContentDescription: string;

declare var kCGImagePropertyIPTCExtArtworkContributionDescription: string;

declare var kCGImagePropertyIPTCExtArtworkCopyrightNotice: string;

declare var kCGImagePropertyIPTCExtArtworkCopyrightOwnerID: string;

declare var kCGImagePropertyIPTCExtArtworkCopyrightOwnerName: string;

declare var kCGImagePropertyIPTCExtArtworkCreator: string;

declare var kCGImagePropertyIPTCExtArtworkCreatorID: string;

declare var kCGImagePropertyIPTCExtArtworkDateCreated: string;

declare var kCGImagePropertyIPTCExtArtworkLicensorID: string;

declare var kCGImagePropertyIPTCExtArtworkLicensorName: string;

declare var kCGImagePropertyIPTCExtArtworkOrObject: string;

declare var kCGImagePropertyIPTCExtArtworkPhysicalDescription: string;

declare var kCGImagePropertyIPTCExtArtworkSource: string;

declare var kCGImagePropertyIPTCExtArtworkSourceInvURL: string;

declare var kCGImagePropertyIPTCExtArtworkSourceInventoryNo: string;

declare var kCGImagePropertyIPTCExtArtworkStylePeriod: string;

declare var kCGImagePropertyIPTCExtArtworkTitle: string;

declare var kCGImagePropertyIPTCExtAudioBitrate: string;

declare var kCGImagePropertyIPTCExtAudioBitrateMode: string;

declare var kCGImagePropertyIPTCExtAudioChannelCount: string;

declare var kCGImagePropertyIPTCExtCircaDateCreated: string;

declare var kCGImagePropertyIPTCExtContainerFormat: string;

declare var kCGImagePropertyIPTCExtContainerFormatIdentifier: string;

declare var kCGImagePropertyIPTCExtContainerFormatName: string;

declare var kCGImagePropertyIPTCExtContributor: string;

declare var kCGImagePropertyIPTCExtContributorIdentifier: string;

declare var kCGImagePropertyIPTCExtContributorName: string;

declare var kCGImagePropertyIPTCExtContributorRole: string;

declare var kCGImagePropertyIPTCExtControlledVocabularyTerm: string;

declare var kCGImagePropertyIPTCExtCopyrightYear: string;

declare var kCGImagePropertyIPTCExtCreator: string;

declare var kCGImagePropertyIPTCExtCreatorIdentifier: string;

declare var kCGImagePropertyIPTCExtCreatorName: string;

declare var kCGImagePropertyIPTCExtCreatorRole: string;

declare var kCGImagePropertyIPTCExtDataOnScreen: string;

declare var kCGImagePropertyIPTCExtDataOnScreenRegion: string;

declare var kCGImagePropertyIPTCExtDataOnScreenRegionD: string;

declare var kCGImagePropertyIPTCExtDataOnScreenRegionH: string;

declare var kCGImagePropertyIPTCExtDataOnScreenRegionText: string;

declare var kCGImagePropertyIPTCExtDataOnScreenRegionUnit: string;

declare var kCGImagePropertyIPTCExtDataOnScreenRegionW: string;

declare var kCGImagePropertyIPTCExtDataOnScreenRegionX: string;

declare var kCGImagePropertyIPTCExtDataOnScreenRegionY: string;

declare var kCGImagePropertyIPTCExtDigitalImageGUID: string;

declare var kCGImagePropertyIPTCExtDigitalSourceFileType: string;

declare var kCGImagePropertyIPTCExtDigitalSourceType: string;

declare var kCGImagePropertyIPTCExtDopesheet: string;

declare var kCGImagePropertyIPTCExtDopesheetLink: string;

declare var kCGImagePropertyIPTCExtDopesheetLinkLink: string;

declare var kCGImagePropertyIPTCExtDopesheetLinkLinkQualifier: string;

declare var kCGImagePropertyIPTCExtEmbdEncRightsExpr: string;

declare var kCGImagePropertyIPTCExtEmbeddedEncodedRightsExpr: string;

declare var kCGImagePropertyIPTCExtEmbeddedEncodedRightsExprLangID: string;

declare var kCGImagePropertyIPTCExtEmbeddedEncodedRightsExprType: string;

declare var kCGImagePropertyIPTCExtEpisode: string;

declare var kCGImagePropertyIPTCExtEpisodeIdentifier: string;

declare var kCGImagePropertyIPTCExtEpisodeName: string;

declare var kCGImagePropertyIPTCExtEpisodeNumber: string;

declare var kCGImagePropertyIPTCExtEvent: string;

declare var kCGImagePropertyIPTCExtExternalMetadataLink: string;

declare var kCGImagePropertyIPTCExtFeedIdentifier: string;

declare var kCGImagePropertyIPTCExtGenre: string;

declare var kCGImagePropertyIPTCExtGenreCvId: string;

declare var kCGImagePropertyIPTCExtGenreCvTermId: string;

declare var kCGImagePropertyIPTCExtGenreCvTermName: string;

declare var kCGImagePropertyIPTCExtGenreCvTermRefinedAbout: string;

declare var kCGImagePropertyIPTCExtHeadline: string;

declare var kCGImagePropertyIPTCExtIPTCLastEdited: string;

declare var kCGImagePropertyIPTCExtLinkedEncRightsExpr: string;

declare var kCGImagePropertyIPTCExtLinkedEncodedRightsExpr: string;

declare var kCGImagePropertyIPTCExtLinkedEncodedRightsExprLangID: string;

declare var kCGImagePropertyIPTCExtLinkedEncodedRightsExprType: string;

declare var kCGImagePropertyIPTCExtLocationCity: string;

declare var kCGImagePropertyIPTCExtLocationCountryCode: string;

declare var kCGImagePropertyIPTCExtLocationCountryName: string;

declare var kCGImagePropertyIPTCExtLocationCreated: string;

declare var kCGImagePropertyIPTCExtLocationGPSAltitude: string;

declare var kCGImagePropertyIPTCExtLocationGPSLatitude: string;

declare var kCGImagePropertyIPTCExtLocationGPSLongitude: string;

declare var kCGImagePropertyIPTCExtLocationIdentifier: string;

declare var kCGImagePropertyIPTCExtLocationLocationId: string;

declare var kCGImagePropertyIPTCExtLocationLocationName: string;

declare var kCGImagePropertyIPTCExtLocationProvinceState: string;

declare var kCGImagePropertyIPTCExtLocationShown: string;

declare var kCGImagePropertyIPTCExtLocationSublocation: string;

declare var kCGImagePropertyIPTCExtLocationWorldRegion: string;

declare var kCGImagePropertyIPTCExtMaxAvailHeight: string;

declare var kCGImagePropertyIPTCExtMaxAvailWidth: string;

declare var kCGImagePropertyIPTCExtModelAge: string;

declare var kCGImagePropertyIPTCExtOrganisationInImageCode: string;

declare var kCGImagePropertyIPTCExtOrganisationInImageName: string;

declare var kCGImagePropertyIPTCExtPersonHeard: string;

declare var kCGImagePropertyIPTCExtPersonHeardIdentifier: string;

declare var kCGImagePropertyIPTCExtPersonHeardName: string;

declare var kCGImagePropertyIPTCExtPersonInImage: string;

declare var kCGImagePropertyIPTCExtPersonInImageCharacteristic: string;

declare var kCGImagePropertyIPTCExtPersonInImageCvTermCvId: string;

declare var kCGImagePropertyIPTCExtPersonInImageCvTermId: string;

declare var kCGImagePropertyIPTCExtPersonInImageCvTermName: string;

declare var kCGImagePropertyIPTCExtPersonInImageCvTermRefinedAbout: string;

declare var kCGImagePropertyIPTCExtPersonInImageDescription: string;

declare var kCGImagePropertyIPTCExtPersonInImageId: string;

declare var kCGImagePropertyIPTCExtPersonInImageName: string;

declare var kCGImagePropertyIPTCExtPersonInImageWDetails: string;

declare var kCGImagePropertyIPTCExtProductInImage: string;

declare var kCGImagePropertyIPTCExtProductInImageDescription: string;

declare var kCGImagePropertyIPTCExtProductInImageGTIN: string;

declare var kCGImagePropertyIPTCExtProductInImageName: string;

declare var kCGImagePropertyIPTCExtPublicationEvent: string;

declare var kCGImagePropertyIPTCExtPublicationEventDate: string;

declare var kCGImagePropertyIPTCExtPublicationEventIdentifier: string;

declare var kCGImagePropertyIPTCExtPublicationEventName: string;

declare var kCGImagePropertyIPTCExtRating: string;

declare var kCGImagePropertyIPTCExtRatingRatingRegion: string;

declare var kCGImagePropertyIPTCExtRatingRegionCity: string;

declare var kCGImagePropertyIPTCExtRatingRegionCountryCode: string;

declare var kCGImagePropertyIPTCExtRatingRegionCountryName: string;

declare var kCGImagePropertyIPTCExtRatingRegionGPSAltitude: string;

declare var kCGImagePropertyIPTCExtRatingRegionGPSLatitude: string;

declare var kCGImagePropertyIPTCExtRatingRegionGPSLongitude: string;

declare var kCGImagePropertyIPTCExtRatingRegionIdentifier: string;

declare var kCGImagePropertyIPTCExtRatingRegionLocationId: string;

declare var kCGImagePropertyIPTCExtRatingRegionLocationName: string;

declare var kCGImagePropertyIPTCExtRatingRegionProvinceState: string;

declare var kCGImagePropertyIPTCExtRatingRegionSublocation: string;

declare var kCGImagePropertyIPTCExtRatingRegionWorldRegion: string;

declare var kCGImagePropertyIPTCExtRatingScaleMaxValue: string;

declare var kCGImagePropertyIPTCExtRatingScaleMinValue: string;

declare var kCGImagePropertyIPTCExtRatingSourceLink: string;

declare var kCGImagePropertyIPTCExtRatingValue: string;

declare var kCGImagePropertyIPTCExtRatingValueLogoLink: string;

declare var kCGImagePropertyIPTCExtRegistryEntryRole: string;

declare var kCGImagePropertyIPTCExtRegistryID: string;

declare var kCGImagePropertyIPTCExtRegistryItemID: string;

declare var kCGImagePropertyIPTCExtRegistryOrganisationID: string;

declare var kCGImagePropertyIPTCExtReleaseReady: string;

declare var kCGImagePropertyIPTCExtSeason: string;

declare var kCGImagePropertyIPTCExtSeasonIdentifier: string;

declare var kCGImagePropertyIPTCExtSeasonName: string;

declare var kCGImagePropertyIPTCExtSeasonNumber: string;

declare var kCGImagePropertyIPTCExtSeries: string;

declare var kCGImagePropertyIPTCExtSeriesIdentifier: string;

declare var kCGImagePropertyIPTCExtSeriesName: string;

declare var kCGImagePropertyIPTCExtShownEvent: string;

declare var kCGImagePropertyIPTCExtShownEventIdentifier: string;

declare var kCGImagePropertyIPTCExtShownEventName: string;

declare var kCGImagePropertyIPTCExtStorylineIdentifier: string;

declare var kCGImagePropertyIPTCExtStreamReady: string;

declare var kCGImagePropertyIPTCExtStylePeriod: string;

declare var kCGImagePropertyIPTCExtSupplyChainSource: string;

declare var kCGImagePropertyIPTCExtSupplyChainSourceIdentifier: string;

declare var kCGImagePropertyIPTCExtSupplyChainSourceName: string;

declare var kCGImagePropertyIPTCExtTemporalCoverage: string;

declare var kCGImagePropertyIPTCExtTemporalCoverageFrom: string;

declare var kCGImagePropertyIPTCExtTemporalCoverageTo: string;

declare var kCGImagePropertyIPTCExtTranscript: string;

declare var kCGImagePropertyIPTCExtTranscriptLink: string;

declare var kCGImagePropertyIPTCExtTranscriptLinkLink: string;

declare var kCGImagePropertyIPTCExtTranscriptLinkLinkQualifier: string;

declare var kCGImagePropertyIPTCExtVideoBitrate: string;

declare var kCGImagePropertyIPTCExtVideoBitrateMode: string;

declare var kCGImagePropertyIPTCExtVideoDisplayAspectRatio: string;

declare var kCGImagePropertyIPTCExtVideoEncodingProfile: string;

declare var kCGImagePropertyIPTCExtVideoShotType: string;

declare var kCGImagePropertyIPTCExtVideoShotTypeIdentifier: string;

declare var kCGImagePropertyIPTCExtVideoShotTypeName: string;

declare var kCGImagePropertyIPTCExtVideoStreamsCount: string;

declare var kCGImagePropertyIPTCExtVisualColor: string;

declare var kCGImagePropertyIPTCExtWorkflowTag: string;

declare var kCGImagePropertyIPTCExtWorkflowTagCvId: string;

declare var kCGImagePropertyIPTCExtWorkflowTagCvTermId: string;

declare var kCGImagePropertyIPTCExtWorkflowTagCvTermName: string;

declare var kCGImagePropertyIPTCExtWorkflowTagCvTermRefinedAbout: string;

declare var kCGImagePropertyIPTCFixtureIdentifier: string;

declare var kCGImagePropertyIPTCHeadline: string;

declare var kCGImagePropertyIPTCImageOrientation: string;

declare var kCGImagePropertyIPTCImageType: string;

declare var kCGImagePropertyIPTCKeywords: string;

declare var kCGImagePropertyIPTCLanguageIdentifier: string;

declare var kCGImagePropertyIPTCObjectAttributeReference: string;

declare var kCGImagePropertyIPTCObjectCycle: string;

declare var kCGImagePropertyIPTCObjectName: string;

declare var kCGImagePropertyIPTCObjectTypeReference: string;

declare var kCGImagePropertyIPTCOriginalTransmissionReference: string;

declare var kCGImagePropertyIPTCOriginatingProgram: string;

declare var kCGImagePropertyIPTCProgramVersion: string;

declare var kCGImagePropertyIPTCProvinceState: string;

declare var kCGImagePropertyIPTCReferenceDate: string;

declare var kCGImagePropertyIPTCReferenceNumber: string;

declare var kCGImagePropertyIPTCReferenceService: string;

declare var kCGImagePropertyIPTCReleaseDate: string;

declare var kCGImagePropertyIPTCReleaseTime: string;

declare var kCGImagePropertyIPTCRightsUsageTerms: string;

declare var kCGImagePropertyIPTCScene: string;

declare var kCGImagePropertyIPTCSource: string;

declare var kCGImagePropertyIPTCSpecialInstructions: string;

declare var kCGImagePropertyIPTCStarRating: string;

declare var kCGImagePropertyIPTCSubLocation: string;

declare var kCGImagePropertyIPTCSubjectReference: string;

declare var kCGImagePropertyIPTCSupplementalCategory: string;

declare var kCGImagePropertyIPTCTimeCreated: string;

declare var kCGImagePropertyIPTCUrgency: string;

declare var kCGImagePropertyIPTCWriterEditor: string;

declare var kCGImagePropertyImageCount: string;

declare var kCGImagePropertyImages: string;

declare var kCGImagePropertyIsFloat: string;

declare var kCGImagePropertyIsIndexed: string;

declare var kCGImagePropertyJFIFDensityUnit: string;

declare var kCGImagePropertyJFIFDictionary: string;

declare var kCGImagePropertyJFIFIsProgressive: string;

declare var kCGImagePropertyJFIFVersion: string;

declare var kCGImagePropertyJFIFXDensity: string;

declare var kCGImagePropertyJFIFYDensity: string;

declare var kCGImagePropertyMakerAppleDictionary: string;

declare var kCGImagePropertyMakerCanonAspectRatioInfo: string;

declare var kCGImagePropertyMakerCanonCameraSerialNumber: string;

declare var kCGImagePropertyMakerCanonContinuousDrive: string;

declare var kCGImagePropertyMakerCanonDictionary: string;

declare var kCGImagePropertyMakerCanonFirmware: string;

declare var kCGImagePropertyMakerCanonFlashExposureComp: string;

declare var kCGImagePropertyMakerCanonImageSerialNumber: string;

declare var kCGImagePropertyMakerCanonLensModel: string;

declare var kCGImagePropertyMakerCanonOwnerName: string;

declare var kCGImagePropertyMakerFujiDictionary: string;

declare var kCGImagePropertyMakerMinoltaDictionary: string;

declare var kCGImagePropertyMakerNikonCameraSerialNumber: string;

declare var kCGImagePropertyMakerNikonColorMode: string;

declare var kCGImagePropertyMakerNikonDictionary: string;

declare var kCGImagePropertyMakerNikonDigitalZoom: string;

declare var kCGImagePropertyMakerNikonFlashExposureComp: string;

declare var kCGImagePropertyMakerNikonFlashSetting: string;

declare var kCGImagePropertyMakerNikonFocusDistance: string;

declare var kCGImagePropertyMakerNikonFocusMode: string;

declare var kCGImagePropertyMakerNikonISOSelection: string;

declare var kCGImagePropertyMakerNikonISOSetting: string;

declare var kCGImagePropertyMakerNikonImageAdjustment: string;

declare var kCGImagePropertyMakerNikonLensAdapter: string;

declare var kCGImagePropertyMakerNikonLensInfo: string;

declare var kCGImagePropertyMakerNikonLensType: string;

declare var kCGImagePropertyMakerNikonQuality: string;

declare var kCGImagePropertyMakerNikonSharpenMode: string;

declare var kCGImagePropertyMakerNikonShootingMode: string;

declare var kCGImagePropertyMakerNikonShutterCount: string;

declare var kCGImagePropertyMakerNikonWhiteBalanceMode: string;

declare var kCGImagePropertyMakerOlympusDictionary: string;

declare var kCGImagePropertyMakerPentaxDictionary: string;

declare var kCGImagePropertyNamedColorSpace: string;

declare var kCGImagePropertyOpenEXRAspectRatio: string;

declare var kCGImagePropertyOpenEXRDictionary: string;

declare var kCGImagePropertyOrientation: string;

declare var kCGImagePropertyPNGAuthor: string;

declare var kCGImagePropertyPNGChromaticities: string;

declare var kCGImagePropertyPNGComment: string;

declare var kCGImagePropertyPNGCompressionFilter: string;

declare var kCGImagePropertyPNGCopyright: string;

declare var kCGImagePropertyPNGCreationTime: string;

declare var kCGImagePropertyPNGDescription: string;

declare var kCGImagePropertyPNGDictionary: string;

declare var kCGImagePropertyPNGDisclaimer: string;

declare var kCGImagePropertyPNGGamma: string;

declare var kCGImagePropertyPNGInterlaceType: string;

declare var kCGImagePropertyPNGModificationTime: string;

declare var kCGImagePropertyPNGSoftware: string;

declare var kCGImagePropertyPNGSource: string;

declare var kCGImagePropertyPNGTitle: string;

declare var kCGImagePropertyPNGWarning: string;

declare var kCGImagePropertyPNGXPixelsPerMeter: string;

declare var kCGImagePropertyPNGYPixelsPerMeter: string;

declare var kCGImagePropertyPNGsRGBIntent: string;

declare var kCGImagePropertyPixelFormat: string;

declare var kCGImagePropertyPixelHeight: string;

declare var kCGImagePropertyPixelWidth: string;

declare var kCGImagePropertyPrimaryImage: string;

declare var kCGImagePropertyProfileName: string;

declare var kCGImagePropertyRawDictionary: string;

declare var kCGImagePropertyTIFFArtist: string;

declare var kCGImagePropertyTIFFCompression: string;

declare var kCGImagePropertyTIFFCopyright: string;

declare var kCGImagePropertyTIFFDateTime: string;

declare var kCGImagePropertyTIFFDictionary: string;

declare var kCGImagePropertyTIFFDocumentName: string;

declare var kCGImagePropertyTIFFHostComputer: string;

declare var kCGImagePropertyTIFFImageDescription: string;

declare var kCGImagePropertyTIFFMake: string;

declare var kCGImagePropertyTIFFModel: string;

declare var kCGImagePropertyTIFFOrientation: string;

declare var kCGImagePropertyTIFFPhotometricInterpretation: string;

declare var kCGImagePropertyTIFFPrimaryChromaticities: string;

declare var kCGImagePropertyTIFFResolutionUnit: string;

declare var kCGImagePropertyTIFFSoftware: string;

declare var kCGImagePropertyTIFFTileLength: string;

declare var kCGImagePropertyTIFFTileWidth: string;

declare var kCGImagePropertyTIFFTransferFunction: string;

declare var kCGImagePropertyTIFFWhitePoint: string;

declare var kCGImagePropertyTIFFXResolution: string;

declare var kCGImagePropertyTIFFYResolution: string;

declare var kCGImagePropertyThumbnailImages: string;

declare var kCGImagePropertyWidth: string;

declare var kCGImageSourceCreateThumbnailFromImageAlways: string;

declare var kCGImageSourceCreateThumbnailFromImageIfAbsent: string;

declare var kCGImageSourceCreateThumbnailWithTransform: string;

declare var kCGImageSourceShouldAllowFloat: string;

declare var kCGImageSourceShouldCache: string;

declare var kCGImageSourceShouldCacheImmediately: string;

declare var kCGImageSourceSubsampleFactor: string;

declare var kCGImageSourceThumbnailMaxPixelSize: string;

declare var kCGImageSourceTypeIdentifierHint: string;
