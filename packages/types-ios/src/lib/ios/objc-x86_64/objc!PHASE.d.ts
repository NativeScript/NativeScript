
declare class PHASEAmbientMixerDefinition extends PHASEMixerDefinition {

	static alloc(): PHASEAmbientMixerDefinition; // inherited from NSObject

	static new(): PHASEAmbientMixerDefinition; // inherited from NSObject

	readonly inputChannelLayout: AVAudioChannelLayout;

	readonly orientation: simd_quatf;

	constructor(o: { channelLayout: AVAudioChannelLayout; orientation: simd_quatf; });

	constructor(o: { channelLayout: AVAudioChannelLayout; orientation: simd_quatf; identifier: string; });

	initWithChannelLayoutOrientation(layout: AVAudioChannelLayout, orientation: simd_quatf): this;

	initWithChannelLayoutOrientationIdentifier(layout: AVAudioChannelLayout, orientation: simd_quatf, identifier: string): this;
}

declare class PHASEAsset extends NSObject {

	static alloc(): PHASEAsset; // inherited from NSObject

	static new(): PHASEAsset; // inherited from NSObject

	readonly identifier: string;
}

declare const enum PHASEAssetError {

	FailedToLoad = 1346920801,

	InvalidEngineInstance = 1346920802,

	BadParameters = 1346920803,

	AlreadyExists = 1346920804,

	GeneralError = 1346920805,

	MemoryAllocation = 1346920806
}

declare var PHASEAssetErrorDomain: string;

declare class PHASEAssetRegistry extends NSObject {

	static alloc(): PHASEAssetRegistry; // inherited from NSObject

	static new(): PHASEAssetRegistry; // inherited from NSObject

	readonly globalMetaParameters: NSDictionary<string, PHASEMetaParameter>;

	assetForIdentifier(identifier: string): PHASEAsset;

	registerGlobalMetaParameterError(metaParameterDefinition: PHASEMetaParameterDefinition): PHASEGlobalMetaParameterAsset;

	registerSoundAssetAtURLIdentifierAssetTypeChannelLayoutNormalizationModeError(url: NSURL, identifier: string, assetType: PHASEAssetType, channelLayout: AVAudioChannelLayout, normalizationMode: PHASENormalizationMode): PHASESoundAsset;

	registerSoundAssetWithDataIdentifierFormatNormalizationModeError(data: NSData, identifier: string, format: AVAudioFormat, normalizationMode: PHASENormalizationMode): PHASESoundAsset;

	registerSoundEventAssetWithRootNodeIdentifierError(rootNode: PHASESoundEventNodeDefinition, identifier: string): PHASESoundEventNodeAsset;

	unregisterAssetWithIdentifierCompletion(identifier: string, handler: (p1: boolean) => void): void;
}

declare const enum PHASEAssetType {

	Resident = 0,

	Streamed = 1
}

declare class PHASEBlendNodeDefinition extends PHASESoundEventNodeDefinition {

	static alloc(): PHASEBlendNodeDefinition; // inherited from NSObject

	static new(): PHASEBlendNodeDefinition; // inherited from NSObject

	readonly blendParameterDefinition: PHASENumberMetaParameterDefinition;

	readonly spatialMixerDefinitionForDistance: PHASESpatialMixerDefinition;

	constructor(o: { distanceBlendWithSpatialMixerDefinition: PHASESpatialMixerDefinition; });

	constructor(o: { distanceBlendWithSpatialMixerDefinition: PHASESpatialMixerDefinition; identifier: string; });

	constructor(o: { blendMetaParameterDefinition: PHASENumberMetaParameterDefinition; });

	constructor(o: { blendMetaParameterDefinition: PHASENumberMetaParameterDefinition; identifier: string; });

	addRangeForInputValuesAboveFullGainAtValueFadeCurveTypeSubtree(value: number, fullGainAtValue: number, fadeCurveType: PHASECurveType, subtree: PHASESoundEventNodeDefinition): void;

	addRangeForInputValuesBelowFullGainAtValueFadeCurveTypeSubtree(value: number, fullGainAtValue: number, fadeCurveType: PHASECurveType, subtree: PHASESoundEventNodeDefinition): void;

	addRangeForInputValuesBetweenHighValueFullGainAtLowValueFullGainAtHighValueLowFadeCurveTypeHighFadeCurveTypeSubtree(lowValue: number, highValue: number, fullGainAtLowValue: number, fullGainAtHighValue: number, lowFadeCurveType: PHASECurveType, highFadeCurveType: PHASECurveType, subtree: PHASESoundEventNodeDefinition): void;

	addRangeWithEnvelopeSubtree(envelope: PHASEEnvelope, subtree: PHASESoundEventNodeDefinition): void;

