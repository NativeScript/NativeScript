
declare var VNAnimalIdentifierCat: string;

declare var VNAnimalIdentifierDog: string;

declare class VNBarcodeObservation extends VNRectangleObservation {

	static alloc(): VNBarcodeObservation; // inherited from NSObject

	static new(): VNBarcodeObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNBarcodeObservation; // inherited from VNDetectedObjectObservation

	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNBarcodeObservation; // inherited from VNDetectedObjectObservation

	static rectangleObservationWithRequestRevisionTopLeftBottomLeftBottomRightTopRight(requestRevision: number, topLeft: CGPoint, bottomLeft: CGPoint, bottomRight: CGPoint, topRight: CGPoint): VNBarcodeObservation; // inherited from VNRectangleObservation

	readonly barcodeDescriptor: CIBarcodeDescriptor;

	readonly payloadStringValue: string;

	readonly symbology: string;
}

declare var VNBarcodeSymbologyAztec: string;

declare var VNBarcodeSymbologyCodabar: string;

declare var VNBarcodeSymbologyCode128: string;

declare var VNBarcodeSymbologyCode39: string;

declare var VNBarcodeSymbologyCode39Checksum: string;

declare var VNBarcodeSymbologyCode39FullASCII: string;

declare var VNBarcodeSymbologyCode39FullASCIIChecksum: string;

declare var VNBarcodeSymbologyCode93: string;

declare var VNBarcodeSymbologyCode93i: string;

declare var VNBarcodeSymbologyDataMatrix: string;

declare var VNBarcodeSymbologyEAN13: string;

declare var VNBarcodeSymbologyEAN8: string;

declare var VNBarcodeSymbologyGS1DataBar: string;

declare var VNBarcodeSymbologyGS1DataBarExpanded: string;

declare var VNBarcodeSymbologyGS1DataBarLimited: string;

declare var VNBarcodeSymbologyI2of5: string;

declare var VNBarcodeSymbologyI2of5Checksum: string;

declare var VNBarcodeSymbologyITF14: string;

declare var VNBarcodeSymbologyMicroPDF417: string;

declare var VNBarcodeSymbologyMicroQR: string;

declare var VNBarcodeSymbologyPDF417: string;

declare var VNBarcodeSymbologyQR: string;

declare var VNBarcodeSymbologyUPCE: string;

declare var VNBodyLandmarkKeyLeftAnkle: string;

declare var VNBodyLandmarkKeyLeftEar: string;

declare var VNBodyLandmarkKeyLeftElbow: string;

declare var VNBodyLandmarkKeyLeftEye: string;

declare var VNBodyLandmarkKeyLeftHip: string;

declare var VNBodyLandmarkKeyLeftKnee: string;

declare var VNBodyLandmarkKeyLeftShoulder: string;

declare var VNBodyLandmarkKeyLeftWrist: string;

declare var VNBodyLandmarkKeyNeck: string;

declare var VNBodyLandmarkKeyNose: string;

declare var VNBodyLandmarkKeyRightAnkle: string;

declare var VNBodyLandmarkKeyRightEar: string;

declare var VNBodyLandmarkKeyRightElbow: string;

declare var VNBodyLandmarkKeyRightEye: string;

declare var VNBodyLandmarkKeyRightHip: string;

declare var VNBodyLandmarkKeyRightKnee: string;

declare var VNBodyLandmarkKeyRightShoulder: string;

declare var VNBodyLandmarkKeyRightWrist: string;

declare var VNBodyLandmarkKeyRoot: string;

declare var VNBodyLandmarkRegionKeyFace: string;

declare var VNBodyLandmarkRegionKeyLeftArm: string;

declare var VNBodyLandmarkRegionKeyLeftLeg: string;

declare var VNBodyLandmarkRegionKeyRightArm: string;

declare var VNBodyLandmarkRegionKeyRightLeg: string;

declare var VNBodyLandmarkRegionKeyTorso: string;

declare const enum VNChirality {

	Unknown = 0,

	Left = -1,

	Right = 1
}

