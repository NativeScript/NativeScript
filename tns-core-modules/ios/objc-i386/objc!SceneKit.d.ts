
declare class SCNAction extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNAction; // inherited from NSObject

	static customActionWithDurationActionBlock(seconds: number, block: (p1: SCNNode, p2: number) => void): SCNAction;

	static fadeInWithDuration(sec: number): SCNAction;

	static fadeOpacityByDuration(factor: number, sec: number): SCNAction;

	static fadeOpacityToDuration(opacity: number, sec: number): SCNAction;

	static fadeOutWithDuration(sec: number): SCNAction;

	static group(actions: NSArray<SCNAction>): SCNAction;

	static hide(): SCNAction;

	static javaScriptActionWithScriptDuration(script: string, seconds: number): SCNAction;

	static moveByDuration(delta: SCNVector3, duration: number): SCNAction;

	static moveByXYZDuration(deltaX: number, deltaY: number, deltaZ: number, duration: number): SCNAction;

	static moveToDuration(location: SCNVector3, duration: number): SCNAction;

	static new(): SCNAction; // inherited from NSObject

	static playAudioSourceWaitForCompletion(source: SCNAudioSource, wait: boolean): SCNAction;

	static removeFromParentNode(): SCNAction;

	static repeatActionCount(action: SCNAction, count: number): SCNAction;

	static repeatActionForever(action: SCNAction): SCNAction;

	static rotateByAngleAroundAxisDuration(angle: number, axis: SCNVector3, duration: number): SCNAction;

	static rotateByXYZDuration(xAngle: number, yAngle: number, zAngle: number, duration: number): SCNAction;

	static rotateToAxisAngleDuration(axisAngle: SCNVector4, duration: number): SCNAction;

	static rotateToXYZDuration(xAngle: number, yAngle: number, zAngle: number, duration: number): SCNAction;

	static rotateToXYZDurationShortestUnitArc(xAngle: number, yAngle: number, zAngle: number, duration: number, shortestUnitArc: boolean): SCNAction;

	static runBlock(block: (p1: SCNNode) => void): SCNAction;

	static runBlockQueue(block: (p1: SCNNode) => void, queue: NSObject): SCNAction;

	static scaleByDuration(scale: number, sec: number): SCNAction;

	static scaleToDuration(scale: number, sec: number): SCNAction;

	static sequence(actions: NSArray<SCNAction>): SCNAction;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	static unhide(): SCNAction;

	static waitForDuration(sec: number): SCNAction;

	static waitForDurationWithRange(sec: number, durationRange: number): SCNAction;

	duration: number;

	speed: number;

	timingFunction: (p1: number) => number;

	timingMode: SCNActionTimingMode;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	reversedAction(): SCNAction;

	self(): SCNAction; // inherited from NSObjectProtocol
}

declare const enum SCNActionTimingMode {

	Linear = 0,

	EaseIn = 1,

	EaseOut = 2,

	EaseInEaseOut = 3
}

interface SCNActionable extends NSObjectProtocol {

	actionKeys: NSArray<string>;

	hasActions: boolean;

	actionForKey(key: string): SCNAction;

	removeActionForKey(key: string): void;

	removeAllActions(): void;

	runAction(action: SCNAction): void;

	runActionCompletionHandler(action: SCNAction, block: () => void): void;

	runActionForKey(action: SCNAction, key: string): void;

	runActionForKeyCompletionHandler(action: SCNAction, key: string, block: () => void): void;
}
declare var SCNActionable: {

	prototype: SCNActionable;
};

interface SCNAnimatable extends NSObjectProtocol {

	animationKeys: NSArray<string>;

	addAnimationForKey(animation: CAAnimation, key: string): void;

	animationForKey(key: string): CAAnimation;

	isAnimationForKeyPaused(key: string): boolean;

	pauseAnimationForKey(key: string): void;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	resumeAnimationForKey(key: string): void;
}
declare var SCNAnimatable: {

	prototype: SCNAnimatable;
};

declare class SCNAnimationEvent extends NSObject {

	static alloc(): SCNAnimationEvent; // inherited from NSObject

	static animationEventWithKeyTimeBlock(time: number, eventBlock: (p1: CAAnimation, p2: any, p3: boolean) => void): SCNAnimationEvent;

	static new(): SCNAnimationEvent; // inherited from NSObject

	constructor(); // inherited from NSObject

	self(): SCNAnimationEvent; // inherited from NSObjectProtocol
}

declare const enum SCNAntialiasingMode {

	None = 0,

	Multisampling2X = 1,

	Multisampling4X = 2
}

declare class SCNAudioPlayer extends NSObject {

	static alloc(): SCNAudioPlayer; // inherited from NSObject

	static audioPlayerWithAVAudioNode(audioNode: AVAudioNode): SCNAudioPlayer;

	static audioPlayerWithSource(source: SCNAudioSource): SCNAudioPlayer;

	static new(): SCNAudioPlayer; // inherited from NSObject

	/* readonly */ audioNode: AVAudioNode;

	/* readonly */ audioSource: SCNAudioSource;

	didFinishPlayback: () => void;

	willStartPlayback: () => void;

	constructor(); // inherited from NSObject

	constructor(o: { AVAudioNode: AVAudioNode; });

	constructor(o: { source: SCNAudioSource; });

	self(): SCNAudioPlayer; // inherited from NSObjectProtocol
}

declare class SCNAudioSource extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNAudioSource; // inherited from NSObject

	static audioSourceNamed(fileName: string): SCNAudioSource;

	static new(): SCNAudioSource; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	loops: boolean;

	positional: boolean;

	rate: number;

	reverbBlend: number;

	shouldStream: boolean;

	volume: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { fileNamed: string; });

	constructor(o: { URL: NSURL; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	load(): void;

	self(): SCNAudioSource; // inherited from NSObjectProtocol
}

declare const enum SCNBillboardAxis {

	X = 1,

	Y = 2,

	Z = 4,

	All = 7
}

declare class SCNBillboardConstraint extends SCNConstraint {

	static billboardConstraint(): SCNBillboardConstraint;

	freeAxes: SCNBillboardAxis;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNBillboardConstraint; // inherited from NSObjectProtocol
}

declare const enum SCNBlendMode {

	Alpha = 0,

	Add = 1,

	Subtract = 2,

	Multiply = 3,

	Screen = 4,

	Replace = 5
}

interface SCNBoundingVolume extends NSObjectProtocol {

	getBoundingBoxMinMax(min: interop.Reference<SCNVector3>, max: interop.Reference<SCNVector3>): boolean;

	getBoundingSphereCenterRadius(center: interop.Reference<SCNVector3>, radius: interop.Reference<number>): boolean;

	setBoundingBoxMinMax(min: interop.Reference<SCNVector3>, max: interop.Reference<SCNVector3>): void;
}
declare var SCNBoundingVolume: {

	prototype: SCNBoundingVolume;
};

declare class SCNBox extends SCNGeometry {

	static boxWithWidthHeightLengthChamferRadius(width: number, height: number, length: number, chamferRadius: number): SCNBox;

	static geometry(): SCNBox; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNBox; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNBox; // inherited from SCNGeometry

	chamferRadius: number;

	chamferSegmentCount: number;

	height: number;

	heightSegmentCount: number;

	length: number;

	lengthSegmentCount: number;

	width: number;

	widthSegmentCount: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNBox; // inherited from NSObjectProtocol
}

declare const enum SCNBufferFrequency {

	PerFrame = 0,

	PerNode = 1,

	PerShadable = 2
}

interface SCNBufferStream extends NSObjectProtocol {

	writeBytesLength(bytes: interop.Pointer, length: number): void;
}
declare var SCNBufferStream: {

	prototype: SCNBufferStream;
};

declare class SCNCamera extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable, SCNTechniqueSupport {

	static alloc(): SCNCamera; // inherited from NSObject

	static camera(): SCNCamera;

	static cameraWithMDLCamera(mdlCamera: MDLCamera): SCNCamera;

	static new(): SCNCamera; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	aperture: number;

	automaticallyAdjustsZRange: boolean;

	categoryBitMask: number;

	focalBlurRadius: number;

	focalDistance: number;

	focalSize: number;

	name: string;

	orthographicScale: number;

	usesOrthographicProjection: boolean;

	xFov: number;

	yFov: number;

	zFar: number;

	zNear: number;

	/* readonly */ animationKeys: NSArray<string>; // inherited from SCNAnimatable

	technique: SCNTechnique; // inherited from SCNTechniqueSupport

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: CAAnimation, key: string): void; // inherited from SCNAnimatable

	animationForKey(key: string): CAAnimation; // inherited from SCNAnimatable

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	isAnimationForKeyPaused(key: string): boolean; // inherited from SCNAnimatable

	pauseAnimationForKey(key: string): void; // inherited from SCNAnimatable

	projectionTransform(): SCNMatrix4;

	removeAllAnimations(): void; // inherited from SCNAnimatable

	removeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void; // inherited from SCNAnimatable

	resumeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	self(): SCNCamera; // inherited from NSObjectProtocol

	setProjectionTransform(projectionTransform: SCNMatrix4): void;
}

declare class SCNCapsule extends SCNGeometry {

	static capsuleWithCapRadiusHeight(capRadius: number, height: number): SCNCapsule;

	static geometry(): SCNCapsule; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNCapsule; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNCapsule; // inherited from SCNGeometry

