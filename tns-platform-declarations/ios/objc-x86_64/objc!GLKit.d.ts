
declare class GLKBaseEffect extends NSObject implements GLKNamedEffect {

	static alloc(): GLKBaseEffect; // inherited from NSObject

	static new(): GLKBaseEffect; // inherited from NSObject

	colorMaterialEnabled: number;

	readonly fog: GLKEffectPropertyFog;

	label: string;

	readonly light0: GLKEffectPropertyLight;

	readonly light1: GLKEffectPropertyLight;

	readonly light2: GLKEffectPropertyLight;

	lightModelTwoSided: number;

	lightingType: GLKLightingType;

	readonly material: GLKEffectPropertyMaterial;

	readonly texture2d0: GLKEffectPropertyTexture;

	readonly texture2d1: GLKEffectPropertyTexture;

	textureOrder: NSArray<GLKEffectPropertyTexture>;

	readonly transform: GLKEffectPropertyTransform;

	useConstantColor: number;

	prepareToDraw(): void;
}

declare class GLKEffectProperty extends NSObject {

	static alloc(): GLKEffectProperty; // inherited from NSObject

	static new(): GLKEffectProperty; // inherited from NSObject
}

declare class GLKEffectPropertyFog extends GLKEffectProperty {

	static alloc(): GLKEffectPropertyFog; // inherited from NSObject

	static new(): GLKEffectPropertyFog; // inherited from NSObject

	density: number;

	enabled: number;

	end: number;

	mode: number;

	start: number;
}

declare class GLKEffectPropertyLight extends GLKEffectProperty {

	static alloc(): GLKEffectPropertyLight; // inherited from NSObject

	static new(): GLKEffectPropertyLight; // inherited from NSObject

	constantAttenuation: number;

	enabled: number;

	linearAttenuation: number;

	quadraticAttenuation: number;

	spotCutoff: number;

	spotExponent: number;

	transform: GLKEffectPropertyTransform;
}

declare class GLKEffectPropertyMaterial extends GLKEffectProperty {

	static alloc(): GLKEffectPropertyMaterial; // inherited from NSObject

	static new(): GLKEffectPropertyMaterial; // inherited from NSObject

	shininess: number;
}

declare class GLKEffectPropertyTexture extends GLKEffectProperty {

	static alloc(): GLKEffectPropertyTexture; // inherited from NSObject

	static new(): GLKEffectPropertyTexture; // inherited from NSObject

	enabled: number;

	envMode: GLKTextureEnvMode;

	name: number;

	target: GLKTextureTarget;
}

declare class GLKEffectPropertyTransform extends GLKEffectProperty {

	static alloc(): GLKEffectPropertyTransform; // inherited from NSObject

	static new(): GLKEffectPropertyTransform; // inherited from NSObject
}

declare const enum GLKFogMode {

	Exp = 0,

	Exp2 = 1,

	Linear = 2
}

declare const enum GLKLightingType {

	PerVertex = 0,

	PerPixel = 1
}

declare function GLKMatrixStackCreate(alloc: any): interop.Unmanaged<any>;

declare function GLKMatrixStackGetTypeID(): number;

declare function GLKMatrixStackMultiplyMatrixStack(stackLeft: any, stackRight: any): void;

declare function GLKMatrixStackPop(stack: any): void;

declare function GLKMatrixStackPush(stack: any): void;

declare function GLKMatrixStackRotate(stack: any, radians: number, x: number, y: number, z: number): void;

declare function GLKMatrixStackRotateX(stack: any, radians: number): void;

declare function GLKMatrixStackRotateY(stack: any, radians: number): void;

declare function GLKMatrixStackRotateZ(stack: any, radians: number): void;

declare function GLKMatrixStackScale(stack: any, sx: number, sy: number, sz: number): void;

declare function GLKMatrixStackSize(stack: any): number;

declare function GLKMatrixStackTranslate(stack: any, tx: number, ty: number, tz: number): void;

