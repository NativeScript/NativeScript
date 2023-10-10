
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

declare var SFAnalysisContextTagLeftContext: string;

declare var SFAnalysisContextTagRightContext: string;

declare var SFAnalysisContextTagSelectedText: string;

declare class SFSpeechAudioBufferRecognitionRequest extends SFSpeechRecognitionRequest {

	static alloc(): SFSpeechAudioBufferRecognitionRequest; // inherited from NSObject

	static new(): SFSpeechAudioBufferRecognitionRequest; // inherited from NSObject

	readonly nativeAudioFormat: AVAudioFormat;

	appendAudioPCMBuffer(audioPCMBuffer: AVAudioPCMBuffer): void;

	appendAudioSampleBuffer(sampleBuffer: any): void;

	endAudio(): void;
}

declare const enum SFSpeechErrorCode {

	InternalServiceError = 1,

	UndefinedTemplateClassName = 7,

	MalformedSupplementalModel = 8
}

declare var SFSpeechErrorDomain: string;

declare class SFSpeechLanguageModel extends NSObject {

	static alloc(): SFSpeechLanguageModel; // inherited from NSObject

	static new(): SFSpeechLanguageModel; // inherited from NSObject

	static prepareCustomLanguageModelForUrlClientIdentifierConfigurationCompletion(asset: NSURL, clientIdentifier: string, configuration: SFSpeechLanguageModelConfiguration, completion: (p1: NSError) => void): void;

	static prepareCustomLanguageModelForUrlClientIdentifierConfigurationIgnoresCacheCompletion(asset: NSURL, clientIdentifier: string, configuration: SFSpeechLanguageModelConfiguration, ignoresCache: boolean, completion: (p1: NSError) => void): void;
}

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

declare class SFSpeechRecognitionRequest extends NSObject {

	static alloc(): SFSpeechRecognitionRequest; // inherited from NSObject

	static new(): SFSpeechRecognitionRequest; // inherited from NSObject

	addsPunctuation: boolean;

	contextualStrings: NSArray<string>;

	customizedLanguageModel: SFSpeechLanguageModelConfiguration;

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

	readonly speechRecognitionMetadata: SFSpeechRecognitionMetadata;

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

declare class _SFAnalysisContext extends NSObject {

	static alloc(): _SFAnalysisContext; // inherited from NSObject

	static new(): _SFAnalysisContext; // inherited from NSObject

	contextualNamedEntities: NSArray<_SFContextualNamedEntity>;

	geoLMRegionID: string;

	contextualStringsForKey(key: string): NSArray<string>;

	setContextualStringsForKey(contextualStrings: NSArray<string> | string[], key: string): void;

	setUserDataForKey(userData: any, key: string): void;

	userDataForKey(key: string): any;
}

declare var _SFAnalysisContextTagContextualNamedEntities: string;

declare var _SFAnalysisContextTagGeoLMRegionID: string;

declare var _SFAnalysisContextTagLeftContext: string;

declare var _SFAnalysisContextTagRightContext: string;

declare var _SFAnalysisContextTagSelectedText: string;

declare class _SFAnalyzerTranscriptionSegment extends NSObject {

	static alloc(): _SFAnalyzerTranscriptionSegment; // inherited from NSObject

	static new(): _SFAnalyzerTranscriptionSegment; // inherited from NSObject

	readonly alternatives: NSArray<NSArray<_SFToken>>;

	readonly text: NSArray<_SFToken>;

	constructor(o: { text: NSArray<_SFToken> | _SFToken[]; alternatives: NSArray<NSArray<_SFToken>> | NSArray<_SFToken>[]; });

	initWithTextAlternatives(text: NSArray<_SFToken> | _SFToken[], alternatives: NSArray<NSArray<_SFToken>> | NSArray<_SFToken>[]): this;
}

declare class _SFCommandRecognizerArgument extends NSObject {

	static alloc(): _SFCommandRecognizerArgument; // inherited from NSObject

	static new(): _SFCommandRecognizerArgument; // inherited from NSObject

	readonly adpositionIndexes: NSIndexSet;

	readonly indexes: NSIndexSet;

	readonly presence: _SFCommandRecognizerArgumentPresence;

	constructor(o: { presence: _SFCommandRecognizerArgumentPresence; indexes: NSIndexSet; adpositionIndexes: NSIndexSet; });

