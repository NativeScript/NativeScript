
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

	Dictionary = 6
}

declare class MLFeatureValue extends NSObject implements NSCopying {

	static alloc(): MLFeatureValue; // inherited from NSObject

	static featureValueWithDictionaryError(value: NSDictionary<any, number>): MLFeatureValue;

	static featureValueWithDouble(value: number): MLFeatureValue;

	static featureValueWithInt64(value: number): MLFeatureValue;

	static featureValueWithMultiArray(value: MLMultiArray): MLFeatureValue;

	static featureValueWithPixelBuffer(value: any): MLFeatureValue;

	static featureValueWithString(value: string): MLFeatureValue;

	static new(): MLFeatureValue; // inherited from NSObject

	static undefinedFeatureValueWithType(type: MLFeatureType): MLFeatureValue;

	readonly dictionaryValue: NSDictionary<any, number>;

	readonly doubleValue: number;

	readonly imageBufferValue: any;

	readonly int64Value: number;

	readonly multiArrayValue: MLMultiArray;

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
}

declare class MLModel extends NSObject {

	static alloc(): MLModel; // inherited from NSObject

	static compileModelAtURLError(modelURL: NSURL): NSURL;

	static modelWithContentsOfURLError(url: NSURL): MLModel;

	static new(): MLModel; // inherited from NSObject

	readonly modelDescription: MLModelDescription;

	predictionFromFeaturesError(input: MLFeatureProvider): MLFeatureProvider;

	predictionFromFeaturesOptionsError(input: MLFeatureProvider, options: MLPredictionOptions): MLFeatureProvider;
}

declare var MLModelAuthorKey: string;

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

	IO = 3
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

	constructor(o: { dataPointer: interop.Pointer | interop.Reference<any>; shape: NSArray<number>; dataType: MLMultiArrayDataType; strides: NSArray<number>; deallocator: (p1: interop.Pointer | interop.Reference<any>) => void; });

	constructor(o: { shape: NSArray<number>; dataType: MLMultiArrayDataType; });

	initWithDataPointerShapeDataTypeStridesDeallocatorError(dataPointer: interop.Pointer | interop.Reference<any>, shape: NSArray<number>, dataType: MLMultiArrayDataType, strides: NSArray<number>, deallocator: (p1: interop.Pointer | interop.Reference<any>) => void): this;

	initWithShapeDataTypeError(shape: NSArray<number>, dataType: MLMultiArrayDataType): this;

	objectAtIndexedSubscript(idx: number): number;

	objectForKeyedSubscript(key: NSArray<number>): number;

	setObjectAtIndexedSubscript(obj: number, idx: number): void;

	setObjectForKeyedSubscript(obj: number, key: NSArray<number>): void;
}

declare class MLMultiArrayConstraint extends NSObject {

	static alloc(): MLMultiArrayConstraint; // inherited from NSObject

	static new(): MLMultiArrayConstraint; // inherited from NSObject

	readonly dataType: MLMultiArrayDataType;

	readonly shape: NSArray<number>;
}

declare const enum MLMultiArrayDataType {

	Double = 65600,

	Float32 = 65568,

	Int32 = 131104
}

declare class MLPredictionOptions extends NSObject {

	static alloc(): MLPredictionOptions; // inherited from NSObject

	static new(): MLPredictionOptions; // inherited from NSObject

	usesCPUOnly: boolean;
}
