
/**
 * @since 9.3
 */
declare class HKActivityRingView extends UIView {

	static alloc(): HKActivityRingView; // inherited from NSObject

	static appearance(): HKActivityRingView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): HKActivityRingView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject | null): HKActivityRingView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): HKActivityRingView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject | null): HKActivityRingView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): HKActivityRingView; // inherited from UIAppearance

	static new(): HKActivityRingView; // inherited from NSObject

	activitySummary: HKActivitySummary | null;

	setActivitySummaryAnimated(activitySummary: HKActivitySummary | null, animated: boolean): void;
}