declare class VNCircle extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): VNCircle; // inherited from NSObject

	static new(): VNCircle; // inherited from NSObject

	readonly center: VNPoint;

	readonly diameter: number;

	readonly radius: number;

	static readonly zeroCircle: VNCircle;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { center: VNPoint; diameter: number; });

	constructor(o: { center: VNPoint; radius: number; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	containsPoint(point: VNPoint): boolean;

	containsPointInCircumferentialRingOfWidth(point: VNPoint, ringWidth: number): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCenterDiameter(center: VNPoint, diameter: number): this;

	initWithCenterRadius(center: VNPoint, radius: number): this;

	initWithCoder(coder: NSCoder): this;
}

declare class VNClassificationObservation extends VNObservation {

	static alloc(): VNClassificationObservation; // inherited from NSObject

	static new(): VNClassificationObservation; // inherited from NSObject

	readonly hasPrecisionRecallCurve: boolean;

	readonly identifier: string;

	hasMinimumPrecisionForRecall(minimumPrecision: number, recall: number): boolean;

	hasMinimumRecallForPrecision(minimumRecall: number, precision: number): boolean;
}

declare class VNClassifyImageRequest extends VNImageBasedRequest {

	static alloc(): VNClassifyImageRequest; // inherited from NSObject

	static knownClassificationsForRevisionError(requestRevision: number): NSArray<VNClassificationObservation>;

	static new(): VNClassifyImageRequest; // inherited from NSObject

	supportedIdentifiersAndReturnError(): NSArray<string>;
}

declare var VNClassifyImageRequestRevision1: number;

declare class VNContour extends NSObject implements NSCopying, VNRequestRevisionProviding {

	static alloc(): VNContour; // inherited from NSObject

	static new(): VNContour; // inherited from NSObject

	readonly aspectRatio: number;

	readonly childContourCount: number;

	readonly childContours: NSArray<VNContour>;

	readonly indexPath: NSIndexPath;

	readonly normalizedPath: any;

	readonly normalizedPoints: interop.Pointer | interop.Reference<interop.Reference<number>>;

	readonly pointCount: number;

	readonly requestRevision: number; // inherited from VNRequestRevisionProviding

	childContourAtIndexError(childContourIndex: number): VNContour;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	polygonApproximationWithEpsilonError(epsilon: number): VNContour;
}

declare class VNContoursObservation extends VNObservation {

	static alloc(): VNContoursObservation; // inherited from NSObject

	static new(): VNContoursObservation; // inherited from NSObject

	readonly contourCount: number;

	readonly normalizedPath: any;

	readonly topLevelContourCount: number;

	readonly topLevelContours: NSArray<VNContour>;

	contourAtIndexError(contourIndex: number): VNContour;

	contourAtIndexPathError(indexPath: NSIndexPath): VNContour;
}

declare class VNCoreMLFeatureValueObservation extends VNObservation {

	static alloc(): VNCoreMLFeatureValueObservation; // inherited from NSObject

	static new(): VNCoreMLFeatureValueObservation; // inherited from NSObject

	readonly featureName: string;

	readonly featureValue: MLFeatureValue;
}

declare class VNCoreMLModel extends NSObject {

	static alloc(): VNCoreMLModel; // inherited from NSObject

	static modelForMLModelError(model: MLModel): VNCoreMLModel;

	static new(): VNCoreMLModel; // inherited from NSObject

	featureProvider: MLFeatureProvider;

	inputImageFeatureName: string;
}

declare class VNCoreMLRequest extends VNImageBasedRequest {

	static alloc(): VNCoreMLRequest; // inherited from NSObject

	static new(): VNCoreMLRequest; // inherited from NSObject

	imageCropAndScaleOption: VNImageCropAndScaleOption;

	readonly model: VNCoreMLModel;

	constructor(o: { model: VNCoreMLModel; });

	constructor(o: { model: VNCoreMLModel; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithModel(model: VNCoreMLModel): this;

	initWithModelCompletionHandler(model: VNCoreMLModel, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

declare var VNCoreMLRequestRevision1: number;

declare class VNDetectBarcodesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectBarcodesRequest; // inherited from NSObject

	static new(): VNDetectBarcodesRequest; // inherited from NSObject

	symbologies: NSArray<string>;

	static readonly supportedSymbologies: NSArray<string>;

	supportedSymbologiesAndReturnError(): NSArray<string>;
}

declare var VNDetectBarcodesRequestRevision1: number;

declare var VNDetectBarcodesRequestRevision2: number;

declare var VNDetectContourRequestRevision1: number;

declare class VNDetectContoursRequest extends VNImageBasedRequest {

	static alloc(): VNDetectContoursRequest; // inherited from NSObject

	static new(): VNDetectContoursRequest; // inherited from NSObject

	contrastAdjustment: number;

	contrastPivot: number;

	detectDarkOnLight: boolean;

	detectsDarkOnLight: boolean;

	maximumImageDimension: number;
}

declare class VNDetectDocumentSegmentationRequest extends VNImageBasedRequest {

	static alloc(): VNDetectDocumentSegmentationRequest; // inherited from NSObject

	static new(): VNDetectDocumentSegmentationRequest; // inherited from NSObject
}

declare var VNDetectDocumentSegmentationRequestRevision1: number;

declare class VNDetectFaceCaptureQualityRequest extends VNImageBasedRequest implements VNFaceObservationAccepting {

	static alloc(): VNDetectFaceCaptureQualityRequest; // inherited from NSObject

	static new(): VNDetectFaceCaptureQualityRequest; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	inputFaceObservations: NSArray<VNFaceObservation>; // inherited from VNFaceObservationAccepting

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

declare var VNDetectFaceCaptureQualityRequestRevision1: number;

declare var VNDetectFaceCaptureQualityRequestRevision2: number;

declare class VNDetectFaceLandmarksRequest extends VNImageBasedRequest implements VNFaceObservationAccepting {

	static alloc(): VNDetectFaceLandmarksRequest; // inherited from NSObject

	static new(): VNDetectFaceLandmarksRequest; // inherited from NSObject

	static revisionSupportsConstellation(requestRevision: number, constellation: VNRequestFaceLandmarksConstellation): boolean;

	constellation: VNRequestFaceLandmarksConstellation;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	inputFaceObservations: NSArray<VNFaceObservation>; // inherited from VNFaceObservationAccepting

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

declare var VNDetectFaceLandmarksRequestRevision1: number;

declare var VNDetectFaceLandmarksRequestRevision2: number;

declare var VNDetectFaceLandmarksRequestRevision3: number;

declare class VNDetectFaceRectanglesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectFaceRectanglesRequest; // inherited from NSObject

	static new(): VNDetectFaceRectanglesRequest; // inherited from NSObject
}

declare var VNDetectFaceRectanglesRequestRevision1: number;

declare var VNDetectFaceRectanglesRequestRevision2: number;

declare var VNDetectFaceRectanglesRequestRevision3: number;

declare class VNDetectHorizonRequest extends VNImageBasedRequest {

	static alloc(): VNDetectHorizonRequest; // inherited from NSObject

	static new(): VNDetectHorizonRequest; // inherited from NSObject
}

declare var VNDetectHorizonRequestRevision1: number;

declare class VNDetectHumanBodyPoseRequest extends VNImageBasedRequest {

	static alloc(): VNDetectHumanBodyPoseRequest; // inherited from NSObject

	static new(): VNDetectHumanBodyPoseRequest; // inherited from NSObject

	static supportedJointNamesForRevisionError(revision: number): NSArray<string>;

	static supportedJointsGroupNamesForRevisionError(revision: number): NSArray<string>;
}

declare var VNDetectHumanBodyPoseRequestRevision1: number;

declare class VNDetectHumanHandPoseRequest extends VNImageBasedRequest {

	static alloc(): VNDetectHumanHandPoseRequest; // inherited from NSObject

	static new(): VNDetectHumanHandPoseRequest; // inherited from NSObject

	static supportedJointNamesForRevisionError(revision: number): NSArray<string>;

	static supportedJointsGroupNamesForRevisionError(revision: number): NSArray<string>;

	maximumHandCount: number;
}

declare var VNDetectHumanHandPoseRequestRevision1: number;

declare class VNDetectHumanRectanglesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectHumanRectanglesRequest; // inherited from NSObject

	static new(): VNDetectHumanRectanglesRequest; // inherited from NSObject

	upperBodyOnly: boolean;
}

declare var VNDetectHumanRectanglesRequestRevision1: number;

declare var VNDetectHumanRectanglesRequestRevision2: number;

declare class VNDetectRectanglesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectRectanglesRequest; // inherited from NSObject

	static new(): VNDetectRectanglesRequest; // inherited from NSObject

	maximumAspectRatio: number;

	maximumObservations: number;

	minimumAspectRatio: number;

	minimumConfidence: number;

	minimumSize: number;

	quadratureTolerance: number;
}

declare var VNDetectRectanglesRequestRevision1: number;

declare class VNDetectTextRectanglesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectTextRectanglesRequest; // inherited from NSObject

	static new(): VNDetectTextRectanglesRequest; // inherited from NSObject

	reportCharacterBoxes: boolean;
}

declare var VNDetectTextRectanglesRequestRevision1: number;

declare class VNDetectTrajectoriesRequest extends VNStatefulRequest {

	static alloc(): VNDetectTrajectoriesRequest; // inherited from NSObject

	static new(): VNDetectTrajectoriesRequest; // inherited from NSObject

	maximumObjectSize: number;

	minimumObjectSize: number;

	objectMaximumNormalizedRadius: number;

	objectMinimumNormalizedRadius: number;

	targetFrameTime: CMTime;

	readonly trajectoryLength: number;

	constructor(o: { frameAnalysisSpacing: CMTime; trajectoryLength: number; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithFrameAnalysisSpacingTrajectoryLengthCompletionHandler(frameAnalysisSpacing: CMTime, trajectoryLength: number, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

declare var VNDetectTrajectoriesRequestRevision1: number;

declare class VNDetectedObjectObservation extends VNObservation {

	static alloc(): VNDetectedObjectObservation; // inherited from NSObject

	static new(): VNDetectedObjectObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNDetectedObjectObservation;

	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNDetectedObjectObservation;

	readonly boundingBox: CGRect;

	readonly globalSegmentationMask: VNPixelBufferObservation;
}

declare class VNDetectedPoint extends VNPoint {

	static alloc(): VNDetectedPoint; // inherited from NSObject

	static new(): VNDetectedPoint; // inherited from NSObject

	readonly confidence: number;
}

declare const enum VNElementType {

	Unknown = 0,

	Float = 1,

	Double = 2
}

declare function VNElementTypeSize(elementType: VNElementType): number;

declare const enum VNErrorCode {

	OK = 0,

	RequestCancelled = 1,

	InvalidFormat = 2,

	OperationFailed = 3,

	OutOfBoundsError = 4,

	InvalidOption = 5,

	IOError = 6,

	MissingOption = 7,

	NotImplemented = 8,

	InternalError = 9,

	OutOfMemory = 10,

	UnknownError = 11,

	InvalidOperation = 12,

	InvalidImage = 13,

	InvalidArgument = 14,

	InvalidModel = 15,

	UnsupportedRevision = 16,

	DataUnavailable = 17,

	TimeStampNotFound = 18,

	UnsupportedRequest = 19
}

declare var VNErrorDomain: string;

declare class VNFaceLandmarkRegion extends NSObject implements NSCopying, NSSecureCoding, VNRequestRevisionProviding {

	static alloc(): VNFaceLandmarkRegion; // inherited from NSObject

	static new(): VNFaceLandmarkRegion; // inherited from NSObject

	readonly pointCount: number;

	readonly requestRevision: number; // inherited from VNRequestRevisionProviding

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class VNFaceLandmarkRegion2D extends VNFaceLandmarkRegion {

	static alloc(): VNFaceLandmarkRegion2D; // inherited from NSObject

	static new(): VNFaceLandmarkRegion2D; // inherited from NSObject

	readonly normalizedPoints: interop.Pointer | interop.Reference<CGPoint>;

	readonly precisionEstimatesPerPoint: NSArray<number>;

	pointsInImageOfSize(imageSize: CGSize): interop.Pointer | interop.Reference<CGPoint>;
}

declare class VNFaceLandmarks extends NSObject implements NSCopying, NSSecureCoding, VNRequestRevisionProviding {

	static alloc(): VNFaceLandmarks; // inherited from NSObject

	static new(): VNFaceLandmarks; // inherited from NSObject

	readonly confidence: number;

	readonly requestRevision: number; // inherited from VNRequestRevisionProviding

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class VNFaceLandmarks2D extends VNFaceLandmarks {

	static alloc(): VNFaceLandmarks2D; // inherited from NSObject

	static new(): VNFaceLandmarks2D; // inherited from NSObject

	readonly allPoints: VNFaceLandmarkRegion2D;

	readonly faceContour: VNFaceLandmarkRegion2D;

	readonly innerLips: VNFaceLandmarkRegion2D;

	readonly leftEye: VNFaceLandmarkRegion2D;

	readonly leftEyebrow: VNFaceLandmarkRegion2D;

	readonly leftPupil: VNFaceLandmarkRegion2D;

	readonly medianLine: VNFaceLandmarkRegion2D;

	readonly nose: VNFaceLandmarkRegion2D;

	readonly noseCrest: VNFaceLandmarkRegion2D;

	readonly outerLips: VNFaceLandmarkRegion2D;

	readonly rightEye: VNFaceLandmarkRegion2D;

	readonly rightEyebrow: VNFaceLandmarkRegion2D;

	readonly rightPupil: VNFaceLandmarkRegion2D;
}

declare class VNFaceObservation extends VNDetectedObjectObservation {

	static alloc(): VNFaceObservation; // inherited from NSObject

	static faceObservationWithRequestRevisionBoundingBoxRollYaw(requestRevision: number, boundingBox: CGRect, roll: number, yaw: number): VNFaceObservation;

	static faceObservationWithRequestRevisionBoundingBoxRollYawPitch(requestRevision: number, boundingBox: CGRect, roll: number, yaw: number, pitch: number): VNFaceObservation;

	static new(): VNFaceObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNFaceObservation; // inherited from VNDetectedObjectObservation

	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNFaceObservation; // inherited from VNDetectedObjectObservation

	readonly faceCaptureQuality: number;

	readonly landmarks: VNFaceLandmarks2D;

	readonly pitch: number;

	readonly roll: number;

	readonly yaw: number;
}

interface VNFaceObservationAccepting extends NSObjectProtocol {

	inputFaceObservations: NSArray<VNFaceObservation>;
}
declare var VNFaceObservationAccepting: {

	prototype: VNFaceObservationAccepting;
};

declare class VNFeaturePrintObservation extends VNObservation {

	static alloc(): VNFeaturePrintObservation; // inherited from NSObject

	static new(): VNFeaturePrintObservation; // inherited from NSObject

	readonly data: NSData;

	readonly elementCount: number;

	readonly elementType: VNElementType;

	computeDistanceToFeaturePrintObservationError(outDistance: interop.Pointer | interop.Reference<number>, featurePrint: VNFeaturePrintObservation): boolean;
}

declare class VNGenerateAttentionBasedSaliencyImageRequest extends VNImageBasedRequest {

	static alloc(): VNGenerateAttentionBasedSaliencyImageRequest; // inherited from NSObject

	static new(): VNGenerateAttentionBasedSaliencyImageRequest; // inherited from NSObject
}

declare var VNGenerateAttentionBasedSaliencyImageRequestRevision1: number;

declare class VNGenerateImageFeaturePrintRequest extends VNImageBasedRequest {

	static alloc(): VNGenerateImageFeaturePrintRequest; // inherited from NSObject

	static new(): VNGenerateImageFeaturePrintRequest; // inherited from NSObject

	imageCropAndScaleOption: VNImageCropAndScaleOption;
}

declare var VNGenerateImageFeaturePrintRequestRevision1: number;

declare class VNGenerateObjectnessBasedSaliencyImageRequest extends VNImageBasedRequest {

	static alloc(): VNGenerateObjectnessBasedSaliencyImageRequest; // inherited from NSObject

	static new(): VNGenerateObjectnessBasedSaliencyImageRequest; // inherited from NSObject
}

declare var VNGenerateObjectnessBasedSaliencyImageRequestRevision1: number;

declare class VNGenerateOpticalFlowRequest extends VNTargetedImageRequest {

	static alloc(): VNGenerateOpticalFlowRequest; // inherited from NSObject

	static new(): VNGenerateOpticalFlowRequest; // inherited from NSObject

	computationAccuracy: VNGenerateOpticalFlowRequestComputationAccuracy;

	outputPixelFormat: number;
}

declare const enum VNGenerateOpticalFlowRequestComputationAccuracy {

	Low = 0,

	Medium = 1,

	High = 2,

	VeryHigh = 3
}

declare var VNGenerateOpticalFlowRequestRevision1: number;

declare class VNGeneratePersonSegmentationRequest extends VNStatefulRequest {

	static alloc(): VNGeneratePersonSegmentationRequest; // inherited from NSObject

	static new(): VNGeneratePersonSegmentationRequest; // inherited from NSObject

	outputPixelFormat: number;

	qualityLevel: VNGeneratePersonSegmentationRequestQualityLevel;
}

declare const enum VNGeneratePersonSegmentationRequestQualityLevel {

	Accurate = 0,

	Balanced = 1,

	Fast = 2
}

declare var VNGeneratePersonSegmentationRequestRevision1: number;

declare class VNGeometryUtils extends NSObject {

	static alloc(): VNGeometryUtils; // inherited from NSObject

	static boundingCircleForContourError(contour: VNContour): VNCircle;

	static boundingCircleForPointsError(points: NSArray<VNPoint> | VNPoint[]): VNCircle;

	static boundingCircleForSIMDPointsPointCountError(points: interop.Pointer | interop.Reference<interop.Reference<number>>, pointCount: number): VNCircle;

	static calculateAreaForContourOrientedAreaError(area: interop.Pointer | interop.Reference<number>, contour: VNContour, orientedArea: boolean): boolean;

	static calculatePerimeterForContourError(perimeter: interop.Pointer | interop.Reference<number>, contour: VNContour): boolean;

	static new(): VNGeometryUtils; // inherited from NSObject
}

declare class VNHomographicImageRegistrationRequest extends VNImageRegistrationRequest {

	static alloc(): VNHomographicImageRegistrationRequest; // inherited from NSObject

	static new(): VNHomographicImageRegistrationRequest; // inherited from NSObject
}

declare var VNHomographicImageRegistrationRequestRevision1: number;

declare class VNHorizonObservation extends VNObservation {

	static alloc(): VNHorizonObservation; // inherited from NSObject

	static new(): VNHorizonObservation; // inherited from NSObject

	readonly angle: number;

	readonly transform: CGAffineTransform;
}

declare class VNHumanBodyPoseObservation extends VNRecognizedPointsObservation {

	static alloc(): VNHumanBodyPoseObservation; // inherited from NSObject

	static new(): VNHumanBodyPoseObservation; // inherited from NSObject

	readonly availableJointNames: NSArray<string>;

	readonly availableJointsGroupNames: NSArray<string>;

	recognizedPointForJointNameError(jointName: string): VNRecognizedPoint;

	recognizedPointsForJointsGroupNameError(jointsGroupName: string): NSDictionary<string, VNRecognizedPoint>;
}

declare var VNHumanBodyPoseObservationJointNameLeftAnkle: string;

declare var VNHumanBodyPoseObservationJointNameLeftEar: string;

declare var VNHumanBodyPoseObservationJointNameLeftElbow: string;

declare var VNHumanBodyPoseObservationJointNameLeftEye: string;

declare var VNHumanBodyPoseObservationJointNameLeftHip: string;

declare var VNHumanBodyPoseObservationJointNameLeftKnee: string;

declare var VNHumanBodyPoseObservationJointNameLeftShoulder: string;

declare var VNHumanBodyPoseObservationJointNameLeftWrist: string;

declare var VNHumanBodyPoseObservationJointNameNeck: string;

declare var VNHumanBodyPoseObservationJointNameNose: string;

declare var VNHumanBodyPoseObservationJointNameRightAnkle: string;

declare var VNHumanBodyPoseObservationJointNameRightEar: string;

declare var VNHumanBodyPoseObservationJointNameRightElbow: string;

declare var VNHumanBodyPoseObservationJointNameRightEye: string;

declare var VNHumanBodyPoseObservationJointNameRightHip: string;

declare var VNHumanBodyPoseObservationJointNameRightKnee: string;

declare var VNHumanBodyPoseObservationJointNameRightShoulder: string;

declare var VNHumanBodyPoseObservationJointNameRightWrist: string;

declare var VNHumanBodyPoseObservationJointNameRoot: string;

declare var VNHumanBodyPoseObservationJointsGroupNameAll: string;

declare var VNHumanBodyPoseObservationJointsGroupNameFace: string;

declare var VNHumanBodyPoseObservationJointsGroupNameLeftArm: string;

declare var VNHumanBodyPoseObservationJointsGroupNameLeftLeg: string;

declare var VNHumanBodyPoseObservationJointsGroupNameRightArm: string;

declare var VNHumanBodyPoseObservationJointsGroupNameRightLeg: string;

declare var VNHumanBodyPoseObservationJointsGroupNameTorso: string;

declare class VNHumanHandPoseObservation extends VNRecognizedPointsObservation {

	static alloc(): VNHumanHandPoseObservation; // inherited from NSObject

	static new(): VNHumanHandPoseObservation; // inherited from NSObject

	readonly availableJointNames: NSArray<string>;

	readonly availableJointsGroupNames: NSArray<string>;

	readonly chirality: VNChirality;

	recognizedPointForJointNameError(jointName: string): VNRecognizedPoint;

	recognizedPointsForJointsGroupNameError(jointsGroupName: string): NSDictionary<string, VNRecognizedPoint>;
}

declare var VNHumanHandPoseObservationJointNameIndexDIP: string;

declare var VNHumanHandPoseObservationJointNameIndexMCP: string;

declare var VNHumanHandPoseObservationJointNameIndexPIP: string;

declare var VNHumanHandPoseObservationJointNameIndexTip: string;

declare var VNHumanHandPoseObservationJointNameLittleDIP: string;

declare var VNHumanHandPoseObservationJointNameLittleMCP: string;

declare var VNHumanHandPoseObservationJointNameLittlePIP: string;

declare var VNHumanHandPoseObservationJointNameLittleTip: string;

declare var VNHumanHandPoseObservationJointNameMiddleDIP: string;

declare var VNHumanHandPoseObservationJointNameMiddleMCP: string;

declare var VNHumanHandPoseObservationJointNameMiddlePIP: string;

declare var VNHumanHandPoseObservationJointNameMiddleTip: string;

declare var VNHumanHandPoseObservationJointNameRingDIP: string;

declare var VNHumanHandPoseObservationJointNameRingMCP: string;

declare var VNHumanHandPoseObservationJointNameRingPIP: string;

declare var VNHumanHandPoseObservationJointNameRingTip: string;

declare var VNHumanHandPoseObservationJointNameThumbCMC: string;

declare var VNHumanHandPoseObservationJointNameThumbIP: string;

declare var VNHumanHandPoseObservationJointNameThumbMP: string;

declare var VNHumanHandPoseObservationJointNameThumbTip: string;

declare var VNHumanHandPoseObservationJointNameWrist: string;

declare var VNHumanHandPoseObservationJointsGroupNameAll: string;

declare var VNHumanHandPoseObservationJointsGroupNameIndexFinger: string;

declare var VNHumanHandPoseObservationJointsGroupNameLittleFinger: string;

declare var VNHumanHandPoseObservationJointsGroupNameMiddleFinger: string;

declare var VNHumanHandPoseObservationJointsGroupNameRingFinger: string;

declare var VNHumanHandPoseObservationJointsGroupNameThumb: string;

declare class VNHumanObservation extends VNDetectedObjectObservation {

	static alloc(): VNHumanObservation; // inherited from NSObject

	static new(): VNHumanObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNHumanObservation; // inherited from VNDetectedObjectObservation

	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNHumanObservation; // inherited from VNDetectedObjectObservation

	readonly upperBodyOnly: boolean;
}

declare class VNImageAlignmentObservation extends VNObservation {

	static alloc(): VNImageAlignmentObservation; // inherited from NSObject

	static new(): VNImageAlignmentObservation; // inherited from NSObject
}

declare class VNImageBasedRequest extends VNRequest {

	static alloc(): VNImageBasedRequest; // inherited from NSObject

	static new(): VNImageBasedRequest; // inherited from NSObject

	regionOfInterest: CGRect;
}

declare const enum VNImageCropAndScaleOption {

	CenterCrop = 0,

	ScaleFit = 1,

	ScaleFill = 2
}

declare class VNImageHomographicAlignmentObservation extends VNImageAlignmentObservation {

	static alloc(): VNImageHomographicAlignmentObservation; // inherited from NSObject

	static new(): VNImageHomographicAlignmentObservation; // inherited from NSObject

	readonly warpTransform: simd_float3x3;
}

declare var VNImageOptionCIContext: string;

declare var VNImageOptionCameraIntrinsics: string;

declare var VNImageOptionProperties: string;

declare function VNImagePointForFaceLandmarkPoint(faceLandmarkPoint: interop.Reference<number>, faceBoundingBox: CGRect, imageWidth: number, imageHeight: number): CGPoint;

declare function VNImagePointForNormalizedPoint(normalizedPoint: CGPoint, imageWidth: number, imageHeight: number): CGPoint;

declare function VNImagePointForNormalizedPointUsingRegionOfInterest(normalizedPoint: CGPoint, imageWidth: number, imageHeight: number, roi: CGRect): CGPoint;

declare function VNImageRectForNormalizedRect(normalizedRect: CGRect, imageWidth: number, imageHeight: number): CGRect;

declare function VNImageRectForNormalizedRectUsingRegionOfInterest(normalizedRect: CGRect, imageWidth: number, imageHeight: number, roi: CGRect): CGRect;

declare class VNImageRegistrationRequest extends VNTargetedImageRequest {

	static alloc(): VNImageRegistrationRequest; // inherited from NSObject

	static new(): VNImageRegistrationRequest; // inherited from NSObject
}

declare class VNImageRequestHandler extends NSObject {

	static alloc(): VNImageRequestHandler; // inherited from NSObject

	static new(): VNImageRequestHandler; // inherited from NSObject

	constructor(o: { CGImage: any; options: NSDictionary<string, any>; });

	constructor(o: { CGImage: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { CIImage: CIImage; options: NSDictionary<string, any>; });

	constructor(o: { CIImage: CIImage; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { CMSampleBuffer: any; options: NSDictionary<string, any>; });

	constructor(o: { CMSampleBuffer: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { CVPixelBuffer: any; options: NSDictionary<string, any>; });

	constructor(o: { CVPixelBuffer: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { data: NSData; options: NSDictionary<string, any>; });

	constructor(o: { data: NSData; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { URL: NSURL; options: NSDictionary<string, any>; });

	constructor(o: { URL: NSURL; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	initWithCGImageOptions(image: any, options: NSDictionary<string, any>): this;

	initWithCGImageOrientationOptions(image: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithCIImageOptions(image: CIImage, options: NSDictionary<string, any>): this;

	initWithCIImageOrientationOptions(image: CIImage, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithCMSampleBufferOptions(sampleBuffer: any, options: NSDictionary<string, any>): this;

	initWithCMSampleBufferOrientationOptions(sampleBuffer: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithCVPixelBufferOptions(pixelBuffer: any, options: NSDictionary<string, any>): this;

	initWithCVPixelBufferOrientationOptions(pixelBuffer: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithDataOptions(imageData: NSData, options: NSDictionary<string, any>): this;

	initWithDataOrientationOptions(imageData: NSData, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithURLOptions(imageURL: NSURL, options: NSDictionary<string, any>): this;

	initWithURLOrientationOptions(imageURL: NSURL, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	performRequestsError(requests: NSArray<VNRequest> | VNRequest[]): boolean;
}

declare class VNImageTranslationAlignmentObservation extends VNImageAlignmentObservation {

	static alloc(): VNImageTranslationAlignmentObservation; // inherited from NSObject

	static new(): VNImageTranslationAlignmentObservation; // inherited from NSObject

	readonly alignmentTransform: CGAffineTransform;
}

declare function VNNormalizedFaceBoundingBoxPointForLandmarkPoint(faceLandmarkPoint: interop.Reference<number>, faceBoundingBox: CGRect, imageWidth: number, imageHeight: number): CGPoint;

declare var VNNormalizedIdentityRect: CGRect;

declare function VNNormalizedPointForImagePoint(imagePoint: CGPoint, imageWidth: number, imageHeight: number): CGPoint;

declare function VNNormalizedPointForImagePointUsingRegionOfInterest(imagePoint: CGPoint, imageWidth: number, imageHeight: number, roi: CGRect): CGPoint;

declare function VNNormalizedRectForImageRect(imageRect: CGRect, imageWidth: number, imageHeight: number): CGRect;

declare function VNNormalizedRectForImageRectUsingRegionOfInterest(imageRect: CGRect, imageWidth: number, imageHeight: number, roi: CGRect): CGRect;

declare function VNNormalizedRectIsIdentityRect(normalizedRect: CGRect): boolean;

declare class VNObservation extends NSObject implements NSCopying, NSSecureCoding, VNRequestRevisionProviding {

	static alloc(): VNObservation; // inherited from NSObject

	static new(): VNObservation; // inherited from NSObject

	readonly confidence: number;

	readonly timeRange: CMTimeRange;

	readonly uuid: NSUUID;

	readonly requestRevision: number; // inherited from VNRequestRevisionProviding

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class VNPixelBufferObservation extends VNObservation {

	static alloc(): VNPixelBufferObservation; // inherited from NSObject

	static new(): VNPixelBufferObservation; // inherited from NSObject

	readonly featureName: string;

	readonly pixelBuffer: any;
}

declare class VNPoint extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): VNPoint; // inherited from NSObject

	static distanceBetweenPointPoint(point1: VNPoint, point2: VNPoint): number;

	static new(): VNPoint; // inherited from NSObject

	static pointByApplyingVectorToPoint(vector: VNVector, point: VNPoint): VNPoint;

	readonly location: CGPoint;

	readonly x: number;

	readonly y: number;

	static readonly zeroPoint: VNPoint;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { location: CGPoint; });

	constructor(o: { x: number; y: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	distanceToPoint(point: VNPoint): number;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLocation(location: CGPoint): this;

	initWithXY(x: number, y: number): this;
}

declare class VNRecognizeAnimalsRequest extends VNImageBasedRequest {

	static alloc(): VNRecognizeAnimalsRequest; // inherited from NSObject

	static knownAnimalIdentifiersForRevisionError(requestRevision: number): NSArray<string>;

	static new(): VNRecognizeAnimalsRequest; // inherited from NSObject

	supportedIdentifiersAndReturnError(): NSArray<string>;
}

declare var VNRecognizeAnimalsRequestRevision1: number;

declare var VNRecognizeAnimalsRequestRevision2: number;

declare class VNRecognizeTextRequest extends VNImageBasedRequest implements VNRequestProgressProviding {

	static alloc(): VNRecognizeTextRequest; // inherited from NSObject

	static new(): VNRecognizeTextRequest; // inherited from NSObject

	static supportedRecognitionLanguagesForTextRecognitionLevelRevisionError(recognitionLevel: VNRequestTextRecognitionLevel, requestRevision: number): NSArray<string>;

	customWords: NSArray<string>;

	minimumTextHeight: number;

	recognitionLanguages: NSArray<string>;

	recognitionLevel: VNRequestTextRecognitionLevel;

	usesLanguageCorrection: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly indeterminate: boolean; // inherited from VNRequestProgressProviding

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	progressHandler: (p1: VNRequest, p2: number, p3: NSError) => void; // inherited from VNRequestProgressProviding

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

	supportedRecognitionLanguagesAndReturnError(): NSArray<string>;
}

declare var VNRecognizeTextRequestRevision1: number;

declare var VNRecognizeTextRequestRevision2: number;

declare class VNRecognizedObjectObservation extends VNDetectedObjectObservation {

	static alloc(): VNRecognizedObjectObservation; // inherited from NSObject

	static new(): VNRecognizedObjectObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNRecognizedObjectObservation; // inherited from VNDetectedObjectObservation

	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNRecognizedObjectObservation; // inherited from VNDetectedObjectObservation

	readonly labels: NSArray<VNClassificationObservation>;
}

declare class VNRecognizedPoint extends VNDetectedPoint {

	static alloc(): VNRecognizedPoint; // inherited from NSObject

	static new(): VNRecognizedPoint; // inherited from NSObject

	readonly identifier: string;
}

declare var VNRecognizedPointGroupKeyAll: string;

declare class VNRecognizedPointsObservation extends VNObservation {

	static alloc(): VNRecognizedPointsObservation; // inherited from NSObject

	static new(): VNRecognizedPointsObservation; // inherited from NSObject

	readonly availableGroupKeys: NSArray<string>;

	readonly availableKeys: NSArray<string>;

	keypointsMultiArrayAndReturnError(): MLMultiArray;

	recognizedPointForKeyError(pointKey: string): VNRecognizedPoint;

	recognizedPointsForGroupKeyError(groupKey: string): NSDictionary<string, VNRecognizedPoint>;
}

declare class VNRecognizedText extends NSObject implements NSCopying, NSSecureCoding, VNRequestRevisionProviding {

	static alloc(): VNRecognizedText; // inherited from NSObject

	static new(): VNRecognizedText; // inherited from NSObject

	readonly confidence: number;

	readonly string: string;

	readonly requestRevision: number; // inherited from VNRequestRevisionProviding

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	boundingBoxForRangeError(range: NSRange): VNRectangleObservation;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class VNRecognizedTextObservation extends VNRectangleObservation {

	static alloc(): VNRecognizedTextObservation; // inherited from NSObject

	static new(): VNRecognizedTextObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNRecognizedTextObservation; // inherited from VNDetectedObjectObservation

	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNRecognizedTextObservation; // inherited from VNDetectedObjectObservation

	static rectangleObservationWithRequestRevisionTopLeftBottomLeftBottomRightTopRight(requestRevision: number, topLeft: CGPoint, bottomLeft: CGPoint, bottomRight: CGPoint, topRight: CGPoint): VNRecognizedTextObservation; // inherited from VNRectangleObservation

	topCandidates(maxCandidateCount: number): NSArray<VNRecognizedText>;
}

declare class VNRectangleObservation extends VNDetectedObjectObservation {

	static alloc(): VNRectangleObservation; // inherited from NSObject

	static new(): VNRectangleObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNRectangleObservation; // inherited from VNDetectedObjectObservation

	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNRectangleObservation; // inherited from VNDetectedObjectObservation

	static rectangleObservationWithRequestRevisionTopLeftBottomLeftBottomRightTopRight(requestRevision: number, topLeft: CGPoint, bottomLeft: CGPoint, bottomRight: CGPoint, topRight: CGPoint): VNRectangleObservation;

	readonly bottomLeft: CGPoint;

	readonly bottomRight: CGPoint;

	readonly topLeft: CGPoint;

	readonly topRight: CGPoint;
}

declare class VNRequest extends NSObject implements NSCopying {

	static alloc(): VNRequest; // inherited from NSObject

	static new(): VNRequest; // inherited from NSObject

	readonly completionHandler: (p1: VNRequest, p2: NSError) => void;

	preferBackgroundProcessing: boolean;

	readonly results: NSArray<VNObservation>;

	revision: number;

	usesCPUOnly: boolean;

	static readonly currentRevision: number;

	static readonly defaultRevision: number;

	static readonly supportedRevisions: NSIndexSet;

	constructor(o: { completionHandler: (p1: VNRequest, p2: NSError) => void; });

	cancel(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithCompletionHandler(completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

declare const enum VNRequestFaceLandmarksConstellation {

	ConstellationNotDefined = 0,

	Constellation65Points = 1,

	Constellation76Points = 2
}

interface VNRequestProgressProviding extends NSObjectProtocol {

	indeterminate: boolean;

	progressHandler: (p1: VNRequest, p2: number, p3: NSError) => void;
}
declare var VNRequestProgressProviding: {

	prototype: VNRequestProgressProviding;
};

interface VNRequestRevisionProviding {

	requestRevision: number;
}
declare var VNRequestRevisionProviding: {

	prototype: VNRequestRevisionProviding;
};

declare var VNRequestRevisionUnspecified: number;

declare const enum VNRequestTextRecognitionLevel {

	Accurate = 0,

	Fast = 1
}

declare const enum VNRequestTrackingLevel {

	Accurate = 0,

	Fast = 1
}

declare class VNSaliencyImageObservation extends VNPixelBufferObservation {

	static alloc(): VNSaliencyImageObservation; // inherited from NSObject

	static new(): VNSaliencyImageObservation; // inherited from NSObject

	readonly salientObjects: NSArray<VNRectangleObservation>;
}

declare class VNSequenceRequestHandler extends NSObject {

	static alloc(): VNSequenceRequestHandler; // inherited from NSObject

	static new(): VNSequenceRequestHandler; // inherited from NSObject

	performRequestsOnCGImageError(requests: NSArray<VNRequest> | VNRequest[], image: any): boolean;

	performRequestsOnCGImageOrientationError(requests: NSArray<VNRequest> | VNRequest[], image: any, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnCIImageError(requests: NSArray<VNRequest> | VNRequest[], image: CIImage): boolean;

	performRequestsOnCIImageOrientationError(requests: NSArray<VNRequest> | VNRequest[], image: CIImage, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnCMSampleBufferError(requests: NSArray<VNRequest> | VNRequest[], sampleBuffer: any): boolean;

	performRequestsOnCMSampleBufferOrientationError(requests: NSArray<VNRequest> | VNRequest[], sampleBuffer: any, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnCVPixelBufferError(requests: NSArray<VNRequest> | VNRequest[], pixelBuffer: any): boolean;

	performRequestsOnCVPixelBufferOrientationError(requests: NSArray<VNRequest> | VNRequest[], pixelBuffer: any, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnImageDataError(requests: NSArray<VNRequest> | VNRequest[], imageData: NSData): boolean;

	performRequestsOnImageDataOrientationError(requests: NSArray<VNRequest> | VNRequest[], imageData: NSData, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnImageURLError(requests: NSArray<VNRequest> | VNRequest[], imageURL: NSURL): boolean;

	performRequestsOnImageURLOrientationError(requests: NSArray<VNRequest> | VNRequest[], imageURL: NSURL, orientation: CGImagePropertyOrientation): boolean;
}

declare class VNStatefulRequest extends VNImageBasedRequest {

	static alloc(): VNStatefulRequest; // inherited from NSObject

	static new(): VNStatefulRequest; // inherited from NSObject

	readonly frameAnalysisSpacing: CMTime;

	readonly minimumLatencyFrameCount: number;

	readonly requestFrameAnalysisSpacing: CMTime;

	constructor(o: { frameAnalysisSpacing: CMTime; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithFrameAnalysisSpacingCompletionHandler(frameAnalysisSpacing: CMTime, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

declare class VNTargetedImageRequest extends VNImageBasedRequest {

	static alloc(): VNTargetedImageRequest; // inherited from NSObject

	static new(): VNTargetedImageRequest; // inherited from NSObject

	constructor(o: { targetedCGImage: any; options: NSDictionary<string, any>; });

	constructor(o: { targetedCGImage: any; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedCGImage: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { targetedCGImage: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedCIImage: CIImage; options: NSDictionary<string, any>; });

	constructor(o: { targetedCIImage: CIImage; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedCIImage: CIImage; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { targetedCIImage: CIImage; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedCMSampleBuffer: any; options: NSDictionary<string, any>; });

	constructor(o: { targetedCMSampleBuffer: any; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedCMSampleBuffer: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { targetedCMSampleBuffer: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedCVPixelBuffer: any; options: NSDictionary<string, any>; });

	constructor(o: { targetedCVPixelBuffer: any; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedCVPixelBuffer: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { targetedCVPixelBuffer: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedImageData: NSData; options: NSDictionary<string, any>; });

	constructor(o: { targetedImageData: NSData; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedImageData: NSData; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { targetedImageData: NSData; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedImageURL: NSURL; options: NSDictionary<string, any>; });

	constructor(o: { targetedImageURL: NSURL; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	constructor(o: { targetedImageURL: NSURL; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { targetedImageURL: NSURL; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithTargetedCGImageOptions(cgImage: any, options: NSDictionary<string, any>): this;

	initWithTargetedCGImageOptionsCompletionHandler(cgImage: any, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedCGImageOrientationOptions(cgImage: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithTargetedCGImageOrientationOptionsCompletionHandler(cgImage: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedCIImageOptions(ciImage: CIImage, options: NSDictionary<string, any>): this;

	initWithTargetedCIImageOptionsCompletionHandler(ciImage: CIImage, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedCIImageOrientationOptions(ciImage: CIImage, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithTargetedCIImageOrientationOptionsCompletionHandler(ciImage: CIImage, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedCMSampleBufferOptions(sampleBuffer: any, options: NSDictionary<string, any>): this;

	initWithTargetedCMSampleBufferOptionsCompletionHandler(sampleBuffer: any, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedCMSampleBufferOrientationOptions(sampleBuffer: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithTargetedCMSampleBufferOrientationOptionsCompletionHandler(sampleBuffer: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedCVPixelBufferOptions(pixelBuffer: any, options: NSDictionary<string, any>): this;

	initWithTargetedCVPixelBufferOptionsCompletionHandler(pixelBuffer: any, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedCVPixelBufferOrientationOptions(pixelBuffer: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithTargetedCVPixelBufferOrientationOptionsCompletionHandler(pixelBuffer: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedImageDataOptions(imageData: NSData, options: NSDictionary<string, any>): this;

	initWithTargetedImageDataOptionsCompletionHandler(imageData: NSData, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedImageDataOrientationOptions(imageData: NSData, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithTargetedImageDataOrientationOptionsCompletionHandler(imageData: NSData, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedImageURLOptions(imageURL: NSURL, options: NSDictionary<string, any>): this;

	initWithTargetedImageURLOptionsCompletionHandler(imageURL: NSURL, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	initWithTargetedImageURLOrientationOptions(imageURL: NSURL, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithTargetedImageURLOrientationOptionsCompletionHandler(imageURL: NSURL, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

declare class VNTextObservation extends VNRectangleObservation {

	static alloc(): VNTextObservation; // inherited from NSObject

	static new(): VNTextObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNTextObservation; // inherited from VNDetectedObjectObservation

	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNTextObservation; // inherited from VNDetectedObjectObservation

	static rectangleObservationWithRequestRevisionTopLeftBottomLeftBottomRightTopRight(requestRevision: number, topLeft: CGPoint, bottomLeft: CGPoint, bottomRight: CGPoint, topRight: CGPoint): VNTextObservation; // inherited from VNRectangleObservation

	readonly characterBoxes: NSArray<VNRectangleObservation>;
}

declare class VNTrackObjectRequest extends VNTrackingRequest {

	static alloc(): VNTrackObjectRequest; // inherited from NSObject

	static new(): VNTrackObjectRequest; // inherited from NSObject

	constructor(o: { detectedObjectObservation: VNDetectedObjectObservation; });

	constructor(o: { detectedObjectObservation: VNDetectedObjectObservation; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithDetectedObjectObservation(observation: VNDetectedObjectObservation): this;

	initWithDetectedObjectObservationCompletionHandler(observation: VNDetectedObjectObservation, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

declare var VNTrackObjectRequestRevision1: number;

declare var VNTrackObjectRequestRevision2: number;

declare class VNTrackRectangleRequest extends VNTrackingRequest {

	static alloc(): VNTrackRectangleRequest; // inherited from NSObject

	static new(): VNTrackRectangleRequest; // inherited from NSObject

	constructor(o: { rectangleObservation: VNRectangleObservation; });

	constructor(o: { rectangleObservation: VNRectangleObservation; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithRectangleObservation(observation: VNRectangleObservation): this;

	initWithRectangleObservationCompletionHandler(observation: VNRectangleObservation, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

declare var VNTrackRectangleRequestRevision1: number;

declare class VNTrackingRequest extends VNImageBasedRequest {

	static alloc(): VNTrackingRequest; // inherited from NSObject

	static new(): VNTrackingRequest; // inherited from NSObject

	inputObservation: VNDetectedObjectObservation;

	lastFrame: boolean;

	trackingLevel: VNRequestTrackingLevel;
}

declare class VNTrajectoryObservation extends VNObservation {

	static alloc(): VNTrajectoryObservation; // inherited from NSObject

	static new(): VNTrajectoryObservation; // inherited from NSObject

	readonly detectedPoints: NSArray<VNPoint>;

	readonly equationCoefficients: interop.Reference<number>;

	readonly movingAverageRadius: number;

	readonly projectedPoints: NSArray<VNPoint>;
}

declare class VNTranslationalImageRegistrationRequest extends VNImageRegistrationRequest {

	static alloc(): VNTranslationalImageRegistrationRequest; // inherited from NSObject

	static new(): VNTranslationalImageRegistrationRequest; // inherited from NSObject
}

declare var VNTranslationalImageRegistrationRequestRevision1: number;

declare class VNVector extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): VNVector; // inherited from NSObject

	static dotProductOfVectorVector(v1: VNVector, v2: VNVector): number;

	static new(): VNVector; // inherited from NSObject

	static unitVectorForVector(vector: VNVector): VNVector;

	static vectorByAddingVectorToVector(v1: VNVector, v2: VNVector): VNVector;

	static vectorByMultiplyingVectorByScalar(vector: VNVector, scalar: number): VNVector;

	static vectorBySubtractingVectorFromVector(v1: VNVector, v2: VNVector): VNVector;

	readonly length: number;

	readonly r: number;

	readonly squaredLength: number;

	readonly theta: number;

	readonly x: number;

	readonly y: number;

	static readonly zeroVector: VNVector;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { r: number; theta: number; });

	constructor(o: { vectorHead: VNPoint; tail: VNPoint; });

	constructor(o: { XComponent: number; yComponent: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRTheta(r: number, theta: number): this;

	initWithVectorHeadTail(head: VNPoint, tail: VNPoint): this;

	initWithXComponentYComponent(x: number, y: number): this;
}

declare var VNVideoProcessingOptionFrameCadence: string;

declare var VNVideoProcessingOptionTimeInterval: string;

declare class VNVideoProcessor extends NSObject {

	static alloc(): VNVideoProcessor; // inherited from NSObject

	static new(): VNVideoProcessor; // inherited from NSObject

	constructor(o: { URL: NSURL; });

	addRequestProcessingOptionsError(request: VNRequest, processingOptions: VNVideoProcessorRequestProcessingOptions): boolean;

	addRequestWithProcessingOptionsError(request: VNRequest, processingOptions: NSDictionary<string, any>): boolean;

	analyzeTimeRangeError(timeRange: CMTimeRange): boolean;

	analyzeWithTimeRangeError(timeRange: CMTimeRange): boolean;

	cancel(): void;

	initWithURL(videoURL: NSURL): this;

	removeRequestError(request: VNRequest): boolean;
}

declare class VNVideoProcessorCadence extends NSObject implements NSCopying {

	static alloc(): VNVideoProcessorCadence; // inherited from NSObject

	static new(): VNVideoProcessorCadence; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class VNVideoProcessorFrameRateCadence extends VNVideoProcessorCadence {

	static alloc(): VNVideoProcessorFrameRateCadence; // inherited from NSObject

	static new(): VNVideoProcessorFrameRateCadence; // inherited from NSObject

	readonly frameRate: number;

	constructor(o: { frameRate: number; });

	initWithFrameRate(frameRate: number): this;
}

declare class VNVideoProcessorRequestProcessingOptions extends NSObject implements NSCopying {

	static alloc(): VNVideoProcessorRequestProcessingOptions; // inherited from NSObject

	static new(): VNVideoProcessorRequestProcessingOptions; // inherited from NSObject

	cadence: VNVideoProcessorCadence;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class VNVideoProcessorTimeIntervalCadence extends VNVideoProcessorCadence {

	static alloc(): VNVideoProcessorTimeIntervalCadence; // inherited from NSObject

	static new(): VNVideoProcessorTimeIntervalCadence; // inherited from NSObject

	readonly timeInterval: number;

	constructor(o: { timeInterval: number; });

	initWithTimeInterval(timeInterval: number): this;
}

declare var VNVisionVersionNumber: number;
