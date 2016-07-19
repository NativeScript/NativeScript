
declare const enum AU3DMixerAttenuationCurve {

	k3DMixerAttenuationCurve_Power = 0,

	k3DMixerAttenuationCurve_Exponential = 1,

	k3DMixerAttenuationCurve_Inverse = 2,

	k3DMixerAttenuationCurve_Linear = 3
}

declare const enum AU3DMixerRenderingFlags {

	k3DMixerRenderingFlags_InterAuralDelay = 1,

	k3DMixerRenderingFlags_DopplerShift = 2,

	k3DMixerRenderingFlags_DistanceAttenuation = 4,

	k3DMixerRenderingFlags_DistanceFilter = 8,

	k3DMixerRenderingFlags_DistanceDiffusion = 16,

	k3DMixerRenderingFlags_LinearDistanceAttenuation = 32,

	k3DMixerRenderingFlags_ConstantReverbBlend = 64
}

declare class AUAudioUnit extends NSObject {

	static alloc(): AUAudioUnit; // inherited from NSObject

	static instantiateWithComponentDescriptionOptionsCompletionHandler(componentDescription: AudioComponentDescription, options: AudioComponentInstantiationOptions, completionHandler: (p1: AUAudioUnit, p2: NSError) => void): void;

	static new(): AUAudioUnit; // inherited from NSObject

	static registerSubclassAsComponentDescriptionNameVersion(cls: typeof NSObject, componentDescription: AudioComponentDescription, name: string, version: number): void;

	/* readonly */ allParameterValues: boolean;

	/* readonly */ audioUnitName: string;

	/* readonly */ canPerformInput: boolean;

	/* readonly */ canPerformOutput: boolean;

	/* readonly */ canProcessInPlace: boolean;

	/* readonly */ channelCapabilities: NSArray<number>;

	/* readonly */ component: interop.Pointer;

	/* readonly */ componentDescription: AudioComponentDescription;

	/* readonly */ componentName: string;

	/* readonly */ componentVersion: number;

	contextName: string;

	currentPreset: AUAudioUnitPreset;

	/* readonly */ factoryPresets: NSArray<AUAudioUnitPreset>;

	fullState: NSDictionary<string, any>;

	fullStateForDocument: NSDictionary<string, any>;

	/* readonly */ inputBusses: AUAudioUnitBusArray;

	inputEnabled: boolean;

	inputHandler: (p1: interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Reference<AudioTimeStamp>, p3: number, p4: number) => void;

	/* readonly */ latency: number;

	/* readonly */ manufacturerName: string;

	maximumFramesToRender: number;

	/* readonly */ musicDeviceOrEffect: boolean;

	musicalContextBlock: (p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>, p5: interop.Reference<number>, p6: interop.Reference<number>) => boolean;

	/* readonly */ outputBusses: AUAudioUnitBusArray;

	outputEnabled: boolean;

	outputProvider: (p1: interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Reference<AudioTimeStamp>, p3: number, p4: number, p5: interop.Reference<AudioBufferList>) => number;

	/* readonly */ parameterTree: AUParameterTree;

	/* readonly */ renderBlock: (p1: interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Reference<AudioTimeStamp>, p3: number, p4: number, p5: interop.Reference<AudioBufferList>, p6: (p1: interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Reference<AudioTimeStamp>, p3: number, p4: number, p5: interop.Reference<AudioBufferList>) => number) => number;

	renderQuality: number;

	/* readonly */ renderResourcesAllocated: boolean;

	renderingOffline: boolean;

	/* readonly */ scheduleMIDIEventBlock: (p1: number, p2: number, p3: number, p4: string) => void;

	/* readonly */ scheduleParameterBlock: (p1: number, p2: number, p3: number, p4: number) => void;

	shouldBypassEffect: boolean;

	/* readonly */ tailTime: number;

	transportStateBlock: (p1: interop.Reference<AUHostTransportStateFlags>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>) => boolean;

	/* readonly */ virtualMIDICableCount: number;

	constructor(); // inherited from NSObject

	constructor(o: { componentDescription: AudioComponentDescription; });

	constructor(o: { componentDescription: AudioComponentDescription; options: AudioComponentInstantiationOptions; });

