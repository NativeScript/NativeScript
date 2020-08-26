
declare class MDLAnimatedMatrix4x4 extends MDLAnimatedValue {

	static alloc(): MDLAnimatedMatrix4x4; // inherited from NSObject

	static new(): MDLAnimatedMatrix4x4; // inherited from NSObject

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;

	getDouble4x4ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<simd_double4x4>, maxCount: number): number;

	getFloat4x4ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<simd_float4x4>, maxCount: number): number;

	resetWithDouble4x4ArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<simd_double4x4>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	resetWithFloat4x4ArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<simd_float4x4>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	setDouble4x4AtTime(value: simd_double4x4, time: number): void;

	setFloat4x4AtTime(value: simd_float4x4, time: number): void;
}

declare class MDLAnimatedQuaternion extends MDLAnimatedValue {

	static alloc(): MDLAnimatedQuaternion; // inherited from NSObject

	static new(): MDLAnimatedQuaternion; // inherited from NSObject

	doubleQuaternionAtTime(time: number): simd_quatd;

	floatQuaternionAtTime(time: number): simd_quatf;

	getDoubleQuaternionArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<simd_quatd>, maxCount: number): number;

	getFloatQuaternionArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<simd_quatf>, maxCount: number): number;

	resetWithDoubleQuaternionArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<simd_quatd>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	resetWithFloatQuaternionArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<simd_quatf>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	setDoubleQuaternionAtTime(value: simd_quatd, time: number): void;

	setFloatQuaternionAtTime(value: simd_quatf, time: number): void;
}

declare class MDLAnimatedQuaternionArray extends MDLAnimatedValue {

	static alloc(): MDLAnimatedQuaternionArray; // inherited from NSObject

	static new(): MDLAnimatedQuaternionArray; // inherited from NSObject

	readonly elementCount: number;

	constructor(o: { elementCount: number; });

	getDoubleQuaternionArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<simd_quatd>, maxCount: number): number;

	getDoubleQuaternionArrayMaxCountAtTime(array: interop.Pointer | interop.Reference<simd_quatd>, maxCount: number, time: number): number;

	getFloatQuaternionArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<simd_quatf>, maxCount: number): number;

	getFloatQuaternionArrayMaxCountAtTime(array: interop.Pointer | interop.Reference<simd_quatf>, maxCount: number, time: number): number;

	initWithElementCount(arrayElementCount: number): this;

	resetWithDoubleQuaternionArrayCountAtTimesCount(valuesArray: interop.Pointer | interop.Reference<simd_quatd>, valuesCount: number, timesArray: interop.Pointer | interop.Reference<number>, timesCount: number): void;

	resetWithFloatQuaternionArrayCountAtTimesCount(valuesArray: interop.Pointer | interop.Reference<simd_quatf>, valuesCount: number, timesArray: interop.Pointer | interop.Reference<number>, timesCount: number): void;

	setDoubleQuaternionArrayCountAtTime(array: interop.Pointer | interop.Reference<simd_quatd>, count: number, time: number): void;

	setFloatQuaternionArrayCountAtTime(array: interop.Pointer | interop.Reference<simd_quatf>, count: number, time: number): void;
}

declare class MDLAnimatedScalar extends MDLAnimatedValue {

	static alloc(): MDLAnimatedScalar; // inherited from NSObject

	static new(): MDLAnimatedScalar; // inherited from NSObject

	doubleAtTime(time: number): number;

	floatAtTime(time: number): number;

	getDoubleArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<number>, maxCount: number): number;

	getFloatArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<number>, maxCount: number): number;

	resetWithDoubleArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<number>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	resetWithFloatArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<number>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	setDoubleAtTime(value: number, time: number): void;

	setFloatAtTime(value: number, time: number): void;
}

declare class MDLAnimatedScalarArray extends MDLAnimatedValue {

	static alloc(): MDLAnimatedScalarArray; // inherited from NSObject

	static new(): MDLAnimatedScalarArray; // inherited from NSObject

	readonly elementCount: number;

	constructor(o: { elementCount: number; });

	getDoubleArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<number>, maxCount: number): number;

	getDoubleArrayMaxCountAtTime(array: interop.Pointer | interop.Reference<number>, maxCount: number, time: number): number;

	getFloatArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<number>, maxCount: number): number;

	getFloatArrayMaxCountAtTime(array: interop.Pointer | interop.Reference<number>, maxCount: number, time: number): number;

	initWithElementCount(arrayElementCount: number): this;

	resetWithDoubleArrayCountAtTimesCount(valuesArray: interop.Pointer | interop.Reference<number>, valuesCount: number, timesArray: interop.Pointer | interop.Reference<number>, timesCount: number): void;

	resetWithFloatArrayCountAtTimesCount(valuesArray: interop.Pointer | interop.Reference<number>, valuesCount: number, timesArray: interop.Pointer | interop.Reference<number>, timesCount: number): void;

	setDoubleArrayCountAtTime(array: interop.Pointer | interop.Reference<number>, count: number, time: number): void;

	setFloatArrayCountAtTime(array: interop.Pointer | interop.Reference<number>, count: number, time: number): void;
}

declare class MDLAnimatedValue extends NSObject implements NSCopying {

	static alloc(): MDLAnimatedValue; // inherited from NSObject

	static new(): MDLAnimatedValue; // inherited from NSObject

	interpolation: MDLAnimatedValueInterpolation;

	readonly keyTimes: NSArray<number>;

	readonly maximumTime: number;

	readonly minimumTime: number;

	readonly precision: MDLDataPrecision;

	readonly timeSampleCount: number;

	clear(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	getTimesMaxCount(timesArray: interop.Pointer | interop.Reference<number>, maxCount: number): number;

	isAnimated(): boolean;
}

declare const enum MDLAnimatedValueInterpolation {

	Constant = 0,

	Linear = 1
}

declare class MDLAnimatedVector2 extends MDLAnimatedValue {

	static alloc(): MDLAnimatedVector2; // inherited from NSObject

	static new(): MDLAnimatedVector2; // inherited from NSObject

	double2AtTime(time: number): interop.Reference<number>;

	float2AtTime(time: number): interop.Reference<number>;

	getDouble2ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, maxCount: number): number;

	getFloat2ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, maxCount: number): number;

	resetWithDouble2ArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	resetWithFloat2ArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	setDouble2AtTime(value: interop.Reference<number>, time: number): void;

	setFloat2AtTime(value: interop.Reference<number>, time: number): void;
}

declare class MDLAnimatedVector3 extends MDLAnimatedValue {

	static alloc(): MDLAnimatedVector3; // inherited from NSObject

	static new(): MDLAnimatedVector3; // inherited from NSObject

	double3AtTime(time: number): interop.Reference<number>;

	float3AtTime(time: number): interop.Reference<number>;

	getDouble3ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, maxCount: number): number;

	getFloat3ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, maxCount: number): number;

	resetWithDouble3ArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	resetWithFloat3ArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	setDouble3AtTime(value: interop.Reference<number>, time: number): void;

	setFloat3AtTime(value: interop.Reference<number>, time: number): void;
}

declare class MDLAnimatedVector3Array extends MDLAnimatedValue {

	static alloc(): MDLAnimatedVector3Array; // inherited from NSObject

	static new(): MDLAnimatedVector3Array; // inherited from NSObject

	readonly elementCount: number;

	constructor(o: { elementCount: number; });

	getDouble3ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, maxCount: number): number;

	getDouble3ArrayMaxCountAtTime(array: interop.Pointer | interop.Reference<interop.Reference<number>>, maxCount: number, time: number): number;

	getFloat3ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, maxCount: number): number;

	getFloat3ArrayMaxCountAtTime(array: interop.Pointer | interop.Reference<interop.Reference<number>>, maxCount: number, time: number): number;

	initWithElementCount(arrayElementCount: number): this;

	resetWithDouble3ArrayCountAtTimesCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, valuesCount: number, timesArray: interop.Pointer | interop.Reference<number>, timesCount: number): void;

	resetWithFloat3ArrayCountAtTimesCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, valuesCount: number, timesArray: interop.Pointer | interop.Reference<number>, timesCount: number): void;

	setDouble3ArrayCountAtTime(array: interop.Pointer | interop.Reference<interop.Reference<number>>, count: number, time: number): void;

	setFloat3ArrayCountAtTime(array: interop.Pointer | interop.Reference<interop.Reference<number>>, count: number, time: number): void;
}

declare class MDLAnimatedVector4 extends MDLAnimatedValue {

	static alloc(): MDLAnimatedVector4; // inherited from NSObject

	static new(): MDLAnimatedVector4; // inherited from NSObject

	double4AtTime(time: number): interop.Reference<number>;

	float4AtTime(time: number): interop.Reference<number>;

	getDouble4ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, maxCount: number): number;

	getFloat4ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, maxCount: number): number;

	resetWithDouble4ArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	resetWithFloat4ArrayAtTimesCount(valuesArray: interop.Pointer | interop.Reference<interop.Reference<number>>, timesArray: interop.Pointer | interop.Reference<number>, count: number): void;

	setDouble4AtTime(value: interop.Reference<number>, time: number): void;

	setFloat4AtTime(value: interop.Reference<number>, time: number): void;
}

declare class MDLAnimationBindComponent extends NSObject implements MDLComponent, NSCopying {

	static alloc(): MDLAnimationBindComponent; // inherited from NSObject

	static new(): MDLAnimationBindComponent; // inherited from NSObject

	geometryBindTransform: simd_double4x4;

	jointAnimation: MDLJointAnimation;

	jointPaths: NSArray<string>;

	skeleton: MDLSkeleton;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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

declare class MDLAreaLight extends MDLPhysicallyPlausibleLight {

	static alloc(): MDLAreaLight; // inherited from NSObject

	static lightWithSCNLight(scnLight: SCNLight): MDLAreaLight; // inherited from MDLLight

	static new(): MDLAreaLight; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLAreaLight; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLAreaLight; // inherited from MDLObject

	areaRadius: number;

	aspect: number;

	superEllipticPower: interop.Reference<number>;
}

declare class MDLAsset extends NSObject implements NSCopying, NSFastEnumeration {

	static alloc(): MDLAsset; // inherited from NSObject

	static assetWithSCNScene(scnScene: SCNScene): MDLAsset;

	static assetWithSCNSceneBufferAllocator(scnScene: SCNScene, bufferAllocator: MDLMeshBufferAllocator): MDLAsset;

	static canExportFileExtension(extension: string): boolean;

	static canImportFileExtension(extension: string): boolean;

	static new(): MDLAsset; // inherited from NSObject

