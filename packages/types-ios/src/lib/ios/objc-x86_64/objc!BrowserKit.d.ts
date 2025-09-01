
/**
 * @since 18.4
 */
declare class BEAvailability extends NSObject {

	static alloc(): BEAvailability; // inherited from NSObject

	static isEligibleForContextCompletionHandler(context: BEEligibilityContext, completionHandler: (p1: boolean, p2: NSError) => void): void;

	static new(): BEAvailability; // inherited from NSObject
}

/**
 * @since 18.4
 */
declare const enum BEEligibilityContext {

	WebBrowser = 0
}