	allocateRenderResourcesAndReturnError(): boolean;

	deallocateRenderResources(): void;

	parametersForOverviewWithCount(count: number): NSArray<number>;

	removeRenderObserver(token: number): void;

	requestViewControllerWithCompletionHandler(completionHandler: (p1: UIViewController) => void): void;

	reset(): void;

	self(): AUAudioUnit; // inherited from NSObjectProtocol

	setRenderResourcesAllocated(flag: boolean): void;

	shouldChangeToFormatForBus(format: AVAudioFormat, bus: AUAudioUnitBus): boolean;

	startHardwareAndReturnError(): boolean;

	stopHardware(): void;

	tokenByAddingRenderObserver(observer: (p1: AudioUnitRenderActionFlags, p2: interop.Reference<AudioTimeStamp>, p3: number, p4: number) => void): number;
}

declare class AUAudioUnitBus extends NSObject {

	static alloc(): AUAudioUnitBus; // inherited from NSObject

	static new(): AUAudioUnitBus; // inherited from NSObject

	/* readonly */ busType: AUAudioUnitBusType;

	contextPresentationLatency: number;

	enabled: boolean;

	/* readonly */ format: AVAudioFormat;

	/* readonly */ index: number;

	maximumChannelCount: number;

	name: string;

	/* readonly */ ownerAudioUnit: AUAudioUnit;

	supportedChannelCounts: NSArray<number>;

	/* readonly */ supportedChannelLayoutTags: NSArray<number>;

	constructor(); // inherited from NSObject

	constructor(o: { format: AVAudioFormat; });

	self(): AUAudioUnitBus; // inherited from NSObjectProtocol

	setFormatError(format: AVAudioFormat): boolean;
}

declare class AUAudioUnitBusArray extends NSObject implements NSFastEnumeration {

	static alloc(): AUAudioUnitBusArray; // inherited from NSObject

	static new(): AUAudioUnitBusArray; // inherited from NSObject

	/* readonly */ busType: AUAudioUnitBusType;

	/* readonly */ count: number;

	/* readonly */ countChangeable: boolean;

	/* readonly */ ownerAudioUnit: AUAudioUnit;
	[index: number]: AUAudioUnitBus;
	[Symbol.iterator](): Iterator<any>;

	constructor(); // inherited from NSObject

	constructor(o: { audioUnit: AUAudioUnit; busType: AUAudioUnitBusType; });

	constructor(o: { audioUnit: AUAudioUnit; busType: AUAudioUnitBusType; busses: NSArray<AUAudioUnitBus>; });

	addObserverToAllBussesForKeyPathOptionsContext(observer: NSObject, keyPath: string, options: NSKeyValueObservingOptions, context: interop.Pointer): void;

	objectAtIndexedSubscript(index: number): AUAudioUnitBus;

	removeObserverFromAllBussesForKeyPathContext(observer: NSObject, keyPath: string, context: interop.Pointer): void;

	replaceBusses(busArray: NSArray<AUAudioUnitBus>): void;

	self(): AUAudioUnitBusArray; // inherited from NSObjectProtocol

	setBusCountError(count: number): boolean;
}

declare const enum AUAudioUnitBusType {

	Input = 1,

	Output = 2
}

interface AUAudioUnitFactory extends NSExtensionRequestHandling {

	createAudioUnitWithComponentDescriptionError(desc: AudioComponentDescription): AUAudioUnit;
}
declare var AUAudioUnitFactory: {

	prototype: AUAudioUnitFactory;
};

declare class AUAudioUnitPreset extends NSObject implements NSSecureCoding {

	static alloc(): AUAudioUnitPreset; // inherited from NSObject

	static new(): AUAudioUnitPreset; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	name: string;

	number: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): AUAudioUnitPreset; // inherited from NSObjectProtocol
}

declare class AUAudioUnitV2Bridge extends AUAudioUnit {

	constructor(o: { componentDescription: AudioComponentDescription; }); // inherited from AUAudioUnit

	constructor(o: { componentDescription: AudioComponentDescription; options: AudioComponentInstantiationOptions; }); // inherited from AUAudioUnit
}

interface AUChannelInfo {
	inChannels: number;
	outChannels: number;
}
declare var AUChannelInfo: interop.StructType<AUChannelInfo>;

