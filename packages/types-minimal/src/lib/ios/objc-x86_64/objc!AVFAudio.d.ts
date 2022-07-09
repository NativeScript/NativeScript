
interface AVAudio3DAngularOrientation {
	yaw: number;
	pitch: number;
	roll: number;
}
declare var AVAudio3DAngularOrientation: interop.StructType<AVAudio3DAngularOrientation>;

interface AVAudio3DMixing extends NSObjectProtocol {

	obstruction: number;

	occlusion: number;

	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode;

	position: AVAudio3DPoint;

	rate: number;

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm;

	reverbBlend: number;

	sourceMode: AVAudio3DMixingSourceMode;
}
declare var AVAudio3DMixing: {

	prototype: AVAudio3DMixing;
};

declare const enum AVAudio3DMixingPointSourceInHeadMode {

	Mono = 0,

	Bypass = 1
}

declare const enum AVAudio3DMixingRenderingAlgorithm {

	EqualPowerPanning = 0,

	SphericalHead = 1,

	HRTF = 2,

	SoundField = 3,

	StereoPassThrough = 5,

	HRTFHQ = 6,

	Auto = 7
}

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

declare var AVAudioBitRateStrategy_Constant: string;

declare var AVAudioBitRateStrategy_LongTermAverage: string;

declare var AVAudioBitRateStrategy_Variable: string;

declare var AVAudioBitRateStrategy_VariableConstrained: string;

declare class AVAudioBuffer extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVAudioBuffer; // inherited from NSObject

	static new(): AVAudioBuffer; // inherited from NSObject

	readonly audioBufferList: interop.Pointer | interop.Reference<AudioBufferList>;

	readonly format: AVAudioFormat;

	readonly mutableAudioBufferList: interop.Pointer | interop.Reference<AudioBufferList>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

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

declare const enum AVAudioCommonFormat {

	OtherFormat = 0,

	PCMFormatFloat32 = 1,

	PCMFormatFloat64 = 2,

	PCMFormatInt16 = 3,

	PCMFormatInt32 = 4
}

declare class AVAudioCompressedBuffer extends AVAudioBuffer {

	static alloc(): AVAudioCompressedBuffer; // inherited from NSObject

	static new(): AVAudioCompressedBuffer; // inherited from NSObject

	readonly byteCapacity: number;

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

declare class AVAudioConnectionPoint extends NSObject {

	static alloc(): AVAudioConnectionPoint; // inherited from NSObject

	static new(): AVAudioConnectionPoint; // inherited from NSObject

	readonly bus: number;

	readonly node: AVAudioNode;

	constructor(o: { node: AVAudioNode; bus: number; });

	initWithNodeBus(node: AVAudioNode, bus: number): this;
}

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

declare const enum AVAudioConverterInputStatus {

	HaveData = 0,

	NoDataNow = 1,

	EndOfStream = 2
}

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

declare class AVAudioEngine extends NSObject {

	static alloc(): AVAudioEngine; // inherited from NSObject

	static new(): AVAudioEngine; // inherited from NSObject

	readonly attachedNodes: NSSet<AVAudioNode>;

	autoShutdownEnabled: boolean;

	readonly inputNode: AVAudioInputNode;

	readonly isInManualRenderingMode: boolean;

	readonly mainMixerNode: AVAudioMixerNode;

	readonly manualRenderingBlock: (p1: number, p2: interop.Pointer | interop.Reference<AudioBufferList>, p3: interop.Pointer | interop.Reference<number>) => AVAudioEngineManualRenderingStatus;

	readonly manualRenderingFormat: AVAudioFormat;

	readonly manualRenderingMaximumFrameCount: number;

	readonly manualRenderingMode: AVAudioEngineManualRenderingMode;

	readonly manualRenderingSampleTime: number;

	musicSequence: interop.Pointer | interop.Reference<any>;

	readonly outputNode: AVAudioOutputNode;

	readonly running: boolean;

	attachNode(node: AVAudioNode): void;

	connectMIDIToFormatBlock(sourceNode: AVAudioNode, destinationNode: AVAudioNode, format: AVAudioFormat, tapBlock: (p1: number, p2: number, p3: number, p4: string) => number): void;

	connectMIDIToNodesFormatBlock(sourceNode: AVAudioNode, destinationNodes: NSArray<AVAudioNode> | AVAudioNode[], format: AVAudioFormat, tapBlock: (p1: number, p2: number, p3: number, p4: string) => number): void;

	connectToConnectionPointsFromBusFormat(sourceNode: AVAudioNode, destNodes: NSArray<AVAudioConnectionPoint> | AVAudioConnectionPoint[], sourceBus: number, format: AVAudioFormat): void;

	connectToFormat(node1: AVAudioNode, node2: AVAudioNode, format: AVAudioFormat): void;

	connectToFromBusToBusFormat(node1: AVAudioNode, node2: AVAudioNode, bus1: number, bus2: number, format: AVAudioFormat): void;

	detachNode(node: AVAudioNode): void;

	disableManualRenderingMode(): void;

	disconnectMIDIFrom(sourceNode: AVAudioNode, destinationNode: AVAudioNode): void;

	disconnectMIDIFromNodes(sourceNode: AVAudioNode, destinationNodes: NSArray<AVAudioNode> | AVAudioNode[]): void;

	disconnectMIDIInput(node: AVAudioNode): void;

	disconnectMIDIOutput(node: AVAudioNode): void;

	disconnectNodeInput(node: AVAudioNode): void;

	disconnectNodeInputBus(node: AVAudioNode, bus: number): void;

	disconnectNodeOutput(node: AVAudioNode): void;

	disconnectNodeOutputBus(node: AVAudioNode, bus: number): void;

