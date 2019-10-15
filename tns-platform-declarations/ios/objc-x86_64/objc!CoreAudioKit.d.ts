
declare class AUAudioUnitViewConfiguration extends NSObject implements NSSecureCoding {

	static alloc(): AUAudioUnitViewConfiguration; // inherited from NSObject

	static new(): AUAudioUnitViewConfiguration; // inherited from NSObject

	readonly height: number;

	readonly hostHasController: boolean;

	readonly width: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { width: number; height: number; hostHasController: boolean; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithWidthHeightHostHasController(width: number, height: number, hostHasController: boolean): this;
}

declare class AUViewController extends UIViewController implements NSExtensionRequestHandling {

	static alloc(): AUViewController; // inherited from NSObject

	static new(): AUViewController; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	beginRequestWithExtensionContext(context: NSExtensionContext): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class CABTMIDICentralViewController extends UITableViewController {

	static alloc(): CABTMIDICentralViewController; // inherited from NSObject

	static new(): CABTMIDICentralViewController; // inherited from NSObject
}

declare class CABTMIDILocalPeripheralViewController extends UIViewController {

	static alloc(): CABTMIDILocalPeripheralViewController; // inherited from NSObject

	static new(): CABTMIDILocalPeripheralViewController; // inherited from NSObject
}

declare class CAInterAppAudioSwitcherView extends UIView {

	static alloc(): CAInterAppAudioSwitcherView; // inherited from NSObject

	static appearance(): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static new(): CAInterAppAudioSwitcherView; // inherited from NSObject

	showingAppNames: boolean;

	contentWidth(): number;

	setOutputAudioUnit(au: interop.Pointer | interop.Reference<any>): void;
}

declare class CAInterAppAudioTransportView extends UIView {

	static alloc(): CAInterAppAudioTransportView; // inherited from NSObject

	static appearance(): CAInterAppAudioTransportView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): CAInterAppAudioTransportView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): CAInterAppAudioTransportView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CAInterAppAudioTransportView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): CAInterAppAudioTransportView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CAInterAppAudioTransportView; // inherited from UIAppearance

	static new(): CAInterAppAudioTransportView; // inherited from NSObject

	readonly connected: boolean;

	currentTimeLabelFont: UIFont;

	enabled: boolean;

	labelColor: UIColor;

	pauseButtonColor: UIColor;

	playButtonColor: UIColor;

	readonly playing: boolean;

	recordButtonColor: UIColor;

	readonly recording: boolean;

	rewindButtonColor: UIColor;

	setOutputAudioUnit(au: interop.Pointer | interop.Reference<any>): void;
}