	initDistanceBlendWithSpatialMixerDefinition(spatialMixerDefinition: PHASESpatialMixerDefinition): this;

	initDistanceBlendWithSpatialMixerDefinitionIdentifier(spatialMixerDefinition: PHASESpatialMixerDefinition, identifier: string): this;

	initWithBlendMetaParameterDefinition(blendMetaParameterDefinition: PHASENumberMetaParameterDefinition): this;

	initWithBlendMetaParameterDefinitionIdentifier(blendMetaParameterDefinition: PHASENumberMetaParameterDefinition, identifier: string): this;
}

declare const enum PHASECalibrationMode {

	None = 0,

	RelativeSpl = 1,

	AbsoluteSpl = 2
}

declare class PHASECardioidDirectivityModelParameters extends PHASEDirectivityModelParameters {

	static alloc(): PHASECardioidDirectivityModelParameters; // inherited from NSObject

	static new(): PHASECardioidDirectivityModelParameters; // inherited from NSObject

	readonly subbandParameters: NSArray<PHASECardioidDirectivityModelSubbandParameters>;

	constructor(o: { subbandParameters: NSArray<PHASECardioidDirectivityModelSubbandParameters> | PHASECardioidDirectivityModelSubbandParameters[]; });

	initWithSubbandParameters(subbandParameters: NSArray<PHASECardioidDirectivityModelSubbandParameters> | PHASECardioidDirectivityModelSubbandParameters[]): this;
}

declare class PHASECardioidDirectivityModelSubbandParameters extends NSObject {

	static alloc(): PHASECardioidDirectivityModelSubbandParameters; // inherited from NSObject

	static new(): PHASECardioidDirectivityModelSubbandParameters; // inherited from NSObject

	frequency: number;

	pattern: number;

	sharpness: number;
}

declare class PHASEChannelMixerDefinition extends PHASEMixerDefinition {

	static alloc(): PHASEChannelMixerDefinition; // inherited from NSObject

	static new(): PHASEChannelMixerDefinition; // inherited from NSObject

	readonly inputChannelLayout: AVAudioChannelLayout;

	constructor(o: { channelLayout: AVAudioChannelLayout; });

	constructor(o: { channelLayout: AVAudioChannelLayout; identifier: string; });

	initWithChannelLayout(layout: AVAudioChannelLayout): this;

	initWithChannelLayoutIdentifier(layout: AVAudioChannelLayout, identifier: string): this;
}

declare class PHASEConeDirectivityModelParameters extends PHASEDirectivityModelParameters {

	static alloc(): PHASEConeDirectivityModelParameters; // inherited from NSObject

	static new(): PHASEConeDirectivityModelParameters; // inherited from NSObject

	readonly subbandParameters: NSArray<PHASEConeDirectivityModelSubbandParameters>;

	constructor(o: { subbandParameters: NSArray<PHASEConeDirectivityModelSubbandParameters> | PHASEConeDirectivityModelSubbandParameters[]; });

	initWithSubbandParameters(subbandParameters: NSArray<PHASEConeDirectivityModelSubbandParameters> | PHASEConeDirectivityModelSubbandParameters[]): this;
}

declare class PHASEConeDirectivityModelSubbandParameters extends NSObject {

	static alloc(): PHASEConeDirectivityModelSubbandParameters; // inherited from NSObject

	static new(): PHASEConeDirectivityModelSubbandParameters; // inherited from NSObject

	frequency: number;

	readonly innerAngle: number;

	readonly outerAngle: number;

	outerGain: number;

	setInnerAngleOuterAngle(innerAngle: number, outerAngle: number): void;
}

declare class PHASEContainerNodeDefinition extends PHASESoundEventNodeDefinition {

	static alloc(): PHASEContainerNodeDefinition; // inherited from NSObject

	static new(): PHASEContainerNodeDefinition; // inherited from NSObject

	constructor(o: { identifier: string; });

	addSubtree(subtree: PHASESoundEventNodeDefinition): void;

	initWithIdentifier(identifier: string): this;
}

declare const enum PHASECullOption {

	Terminate = 0,

	SleepWakeAtZero = 1,

	SleepWakeAtRandomOffset = 2,

	SleepWakeAtRealtimeOffset = 3,

	DoNotCull = 4
}

declare const enum PHASECurveType {

	Linear = 1668435054,

	Squared = 1668436849,

	InverseSquared = 1668434257,

	Cubed = 1668432757,

	InverseCubed = 1668434243,

	Sine = 1668436846,

	InverseSine = 1668434259,

	Sigmoid = 1668436839,

	InverseSigmoid = 1668434247
}

declare class PHASEDefinition extends NSObject {

	static alloc(): PHASEDefinition; // inherited from NSObject

	static new(): PHASEDefinition; // inherited from NSObject

	readonly identifier: string;
}