	static placeLightProbesWithDensityHeuristicUsingIrradianceDataSource(value: number, type: MDLProbePlacement, dataSource: MDLLightProbeIrradianceDataSource): NSArray<MDLLightProbe>;

	readonly URL: NSURL;

	animations: MDLObjectContainerComponent;

	readonly boundingBox: MDLAxisAlignedBoundingBox;

	readonly bufferAllocator: MDLMeshBufferAllocator;

	readonly count: number;

	endTime: number;

	frameInterval: number;

	masters: MDLObjectContainerComponent;

	resolver: MDLAssetResolver;

	startTime: number;

	upAxis: interop.Reference<number>;

	readonly vertexDescriptor: MDLVertexDescriptor;
	[index: number]: MDLObject;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { bufferAllocator: MDLMeshBufferAllocator; });

	constructor(o: { URL: NSURL; });

	constructor(o: { URL: NSURL; vertexDescriptor: MDLVertexDescriptor; bufferAllocator: MDLMeshBufferAllocator; });

	constructor(o: { URL: NSURL; vertexDescriptor: MDLVertexDescriptor; bufferAllocator: MDLMeshBufferAllocator; preserveTopology: boolean; });

	addObject(object: MDLObject): void;

	boundingBoxAtTime(time: number): MDLAxisAlignedBoundingBox;

	childObjectsOfClass(objectClass: typeof NSObject): NSArray<MDLObject>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	exportAssetToURL(URL: NSURL): boolean;

	exportAssetToURLError(URL: NSURL): boolean;

	initWithBufferAllocator(bufferAllocator: MDLMeshBufferAllocator): this;

	initWithURL(URL: NSURL): this;

	initWithURLVertexDescriptorBufferAllocator(URL: NSURL, vertexDescriptor: MDLVertexDescriptor, bufferAllocator: MDLMeshBufferAllocator): this;

	initWithURLVertexDescriptorBufferAllocatorPreserveTopologyError(URL: NSURL, vertexDescriptor: MDLVertexDescriptor, bufferAllocator: MDLMeshBufferAllocator, preserveTopology: boolean): this;

	loadTextures(): void;

	objectAtIndex(index: number): MDLObject;

	objectAtIndexedSubscript(index: number): MDLObject;

	objectAtPath(path: string): MDLObject;

	removeObject(object: MDLObject): void;
}

interface MDLAssetResolver extends NSObjectProtocol {

	canResolveAssetNamed(name: string): boolean;

	resolveAssetNamed(name: string): NSURL;
}
declare var MDLAssetResolver: {

	prototype: MDLAssetResolver;
};

interface MDLAxisAlignedBoundingBox {
	maxBounds: interop.Reference<number>;
	minBounds: interop.Reference<number>;
}
declare var MDLAxisAlignedBoundingBox: interop.StructType<MDLAxisAlignedBoundingBox>;

declare class MDLBundleAssetResolver extends NSObject implements MDLAssetResolver {

	static alloc(): MDLBundleAssetResolver; // inherited from NSObject

	static new(): MDLBundleAssetResolver; // inherited from NSObject

	path: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { bundle: string; });

	canResolveAssetNamed(name: string): boolean;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithBundle(path: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	resolveAssetNamed(name: string): NSURL;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MDLCamera extends MDLObject {

	static alloc(): MDLCamera; // inherited from NSObject

	static cameraWithSCNCamera(scnCamera: SCNCamera): MDLCamera;

	static new(): MDLCamera; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLCamera; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLCamera; // inherited from MDLObject

	apertureBladeCount: number;

	barrelDistortion: number;

	chromaticAberration: number;

	exposure: interop.Reference<number>;

	exposureCompression: interop.Reference<number>;

	fStop: number;

	farVisibilityDistance: number;

	fieldOfView: number;

	fisheyeDistortion: number;

	flash: interop.Reference<number>;

	focalLength: number;

	focusDistance: number;

	maximumCircleOfConfusion: number;

	nearVisibilityDistance: number;

	opticalVignetting: number;

	projection: MDLCameraProjection;

	readonly projectionMatrix: simd_float4x4;

	sensorAspect: number;

	sensorEnlargement: interop.Reference<number>;

	sensorShift: interop.Reference<number>;

	sensorVerticalAperture: number;

	shutterOpenInterval: number;

	worldToMetersConversionScale: number;

	bokehKernelWithSize(size: interop.Reference<number>): MDLTexture;

	frameBoundingBoxSetNearAndFar(boundingBox: MDLAxisAlignedBoundingBox, setNearAndFar: boolean): void;

	lookAt(focusPosition: interop.Reference<number>): void;

	lookAtFrom(focusPosition: interop.Reference<number>, cameraPosition: interop.Reference<number>): void;

	rayToForViewPort(pixel: interop.Reference<number>, size: interop.Reference<number>): interop.Reference<number>;
}

declare const enum MDLCameraProjection {

	Perspective = 0,

	Orthographic = 1
}

declare class MDLCheckerboardTexture extends MDLTexture {

	static alloc(): MDLCheckerboardTexture; // inherited from NSObject

	static irradianceTextureCubeWithTextureNameDimensions(texture: MDLTexture, name: string, dimensions: interop.Reference<number>): MDLCheckerboardTexture; // inherited from MDLTexture

	static irradianceTextureCubeWithTextureNameDimensionsRoughness(texture: MDLTexture, name: string, dimensions: interop.Reference<number>, roughness: number): MDLCheckerboardTexture; // inherited from MDLTexture

	static new(): MDLCheckerboardTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string> | string[]): MDLCheckerboardTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string> | string[], bundleOrNil: NSBundle): MDLCheckerboardTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLCheckerboardTexture; // inherited from MDLTexture

	static textureNamedAssetResolver(name: string, resolver: MDLAssetResolver): MDLCheckerboardTexture; // inherited from MDLTexture

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLCheckerboardTexture; // inherited from MDLTexture

	color1: any;

	color2: any;

	divisions: number;

	constructor(o: { divisions: number; name: string; dimensions: interop.Reference<number>; channelCount: number; channelEncoding: MDLTextureChannelEncoding; color1: any; color2: any; });

	initWithDivisionsNameDimensionsChannelCountChannelEncodingColor1Color2(divisions: number, name: string, dimensions: interop.Reference<number>, channelCount: number, channelEncoding: MDLTextureChannelEncoding, color1: any, color2: any): this;
}

declare class MDLColorSwatchTexture extends MDLTexture {

	static alloc(): MDLColorSwatchTexture; // inherited from NSObject

	static irradianceTextureCubeWithTextureNameDimensions(texture: MDLTexture, name: string, dimensions: interop.Reference<number>): MDLColorSwatchTexture; // inherited from MDLTexture

	static irradianceTextureCubeWithTextureNameDimensionsRoughness(texture: MDLTexture, name: string, dimensions: interop.Reference<number>, roughness: number): MDLColorSwatchTexture; // inherited from MDLTexture

	static new(): MDLColorSwatchTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string> | string[]): MDLColorSwatchTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string> | string[], bundleOrNil: NSBundle): MDLColorSwatchTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLColorSwatchTexture; // inherited from MDLTexture

	static textureNamedAssetResolver(name: string, resolver: MDLAssetResolver): MDLColorSwatchTexture; // inherited from MDLTexture

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLColorSwatchTexture; // inherited from MDLTexture

	constructor(o: { colorGradientFrom: any; toColor: any; name: string; textureDimensions: interop.Reference<number>; });

	constructor(o: { colorTemperatureGradientFrom: number; toColorTemperature: number; name: string; textureDimensions: interop.Reference<number>; });

	initWithColorGradientFromToColorNameTextureDimensions(color1: any, color2: any, name: string, textureDimensions: interop.Reference<number>): this;

	initWithColorTemperatureGradientFromToColorTemperatureNameTextureDimensions(colorTemperature1: number, colorTemperature2: number, name: string, textureDimensions: interop.Reference<number>): this;
}

interface MDLComponent extends NSObjectProtocol {
}
declare var MDLComponent: {

	prototype: MDLComponent;
};

declare const enum MDLDataPrecision {

	Undefined = 0,

	Float = 1,

	Double = 2
}

declare const enum MDLGeometryType {

	Points = 0,

	Lines = 1,

	Triangles = 2,

	TriangleStrips = 3,

	Quads = 4,

	VariableTopology = 5
}

declare const enum MDLIndexBitDepth {

	Invalid = 0,

	UInt8 = 8,

	Uint8 = 8,

	UInt16 = 16,

	Uint16 = 16,

	UInt32 = 32,

	Uint32 = 32
}

interface MDLJointAnimation {
}
declare var MDLJointAnimation: {

	prototype: MDLJointAnimation;
};

declare class MDLLight extends MDLObject {

	static alloc(): MDLLight; // inherited from NSObject

	static lightWithSCNLight(scnLight: SCNLight): MDLLight;

	static new(): MDLLight; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLLight; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLLight; // inherited from MDLObject

	colorSpace: string;

	lightType: MDLLightType;

	irradianceAtPoint(point: interop.Reference<number>): any;

	irradianceAtPointColorSpace(point: interop.Reference<number>, colorSpace: any): any;
}

declare class MDLLightProbe extends MDLLight {

	static alloc(): MDLLightProbe; // inherited from NSObject

	static lightProbeWithTextureSizeForLocationLightsToConsiderObjectsToConsiderReflectiveCubemapIrradianceCubemap(textureSize: number, transform: MDLTransform, lightsToConsider: NSArray<MDLLight> | MDLLight[], objectsToConsider: NSArray<MDLObject> | MDLObject[], reflectiveCubemap: MDLTexture, irradianceCubemap: MDLTexture): MDLLightProbe;

	static lightWithSCNLight(scnLight: SCNLight): MDLLightProbe; // inherited from MDLLight

	static new(): MDLLightProbe; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLLightProbe; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLLightProbe; // inherited from MDLObject

	readonly irradianceTexture: MDLTexture;

	readonly reflectiveTexture: MDLTexture;

	readonly sphericalHarmonicsCoefficients: NSData;

	readonly sphericalHarmonicsLevel: number;

	constructor(o: { reflectiveTexture: MDLTexture; irradianceTexture: MDLTexture; });

	generateSphericalHarmonicsFromIrradiance(sphericalHarmonicsLevel: number): void;

	initWithReflectiveTextureIrradianceTexture(reflectiveTexture: MDLTexture, irradianceTexture: MDLTexture): this;
}

interface MDLLightProbeIrradianceDataSource extends NSObjectProtocol {

	boundingBox: MDLAxisAlignedBoundingBox;

	sphericalHarmonicsLevel?: number;

