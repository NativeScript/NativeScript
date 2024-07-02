
/**
 * @since 17.0
 */
declare class VNAnimalBodyPoseObservation extends VNRecognizedPointsObservation {

	static alloc(): VNAnimalBodyPoseObservation; // inherited from NSObject

	static new(): VNAnimalBodyPoseObservation; // inherited from NSObject

	readonly availableJointGroupNames: NSArray<string>;

	readonly availableJointNames: NSArray<string>;

	recognizedPointForJointNameError(jointName: string): VNRecognizedPoint;

	recognizedPointsForJointsGroupNameError(jointsGroupName: string): NSDictionary<string, VNRecognizedPoint>;
}

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameLeftBackElbow: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameLeftBackKnee: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameLeftBackPaw: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameLeftEarBottom: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameLeftEarMiddle: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameLeftEarTop: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameLeftEye: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameLeftFrontElbow: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameLeftFrontKnee: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameLeftFrontPaw: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameNeck: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameNose: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameRightBackElbow: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameRightBackKnee: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameRightBackPaw: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameRightEarBottom: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameRightEarMiddle: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameRightEarTop: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameRightEye: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameRightFrontElbow: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameRightFrontKnee: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameRightFrontPaw: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameTailBottom: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameTailMiddle: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointNameTailTop: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointsGroupNameAll: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointsGroupNameForelegs: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointsGroupNameHead: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointsGroupNameHindlegs: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointsGroupNameTail: string;

/**
 * @since 17.0
 */
declare var VNAnimalBodyPoseObservationJointsGroupNameTrunk: string;

/**
 * @since 13.0
 */
declare var VNAnimalIdentifierCat: string;

/**
 * @since 13.0
 */
declare var VNAnimalIdentifierDog: string;

declare const enum VNBarcodeCompositeType {

	None = 0,

	Linked = 1,

	GS1TypeA = 2,

	GS1TypeB = 3,

	GS1TypeC = 4
}

/**
 * @since 11.0
 */
declare class VNBarcodeObservation extends VNRectangleObservation {

	static alloc(): VNBarcodeObservation; // inherited from NSObject

	static new(): VNBarcodeObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNBarcodeObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 12.0
	 */
	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNBarcodeObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 13.0
	 * @deprecated 17.0
	 */
	static rectangleObservationWithRequestRevisionTopLeftBottomLeftBottomRightTopRight(requestRevision: number, topLeft: CGPoint, bottomLeft: CGPoint, bottomRight: CGPoint, topRight: CGPoint): VNBarcodeObservation; // inherited from VNRectangleObservation

	/**
	 * @since 17.0
	 */
	static rectangleObservationWithRequestRevisionTopLeftTopRightBottomRightBottomLeft(requestRevision: number, topLeft: CGPoint, topRight: CGPoint, bottomRight: CGPoint, bottomLeft: CGPoint): VNBarcodeObservation; // inherited from VNRectangleObservation

	readonly barcodeDescriptor: CIBarcodeDescriptor;

	/**
	 * @since 17.0
	 */
	readonly isColorInverted: boolean;

	/**
	 * @since 17.0
	 */
	readonly isGS1DataCarrier: boolean;

	/**
	 * @since 17.0
	 */
	readonly payloadData: NSData;

	readonly payloadStringValue: string;

	/**
	 * @since 17.0
	 */
	readonly supplementalCompositeType: VNBarcodeCompositeType;

	/**
	 * @since 17.0
	 */
	readonly supplementalPayloadData: NSData;

	/**
	 * @since 17.0
	 */
	readonly supplementalPayloadString: string;

	readonly symbology: string;
}

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyAztec: string;

/**
 * @since 15.0
 */
declare var VNBarcodeSymbologyCodabar: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyCode128: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyCode39: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyCode39Checksum: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyCode39FullASCII: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyCode39FullASCIIChecksum: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyCode93: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyCode93i: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyDataMatrix: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyEAN13: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyEAN8: string;

/**
 * @since 15.0
 */
declare var VNBarcodeSymbologyGS1DataBar: string;

/**
 * @since 15.0
 */
declare var VNBarcodeSymbologyGS1DataBarExpanded: string;

/**
 * @since 15.0
 */
declare var VNBarcodeSymbologyGS1DataBarLimited: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyI2of5: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyI2of5Checksum: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyITF14: string;

/**
 * @since 17.0
 */
declare var VNBarcodeSymbologyMSIPlessey: string;

/**
 * @since 15.0
 */
declare var VNBarcodeSymbologyMicroPDF417: string;

/**
 * @since 15.0
 */
declare var VNBarcodeSymbologyMicroQR: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyPDF417: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyQR: string;

/**
 * @since 11.0
 */
declare var VNBarcodeSymbologyUPCE: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyLeftAnkle: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyLeftEar: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyLeftElbow: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyLeftEye: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyLeftHip: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyLeftKnee: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyLeftShoulder: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyLeftWrist: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyNeck: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyNose: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyRightAnkle: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyRightEar: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyRightElbow: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyRightEye: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyRightHip: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyRightKnee: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyRightShoulder: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyRightWrist: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkKeyRoot: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkRegionKeyFace: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkRegionKeyLeftArm: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkRegionKeyLeftLeg: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkRegionKeyRightArm: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkRegionKeyRightLeg: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNBodyLandmarkRegionKeyTorso: string;

/**
 * @since 18.0
 */
declare class VNCalculateImageAestheticsScoresRequest extends VNImageBasedRequest {

	static alloc(): VNCalculateImageAestheticsScoresRequest; // inherited from NSObject

	static new(): VNCalculateImageAestheticsScoresRequest; // inherited from NSObject
}

/**
 * @since 18.0
 */
declare var VNCalculateImageAestheticsScoresRequestRevision1: number;

declare const enum VNChirality {

	Unknown = 0,

	Left = -1,

	Right = 1
}

/**
 * @since 14.0
 */
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

/**
 * @since 11.0
 */
declare class VNClassificationObservation extends VNObservation {

	static alloc(): VNClassificationObservation; // inherited from NSObject

	static new(): VNClassificationObservation; // inherited from NSObject

	readonly hasPrecisionRecallCurve: boolean;

	readonly identifier: string;

	hasMinimumPrecisionForRecall(minimumPrecision: number, recall: number): boolean;

	hasMinimumRecallForPrecision(minimumRecall: number, precision: number): boolean;
}

/**
 * @since 13.0
 */
declare class VNClassifyImageRequest extends VNImageBasedRequest {

	static alloc(): VNClassifyImageRequest; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 15.0
	 */
	static knownClassificationsForRevisionError(requestRevision: number): NSArray<VNClassificationObservation>;

	static new(): VNClassifyImageRequest; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	supportedIdentifiersAndReturnError(): NSArray<string>;
}

/**
 * @since 13.0
 */
declare var VNClassifyImageRequestRevision1: number;

/**
 * @since 17.0
 */
declare var VNClassifyImageRequestRevision2: number;

/**
 * @since 17.0
 */
declare var VNComputeStageMain: string;

/**
 * @since 17.0
 */
declare var VNComputeStagePostProcessing: string;

/**
 * @since 14.0
 */
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

/**
 * @since 14.0
 */
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

/**
 * @since 11.0
 */
declare class VNCoreMLFeatureValueObservation extends VNObservation {

	static alloc(): VNCoreMLFeatureValueObservation; // inherited from NSObject

	static new(): VNCoreMLFeatureValueObservation; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly featureName: string;

	readonly featureValue: MLFeatureValue;
}

/**
 * @since 11.0
 */
