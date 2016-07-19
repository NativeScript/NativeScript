
declare class CIColor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIColor; // inherited from NSObject

	static colorWithCGColor(c: any): CIColor;

	static colorWithRedGreenBlue(r: number, g: number, b: number): CIColor;

	static colorWithRedGreenBlueAlpha(r: number, g: number, b: number, a: number): CIColor;

	static colorWithString(representation: string): CIColor;

	static new(): CIColor; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ alpha: number;

	/* readonly */ blue: number;

	/* readonly */ colorSpace: any;

	/* readonly */ components: interop.Reference<number>;

	/* readonly */ green: number;

	/* readonly */ numberOfComponents: number;

	/* readonly */ red: number;

	/* readonly */ stringRepresentation: string;

	constructor(); // inherited from NSObject

	constructor(o: { CGColor: any; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { color: UIColor; });

	constructor(o: { red: number; green: number; blue: number; });

	constructor(o: { red: number; green: number; blue: number; alpha: number; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CIColor; // inherited from NSObjectProtocol
}

declare class CIColorKernel extends CIKernel {

	static kernelWithString(string: string): CIColorKernel; // inherited from CIKernel

	applyWithExtentArguments(extent: CGRect, args: NSArray<any>): CIImage;
}

declare class CIContext extends NSObject {

	static alloc(): CIContext; // inherited from NSObject

	static contextWithCGContextOptions(cgctx: any, options: NSDictionary<string, any>): CIContext;

	static contextWithEAGLContext(eaglContext: EAGLContext): CIContext;

	static contextWithEAGLContextOptions(eaglContext: EAGLContext, options: NSDictionary<string, any>): CIContext;

	static contextWithMTLDevice(device: MTLDevice): CIContext;

	static contextWithMTLDeviceOptions(device: MTLDevice, options: NSDictionary<string, any>): CIContext;

	static contextWithOptions(options: NSDictionary<string, any>): CIContext;

	static new(): CIContext; // inherited from NSObject

	/* readonly */ workingColorSpace: any;

	constructor(); // inherited from NSObject

	createCGImageFromRect(image: CIImage, fromRect: CGRect): any;

	createCGImageFromRectFormatColorSpace(image: CIImage, fromRect: CGRect, format: number, colorSpace: any): any;

	drawImageAtPointFromRect(image: CIImage, atPoint: CGPoint, fromRect: CGRect): void;

	drawImageInRectFromRect(image: CIImage, inRect: CGRect, fromRect: CGRect): void;

	inputImageMaximumSize(): CGSize;

	outputImageMaximumSize(): CGSize;

	renderToBitmapRowBytesBoundsFormatColorSpace(image: CIImage, data: interop.Pointer, rowBytes: number, bounds: CGRect, format: number, colorSpace: any): void;

	renderToCVPixelBuffer(image: CIImage, buffer: any): void;

	renderToCVPixelBufferBoundsColorSpace(image: CIImage, buffer: any, bounds: CGRect, colorSpace: any): void;

	renderToMTLTextureCommandBufferBoundsColorSpace(image: CIImage, texture: MTLTexture, commandBuffer: MTLCommandBuffer, bounds: CGRect, colorSpace: any): void;

	self(): CIContext; // inherited from NSObjectProtocol
}

declare class CIDetector extends NSObject {

	static alloc(): CIDetector; // inherited from NSObject

	static detectorOfTypeContextOptions(type: string, context: CIContext, options: NSDictionary<string, any>): CIDetector;

	static new(): CIDetector; // inherited from NSObject

	constructor(); // inherited from NSObject

	featuresInImage(image: CIImage): NSArray<CIFeature>;

	featuresInImageOptions(image: CIImage, options: NSDictionary<string, any>): NSArray<CIFeature>;

	self(): CIDetector; // inherited from NSObjectProtocol
}

declare var CIDetectorAccuracy: string;

declare var CIDetectorAccuracyHigh: string;

declare var CIDetectorAccuracyLow: string;

declare var CIDetectorAspectRatio: string;

declare var CIDetectorEyeBlink: string;

declare var CIDetectorFocalLength: string;

declare var CIDetectorImageOrientation: string;

declare var CIDetectorMinFeatureSize: string;

declare var CIDetectorNumberOfAngles: string;

declare var CIDetectorReturnSubFeatures: string;

declare var CIDetectorSmile: string;

declare var CIDetectorTracking: string;

declare var CIDetectorTypeFace: string;

declare var CIDetectorTypeQRCode: string;

declare var CIDetectorTypeRectangle: string;

declare var CIDetectorTypeText: string;

declare class CIFaceFeature extends CIFeature {

	/* readonly */ faceAngle: number;

	/* readonly */ hasFaceAngle: boolean;

	/* readonly */ hasLeftEyePosition: boolean;

	/* readonly */ hasMouthPosition: boolean;

	/* readonly */ hasRightEyePosition: boolean;

	/* readonly */ hasSmile: boolean;

	/* readonly */ hasTrackingFrameCount: boolean;

	/* readonly */ hasTrackingID: boolean;

	/* readonly */ leftEyeClosed: boolean;

	/* readonly */ leftEyePosition: CGPoint;

	/* readonly */ mouthPosition: CGPoint;

	/* readonly */ rightEyeClosed: boolean;

	/* readonly */ rightEyePosition: CGPoint;

	/* readonly */ trackingFrameCount: number;

	/* readonly */ trackingID: number;
}

declare class CIFeature extends NSObject {

	static alloc(): CIFeature; // inherited from NSObject

	static new(): CIFeature; // inherited from NSObject

	/* readonly */ bounds: CGRect;

	/* readonly */ type: string;

	constructor(); // inherited from NSObject

	self(): CIFeature; // inherited from NSObjectProtocol
}

declare var CIFeatureTypeFace: string;

declare var CIFeatureTypeQRCode: string;

declare var CIFeatureTypeRectangle: string;

declare var CIFeatureTypeText: string;

declare class CIFilter extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIFilter; // inherited from NSObject

	static filterArrayFromSerializedXMPInputImageExtentError(xmpData: NSData, extent: CGRect): NSArray<CIFilter>;

	static filterNamesInCategories(categories: NSArray<string>): NSArray<string>;

	static filterNamesInCategory(category: string): NSArray<string>;

	static filterWithName(name: string): CIFilter;

	static filterWithNameKeysAndValues(name: string, key0: any): CIFilter;

	static filterWithNameWithInputParameters(name: string, params: NSDictionary<string, any>): CIFilter;

	static localizedDescriptionForFilterName(filterName: string): string;

	static localizedNameForCategory(category: string): string;

	static localizedNameForFilterName(filterName: string): string;

	static localizedReferenceDocumentationForFilterName(filterName: string): NSURL;

	static new(): CIFilter; // inherited from NSObject

	static registerFilterNameConstructorClassAttributes(name: string, anObject: CIFilterConstructor, attributes: NSDictionary<string, any>): void;

	static serializedXMPFromFiltersInputImageExtent(filters: NSArray<CIFilter>, extent: CGRect): NSData;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ attributes: NSDictionary<string, any>;

	/* readonly */ inputKeys: NSArray<string>;

	/* readonly */ name: string;

	/* readonly */ outputImage: CIImage;

	/* readonly */ outputKeys: NSArray<string>;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CIFilter; // inherited from NSObjectProtocol

	setDefaults(): void;
}

interface CIFilterConstructor {

	filterWithName(name: string): CIFilter;
}
declare var CIFilterConstructor: {

	prototype: CIFilterConstructor;
};

declare class CIFilterShape extends NSObject implements NSCopying {

	static alloc(): CIFilterShape; // inherited from NSObject

	static new(): CIFilterShape; // inherited from NSObject

	static shapeWithRect(r: CGRect): CIFilterShape;

	/* readonly */ extent: CGRect;

	constructor(); // inherited from NSObject

	constructor(o: { rect: CGRect; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	insetByXY(dx: number, dy: number): CIFilterShape;

	intersectWith(s2: CIFilterShape): CIFilterShape;

	intersectWithRect(r: CGRect): CIFilterShape;

	self(): CIFilterShape; // inherited from NSObjectProtocol

	transformByInterior(m: CGAffineTransform, flag: boolean): CIFilterShape;

	unionWith(s2: CIFilterShape): CIFilterShape;

	unionWithRect(r: CGRect): CIFilterShape;
}

declare class CIImage extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIImage; // inherited from NSObject

	static emptyImage(): CIImage;

	static imageWithBitmapDataBytesPerRowSizeFormatColorSpace(data: NSData, bytesPerRow: number, size: CGSize, format: number, colorSpace: any): CIImage;

	static imageWithCGImage(image: any): CIImage;

	static imageWithCGImageOptions(image: any, options: NSDictionary<string, any>): CIImage;

	static imageWithCVImageBuffer(imageBuffer: any): CIImage;

	static imageWithCVImageBufferOptions(imageBuffer: any, options: NSDictionary<string, any>): CIImage;

	static imageWithCVPixelBuffer(pixelBuffer: any): CIImage;

	static imageWithCVPixelBufferOptions(pixelBuffer: any, options: NSDictionary<string, any>): CIImage;

	static imageWithColor(color: CIColor): CIImage;

	static imageWithContentsOfURL(url: NSURL): CIImage;

	static imageWithContentsOfURLOptions(url: NSURL, options: NSDictionary<string, any>): CIImage;

	static imageWithData(data: NSData): CIImage;

	static imageWithDataOptions(data: NSData, options: NSDictionary<string, any>): CIImage;

	static imageWithImageProviderSizeFormatColorSpaceOptions(p: any, width: number, height: number, f: number, cs: any, options: NSDictionary<string, any>): CIImage;

	static imageWithMTLTextureOptions(texture: MTLTexture, options: NSDictionary<string, any>): CIImage;

	static imageWithTextureSizeFlippedColorSpace(name: number, size: CGSize, flipped: boolean, colorSpace: any): CIImage;

	static new(): CIImage; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ colorSpace: any;

	/* readonly */ extent: CGRect;

	/* readonly */ properties: NSDictionary<string, any>;

	/* readonly */ url: NSURL;

	constructor(); // inherited from NSObject

	constructor(o: { bitmapData: NSData; bytesPerRow: number; size: CGSize; format: number; colorSpace: any; });

	constructor(o: { CGImage: any; });

	constructor(o: { CGImage: any; options: NSDictionary<string, any>; });

	constructor(o: { CVImageBuffer: any; });

	constructor(o: { CVImageBuffer: any; options: NSDictionary<string, any>; });

	constructor(o: { CVPixelBuffer: any; });

	constructor(o: { CVPixelBuffer: any; options: NSDictionary<string, any>; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { color: CIColor; });

	constructor(o: { contentsOfURL: NSURL; });

	constructor(o: { contentsOfURL: NSURL; options: NSDictionary<string, any>; });

	constructor(o: { data: NSData; });

	constructor(o: { data: NSData; options: NSDictionary<string, any>; });

	constructor(o: { image: UIImage; });

	constructor(o: { image: UIImage; options: NSDictionary<any, any>; });

	constructor(o: { imageProvider: any; size: number; format: number; colorSpace: number; options: any; });

	constructor(o: { MTLTexture: MTLTexture; options: NSDictionary<string, any>; });

	constructor(o: { texture: number; size: CGSize; flipped: boolean; colorSpace: any; });

	autoAdjustmentFiltersWithOptions(options: NSDictionary<string, any>): NSArray<CIFilter>;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	imageByApplyingFilterWithInputParameters(filterName: string, params: NSDictionary<string, any>): CIImage;

	imageByApplyingOrientation(orientation: number): CIImage;

	imageByApplyingTransform(matrix: CGAffineTransform): CIImage;

	imageByClampingToExtent(): CIImage;

	imageByCompositingOverImage(dest: CIImage): CIImage;

	imageByCroppingToRect(rect: CGRect): CIImage;

	imageTransformForOrientation(orientation: number): CGAffineTransform;

	regionOfInterestForImageInRect(image: CIImage, rect: CGRect): CGRect;

	self(): CIImage; // inherited from NSObjectProtocol
}

declare class CIImageAccumulator extends NSObject {

	static alloc(): CIImageAccumulator; // inherited from NSObject

	static imageAccumulatorWithExtentFormat(extent: CGRect, format: number): CIImageAccumulator;

	static imageAccumulatorWithExtentFormatColorSpace(extent: CGRect, format: number, colorSpace: any): CIImageAccumulator;

	static new(): CIImageAccumulator; // inherited from NSObject

	/* readonly */ extent: CGRect;

	/* readonly */ format: number;

	constructor(); // inherited from NSObject

	constructor(o: { extent: CGRect; format: number; });

	constructor(o: { extent: CGRect; format: number; colorSpace: any; });

	clear(): void;

	image(): CIImage;

	self(): CIImageAccumulator; // inherited from NSObjectProtocol

	setImage(image: CIImage): void;

	setImageDirtyRect(image: CIImage, dirtyRect: CGRect): void;
}

declare class CIKernel extends NSObject {

	static alloc(): CIKernel; // inherited from NSObject

	static kernelWithString(string: string): CIKernel;

	static kernelsWithString(string: string): NSArray<CIKernel>;

	static new(): CIKernel; // inherited from NSObject

	/* readonly */ name: string;

	constructor(); // inherited from NSObject

	applyWithExtentRoiCallbackArguments(extent: CGRect, callback: (p1: number, p2: CGRect) => CGRect, args: NSArray<any>): CIImage;

	self(): CIKernel; // inherited from NSObjectProtocol

	setROISelector(method: string): void;
}

declare class CIQRCodeFeature extends CIFeature {

	/* readonly */ bottomLeft: CGPoint;

	/* readonly */ bottomRight: CGPoint;

	/* readonly */ messageString: string;

	/* readonly */ topLeft: CGPoint;

	/* readonly */ topRight: CGPoint;
}

declare class CIRectangleFeature extends CIFeature {

	/* readonly */ bottomLeft: CGPoint;

	/* readonly */ bottomRight: CGPoint;

	/* readonly */ topLeft: CGPoint;

	/* readonly */ topRight: CGPoint;
}

declare class CISampler extends NSObject implements NSCopying {

	static alloc(): CISampler; // inherited from NSObject

	static new(): CISampler; // inherited from NSObject

	static samplerWithImage(im: CIImage): CISampler;

	static samplerWithImageKeysAndValues(im: CIImage, key0: any): CISampler;

	static samplerWithImageOptions(im: CIImage, dict: NSDictionary<any, any>): CISampler;

	/* readonly */ definition: CIFilterShape;

	/* readonly */ extent: CGRect;

	constructor(); // inherited from NSObject

	constructor(o: { image: CIImage; });

	constructor(o: { image: CIImage; options: NSDictionary<any, any>; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): CISampler; // inherited from NSObjectProtocol
}

declare class CITextFeature extends CIFeature {

	/* readonly */ bottomLeft: CGPoint;

	/* readonly */ bottomRight: CGPoint;

	/* readonly */ subFeatures: NSArray<any>;

	/* readonly */ topLeft: CGPoint;

	/* readonly */ topRight: CGPoint;
}

declare class CIVector extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIVector; // inherited from NSObject

	static new(): CIVector; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	static vectorWithCGAffineTransform(t: CGAffineTransform): CIVector;

	static vectorWithCGPoint(p: CGPoint): CIVector;

	static vectorWithCGRect(r: CGRect): CIVector;

	static vectorWithString(representation: string): CIVector;

	static vectorWithValuesCount(values: interop.Reference<number>, count: number): CIVector;

	static vectorWithX(x: number): CIVector;

	static vectorWithXY(x: number, y: number): CIVector;

	static vectorWithXYZ(x: number, y: number, z: number): CIVector;

	static vectorWithXYZW(x: number, y: number, z: number, w: number): CIVector;

	/* readonly */ CGAffineTransformValue: CGAffineTransform;

	/* readonly */ CGPointValue: CGPoint;

	/* readonly */ CGRectValue: CGRect;

	/* readonly */ W: number;

	/* readonly */ X: number;

	/* readonly */ Y: number;

	/* readonly */ Z: number;

	/* readonly */ count: number;

	/* readonly */ stringRepresentation: string;

	constructor(); // inherited from NSObject

	constructor(o: { CGAffineTransform: CGAffineTransform; });

	constructor(o: { CGPoint: CGPoint; });

	constructor(o: { CGRect: CGRect; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { string: string; });

	constructor(o: { values: interop.Reference<number>; count: number; });

	constructor(o: { x: number; });

	constructor(o: { x: number; y: number; });

	constructor(o: { x: number; y: number; z: number; });

	constructor(o: { x: number; y: number; z: number; w: number; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CIVector; // inherited from NSObjectProtocol

	valueAtIndex(index: number): number;
}

declare class CIWarpKernel extends CIKernel {

	static kernelWithString(string: string): CIWarpKernel; // inherited from CIKernel

	applyWithExtentRoiCallbackInputImageArguments(extent: CGRect, callback: (p1: number, p2: CGRect) => CGRect, image: CIImage, args: NSArray<any>): CIImage;
}

declare var kCIAttributeClass: string;

declare var kCIAttributeDefault: string;

declare var kCIAttributeDescription: string;

declare var kCIAttributeDisplayName: string;

declare var kCIAttributeFilterAvailable_Mac: string;

declare var kCIAttributeFilterAvailable_iOS: string;

declare var kCIAttributeFilterCategories: string;

declare var kCIAttributeFilterDisplayName: string;

declare var kCIAttributeFilterName: string;

declare var kCIAttributeIdentity: string;

declare var kCIAttributeMax: string;

declare var kCIAttributeMin: string;

declare var kCIAttributeName: string;

declare var kCIAttributeReferenceDocumentation: string;

declare var kCIAttributeSliderMax: string;

declare var kCIAttributeSliderMin: string;

declare var kCIAttributeType: string;

declare var kCIAttributeTypeAngle: string;

declare var kCIAttributeTypeBoolean: string;

declare var kCIAttributeTypeColor: string;

declare var kCIAttributeTypeCount: string;

declare var kCIAttributeTypeDistance: string;

declare var kCIAttributeTypeGradient: string;

declare var kCIAttributeTypeImage: string;

declare var kCIAttributeTypeInteger: string;

declare var kCIAttributeTypeOffset: string;

declare var kCIAttributeTypeOpaqueColor: string;

declare var kCIAttributeTypePosition: string;

declare var kCIAttributeTypePosition3: string;

declare var kCIAttributeTypeRectangle: string;

declare var kCIAttributeTypeScalar: string;

declare var kCIAttributeTypeTime: string;

declare var kCIAttributeTypeTransform: string;

declare var kCICategoryBlur: string;

declare var kCICategoryBuiltIn: string;

declare var kCICategoryColorAdjustment: string;

declare var kCICategoryColorEffect: string;

declare var kCICategoryCompositeOperation: string;

declare var kCICategoryDistortionEffect: string;

declare var kCICategoryFilterGenerator: string;

declare var kCICategoryGenerator: string;

declare var kCICategoryGeometryAdjustment: string;

declare var kCICategoryGradient: string;

declare var kCICategoryHalftoneEffect: string;

declare var kCICategoryHighDynamicRange: string;

declare var kCICategoryInterlaced: string;

declare var kCICategoryNonSquarePixels: string;

declare var kCICategoryReduction: string;

declare var kCICategorySharpen: string;

declare var kCICategoryStillImage: string;

declare var kCICategoryStylize: string;

declare var kCICategoryTileEffect: string;

declare var kCICategoryTransition: string;

declare var kCICategoryVideo: string;

declare var kCIContextHighQualityDownsample: string;

declare var kCIContextOutputColorSpace: string;

declare var kCIContextPriorityRequestLow: string;

declare var kCIContextUseSoftwareRenderer: string;

declare var kCIContextWorkingColorSpace: string;

declare var kCIContextWorkingFormat: string;

declare var kCIFormatA16: number;

declare var kCIFormatA8: number;

declare var kCIFormatABGR8: number;

declare var kCIFormatARGB8: number;

declare var kCIFormatAf: number;

declare var kCIFormatAh: number;

declare var kCIFormatBGRA8: number;

declare var kCIFormatR16: number;

declare var kCIFormatR8: number;

declare var kCIFormatRG16: number;

declare var kCIFormatRG8: number;

declare var kCIFormatRGBA8: number;

declare var kCIFormatRGBAf: number;

declare var kCIFormatRGBAh: number;

declare var kCIFormatRGf: number;

declare var kCIFormatRGh: number;

declare var kCIFormatRf: number;

declare var kCIFormatRh: number;

declare var kCIImageAutoAdjustCrop: string;

declare var kCIImageAutoAdjustEnhance: string;

declare var kCIImageAutoAdjustFeatures: string;

declare var kCIImageAutoAdjustLevel: string;

declare var kCIImageAutoAdjustRedEye: string;

declare var kCIImageColorSpace: string;

declare var kCIImageProperties: string;

declare var kCIImageProviderTileSize: string;

declare var kCIImageProviderUserInfo: string;

declare var kCIInputAngleKey: string;

declare var kCIInputAspectRatioKey: string;

declare var kCIInputBackgroundImageKey: string;

declare var kCIInputBiasKey: string;

declare var kCIInputBrightnessKey: string;

declare var kCIInputCenterKey: string;

declare var kCIInputColorKey: string;

declare var kCIInputContrastKey: string;

declare var kCIInputEVKey: string;

declare var kCIInputExtentKey: string;

declare var kCIInputGradientImageKey: string;

declare var kCIInputImageKey: string;

declare var kCIInputIntensityKey: string;

declare var kCIInputMaskImageKey: string;

declare var kCIInputRadiusKey: string;

declare var kCIInputRefractionKey: string;

declare var kCIInputSaturationKey: string;

declare var kCIInputScaleKey: string;

declare var kCIInputShadingImageKey: string;

declare var kCIInputSharpnessKey: string;

declare var kCIInputTargetImageKey: string;

declare var kCIInputTimeKey: string;

declare var kCIInputTransformKey: string;

declare var kCIInputVersionKey: string;

declare var kCIInputWeightsKey: string;

declare var kCIInputWidthKey: string;

declare var kCIOutputImageKey: string;

declare var kCISamplerAffineMatrix: string;

declare var kCISamplerColorSpace: string;

declare var kCISamplerFilterLinear: string;

declare var kCISamplerFilterMode: string;

declare var kCISamplerFilterNearest: string;

declare var kCISamplerWrapBlack: string;

declare var kCISamplerWrapClamp: string;

declare var kCISamplerWrapMode: string;

declare var kCIUIParameterSet: string;

declare var kCIUISetAdvanced: string;

declare var kCIUISetBasic: string;

declare var kCIUISetDevelopment: string;

declare var kCIUISetIntermediate: string;
