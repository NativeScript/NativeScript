
declare const enum AVAudioSessionErrorCode {

	None = 0,

	MediaServicesFailed = 1836282486,

	IsBusy = 560030580,

	IncompatibleCategory = 560161140,

	CannotInterruptOthers = 560557684,

	MissingEntitlement = 1701737535,

	SiriIsRecording = 1936290409,

	CannotStartPlaying = 561015905,

	CannotStartRecording = 561145187,

	BadParam = -50,

	InsufficientPriority = 561017449,

	ResourceNotAvailable = 561145203,

	Unspecified = 2003329396,

	ExpiredSession = 561210739,

	SessionNotActive = 1768841571
}

declare const AVAudioSessionErrorInsufficientPriority: number;

interface _AudioBuffer {
	mNumberChannels: number;
	mDataByteSize: number;
	mData: interop.Pointer | interop.Reference<any>;
}
declare var _AudioBuffer: interop.StructType<_AudioBuffer>;

interface AudioBufferList {
	mNumberBuffers: number;
	mBuffers: interop.Reference<_AudioBuffer>;
}
declare var AudioBufferList: interop.StructType<AudioBufferList>;

declare const enum AudioChannelBitmap {

	kAudioChannelBit_Left = 1,

	kAudioChannelBit_Right = 2,

	kAudioChannelBit_Center = 4,

	kAudioChannelBit_LFEScreen = 8,

	kAudioChannelBit_LeftSurround = 16,

	kAudioChannelBit_RightSurround = 32,

	kAudioChannelBit_LeftCenter = 64,

	kAudioChannelBit_RightCenter = 128,

	kAudioChannelBit_CenterSurround = 256,

	kAudioChannelBit_LeftSurroundDirect = 512,

	kAudioChannelBit_RightSurroundDirect = 1024,

	kAudioChannelBit_TopCenterSurround = 2048,

	kAudioChannelBit_VerticalHeightLeft = 4096,

	kAudioChannelBit_VerticalHeightCenter = 8192,

	kAudioChannelBit_VerticalHeightRight = 16384,

	kAudioChannelBit_TopBackLeft = 32768,

	kAudioChannelBit_TopBackCenter = 65536,

	kAudioChannelBit_TopBackRight = 131072,

	kAudioChannelBit_LeftTopFront = 4096,

	kAudioChannelBit_CenterTopFront = 8192,

	kAudioChannelBit_RightTopFront = 16384,

	kAudioChannelBit_LeftTopMiddle = 2097152,

	kAudioChannelBit_CenterTopMiddle = 2048,

	kAudioChannelBit_RightTopMiddle = 8388608,

	kAudioChannelBit_LeftTopRear = 16777216,

	kAudioChannelBit_CenterTopRear = 33554432,

	kAudioChannelBit_RightTopRear = 67108864
}

declare const enum AudioChannelCoordinateIndex {

	kAudioChannelCoordinates_LeftRight = 0,

	kAudioChannelCoordinates_BackFront = 1,

	kAudioChannelCoordinates_DownUp = 2,

	kAudioChannelCoordinates_Azimuth = 0,

	kAudioChannelCoordinates_Elevation = 1,

	kAudioChannelCoordinates_Distance = 2
}

interface AudioChannelDescription {
	mChannelLabel: number;
	mChannelFlags: AudioChannelFlags;
	mCoordinates: interop.Reference<number>;
}
declare var AudioChannelDescription: interop.StructType<AudioChannelDescription>;

declare const enum AudioChannelFlags {

	kAudioChannelFlags_AllOff = 0,

	kAudioChannelFlags_RectangularCoordinates = 1,

	kAudioChannelFlags_SphericalCoordinates = 2,

	kAudioChannelFlags_Meters = 4
}

interface AudioChannelLayout {
	mChannelLayoutTag: number;
	mChannelBitmap: AudioChannelBitmap;
	mNumberChannelDescriptions: number;
	mChannelDescriptions: interop.Reference<AudioChannelDescription>;
}
declare var AudioChannelLayout: interop.StructType<AudioChannelLayout>;

