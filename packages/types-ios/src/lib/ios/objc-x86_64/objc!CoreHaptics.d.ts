
interface CHHapticAdvancedPatternPlayer extends CHHapticPatternPlayer {

	completionHandler: (p1: NSError) => void;

	loopEnabled: boolean;

	loopEnd: number;

	playbackRate: number;

	pauseAtTimeError(time: number): boolean;

	resumeAtTimeError(time: number): boolean;

	seekToOffsetError(offsetTime: number): boolean;
}
declare var CHHapticAdvancedPatternPlayer: {

	prototype: CHHapticAdvancedPatternPlayer;
};

interface CHHapticDeviceCapability {

	supportsAudio: boolean;

	supportsHaptics: boolean;

	attributesForDynamicParameterError(inParameter: string): CHHapticParameterAttributes;

	attributesForEventParameterEventTypeError(inParameter: string, type: string): CHHapticParameterAttributes;
}
declare var CHHapticDeviceCapability: {

	prototype: CHHapticDeviceCapability;
};

declare class CHHapticDynamicParameter extends NSObject {

	static alloc(): CHHapticDynamicParameter; // inherited from NSObject

	static new(): CHHapticDynamicParameter; // inherited from NSObject

	readonly parameterID: string;

	relativeTime: number;

	value: number;

	constructor(o: { parameterID: string; value: number; relativeTime: number; });

	initWithParameterIDValueRelativeTime(parameterID: string, value: number, time: number): this;
}

declare var CHHapticDynamicParameterIDAudioAttackTimeControl: string;

declare var CHHapticDynamicParameterIDAudioBrightnessControl: string;

declare var CHHapticDynamicParameterIDAudioDecayTimeControl: string;

declare var CHHapticDynamicParameterIDAudioPanControl: string;

declare var CHHapticDynamicParameterIDAudioPitchControl: string;

declare var CHHapticDynamicParameterIDAudioReleaseTimeControl: string;

declare var CHHapticDynamicParameterIDAudioVolumeControl: string;

declare var CHHapticDynamicParameterIDHapticAttackTimeControl: string;

declare var CHHapticDynamicParameterIDHapticDecayTimeControl: string;

declare var CHHapticDynamicParameterIDHapticIntensityControl: string;

declare var CHHapticDynamicParameterIDHapticReleaseTimeControl: string;

declare var CHHapticDynamicParameterIDHapticSharpnessControl: string;

declare class CHHapticEngine extends NSObject {

	static alloc(): CHHapticEngine; // inherited from NSObject

	static capabilitiesForHardware(): CHHapticDeviceCapability;

	static new(): CHHapticEngine; // inherited from NSObject

	autoShutdownEnabled: boolean;

	readonly currentTime: number;

	isMutedForAudio: boolean;

	isMutedForHaptics: boolean;

	playsHapticsOnly: boolean;

	resetHandler: () => void;

	stoppedHandler: (p1: CHHapticEngineStoppedReason) => void;

	constructor();

	constructor(o: { audioSession: AVAudioSession; });

	createAdvancedPlayerWithPatternError(pattern: CHHapticPattern): CHHapticAdvancedPatternPlayer;

	createPlayerWithPatternError(pattern: CHHapticPattern): CHHapticPatternPlayer;

	initAndReturnError(): this;

	initWithAudioSessionError(audioSession: AVAudioSession): this;

	notifyWhenPlayersFinished(finishedHandler: (p1: NSError) => CHHapticEngineFinishedAction): void;

	playPatternFromDataError(data: NSData): boolean;

	playPatternFromURLError(fileURL: NSURL): boolean;

	registerAudioResourceOptionsError(resourceURL: NSURL, options: NSDictionary<any, any>): number;

	startAndReturnError(): boolean;

	startWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	stopWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	unregisterAudioResourceError(resourceID: number): boolean;
}

declare const enum CHHapticEngineFinishedAction {

	StopEngine = 1,

	LeaveEngineRunning = 2
}

