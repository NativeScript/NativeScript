
/**
 * @since 27.0
 */
declare class SRStateReporter extends NSObject {

	static alloc(): SRStateReporter; // inherited from NSObject

	static new(): SRStateReporter; // inherited from NSObject

	static reporterForDomain(domain: string): SRStateReporter;

	readonly domain: string;

	reportTransitionToStateLabelStableMetadataVolatileMetadata(stateLabel: string | null, stableMetadata: NSDictionary<string, NSObject> | null, volatileMetadata: NSDictionary<string, NSObject> | null): void;

	reportVolatileMetadataUpdate(updatedMetadata: NSDictionary<string, NSObject> | null): void;
}