interface AudioClassDescription {
	mType: number;
	mSubType: number;
	mManufacturer: number;
}
declare var AudioClassDescription: interop.StructType<AudioClassDescription>;

interface AudioFormatListItem {
	mASBD: AudioStreamBasicDescription;
	mChannelLayoutTag: number;
}
declare var AudioFormatListItem: interop.StructType<AudioFormatListItem>;

interface AudioStreamBasicDescription {
	mSampleRate: number;
	mFormatID: number;
	mFormatFlags: number;
	mBytesPerPacket: number;
	mFramesPerPacket: number;
	mBytesPerFrame: number;
	mChannelsPerFrame: number;
	mBitsPerChannel: number;
	mReserved: number;
}
declare var AudioStreamBasicDescription: interop.StructType<AudioStreamBasicDescription>;

interface AudioStreamPacketDescription {
	mStartOffset: number;
	mVariableFramesInPacket: number;
	mDataByteSize: number;
}
declare var AudioStreamPacketDescription: interop.StructType<AudioStreamPacketDescription>;

interface AudioTimeStamp {
	mSampleTime: number;
	mHostTime: number;
	mRateScalar: number;
	mWordClockTime: number;
	mSMPTETime: SMPTETime;
	mFlags: AudioTimeStampFlags;
	mReserved: number;
}
declare var AudioTimeStamp: interop.StructType<AudioTimeStamp>;

declare const enum AudioTimeStampFlags {

	kAudioTimeStampNothingValid = 0,

	kAudioTimeStampSampleTimeValid = 1,

	kAudioTimeStampHostTimeValid = 2,

	kAudioTimeStampRateScalarValid = 4,

	kAudioTimeStampWordClockTimeValid = 8,

	kAudioTimeStampSMPTETimeValid = 16,

	kAudioTimeStampSampleHostTimeValid = 3
}

interface AudioValueRange {
	mMinimum: number;
	mMaximum: number;
}
declare var AudioValueRange: interop.StructType<AudioValueRange>;

interface AudioValueTranslation {
	mInputData: interop.Pointer | interop.Reference<any>;
	mInputDataSize: number;
	mOutputData: interop.Pointer | interop.Reference<any>;
	mOutputDataSize: number;
}
declare var AudioValueTranslation: interop.StructType<AudioValueTranslation>;

declare const enum MPEG4ObjectID {

	kMPEG4Object_AAC_Main = 1,

	kMPEG4Object_AAC_LC = 2,

	kMPEG4Object_AAC_SSR = 3,

	kMPEG4Object_AAC_LTP = 4,

	kMPEG4Object_AAC_SBR = 5,

	kMPEG4Object_AAC_Scalable = 6,

	kMPEG4Object_TwinVQ = 7,

	kMPEG4Object_CELP = 8,

	kMPEG4Object_HVXC = 9
}

interface SMPTETime {
	mSubframes: number;
	mSubframeDivisor: number;
	mCounter: number;
	mType: SMPTETimeType;
	mFlags: SMPTETimeFlags;
	mHours: number;
	mMinutes: number;
	mSeconds: number;
	mFrames: number;
}
declare var SMPTETime: interop.StructType<SMPTETime>;

declare const enum SMPTETimeFlags {

	kSMPTETimeUnknown = 0,

	kSMPTETimeValid = 1,

	kSMPTETimeRunning = 2
}

declare const enum SMPTETimeType {

	kSMPTETimeType24 = 0,

	kSMPTETimeType25 = 1,

	kSMPTETimeType30Drop = 2,

	kSMPTETimeType30 = 3,

	kSMPTETimeType2997 = 4,

	kSMPTETimeType2997Drop = 5,

	kSMPTETimeType60 = 6,

	kSMPTETimeType5994 = 7,

	kSMPTETimeType60Drop = 8,

	kSMPTETimeType5994Drop = 9,

	kSMPTETimeType50 = 10,

	kSMPTETimeType2398 = 11
}

declare const kAppleLosslessFormatFlag_16BitSourceData: number;

declare const kAppleLosslessFormatFlag_20BitSourceData: number;

declare const kAppleLosslessFormatFlag_24BitSourceData: number;