declare class VNCoreMLModel extends NSObject {

	static alloc(): VNCoreMLModel; // inherited from NSObject

	static modelForMLModelError(model: MLModel): VNCoreMLModel;

	static new(): VNCoreMLModel; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	featureProvider: MLFeatureProvider;

	/**
	 * @since 13.0
	 */
	inputImageFeatureName: string;
}

/**
 * @since 11.0
 */
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

/**
 * @since 12.0
 */
declare var VNCoreMLRequestRevision1: number;

/**
 * @since 17.0
 */
declare class VNDetectAnimalBodyPoseRequest extends VNImageBasedRequest {

	static alloc(): VNDetectAnimalBodyPoseRequest; // inherited from NSObject

	static new(): VNDetectAnimalBodyPoseRequest; // inherited from NSObject

	supportedJointNamesAndReturnError(): NSArray<string>;

	supportedJointsGroupNamesAndReturnError(): NSArray<string>;
}

/**
 * @since 17.0
 */
declare var VNDetectAnimalBodyPoseRequestRevision1: number;

/**
 * @since 11.0
 */
declare class VNDetectBarcodesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectBarcodesRequest; // inherited from NSObject

	static new(): VNDetectBarcodesRequest; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	coalesceCompositeSymbologies: boolean;

	symbologies: NSArray<string>;

	/**
	 * @since 11.0
	 * @deprecated 15.0
	 */
	static readonly supportedSymbologies: NSArray<string>;

	/**
	 * @since 15.0
	 */
	supportedSymbologiesAndReturnError(): NSArray<string>;
}

/**
 * @since 12.0
 * @deprecated 17.0
 */
declare var VNDetectBarcodesRequestRevision1: number;

/**
 * @since 15.0
 */
declare var VNDetectBarcodesRequestRevision2: number;

/**
 * @since 16.0
 */
declare var VNDetectBarcodesRequestRevision3: number;

/**
 * @since 17.0
 */
declare var VNDetectBarcodesRequestRevision4: number;

/**
 * @since 14.0
 */
declare var VNDetectContourRequestRevision1: number;

/**
 * @since 14.0
 */
declare class VNDetectContoursRequest extends VNImageBasedRequest {

	static alloc(): VNDetectContoursRequest; // inherited from NSObject

	static new(): VNDetectContoursRequest; // inherited from NSObject

	contrastAdjustment: number;

	/**
	 * @since 15.0
	 */
	contrastPivot: number;

	/**
	 * @since 14.0
	 * @deprecated 14.0
	 */
	detectDarkOnLight: boolean;

	detectsDarkOnLight: boolean;

	maximumImageDimension: number;
}

/**
 * @since 15.0
 */
declare class VNDetectDocumentSegmentationRequest extends VNImageBasedRequest {

	static alloc(): VNDetectDocumentSegmentationRequest; // inherited from NSObject

	static new(): VNDetectDocumentSegmentationRequest; // inherited from NSObject
}

/**
 * @since 15.0
 */
declare var VNDetectDocumentSegmentationRequestRevision1: number;

/**
 * @since 13.0
 */
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

/**
 * @since 13.0
 */
declare var VNDetectFaceCaptureQualityRequestRevision1: number;

/**
 * @since 14.0
 */
declare var VNDetectFaceCaptureQualityRequestRevision2: number;

/**
 * @since 17.0
 */
declare var VNDetectFaceCaptureQualityRequestRevision3: number;

/**
 * @since 11.0
 */
declare class VNDetectFaceLandmarksRequest extends VNImageBasedRequest implements VNFaceObservationAccepting {

	static alloc(): VNDetectFaceLandmarksRequest; // inherited from NSObject

	static new(): VNDetectFaceLandmarksRequest; // inherited from NSObject

	static revisionSupportsConstellation(requestRevision: number, constellation: VNRequestFaceLandmarksConstellation): boolean;

	/**
	 * @since 13.0
	 */
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

/**
 * @since 12.0
 * @deprecated 16.0
 */
declare var VNDetectFaceLandmarksRequestRevision1: number;

/**
 * @since 12.0
 */
declare var VNDetectFaceLandmarksRequestRevision2: number;

/**
 * @since 13.0
 */
declare var VNDetectFaceLandmarksRequestRevision3: number;

/**
 * @since 11.0
 */
declare class VNDetectFaceRectanglesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectFaceRectanglesRequest; // inherited from NSObject

	static new(): VNDetectFaceRectanglesRequest; // inherited from NSObject
}

/**
 * @since 12.0
 * @deprecated 16.0
 */
declare var VNDetectFaceRectanglesRequestRevision1: number;

/**
 * @since 12.0
 */
declare var VNDetectFaceRectanglesRequestRevision2: number;

/**
 * @since 15.0
 */
declare var VNDetectFaceRectanglesRequestRevision3: number;

/**
 * @since 11.0
 */
declare class VNDetectHorizonRequest extends VNImageBasedRequest {

	static alloc(): VNDetectHorizonRequest; // inherited from NSObject

	static new(): VNDetectHorizonRequest; // inherited from NSObject
}

/**
 * @since 12.0
 */
declare var VNDetectHorizonRequestRevision1: number;

/**
 * @since 17.0
 */
declare class VNDetectHumanBodyPose3DRequest extends VNStatefulRequest {

	static alloc(): VNDetectHumanBodyPose3DRequest; // inherited from NSObject

	static new(): VNDetectHumanBodyPose3DRequest; // inherited from NSObject

	supportedJointNamesAndReturnError(): NSArray<string>;

	supportedJointsGroupNamesAndReturnError(): NSArray<string>;
}

/**
 * @since 17.0
 */
declare var VNDetectHumanBodyPose3DRequestRevision1: number;

/**
 * @since 14.0
 */
declare class VNDetectHumanBodyPoseRequest extends VNImageBasedRequest {

	static alloc(): VNDetectHumanBodyPoseRequest; // inherited from NSObject

	static new(): VNDetectHumanBodyPoseRequest; // inherited from NSObject

	/**
	 * @since 14.0
	 * @deprecated 17.0
	 */
	static supportedJointNamesForRevisionError(revision: number): NSArray<string>;

	/**
	 * @since 14.0
	 * @deprecated 17.0
	 */
	static supportedJointsGroupNamesForRevisionError(revision: number): NSArray<string>;

	/**
	 * @since 17.0
	 */
	supportedJointNamesAndReturnError(): NSArray<string>;

	/**
	 * @since 17.0
	 */
	supportedJointsGroupNamesAndReturnError(): NSArray<string>;
}

/**
 * @since 14.0
 */
declare var VNDetectHumanBodyPoseRequestRevision1: number;

/**
 * @since 14.0
 */
declare class VNDetectHumanHandPoseRequest extends VNImageBasedRequest {

	static alloc(): VNDetectHumanHandPoseRequest; // inherited from NSObject

	static new(): VNDetectHumanHandPoseRequest; // inherited from NSObject

	/**
	 * @since 14.0
	 * @deprecated 17.0
	 */
	static supportedJointNamesForRevisionError(revision: number): NSArray<string>;

	/**
	 * @since 14.0
	 * @deprecated 17.0
	 */
	static supportedJointsGroupNamesForRevisionError(revision: number): NSArray<string>;

	maximumHandCount: number;

	/**
	 * @since 17.0
	 */
	supportedJointNamesAndReturnError(): NSArray<string>;

	/**
	 * @since 17.0
	 */
	supportedJointsGroupNamesAndReturnError(): NSArray<string>;
}

/**
 * @since 14.0
 */
declare var VNDetectHumanHandPoseRequestRevision1: number;

/**
 * @since 13.0
 */
declare class VNDetectHumanRectanglesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectHumanRectanglesRequest; // inherited from NSObject

	static new(): VNDetectHumanRectanglesRequest; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	upperBodyOnly: boolean;
}

/**
 * @since 13.0
 */
declare var VNDetectHumanRectanglesRequestRevision1: number;

/**
 * @since 15.0
 */
declare var VNDetectHumanRectanglesRequestRevision2: number;

/**
 * @since 11.0
 */
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

/**
 * @since 12.0
 */
declare var VNDetectRectanglesRequestRevision1: number;

/**
 * @since 11.0
 */
declare class VNDetectTextRectanglesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectTextRectanglesRequest; // inherited from NSObject

	static new(): VNDetectTextRectanglesRequest; // inherited from NSObject

	reportCharacterBoxes: boolean;
}

/**
 * @since 12.0
 */
declare var VNDetectTextRectanglesRequestRevision1: number;

/**
 * @since 14.0
 */
declare class VNDetectTrajectoriesRequest extends VNStatefulRequest {

	static alloc(): VNDetectTrajectoriesRequest; // inherited from NSObject

	static new(): VNDetectTrajectoriesRequest; // inherited from NSObject

	/**
	 * @since 14.0
	 * @deprecated 14.0
	 */
	maximumObjectSize: number;

	/**
	 * @since 14.0
	 * @deprecated 14.0
	 */
	minimumObjectSize: number;

	objectMaximumNormalizedRadius: number;

	objectMinimumNormalizedRadius: number;

	/**
	 * @since 15.0
	 */
	targetFrameTime: CMTime;

	readonly trajectoryLength: number;

