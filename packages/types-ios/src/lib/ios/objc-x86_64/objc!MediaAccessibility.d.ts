
/**
 * @since 8.0
 */
declare function MAAudibleMediaCopyPreferredCharacteristics(): interop.Unmanaged<NSArray<any>>;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceAddSelectedLanguage(domain: MACaptionAppearanceDomain, language: string): boolean;

/**
 * @since 7.0
 */
declare const enum MACaptionAppearanceBehavior {

	kMACaptionAppearanceBehaviorUseValue = 0,

	kMACaptionAppearanceBehaviorUseContentIfAvailable = 1
}

/**
 * @since 7.0
 */
declare function MACaptionAppearanceCopyBackgroundColor(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): interop.Unmanaged<any>;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceCopyFontDescriptorForStyle(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>, fontStyle: MACaptionAppearanceFontStyle): interop.Unmanaged<UIFontDescriptor>;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceCopyForegroundColor(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): interop.Unmanaged<any>;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceCopyPreferredCaptioningMediaCharacteristics(domain: MACaptionAppearanceDomain): interop.Unmanaged<NSArray<any>>;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceCopySelectedLanguages(domain: MACaptionAppearanceDomain): interop.Unmanaged<NSArray<any>>;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceCopyWindowColor(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): interop.Unmanaged<any>;

declare function MACaptionAppearanceDidDisplayCaptions(strings: NSArray<any> | any[]): void;

/**
 * @since 7.0
 */
declare const enum MACaptionAppearanceDisplayType {

	kMACaptionAppearanceDisplayTypeForcedOnly = 0,

	kMACaptionAppearanceDisplayTypeAutomatic = 1,

	kMACaptionAppearanceDisplayTypeAlwaysOn = 2
}

/**
 * @since 7.0
 */
declare const enum MACaptionAppearanceDomain {

	kMACaptionAppearanceDomainDefault = 0,

	kMACaptionAppearanceDomainUser = 1
}

/**
 * @since 7.0
 */
declare const enum MACaptionAppearanceFontStyle {

	kMACaptionAppearanceFontStyleDefault = 0,

	kMACaptionAppearanceFontStyleMonospacedWithSerif = 1,

	kMACaptionAppearanceFontStyleProportionalWithSerif = 2,

	kMACaptionAppearanceFontStyleMonospacedWithoutSerif = 3,

	kMACaptionAppearanceFontStyleProportionalWithoutSerif = 4,

	kMACaptionAppearanceFontStyleCasual = 5,

	kMACaptionAppearanceFontStyleCursive = 6,

	kMACaptionAppearanceFontStyleSmallCapital = 7
}

/**
 * @since 7.0
 */
declare function MACaptionAppearanceGetBackgroundOpacity(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): number;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceGetDisplayType(domain: MACaptionAppearanceDomain): MACaptionAppearanceDisplayType;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceGetForegroundOpacity(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): number;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceGetRelativeCharacterSize(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): number;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceGetTextEdgeStyle(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): MACaptionAppearanceTextEdgeStyle;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceGetWindowOpacity(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): number;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceGetWindowRoundedCornerRadius(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): number;

/**
 * @since 18.0
 */
declare function MACaptionAppearanceIsCustomized(domain: MACaptionAppearanceDomain): boolean;

/**
 * @since 7.0
 */
declare function MACaptionAppearanceSetDisplayType(domain: MACaptionAppearanceDomain, displayType: MACaptionAppearanceDisplayType): void;

/**
 * @since 7.0
 */
declare const enum MACaptionAppearanceTextEdgeStyle {

	kMACaptionAppearanceTextEdgeStyleUndefined = 0,

	kMACaptionAppearanceTextEdgeStyleNone = 1,

	kMACaptionAppearanceTextEdgeStyleRaised = 2,

	kMACaptionAppearanceTextEdgeStyleDepressed = 3,

	kMACaptionAppearanceTextEdgeStyleUniform = 4,

	kMACaptionAppearanceTextEdgeStyleDropShadow = 5
}

/**
 * @since 16.4
 */
declare function MADimFlashingLightsEnabled(): boolean;

/**
 * @since 17.0
 */
declare class MAFlashingLightsProcessor extends NSObject {

	static alloc(): MAFlashingLightsProcessor; // inherited from NSObject

	static new(): MAFlashingLightsProcessor; // inherited from NSObject

	canProcessSurface(surface: IOSurface): boolean;

	processSurfaceOutSurfaceTimestampOptions(inSurface: IOSurface, outSurface: IOSurface, timestamp: number, options: NSDictionary<string, any>): MAFlashingLightsProcessorResult;
}

/**
 * @since 17.0
 */
declare class MAFlashingLightsProcessorResult extends NSObject {

	static alloc(): MAFlashingLightsProcessorResult; // inherited from NSObject

	static new(): MAFlashingLightsProcessorResult; // inherited from NSObject

	readonly intensityLevel: number;

	readonly mitigationLevel: number;

	readonly surfaceProcessed: boolean;
}

/**
 * @since 13.0
 */
declare function MAImageCaptioningCopyCaption(url: NSURL, error: interop.Pointer | interop.Reference<NSError>): string;

/**
 * @since 13.0
 */
declare function MAImageCaptioningCopyMetadataTagPath(): string;

/**
 * @since 13.0
 */
declare function MAImageCaptioningSetCaption(url: NSURL, string: string, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 7.0
 */
declare var MAMediaCharacteristicDescribesMusicAndSoundForAccessibility: string;

/**
 * @since 8.0
 */
declare var MAMediaCharacteristicDescribesVideoForAccessibility: string;

/**
 * @since 7.0
 */
declare var MAMediaCharacteristicTranscribesSpokenDialogForAccessibility: string;

/**
 * @since 18.0
 */
declare class MAMusicHapticsManager extends NSObject {

	static alloc(): MAMusicHapticsManager; // inherited from NSObject

	static new(): MAMusicHapticsManager; // inherited from NSObject

	readonly isActive: boolean;

	static readonly sharedManager: MAMusicHapticsManager;

	addStatusObserver(statusHandler: (p1: string, p2: boolean) => void): any;

	checkHapticTrackAvailabilityForMediaMatchingCodeCompletionHandler(internationalStandardRecordingCode: string, completionHandler: (p1: boolean) => void): void;

	removeStatusObserver(registrationToken: any): void;
}

/**
 * @since 18.0
 */
declare var MAMusicHapticsManagerActiveStatusDidChangeNotification: string;

declare var kMAAudibleMediaSettingsChangedNotification: string;

declare var kMACaptionAppearanceSettingsChangedNotification: string;

/**
 * @since 16.4
 */
declare var kMADimFlashingLightsChangedNotification: string;