declare const kAppleLosslessFormatFlag_32BitSourceData: number;

declare const kAudioChannelLabel_Ambisonic_W: number;

declare const kAudioChannelLabel_Ambisonic_X: number;

declare const kAudioChannelLabel_Ambisonic_Y: number;

declare const kAudioChannelLabel_Ambisonic_Z: number;

declare const kAudioChannelLabel_BeginReserved: number;

declare const kAudioChannelLabel_BinauralLeft: number;

declare const kAudioChannelLabel_BinauralRight: number;

declare const kAudioChannelLabel_Center: number;

declare const kAudioChannelLabel_CenterSurround: number;

declare const kAudioChannelLabel_CenterSurroundDirect: number;

declare const kAudioChannelLabel_CenterTopFront: number;

declare const kAudioChannelLabel_CenterTopMiddle: number;

declare const kAudioChannelLabel_CenterTopRear: number;

declare const kAudioChannelLabel_ClickTrack: number;

declare const kAudioChannelLabel_DialogCentricMix: number;

declare const kAudioChannelLabel_Discrete: number;

declare const kAudioChannelLabel_Discrete_0: number;

declare const kAudioChannelLabel_Discrete_1: number;

declare const kAudioChannelLabel_Discrete_10: number;

declare const kAudioChannelLabel_Discrete_11: number;

declare const kAudioChannelLabel_Discrete_12: number;

declare const kAudioChannelLabel_Discrete_13: number;

declare const kAudioChannelLabel_Discrete_14: number;

declare const kAudioChannelLabel_Discrete_15: number;

declare const kAudioChannelLabel_Discrete_2: number;

declare const kAudioChannelLabel_Discrete_3: number;

declare const kAudioChannelLabel_Discrete_4: number;

declare const kAudioChannelLabel_Discrete_5: number;

declare const kAudioChannelLabel_Discrete_6: number;

declare const kAudioChannelLabel_Discrete_65535: number;

declare const kAudioChannelLabel_Discrete_7: number;

declare const kAudioChannelLabel_Discrete_8: number;

declare const kAudioChannelLabel_Discrete_9: number;

declare const kAudioChannelLabel_EndReserved: number;

declare const kAudioChannelLabel_ForeignLanguage: number;

declare const kAudioChannelLabel_HOA_ACN: number;

declare const kAudioChannelLabel_HOA_ACN_0: number;

declare const kAudioChannelLabel_HOA_ACN_1: number;

declare const kAudioChannelLabel_HOA_ACN_10: number;

declare const kAudioChannelLabel_HOA_ACN_11: number;

declare const kAudioChannelLabel_HOA_ACN_12: number;

declare const kAudioChannelLabel_HOA_ACN_13: number;

declare const kAudioChannelLabel_HOA_ACN_14: number;

declare const kAudioChannelLabel_HOA_ACN_15: number;

declare const kAudioChannelLabel_HOA_ACN_2: number;

declare const kAudioChannelLabel_HOA_ACN_3: number;

declare const kAudioChannelLabel_HOA_ACN_4: number;

declare const kAudioChannelLabel_HOA_ACN_5: number;

declare const kAudioChannelLabel_HOA_ACN_6: number;

declare const kAudioChannelLabel_HOA_ACN_65024: number;

declare const kAudioChannelLabel_HOA_ACN_7: number;

declare const kAudioChannelLabel_HOA_ACN_8: number;

declare const kAudioChannelLabel_HOA_ACN_9: number;

declare const kAudioChannelLabel_Haptic: number;

declare const kAudioChannelLabel_HeadphonesLeft: number;

declare const kAudioChannelLabel_HeadphonesRight: number;

declare const kAudioChannelLabel_HearingImpaired: number;

declare const kAudioChannelLabel_LFE2: number;

declare const kAudioChannelLabel_LFEScreen: number;

declare const kAudioChannelLabel_Left: number;

declare const kAudioChannelLabel_LeftCenter: number;

declare const kAudioChannelLabel_LeftSurround: number;

declare const kAudioChannelLabel_LeftSurroundDirect: number;

