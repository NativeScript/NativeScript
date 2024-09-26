
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

interface CIAreaAverage extends CIAreaReductionFilter {
}
declare var CIAreaAverage: {

	prototype: CIAreaAverage;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAreaBoundsRed extends CIAreaReductionFilter {
}
declare var CIAreaBoundsRed: {

	prototype: CIAreaBoundsRed;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAreaHistogram extends CIAreaReductionFilter {

	count: number;

	scale: number;
}
declare var CIAreaHistogram: {

	prototype: CIAreaHistogram;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAreaLogarithmicHistogram extends CIAreaReductionFilter {

	count: number;

	maximumStop: number;

	minimumStop: number;

	scale: number;
}
declare var CIAreaLogarithmicHistogram: {

	prototype: CIAreaLogarithmicHistogram;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAreaMaximum extends CIAreaReductionFilter {
}
declare var CIAreaMaximum: {

	prototype: CIAreaMaximum;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAreaMaximumAlpha extends CIAreaReductionFilter {
}
declare var CIAreaMaximumAlpha: {

	prototype: CIAreaMaximumAlpha;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAreaMinMax extends CIAreaReductionFilter {
}
declare var CIAreaMinMax: {

	prototype: CIAreaMinMax;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAreaMinMaxRed extends CIAreaReductionFilter {
}
declare var CIAreaMinMaxRed: {

	prototype: CIAreaMinMaxRed;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAreaMinimum extends CIAreaReductionFilter {
}
declare var CIAreaMinimum: {

	prototype: CIAreaMinimum;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAreaMinimumAlpha extends CIAreaReductionFilter {
}
declare var CIAreaMinimumAlpha: {

	prototype: CIAreaMinimumAlpha;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAreaReductionFilter extends CIFilterProtocol {

	extent: CGRect;

	inputImage: CIImage;
}
declare var CIAreaReductionFilter: {

	prototype: CIAreaReductionFilter;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIAttributedTextImageGenerator extends CIFilterProtocol {

	/**
	 * @since 16.0
	 */
	padding: number;

	scaleFactor: number;

	text: NSAttributedString;
}
declare var CIAttributedTextImageGenerator: {

	prototype: CIAttributedTextImageGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

/**
 * @since 11.0
 */
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

/**
 * @since 11.0
 */
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

/**
 * @since 11.0
 */
declare class CIBlendKernel extends CIColorKernel {

	static alloc(): CIBlendKernel; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static kernelWithFunctionNameFromMetalLibraryDataError(name: string, data: NSData): CIBlendKernel; // inherited from CIKernel

	/**
	 * @since 11.0
	 */
	static kernelWithFunctionNameFromMetalLibraryDataOutputPixelFormatError(name: string, data: NSData, format: number): CIBlendKernel; // inherited from CIKernel

	/**
	 * @since 8.0
	 * @deprecated 12.0
	 */
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

	/**
	 * @since 13.0
	 */
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

interface CIBlurredRectangleGenerator extends CIFilterProtocol {

	color: CIColor;

	extent: CGRect;

	sigma: number;
}
declare var CIBlurredRectangleGenerator: {

	prototype: CIBlurredRectangleGenerator;

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

interface CIBumpDistortion extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	radius: number;

	scale: number;
}
declare var CIBumpDistortion: {

	prototype: CIBumpDistortion;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIBumpDistortionLinear extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	radius: number;

	scale: number;
}
declare var CIBumpDistortionLinear: {

	prototype: CIBumpDistortionLinear;

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

interface CICannyEdgeDetector extends CIFilterProtocol {

	gaussianSigma: number;

	hysteresisPasses: number;

	inputImage: CIImage;

	perceptual: boolean;

	thresholdHigh: number;

	thresholdLow: number;
}
declare var CICannyEdgeDetector: {

	prototype: CICannyEdgeDetector;

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

interface CICircleSplashDistortion extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	radius: number;
}
declare var CICircleSplashDistortion: {

	prototype: CICircleSplashDistortion;

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

interface CICircularWrap extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	radius: number;
}
declare var CICircularWrap: {

	prototype: CICircularWrap;

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

/**
 * @since 5.0
 */
declare class CIColor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIColor; // inherited from NSObject

	static colorWithCGColor(c: any): CIColor;

	static colorWithRedGreenBlue(r: number, g: number, b: number): CIColor;

	static colorWithRedGreenBlueAlpha(r: number, g: number, b: number, a: number): CIColor;

	/**
	 * @since 10.0
	 */
	static colorWithRedGreenBlueAlphaColorSpace(r: number, g: number, b: number, a: number, colorSpace: any): CIColor;

	/**
	 * @since 10.0
	 */
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

	/**
	 * @since 10.0
	 */
	static readonly blackColor: CIColor;

	/**
	 * @since 10.0
	 */
	static readonly blueColor: CIColor;

	/**
	 * @since 10.0
	 */
	static readonly clearColor: CIColor;

	/**
	 * @since 10.0
	 */
	static readonly cyanColor: CIColor;

	/**
	 * @since 10.0
	 */
	static readonly grayColor: CIColor;

	/**
	 * @since 10.0
	 */
	static readonly greenColor: CIColor;

	/**
	 * @since 10.0
	 */
	static readonly magentaColor: CIColor;

	/**
	 * @since 10.0
	 */
	static readonly redColor: CIColor;

	/**
	 * @since 10.0
	 */
	static readonly whiteColor: CIColor;

	/**
	 * @since 10.0
	 */
	static readonly yellowColor: CIColor;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { CGColor: any; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 5.0
	 */
	constructor(o: { color: UIColor; });

	/**
	 * @since 9.0
	 */
	constructor(o: { red: number; green: number; blue: number; });

	constructor(o: { red: number; green: number; blue: number; alpha: number; });

	/**
	 * @since 10.0
	 */
	constructor(o: { red: number; green: number; blue: number; alpha: number; colorSpace: any; });

	/**
	 * @since 10.0
	 */
	constructor(o: { red: number; green: number; blue: number; colorSpace: any; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCGColor(c: any): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 5.0
	 */
	initWithColor(color: UIColor): this;

	/**
	 * @since 9.0
	 */
	initWithRedGreenBlue(r: number, g: number, b: number): this;

	initWithRedGreenBlueAlpha(r: number, g: number, b: number, a: number): this;

	/**
	 * @since 10.0
	 */
	initWithRedGreenBlueAlphaColorSpace(r: number, g: number, b: number, a: number, colorSpace: any): this;

	/**
	 * @since 10.0
	 */
	initWithRedGreenBlueColorSpace(r: number, g: number, b: number, colorSpace: any): this;
}

interface CIColorAbsoluteDifference extends CIFilterProtocol {

	inputImage: CIImage;

	inputImage2: CIImage;
}
declare var CIColorAbsoluteDifference: {

	prototype: CIColorAbsoluteDifference;

	customAttributes?(): NSDictionary<string, any>;
};

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

	/**
	 * @since 16.0
	 */
	extrapolate: boolean;

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

	/**
	 * @since 16.0
	 */
	extrapolate: boolean;

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

	/**
	 * @since 16.0
	 */
	extrapolate: boolean;

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

/**
 * @since 8.0
 */
declare class CIColorKernel extends CIKernel {

	static alloc(): CIColorKernel; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static kernelWithFunctionNameFromMetalLibraryDataError(name: string, data: NSData): CIColorKernel; // inherited from CIKernel

	/**
	 * @since 11.0
	 */
	static kernelWithFunctionNameFromMetalLibraryDataOutputPixelFormatError(name: string, data: NSData, format: number): CIColorKernel; // inherited from CIKernel

	/**
	 * @since 8.0
	 * @deprecated 12.0
	 */
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

interface CIColorThreshold extends CIFilterProtocol {

	inputImage: CIImage;

	threshold: number;
}
declare var CIColorThreshold: {

	prototype: CIColorThreshold;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColorThresholdOtsu extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CIColorThresholdOtsu: {

	prototype: CIColorThresholdOtsu;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIColumnAverage extends CIAreaReductionFilter {
}
declare var CIColumnAverage: {

	prototype: CIColumnAverage;

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

/**
 * @since 5.0
 */
declare class CIContext extends NSObject {

	static alloc(): CIContext; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	static context(): CIContext;

	/**
	 * @since 9.0
	 */
	static contextWithCGContextOptions(cgctx: any, options: NSDictionary<string, any>): CIContext;

	/**
	 * @since 5.0
	 * @deprecated 12.0
	 */
	static contextWithEAGLContext(eaglContext: EAGLContext): CIContext;

	/**
	 * @since 5.0
	 * @deprecated 12.0
	 */
	static contextWithEAGLContextOptions(eaglContext: EAGLContext, options: NSDictionary<string, any>): CIContext;

	/**
	 * @since 13.0
	 */
	static contextWithMTLCommandQueue(commandQueue: MTLCommandQueue): CIContext;

	/**
	 * @since 13.0
	 */
	static contextWithMTLCommandQueueOptions(commandQueue: MTLCommandQueue, options: NSDictionary<string, any>): CIContext;

	/**
	 * @since 9.0
	 */
	static contextWithMTLDevice(device: MTLDevice): CIContext;

	/**
	 * @since 9.0
	 */
	static contextWithMTLDeviceOptions(device: MTLDevice, options: NSDictionary<string, any>): CIContext;

	/**
	 * @since 5.0
	 */
	static contextWithOptions(options: NSDictionary<string, any>): CIContext;

	static new(): CIContext; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly workingColorSpace: any;

	/**
	 * @since 9.0
	 */
	readonly workingFormat: number;

	/**
	 * @since 5.0
	 */
	constructor(o: { options: NSDictionary<string, any>; });

	/**
	 * @since 15.0
	 */
	HEIF10RepresentationOfImageColorSpaceOptionsError(image: CIImage, colorSpace: any, options: NSDictionary<string, any>): NSData;

	/**
	 * @since 11.0
	 */
	HEIFRepresentationOfImageFormatColorSpaceOptions(image: CIImage, format: number, colorSpace: any, options: NSDictionary<string, any>): NSData;

	/**
	 * @since 10.0
	 */
	JPEGRepresentationOfImageColorSpaceOptions(image: CIImage, colorSpace: any, options: NSDictionary<string, any>): NSData;

	/**
	 * @since 17.0
	 */
	OpenEXRRepresentationOfImageOptionsError(image: CIImage, options: NSDictionary<string, any>): NSData;

	/**
	 * @since 11.0
	 */
	PNGRepresentationOfImageFormatColorSpaceOptions(image: CIImage, format: number, colorSpace: any, options: NSDictionary<string, any>): NSData;

	/**
	 * @since 10.0
	 */
	TIFFRepresentationOfImageFormatColorSpaceOptions(image: CIImage, format: number, colorSpace: any, options: NSDictionary<string, any>): NSData;

	/**
	 * @since 10.0
	 */
	clearCaches(): void;

	createCGImageFromRect(image: CIImage, fromRect: CGRect): any;

	createCGImageFromRectFormatColorSpace(image: CIImage, fromRect: CGRect, format: number, colorSpace: any): any;

	/**
	 * @since 10.0
	 */
	createCGImageFromRectFormatColorSpaceDeferred(image: CIImage, fromRect: CGRect, format: number, colorSpace: any, deferred: boolean): any;

	/**
	 * @since 12.0
	 */
	depthBlurEffectFilterForImageDataOptions(data: NSData, options: NSDictionary<any, any>): CIFilter;

	/**
	 * @since 14.1
	 */
	depthBlurEffectFilterForImageDisparityImagePortraitEffectsMatteHairSemanticSegmentationGlassesMatteGainMapOrientationOptions(image: CIImage, disparityImage: CIImage, portraitEffectsMatte: CIImage, hairSemanticSegmentation: CIImage, glassesMatte: CIImage, gainMap: CIImage, orientation: CGImagePropertyOrientation, options: NSDictionary<any, any>): CIFilter;

	/**
	 * @since 13.0
	 */
	depthBlurEffectFilterForImageDisparityImagePortraitEffectsMatteHairSemanticSegmentationOrientationOptions(image: CIImage, disparityImage: CIImage, portraitEffectsMatte: CIImage, hairSemanticSegmentation: CIImage, orientation: CGImagePropertyOrientation, options: NSDictionary<any, any>): CIFilter;

	/**
	 * @since 12.0
	 */
	depthBlurEffectFilterForImageDisparityImagePortraitEffectsMatteOrientationOptions(image: CIImage, disparityImage: CIImage, portraitEffectsMatte: CIImage, orientation: CGImagePropertyOrientation, options: NSDictionary<any, any>): CIFilter;

	/**
	 * @since 12.0
	 */
	depthBlurEffectFilterForImageURLOptions(url: NSURL, options: NSDictionary<any, any>): CIFilter;

	/**
	 * @since 5.0
	 * @deprecated 6.0
	 */
	drawImageAtPointFromRect(image: CIImage, atPoint: CGPoint, fromRect: CGRect): void;

	drawImageInRectFromRect(image: CIImage, inRect: CGRect, fromRect: CGRect): void;

	/**
	 * @since 5.0
	 */
	initWithOptions(options: NSDictionary<string, any>): this;

	/**
	 * @since 5.0
	 */
	inputImageMaximumSize(): CGSize;

	/**
	 * @since 5.0
	 */
	outputImageMaximumSize(): CGSize;

	/**
	 * @since 11.0
	 */
	prepareRenderFromRectToDestinationAtPointError(image: CIImage, fromRect: CGRect, destination: CIRenderDestination, atPoint: CGPoint): boolean;

	renderToBitmapRowBytesBoundsFormatColorSpace(image: CIImage, data: interop.Pointer | interop.Reference<any>, rowBytes: number, bounds: CGRect, format: number, colorSpace: any): void;

	/**
	 * @since 5.0
	 */
	renderToCVPixelBuffer(image: CIImage, buffer: any): void;

	/**
	 * @since 5.0
	 */
	renderToCVPixelBufferBoundsColorSpace(image: CIImage, buffer: any, bounds: CGRect, colorSpace: any): void;

	/**
	 * @since 5.0
	 */
	renderToIOSurfaceBoundsColorSpace(image: CIImage, surface: IOSurface, bounds: CGRect, colorSpace: any): void;

	/**
	 * @since 9.0
	 */
	renderToMTLTextureCommandBufferBoundsColorSpace(image: CIImage, texture: MTLTexture, commandBuffer: MTLCommandBuffer, bounds: CGRect, colorSpace: any): void;

	/**
	 * @since 11.0
	 */
	startTaskToClearError(destination: CIRenderDestination): CIRenderTask;

	/**
	 * @since 11.0
	 */
	startTaskToRenderFromRectToDestinationAtPointError(image: CIImage, fromRect: CGRect, destination: CIRenderDestination, atPoint: CGPoint): CIRenderTask;

	/**
	 * @since 11.0
	 */
	startTaskToRenderToDestinationError(image: CIImage, destination: CIRenderDestination): CIRenderTask;

	/**
	 * @since 15.0
	 */
	writeHEIF10RepresentationOfImageToURLColorSpaceOptionsError(image: CIImage, url: NSURL, colorSpace: any, options: NSDictionary<string, any>): boolean;

	/**
	 * @since 11.0
	 */
	writeHEIFRepresentationOfImageToURLFormatColorSpaceOptionsError(image: CIImage, url: NSURL, format: number, colorSpace: any, options: NSDictionary<string, any>): boolean;

	/**
	 * @since 10.0
	 */
	writeJPEGRepresentationOfImageToURLColorSpaceOptionsError(image: CIImage, url: NSURL, colorSpace: any, options: NSDictionary<string, any>): boolean;

	/**
	 * @since 17.0
	 */
	writeOpenEXRRepresentationOfImageToURLOptionsError(image: CIImage, url: NSURL, options: NSDictionary<string, any>): boolean;

	/**
	 * @since 11.0
	 */
	writePNGRepresentationOfImageToURLFormatColorSpaceOptionsError(image: CIImage, url: NSURL, format: number, colorSpace: any, options: NSDictionary<string, any>): boolean;

	/**
	 * @since 10.0
	 */
	writeTIFFRepresentationOfImageToURLFormatColorSpaceOptionsError(image: CIImage, url: NSURL, format: number, colorSpace: any, options: NSDictionary<string, any>): boolean;
}

interface CIConvertLab extends CIFilterProtocol {

	inputImage: CIImage;

	normalize: boolean;
}
declare var CIConvertLab: {

	prototype: CIConvertLab;

	customAttributes?(): NSDictionary<string, any>;
};

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

/**
 * @since 11.0
 */
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

/**
 * @since 5.0
 */
declare class CIDetector extends NSObject {

	static alloc(): CIDetector; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	static detectorOfTypeContextOptions(type: string, context: CIContext, options: NSDictionary<string, any>): CIDetector;

	static new(): CIDetector; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	featuresInImage(image: CIImage): NSArray<CIFeature>;

	/**
	 * @since 5.0
	 */
	featuresInImageOptions(image: CIImage, options: NSDictionary<string, any>): NSArray<CIFeature>;
}

/**
 * @since 5.0
 */
declare var CIDetectorAccuracy: string;

/**
 * @since 5.0
 */
declare var CIDetectorAccuracyHigh: string;

/**
 * @since 5.0
 */
declare var CIDetectorAccuracyLow: string;

/**
 * @since 8.0
 */
declare var CIDetectorAspectRatio: string;

/**
 * @since 7.0
 */
declare var CIDetectorEyeBlink: string;

/**
 * @since 8.0
 */
declare var CIDetectorFocalLength: string;

/**
 * @since 5.0
 */
declare var CIDetectorImageOrientation: string;

/**
 * @since 10.0
 */
declare var CIDetectorMaxFeatureCount: string;

/**
 * @since 6.0
 */
declare var CIDetectorMinFeatureSize: string;

/**
 * @since 9.0
 */
declare var CIDetectorNumberOfAngles: string;

/**
 * @since 9.0
 */
declare var CIDetectorReturnSubFeatures: string;

/**
 * @since 7.0
 */
declare var CIDetectorSmile: string;

/**
 * @since 6.0
 */
declare var CIDetectorTracking: string;

/**
 * @since 5.0
 */
declare var CIDetectorTypeFace: string;

/**
 * @since 8.0
 */
declare var CIDetectorTypeQRCode: string;

/**
 * @since 8.0
 */
declare var CIDetectorTypeRectangle: string;

/**
 * @since 9.0
 */
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

interface CIDisplacementDistortion extends CIFilterProtocol {

	displacementImage: CIImage;

	inputImage: CIImage;

	scale: number;
}
declare var CIDisplacementDistortion: {

	prototype: CIDisplacementDistortion;

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

interface CIDroste extends CIFilterProtocol {

	inputImage: CIImage;

	insetPoint0: CGPoint;

	insetPoint1: CGPoint;

	periodicity: number;

	rotation: number;

	strands: number;

	zoom: number;
}
declare var CIDroste: {

	prototype: CIDroste;

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

/**
 * @since 5.0
 */
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

/**
 * @since 5.0
 */
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

/**
 * @since 5.0
 */
declare class CIFilter extends NSObject implements NSCopying, NSSecureCoding {

	static CMYKHalftone(): CIFilter & CICMYKHalftone;

	/**
	 * @since 14.0
	 */
	static KMeansFilter(): CIFilter & CIKMeans;

	static LabDeltaE(): CIFilter & CILabDeltaE;

	static PDF417BarcodeGenerator(): CIFilter & CIPDF417BarcodeGenerator;

	static QRCodeGenerator(): CIFilter & CIQRCodeGenerator;

	static accordionFoldTransitionFilter(): CIFilter & CIAccordionFoldTransition;

	static additionCompositingFilter(): CIFilter & CICompositeOperation;

	static affineClampFilter(): CIFilter & CIAffineClamp;

	static affineTileFilter(): CIFilter & CIAffineTile;

	static alloc(): CIFilter; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	static areaAlphaWeightedHistogramFilter(): CIFilter & CIAreaHistogram;

	/**
	 * @since 14.0
	 */
	static areaAverageFilter(): CIFilter & CIAreaAverage;

	/**
	 * @since 18.0
	 */
	static areaBoundsRedFilter(): CIFilter & CIAreaBoundsRed;

	/**
	 * @since 14.0
	 */
	static areaHistogramFilter(): CIFilter & CIAreaHistogram;

	/**
	 * @since 16.0
	 */
	static areaLogarithmicHistogramFilter(): CIFilter & CIAreaLogarithmicHistogram;

	/**
	 * @since 14.0
	 */
	static areaMaximumAlphaFilter(): CIFilter & CIAreaMaximumAlpha;

	/**
	 * @since 14.0
	 */
	static areaMaximumFilter(): CIFilter & CIAreaMaximum;

	/**
	 * @since 14.0
	 */
	static areaMinMaxFilter(): CIFilter & CIAreaMinMax;

	/**
	 * @since 14.0
	 */
	static areaMinMaxRedFilter(): CIFilter & CIAreaMinMaxRed;

	/**
	 * @since 14.0
	 */
	static areaMinimumAlphaFilter(): CIFilter & CIAreaMinimumAlpha;

	/**
	 * @since 14.0
	 */
	static areaMinimumFilter(): CIFilter & CIAreaMinimum;

	static attributedTextImageGeneratorFilter(): CIFilter & CIAttributedTextImageGenerator;

	static aztecCodeGeneratorFilter(): CIFilter & CIAztecCodeGenerator;

	static barcodeGeneratorFilter(): CIFilter & CIBarcodeGenerator;

	static barsSwipeTransitionFilter(): CIFilter & CIBarsSwipeTransition;

	static bicubicScaleTransformFilter(): CIFilter & CIBicubicScaleTransform;

	static blendWithAlphaMaskFilter(): CIFilter & CIBlendWithMask;

	static blendWithBlueMaskFilter(): CIFilter & CIBlendWithMask;

	static blendWithMaskFilter(): CIFilter & CIBlendWithMask;

	static blendWithRedMaskFilter(): CIFilter & CIBlendWithMask;

	static bloomFilter(): CIFilter & CIBloom;

	/**
	 * @since 17.0
	 */
	static blurredRectangleGeneratorFilter(): CIFilter & CIBlurredRectangleGenerator;

	static bokehBlurFilter(): CIFilter & CIBokehBlur;

	static boxBlurFilter(): CIFilter & CIBoxBlur;

	/**
	 * @since 14.0
	 */
	static bumpDistortionFilter(): CIFilter & CIBumpDistortion;

	/**
	 * @since 14.0
	 */
	static bumpDistortionLinearFilter(): CIFilter & CIBumpDistortionLinear;

	/**
	 * @since 17.0
	 */
	static cannyEdgeDetectorFilter(): CIFilter & CICannyEdgeDetector;

	static checkerboardGeneratorFilter(): CIFilter & CICheckerboardGenerator;

	/**
	 * @since 14.0
	 */
	static circleSplashDistortionFilter(): CIFilter & CICircleSplashDistortion;

	static circularScreenFilter(): CIFilter & CICircularScreen;

	/**
	 * @since 14.0
	 */
	static circularWrapFilter(): CIFilter & CICircularWrap;

	static code128BarcodeGeneratorFilter(): CIFilter & CICode128BarcodeGenerator;

	/**
	 * @since 14.0
	 */
	static colorAbsoluteDifferenceFilter(): CIFilter & CIColorAbsoluteDifference;

	static colorBlendModeFilter(): CIFilter & CICompositeOperation;

	static colorBurnBlendModeFilter(): CIFilter & CICompositeOperation;

	static colorClampFilter(): CIFilter & CIColorClamp;

	static colorControlsFilter(): CIFilter & CIColorControls;

	static colorCrossPolynomialFilter(): CIFilter & CIColorCrossPolynomial;

	static colorCubeFilter(): CIFilter & CIColorCube;

	static colorCubeWithColorSpaceFilter(): CIFilter & CIColorCubeWithColorSpace;

	static colorCubesMixedWithMaskFilter(): CIFilter & CIColorCubesMixedWithMask;

	static colorCurvesFilter(): CIFilter & CIColorCurves;

	static colorDodgeBlendModeFilter(): CIFilter & CICompositeOperation;

	static colorInvertFilter(): CIFilter & CIColorInvert;

	static colorMapFilter(): CIFilter & CIColorMap;

	static colorMatrixFilter(): CIFilter & CIColorMatrix;

	static colorMonochromeFilter(): CIFilter & CIColorMonochrome;

	static colorPolynomialFilter(): CIFilter & CIColorPolynomial;

	static colorPosterizeFilter(): CIFilter & CIColorPosterize;

	/**
	 * @since 14.0
	 */
	static colorThresholdFilter(): CIFilter & CIColorThreshold;

	/**
	 * @since 14.0
	 */
	static colorThresholdOtsuFilter(): CIFilter & CIColorThresholdOtsu;

	/**
	 * @since 14.0
	 */
	static columnAverageFilter(): CIFilter & CIColumnAverage;

	static comicEffectFilter(): CIFilter & CIComicEffect;

	/**
	 * @since 16.0
	 */
	static convertLabToRGBFilter(): CIFilter & CIConvertLab;

	/**
	 * @since 16.0
	 */
	static convertRGBtoLabFilter(): CIFilter & CIConvertLab;

	static convolution3X3Filter(): CIFilter & CIConvolution;

	static convolution5X5Filter(): CIFilter & CIConvolution;

	static convolution7X7Filter(): CIFilter & CIConvolution;

	static convolution9HorizontalFilter(): CIFilter & CIConvolution;

	static convolution9VerticalFilter(): CIFilter & CIConvolution;

	/**
	 * @since 15.0
	 */
	static convolutionRGB3X3Filter(): CIFilter & CIConvolution;

	/**
	 * @since 15.0
	 */
	static convolutionRGB5X5Filter(): CIFilter & CIConvolution;

	/**
	 * @since 15.0
	 */
	static convolutionRGB7X7Filter(): CIFilter & CIConvolution;

	/**
	 * @since 15.0
	 */
	static convolutionRGB9HorizontalFilter(): CIFilter & CIConvolution;

	/**
	 * @since 15.0
	 */
	static convolutionRGB9VerticalFilter(): CIFilter & CIConvolution;

	static copyMachineTransitionFilter(): CIFilter & CICopyMachineTransition;

	static coreMLModelFilter(): CIFilter & CICoreMLModel;

	static crystallizeFilter(): CIFilter & CICrystallize;

	static darkenBlendModeFilter(): CIFilter & CICompositeOperation;

	static depthOfFieldFilter(): CIFilter & CIDepthOfField;

	static depthToDisparityFilter(): CIFilter & CIDepthToDisparity;

	static differenceBlendModeFilter(): CIFilter & CICompositeOperation;

	static discBlurFilter(): CIFilter & CIDiscBlur;

	static disintegrateWithMaskTransitionFilter(): CIFilter & CIDisintegrateWithMaskTransition;

	static disparityToDepthFilter(): CIFilter & CIDisparityToDepth;

	/**
	 * @since 14.0
	 */
	static displacementDistortionFilter(): CIFilter & CIDisplacementDistortion;

	static dissolveTransitionFilter(): CIFilter & CIDissolveTransition;

	static ditherFilter(): CIFilter & CIDither;

	static divideBlendModeFilter(): CIFilter & CICompositeOperation;

	static documentEnhancerFilter(): CIFilter & CIDocumentEnhancer;

	static dotScreenFilter(): CIFilter & CIDotScreen;

	/**
	 * @since 14.0
	 */
	static drosteFilter(): CIFilter & CIDroste;

	static edgePreserveUpsampleFilter(): CIFilter & CIEdgePreserveUpsample;

	static edgeWorkFilter(): CIFilter & CIEdgeWork;

	static edgesFilter(): CIFilter & CIEdges;

	static eightfoldReflectedTileFilter(): CIFilter & CIEightfoldReflectedTile;

	static exclusionBlendModeFilter(): CIFilter & CICompositeOperation;

	static exposureAdjustFilter(): CIFilter & CIExposureAdjust;

	static falseColorFilter(): CIFilter & CIFalseColor;

	/**
	 * @since 6.0
	 * @deprecated 17.0
	 */
	static filterArrayFromSerializedXMPInputImageExtentError(xmpData: NSData, extent: CGRect): NSArray<CIFilter>;

	static filterNamesInCategories(categories: NSArray<string> | string[]): NSArray<string>;

	static filterNamesInCategory(category: string): NSArray<string>;

	/**
	 * @since 10.0
	 * @deprecated 100000
	 */
	static filterWithCVPixelBufferPropertiesOptions(pixelBuffer: any, properties: NSDictionary<any, any>, options: NSDictionary<string, any>): CIFilter;

	/**
	 * @since 10.0
	 * @deprecated 100000
	 */
	static filterWithImageDataOptions(data: NSData, options: NSDictionary<string, any>): CIFilter;

	/**
	 * @since 10.0
	 * @deprecated 100000
	 */
	static filterWithImageURLOptions(url: NSURL, options: NSDictionary<string, any>): CIFilter;

	static filterWithName(name: string): CIFilter;

	static filterWithNameKeysAndValues(name: string, key0: any): CIFilter;

	/**
	 * @since 8.0
	 */
	static filterWithNameWithInputParameters(name: string, params: NSDictionary<string, any>): CIFilter;

	static flashTransitionFilter(): CIFilter & CIFlashTransition;

	static fourfoldReflectedTileFilter(): CIFilter & CIFourfoldReflectedTile;

	static fourfoldRotatedTileFilter(): CIFilter & CIFourfoldRotatedTile;

	static fourfoldTranslatedTileFilter(): CIFilter & CIFourfoldTranslatedTile;

	static gaborGradientsFilter(): CIFilter & CIGaborGradients;

	static gammaAdjustFilter(): CIFilter & CIGammaAdjust;

	static gaussianBlurFilter(): CIFilter & CIGaussianBlur;

	static gaussianGradientFilter(): CIFilter & CIGaussianGradient;

	/**
	 * @since 14.0
	 */
	static glassDistortionFilter(): CIFilter & CIGlassDistortion;

	/**
	 * @since 14.0
	 */
	static glassLozengeFilter(): CIFilter & CIGlassLozenge;

	static glideReflectedTileFilter(): CIFilter & CIGlideReflectedTile;

	static gloomFilter(): CIFilter & CIGloom;

	static hardLightBlendModeFilter(): CIFilter & CICompositeOperation;

	static hatchedScreenFilter(): CIFilter & CIHatchedScreen;

	static heightFieldFromMaskFilter(): CIFilter & CIHeightFieldFromMask;

	static hexagonalPixellateFilter(): CIFilter & CIHexagonalPixellate;

	static highlightShadowAdjustFilter(): CIFilter & CIHighlightShadowAdjust;

	/**
	 * @since 14.0
	 */
	static histogramDisplayFilter(): CIFilter & CIHistogramDisplay;

	/**
	 * @since 14.0
	 */
	static holeDistortionFilter(): CIFilter & CIHoleDistortion;

	static hueAdjustFilter(): CIFilter & CIHueAdjust;

	static hueBlendModeFilter(): CIFilter & CICompositeOperation;

	static hueSaturationValueGradientFilter(): CIFilter & CIHueSaturationValueGradient;

	static kaleidoscopeFilter(): CIFilter & CIKaleidoscope;

	static keystoneCorrectionCombinedFilter(): CIFilter & CIKeystoneCorrectionCombined;

	static keystoneCorrectionHorizontalFilter(): CIFilter & CIKeystoneCorrectionHorizontal;

	static keystoneCorrectionVerticalFilter(): CIFilter & CIKeystoneCorrectionVertical;

	static lanczosScaleTransformFilter(): CIFilter & CILanczosScaleTransform;

	static lenticularHaloGeneratorFilter(): CIFilter & CILenticularHaloGenerator;

	/**
	 * @since 14.0
	 */
	static lightTunnelFilter(): CIFilter & CILightTunnel;

	static lightenBlendModeFilter(): CIFilter & CICompositeOperation;

	static lineOverlayFilter(): CIFilter & CILineOverlay;

	static lineScreenFilter(): CIFilter & CILineScreen;

	static linearBurnBlendModeFilter(): CIFilter & CICompositeOperation;

	static linearDodgeBlendModeFilter(): CIFilter & CICompositeOperation;

	static linearGradientFilter(): CIFilter & CILinearGradient;

	/**
	 * @since 15.0
	 */
	static linearLightBlendModeFilter(): CIFilter & CICompositeOperation;

	static linearToSRGBToneCurveFilter(): CIFilter & CILinearToSRGBToneCurve;

	/**
	 * @since 9.0
	 */
	static localizedDescriptionForFilterName(filterName: string): string;

	/**
	 * @since 9.0
	 */
	static localizedNameForCategory(category: string): string;

	/**
	 * @since 9.0
	 */
	static localizedNameForFilterName(filterName: string): string;

	/**
	 * @since 9.0
	 */
	static localizedReferenceDocumentationForFilterName(filterName: string): NSURL;

	static luminosityBlendModeFilter(): CIFilter & CICompositeOperation;

	static maskToAlphaFilter(): CIFilter & CIMaskToAlpha;

	static maskedVariableBlurFilter(): CIFilter & CIMaskedVariableBlur;

	static maximumComponentFilter(): CIFilter & CIMaximumComponent;

	static maximumCompositingFilter(): CIFilter & CICompositeOperation;

	/**
	 * @since 18.0
	 */
	static maximumScaleTransformFilter(): CIFilter & CIMaximumScaleTransform;

	static medianFilter(): CIFilter & CIMedian;

	static meshGeneratorFilter(): CIFilter & CIMeshGenerator;

	static minimumComponentFilter(): CIFilter & CIMinimumComponent;

	static minimumCompositingFilter(): CIFilter & CICompositeOperation;

	static mixFilter(): CIFilter & CIMix;

	static modTransitionFilter(): CIFilter & CIModTransition;

	static morphologyGradientFilter(): CIFilter & CIMorphologyGradient;

	static morphologyMaximumFilter(): CIFilter & CIMorphologyMaximum;

	static morphologyMinimumFilter(): CIFilter & CIMorphologyMinimum;

	static morphologyRectangleMaximumFilter(): CIFilter & CIMorphologyRectangleMaximum;

	static morphologyRectangleMinimumFilter(): CIFilter & CIMorphologyRectangleMinimum;

	static motionBlurFilter(): CIFilter & CIMotionBlur;

	static multiplyBlendModeFilter(): CIFilter & CICompositeOperation;

	static multiplyCompositingFilter(): CIFilter & CICompositeOperation;

	static new(): CIFilter; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static ninePartStretchedFilter(): CIFilter & CINinePartStretched;

	/**
	 * @since 14.0
	 */
	static ninePartTiledFilter(): CIFilter & CINinePartTiled;

	static noiseReductionFilter(): CIFilter & CINoiseReduction;

	static opTileFilter(): CIFilter & CIOpTile;

	static overlayBlendModeFilter(): CIFilter & CICompositeOperation;

	static pageCurlTransitionFilter(): CIFilter & CIPageCurlTransition;

	static pageCurlWithShadowTransitionFilter(): CIFilter & CIPageCurlWithShadowTransition;

	static paletteCentroidFilter(): CIFilter & CIPaletteCentroid;

	static palettizeFilter(): CIFilter & CIPalettize;

	static parallelogramTileFilter(): CIFilter & CIParallelogramTile;

	/**
	 * @since 15.0
	 */
	static personSegmentationFilter(): CIFilter & CIPersonSegmentation;

	static perspectiveCorrectionFilter(): CIFilter & CIPerspectiveCorrection;

	static perspectiveRotateFilter(): CIFilter & CIPerspectiveRotate;

	static perspectiveTileFilter(): CIFilter & CIPerspectiveTile;

	static perspectiveTransformFilter(): CIFilter & CIPerspectiveTransform;

	static perspectiveTransformWithExtentFilter(): CIFilter & CIPerspectiveTransformWithExtent;

	static photoEffectChromeFilter(): CIFilter & CIPhotoEffect;

	static photoEffectFadeFilter(): CIFilter & CIPhotoEffect;

	static photoEffectInstantFilter(): CIFilter & CIPhotoEffect;

	static photoEffectMonoFilter(): CIFilter & CIPhotoEffect;

	static photoEffectNoirFilter(): CIFilter & CIPhotoEffect;

	static photoEffectProcessFilter(): CIFilter & CIPhotoEffect;

	static photoEffectTonalFilter(): CIFilter & CIPhotoEffect;

	static photoEffectTransferFilter(): CIFilter & CIPhotoEffect;

	static pinLightBlendModeFilter(): CIFilter & CICompositeOperation;

	/**
	 * @since 14.0
	 */
	static pinchDistortionFilter(): CIFilter & CIPinchDistortion;

	static pixellateFilter(): CIFilter & CIPixellate;

	static pointillizeFilter(): CIFilter & CIPointillize;

	static radialGradientFilter(): CIFilter & CIRadialGradient;

	static randomGeneratorFilter(): CIFilter & CIRandomGenerator;

	/**
	 * @since 9.0
	 */
	static registerFilterNameConstructorClassAttributes(name: string, anObject: CIFilterConstructor, attributes: NSDictionary<string, any>): void;

	static rippleTransitionFilter(): CIFilter & CIRippleTransition;

	static roundedRectangleGeneratorFilter(): CIFilter & CIRoundedRectangleGenerator;

	/**
	 * @since 17.0
	 */
	static roundedRectangleStrokeGeneratorFilter(): CIFilter & CIRoundedRectangleStrokeGenerator;

	/**
	 * @since 14.0
	 */
	static rowAverageFilter(): CIFilter & CIRowAverage;

	static sRGBToneCurveToLinearFilter(): CIFilter & CISRGBToneCurveToLinear;

	static saliencyMapFilter(): CIFilter & CISaliencyMap;

	static saturationBlendModeFilter(): CIFilter & CICompositeOperation;

	static screenBlendModeFilter(): CIFilter & CICompositeOperation;

	static sepiaToneFilter(): CIFilter & CISepiaTone;

	/**
	 * @since 6.0
	 * @deprecated 17.0
	 */
	static serializedXMPFromFiltersInputImageExtent(filters: NSArray<CIFilter> | CIFilter[], extent: CGRect): NSData;

	static shadedMaterialFilter(): CIFilter & CIShadedMaterial;

	static sharpenLuminanceFilter(): CIFilter & CISharpenLuminance;

	static sixfoldReflectedTileFilter(): CIFilter & CISixfoldReflectedTile;

	static sixfoldRotatedTileFilter(): CIFilter & CISixfoldRotatedTile;

	static smoothLinearGradientFilter(): CIFilter & CISmoothLinearGradient;

	/**
	 * @since 17.0
	 */
	static sobelGradientsFilter(): CIFilter & CISobelGradients;

	static softLightBlendModeFilter(): CIFilter & CICompositeOperation;

	static sourceAtopCompositingFilter(): CIFilter & CICompositeOperation;

	static sourceInCompositingFilter(): CIFilter & CICompositeOperation;

	static sourceOutCompositingFilter(): CIFilter & CICompositeOperation;

	static sourceOverCompositingFilter(): CIFilter & CICompositeOperation;

	static spotColorFilter(): CIFilter & CISpotColor;

	static spotLightFilter(): CIFilter & CISpotLight;

	static starShineGeneratorFilter(): CIFilter & CIStarShineGenerator;

	static straightenFilter(): CIFilter & CIStraighten;

	/**
	 * @since 14.0
	 */
	static stretchCropFilter(): CIFilter & CIStretchCrop;

	static stripesGeneratorFilter(): CIFilter & CIStripesGenerator;

	static subtractBlendModeFilter(): CIFilter & CICompositeOperation;

	static sunbeamsGeneratorFilter(): CIFilter & CISunbeamsGenerator;

	/**
	 * @since 13.0
	 * @deprecated 100000
	 */
	static supportedRawCameraModels(): NSArray<string>;

	static swipeTransitionFilter(): CIFilter & CISwipeTransition;

	static temperatureAndTintFilter(): CIFilter & CITemperatureAndTint;

	static textImageGeneratorFilter(): CIFilter & CITextImageGenerator;

	static thermalFilter(): CIFilter & CIThermal;

	static toneCurveFilter(): CIFilter & CIToneCurve;

	/**
	 * @since 18.0
	 */
	static toneMapHeadroomFilter(): CIFilter & CIToneMapHeadroom;

	/**
	 * @since 14.0
	 */
	static torusLensDistortionFilter(): CIFilter & CITorusLensDistortion;

	static triangleKaleidoscopeFilter(): CIFilter & CITriangleKaleidoscope;

	static triangleTileFilter(): CIFilter & CITriangleTile;

	static twelvefoldReflectedTileFilter(): CIFilter & CITwelvefoldReflectedTile;

	/**
	 * @since 14.0
	 */
	static twirlDistortionFilter(): CIFilter & CITwirlDistortion;

	static unsharpMaskFilter(): CIFilter & CIUnsharpMask;

	static vibranceFilter(): CIFilter & CIVibrance;

	static vignetteEffectFilter(): CIFilter & CIVignetteEffect;

	static vignetteFilter(): CIFilter & CIVignette;

	/**
	 * @since 15.0
	 */
	static vividLightBlendModeFilter(): CIFilter & CICompositeOperation;

	/**
	 * @since 14.0
	 */
	static vortexDistortionFilter(): CIFilter & CIVortexDistortion;

	static whitePointAdjustFilter(): CIFilter & CIWhitePointAdjust;

	static xRayFilter(): CIFilter & CIXRay;

	static zoomBlurFilter(): CIFilter & CIZoomBlur;

	readonly attributes: NSDictionary<string, any>;

	readonly inputKeys: NSArray<string>;

	name: string;

	/**
	 * @since 5.0
	 */
	readonly outputImage: CIImage;

	readonly outputKeys: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	setDefaults(): void;

	/**
	 * @since 10.0
	 */
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

/**
 * @since 9.0
 */
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

interface CIGlassDistortion extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	scale: number;

	textureImage: CIImage;
}
declare var CIGlassDistortion: {

	prototype: CIGlassDistortion;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIGlassLozenge extends CIFilterProtocol {

	inputImage: CIImage;

	point0: CGPoint;

	point1: CGPoint;

	radius: number;

	refraction: number;
}
declare var CIGlassLozenge: {

	prototype: CIGlassLozenge;

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

interface CIHistogramDisplay extends CIFilterProtocol {

	height: number;

	highLimit: number;

	inputImage: CIImage;

	lowLimit: number;
}
declare var CIHistogramDisplay: {

	prototype: CIHistogramDisplay;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIHoleDistortion extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	radius: number;
}
declare var CIHoleDistortion: {

	prototype: CIHoleDistortion;

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

/**
 * @since 5.0
 */
declare class CIImage extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIImage; // inherited from NSObject

	static emptyImage(): CIImage;

	static imageWithBitmapDataBytesPerRowSizeFormatColorSpace(data: NSData, bytesPerRow: number, size: CGSize, format: number, colorSpace: any): CIImage;

	static imageWithCGImage(image: any): CIImage;

	static imageWithCGImageOptions(image: any, options: NSDictionary<string, any>): CIImage;

	/**
	 * @since 13.0
	 */
	static imageWithCGImageSourceIndexOptions(source: any, index: number, dict: NSDictionary<string, any>): CIImage;

	/**
	 * @since 9.0
	 */
	static imageWithCVImageBuffer(imageBuffer: any): CIImage;

	/**
	 * @since 9.0
	 */
	static imageWithCVImageBufferOptions(imageBuffer: any, options: NSDictionary<string, any>): CIImage;

	/**
	 * @since 5.0
	 */
	static imageWithCVPixelBuffer(pixelBuffer: any): CIImage;

	/**
	 * @since 5.0
	 */
	static imageWithCVPixelBufferOptions(pixelBuffer: any, options: NSDictionary<string, any>): CIImage;

	static imageWithColor(color: CIColor): CIImage;

	static imageWithContentsOfURL(url: NSURL): CIImage;

	static imageWithContentsOfURLOptions(url: NSURL, options: NSDictionary<string, any>): CIImage;

	static imageWithData(data: NSData): CIImage;

	static imageWithDataOptions(data: NSData, options: NSDictionary<string, any>): CIImage;

	/**
	 * @since 11.0
	 */
	static imageWithDepthData(data: AVDepthData): CIImage;

	/**
	 * @since 11.0
	 */
	static imageWithDepthDataOptions(data: AVDepthData, options: NSDictionary<string, any>): CIImage;

	/**
	 * @since 5.0
	 */
	static imageWithIOSurface(surface: IOSurface): CIImage;

	/**
	 * @since 5.0
	 */
	static imageWithIOSurfaceOptions(surface: IOSurface, options: NSDictionary<string, any>): CIImage;

	/**
	 * @since 9.0
	 */
	static imageWithImageProviderSizeFormatColorSpaceOptions(p: any, width: number, height: number, f: number, cs: any, options: NSDictionary<string, any>): CIImage;

	/**
	 * @since 9.0
	 */
	static imageWithMTLTextureOptions(texture: MTLTexture, options: NSDictionary<string, any>): CIImage;

	/**
	 * @since 12.0
	 */
	static imageWithPortaitEffectsMatte(matte: AVPortraitEffectsMatte): CIImage;

	/**
	 * @since 12.0
	 */
	static imageWithPortaitEffectsMatteOptions(matte: AVPortraitEffectsMatte, options: NSDictionary<string, any>): CIImage;

	/**
	 * @since 13.0
	 */
	static imageWithSemanticSegmentationMatte(matte: AVSemanticSegmentationMatte): CIImage;

	/**
	 * @since 13.0
	 */
	static imageWithSemanticSegmentationMatteOptions(matte: AVSemanticSegmentationMatte, options: NSDictionary<string, any>): CIImage;

	/**
	 * @since 6.0
	 * @deprecated 12.0
	 */
	static imageWithTextureSizeFlippedColorSpace(name: number, size: CGSize, flipped: boolean, colorSpace: any): CIImage;

	static new(): CIImage; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	readonly CGImage: any;

	/**
	 * @since 9.0
	 */
	readonly colorSpace: any;

	/**
	 * @since 18.0
	 */
	readonly contentHeadroom: number;

	/**
	 * @since 11.0
	 */
	readonly depthData: AVDepthData;

	readonly extent: CGRect;

	/**
	 * @since 18.0
	 */
	readonly metalTexture: MTLTexture;

	readonly opaque: boolean;

	/**
	 * @since 10.0
	 */
	readonly pixelBuffer: any;

	/**
	 * @since 12.0
	 */
	readonly portraitEffectsMatte: AVPortraitEffectsMatte;

	/**
	 * @since 5.0
	 */
	readonly properties: NSDictionary<string, any>;

	/**
	 * @since 13.0
	 */
	readonly semanticSegmentationMatte: AVSemanticSegmentationMatte;

	/**
	 * @since 9.0
	 */
	readonly url: NSURL;

	/**
	 * @since 13.0
	 */
	static readonly blackImage: CIImage;

	/**
	 * @since 13.0
	 */
	static readonly blueImage: CIImage;

	/**
	 * @since 13.0
	 */
	static readonly clearImage: CIImage;

	/**
	 * @since 13.0
	 */
	static readonly cyanImage: CIImage;

	/**
	 * @since 13.0
	 */
	static readonly grayImage: CIImage;

	/**
	 * @since 13.0
	 */
	static readonly greenImage: CIImage;

	/**
	 * @since 13.0
	 */
	static readonly magentaImage: CIImage;

	/**
	 * @since 13.0
	 */
	static readonly redImage: CIImage;

	/**
	 * @since 13.0
	 */
	static readonly whiteImage: CIImage;

	/**
	 * @since 13.0
	 */
	static readonly yellowImage: CIImage;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { bitmapData: NSData; bytesPerRow: number; size: CGSize; format: number; colorSpace: any; });

	constructor(o: { CGImage: any; });

	constructor(o: { CGImage: any; options: NSDictionary<string, any>; });

	/**
	 * @since 13.0
	 */
	constructor(o: { CGImageSource: any; index: number; options: NSDictionary<string, any>; });

	/**
	 * @since 9.0
	 */
	constructor(o: { CVImageBuffer: any; });

	/**
	 * @since 9.0
	 */
	constructor(o: { CVImageBuffer: any; options: NSDictionary<string, any>; });

	/**
	 * @since 5.0
	 */
	constructor(o: { CVPixelBuffer: any; });

	/**
	 * @since 5.0
	 */
	constructor(o: { CVPixelBuffer: any; options: NSDictionary<string, any>; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { color: CIColor; });

	constructor(o: { contentsOfURL: NSURL; });

	constructor(o: { contentsOfURL: NSURL; options: NSDictionary<string, any>; });

	constructor(o: { data: NSData; });

	constructor(o: { data: NSData; options: NSDictionary<string, any>; });

	/**
	 * @since 11.0
	 */
	constructor(o: { depthData: AVDepthData; });

	/**
	 * @since 11.0
	 */
	constructor(o: { depthData: AVDepthData; options: NSDictionary<string, any>; });

	/**
	 * @since 5.0
	 */
	constructor(o: { IOSurface: IOSurface; });

	/**
	 * @since 5.0
	 */
	constructor(o: { IOSurface: IOSurface; options: NSDictionary<string, any>; });

	/**
	 * @since 5.0
	 */
	constructor(o: { image: UIImage; });

	/**
	 * @since 5.0
	 */
	constructor(o: { image: UIImage; options: NSDictionary<string, any>; });

	/**
	 * @since 9.0
	 */
	constructor(o: { imageProvider: any; size: number; format: number; colorSpace: number; options: any; });

	/**
	 * @since 9.0
	 */
	constructor(o: { MTLTexture: MTLTexture; options: NSDictionary<string, any>; });

	/**
	 * @since 11.0
	 */
	constructor(o: { portaitEffectsMatte: AVPortraitEffectsMatte; });

	/**
	 * @since 12.0
	 */
	constructor(o: { portaitEffectsMatte: AVPortraitEffectsMatte; options: NSDictionary<string, any>; });

	/**
	 * @since 13.0
	 */
	constructor(o: { semanticSegmentationMatte: AVSemanticSegmentationMatte; });

	/**
	 * @since 13.0
	 */
	constructor(o: { semanticSegmentationMatte: AVSemanticSegmentationMatte; options: NSDictionary<string, any>; });

	/**
	 * @since 6.0
	 * @deprecated 12.0
	 */
	constructor(o: { texture: number; size: CGSize; flipped: boolean; colorSpace: any; });

	/**
	 * @since 5.0
	 */
	autoAdjustmentFilters(): NSArray<CIFilter>;

	/**
	 * @since 5.0
	 */
	autoAdjustmentFiltersWithOptions(options: NSDictionary<string, any>): NSArray<CIFilter>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 11.0
	 */
	imageByApplyingCGOrientation(orientation: CGImagePropertyOrientation): CIImage;

	/**
	 * @since 11.0
	 */
	imageByApplyingFilter(filterName: string): CIImage;

	/**
	 * @since 8.0
	 */
	imageByApplyingFilterWithInputParameters(filterName: string, params: NSDictionary<string, any>): CIImage;

	/**
	 * @since 18.0
	 */
	imageByApplyingGainMap(gainmap: CIImage): CIImage;

	/**
	 * @since 18.0
	 */
	imageByApplyingGainMapHeadroom(gainmap: CIImage, headroom: number): CIImage;

	/**
	 * @since 10.0
	 */
	imageByApplyingGaussianBlurWithSigma(sigma: number): CIImage;

	/**
	 * @since 8.0
	 */
	imageByApplyingOrientation(orientation: number): CIImage;

	imageByApplyingTransform(matrix: CGAffineTransform): CIImage;

	/**
	 * @since 10.0
	 */
	imageByApplyingTransformHighQualityDownsample(matrix: CGAffineTransform, highQualityDownsample: boolean): CIImage;

	/**
	 * @since 8.0
	 */
	imageByClampingToExtent(): CIImage;

	/**
	 * @since 10.0
	 */
	imageByClampingToRect(rect: CGRect): CIImage;

	/**
	 * @since 10.0
	 */
	imageByColorMatchingColorSpaceToWorkingSpace(colorSpace: any): CIImage;

	/**
	 * @since 10.0
	 */
	imageByColorMatchingWorkingSpaceToColorSpace(colorSpace: any): CIImage;

	/**
	 * @since 8.0
	 */
	imageByCompositingOverImage(dest: CIImage): CIImage;

	/**
	 * @since 16.0
	 */
	imageByConvertingLabToWorkingSpace(): CIImage;

	/**
	 * @since 16.0
	 */
	imageByConvertingWorkingSpaceToLab(): CIImage;

	imageByCroppingToRect(rect: CGRect): CIImage;

	/**
	 * @since 12.0
	 */
	imageByInsertingIntermediate(cache: boolean): CIImage;

	/**
	 * @since 10.0
	 */
	imageByPremultiplyingAlpha(): CIImage;

	/**
	 * @since 11.0
	 */
	imageBySamplingLinear(): CIImage;

	/**
	 * @since 11.0
	 */
	imageBySamplingNearest(): CIImage;

	/**
	 * @since 10.0
	 */
	imageBySettingAlphaOneInExtent(extent: CGRect): CIImage;

	/**
	 * @since 10.0
	 */
	imageBySettingProperties(properties: NSDictionary<any, any>): CIImage;

	/**
	 * @since 10.0
	 */
	imageByUnpremultiplyingAlpha(): CIImage;

	/**
	 * @since 11.0
	 */
	imageTransformForCGOrientation(orientation: CGImagePropertyOrientation): CGAffineTransform;

	/**
	 * @since 8.0
	 */
	imageTransformForOrientation(orientation: number): CGAffineTransform;

	initWithBitmapDataBytesPerRowSizeFormatColorSpace(data: NSData, bytesPerRow: number, size: CGSize, format: number, colorSpace: any): this;

	initWithCGImage(image: any): this;

	initWithCGImageOptions(image: any, options: NSDictionary<string, any>): this;

	/**
	 * @since 13.0
	 */
	initWithCGImageSourceIndexOptions(source: any, index: number, dict: NSDictionary<string, any>): this;

	/**
	 * @since 9.0
	 */
	initWithCVImageBuffer(imageBuffer: any): this;

	/**
	 * @since 9.0
	 */
	initWithCVImageBufferOptions(imageBuffer: any, options: NSDictionary<string, any>): this;

	/**
	 * @since 5.0
	 */
	initWithCVPixelBuffer(pixelBuffer: any): this;

	/**
	 * @since 5.0
	 */
	initWithCVPixelBufferOptions(pixelBuffer: any, options: NSDictionary<string, any>): this;

	initWithCoder(coder: NSCoder): this;

	initWithColor(color: CIColor): this;

	initWithContentsOfURL(url: NSURL): this;

	initWithContentsOfURLOptions(url: NSURL, options: NSDictionary<string, any>): this;

	initWithData(data: NSData): this;

	initWithDataOptions(data: NSData, options: NSDictionary<string, any>): this;

	/**
	 * @since 11.0
	 */
	initWithDepthData(data: AVDepthData): this;

	/**
	 * @since 11.0
	 */
	initWithDepthDataOptions(data: AVDepthData, options: NSDictionary<string, any>): this;

	/**
	 * @since 5.0
	 */
	initWithIOSurface(surface: IOSurface): this;

	/**
	 * @since 5.0
	 */
	initWithIOSurfaceOptions(surface: IOSurface, options: NSDictionary<string, any>): this;

	/**
	 * @since 5.0
	 */
	initWithImage(image: UIImage): this;

	/**
	 * @since 5.0
	 */
	initWithImageOptions(image: UIImage, options: NSDictionary<string, any>): this;

	/**
	 * @since 9.0
	 */
	initWithImageProviderSizeFormatColorSpaceOptions(p: any, width: number, height: number, f: number, cs: any, options: NSDictionary<string, any>): this;

	/**
	 * @since 9.0
	 */
	initWithMTLTextureOptions(texture: MTLTexture, options: NSDictionary<string, any>): this;

	/**
	 * @since 11.0
	 */
	initWithPortaitEffectsMatte(matte: AVPortraitEffectsMatte): this;

	/**
	 * @since 12.0
	 */
	initWithPortaitEffectsMatteOptions(matte: AVPortraitEffectsMatte, options: NSDictionary<string, any>): this;

	/**
	 * @since 13.0
	 */
	initWithSemanticSegmentationMatte(matte: AVSemanticSegmentationMatte): this;

	/**
	 * @since 13.0
	 */
	initWithSemanticSegmentationMatteOptions(matte: AVSemanticSegmentationMatte, options: NSDictionary<string, any>): this;

	/**
	 * @since 6.0
	 * @deprecated 12.0
	 */
	initWithTextureSizeFlippedColorSpace(name: number, size: CGSize, flipped: boolean, colorSpace: any): this;

	/**
	 * @since 6.0
	 */
	regionOfInterestForImageInRect(image: CIImage, rect: CGRect): CGRect;
}

/**
 * @since 9.0
 */
declare class CIImageAccumulator extends NSObject {

	static alloc(): CIImageAccumulator; // inherited from NSObject

	static imageAccumulatorWithExtentFormat(extent: CGRect, format: number): CIImageAccumulator;

	/**
	 * @since 9.0
	 */
	static imageAccumulatorWithExtentFormatColorSpace(extent: CGRect, format: number, colorSpace: any): CIImageAccumulator;

	static new(): CIImageAccumulator; // inherited from NSObject

	readonly extent: CGRect;

	readonly format: number;

	constructor(o: { extent: CGRect; format: number; });

	/**
	 * @since 9.0
	 */
	constructor(o: { extent: CGRect; format: number; colorSpace: any; });

	clear(): void;

	image(): CIImage;

	initWithExtentFormat(extent: CGRect, format: number): this;

	/**
	 * @since 9.0
	 */
	initWithExtentFormatColorSpace(extent: CGRect, format: number, colorSpace: any): this;

	setImage(image: CIImage): void;

	setImageDirtyRect(image: CIImage, dirtyRect: CGRect): void;
}

/**
 * @since 10.0
 */
interface CIImageProcessorInput {

	baseAddress: interop.Pointer | interop.Reference<any>;

	bytesPerRow: number;

	/**
	 * @since 16.0
	 */
	digest: number;

	format: number;

	metalTexture: MTLTexture;

	pixelBuffer: any;

	region: CGRect;

	/**
	 * @since 17.0
	 */
	roiTileCount: number;

	/**
	 * @since 17.0
	 */
	roiTileIndex: number;

	surface: IOSurface;
}
declare var CIImageProcessorInput: {

	prototype: CIImageProcessorInput;
};

/**
 * @since 10.0
 */
declare class CIImageProcessorKernel extends NSObject {

	static alloc(): CIImageProcessorKernel; // inherited from NSObject

	static applyWithExtentInputsArgumentsError(extent: CGRect, inputs: NSArray<CIImage> | CIImage[], args: NSDictionary<string, any>): CIImage;

	static formatForInputAtIndex(input: number): number;

	static new(): CIImageProcessorKernel; // inherited from NSObject

	static processWithInputsArgumentsOutputError(inputs: NSArray<CIImageProcessorInput> | CIImageProcessorInput[], _arguments: NSDictionary<string, any>, output: CIImageProcessorOutput): boolean;

	static roiForInputArgumentsOutputRect(input: number, _arguments: NSDictionary<string, any>, outputRect: CGRect): CGRect;

	/**
	 * @since 17.0
	 */
	static roiTileArrayForInputArgumentsOutputRect(input: number, _arguments: NSDictionary<string, any>, outputRect: CGRect): NSArray<CIVector>;

	static readonly outputFormat: number;

	/**
	 * @since 11.0
	 */
	static readonly outputIsOpaque: boolean;

	static readonly synchronizeInputs: boolean;
}

/**
 * @since 10.0
 */
interface CIImageProcessorOutput {

	baseAddress: interop.Pointer | interop.Reference<any>;

	bytesPerRow: number;

	/**
	 * @since 16.0
	 */
	digest: number;

	format: number;

	metalCommandBuffer: MTLCommandBuffer;

	metalTexture: MTLTexture;

	pixelBuffer: any;

	region: CGRect;

	surface: IOSurface;
}
declare var CIImageProcessorOutput: {

	prototype: CIImageProcessorOutput;
};

interface CIKMeans extends CIAreaReductionFilter {

	count: number;

	inputMeans: CIImage;

	passes: number;

	perceptual: boolean;
}
declare var CIKMeans: {

	prototype: CIKMeans;

	customAttributes?(): NSDictionary<string, any>;
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

/**
 * @since 8.0
 */
declare class CIKernel extends NSObject {

	static alloc(): CIKernel; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static kernelNamesFromMetalLibraryData(data: NSData): NSArray<string>;

	/**
	 * @since 11.0
	 */
	static kernelWithFunctionNameFromMetalLibraryDataError(name: string, data: NSData): CIKernel;

	/**
	 * @since 11.0
	 */
	static kernelWithFunctionNameFromMetalLibraryDataOutputPixelFormatError(name: string, data: NSData, format: number): CIKernel;

	/**
	 * @since 8.0
	 * @deprecated 12.0
	 */
	static kernelWithString(string: string): CIKernel;

	/**
	 * @since 15.0
	 */
	static kernelsWithMetalStringError(source: string): NSArray<CIKernel>;

	/**
	 * @since 8.0
	 * @deprecated 12.0
	 */
	static kernelsWithString(string: string): NSArray<CIKernel>;

	static new(): CIKernel; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	readonly name: string;

	/**
	 * @since 8.0
	 */
	applyWithExtentRoiCallbackArguments(extent: CGRect, callback: (p1: number, p2: CGRect) => CGRect, args: NSArray<any> | any[]): CIImage;

	/**
	 * @since 9.0
	 */
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

interface CILightTunnel extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	radius: number;

	rotation: number;
}
declare var CILightTunnel: {

	prototype: CILightTunnel;

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

interface CIMaximumScaleTransform extends CIFilterProtocol {

	aspectRatio: number;

	inputImage: CIImage;

	scale: number;
}
declare var CIMaximumScaleTransform: {

	prototype: CIMaximumScaleTransform;

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

interface CINinePartStretched extends CIFilterProtocol {

	breakpoint0: CGPoint;

	breakpoint1: CGPoint;

	growAmount: CGPoint;

	inputImage: CIImage;
}
declare var CINinePartStretched: {

	prototype: CINinePartStretched;

	customAttributes?(): NSDictionary<string, any>;
};

interface CINinePartTiled extends CIFilterProtocol {

	breakpoint0: CGPoint;

	breakpoint1: CGPoint;

	flipYTiles: boolean;

	growAmount: CGPoint;

	inputImage: CIImage;
}
declare var CINinePartTiled: {

	prototype: CINinePartTiled;

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

/**
 * @since 11.0
 */
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

interface CIPersonSegmentation extends CIFilterProtocol {

	inputImage: CIImage;

	qualityLevel: number;
}
declare var CIPersonSegmentation: {

	prototype: CIPersonSegmentation;

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

	/**
	 * @since 17.0
	 */
	extrapolate: boolean;

	inputImage: CIImage;
}
declare var CIPhotoEffect: {

	prototype: CIPhotoEffect;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIPinchDistortion extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	radius: number;

	scale: number;
}
declare var CIPinchDistortion: {

	prototype: CIPinchDistortion;

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

/**
 * @since 11.0
 */
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

/**
 * @since 8.0
 */
declare class CIQRCodeFeature extends CIFeature implements NSCopying, NSSecureCoding {

	static alloc(): CIQRCodeFeature; // inherited from NSObject

	static new(): CIQRCodeFeature; // inherited from NSObject

	readonly bottomLeft: CGPoint;

	readonly bottomRight: CGPoint;

	readonly messageString: string;

	/**
	 * @since 11.0
	 */
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

declare var CIRAWDecoderVersion6: string;

declare var CIRAWDecoderVersion6DNG: string;

declare var CIRAWDecoderVersion7: string;

declare var CIRAWDecoderVersion7DNG: string;

declare var CIRAWDecoderVersion8: string;

declare var CIRAWDecoderVersion8DNG: string;

declare var CIRAWDecoderVersionNone: string;

/**
 * @since 15.0
 */
declare class CIRAWFilter extends CIFilter {

	static alloc(): CIRAWFilter; // inherited from NSObject

	static filterWithCVPixelBufferProperties(buffer: any, properties: NSDictionary<any, any>): CIRAWFilter;

	static filterWithImageDataIdentifierHint(data: NSData, identifierHint: string): CIRAWFilter;

	static filterWithImageURL(url: NSURL): CIRAWFilter;

	static new(): CIRAWFilter; // inherited from NSObject

	baselineExposure: number;

	boostAmount: number;

	boostShadowAmount: number;

	colorNoiseReductionAmount: number;

	readonly colorNoiseReductionSupported: boolean;

	contrastAmount: number;

	readonly contrastSupported: boolean;

	decoderVersion: string;

	detailAmount: number;

	readonly detailSupported: boolean;

	draftModeEnabled: boolean;

	exposure: number;

	extendedDynamicRangeAmount: number;

	gamutMappingEnabled: boolean;

	lensCorrectionEnabled: boolean;

	readonly lensCorrectionSupported: boolean;

	linearSpaceFilter: CIFilter;

	localToneMapAmount: number;

	readonly localToneMapSupported: boolean;

	luminanceNoiseReductionAmount: number;

	readonly luminanceNoiseReductionSupported: boolean;

	moireReductionAmount: number;

	readonly moireReductionSupported: boolean;

	readonly nativeSize: CGSize;

	neutralChromaticity: CGPoint;

	neutralLocation: CGPoint;

	neutralTemperature: number;

	neutralTint: number;

	orientation: CGImagePropertyOrientation;

	readonly portraitEffectsMatte: CIImage;

	readonly previewImage: CIImage;

	readonly properties: NSDictionary<any, any>;

	scaleFactor: number;

	readonly semanticSegmentationGlassesMatte: CIImage;

	readonly semanticSegmentationHairMatte: CIImage;

	readonly semanticSegmentationSkinMatte: CIImage;

	readonly semanticSegmentationSkyMatte: CIImage;

	readonly semanticSegmentationTeethMatte: CIImage;

	shadowBias: number;

	sharpnessAmount: number;

	readonly sharpnessSupported: boolean;

	readonly supportedDecoderVersions: NSArray<string>;

	static readonly supportedCameraModels: NSArray<string>;
}

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

/**
 * @since 8.0
 */
declare class CIRectangleFeature extends CIFeature {

	static alloc(): CIRectangleFeature; // inherited from NSObject

	static new(): CIRectangleFeature; // inherited from NSObject

	readonly bottomLeft: CGPoint;

	readonly bottomRight: CGPoint;

	readonly topLeft: CGPoint;

	readonly topRight: CGPoint;
}

/**
 * @since 11.0
 */
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

/**
 * @since 11.0
 */
declare class CIRenderInfo extends NSObject {

	static alloc(): CIRenderInfo; // inherited from NSObject

	static new(): CIRenderInfo; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	readonly kernelCompileTime: number;

	readonly kernelExecutionTime: number;

	readonly passCount: number;

	readonly pixelsProcessed: number;
}

/**
 * @since 11.0
 */
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

interface CIRoundedRectangleStrokeGenerator extends CIFilterProtocol {

	color: CIColor;

	extent: CGRect;

	radius: number;

	width: number;
}
declare var CIRoundedRectangleStrokeGenerator: {

	prototype: CIRoundedRectangleStrokeGenerator;

	customAttributes?(): NSDictionary<string, any>;
};

interface CIRowAverage extends CIAreaReductionFilter {
}
declare var CIRowAverage: {

	prototype: CIRowAverage;

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

/**
 * @since 9.0
 */
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

interface CISobelGradients extends CIFilterProtocol {

	inputImage: CIImage;
}
declare var CISobelGradients: {

	prototype: CISobelGradients;

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

interface CIStretchCrop extends CIFilterProtocol {

	centerStretchAmount: number;

	cropAmount: number;

	inputImage: CIImage;

	size: CGPoint;
}
declare var CIStretchCrop: {

	prototype: CIStretchCrop;

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

/**
 * @since 9.0
 */
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

	/**
	 * @since 16.0
	 */
	padding: number;

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

interface CIToneMapHeadroom extends CIFilterProtocol {

	inputImage: CIImage;

	sourceHeadroom: number;

	targetHeadroom: number;
}
declare var CIToneMapHeadroom: {

	prototype: CIToneMapHeadroom;

	customAttributes?(): NSDictionary<string, any>;
};

interface CITorusLensDistortion extends CIFilterProtocol {

	center: CGPoint;

	inputImage: CIImage;

	radius: number;

	refraction: number;

	width: number;
}
declare var CITorusLensDistortion: {

	prototype: CITorusLensDistortion;

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

interface CITwirlDistortion extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	radius: number;
}
declare var CITwirlDistortion: {

	prototype: CITwirlDistortion;

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

/**
 * @since 5.0
 */
declare class CIVector extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CIVector; // inherited from NSObject

	static new(): CIVector; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	static vectorWithCGAffineTransform(t: CGAffineTransform): CIVector;

	/**
	 * @since 5.0
	 */
	static vectorWithCGPoint(p: CGPoint): CIVector;

	/**
	 * @since 5.0
	 */
	static vectorWithCGRect(r: CGRect): CIVector;

	static vectorWithString(representation: string): CIVector;

	static vectorWithValuesCount(values: interop.Pointer | interop.Reference<number>, count: number): CIVector;

	static vectorWithX(x: number): CIVector;

	static vectorWithXY(x: number, y: number): CIVector;

	static vectorWithXYZ(x: number, y: number, z: number): CIVector;

	static vectorWithXYZW(x: number, y: number, z: number, w: number): CIVector;

	/**
	 * @since 5.0
	 */
	readonly CGAffineTransformValue: CGAffineTransform;

	/**
	 * @since 5.0
	 */
	readonly CGPointValue: CGPoint;

	/**
	 * @since 5.0
	 */
	readonly CGRectValue: CGRect;

	readonly W: number;

	readonly X: number;

	readonly Y: number;

	readonly Z: number;

	readonly count: number;

	readonly stringRepresentation: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 5.0
	 */
	constructor(o: { CGAffineTransform: CGAffineTransform; });

	/**
	 * @since 5.0
	 */
	constructor(o: { CGPoint: CGPoint; });

	/**
	 * @since 5.0
	 */
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

	/**
	 * @since 5.0
	 */
	initWithCGAffineTransform(r: CGAffineTransform): this;

	/**
	 * @since 5.0
	 */
	initWithCGPoint(p: CGPoint): this;

	/**
	 * @since 5.0
	 */
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

interface CIVortexDistortion extends CIFilterProtocol {

	angle: number;

	center: CGPoint;

	inputImage: CIImage;

	radius: number;
}
declare var CIVortexDistortion: {

	prototype: CIVortexDistortion;

	customAttributes?(): NSDictionary<string, any>;
};

/**
 * @since 8.0
 */
declare class CIWarpKernel extends CIKernel {

	static alloc(): CIWarpKernel; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static kernelWithFunctionNameFromMetalLibraryDataError(name: string, data: NSData): CIWarpKernel; // inherited from CIKernel

	/**
	 * @since 11.0
	 */
	static kernelWithFunctionNameFromMetalLibraryDataOutputPixelFormatError(name: string, data: NSData, format: number): CIWarpKernel; // inherited from CIKernel

	/**
	 * @since 8.0
	 * @deprecated 12.0
	 */
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

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIActiveKeys: string;

declare var kCIAttributeClass: string;

declare var kCIAttributeDefault: string;

/**
 * @since 9.0
 */
declare var kCIAttributeDescription: string;

declare var kCIAttributeDisplayName: string;

/**
 * @since 9.0
 */
declare var kCIAttributeFilterAvailable_Mac: string;

/**
 * @since 9.0
 */
declare var kCIAttributeFilterAvailable_iOS: string;

declare var kCIAttributeFilterCategories: string;

declare var kCIAttributeFilterDisplayName: string;

declare var kCIAttributeFilterName: string;

declare var kCIAttributeIdentity: string;

declare var kCIAttributeMax: string;

declare var kCIAttributeMin: string;

declare var kCIAttributeName: string;

/**
 * @since 9.0
 */
declare var kCIAttributeReferenceDocumentation: string;

declare var kCIAttributeSliderMax: string;

declare var kCIAttributeSliderMin: string;

declare var kCIAttributeType: string;

declare var kCIAttributeTypeAngle: string;

declare var kCIAttributeTypeBoolean: string;

/**
 * @since 5.0
 */
declare var kCIAttributeTypeColor: string;

/**
 * @since 5.0
 */
declare var kCIAttributeTypeCount: string;

declare var kCIAttributeTypeDistance: string;

/**
 * @since 9.0
 */
declare var kCIAttributeTypeGradient: string;

/**
 * @since 5.0
 */
declare var kCIAttributeTypeImage: string;

/**
 * @since 5.0
 */
declare var kCIAttributeTypeInteger: string;

declare var kCIAttributeTypeOffset: string;

/**
 * @since 9.0
 */
declare var kCIAttributeTypeOpaqueColor: string;

declare var kCIAttributeTypePosition: string;

declare var kCIAttributeTypePosition3: string;

declare var kCIAttributeTypeRectangle: string;

declare var kCIAttributeTypeScalar: string;

declare var kCIAttributeTypeTime: string;

/**
 * @since 5.0
 */
declare var kCIAttributeTypeTransform: string;

declare var kCICategoryBlur: string;

declare var kCICategoryBuiltIn: string;

declare var kCICategoryColorAdjustment: string;

declare var kCICategoryColorEffect: string;

declare var kCICategoryCompositeOperation: string;

declare var kCICategoryDistortionEffect: string;

/**
 * @since 9.0
 */
declare var kCICategoryFilterGenerator: string;

declare var kCICategoryGenerator: string;

declare var kCICategoryGeometryAdjustment: string;

declare var kCICategoryGradient: string;

declare var kCICategoryHalftoneEffect: string;

declare var kCICategoryHighDynamicRange: string;

declare var kCICategoryInterlaced: string;

declare var kCICategoryNonSquarePixels: string;

/**
 * @since 5.0
 */
declare var kCICategoryReduction: string;

declare var kCICategorySharpen: string;

declare var kCICategoryStillImage: string;

declare var kCICategoryStylize: string;

declare var kCICategoryTileEffect: string;

declare var kCICategoryTransition: string;

declare var kCICategoryVideo: string;

/**
 * @since 13.0
 */
declare var kCIContextAllowLowPower: string;

/**
 * @since 10.0
 */
declare var kCIContextCacheIntermediates: string;

/**
 * @since 9.0
 */
declare var kCIContextHighQualityDownsample: string;

/**
 * @since 17.0
 */
declare var kCIContextMemoryLimit: string;

/**
 * @since 12.0
 */
declare var kCIContextName: string;

declare var kCIContextOutputColorSpace: string;

/**
 * @since 7.0
 */
declare var kCIContextOutputPremultiplied: string;

/**
 * @since 8.0
 */
declare var kCIContextPriorityRequestLow: string;

declare var kCIContextUseSoftwareRenderer: string;

declare var kCIContextWorkingColorSpace: string;

/**
 * @since 8.0
 */
declare var kCIContextWorkingFormat: string;

/**
 * @since 9.0
 */
declare var kCIFormatA16: number;

/**
 * @since 9.0
 */
declare var kCIFormatA8: number;

/**
 * @since 9.0
 */
declare var kCIFormatABGR8: number;

/**
 * @since 6.0
 */
declare var kCIFormatARGB8: number;

/**
 * @since 9.0
 */
declare var kCIFormatAf: number;

/**
 * @since 9.0
 */
declare var kCIFormatAh: number;

declare var kCIFormatBGRA8: number;

/**
 * @since 10.0
 */
declare var kCIFormatL16: number;

/**
 * @since 10.0
 */
declare var kCIFormatL8: number;

/**
 * @since 10.0
 */
declare var kCIFormatLA16: number;

/**
 * @since 10.0
 */
declare var kCIFormatLA8: number;

/**
 * @since 10.0
 */
declare var kCIFormatLAf: number;

/**
 * @since 10.0
 */
declare var kCIFormatLAh: number;

/**
 * @since 10.0
 */
declare var kCIFormatLf: number;

/**
 * @since 10.0
 */
declare var kCIFormatLh: number;

/**
 * @since 9.0
 */
declare var kCIFormatR16: number;

/**
 * @since 9.0
 */
declare var kCIFormatR8: number;

/**
 * @since 9.0
 */
declare var kCIFormatRG16: number;

/**
 * @since 9.0
 */
declare var kCIFormatRG8: number;

/**
 * @since 17.0
 */
declare var kCIFormatRGB10: number;

/**
 * @since 10.0
 */
declare var kCIFormatRGBA16: number;

declare var kCIFormatRGBA8: number;

/**
 * @since 7.0
 */
declare var kCIFormatRGBAf: number;

/**
 * @since 6.0
 */
declare var kCIFormatRGBAh: number;

/**
 * @since 14.2
 */
declare var kCIFormatRGBX16: number;

/**
 * @since 17.0
 */
declare var kCIFormatRGBXf: number;

/**
 * @since 17.0
 */
declare var kCIFormatRGBXh: number;

/**
 * @since 9.0
 */
declare var kCIFormatRGf: number;

/**
 * @since 9.0
 */
declare var kCIFormatRGh: number;

/**
 * @since 9.0
 */
declare var kCIFormatRf: number;

/**
 * @since 9.0
 */
declare var kCIFormatRh: number;

/**
 * @since 11.0
 */
declare var kCIImageApplyOrientationProperty: string;

/**
 * @since 8.0
 */
declare var kCIImageAutoAdjustCrop: string;

/**
 * @since 5.0
 */
declare var kCIImageAutoAdjustEnhance: string;

/**
 * @since 5.0
 */
declare var kCIImageAutoAdjustFeatures: string;

/**
 * @since 8.0
 */
declare var kCIImageAutoAdjustLevel: string;

/**
 * @since 5.0
 */
declare var kCIImageAutoAdjustRedEye: string;

/**
 * @since 11.0
 */
declare var kCIImageAuxiliaryDepth: string;

/**
 * @since 11.0
 */
declare var kCIImageAuxiliaryDisparity: string;

/**
 * @since 14.1
 */
declare var kCIImageAuxiliaryHDRGainMap: string;

/**
 * @since 12.0
 */
declare var kCIImageAuxiliaryPortraitEffectsMatte: string;

/**
 * @since 14.1
 */
declare var kCIImageAuxiliarySemanticSegmentationGlassesMatte: string;

/**
 * @since 13.0
 */
declare var kCIImageAuxiliarySemanticSegmentationHairMatte: string;

/**
 * @since 13.0
 */
declare var kCIImageAuxiliarySemanticSegmentationSkinMatte: string;

/**
 * @since 14.3
 */
declare var kCIImageAuxiliarySemanticSegmentationSkyMatte: string;

/**
 * @since 13.0
 */
declare var kCIImageAuxiliarySemanticSegmentationTeethMatte: string;

declare var kCIImageCacheImmediately: string;

declare var kCIImageColorSpace: string;

/**
 * @since 18.0
 */
declare var kCIImageContentHeadroom: string;

/**
 * @since 17.0
 */
declare var kCIImageExpandToHDR: string;

/**
 * @since 11.0
 */
declare var kCIImageNearestSampling: string;

/**
 * @since 5.0
 */
declare var kCIImageProperties: string;

/**
 * @since 9.0
 */
declare var kCIImageProviderTileSize: string;

/**
 * @since 9.0
 */
declare var kCIImageProviderUserInfo: string;

/**
 * @since 11.0
 */
declare var kCIImageRepresentationAVDepthData: string;

/**
 * @since 12.0
 */
declare var kCIImageRepresentationAVPortraitEffectsMatte: string;

/**
 * @since 13.0
 */
declare var kCIImageRepresentationAVSemanticSegmentationMattes: string;

/**
 * @since 11.0
 */
declare var kCIImageRepresentationDepthImage: string;

/**
 * @since 11.0
 */
declare var kCIImageRepresentationDisparityImage: string;

/**
 * @since 14.1
 */
declare var kCIImageRepresentationHDRGainMapImage: string;

/**
 * @since 18.0
 */
declare var kCIImageRepresentationHDRImage: string;

/**
 * @since 12.0
 */
declare var kCIImageRepresentationPortraitEffectsMatteImage: string;

/**
 * @since 14.1
 */
declare var kCIImageRepresentationSemanticSegmentationGlassesMatteImage: string;

/**
 * @since 13.0
 */
declare var kCIImageRepresentationSemanticSegmentationHairMatteImage: string;

/**
 * @since 13.0
 */
declare var kCIImageRepresentationSemanticSegmentationSkinMatteImage: string;

/**
 * @since 14.3
 */
declare var kCIImageRepresentationSemanticSegmentationSkyMatteImage: string;

/**
 * @since 13.0
 */
declare var kCIImageRepresentationSemanticSegmentationTeethMatteImage: string;

/**
 * @since 14.1
 */
declare var kCIImageToneMapHDRtoSDR: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputAllowDraftModeKey: string;

/**
 * @since 12.0
 */
declare var kCIInputAmountKey: string;

/**
 * @since 7.0
 */
declare var kCIInputAngleKey: string;

/**
 * @since 7.0
 */
declare var kCIInputAspectRatioKey: string;

/**
 * @since 5.0
 */
declare var kCIInputBackgroundImageKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputBaselineExposureKey: string;

/**
 * @since 9.0
 */
declare var kCIInputBiasKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputBoostKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputBoostShadowAmountKey: string;

/**
 * @since 7.0
 */
declare var kCIInputBrightnessKey: string;

/**
 * @since 7.0
 */
declare var kCIInputCenterKey: string;

/**
 * @since 7.0
 */
declare var kCIInputColorKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputColorNoiseReductionAmountKey: string;

/**
 * @since 7.0
 */
declare var kCIInputContrastKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputDecoderVersionKey: string;

/**
 * @since 11.0
 */
declare var kCIInputDepthImageKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputDisableGamutMapKey: string;

/**
 * @since 11.0
 */
declare var kCIInputDisparityImageKey: string;

/**
 * @since 7.0
 */
declare var kCIInputEVKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputEnableChromaticNoiseTrackingKey: string;

/**
 * @since 12.0
 * @deprecated 100000
 */
declare var kCIInputEnableEDRModeKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputEnableSharpeningKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputEnableVendorLensCorrectionKey: string;

/**
 * @since 7.0
 */
declare var kCIInputExtentKey: string;

/**
 * @since 9.0
 */
declare var kCIInputGradientImageKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputIgnoreImageOrientationKey: string;

/**
 * @since 5.0
 */
declare var kCIInputImageKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputImageOrientationKey: string;

/**
 * @since 7.0
 */
declare var kCIInputIntensityKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputLinearSpaceFilter: string;

/**
 * @since 14.3
 * @deprecated 100000
 */
declare var kCIInputLocalToneMapAmountKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputLuminanceNoiseReductionAmountKey: string;

/**
 * @since 7.0
 */
declare var kCIInputMaskImageKey: string;

/**
 * @since 12.0
 */
declare var kCIInputMatteImageKey: string;

/**
 * @since 11.0
 * @deprecated 100000
 */
declare var kCIInputMoireAmountKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputNeutralChromaticityXKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputNeutralChromaticityYKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputNeutralLocationKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputNeutralTemperatureKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputNeutralTintKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputNoiseReductionAmountKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputNoiseReductionContrastAmountKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputNoiseReductionDetailAmountKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputNoiseReductionSharpnessAmountKey: string;

/**
 * @since 7.0
 */
declare var kCIInputRadiusKey: string;

/**
 * @since 9.0
 */
declare var kCIInputRefractionKey: string;

/**
 * @since 7.0
 */
declare var kCIInputSaturationKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIInputScaleFactorKey: string;

/**
 * @since 7.0
 */
declare var kCIInputScaleKey: string;

/**
 * @since 9.0
 */
declare var kCIInputShadingImageKey: string;

/**
 * @since 7.0
 */
declare var kCIInputSharpnessKey: string;

/**
 * @since 7.0
 */
declare var kCIInputTargetImageKey: string;

/**
 * @since 7.0
 */
declare var kCIInputTimeKey: string;

/**
 * @since 7.0
 */
declare var kCIInputTransformKey: string;

/**
 * @since 6.0
 */
declare var kCIInputVersionKey: string;

/**
 * @since 9.0
 */
declare var kCIInputWeightsKey: string;

/**
 * @since 7.0
 */
declare var kCIInputWidthKey: string;

/**
 * @since 5.0
 */
declare var kCIOutputImageKey: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCIOutputNativeSizeKey: string;

/**
 * @since 15.0
 * @deprecated 100000
 */
declare var kCIPropertiesKey: string;

/**
 * @since 9.0
 */
declare var kCISamplerAffineMatrix: string;

/**
 * @since 9.0
 */
declare var kCISamplerColorSpace: string;

/**
 * @since 9.0
 */
declare var kCISamplerFilterLinear: string;

/**
 * @since 9.0
 */
declare var kCISamplerFilterMode: string;

/**
 * @since 9.0
 */
declare var kCISamplerFilterNearest: string;

/**
 * @since 9.0
 */
declare var kCISamplerWrapBlack: string;

/**
 * @since 9.0
 */
declare var kCISamplerWrapClamp: string;

/**
 * @since 9.0
 */
declare var kCISamplerWrapMode: string;

/**
 * @since 10.0
 * @deprecated 100000
 */
declare var kCISupportedDecoderVersionsKey: string;

/**
 * @since 9.0
 */
declare var kCIUIParameterSet: string;

/**
 * @since 9.0
 */
declare var kCIUISetAdvanced: string;

/**
 * @since 9.0
 */
declare var kCIUISetBasic: string;

/**
 * @since 9.0
 */
declare var kCIUISetDevelopment: string;

/**
 * @since 9.0
 */
declare var kCIUISetIntermediate: string;
