
declare function VTCompressionSessionBeginPass(session: any, beginPassFlags: VTCompressionSessionOptionFlags, reserved: interop.Pointer | interop.Reference<number>): number;

declare function VTCompressionSessionCompleteFrames(session: any, completeUntilPresentationTimeStamp: CMTime): number;

declare function VTCompressionSessionCreate(allocator: any, width: number, height: number, codecType: number, encoderSpecification: NSDictionary<any, any>, sourceImageBufferAttributes: NSDictionary<any, any>, compressedDataAllocator: any, outputCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: VTEncodeInfoFlags, p5: any) => void>, outputCallbackRefCon: interop.Pointer | interop.Reference<any>, compressionSessionOut: interop.Pointer | interop.Reference<any>): number;

declare function VTCompressionSessionEncodeFrame(session: any, imageBuffer: any, presentationTimeStamp: CMTime, duration: CMTime, frameProperties: NSDictionary<any, any>, sourceFrameRefcon: interop.Pointer | interop.Reference<any>, infoFlagsOut: interop.Pointer | interop.Reference<VTEncodeInfoFlags>): number;

declare function VTCompressionSessionEncodeFrameWithOutputHandler(session: any, imageBuffer: any, presentationTimeStamp: CMTime, duration: CMTime, frameProperties: NSDictionary<any, any>, infoFlagsOut: interop.Pointer | interop.Reference<VTEncodeInfoFlags>, outputHandler: (p1: number, p2: VTEncodeInfoFlags, p3: any) => void): number;

declare function VTCompressionSessionEndPass(session: any, furtherPassesRequestedOut: string | interop.Pointer | interop.Reference<any>, reserved: interop.Pointer | interop.Reference<number>): number;

declare function VTCompressionSessionGetPixelBufferPool(session: any): any;

declare function VTCompressionSessionGetTimeRangesForNextPass(session: any, timeRangeCountOut: interop.Pointer | interop.Reference<number>, timeRangeArrayOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<CMTimeRange>>): number;

declare function VTCompressionSessionGetTypeID(): number;

declare function VTCompressionSessionInvalidate(session: any): void;

declare const enum VTCompressionSessionOptionFlags {

	kVTCompressionSessionBeginFinalPass = 1
}

declare function VTCompressionSessionPrepareToEncodeFrames(session: any): number;

declare function VTCopySupportedPropertyDictionaryForEncoder(width: number, height: number, codecType: number, encoderSpecification: NSDictionary<any, any>, encoderIDOut: interop.Pointer | interop.Reference<string>, supportedPropertiesOut: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

declare function VTCopyVideoEncoderList(options: NSDictionary<any, any>, listOfVideoEncodersOut: interop.Pointer | interop.Reference<NSArray<any>>): number;

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

	kVTDecodeInfo_ImageBufferModifiable = 4
}

interface VTDecompressionOutputCallbackRecord {
	decompressionOutputCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: VTDecodeInfoFlags, p5: any, p6: CMTime, p7: CMTime) => void>;
	decompressionOutputRefCon: interop.Pointer | interop.Reference<any>;
}
declare var VTDecompressionOutputCallbackRecord: interop.StructType<VTDecompressionOutputCallbackRecord>;

declare function VTDecompressionSessionCanAcceptFormatDescription(session: any, newFormatDesc: any): boolean;

declare function VTDecompressionSessionCopyBlackPixelBuffer(session: any, pixelBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function VTDecompressionSessionCreate(allocator: any, videoFormatDescription: any, videoDecoderSpecification: NSDictionary<any, any>, destinationImageBufferAttributes: NSDictionary<any, any>, outputCallback: interop.Pointer | interop.Reference<VTDecompressionOutputCallbackRecord>, decompressionSessionOut: interop.Pointer | interop.Reference<any>): number;

declare function VTDecompressionSessionDecodeFrame(session: any, sampleBuffer: any, decodeFlags: VTDecodeFrameFlags, sourceFrameRefCon: interop.Pointer | interop.Reference<any>, infoFlagsOut: interop.Pointer | interop.Reference<VTDecodeInfoFlags>): number;

declare function VTDecompressionSessionDecodeFrameWithOutputHandler(session: any, sampleBuffer: any, decodeFlags: VTDecodeFrameFlags, infoFlagsOut: interop.Pointer | interop.Reference<VTDecodeInfoFlags>, outputHandler: (p1: number, p2: VTDecodeInfoFlags, p3: any, p4: CMTime, p5: CMTime) => void): number;

declare function VTDecompressionSessionFinishDelayedFrames(session: any): number;

declare function VTDecompressionSessionGetTypeID(): number;

declare function VTDecompressionSessionInvalidate(session: any): void;

declare function VTDecompressionSessionWaitForAsynchronousFrames(session: any): number;

declare const enum VTEncodeInfoFlags {

	kVTEncodeInfo_Asynchronous = 1,

	kVTEncodeInfo_FrameDropped = 2
}

declare function VTFrameSiloAddSampleBuffer(silo: any, sampleBuffer: any): number;

declare function VTFrameSiloCallBlockForEachSampleBuffer(silo: any, timeRange: CMTimeRange, handler: (p1: any) => number): number;

declare function VTFrameSiloCallFunctionForEachSampleBuffer(silo: any, timeRange: CMTimeRange, refcon: interop.Pointer | interop.Reference<any>, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: any) => number>): number;

