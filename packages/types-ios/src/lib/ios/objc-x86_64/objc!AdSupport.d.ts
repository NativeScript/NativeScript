
/**
 * @since 6
 */
declare class ASIdentifierManager extends NSObject {

	static alloc(): ASIdentifierManager; // inherited from NSObject

	static new(): ASIdentifierManager; // inherited from NSObject

	static sharedManager(): ASIdentifierManager;

	readonly advertisingIdentifier: NSUUID;

	/**
	 * @since 6
	 * @deprecated 14
	 */
	readonly advertisingTrackingEnabled: boolean;
}
