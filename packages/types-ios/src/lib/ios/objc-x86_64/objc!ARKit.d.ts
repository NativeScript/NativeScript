
declare const enum ARAltitudeSource {

	Unknown = 0,

	Coarse = 1,

	Precise = 2,

	UserDefined = 3
}

/**
 * @since 11.0
 */
declare class ARAnchor extends NSObject implements ARAnchorCopying, NSSecureCoding {

	static alloc(): ARAnchor; // inherited from NSObject

	static new(): ARAnchor; // inherited from NSObject

	readonly identifier: NSUUID;

	/**
	 * @since 12.0
	 */
	readonly name: string;

	/**
	 * @since 13.0
	 */
	readonly sessionIdentifier: NSUUID;

	readonly transform: simd_float4x4;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { anchor: ARAnchor; }); // inherited from ARAnchorCopying

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 12.0
	 */
	constructor(o: { name: string; transform: simd_float4x4; });

	constructor(o: { transform: simd_float4x4; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAnchor(anchor: ARAnchor): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 12.0
	 */
	initWithNameTransform(name: string, transform: simd_float4x4): this;

	initWithTransform(transform: simd_float4x4): this;
}

/**
 * @since 12.0
 */
interface ARAnchorCopying extends NSCopying {

	initWithAnchor?(anchor: ARAnchor): ARAnchorCopying;
}
declare var ARAnchorCopying: {

	prototype: ARAnchorCopying;
};

/**
 * @since 14.3
 */
declare class ARAppClipCodeAnchor extends ARAnchor implements ARTrackable {

	static alloc(): ARAppClipCodeAnchor; // inherited from NSObject

	static new(): ARAppClipCodeAnchor; // inherited from NSObject

	readonly radius: number;

	readonly url: NSURL;

	readonly urlDecodingState: ARAppClipCodeURLDecodingState;

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

declare const enum ARAppClipCodeURLDecodingState {

	Decoding = 0,

	Failed = 1,

	Decoded = 2
}

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationBrowDownLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationBrowDownRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationBrowInnerUp: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationBrowOuterUpLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationBrowOuterUpRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationCheekPuff: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationCheekSquintLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationCheekSquintRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeBlinkLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeBlinkRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeLookDownLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeLookDownRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeLookInLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeLookInRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeLookOutLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeLookOutRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeLookUpLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeLookUpRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeSquintLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeSquintRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeWideLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationEyeWideRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationJawForward: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationJawLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationJawOpen: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationJawRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthClose: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthDimpleLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthDimpleRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthFrownLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthFrownRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthFunnel: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthLowerDownLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthLowerDownRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthPressLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthPressRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthPucker: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthRollLower: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthRollUpper: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthShrugLower: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthShrugUpper: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthSmileLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthSmileRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthStretchLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthStretchRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthUpperUpLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationMouthUpperUpRight: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationNoseSneerLeft: string;

/**
 * @since 11.0
 */
declare var ARBlendShapeLocationNoseSneerRight: string;

/**
 * @since 12.0
 */
declare var ARBlendShapeLocationTongueOut: string;

/**
 * @since 13.0
 */
declare class ARBody2D extends NSObject {

	static alloc(): ARBody2D; // inherited from NSObject

	static new(): ARBody2D; // inherited from NSObject

	readonly skeleton: ARSkeleton2D;
}

/**
 * @since 13.0
 */
declare class ARBodyAnchor extends ARAnchor implements ARTrackable {

	static alloc(): ARBodyAnchor; // inherited from NSObject

	static new(): ARBodyAnchor; // inherited from NSObject

	readonly estimatedScaleFactor: number;

	readonly skeleton: ARSkeleton3D;

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

/**
 * @since 13.0
 */
declare class ARBodyTrackingConfiguration extends ARConfiguration {

	static alloc(): ARBodyTrackingConfiguration; // inherited from NSObject

	static new(): ARBodyTrackingConfiguration; // inherited from NSObject

	/**
	 * @since 14.3
	 */
	appClipCodeTrackingEnabled: boolean;

	autoFocusEnabled: boolean;

	automaticImageScaleEstimationEnabled: boolean;

	automaticSkeletonScaleEstimationEnabled: boolean;

	detectionImages: NSSet<ARReferenceImage>;

	environmentTexturing: AREnvironmentTexturing;

	initialWorldMap: ARWorldMap;

	maximumNumberOfTrackedImages: number;

	planeDetection: ARPlaneDetection;

	wantsHDREnvironmentTextures: boolean;

	/**
	 * @since 14.3
	 */
	static readonly supportsAppClipCodeTracking: boolean;
}

/**
 * @since 11.0
 */
declare class ARCamera extends NSObject implements NSCopying {

	static alloc(): ARCamera; // inherited from NSObject

	static new(): ARCamera; // inherited from NSObject

	readonly eulerAngles: interop.Reference<number>;

	/**
	 * @since 13.0
	 */
	readonly exposureDuration: number;

	/**
	 * @since 13.0
	 */
	readonly exposureOffset: number;

	readonly imageResolution: CGSize;

	readonly intrinsics: simd_float3x3;

	readonly projectionMatrix: simd_float4x4;

	readonly trackingState: ARTrackingState;

	readonly trackingStateReason: ARTrackingStateReason;

	readonly transform: simd_float4x4;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	projectPointOrientationViewportSize(point: interop.Reference<number>, orientation: UIInterfaceOrientation, viewportSize: CGSize): CGPoint;

	projectionMatrixForOrientationViewportSizeZNearZFar(orientation: UIInterfaceOrientation, viewportSize: CGSize, zNear: number, zFar: number): simd_float4x4;

	/**
	 * @since 12.0
	 */
	unprojectPointOntoPlaneWithTransformOrientationViewportSize(point: CGPoint, planeTransform: simd_float4x4, orientation: UIInterfaceOrientation, viewportSize: CGSize): interop.Reference<number>;

	viewMatrixForOrientation(orientation: UIInterfaceOrientation): simd_float4x4;
}

declare const enum ARCoachingGoal {

	Tracking = 0,

	HorizontalPlane = 1,

	VerticalPlane = 2,

	AnyPlane = 3,

	GeoTracking = 4
}

/**
 * @since 13.0
 */
declare class ARCoachingOverlayView extends UIView {

	static alloc(): ARCoachingOverlayView; // inherited from NSObject

	static appearance(): ARCoachingOverlayView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): ARCoachingOverlayView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): ARCoachingOverlayView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ARCoachingOverlayView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): ARCoachingOverlayView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ARCoachingOverlayView; // inherited from UIAppearance

	static new(): ARCoachingOverlayView; // inherited from NSObject

	activatesAutomatically: boolean;

	delegate: ARCoachingOverlayViewDelegate;

	goal: ARCoachingGoal;

	readonly isActive: boolean;

	session: ARSession;

	sessionProvider: NSObject & ARSessionProviding;

	setActiveAnimated(active: boolean, animated: boolean): void;
}

