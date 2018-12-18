
declare class ARAnchor extends NSObject implements ARAnchorCopying, NSSecureCoding {

	static alloc(): ARAnchor; // inherited from NSObject

	static new(): ARAnchor; // inherited from NSObject

	readonly identifier: NSUUID;

	readonly name: string;

	readonly transform: simd_float4x4;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { anchor: ARAnchor; }); // inherited from ARAnchorCopying

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; transform: simd_float4x4; });

	constructor(o: { transform: simd_float4x4; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithAnchor(anchor: ARAnchor): this;

	initWithCoder(aDecoder: NSCoder): this;

	initWithNameTransform(name: string, transform: simd_float4x4): this;

	initWithTransform(transform: simd_float4x4): this;
}

interface ARAnchorCopying extends NSCopying {

	initWithAnchor?(anchor: ARAnchor): ARAnchorCopying;
}
declare var ARAnchorCopying: {

	prototype: ARAnchorCopying;
};

declare var ARBlendShapeLocationBrowDownLeft: string;

declare var ARBlendShapeLocationBrowDownRight: string;

declare var ARBlendShapeLocationBrowInnerUp: string;

declare var ARBlendShapeLocationBrowOuterUpLeft: string;

declare var ARBlendShapeLocationBrowOuterUpRight: string;

declare var ARBlendShapeLocationCheekPuff: string;

declare var ARBlendShapeLocationCheekSquintLeft: string;

declare var ARBlendShapeLocationCheekSquintRight: string;

declare var ARBlendShapeLocationEyeBlinkLeft: string;

declare var ARBlendShapeLocationEyeBlinkRight: string;

declare var ARBlendShapeLocationEyeLookDownLeft: string;

declare var ARBlendShapeLocationEyeLookDownRight: string;

declare var ARBlendShapeLocationEyeLookInLeft: string;

declare var ARBlendShapeLocationEyeLookInRight: string;

declare var ARBlendShapeLocationEyeLookOutLeft: string;

declare var ARBlendShapeLocationEyeLookOutRight: string;

declare var ARBlendShapeLocationEyeLookUpLeft: string;

declare var ARBlendShapeLocationEyeLookUpRight: string;

declare var ARBlendShapeLocationEyeSquintLeft: string;

declare var ARBlendShapeLocationEyeSquintRight: string;

declare var ARBlendShapeLocationEyeWideLeft: string;

declare var ARBlendShapeLocationEyeWideRight: string;

declare var ARBlendShapeLocationJawForward: string;

declare var ARBlendShapeLocationJawLeft: string;

declare var ARBlendShapeLocationJawOpen: string;

declare var ARBlendShapeLocationJawRight: string;

declare var ARBlendShapeLocationMouthClose: string;

declare var ARBlendShapeLocationMouthDimpleLeft: string;

declare var ARBlendShapeLocationMouthDimpleRight: string;

declare var ARBlendShapeLocationMouthFrownLeft: string;

declare var ARBlendShapeLocationMouthFrownRight: string;

declare var ARBlendShapeLocationMouthFunnel: string;

declare var ARBlendShapeLocationMouthLeft: string;

declare var ARBlendShapeLocationMouthLowerDownLeft: string;

declare var ARBlendShapeLocationMouthLowerDownRight: string;

declare var ARBlendShapeLocationMouthPressLeft: string;

declare var ARBlendShapeLocationMouthPressRight: string;

declare var ARBlendShapeLocationMouthPucker: string;

declare var ARBlendShapeLocationMouthRight: string;

declare var ARBlendShapeLocationMouthRollLower: string;

declare var ARBlendShapeLocationMouthRollUpper: string;

declare var ARBlendShapeLocationMouthShrugLower: string;

declare var ARBlendShapeLocationMouthShrugUpper: string;

declare var ARBlendShapeLocationMouthSmileLeft: string;

declare var ARBlendShapeLocationMouthSmileRight: string;

declare var ARBlendShapeLocationMouthStretchLeft: string;

declare var ARBlendShapeLocationMouthStretchRight: string;

declare var ARBlendShapeLocationMouthUpperUpLeft: string;

declare var ARBlendShapeLocationMouthUpperUpRight: string;

declare var ARBlendShapeLocationNoseSneerLeft: string;

declare var ARBlendShapeLocationNoseSneerRight: string;

declare var ARBlendShapeLocationTongueOut: string;

declare class ARCamera extends NSObject implements NSCopying {

	static alloc(): ARCamera; // inherited from NSObject

	static new(): ARCamera; // inherited from NSObject

	readonly eulerAngles: interop.Reference<number>;

	readonly imageResolution: CGSize;

	readonly intrinsics: simd_float3x3;

	readonly projectionMatrix: simd_float4x4;

	readonly trackingState: ARTrackingState;

	readonly trackingStateReason: ARTrackingStateReason;

	readonly transform: simd_float4x4;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	projectPointOrientationViewportSize(point: interop.Reference<number>, orientation: UIInterfaceOrientation, viewportSize: CGSize): CGPoint;

	projectionMatrixForOrientationViewportSizeZNearZFar(orientation: UIInterfaceOrientation, viewportSize: CGSize, zNear: number, zFar: number): simd_float4x4;

	unprojectPointOntoPlaneWithTransformOrientationViewportSize(point: CGPoint, planeTransform: simd_float4x4, orientation: UIInterfaceOrientation, viewportSize: CGSize): interop.Reference<number>;

	viewMatrixForOrientation(orientation: UIInterfaceOrientation): simd_float4x4;
}

declare class ARConfiguration extends NSObject implements NSCopying {

	static alloc(): ARConfiguration; // inherited from NSObject

	static new(): ARConfiguration; // inherited from NSObject

	lightEstimationEnabled: boolean;

	providesAudioData: boolean;

	videoFormat: ARVideoFormat;

	worldAlignment: ARWorldAlignment;

	static readonly isSupported: boolean;

	static readonly supportedVideoFormats: NSArray<ARVideoFormat>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class ARDirectionalLightEstimate extends ARLightEstimate {

	static alloc(): ARDirectionalLightEstimate; // inherited from NSObject

	static new(): ARDirectionalLightEstimate; // inherited from NSObject

	readonly primaryLightDirection: interop.Reference<number>;

	readonly primaryLightIntensity: number;

	readonly sphericalHarmonicsCoefficients: NSData;
}

declare class AREnvironmentProbeAnchor extends ARAnchor {

	static alloc(): AREnvironmentProbeAnchor; // inherited from NSObject

	static new(): AREnvironmentProbeAnchor; // inherited from NSObject

	readonly environmentTexture: MTLTexture;

	readonly extent: interop.Reference<number>;

	constructor(o: { name: string; transform: simd_float4x4; extent: interop.Reference<number>; });

	constructor(o: { transform: simd_float4x4; extent: interop.Reference<number>; });

	initWithNameTransformExtent(name: string, transform: simd_float4x4, extent: interop.Reference<number>): this;

	initWithTransformExtent(transform: simd_float4x4, extent: interop.Reference<number>): this;
}

declare const enum AREnvironmentTexturing {

	None = 0,

	Manual = 1,

	Automatic = 2
}

declare const enum ARErrorCode {

	UnsupportedConfiguration = 100,

	SensorUnavailable = 101,

	SensorFailed = 102,

	CameraUnauthorized = 103,

	MicrophoneUnauthorized = 104,

	WorldTrackingFailed = 200,

	InvalidReferenceImage = 300,

	InvalidReferenceObject = 301,

	InvalidWorldMap = 302,

	InvalidConfiguration = 303,

	InsufficientFeatures = 400,

	ObjectMergeFailed = 401,

	FileIOFailed = 500
}

declare var ARErrorDomain: string;

declare class ARFaceAnchor extends ARAnchor implements ARTrackable {

	static alloc(): ARFaceAnchor; // inherited from NSObject

	static new(): ARFaceAnchor; // inherited from NSObject

	readonly blendShapes: NSDictionary<string, number>;

	readonly geometry: ARFaceGeometry;

	readonly leftEyeTransform: simd_float4x4;

	readonly lookAtPoint: interop.Reference<number>;

	readonly rightEyeTransform: simd_float4x4;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly isTracked: boolean; // inherited from ARTrackable

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

declare class ARFaceGeometry extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ARFaceGeometry; // inherited from NSObject

	static new(): ARFaceGeometry; // inherited from NSObject

	readonly textureCoordinateCount: number;

	readonly textureCoordinates: interop.Pointer | interop.Reference<interop.Reference<number>>;

	readonly triangleCount: number;

	readonly triangleIndices: interop.Pointer | interop.Reference<number>;

	readonly vertexCount: number;

	readonly vertices: interop.Pointer | interop.Reference<interop.Reference<number>>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { blendShapes: NSDictionary<string, number>; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithBlendShapes(blendShapes: NSDictionary<string, number>): this;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class ARFaceTrackingConfiguration extends ARConfiguration {

	static alloc(): ARFaceTrackingConfiguration; // inherited from NSObject

	static new(): ARFaceTrackingConfiguration; // inherited from NSObject
}

declare class ARFrame extends NSObject implements NSCopying {

	static alloc(): ARFrame; // inherited from NSObject

	static new(): ARFrame; // inherited from NSObject

	readonly anchors: NSArray<ARAnchor>;

	readonly camera: ARCamera;

	readonly capturedDepthData: AVDepthData;

	readonly capturedDepthDataTimestamp: number;

	readonly capturedImage: any;

	readonly lightEstimate: ARLightEstimate;

	readonly rawFeaturePoints: ARPointCloud;

	readonly timestamp: number;

	readonly worldMappingStatus: ARWorldMappingStatus;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	displayTransformForOrientationViewportSize(orientation: UIInterfaceOrientation, viewportSize: CGSize): CGAffineTransform;

	hitTestTypes(point: CGPoint, types: ARHitTestResultType): NSArray<ARHitTestResult>;
}

declare class ARHitTestResult extends NSObject {

	static alloc(): ARHitTestResult; // inherited from NSObject

	static new(): ARHitTestResult; // inherited from NSObject

	readonly anchor: ARAnchor;

	readonly distance: number;

	readonly localTransform: simd_float4x4;

	readonly type: ARHitTestResultType;

	readonly worldTransform: simd_float4x4;
}

declare const enum ARHitTestResultType {

	FeaturePoint = 1,

	EstimatedHorizontalPlane = 2,

	EstimatedVerticalPlane = 4,

	ExistingPlane = 8,

	ExistingPlaneUsingExtent = 16,

	ExistingPlaneUsingGeometry = 32
}

declare class ARImageAnchor extends ARAnchor implements ARTrackable {

	static alloc(): ARImageAnchor; // inherited from NSObject

	static new(): ARImageAnchor; // inherited from NSObject

	readonly referenceImage: ARReferenceImage;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly isTracked: boolean; // inherited from ARTrackable

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

declare class ARImageTrackingConfiguration extends ARConfiguration {

	static alloc(): ARImageTrackingConfiguration; // inherited from NSObject

	static new(): ARImageTrackingConfiguration; // inherited from NSObject

	autoFocusEnabled: boolean;

	maximumNumberOfTrackedImages: number;

	trackingImages: NSSet<ARReferenceImage>;
}

declare class ARLightEstimate extends NSObject {

	static alloc(): ARLightEstimate; // inherited from NSObject

	static new(): ARLightEstimate; // inherited from NSObject

	readonly ambientColorTemperature: number;

	readonly ambientIntensity: number;
}

declare class ARObjectAnchor extends ARAnchor {

	static alloc(): ARObjectAnchor; // inherited from NSObject

	static new(): ARObjectAnchor; // inherited from NSObject

	readonly referenceObject: ARReferenceObject;
}

declare class ARObjectScanningConfiguration extends ARConfiguration {

	static alloc(): ARObjectScanningConfiguration; // inherited from NSObject

	static new(): ARObjectScanningConfiguration; // inherited from NSObject

	autoFocusEnabled: boolean;

	planeDetection: ARPlaneDetection;
}

declare class AROrientationTrackingConfiguration extends ARConfiguration {

	static alloc(): AROrientationTrackingConfiguration; // inherited from NSObject

	static new(): AROrientationTrackingConfiguration; // inherited from NSObject

	autoFocusEnabled: boolean;
}

declare class ARPlaneAnchor extends ARAnchor {

	static alloc(): ARPlaneAnchor; // inherited from NSObject

	static new(): ARPlaneAnchor; // inherited from NSObject

	readonly alignment: ARPlaneAnchorAlignment;

	readonly center: interop.Reference<number>;

	readonly classification: ARPlaneClassification;

	readonly classificationStatus: ARPlaneClassificationStatus;

	readonly extent: interop.Reference<number>;

	readonly geometry: ARPlaneGeometry;

	static readonly classificationSupported: boolean;
}

declare const enum ARPlaneAnchorAlignment {

	Horizontal = 0,

	Vertical = 1
}

declare const enum ARPlaneClassification {

	None = 0,

	Wall = 1,

	Floor = 2,

	Ceiling = 3,

	Table = 4,

	Seat = 5
}

declare const enum ARPlaneClassificationStatus {

	NotAvailable = 0,

	Undetermined = 1,

	Unknown = 2,

	Known = 3
}

declare const enum ARPlaneDetection {

	None = 0,

	Horizontal = 1,

	Vertical = 2
}

declare class ARPlaneGeometry extends NSObject implements NSSecureCoding {

	static alloc(): ARPlaneGeometry; // inherited from NSObject

	static new(): ARPlaneGeometry; // inherited from NSObject

	readonly boundaryVertexCount: number;

	readonly boundaryVertices: interop.Pointer | interop.Reference<interop.Reference<number>>;

	readonly textureCoordinateCount: number;

	readonly textureCoordinates: interop.Pointer | interop.Reference<interop.Reference<number>>;

	readonly triangleCount: number;

	readonly triangleIndices: interop.Pointer | interop.Reference<number>;

	readonly vertexCount: number;

	readonly vertices: interop.Pointer | interop.Reference<interop.Reference<number>>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class ARPointCloud extends NSObject implements NSSecureCoding {

	static alloc(): ARPointCloud; // inherited from NSObject

	static new(): ARPointCloud; // inherited from NSObject

	readonly count: number;

	readonly identifiers: interop.Pointer | interop.Reference<number>;

	readonly points: interop.Pointer | interop.Reference<interop.Reference<number>>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class ARReferenceImage extends NSObject {

	static alloc(): ARReferenceImage; // inherited from NSObject

	static new(): ARReferenceImage; // inherited from NSObject

	static referenceImagesInGroupNamedBundle(name: string, bundle: NSBundle): NSSet<ARReferenceImage>;

	name: string;

	readonly physicalSize: CGSize;

	constructor(o: { CGImage: any; orientation: CGImagePropertyOrientation; physicalWidth: number; });

	constructor(o: { pixelBuffer: any; orientation: CGImagePropertyOrientation; physicalWidth: number; });

	initWithCGImageOrientationPhysicalWidth(image: any, orientation: CGImagePropertyOrientation, physicalWidth: number): this;

	initWithPixelBufferOrientationPhysicalWidth(pixelBuffer: any, orientation: CGImagePropertyOrientation, physicalWidth: number): this;
}

declare class ARReferenceObject extends NSObject implements NSSecureCoding {

	static alloc(): ARReferenceObject; // inherited from NSObject

	static new(): ARReferenceObject; // inherited from NSObject

	static referenceObjectsInGroupNamedBundle(name: string, bundle: NSBundle): NSSet<ARReferenceObject>;

	readonly center: interop.Reference<number>;

	readonly extent: interop.Reference<number>;

	name: string;

	readonly rawFeaturePoints: ARPointCloud;

	readonly scale: interop.Reference<number>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { archiveURL: NSURL; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	exportObjectToURLPreviewImageError(url: NSURL, previewImage: UIImage): boolean;

	initWithArchiveURLError(url: NSURL): this;

	initWithCoder(aDecoder: NSCoder): this;

	referenceObjectByApplyingTransform(transform: simd_float4x4): ARReferenceObject;

	referenceObjectByMergingObjectError(object: ARReferenceObject): ARReferenceObject;
}

declare var ARReferenceObjectArchiveExtension: string;

declare var ARSCNDebugOptionShowFeaturePoints: SCNDebugOptions;

declare var ARSCNDebugOptionShowWorldOrigin: SCNDebugOptions;

declare class ARSCNFaceGeometry extends SCNGeometry {

	static alloc(): ARSCNFaceGeometry; // inherited from NSObject

	static faceGeometryWithDevice(device: MTLDevice): ARSCNFaceGeometry;

	static faceGeometryWithDeviceFillMesh(device: MTLDevice, fillMesh: boolean): ARSCNFaceGeometry;

	static geometry(): ARSCNFaceGeometry; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): ARSCNFaceGeometry; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): ARSCNFaceGeometry; // inherited from SCNGeometry

	static new(): ARSCNFaceGeometry; // inherited from NSObject

	updateFromFaceGeometry(faceGeometry: ARFaceGeometry): void;
}

declare class ARSCNPlaneGeometry extends SCNGeometry {

	static alloc(): ARSCNPlaneGeometry; // inherited from NSObject

	static geometry(): ARSCNPlaneGeometry; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): ARSCNPlaneGeometry; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): ARSCNPlaneGeometry; // inherited from SCNGeometry

	static new(): ARSCNPlaneGeometry; // inherited from NSObject

	static planeGeometryWithDevice(device: MTLDevice): ARSCNPlaneGeometry;

	updateFromPlaneGeometry(planeGeometry: ARPlaneGeometry): void;
}

declare class ARSCNView extends SCNView {

	static alloc(): ARSCNView; // inherited from NSObject

	static appearance(): ARSCNView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): ARSCNView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): ARSCNView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ARSCNView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): ARSCNView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ARSCNView; // inherited from UIAppearance

	static new(): ARSCNView; // inherited from NSObject

	automaticallyUpdatesLighting: boolean;

	delegate: ARSCNViewDelegate;

	session: ARSession;

	anchorForNode(node: SCNNode): ARAnchor;

	hitTestTypes(point: CGPoint, types: ARHitTestResultType): NSArray<ARHitTestResult>;

	nodeForAnchor(anchor: ARAnchor): SCNNode;

	unprojectPointOntoPlaneWithTransform(point: CGPoint, planeTransform: simd_float4x4): interop.Reference<number>;
}

interface ARSCNViewDelegate extends ARSessionObserver, SCNSceneRendererDelegate {

	rendererDidAddNodeForAnchor?(renderer: SCNSceneRenderer, node: SCNNode, anchor: ARAnchor): void;

	rendererDidRemoveNodeForAnchor?(renderer: SCNSceneRenderer, node: SCNNode, anchor: ARAnchor): void;

	rendererDidUpdateNodeForAnchor?(renderer: SCNSceneRenderer, node: SCNNode, anchor: ARAnchor): void;

	rendererNodeForAnchor?(renderer: SCNSceneRenderer, anchor: ARAnchor): SCNNode;

	rendererWillUpdateNodeForAnchor?(renderer: SCNSceneRenderer, node: SCNNode, anchor: ARAnchor): void;
}
declare var ARSCNViewDelegate: {

	prototype: ARSCNViewDelegate;
};

declare class ARSKView extends SKView {

	static alloc(): ARSKView; // inherited from NSObject

	static appearance(): ARSKView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): ARSKView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): ARSKView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ARSKView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): ARSKView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ARSKView; // inherited from UIAppearance

	static new(): ARSKView; // inherited from NSObject

	delegate: NSObject;

	session: ARSession;

	anchorForNode(node: SKNode): ARAnchor;

	hitTestTypes(point: CGPoint, types: ARHitTestResultType): NSArray<ARHitTestResult>;

	nodeForAnchor(anchor: ARAnchor): SKNode;
}

