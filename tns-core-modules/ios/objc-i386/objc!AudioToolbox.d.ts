
declare function AUGraphAddNode(inGraph: interop.Pointer, inDescription: interop.Reference<AudioComponentDescription>, outNode: interop.Reference<number>): number;

declare function AUGraphAddRenderNotify(inGraph: interop.Pointer, inCallback: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Reference<AudioBufferList>) => number>, inRefCon: interop.Pointer): number;

declare function AUGraphClearConnections(inGraph: interop.Pointer): number;

declare function AUGraphClose(inGraph: interop.Pointer): number;

declare function AUGraphConnectNodeInput(inGraph: interop.Pointer, inSourceNode: number, inSourceOutputNumber: number, inDestNode: number, inDestInputNumber: number): number;

declare function AUGraphCountNodeInteractions(inGraph: interop.Pointer, inNode: number, outNumInteractions: interop.Reference<number>): number;

declare function AUGraphDisconnectNodeInput(inGraph: interop.Pointer, inDestNode: number, inDestInputNumber: number): number;

declare function AUGraphGetCPULoad(inGraph: interop.Pointer, outAverageCPULoad: interop.Reference<number>): number;

declare function AUGraphGetIndNode(inGraph: interop.Pointer, inIndex: number, outNode: interop.Reference<number>): number;

declare function AUGraphGetMaxCPULoad(inGraph: interop.Pointer, outMaxLoad: interop.Reference<number>): number;

declare function AUGraphGetNodeCount(inGraph: interop.Pointer, outNumberOfNodes: interop.Reference<number>): number;

declare function AUGraphGetNumberOfInteractions(inGraph: interop.Pointer, outNumInteractions: interop.Reference<number>): number;

declare function AUGraphInitialize(inGraph: interop.Pointer): number;

declare function AUGraphIsInitialized(inGraph: interop.Pointer, outIsInitialized: string): number;

declare function AUGraphIsOpen(inGraph: interop.Pointer, outIsOpen: string): number;

declare function AUGraphIsRunning(inGraph: interop.Pointer, outIsRunning: string): number;

declare function AUGraphNodeInfo(inGraph: interop.Pointer, inNode: number, outDescription: interop.Reference<AudioComponentDescription>, outAudioUnit: interop.Reference<interop.Pointer>): number;

declare function AUGraphOpen(inGraph: interop.Pointer): number;

declare function AUGraphRemoveNode(inGraph: interop.Pointer, inNode: number): number;

declare function AUGraphRemoveRenderNotify(inGraph: interop.Pointer, inCallback: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Reference<AudioBufferList>) => number>, inRefCon: interop.Pointer): number;

declare function AUGraphSetNodeInputCallback(inGraph: interop.Pointer, inDestNode: number, inDestInputNumber: number, inInputCallback: interop.Reference<AURenderCallbackStruct>): number;

declare function AUGraphStart(inGraph: interop.Pointer): number;

declare function AUGraphStop(inGraph: interop.Pointer): number;

declare function AUGraphUninitialize(inGraph: interop.Pointer): number;

declare function AUGraphUpdate(inGraph: interop.Pointer, outIsUpdated: string): number;

interface AUNodeRenderCallback {
	destNode: number;
	destInputNumber: number;
	cback: AURenderCallbackStruct;
}
declare var AUNodeRenderCallback: interop.StructType<AUNodeRenderCallback>;

interface AUPresetEvent {
	scope: number;
	element: number;
	preset: any;
}
declare var AUPresetEvent: interop.StructType<AUPresetEvent>;

interface AudioBalanceFade {
	mLeftRightBalance: number;
	mBackFrontFade: number;
	mType: AudioBalanceFadeType;
	mChannelLayout: interop.Reference<AudioChannelLayout>;
}
declare var AudioBalanceFade: interop.StructType<AudioBalanceFade>;

declare const enum AudioBalanceFadeType {

	kAudioBalanceFadeType_MaxUnityGain = 0,

	kAudioBalanceFadeType_EqualPower = 1
}

interface AudioBytePacketTranslation {
	mByte: number;
	mPacket: number;
	mByteOffsetInPacket: number;
	mFlags: AudioBytePacketTranslationFlags;
}
declare var AudioBytePacketTranslation: interop.StructType<AudioBytePacketTranslation>;

declare const enum AudioBytePacketTranslationFlags {

	kBytePacketTranslationFlag_IsEstimate = 1
}

declare function AudioConverterConvertBuffer(inAudioConverter: interop.Pointer, inInputDataSize: number, inInputData: interop.Pointer, ioOutputDataSize: interop.Reference<number>, outOutputData: interop.Pointer): number;

declare function AudioConverterConvertComplexBuffer(inAudioConverter: interop.Pointer, inNumberPCMFrames: number, inInputData: interop.Reference<AudioBufferList>, outOutputData: interop.Reference<AudioBufferList>): number;

declare function AudioConverterDispose(inAudioConverter: interop.Pointer): number;

declare function AudioConverterFillComplexBuffer(inAudioConverter: interop.Pointer, inInputDataProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<number>, p3: interop.Reference<AudioBufferList>, p4: interop.Reference<interop.Reference<AudioStreamPacketDescription>>, p5: interop.Pointer) => number>, inInputDataProcUserData: interop.Pointer, ioOutputDataPacketSize: interop.Reference<number>, outOutputData: interop.Reference<AudioBufferList>, outPacketDescription: interop.Reference<AudioStreamPacketDescription>): number;

declare function AudioConverterGetProperty(inAudioConverter: interop.Pointer, inPropertyID: number, ioPropertyDataSize: interop.Reference<number>, outPropertyData: interop.Pointer): number;

declare function AudioConverterGetPropertyInfo(inAudioConverter: interop.Pointer, inPropertyID: number, outSize: interop.Reference<number>, outWritable: string): number;

declare function AudioConverterNew(inSourceFormat: interop.Reference<AudioStreamBasicDescription>, inDestinationFormat: interop.Reference<AudioStreamBasicDescription>, outAudioConverter: interop.Reference<interop.Pointer>): number;

declare function AudioConverterNewSpecific(inSourceFormat: interop.Reference<AudioStreamBasicDescription>, inDestinationFormat: interop.Reference<AudioStreamBasicDescription>, inNumberClassDescriptions: number, inClassDescriptions: interop.Reference<AudioClassDescription>, outAudioConverter: interop.Reference<interop.Pointer>): number;