declare const enum CHHapticEngineStoppedReason {

	AudioSessionInterrupt = 1,

	ApplicationSuspended = 2,

	IdleTimeout = 3,

	NotifyWhenFinished = 4,

	SystemError = -1
}

declare const enum CHHapticErrorCode {

	EngineNotRunning = -4805,

	OperationNotPermitted = -4806,

	EngineStartTimeout = -4808,

	NotSupported = -4809,

	ServerInitFailed = -4810,

	ServerInterrupted = -4811,

	InvalidPatternPlayer = -4812,

	InvalidPatternData = -4813,

	InvalidPatternDictionary = -4814,

	InvalidAudioSession = -4815,

	InvalidParameterType = -4820,

	InvalidEventType = -4821,

	InvalidEventTime = -4822,

	InvalidEventDuration = -4823,

	InvalidAudioResource = -4824,

	ResourceNotAvailable = -4825,

	BadEventEntry = -4830,

	BadParameterEntry = -4831,

	InvalidTime = -4840,

	UnknownError = -4898,

	MemoryError = -4899
}

declare class CHHapticEvent extends NSObject {

	static alloc(): CHHapticEvent; // inherited from NSObject

	static new(): CHHapticEvent; // inherited from NSObject

	duration: number;

	readonly eventParameters: NSArray<CHHapticEventParameter>;

	relativeTime: number;

	readonly type: string;

	constructor(o: { audioResourceID: number; parameters: NSArray<CHHapticEventParameter> | CHHapticEventParameter[]; relativeTime: number; });

	constructor(o: { audioResourceID: number; parameters: NSArray<CHHapticEventParameter> | CHHapticEventParameter[]; relativeTime: number; duration: number; });

	constructor(o: { eventType: string; parameters: NSArray<CHHapticEventParameter> | CHHapticEventParameter[]; relativeTime: number; });

	constructor(o: { eventType: string; parameters: NSArray<CHHapticEventParameter> | CHHapticEventParameter[]; relativeTime: number; duration: number; });

	initWithAudioResourceIDParametersRelativeTime(resID: number, eventParams: NSArray<CHHapticEventParameter> | CHHapticEventParameter[], time: number): this;

	initWithAudioResourceIDParametersRelativeTimeDuration(resID: number, eventParams: NSArray<CHHapticEventParameter> | CHHapticEventParameter[], time: number, duration: number): this;

	initWithEventTypeParametersRelativeTime(type: string, eventParams: NSArray<CHHapticEventParameter> | CHHapticEventParameter[], time: number): this;

	initWithEventTypeParametersRelativeTimeDuration(type: string, eventParams: NSArray<CHHapticEventParameter> | CHHapticEventParameter[], time: number, duration: number): this;
}

declare class CHHapticEventParameter extends NSObject {

	static alloc(): CHHapticEventParameter; // inherited from NSObject

	static new(): CHHapticEventParameter; // inherited from NSObject

	readonly parameterID: string;

	value: number;

	constructor(o: { parameterID: string; value: number; });

	initWithParameterIDValue(parameterID: string, value: number): this;
}

declare var CHHapticEventParameterIDAttackTime: string;

declare var CHHapticEventParameterIDAudioBrightness: string;

declare var CHHapticEventParameterIDAudioPan: string;

declare var CHHapticEventParameterIDAudioPitch: string;

declare var CHHapticEventParameterIDAudioVolume: string;

declare var CHHapticEventParameterIDDecayTime: string;

declare var CHHapticEventParameterIDHapticIntensity: string;

declare var CHHapticEventParameterIDHapticSharpness: string;

declare var CHHapticEventParameterIDReleaseTime: string;

declare var CHHapticEventParameterIDSustained: string;

declare var CHHapticEventTypeAudioContinuous: string;

declare var CHHapticEventTypeAudioCustom: string;

declare var CHHapticEventTypeHapticContinuous: string;

declare var CHHapticEventTypeHapticTransient: string;

