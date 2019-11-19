
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

declare function MTKMetalVertexDescriptorFromModelIO(modelIODescriptor: MDLVertexDescriptor): MTLVertexDescriptor;

declare function MTKMetalVertexDescriptorFromModelIOWithError(modelIODescriptor: MDLVertexDescriptor, error: interop.Pointer | interop.Reference<NSError>): MTLVertexDescriptor;

declare function MTKMetalVertexFormatFromModelIO(vertexFormat: MDLVertexFormat): MTLVertexFormat;

declare var MTKModelErrorDomain: string;

declare var MTKModelErrorKey: string;

declare function MTKModelIOVertexDescriptorFromMetal(metalDescriptor: MTLVertexDescriptor): MDLVertexDescriptor;

declare function MTKModelIOVertexDescriptorFromMetalWithError(metalDescriptor: MTLVertexDescriptor, error: interop.Pointer | interop.Reference<NSError>): MDLVertexDescriptor;

declare function MTKModelIOVertexFormatFromMetal(vertexFormat: MTLVertexFormat): MDLVertexFormat;

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

	newTextureWithMDLTextureOptionsCompletionHandler(texture: MDLTexture, options: NSDictionary<string, any>, completionHandler: (p1: MTLTexture, p2: NSError) => void): void;

	newTextureWithMDLTextureOptionsError(texture: MDLTexture, options: NSDictionary<string, any>): MTLTexture;

	newTextureWithNameScaleFactorBundleOptionsCompletionHandler(name: string, scaleFactor: number, bundle: NSBundle, options: NSDictionary<string, any>, completionHandler: (p1: MTLTexture, p2: NSError) => void): void;

	newTextureWithNameScaleFactorBundleOptionsError(name: string, scaleFactor: number, bundle: NSBundle, options: NSDictionary<string, any>): MTLTexture;

	newTexturesWithContentsOfURLsOptionsCompletionHandler(URLs: NSArray<NSURL> | NSURL[], options: NSDictionary<string, any>, completionHandler: (p1: NSArray<MTLTexture>, p2: NSError) => void): void;

	newTexturesWithContentsOfURLsOptionsError(URLs: NSArray<NSURL> | NSURL[], options: NSDictionary<string, any>): NSArray<MTLTexture>;

	newTexturesWithNamesScaleFactorBundleOptionsCompletionHandler(names: NSArray<string> | string[], scaleFactor: number, bundle: NSBundle, options: NSDictionary<string, any>, completionHandler: (p1: NSArray<MTLTexture>, p2: NSError) => void): void;
}

declare var MTKTextureLoaderCubeLayoutVertical: string;

declare var MTKTextureLoaderErrorDomain: string;

declare var MTKTextureLoaderErrorKey: string;

declare var MTKTextureLoaderOptionAllocateMipmaps: string;

declare var MTKTextureLoaderOptionCubeLayout: string;

declare var MTKTextureLoaderOptionGenerateMipmaps: string;

declare var MTKTextureLoaderOptionOrigin: string;

declare var MTKTextureLoaderOptionSRGB: string;

declare var MTKTextureLoaderOptionTextureCPUCacheMode: string;

declare var MTKTextureLoaderOptionTextureStorageMode: string;

declare var MTKTextureLoaderOptionTextureUsage: string;

declare var MTKTextureLoaderOriginBottomLeft: string;

declare var MTKTextureLoaderOriginFlippedVertically: string;

declare var MTKTextureLoaderOriginTopLeft: string;

declare class MTKView extends UIView implements CALayerDelegate, NSCoding {

	static alloc(): MTKView; // inherited from NSObject

	static appearance(): MTKView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MTKView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MTKView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MTKView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MTKView; // inherited from UIAppearance

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

	depthStencilAttachmentTextureUsage: MTLTextureUsage;

	depthStencilPixelFormat: MTLPixelFormat;

	readonly depthStencilTexture: MTLTexture;

	device: MTLDevice;

	drawableSize: CGSize;

	enableSetNeedsDisplay: boolean;

	framebufferOnly: boolean;

	multisampleColorAttachmentTextureUsage: MTLTextureUsage;

	readonly multisampleColorTexture: MTLTexture;

	paused: boolean;

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

interface MTKViewDelegate extends NSObjectProtocol {

	drawInMTKView(view: MTKView): void;

	mtkViewDrawableSizeWillChange(view: MTKView, size: CGSize): void;
}
declare var MTKViewDelegate: {

	prototype: MTKViewDelegate;
};
