
declare class MDLAreaLight extends MDLPhysicallyPlausibleLight {

	static alloc(): MDLAreaLight; // inherited from NSObject

	static lightWithSCNLight(scnLight: SCNLight): MDLAreaLight; // inherited from MDLLight

	static new(): MDLAreaLight; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLAreaLight; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLAreaLight; // inherited from MDLObject

	areaRadius: number;

	aspect: number;
}

declare class MDLAsset extends NSObject implements NSCopying, NSFastEnumeration {

	static alloc(): MDLAsset; // inherited from NSObject

	static assetWithSCNScene(scnScene: SCNScene): MDLAsset;

	static assetWithSCNSceneBufferAllocator(scnScene: SCNScene, bufferAllocator: MDLMeshBufferAllocator): MDLAsset;

	static canExportFileExtension(extension: string): boolean;

	static canImportFileExtension(extension: string): boolean;

	static new(): MDLAsset; // inherited from NSObject

	static placeLightProbesWithDensityHeuristicUsingIrradianceDataSource(value: number, type: MDLProbePlacement, dataSource: MDLLightProbeIrradianceDataSource): NSArray<MDLLightProbe>;

	/* readonly */ URL: NSURL;

	/* readonly */ bufferAllocator: MDLMeshBufferAllocator;

	/* readonly */ count: number;

	endTime: number;

	frameInterval: number;

	masters: MDLObjectContainerComponent;

	startTime: number;

	/* readonly */ vertexDescriptor: MDLVertexDescriptor;
	[index: number]: MDLObject;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { bufferAllocator: MDLMeshBufferAllocator; });

	constructor(o: { URL: NSURL; });

	constructor(o: { URL: NSURL; vertexDescriptor: MDLVertexDescriptor; bufferAllocator: MDLMeshBufferAllocator; });

	constructor(o: { URL: NSURL; vertexDescriptor: MDLVertexDescriptor; bufferAllocator: MDLMeshBufferAllocator; preserveTopology: boolean; });

	addObject(object: MDLObject): void;

	childObjectsOfClass(objectClass: typeof NSObject): NSArray<MDLObject>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	exportAssetToURL(URL: NSURL): boolean;

	exportAssetToURLError(URL: NSURL): boolean;

	initWithBufferAllocator(bufferAllocator: MDLMeshBufferAllocator): this;

	initWithURL(URL: NSURL): this;

	initWithURLVertexDescriptorBufferAllocator(URL: NSURL, vertexDescriptor: MDLVertexDescriptor, bufferAllocator: MDLMeshBufferAllocator): this;

	initWithURLVertexDescriptorBufferAllocatorPreserveTopologyError(URL: NSURL, vertexDescriptor: MDLVertexDescriptor, bufferAllocator: MDLMeshBufferAllocator, preserveTopology: boolean): this;

	objectAtIndex(index: number): MDLObject;

	objectAtIndexedSubscript(index: number): MDLObject;

	removeObject(object: MDLObject): void;
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

	fStop: number;

	farVisibilityDistance: number;

	fieldOfView: number;

	fisheyeDistortion: number;

	focalLength: number;

	focusDistance: number;

	maximumCircleOfConfusion: number;

	nearVisibilityDistance: number;

	opticalVignetting: number;

	projection: MDLCameraProjection;

	sensorAspect: number;

	sensorVerticalAperture: number;

	shutterOpenInterval: number;

	worldToMetersConversionScale: number;
}

declare const enum MDLCameraProjection {

	Perspective = 0,

	Orthographic = 1
}

declare class MDLCheckerboardTexture extends MDLTexture {

	static alloc(): MDLCheckerboardTexture; // inherited from NSObject

	static new(): MDLCheckerboardTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string>): MDLCheckerboardTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string>, bundleOrNil: NSBundle): MDLCheckerboardTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLCheckerboardTexture; // inherited from MDLTexture

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLCheckerboardTexture; // inherited from MDLTexture

	color1: any;

	color2: any;

	divisions: number;
}