interface AudioConverterPrimeInfo {
	leadingFrames: number;
	trailingFrames: number;
}
declare var AudioConverterPrimeInfo: interop.StructType<AudioConverterPrimeInfo>;

declare function AudioConverterReset(inAudioConverter: interop.Pointer): number;

declare function AudioConverterSetProperty(inAudioConverter: interop.Pointer, inPropertyID: number, inPropertyDataSize: number, inPropertyData: interop.Pointer): number;

declare function AudioFileClose(inAudioFile: interop.Pointer): number;

declare function AudioFileCountUserData(inAudioFile: interop.Pointer, inUserDataID: number, outNumberItems: interop.Reference<number>): number;

declare function AudioFileCreateWithURL(inFileRef: NSURL, inFileType: number, inFormat: interop.Reference<AudioStreamBasicDescription>, inFlags: AudioFileFlags, outAudioFile: interop.Reference<interop.Pointer>): number;

declare const enum AudioFileFlags {

	kAudioFileFlags_EraseFile = 1,

	kAudioFileFlags_DontPageAlignAudioData = 2
}

declare function AudioFileGetGlobalInfo(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer, ioDataSize: interop.Reference<number>, outPropertyData: interop.Pointer): number;

declare function AudioFileGetGlobalInfoSize(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer, outDataSize: interop.Reference<number>): number;

declare function AudioFileGetProperty(inAudioFile: interop.Pointer, inPropertyID: number, ioDataSize: interop.Reference<number>, outPropertyData: interop.Pointer): number;

declare function AudioFileGetPropertyInfo(inAudioFile: interop.Pointer, inPropertyID: number, outDataSize: interop.Reference<number>, isWritable: interop.Reference<number>): number;

declare function AudioFileGetUserData(inAudioFile: interop.Pointer, inUserDataID: number, inIndex: number, ioUserDataSize: interop.Reference<number>, outUserData: interop.Pointer): number;

declare function AudioFileGetUserDataSize(inAudioFile: interop.Pointer, inUserDataID: number, inIndex: number, outUserDataSize: interop.Reference<number>): number;

declare function AudioFileInitializeWithCallbacks(inClientData: interop.Pointer, inReadFunc: interop.FunctionReference<(p1: interop.Pointer, p2: number, p3: number, p4: interop.Pointer, p5: interop.Reference<number>) => number>, inWriteFunc: interop.FunctionReference<(p1: interop.Pointer, p2: number, p3: number, p4: interop.Pointer, p5: interop.Reference<number>) => number>, inGetSizeFunc: interop.FunctionReference<(p1: interop.Pointer) => number>, inSetSizeFunc: interop.FunctionReference<(p1: interop.Pointer, p2: number) => number>, inFileType: number, inFormat: interop.Reference<AudioStreamBasicDescription>, inFlags: AudioFileFlags, outAudioFile: interop.Reference<interop.Pointer>): number;

interface AudioFileMarker {
	mFramePosition: number;
	mName: string;
	mMarkerID: number;
	mSMPTETime: AudioFile_SMPTE_Time;
	mType: number;
	mReserved: number;
	mChannel: number;
}
declare var AudioFileMarker: interop.StructType<AudioFileMarker>;

interface AudioFileMarkerList {
	mSMPTE_TimeType: number;
	mNumberMarkers: number;
	mMarkers: interop.Reference<AudioFileMarker>;
}
declare var AudioFileMarkerList: interop.StructType<AudioFileMarkerList>;

declare function AudioFileOpenURL(inFileRef: NSURL, inPermissions: AudioFilePermissions, inFileTypeHint: number, outAudioFile: interop.Reference<interop.Pointer>): number;

declare function AudioFileOpenWithCallbacks(inClientData: interop.Pointer, inReadFunc: interop.FunctionReference<(p1: interop.Pointer, p2: number, p3: number, p4: interop.Pointer, p5: interop.Reference<number>) => number>, inWriteFunc: interop.FunctionReference<(p1: interop.Pointer, p2: number, p3: number, p4: interop.Pointer, p5: interop.Reference<number>) => number>, inGetSizeFunc: interop.FunctionReference<(p1: interop.Pointer) => number>, inSetSizeFunc: interop.FunctionReference<(p1: interop.Pointer, p2: number) => number>, inFileTypeHint: number, outAudioFile: interop.Reference<interop.Pointer>): number;

declare function AudioFileOptimize(inAudioFile: interop.Pointer): number;

interface AudioFilePacketTableInfo {
	mNumberValidFrames: number;
	mPrimingFrames: number;
	mRemainderFrames: number;
}
declare var AudioFilePacketTableInfo: interop.StructType<AudioFilePacketTableInfo>;

declare const enum AudioFilePermissions {

	kAudioFileReadPermission = 1,

	kAudioFileWritePermission = 2,

	kAudioFileReadWritePermission = 3
}

declare function AudioFileReadBytes(inAudioFile: interop.Pointer, inUseCache: boolean, inStartingByte: number, ioNumBytes: interop.Reference<number>, outBuffer: interop.Pointer): number;

declare function AudioFileReadPacketData(inAudioFile: interop.Pointer, inUseCache: boolean, ioNumBytes: interop.Reference<number>, outPacketDescriptions: interop.Reference<AudioStreamPacketDescription>, inStartingPacket: number, ioNumPackets: interop.Reference<number>, outBuffer: interop.Pointer): number;

declare function AudioFileReadPackets(inAudioFile: interop.Pointer, inUseCache: boolean, outNumBytes: interop.Reference<number>, outPacketDescriptions: interop.Reference<AudioStreamPacketDescription>, inStartingPacket: number, ioNumPackets: interop.Reference<number>, outBuffer: interop.Pointer): number;

interface AudioFileRegion {
	mRegionID: number;
	mName: string;
	mFlags: AudioFileRegionFlags;
	mNumberMarkers: number;
	mMarkers: interop.Reference<AudioFileMarker>;
}
declare var AudioFileRegion: interop.StructType<AudioFileRegion>;

declare const enum AudioFileRegionFlags {

	kAudioFileRegionFlag_LoopEnable = 1,

	kAudioFileRegionFlag_PlayForward = 2,

	kAudioFileRegionFlag_PlayBackward = 4
}

