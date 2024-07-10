
/**
 * @since 13
 */
declare class SFAcousticFeature extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFAcousticFeature; // inherited from NSObject

	static new(): SFAcousticFeature; // inherited from NSObject

	readonly acousticFeatureValuePerFrame: NSArray<number>;

	readonly frameDuration: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class SFSpeechAudioBufferRecognitionRequest extends SFSpeechRecognitionRequest {

	static alloc(): SFSpeechAudioBufferRecognitionRequest; // inherited from NSObject

	static new(): SFSpeechAudioBufferRecognitionRequest; // inherited from NSObject

	readonly nativeAudioFormat: AVAudioFormat;

	appendAudioPCMBuffer(audioPCMBuffer: AVAudioPCMBuffer): void;

	appendAudioSampleBuffer(sampleBuffer: any): void;

	endAudio(): void;
}

/**
 * @since 17
 */
declare const enum SFSpeechErrorCode {

	InternalServiceError = 1,

	AudioReadFailed = 2,

	UndefinedTemplateClassName = 7,

	MalformedSupplementalModel = 8
}

/**
 * @since 17
 */
declare var SFSpeechErrorDomain: string;

/**
 * @since 17
 */
declare class SFSpeechLanguageModel extends NSObject {

	static alloc(): SFSpeechLanguageModel; // inherited from NSObject

	static new(): SFSpeechLanguageModel; // inherited from NSObject

	static prepareCustomLanguageModelForUrlClientIdentifierConfigurationCompletion(asset: NSURL, clientIdentifier: string, configuration: SFSpeechLanguageModelConfiguration, completion: (p1: NSError) => void): void;

	static prepareCustomLanguageModelForUrlClientIdentifierConfigurationIgnoresCacheCompletion(asset: NSURL, clientIdentifier: string, configuration: SFSpeechLanguageModelConfiguration, ignoresCache: boolean, completion: (p1: NSError) => void): void;
}

/**
 * @since 17
 */
declare class SFSpeechLanguageModelConfiguration extends NSObject implements NSCopying {

	static alloc(): SFSpeechLanguageModelConfiguration; // inherited from NSObject

	static new(): SFSpeechLanguageModelConfiguration; // inherited from NSObject

	readonly languageModel: NSURL;

	readonly vocabulary: NSURL;

	constructor(o: { languageModel: NSURL; });