	enableManualRenderingModeFormatMaximumFrameCountError(mode: AVAudioEngineManualRenderingMode, pcmFormat: AVAudioFormat, maximumFrameCount: number): boolean;

	inputConnectionPointForNodeInputBus(node: AVAudioNode, bus: number): AVAudioConnectionPoint;

	outputConnectionPointsForNodeOutputBus(node: AVAudioNode, bus: number): NSArray<AVAudioConnectionPoint>;

	pause(): void;

	prepare(): void;

	renderOfflineToBufferError(numberOfFrames: number, buffer: AVAudioPCMBuffer): AVAudioEngineManualRenderingStatus;

	reset(): void;

	startAndReturnError(): boolean;

	stop(): void;
}

declare var AVAudioEngineConfigurationChangeNotification: string;

declare const enum AVAudioEngineManualRenderingError {

	InvalidMode = -80800,

	Initialized = -80801,

	NotRunning = -80802
}

declare const enum AVAudioEngineManualRenderingMode {

	Offline = 0,

	Realtime = 1
}

declare const enum AVAudioEngineManualRenderingStatus {

	Error = -1,

	Success = 0,

	InsufficientDataFromInputNode = 1,

	CannotDoInCurrentContext = 2
}

declare const enum AVAudioEnvironmentDistanceAttenuationModel {

	Exponential = 1,

	Inverse = 2,

	Linear = 3
}

declare class AVAudioEnvironmentDistanceAttenuationParameters extends NSObject {

	static alloc(): AVAudioEnvironmentDistanceAttenuationParameters; // inherited from NSObject

	static new(): AVAudioEnvironmentDistanceAttenuationParameters; // inherited from NSObject

	distanceAttenuationModel: AVAudioEnvironmentDistanceAttenuationModel;

	maximumDistance: number;

	referenceDistance: number;

	rolloffFactor: number;
}

declare class AVAudioEnvironmentNode extends AVAudioNode implements AVAudioMixing {

	static alloc(): AVAudioEnvironmentNode; // inherited from NSObject

	static new(): AVAudioEnvironmentNode; // inherited from NSObject

	readonly applicableRenderingAlgorithms: NSArray<number>;

	readonly distanceAttenuationParameters: AVAudioEnvironmentDistanceAttenuationParameters;

	listenerAngularOrientation: AVAudio3DAngularOrientation;

	listenerPosition: AVAudio3DPoint;

	listenerVectorOrientation: AVAudio3DVectorOrientation;

	readonly nextAvailableInputBus: number;

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

	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

declare const enum AVAudioEnvironmentOutputType {

	Auto = 0,

	Headphones = 1,

	BuiltInSpeakers = 2,

	ExternalSpeakers = 3
}

declare class AVAudioEnvironmentReverbParameters extends NSObject {

	static alloc(): AVAudioEnvironmentReverbParameters; // inherited from NSObject

	static new(): AVAudioEnvironmentReverbParameters; // inherited from NSObject

	enable: boolean;

	readonly filterParameters: AVAudioUnitEQFilterParameters;

	level: number;

	loadFactoryReverbPreset(preset: AVAudioUnitReverbPreset): void;
}

declare class AVAudioFile extends NSObject {

	static alloc(): AVAudioFile; // inherited from NSObject

	static new(): AVAudioFile; // inherited from NSObject

	readonly fileFormat: AVAudioFormat;

	framePosition: number;

	readonly length: number;

	readonly processingFormat: AVAudioFormat;

	readonly url: NSURL;

	constructor(o: { forReading: NSURL; commonFormat: AVAudioCommonFormat; interleaved: boolean; });

	constructor(o: { forReading: NSURL; });

	constructor(o: { forWriting: NSURL; settings: NSDictionary<string, any>; commonFormat: AVAudioCommonFormat; interleaved: boolean; });

	constructor(o: { forWriting: NSURL; settings: NSDictionary<string, any>; });

	initForReadingCommonFormatInterleavedError(fileURL: NSURL, format: AVAudioCommonFormat, interleaved: boolean): this;

	initForReadingError(fileURL: NSURL): this;

	initForWritingSettingsCommonFormatInterleavedError(fileURL: NSURL, settings: NSDictionary<string, any>, format: AVAudioCommonFormat, interleaved: boolean): this;

	initForWritingSettingsError(fileURL: NSURL, settings: NSDictionary<string, any>): this;

	readIntoBufferError(buffer: AVAudioPCMBuffer): boolean;

	readIntoBufferFrameCountError(buffer: AVAudioPCMBuffer, frames: number): boolean;

	writeFromBufferError(buffer: AVAudioPCMBuffer): boolean;
}

declare var AVAudioFileTypeKey: string;

declare class AVAudioFormat extends NSObject implements NSSecureCoding {

	static alloc(): AVAudioFormat; // inherited from NSObject

	static new(): AVAudioFormat; // inherited from NSObject

	readonly channelCount: number;

	readonly channelLayout: AVAudioChannelLayout;

	readonly commonFormat: AVAudioCommonFormat;

	readonly formatDescription: any;

	readonly interleaved: boolean;

	magicCookie: NSData;

	readonly sampleRate: number;

	readonly settings: NSDictionary<string, any>;

	readonly standard: boolean;

	readonly streamDescription: interop.Pointer | interop.Reference<AudioStreamBasicDescription>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { standardFormatWithSampleRate: number; channelLayout: AVAudioChannelLayout; });

	constructor(o: { standardFormatWithSampleRate: number; channels: number; });

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

	initWithCMAudioFormatDescription(formatDescription: any): this;

	initWithCoder(coder: NSCoder): this;

	initWithCommonFormatSampleRateChannelsInterleaved(format: AVAudioCommonFormat, sampleRate: number, channels: number, interleaved: boolean): this;