	capRadius: number;

	capSegmentCount: number;

	height: number;

	heightSegmentCount: number;

	radialSegmentCount: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNCapsule; // inherited from NSObjectProtocol
}

declare const enum SCNChamferMode {

	Both = 0,

	Front = 1,

	Back = 2
}

declare class SCNCone extends SCNGeometry {

	static coneWithTopRadiusBottomRadiusHeight(topRadius: number, bottomRadius: number, height: number): SCNCone;

	static geometry(): SCNCone; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNCone; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNCone; // inherited from SCNGeometry

	bottomRadius: number;

	height: number;

	heightSegmentCount: number;

	radialSegmentCount: number;

	topRadius: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNCone; // inherited from NSObjectProtocol
}

declare var SCNConsistencyElementIDErrorKey: string;

declare var SCNConsistencyElementTypeErrorKey: string;

declare var SCNConsistencyLineNumberErrorKey: string;

declare class SCNConstraint extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable {

	static alloc(): SCNConstraint; // inherited from NSObject

	static new(): SCNConstraint; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	influenceFactor: number;

	/* readonly */ animationKeys: NSArray<string>; // inherited from SCNAnimatable

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: CAAnimation, key: string): void; // inherited from SCNAnimatable

	animationForKey(key: string): CAAnimation; // inherited from SCNAnimatable

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	isAnimationForKeyPaused(key: string): boolean; // inherited from SCNAnimatable

	pauseAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAllAnimations(): void; // inherited from SCNAnimatable

	removeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void; // inherited from SCNAnimatable

	resumeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	self(): SCNConstraint; // inherited from NSObjectProtocol
}

declare const enum SCNCullMode {

	Back = 0,

	Front = 1
}

declare class SCNCylinder extends SCNGeometry {

	static cylinderWithRadiusHeight(radius: number, height: number): SCNCylinder;

	static geometry(): SCNCylinder; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNCylinder; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNCylinder; // inherited from SCNGeometry

	height: number;

	heightSegmentCount: number;

	radialSegmentCount: number;

	radius: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNCylinder; // inherited from NSObjectProtocol
}

declare const enum SCNDebugOptions {

	None = 0,

	ShowPhysicsShapes = 1,

	ShowBoundingBoxes = 2,

	ShowLightInfluences = 4,

	ShowLightExtents = 8,

	ShowPhysicsFields = 16,

	ShowWireframe = 32
}

declare var SCNDetailedErrorsKey: string;

declare var SCNErrorDomain: string;

declare function SCNExportJavaScriptModule(context: JSContext): void;

declare const enum SCNFilterMode {

	None = 0,

	Nearest = 1,

	Linear = 2
}

declare class SCNFloor extends SCNGeometry {

	static floor(): SCNFloor;

	static geometry(): SCNFloor; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNFloor; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNFloor; // inherited from SCNGeometry

	reflectionFalloffEnd: number;

	reflectionFalloffStart: number;

	reflectionResolutionScaleFactor: number;

	reflectivity: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNFloor; // inherited from NSObjectProtocol
}

declare class SCNGeometry extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable, SCNBoundingVolume, SCNShadable {

	static alloc(): SCNGeometry; // inherited from NSObject

	static geometry(): SCNGeometry;

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNGeometry;

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNGeometry;

	static new(): SCNGeometry; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	edgeCreasesElement: SCNGeometryElement;

	edgeCreasesSource: SCNGeometrySource;

	firstMaterial: SCNMaterial;

	/* readonly */ geometryElementCount: number;

	/* readonly */ geometryElements: NSArray<SCNGeometryElement>;

	/* readonly */ geometrySources: NSArray<SCNGeometrySource>;

	levelsOfDetail: NSArray<SCNLevelOfDetail>;

	materials: NSArray<SCNMaterial>;

	name: string;

	subdivisionLevel: number;

	/* readonly */ animationKeys: NSArray<string>; // inherited from SCNAnimatable

	program: SCNProgram; // inherited from SCNShadable

	shaderModifiers: NSDictionary<string, string>; // inherited from SCNShadable

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: CAAnimation, key: string): void; // inherited from SCNAnimatable

	animationForKey(key: string): CAAnimation; // inherited from SCNAnimatable

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	geometryElementAtIndex(elementIndex: number): SCNGeometryElement;

	geometrySourcesForSemantic(semantic: string): NSArray<SCNGeometrySource>;

	getBoundingBoxMinMax(min: interop.Reference<SCNVector3>, max: interop.Reference<SCNVector3>): boolean; // inherited from SCNBoundingVolume

	getBoundingSphereCenterRadius(center: interop.Reference<SCNVector3>, radius: interop.Reference<number>): boolean; // inherited from SCNBoundingVolume

	handleBindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void; // inherited from SCNShadable

	handleUnbindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void; // inherited from SCNShadable

	insertMaterialAtIndex(material: SCNMaterial, index: number): void;

	isAnimationForKeyPaused(key: string): boolean; // inherited from SCNAnimatable

	materialWithName(name: string): SCNMaterial;

	pauseAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAllAnimations(): void; // inherited from SCNAnimatable

	removeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void; // inherited from SCNAnimatable

	removeMaterialAtIndex(index: number): void;

	replaceMaterialAtIndexWithMaterial(index: number, material: SCNMaterial): void;

	resumeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	self(): SCNGeometry; // inherited from NSObjectProtocol

	setBoundingBoxMinMax(min: interop.Reference<SCNVector3>, max: interop.Reference<SCNVector3>): void; // inherited from SCNBoundingVolume
}

declare class SCNGeometryElement extends NSObject implements NSSecureCoding {

	static alloc(): SCNGeometryElement; // inherited from NSObject

	static geometryElementWithDataPrimitiveTypePrimitiveCountBytesPerIndex(data: NSData, primitiveType: SCNGeometryPrimitiveType, primitiveCount: number, bytesPerIndex: number): SCNGeometryElement;

	static geometryElementWithMDLSubmesh(mdlSubMesh: MDLSubmesh): SCNGeometryElement;

	static new(): SCNGeometryElement; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ bytesPerIndex: number;

	/* readonly */ data: NSData;

	/* readonly */ primitiveCount: number;

	/* readonly */ primitiveType: SCNGeometryPrimitiveType;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SCNGeometryElement; // inherited from NSObjectProtocol
}

declare const enum SCNGeometryPrimitiveType {

	Triangles = 0,

	TriangleStrip = 1,

	Line = 2,

	Point = 3
}

declare class SCNGeometrySource extends NSObject implements NSSecureCoding {

	static alloc(): SCNGeometrySource; // inherited from NSObject

	static geometrySourceWithDataSemanticVectorCountFloatComponentsComponentsPerVectorBytesPerComponentDataOffsetDataStride(data: NSData, semantic: string, vectorCount: number, floatComponents: boolean, componentsPerVector: number, bytesPerComponent: number, offset: number, stride: number): SCNGeometrySource;

	static geometrySourceWithNormalsCount(normals: interop.Reference<SCNVector3>, count: number): SCNGeometrySource;

	static geometrySourceWithTextureCoordinatesCount(texcoord: interop.Reference<CGPoint>, count: number): SCNGeometrySource;

	static geometrySourceWithVerticesCount(vertices: interop.Reference<SCNVector3>, count: number): SCNGeometrySource;

	static new(): SCNGeometrySource; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ bytesPerComponent: number;

	/* readonly */ componentsPerVector: number;

	/* readonly */ data: NSData;

	/* readonly */ dataOffset: number;

	/* readonly */ dataStride: number;

	/* readonly */ floatComponents: boolean;

	/* readonly */ semantic: string;

	/* readonly */ vectorCount: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SCNGeometrySource; // inherited from NSObjectProtocol
}

declare var SCNGeometrySourceSemanticBoneIndices: string;

declare var SCNGeometrySourceSemanticBoneWeights: string;

declare var SCNGeometrySourceSemanticColor: string;

declare var SCNGeometrySourceSemanticEdgeCrease: string;

declare var SCNGeometrySourceSemanticNormal: string;

declare var SCNGeometrySourceSemanticTexcoord: string;

declare var SCNGeometrySourceSemanticVertex: string;

declare var SCNGeometrySourceSemanticVertexCrease: string;

declare var SCNHitTestBackFaceCullingKey: string;

declare var SCNHitTestBoundingBoxOnlyKey: string;

declare var SCNHitTestClipToZRangeKey: string;

declare var SCNHitTestFirstFoundOnlyKey: string;

declare var SCNHitTestIgnoreChildNodesKey: string;

declare var SCNHitTestIgnoreHiddenNodesKey: string;

declare class SCNHitTestResult extends NSObject {

	static alloc(): SCNHitTestResult; // inherited from NSObject

	static new(): SCNHitTestResult; // inherited from NSObject

	/* readonly */ faceIndex: number;

	/* readonly */ geometryIndex: number;

	/* readonly */ localCoordinates: SCNVector3;

	/* readonly */ localNormal: SCNVector3;

	/* readonly */ modelTransform: SCNMatrix4;

	/* readonly */ node: SCNNode;

	/* readonly */ worldCoordinates: SCNVector3;

	/* readonly */ worldNormal: SCNVector3;

	constructor(); // inherited from NSObject

	self(): SCNHitTestResult; // inherited from NSObjectProtocol