	constructor(o: { languageModel: NSURL; vocabulary: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithLanguageModel(languageModel: NSURL): this;

	initWithLanguageModelVocabulary(languageModel: NSURL, vocabulary: NSURL): this;
}

/**
 * @since 14.5
 */
declare class SFSpeechRecognitionMetadata extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFSpeechRecognitionMetadata; // inherited from NSObject

	static new(): SFSpeechRecognitionMetadata; // inherited from NSObject

	readonly averagePauseDuration: number;

	readonly speakingRate: number;

	readonly speechDuration: number;

	readonly speechStartTimestamp: number;

	readonly voiceAnalytics: SFVoiceAnalytics;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class SFSpeechRecognitionRequest extends NSObject {

	static alloc(): SFSpeechRecognitionRequest; // inherited from NSObject

	static new(): SFSpeechRecognitionRequest; // inherited from NSObject

	/**
	 * @since 16
	 */
	addsPunctuation: boolean;

	contextualStrings: NSArray<string>;

	/**
	 * @since 17
	 */
	customizedLanguageModel: SFSpeechLanguageModelConfiguration;

	/**
	 * @since 10.0
	 * @deprecated 15.0
	 */
	interactionIdentifier: string;

	/**
	 * @since 13
	 */
	requiresOnDeviceRecognition: boolean;

	shouldReportPartialResults: boolean;

	taskHint: SFSpeechRecognitionTaskHint;
}

/**
 * @since 10.0
 */
declare class SFSpeechRecognitionResult extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFSpeechRecognitionResult; // inherited from NSObject

	static new(): SFSpeechRecognitionResult; // inherited from NSObject

	readonly bestTranscription: SFTranscription;

	readonly final: boolean;

	/**
	 * @since 14.0
	 */
	readonly speechRecognitionMetadata: SFSpeechRecognitionMetadata;

	readonly transcriptions: NSArray<SFTranscription>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class SFSpeechRecognitionTask extends NSObject {

	static alloc(): SFSpeechRecognitionTask; // inherited from NSObject

	static new(): SFSpeechRecognitionTask; // inherited from NSObject

	readonly cancelled: boolean;

	readonly error: NSError;

	readonly finishing: boolean;

	readonly state: SFSpeechRecognitionTaskState;

	cancel(): void;

	finish(): void;
}

/**
 * @since 10.0
 */
interface SFSpeechRecognitionTaskDelegate extends NSObjectProtocol {

	speechRecognitionDidDetectSpeech?(task: SFSpeechRecognitionTask): void;

	speechRecognitionTaskDidFinishRecognition?(task: SFSpeechRecognitionTask, recognitionResult: SFSpeechRecognitionResult): void;

	speechRecognitionTaskDidFinishSuccessfully?(task: SFSpeechRecognitionTask, successfully: boolean): void;

	speechRecognitionTaskDidHypothesizeTranscription?(task: SFSpeechRecognitionTask, transcription: SFTranscription): void;

	/**
	 * @since 10.0
	 */
	speechRecognitionTaskDidProcessAudioDuration?(task: SFSpeechRecognitionTask, duration: number): void;

	speechRecognitionTaskFinishedReadingAudio?(task: SFSpeechRecognitionTask): void;

	speechRecognitionTaskWasCancelled?(task: SFSpeechRecognitionTask): void;
}
declare var SFSpeechRecognitionTaskDelegate: {

	prototype: SFSpeechRecognitionTaskDelegate;
};

/**
 * @since 10.0
 */
declare const enum SFSpeechRecognitionTaskHint {

	Unspecified = 0,

	Dictation = 1,

	Search = 2,

	Confirmation = 3
}

/**
 * @since 10.0
 */
declare const enum SFSpeechRecognitionTaskState {

	Starting = 0,

	Running = 1,

	Finishing = 2,

	Canceling = 3,

	Completed = 4
}

/**
 * @since 10.0
 */
declare class SFSpeechRecognizer extends NSObject {

	static alloc(): SFSpeechRecognizer; // inherited from NSObject

	static authorizationStatus(): SFSpeechRecognizerAuthorizationStatus;

	static new(): SFSpeechRecognizer; // inherited from NSObject

	static requestAuthorization(handler: (p1: SFSpeechRecognizerAuthorizationStatus) => void): void;

	static supportedLocales(): NSSet<NSLocale>;

	readonly available: boolean;

	defaultTaskHint: SFSpeechRecognitionTaskHint;

	delegate: SFSpeechRecognizerDelegate;

	readonly locale: NSLocale;

	queue: NSOperationQueue;

	/**
	 * @since 13
	 */
	supportsOnDeviceRecognition: boolean;

	constructor(o: { locale: NSLocale; });

	initWithLocale(locale: NSLocale): this;

	recognitionTaskWithRequestDelegate(request: SFSpeechRecognitionRequest, delegate: SFSpeechRecognitionTaskDelegate): SFSpeechRecognitionTask;

	recognitionTaskWithRequestResultHandler(request: SFSpeechRecognitionRequest, resultHandler: (p1: SFSpeechRecognitionResult, p2: NSError) => void): SFSpeechRecognitionTask;
}

/**
 * @since 10.0
 */
declare const enum SFSpeechRecognizerAuthorizationStatus {

	NotDetermined = 0,

	Denied = 1,

	Restricted = 2,

	Authorized = 3
}

/**
 * @since 10.0
 */
interface SFSpeechRecognizerDelegate extends NSObjectProtocol {

	speechRecognizerAvailabilityDidChange?(speechRecognizer: SFSpeechRecognizer, available: boolean): void;
}
declare var SFSpeechRecognizerDelegate: {

	prototype: SFSpeechRecognizerDelegate;
};

/**
 * @since 10.0
 */
declare class SFSpeechURLRecognitionRequest extends SFSpeechRecognitionRequest {

	static alloc(): SFSpeechURLRecognitionRequest; // inherited from NSObject

	static new(): SFSpeechURLRecognitionRequest; // inherited from NSObject

	readonly URL: NSURL;

	constructor(o: { URL: NSURL; });

	initWithURL(URL: NSURL): this;
}

/**
 * @since 10.0
 */
declare class SFTranscription extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFTranscription; // inherited from NSObject

	static new(): SFTranscription; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 14.5
	 */
	readonly averagePauseDuration: number;

	readonly formattedString: string;

	readonly segments: NSArray<SFTranscriptionSegment>;

	/**
	 * @since 13.0
	 * @deprecated 14.5
	 */
	readonly speakingRate: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class SFTranscriptionSegment extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFTranscriptionSegment; // inherited from NSObject

	static new(): SFTranscriptionSegment; // inherited from NSObject

	readonly alternativeSubstrings: NSArray<string>;

	readonly confidence: number;

	readonly duration: number;

	readonly substring: string;

	readonly substringRange: NSRange;

	readonly timestamp: number;

	/**
	 * @since 13.0
	 * @deprecated 14.5
	 */
	readonly voiceAnalytics: SFVoiceAnalytics;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13
 */
declare class SFVoiceAnalytics extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFVoiceAnalytics; // inherited from NSObject

	static new(): SFVoiceAnalytics; // inherited from NSObject

	readonly jitter: SFAcousticFeature;

	readonly pitch: SFAcousticFeature;

	readonly shimmer: SFAcousticFeature;

	readonly voicing: SFAcousticFeature;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}
