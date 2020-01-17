
declare class MLArrayBatchProvider extends NSObject implements MLBatchProvider {

	static alloc(): MLArrayBatchProvider; // inherited from NSObject

	static new(): MLArrayBatchProvider; // inherited from NSObject

	readonly array: NSArray<MLFeatureProvider>;

	readonly count: number; // inherited from MLBatchProvider

	constructor(o: { dictionary: NSDictionary<string, NSArray<any>>; });

	constructor(o: { featureProviderArray: NSArray<MLFeatureProvider> | MLFeatureProvider[]; });

	featuresAtIndex(index: number): MLFeatureProvider;

	initWithDictionaryError(dictionary: NSDictionary<string, NSArray<any>>): this;

	initWithFeatureProviderArray(array: NSArray<MLFeatureProvider> | MLFeatureProvider[]): this;
}

interface MLBatchProvider {

	count: number;

	featuresAtIndex(index: number): MLFeatureProvider;
}
declare var MLBatchProvider: {

	prototype: MLBatchProvider;
};

declare const enum MLComputeUnits {

	CPUOnly = 0,

	CPUAndGPU = 1,

	All = 2
}

interface MLCustomLayer {

	encodeToCommandBufferInputsOutputsError?(commandBuffer: MTLCommandBuffer, inputs: NSArray<MTLTexture> | MTLTexture[], outputs: NSArray<MTLTexture> | MTLTexture[]): boolean;

	evaluateOnCPUWithInputsOutputsError(inputs: NSArray<MLMultiArray> | MLMultiArray[], outputs: NSArray<MLMultiArray> | MLMultiArray[]): boolean;

	initWithParameterDictionaryError?(parameters: NSDictionary<string, any>): MLCustomLayer;

	outputShapesForInputShapesError(inputShapes: NSArray<NSArray<number>> | NSArray<number>[]): NSArray<NSArray<number>>;

	setWeightDataError(weights: NSArray<NSData> | NSData[]): boolean;
}
declare var MLCustomLayer: {

	prototype: MLCustomLayer;
};

interface MLCustomModel {

	initWithModelDescriptionParameterDictionaryError?(modelDescription: MLModelDescription, parameters: NSDictionary<string, any>): MLCustomModel;

	predictionFromFeaturesOptionsError(input: MLFeatureProvider, options: MLPredictionOptions): MLFeatureProvider;

	predictionsFromBatchOptionsError?(inputBatch: MLBatchProvider, options: MLPredictionOptions): MLBatchProvider;
}
declare var MLCustomModel: {

	prototype: MLCustomModel;
};

declare class MLDictionaryConstraint extends NSObject implements NSSecureCoding {

	static alloc(): MLDictionaryConstraint; // inherited from NSObject

	static new(): MLDictionaryConstraint; // inherited from NSObject

	readonly keyType: MLFeatureType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MLDictionaryFeatureProvider extends NSObject implements MLFeatureProvider, NSFastEnumeration {

	static alloc(): MLDictionaryFeatureProvider; // inherited from NSObject

	static new(): MLDictionaryFeatureProvider; // inherited from NSObject

	readonly dictionary: NSDictionary<string, MLFeatureValue>;

	readonly featureNames: NSSet<string>; // inherited from MLFeatureProvider
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { dictionary: NSDictionary<string, any>; });

	featureValueForName(featureName: string): MLFeatureValue;

	initWithDictionaryError(dictionary: NSDictionary<string, any>): this;

	objectForKeyedSubscript(featureName: string): MLFeatureValue;
}

declare class MLFeatureDescription extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MLFeatureDescription; // inherited from NSObject

	static new(): MLFeatureDescription; // inherited from NSObject

	readonly dictionaryConstraint: MLDictionaryConstraint;

	readonly imageConstraint: MLImageConstraint;

	readonly multiArrayConstraint: MLMultiArrayConstraint;

	readonly name: string;

	readonly optional: boolean;

	readonly sequenceConstraint: MLSequenceConstraint;

	readonly type: MLFeatureType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isAllowedValue(value: MLFeatureValue): boolean;
}

