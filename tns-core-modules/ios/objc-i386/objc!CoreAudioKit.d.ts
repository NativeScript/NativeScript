
declare class AUViewController extends UIViewController implements NSExtensionRequestHandling {

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	self(): AUViewController; // inherited from NSObjectProtocol
}

declare class CABTMIDICentralViewController extends UITableViewController {

	constructor(o: { style: UITableViewStyle; }); // inherited from UITableViewController

	self(): CABTMIDICentralViewController; // inherited from NSObjectProtocol
}

declare class CABTMIDILocalPeripheralViewController extends UIViewController {

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	self(): CABTMIDILocalPeripheralViewController; // inherited from NSObjectProtocol
}

declare class CAInterAppAudioSwitcherView extends UIView {

	static appearance(): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): CAInterAppAudioSwitcherView; // inherited from UIAppearance

	showingAppNames: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; }); // inherited from UIView

	contentWidth(): number;

	self(): CAInterAppAudioSwitcherView; // inherited from NSObjectProtocol

	setOutputAudioUnit(au: interop.Pointer): void;
}

declare class CAInterAppAudioTransportView extends UIView {

	static appearance(): CAInterAppAudioTransportView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): CAInterAppAudioTransportView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): CAInterAppAudioTransportView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): CAInterAppAudioTransportView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): CAInterAppAudioTransportView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): CAInterAppAudioTransportView; // inherited from UIAppearance

	/* readonly */ connected: boolean;

	currentTimeLabelFont: UIFont;

	enabled: boolean;

	labelColor: UIColor;

	pauseButtonColor: UIColor;

	playButtonColor: UIColor;

	/* readonly */ playing: boolean;

	recordButtonColor: UIColor;

	/* readonly */ recording: boolean;

	rewindButtonColor: UIColor;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; }); // inherited from UIView

	self(): CAInterAppAudioTransportView; // inherited from NSObjectProtocol

	setOutputAudioUnit(au: interop.Pointer): void;
}