	initWithCommonFormatSampleRateInterleavedChannelLayout(format: AVAudioCommonFormat, sampleRate: number, interleaved: boolean, layout: AVAudioChannelLayout): this;

	initWithSettings(settings: NSDictionary<string, any>): this;

	initWithStreamDescription(asbd: interop.Pointer | interop.Reference<AudioStreamBasicDescription>): this;

	initWithStreamDescriptionChannelLayout(asbd: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, layout: AVAudioChannelLayout): this;
}

declare class AVAudioIONode extends AVAudioNode {

	static alloc(): AVAudioIONode; // inherited from NSObject

	static new(): AVAudioIONode; // inherited from NSObject

	readonly audioUnit: interop.Pointer | interop.Reference<any>;

	readonly presentationLatency: number;

	readonly voiceProcessingEnabled: boolean;

	setVoiceProcessingEnabledError(enabled: boolean): boolean;
}

declare class AVAudioInputNode extends AVAudioIONode implements AVAudioMixing {

	static alloc(): AVAudioInputNode; // inherited from NSObject

	static new(): AVAudioInputNode; // inherited from NSObject

	voiceProcessingAGCEnabled: boolean;

	voiceProcessingBypassed: boolean;

	voiceProcessingInputMuted: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

	setManualRenderingInputPCMFormatInputBlock(format: AVAudioFormat, block: (p1: number) => interop.Pointer | interop.Reference<AudioBufferList>): boolean;
}

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

	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

interface AVAudioMixing extends AVAudio3DMixing, AVAudioStereoMixing {

	volume: number;

	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;
}
declare var AVAudioMixing: {

	prototype: AVAudioMixing;
};

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

	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

declare class AVAudioNode extends NSObject {

	static alloc(): AVAudioNode; // inherited from NSObject

	static new(): AVAudioNode; // inherited from NSObject

	readonly AUAudioUnit: AUAudioUnit;

	readonly engine: AVAudioEngine;

	readonly lastRenderTime: AVAudioTime;

	readonly latency: number;

	readonly numberOfInputs: number;

	readonly numberOfOutputs: number;

	readonly outputPresentationLatency: number;

	inputFormatForBus(bus: number): AVAudioFormat;

	installTapOnBusBufferSizeFormatBlock(bus: number, bufferSize: number, format: AVAudioFormat, tapBlock: (p1: AVAudioPCMBuffer, p2: AVAudioTime) => void): void;

	nameForInputBus(bus: number): string;

	nameForOutputBus(bus: number): string;

	outputFormatForBus(bus: number): AVAudioFormat;

	removeTapOnBus(bus: number): void;

	reset(): void;
}

declare class AVAudioOutputNode extends AVAudioIONode {

	static alloc(): AVAudioOutputNode; // inherited from NSObject

	static new(): AVAudioOutputNode; // inherited from NSObject
}

declare class AVAudioPCMBuffer extends AVAudioBuffer {

	static alloc(): AVAudioPCMBuffer; // inherited from NSObject

	static new(): AVAudioPCMBuffer; // inherited from NSObject

	readonly floatChannelData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;

	readonly frameCapacity: number;

	frameLength: number;

	readonly int16ChannelData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;

	readonly int32ChannelData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;

	readonly stride: number;

	constructor(o: { PCMFormat: AVAudioFormat; bufferListNoCopy: interop.Pointer | interop.Reference<AudioBufferList>; deallocator: (p1: interop.Pointer | interop.Reference<AudioBufferList>) => void; });

	constructor(o: { PCMFormat: AVAudioFormat; frameCapacity: number; });

	initWithPCMFormatBufferListNoCopyDeallocator(format: AVAudioFormat, bufferList: interop.Pointer | interop.Reference<AudioBufferList>, deallocator: (p1: interop.Pointer | interop.Reference<AudioBufferList>) => void): this;

	initWithPCMFormatFrameCapacity(format: AVAudioFormat, frameCapacity: number): this;
}

declare class AVAudioPlayer extends NSObject {

	static alloc(): AVAudioPlayer; // inherited from NSObject

	static new(): AVAudioPlayer; // inherited from NSObject

	channelAssignments: NSArray<AVAudioSessionChannelDescription>;

	currentTime: number;

	readonly data: NSData;

	delegate: AVAudioPlayerDelegate;

	readonly deviceCurrentTime: number;

	readonly duration: number;

	enableRate: boolean;

	readonly format: AVAudioFormat;

	meteringEnabled: boolean;

	readonly numberOfChannels: number;

	numberOfLoops: number;

	pan: number;

	readonly playing: boolean;

	rate: number;

	readonly settings: NSDictionary<string, any>;

	readonly url: NSURL;

	volume: number;

	constructor(o: { contentsOfURL: NSURL; });

	constructor(o: { contentsOfURL: NSURL; fileTypeHint: string; });

	constructor(o: { data: NSData; });

	constructor(o: { data: NSData; fileTypeHint: string; });

	averagePowerForChannel(channelNumber: number): number;

	initWithContentsOfURLError(url: NSURL): this;

	initWithContentsOfURLFileTypeHintError(url: NSURL, utiString: string): this;

	initWithDataError(data: NSData): this;

	initWithDataFileTypeHintError(data: NSData, utiString: string): this;

	pause(): void;

	peakPowerForChannel(channelNumber: number): number;

	play(): boolean;

	playAtTime(time: number): boolean;

	prepareToPlay(): boolean;

	setVolumeFadeDuration(volume: number, duration: number): void;

	stop(): void;

	updateMeters(): void;
}

interface AVAudioPlayerDelegate extends NSObjectProtocol {

	audioPlayerBeginInterruption?(player: AVAudioPlayer): void;