interface ARSKViewDelegate extends ARSessionObserver, SKViewDelegate {

	viewDidAddNodeForAnchor?(view: ARSKView, node: SKNode, anchor: ARAnchor): void;

	viewDidRemoveNodeForAnchor?(view: ARSKView, node: SKNode, anchor: ARAnchor): void;

	viewDidUpdateNodeForAnchor?(view: ARSKView, node: SKNode, anchor: ARAnchor): void;

	viewNodeForAnchor?(view: ARSKView, anchor: ARAnchor): SKNode;

	viewWillUpdateNodeForAnchor?(view: ARSKView, node: SKNode, anchor: ARAnchor): void;
}
declare var ARSKViewDelegate: {

	prototype: ARSKViewDelegate;
};

declare class ARSession extends NSObject {

	static alloc(): ARSession; // inherited from NSObject

	static new(): ARSession; // inherited from NSObject

	readonly configuration: ARConfiguration;

	readonly currentFrame: ARFrame;

	delegate: ARSessionDelegate;

	delegateQueue: NSObject;

	addAnchor(anchor: ARAnchor): void;

	createReferenceObjectWithTransformCenterExtentCompletionHandler(transform: simd_float4x4, center: interop.Reference<number>, extent: interop.Reference<number>, completionHandler: (p1: ARReferenceObject, p2: NSError) => void): void;

