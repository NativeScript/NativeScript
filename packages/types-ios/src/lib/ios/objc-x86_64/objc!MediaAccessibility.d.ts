
declare function MAAudibleMediaCopyPreferredCharacteristics(): interop.Unmanaged<NSArray<any>>;

declare function MACaptionAppearanceAddSelectedLanguage(domain: MACaptionAppearanceDomain, language: string): boolean;

declare const enum MACaptionAppearanceBehavior {

	kMACaptionAppearanceBehaviorUseValue = 0,

	kMACaptionAppearanceBehaviorUseContentIfAvailable = 1
}

declare function MACaptionAppearanceCopyBackgroundColor(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): interop.Unmanaged<any>;

declare function MACaptionAppearanceCopyFontDescriptorForStyle(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>, fontStyle: MACaptionAppearanceFontStyle): interop.Unmanaged<UIFontDescriptor>;

declare function MACaptionAppearanceCopyForegroundColor(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): interop.Unmanaged<any>;

declare function MACaptionAppearanceCopyPreferredCaptioningMediaCharacteristics(domain: MACaptionAppearanceDomain): interop.Unmanaged<NSArray<any>>;

declare function MACaptionAppearanceCopySelectedLanguages(domain: MACaptionAppearanceDomain): interop.Unmanaged<NSArray<any>>;

declare function MACaptionAppearanceCopyWindowColor(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): interop.Unmanaged<any>;

declare function MACaptionAppearanceDidDisplayCaptions(strings: NSArray<any> | any[]): void;

declare const enum MACaptionAppearanceDisplayType {

	kMACaptionAppearanceDisplayTypeForcedOnly = 0,

	kMACaptionAppearanceDisplayTypeAutomatic = 1,

	kMACaptionAppearanceDisplayTypeAlwaysOn = 2
}

declare const enum MACaptionAppearanceDomain {

	kMACaptionAppearanceDomainDefault = 0,

	kMACaptionAppearanceDomainUser = 1
}

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

declare function MACaptionAppearanceGetBackgroundOpacity(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): number;

declare function MACaptionAppearanceGetDisplayType(domain: MACaptionAppearanceDomain): MACaptionAppearanceDisplayType;

declare function MACaptionAppearanceGetForegroundOpacity(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): number;

declare function MACaptionAppearanceGetRelativeCharacterSize(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): number;

declare function MACaptionAppearanceGetTextEdgeStyle(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): MACaptionAppearanceTextEdgeStyle;

declare function MACaptionAppearanceGetWindowOpacity(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): number;

declare function MACaptionAppearanceGetWindowRoundedCornerRadius(domain: MACaptionAppearanceDomain, behavior: interop.Pointer | interop.Reference<MACaptionAppearanceBehavior>): number;

declare function MACaptionAppearanceSetDisplayType(domain: MACaptionAppearanceDomain, displayType: MACaptionAppearanceDisplayType): void;

declare const enum MACaptionAppearanceTextEdgeStyle {

	kMACaptionAppearanceTextEdgeStyleUndefined = 0,

	kMACaptionAppearanceTextEdgeStyleNone = 1,

	kMACaptionAppearanceTextEdgeStyleRaised = 2,

	kMACaptionAppearanceTextEdgeStyleDepressed = 3,

	kMACaptionAppearanceTextEdgeStyleUniform = 4,

	kMACaptionAppearanceTextEdgeStyleDropShadow = 5
}

declare function MAImageCaptioningCopyCaption(url: NSURL, error: interop.Pointer | interop.Reference<NSError>): string;

declare function MAImageCaptioningCopyMetadataTagPath(): string;

declare function MAImageCaptioningSetCaption(url: NSURL, string: string, error: interop.Pointer | interop.Reference<NSError>): boolean;

declare var MAMediaCharacteristicDescribesMusicAndSoundForAccessibility: string;

declare var MAMediaCharacteristicDescribesVideoForAccessibility: string;

declare var MAMediaCharacteristicTranscribesSpokenDialogForAccessibility: string;

declare var kMAAudibleMediaSettingsChangedNotification: string;

declare var kMACaptionAppearanceSettingsChangedNotification: string;