	audioPlayerDecodeErrorDidOccurError?(player: AVAudioPlayer, error: NSError): void;

	audioPlayerDidFinishPlayingSuccessfully?(player: AVAudioPlayer, flag: boolean): void;

	audioPlayerEndInterruption?(player: AVAudioPlayer): void;

	audioPlayerEndInterruptionWithFlags?(player: AVAudioPlayer, flags: number): void;

	audioPlayerEndInterruptionWithOptions?(player: AVAudioPlayer, flags: number): void;
}
declare var AVAudioPlayerDelegate: {

	prototype: AVAudioPlayerDelegate;
};

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

	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

	scheduleBufferAtTimeOptionsCompletionCallbackTypeCompletionHandler(buffer: AVAudioPCMBuffer, when: AVAudioTime, options: AVAudioPlayerNodeBufferOptions, callbackType: AVAudioPlayerNodeCompletionCallbackType, completionHandler: (p1: AVAudioPlayerNodeCompletionCallbackType) => void): void;

	scheduleBufferAtTimeOptionsCompletionHandler(buffer: AVAudioPCMBuffer, when: AVAudioTime, options: AVAudioPlayerNodeBufferOptions, completionHandler: () => void): void;

	scheduleBufferCompletionCallbackTypeCompletionHandler(buffer: AVAudioPCMBuffer, callbackType: AVAudioPlayerNodeCompletionCallbackType, completionHandler: (p1: AVAudioPlayerNodeCompletionCallbackType) => void): void;

	scheduleBufferCompletionHandler(buffer: AVAudioPCMBuffer, completionHandler: () => void): void;

	scheduleFileAtTimeCompletionCallbackTypeCompletionHandler(file: AVAudioFile, when: AVAudioTime, callbackType: AVAudioPlayerNodeCompletionCallbackType, completionHandler: (p1: AVAudioPlayerNodeCompletionCallbackType) => void): void;

	scheduleFileAtTimeCompletionHandler(file: AVAudioFile, when: AVAudioTime, completionHandler: () => void): void;

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

declare class AVAudioRecorder extends NSObject {

	static alloc(): AVAudioRecorder; // inherited from NSObject

	static new(): AVAudioRecorder; // inherited from NSObject

	channelAssignments: NSArray<AVAudioSessionChannelDescription>;

	readonly currentTime: number;

	delegate: AVAudioRecorderDelegate;

	readonly deviceCurrentTime: number;

	readonly format: AVAudioFormat;

	meteringEnabled: boolean;

	readonly recording: boolean;

	readonly settings: NSDictionary<string, any>;

	readonly url: NSURL;

	constructor(o: { URL: NSURL; format: AVAudioFormat; });

	constructor(o: { URL: NSURL; settings: NSDictionary<string, any>; });

	averagePowerForChannel(channelNumber: number): number;

	deleteRecording(): boolean;

	initWithURLFormatError(url: NSURL, format: AVAudioFormat): this;

	initWithURLSettingsError(url: NSURL, settings: NSDictionary<string, any>): this;

	pause(): void;

	peakPowerForChannel(channelNumber: number): number;

	prepareToRecord(): boolean;

	record(): boolean;

	recordAtTime(time: number): boolean;

	recordAtTimeForDuration(time: number, duration: number): boolean;

	recordForDuration(duration: number): boolean;

	stop(): void;

	updateMeters(): void;
}

interface AVAudioRecorderDelegate extends NSObjectProtocol {

	audioRecorderBeginInterruption?(recorder: AVAudioRecorder): void;

	audioRecorderDidFinishRecordingSuccessfully?(recorder: AVAudioRecorder, flag: boolean): void;

	audioRecorderEncodeErrorDidOccurError?(recorder: AVAudioRecorder, error: NSError): void;

	audioRecorderEndInterruption?(recorder: AVAudioRecorder): void;

	audioRecorderEndInterruptionWithFlags?(recorder: AVAudioRecorder, flags: number): void;

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

	dataWithSMPTEResolutionError(SMPTEResolution: number): NSData;

	hostTimeForBeatsError(inBeats: number): number;

	initWithAudioEngine(engine: AVAudioEngine): this;

	loadFromDataOptionsError(data: NSData, options: AVMusicSequenceLoadOptions): boolean;

	loadFromURLOptionsError(fileURL: NSURL, options: AVMusicSequenceLoadOptions): boolean;

	prepareToPlay(): void;

	secondsForBeats(beats: number): number;

	startAndReturnError(): boolean;

	stop(): void;

	writeToURLSMPTEResolutionReplaceExistingError(fileURL: NSURL, resolution: number, replace: boolean): boolean;
}

declare class AVAudioSession extends NSObject {

	static alloc(): AVAudioSession; // inherited from NSObject

	static new(): AVAudioSession; // inherited from NSObject

	static sharedInstance(): AVAudioSession;

	readonly IOBufferDuration: number;

	readonly allowHapticsAndSystemSoundsDuringRecording: boolean;

	readonly availableCategories: NSArray<string>;

	readonly availableInputs: NSArray<AVAudioSessionPortDescription>;

	readonly availableModes: NSArray<string>;

	readonly category: string;

	readonly categoryOptions: AVAudioSessionCategoryOptions;

	readonly currentHardwareInputNumberOfChannels: number;

	readonly currentHardwareOutputNumberOfChannels: number;

	readonly currentHardwareSampleRate: number;

	readonly currentRoute: AVAudioSessionRouteDescription;

	delegate: AVAudioSessionDelegate;

	readonly inputAvailable: boolean;

	readonly inputDataSource: AVAudioSessionDataSourceDescription;

	readonly inputDataSources: NSArray<AVAudioSessionDataSourceDescription>;

	readonly inputGain: number;

	readonly inputGainSettable: boolean;