	textureCoordinatesWithMappingChannel(channel: number): CGPoint;
}

declare var SCNHitTestRootNodeKey: string;

declare var SCNHitTestSortResultsKey: string;

declare class SCNIKConstraint extends SCNConstraint {

	static inverseKinematicsConstraintWithChainRootNode(chainRootNode: SCNNode): SCNIKConstraint;

	/* readonly */ chainRootNode: SCNNode;

	targetPosition: SCNVector3;

	constructor(o: { chainRootNode: SCNNode; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	maxAllowedRotationAngleForJoint(node: SCNNode): number;

	self(): SCNIKConstraint; // inherited from NSObjectProtocol

	setMaxAllowedRotationAngleForJoint(angle: number, node: SCNNode): void;
}

declare class SCNLevelOfDetail extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNLevelOfDetail; // inherited from NSObject

	static levelOfDetailWithGeometryScreenSpaceRadius(geometry: SCNGeometry, radius: number): SCNLevelOfDetail;

	static levelOfDetailWithGeometryWorldSpaceDistance(geometry: SCNGeometry, distance: number): SCNLevelOfDetail;

	static new(): SCNLevelOfDetail; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ geometry: SCNGeometry;

	/* readonly */ screenSpaceRadius: number;

	/* readonly */ worldSpaceDistance: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SCNLevelOfDetail; // inherited from NSObjectProtocol
}

declare class SCNLight extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable, SCNTechniqueSupport {

	static alloc(): SCNLight; // inherited from NSObject

	static light(): SCNLight;

	static lightWithMDLLight(mdlLight: MDLLight): SCNLight;

	static new(): SCNLight; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	attenuationEndDistance: number;

	attenuationFalloffExponent: number;

	attenuationStartDistance: number;

	castsShadow: boolean;

	categoryBitMask: number;

	color: any;

	/* readonly */ gobo: SCNMaterialProperty;

	name: string;

	orthographicScale: number;

	shadowBias: number;

	shadowColor: any;

	shadowMapSize: CGSize;

	shadowMode: SCNShadowMode;

	shadowRadius: number;

	shadowSampleCount: number;

	spotInnerAngle: number;

	spotOuterAngle: number;

	type: string;

	zFar: number;

	zNear: number;

	/* readonly */ animationKeys: NSArray<string>; // inherited from SCNAnimatable

	technique: SCNTechnique; // inherited from SCNTechniqueSupport

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: CAAnimation, key: string): void; // inherited from SCNAnimatable

	animationForKey(key: string): CAAnimation; // inherited from SCNAnimatable

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	isAnimationForKeyPaused(key: string): boolean; // inherited from SCNAnimatable

	pauseAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAllAnimations(): void; // inherited from SCNAnimatable

	removeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void; // inherited from SCNAnimatable

	resumeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	self(): SCNLight; // inherited from NSObjectProtocol
}

declare var SCNLightTypeAmbient: string;

declare var SCNLightTypeDirectional: string;

declare var SCNLightTypeOmni: string;

declare var SCNLightTypeSpot: string;

declare var SCNLightingModelBlinn: string;

declare var SCNLightingModelConstant: string;

declare var SCNLightingModelLambert: string;

declare var SCNLightingModelPhong: string;

declare class SCNLookAtConstraint extends SCNConstraint {

	static lookAtConstraintWithTarget(target: SCNNode): SCNLookAtConstraint;

	gimbalLockEnabled: boolean;

	/* readonly */ target: SCNNode;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNLookAtConstraint; // inherited from NSObjectProtocol
}

declare class SCNMaterial extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable, SCNShadable {

	static alloc(): SCNMaterial; // inherited from NSObject

	static material(): SCNMaterial;

	static materialWithMDLMaterial(mdlMaterial: MDLMaterial): SCNMaterial;

	static new(): SCNMaterial; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ ambient: SCNMaterialProperty;

	/* readonly */ ambientOcclusion: SCNMaterialProperty;

	blendMode: SCNBlendMode;

	cullMode: SCNCullMode;

	/* readonly */ diffuse: SCNMaterialProperty;

	doubleSided: boolean;

	/* readonly */ emission: SCNMaterialProperty;

	fresnelExponent: number;

	lightingModelName: string;

	litPerPixel: boolean;

	locksAmbientWithDiffuse: boolean;

	/* readonly */ multiply: SCNMaterialProperty;

	name: string;

	/* readonly */ normal: SCNMaterialProperty;

	readsFromDepthBuffer: boolean;

	/* readonly */ reflective: SCNMaterialProperty;

	/* readonly */ selfIllumination: SCNMaterialProperty;

	shininess: number;

	/* readonly */ specular: SCNMaterialProperty;

	transparency: number;

	transparencyMode: SCNTransparencyMode;

	/* readonly */ transparent: SCNMaterialProperty;

	writesToDepthBuffer: boolean;

	/* readonly */ animationKeys: NSArray<string>; // inherited from SCNAnimatable

	program: SCNProgram; // inherited from SCNShadable

	shaderModifiers: NSDictionary<string, string>; // inherited from SCNShadable

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: CAAnimation, key: string): void; // inherited from SCNAnimatable

	animationForKey(key: string): CAAnimation; // inherited from SCNAnimatable

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	handleBindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void; // inherited from SCNShadable

	handleUnbindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void; // inherited from SCNShadable

	isAnimationForKeyPaused(key: string): boolean; // inherited from SCNAnimatable

	pauseAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAllAnimations(): void; // inherited from SCNAnimatable

	removeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void; // inherited from SCNAnimatable

	resumeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	self(): SCNMaterial; // inherited from NSObjectProtocol
}

declare class SCNMaterialProperty extends NSObject implements NSSecureCoding, SCNAnimatable {

	static alloc(): SCNMaterialProperty; // inherited from NSObject

	static materialPropertyWithContents(contents: any): SCNMaterialProperty;

	static new(): SCNMaterialProperty; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	borderColor: any;

	contents: any;

	contentsTransform: SCNMatrix4;

	intensity: number;

	magnificationFilter: SCNFilterMode;

	mappingChannel: number;

	maxAnisotropy: number;

	minificationFilter: SCNFilterMode;

	mipFilter: SCNFilterMode;

	wrapS: SCNWrapMode;

	wrapT: SCNWrapMode;

	/* readonly */ animationKeys: NSArray<string>; // inherited from SCNAnimatable

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: CAAnimation, key: string): void; // inherited from SCNAnimatable

	animationForKey(key: string): CAAnimation; // inherited from SCNAnimatable

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	isAnimationForKeyPaused(key: string): boolean; // inherited from SCNAnimatable

	pauseAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAllAnimations(): void; // inherited from SCNAnimatable

	removeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void; // inherited from SCNAnimatable

	resumeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	self(): SCNMaterialProperty; // inherited from NSObjectProtocol
}

interface SCNMatrix4 {
	m11: number;
	m12: number;
	m13: number;
	m14: number;
	m21: number;
	m22: number;
	m23: number;
	m24: number;
	m31: number;
	m32: number;
	m33: number;
	m34: number;
	m41: number;
	m42: number;
	m43: number;
	m44: number;
}
declare var SCNMatrix4: interop.StructType<SCNMatrix4>;

declare function SCNMatrix4EqualToMatrix4(matA: SCNMatrix4, matB: SCNMatrix4): boolean;

declare var SCNMatrix4Identity: SCNMatrix4;

declare function SCNMatrix4Invert(mat: SCNMatrix4): SCNMatrix4;

declare function SCNMatrix4IsIdentity(mat: SCNMatrix4): boolean;

declare function SCNMatrix4MakeRotation(angle: number, x: number, y: number, z: number): SCNMatrix4;

declare function SCNMatrix4Mult(matA: SCNMatrix4, matB: SCNMatrix4): SCNMatrix4;

declare function SCNMatrix4Rotate(mat: SCNMatrix4, angle: number, x: number, y: number, z: number): SCNMatrix4;

declare function SCNMatrix4Scale(mat: SCNMatrix4, x: number, y: number, z: number): SCNMatrix4;

declare var SCNModelTransform: string;

declare var SCNModelViewProjectionTransform: string;

declare var SCNModelViewTransform: string;

declare class SCNMorpher extends NSObject implements NSSecureCoding, SCNAnimatable {

	static alloc(): SCNMorpher; // inherited from NSObject

	static new(): SCNMorpher; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	calculationMode: SCNMorpherCalculationMode;

	targets: NSArray<SCNGeometry>;

	/* readonly */ animationKeys: NSArray<string>; // inherited from SCNAnimatable

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: CAAnimation, key: string): void; // inherited from SCNAnimatable

	animationForKey(key: string): CAAnimation; // inherited from SCNAnimatable

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	isAnimationForKeyPaused(key: string): boolean; // inherited from SCNAnimatable

	pauseAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAllAnimations(): void; // inherited from SCNAnimatable

	removeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void; // inherited from SCNAnimatable

	resumeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	self(): SCNMorpher; // inherited from NSObjectProtocol

	setWeightForTargetAtIndex(weight: number, targetIndex: number): void;

	weightForTargetAtIndex(targetIndex: number): number;
}

declare const enum SCNMorpherCalculationMode {

	Normalized = 0,

	Additive = 1
}

declare class SCNNode extends NSObject implements NSCopying, NSSecureCoding, SCNActionable, SCNAnimatable, SCNBoundingVolume {

