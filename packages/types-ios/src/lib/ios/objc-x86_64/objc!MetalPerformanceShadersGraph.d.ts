
declare class MPSGraph extends NSObject {

	static alloc(): MPSGraph; // inherited from NSObject

	static new(): MPSGraph; // inherited from NSObject

	options: MPSGraphOptions;

	readonly placeholderTensors: NSArray<MPSGraphTensor>;

	absoluteWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	acosWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	acoshWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	additionWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	applyStochasticGradientDescentWithLearningRateTensorVariableGradientTensorName(learningRateTensor: MPSGraphTensor, variable: MPSGraphVariableOp, gradientTensor: MPSGraphTensor, name: string): MPSGraphOperation;

	asinWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	asinhWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	assignVariableWithValueOfTensorName(variable: MPSGraphTensor, tensor: MPSGraphTensor, name: string): MPSGraphOperation;

	atan2WithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	atanWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	atanhWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	avgPooling2DGradientWithGradientTensorSourceTensorDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string): MPSGraphTensor;

	avgPooling2DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string): MPSGraphTensor;

	ceilWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	clampWithTensorMinValueTensorMaxValueTensorName(tensor: MPSGraphTensor, minValueTensor: MPSGraphTensor, maxValueTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	concatTensorWithTensorDimensionName(tensor: MPSGraphTensor, tensor2: MPSGraphTensor, dimensionIndex: number, name: string): MPSGraphTensor;

	concatTensorsDimensionName(tensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], dimensionIndex: number, name: string): MPSGraphTensor;

	convolution2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolution2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolution2DWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolutionTranspose2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolutionTranspose2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeForwardConvolutionDescriptorName(incomingGradientTensor: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolutionTranspose2DWithSourceTensorWeightsTensorOutputShapeDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	cosWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	coshWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	depthwiseConvolution2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphDepthwiseConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	depthwiseConvolution2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeDescriptorName(incomingGradient: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphDepthwiseConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	depthwiseConvolution2DWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphDepthwiseConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	divisionNoNaNWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	divisionWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	dropoutTensorRateName(tensor: MPSGraphTensor, rate: number, name: string): MPSGraphTensor;

	dropoutTensorRateTensorName(tensor: MPSGraphTensor, rate: MPSGraphTensor, name: string): MPSGraphTensor;

	equalWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	erfWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	exponentBase10WithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	exponentBase2WithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	exponentWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	floorModuloWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	floorWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	gatherNDWithUpdatesTensorIndicesTensorBatchDimensionsName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, batchDimensions: number, name: string): MPSGraphTensor;

	gatherWithUpdatesTensorIndicesTensorAxisBatchDimensionsName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, axis: number, batchDimensions: number, name: string): MPSGraphTensor;

	gradientForPrimaryTensorWithTensorsName(primaryTensor: MPSGraphTensor, tensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], name: string): NSDictionary<MPSGraphTensor, MPSGraphTensor>;

	greaterThanOrEqualToWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	greaterThanWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	identityWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	isFiniteWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	isInfiniteWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	isNaNWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	lessThanOrEqualToWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	lessThanWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	logarithmBase10WithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	logarithmBase2WithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	logarithmWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	logicalANDWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	logicalNANDWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	logicalNORWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	logicalORWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	logicalXNORWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	logicalXORWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	matrixMultiplicationWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	maxPooling2DGradientWithGradientTensorSourceTensorDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string): MPSGraphTensor;

	maxPooling2DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string): MPSGraphTensor;

	maximumWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	meanOfTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	minimumWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	moduloWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	multiplicationWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	negativeWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	normalizationBetaGradientWithIncomingGradientTensorSourceTensorReductionAxesName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	normalizationGammaGradientWithIncomingGradientTensorSourceTensorMeanTensorVarianceTensorReductionAxesEpsilonName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, meanTensor: MPSGraphTensor, varianceTensor: MPSGraphTensor, axes: NSArray<number> | number[], epsilon: number, name: string): MPSGraphTensor;

	normalizationGradientWithIncomingGradientTensorSourceTensorMeanTensorVarianceTensorGammaTensorGammaGradientTensorBetaGradientTensorReductionAxesEpsilonName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, meanTensor: MPSGraphTensor, varianceTensor: MPSGraphTensor, gamma: MPSGraphTensor, gammaGradient: MPSGraphTensor, betaGradient: MPSGraphTensor, axes: NSArray<number> | number[], epsilon: number, name: string): MPSGraphTensor;

	normalizationWithTensorMeanTensorVarianceTensorGammaTensorBetaTensorEpsilonName(tensor: MPSGraphTensor, mean: MPSGraphTensor, variance: MPSGraphTensor, gamma: MPSGraphTensor, beta: MPSGraphTensor, epsilon: number, name: string): MPSGraphTensor;

	notEqualWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	notWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	oneHotWithIndicesTensorDepthAxisName(indicesTensor: MPSGraphTensor, depth: number, axis: number, name: string): MPSGraphTensor;

	oneHotWithIndicesTensorDepthName(indicesTensor: MPSGraphTensor, depth: number, name: string): MPSGraphTensor;

	padGradientWithIncomingGradientTensorSourceTensorPaddingModeLeftPaddingRightPaddingName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, paddingMode: MPSGraphPaddingMode, leftPadding: NSArray<number> | number[], rightPadding: NSArray<number> | number[], name: string): MPSGraphTensor;

	padTensorWithPaddingModeLeftPaddingRightPaddingConstantValueName(tensor: MPSGraphTensor, paddingMode: MPSGraphPaddingMode, leftPadding: NSArray<number> | number[], rightPadding: NSArray<number> | number[], constantValue: number, name: string): MPSGraphTensor;

	placeholderWithShapeName(shape: NSArray<number> | number[], name: string): MPSGraphTensor;

	powerWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	reLUGradientWithIncomingGradientSourceTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, name: string): MPSGraphTensor;

	reLUWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	readVariableName(variable: MPSGraphTensor, name: string): MPSGraphTensor;

	reciprocalWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	reductionMaximumWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionMaximumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionMinimumWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionMinimumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionProductWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionProductWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionSumWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionSumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reshapeTensorWithShapeName(tensor: MPSGraphTensor, shape: NSArray<number> | number[], name: string): MPSGraphTensor;

	resizeTensorSizeModeCenterResultAlignCornersLayoutName(imagesTensor: MPSGraphTensor, size: NSArray<number> | number[], mode: MPSGraphResizeMode, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string): MPSGraphTensor;

	resizeWithGradientTensorInputModeCenterResultAlignCornersLayoutName(gradient: MPSGraphTensor, input: MPSGraphTensor, mode: MPSGraphResizeMode, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string): MPSGraphTensor;

	reverseSquareRootWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	rintWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	roundWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	runAsyncWithFeedsTargetTensorsTargetOperationsExecutionDescriptor(feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[], executionDescriptor: MPSGraphExecutionDescriptor): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	runAsyncWithMTLCommandQueueFeedsTargetOperationsResultsDictionaryExecutionDescriptor(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[], resultsDictionary: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, executionDescriptor: MPSGraphExecutionDescriptor): void;

	runAsyncWithMTLCommandQueueFeedsTargetTensorsTargetOperationsExecutionDescriptor(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[], executionDescriptor: MPSGraphExecutionDescriptor): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	runWithFeedsTargetTensorsTargetOperations(feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[]): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	runWithMTLCommandQueueFeedsTargetOperationsResultsDictionary(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[], resultsDictionary: NSDictionary<MPSGraphTensor, MPSGraphTensorData>): void;

	runWithMTLCommandQueueFeedsTargetTensorsTargetOperations(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[]): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	scatterNDWithUpdatesTensorIndicesTensorShapeBatchDimensionsName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], batchDimensions: number, name: string): MPSGraphTensor;

	selectWithPredicateTensorTruePredicateTensorFalsePredicateTensorName(predicateTensor: MPSGraphTensor, truePredicateTensor: MPSGraphTensor, falseSelectTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	sigmoidGradientWithIncomingGradientSourceTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, name: string): MPSGraphTensor;

	sigmoidWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	signWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	signbitWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	sinWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	sinhWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	sliceTensorDimensionStartLengthName(tensor: MPSGraphTensor, dimensionIndex: number, start: number, length: number, name: string): MPSGraphTensor;

	softMaxCrossEntropyGradientWithIncomingGradientTensorSourceTensorLabelsTensorAxisReductionTypeName(gradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, labelsTensor: MPSGraphTensor, axis: number, reductionType: MPSGraphLossReductionType, name: string): MPSGraphTensor;

	softMaxCrossEntropyWithSourceTensorLabelsTensorAxisReductionTypeName(sourceTensor: MPSGraphTensor, labelsTensor: MPSGraphTensor, axis: number, reductionType: MPSGraphLossReductionType, name: string): MPSGraphTensor;

	softMaxGradientWithIncomingGradientSourceTensorAxisName(gradient: MPSGraphTensor, source: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	softMaxWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	squareRootWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	squareWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	stochasticGradientDescentWithLearningRateTensorValuesTensorGradientTensorName(learningRateTensor: MPSGraphTensor, valuesTensor: MPSGraphTensor, gradientTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	subtractionWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	tanWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	tanhWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	tileGradientWithIncomingGradientTensorSourceTensorWithMultiplierName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, multiplier: NSArray<number> | number[], name: string): MPSGraphTensor;

	tileTensorWithMultiplierName(tensor: MPSGraphTensor, multiplier: NSArray<number> | number[], name: string): MPSGraphTensor;

	transposeTensorDimensionWithDimensionName(tensor: MPSGraphTensor, dimensionIndex: number, dimensionIndex2: number, name: string): MPSGraphTensor;

	varianceOfTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	varianceOfTensorMeanTensorAxesName(tensor: MPSGraphTensor, meanTensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;
}

declare class MPSGraphConvolution2DOpDescriptor extends NSObject implements NSCopying {

	static alloc(): MPSGraphConvolution2DOpDescriptor; // inherited from NSObject

	static descriptorWithStrideInXStrideInYDilationRateInXDilationRateInYGroupsPaddingLeftPaddingRightPaddingTopPaddingBottomPaddingStyleDataLayoutWeightsLayout(strideInX: number, strideInY: number, dilationRateInX: number, dilationRateInY: number, groups: number, paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout, weightsLayout: MPSGraphTensorNamedDataLayout): MPSGraphConvolution2DOpDescriptor;

	static descriptorWithStrideInXStrideInYDilationRateInXDilationRateInYGroupsPaddingStyleDataLayoutWeightsLayout(strideInX: number, strideInY: number, dilationRateInX: number, dilationRateInY: number, groups: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout, weightsLayout: MPSGraphTensorNamedDataLayout): MPSGraphConvolution2DOpDescriptor;

	static new(): MPSGraphConvolution2DOpDescriptor; // inherited from NSObject

	dataLayout: MPSGraphTensorNamedDataLayout;

	dilationRateInX: number;

	dilationRateInY: number;

	groups: number;

	paddingBottom: number;

	paddingLeft: number;

	paddingRight: number;

	paddingStyle: MPSGraphPaddingStyle;

	paddingTop: number;

	strideInX: number;

	strideInY: number;

	weightsLayout: MPSGraphTensorNamedDataLayout;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	setExplicitPaddingWithPaddingLeftPaddingRightPaddingTopPaddingBottom(paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number): void;
}

declare class MPSGraphDepthwiseConvolution2DOpDescriptor extends NSObject implements NSCopying {

	static alloc(): MPSGraphDepthwiseConvolution2DOpDescriptor; // inherited from NSObject

	static descriptorWithDataLayoutWeightsLayout(dataLayout: MPSGraphTensorNamedDataLayout, weightsLayout: MPSGraphTensorNamedDataLayout): MPSGraphDepthwiseConvolution2DOpDescriptor;

	static descriptorWithStrideInXStrideInYDilationRateInXDilationRateInYPaddingLeftPaddingRightPaddingTopPaddingBottomPaddingStyleDataLayoutWeightsLayout(strideInX: number, strideInY: number, dilationRateInX: number, dilationRateInY: number, paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout, weightsLayout: MPSGraphTensorNamedDataLayout): MPSGraphDepthwiseConvolution2DOpDescriptor;

	static new(): MPSGraphDepthwiseConvolution2DOpDescriptor; // inherited from NSObject

	dataLayout: MPSGraphTensorNamedDataLayout;

	dilationRateInX: number;

	dilationRateInY: number;

	paddingBottom: number;

	paddingLeft: number;

	paddingRight: number;

	paddingStyle: MPSGraphPaddingStyle;

	paddingTop: number;

	strideInX: number;

	strideInY: number;

	weightsLayout: MPSGraphTensorNamedDataLayout;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	setExplicitPaddingWithPaddingLeftPaddingRightPaddingTopPaddingBottom(paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number): void;
}

declare class MPSGraphDevice extends NSObject {

	static alloc(): MPSGraphDevice; // inherited from NSObject

	static deviceWithMTLDevice(metalDevice: MTLDevice): MPSGraphDevice;

	static new(): MPSGraphDevice; // inherited from NSObject

	readonly metalDevice: MTLDevice;

	readonly type: MPSGraphDeviceType;
}

declare const enum MPSGraphDeviceType {

	Metal = 0
}

declare class MPSGraphExecutionDescriptor extends NSObject {

	static alloc(): MPSGraphExecutionDescriptor; // inherited from NSObject

	static new(): MPSGraphExecutionDescriptor; // inherited from NSObject

	completionHandler: (p1: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, p2: NSError) => void;

	scheduledHandler: (p1: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, p2: NSError) => void;

	waitUntilCompleted: boolean;
}

declare const enum MPSGraphLossReductionType {

	Axis = 0,

	Sum = 1
}

declare class MPSGraphOperation extends NSObject implements NSCopying {

	static alloc(): MPSGraphOperation; // inherited from NSObject

	static new(): MPSGraphOperation; // inherited from NSObject

	readonly controlDependencies: NSArray<MPSGraphOperation>;

	readonly graph: MPSGraph;

	readonly inputTensors: NSArray<MPSGraphTensor>;

	readonly name: string;

	readonly outputTensors: NSArray<MPSGraphTensor>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum MPSGraphOptions {

	None = 0,

	SynchronizeResults = 1,

	Verbose = 2,

	Default = 1
}

declare const enum MPSGraphPaddingMode {

	Constant = 0,

	Reflect = 1,

	Symmetric = 2
}

declare const enum MPSGraphPaddingStyle {

	Explicit = 0,

	TF_VALID = 1,

	TF_SAME = 2
}

declare class MPSGraphPooling2DOpDescriptor extends NSObject implements NSCopying {

	static alloc(): MPSGraphPooling2DOpDescriptor; // inherited from NSObject

	static descriptorWithKernelWidthKernelHeightStrideInXStrideInYDilationRateInXDilationRateInYPaddingLeftPaddingRightPaddingTopPaddingBottomPaddingStyleDataLayout(kernelWidth: number, kernelHeight: number, strideInX: number, strideInY: number, dilationRateInX: number, dilationRateInY: number, paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout): MPSGraphPooling2DOpDescriptor;

	static descriptorWithKernelWidthKernelHeightStrideInXStrideInYPaddingStyleDataLayout(kernelWidth: number, kernelHeight: number, strideInX: number, strideInY: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout): MPSGraphPooling2DOpDescriptor;

	static new(): MPSGraphPooling2DOpDescriptor; // inherited from NSObject

	dataLayout: MPSGraphTensorNamedDataLayout;

	dilationRateInX: number;

	dilationRateInY: number;

	kernelHeight: number;

	kernelWidth: number;

	paddingBottom: number;

	paddingLeft: number;

	paddingRight: number;

	paddingStyle: MPSGraphPaddingStyle;

	paddingTop: number;

	strideInX: number;

	strideInY: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	setExplicitPaddingWithPaddingLeftPaddingRightPaddingTopPaddingBottom(paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number): void;
}

declare const enum MPSGraphResizeMode {

	Nearest = 0,

	Bilinear = 1
}

declare class MPSGraphShapedType extends NSObject implements NSCopying {

	static alloc(): MPSGraphShapedType; // inherited from NSObject

	static new(): MPSGraphShapedType; // inherited from NSObject

	shape: NSArray<number>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	isEqualTo(object: MPSGraphShapedType): boolean;
}

declare class MPSGraphTensor extends NSObject implements NSCopying {

	static alloc(): MPSGraphTensor; // inherited from NSObject

	static new(): MPSGraphTensor; // inherited from NSObject

	readonly operation: MPSGraphOperation;

	readonly shape: NSArray<number>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class MPSGraphTensorData extends NSObject {

	static alloc(): MPSGraphTensorData; // inherited from NSObject

	static new(): MPSGraphTensorData; // inherited from NSObject

	readonly device: MPSGraphDevice;

	readonly shape: NSArray<number>;
}

declare const enum MPSGraphTensorNamedDataLayout {

	NCHW = 0,

	NHWC = 1,

	OIHW = 2,

	HWIO = 3,

	CHW = 4,

	HWC = 5,

	HW = 6
}

declare class MPSGraphVariableOp extends MPSGraphOperation {

	static alloc(): MPSGraphVariableOp; // inherited from NSObject

	static new(): MPSGraphVariableOp; // inherited from NSObject

	readonly shape: NSArray<number>;
}
