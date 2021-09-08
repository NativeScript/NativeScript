
declare class CLLocationButton extends UIControl implements NSSecureCoding {

	static alloc(): CLLocationButton; // inherited from NSObject

	static appearance(): CLLocationButton; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): CLLocationButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): CLLocationButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CLLocationButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): CLLocationButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CLLocationButton; // inherited from UIAppearance

	static new(): CLLocationButton; // inherited from NSObject

	cornerRadius: number;

	fontSize: number;

	icon: CLLocationButtonIcon;

	label: CLLocationButtonLabel;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum CLLocationButtonIcon {

	None = 0,

	ArrowFilled = 1,

	ArrowOutline = 2
}

declare const enum CLLocationButtonLabel {

	None = 0,

	CurrentLocation = 1,

	SendCurrentLocation = 2,

	SendMyCurrentLocation = 3,

	ShareCurrentLocation = 4,

	ShareMyCurrentLocation = 5
}

declare var CoreLocationUIVersionNumber: number;

declare var CoreLocationUIVersionString: interop.Reference<number>;