/**
 * @since 13.0
 */
interface ARCoachingOverlayViewDelegate extends NSObjectProtocol {

	coachingOverlayViewDidDeactivate?(coachingOverlayView: ARCoachingOverlayView): void;

	coachingOverlayViewDidRequestSessionReset?(coachingOverlayView: ARCoachingOverlayView): void;

	coachingOverlayViewWillActivate?(coachingOverlayView: ARCoachingOverlayView): void;
}
declare var ARCoachingOverlayViewDelegate: {

	prototype: ARCoachingOverlayViewDelegate;
};

/**
 * @since 13.0
 */
declare class ARCollaborationData extends NSObject implements NSSecureCoding {

	static alloc(): ARCollaborationData; // inherited from NSObject

	static new(): ARCollaborationData; // inherited from NSObject

	readonly priority: ARCollaborationDataPriority;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum ARCollaborationDataPriority {

	Critical = 0,

	Optional = 1
}

/**
 * @since 14.0
 */
declare const enum ARConfidenceLevel {

	Low = 0,

	Medium = 1,

	High = 2
}

/**
 * @since 11.0
 */
declare class ARConfiguration extends NSObject implements NSCopying {

	static alloc(): ARConfiguration; // inherited from NSObject

	static new(): ARConfiguration; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static supportsFrameSemantics(frameSemantics: ARFrameSemantics): boolean;

	/**
	 * @since 13.0
	 */
	frameSemantics: ARFrameSemantics;

	lightEstimationEnabled: boolean;

	providesAudioData: boolean;

	/**
	 * @since 11.3
	 */
	videoFormat: ARVideoFormat;

	/**
	 * @since 16.0
	 */
	videoHDRAllowed: boolean;

	worldAlignment: ARWorldAlignment;

	/**
	 * @since 16.0
	 */
	static readonly configurableCaptureDeviceForPrimaryCamera: AVCaptureDevice;

	static readonly isSupported: boolean;

	/**
	 * @since 16.0
	 */
	static readonly recommendedVideoFormatFor4KResolution: ARVideoFormat;

	/**
	 * @since 16.0
	 */
	static readonly recommendedVideoFormatForHighResolutionFrameCapturing: ARVideoFormat;

	/**
	 * @since 11.3
	 */
	static readonly supportedVideoFormats: NSArray<ARVideoFormat>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class ARDepthData extends NSObject {

	static alloc(): ARDepthData; // inherited from NSObject

	static new(): ARDepthData; // inherited from NSObject

	readonly confidenceMap: any;

	readonly depthMap: any;
}

/**
 * @since 11.0
 */
declare class ARDirectionalLightEstimate extends ARLightEstimate {

	static alloc(): ARDirectionalLightEstimate; // inherited from NSObject

	static new(): ARDirectionalLightEstimate; // inherited from NSObject

	readonly primaryLightDirection: interop.Reference<number>;

	readonly primaryLightIntensity: number;

	readonly sphericalHarmonicsCoefficients: NSData;
}

/**
 * @since 12.0
 */
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

	LocationUnauthorized = 105,

	HighResolutionFrameCaptureInProgress = 106,

	HighResolutionFrameCaptureFailed = 107,

	WorldTrackingFailed = 200,

	GeoTrackingNotAvailableAtLocation = 201,

	GeoTrackingFailed = 202,

	InvalidReferenceImage = 300,

	InvalidReferenceObject = 301,

	InvalidWorldMap = 302,

	InvalidConfiguration = 303,

	InvalidCollaborationData = 304,

	InsufficientFeatures = 400,

	ObjectMergeFailed = 401,

	FileIOFailed = 500,