declare class PHASEDirectivityModelParameters extends NSObject {

	static alloc(): PHASEDirectivityModelParameters; // inherited from NSObject

	static new(): PHASEDirectivityModelParameters; // inherited from NSObject
}

declare class PHASEDistanceModelFadeOutParameters extends NSObject {

	static alloc(): PHASEDistanceModelFadeOutParameters; // inherited from NSObject

	static new(): PHASEDistanceModelFadeOutParameters; // inherited from NSObject

	readonly cullDistance: number;

	constructor(o: { cullDistance: number; });

	initWithCullDistance(cullDistance: number): this;
}

declare class PHASEDistanceModelParameters extends NSObject {

	static alloc(): PHASEDistanceModelParameters; // inherited from NSObject

	static new(): PHASEDistanceModelParameters; // inherited from NSObject

	fadeOutParameters: PHASEDistanceModelFadeOutParameters;
}

declare class PHASEDucker extends NSObject {

	static alloc(): PHASEDucker; // inherited from NSObject

	static new(): PHASEDucker; // inherited from NSObject

	readonly active: boolean;

	readonly attackCurve: PHASECurveType;

	readonly attackTime: number;

	readonly gain: number;

	readonly identifier: string;

	readonly releaseCurve: PHASECurveType;

	readonly releaseTime: number;

	readonly sourceGroups: NSSet<PHASEGroup>;

	readonly targetGroups: NSSet<PHASEGroup>;

	constructor(o: { engine: PHASEEngine; sourceGroups: NSSet<PHASEGroup>; targetGroups: NSSet<PHASEGroup>; gain: number; attackTime: number; releaseTime: number; attackCurve: PHASECurveType; releaseCurve: PHASECurveType; });

	activate(): void;

	deactivate(): void;

	initWithEngineSourceGroupsTargetGroupsGainAttackTimeReleaseTimeAttackCurveReleaseCurve(engine: PHASEEngine, sourceGroups: NSSet<PHASEGroup>, targetGroups: NSSet<PHASEGroup>, gain: number, attackTime: number, releaseTime: number, attackCurve: PHASECurveType, releaseCurve: PHASECurveType): this;
}

declare class PHASEEngine extends NSObject {

	static alloc(): PHASEEngine; // inherited from NSObject

	static new(): PHASEEngine; // inherited from NSObject

	readonly activeGroupPreset: PHASEGroupPreset;

	readonly assetRegistry: PHASEAssetRegistry;

	defaultMedium: PHASEMedium;

	defaultReverbPreset: PHASEReverbPreset;

	readonly duckers: NSArray<PHASEDucker>;

	readonly groups: NSDictionary<string, PHASEGroup>;

	outputSpatializationMode: PHASESpatializationMode;

	readonly renderingState: PHASERenderingState;

	readonly rootObject: PHASEObject;

	readonly soundEvents: NSArray<PHASESoundEvent>;

	unitsPerMeter: number;

	unitsPerSecond: number;

	constructor(o: { updateMode: PHASEUpdateMode; });

	initWithUpdateMode(updateMode: PHASEUpdateMode): this;

	pause(): void;

	startAndReturnError(): boolean;

	stop(): void;

	update(): void;
}

declare class PHASEEnvelope extends NSObject {

	static alloc(): PHASEEnvelope; // inherited from NSObject

	static new(): PHASEEnvelope; // inherited from NSObject

	readonly domain: PHASENumericPair;

	readonly range: PHASENumericPair;

	readonly segments: NSArray<PHASEEnvelopeSegment>;

	readonly startPoint: interop.Reference<number>;

	constructor(o: { startPoint: interop.Reference<number>; segments: NSArray<PHASEEnvelopeSegment> | PHASEEnvelopeSegment[]; });

	evaluateForValue(x: number): number;

	initWithStartPointSegments(startPoint: interop.Reference<number>, segments: NSArray<PHASEEnvelopeSegment> | PHASEEnvelopeSegment[]): this;
}

declare class PHASEEnvelopeDistanceModelParameters extends PHASEDistanceModelParameters {

	static alloc(): PHASEEnvelopeDistanceModelParameters; // inherited from NSObject

	static new(): PHASEEnvelopeDistanceModelParameters; // inherited from NSObject

	readonly envelope: PHASEEnvelope;

	constructor(o: { envelope: PHASEEnvelope; });

	initWithEnvelope(envelope: PHASEEnvelope): this;
}

declare class PHASEEnvelopeSegment extends NSObject {

	static alloc(): PHASEEnvelopeSegment; // inherited from NSObject

	static new(): PHASEEnvelopeSegment; // inherited from NSObject

	curveType: PHASECurveType;

	endPoint: interop.Reference<number>;

	constructor(o: { endPoint: interop.Reference<number>; curveType: PHASECurveType; });

