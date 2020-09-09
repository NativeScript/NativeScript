
declare class HKActivityRingView extends UIView {

	static alloc(): HKActivityRingView; // inherited from NSObject

	static appearance(): HKActivityRingView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): HKActivityRingView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): HKActivityRingView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): HKActivityRingView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): HKActivityRingView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): HKActivityRingView; // inherited from UIAppearance

	static new(): HKActivityRingView; // inherited from NSObject

	activitySummary: HKActivitySummary;

	setActivitySummaryAnimated(activitySummary: HKActivitySummary, animated: boolean): void;
}