interface MLFeatureProvider {

	featureNames: NSSet<string>;

	featureValueForName(featureName: string): MLFeatureValue;
}
declare var MLFeatureProvider: {

	prototype: MLFeatureProvider;
};

declare const enum MLFeatureType {

	Invalid = 0,

	Int64 = 1,

	Double = 2,

	String = 3,

	Image = 4,

	MultiArray = 5,

	Dictionary = 6,

	Sequence = 7
}

declare class MLFeatureValue extends NSObject implements NSCopying {

	static alloc(): MLFeatureValue; // inherited from NSObject

	static featureValueWithCGImageConstraintOptionsError(cgImage: any, constraint: MLImageConstraint, options: NSDictionary<string, any>): MLFeatureValue;

	static featureValueWithCGImageOrientationConstraintOptionsError(cgImage: any, orientation: CGImagePropertyOrientation, constraint: MLImageConstraint, options: NSDictionary<string, any>): MLFeatureValue;

	static featureValueWithCGImageOrientationPixelsWidePixelsHighPixelFormatTypeOptionsError(cgImage: any, orientation: CGImagePropertyOrientation, pixelsWide: number, pixelsHigh: number, pixelFormatType: number, options: NSDictionary<string, any>): MLFeatureValue;

	static featureValueWithCGImagePixelsWidePixelsHighPixelFormatTypeOptionsError(cgImage: any, pixelsWide: number, pixelsHigh: number, pixelFormatType: number, options: NSDictionary<string, any>): MLFeatureValue;

	static featureValueWithDictionaryError(value: NSDictionary<any, number>): MLFeatureValue;

	static featureValueWithDouble(value: number): MLFeatureValue;

	static featureValueWithImageAtURLConstraintOptionsError(url: NSURL, constraint: MLImageConstraint, options: NSDictionary<string, any>): MLFeatureValue;

	static featureValueWithImageAtURLOrientationConstraintOptionsError(url: NSURL, orientation: CGImagePropertyOrientation, constraint: MLImageConstraint, options: NSDictionary<string, any>): MLFeatureValue;

	static featureValueWithImageAtURLOrientationPixelsWidePixelsHighPixelFormatTypeOptionsError(url: NSURL, orientation: CGImagePropertyOrientation, pixelsWide: number, pixelsHigh: number, pixelFormatType: number, options: NSDictionary<string, any>): MLFeatureValue;

	static featureValueWithImageAtURLPixelsWidePixelsHighPixelFormatTypeOptionsError(url: NSURL, pixelsWide: number, pixelsHigh: number, pixelFormatType: number, options: NSDictionary<string, any>): MLFeatureValue;

	static featureValueWithInt64(value: number): MLFeatureValue;

	static featureValueWithMultiArray(value: MLMultiArray): MLFeatureValue;

	static featureValueWithPixelBuffer(value: any): MLFeatureValue;

	static featureValueWithSequence(sequence: MLSequence): MLFeatureValue;

	static featureValueWithString(value: string): MLFeatureValue;

	static new(): MLFeatureValue; // inherited from NSObject

	static undefinedFeatureValueWithType(type: MLFeatureType): MLFeatureValue;

	readonly dictionaryValue: NSDictionary<any, number>;

	readonly doubleValue: number;

	readonly imageBufferValue: any;

	readonly int64Value: number;

	readonly multiArrayValue: MLMultiArray;

	readonly sequenceValue: MLSequence;

	readonly stringValue: string;

	readonly type: MLFeatureType;

	readonly undefined: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	isEqualToFeatureValue(value: MLFeatureValue): boolean;
}

declare var MLFeatureValueImageOptionCropAndScale: string;

declare var MLFeatureValueImageOptionCropRect: string;

declare class MLImageConstraint extends NSObject implements NSSecureCoding {

	static alloc(): MLImageConstraint; // inherited from NSObject

