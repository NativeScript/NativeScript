
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

	setPurgeableOldState(newState: IOSurfacePurgeabilityState, oldState: interop.Pointer | interop.Reference<IOSurfacePurgeabilityState>): number;

	unlockWithOptionsSeed(options: IOSurfaceLockOptions, seed: interop.Pointer | interop.Reference<number>): number;

	widthOfPlaneAtIndex(planeIndex: number): number;
}

declare function IOSurfaceAlignProperty(property: string, value: number): number;

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

declare function IOSurfaceCopyAllValues(buffer: IOSurface): NSDictionary<any, any>;

declare function IOSurfaceCopyValue(buffer: IOSurface, key: string): any;

declare function IOSurfaceCreate(properties: NSDictionary<any, any>): IOSurface;

declare function IOSurfaceCreateMachPort(buffer: IOSurface): number;

declare function IOSurfaceDecrementUseCount(buffer: IOSurface): void;

declare function IOSurfaceGetAllocSize(buffer: IOSurface): number;

declare function IOSurfaceGetBaseAddress(buffer: IOSurface): interop.Pointer | interop.Reference<any>;

declare function IOSurfaceGetBaseAddressOfPlane(buffer: IOSurface, planeIndex: number): interop.Pointer | interop.Reference<any>;

declare function IOSurfaceGetBitDepthOfComponentOfPlane(buffer: IOSurface, planeIndex: number, componentIndex: number): number;

declare function IOSurfaceGetBitOffsetOfComponentOfPlane(buffer: IOSurface, planeIndex: number, componentIndex: number): number;

declare function IOSurfaceGetBytesPerElement(buffer: IOSurface): number;

declare function IOSurfaceGetBytesPerElementOfPlane(buffer: IOSurface, planeIndex: number): number;

declare function IOSurfaceGetBytesPerRow(buffer: IOSurface): number;

declare function IOSurfaceGetBytesPerRowOfPlane(buffer: IOSurface, planeIndex: number): number;

declare function IOSurfaceGetElementHeight(buffer: IOSurface): number;

declare function IOSurfaceGetElementHeightOfPlane(buffer: IOSurface, planeIndex: number): number;

declare function IOSurfaceGetElementWidth(buffer: IOSurface): number;

declare function IOSurfaceGetElementWidthOfPlane(buffer: IOSurface, planeIndex: number): number;

declare function IOSurfaceGetHeight(buffer: IOSurface): number;

declare function IOSurfaceGetHeightOfPlane(buffer: IOSurface, planeIndex: number): number;

declare function IOSurfaceGetID(buffer: IOSurface): number;

declare function IOSurfaceGetNameOfComponentOfPlane(buffer: IOSurface, planeIndex: number, componentIndex: number): IOSurfaceComponentName;

declare function IOSurfaceGetNumberOfComponentsOfPlane(buffer: IOSurface, planeIndex: number): number;

declare function IOSurfaceGetPixelFormat(buffer: IOSurface): number;

declare function IOSurfaceGetPlaneCount(buffer: IOSurface): number;

declare function IOSurfaceGetPropertyAlignment(property: string): number;

declare function IOSurfaceGetPropertyMaximum(property: string): number;

declare function IOSurfaceGetRangeOfComponentOfPlane(buffer: IOSurface, planeIndex: number, componentIndex: number): IOSurfaceComponentRange;

declare function IOSurfaceGetSeed(buffer: IOSurface): number;

declare function IOSurfaceGetSubsampling(buffer: IOSurface): IOSurfaceSubsampling;

declare function IOSurfaceGetTypeID(): number;

declare function IOSurfaceGetTypeOfComponentOfPlane(buffer: IOSurface, planeIndex: number, componentIndex: number): IOSurfaceComponentType;

declare function IOSurfaceGetUseCount(buffer: IOSurface): number;

declare function IOSurfaceGetWidth(buffer: IOSurface): number;

declare function IOSurfaceGetWidthOfPlane(buffer: IOSurface, planeIndex: number): number;

declare function IOSurfaceIncrementUseCount(buffer: IOSurface): void;

declare function IOSurfaceIsInUse(buffer: IOSurface): boolean;

declare function IOSurfaceLock(buffer: IOSurface, options: IOSurfaceLockOptions, seed: interop.Pointer | interop.Reference<number>): number;

declare const enum IOSurfaceLockOptions {

	kIOSurfaceLockReadOnly = 1,

	kIOSurfaceLockAvoidSync = 2
}

declare function IOSurfaceLookup(csid: number): IOSurface;

declare function IOSurfaceLookupFromMachPort(port: number): IOSurface;

declare var IOSurfacePropertyAllocSizeKey: string;

declare var IOSurfacePropertyKeyAllocSize: string;

declare var IOSurfacePropertyKeyBytesPerElement: string;

declare var IOSurfacePropertyKeyBytesPerRow: string;

declare var IOSurfacePropertyKeyCacheMode: string;