	sphericalHarmonicsCoefficientsAtPosition?(position: interop.Reference<number>): NSData;
}
declare var MDLLightProbeIrradianceDataSource: {

	prototype: MDLLightProbeIrradianceDataSource;
};

declare const enum MDLLightType {

	Unknown = 0,

	Ambient = 1,

	Directional = 2,

	Spot = 3,

	Point = 4,

	Linear = 5,

	DiscArea = 6,

	RectangularArea = 7,

	SuperElliptical = 8,

	Photometric = 9,

	Probe = 10,

	Environment = 11
}

declare class MDLMaterial extends NSObject implements MDLNamed, NSFastEnumeration {

	static alloc(): MDLMaterial; // inherited from NSObject

	static materialWithSCNMaterial(scnMaterial: SCNMaterial): MDLMaterial;

	static new(): MDLMaterial; // inherited from NSObject

	baseMaterial: MDLMaterial;

	readonly count: number;

	materialFace: MDLMaterialFace;

	readonly scatteringFunction: MDLScatteringFunction;

	name: string; // inherited from MDLNamed
	[index: number]: MDLMaterialProperty;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { name: string; scatteringFunction: MDLScatteringFunction; });

	initWithNameScatteringFunction(name: string, scatteringFunction: MDLScatteringFunction): this;

	loadTexturesUsingResolver(resolver: MDLAssetResolver): void;

	objectAtIndexedSubscript(idx: number): MDLMaterialProperty;

	objectForKeyedSubscript(name: string): MDLMaterialProperty;

	propertiesWithSemantic(semantic: MDLMaterialSemantic): NSArray<MDLMaterialProperty>;

	propertyNamed(name: string): MDLMaterialProperty;

	propertyWithSemantic(semantic: MDLMaterialSemantic): MDLMaterialProperty;

	removeAllProperties(): void;

	removeProperty(property: MDLMaterialProperty): void;

	resolveTexturesWithResolver(resolver: MDLAssetResolver): void;

	setProperty(property: MDLMaterialProperty): void;
}

declare const enum MDLMaterialFace {

	Front = 0,

	Back = 1,

	DoubleSided = 2
}

declare const enum MDLMaterialMipMapFilterMode {

	Nearest = 0,

	Linear = 1
}

declare class MDLMaterialProperty extends NSObject implements MDLNamed, NSCopying {

	static alloc(): MDLMaterialProperty; // inherited from NSObject

	static new(): MDLMaterialProperty; // inherited from NSObject

	URLValue: NSURL;

	color: any;

	float2Value: interop.Reference<number>;

	float3Value: interop.Reference<number>;

	float4Value: interop.Reference<number>;

	floatValue: number;

	luminance: number;

	matrix4x4: simd_float4x4;

	semantic: MDLMaterialSemantic;

	stringValue: string;

	textureSamplerValue: MDLTextureSampler;

	type: MDLMaterialPropertyType;

	name: string; // inherited from MDLNamed