declare class MDLColorSwatchTexture extends MDLTexture {

	static alloc(): MDLColorSwatchTexture; // inherited from NSObject

	static new(): MDLColorSwatchTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string>): MDLColorSwatchTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string>, bundleOrNil: NSBundle): MDLColorSwatchTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLColorSwatchTexture; // inherited from MDLTexture

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLColorSwatchTexture; // inherited from MDLTexture
}

interface MDLComponent extends NSObjectProtocol {
}
declare var MDLComponent: {

	prototype: MDLComponent;
};

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

declare class MDLLight extends MDLObject {

	static alloc(): MDLLight; // inherited from NSObject

	static lightWithSCNLight(scnLight: SCNLight): MDLLight;

	static new(): MDLLight; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLLight; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLLight; // inherited from MDLObject

	colorSpace: string;

	lightType: MDLLightType;
}

declare class MDLLightProbe extends MDLLight {

	static alloc(): MDLLightProbe; // inherited from NSObject

	static lightProbeWithTextureSizeForLocationLightsToConsiderObjectsToConsiderReflectiveCubemapIrradianceCubemap(textureSize: number, transform: MDLTransform, lightsToConsider: NSArray<MDLLight>, objectsToConsider: NSArray<MDLObject>, reflectiveCubemap: MDLTexture, irradianceCubemap: MDLTexture): MDLLightProbe;

	static lightWithSCNLight(scnLight: SCNLight): MDLLightProbe; // inherited from MDLLight

	static new(): MDLLightProbe; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLLightProbe; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLLightProbe; // inherited from MDLObject

	/* readonly */ irradianceTexture: MDLTexture;

	/* readonly */ reflectiveTexture: MDLTexture;

	/* readonly */ sphericalHarmonicsCoefficients: NSData;

	/* readonly */ sphericalHarmonicsLevel: number;

	constructor(o: { reflectiveTexture: MDLTexture; irradianceTexture: MDLTexture; });

	generateSphericalHarmonicsFromIrradiance(sphericalHarmonicsLevel: number): void;

	initWithReflectiveTextureIrradianceTexture(reflectiveTexture: MDLTexture, irradianceTexture: MDLTexture): this;
}

interface MDLLightProbeIrradianceDataSource extends NSObjectProtocol {

	sphericalHarmonicsLevel?: number;
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

	/* readonly */ count: number;

	materialFace: MDLMaterialFace;

	/* readonly */ scatteringFunction: MDLScatteringFunction;

