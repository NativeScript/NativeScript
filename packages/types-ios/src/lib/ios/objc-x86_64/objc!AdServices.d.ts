
/**
 * @since 14.3
 */
declare class AAAttribution extends NSObject {

	static alloc(): AAAttribution; // inherited from NSObject

	static attributionTokenWithError(): string;

	static new(): AAAttribution; // inherited from NSObject
}

/**
 * @since 14.3
 */
declare const enum AAAttributionErrorCode {

	NetworkError = 1,

	InternalError = 2,

	PlatformNotSupported = 3
}

/**
 * @since 14.3
 */
declare var AAAttributionErrorDomain: string;