	initWithEndPointCurveType(endPoint: interop.Reference<number>, curveType: PHASECurveType): this;
}

declare const enum PHASEError {

	InitializeFailed = 1346913633
}

declare var PHASEErrorDomain: string;

declare class PHASEGeneratorNodeDefinition extends PHASESoundEventNodeDefinition {

	static alloc(): PHASEGeneratorNodeDefinition; // inherited from NSObject

	static new(): PHASEGeneratorNodeDefinition; // inherited from NSObject

	readonly calibrationMode: PHASECalibrationMode;

	gainMetaParameterDefinition: PHASENumberMetaParameterDefinition;

	group: PHASEGroup;

	readonly level: number;

	readonly mixerDefinition: PHASEMixerDefinition;

	rate: number;

	rateMetaParameterDefinition: PHASENumberMetaParameterDefinition;

	setCalibrationModeLevel(calibrationMode: PHASECalibrationMode, level: number): void;
}

declare class PHASEGeneratorParameters extends NSObject {

	static alloc(): PHASEGeneratorParameters; // inherited from NSObject

	static new(): PHASEGeneratorParameters; // inherited from NSObject

	gain: number;

	rate: number;
}

declare class PHASEGeometricSpreadingDistanceModelParameters extends PHASEDistanceModelParameters {

	static alloc(): PHASEGeometricSpreadingDistanceModelParameters; // inherited from NSObject

	static new(): PHASEGeometricSpreadingDistanceModelParameters; // inherited from NSObject

	rolloffFactor: number;
}

declare class PHASEGlobalMetaParameterAsset extends PHASEAsset {

	static alloc(): PHASEGlobalMetaParameterAsset; // inherited from NSObject

	static new(): PHASEGlobalMetaParameterAsset; // inherited from NSObject
}

declare class PHASEGroup extends NSObject {

	static alloc(): PHASEGroup; // inherited from NSObject

	static new(): PHASEGroup; // inherited from NSObject

	gain: number;

	readonly identifier: string;

	readonly muted: boolean;

	rate: number;

	readonly soloed: boolean;

	constructor(o: { identifier: string; });

	fadeGainDurationCurveType(gain: number, duration: number, curveType: PHASECurveType): void;

	fadeRateDurationCurveType(rate: number, duration: number, curveType: PHASECurveType): void;

	initWithIdentifier(identifier: string): this;

	mute(): void;

	registerWithEngine(engine: PHASEEngine): void;

	solo(): void;

	unmute(): void;

	unregisterFromEngine(): void;

	unsolo(): void;
}

declare class PHASEGroupPreset extends NSObject {

	static alloc(): PHASEGroupPreset; // inherited from NSObject

	static new(): PHASEGroupPreset; // inherited from NSObject

	readonly settings: NSDictionary<string, PHASEGroupPresetSetting>;

	readonly timeToReset: number;

	readonly timeToTarget: number;

	constructor(o: { engine: PHASEEngine; settings: NSDictionary<string, PHASEGroupPresetSetting>; timeToTarget: number; timeToReset: number; });

	activate(): void;

	activateWithTimeToTargetOverride(timeToTargetOverride: number): void;

	deactivate(): void;

	deactivateWithTimeToResetOverride(timeToResetOverride: number): void;

	initWithEngineSettingsTimeToTargetTimeToReset(engine: PHASEEngine, settings: NSDictionary<string, PHASEGroupPresetSetting>, timeToTarget: number, timeToReset: number): this;
}

declare class PHASEGroupPresetSetting extends NSObject {

	static alloc(): PHASEGroupPresetSetting; // inherited from NSObject

	static new(): PHASEGroupPresetSetting; // inherited from NSObject

	readonly gain: number;

	readonly gainCurveType: PHASECurveType;

	readonly rate: number;

	readonly rateCurveType: PHASECurveType;

	constructor(o: { gain: number; rate: number; gainCurveType: PHASECurveType; rateCurveType: PHASECurveType; });

	initWithGainRateGainCurveTypeRateCurveType(gain: number, rate: number, gainCurveType: PHASECurveType, rateCurveType: PHASECurveType): this;
}

declare class PHASEListener extends PHASEObject {

	static alloc(): PHASEListener; // inherited from NSObject

	static new(): PHASEListener; // inherited from NSObject

	gain: number;
}

declare class PHASEMappedMetaParameterDefinition extends PHASENumberMetaParameterDefinition {

	static alloc(): PHASEMappedMetaParameterDefinition; // inherited from NSObject

	static new(): PHASEMappedMetaParameterDefinition; // inherited from NSObject

	readonly envelope: PHASEEnvelope;

	readonly inputMetaParameterDefinition: PHASENumberMetaParameterDefinition;

