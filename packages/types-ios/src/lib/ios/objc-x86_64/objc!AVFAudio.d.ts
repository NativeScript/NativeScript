
/**
 * @since 16.0
 */
declare class AVAUPresetEvent extends AVMusicEvent {

	static alloc(): AVAUPresetEvent; // inherited from NSObject

	static new(): AVAUPresetEvent; // inherited from NSObject

	element: number;

	readonly presetDictionary: NSDictionary<any, any>;

	scope: number;

	constructor(o: { scope: number; element: number; dictionary: NSDictionary<any, any>; });

	initWithScopeElementDictionary(scope: number, element: number, presetDictionary: NSDictionary<any, any>): this;
}

interface AVAudio3DAngularOrientation {
	yaw: number;
	pitch: number;
	roll: number;
}
declare var AVAudio3DAngularOrientation: interop.StructType<AVAudio3DAngularOrientation>;

interface AVAudio3DMixing extends NSObjectProtocol {

	obstruction: number;

	occlusion: number;

	/**
	 * @since 13.0
	 */
	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode;

	position: AVAudio3DPoint;

	rate: number;

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm;

	reverbBlend: number;

	/**
	 * @since 13.0
	 */
	sourceMode: AVAudio3DMixingSourceMode;
}
declare var AVAudio3DMixing: {

	prototype: AVAudio3DMixing;
};

/**
 * @since 13.0
 */
declare const enum AVAudio3DMixingPointSourceInHeadMode {

	Mono = 0,

	Bypass = 1
}

/**
 * @since 8.0
 */
declare const enum AVAudio3DMixingRenderingAlgorithm {

	EqualPowerPanning = 0,

	SphericalHead = 1,

	HRTF = 2,

	SoundField = 3,

	StereoPassThrough = 5,

	HRTFHQ = 6,

	Auto = 7
}

/**
 * @since 13.0
 */
declare const enum AVAudio3DMixingSourceMode {

	SpatializeIfMono = 0,

	Bypass = 1,

	PointSource = 2,

	AmbienceBed = 3
}

interface AVAudio3DPoint {
	x: number;
	y: number;
	z: number;
}
declare var AVAudio3DPoint: interop.StructType<AVAudio3DPoint>;

interface AVAudio3DVectorOrientation {
	forward: AVAudio3DPoint;
	up: AVAudio3DPoint;
}
declare var AVAudio3DVectorOrientation: interop.StructType<AVAudio3DVectorOrientation>;

/**
 * @since 17.0
 */
declare class AVAudioApplication extends NSObject {

	static alloc(): AVAudioApplication; // inherited from NSObject

	static new(): AVAudioApplication; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static requestRecordPermissionWithCompletionHandler(response: (p1: boolean) => void): void;

	/**
	 * @since 17.0
	 */
	readonly inputMuted: boolean;

	/**
	 * @since 17.0
	 */
	readonly recordPermission: AVAudioApplicationRecordPermission;

	static readonly sharedInstance: AVAudioApplication;

	/**
	 * @since 17.0
	 */
	setInputMutedError(muted: boolean): boolean;
}

/**
 * @since 17.0
 */
declare var AVAudioApplicationInputMuteStateChangeNotification: string;

/**
 * @since 17.0
 */
declare var AVAudioApplicationMuteStateKey: string;

declare const enum AVAudioApplicationRecordPermission {

	Undetermined = 1970168948,

	Denied = 1684369017,

	Granted = 1735552628
}

/**
 * @since 7.0
 */
declare var AVAudioBitRateStrategy_Constant: string;

/**
 * @since 7.0
 */
declare var AVAudioBitRateStrategy_LongTermAverage: string;

/**
 * @since 7.0
 */
declare var AVAudioBitRateStrategy_Variable: string;

/**
 * @since 7.0
 */
declare var AVAudioBitRateStrategy_VariableConstrained: string;

/**
 * @since 8.0
 */
