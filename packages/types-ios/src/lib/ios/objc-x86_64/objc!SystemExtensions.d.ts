
/**
 * @since 18.4
 */
declare var NSSystemExtensionUsageDescriptionKey: string;

/**
 * @since 18.4
 */
declare var OSBundleUsageDescriptionKey: string;

/**
 * @since 18.4
 */
declare const enum OSSystemExtensionErrorCode {

	Unknown = 1,

	MissingEntitlement = 2,

	UnsupportedParentBundleLocation = 3,

	ExtensionNotFound = 4,

	ExtensionMissingIdentifier = 5,

	DuplicateExtensionIdentifer = 6,

	UnknownExtensionCategory = 7,

	CodeSignatureInvalid = 8,

	ValidationFailed = 9,

	ForbiddenBySystemPolicy = 10,

	RequestCanceled = 11,

	RequestSuperseded = 12,

	AuthorizationRequired = 13
}

/**
 * @since 18.4
 */
declare var OSSystemExtensionErrorDomain: string;

/**
 * @since 18.4
 */
declare class OSSystemExtensionProperties extends NSObject {

	static alloc(): OSSystemExtensionProperties; // inherited from NSObject

	static new(): OSSystemExtensionProperties; // inherited from NSObject

	/**
	 * @since 18.4
	 */
	readonly bundleIdentifier: string;

	/**
	 * @since 18.4
	 */
	readonly bundleShortVersion: string;

	/**
	 * @since 18.4
	 */
	readonly bundleVersion: string;

	/**
	 * @since 18.4
	 */
	readonly isEnabled: boolean;
}

/**
 * @since 18.4
 */
declare class OSSystemExtensionsWorkspace extends NSObject {

	static alloc(): OSSystemExtensionsWorkspace; // inherited from NSObject

	static new(): OSSystemExtensionsWorkspace; // inherited from NSObject

	static readonly sharedWorkspace: OSSystemExtensionsWorkspace;

	/**
	 * @since 18.4
	 */
	systemExtensionsForApplicationWithBundleIDError(bundleID: string): NSSet<OSSystemExtensionProperties>;
}