	RequestFailed = 501
}

/**
 * @since 11.0
 */
declare var ARErrorDomain: string;

/**
 * @since 11.0
 */
declare class ARFaceAnchor extends ARAnchor implements ARTrackable {

	static alloc(): ARFaceAnchor; // inherited from NSObject

	static new(): ARFaceAnchor; // inherited from NSObject

	readonly blendShapes: NSDictionary<string, number>;

	readonly geometry: ARFaceGeometry;

	/**
	 * @since 12.0
	 */
	readonly leftEyeTransform: simd_float4x4;

	/**
	 * @since 12.0
	 */
	readonly lookAtPoint: interop.Reference<number>;

	/**
	 * @since 12.0
	 */
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

/**
 * @since 11.0
 */
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

	encodeWithCoder(coder: NSCoder): void;

	initWithBlendShapes(blendShapes: NSDictionary<string, number>): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare class ARFaceTrackingConfiguration extends ARConfiguration {

	static alloc(): ARFaceTrackingConfiguration; // inherited from NSObject

	static new(): ARFaceTrackingConfiguration; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	maximumNumberOfTrackedFaces: number;

	/**
	 * @since 13.0
	 */
	worldTrackingEnabled: boolean;

	/**
	 * @since 13.0
	 */
	static readonly supportedNumberOfTrackedFaces: number;

	/**
	 * @since 13.0
	 */
	static readonly supportsWorldTracking: boolean;
}

/**
 * @since 11.0
 */
declare class ARFrame extends NSObject implements NSCopying {

	static alloc(): ARFrame; // inherited from NSObject

	static new(): ARFrame; // inherited from NSObject

	readonly anchors: NSArray<ARAnchor>;

	readonly camera: ARCamera;

	/**
	 * @since 13.0
	 */
	readonly cameraGrainIntensity: number;

	/**
	 * @since 13.0
	 */
	readonly cameraGrainTexture: MTLTexture;

	readonly capturedDepthData: AVDepthData;

	readonly capturedDepthDataTimestamp: number;

	readonly capturedImage: any;

	/**
	 * @since 13.0
	 */
	readonly detectedBody: ARBody2D;

	/**
	 * @since 13.0
	 */
	readonly estimatedDepthData: any;

	/**
	 * @since 16.0
	 */
	readonly exifData: NSDictionary<string, any>;

	/**
	 * @since 14.0
	 */
	readonly geoTrackingStatus: ARGeoTrackingStatus;

	readonly lightEstimate: ARLightEstimate;

	readonly rawFeaturePoints: ARPointCloud;

	/**
	 * @since 14.0
	 */
	readonly sceneDepth: ARDepthData;

	/**
	 * @since 13.0
	 */
	readonly segmentationBuffer: any;

	/**
	 * @since 14.0
	 */
	readonly smoothedSceneDepth: ARDepthData;

	readonly timestamp: number;

	/**
	 * @since 12.0
	 */
	readonly worldMappingStatus: ARWorldMappingStatus;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	displayTransformForOrientationViewportSize(orientation: UIInterfaceOrientation, viewportSize: CGSize): CGAffineTransform;

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	hitTestTypes(point: CGPoint, types: ARHitTestResultType): NSArray<ARHitTestResult>;

	/**
	 * @since 13.0
	 */
	raycastQueryFromPointAllowingTargetAlignment(point: CGPoint, target: ARRaycastTarget, alignment: ARRaycastTargetAlignment): ARRaycastQuery;
}

declare const enum ARFrameSemantics {

	None = 0,

	PersonSegmentation = 1,

	PersonSegmentationWithDepth = 3,

	BodyDetection = 4,

	SceneDepth = 8,

	SmoothedSceneDepth = 16
}

/**
 * @since 14.0
 */
declare class ARGeoAnchor extends ARAnchor implements ARTrackable {

	static alloc(): ARGeoAnchor; // inherited from NSObject

	static new(): ARGeoAnchor; // inherited from NSObject

	readonly altitude: number;

	readonly altitudeSource: ARAltitudeSource;

	readonly coordinate: CLLocationCoordinate2D;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly isTracked: boolean; // inherited from ARTrackable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coordinate: CLLocationCoordinate2D; });

	constructor(o: { coordinate: CLLocationCoordinate2D; altitude: number; });

	constructor(o: { name: string; coordinate: CLLocationCoordinate2D; });