declare var IOSurfacePropertyKeyElementHeight: string;

declare var IOSurfacePropertyKeyElementWidth: string;

declare var IOSurfacePropertyKeyHeight: string;

declare var IOSurfacePropertyKeyOffset: string;

declare var IOSurfacePropertyKeyPixelFormat: string;

declare var IOSurfacePropertyKeyPixelSizeCastingAllowed: string;

declare var IOSurfacePropertyKeyPlaneBase: string;

declare var IOSurfacePropertyKeyPlaneBytesPerElement: string;

declare var IOSurfacePropertyKeyPlaneBytesPerRow: string;

declare var IOSurfacePropertyKeyPlaneElementHeight: string;

declare var IOSurfacePropertyKeyPlaneElementWidth: string;

declare var IOSurfacePropertyKeyPlaneHeight: string;

declare var IOSurfacePropertyKeyPlaneInfo: string;

declare var IOSurfacePropertyKeyPlaneOffset: string;

declare var IOSurfacePropertyKeyPlaneSize: string;

declare var IOSurfacePropertyKeyPlaneWidth: string;

declare var IOSurfacePropertyKeyWidth: string;

declare const enum IOSurfacePurgeabilityState {

	kIOSurfacePurgeableNonVolatile = 0,

	kIOSurfacePurgeableVolatile = 1,

	kIOSurfacePurgeableEmpty = 2,

	kIOSurfacePurgeableKeepCurrent = 3
}

declare function IOSurfaceRemoveAllValues(buffer: IOSurface): void;

declare function IOSurfaceRemoveValue(buffer: IOSurface, key: string): void;

declare function IOSurfaceSetPurgeable(buffer: IOSurface, newState: number, oldState: interop.Pointer | interop.Reference<number>): number;

declare function IOSurfaceSetValue(buffer: IOSurface, key: string, value: any): void;

declare function IOSurfaceSetValues(buffer: IOSurface, keysAndValues: NSDictionary<any, any>): void;

declare const enum IOSurfaceSubsampling {

	kIOSurfaceSubsamplingUnknown = 0,

	kIOSurfaceSubsamplingNone = 1,

	kIOSurfaceSubsampling422 = 2,

	kIOSurfaceSubsampling420 = 3,

	kIOSurfaceSubsampling411 = 4
}

declare function IOSurfaceUnlock(buffer: IOSurface, options: IOSurfaceLockOptions, seed: interop.Pointer | interop.Reference<number>): number;

declare var kIOSurfaceAllocSize: string;

declare var kIOSurfaceBytesPerElement: string;

declare var kIOSurfaceBytesPerRow: string;

declare var kIOSurfaceCacheMode: string;

declare var kIOSurfaceColorSpace: string;

declare const kIOSurfaceCopybackCache: number;

declare const kIOSurfaceCopybackInnerCache: number;

declare const kIOSurfaceDefaultCache: number;

declare var kIOSurfaceElementHeight: string;

declare var kIOSurfaceElementWidth: string;

declare var kIOSurfaceHeight: string;

declare var kIOSurfaceICCProfile: string;

declare const kIOSurfaceInhibitCache: number;

declare var kIOSurfaceIsGlobal: string;

declare const kIOSurfaceMapCacheShift: number;

declare const kIOSurfaceMapCopybackCache: number;

declare const kIOSurfaceMapCopybackInnerCache: number;

declare const kIOSurfaceMapDefaultCache: number;

declare const kIOSurfaceMapInhibitCache: number;

declare const kIOSurfaceMapWriteCombineCache: number;

declare const kIOSurfaceMapWriteThruCache: number;

declare var kIOSurfaceOffset: string;

declare var kIOSurfacePixelFormat: string;

declare var kIOSurfacePixelSizeCastingAllowed: string;

declare var kIOSurfacePlaneBase: string;

declare var kIOSurfacePlaneBitsPerElement: string;

declare var kIOSurfacePlaneBytesPerElement: string;

declare var kIOSurfacePlaneBytesPerRow: string;

declare var kIOSurfacePlaneComponentBitDepths: string;

declare var kIOSurfacePlaneComponentBitOffsets: string;

declare var kIOSurfacePlaneComponentNames: string;

declare var kIOSurfacePlaneComponentRanges: string;

declare var kIOSurfacePlaneComponentTypes: string;

declare var kIOSurfacePlaneElementHeight: string;

declare var kIOSurfacePlaneElementWidth: string;

declare var kIOSurfacePlaneHeight: string;

declare var kIOSurfacePlaneInfo: string;

declare var kIOSurfacePlaneOffset: string;

declare var kIOSurfacePlaneSize: string;

declare var kIOSurfacePlaneWidth: string;

declare var kIOSurfaceSubsampling: string;

declare var kIOSurfaceWidth: string;

declare const kIOSurfaceWriteCombineCache: number;

declare const kIOSurfaceWriteThruCache: number;