	name: string; // inherited from MDLNamed
	[index: number]: MDLMaterialProperty;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { name: string; scatteringFunction: MDLScatteringFunction; });

	initWithNameScatteringFunction(name: string, scatteringFunction: MDLScatteringFunction): this;

	objectAtIndexedSubscript(idx: number): MDLMaterialProperty;

	objectForKeyedSubscript(name: string): MDLMaterialProperty;

	propertyNamed(name: string): MDLMaterialProperty;

	propertyWithSemantic(semantic: MDLMaterialSemantic): MDLMaterialProperty;

	removeAllProperties(): void;

	removeProperty(property: MDLMaterialProperty): void;

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

	floatValue: number;

	luminance: number;

	semantic: MDLMaterialSemantic;

	stringValue: string;

	textureSamplerValue: MDLTextureSampler;

	/* readonly */ type: MDLMaterialPropertyType;

	name: string; // inherited from MDLNamed

	constructor(o: { name: string; semantic: MDLMaterialSemantic; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; color: any; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; float: number; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; string: string; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; textureSampler: MDLTextureSampler; });

	constructor(o: { name: string; semantic: MDLMaterialSemantic; URL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithNameSemantic(name: string, semantic: MDLMaterialSemantic): this;

	initWithNameSemanticColor(name: string, semantic: MDLMaterialSemantic, color: any): this;

	initWithNameSemanticFloat(name: string, semantic: MDLMaterialSemantic, value: number): this;

	initWithNameSemanticString(name: string, semantic: MDLMaterialSemantic, string: string): this;

	initWithNameSemanticTextureSampler(name: string, semantic: MDLMaterialSemantic, textureSampler: MDLTextureSampler): this;

	initWithNameSemanticURL(name: string, semantic: MDLMaterialSemantic, URL: NSURL): this;

	setProperties(property: MDLMaterialProperty): void;
}

declare class MDLMaterialPropertyConnection extends NSObject implements MDLNamed {

	static alloc(): MDLMaterialPropertyConnection; // inherited from NSObject

	static new(): MDLMaterialPropertyConnection; // inherited from NSObject

	/* readonly */ input: MDLMaterialProperty;

	/* readonly */ output: MDLMaterialProperty;

	name: string; // inherited from MDLNamed

	constructor(o: { output: MDLMaterialProperty; input: MDLMaterialProperty; });

	initWithOutputInput(output: MDLMaterialProperty, input: MDLMaterialProperty): this;
}

declare class MDLMaterialPropertyGraph extends MDLMaterialPropertyNode {

	static alloc(): MDLMaterialPropertyGraph; // inherited from NSObject

	static new(): MDLMaterialPropertyGraph; // inherited from NSObject

	/* readonly */ connections: NSArray<MDLMaterialPropertyConnection>;

	/* readonly */ nodes: NSArray<MDLMaterialPropertyNode>;

	constructor(o: { nodes: NSArray<MDLMaterialPropertyNode>; connections: NSArray<MDLMaterialPropertyConnection>; });

	evaluate(): void;

	initWithNodesConnections(nodes: NSArray<MDLMaterialPropertyNode>, connections: NSArray<MDLMaterialPropertyConnection>): this;
}

declare class MDLMaterialPropertyNode extends NSObject implements MDLNamed {

	static alloc(): MDLMaterialPropertyNode; // inherited from NSObject

	static new(): MDLMaterialPropertyNode; // inherited from NSObject

	evaluationFunction: (p1: MDLMaterialPropertyNode) => void;

	/* readonly */ inputs: NSArray<MDLMaterialProperty>;

	/* readonly */ outputs: NSArray<MDLMaterialProperty>;

	name: string; // inherited from MDLNamed

	constructor(o: { inputs: NSArray<MDLMaterialProperty>; outputs: NSArray<MDLMaterialProperty>; evaluationFunction: (p1: MDLMaterialPropertyNode) => void; });

	initWithInputsOutputsEvaluationFunction(inputs: NSArray<MDLMaterialProperty>, outputs: NSArray<MDLMaterialProperty>, _function: (p1: MDLMaterialPropertyNode) => void): this;
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

declare class MDLMesh extends MDLObject {

	static alloc(): MDLMesh; // inherited from NSObject

	static meshWithSCNGeometry(scnGeometry: SCNGeometry): MDLMesh;

	static meshWithSCNGeometryBufferAllocator(scnGeometry: SCNGeometry, bufferAllocator: MDLMeshBufferAllocator): MDLMesh;

	static new(): MDLMesh; // inherited from NSObject

	static newIcosahedronWithRadiusInwardNormalsAllocator(radius: number, inwardNormals: boolean, allocator: MDLMeshBufferAllocator): MDLMesh;

	static newSubdividedMeshSubmeshIndexSubdivisionLevels(mesh: MDLMesh, submeshIndex: number, subdivisionLevels: number): MDLMesh;

	static objectWithSCNNode(scnNode: SCNNode): MDLMesh; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLMesh; // inherited from MDLObject

	/* readonly */ allocator: MDLMeshBufferAllocator;

	submeshes: NSMutableArray<MDLSubmesh>;

	/* readonly */ vertexBuffers: NSArray<MDLMeshBuffer>;

	vertexCount: number;

	vertexDescriptor: MDLVertexDescriptor;

	constructor(o: { meshBySubdividingMesh: MDLMesh; submeshIndex: number; subdivisionLevels: number; allocator: MDLMeshBufferAllocator; });

	constructor(o: { bufferAllocator: MDLMeshBufferAllocator; });

	constructor(o: { vertexBuffer: MDLMeshBuffer; vertexCount: number; descriptor: MDLVertexDescriptor; submeshes: NSArray<MDLSubmesh>; });

	constructor(o: { vertexBuffers: NSArray<MDLMeshBuffer>; vertexCount: number; descriptor: MDLVertexDescriptor; submeshes: NSArray<MDLSubmesh>; });

	addAttributeWithNameFormat(name: string, format: MDLVertexFormat): void;

	addAttributeWithNameFormatTypeDataStride(name: string, format: MDLVertexFormat, type: string, data: NSData, stride: number): void;

	addAttributeWithNameFormatTypeDataStrideTime(name: string, format: MDLVertexFormat, type: string, data: NSData, stride: number, time: number): void;

	addNormalsWithAttributeNamedCreaseThreshold(attributeName: string, creaseThreshold: number): void;

	addTangentBasisForTextureCoordinateAttributeNamedNormalAttributeNamedTangentAttributeNamed(textureCoordinateAttributeName: string, normalAttributeNamed: string, tangentAttributeNamed: string): void;

	addTangentBasisForTextureCoordinateAttributeNamedTangentAttributeNamedBitangentAttributeNamed(textureCoordinateAttributeName: string, tangentAttributeNamed: string, bitangentAttributeName: string): void;

	addUnwrappedTextureCoordinatesForAttributeNamed(textureCoordinateAttributeName: string): void;

	generateAmbientOcclusionTextureWithQualityAttenuationFactorObjectsToConsiderVertexAttributeNamedMaterialPropertyNamed(bakeQuality: number, attenuationFactor: number, objectsToConsider: NSArray<MDLObject>, vertexAttributeName: string, materialPropertyName: string): boolean;

	generateAmbientOcclusionVertexColorsWithQualityAttenuationFactorObjectsToConsiderVertexAttributeNamed(bakeQuality: number, attenuationFactor: number, objectsToConsider: NSArray<MDLObject>, vertexAttributeName: string): boolean;

	generateAmbientOcclusionVertexColorsWithRaysPerSampleAttenuationFactorObjectsToConsiderVertexAttributeNamed(raysPerSample: number, attenuationFactor: number, objectsToConsider: NSArray<MDLObject>, vertexAttributeName: string): boolean;

	generateLightMapTextureWithQualityLightsToConsiderObjectsToConsiderVertexAttributeNamedMaterialPropertyNamed(bakeQuality: number, lightsToConsider: NSArray<MDLLight>, objectsToConsider: NSArray<MDLObject>, vertexAttributeName: string, materialPropertyName: string): boolean;

	generateLightMapVertexColorsWithLightsToConsiderObjectsToConsiderVertexAttributeNamed(lightsToConsider: NSArray<MDLLight>, objectsToConsider: NSArray<MDLObject>, vertexAttributeName: string): boolean;

	initMeshBySubdividingMeshSubmeshIndexSubdivisionLevelsAllocator(mesh: MDLMesh, submeshIndex: number, subdivisionLevels: number, allocator: MDLMeshBufferAllocator): this;

	initWithBufferAllocator(bufferAllocator: MDLMeshBufferAllocator): this;

	initWithVertexBufferVertexCountDescriptorSubmeshes(vertexBuffer: MDLMeshBuffer, vertexCount: number, descriptor: MDLVertexDescriptor, submeshes: NSArray<MDLSubmesh>): this;

	initWithVertexBuffersVertexCountDescriptorSubmeshes(vertexBuffers: NSArray<MDLMeshBuffer>, vertexCount: number, descriptor: MDLVertexDescriptor, submeshes: NSArray<MDLSubmesh>): this;

	makeVerticesUnique(): void;

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

	newZoneForBuffersWithSizeAndType(sizes: NSArray<number>, types: NSArray<number>): MDLMeshBufferZone;
}
declare var MDLMeshBufferAllocator: {

	prototype: MDLMeshBufferAllocator;
};

declare class MDLMeshBufferData extends NSObject implements MDLMeshBuffer {

	static alloc(): MDLMeshBufferData; // inherited from NSObject

	static new(): MDLMeshBufferData; // inherited from NSObject

	/* readonly */ data: NSData;

	/* readonly */ allocator: MDLMeshBufferAllocator; // inherited from MDLMeshBuffer

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	/* readonly */ length: number; // inherited from MDLMeshBuffer

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */ type: MDLMeshBufferType; // inherited from MDLMeshBuffer

	/* readonly */  // inherited from MDLMeshBuffer

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

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */  // inherited from NSObjectProtocol

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

	newZoneForBuffersWithSizeAndType(sizes: NSArray<number>, types: NSArray<number>): MDLMeshBufferZone;

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

	/* readonly */ bytes: interop.Pointer | interop.Reference<any>;

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

	/* readonly */ allocator: MDLMeshBufferAllocator; // inherited from MDLMeshBufferZone

	/* readonly */ capacity: number; // inherited from MDLMeshBufferZone

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */  // inherited from NSObjectProtocol

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

	static new(): MDLNoiseTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string>): MDLNoiseTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string>, bundleOrNil: NSBundle): MDLNoiseTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLNoiseTexture; // inherited from MDLTexture

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLNoiseTexture; // inherited from MDLTexture
}