interface CHHapticParameterAttributes extends NSObjectProtocol {

	defaultValue: number;

	maxValue: number;

	minValue: number;
}
declare var CHHapticParameterAttributes: {

	prototype: CHHapticParameterAttributes;
};

declare class CHHapticParameterCurve extends NSObject {

	static alloc(): CHHapticParameterCurve; // inherited from NSObject

	static new(): CHHapticParameterCurve; // inherited from NSObject

	readonly controlPoints: NSArray<CHHapticParameterCurveControlPoint>;

	readonly parameterID: string;

	relativeTime: number;

	constructor(o: { parameterID: string; controlPoints: NSArray<CHHapticParameterCurveControlPoint> | CHHapticParameterCurveControlPoint[]; relativeTime: number; });

	initWithParameterIDControlPointsRelativeTime(parameterID: string, controlPoints: NSArray<CHHapticParameterCurveControlPoint> | CHHapticParameterCurveControlPoint[], relativeTime: number): this;
}

declare class CHHapticParameterCurveControlPoint extends NSObject {

	static alloc(): CHHapticParameterCurveControlPoint; // inherited from NSObject

	static new(): CHHapticParameterCurveControlPoint; // inherited from NSObject

	relativeTime: number;

	value: number;

	constructor(o: { relativeTime: number; value: number; });

	initWithRelativeTimeValue(time: number, value: number): this;
}

declare class CHHapticPattern extends NSObject {

	static alloc(): CHHapticPattern; // inherited from NSObject

	static new(): CHHapticPattern; // inherited from NSObject

	readonly duration: number;

	constructor(o: { dictionary: NSDictionary<string, any>; });

	constructor(o: { events: NSArray<CHHapticEvent> | CHHapticEvent[]; parameterCurves: NSArray<CHHapticParameterCurve> | CHHapticParameterCurve[]; });

	constructor(o: { events: NSArray<CHHapticEvent> | CHHapticEvent[]; parameters: NSArray<CHHapticDynamicParameter> | CHHapticDynamicParameter[]; });

	exportDictionaryAndReturnError(): NSDictionary<string, any>;

	initWithDictionaryError(patternDict: NSDictionary<string, any>): this;

	initWithEventsParameterCurvesError(events: NSArray<CHHapticEvent> | CHHapticEvent[], parameterCurves: NSArray<CHHapticParameterCurve> | CHHapticParameterCurve[]): this;

	initWithEventsParametersError(events: NSArray<CHHapticEvent> | CHHapticEvent[], parameters: NSArray<CHHapticDynamicParameter> | CHHapticDynamicParameter[]): this;
}

declare var CHHapticPatternKeyEvent: string;

declare var CHHapticPatternKeyEventDuration: string;

declare var CHHapticPatternKeyEventParameters: string;

declare var CHHapticPatternKeyEventType: string;

declare var CHHapticPatternKeyEventWaveformPath: string;

declare var CHHapticPatternKeyParameter: string;

declare var CHHapticPatternKeyParameterCurve: string;

declare var CHHapticPatternKeyParameterCurveControlPoints: string;

declare var CHHapticPatternKeyParameterID: string;

declare var CHHapticPatternKeyParameterValue: string;

declare var CHHapticPatternKeyPattern: string;

declare var CHHapticPatternKeyTime: string;

declare var CHHapticPatternKeyVersion: string;

interface CHHapticPatternPlayer extends NSObjectProtocol {

	isMuted: boolean;

	cancelAndReturnError(): boolean;

	scheduleParameterCurveAtTimeError(parameterCurve: CHHapticParameterCurve, time: number): boolean;

	sendParametersAtTimeError(parameters: NSArray<CHHapticDynamicParameter> | CHHapticDynamicParameter[], time: number): boolean;

	startAtTimeError(time: number): boolean;

	stopAtTimeError(time: number): boolean;
}
declare var CHHapticPatternPlayer: {

	prototype: CHHapticPatternPlayer;
};
