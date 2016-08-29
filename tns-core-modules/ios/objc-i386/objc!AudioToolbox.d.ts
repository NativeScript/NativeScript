
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

	channelMap: NSArray<number>;

	/* readonly */ component: interop.Pointer | interop.Reference<any>;

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

	inputHandler: (p1: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number) => void;

	/* readonly */ latency: number;

	/* readonly */ manufacturerName: string;

	maximumFramesToRender: number;

	/* readonly */ musicDeviceOrEffect: boolean;

	musicalContextBlock: (p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<number>) => boolean;

	/* readonly */ outputBusses: AUAudioUnitBusArray;

	outputEnabled: boolean;

	outputProvider: (p1: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<AudioBufferList>) => number;

	/* readonly */ parameterTree: AUParameterTree;

	/* readonly */ renderBlock: (p1: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<AudioBufferList>, p6: (p1: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<AudioBufferList>) => number) => number;

	renderQuality: number;

	/* readonly */ renderResourcesAllocated: boolean;

	renderingOffline: boolean;

	/* readonly */ scheduleMIDIEventBlock: (p1: number, p2: number, p3: number, p4: string) => void;

	/* readonly */ scheduleParameterBlock: (p1: number, p2: number, p3: number, p4: number) => void;

	shouldBypassEffect: boolean;

	/* readonly */ supportsMPE: boolean;

	/* readonly */ tailTime: number;

	transportStateBlock: (p1: interop.Pointer | interop.Reference<AUHostTransportStateFlags>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => boolean;

	/* readonly */ virtualMIDICableCount: number;

	constructor(o: { componentDescription: AudioComponentDescription; });

	constructor(o: { componentDescription: AudioComponentDescription; options: AudioComponentInstantiationOptions; });

	allocateRenderResourcesAndReturnError(): boolean;

	deallocateRenderResources(): void;

	initWithComponentDescriptionError(componentDescription: AudioComponentDescription): this;

	initWithComponentDescriptionOptionsError(componentDescription: AudioComponentDescription, options: AudioComponentInstantiationOptions): this;

	parametersForOverviewWithCount(count: number): NSArray<number>;

	removeRenderObserver(token: number): void;

	requestViewControllerWithCompletionHandler(completionHandler: (p1: UIViewController) => void): void;

	reset(): void;

	setRenderResourcesAllocated(flag: boolean): void;

	shouldChangeToFormatForBus(format: AVAudioFormat, bus: AUAudioUnitBus): boolean;

	startHardwareAndReturnError(): boolean;

	stopHardware(): void;

	tokenByAddingRenderObserver(observer: (p1: AudioUnitRenderActionFlags, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number) => void): number;
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

	constructor(o: { format: AVAudioFormat; });

	initWithFormatError(format: AVAudioFormat): this;

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

	constructor(o: { audioUnit: AUAudioUnit; busType: AUAudioUnitBusType; });

	constructor(o: { audioUnit: AUAudioUnit; busType: AUAudioUnitBusType; busses: NSArray<AUAudioUnitBus>; });

	addObserverToAllBussesForKeyPathOptionsContext(observer: NSObject, keyPath: string, options: NSKeyValueObservingOptions, context: interop.Pointer | interop.Reference<any>): void;

	initWithAudioUnitBusType(owner: AUAudioUnit, busType: AUAudioUnitBusType): this;

	initWithAudioUnitBusTypeBusses(owner: AUAudioUnit, busType: AUAudioUnitBusType, busArray: NSArray<AUAudioUnitBus>): this;

	objectAtIndexedSubscript(index: number): AUAudioUnitBus;

	removeObserverFromAllBussesForKeyPathContext(observer: NSObject, keyPath: string, context: interop.Pointer | interop.Reference<any>): void;

	replaceBusses(busArray: NSArray<AUAudioUnitBus>): void;

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

	name: string;

	number: number;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class AUAudioUnitV2Bridge extends AUAudioUnit {

	static alloc(): AUAudioUnitV2Bridge; // inherited from NSObject

	static new(): AUAudioUnitV2Bridge; // inherited from NSObject
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

declare function AUGraphAddNode(inGraph: interop.Pointer | interop.Reference<any>, inDescription: interop.Pointer | interop.Reference<AudioComponentDescription>, outNode: interop.Pointer | interop.Reference<number>): number;

declare function AUGraphAddRenderNotify(inGraph: interop.Pointer | interop.Reference<any>, inCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<AudioBufferList>) => number>, inRefCon: interop.Pointer | interop.Reference<any>): number;

declare function AUGraphClearConnections(inGraph: interop.Pointer | interop.Reference<any>): number;

declare function AUGraphClose(inGraph: interop.Pointer | interop.Reference<any>): number;

declare function AUGraphConnectNodeInput(inGraph: interop.Pointer | interop.Reference<any>, inSourceNode: number, inSourceOutputNumber: number, inDestNode: number, inDestInputNumber: number): number;

declare function AUGraphCountNodeInteractions(inGraph: interop.Pointer | interop.Reference<any>, inNode: number, outNumInteractions: interop.Pointer | interop.Reference<number>): number;

declare function AUGraphDisconnectNodeInput(inGraph: interop.Pointer | interop.Reference<any>, inDestNode: number, inDestInputNumber: number): number;

declare function AUGraphGetCPULoad(inGraph: interop.Pointer | interop.Reference<any>, outAverageCPULoad: interop.Pointer | interop.Reference<number>): number;

declare function AUGraphGetIndNode(inGraph: interop.Pointer | interop.Reference<any>, inIndex: number, outNode: interop.Pointer | interop.Reference<number>): number;

declare function AUGraphGetMaxCPULoad(inGraph: interop.Pointer | interop.Reference<any>, outMaxLoad: interop.Pointer | interop.Reference<number>): number;

declare function AUGraphGetNodeCount(inGraph: interop.Pointer | interop.Reference<any>, outNumberOfNodes: interop.Pointer | interop.Reference<number>): number;

declare function AUGraphGetNumberOfInteractions(inGraph: interop.Pointer | interop.Reference<any>, outNumInteractions: interop.Pointer | interop.Reference<number>): number;

declare function AUGraphInitialize(inGraph: interop.Pointer | interop.Reference<any>): number;

declare function AUGraphIsInitialized(inGraph: interop.Pointer | interop.Reference<any>, outIsInitialized: string): number;

declare function AUGraphIsOpen(inGraph: interop.Pointer | interop.Reference<any>, outIsOpen: string): number;

declare function AUGraphIsRunning(inGraph: interop.Pointer | interop.Reference<any>, outIsRunning: string): number;

declare function AUGraphNodeInfo(inGraph: interop.Pointer | interop.Reference<any>, inNode: number, outDescription: interop.Pointer | interop.Reference<AudioComponentDescription>, outAudioUnit: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AUGraphOpen(inGraph: interop.Pointer | interop.Reference<any>): number;

declare function AUGraphRemoveNode(inGraph: interop.Pointer | interop.Reference<any>, inNode: number): number;

declare function AUGraphRemoveRenderNotify(inGraph: interop.Pointer | interop.Reference<any>, inCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<AudioBufferList>) => number>, inRefCon: interop.Pointer | interop.Reference<any>): number;

declare function AUGraphSetNodeInputCallback(inGraph: interop.Pointer | interop.Reference<any>, inDestNode: number, inDestInputNumber: number, inInputCallback: interop.Pointer | interop.Reference<AURenderCallbackStruct>): number;

declare function AUGraphStart(inGraph: interop.Pointer | interop.Reference<any>): number;

declare function AUGraphStop(inGraph: interop.Pointer | interop.Reference<any>): number;

declare function AUGraphUninitialize(inGraph: interop.Pointer | interop.Reference<any>): number;

declare function AUGraphUpdate(inGraph: interop.Pointer | interop.Reference<any>, outIsUpdated: string): number;

declare const enum AUHostTransportStateFlags {

	Changed = 1,

	Moving = 2,

	Recording = 4,

	Cycling = 8
}

interface AUInputSamplesInOutputCallbackStruct {
	inputToOutputCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number) => void>;
	userData: interop.Pointer | interop.Reference<any>;
}
declare var AUInputSamplesInOutputCallbackStruct: interop.StructType<AUInputSamplesInOutputCallbackStruct>;

