
/**
 * @since 9.0
 */
declare class MTKMesh extends NSObject {

	static alloc(): MTKMesh; // inherited from NSObject

	static new(): MTKMesh; // inherited from NSObject

	static newMeshesFromAssetDeviceSourceMeshesError(asset: MDLAsset, device: MTLDevice, sourceMeshes: interop.Pointer | interop.Reference<NSArray<MDLMesh>>): NSArray<MTKMesh>;

	name: string;

	readonly submeshes: NSArray<MTKSubmesh>;

	readonly vertexBuffers: NSArray<MTKMeshBuffer>;

	readonly vertexCount: number;

	readonly vertexDescriptor: MDLVertexDescriptor;

	constructor(o: { mesh: MDLMesh; device: MTLDevice; });

	initWithMeshDeviceError(mesh: MDLMesh, device: MTLDevice): this;
}

/**
 * @since 9.0
 */
declare class MTKMeshBuffer extends NSObject implements MDLMeshBuffer, MDLNamed {

	static alloc(): MTKMeshBuffer; // inherited from NSObject

	static new(): MTKMeshBuffer; // inherited from NSObject

	readonly allocator: MTKMeshBufferAllocator;

	readonly buffer: MTLBuffer;

	readonly offset: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly length: number; // inherited from MDLMeshBuffer

	name: string; // inherited from MDLNamed

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly type: MDLMeshBufferType; // inherited from MDLMeshBuffer

	readonly  // inherited from MDLMeshBuffer

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	fillDataOffset(data: NSData, offset: number): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	map(): MDLMeshBufferMap;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 9.0
 */
declare class MTKMeshBufferAllocator extends NSObject implements MDLMeshBufferAllocator {

	static alloc(): MTKMeshBufferAllocator; // inherited from NSObject

	static new(): MTKMeshBufferAllocator; // inherited from NSObject