declare class GLKMesh extends NSObject {

	static alloc(): GLKMesh; // inherited from NSObject

	static new(): GLKMesh; // inherited from NSObject

	static newMeshesFromAssetSourceMeshesError(asset: MDLAsset, sourceMeshes: interop.Pointer | interop.Reference<NSArray<MDLMesh>>): NSArray<GLKMesh>;

	readonly name: string;

	readonly submeshes: NSArray<GLKSubmesh>;

	readonly vertexBuffers: NSArray<GLKMeshBuffer>;

	readonly vertexCount: number;

	readonly vertexDescriptor: MDLVertexDescriptor;

	constructor(o: { mesh: MDLMesh; });

	initWithMeshError(mesh: MDLMesh): this;
}

declare class GLKMeshBuffer extends NSObject implements MDLMeshBuffer {

	static alloc(): GLKMeshBuffer; // inherited from NSObject

	static new(): GLKMeshBuffer; // inherited from NSObject

	readonly allocator: GLKMeshBufferAllocator;

	readonly glBufferName: number;

	readonly offset: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly length: number; // inherited from MDLMeshBuffer

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

declare class GLKMeshBufferAllocator extends NSObject implements MDLMeshBufferAllocator {

	static alloc(): GLKMeshBufferAllocator; // inherited from NSObject

	static new(): GLKMeshBufferAllocator; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

interface GLKNamedEffect {

	prepareToDraw(): void;
}
declare var GLKNamedEffect: {

	prototype: GLKNamedEffect;
};

declare class GLKReflectionMapEffect extends GLKBaseEffect implements GLKNamedEffect {

	static alloc(): GLKReflectionMapEffect; // inherited from NSObject

	static new(): GLKReflectionMapEffect; // inherited from NSObject

	readonly textureCubeMap: GLKEffectPropertyTexture;

	prepareToDraw(): void;
}

declare class GLKSkyboxEffect extends NSObject implements GLKNamedEffect {

	static alloc(): GLKSkyboxEffect; // inherited from NSObject

	static new(): GLKSkyboxEffect; // inherited from NSObject

	label: string;

	readonly textureCubeMap: GLKEffectPropertyTexture;

	readonly transform: GLKEffectPropertyTransform;

	xSize: number;

	ySize: number;

	zSize: number;

	draw(): void;

	prepareToDraw(): void;
}

declare class GLKSubmesh extends NSObject {

	static alloc(): GLKSubmesh; // inherited from NSObject

	static new(): GLKSubmesh; // inherited from NSObject

	readonly elementBuffer: GLKMeshBuffer;

	readonly elementCount: number;

	readonly mesh: GLKMesh;

	readonly mode: number;

	readonly name: string;

	readonly type: number;
}

declare const enum GLKTextureEnvMode {

	Replace = 0,

	Modulate = 1,

	Decal = 2
}

declare class GLKTextureInfo extends NSObject implements NSCopying {

	static alloc(): GLKTextureInfo; // inherited from NSObject

	static new(): GLKTextureInfo; // inherited from NSObject

	readonly alphaState: GLKTextureInfoAlphaState;

	readonly arrayLength: number;

	readonly containsMipmaps: boolean;

	readonly depth: number;

	readonly height: number;

	readonly mimapLevelCount: number;

	readonly name: number;

	readonly target: number;

	readonly textureOrigin: GLKTextureInfoOrigin;

	readonly width: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum GLKTextureInfoAlphaState {

	None = 0,

	NonPremultiplied = 1,

	Premultiplied = 2
}

declare const enum GLKTextureInfoOrigin {

	Unknown = 0,

	TopLeft = 1,

	BottomLeft = 2
}

declare class GLKTextureLoader extends NSObject {

	static alloc(): GLKTextureLoader; // inherited from NSObject

	static cubeMapWithContentsOfFileOptionsError(path: string, options: NSDictionary<string, number>): GLKTextureInfo;