	static alloc(): SCNNode; // inherited from NSObject

	static new(): SCNNode; // inherited from NSObject

	static node(): SCNNode;

	static nodeWithGeometry(geometry: SCNGeometry): SCNNode;

	static nodeWithMDLObject(mdlObject: MDLObject): SCNNode;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ audioPlayers: NSArray<SCNAudioPlayer>;

	camera: SCNCamera;

	castsShadow: boolean;

	categoryBitMask: number;

	/* readonly */ childNodes: NSArray<SCNNode>;

	constraints: NSArray<SCNConstraint>;

	eulerAngles: SCNVector3;

	filters: NSArray<CIFilter>;

	geometry: SCNGeometry;

	hidden: boolean;

	light: SCNLight;

	morpher: SCNMorpher;

	name: string;

	opacity: number;

	orientation: SCNVector4;

	/* readonly */ parentNode: SCNNode;

	/* readonly */ particleSystems: NSArray<SCNParticleSystem>;

	paused: boolean;

	physicsBody: SCNPhysicsBody;

	physicsField: SCNPhysicsField;

	pivot: SCNMatrix4;

	position: SCNVector3;

	/* readonly */ presentationNode: SCNNode;

	rendererDelegate: SCNNodeRendererDelegate;

	renderingOrder: number;

	rotation: SCNVector4;

	scale: SCNVector3;

	skinner: SCNSkinner;

	transform: SCNMatrix4;

	/* readonly */ worldTransform: SCNMatrix4;

	/* readonly */ actionKeys: NSArray<string>; // inherited from SCNActionable

	/* readonly */ animationKeys: NSArray<string>; // inherited from SCNAnimatable

	/* readonly */ hasActions: boolean; // inherited from SCNActionable

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	actionForKey(key: string): SCNAction; // inherited from SCNActionable

	addAnimationForKey(animation: CAAnimation, key: string): void; // inherited from SCNAnimatable

	addAudioPlayer(player: SCNAudioPlayer): void;

	addChildNode(child: SCNNode): void;

	addParticleSystem(system: SCNParticleSystem): void;

	animationForKey(key: string): CAAnimation; // inherited from SCNAnimatable

	childNodeWithNameRecursively(name: string, recursively: boolean): SCNNode;

	childNodesPassingTest(predicate: (p1: SCNNode, p2: interop.Reference<boolean>) => boolean): NSArray<SCNNode>;

	clone(): SCNNode;

	convertPositionFromNode(position: SCNVector3, node: SCNNode): SCNVector3;

	convertPositionToNode(position: SCNVector3, node: SCNNode): SCNVector3;

	convertTransformFromNode(transform: SCNMatrix4, node: SCNNode): SCNMatrix4;

	convertTransformToNode(transform: SCNMatrix4, node: SCNNode): SCNMatrix4;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	enumerateChildNodesUsingBlock(block: (p1: SCNNode, p2: interop.Reference<boolean>) => void): void;

	flattenedClone(): SCNNode;

	getBoundingBoxMinMax(min: interop.Reference<SCNVector3>, max: interop.Reference<SCNVector3>): boolean; // inherited from SCNBoundingVolume

	getBoundingSphereCenterRadius(center: interop.Reference<SCNVector3>, radius: interop.Reference<number>): boolean; // inherited from SCNBoundingVolume

	hitTestWithSegmentFromPointToPointOptions(pointA: SCNVector3, pointB: SCNVector3, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	insertChildNodeAtIndex(child: SCNNode, index: number): void;

	isAnimationForKeyPaused(key: string): boolean; // inherited from SCNAnimatable

	pauseAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeActionForKey(key: string): void; // inherited from SCNActionable

	removeAllActions(): void; // inherited from SCNActionable

	removeAllAnimations(): void; // inherited from SCNAnimatable

	removeAllAudioPlayers(): void;

	removeAllParticleSystems(): void;

	removeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void; // inherited from SCNAnimatable

	removeAudioPlayer(player: SCNAudioPlayer): void;

	removeFromParentNode(): void;

	removeParticleSystem(system: SCNParticleSystem): void;

	replaceChildNodeWith(oldChild: SCNNode, newChild: SCNNode): void;

	resumeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	runAction(action: SCNAction): void; // inherited from SCNActionable

	runActionCompletionHandler(action: SCNAction, block: () => void): void; // inherited from SCNActionable

	runActionForKey(action: SCNAction, key: string): void; // inherited from SCNActionable

	runActionForKeyCompletionHandler(action: SCNAction, key: string, block: () => void): void; // inherited from SCNActionable

	self(): SCNNode; // inherited from NSObjectProtocol

	setBoundingBoxMinMax(min: interop.Reference<SCNVector3>, max: interop.Reference<SCNVector3>): void; // inherited from SCNBoundingVolume
}

interface SCNNodeRendererDelegate extends NSObjectProtocol {

	renderNodeRendererArguments?(node: SCNNode, renderer: SCNRenderer, _arguments: NSDictionary<string, NSValue>): void;
}
declare var SCNNodeRendererDelegate: {

	prototype: SCNNodeRendererDelegate;
};

declare var SCNNormalTransform: string;

declare const enum SCNParticleBirthDirection {

	Constant = 0,

	SurfaceNormal = 1,

	Random = 2
}

declare const enum SCNParticleBirthLocation {

	Surface = 0,

	Volume = 1,

	Vertex = 2
}

declare const enum SCNParticleBlendMode {

	Additive = 0,

	Subtract = 1,

	Multiply = 2,

	Screen = 3,

	Alpha = 4,

	Replace = 5
}

declare const enum SCNParticleEvent {

	Birth = 0,

	Death = 1,

	Collision = 2
}

declare const enum SCNParticleImageSequenceAnimationMode {

	Repeat = 0,

	Clamp = 1,

	AutoReverse = 2
}

declare const enum SCNParticleInputMode {

	OverLife = 0,

	OverDistance = 1,

	OverOtherProperty = 2
}

declare const enum SCNParticleModifierStage {

	PreDynamics = 0,

	PostDynamics = 1,

	PreCollision = 2,

	PostCollision = 3
}

declare const enum SCNParticleOrientationMode {

	BillboardScreenAligned = 0,

	BillboardViewAligned = 1,

	Free = 2,

	BillboardYAligned = 3
}

declare var SCNParticlePropertyAngle: string;

declare var SCNParticlePropertyAngularVelocity: string;

declare var SCNParticlePropertyBounce: string;

declare var SCNParticlePropertyCharge: string;

declare var SCNParticlePropertyColor: string;

declare var SCNParticlePropertyContactNormal: string;

declare var SCNParticlePropertyContactPoint: string;

declare class SCNParticlePropertyController extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNParticlePropertyController; // inherited from NSObject

	static controllerWithAnimation(animation: CAAnimation): SCNParticlePropertyController;

	static new(): SCNParticlePropertyController; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	animation: CAAnimation;

	inputBias: number;

	inputMode: SCNParticleInputMode;

	inputOrigin: SCNNode;

	inputProperty: string;

	inputScale: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SCNParticlePropertyController; // inherited from NSObjectProtocol
}

declare var SCNParticlePropertyFrame: string;

declare var SCNParticlePropertyFrameRate: string;

declare var SCNParticlePropertyFriction: string;

declare var SCNParticlePropertyLife: string;

declare var SCNParticlePropertyOpacity: string;

declare var SCNParticlePropertyPosition: string;

declare var SCNParticlePropertyRotationAxis: string;

declare var SCNParticlePropertySize: string;

declare var SCNParticlePropertyVelocity: string;

declare const enum SCNParticleSortingMode {

	None = 0,

	ProjectedDepth = 1,

	Distance = 2,

	OldestFirst = 3,

	YoungestFirst = 4
}

declare class SCNParticleSystem extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable {

	static alloc(): SCNParticleSystem; // inherited from NSObject

	static new(): SCNParticleSystem; // inherited from NSObject

	static particleSystem(): SCNParticleSystem;

	static particleSystemNamedInDirectory(name: string, directory: string): SCNParticleSystem;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	acceleration: SCNVector3;

	affectedByGravity: boolean;

	affectedByPhysicsFields: boolean;

	birthDirection: SCNParticleBirthDirection;

	birthLocation: SCNParticleBirthLocation;

	birthRate: number;

	birthRateVariation: number;

	blackPassEnabled: boolean;

	blendMode: SCNParticleBlendMode;

	colliderNodes: NSArray<SCNNode>;

	dampingFactor: number;

	emissionDuration: number;

	emissionDurationVariation: number;

	emitterShape: SCNGeometry;

	emittingDirection: SCNVector3;

	fresnelExponent: number;

	idleDuration: number;

	idleDurationVariation: number;

	imageSequenceAnimationMode: SCNParticleImageSequenceAnimationMode;

	imageSequenceColumnCount: number;

	imageSequenceFrameRate: number;

	imageSequenceFrameRateVariation: number;

	imageSequenceInitialFrame: number;

	imageSequenceInitialFrameVariation: number;

	imageSequenceRowCount: number;

	lightingEnabled: boolean;

	local: boolean;

	loops: boolean;

	orientationMode: SCNParticleOrientationMode;

	particleAngle: number;

	particleAngleVariation: number;

	particleAngularVelocity: number;

	particleAngularVelocityVariation: number;