	readonly device: MTLDevice;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { device: MTLDevice; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithDevice(device: MTLDevice): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	newBufferFromZoneDataType(zone: MDLMeshBufferZone, data: NSData, type: MDLMeshBufferType): MDLMeshBuffer;

	newBufferFromZoneLengthType(zone: MDLMeshBufferZone, length: number, type: MDLMeshBufferType): MDLMeshBuffer;

	newBufferType(length: number, type: MDLMeshBufferType): MDLMeshBuffer;

	newBufferWithDataType(data: NSData, type: MDLMeshBufferType): MDLMeshBuffer;

	newZone(capacity: number): MDLMeshBufferZone;

	newZoneForBuffersWithSizeAndType(sizes: NSArray<number> | number[], types: NSArray<number> | number[]): MDLMeshBufferZone;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 9.0
 */
declare function MTKMetalVertexDescriptorFromModelIO(modelIODescriptor: MDLVertexDescriptor): MTLVertexDescriptor;

/**
 * @since 10.0
 */
declare function MTKMetalVertexDescriptorFromModelIOWithError(modelIODescriptor: MDLVertexDescriptor, error: interop.Pointer | interop.Reference<NSError>): MTLVertexDescriptor;

/**
 * @since 9.0
 */
declare function MTKMetalVertexFormatFromModelIO(vertexFormat: MDLVertexFormat): MTLVertexFormat;

/**
 * @since 9.0
 */
declare var MTKModelErrorDomain: string;

/**
 * @since 9.0
 */
declare var MTKModelErrorKey: string;

/**
 * @since 9.0
 */
declare function MTKModelIOVertexDescriptorFromMetal(metalDescriptor: MTLVertexDescriptor): MDLVertexDescriptor;

/**
 * @since 10.0
 */
declare function MTKModelIOVertexDescriptorFromMetalWithError(metalDescriptor: MTLVertexDescriptor, error: interop.Pointer | interop.Reference<NSError>): MDLVertexDescriptor;

/**
 * @since 9.0
 */
declare function MTKModelIOVertexFormatFromMetal(vertexFormat: MTLVertexFormat): MDLVertexFormat;

/**
 * @since 9.0
 */
declare class MTKSubmesh extends NSObject {

	static alloc(): MTKSubmesh; // inherited from NSObject

	static new(): MTKSubmesh; // inherited from NSObject

	readonly indexBuffer: MTKMeshBuffer;

	readonly indexCount: number;

	readonly indexType: MTLIndexType;

	readonly mesh: MTKMesh;

	name: string;

	readonly primitiveType: MTLPrimitiveType;
}

/**
 * @since 9.0
 */
declare class MTKTextureLoader extends NSObject {

	static alloc(): MTKTextureLoader; // inherited from NSObject

	static new(): MTKTextureLoader; // inherited from NSObject

	readonly device: MTLDevice;

	constructor(o: { device: MTLDevice; });

	initWithDevice(device: MTLDevice): this;

	newTextureWithCGImageOptionsCompletionHandler(cgImage: any, options: NSDictionary<string, any>, completionHandler: (p1: MTLTexture, p2: NSError) => void): void;

	newTextureWithCGImageOptionsError(cgImage: any, options: NSDictionary<string, any>): MTLTexture;

	newTextureWithContentsOfURLOptionsCompletionHandler(URL: NSURL, options: NSDictionary<string, any>, completionHandler: (p1: MTLTexture, p2: NSError) => void): void;

	newTextureWithContentsOfURLOptionsError(URL: NSURL, options: NSDictionary<string, any>): MTLTexture;

	newTextureWithDataOptionsCompletionHandler(data: NSData, options: NSDictionary<string, any>, completionHandler: (p1: MTLTexture, p2: NSError) => void): void;

	newTextureWithDataOptionsError(data: NSData, options: NSDictionary<string, any>): MTLTexture;

	/**
	 * @since 10.0
	 */
	newTextureWithMDLTextureOptionsCompletionHandler(texture: MDLTexture, options: NSDictionary<string, any>, completionHandler: (p1: MTLTexture, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	newTextureWithMDLTextureOptionsError(texture: MDLTexture, options: NSDictionary<string, any>): MTLTexture;

	/**
	 * @since 10.0
	 */
	newTextureWithNameScaleFactorBundleOptionsCompletionHandler(name: string, scaleFactor: number, bundle: NSBundle, options: NSDictionary<string, any>, completionHandler: (p1: MTLTexture, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	newTextureWithNameScaleFactorBundleOptionsError(name: string, scaleFactor: number, bundle: NSBundle, options: NSDictionary<string, any>): MTLTexture;

	/**
	 * @since 10.0
	 */
	newTexturesWithContentsOfURLsOptionsCompletionHandler(URLs: NSArray<NSURL> | NSURL[], options: NSDictionary<string, any>, completionHandler: (p1: NSArray<MTLTexture>, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	newTexturesWithContentsOfURLsOptionsError(URLs: NSArray<NSURL> | NSURL[], options: NSDictionary<string, any>): NSArray<MTLTexture>;

	/**
	 * @since 10.0
	 */
	newTexturesWithNamesScaleFactorBundleOptionsCompletionHandler(names: NSArray<string> | string[], scaleFactor: number, bundle: NSBundle, options: NSDictionary<string, any>, completionHandler: (p1: NSArray<MTLTexture>, p2: NSError) => void): void;
}

/**
 * @since 10.0
 */
declare var MTKTextureLoaderCubeLayoutVertical: string;

/**
 * @since 9.0
 */
declare var MTKTextureLoaderErrorDomain: string;

/**
 * @since 9.0
 */
declare var MTKTextureLoaderErrorKey: string;

/**
 * @since 9.0
 */
declare var MTKTextureLoaderOptionAllocateMipmaps: string;

/**
 * @since 10.0
 */
declare var MTKTextureLoaderOptionCubeLayout: string;

/**
 * @since 10.0
 */
declare var MTKTextureLoaderOptionGenerateMipmaps: string;

/**
 * @since 17.0
 */
declare var MTKTextureLoaderOptionLoadAsArray: string;

/**
 * @since 10.0
 */
declare var MTKTextureLoaderOptionOrigin: string;

/**
 * @since 9.0
 */
declare var MTKTextureLoaderOptionSRGB: string;

/**
 * @since 9.0
 */
declare var MTKTextureLoaderOptionTextureCPUCacheMode: string;

/**
 * @since 10.0
 */
declare var MTKTextureLoaderOptionTextureStorageMode: string;

/**
 * @since 9.0
 */
declare var MTKTextureLoaderOptionTextureUsage: string;

/**
 * @since 10.0
 */
declare var MTKTextureLoaderOriginBottomLeft: string;

/**
 * @since 10.0
 */
declare var MTKTextureLoaderOriginFlippedVertically: string;

/**
 * @since 10.0
 */
declare var MTKTextureLoaderOriginTopLeft: string;

/**
 * @since 9.0
 */
declare class MTKView extends UIView implements CALayerDelegate, NSCoding {

	static alloc(): MTKView; // inherited from NSObject

	static appearance(): MTKView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MTKView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MTKView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MTKView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MTKView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MTKView; // inherited from UIAppearance

	static new(): MTKView; // inherited from NSObject

	autoResizeDrawable: boolean;

	clearColor: MTLClearColor;

	clearDepth: number;

	clearStencil: number;

	colorPixelFormat: MTLPixelFormat;

	readonly currentDrawable: CAMetalDrawable;

	readonly currentRenderPassDescriptor: MTLRenderPassDescriptor;

	delegate: MTKViewDelegate;

	/**
	 * @since 13.0
	 */
	depthStencilAttachmentTextureUsage: MTLTextureUsage;

	depthStencilPixelFormat: MTLPixelFormat;

	/**
	 * @since 16.0
	 */
	depthStencilStorageMode: MTLStorageMode;

	readonly depthStencilTexture: MTLTexture;

	device: MTLDevice;

	drawableSize: CGSize;

	enableSetNeedsDisplay: boolean;

	framebufferOnly: boolean;

	/**
	 * @since 13.0
	 */
	multisampleColorAttachmentTextureUsage: MTLTextureUsage;

	readonly multisampleColorTexture: MTLTexture;

	paused: boolean;

	/**
	 * @since 13.0
	 */
	readonly preferredDevice: MTLDevice;

	readonly preferredDrawableSize: CGSize;

	preferredFramesPerSecond: number;

	presentsWithTransaction: boolean;

	sampleCount: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; device: MTLDevice; });

	actionForLayerForKey(layer: CALayer, event: string): CAAction;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	displayLayer(layer: CALayer): void;

	draw(): void;

	drawLayerInContext(layer: CALayer, ctx: any): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithFrameDevice(frameRect: CGRect, device: MTLDevice): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 10.0
	 */
	layerWillDraw(layer: CALayer): void;

	layoutSublayersOfLayer(layer: CALayer): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	releaseDrawables(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 9.0
 */
interface MTKViewDelegate extends NSObjectProtocol {

	drawInMTKView(view: MTKView): void;

	mtkViewDrawableSizeWillChange(view: MTKView, size: CGSize): void;
}
declare var MTKViewDelegate: {

	prototype: MTKViewDelegate;
};
