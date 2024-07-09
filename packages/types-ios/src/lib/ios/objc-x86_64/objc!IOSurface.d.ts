
/**
 * @since 11.0
 */
declare class IOSurface extends NSObject implements NSSecureCoding {

	static alloc(): IOSurface; // inherited from NSObject

	static new(): IOSurface; // inherited from NSObject

	readonly allocationSize: number;

	readonly allowsPixelSizeCasting: boolean;

	readonly baseAddress: interop.Pointer | interop.Reference<any>;

	readonly bytesPerElement: number;

	readonly bytesPerRow: number;

	readonly elementHeight: number;

	readonly elementWidth: number;

	readonly height: number;

	readonly inUse: boolean;

	readonly localUseCount: number;

	readonly pixelFormat: number;

	readonly planeCount: number;

	readonly seed: number;

	/**
	 * @since 18.0
	 */
	readonly surfaceID: number;

	readonly width: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { properties: NSDictionary<string, any>; });

	allAttachments(): NSDictionary<string, any>;

	attachmentForKey(key: string): any;

	baseAddressOfPlaneAtIndex(planeIndex: number): interop.Pointer | interop.Reference<any>;

	bytesPerElementOfPlaneAtIndex(planeIndex: number): number;

	bytesPerRowOfPlaneAtIndex(planeIndex: number): number;

	decrementUseCount(): void;

	elementHeightOfPlaneAtIndex(planeIndex: number): number;

	elementWidthOfPlaneAtIndex(planeIndex: number): number;

	encodeWithCoder(coder: NSCoder): void;

	heightOfPlaneAtIndex(planeIndex: number): number;

	incrementUseCount(): void;

	initWithCoder(coder: NSCoder): this;

	initWithProperties(properties: NSDictionary<string, any>): this;

	lockWithOptionsSeed(options: IOSurfaceLockOptions, seed: interop.Pointer | interop.Reference<number>): number;

	removeAllAttachments(): void;

	removeAttachmentForKey(key: string): void;

	setAllAttachments(dict: NSDictionary<string, any>): void;

	setAttachmentForKey(anObject: any, key: string): void;

	/**
	 * @since 11.0
	 */
	setPurgeableOldState(newState: IOSurfacePurgeabilityState, oldState: interop.Pointer | interop.Reference<IOSurfacePurgeabilityState>): number;

	unlockWithOptionsSeed(options: IOSurfaceLockOptions, seed: interop.Pointer | interop.Reference<number>): number;

	widthOfPlaneAtIndex(planeIndex: number): number;
}

/**
 * @since 11.0
 */
