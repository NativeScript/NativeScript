
/**
 * @since 13.0
 */
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

/**
 * @since 16.0
 */
declare var CHHapticAudioResourceKeyLoopEnabled: string;

/**
 * @since 15.0
 */
declare var CHHapticAudioResourceKeyUseVolumeEnvelope: string;

/**
 * @since 13.0
 */
interface CHHapticDeviceCapability {

	supportsAudio: boolean;

	supportsHaptics: boolean;

	attributesForDynamicParameterError(inParameter: string): CHHapticParameterAttributes;

	attributesForEventParameterEventTypeError(inParameter: string, type: string): CHHapticParameterAttributes;
}
declare var CHHapticDeviceCapability: {

	prototype: CHHapticDeviceCapability;
};

/**
 * @since 13.0
 */
declare class CHHapticDynamicParameter extends NSObject {

	static alloc(): CHHapticDynamicParameter; // inherited from NSObject

	static new(): CHHapticDynamicParameter; // inherited from NSObject

	readonly parameterID: string;

	relativeTime: number;

	value: number;

	constructor(o: { parameterID: string; value: number; relativeTime: number; });

	initWithParameterIDValueRelativeTime(parameterID: string, value: number, time: number): this;
}

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDAudioAttackTimeControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDAudioBrightnessControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDAudioDecayTimeControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDAudioPanControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDAudioPitchControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDAudioReleaseTimeControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDAudioVolumeControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDHapticAttackTimeControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDHapticDecayTimeControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDHapticIntensityControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDHapticReleaseTimeControl: string;

/**
 * @since 13.0
 */
declare var CHHapticDynamicParameterIDHapticSharpnessControl: string;

/**
 * @since 13.0
 */
declare class CHHapticEngine extends NSObject {

	static alloc(): CHHapticEngine; // inherited from NSObject

	static capabilitiesForHardware(): CHHapticDeviceCapability;

	static new(): CHHapticEngine; // inherited from NSObject

	autoShutdownEnabled: boolean;

	readonly currentTime: number;

	isMutedForAudio: boolean;

	isMutedForHaptics: boolean;

	/**
	 * @since 16.0
	 */
	playsAudioOnly: boolean;

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

	EngineDestroyed = 5,

	GameControllerDisconnect = 6,

	SystemError = -1
}

/**
 * @since 13.0
 */
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

	InvalidEngineParameter = -4816,

	InvalidParameterType = -4820,

	InvalidEventType = -4821,

	InvalidEventTime = -4822,

	InvalidEventDuration = -4823,

	InvalidAudioResource = -4824,

	ResourceNotAvailable = -4825,

	BadEventEntry = -4830,

	BadParameterEntry = -4831,

	InvalidTime = -4840,

	FileNotFound = -4851,

	InsufficientPower = -4897,

	UnknownError = -4898,

	MemoryError = -4899
}

/**
 * @since 13.0
 */
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

/**
 * @since 13.0
 */
declare class CHHapticEventParameter extends NSObject {

	static alloc(): CHHapticEventParameter; // inherited from NSObject

	static new(): CHHapticEventParameter; // inherited from NSObject

	readonly parameterID: string;

	value: number;

	constructor(o: { parameterID: string; value: number; });

	initWithParameterIDValue(parameterID: string, value: number): this;
}

/**
 * @since 13.0
 */
declare var CHHapticEventParameterIDAttackTime: string;

/**
 * @since 13.0
 */
declare var CHHapticEventParameterIDAudioBrightness: string;

/**
 * @since 13.0
 */
declare var CHHapticEventParameterIDAudioPan: string;

/**
 * @since 13.0
 */
declare var CHHapticEventParameterIDAudioPitch: string;

/**
 * @since 13.0
 */
declare var CHHapticEventParameterIDAudioVolume: string;

/**
 * @since 13.0
 */
declare var CHHapticEventParameterIDDecayTime: string;

/**
 * @since 13.0
 */
declare var CHHapticEventParameterIDHapticIntensity: string;

/**
 * @since 13.0
 */
declare var CHHapticEventParameterIDHapticSharpness: string;

/**
 * @since 13.0
 */
declare var CHHapticEventParameterIDReleaseTime: string;

/**
 * @since 13.0
 */
declare var CHHapticEventParameterIDSustained: string;

/**
 * @since 13.0
 */
declare var CHHapticEventTypeAudioContinuous: string;

/**
 * @since 13.0
 */
declare var CHHapticEventTypeAudioCustom: string;

/**
 * @since 13.0
 */
declare var CHHapticEventTypeHapticContinuous: string;

/**
 * @since 13.0
 */
declare var CHHapticEventTypeHapticTransient: string;

/**
 * @since 13.0
 */
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

/**
 * @since 13.0
 */
declare class CHHapticParameterCurveControlPoint extends NSObject {

	static alloc(): CHHapticParameterCurveControlPoint; // inherited from NSObject

	static new(): CHHapticParameterCurveControlPoint; // inherited from NSObject

	relativeTime: number;

	value: number;

	constructor(o: { relativeTime: number; value: number; });

	initWithRelativeTimeValue(time: number, value: number): this;
}

/**
 * @since 13.0
 */
declare class CHHapticPattern extends NSObject {

	static alloc(): CHHapticPattern; // inherited from NSObject

	static new(): CHHapticPattern; // inherited from NSObject

	readonly duration: number;

	/**
	 * @since 16.0
	 */
	constructor(o: { contentsOfURL: NSURL; });

	constructor(o: { dictionary: NSDictionary<string, any>; });

	constructor(o: { events: NSArray<CHHapticEvent> | CHHapticEvent[]; parameterCurves: NSArray<CHHapticParameterCurve> | CHHapticParameterCurve[]; });

	constructor(o: { events: NSArray<CHHapticEvent> | CHHapticEvent[]; parameters: NSArray<CHHapticDynamicParameter> | CHHapticDynamicParameter[]; });

	exportDictionaryAndReturnError(): NSDictionary<string, any>;

	/**
	 * @since 16.0
	 */
	initWithContentsOfURLError(ahapURL: NSURL): this;

	initWithDictionaryError(patternDict: NSDictionary<string, any>): this;

	initWithEventsParameterCurvesError(events: NSArray<CHHapticEvent> | CHHapticEvent[], parameterCurves: NSArray<CHHapticParameterCurve> | CHHapticParameterCurve[]): this;

	initWithEventsParametersError(events: NSArray<CHHapticEvent> | CHHapticEvent[], parameters: NSArray<CHHapticDynamicParameter> | CHHapticDynamicParameter[]): this;
}

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyEvent: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyEventDuration: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyEventParameters: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyEventType: string;

/**
 * @since 16.0
 */
declare var CHHapticPatternKeyEventWaveformLoopEnabled: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyEventWaveformPath: string;

/**
 * @since 15.0
 */
declare var CHHapticPatternKeyEventWaveformUseVolumeEnvelope: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyParameter: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyParameterCurve: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyParameterCurveControlPoints: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyParameterID: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyParameterValue: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyPattern: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyTime: string;

/**
 * @since 13.0
 */
declare var CHHapticPatternKeyVersion: string;

/**
 * @since 13.0
 */
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