interface AUNodeRenderCallback {
	destNode: number;
	destInputNumber: number;
	cback: AURenderCallbackStruct;
}
declare var AUNodeRenderCallback: interop.StructType<AUNodeRenderCallback>;

declare class AUParameter extends AUParameterNode implements NSSecureCoding {

	static alloc(): AUParameter; // inherited from NSObject

	static new(): AUParameter; // inherited from NSObject

	/* readonly */ address: number;

	/* readonly */ dependentParameters: NSArray<number>;

	/* readonly */ flags: AudioUnitParameterOptions;

	/* readonly */ maxValue: number;

	/* readonly */ minValue: number;

	/* readonly */ unit: AudioUnitParameterUnit;

	/* readonly */ unitName: string;

	value: number;

	/* readonly */ valueStrings: NSArray<string>;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	setValueOriginator(value: number, originator: interop.Pointer | interop.Reference<any>): void;

	setValueOriginatorAtHostTime(value: number, originator: interop.Pointer | interop.Reference<any>, hostTime: number): void;

	setValueOriginatorAtHostTimeEventType(value: number, originator: interop.Pointer | interop.Reference<any>, hostTime: number, eventType: AUParameterAutomationEventType): void;

	stringFromValue(value: interop.Pointer | interop.Reference<number>): string;

	valueFromString(string: string): number;
}

interface AUParameterAutomationEvent {
	hostTime: number;
	address: number;
	value: number;
	eventType: AUParameterAutomationEventType;
	reserved: number;
}
declare var AUParameterAutomationEvent: interop.StructType<AUParameterAutomationEvent>;

declare const enum AUParameterAutomationEventType {

	Value = 0,

	Touch = 1,

	Release = 2
}

declare const enum AUParameterEventType {

	kParameterEvent_Immediate = 1,

	kParameterEvent_Ramped = 2
}

declare class AUParameterGroup extends AUParameterNode implements NSSecureCoding {

	static alloc(): AUParameterGroup; // inherited from NSObject

	static new(): AUParameterGroup; // inherited from NSObject

	/* readonly */ allParameters: NSArray<AUParameter>;

	/* readonly */ children: NSArray<AUParameterNode>;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class AUParameterNode extends NSObject {

	static alloc(): AUParameterNode; // inherited from NSObject

	static new(): AUParameterNode; // inherited from NSObject

	/* readonly */ displayName: string;

	/* readonly */ identifier: string;

	implementorDisplayNameWithLengthCallback: (p1: AUParameterNode, p2: number) => string;

	implementorStringFromValueCallback: (p1: AUParameter, p2: interop.Pointer | interop.Reference<number>) => string;

	implementorValueFromStringCallback: (p1: AUParameter, p2: string) => number;

	implementorValueObserver: (p1: AUParameter, p2: number) => void;

	implementorValueProvider: (p1: AUParameter) => number;

	/* readonly */ keyPath: string;

	displayNameWithLength(maximumLength: number): string;

	removeParameterObserver(token: interop.Pointer | interop.Reference<any>): void;

	tokenByAddingParameterAutomationObserver(observer: (p1: number, p2: interop.Pointer | interop.Reference<AUParameterAutomationEvent>) => void): interop.Pointer | interop.Reference<any>;

	tokenByAddingParameterObserver(observer: (p1: number, p2: number) => void): interop.Pointer | interop.Reference<any>;

	tokenByAddingParameterRecordingObserver(observer: (p1: number, p2: interop.Pointer | interop.Reference<AURecordedParameterEvent>) => void): interop.Pointer | interop.Reference<any>;
}

declare class AUParameterTree extends AUParameterGroup implements NSSecureCoding {

	static alloc(): AUParameterTree; // inherited from NSObject

	static createGroupFromTemplateIdentifierNameAddressOffset(templateGroup: AUParameterGroup, identifier: string, name: string, addressOffset: number): AUParameterGroup;

	static createGroupTemplate(children: NSArray<AUParameterNode>): AUParameterGroup;

	static createGroupWithIdentifierNameChildren(identifier: string, name: string, children: NSArray<AUParameterNode>): AUParameterGroup;

	static createParameterWithIdentifierNameAddressMinMaxUnitUnitNameFlagsValueStringsDependentParameters(identifier: string, name: string, address: number, min: number, max: number, unit: AudioUnitParameterUnit, unitName: string, flags: AudioUnitParameterOptions, valueStrings: NSArray<string>, dependentParameters: NSArray<number>): AUParameter;

	static createTreeWithChildren(children: NSArray<AUParameterNode>): AUParameterTree;

	static new(): AUParameterTree; // inherited from NSObject

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	parameterWithAddress(address: number): AUParameter;

