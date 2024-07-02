
declare const enum CVAttachmentMode {

	kCVAttachmentMode_ShouldNotPropagate = 0,

	kCVAttachmentMode_ShouldPropagate = 1
}

/**
 * @since 15.0
 */
declare function CVBufferCopyAttachment(buffer: any, key: string, attachmentMode: interop.Pointer | interop.Reference<CVAttachmentMode>): any;

/**
 * @since 15.0
 */
declare function CVBufferCopyAttachments(buffer: any, attachmentMode: CVAttachmentMode): NSDictionary<any, any>;

/**
 * @since 4.0
 * @deprecated 15.0
 */
declare function CVBufferGetAttachment(buffer: any, key: string, attachmentMode: interop.Pointer | interop.Reference<CVAttachmentMode>): interop.Unmanaged<any>;

/**
 * @since 4.0
 * @deprecated 15.0
 */
declare function CVBufferGetAttachments(buffer: any, attachmentMode: CVAttachmentMode): NSDictionary<any, any>;

/**
 * @since 15.0
 */
declare function CVBufferHasAttachment(buffer: any, key: string): boolean;

/**
 * @since 4.0
 */
declare function CVBufferPropagateAttachments(sourceBuffer: any, destinationBuffer: any): void;

/**
 * @since 4.0
 */
declare function CVBufferRelease(buffer: any): void;

/**
 * @since 4.0
 */
declare function CVBufferRemoveAllAttachments(buffer: any): void;

/**
 * @since 4.0
 */
declare function CVBufferRemoveAttachment(buffer: any, key: string): void;

/**
 * @since 4.0
 */
declare function CVBufferRetain(buffer: any): interop.Unmanaged<any>;

/**
 * @since 4.0
 */
declare function CVBufferSetAttachment(buffer: any, key: string, value: any, attachmentMode: CVAttachmentMode): void;

/**
 * @since 4.0
 */
declare function CVBufferSetAttachments(buffer: any, theAttachments: NSDictionary<any, any>, attachmentMode: CVAttachmentMode): void;

/**
 * @since 11.0
 */
declare function CVColorPrimariesGetIntegerCodePointForString(colorPrimariesString: string): number;

/**
 * @since 11.0
 */
declare function CVColorPrimariesGetStringForIntegerCodePoint(colorPrimariesCodePoint: number): interop.Unmanaged<string>;

interface CVFillExtendedPixelsCallBackData {
	version: number;
	fillCallBack: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => boolean>;
	refCon: interop.Pointer | interop.Reference<any>;
}
declare var CVFillExtendedPixelsCallBackData: interop.StructType<CVFillExtendedPixelsCallBackData>;

/**
 * @since 4.0
 */
declare function CVGetCurrentHostTime(): number;

/**
 * @since 4.0
 */
declare function CVGetHostClockFrequency(): number;

/**
 * @since 4.0
 */
declare function CVGetHostClockMinimumTimeDelta(): number;

/**
 * @since 10.0
 */
declare function CVImageBufferCreateColorSpaceFromAttachments(attachments: NSDictionary<any, any>): interop.Unmanaged<any>;

/**
 * @since 4.0
 */
declare function CVImageBufferGetCleanRect(imageBuffer: any): CGRect;

/**
 * @since 4.0
 */
declare function CVImageBufferGetDisplaySize(imageBuffer: any): CGSize;

/**
 * @since 4.0
 */
declare function CVImageBufferGetEncodedSize(imageBuffer: any): CGSize;

/**
 * @since 4.0
 */
declare function CVImageBufferIsFlipped(imageBuffer: any): boolean;

/**
 * @since 15.0
 */
declare function CVIsCompressedPixelFormatAvailable(pixelFormatType: number): boolean;

/**
 * @since 18.0
 */