declare class MDLNormalMapTexture extends MDLTexture {

	static alloc(): MDLNormalMapTexture; // inherited from NSObject

	static new(): MDLNormalMapTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string>): MDLNormalMapTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string>, bundleOrNil: NSBundle): MDLNormalMapTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLNormalMapTexture; // inherited from MDLTexture

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

	hidden: boolean;

	instance: MDLObject;

	parent: MDLObject;

	/* readonly */ path: string;

	transform: MDLTransformComponent;

	name: string; // inherited from MDLNamed

	addChild(child: MDLObject): void;

	componentConformingToProtocol(protocol: any /* Protocol */): MDLComponent;

	objectAtPath(path: string): MDLObject;

	setComponentForProtocol(component: MDLComponent, protocol: any /* Protocol */): void;
}

declare class MDLObjectContainer extends NSObject implements MDLObjectContainerComponent {

	static alloc(): MDLObjectContainer; // inherited from NSObject

	static new(): MDLObjectContainer; // inherited from NSObject

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	/* readonly */ objects: NSArray<MDLObject>; // inherited from MDLObjectContainerComponent

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */  // inherited from NSObjectProtocol
	[Symbol.iterator](): Iterator<any>;

	addObject(object: MDLObject): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeObject(object: MDLObject): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

interface MDLObjectContainerComponent extends MDLComponent, NSFastEnumeration {