	parameterWithIDScopeElement(paramID: number, scope: number, element: number): AUParameter;
}

interface AUPreset {
	presetNumber: number;
	presetName: string;
}
declare var AUPreset: interop.StructType<AUPreset>;

interface AUPresetEvent {
	scope: number;
	element: number;
	preset: any;
}
declare var AUPresetEvent: interop.StructType<AUPresetEvent>;

interface AURecordedParameterEvent {
	hostTime: number;
	address: number;
	value: number;
}
declare var AURecordedParameterEvent: interop.StructType<AURecordedParameterEvent>;

interface AURenderCallbackStruct {
	inputProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<AudioBufferList>) => number>;
	inputProcRefCon: interop.Pointer | interop.Reference<any>;
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

interface AudioBalanceFade {
	mLeftRightBalance: number;
	mBackFrontFade: number;
	mType: AudioBalanceFadeType;
	mChannelLayout: interop.Pointer | interop.Reference<AudioChannelLayout>;
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

declare function AudioComponentCopyName(inComponent: interop.Pointer | interop.Reference<any>, outName: interop.Pointer | interop.Reference<string>): number;

declare function AudioComponentCount(inDesc: interop.Pointer | interop.Reference<AudioComponentDescription>): number;

interface AudioComponentDescription {
	componentType: number;
	componentSubType: number;
	componentManufacturer: number;
	componentFlags: number;
	componentFlagsMask: number;
}
declare var AudioComponentDescription: interop.StructType<AudioComponentDescription>;

declare function AudioComponentFindNext(inComponent: interop.Pointer | interop.Reference<any>, inDesc: interop.Pointer | interop.Reference<AudioComponentDescription>): interop.Pointer | interop.Reference<any>;

declare const enum AudioComponentFlags {

	kAudioComponentFlag_Unsearchable = 1,

	kAudioComponentFlag_SandboxSafe = 2,

	kAudioComponentFlag_IsV3AudioUnit = 4,

	kAudioComponentFlag_RequiresAsyncInstantiation = 8,

	kAudioComponentFlag_CanLoadInProcess = 16
}

declare function AudioComponentGetDescription(inComponent: interop.Pointer | interop.Reference<any>, outDesc: interop.Pointer | interop.Reference<AudioComponentDescription>): number;

declare function AudioComponentGetIcon(comp: interop.Pointer | interop.Reference<any>, desiredPointSize: number): UIImage;

declare function AudioComponentGetLastActiveTime(comp: interop.Pointer | interop.Reference<any>): number;

declare function AudioComponentGetVersion(inComponent: interop.Pointer | interop.Reference<any>, outVersion: interop.Pointer | interop.Reference<number>): number;

declare function AudioComponentInstanceCanDo(inInstance: interop.Pointer | interop.Reference<any>, inSelectorID: number): boolean;

declare function AudioComponentInstanceDispose(inInstance: interop.Pointer | interop.Reference<any>): number;

declare function AudioComponentInstanceGetComponent(inInstance: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function AudioComponentInstanceNew(inComponent: interop.Pointer | interop.Reference<any>, outInstance: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AudioComponentInstantiate(inComponent: interop.Pointer | interop.Reference<any>, inOptions: AudioComponentInstantiationOptions, inCompletionHandler: (p1: interop.Pointer | interop.Reference<any>, p2: number) => void): void;

declare const enum AudioComponentInstantiationOptions {

	kAudioComponentInstantiation_LoadOutOfProcess = 1,

	kAudioComponentInstantiation_LoadInProcess = 2
}

interface AudioComponentPlugInInterface {
	Open: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>;
	Close: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	Lookup: interop.FunctionReference<(p1: number) => interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>>;
	reserved: interop.Pointer | interop.Reference<any>;
}
declare var AudioComponentPlugInInterface: interop.StructType<AudioComponentPlugInInterface>;

declare function AudioComponentRegister(inDesc: interop.Pointer | interop.Reference<AudioComponentDescription>, inName: string, inVersion: number, inFactory: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<AudioComponentDescription>) => interop.Pointer | interop.Reference<AudioComponentPlugInInterface>>): interop.Pointer | interop.Reference<any>;

declare const enum AudioComponentValidationResult {

	kAudioComponentValidationResult_Unknown = 0,

	kAudioComponentValidationResult_Passed = 1,

	kAudioComponentValidationResult_Failed = 2,

	kAudioComponentValidationResult_TimedOut = 3,

	kAudioComponentValidationResult_UnauthorizedError_Open = 4,

	kAudioComponentValidationResult_UnauthorizedError_Init = 5
}

declare function AudioConverterConvertBuffer(inAudioConverter: interop.Pointer | interop.Reference<any>, inInputDataSize: number, inInputData: interop.Pointer | interop.Reference<any>, ioOutputDataSize: interop.Pointer | interop.Reference<number>, outOutputData: interop.Pointer | interop.Reference<any>): number;

declare function AudioConverterConvertComplexBuffer(inAudioConverter: interop.Pointer | interop.Reference<any>, inNumberPCMFrames: number, inInputData: interop.Pointer | interop.Reference<AudioBufferList>, outOutputData: interop.Pointer | interop.Reference<AudioBufferList>): number;

declare function AudioConverterDispose(inAudioConverter: interop.Pointer | interop.Reference<any>): number;

declare function AudioConverterFillComplexBuffer(inAudioConverter: interop.Pointer | interop.Reference<any>, inInputDataProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<AudioBufferList>, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<AudioStreamPacketDescription>>, p5: interop.Pointer | interop.Reference<any>) => number>, inInputDataProcUserData: interop.Pointer | interop.Reference<any>, ioOutputDataPacketSize: interop.Pointer | interop.Reference<number>, outOutputData: interop.Pointer | interop.Reference<AudioBufferList>, outPacketDescription: interop.Pointer | interop.Reference<AudioStreamPacketDescription>): number;

declare function AudioConverterGetProperty(inAudioConverter: interop.Pointer | interop.Reference<any>, inPropertyID: number, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function AudioConverterGetPropertyInfo(inAudioConverter: interop.Pointer | interop.Reference<any>, inPropertyID: number, outSize: interop.Pointer | interop.Reference<number>, outWritable: string): number;

declare function AudioConverterNew(inSourceFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inDestinationFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, outAudioConverter: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AudioConverterNewSpecific(inSourceFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inDestinationFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inNumberClassDescriptions: number, inClassDescriptions: interop.Pointer | interop.Reference<AudioClassDescription>, outAudioConverter: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

interface AudioConverterPrimeInfo {
	leadingFrames: number;
	trailingFrames: number;
}
declare var AudioConverterPrimeInfo: interop.StructType<AudioConverterPrimeInfo>;

declare function AudioConverterReset(inAudioConverter: interop.Pointer | interop.Reference<any>): number;

declare function AudioConverterSetProperty(inAudioConverter: interop.Pointer | interop.Reference<any>, inPropertyID: number, inPropertyDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileClose(inAudioFile: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileCountUserData(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, outNumberItems: interop.Pointer | interop.Reference<number>): number;

declare function AudioFileCreateWithURL(inFileRef: NSURL, inFileType: number, inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inFlags: AudioFileFlags, outAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare const enum AudioFileFlags {

	kAudioFileFlags_EraseFile = 1,

	kAudioFileFlags_DontPageAlignAudioData = 2
}

declare function AudioFileGetGlobalInfo(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, ioDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileGetGlobalInfoSize(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, outDataSize: interop.Pointer | interop.Reference<number>): number;

declare function AudioFileGetProperty(inAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, ioDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileGetPropertyInfo(inAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, outDataSize: interop.Pointer | interop.Reference<number>, isWritable: interop.Pointer | interop.Reference<number>): number;

declare function AudioFileGetUserData(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, inIndex: number, ioUserDataSize: interop.Pointer | interop.Reference<number>, outUserData: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileGetUserDataSize(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, inIndex: number, outUserDataSize: interop.Pointer | interop.Reference<number>): number;

declare function AudioFileInitializeWithCallbacks(inClientData: interop.Pointer | interop.Reference<any>, inReadFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<number>) => number>, inWriteFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<number>) => number>, inGetSizeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, inSetSizeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>, inFileType: number, inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inFlags: AudioFileFlags, outAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

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

declare function AudioFileOpenURL(inFileRef: NSURL, inPermissions: AudioFilePermissions, inFileTypeHint: number, outAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AudioFileOpenWithCallbacks(inClientData: interop.Pointer | interop.Reference<any>, inReadFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<number>) => number>, inWriteFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<number>) => number>, inGetSizeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, inSetSizeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>, inFileTypeHint: number, outAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AudioFileOptimize(inAudioFile: interop.Pointer | interop.Reference<any>): number;

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

declare function AudioFileReadBytes(inAudioFile: interop.Pointer | interop.Reference<any>, inUseCache: boolean, inStartingByte: number, ioNumBytes: interop.Pointer | interop.Reference<number>, outBuffer: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileReadPacketData(inAudioFile: interop.Pointer | interop.Reference<any>, inUseCache: boolean, ioNumBytes: interop.Pointer | interop.Reference<number>, outPacketDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, inStartingPacket: number, ioNumPackets: interop.Pointer | interop.Reference<number>, outBuffer: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileReadPackets(inAudioFile: interop.Pointer | interop.Reference<any>, inUseCache: boolean, outNumBytes: interop.Pointer | interop.Reference<number>, outPacketDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, inStartingPacket: number, ioNumPackets: interop.Pointer | interop.Reference<number>, outBuffer: interop.Pointer | interop.Reference<any>): number;

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

declare function AudioFileRemoveUserData(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, inIndex: number): number;

declare function AudioFileSetProperty(inAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, inDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileSetUserData(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, inIndex: number, inUserDataSize: number, inUserData: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileStreamClose(inAudioFileStream: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileStreamGetProperty(inAudioFileStream: interop.Pointer | interop.Reference<any>, inPropertyID: number, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileStreamGetPropertyInfo(inAudioFileStream: interop.Pointer | interop.Reference<any>, inPropertyID: number, outPropertyDataSize: interop.Pointer | interop.Reference<number>, outWritable: string): number;

declare function AudioFileStreamOpen(inClientData: interop.Pointer | interop.Reference<any>, inPropertyListenerProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<AudioFileStreamPropertyFlags>) => void>, inPacketsProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<AudioStreamPacketDescription>) => void>, inFileTypeHint: number, outAudioFileStream: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AudioFileStreamParseBytes(inAudioFileStream: interop.Pointer | interop.Reference<any>, inDataByteSize: number, inData: interop.Pointer | interop.Reference<any>, inFlags: AudioFileStreamParseFlags): number;

declare const enum AudioFileStreamParseFlags {

	kAudioFileStreamParseFlag_Discontinuity = 1
}

declare const enum AudioFileStreamPropertyFlags {

	kAudioFileStreamPropertyFlag_PropertyIsCached = 1,

	kAudioFileStreamPropertyFlag_CacheProperty = 2
}

declare function AudioFileStreamSeek(inAudioFileStream: interop.Pointer | interop.Reference<any>, inPacketOffset: number, outDataByteOffset: interop.Pointer | interop.Reference<number>, ioFlags: interop.Pointer | interop.Reference<AudioFileStreamSeekFlags>): number;

declare const enum AudioFileStreamSeekFlags {

	kAudioFileStreamSeekFlag_OffsetIsEstimated = 1
}

declare function AudioFileStreamSetProperty(inAudioFileStream: interop.Pointer | interop.Reference<any>, inPropertyID: number, inPropertyDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

interface AudioFileTypeAndFormatID {
	mFileType: number;
	mFormatID: number;
}
declare var AudioFileTypeAndFormatID: interop.StructType<AudioFileTypeAndFormatID>;

declare function AudioFileWriteBytes(inAudioFile: interop.Pointer | interop.Reference<any>, inUseCache: boolean, inStartingByte: number, ioNumBytes: interop.Pointer | interop.Reference<number>, inBuffer: interop.Pointer | interop.Reference<any>): number;

declare function AudioFileWritePackets(inAudioFile: interop.Pointer | interop.Reference<any>, inUseCache: boolean, inNumBytes: number, inPacketDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, inStartingPacket: number, ioNumPackets: interop.Pointer | interop.Reference<number>, inBuffer: interop.Pointer | interop.Reference<any>): number;

interface AudioFile_SMPTE_Time {
	mHours: number;
	mMinutes: number;
	mSeconds: number;
	mFrames: number;
	mSubFrameSampleOffset: number;
}
declare var AudioFile_SMPTE_Time: interop.StructType<AudioFile_SMPTE_Time>;

declare function AudioFormatGetProperty(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function AudioFormatGetPropertyInfo(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, outPropertyDataSize: interop.Pointer | interop.Reference<number>): number;

interface AudioFormatInfo {
	mASBD: AudioStreamBasicDescription;
	mMagicCookie: interop.Pointer | interop.Reference<any>;
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

declare function AudioOutputUnitGetHostIcon(au: interop.Pointer | interop.Reference<any>, desiredPointSize: number): UIImage;

interface AudioOutputUnitMIDICallbacks {
	userData: interop.Pointer | interop.Reference<any>;
	MIDIEventProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: number) => void>;
	MIDISysExProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => void>;
}
declare var AudioOutputUnitMIDICallbacks: interop.StructType<AudioOutputUnitMIDICallbacks>;

declare function AudioOutputUnitPublish(inDesc: interop.Pointer | interop.Reference<AudioComponentDescription>, inName: string, inVersion: number, inOutputUnit: interop.Pointer | interop.Reference<any>): number;

declare function AudioOutputUnitStart(ci: interop.Pointer | interop.Reference<any>): number;

interface AudioOutputUnitStartAtTimeParams {
	mTimestamp: AudioTimeStamp;
	mFlags: number;
}
declare var AudioOutputUnitStartAtTimeParams: interop.StructType<AudioOutputUnitStartAtTimeParams>;

declare function AudioOutputUnitStop(ci: interop.Pointer | interop.Reference<any>): number;

interface AudioPanningInfo {
	mPanningMode: AudioPanningMode;
	mCoordinateFlags: number;
	mCoordinates: interop.Reference<number>;
	mGainScale: number;
	mOutputChannelMap: interop.Pointer | interop.Reference<AudioChannelLayout>;
}
declare var AudioPanningInfo: interop.StructType<AudioPanningInfo>;

declare const enum AudioPanningMode {

	kPanningMode_SoundField = 3,

	kPanningMode_VectorBasedPanning = 4
}

declare function AudioQueueAddPropertyListener(inAQ: interop.Pointer | interop.Reference<any>, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>, inUserData: interop.Pointer | interop.Reference<any>): number;

declare function AudioQueueAllocateBuffer(inAQ: interop.Pointer | interop.Reference<any>, inBufferByteSize: number, outBuffer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<AudioQueueBuffer>>): number;

declare function AudioQueueAllocateBufferWithPacketDescriptions(inAQ: interop.Pointer | interop.Reference<any>, inBufferByteSize: number, inNumberPacketDescriptions: number, outBuffer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<AudioQueueBuffer>>): number;

interface AudioQueueBuffer {
	mAudioDataBytesCapacity: number;
	mAudioData: interop.Pointer | interop.Reference<any>;
	mAudioDataByteSize: number;
	mUserData: interop.Pointer | interop.Reference<any>;
	mPacketDescriptionCapacity: number;
	mPacketDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>;
	mPacketDescriptionCount: number;
}
declare var AudioQueueBuffer: interop.StructType<AudioQueueBuffer>;

interface AudioQueueChannelAssignment {
	mDeviceUID: string;
	mChannelNumber: number;
}
declare var AudioQueueChannelAssignment: interop.StructType<AudioQueueChannelAssignment>;

declare function AudioQueueCreateTimeline(inAQ: interop.Pointer | interop.Reference<any>, outTimeline: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AudioQueueDeviceGetCurrentTime(inAQ: interop.Pointer | interop.Reference<any>, outTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>): number;

declare function AudioQueueDeviceGetNearestStartTime(inAQ: interop.Pointer | interop.Reference<any>, ioRequestedStartTime: interop.Pointer | interop.Reference<AudioTimeStamp>, inFlags: number): number;

declare function AudioQueueDeviceTranslateTime(inAQ: interop.Pointer | interop.Reference<any>, inTime: interop.Pointer | interop.Reference<AudioTimeStamp>, outTime: interop.Pointer | interop.Reference<AudioTimeStamp>): number;

declare function AudioQueueDispose(inAQ: interop.Pointer | interop.Reference<any>, inImmediate: boolean): number;

declare function AudioQueueDisposeTimeline(inAQ: interop.Pointer | interop.Reference<any>, inTimeline: interop.Pointer | interop.Reference<any>): number;

declare function AudioQueueEnqueueBuffer(inAQ: interop.Pointer | interop.Reference<any>, inBuffer: interop.Pointer | interop.Reference<AudioQueueBuffer>, inNumPacketDescs: number, inPacketDescs: interop.Pointer | interop.Reference<AudioStreamPacketDescription>): number;

declare function AudioQueueEnqueueBufferWithParameters(inAQ: interop.Pointer | interop.Reference<any>, inBuffer: interop.Pointer | interop.Reference<AudioQueueBuffer>, inNumPacketDescs: number, inPacketDescs: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, inTrimFramesAtStart: number, inTrimFramesAtEnd: number, inNumParamValues: number, inParamValues: interop.Pointer | interop.Reference<AudioQueueParameterEvent>, inStartTime: interop.Pointer | interop.Reference<AudioTimeStamp>, outActualStartTime: interop.Pointer | interop.Reference<AudioTimeStamp>): number;

declare function AudioQueueFlush(inAQ: interop.Pointer | interop.Reference<any>): number;

declare function AudioQueueFreeBuffer(inAQ: interop.Pointer | interop.Reference<any>, inBuffer: interop.Pointer | interop.Reference<AudioQueueBuffer>): number;

declare function AudioQueueGetCurrentTime(inAQ: interop.Pointer | interop.Reference<any>, inTimeline: interop.Pointer | interop.Reference<any>, outTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>, outTimelineDiscontinuity: string): number;

declare function AudioQueueGetParameter(inAQ: interop.Pointer | interop.Reference<any>, inParamID: number, outValue: interop.Pointer | interop.Reference<number>): number;

declare function AudioQueueGetProperty(inAQ: interop.Pointer | interop.Reference<any>, inID: number, outData: interop.Pointer | interop.Reference<any>, ioDataSize: interop.Pointer | interop.Reference<number>): number;

declare function AudioQueueGetPropertySize(inAQ: interop.Pointer | interop.Reference<any>, inID: number, outDataSize: interop.Pointer | interop.Reference<number>): number;

interface AudioQueueLevelMeterState {
	mAveragePower: number;
	mPeakPower: number;
}
declare var AudioQueueLevelMeterState: interop.StructType<AudioQueueLevelMeterState>;

declare function AudioQueueNewInput(inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inCallbackProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<AudioQueueBuffer>, p4: interop.Pointer | interop.Reference<AudioTimeStamp>, p5: number, p6: interop.Pointer | interop.Reference<AudioStreamPacketDescription>) => void>, inUserData: interop.Pointer | interop.Reference<any>, inCallbackRunLoop: any, inCallbackRunLoopMode: string, inFlags: number, outAQ: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AudioQueueNewInputWithDispatchQueue(outAQ: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inFlags: number, inCallbackDispatchQueue: NSObject, inCallbackBlock: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioQueueBuffer>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: interop.Pointer | interop.Reference<AudioStreamPacketDescription>) => void): number;

declare function AudioQueueNewOutput(inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inCallbackProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<AudioQueueBuffer>) => void>, inUserData: interop.Pointer | interop.Reference<any>, inCallbackRunLoop: any, inCallbackRunLoopMode: string, inFlags: number, outAQ: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AudioQueueNewOutputWithDispatchQueue(outAQ: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inFlags: number, inCallbackDispatchQueue: NSObject, inCallbackBlock: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioQueueBuffer>) => void): number;

declare function AudioQueueOfflineRender(inAQ: interop.Pointer | interop.Reference<any>, inTimestamp: interop.Pointer | interop.Reference<AudioTimeStamp>, ioBuffer: interop.Pointer | interop.Reference<AudioQueueBuffer>, inNumberFrames: number): number;

interface AudioQueueParameterEvent {
	mID: number;
	mValue: number;
}
declare var AudioQueueParameterEvent: interop.StructType<AudioQueueParameterEvent>;

declare function AudioQueuePause(inAQ: interop.Pointer | interop.Reference<any>): number;

declare function AudioQueuePrime(inAQ: interop.Pointer | interop.Reference<any>, inNumberOfFramesToPrepare: number, outNumberOfFramesPrepared: interop.Pointer | interop.Reference<number>): number;

declare function AudioQueueProcessingTapDispose(inAQTap: interop.Pointer | interop.Reference<any>): number;

declare const enum AudioQueueProcessingTapFlags {

	kAudioQueueProcessingTap_PreEffects = 1,

	kAudioQueueProcessingTap_PostEffects = 2,

	kAudioQueueProcessingTap_Siphon = 4,

	kAudioQueueProcessingTap_StartOfStream = 256,

	kAudioQueueProcessingTap_EndOfStream = 512
}

declare function AudioQueueProcessingTapGetQueueTime(inAQTap: interop.Pointer | interop.Reference<any>, outQueueSampleTime: interop.Pointer | interop.Reference<number>, outQueueFrameCount: interop.Pointer | interop.Reference<number>): number;

declare function AudioQueueProcessingTapGetSourceAudio(inAQTap: interop.Pointer | interop.Reference<any>, inNumberFrames: number, ioTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>, outFlags: interop.Pointer | interop.Reference<AudioQueueProcessingTapFlags>, outNumberFrames: interop.Pointer | interop.Reference<number>, ioData: interop.Pointer | interop.Reference<AudioBufferList>): number;

declare function AudioQueueProcessingTapNew(inAQ: interop.Pointer | interop.Reference<any>, inCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<AudioTimeStamp>, p5: interop.Pointer | interop.Reference<AudioQueueProcessingTapFlags>, p6: interop.Pointer | interop.Reference<number>, p7: interop.Pointer | interop.Reference<AudioBufferList>) => void>, inClientData: interop.Pointer | interop.Reference<any>, inFlags: AudioQueueProcessingTapFlags, outMaxFrames: interop.Pointer | interop.Reference<number>, outProcessingFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, outAQTap: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AudioQueueRemovePropertyListener(inAQ: interop.Pointer | interop.Reference<any>, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>, inUserData: interop.Pointer | interop.Reference<any>): number;

declare function AudioQueueReset(inAQ: interop.Pointer | interop.Reference<any>): number;

declare function AudioQueueSetOfflineRenderFormat(inAQ: interop.Pointer | interop.Reference<any>, inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inLayout: interop.Pointer | interop.Reference<AudioChannelLayout>): number;

declare function AudioQueueSetParameter(inAQ: interop.Pointer | interop.Reference<any>, inParamID: number, inValue: number): number;

declare function AudioQueueSetProperty(inAQ: interop.Pointer | interop.Reference<any>, inID: number, inData: interop.Pointer | interop.Reference<any>, inDataSize: number): number;

declare function AudioQueueStart(inAQ: interop.Pointer | interop.Reference<any>, inStartTime: interop.Pointer | interop.Reference<AudioTimeStamp>): number;

declare function AudioQueueStop(inAQ: interop.Pointer | interop.Reference<any>, inImmediate: boolean): number;

declare function AudioServicesAddSystemSoundCompletion(inSystemSoundID: number, inRunLoop: any, inRunLoopMode: string, inCompletionRoutine: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any>) => void>, inClientData: interop.Pointer | interop.Reference<any>): number;

declare function AudioServicesCreateSystemSoundID(inFileURL: NSURL, outSystemSoundID: interop.Pointer | interop.Reference<number>): number;

declare function AudioServicesDisposeSystemSoundID(inSystemSoundID: number): number;

declare function AudioServicesGetProperty(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function AudioServicesGetPropertyInfo(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, outPropertyDataSize: interop.Pointer | interop.Reference<number>, outWritable: string): number;

declare function AudioServicesPlayAlertSound(inSystemSoundID: number): void;

declare function AudioServicesPlayAlertSoundWithCompletion(inSystemSoundID: number, inCompletionBlock: () => void): void;

declare function AudioServicesPlaySystemSound(inSystemSoundID: number): void;

declare function AudioServicesPlaySystemSoundWithCompletion(inSystemSoundID: number, inCompletionBlock: () => void): void;

declare function AudioServicesRemoveSystemSoundCompletion(inSystemSoundID: number): void;

declare function AudioServicesSetProperty(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, inPropertyDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function AudioSessionAddPropertyListener(inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>) => void>, inClientData: interop.Pointer | interop.Reference<any>): number;

declare function AudioSessionGetProperty(inID: number, ioDataSize: interop.Pointer | interop.Reference<number>, outData: interop.Pointer | interop.Reference<any>): number;

declare function AudioSessionGetPropertySize(inID: number, outDataSize: interop.Pointer | interop.Reference<number>): number;

declare function AudioSessionInitialize(inRunLoop: any, inRunLoopMode: string, inInterruptionListener: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => void>, inClientData: interop.Pointer | interop.Reference<any>): number;

declare function AudioSessionRemovePropertyListener(inID: number): number;

declare function AudioSessionRemovePropertyListenerWithUserData(inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>) => void>, inClientData: interop.Pointer | interop.Reference<any>): number;

declare function AudioSessionSetActive(active: boolean): number;

declare function AudioSessionSetActiveWithFlags(active: boolean, inFlags: number): number;

declare function AudioSessionSetProperty(inID: number, inDataSize: number, inData: interop.Pointer | interop.Reference<any>): number;

declare function AudioUnitAddPropertyListener(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: number) => void>, inProcUserData: interop.Pointer | interop.Reference<any>): number;

declare function AudioUnitAddRenderNotify(inUnit: interop.Pointer | interop.Reference<any>, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<AudioBufferList>) => number>, inProcUserData: interop.Pointer | interop.Reference<any>): number;

interface AudioUnitConnection {
	sourceAudioUnit: interop.Pointer | interop.Reference<any>;
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

declare function AudioUnitGetParameter(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inScope: number, inElement: number, outValue: interop.Pointer | interop.Reference<number>): number;

declare function AudioUnitGetProperty(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inScope: number, inElement: number, outData: interop.Pointer | interop.Reference<any>, ioDataSize: interop.Pointer | interop.Reference<number>): number;

declare function AudioUnitGetPropertyInfo(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inScope: number, inElement: number, outDataSize: interop.Pointer | interop.Reference<number>, outWritable: string): number;

declare function AudioUnitInitialize(inUnit: interop.Pointer | interop.Reference<any>): number;

interface AudioUnitMeterClipping {
	peakValueSinceLastCall: number;
	sawInfinity: boolean;
	sawNotANumber: boolean;
}
declare var AudioUnitMeterClipping: interop.StructType<AudioUnitMeterClipping>;

interface AudioUnitNodeConnection {
	sourceNode: number;
	sourceOutputNumber: number;
	destNode: number;
	destInputNumber: number;
}
declare var AudioUnitNodeConnection: interop.StructType<AudioUnitNodeConnection>;

interface AudioUnitParameter {
	mAudioUnit: interop.Pointer | interop.Reference<any>;
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
	inValue: interop.Pointer | interop.Reference<number>;
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

declare function AudioUnitProcess(inUnit: interop.Pointer | interop.Reference<any>, ioActionFlags: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, inTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>, inNumberFrames: number, ioData: interop.Pointer | interop.Reference<AudioBufferList>): number;

declare function AudioUnitProcessMultiple(inUnit: interop.Pointer | interop.Reference<any>, ioActionFlags: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, inTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>, inNumberFrames: number, inNumberInputBufferLists: number, inInputBufferLists: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<AudioBufferList>>, inNumberOutputBufferLists: number, ioOutputBufferLists: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<AudioBufferList>>): number;

interface AudioUnitProperty {
	mAudioUnit: interop.Pointer | interop.Reference<any>;
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

declare function AudioUnitRemovePropertyListenerWithUserData(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: number) => void>, inProcUserData: interop.Pointer | interop.Reference<any>): number;

declare function AudioUnitRemoveRenderNotify(inUnit: interop.Pointer | interop.Reference<any>, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<AudioBufferList>) => number>, inProcUserData: interop.Pointer | interop.Reference<any>): number;

declare function AudioUnitRender(inUnit: interop.Pointer | interop.Reference<any>, ioActionFlags: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, inTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>, inOutputBusNumber: number, inNumberFrames: number, ioData: interop.Pointer | interop.Reference<AudioBufferList>): number;

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

declare function AudioUnitReset(inUnit: interop.Pointer | interop.Reference<any>, inScope: number, inElement: number): number;

declare function AudioUnitSetParameter(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inScope: number, inElement: number, inValue: number, inBufferOffsetInFrames: number): number;

declare function AudioUnitSetProperty(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inScope: number, inElement: number, inData: interop.Pointer | interop.Reference<any>, inDataSize: number): number;

declare function AudioUnitUninitialize(inUnit: interop.Pointer | interop.Reference<any>): number;

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

declare function CAShow(inObject: interop.Pointer | interop.Reference<any>): void;

declare function CAShowFile(inObject: interop.Pointer | interop.Reference<any>, inFile: interop.Pointer | interop.Reference<FILE>): void;

declare function CopyInstrumentInfoFromSoundBank(inURL: NSURL, outInstrumentInfo: interop.Pointer | interop.Reference<NSArray<any>>): number;

declare function CopyNameFromSoundBank(inURL: NSURL, outName: interop.Pointer | interop.Reference<string>): number;

declare function DisposeAUGraph(inGraph: interop.Pointer | interop.Reference<any>): number;

declare function DisposeMusicEventIterator(inIterator: interop.Pointer | interop.Reference<any>): number;

declare function DisposeMusicPlayer(inPlayer: interop.Pointer | interop.Reference<any>): number;

declare function DisposeMusicSequence(inSequence: interop.Pointer | interop.Reference<any>): number;

declare function ExtAudioFileCreateWithURL(inURL: NSURL, inFileType: number, inStreamDesc: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inChannelLayout: interop.Pointer | interop.Reference<AudioChannelLayout>, inFlags: number, outExtAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function ExtAudioFileDispose(inExtAudioFile: interop.Pointer | interop.Reference<any>): number;

declare function ExtAudioFileGetProperty(inExtAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function ExtAudioFileGetPropertyInfo(inExtAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, outSize: interop.Pointer | interop.Reference<number>, outWritable: string): number;

declare function ExtAudioFileOpenURL(inURL: NSURL, outExtAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function ExtAudioFileRead(inExtAudioFile: interop.Pointer | interop.Reference<any>, ioNumberFrames: interop.Pointer | interop.Reference<number>, ioData: interop.Pointer | interop.Reference<AudioBufferList>): number;

declare function ExtAudioFileSeek(inExtAudioFile: interop.Pointer | interop.Reference<any>, inFrameOffset: number): number;

declare function ExtAudioFileSetProperty(inExtAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, inPropertyDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

declare function ExtAudioFileTell(inExtAudioFile: interop.Pointer | interop.Reference<any>, outFrameOffset: interop.Pointer | interop.Reference<number>): number;

declare function ExtAudioFileWrapAudioFileID(inFileID: interop.Pointer | interop.Reference<any>, inForWriting: boolean, outExtAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function ExtAudioFileWrite(inExtAudioFile: interop.Pointer | interop.Reference<any>, inNumberFrames: number, ioData: interop.Pointer | interop.Reference<AudioBufferList>): number;

declare function ExtAudioFileWriteAsync(inExtAudioFile: interop.Pointer | interop.Reference<any>, inNumberFrames: number, ioData: interop.Pointer | interop.Reference<AudioBufferList>): number;

interface ExtendedAudioFormatInfo {
	mASBD: AudioStreamBasicDescription;
	mMagicCookie: interop.Pointer | interop.Reference<any>;
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

interface HostCallbackInfo {
	hostUserData: interop.Pointer | interop.Reference<any>;
	beatAndTempoProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>) => number>;
	musicalTimeLocationProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>) => number>;
	transportStateProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: interop.Pointer | interop.Reference<number>, p5: string, p6: interop.Pointer | interop.Reference<number>, p7: interop.Pointer | interop.Reference<number>) => number>;
	transportStateProc2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string, p5: interop.Pointer | interop.Reference<number>, p6: string, p7: interop.Pointer | interop.Reference<number>, p8: interop.Pointer | interop.Reference<number>) => number>;
}
declare var HostCallbackInfo: interop.StructType<HostCallbackInfo>;

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

interface MixerDistanceParams {
	mReferenceDistance: number;
	mMaxDistance: number;
	mMaxAttenuation: number;
}
declare var MixerDistanceParams: interop.StructType<MixerDistanceParams>;

declare function MusicDeviceMIDIEvent(inUnit: interop.Pointer | interop.Reference<any>, inStatus: number, inData1: number, inData2: number, inOffsetSampleFrame: number): number;

interface MusicDeviceNoteParams {
	argCount: number;
	mPitch: number;
	mVelocity: number;
	mControls: interop.Reference<NoteParamsControlValue>;
}
declare var MusicDeviceNoteParams: interop.StructType<MusicDeviceNoteParams>;

declare function MusicDeviceStartNote(inUnit: interop.Pointer | interop.Reference<any>, inInstrument: number, inGroupID: number, outNoteInstanceID: interop.Pointer | interop.Reference<number>, inOffsetSampleFrame: number, inParams: interop.Pointer | interop.Reference<MusicDeviceNoteParams>): number;

interface MusicDeviceStdNoteParams {
	argCount: number;
	mPitch: number;
	mVelocity: number;
}
declare var MusicDeviceStdNoteParams: interop.StructType<MusicDeviceStdNoteParams>;

declare function MusicDeviceStopNote(inUnit: interop.Pointer | interop.Reference<any>, inGroupID: number, inNoteInstanceID: number, inOffsetSampleFrame: number): number;

declare function MusicDeviceSysEx(inUnit: interop.Pointer | interop.Reference<any>, inData: string, inLength: number): number;

declare function MusicEventIteratorDeleteEvent(inIterator: interop.Pointer | interop.Reference<any>): number;

declare function MusicEventIteratorGetEventInfo(inIterator: interop.Pointer | interop.Reference<any>, outTimeStamp: interop.Pointer | interop.Reference<number>, outEventType: interop.Pointer | interop.Reference<number>, outEventData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, outEventDataSize: interop.Pointer | interop.Reference<number>): number;

declare function MusicEventIteratorHasCurrentEvent(inIterator: interop.Pointer | interop.Reference<any>, outHasCurEvent: string): number;

declare function MusicEventIteratorHasNextEvent(inIterator: interop.Pointer | interop.Reference<any>, outHasNextEvent: string): number;

declare function MusicEventIteratorHasPreviousEvent(inIterator: interop.Pointer | interop.Reference<any>, outHasPrevEvent: string): number;

declare function MusicEventIteratorNextEvent(inIterator: interop.Pointer | interop.Reference<any>): number;

declare function MusicEventIteratorPreviousEvent(inIterator: interop.Pointer | interop.Reference<any>): number;

declare function MusicEventIteratorSeek(inIterator: interop.Pointer | interop.Reference<any>, inTimeStamp: number): number;

declare function MusicEventIteratorSetEventInfo(inIterator: interop.Pointer | interop.Reference<any>, inEventType: number, inEventData: interop.Pointer | interop.Reference<any>): number;

declare function MusicEventIteratorSetEventTime(inIterator: interop.Pointer | interop.Reference<any>, inTimeStamp: number): number;

interface MusicEventUserData {
	length: number;
	data: interop.Reference<number>;
}
declare var MusicEventUserData: interop.StructType<MusicEventUserData>;

declare function MusicPlayerGetBeatsForHostTime(inPlayer: interop.Pointer | interop.Reference<any>, inHostTime: number, outBeats: interop.Pointer | interop.Reference<number>): number;

declare function MusicPlayerGetHostTimeForBeats(inPlayer: interop.Pointer | interop.Reference<any>, inBeats: number, outHostTime: interop.Pointer | interop.Reference<number>): number;

declare function MusicPlayerGetPlayRateScalar(inPlayer: interop.Pointer | interop.Reference<any>, outScaleRate: interop.Pointer | interop.Reference<number>): number;

declare function MusicPlayerGetSequence(inPlayer: interop.Pointer | interop.Reference<any>, outSequence: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function MusicPlayerGetTime(inPlayer: interop.Pointer | interop.Reference<any>, outTime: interop.Pointer | interop.Reference<number>): number;

declare function MusicPlayerIsPlaying(inPlayer: interop.Pointer | interop.Reference<any>, outIsPlaying: string): number;

declare function MusicPlayerPreroll(inPlayer: interop.Pointer | interop.Reference<any>): number;

declare function MusicPlayerSetPlayRateScalar(inPlayer: interop.Pointer | interop.Reference<any>, inScaleRate: number): number;

declare function MusicPlayerSetSequence(inPlayer: interop.Pointer | interop.Reference<any>, inSequence: interop.Pointer | interop.Reference<any>): number;

declare function MusicPlayerSetTime(inPlayer: interop.Pointer | interop.Reference<any>, inTime: number): number;

declare function MusicPlayerStart(inPlayer: interop.Pointer | interop.Reference<any>): number;

declare function MusicPlayerStop(inPlayer: interop.Pointer | interop.Reference<any>): number;

declare function MusicSequenceBarBeatTimeToBeats(inSequence: interop.Pointer | interop.Reference<any>, inBarBeatTime: interop.Pointer | interop.Reference<CABarBeatTime>, outBeats: interop.Pointer | interop.Reference<number>): number;

declare function MusicSequenceBeatsToBarBeatTime(inSequence: interop.Pointer | interop.Reference<any>, inBeats: number, inSubbeatDivisor: number, outBarBeatTime: interop.Pointer | interop.Reference<CABarBeatTime>): number;

declare function MusicSequenceDisposeTrack(inSequence: interop.Pointer | interop.Reference<any>, inTrack: interop.Pointer | interop.Reference<any>): number;

declare function MusicSequenceFileCreate(inSequence: interop.Pointer | interop.Reference<any>, inFileRef: NSURL, inFileType: MusicSequenceFileTypeID, inFlags: MusicSequenceFileFlags, inResolution: number): number;

declare function MusicSequenceFileCreateData(inSequence: interop.Pointer | interop.Reference<any>, inFileType: MusicSequenceFileTypeID, inFlags: MusicSequenceFileFlags, inResolution: number, outData: interop.Pointer | interop.Reference<NSData>): number;

declare const enum MusicSequenceFileFlags {

	kMusicSequenceFileFlags_Default = 0,

	kMusicSequenceFileFlags_EraseFile = 1
}

declare function MusicSequenceFileLoad(inSequence: interop.Pointer | interop.Reference<any>, inFileRef: NSURL, inFileTypeHint: MusicSequenceFileTypeID, inFlags: MusicSequenceLoadFlags): number;

declare function MusicSequenceFileLoadData(inSequence: interop.Pointer | interop.Reference<any>, inData: NSData, inFileTypeHint: MusicSequenceFileTypeID, inFlags: MusicSequenceLoadFlags): number;

declare const enum MusicSequenceFileTypeID {

	kMusicSequenceFile_AnyType = 0,

	kMusicSequenceFile_MIDIType = 1835623529,

	kMusicSequenceFile_iMelodyType = 1768777068
}

declare function MusicSequenceGetAUGraph(inSequence: interop.Pointer | interop.Reference<any>, outGraph: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function MusicSequenceGetBeatsForSeconds(inSequence: interop.Pointer | interop.Reference<any>, inSeconds: number, outBeats: interop.Pointer | interop.Reference<number>): number;

declare function MusicSequenceGetIndTrack(inSequence: interop.Pointer | interop.Reference<any>, inTrackIndex: number, outTrack: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function MusicSequenceGetInfoDictionary(inSequence: interop.Pointer | interop.Reference<any>): NSDictionary<any, any>;

declare function MusicSequenceGetSecondsForBeats(inSequence: interop.Pointer | interop.Reference<any>, inBeats: number, outSeconds: interop.Pointer | interop.Reference<number>): number;

declare function MusicSequenceGetSequenceType(inSequence: interop.Pointer | interop.Reference<any>, outType: interop.Pointer | interop.Reference<MusicSequenceType>): number;

declare function MusicSequenceGetTempoTrack(inSequence: interop.Pointer | interop.Reference<any>, outTrack: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function MusicSequenceGetTrackCount(inSequence: interop.Pointer | interop.Reference<any>, outNumberOfTracks: interop.Pointer | interop.Reference<number>): number;

declare function MusicSequenceGetTrackIndex(inSequence: interop.Pointer | interop.Reference<any>, inTrack: interop.Pointer | interop.Reference<any>, outTrackIndex: interop.Pointer | interop.Reference<number>): number;

declare const enum MusicSequenceLoadFlags {

	kMusicSequenceLoadSMF_PreserveTracks = 0,

	kMusicSequenceLoadSMF_ChannelsToTracks = 1
}

declare function MusicSequenceNewTrack(inSequence: interop.Pointer | interop.Reference<any>, outTrack: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function MusicSequenceReverse(inSequence: interop.Pointer | interop.Reference<any>): number;

declare function MusicSequenceSetAUGraph(inSequence: interop.Pointer | interop.Reference<any>, inGraph: interop.Pointer | interop.Reference<any>): number;

declare function MusicSequenceSetMIDIEndpoint(inSequence: interop.Pointer | interop.Reference<any>, inEndpoint: number): number;

declare function MusicSequenceSetSequenceType(inSequence: interop.Pointer | interop.Reference<any>, inType: MusicSequenceType): number;

declare function MusicSequenceSetUserCallback(inSequence: interop.Pointer | interop.Reference<any>, inCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<MusicEventUserData>, p6: number, p7: number) => void>, inClientData: interop.Pointer | interop.Reference<any>): number;

declare const enum MusicSequenceType {

	kMusicSequenceType_Beats = 1650811252,

	kMusicSequenceType_Seconds = 1936024435,

	kMusicSequenceType_Samples = 1935764848
}

declare function MusicTrackClear(inTrack: interop.Pointer | interop.Reference<any>, inStartTime: number, inEndTime: number): number;

declare function MusicTrackCopyInsert(inSourceTrack: interop.Pointer | interop.Reference<any>, inSourceStartTime: number, inSourceEndTime: number, inDestTrack: interop.Pointer | interop.Reference<any>, inDestInsertTime: number): number;

declare function MusicTrackCut(inTrack: interop.Pointer | interop.Reference<any>, inStartTime: number, inEndTime: number): number;

declare function MusicTrackGetDestMIDIEndpoint(inTrack: interop.Pointer | interop.Reference<any>, outEndpoint: interop.Pointer | interop.Reference<number>): number;

declare function MusicTrackGetDestNode(inTrack: interop.Pointer | interop.Reference<any>, outNode: interop.Pointer | interop.Reference<number>): number;

declare function MusicTrackGetProperty(inTrack: interop.Pointer | interop.Reference<any>, inPropertyID: number, outData: interop.Pointer | interop.Reference<any>, ioLength: interop.Pointer | interop.Reference<number>): number;

declare function MusicTrackGetSequence(inTrack: interop.Pointer | interop.Reference<any>, outSequence: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

interface MusicTrackLoopInfo {
	loopDuration: number;
	numberOfLoops: number;
}
declare var MusicTrackLoopInfo: interop.StructType<MusicTrackLoopInfo>;

declare function MusicTrackMerge(inSourceTrack: interop.Pointer | interop.Reference<any>, inSourceStartTime: number, inSourceEndTime: number, inDestTrack: interop.Pointer | interop.Reference<any>, inDestInsertTime: number): number;

declare function MusicTrackMoveEvents(inTrack: interop.Pointer | interop.Reference<any>, inStartTime: number, inEndTime: number, inMoveTime: number): number;

declare function MusicTrackNewAUPresetEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inPresetEvent: interop.Pointer | interop.Reference<AUPresetEvent>): number;

declare function MusicTrackNewExtendedNoteEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inInfo: interop.Pointer | interop.Reference<ExtendedNoteOnEvent>): number;

declare function MusicTrackNewExtendedTempoEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inBPM: number): number;

declare function MusicTrackNewMIDIChannelEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inMessage: interop.Pointer | interop.Reference<MIDIChannelMessage>): number;

declare function MusicTrackNewMIDINoteEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inMessage: interop.Pointer | interop.Reference<MIDINoteMessage>): number;

declare function MusicTrackNewMIDIRawDataEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inRawData: interop.Pointer | interop.Reference<MIDIRawData>): number;

declare function MusicTrackNewMetaEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inMetaEvent: interop.Pointer | interop.Reference<MIDIMetaEvent>): number;

declare function MusicTrackNewParameterEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inInfo: interop.Pointer | interop.Reference<ParameterEvent>): number;

declare function MusicTrackNewUserEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inUserData: interop.Pointer | interop.Reference<MusicEventUserData>): number;

declare function MusicTrackSetDestMIDIEndpoint(inTrack: interop.Pointer | interop.Reference<any>, inEndpoint: number): number;

declare function MusicTrackSetDestNode(inTrack: interop.Pointer | interop.Reference<any>, inNode: number): number;

declare function MusicTrackSetProperty(inTrack: interop.Pointer | interop.Reference<any>, inPropertyID: number, inData: interop.Pointer | interop.Reference<any>, inLength: number): number;

declare function NewAUGraph(outGraph: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function NewMusicEventIterator(inTrack: interop.Pointer | interop.Reference<any>, outIterator: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function NewMusicPlayer(outPlayer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function NewMusicSequence(outSequence: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

interface NoteParamsControlValue {
	mID: number;
	mValue: number;
}
declare var NoteParamsControlValue: interop.StructType<NoteParamsControlValue>;

interface ParameterEvent {
	parameterID: number;
	scope: number;
	element: number;
	value: number;
}
declare var ParameterEvent: interop.StructType<ParameterEvent>;

interface ScheduledAudioFileRegion {
	mTimeStamp: AudioTimeStamp;
	mCompletionProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<ScheduledAudioFileRegion>, p3: number) => void>;
	mCompletionProcUserData: interop.Pointer | interop.Reference<any>;
	mAudioFile: interop.Pointer | interop.Reference<any>;
	mLoopCount: number;
	mStartFrame: number;
	mFramesToPlay: number;
}
declare var ScheduledAudioFileRegion: interop.StructType<ScheduledAudioFileRegion>;

interface ScheduledAudioSlice {
	mTimeStamp: AudioTimeStamp;
	mCompletionProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<ScheduledAudioSlice>) => void>;
	mCompletionProcUserData: interop.Pointer | interop.Reference<any>;
	mFlags: AUScheduledAudioSliceFlags;
	mReserved: number;
	mReserved2: interop.Pointer | interop.Reference<any>;
	mNumberFrames: number;
	mBufferList: interop.Pointer | interop.Reference<AudioBufferList>;
}
declare var ScheduledAudioSlice: interop.StructType<ScheduledAudioSlice>;

declare var kAudioComponentInstanceInvalidationNotification: string;

declare var kAudioComponentRegistrationsChangedNotification: string;

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