	constructor(o: { name: string; semantic: MDLMaterialSemantic; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; color: any; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; float: number; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; float2: interop.Reference<number>; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; float3: interop.Reference<number>; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; float4: interop.Reference<number>; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; matrix4x4: simd_float4x4; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; string: string; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; textureSampler: MDLTextureSampler; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; URL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithNameSemantic(name: string, semantic: MDLMaterialSemantic): this;

	initWithNameSemanticColor(name: string, semantic: MDLMaterialSemantic, color: any): this;

	initWithNameSemanticFloat(name: string, semantic: MDLMaterialSemantic, value: number): this;

	initWithNameSemanticFloat2(name: string, semantic: MDLMaterialSemantic, value: interop.Reference<number>): this;

	initWithNameSemanticFloat3(name: string, semantic: MDLMaterialSemantic, value: interop.Reference<number>): this;

	initWithNameSemanticFloat4(name: string, semantic: MDLMaterialSemantic, value: interop.Reference<number>): this;

	initWithNameSemanticMatrix4x4(name: string, semantic: MDLMaterialSemantic, value: simd_float4x4): this;

	initWithNameSemanticString(name: string, semantic: MDLMaterialSemantic, string: string): this;

	initWithNameSemanticTextureSampler(name: string, semantic: MDLMaterialSemantic, textureSampler: MDLTextureSampler): this;

	initWithNameSemanticURL(name: string, semantic: MDLMaterialSemantic, URL: NSURL): this;

	setProperties(property: MDLMaterialProperty): void;
}

declare class MDLMaterialPropertyConnection extends NSObject implements MDLNamed {

	static alloc(): MDLMaterialPropertyConnection; // inherited from NSObject

	static new(): MDLMaterialPropertyConnection; // inherited from NSObject

	readonly input: MDLMaterialProperty;

	readonly output: MDLMaterialProperty;

	name: string; // inherited from MDLNamed

	constructor(o: { output: MDLMaterialProperty; input: MDLMaterialProperty; });

	initWithOutputInput(output: MDLMaterialProperty, input: MDLMaterialProperty): this;
}

declare class MDLMaterialPropertyGraph extends MDLMaterialPropertyNode {

	static alloc(): MDLMaterialPropertyGraph; // inherited from NSObject

	static new(): MDLMaterialPropertyGraph; // inherited from NSObject

	readonly connections: NSArray<MDLMaterialPropertyConnection>;

	readonly nodes: NSArray<MDLMaterialPropertyNode>;

	constructor(o: { nodes: NSArray<MDLMaterialPropertyNode> | MDLMaterialPropertyNode[]; connections: NSArray<MDLMaterialPropertyConnection> | MDLMaterialPropertyConnection[]; });

	evaluate(): void;

	initWithNodesConnections(nodes: NSArray<MDLMaterialPropertyNode> | MDLMaterialPropertyNode[], connections: NSArray<MDLMaterialPropertyConnection> | MDLMaterialPropertyConnection[]): this;
}

declare class MDLMaterialPropertyNode extends NSObject implements MDLNamed {

	static alloc(): MDLMaterialPropertyNode; // inherited from NSObject

	static new(): MDLMaterialPropertyNode; // inherited from NSObject

	evaluationFunction: (p1: MDLMaterialPropertyNode) => void;

	readonly inputs: NSArray<MDLMaterialProperty>;

	readonly outputs: NSArray<MDLMaterialProperty>;

	name: string; // inherited from MDLNamed

	constructor(o: { inputs: NSArray<MDLMaterialProperty> | MDLMaterialProperty[]; outputs: NSArray<MDLMaterialProperty> | MDLMaterialProperty[]; evaluationFunction: (p1: MDLMaterialPropertyNode) => void; });

	initWithInputsOutputsEvaluationFunction(inputs: NSArray<MDLMaterialProperty> | MDLMaterialProperty[], outputs: NSArray<MDLMaterialProperty> | MDLMaterialProperty[], _function: (p1: MDLMaterialPropertyNode) => void): this;
}

declare const enum MDLMaterialPropertyType {

	None = 0,

	String = 1,

	URL = 2,

	Texture = 3,

	Color = 4,

	Float = 5,

	Float2 = 6,

	Float3 = 7,

	Float4 = 8,

	Matrix44 = 9
}

declare const enum MDLMaterialSemantic {

	BaseColor = 0,

	Subsurface = 1,

	Metallic = 2,

	Specular = 3,

	SpecularExponent = 4,

	SpecularTint = 5,

	Roughness = 6,

	Anisotropic = 7,

	AnisotropicRotation = 8,

	Sheen = 9,

	SheenTint = 10,

	Clearcoat = 11,

	ClearcoatGloss = 12,

	Emission = 13,

	Bump = 14,

	Opacity = 15,

	InterfaceIndexOfRefraction = 16,

	MaterialIndexOfRefraction = 17,

	ObjectSpaceNormal = 18,

	TangentSpaceNormal = 19,

	Displacement = 20,

	DisplacementScale = 21,

	AmbientOcclusion = 22,

	AmbientOcclusionScale = 23,

	None = 32768,

	UserDefined = 32769
}

declare const enum MDLMaterialTextureFilterMode {

	Nearest = 0,

	Linear = 1
}

declare const enum MDLMaterialTextureWrapMode {

	Clamp = 0,

	Repeat = 1,

	Mirror = 2
}

declare class MDLMatrix4x4Array extends NSObject implements NSCopying {

	static alloc(): MDLMatrix4x4Array; // inherited from NSObject

	static new(): MDLMatrix4x4Array; // inherited from NSObject

	readonly elementCount: number;

	readonly precision: MDLDataPrecision;

	constructor(o: { elementCount: number; });

	clear(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	getDouble4x4ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<simd_double4x4>, maxCount: number): number;

	getFloat4x4ArrayMaxCount(valuesArray: interop.Pointer | interop.Reference<simd_float4x4>, maxCount: number): number;

	initWithElementCount(arrayElementCount: number): this;

	setDouble4x4ArrayCount(valuesArray: interop.Pointer | interop.Reference<simd_double4x4>, count: number): void;

	setFloat4x4ArrayCount(valuesArray: interop.Pointer | interop.Reference<simd_float4x4>, count: number): void;
}

declare class MDLMesh extends MDLObject {

	static alloc(): MDLMesh; // inherited from NSObject

	static meshWithSCNGeometry(scnGeometry: SCNGeometry): MDLMesh;

	static meshWithSCNGeometryBufferAllocator(scnGeometry: SCNGeometry, bufferAllocator: MDLMeshBufferAllocator): MDLMesh;

	static new(): MDLMesh; // inherited from NSObject

	static newBoxWithDimensionsSegmentsGeometryTypeInwardNormalsAllocator(dimensions: interop.Reference<number>, segments: interop.Reference<number>, geometryType: MDLGeometryType, inwardNormals: boolean, allocator: MDLMeshBufferAllocator): MDLMesh;

	static newCapsuleWithHeightRadiiRadialSegmentsVerticalSegmentsHemisphereSegmentsGeometryTypeInwardNormalsAllocator(height: number, radii: interop.Reference<number>, radialSegments: number, verticalSegments: number, hemisphereSegments: number, geometryType: MDLGeometryType, inwardNormals: boolean, allocator: MDLMeshBufferAllocator): MDLMesh;

	static newCylinderWithHeightRadiiRadialSegmentsVerticalSegmentsGeometryTypeInwardNormalsAllocator(height: number, radii: interop.Reference<number>, radialSegments: number, verticalSegments: number, geometryType: MDLGeometryType, inwardNormals: boolean, allocator: MDLMeshBufferAllocator): MDLMesh;

	static newEllipsoidWithRadiiRadialSegmentsVerticalSegmentsGeometryTypeInwardNormalsHemisphereAllocator(radii: interop.Reference<number>, radialSegments: number, verticalSegments: number, geometryType: MDLGeometryType, inwardNormals: boolean, hemisphere: boolean, allocator: MDLMeshBufferAllocator): MDLMesh;

	static newEllipticalConeWithHeightRadiiRadialSegmentsVerticalSegmentsGeometryTypeInwardNormalsAllocator(height: number, radii: interop.Reference<number>, radialSegments: number, verticalSegments: number, geometryType: MDLGeometryType, inwardNormals: boolean, allocator: MDLMeshBufferAllocator): MDLMesh;

	static newIcosahedronWithRadiusInwardNormalsAllocator(radius: number, inwardNormals: boolean, allocator: MDLMeshBufferAllocator): MDLMesh;

	static newIcosahedronWithRadiusInwardNormalsGeometryTypeAllocator(radius: number, inwardNormals: boolean, geometryType: MDLGeometryType, allocator: MDLMeshBufferAllocator): MDLMesh;

	static newPlaneWithDimensionsSegmentsGeometryTypeAllocator(dimensions: interop.Reference<number>, segments: interop.Reference<number>, geometryType: MDLGeometryType, allocator: MDLMeshBufferAllocator): MDLMesh;

	static newSubdividedMeshSubmeshIndexSubdivisionLevels(mesh: MDLMesh, submeshIndex: number, subdivisionLevels: number): MDLMesh;

	static objectWithSCNNode(scnNode: SCNNode): MDLMesh; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLMesh; // inherited from MDLObject

	readonly allocator: MDLMeshBufferAllocator;

	readonly boundingBox: MDLAxisAlignedBoundingBox;

	submeshes: NSMutableArray<MDLSubmesh>;

	vertexBuffers: NSArray<MDLMeshBuffer>;

	vertexCount: number;

	vertexDescriptor: MDLVertexDescriptor;

	constructor(o: { boxWithExtent: interop.Reference<number>; segments: interop.Reference<number>; inwardNormals: boolean; geometryType: MDLGeometryType; allocator: MDLMeshBufferAllocator; });

	constructor(o: { capsuleWithExtent: interop.Reference<number>; cylinderSegments: interop.Reference<number>; hemisphereSegments: number; inwardNormals: boolean; geometryType: MDLGeometryType; allocator: MDLMeshBufferAllocator; });

	constructor(o: { coneWithExtent: interop.Reference<number>; segments: interop.Reference<number>; inwardNormals: boolean; cap: boolean; geometryType: MDLGeometryType; allocator: MDLMeshBufferAllocator; });

	constructor(o: { cylinderWithExtent: interop.Reference<number>; segments: interop.Reference<number>; inwardNormals: boolean; topCap: boolean; bottomCap: boolean; geometryType: MDLGeometryType; allocator: MDLMeshBufferAllocator; });

	constructor(o: { hemisphereWithExtent: interop.Reference<number>; segments: interop.Reference<number>; inwardNormals: boolean; cap: boolean; geometryType: MDLGeometryType; allocator: MDLMeshBufferAllocator; });

	constructor(o: { icosahedronWithExtent: interop.Reference<number>; inwardNormals: boolean; geometryType: MDLGeometryType; allocator: MDLMeshBufferAllocator; });

	constructor(o: { meshBySubdividingMesh: MDLMesh; submeshIndex: number; subdivisionLevels: number; allocator: MDLMeshBufferAllocator; });

	constructor(o: { planeWithExtent: interop.Reference<number>; segments: interop.Reference<number>; geometryType: MDLGeometryType; allocator: MDLMeshBufferAllocator; });

	constructor(o: { sphereWithExtent: interop.Reference<number>; segments: interop.Reference<number>; inwardNormals: boolean; geometryType: MDLGeometryType; allocator: MDLMeshBufferAllocator; });

	constructor(o: { bufferAllocator: MDLMeshBufferAllocator; });

	constructor(o: { vertexBuffer: MDLMeshBuffer; vertexCount: number; descriptor: MDLVertexDescriptor; submeshes: NSArray<MDLSubmesh> | MDLSubmesh[]; });

	constructor(o: { vertexBuffers: NSArray<MDLMeshBuffer> | MDLMeshBuffer[]; vertexCount: number; descriptor: MDLVertexDescriptor; submeshes: NSArray<MDLSubmesh> | MDLSubmesh[]; });

	addAttributeWithNameFormat(name: string, format: MDLVertexFormat): void;

	addAttributeWithNameFormatTypeDataStride(name: string, format: MDLVertexFormat, type: string, data: NSData, stride: number): void;

	addAttributeWithNameFormatTypeDataStrideTime(name: string, format: MDLVertexFormat, type: string, data: NSData, stride: number, time: number): void;

	addNormalsWithAttributeNamedCreaseThreshold(attributeName: string, creaseThreshold: number): void;

	addOrthTanBasisForTextureCoordinateAttributeNamedNormalAttributeNamedTangentAttributeNamed(textureCoordinateAttributeName: string, normalAttributeName: string, tangentAttributeName: string): void;

	addTangentBasisForTextureCoordinateAttributeNamedNormalAttributeNamedTangentAttributeNamed(textureCoordinateAttributeName: string, normalAttributeName: string, tangentAttributeName: string): void;

	addTangentBasisForTextureCoordinateAttributeNamedTangentAttributeNamedBitangentAttributeNamed(textureCoordinateAttributeName: string, tangentAttributeName: string, bitangentAttributeName: string): void;

	addUnwrappedTextureCoordinatesForAttributeNamed(textureCoordinateAttributeName: string): void;

	flipTextureCoordinatesInAttributeNamed(textureCoordinateAttributeName: string): void;

	generateAmbientOcclusionTextureWithQualityAttenuationFactorObjectsToConsiderVertexAttributeNamedMaterialPropertyNamed(bakeQuality: number, attenuationFactor: number, objectsToConsider: NSArray<MDLObject> | MDLObject[], vertexAttributeName: string, materialPropertyName: string): boolean;

	generateAmbientOcclusionTextureWithSizeRaysPerSampleAttenuationFactorObjectsToConsiderVertexAttributeNamedMaterialPropertyNamed(textureSize: interop.Reference<number>, raysPerSample: number, attenuationFactor: number, objectsToConsider: NSArray<MDLObject> | MDLObject[], vertexAttributeName: string, materialPropertyName: string): boolean;

	generateAmbientOcclusionVertexColorsWithQualityAttenuationFactorObjectsToConsiderVertexAttributeNamed(bakeQuality: number, attenuationFactor: number, objectsToConsider: NSArray<MDLObject> | MDLObject[], vertexAttributeName: string): boolean;

	generateAmbientOcclusionVertexColorsWithRaysPerSampleAttenuationFactorObjectsToConsiderVertexAttributeNamed(raysPerSample: number, attenuationFactor: number, objectsToConsider: NSArray<MDLObject> | MDLObject[], vertexAttributeName: string): boolean;

	generateLightMapTextureWithQualityLightsToConsiderObjectsToConsiderVertexAttributeNamedMaterialPropertyNamed(bakeQuality: number, lightsToConsider: NSArray<MDLLight> | MDLLight[], objectsToConsider: NSArray<MDLObject> | MDLObject[], vertexAttributeName: string, materialPropertyName: string): boolean;

	generateLightMapTextureWithTextureSizeLightsToConsiderObjectsToConsiderVertexAttributeNamedMaterialPropertyNamed(textureSize: interop.Reference<number>, lightsToConsider: NSArray<MDLLight> | MDLLight[], objectsToConsider: NSArray<MDLObject> | MDLObject[], vertexAttributeName: string, materialPropertyName: string): boolean;

	generateLightMapVertexColorsWithLightsToConsiderObjectsToConsiderVertexAttributeNamed(lightsToConsider: NSArray<MDLLight> | MDLLight[], objectsToConsider: NSArray<MDLObject> | MDLObject[], vertexAttributeName: string): boolean;

	initBoxWithExtentSegmentsInwardNormalsGeometryTypeAllocator(extent: interop.Reference<number>, segments: interop.Reference<number>, inwardNormals: boolean, geometryType: MDLGeometryType, allocator: MDLMeshBufferAllocator): this;

	initCapsuleWithExtentCylinderSegmentsHemisphereSegmentsInwardNormalsGeometryTypeAllocator(extent: interop.Reference<number>, segments: interop.Reference<number>, hemisphereSegments: number, inwardNormals: boolean, geometryType: MDLGeometryType, allocator: MDLMeshBufferAllocator): this;

	initConeWithExtentSegmentsInwardNormalsCapGeometryTypeAllocator(extent: interop.Reference<number>, segments: interop.Reference<number>, inwardNormals: boolean, cap: boolean, geometryType: MDLGeometryType, allocator: MDLMeshBufferAllocator): this;

	initCylinderWithExtentSegmentsInwardNormalsTopCapBottomCapGeometryTypeAllocator(extent: interop.Reference<number>, segments: interop.Reference<number>, inwardNormals: boolean, topCap: boolean, bottomCap: boolean, geometryType: MDLGeometryType, allocator: MDLMeshBufferAllocator): this;

	initHemisphereWithExtentSegmentsInwardNormalsCapGeometryTypeAllocator(extent: interop.Reference<number>, segments: interop.Reference<number>, inwardNormals: boolean, cap: boolean, geometryType: MDLGeometryType, allocator: MDLMeshBufferAllocator): this;

	initIcosahedronWithExtentInwardNormalsGeometryTypeAllocator(extent: interop.Reference<number>, inwardNormals: boolean, geometryType: MDLGeometryType, allocator: MDLMeshBufferAllocator): this;

	initMeshBySubdividingMeshSubmeshIndexSubdivisionLevelsAllocator(mesh: MDLMesh, submeshIndex: number, subdivisionLevels: number, allocator: MDLMeshBufferAllocator): this;

	initPlaneWithExtentSegmentsGeometryTypeAllocator(extent: interop.Reference<number>, segments: interop.Reference<number>, geometryType: MDLGeometryType, allocator: MDLMeshBufferAllocator): this;

	initSphereWithExtentSegmentsInwardNormalsGeometryTypeAllocator(extent: interop.Reference<number>, segments: interop.Reference<number>, inwardNormals: boolean, geometryType: MDLGeometryType, allocator: MDLMeshBufferAllocator): this;

	initWithBufferAllocator(bufferAllocator: MDLMeshBufferAllocator): this;

	initWithVertexBufferVertexCountDescriptorSubmeshes(vertexBuffer: MDLMeshBuffer, vertexCount: number, descriptor: MDLVertexDescriptor, submeshes: NSArray<MDLSubmesh> | MDLSubmesh[]): this;

	initWithVertexBuffersVertexCountDescriptorSubmeshes(vertexBuffers: NSArray<MDLMeshBuffer> | MDLMeshBuffer[], vertexCount: number, descriptor: MDLVertexDescriptor, submeshes: NSArray<MDLSubmesh> | MDLSubmesh[]): this;

	makeVerticesUnique(): void;

	makeVerticesUniqueAndReturnError(): boolean;

	removeAttributeNamed(name: string): void;

	replaceAttributeNamedWithData(name: string, newData: MDLVertexAttributeData): void;

	updateAttributeNamedWithData(name: string, newData: MDLVertexAttributeData): void;

	vertexAttributeDataForAttributeNamed(name: string): MDLVertexAttributeData;

	vertexAttributeDataForAttributeNamedAsFormat(name: string, format: MDLVertexFormat): MDLVertexAttributeData;
}

interface MDLMeshBuffer extends NSCopying, NSObjectProtocol {

	allocator: MDLMeshBufferAllocator;

	length: number;

	type: MDLMeshBufferType;

	

	fillDataOffset(data: NSData, offset: number): void;

	map(): MDLMeshBufferMap;
}
declare var MDLMeshBuffer: {

	prototype: MDLMeshBuffer;
};

interface MDLMeshBufferAllocator extends NSObjectProtocol {

	newBufferFromZoneDataType(zone: MDLMeshBufferZone, data: NSData, type: MDLMeshBufferType): MDLMeshBuffer;

	newBufferFromZoneLengthType(zone: MDLMeshBufferZone, length: number, type: MDLMeshBufferType): MDLMeshBuffer;

	newBufferType(length: number, type: MDLMeshBufferType): MDLMeshBuffer;

	newBufferWithDataType(data: NSData, type: MDLMeshBufferType): MDLMeshBuffer;

	newZone(capacity: number): MDLMeshBufferZone;

	newZoneForBuffersWithSizeAndType(sizes: NSArray<number> | number[], types: NSArray<number> | number[]): MDLMeshBufferZone;
}
declare var MDLMeshBufferAllocator: {

	prototype: MDLMeshBufferAllocator;
};

declare class MDLMeshBufferData extends NSObject implements MDLMeshBuffer {

	static alloc(): MDLMeshBufferData; // inherited from NSObject

	static new(): MDLMeshBufferData; // inherited from NSObject

	readonly data: NSData;

	readonly allocator: MDLMeshBufferAllocator; // inherited from MDLMeshBuffer

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly length: number; // inherited from MDLMeshBuffer

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly type: MDLMeshBufferType; // inherited from MDLMeshBuffer

	readonly  // inherited from MDLMeshBuffer

	constructor(o: { type: MDLMeshBufferType; data: NSData; });

	constructor(o: { type: MDLMeshBufferType; length: number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	fillDataOffset(data: NSData, offset: number): void;

	initWithTypeData(type: MDLMeshBufferType, data: NSData): this;

	initWithTypeLength(type: MDLMeshBufferType, length: number): this;

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

declare class MDLMeshBufferDataAllocator extends NSObject implements MDLMeshBufferAllocator {

	static alloc(): MDLMeshBufferDataAllocator; // inherited from NSObject

	static new(): MDLMeshBufferDataAllocator; // inherited from NSObject

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

declare class MDLMeshBufferMap extends NSObject {

	static alloc(): MDLMeshBufferMap; // inherited from NSObject

	static new(): MDLMeshBufferMap; // inherited from NSObject

	readonly bytes: interop.Pointer | interop.Reference<any>;

	constructor(o: { bytes: interop.Pointer | interop.Reference<any>; deallocator: () => void; });

	initWithBytesDeallocator(bytes: interop.Pointer | interop.Reference<any>, deallocator: () => void): this;
}

declare const enum MDLMeshBufferType {

	Vertex = 1,

	Index = 2
}

interface MDLMeshBufferZone extends NSObjectProtocol {

	allocator: MDLMeshBufferAllocator;

	capacity: number;
}
declare var MDLMeshBufferZone: {

	prototype: MDLMeshBufferZone;
};

declare class MDLMeshBufferZoneDefault extends NSObject implements MDLMeshBufferZone {

	static alloc(): MDLMeshBufferZoneDefault; // inherited from NSObject

	static new(): MDLMeshBufferZoneDefault; // inherited from NSObject

	readonly allocator: MDLMeshBufferAllocator; // inherited from MDLMeshBufferZone

	readonly capacity: number; // inherited from MDLMeshBufferZone

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

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

interface MDLNamed {

	name: string;
}
declare var MDLNamed: {

	prototype: MDLNamed;
};

declare class MDLNoiseTexture extends MDLTexture {

	static alloc(): MDLNoiseTexture; // inherited from NSObject

	static irradianceTextureCubeWithTextureNameDimensions(texture: MDLTexture, name: string, dimensions: interop.Reference<number>): MDLNoiseTexture; // inherited from MDLTexture

	static irradianceTextureCubeWithTextureNameDimensionsRoughness(texture: MDLTexture, name: string, dimensions: interop.Reference<number>, roughness: number): MDLNoiseTexture; // inherited from MDLTexture

	static new(): MDLNoiseTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string> | string[]): MDLNoiseTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string> | string[], bundleOrNil: NSBundle): MDLNoiseTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLNoiseTexture; // inherited from MDLTexture

	static textureNamedAssetResolver(name: string, resolver: MDLAssetResolver): MDLNoiseTexture; // inherited from MDLTexture

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLNoiseTexture; // inherited from MDLTexture

	constructor(o: { cellularNoiseWithFrequency: number; name: string; textureDimensions: interop.Reference<number>; channelEncoding: MDLTextureChannelEncoding; });

	constructor(o: { scalarNoiseWithSmoothness: number; name: string; textureDimensions: interop.Reference<number>; channelCount: number; channelEncoding: MDLTextureChannelEncoding; grayscale: boolean; });

	constructor(o: { vectorNoiseWithSmoothness: number; name: string; textureDimensions: interop.Reference<number>; channelEncoding: MDLTextureChannelEncoding; });

	initCellularNoiseWithFrequencyNameTextureDimensionsChannelEncoding(frequency: number, name: string, textureDimensions: interop.Reference<number>, channelEncoding: MDLTextureChannelEncoding): this;

	initScalarNoiseWithSmoothnessNameTextureDimensionsChannelCountChannelEncodingGrayscale(smoothness: number, name: string, textureDimensions: interop.Reference<number>, channelCount: number, channelEncoding: MDLTextureChannelEncoding, grayscale: boolean): this;

	initVectorNoiseWithSmoothnessNameTextureDimensionsChannelEncoding(smoothness: number, name: string, textureDimensions: interop.Reference<number>, channelEncoding: MDLTextureChannelEncoding): this;
}

declare class MDLNormalMapTexture extends MDLTexture {

	static alloc(): MDLNormalMapTexture; // inherited from NSObject

	static irradianceTextureCubeWithTextureNameDimensions(texture: MDLTexture, name: string, dimensions: interop.Reference<number>): MDLNormalMapTexture; // inherited from MDLTexture

	static irradianceTextureCubeWithTextureNameDimensionsRoughness(texture: MDLTexture, name: string, dimensions: interop.Reference<number>, roughness: number): MDLNormalMapTexture; // inherited from MDLTexture

	static new(): MDLNormalMapTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string> | string[]): MDLNormalMapTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string> | string[], bundleOrNil: NSBundle): MDLNormalMapTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLNormalMapTexture; // inherited from MDLTexture

	static textureNamedAssetResolver(name: string, resolver: MDLAssetResolver): MDLNormalMapTexture; // inherited from MDLTexture

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLNormalMapTexture; // inherited from MDLTexture

	constructor(o: { byGeneratingNormalMapWithTexture: MDLTexture; name: string; smoothness: number; contrast: number; });

	initByGeneratingNormalMapWithTextureNameSmoothnessContrast(sourceTexture: MDLTexture, name: string, smoothness: number, contrast: number): this;
}

declare class MDLObject extends NSObject implements MDLNamed {

	static alloc(): MDLObject; // inherited from NSObject

	static new(): MDLObject; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLObject;

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLObject;

	children: MDLObjectContainerComponent;

	readonly components: NSArray<MDLComponent>;

	hidden: boolean;

	instance: MDLObject;

	parent: MDLObject;

	readonly path: string;

	transform: MDLTransformComponent;

	name: string; // inherited from MDLNamed

	addChild(child: MDLObject): void;

	boundingBoxAtTime(time: number): MDLAxisAlignedBoundingBox;

	componentConformingToProtocol(protocol: any /* Protocol */): MDLComponent;

	enumerateChildObjectsOfClassRootUsingBlockStopPointer(objectClass: typeof NSObject, root: MDLObject, block: (p1: MDLObject, p2: interop.Pointer | interop.Reference<boolean>) => void, stopPointer: interop.Pointer | interop.Reference<boolean>): void;

	objectAtPath(path: string): MDLObject;

	objectForKeyedSubscript(key: any /* Protocol */): MDLComponent;

	setComponentForProtocol(component: MDLComponent, protocol: any /* Protocol */): void;

	setObjectForKeyedSubscript(obj: MDLComponent, key: any /* Protocol */): void;
}

declare class MDLObjectContainer extends NSObject implements MDLObjectContainerComponent {

	static alloc(): MDLObjectContainer; // inherited from NSObject

	static new(): MDLObjectContainer; // inherited from NSObject

	readonly count: number; // inherited from MDLObjectContainerComponent

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly objects: NSArray<MDLObject>; // inherited from MDLObjectContainerComponent

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol
	[index: number]: MDLObject;
	[Symbol.iterator](): Iterator<any>;

	addObject(object: MDLObject): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	objectAtIndexedSubscript(index: number): MDLObject;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeObject(object: MDLObject): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

interface MDLObjectContainerComponent extends MDLComponent, NSFastEnumeration {

	count: number;

	objects: NSArray<MDLObject>;

	addObject(object: MDLObject): void;

	objectAtIndexedSubscript(index: number): MDLObject;

	removeObject(object: MDLObject): void;
}
declare var MDLObjectContainerComponent: {

	prototype: MDLObjectContainerComponent;
};

declare class MDLPackedJointAnimation extends MDLObject implements MDLJointAnimation, NSCopying {

	static alloc(): MDLPackedJointAnimation; // inherited from NSObject

	static new(): MDLPackedJointAnimation; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLPackedJointAnimation; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLPackedJointAnimation; // inherited from MDLObject

	readonly jointPaths: NSArray<string>;

	readonly rotations: MDLAnimatedQuaternionArray;

	readonly scales: MDLAnimatedVector3Array;

	readonly translations: MDLAnimatedVector3Array;

	constructor(o: { name: string; jointPaths: NSArray<string> | string[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithNameJointPaths(name: string, jointPaths: NSArray<string> | string[]): this;
}

declare class MDLPathAssetResolver extends NSObject implements MDLAssetResolver {

	static alloc(): MDLPathAssetResolver; // inherited from NSObject

	static new(): MDLPathAssetResolver; // inherited from NSObject

	path: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { path: string; });

	canResolveAssetNamed(name: string): boolean;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithPath(path: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	resolveAssetNamed(name: string): NSURL;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MDLPhotometricLight extends MDLPhysicallyPlausibleLight {

	static alloc(): MDLPhotometricLight; // inherited from NSObject

	static lightWithSCNLight(scnLight: SCNLight): MDLPhotometricLight; // inherited from MDLLight

	static new(): MDLPhotometricLight; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLPhotometricLight; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLPhotometricLight; // inherited from MDLObject

	readonly lightCubeMap: MDLTexture;

	readonly sphericalHarmonicsCoefficients: NSData;

	readonly sphericalHarmonicsLevel: number;

	constructor(o: { IESProfile: NSURL; });

	generateCubemapFromLight(textureSize: number): void;

	generateSphericalHarmonicsFromLight(sphericalHarmonicsLevel: number): void;

	generateTexture(textureSize: number): MDLTexture;

	initWithIESProfile(URL: NSURL): this;
}

declare class MDLPhysicallyPlausibleLight extends MDLLight {

	static alloc(): MDLPhysicallyPlausibleLight; // inherited from NSObject

	static lightWithSCNLight(scnLight: SCNLight): MDLPhysicallyPlausibleLight; // inherited from MDLLight

	static new(): MDLPhysicallyPlausibleLight; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLPhysicallyPlausibleLight; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLPhysicallyPlausibleLight; // inherited from MDLObject

	attenuationEndDistance: number;

	attenuationStartDistance: number;

	color: any;

	innerConeAngle: number;

	lumens: number;

	outerConeAngle: number;

	setColorByTemperature(temperature: number): void;
}

declare class MDLPhysicallyPlausibleScatteringFunction extends MDLScatteringFunction {

	static alloc(): MDLPhysicallyPlausibleScatteringFunction; // inherited from NSObject

	static new(): MDLPhysicallyPlausibleScatteringFunction; // inherited from NSObject

	readonly anisotropic: MDLMaterialProperty;

	readonly anisotropicRotation: MDLMaterialProperty;

	readonly clearcoat: MDLMaterialProperty;

	readonly clearcoatGloss: MDLMaterialProperty;

	readonly metallic: MDLMaterialProperty;

	readonly roughness: MDLMaterialProperty;

	readonly sheen: MDLMaterialProperty;

	readonly sheenTint: MDLMaterialProperty;

	readonly specularAmount: MDLMaterialProperty;

	readonly specularTint: MDLMaterialProperty;

	readonly subsurface: MDLMaterialProperty;

	readonly version: number;
}

declare const enum MDLProbePlacement {

	UniformGrid = 0,

	IrradianceDistribution = 1
}

declare class MDLRelativeAssetResolver extends NSObject implements MDLAssetResolver {

	static alloc(): MDLRelativeAssetResolver; // inherited from NSObject

	static new(): MDLRelativeAssetResolver; // inherited from NSObject

	asset: MDLAsset;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { asset: MDLAsset; });

	canResolveAssetNamed(name: string): boolean;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithAsset(asset: MDLAsset): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	resolveAssetNamed(name: string): NSURL;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class MDLScatteringFunction extends NSObject implements MDLNamed {

	static alloc(): MDLScatteringFunction; // inherited from NSObject

	static new(): MDLScatteringFunction; // inherited from NSObject

	readonly ambientOcclusion: MDLMaterialProperty;

	readonly ambientOcclusionScale: MDLMaterialProperty;

	readonly baseColor: MDLMaterialProperty;

	readonly emission: MDLMaterialProperty;

	readonly interfaceIndexOfRefraction: MDLMaterialProperty;

	readonly materialIndexOfRefraction: MDLMaterialProperty;

	readonly normal: MDLMaterialProperty;

	readonly specular: MDLMaterialProperty;

	name: string; // inherited from MDLNamed
}

declare class MDLSkeleton extends MDLObject implements NSCopying {

	static alloc(): MDLSkeleton; // inherited from NSObject

	static new(): MDLSkeleton; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLSkeleton; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLSkeleton; // inherited from MDLObject

	readonly jointBindTransforms: MDLMatrix4x4Array;

	readonly jointPaths: NSArray<string>;

	readonly jointRestTransforms: MDLMatrix4x4Array;

	constructor(o: { name: string; jointPaths: NSArray<string> | string[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithNameJointPaths(name: string, jointPaths: NSArray<string> | string[]): this;
}

declare class MDLSkyCubeTexture extends MDLTexture {

	static alloc(): MDLSkyCubeTexture; // inherited from NSObject

	static irradianceTextureCubeWithTextureNameDimensions(texture: MDLTexture, name: string, dimensions: interop.Reference<number>): MDLSkyCubeTexture; // inherited from MDLTexture

	static irradianceTextureCubeWithTextureNameDimensionsRoughness(texture: MDLTexture, name: string, dimensions: interop.Reference<number>, roughness: number): MDLSkyCubeTexture; // inherited from MDLTexture

	static new(): MDLSkyCubeTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string> | string[]): MDLSkyCubeTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string> | string[], bundleOrNil: NSBundle): MDLSkyCubeTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLSkyCubeTexture; // inherited from MDLTexture

	static textureNamedAssetResolver(name: string, resolver: MDLAssetResolver): MDLSkyCubeTexture; // inherited from MDLTexture

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLSkyCubeTexture; // inherited from MDLTexture

	brightness: number;

	contrast: number;

	exposure: number;

	gamma: number;

	groundAlbedo: number;

	groundColor: any;

	highDynamicRangeCompression: interop.Reference<number>;

	horizonElevation: number;

	saturation: number;

	sunAzimuth: number;

	sunElevation: number;

	turbidity: number;

	upperAtmosphereScattering: number;

	constructor(o: { name: string; channelEncoding: MDLTextureChannelEncoding; textureDimensions: interop.Reference<number>; turbidity: number; sunElevation: number; sunAzimuth: number; upperAtmosphereScattering: number; groundAlbedo: number; });

	constructor(o: { name: string; channelEncoding: MDLTextureChannelEncoding; textureDimensions: interop.Reference<number>; turbidity: number; sunElevation: number; upperAtmosphereScattering: number; groundAlbedo: number; });

	initWithNameChannelEncodingTextureDimensionsTurbiditySunElevationSunAzimuthUpperAtmosphereScatteringGroundAlbedo(name: string, channelEncoding: MDLTextureChannelEncoding, textureDimensions: interop.Reference<number>, turbidity: number, sunElevation: number, sunAzimuth: number, upperAtmosphereScattering: number, groundAlbedo: number): this;

	initWithNameChannelEncodingTextureDimensionsTurbiditySunElevationUpperAtmosphereScatteringGroundAlbedo(name: string, channelEncoding: MDLTextureChannelEncoding, textureDimensions: interop.Reference<number>, turbidity: number, sunElevation: number, upperAtmosphereScattering: number, groundAlbedo: number): this;

	updateTexture(): void;
}

declare class MDLStereoscopicCamera extends MDLCamera {

	static alloc(): MDLStereoscopicCamera; // inherited from NSObject

	static cameraWithSCNCamera(scnCamera: SCNCamera): MDLStereoscopicCamera; // inherited from MDLCamera

	static new(): MDLStereoscopicCamera; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLStereoscopicCamera; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLStereoscopicCamera; // inherited from MDLObject

	interPupillaryDistance: number;

	readonly leftProjectionMatrix: simd_float4x4;

	leftVergence: number;

	readonly leftViewMatrix: simd_float4x4;

	overlap: number;

	readonly rightProjectionMatrix: simd_float4x4;

	rightVergence: number;

	readonly rightViewMatrix: simd_float4x4;
}

declare class MDLSubmesh extends NSObject implements MDLNamed {

	static alloc(): MDLSubmesh; // inherited from NSObject

	static new(): MDLSubmesh; // inherited from NSObject

	static submeshWithSCNGeometryElement(scnGeometryElement: SCNGeometryElement): MDLSubmesh;

	static submeshWithSCNGeometryElementBufferAllocator(scnGeometryElement: SCNGeometryElement, bufferAllocator: MDLMeshBufferAllocator): MDLSubmesh;

	readonly geometryType: MDLGeometryType;

	readonly indexBuffer: MDLMeshBuffer;

	readonly indexCount: number;

	readonly indexType: MDLIndexBitDepth;

	material: MDLMaterial;

	topology: MDLSubmeshTopology;

	name: string; // inherited from MDLNamed

	constructor(o: { indexBuffer: MDLMeshBuffer; indexCount: number; indexType: MDLIndexBitDepth; geometryType: MDLGeometryType; material: MDLMaterial; });

	constructor(o: { MDLSubmesh: MDLSubmesh; indexType: MDLIndexBitDepth; geometryType: MDLGeometryType; });

	constructor(o: { name: string; indexBuffer: MDLMeshBuffer; indexCount: number; indexType: MDLIndexBitDepth; geometryType: MDLGeometryType; material: MDLMaterial; });

	constructor(o: { name: string; indexBuffer: MDLMeshBuffer; indexCount: number; indexType: MDLIndexBitDepth; geometryType: MDLGeometryType; material: MDLMaterial; topology: MDLSubmeshTopology; });

	indexBufferAsIndexType(indexType: MDLIndexBitDepth): MDLMeshBuffer;

	initWithIndexBufferIndexCountIndexTypeGeometryTypeMaterial(indexBuffer: MDLMeshBuffer, indexCount: number, indexType: MDLIndexBitDepth, geometryType: MDLGeometryType, material: MDLMaterial): this;

	initWithMDLSubmeshIndexTypeGeometryType(submesh: MDLSubmesh, indexType: MDLIndexBitDepth, geometryType: MDLGeometryType): this;

	initWithNameIndexBufferIndexCountIndexTypeGeometryTypeMaterial(name: string, indexBuffer: MDLMeshBuffer, indexCount: number, indexType: MDLIndexBitDepth, geometryType: MDLGeometryType, material: MDLMaterial): this;

	initWithNameIndexBufferIndexCountIndexTypeGeometryTypeMaterialTopology(name: string, indexBuffer: MDLMeshBuffer, indexCount: number, indexType: MDLIndexBitDepth, geometryType: MDLGeometryType, material: MDLMaterial, topology: MDLSubmeshTopology): this;
}

declare class MDLSubmeshTopology extends NSObject {

	static alloc(): MDLSubmeshTopology; // inherited from NSObject

	static new(): MDLSubmeshTopology; // inherited from NSObject

	edgeCreaseCount: number;

	edgeCreaseIndices: MDLMeshBuffer;

	edgeCreases: MDLMeshBuffer;

	faceCount: number;

	faceTopology: MDLMeshBuffer;

	holeCount: number;

	holes: MDLMeshBuffer;

	vertexCreaseCount: number;

	vertexCreaseIndices: MDLMeshBuffer;

	vertexCreases: MDLMeshBuffer;

	constructor(o: { submesh: MDLSubmesh; });

	initWithSubmesh(submesh: MDLSubmesh): this;
}

declare class MDLTexture extends NSObject implements MDLNamed {

	static alloc(): MDLTexture; // inherited from NSObject

	static irradianceTextureCubeWithTextureNameDimensions(texture: MDLTexture, name: string, dimensions: interop.Reference<number>): MDLTexture;

	static irradianceTextureCubeWithTextureNameDimensionsRoughness(texture: MDLTexture, name: string, dimensions: interop.Reference<number>, roughness: number): MDLTexture;

	static new(): MDLTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string> | string[]): MDLTexture;

	static textureCubeWithImagesNamedBundle(names: NSArray<string> | string[], bundleOrNil: NSBundle): MDLTexture;

	static textureNamed(name: string): MDLTexture;

	static textureNamedAssetResolver(name: string, resolver: MDLAssetResolver): MDLTexture;

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLTexture;

	readonly channelCount: number;

	readonly channelEncoding: MDLTextureChannelEncoding;

	readonly dimensions: interop.Reference<number>;

	hasAlphaValues: boolean;

	isCube: boolean;

	readonly mipLevelCount: number;

	readonly rowStride: number;

	name: string; // inherited from MDLNamed

	constructor(o: { data: NSData; topLeftOrigin: boolean; name: string; dimensions: interop.Reference<number>; rowStride: number; channelCount: number; channelEncoding: MDLTextureChannelEncoding; isCube: boolean; });

	imageFromTexture(): any;

	imageFromTextureAtLevel(level: number): any;

	initWithDataTopLeftOriginNameDimensionsRowStrideChannelCountChannelEncodingIsCube(pixelData: NSData, topLeftOrigin: boolean, name: string, dimensions: interop.Reference<number>, rowStride: number, channelCount: number, channelEncoding: MDLTextureChannelEncoding, isCube: boolean): this;

	texelDataWithBottomLeftOrigin(): NSData;

	texelDataWithBottomLeftOriginAtMipLevelCreate(level: number, create: boolean): NSData;

	texelDataWithTopLeftOrigin(): NSData;

	texelDataWithTopLeftOriginAtMipLevelCreate(level: number, create: boolean): NSData;

	writeToURL(URL: NSURL): boolean;

	writeToURLLevel(URL: NSURL, level: number): boolean;

	writeToURLType(nsurl: NSURL, type: string): boolean;

	writeToURLTypeLevel(nsurl: NSURL, type: string, level: number): boolean;
}

declare const enum MDLTextureChannelEncoding {

	UInt8 = 1,

	Uint8 = 1,

	UInt16 = 2,

	Uint16 = 2,

	UInt24 = 3,

	Uint24 = 3,

	UInt32 = 4,

	Uint32 = 4,

	Float16 = 258,

	Float16SR = 770,

	Float32 = 260
}

declare class MDLTextureFilter extends NSObject {

	static alloc(): MDLTextureFilter; // inherited from NSObject

	static new(): MDLTextureFilter; // inherited from NSObject

	magFilter: MDLMaterialTextureFilterMode;

	minFilter: MDLMaterialTextureFilterMode;

	mipFilter: MDLMaterialMipMapFilterMode;

	rWrapMode: MDLMaterialTextureWrapMode;

	sWrapMode: MDLMaterialTextureWrapMode;

	tWrapMode: MDLMaterialTextureWrapMode;
}

declare class MDLTextureSampler extends NSObject {

	static alloc(): MDLTextureSampler; // inherited from NSObject

	static new(): MDLTextureSampler; // inherited from NSObject

	hardwareFilter: MDLTextureFilter;

	texture: MDLTexture;

	transform: MDLTransform;
}

declare class MDLTransform extends NSObject implements MDLTransformComponent, NSCopying {

	static alloc(): MDLTransform; // inherited from NSObject

	static globalTransformWithObjectAtTime(object: MDLObject, time: number): simd_float4x4;

	static new(): MDLTransform; // inherited from NSObject

	rotation: interop.Reference<number>;

	scale: interop.Reference<number>;

	shear: interop.Reference<number>;

	translation: interop.Reference<number>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly keyTimes: NSArray<number>; // inherited from MDLTransformComponent

	matrix: simd_float4x4; // inherited from MDLTransformComponent

	readonly maximumTime: number; // inherited from MDLTransformComponent

	readonly minimumTime: number; // inherited from MDLTransformComponent

	resetsTransform: boolean; // inherited from MDLTransformComponent

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { identity: void; });

	constructor(o: { matrix: simd_float4x4; });

	constructor(o: { matrix: simd_float4x4; resetsTransform: boolean; });

	constructor(o: { transformComponent: MDLTransformComponent; });

	constructor(o: { transformComponent: MDLTransformComponent; resetsTransform: boolean; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithIdentity(): this;

	initWithMatrix(matrix: simd_float4x4): this;

	initWithMatrixResetsTransform(matrix: simd_float4x4, resetsTransform: boolean): this;

	initWithTransformComponent(component: MDLTransformComponent): this;

	initWithTransformComponentResetsTransform(component: MDLTransformComponent, resetsTransform: boolean): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	localTransformAtTime(time: number): simd_float4x4;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	rotationAtTime(time: number): interop.Reference<number>;

	rotationMatrixAtTime(time: number): simd_float4x4;

	scaleAtTime(time: number): interop.Reference<number>;

	self(): this;

	setIdentity(): void;

	setLocalTransform(transform: simd_float4x4): void;

	setLocalTransformForTime(transform: simd_float4x4, time: number): void;

	setMatrixForTime(matrix: simd_float4x4, time: number): void;

	setRotationForTime(rotation: interop.Reference<number>, time: number): void;

	setScaleForTime(scale: interop.Reference<number>, time: number): void;

	setShearForTime(shear: interop.Reference<number>, time: number): void;

	setTranslationForTime(translation: interop.Reference<number>, time: number): void;

	shearAtTime(time: number): interop.Reference<number>;

	translationAtTime(time: number): interop.Reference<number>;
}

interface MDLTransformComponent extends MDLComponent {

	keyTimes: NSArray<number>;

	matrix: simd_float4x4;

	maximumTime: number;

	minimumTime: number;

	resetsTransform: boolean;

	localTransformAtTime?(time: number): simd_float4x4;

	setLocalTransform?(transform: simd_float4x4): void;

	setLocalTransformForTime?(transform: simd_float4x4, time: number): void;
}
declare var MDLTransformComponent: {

	prototype: MDLTransformComponent;

	globalTransformWithObjectAtTime?(object: MDLObject, time: number): simd_float4x4;
};

declare class MDLTransformMatrixOp extends NSObject implements MDLTransformOp {

	static alloc(): MDLTransformMatrixOp; // inherited from NSObject

	static new(): MDLTransformMatrixOp; // inherited from NSObject

	readonly animatedValue: MDLAnimatedMatrix4x4;

	readonly name: string; // inherited from MDLTransformOp

	IsInverseOp(): boolean;

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;
}

interface MDLTransformOp {

	name: string;

	IsInverseOp(): boolean;

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;
}
declare var MDLTransformOp: {

	prototype: MDLTransformOp;
};

declare const enum MDLTransformOpRotationOrder {

	XYZ = 1,

	XZY = 2,

	YXZ = 3,

	YZX = 4,

	ZXY = 5,

	ZYX = 6
}

declare class MDLTransformOrientOp extends NSObject implements MDLTransformOp {

	static alloc(): MDLTransformOrientOp; // inherited from NSObject

	static new(): MDLTransformOrientOp; // inherited from NSObject

	readonly animatedValue: MDLAnimatedQuaternion;

	readonly name: string; // inherited from MDLTransformOp

	IsInverseOp(): boolean;

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;
}

declare class MDLTransformRotateOp extends NSObject implements MDLTransformOp {

	static alloc(): MDLTransformRotateOp; // inherited from NSObject

	static new(): MDLTransformRotateOp; // inherited from NSObject

	readonly animatedValue: MDLAnimatedVector3;

	readonly name: string; // inherited from MDLTransformOp

	IsInverseOp(): boolean;

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;
}

declare class MDLTransformRotateXOp extends NSObject implements MDLTransformOp {

	static alloc(): MDLTransformRotateXOp; // inherited from NSObject

	static new(): MDLTransformRotateXOp; // inherited from NSObject

	readonly animatedValue: MDLAnimatedScalar;

	readonly name: string; // inherited from MDLTransformOp

	IsInverseOp(): boolean;

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;
}

declare class MDLTransformRotateYOp extends NSObject implements MDLTransformOp {

	static alloc(): MDLTransformRotateYOp; // inherited from NSObject

	static new(): MDLTransformRotateYOp; // inherited from NSObject

	readonly animatedValue: MDLAnimatedScalar;

	readonly name: string; // inherited from MDLTransformOp

	IsInverseOp(): boolean;

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;
}

declare class MDLTransformRotateZOp extends NSObject implements MDLTransformOp {

	static alloc(): MDLTransformRotateZOp; // inherited from NSObject

	static new(): MDLTransformRotateZOp; // inherited from NSObject

	readonly animatedValue: MDLAnimatedScalar;

	readonly name: string; // inherited from MDLTransformOp

	IsInverseOp(): boolean;

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;
}

declare class MDLTransformScaleOp extends NSObject implements MDLTransformOp {

	static alloc(): MDLTransformScaleOp; // inherited from NSObject

	static new(): MDLTransformScaleOp; // inherited from NSObject

	readonly animatedValue: MDLAnimatedVector3;

	readonly name: string; // inherited from MDLTransformOp

	IsInverseOp(): boolean;

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;
}

declare class MDLTransformStack extends NSObject implements MDLTransformComponent, NSCopying {

	static alloc(): MDLTransformStack; // inherited from NSObject

	static globalTransformWithObjectAtTime(object: MDLObject, time: number): simd_float4x4;

	static new(): MDLTransformStack; // inherited from NSObject

	readonly transformOps: NSArray<MDLTransformOp>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly keyTimes: NSArray<number>; // inherited from MDLTransformComponent

	matrix: simd_float4x4; // inherited from MDLTransformComponent

	readonly maximumTime: number; // inherited from MDLTransformComponent

	readonly minimumTime: number; // inherited from MDLTransformComponent

	resetsTransform: boolean; // inherited from MDLTransformComponent

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	addMatrixOpInverse(animatedValueName: string, inverse: boolean): MDLTransformMatrixOp;

	addOrientOpInverse(animatedValueName: string, inverse: boolean): MDLTransformOrientOp;

	addRotateOpOrderInverse(animatedValueName: string, order: MDLTransformOpRotationOrder, inverse: boolean): MDLTransformRotateOp;

	addRotateXOpInverse(animatedValueName: string, inverse: boolean): MDLTransformRotateXOp;

	addRotateYOpInverse(animatedValueName: string, inverse: boolean): MDLTransformRotateYOp;

	addRotateZOpInverse(animatedValueName: string, inverse: boolean): MDLTransformRotateZOp;

	addScaleOpInverse(animatedValueName: string, inverse: boolean): MDLTransformScaleOp;

	addTranslateOpInverse(animatedValueName: string, inverse: boolean): MDLTransformTranslateOp;

	animatedValueWithName(name: string): MDLAnimatedValue;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	count(): number;

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	localTransformAtTime(time: number): simd_float4x4;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setLocalTransform(transform: simd_float4x4): void;

	setLocalTransformForTime(transform: simd_float4x4, time: number): void;
}

declare class MDLTransformTranslateOp extends NSObject implements MDLTransformOp {

	static alloc(): MDLTransformTranslateOp; // inherited from NSObject

	static new(): MDLTransformTranslateOp; // inherited from NSObject

	readonly animatedValue: MDLAnimatedVector3;

	readonly name: string; // inherited from MDLTransformOp

	IsInverseOp(): boolean;

	double4x4AtTime(time: number): simd_double4x4;

	float4x4AtTime(time: number): simd_float4x4;
}

declare class MDLURLTexture extends MDLTexture {

	static alloc(): MDLURLTexture; // inherited from NSObject

	static irradianceTextureCubeWithTextureNameDimensions(texture: MDLTexture, name: string, dimensions: interop.Reference<number>): MDLURLTexture; // inherited from MDLTexture

	static irradianceTextureCubeWithTextureNameDimensionsRoughness(texture: MDLTexture, name: string, dimensions: interop.Reference<number>, roughness: number): MDLURLTexture; // inherited from MDLTexture

	static new(): MDLURLTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string> | string[]): MDLURLTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string> | string[], bundleOrNil: NSBundle): MDLURLTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLURLTexture; // inherited from MDLTexture

	static textureNamedAssetResolver(name: string, resolver: MDLAssetResolver): MDLURLTexture; // inherited from MDLTexture

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLURLTexture; // inherited from MDLTexture

	URL: NSURL;

	constructor(o: { URL: NSURL; name: string; });

	initWithURLName(URL: NSURL, name: string): this;
}

declare class MDLVertexAttribute extends NSObject implements NSCopying {

	static alloc(): MDLVertexAttribute; // inherited from NSObject

	static new(): MDLVertexAttribute; // inherited from NSObject

	bufferIndex: number;

	format: MDLVertexFormat;

	initializationValue: interop.Reference<number>;

	name: string;

	offset: number;

	time: number;

	constructor(o: { name: string; format: MDLVertexFormat; offset: number; bufferIndex: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithNameFormatOffsetBufferIndex(name: string, format: MDLVertexFormat, offset: number, bufferIndex: number): this;
}

declare var MDLVertexAttributeAnisotropy: string;

declare var MDLVertexAttributeBinormal: string;

declare var MDLVertexAttributeBitangent: string;

declare var MDLVertexAttributeColor: string;

declare class MDLVertexAttributeData extends NSObject {

	static alloc(): MDLVertexAttributeData; // inherited from NSObject

	static new(): MDLVertexAttributeData; // inherited from NSObject

	bufferSize: number;

	dataStart: interop.Pointer | interop.Reference<any>;

	format: MDLVertexFormat;

	map: MDLMeshBufferMap;

	stride: number;
}

declare var MDLVertexAttributeEdgeCrease: string;

declare var MDLVertexAttributeJointIndices: string;

declare var MDLVertexAttributeJointWeights: string;

declare var MDLVertexAttributeNormal: string;

declare var MDLVertexAttributeOcclusionValue: string;

declare var MDLVertexAttributePosition: string;

declare var MDLVertexAttributeShadingBasisU: string;

declare var MDLVertexAttributeShadingBasisV: string;

declare var MDLVertexAttributeSubdivisionStencil: string;

declare var MDLVertexAttributeTangent: string;

declare var MDLVertexAttributeTextureCoordinate: string;

declare class MDLVertexBufferLayout extends NSObject implements NSCopying {

	static alloc(): MDLVertexBufferLayout; // inherited from NSObject

	static new(): MDLVertexBufferLayout; // inherited from NSObject

	stride: number;

	constructor(o: { stride: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithStride(stride: number): this;
}

declare class MDLVertexDescriptor extends NSObject implements NSCopying {

	static alloc(): MDLVertexDescriptor; // inherited from NSObject

	static new(): MDLVertexDescriptor; // inherited from NSObject

	attributes: NSMutableArray<MDLVertexAttribute>;

	layouts: NSMutableArray<MDLVertexBufferLayout>;

	constructor(o: { vertexDescriptor: MDLVertexDescriptor; });

	addOrReplaceAttribute(attribute: MDLVertexAttribute): void;

	attributeNamed(name: string): MDLVertexAttribute;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithVertexDescriptor(vertexDescriptor: MDLVertexDescriptor): this;

	removeAttributeNamed(name: string): void;

	reset(): void;

	setPackedOffsets(): void;

	setPackedStrides(): void;
}

declare const enum MDLVertexFormat {

	Invalid = 0,

	PackedBit = 4096,

	UCharBits = 65536,

	CharBits = 131072,

	UCharNormalizedBits = 196608,

	CharNormalizedBits = 262144,

	UShortBits = 327680,

	ShortBits = 393216,

	UShortNormalizedBits = 458752,

	ShortNormalizedBits = 524288,

	UIntBits = 589824,

	IntBits = 655360,

	HalfBits = 720896,

	FloatBits = 786432,

	UChar = 65537,

	UChar2 = 65538,

	UChar3 = 65539,

	UChar4 = 65540,

	Char = 131073,

	Char2 = 131074,

	Char3 = 131075,

	Char4 = 131076,

	UCharNormalized = 196609,

	UChar2Normalized = 196610,

	UChar3Normalized = 196611,

	UChar4Normalized = 196612,

	CharNormalized = 262145,

	Char2Normalized = 262146,

	Char3Normalized = 262147,

	Char4Normalized = 262148,

	UShort = 327681,

	UShort2 = 327682,

	UShort3 = 327683,

	UShort4 = 327684,

	Short = 393217,

	Short2 = 393218,

	Short3 = 393219,

	Short4 = 393220,

	UShortNormalized = 458753,

	UShort2Normalized = 458754,

	UShort3Normalized = 458755,

	UShort4Normalized = 458756,

	ShortNormalized = 524289,

	Short2Normalized = 524290,

	Short3Normalized = 524291,

	Short4Normalized = 524292,

	UInt = 589825,

	UInt2 = 589826,

	UInt3 = 589827,

	UInt4 = 589828,

	Int = 655361,

	Int2 = 655362,

	Int3 = 655363,

	Int4 = 655364,

	Half = 720897,

	Half2 = 720898,

	Half3 = 720899,

	Half4 = 720900,

	Float = 786433,

	Float2 = 786434,

	Float3 = 786435,

	Float4 = 786436,

	Int1010102Normalized = 659460,

	UInt1010102Normalized = 593924
}

declare class MDLVoxelArray extends MDLObject {

	static alloc(): MDLVoxelArray; // inherited from NSObject

	static new(): MDLVoxelArray; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLVoxelArray; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLVoxelArray; // inherited from MDLObject

	readonly boundingBox: MDLAxisAlignedBoundingBox;

	readonly count: number;

	readonly isValidSignedShellField: boolean;

	shellFieldExteriorThickness: number;

	shellFieldInteriorThickness: number;

	readonly voxelIndexExtent: MDLVoxelIndexExtent;

	constructor(o: { asset: MDLAsset; divisions: number; patchRadius: number; });

	constructor(o: { data: NSData; boundingBox: MDLAxisAlignedBoundingBox; voxelExtent: number; });

	coarseMesh(): MDLMesh;

	coarseMeshUsingAllocator(allocator: MDLMeshBufferAllocator): MDLMesh;

	convertToSignedShellField(): void;

	differenceWithVoxels(voxels: MDLVoxelArray): void;

	indexOfSpatialLocation(location: interop.Reference<number>): interop.Reference<number>;

	initWithAssetDivisionsPatchRadius(asset: MDLAsset, divisions: number, patchRadius: number): this;

	initWithDataBoundingBoxVoxelExtent(voxelData: NSData, boundingBox: MDLAxisAlignedBoundingBox, voxelExtent: number): this;

	intersectWithVoxels(voxels: MDLVoxelArray): void;

	meshUsingAllocator(allocator: MDLMeshBufferAllocator): MDLMesh;

	setVoxelAtIndex(index: interop.Reference<number>): void;

	setVoxelsForMeshDivisionsPatchRadius(mesh: MDLMesh, divisions: number, patchRadius: number): void;

	spatialLocationOfIndex(index: interop.Reference<number>): interop.Reference<number>;

	unionWithVoxels(voxels: MDLVoxelArray): void;

	voxelBoundingBoxAtIndex(index: interop.Reference<number>): MDLAxisAlignedBoundingBox;

	voxelExistsAtIndexAllowAnyXAllowAnyYAllowAnyZAllowAnyShell(index: interop.Reference<number>, allowAnyX: boolean, allowAnyY: boolean, allowAnyZ: boolean, allowAnyShell: boolean): boolean;

	voxelIndices(): NSData;

	voxelsWithinExtent(extent: MDLVoxelIndexExtent): NSData;
}

interface MDLVoxelIndexExtent {
	minimumExtent: interop.Reference<number>;
	maximumExtent: interop.Reference<number>;
}
declare var MDLVoxelIndexExtent: interop.StructType<MDLVoxelIndexExtent>;

declare var kUTType3dObject: string;

declare var kUTTypeAlembic: string;

declare var kUTTypePolygon: string;

declare var kUTTypeStereolithography: string;

declare var kUTTypeUniversalSceneDescription: string;
