
declare function CGImageDestinationAddImage(idst: any, image: any, properties: NSDictionary<any, any>): void;

declare function CGImageDestinationAddImageAndMetadata(idst: any, image: any, metadata: any, options: NSDictionary<any, any>): void;

declare function CGImageDestinationAddImageFromSource(idst: any, isrc: any, index: number, properties: NSDictionary<any, any>): void;

declare function CGImageDestinationCopyImageSource(idst: any, isrc: any, options: NSDictionary<any, any>, err: interop.Reference<NSError>): boolean;

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

declare function CGImageMetadataRegisterNamespaceForPrefix(metadata: any, xmlns: string, prefix: string, err: interop.Reference<NSError>): boolean;

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

declare var kCGImageDestinationBackgroundColor: string;

declare var kCGImageDestinationDateTime: string;

declare var kCGImageDestinationEmbedThumbnail: string;

declare var kCGImageDestinationImageMaxPixelSize: string;

declare var kCGImageDestinationLossyCompressionQuality: string;

declare var kCGImageDestinationMergeMetadata: string;

declare var kCGImageDestinationMetadata: string;

declare var kCGImageDestinationOrientation: string;

declare var kCGImageMetadataEnumerateRecursively: string;

declare var kCGImageMetadataNamespaceDublinCore: string;

declare var kCGImageMetadataNamespaceExif: string;

declare var kCGImageMetadataNamespaceExifAux: string;

declare var kCGImageMetadataNamespaceExifEX: string;

declare var kCGImageMetadataNamespaceIPTCCore: string;

declare var kCGImageMetadataNamespacePhotoshop: string;

declare var kCGImageMetadataNamespaceTIFF: string;

declare var kCGImageMetadataNamespaceXMPBasic: string;

declare var kCGImageMetadataNamespaceXMPRights: string;

declare var kCGImageMetadataPrefixDublinCore: string;

declare var kCGImageMetadataPrefixExif: string;

declare var kCGImageMetadataPrefixExifAux: string;

declare var kCGImageMetadataPrefixExifEX: string;

declare var kCGImageMetadataPrefixIPTCCore: string;

declare var kCGImageMetadataPrefixPhotoshop: string;

declare var kCGImageMetadataPrefixTIFF: string;

declare var kCGImageMetadataPrefixXMPBasic: string;

declare var kCGImageMetadataPrefixXMPRights: string;

declare var kCGImageMetadataShouldExcludeGPS: string;

declare var kCGImageMetadataShouldExcludeXMP: string;

declare var kCGImageProperty8BIMDictionary: string;

declare var kCGImageProperty8BIMLayerNames: string;

declare var kCGImageProperty8BIMVersion: string;

declare var kCGImagePropertyAPNGDelayTime: string;

declare var kCGImagePropertyAPNGLoopCount: string;

declare var kCGImagePropertyAPNGUnclampedDelayTime: string;

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

declare var kCGImagePropertyDNGBackwardVersion: string;

declare var kCGImagePropertyDNGCameraSerialNumber: string;

declare var kCGImagePropertyDNGDictionary: string;

declare var kCGImagePropertyDNGLensInfo: string;

declare var kCGImagePropertyDNGLocalizedCameraModel: string;

declare var kCGImagePropertyDNGUniqueCameraModel: string;

declare var kCGImagePropertyDNGVersion: string;

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

declare var kCGImagePropertyFileSize: string;

declare var kCGImagePropertyGIFDelayTime: string;

declare var kCGImagePropertyGIFDictionary: string;

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

declare var kCGImagePropertyHasAlpha: string;

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

declare var kCGImagePropertyOrientation: string;

declare var kCGImagePropertyPNGAuthor: string;

declare var kCGImagePropertyPNGChromaticities: string;

declare var kCGImagePropertyPNGCompressionFilter: string;

declare var kCGImagePropertyPNGCopyright: string;

declare var kCGImagePropertyPNGCreationTime: string;

declare var kCGImagePropertyPNGDescription: string;

declare var kCGImagePropertyPNGDictionary: string;

declare var kCGImagePropertyPNGGamma: string;

declare var kCGImagePropertyPNGInterlaceType: string;

declare var kCGImagePropertyPNGModificationTime: string;

declare var kCGImagePropertyPNGSoftware: string;

declare var kCGImagePropertyPNGTitle: string;

declare var kCGImagePropertyPNGXPixelsPerMeter: string;

declare var kCGImagePropertyPNGYPixelsPerMeter: string;

declare var kCGImagePropertyPNGsRGBIntent: string;

declare var kCGImagePropertyPixelHeight: string;

declare var kCGImagePropertyPixelWidth: string;

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

declare var kCGImageSourceCreateThumbnailFromImageAlways: string;

declare var kCGImageSourceCreateThumbnailFromImageIfAbsent: string;

declare var kCGImageSourceCreateThumbnailWithTransform: string;

declare var kCGImageSourceShouldAllowFloat: string;

declare var kCGImageSourceShouldCache: string;

declare var kCGImageSourceShouldCacheImmediately: string;

declare var kCGImageSourceSubsampleFactor: string;

declare var kCGImageSourceThumbnailMaxPixelSize: string;

declare var kCGImageSourceTypeIdentifierHint: string;
