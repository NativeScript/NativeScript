
interface CIAccordionFoldTransition extends CITransitionFilter {

	bottomHeight: number;

	foldShadowAmount: number;

	numberOfFolds: number;
}
declare var CIAccordionFoldTransition: {

	prototype: CIAccordionFoldTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAffineClamp extends CIFilterProtocol {

	inputImage: CIImage;

	transform: CGAffineTransform;
}
declare var CIAffineClamp: {

	prototype: CIAffineClamp;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAffineTile extends CIFilterProtocol {

	inputImage: CIImage;

	transform: CGAffineTransform;
}
declare var CIAffineTile: {

	prototype: CIAffineTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAttributedTextImageGenerator extends CIFilterProtocol {

	scaleFactor: number;

	text: NSAttributedString;
}
declare var CIAttributedTextImageGenerator: {

	prototype: CIAttributedTextImageGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIAztecCodeDescriptor extends CIBarcodeDescriptor {

	static alloc(): CIAztecCodeDescriptor; // inherited from NSObject

	static descriptorWithPayloadIsCompactLayerCountDataCodewordCount(errorCorrectedPayload: NSData, isCompact: boolean, layerCount: number, dataCodewordCount: number): CIAztecCodeDescriptor;

	static new(): CIAztecCodeDescriptor; // inherited from NSObject

	readonly dataCodewordCount: number;

	readonly errorCorrectedPayload: NSData;

	readonly isCompact: boolean;

	readonly layerCount: number;

	constructor(o: { payload: NSData; isCompact: boolean; layerCount: number; dataCodewordCount: number; });

	initWithPayloadIsCompactLayerCountDataCodewordCount(errorCorrectedPayload: NSData, isCompact: boolean, layerCount: number, dataCodewordCount: number): this;
}

interface CIAztecCodeGenerator extends CIFilterProtocol {

	compactStyle: number;

	correctionLevel: number;

	layers: number;

	message: NSData;
}
declare var CIAztecCodeGenerator: {

	prototype: CIAztecCodeGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIBarcodeDescriptor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIBarcodeDescriptor; // inherited from NSObject

	static new(): CIBarcodeDescriptor; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

interface CIBarcodeGenerator extends CIFilterProtocol {

	barcodeDescriptor: CIBarcodeDescriptor;
}
declare var CIBarcodeGenerator: {

	prototype: CIBarcodeGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIBarsSwipeTransition extends CITransitionFilter {

	angle: number;

	barOffset: number;

	width: number;
}
declare var CIBarsSwipeTransition: {

	prototype: CIBarsSwipeTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIBicubicScaleTransform extends CIFilterProtocol {

	aspectRatio: number;

	inputImage: CIImage;

	parameterB: number;

	parameterC: number;

	scale: number;
}
declare var CIBicubicScaleTransform: {

	prototype: CIBicubicScaleTransform;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIBlendKernel extends CIColorKernel {

	static alloc(): CIBlendKernel; // inherited from NSObject

	static kernelWithFunctionNameFromMetalLibraryDataError(name: string, data: NSData): CIBlendKernel; // inherited from CIKernel

	static kernelWithFunctionNameFromMetalLibraryDataOutputPixelFormatError(name: string, data: NSData, format: number): CIBlendKernel; // inherited from CIKernel

	static kernelWithString(string: string): CIBlendKernel; // inherited from CIKernel

	static new(): CIBlendKernel; // inherited from NSObject

	static readonly clear: CIBlendKernel;

	static readonly color: CIBlendKernel;

	static readonly colorBurn: CIBlendKernel;

	static readonly colorDodge: CIBlendKernel;

	static readonly componentAdd: CIBlendKernel;

	static readonly componentMax: CIBlendKernel;

	static readonly componentMin: CIBlendKernel;

	static readonly componentMultiply: CIBlendKernel;

	static readonly darken: CIBlendKernel;

	static readonly darkerColor: CIBlendKernel;

	static readonly destination: CIBlendKernel;

	static readonly destinationAtop: CIBlendKernel;

	static readonly destinationIn: CIBlendKernel;

	static readonly destinationOut: CIBlendKernel;

	static readonly destinationOver: CIBlendKernel;

	static readonly difference: CIBlendKernel;

	static readonly divide: CIBlendKernel;

	static readonly exclusion: CIBlendKernel;

	static readonly exclusiveOr: CIBlendKernel;

	static readonly hardLight: CIBlendKernel;

	static readonly hardMix: CIBlendKernel;

	static readonly hue: CIBlendKernel;

	static readonly lighten: CIBlendKernel;

	static readonly lighterColor: CIBlendKernel;

	static readonly linearBurn: CIBlendKernel;

	static readonly linearDodge: CIBlendKernel;

	static readonly linearLight: CIBlendKernel;

	static readonly luminosity: CIBlendKernel;

	static readonly multiply: CIBlendKernel;

	static readonly overlay: CIBlendKernel;

	static readonly pinLight: CIBlendKernel;

	static readonly saturation: CIBlendKernel;

	static readonly screen: CIBlendKernel;

	static readonly softLight: CIBlendKernel;

	static readonly source: CIBlendKernel;

	static readonly sourceAtop: CIBlendKernel;

	static readonly sourceIn: CIBlendKernel;

	static readonly sourceOut: CIBlendKernel;

	static readonly sourceOver: CIBlendKernel;

	static readonly subtract: CIBlendKernel;

	static readonly vividLight: CIBlendKernel;

	applyWithForegroundBackground(foreground: CIImage, background: CIImage): CIImage;

	applyWithForegroundBackgroundColorSpace(foreground: CIImage, background: CIImage, colorSpace: any): CIImage;
}

interface CIBlendWithMask extends CIFilterProtocol {

	backgroundImage: CIImage;

	inputImage: CIImage;

	maskImage: CIImage;
}
declare var CIBlendWithMask: {

	prototype: CIBlendWithMask;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIBloom extends CIFilterProtocol {

	inputImage: CIImage;

	intensity: number;

	radius: number;
}
declare var CIBloom: {

	prototype: CIBloom;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIBokehBlur extends CIFilterProtocol {

	inputImage: CIImage;

	radius: number;

	ringAmount: number;

	ringSize: number;

	softness: number;
}
declare var CIBokehBlur: {

	prototype: CIBokehBlur;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIBoxBlur extends CIFilterProtocol {

	inputImage: CIImage;

	radius: number;
}
declare var CIBoxBlur: {

	prototype: CIBoxBlur;

	customAttributes?(): NSDictionary<string, any>;
};

interface CICMYKHalftone extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	grayComponentReplacement: number;

	inputImage: CIImage;

	sharpness: number;

	underColorRemoval: number;

	width: number;
}
declare var CICMYKHalftone: {

	prototype: CICMYKHalftone;

	customAttributes?(): NSDictionary<string, any>;
};

interface CICheckerboardGenerator extends CIFilterProtocol {

	center: CGPoint;

	color0: CIColor;

	color1: CIColor;

	sharpness: number;

	width: number;
}
declare var CICheckerboardGenerator: {

	prototype: CICheckerboardGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CICircularScreen extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	sharpness: number;

	width: number;
}
declare var CICircularScreen: {

	prototype: CICircularScreen;

	customAttributes?(): NSDictionary<string, any>;
};

interface CICode128BarcodeGenerator extends CIFilterProtocol {

	barcodeHeight: number;

	message: NSData;

	quietSpace: number;
}
declare var CICode128BarcodeGenerator: {

	prototype: CICode128BarcodeGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIColor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIColor; // inherited from NSObject

	static colorWithCGColor(c: any): CIColor;

	static colorWithRedGreenBlue(r: number, g: number, b: number): CIColor;

	static colorWithRedGreenBlueAlpha(r: number, g: number, b: number, a: number): CIColor;

	static colorWithRedGreenBlueAlphaColorSpace(r: number, g: number, b: number, a: number, colorSpace: any): CIColor;

	static colorWithRedGreenBlueColorSpace(r: number, g: number, b: number, colorSpace: any): CIColor;

	static colorWithString(representation: string): CIColor;

	static new(): CIColor; // inherited from NSObject

	readonly alpha: number;

	readonly blue: number;

	readonly colorSpace: any;

	readonly components: interop.Pointer | interop.Reference<number>;

	readonly green: number;

	readonly numberOfComponents: number;

	readonly red: number;

	readonly stringRepresentation: string;

	static readonly blackColor: CIColor;

	static readonly blueColor: CIColor;

	static readonly clearColor: CIColor;

	static readonly cyanColor: CIColor;

	static readonly grayColor: CIColor;

	static readonly greenColor: CIColor;

	static readonly magentaColor: CIColor;

	static readonly redColor: CIColor;

	static readonly whiteColor: CIColor;

	static readonly yellowColor: CIColor;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { CGColor: any; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { color: UIColor; });

	constructor(o: { red: number; green: number; blue: number; });

	constructor(o: { red: number; green: number; blue: number; alpha: number; });

	constructor(o: { red: number; green: number; blue: number; alpha: number; colorSpace: any; });

	constructor(o: { red: number; green: number; blue: number; colorSpace: any; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCGColor(c: any): this;

	initWithCoder(coder: NSCoder): this;

	initWithColor(color: UIColor): this;

	initWithRedGreenBlue(r: number, g: number, b: number): this;

	initWithRedGreenBlueAlpha(r: number, g: number, b: number, a: number): this;

	initWithRedGreenBlueAlphaColorSpace(r: number, g: number, b: number, a: number, colorSpace: any): this;

	initWithRedGreenBlueColorSpace(r: number, g: number, b: number, colorSpace: any): this;
}

interface CIColorClamp extends CIFilterProtocol {

	inputImage: CIImage;

	maxComponents: CIVector;

	minComponents: CIVector;
}
declare var CIColorClamp: {

	prototype: CIColorClamp;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorControls extends CIFilterProtocol {

	brightness: number;

	contrast: number;

	inputImage: CIImage;

	saturation: number;
}
declare var CIColorControls: {

	prototype: CIColorControls;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorCrossPolynomial extends CIFilterProtocol {

	blueCoefficients: CIVector;

	greenCoefficients: CIVector;

	inputImage: CIImage;

	redCoefficients: CIVector;
}
declare var CIColorCrossPolynomial: {

	prototype: CIColorCrossPolynomial;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorCube extends CIFilterProtocol {

	cubeData: NSData;

	cubeDimension: number;

	inputImage: CIImage;
}
declare var CIColorCube: {

	prototype: CIColorCube;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorCubeWithColorSpace extends CIFilterProtocol {

	colorSpace: any;

	cubeData: NSData;

	cubeDimension: number;

	inputImage: CIImage;
}
declare var CIColorCubeWithColorSpace: {

	prototype: CIColorCubeWithColorSpace;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorCubesMixedWithMask extends CIFilterProtocol {

	colorSpace: any;

	cube0Data: NSData;

	cube1Data: NSData;

	cubeDimension: number;

	inputImage: CIImage;

	maskImage: CIImage;
}
declare var CIColorCubesMixedWithMask: {

	prototype: CIColorCubesMixedWithMask;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorCurves extends CIFilterProtocol {

	colorSpace: any;

	curvesData: NSData;

	curvesDomain: CIVector;

	inputImage: CIImage;
}
declare var CIColorCurves: {

	prototype: CIColorCurves;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorInvert extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIColorInvert: {

	prototype: CIColorInvert;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIColorKernel extends CIKernel {

	static alloc(): CIColorKernel; // inherited from NSObject

	static kernelWithFunctionNameFromMetalLibraryDataError(name: string, data: NSData): CIColorKernel; // inherited from CIKernel

	static kernelWithFunctionNameFromMetalLibraryDataOutputPixelFormatError(name: string, data: NSData, format: number): CIColorKernel; // inherited from CIKernel

	static kernelWithString(string: string): CIColorKernel; // inherited from CIKernel

	static new(): CIColorKernel; // inherited from NSObject

	applyWithExtentArguments(extent: CGRect, args: NSArray<any> | any[]): CIImage;
}

interface CIColorMap extends CIFilterProtocol {

	gradientImage: CIImage;

	inputImage: CIImage;
}
declare var CIColorMap: {

	prototype: CIColorMap;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorMatrix extends CIFilterProtocol {

	AVector: CIVector;

	BVector: CIVector;

	GVector: CIVector;

	RVector: CIVector;

	biasVector: CIVector;

	inputImage: CIImage;
}
declare var CIColorMatrix: {

	prototype: CIColorMatrix;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorMonochrome extends CIFilterProtocol {

	color: CIColor;

	inputImage: CIImage;

	intensity: number;
}
declare var CIColorMonochrome: {

	prototype: CIColorMonochrome;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorPolynomial extends CIFilterProtocol {

	alphaCoefficients: CIVector;

	blueCoefficients: CIVector;

	greenCoefficients: CIVector;

	inputImage: CIImage;

	redCoefficients: CIVector;
}
declare var CIColorPolynomial: {

	prototype: CIColorPolynomial;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorPosterize extends CIFilterProtocol {

	inputImage: CIImage;

	levels: number;
}
declare var CIColorPosterize: {

	prototype: CIColorPosterize;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIComicEffect extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIComicEffect: {

	prototype: CIComicEffect;

	customAttributes?(): NSDictionary<string, any>;
};

interface CICompositeOperation extends CIFilterProtocol {

	backgroundImage: CIImage;

	inputImage: CIImage;
}
declare var CICompositeOperation: {

	prototype: CICompositeOperation;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIContext extends NSObject {

	static alloc(): CIContext; // inherited from NSObject

	static context(): CIContext;

	static contextWithCGContextOptions(cgctx: any, options: NSDictionary<string, any>): CIContext;

	static contextWithEAGLContext(eaglContext: EAGLContext): CIContext;

	static contextWithEAGLContextOptions(eaglContext: EAGLContext, options: NSDictionary<string, any>): CIContext;

	static contextWithMTLCommandQueue(commandQueue: MTLCommandQueue): CIContext;

	static contextWithMTLCommandQueueOptions(commandQueue: MTLCommandQueue, options: NSDictionary<string, any>): CIContext;

	static contextWithMTLDevice(device: MTLDevice): CIContext;

	static contextWithMTLDeviceOptions(device: MTLDevice, options: NSDictionary<string, any>): CIContext;

	static contextWithOptions(options: NSDictionary<string, any>): CIContext;

	static new(): CIContext; // inherited from NSObject

	readonly workingColorSpace: any;

	readonly workingFormat: number;

	constructor(o: { options: NSDictionary<string, any>; });

	HEIFRepresentationOfImageFormatColorSpaceOptions(image: CIImage, format: number, colorSpace: any, options: NSDictionary<string, any>): NSData;

	JPEGRepresentationOfImageColorSpaceOptions(image: CIImage, colorSpace: any, options: NSDictionary<string, any>): NSData;

	PNGRepresentationOfImageFormatColorSpaceOptions(image: CIImage, format: number, colorSpace: any, options: NSDictionary<string, any>): NSData;

	TIFFRepresentationOfImageFormatColorSpaceOptions(image: CIImage, format: number, colorSpace: any, options: NSDictionary<string, any>): NSData;

	clearCaches(): void;

	createCGImageFromRect(image: CIImage, fromRect: CGRect): any;

	createCGImageFromRectFormatColorSpace(image: CIImage, fromRect: CGRect, format: number, colorSpace: any): any;

	createCGImageFromRectFormatColorSpaceDeferred(image: CIImage, fromRect: CGRect, format: number, colorSpace: any, deferred: boolean): any;

	depthBlurEffectFilterForImageDataOptions(data: NSData, options: NSDictionary<any, any>): CIFilter;

	depthBlurEffectFilterForImageDisparityImagePortraitEffectsMatteHairSemanticSegmentationOrientationOptions(image: CIImage, disparityImage: CIImage, portraitEffectsMatte: CIImage, hairSemanticSegmentation: CIImage, orientation: CGImagePropertyOrientation, options: NSDictionary<any, any>): CIFilter;

	depthBlurEffectFilterForImageDisparityImagePortraitEffectsMatteOrientationOptions(image: CIImage, disparityImage: CIImage, portraitEffectsMatte: CIImage, orientation: CGImagePropertyOrientation, options: NSDictionary<any, any>): CIFilter;

	depthBlurEffectFilterForImageURLOptions(url: NSURL, options: NSDictionary<any, any>): CIFilter;

	drawImageAtPointFromRect(image: CIImage, atPoint: CGPoint, fromRect: CGRect): void;

	drawImageInRectFromRect(image: CIImage, inRect: CGRect, fromRect: CGRect): void;

	initWithOptions(options: NSDictionary<string, any>): this;

	inputImageMaximumSize(): CGSize;

	outputImageMaximumSize(): CGSize;

	prepareRenderFromRectToDestinationAtPointError(image: CIImage, fromRect: CGRect, destination: CIRenderDestination, atPoint: CGPoint): boolean;

	renderToBitmapRowBytesBoundsFormatColorSpace(image: CIImage, data: interop.Pointer | interop.Reference<any>, rowBytes: number, bounds: CGRect, format: number, colorSpace: any): void;

	renderToCVPixelBuffer(image: CIImage, buffer: any): void;

	renderToCVPixelBufferBoundsColorSpace(image: CIImage, buffer: any, bounds: CGRect, colorSpace: any): void;

	renderToIOSurfaceBoundsColorSpace(image: CIImage, surface: any, bounds: CGRect, colorSpace: any): void;

	renderToMTLTextureCommandBufferBoundsColorSpace(image: CIImage, texture: MTLTexture, commandBuffer: MTLCommandBuffer, bounds: CGRect, colorSpace: any): void;

	startTaskToClearError(destination: CIRenderDestination): CIRenderTask;

	startTaskToRenderFromRectToDestinationAtPointError(image: CIImage, fromRect: CGRect, destination: CIRenderDestination, atPoint: CGPoint): CIRenderTask;

	startTaskToRenderToDestinationError(image: CIImage, destination: CIRenderDestination): CIRenderTask;

	writeHEIFRepresentationOfImageToURLFormatColorSpaceOptionsError(image: CIImage, url: NSURL, format: number, colorSpace: any, options: NSDictionary<string, any>): boolean;

	writeJPEGRepresentationOfImageToURLColorSpaceOptionsError(image: CIImage, url: NSURL, colorSpace: any, options: NSDictionary<string, any>): boolean;

	writePNGRepresentationOfImageToURLFormatColorSpaceOptionsError(image: CIImage, url: NSURL, format: number, colorSpace: any, options: NSDictionary<string, any>): boolean;

	writeTIFFRepresentationOfImageToURLFormatColorSpaceOptionsError(image: CIImage, url: NSURL, format: number, colorSpace: any, options: NSDictionary<string, any>): boolean;
}

interface CIConvolution extends CIFilterProtocol {

	bias: number;

	inputImage: CIImage;

	weights: CIVector;
}
declare var CIConvolution: {

	prototype: CIConvolution;

	customAttributes?(): NSDictionary<string, any>;
};

interface CICopyMachineTransition extends CITransitionFilter {

	angle: number;

	color: CIColor;

	extent: CGRect;

	opacity: number;

	width: number;
}
declare var CICopyMachineTransition: {

	prototype: CICopyMachineTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CICoreMLModel extends CIFilterProtocol {

	headIndex: number;

	inputImage: CIImage;

	model: MLModel;

	softmaxNormalization: boolean;
}
declare var CICoreMLModel: {

	prototype: CICoreMLModel;

	customAttributes?(): NSDictionary<string, any>;
};

interface CICrystallize extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	radius: number;
}
declare var CICrystallize: {

	prototype: CICrystallize;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIDataMatrixCodeDescriptor extends CIBarcodeDescriptor {

	static alloc(): CIDataMatrixCodeDescriptor; // inherited from NSObject

	static descriptorWithPayloadRowCountColumnCountEccVersion(errorCorrectedPayload: NSData, rowCount: number, columnCount: number, eccVersion: CIDataMatrixCodeECCVersion): CIDataMatrixCodeDescriptor;

	static new(): CIDataMatrixCodeDescriptor; // inherited from NSObject

	readonly columnCount: number;

	readonly eccVersion: CIDataMatrixCodeECCVersion;

	readonly errorCorrectedPayload: NSData;

	readonly rowCount: number;

	constructor(o: { payload: NSData; rowCount: number; columnCount: number; eccVersion: CIDataMatrixCodeECCVersion; });

	initWithPayloadRowCountColumnCountEccVersion(errorCorrectedPayload: NSData, rowCount: number, columnCount: number, eccVersion: CIDataMatrixCodeECCVersion): this;
}

declare const enum CIDataMatrixCodeECCVersion {

	Version000 = 0,

	Version050 = 50,

	Version080 = 80,

	Version100 = 100,

	Version140 = 140,

	Version200 = 200
}

interface CIDepthOfField extends CIFilterProtocol {

	inputImage: CIImage;

	point0: CGPoint;

	point1: CGPoint;

	radius: number;

	saturation: number;

	unsharpMaskIntensity: number;

	unsharpMaskRadius: number;
}
declare var CIDepthOfField: {

	prototype: CIDepthOfField;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIDepthToDisparity extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIDepthToDisparity: {

	prototype: CIDepthToDisparity;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIDetector extends NSObject {

	static alloc(): CIDetector; // inherited from NSObject

	static detectorOfTypeContextOptions(type: string, context: CIContext, options: NSDictionary<string, any>): CIDetector;

	static new(): CIDetector; // inherited from NSObject

	featuresInImage(image: CIImage): NSArray<CIFeature>;

	featuresInImageOptions(image: CIImage, options: NSDictionary<string, any>): NSArray<CIFeature>;
}

declare var CIDetectorAccuracy: string;

declare var CIDetectorAccuracyHigh: string;

declare var CIDetectorAccuracyLow: string;

declare var CIDetectorAspectRatio: string;

declare var CIDetectorEyeBlink: string;

declare var CIDetectorFocalLength: string;

declare var CIDetectorImageOrientation: string;

declare var CIDetectorMaxFeatureCount: string;

declare var CIDetectorMinFeatureSize: string;

declare var CIDetectorNumberOfAngles: string;

declare var CIDetectorReturnSubFeatures: string;

declare var CIDetectorSmile: string;

declare var CIDetectorTracking: string;

declare var CIDetectorTypeFace: string;

declare var CIDetectorTypeQRCode: string;

declare var CIDetectorTypeRectangle: string;

declare var CIDetectorTypeText: string;

interface CIDiscBlur extends CIFilterProtocol {

	inputImage: CIImage;

	radius: number;
}
declare var CIDiscBlur: {

	prototype: CIDiscBlur;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIDisintegrateWithMaskTransition extends CITransitionFilter {

	maskImage: CIImage;

	shadowDensity: number;

	shadowOffset: CGPoint;

	shadowRadius: number;
}
declare var CIDisintegrateWithMaskTransition: {

	prototype: CIDisintegrateWithMaskTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIDisparityToDepth extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIDisparityToDepth: {

	prototype: CIDisparityToDepth;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIDissolveTransition extends CITransitionFilter {
}
declare var CIDissolveTransition: {

	prototype: CIDissolveTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIDither extends CIFilterProtocol {

	inputImage: CIImage;

	intensity: number;
}
declare var CIDither: {

	prototype: CIDither;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIDocumentEnhancer extends CIFilterProtocol {

	amount: number;

	inputImage: CIImage;
}
declare var CIDocumentEnhancer: {

	prototype: CIDocumentEnhancer;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIDotScreen extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	sharpness: number;

	width: number;
}
declare var CIDotScreen: {

	prototype: CIDotScreen;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIEdgePreserveUpsample extends CIFilterProtocol {

	inputImage: CIImage;

	lumaSigma: number;

	smallImage: CIImage;

	spatialSigma: number;
}
declare var CIEdgePreserveUpsample: {

	prototype: CIEdgePreserveUpsample;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIEdgeWork extends CIFilterProtocol {

	inputImage: CIImage;

	radius: number;
}
declare var CIEdgeWork: {

	prototype: CIEdgeWork;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIEdges extends CIFilterProtocol {

	inputImage: CIImage;

	intensity: number;
}
declare var CIEdges: {

	prototype: CIEdges;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIEightfoldReflectedTile extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	width: number;
}
declare var CIEightfoldReflectedTile: {

	prototype: CIEightfoldReflectedTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIExposureAdjust extends CIFilterProtocol {

	EV: number;

	inputImage: CIImage;
}
declare var CIExposureAdjust: {

	prototype: CIExposureAdjust;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIFaceFeature extends CIFeature {

	static alloc(): CIFaceFeature; // inherited from NSObject

	static new(): CIFaceFeature; // inherited from NSObject

	readonly faceAngle: number;

	readonly hasFaceAngle: boolean;

	readonly hasLeftEyePosition: boolean;

	readonly hasMouthPosition: boolean;

	readonly hasRightEyePosition: boolean;

	readonly hasSmile: boolean;

	readonly hasTrackingFrameCount: boolean;

	readonly hasTrackingID: boolean;

	readonly leftEyeClosed: boolean;

	readonly leftEyePosition: CGPoint;

	readonly mouthPosition: CGPoint;

	readonly rightEyeClosed: boolean;

	readonly rightEyePosition: CGPoint;

	readonly trackingFrameCount: number;

	readonly trackingID: number;
}

interface CIFalseColor extends CIFilterProtocol {

	color0: CIColor;

	color1: CIColor;

	inputImage: CIImage;
}
declare var CIFalseColor: {

	prototype: CIFalseColor;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIFeature extends NSObject {

	static alloc(): CIFeature; // inherited from NSObject

	static new(): CIFeature; // inherited from NSObject

	readonly bounds: CGRect;

	readonly type: string;
}

declare var CIFeatureTypeFace: string;

declare var CIFeatureTypeQRCode: string;

declare var CIFeatureTypeRectangle: string;

declare var CIFeatureTypeText: string;

declare class CIFilter extends NSObject implements NSCopying, NSSecureCoding {

	static CMYKHalftone(): CIFilter;

	static LabDeltaE(): CIFilter;

	static PDF417BarcodeGenerator(): CIFilter;

	static QRCodeGenerator(): CIFilter;

	static accordionFoldTransitionFilter(): CIFilter;

	static additionCompositingFilter(): CIFilter;

	static affineClampFilter(): CIFilter;

	static affineTileFilter(): CIFilter;

	static alloc(): CIFilter; // inherited from NSObject

	static attributedTextImageGeneratorFilter(): CIFilter;

	static aztecCodeGeneratorFilter(): CIFilter;

	static barcodeGeneratorFilter(): CIFilter;

	static barsSwipeTransitionFilter(): CIFilter;

	static bicubicScaleTransformFilter(): CIFilter;

	static blendWithAlphaMaskFilter(): CIFilter;

	static blendWithBlueMaskFilter(): CIFilter;

	static blendWithMaskFilter(): CIFilter;

	static blendWithRedMaskFilter(): CIFilter;

	static bloomFilter(): CIFilter;

	static bokehBlurFilter(): CIFilter;

	static boxBlurFilter(): CIFilter;

	static checkerboardGeneratorFilter(): CIFilter;

	static circularScreenFilter(): CIFilter;

	static code128BarcodeGeneratorFilter(): CIFilter;

	static colorBlendModeFilter(): CIFilter;

	static colorBurnBlendModeFilter(): CIFilter;

	static colorClampFilter(): CIFilter;

	static colorControlsFilter(): CIFilter;

	static colorCrossPolynomialFilter(): CIFilter;

	static colorCubeFilter(): CIFilter;

	static colorCubeWithColorSpaceFilter(): CIFilter;

	static colorCubesMixedWithMaskFilter(): CIFilter;

	static colorCurvesFilter(): CIFilter;

	static colorDodgeBlendModeFilter(): CIFilter;

	static colorInvertFilter(): CIFilter;

	static colorMapFilter(): CIFilter;

	static colorMatrixFilter(): CIFilter;

	static colorMonochromeFilter(): CIFilter;

	static colorPolynomialFilter(): CIFilter;

	static colorPosterizeFilter(): CIFilter;

	static comicEffectFilter(): CIFilter;

	static convolution3X3Filter(): CIFilter;

	static convolution5X5Filter(): CIFilter;

	static convolution7X7Filter(): CIFilter;

	static convolution9HorizontalFilter(): CIFilter;

	static convolution9VerticalFilter(): CIFilter;

	static copyMachineTransitionFilter(): CIFilter;

	static coreMLModelFilter(): CIFilter;

	static crystallizeFilter(): CIFilter;

	static darkenBlendModeFilter(): CIFilter;

	static depthOfFieldFilter(): CIFilter;

	static depthToDisparityFilter(): CIFilter;

	static differenceBlendModeFilter(): CIFilter;

	static discBlurFilter(): CIFilter;

	static disintegrateWithMaskTransitionFilter(): CIFilter;

	static disparityToDepthFilter(): CIFilter;

	static dissolveTransitionFilter(): CIFilter;

	static ditherFilter(): CIFilter;

	static divideBlendModeFilter(): CIFilter;

	static documentEnhancerFilter(): CIFilter;

	static dotScreenFilter(): CIFilter;

	static edgePreserveUpsampleFilter(): CIFilter;

	static edgeWorkFilter(): CIFilter;

	static edgesFilter(): CIFilter;

	static eightfoldReflectedTileFilter(): CIFilter;

	static exclusionBlendModeFilter(): CIFilter;

	static exposureAdjustFilter(): CIFilter;

	static falseColorFilter(): CIFilter;

	static filterArrayFromSerializedXMPInputImageExtentError(xmpData: NSData, extent: CGRect): NSArray<CIFilter>;

	static filterNamesInCategories(categories: NSArray<string> | string[]): NSArray<string>;

	static filterNamesInCategory(category: string): NSArray<string>;

	static filterWithCVPixelBufferPropertiesOptions(pixelBuffer: any, properties: NSDictionary<any, any>, options: NSDictionary<string, any>): CIFilter;

	static filterWithImageDataOptions(data: NSData, options: NSDictionary<string, any>): CIFilter;

	static filterWithImageURLOptions(url: NSURL, options: NSDictionary<string, any>): CIFilter;

	static filterWithName(name: string): CIFilter;

	static filterWithNameKeysAndValues(name: string, key0: any): CIFilter;

	static filterWithNameWithInputParameters(name: string, params: NSDictionary<string, any>): CIFilter;

	static flashTransitionFilter(): CIFilter;

	static fourfoldReflectedTileFilter(): CIFilter;

	static fourfoldRotatedTileFilter(): CIFilter;

	static fourfoldTranslatedTileFilter(): CIFilter;

	static gaborGradientsFilter(): CIFilter;

	static gammaAdjustFilter(): CIFilter;

	static gaussianBlurFilter(): CIFilter;

	static gaussianGradientFilter(): CIFilter;

	static glideReflectedTileFilter(): CIFilter;

	static gloomFilter(): CIFilter;

	static hardLightBlendModeFilter(): CIFilter;

	static hatchedScreenFilter(): CIFilter;

	static heightFieldFromMaskFilter(): CIFilter;

	static hexagonalPixellateFilter(): CIFilter;

	static highlightShadowAdjustFilter(): CIFilter;

	static hueAdjustFilter(): CIFilter;

	static hueBlendModeFilter(): CIFilter;

	static hueSaturationValueGradientFilter(): CIFilter;

	static kaleidoscopeFilter(): CIFilter;

	static keystoneCorrectionCombinedFilter(): CIFilter;

	static keystoneCorrectionHorizontalFilter(): CIFilter;

	static keystoneCorrectionVerticalFilter(): CIFilter;

	static lanczosScaleTransformFilter(): CIFilter;

	static lenticularHaloGeneratorFilter(): CIFilter;

	static lightenBlendModeFilter(): CIFilter;

	static lineOverlayFilter(): CIFilter;

	static lineScreenFilter(): CIFilter;

	static linearBurnBlendModeFilter(): CIFilter;

	static linearDodgeBlendModeFilter(): CIFilter;

	static linearGradientFilter(): CIFilter;

	static linearToSRGBToneCurveFilter(): CIFilter;

	static localizedDescriptionForFilterName(filterName: string): string;

	static localizedNameForCategory(category: string): string;

	static localizedNameForFilterName(filterName: string): string;

	static localizedReferenceDocumentationForFilterName(filterName: string): NSURL;

	static luminosityBlendModeFilter(): CIFilter;

	static maskToAlphaFilter(): CIFilter;

	static maskedVariableBlurFilter(): CIFilter;

	static maximumComponentFilter(): CIFilter;

	static maximumCompositingFilter(): CIFilter;

	static medianFilter(): CIFilter;

	static meshGeneratorFilter(): CIFilter;

	static minimumComponentFilter(): CIFilter;

	static minimumCompositingFilter(): CIFilter;

	static mixFilter(): CIFilter;

	static modTransitionFilter(): CIFilter;

	static morphologyGradientFilter(): CIFilter;

	static morphologyMaximumFilter(): CIFilter;

	static morphologyMinimumFilter(): CIFilter;

	static morphologyRectangleMaximumFilter(): CIFilter;

	static morphologyRectangleMinimumFilter(): CIFilter;

	static motionBlurFilter(): CIFilter;

	static multiplyBlendModeFilter(): CIFilter;

	static multiplyCompositingFilter(): CIFilter;

	static new(): CIFilter; // inherited from NSObject

	static noiseReductionFilter(): CIFilter;

	static opTileFilter(): CIFilter;

	static overlayBlendModeFilter(): CIFilter;

	static pageCurlTransitionFilter(): CIFilter;

	static pageCurlWithShadowTransitionFilter(): CIFilter;

	static paletteCentroidFilter(): CIFilter;

	static palettizeFilter(): CIFilter;

	static parallelogramTileFilter(): CIFilter;

	static perspectiveCorrectionFilter(): CIFilter;

	static perspectiveRotateFilter(): CIFilter;

	static perspectiveTileFilter(): CIFilter;

	static perspectiveTransformFilter(): CIFilter;

	static perspectiveTransformWithExtentFilter(): CIFilter;

	static photoEffectChromeFilter(): CIFilter;

	static photoEffectFadeFilter(): CIFilter;

	static photoEffectInstantFilter(): CIFilter;

	static photoEffectMonoFilter(): CIFilter;

	static photoEffectNoirFilter(): CIFilter;

	static photoEffectProcessFilter(): CIFilter;

	static photoEffectTonalFilter(): CIFilter;

	static photoEffectTransferFilter(): CIFilter;

	static pinLightBlendModeFilter(): CIFilter;

	static pixellateFilter(): CIFilter;

	static pointillizeFilter(): CIFilter;

	static radialGradientFilter(): CIFilter;

	static randomGeneratorFilter(): CIFilter;

	static registerFilterNameConstructorClassAttributes(name: string, anObject: CIFilterConstructor, attributes: NSDictionary<string, any>): void;

	static rippleTransitionFilter(): CIFilter;

	static roundedRectangleGeneratorFilter(): CIFilter;

	static sRGBToneCurveToLinearFilter(): CIFilter;

	static saliencyMapFilter(): CIFilter;

	static saturationBlendModeFilter(): CIFilter;

	static screenBlendModeFilter(): CIFilter;

	static sepiaToneFilter(): CIFilter;

	static serializedXMPFromFiltersInputImageExtent(filters: NSArray<CIFilter> | CIFilter[], extent: CGRect): NSData;

	static shadedMaterialFilter(): CIFilter;

	static sharpenLuminanceFilter(): CIFilter;

	static sixfoldReflectedTileFilter(): CIFilter;

	static sixfoldRotatedTileFilter(): CIFilter;

	static smoothLinearGradientFilter(): CIFilter;

	static softLightBlendModeFilter(): CIFilter;

	static sourceAtopCompositingFilter(): CIFilter;

	static sourceInCompositingFilter(): CIFilter;

	static sourceOutCompositingFilter(): CIFilter;

	static sourceOverCompositingFilter(): CIFilter;

	static spotColorFilter(): CIFilter;

	static spotLightFilter(): CIFilter;

	static starShineGeneratorFilter(): CIFilter;

	static straightenFilter(): CIFilter;

	static stripesGeneratorFilter(): CIFilter;

	static subtractBlendModeFilter(): CIFilter;

	static sunbeamsGeneratorFilter(): CIFilter;

	static supportedRawCameraModels(): NSArray<string>;

	static swipeTransitionFilter(): CIFilter;

	static temperatureAndTintFilter(): CIFilter;

	static textImageGeneratorFilter(): CIFilter;

	static thermalFilter(): CIFilter;

	static toneCurveFilter(): CIFilter;

	static triangleKaleidoscopeFilter(): CIFilter;

	static triangleTileFilter(): CIFilter;

	static twelvefoldReflectedTileFilter(): CIFilter;

	static unsharpMaskFilter(): CIFilter;

	static vibranceFilter(): CIFilter;

	static vignetteEffectFilter(): CIFilter;

	static vignetteFilter(): CIFilter;

	static whitePointAdjustFilter(): CIFilter;

	static xRayFilter(): CIFilter;

	static zoomBlurFilter(): CIFilter;

	readonly attributes: NSDictionary<string, any>;

	readonly inputKeys: NSArray<string>;

	name: string;

	readonly outputImage: CIImage;

	readonly outputKeys: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	setDefaults(): void;

	setName(aString: string): void;
}

interface CIFilterConstructor {

	filterWithName(name: string): CIFilter;
}
declare var CIFilterConstructor: {

	prototype: CIFilterConstructor;
};

interface CIFilterProtocol {

	outputImage: CIImage;
}
declare var CIFilterProtocol: {

	prototype: CIFilterProtocol;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIFilterShape extends NSObject implements NSCopying {

	static alloc(): CIFilterShape; // inherited from NSObject

	static new(): CIFilterShape; // inherited from NSObject

	static shapeWithRect(r: CGRect): CIFilterShape;

	readonly extent: CGRect;

	constructor(o: { rect: CGRect; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithRect(r: CGRect): this;

	insetByXY(dx: number, dy: number): CIFilterShape;

	intersectWith(s2: CIFilterShape): CIFilterShape;

	intersectWithRect(r: CGRect): CIFilterShape;

	transformByInterior(m: CGAffineTransform, flag: boolean): CIFilterShape;

	unionWith(s2: CIFilterShape): CIFilterShape;

	unionWithRect(r: CGRect): CIFilterShape;
}

interface CIFlashTransition extends CITransitionFilter {

	center: CGPoint;

	color: CIColor;

	extent: CGRect;

	fadeThreshold: number;

	maxStriationRadius: number;

	striationContrast: number;

	striationStrength: number;
}
declare var CIFlashTransition: {

	prototype: CIFlashTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIFourCoordinateGeometryFilter extends CIFilterProtocol {

	bottomLeft: CGPoint;

	bottomRight: CGPoint;

	inputImage: CIImage;

	topLeft: CGPoint;

	topRight: CGPoint;
}
declare var CIFourCoordinateGeometryFilter: {

	prototype: CIFourCoordinateGeometryFilter;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIFourfoldReflectedTile extends CIFilterProtocol {

	acuteAngle: number;

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	width: number;
}
declare var CIFourfoldReflectedTile: {

	prototype: CIFourfoldReflectedTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIFourfoldRotatedTile extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	width: number;
}
declare var CIFourfoldRotatedTile: {

	prototype: CIFourfoldRotatedTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIFourfoldTranslatedTile extends CIFilterProtocol {

	acuteAngle: number;

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	width: number;
}
declare var CIFourfoldTranslatedTile: {

	prototype: CIFourfoldTranslatedTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIGaborGradients extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIGaborGradients: {

	prototype: CIGaborGradients;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIGammaAdjust extends CIFilterProtocol {

	inputImage: CIImage;

	power: number;
}
declare var CIGammaAdjust: {

	prototype: CIGammaAdjust;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIGaussianBlur extends CIFilterProtocol {

	inputImage: CIImage;

	radius: number;
}
declare var CIGaussianBlur: {

	prototype: CIGaussianBlur;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIGaussianGradient extends CIFilterProtocol {

	center: CGPoint;

	color0: CIColor;

	color1: CIColor;

	radius: number;
}
declare var CIGaussianGradient: {

	prototype: CIGaussianGradient;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIGlideReflectedTile extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	width: number;
}
declare var CIGlideReflectedTile: {

	prototype: CIGlideReflectedTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIGloom extends CIFilterProtocol {

	inputImage: CIImage;

	intensity: number;

	radius: number;
}
declare var CIGloom: {

	prototype: CIGloom;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIHatchedScreen extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	sharpness: number;

	width: number;
}
declare var CIHatchedScreen: {

	prototype: CIHatchedScreen;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIHeightFieldFromMask extends CIFilterProtocol {

	inputImage: CIImage;

	radius: number;
}
declare var CIHeightFieldFromMask: {

	prototype: CIHeightFieldFromMask;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIHexagonalPixellate extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	scale: number;
}
declare var CIHexagonalPixellate: {

	prototype: CIHexagonalPixellate;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIHighlightShadowAdjust extends CIFilterProtocol {

	highlightAmount: number;

	inputImage: CIImage;

	radius: number;

	shadowAmount: number;
}
declare var CIHighlightShadowAdjust: {

	prototype: CIHighlightShadowAdjust;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIHueAdjust extends CIFilterProtocol {

	angle: number;

	inputImage: CIImage;
}
declare var CIHueAdjust: {

	prototype: CIHueAdjust;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIHueSaturationValueGradient extends CIFilterProtocol {

	colorSpace: any;

	dither: number;

	radius: number;

	softness: number;

	value: number;
}
declare var CIHueSaturationValueGradient: {

	prototype: CIHueSaturationValueGradient;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIImage extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIImage; // inherited from NSObject

	static emptyImage(): CIImage;

	static imageWithBitmapDataBytesPerRowSizeFormatColorSpace(data: NSData, bytesPerRow: number, size: CGSize, format: number, colorSpace: any): CIImage;

	static imageWithCGImage(image: any): CIImage;

	static imageWithCGImageOptions(image: any, options: NSDictionary<string, any>): CIImage;

	static imageWithCGImageSourceIndexOptions(source: any, index: number, dict: NSDictionary<string, any>): CIImage;

	static imageWithCVImageBuffer(imageBuffer: any): CIImage;

	static imageWithCVImageBufferOptions(imageBuffer: any, options: NSDictionary<string, any>): CIImage;

	static imageWithCVPixelBuffer(pixelBuffer: any): CIImage;

	static imageWithCVPixelBufferOptions(pixelBuffer: any, options: NSDictionary<string, any>): CIImage;

	static imageWithColor(color: CIColor): CIImage;

	static imageWithContentsOfURL(url: NSURL): CIImage;

	static imageWithContentsOfURLOptions(url: NSURL, options: NSDictionary<string, any>): CIImage;

	static imageWithData(data: NSData): CIImage;

	static imageWithDataOptions(data: NSData, options: NSDictionary<string, any>): CIImage;

	static imageWithDepthData(data: AVDepthData): CIImage;

	static imageWithDepthDataOptions(data: AVDepthData, options: NSDictionary<string, any>): CIImage;

	static imageWithIOSurface(surface: any): CIImage;

	static imageWithIOSurfaceOptions(surface: any, options: NSDictionary<string, any>): CIImage;

	static imageWithImageProviderSizeFormatColorSpaceOptions(p: any, width: number, height: number, f: number, cs: any, options: NSDictionary<string, any>): CIImage;

	static imageWithMTLTextureOptions(texture: MTLTexture, options: NSDictionary<string, any>): CIImage;

	static imageWithPortaitEffectsMatte(matte: AVPortraitEffectsMatte): CIImage;

	static imageWithPortaitEffectsMatteOptions(matte: AVPortraitEffectsMatte, options: NSDictionary<string, any>): CIImage;

	static imageWithSemanticSegmentationMatte(matte: AVSemanticSegmentationMatte): CIImage;

	static imageWithSemanticSegmentationMatteOptions(matte: AVSemanticSegmentationMatte, options: NSDictionary<string, any>): CIImage;

	static imageWithTextureSizeFlippedColorSpace(name: number, size: CGSize, flipped: boolean, colorSpace: any): CIImage;

	static new(): CIImage; // inherited from NSObject

	readonly CGImage: any;

	readonly colorSpace: any;

	readonly depthData: AVDepthData;

	readonly extent: CGRect;

	readonly pixelBuffer: any;

	readonly portraitEffectsMatte: AVPortraitEffectsMatte;

	readonly properties: NSDictionary<string, any>;

	readonly semanticSegmentationMatte: AVSemanticSegmentationMatte;

	readonly url: NSURL;

	static readonly blackImage: CIImage;

	static readonly blueImage: CIImage;

	static readonly clearImage: CIImage;

	static readonly cyanImage: CIImage;

	static readonly grayImage: CIImage;

	static readonly greenImage: CIImage;

	static readonly magentaImage: CIImage;

	static readonly redImage: CIImage;

	static readonly whiteImage: CIImage;

	static readonly yellowImage: CIImage;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { bitmapData: NSData; bytesPerRow: number; size: CGSize; format: number; colorSpace: any; });

	constructor(o: { CGImage: any; });

	constructor(o: { CGImage: any; options: NSDictionary<string, any>; });

	constructor(o: { CGImageSource: any; index: number; options: NSDictionary<string, any>; });

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

	constructor(o: { depthData: AVDepthData; });

	constructor(o: { depthData: AVDepthData; options: NSDictionary<string, any>; });

	constructor(o: { IOSurface: any; });

	constructor(o: { IOSurface: any; options: NSDictionary<string, any>; });

	constructor(o: { image: UIImage; });

	constructor(o: { image: UIImage; options: NSDictionary<string, any>; });

	constructor(o: { imageProvider: any; size: number; format: number; colorSpace: number; options: any; });

	constructor(o: { MTLTexture: MTLTexture; options: NSDictionary<string, any>; });

	constructor(o: { portaitEffectsMatte: AVPortraitEffectsMatte; });

	constructor(o: { portaitEffectsMatte: AVPortraitEffectsMatte; options: NSDictionary<string, any>; });

	constructor(o: { semanticSegmentationMatte: AVSemanticSegmentationMatte; });

	constructor(o: { semanticSegmentationMatte: AVSemanticSegmentationMatte; options: NSDictionary<string, any>; });

	constructor(o: { texture: number; size: CGSize; flipped: boolean; colorSpace: any; });

	autoAdjustmentFilters(): NSArray<CIFilter>;

	autoAdjustmentFiltersWithOptions(options: NSDictionary<string, any>): NSArray<CIFilter>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	imageByApplyingCGOrientation(orientation: CGImagePropertyOrientation): CIImage;

	imageByApplyingFilter(filterName: string): CIImage;

	imageByApplyingFilterWithInputParameters(filterName: string, params: NSDictionary<string, any>): CIImage;

	imageByApplyingGaussianBlurWithSigma(sigma: number): CIImage;

	imageByApplyingOrientation(orientation: number): CIImage;

	imageByApplyingTransform(matrix: CGAffineTransform): CIImage;

	imageByApplyingTransformHighQualityDownsample(matrix: CGAffineTransform, highQualityDownsample: boolean): CIImage;

	imageByClampingToExtent(): CIImage;

	imageByClampingToRect(rect: CGRect): CIImage;

	imageByColorMatchingColorSpaceToWorkingSpace(colorSpace: any): CIImage;

	imageByColorMatchingWorkingSpaceToColorSpace(colorSpace: any): CIImage;

	imageByCompositingOverImage(dest: CIImage): CIImage;

	imageByCroppingToRect(rect: CGRect): CIImage;

	imageByInsertingIntermediate(cache: boolean): CIImage;

	imageByPremultiplyingAlpha(): CIImage;

	imageBySamplingLinear(): CIImage;

	imageBySamplingNearest(): CIImage;

	imageBySettingAlphaOneInExtent(extent: CGRect): CIImage;

	imageBySettingProperties(properties: NSDictionary<any, any>): CIImage;

	imageByUnpremultiplyingAlpha(): CIImage;

	imageTransformForCGOrientation(orientation: CGImagePropertyOrientation): CGAffineTransform;

	imageTransformForOrientation(orientation: number): CGAffineTransform;

	initWithBitmapDataBytesPerRowSizeFormatColorSpace(data: NSData, bytesPerRow: number, size: CGSize, format: number, colorSpace: any): this;

	initWithCGImage(image: any): this;

	initWithCGImageOptions(image: any, options: NSDictionary<string, any>): this;

	initWithCGImageSourceIndexOptions(source: any, index: number, dict: NSDictionary<string, any>): this;

	initWithCVImageBuffer(imageBuffer: any): this;

	initWithCVImageBufferOptions(imageBuffer: any, options: NSDictionary<string, any>): this;

	initWithCVPixelBuffer(pixelBuffer: any): this;

	initWithCVPixelBufferOptions(pixelBuffer: any, options: NSDictionary<string, any>): this;

	initWithCoder(coder: NSCoder): this;

	initWithColor(color: CIColor): this;

	initWithContentsOfURL(url: NSURL): this;

	initWithContentsOfURLOptions(url: NSURL, options: NSDictionary<string, any>): this;

	initWithData(data: NSData): this;

	initWithDataOptions(data: NSData, options: NSDictionary<string, any>): this;

	initWithDepthData(data: AVDepthData): this;

	initWithDepthDataOptions(data: AVDepthData, options: NSDictionary<string, any>): this;

	initWithIOSurface(surface: any): this;

	initWithIOSurfaceOptions(surface: any, options: NSDictionary<string, any>): this;

	initWithImage(image: UIImage): this;

	initWithImageOptions(image: UIImage, options: NSDictionary<string, any>): this;

	initWithImageProviderSizeFormatColorSpaceOptions(p: any, width: number, height: number, f: number, cs: any, options: NSDictionary<string, any>): this;

	initWithMTLTextureOptions(texture: MTLTexture, options: NSDictionary<string, any>): this;

	initWithPortaitEffectsMatte(matte: AVPortraitEffectsMatte): this;

	initWithPortaitEffectsMatteOptions(matte: AVPortraitEffectsMatte, options: NSDictionary<string, any>): this;

	initWithSemanticSegmentationMatte(matte: AVSemanticSegmentationMatte): this;

	initWithSemanticSegmentationMatteOptions(matte: AVSemanticSegmentationMatte, options: NSDictionary<string, any>): this;

	initWithTextureSizeFlippedColorSpace(name: number, size: CGSize, flipped: boolean, colorSpace: any): this;

	regionOfInterestForImageInRect(image: CIImage, rect: CGRect): CGRect;
}

declare class CIImageAccumulator extends NSObject {

	static alloc(): CIImageAccumulator; // inherited from NSObject

	static imageAccumulatorWithExtentFormat(extent: CGRect, format: number): CIImageAccumulator;

	static imageAccumulatorWithExtentFormatColorSpace(extent: CGRect, format: number, colorSpace: any): CIImageAccumulator;

	static new(): CIImageAccumulator; // inherited from NSObject

	readonly extent: CGRect;

	readonly format: number;

	constructor(o: { extent: CGRect; format: number; });

	constructor(o: { extent: CGRect; format: number; colorSpace: any; });

	clear(): void;

	image(): CIImage;

	initWithExtentFormat(extent: CGRect, format: number): this;

	initWithExtentFormatColorSpace(extent: CGRect, format: number, colorSpace: any): this;

	setImage(image: CIImage): void;

	setImageDirtyRect(image: CIImage, dirtyRect: CGRect): void;
}

interface CIImageProcessorInput {

	baseAddress: interop.Pointer | interop.Reference<any>;

	bytesPerRow: number;

	format: number;

	metalTexture: MTLTexture;

	pixelBuffer: any;

	region: CGRect;

	surface: any;
}
declare var CIImageProcessorInput: {

	prototype: CIImageProcessorInput;
};

declare class CIImageProcessorKernel extends NSObject {

	static alloc(): CIImageProcessorKernel; // inherited from NSObject

	static applyWithExtentInputsArgumentsError(extent: CGRect, inputs: NSArray<CIImage> | CIImage[], args: NSDictionary<string, any>): CIImage;

	static formatForInputAtIndex(input: number): number;

	static new(): CIImageProcessorKernel; // inherited from NSObject

	static processWithInputsArgumentsOutputError(inputs: NSArray<CIImageProcessorInput> | CIImageProcessorInput[], _arguments: NSDictionary<string, any>, output: CIImageProcessorOutput): boolean;

	static roiForInputArgumentsOutputRect(input: number, _arguments: NSDictionary<string, any>, outputRect: CGRect): CGRect;

	static readonly outputFormat: number;

	static readonly outputIsOpaque: boolean;

	static readonly synchronizeInputs: boolean;
}

interface CIImageProcessorOutput {

	baseAddress: interop.Pointer | interop.Reference<any>;

	bytesPerRow: number;

	format: number;

	metalCommandBuffer: MTLCommandBuffer;

	metalTexture: MTLTexture;

	pixelBuffer: any;

	region: CGRect;

	surface: any;
}
declare var CIImageProcessorOutput: {

	prototype: CIImageProcessorOutput;
};

interface CIKaleidoscope extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	count: number;

	inputImage: CIImage;
}
declare var CIKaleidoscope: {

	prototype: CIKaleidoscope;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIKernel extends NSObject {

	static alloc(): CIKernel; // inherited from NSObject

	static kernelWithFunctionNameFromMetalLibraryDataError(name: string, data: NSData): CIKernel;

	static kernelWithFunctionNameFromMetalLibraryDataOutputPixelFormatError(name: string, data: NSData, format: number): CIKernel;

	static kernelWithString(string: string): CIKernel;

	static kernelsWithString(string: string): NSArray<CIKernel>;

	static new(): CIKernel; // inherited from NSObject

	readonly name: string;

	applyWithExtentRoiCallbackArguments(extent: CGRect, callback: (p1: number, p2: CGRect) => CGRect, args: NSArray<any> | any[]): CIImage;

	setROISelector(method: string): void;
}

interface CIKeystoneCorrectionCombined extends CIFourCoordinateGeometryFilter {

	focalLength: number;
}
declare var CIKeystoneCorrectionCombined: {

	prototype: CIKeystoneCorrectionCombined;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIKeystoneCorrectionHorizontal extends CIFourCoordinateGeometryFilter {

	focalLength: number;
}
declare var CIKeystoneCorrectionHorizontal: {

	prototype: CIKeystoneCorrectionHorizontal;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIKeystoneCorrectionVertical extends CIFourCoordinateGeometryFilter {

	focalLength: number;
}
declare var CIKeystoneCorrectionVertical: {

	prototype: CIKeystoneCorrectionVertical;

	customAttributes?(): NSDictionary<string, any>;
};

interface CILabDeltaE extends CIFilterProtocol {

	image2: CIImage;

	inputImage: CIImage;
}
declare var CILabDeltaE: {

	prototype: CILabDeltaE;

	customAttributes?(): NSDictionary<string, any>;
};

interface CILanczosScaleTransform extends CIFilterProtocol {

	aspectRatio: number;

	inputImage: CIImage;

	scale: number;
}
declare var CILanczosScaleTransform: {

	prototype: CILanczosScaleTransform;

	customAttributes?(): NSDictionary<string, any>;
};

interface CILenticularHaloGenerator extends CIFilterProtocol {

	center: CGPoint;

	color: CIColor;

	haloOverlap: number;

	haloRadius: number;

	haloWidth: number;

	striationContrast: number;

	striationStrength: number;

	time: number;
}
declare var CILenticularHaloGenerator: {

	prototype: CILenticularHaloGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CILineOverlay extends CIFilterProtocol {

	NRNoiseLevel: number;

	NRSharpness: number;

	contrast: number;

	edgeIntensity: number;

	inputImage: CIImage;

	threshold: number;
}
declare var CILineOverlay: {

	prototype: CILineOverlay;

	customAttributes?(): NSDictionary<string, any>;
};

interface CILineScreen extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	sharpness: number;

	width: number;
}
declare var CILineScreen: {

	prototype: CILineScreen;

	customAttributes?(): NSDictionary<string, any>;
};

interface CILinearGradient extends CIFilterProtocol {

	color0: CIColor;

	color1: CIColor;

	point0: CGPoint;

	point1: CGPoint;
}
declare var CILinearGradient: {

	prototype: CILinearGradient;

	customAttributes?(): NSDictionary<string, any>;
};

interface CILinearToSRGBToneCurve extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CILinearToSRGBToneCurve: {

	prototype: CILinearToSRGBToneCurve;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMaskToAlpha extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIMaskToAlpha: {

	prototype: CIMaskToAlpha;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMaskedVariableBlur extends CIFilterProtocol {

	inputImage: CIImage;

	mask: CIImage;

	radius: number;
}
declare var CIMaskedVariableBlur: {

	prototype: CIMaskedVariableBlur;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMaximumComponent extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIMaximumComponent: {

	prototype: CIMaximumComponent;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMedian extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIMedian: {

	prototype: CIMedian;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMeshGenerator extends CIFilterProtocol {

	color: CIColor;

	mesh: NSArray<any>;

	width: number;
}
declare var CIMeshGenerator: {

	prototype: CIMeshGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMinimumComponent extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIMinimumComponent: {

	prototype: CIMinimumComponent;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMix extends CIFilterProtocol {

	amount: number;

	backgroundImage: CIImage;

	inputImage: CIImage;
}
declare var CIMix: {

	prototype: CIMix;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIModTransition extends CITransitionFilter {

	angle: number;

	center: CGPoint;

	compression: number;

	radius: number;
}
declare var CIModTransition: {

	prototype: CIModTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMorphologyGradient extends CIFilterProtocol {

	inputImage: CIImage;

	radius: number;
}
declare var CIMorphologyGradient: {

	prototype: CIMorphologyGradient;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMorphologyMaximum extends CIFilterProtocol {

	inputImage: CIImage;

	radius: number;
}
declare var CIMorphologyMaximum: {

	prototype: CIMorphologyMaximum;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMorphologyMinimum extends CIFilterProtocol {

	inputImage: CIImage;

	radius: number;
}
declare var CIMorphologyMinimum: {

	prototype: CIMorphologyMinimum;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMorphologyRectangleMaximum extends CIFilterProtocol {

	height: number;

	inputImage: CIImage;

	width: number;
}
declare var CIMorphologyRectangleMaximum: {

	prototype: CIMorphologyRectangleMaximum;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMorphologyRectangleMinimum extends CIFilterProtocol {

	height: number;

	inputImage: CIImage;

	width: number;
}
declare var CIMorphologyRectangleMinimum: {

	prototype: CIMorphologyRectangleMinimum;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIMotionBlur extends CIFilterProtocol {

	angle: number;

	inputImage: CIImage;

	radius: number;
}
declare var CIMotionBlur: {

	prototype: CIMotionBlur;

	customAttributes?(): NSDictionary<string, any>;
};

interface CINoiseReduction extends CIFilterProtocol {

	inputImage: CIImage;

	noiseLevel: number;

	sharpness: number;
}
declare var CINoiseReduction: {

	prototype: CINoiseReduction;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIOpTile extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	scale: number;

	width: number;
}
declare var CIOpTile: {

	prototype: CIOpTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPDF417BarcodeGenerator extends CIFilterProtocol {

	alwaysSpecifyCompaction: number;

	compactStyle: number;

	compactionMode: number;

	correctionLevel: number;

	dataColumns: number;

	maxHeight: number;

	maxWidth: number;

	message: NSData;

	minHeight: number;

	minWidth: number;

	preferredAspectRatio: number;

	rows: number;
}
declare var CIPDF417BarcodeGenerator: {

	prototype: CIPDF417BarcodeGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIPDF417CodeDescriptor extends CIBarcodeDescriptor {

	static alloc(): CIPDF417CodeDescriptor; // inherited from NSObject

	static descriptorWithPayloadIsCompactRowCountColumnCount(errorCorrectedPayload: NSData, isCompact: boolean, rowCount: number, columnCount: number): CIPDF417CodeDescriptor;

	static new(): CIPDF417CodeDescriptor; // inherited from NSObject

	readonly columnCount: number;

	readonly errorCorrectedPayload: NSData;

	readonly isCompact: boolean;

	readonly rowCount: number;

	constructor(o: { payload: NSData; isCompact: boolean; rowCount: number; columnCount: number; });

	initWithPayloadIsCompactRowCountColumnCount(errorCorrectedPayload: NSData, isCompact: boolean, rowCount: number, columnCount: number): this;
}

interface CIPageCurlTransition extends CITransitionFilter {

	angle: number;

	backsideImage: CIImage;

	extent: CGRect;

	radius: number;

	shadingImage: CIImage;
}
declare var CIPageCurlTransition: {

	prototype: CIPageCurlTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPageCurlWithShadowTransition extends CITransitionFilter {

	angle: number;

	backsideImage: CIImage;

	extent: CGRect;

	radius: number;

	shadowAmount: number;

	shadowExtent: CGRect;

	shadowSize: number;
}
declare var CIPageCurlWithShadowTransition: {

	prototype: CIPageCurlWithShadowTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPaletteCentroid extends CIFilterProtocol {

	inputImage: CIImage;

	paletteImage: CIImage;

	perceptual: boolean;
}
declare var CIPaletteCentroid: {

	prototype: CIPaletteCentroid;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPalettize extends CIFilterProtocol {

	inputImage: CIImage;

	paletteImage: CIImage;

	perceptual: boolean;
}
declare var CIPalettize: {

	prototype: CIPalettize;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIParallelogramTile extends CIFilterProtocol {

	acuteAngle: number;

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	width: number;
}
declare var CIParallelogramTile: {

	prototype: CIParallelogramTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPerspectiveCorrection extends CIFourCoordinateGeometryFilter {

	crop: boolean;
}
declare var CIPerspectiveCorrection: {

	prototype: CIPerspectiveCorrection;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPerspectiveRotate extends CIFilterProtocol {

	focalLength: number;

	inputImage: CIImage;

	pitch: number;

	roll: number;

	yaw: number;
}
declare var CIPerspectiveRotate: {

	prototype: CIPerspectiveRotate;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPerspectiveTile extends CIFilterProtocol {

	bottomLeft: CGPoint;

	bottomRight: CGPoint;

	inputImage: CIImage;

	topLeft: CGPoint;

	topRight: CGPoint;
}
declare var CIPerspectiveTile: {

	prototype: CIPerspectiveTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPerspectiveTransform extends CIFourCoordinateGeometryFilter {
}
declare var CIPerspectiveTransform: {

	prototype: CIPerspectiveTransform;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPerspectiveTransformWithExtent extends CIFourCoordinateGeometryFilter {

	extent: CGRect;
}
declare var CIPerspectiveTransformWithExtent: {

	prototype: CIPerspectiveTransformWithExtent;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPhotoEffect extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIPhotoEffect: {

	prototype: CIPhotoEffect;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPixellate extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	scale: number;
}
declare var CIPixellate: {

	prototype: CIPixellate;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPointillize extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	radius: number;
}
declare var CIPointillize: {

	prototype: CIPointillize;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIQRCodeDescriptor extends CIBarcodeDescriptor {

	static alloc(): CIQRCodeDescriptor; // inherited from NSObject

	static descriptorWithPayloadSymbolVersionMaskPatternErrorCorrectionLevel(errorCorrectedPayload: NSData, symbolVersion: number, maskPattern: number, errorCorrectionLevel: CIQRCodeErrorCorrectionLevel): CIQRCodeDescriptor;

	static new(): CIQRCodeDescriptor; // inherited from NSObject

	readonly errorCorrectedPayload: NSData;

	readonly errorCorrectionLevel: CIQRCodeErrorCorrectionLevel;

	readonly maskPattern: number;

	readonly symbolVersion: number;

	constructor(o: { payload: NSData; symbolVersion: number; maskPattern: number; errorCorrectionLevel: CIQRCodeErrorCorrectionLevel; });

	initWithPayloadSymbolVersionMaskPatternErrorCorrectionLevel(errorCorrectedPayload: NSData, symbolVersion: number, maskPattern: number, errorCorrectionLevel: CIQRCodeErrorCorrectionLevel): this;
}

declare const enum CIQRCodeErrorCorrectionLevel {

	L = 76,

	M = 77,

	Q = 81,

	H = 72
}

declare class CIQRCodeFeature extends CIFeature implements NSCopying, NSSecureCoding {

	static alloc(): CIQRCodeFeature; // inherited from NSObject

	static new(): CIQRCodeFeature; // inherited from NSObject

	readonly bottomLeft: CGPoint;

	readonly bottomRight: CGPoint;

	readonly messageString: string;

	readonly symbolDescriptor: CIQRCodeDescriptor;

	readonly topLeft: CGPoint;

	readonly topRight: CGPoint;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

interface CIQRCodeGenerator extends CIFilterProtocol {

	correctionLevel: string;

	message: NSData;
}
declare var CIQRCodeGenerator: {

	prototype: CIQRCodeGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIRadialGradient extends CIFilterProtocol {

	center: CGPoint;

	color0: CIColor;

	color1: CIColor;

	radius0: number;

	radius1: number;
}
declare var CIRadialGradient: {

	prototype: CIRadialGradient;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIRandomGenerator extends CIFilterProtocol {
}
declare var CIRandomGenerator: {

	prototype: CIRandomGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIRectangleFeature extends CIFeature {

	static alloc(): CIRectangleFeature; // inherited from NSObject

	static new(): CIRectangleFeature; // inherited from NSObject

	readonly bottomLeft: CGPoint;

	readonly bottomRight: CGPoint;

	readonly topLeft: CGPoint;

	readonly topRight: CGPoint;
}

declare class CIRenderDestination extends NSObject {

	static alloc(): CIRenderDestination; // inherited from NSObject

	static new(): CIRenderDestination; // inherited from NSObject

	alphaMode: CIRenderDestinationAlphaMode;

	blendKernel: CIBlendKernel;

	blendsInDestinationColorSpace: boolean;

	clamped: boolean;

	colorSpace: any;

	dithered: boolean;

	flipped: boolean;

	readonly height: number;

	readonly width: number;

	constructor(o: { bitmapData: interop.Pointer | interop.Reference<any>; width: number; height: number; bytesPerRow: number; format: number; });

	constructor(o: { GLTexture: number; target: number; width: number; height: number; });

	constructor(o: { IOSurface: IOSurface; });

	constructor(o: { MTLTexture: MTLTexture; commandBuffer: MTLCommandBuffer; });

	constructor(o: { pixelBuffer: any; });

	constructor(o: { width: number; height: number; pixelFormat: MTLPixelFormat; commandBuffer: MTLCommandBuffer; mtlTextureProvider: () => MTLTexture; });

	initWithBitmapDataWidthHeightBytesPerRowFormat(data: interop.Pointer | interop.Reference<any>, width: number, height: number, bytesPerRow: number, format: number): this;

	initWithGLTextureTargetWidthHeight(texture: number, target: number, width: number, height: number): this;

	initWithIOSurface(surface: IOSurface): this;

	initWithMTLTextureCommandBuffer(texture: MTLTexture, commandBuffer: MTLCommandBuffer): this;

	initWithPixelBuffer(pixelBuffer: any): this;

	initWithWidthHeightPixelFormatCommandBufferMtlTextureProvider(width: number, height: number, pixelFormat: MTLPixelFormat, commandBuffer: MTLCommandBuffer, block: () => MTLTexture): this;
}

declare const enum CIRenderDestinationAlphaMode {

	None = 0,

	Premultiplied = 1,

	Unpremultiplied = 2
}

declare class CIRenderInfo extends NSObject {

	static alloc(): CIRenderInfo; // inherited from NSObject

	static new(): CIRenderInfo; // inherited from NSObject

	readonly kernelExecutionTime: number;

	readonly passCount: number;

	readonly pixelsProcessed: number;
}

declare class CIRenderTask extends NSObject {

	static alloc(): CIRenderTask; // inherited from NSObject

	static new(): CIRenderTask; // inherited from NSObject

	waitUntilCompletedAndReturnError(): CIRenderInfo;
}

interface CIRippleTransition extends CITransitionFilter {

	center: CGPoint;

	extent: CGRect;

	scale: number;

	shadingImage: CIImage;

	width: number;
}
declare var CIRippleTransition: {

	prototype: CIRippleTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIRoundedRectangleGenerator extends CIFilterProtocol {

	color: CIColor;

	extent: CGRect;

	radius: number;
}
declare var CIRoundedRectangleGenerator: {

	prototype: CIRoundedRectangleGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CISRGBToneCurveToLinear extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CISRGBToneCurveToLinear: {

	prototype: CISRGBToneCurveToLinear;

	customAttributes?(): NSDictionary<string, any>;
};

interface CISaliencyMap extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CISaliencyMap: {

	prototype: CISaliencyMap;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CISampler extends NSObject implements NSCopying {

	static alloc(): CISampler; // inherited from NSObject

	static new(): CISampler; // inherited from NSObject

	static samplerWithImage(im: CIImage): CISampler;

	static samplerWithImageKeysAndValues(im: CIImage, key0: any): CISampler;

	static samplerWithImageOptions(im: CIImage, dict: NSDictionary<any, any>): CISampler;

	readonly definition: CIFilterShape;

	readonly extent: CGRect;

	constructor(o: { image: CIImage; });

	constructor(o: { image: CIImage; options: NSDictionary<any, any>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithImage(im: CIImage): this;

	initWithImageOptions(im: CIImage, dict: NSDictionary<any, any>): this;
}

interface CISepiaTone extends CIFilterProtocol {

	inputImage: CIImage;

	intensity: number;
}
declare var CISepiaTone: {

	prototype: CISepiaTone;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIShadedMaterial extends CIFilterProtocol {

	inputImage: CIImage;

	scale: number;

	shadingImage: CIImage;
}
declare var CIShadedMaterial: {

	prototype: CIShadedMaterial;

	customAttributes?(): NSDictionary<string, any>;
};

interface CISharpenLuminance extends CIFilterProtocol {

	inputImage: CIImage;

	radius: number;

	sharpness: number;
}
declare var CISharpenLuminance: {

	prototype: CISharpenLuminance;

	customAttributes?(): NSDictionary<string, any>;
};

interface CISixfoldReflectedTile extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	width: number;
}
declare var CISixfoldReflectedTile: {

	prototype: CISixfoldReflectedTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CISixfoldRotatedTile extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	width: number;
}
declare var CISixfoldRotatedTile: {

	prototype: CISixfoldRotatedTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CISmoothLinearGradient extends CIFilterProtocol {

	color0: CIColor;

	color1: CIColor;

	point0: CGPoint;

	point1: CGPoint;
}
declare var CISmoothLinearGradient: {

	prototype: CISmoothLinearGradient;

	customAttributes?(): NSDictionary<string, any>;
};

interface CISpotColor extends CIFilterProtocol {

	centerColor1: CIColor;

	centerColor2: CIColor;

	centerColor3: CIColor;

	closeness1: number;

	closeness2: number;

	closeness3: number;

	contrast1: number;

	contrast2: number;

	contrast3: number;

	inputImage: CIImage;

	replacementColor1: CIColor;

	replacementColor2: CIColor;

	replacementColor3: CIColor;
}
declare var CISpotColor: {

	prototype: CISpotColor;

	customAttributes?(): NSDictionary<string, any>;
};

interface CISpotLight extends CIFilterProtocol {

	brightness: number;

	color: CIColor;

	concentration: number;

	inputImage: CIImage;

	lightPointsAt: CIVector;

	lightPosition: CIVector;
}
declare var CISpotLight: {

	prototype: CISpotLight;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIStarShineGenerator extends CIFilterProtocol {

	center: CGPoint;

	color: CIColor;

	crossAngle: number;

	crossOpacity: number;

	crossScale: number;

	crossWidth: number;

	epsilon: number;

	radius: number;
}
declare var CIStarShineGenerator: {

	prototype: CIStarShineGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIStraighten extends CIFilterProtocol {

	angle: number;

	inputImage: CIImage;
}
declare var CIStraighten: {

	prototype: CIStraighten;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIStripesGenerator extends CIFilterProtocol {

	center: CGPoint;

	color0: CIColor;

	color1: CIColor;

	sharpness: number;

	width: number;
}
declare var CIStripesGenerator: {

	prototype: CIStripesGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CISunbeamsGenerator extends CIFilterProtocol {

	center: CGPoint;

	color: CIColor;

	maxStriationRadius: number;

	striationContrast: number;

	striationStrength: number;

	sunRadius: number;

	time: number;
}
declare var CISunbeamsGenerator: {

	prototype: CISunbeamsGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CISwipeTransition extends CITransitionFilter {

	angle: number;

	color: CIColor;

	extent: CGRect;

	opacity: number;

	width: number;
}
declare var CISwipeTransition: {

	prototype: CISwipeTransition;

	customAttributes?(): NSDictionary<string, any>;
};

interface CITemperatureAndTint extends CIFilterProtocol {

	inputImage: CIImage;

	neutral: CIVector;

	targetNeutral: CIVector;
}
declare var CITemperatureAndTint: {

	prototype: CITemperatureAndTint;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CITextFeature extends CIFeature {

	static alloc(): CITextFeature; // inherited from NSObject

	static new(): CITextFeature; // inherited from NSObject

	readonly bottomLeft: CGPoint;

	readonly bottomRight: CGPoint;

	readonly subFeatures: NSArray<any>;

	readonly topLeft: CGPoint;

	readonly topRight: CGPoint;
}

interface CITextImageGenerator extends CIFilterProtocol {

	fontName: string;

	fontSize: number;

	scaleFactor: number;

	text: string;
}
declare var CITextImageGenerator: {

	prototype: CITextImageGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIThermal extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIThermal: {

	prototype: CIThermal;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIToneCurve extends CIFilterProtocol {

	inputImage: CIImage;

	point0: CGPoint;

	point1: CGPoint;

	point2: CGPoint;

	point3: CGPoint;

	point4: CGPoint;
}
declare var CIToneCurve: {

	prototype: CIToneCurve;

	customAttributes?(): NSDictionary<string, any>;
};

interface CITransitionFilter extends CIFilterProtocol {

	inputImage: CIImage;

	targetImage: CIImage;

	time: number;
}
declare var CITransitionFilter: {

	prototype: CITransitionFilter;

	customAttributes?(): NSDictionary<string, any>;
};

interface CITriangleKaleidoscope extends CIFilterProtocol {

	decay: number;

	inputImage: CIImage;

	point: CGPoint;

	rotation: number;

	size: number;
}
declare var CITriangleKaleidoscope: {

	prototype: CITriangleKaleidoscope;

	customAttributes?(): NSDictionary<string, any>;
};

interface CITriangleTile extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	width: number;
}
declare var CITriangleTile: {

	prototype: CITriangleTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CITwelvefoldReflectedTile extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	width: number;
}
declare var CITwelvefoldReflectedTile: {

	prototype: CITwelvefoldReflectedTile;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIUnsharpMask extends CIFilterProtocol {

	inputImage: CIImage;

	intensity: number;

	radius: number;
}
declare var CIUnsharpMask: {

	prototype: CIUnsharpMask;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIVector extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIVector; // inherited from NSObject

	static new(): CIVector; // inherited from NSObject

	static vectorWithCGAffineTransform(t: CGAffineTransform): CIVector;

	static vectorWithCGPoint(p: CGPoint): CIVector;

	static vectorWithCGRect(r: CGRect): CIVector;

	static vectorWithString(representation: string): CIVector;

	static vectorWithValuesCount(values: interop.Pointer | interop.Reference<number>, count: number): CIVector;

	static vectorWithX(x: number): CIVector;

	static vectorWithXY(x: number, y: number): CIVector;

	static vectorWithXYZ(x: number, y: number, z: number): CIVector;

	static vectorWithXYZW(x: number, y: number, z: number, w: number): CIVector;

	readonly CGAffineTransformValue: CGAffineTransform;

	readonly CGPointValue: CGPoint;

	readonly CGRectValue: CGRect;

	readonly W: number;

	readonly X: number;

	readonly Y: number;

	readonly Z: number;

	readonly count: number;

	readonly stringRepresentation: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { CGAffineTransform: CGAffineTransform; });

	constructor(o: { CGPoint: CGPoint; });

	constructor(o: { CGRect: CGRect; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { string: string; });

	constructor(o: { values: interop.Pointer | interop.Reference<number>; count: number; });

	constructor(o: { x: number; });

	constructor(o: { x: number; y: number; });

	constructor(o: { x: number; y: number; z: number; });

	constructor(o: { x: number; y: number; z: number; w: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCGAffineTransform(r: CGAffineTransform): this;

	initWithCGPoint(p: CGPoint): this;

	initWithCGRect(r: CGRect): this;

	initWithCoder(coder: NSCoder): this;

	initWithString(representation: string): this;

	initWithValuesCount(values: interop.Pointer | interop.Reference<number>, count: number): this;

	initWithX(x: number): this;

	initWithXY(x: number, y: number): this;

	initWithXYZ(x: number, y: number, z: number): this;

	initWithXYZW(x: number, y: number, z: number, w: number): this;

	valueAtIndex(index: number): number;
}

interface CIVibrance extends CIFilterProtocol {

	amount: number;

	inputImage: CIImage;
}
declare var CIVibrance: {

	prototype: CIVibrance;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIVignette extends CIFilterProtocol {

	inputImage: CIImage;

	intensity: number;

	radius: number;
}
declare var CIVignette: {

	prototype: CIVignette;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIVignetteEffect extends CIFilterProtocol {

	center: CGPoint;

	falloff: number;

	inputImage: CIImage;

	intensity: number;

	radius: number;
}
declare var CIVignetteEffect: {

	prototype: CIVignetteEffect;

	customAttributes?(): NSDictionary<string, any>;
};

declare class CIWarpKernel extends CIKernel {

	static alloc(): CIWarpKernel; // inherited from NSObject

	static kernelWithFunctionNameFromMetalLibraryDataError(name: string, data: NSData): CIWarpKernel; // inherited from CIKernel

	static kernelWithFunctionNameFromMetalLibraryDataOutputPixelFormatError(name: string, data: NSData, format: number): CIWarpKernel; // inherited from CIKernel

	static kernelWithString(string: string): CIWarpKernel; // inherited from CIKernel

	static new(): CIWarpKernel; // inherited from NSObject

	applyWithExtentRoiCallbackInputImageArguments(extent: CGRect, callback: (p1: number, p2: CGRect) => CGRect, image: CIImage, args: NSArray<any> | any[]): CIImage;
}

interface CIWhitePointAdjust extends CIFilterProtocol {

	color: CIColor;

	inputImage: CIImage;
}
declare var CIWhitePointAdjust: {

	prototype: CIWhitePointAdjust;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIXRay extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIXRay: {

	prototype: CIXRay;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIZoomBlur extends CIFilterProtocol {

	amount: number;

	center: CGPoint;

	inputImage: CIImage;
}
declare var CIZoomBlur: {

	prototype: CIZoomBlur;

	customAttributes?(): NSDictionary<string, any>;
};

declare var kCIActiveKeys: string;

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

declare var kCIContextAllowLowPower: string;

declare var kCIContextCacheIntermediates: string;

declare var kCIContextHighQualityDownsample: string;

declare var kCIContextOutputColorSpace: string;

declare var kCIContextOutputPremultiplied: string;

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

declare var kCIFormatL16: number;

declare var kCIFormatL8: number;

declare var kCIFormatLA16: number;

declare var kCIFormatLA8: number;

declare var kCIFormatLAf: number;

declare var kCIFormatLAh: number;

declare var kCIFormatLf: number;

declare var kCIFormatLh: number;

declare var kCIFormatR16: number;

declare var kCIFormatR8: number;

declare var kCIFormatRG16: number;

declare var kCIFormatRG8: number;

declare var kCIFormatRGBA16: number;

declare var kCIFormatRGBA8: number;

declare var kCIFormatRGBAf: number;

declare var kCIFormatRGBAh: number;

declare var kCIFormatRGf: number;

declare var kCIFormatRGh: number;

declare var kCIFormatRf: number;

declare var kCIFormatRh: number;

declare var kCIImageApplyOrientationProperty: string;

declare var kCIImageAutoAdjustCrop: string;

declare var kCIImageAutoAdjustEnhance: string;

declare var kCIImageAutoAdjustFeatures: string;

declare var kCIImageAutoAdjustLevel: string;

declare var kCIImageAutoAdjustRedEye: string;

declare var kCIImageAuxiliaryDepth: string;

declare var kCIImageAuxiliaryDisparity: string;

declare var kCIImageAuxiliaryPortraitEffectsMatte: string;

declare var kCIImageAuxiliarySemanticSegmentationHairMatte: string;

declare var kCIImageAuxiliarySemanticSegmentationSkinMatte: string;

declare var kCIImageAuxiliarySemanticSegmentationTeethMatte: string;

declare var kCIImageColorSpace: string;

declare var kCIImageNearestSampling: string;

declare var kCIImageProperties: string;

declare var kCIImageProviderTileSize: string;

declare var kCIImageProviderUserInfo: string;

declare var kCIImageRepresentationAVDepthData: string;

declare var kCIImageRepresentationAVPortraitEffectsMatte: string;

declare var kCIImageRepresentationAVSemanticSegmentationMattes: string;

declare var kCIImageRepresentationDepthImage: string;

declare var kCIImageRepresentationDisparityImage: string;

declare var kCIImageRepresentationPortraitEffectsMatteImage: string;

declare var kCIImageRepresentationSemanticSegmentationHairMatteImage: string;

declare var kCIImageRepresentationSemanticSegmentationSkinMatteImage: string;

declare var kCIImageRepresentationSemanticSegmentationTeethMatteImage: string;

declare var kCIInputAllowDraftModeKey: string;

declare var kCIInputAmountKey: string;

declare var kCIInputAngleKey: string;

declare var kCIInputAspectRatioKey: string;

declare var kCIInputBackgroundImageKey: string;

declare var kCIInputBaselineExposureKey: string;

declare var kCIInputBiasKey: string;

declare var kCIInputBoostKey: string;

declare var kCIInputBoostShadowAmountKey: string;

declare var kCIInputBrightnessKey: string;

declare var kCIInputCenterKey: string;

declare var kCIInputColorKey: string;

declare var kCIInputColorNoiseReductionAmountKey: string;

declare var kCIInputContrastKey: string;

declare var kCIInputDecoderVersionKey: string;

declare var kCIInputDepthImageKey: string;

declare var kCIInputDisableGamutMapKey: string;

declare var kCIInputDisparityImageKey: string;

declare var kCIInputEVKey: string;

declare var kCIInputEnableChromaticNoiseTrackingKey: string;

declare var kCIInputEnableEDRModeKey: string;

declare var kCIInputEnableSharpeningKey: string;

declare var kCIInputEnableVendorLensCorrectionKey: string;

declare var kCIInputExtentKey: string;

declare var kCIInputGradientImageKey: string;

declare var kCIInputIgnoreImageOrientationKey: string;

declare var kCIInputImageKey: string;

declare var kCIInputImageOrientationKey: string;

declare var kCIInputIntensityKey: string;

declare var kCIInputLinearSpaceFilter: string;

declare var kCIInputLuminanceNoiseReductionAmountKey: string;

declare var kCIInputMaskImageKey: string;

declare var kCIInputMatteImageKey: string;

declare var kCIInputMoireAmountKey: string;

declare var kCIInputNeutralChromaticityXKey: string;

declare var kCIInputNeutralChromaticityYKey: string;

declare var kCIInputNeutralLocationKey: string;

declare var kCIInputNeutralTemperatureKey: string;

declare var kCIInputNeutralTintKey: string;

declare var kCIInputNoiseReductionAmountKey: string;

declare var kCIInputNoiseReductionContrastAmountKey: string;

declare var kCIInputNoiseReductionDetailAmountKey: string;

declare var kCIInputNoiseReductionSharpnessAmountKey: string;

declare var kCIInputRadiusKey: string;

declare var kCIInputRefractionKey: string;

declare var kCIInputSaturationKey: string;

declare var kCIInputScaleFactorKey: string;

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

declare var kCIOutputNativeSizeKey: string;

declare var kCISamplerAffineMatrix: string;

declare var kCISamplerColorSpace: string;

declare var kCISamplerFilterLinear: string;

declare var kCISamplerFilterMode: string;

declare var kCISamplerFilterNearest: string;

declare var kCISamplerWrapBlack: string;

declare var kCISamplerWrapClamp: string;

declare var kCISamplerWrapMode: string;

declare var kCISupportedDecoderVersionsKey: string;

declare var kCIUIParameterSet: string;

declare var kCIUISetAdvanced: string;

declare var kCIUISetBasic: string;

declare var kCIUISetDevelopment: string;

declare var kCIUISetIntermediate: string;