	particleBounce: number;

	particleBounceVariation: number;

	particleCharge: number;

	particleChargeVariation: number;

	particleColor: UIColor;

	particleColorVariation: SCNVector4;

	particleDiesOnCollision: boolean;

	particleFriction: number;

	particleFrictionVariation: number;

	particleImage: any;

	particleLifeSpan: number;

	particleLifeSpanVariation: number;

	particleMass: number;

	particleMassVariation: number;

	particleSize: number;

	particleSizeVariation: number;

	particleVelocity: number;

	particleVelocityVariation: number;

	propertyControllers: NSDictionary<string, SCNParticlePropertyController>;

	sortingMode: SCNParticleSortingMode;

	speedFactor: number;

	spreadingAngle: number;

	stretchFactor: number;

	systemSpawnedOnCollision: SCNParticleSystem;

	systemSpawnedOnDying: SCNParticleSystem;

	systemSpawnedOnLiving: SCNParticleSystem;

	warmupDuration: number;

	/* readonly */ animationKeys: NSArray<string>; // inherited from SCNAnimatable

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: CAAnimation, key: string): void; // inherited from SCNAnimatable

	addModifierForPropertiesAtStageWithBlock(properties: NSArray<string>, stage: SCNParticleModifierStage, block: (p1: interop.Reference<interop.Pointer>, p2: interop.Reference<number>, p3: number, p4: number, p5: number) => void): void;

	animationForKey(key: string): CAAnimation; // inherited from SCNAnimatable

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	handleEventForPropertiesWithBlock(event: SCNParticleEvent, properties: NSArray<string>, block: (p1: interop.Reference<interop.Pointer>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: number) => void): void;

	isAnimationForKeyPaused(key: string): boolean; // inherited from SCNAnimatable

	pauseAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAllAnimations(): void; // inherited from SCNAnimatable

	removeAllModifiers(): void;

	removeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void; // inherited from SCNAnimatable

	removeModifiersOfStage(stage: SCNParticleModifierStage): void;

	reset(): void;

	resumeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	self(): SCNParticleSystem; // inherited from NSObjectProtocol
}

declare class SCNPhysicsBallSocketJoint extends SCNPhysicsBehavior {

	static jointWithBodyAAnchorABodyBAnchorB(bodyA: SCNPhysicsBody, anchorA: SCNVector3, bodyB: SCNPhysicsBody, anchorB: SCNVector3): SCNPhysicsBallSocketJoint;

	static jointWithBodyAnchor(body: SCNPhysicsBody, anchor: SCNVector3): SCNPhysicsBallSocketJoint;

	anchorA: SCNVector3;

	anchorB: SCNVector3;

	/* readonly */ bodyA: SCNPhysicsBody;

	/* readonly */ bodyB: SCNPhysicsBody;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SCNPhysicsBehavior extends NSObject implements NSSecureCoding {

	static alloc(): SCNPhysicsBehavior; // inherited from NSObject

	static new(): SCNPhysicsBehavior; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SCNPhysicsBehavior; // inherited from NSObjectProtocol
}

declare class SCNPhysicsBody extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNPhysicsBody; // inherited from NSObject

	static bodyWithTypeShape(type: SCNPhysicsBodyType, shape: SCNPhysicsShape): SCNPhysicsBody;

	static dynamicBody(): SCNPhysicsBody;

	static kinematicBody(): SCNPhysicsBody;

	static new(): SCNPhysicsBody; // inherited from NSObject

	static staticBody(): SCNPhysicsBody;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	affectedByGravity: boolean;

	allowsResting: boolean;

	angularDamping: number;

	angularVelocity: SCNVector4;

	angularVelocityFactor: SCNVector3;

	categoryBitMask: number;

	charge: number;

	collisionBitMask: number;

	contactTestBitMask: number;

	damping: number;

	friction: number;

	/* readonly */ isResting: boolean;

	mass: number;

	momentOfInertia: SCNVector3;

	physicsShape: SCNPhysicsShape;

	restitution: number;

	rollingFriction: number;

	type: SCNPhysicsBodyType;

	usesDefaultMomentOfInertia: boolean;

	velocity: SCNVector3;

	velocityFactor: SCNVector3;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	applyForceAtPositionImpulse(direction: SCNVector3, position: SCNVector3, impulse: boolean): void;

	applyForceImpulse(direction: SCNVector3, impulse: boolean): void;

	applyTorqueImpulse(torque: SCNVector4, impulse: boolean): void;

	clearAllForces(): void;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	resetTransform(): void;

	self(): SCNPhysicsBody; // inherited from NSObjectProtocol
}

declare const enum SCNPhysicsBodyType {

	Static = 0,

	Dynamic = 1,

	Kinematic = 2
}

declare const enum SCNPhysicsCollisionCategory {

	Default = 1,

	Static = 2,

	All = 4294967295
}

declare class SCNPhysicsContact extends NSObject {

	static alloc(): SCNPhysicsContact; // inherited from NSObject

	static new(): SCNPhysicsContact; // inherited from NSObject

	/* readonly */ collisionImpulse: number;

	/* readonly */ contactNormal: SCNVector3;

	/* readonly */ contactPoint: SCNVector3;

	/* readonly */ nodeA: SCNNode;

	/* readonly */ nodeB: SCNNode;

	/* readonly */ penetrationDistance: number;

	constructor(); // inherited from NSObject

	self(): SCNPhysicsContact; // inherited from NSObjectProtocol
}

interface SCNPhysicsContactDelegate extends NSObjectProtocol {

	physicsWorldDidBeginContact?(world: SCNPhysicsWorld, contact: SCNPhysicsContact): void;

	physicsWorldDidEndContact?(world: SCNPhysicsWorld, contact: SCNPhysicsContact): void;

	physicsWorldDidUpdateContact?(world: SCNPhysicsWorld, contact: SCNPhysicsContact): void;
}
declare var SCNPhysicsContactDelegate: {

	prototype: SCNPhysicsContactDelegate;
};

declare class SCNPhysicsField extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNPhysicsField; // inherited from NSObject

	static customFieldWithEvaluationBlock(block: (p1: SCNVector3, p2: SCNVector3, p3: number, p4: number, p5: number) => SCNVector3): SCNPhysicsField;

	static dragField(): SCNPhysicsField;

	static electricField(): SCNPhysicsField;

	static linearGravityField(): SCNPhysicsField;

	static magneticField(): SCNPhysicsField;

	static new(): SCNPhysicsField; // inherited from NSObject

	static noiseFieldWithSmoothnessAnimationSpeed(smoothness: number, speed: number): SCNPhysicsField;

	static radialGravityField(): SCNPhysicsField;

	static springField(): SCNPhysicsField;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	static turbulenceFieldWithSmoothnessAnimationSpeed(smoothness: number, speed: number): SCNPhysicsField;

	static vortexField(): SCNPhysicsField;

	active: boolean;

	categoryBitMask: number;

	direction: SCNVector3;

	exclusive: boolean;

	falloffExponent: number;

	halfExtent: SCNVector3;

	minimumDistance: number;

	offset: SCNVector3;

	scope: SCNPhysicsFieldScope;

	strength: number;

	usesEllipsoidalExtent: boolean;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SCNPhysicsField; // inherited from NSObjectProtocol
}

declare const enum SCNPhysicsFieldScope {

	InsideExtent = 0,

	OutsideExtent = 1
}

declare class SCNPhysicsHingeJoint extends SCNPhysicsBehavior {

	static jointWithBodyAAxisAAnchorABodyBAxisBAnchorB(bodyA: SCNPhysicsBody, axisA: SCNVector3, anchorA: SCNVector3, bodyB: SCNPhysicsBody, axisB: SCNVector3, anchorB: SCNVector3): SCNPhysicsHingeJoint;

	static jointWithBodyAxisAnchor(body: SCNPhysicsBody, axis: SCNVector3, anchor: SCNVector3): SCNPhysicsHingeJoint;

	anchorA: SCNVector3;

	anchorB: SCNVector3;

	axisA: SCNVector3;

	axisB: SCNVector3;

	/* readonly */ bodyA: SCNPhysicsBody;

	/* readonly */ bodyB: SCNPhysicsBody;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SCNPhysicsShape extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNPhysicsShape; // inherited from NSObject

	static new(): SCNPhysicsShape; // inherited from NSObject

	static shapeWithGeometryOptions(geometry: SCNGeometry, options: NSDictionary<string, any>): SCNPhysicsShape;

	static shapeWithNodeOptions(node: SCNNode, options: NSDictionary<string, any>): SCNPhysicsShape;

	static shapeWithShapesTransforms(shapes: NSArray<SCNPhysicsShape>, transforms: NSArray<NSValue>): SCNPhysicsShape;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ options: NSDictionary<string, any>;

	/* readonly */ sourceObject: any;

	/* readonly */ transforms: NSArray<NSValue>;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SCNPhysicsShape; // inherited from NSObjectProtocol
}

declare var SCNPhysicsShapeKeepAsCompoundKey: string;

declare var SCNPhysicsShapeScaleKey: string;

declare var SCNPhysicsShapeTypeBoundingBox: string;

declare var SCNPhysicsShapeTypeConcavePolyhedron: string;

declare var SCNPhysicsShapeTypeConvexHull: string;

declare var SCNPhysicsShapeTypeKey: string;