	constructor(o: { name: string; coordinate: CLLocationCoordinate2D; altitude: number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithCoordinate(coordinate: CLLocationCoordinate2D): this;

	initWithCoordinateAltitude(coordinate: CLLocationCoordinate2D, altitude: number): this;

	initWithNameCoordinate(name: string, coordinate: CLLocationCoordinate2D): this;

	initWithNameCoordinateAltitude(name: string, coordinate: CLLocationCoordinate2D, altitude: number): this;

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

declare const enum ARGeoTrackingAccuracy {

	Undetermined = 0,

	Low = 1,

	Medium = 2,

	High = 3
}

/**
 * @since 14.0
 */
declare class ARGeoTrackingConfiguration extends ARConfiguration {

	static alloc(): ARGeoTrackingConfiguration; // inherited from NSObject

	static checkAvailabilityAtCoordinateCompletionHandler(coordinate: CLLocationCoordinate2D, completionHandler: (p1: boolean, p2: NSError) => void): void;

	static checkAvailabilityWithCompletionHandler(completionHandler: (p1: boolean, p2: NSError) => void): void;

	static new(): ARGeoTrackingConfiguration; // inherited from NSObject

	/**
	 * @since 14.3
	 */
	appClipCodeTrackingEnabled: boolean;

	automaticImageScaleEstimationEnabled: boolean;

	detectionImages: NSSet<ARReferenceImage>;

	detectionObjects: NSSet<ARReferenceObject>;

	environmentTexturing: AREnvironmentTexturing;

	maximumNumberOfTrackedImages: number;

	planeDetection: ARPlaneDetection;

	wantsHDREnvironmentTextures: boolean;

	/**
	 * @since 14.3
	 */
	static readonly supportsAppClipCodeTracking: boolean;
}

declare const enum ARGeoTrackingState {

	NotAvailable = 0,

	Initializing = 1,

	Localizing = 2,

	Localized = 3
}

declare const enum ARGeoTrackingStateReason {

	None = 0,

	NotAvailableAtLocation = 1,

	NeedLocationPermissions = 2,

	WorldTrackingUnstable = 3,

	WaitingForLocation = 4,

	WaitingForAvailabilityCheck = 5,

	GeoDataNotLoaded = 6,

	DevicePointedTooLow = 7,

	VisualLocalizationFailed = 8
}

/**
 * @since 14.0
 */
declare class ARGeoTrackingStatus extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ARGeoTrackingStatus; // inherited from NSObject

	static new(): ARGeoTrackingStatus; // inherited from NSObject

	readonly accuracy: ARGeoTrackingAccuracy;

	readonly state: ARGeoTrackingState;

	readonly stateReason: ARGeoTrackingStateReason;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.4
 */
declare class ARGeometryElement extends NSObject implements NSSecureCoding {

	static alloc(): ARGeometryElement; // inherited from NSObject

	static new(): ARGeometryElement; // inherited from NSObject

	readonly buffer: MTLBuffer;

	readonly bytesPerIndex: number;

	readonly count: number;

	readonly indexCountPerPrimitive: number;

	readonly primitiveType: ARGeometryPrimitiveType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum ARGeometryPrimitiveType {

	Line = 0,

	Triangle = 1
}

/**
 * @since 13.4
 */
declare class ARGeometrySource extends NSObject implements NSSecureCoding {

	static alloc(): ARGeometrySource; // inherited from NSObject

	static new(): ARGeometrySource; // inherited from NSObject

	readonly buffer: MTLBuffer;

	readonly componentsPerVector: number;

	readonly count: number;

	readonly format: MTLVertexFormat;

	readonly offset: number;

	readonly stride: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 * @deprecated 14.0
 */
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

/**
 * @since 11.3
 */
declare class ARImageAnchor extends ARAnchor implements ARTrackable {

	static alloc(): ARImageAnchor; // inherited from NSObject

	static new(): ARImageAnchor; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly estimatedScaleFactor: number;

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

/**
 * @since 12.0
 */
declare class ARImageTrackingConfiguration extends ARConfiguration {

	static alloc(): ARImageTrackingConfiguration; // inherited from NSObject

	static new(): ARImageTrackingConfiguration; // inherited from NSObject

	autoFocusEnabled: boolean;

	maximumNumberOfTrackedImages: number;

	trackingImages: NSSet<ARReferenceImage>;
}

/**
 * @since 11.0
 */
declare class ARLightEstimate extends NSObject {

	static alloc(): ARLightEstimate; // inherited from NSObject

	static new(): ARLightEstimate; // inherited from NSObject

	readonly ambientColorTemperature: number;

	readonly ambientIntensity: number;
}

/**
 * @since 13.0
 */
declare class ARMatteGenerator extends NSObject {

	static alloc(): ARMatteGenerator; // inherited from NSObject

	static new(): ARMatteGenerator; // inherited from NSObject

	constructor(o: { device: MTLDevice; matteResolution: ARMatteResolution; });

	generateDilatedDepthFromFrameCommandBuffer(frame: ARFrame, commandBuffer: MTLCommandBuffer): MTLTexture;

	generateMatteFromFrameCommandBuffer(frame: ARFrame, commandBuffer: MTLCommandBuffer): MTLTexture;

	initWithDeviceMatteResolution(device: MTLDevice, matteResolution: ARMatteResolution): this;
}

declare const enum ARMatteResolution {

	Full = 0,

	Half = 1
}

/**
 * @since 13.4
 */
declare class ARMeshAnchor extends ARAnchor {

	static alloc(): ARMeshAnchor; // inherited from NSObject

	static new(): ARMeshAnchor; // inherited from NSObject

	readonly geometry: ARMeshGeometry;
}

declare const enum ARMeshClassification {

	None = 0,

	Wall = 1,

	Floor = 2,

	Ceiling = 3,

	Table = 4,

	Seat = 5,

	Window = 6,

	Door = 7
}

/**
 * @since 13.4
 */
declare class ARMeshGeometry extends NSObject implements NSSecureCoding {

	static alloc(): ARMeshGeometry; // inherited from NSObject

	static new(): ARMeshGeometry; // inherited from NSObject

	readonly classification: ARGeometrySource;

	readonly faces: ARGeometryElement;

	readonly normals: ARGeometrySource;

	readonly vertices: ARGeometrySource;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 12.0
 */
declare class ARObjectAnchor extends ARAnchor {

	static alloc(): ARObjectAnchor; // inherited from NSObject

	static new(): ARObjectAnchor; // inherited from NSObject

	readonly referenceObject: ARReferenceObject;
}

/**
 * @since 12.0
 */
declare class ARObjectScanningConfiguration extends ARConfiguration {

	static alloc(): ARObjectScanningConfiguration; // inherited from NSObject

	static new(): ARObjectScanningConfiguration; // inherited from NSObject

	autoFocusEnabled: boolean;

	planeDetection: ARPlaneDetection;
}

/**
 * @since 11.0
 */
declare class AROrientationTrackingConfiguration extends ARConfiguration {

	static alloc(): AROrientationTrackingConfiguration; // inherited from NSObject

	static new(): AROrientationTrackingConfiguration; // inherited from NSObject

	/**
	 * @since 11.3
	 */
	autoFocusEnabled: boolean;
}

/**
 * @since 13.0
 */
declare class ARParticipantAnchor extends ARAnchor {

	static alloc(): ARParticipantAnchor; // inherited from NSObject

	static new(): ARParticipantAnchor; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare class ARPlaneAnchor extends ARAnchor {

	static alloc(): ARPlaneAnchor; // inherited from NSObject

	static new(): ARPlaneAnchor; // inherited from NSObject

	readonly alignment: ARPlaneAnchorAlignment;

	readonly center: interop.Reference<number>;

	/**
	 * @since 12.0
	 */
	readonly classification: ARPlaneClassification;

	/**
	 * @since 12.0
	 */
	readonly classificationStatus: ARPlaneClassificationStatus;

	/**
	 * @since 11.0
	 * @deprecated 16.0
	 */
	readonly extent: interop.Reference<number>;

	/**
	 * @since 11.3
	 */
	readonly geometry: ARPlaneGeometry;

	/**
	 * @since 16.0
	 */
	readonly planeExtent: ARPlaneExtent;

	/**
	 * @since 12.0
	 */
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

	Seat = 5,

	Window = 6,

	Door = 7
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

/**
 * @since 16.0
 */
declare class ARPlaneExtent extends NSObject implements NSSecureCoding {

	static alloc(): ARPlaneExtent; // inherited from NSObject

	static new(): ARPlaneExtent; // inherited from NSObject

	readonly height: number;

	readonly rotationOnYAxis: number;

	readonly width: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.3
 */
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

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare class ARPointCloud extends NSObject implements NSSecureCoding {

	static alloc(): ARPointCloud; // inherited from NSObject

	static new(): ARPointCloud; // inherited from NSObject

	readonly count: number;

	readonly identifiers: interop.Pointer | interop.Reference<number>;

	readonly points: interop.Pointer | interop.Reference<interop.Reference<number>>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class ARPositionalTrackingConfiguration extends ARConfiguration {

	static alloc(): ARPositionalTrackingConfiguration; // inherited from NSObject

	static new(): ARPositionalTrackingConfiguration; // inherited from NSObject

	initialWorldMap: ARWorldMap;

	planeDetection: ARPlaneDetection;
}

/**
 * @since 13.0
 */
declare class ARQuickLookPreviewItem extends NSObject implements QLPreviewItem {

	static alloc(): ARQuickLookPreviewItem; // inherited from NSObject

	static new(): ARQuickLookPreviewItem; // inherited from NSObject

	allowsContentScaling: boolean;

	canonicalWebPageURL: NSURL;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly previewItemTitle: string; // inherited from QLPreviewItem

	readonly previewItemURL: NSURL; // inherited from QLPreviewItem

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { fileAtURL: NSURL; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithFileAtURL(url: NSURL): this;

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

/**
 * @since 13.0
 */
declare class ARRaycastQuery extends NSObject {

	static alloc(): ARRaycastQuery; // inherited from NSObject

	static new(): ARRaycastQuery; // inherited from NSObject

	readonly direction: interop.Reference<number>;

	readonly origin: interop.Reference<number>;

	readonly target: ARRaycastTarget;

	readonly targetAlignment: ARRaycastTargetAlignment;

	constructor(o: { origin: interop.Reference<number>; direction: interop.Reference<number>; allowingTarget: ARRaycastTarget; alignment: ARRaycastTargetAlignment; });

	initWithOriginDirectionAllowingTargetAlignment(origin: interop.Reference<number>, direction: interop.Reference<number>, target: ARRaycastTarget, alignment: ARRaycastTargetAlignment): this;
}

/**
 * @since 13.0
 */
declare class ARRaycastResult extends NSObject {

	static alloc(): ARRaycastResult; // inherited from NSObject

	static new(): ARRaycastResult; // inherited from NSObject

	readonly anchor: ARAnchor;

	readonly target: ARRaycastTarget;

	readonly targetAlignment: ARRaycastTargetAlignment;

	readonly worldTransform: simd_float4x4;
}

declare const enum ARRaycastTarget {

	ExistingPlaneGeometry = 0,

	ExistingPlaneInfinite = 1,

	EstimatedPlane = 2
}

declare const enum ARRaycastTargetAlignment {

	Horizontal = 0,

	Vertical = 1,

	Any = 2
}

/**
 * @since 11.3
 */
declare class ARReferenceImage extends NSObject {

	static alloc(): ARReferenceImage; // inherited from NSObject

	static new(): ARReferenceImage; // inherited from NSObject

	static referenceImagesInGroupNamedBundle(name: string, bundle: NSBundle): NSSet<ARReferenceImage>;

	name: string;

	readonly physicalSize: CGSize;

	/**
	 * @since 13.0
	 */
	readonly resourceGroupName: string;

	constructor(o: { CGImage: any; orientation: CGImagePropertyOrientation; physicalWidth: number; });

	constructor(o: { pixelBuffer: any; orientation: CGImagePropertyOrientation; physicalWidth: number; });

	initWithCGImageOrientationPhysicalWidth(image: any, orientation: CGImagePropertyOrientation, physicalWidth: number): this;

	initWithPixelBufferOrientationPhysicalWidth(pixelBuffer: any, orientation: CGImagePropertyOrientation, physicalWidth: number): this;

	/**
	 * @since 13.0
	 */
	validateWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 12.0
 */
declare class ARReferenceObject extends NSObject implements NSSecureCoding {

	static alloc(): ARReferenceObject; // inherited from NSObject

	static new(): ARReferenceObject; // inherited from NSObject

	static referenceObjectsInGroupNamedBundle(name: string, bundle: NSBundle): NSSet<ARReferenceObject>;

	readonly center: interop.Reference<number>;

	readonly extent: interop.Reference<number>;

	name: string;

	readonly rawFeaturePoints: ARPointCloud;

	/**
	 * @since 13.0
	 */
	readonly resourceGroupName: string;

	readonly scale: interop.Reference<number>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { archiveURL: NSURL; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	exportObjectToURLPreviewImageError(url: NSURL, previewImage: UIImage): boolean;

	initWithArchiveURLError(url: NSURL): this;

	initWithCoder(coder: NSCoder): this;

	referenceObjectByApplyingTransform(transform: simd_float4x4): ARReferenceObject;

	referenceObjectByMergingObjectError(object: ARReferenceObject): ARReferenceObject;
}

/**
 * @since 12.0
 */
declare var ARReferenceObjectArchiveExtension: string;

/**
 * @since 11.0
 */
declare var ARSCNDebugOptionShowFeaturePoints: SCNDebugOptions;

/**
 * @since 11.0
 */
declare var ARSCNDebugOptionShowWorldOrigin: SCNDebugOptions;

/**
 * @since 11.0
 */
declare class ARSCNFaceGeometry extends SCNGeometry {

	static alloc(): ARSCNFaceGeometry; // inherited from NSObject

	static faceGeometryWithDevice(device: MTLDevice): ARSCNFaceGeometry;

	static faceGeometryWithDeviceFillMesh(device: MTLDevice, fillMesh: boolean): ARSCNFaceGeometry;

	static geometry(): ARSCNFaceGeometry; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): ARSCNFaceGeometry; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): ARSCNFaceGeometry; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): ARSCNFaceGeometry; // inherited from SCNGeometry

	static new(): ARSCNFaceGeometry; // inherited from NSObject

	updateFromFaceGeometry(faceGeometry: ARFaceGeometry): void;
}

/**
 * @since 11.3
 */
declare class ARSCNPlaneGeometry extends SCNGeometry {

	static alloc(): ARSCNPlaneGeometry; // inherited from NSObject

	static geometry(): ARSCNPlaneGeometry; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): ARSCNPlaneGeometry; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): ARSCNPlaneGeometry; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): ARSCNPlaneGeometry; // inherited from SCNGeometry

	static new(): ARSCNPlaneGeometry; // inherited from NSObject

	static planeGeometryWithDevice(device: MTLDevice): ARSCNPlaneGeometry;

	updateFromPlaneGeometry(planeGeometry: ARPlaneGeometry): void;
}

/**
 * @since 11.0
 */
declare class ARSCNView extends SCNView implements ARSessionProviding {

	static alloc(): ARSCNView; // inherited from NSObject

	static appearance(): ARSCNView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): ARSCNView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): ARSCNView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ARSCNView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): ARSCNView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ARSCNView; // inherited from UIAppearance

	static new(): ARSCNView; // inherited from NSObject

	automaticallyUpdatesLighting: boolean;

	delegate: ARSCNViewDelegate;

	/**
	 * @since 13.0
	 */
	rendersCameraGrain: boolean;

	/**
	 * @since 13.0
	 */
	rendersMotionBlur: boolean;

	session: ARSession;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	anchorForNode(node: SCNNode): ARAnchor;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	hitTestTypes(point: CGPoint, types: ARHitTestResultType): NSArray<ARHitTestResult>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	nodeForAnchor(anchor: ARAnchor): SCNNode;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 13.0
	 */
	raycastQueryFromPointAllowingTargetAlignment(point: CGPoint, target: ARRaycastTarget, alignment: ARRaycastTargetAlignment): ARRaycastQuery;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 12.0
	 */
	unprojectPointOntoPlaneWithTransform(point: CGPoint, planeTransform: simd_float4x4): interop.Reference<number>;
}

/**
 * @since 11.0
 */
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

/**
 * @since 11.0
 */
declare class ARSKView extends SKView implements ARSessionProviding {

	static alloc(): ARSKView; // inherited from NSObject

	static appearance(): ARSKView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): ARSKView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): ARSKView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ARSKView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): ARSKView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ARSKView; // inherited from UIAppearance

	static new(): ARSKView; // inherited from NSObject

	delegate: NSObject & ARSKViewDelegate;

	session: ARSession;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	anchorForNode(node: SKNode): ARAnchor;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	hitTestTypes(point: CGPoint, types: ARHitTestResultType): NSArray<ARHitTestResult>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	nodeForAnchor(anchor: ARAnchor): SKNode;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 11.0
 */
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

declare const enum ARSceneReconstruction {

	None = 0,

	Mesh = 1,

	MeshWithClassification = 3
}

declare const enum ARSegmentationClass {

	None = 0,

	Person = 255
}

/**
 * @since 11.0
 */
declare class ARSession extends NSObject {

	static alloc(): ARSession; // inherited from NSObject

	static new(): ARSession; // inherited from NSObject

	readonly configuration: ARConfiguration;

	readonly currentFrame: ARFrame;

	delegate: ARSessionDelegate;

	delegateQueue: NSObject & OS_dispatch_queue;

	/**
	 * @since 13.0
	 */
	readonly identifier: NSUUID;

	addAnchor(anchor: ARAnchor): void;

	/**
	 * @since 16.0
	 */
	captureHighResolutionFrameWithCompletion(completion: (p1: ARFrame, p2: NSError) => void): void;

	/**
	 * @since 12.0
	 */
	createReferenceObjectWithTransformCenterExtentCompletionHandler(transform: simd_float4x4, center: interop.Reference<number>, extent: interop.Reference<number>, completionHandler: (p1: ARReferenceObject, p2: NSError) => void): void;

	/**
	 * @since 12.0
	 */
	getCurrentWorldMapWithCompletionHandler(completionHandler: (p1: ARWorldMap, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	getGeoLocationForPointCompletionHandler(position: interop.Reference<number>, completionHandler: (p1: CLLocationCoordinate2D, p2: number, p3: NSError) => void): void;

	pause(): void;

	/**
	 * @since 13.0
	 */
	raycast(query: ARRaycastQuery): NSArray<ARRaycastResult>;

	removeAnchor(anchor: ARAnchor): void;

	runWithConfiguration(configuration: ARConfiguration): void;

	runWithConfigurationOptions(configuration: ARConfiguration, options: ARSessionRunOptions): void;

	/**
	 * @since 11.3
	 */
	setWorldOrigin(relativeTransform: simd_float4x4): void;

	/**
	 * @since 13.0
	 */
	trackedRaycastUpdateHandler(query: ARRaycastQuery, updateHandler: (p1: NSArray<ARRaycastResult>) => void): ARTrackedRaycast;

	/**
	 * @since 13.0
	 */
	updateWithCollaborationData(collaborationData: ARCollaborationData): void;
}

/**
 * @since 11.0
 */
interface ARSessionDelegate extends ARSessionObserver {

	sessionDidAddAnchors?(session: ARSession, anchors: NSArray<ARAnchor> | ARAnchor[]): void;

	sessionDidRemoveAnchors?(session: ARSession, anchors: NSArray<ARAnchor> | ARAnchor[]): void;

	sessionDidUpdateAnchors?(session: ARSession, anchors: NSArray<ARAnchor> | ARAnchor[]): void;

	sessionDidUpdateFrame?(session: ARSession, frame: ARFrame): void;
}
declare var ARSessionDelegate: {

	prototype: ARSessionDelegate;
};

/**
 * @since 11.0
 */
interface ARSessionObserver extends NSObjectProtocol {

	sessionCameraDidChangeTrackingState?(session: ARSession, camera: ARCamera): void;

	/**
	 * @since 14.0
	 */
	sessionDidChangeGeoTrackingStatus?(session: ARSession, geoTrackingStatus: ARGeoTrackingStatus): void;

	sessionDidFailWithError?(session: ARSession, error: NSError): void;

	sessionDidOutputAudioSampleBuffer?(session: ARSession, audioSampleBuffer: any): void;

	/**
	 * @since 13.0
	 */
	sessionDidOutputCollaborationData?(session: ARSession, data: ARCollaborationData): void;

	sessionInterruptionEnded?(session: ARSession): void;

	/**
	 * @since 11.3
	 */
	sessionShouldAttemptRelocalization?(session: ARSession): boolean;

	sessionWasInterrupted?(session: ARSession): void;
}
declare var ARSessionObserver: {

	prototype: ARSessionObserver;
};

interface ARSessionProviding extends NSObjectProtocol {

	session: ARSession;
}
declare var ARSessionProviding: {

	prototype: ARSessionProviding;
};

declare const enum ARSessionRunOptions {

	ResetTracking = 1,

	RemoveExistingAnchors = 2,

	StopTrackedRaycasts = 4,

	ResetSceneReconstruction = 8
}

/**
 * @since 13.0
 */
declare class ARSkeleton extends NSObject {

	static alloc(): ARSkeleton; // inherited from NSObject

	static new(): ARSkeleton; // inherited from NSObject

	readonly definition: ARSkeletonDefinition;

	readonly jointCount: number;

	isJointTracked(jointIndex: number): boolean;
}

/**
 * @since 13.0
 */
declare class ARSkeleton2D extends ARSkeleton {

	static alloc(): ARSkeleton2D; // inherited from NSObject

	static new(): ARSkeleton2D; // inherited from NSObject

	readonly jointLandmarks: interop.Pointer | interop.Reference<interop.Reference<number>>;

	landmarkForJointNamed(jointName: string): interop.Reference<number>;
}

/**
 * @since 13.0
 */
declare class ARSkeleton3D extends ARSkeleton {

	static alloc(): ARSkeleton3D; // inherited from NSObject

	static new(): ARSkeleton3D; // inherited from NSObject

	readonly jointLocalTransforms: interop.Pointer | interop.Reference<simd_float4x4>;

	readonly jointModelTransforms: interop.Pointer | interop.Reference<simd_float4x4>;

	localTransformForJointName(jointName: string): simd_float4x4;

	modelTransformForJointName(jointName: string): simd_float4x4;
}

/**
 * @since 13.0
 */
declare class ARSkeletonDefinition extends NSObject {

	static alloc(): ARSkeletonDefinition; // inherited from NSObject

	static new(): ARSkeletonDefinition; // inherited from NSObject

	readonly jointCount: number;

	readonly jointNames: NSArray<string>;

	readonly neutralBodySkeleton3D: ARSkeleton3D;

	readonly parentIndices: NSArray<number>;

	static readonly defaultBody2DSkeletonDefinition: ARSkeletonDefinition;

	static readonly defaultBody3DSkeletonDefinition: ARSkeletonDefinition;

	indexForJointName(jointName: string): number;
}

/**
 * @since 14.0
 */
declare function ARSkeletonJointNameForRecognizedPointKey(recognizedPointKey: string): string;

/**
 * @since 13.0
 */
declare var ARSkeletonJointNameHead: string;

/**
 * @since 13.0
 */
declare var ARSkeletonJointNameLeftFoot: string;

/**
 * @since 13.0
 */
declare var ARSkeletonJointNameLeftHand: string;

/**
 * @since 13.0
 */
declare var ARSkeletonJointNameLeftShoulder: string;

/**
 * @since 13.0
 */
declare var ARSkeletonJointNameRightFoot: string;

/**
 * @since 13.0
 */
declare var ARSkeletonJointNameRightHand: string;

/**
 * @since 13.0
 */
declare var ARSkeletonJointNameRightShoulder: string;

/**
 * @since 13.0
 */
declare var ARSkeletonJointNameRoot: string;

/**
 * @since 11.0
 */
interface ARTrackable extends NSObjectProtocol {

	isTracked: boolean;
}
declare var ARTrackable: {

	prototype: ARTrackable;
};

/**
 * @since 13.0
 */
declare class ARTrackedRaycast extends NSObject {

	static alloc(): ARTrackedRaycast; // inherited from NSObject

	static new(): ARTrackedRaycast; // inherited from NSObject

	stopTracking(): void;
}

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

/**
 * @since 11.3
 */
declare class ARVideoFormat extends NSObject implements NSCopying {

	static alloc(): ARVideoFormat; // inherited from NSObject

	static new(): ARVideoFormat; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly captureDevicePosition: AVCaptureDevicePosition;

	/**
	 * @since 14.5
	 */
	readonly captureDeviceType: string;

	readonly framesPerSecond: number;

	readonly imageResolution: CGSize;

	/**
	 * @since 16.0
	 */
	readonly isRecommendedForHighResolutionFrameCapturing: boolean;

	/**
	 * @since 16.0
	 */
	readonly videoHDRSupported: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum ARWorldAlignment {

	Gravity = 0,

	GravityAndHeading = 1,

	Camera = 2
}

/**
 * @since 12.0
 */
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

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum ARWorldMappingStatus {

	NotAvailable = 0,

	Limited = 1,

	Extending = 2,

	Mapped = 3
}

/**
 * @since 11.0
 */
declare class ARWorldTrackingConfiguration extends ARConfiguration {

	static alloc(): ARWorldTrackingConfiguration; // inherited from NSObject

	static new(): ARWorldTrackingConfiguration; // inherited from NSObject

	/**
	 * @since 13.4
	 */
	static supportsSceneReconstruction(sceneReconstruction: ARSceneReconstruction): boolean;

	/**
	 * @since 14.3
	 */
	appClipCodeTrackingEnabled: boolean;

	/**
	 * @since 11.3
	 */
	autoFocusEnabled: boolean;

	/**
	 * @since 13.0
	 */
	automaticImageScaleEstimationEnabled: boolean;

	/**
	 * @since 13.0
	 */
	collaborationEnabled: boolean;

	/**
	 * @since 11.3
	 */
	detectionImages: NSSet<ARReferenceImage>;

	/**
	 * @since 12.0
	 */
	detectionObjects: NSSet<ARReferenceObject>;

	/**
	 * @since 12.0
	 */
	environmentTexturing: AREnvironmentTexturing;

	/**
	 * @since 12.0
	 */
	initialWorldMap: ARWorldMap;

	/**
	 * @since 12.0
	 */
	maximumNumberOfTrackedImages: number;

	planeDetection: ARPlaneDetection;

	/**
	 * @since 13.4
	 */
	sceneReconstruction: ARSceneReconstruction;

	/**
	 * @since 13.0
	 */
	userFaceTrackingEnabled: boolean;

	/**
	 * @since 13.0
	 */
	wantsHDREnvironmentTextures: boolean;

	/**
	 * @since 14.3
	 */
	static readonly supportsAppClipCodeTracking: boolean;

	/**
	 * @since 13.0
	 */
	static readonly supportsUserFaceTracking: boolean;
}