	objects: NSArray<MDLObject>;

	addObject(object: MDLObject): void;

	removeObject(object: MDLObject): void;
}
declare var MDLObjectContainerComponent: {

	prototype: MDLObjectContainerComponent;
};

declare class MDLPhotometricLight extends MDLPhysicallyPlausibleLight {

	static alloc(): MDLPhotometricLight; // inherited from NSObject

	static lightWithSCNLight(scnLight: SCNLight): MDLPhotometricLight; // inherited from MDLLight

	static new(): MDLPhotometricLight; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLPhotometricLight; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLPhotometricLight; // inherited from MDLObject

	/* readonly */ lightCubeMap: MDLTexture;

	/* readonly */ sphericalHarmonicsCoefficients: NSData;

	/* readonly */ sphericalHarmonicsLevel: number;

	constructor(o: { IESProfile: NSURL; });

	generateCubemapFromLight(textureSize: number): void;

	generateSphericalHarmonicsFromLight(sphericalHarmonicsLevel: number): void;

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

	/* readonly */ anisotropic: MDLMaterialProperty;

	/* readonly */ anisotropicRotation: MDLMaterialProperty;

	/* readonly */ clearcoat: MDLMaterialProperty;

	/* readonly */ clearcoatGloss: MDLMaterialProperty;

