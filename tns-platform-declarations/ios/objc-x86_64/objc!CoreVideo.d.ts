
declare const enum CVAttachmentMode {

	kCVAttachmentMode_ShouldNotPropagate = 0,

	kCVAttachmentMode_ShouldPropagate = 1
}

declare function CVBufferGetAttachment(buffer: any, key: string, attachmentMode: interop.Pointer | interop.Reference<CVAttachmentMode>): interop.Unmanaged<any>;

declare function CVBufferGetAttachments(buffer: any, attachmentMode: CVAttachmentMode): NSDictionary<any, any>;

declare function CVBufferPropagateAttachments(sourceBuffer: any, destinationBuffer: any): void;

declare function CVBufferRelease(buffer: any): void;

declare function CVBufferRemoveAllAttachments(buffer: any): void;

declare function CVBufferRemoveAttachment(buffer: any, key: string): void;

declare function CVBufferRetain(buffer: any): interop.Unmanaged<any>;

declare function CVBufferSetAttachment(buffer: any, key: string, value: any, attachmentMode: CVAttachmentMode): void;

declare function CVBufferSetAttachments(buffer: any, theAttachments: NSDictionary<any, any>, attachmentMode: CVAttachmentMode): void;

declare function CVColorPrimariesGetIntegerCodePointForString(colorPrimariesString: string): number;

declare function CVColorPrimariesGetStringForIntegerCodePoint(colorPrimariesCodePoint: number): interop.Unmanaged<string>;

interface CVFillExtendedPixelsCallBackData {
	version: number;
	fillCallBack: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => boolean>;
	refCon: interop.Pointer | interop.Reference<any>;
}
declare var CVFillExtendedPixelsCallBackData: interop.StructType<CVFillExtendedPixelsCallBackData>;

declare function CVGetCurrentHostTime(): number;

declare function CVGetHostClockFrequency(): number;

declare function CVGetHostClockMinimumTimeDelta(): number;

declare function CVImageBufferCreateColorSpaceFromAttachments(attachments: NSDictionary<any, any>): interop.Unmanaged<any>;

declare function CVImageBufferGetCleanRect(imageBuffer: any): CGRect;

declare function CVImageBufferGetDisplaySize(imageBuffer: any): CGSize;

declare function CVImageBufferGetEncodedSize(imageBuffer: any): CGSize;

declare function CVImageBufferIsFlipped(imageBuffer: any): boolean;

declare function CVMetalTextureCacheCreate(allocator: any, cacheAttributes: NSDictionary<any, any>, metalDevice: MTLDevice, textureAttributes: NSDictionary<any, any>, cacheOut: interop.Pointer | interop.Reference<any>): number;

declare function CVMetalTextureCacheCreateTextureFromImage(allocator: any, textureCache: any, sourceImage: any, textureAttributes: NSDictionary<any, any>, pixelFormat: MTLPixelFormat, width: number, height: number, planeIndex: number, textureOut: interop.Pointer | interop.Reference<any>): number;

declare function CVMetalTextureCacheFlush(textureCache: any, options: number): void;

declare function CVMetalTextureCacheGetTypeID(): number;

declare function CVMetalTextureGetCleanTexCoords(image: any, lowerLeft: interop.Reference<number>, lowerRight: interop.Reference<number>, upperRight: interop.Reference<number>, upperLeft: interop.Reference<number>): void;

declare function CVMetalTextureGetTexture(image: any): MTLTexture;

declare function CVMetalTextureGetTypeID(): number;

declare function CVMetalTextureIsFlipped(image: any): boolean;

declare function CVOpenGLESTextureCacheCreate(allocator: any, cacheAttributes: NSDictionary<any, any>, eaglContext: EAGLContext, textureAttributes: NSDictionary<any, any>, cacheOut: interop.Pointer | interop.Reference<any>): number;

declare function CVOpenGLESTextureCacheCreateTextureFromImage(allocator: any, textureCache: any, sourceImage: any, textureAttributes: NSDictionary<any, any>, target: number, internalFormat: number, width: number, height: number, format: number, type: number, planeIndex: number, textureOut: interop.Pointer | interop.Reference<any>): number;