declare const kAudioChannelLabel_LeftTopFront: number;

declare const kAudioChannelLabel_LeftTopMiddle: number;

declare const kAudioChannelLabel_LeftTopRear: number;

declare const kAudioChannelLabel_LeftTotal: number;

declare const kAudioChannelLabel_LeftWide: number;

declare const kAudioChannelLabel_MS_Mid: number;

declare const kAudioChannelLabel_MS_Side: number;

declare const kAudioChannelLabel_Mono: number;

declare const kAudioChannelLabel_Narration: number;

declare const kAudioChannelLabel_RearSurroundLeft: number;

declare const kAudioChannelLabel_RearSurroundRight: number;

declare const kAudioChannelLabel_Right: number;

declare const kAudioChannelLabel_RightCenter: number;

declare const kAudioChannelLabel_RightSurround: number;

declare const kAudioChannelLabel_RightSurroundDirect: number;

declare const kAudioChannelLabel_RightTopFront: number;

declare const kAudioChannelLabel_RightTopMiddle: number;

declare const kAudioChannelLabel_RightTopRear: number;

declare const kAudioChannelLabel_RightTotal: number;

declare const kAudioChannelLabel_RightWide: number;

declare const kAudioChannelLabel_TopBackCenter: number;

declare const kAudioChannelLabel_TopBackLeft: number;

declare const kAudioChannelLabel_TopBackRight: number;

declare const kAudioChannelLabel_TopCenterSurround: number;

declare const kAudioChannelLabel_Unknown: number;

declare const kAudioChannelLabel_Unused: number;

declare const kAudioChannelLabel_UseCoordinates: number;

declare const kAudioChannelLabel_VerticalHeightCenter: number;

declare const kAudioChannelLabel_VerticalHeightLeft: number;

declare const kAudioChannelLabel_VerticalHeightRight: number;

declare const kAudioChannelLabel_XY_X: number;

declare const kAudioChannelLabel_XY_Y: number;

declare const kAudioChannelLayoutTag_AAC_3_0: number;

declare const kAudioChannelLayoutTag_AAC_4_0: number;

declare const kAudioChannelLayoutTag_AAC_5_0: number;

declare const kAudioChannelLayoutTag_AAC_5_1: number;

declare const kAudioChannelLayoutTag_AAC_6_0: number;

declare const kAudioChannelLayoutTag_AAC_6_1: number;

declare const kAudioChannelLayoutTag_AAC_7_0: number;

declare const kAudioChannelLayoutTag_AAC_7_1: number;

declare const kAudioChannelLayoutTag_AAC_7_1_B: number;

declare const kAudioChannelLayoutTag_AAC_7_1_C: number;

declare const kAudioChannelLayoutTag_AAC_Octagonal: number;

declare const kAudioChannelLayoutTag_AAC_Quadraphonic: number;

declare const kAudioChannelLayoutTag_AC3_1_0_1: number;

declare const kAudioChannelLayoutTag_AC3_2_1_1: number;

declare const kAudioChannelLayoutTag_AC3_3_0: number;

declare const kAudioChannelLayoutTag_AC3_3_0_1: number;

declare const kAudioChannelLayoutTag_AC3_3_1: number;

declare const kAudioChannelLayoutTag_AC3_3_1_1: number;

declare const kAudioChannelLayoutTag_Ambisonic_B_Format: number;

declare const kAudioChannelLayoutTag_Atmos_5_1_2: number;

declare const kAudioChannelLayoutTag_Atmos_7_1_4: number;

declare const kAudioChannelLayoutTag_Atmos_9_1_6: number;

declare const kAudioChannelLayoutTag_AudioUnit_4: number;

declare const kAudioChannelLayoutTag_AudioUnit_5: number;

declare const kAudioChannelLayoutTag_AudioUnit_5_0: number;

declare const kAudioChannelLayoutTag_AudioUnit_5_1: number;

declare const kAudioChannelLayoutTag_AudioUnit_6: number;

declare const kAudioChannelLayoutTag_AudioUnit_6_0: number;

declare const kAudioChannelLayoutTag_AudioUnit_6_1: number;