declare function VTFrameSiloCreate(allocator: any, fileURL: NSURL, timeRange: CMTimeRange, options: NSDictionary<any, any>, frameSiloOut: interop.Pointer | interop.Reference<any>): number;

declare function VTFrameSiloGetProgressOfCurrentPass(silo: any, progressOut: interop.Pointer | interop.Reference<number>): number;

declare function VTFrameSiloGetTypeID(): number;

declare function VTFrameSiloSetTimeRangesForNextPass(silo: any, timeRangeCount: number, timeRangeArray: interop.Pointer | interop.Reference<CMTimeRange>): number;

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

declare function VTIsHardwareDecodeSupported(codecType: number): boolean;

declare function VTMultiPassStorageClose(multiPassStorage: any): number;

declare function VTMultiPassStorageCreate(allocator: any, fileURL: NSURL, timeRange: CMTimeRange, options: NSDictionary<any, any>, multiPassStorageOut: interop.Pointer | interop.Reference<any>): number;

declare function VTMultiPassStorageGetTypeID(): number;

declare function VTSessionCopyProperty(session: any, propertyKey: string, allocator: any, propertyValueOut: interop.Pointer | interop.Reference<any>): number;

declare function VTSessionCopySerializableProperties(session: any, allocator: any, dictionaryOut: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

declare function VTSessionCopySupportedPropertyDictionary(session: any, supportedPropertyDictionaryOut: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

declare function VTSessionSetProperties(session: any, propertyDictionary: NSDictionary<any, any>): number;

declare function VTSessionSetProperty(session: any, propertyKey: string, propertyValue: any): number;

declare const kVTAllocationFailedErr: number;

declare var kVTAlphaChannelMode_PremultipliedAlpha: string;

declare var kVTAlphaChannelMode_StraightAlpha: string;

declare const kVTColorCorrectionImageRotationFailedErr: number;

declare const kVTColorCorrectionPixelTransferFailedErr: number;

declare const kVTColorSyncTransformConvertFailedErr: number;

declare var kVTCompressionPropertyKey_AllowFrameReordering: string;

declare var kVTCompressionPropertyKey_AllowOpenGOP: string;

declare var kVTCompressionPropertyKey_AllowTemporalCompression: string;

declare var kVTCompressionPropertyKey_AlphaChannelMode: string;

declare var kVTCompressionPropertyKey_AspectRatio16x9: string;

declare var kVTCompressionPropertyKey_AverageBitRate: string;

declare var kVTCompressionPropertyKey_BaseLayerFrameRate: string;

declare var kVTCompressionPropertyKey_CleanAperture: string;

declare var kVTCompressionPropertyKey_ColorPrimaries: string;

declare var kVTCompressionPropertyKey_ContentLightLevelInfo: string;

declare var kVTCompressionPropertyKey_DataRateLimits: string;

declare var kVTCompressionPropertyKey_Depth: string;

declare var kVTCompressionPropertyKey_EncoderID: string;

declare var kVTCompressionPropertyKey_ExpectedDuration: string;

declare var kVTCompressionPropertyKey_ExpectedFrameRate: string;

declare var kVTCompressionPropertyKey_FieldCount: string;

declare var kVTCompressionPropertyKey_FieldDetail: string;

declare var kVTCompressionPropertyKey_GammaLevel: string;

declare var kVTCompressionPropertyKey_H264EntropyMode: string;

declare var kVTCompressionPropertyKey_ICCProfile: string;

declare var kVTCompressionPropertyKey_MasteringDisplayColorVolume: string;

declare var kVTCompressionPropertyKey_MaxFrameDelayCount: string;

declare var kVTCompressionPropertyKey_MaxH264SliceBytes: string;

declare var kVTCompressionPropertyKey_MaxKeyFrameInterval: string;

declare var kVTCompressionPropertyKey_MaxKeyFrameIntervalDuration: string;

declare var kVTCompressionPropertyKey_MaximizePowerEfficiency: string;

declare var kVTCompressionPropertyKey_MoreFramesAfterEnd: string;

declare var kVTCompressionPropertyKey_MoreFramesBeforeStart: string;

declare var kVTCompressionPropertyKey_MultiPassStorage: string;

declare var kVTCompressionPropertyKey_NumberOfPendingFrames: string;

declare var kVTCompressionPropertyKey_PixelAspectRatio: string;

declare var kVTCompressionPropertyKey_PixelBufferPoolIsShared: string;

declare var kVTCompressionPropertyKey_PixelTransferProperties: string;

declare var kVTCompressionPropertyKey_ProfileLevel: string;

declare var kVTCompressionPropertyKey_ProgressiveScan: string;

declare var kVTCompressionPropertyKey_Quality: string;

declare var kVTCompressionPropertyKey_RealTime: string;

declare var kVTCompressionPropertyKey_SourceFrameCount: string;

declare var kVTCompressionPropertyKey_TargetQualityForAlpha: string;

declare var kVTCompressionPropertyKey_TransferFunction: string;

declare var kVTCompressionPropertyKey_UsingGPURegistryID: string;

declare var kVTCompressionPropertyKey_VideoEncoderPixelBufferAttributes: string;

declare var kVTCompressionPropertyKey_YCbCrMatrix: string;

declare const kVTCouldNotCreateColorCorrectionDataErr: number;

declare const kVTCouldNotCreateInstanceErr: number;

declare const kVTCouldNotFindTemporalFilterErr: number;

declare const kVTCouldNotFindVideoDecoderErr: number;

declare const kVTCouldNotFindVideoEncoderErr: number;

declare var kVTDecompressionPropertyKey_ContentHasInterframeDependencies: string;

declare var kVTDecompressionPropertyKey_DeinterlaceMode: string;

declare var kVTDecompressionPropertyKey_FieldMode: string;

declare var kVTDecompressionPropertyKey_MaxOutputPresentationTimeStampOfFramesBeingDecoded: string;

declare var kVTDecompressionPropertyKey_MaximizePowerEfficiency: string;

declare var kVTDecompressionPropertyKey_MinOutputPresentationTimeStampOfFramesBeingDecoded: string;

declare var kVTDecompressionPropertyKey_NumberOfFramesBeingDecoded: string;

declare var kVTDecompressionPropertyKey_OnlyTheseFrames: string;

declare var kVTDecompressionPropertyKey_OutputPoolRequestedMinimumBufferCount: string;

declare var kVTDecompressionPropertyKey_PixelBufferPool: string;

declare var kVTDecompressionPropertyKey_PixelBufferPoolIsShared: string;

declare var kVTDecompressionPropertyKey_PixelFormatsWithReducedResolutionSupport: string;

declare var kVTDecompressionPropertyKey_PixelTransferProperties: string;

declare var kVTDecompressionPropertyKey_RealTime: string;

declare var kVTDecompressionPropertyKey_ReducedCoefficientDecode: string;

declare var kVTDecompressionPropertyKey_ReducedFrameDelivery: string;

declare var kVTDecompressionPropertyKey_ReducedResolutionDecode: string;

declare var kVTDecompressionPropertyKey_SuggestedQualityOfServiceTiers: string;

declare var kVTDecompressionPropertyKey_SupportedPixelFormatsOrderedByPerformance: string;

declare var kVTDecompressionPropertyKey_SupportedPixelFormatsOrderedByQuality: string;

declare var kVTDecompressionPropertyKey_ThreadCount: string;

declare var kVTDecompressionPropertyKey_UsingGPURegistryID: string;

declare var kVTDecompressionProperty_DeinterlaceMode_Temporal: string;

declare var kVTDecompressionProperty_DeinterlaceMode_VerticalFilter: string;

declare var kVTDecompressionProperty_FieldMode_BothFields: string;

declare var kVTDecompressionProperty_FieldMode_BottomFieldOnly: string;

declare var kVTDecompressionProperty_FieldMode_DeinterlaceFields: string;

declare var kVTDecompressionProperty_FieldMode_SingleField: string;

declare var kVTDecompressionProperty_FieldMode_TopFieldOnly: string;

declare var kVTDecompressionProperty_OnlyTheseFrames_AllFrames: string;

declare var kVTDecompressionProperty_OnlyTheseFrames_IFrames: string;

declare var kVTDecompressionProperty_OnlyTheseFrames_KeyFrames: string;

declare var kVTDecompressionProperty_OnlyTheseFrames_NonDroppableFrames: string;

declare var kVTDecompressionProperty_TemporalLevelLimit: string;

declare var kVTDecompressionResolutionKey_Height: string;

declare var kVTDecompressionResolutionKey_Width: string;

declare var kVTDownsamplingMode_Average: string;

declare var kVTDownsamplingMode_Decimate: string;

declare var kVTEncodeFrameOptionKey_ForceKeyFrame: string;

declare const kVTFormatDescriptionChangeNotSupportedErr: number;

declare const kVTFrameSiloInvalidTimeRangeErr: number;

declare const kVTFrameSiloInvalidTimeStampErr: number;

declare var kVTH264EntropyMode_CABAC: string;

declare var kVTH264EntropyMode_CAVLC: string;

declare const kVTImageRotationNotSupportedErr: number;

declare const kVTInsufficientSourceColorDataErr: number;

declare const kVTInvalidSessionErr: number;

declare var kVTMultiPassStorageCreationOption_DoNotDelete: string;

declare const kVTMultiPassStorageIdentifierMismatchErr: number;

declare const kVTMultiPassStorageInvalidErr: number;

declare const kVTParameterErr: number;

declare const kVTPixelTransferNotPermittedErr: number;

declare const kVTPixelTransferNotSupportedErr: number;

declare var kVTPixelTransferPropertyKey_DestinationCleanAperture: string;

declare var kVTPixelTransferPropertyKey_DestinationColorPrimaries: string;

declare var kVTPixelTransferPropertyKey_DestinationICCProfile: string;

declare var kVTPixelTransferPropertyKey_DestinationPixelAspectRatio: string;

declare var kVTPixelTransferPropertyKey_DestinationTransferFunction: string;

declare var kVTPixelTransferPropertyKey_DestinationYCbCrMatrix: string;

declare var kVTPixelTransferPropertyKey_DownsamplingMode: string;

declare var kVTPixelTransferPropertyKey_RealTime: string;

declare var kVTPixelTransferPropertyKey_ScalingMode: string;

declare var kVTProfileLevel_H263_Profile0_Level10: string;

declare var kVTProfileLevel_H263_Profile0_Level45: string;

declare var kVTProfileLevel_H263_Profile3_Level45: string;

declare var kVTProfileLevel_H264_Baseline_1_3: string;

declare var kVTProfileLevel_H264_Baseline_3_0: string;

declare var kVTProfileLevel_H264_Baseline_3_1: string;

declare var kVTProfileLevel_H264_Baseline_3_2: string;

declare var kVTProfileLevel_H264_Baseline_4_0: string;

declare var kVTProfileLevel_H264_Baseline_4_1: string;

declare var kVTProfileLevel_H264_Baseline_4_2: string;

declare var kVTProfileLevel_H264_Baseline_5_0: string;

declare var kVTProfileLevel_H264_Baseline_5_1: string;

declare var kVTProfileLevel_H264_Baseline_5_2: string;

declare var kVTProfileLevel_H264_Baseline_AutoLevel: string;

declare var kVTProfileLevel_H264_Extended_5_0: string;

declare var kVTProfileLevel_H264_Extended_AutoLevel: string;

declare var kVTProfileLevel_H264_High_3_0: string;

declare var kVTProfileLevel_H264_High_3_1: string;

declare var kVTProfileLevel_H264_High_3_2: string;

declare var kVTProfileLevel_H264_High_4_0: string;

declare var kVTProfileLevel_H264_High_4_1: string;

declare var kVTProfileLevel_H264_High_4_2: string;

declare var kVTProfileLevel_H264_High_5_0: string;

declare var kVTProfileLevel_H264_High_5_1: string;

declare var kVTProfileLevel_H264_High_5_2: string;

declare var kVTProfileLevel_H264_High_AutoLevel: string;

declare var kVTProfileLevel_H264_Main_3_0: string;

declare var kVTProfileLevel_H264_Main_3_1: string;

declare var kVTProfileLevel_H264_Main_3_2: string;

declare var kVTProfileLevel_H264_Main_4_0: string;

declare var kVTProfileLevel_H264_Main_4_1: string;

declare var kVTProfileLevel_H264_Main_4_2: string;

declare var kVTProfileLevel_H264_Main_5_0: string;

declare var kVTProfileLevel_H264_Main_5_1: string;

declare var kVTProfileLevel_H264_Main_5_2: string;

declare var kVTProfileLevel_H264_Main_AutoLevel: string;

declare var kVTProfileLevel_HEVC_Main10_AutoLevel: string;

declare var kVTProfileLevel_HEVC_Main_AutoLevel: string;

declare var kVTProfileLevel_MP4V_AdvancedSimple_L0: string;

declare var kVTProfileLevel_MP4V_AdvancedSimple_L1: string;

declare var kVTProfileLevel_MP4V_AdvancedSimple_L2: string;

declare var kVTProfileLevel_MP4V_AdvancedSimple_L3: string;

declare var kVTProfileLevel_MP4V_AdvancedSimple_L4: string;

declare var kVTProfileLevel_MP4V_Main_L2: string;

declare var kVTProfileLevel_MP4V_Main_L3: string;

declare var kVTProfileLevel_MP4V_Main_L4: string;

declare var kVTProfileLevel_MP4V_Simple_L0: string;

declare var kVTProfileLevel_MP4V_Simple_L1: string;

declare var kVTProfileLevel_MP4V_Simple_L2: string;

declare var kVTProfileLevel_MP4V_Simple_L3: string;

declare var kVTPropertyDocumentationKey: string;

declare const kVTPropertyNotSupportedErr: number;

declare const kVTPropertyReadOnlyErr: number;

declare var kVTPropertyReadWriteStatusKey: string;

declare var kVTPropertyReadWriteStatus_ReadOnly: string;

declare var kVTPropertyReadWriteStatus_ReadWrite: string;

declare var kVTPropertyShouldBeSerializedKey: string;

declare var kVTPropertySupportedValueListKey: string;

declare var kVTPropertySupportedValueMaximumKey: string;

declare var kVTPropertySupportedValueMinimumKey: string;

declare var kVTPropertyTypeKey: string;

declare var kVTPropertyType_Boolean: string;

declare var kVTPropertyType_Enumeration: string;

declare var kVTPropertyType_Number: string;

declare var kVTScalingMode_CropSourceToCleanAperture: string;

declare var kVTScalingMode_Letterbox: string;

declare var kVTScalingMode_Normal: string;

declare var kVTScalingMode_Trim: string;

declare const kVTUnlimitedFrameDelayCount: number;

declare const kVTVideoDecoderAuthorizationErr: number;

declare const kVTVideoDecoderBadDataErr: number;

declare const kVTVideoDecoderMalfunctionErr: number;

declare const kVTVideoDecoderNotAvailableNowErr: number;

declare const kVTVideoDecoderRemovedErr: number;

declare var kVTVideoDecoderSpecification_PreferredDecoderGPURegistryID: string;

declare var kVTVideoDecoderSpecification_RequiredDecoderGPURegistryID: string;

declare const kVTVideoDecoderUnsupportedDataFormatErr: number;

declare const kVTVideoEncoderAuthorizationErr: number;

declare var kVTVideoEncoderList_CodecName: string;

declare var kVTVideoEncoderList_CodecType: string;

declare var kVTVideoEncoderList_DisplayName: string;

declare var kVTVideoEncoderList_EncoderID: string;

declare var kVTVideoEncoderList_EncoderName: string;

declare var kVTVideoEncoderList_GPURegistryID: string;

declare var kVTVideoEncoderList_InstanceLimit: string;

declare var kVTVideoEncoderList_IsHardwareAccelerated: string;

declare var kVTVideoEncoderList_PerformanceRating: string;

declare var kVTVideoEncoderList_QualityRating: string;

declare var kVTVideoEncoderList_SupportedSelectionProperties: string;

declare const kVTVideoEncoderMalfunctionErr: number;

declare const kVTVideoEncoderNotAvailableNowErr: number;

declare var kVTVideoEncoderSpecification_EncoderID: string;

declare var kVTVideoEncoderSpecification_PreferredEncoderGPURegistryID: string;

declare var kVTVideoEncoderSpecification_RequiredEncoderGPURegistryID: string;