interface AUDependentParameter {
	mScope: number;
	mParameterID: number;
}
declare var AUDependentParameter: interop.StructType<AUDependentParameter>;

declare const enum AUHostTransportStateFlags {

	Changed = 1,

	Moving = 2,

	Recording = 4,

	Cycling = 8
}

interface AUInputSamplesInOutputCallbackStruct {
	inputToOutputCallback: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<AudioTimeStamp>, p3: number, p4: number) => void>;
	userData: interop.Pointer;
}
declare var AUInputSamplesInOutputCallbackStruct: interop.StructType<AUInputSamplesInOutputCallbackStruct>;

declare class AUParameter extends AUParameterNode implements NSSecureCoding {

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ address: number;

	/* readonly */ dependentParameters: NSArray<number>;

	/* readonly */ flags: AudioUnitParameterOptions;

	/* readonly */ maxValue: number;

	/* readonly */ minValue: number;

	/* readonly */ unit: AudioUnitParameterUnit;

	/* readonly */ unitName: string;

	value: number;

	/* readonly */ valueStrings: NSArray<string>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	setValueOriginator(value: number, originator: interop.Pointer): void;

	setValueOriginatorAtHostTime(value: number, originator: interop.Pointer, hostTime: number): void;

	stringFromValue(value: interop.Reference<number>): string;

	valueFromString(string: string): number;
}

declare const enum AUParameterEventType {

	kParameterEvent_Immediate = 1,

	kParameterEvent_Ramped = 2
}

declare class AUParameterGroup extends AUParameterNode implements NSSecureCoding {

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ allParameters: NSArray<AUParameter>;

	/* readonly */ children: NSArray<AUParameterNode>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding
}

declare class AUParameterNode extends NSObject {

	static alloc(): AUParameterNode; // inherited from NSObject

	static new(): AUParameterNode; // inherited from NSObject

	/* readonly */ displayName: string;

	/* readonly */ identifier: string;

	implementorDisplayNameWithLengthCallback: (p1: AUParameterNode, p2: number) => string;

	implementorStringFromValueCallback: (p1: AUParameter, p2: interop.Reference<number>) => string;

	implementorValueFromStringCallback: (p1: AUParameter, p2: string) => number;

	implementorValueObserver: (p1: AUParameter, p2: number) => void;

	implementorValueProvider: (p1: AUParameter) => number;

	/* readonly */ keyPath: string;

	constructor(); // inherited from NSObject

	displayNameWithLength(maximumLength: number): string;

	removeParameterObserver(token: interop.Pointer): void;

	self(): AUParameterNode; // inherited from NSObjectProtocol

	tokenByAddingParameterObserver(observer: (p1: number, p2: number) => void): interop.Pointer;

	tokenByAddingParameterRecordingObserver(observer: (p1: number, p2: interop.Reference<AURecordedParameterEvent>) => void): interop.Pointer;
}

declare class AUParameterTree extends AUParameterGroup implements NSSecureCoding {

	static createGroupFromTemplateIdentifierNameAddressOffset(templateGroup: AUParameterGroup, identifier: string, name: string, addressOffset: number): AUParameterGroup;

	static createGroupTemplate(children: NSArray<AUParameterNode>): AUParameterGroup;

	static createGroupWithIdentifierNameChildren(identifier: string, name: string, children: NSArray<AUParameterNode>): AUParameterGroup;

	static createParameterWithIdentifierNameAddressMinMaxUnitUnitNameFlagsValueStringsDependentParameters(identifier: string, name: string, address: number, min: number, max: number, unit: AudioUnitParameterUnit, unitName: string, flags: AudioUnitParameterOptions, valueStrings: NSArray<string>, dependentParameters: NSArray<number>): AUParameter;

	static createTreeWithChildren(children: NSArray<AUParameterNode>): AUParameterTree;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	parameterWithAddress(address: number): AUParameter;

	parameterWithIDScopeElement(paramID: number, scope: number, element: number): AUParameter;
}

interface AUPreset {
	presetNumber: number;
	presetName: string;
}
declare var AUPreset: interop.StructType<AUPreset>;