declare const kAudioChannelLayoutTag_AudioUnit_7_0: number;

declare const kAudioChannelLayoutTag_AudioUnit_7_0_Front: number;

declare const kAudioChannelLayoutTag_AudioUnit_7_1: number;

declare const kAudioChannelLayoutTag_AudioUnit_7_1_Front: number;

declare const kAudioChannelLayoutTag_AudioUnit_8: number;

declare const kAudioChannelLayoutTag_BeginReserved: number;

declare const kAudioChannelLayoutTag_Binaural: number;

declare const kAudioChannelLayoutTag_Cube: number;

declare const kAudioChannelLayoutTag_DTS_3_1: number;

declare const kAudioChannelLayoutTag_DTS_4_1: number;

declare const kAudioChannelLayoutTag_DTS_6_0_A: number;

declare const kAudioChannelLayoutTag_DTS_6_0_B: number;

declare const kAudioChannelLayoutTag_DTS_6_0_C: number;

declare const kAudioChannelLayoutTag_DTS_6_1_A: number;

declare const kAudioChannelLayoutTag_DTS_6_1_B: number;

declare const kAudioChannelLayoutTag_DTS_6_1_C: number;

declare const kAudioChannelLayoutTag_DTS_6_1_D: number;

declare const kAudioChannelLayoutTag_DTS_7_0: number;

declare const kAudioChannelLayoutTag_DTS_7_1: number;

declare const kAudioChannelLayoutTag_DTS_8_0_A: number;

declare const kAudioChannelLayoutTag_DTS_8_0_B: number;

declare const kAudioChannelLayoutTag_DTS_8_1_A: number;

declare const kAudioChannelLayoutTag_DTS_8_1_B: number;

declare const kAudioChannelLayoutTag_DVD_0: number;

declare const kAudioChannelLayoutTag_DVD_1: number;

declare const kAudioChannelLayoutTag_DVD_10: number;

declare const kAudioChannelLayoutTag_DVD_11: number;

declare const kAudioChannelLayoutTag_DVD_12: number;

declare const kAudioChannelLayoutTag_DVD_13: number;

declare const kAudioChannelLayoutTag_DVD_14: number;

declare const kAudioChannelLayoutTag_DVD_15: number;

declare const kAudioChannelLayoutTag_DVD_16: number;

declare const kAudioChannelLayoutTag_DVD_17: number;

declare const kAudioChannelLayoutTag_DVD_18: number;

declare const kAudioChannelLayoutTag_DVD_19: number;

declare const kAudioChannelLayoutTag_DVD_2: number;

declare const kAudioChannelLayoutTag_DVD_20: number;

declare const kAudioChannelLayoutTag_DVD_3: number;

declare const kAudioChannelLayoutTag_DVD_4: number;

declare const kAudioChannelLayoutTag_DVD_5: number;

declare const kAudioChannelLayoutTag_DVD_6: number;

declare const kAudioChannelLayoutTag_DVD_7: number;

declare const kAudioChannelLayoutTag_DVD_8: number;

declare const kAudioChannelLayoutTag_DVD_9: number;

declare const kAudioChannelLayoutTag_DiscreteInOrder: number;

declare const kAudioChannelLayoutTag_EAC3_6_1_A: number;

declare const kAudioChannelLayoutTag_EAC3_6_1_B: number;

declare const kAudioChannelLayoutTag_EAC3_6_1_C: number;

declare const kAudioChannelLayoutTag_EAC3_7_1_A: number;

declare const kAudioChannelLayoutTag_EAC3_7_1_B: number;

declare const kAudioChannelLayoutTag_EAC3_7_1_C: number;

declare const kAudioChannelLayoutTag_EAC3_7_1_D: number;

declare const kAudioChannelLayoutTag_EAC3_7_1_E: number;

declare const kAudioChannelLayoutTag_EAC3_7_1_F: number;

declare const kAudioChannelLayoutTag_EAC3_7_1_G: number;

declare const kAudioChannelLayoutTag_EAC3_7_1_H: number;

declare const kAudioChannelLayoutTag_EAC_6_0_A: number;

