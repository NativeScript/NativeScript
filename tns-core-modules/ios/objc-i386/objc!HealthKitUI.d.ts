
declare class HKActivityRingView extends UIView {

	static appearance(): HKActivityRingView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): HKActivityRingView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): HKActivityRingView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): HKActivityRingView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): HKActivityRingView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): HKActivityRingView; // inherited from UIAppearance

	activitySummary: HKActivitySummary;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; }); // inherited from UIView

	self(): HKActivityRingView; // inherited from NSObjectProtocol

	setActivitySummaryAnimated(activitySummary: HKActivitySummary, animated: boolean): void;
}