interface AudioFileRegionList {
	mSMPTE_TimeType: number;
	mNumberRegions: number;
	mRegions: interop.Reference<AudioFileRegion>;
}
declare var AudioFileRegionList: interop.StructType<AudioFileRegionList>;

declare function AudioFileRemoveUserData(inAudioFile: interop.Pointer, inUserDataID: number, inIndex: number): number;

declare function AudioFileSetProperty(inAudioFile: interop.Pointer, inPropertyID: number, inDataSize: number, inPropertyData: interop.Pointer): number;

declare function AudioFileSetUserData(inAudioFile: interop.Pointer, inUserDataID: number, inIndex: number, inUserDataSize: number, inUserData: interop.Pointer): number;

declare function AudioFileStreamClose(inAudioFileStream: interop.Pointer): number;

declare function AudioFileStreamGetProperty(inAudioFileStream: interop.Pointer, inPropertyID: number, ioPropertyDataSize: interop.Reference<number>, outPropertyData: interop.Pointer): number;

declare function AudioFileStreamGetPropertyInfo(inAudioFileStream: interop.Pointer, inPropertyID: number, outPropertyDataSize: interop.Reference<number>, outWritable: string): number;

declare function AudioFileStreamOpen(inClientData: interop.Pointer, inPropertyListenerProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number, p4: interop.Reference<AudioFileStreamPropertyFlags>) => void>, inPacketsProc: interop.FunctionReference<(p1: interop.Pointer, p2: number, p3: number, p4: interop.Pointer, p5: interop.Reference<AudioStreamPacketDescription>) => void>, inFileTypeHint: number, outAudioFileStream: interop.Reference<interop.Pointer>): number;

declare function AudioFileStreamParseBytes(inAudioFileStream: interop.Pointer, inDataByteSize: number, inData: interop.Pointer, inFlags: AudioFileStreamParseFlags): number;

declare const enum AudioFileStreamParseFlags {

	kAudioFileStreamParseFlag_Discontinuity = 1
}

declare const enum AudioFileStreamPropertyFlags {

	kAudioFileStreamPropertyFlag_PropertyIsCached = 1,

	kAudioFileStreamPropertyFlag_CacheProperty = 2
}

declare function AudioFileStreamSeek(inAudioFileStream: interop.Pointer, inPacketOffset: number, outDataByteOffset: interop.Reference<number>, ioFlags: interop.Reference<AudioFileStreamSeekFlags>): number;

declare const enum AudioFileStreamSeekFlags {

	kAudioFileStreamSeekFlag_OffsetIsEstimated = 1
}

declare function AudioFileStreamSetProperty(inAudioFileStream: interop.Pointer, inPropertyID: number, inPropertyDataSize: number, inPropertyData: interop.Pointer): number;

interface AudioFileTypeAndFormatID {
	mFileType: number;
	mFormatID: number;
}
declare var AudioFileTypeAndFormatID: interop.StructType<AudioFileTypeAndFormatID>;

declare function AudioFileWriteBytes(inAudioFile: interop.Pointer, inUseCache: boolean, inStartingByte: number, ioNumBytes: interop.Reference<number>, inBuffer: interop.Pointer): number;

declare function AudioFileWritePackets(inAudioFile: interop.Pointer, inUseCache: boolean, inNumBytes: number, inPacketDescriptions: interop.Reference<AudioStreamPacketDescription>, inStartingPacket: number, ioNumPackets: interop.Reference<number>, inBuffer: interop.Pointer): number;

interface AudioFile_SMPTE_Time {
	mHours: number;
	mMinutes: number;
	mSeconds: number;
	mFrames: number;
	mSubFrameSampleOffset: number;
}
declare var AudioFile_SMPTE_Time: interop.StructType<AudioFile_SMPTE_Time>;

declare function AudioFormatGetProperty(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer, ioPropertyDataSize: interop.Reference<number>, outPropertyData: interop.Pointer): number;

declare function AudioFormatGetPropertyInfo(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer, outPropertyDataSize: interop.Reference<number>): number;

interface AudioFormatInfo {
	mASBD: AudioStreamBasicDescription;
	mMagicCookie: interop.Pointer;
	mMagicCookieSize: number;
}
declare var AudioFormatInfo: interop.StructType<AudioFormatInfo>;

interface AudioFormatListItem {
	mASBD: AudioStreamBasicDescription;
	mChannelLayoutTag: number;
}
declare var AudioFormatListItem: interop.StructType<AudioFormatListItem>;

interface AudioFramePacketTranslation {
	mFrame: number;
	mPacket: number;
	mFrameOffsetInPacket: number;
}
declare var AudioFramePacketTranslation: interop.StructType<AudioFramePacketTranslation>;

interface AudioPanningInfo {
	mPanningMode: AudioPanningMode;
	mCoordinateFlags: number;
	mCoordinates: interop.Reference<number>;
	mGainScale: number;
	mOutputChannelMap: interop.Reference<AudioChannelLayout>;
}
declare var AudioPanningInfo: interop.StructType<AudioPanningInfo>;

declare const enum AudioPanningMode {

	kPanningMode_SoundField = 3,

	kPanningMode_VectorBasedPanning = 4
}

declare function AudioQueueAddPropertyListener(inAQ: interop.Pointer, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number) => void>, inUserData: interop.Pointer): number;

declare function AudioQueueAllocateBuffer(inAQ: interop.Pointer, inBufferByteSize: number, outBuffer: interop.Reference<interop.Reference<AudioQueueBuffer>>): number;

declare function AudioQueueAllocateBufferWithPacketDescriptions(inAQ: interop.Pointer, inBufferByteSize: number, inNumberPacketDescriptions: number, outBuffer: interop.Reference<interop.Reference<AudioQueueBuffer>>): number;

interface AudioQueueBuffer {
	mAudioDataBytesCapacity: number;
	mAudioData: interop.Pointer;
	mAudioDataByteSize: number;
	mUserData: interop.Pointer;
	mPacketDescriptionCapacity: number;
	mPacketDescriptions: interop.Reference<AudioStreamPacketDescription>;
	mPacketDescriptionCount: number;
}
declare var AudioQueueBuffer: interop.StructType<AudioQueueBuffer>;

interface AudioQueueChannelAssignment {
	mDeviceUID: string;
	mChannelNumber: number;
}
declare var AudioQueueChannelAssignment: interop.StructType<AudioQueueChannelAssignment>;

declare function AudioQueueCreateTimeline(inAQ: interop.Pointer, outTimeline: interop.Reference<interop.Pointer>): number;