declare class SCNPhysicsSliderJoint extends SCNPhysicsBehavior {

	static jointWithBodyAAxisAAnchorABodyBAxisBAnchorB(bodyA: SCNPhysicsBody, axisA: SCNVector3, anchorA: SCNVector3, bodyB: SCNPhysicsBody, axisB: SCNVector3, anchorB: SCNVector3): SCNPhysicsSliderJoint;

	static jointWithBodyAxisAnchor(body: SCNPhysicsBody, axis: SCNVector3, anchor: SCNVector3): SCNPhysicsSliderJoint;

	anchorA: SCNVector3;

	anchorB: SCNVector3;

	axisA: SCNVector3;

	axisB: SCNVector3;

	/* readonly */ bodyA: SCNPhysicsBody;

	/* readonly */ bodyB: SCNPhysicsBody;

	maximumAngularLimit: number;

	maximumLinearLimit: number;

	minimumAngularLimit: number;

	minimumLinearLimit: number;

	motorMaximumForce: number;

	motorMaximumTorque: number;

	motorTargetAngularVelocity: number;

	motorTargetLinearVelocity: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare var SCNPhysicsTestBackfaceCullingKey: string;

declare var SCNPhysicsTestCollisionBitMaskKey: string;

declare var SCNPhysicsTestSearchModeAll: string;

declare var SCNPhysicsTestSearchModeAny: string;

declare var SCNPhysicsTestSearchModeClosest: string;

declare var SCNPhysicsTestSearchModeKey: string;

declare class SCNPhysicsVehicle extends SCNPhysicsBehavior {

	static vehicleWithChassisBodyWheels(chassisBody: SCNPhysicsBody, wheels: NSArray<SCNPhysicsVehicleWheel>): SCNPhysicsVehicle;

	/* readonly */ chassisBody: SCNPhysicsBody;

	/* readonly */ speedInKilometersPerHour: number;

	/* readonly */ wheels: NSArray<SCNPhysicsVehicleWheel>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	applyBrakingForceForWheelAtIndex(value: number, index: number): void;

	applyEngineForceForWheelAtIndex(value: number, index: number): void;

	setSteeringAngleForWheelAtIndex(value: number, index: number): void;
}

declare class SCNPhysicsVehicleWheel extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNPhysicsVehicleWheel; // inherited from NSObject

	static new(): SCNPhysicsVehicleWheel; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	static wheelWithNode(node: SCNNode): SCNPhysicsVehicleWheel;

	axle: SCNVector3;

	connectionPosition: SCNVector3;

	frictionSlip: number;

	maximumSuspensionForce: number;

	maximumSuspensionTravel: number;

	/* readonly */ node: SCNNode;

	radius: number;

	steeringAxis: SCNVector3;

	suspensionCompression: number;

	suspensionDamping: number;

	suspensionRestLength: number;

	suspensionStiffness: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SCNPhysicsVehicleWheel; // inherited from NSObjectProtocol
}

declare class SCNPhysicsWorld extends NSObject implements NSSecureCoding {

	static alloc(): SCNPhysicsWorld; // inherited from NSObject

	static new(): SCNPhysicsWorld; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ allBehaviors: NSArray<SCNPhysicsBehavior>;

	contactDelegate: SCNPhysicsContactDelegate;

	gravity: SCNVector3;

	speed: number;

	timeStep: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addBehavior(behavior: SCNPhysicsBehavior): void;

	contactTestBetweenBodyAndBodyOptions(bodyA: SCNPhysicsBody, bodyB: SCNPhysicsBody, options: NSDictionary<string, any>): NSArray<SCNPhysicsContact>;

	contactTestWithBodyOptions(body: SCNPhysicsBody, options: NSDictionary<string, any>): NSArray<SCNPhysicsContact>;

	convexSweepTestWithShapeFromTransformToTransformOptions(shape: SCNPhysicsShape, from: SCNMatrix4, to: SCNMatrix4, options: NSDictionary<string, any>): NSArray<SCNPhysicsContact>;

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	rayTestWithSegmentFromPointToPointOptions(origin: SCNVector3, dest: SCNVector3, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	removeAllBehaviors(): void;

	removeBehavior(behavior: SCNPhysicsBehavior): void;

	self(): SCNPhysicsWorld; // inherited from NSObjectProtocol

	updateCollisionPairs(): void;
}

declare class SCNPlane extends SCNGeometry {

	static geometry(): SCNPlane; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNPlane; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNPlane; // inherited from SCNGeometry

	static planeWithWidthHeight(width: number, height: number): SCNPlane;

	cornerRadius: number;

	cornerSegmentCount: number;

	height: number;

	heightSegmentCount: number;

	width: number;

	widthSegmentCount: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNPlane; // inherited from NSObjectProtocol
}

declare var SCNPreferLowPowerDeviceKey: string;

declare var SCNPreferredDeviceKey: string;

declare var SCNPreferredRenderingAPIKey: string;

declare class SCNProgram extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNProgram; // inherited from NSObject

	static new(): SCNProgram; // inherited from NSObject

	static program(): SCNProgram;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	delegate: SCNProgramDelegate;

	fragmentFunctionName: string;

	fragmentShader: string;

	library: MTLLibrary;

	opaque: boolean;

	vertexFunctionName: string;

	vertexShader: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	handleBindingOfBufferNamedFrequencyUsingBlock(name: string, frequency: SCNBufferFrequency, block: (p1: SCNBufferStream, p2: SCNNode, p3: SCNShadable, p4: SCNRenderer) => void): void;

	self(): SCNProgram; // inherited from NSObjectProtocol

	semanticForSymbol(symbol: string): string;

	setSemanticForSymbolOptions(semantic: string, symbol: string, options: NSDictionary<string, any>): void;
}

interface SCNProgramDelegate extends NSObjectProtocol {

	programHandleError?(program: SCNProgram, error: NSError): void;
}
declare var SCNProgramDelegate: {

	prototype: SCNProgramDelegate;
};

declare var SCNProgramMappingChannelKey: string;

declare var SCNProjectionTransform: string;

declare class SCNPyramid extends SCNGeometry {

	static geometry(): SCNPyramid; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNPyramid; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNPyramid; // inherited from SCNGeometry

	static pyramidWithWidthHeightLength(width: number, height: number, length: number): SCNPyramid;

	height: number;

	heightSegmentCount: number;

	length: number;

	lengthSegmentCount: number;

	width: number;

	widthSegmentCount: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNPyramid; // inherited from NSObjectProtocol
}

declare const enum SCNReferenceLoadingPolicy {

	Immediate = 0,

	OnDemand = 1
}

declare class SCNReferenceNode extends SCNNode {

	static node(): SCNReferenceNode; // inherited from SCNNode

	static nodeWithMDLObject(mdlObject: MDLObject): SCNReferenceNode; // inherited from SCNNode

	static referenceNodeWithURL(referenceURL: NSURL): SCNReferenceNode;

	/* readonly */ loaded: boolean;

	loadingPolicy: SCNReferenceLoadingPolicy;

	referenceURL: NSURL;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { URL: NSURL; });

	clone(): SCNReferenceNode; // inherited from SCNNode

	flattenedClone(): SCNReferenceNode; // inherited from SCNNode

	load(): void;

	self(): SCNReferenceNode; // inherited from NSObjectProtocol

	unload(): void;
}

declare class SCNRenderer extends NSObject implements SCNSceneRenderer, SCNTechniqueSupport {

	static alloc(): SCNRenderer; // inherited from NSObject

	static new(): SCNRenderer; // inherited from NSObject

	static rendererWithContextOptions(context: EAGLContext, options: NSDictionary<any, any>): SCNRenderer;

	static rendererWithDeviceOptions(device: MTLDevice, options: NSDictionary<any, any>): SCNRenderer;

	/* readonly */ nextFrameTime: number;

	/* readonly */ audioEngine: AVAudioEngine; // inherited from SCNSceneRenderer

	/* readonly */ audioEnvironmentNode: AVAudioEnvironmentNode; // inherited from SCNSceneRenderer

	audioListener: SCNNode; // inherited from SCNSceneRenderer

	autoenablesDefaultLighting: boolean; // inherited from SCNSceneRenderer

	/* readonly */ context: interop.Pointer; // inherited from SCNSceneRenderer

	debugOptions: SCNDebugOptions; // inherited from SCNSceneRenderer

	delegate: SCNSceneRendererDelegate; // inherited from SCNSceneRenderer

	jitteringEnabled: boolean; // inherited from SCNSceneRenderer

	loops: boolean; // inherited from SCNSceneRenderer

	overlaySKScene: SKScene; // inherited from SCNSceneRenderer

	playing: boolean; // inherited from SCNSceneRenderer

	pointOfView: SCNNode; // inherited from SCNSceneRenderer

	/* readonly */ renderingAPI: SCNRenderingAPI; // inherited from SCNSceneRenderer

	scene: SCNScene; // inherited from SCNSceneRenderer

	sceneTime: number; // inherited from SCNSceneRenderer

	showsStatistics: boolean; // inherited from SCNSceneRenderer

	technique: SCNTechnique; // inherited from SCNTechniqueSupport

	constructor(); // inherited from NSObject