declare function CVMetalBufferCacheCreate(allocator: any, cacheAttributes: NSDictionary<any, any>, metalDevice: MTLDevice, cacheOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 18.0
 */
declare function CVMetalBufferCacheCreateBufferFromImage(allocator: any, bufferCache: any, imageBuffer: any, bufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 18.0
 */
declare function CVMetalBufferCacheFlush(bufferCache: any, options: number): void;

/**
 * @since 18.0
 */
declare function CVMetalBufferCacheGetTypeID(): number;

/**
 * @since 18.0
 */
declare function CVMetalBufferGetBuffer(buffer: any): MTLBuffer;

/**
 * @since 18.0
 */
declare function CVMetalBufferGetTypeID(): number;

/**
 * @since 8.0
 */
declare function CVMetalTextureCacheCreate(allocator: any, cacheAttributes: NSDictionary<any, any>, metalDevice: MTLDevice, textureAttributes: NSDictionary<any, any>, cacheOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CVMetalTextureCacheCreateTextureFromImage(allocator: any, textureCache: any, sourceImage: any, textureAttributes: NSDictionary<any, any>, pixelFormat: MTLPixelFormat, width: number, height: number, planeIndex: number, textureOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CVMetalTextureCacheFlush(textureCache: any, options: number): void;

/**
 * @since 8.0
 */
declare function CVMetalTextureCacheGetTypeID(): number;

/**
 * @since 8.0
 */
declare function CVMetalTextureGetCleanTexCoords(image: any, lowerLeft: interop.Reference<number>, lowerRight: interop.Reference<number>, upperRight: interop.Reference<number>, upperLeft: interop.Reference<number>): void;

/**
 * @since 8.0
 */
declare function CVMetalTextureGetTexture(image: any): MTLTexture;

/**
 * @since 8.0
 */
declare function CVMetalTextureGetTypeID(): number;

/**
 * @since 8.0
 */
declare function CVMetalTextureIsFlipped(image: any): boolean;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function CVOpenGLESTextureCacheCreate(allocator: any, cacheAttributes: NSDictionary<any, any>, eaglContext: EAGLContext, textureAttributes: NSDictionary<any, any>, cacheOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function CVOpenGLESTextureCacheCreateTextureFromImage(allocator: any, textureCache: any, sourceImage: any, textureAttributes: NSDictionary<any, any>, target: number, internalFormat: number, width: number, height: number, format: number, type: number, planeIndex: number, textureOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function CVOpenGLESTextureCacheFlush(textureCache: any, options: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function CVOpenGLESTextureCacheGetTypeID(): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function CVOpenGLESTextureGetCleanTexCoords(image: any, lowerLeft: interop.Reference<number>, lowerRight: interop.Reference<number>, upperRight: interop.Reference<number>, upperLeft: interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function CVOpenGLESTextureGetName(image: any): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function CVOpenGLESTextureGetTarget(image: any): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function CVOpenGLESTextureGetTypeID(): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function CVOpenGLESTextureIsFlipped(image: any): boolean;

/**
 * @since 15.0
 */
declare function CVPixelBufferCopyCreationAttributes(pixelBuffer: any): NSDictionary<any, any>;

/**
 * @since 4.0
 */
declare function CVPixelBufferCreate(allocator: any, width: number, height: number, pixelFormatType: number, pixelBufferAttributes: NSDictionary<any, any>, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferCreateResolvedAttributesDictionary(allocator: any, attributes: NSArray<any> | any[], resolvedDictionaryOut: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferCreateWithBytes(allocator: any, width: number, height: number, pixelFormatType: number, baseAddress: interop.Pointer | interop.Reference<any>, bytesPerRow: number, releaseCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, releaseRefCon: interop.Pointer | interop.Reference<any>, pixelBufferAttributes: NSDictionary<any, any>, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferCreateWithIOSurface(allocator: any, surface: IOSurface, pixelBufferAttributes: NSDictionary<any, any>, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferCreateWithPlanarBytes(allocator: any, width: number, height: number, pixelFormatType: number, dataPtr: interop.Pointer | interop.Reference<any>, dataSize: number, numberOfPlanes: number, planeBaseAddress: interop.Reference<interop.Pointer | interop.Reference<any>>, planeWidth: interop.Reference<number>, planeHeight: interop.Reference<number>, planeBytesPerRow: interop.Reference<number>, releaseCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, releaseRefCon: interop.Pointer | interop.Reference<any>, pixelBufferAttributes: NSDictionary<any, any>, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferFillExtendedPixels(pixelBuffer: any): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetBaseAddress(pixelBuffer: any): interop.Pointer | interop.Reference<any>;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetBaseAddressOfPlane(pixelBuffer: any, planeIndex: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetBytesPerRow(pixelBuffer: any): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer: any, planeIndex: number): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetDataSize(pixelBuffer: any): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetExtendedPixels(pixelBuffer: any, extraColumnsOnLeft: interop.Pointer | interop.Reference<number>, extraColumnsOnRight: interop.Pointer | interop.Reference<number>, extraRowsOnTop: interop.Pointer | interop.Reference<number>, extraRowsOnBottom: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetHeight(pixelBuffer: any): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetHeightOfPlane(pixelBuffer: any, planeIndex: number): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetIOSurface(pixelBuffer: any): interop.Unmanaged<IOSurface>;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetPixelFormatType(pixelBuffer: any): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetPlaneCount(pixelBuffer: any): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetTypeID(): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetWidth(pixelBuffer: any): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferGetWidthOfPlane(pixelBuffer: any, planeIndex: number): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferIsPlanar(pixelBuffer: any): boolean;

/**
 * @since 4.0
 */
declare function CVPixelBufferLockBaseAddress(pixelBuffer: any, lockFlags: CVPixelBufferLockFlags): number;

declare const enum CVPixelBufferLockFlags {

	kCVPixelBufferLock_ReadOnly = 1
}

/**
 * @since 4.0
 */
declare function CVPixelBufferPoolCreate(allocator: any, poolAttributes: NSDictionary<any, any>, pixelBufferAttributes: NSDictionary<any, any>, poolOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferPoolCreatePixelBuffer(allocator: any, pixelBufferPool: any, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferPoolCreatePixelBufferWithAuxAttributes(allocator: any, pixelBufferPool: any, auxAttributes: NSDictionary<any, any>, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CVPixelBufferPoolFlush(pool: any, options: CVPixelBufferPoolFlushFlags): void;

declare const enum CVPixelBufferPoolFlushFlags {

	kCVPixelBufferPoolFlushExcessBuffers = 1
}

/**
 * @since 4.0
 */
declare function CVPixelBufferPoolGetAttributes(pool: any): NSDictionary<any, any>;

/**
 * @since 4.0
 */
declare function CVPixelBufferPoolGetPixelBufferAttributes(pool: any): NSDictionary<any, any>;

/**
 * @since 4.0
 */
declare function CVPixelBufferPoolGetTypeID(): number;

/**
 * @since 4.0
 */
declare function CVPixelBufferPoolRelease(pixelBufferPool: any): void;

/**
 * @since 4.0
 */
declare function CVPixelBufferPoolRetain(pixelBufferPool: any): interop.Unmanaged<any>;

/**
 * @since 4.0
 */
declare function CVPixelBufferRelease(texture: any): void;

/**
 * @since 4.0
 */
declare function CVPixelBufferRetain(texture: any): interop.Unmanaged<any>;

/**
 * @since 4.0
 */
declare function CVPixelBufferUnlockBaseAddress(pixelBuffer: any, unlockFlags: CVPixelBufferLockFlags): number;

/**
 * @since 4.0
 */
declare function CVPixelFormatDescriptionArrayCreateWithAllPixelFormatTypes(allocator: any): NSArray<any>;

/**
 * @since 4.0
 */
declare function CVPixelFormatDescriptionCreateWithPixelFormatType(allocator: any, pixelFormat: number): NSDictionary<any, any>;

/**
 * @since 4.0
 */
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

/**
 * @since 11.0
 */
declare function CVTransferFunctionGetIntegerCodePointForString(transferFunctionString: string): number;

/**
 * @since 11.0
 */
declare function CVTransferFunctionGetStringForIntegerCodePoint(transferFunctionCodePoint: number): interop.Unmanaged<string>;

/**
 * @since 11.0
 */
declare function CVYCbCrMatrixGetIntegerCodePointForString(yCbCrMatrixString: string): number;

/**
 * @since 11.0
 */
declare function CVYCbCrMatrixGetStringForIntegerCodePoint(yCbCrMatrixCodePoint: number): interop.Unmanaged<string>;

/**
 * @since 4.0
 */
declare var kCVBufferMovieTimeKey: string;

/**
 * @since 4.0
 */
declare var kCVBufferNonPropagatedAttachmentsKey: string;

/**
 * @since 4.0
 */
declare var kCVBufferPropagatedAttachmentsKey: string;

/**
 * @since 4.0
 */
declare var kCVBufferTimeScaleKey: string;

/**
 * @since 4.0
 */
declare var kCVBufferTimeValueKey: string;

/**
 * @since 8.0
 */
declare var kCVImageBufferAlphaChannelIsOpaque: string;

/**
 * @since 13.0
 */
declare var kCVImageBufferAlphaChannelModeKey: string;

/**
 * @since 13.0
 */
declare var kCVImageBufferAlphaChannelMode_PremultipliedAlpha: string;

/**
 * @since 13.0
 */
declare var kCVImageBufferAlphaChannelMode_StraightAlpha: string;

/**
 * @since 15.0
 */
declare var kCVImageBufferAmbientViewingEnvironmentKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferCGColorSpaceKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaLocationBottomFieldKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaLocationTopFieldKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaLocation_Bottom: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaLocation_BottomLeft: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaLocation_Center: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaLocation_DV420: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaLocation_Left: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaLocation_Top: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaLocation_TopLeft: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaSubsamplingKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaSubsampling_411: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaSubsampling_420: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferChromaSubsampling_422: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferCleanApertureHeightKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferCleanApertureHorizontalOffsetKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferCleanApertureKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferCleanApertureVerticalOffsetKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferCleanApertureWidthKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferColorPrimariesKey: string;

/**
 * @since 9.0
 */
declare var kCVImageBufferColorPrimaries_DCI_P3: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferColorPrimaries_EBU_3213: string;

/**
 * @since 9.0
 */
declare var kCVImageBufferColorPrimaries_ITU_R_2020: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferColorPrimaries_ITU_R_709_2: string;

/**
 * @since 6.0
 */
declare var kCVImageBufferColorPrimaries_P22: string;

/**
 * @since 9.0
 */
declare var kCVImageBufferColorPrimaries_P3_D65: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferColorPrimaries_SMPTE_C: string;

/**
 * @since 11.0
 */
declare var kCVImageBufferContentLightLevelInfoKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferDisplayDimensionsKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferDisplayHeightKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferDisplayWidthKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferFieldCountKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferFieldDetailKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferFieldDetailSpatialFirstLineEarly: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferFieldDetailSpatialFirstLineLate: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferFieldDetailTemporalBottomFirst: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferFieldDetailTemporalTopFirst: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferGammaLevelKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferICCProfileKey: string;

/**
 * @since 17.2
 */
declare var kCVImageBufferLogTransferFunctionKey: string;

/**
 * @since 17.2
 */
declare var kCVImageBufferLogTransferFunction_AppleLog: string;

/**
 * @since 11.0
 */
declare var kCVImageBufferMasteringDisplayColorVolumeKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferPixelAspectRatioHorizontalSpacingKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferPixelAspectRatioKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferPixelAspectRatioVerticalSpacingKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferPreferredCleanApertureKey: string;

/**
 * @since 15.0
 */
declare var kCVImageBufferRegionOfInterestKey: string;

/**
 * @since 18.0
 */
declare var kCVImageBufferSceneIlluminationKey: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferTransferFunctionKey: string;

/**
 * @since 9.0
 */
declare var kCVImageBufferTransferFunction_ITU_R_2020: string;

/**
 * @since 11.0
 */
declare var kCVImageBufferTransferFunction_ITU_R_2100_HLG: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferTransferFunction_ITU_R_709_2: string;

/**
 * @since 12.0
 */
declare var kCVImageBufferTransferFunction_Linear: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferTransferFunction_SMPTE_240M_1995: string;

/**
 * @since 11.0
 */
declare var kCVImageBufferTransferFunction_SMPTE_ST_2084_PQ: string;

/**
 * @since 10.0
 */
declare var kCVImageBufferTransferFunction_SMPTE_ST_428_1: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferTransferFunction_UseGamma: string;

/**
 * @since 11.0
 */
declare var kCVImageBufferTransferFunction_sRGB: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferYCbCrMatrixKey: string;

/**
 * @since 9.0
 * @deprecated 14.0
 */
declare var kCVImageBufferYCbCrMatrix_DCI_P3: string;

/**
 * @since 9.0
 */
declare var kCVImageBufferYCbCrMatrix_ITU_R_2020: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferYCbCrMatrix_ITU_R_601_4: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferYCbCrMatrix_ITU_R_709_2: string;

/**
 * @since 9.0
 * @deprecated 14.0
 */
declare var kCVImageBufferYCbCrMatrix_P3_D65: string;

/**
 * @since 4.0
 */
declare var kCVImageBufferYCbCrMatrix_SMPTE_240M_1995: string;

declare var kCVIndefiniteTime: CVTime;

/**
 * @since 18.0
 */
declare var kCVMetalBufferCacheMaximumBufferAgeKey: string;

/**
 * @since 8.0
 */
declare var kCVMetalTextureCacheMaximumTextureAgeKey: string;

/**
 * @since 13.0
 */
declare var kCVMetalTextureStorageMode: string;

/**
 * @since 11.0
 */
declare var kCVMetalTextureUsage: string;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare var kCVOpenGLESTextureCacheMaximumTextureAgeKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferBytesPerRowAlignmentKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferCGBitmapContextCompatibilityKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferCGImageCompatibilityKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferExtendedPixelsBottomKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferExtendedPixelsLeftKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferExtendedPixelsRightKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferExtendedPixelsTopKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferHeightKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferIOSurfaceCoreAnimationCompatibilityKey: string;

/**
 * @since 5.0
 */
declare var kCVPixelBufferIOSurfaceOpenGLESFBOCompatibilityKey: string;

/**
 * @since 5.0
 */
declare var kCVPixelBufferIOSurfaceOpenGLESTextureCompatibilityKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferIOSurfacePropertiesKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferMemoryAllocatorKey: string;

/**
 * @since 8.0
 */
declare var kCVPixelBufferMetalCompatibilityKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferOpenGLCompatibilityKey: string;

/**
 * @since 6.0
 */
declare var kCVPixelBufferOpenGLESCompatibilityKey: string;

/**
 * @since 9.0
 */
declare var kCVPixelBufferOpenGLESTextureCacheCompatibilityKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferPixelFormatTypeKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferPlaneAlignmentKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferPoolAllocationThresholdKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferPoolFreeBufferNotification: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferPoolMaximumBufferAgeKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferPoolMinimumBufferCountKey: string;

/**
 * @since 14.0
 */
declare var kCVPixelBufferProResRAWKey_BlackLevel: string;

/**
 * @since 14.0
 */
declare var kCVPixelBufferProResRAWKey_ColorMatrix: string;

/**
 * @since 14.0
 */
declare var kCVPixelBufferProResRAWKey_GainFactor: string;

/**
 * @since 15.0
 */
declare var kCVPixelBufferProResRAWKey_MetadataExtension: string;

/**
 * @since 14.0
 */
declare var kCVPixelBufferProResRAWKey_RecommendedCrop: string;

/**
 * @since 14.0
 */
declare var kCVPixelBufferProResRAWKey_SenselSitingOffsets: string;

/**
 * @since 14.0
 */
declare var kCVPixelBufferProResRAWKey_WhiteBalanceBlueFactor: string;

/**
 * @since 14.0
 */
declare var kCVPixelBufferProResRAWKey_WhiteBalanceCCT: string;

/**
 * @since 14.0
 */
declare var kCVPixelBufferProResRAWKey_WhiteBalanceRedFactor: string;

/**
 * @since 14.0
 */
declare var kCVPixelBufferProResRAWKey_WhiteLevel: string;

/**
 * @since 14.0
 */
declare var kCVPixelBufferVersatileBayerKey_BayerPattern: string;

/**
 * @since 4.0
 */
declare var kCVPixelBufferWidthKey: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatBitsPerBlock: string;

/**
 * @since 18.0
 */
declare var kCVPixelFormatBitsPerComponent: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatBlackBlock: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatBlockHeight: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatBlockHorizontalAlignment: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatBlockVerticalAlignment: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatBlockWidth: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatCGBitmapContextCompatibility: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatCGBitmapInfo: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatCGImageCompatibility: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatCodecType: string;

/**
 * @since 9.0
 */
declare var kCVPixelFormatComponentRange: string;

/**
 * @since 9.0
 */
declare var kCVPixelFormatComponentRange_FullRange: string;

/**
 * @since 9.0
 */
declare var kCVPixelFormatComponentRange_VideoRange: string;

/**
 * @since 9.0
 */
declare var kCVPixelFormatComponentRange_WideRange: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatConstant: string;

/**
 * @since 4.3
 */
declare var kCVPixelFormatContainsAlpha: string;

/**
 * @since 12.0
 */
declare var kCVPixelFormatContainsGrayscale: string;

/**
 * @since 8.0
 */
declare var kCVPixelFormatContainsRGB: string;

/**
 * @since 16.0
 */
declare var kCVPixelFormatContainsSenselArray: string;

/**
 * @since 8.0
 */
declare var kCVPixelFormatContainsYCbCr: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatFillExtendedPixelsCallback: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatFourCC: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatHorizontalSubsampling: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatName: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatOpenGLCompatibility: string;

/**
 * @since 5.0
 */
declare var kCVPixelFormatOpenGLESCompatibility: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatOpenGLFormat: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatOpenGLInternalFormat: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatOpenGLType: string;

/**
 * @since 4.0
 */
declare var kCVPixelFormatPlanes: string;

/**
 * @since 4.0
 */
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

declare const kCVPixelFormatType_16VersatileBayer: number;

declare const kCVPixelFormatType_1IndexedGray_WhiteIsZero: number;

declare const kCVPixelFormatType_1Monochrome: number;

declare const kCVPixelFormatType_24BGR: number;

declare const kCVPixelFormatType_24RGB: number;

declare const kCVPixelFormatType_2Indexed: number;

declare const kCVPixelFormatType_2IndexedGray_WhiteIsZero: number;

declare const kCVPixelFormatType_30RGB: number;

declare const kCVPixelFormatType_30RGBLEPackedWideGamut: number;

declare const kCVPixelFormatType_30RGB_r210: number;

declare const kCVPixelFormatType_32ABGR: number;

declare const kCVPixelFormatType_32ARGB: number;

declare const kCVPixelFormatType_32AlphaGray: number;

declare const kCVPixelFormatType_32BGRA: number;

declare const kCVPixelFormatType_32RGBA: number;

declare const kCVPixelFormatType_40ARGBLEWideGamut: number;

declare const kCVPixelFormatType_40ARGBLEWideGamutPremultiplied: number;

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

declare const kCVPixelFormatType_422YpCbCr16BiPlanarVideoRange: number;

declare const kCVPixelFormatType_422YpCbCr8: number;

declare const kCVPixelFormatType_422YpCbCr8BiPlanarFullRange: number;

declare const kCVPixelFormatType_422YpCbCr8BiPlanarVideoRange: number;

declare const kCVPixelFormatType_422YpCbCr8FullRange: number;

declare const kCVPixelFormatType_422YpCbCr8_yuvs: number;

declare const kCVPixelFormatType_422YpCbCr_4A_8BiPlanar: number;

declare const kCVPixelFormatType_4444AYpCbCr16: number;

declare const kCVPixelFormatType_4444AYpCbCr8: number;

declare const kCVPixelFormatType_4444AYpCbCrFloat: number;

declare const kCVPixelFormatType_4444YpCbCrA8: number;

declare const kCVPixelFormatType_4444YpCbCrA8R: number;

declare const kCVPixelFormatType_444YpCbCr10: number;

declare const kCVPixelFormatType_444YpCbCr10BiPlanarFullRange: number;

declare const kCVPixelFormatType_444YpCbCr10BiPlanarVideoRange: number;

declare const kCVPixelFormatType_444YpCbCr16BiPlanarVideoRange: number;

declare const kCVPixelFormatType_444YpCbCr16VideoRange_16A_TriPlanar: number;

declare const kCVPixelFormatType_444YpCbCr8: number;

declare const kCVPixelFormatType_444YpCbCr8BiPlanarFullRange: number;

declare const kCVPixelFormatType_444YpCbCr8BiPlanarVideoRange: number;

declare const kCVPixelFormatType_48RGB: number;

declare const kCVPixelFormatType_4Indexed: number;

declare const kCVPixelFormatType_4IndexedGray_WhiteIsZero: number;

declare const kCVPixelFormatType_64ARGB: number;

declare const kCVPixelFormatType_64RGBAHalf: number;

declare const kCVPixelFormatType_64RGBALE: number;

declare const kCVPixelFormatType_64RGBA_DownscaledProResRAW: number;

declare const kCVPixelFormatType_8Indexed: number;

declare const kCVPixelFormatType_8IndexedGray_WhiteIsZero: number;

declare const kCVPixelFormatType_ARGB2101010LEPacked: number;

declare const kCVPixelFormatType_DepthFloat16: number;

declare const kCVPixelFormatType_DepthFloat32: number;

declare const kCVPixelFormatType_DisparityFloat16: number;

declare const kCVPixelFormatType_DisparityFloat32: number;

declare const kCVPixelFormatType_Lossless_32BGRA: number;

declare const kCVPixelFormatType_Lossless_420YpCbCr10PackedBiPlanarFullRange: number;

declare const kCVPixelFormatType_Lossless_420YpCbCr10PackedBiPlanarVideoRange: number;

declare const kCVPixelFormatType_Lossless_420YpCbCr8BiPlanarFullRange: number;

declare const kCVPixelFormatType_Lossless_420YpCbCr8BiPlanarVideoRange: number;

declare const kCVPixelFormatType_Lossless_422YpCbCr10PackedBiPlanarVideoRange: number;

declare const kCVPixelFormatType_Lossless_64RGBAHalf: number;

declare const kCVPixelFormatType_Lossy_32BGRA: number;

declare const kCVPixelFormatType_Lossy_420YpCbCr10PackedBiPlanarVideoRange: number;

declare const kCVPixelFormatType_Lossy_420YpCbCr8BiPlanarFullRange: number;

declare const kCVPixelFormatType_Lossy_420YpCbCr8BiPlanarVideoRange: number;

declare const kCVPixelFormatType_Lossy_422YpCbCr10PackedBiPlanarVideoRange: number;

declare const kCVPixelFormatType_OneComponent10: number;

declare const kCVPixelFormatType_OneComponent12: number;

declare const kCVPixelFormatType_OneComponent16: number;

declare const kCVPixelFormatType_OneComponent16Half: number;

declare const kCVPixelFormatType_OneComponent32Float: number;

declare const kCVPixelFormatType_OneComponent8: number;

declare const kCVPixelFormatType_TwoComponent16: number;

declare const kCVPixelFormatType_TwoComponent16Half: number;

declare const kCVPixelFormatType_TwoComponent32Float: number;

declare const kCVPixelFormatType_TwoComponent8: number;

/**
 * @since 4.0
 */
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

declare const kCVVersatileBayer_BayerPattern_BGGR: number;

declare const kCVVersatileBayer_BayerPattern_GBRG: number;

declare const kCVVersatileBayer_BayerPattern_GRBG: number;

declare const kCVVersatileBayer_BayerPattern_RGGB: number;

declare var kCVZeroTime: CVTime;