interface AURecordedParameterEvent {
	hostTime: number;
	address: number;
	value: number;
}
declare var AURecordedParameterEvent: interop.StructType<AURecordedParameterEvent>;

interface AURenderCallbackStruct {
	inputProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Reference<AudioBufferList>) => number>;
	inputProcRefCon: interop.Pointer;
}
declare var AURenderCallbackStruct: interop.StructType<AURenderCallbackStruct>;

declare const enum AURenderEventType {

	Parameter = 1,

	ParameterRamp = 2,

	MIDI = 8,

	MIDISysEx = 9
}

declare const enum AUReverbRoomType {

	kReverbRoomType_SmallRoom = 0,

	kReverbRoomType_MediumRoom = 1,

	kReverbRoomType_LargeRoom = 2,

	kReverbRoomType_MediumHall = 3,

	kReverbRoomType_LargeHall = 4,

	kReverbRoomType_Plate = 5,

	kReverbRoomType_MediumChamber = 6,

	kReverbRoomType_LargeChamber = 7,

	kReverbRoomType_Cathedral = 8,

	kReverbRoomType_LargeRoom2 = 9,

	kReverbRoomType_MediumHall2 = 10,

	kReverbRoomType_MediumHall3 = 11,

	kReverbRoomType_LargeHall2 = 12
}

interface AUSamplerBankPresetData {
	bankURL: NSURL;
	bankMSB: number;
	bankLSB: number;
	presetID: number;
	reserved: number;
}
declare var AUSamplerBankPresetData: interop.StructType<AUSamplerBankPresetData>;

interface AUSamplerInstrumentData {
	fileURL: NSURL;
	instrumentType: number;
	bankMSB: number;
	bankLSB: number;
	presetID: number;
}
declare var AUSamplerInstrumentData: interop.StructType<AUSamplerInstrumentData>;

declare const enum AUScheduledAudioSliceFlags {

	kScheduledAudioSliceFlag_Complete = 1,

	kScheduledAudioSliceFlag_BeganToRender = 2,

	kScheduledAudioSliceFlag_BeganToRenderLate = 4,

	kScheduledAudioSliceFlag_Loop = 8,

	kScheduledAudioSliceFlag_Interrupt = 16,

	kScheduledAudioSliceFlag_InterruptAtLoop = 32
}

declare const enum AUSpatialMixerAttenuationCurve {

	kSpatialMixerAttenuationCurve_Power = 0,

	kSpatialMixerAttenuationCurve_Exponential = 1,

	kSpatialMixerAttenuationCurve_Inverse = 2,

	kSpatialMixerAttenuationCurve_Linear = 3
}

declare const enum AUSpatialMixerRenderingFlags {

	kSpatialMixerRenderingFlags_InterAuralDelay = 1,

	kSpatialMixerRenderingFlags_DistanceAttenuation = 4
}

declare const enum AUSpatializationAlgorithm {

	kSpatializationAlgorithm_EqualPowerPanning = 0,

	kSpatializationAlgorithm_SphericalHead = 1,

	kSpatializationAlgorithm_HRTF = 2,

	kSpatializationAlgorithm_SoundField = 3,

	kSpatializationAlgorithm_VectorBasedPanning = 4,

	kSpatializationAlgorithm_StereoPassThrough = 5
}

declare function AudioComponentCopyName(inComponent: interop.Pointer, outName: interop.Reference<string>): number;

declare function AudioComponentCount(inDesc: interop.Reference<AudioComponentDescription>): number;

interface AudioComponentDescription {
	componentType: number;
	componentSubType: number;
	componentManufacturer: number;
	componentFlags: number;
	componentFlagsMask: number;
}
declare var AudioComponentDescription: interop.StructType<AudioComponentDescription>;

declare function AudioComponentFindNext(inComponent: interop.Pointer, inDesc: interop.Reference<AudioComponentDescription>): interop.Pointer;

declare const enum AudioComponentFlags {

	kAudioComponentFlag_Unsearchable = 1,

	kAudioComponentFlag_SandboxSafe = 2,

	kAudioComponentFlag_IsV3AudioUnit = 4,

	kAudioComponentFlag_RequiresAsyncInstantiation = 8,

	kAudioComponentFlag_CanLoadInProcess = 16
}