	initWithPresenceIndexesAdpositionIndexes(presence: _SFCommandRecognizerArgumentPresence, indexes: NSIndexSet, adpositionIndexes: NSIndexSet): this;
}

declare const enum _SFCommandRecognizerArgumentPresence {

	_SFCommandRecognizerArgumentPresencePresentAndDelimited = 0,

	_SFCommandRecognizerArgumentPresencePresentMaybeIncomplete = 1,

	_SFCommandRecognizerArgumentPresenceMissingMaybeExpected = 2,

	_SFCommandRecognizerArgumentPresenceMissing = 3,

	SFCommandRecognizerArgumentPresencePresentAndDelimited = 0,

	SFCommandRecognizerArgumentPresencePresentMaybeIncomplete = 1,

	SFCommandRecognizerArgumentPresenceMissingMaybeExpected = 2,

	SFCommandRecognizerArgumentPresenceMissing = 3
}

declare class _SFCommandRecognizerInterpretation extends NSObject {

	static alloc(): _SFCommandRecognizerInterpretation; // inherited from NSObject

	static new(): _SFCommandRecognizerInterpretation; // inherited from NSObject

	readonly arguments: NSArray<_SFCommandRecognizerArgument>;

	readonly commandIdentifier: string;

	readonly range: NSRange;

	readonly suiteIdentifiers: NSSet<string>;

	readonly verbIndexes: NSIndexSet;

	constructor(o: { commandIdentifier: string; suiteIdentifiers: NSSet<string>; range: NSRange; verbIndexes: NSIndexSet; arguments: NSArray<_SFCommandRecognizerArgument> | _SFCommandRecognizerArgument[]; });

	initWithCommandIdentifierSuiteIdentifiersRangeVerbIndexesArguments(commandIdentifier: string, suiteIdentifiers: NSSet<string>, range: NSRange, verbIndexes: NSIndexSet, _arguments: NSArray<_SFCommandRecognizerArgument> | _SFCommandRecognizerArgument[]): this;
}

declare class _SFContextualNamedEntity extends NSObject {

	static alloc(): _SFContextualNamedEntity; // inherited from NSObject

	static new(): _SFContextualNamedEntity; // inherited from NSObject

	constructor(o: { peopleSuggesterRecipientDisplayName: string; });

	constructor(o: { personalizationPortraitName: string; score: number; category: number; language: string; });

	initWithPeopleSuggesterRecipientDisplayName(displayName: string): this;

	initWithPersonalizationPortraitNameScoreCategoryLanguage(name: string, score: number, category: number, language: string): this;
}

declare const enum _SFEARResultType {

	Partial = 0,

	Candidate = 1,

	Final = 2,

	FinalAndTerminal = 3,

	PauseConfirmation = 4
}

declare class _SFEndpointingResult extends NSObject {

	static alloc(): _SFEndpointingResult; // inherited from NSObject

	static new(): _SFEndpointingResult; // inherited from NSObject

	readonly eosLikelihood: number;

	readonly pauseCounts: NSArray<number>;

	readonly range: CMTimeRange;

	readonly silencePosterior: number;

	readonly wordCount: number;

	constructor(o: { range: CMTimeRange; wordCount: number; eosLikelihood: number; pauseCounts: NSArray<number> | number[]; silencePosterior: number; });

	initWithRangeWordCountEosLikelihoodPauseCountsSilencePosterior(range: CMTimeRange, wordCount: number, eosLikelihood: number, pauseCounts: NSArray<number> | number[], silencePosterior: number): this;
}

declare class _SFInputSequencer extends NSObject {

	static alloc(): _SFInputSequencer; // inherited from NSObject

	static new(): _SFInputSequencer; // inherited from NSObject

	addAudio(audioBuffer: AVAudioPCMBuffer): void;

	finishAudio(): void;
}

declare class _SFModelDownloadRequest extends NSObject {

	static alloc(): _SFModelDownloadRequest; // inherited from NSObject

	static new(): _SFModelDownloadRequest; // inherited from NSObject

	readonly progress: NSProgress;

	downloadWithCompletion(completion: (p1: NSError) => void): void;
}

declare class _SFSpeechAnalyzer extends NSObject {

	static alloc(): _SFSpeechAnalyzer; // inherited from NSObject

	static modelDownloadRequestForClientIdentifierTranscriberOptions(clientIdentifier: string, transcriberOptions: _SFSpeechAnalyzerTranscriberOptions): _SFModelDownloadRequest;