	static cubeMapWithContentsOfFilesOptionsError(paths: NSArray<any> | any[], options: NSDictionary<string, number>): GLKTextureInfo;

	static cubeMapWithContentsOfURLOptionsError(url: NSURL, options: NSDictionary<string, number>): GLKTextureInfo;

	static new(): GLKTextureLoader; // inherited from NSObject

	static textureWithCGImageOptionsError(cgImage: any, options: NSDictionary<string, number>): GLKTextureInfo;

	static textureWithContentsOfDataOptionsError(data: NSData, options: NSDictionary<string, number>): GLKTextureInfo;

	static textureWithContentsOfFileOptionsError(path: string, options: NSDictionary<string, number>): GLKTextureInfo;

	static textureWithContentsOfURLOptionsError(url: NSURL, options: NSDictionary<string, number>): GLKTextureInfo;

	static textureWithNameScaleFactorBundleOptionsError(name: string, scaleFactor: number, bundle: NSBundle, options: NSDictionary<string, number>): GLKTextureInfo;

	constructor(o: { sharegroup: EAGLSharegroup; });

	cubeMapWithContentsOfFileOptionsQueueCompletionHandler(path: string, options: NSDictionary<string, number>, queue: NSObject, block: (p1: GLKTextureInfo, p2: NSError) => void): void;

	cubeMapWithContentsOfFilesOptionsQueueCompletionHandler(paths: NSArray<any> | any[], options: NSDictionary<string, number>, queue: NSObject, block: (p1: GLKTextureInfo, p2: NSError) => void): void;

	cubeMapWithContentsOfURLOptionsQueueCompletionHandler(url: NSURL, options: NSDictionary<string, number>, queue: NSObject, block: (p1: GLKTextureInfo, p2: NSError) => void): void;

	initWithSharegroup(sharegroup: EAGLSharegroup): this;

	textureWithCGImageOptionsQueueCompletionHandler(cgImage: any, options: NSDictionary<string, number>, queue: NSObject, block: (p1: GLKTextureInfo, p2: NSError) => void): void;

	textureWithContentsOfDataOptionsQueueCompletionHandler(data: NSData, options: NSDictionary<string, number>, queue: NSObject, block: (p1: GLKTextureInfo, p2: NSError) => void): void;

	textureWithContentsOfFileOptionsQueueCompletionHandler(path: string, options: NSDictionary<string, number>, queue: NSObject, block: (p1: GLKTextureInfo, p2: NSError) => void): void;

	textureWithContentsOfURLOptionsQueueCompletionHandler(url: NSURL, options: NSDictionary<string, number>, queue: NSObject, block: (p1: GLKTextureInfo, p2: NSError) => void): void;

	textureWithNameScaleFactorBundleOptionsQueueCompletionHandler(name: string, scaleFactor: number, bundle: NSBundle, options: NSDictionary<string, number>, queue: NSObject, block: (p1: GLKTextureInfo, p2: NSError) => void): void;
}

declare var GLKTextureLoaderApplyPremultiplication: string;

declare const enum GLKTextureLoaderError {

	FileOrURLNotFound = 0,

	InvalidNSData = 1,

	InvalidCGImage = 2,

	UnknownPathType = 3,

	UnknownFileType = 4,

	PVRAtlasUnsupported = 5,

	CubeMapInvalidNumFiles = 6,

	CompressedTextureUpload = 7,

	UncompressedTextureUpload = 8,

	UnsupportedCubeMapDimensions = 9,

	UnsupportedBitDepth = 10,

	UnsupportedPVRFormat = 11,

	DataPreprocessingFailure = 12,

	MipmapUnsupported = 13,

	UnsupportedOrientation = 14,

	ReorientationFailure = 15,

	AlphaPremultiplicationFailure = 16,

	InvalidEAGLContext = 17,

	IncompatibleFormatSRGB = 18,

	UnsupportedTextureTarget = 19
}

declare var GLKTextureLoaderErrorDomain: string;

declare var GLKTextureLoaderErrorKey: string;

declare var GLKTextureLoaderGLErrorKey: string;

declare var GLKTextureLoaderGenerateMipmaps: string;

declare var GLKTextureLoaderGrayscaleAsAlpha: string;

declare var GLKTextureLoaderOriginBottomLeft: string;

declare var GLKTextureLoaderSRGB: string;

declare const enum GLKTextureTarget {

	Target2D = 3553,

	TargetCubeMap = 34067,

	TargetCt = 2
}

declare const enum GLKVertexAttrib {

	Position = 0,

	Normal = 1,

	Color = 2,

	TexCoord0 = 3,

	TexCoord1 = 4
}

declare function GLKVertexAttributeParametersFromModelIO(vertexFormat: MDLVertexFormat): _GLKVertexAttributeParameters;

declare class GLKView extends UIView implements NSCoding {

