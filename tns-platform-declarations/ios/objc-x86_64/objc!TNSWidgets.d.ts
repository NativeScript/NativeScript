
declare class TNSLabel extends UILabel {

	static alloc(): TNSLabel; // inherited from NSObject

	static appearance(): TNSLabel; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): TNSLabel; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): TNSLabel; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): TNSLabel; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): TNSLabel; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): TNSLabel; // inherited from UIAppearance

	static new(): TNSLabel; // inherited from NSObject

	borderThickness: UIEdgeInsets;

	padding: UIEdgeInsets;
}

declare var TNSWidgetsVersionNumber: number;

declare var TNSWidgetsVersionString: interop.Reference<number>;

declare function __nslog(message: string): void;

declare function __tns_uptime(): number;