	static new(): _SFSpeechAnalyzer; // inherited from NSObject

	readonly inputSequence: _SFInputSequencer;

	constructor(o: { clientIdentifier: string; inputSequence: _SFInputSequencer; audioFormat: AVAudioFormat; transcriberResultDelegate: _SFSpeechAnalyzerTranscriberResultDelegate; endpointingResultDelegate: _SFSpeechAnalyzerEndpointingResultDelegate; queue: NSOperationQueue; transcriberOptions: _SFSpeechAnalyzerTranscriberOptions; commandRecognizerOptions: _SFSpeechAnalyzerCommandRecognizerOptions; options: _SFSpeechAnalyzerOptions; restrictedLogging: boolean; geoLMRegionID: string; contextualNamedEntities: NSArray<_SFContextualNamedEntity> | _SFContextualNamedEntity[]; didChangeVolatileRange: (p1: CMTimeRange, p2: boolean, p3: boolean) => void; });

	cancelPendingResultsAndPauseWithCompletion(completion: (p1: NSError) => void): void;

	finalizeAndFinishThroughCompletion(time: CMTime, completion: (p1: NSError) => void): void;

	finalizeAndFinishThroughEndOfInputWithCompletion(completion: (p1: NSError) => void): void;

	finalizeAndFinishWithCompletion(completion: (p1: NSError) => void): void;

	finalizeThroughCompletion(time: CMTime, completion: (p1: NSError) => void): void;

	finalizeWithCompletion(completion: (p1: NSError) => void): void;

	getContextWithCompletion(completion: (p1: _SFAnalysisContext) => void): void;

	getModelInfoLanguageWithCompletion(completion: (p1: string) => void): void;

	getModelInfoTasksWithCompletion(completion: (p1: NSSet<string>) => void): void;

	getNextBufferStartTimeWithCompletion(completion: (p1: CMTime) => void): void;

	getRecognitionStatisticsWithCompletion(completion: (p1: NSDictionary<any, any>) => void): void;

	getRecognitionUtterenceStatisticsWithCompletion(completion: (p1: NSDictionary<any, any>) => void): void;

	initWithClientIdentifierInputSequenceAudioFormatTranscriberResultDelegateEndpointingResultDelegateQueueTranscriberOptionsCommandRecognizerOptionsOptionsRestrictedLoggingGeoLMRegionIDContextualNamedEntitiesDidChangeVolatileRange(clientIdentifier: string, inputSequence: _SFInputSequencer, audioFormat: AVAudioFormat, transcriberResultDelegate: _SFSpeechAnalyzerTranscriberResultDelegate, endpointingResultDelegate: _SFSpeechAnalyzerEndpointingResultDelegate, queue: NSOperationQueue, transcriberOptions: _SFSpeechAnalyzerTranscriberOptions, commandRecognizerOptions: _SFSpeechAnalyzerCommandRecognizerOptions, options: _SFSpeechAnalyzerOptions, restrictedLogging: boolean, geoLMRegionID: string, contextualNamedEntities: NSArray<_SFContextualNamedEntity> | _SFContextualNamedEntity[], didChangeVolatileRange: (p1: CMTimeRange, p2: boolean, p3: boolean) => void): this;

	prepareToAnalyzeReportingIntoCompletion(progress: NSProgress, completion: (p1: NSError) => void): void;

	requestResultAtEndpointTimes(times: NSArray<NSValue> | NSValue[]): void;

	resumeWithCompletion(completion: (p1: NSError) => void): void;

	setDidChangeVolatileRangeCompletion(handler: (p1: CMTimeRange, p2: boolean, p3: boolean) => void, completion: () => void): void;
}

declare class _SFSpeechAnalyzerCommandRecognizerOptions extends NSObject {

	static alloc(): _SFSpeechAnalyzerCommandRecognizerOptions; // inherited from NSObject

	static new(): _SFSpeechAnalyzerCommandRecognizerOptions; // inherited from NSObject
}

interface _SFSpeechAnalyzerEndpointingResultDelegate {

	speechAnalyzerDidProduceEndpointingResult(speechAnalyzer: _SFSpeechAnalyzer, endpointingResult: _SFEndpointingResult): void;

