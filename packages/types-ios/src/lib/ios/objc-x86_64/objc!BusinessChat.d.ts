
/**
 * @since 11.3
 * @deprecated 16.1
 */
declare class BCChatAction extends NSObject {

	static alloc(): BCChatAction; // inherited from NSObject

	static new(): BCChatAction; // inherited from NSObject

	/**
	 * @since 11.3
	 * @deprecated 16.1
	 */
	static openTranscriptIntentParameters(businessIdentifier: string, intentParameters: NSDictionary<string, string>): void;
}

/**
 * @since 11.3
 * @deprecated 16.1
 */
declare class BCChatButton extends UIControl {

	static alloc(): BCChatButton; // inherited from NSObject

	static appearance(): BCChatButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): BCChatButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): BCChatButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): BCChatButton; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): BCChatButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): BCChatButton; // inherited from UIAppearance

	static new(): BCChatButton; // inherited from NSObject

	/**
	 * @since 11.3
	 * @deprecated 16.1
	 */
	constructor(o: { style: BCChatButtonStyle; });

	/**
	 * @since 11.3
	 * @deprecated 16.1
	 */
	initWithStyle(style: BCChatButtonStyle): this;
}

/**
 * @since 11.3
 * @deprecated 16.1
 */
declare const enum BCChatButtonStyle {

	Light = 0,

	Dark = 1
}

/**
 * @since 11.3
 * @deprecated 16.1
 */
declare var BCParameterNameBody: string;

/**
 * @since 11.3
 * @deprecated 16.1
 */
declare var BCParameterNameGroup: string;

/**
 * @since 11.3
 * @deprecated 16.1
 */
declare var BCParameterNameIntent: string;