declare function CVOpenGLESTextureCacheFlush(textureCache: any, options: number): void;

declare function CVOpenGLESTextureCacheGetTypeID(): number;

declare function CVOpenGLESTextureGetCleanTexCoords(image: any, lowerLeft: interop.Reference<number>, lowerRight: interop.Reference<number>, upperRight: interop.Reference<number>, upperLeft: interop.Reference<number>): void;

declare function CVOpenGLESTextureGetName(image: any): number;

declare function CVOpenGLESTextureGetTarget(image: any): number;

declare function CVOpenGLESTextureGetTypeID(): number;

declare function CVOpenGLESTextureIsFlipped(image: any): boolean;

declare function CVPixelBufferCreate(allocator: any, width: number, height: number, pixelFormatType: number, pixelBufferAttributes: NSDictionary<any, any>, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CVPixelBufferCreateResolvedAttributesDictionary(allocator: any, attributes: NSArray<any> | any[], resolvedDictionaryOut: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

declare function CVPixelBufferCreateWithBytes(allocator: any, width: number, height: number, pixelFormatType: number, baseAddress: interop.Pointer | interop.Reference<any>, bytesPerRow: number, releaseCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, releaseRefCon: interop.Pointer | interop.Reference<any>, pixelBufferAttributes: NSDictionary<any, any>, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CVPixelBufferCreateWithIOSurface(allocator: any, surface: any, pixelBufferAttributes: NSDictionary<any, any>, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CVPixelBufferCreateWithPlanarBytes(allocator: any, width: number, height: number, pixelFormatType: number, dataPtr: interop.Pointer | interop.Reference<any>, dataSize: number, numberOfPlanes: number, planeBaseAddress: interop.Reference<interop.Pointer | interop.Reference<any>>, planeWidth: interop.Reference<number>, planeHeight: interop.Reference<number>, planeBytesPerRow: interop.Reference<number>, releaseCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, releaseRefCon: interop.Pointer | interop.Reference<any>, pixelBufferAttributes: NSDictionary<any, any>, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CVPixelBufferFillExtendedPixels(pixelBuffer: any): number;

declare function CVPixelBufferGetBaseAddress(pixelBuffer: any): interop.Pointer | interop.Reference<any>;

declare function CVPixelBufferGetBaseAddressOfPlane(pixelBuffer: any, planeIndex: number): interop.Pointer | interop.Reference<any>;

declare function CVPixelBufferGetBytesPerRow(pixelBuffer: any): number;

declare function CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer: any, planeIndex: number): number;

declare function CVPixelBufferGetDataSize(pixelBuffer: any): number;

declare function CVPixelBufferGetExtendedPixels(pixelBuffer: any, extraColumnsOnLeft: interop.Pointer | interop.Reference<number>, extraColumnsOnRight: interop.Pointer | interop.Reference<number>, extraRowsOnTop: interop.Pointer | interop.Reference<number>, extraRowsOnBottom: interop.Pointer | interop.Reference<number>): void;

declare function CVPixelBufferGetHeight(pixelBuffer: any): number;

declare function CVPixelBufferGetHeightOfPlane(pixelBuffer: any, planeIndex: number): number;

declare function CVPixelBufferGetIOSurface(pixelBuffer: any): interop.Unmanaged<any>;

declare function CVPixelBufferGetPixelFormatType(pixelBuffer: any): number;

declare function CVPixelBufferGetPlaneCount(pixelBuffer: any): number;

declare function CVPixelBufferGetTypeID(): number;

declare function CVPixelBufferGetWidth(pixelBuffer: any): number;

declare function CVPixelBufferGetWidthOfPlane(pixelBuffer: any, planeIndex: number): number;

declare function CVPixelBufferIsPlanar(pixelBuffer: any): boolean;

declare function CVPixelBufferLockBaseAddress(pixelBuffer: any, lockFlags: CVPixelBufferLockFlags): number;

declare const enum CVPixelBufferLockFlags {

	kCVPixelBufferLock_ReadOnly = 1
}

declare function CVPixelBufferPoolCreate(allocator: any, poolAttributes: NSDictionary<any, any>, pixelBufferAttributes: NSDictionary<any, any>, poolOut: interop.Pointer | interop.Reference<any>): number;

declare function CVPixelBufferPoolCreatePixelBuffer(allocator: any, pixelBufferPool: any, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CVPixelBufferPoolCreatePixelBufferWithAuxAttributes(allocator: any, pixelBufferPool: any, auxAttributes: NSDictionary<any, any>, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CVPixelBufferPoolFlush(pool: any, options: CVPixelBufferPoolFlushFlags): void;

declare const enum CVPixelBufferPoolFlushFlags {

	kCVPixelBufferPoolFlushExcessBuffers = 1
}

declare function CVPixelBufferPoolGetAttributes(pool: any): NSDictionary<any, any>;

declare function CVPixelBufferPoolGetPixelBufferAttributes(pool: any): NSDictionary<any, any>;

declare function CVPixelBufferPoolGetTypeID(): number;

declare function CVPixelBufferPoolRelease(pixelBufferPool: any): void;

declare function CVPixelBufferPoolRetain(pixelBufferPool: any): interop.Unmanaged<any>;

declare function CVPixelBufferRelease(texture: any): void;

declare function CVPixelBufferRetain(texture: any): interop.Unmanaged<any>;

declare function CVPixelBufferUnlockBaseAddress(pixelBuffer: any, unlockFlags: CVPixelBufferLockFlags): number;

declare function CVPixelFormatDescriptionArrayCreateWithAllPixelFormatTypes(allocator: any): NSArray<any>;

declare function CVPixelFormatDescriptionCreateWithPixelFormatType(allocator: any, pixelFormat: number): NSDictionary<any, any>;

declare function CVPixelFormatDescriptionRegisterDescriptionWithPixelFormatType(description: NSDictionary<any, any>, pixelFormat: number): void;

interface CVPlanarComponentInfo {
	offset: number;
	rowBytes: number;
}
declare var CVPlanarComponentInfo: interop.StructType<CVPlanarComponentInfo>;

interface CVPlanarPixelBufferInfo {
	componentInfo: interop.Reference<CVPlanarComponentInfo>;
}
declare var CVPlanarPixelBufferInfo: interop.StructType<CVPlanarPixelBufferInfo>;

interface CVPlanarPixelBufferInfo_YCbCrBiPlanar {
	componentInfoY: CVPlanarComponentInfo;
	componentInfoCbCr: CVPlanarComponentInfo;
}
declare var CVPlanarPixelBufferInfo_YCbCrBiPlanar: interop.StructType<CVPlanarPixelBufferInfo_YCbCrBiPlanar>;

interface CVPlanarPixelBufferInfo_YCbCrPlanar {
	componentInfoY: CVPlanarComponentInfo;
	componentInfoCb: CVPlanarComponentInfo;
	componentInfoCr: CVPlanarComponentInfo;
}
declare var CVPlanarPixelBufferInfo_YCbCrPlanar: interop.StructType<CVPlanarPixelBufferInfo_YCbCrPlanar>;

interface CVSMPTETime {
	subframes: number;
	subframeDivisor: number;
	counter: number;
	type: number;
	flags: number;
	hours: number;
	minutes: number;
	seconds: number;
	frames: number;
}
declare var CVSMPTETime: interop.StructType<CVSMPTETime>;

declare const enum CVSMPTETimeFlags {

	kCVSMPTETimeValid = 1,

	kCVSMPTETimeRunning = 2
}

declare const enum CVSMPTETimeType {

	kCVSMPTETimeType24 = 0,

	kCVSMPTETimeType25 = 1,

	kCVSMPTETimeType30Drop = 2,

	kCVSMPTETimeType30 = 3,

	kCVSMPTETimeType2997 = 4,

	kCVSMPTETimeType2997Drop = 5,

	kCVSMPTETimeType60 = 6,

	kCVSMPTETimeType5994 = 7
}

interface CVTime {
	timeValue: number;
	timeScale: number;
	flags: number;
}
declare var CVTime: interop.StructType<CVTime>;

declare const enum CVTimeFlags {

	kCVTimeIsIndefinite = 1
}

interface CVTimeStamp {
	version: number;
	videoTimeScale: number;
	videoTime: number;
	hostTime: number;
	rateScalar: number;
	videoRefreshPeriod: number;
	smpteTime: CVSMPTETime;
	flags: number;
	reserved: number;
}
declare var CVTimeStamp: interop.StructType<CVTimeStamp>;

declare const enum CVTimeStampFlags {

	kCVTimeStampVideoTimeValid = 1,

	kCVTimeStampHostTimeValid = 2,

	kCVTimeStampSMPTETimeValid = 4,

	kCVTimeStampVideoRefreshPeriodValid = 8,

	kCVTimeStampRateScalarValid = 16,

	kCVTimeStampTopField = 65536,

	kCVTimeStampBottomField = 131072,

	kCVTimeStampVideoHostTimeValid = 3,

	kCVTimeStampIsInterlaced = 196608
}

declare function CVTransferFunctionGetIntegerCodePointForString(transferFunctionString: string): number;

declare function CVTransferFunctionGetStringForIntegerCodePoint(transferFunctionCodePoint: number): interop.Unmanaged<string>;

declare function CVYCbCrMatrixGetIntegerCodePointForString(yCbCrMatrixString: string): number;

declare function CVYCbCrMatrixGetStringForIntegerCodePoint(yCbCrMatrixCodePoint: number): interop.Unmanaged<string>;

declare var kCVBufferMovieTimeKey: string;

declare var kCVBufferNonPropagatedAttachmentsKey: string;

declare var kCVBufferPropagatedAttachmentsKey: string;

declare var kCVBufferTimeScaleKey: string;

declare var kCVBufferTimeValueKey: string;

declare var kCVImageBufferAlphaChannelIsOpaque: string;

declare var kCVImageBufferAlphaChannelModeKey: string;

declare var kCVImageBufferAlphaChannelMode_PremultipliedAlpha: string;

declare var kCVImageBufferAlphaChannelMode_StraightAlpha: string;

declare var kCVImageBufferCGColorSpaceKey: string;

declare var kCVImageBufferChromaLocationBottomFieldKey: string;

declare var kCVImageBufferChromaLocationTopFieldKey: string;

declare var kCVImageBufferChromaLocation_Bottom: string;

declare var kCVImageBufferChromaLocation_BottomLeft: string;

declare var kCVImageBufferChromaLocation_Center: string;

declare var kCVImageBufferChromaLocation_DV420: string;

declare var kCVImageBufferChromaLocation_Left: string;

declare var kCVImageBufferChromaLocation_Top: string;

declare var kCVImageBufferChromaLocation_TopLeft: string;

declare var kCVImageBufferChromaSubsamplingKey: string;

declare var kCVImageBufferChromaSubsampling_411: string;

declare var kCVImageBufferChromaSubsampling_420: string;

declare var kCVImageBufferChromaSubsampling_422: string;

declare var kCVImageBufferCleanApertureHeightKey: string;

declare var kCVImageBufferCleanApertureHorizontalOffsetKey: string;

declare var kCVImageBufferCleanApertureKey: string;

declare var kCVImageBufferCleanApertureVerticalOffsetKey: string;

declare var kCVImageBufferCleanApertureWidthKey: string;

declare var kCVImageBufferColorPrimariesKey: string;

declare var kCVImageBufferColorPrimaries_DCI_P3: string;

declare var kCVImageBufferColorPrimaries_EBU_3213: string;

declare var kCVImageBufferColorPrimaries_ITU_R_2020: string;

declare var kCVImageBufferColorPrimaries_ITU_R_709_2: string;

declare var kCVImageBufferColorPrimaries_P22: string;

declare var kCVImageBufferColorPrimaries_P3_D65: string;

declare var kCVImageBufferColorPrimaries_SMPTE_C: string;

declare var kCVImageBufferContentLightLevelInfoKey: string;

declare var kCVImageBufferDisplayDimensionsKey: string;

declare var kCVImageBufferDisplayHeightKey: string;

declare var kCVImageBufferDisplayWidthKey: string;

declare var kCVImageBufferFieldCountKey: string;

declare var kCVImageBufferFieldDetailKey: string;

declare var kCVImageBufferFieldDetailSpatialFirstLineEarly: string;

declare var kCVImageBufferFieldDetailSpatialFirstLineLate: string;

declare var kCVImageBufferFieldDetailTemporalBottomFirst: string;

declare var kCVImageBufferFieldDetailTemporalTopFirst: string;

declare var kCVImageBufferGammaLevelKey: string;

declare var kCVImageBufferICCProfileKey: string;

declare var kCVImageBufferMasteringDisplayColorVolumeKey: string;

declare var kCVImageBufferPixelAspectRatioHorizontalSpacingKey: string;

declare var kCVImageBufferPixelAspectRatioKey: string;

declare var kCVImageBufferPixelAspectRatioVerticalSpacingKey: string;

declare var kCVImageBufferPreferredCleanApertureKey: string;

declare var kCVImageBufferTransferFunctionKey: string;

declare var kCVImageBufferTransferFunction_ITU_R_2020: string;

declare var kCVImageBufferTransferFunction_ITU_R_2100_HLG: string;

declare var kCVImageBufferTransferFunction_ITU_R_709_2: string;

declare var kCVImageBufferTransferFunction_Linear: string;

declare var kCVImageBufferTransferFunction_SMPTE_240M_1995: string;

declare var kCVImageBufferTransferFunction_SMPTE_ST_2084_PQ: string;

declare var kCVImageBufferTransferFunction_SMPTE_ST_428_1: string;

declare var kCVImageBufferTransferFunction_UseGamma: string;

declare var kCVImageBufferTransferFunction_sRGB: string;

declare var kCVImageBufferYCbCrMatrixKey: string;

declare var kCVImageBufferYCbCrMatrix_DCI_P3: string;

declare var kCVImageBufferYCbCrMatrix_ITU_R_2020: string;

declare var kCVImageBufferYCbCrMatrix_ITU_R_601_4: string;

declare var kCVImageBufferYCbCrMatrix_ITU_R_709_2: string;

declare var kCVImageBufferYCbCrMatrix_P3_D65: string;

declare var kCVImageBufferYCbCrMatrix_SMPTE_240M_1995: string;

declare var kCVIndefiniteTime: CVTime;

declare var kCVMetalTextureCacheMaximumTextureAgeKey: string;

declare var kCVMetalTextureStorageMode: string;

declare var kCVMetalTextureUsage: string;

declare var kCVOpenGLESTextureCacheMaximumTextureAgeKey: string;

declare var kCVPixelBufferBytesPerRowAlignmentKey: string;

declare var kCVPixelBufferCGBitmapContextCompatibilityKey: string;

declare var kCVPixelBufferCGImageCompatibilityKey: string;

declare var kCVPixelBufferExtendedPixelsBottomKey: string;

declare var kCVPixelBufferExtendedPixelsLeftKey: string;

declare var kCVPixelBufferExtendedPixelsRightKey: string;

declare var kCVPixelBufferExtendedPixelsTopKey: string;

declare var kCVPixelBufferHeightKey: string;

declare var kCVPixelBufferIOSurfaceCoreAnimationCompatibilityKey: string;

declare var kCVPixelBufferIOSurfaceOpenGLESFBOCompatibilityKey: string;

declare var kCVPixelBufferIOSurfaceOpenGLESTextureCompatibilityKey: string;

declare var kCVPixelBufferIOSurfacePropertiesKey: string;

declare var kCVPixelBufferMemoryAllocatorKey: string;

declare var kCVPixelBufferMetalCompatibilityKey: string;

declare var kCVPixelBufferOpenGLCompatibilityKey: string;

declare var kCVPixelBufferOpenGLESCompatibilityKey: string;

declare var kCVPixelBufferOpenGLESTextureCacheCompatibilityKey: string;

declare var kCVPixelBufferPixelFormatTypeKey: string;

declare var kCVPixelBufferPlaneAlignmentKey: string;

declare var kCVPixelBufferPoolAllocationThresholdKey: string;

declare var kCVPixelBufferPoolFreeBufferNotification: string;

declare var kCVPixelBufferPoolMaximumBufferAgeKey: string;

declare var kCVPixelBufferPoolMinimumBufferCountKey: string;

declare var kCVPixelBufferWidthKey: string;

declare var kCVPixelFormatBitsPerBlock: string;

declare var kCVPixelFormatBlackBlock: string;

declare var kCVPixelFormatBlockHeight: string;

declare var kCVPixelFormatBlockHorizontalAlignment: string;

declare var kCVPixelFormatBlockVerticalAlignment: string;

declare var kCVPixelFormatBlockWidth: string;

declare var kCVPixelFormatCGBitmapContextCompatibility: string;

declare var kCVPixelFormatCGBitmapInfo: string;

declare var kCVPixelFormatCGImageCompatibility: string;

declare var kCVPixelFormatCodecType: string;

declare var kCVPixelFormatComponentRange: string;

declare var kCVPixelFormatComponentRange_FullRange: string;

declare var kCVPixelFormatComponentRange_VideoRange: string;

declare var kCVPixelFormatComponentRange_WideRange: string;

declare var kCVPixelFormatConstant: string;

declare var kCVPixelFormatContainsAlpha: string;

declare var kCVPixelFormatContainsGrayscale: string;

declare var kCVPixelFormatContainsRGB: string;

declare var kCVPixelFormatContainsYCbCr: string;

declare var kCVPixelFormatFillExtendedPixelsCallback: string;

declare var kCVPixelFormatFourCC: string;

declare var kCVPixelFormatHorizontalSubsampling: string;

declare var kCVPixelFormatName: string;

declare var kCVPixelFormatOpenGLCompatibility: string;

declare var kCVPixelFormatOpenGLESCompatibility: string;

declare var kCVPixelFormatOpenGLFormat: string;

declare var kCVPixelFormatOpenGLInternalFormat: string;

declare var kCVPixelFormatOpenGLType: string;

declare var kCVPixelFormatPlanes: string;

declare var kCVPixelFormatQDCompatibility: string;

declare const kCVPixelFormatType_128RGBAFloat: number;

declare const kCVPixelFormatType_14Bayer_BGGR: number;

declare const kCVPixelFormatType_14Bayer_GBRG: number;

declare const kCVPixelFormatType_14Bayer_GRBG: number;

declare const kCVPixelFormatType_14Bayer_RGGB: number;

declare const kCVPixelFormatType_16BE555: number;

declare const kCVPixelFormatType_16BE565: number;

declare const kCVPixelFormatType_16Gray: number;

declare const kCVPixelFormatType_16LE555: number;

declare const kCVPixelFormatType_16LE5551: number;

declare const kCVPixelFormatType_16LE565: number;

declare const kCVPixelFormatType_1IndexedGray_WhiteIsZero: number;

declare const kCVPixelFormatType_1Monochrome: number;

declare const kCVPixelFormatType_24BGR: number;

declare const kCVPixelFormatType_24RGB: number;

declare const kCVPixelFormatType_2Indexed: number;

declare const kCVPixelFormatType_2IndexedGray_WhiteIsZero: number;

declare const kCVPixelFormatType_30RGB: number;

declare const kCVPixelFormatType_30RGBLEPackedWideGamut: number;

declare const kCVPixelFormatType_32ABGR: number;

declare const kCVPixelFormatType_32ARGB: number;

declare const kCVPixelFormatType_32AlphaGray: number;

declare const kCVPixelFormatType_32BGRA: number;

declare const kCVPixelFormatType_32RGBA: number;

declare const kCVPixelFormatType_420YpCbCr10BiPlanarFullRange: number;

declare const kCVPixelFormatType_420YpCbCr10BiPlanarVideoRange: number;

declare const kCVPixelFormatType_420YpCbCr8BiPlanarFullRange: number;

declare const kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange: number;

declare const kCVPixelFormatType_420YpCbCr8Planar: number;

declare const kCVPixelFormatType_420YpCbCr8PlanarFullRange: number;

declare const kCVPixelFormatType_420YpCbCr8VideoRange_8A_TriPlanar: number;

declare const kCVPixelFormatType_422YpCbCr10: number;

declare const kCVPixelFormatType_422YpCbCr10BiPlanarFullRange: number;

declare const kCVPixelFormatType_422YpCbCr10BiPlanarVideoRange: number;

declare const kCVPixelFormatType_422YpCbCr16: number;

declare const kCVPixelFormatType_422YpCbCr8: number;

declare const kCVPixelFormatType_422YpCbCr8FullRange: number;

declare const kCVPixelFormatType_422YpCbCr8_yuvs: number;

declare const kCVPixelFormatType_422YpCbCr_4A_8BiPlanar: number;

declare const kCVPixelFormatType_4444AYpCbCr16: number;

declare const kCVPixelFormatType_4444AYpCbCr8: number;

declare const kCVPixelFormatType_4444YpCbCrA8: number;

declare const kCVPixelFormatType_4444YpCbCrA8R: number;

declare const kCVPixelFormatType_444YpCbCr10: number;

declare const kCVPixelFormatType_444YpCbCr10BiPlanarFullRange: number;

declare const kCVPixelFormatType_444YpCbCr10BiPlanarVideoRange: number;

declare const kCVPixelFormatType_444YpCbCr8: number;

declare const kCVPixelFormatType_48RGB: number;

declare const kCVPixelFormatType_4Indexed: number;

declare const kCVPixelFormatType_4IndexedGray_WhiteIsZero: number;

declare const kCVPixelFormatType_64ARGB: number;

declare const kCVPixelFormatType_64RGBAHalf: number;

declare const kCVPixelFormatType_8Indexed: number;

declare const kCVPixelFormatType_8IndexedGray_WhiteIsZero: number;

declare const kCVPixelFormatType_ARGB2101010LEPacked: number;

declare const kCVPixelFormatType_DepthFloat16: number;

declare const kCVPixelFormatType_DepthFloat32: number;

declare const kCVPixelFormatType_DisparityFloat16: number;

declare const kCVPixelFormatType_DisparityFloat32: number;

declare const kCVPixelFormatType_OneComponent16Half: number;

declare const kCVPixelFormatType_OneComponent32Float: number;

declare const kCVPixelFormatType_OneComponent8: number;

declare const kCVPixelFormatType_TwoComponent16Half: number;

declare const kCVPixelFormatType_TwoComponent32Float: number;

declare const kCVPixelFormatType_TwoComponent8: number;

declare var kCVPixelFormatVerticalSubsampling: string;

declare const kCVReturnAllocationFailed: number;

declare const kCVReturnDisplayLinkAlreadyRunning: number;

declare const kCVReturnDisplayLinkCallbacksNotSet: number;

declare const kCVReturnDisplayLinkNotRunning: number;

declare const kCVReturnError: number;

declare const kCVReturnFirst: number;

declare const kCVReturnInvalidArgument: number;

declare const kCVReturnInvalidDisplay: number;

declare const kCVReturnInvalidPixelBufferAttributes: number;

declare const kCVReturnInvalidPixelFormat: number;

declare const kCVReturnInvalidPoolAttributes: number;

declare const kCVReturnInvalidSize: number;

declare const kCVReturnLast: number;

declare const kCVReturnPixelBufferNotMetalCompatible: number;

declare const kCVReturnPixelBufferNotOpenGLCompatible: number;

declare const kCVReturnPoolAllocationFailed: number;

declare const kCVReturnRetry: number;

declare const kCVReturnSuccess: number;

declare const kCVReturnUnsupported: number;

declare const kCVReturnWouldExceedAllocationThreshold: number;

declare var kCVZeroTime: CVTime;