	constructor(o: { inputMetaParameterDefinition: PHASENumberMetaParameterDefinition; envelope: PHASEEnvelope; });

	constructor(o: { inputMetaParameterDefinition: PHASENumberMetaParameterDefinition; envelope: PHASEEnvelope; identifier: string; });

	initWithInputMetaParameterDefinitionEnvelope(inputMetaParameterDefinition: PHASENumberMetaParameterDefinition, envelope: PHASEEnvelope): this;

	initWithInputMetaParameterDefinitionEnvelopeIdentifier(inputMetaParameterDefinition: PHASENumberMetaParameterDefinition, envelope: PHASEEnvelope, identifier: string): this;
}

declare class PHASEMaterial extends NSObject {

	static alloc(): PHASEMaterial; // inherited from NSObject

	static new(): PHASEMaterial; // inherited from NSObject

	constructor(o: { engine: PHASEEngine; preset: PHASEMaterialPreset; });

	initWithEnginePreset(engine: PHASEEngine, preset: PHASEMaterialPreset): this;
}

declare const enum PHASEMaterialPreset {

	Cardboard = 1833136740,

	Glass = 1833397363,

	Brick = 1833071211,

	Concrete = 1833132914,

	Drywall = 1833202295,

	Wood = 1834448228
}

declare class PHASEMedium extends NSObject {

	static alloc(): PHASEMedium; // inherited from NSObject

	static new(): PHASEMedium; // inherited from NSObject

	constructor(o: { engine: PHASEEngine; preset: PHASEMediumPreset; });

	initWithEnginePreset(engine: PHASEEngine, preset: PHASEMediumPreset): this;
}

declare const enum PHASEMediumPreset {

	Air = 1835286898
}

declare class PHASEMetaParameter extends NSObject {

	static alloc(): PHASEMetaParameter; // inherited from NSObject

	static new(): PHASEMetaParameter; // inherited from NSObject

	readonly identifier: string;

	value: any;
}

declare class PHASEMetaParameterDefinition extends PHASEDefinition {

	static alloc(): PHASEMetaParameterDefinition; // inherited from NSObject

	static new(): PHASEMetaParameterDefinition; // inherited from NSObject

	readonly value: any;
}

declare class PHASEMixer extends NSObject {

	static alloc(): PHASEMixer; // inherited from NSObject

	static new(): PHASEMixer; // inherited from NSObject

	readonly gain: number;

	readonly gainMetaParameter: PHASEMetaParameter;

	readonly identifier: string;
}

declare class PHASEMixerDefinition extends PHASEDefinition {

	static alloc(): PHASEMixerDefinition; // inherited from NSObject

	static new(): PHASEMixerDefinition; // inherited from NSObject

	gain: number;

	gainMetaParameterDefinition: PHASENumberMetaParameterDefinition;
}

declare class PHASEMixerParameters extends NSObject {

	static alloc(): PHASEMixerParameters; // inherited from NSObject

	static new(): PHASEMixerParameters; // inherited from NSObject

	addAmbientMixerParametersWithIdentifierListener(identifier: string, listener: PHASEListener): void;

	addSpatialMixerParametersWithIdentifierSourceListener(identifier: string, source: PHASESource, listener: PHASEListener): void;
}

declare const enum PHASENormalizationMode {

	None = 0,

	Dynamic = 1
}

declare class PHASENumberMetaParameter extends PHASEMetaParameter {

	static alloc(): PHASENumberMetaParameter; // inherited from NSObject

	static new(): PHASENumberMetaParameter; // inherited from NSObject

	readonly maximum: number;

	readonly minimum: number;

	fadeToValueDuration(value: number, duration: number): void;
}

declare class PHASENumberMetaParameterDefinition extends PHASEMetaParameterDefinition {

	static alloc(): PHASENumberMetaParameterDefinition; // inherited from NSObject

	static new(): PHASENumberMetaParameterDefinition; // inherited from NSObject

	readonly maximum: number;

	readonly minimum: number;

	constructor(o: { value: number; });

	constructor(o: { value: number; identifier: string; });

	constructor(o: { value: number; minimum: number; maximum: number; });

	constructor(o: { value: number; minimum: number; maximum: number; identifier: string; });

	initWithValue(value: number): this;

	initWithValueIdentifier(value: number, identifier: string): this;

	initWithValueMinimumMaximum(value: number, minimum: number, maximum: number): this;

	initWithValueMinimumMaximumIdentifier(value: number, minimum: number, maximum: number, identifier: string): this;
}

declare class PHASENumericPair extends NSObject {

	static alloc(): PHASENumericPair; // inherited from NSObject

	static new(): PHASENumericPair; // inherited from NSObject

	first: number;

	second: number;

	constructor(o: { firstValue: number; secondValue: number; });

	initWithFirstValueSecondValue(first: number, second: number): this;
}