declare function IOSurfaceAlignProperty(property: string, value: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceAllowsPixelSizeCasting(buffer: IOSurface): boolean;

declare const enum IOSurfaceComponentName {

	kIOSurfaceComponentNameUnknown = 0,

	kIOSurfaceComponentNameAlpha = 1,

	kIOSurfaceComponentNameRed = 2,

	kIOSurfaceComponentNameGreen = 3,

	kIOSurfaceComponentNameBlue = 4,

	kIOSurfaceComponentNameLuma = 5,

	kIOSurfaceComponentNameChromaRed = 6,

	kIOSurfaceComponentNameChromaBlue = 7
}

declare const enum IOSurfaceComponentRange {

	kIOSurfaceComponentRangeUnknown = 0,

	kIOSurfaceComponentRangeFullRange = 1,

	kIOSurfaceComponentRangeVideoRange = 2,

	kIOSurfaceComponentRangeWideRange = 3
}

declare const enum IOSurfaceComponentType {

	kIOSurfaceComponentTypeUnknown = 0,

	kIOSurfaceComponentTypeUnsignedInteger = 1,

	kIOSurfaceComponentTypeSignedInteger = 2,

	kIOSurfaceComponentTypeFloat = 3,

	kIOSurfaceComponentTypeSignedNormalized = 4
}

/**
 * @since 11.0
 */
declare function IOSurfaceCopyAllValues(buffer: IOSurface): NSDictionary<any, any>;

/**
 * @since 11.0
 */
declare function IOSurfaceCopyValue(buffer: IOSurface, key: string): any;

/**
 * @since 11.0
 */
declare function IOSurfaceCreate(properties: NSDictionary<any, any>): IOSurface;

/**
 * @since 11.0
 */
declare function IOSurfaceCreateMachPort(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceDecrementUseCount(buffer: IOSurface): void;

/**
 * @since 11.0
 */
declare function IOSurfaceGetAllocSize(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetBaseAddress(buffer: IOSurface): interop.Pointer | interop.Reference<any>;

/**
 * @since 11.0
 */
declare function IOSurfaceGetBaseAddressOfPlane(buffer: IOSurface, planeIndex: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 11.0
 */
declare function IOSurfaceGetBitDepthOfComponentOfPlane(buffer: IOSurface, planeIndex: number, componentIndex: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetBitOffsetOfComponentOfPlane(buffer: IOSurface, planeIndex: number, componentIndex: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetBytesPerElement(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetBytesPerElementOfPlane(buffer: IOSurface, planeIndex: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetBytesPerRow(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetBytesPerRowOfPlane(buffer: IOSurface, planeIndex: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetElementHeight(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetElementHeightOfPlane(buffer: IOSurface, planeIndex: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetElementWidth(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetElementWidthOfPlane(buffer: IOSurface, planeIndex: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetHeight(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetHeightOfPlane(buffer: IOSurface, planeIndex: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetID(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetNameOfComponentOfPlane(buffer: IOSurface, planeIndex: number, componentIndex: number): IOSurfaceComponentName;

/**
 * @since 11.0
 */
declare function IOSurfaceGetNumberOfComponentsOfPlane(buffer: IOSurface, planeIndex: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetPixelFormat(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetPlaneCount(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetPropertyAlignment(property: string): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetPropertyMaximum(property: string): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetRangeOfComponentOfPlane(buffer: IOSurface, planeIndex: number, componentIndex: number): IOSurfaceComponentRange;

/**
 * @since 11.0
 */
declare function IOSurfaceGetSeed(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetSubsampling(buffer: IOSurface): IOSurfaceSubsampling;

/**
 * @since 11.0
 */
declare function IOSurfaceGetTypeID(): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetTypeOfComponentOfPlane(buffer: IOSurface, planeIndex: number, componentIndex: number): IOSurfaceComponentType;

/**
 * @since 11.0
 */
declare function IOSurfaceGetUseCount(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetWidth(buffer: IOSurface): number;

/**
 * @since 11.0
 */
declare function IOSurfaceGetWidthOfPlane(buffer: IOSurface, planeIndex: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceIncrementUseCount(buffer: IOSurface): void;

/**
 * @since 11.0
 */
declare function IOSurfaceIsInUse(buffer: IOSurface): boolean;

/**
 * @since 11.0
 */
declare function IOSurfaceLock(buffer: IOSurface, options: IOSurfaceLockOptions, seed: interop.Pointer | interop.Reference<number>): number;

declare const enum IOSurfaceLockOptions {

	kIOSurfaceLockReadOnly = 1,

	kIOSurfaceLockAvoidSync = 2
}

/**
 * @since 11.0
 */
declare function IOSurfaceLookup(csid: number): IOSurface;

/**
 * @since 11.0
 */
declare function IOSurfaceLookupFromMachPort(port: number): IOSurface;

declare const enum IOSurfaceMemoryLedgerFlags {

	kIOSurfaceMemoryLedgerFlagNoFootprint = 1
}

declare const enum IOSurfaceMemoryLedgerTags {

	kIOSurfaceMemoryLedgerTagDefault = 1,

	kIOSurfaceMemoryLedgerTagNetwork = 2,

	kIOSurfaceMemoryLedgerTagMedia = 3,

	kIOSurfaceMemoryLedgerTagGraphics = 4,

	kIOSurfaceMemoryLedgerTagNeural = 5
}

/**
 * @since 11.0
 * @deprecated 12.0
 */
declare var IOSurfacePropertyAllocSizeKey: string;

/**
 * @since 12.0
 */
declare var IOSurfacePropertyKeyAllocSize: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyBytesPerElement: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyBytesPerRow: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyCacheMode: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyElementHeight: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyElementWidth: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyHeight: string;

/**
 * @since 16.0
 */
declare var IOSurfacePropertyKeyName: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyOffset: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPixelFormat: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPixelSizeCastingAllowed: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPlaneBase: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPlaneBytesPerElement: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPlaneBytesPerRow: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPlaneElementHeight: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPlaneElementWidth: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPlaneHeight: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPlaneInfo: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPlaneOffset: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPlaneSize: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyPlaneWidth: string;

/**
 * @since 11.0
 */
declare var IOSurfacePropertyKeyWidth: string;

declare const enum IOSurfacePurgeabilityState {

	kIOSurfacePurgeableNonVolatile = 0,

	kIOSurfacePurgeableVolatile = 1,

	kIOSurfacePurgeableEmpty = 2,

	kIOSurfacePurgeableKeepCurrent = 3
}

/**
 * @since 11.0
 */
declare function IOSurfaceRemoveAllValues(buffer: IOSurface): void;

/**
 * @since 11.0
 */
declare function IOSurfaceRemoveValue(buffer: IOSurface, key: string): void;

/**
 * @since 17.4
 */
declare function IOSurfaceSetOwnershipIdentity(buffer: IOSurface, task_id_token: number, newLedgerTag: number, newLedgerOptions: number): number;

/**
 * @since 11.0
 */
declare function IOSurfaceSetPurgeable(buffer: IOSurface, newState: number, oldState: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 11.0
 */
declare function IOSurfaceSetValue(buffer: IOSurface, key: string, value: any): void;

/**
 * @since 11.0
 */
declare function IOSurfaceSetValues(buffer: IOSurface, keysAndValues: NSDictionary<any, any>): void;

declare const enum IOSurfaceSubsampling {

	kIOSurfaceSubsamplingUnknown = 0,

	kIOSurfaceSubsamplingNone = 1,

	kIOSurfaceSubsampling422 = 2,

	kIOSurfaceSubsampling420 = 3,

	kIOSurfaceSubsampling411 = 4
}

/**
 * @since 11.0
 */
declare function IOSurfaceUnlock(buffer: IOSurface, options: IOSurfaceLockOptions, seed: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 11.0
 */
declare var kIOSurfaceAllocSize: string;

/**
 * @since 11.0
 */
declare var kIOSurfaceBytesPerElement: string;

/**
 * @since 11.0
 */
declare var kIOSurfaceBytesPerRow: string;

/**
 * @since 11.0
 */
declare var kIOSurfaceCacheMode: string;

/**
 * @since 11.0
 */
declare var kIOSurfaceColorSpace: string;

/**
 * @since 18.0
 */
declare var kIOSurfaceContentHeadroom: string;

declare const kIOSurfaceCopybackCache: number;

declare const kIOSurfaceCopybackInnerCache: number;

declare const kIOSurfaceDefaultCache: number;

/**
 * @since 11.0
 */
declare var kIOSurfaceElementHeight: string;

/**
 * @since 11.0
 */
declare var kIOSurfaceElementWidth: string;

/**
 * @since 11.0
 */
declare var kIOSurfaceHeight: string;

/**
 * @since 11.0
 */
declare var kIOSurfaceICCProfile: string;

declare const kIOSurfaceInhibitCache: number;

/**
 * @since 11.0
 * @deprecated 11.0
 */
declare var kIOSurfaceIsGlobal: string;

declare const kIOSurfaceMapCacheShift: number;

declare const kIOSurfaceMapCopybackCache: number;

declare const kIOSurfaceMapCopybackInnerCache: number;

declare const kIOSurfaceMapDefaultCache: number;

declare const kIOSurfaceMapInhibitCache: number;

declare const kIOSurfaceMapWriteCombineCache: number;

declare const kIOSurfaceMapWriteThruCache: number;

/**
 * @since 14.0
 */
declare var kIOSurfaceName: string;

/**
 * @since 11.0
 */
declare var kIOSurfaceOffset: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePixelFormat: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePixelSizeCastingAllowed: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneBase: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneBitsPerElement: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneBytesPerElement: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneBytesPerRow: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneComponentBitDepths: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneComponentBitOffsets: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneComponentNames: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneComponentRanges: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneComponentTypes: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneElementHeight: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneElementWidth: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneHeight: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneInfo: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneOffset: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneSize: string;

/**
 * @since 11.0
 */
declare var kIOSurfacePlaneWidth: string;

/**
 * @since 11.0
 */
declare var kIOSurfaceSubsampling: string;

/**
 * @since 11.0
 */
declare var kIOSurfaceWidth: string;

declare const kIOSurfaceWriteCombineCache: number;

declare const kIOSurfaceWriteThruCache: number;