	hitTestOptions(point: CGPoint, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>; // inherited from SCNSceneRenderer

	isNodeInsideFrustumWithPointOfView(node: SCNNode, pointOfView: SCNNode): boolean; // inherited from SCNSceneRenderer

	nodesInsideFrustumWithPointOfView(pointOfView: SCNNode): NSArray<SCNNode>; // inherited from SCNSceneRenderer

	prepareObjectShouldAbortBlock(object: any, block: () => boolean): boolean; // inherited from SCNSceneRenderer

	prepareObjectsWithCompletionHandler(objects: NSArray<any>, completionHandler: (p1: boolean) => void): void; // inherited from SCNSceneRenderer

	presentSceneWithTransitionIncomingPointOfViewCompletionHandler(scene: SCNScene, transition: SKTransition, pointOfView: SCNNode, completionHandler: () => void): void; // inherited from SCNSceneRenderer

	projectPoint(point: SCNVector3): SCNVector3; // inherited from SCNSceneRenderer

	render(): void;

	renderAtTime(time: number): void;

	renderAtTimeViewportCommandBufferPassDescriptor(time: number, viewport: CGRect, commandBuffer: MTLCommandBuffer, renderPassDescriptor: MTLRenderPassDescriptor): void;

	self(): SCNRenderer; // inherited from NSObjectProtocol

	unprojectPoint(point: SCNVector3): SCNVector3; // inherited from SCNSceneRenderer
}

declare const enum SCNRenderingAPI {

	Metal = 0,

	OpenGLES2 = 1
}

declare class SCNScene extends NSObject implements NSSecureCoding {

	static alloc(): SCNScene; // inherited from NSObject

	static new(): SCNScene; // inherited from NSObject

	static scene(): SCNScene;

	static sceneNamed(name: string): SCNScene;

	static sceneNamedInDirectoryOptions(name: string, directory: string, options: NSDictionary<string, any>): SCNScene;

	static sceneWithMDLAsset(mdlAsset: MDLAsset): SCNScene;

	static sceneWithURLOptionsError(url: NSURL, options: NSDictionary<string, any>): SCNScene;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ background: SCNMaterialProperty;

	fogColor: any;

	fogDensityExponent: number;

	fogEndDistance: number;

	fogStartDistance: number;

	/* readonly */ particleSystems: NSArray<SCNParticleSystem>;

	paused: boolean;

	/* readonly */ physicsWorld: SCNPhysicsWorld;

	/* readonly */ rootNode: SCNNode;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addParticleSystemWithTransform(system: SCNParticleSystem, transform: SCNMatrix4): void;

	attributeForKey(key: string): any;

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	removeAllParticleSystems(): void;

	removeParticleSystem(system: SCNParticleSystem): void;

	self(): SCNScene; // inherited from NSObjectProtocol

	setAttributeForKey(attribute: any, key: string): void;
}

declare var SCNSceneEndTimeAttributeKey: string;

declare var SCNSceneExportDestinationURL: string;

declare var SCNSceneFrameRateAttributeKey: string;

interface SCNSceneRenderer extends NSObjectProtocol {

	audioEngine: AVAudioEngine;

	audioEnvironmentNode: AVAudioEnvironmentNode;

	audioListener: SCNNode;

	autoenablesDefaultLighting: boolean;

	context: interop.Pointer;

	debugOptions: SCNDebugOptions;

	delegate: SCNSceneRendererDelegate;

	jitteringEnabled: boolean;

	loops: boolean;

	overlaySKScene: SKScene;

	playing: boolean;

	pointOfView: SCNNode;

	renderingAPI: SCNRenderingAPI;

	scene: SCNScene;

	sceneTime: number;

	showsStatistics: boolean;

	hitTestOptions(point: CGPoint, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	isNodeInsideFrustumWithPointOfView(node: SCNNode, pointOfView: SCNNode): boolean;

	nodesInsideFrustumWithPointOfView(pointOfView: SCNNode): NSArray<SCNNode>;

	prepareObjectShouldAbortBlock(object: any, block: () => boolean): boolean;

	prepareObjectsWithCompletionHandler(objects: NSArray<any>, completionHandler: (p1: boolean) => void): void;

	presentSceneWithTransitionIncomingPointOfViewCompletionHandler(scene: SCNScene, transition: SKTransition, pointOfView: SCNNode, completionHandler: () => void): void;

	projectPoint(point: SCNVector3): SCNVector3;

	unprojectPoint(point: SCNVector3): SCNVector3;
}
declare var SCNSceneRenderer: {

	prototype: SCNSceneRenderer;
};

interface SCNSceneRendererDelegate extends NSObjectProtocol {

	rendererDidApplyAnimationsAtTime?(renderer: SCNSceneRenderer, time: number): void;

	rendererDidRenderSceneAtTime?(renderer: SCNSceneRenderer, scene: SCNScene, time: number): void;

	rendererDidSimulatePhysicsAtTime?(renderer: SCNSceneRenderer, time: number): void;

	rendererUpdateAtTime?(renderer: SCNSceneRenderer, time: number): void;

	rendererWillRenderSceneAtTime?(renderer: SCNSceneRenderer, scene: SCNScene, time: number): void;
}
declare var SCNSceneRendererDelegate: {

	prototype: SCNSceneRendererDelegate;
};

declare class SCNSceneSource extends NSObject {

	static alloc(): SCNSceneSource; // inherited from NSObject

	static new(): SCNSceneSource; // inherited from NSObject

	static sceneSourceWithDataOptions(data: NSData, options: NSDictionary<string, any>): SCNSceneSource;

	static sceneSourceWithURLOptions(url: NSURL, options: NSDictionary<string, any>): SCNSceneSource;

	/* readonly */ data: NSData;

	/* readonly */ url: NSURL;

	constructor(); // inherited from NSObject

	constructor(o: { data: NSData; options: NSDictionary<string, any>; });

	constructor(o: { URL: NSURL; options: NSDictionary<string, any>; });

	entriesPassingTest(predicate: (p1: any, p2: string, p3: interop.Reference<boolean>) => boolean): NSArray<any>;

	entryWithIdentifierWithClass(uid: string, entryClass: typeof NSObject): any;

	identifiersOfEntriesWithClass(entryClass: typeof NSObject): NSArray<string>;

	propertyForKey(key: string): any;

	sceneWithOptionsError(options: NSDictionary<string, any>): SCNScene;

	sceneWithOptionsStatusHandler(options: NSDictionary<string, any>, statusHandler: (p1: number, p2: SCNSceneSourceStatus, p3: NSError, p4: interop.Reference<boolean>) => void): SCNScene;

	self(): SCNSceneSource; // inherited from NSObjectProtocol
}

declare var SCNSceneSourceAnimationImportPolicyDoNotPlay: string;

declare var SCNSceneSourceAnimationImportPolicyKey: string;

declare var SCNSceneSourceAnimationImportPolicyPlay: string;

declare var SCNSceneSourceAnimationImportPolicyPlayRepeatedly: string;

declare var SCNSceneSourceAnimationImportPolicyPlayUsingSceneTimeBase: string;

declare var SCNSceneSourceAssetAuthorKey: string;

declare var SCNSceneSourceAssetAuthoringToolKey: string;

declare var SCNSceneSourceAssetContributorsKey: string;

declare var SCNSceneSourceAssetCreatedDateKey: string;

declare var SCNSceneSourceAssetDirectoryURLsKey: string;

declare var SCNSceneSourceAssetModifiedDateKey: string;

declare var SCNSceneSourceAssetUnitKey: string;

declare var SCNSceneSourceAssetUnitMeterKey: string;

declare var SCNSceneSourceAssetUnitNameKey: string;

declare var SCNSceneSourceAssetUpAxisKey: string;

declare var SCNSceneSourceCheckConsistencyKey: string;

declare var SCNSceneSourceCreateNormalsIfAbsentKey: string;

declare var SCNSceneSourceFlattenSceneKey: string;

declare var SCNSceneSourceOverrideAssetURLsKey: string;

declare const enum SCNSceneSourceStatus {

	Error = -1,

	Parsing = 4,

	Validating = 8,

	Processing = 12,

	Complete = 16
}

declare var SCNSceneSourceStrictConformanceKey: string;

declare var SCNSceneSourceUseSafeModeKey: string;

declare var SCNSceneStartTimeAttributeKey: string;

declare var SCNSceneUpAxisAttributeKey: string;

interface SCNShadable extends NSObjectProtocol {

	program?: SCNProgram;

	shaderModifiers?: NSDictionary<string, string>;