declare function AudioComponentGetDescription(inComponent: interop.Pointer, outDesc: interop.Reference<AudioComponentDescription>): number;

declare function AudioComponentGetIcon(comp: interop.Pointer, desiredPointSize: number): UIImage;

declare function AudioComponentGetLastActiveTime(comp: interop.Pointer): number;

declare function AudioComponentGetVersion(inComponent: interop.Pointer, outVersion: interop.Reference<number>): number;

declare function AudioComponentInstanceCanDo(inInstance: interop.Pointer, inSelectorID: number): boolean;

declare function AudioComponentInstanceDispose(inInstance: interop.Pointer): number;

declare function AudioComponentInstanceGetComponent(inInstance: interop.Pointer): interop.Pointer;

declare function AudioComponentInstanceNew(inComponent: interop.Pointer, outInstance: interop.Reference<interop.Pointer>): number;

declare function AudioComponentInstantiate(inComponent: interop.Pointer, inOptions: AudioComponentInstantiationOptions, inCompletionHandler: (p1: interop.Pointer, p2: number) => void): void;

declare const enum AudioComponentInstantiationOptions {

	kAudioComponentInstantiation_LoadOutOfProcess = 1,

	kAudioComponentInstantiation_LoadInProcess = 2
}

interface AudioComponentPlugInInterface {
	Open: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => number>;
	Close: interop.FunctionReference<(p1: interop.Pointer) => number>;
	Lookup: interop.FunctionReference<(p1: number) => interop.FunctionReference<(p1: interop.Pointer) => number>>;
	reserved: interop.Pointer;
}
declare var AudioComponentPlugInInterface: interop.StructType<AudioComponentPlugInInterface>;

declare function AudioComponentRegister(inDesc: interop.Reference<AudioComponentDescription>, inName: string, inVersion: number, inFactory: interop.FunctionReference<(p1: interop.Reference<AudioComponentDescription>) => interop.Reference<AudioComponentPlugInInterface>>): interop.Pointer;

declare const enum AudioComponentValidationResult {

	kAudioComponentValidationResult_Unknown = 0,

	kAudioComponentValidationResult_Passed = 1,

	kAudioComponentValidationResult_Failed = 2,

	kAudioComponentValidationResult_TimedOut = 3,

	kAudioComponentValidationResult_UnauthorizedError_Open = 4,

	kAudioComponentValidationResult_UnauthorizedError_Init = 5
}

declare function AudioOutputUnitGetHostIcon(au: interop.Pointer, desiredPointSize: number): UIImage;

interface AudioOutputUnitMIDICallbacks {
	userData: interop.Pointer;
	MIDIEventProc: interop.FunctionReference<(p1: interop.Pointer, p2: number, p3: number, p4: number, p5: number) => void>;
	MIDISysExProc: interop.FunctionReference<(p1: interop.Pointer, p2: string, p3: number) => void>;
}
declare var AudioOutputUnitMIDICallbacks: interop.StructType<AudioOutputUnitMIDICallbacks>;

declare function AudioOutputUnitPublish(inDesc: interop.Reference<AudioComponentDescription>, inName: string, inVersion: number, inOutputUnit: interop.Pointer): number;

declare function AudioOutputUnitStart(ci: interop.Pointer): number;

interface AudioOutputUnitStartAtTimeParams {
	mTimestamp: AudioTimeStamp;
	mFlags: number;
}
declare var AudioOutputUnitStartAtTimeParams: interop.StructType<AudioOutputUnitStartAtTimeParams>;

declare function AudioOutputUnitStop(ci: interop.Pointer): number;

declare function AudioUnitAddPropertyListener(inUnit: interop.Pointer, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number, p4: number, p5: number) => void>, inProcUserData: interop.Pointer): number;

declare function AudioUnitAddRenderNotify(inUnit: interop.Pointer, inProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Reference<AudioBufferList>) => number>, inProcUserData: interop.Pointer): number;

interface AudioUnitConnection {
	sourceAudioUnit: interop.Pointer;
	sourceOutputNumber: number;
	destInputNumber: number;
}
declare var AudioUnitConnection: interop.StructType<AudioUnitConnection>;

interface AudioUnitExternalBuffer {
	buffer: string;
	size: number;
}
declare var AudioUnitExternalBuffer: interop.StructType<AudioUnitExternalBuffer>;

