
/**
 * @since 8.0
 */
declare function VTCompressionSessionBeginPass(session: any, beginPassFlags: VTCompressionSessionOptionFlags, reserved: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 8.0
 */
declare function VTCompressionSessionCompleteFrames(session: any, completeUntilPresentationTimeStamp: CMTime): number;

/**
 * @since 8.0
 */
declare function VTCompressionSessionCreate(allocator: any, width: number, height: number, codecType: number, encoderSpecification: NSDictionary<any, any>, sourceImageBufferAttributes: NSDictionary<any, any>, compressedDataAllocator: any, outputCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: VTEncodeInfoFlags, p5: any) => void>, outputCallbackRefCon: interop.Pointer | interop.Reference<any>, compressionSessionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function VTCompressionSessionEncodeFrame(session: any, imageBuffer: any, presentationTimeStamp: CMTime, duration: CMTime, frameProperties: NSDictionary<any, any>, sourceFrameRefcon: interop.Pointer | interop.Reference<any>, infoFlagsOut: interop.Pointer | interop.Reference<VTEncodeInfoFlags>): number;

/**
 * @since 9.0
 */
declare function VTCompressionSessionEncodeFrameWithOutputHandler(session: any, imageBuffer: any, presentationTimeStamp: CMTime, duration: CMTime, frameProperties: NSDictionary<any, any>, infoFlagsOut: interop.Pointer | interop.Reference<VTEncodeInfoFlags>, outputHandler: (p1: number, p2: VTEncodeInfoFlags, p3: any) => void): number;

/**
 * @since 17.0
 */
declare function VTCompressionSessionEncodeMultiImageFrame(session: any, taggedBufferGroup: any, presentationTimeStamp: CMTime, duration: CMTime, frameProperties: NSDictionary<any, any>, sourceFrameRefcon: interop.Pointer | interop.Reference<any>, infoFlagsOut: interop.Pointer | interop.Reference<VTEncodeInfoFlags>): number;

/**
 * @since 17.0
 */
declare function VTCompressionSessionEncodeMultiImageFrameWithOutputHandler(session: any, taggedBufferGroup: any, presentationTimeStamp: CMTime, duration: CMTime, frameProperties: NSDictionary<any, any>, infoFlagsOut: interop.Pointer | interop.Reference<VTEncodeInfoFlags>, outputHandler: (p1: number, p2: VTEncodeInfoFlags, p3: any) => void): number;

/**
 * @since 8.0
 */
declare function VTCompressionSessionEndPass(session: any, furtherPassesRequestedOut: string | interop.Pointer | interop.Reference<any>, reserved: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 8.0
 */
declare function VTCompressionSessionGetPixelBufferPool(session: any): any;

/**
 * @since 8.0
 */
declare function VTCompressionSessionGetTimeRangesForNextPass(session: any, timeRangeCountOut: interop.Pointer | interop.Reference<number>, timeRangeArrayOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<CMTimeRange>>): number;

/**
 * @since 8.0
 */
declare function VTCompressionSessionGetTypeID(): number;

/**
 * @since 8.0
 */
declare function VTCompressionSessionInvalidate(session: any): void;

/**
 * @since 8.0
 */
declare const enum VTCompressionSessionOptionFlags {

	kVTCompressionSessionBeginFinalPass = 1
}

/**
 * @since 8.0
 */
declare function VTCompressionSessionPrepareToEncodeFrames(session: any): number;

/**
 * @since 11.0
 */
declare function VTCopySupportedPropertyDictionaryForEncoder(width: number, height: number, codecType: number, encoderSpecification: NSDictionary<any, any>, encoderIDOut: interop.Pointer | interop.Reference<string>, supportedPropertiesOut: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

/**
 * @since 8.0
 */
declare function VTCopyVideoEncoderList(options: NSDictionary<any, any>, listOfVideoEncodersOut: interop.Pointer | interop.Reference<NSArray<any>>): number;

/**
 * @since 9.0
 */
declare function VTCreateCGImageFromCVPixelBuffer(pixelBuffer: any, options: NSDictionary<any, any>, imageOut: interop.Pointer | interop.Reference<any>): number;

declare const enum VTDecodeFrameFlags {

	kVTDecodeFrame_EnableAsynchronousDecompression = 1,

	kVTDecodeFrame_DoNotOutputFrame = 2,

	kVTDecodeFrame_1xRealTimePlayback = 4,

	kVTDecodeFrame_EnableTemporalProcessing = 8
}

declare const enum VTDecodeInfoFlags {

	kVTDecodeInfo_Asynchronous = 1,

	kVTDecodeInfo_FrameDropped = 2,

	kVTDecodeInfo_ImageBufferModifiable = 4,

	kVTDecodeInfo_SkippedLeadingFrameDropped = 8
}

/**
 * @since 8.0
 */
interface VTDecompressionOutputCallbackRecord {
	decompressionOutputCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: VTDecodeInfoFlags, p5: any, p6: CMTime, p7: CMTime) => void>;
	decompressionOutputRefCon: interop.Pointer | interop.Reference<any>;
}
declare var VTDecompressionOutputCallbackRecord: interop.StructType<VTDecompressionOutputCallbackRecord>;

/**
 * @since 8.0
 */
declare function VTDecompressionSessionCanAcceptFormatDescription(session: any, newFormatDesc: any): boolean;

/**
 * @since 8.0
 */
declare function VTDecompressionSessionCopyBlackPixelBuffer(session: any, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function VTDecompressionSessionCreate(allocator: any, videoFormatDescription: any, videoDecoderSpecification: NSDictionary<any, any>, destinationImageBufferAttributes: NSDictionary<any, any>, outputCallback: interop.Pointer | interop.Reference<VTDecompressionOutputCallbackRecord>, decompressionSessionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function VTDecompressionSessionDecodeFrame(session: any, sampleBuffer: any, decodeFlags: VTDecodeFrameFlags, sourceFrameRefCon: interop.Pointer | interop.Reference<any>, infoFlagsOut: interop.Pointer | interop.Reference<VTDecodeInfoFlags>): number;

/**
 * @since 17.0
 */
declare function VTDecompressionSessionDecodeFrameWithMultiImageCapableOutputHandler(session: any, sampleBuffer: any, decodeFlags: VTDecodeFrameFlags, infoFlagsOut: interop.Pointer | interop.Reference<VTDecodeInfoFlags>, multiImageCapableOutputHandler: (p1: number, p2: VTDecodeInfoFlags, p3: any, p4: any, p5: CMTime, p6: CMTime) => void): number;

/**
 * @since 9.0
 */
declare function VTDecompressionSessionDecodeFrameWithOutputHandler(session: any, sampleBuffer: any, decodeFlags: VTDecodeFrameFlags, infoFlagsOut: interop.Pointer | interop.Reference<VTDecodeInfoFlags>, outputHandler: (p1: number, p2: VTDecodeInfoFlags, p3: any, p4: CMTime, p5: CMTime) => void): number;

/**
 * @since 8.0
 */
declare function VTDecompressionSessionFinishDelayedFrames(session: any): number;

/**
 * @since 8.0
 */
declare function VTDecompressionSessionGetTypeID(): number;

/**
 * @since 8.0
 */
declare function VTDecompressionSessionInvalidate(session: any): void;

/**
 * @since 17.0
 */
declare function VTDecompressionSessionSetMultiImageCallback(decompressionSession: any, outputMultiImageCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: VTDecodeInfoFlags, p5: any, p6: CMTime, p7: CMTime) => void>, outputMultiImageRefcon: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function VTDecompressionSessionWaitForAsynchronousFrames(session: any): number;

declare const enum VTEncodeInfoFlags {

	kVTEncodeInfo_Asynchronous = 1,

	kVTEncodeInfo_FrameDropped = 2
}

/**
 * @since 8.0
 */
declare function VTFrameSiloAddSampleBuffer(silo: any, sampleBuffer: any): number;

/**
 * @since 8.0
 */
declare function VTFrameSiloCallBlockForEachSampleBuffer(silo: any, timeRange: CMTimeRange, handler: (p1: any) => number): number;

/**
 * @since 8.0
 */
declare function VTFrameSiloCallFunctionForEachSampleBuffer(silo: any, timeRange: CMTimeRange, refcon: interop.Pointer | interop.Reference<any>, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: any) => number>): number;

/**
 * @since 8.0
 */
declare function VTFrameSiloCreate(allocator: any, fileURL: NSURL, timeRange: CMTimeRange, options: NSDictionary<any, any>, frameSiloOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function VTFrameSiloGetProgressOfCurrentPass(silo: any, progressOut: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 8.0
 */
declare function VTFrameSiloGetTypeID(): number;

/**
 * @since 8.0
 */
declare function VTFrameSiloSetTimeRangesForNextPass(silo: any, timeRangeCount: number, timeRangeArray: interop.Pointer | interop.Reference<CMTimeRange>): number;

/**
 * @since 18.0
 */
declare function VTHDRPerFrameMetadataGenerationSessionAttachMetadata(hdrPerFrameMetadataGenerationSession: any, pixelBuffer: any, sceneChange: boolean): number;

/**
 * @since 18.0
 */
declare function VTHDRPerFrameMetadataGenerationSessionCreate(allocator: any, framesPerSecond: number, options: NSDictionary<any, any>, hdrPerFrameMetadataGenerationSessionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 18.0
 */
declare function VTHDRPerFrameMetadataGenerationSessionGetTypeID(): number;

interface VTInt32Point {
	x: number;
	y: number;
}
declare var VTInt32Point: interop.StructType<VTInt32Point>;

interface VTInt32Size {
	width: number;
	height: number;
}
declare var VTInt32Size: interop.StructType<VTInt32Size>;

/**
 * @since 11.0
 */
declare function VTIsHardwareDecodeSupported(codecType: number): boolean;

/**
 * @since 17.0
 */
declare function VTIsStereoMVHEVCDecodeSupported(): boolean;

/**
 * @since 17.0
 */
declare function VTIsStereoMVHEVCEncodeSupported(): boolean;

/**
 * @since 8.0
 */
declare function VTMultiPassStorageClose(multiPassStorage: any): number;

/**
 * @since 8.0
 */
declare function VTMultiPassStorageCreate(allocator: any, fileURL: NSURL, timeRange: CMTimeRange, options: NSDictionary<any, any>, multiPassStorageOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function VTMultiPassStorageGetTypeID(): number;

/**
 * @since 16.0
 */
declare function VTPixelRotationSessionCreate(allocator: any, pixelRotationSessionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 16.0
 */
declare function VTPixelRotationSessionGetTypeID(): number;

/**
 * @since 16.0
 */
declare function VTPixelRotationSessionInvalidate(session: any): void;

/**
 * @since 16.0
 */
declare function VTPixelRotationSessionRotateImage(session: any, sourceBuffer: any, destinationBuffer: any): number;

/**
 * @since 16.0
 */
declare function VTPixelTransferSessionCreate(allocator: any, pixelTransferSessionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 16.0
 */
declare function VTPixelTransferSessionGetTypeID(): number;

/**
 * @since 16.0
 */
declare function VTPixelTransferSessionInvalidate(session: any): void;

/**
 * @since 16.0
 */
declare function VTPixelTransferSessionTransferImage(session: any, sourceBuffer: any, destinationBuffer: any): number;

/**
 * @since 8.0
 */
declare function VTSessionCopyProperty(session: any, propertyKey: string, allocator: any, propertyValueOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function VTSessionCopySerializableProperties(session: any, allocator: any, dictionaryOut: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

/**
 * @since 8.0
 */
declare function VTSessionCopySupportedPropertyDictionary(session: any, supportedPropertyDictionaryOut: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

/**
 * @since 8.0
 */
declare function VTSessionSetProperties(session: any, propertyDictionary: NSDictionary<any, any>): number;

/**
 * @since 8.0
 */
declare function VTSessionSetProperty(session: any, propertyKey: string, propertyValue: any): number;

declare const kVTAllocationFailedErr: number;

/**
 * @since 13.0
 */
declare var kVTAlphaChannelMode_PremultipliedAlpha: string;

/**
 * @since 13.0
 */
declare var kVTAlphaChannelMode_StraightAlpha: string;

declare const kVTColorCorrectionImageRotationFailedErr: number;

declare const kVTColorCorrectionPixelTransferFailedErr: number;

declare const kVTColorSyncTransformConvertFailedErr: number;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_AllowFrameReordering: string;

/**
 * @since 12.0
 */
declare var kVTCompressionPropertyKey_AllowOpenGOP: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_AllowTemporalCompression: string;

/**
 * @since 13.0
 */
declare var kVTCompressionPropertyKey_AlphaChannelMode: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_AspectRatio16x9: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_AverageBitRate: string;

/**
 * @since 15.0
 */
declare var kVTCompressionPropertyKey_BaseLayerBitRateFraction: string;

/**
 * @since 11.0
 */
declare var kVTCompressionPropertyKey_BaseLayerFrameRate: string;

/**
 * @since 14.5
 */
declare var kVTCompressionPropertyKey_BaseLayerFrameRateFraction: string;

/**
 * @since 17.4
 */
declare var kVTCompressionPropertyKey_CalculateMeanSquaredError: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_CleanAperture: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_ColorPrimaries: string;

/**
 * @since 16.0
 */
declare var kVTCompressionPropertyKey_ConstantBitRate: string;

/**
 * @since 11.0
 */
declare var kVTCompressionPropertyKey_ContentLightLevelInfo: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_DataRateLimits: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_Depth: string;

/**
 * @since 15.0
 */
declare var kVTCompressionPropertyKey_EnableLTR: string;

/**
 * @since 11.0
 */
declare var kVTCompressionPropertyKey_EncoderID: string;

/**
 * @since 16.0
 */
declare var kVTCompressionPropertyKey_EstimatedAverageBytesPerFrame: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_ExpectedDuration: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_ExpectedFrameRate: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_FieldCount: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_FieldDetail: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_GammaLevel: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_H264EntropyMode: string;

/**
 * @since 14.0
 */
declare var kVTCompressionPropertyKey_HDRMetadataInsertionMode: string;

/**
 * @since 17.0
 */
declare var kVTCompressionPropertyKey_HasLeftStereoEyeView: string;

/**
 * @since 17.0
 */
declare var kVTCompressionPropertyKey_HasRightStereoEyeView: string;

/**
 * @since 17.0
 */
declare var kVTCompressionPropertyKey_HeroEye: string;

/**
 * @since 17.0
 */
declare var kVTCompressionPropertyKey_HorizontalDisparityAdjustment: string;

/**
 * @since 17.4
 */
declare var kVTCompressionPropertyKey_HorizontalFieldOfView: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_ICCProfile: string;

/**
 * @since 17.0
 */
declare var kVTCompressionPropertyKey_MVHEVCLeftAndRightViewIDs: string;

/**
 * @since 17.0
 */
declare var kVTCompressionPropertyKey_MVHEVCVideoLayerIDs: string;

/**
 * @since 17.0
 */
declare var kVTCompressionPropertyKey_MVHEVCViewIDs: string;

/**
 * @since 11.0
 */
declare var kVTCompressionPropertyKey_MasteringDisplayColorVolume: string;

/**
 * @since 15.0
 */
declare var kVTCompressionPropertyKey_MaxAllowedFrameQP: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_MaxFrameDelayCount: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_MaxH264SliceBytes: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_MaxKeyFrameInterval: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_MaxKeyFrameIntervalDuration: string;

/**
 * @since 12.0
 */
declare var kVTCompressionPropertyKey_MaximizePowerEfficiency: string;

/**
 * @since 18.0
 */
declare var kVTCompressionPropertyKey_MaximumRealTimeFrameRate: string;

/**
 * @since 16.0
 */
declare var kVTCompressionPropertyKey_MinAllowedFrameQP: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_MoreFramesAfterEnd: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_MoreFramesBeforeStart: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_MultiPassStorage: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_NumberOfPendingFrames: string;

/**
 * @since 15.4
 */
declare var kVTCompressionPropertyKey_OutputBitDepth: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_PixelAspectRatio: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_PixelBufferPoolIsShared: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_PixelTransferProperties: string;

/**
 * @since 16.0
 */
declare var kVTCompressionPropertyKey_PreserveAlphaChannel: string;

/**
 * @since 14.0
 */
declare var kVTCompressionPropertyKey_PreserveDynamicHDRMetadata: string;

/**
 * @since 14.0
 */
declare var kVTCompressionPropertyKey_PrioritizeEncodingSpeedOverQuality: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_ProfileLevel: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_ProgressiveScan: string;

/**
 * @since 18.0
 */
declare var kVTCompressionPropertyKey_ProjectionKind: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_Quality: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_RealTime: string;

/**
 * @since 16.0
 */
declare var kVTCompressionPropertyKey_ReferenceBufferCount: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_SourceFrameCount: string;

/**
 * @since 17.0
 */
declare var kVTCompressionPropertyKey_StereoCameraBaseline: string;

/**
 * @since 15.0
 */
declare var kVTCompressionPropertyKey_SupportsBaseFrameQP: string;

/**
 * @since 13.0
 */
declare var kVTCompressionPropertyKey_TargetQualityForAlpha: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_TransferFunction: string;

/**
 * @since 13.0
 */
declare var kVTCompressionPropertyKey_UsingGPURegistryID: string;

/**
 * @since 17.4
 */
declare var kVTCompressionPropertyKey_UsingHardwareAcceleratedVideoEncoder: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_VideoEncoderPixelBufferAttributes: string;

/**
 * @since 18.0
 */
declare var kVTCompressionPropertyKey_ViewPackingKind: string;

/**
 * @since 8.0
 */
declare var kVTCompressionPropertyKey_YCbCrMatrix: string;

declare const kVTCouldNotCreateColorCorrectionDataErr: number;

declare const kVTCouldNotCreateInstanceErr: number;

declare const kVTCouldNotFindExtensionErr: number;

declare const kVTCouldNotFindTemporalFilterErr: number;

declare const kVTCouldNotFindVideoDecoderErr: number;

declare const kVTCouldNotFindVideoEncoderErr: number;

declare const kVTCouldNotOutputTaggedBufferGroupErr: number;

/**
 * @since 18.0
 */
declare var kVTDecompressionPropertyKey_AllowBitstreamToChangeFrameDimensions: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_ContentHasInterframeDependencies: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_DeinterlaceMode: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_FieldMode: string;

/**
 * @since 17.0
 */
declare var kVTDecompressionPropertyKey_GeneratePerFrameHDRDisplayMetadata: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_MaxOutputPresentationTimeStampOfFramesBeingDecoded: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_MaximizePowerEfficiency: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_MinOutputPresentationTimeStampOfFramesBeingDecoded: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_NumberOfFramesBeingDecoded: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_OnlyTheseFrames: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_OutputPoolRequestedMinimumBufferCount: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_PixelBufferPool: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_PixelBufferPoolIsShared: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_PixelFormatsWithReducedResolutionSupport: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_PixelTransferProperties: string;

/**
 * @since 14.0
 */
declare var kVTDecompressionPropertyKey_PropagatePerFrameHDRDisplayMetadata: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_RealTime: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_ReducedCoefficientDecode: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_ReducedFrameDelivery: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_ReducedResolutionDecode: string;

/**
 * @since 17.0
 */
declare var kVTDecompressionPropertyKey_RequestedMVHEVCVideoLayerIDs: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_SuggestedQualityOfServiceTiers: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_SupportedPixelFormatsOrderedByPerformance: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_SupportedPixelFormatsOrderedByQuality: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionPropertyKey_ThreadCount: string;

/**
 * @since 13.0
 */
declare var kVTDecompressionPropertyKey_UsingGPURegistryID: string;

/**
 * @since 17.0
 */
declare var kVTDecompressionPropertyKey_UsingHardwareAcceleratedVideoDecoder: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_DeinterlaceMode_Temporal: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_DeinterlaceMode_VerticalFilter: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_FieldMode_BothFields: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_FieldMode_BottomFieldOnly: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_FieldMode_DeinterlaceFields: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_FieldMode_SingleField: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_FieldMode_TopFieldOnly: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_OnlyTheseFrames_AllFrames: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_OnlyTheseFrames_IFrames: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_OnlyTheseFrames_KeyFrames: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionProperty_OnlyTheseFrames_NonDroppableFrames: string;

/**
 * @since 11.0
 */
declare var kVTDecompressionProperty_TemporalLevelLimit: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionResolutionKey_Height: string;

/**
 * @since 8.0
 */
declare var kVTDecompressionResolutionKey_Width: string;

/**
 * @since 9.0
 */
declare var kVTDownsamplingMode_Average: string;

/**
 * @since 9.0
 */
declare var kVTDownsamplingMode_Decimate: string;

/**
 * @since 15.0
 */
declare var kVTEncodeFrameOptionKey_AcknowledgedLTRTokens: string;

/**
 * @since 15.0
 */
declare var kVTEncodeFrameOptionKey_BaseFrameQP: string;

/**
 * @since 8.0
 */
declare var kVTEncodeFrameOptionKey_ForceKeyFrame: string;

/**
 * @since 15.0
 */
declare var kVTEncodeFrameOptionKey_ForceLTRRefresh: string;

declare const kVTExtensionConflictErr: number;

declare const kVTExtensionDisabledErr: number;

declare const kVTFormatDescriptionChangeNotSupportedErr: number;

declare const kVTFrameSiloInvalidTimeRangeErr: number;

declare const kVTFrameSiloInvalidTimeStampErr: number;

/**
 * @since 8.0
 */
declare var kVTH264EntropyMode_CABAC: string;

/**
 * @since 8.0
 */
declare var kVTH264EntropyMode_CAVLC: string;

/**
 * @since 14.0
 */
declare var kVTHDRMetadataInsertionMode_Auto: string;

/**
 * @since 14.0
 */
declare var kVTHDRMetadataInsertionMode_None: string;

/**
 * @since 18.0
 */
declare var kVTHDRPerFrameMetadataGenerationHDRFormatType_DolbyVision: string;

/**
 * @since 18.0
 */
declare var kVTHDRPerFrameMetadataGenerationOptionsKey_HDRFormats: string;

declare const kVTImageRotationNotSupportedErr: number;

declare const kVTInsufficientSourceColorDataErr: number;

declare const kVTInvalidSessionErr: number;

/**
 * @since 8.0
 */
declare var kVTMultiPassStorageCreationOption_DoNotDelete: string;

declare const kVTMultiPassStorageIdentifierMismatchErr: number;

declare const kVTMultiPassStorageInvalidErr: number;

declare const kVTParameterErr: number;

declare const kVTPixelRotationNotSupportedErr: number;

/**
 * @since 16.0
 */
declare var kVTPixelRotationPropertyKey_FlipHorizontalOrientation: string;

/**
 * @since 16.0
 */
declare var kVTPixelRotationPropertyKey_FlipVerticalOrientation: string;

/**
 * @since 16.0
 */
declare var kVTPixelRotationPropertyKey_Rotation: string;

declare const kVTPixelTransferNotPermittedErr: number;

declare const kVTPixelTransferNotSupportedErr: number;

/**
 * @since 9.0
 */
declare var kVTPixelTransferPropertyKey_DestinationCleanAperture: string;

/**
 * @since 9.0
 */
declare var kVTPixelTransferPropertyKey_DestinationColorPrimaries: string;

/**
 * @since 9.0
 */
declare var kVTPixelTransferPropertyKey_DestinationICCProfile: string;

/**
 * @since 9.0
 */
declare var kVTPixelTransferPropertyKey_DestinationPixelAspectRatio: string;

/**
 * @since 9.0
 */
declare var kVTPixelTransferPropertyKey_DestinationTransferFunction: string;

/**
 * @since 9.0
 */
declare var kVTPixelTransferPropertyKey_DestinationYCbCrMatrix: string;

/**
 * @since 9.0
 */
declare var kVTPixelTransferPropertyKey_DownsamplingMode: string;

/**
 * @since 13.0
 */
declare var kVTPixelTransferPropertyKey_RealTime: string;

/**
 * @since 9.0
 */
declare var kVTPixelTransferPropertyKey_ScalingMode: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H263_Profile0_Level10: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H263_Profile0_Level45: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H263_Profile3_Level45: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_1_3: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_3_0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_3_1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_3_2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_4_0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_4_1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_4_2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_5_0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_5_1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_5_2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Baseline_AutoLevel: string;

/**
 * @since 15.0
 */
declare var kVTProfileLevel_H264_ConstrainedBaseline_AutoLevel: string;

/**
 * @since 15.0
 */
declare var kVTProfileLevel_H264_ConstrainedHigh_AutoLevel: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Extended_5_0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Extended_AutoLevel: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_High_3_0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_High_3_1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_High_3_2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_High_4_0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_High_4_1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_High_4_2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_High_5_0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_High_5_1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_High_5_2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_High_AutoLevel: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Main_3_0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Main_3_1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Main_3_2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Main_4_0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Main_4_1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Main_4_2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Main_5_0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Main_5_1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Main_5_2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_H264_Main_AutoLevel: string;

/**
 * @since 11.0
 */
declare var kVTProfileLevel_HEVC_Main10_AutoLevel: string;

/**
 * @since 15.4
 */
declare var kVTProfileLevel_HEVC_Main42210_AutoLevel: string;

/**
 * @since 11.0
 */
declare var kVTProfileLevel_HEVC_Main_AutoLevel: string;

/**
 * @since 13.0
 */
declare var kVTProfileLevel_HEVC_Monochrome10_AutoLevel: string;

/**
 * @since 11.0
 */
declare var kVTProfileLevel_HEVC_Monochrome_AutoLevel: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_AdvancedSimple_L0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_AdvancedSimple_L1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_AdvancedSimple_L2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_AdvancedSimple_L3: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_AdvancedSimple_L4: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_Main_L2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_Main_L3: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_Main_L4: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_Simple_L0: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_Simple_L1: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_Simple_L2: string;

/**
 * @since 8.0
 */
declare var kVTProfileLevel_MP4V_Simple_L3: string;

/**
 * @since 8.0
 */
declare var kVTPropertyDocumentationKey: string;

declare const kVTPropertyNotSupportedErr: number;

declare const kVTPropertyReadOnlyErr: number;

/**
 * @since 8.0
 */
declare var kVTPropertyReadWriteStatusKey: string;

/**
 * @since 8.0
 */
declare var kVTPropertyReadWriteStatus_ReadOnly: string;

/**
 * @since 8.0
 */
declare var kVTPropertyReadWriteStatus_ReadWrite: string;

/**
 * @since 8.0
 */
declare var kVTPropertyShouldBeSerializedKey: string;

/**
 * @since 8.0
 */
declare var kVTPropertySupportedValueListKey: string;

/**
 * @since 8.0
 */
declare var kVTPropertySupportedValueMaximumKey: string;

/**
 * @since 8.0
 */
declare var kVTPropertySupportedValueMinimumKey: string;

/**
 * @since 8.0
 */
declare var kVTPropertyTypeKey: string;

/**
 * @since 8.0
 */
declare var kVTPropertyType_Boolean: string;

/**
 * @since 8.0
 */
declare var kVTPropertyType_Enumeration: string;

/**
 * @since 8.0
 */
declare var kVTPropertyType_Number: string;

declare const kVTQPModulationLevel_Default: number;

declare const kVTQPModulationLevel_Disable: number;

/**
 * @since 16.0
 */
declare var kVTRotation_0: string;

/**
 * @since 16.0
 */
declare var kVTRotation_180: string;

/**
 * @since 16.0
 */
declare var kVTRotation_CCW90: string;

/**
 * @since 16.0
 */
declare var kVTRotation_CW90: string;

/**
 * @since 17.4
 */
declare var kVTSampleAttachmentKey_QualityMetrics: string;

/**
 * @since 15.0
 */
declare var kVTSampleAttachmentKey_RequireLTRAcknowledgementToken: string;

/**
 * @since 17.4
 */
declare var kVTSampleAttachmentQualityMetricsKey_ChromaBlueMeanSquaredError: string;

/**
 * @since 17.4
 */
declare var kVTSampleAttachmentQualityMetricsKey_ChromaRedMeanSquaredError: string;

/**
 * @since 17.4
 */
declare var kVTSampleAttachmentQualityMetricsKey_LumaMeanSquaredError: string;

/**
 * @since 9.0
 */
declare var kVTScalingMode_CropSourceToCleanAperture: string;

/**
 * @since 9.0
 */
declare var kVTScalingMode_Letterbox: string;

/**
 * @since 9.0
 */
declare var kVTScalingMode_Normal: string;

/**
 * @since 9.0
 */
declare var kVTScalingMode_Trim: string;

declare const kVTSessionMalfunctionErr: number;

declare const kVTUnlimitedFrameDelayCount: number;

declare const kVTVideoDecoderAuthorizationErr: number;

declare const kVTVideoDecoderBadDataErr: number;

declare const kVTVideoDecoderCallbackMessagingErr: number;

declare const kVTVideoDecoderMalfunctionErr: number;

declare const kVTVideoDecoderNeedsRosettaErr: number;

declare const kVTVideoDecoderNotAvailableNowErr: number;

declare const kVTVideoDecoderReferenceMissingErr: number;

declare const kVTVideoDecoderRemovedErr: number;

/**
 * @since 17.0
 */
declare var kVTVideoDecoderSpecification_EnableHardwareAcceleratedVideoDecoder: string;

/**
 * @since 11.3
 */
declare var kVTVideoDecoderSpecification_PreferredDecoderGPURegistryID: string;

/**
 * @since 17.0
 */
declare var kVTVideoDecoderSpecification_RequireHardwareAcceleratedVideoDecoder: string;

/**
 * @since 11.3
 */
declare var kVTVideoDecoderSpecification_RequiredDecoderGPURegistryID: string;

declare const kVTVideoDecoderUnknownErr: number;

declare const kVTVideoDecoderUnsupportedDataFormatErr: number;

declare const kVTVideoEncoderAuthorizationErr: number;

/**
 * @since 15.0
 */
declare var kVTVideoEncoderListOption_IncludeStandardDefinitionDVEncoders: string;

/**
 * @since 8.0
 */
declare var kVTVideoEncoderList_CodecName: string;

/**
 * @since 8.0
 */
declare var kVTVideoEncoderList_CodecType: string;

/**
 * @since 8.0
 */
declare var kVTVideoEncoderList_DisplayName: string;

/**
 * @since 8.0
 */
declare var kVTVideoEncoderList_EncoderID: string;

/**
 * @since 8.0
 */
declare var kVTVideoEncoderList_EncoderName: string;

/**
 * @since 13.0
 */
declare var kVTVideoEncoderList_GPURegistryID: string;

/**
 * @since 13.0
 */
declare var kVTVideoEncoderList_InstanceLimit: string;

/**
 * @since 13.0
 */
declare var kVTVideoEncoderList_IsHardwareAccelerated: string;

/**
 * @since 13.0
 */
declare var kVTVideoEncoderList_PerformanceRating: string;

/**
 * @since 13.0
 */
declare var kVTVideoEncoderList_QualityRating: string;

/**
 * @since 13.0
 */
declare var kVTVideoEncoderList_SupportedSelectionProperties: string;

/**
 * @since 14.0
 */
declare var kVTVideoEncoderList_SupportsFrameReordering: string;

declare const kVTVideoEncoderMVHEVCVideoLayerIDsMismatchErr: number;

declare const kVTVideoEncoderMalfunctionErr: number;

declare const kVTVideoEncoderNeedsRosettaErr: number;

declare const kVTVideoEncoderNotAvailableNowErr: number;

/**
 * @since 17.4
 */
declare var kVTVideoEncoderSpecification_EnableHardwareAcceleratedVideoEncoder: string;

/**
 * @since 14.5
 */
declare var kVTVideoEncoderSpecification_EnableLowLatencyRateControl: string;

/**
 * @since 8.0
 */
declare var kVTVideoEncoderSpecification_EncoderID: string;

/**
 * @since 13.0
 */
declare var kVTVideoEncoderSpecification_PreferredEncoderGPURegistryID: string;

/**
 * @since 17.4
 */
declare var kVTVideoEncoderSpecification_RequireHardwareAcceleratedVideoEncoder: string;

/**
 * @since 13.0
 */
declare var kVTVideoEncoderSpecification_RequiredEncoderGPURegistryID: string;
