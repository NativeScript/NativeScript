
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

declare class MLDictionaryConstraint extends NSObject {

	static alloc(): MLDictionaryConstraint; // inherited from NSObject

	static new(): MLDictionaryConstraint; // inherited from NSObject

	readonly keyType: MLFeatureType;
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

declare class MLFeatureDescription extends NSObject implements NSCopying {

	static alloc(): MLFeatureDescription; // inherited from NSObject

	static new(): MLFeatureDescription; // inherited from NSObject

	readonly dictionaryConstraint: MLDictionaryConstraint;

	readonly imageConstraint: MLImageConstraint;

	readonly multiArrayConstraint: MLMultiArrayConstraint;

	readonly name: string;

	readonly optional: boolean;

	readonly sequenceConstraint: MLSequenceConstraint;

	readonly type: MLFeatureType;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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

	static featureValueWithDictionaryError(value: NSDictionary<any, number>): MLFeatureValue;

	static featureValueWithDouble(value: number): MLFeatureValue;

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

declare class MLImageConstraint extends NSObject {

	static alloc(): MLImageConstraint; // inherited from NSObject

	static new(): MLImageConstraint; // inherited from NSObject

	readonly pixelFormatType: number;

	readonly pixelsHigh: number;

	readonly pixelsWide: number;

	readonly sizeConstraint: MLImageSizeConstraint;
}

declare class MLImageSize extends NSObject {

	static alloc(): MLImageSize; // inherited from NSObject

	static new(): MLImageSize; // inherited from NSObject

	readonly pixelsHigh: number;

	readonly pixelsWide: number;
}

declare class MLImageSizeConstraint extends NSObject {

	static alloc(): MLImageSizeConstraint; // inherited from NSObject

	static new(): MLImageSizeConstraint; // inherited from NSObject

	readonly enumeratedImageSizes: NSArray<MLImageSize>;

	readonly pixelsHighRange: NSRange;

	readonly pixelsWideRange: NSRange;

	readonly type: MLImageSizeConstraintType;
}

declare const enum MLImageSizeConstraintType {

	Unspecified = 0,

	Enumerated = 2,

	Range = 3
}

declare class MLModel extends NSObject {

	static alloc(): MLModel; // inherited from NSObject

	static compileModelAtURLError(modelURL: NSURL): NSURL;

	static modelWithContentsOfURLConfigurationError(url: NSURL, configuration: MLModelConfiguration): MLModel;

	static modelWithContentsOfURLError(url: NSURL): MLModel;

	static new(): MLModel; // inherited from NSObject

	readonly configuration: MLModelConfiguration;

	readonly modelDescription: MLModelDescription;

	predictionFromFeaturesError(input: MLFeatureProvider): MLFeatureProvider;

	predictionFromFeaturesOptionsError(input: MLFeatureProvider, options: MLPredictionOptions): MLFeatureProvider;

	predictionsFromBatchOptionsError(inputBatch: MLBatchProvider, options: MLPredictionOptions): MLBatchProvider;
}

declare var MLModelAuthorKey: string;

declare class MLModelConfiguration extends NSObject implements NSCopying {

	static alloc(): MLModelConfiguration; // inherited from NSObject

	static new(): MLModelConfiguration; // inherited from NSObject

	computeUnits: MLComputeUnits;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var MLModelCreatorDefinedKey: string;

declare class MLModelDescription extends NSObject {

	static alloc(): MLModelDescription; // inherited from NSObject

	static new(): MLModelDescription; // inherited from NSObject

	readonly inputDescriptionsByName: NSDictionary<string, MLFeatureDescription>;

	readonly metadata: NSDictionary<string, any>;

	readonly outputDescriptionsByName: NSDictionary<string, MLFeatureDescription>;

	readonly predictedFeatureName: string;

	readonly predictedProbabilitiesName: string;
}

declare var MLModelDescriptionKey: string;

declare const enum MLModelError {

	Generic = 0,

	FeatureType = 1,

	IO = 3,

	CustomLayer = 4,

	CustomModel = 5
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

declare class MLMultiArrayConstraint extends NSObject {

	static alloc(): MLMultiArrayConstraint; // inherited from NSObject

	static new(): MLMultiArrayConstraint; // inherited from NSObject

	readonly dataType: MLMultiArrayDataType;

	readonly shape: NSArray<number>;

	readonly shapeConstraint: MLMultiArrayShapeConstraint;
}

declare const enum MLMultiArrayDataType {

	Double = 65600,

	Float32 = 65568,

	Int32 = 131104
}

declare class MLMultiArrayShapeConstraint extends NSObject {

	static alloc(): MLMultiArrayShapeConstraint; // inherited from NSObject

	static new(): MLMultiArrayShapeConstraint; // inherited from NSObject

	readonly enumeratedShapes: NSArray<NSArray<number>>;

	readonly sizeRangeForDimension: NSArray<NSValue>;

	readonly type: MLMultiArrayShapeConstraintType;
}

declare const enum MLMultiArrayShapeConstraintType {

	Unspecified = 1,

	Enumerated = 2,

	Range = 3
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

declare class MLSequenceConstraint extends NSObject {

	static alloc(): MLSequenceConstraint; // inherited from NSObject

	static new(): MLSequenceConstraint; // inherited from NSObject

	readonly countRange: NSRange;

	readonly valueDescription: MLFeatureDescription;
}