interface AudioUnitFrequencyResponseBin {
	mFrequency: number;
	mMagnitude: number;
}
declare var AudioUnitFrequencyResponseBin: interop.StructType<AudioUnitFrequencyResponseBin>;

declare function AudioUnitGetParameter(inUnit: interop.Pointer, inID: number, inScope: number, inElement: number, outValue: interop.Reference<number>): number;

declare function AudioUnitGetProperty(inUnit: interop.Pointer, inID: number, inScope: number, inElement: number, outData: interop.Pointer, ioDataSize: interop.Reference<number>): number;

declare function AudioUnitGetPropertyInfo(inUnit: interop.Pointer, inID: number, inScope: number, inElement: number, outDataSize: interop.Reference<number>, outWritable: string): number;

declare function AudioUnitInitialize(inUnit: interop.Pointer): number;

interface AudioUnitMeterClipping {
	peakValueSinceLastCall: number;
	sawInfinity: boolean;
	sawNotANumber: boolean;
}
declare var AudioUnitMeterClipping: interop.StructType<AudioUnitMeterClipping>;

interface AudioUnitParameter {
	mAudioUnit: interop.Pointer;
	mParameterID: number;
	mScope: number;
	mElement: number;
}
declare var AudioUnitParameter: interop.StructType<AudioUnitParameter>;

interface AudioUnitParameterHistoryInfo {
	updatesPerSecond: number;
	historyDurationInSeconds: number;
}
declare var AudioUnitParameterHistoryInfo: interop.StructType<AudioUnitParameterHistoryInfo>;

interface AudioUnitParameterIDName {
	inID: number;
	inDesiredLength: number;
	outName: string;
}
declare var AudioUnitParameterIDName: interop.StructType<AudioUnitParameterIDName>;

interface AudioUnitParameterInfo {
	name: interop.Reference<number>;
	unitName: string;
	clumpID: number;
	cfNameString: string;
	unit: AudioUnitParameterUnit;
	minValue: number;
	maxValue: number;
	defaultValue: number;
	flags: AudioUnitParameterOptions;
}
declare var AudioUnitParameterInfo: interop.StructType<AudioUnitParameterInfo>;

declare const enum AudioUnitParameterOptions {

	kAudioUnitParameterFlag_CFNameRelease = 16,

	kAudioUnitParameterFlag_OmitFromPresets = 8192,

	kAudioUnitParameterFlag_PlotHistory = 16384,

	kAudioUnitParameterFlag_MeterReadOnly = 32768,

	kAudioUnitParameterFlag_DisplayMask = 4653056,

	kAudioUnitParameterFlag_DisplaySquareRoot = 65536,

	kAudioUnitParameterFlag_DisplaySquared = 131072,

	kAudioUnitParameterFlag_DisplayCubed = 196608,

	kAudioUnitParameterFlag_DisplayCubeRoot = 262144,

	kAudioUnitParameterFlag_DisplayExponential = 327680,

	kAudioUnitParameterFlag_HasClump = 1048576,

	kAudioUnitParameterFlag_ValuesHaveStrings = 2097152,

	kAudioUnitParameterFlag_DisplayLogarithmic = 4194304,

	kAudioUnitParameterFlag_IsHighResolution = 8388608,

	kAudioUnitParameterFlag_NonRealTime = 16777216,

	kAudioUnitParameterFlag_CanRamp = 33554432,

	kAudioUnitParameterFlag_ExpertMode = 67108864,

	kAudioUnitParameterFlag_HasCFNameString = 134217728,

	kAudioUnitParameterFlag_IsGlobalMeta = 268435456,

	kAudioUnitParameterFlag_IsElementMeta = 536870912,

	kAudioUnitParameterFlag_IsReadable = 1073741824,

	kAudioUnitParameterFlag_IsWritable = 2147483648
}

interface AudioUnitParameterStringFromValue {
	inParamID: number;
	inValue: interop.Reference<number>;
	outString: string;
}
declare var AudioUnitParameterStringFromValue: interop.StructType<AudioUnitParameterStringFromValue>;