	getCurrentWorldMapWithCompletionHandler(completionHandler: (p1: ARWorldMap, p2: NSError) => void): void;

	pause(): void;

	removeAnchor(anchor: ARAnchor): void;

	runWithConfiguration(configuration: ARConfiguration): void;

	runWithConfigurationOptions(configuration: ARConfiguration, options: ARSessionRunOptions): void;

	setWorldOrigin(relativeTransform: simd_float4x4): void;
}

interface ARSessionDelegate extends ARSessionObserver {

	sessionDidAddAnchors?(session: ARSession, anchors: NSArray<ARAnchor> | ARAnchor[]): void;

	sessionDidRemoveAnchors?(session: ARSession, anchors: NSArray<ARAnchor> | ARAnchor[]): void;

	sessionDidUpdateAnchors?(session: ARSession, anchors: NSArray<ARAnchor> | ARAnchor[]): void;

	sessionDidUpdateFrame?(session: ARSession, frame: ARFrame): void;
}
declare var ARSessionDelegate: {

	prototype: ARSessionDelegate;
};

interface ARSessionObserver extends NSObjectProtocol {

	sessionCameraDidChangeTrackingState?(session: ARSession, camera: ARCamera): void;

	sessionDidFailWithError?(session: ARSession, error: NSError): void;

