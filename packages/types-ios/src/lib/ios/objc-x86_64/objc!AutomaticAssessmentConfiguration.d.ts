
/**
 * @since 15.0
 */
declare class AEAssessmentApplication extends NSObject implements NSCopying {

	static alloc(): AEAssessmentApplication; // inherited from NSObject

	static new(): AEAssessmentApplication; // inherited from NSObject

	/**
	 * @since 17.5
	 */
	readonly bundleIdentifier: string;

	/**
	 * @since 17.5
	 */
	constructor(o: { bundleIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 17.5
	 */
	initWithBundleIdentifier(bundleIdentifier: string): this;
}

/**
 * @since 13.4
 */
declare class AEAssessmentConfiguration extends NSObject implements NSCopying {

	static alloc(): AEAssessmentConfiguration; // inherited from NSObject

	static new(): AEAssessmentConfiguration; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	allowsAccessibilitySpeech: boolean;

	/**
	 * @since 14.0
	 */
	allowsActivityContinuation: boolean;

	/**
	 * @since 14.0
	 */
	allowsContinuousPathKeyboard: boolean;

	/**
	 * @since 14.0
	 */
	allowsDictation: boolean;

	/**
	 * @since 14.0
	 */
	allowsKeyboardShortcuts: boolean;

	/**
	 * @since 14.0
	 */
	allowsPasswordAutoFill: boolean;

	/**
	 * @since 14.0
	 */
	allowsPredictiveKeyboard: boolean;

	/**
	 * @since 14.0
	 */
	allowsSpellCheck: boolean;

	/**
	 * @since 14.0
	 */
	autocorrectMode: AEAutocorrectMode;

	/**
	 * @since 17.5
	 */
	readonly configurationsByApplication: NSDictionary<AEAssessmentApplication, AEAssessmentParticipantConfiguration>;

	/**
	 * @since 17.5
	 */
	readonly mainParticipantConfiguration: AEAssessmentParticipantConfiguration;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 17.5
	 */
	removeApplication(application: AEAssessmentApplication): void;

	/**
	 * @since 17.5
	 */
	setConfigurationForApplication(configuration: AEAssessmentParticipantConfiguration, application: AEAssessmentApplication): void;
}

declare const enum AEAssessmentErrorCode {

	Unknown = 1,

	UnsupportedPlatform = 2,

	MultipleParticipantsNotSupported = 3,

	ConfigurationUpdatesNotSupported = 4
}

/**
 * @since 13.4
 */
declare var AEAssessmentErrorDomain: string;

/**
 * @since 15.0
 */
declare class AEAssessmentParticipantConfiguration extends NSObject implements NSCopying {

	static alloc(): AEAssessmentParticipantConfiguration; // inherited from NSObject

	static new(): AEAssessmentParticipantConfiguration; // inherited from NSObject

	/**
	 * @since 17.5
	 */
	allowsNetworkAccess: boolean;

	/**
	 * @since 18.0
	 */
	configurationInfo: NSDictionary<string, any>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.4
 */
declare class AEAssessmentSession extends NSObject {

	static alloc(): AEAssessmentSession; // inherited from NSObject

	static new(): AEAssessmentSession; // inherited from NSObject

	readonly active: boolean;

	/**
	 * @since 15.0
	 */
	readonly configuration: AEAssessmentConfiguration;

	delegate: AEAssessmentSessionDelegate;

	/**
	 * @since 17.5
	 */
	static readonly supportsConfigurationUpdates: boolean;

	/**
	 * @since 17.5
	 */
	static readonly supportsMultipleParticipants: boolean;

	constructor(o: { configuration: AEAssessmentConfiguration; });

	begin(): void;

	end(): void;

	initWithConfiguration(configuration: AEAssessmentConfiguration): this;

	/**
	 * @since 17.5
	 */
	updateToConfiguration(configuration: AEAssessmentConfiguration): void;
}

/**
 * @since 13.4
 */
interface AEAssessmentSessionDelegate extends NSObjectProtocol {

	assessmentSessionDidBegin?(session: AEAssessmentSession): void;

	assessmentSessionDidEnd?(session: AEAssessmentSession): void;

	/**
	 * @since 17.5
	 */
	assessmentSessionDidUpdate?(session: AEAssessmentSession): void;

	assessmentSessionFailedToBeginWithError?(session: AEAssessmentSession, error: NSError): void;

	/**
	 * @since 17.5
	 */
	assessmentSessionFailedToUpdateToConfigurationError?(session: AEAssessmentSession, configuration: AEAssessmentConfiguration, error: NSError): void;

	assessmentSessionWasInterruptedWithError?(session: AEAssessmentSession, error: NSError): void;
}
declare var AEAssessmentSessionDelegate: {

	prototype: AEAssessmentSessionDelegate;
};

declare const enum AEAutocorrectMode {

	None = 0,

	Spelling = 1,

	Punctuation = 2
}