declare const enum AudioUnitParameterUnit {

	kAudioUnitParameterUnit_Generic = 0,

	kAudioUnitParameterUnit_Indexed = 1,

	kAudioUnitParameterUnit_Boolean = 2,

	kAudioUnitParameterUnit_Percent = 3,

	kAudioUnitParameterUnit_Seconds = 4,

	kAudioUnitParameterUnit_SampleFrames = 5,

	kAudioUnitParameterUnit_Phase = 6,

	kAudioUnitParameterUnit_Rate = 7,

	kAudioUnitParameterUnit_Hertz = 8,

	kAudioUnitParameterUnit_Cents = 9,

	kAudioUnitParameterUnit_RelativeSemiTones = 10,

	kAudioUnitParameterUnit_MIDINoteNumber = 11,

	kAudioUnitParameterUnit_MIDIController = 12,

	kAudioUnitParameterUnit_Decibels = 13,

	kAudioUnitParameterUnit_LinearGain = 14,

	kAudioUnitParameterUnit_Degrees = 15,

	kAudioUnitParameterUnit_EqualPowerCrossfade = 16,

	kAudioUnitParameterUnit_MixerFaderCurve1 = 17,

	kAudioUnitParameterUnit_Pan = 18,

	kAudioUnitParameterUnit_Meters = 19,

	kAudioUnitParameterUnit_AbsoluteCents = 20,

	kAudioUnitParameterUnit_Octaves = 21,

	kAudioUnitParameterUnit_BPM = 22,

	kAudioUnitParameterUnit_Beats = 23,

	kAudioUnitParameterUnit_Milliseconds = 24,

	kAudioUnitParameterUnit_Ratio = 25,

	kAudioUnitParameterUnit_CustomUnit = 26
}

interface AudioUnitParameterValueFromString {
	inParamID: number;
	inString: string;
	outValue: number;
}
declare var AudioUnitParameterValueFromString: interop.StructType<AudioUnitParameterValueFromString>;

declare function AudioUnitProcess(inUnit: interop.Pointer, ioActionFlags: interop.Reference<AudioUnitRenderActionFlags>, inTimeStamp: interop.Reference<AudioTimeStamp>, inNumberFrames: number, ioData: interop.Reference<AudioBufferList>): number;

declare function AudioUnitProcessMultiple(inUnit: interop.Pointer, ioActionFlags: interop.Reference<AudioUnitRenderActionFlags>, inTimeStamp: interop.Reference<AudioTimeStamp>, inNumberFrames: number, inNumberInputBufferLists: number, inInputBufferLists: interop.Reference<interop.Reference<AudioBufferList>>, inNumberOutputBufferLists: number, ioOutputBufferLists: interop.Reference<interop.Reference<AudioBufferList>>): number;

interface AudioUnitProperty {
	mAudioUnit: interop.Pointer;
	mPropertyID: number;
	mScope: number;
	mElement: number;
}
declare var AudioUnitProperty: interop.StructType<AudioUnitProperty>;

declare const enum AudioUnitRemoteControlEvent {

	kAudioUnitRemoteControlEvent_TogglePlayPause = 1,

	kAudioUnitRemoteControlEvent_ToggleRecord = 2,

	kAudioUnitRemoteControlEvent_Rewind = 3
}

declare function AudioUnitRemovePropertyListenerWithUserData(inUnit: interop.Pointer, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number, p4: number, p5: number) => void>, inProcUserData: interop.Pointer): number;

declare function AudioUnitRemoveRenderNotify(inUnit: interop.Pointer, inProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Reference<AudioBufferList>) => number>, inProcUserData: interop.Pointer): number;

declare function AudioUnitRender(inUnit: interop.Pointer, ioActionFlags: interop.Reference<AudioUnitRenderActionFlags>, inTimeStamp: interop.Reference<AudioTimeStamp>, inOutputBusNumber: number, inNumberFrames: number, ioData: interop.Reference<AudioBufferList>): number;

declare const enum AudioUnitRenderActionFlags {

	kAudioUnitRenderAction_PreRender = 4,

	kAudioUnitRenderAction_PostRender = 8,

	kAudioUnitRenderAction_OutputIsSilence = 16,

	kAudioOfflineUnitRenderAction_Preflight = 32,

	kAudioOfflineUnitRenderAction_Render = 64,

	kAudioOfflineUnitRenderAction_Complete = 128,

	kAudioUnitRenderAction_PostRenderError = 256,

	kAudioUnitRenderAction_DoNotCheckRenderArgs = 512
}