	/* readonly */ metallic: MDLMaterialProperty;

	/* readonly */ roughness: MDLMaterialProperty;

	/* readonly */ sheen: MDLMaterialProperty;

	/* readonly */ sheenTint: MDLMaterialProperty;

	/* readonly */ specularAmount: MDLMaterialProperty;

	/* readonly */ specularTint: MDLMaterialProperty;

	/* readonly */ subsurface: MDLMaterialProperty;

	/* readonly */ version: number;
}

declare const enum MDLProbePlacement {

	UniformGrid = 0,

	IrradianceDistribution = 1
}

declare class MDLScatteringFunction extends NSObject implements MDLNamed {

	static alloc(): MDLScatteringFunction; // inherited from NSObject

	static new(): MDLScatteringFunction; // inherited from NSObject

	/* readonly */ ambientOcclusion: MDLMaterialProperty;

	/* readonly */ ambientOcclusionScale: MDLMaterialProperty;

	/* readonly */ baseColor: MDLMaterialProperty;

	/* readonly */ emission: MDLMaterialProperty;

	/* readonly */ interfaceIndexOfRefraction: MDLMaterialProperty;

	/* readonly */ materialIndexOfRefraction: MDLMaterialProperty;

	/* readonly */ normal: MDLMaterialProperty;

	/* readonly */ specular: MDLMaterialProperty;

	name: string; // inherited from MDLNamed
}

declare class MDLSkyCubeTexture extends MDLTexture {

	static alloc(): MDLSkyCubeTexture; // inherited from NSObject

	static new(): MDLSkyCubeTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string>): MDLSkyCubeTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string>, bundleOrNil: NSBundle): MDLSkyCubeTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLSkyCubeTexture; // inherited from MDLTexture

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLSkyCubeTexture; // inherited from MDLTexture

	brightness: number;

	contrast: number;

	exposure: number;

	gamma: number;

	groundAlbedo: number;

	groundColor: any;

	horizonElevation: number;

	saturation: number;

	sunElevation: number;

	turbidity: number;

	upperAtmosphereScattering: number;

	updateTexture(): void;
}

declare class MDLStereoscopicCamera extends MDLCamera {

	static alloc(): MDLStereoscopicCamera; // inherited from NSObject

	static cameraWithSCNCamera(scnCamera: SCNCamera): MDLStereoscopicCamera; // inherited from MDLCamera

	static new(): MDLStereoscopicCamera; // inherited from NSObject

	static objectWithSCNNode(scnNode: SCNNode): MDLStereoscopicCamera; // inherited from MDLObject

	static objectWithSCNNodeBufferAllocator(scnNode: SCNNode, bufferAllocator: MDLMeshBufferAllocator): MDLStereoscopicCamera; // inherited from MDLObject

	interPupillaryDistance: number;

	leftVergence: number;

	overlap: number;

	rightVergence: number;
}

declare class MDLSubmesh extends NSObject implements MDLNamed {

	static alloc(): MDLSubmesh; // inherited from NSObject

	static new(): MDLSubmesh; // inherited from NSObject

	static submeshWithSCNGeometryElement(scnGeometryElement: SCNGeometryElement): MDLSubmesh;

	static submeshWithSCNGeometryElementBufferAllocator(scnGeometryElement: SCNGeometryElement, bufferAllocator: MDLMeshBufferAllocator): MDLSubmesh;

	/* readonly */ geometryType: MDLGeometryType;

	/* readonly */ indexBuffer: MDLMeshBuffer;

	/* readonly */ indexCount: number;

	/* readonly */ indexType: MDLIndexBitDepth;

	material: MDLMaterial;

	/* readonly */ topology: MDLSubmeshTopology;

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
}

declare class MDLTexture extends NSObject implements MDLNamed {

	static alloc(): MDLTexture; // inherited from NSObject