	handleBindingOfSymbolUsingBlock?(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	handleUnbindingOfSymbolUsingBlock?(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;
}
declare var SCNShadable: {

	prototype: SCNShadable;
};

declare var SCNShaderModifierEntryPointFragment: string;

declare var SCNShaderModifierEntryPointGeometry: string;

declare var SCNShaderModifierEntryPointLightingModel: string;

declare var SCNShaderModifierEntryPointSurface: string;

declare const enum SCNShadowMode {

	Forward = 0,

	Deferred = 1,

	Modulated = 2
}

declare class SCNShape extends SCNGeometry {

	static geometry(): SCNShape; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNShape; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNShape; // inherited from SCNGeometry

	static shapeWithPathExtrusionDepth(path: UIBezierPath, extrusionDepth: number): SCNShape;

	chamferMode: SCNChamferMode;

	chamferProfile: UIBezierPath;

	chamferRadius: number;

	extrusionDepth: number;

	path: UIBezierPath;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNShape; // inherited from NSObjectProtocol
}

declare class SCNSkinner extends NSObject implements NSSecureCoding {

	static alloc(): SCNSkinner; // inherited from NSObject

	static new(): SCNSkinner; // inherited from NSObject

	static skinnerWithBaseGeometryBonesBoneInverseBindTransformsBoneWeightsBoneIndices(baseGeometry: SCNGeometry, bones: NSArray<SCNNode>, boneInverseBindTransforms: NSArray<NSValue>, boneWeights: SCNGeometrySource, boneIndices: SCNGeometrySource): SCNSkinner;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	baseGeometry: SCNGeometry;

	baseGeometryBindTransform: SCNMatrix4;

	/* readonly */ boneIndices: SCNGeometrySource;

	/* readonly */ boneInverseBindTransforms: NSArray<NSValue>;

	/* readonly */ boneWeights: SCNGeometrySource;

	/* readonly */ bones: NSArray<SCNNode>;

	skeleton: SCNNode;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SCNSkinner; // inherited from NSObjectProtocol
}

declare class SCNSphere extends SCNGeometry {

	static geometry(): SCNSphere; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNSphere; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNSphere; // inherited from SCNGeometry

	static sphereWithRadius(radius: number): SCNSphere;

	geodesic: boolean;

	radius: number;

	segmentCount: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNSphere; // inherited from NSObjectProtocol
}

declare class SCNTechnique extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable {

	static alloc(): SCNTechnique; // inherited from NSObject

	static new(): SCNTechnique; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	static techniqueBySequencingTechniques(techniques: NSArray<SCNTechnique>): SCNTechnique;

	static techniqueWithDictionary(dictionary: NSDictionary<string, any>): SCNTechnique;

	/* readonly */ dictionaryRepresentation: NSDictionary<string, any>;

	/* readonly */ animationKeys: NSArray<string>; // inherited from SCNAnimatable

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: CAAnimation, key: string): void; // inherited from SCNAnimatable

	animationForKey(key: string): CAAnimation; // inherited from SCNAnimatable

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	handleBindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	isAnimationForKeyPaused(key: string): boolean; // inherited from SCNAnimatable

	objectForKeyedSubscript(key: any): any;

	pauseAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAllAnimations(): void; // inherited from SCNAnimatable

	removeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void; // inherited from SCNAnimatable

	resumeAnimationForKey(key: string): void; // inherited from SCNAnimatable

	self(): SCNTechnique; // inherited from NSObjectProtocol

	setObjectForKeyedSubscript(obj: any, key: NSCopying): void;
}

interface SCNTechniqueSupport extends NSObjectProtocol {

	technique: SCNTechnique;
}
declare var SCNTechniqueSupport: {

	prototype: SCNTechniqueSupport;
};

declare class SCNText extends SCNGeometry {

	static geometry(): SCNText; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNText; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNText; // inherited from SCNGeometry

	static textWithStringExtrusionDepth(string: any, extrusionDepth: number): SCNText;

	alignmentMode: string;

	chamferProfile: UIBezierPath;

	chamferRadius: number;

	containerFrame: CGRect;

	extrusionDepth: number;

	flatness: number;

	font: UIFont;

	string: any;

	truncationMode: string;

	wrapped: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNText; // inherited from NSObjectProtocol
}

declare class SCNTorus extends SCNGeometry {

	static geometry(): SCNTorus; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNTorus; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNTorus; // inherited from SCNGeometry

	static torusWithRingRadiusPipeRadius(ringRadius: number, pipeRadius: number): SCNTorus;

	pipeRadius: number;

	pipeSegmentCount: number;

	ringRadius: number;

	ringSegmentCount: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNTorus; // inherited from NSObjectProtocol
}

declare class SCNTransaction extends NSObject {

	static alloc(): SCNTransaction; // inherited from NSObject

	static animationDuration(): number;

	static animationTimingFunction(): CAMediaTimingFunction;

	static begin(): void;

	static commit(): void;

	static completionBlock(): () => void;

	static disableActions(): boolean;

	static flush(): void;

	static lock(): void;

	static new(): SCNTransaction; // inherited from NSObject

	static setAnimationDuration(duration: number): void;

	static setAnimationTimingFunction(animationTimingFunction: CAMediaTimingFunction): void;

	static setCompletionBlock(block: () => void): void;

	static setDisableActions(flag: boolean): void;

	static setValueForKey(value: any, key: string): void;

	static unlock(): void;

	static valueForKey(key: string): any;

	constructor(); // inherited from NSObject

	self(): SCNTransaction; // inherited from NSObjectProtocol
}

declare class SCNTransformConstraint extends SCNConstraint {

	static transformConstraintInWorldSpaceWithBlock(world: boolean, block: (p1: SCNNode, p2: SCNMatrix4) => SCNMatrix4): SCNTransformConstraint;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNTransformConstraint; // inherited from NSObjectProtocol
}

declare const enum SCNTransparencyMode {

	AOne = 0,

	RGBZero = 1
}

declare class SCNTube extends SCNGeometry {

	static geometry(): SCNTube; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNTube; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource>, elements: NSArray<SCNGeometryElement>): SCNTube; // inherited from SCNGeometry

	static tubeWithInnerRadiusOuterRadiusHeight(innerRadius: number, outerRadius: number, height: number): SCNTube;

	height: number;

	heightSegmentCount: number;

	innerRadius: number;

	outerRadius: number;

	radialSegmentCount: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	self(): SCNTube; // inherited from NSObjectProtocol
}

interface SCNVector3 {
	x: number;
	y: number;
	z: number;
}
declare var SCNVector3: interop.StructType<SCNVector3>;

declare function SCNVector3EqualToVector3(a: SCNVector3, b: SCNVector3): boolean;

declare var SCNVector3Zero: SCNVector3;

interface SCNVector4 {
	x: number;
	y: number;
	z: number;
	w: number;
}
declare var SCNVector4: interop.StructType<SCNVector4>;

declare function SCNVector4EqualToVector4(a: SCNVector4, b: SCNVector4): boolean;

declare var SCNVector4Zero: SCNVector4;

declare class SCNView extends UIView implements SCNSceneRenderer, SCNTechniqueSupport {

	static appearance(): SCNView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): SCNView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): SCNView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): SCNView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): SCNView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): SCNView; // inherited from UIAppearance

	allowsCameraControl: boolean;

	antialiasingMode: SCNAntialiasingMode;

	eaglContext: EAGLContext;

	preferredFramesPerSecond: number;

	/* readonly */ audioEngine: AVAudioEngine; // inherited from SCNSceneRenderer

	/* readonly */ audioEnvironmentNode: AVAudioEnvironmentNode; // inherited from SCNSceneRenderer

	audioListener: SCNNode; // inherited from SCNSceneRenderer

	autoenablesDefaultLighting: boolean; // inherited from SCNSceneRenderer

	/* readonly */ context: interop.Pointer; // inherited from SCNSceneRenderer

	debugOptions: SCNDebugOptions; // inherited from SCNSceneRenderer

	delegate: SCNSceneRendererDelegate; // inherited from SCNSceneRenderer

	jitteringEnabled: boolean; // inherited from SCNSceneRenderer

	loops: boolean; // inherited from SCNSceneRenderer

	overlaySKScene: SKScene; // inherited from SCNSceneRenderer

	playing: boolean; // inherited from SCNSceneRenderer

	pointOfView: SCNNode; // inherited from SCNSceneRenderer

	/* readonly */ renderingAPI: SCNRenderingAPI; // inherited from SCNSceneRenderer

	scene: SCNScene; // inherited from SCNSceneRenderer

	sceneTime: number; // inherited from SCNSceneRenderer

	showsStatistics: boolean; // inherited from SCNSceneRenderer

	technique: SCNTechnique; // inherited from SCNTechniqueSupport

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; }); // inherited from UIView

	constructor(o: { frame: CGRect; options: NSDictionary<string, any>; });

	hitTestOptions(point: CGPoint, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>; // inherited from SCNSceneRenderer

	isNodeInsideFrustumWithPointOfView(node: SCNNode, pointOfView: SCNNode): boolean; // inherited from SCNSceneRenderer

	nodesInsideFrustumWithPointOfView(pointOfView: SCNNode): NSArray<SCNNode>; // inherited from SCNSceneRenderer

	pause(sender: any): void;

	play(sender: any): void;

	prepareObjectShouldAbortBlock(object: any, block: () => boolean): boolean; // inherited from SCNSceneRenderer

	prepareObjectsWithCompletionHandler(objects: NSArray<any>, completionHandler: (p1: boolean) => void): void; // inherited from SCNSceneRenderer

	presentSceneWithTransitionIncomingPointOfViewCompletionHandler(scene: SCNScene, transition: SKTransition, pointOfView: SCNNode, completionHandler: () => void): void; // inherited from SCNSceneRenderer

	projectPoint(point: SCNVector3): SCNVector3; // inherited from SCNSceneRenderer

	self(): SCNView; // inherited from NSObjectProtocol

	snapshot(): UIImage;

	stop(sender: any): void;

	unprojectPoint(point: SCNVector3): SCNVector3; // inherited from SCNSceneRenderer
}

declare var SCNViewTransform: string;

declare const enum SCNWrapMode {

	Clamp = 1,

	Repeat = 2,

	ClampToBorder = 3,

	Mirror = 4
}