	static new(): MLImageConstraint; // inherited from NSObject

	readonly pixelFormatType: number;

	readonly pixelsHigh: number;

	readonly pixelsWide: number;

	readonly sizeConstraint: MLImageSizeConstraint;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MLImageSize extends NSObject implements NSSecureCoding {

	static alloc(): MLImageSize; // inherited from NSObject

	static new(): MLImageSize; // inherited from NSObject

	readonly pixelsHigh: number;

	readonly pixelsWide: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MLImageSizeConstraint extends NSObject implements NSSecureCoding {

	static alloc(): MLImageSizeConstraint; // inherited from NSObject

	static new(): MLImageSizeConstraint; // inherited from NSObject

	readonly enumeratedImageSizes: NSArray<MLImageSize>;

	readonly pixelsHighRange: NSRange;

	readonly pixelsWideRange: NSRange;

	readonly type: MLImageSizeConstraintType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum MLImageSizeConstraintType {

	Unspecified = 0,

	Enumerated = 2,

	Range = 3
}

declare class MLKey extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MLKey; // inherited from NSObject

	static new(): MLKey; // inherited from NSObject

	readonly name: string;

	readonly scope: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MLMetricKey extends MLKey {

	static alloc(): MLMetricKey; // inherited from NSObject

	static new(): MLMetricKey; // inherited from NSObject

	static readonly epochIndex: MLMetricKey;

	static readonly lossValue: MLMetricKey;

	static readonly miniBatchIndex: MLMetricKey;
}

declare class MLModel extends NSObject {

	static alloc(): MLModel; // inherited from NSObject

	static compileModelAtURLError(modelURL: NSURL): NSURL;

	static modelWithContentsOfURLConfigurationError(url: NSURL, configuration: MLModelConfiguration): MLModel;

	static modelWithContentsOfURLError(url: NSURL): MLModel;

	static new(): MLModel; // inherited from NSObject

	readonly configuration: MLModelConfiguration;

	readonly modelDescription: MLModelDescription;

	parameterValueForKeyError(key: MLParameterKey): any;

	predictionFromFeaturesError(input: MLFeatureProvider): MLFeatureProvider;

	predictionFromFeaturesOptionsError(input: MLFeatureProvider, options: MLPredictionOptions): MLFeatureProvider;

	predictionsFromBatchError(inputBatch: MLBatchProvider): MLBatchProvider;

	predictionsFromBatchOptionsError(inputBatch: MLBatchProvider, options: MLPredictionOptions): MLBatchProvider;
}

declare var MLModelAuthorKey: string;

declare class MLModelConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MLModelConfiguration; // inherited from NSObject

	static new(): MLModelConfiguration; // inherited from NSObject

	allowLowPrecisionAccumulationOnGPU: boolean;

	computeUnits: MLComputeUnits;

	parameters: NSDictionary<MLParameterKey, any>;

	preferredMetalDevice: MTLDevice;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var MLModelCreatorDefinedKey: string;

declare class MLModelDescription extends NSObject implements NSSecureCoding {

	static alloc(): MLModelDescription; // inherited from NSObject

	static new(): MLModelDescription; // inherited from NSObject

	readonly inputDescriptionsByName: NSDictionary<string, MLFeatureDescription>;

	readonly isUpdatable: boolean;

	readonly metadata: NSDictionary<string, any>;

	readonly outputDescriptionsByName: NSDictionary<string, MLFeatureDescription>;

	readonly parameterDescriptionsByKey: NSDictionary<MLParameterKey, MLParameterDescription>;

	readonly predictedFeatureName: string;

	readonly predictedProbabilitiesName: string;

	readonly trainingInputDescriptionsByName: NSDictionary<string, MLFeatureDescription>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var MLModelDescriptionKey: string;

declare const enum MLModelError {

	Generic = 0,

	FeatureType = 1,

	IO = 3,

	CustomLayer = 4,

	CustomModel = 5,

	Update = 6,

	Parameters = 7
}

declare var MLModelErrorDomain: string;

declare var MLModelLicenseKey: string;

declare var MLModelVersionStringKey: string;

declare class MLMultiArray extends NSObject {

	static alloc(): MLMultiArray; // inherited from NSObject

	static new(): MLMultiArray; // inherited from NSObject

	readonly count: number;

	readonly dataPointer: interop.Pointer | interop.Reference<any>;

	readonly dataType: MLMultiArrayDataType;

	readonly shape: NSArray<number>;

	readonly strides: NSArray<number>;
	[index: number]: number;

	constructor(o: { dataPointer: interop.Pointer | interop.Reference<any>; shape: NSArray<number> | number[]; dataType: MLMultiArrayDataType; strides: NSArray<number> | number[]; deallocator: (p1: interop.Pointer | interop.Reference<any>) => void; });

	constructor(o: { shape: NSArray<number> | number[]; dataType: MLMultiArrayDataType; });

	initWithDataPointerShapeDataTypeStridesDeallocatorError(dataPointer: interop.Pointer | interop.Reference<any>, shape: NSArray<number> | number[], dataType: MLMultiArrayDataType, strides: NSArray<number> | number[], deallocator: (p1: interop.Pointer | interop.Reference<any>) => void): this;

	initWithShapeDataTypeError(shape: NSArray<number> | number[], dataType: MLMultiArrayDataType): this;

	objectAtIndexedSubscript(idx: number): number;

	objectForKeyedSubscript(key: NSArray<number> | number[]): number;

	setObjectAtIndexedSubscript(obj: number, idx: number): void;

	setObjectForKeyedSubscript(obj: number, key: NSArray<number> | number[]): void;
}

declare class MLMultiArrayConstraint extends NSObject implements NSSecureCoding {

	static alloc(): MLMultiArrayConstraint; // inherited from NSObject

	static new(): MLMultiArrayConstraint; // inherited from NSObject

	readonly dataType: MLMultiArrayDataType;

	readonly shape: NSArray<number>;

	readonly shapeConstraint: MLMultiArrayShapeConstraint;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum MLMultiArrayDataType {

	Double = 65600,

	Float32 = 65568,

	Int32 = 131104
}

declare class MLMultiArrayShapeConstraint extends NSObject implements NSSecureCoding {

	static alloc(): MLMultiArrayShapeConstraint; // inherited from NSObject

	static new(): MLMultiArrayShapeConstraint; // inherited from NSObject

	readonly enumeratedShapes: NSArray<NSArray<number>>;

	readonly sizeRangeForDimension: NSArray<NSValue>;

	readonly type: MLMultiArrayShapeConstraintType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum MLMultiArrayShapeConstraintType {

	Unspecified = 1,

	Enumerated = 2,

	Range = 3
}

declare class MLNumericConstraint extends NSObject implements NSSecureCoding {

	static alloc(): MLNumericConstraint; // inherited from NSObject

	static new(): MLNumericConstraint; // inherited from NSObject

	readonly enumeratedNumbers: NSSet<number>;

	readonly maxNumber: number;

	readonly minNumber: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MLParameterDescription extends NSObject implements NSSecureCoding {

	static alloc(): MLParameterDescription; // inherited from NSObject

	static new(): MLParameterDescription; // inherited from NSObject

	readonly defaultValue: any;

	readonly key: MLParameterKey;

	readonly numericConstraint: MLNumericConstraint;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MLParameterKey extends MLKey {

	static alloc(): MLParameterKey; // inherited from NSObject

	static new(): MLParameterKey; // inherited from NSObject

	static readonly beta1: MLParameterKey;

	static readonly beta2: MLParameterKey;

	static readonly biases: MLParameterKey;

	static readonly epochs: MLParameterKey;

	static readonly eps: MLParameterKey;

	static readonly learningRate: MLParameterKey;

	static readonly linkedModelFileName: MLParameterKey;

	static readonly linkedModelSearchPath: MLParameterKey;

	static readonly miniBatchSize: MLParameterKey;

	static readonly momentum: MLParameterKey;

	static readonly numberOfNeighbors: MLParameterKey;

	static readonly seed: MLParameterKey;

	static readonly shuffle: MLParameterKey;

	static readonly weights: MLParameterKey;

	scopedTo(scope: string): MLParameterKey;
}

declare class MLPredictionOptions extends NSObject {

	static alloc(): MLPredictionOptions; // inherited from NSObject

	static new(): MLPredictionOptions; // inherited from NSObject

	usesCPUOnly: boolean;
}

declare class MLSequence extends NSObject {

	static alloc(): MLSequence; // inherited from NSObject

	static emptySequenceWithType(type: MLFeatureType): MLSequence;

	static new(): MLSequence; // inherited from NSObject

	static sequenceWithInt64Array(int64Values: NSArray<number> | number[]): MLSequence;

	static sequenceWithStringArray(stringValues: NSArray<string> | string[]): MLSequence;

	readonly int64Values: NSArray<number>;

	readonly stringValues: NSArray<string>;

	readonly type: MLFeatureType;
}

declare class MLSequenceConstraint extends NSObject implements NSSecureCoding {

	static alloc(): MLSequenceConstraint; // inherited from NSObject

	static new(): MLSequenceConstraint; // inherited from NSObject

	readonly countRange: NSRange;

	readonly valueDescription: MLFeatureDescription;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MLTask extends NSObject {

	static alloc(): MLTask; // inherited from NSObject

	static new(): MLTask; // inherited from NSObject

	readonly error: NSError;

	readonly state: MLTaskState;

	readonly taskIdentifier: string;

	cancel(): void;

	resume(): void;
}

declare const enum MLTaskState {

	Suspended = 1,

	Running = 2,

	Cancelling = 3,

	Completed = 4,

	Failed = 5
}

declare class MLUpdateContext extends NSObject {

	static alloc(): MLUpdateContext; // inherited from NSObject

	static new(): MLUpdateContext; // inherited from NSObject

	readonly event: MLUpdateProgressEvent;

	readonly metrics: NSDictionary<MLMetricKey, any>;

	readonly model: MLModel;

	readonly parameters: NSDictionary<MLParameterKey, any>;

	readonly task: MLUpdateTask;
}

declare const enum MLUpdateProgressEvent {

	TrainingBegin = 1,

	EpochEnd = 2,

	MiniBatchEnd = 4
}

declare class MLUpdateProgressHandlers extends NSObject {

	static alloc(): MLUpdateProgressHandlers; // inherited from NSObject

	static new(): MLUpdateProgressHandlers; // inherited from NSObject

	constructor(o: { forEvents: MLUpdateProgressEvent; progressHandler: (p1: MLUpdateContext) => void; completionHandler: (p1: MLUpdateContext) => void; });

	initForEventsProgressHandlerCompletionHandler(interestedEvents: MLUpdateProgressEvent, progressHandler: (p1: MLUpdateContext) => void, completionHandler: (p1: MLUpdateContext) => void): this;
}

declare class MLUpdateTask extends MLTask {

	static alloc(): MLUpdateTask; // inherited from NSObject

	static new(): MLUpdateTask; // inherited from NSObject

	static updateTaskForModelAtURLTrainingDataConfigurationCompletionHandlerError(modelURL: NSURL, trainingData: MLBatchProvider, configuration: MLModelConfiguration, completionHandler: (p1: MLUpdateContext) => void): MLUpdateTask;

	static updateTaskForModelAtURLTrainingDataConfigurationProgressHandlersError(modelURL: NSURL, trainingData: MLBatchProvider, configuration: MLModelConfiguration, progressHandlers: MLUpdateProgressHandlers): MLUpdateTask;

	resumeWithParameters(updateParameters: NSDictionary<MLParameterKey, any>): void;
}

interface MLWritable extends NSObjectProtocol {

	writeToURLError(url: NSURL): boolean;
}
declare var MLWritable: {

	prototype: MLWritable;
};