declare class PHASEObject extends NSObject implements NSCopying {

	static alloc(): PHASEObject; // inherited from NSObject

	static new(): PHASEObject; // inherited from NSObject

	readonly children: NSArray<PHASEObject>;

	readonly parent: PHASEObject;

	transform: simd_float4x4;

	worldTransform: simd_float4x4;

	static readonly forward: interop.Reference<number>;

	static readonly right: interop.Reference<number>;

	static readonly up: interop.Reference<number>;

	constructor(o: { engine: PHASEEngine; });

	addChildError(child: PHASEObject): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithEngine(engine: PHASEEngine): this;

	removeChild(child: PHASEObject): void;

	removeChildren(): void;
}

declare class PHASEOccluder extends PHASEObject {

	static alloc(): PHASEOccluder; // inherited from NSObject

	static new(): PHASEOccluder; // inherited from NSObject

	readonly shapes: NSArray<PHASEShape>;

	constructor(o: { engine: PHASEEngine; shapes: NSArray<PHASEShape> | PHASEShape[]; });

	initWithEngineShapes(engine: PHASEEngine, shapes: NSArray<PHASEShape> | PHASEShape[]): this;
}

declare const enum PHASEPlaybackMode {

	OneShot = 0,

	Looping = 1
}

declare const enum PHASEPushStreamBufferOptions {

	Default = 1,

	Loops = 2,

	Interrupts = 4,

	InterruptsAtLoop = 8
}

declare const enum PHASEPushStreamCompletionCallbackCondition {

	DataRendered = 0
}

declare class PHASEPushStreamNode extends NSObject {

	static alloc(): PHASEPushStreamNode; // inherited from NSObject

	static new(): PHASEPushStreamNode; // inherited from NSObject

	readonly format: AVAudioFormat;

	readonly gainMetaParameter: PHASENumberMetaParameter;

	readonly mixer: PHASEMixer;

	readonly rateMetaParameter: PHASENumberMetaParameter;

	scheduleBuffer(buffer: AVAudioPCMBuffer): void;

	scheduleBufferAtTimeOptions(buffer: AVAudioPCMBuffer, when: AVAudioTime, options: PHASEPushStreamBufferOptions): void;

	scheduleBufferAtTimeOptionsCompletionCallbackTypeCompletionHandler(buffer: AVAudioPCMBuffer, when: AVAudioTime, options: PHASEPushStreamBufferOptions, completionCallbackType: PHASEPushStreamCompletionCallbackCondition, completionHandler: (p1: PHASEPushStreamCompletionCallbackCondition) => void): void;

	scheduleBufferCompletionCallbackTypeCompletionHandler(buffer: AVAudioPCMBuffer, completionCallbackType: PHASEPushStreamCompletionCallbackCondition, completionHandler: (p1: PHASEPushStreamCompletionCallbackCondition) => void): void;
}

declare class PHASEPushStreamNodeDefinition extends PHASEGeneratorNodeDefinition {

	static alloc(): PHASEPushStreamNodeDefinition; // inherited from NSObject

	static new(): PHASEPushStreamNodeDefinition; // inherited from NSObject

	readonly format: AVAudioFormat;

	normalize: boolean;

	constructor(o: { mixerDefinition: PHASEMixerDefinition; format: AVAudioFormat; });

	constructor(o: { mixerDefinition: PHASEMixerDefinition; format: AVAudioFormat; identifier: string; });

	initWithMixerDefinitionFormat(mixerDefinition: PHASEMixerDefinition, format: AVAudioFormat): this;

	initWithMixerDefinitionFormatIdentifier(mixerDefinition: PHASEMixerDefinition, format: AVAudioFormat, identifier: string): this;
}

declare class PHASERandomNodeDefinition extends PHASESoundEventNodeDefinition {

	static alloc(): PHASERandomNodeDefinition; // inherited from NSObject

	static new(): PHASERandomNodeDefinition; // inherited from NSObject

	uniqueSelectionQueueLength: number;

	constructor(o: { identifier: string; });

	addSubtreeWeight(subtree: PHASESoundEventNodeDefinition, weight: number): void;

	initWithIdentifier(identifier: string): this;
}

declare const enum PHASERenderingState {

	Stopped = 0,

	Started = 1,

	Paused = 2
}

declare const enum PHASEReverbPreset {

	None = 1917742958,

	SmallRoom = 1918063213,

	MediumRoom = 1917669997,

	LargeRoom = 1917604401,

	LargeRoom2 = 1917604402,

	MediumChamber = 1917666152,

	LargeChamber = 1917600616,

	MediumHall = 1917667377,

	MediumHall2 = 1917667378,

	MediumHall3 = 1917667379,

	LargeHall = 1917601841,

	LargeHall2 = 1917601842,

	Cathedral = 1917023336
}