	readonly inputIsAvailable: boolean;

	readonly inputLatency: number;

	readonly inputNumberOfChannels: number;

	readonly inputOrientation: AVAudioStereoOrientation;

	readonly maximumInputNumberOfChannels: number;

	readonly maximumOutputNumberOfChannels: number;

	readonly mode: string;

	readonly otherAudioPlaying: boolean;

	readonly outputDataSource: AVAudioSessionDataSourceDescription;

	readonly outputDataSources: NSArray<AVAudioSessionDataSourceDescription>;

	readonly outputLatency: number;

	readonly outputNumberOfChannels: number;

	readonly outputVolume: number;

	readonly preferredHardwareSampleRate: number;

	readonly preferredIOBufferDuration: number;

	readonly preferredInput: AVAudioSessionPortDescription;

	readonly preferredInputNumberOfChannels: number;

	readonly preferredInputOrientation: AVAudioStereoOrientation;

	readonly preferredOutputNumberOfChannels: number;

	readonly preferredSampleRate: number;

	readonly prefersNoInterruptionsFromSystemAlerts: boolean;

	readonly promptStyle: AVAudioSessionPromptStyle;

	readonly recordPermission: AVAudioSessionRecordPermission;

	readonly routeSharingPolicy: AVAudioSessionRouteSharingPolicy;

	readonly sampleRate: number;

	readonly secondaryAudioShouldBeSilencedHint: boolean;

	readonly supportsMultichannelContent: boolean;

	overrideOutputAudioPortError(portOverride: AVAudioSessionPortOverride): boolean;

	prepareRouteSelectionForPlaybackWithCompletionHandler(completionHandler: (p1: boolean, p2: AVAudioSessionRouteSelection) => void): void;

	requestRecordPermission(response: (p1: boolean) => void): void;

	setActiveError(active: boolean): boolean;

	setActiveWithFlagsError(active: boolean, flags: number): boolean;

	setActiveWithOptionsError(active: boolean, options: AVAudioSessionSetActiveOptions): boolean;

	setAggregatedIOPreferenceError(inIOType: AVAudioSessionIOType): boolean;

	setAllowHapticsAndSystemSoundsDuringRecordingError(inValue: boolean): boolean;

	setCategoryError(category: string): boolean;

	setCategoryModeOptionsError(category: string, mode: string, options: AVAudioSessionCategoryOptions): boolean;

	setCategoryModeRouteSharingPolicyOptionsError(category: string, mode: string, policy: AVAudioSessionRouteSharingPolicy, options: AVAudioSessionCategoryOptions): boolean;

	setCategoryWithOptionsError(category: string, options: AVAudioSessionCategoryOptions): boolean;

	setInputDataSourceError(dataSource: AVAudioSessionDataSourceDescription): boolean;

	setInputGainError(gain: number): boolean;

	setModeError(mode: string): boolean;

	setOutputDataSourceError(dataSource: AVAudioSessionDataSourceDescription): boolean;

	setPreferredHardwareSampleRateError(sampleRate: number): boolean;

	setPreferredIOBufferDurationError(duration: number): boolean;

	setPreferredInputError(inPort: AVAudioSessionPortDescription): boolean;

	setPreferredInputNumberOfChannelsError(count: number): boolean;

	setPreferredInputOrientationError(orientation: AVAudioStereoOrientation): boolean;

	setPreferredOutputNumberOfChannelsError(count: number): boolean;

	setPreferredSampleRateError(sampleRate: number): boolean;

	setPrefersNoInterruptionsFromSystemAlertsError(inValue: boolean): boolean;

	setSupportsMultichannelContentError(inValue: boolean): boolean;
}

declare const enum AVAudioSessionActivationOptions {

	None = 0
}

declare var AVAudioSessionCategoryAmbient: string;

declare var AVAudioSessionCategoryAudioProcessing: string;

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

declare var AVAudioSessionCategoryPlayAndRecord: string;

declare var AVAudioSessionCategoryPlayback: string;

declare var AVAudioSessionCategoryRecord: string;

declare var AVAudioSessionCategorySoloAmbient: string;

declare class AVAudioSessionChannelDescription extends NSObject {

	static alloc(): AVAudioSessionChannelDescription; // inherited from NSObject

	static new(): AVAudioSessionChannelDescription; // inherited from NSObject

	readonly channelLabel: number;

	readonly channelName: string;

	readonly channelNumber: number;

	readonly owningPortUID: string;
}

declare class AVAudioSessionDataSourceDescription extends NSObject {

	static alloc(): AVAudioSessionDataSourceDescription; // inherited from NSObject

	static new(): AVAudioSessionDataSourceDescription; // inherited from NSObject

	readonly dataSourceID: number;

	readonly dataSourceName: string;

	readonly location: string;

	readonly orientation: string;

	readonly preferredPolarPattern: string;

	readonly selectedPolarPattern: string;

	readonly supportedPolarPatterns: NSArray<string>;

	setPreferredPolarPatternError(pattern: string): boolean;
}

interface AVAudioSessionDelegate extends NSObjectProtocol {

	beginInterruption?(): void;

