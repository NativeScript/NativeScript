
declare class VNBarcodeObservation extends VNRectangleObservation {

	static alloc(): VNBarcodeObservation; // inherited from NSObject

	static new(): VNBarcodeObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNBarcodeObservation; // inherited from VNDetectedObjectObservation

	readonly barcodeDescriptor: CIBarcodeDescriptor;

	readonly payloadStringValue: string;

	readonly symbology: string;
}

declare var VNBarcodeSymbologyAztec: string;

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

declare var VNBarcodeSymbologyI2of5: string;

declare var VNBarcodeSymbologyI2of5Checksum: string;

declare var VNBarcodeSymbologyITF14: string;

declare var VNBarcodeSymbologyPDF417: string;

declare var VNBarcodeSymbologyQR: string;

declare var VNBarcodeSymbologyUPCE: string;

declare class VNClassificationObservation extends VNObservation {

	static alloc(): VNClassificationObservation; // inherited from NSObject

	static new(): VNClassificationObservation; // inherited from NSObject

	readonly identifier: string;
}

declare class VNCoreMLFeatureValueObservation extends VNObservation {

	static alloc(): VNCoreMLFeatureValueObservation; // inherited from NSObject

	static new(): VNCoreMLFeatureValueObservation; // inherited from NSObject

	readonly featureValue: MLFeatureValue;
}

declare class VNCoreMLModel extends NSObject {

	static alloc(): VNCoreMLModel; // inherited from NSObject

	static modelForMLModelError(model: MLModel): VNCoreMLModel;

	static new(): VNCoreMLModel; // inherited from NSObject
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

declare class VNDetectBarcodesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectBarcodesRequest; // inherited from NSObject

	static new(): VNDetectBarcodesRequest; // inherited from NSObject

	symbologies: NSArray<string>;

	static readonly supportedSymbologies: NSArray<string>;
}

declare class VNDetectFaceLandmarksRequest extends VNImageBasedRequest implements VNFaceObservationAccepting {

	static alloc(): VNDetectFaceLandmarksRequest; // inherited from NSObject

	static new(): VNDetectFaceLandmarksRequest; // inherited from NSObject

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

declare class VNDetectFaceRectanglesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectFaceRectanglesRequest; // inherited from NSObject

	static new(): VNDetectFaceRectanglesRequest; // inherited from NSObject
}

declare class VNDetectHorizonRequest extends VNImageBasedRequest {

	static alloc(): VNDetectHorizonRequest; // inherited from NSObject

	static new(): VNDetectHorizonRequest; // inherited from NSObject
}

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

declare class VNDetectTextRectanglesRequest extends VNImageBasedRequest {

	static alloc(): VNDetectTextRectanglesRequest; // inherited from NSObject

	static new(): VNDetectTextRectanglesRequest; // inherited from NSObject

	reportCharacterBoxes: boolean;
}

declare class VNDetectedObjectObservation extends VNObservation {

	static alloc(): VNDetectedObjectObservation; // inherited from NSObject

	static new(): VNDetectedObjectObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNDetectedObjectObservation;

	readonly boundingBox: CGRect;
}

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

	InvalidModel = 15
}

declare var VNErrorDomain: string;

declare class VNFaceLandmarkRegion extends NSObject {

	static alloc(): VNFaceLandmarkRegion; // inherited from NSObject

	static new(): VNFaceLandmarkRegion; // inherited from NSObject

	readonly pointCount: number;
}

declare class VNFaceLandmarkRegion2D extends VNFaceLandmarkRegion {

	static alloc(): VNFaceLandmarkRegion2D; // inherited from NSObject

	static new(): VNFaceLandmarkRegion2D; // inherited from NSObject

	readonly normalizedPoints: interop.Pointer | interop.Reference<CGPoint>;

	pointsInImageOfSize(imageSize: CGSize): interop.Pointer | interop.Reference<CGPoint>;
}

declare class VNFaceLandmarks extends NSObject {

	static alloc(): VNFaceLandmarks; // inherited from NSObject

	static new(): VNFaceLandmarks; // inherited from NSObject

	readonly confidence: number;
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

	static new(): VNFaceObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNFaceObservation; // inherited from VNDetectedObjectObservation

	readonly landmarks: VNFaceLandmarks2D;
}

interface VNFaceObservationAccepting extends NSObjectProtocol {

	inputFaceObservations: NSArray<VNFaceObservation>;
}
declare var VNFaceObservationAccepting: {

	prototype: VNFaceObservationAccepting;
};

declare class VNHomographicImageRegistrationRequest extends VNImageRegistrationRequest {

	static alloc(): VNHomographicImageRegistrationRequest; // inherited from NSObject

	static new(): VNHomographicImageRegistrationRequest; // inherited from NSObject
}

declare class VNHorizonObservation extends VNObservation {

	static alloc(): VNHorizonObservation; // inherited from NSObject

	static new(): VNHorizonObservation; // inherited from NSObject

	readonly angle: number;

	readonly transform: CGAffineTransform;
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
}

declare var VNImageOptionCIContext: string;

declare var VNImageOptionCameraIntrinsics: string;

declare var VNImageOptionProperties: string;

declare function VNImagePointForNormalizedPoint(normalizedPoint: CGPoint, imageWidth: number, imageHeight: number): CGPoint;