declare class AVAudioBuffer extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVAudioBuffer; // inherited from NSObject

	static new(): AVAudioBuffer; // inherited from NSObject

	readonly audioBufferList: interop.Pointer | interop.Reference<AudioBufferList>;

	readonly format: AVAudioFormat;

	readonly mutableAudioBufferList: interop.Pointer | interop.Reference<AudioBufferList>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare class AVAudioChannelLayout extends NSObject implements NSSecureCoding {

	static alloc(): AVAudioChannelLayout; // inherited from NSObject

	static layoutWithLayout(layout: interop.Pointer | interop.Reference<AudioChannelLayout>): AVAudioChannelLayout;

	static layoutWithLayoutTag(layoutTag: number): AVAudioChannelLayout;

	static new(): AVAudioChannelLayout; // inherited from NSObject

	readonly channelCount: number;

	readonly layout: interop.Pointer | interop.Reference<AudioChannelLayout>;

	readonly layoutTag: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layout: interop.Pointer | interop.Reference<AudioChannelLayout>; });

	constructor(o: { layoutTag: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLayout(layout: interop.Pointer | interop.Reference<AudioChannelLayout>): this;

	initWithLayoutTag(layoutTag: number): this;
}

/**
 * @since 8.0
 */
declare const enum AVAudioCommonFormat {

	OtherFormat = 0,

	PCMFormatFloat32 = 1,

	PCMFormatFloat64 = 2,

	PCMFormatInt16 = 3,

	PCMFormatInt32 = 4
}

/**
 * @since 9.0
 */
declare class AVAudioCompressedBuffer extends AVAudioBuffer {

	static alloc(): AVAudioCompressedBuffer; // inherited from NSObject

	static new(): AVAudioCompressedBuffer; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly byteCapacity: number;

	/**
	 * @since 11.0
	 */
	byteLength: number;

	readonly data: interop.Pointer | interop.Reference<any>;

	readonly maximumPacketSize: number;

	readonly packetCapacity: number;

	packetCount: number;

	readonly packetDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>;

	constructor(o: { format: AVAudioFormat; packetCapacity: number; });

	constructor(o: { format: AVAudioFormat; packetCapacity: number; maximumPacketSize: number; });

	initWithFormatPacketCapacity(format: AVAudioFormat, packetCapacity: number): this;

	initWithFormatPacketCapacityMaximumPacketSize(format: AVAudioFormat, packetCapacity: number, maximumPacketSize: number): this;
}

/**
 * @since 9.0
 */
declare class AVAudioConnectionPoint extends NSObject {

	static alloc(): AVAudioConnectionPoint; // inherited from NSObject

	static new(): AVAudioConnectionPoint; // inherited from NSObject

	readonly bus: number;

	readonly node: AVAudioNode;

	constructor(o: { node: AVAudioNode; bus: number; });

	initWithNodeBus(node: AVAudioNode, bus: number): this;
}

/**
 * @since 9.0
 */
declare class AVAudioConverter extends NSObject {

	static alloc(): AVAudioConverter; // inherited from NSObject

	static new(): AVAudioConverter; // inherited from NSObject

	readonly applicableEncodeBitRates: NSArray<number>;

	readonly applicableEncodeSampleRates: NSArray<number>;

	readonly availableEncodeBitRates: NSArray<number>;

	readonly availableEncodeChannelLayoutTags: NSArray<number>;

	readonly availableEncodeSampleRates: NSArray<number>;

	bitRate: number;

	bitRateStrategy: string;

	channelMap: NSArray<number>;

	dither: boolean;

	downmix: boolean;

	readonly inputFormat: AVAudioFormat;

	magicCookie: NSData;

	readonly maximumOutputPacketSize: number;

	readonly outputFormat: AVAudioFormat;

	primeInfo: AVAudioConverterPrimeInfo;

	primeMethod: AVAudioConverterPrimeMethod;

	sampleRateConverterAlgorithm: string;

	sampleRateConverterQuality: number;

	constructor(o: { fromFormat: AVAudioFormat; toFormat: AVAudioFormat; });

	convertToBufferErrorWithInputFromBlock(outputBuffer: AVAudioBuffer, outError: interop.Pointer | interop.Reference<NSError>, inputBlock: (p1: number, p2: interop.Pointer | interop.Reference<AVAudioConverterInputStatus>) => AVAudioBuffer): AVAudioConverterOutputStatus;

	convertToBufferFromBufferError(outputBuffer: AVAudioPCMBuffer, inputBuffer: AVAudioPCMBuffer): boolean;

	initFromFormatToFormat(fromFormat: AVAudioFormat, toFormat: AVAudioFormat): this;

	reset(): void;
}

/**
 * @since 9.0
 */
declare const enum AVAudioConverterInputStatus {

	HaveData = 0,

	NoDataNow = 1,

	EndOfStream = 2
}

/**
 * @since 9.0
 */
declare const enum AVAudioConverterOutputStatus {

	HaveData = 0,

	InputRanDry = 1,

	EndOfStream = 2,

	Error = 3
}

interface AVAudioConverterPrimeInfo {
	leadingFrames: number;
	trailingFrames: number;
}
declare var AVAudioConverterPrimeInfo: interop.StructType<AVAudioConverterPrimeInfo>;

declare const enum AVAudioConverterPrimeMethod {

	Pre = 0,

	Normal = 1,

	None = 2
}

/**
 * @since 8.0
 */
declare class AVAudioEngine extends NSObject {

	static alloc(): AVAudioEngine; // inherited from NSObject

	static new(): AVAudioEngine; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly attachedNodes: NSSet<AVAudioNode>;

	/**
	 * @since 11.0
	 */
	autoShutdownEnabled: boolean;

	/**
	 * @since 8.0
	 */
	readonly inputNode: AVAudioInputNode;

	/**
	 * @since 11.0
	 */
	readonly isInManualRenderingMode: boolean;

	readonly mainMixerNode: AVAudioMixerNode;

	/**
	 * @since 11.0
	 */
	readonly manualRenderingBlock: (p1: number, p2: interop.Pointer | interop.Reference<AudioBufferList>, p3: interop.Pointer | interop.Reference<number>) => AVAudioEngineManualRenderingStatus;

	/**
	 * @since 11.0
	 */
	readonly manualRenderingFormat: AVAudioFormat;

	/**
	 * @since 11.0
	 */
	readonly manualRenderingMaximumFrameCount: number;

	/**
	 * @since 11.0
	 */
	readonly manualRenderingMode: AVAudioEngineManualRenderingMode;

	/**
	 * @since 11.0
	 */
	readonly manualRenderingSampleTime: number;

	musicSequence: interop.Pointer | interop.Reference<any>;

	readonly outputNode: AVAudioOutputNode;

	readonly running: boolean;

	attachNode(node: AVAudioNode): void;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	connectMIDIToFormatBlock(sourceNode: AVAudioNode, destinationNode: AVAudioNode, format: AVAudioFormat, tapBlock: (p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>) => number): void;

	/**
	 * @since 16.0
	 */
	connectMIDIToFormatEventListBlock(sourceNode: AVAudioNode, destinationNode: AVAudioNode, format: AVAudioFormat, tapBlock: (p1: number, p2: number, p3: interop.Pointer | interop.Reference<MIDIEventList>) => number): void;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	connectMIDIToNodesFormatBlock(sourceNode: AVAudioNode, destinationNodes: NSArray<AVAudioNode> | AVAudioNode[], format: AVAudioFormat, tapBlock: (p1: number, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>) => number): void;

	/**
	 * @since 16.0
	 */
	connectMIDIToNodesFormatEventListBlock(sourceNode: AVAudioNode, destinationNodes: NSArray<AVAudioNode> | AVAudioNode[], format: AVAudioFormat, tapBlock: (p1: number, p2: number, p3: interop.Pointer | interop.Reference<MIDIEventList>) => number): void;

	/**
	 * @since 9.0
	 */
	connectToConnectionPointsFromBusFormat(sourceNode: AVAudioNode, destNodes: NSArray<AVAudioConnectionPoint> | AVAudioConnectionPoint[], sourceBus: number, format: AVAudioFormat): void;

	connectToFormat(node1: AVAudioNode, node2: AVAudioNode, format: AVAudioFormat): void;

	connectToFromBusToBusFormat(node1: AVAudioNode, node2: AVAudioNode, bus1: number, bus2: number, format: AVAudioFormat): void;

	detachNode(node: AVAudioNode): void;

	/**
	 * @since 11.0
	 */
	disableManualRenderingMode(): void;

	/**
	 * @since 12.0
	 */
	disconnectMIDIFrom(sourceNode: AVAudioNode, destinationNode: AVAudioNode): void;

	/**
	 * @since 12.0
	 */
	disconnectMIDIFromNodes(sourceNode: AVAudioNode, destinationNodes: NSArray<AVAudioNode> | AVAudioNode[]): void;

	/**
	 * @since 12.0
	 */
	disconnectMIDIInput(node: AVAudioNode): void;

	/**
	 * @since 12.0
	 */
	disconnectMIDIOutput(node: AVAudioNode): void;

	disconnectNodeInput(node: AVAudioNode): void;

	disconnectNodeInputBus(node: AVAudioNode, bus: number): void;

	disconnectNodeOutput(node: AVAudioNode): void;

	disconnectNodeOutputBus(node: AVAudioNode, bus: number): void;

	/**
	 * @since 11.0
	 */
	enableManualRenderingModeFormatMaximumFrameCountError(mode: AVAudioEngineManualRenderingMode, pcmFormat: AVAudioFormat, maximumFrameCount: number): boolean;

	/**
	 * @since 9.0
	 */
	inputConnectionPointForNodeInputBus(node: AVAudioNode, bus: number): AVAudioConnectionPoint;

	/**
	 * @since 9.0
	 */
	outputConnectionPointsForNodeOutputBus(node: AVAudioNode, bus: number): NSArray<AVAudioConnectionPoint>;

	pause(): void;

	prepare(): void;

	/**
	 * @since 11.0
	 */
	renderOfflineToBufferError(numberOfFrames: number, buffer: AVAudioPCMBuffer): AVAudioEngineManualRenderingStatus;

	reset(): void;

	startAndReturnError(): boolean;

	stop(): void;
}

/**
 * @since 8.0
 */
declare var AVAudioEngineConfigurationChangeNotification: string;

/**
 * @since 11.0
 */
declare const enum AVAudioEngineManualRenderingError {

	InvalidMode = -80800,

	Initialized = -80801,

	NotRunning = -80802
}

/**
 * @since 11.0
 */
declare const enum AVAudioEngineManualRenderingMode {

	Offline = 0,

	Realtime = 1
}

/**
 * @since 11.0
 */
declare const enum AVAudioEngineManualRenderingStatus {

	Error = -1,

	Success = 0,

	InsufficientDataFromInputNode = 1,

	CannotDoInCurrentContext = 2
}

/**
 * @since 8.0
 */
declare const enum AVAudioEnvironmentDistanceAttenuationModel {

	Exponential = 1,

	Inverse = 2,

	Linear = 3
}

/**
 * @since 8.0
 */
declare class AVAudioEnvironmentDistanceAttenuationParameters extends NSObject {

	static alloc(): AVAudioEnvironmentDistanceAttenuationParameters; // inherited from NSObject

	static new(): AVAudioEnvironmentDistanceAttenuationParameters; // inherited from NSObject

	distanceAttenuationModel: AVAudioEnvironmentDistanceAttenuationModel;

	maximumDistance: number;

	referenceDistance: number;

	rolloffFactor: number;
}

/**
 * @since 8.0
 */
declare class AVAudioEnvironmentNode extends AVAudioNode implements AVAudioMixing {

	static alloc(): AVAudioEnvironmentNode; // inherited from NSObject

	static new(): AVAudioEnvironmentNode; // inherited from NSObject

	readonly applicableRenderingAlgorithms: NSArray<number>;

	readonly distanceAttenuationParameters: AVAudioEnvironmentDistanceAttenuationParameters;

	listenerAngularOrientation: AVAudio3DAngularOrientation;

	/**
	 * @since 18.0
	 */
	listenerHeadTrackingEnabled: boolean;

	listenerPosition: AVAudio3DPoint;

	listenerVectorOrientation: AVAudio3DVectorOrientation;

	readonly nextAvailableInputBus: number;

	/**
	 * @since 13.0
	 */
	outputType: AVAudioEnvironmentOutputType;

	outputVolume: number;

	readonly reverbParameters: AVAudioEnvironmentReverbParameters;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	/**
	 * @since 13.0
	 */
	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/**
	 * @since 13.0
	 */
	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 13.0
 */
declare const enum AVAudioEnvironmentOutputType {

	Auto = 0,

	Headphones = 1,

	BuiltInSpeakers = 2,

	ExternalSpeakers = 3
}

/**
 * @since 8.0
 */
declare class AVAudioEnvironmentReverbParameters extends NSObject {

	static alloc(): AVAudioEnvironmentReverbParameters; // inherited from NSObject

	static new(): AVAudioEnvironmentReverbParameters; // inherited from NSObject

	enable: boolean;

	readonly filterParameters: AVAudioUnitEQFilterParameters;

	level: number;

	loadFactoryReverbPreset(preset: AVAudioUnitReverbPreset): void;
}

/**
 * @since 8.0
 */
declare class AVAudioFile extends NSObject {

	static alloc(): AVAudioFile; // inherited from NSObject

	static new(): AVAudioFile; // inherited from NSObject

	readonly fileFormat: AVAudioFormat;

	framePosition: number;

	/**
	 * @since 18.0
	 */
	readonly isOpen: boolean;

	readonly length: number;

	readonly processingFormat: AVAudioFormat;

	readonly url: NSURL;

	constructor(o: { forReading: NSURL; commonFormat: AVAudioCommonFormat; interleaved: boolean; });

	constructor(o: { forReading: NSURL; });

	constructor(o: { forWriting: NSURL; settings: NSDictionary<string, any>; commonFormat: AVAudioCommonFormat; interleaved: boolean; });

	constructor(o: { forWriting: NSURL; settings: NSDictionary<string, any>; });

	/**
	 * @since 18.0
	 */
	close(): void;

	initForReadingCommonFormatInterleavedError(fileURL: NSURL, format: AVAudioCommonFormat, interleaved: boolean): this;

	initForReadingError(fileURL: NSURL): this;

	initForWritingSettingsCommonFormatInterleavedError(fileURL: NSURL, settings: NSDictionary<string, any>, format: AVAudioCommonFormat, interleaved: boolean): this;

	initForWritingSettingsError(fileURL: NSURL, settings: NSDictionary<string, any>): this;

	readIntoBufferError(buffer: AVAudioPCMBuffer): boolean;

	readIntoBufferFrameCountError(buffer: AVAudioPCMBuffer, frames: number): boolean;

	writeFromBufferError(buffer: AVAudioPCMBuffer): boolean;
}

/**
 * @since 11.0
 */
declare var AVAudioFileTypeKey: string;

/**
 * @since 8.0
 */
declare class AVAudioFormat extends NSObject implements NSSecureCoding {

	static alloc(): AVAudioFormat; // inherited from NSObject

	static new(): AVAudioFormat; // inherited from NSObject

	readonly channelCount: number;

	readonly channelLayout: AVAudioChannelLayout;

	readonly commonFormat: AVAudioCommonFormat;

	/**
	 * @since 9.0
	 */
	readonly formatDescription: any;

	readonly interleaved: boolean;

	/**
	 * @since 10.0
	 */
	magicCookie: NSData;

	readonly sampleRate: number;

	readonly settings: NSDictionary<string, any>;

	readonly standard: boolean;

	readonly streamDescription: interop.Pointer | interop.Reference<AudioStreamBasicDescription>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { standardFormatWithSampleRate: number; channelLayout: AVAudioChannelLayout; });

	constructor(o: { standardFormatWithSampleRate: number; channels: number; });

	/**
	 * @since 9.0
	 */
	constructor(o: { CMAudioFormatDescription: any; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { commonFormat: AVAudioCommonFormat; sampleRate: number; channels: number; interleaved: boolean; });

	constructor(o: { commonFormat: AVAudioCommonFormat; sampleRate: number; interleaved: boolean; channelLayout: AVAudioChannelLayout; });

	constructor(o: { settings: NSDictionary<string, any>; });

	constructor(o: { streamDescription: interop.Pointer | interop.Reference<AudioStreamBasicDescription>; });

	constructor(o: { streamDescription: interop.Pointer | interop.Reference<AudioStreamBasicDescription>; channelLayout: AVAudioChannelLayout; });

	encodeWithCoder(coder: NSCoder): void;

	initStandardFormatWithSampleRateChannelLayout(sampleRate: number, layout: AVAudioChannelLayout): this;

	initStandardFormatWithSampleRateChannels(sampleRate: number, channels: number): this;

	/**
	 * @since 9.0
	 */
	initWithCMAudioFormatDescription(formatDescription: any): this;

	initWithCoder(coder: NSCoder): this;

	initWithCommonFormatSampleRateChannelsInterleaved(format: AVAudioCommonFormat, sampleRate: number, channels: number, interleaved: boolean): this;

	initWithCommonFormatSampleRateInterleavedChannelLayout(format: AVAudioCommonFormat, sampleRate: number, interleaved: boolean, layout: AVAudioChannelLayout): this;

	initWithSettings(settings: NSDictionary<string, any>): this;

	initWithStreamDescription(asbd: interop.Pointer | interop.Reference<AudioStreamBasicDescription>): this;

	initWithStreamDescriptionChannelLayout(asbd: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, layout: AVAudioChannelLayout): this;
}

/**
 * @since 8.0
 */
declare class AVAudioIONode extends AVAudioNode {

	static alloc(): AVAudioIONode; // inherited from NSObject

	static new(): AVAudioIONode; // inherited from NSObject

	readonly audioUnit: interop.Pointer | interop.Reference<any>;

	readonly presentationLatency: number;

	/**
	 * @since 13.0
	 */
	readonly voiceProcessingEnabled: boolean;

	/**
	 * @since 13.0
	 */
	setVoiceProcessingEnabledError(enabled: boolean): boolean;
}

/**
 * @since 8.0
 */
declare class AVAudioInputNode extends AVAudioIONode implements AVAudioMixing {

	static alloc(): AVAudioInputNode; // inherited from NSObject

	static new(): AVAudioInputNode; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	voiceProcessingAGCEnabled: boolean;

	/**
	 * @since 13.0
	 */
	voiceProcessingBypassed: boolean;

	/**
	 * @since 13.0
	 */
	voiceProcessingInputMuted: boolean;

	/**
	 * @since 17.0
	 */
	voiceProcessingOtherAudioDuckingConfiguration: AVAudioVoiceProcessingOtherAudioDuckingConfiguration;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	/**
	 * @since 13.0
	 */
	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/**
	 * @since 13.0
	 */
	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 11.0
	 */
	setManualRenderingInputPCMFormatInputBlock(format: AVAudioFormat, block: (p1: number) => interop.Pointer | interop.Reference<AudioBufferList>): boolean;

	/**
	 * @since 17.0
	 */
	setMutedSpeechActivityEventListener(listenerBlock: (p1: AVAudioVoiceProcessingSpeechActivityEvent) => void): boolean;
}

/**
 * @since 8.0
 */
declare class AVAudioMixerNode extends AVAudioNode implements AVAudioMixing {

	static alloc(): AVAudioMixerNode; // inherited from NSObject

	static new(): AVAudioMixerNode; // inherited from NSObject

	readonly nextAvailableInputBus: number;

	outputVolume: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	/**
	 * @since 13.0
	 */
	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/**
	 * @since 13.0
	 */
	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 8.0
 */
interface AVAudioMixing extends AVAudio3DMixing, AVAudioStereoMixing {

	volume: number;

	/**
	 * @since 9.0
	 */
	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;
}
declare var AVAudioMixing: {

	prototype: AVAudioMixing;
};

/**
 * @since 9.0
 */
declare class AVAudioMixingDestination extends NSObject implements AVAudioMixing {

	static alloc(): AVAudioMixingDestination; // inherited from NSObject

	static new(): AVAudioMixingDestination; // inherited from NSObject

	readonly connectionPoint: AVAudioConnectionPoint;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	/**
	 * @since 13.0
	 */
	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/**
	 * @since 13.0
	 */
	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 8.0
 */
declare class AVAudioNode extends NSObject {

	static alloc(): AVAudioNode; // inherited from NSObject

	static new(): AVAudioNode; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly AUAudioUnit: AUAudioUnit;

	readonly engine: AVAudioEngine;

	readonly lastRenderTime: AVAudioTime;

	/**
	 * @since 11.0
	 */
	readonly latency: number;

	readonly numberOfInputs: number;

	readonly numberOfOutputs: number;

	/**
	 * @since 11.0
	 */
	readonly outputPresentationLatency: number;

	inputFormatForBus(bus: number): AVAudioFormat;

	installTapOnBusBufferSizeFormatBlock(bus: number, bufferSize: number, format: AVAudioFormat, tapBlock: (p1: AVAudioPCMBuffer, p2: AVAudioTime) => void): void;

	nameForInputBus(bus: number): string;

	nameForOutputBus(bus: number): string;

	outputFormatForBus(bus: number): AVAudioFormat;

	removeTapOnBus(bus: number): void;

	reset(): void;
}

/**
 * @since 8.0
 */
declare class AVAudioOutputNode extends AVAudioIONode {

	static alloc(): AVAudioOutputNode; // inherited from NSObject

	static new(): AVAudioOutputNode; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare class AVAudioPCMBuffer extends AVAudioBuffer {

	static alloc(): AVAudioPCMBuffer; // inherited from NSObject

	static new(): AVAudioPCMBuffer; // inherited from NSObject

	readonly floatChannelData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;

	readonly frameCapacity: number;

	frameLength: number;

	readonly int16ChannelData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;

	readonly int32ChannelData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;

	readonly stride: number;

	/**
	 * @since 15.0
	 */
	constructor(o: { PCMFormat: AVAudioFormat; bufferListNoCopy: interop.Pointer | interop.Reference<AudioBufferList>; deallocator: (p1: interop.Pointer | interop.Reference<AudioBufferList>) => void; });

	constructor(o: { PCMFormat: AVAudioFormat; frameCapacity: number; });

	/**
	 * @since 15.0
	 */
	initWithPCMFormatBufferListNoCopyDeallocator(format: AVAudioFormat, bufferList: interop.Pointer | interop.Reference<AudioBufferList>, deallocator: (p1: interop.Pointer | interop.Reference<AudioBufferList>) => void): this;

	initWithPCMFormatFrameCapacity(format: AVAudioFormat, frameCapacity: number): this;
}

/**
 * @since 2.2
 */
declare class AVAudioPlayer extends NSObject {

	static alloc(): AVAudioPlayer; // inherited from NSObject

	static new(): AVAudioPlayer; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	channelAssignments: NSArray<AVAudioSessionChannelDescription>;

	currentTime: number;

	readonly data: NSData;

	delegate: AVAudioPlayerDelegate;

	/**
	 * @since 4.0
	 */
	readonly deviceCurrentTime: number;

	readonly duration: number;

	/**
	 * @since 5.0
	 */
	enableRate: boolean;

	/**
	 * @since 10.0
	 */
	readonly format: AVAudioFormat;

	meteringEnabled: boolean;

	readonly numberOfChannels: number;

	numberOfLoops: number;

	/**
	 * @since 4.0
	 */
	pan: number;

	readonly playing: boolean;

	/**
	 * @since 5.0
	 */
	rate: number;

	/**
	 * @since 4.0
	 */
	readonly settings: NSDictionary<string, any>;

	readonly url: NSURL;

	volume: number;

	constructor(o: { contentsOfURL: NSURL; });

	/**
	 * @since 7.0
	 */
	constructor(o: { contentsOfURL: NSURL; fileTypeHint: string; });

	constructor(o: { data: NSData; });

	/**
	 * @since 7.0
	 */
	constructor(o: { data: NSData; fileTypeHint: string; });

	averagePowerForChannel(channelNumber: number): number;

	initWithContentsOfURLError(url: NSURL): this;

	/**
	 * @since 7.0
	 */
	initWithContentsOfURLFileTypeHintError(url: NSURL, utiString: string): this;

	initWithDataError(data: NSData): this;

	/**
	 * @since 7.0
	 */
	initWithDataFileTypeHintError(data: NSData, utiString: string): this;

	pause(): void;

	peakPowerForChannel(channelNumber: number): number;

	play(): boolean;

	/**
	 * @since 4.0
	 */
	playAtTime(time: number): boolean;

	prepareToPlay(): boolean;

	/**
	 * @since 10.0
	 */
	setVolumeFadeDuration(volume: number, duration: number): void;

	stop(): void;

	updateMeters(): void;
}

interface AVAudioPlayerDelegate extends NSObjectProtocol {

	/**
	 * @since 2.2
	 * @deprecated 8.0
	 */
	audioPlayerBeginInterruption?(player: AVAudioPlayer): void;

	audioPlayerDecodeErrorDidOccurError?(player: AVAudioPlayer, error: NSError): void;

	audioPlayerDidFinishPlayingSuccessfully?(player: AVAudioPlayer, flag: boolean): void;

	/**
	 * @since 2.2
	 * @deprecated 6.0
	 */
	audioPlayerEndInterruption?(player: AVAudioPlayer): void;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	audioPlayerEndInterruptionWithFlags?(player: AVAudioPlayer, flags: number): void;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	audioPlayerEndInterruptionWithOptions?(player: AVAudioPlayer, flags: number): void;
}
declare var AVAudioPlayerDelegate: {

	prototype: AVAudioPlayerDelegate;
};

/**
 * @since 8.0
 */
declare class AVAudioPlayerNode extends AVAudioNode implements AVAudioMixing {

	static alloc(): AVAudioPlayerNode; // inherited from NSObject

	static new(): AVAudioPlayerNode; // inherited from NSObject

	readonly playing: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	/**
	 * @since 13.0
	 */
	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/**
	 * @since 13.0
	 */
	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	nodeTimeForPlayerTime(playerTime: AVAudioTime): AVAudioTime;

	pause(): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	play(): void;

	playAtTime(when: AVAudioTime): void;

	playerTimeForNodeTime(nodeTime: AVAudioTime): AVAudioTime;

	prepareWithFrameCount(frameCount: number): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 11.0
	 */
	scheduleBufferAtTimeOptionsCompletionCallbackTypeCompletionHandler(buffer: AVAudioPCMBuffer, when: AVAudioTime, options: AVAudioPlayerNodeBufferOptions, callbackType: AVAudioPlayerNodeCompletionCallbackType, completionHandler: (p1: AVAudioPlayerNodeCompletionCallbackType) => void): void;

	scheduleBufferAtTimeOptionsCompletionHandler(buffer: AVAudioPCMBuffer, when: AVAudioTime, options: AVAudioPlayerNodeBufferOptions, completionHandler: () => void): void;

	/**
	 * @since 11.0
	 */
	scheduleBufferCompletionCallbackTypeCompletionHandler(buffer: AVAudioPCMBuffer, callbackType: AVAudioPlayerNodeCompletionCallbackType, completionHandler: (p1: AVAudioPlayerNodeCompletionCallbackType) => void): void;

	scheduleBufferCompletionHandler(buffer: AVAudioPCMBuffer, completionHandler: () => void): void;

	/**
	 * @since 11.0
	 */
	scheduleFileAtTimeCompletionCallbackTypeCompletionHandler(file: AVAudioFile, when: AVAudioTime, callbackType: AVAudioPlayerNodeCompletionCallbackType, completionHandler: (p1: AVAudioPlayerNodeCompletionCallbackType) => void): void;

	scheduleFileAtTimeCompletionHandler(file: AVAudioFile, when: AVAudioTime, completionHandler: () => void): void;

	/**
	 * @since 11.0
	 */
	scheduleSegmentStartingFrameFrameCountAtTimeCompletionCallbackTypeCompletionHandler(file: AVAudioFile, startFrame: number, numberFrames: number, when: AVAudioTime, callbackType: AVAudioPlayerNodeCompletionCallbackType, completionHandler: (p1: AVAudioPlayerNodeCompletionCallbackType) => void): void;

	scheduleSegmentStartingFrameFrameCountAtTimeCompletionHandler(file: AVAudioFile, startFrame: number, numberFrames: number, when: AVAudioTime, completionHandler: () => void): void;

	self(): this;

	stop(): void;
}

declare const enum AVAudioPlayerNodeBufferOptions {

	Loops = 1,

	Interrupts = 2,

	InterruptsAtLoop = 4
}

declare const enum AVAudioPlayerNodeCompletionCallbackType {

	DataConsumed = 0,

	DataRendered = 1,

	DataPlayedBack = 2
}

declare const enum AVAudioQuality {

	Min = 0,

	Low = 32,

	Medium = 64,

	High = 96,

	Max = 127
}

/**
 * @since 3.0
 */
declare class AVAudioRecorder extends NSObject {

	static alloc(): AVAudioRecorder; // inherited from NSObject

	static new(): AVAudioRecorder; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	channelAssignments: NSArray<AVAudioSessionChannelDescription>;

	readonly currentTime: number;

	delegate: AVAudioRecorderDelegate;

	/**
	 * @since 6.0
	 */
	readonly deviceCurrentTime: number;

	/**
	 * @since 10.0
	 */
	readonly format: AVAudioFormat;

	meteringEnabled: boolean;

	readonly recording: boolean;

	readonly settings: NSDictionary<string, any>;

	readonly url: NSURL;

	/**
	 * @since 10.0
	 */
	constructor(o: { URL: NSURL; format: AVAudioFormat; });

	constructor(o: { URL: NSURL; settings: NSDictionary<string, any>; });

	averagePowerForChannel(channelNumber: number): number;

	deleteRecording(): boolean;

	/**
	 * @since 10.0
	 */
	initWithURLFormatError(url: NSURL, format: AVAudioFormat): this;

	initWithURLSettingsError(url: NSURL, settings: NSDictionary<string, any>): this;

	pause(): void;

	peakPowerForChannel(channelNumber: number): number;

	prepareToRecord(): boolean;

	record(): boolean;

	/**
	 * @since 6.0
	 */
	recordAtTime(time: number): boolean;

	/**
	 * @since 6.0
	 */
	recordAtTimeForDuration(time: number, duration: number): boolean;

	recordForDuration(duration: number): boolean;

	stop(): void;

	updateMeters(): void;
}

/**
 * @since 3.0
 */
interface AVAudioRecorderDelegate extends NSObjectProtocol {

	/**
	 * @since 2.2
	 * @deprecated 8.0
	 */
	audioRecorderBeginInterruption?(recorder: AVAudioRecorder): void;

	audioRecorderDidFinishRecordingSuccessfully?(recorder: AVAudioRecorder, flag: boolean): void;

	audioRecorderEncodeErrorDidOccurError?(recorder: AVAudioRecorder, error: NSError): void;

	/**
	 * @since 2.2
	 * @deprecated 6.0
	 */
	audioRecorderEndInterruption?(recorder: AVAudioRecorder): void;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	audioRecorderEndInterruptionWithFlags?(recorder: AVAudioRecorder, flags: number): void;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	audioRecorderEndInterruptionWithOptions?(recorder: AVAudioRecorder, flags: number): void;
}
declare var AVAudioRecorderDelegate: {

	prototype: AVAudioRecorderDelegate;
};

declare const enum AVAudioRoutingArbitrationCategory {

	Playback = 0,

	PlayAndRecord = 1,

	PlayAndRecordVoice = 2
}

/**
 * @since 9.0
 */
declare class AVAudioSequencer extends NSObject {

	static alloc(): AVAudioSequencer; // inherited from NSObject

	static new(): AVAudioSequencer; // inherited from NSObject

	currentPositionInBeats: number;

	currentPositionInSeconds: number;

	readonly playing: boolean;

	rate: number;

	readonly tempoTrack: AVMusicTrack;

	readonly tracks: NSArray<AVMusicTrack>;

	readonly userInfo: NSDictionary<string, any>;

	constructor(o: { audioEngine: AVAudioEngine; });

	beatsForHostTimeError(inHostTime: number): number;

	beatsForSeconds(seconds: number): number;

	/**
	 * @since 16.0
	 */
	createAndAppendTrack(): AVMusicTrack;

	dataWithSMPTEResolutionError(SMPTEResolution: number): NSData;

	hostTimeForBeatsError(inBeats: number): number;

	initWithAudioEngine(engine: AVAudioEngine): this;

	loadFromDataOptionsError(data: NSData, options: AVMusicSequenceLoadOptions): boolean;

	loadFromURLOptionsError(fileURL: NSURL, options: AVMusicSequenceLoadOptions): boolean;

	prepareToPlay(): void;

	/**
	 * @since 16.0
	 */
	removeTrack(track: AVMusicTrack): boolean;

	/**
	 * @since 16.0
	 */
	reverseEvents(): void;

	secondsForBeats(beats: number): number;

	/**
	 * @since 16.0
	 */
	setUserCallback(userCallback: (p1: AVMusicTrack, p2: NSData, p3: number) => void): void;

	startAndReturnError(): boolean;

	stop(): void;

	writeToURLSMPTEResolutionReplaceExistingError(fileURL: NSURL, resolution: number, replace: boolean): boolean;
}

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyAlbum: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyApproximateDurationInSeconds: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyArtist: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyChannelLayout: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyComments: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyComposer: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyCopyright: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyEncodingApplication: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyGenre: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyISRC: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyKeySignature: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyLyricist: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyNominalBitRate: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyRecordedDate: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeySourceBitDepth: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeySourceEncoder: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeySubTitle: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyTempo: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyTimeSignature: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyTitle: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyTrackNumber: string;

/**
 * @since 16.0
 */
declare var AVAudioSequencerInfoDictionaryKeyYear: string;

/**
 * @since 3.0
 */
declare class AVAudioSession extends NSObject {

	static alloc(): AVAudioSession; // inherited from NSObject

	static new(): AVAudioSession; // inherited from NSObject

	/**
	 * @since 3.0
	 */
	static sharedInstance(): AVAudioSession;

	/**
	 * @since 6.0
	 */
	readonly IOBufferDuration: number;

	/**
	 * @since 13.0
	 */
	readonly allowHapticsAndSystemSoundsDuringRecording: boolean;

	/**
	 * @since 9.0
	 */
	readonly availableCategories: NSArray<string>;

	/**
	 * @since 7.0
	 */
	readonly availableInputs: NSArray<AVAudioSessionPortDescription>;

	/**
	 * @since 9.0
	 */
	readonly availableModes: NSArray<string>;

	/**
	 * @since 3.0
	 */
	readonly category: string;

	/**
	 * @since 6.0
	 */
	readonly categoryOptions: AVAudioSessionCategoryOptions;

	/**
	 * @since 3.0
	 * @deprecated 6.0
	 */
	readonly currentHardwareInputNumberOfChannels: number;

	/**
	 * @since 3.0
	 * @deprecated 6.0
	 */
	readonly currentHardwareOutputNumberOfChannels: number;

	/**
	 * @since 3.0
	 * @deprecated 6.0
	 */
	readonly currentHardwareSampleRate: number;

	/**
	 * @since 6.0
	 */
	readonly currentRoute: AVAudioSessionRouteDescription;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	delegate: AVAudioSessionDelegate;

	/**
	 * @since 6.0
	 */
	readonly inputAvailable: boolean;

	/**
	 * @since 6.0
	 */
	readonly inputDataSource: AVAudioSessionDataSourceDescription;

	/**
	 * @since 6.0
	 */
	readonly inputDataSources: NSArray<AVAudioSessionDataSourceDescription>;

	/**
	 * @since 6.0
	 */
	readonly inputGain: number;

	/**
	 * @since 6.0
	 */
	readonly inputGainSettable: boolean;

	/**
	 * @since 3.0
	 * @deprecated 6.0
	 */
	readonly inputIsAvailable: boolean;

	/**
	 * @since 6.0
	 */
	readonly inputLatency: number;

	/**
	 * @since 6.0
	 */
	readonly inputNumberOfChannels: number;

	/**
	 * @since 14.0
	 */
	readonly inputOrientation: AVAudioStereoOrientation;

	/**
	 * @since 7.0
	 */
	readonly maximumInputNumberOfChannels: number;

	/**
	 * @since 7.0
	 */
	readonly maximumOutputNumberOfChannels: number;

	/**
	 * @since 5.0
	 */
	readonly mode: string;

	/**
	 * @since 6.0
	 */
	readonly otherAudioPlaying: boolean;

	/**
	 * @since 6.0
	 */
	readonly outputDataSource: AVAudioSessionDataSourceDescription;

	/**
	 * @since 6.0
	 */
	readonly outputDataSources: NSArray<AVAudioSessionDataSourceDescription>;

	/**
	 * @since 6.0
	 */
	readonly outputLatency: number;

	/**
	 * @since 6.0
	 */
	readonly outputNumberOfChannels: number;

	/**
	 * @since 6.0
	 */
	readonly outputVolume: number;

	/**
	 * @since 3.0
	 * @deprecated 6.0
	 */
	readonly preferredHardwareSampleRate: number;

	/**
	 * @since 3.0
	 */
	readonly preferredIOBufferDuration: number;

	/**
	 * @since 7.0
	 */
	readonly preferredInput: AVAudioSessionPortDescription;

	/**
	 * @since 7.0
	 */
	readonly preferredInputNumberOfChannels: number;

	/**
	 * @since 14.0
	 */
	readonly preferredInputOrientation: AVAudioStereoOrientation;

	/**
	 * @since 7.0
	 */
	readonly preferredOutputNumberOfChannels: number;

	/**
	 * @since 6.0
	 */
	readonly preferredSampleRate: number;

	/**
	 * @since 17.0
	 */
	readonly prefersInterruptionOnRouteDisconnect: boolean;

	/**
	 * @since 14.5
	 */
	readonly prefersNoInterruptionsFromSystemAlerts: boolean;

	/**
	 * @since 13.0
	 */
	readonly promptStyle: AVAudioSessionPromptStyle;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	readonly recordPermission: AVAudioSessionRecordPermission;

	/**
	 * @since 17.2
	 */
	readonly renderingMode: AVAudioSessionRenderingMode;

	/**
	 * @since 11.0
	 */
	readonly routeSharingPolicy: AVAudioSessionRouteSharingPolicy;

	/**
	 * @since 6.0
	 */
	readonly sampleRate: number;

	/**
	 * @since 8.0
	 */
	readonly secondaryAudioShouldBeSilencedHint: boolean;

	/**
	 * @since 17.2
	 */
	readonly supportedOutputChannelLayouts: NSArray<AVAudioChannelLayout>;

	/**
	 * @since 15.0
	 */
	readonly supportsMultichannelContent: boolean;

	/**
	 * @since 6.0
	 */
	overrideOutputAudioPortError(portOverride: AVAudioSessionPortOverride): boolean;

	prepareRouteSelectionForPlaybackWithCompletionHandler(completionHandler: (p1: boolean, p2: AVAudioSessionRouteSelection) => void): void;

	/**
	 * @since 7.0
	 * @deprecated 17.0
	 */
	requestRecordPermission(response: (p1: boolean) => void): void;

	/**
	 * @since 3.0
	 */
	setActiveError(active: boolean): boolean;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	setActiveWithFlagsError(active: boolean, flags: number): boolean;

	/**
	 * @since 6.0
	 */
	setActiveWithOptionsError(active: boolean, options: AVAudioSessionSetActiveOptions): boolean;

	/**
	 * @since 10.0
	 */
	setAggregatedIOPreferenceError(inIOType: AVAudioSessionIOType): boolean;

	/**
	 * @since 13.0
	 */
	setAllowHapticsAndSystemSoundsDuringRecordingError(inValue: boolean): boolean;

	/**
	 * @since 3.0
	 */
	setCategoryError(category: string): boolean;

	/**
	 * @since 10.0
	 */
	setCategoryModeOptionsError(category: string, mode: string, options: AVAudioSessionCategoryOptions): boolean;

	/**
	 * @since 11.0
	 */
	setCategoryModeRouteSharingPolicyOptionsError(category: string, mode: string, policy: AVAudioSessionRouteSharingPolicy, options: AVAudioSessionCategoryOptions): boolean;

	/**
	 * @since 6.0
	 */
	setCategoryWithOptionsError(category: string, options: AVAudioSessionCategoryOptions): boolean;

	/**
	 * @since 6.0
	 */
	setInputDataSourceError(dataSource: AVAudioSessionDataSourceDescription): boolean;

	/**
	 * @since 6.0
	 */
	setInputGainError(gain: number): boolean;

	/**
	 * @since 5.0
	 */
	setModeError(mode: string): boolean;

	/**
	 * @since 6.0
	 */
	setOutputDataSourceError(dataSource: AVAudioSessionDataSourceDescription): boolean;

	/**
	 * @since 3.0
	 * @deprecated 6.0
	 */
	setPreferredHardwareSampleRateError(sampleRate: number): boolean;

	/**
	 * @since 3.0
	 */
	setPreferredIOBufferDurationError(duration: number): boolean;

	/**
	 * @since 7.0
	 */
	setPreferredInputError(inPort: AVAudioSessionPortDescription): boolean;

	/**
	 * @since 7.0
	 */
	setPreferredInputNumberOfChannelsError(count: number): boolean;

	/**
	 * @since 14.0
	 */
	setPreferredInputOrientationError(orientation: AVAudioStereoOrientation): boolean;

	/**
	 * @since 7.0
	 */
	setPreferredOutputNumberOfChannelsError(count: number): boolean;

	/**
	 * @since 6.0
	 */
	setPreferredSampleRateError(sampleRate: number): boolean;

	/**
	 * @since 17.0
	 */
	setPrefersInterruptionOnRouteDisconnectError(inValue: boolean): boolean;

	/**
	 * @since 14.5
	 */
	setPrefersNoInterruptionsFromSystemAlertsError(inValue: boolean): boolean;

	/**
	 * @since 15.0
	 */
	setSupportsMultichannelContentError(inValue: boolean): boolean;
}

declare const enum AVAudioSessionActivationOptions {

	None = 0
}

/**
 * @since 3.0
 */
declare var AVAudioSessionCategoryAmbient: string;

/**
 * @since 3.0
 * @deprecated 10.0
 */
declare var AVAudioSessionCategoryAudioProcessing: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionCategoryMultiRoute: string;

declare const enum AVAudioSessionCategoryOptions {

	MixWithOthers = 1,

	DuckOthers = 2,

	AllowBluetooth = 4,

	DefaultToSpeaker = 8,

	InterruptSpokenAudioAndMixWithOthers = 17,

	AllowBluetoothA2DP = 32,

	AllowAirPlay = 64,

	OverrideMutedMicrophoneInterruption = 128
}

/**
 * @since 3.0
 */
declare var AVAudioSessionCategoryPlayAndRecord: string;

/**
 * @since 3.0
 */
declare var AVAudioSessionCategoryPlayback: string;

/**
 * @since 3.0
 */
declare var AVAudioSessionCategoryRecord: string;

/**
 * @since 3.0
 */
declare var AVAudioSessionCategorySoloAmbient: string;

/**
 * @since 6.0
 */
declare class AVAudioSessionChannelDescription extends NSObject {

	static alloc(): AVAudioSessionChannelDescription; // inherited from NSObject

	static new(): AVAudioSessionChannelDescription; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	readonly channelLabel: number;

	/**
	 * @since 6.0
	 */
	readonly channelName: string;

	/**
	 * @since 6.0
	 */
	readonly channelNumber: number;

	/**
	 * @since 6.0
	 */
	readonly owningPortUID: string;
}

/**
 * @since 6.0
 */
declare class AVAudioSessionDataSourceDescription extends NSObject {

	static alloc(): AVAudioSessionDataSourceDescription; // inherited from NSObject

	static new(): AVAudioSessionDataSourceDescription; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	readonly dataSourceID: number;

	/**
	 * @since 6.0
	 */
	readonly dataSourceName: string;

	/**
	 * @since 7.0
	 */
	readonly location: string;

	/**
	 * @since 7.0
	 */
	readonly orientation: string;

	/**
	 * @since 7.0
	 */
	readonly preferredPolarPattern: string;

	/**
	 * @since 7.0
	 */
	readonly selectedPolarPattern: string;

	/**
	 * @since 7.0
	 */
	readonly supportedPolarPatterns: NSArray<string>;

	/**
	 * @since 7.0
	 */
	setPreferredPolarPatternError(pattern: string): boolean;
}

/**
 * @since 3.0
 * @deprecated 6.0
 */
interface AVAudioSessionDelegate extends NSObjectProtocol {

	beginInterruption?(): void;

	endInterruption?(): void;

	/**
	 * @since 4.0
	 */
	endInterruptionWithFlags?(flags: number): void;

	inputIsAvailableChanged?(isInputAvailable: boolean): void;
}
declare var AVAudioSessionDelegate: {

	prototype: AVAudioSessionDelegate;
};

declare const enum AVAudioSessionIOType {

	NotSpecified = 0,

	Aggregated = 1
}

declare const AVAudioSessionInterruptionFlags_ShouldResume: number;

/**
 * @since 6.0
 */
declare var AVAudioSessionInterruptionNotification: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionInterruptionOptionKey: string;

declare const enum AVAudioSessionInterruptionOptions {

	ShouldResume = 1
}

declare const enum AVAudioSessionInterruptionReason {

	Default = 0,

	AppWasSuspended = 1,

	BuiltInMicMuted = 2,

	RouteDisconnected = 4
}

/**
 * @since 14.5
 */
declare var AVAudioSessionInterruptionReasonKey: string;

declare const enum AVAudioSessionInterruptionType {

	Began = 1,

	Ended = 0
}

/**
 * @since 6.0
 */
declare var AVAudioSessionInterruptionTypeKey: string;

/**
 * @since 10.3
 * @deprecated 14.5
 */
declare var AVAudioSessionInterruptionWasSuspendedKey: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionLocationLower: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionLocationUpper: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionMediaServicesWereLostNotification: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionMediaServicesWereResetNotification: string;

/**
 * @since 5.0
 */
declare var AVAudioSessionModeDefault: string;

/**
 * @since 5.0
 */
declare var AVAudioSessionModeGameChat: string;

/**
 * @since 5.0
 */
declare var AVAudioSessionModeMeasurement: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionModeMoviePlayback: string;

/**
 * @since 9.0
 */
declare var AVAudioSessionModeSpokenAudio: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionModeVideoChat: string;

/**
 * @since 5.0
 */
declare var AVAudioSessionModeVideoRecording: string;

/**
 * @since 5.0
 */
declare var AVAudioSessionModeVoiceChat: string;

/**
 * @since 12.0
 */
declare var AVAudioSessionModeVoicePrompt: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionOrientationBack: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionOrientationBottom: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionOrientationFront: string;

/**
 * @since 8.0
 */
declare var AVAudioSessionOrientationLeft: string;

/**
 * @since 8.0
 */
declare var AVAudioSessionOrientationRight: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionOrientationTop: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionPolarPatternCardioid: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionPolarPatternOmnidirectional: string;

/**
 * @since 14.0
 */
declare var AVAudioSessionPolarPatternStereo: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionPolarPatternSubcardioid: string;

/**
 * @since 14.0
 */
declare var AVAudioSessionPortAVB: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortAirPlay: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortBluetoothA2DP: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortBluetoothHFP: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionPortBluetoothLE: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortBuiltInMic: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortBuiltInReceiver: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortBuiltInSpeaker: string;

/**
 * @since 7.0
 */
declare var AVAudioSessionPortCarAudio: string;

/**
 * @since 17.0
 */
declare var AVAudioSessionPortContinuityMicrophone: string;

/**
 * @since 6.0
 */
declare class AVAudioSessionPortDescription extends NSObject {

	static alloc(): AVAudioSessionPortDescription; // inherited from NSObject

	static new(): AVAudioSessionPortDescription; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	readonly UID: string;

	/**
	 * @since 6.0
	 */
	readonly channels: NSArray<AVAudioSessionChannelDescription>;

	/**
	 * @since 7.0
	 */
	readonly dataSources: NSArray<AVAudioSessionDataSourceDescription>;

	/**
	 * @since 10.0
	 */
	readonly hasHardwareVoiceCallProcessing: boolean;

	/**
	 * @since 6.0
	 */
	readonly portName: string;

	/**
	 * @since 6.0
	 */
	readonly portType: string;

	/**
	 * @since 7.0
	 */
	readonly preferredDataSource: AVAudioSessionDataSourceDescription;

	/**
	 * @since 7.0
	 */
	readonly selectedDataSource: AVAudioSessionDataSourceDescription;

	/**
	 * @since 15.0
	 */
	readonly spatialAudioEnabled: boolean;

	/**
	 * @since 7.0
	 */
	setPreferredDataSourceError(dataSource: AVAudioSessionDataSourceDescription): boolean;
}

/**
 * @since 14.0
 */
declare var AVAudioSessionPortDisplayPort: string;

/**
 * @since 14.0
 */
declare var AVAudioSessionPortFireWire: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortHDMI: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortHeadphones: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortHeadsetMic: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortLineIn: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortLineOut: string;

declare const enum AVAudioSessionPortOverride {

	None = 0,

	Speaker = 1936747378
}

/**
 * @since 14.0
 */
declare var AVAudioSessionPortPCI: string;

/**
 * @since 14.0
 */
declare var AVAudioSessionPortThunderbolt: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionPortUSBAudio: string;

/**
 * @since 14.0
 */
declare var AVAudioSessionPortVirtual: string;

declare const enum AVAudioSessionPromptStyle {

	None = 1852796517,

	Short = 1936224884,

	Normal = 1852992876
}

declare const enum AVAudioSessionRecordPermission {

	Undetermined = 1970168948,

	Denied = 1684369017,

	Granted = 1735552628
}

/**
 * @since 17.2
 */
declare var AVAudioSessionRenderingCapabilitiesChangeNotification: string;

declare const enum AVAudioSessionRenderingMode {

	NotApplicable = 0,

	MonoStereo = 1,

	Surround = 2,

	SpatialAudio = 3,

	DolbyAudio = 4,

	DolbyAtmos = 5
}

/**
 * @since 17.2
 */
declare var AVAudioSessionRenderingModeChangeNotification: string;

/**
 * @since 17.2
 */
declare var AVAudioSessionRenderingModeNewRenderingModeKey: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionRouteChangeNotification: string;

/**
 * @since 6.0
 */
declare var AVAudioSessionRouteChangePreviousRouteKey: string;

declare const enum AVAudioSessionRouteChangeReason {

	Unknown = 0,

	NewDeviceAvailable = 1,

	OldDeviceUnavailable = 2,

	CategoryChange = 3,

	Override = 4,

	WakeFromSleep = 6,

	NoSuitableRouteForCategory = 7,

	RouteConfigurationChange = 8
}

/**
 * @since 6.0
 */
declare var AVAudioSessionRouteChangeReasonKey: string;

/**
 * @since 6.0
 */
declare class AVAudioSessionRouteDescription extends NSObject {

	static alloc(): AVAudioSessionRouteDescription; // inherited from NSObject

	static new(): AVAudioSessionRouteDescription; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	readonly inputs: NSArray<AVAudioSessionPortDescription>;

	/**
	 * @since 6.0
	 */
	readonly outputs: NSArray<AVAudioSessionPortDescription>;
}

declare const enum AVAudioSessionRouteSharingPolicy {

	Default = 0,

	LongFormAudio = 1,

	LongForm = 1,

	Independent = 2,

	LongFormVideo = 3
}

declare const AVAudioSessionSetActiveFlags_NotifyOthersOnDeactivation: number;

declare const enum AVAudioSessionSetActiveOptions {

	NotifyOthersOnDeactivation = 1
}

/**
 * @since 8.0
 */
declare var AVAudioSessionSilenceSecondaryAudioHintNotification: string;

declare const enum AVAudioSessionSilenceSecondaryAudioHintType {

	Begin = 1,

	End = 0
}

/**
 * @since 8.0
 */
declare var AVAudioSessionSilenceSecondaryAudioHintTypeKey: string;

/**
 * @since 15.0
 */
declare var AVAudioSessionSpatialAudioEnabledKey: string;

/**
 * @since 15.0
 */
declare var AVAudioSessionSpatialPlaybackCapabilitiesChangedNotification: string;

/**
 * @since 13.0
 */
declare class AVAudioSinkNode extends AVAudioNode {

	static alloc(): AVAudioSinkNode; // inherited from NSObject

	static new(): AVAudioSinkNode; // inherited from NSObject

	constructor(o: { receiverBlock: (p1: interop.Pointer | interop.Reference<AudioTimeStamp>, p2: number, p3: interop.Pointer | interop.Reference<AudioBufferList>) => number; });

	initWithReceiverBlock(block: (p1: interop.Pointer | interop.Reference<AudioTimeStamp>, p2: number, p3: interop.Pointer | interop.Reference<AudioBufferList>) => number): this;
}

/**
 * @since 13.0
 */
declare class AVAudioSourceNode extends AVAudioNode implements AVAudioMixing {

	static alloc(): AVAudioSourceNode; // inherited from NSObject

	static new(): AVAudioSourceNode; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	/**
	 * @since 13.0
	 */
	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/**
	 * @since 13.0
	 */
	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	constructor(o: { format: AVAudioFormat; renderBlock: (p1: interop.Pointer | interop.Reference<boolean>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: interop.Pointer | interop.Reference<AudioBufferList>) => number; });

	constructor(o: { renderBlock: (p1: interop.Pointer | interop.Reference<boolean>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: interop.Pointer | interop.Reference<AudioBufferList>) => number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

	initWithFormatRenderBlock(format: AVAudioFormat, block: (p1: interop.Pointer | interop.Reference<boolean>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: interop.Pointer | interop.Reference<AudioBufferList>) => number): this;

	initWithRenderBlock(block: (p1: interop.Pointer | interop.Reference<boolean>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: interop.Pointer | interop.Reference<AudioBufferList>) => number): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 8.0
 */
interface AVAudioStereoMixing extends NSObjectProtocol {

	pan: number;
}
declare var AVAudioStereoMixing: {

	prototype: AVAudioStereoMixing;
};

declare const enum AVAudioStereoOrientation {

	None = 0,

	Portrait = 1,

	PortraitUpsideDown = 2,

	LandscapeRight = 3,

	LandscapeLeft = 4
}

/**
 * @since 8.0
 */
declare class AVAudioTime extends NSObject {

	static alloc(): AVAudioTime; // inherited from NSObject

	static hostTimeForSeconds(seconds: number): number;

	static new(): AVAudioTime; // inherited from NSObject

	static secondsForHostTime(hostTime: number): number;

	static timeWithAudioTimeStampSampleRate(ts: interop.Pointer | interop.Reference<AudioTimeStamp>, sampleRate: number): AVAudioTime;

	static timeWithHostTime(hostTime: number): AVAudioTime;

	static timeWithHostTimeSampleTimeAtRate(hostTime: number, sampleTime: number, sampleRate: number): AVAudioTime;

	static timeWithSampleTimeAtRate(sampleTime: number, sampleRate: number): AVAudioTime;

	readonly audioTimeStamp: AudioTimeStamp;

	readonly hostTime: number;

	readonly hostTimeValid: boolean;

	readonly sampleRate: number;

	readonly sampleTime: number;

	readonly sampleTimeValid: boolean;

	constructor(o: { audioTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>; sampleRate: number; });

	constructor(o: { hostTime: number; });

	constructor(o: { hostTime: number; sampleTime: number; atRate: number; });

	constructor(o: { sampleTime: number; atRate: number; });

	extrapolateTimeFromAnchor(anchorTime: AVAudioTime): AVAudioTime;

	initWithAudioTimeStampSampleRate(ts: interop.Pointer | interop.Reference<AudioTimeStamp>, sampleRate: number): this;

	initWithHostTime(hostTime: number): this;

	initWithHostTimeSampleTimeAtRate(hostTime: number, sampleTime: number, sampleRate: number): this;

	initWithSampleTimeAtRate(sampleTime: number, sampleRate: number): this;
}

/**
 * @since 8.0
 */
declare class AVAudioUnit extends AVAudioNode {

	static alloc(): AVAudioUnit; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static instantiateWithComponentDescriptionOptionsCompletionHandler(audioComponentDescription: AudioComponentDescription, options: AudioComponentInstantiationOptions, completionHandler: (p1: AVAudioUnit, p2: NSError) => void): void;

	static new(): AVAudioUnit; // inherited from NSObject

	readonly audioComponentDescription: AudioComponentDescription;

	readonly audioUnit: interop.Pointer | interop.Reference<any>;

	readonly manufacturerName: string;

	readonly name: string;

	readonly version: number;

	loadAudioUnitPresetAtURLError(url: NSURL): boolean;
}

/**
 * @since 9.0
 */
declare class AVAudioUnitComponent extends NSObject {

	static alloc(): AVAudioUnitComponent; // inherited from NSObject

	static new(): AVAudioUnitComponent; // inherited from NSObject

	readonly allTagNames: NSArray<string>;

	readonly audioComponent: interop.Pointer | interop.Reference<any>;

	readonly audioComponentDescription: AudioComponentDescription;

	/**
	 * @since 16.0
	 */
	readonly configurationDictionary: NSDictionary<string, any>;

	readonly hasMIDIInput: boolean;

	readonly hasMIDIOutput: boolean;

	/**
	 * @since 16.0
	 */
	readonly icon: UIImage;

	readonly localizedTypeName: string;

	readonly manufacturerName: string;

	readonly name: string;

	/**
	 * @since 16.0
	 */
	readonly passesAUVal: boolean;

	readonly sandboxSafe: boolean;

	readonly typeName: string;

	readonly version: number;

	readonly versionString: string;
}

/**
 * @since 9.0
 */
declare class AVAudioUnitComponentManager extends NSObject {

	static alloc(): AVAudioUnitComponentManager; // inherited from NSObject

	static new(): AVAudioUnitComponentManager; // inherited from NSObject

	static sharedAudioUnitComponentManager(): AVAudioUnitComponentManager;

	readonly standardLocalizedTagNames: NSArray<string>;

	readonly tagNames: NSArray<string>;

	componentsMatchingDescription(desc: AudioComponentDescription): NSArray<AVAudioUnitComponent>;

	componentsMatchingPredicate(predicate: NSPredicate): NSArray<AVAudioUnitComponent>;

	componentsPassingTest(testHandler: (p1: AVAudioUnitComponent, p2: interop.Pointer | interop.Reference<boolean>) => boolean): NSArray<AVAudioUnitComponent>;
}

/**
 * @since 13.0
 */
declare var AVAudioUnitComponentManagerRegistrationsChangedNotification: string;

/**
 * @since 9.0
 */
declare var AVAudioUnitComponentTagsDidChangeNotification: string;

/**
 * @since 8.0
 */
declare class AVAudioUnitDelay extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitDelay; // inherited from NSObject

	static new(): AVAudioUnitDelay; // inherited from NSObject

	delayTime: number;

	feedback: number;

	lowPassCutoff: number;

	wetDryMix: number;
}

/**
 * @since 8.0
 */
declare class AVAudioUnitDistortion extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitDistortion; // inherited from NSObject

	static new(): AVAudioUnitDistortion; // inherited from NSObject

	preGain: number;

	wetDryMix: number;

	loadFactoryPreset(preset: AVAudioUnitDistortionPreset): void;
}

/**
 * @since 8.0
 */
declare const enum AVAudioUnitDistortionPreset {

	DrumsBitBrush = 0,

	DrumsBufferBeats = 1,

	DrumsLoFi = 2,

	MultiBrokenSpeaker = 3,

	MultiCellphoneConcert = 4,

	MultiDecimated1 = 5,

	MultiDecimated2 = 6,

	MultiDecimated3 = 7,

	MultiDecimated4 = 8,

	MultiDistortedFunk = 9,

	MultiDistortedCubed = 10,

	MultiDistortedSquared = 11,

	MultiEcho1 = 12,

	MultiEcho2 = 13,

	MultiEchoTight1 = 14,

	MultiEchoTight2 = 15,

	MultiEverythingIsBroken = 16,

	SpeechAlienChatter = 17,

	SpeechCosmicInterference = 18,

	SpeechGoldenPi = 19,

	SpeechRadioTower = 20,

	SpeechWaves = 21
}

/**
 * @since 8.0
 */
declare class AVAudioUnitEQ extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitEQ; // inherited from NSObject

	static new(): AVAudioUnitEQ; // inherited from NSObject

	readonly bands: NSArray<AVAudioUnitEQFilterParameters>;

	globalGain: number;

	constructor(o: { numberOfBands: number; });

	initWithNumberOfBands(numberOfBands: number): this;
}

/**
 * @since 8.0
 */
declare class AVAudioUnitEQFilterParameters extends NSObject {

	static alloc(): AVAudioUnitEQFilterParameters; // inherited from NSObject

	static new(): AVAudioUnitEQFilterParameters; // inherited from NSObject

	bandwidth: number;

	bypass: boolean;

	filterType: AVAudioUnitEQFilterType;

	frequency: number;

	gain: number;
}

/**
 * @since 8.0
 */
declare const enum AVAudioUnitEQFilterType {

	Parametric = 0,

	LowPass = 1,

	HighPass = 2,

	ResonantLowPass = 3,

	ResonantHighPass = 4,

	BandPass = 5,

	BandStop = 6,

	LowShelf = 7,

	HighShelf = 8,

	ResonantLowShelf = 9,

	ResonantHighShelf = 10
}

/**
 * @since 8.0
 */
declare class AVAudioUnitEffect extends AVAudioUnit {

	static alloc(): AVAudioUnitEffect; // inherited from NSObject

	static new(): AVAudioUnitEffect; // inherited from NSObject

	bypass: boolean;

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	initWithAudioComponentDescription(audioComponentDescription: AudioComponentDescription): this;
}

/**
 * @since 8.0
 */
declare class AVAudioUnitGenerator extends AVAudioUnit implements AVAudioMixing {

	static alloc(): AVAudioUnitGenerator; // inherited from NSObject

	static new(): AVAudioUnitGenerator; // inherited from NSObject

	bypass: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	/**
	 * @since 13.0
	 */
	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/**
	 * @since 13.0
	 */
	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

	initWithAudioComponentDescription(audioComponentDescription: AudioComponentDescription): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 8.0
 */
declare class AVAudioUnitMIDIInstrument extends AVAudioUnit implements AVAudioMixing {

	static alloc(): AVAudioUnitMIDIInstrument; // inherited from NSObject

	static new(): AVAudioUnitMIDIInstrument; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	/**
	 * @since 13.0
	 */
	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/**
	 * @since 13.0
	 */
	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

	initWithAudioComponentDescription(description: AudioComponentDescription): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	sendControllerWithValueOnChannel(controller: number, value: number, channel: number): void;

	sendMIDIEventData1(midiStatus: number, data1: number): void;

	sendMIDIEventData1Data2(midiStatus: number, data1: number, data2: number): void;

	/**
	 * @since 16.0
	 */
	sendMIDIEventList(eventList: interop.Pointer | interop.Reference<MIDIEventList>): void;

	sendMIDISysExEvent(midiData: NSData): void;

	sendPitchBendOnChannel(pitchbend: number, channel: number): void;

	sendPressureForKeyWithValueOnChannel(key: number, value: number, channel: number): void;

	sendPressureOnChannel(pressure: number, channel: number): void;

	sendProgramChangeBankMSBBankLSBOnChannel(program: number, bankMSB: number, bankLSB: number, channel: number): void;

	sendProgramChangeOnChannel(program: number, channel: number): void;

	startNoteWithVelocityOnChannel(note: number, velocity: number, channel: number): void;

	stopNoteOnChannel(note: number, channel: number): void;
}

/**
 * @since 9.0
 */
declare var AVAudioUnitManufacturerNameApple: string;

/**
 * @since 8.0
 */
declare class AVAudioUnitReverb extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitReverb; // inherited from NSObject

	static new(): AVAudioUnitReverb; // inherited from NSObject

	wetDryMix: number;

	loadFactoryPreset(preset: AVAudioUnitReverbPreset): void;
}

/**
 * @since 8.0
 */
declare const enum AVAudioUnitReverbPreset {

	SmallRoom = 0,

	MediumRoom = 1,

	LargeRoom = 2,

	MediumHall = 3,

	LargeHall = 4,

	Plate = 5,

	MediumChamber = 6,

	LargeChamber = 7,

	Cathedral = 8,

	LargeRoom2 = 9,

	MediumHall2 = 10,

	MediumHall3 = 11,

	LargeHall2 = 12
}

/**
 * @since 8.0
 */
declare class AVAudioUnitSampler extends AVAudioUnitMIDIInstrument {

	static alloc(): AVAudioUnitSampler; // inherited from NSObject

	static new(): AVAudioUnitSampler; // inherited from NSObject

	globalTuning: number;

	/**
	 * @since 8.0
	 * @deprecated 15.0
	 */
	masterGain: number;

	/**
	 * @since 15.0
	 */
	overallGain: number;

	stereoPan: number;

	loadAudioFilesAtURLsError(audioFiles: NSArray<NSURL> | NSURL[]): boolean;

	loadInstrumentAtURLError(instrumentURL: NSURL): boolean;

	loadSoundBankInstrumentAtURLProgramBankMSBBankLSBError(bankURL: NSURL, program: number, bankMSB: number, bankLSB: number): boolean;
}

/**
 * @since 8.0
 */
declare class AVAudioUnitTimeEffect extends AVAudioUnit {

	static alloc(): AVAudioUnitTimeEffect; // inherited from NSObject

	static new(): AVAudioUnitTimeEffect; // inherited from NSObject

	bypass: boolean;

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	initWithAudioComponentDescription(audioComponentDescription: AudioComponentDescription): this;
}

/**
 * @since 8.0
 */
declare class AVAudioUnitTimePitch extends AVAudioUnitTimeEffect {

	static alloc(): AVAudioUnitTimePitch; // inherited from NSObject

	static new(): AVAudioUnitTimePitch; // inherited from NSObject

	overlap: number;

	pitch: number;

	rate: number;
}

/**
 * @since 9.0
 */
declare var AVAudioUnitTypeEffect: string;

/**
 * @since 9.0
 */
declare var AVAudioUnitTypeFormatConverter: string;

/**
 * @since 9.0
 */
declare var AVAudioUnitTypeGenerator: string;

/**
 * @since 9.0
 */
declare var AVAudioUnitTypeMIDIProcessor: string;

/**
 * @since 9.0
 */
declare var AVAudioUnitTypeMixer: string;

/**
 * @since 9.0
 */
declare var AVAudioUnitTypeMusicDevice: string;

/**
 * @since 9.0
 */
declare var AVAudioUnitTypeMusicEffect: string;

/**
 * @since 9.0
 */
declare var AVAudioUnitTypeOfflineEffect: string;

/**
 * @since 9.0
 */
declare var AVAudioUnitTypeOutput: string;

/**
 * @since 9.0
 */
declare var AVAudioUnitTypePanner: string;

/**
 * @since 8.0
 */
declare class AVAudioUnitVarispeed extends AVAudioUnitTimeEffect {

	static alloc(): AVAudioUnitVarispeed; // inherited from NSObject

	static new(): AVAudioUnitVarispeed; // inherited from NSObject

	rate: number;
}

/**
 * @since 17.0
 */
interface AVAudioVoiceProcessingOtherAudioDuckingConfiguration {
	enableAdvancedDucking: boolean;
	duckingLevel: AVAudioVoiceProcessingOtherAudioDuckingLevel;
}
declare var AVAudioVoiceProcessingOtherAudioDuckingConfiguration: interop.StructType<AVAudioVoiceProcessingOtherAudioDuckingConfiguration>;

/**
 * @since 17.0
 */
declare const enum AVAudioVoiceProcessingOtherAudioDuckingLevel {

	Default = 0,

	Min = 10,

	Mid = 20,

	Max = 30
}

/**
 * @since 17.0
 */
declare const enum AVAudioVoiceProcessingSpeechActivityEvent {

	Started = 0,

	Ended = 1
}

interface AVBeatRange {
	start: number;
	length: number;
}
declare var AVBeatRange: interop.StructType<AVBeatRange>;

/**
 * @since 4.0
 */
declare var AVChannelLayoutKey: string;

/**
 * @since 7.0
 */
declare var AVEncoderAudioQualityForVBRKey: string;

/**
 * @since 3.0
 */
declare var AVEncoderAudioQualityKey: string;

/**
 * @since 3.0
 */
declare var AVEncoderBitDepthHintKey: string;

/**
 * @since 3.0
 */
declare var AVEncoderBitRateKey: string;

/**
 * @since 4.0
 */
declare var AVEncoderBitRatePerChannelKey: string;

/**
 * @since 7.0
 */
declare var AVEncoderBitRateStrategyKey: string;

/**
 * @since 16.0
 */
declare class AVExtendedNoteOnEvent extends AVMusicEvent {

	static alloc(): AVExtendedNoteOnEvent; // inherited from NSObject

	static new(): AVExtendedNoteOnEvent; // inherited from NSObject

	duration: number;

	groupID: number;

	instrumentID: number;

	midiNote: number;

	velocity: number;

	constructor(o: { MIDINote: number; velocity: number; groupID: number; duration: number; });

	constructor(o: { MIDINote: number; velocity: number; instrumentID: number; groupID: number; duration: number; });

	initWithMIDINoteVelocityGroupIDDuration(midiNote: number, velocity: number, groupID: number, duration: number): this;

	initWithMIDINoteVelocityInstrumentIDGroupIDDuration(midiNote: number, velocity: number, instrumentID: number, groupID: number, duration: number): this;
}

/**
 * @since 16.0
 */
declare var AVExtendedNoteOnEventDefaultInstrument: number;

/**
 * @since 16.0
 */
declare class AVExtendedTempoEvent extends AVMusicEvent {

	static alloc(): AVExtendedTempoEvent; // inherited from NSObject

	static new(): AVExtendedTempoEvent; // inherited from NSObject

	tempo: number;

	constructor(o: { tempo: number; });

	initWithTempo(tempo: number): this;
}

/**
 * @since 3.0
 */
declare var AVFormatIDKey: string;

/**
 * @since 3.0
 */
declare var AVLinearPCMBitDepthKey: string;

/**
 * @since 3.0
 */
declare var AVLinearPCMIsBigEndianKey: string;

/**
 * @since 3.0
 */
declare var AVLinearPCMIsFloatKey: string;

/**
 * @since 4.0
 */
declare var AVLinearPCMIsNonInterleaved: string;

/**
 * @since 16.0
 */
declare class AVMIDIChannelEvent extends AVMusicEvent {

	static alloc(): AVMIDIChannelEvent; // inherited from NSObject

	static new(): AVMIDIChannelEvent; // inherited from NSObject

	channel: number;
}

/**
 * @since 16.0
 */
declare class AVMIDIChannelPressureEvent extends AVMIDIChannelEvent {

	static alloc(): AVMIDIChannelPressureEvent; // inherited from NSObject

	static new(): AVMIDIChannelPressureEvent; // inherited from NSObject

	pressure: number;

	constructor(o: { channel: number; pressure: number; });

	initWithChannelPressure(channel: number, pressure: number): this;
}

/**
 * @since 16.0
 */
declare class AVMIDIControlChangeEvent extends AVMIDIChannelEvent {

	static alloc(): AVMIDIControlChangeEvent; // inherited from NSObject

	static new(): AVMIDIControlChangeEvent; // inherited from NSObject

	readonly messageType: AVMIDIControlChangeMessageType;

	readonly value: number;

	constructor(o: { channel: number; messageType: AVMIDIControlChangeMessageType; value: number; });

	initWithChannelMessageTypeValue(channel: number, messageType: AVMIDIControlChangeMessageType, value: number): this;
}

/**
 * @since 16.0
 */
declare const enum AVMIDIControlChangeMessageType {

	BankSelect = 0,

	ModWheel = 1,

	Breath = 2,

	Foot = 4,

	PortamentoTime = 5,

	DataEntry = 6,

	Volume = 7,

	Balance = 8,

	Pan = 10,

	Expression = 11,

	Sustain = 64,

	Portamento = 65,

	Sostenuto = 66,

	Soft = 67,

	LegatoPedal = 68,

	Hold2Pedal = 69,

	FilterResonance = 71,

	ReleaseTime = 72,

	AttackTime = 73,

	Brightness = 74,

	DecayTime = 75,

	VibratoRate = 76,

	VibratoDepth = 77,

	VibratoDelay = 78,

	ReverbLevel = 91,

	ChorusLevel = 93,

	RPN_LSB = 100,

	RPN_MSB = 101,

	AllSoundOff = 120,

	ResetAllControllers = 121,

	AllNotesOff = 123,

	OmniModeOff = 124,

	OmniModeOn = 125,

	MonoModeOn = 126,

	MonoModeOff = 127
}

/**
 * @since 16.0
 */
declare class AVMIDIMetaEvent extends AVMusicEvent {

	static alloc(): AVMIDIMetaEvent; // inherited from NSObject

	static new(): AVMIDIMetaEvent; // inherited from NSObject

	readonly type: AVMIDIMetaEventType;

	constructor(o: { type: AVMIDIMetaEventType; data: NSData; });

	initWithTypeData(type: AVMIDIMetaEventType, data: NSData): this;
}

/**
 * @since 16.0
 */
declare const enum AVMIDIMetaEventType {

	SequenceNumber = 0,

	Text = 1,

	Copyright = 2,

	TrackName = 3,

	Instrument = 4,

	Lyric = 5,

	Marker = 6,

	CuePoint = 7,

	MidiChannel = 32,

	MidiPort = 33,

	EndOfTrack = 47,

	Tempo = 81,

	SmpteOffset = 84,

	TimeSignature = 88,

	KeySignature = 89,

	ProprietaryEvent = 127
}

/**
 * @since 16.0
 */
declare class AVMIDINoteEvent extends AVMusicEvent {

	static alloc(): AVMIDINoteEvent; // inherited from NSObject

	static new(): AVMIDINoteEvent; // inherited from NSObject

	channel: number;

	duration: number;

	key: number;

	velocity: number;

	constructor(o: { channel: number; key: number; velocity: number; duration: number; });

	initWithChannelKeyVelocityDuration(channel: number, keyNum: number, velocity: number, duration: number): this;
}

/**
 * @since 16.0
 */
declare class AVMIDIPitchBendEvent extends AVMIDIChannelEvent {

	static alloc(): AVMIDIPitchBendEvent; // inherited from NSObject

	static new(): AVMIDIPitchBendEvent; // inherited from NSObject

	value: number;

	constructor(o: { channel: number; value: number; });

	initWithChannelValue(channel: number, value: number): this;
}

/**
 * @since 8.0
 */
declare class AVMIDIPlayer extends NSObject {

	static alloc(): AVMIDIPlayer; // inherited from NSObject

	static new(): AVMIDIPlayer; // inherited from NSObject

	currentPosition: number;

	readonly duration: number;

	readonly playing: boolean;

	rate: number;

	constructor(o: { contentsOfURL: NSURL; soundBankURL: NSURL; });

	constructor(o: { data: NSData; soundBankURL: NSURL; });

	initWithContentsOfURLSoundBankURLError(inURL: NSURL, bankURL: NSURL): this;

	initWithDataSoundBankURLError(data: NSData, bankURL: NSURL): this;

	play(completionHandler: () => void): void;

	prepareToPlay(): void;

	stop(): void;
}

/**
 * @since 16.0
 */
declare class AVMIDIPolyPressureEvent extends AVMIDIChannelEvent {

	static alloc(): AVMIDIPolyPressureEvent; // inherited from NSObject

	static new(): AVMIDIPolyPressureEvent; // inherited from NSObject

	key: number;

	pressure: number;

	constructor(o: { channel: number; key: number; pressure: number; });

	initWithChannelKeyPressure(channel: number, key: number, pressure: number): this;
}

/**
 * @since 16.0
 */
declare class AVMIDIProgramChangeEvent extends AVMIDIChannelEvent {

	static alloc(): AVMIDIProgramChangeEvent; // inherited from NSObject

	static new(): AVMIDIProgramChangeEvent; // inherited from NSObject

	programNumber: number;

	constructor(o: { channel: number; programNumber: number; });

	initWithChannelProgramNumber(channel: number, programNumber: number): this;
}

/**
 * @since 16.0
 */
declare class AVMIDISysexEvent extends AVMusicEvent {

	static alloc(): AVMIDISysexEvent; // inherited from NSObject

	static new(): AVMIDISysexEvent; // inherited from NSObject

	readonly sizeInBytes: number;

	constructor(o: { data: NSData; });

	initWithData(data: NSData): this;
}

/**
 * @since 16.0
 */
declare class AVMusicEvent extends NSObject {

	static alloc(): AVMusicEvent; // inherited from NSObject

	static new(): AVMusicEvent; // inherited from NSObject
}

declare const enum AVMusicSequenceLoadOptions {

	SMF_PreserveTracks = 0,

	SMF_ChannelsToTracks = 1
}

/**
 * @since 9.0
 */
declare class AVMusicTrack extends NSObject {

	static alloc(): AVMusicTrack; // inherited from NSObject

	static new(): AVMusicTrack; // inherited from NSObject

	destinationAudioUnit: AVAudioUnit;

	destinationMIDIEndpoint: number;

	lengthInBeats: number;

	lengthInSeconds: number;

	loopRange: AVBeatRange;

	loopingEnabled: boolean;

	muted: boolean;

	numberOfLoops: number;

	offsetTime: number;

	soloed: boolean;

	readonly timeResolution: number;

	usesAutomatedParameters: boolean;

	addEventAtBeat(event: AVMusicEvent, beat: number): void;

	clearEventsInRange(range: AVBeatRange): void;

	copyAndMergeEventsInRangeFromTrackMergeAtBeat(range: AVBeatRange, sourceTrack: AVMusicTrack, mergeStartBeat: number): void;

	copyEventsInRangeFromTrackInsertAtBeat(range: AVBeatRange, sourceTrack: AVMusicTrack, insertStartBeat: number): void;

	cutEventsInRange(range: AVBeatRange): void;

	enumerateEventsInRangeUsingBlock(range: AVBeatRange, block: (p1: AVMusicEvent, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	moveEventsInRangeByAmount(range: AVBeatRange, beatAmount: number): void;
}

/**
 * @since 8.0
 */
declare const enum AVMusicTrackLoopCount {

	Forever = -1
}

/**
 * @since 16.0
 */
declare class AVMusicUserEvent extends AVMusicEvent {

	static alloc(): AVMusicUserEvent; // inherited from NSObject

	static new(): AVMusicUserEvent; // inherited from NSObject

	readonly sizeInBytes: number;

	constructor(o: { data: NSData; });

	initWithData(data: NSData): this;
}

/**
 * @since 3.0
 */
declare var AVNumberOfChannelsKey: string;

/**
 * @since 16.0
 */
declare class AVParameterEvent extends AVMusicEvent {

	static alloc(): AVParameterEvent; // inherited from NSObject

	static new(): AVParameterEvent; // inherited from NSObject

	element: number;

	parameterID: number;

	scope: number;

	value: number;

	constructor(o: { parameterID: number; scope: number; element: number; value: number; });

	initWithParameterIDScopeElementValue(parameterID: number, scope: number, element: number, value: number): this;
}

/**
 * @since 7.0
 */
declare var AVSampleRateConverterAlgorithmKey: string;

/**
 * @since 7.0
 */
declare var AVSampleRateConverterAlgorithm_Mastering: string;

/**
 * @since 10.0
 */
declare var AVSampleRateConverterAlgorithm_MinimumPhase: string;

/**
 * @since 7.0
 */
declare var AVSampleRateConverterAlgorithm_Normal: string;

/**
 * @since 7.0
 */
declare var AVSampleRateConverterAudioQualityKey: string;

/**
 * @since 3.0
 */
declare var AVSampleRateKey: string;

/**
 * @since 7.0
 */
declare const enum AVSpeechBoundary {

	Immediate = 0,

	Word = 1
}

/**
 * @since 17.0
 */
declare var AVSpeechSynthesisAvailableVoicesDidChangeNotification: string;

/**
 * @since 10.0
 */
declare var AVSpeechSynthesisIPANotationAttribute: string;

/**
 * @since 16.0
 */
declare class AVSpeechSynthesisMarker extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AVSpeechSynthesisMarker; // inherited from NSObject

	static new(): AVSpeechSynthesisMarker; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	bookmarkName: string;

	byteSampleOffset: number;

	mark: AVSpeechSynthesisMarkerMark;

	/**
	 * @since 17.0
	 */
	phoneme: string;

	textRange: NSRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 17.0
	 */
	constructor(o: { bookmarkName: string; atByteSampleOffset: number; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { markerType: AVSpeechSynthesisMarkerMark; forTextRange: NSRange; atByteSampleOffset: number; });

	/**
	 * @since 17.0
	 */
	constructor(o: { paragraphRange: NSRange; atByteSampleOffset: number; });

	/**
	 * @since 17.0
	 */
	constructor(o: { phonemeString: string; atByteSampleOffset: number; });

	/**
	 * @since 17.0
	 */
	constructor(o: { sentenceRange: NSRange; atByteSampleOffset: number; });

	/**
	 * @since 17.0
	 */
	constructor(o: { wordRange: NSRange; atByteSampleOffset: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 17.0
	 */
	initWithBookmarkNameAtByteSampleOffset(mark: string, byteSampleOffset: number): this;

	initWithCoder(coder: NSCoder): this;

	initWithMarkerTypeForTextRangeAtByteSampleOffset(type: AVSpeechSynthesisMarkerMark, range: NSRange, byteSampleOffset: number): this;

	/**
	 * @since 17.0
	 */
	initWithParagraphRangeAtByteSampleOffset(range: NSRange, byteSampleOffset: number): this;

	/**
	 * @since 17.0
	 */
	initWithPhonemeStringAtByteSampleOffset(phoneme: string, byteSampleOffset: number): this;

	/**
	 * @since 17.0
	 */
	initWithSentenceRangeAtByteSampleOffset(range: NSRange, byteSampleOffset: number): this;

	/**
	 * @since 17.0
	 */
	initWithWordRangeAtByteSampleOffset(range: NSRange, byteSampleOffset: number): this;
}

/**
 * @since 16.0
 */
declare const enum AVSpeechSynthesisMarkerMark {

	Phoneme = 0,

	Word = 1,

	Sentence = 2,

	Paragraph = 3,

	Bookmark = 4
}

/**
 * @since 17.0
 */
declare const enum AVSpeechSynthesisPersonalVoiceAuthorizationStatus {

	NotDetermined = 0,

	Denied = 1,

	Unsupported = 2,

	Authorized = 3
}

/**
 * @since 16.0
 */
declare class AVSpeechSynthesisProviderAudioUnit extends AUAudioUnit {

	static alloc(): AVSpeechSynthesisProviderAudioUnit; // inherited from NSObject

	static new(): AVSpeechSynthesisProviderAudioUnit; // inherited from NSObject

	speechSynthesisOutputMetadataBlock: (p1: NSArray<AVSpeechSynthesisMarker>, p2: AVSpeechSynthesisProviderRequest) => void;

	speechVoices: NSArray<AVSpeechSynthesisProviderVoice>;

	cancelSpeechRequest(): void;

	synthesizeSpeechRequest(speechRequest: AVSpeechSynthesisProviderRequest): void;
}

/**
 * @since 16.0
 */
declare class AVSpeechSynthesisProviderRequest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AVSpeechSynthesisProviderRequest; // inherited from NSObject

	static new(): AVSpeechSynthesisProviderRequest; // inherited from NSObject

	readonly ssmlRepresentation: string;

	readonly voice: AVSpeechSynthesisProviderVoice;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { SSMLRepresentation: string; voice: AVSpeechSynthesisProviderVoice; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSSMLRepresentationVoice(text: string, voice: AVSpeechSynthesisProviderVoice): this;
}

/**
 * @since 16.0
 */
declare class AVSpeechSynthesisProviderVoice extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AVSpeechSynthesisProviderVoice; // inherited from NSObject

	static new(): AVSpeechSynthesisProviderVoice; // inherited from NSObject

	static updateSpeechVoices(): void;

	age: number;

	gender: AVSpeechSynthesisVoiceGender;

	readonly identifier: string;

	readonly name: string;

	readonly primaryLanguages: NSArray<string>;

	readonly supportedLanguages: NSArray<string>;

	version: string;

	voiceSize: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; identifier: string; primaryLanguages: NSArray<string> | string[]; supportedLanguages: NSArray<string> | string[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameIdentifierPrimaryLanguagesSupportedLanguages(name: string, identifier: string, primaryLanguages: NSArray<string> | string[], supportedLanguages: NSArray<string> | string[]): this;
}

/**
 * @since 7.0
 */
declare class AVSpeechSynthesisVoice extends NSObject implements NSSecureCoding {

	static alloc(): AVSpeechSynthesisVoice; // inherited from NSObject

	static currentLanguageCode(): string;

	static new(): AVSpeechSynthesisVoice; // inherited from NSObject

	static speechVoices(): NSArray<AVSpeechSynthesisVoice>;

	/**
	 * @since 9.0
	 */
	static voiceWithIdentifier(identifier: string): AVSpeechSynthesisVoice;

	static voiceWithLanguage(languageCode: string): AVSpeechSynthesisVoice;

	/**
	 * @since 13.0
	 */
	readonly audioFileSettings: NSDictionary<string, any>;

	/**
	 * @since 13.0
	 */
	readonly gender: AVSpeechSynthesisVoiceGender;

	/**
	 * @since 9.0
	 */
	readonly identifier: string;

	readonly language: string;

	/**
	 * @since 9.0
	 */
	readonly name: string;

	/**
	 * @since 9.0
	 */
	readonly quality: AVSpeechSynthesisVoiceQuality;

	/**
	 * @since 17.0
	 */
	readonly voiceTraits: AVSpeechSynthesisVoiceTraits;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare const enum AVSpeechSynthesisVoiceGender {

	Unspecified = 0,

	Male = 1,

	Female = 2
}

/**
 * @since 9.0
 */
declare var AVSpeechSynthesisVoiceIdentifierAlex: string;

/**
 * @since 9.0
 */
declare const enum AVSpeechSynthesisVoiceQuality {

	Default = 1,

	Enhanced = 2,

	Premium = 3
}

/**
 * @since 17.0
 */
declare const enum AVSpeechSynthesisVoiceTraits {

	None = 0,

	IsNoveltyVoice = 1,

	IsPersonalVoice = 2
}

/**
 * @since 7.0
 */
declare class AVSpeechSynthesizer extends NSObject {

	static alloc(): AVSpeechSynthesizer; // inherited from NSObject

	static new(): AVSpeechSynthesizer; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static requestPersonalVoiceAuthorizationWithCompletionHandler(handler: (p1: AVSpeechSynthesisPersonalVoiceAuthorizationStatus) => void): void;

	delegate: AVSpeechSynthesizerDelegate;

	/**
	 * @since 13.0
	 */
	mixToTelephonyUplink: boolean;

	/**
	 * @since 10.0
	 */
	outputChannels: NSArray<AVAudioSessionChannelDescription>;

	readonly paused: boolean;

	readonly speaking: boolean;

	/**
	 * @since 13.0
	 */
	usesApplicationAudioSession: boolean;

	/**
	 * @since 17.0
	 */
	static readonly personalVoiceAuthorizationStatus: AVSpeechSynthesisPersonalVoiceAuthorizationStatus;

	continueSpeaking(): boolean;

	pauseSpeakingAtBoundary(boundary: AVSpeechBoundary): boolean;

	speakUtterance(utterance: AVSpeechUtterance): void;

	stopSpeakingAtBoundary(boundary: AVSpeechBoundary): boolean;

	/**
	 * @since 13.0
	 */
	writeUtteranceToBufferCallback(utterance: AVSpeechUtterance, bufferCallback: (p1: AVAudioBuffer) => void): void;

	/**
	 * @since 16.0
	 */
	writeUtteranceToBufferCallbackToMarkerCallback(utterance: AVSpeechUtterance, bufferCallback: (p1: AVAudioBuffer) => void, markerCallback: (p1: NSArray<AVSpeechSynthesisMarker>) => void): void;
}

interface AVSpeechSynthesizerDelegate extends NSObjectProtocol {

	/**
	 * @since 7.0
	 */
	speechSynthesizerDidCancelSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	/**
	 * @since 7.0
	 */
	speechSynthesizerDidContinueSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	/**
	 * @since 7.0
	 */
	speechSynthesizerDidFinishSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	/**
	 * @since 7.0
	 */
	speechSynthesizerDidPauseSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	/**
	 * @since 7.0
	 */
	speechSynthesizerDidStartSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	/**
	 * @since 17.0
	 */
	speechSynthesizerWillSpeakMarkerUtterance?(synthesizer: AVSpeechSynthesizer, marker: AVSpeechSynthesisMarker, utterance: AVSpeechUtterance): void;

	/**
	 * @since 7.0
	 */
	speechSynthesizerWillSpeakRangeOfSpeechStringUtterance?(synthesizer: AVSpeechSynthesizer, characterRange: NSRange, utterance: AVSpeechUtterance): void;
}
declare var AVSpeechSynthesizerDelegate: {

	prototype: AVSpeechSynthesizerDelegate;
};

/**
 * @since 7.0
 */
declare class AVSpeechUtterance extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AVSpeechUtterance; // inherited from NSObject

	static new(): AVSpeechUtterance; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static speechUtteranceWithAttributedString(string: NSAttributedString): AVSpeechUtterance;

	/**
	 * @since 16.0
	 */
	static speechUtteranceWithSSMLRepresentation(string: string): AVSpeechUtterance;

	static speechUtteranceWithString(string: string): AVSpeechUtterance;

	/**
	 * @since 10.0
	 */
	readonly attributedSpeechString: NSAttributedString;

	pitchMultiplier: number;

	postUtteranceDelay: number;

	preUtteranceDelay: number;

	/**
	 * @since 14.0
	 */
	prefersAssistiveTechnologySettings: boolean;

	rate: number;

	readonly speechString: string;

	voice: AVSpeechSynthesisVoice;

	volume: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 10.0
	 */
	constructor(o: { attributedString: NSAttributedString; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 16.0
	 */
	constructor(o: { SSMLRepresentation: string; });

	constructor(o: { string: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 10.0
	 */
	initWithAttributedString(string: NSAttributedString): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 16.0
	 */
	initWithSSMLRepresentation(string: string): this;

	initWithString(string: string): this;
}

/**
 * @since 7.0
 */
declare var AVSpeechUtteranceDefaultSpeechRate: number;

/**
 * @since 7.0
 */
declare var AVSpeechUtteranceMaximumSpeechRate: number;

/**
 * @since 7.0
 */
declare var AVSpeechUtteranceMinimumSpeechRate: number;