	endInterruption?(): void;

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

declare var AVAudioSessionInterruptionNotification: string;

declare var AVAudioSessionInterruptionOptionKey: string;

declare const enum AVAudioSessionInterruptionOptions {

	ShouldResume = 1
}

declare const enum AVAudioSessionInterruptionReason {

	Default = 0,

	AppWasSuspended = 1,

	BuiltInMicMuted = 2
}

declare var AVAudioSessionInterruptionReasonKey: string;

declare const enum AVAudioSessionInterruptionType {

	Began = 1,

	Ended = 0
}

declare var AVAudioSessionInterruptionTypeKey: string;

declare var AVAudioSessionInterruptionWasSuspendedKey: string;

declare var AVAudioSessionLocationLower: string;

declare var AVAudioSessionLocationUpper: string;

declare var AVAudioSessionMediaServicesWereLostNotification: string;

declare var AVAudioSessionMediaServicesWereResetNotification: string;

declare var AVAudioSessionModeDefault: string;

declare var AVAudioSessionModeGameChat: string;

declare var AVAudioSessionModeMeasurement: string;

declare var AVAudioSessionModeMoviePlayback: string;

declare var AVAudioSessionModeSpokenAudio: string;

declare var AVAudioSessionModeVideoChat: string;

declare var AVAudioSessionModeVideoRecording: string;

declare var AVAudioSessionModeVoiceChat: string;

declare var AVAudioSessionModeVoicePrompt: string;

declare var AVAudioSessionOrientationBack: string;

declare var AVAudioSessionOrientationBottom: string;

declare var AVAudioSessionOrientationFront: string;

declare var AVAudioSessionOrientationLeft: string;

declare var AVAudioSessionOrientationRight: string;

declare var AVAudioSessionOrientationTop: string;

declare var AVAudioSessionPolarPatternCardioid: string;

declare var AVAudioSessionPolarPatternOmnidirectional: string;

declare var AVAudioSessionPolarPatternStereo: string;

declare var AVAudioSessionPolarPatternSubcardioid: string;

declare var AVAudioSessionPortAVB: string;

declare var AVAudioSessionPortAirPlay: string;

declare var AVAudioSessionPortBluetoothA2DP: string;

declare var AVAudioSessionPortBluetoothHFP: string;

declare var AVAudioSessionPortBluetoothLE: string;

declare var AVAudioSessionPortBuiltInMic: string;

declare var AVAudioSessionPortBuiltInReceiver: string;

declare var AVAudioSessionPortBuiltInSpeaker: string;

declare var AVAudioSessionPortCarAudio: string;

declare class AVAudioSessionPortDescription extends NSObject {

	static alloc(): AVAudioSessionPortDescription; // inherited from NSObject

	static new(): AVAudioSessionPortDescription; // inherited from NSObject

	readonly UID: string;

	readonly channels: NSArray<AVAudioSessionChannelDescription>;

	readonly dataSources: NSArray<AVAudioSessionDataSourceDescription>;

	readonly hasHardwareVoiceCallProcessing: boolean;

	readonly portName: string;

	readonly portType: string;

	readonly preferredDataSource: AVAudioSessionDataSourceDescription;

	readonly selectedDataSource: AVAudioSessionDataSourceDescription;

	readonly spatialAudioEnabled: boolean;

	setPreferredDataSourceError(dataSource: AVAudioSessionDataSourceDescription): boolean;
}

declare var AVAudioSessionPortDisplayPort: string;

declare var AVAudioSessionPortFireWire: string;

declare var AVAudioSessionPortHDMI: string;

declare var AVAudioSessionPortHeadphones: string;

declare var AVAudioSessionPortHeadsetMic: string;

declare var AVAudioSessionPortLineIn: string;

declare var AVAudioSessionPortLineOut: string;

declare const enum AVAudioSessionPortOverride {

	None = 0,

	Speaker = 1936747378
}

declare var AVAudioSessionPortPCI: string;

declare var AVAudioSessionPortThunderbolt: string;

declare var AVAudioSessionPortUSBAudio: string;

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

declare var AVAudioSessionRouteChangeNotification: string;

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

declare var AVAudioSessionRouteChangeReasonKey: string;

declare class AVAudioSessionRouteDescription extends NSObject {

	static alloc(): AVAudioSessionRouteDescription; // inherited from NSObject

	static new(): AVAudioSessionRouteDescription; // inherited from NSObject

	readonly inputs: NSArray<AVAudioSessionPortDescription>;

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

declare var AVAudioSessionSilenceSecondaryAudioHintNotification: string;

declare const enum AVAudioSessionSilenceSecondaryAudioHintType {

	Begin = 1,

	End = 0
}

declare var AVAudioSessionSilenceSecondaryAudioHintTypeKey: string;

declare var AVAudioSessionSpatialAudioEnabledKey: string;

declare var AVAudioSessionSpatialPlaybackCapabilitiesChangedNotification: string;

declare class AVAudioSinkNode extends AVAudioNode {

	static alloc(): AVAudioSinkNode; // inherited from NSObject

	static new(): AVAudioSinkNode; // inherited from NSObject

	constructor(o: { receiverBlock: (p1: interop.Pointer | interop.Reference<AudioTimeStamp>, p2: number, p3: interop.Pointer | interop.Reference<AudioBufferList>) => number; });

	initWithReceiverBlock(block: (p1: interop.Pointer | interop.Reference<AudioTimeStamp>, p2: number, p3: interop.Pointer | interop.Reference<AudioBufferList>) => number): this;
}

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

	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	constructor(o: { format: AVAudioFormat; renderBlock: (p1: interop.Pointer | interop.Reference<boolean>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: interop.Pointer | interop.Reference<AudioBufferList>) => number; });