	static new(): MDLTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string>): MDLTexture;

	static textureCubeWithImagesNamedBundle(names: NSArray<string>, bundleOrNil: NSBundle): MDLTexture;

	static textureNamed(name: string): MDLTexture;

	static textureNamedBundle(name: string, bundleOrNil: NSBundle): MDLTexture;

	/* readonly */ channelCount: number;

	/* readonly */ channelEncoding: MDLTextureChannelEncoding;

	hasAlphaValues: boolean;

	isCube: boolean;

	/* readonly */ mipLevelCount: number;

	/* readonly */ rowStride: number;

	name: string; // inherited from MDLNamed

	imageFromTexture(): any;

	texelDataWithBottomLeftOrigin(): NSData;

	texelDataWithBottomLeftOriginAtMipLevelCreate(level: number, create: boolean): NSData;

	texelDataWithTopLeftOrigin(): NSData;

	texelDataWithTopLeftOriginAtMipLevelCreate(level: number, create: boolean): NSData;

	writeToURL(URL: NSURL): boolean;

	writeToURLType(nsurl: NSURL, type: string): boolean;
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

	static new(): MDLTransform; // inherited from NSObject

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	/* readonly */ keyTimes: NSArray<number>; // inherited from MDLTransformComponent

	/* readonly */ maximumTime: number; // inherited from MDLTransformComponent

	/* readonly */ minimumTime: number; // inherited from MDLTransformComponent

	resetsTransform: boolean; // inherited from MDLTransformComponent

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */  // inherited from NSObjectProtocol

	constructor(o: { identity: void; });

	constructor(o: { transformComponent: MDLTransformComponent; });

	constructor(o: { transformComponent: MDLTransformComponent; resetsTransform: boolean; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithIdentity(): this;

	initWithTransformComponent(component: MDLTransformComponent): this;

	initWithTransformComponentResetsTransform(component: MDLTransformComponent, resetsTransform: boolean): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setIdentity(): void;
}

interface MDLTransformComponent extends MDLComponent {

	keyTimes: NSArray<number>;

	maximumTime: number;

	minimumTime: number;

	resetsTransform: boolean;
}
declare var MDLTransformComponent: {

	prototype: MDLTransformComponent;
};

declare class MDLURLTexture extends MDLTexture {

	static alloc(): MDLURLTexture; // inherited from NSObject

	static new(): MDLURLTexture; // inherited from NSObject

	static textureCubeWithImagesNamed(names: NSArray<string>): MDLURLTexture; // inherited from MDLTexture

	static textureCubeWithImagesNamedBundle(names: NSArray<string>, bundleOrNil: NSBundle): MDLURLTexture; // inherited from MDLTexture

	static textureNamed(name: string): MDLURLTexture; // inherited from MDLTexture

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

	/* readonly */ count: number;

	/* readonly */ isValidSignedShellField: boolean;

	shellFieldExteriorThickness: number;

	shellFieldInteriorThickness: number;

	constructor(o: { asset: MDLAsset; divisions: number; patchRadius: number; });

	coarseMesh(): MDLMesh;

	coarseMeshUsingAllocator(allocator: MDLMeshBufferAllocator): MDLMesh;

	convertToSignedShellField(): void;

	differenceWithVoxels(voxels: MDLVoxelArray): void;

	initWithAssetDivisionsPatchRadius(asset: MDLAsset, divisions: number, patchRadius: number): this;

	intersectWithVoxels(voxels: MDLVoxelArray): void;

	meshUsingAllocator(allocator: MDLMeshBufferAllocator): MDLMesh;

	setVoxelsForMeshDivisionsPatchRadius(mesh: MDLMesh, divisions: number, patchRadius: number): void;

	unionWithVoxels(voxels: MDLVoxelArray): void;

	voxelIndices(): NSData;
}

declare var kUTType3dObject: string;

declare var kUTTypeAlembic: string;

declare var kUTTypePolygon: string;

declare var kUTTypeStereolithography: string;

declare var kUTTypeUniversalSceneDescription: string;
