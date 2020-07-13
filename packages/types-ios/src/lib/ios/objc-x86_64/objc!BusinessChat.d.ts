
declare class BCChatAction extends NSObject {

	static alloc(): BCChatAction; // inherited from NSObject

	static new(): BCChatAction; // inherited from NSObject

	static openTranscriptIntentParameters(businessIdentifier: string, intentParameters: NSDictionary<string, string>): void;
}

declare class BCChatButton extends UIControl {

	static alloc(): BCChatButton; // inherited from NSObject

	static appearance(): BCChatButton; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): BCChatButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): BCChatButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): BCChatButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): BCChatButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): BCChatButton; // inherited from UIAppearance

	static new(): BCChatButton; // inherited from NSObject

	constructor(o: { style: BCChatButtonStyle; });

	initWithStyle(style: BCChatButtonStyle): this;
}

declare const enum BCChatButtonStyle {

	Light = 0,

	Dark = 1
}

declare var BCParameterNameBody: string;

declare var BCParameterNameGroup: string;

declare var BCParameterNameIntent: string;
