
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

declare class SFSpeechAudioBufferRecognitionRequest extends SFSpeechRecognitionRequest {

	static alloc(): SFSpeechAudioBufferRecognitionRequest; // inherited from NSObject

	static new(): SFSpeechAudioBufferRecognitionRequest; // inherited from NSObject

	readonly nativeAudioFormat: AVAudioFormat;

	appendAudioPCMBuffer(audioPCMBuffer: AVAudioPCMBuffer): void;

	appendAudioSampleBuffer(sampleBuffer: any): void;

	endAudio(): void;
}

declare class SFSpeechRecognitionRequest extends NSObject {

	static alloc(): SFSpeechRecognitionRequest; // inherited from NSObject

	static new(): SFSpeechRecognitionRequest; // inherited from NSObject

	contextualStrings: NSArray<string>;

	interactionIdentifier: string;

	requiresOnDeviceRecognition: boolean;

	shouldReportPartialResults: boolean;

	taskHint: SFSpeechRecognitionTaskHint;
}

declare class SFSpeechRecognitionResult extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFSpeechRecognitionResult; // inherited from NSObject

	static new(): SFSpeechRecognitionResult; // inherited from NSObject

	readonly bestTranscription: SFTranscription;

	readonly final: boolean;

	readonly transcriptions: NSArray<SFTranscription>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

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

interface SFSpeechRecognitionTaskDelegate extends NSObjectProtocol {

	speechRecognitionDidDetectSpeech?(task: SFSpeechRecognitionTask): void;

	speechRecognitionTaskDidFinishRecognition?(task: SFSpeechRecognitionTask, recognitionResult: SFSpeechRecognitionResult): void;

	speechRecognitionTaskDidFinishSuccessfully?(task: SFSpeechRecognitionTask, successfully: boolean): void;

	speechRecognitionTaskDidHypothesizeTranscription?(task: SFSpeechRecognitionTask, transcription: SFTranscription): void;

	speechRecognitionTaskFinishedReadingAudio?(task: SFSpeechRecognitionTask): void;

	speechRecognitionTaskWasCancelled?(task: SFSpeechRecognitionTask): void;
}
declare var SFSpeechRecognitionTaskDelegate: {

	prototype: SFSpeechRecognitionTaskDelegate;
};

declare const enum SFSpeechRecognitionTaskHint {

	Unspecified = 0,

	Dictation = 1,

	Search = 2,

	Confirmation = 3
}

declare const enum SFSpeechRecognitionTaskState {

	Starting = 0,

	Running = 1,

	Finishing = 2,

	Canceling = 3,

	Completed = 4
}

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

	supportsOnDeviceRecognition: boolean;

	constructor(o: { locale: NSLocale; });

	initWithLocale(locale: NSLocale): this;

	recognitionTaskWithRequestDelegate(request: SFSpeechRecognitionRequest, delegate: SFSpeechRecognitionTaskDelegate): SFSpeechRecognitionTask;

	recognitionTaskWithRequestResultHandler(request: SFSpeechRecognitionRequest, resultHandler: (p1: SFSpeechRecognitionResult, p2: NSError) => void): SFSpeechRecognitionTask;
}

declare const enum SFSpeechRecognizerAuthorizationStatus {

	NotDetermined = 0,

	Denied = 1,

	Restricted = 2,

	Authorized = 3
}

interface SFSpeechRecognizerDelegate extends NSObjectProtocol {

	speechRecognizerAvailabilityDidChange?(speechRecognizer: SFSpeechRecognizer, available: boolean): void;
}
declare var SFSpeechRecognizerDelegate: {

	prototype: SFSpeechRecognizerDelegate;
};

declare class SFSpeechURLRecognitionRequest extends SFSpeechRecognitionRequest {

	static alloc(): SFSpeechURLRecognitionRequest; // inherited from NSObject

	static new(): SFSpeechURLRecognitionRequest; // inherited from NSObject

	readonly URL: NSURL;

	constructor(o: { URL: NSURL; });

	initWithURL(URL: NSURL): this;
}

declare class SFTranscription extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFTranscription; // inherited from NSObject

	static new(): SFTranscription; // inherited from NSObject

	readonly averagePauseDuration: number;

	readonly formattedString: string;

	readonly segments: NSArray<SFTranscriptionSegment>;

	readonly speakingRate: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SFTranscriptionSegment extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFTranscriptionSegment; // inherited from NSObject

	static new(): SFTranscriptionSegment; // inherited from NSObject

	readonly alternativeSubstrings: NSArray<string>;

	readonly confidence: number;

	readonly duration: number;

	readonly substring: string;

	readonly substringRange: NSRange;

	readonly timestamp: number;

	readonly voiceAnalytics: SFVoiceAnalytics;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

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