	constructor(o: { frameAnalysisSpacing: CMTime; trajectoryLength: number; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithFrameAnalysisSpacingTrajectoryLengthCompletionHandler(frameAnalysisSpacing: CMTime, trajectoryLength: number, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

/**
 * @since 14.0
 */
declare var VNDetectTrajectoriesRequestRevision1: number;

/**
 * @since 11.0
 */
declare class VNDetectedObjectObservation extends VNObservation {

	static alloc(): VNDetectedObjectObservation; // inherited from NSObject

	static new(): VNDetectedObjectObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNDetectedObjectObservation;

	/**
	 * @since 12.0
	 */
	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNDetectedObjectObservation;

	readonly boundingBox: CGRect;

	/**
	 * @since 15.0
	 */
	readonly globalSegmentationMask: VNPixelBufferObservation;
}

/**
 * @since 14.0
 */
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

/**
 * @since 13.0
 */
declare function VNElementTypeSize(elementType: VNElementType): number;

declare const enum VNErrorCode {

	TuriCoreErrorCode = -1,

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

	UnsupportedRequest = 19,

	Timeout = 20,

	UnsupportedComputeStage = 21,

	UnsupportedComputeDevice = 22
}

/**
 * @since 11.0
 */
declare var VNErrorDomain: string;

/**
 * @since 11.0
 */
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

/**
 * @since 11.0
 */
declare class VNFaceLandmarkRegion2D extends VNFaceLandmarkRegion {

	static alloc(): VNFaceLandmarkRegion2D; // inherited from NSObject

	static new(): VNFaceLandmarkRegion2D; // inherited from NSObject

	readonly normalizedPoints: interop.Pointer | interop.Reference<CGPoint>;

	/**
	 * @since 16.0
	 */
	readonly pointsClassification: VNPointsClassification;

	/**
	 * @since 13.0
	 */
	readonly precisionEstimatesPerPoint: NSArray<number>;

	pointsInImageOfSize(imageSize: CGSize): interop.Pointer | interop.Reference<CGPoint>;
}

/**
 * @since 11.0
 */
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

/**
 * @since 11.0
 */
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

/**
 * @since 11.0
 */
declare class VNFaceObservation extends VNDetectedObjectObservation {

	static alloc(): VNFaceObservation; // inherited from NSObject

	/**
	 * @since 12.0
	 * @deprecated 15.0
	 */
	static faceObservationWithRequestRevisionBoundingBoxRollYaw(requestRevision: number, boundingBox: CGRect, roll: number, yaw: number): VNFaceObservation;

	/**
	 * @since 15.0
	 */
	static faceObservationWithRequestRevisionBoundingBoxRollYawPitch(requestRevision: number, boundingBox: CGRect, roll: number, yaw: number, pitch: number): VNFaceObservation;

	static new(): VNFaceObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNFaceObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 12.0
	 */
	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNFaceObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 13.0
	 */
	readonly faceCaptureQuality: number;

	readonly landmarks: VNFaceLandmarks2D;

	/**
	 * @since 15.0
	 */
	readonly pitch: number;

	/**
	 * @since 12.0
	 */
	readonly roll: number;

	/**
	 * @since 12.0
	 */
	readonly yaw: number;
}

/**
 * @since 11.0
 */
interface VNFaceObservationAccepting extends NSObjectProtocol {

	inputFaceObservations: NSArray<VNFaceObservation>;
}
declare var VNFaceObservationAccepting: {

	prototype: VNFaceObservationAccepting;
};

/**
 * @since 13.0
 */
declare class VNFeaturePrintObservation extends VNObservation {

	static alloc(): VNFeaturePrintObservation; // inherited from NSObject

	static new(): VNFeaturePrintObservation; // inherited from NSObject

	readonly data: NSData;

	readonly elementCount: number;

	readonly elementType: VNElementType;

	computeDistanceToFeaturePrintObservationError(outDistance: interop.Pointer | interop.Reference<number>, featurePrint: VNFeaturePrintObservation): boolean;
}

/**
 * @since 13.0
 */
declare class VNGenerateAttentionBasedSaliencyImageRequest extends VNImageBasedRequest {

	static alloc(): VNGenerateAttentionBasedSaliencyImageRequest; // inherited from NSObject

	static new(): VNGenerateAttentionBasedSaliencyImageRequest; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare var VNGenerateAttentionBasedSaliencyImageRequestRevision1: number;

/**
 * @since 17.0
 */
declare var VNGenerateAttentionBasedSaliencyImageRequestRevision2: number;

/**
 * @since 17.0
 */
declare class VNGenerateForegroundInstanceMaskRequest extends VNImageBasedRequest {

	static alloc(): VNGenerateForegroundInstanceMaskRequest; // inherited from NSObject

	static new(): VNGenerateForegroundInstanceMaskRequest; // inherited from NSObject
}

/**
 * @since 17.0
 */
declare var VNGenerateForegroundInstanceMaskRequestRevision1: number;

/**
 * @since 13.0
 */
declare class VNGenerateImageFeaturePrintRequest extends VNImageBasedRequest {

	static alloc(): VNGenerateImageFeaturePrintRequest; // inherited from NSObject

	static new(): VNGenerateImageFeaturePrintRequest; // inherited from NSObject

	imageCropAndScaleOption: VNImageCropAndScaleOption;
}

/**
 * @since 13.0
 */
declare var VNGenerateImageFeaturePrintRequestRevision1: number;

/**
 * @since 17.0
 */
declare var VNGenerateImageFeaturePrintRequestRevision2: number;

/**
 * @since 13.0
 */
declare class VNGenerateObjectnessBasedSaliencyImageRequest extends VNImageBasedRequest {

	static alloc(): VNGenerateObjectnessBasedSaliencyImageRequest; // inherited from NSObject

	static new(): VNGenerateObjectnessBasedSaliencyImageRequest; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare var VNGenerateObjectnessBasedSaliencyImageRequestRevision1: number;

/**
 * @since 17.0
 */
declare var VNGenerateObjectnessBasedSaliencyImageRequestRevision2: number;

/**
 * @since 14.0
 */
declare class VNGenerateOpticalFlowRequest extends VNTargetedImageRequest {

	static alloc(): VNGenerateOpticalFlowRequest; // inherited from NSObject

	static new(): VNGenerateOpticalFlowRequest; // inherited from NSObject

	computationAccuracy: VNGenerateOpticalFlowRequestComputationAccuracy;

	/**
	 * @since 16.0
	 */
	keepNetworkOutput: boolean;

	outputPixelFormat: number;
}

declare const enum VNGenerateOpticalFlowRequestComputationAccuracy {

	Low = 0,

	Medium = 1,

	High = 2,

	VeryHigh = 3
}

/**
 * @since 14.0
 */
declare var VNGenerateOpticalFlowRequestRevision1: number;

/**
 * @since 16.0
 */
declare var VNGenerateOpticalFlowRequestRevision2: number;

/**
 * @since 17.0
 */
declare class VNGeneratePersonInstanceMaskRequest extends VNImageBasedRequest {

	static alloc(): VNGeneratePersonInstanceMaskRequest; // inherited from NSObject

	static new(): VNGeneratePersonInstanceMaskRequest; // inherited from NSObject
}

/**
 * @since 17.0
 */
declare var VNGeneratePersonInstanceMaskRequestRevision1: number;

/**
 * @since 15.0
 */
declare class VNGeneratePersonSegmentationRequest extends VNStatefulRequest {

	static alloc(): VNGeneratePersonSegmentationRequest; // inherited from NSObject

	static new(): VNGeneratePersonSegmentationRequest; // inherited from NSObject

	outputPixelFormat: number;

	qualityLevel: VNGeneratePersonSegmentationRequestQualityLevel;

	/**
	 * @since 18.0
	 */
	supportedOutputPixelFormatsAndReturnError(): NSArray<number>;
}

declare const enum VNGeneratePersonSegmentationRequestQualityLevel {

	Accurate = 0,

	Balanced = 1,

	Fast = 2
}

/**
 * @since 15.0
 */
declare var VNGeneratePersonSegmentationRequestRevision1: number;

/**
 * @since 14.0
 */
declare class VNGeometryUtils extends NSObject {

	static alloc(): VNGeometryUtils; // inherited from NSObject

	static boundingCircleForContourError(contour: VNContour): VNCircle;

	static boundingCircleForPointsError(points: NSArray<VNPoint> | VNPoint[]): VNCircle;

	static boundingCircleForSIMDPointsPointCountError(points: interop.Pointer | interop.Reference<interop.Reference<number>>, pointCount: number): VNCircle;

	static calculateAreaForContourOrientedAreaError(area: interop.Pointer | interop.Reference<number>, contour: VNContour, orientedArea: boolean): boolean;

	static calculatePerimeterForContourError(perimeter: interop.Pointer | interop.Reference<number>, contour: VNContour): boolean;

	static new(): VNGeometryUtils; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare class VNHomographicImageRegistrationRequest extends VNImageRegistrationRequest {

	static alloc(): VNHomographicImageRegistrationRequest; // inherited from NSObject

	static new(): VNHomographicImageRegistrationRequest; // inherited from NSObject
}

/**
 * @since 12.0
 */
declare var VNHomographicImageRegistrationRequestRevision1: number;

/**
 * @since 11.0
 */
declare class VNHorizonObservation extends VNObservation {

	static alloc(): VNHorizonObservation; // inherited from NSObject

	static new(): VNHorizonObservation; // inherited from NSObject

	readonly angle: number;

	readonly transform: CGAffineTransform;

	/**
	 * @since 16.0
	 */
	transformForImageWidthHeight(width: number, height: number): CGAffineTransform;
}

/**
 * @since 17.0
 */
declare class VNHumanBodyPose3DObservation extends VNRecognizedPoints3DObservation {

	static alloc(): VNHumanBodyPose3DObservation; // inherited from NSObject

	static new(): VNHumanBodyPose3DObservation; // inherited from NSObject

	readonly availableJointNames: NSArray<string>;

	readonly availableJointsGroupNames: NSArray<string>;

	readonly bodyHeight: number;

	readonly cameraOriginMatrix: simd_float4x4;

	readonly heightEstimation: VNHumanBodyPose3DObservationHeightEstimation;

	getCameraRelativePositionForJointNameError(modelPositionOut: interop.Pointer | interop.Reference<simd_float4x4>, jointName: string): boolean;

	parentJointNameForJointName(jointName: string): string;

	pointInImageForJointNameError(jointName: string): VNPoint;

	recognizedPointForJointNameError(jointName: string): VNHumanBodyRecognizedPoint3D;

	recognizedPointsForJointsGroupNameError(jointsGroupName: string): NSDictionary<string, VNHumanBodyRecognizedPoint3D>;
}

declare const enum VNHumanBodyPose3DObservationHeightEstimation {

	Reference = 0,

	Measured = 1
}

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameCenterHead: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameCenterShoulder: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameLeftAnkle: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameLeftElbow: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameLeftHip: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameLeftKnee: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameLeftShoulder: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameLeftWrist: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameRightAnkle: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameRightElbow: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameRightHip: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameRightKnee: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameRightShoulder: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameRightWrist: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameRoot: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameSpine: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointNameTopHead: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointsGroupNameAll: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointsGroupNameHead: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointsGroupNameLeftArm: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointsGroupNameLeftLeg: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointsGroupNameRightArm: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointsGroupNameRightLeg: string;

/**
 * @since 17.0
 */
declare var VNHumanBodyPose3DObservationJointsGroupNameTorso: string;

/**
 * @since 14.0
 */
declare class VNHumanBodyPoseObservation extends VNRecognizedPointsObservation {

	static alloc(): VNHumanBodyPoseObservation; // inherited from NSObject

	static new(): VNHumanBodyPoseObservation; // inherited from NSObject

	readonly availableJointNames: NSArray<string>;

	readonly availableJointsGroupNames: NSArray<string>;

	recognizedPointForJointNameError(jointName: string): VNRecognizedPoint;

	recognizedPointsForJointsGroupNameError(jointsGroupName: string): NSDictionary<string, VNRecognizedPoint>;
}

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameLeftAnkle: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameLeftEar: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameLeftElbow: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameLeftEye: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameLeftHip: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameLeftKnee: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameLeftShoulder: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameLeftWrist: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameNeck: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameNose: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameRightAnkle: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameRightEar: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameRightElbow: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameRightEye: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameRightHip: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameRightKnee: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameRightShoulder: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameRightWrist: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointNameRoot: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointsGroupNameAll: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointsGroupNameFace: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointsGroupNameLeftArm: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointsGroupNameLeftLeg: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointsGroupNameRightArm: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointsGroupNameRightLeg: string;

/**
 * @since 14.0
 */
declare var VNHumanBodyPoseObservationJointsGroupNameTorso: string;

/**
 * @since 17.0
 */
declare class VNHumanBodyRecognizedPoint3D extends VNRecognizedPoint3D {

	static alloc(): VNHumanBodyRecognizedPoint3D; // inherited from NSObject

	static new(): VNHumanBodyRecognizedPoint3D; // inherited from NSObject

	readonly localPosition: simd_float4x4;

	readonly parentJoint: string;
}

/**
 * @since 14.0
 */
declare class VNHumanHandPoseObservation extends VNRecognizedPointsObservation {

	static alloc(): VNHumanHandPoseObservation; // inherited from NSObject

	static new(): VNHumanHandPoseObservation; // inherited from NSObject

	readonly availableJointNames: NSArray<string>;

	readonly availableJointsGroupNames: NSArray<string>;

	/**
	 * @since 15.0
	 */
	readonly chirality: VNChirality;

	recognizedPointForJointNameError(jointName: string): VNRecognizedPoint;

	recognizedPointsForJointsGroupNameError(jointsGroupName: string): NSDictionary<string, VNRecognizedPoint>;
}

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameIndexDIP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameIndexMCP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameIndexPIP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameIndexTip: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameLittleDIP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameLittleMCP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameLittlePIP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameLittleTip: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameMiddleDIP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameMiddleMCP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameMiddlePIP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameMiddleTip: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameRingDIP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameRingMCP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameRingPIP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameRingTip: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameThumbCMC: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameThumbIP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameThumbMP: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameThumbTip: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointNameWrist: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointsGroupNameAll: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointsGroupNameIndexFinger: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointsGroupNameLittleFinger: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointsGroupNameMiddleFinger: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointsGroupNameRingFinger: string;

/**
 * @since 14.0
 */
declare var VNHumanHandPoseObservationJointsGroupNameThumb: string;

/**
 * @since 15.0
 */
declare class VNHumanObservation extends VNDetectedObjectObservation {

	static alloc(): VNHumanObservation; // inherited from NSObject

	static new(): VNHumanObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNHumanObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 12.0
	 */
	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNHumanObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 15.0
	 */
	readonly upperBodyOnly: boolean;
}

/**
 * @since 18.0
 */
declare class VNImageAestheticsScoresObservation extends VNObservation {

	static alloc(): VNImageAestheticsScoresObservation; // inherited from NSObject

	static new(): VNImageAestheticsScoresObservation; // inherited from NSObject

	readonly isUtility: boolean;

	readonly overallScore: number;
}

/**
 * @since 11.0
 */
declare class VNImageAlignmentObservation extends VNObservation {

	static alloc(): VNImageAlignmentObservation; // inherited from NSObject

	static new(): VNImageAlignmentObservation; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare class VNImageBasedRequest extends VNRequest {

	static alloc(): VNImageBasedRequest; // inherited from NSObject

	static new(): VNImageBasedRequest; // inherited from NSObject

	regionOfInterest: CGRect;
}

declare const enum VNImageCropAndScaleOption {

	CenterCrop = 0,

	ScaleFit = 1,

	ScaleFill = 2,

	ScaleFitRotate90CCW = 257,

	ScaleFillRotate90CCW = 258
}

/**
 * @since 11.0
 */
declare class VNImageHomographicAlignmentObservation extends VNImageAlignmentObservation {

	static alloc(): VNImageHomographicAlignmentObservation; // inherited from NSObject

	static new(): VNImageHomographicAlignmentObservation; // inherited from NSObject

	readonly warpTransform: simd_float3x3;
}

/**
 * @since 11.0
 */
declare var VNImageOptionCIContext: string;

/**
 * @since 11.0
 */
declare var VNImageOptionCameraIntrinsics: string;

/**
 * @since 11.0
 */
declare var VNImageOptionProperties: string;

/**
 * @since 11.0
 */
declare function VNImagePointForFaceLandmarkPoint(faceLandmarkPoint: interop.Reference<number>, faceBoundingBox: CGRect, imageWidth: number, imageHeight: number): CGPoint;

/**
 * @since 11.0
 */
declare function VNImagePointForNormalizedPoint(normalizedPoint: CGPoint, imageWidth: number, imageHeight: number): CGPoint;

/**
 * @since 15.0
 */
declare function VNImagePointForNormalizedPointUsingRegionOfInterest(normalizedPoint: CGPoint, imageWidth: number, imageHeight: number, roi: CGRect): CGPoint;

/**
 * @since 11.0
 */
declare function VNImageRectForNormalizedRect(normalizedRect: CGRect, imageWidth: number, imageHeight: number): CGRect;

/**
 * @since 15.0
 */
declare function VNImageRectForNormalizedRectUsingRegionOfInterest(normalizedRect: CGRect, imageWidth: number, imageHeight: number, roi: CGRect): CGRect;

/**
 * @since 11.0
 */
declare class VNImageRegistrationRequest extends VNTargetedImageRequest {

	static alloc(): VNImageRegistrationRequest; // inherited from NSObject

	static new(): VNImageRegistrationRequest; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare class VNImageRequestHandler extends NSObject {

	static alloc(): VNImageRequestHandler; // inherited from NSObject

	static new(): VNImageRequestHandler; // inherited from NSObject

	constructor(o: { CGImage: any; options: NSDictionary<string, any>; });

	constructor(o: { CGImage: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	constructor(o: { CIImage: CIImage; options: NSDictionary<string, any>; });

	constructor(o: { CIImage: CIImage; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	/**
	 * @since 17.0
	 */
	constructor(o: { CMSampleBuffer: any; depthData: AVDepthData; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	/**
	 * @since 14.0
	 */
	constructor(o: { CMSampleBuffer: any; options: NSDictionary<string, any>; });

	/**
	 * @since 14.0
	 */
	constructor(o: { CMSampleBuffer: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	/**
	 * @since 17.0
	 */
	constructor(o: { CVPixelBuffer: any; depthData: AVDepthData; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

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

	/**
	 * @since 17.0
	 */
	initWithCMSampleBufferDepthDataOrientationOptions(sampleBuffer: any, depthData: AVDepthData, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	/**
	 * @since 14.0
	 */
	initWithCMSampleBufferOptions(sampleBuffer: any, options: NSDictionary<string, any>): this;

	/**
	 * @since 14.0
	 */
	initWithCMSampleBufferOrientationOptions(sampleBuffer: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	/**
	 * @since 17.0
	 */
	initWithCVPixelBufferDepthDataOrientationOptions(pixelBuffer: any, depthData: AVDepthData, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithCVPixelBufferOptions(pixelBuffer: any, options: NSDictionary<string, any>): this;

	initWithCVPixelBufferOrientationOptions(pixelBuffer: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithDataOptions(imageData: NSData, options: NSDictionary<string, any>): this;

	initWithDataOrientationOptions(imageData: NSData, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithURLOptions(imageURL: NSURL, options: NSDictionary<string, any>): this;

	initWithURLOrientationOptions(imageURL: NSURL, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	performRequestsError(requests: NSArray<VNRequest> | VNRequest[]): boolean;
}

/**
 * @since 11.0
 */
declare class VNImageTranslationAlignmentObservation extends VNImageAlignmentObservation {

	static alloc(): VNImageTranslationAlignmentObservation; // inherited from NSObject

	static new(): VNImageTranslationAlignmentObservation; // inherited from NSObject

	readonly alignmentTransform: CGAffineTransform;
}

/**
 * @since 17.0
 */
declare class VNInstanceMaskObservation extends VNObservation {

	static alloc(): VNInstanceMaskObservation; // inherited from NSObject

	static new(): VNInstanceMaskObservation; // inherited from NSObject

	readonly allInstances: NSIndexSet;

	readonly instanceMask: any;

	generateMaskForInstancesError(instances: NSIndexSet): any;

	generateMaskedImageOfInstancesFromRequestHandlerCroppedToInstancesExtentError(instances: NSIndexSet, requestHandler: VNImageRequestHandler, cropResult: boolean): any;

	generateScaledMaskForImageForInstancesFromRequestHandlerError(instances: NSIndexSet, requestHandler: VNImageRequestHandler): any;
}

/**
 * @since 11.0
 */
declare function VNNormalizedFaceBoundingBoxPointForLandmarkPoint(faceLandmarkPoint: interop.Reference<number>, faceBoundingBox: CGRect, imageWidth: number, imageHeight: number): CGPoint;

/**
 * @since 11.0
 */
declare var VNNormalizedIdentityRect: CGRect;

/**
 * @since 14.0
 */
declare function VNNormalizedPointForImagePoint(imagePoint: CGPoint, imageWidth: number, imageHeight: number): CGPoint;

/**
 * @since 15.0
 */
declare function VNNormalizedPointForImagePointUsingRegionOfInterest(imagePoint: CGPoint, imageWidth: number, imageHeight: number, roi: CGRect): CGPoint;

/**
 * @since 11.0
 */
declare function VNNormalizedRectForImageRect(imageRect: CGRect, imageWidth: number, imageHeight: number): CGRect;

/**
 * @since 15.0
 */
declare function VNNormalizedRectForImageRectUsingRegionOfInterest(imageRect: CGRect, imageWidth: number, imageHeight: number, roi: CGRect): CGRect;

/**
 * @since 11.0
 */
declare function VNNormalizedRectIsIdentityRect(normalizedRect: CGRect): boolean;

/**
 * @since 11.0
 */
declare class VNObservation extends NSObject implements NSCopying, NSSecureCoding, VNRequestRevisionProviding {

	static alloc(): VNObservation; // inherited from NSObject

	static new(): VNObservation; // inherited from NSObject

	readonly confidence: number;

	/**
	 * @since 14.0
	 */
	readonly timeRange: CMTimeRange;

	readonly uuid: NSUUID;

	readonly requestRevision: number; // inherited from VNRequestRevisionProviding

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare class VNPixelBufferObservation extends VNObservation {

	static alloc(): VNPixelBufferObservation; // inherited from NSObject

	static new(): VNPixelBufferObservation; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly featureName: string;

	readonly pixelBuffer: any;
}

/**
 * @since 14.0
 */
declare class VNPoint extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): VNPoint; // inherited from NSObject

	/**
	 * @since 14.0
	 * @deprecated 14.0
	 */
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

/**
 * @since 17.0
 */
declare class VNPoint3D extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): VNPoint3D; // inherited from NSObject

	static new(): VNPoint3D; // inherited from NSObject

	readonly position: simd_float4x4;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { position: simd_float4x4; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithPosition(position: simd_float4x4): this;
}

declare const enum VNPointsClassification {

	Disconnected = 0,

	OpenPath = 1,

	ClosedPath = 2
}

/**
 * @since 13.0
 */
declare class VNRecognizeAnimalsRequest extends VNImageBasedRequest {

	static alloc(): VNRecognizeAnimalsRequest; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 15.0
	 */
	static knownAnimalIdentifiersForRevisionError(requestRevision: number): NSArray<string>;

	static new(): VNRecognizeAnimalsRequest; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	supportedIdentifiersAndReturnError(): NSArray<string>;
}

/**
 * @since 13.0
 */
declare var VNRecognizeAnimalsRequestRevision1: number;

/**
 * @since 15.0
 */
declare var VNRecognizeAnimalsRequestRevision2: number;

/**
 * @since 13.0
 */
declare class VNRecognizeTextRequest extends VNImageBasedRequest implements VNRequestProgressProviding {

	static alloc(): VNRecognizeTextRequest; // inherited from NSObject

	static new(): VNRecognizeTextRequest; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 15.0
	 */
	static supportedRecognitionLanguagesForTextRecognitionLevelRevisionError(recognitionLevel: VNRequestTextRecognitionLevel, requestRevision: number): NSArray<string>;

	/**
	 * @since 16.0
	 */
	automaticallyDetectsLanguage: boolean;

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

	/**
	 * @since 15.0
	 */
	supportedRecognitionLanguagesAndReturnError(): NSArray<string>;
}

/**
 * @since 13.0
 * @deprecated 18.0
 */
declare var VNRecognizeTextRequestRevision1: number;

/**
 * @since 14.0
 */
declare var VNRecognizeTextRequestRevision2: number;

/**
 * @since 16.0
 */
declare var VNRecognizeTextRequestRevision3: number;

/**
 * @since 12.0
 */
declare class VNRecognizedObjectObservation extends VNDetectedObjectObservation {

	static alloc(): VNRecognizedObjectObservation; // inherited from NSObject

	static new(): VNRecognizedObjectObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNRecognizedObjectObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 12.0
	 */
	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNRecognizedObjectObservation; // inherited from VNDetectedObjectObservation

	readonly labels: NSArray<VNClassificationObservation>;
}

/**
 * @since 14.0
 */
declare class VNRecognizedPoint extends VNDetectedPoint {

	static alloc(): VNRecognizedPoint; // inherited from NSObject

	static new(): VNRecognizedPoint; // inherited from NSObject

	readonly identifier: string;
}

/**
 * @since 17.0
 */
declare class VNRecognizedPoint3D extends VNPoint3D {

	static alloc(): VNRecognizedPoint3D; // inherited from NSObject

	static new(): VNRecognizedPoint3D; // inherited from NSObject

	readonly identifier: string;
}

/**
 * @since 14.0
 */
declare var VNRecognizedPoint3DGroupKeyAll: string;

/**
 * @since 14.0
 */
declare var VNRecognizedPointGroupKeyAll: string;

/**
 * @since 14.0
 */
declare class VNRecognizedPoints3DObservation extends VNObservation {

	static alloc(): VNRecognizedPoints3DObservation; // inherited from NSObject

	static new(): VNRecognizedPoints3DObservation; // inherited from NSObject

	readonly availableGroupKeys: NSArray<string>;

	readonly availableKeys: NSArray<string>;

	recognizedPointForKeyError(pointKey: string): VNRecognizedPoint3D;

	recognizedPointsForGroupKeyError(groupKey: string): NSDictionary<string, VNRecognizedPoint3D>;
}

/**
 * @since 14.0
 */
declare class VNRecognizedPointsObservation extends VNObservation {

	static alloc(): VNRecognizedPointsObservation; // inherited from NSObject

	static new(): VNRecognizedPointsObservation; // inherited from NSObject

	readonly availableGroupKeys: NSArray<string>;

	readonly availableKeys: NSArray<string>;

	keypointsMultiArrayAndReturnError(): MLMultiArray;

	recognizedPointForKeyError(pointKey: string): VNRecognizedPoint;

	recognizedPointsForGroupKeyError(groupKey: string): NSDictionary<string, VNRecognizedPoint>;
}

/**
 * @since 13.0
 */
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

/**
 * @since 13.0
 */
declare class VNRecognizedTextObservation extends VNRectangleObservation {

	static alloc(): VNRecognizedTextObservation; // inherited from NSObject

	static new(): VNRecognizedTextObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNRecognizedTextObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 12.0
	 */
	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNRecognizedTextObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 13.0
	 * @deprecated 17.0
	 */
	static rectangleObservationWithRequestRevisionTopLeftBottomLeftBottomRightTopRight(requestRevision: number, topLeft: CGPoint, bottomLeft: CGPoint, bottomRight: CGPoint, topRight: CGPoint): VNRecognizedTextObservation; // inherited from VNRectangleObservation

	/**
	 * @since 17.0
	 */
	static rectangleObservationWithRequestRevisionTopLeftTopRightBottomRightBottomLeft(requestRevision: number, topLeft: CGPoint, topRight: CGPoint, bottomRight: CGPoint, bottomLeft: CGPoint): VNRecognizedTextObservation; // inherited from VNRectangleObservation

	topCandidates(maxCandidateCount: number): NSArray<VNRecognizedText>;
}

/**
 * @since 11.0
 */
declare class VNRectangleObservation extends VNDetectedObjectObservation {

	static alloc(): VNRectangleObservation; // inherited from NSObject

	static new(): VNRectangleObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNRectangleObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 12.0
	 */
	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNRectangleObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 13.0
	 * @deprecated 17.0
	 */
	static rectangleObservationWithRequestRevisionTopLeftBottomLeftBottomRightTopRight(requestRevision: number, topLeft: CGPoint, bottomLeft: CGPoint, bottomRight: CGPoint, topRight: CGPoint): VNRectangleObservation;

	/**
	 * @since 17.0
	 */
	static rectangleObservationWithRequestRevisionTopLeftTopRightBottomRightBottomLeft(requestRevision: number, topLeft: CGPoint, topRight: CGPoint, bottomRight: CGPoint, bottomLeft: CGPoint): VNRectangleObservation;

	readonly bottomLeft: CGPoint;

	readonly bottomRight: CGPoint;

	readonly topLeft: CGPoint;

	readonly topRight: CGPoint;
}

/**
 * @since 11.0
 */
declare class VNRequest extends NSObject implements NSCopying {

	static alloc(): VNRequest; // inherited from NSObject

	static new(): VNRequest; // inherited from NSObject

	readonly completionHandler: (p1: VNRequest, p2: NSError) => void;

	preferBackgroundProcessing: boolean;

	readonly results: NSArray<VNObservation>;

	/**
	 * @since 12.0
	 */
	revision: number;

	/**
	 * @since 11.0
	 * @deprecated 17.0
	 */
	usesCPUOnly: boolean;

	/**
	 * @since 12.0
	 */
	static readonly currentRevision: number;

	/**
	 * @since 12.0
	 */
	static readonly defaultRevision: number;

	/**
	 * @since 12.0
	 */
	static readonly supportedRevisions: NSIndexSet;

	constructor(o: { completionHandler: (p1: VNRequest, p2: NSError) => void; });

	/**
	 * @since 13.0
	 */
	cancel(): void;

	computeDeviceForComputeStage(computeStage: string): MLComputeDeviceProtocol;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithCompletionHandler(completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	setComputeDeviceForComputeStage(computeDevice: MLComputeDeviceProtocol, computeStage: string): void;

	supportedComputeStageDevicesAndReturnError(): NSDictionary<string, NSArray<MLComputeDeviceProtocol>>;
}

declare const enum VNRequestFaceLandmarksConstellation {

	ConstellationNotDefined = 0,

	Constellation65Points = 1,

	Constellation76Points = 2
}

/**
 * @since 13.0
 */
interface VNRequestProgressProviding extends NSObjectProtocol {

	indeterminate: boolean;

	progressHandler: (p1: VNRequest, p2: number, p3: NSError) => void;
}
declare var VNRequestProgressProviding: {

	prototype: VNRequestProgressProviding;
};

/**
 * @since 12.0
 */
interface VNRequestRevisionProviding {

	requestRevision: number;
}
declare var VNRequestRevisionProviding: {

	prototype: VNRequestRevisionProviding;
};

/**
 * @since 12.0
 */
declare var VNRequestRevisionUnspecified: number;

declare const enum VNRequestTextRecognitionLevel {

	Accurate = 0,

	Fast = 1
}

declare const enum VNRequestTrackingLevel {

	Accurate = 0,

	Fast = 1
}

/**
 * @since 13.0
 */
declare class VNSaliencyImageObservation extends VNPixelBufferObservation {

	static alloc(): VNSaliencyImageObservation; // inherited from NSObject

	static new(): VNSaliencyImageObservation; // inherited from NSObject

	readonly salientObjects: NSArray<VNRectangleObservation>;
}

/**
 * @since 11.0
 */
declare class VNSequenceRequestHandler extends NSObject {

	static alloc(): VNSequenceRequestHandler; // inherited from NSObject

	static new(): VNSequenceRequestHandler; // inherited from NSObject

	performRequestsOnCGImageError(requests: NSArray<VNRequest> | VNRequest[], image: any): boolean;

	performRequestsOnCGImageOrientationError(requests: NSArray<VNRequest> | VNRequest[], image: any, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnCIImageError(requests: NSArray<VNRequest> | VNRequest[], image: CIImage): boolean;

	performRequestsOnCIImageOrientationError(requests: NSArray<VNRequest> | VNRequest[], image: CIImage, orientation: CGImagePropertyOrientation): boolean;

	/**
	 * @since 14.0
	 */
	performRequestsOnCMSampleBufferError(requests: NSArray<VNRequest> | VNRequest[], sampleBuffer: any): boolean;

	/**
	 * @since 14.0
	 */
	performRequestsOnCMSampleBufferOrientationError(requests: NSArray<VNRequest> | VNRequest[], sampleBuffer: any, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnCVPixelBufferError(requests: NSArray<VNRequest> | VNRequest[], pixelBuffer: any): boolean;

	performRequestsOnCVPixelBufferOrientationError(requests: NSArray<VNRequest> | VNRequest[], pixelBuffer: any, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnImageDataError(requests: NSArray<VNRequest> | VNRequest[], imageData: NSData): boolean;

	performRequestsOnImageDataOrientationError(requests: NSArray<VNRequest> | VNRequest[], imageData: NSData, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnImageURLError(requests: NSArray<VNRequest> | VNRequest[], imageURL: NSURL): boolean;

	performRequestsOnImageURLOrientationError(requests: NSArray<VNRequest> | VNRequest[], imageURL: NSURL, orientation: CGImagePropertyOrientation): boolean;
}

/**
 * @since 14.0
 */
declare class VNStatefulRequest extends VNImageBasedRequest {

	static alloc(): VNStatefulRequest; // inherited from NSObject

	static new(): VNStatefulRequest; // inherited from NSObject

	readonly frameAnalysisSpacing: CMTime;

	readonly minimumLatencyFrameCount: number;

	constructor(o: { frameAnalysisSpacing: CMTime; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithFrameAnalysisSpacingCompletionHandler(frameAnalysisSpacing: CMTime, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

/**
 * @since 11.0
 */
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

	/**
	 * @since 14.0
	 */
	constructor(o: { targetedCMSampleBuffer: any; options: NSDictionary<string, any>; });

	/**
	 * @since 14.0
	 */
	constructor(o: { targetedCMSampleBuffer: any; options: NSDictionary<string, any>; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	/**
	 * @since 14.0
	 */
	constructor(o: { targetedCMSampleBuffer: any; orientation: CGImagePropertyOrientation; options: NSDictionary<string, any>; });

	/**
	 * @since 14.0
	 */
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

	/**
	 * @since 14.0
	 */
	initWithTargetedCMSampleBufferOptions(sampleBuffer: any, options: NSDictionary<string, any>): this;

	/**
	 * @since 14.0
	 */
	initWithTargetedCMSampleBufferOptionsCompletionHandler(sampleBuffer: any, options: NSDictionary<string, any>, completionHandler: (p1: VNRequest, p2: NSError) => void): this;

	/**
	 * @since 14.0
	 */
	initWithTargetedCMSampleBufferOrientationOptions(sampleBuffer: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	/**
	 * @since 14.0
	 */
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

/**
 * @since 11.0
 */
declare class VNTextObservation extends VNRectangleObservation {

	static alloc(): VNTextObservation; // inherited from NSObject

	static new(): VNTextObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNTextObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 12.0
	 */
	static observationWithRequestRevisionBoundingBox(requestRevision: number, boundingBox: CGRect): VNTextObservation; // inherited from VNDetectedObjectObservation

	/**
	 * @since 13.0
	 * @deprecated 17.0
	 */
	static rectangleObservationWithRequestRevisionTopLeftBottomLeftBottomRightTopRight(requestRevision: number, topLeft: CGPoint, bottomLeft: CGPoint, bottomRight: CGPoint, topRight: CGPoint): VNTextObservation; // inherited from VNRectangleObservation

	/**
	 * @since 17.0
	 */
	static rectangleObservationWithRequestRevisionTopLeftTopRightBottomRightBottomLeft(requestRevision: number, topLeft: CGPoint, topRight: CGPoint, bottomRight: CGPoint, bottomLeft: CGPoint): VNTextObservation; // inherited from VNRectangleObservation

	readonly characterBoxes: NSArray<VNRectangleObservation>;
}

/**
 * @since 17.0
 */
declare class VNTrackHomographicImageRegistrationRequest extends VNStatefulRequest {

	static alloc(): VNTrackHomographicImageRegistrationRequest; // inherited from NSObject

	static new(): VNTrackHomographicImageRegistrationRequest; // inherited from NSObject
}

/**
 * @since 17.0
 */
declare var VNTrackHomographicImageRegistrationRequestRevision1: number;

/**
 * @since 11.0
 */
declare class VNTrackObjectRequest extends VNTrackingRequest {

	static alloc(): VNTrackObjectRequest; // inherited from NSObject

	static new(): VNTrackObjectRequest; // inherited from NSObject

	constructor(o: { detectedObjectObservation: VNDetectedObjectObservation; });

	constructor(o: { detectedObjectObservation: VNDetectedObjectObservation; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithDetectedObjectObservation(observation: VNDetectedObjectObservation): this;

	initWithDetectedObjectObservationCompletionHandler(observation: VNDetectedObjectObservation, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

/**
 * @since 12.0
 */
declare var VNTrackObjectRequestRevision1: number;

/**
 * @since 13.0
 */
declare var VNTrackObjectRequestRevision2: number;

/**
 * @since 17.0
 */
declare class VNTrackOpticalFlowRequest extends VNStatefulRequest {

	static alloc(): VNTrackOpticalFlowRequest; // inherited from NSObject

	static new(): VNTrackOpticalFlowRequest; // inherited from NSObject

	computationAccuracy: VNTrackOpticalFlowRequestComputationAccuracy;

	keepNetworkOutput: boolean;

	outputPixelFormat: number;
}

declare const enum VNTrackOpticalFlowRequestComputationAccuracy {

	Low = 0,

	Medium = 1,

	High = 2,

	VeryHigh = 3
}

/**
 * @since 17.0
 */
declare var VNTrackOpticalFlowRequestRevision1: number;

/**
 * @since 11.0
 */
declare class VNTrackRectangleRequest extends VNTrackingRequest {

	static alloc(): VNTrackRectangleRequest; // inherited from NSObject

	static new(): VNTrackRectangleRequest; // inherited from NSObject

	constructor(o: { rectangleObservation: VNRectangleObservation; });

	constructor(o: { rectangleObservation: VNRectangleObservation; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithRectangleObservation(observation: VNRectangleObservation): this;

	initWithRectangleObservationCompletionHandler(observation: VNRectangleObservation, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

/**
 * @since 12.0
 */
declare var VNTrackRectangleRequestRevision1: number;

/**
 * @since 17.0
 */
declare class VNTrackTranslationalImageRegistrationRequest extends VNStatefulRequest {

	static alloc(): VNTrackTranslationalImageRegistrationRequest; // inherited from NSObject

	static new(): VNTrackTranslationalImageRegistrationRequest; // inherited from NSObject
}

/**
 * @since 17.0
 */
declare var VNTrackTranslationalImageRegistrationRequestRevision1: number;

/**
 * @since 11.0
 */
declare class VNTrackingRequest extends VNImageBasedRequest {

	static alloc(): VNTrackingRequest; // inherited from NSObject

	static new(): VNTrackingRequest; // inherited from NSObject

	inputObservation: VNDetectedObjectObservation;

	lastFrame: boolean;

	trackingLevel: VNRequestTrackingLevel;

	/**
	 * @since 17.0
	 */
	supportedNumberOfTrackersAndReturnError(): number;
}

/**
 * @since 14.0
 */
declare class VNTrajectoryObservation extends VNObservation {

	static alloc(): VNTrajectoryObservation; // inherited from NSObject

	static new(): VNTrajectoryObservation; // inherited from NSObject

	readonly detectedPoints: NSArray<VNPoint>;

	readonly equationCoefficients: interop.Reference<number>;

	/**
	 * @since 15.0
	 */
	readonly movingAverageRadius: number;

	readonly projectedPoints: NSArray<VNPoint>;
}

/**
 * @since 11.0
 */
declare class VNTranslationalImageRegistrationRequest extends VNImageRegistrationRequest {

	static alloc(): VNTranslationalImageRegistrationRequest; // inherited from NSObject

	static new(): VNTranslationalImageRegistrationRequest; // inherited from NSObject
}

/**
 * @since 12.0
 */
declare var VNTranslationalImageRegistrationRequestRevision1: number;

/**
 * @since 14.0
 */
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

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNVideoProcessingOptionFrameCadence: string;

/**
 * @since 14.0
 * @deprecated 14.0
 */
declare var VNVideoProcessingOptionTimeInterval: string;

/**
 * @since 14.0
 */
declare class VNVideoProcessor extends NSObject {

	static alloc(): VNVideoProcessor; // inherited from NSObject

	static new(): VNVideoProcessor; // inherited from NSObject

	constructor(o: { URL: NSURL; });

	addRequestProcessingOptionsError(request: VNRequest, processingOptions: VNVideoProcessorRequestProcessingOptions): boolean;

	/**
	 * @since 14.0
	 * @deprecated 14.0
	 */
	addRequestWithProcessingOptionsError(request: VNRequest, processingOptions: NSDictionary<string, any>): boolean;

	analyzeTimeRangeError(timeRange: CMTimeRange): boolean;

	/**
	 * @since 14.0
	 * @deprecated 14.0
	 */
	analyzeWithTimeRangeError(timeRange: CMTimeRange): boolean;

	cancel(): void;

	initWithURL(videoURL: NSURL): this;

	removeRequestError(request: VNRequest): boolean;
}

/**
 * @since 14.0
 */
declare class VNVideoProcessorCadence extends NSObject implements NSCopying {

	static alloc(): VNVideoProcessorCadence; // inherited from NSObject

	static new(): VNVideoProcessorCadence; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class VNVideoProcessorFrameRateCadence extends VNVideoProcessorCadence {

	static alloc(): VNVideoProcessorFrameRateCadence; // inherited from NSObject

	static new(): VNVideoProcessorFrameRateCadence; // inherited from NSObject

	readonly frameRate: number;

	constructor(o: { frameRate: number; });

	initWithFrameRate(frameRate: number): this;
}

/**
 * @since 14.0
 */
declare class VNVideoProcessorRequestProcessingOptions extends NSObject implements NSCopying {

	static alloc(): VNVideoProcessorRequestProcessingOptions; // inherited from NSObject

	static new(): VNVideoProcessorRequestProcessingOptions; // inherited from NSObject

	cadence: VNVideoProcessorCadence;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class VNVideoProcessorTimeIntervalCadence extends VNVideoProcessorCadence {

	static alloc(): VNVideoProcessorTimeIntervalCadence; // inherited from NSObject

	static new(): VNVideoProcessorTimeIntervalCadence; // inherited from NSObject

	readonly timeInterval: number;

	constructor(o: { timeInterval: number; });

	initWithTimeInterval(timeInterval: number): this;
}

/**
 * @since 11.0
 */
declare var VNVisionVersionNumber: number;