declare function AudioQueueDeviceGetCurrentTime(inAQ: interop.Pointer, outTimeStamp: interop.Reference<AudioTimeStamp>): number;

declare function AudioQueueDeviceGetNearestStartTime(inAQ: interop.Pointer, ioRequestedStartTime: interop.Reference<AudioTimeStamp>, inFlags: number): number;

declare function AudioQueueDeviceTranslateTime(inAQ: interop.Pointer, inTime: interop.Reference<AudioTimeStamp>, outTime: interop.Reference<AudioTimeStamp>): number;

declare function AudioQueueDispose(inAQ: interop.Pointer, inImmediate: boolean): number;

declare function AudioQueueDisposeTimeline(inAQ: interop.Pointer, inTimeline: interop.Pointer): number;

declare function AudioQueueEnqueueBuffer(inAQ: interop.Pointer, inBuffer: interop.Reference<AudioQueueBuffer>, inNumPacketDescs: number, inPacketDescs: interop.Reference<AudioStreamPacketDescription>): number;

declare function AudioQueueEnqueueBufferWithParameters(inAQ: interop.Pointer, inBuffer: interop.Reference<AudioQueueBuffer>, inNumPacketDescs: number, inPacketDescs: interop.Reference<AudioStreamPacketDescription>, inTrimFramesAtStart: number, inTrimFramesAtEnd: number, inNumParamValues: number, inParamValues: interop.Reference<AudioQueueParameterEvent>, inStartTime: interop.Reference<AudioTimeStamp>, outActualStartTime: interop.Reference<AudioTimeStamp>): number;

declare function AudioQueueFlush(inAQ: interop.Pointer): number;

declare function AudioQueueFreeBuffer(inAQ: interop.Pointer, inBuffer: interop.Reference<AudioQueueBuffer>): number;

declare function AudioQueueGetCurrentTime(inAQ: interop.Pointer, inTimeline: interop.Pointer, outTimeStamp: interop.Reference<AudioTimeStamp>, outTimelineDiscontinuity: string): number;

declare function AudioQueueGetParameter(inAQ: interop.Pointer, inParamID: number, outValue: interop.Reference<number>): number;

declare function AudioQueueGetProperty(inAQ: interop.Pointer, inID: number, outData: interop.Pointer, ioDataSize: interop.Reference<number>): number;

declare function AudioQueueGetPropertySize(inAQ: interop.Pointer, inID: number, outDataSize: interop.Reference<number>): number;

interface AudioQueueLevelMeterState {
	mAveragePower: number;
	mPeakPower: number;
}
declare var AudioQueueLevelMeterState: interop.StructType<AudioQueueLevelMeterState>;

declare function AudioQueueNewInput(inFormat: interop.Reference<AudioStreamBasicDescription>, inCallbackProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Reference<AudioQueueBuffer>, p4: interop.Reference<AudioTimeStamp>, p5: number, p6: interop.Reference<AudioStreamPacketDescription>) => void>, inUserData: interop.Pointer, inCallbackRunLoop: any, inCallbackRunLoopMode: string, inFlags: number, outAQ: interop.Reference<interop.Pointer>): number;

declare function AudioQueueNewOutput(inFormat: interop.Reference<AudioStreamBasicDescription>, inCallbackProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Reference<AudioQueueBuffer>) => void>, inUserData: interop.Pointer, inCallbackRunLoop: any, inCallbackRunLoopMode: string, inFlags: number, outAQ: interop.Reference<interop.Pointer>): number;

declare function AudioQueueOfflineRender(inAQ: interop.Pointer, inTimestamp: interop.Reference<AudioTimeStamp>, ioBuffer: interop.Reference<AudioQueueBuffer>, inNumberFrames: number): number;

interface AudioQueueParameterEvent {
	mID: number;
	mValue: number;
}
declare var AudioQueueParameterEvent: interop.StructType<AudioQueueParameterEvent>;

declare function AudioQueuePause(inAQ: interop.Pointer): number;

declare function AudioQueuePrime(inAQ: interop.Pointer, inNumberOfFramesToPrepare: number, outNumberOfFramesPrepared: interop.Reference<number>): number;

declare function AudioQueueProcessingTapDispose(inAQTap: interop.Pointer): number;

declare const enum AudioQueueProcessingTapFlags {

	kAudioQueueProcessingTap_PreEffects = 1,

	kAudioQueueProcessingTap_PostEffects = 2,

	kAudioQueueProcessingTap_Siphon = 4,

	kAudioQueueProcessingTap_StartOfStream = 256,

	kAudioQueueProcessingTap_EndOfStream = 512
}

declare function AudioQueueProcessingTapGetQueueTime(inAQTap: interop.Pointer, outQueueSampleTime: interop.Reference<number>, outQueueFrameCount: interop.Reference<number>): number;

declare function AudioQueueProcessingTapGetSourceAudio(inAQTap: interop.Pointer, inNumberFrames: number, ioTimeStamp: interop.Reference<AudioTimeStamp>, outFlags: interop.Reference<AudioQueueProcessingTapFlags>, outNumberFrames: interop.Reference<number>, ioData: interop.Reference<AudioBufferList>): number;

declare function AudioQueueProcessingTapNew(inAQ: interop.Pointer, inCallback: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number, p4: interop.Reference<AudioTimeStamp>, p5: interop.Reference<AudioQueueProcessingTapFlags>, p6: interop.Reference<number>, p7: interop.Reference<AudioBufferList>) => void>, inClientData: interop.Pointer, inFlags: AudioQueueProcessingTapFlags, outMaxFrames: interop.Reference<number>, outProcessingFormat: interop.Reference<AudioStreamBasicDescription>, outAQTap: interop.Reference<interop.Pointer>): number;

declare function AudioQueueRemovePropertyListener(inAQ: interop.Pointer, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number) => void>, inUserData: interop.Pointer): number;

declare function AudioQueueReset(inAQ: interop.Pointer): number;

declare function AudioQueueSetOfflineRenderFormat(inAQ: interop.Pointer, inFormat: interop.Reference<AudioStreamBasicDescription>, inLayout: interop.Reference<AudioChannelLayout>): number;

declare function AudioQueueSetParameter(inAQ: interop.Pointer, inParamID: number, inValue: number): number;

declare function AudioQueueSetProperty(inAQ: interop.Pointer, inID: number, inData: interop.Pointer, inDataSize: number): number;