declare const kAudioChannelLayoutTag_EAC_7_0_A: number;

declare const kAudioChannelLayoutTag_Emagic_Default_7_1: number;

declare const kAudioChannelLayoutTag_EndReserved: number;

declare const kAudioChannelLayoutTag_HOA_ACN_N3D: number;

declare const kAudioChannelLayoutTag_HOA_ACN_SN3D: number;

declare const kAudioChannelLayoutTag_Hexagonal: number;

declare const kAudioChannelLayoutTag_ITU_1_0: number;

declare const kAudioChannelLayoutTag_ITU_2_0: number;

declare const kAudioChannelLayoutTag_ITU_2_1: number;

declare const kAudioChannelLayoutTag_ITU_2_2: number;

declare const kAudioChannelLayoutTag_ITU_3_0: number;

declare const kAudioChannelLayoutTag_ITU_3_1: number;

declare const kAudioChannelLayoutTag_ITU_3_2: number;

declare const kAudioChannelLayoutTag_ITU_3_2_1: number;

declare const kAudioChannelLayoutTag_ITU_3_4_1: number;

declare const kAudioChannelLayoutTag_MPEG_1_0: number;

declare const kAudioChannelLayoutTag_MPEG_2_0: number;

declare const kAudioChannelLayoutTag_MPEG_3_0_A: number;

declare const kAudioChannelLayoutTag_MPEG_3_0_B: number;

declare const kAudioChannelLayoutTag_MPEG_4_0_A: number;

declare const kAudioChannelLayoutTag_MPEG_4_0_B: number;

declare const kAudioChannelLayoutTag_MPEG_5_0_A: number;

declare const kAudioChannelLayoutTag_MPEG_5_0_B: number;

declare const kAudioChannelLayoutTag_MPEG_5_0_C: number;

declare const kAudioChannelLayoutTag_MPEG_5_0_D: number;

declare const kAudioChannelLayoutTag_MPEG_5_1_A: number;

declare const kAudioChannelLayoutTag_MPEG_5_1_B: number;

declare const kAudioChannelLayoutTag_MPEG_5_1_C: number;

declare const kAudioChannelLayoutTag_MPEG_5_1_D: number;

declare const kAudioChannelLayoutTag_MPEG_6_1_A: number;

declare const kAudioChannelLayoutTag_MPEG_7_1_A: number;

declare const kAudioChannelLayoutTag_MPEG_7_1_B: number;

declare const kAudioChannelLayoutTag_MPEG_7_1_C: number;

declare const kAudioChannelLayoutTag_MatrixStereo: number;

declare const kAudioChannelLayoutTag_MidSide: number;

declare const kAudioChannelLayoutTag_Mono: number;

declare const kAudioChannelLayoutTag_Octagonal: number;

declare const kAudioChannelLayoutTag_Pentagonal: number;

declare const kAudioChannelLayoutTag_Quadraphonic: number;

declare const kAudioChannelLayoutTag_SMPTE_DTV: number;

declare const kAudioChannelLayoutTag_Stereo: number;

declare const kAudioChannelLayoutTag_StereoHeadphones: number;

declare const kAudioChannelLayoutTag_TMH_10_2_full: number;

declare const kAudioChannelLayoutTag_TMH_10_2_std: number;

declare const kAudioChannelLayoutTag_Unknown: number;

declare const kAudioChannelLayoutTag_UseChannelBitmap: number;

declare const kAudioChannelLayoutTag_UseChannelDescriptions: number;

declare const kAudioChannelLayoutTag_WAVE_2_1: number;

declare const kAudioChannelLayoutTag_WAVE_3_0: number;

declare const kAudioChannelLayoutTag_WAVE_4_0_A: number;

declare const kAudioChannelLayoutTag_WAVE_4_0_B: number;

declare const kAudioChannelLayoutTag_WAVE_5_0_A: number;

declare const kAudioChannelLayoutTag_WAVE_5_0_B: number;

declare const kAudioChannelLayoutTag_WAVE_5_1_A: number;

declare const kAudioChannelLayoutTag_WAVE_5_1_B: number;

declare const kAudioChannelLayoutTag_WAVE_6_1: number;