declare function AudioUnitReset(inUnit: interop.Pointer, inScope: number, inElement: number): number;

declare function AudioUnitSetParameter(inUnit: interop.Pointer, inID: number, inScope: number, inElement: number, inValue: number, inBufferOffsetInFrames: number): number;

declare function AudioUnitSetProperty(inUnit: interop.Pointer, inID: number, inScope: number, inElement: number, inData: interop.Pointer, inDataSize: number): number;

declare function AudioUnitUninitialize(inUnit: interop.Pointer): number;

interface HostCallbackInfo {
	hostUserData: interop.Pointer;
	beatAndTempoProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<number>, p3: interop.Reference<number>) => number>;
	musicalTimeLocationProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>, p5: interop.Reference<number>) => number>;
	transportStateProc: interop.FunctionReference<(p1: interop.Pointer, p2: string, p3: string, p4: interop.Reference<number>, p5: string, p6: interop.Reference<number>, p7: interop.Reference<number>) => number>;
	transportStateProc2: interop.FunctionReference<(p1: interop.Pointer, p2: string, p3: string, p4: string, p5: interop.Reference<number>, p6: string, p7: interop.Reference<number>, p8: interop.Reference<number>) => number>;
}
declare var HostCallbackInfo: interop.StructType<HostCallbackInfo>;

interface MixerDistanceParams {
	mReferenceDistance: number;
	mMaxDistance: number;
	mMaxAttenuation: number;
}
declare var MixerDistanceParams: interop.StructType<MixerDistanceParams>;

declare function MusicDeviceMIDIEvent(inUnit: interop.Pointer, inStatus: number, inData1: number, inData2: number, inOffsetSampleFrame: number): number;

interface MusicDeviceNoteParams {
	argCount: number;
	mPitch: number;
	mVelocity: number;
	mControls: interop.Reference<NoteParamsControlValue>;
}
declare var MusicDeviceNoteParams: interop.StructType<MusicDeviceNoteParams>;

declare function MusicDeviceStartNote(inUnit: interop.Pointer, inInstrument: number, inGroupID: number, outNoteInstanceID: interop.Reference<number>, inOffsetSampleFrame: number, inParams: interop.Reference<MusicDeviceNoteParams>): number;

interface MusicDeviceStdNoteParams {
	argCount: number;
	mPitch: number;
	mVelocity: number;
}
declare var MusicDeviceStdNoteParams: interop.StructType<MusicDeviceStdNoteParams>;

declare function MusicDeviceStopNote(inUnit: interop.Pointer, inGroupID: number, inNoteInstanceID: number, inOffsetSampleFrame: number): number;

declare function MusicDeviceSysEx(inUnit: interop.Pointer, inData: string, inLength: number): number;

interface NoteParamsControlValue {
	mID: number;
	mValue: number;
}
declare var NoteParamsControlValue: interop.StructType<NoteParamsControlValue>;

interface ScheduledAudioFileRegion {
	mTimeStamp: AudioTimeStamp;
	mCompletionProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<ScheduledAudioFileRegion>, p3: number) => void>;
	mCompletionProcUserData: interop.Pointer;
	mAudioFile: interop.Pointer;
	mLoopCount: number;
	mStartFrame: number;
	mFramesToPlay: number;
}
declare var ScheduledAudioFileRegion: interop.StructType<ScheduledAudioFileRegion>;

interface ScheduledAudioSlice {
	mTimeStamp: AudioTimeStamp;
	mCompletionProc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Reference<ScheduledAudioSlice>) => void>;
	mCompletionProcUserData: interop.Pointer;
	mFlags: AUScheduledAudioSliceFlags;
	mReserved: number;
	mReserved2: interop.Pointer;
	mNumberFrames: number;
	mBufferList: interop.Reference<AudioBufferList>;
}
declare var ScheduledAudioSlice: interop.StructType<ScheduledAudioSlice>;

declare var kAudioComponentInstanceInvalidationNotification: string;

declare var kAudioComponentRegistrationsChangedNotification: string;