declare function AudioQueueStart(inAQ: interop.Pointer, inStartTime: interop.Reference<AudioTimeStamp>): number;

declare function AudioQueueStop(inAQ: interop.Pointer, inImmediate: boolean): number;

declare function AudioServicesAddSystemSoundCompletion(inSystemSoundID: number, inRunLoop: any, inRunLoopMode: string, inCompletionRoutine: interop.FunctionReference<(p1: number, p2: interop.Pointer) => void>, inClientData: interop.Pointer): number;

declare function AudioServicesCreateSystemSoundID(inFileURL: NSURL, outSystemSoundID: interop.Reference<number>): number;

declare function AudioServicesDisposeSystemSoundID(inSystemSoundID: number): number;

declare function AudioServicesGetProperty(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer, ioPropertyDataSize: interop.Reference<number>, outPropertyData: interop.Pointer): number;

declare function AudioServicesGetPropertyInfo(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer, outPropertyDataSize: interop.Reference<number>, outWritable: string): number;

declare function AudioServicesPlayAlertSound(inSystemSoundID: number): void;

declare function AudioServicesPlayAlertSoundWithCompletion(inSystemSoundID: number, inCompletionBlock: () => void): void;

declare function AudioServicesPlaySystemSound(inSystemSoundID: number): void;

declare function AudioServicesPlaySystemSoundWithCompletion(inSystemSoundID: number, inCompletionBlock: () => void): void;

declare function AudioServicesRemoveSystemSoundCompletion(inSystemSoundID: number): void;

declare function AudioServicesSetProperty(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer, inPropertyDataSize: number, inPropertyData: interop.Pointer): number;

declare function AudioSessionAddPropertyListener(inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer, p2: number, p3: number, p4: interop.Pointer) => void>, inClientData: interop.Pointer): number;

declare function AudioSessionGetProperty(inID: number, ioDataSize: interop.Reference<number>, outData: interop.Pointer): number;

declare function AudioSessionGetPropertySize(inID: number, outDataSize: interop.Reference<number>): number;

declare function AudioSessionInitialize(inRunLoop: any, inRunLoopMode: string, inInterruptionListener: interop.FunctionReference<(p1: interop.Pointer, p2: number) => void>, inClientData: interop.Pointer): number;

declare function AudioSessionRemovePropertyListener(inID: number): number;

declare function AudioSessionRemovePropertyListenerWithUserData(inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer, p2: number, p3: number, p4: interop.Pointer) => void>, inClientData: interop.Pointer): number;

declare function AudioSessionSetActive(active: boolean): number;

declare function AudioSessionSetActiveWithFlags(active: boolean, inFlags: number): number;

declare function AudioSessionSetProperty(inID: number, inDataSize: number, inData: interop.Pointer): number;

interface AudioUnitNodeConnection {
	sourceNode: number;
	sourceOutputNumber: number;
	destNode: number;
	destInputNumber: number;
}
declare var AudioUnitNodeConnection: interop.StructType<AudioUnitNodeConnection>;

interface CABarBeatTime {
	bar: number;
	beat: number;
	subbeat: number;
	subbeatDivisor: number;
	reserved: number;
}
declare var CABarBeatTime: interop.StructType<CABarBeatTime>;

interface CAFAudioDescription {
	mSampleRate: number;
	mFormatID: number;
	mFormatFlags: CAFFormatFlags;
	mBytesPerPacket: number;
	mFramesPerPacket: number;
	mChannelsPerFrame: number;
	mBitsPerChannel: number;
}
declare var CAFAudioDescription: interop.StructType<CAFAudioDescription>;

interface CAFAudioFormatListItem {
	mFormat: CAFAudioDescription;
	mChannelLayoutTag: number;
}
declare var CAFAudioFormatListItem: interop.StructType<CAFAudioFormatListItem>;

interface CAFChunkHeader {
	mChunkType: number;
	mChunkSize: number;
}
declare var CAFChunkHeader: interop.StructType<CAFChunkHeader>;

interface CAFDataChunk {
	mEditCount: number;
	mData: interop.Reference<number>;
}
declare var CAFDataChunk: interop.StructType<CAFDataChunk>;

interface CAFFileHeader {
	mFileType: number;
	mFileVersion: number;
	mFileFlags: number;
}
declare var CAFFileHeader: interop.StructType<CAFFileHeader>;

declare const enum CAFFormatFlags {

	kCAFLinearPCMFormatFlagIsFloat = 1,

	kCAFLinearPCMFormatFlagIsLittleEndian = 2
}

interface CAFInfoStrings {
	mNumEntries: number;
}
declare var CAFInfoStrings: interop.StructType<CAFInfoStrings>;

interface CAFInstrumentChunk {
	mBaseNote: number;
	mMIDILowNote: number;
	mMIDIHighNote: number;
	mMIDILowVelocity: number;
	mMIDIHighVelocity: number;
	mdBGain: number;
	mStartRegionID: number;
	mSustainRegionID: number;
	mReleaseRegionID: number;
	mInstrumentID: number;
}
declare var CAFInstrumentChunk: interop.StructType<CAFInstrumentChunk>;

interface CAFMarker {
	mType: number;
	mFramePosition: number;
	mMarkerID: number;
	mSMPTETime: CAF_SMPTE_Time;
	mChannel: number;
}
declare var CAFMarker: interop.StructType<CAFMarker>;

interface CAFMarkerChunk {
	mSMPTE_TimeType: number;
	mNumberMarkers: number;
	mMarkers: interop.Reference<CAFMarker>;
}
declare var CAFMarkerChunk: interop.StructType<CAFMarkerChunk>;

interface CAFOverviewChunk {
	mEditCount: number;
	mNumFramesPerOVWSample: number;
	mData: interop.Reference<CAFOverviewSample>;
}
declare var CAFOverviewChunk: interop.StructType<CAFOverviewChunk>;

interface CAFOverviewSample {
	mMinValue: number;
	mMaxValue: number;
}
declare var CAFOverviewSample: interop.StructType<CAFOverviewSample>;

interface CAFPacketTableHeader {
	mNumberPackets: number;
	mNumberValidFrames: number;
	mPrimingFrames: number;
	mRemainderFrames: number;
	mPacketDescriptions: interop.Reference<number>;
}
declare var CAFPacketTableHeader: interop.StructType<CAFPacketTableHeader>;

