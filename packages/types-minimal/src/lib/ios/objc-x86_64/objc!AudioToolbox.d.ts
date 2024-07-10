
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

/**
 * @since 9.0
 */
declare class AUAudioUnit extends NSObject {

	static alloc(): AUAudioUnit; // inherited from NSObject

	static instantiateWithComponentDescriptionOptionsCompletionHandler(componentDescription: AudioComponentDescription, options: AudioComponentInstantiationOptions, completionHandler: (p1: AUAudioUnit, p2: NSError) => void): void;

	static new(): AUAudioUnit; // inherited from NSObject

	static registerSubclassAsComponentDescriptionNameVersion(cls: typeof NSObject, componentDescription: AudioComponentDescription, name: string, version: number): void;

	/**
	 * @since 15.0
	 */
	readonly AudioUnitMIDIProtocol: MIDIProtocolID;

	/**
	 * @since 11.0
	 */
	MIDIOutputBufferSizeHint: number;

	/**
	 * @since 11.0
	 */
	MIDIOutputEventBlock: (p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>) => number;

	/**
	 * @since 15.0
	 */
	MIDIOutputEventListBlock: (p1: number, p2: number, p3: interop.Pointer | interop.Reference<MIDIEventList>) => number;

	/**
	 * @since 11.0
	 */
	readonly MIDIOutputNames: NSArray<string>;

	readonly allParameterValues: boolean;

	readonly audioUnitName: string;

	/**
	 * @since 11.0
	 */
	readonly audioUnitShortName: string;

	readonly canPerformInput: boolean;

	readonly canPerformOutput: boolean;

	readonly canProcessInPlace: boolean;

	readonly channelCapabilities: NSArray<number>;

	/**
	 * @since 10.0
	 */
	channelMap: NSArray<number>;

	readonly component: interop.Pointer | interop.Reference<any>;

	readonly componentDescription: AudioComponentDescription;

	readonly componentName: string;

	readonly componentVersion: number;

	contextName: string;

	currentPreset: AUAudioUnitPreset;

	readonly factoryPresets: NSArray<AUAudioUnitPreset>;

	fullState: NSDictionary<string, any>;

	fullStateForDocument: NSDictionary<string, any>;

	/**
	 * @since 15.0
	 */
	hostMIDIProtocol: MIDIProtocolID;

	readonly inputBusses: AUAudioUnitBusArray;

	inputEnabled: boolean;

	inputHandler: (p1: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number) => void;

	readonly latency: number;

	readonly manufacturerName: string;

	maximumFramesToRender: number;

	/**
	 * @since 16.0
	 */
	readonly migrateFromPlugin: NSArray<any>;

	readonly musicDeviceOrEffect: boolean;

	musicalContextBlock: (p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<number>) => boolean;

	/**
	 * @since 14.0
	 */
	readonly osWorkgroup: OS_os_workgroup;

	readonly outputBusses: AUAudioUnitBusArray;

	outputEnabled: boolean;

	outputProvider: (p1: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<AudioBufferList>) => number;

	parameterTree: AUParameterTree;

	/**
	 * @since 12.0
	 */
	profileChangedBlock: (p1: number, p2: number, p3: MIDICIProfile, p4: boolean) => void;

	/**
	 * @since 11.0
	 */
	readonly providesUserInterface: boolean;

	readonly renderBlock: (p1: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<AudioBufferList>, p6: (p1: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<AudioBufferList>) => number) => number;

	/**
	 * @since 14.0
	 */
	readonly renderContextObserver: (p1: interop.Pointer | interop.Reference<AudioUnitRenderContext>) => void;

	renderQuality: number;

	readonly renderResourcesAllocated: boolean;

	renderingOffline: boolean;

	/**
	 * @since 11.0
	 */
	readonly running: boolean;

	readonly scheduleMIDIEventBlock: (p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>) => void;

	/**
	 * @since 15.0
	 */
	readonly scheduleMIDIEventListBlock: (p1: number, p2: number, p3: interop.Pointer | interop.Reference<MIDIEventList>) => number;

	readonly scheduleParameterBlock: (p1: number, p2: number, p3: number, p4: number) => void;

	shouldBypassEffect: boolean;

	/**
	 * @since 10.0
	 */
	readonly supportsMPE: boolean;

	/**
	 * @since 13.0
	 */
	readonly supportsUserPresets: boolean;

	readonly tailTime: number;

	transportStateBlock: (p1: interop.Pointer | interop.Reference<AUHostTransportStateFlags>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => boolean;

	/**
	 * @since 13.0
	 */
	readonly userPresets: NSArray<AUAudioUnitPreset>;

	readonly virtualMIDICableCount: number;

	constructor(o: { componentDescription: AudioComponentDescription; });

	constructor(o: { componentDescription: AudioComponentDescription; options: AudioComponentInstantiationOptions; });

	allocateRenderResourcesAndReturnError(): boolean;

	deallocateRenderResources(): void;

	/**
	 * @since 13.0
	 */
	deleteUserPresetError(userPreset: AUAudioUnitPreset): boolean;

	/**
	 * @since 12.0
	 */
	disableProfileCableOnChannelError(profile: MIDICIProfile, cable: number, channel: number): boolean;

	/**
	 * @since 12.0
	 */
	enableProfileCableOnChannelError(profile: MIDICIProfile, cable: number, channel: number): boolean;

	initWithComponentDescriptionError(componentDescription: AudioComponentDescription): this;

	initWithComponentDescriptionOptionsError(componentDescription: AudioComponentDescription, options: AudioComponentInstantiationOptions): this;

	/**
	 * @since 16.0
	 */
	messageChannelFor(channelName: string): AUMessageChannel;

	parametersForOverviewWithCount(count: number): NSArray<number>;

	/**
	 * @since 13.0
	 */
	presetStateForError(userPreset: AUAudioUnitPreset): NSDictionary<string, any>;

	/**
	 * @since 12.0
	 */
	profileStateForCableChannel(cable: number, channel: number): MIDICIProfileState;

	removeRenderObserver(token: number): void;

	requestViewControllerWithCompletionHandler(completionHandler: (p1: UIViewController) => void): void;

	reset(): void;

	/**
	 * @since 13.0
	 */
	saveUserPresetError(userPreset: AUAudioUnitPreset): boolean;

	/**
	 * @since 11.0
	 */
	selectViewConfiguration(viewConfiguration: AUAudioUnitViewConfiguration): void;

	setRenderResourcesAllocated(flag: boolean): void;

	shouldChangeToFormatForBus(format: AVAudioFormat, bus: AUAudioUnitBus): boolean;

	startHardwareAndReturnError(): boolean;

	stopHardware(): void;

	/**
	 * @since 11.0
	 */
	supportedViewConfigurations(availableViewConfigurations: NSArray<AUAudioUnitViewConfiguration> | AUAudioUnitViewConfiguration[]): NSIndexSet;

	tokenByAddingRenderObserver(observer: (p1: AudioUnitRenderActionFlags, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: number) => void): number;
}

/**
 * @since 9.0
 */
declare class AUAudioUnitBus extends NSObject {

	static alloc(): AUAudioUnitBus; // inherited from NSObject

	static new(): AUAudioUnitBus; // inherited from NSObject

	readonly busType: AUAudioUnitBusType;

	contextPresentationLatency: number;

	enabled: boolean;

	readonly format: AVAudioFormat;

	readonly index: number;

	maximumChannelCount: number;

	name: string;

	readonly ownerAudioUnit: AUAudioUnit;

	/**
	 * @since 11.0
	 */
	shouldAllocateBuffer: boolean;

	supportedChannelCounts: NSArray<number>;

	readonly supportedChannelLayoutTags: NSArray<number>;

	constructor(o: { format: AVAudioFormat; });

	initWithFormatError(format: AVAudioFormat): this;

	setFormatError(format: AVAudioFormat): boolean;
}

/**
 * @since 9.0
 */
declare class AUAudioUnitBusArray extends NSObject implements NSFastEnumeration {

	static alloc(): AUAudioUnitBusArray; // inherited from NSObject

	static new(): AUAudioUnitBusArray; // inherited from NSObject

	readonly busType: AUAudioUnitBusType;

	readonly count: number;

	readonly countChangeable: boolean;

	readonly ownerAudioUnit: AUAudioUnit;
	[index: number]: AUAudioUnitBus;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { audioUnit: AUAudioUnit; busType: AUAudioUnitBusType; });

	constructor(o: { audioUnit: AUAudioUnit; busType: AUAudioUnitBusType; busses: NSArray<AUAudioUnitBus> | AUAudioUnitBus[]; });

	addObserverToAllBussesForKeyPathOptionsContext(observer: NSObject, keyPath: string, options: NSKeyValueObservingOptions, context: interop.Pointer | interop.Reference<any>): void;

	initWithAudioUnitBusType(owner: AUAudioUnit, busType: AUAudioUnitBusType): this;

	initWithAudioUnitBusTypeBusses(owner: AUAudioUnit, busType: AUAudioUnitBusType, busArray: NSArray<AUAudioUnitBus> | AUAudioUnitBus[]): this;

	objectAtIndexedSubscript(index: number): AUAudioUnitBus;

	removeObserverFromAllBussesForKeyPathContext(observer: NSObject, keyPath: string, context: interop.Pointer | interop.Reference<any>): void;

	replaceBusses(busArray: NSArray<AUAudioUnitBus> | AUAudioUnitBus[]): void;

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

/**
 * @since 9.0
 */
declare class AUAudioUnitPreset extends NSObject implements NSSecureCoding {

	static alloc(): AUAudioUnitPreset; // inherited from NSObject

	static new(): AUAudioUnitPreset; // inherited from NSObject

	name: string;