	static alloc(): GLKView; // inherited from NSObject

	static appearance(): GLKView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): GLKView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): GLKView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): GLKView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): GLKView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): GLKView; // inherited from UIAppearance

	static new(): GLKView; // inherited from NSObject

	context: EAGLContext;

	delegate: GLKViewDelegate;

	drawableColorFormat: GLKViewDrawableColorFormat;

	drawableDepthFormat: GLKViewDrawableDepthFormat;

	readonly drawableHeight: number;

	drawableMultisample: GLKViewDrawableMultisample;

	drawableStencilFormat: GLKViewDrawableStencilFormat;

	readonly drawableWidth: number;

	enableSetNeedsDisplay: boolean;

	readonly snapshot: UIImage;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; context: EAGLContext; });

	bindDrawable(): void;

	deleteDrawable(): void;

	display(): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithFrameContext(frame: CGRect, context: EAGLContext): this;
}

declare class GLKViewController extends UIViewController implements GLKViewDelegate, NSCoding {

	static alloc(): GLKViewController; // inherited from NSObject

	static new(): GLKViewController; // inherited from NSObject

	delegate: GLKViewControllerDelegate;

	readonly framesDisplayed: number;

	readonly framesPerSecond: number;

	pauseOnWillResignActive: boolean;

	paused: boolean;

	preferredFramesPerSecond: number;

	resumeOnDidBecomeActive: boolean;

	readonly timeSinceFirstResume: number;

	readonly timeSinceLastDraw: number;

	readonly timeSinceLastResume: number;

	readonly timeSinceLastUpdate: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	glkViewDrawInRect(view: GLKView, rect: CGRect): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

interface GLKViewControllerDelegate extends NSObjectProtocol {

	glkViewControllerUpdate(controller: GLKViewController): void;

	glkViewControllerWillPause?(controller: GLKViewController, pause: boolean): void;
}
declare var GLKViewControllerDelegate: {

	prototype: GLKViewControllerDelegate;
};

interface GLKViewDelegate extends NSObjectProtocol {

	glkViewDrawInRect(view: GLKView, rect: CGRect): void;
}
declare var GLKViewDelegate: {

	prototype: GLKViewDelegate;
};

declare const enum GLKViewDrawableColorFormat {

	RGBA8888 = 0,

	RGB565 = 1,

	SRGBA8888 = 2
}

declare const enum GLKViewDrawableDepthFormat {

	FormatNone = 0,

	Format16 = 1,

	Format24 = 2
}

declare const enum GLKViewDrawableMultisample {

	MultisampleNone = 0,

	Multisample4X = 1
}

declare const enum GLKViewDrawableStencilFormat {

	FormatNone = 0,

	Format8 = 1
}

interface _GLKVertexAttributeParameters {
	type: number;
	size: number;
	normalized: number;
}
declare var _GLKVertexAttributeParameters: interop.StructType<_GLKVertexAttributeParameters>;

declare var kGLKModelErrorDomain: string;

declare var kGLKModelErrorKey: string;