declare const kAudioChannelLayoutTag_WAVE_7_1: number;

declare const kAudioChannelLayoutTag_XY: number;

declare const kAudioFormat60958AC3: number;

declare const kAudioFormatAC3: number;

declare const kAudioFormatAES3: number;

declare const kAudioFormatALaw: number;

declare const kAudioFormatAMR: number;

declare const kAudioFormatAMR_WB: number;

declare const kAudioFormatAppleIMA4: number;

declare const kAudioFormatAppleLossless: number;

declare const kAudioFormatAudible: number;

declare const kAudioFormatDVIIntelIMA: number;

declare const kAudioFormatEnhancedAC3: number;

declare const kAudioFormatFLAC: number;

declare const kAudioFormatFlagIsAlignedHigh: number;

declare const kAudioFormatFlagIsBigEndian: number;

declare const kAudioFormatFlagIsFloat: number;

declare const kAudioFormatFlagIsNonInterleaved: number;

declare const kAudioFormatFlagIsNonMixable: number;

declare const kAudioFormatFlagIsPacked: number;

declare const kAudioFormatFlagIsSignedInteger: number;

declare const kAudioFormatFlagsAreAllClear: number;

declare const kAudioFormatFlagsAudioUnitCanonical: number;

declare const kAudioFormatFlagsCanonical: number;

declare const kAudioFormatFlagsNativeEndian: number;

declare const kAudioFormatFlagsNativeFloatPacked: number;

declare const kAudioFormatLinearPCM: number;

declare const kAudioFormatMACE3: number;

declare const kAudioFormatMACE6: number;

declare const kAudioFormatMIDIStream: number;

declare const kAudioFormatMPEG4AAC: number;

declare const kAudioFormatMPEG4AAC_ELD: number;

declare const kAudioFormatMPEG4AAC_ELD_SBR: number;

declare const kAudioFormatMPEG4AAC_ELD_V2: number;

declare const kAudioFormatMPEG4AAC_HE: number;

declare const kAudioFormatMPEG4AAC_HE_V2: number;

declare const kAudioFormatMPEG4AAC_LD: number;

declare const kAudioFormatMPEG4AAC_Spatial: number;

declare const kAudioFormatMPEG4CELP: number;

declare const kAudioFormatMPEG4HVXC: number;

declare const kAudioFormatMPEG4TwinVQ: number;

declare const kAudioFormatMPEGD_USAC: number;

declare const kAudioFormatMPEGLayer1: number;

declare const kAudioFormatMPEGLayer2: number;

declare const kAudioFormatMPEGLayer3: number;

declare const kAudioFormatMicrosoftGSM: number;

declare const kAudioFormatOpus: number;

declare const kAudioFormatParameterValueStream: number;

declare const kAudioFormatQDesign: number;

declare const kAudioFormatQDesign2: number;

declare const kAudioFormatQUALCOMM: number;

declare const kAudioFormatTimeCode: number;

declare const kAudioFormatULaw: number;

declare const kAudioFormatiLBC: number;

declare var kAudioStreamAnyRate: number;

declare const kAudio_BadFilePathError: number;

declare const kAudio_FileNotFoundError: number;

declare const kAudio_FilePermissionError: number;

declare const kAudio_MemFullError: number;

declare const kAudio_ParamError: number;

declare const kAudio_TooManyFilesOpenError: number;

declare const kAudio_UnimplementedError: number;

declare const kLinearPCMFormatFlagIsAlignedHigh: number;

declare const kLinearPCMFormatFlagIsBigEndian: number;

declare const kLinearPCMFormatFlagIsFloat: number;

declare const kLinearPCMFormatFlagIsNonInterleaved: number;

declare const kLinearPCMFormatFlagIsNonMixable: number;

declare const kLinearPCMFormatFlagIsPacked: number;

declare const kLinearPCMFormatFlagIsSignedInteger: number;

declare const kLinearPCMFormatFlagsAreAllClear: number;

declare const kLinearPCMFormatFlagsSampleFractionMask: number;

declare const kLinearPCMFormatFlagsSampleFractionShift: number;
