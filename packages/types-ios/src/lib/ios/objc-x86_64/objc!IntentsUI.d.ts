
/**
 * @since 12.0
 */
declare class INUIAddVoiceShortcutButton extends UIButton {

	static alloc(): INUIAddVoiceShortcutButton; // inherited from NSObject

	static appearance(): INUIAddVoiceShortcutButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): INUIAddVoiceShortcutButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): INUIAddVoiceShortcutButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): INUIAddVoiceShortcutButton; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): INUIAddVoiceShortcutButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): INUIAddVoiceShortcutButton; // inherited from UIAppearance

	/**
	 * @since 15.0
	 */
	static buttonWithConfigurationPrimaryAction(configuration: UIButtonConfiguration, primaryAction: UIAction): INUIAddVoiceShortcutButton; // inherited from UIButton

	static buttonWithType(buttonType: UIButtonType): INUIAddVoiceShortcutButton; // inherited from UIButton

	/**
	 * @since 14.0
	 */
	static buttonWithTypePrimaryAction(buttonType: UIButtonType, primaryAction: UIAction): INUIAddVoiceShortcutButton; // inherited from UIButton

	static new(): INUIAddVoiceShortcutButton; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static systemButtonWithImageTargetAction(image: UIImage, target: any, action: string): INUIAddVoiceShortcutButton; // inherited from UIButton

	/**
	 * @since 14.0
	 */
	static systemButtonWithPrimaryAction(primaryAction: UIAction): INUIAddVoiceShortcutButton; // inherited from UIButton

	/**
	 * @since 13.0
	 */
	cornerRadius: number;

	delegate: INUIAddVoiceShortcutButtonDelegate;

	shortcut: INShortcut;

	readonly style: INUIAddVoiceShortcutButtonStyle;

	constructor(o: { style: INUIAddVoiceShortcutButtonStyle; });

	initWithStyle(style: INUIAddVoiceShortcutButtonStyle): this;

	/**
	 * @since 13.0
	 */
	setStyle(style: INUIAddVoiceShortcutButtonStyle): void;
}

/**
 * @since 12.0
 */
interface INUIAddVoiceShortcutButtonDelegate extends NSObjectProtocol {

	presentAddVoiceShortcutViewControllerForAddVoiceShortcutButton(addVoiceShortcutViewController: INUIAddVoiceShortcutViewController, addVoiceShortcutButton: INUIAddVoiceShortcutButton): void;

	presentEditVoiceShortcutViewControllerForAddVoiceShortcutButton(editVoiceShortcutViewController: INUIEditVoiceShortcutViewController, addVoiceShortcutButton: INUIAddVoiceShortcutButton): void;
}
declare var INUIAddVoiceShortcutButtonDelegate: {

	prototype: INUIAddVoiceShortcutButtonDelegate;
};

/**
 * @since 12.0
 */
declare const enum INUIAddVoiceShortcutButtonStyle {

	White = 0,

	WhiteOutline = 1,

	Black = 2,

	BlackOutline = 3,

	Automatic = 4,

	AutomaticOutline = 5
}

/**
 * @since 12.0
 */
declare class INUIAddVoiceShortcutViewController extends UIViewController {

	static alloc(): INUIAddVoiceShortcutViewController; // inherited from NSObject

	static new(): INUIAddVoiceShortcutViewController; // inherited from NSObject

	delegate: INUIAddVoiceShortcutViewControllerDelegate;

	constructor(o: { shortcut: INShortcut; });

	initWithShortcut(shortcut: INShortcut): this;
}

/**
 * @since 12.0
 */
interface INUIAddVoiceShortcutViewControllerDelegate extends NSObjectProtocol {

	addVoiceShortcutViewControllerDidCancel(controller: INUIAddVoiceShortcutViewController): void;

	addVoiceShortcutViewControllerDidFinishWithVoiceShortcutError(controller: INUIAddVoiceShortcutViewController, voiceShortcut: INVoiceShortcut, error: NSError): void;
}
declare var INUIAddVoiceShortcutViewControllerDelegate: {

	prototype: INUIAddVoiceShortcutViewControllerDelegate;
};

/**
 * @since 12.0
 */
declare class INUIEditVoiceShortcutViewController extends UIViewController {

	static alloc(): INUIEditVoiceShortcutViewController; // inherited from NSObject

	static new(): INUIEditVoiceShortcutViewController; // inherited from NSObject

	delegate: INUIEditVoiceShortcutViewControllerDelegate;

	constructor(o: { voiceShortcut: INVoiceShortcut; });

	initWithVoiceShortcut(voiceShortcut: INVoiceShortcut): this;
}

/**
 * @since 12.0
 */
interface INUIEditVoiceShortcutViewControllerDelegate extends NSObjectProtocol {

	editVoiceShortcutViewControllerDidCancel(controller: INUIEditVoiceShortcutViewController): void;

	editVoiceShortcutViewControllerDidDeleteVoiceShortcutWithIdentifier(controller: INUIEditVoiceShortcutViewController, deletedVoiceShortcutIdentifier: NSUUID): void;

	editVoiceShortcutViewControllerDidUpdateVoiceShortcutError(controller: INUIEditVoiceShortcutViewController, voiceShortcut: INVoiceShortcut, error: NSError): void;
}
declare var INUIEditVoiceShortcutViewControllerDelegate: {

	prototype: INUIEditVoiceShortcutViewControllerDelegate;
};

/**
 * @since 10.0
 */
declare const enum INUIHostedViewContext {

	SiriSnippet = 0,

	MapsCard = 1
}

/**
 * @since 10.0
 */
interface INUIHostedViewControlling extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	configureViewForParametersOfInteractionInteractiveBehaviorContextCompletion?(parameters: NSSet<INParameter>, interaction: INInteraction, interactiveBehavior: INUIInteractiveBehavior, context: INUIHostedViewContext, completion: (p1: boolean, p2: NSSet<INParameter>, p3: CGSize) => void): void;

	configureWithInteractionContextCompletion?(interaction: INInteraction, context: INUIHostedViewContext, completion: (p1: CGSize) => void): void;
}
declare var INUIHostedViewControlling: {

	prototype: INUIHostedViewControlling;
};

/**
 * @since 10.0
 */
interface INUIHostedViewSiriProviding extends NSObjectProtocol {

	displaysMap?: boolean;

	displaysMessage?: boolean;

	displaysPaymentTransaction?: boolean;
}
declare var INUIHostedViewSiriProviding: {

	prototype: INUIHostedViewSiriProviding;
};

/**
 * @since 11.0
 */
declare const enum INUIInteractiveBehavior {

	None = 0,

	NextView = 1,

	Launch = 2,

	GenericAction = 3
}

declare var IntentsUIVersionNumber: number;

declare var IntentsUIVersionString: interop.Reference<number>;