	number: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare class AUAudioUnitV2Bridge extends AUAudioUnit {

	static alloc(): AUAudioUnitV2Bridge; // inherited from NSObject

	static new(): AUAudioUnitV2Bridge; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly audioUnit: interop.Pointer | interop.Reference<any>;
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

declare const AUEventSampleTimeImmediate: number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphAddNode(inGraph: interop.Pointer | interop.Reference<any>, inDescription: interop.Pointer | interop.Reference<AudioComponentDescription>, outNode: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphAddRenderNotify(inGraph: interop.Pointer | interop.Reference<any>, inCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<AudioBufferList>) => number>, inRefCon: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphClearConnections(inGraph: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphClose(inGraph: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphConnectNodeInput(inGraph: interop.Pointer | interop.Reference<any>, inSourceNode: number, inSourceOutputNumber: number, inDestNode: number, inDestInputNumber: number): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphCountNodeInteractions(inGraph: interop.Pointer | interop.Reference<any>, inNode: number, outNumInteractions: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphDisconnectNodeInput(inGraph: interop.Pointer | interop.Reference<any>, inDestNode: number, inDestInputNumber: number): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphGetCPULoad(inGraph: interop.Pointer | interop.Reference<any>, outAverageCPULoad: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphGetIndNode(inGraph: interop.Pointer | interop.Reference<any>, inIndex: number, outNode: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphGetMaxCPULoad(inGraph: interop.Pointer | interop.Reference<any>, outMaxLoad: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphGetNodeCount(inGraph: interop.Pointer | interop.Reference<any>, outNumberOfNodes: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphGetNumberOfInteractions(inGraph: interop.Pointer | interop.Reference<any>, outNumInteractions: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphInitialize(inGraph: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphIsInitialized(inGraph: interop.Pointer | interop.Reference<any>, outIsInitialized: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphIsOpen(inGraph: interop.Pointer | interop.Reference<any>, outIsOpen: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphIsRunning(inGraph: interop.Pointer | interop.Reference<any>, outIsRunning: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphNodeInfo(inGraph: interop.Pointer | interop.Reference<any>, inNode: number, outDescription: interop.Pointer | interop.Reference<AudioComponentDescription>, outAudioUnit: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphOpen(inGraph: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphRemoveNode(inGraph: interop.Pointer | interop.Reference<any>, inNode: number): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphRemoveRenderNotify(inGraph: interop.Pointer | interop.Reference<any>, inCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<AudioBufferList>) => number>, inRefCon: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphSetNodeInputCallback(inGraph: interop.Pointer | interop.Reference<any>, inDestNode: number, inDestInputNumber: number, inInputCallback: interop.Pointer | interop.Reference<AURenderCallbackStruct>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphStart(inGraph: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphStop(inGraph: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphUninitialize(inGraph: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function AUGraphUpdate(inGraph: interop.Pointer | interop.Reference<any>, outIsUpdated: string | interop.Pointer | interop.Reference<any>): number;

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

/**
 * @since 6.0
 */
declare function AUListenerAddParameter(inListener: interop.Pointer | interop.Reference<any>, inObject: interop.Pointer | interop.Reference<any>, inParameter: interop.Pointer | interop.Reference<AudioUnitParameter>): number;

/**
 * @since 6.0
 */
declare function AUListenerCreate(inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<AudioUnitParameter>, p4: number) => void>, inUserData: interop.Pointer | interop.Reference<any>, inRunLoop: any, inRunLoopMode: string, inNotificationInterval: number, outListener: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 6.0
 */
declare function AUListenerCreateWithDispatchQueue(outListener: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, inNotificationInterval: number, inDispatchQueue: NSObject & OS_dispatch_queue, inBlock: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioUnitParameter>, p3: number) => void): number;

/**
 * @since 6.0
 */
declare function AUListenerDispose(inListener: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 6.0
 */
declare function AUListenerRemoveParameter(inListener: interop.Pointer | interop.Reference<any>, inObject: interop.Pointer | interop.Reference<any>, inParameter: interop.Pointer | interop.Reference<AudioUnitParameter>): number;

interface AUMIDIOutputCallbackStruct {
	midiOutputCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: interop.Pointer | interop.Reference<MIDIPacketList>) => number>;
	userData: interop.Pointer | interop.Reference<any>;
}
declare var AUMIDIOutputCallbackStruct: interop.StructType<AUMIDIOutputCallbackStruct>;

/**
 * @since 16.0
 */
interface AUMessageChannel {

	callHostBlock?: (p1: NSDictionary<any, any>) => NSDictionary<any, any>;

	callAudioUnit?(message: NSDictionary<any, any>): NSDictionary<any, any>;
}
declare var AUMessageChannel: {

	prototype: AUMessageChannel;
};

interface AUNodeRenderCallback {
	destNode: number;
	destInputNumber: number;
	cback: AURenderCallbackStruct;
}
declare var AUNodeRenderCallback: interop.StructType<AUNodeRenderCallback>;

/**
 * @since 9.0
 */
declare class AUParameter extends AUParameterNode implements NSSecureCoding {

	static alloc(): AUParameter; // inherited from NSObject

	static new(): AUParameter; // inherited from NSObject

	readonly address: number;

	readonly dependentParameters: NSArray<number>;

	readonly flags: AudioUnitParameterOptions;

	readonly maxValue: number;

	readonly minValue: number;

	readonly unit: AudioUnitParameterUnit;

	readonly unitName: string;

	value: number;

	readonly valueStrings: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	setValueOriginator(value: number, originator: interop.Pointer | interop.Reference<any>): void;

	setValueOriginatorAtHostTime(value: number, originator: interop.Pointer | interop.Reference<any>, hostTime: number): void;

	/**
	 * @since 10.0
	 */
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

/**
 * @since 6.0
 */
declare function AUParameterFormatValue(inParameterValue: number, inParameter: interop.Pointer | interop.Reference<AudioUnitParameter>, inTextBuffer: string | interop.Pointer | interop.Reference<any>, inDigits: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 9.0
 */
declare class AUParameterGroup extends AUParameterNode implements NSSecureCoding {

	static alloc(): AUParameterGroup; // inherited from NSObject

	static new(): AUParameterGroup; // inherited from NSObject

	readonly allParameters: NSArray<AUParameter>;

	readonly children: NSArray<AUParameterNode>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 6.0
 */
declare function AUParameterListenerNotify(inSendingListener: interop.Pointer | interop.Reference<any>, inSendingObject: interop.Pointer | interop.Reference<any>, inParameter: interop.Pointer | interop.Reference<AudioUnitParameter>): number;

/**
 * @since 9.0
 */
declare class AUParameterNode extends NSObject {

	static alloc(): AUParameterNode; // inherited from NSObject

	static new(): AUParameterNode; // inherited from NSObject

	readonly displayName: string;

	readonly identifier: string;

	implementorDisplayNameWithLengthCallback: (p1: AUParameterNode, p2: number) => string;

	implementorStringFromValueCallback: (p1: AUParameter, p2: interop.Pointer | interop.Reference<number>) => string;

	implementorValueFromStringCallback: (p1: AUParameter, p2: string) => number;

	implementorValueObserver: (p1: AUParameter, p2: number) => void;

	implementorValueProvider: (p1: AUParameter) => number;

	readonly keyPath: string;

	displayNameWithLength(maximumLength: number): string;

	removeParameterObserver(token: interop.Pointer | interop.Reference<any>): void;

	/**
	 * @since 10.0
	 */
	tokenByAddingParameterAutomationObserver(observer: (p1: number, p2: interop.Pointer | interop.Reference<AUParameterAutomationEvent>) => void): interop.Pointer | interop.Reference<any>;

	tokenByAddingParameterObserver(observer: (p1: number, p2: number) => void): interop.Pointer | interop.Reference<any>;

	tokenByAddingParameterRecordingObserver(observer: (p1: number, p2: interop.Pointer | interop.Reference<AURecordedParameterEvent>) => void): interop.Pointer | interop.Reference<any>;
}

/**
 * @since 6.0
 */
declare function AUParameterSet(inSendingListener: interop.Pointer | interop.Reference<any>, inSendingObject: interop.Pointer | interop.Reference<any>, inParameter: interop.Pointer | interop.Reference<AudioUnitParameter>, inValue: number, inBufferOffsetInFrames: number): number;

/**
 * @since 9.0
 */
declare class AUParameterTree extends AUParameterGroup implements NSSecureCoding {

	static alloc(): AUParameterTree; // inherited from NSObject

	static createGroupFromTemplateIdentifierNameAddressOffset(templateGroup: AUParameterGroup, identifier: string, name: string, addressOffset: number): AUParameterGroup;

	static createGroupTemplate(children: NSArray<AUParameterNode> | AUParameterNode[]): AUParameterGroup;

	static createGroupWithIdentifierNameChildren(identifier: string, name: string, children: NSArray<AUParameterNode> | AUParameterNode[]): AUParameterGroup;

	static createParameterWithIdentifierNameAddressMinMaxUnitUnitNameFlagsValueStringsDependentParameters(identifier: string, name: string, address: number, min: number, max: number, unit: AudioUnitParameterUnit, unitName: string, flags: AudioUnitParameterOptions, valueStrings: NSArray<string> | string[], dependentParameters: NSArray<number> | number[]): AUParameter;

	static createTreeWithChildren(children: NSArray<AUParameterNode> | AUParameterNode[]): AUParameterTree;

	static new(): AUParameterTree; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	parameterWithAddress(address: number): AUParameter;

	parameterWithIDScopeElement(paramID: number, scope: number, element: number): AUParameter;
}

/**
 * @since 6.0
 */
declare function AUParameterValueFromLinear(inLinearValue: number, inParameter: interop.Pointer | interop.Reference<AudioUnitParameter>): number;

/**
 * @since 6.0
 */
declare function AUParameterValueToLinear(inParameterValue: number, inParameter: interop.Pointer | interop.Reference<AudioUnitParameter>): number;

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

	MIDISysEx = 9,

	MIDIEventList = 10
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

declare const enum AUSpatialMixerOutputType {

	kSpatialMixerOutputType_Headphones = 1,

	kSpatialMixerOutputType_BuiltInSpeakers = 2,

	kSpatialMixerOutputType_ExternalSpeakers = 3
}

declare const enum AUSpatialMixerPersonalizedHRTFMode {

	kSpatialMixerPersonalizedHRTFMode_Off = 0,

	kSpatialMixerPersonalizedHRTFMode_On = 1,

	kSpatialMixerPersonalizedHRTFMode_Auto = 2
}

declare const enum AUSpatialMixerPointSourceInHeadMode {

	kSpatialMixerPointSourceInHeadMode_Mono = 0,

	kSpatialMixerPointSourceInHeadMode_Bypass = 1
}

declare const enum AUSpatialMixerRenderingFlags {

	kSpatialMixerRenderingFlags_InterAuralDelay = 1,

	kSpatialMixerRenderingFlags_DistanceAttenuation = 4
}

declare const enum AUSpatialMixerSourceMode {

	kSpatialMixerSourceMode_SpatializeIfMono = 0,

	kSpatialMixerSourceMode_Bypass = 1,

	kSpatialMixerSourceMode_PointSource = 2,

	kSpatialMixerSourceMode_AmbienceBed = 3
}

declare const enum AUSpatializationAlgorithm {

	kSpatializationAlgorithm_EqualPowerPanning = 0,

	kSpatializationAlgorithm_SphericalHead = 1,

	kSpatializationAlgorithm_HRTF = 2,

	kSpatializationAlgorithm_SoundField = 3,

	kSpatializationAlgorithm_VectorBasedPanning = 4,

	kSpatializationAlgorithm_StereoPassThrough = 5,

	kSpatializationAlgorithm_HRTFHQ = 6,

	kSpatializationAlgorithm_UseOutputType = 7
}

interface AUVoiceIOOtherAudioDuckingConfiguration {
	mEnableAdvancedDucking: boolean;
	mDuckingLevel: AUVoiceIOOtherAudioDuckingLevel;
}
declare var AUVoiceIOOtherAudioDuckingConfiguration: interop.StructType<AUVoiceIOOtherAudioDuckingConfiguration>;

declare const enum AUVoiceIOOtherAudioDuckingLevel {

	kAUVoiceIOOtherAudioDuckingLevelDefault = 0,

	kAUVoiceIOOtherAudioDuckingLevelMin = 10,

	kAUVoiceIOOtherAudioDuckingLevelMid = 20,

	kAUVoiceIOOtherAudioDuckingLevelMax = 30
}

declare const enum AUVoiceIOSpeechActivityEvent {

	kAUVoiceIOSpeechActivityHasStarted = 0,

	kAUVoiceIOSpeechActivityHasEnded = 1
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

/**
 * @since 4.0
 */
declare function AudioCodecAppendInputBufferList(inCodec: interop.Pointer | interop.Reference<any>, inBufferList: interop.Pointer | interop.Reference<AudioBufferList>, ioNumberPackets: interop.Pointer | interop.Reference<number>, inPacketDescription: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, outBytesConsumed: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioCodecAppendInputData(inCodec: interop.Pointer | interop.Reference<any>, inInputData: interop.Pointer | interop.Reference<any>, ioInputDataByteSize: interop.Pointer | interop.Reference<number>, ioNumberPackets: interop.Pointer | interop.Reference<number>, inPacketDescription: interop.Pointer | interop.Reference<AudioStreamPacketDescription>): number;

/**
 * @since 2.0
 */
declare function AudioCodecGetProperty(inCodec: interop.Pointer | interop.Reference<any>, inPropertyID: number, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioCodecGetPropertyInfo(inCodec: interop.Pointer | interop.Reference<any>, inPropertyID: number, outSize: interop.Pointer | interop.Reference<number>, outWritable: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioCodecInitialize(inCodec: interop.Pointer | interop.Reference<any>, inInputFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inOutputFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inMagicCookie: interop.Pointer | interop.Reference<any>, inMagicCookieByteSize: number): number;

interface AudioCodecMagicCookieInfo {
	mMagicCookieSize: number;
	mMagicCookie: interop.Pointer | interop.Reference<any>;
}
declare var AudioCodecMagicCookieInfo: interop.StructType<AudioCodecMagicCookieInfo>;

interface AudioCodecPrimeInfo {
	leadingFrames: number;
	trailingFrames: number;
}
declare var AudioCodecPrimeInfo: interop.StructType<AudioCodecPrimeInfo>;

/**
 * @since 4.0
 */
declare function AudioCodecProduceOutputBufferList(inCodec: interop.Pointer | interop.Reference<any>, ioBufferList: interop.Pointer | interop.Reference<AudioBufferList>, ioNumberPackets: interop.Pointer | interop.Reference<number>, outPacketDescription: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, outStatus: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioCodecProduceOutputPackets(inCodec: interop.Pointer | interop.Reference<any>, outOutputData: interop.Pointer | interop.Reference<any>, ioOutputDataByteSize: interop.Pointer | interop.Reference<number>, ioNumberPackets: interop.Pointer | interop.Reference<number>, outPacketDescription: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, outStatus: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioCodecReset(inCodec: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioCodecSetProperty(inCodec: interop.Pointer | interop.Reference<any>, inPropertyID: number, inPropertyDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioCodecUninitialize(inCodec: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 16.0
 */
declare function AudioComponentCopyConfigurationInfo(inComponent: interop.Pointer | interop.Reference<any>, outConfigurationInfo: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

/**
 * @since 14.0
 */
declare function AudioComponentCopyIcon(comp: interop.Pointer | interop.Reference<any>): UIImage;

/**
 * @since 2.0
 */
declare function AudioComponentCopyName(inComponent: interop.Pointer | interop.Reference<any>, outName: interop.Pointer | interop.Reference<string>): number;

/**
 * @since 2.0
 */
declare function AudioComponentCount(inDesc: interop.Pointer | interop.Reference<AudioComponentDescription>): number;

interface AudioComponentDescription {
	componentType: number;
	componentSubType: number;
	componentManufacturer: number;
	componentFlags: number;
	componentFlagsMask: number;
}
declare var AudioComponentDescription: interop.StructType<AudioComponentDescription>;

/**
 * @since 2.0
 */
declare function AudioComponentFindNext(inComponent: interop.Pointer | interop.Reference<any>, inDesc: interop.Pointer | interop.Reference<AudioComponentDescription>): interop.Pointer | interop.Reference<any>;

declare const enum AudioComponentFlags {

	kAudioComponentFlag_Unsearchable = 1,

	kAudioComponentFlag_SandboxSafe = 2,

	kAudioComponentFlag_IsV3AudioUnit = 4,

	kAudioComponentFlag_RequiresAsyncInstantiation = 8,

	kAudioComponentFlag_CanLoadInProcess = 16
}

/**
 * @since 2.0
 */
declare function AudioComponentGetDescription(inComponent: interop.Pointer | interop.Reference<any>, outDesc: interop.Pointer | interop.Reference<AudioComponentDescription>): number;

/**
 * @since 7.0
 * @deprecated 14.0
 */
declare function AudioComponentGetIcon(comp: interop.Pointer | interop.Reference<any>, desiredPointSize: number): UIImage;

/**
 * @since 7.0
 * @deprecated 13.0
 */
declare function AudioComponentGetLastActiveTime(comp: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioComponentGetVersion(inComponent: interop.Pointer | interop.Reference<any>, outVersion: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 3.0
 */
declare function AudioComponentInstanceCanDo(inInstance: interop.Pointer | interop.Reference<any>, inSelectorID: number): boolean;

/**
 * @since 2.0
 */
declare function AudioComponentInstanceDispose(inInstance: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioComponentInstanceGetComponent(inInstance: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare function AudioComponentInstanceNew(inComponent: interop.Pointer | interop.Reference<any>, outInstance: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 9.0
 */
declare function AudioComponentInstantiate(inComponent: interop.Pointer | interop.Reference<any>, inOptions: AudioComponentInstantiationOptions, inCompletionHandler: (p1: interop.Pointer | interop.Reference<any>, p2: number) => void): void;

declare const enum AudioComponentInstantiationOptions {

	kAudioComponentInstantiation_LoadOutOfProcess = 1,

	kAudioComponentInstantiation_LoadInProcess = 2,

	kAudioComponentInstantiation_LoadedRemotely = 2147483648
}

interface AudioComponentPlugInInterface {
	Open: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>;
	Close: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	Lookup: interop.FunctionReference<(p1: number) => interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>>;
	reserved: interop.Pointer | interop.Reference<any>;
}
declare var AudioComponentPlugInInterface: interop.StructType<AudioComponentPlugInInterface>;

/**
 * @since 5.0
 */
declare function AudioComponentRegister(inDesc: interop.Pointer | interop.Reference<AudioComponentDescription>, inName: string, inVersion: number, inFactory: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<AudioComponentDescription>) => interop.Pointer | interop.Reference<AudioComponentPlugInInterface>>): interop.Pointer | interop.Reference<any>;

/**
 * @since 16.0
 */
declare function AudioComponentValidate(inComponent: interop.Pointer | interop.Reference<any>, inValidationParameters: NSDictionary<any, any>, outValidationResult: interop.Pointer | interop.Reference<AudioComponentValidationResult>): number;

/**
 * @since 16.0
 */
declare function AudioComponentValidateWithResults(inComponent: interop.Pointer | interop.Reference<any>, inValidationParameters: NSDictionary<any, any>, inCompletionHandler: (p1: AudioComponentValidationResult, p2: NSDictionary<any, any>) => void): number;

declare const enum AudioComponentValidationResult {

	kAudioComponentValidationResult_Unknown = 0,

	kAudioComponentValidationResult_Passed = 1,

	kAudioComponentValidationResult_Failed = 2,

	kAudioComponentValidationResult_TimedOut = 3,

	kAudioComponentValidationResult_UnauthorizedError_Open = 4,

	kAudioComponentValidationResult_UnauthorizedError_Init = 5
}

/**
 * @since 2.0
 */
declare function AudioConverterConvertBuffer(inAudioConverter: interop.Pointer | interop.Reference<any>, inInputDataSize: number, inInputData: interop.Pointer | interop.Reference<any>, ioOutputDataSize: interop.Pointer | interop.Reference<number>, outOutputData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function AudioConverterConvertComplexBuffer(inAudioConverter: interop.Pointer | interop.Reference<any>, inNumberPCMFrames: number, inInputData: interop.Pointer | interop.Reference<AudioBufferList>, outOutputData: interop.Pointer | interop.Reference<AudioBufferList>): number;

/**
 * @since 2.0
 */
declare function AudioConverterDispose(inAudioConverter: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioConverterFillComplexBuffer(inAudioConverter: interop.Pointer | interop.Reference<any>, inInputDataProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<AudioBufferList>, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<AudioStreamPacketDescription>>, p5: interop.Pointer | interop.Reference<any>) => number>, inInputDataProcUserData: interop.Pointer | interop.Reference<any>, ioOutputDataPacketSize: interop.Pointer | interop.Reference<number>, outOutputData: interop.Pointer | interop.Reference<AudioBufferList>, outPacketDescription: interop.Pointer | interop.Reference<AudioStreamPacketDescription>): number;

/**
 * @since 2.0
 */
declare function AudioConverterGetProperty(inAudioConverter: interop.Pointer | interop.Reference<any>, inPropertyID: number, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioConverterGetPropertyInfo(inAudioConverter: interop.Pointer | interop.Reference<any>, inPropertyID: number, outSize: interop.Pointer | interop.Reference<number>, outWritable: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioConverterNew(inSourceFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inDestinationFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, outAudioConverter: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.0
 */
declare function AudioConverterNewSpecific(inSourceFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inDestinationFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inNumberClassDescriptions: number, inClassDescriptions: interop.Pointer | interop.Reference<AudioClassDescription>, outAudioConverter: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 18.0
 */
declare function AudioConverterNewWithOptions(inSourceFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inDestinationFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inOptions: AudioConverterOptions, outAudioConverter: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare const enum AudioConverterOptions {

	kAudioConverterOption_Unbuffered = 65536
}

/**
 * @since 18.0
 */
declare function AudioConverterPrepare(inFlags: number, ioReserved: interop.Pointer | interop.Reference<any>, inCompletionBlock: (p1: number) => void): void;

interface AudioConverterPrimeInfo {
	leadingFrames: number;
	trailingFrames: number;
}
declare var AudioConverterPrimeInfo: interop.StructType<AudioConverterPrimeInfo>;

/**
 * @since 2.0
 */
declare function AudioConverterReset(inAudioConverter: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioConverterSetProperty(inAudioConverter: interop.Pointer | interop.Reference<any>, inPropertyID: number, inPropertyDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileClose(inAudioFile: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileCountUserData(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, outNumberItems: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioFileCreateWithURL(inFileRef: NSURL, inFileType: number, inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inFlags: AudioFileFlags, outAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare const enum AudioFileFlags {

	kAudioFileFlags_EraseFile = 1,

	kAudioFileFlags_DontPageAlignAudioData = 2
}

/**
 * @since 2.0
 */
declare function AudioFileGetGlobalInfo(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, ioDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileGetGlobalInfoSize(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, outDataSize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioFileGetProperty(inAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, ioDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileGetPropertyInfo(inAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, outDataSize: interop.Pointer | interop.Reference<number>, isWritable: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioFileGetUserData(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, inIndex: number, ioUserDataSize: interop.Pointer | interop.Reference<number>, outUserData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function AudioFileGetUserDataAtOffset(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, inIndex: number, inOffset: number, ioUserDataSize: interop.Pointer | interop.Reference<number>, outUserData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileGetUserDataSize(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, inIndex: number, outUserDataSize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 17.0
 */
declare function AudioFileGetUserDataSize64(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, inIndex: number, outUserDataSize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
declare function AudioFileOpenURL(inFileRef: NSURL, inPermissions: AudioFilePermissions, inFileTypeHint: number, outAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.0
 */
declare function AudioFileOpenWithCallbacks(inClientData: interop.Pointer | interop.Reference<any>, inReadFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<number>) => number>, inWriteFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<number>) => number>, inGetSizeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, inSetSizeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>, inFileTypeHint: number, outAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
declare function AudioFileReadBytes(inAudioFile: interop.Pointer | interop.Reference<any>, inUseCache: boolean, inStartingByte: number, ioNumBytes: interop.Pointer | interop.Reference<number>, outBuffer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.2
 */
declare function AudioFileReadPacketData(inAudioFile: interop.Pointer | interop.Reference<any>, inUseCache: boolean, ioNumBytes: interop.Pointer | interop.Reference<number>, outPacketDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, inStartingPacket: number, ioNumPackets: interop.Pointer | interop.Reference<number>, outBuffer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 8.0
 */
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

/**
 * @since 2.0
 */
declare function AudioFileRemoveUserData(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, inIndex: number): number;

/**
 * @since 2.0
 */
declare function AudioFileSetProperty(inAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, inDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileSetUserData(inAudioFile: interop.Pointer | interop.Reference<any>, inUserDataID: number, inIndex: number, inUserDataSize: number, inUserData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileStreamClose(inAudioFileStream: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileStreamGetProperty(inAudioFileStream: interop.Pointer | interop.Reference<any>, inPropertyID: number, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileStreamGetPropertyInfo(inAudioFileStream: interop.Pointer | interop.Reference<any>, inPropertyID: number, outPropertyDataSize: interop.Pointer | interop.Reference<number>, outWritable: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileStreamOpen(inClientData: interop.Pointer | interop.Reference<any>, inPropertyListenerProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<AudioFileStreamPropertyFlags>) => void>, inPacketsProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<AudioStreamPacketDescription>) => void>, inFileTypeHint: number, outAudioFileStream: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.0
 */
declare function AudioFileStreamParseBytes(inAudioFileStream: interop.Pointer | interop.Reference<any>, inDataByteSize: number, inData: interop.Pointer | interop.Reference<any>, inFlags: AudioFileStreamParseFlags): number;

declare const enum AudioFileStreamParseFlags {

	kAudioFileStreamParseFlag_Discontinuity = 1
}

declare const enum AudioFileStreamPropertyFlags {

	kAudioFileStreamPropertyFlag_PropertyIsCached = 1,

	kAudioFileStreamPropertyFlag_CacheProperty = 2
}

/**
 * @since 2.0
 */
declare function AudioFileStreamSeek(inAudioFileStream: interop.Pointer | interop.Reference<any>, inPacketOffset: number, outDataByteOffset: interop.Pointer | interop.Reference<number>, ioFlags: interop.Pointer | interop.Reference<AudioFileStreamSeekFlags>): number;

declare const enum AudioFileStreamSeekFlags {

	kAudioFileStreamSeekFlag_OffsetIsEstimated = 1
}

/**
 * @since 2.0
 */
declare function AudioFileStreamSetProperty(inAudioFileStream: interop.Pointer | interop.Reference<any>, inPropertyID: number, inPropertyDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

interface AudioFileTypeAndFormatID {
	mFileType: number;
	mFormatID: number;
}
declare var AudioFileTypeAndFormatID: interop.StructType<AudioFileTypeAndFormatID>;

/**
 * @since 2.0
 */
declare function AudioFileWriteBytes(inAudioFile: interop.Pointer | interop.Reference<any>, inUseCache: boolean, inStartingByte: number, ioNumBytes: interop.Pointer | interop.Reference<number>, inBuffer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFileWritePackets(inAudioFile: interop.Pointer | interop.Reference<any>, inUseCache: boolean, inNumBytes: number, inPacketDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, inStartingPacket: number, ioNumPackets: interop.Pointer | interop.Reference<number>, inBuffer: interop.Pointer | interop.Reference<any>): number;

interface AudioFile_SMPTE_Time {
	mHours: number;
	mMinutes: number;
	mSeconds: number;
	mFrames: number;
	mSubFrameSampleOffset: number;
}
declare var AudioFile_SMPTE_Time: interop.StructType<AudioFile_SMPTE_Time>;

/**
 * @since 2.0
 */
declare function AudioFormatGetProperty(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioFormatGetPropertyInfo(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, outPropertyDataSize: interop.Pointer | interop.Reference<number>): number;

interface AudioFormatInfo {
	mASBD: AudioStreamBasicDescription;
	mMagicCookie: interop.Pointer | interop.Reference<any>;
	mMagicCookieSize: number;
}
declare var AudioFormatInfo: interop.StructType<AudioFormatInfo>;

interface AudioFramePacketTranslation {
	mFrame: number;
	mPacket: number;
	mFrameOffsetInPacket: number;
}
declare var AudioFramePacketTranslation: interop.StructType<AudioFramePacketTranslation>;

interface AudioIndependentPacketTranslation {
	mPacket: number;
	mIndependentlyDecodablePacket: number;
}
declare var AudioIndependentPacketTranslation: interop.StructType<AudioIndependentPacketTranslation>;

/**
 * @since 7.0
 * @deprecated 13.0
 */
declare function AudioOutputUnitGetHostIcon(au: interop.Pointer | interop.Reference<any>, desiredPointSize: number): UIImage;

interface AudioOutputUnitMIDICallbacks {
	userData: interop.Pointer | interop.Reference<any>;
	MIDIEventProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: number) => void>;
	MIDISysExProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>;
}
declare var AudioOutputUnitMIDICallbacks: interop.StructType<AudioOutputUnitMIDICallbacks>;

/**
 * @since 7.0
 * @deprecated 13.0
 */
declare function AudioOutputUnitPublish(inDesc: interop.Pointer | interop.Reference<AudioComponentDescription>, inName: string, inVersion: number, inOutputUnit: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioOutputUnitStart(ci: interop.Pointer | interop.Reference<any>): number;

interface AudioOutputUnitStartAtTimeParams {
	mTimestamp: AudioTimeStamp;
	mFlags: number;
}
declare var AudioOutputUnitStartAtTimeParams: interop.StructType<AudioOutputUnitStartAtTimeParams>;

/**
 * @since 2.0
 */
declare function AudioOutputUnitStop(ci: interop.Pointer | interop.Reference<any>): number;

interface AudioPacketDependencyInfoTranslation {
	mPacket: number;
	mIsIndependentlyDecodable: number;
	mNumberPrerollPackets: number;
}
declare var AudioPacketDependencyInfoTranslation: interop.StructType<AudioPacketDependencyInfoTranslation>;

interface AudioPacketRangeByteCountTranslation {
	mPacket: number;
	mPacketCount: number;
	mByteCountUpperBound: number;
}
declare var AudioPacketRangeByteCountTranslation: interop.StructType<AudioPacketRangeByteCountTranslation>;

interface AudioPacketRollDistanceTranslation {
	mPacket: number;
	mRollDistance: number;
}
declare var AudioPacketRollDistanceTranslation: interop.StructType<AudioPacketRollDistanceTranslation>;

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

/**
 * @since 2.0
 */
declare function AudioQueueAddPropertyListener(inAQ: interop.Pointer | interop.Reference<any>, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>, inUserData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioQueueAllocateBuffer(inAQ: interop.Pointer | interop.Reference<any>, inBufferByteSize: number, outBuffer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<AudioQueueBuffer>>): number;

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
declare function AudioQueueCreateTimeline(inAQ: interop.Pointer | interop.Reference<any>, outTimeline: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.0
 */
declare function AudioQueueDeviceGetCurrentTime(inAQ: interop.Pointer | interop.Reference<any>, outTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>): number;

/**
 * @since 2.0
 */
declare function AudioQueueDeviceGetNearestStartTime(inAQ: interop.Pointer | interop.Reference<any>, ioRequestedStartTime: interop.Pointer | interop.Reference<AudioTimeStamp>, inFlags: number): number;

/**
 * @since 2.0
 */
declare function AudioQueueDeviceTranslateTime(inAQ: interop.Pointer | interop.Reference<any>, inTime: interop.Pointer | interop.Reference<AudioTimeStamp>, outTime: interop.Pointer | interop.Reference<AudioTimeStamp>): number;

/**
 * @since 2.0
 */
declare function AudioQueueDispose(inAQ: interop.Pointer | interop.Reference<any>, inImmediate: boolean): number;

/**
 * @since 2.0
 */
declare function AudioQueueDisposeTimeline(inAQ: interop.Pointer | interop.Reference<any>, inTimeline: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioQueueEnqueueBuffer(inAQ: interop.Pointer | interop.Reference<any>, inBuffer: interop.Pointer | interop.Reference<AudioQueueBuffer>, inNumPacketDescs: number, inPacketDescs: interop.Pointer | interop.Reference<AudioStreamPacketDescription>): number;

/**
 * @since 2.0
 */
declare function AudioQueueEnqueueBufferWithParameters(inAQ: interop.Pointer | interop.Reference<any>, inBuffer: interop.Pointer | interop.Reference<AudioQueueBuffer>, inNumPacketDescs: number, inPacketDescs: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, inTrimFramesAtStart: number, inTrimFramesAtEnd: number, inNumParamValues: number, inParamValues: interop.Pointer | interop.Reference<AudioQueueParameterEvent>, inStartTime: interop.Pointer | interop.Reference<AudioTimeStamp>, outActualStartTime: interop.Pointer | interop.Reference<AudioTimeStamp>): number;

/**
 * @since 2.0
 */
declare function AudioQueueFlush(inAQ: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioQueueFreeBuffer(inAQ: interop.Pointer | interop.Reference<any>, inBuffer: interop.Pointer | interop.Reference<AudioQueueBuffer>): number;

/**
 * @since 2.0
 */
declare function AudioQueueGetCurrentTime(inAQ: interop.Pointer | interop.Reference<any>, inTimeline: interop.Pointer | interop.Reference<any>, outTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>, outTimelineDiscontinuity: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioQueueGetParameter(inAQ: interop.Pointer | interop.Reference<any>, inParamID: number, outValue: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioQueueGetProperty(inAQ: interop.Pointer | interop.Reference<any>, inID: number, outData: interop.Pointer | interop.Reference<any>, ioDataSize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioQueueGetPropertySize(inAQ: interop.Pointer | interop.Reference<any>, inID: number, outDataSize: interop.Pointer | interop.Reference<number>): number;

interface AudioQueueLevelMeterState {
	mAveragePower: number;
	mPeakPower: number;
}
declare var AudioQueueLevelMeterState: interop.StructType<AudioQueueLevelMeterState>;

/**
 * @since 2.0
 */
declare function AudioQueueNewInput(inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inCallbackProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<AudioQueueBuffer>, p4: interop.Pointer | interop.Reference<AudioTimeStamp>, p5: number, p6: interop.Pointer | interop.Reference<AudioStreamPacketDescription>) => void>, inUserData: interop.Pointer | interop.Reference<any>, inCallbackRunLoop: any, inCallbackRunLoopMode: string, inFlags: number, outAQ: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 10.0
 */
declare function AudioQueueNewInputWithDispatchQueue(outAQ: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inFlags: number, inCallbackDispatchQueue: NSObject & OS_dispatch_queue, inCallbackBlock: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioQueueBuffer>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: interop.Pointer | interop.Reference<AudioStreamPacketDescription>) => void): number;

/**
 * @since 2.0
 */
declare function AudioQueueNewOutput(inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inCallbackProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<AudioQueueBuffer>) => void>, inUserData: interop.Pointer | interop.Reference<any>, inCallbackRunLoop: any, inCallbackRunLoopMode: string, inFlags: number, outAQ: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 10.0
 */
declare function AudioQueueNewOutputWithDispatchQueue(outAQ: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inFlags: number, inCallbackDispatchQueue: NSObject & OS_dispatch_queue, inCallbackBlock: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioQueueBuffer>) => void): number;

/**
 * @since 2.0
 */
declare function AudioQueueOfflineRender(inAQ: interop.Pointer | interop.Reference<any>, inTimestamp: interop.Pointer | interop.Reference<AudioTimeStamp>, ioBuffer: interop.Pointer | interop.Reference<AudioQueueBuffer>, inNumberFrames: number): number;

interface AudioQueueParameterEvent {
	mID: number;
	mValue: number;
}
declare var AudioQueueParameterEvent: interop.StructType<AudioQueueParameterEvent>;

/**
 * @since 2.0
 */
declare function AudioQueuePause(inAQ: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioQueuePrime(inAQ: interop.Pointer | interop.Reference<any>, inNumberOfFramesToPrepare: number, outNumberOfFramesPrepared: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 6.0
 */
declare function AudioQueueProcessingTapDispose(inAQTap: interop.Pointer | interop.Reference<any>): number;

declare const enum AudioQueueProcessingTapFlags {

	kAudioQueueProcessingTap_PreEffects = 1,

	kAudioQueueProcessingTap_PostEffects = 2,

	kAudioQueueProcessingTap_Siphon = 4,

	kAudioQueueProcessingTap_StartOfStream = 256,

	kAudioQueueProcessingTap_EndOfStream = 512
}

/**
 * @since 6.0
 */
declare function AudioQueueProcessingTapGetQueueTime(inAQTap: interop.Pointer | interop.Reference<any>, outQueueSampleTime: interop.Pointer | interop.Reference<number>, outQueueFrameCount: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 6.0
 */
declare function AudioQueueProcessingTapGetSourceAudio(inAQTap: interop.Pointer | interop.Reference<any>, inNumberFrames: number, ioTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>, outFlags: interop.Pointer | interop.Reference<AudioQueueProcessingTapFlags>, outNumberFrames: interop.Pointer | interop.Reference<number>, ioData: interop.Pointer | interop.Reference<AudioBufferList>): number;

/**
 * @since 6.0
 */
declare function AudioQueueProcessingTapNew(inAQ: interop.Pointer | interop.Reference<any>, inCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<AudioTimeStamp>, p5: interop.Pointer | interop.Reference<AudioQueueProcessingTapFlags>, p6: interop.Pointer | interop.Reference<number>, p7: interop.Pointer | interop.Reference<AudioBufferList>) => void>, inClientData: interop.Pointer | interop.Reference<any>, inFlags: AudioQueueProcessingTapFlags, outMaxFrames: interop.Pointer | interop.Reference<number>, outProcessingFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, outAQTap: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.0
 */
declare function AudioQueueRemovePropertyListener(inAQ: interop.Pointer | interop.Reference<any>, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>, inUserData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioQueueReset(inAQ: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioQueueSetOfflineRenderFormat(inAQ: interop.Pointer | interop.Reference<any>, inFormat: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inLayout: interop.Pointer | interop.Reference<AudioChannelLayout>): number;

/**
 * @since 2.0
 */
declare function AudioQueueSetParameter(inAQ: interop.Pointer | interop.Reference<any>, inParamID: number, inValue: number): number;

/**
 * @since 2.0
 */
declare function AudioQueueSetProperty(inAQ: interop.Pointer | interop.Reference<any>, inID: number, inData: interop.Pointer | interop.Reference<any>, inDataSize: number): number;

/**
 * @since 2.0
 */
declare function AudioQueueStart(inAQ: interop.Pointer | interop.Reference<any>, inStartTime: interop.Pointer | interop.Reference<AudioTimeStamp>): number;

/**
 * @since 2.0
 */
declare function AudioQueueStop(inAQ: interop.Pointer | interop.Reference<any>, inImmediate: boolean): number;

/**
 * @since 2.0
 */
declare function AudioServicesAddSystemSoundCompletion(inSystemSoundID: number, inRunLoop: any, inRunLoopMode: string, inCompletionRoutine: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any>) => void>, inClientData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioServicesCreateSystemSoundID(inFileURL: NSURL, outSystemSoundID: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioServicesDisposeSystemSoundID(inSystemSoundID: number): number;

/**
 * @since 2.0
 */
declare function AudioServicesGetProperty(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioServicesGetPropertyInfo(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, outPropertyDataSize: interop.Pointer | interop.Reference<number>, outWritable: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioServicesPlayAlertSound(inSystemSoundID: number): void;

/**
 * @since 9.0
 */
declare function AudioServicesPlayAlertSoundWithCompletion(inSystemSoundID: number, inCompletionBlock: () => void): void;

/**
 * @since 2.0
 */
declare function AudioServicesPlaySystemSound(inSystemSoundID: number): void;

/**
 * @since 9.0
 */
declare function AudioServicesPlaySystemSoundWithCompletion(inSystemSoundID: number, inCompletionBlock: () => void): void;

/**
 * @since 2.0
 */
declare function AudioServicesRemoveSystemSoundCompletion(inSystemSoundID: number): void;

/**
 * @since 2.0
 */
declare function AudioServicesSetProperty(inPropertyID: number, inSpecifierSize: number, inSpecifier: interop.Pointer | interop.Reference<any>, inPropertyDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function AudioSessionAddPropertyListener(inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>) => void>, inClientData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function AudioSessionGetProperty(inID: number, ioDataSize: interop.Pointer | interop.Reference<number>, outData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function AudioSessionGetPropertySize(inID: number, outDataSize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function AudioSessionInitialize(inRunLoop: any, inRunLoopMode: string, inInterruptionListener: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => void>, inClientData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 2.0
 */
declare function AudioSessionRemovePropertyListener(inID: number): number;

/**
 * @since 2.1
 * @deprecated 7.0
 */
declare function AudioSessionRemovePropertyListenerWithUserData(inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>) => void>, inClientData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function AudioSessionSetActive(active: boolean): number;

/**
 * @since 4.0
 * @deprecated 7.0
 */
declare function AudioSessionSetActiveWithFlags(active: boolean, inFlags: number): number;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function AudioSessionSetProperty(inID: number, inDataSize: number, inData: interop.Pointer | interop.Reference<any>): number;

declare const enum AudioSettingsFlags {

	kAudioSettingsFlags_ExpertParameter = 1,

	kAudioSettingsFlags_InvisibleParameter = 2,

	kAudioSettingsFlags_MetaParameter = 4,

	kAudioSettingsFlags_UserInterfaceParameter = 8
}

/**
 * @since 2.0
 */
declare function AudioUnitAddPropertyListener(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: number) => void>, inProcUserData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioUnitAddRenderNotify(inUnit: interop.Pointer | interop.Reference<any>, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<AudioBufferList>) => number>, inProcUserData: interop.Pointer | interop.Reference<any>): number;

interface AudioUnitConnection {
	sourceAudioUnit: interop.Pointer | interop.Reference<any>;
	sourceOutputNumber: number;
	destInputNumber: number;
}
declare var AudioUnitConnection: interop.StructType<AudioUnitConnection>;

declare const enum AudioUnitEventType {

	kAudioUnitEvent_ParameterValueChange = 0,

	kAudioUnitEvent_BeginParameterChangeGesture = 1,

	kAudioUnitEvent_EndParameterChangeGesture = 2,

	kAudioUnitEvent_PropertyChange = 3
}

/**
 * @since 11.0
 */
declare function AudioUnitExtensionCopyComponentList(extensionIdentifier: string): interop.Unmanaged<NSArray<any>>;

/**
 * @since 11.0
 */
declare function AudioUnitExtensionSetComponentList(extensionIdentifier: string, audioComponentInfo: NSArray<any> | any[]): number;

interface AudioUnitExternalBuffer {
	buffer: interop.Pointer | interop.Reference<any>;
	size: number;
}
declare var AudioUnitExternalBuffer: interop.StructType<AudioUnitExternalBuffer>;

interface AudioUnitFrequencyResponseBin {
	mFrequency: number;
	mMagnitude: number;
}
declare var AudioUnitFrequencyResponseBin: interop.StructType<AudioUnitFrequencyResponseBin>;

/**
 * @since 2.0
 */
declare function AudioUnitGetParameter(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inScope: number, inElement: number, outValue: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioUnitGetProperty(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inScope: number, inElement: number, outData: interop.Pointer | interop.Reference<any>, ioDataSize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 */
declare function AudioUnitGetPropertyInfo(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inScope: number, inElement: number, outDataSize: interop.Pointer | interop.Reference<number>, outWritable: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
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

interface AudioUnitParameterNameInfo {
	inID: number;
	inDesiredLength: number;
	outName: string;
}
declare var AudioUnitParameterNameInfo: interop.StructType<AudioUnitParameterNameInfo>;

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

	kAudioUnitParameterUnit_CustomUnit = 26,

	kAudioUnitParameterUnit_MIDI2Controller = 27
}

interface AudioUnitParameterValueFromString {
	inParamID: number;
	inString: string;
	outValue: number;
}
declare var AudioUnitParameterValueFromString: interop.StructType<AudioUnitParameterValueFromString>;

/**
 * @since 6.0
 */
declare function AudioUnitProcess(inUnit: interop.Pointer | interop.Reference<any>, ioActionFlags: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, inTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>, inNumberFrames: number, ioData: interop.Pointer | interop.Reference<AudioBufferList>): number;

/**
 * @since 6.0
 */
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

/**
 * @since 2.0
 */
declare function AudioUnitRemovePropertyListenerWithUserData(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: number) => void>, inProcUserData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function AudioUnitRemoveRenderNotify(inUnit: interop.Pointer | interop.Reference<any>, inProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<AudioUnitRenderActionFlags>, p3: interop.Pointer | interop.Reference<AudioTimeStamp>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<AudioBufferList>) => number>, inProcUserData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
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

interface AudioUnitRenderContext {
	workgroup: OS_os_workgroup;
	reserved: interop.Reference<number>;
}
declare var AudioUnitRenderContext: interop.StructType<AudioUnitRenderContext>;

/**
 * @since 2.0
 */
declare function AudioUnitReset(inUnit: interop.Pointer | interop.Reference<any>, inScope: number, inElement: number): number;

/**
 * @since 2.0
 */
declare function AudioUnitSetParameter(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inScope: number, inElement: number, inValue: number, inBufferOffsetInFrames: number): number;

/**
 * @since 2.0
 */
declare function AudioUnitSetProperty(inUnit: interop.Pointer | interop.Reference<any>, inID: number, inScope: number, inElement: number, inData: interop.Pointer | interop.Reference<any>, inDataSize: number): number;

/**
 * @since 2.0
 */
declare function AudioUnitUninitialize(inUnit: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 14.0
 */
declare function AudioWorkIntervalCreate(name: string | interop.Pointer | interop.Reference<any>, clock: os_clockid_t, attr: interop.Pointer | interop.Reference<os_workgroup_attr_opaque_s>): OS_os_workgroup & OS_os_workgroup_intervalProtocol;

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

/**
 * @since 2.0
 */
declare function CAShow(inObject: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 */
declare function CAShowFile(inObject: interop.Pointer | interop.Reference<any>, inFile: interop.Pointer | interop.Reference<FILE>): void;

/**
 * @since 7.0
 */
declare function CopyInstrumentInfoFromSoundBank(inURL: NSURL, outInstrumentInfo: interop.Pointer | interop.Reference<NSArray<any>>): number;

/**
 * @since 7.0
 */
declare function CopyNameFromSoundBank(inURL: NSURL, outName: interop.Pointer | interop.Reference<string>): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function DisposeAUGraph(inGraph: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function DisposeMusicEventIterator(inIterator: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function DisposeMusicPlayer(inPlayer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function DisposeMusicSequence(inSequence: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileCreateWithURL(inURL: NSURL, inFileType: number, inStreamDesc: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, inChannelLayout: interop.Pointer | interop.Reference<AudioChannelLayout>, inFlags: number, outExtAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileDispose(inExtAudioFile: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileGetProperty(inExtAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, ioPropertyDataSize: interop.Pointer | interop.Reference<number>, outPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileGetPropertyInfo(inExtAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, outSize: interop.Pointer | interop.Reference<number>, outWritable: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileOpenURL(inURL: NSURL, outExtAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileRead(inExtAudioFile: interop.Pointer | interop.Reference<any>, ioNumberFrames: interop.Pointer | interop.Reference<number>, ioData: interop.Pointer | interop.Reference<AudioBufferList>): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileSeek(inExtAudioFile: interop.Pointer | interop.Reference<any>, inFrameOffset: number): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileSetProperty(inExtAudioFile: interop.Pointer | interop.Reference<any>, inPropertyID: number, inPropertyDataSize: number, inPropertyData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileTell(inExtAudioFile: interop.Pointer | interop.Reference<any>, outFrameOffset: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileWrapAudioFileID(inFileID: interop.Pointer | interop.Reference<any>, inForWriting: boolean, outExtAudioFile: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.1
 */
declare function ExtAudioFileWrite(inExtAudioFile: interop.Pointer | interop.Reference<any>, inNumberFrames: number, ioData: interop.Pointer | interop.Reference<AudioBufferList>): number;

/**
 * @since 2.1
 */
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
	transportStateProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<any>, p6: interop.Pointer | interop.Reference<number>, p7: interop.Pointer | interop.Reference<number>) => number>;
	transportStateProc2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<any>, p7: interop.Pointer | interop.Reference<number>, p8: interop.Pointer | interop.Reference<number>) => number>;
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

/**
 * @since 5.0
 */
declare function MusicDeviceMIDIEvent(inUnit: interop.Pointer | interop.Reference<any>, inStatus: number, inData1: number, inData2: number, inOffsetSampleFrame: number): number;

/**
 * @since 15.0
 */
declare function MusicDeviceMIDIEventList(inUnit: interop.Pointer | interop.Reference<any>, inOffsetSampleFrame: number, evtList: interop.Pointer | interop.Reference<MIDIEventList>): number;

interface MusicDeviceNoteParams {
	argCount: number;
	mPitch: number;
	mVelocity: number;
	mControls: interop.Reference<NoteParamsControlValue>;
}
declare var MusicDeviceNoteParams: interop.StructType<MusicDeviceNoteParams>;

/**
 * @since 5.0
 */
declare function MusicDeviceStartNote(inUnit: interop.Pointer | interop.Reference<any>, inInstrument: number, inGroupID: number, outNoteInstanceID: interop.Pointer | interop.Reference<number>, inOffsetSampleFrame: number, inParams: interop.Pointer | interop.Reference<MusicDeviceNoteParams>): number;

interface MusicDeviceStdNoteParams {
	argCount: number;
	mPitch: number;
	mVelocity: number;
}
declare var MusicDeviceStdNoteParams: interop.StructType<MusicDeviceStdNoteParams>;

/**
 * @since 5.0
 */
declare function MusicDeviceStopNote(inUnit: interop.Pointer | interop.Reference<any>, inGroupID: number, inNoteInstanceID: number, inOffsetSampleFrame: number): number;

/**
 * @since 5.0
 */
declare function MusicDeviceSysEx(inUnit: interop.Pointer | interop.Reference<any>, inData: string | interop.Pointer | interop.Reference<any>, inLength: number): number;

/**
 * @since 5.0
 */
declare function MusicEventIteratorDeleteEvent(inIterator: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicEventIteratorGetEventInfo(inIterator: interop.Pointer | interop.Reference<any>, outTimeStamp: interop.Pointer | interop.Reference<number>, outEventType: interop.Pointer | interop.Reference<number>, outEventData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, outEventDataSize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicEventIteratorHasCurrentEvent(inIterator: interop.Pointer | interop.Reference<any>, outHasCurEvent: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicEventIteratorHasNextEvent(inIterator: interop.Pointer | interop.Reference<any>, outHasNextEvent: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicEventIteratorHasPreviousEvent(inIterator: interop.Pointer | interop.Reference<any>, outHasPrevEvent: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicEventIteratorNextEvent(inIterator: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicEventIteratorPreviousEvent(inIterator: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicEventIteratorSeek(inIterator: interop.Pointer | interop.Reference<any>, inTimeStamp: number): number;

/**
 * @since 5.0
 */
declare function MusicEventIteratorSetEventInfo(inIterator: interop.Pointer | interop.Reference<any>, inEventType: number, inEventData: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicEventIteratorSetEventTime(inIterator: interop.Pointer | interop.Reference<any>, inTimeStamp: number): number;

interface MusicEventUserData {
	length: number;
	data: interop.Reference<number>;
}
declare var MusicEventUserData: interop.StructType<MusicEventUserData>;

/**
 * @since 5.0
 */
declare function MusicPlayerGetBeatsForHostTime(inPlayer: interop.Pointer | interop.Reference<any>, inHostTime: number, outBeats: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicPlayerGetHostTimeForBeats(inPlayer: interop.Pointer | interop.Reference<any>, inBeats: number, outHostTime: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicPlayerGetPlayRateScalar(inPlayer: interop.Pointer | interop.Reference<any>, outScaleRate: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicPlayerGetSequence(inPlayer: interop.Pointer | interop.Reference<any>, outSequence: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 */
declare function MusicPlayerGetTime(inPlayer: interop.Pointer | interop.Reference<any>, outTime: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicPlayerIsPlaying(inPlayer: interop.Pointer | interop.Reference<any>, outIsPlaying: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicPlayerPreroll(inPlayer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicPlayerSetPlayRateScalar(inPlayer: interop.Pointer | interop.Reference<any>, inScaleRate: number): number;

/**
 * @since 5.0
 */
declare function MusicPlayerSetSequence(inPlayer: interop.Pointer | interop.Reference<any>, inSequence: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicPlayerSetTime(inPlayer: interop.Pointer | interop.Reference<any>, inTime: number): number;

/**
 * @since 5.0
 */
declare function MusicPlayerStart(inPlayer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicPlayerStop(inPlayer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceBarBeatTimeToBeats(inSequence: interop.Pointer | interop.Reference<any>, inBarBeatTime: interop.Pointer | interop.Reference<CABarBeatTime>, outBeats: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceBeatsToBarBeatTime(inSequence: interop.Pointer | interop.Reference<any>, inBeats: number, inSubbeatDivisor: number, outBarBeatTime: interop.Pointer | interop.Reference<CABarBeatTime>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceDisposeTrack(inSequence: interop.Pointer | interop.Reference<any>, inTrack: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceFileCreate(inSequence: interop.Pointer | interop.Reference<any>, inFileRef: NSURL, inFileType: MusicSequenceFileTypeID, inFlags: MusicSequenceFileFlags, inResolution: number): number;

/**
 * @since 5.0
 */
declare function MusicSequenceFileCreateData(inSequence: interop.Pointer | interop.Reference<any>, inFileType: MusicSequenceFileTypeID, inFlags: MusicSequenceFileFlags, inResolution: number, outData: interop.Pointer | interop.Reference<NSData>): number;

declare const enum MusicSequenceFileFlags {

	kMusicSequenceFileFlags_Default = 0,

	kMusicSequenceFileFlags_EraseFile = 1
}

/**
 * @since 5.0
 */
declare function MusicSequenceFileLoad(inSequence: interop.Pointer | interop.Reference<any>, inFileRef: NSURL, inFileTypeHint: MusicSequenceFileTypeID, inFlags: MusicSequenceLoadFlags): number;

/**
 * @since 5.0
 */
declare function MusicSequenceFileLoadData(inSequence: interop.Pointer | interop.Reference<any>, inData: NSData, inFileTypeHint: MusicSequenceFileTypeID, inFlags: MusicSequenceLoadFlags): number;

declare const enum MusicSequenceFileTypeID {

	kMusicSequenceFile_AnyType = 0,

	kMusicSequenceFile_MIDIType = 1835623529,

	kMusicSequenceFile_iMelodyType = 1768777068
}

/**
 * @since 5.0
 */
declare function MusicSequenceGetAUGraph(inSequence: interop.Pointer | interop.Reference<any>, outGraph: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceGetBeatsForSeconds(inSequence: interop.Pointer | interop.Reference<any>, inSeconds: number, outBeats: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceGetIndTrack(inSequence: interop.Pointer | interop.Reference<any>, inTrackIndex: number, outTrack: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceGetInfoDictionary(inSequence: interop.Pointer | interop.Reference<any>): NSDictionary<any, any>;

/**
 * @since 5.0
 */
declare function MusicSequenceGetSecondsForBeats(inSequence: interop.Pointer | interop.Reference<any>, inBeats: number, outSeconds: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceGetSequenceType(inSequence: interop.Pointer | interop.Reference<any>, outType: interop.Pointer | interop.Reference<MusicSequenceType>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceGetTempoTrack(inSequence: interop.Pointer | interop.Reference<any>, outTrack: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceGetTrackCount(inSequence: interop.Pointer | interop.Reference<any>, outNumberOfTracks: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceGetTrackIndex(inSequence: interop.Pointer | interop.Reference<any>, inTrack: interop.Pointer | interop.Reference<any>, outTrackIndex: interop.Pointer | interop.Reference<number>): number;

declare const enum MusicSequenceLoadFlags {

	kMusicSequenceLoadSMF_PreserveTracks = 0,

	kMusicSequenceLoadSMF_ChannelsToTracks = 1
}

/**
 * @since 5.0
 */
declare function MusicSequenceNewTrack(inSequence: interop.Pointer | interop.Reference<any>, outTrack: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceReverse(inSequence: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceSetAUGraph(inSequence: interop.Pointer | interop.Reference<any>, inGraph: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function MusicSequenceSetMIDIEndpoint(inSequence: interop.Pointer | interop.Reference<any>, inEndpoint: number): number;

/**
 * @since 5.0
 */
declare function MusicSequenceSetSequenceType(inSequence: interop.Pointer | interop.Reference<any>, inType: MusicSequenceType): number;

/**
 * @since 5.0
 */
declare function MusicSequenceSetUserCallback(inSequence: interop.Pointer | interop.Reference<any>, inCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<MusicEventUserData>, p6: number, p7: number) => void>, inClientData: interop.Pointer | interop.Reference<any>): number;

declare const enum MusicSequenceType {

	kMusicSequenceType_Beats = 1650811252,

	kMusicSequenceType_Seconds = 1936024435,

	kMusicSequenceType_Samples = 1935764848
}

/**
 * @since 5.0
 */
declare function MusicTrackClear(inTrack: interop.Pointer | interop.Reference<any>, inStartTime: number, inEndTime: number): number;

/**
 * @since 5.0
 */
declare function MusicTrackCopyInsert(inSourceTrack: interop.Pointer | interop.Reference<any>, inSourceStartTime: number, inSourceEndTime: number, inDestTrack: interop.Pointer | interop.Reference<any>, inDestInsertTime: number): number;

/**
 * @since 5.0
 */
declare function MusicTrackCut(inTrack: interop.Pointer | interop.Reference<any>, inStartTime: number, inEndTime: number): number;

/**
 * @since 5.0
 */
declare function MusicTrackGetDestMIDIEndpoint(inTrack: interop.Pointer | interop.Reference<any>, outEndpoint: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicTrackGetDestNode(inTrack: interop.Pointer | interop.Reference<any>, outNode: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicTrackGetProperty(inTrack: interop.Pointer | interop.Reference<any>, inPropertyID: number, outData: interop.Pointer | interop.Reference<any>, ioLength: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 */
declare function MusicTrackGetSequence(inTrack: interop.Pointer | interop.Reference<any>, outSequence: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

interface MusicTrackLoopInfo {
	loopDuration: number;
	numberOfLoops: number;
}
declare var MusicTrackLoopInfo: interop.StructType<MusicTrackLoopInfo>;

/**
 * @since 5.0
 */
declare function MusicTrackMerge(inSourceTrack: interop.Pointer | interop.Reference<any>, inSourceStartTime: number, inSourceEndTime: number, inDestTrack: interop.Pointer | interop.Reference<any>, inDestInsertTime: number): number;

/**
 * @since 5.0
 */
declare function MusicTrackMoveEvents(inTrack: interop.Pointer | interop.Reference<any>, inStartTime: number, inEndTime: number, inMoveTime: number): number;

/**
 * @since 5.0
 */
declare function MusicTrackNewAUPresetEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inPresetEvent: interop.Pointer | interop.Reference<AUPresetEvent>): number;

/**
 * @since 5.0
 */
declare function MusicTrackNewExtendedNoteEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inInfo: interop.Pointer | interop.Reference<ExtendedNoteOnEvent>): number;

/**
 * @since 5.0
 */
declare function MusicTrackNewExtendedTempoEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inBPM: number): number;

/**
 * @since 5.0
 */
declare function MusicTrackNewMIDIChannelEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inMessage: interop.Pointer | interop.Reference<MIDIChannelMessage>): number;

/**
 * @since 5.0
 */
declare function MusicTrackNewMIDINoteEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inMessage: interop.Pointer | interop.Reference<MIDINoteMessage>): number;

/**
 * @since 5.0
 */
declare function MusicTrackNewMIDIRawDataEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inRawData: interop.Pointer | interop.Reference<MIDIRawData>): number;

/**
 * @since 5.0
 */
declare function MusicTrackNewMetaEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inMetaEvent: interop.Pointer | interop.Reference<MIDIMetaEvent>): number;

/**
 * @since 5.0
 */
declare function MusicTrackNewParameterEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inInfo: interop.Pointer | interop.Reference<ParameterEvent>): number;

/**
 * @since 5.0
 */
declare function MusicTrackNewUserEvent(inTrack: interop.Pointer | interop.Reference<any>, inTimeStamp: number, inUserData: interop.Pointer | interop.Reference<MusicEventUserData>): number;

/**
 * @since 5.0
 */
declare function MusicTrackSetDestMIDIEndpoint(inTrack: interop.Pointer | interop.Reference<any>, inEndpoint: number): number;

/**
 * @since 5.0
 */
declare function MusicTrackSetDestNode(inTrack: interop.Pointer | interop.Reference<any>, inNode: number): number;

/**
 * @since 5.0
 */
declare function MusicTrackSetProperty(inTrack: interop.Pointer | interop.Reference<any>, inPropertyID: number, inData: interop.Pointer | interop.Reference<any>, inLength: number): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function NewAUGraph(outGraph: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 */
declare function NewMusicEventIterator(inTrack: interop.Pointer | interop.Reference<any>, outIterator: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 */
declare function NewMusicPlayer(outPlayer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 */
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

declare const k3DMixerParam_Azimuth: number;

declare const k3DMixerParam_BusEnable: number;

declare const k3DMixerParam_Distance: number;

declare const k3DMixerParam_DryWetReverbBlend: number;

declare const k3DMixerParam_Elevation: number;

declare const k3DMixerParam_Enable: number;

declare const k3DMixerParam_Gain: number;

declare const k3DMixerParam_GlobalReverbGain: number;

declare const k3DMixerParam_GlobalReverbGainInDecibels: number;

declare const k3DMixerParam_MaxGain: number;

declare const k3DMixerParam_MaxGainInDecibels: number;

declare const k3DMixerParam_MinGain: number;

declare const k3DMixerParam_MinGainInDecibels: number;

declare const k3DMixerParam_ObstructionAttenuation: number;

declare const k3DMixerParam_ObstructionAttenuationInDecibels: number;

declare const k3DMixerParam_OcclusionAttenuation: number;

declare const k3DMixerParam_OcclusionAttenuationInDecibels: number;

declare const k3DMixerParam_PlaybackRate: number;

declare const k3DMixerParam_PostAveragePower: number;

declare const k3DMixerParam_PostPeakHoldLevel: number;

declare const k3DMixerParam_PreAveragePower: number;

declare const k3DMixerParam_PrePeakHoldLevel: number;

declare const k3DMixerParam_ReverbBlend: number;

declare const kAUGraphErr_CannotDoInCurrentContext: number;

declare const kAUGraphErr_InvalidAudioUnit: number;

declare const kAUGraphErr_InvalidConnection: number;

declare const kAUGraphErr_NodeNotFound: number;

declare const kAUGraphErr_OutputNodeErr: number;

declare const kAUGroupParameterID_AllNotesOff: number;

declare const kAUGroupParameterID_AllSoundOff: number;

declare const kAUGroupParameterID_ChannelPressure: number;

declare const kAUGroupParameterID_DataEntry: number;

declare const kAUGroupParameterID_DataEntry_LSB: number;

declare const kAUGroupParameterID_Expression: number;

declare const kAUGroupParameterID_Expression_LSB: number;

declare const kAUGroupParameterID_Foot: number;

declare const kAUGroupParameterID_Foot_LSB: number;

declare const kAUGroupParameterID_KeyPressure: number;

declare const kAUGroupParameterID_KeyPressure_FirstKey: number;

declare const kAUGroupParameterID_KeyPressure_LastKey: number;

declare const kAUGroupParameterID_ModWheel: number;

declare const kAUGroupParameterID_ModWheel_LSB: number;

declare const kAUGroupParameterID_Pan: number;

declare const kAUGroupParameterID_Pan_LSB: number;

declare const kAUGroupParameterID_PitchBend: number;

declare const kAUGroupParameterID_ResetAllControllers: number;

declare const kAUGroupParameterID_Sostenuto: number;

declare const kAUGroupParameterID_Sustain: number;

declare const kAUGroupParameterID_Volume: number;

declare const kAUGroupParameterID_Volume_LSB: number;

declare const kAULowShelfParam_CutoffFrequency: number;

declare const kAULowShelfParam_Gain: number;

declare const kAUMIDISynthProperty_EnablePreload: number;

declare const kAUNBandEQFilterType_2ndOrderButterworthHighPass: number;

declare const kAUNBandEQFilterType_2ndOrderButterworthLowPass: number;

declare const kAUNBandEQFilterType_BandPass: number;

declare const kAUNBandEQFilterType_BandStop: number;

declare const kAUNBandEQFilterType_HighShelf: number;

declare const kAUNBandEQFilterType_LowShelf: number;

declare const kAUNBandEQFilterType_Parametric: number;

declare const kAUNBandEQFilterType_ResonantHighPass: number;

declare const kAUNBandEQFilterType_ResonantHighShelf: number;

declare const kAUNBandEQFilterType_ResonantLowPass: number;

declare const kAUNBandEQFilterType_ResonantLowShelf: number;

declare const kAUNBandEQParam_Bandwidth: number;

declare const kAUNBandEQParam_BypassBand: number;

declare const kAUNBandEQParam_FilterType: number;

declare const kAUNBandEQParam_Frequency: number;

declare const kAUNBandEQParam_Gain: number;

declare const kAUNBandEQParam_GlobalGain: number;

declare const kAUNBandEQProperty_BiquadCoefficients: number;

declare const kAUNBandEQProperty_MaxNumberOfBands: number;

declare const kAUNBandEQProperty_NumberOfBands: number;

declare const kAUNodeInteraction_Connection: number;

declare const kAUNodeInteraction_InputCallback: number;

declare const kAUParameterListener_AnyParameter: number;

declare const kAUSamplerParam_CoarseTuning: number;

declare const kAUSamplerParam_FineTuning: number;

declare const kAUSamplerParam_Gain: number;

declare const kAUSamplerParam_Pan: number;

declare const kAUSamplerProperty_BankAndPreset: number;

declare const kAUSamplerProperty_LoadAudioFiles: number;

declare const kAUSamplerProperty_LoadInstrument: number;

declare const kAUSamplerProperty_LoadPresetFromBank: number;

declare const kAUSampler_DefaultBankLSB: number;

declare const kAUSampler_DefaultMelodicBankMSB: number;

declare const kAUSampler_DefaultPercussionBankMSB: number;

declare const kAUSoundIsolationParam_SoundToIsolate: number;

declare const kAUSoundIsolationParam_WetDryMixPercent: number;

declare const kAUSoundIsolationSoundType_HighQualityVoice: number;

declare const kAUSoundIsolationSoundType_Voice: number;

declare const kAUVoiceIOProperty_BypassVoiceProcessing: number;

declare const kAUVoiceIOProperty_DuckNonVoiceAudio: number;

declare const kAUVoiceIOProperty_MuteOutput: number;

declare const kAUVoiceIOProperty_MutedSpeechActivityEventListener: number;

declare const kAUVoiceIOProperty_OtherAudioDuckingConfiguration: number;

declare const kAUVoiceIOProperty_VoiceProcessingEnableAGC: number;

declare const kAUVoiceIOProperty_VoiceProcessingQuality: number;

declare const kAppleHardwareAudioCodecManufacturer: number;

declare const kAppleSoftwareAudioCodecManufacturer: number;

declare const kAudioCodecAppendInputBufferListSelect: number;

declare const kAudioCodecAppendInputDataSelect: number;

declare const kAudioCodecBadDataError: number;

declare const kAudioCodecBadPropertySizeError: number;

declare const kAudioCodecBitRateControlMode_Constant: number;

declare const kAudioCodecBitRateControlMode_LongTermAverage: number;

declare const kAudioCodecBitRateControlMode_Variable: number;

declare const kAudioCodecBitRateControlMode_VariableConstrained: number;

declare const kAudioCodecBitRateFormat: number;

declare const kAudioCodecBitRateFormat_ABR: number;

declare const kAudioCodecBitRateFormat_CBR: number;

declare const kAudioCodecBitRateFormat_VBR: number;

declare const kAudioCodecDelayMode_Compatibility: number;

declare const kAudioCodecDelayMode_Minimum: number;

declare const kAudioCodecDelayMode_Optimal: number;

declare const kAudioCodecDoesSampleRateConversion: number;

declare const kAudioCodecExtendFrequencies: number;

declare const kAudioCodecGetPropertyInfoSelect: number;

declare const kAudioCodecGetPropertySelect: number;

declare const kAudioCodecIllegalOperationError: number;

declare const kAudioCodecInitializeSelect: number;

declare const kAudioCodecInputFormatsForOutputFormat: number;

declare const kAudioCodecNoError: number;

declare const kAudioCodecNotEnoughBufferSpaceError: number;

declare const kAudioCodecOutputFormatsForInputFormat: number;

declare const kAudioCodecOutputPrecedence: number;

declare const kAudioCodecOutputPrecedenceBitRate: number;

declare const kAudioCodecOutputPrecedenceNone: number;

declare const kAudioCodecOutputPrecedenceSampleRate: number;

declare const kAudioCodecPrimeMethod_None: number;

declare const kAudioCodecPrimeMethod_Normal: number;

declare const kAudioCodecPrimeMethod_Pre: number;

declare const kAudioCodecProduceOutputBufferListSelect: number;

declare const kAudioCodecProduceOutputDataSelect: number;

declare const kAudioCodecProduceOutputPacketAtEOF: number;

declare const kAudioCodecProduceOutputPacketFailure: number;

declare const kAudioCodecProduceOutputPacketNeedsMoreInputData: number;

declare const kAudioCodecProduceOutputPacketSuccess: number;

declare const kAudioCodecProduceOutputPacketSuccessConcealed: number;

declare const kAudioCodecProduceOutputPacketSuccessHasMore: number;

declare const kAudioCodecPropertyAdjustCompressionProfile: number;

declare const kAudioCodecPropertyAdjustLocalQuality: number;

declare const kAudioCodecPropertyAdjustTargetLevel: number;

declare const kAudioCodecPropertyAdjustTargetLevelConstant: number;

declare const kAudioCodecPropertyApplicableBitRateRange: number;

declare const kAudioCodecPropertyApplicableInputSampleRates: number;

declare const kAudioCodecPropertyApplicableOutputSampleRates: number;

declare const kAudioCodecPropertyAvailableBitRateRange: number;

declare const kAudioCodecPropertyAvailableBitRates: number;

declare const kAudioCodecPropertyAvailableInputChannelLayoutTags: number;

declare const kAudioCodecPropertyAvailableInputChannelLayouts: number;

declare const kAudioCodecPropertyAvailableInputSampleRates: number;

declare const kAudioCodecPropertyAvailableNumberChannels: number;

declare const kAudioCodecPropertyAvailableOutputChannelLayoutTags: number;

declare const kAudioCodecPropertyAvailableOutputChannelLayouts: number;

declare const kAudioCodecPropertyAvailableOutputSampleRates: number;

declare const kAudioCodecPropertyBitRateControlMode: number;

declare const kAudioCodecPropertyBitRateForVBR: number;

declare const kAudioCodecPropertyCurrentInputChannelLayout: number;

declare const kAudioCodecPropertyCurrentInputFormat: number;

declare const kAudioCodecPropertyCurrentInputSampleRate: number;

declare const kAudioCodecPropertyCurrentOutputChannelLayout: number;

declare const kAudioCodecPropertyCurrentOutputFormat: number;

declare const kAudioCodecPropertyCurrentOutputSampleRate: number;

declare const kAudioCodecPropertyCurrentTargetBitRate: number;

declare const kAudioCodecPropertyDelayMode: number;

declare const kAudioCodecPropertyDoesSampleRateConversion: number;

declare const kAudioCodecPropertyDynamicRangeControlMode: number;

declare const kAudioCodecPropertyEmploysDependentPackets: number;

declare const kAudioCodecPropertyFormatCFString: number;

declare const kAudioCodecPropertyFormatInfo: number;

declare const kAudioCodecPropertyFormatList: number;

declare const kAudioCodecPropertyHasVariablePacketByteSizes: number;

declare const kAudioCodecPropertyInputBufferSize: number;

declare const kAudioCodecPropertyInputChannelLayout: number;

declare const kAudioCodecPropertyInputFormatsForOutputFormat: number;

declare const kAudioCodecPropertyIsInitialized: number;

declare const kAudioCodecPropertyMagicCookie: number;

declare const kAudioCodecPropertyManufacturerCFString: number;

declare const kAudioCodecPropertyMaximumPacketByteSize: number;

declare const kAudioCodecPropertyMinimumDelayMode: number;

declare const kAudioCodecPropertyMinimumNumberInputPackets: number;

declare const kAudioCodecPropertyMinimumNumberOutputPackets: number;

declare const kAudioCodecPropertyNameCFString: number;

declare const kAudioCodecPropertyOutputChannelLayout: number;

declare const kAudioCodecPropertyOutputFormatsForInputFormat: number;

declare const kAudioCodecPropertyPacketFrameSize: number;

declare const kAudioCodecPropertyPacketSizeLimitForVBR: number;

declare const kAudioCodecPropertyPaddedZeros: number;

declare const kAudioCodecPropertyPrimeInfo: number;

declare const kAudioCodecPropertyPrimeMethod: number;

declare const kAudioCodecPropertyProgramTargetLevel: number;

declare const kAudioCodecPropertyProgramTargetLevelConstant: number;

declare const kAudioCodecPropertyQualitySetting: number;

declare const kAudioCodecPropertyRecommendedBitRateRange: number;

declare const kAudioCodecPropertyRequiresPacketDescription: number;

declare const kAudioCodecPropertySettings: number;

declare const kAudioCodecPropertySoundQualityForVBR: number;

declare const kAudioCodecPropertySupportedInputFormats: number;

declare const kAudioCodecPropertySupportedOutputFormats: number;

declare const kAudioCodecPropertyUsedInputBufferSize: number;

declare const kAudioCodecPropertyZeroFramesPadded: number;

declare const kAudioCodecQuality_High: number;

declare const kAudioCodecQuality_Low: number;

declare const kAudioCodecQuality_Max: number;

declare const kAudioCodecQuality_Medium: number;

declare const kAudioCodecQuality_Min: number;

declare const kAudioCodecResetSelect: number;

declare const kAudioCodecSetPropertySelect: number;

declare const kAudioCodecStateError: number;

declare const kAudioCodecUninitializeSelect: number;

declare const kAudioCodecUnknownPropertyError: number;

declare const kAudioCodecUnspecifiedError: number;

declare const kAudioCodecUnsupportedFormatError: number;

declare const kAudioCodecUseRecommendedSampleRate: number;

declare const kAudioComponentErr_DuplicateDescription: number;

declare const kAudioComponentErr_InitializationTimedOut: number;

declare const kAudioComponentErr_InstanceInvalidated: number;

declare const kAudioComponentErr_InstanceTimedOut: number;

declare const kAudioComponentErr_InvalidFormat: number;

declare const kAudioComponentErr_NotPermitted: number;

declare const kAudioComponentErr_TooManyInstances: number;

declare const kAudioComponentErr_UnsupportedType: number;

/**
 * @since 9.0
 */
declare var kAudioComponentInstanceInvalidationNotification: string;

/**
 * @since 7.0
 */
declare var kAudioComponentRegistrationsChangedNotification: string;

declare const kAudioConverterApplicableEncodeBitRates: number;

declare const kAudioConverterApplicableEncodeSampleRates: number;

declare const kAudioConverterAvailableEncodeBitRates: number;

declare const kAudioConverterAvailableEncodeChannelLayoutTags: number;

declare const kAudioConverterAvailableEncodeSampleRates: number;

declare const kAudioConverterChannelMap: number;

declare const kAudioConverterCodecQuality: number;

declare const kAudioConverterCompressionMagicCookie: number;

declare const kAudioConverterCurrentInputStreamDescription: number;

declare const kAudioConverterCurrentOutputStreamDescription: number;

declare const kAudioConverterDecompressionMagicCookie: number;

declare const kAudioConverterEncodeAdjustableSampleRate: number;

declare const kAudioConverterEncodeBitRate: number;

declare const kAudioConverterErr_BadPropertySizeError: number;

declare const kAudioConverterErr_FormatNotSupported: number;

declare const kAudioConverterErr_HardwareInUse: number;

declare const kAudioConverterErr_InputSampleRateOutOfRange: number;

declare const kAudioConverterErr_InvalidInputSize: number;

declare const kAudioConverterErr_InvalidOutputSize: number;

declare const kAudioConverterErr_NoHardwarePermission: number;

declare const kAudioConverterErr_OperationNotSupported: number;

declare const kAudioConverterErr_OutputSampleRateOutOfRange: number;

declare const kAudioConverterErr_PropertyNotSupported: number;

declare const kAudioConverterErr_RequiresPacketDescriptionsError: number;

declare const kAudioConverterErr_UnspecifiedError: number;

declare const kAudioConverterInputChannelLayout: number;

declare const kAudioConverterOutputChannelLayout: number;

declare const kAudioConverterPrimeInfo: number;

declare const kAudioConverterPrimeMethod: number;

declare const kAudioConverterPropertyBitDepthHint: number;

declare const kAudioConverterPropertyCalculateInputBufferSize: number;

declare const kAudioConverterPropertyCalculateOutputBufferSize: number;

declare const kAudioConverterPropertyCanResumeFromInterruption: number;

declare const kAudioConverterPropertyFormatList: number;

declare const kAudioConverterPropertyInputCodecParameters: number;

declare const kAudioConverterPropertyMaximumInputBufferSize: number;

declare const kAudioConverterPropertyMaximumInputPacketSize: number;

declare const kAudioConverterPropertyMaximumOutputPacketSize: number;

declare const kAudioConverterPropertyMinimumInputBufferSize: number;

declare const kAudioConverterPropertyMinimumOutputBufferSize: number;

declare const kAudioConverterPropertyOutputCodecParameters: number;

declare const kAudioConverterPropertySettings: number;

declare const kAudioConverterQuality_High: number;

declare const kAudioConverterQuality_Low: number;

declare const kAudioConverterQuality_Max: number;

declare const kAudioConverterQuality_Medium: number;

declare const kAudioConverterQuality_Min: number;

declare const kAudioConverterSampleRateConverterAlgorithm: number;

declare const kAudioConverterSampleRateConverterComplexity: number;

declare const kAudioConverterSampleRateConverterComplexity_Linear: number;

declare const kAudioConverterSampleRateConverterComplexity_Mastering: number;

declare const kAudioConverterSampleRateConverterComplexity_MinimumPhase: number;

declare const kAudioConverterSampleRateConverterComplexity_Normal: number;

declare const kAudioConverterSampleRateConverterInitialPhase: number;

declare const kAudioConverterSampleRateConverterQuality: number;

declare const kAudioDecoderComponentType: number;

declare const kAudioEncoderComponentType: number;

declare const kAudioFile3GP2Type: number;

declare const kAudioFile3GPType: number;

declare const kAudioFileAAC_ADTSType: number;

declare const kAudioFileAC3Type: number;

declare const kAudioFileAIFCType: number;

declare const kAudioFileAIFFType: number;

declare const kAudioFileAMRType: number;

declare const kAudioFileBW64Type: number;

declare const kAudioFileBadPropertySizeError: number;

declare const kAudioFileCAFType: number;

declare const kAudioFileDoesNotAllow64BitDataSizeError: number;

declare const kAudioFileEndOfFileError: number;

declare const kAudioFileFLACType: number;

declare const kAudioFileFileNotFoundError: number;

declare const kAudioFileGlobalInfo_AllExtensions: number;

declare const kAudioFileGlobalInfo_AllHFSTypeCodes: number;

declare const kAudioFileGlobalInfo_AllMIMETypes: number;

declare const kAudioFileGlobalInfo_AllUTIs: number;

declare const kAudioFileGlobalInfo_AvailableFormatIDs: number;

declare const kAudioFileGlobalInfo_AvailableStreamDescriptionsForFormat: number;

declare const kAudioFileGlobalInfo_ExtensionsForType: number;

declare const kAudioFileGlobalInfo_FileTypeName: number;

declare const kAudioFileGlobalInfo_HFSTypeCodesForType: number;

declare const kAudioFileGlobalInfo_MIMETypesForType: number;

declare const kAudioFileGlobalInfo_ReadableTypes: number;

declare const kAudioFileGlobalInfo_TypesForExtension: number;

declare const kAudioFileGlobalInfo_TypesForHFSTypeCode: number;

declare const kAudioFileGlobalInfo_TypesForMIMEType: number;

declare const kAudioFileGlobalInfo_TypesForUTI: number;

declare const kAudioFileGlobalInfo_UTIsForType: number;

declare const kAudioFileGlobalInfo_WritableTypes: number;

declare const kAudioFileInvalidChunkError: number;

declare const kAudioFileInvalidFileError: number;

declare const kAudioFileInvalidPacketDependencyError: number;

declare const kAudioFileInvalidPacketOffsetError: number;

declare const kAudioFileLATMInLOASType: number;

declare const kAudioFileLoopDirection_Backward: number;

declare const kAudioFileLoopDirection_Forward: number;

declare const kAudioFileLoopDirection_ForwardAndBackward: number;

declare const kAudioFileLoopDirection_NoLooping: number;

declare const kAudioFileM4AType: number;

declare const kAudioFileM4BType: number;

declare const kAudioFileMP1Type: number;

declare const kAudioFileMP2Type: number;

declare const kAudioFileMP3Type: number;

declare const kAudioFileMPEG4Type: number;

declare const kAudioFileMarkerType_Generic: number;

declare const kAudioFileNextType: number;

declare const kAudioFileNotOpenError: number;

declare const kAudioFileNotOptimizedError: number;

declare const kAudioFileOperationNotSupportedError: number;

declare const kAudioFilePermissionsError: number;

declare const kAudioFilePositionError: number;

declare const kAudioFilePropertyAlbumArtwork: number;

declare const kAudioFilePropertyAudioDataByteCount: number;

declare const kAudioFilePropertyAudioDataPacketCount: number;

declare const kAudioFilePropertyAudioTrackCount: number;

declare const kAudioFilePropertyBitRate: number;

declare const kAudioFilePropertyByteToPacket: number;

declare const kAudioFilePropertyChannelLayout: number;

declare const kAudioFilePropertyChunkIDs: number;

declare const kAudioFilePropertyDataFormat: number;

declare const kAudioFilePropertyDataFormatName: number;

declare const kAudioFilePropertyDataOffset: number;

declare const kAudioFilePropertyDeferSizeUpdates: number;

declare const kAudioFilePropertyEstimatedDuration: number;

declare const kAudioFilePropertyFileFormat: number;

declare const kAudioFilePropertyFormatList: number;

declare const kAudioFilePropertyFrameToPacket: number;

declare const kAudioFilePropertyID3Tag: number;

declare const kAudioFilePropertyID3TagOffset: number;

declare const kAudioFilePropertyInfoDictionary: number;

declare const kAudioFilePropertyIsOptimized: number;

declare const kAudioFilePropertyMagicCookieData: number;

declare const kAudioFilePropertyMarkerList: number;

declare const kAudioFilePropertyMaximumPacketSize: number;

declare const kAudioFilePropertyNextIndependentPacket: number;

declare const kAudioFilePropertyPacketRangeByteCountUpperBound: number;

declare const kAudioFilePropertyPacketSizeUpperBound: number;

declare const kAudioFilePropertyPacketTableInfo: number;

declare const kAudioFilePropertyPacketToByte: number;

declare const kAudioFilePropertyPacketToDependencyInfo: number;

declare const kAudioFilePropertyPacketToFrame: number;

declare const kAudioFilePropertyPacketToRollDistance: number;

declare const kAudioFilePropertyPreviousIndependentPacket: number;

declare const kAudioFilePropertyRegionList: number;

declare const kAudioFilePropertyReserveDuration: number;

declare const kAudioFilePropertyRestrictsRandomAccess: number;

declare const kAudioFilePropertySourceBitDepth: number;

declare const kAudioFilePropertyUseAudioTrack: number;

declare const kAudioFileRF64Type: number;

declare const kAudioFileSoundDesigner2Type: number;

declare const kAudioFileStreamError_BadPropertySize: number;

declare const kAudioFileStreamError_DataUnavailable: number;

declare const kAudioFileStreamError_DiscontinuityCantRecover: number;

declare const kAudioFileStreamError_IllegalOperation: number;

declare const kAudioFileStreamError_InvalidFile: number;

declare const kAudioFileStreamError_InvalidPacketOffset: number;

declare const kAudioFileStreamError_NotOptimized: number;

declare const kAudioFileStreamError_UnspecifiedError: number;

declare const kAudioFileStreamError_UnsupportedDataFormat: number;

declare const kAudioFileStreamError_UnsupportedFileType: number;

declare const kAudioFileStreamError_UnsupportedProperty: number;

declare const kAudioFileStreamError_ValueUnknown: number;

declare const kAudioFileStreamProperty_AudioDataByteCount: number;

declare const kAudioFileStreamProperty_AudioDataPacketCount: number;

declare const kAudioFileStreamProperty_AverageBytesPerPacket: number;

declare const kAudioFileStreamProperty_BitRate: number;

declare const kAudioFileStreamProperty_ByteToPacket: number;

declare const kAudioFileStreamProperty_ChannelLayout: number;

declare const kAudioFileStreamProperty_DataFormat: number;

declare const kAudioFileStreamProperty_DataOffset: number;

declare const kAudioFileStreamProperty_FileFormat: number;

declare const kAudioFileStreamProperty_FormatList: number;

declare const kAudioFileStreamProperty_FrameToPacket: number;

declare const kAudioFileStreamProperty_InfoDictionary: number;

declare const kAudioFileStreamProperty_MagicCookieData: number;

declare const kAudioFileStreamProperty_MaximumPacketSize: number;

declare const kAudioFileStreamProperty_NextIndependentPacket: number;

declare const kAudioFileStreamProperty_PacketSizeUpperBound: number;

declare const kAudioFileStreamProperty_PacketTableInfo: number;

declare const kAudioFileStreamProperty_PacketToByte: number;

declare const kAudioFileStreamProperty_PacketToDependencyInfo: number;

declare const kAudioFileStreamProperty_PacketToFrame: number;

declare const kAudioFileStreamProperty_PacketToRollDistance: number;

declare const kAudioFileStreamProperty_PreviousIndependentPacket: number;

declare const kAudioFileStreamProperty_ReadyToProducePackets: number;

declare const kAudioFileStreamProperty_RestrictsRandomAccess: number;

declare const kAudioFileUnspecifiedError: number;

declare const kAudioFileUnsupportedDataFormatError: number;

declare const kAudioFileUnsupportedFileTypeError: number;

declare const kAudioFileUnsupportedPropertyError: number;

declare const kAudioFileWAVEType: number;

declare const kAudioFileWave64Type: number;

declare const kAudioFormatBadPropertySizeError: number;

declare const kAudioFormatBadSpecifierSizeError: number;

declare const kAudioFormatProperty_ASBDFromESDS: number;

declare const kAudioFormatProperty_ASBDFromMPEGPacket: number;

declare const kAudioFormatProperty_AreChannelLayoutsEquivalent: number;

declare const kAudioFormatProperty_AvailableDecodeNumberChannels: number;

declare const kAudioFormatProperty_AvailableEncodeBitRates: number;

declare const kAudioFormatProperty_AvailableEncodeChannelLayoutTags: number;

declare const kAudioFormatProperty_AvailableEncodeNumberChannels: number;

declare const kAudioFormatProperty_AvailableEncodeSampleRates: number;

declare const kAudioFormatProperty_BalanceFade: number;

declare const kAudioFormatProperty_BitmapForLayoutTag: number;

declare const kAudioFormatProperty_ChannelLayoutForBitmap: number;

declare const kAudioFormatProperty_ChannelLayoutForTag: number;

declare const kAudioFormatProperty_ChannelLayoutFromESDS: number;

declare const kAudioFormatProperty_ChannelLayoutHash: number;

declare const kAudioFormatProperty_ChannelLayoutName: number;

declare const kAudioFormatProperty_ChannelLayoutSimpleName: number;

declare const kAudioFormatProperty_ChannelMap: number;

declare const kAudioFormatProperty_ChannelName: number;

declare const kAudioFormatProperty_ChannelShortName: number;

declare const kAudioFormatProperty_DecodeFormatIDs: number;

declare const kAudioFormatProperty_Decoders: number;

declare const kAudioFormatProperty_EncodeFormatIDs: number;

declare const kAudioFormatProperty_Encoders: number;

declare const kAudioFormatProperty_FirstPlayableFormatFromList: number;

declare const kAudioFormatProperty_FormatEmploysDependentPackets: number;

declare const kAudioFormatProperty_FormatInfo: number;

declare const kAudioFormatProperty_FormatIsEncrypted: number;

declare const kAudioFormatProperty_FormatIsExternallyFramed: number;

declare const kAudioFormatProperty_FormatIsVBR: number;

declare const kAudioFormatProperty_FormatList: number;

declare const kAudioFormatProperty_FormatName: number;

declare const kAudioFormatProperty_HardwareCodecCapabilities: number;

declare const kAudioFormatProperty_ID3TagSize: number;

declare const kAudioFormatProperty_ID3TagToDictionary: number;

declare const kAudioFormatProperty_MatrixMixMap: number;

declare const kAudioFormatProperty_NumberOfChannelsForLayout: number;

declare const kAudioFormatProperty_OutputFormatList: number;

declare const kAudioFormatProperty_PanningMatrix: number;

declare const kAudioFormatProperty_TagForChannelLayout: number;

declare const kAudioFormatProperty_TagsForNumberOfChannels: number;

declare const kAudioFormatProperty_ValidateChannelLayout: number;

declare const kAudioFormatUnknownFormatError: number;

declare const kAudioFormatUnspecifiedError: number;

declare const kAudioFormatUnsupportedDataFormatError: number;

declare const kAudioFormatUnsupportedPropertyError: number;

declare const kAudioOutputUnitProperty_ChannelMap: number;

declare const kAudioOutputUnitProperty_CurrentDevice: number;

declare const kAudioOutputUnitProperty_EnableIO: number;

declare const kAudioOutputUnitProperty_HasIO: number;

declare const kAudioOutputUnitProperty_HostReceivesRemoteControlEvents: number;

declare const kAudioOutputUnitProperty_HostTransportState: number;

declare const kAudioOutputUnitProperty_IsRunning: number;

declare const kAudioOutputUnitProperty_MIDICallbacks: number;

declare const kAudioOutputUnitProperty_NodeComponentDescription: number;

declare const kAudioOutputUnitProperty_OSWorkgroup: number;

declare const kAudioOutputUnitProperty_RemoteControlToHost: number;

declare const kAudioOutputUnitProperty_SetInputCallback: number;

declare const kAudioOutputUnitProperty_StartTime: number;

declare const kAudioOutputUnitProperty_StartTimestampsAtZero: number;

declare const kAudioOutputUnitRange: number;

declare const kAudioOutputUnitStartSelect: number;

declare const kAudioOutputUnitStopSelect: number;

declare const kAudioQueueDeviceProperty_NumberChannels: number;

declare const kAudioQueueDeviceProperty_SampleRate: number;

declare const kAudioQueueErr_BufferEmpty: number;

declare const kAudioQueueErr_BufferEnqueuedTwice: number;

declare const kAudioQueueErr_BufferInQueue: number;

declare const kAudioQueueErr_CannotStart: number;

declare const kAudioQueueErr_CannotStartYet: number;

declare const kAudioQueueErr_CodecNotFound: number;

declare const kAudioQueueErr_DisposalPending: number;

declare const kAudioQueueErr_EnqueueDuringReset: number;

declare const kAudioQueueErr_InvalidBuffer: number;

declare const kAudioQueueErr_InvalidCodecAccess: number;

declare const kAudioQueueErr_InvalidDevice: number;

declare const kAudioQueueErr_InvalidOfflineMode: number;

declare const kAudioQueueErr_InvalidParameter: number;

declare const kAudioQueueErr_InvalidProperty: number;

declare const kAudioQueueErr_InvalidPropertySize: number;

declare const kAudioQueueErr_InvalidPropertyValue: number;

declare const kAudioQueueErr_InvalidQueueType: number;

declare const kAudioQueueErr_InvalidRunState: number;

declare const kAudioQueueErr_InvalidTapContext: number;

declare const kAudioQueueErr_InvalidTapType: number;

declare const kAudioQueueErr_Permissions: number;

declare const kAudioQueueErr_PrimeTimedOut: number;

declare const kAudioQueueErr_QueueInvalidated: number;

declare const kAudioQueueErr_RecordUnderrun: number;

declare const kAudioQueueErr_TooManyTaps: number;

declare const kAudioQueueHardwareCodecPolicy_Default: number;

declare const kAudioQueueHardwareCodecPolicy_PreferHardware: number;

declare const kAudioQueueHardwareCodecPolicy_PreferSoftware: number;

declare const kAudioQueueHardwareCodecPolicy_UseHardwareOnly: number;

declare const kAudioQueueHardwareCodecPolicy_UseSoftwareOnly: number;

declare const kAudioQueueParam_Pan: number;

declare const kAudioQueueParam_Pitch: number;

declare const kAudioQueueParam_PlayRate: number;

declare const kAudioQueueParam_Volume: number;

declare const kAudioQueueParam_VolumeRampTime: number;

declare const kAudioQueueProperty_ChannelAssignments: number;

declare const kAudioQueueProperty_ChannelLayout: number;

declare const kAudioQueueProperty_ConverterError: number;

declare const kAudioQueueProperty_CurrentDevice: number;

declare const kAudioQueueProperty_CurrentLevelMeter: number;

declare const kAudioQueueProperty_CurrentLevelMeterDB: number;

declare const kAudioQueueProperty_DecodeBufferSizeFrames: number;

declare const kAudioQueueProperty_EnableLevelMetering: number;

declare const kAudioQueueProperty_EnableTimePitch: number;

declare const kAudioQueueProperty_HardwareCodecPolicy: number;

declare const kAudioQueueProperty_IsRunning: number;

declare const kAudioQueueProperty_MagicCookie: number;

declare const kAudioQueueProperty_MaximumOutputPacketSize: number;

declare const kAudioQueueProperty_StreamDescription: number;

declare const kAudioQueueProperty_TimePitchAlgorithm: number;

declare const kAudioQueueProperty_TimePitchBypass: number;

declare const kAudioQueueTimePitchAlgorithm_LowQualityZeroLatency: number;

declare const kAudioQueueTimePitchAlgorithm_Spectral: number;

declare const kAudioQueueTimePitchAlgorithm_TimeDomain: number;

declare const kAudioQueueTimePitchAlgorithm_Varispeed: number;

declare const kAudioServicesBadPropertySizeError: number;

declare const kAudioServicesBadSpecifierSizeError: number;

declare const kAudioServicesNoError: number;

declare const kAudioServicesNoHardwareError: number;

declare const kAudioServicesPropertyCompletePlaybackIfAppDies: number;

declare const kAudioServicesPropertyIsUISound: number;

declare const kAudioServicesSystemSoundClientTimedOutError: number;

declare const kAudioServicesSystemSoundExceededMaximumDurationError: number;

declare const kAudioServicesSystemSoundUnspecifiedError: number;

declare const kAudioServicesUnsupportedPropertyError: number;

declare const kAudioSessionAlreadyInitialized: number;

declare const kAudioSessionBadPropertySizeError: number;

declare const kAudioSessionBeginInterruption: number;

declare const kAudioSessionCategory_AmbientSound: number;

declare const kAudioSessionCategory_AudioProcessing: number;

declare const kAudioSessionCategory_LiveAudio: number;

declare const kAudioSessionCategory_MediaPlayback: number;

declare const kAudioSessionCategory_PlayAndRecord: number;

declare const kAudioSessionCategory_RecordAudio: number;

declare const kAudioSessionCategory_SoloAmbientSound: number;

declare const kAudioSessionCategory_UserInterfaceSoundEffects: number;

declare const kAudioSessionEndInterruption: number;

declare const kAudioSessionIncompatibleCategory: number;

declare const kAudioSessionInitializationError: number;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionInputRoute_BluetoothHFP: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionInputRoute_BuiltInMic: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionInputRoute_HeadsetMic: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionInputRoute_LineIn: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionInputRoute_USBAudio: string;

declare const kAudioSessionInterruptionType_ShouldNotResume: number;

declare const kAudioSessionInterruptionType_ShouldResume: number;

declare const kAudioSessionMode_Default: number;

declare const kAudioSessionMode_GameChat: number;

declare const kAudioSessionMode_Measurement: number;

declare const kAudioSessionMode_VideoRecording: number;

declare const kAudioSessionMode_VoiceChat: number;

declare const kAudioSessionNoCategorySet: number;

declare const kAudioSessionNoError: number;

declare const kAudioSessionNotActiveError: number;

declare const kAudioSessionNotInitialized: number;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionOutputRoute_AirPlay: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionOutputRoute_BluetoothA2DP: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionOutputRoute_BluetoothHFP: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionOutputRoute_BuiltInReceiver: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionOutputRoute_BuiltInSpeaker: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionOutputRoute_HDMI: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionOutputRoute_Headphones: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionOutputRoute_LineOut: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSessionOutputRoute_USBAudio: string;

declare const kAudioSessionOverrideAudioRoute_None: number;

declare const kAudioSessionOverrideAudioRoute_Speaker: number;

declare const kAudioSessionProperty_AudioCategory: number;

declare const kAudioSessionProperty_AudioInputAvailable: number;

declare const kAudioSessionProperty_AudioRoute: number;

declare const kAudioSessionProperty_AudioRouteChange: number;

declare const kAudioSessionProperty_AudioRouteDescription: number;

declare const kAudioSessionProperty_CurrentHardwareIOBufferDuration: number;

declare const kAudioSessionProperty_CurrentHardwareInputLatency: number;

declare const kAudioSessionProperty_CurrentHardwareInputNumberChannels: number;

declare const kAudioSessionProperty_CurrentHardwareOutputLatency: number;

declare const kAudioSessionProperty_CurrentHardwareOutputNumberChannels: number;

declare const kAudioSessionProperty_CurrentHardwareOutputVolume: number;

declare const kAudioSessionProperty_CurrentHardwareSampleRate: number;

declare const kAudioSessionProperty_InputGainAvailable: number;

declare const kAudioSessionProperty_InputGainScalar: number;

declare const kAudioSessionProperty_InputSource: number;

declare const kAudioSessionProperty_InputSources: number;

declare const kAudioSessionProperty_InterruptionType: number;

declare const kAudioSessionProperty_Mode: number;

declare const kAudioSessionProperty_OtherAudioIsPlaying: number;

declare const kAudioSessionProperty_OtherMixableAudioShouldDuck: number;

declare const kAudioSessionProperty_OutputDestination: number;

declare const kAudioSessionProperty_OutputDestinations: number;

declare const kAudioSessionProperty_OverrideAudioRoute: number;

declare const kAudioSessionProperty_OverrideCategoryDefaultToSpeaker: number;

declare const kAudioSessionProperty_OverrideCategoryEnableBluetoothInput: number;

declare const kAudioSessionProperty_OverrideCategoryMixWithOthers: number;

declare const kAudioSessionProperty_PreferredHardwareIOBufferDuration: number;

declare const kAudioSessionProperty_PreferredHardwareSampleRate: number;

declare const kAudioSessionProperty_ServerDied: number;

declare const kAudioSessionRouteChangeReason_CategoryChange: number;

declare const kAudioSessionRouteChangeReason_NewDeviceAvailable: number;

declare const kAudioSessionRouteChangeReason_NoSuitableRouteForCategory: number;

declare const kAudioSessionRouteChangeReason_OldDeviceUnavailable: number;

declare const kAudioSessionRouteChangeReason_Override: number;

declare const kAudioSessionRouteChangeReason_RouteConfigurationChange: number;

declare const kAudioSessionRouteChangeReason_Unknown: number;

declare const kAudioSessionRouteChangeReason_WakeFromSleep: number;

declare const kAudioSessionSetActiveFlag_NotifyOthersOnDeactivation: number;

declare const kAudioSessionUnspecifiedError: number;

declare const kAudioSessionUnsupportedPropertyError: number;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSession_AudioRouteChangeKey_CurrentRouteDescription: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSession_AudioRouteChangeKey_PreviousRouteDescription: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSession_AudioRouteKey_Inputs: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSession_AudioRouteKey_Outputs: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSession_AudioRouteKey_Type: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSession_InputSourceKey_Description: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSession_InputSourceKey_ID: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSession_OutputDestinationKey_Description: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSession_OutputDestinationKey_ID: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kAudioSession_RouteChangeKey_Reason: string;

declare const kAudioToolboxErr_CannotDoInCurrentContext: number;

declare const kAudioToolboxErr_EndOfTrack: number;

declare const kAudioToolboxErr_IllegalTrackDestination: number;

declare const kAudioToolboxErr_InvalidEventType: number;

declare const kAudioToolboxErr_InvalidPlayerState: number;

declare const kAudioToolboxErr_InvalidSequenceType: number;

declare const kAudioToolboxErr_NoSequence: number;

declare const kAudioToolboxErr_StartOfTrack: number;

declare const kAudioToolboxErr_TrackIndexError: number;

declare const kAudioToolboxErr_TrackNotFound: number;

declare const kAudioToolboxError_NoTrackDestination: number;

declare const kAudioUnitAddPropertyListenerSelect: number;

declare const kAudioUnitAddRenderNotifySelect: number;

declare const kAudioUnitClumpID_System: number;

declare const kAudioUnitComplexRenderSelect: number;

declare const kAudioUnitErr_CannotDoInCurrentContext: number;

declare const kAudioUnitErr_ComponentManagerNotSupported: number;

declare const kAudioUnitErr_ExtensionNotFound: number;

declare const kAudioUnitErr_FailedInitialization: number;

declare const kAudioUnitErr_FileNotSpecified: number;

declare const kAudioUnitErr_FormatNotSupported: number;

declare const kAudioUnitErr_IllegalInstrument: number;

declare const kAudioUnitErr_Initialized: number;

declare const kAudioUnitErr_InstrumentTypeNotFound: number;

declare const kAudioUnitErr_InvalidElement: number;

declare const kAudioUnitErr_InvalidFile: number;

declare const kAudioUnitErr_InvalidFilePath: number;

declare const kAudioUnitErr_InvalidOfflineRender: number;

declare const kAudioUnitErr_InvalidParameter: number;

declare const kAudioUnitErr_InvalidParameterValue: number;

declare const kAudioUnitErr_InvalidProperty: number;

declare const kAudioUnitErr_InvalidPropertyValue: number;

declare const kAudioUnitErr_InvalidScope: number;

declare const kAudioUnitErr_MIDIOutputBufferFull: number;

declare const kAudioUnitErr_MissingKey: number;

declare const kAudioUnitErr_NoConnection: number;

declare const kAudioUnitErr_PropertyNotInUse: number;

declare const kAudioUnitErr_PropertyNotWritable: number;

declare const kAudioUnitErr_RenderTimeout: number;

declare const kAudioUnitErr_TooManyFramesToProcess: number;

declare const kAudioUnitErr_Unauthorized: number;

declare const kAudioUnitErr_Uninitialized: number;

declare const kAudioUnitErr_UnknownFileType: number;

declare const kAudioUnitGetParameterSelect: number;

declare const kAudioUnitGetPropertyInfoSelect: number;

declare const kAudioUnitGetPropertySelect: number;

declare const kAudioUnitInitializeSelect: number;

declare const kAudioUnitManufacturer_Apple: number;

declare const kAudioUnitParameterName_Full: number;

declare const kAudioUnitProcessMultipleSelect: number;

declare const kAudioUnitProcessSelect: number;

declare const kAudioUnitProperty_3DMixerAttenuationCurve: number;

declare const kAudioUnitProperty_3DMixerDistanceAtten: number;

declare const kAudioUnitProperty_3DMixerDistanceParams: number;

declare const kAudioUnitProperty_3DMixerRenderingFlags: number;

declare const kAudioUnitProperty_AudioChannelLayout: number;

declare const kAudioUnitProperty_AudioUnitMIDIProtocol: number;

declare const kAudioUnitProperty_BypassEffect: number;

declare const kAudioUnitProperty_CPULoad: number;

declare const kAudioUnitProperty_ClassInfo: number;

declare const kAudioUnitProperty_ClassInfoFromDocument: number;

declare const kAudioUnitProperty_ContextName: number;

declare const kAudioUnitProperty_CurrentPlayTime: number;

declare const kAudioUnitProperty_DeferredRendererExtraLatency: number;

declare const kAudioUnitProperty_DeferredRendererPullSize: number;

declare const kAudioUnitProperty_DeferredRendererWaitFrames: number;

declare const kAudioUnitProperty_DependentParameters: number;

declare const kAudioUnitProperty_DopplerShift: number;

declare const kAudioUnitProperty_ElementCount: number;

declare const kAudioUnitProperty_ElementName: number;

declare const kAudioUnitProperty_FactoryPresets: number;

declare const kAudioUnitProperty_FrequencyResponse: number;

declare const kAudioUnitProperty_HostCallbacks: number;

declare const kAudioUnitProperty_HostMIDIProtocol: number;

declare const kAudioUnitProperty_InPlaceProcessing: number;

declare const kAudioUnitProperty_InputAnchorTimeStamp: number;

declare const kAudioUnitProperty_InputSamplesInOutput: number;

declare const kAudioUnitProperty_IsInterAppConnected: number;

declare const kAudioUnitProperty_LastRenderError: number;

declare const kAudioUnitProperty_LastRenderSampleTime: number;

declare const kAudioUnitProperty_Latency: number;

declare const kAudioUnitProperty_LoadedOutOfProcess: number;

declare const kAudioUnitProperty_MIDIOutputBufferSizeHint: number;

declare const kAudioUnitProperty_MIDIOutputCallback: number;

declare const kAudioUnitProperty_MIDIOutputCallbackInfo: number;

declare const kAudioUnitProperty_MIDIOutputEventListCallback: number;

declare const kAudioUnitProperty_MakeConnection: number;

declare const kAudioUnitProperty_MatrixDimensions: number;

declare const kAudioUnitProperty_MatrixLevels: number;

declare const kAudioUnitProperty_MaximumFramesPerSlice: number;

declare const kAudioUnitProperty_MeterClipping: number;

declare const kAudioUnitProperty_MeteringMode: number;

declare const kAudioUnitProperty_NickName: number;

declare const kAudioUnitProperty_OfflineRender: number;

declare const kAudioUnitProperty_ParameterClumpName: number;

declare const kAudioUnitProperty_ParameterHistoryInfo: number;

declare const kAudioUnitProperty_ParameterIDName: number;

declare const kAudioUnitProperty_ParameterInfo: number;

declare const kAudioUnitProperty_ParameterList: number;

declare const kAudioUnitProperty_ParameterStringFromValue: number;

declare const kAudioUnitProperty_ParameterValueFromString: number;

declare const kAudioUnitProperty_ParameterValueStrings: number;

declare const kAudioUnitProperty_ParametersForOverview: number;

declare const kAudioUnitProperty_PeerURL: number;

declare const kAudioUnitProperty_PresentPreset: number;

declare const kAudioUnitProperty_PresentationLatency: number;

declare const kAudioUnitProperty_RemoteControlEventListener: number;

declare const kAudioUnitProperty_RenderContextObserver: number;

declare const kAudioUnitProperty_RenderQuality: number;

declare const kAudioUnitProperty_RequestViewController: number;

declare const kAudioUnitProperty_ReverbPreset: number;

declare const kAudioUnitProperty_ReverbRoomType: number;

declare const kAudioUnitProperty_SampleRate: number;

declare const kAudioUnitProperty_SampleRateConverterComplexity: number;

declare const kAudioUnitProperty_ScheduleAudioSlice: number;

declare const kAudioUnitProperty_ScheduleStartTimeStamp: number;

declare const kAudioUnitProperty_ScheduledFileBufferSizeFrames: number;

declare const kAudioUnitProperty_ScheduledFileIDs: number;

declare const kAudioUnitProperty_ScheduledFileNumberBuffers: number;

declare const kAudioUnitProperty_ScheduledFilePrime: number;

declare const kAudioUnitProperty_ScheduledFileRegion: number;

declare const kAudioUnitProperty_SetRenderCallback: number;

declare const kAudioUnitProperty_ShouldAllocateBuffer: number;

declare const kAudioUnitProperty_SpatialMixerAnyInputIsUsingPersonalizedHRTF: number;

declare const kAudioUnitProperty_SpatialMixerAttenuationCurve: number;

declare const kAudioUnitProperty_SpatialMixerDistanceParams: number;

declare const kAudioUnitProperty_SpatialMixerEnableHeadTracking: number;

declare const kAudioUnitProperty_SpatialMixerOutputType: number;

declare const kAudioUnitProperty_SpatialMixerPersonalizedHRTFMode: number;

declare const kAudioUnitProperty_SpatialMixerPointSourceInHeadMode: number;

declare const kAudioUnitProperty_SpatialMixerRenderingFlags: number;

declare const kAudioUnitProperty_SpatialMixerSourceMode: number;

declare const kAudioUnitProperty_SpatializationAlgorithm: number;

declare const kAudioUnitProperty_StreamFormat: number;

declare const kAudioUnitProperty_SupportedChannelLayoutTags: number;

declare const kAudioUnitProperty_SupportedNumChannels: number;

declare const kAudioUnitProperty_SupportsMPE: number;

declare const kAudioUnitProperty_TailTime: number;

declare const kAudioUnitProperty_UsesInternalReverb: number;

declare const kAudioUnitRange: number;

declare const kAudioUnitRemovePropertyListenerSelect: number;

declare const kAudioUnitRemovePropertyListenerWithUserDataSelect: number;

declare const kAudioUnitRemoveRenderNotifySelect: number;

declare const kAudioUnitRenderSelect: number;

declare const kAudioUnitResetSelect: number;

declare const kAudioUnitSampleRateConverterComplexity_Linear: number;

declare const kAudioUnitSampleRateConverterComplexity_Mastering: number;

declare const kAudioUnitSampleRateConverterComplexity_Normal: number;

declare const kAudioUnitScheduleParametersSelect: number;

declare const kAudioUnitScope_Global: number;

declare const kAudioUnitScope_Group: number;

declare const kAudioUnitScope_Input: number;

declare const kAudioUnitScope_Layer: number;

declare const kAudioUnitScope_LayerItem: number;

declare const kAudioUnitScope_Note: number;

declare const kAudioUnitScope_Output: number;

declare const kAudioUnitScope_Part: number;

declare const kAudioUnitSetParameterSelect: number;

declare const kAudioUnitSetPropertySelect: number;

declare const kAudioUnitSubType_AU3DMixerEmbedded: number;

declare const kAudioUnitSubType_AUConverter: number;

declare const kAudioUnitSubType_AUSoundIsolation: number;

declare const kAudioUnitSubType_AUiPodEQ: number;

declare const kAudioUnitSubType_AUiPodTime: number;

declare const kAudioUnitSubType_AUiPodTimeOther: number;

declare const kAudioUnitSubType_AudioFilePlayer: number;

declare const kAudioUnitSubType_BandPassFilter: number;

declare const kAudioUnitSubType_DeferredRenderer: number;

declare const kAudioUnitSubType_Delay: number;

declare const kAudioUnitSubType_Distortion: number;

declare const kAudioUnitSubType_DynamicsProcessor: number;

declare const kAudioUnitSubType_GenericOutput: number;

declare const kAudioUnitSubType_HighPassFilter: number;

declare const kAudioUnitSubType_HighShelfFilter: number;

declare const kAudioUnitSubType_LowPassFilter: number;

declare const kAudioUnitSubType_LowShelfFilter: number;

declare const kAudioUnitSubType_MIDISynth: number;

declare const kAudioUnitSubType_MatrixMixer: number;

declare const kAudioUnitSubType_Merger: number;

declare const kAudioUnitSubType_MultiChannelMixer: number;

declare const kAudioUnitSubType_MultiSplitter: number;

declare const kAudioUnitSubType_NBandEQ: number;

declare const kAudioUnitSubType_NewTimePitch: number;

declare const kAudioUnitSubType_ParametricEQ: number;

declare const kAudioUnitSubType_PeakLimiter: number;

declare const kAudioUnitSubType_RemoteIO: number;

declare const kAudioUnitSubType_Reverb2: number;

declare const kAudioUnitSubType_RoundTripAAC: number;

declare const kAudioUnitSubType_SampleDelay: number;

declare const kAudioUnitSubType_Sampler: number;

declare const kAudioUnitSubType_ScheduledSoundPlayer: number;

declare const kAudioUnitSubType_SpatialMixer: number;

declare const kAudioUnitSubType_Splitter: number;

declare const kAudioUnitSubType_TimePitch: number;

declare const kAudioUnitSubType_Varispeed: number;

declare const kAudioUnitSubType_VoiceProcessingIO: number;

declare const kAudioUnitType_Effect: number;

declare const kAudioUnitType_FormatConverter: number;

declare const kAudioUnitType_Generator: number;

declare const kAudioUnitType_MIDIProcessor: number;

declare const kAudioUnitType_Mixer: number;

declare const kAudioUnitType_MusicDevice: number;

declare const kAudioUnitType_MusicEffect: number;

declare const kAudioUnitType_OfflineEffect: number;

declare const kAudioUnitType_Output: number;

declare const kAudioUnitType_Panner: number;

declare const kAudioUnitType_RemoteEffect: number;

declare const kAudioUnitType_RemoteGenerator: number;

declare const kAudioUnitType_RemoteInstrument: number;

declare const kAudioUnitType_RemoteMusicEffect: number;

declare const kAudioUnitType_SpeechSynthesizer: number;

declare const kAudioUnitUninitializeSelect: number;

declare const kBandpassParam_Bandwidth: number;

declare const kBandpassParam_CenterFrequency: number;

declare const kCAFMarkerType_EditDestinationBegin: number;

declare const kCAFMarkerType_EditDestinationEnd: number;

declare const kCAFMarkerType_EditSourceBegin: number;

declare const kCAFMarkerType_EditSourceEnd: number;

declare const kCAFMarkerType_Generic: number;

declare const kCAFMarkerType_Index: number;

declare const kCAFMarkerType_KeySignature: number;

declare const kCAFMarkerType_ProgramEnd: number;

declare const kCAFMarkerType_ProgramStart: number;

declare const kCAFMarkerType_RegionEnd: number;

declare const kCAFMarkerType_RegionStart: number;

declare const kCAFMarkerType_RegionSyncPoint: number;

declare const kCAFMarkerType_ReleaseLoopEnd: number;

declare const kCAFMarkerType_ReleaseLoopStart: number;

declare const kCAFMarkerType_SavedPlayPosition: number;

declare const kCAFMarkerType_SelectionEnd: number;

declare const kCAFMarkerType_SelectionStart: number;

declare const kCAFMarkerType_SustainLoopEnd: number;

declare const kCAFMarkerType_SustainLoopStart: number;

declare const kCAFMarkerType_Tempo: number;

declare const kCAFMarkerType_TimeSignature: number;

declare const kCAFMarkerType_TrackEnd: number;

declare const kCAFMarkerType_TrackStart: number;

declare const kCAF_AudioDataChunkID: number;

declare const kCAF_ChannelLayoutChunkID: number;

declare const kCAF_EditCommentsChunkID: number;

declare const kCAF_FileType: number;

declare const kCAF_FileVersion_Initial: number;

declare const kCAF_FillerChunkID: number;

declare const kCAF_FormatListID: number;

declare const kCAF_InfoStringsChunkID: number;

declare const kCAF_InstrumentChunkID: number;

declare const kCAF_MIDIChunkID: number;

declare const kCAF_MagicCookieID: number;

declare const kCAF_MarkerChunkID: number;

declare const kCAF_OverviewChunkID: number;

declare const kCAF_PacketTableChunkID: number;

declare const kCAF_PeakChunkID: number;

declare const kCAF_RegionChunkID: number;

declare const kCAF_SMPTE_TimeType2398: number;

declare const kCAF_SMPTE_TimeType24: number;

declare const kCAF_SMPTE_TimeType25: number;

declare const kCAF_SMPTE_TimeType2997: number;

declare const kCAF_SMPTE_TimeType2997Drop: number;

declare const kCAF_SMPTE_TimeType30: number;

declare const kCAF_SMPTE_TimeType30Drop: number;

declare const kCAF_SMPTE_TimeType50: number;

declare const kCAF_SMPTE_TimeType5994: number;

declare const kCAF_SMPTE_TimeType5994Drop: number;

declare const kCAF_SMPTE_TimeType60: number;

declare const kCAF_SMPTE_TimeType60Drop: number;

declare const kCAF_SMPTE_TimeTypeNone: number;

declare const kCAF_StreamDescriptionChunkID: number;

declare const kCAF_StringsChunkID: number;

declare const kCAF_UMIDChunkID: number;

declare const kCAF_UUIDChunkID: number;

declare const kCAF_iXMLChunkID: number;

declare const kConverterPrimeMethod_None: number;

declare const kConverterPrimeMethod_Normal: number;

declare const kConverterPrimeMethod_Pre: number;

declare const kDelayParam_DelayTime: number;

declare const kDelayParam_Feedback: number;

declare const kDelayParam_LopassCutoff: number;

declare const kDelayParam_WetDryMix: number;

declare const kDistortionParam_CubicTerm: number;

declare const kDistortionParam_Decay: number;

declare const kDistortionParam_Decimation: number;

declare const kDistortionParam_DecimationMix: number;

declare const kDistortionParam_Delay: number;

declare const kDistortionParam_DelayMix: number;

declare const kDistortionParam_FinalMix: number;

declare const kDistortionParam_LinearTerm: number;

declare const kDistortionParam_PolynomialMix: number;

declare const kDistortionParam_RingModBalance: number;

declare const kDistortionParam_RingModFreq1: number;

declare const kDistortionParam_RingModFreq2: number;

declare const kDistortionParam_RingModMix: number;

declare const kDistortionParam_Rounding: number;

declare const kDistortionParam_SoftClipGain: number;

declare const kDistortionParam_SquaredTerm: number;

declare const kDynamicRangeCompressionProfile_GeneralCompression: number;

declare const kDynamicRangeCompressionProfile_LateNight: number;

declare const kDynamicRangeCompressionProfile_LimitedPlaybackRange: number;

declare const kDynamicRangeCompressionProfile_NoisyEnvironment: number;

declare const kDynamicRangeCompressionProfile_None: number;

declare const kDynamicRangeControlMode_Heavy: number;

declare const kDynamicRangeControlMode_Light: number;

declare const kDynamicRangeControlMode_None: number;

declare const kDynamicsProcessorParam_AttackTime: number;

declare const kDynamicsProcessorParam_CompressionAmount: number;

declare const kDynamicsProcessorParam_ExpansionRatio: number;

declare const kDynamicsProcessorParam_ExpansionThreshold: number;

declare const kDynamicsProcessorParam_HeadRoom: number;

declare const kDynamicsProcessorParam_InputAmplitude: number;

declare const kDynamicsProcessorParam_MasterGain: number;

declare const kDynamicsProcessorParam_OutputAmplitude: number;

declare const kDynamicsProcessorParam_OverallGain: number;

declare const kDynamicsProcessorParam_ReleaseTime: number;

declare const kDynamicsProcessorParam_Threshold: number;

declare const kExtAudioFileError_AsyncWriteBufferOverflow: number;

declare const kExtAudioFileError_AsyncWriteTooLarge: number;

declare const kExtAudioFileError_CodecUnavailableInputConsumed: number;

declare const kExtAudioFileError_CodecUnavailableInputNotConsumed: number;

declare const kExtAudioFileError_InvalidChannelMap: number;

declare const kExtAudioFileError_InvalidDataFormat: number;

declare const kExtAudioFileError_InvalidOperationOrder: number;

declare const kExtAudioFileError_InvalidProperty: number;

declare const kExtAudioFileError_InvalidPropertySize: number;

declare const kExtAudioFileError_InvalidSeek: number;

declare const kExtAudioFileError_MaxPacketSizeUnknown: number;

declare const kExtAudioFileError_NonPCMClientFormat: number;

declare const kExtAudioFilePacketTableInfoOverride_UseFileValue: number;

declare const kExtAudioFilePacketTableInfoOverride_UseFileValueIfValid: number;

declare const kExtAudioFileProperty_AudioConverter: number;

declare const kExtAudioFileProperty_AudioFile: number;

declare const kExtAudioFileProperty_ClientChannelLayout: number;

declare const kExtAudioFileProperty_ClientDataFormat: number;

declare const kExtAudioFileProperty_ClientMaxPacketSize: number;

declare const kExtAudioFileProperty_CodecManufacturer: number;

declare const kExtAudioFileProperty_ConverterConfig: number;

declare const kExtAudioFileProperty_FileChannelLayout: number;

declare const kExtAudioFileProperty_FileDataFormat: number;

declare const kExtAudioFileProperty_FileLengthFrames: number;

declare const kExtAudioFileProperty_FileMaxPacketSize: number;

declare const kExtAudioFileProperty_IOBuffer: number;

declare const kExtAudioFileProperty_IOBufferSizeBytes: number;

declare const kExtAudioFileProperty_PacketTable: number;

declare const kHALOutputParam_Volume: number;

declare const kHighShelfParam_CutOffFrequency: number;

declare const kHighShelfParam_Gain: number;

declare const kHintAdvanced: number;

declare const kHintBasic: number;

declare const kHintHidden: number;

declare const kHipassParam_CutoffFrequency: number;

declare const kHipassParam_Resonance: number;

declare const kInstrumentType_AUPreset: number;

declare const kInstrumentType_Audiofile: number;

declare const kInstrumentType_DLSPreset: number;

declare const kInstrumentType_EXS24: number;

declare const kInstrumentType_SF2Preset: number;

declare const kLimiterParam_AttackTime: number;

declare const kLimiterParam_DecayTime: number;

declare const kLimiterParam_PreGain: number;

declare const kLowPassParam_CutoffFrequency: number;

declare const kLowPassParam_Resonance: number;

declare const kMatrixMixerParam_Enable: number;

declare const kMatrixMixerParam_PostAveragePower: number;

declare const kMatrixMixerParam_PostAveragePowerLinear: number;

declare const kMatrixMixerParam_PostPeakHoldLevel: number;

declare const kMatrixMixerParam_PostPeakHoldLevelLinear: number;

declare const kMatrixMixerParam_PreAveragePower: number;

declare const kMatrixMixerParam_PreAveragePowerLinear: number;

declare const kMatrixMixerParam_PrePeakHoldLevel: number;

declare const kMatrixMixerParam_PrePeakHoldLevelLinear: number;

declare const kMatrixMixerParam_Volume: number;

declare const kMultiChannelMixerParam_Enable: number;

declare const kMultiChannelMixerParam_Pan: number;

declare const kMultiChannelMixerParam_PostAveragePower: number;

declare const kMultiChannelMixerParam_PostPeakHoldLevel: number;

declare const kMultiChannelMixerParam_PreAveragePower: number;

declare const kMultiChannelMixerParam_PrePeakHoldLevel: number;

declare const kMultiChannelMixerParam_Volume: number;

declare const kMusicDeviceMIDIEventListSelect: number;

declare const kMusicDeviceMIDIEventSelect: number;

declare const kMusicDevicePrepareInstrumentSelect: number;

declare const kMusicDeviceProperty_BankName: number;

declare const kMusicDeviceProperty_InstrumentCount: number;

declare const kMusicDeviceProperty_InstrumentName: number;

declare const kMusicDeviceProperty_InstrumentNumber: number;

declare const kMusicDeviceProperty_SoundBankURL: number;

declare const kMusicDeviceRange: number;

declare const kMusicDeviceReleaseInstrumentSelect: number;

declare const kMusicDeviceStartNoteSelect: number;

declare const kMusicDeviceStopNoteSelect: number;

declare const kMusicDeviceSysExSelect: number;

declare const kMusicEventType_AUPreset: number;

declare const kMusicEventType_ExtendedNote: number;

declare const kMusicEventType_ExtendedTempo: number;

declare const kMusicEventType_MIDIChannelMessage: number;

declare const kMusicEventType_MIDINoteMessage: number;

declare const kMusicEventType_MIDIRawData: number;

declare const kMusicEventType_Meta: number;

declare const kMusicEventType_NULL: number;

declare const kMusicEventType_Parameter: number;

declare const kMusicEventType_User: number;

declare const kMusicNoteEvent_Unused: number;

declare const kMusicNoteEvent_UseGroupInstrument: number;

declare const kNewTimePitchParam_EnablePeakLocking: number;

declare const kNewTimePitchParam_EnableSpectralCoherence: number;

declare const kNewTimePitchParam_EnableTransientPreservation: number;

declare const kNewTimePitchParam_Overlap: number;

declare const kNewTimePitchParam_Pitch: number;

declare const kNewTimePitchParam_Rate: number;

declare const kNewTimePitchParam_Smoothness: number;

declare const kNumAUNBandEQFilterTypes: number;

declare const kNumberOfResponseFrequencies: number;

declare const kParametricEQParam_CenterFreq: number;

declare const kParametricEQParam_Gain: number;

declare const kParametricEQParam_Q: number;

declare const kProgramTargetLevel_Minus20dB: number;

declare const kProgramTargetLevel_Minus23dB: number;

declare const kProgramTargetLevel_Minus31dB: number;

declare const kProgramTargetLevel_None: number;

declare const kRandomParam_BoundA: number;

declare const kRandomParam_BoundB: number;

declare const kRandomParam_Curve: number;

declare const kRenderQuality_High: number;

declare const kRenderQuality_Low: number;

declare const kRenderQuality_Max: number;

declare const kRenderQuality_Medium: number;

declare const kRenderQuality_Min: number;

declare const kReverb2Param_DecayTimeAt0Hz: number;

declare const kReverb2Param_DecayTimeAtNyquist: number;

declare const kReverb2Param_DryWetMix: number;

declare const kReverb2Param_Gain: number;

declare const kReverb2Param_MaxDelayTime: number;

declare const kReverb2Param_MinDelayTime: number;

declare const kReverb2Param_RandomizeReflections: number;

declare const kReverbParam_FilterBandwidth: number;

declare const kReverbParam_FilterEnable: number;

declare const kReverbParam_FilterFrequency: number;

declare const kReverbParam_FilterGain: number;

declare const kReverbParam_FilterType: number;

declare const kRoundTripAACParam_EncodingStrategy: number;

declare const kRoundTripAACParam_Format: number;

declare const kRoundTripAACParam_RateOrQuality: number;

declare const kSampleDelayParam_DelayFrames: number;

declare const kSequenceTrackProperty_AutomatedParameters: number;

declare const kSequenceTrackProperty_LoopInfo: number;

declare const kSequenceTrackProperty_MuteStatus: number;

declare const kSequenceTrackProperty_OffsetTime: number;

declare const kSequenceTrackProperty_SoloStatus: number;

declare const kSequenceTrackProperty_TimeResolution: number;

declare const kSequenceTrackProperty_TrackLength: number;

declare const kSpatialMixerParam_Azimuth: number;

declare const kSpatialMixerParam_Distance: number;

declare const kSpatialMixerParam_Elevation: number;

declare const kSpatialMixerParam_Enable: number;

declare const kSpatialMixerParam_Gain: number;

declare const kSpatialMixerParam_GlobalReverbGain: number;

declare const kSpatialMixerParam_HeadPitch: number;

declare const kSpatialMixerParam_HeadRoll: number;

declare const kSpatialMixerParam_HeadYaw: number;

declare const kSpatialMixerParam_MaxGain: number;

declare const kSpatialMixerParam_MinGain: number;

declare const kSpatialMixerParam_ObstructionAttenuation: number;

declare const kSpatialMixerParam_OcclusionAttenuation: number;

declare const kSpatialMixerParam_PlaybackRate: number;

declare const kSpatialMixerParam_ReverbBlend: number;

declare const kSystemSoundID_Vibrate: number;

declare const kTimePitchParam_EffectBlend: number;

declare const kTimePitchParam_Pitch: number;

declare const kTimePitchParam_Rate: number;

declare const kVarispeedParam_PlaybackCents: number;

declare const kVarispeedParam_PlaybackRate: number;