declare function VNImageRectForNormalizedRect(normalizedRect: CGRect, imageWidth: number, imageHeight: number): CGRect;

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

	initWithCVPixelBufferOptions(pixelBuffer: any, options: NSDictionary<string, any>): this;

	initWithCVPixelBufferOrientationOptions(pixelBuffer: any, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithDataOptions(imageData: NSData, options: NSDictionary<string, any>): this;

	initWithDataOrientationOptions(imageData: NSData, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	initWithURLOptions(imageURL: NSURL, options: NSDictionary<string, any>): this;

	initWithURLOrientationOptions(imageURL: NSURL, orientation: CGImagePropertyOrientation, options: NSDictionary<string, any>): this;

	performRequestsError(requests: NSArray<VNRequest>): boolean;
}

declare class VNImageTranslationAlignmentObservation extends VNImageAlignmentObservation {

	static alloc(): VNImageTranslationAlignmentObservation; // inherited from NSObject

	static new(): VNImageTranslationAlignmentObservation; // inherited from NSObject

	alignmentTransform: CGAffineTransform;
}

declare var VNNormalizedIdentityRect: CGRect;

declare function VNNormalizedRectForImageRect(imageRect: CGRect, imageWidth: number, imageHeight: number): CGRect;

declare function VNNormalizedRectIsIdentityRect(normalizedRect: CGRect): boolean;

declare class VNObservation extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): VNObservation; // inherited from NSObject

	static new(): VNObservation; // inherited from NSObject

	readonly confidence: number;

	readonly uuid: NSUUID;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class VNPixelBufferObservation extends VNObservation {

	static alloc(): VNPixelBufferObservation; // inherited from NSObject

	static new(): VNPixelBufferObservation; // inherited from NSObject

	readonly pixelBuffer: any;
}

declare class VNRectangleObservation extends VNDetectedObjectObservation {

	static alloc(): VNRectangleObservation; // inherited from NSObject

	static new(): VNRectangleObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNRectangleObservation; // inherited from VNDetectedObjectObservation

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

	readonly results: NSArray<any>;

	usesCPUOnly: boolean;

	constructor(o: { completionHandler: (p1: VNRequest, p2: NSError) => void; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithCompletionHandler(completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

declare const enum VNRequestTrackingLevel {

	Accurate = 0,

	Fast = 1
}

declare class VNSequenceRequestHandler extends NSObject {

	static alloc(): VNSequenceRequestHandler; // inherited from NSObject

	static new(): VNSequenceRequestHandler; // inherited from NSObject

	performRequestsOnCGImageError(requests: NSArray<VNRequest>, image: any): boolean;

	performRequestsOnCGImageOrientationError(requests: NSArray<VNRequest>, image: any, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnCIImageError(requests: NSArray<VNRequest>, image: CIImage): boolean;

	performRequestsOnCIImageOrientationError(requests: NSArray<VNRequest>, image: CIImage, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnCVPixelBufferError(requests: NSArray<VNRequest>, pixelBuffer: any): boolean;

	performRequestsOnCVPixelBufferOrientationError(requests: NSArray<VNRequest>, pixelBuffer: any, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnImageDataError(requests: NSArray<VNRequest>, imageData: NSData): boolean;

	performRequestsOnImageDataOrientationError(requests: NSArray<VNRequest>, imageData: NSData, orientation: CGImagePropertyOrientation): boolean;

	performRequestsOnImageURLError(requests: NSArray<VNRequest>, imageURL: NSURL): boolean;

	performRequestsOnImageURLOrientationError(requests: NSArray<VNRequest>, imageURL: NSURL, orientation: CGImagePropertyOrientation): boolean;
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

declare class VNTextObservation extends VNDetectedObjectObservation {

	static alloc(): VNTextObservation; // inherited from NSObject

	static new(): VNTextObservation; // inherited from NSObject

	static observationWithBoundingBox(boundingBox: CGRect): VNTextObservation; // inherited from VNDetectedObjectObservation

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

declare class VNTrackRectangleRequest extends VNTrackingRequest {

	static alloc(): VNTrackRectangleRequest; // inherited from NSObject

	static new(): VNTrackRectangleRequest; // inherited from NSObject

	constructor(o: { rectangleObservation: VNRectangleObservation; });

	constructor(o: { rectangleObservation: VNRectangleObservation; completionHandler: (p1: VNRequest, p2: NSError) => void; });

	initWithRectangleObservation(observation: VNRectangleObservation): this;

	initWithRectangleObservationCompletionHandler(observation: VNRectangleObservation, completionHandler: (p1: VNRequest, p2: NSError) => void): this;
}

declare class VNTrackingRequest extends VNImageBasedRequest {

	static alloc(): VNTrackingRequest; // inherited from NSObject

	static new(): VNTrackingRequest; // inherited from NSObject

	inputObservation: VNDetectedObjectObservation;

	lastFrame: boolean;

	trackingLevel: VNRequestTrackingLevel;
}

declare class VNTranslationalImageRegistrationRequest extends VNImageRegistrationRequest {

	static alloc(): VNTranslationalImageRegistrationRequest; // inherited from NSObject

	static new(): VNTranslationalImageRegistrationRequest; // inherited from NSObject
}

declare var VNVisionVersionNumber: number;