interface CAFPeakChunk {
	mEditCount: number;
	mPeaks: interop.Reference<CAFPositionPeak>;
}
declare var CAFPeakChunk: interop.StructType<CAFPeakChunk>;

interface CAFPositionPeak {
	mValue: number;
	mFrameNumber: number;
}
declare var CAFPositionPeak: interop.StructType<CAFPositionPeak>;

interface CAFRegion {
	mRegionID: number;
	mFlags: CAFRegionFlags;
	mNumberMarkers: number;
	mMarkers: interop.Reference<CAFMarker>;
}
declare var CAFRegion: interop.StructType<CAFRegion>;

interface CAFRegionChunk {
	mSMPTE_TimeType: number;
	mNumberRegions: number;
	mRegions: interop.Reference<CAFRegion>;
}
declare var CAFRegionChunk: interop.StructType<CAFRegionChunk>;

declare const enum CAFRegionFlags {

	kCAFRegionFlag_LoopEnable = 1,

	kCAFRegionFlag_PlayForward = 2,

	kCAFRegionFlag_PlayBackward = 4
}

interface CAFStringID {
	mStringID: number;
	mStringStartByteOffset: number;
}
declare var CAFStringID: interop.StructType<CAFStringID>;

interface CAFStrings {
	mNumEntries: number;
	mStringsIDs: interop.Reference<CAFStringID>;
}
declare var CAFStrings: interop.StructType<CAFStrings>;

interface CAFUMIDChunk {
	mBytes: interop.Reference<number>;
}
declare var CAFUMIDChunk: interop.StructType<CAFUMIDChunk>;

interface CAF_SMPTE_Time {
	mHours: number;
	mMinutes: number;
	mSeconds: number;
	mFrames: number;
	mSubFrameSampleOffset: number;
}
declare var CAF_SMPTE_Time: interop.StructType<CAF_SMPTE_Time>;

interface CAF_UUID_ChunkHeader {
	mHeader: CAFChunkHeader;
	mUUID: interop.Reference<number>;
}
declare var CAF_UUID_ChunkHeader: interop.StructType<CAF_UUID_ChunkHeader>;

declare function CAShow(inObject: interop.Pointer): void;

declare function CAShowFile(inObject: interop.Pointer, inFile: interop.Reference<FILE>): void;

declare function CopyInstrumentInfoFromSoundBank(inURL: NSURL, outInstrumentInfo: interop.Reference<NSArray<any>>): number;

declare function CopyNameFromSoundBank(inURL: NSURL, outName: interop.Reference<string>): number;

declare function DisposeAUGraph(inGraph: interop.Pointer): number;

declare function DisposeMusicEventIterator(inIterator: interop.Pointer): number;

declare function DisposeMusicPlayer(inPlayer: interop.Pointer): number;

declare function DisposeMusicSequence(inSequence: interop.Pointer): number;

declare function ExtAudioFileCreateWithURL(inURL: NSURL, inFileType: number, inStreamDesc: interop.Reference<AudioStreamBasicDescription>, inChannelLayout: interop.Reference<AudioChannelLayout>, inFlags: number, outExtAudioFile: interop.Reference<interop.Pointer>): number;

declare function ExtAudioFileDispose(inExtAudioFile: interop.Pointer): number;

declare function ExtAudioFileGetProperty(inExtAudioFile: interop.Pointer, inPropertyID: number, ioPropertyDataSize: interop.Reference<number>, outPropertyData: interop.Pointer): number;

declare function ExtAudioFileGetPropertyInfo(inExtAudioFile: interop.Pointer, inPropertyID: number, outSize: interop.Reference<number>, outWritable: string): number;

declare function ExtAudioFileOpenURL(inURL: NSURL, outExtAudioFile: interop.Reference<interop.Pointer>): number;

declare function ExtAudioFileRead(inExtAudioFile: interop.Pointer, ioNumberFrames: interop.Reference<number>, ioData: interop.Reference<AudioBufferList>): number;

declare function ExtAudioFileSeek(inExtAudioFile: interop.Pointer, inFrameOffset: number): number;

declare function ExtAudioFileSetProperty(inExtAudioFile: interop.Pointer, inPropertyID: number, inPropertyDataSize: number, inPropertyData: interop.Pointer): number;

declare function ExtAudioFileTell(inExtAudioFile: interop.Pointer, outFrameOffset: interop.Reference<number>): number;

declare function ExtAudioFileWrapAudioFileID(inFileID: interop.Pointer, inForWriting: boolean, outExtAudioFile: interop.Reference<interop.Pointer>): number;

declare function ExtAudioFileWrite(inExtAudioFile: interop.Pointer, inNumberFrames: number, ioData: interop.Reference<AudioBufferList>): number;

declare function ExtAudioFileWriteAsync(inExtAudioFile: interop.Pointer, inNumberFrames: number, ioData: interop.Reference<AudioBufferList>): number;

interface ExtendedAudioFormatInfo {
	mASBD: AudioStreamBasicDescription;
	mMagicCookie: interop.Pointer;
	mMagicCookieSize: number;
	mClassDescription: AudioClassDescription;
}
declare var ExtendedAudioFormatInfo: interop.StructType<ExtendedAudioFormatInfo>;

interface ExtendedNoteOnEvent {
	instrumentID: number;
	groupID: number;
	duration: number;
	extendedParams: MusicDeviceNoteParams;
}
declare var ExtendedNoteOnEvent: interop.StructType<ExtendedNoteOnEvent>;

interface ExtendedTempoEvent {
	bpm: number;
}
declare var ExtendedTempoEvent: interop.StructType<ExtendedTempoEvent>;

interface MIDIChannelMessage {
	status: number;
	data1: number;
	data2: number;
	reserved: number;
}
declare var MIDIChannelMessage: interop.StructType<MIDIChannelMessage>;

interface MIDIMetaEvent {
	metaEventType: number;
	unused1: number;
	unused2: number;
	unused3: number;
	dataLength: number;
	data: interop.Reference<number>;
}
declare var MIDIMetaEvent: interop.StructType<MIDIMetaEvent>;

interface MIDINoteMessage {
	channel: number;
	note: number;
	velocity: number;
	releaseVelocity: number;
	duration: number;
}
declare var MIDINoteMessage: interop.StructType<MIDINoteMessage>;