	sessionDidOutputAudioSampleBuffer?(session: ARSession, audioSampleBuffer: any): void;

	sessionInterruptionEnded?(session: ARSession): void;

	sessionShouldAttemptRelocalization?(session: ARSession): boolean;

	sessionWasInterrupted?(session: ARSession): void;
}
declare var ARSessionObserver: {

	prototype: ARSessionObserver;
};

declare const enum ARSessionRunOptions {

	ResetTracking = 1,

	RemoveExistingAnchors = 2
}

interface ARTrackable extends NSObjectProtocol {

	isTracked: boolean;
}
declare var ARTrackable: {

	prototype: ARTrackable;
};

declare const enum ARTrackingState {

	NotAvailable = 0,

	Limited = 1,

	Normal = 2
}

declare const enum ARTrackingStateReason {

	None = 0,

	Initializing = 1,

	ExcessiveMotion = 2,

	InsufficientFeatures = 3,

	Relocalizing = 4
}

declare class ARVideoFormat extends NSObject implements NSCopying {

	static alloc(): ARVideoFormat; // inherited from NSObject

	static new(): ARVideoFormat; // inherited from NSObject

	readonly framesPerSecond: number;

	readonly imageResolution: CGSize;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum ARWorldAlignment {

	Gravity = 0,

	GravityAndHeading = 1,

	Camera = 2
}

declare class ARWorldMap extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ARWorldMap; // inherited from NSObject

	static new(): ARWorldMap; // inherited from NSObject

	anchors: NSArray<ARAnchor>;

	readonly center: interop.Reference<number>;

	readonly extent: interop.Reference<number>;

	readonly rawFeaturePoints: ARPointCloud;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare const enum ARWorldMappingStatus {

	NotAvailable = 0,

	Limited = 1,

	Extending = 2,

	Mapped = 3
}

declare class ARWorldTrackingConfiguration extends ARConfiguration {

	static alloc(): ARWorldTrackingConfiguration; // inherited from NSObject

	static new(): ARWorldTrackingConfiguration; // inherited from NSObject

	autoFocusEnabled: boolean;

	detectionImages: NSSet<ARReferenceImage>;

	detectionObjects: NSSet<ARReferenceObject>;

	environmentTexturing: AREnvironmentTexturing;

	initialWorldMap: ARWorldMap;

	maximumNumberOfTrackedImages: number;

	planeDetection: ARPlaneDetection;
}