	speechAnalyzerDidStopEndpointingWithError(speechAnalyzer: _SFSpeechAnalyzer, error: NSError): void;
}
declare var _SFSpeechAnalyzerEndpointingResultDelegate: {

	prototype: _SFSpeechAnalyzerEndpointingResultDelegate;
};

declare class _SFSpeechAnalyzerOptions extends NSObject implements NSCopying {

	static alloc(): _SFSpeechAnalyzerOptions; // inherited from NSObject

	static new(): _SFSpeechAnalyzerOptions; // inherited from NSObject

	readonly highPriority: boolean;

	readonly loggingInfo: _SFSpeechAnalyzerOptionsLoggingInfo;

	readonly powerContext: _SFSpeechAnalyzerOptionsPowerContext;

	constructor(o: { highPriority: boolean; loggingInfo: _SFSpeechAnalyzerOptionsLoggingInfo; powerContext: _SFSpeechAnalyzerOptionsPowerContext; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithHighPriorityLoggingInfoPowerContext(highPriority: boolean, loggingInfo: _SFSpeechAnalyzerOptionsLoggingInfo, powerContext: _SFSpeechAnalyzerOptionsPowerContext): this;
}

declare class _SFSpeechAnalyzerOptionsLoggingInfo extends NSObject implements NSCopying {

	static alloc(): _SFSpeechAnalyzerOptionsLoggingInfo; // inherited from NSObject

	static new(): _SFSpeechAnalyzerOptionsLoggingInfo; // inherited from NSObject

	readonly asrID: NSUUID;

	readonly requestID: NSUUID;

	constructor(o: { asrID: NSUUID; requestID: NSUUID; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithAsrIDRequestID(asrID: NSUUID, requestID: NSUUID): this;
}

declare class _SFSpeechAnalyzerOptionsPowerContext extends NSObject implements NSCopying {

	static alloc(): _SFSpeechAnalyzerOptionsPowerContext; // inherited from NSObject

	static new(): _SFSpeechAnalyzerOptionsPowerContext; // inherited from NSObject

	readonly ane: string;

	readonly cpu: string;

	readonly gpu: string;

	constructor(o: { ane: string; cpu: string; gpu: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithAneCpuGpu(ane: string, cpu: string, gpu: string): this;
}

declare class _SFSpeechAnalyzerTranscriberOptions extends NSObject {

	static alloc(): _SFSpeechAnalyzerTranscriberOptions; // inherited from NSObject

	static new(): _SFSpeechAnalyzerTranscriberOptions; // inherited from NSObject

	attributeOptions: _SFTranscriptionResultAttributeOptions;

	locale: NSLocale;

	modelOptions: _SFTranscriberModelOptions;

	taskHint: SFSpeechRecognitionTaskHint;

	transcriptionOptions: _SFTranscriptionOptions;
}

interface _SFSpeechAnalyzerTranscriberResultDelegate {

	speechAnalyzerDidProduceAllTranscriberResults?(speechAnalyzer: _SFSpeechAnalyzer): void;

	speechAnalyzerDidProduceTranscriberResult(speechAnalyzer: _SFSpeechAnalyzer, transcriberResult: _SFTranscriberResult): void;

	speechAnalyzerDidStopTranscriptionWithError(speechAnalyzer: _SFSpeechAnalyzer, error: NSError): void;
}
declare var _SFSpeechAnalyzerTranscriberResultDelegate: {

	prototype: _SFSpeechAnalyzerTranscriberResultDelegate;
};

declare class _SFToken extends NSObject implements NSCopying {

	static alloc(): _SFToken; // inherited from NSObject

	static new(): _SFToken; // inherited from NSObject

	readonly confidence: number;

	readonly duration: number;

	readonly startTime: number;

	readonly text: string;

	constructor(o: { text: string; confidence: number; startTime: number; duration: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithTextConfidenceStartTimeDuration(text: string, confidence: number, startTime: number, duration: number): this;
}

declare class _SFTranscriberModelOptions extends NSObject implements NSCopying {

	static alloc(): _SFTranscriberModelOptions; // inherited from NSObject

	static new(): _SFTranscriberModelOptions; // inherited from NSObject

	readonly farField: boolean;

	readonly modelOverrideURL: NSURL;

	readonly speechProfileURLs: NSArray<NSURL>;

	readonly supplementalModelURL: NSURL;

	readonly taskForMemoryLock: string;

	constructor(o: { supplementalModelURL: NSURL; farField: boolean; modelOverrideURL: NSURL; speechProfileURLs: NSArray<NSURL> | NSURL[]; taskForMemoryLock: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithSupplementalModelURLFarFieldModelOverrideURLSpeechProfileURLsTaskForMemoryLock(supplementalModelURL: NSURL, farField: boolean, modelOverrideURL: NSURL, speechProfileURLs: NSArray<NSURL> | NSURL[], taskForMemoryLock: string): this;
}

declare class _SFTranscriberResult extends NSObject {

	static alloc(): _SFTranscriberResult; // inherited from NSObject

	static new(): _SFTranscriberResult; // inherited from NSObject

	readonly contextualizedCommandRecognizerResult: _STCommandRecognizerResult;

	readonly contextualizedTranscriberMultisegmentResult: _STTranscriberMultisegmentResult;

	readonly normalizedCommandRecognizerResult: _STCommandRecognizerResult;

	readonly normalizedTranscriberMultisegmentResult: _STTranscriberMultisegmentResult;

	readonly range: CMTimeRange;

	constructor(o: { range: CMTimeRange; normalizedTranscriberMultisegmentResult: _STTranscriberMultisegmentResult; normalizedCommandRecognizerResult: _STCommandRecognizerResult; contextualizedTranscriberMultisegmentResult: _STTranscriberMultisegmentResult; contextualizedCommandRecognizerResult: _STCommandRecognizerResult; });

	initWithRangeNormalizedTranscriberMultisegmentResultNormalizedCommandRecognizerResultContextualizedTranscriberMultisegmentResultContextualizedCommandRecognizerResult(range: CMTimeRange, normalizedTranscriberMultisegmentResult: _STTranscriberMultisegmentResult, normalizedCommandRecognizerResult: _STCommandRecognizerResult, contextualizedTranscriberMultisegmentResult: _STTranscriberMultisegmentResult, contextualizedCommandRecognizerResult: _STCommandRecognizerResult): this;
}

declare const enum _SFTranscriptionOptions {

	NormalizedTranscription = 1,

	ContextualizedTranscription = 2,

	Punctuation = 4,

	Emoji = 8,

	EtiquetteReplacements = 16
}

declare const enum _SFTranscriptionResultAttributeOptions {

	Confidence = 1,

	CmTime = 2
}

declare class _STCommandRecognizerResult extends NSObject implements NSCopying {

	static alloc(): _STCommandRecognizerResult; // inherited from NSObject

	static new(): _STCommandRecognizerResult; // inherited from NSObject

	readonly transcriptionCommands: NSArray<NSArray<_SFCommandRecognizerInterpretation>>;

	constructor(o: { transcriptionCommands: NSArray<NSArray<_SFCommandRecognizerInterpretation>> | NSArray<_SFCommandRecognizerInterpretation>[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithTranscriptionCommands(transcriptionCommands: NSArray<NSArray<_SFCommandRecognizerInterpretation>> | NSArray<_SFCommandRecognizerInterpretation>[]): this;
}

declare class _STTranscriberMultisegmentResult extends NSObject implements NSCopying {

	static alloc(): _STTranscriberMultisegmentResult; // inherited from NSObject

	static new(): _STTranscriberMultisegmentResult; // inherited from NSObject

	readonly earResultType: _SFEARResultType;

	readonly nBestChoices: NSArray<NSIndexPath>;

	readonly recognitionAudioRange: CMTimeRange;

	readonly segments: NSArray<_SFAnalyzerTranscriptionSegment>;

	readonly transcriptions: NSArray<NSArray<_SFToken>>;

	constructor(o: { segments: NSArray<_SFAnalyzerTranscriptionSegment> | _SFAnalyzerTranscriptionSegment[]; transcriptions: NSArray<NSArray<_SFToken>> | NSArray<_SFToken>[]; earResultType: _SFEARResultType; nBestChoices: NSArray<NSIndexPath> | NSIndexPath[]; recognitionAudioRange: CMTimeRange; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithSegmentsTranscriptionsEarResultTypeNBestChoicesRecognitionAudioRange(segments: NSArray<_SFAnalyzerTranscriptionSegment> | _SFAnalyzerTranscriptionSegment[], transcriptions: NSArray<NSArray<_SFToken>> | NSArray<_SFToken>[], earResultType: _SFEARResultType, nBestChoices: NSArray<NSIndexPath> | NSIndexPath[], recognitionAudioRange: CMTimeRange): this;
}