interface MIDIRawData {
	length: number;
	data: interop.Reference<number>;
}
declare var MIDIRawData: interop.StructType<MIDIRawData>;

declare function MusicEventIteratorDeleteEvent(inIterator: interop.Pointer): number;

declare function MusicEventIteratorGetEventInfo(inIterator: interop.Pointer, outTimeStamp: interop.Reference<number>, outEventType: interop.Reference<number>, outEventData: interop.Reference<interop.Pointer>, outEventDataSize: interop.Reference<number>): number;

declare function MusicEventIteratorHasCurrentEvent(inIterator: interop.Pointer, outHasCurEvent: string): number;

declare function MusicEventIteratorHasNextEvent(inIterator: interop.Pointer, outHasNextEvent: string): number;

declare function MusicEventIteratorHasPreviousEvent(inIterator: interop.Pointer, outHasPrevEvent: string): number;

declare function MusicEventIteratorNextEvent(inIterator: interop.Pointer): number;

declare function MusicEventIteratorPreviousEvent(inIterator: interop.Pointer): number;

declare function MusicEventIteratorSeek(inIterator: interop.Pointer, inTimeStamp: number): number;

declare function MusicEventIteratorSetEventInfo(inIterator: interop.Pointer, inEventType: number, inEventData: interop.Pointer): number;

declare function MusicEventIteratorSetEventTime(inIterator: interop.Pointer, inTimeStamp: number): number;

interface MusicEventUserData {
	length: number;
	data: interop.Reference<number>;
}
declare var MusicEventUserData: interop.StructType<MusicEventUserData>;

declare function MusicPlayerGetBeatsForHostTime(inPlayer: interop.Pointer, inHostTime: number, outBeats: interop.Reference<number>): number;

declare function MusicPlayerGetHostTimeForBeats(inPlayer: interop.Pointer, inBeats: number, outHostTime: interop.Reference<number>): number;

declare function MusicPlayerGetPlayRateScalar(inPlayer: interop.Pointer, outScaleRate: interop.Reference<number>): number;

declare function MusicPlayerGetSequence(inPlayer: interop.Pointer, outSequence: interop.Reference<interop.Pointer>): number;

declare function MusicPlayerGetTime(inPlayer: interop.Pointer, outTime: interop.Reference<number>): number;

declare function MusicPlayerIsPlaying(inPlayer: interop.Pointer, outIsPlaying: string): number;

declare function MusicPlayerPreroll(inPlayer: interop.Pointer): number;

declare function MusicPlayerSetPlayRateScalar(inPlayer: interop.Pointer, inScaleRate: number): number;

declare function MusicPlayerSetSequence(inPlayer: interop.Pointer, inSequence: interop.Pointer): number;

declare function MusicPlayerSetTime(inPlayer: interop.Pointer, inTime: number): number;

declare function MusicPlayerStart(inPlayer: interop.Pointer): number;

declare function MusicPlayerStop(inPlayer: interop.Pointer): number;

declare function MusicSequenceBarBeatTimeToBeats(inSequence: interop.Pointer, inBarBeatTime: interop.Reference<CABarBeatTime>, outBeats: interop.Reference<number>): number;

declare function MusicSequenceBeatsToBarBeatTime(inSequence: interop.Pointer, inBeats: number, inSubbeatDivisor: number, outBarBeatTime: interop.Reference<CABarBeatTime>): number;

declare function MusicSequenceDisposeTrack(inSequence: interop.Pointer, inTrack: interop.Pointer): number;

declare function MusicSequenceFileCreate(inSequence: interop.Pointer, inFileRef: NSURL, inFileType: MusicSequenceFileTypeID, inFlags: MusicSequenceFileFlags, inResolution: number): number;

declare function MusicSequenceFileCreateData(inSequence: interop.Pointer, inFileType: MusicSequenceFileTypeID, inFlags: MusicSequenceFileFlags, inResolution: number, outData: interop.Reference<NSData>): number;

declare const enum MusicSequenceFileFlags {

	kMusicSequenceFileFlags_Default = 0,

	kMusicSequenceFileFlags_EraseFile = 1
}

declare function MusicSequenceFileLoad(inSequence: interop.Pointer, inFileRef: NSURL, inFileTypeHint: MusicSequenceFileTypeID, inFlags: MusicSequenceLoadFlags): number;

declare function MusicSequenceFileLoadData(inSequence: interop.Pointer, inData: NSData, inFileTypeHint: MusicSequenceFileTypeID, inFlags: MusicSequenceLoadFlags): number;

declare const enum MusicSequenceFileTypeID {

	kMusicSequenceFile_AnyType = 0,

	kMusicSequenceFile_MIDIType = 1835623529,

	kMusicSequenceFile_iMelodyType = 1768777068
}

declare function MusicSequenceGetAUGraph(inSequence: interop.Pointer, outGraph: interop.Reference<interop.Pointer>): number;

declare function MusicSequenceGetBeatsForSeconds(inSequence: interop.Pointer, inSeconds: number, outBeats: interop.Reference<number>): number;

declare function MusicSequenceGetIndTrack(inSequence: interop.Pointer, inTrackIndex: number, outTrack: interop.Reference<interop.Pointer>): number;

declare function MusicSequenceGetInfoDictionary(inSequence: interop.Pointer): NSDictionary<any, any>;

declare function MusicSequenceGetSecondsForBeats(inSequence: interop.Pointer, inBeats: number, outSeconds: interop.Reference<number>): number;

declare function MusicSequenceGetSequenceType(inSequence: interop.Pointer, outType: interop.Reference<MusicSequenceType>): number;

declare function MusicSequenceGetTempoTrack(inSequence: interop.Pointer, outTrack: interop.Reference<interop.Pointer>): number;

declare function MusicSequenceGetTrackCount(inSequence: interop.Pointer, outNumberOfTracks: interop.Reference<number>): number;

declare function MusicSequenceGetTrackIndex(inSequence: interop.Pointer, inTrack: interop.Pointer, outTrackIndex: interop.Reference<number>): number;

declare const enum MusicSequenceLoadFlags {

	kMusicSequenceLoadSMF_PreserveTracks = 0,

	kMusicSequenceLoadSMF_ChannelsToTracks = 1
}

declare function MusicSequenceNewTrack(inSequence: interop.Pointer, outTrack: interop.Reference<interop.Pointer>): number;

declare function MusicSequenceReverse(inSequence: interop.Pointer): number;

