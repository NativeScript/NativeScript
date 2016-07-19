
interface AudioBuffer {
	mNumberChannels: number;
	mDataByteSize: number;
	mData: interop.Pointer;
}
declare var AudioBuffer: interop.StructType<AudioBuffer>;

interface AudioBufferList {
	mNumberBuffers: number;
	mBuffers: interop.Reference<AudioBuffer>;
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

	kAudioChannelBit_TopBackRight = 131072
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
	mInputData: interop.Pointer;
	mInputDataSize: number;
	mOutputData: interop.Pointer;
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

declare var kAudioStreamAnyRate: number;