declare class PHASESamplerNodeDefinition extends PHASEGeneratorNodeDefinition {

	static alloc(): PHASESamplerNodeDefinition; // inherited from NSObject

	static new(): PHASESamplerNodeDefinition; // inherited from NSObject

	readonly assetIdentifier: string;

	cullOption: PHASECullOption;

	playbackMode: PHASEPlaybackMode;

	constructor(o: { soundAssetIdentifier: string; mixerDefinition: PHASEMixerDefinition; });

	constructor(o: { soundAssetIdentifier: string; mixerDefinition: PHASEMixerDefinition; identifier: string; });

	initWithSoundAssetIdentifierMixerDefinition(soundAssetIdentifier: string, mixerDefinition: PHASEMixerDefinition): this;

	initWithSoundAssetIdentifierMixerDefinitionIdentifier(soundAssetIdentifier: string, mixerDefinition: PHASEMixerDefinition, identifier: string): this;
}

declare class PHASEShape extends NSObject implements NSCopying {

	static alloc(): PHASEShape; // inherited from NSObject

	static new(): PHASEShape; // inherited from NSObject

	readonly elements: NSArray<PHASEShapeElement>;

	constructor(o: { engine: PHASEEngine; mesh: MDLMesh; });

	constructor(o: { engine: PHASEEngine; mesh: MDLMesh; materials: NSArray<PHASEMaterial> | PHASEMaterial[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithEngineMesh(engine: PHASEEngine, mesh: MDLMesh): this;

	initWithEngineMeshMaterials(engine: PHASEEngine, mesh: MDLMesh, materials: NSArray<PHASEMaterial> | PHASEMaterial[]): this;
}

declare class PHASEShapeElement extends NSObject {

	static alloc(): PHASEShapeElement; // inherited from NSObject

	static new(): PHASEShapeElement; // inherited from NSObject

	material: PHASEMaterial;
}

declare class PHASESoundAsset extends PHASEAsset {

	static alloc(): PHASESoundAsset; // inherited from NSObject

	static new(): PHASESoundAsset; // inherited from NSObject

	readonly data: NSData;

	readonly type: PHASEAssetType;

	readonly url: NSURL;
}

declare class PHASESoundEvent extends NSObject {

	static alloc(): PHASESoundEvent; // inherited from NSObject

	static new(): PHASESoundEvent; // inherited from NSObject

	readonly indefinite: boolean;

	readonly metaParameters: NSDictionary<string, PHASEMetaParameter>;

	readonly mixers: NSDictionary<string, PHASEMixer>;

	readonly prepareState: PHASESoundEventPrepareState;

	readonly pushStreamNodes: NSDictionary<string, PHASEPushStreamNode>;

	readonly renderingState: PHASERenderingState;

	constructor(o: { engine: PHASEEngine; assetIdentifier: string; });

	constructor(o: { engine: PHASEEngine; assetIdentifier: string; mixerParameters: PHASEMixerParameters; });

	initWithEngineAssetIdentifierError(engine: PHASEEngine, assetIdentifier: string): this;

	initWithEngineAssetIdentifierMixerParametersError(engine: PHASEEngine, assetIdentifier: string, mixerParameters: PHASEMixerParameters): this;

	pause(): void;

	prepareWithCompletion(handler: (p1: PHASESoundEventPrepareHandlerReason) => void): void;

	resume(): void;

	seekToTimeCompletion(time: number, handler: (p1: PHASESoundEventSeekHandlerReason) => void): void;

	startWithCompletion(handler: (p1: PHASESoundEventStartHandlerReason) => void): void;

	stopAndInvalidate(): void;
}

declare const enum PHASESoundEventError {

	NotFound = 1346925665,

	BadData = 1346925666,

	InvalidInstance = 1346925667,

	APIMisuse = 1346925668,

	SystemNotInitialized = 1346925669,

	OutOfMemory = 1346925670
}

declare var PHASESoundEventErrorDomain: string;

declare class PHASESoundEventNodeAsset extends PHASEAsset {

	static alloc(): PHASESoundEventNodeAsset; // inherited from NSObject

	static new(): PHASESoundEventNodeAsset; // inherited from NSObject
}

declare class PHASESoundEventNodeDefinition extends PHASEDefinition {

	static alloc(): PHASESoundEventNodeDefinition; // inherited from NSObject

	static new(): PHASESoundEventNodeDefinition; // inherited from NSObject

	readonly children: NSArray<PHASESoundEventNodeDefinition>;
}

declare const enum PHASESoundEventPrepareHandlerReason {

	Failure = 0,

	Prepared = 1,

	Terminated = 2
}

declare const enum PHASESoundEventPrepareState {

	PrepareNotStarted = 0,

	PrepareInProgress = 1,

	Prepared = 2
}

declare const enum PHASESoundEventSeekHandlerReason {

	Failure = 0,

	FailureSeekAlreadyInProgress = 1,

	SeekSuccessful = 2
}

declare const enum PHASESoundEventStartHandlerReason {

	Failure = 0,

	FinishedPlaying = 1,

	Terminated = 2
}

declare class PHASESource extends PHASEObject {

	static alloc(): PHASESource; // inherited from NSObject

	static new(): PHASESource; // inherited from NSObject

	gain: number;

	readonly shapes: NSArray<PHASEShape>;

	constructor(o: { engine: PHASEEngine; shapes: NSArray<PHASEShape> | PHASEShape[]; });

	initWithEngineShapes(engine: PHASEEngine, shapes: NSArray<PHASEShape> | PHASEShape[]): this;
}

declare var PHASESpatialCategoryDirectPathTransmission: string;

declare var PHASESpatialCategoryEarlyReflections: string;

declare var PHASESpatialCategoryLateReverb: string;

declare class PHASESpatialMixerDefinition extends PHASEMixerDefinition {

	static alloc(): PHASESpatialMixerDefinition; // inherited from NSObject

	static new(): PHASESpatialMixerDefinition; // inherited from NSObject

	distanceModelParameters: PHASEDistanceModelParameters;

	listenerDirectivityModelParameters: PHASEDirectivityModelParameters;

	sourceDirectivityModelParameters: PHASEDirectivityModelParameters;

	readonly spatialPipeline: PHASESpatialPipeline;

	constructor(o: { spatialPipeline: PHASESpatialPipeline; });

	constructor(o: { spatialPipeline: PHASESpatialPipeline; identifier: string; });

	initWithSpatialPipeline(spatialPipeline: PHASESpatialPipeline): this;

	initWithSpatialPipelineIdentifier(spatialPipeline: PHASESpatialPipeline, identifier: string): this;
}

declare class PHASESpatialPipeline extends NSObject {

	static alloc(): PHASESpatialPipeline; // inherited from NSObject

	static new(): PHASESpatialPipeline; // inherited from NSObject

	readonly entries: NSDictionary<string, PHASESpatialPipelineEntry>;

	readonly flags: PHASESpatialPipelineFlags;

	constructor(o: { flags: PHASESpatialPipelineFlags; });

	initWithFlags(flags: PHASESpatialPipelineFlags): this;
}

declare class PHASESpatialPipelineEntry extends NSObject {

	static alloc(): PHASESpatialPipelineEntry; // inherited from NSObject

	static new(): PHASESpatialPipelineEntry; // inherited from NSObject

	sendLevel: number;

	sendLevelMetaParameterDefinition: PHASENumberMetaParameterDefinition;
}

declare const enum PHASESpatialPipelineFlags {

	DirectPathTransmission = 1,

	EarlyReflections = 2,

	LateReverb = 4
}

declare const enum PHASESpatializationMode {

	Automatic = 0,

	AlwaysUseBinaural = 1,

	AlwaysUseChannelBased = 2
}

declare class PHASEStringMetaParameter extends PHASEMetaParameter {

	static alloc(): PHASEStringMetaParameter; // inherited from NSObject

	static new(): PHASEStringMetaParameter; // inherited from NSObject
}

declare class PHASEStringMetaParameterDefinition extends PHASEMetaParameterDefinition {

	static alloc(): PHASEStringMetaParameterDefinition; // inherited from NSObject

	static new(): PHASEStringMetaParameterDefinition; // inherited from NSObject

	constructor(o: { value: string; });

	constructor(o: { value: string; identifier: string; });

	initWithValue(value: string): this;

	initWithValueIdentifier(value: string, identifier: string): this;
}

declare class PHASESwitchNodeDefinition extends PHASESoundEventNodeDefinition {

	static alloc(): PHASESwitchNodeDefinition; // inherited from NSObject

	static new(): PHASESwitchNodeDefinition; // inherited from NSObject

	readonly switchMetaParameterDefinition: PHASEStringMetaParameterDefinition;

	constructor(o: { switchMetaParameterDefinition: PHASEStringMetaParameterDefinition; });

	constructor(o: { switchMetaParameterDefinition: PHASEStringMetaParameterDefinition; identifier: string; });

	addSubtreeSwitchValue(subtree: PHASESoundEventNodeDefinition, switchValue: string): void;

	initWithSwitchMetaParameterDefinition(switchMetaParameterDefinition: PHASEStringMetaParameterDefinition): this;

	initWithSwitchMetaParameterDefinitionIdentifier(switchMetaParameterDefinition: PHASEStringMetaParameterDefinition, identifier: string): this;
}

declare const enum PHASEUpdateMode {

	Automatic = 0,

	Manual = 1
}