declare function MusicSequenceSetAUGraph(inSequence: interop.Pointer, inGraph: interop.Pointer): number;

declare function MusicSequenceSetMIDIEndpoint(inSequence: interop.Pointer, inEndpoint: number): number;

declare function MusicSequenceSetSequenceType(inSequence: interop.Pointer, inType: MusicSequenceType): number;

declare function MusicSequenceSetUserCallback(inSequence: interop.Pointer, inCallback: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer, p4: number, p5: interop.Reference<MusicEventUserData>, p6: number, p7: number) => void>, inClientData: interop.Pointer): number;

declare const enum MusicSequenceType {

	kMusicSequenceType_Beats = 1650811252,

	kMusicSequenceType_Seconds = 1936024435,

	kMusicSequenceType_Samples = 1935764848
}

declare function MusicTrackClear(inTrack: interop.Pointer, inStartTime: number, inEndTime: number): number;

declare function MusicTrackCopyInsert(inSourceTrack: interop.Pointer, inSourceStartTime: number, inSourceEndTime: number, inDestTrack: interop.Pointer, inDestInsertTime: number): number;

declare function MusicTrackCut(inTrack: interop.Pointer, inStartTime: number, inEndTime: number): number;

declare function MusicTrackGetDestMIDIEndpoint(inTrack: interop.Pointer, outEndpoint: interop.Reference<number>): number;

declare function MusicTrackGetDestNode(inTrack: interop.Pointer, outNode: interop.Reference<number>): number;

declare function MusicTrackGetProperty(inTrack: interop.Pointer, inPropertyID: number, outData: interop.Pointer, ioLength: interop.Reference<number>): number;

declare function MusicTrackGetSequence(inTrack: interop.Pointer, outSequence: interop.Reference<interop.Pointer>): number;

interface MusicTrackLoopInfo {
	loopDuration: number;
	numberOfLoops: number;
}
declare var MusicTrackLoopInfo: interop.StructType<MusicTrackLoopInfo>;

declare function MusicTrackMerge(inSourceTrack: interop.Pointer, inSourceStartTime: number, inSourceEndTime: number, inDestTrack: interop.Pointer, inDestInsertTime: number): number;

declare function MusicTrackMoveEvents(inTrack: interop.Pointer, inStartTime: number, inEndTime: number, inMoveTime: number): number;

declare function MusicTrackNewAUPresetEvent(inTrack: interop.Pointer, inTimeStamp: number, inPresetEvent: interop.Reference<AUPresetEvent>): number;

declare function MusicTrackNewExtendedNoteEvent(inTrack: interop.Pointer, inTimeStamp: number, inInfo: interop.Reference<ExtendedNoteOnEvent>): number;

declare function MusicTrackNewExtendedTempoEvent(inTrack: interop.Pointer, inTimeStamp: number, inBPM: number): number;

declare function MusicTrackNewMIDIChannelEvent(inTrack: interop.Pointer, inTimeStamp: number, inMessage: interop.Reference<MIDIChannelMessage>): number;

declare function MusicTrackNewMIDINoteEvent(inTrack: interop.Pointer, inTimeStamp: number, inMessage: interop.Reference<MIDINoteMessage>): number;

declare function MusicTrackNewMIDIRawDataEvent(inTrack: interop.Pointer, inTimeStamp: number, inRawData: interop.Reference<MIDIRawData>): number;

declare function MusicTrackNewMetaEvent(inTrack: interop.Pointer, inTimeStamp: number, inMetaEvent: interop.Reference<MIDIMetaEvent>): number;

declare function MusicTrackNewParameterEvent(inTrack: interop.Pointer, inTimeStamp: number, inInfo: interop.Reference<ParameterEvent>): number;

declare function MusicTrackNewUserEvent(inTrack: interop.Pointer, inTimeStamp: number, inUserData: interop.Reference<MusicEventUserData>): number;

declare function MusicTrackSetDestMIDIEndpoint(inTrack: interop.Pointer, inEndpoint: number): number;

declare function MusicTrackSetDestNode(inTrack: interop.Pointer, inNode: number): number;

declare function MusicTrackSetProperty(inTrack: interop.Pointer, inPropertyID: number, inData: interop.Pointer, inLength: number): number;

declare function NewAUGraph(outGraph: interop.Reference<interop.Pointer>): number;

declare function NewMusicEventIterator(inTrack: interop.Pointer, outIterator: interop.Reference<interop.Pointer>): number;

declare function NewMusicPlayer(outPlayer: interop.Reference<interop.Pointer>): number;

declare function NewMusicSequence(outSequence: interop.Reference<interop.Pointer>): number;

interface ParameterEvent {
	parameterID: number;
	scope: number;
	element: number;
	value: number;
}
declare var ParameterEvent: interop.StructType<ParameterEvent>;

declare var kAudioSessionInputRoute_BluetoothHFP: string;

declare var kAudioSessionInputRoute_BuiltInMic: string;

declare var kAudioSessionInputRoute_HeadsetMic: string;

declare var kAudioSessionInputRoute_LineIn: string;

declare var kAudioSessionInputRoute_USBAudio: string;

declare var kAudioSessionOutputRoute_AirPlay: string;

declare var kAudioSessionOutputRoute_BluetoothA2DP: string;

declare var kAudioSessionOutputRoute_BluetoothHFP: string;

declare var kAudioSessionOutputRoute_BuiltInReceiver: string;

declare var kAudioSessionOutputRoute_BuiltInSpeaker: string;

declare var kAudioSessionOutputRoute_HDMI: string;

declare var kAudioSessionOutputRoute_Headphones: string;

declare var kAudioSessionOutputRoute_LineOut: string;

declare var kAudioSessionOutputRoute_USBAudio: string;

declare var kAudioSession_AudioRouteChangeKey_CurrentRouteDescription: string;

declare var kAudioSession_AudioRouteChangeKey_PreviousRouteDescription: string;

declare var kAudioSession_AudioRouteKey_Inputs: string;

declare var kAudioSession_AudioRouteKey_Outputs: string;

declare var kAudioSession_AudioRouteKey_Type: string;

declare var kAudioSession_InputSourceKey_Description: string;

declare var kAudioSession_InputSourceKey_ID: string;

declare var kAudioSession_OutputDestinationKey_Description: string;

declare var kAudioSession_OutputDestinationKey_ID: string;

declare var kAudioSession_RouteChangeKey_Reason: string;