	constructor(o: { renderBlock: (p1: interop.Pointer | interop.Reference<boolean>, p2: interop.Pointer | interop.Reference<AudioTimeStamp>, p3: number, p4: interop.Pointer | interop.Reference<AudioBufferList>) => number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

declare class AVAudioUnit extends AVAudioNode {

	static alloc(): AVAudioUnit; // inherited from NSObject

	static instantiateWithComponentDescriptionOptionsCompletionHandler(audioComponentDescription: AudioComponentDescription, options: AudioComponentInstantiationOptions, completionHandler: (p1: AVAudioUnit, p2: NSError) => void): void;

	static new(): AVAudioUnit; // inherited from NSObject

	readonly audioComponentDescription: AudioComponentDescription;

	readonly audioUnit: interop.Pointer | interop.Reference<any>;

	readonly manufacturerName: string;

	readonly name: string;

	readonly version: number;

	loadAudioUnitPresetAtURLError(url: NSURL): boolean;
}

declare class AVAudioUnitComponent extends NSObject {

	static alloc(): AVAudioUnitComponent; // inherited from NSObject

	static new(): AVAudioUnitComponent; // inherited from NSObject

	readonly allTagNames: NSArray<string>;

	readonly audioComponent: interop.Pointer | interop.Reference<any>;

	readonly audioComponentDescription: AudioComponentDescription;

	readonly hasMIDIInput: boolean;

	readonly hasMIDIOutput: boolean;

	readonly localizedTypeName: string;

	readonly manufacturerName: string;

	readonly name: string;

	readonly sandboxSafe: boolean;

	readonly typeName: string;

	readonly version: number;

	readonly versionString: string;
}

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

declare var AVAudioUnitComponentManagerRegistrationsChangedNotification: string;

declare var AVAudioUnitComponentTagsDidChangeNotification: string;

declare class AVAudioUnitDelay extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitDelay; // inherited from NSObject

	static new(): AVAudioUnitDelay; // inherited from NSObject

	delayTime: number;

	feedback: number;

	lowPassCutoff: number;

	wetDryMix: number;
}

declare class AVAudioUnitDistortion extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitDistortion; // inherited from NSObject

	static new(): AVAudioUnitDistortion; // inherited from NSObject

	preGain: number;

	wetDryMix: number;

	loadFactoryPreset(preset: AVAudioUnitDistortionPreset): void;
}

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

declare class AVAudioUnitEQ extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitEQ; // inherited from NSObject

	static new(): AVAudioUnitEQ; // inherited from NSObject

	readonly bands: NSArray<AVAudioUnitEQFilterParameters>;

	globalGain: number;

	constructor(o: { numberOfBands: number; });

	initWithNumberOfBands(numberOfBands: number): this;
}

declare class AVAudioUnitEQFilterParameters extends NSObject {

	static alloc(): AVAudioUnitEQFilterParameters; // inherited from NSObject

	static new(): AVAudioUnitEQFilterParameters; // inherited from NSObject

	bandwidth: number;

	bypass: boolean;

	filterType: AVAudioUnitEQFilterType;

	frequency: number;

	gain: number;
}

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

declare class AVAudioUnitEffect extends AVAudioUnit {

	static alloc(): AVAudioUnitEffect; // inherited from NSObject

	static new(): AVAudioUnitEffect; // inherited from NSObject

	bypass: boolean;

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	initWithAudioComponentDescription(audioComponentDescription: AudioComponentDescription): this;
}

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

	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

	pointSourceInHeadMode: AVAudio3DMixingPointSourceInHeadMode; // inherited from AVAudio3DMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	sourceMode: AVAudio3DMixingSourceMode; // inherited from AVAudio3DMixing

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	readonly  // inherited from NSObjectProtocol

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

	sendMIDISysExEvent(midiData: NSData): void;

	sendPitchBendOnChannel(pitchbend: number, channel: number): void;

	sendPressureForKeyWithValueOnChannel(key: number, value: number, channel: number): void;

	sendPressureOnChannel(pressure: number, channel: number): void;

	sendProgramChangeBankMSBBankLSBOnChannel(program: number, bankMSB: number, bankLSB: number, channel: number): void;

	sendProgramChangeOnChannel(program: number, channel: number): void;

	startNoteWithVelocityOnChannel(note: number, velocity: number, channel: number): void;

	stopNoteOnChannel(note: number, channel: number): void;
}

declare var AVAudioUnitManufacturerNameApple: string;

declare class AVAudioUnitReverb extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitReverb; // inherited from NSObject

	static new(): AVAudioUnitReverb; // inherited from NSObject

	wetDryMix: number;

	loadFactoryPreset(preset: AVAudioUnitReverbPreset): void;
}

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

declare class AVAudioUnitSampler extends AVAudioUnitMIDIInstrument {

	static alloc(): AVAudioUnitSampler; // inherited from NSObject

	static new(): AVAudioUnitSampler; // inherited from NSObject

	globalTuning: number;

	masterGain: number;

	overallGain: number;

	stereoPan: number;

	loadAudioFilesAtURLsError(audioFiles: NSArray<NSURL> | NSURL[]): boolean;

	loadInstrumentAtURLError(instrumentURL: NSURL): boolean;

	loadSoundBankInstrumentAtURLProgramBankMSBBankLSBError(bankURL: NSURL, program: number, bankMSB: number, bankLSB: number): boolean;
}

declare class AVAudioUnitTimeEffect extends AVAudioUnit {

	static alloc(): AVAudioUnitTimeEffect; // inherited from NSObject

	static new(): AVAudioUnitTimeEffect; // inherited from NSObject

	bypass: boolean;

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	initWithAudioComponentDescription(audioComponentDescription: AudioComponentDescription): this;
}

declare class AVAudioUnitTimePitch extends AVAudioUnitTimeEffect {

	static alloc(): AVAudioUnitTimePitch; // inherited from NSObject

	static new(): AVAudioUnitTimePitch; // inherited from NSObject

	overlap: number;

	pitch: number;

	rate: number;
}

declare var AVAudioUnitTypeEffect: string;

declare var AVAudioUnitTypeFormatConverter: string;

declare var AVAudioUnitTypeGenerator: string;

declare var AVAudioUnitTypeMIDIProcessor: string;

declare var AVAudioUnitTypeMixer: string;

declare var AVAudioUnitTypeMusicDevice: string;

