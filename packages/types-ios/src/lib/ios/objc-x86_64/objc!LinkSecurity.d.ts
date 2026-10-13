
/**
 * @since 27.0
 */
declare class LSLinkSecurityManager extends NSObject {

	static alloc(): LSLinkSecurityManager; // inherited from NSObject

	static new(): LSLinkSecurityManager; // inherited from NSObject

	readonly hasFlaggedURLs: boolean;

	static readonly sharedManager: LSLinkSecurityManager;

	addFlaggedURL(url: NSURL): void;

	addFlaggedURLs(urls: NSArray<NSURL> | NSURL[]): void;

	checkIsFlaggedURLCompletion(url: NSURL, completion: (p1: boolean) => void): void;
}