declare var AVAudioUnitTypeMusicEffect: string;

declare var AVAudioUnitTypeOfflineEffect: string;

declare var AVAudioUnitTypeOutput: string;

declare var AVAudioUnitTypePanner: string;

declare class AVAudioUnitVarispeed extends AVAudioUnitTimeEffect {

	static alloc(): AVAudioUnitVarispeed; // inherited from NSObject

	static new(): AVAudioUnitVarispeed; // inherited from NSObject

	rate: number;
}

interface AVBeatRange {
	start: number;
	length: number;
}
declare var AVBeatRange: interop.StructType<AVBeatRange>;

declare var AVChannelLayoutKey: string;

declare var AVEncoderAudioQualityForVBRKey: string;

declare var AVEncoderAudioQualityKey: string;

declare var AVEncoderBitDepthHintKey: string;

declare var AVEncoderBitRateKey: string;

declare var AVEncoderBitRatePerChannelKey: string;

declare var AVEncoderBitRateStrategyKey: string;

declare var AVFormatIDKey: string;

declare var AVLinearPCMBitDepthKey: string;

declare var AVLinearPCMIsBigEndianKey: string;

declare var AVLinearPCMIsFloatKey: string;

declare var AVLinearPCMIsNonInterleaved: string;

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

declare const enum AVMusicSequenceLoadOptions {

	SMF_PreserveTracks = 0,

	SMF_ChannelsToTracks = 1
}

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
}

declare const enum AVMusicTrackLoopCount {

	Forever = -1
}

declare var AVNumberOfChannelsKey: string;

declare var AVSampleRateConverterAlgorithmKey: string;

declare var AVSampleRateConverterAlgorithm_Mastering: string;

declare var AVSampleRateConverterAlgorithm_MinimumPhase: string;

declare var AVSampleRateConverterAlgorithm_Normal: string;

declare var AVSampleRateConverterAudioQualityKey: string;

declare var AVSampleRateKey: string;

declare const enum AVSpeechBoundary {

	Immediate = 0,

	Word = 1
}

declare var AVSpeechSynthesisIPANotationAttribute: string;

declare class AVSpeechSynthesisVoice extends NSObject implements NSSecureCoding {

	static alloc(): AVSpeechSynthesisVoice; // inherited from NSObject

	static currentLanguageCode(): string;

	static new(): AVSpeechSynthesisVoice; // inherited from NSObject

	static speechVoices(): NSArray<AVSpeechSynthesisVoice>;

	static voiceWithIdentifier(identifier: string): AVSpeechSynthesisVoice;

	static voiceWithLanguage(languageCode: string): AVSpeechSynthesisVoice;

	readonly audioFileSettings: NSDictionary<string, any>;

	readonly gender: AVSpeechSynthesisVoiceGender;

	readonly identifier: string;

	readonly language: string;

	readonly name: string;

	readonly quality: AVSpeechSynthesisVoiceQuality;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum AVSpeechSynthesisVoiceGender {

	Unspecified = 0,

	Male = 1,

	Female = 2
}

declare var AVSpeechSynthesisVoiceIdentifierAlex: string;

declare const enum AVSpeechSynthesisVoiceQuality {

	Default = 1,

	Enhanced = 2
}

declare class AVSpeechSynthesizer extends NSObject {

	static alloc(): AVSpeechSynthesizer; // inherited from NSObject

	static new(): AVSpeechSynthesizer; // inherited from NSObject

	delegate: AVSpeechSynthesizerDelegate;

	mixToTelephonyUplink: boolean;

	outputChannels: NSArray<AVAudioSessionChannelDescription>;

	readonly paused: boolean;

	readonly speaking: boolean;

	usesApplicationAudioSession: boolean;

	continueSpeaking(): boolean;

	pauseSpeakingAtBoundary(boundary: AVSpeechBoundary): boolean;

	speakUtterance(utterance: AVSpeechUtterance): void;

	stopSpeakingAtBoundary(boundary: AVSpeechBoundary): boolean;

	writeUtteranceToBufferCallback(utterance: AVSpeechUtterance, bufferCallback: (p1: AVAudioBuffer) => void): void;
}

interface AVSpeechSynthesizerDelegate extends NSObjectProtocol {

	speechSynthesizerDidCancelSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	speechSynthesizerDidContinueSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	speechSynthesizerDidFinishSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	speechSynthesizerDidPauseSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	speechSynthesizerDidStartSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	speechSynthesizerWillSpeakRangeOfSpeechStringUtterance?(synthesizer: AVSpeechSynthesizer, characterRange: NSRange, utterance: AVSpeechUtterance): void;
}
declare var AVSpeechSynthesizerDelegate: {

	prototype: AVSpeechSynthesizerDelegate;
};

declare class AVSpeechUtterance extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AVSpeechUtterance; // inherited from NSObject

	static new(): AVSpeechUtterance; // inherited from NSObject

	static speechUtteranceWithAttributedString(string: NSAttributedString): AVSpeechUtterance;

	static speechUtteranceWithString(string: string): AVSpeechUtterance;

	readonly attributedSpeechString: NSAttributedString;

	pitchMultiplier: number;

	postUtteranceDelay: number;

	preUtteranceDelay: number;

	prefersAssistiveTechnologySettings: boolean;

	rate: number;

	readonly speechString: string;

	voice: AVSpeechSynthesisVoice;

	volume: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { attributedString: NSAttributedString; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { string: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAttributedString(string: NSAttributedString): this;

	initWithCoder(coder: NSCoder): this;

	initWithString(string: string): this;
}

declare var AVSpeechUtteranceDefaultSpeechRate: number;

declare var AVSpeechUtteranceMaximumSpeechRate: number;

declare var AVSpeechUtteranceMinimumSpeechRate: number;
