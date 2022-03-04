
declare class MPSGraph extends NSObject {

	static alloc(): MPSGraph; // inherited from NSObject

	static new(): MPSGraph; // inherited from NSObject

	options: MPSGraphOptions;

	readonly placeholderTensors: NSArray<MPSGraphTensor>;

	L2NormPooling4DGradientWithGradientTensorSourceTensorDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string): MPSGraphTensor;

	L2NormPooling4DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string): MPSGraphTensor;

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

	avgPooling4DGradientWithGradientTensorSourceTensorDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string): MPSGraphTensor;

	avgPooling4DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string): MPSGraphTensor;

	bandPartWithTensorNumLowerNumUpperName(inputTensor: MPSGraphTensor, numLower: number, numUpper: number, name: string): MPSGraphTensor;

	bandPartWithTensorNumLowerTensorNumUpperTensorName(inputTensor: MPSGraphTensor, numLowerTensor: MPSGraphTensor, numUpperTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	broadcastTensorToShapeName(tensor: MPSGraphTensor, shape: NSArray<number> | number[], name: string): MPSGraphTensor;

	broadcastTensorToShapeTensorName(tensor: MPSGraphTensor, shapeTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	ceilWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	clampWithTensorMinValueTensorMaxValueTensorName(tensor: MPSGraphTensor, minValueTensor: MPSGraphTensor, maxValueTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	compileWithDeviceFeedsTargetTensorsTargetOperationsCompilationDescriptor(device: MPSGraphDevice, feeds: NSDictionary<MPSGraphTensor, MPSGraphShapedType>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[], compilationDescriptor: MPSGraphCompilationDescriptor): MPSGraphExecutable;

	concatTensorWithTensorDimensionName(tensor: MPSGraphTensor, tensor2: MPSGraphTensor, dimensionIndex: number, name: string): MPSGraphTensor;

	concatTensorsDimensionInterleaveName(tensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], dimensionIndex: number, interleave: boolean, name: string): MPSGraphTensor;

	concatTensorsDimensionName(tensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], dimensionIndex: number, name: string): MPSGraphTensor;

	controlDependencyWithOperationsDependentBlockName(operations: NSArray<MPSGraphOperation> | MPSGraphOperation[], dependentBlock: () => NSArray<MPSGraphTensor>, name: string): NSArray<MPSGraphTensor>;

	convolution2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolution2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeTensorForwardConvolutionDescriptorName(gradient: MPSGraphTensor, weights: MPSGraphTensor, outputShapeTensor: MPSGraphTensor, forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolution2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolution2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeTensorForwardConvolutionDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, outputShapeTensor: MPSGraphTensor, forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolution2DWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolutionTranspose2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolutionTranspose2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeTensorForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: MPSGraphTensor, forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolutionTranspose2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeForwardConvolutionDescriptorName(incomingGradientTensor: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolutionTranspose2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeTensorForwardConvolutionDescriptorName(incomingGradientTensor: MPSGraphTensor, source: MPSGraphTensor, outputShape: MPSGraphTensor, forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolutionTranspose2DWithSourceTensorWeightsTensorOutputShapeDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	convolutionTranspose2DWithSourceTensorWeightsTensorOutputShapeTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, outputShape: MPSGraphTensor, descriptor: MPSGraphConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	coordinateAlongAxisTensorWithShapeName(axisTensor: MPSGraphTensor, shape: NSArray<number> | number[], name: string): MPSGraphTensor;

	coordinateAlongAxisTensorWithShapeTensorName(axisTensor: MPSGraphTensor, shapeTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	coordinateAlongAxisWithShapeName(axis: number, shape: NSArray<number> | number[], name: string): MPSGraphTensor;

	coordinateAlongAxisWithShapeTensorName(axis: number, shapeTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	cosWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	coshWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	depthToSpace2DTensorWidthAxisHeightAxisDepthAxisBlockSizeUsePixelShuffleOrderName(tensor: MPSGraphTensor, widthAxis: number, heightAxis: number, depthAxis: number, blockSize: number, usePixelShuffleOrder: boolean, name: string): MPSGraphTensor;

	depthToSpace2DTensorWidthAxisTensorHeightAxisTensorDepthAxisTensorBlockSizeUsePixelShuffleOrderName(tensor: MPSGraphTensor, widthAxisTensor: MPSGraphTensor, heightAxisTensor: MPSGraphTensor, depthAxisTensor: MPSGraphTensor, blockSize: number, usePixelShuffleOrder: boolean, name: string): MPSGraphTensor;

	depthwiseConvolution2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphDepthwiseConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	depthwiseConvolution2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeDescriptorName(incomingGradient: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphDepthwiseConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	depthwiseConvolution2DWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphDepthwiseConvolution2DOpDescriptor, name: string): MPSGraphTensor;

	depthwiseConvolution3DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphDepthwiseConvolution3DOpDescriptor, name: string): MPSGraphTensor;

	depthwiseConvolution3DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeDescriptorName(incomingGradient: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphDepthwiseConvolution3DOpDescriptor, name: string): MPSGraphTensor;

	depthwiseConvolution3DWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphDepthwiseConvolution3DOpDescriptor, name: string): MPSGraphTensor;

	divisionNoNaNWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	divisionWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	dropoutTensorRateName(tensor: MPSGraphTensor, rate: number, name: string): MPSGraphTensor;

	dropoutTensorRateTensorName(tensor: MPSGraphTensor, rate: MPSGraphTensor, name: string): MPSGraphTensor;

	equalWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	erfWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	expandDimsOfTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	expandDimsOfTensorAxesTensorName(tensor: MPSGraphTensor, axesTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	expandDimsOfTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	exponentBase10WithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	exponentBase2WithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	exponentWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	flatten2DTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	flatten2DTensorAxisTensorName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	floorModuloWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	floorWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	forLoopWithLowerBoundUpperBoundStepInitialBodyArgumentsBodyName(lowerBound: MPSGraphTensor, upperBound: MPSGraphTensor, step: MPSGraphTensor, initialBodyArguments: NSArray<MPSGraphTensor> | MPSGraphTensor[], body: (p1: MPSGraphTensor, p2: NSArray<MPSGraphTensor>) => NSArray<MPSGraphTensor>, name: string): NSArray<MPSGraphTensor>;

	forLoopWithNumberOfIterationsInitialBodyArgumentsBodyName(numberOfIterations: MPSGraphTensor, initialBodyArguments: NSArray<MPSGraphTensor> | MPSGraphTensor[], body: (p1: MPSGraphTensor, p2: NSArray<MPSGraphTensor>) => NSArray<MPSGraphTensor>, name: string): NSArray<MPSGraphTensor>;

	gatherAlongAxisTensorWithUpdatesTensorIndicesTensorName(axisTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	gatherAlongAxisWithUpdatesTensorIndicesTensorName(axis: number, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	gatherNDWithUpdatesTensorIndicesTensorBatchDimensionsName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, batchDimensions: number, name: string): MPSGraphTensor;

	gatherWithUpdatesTensorIndicesTensorAxisBatchDimensionsName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, axis: number, batchDimensions: number, name: string): MPSGraphTensor;

	gradientForPrimaryTensorWithTensorsName(primaryTensor: MPSGraphTensor, tensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], name: string): NSDictionary<MPSGraphTensor, MPSGraphTensor>;

	greaterThanOrEqualToWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	greaterThanWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	identityWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	ifWithPredicateTensorThenBlockElseBlockName(predicateTensor: MPSGraphTensor, thenBlock: () => NSArray<MPSGraphTensor>, elseBlock: () => NSArray<MPSGraphTensor>, name: string): NSArray<MPSGraphTensor>;

	isFiniteWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	isInfiniteWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	isNaNWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	leakyReLUGradientWithIncomingGradientSourceTensorAlphaTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, alphaTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	leakyReLUWithTensorAlphaName(tensor: MPSGraphTensor, alpha: number, name: string): MPSGraphTensor;

	leakyReLUWithTensorAlphaTensorName(tensor: MPSGraphTensor, alphaTensor: MPSGraphTensor, name: string): MPSGraphTensor;

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

	maxPooling2DReturnIndicesWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string): NSArray<MPSGraphTensor>;

	maxPooling2DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string): MPSGraphTensor;

	maxPooling4DGradientWithGradientTensorSourceTensorDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string): MPSGraphTensor;

	maxPooling4DReturnIndicesWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string): NSArray<MPSGraphTensor>;

	maxPooling4DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string): MPSGraphTensor;

	maximumWithNaNPropagationWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	maximumWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	meanOfTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	minimumWithNaNPropagationWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

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

	randomPhiloxStateTensorWithCounterLowCounterHighKeyName(counterLow: number, counterHigh: number, key: number, name: string): MPSGraphTensor;

	randomPhiloxStateTensorWithSeedName(seed: number, name: string): MPSGraphTensor;

	randomTensorWithShapeDescriptorName(shape: NSArray<number> | number[], descriptor: MPSGraphRandomOpDescriptor, name: string): MPSGraphTensor;

	randomTensorWithShapeDescriptorSeedName(shape: NSArray<number> | number[], descriptor: MPSGraphRandomOpDescriptor, seed: number, name: string): MPSGraphTensor;

	randomTensorWithShapeDescriptorStateTensorName(shape: NSArray<number> | number[], descriptor: MPSGraphRandomOpDescriptor, state: MPSGraphTensor, name: string): NSArray<MPSGraphTensor>;

	randomTensorWithShapeTensorDescriptorName(shapeTensor: MPSGraphTensor, descriptor: MPSGraphRandomOpDescriptor, name: string): MPSGraphTensor;

	randomTensorWithShapeTensorDescriptorSeedName(shapeTensor: MPSGraphTensor, descriptor: MPSGraphRandomOpDescriptor, seed: number, name: string): MPSGraphTensor;

	randomTensorWithShapeTensorDescriptorStateTensorName(shapeTensor: MPSGraphTensor, descriptor: MPSGraphRandomOpDescriptor, state: MPSGraphTensor, name: string): NSArray<MPSGraphTensor>;

	randomUniformTensorWithShapeName(shape: NSArray<number> | number[], name: string): MPSGraphTensor;

	randomUniformTensorWithShapeSeedName(shape: NSArray<number> | number[], seed: number, name: string): MPSGraphTensor;

	randomUniformTensorWithShapeStateTensorName(shape: NSArray<number> | number[], state: MPSGraphTensor, name: string): NSArray<MPSGraphTensor>;

	randomUniformTensorWithShapeTensorName(shapeTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	randomUniformTensorWithShapeTensorSeedName(shapeTensor: MPSGraphTensor, seed: number, name: string): MPSGraphTensor;

	randomUniformTensorWithShapeTensorStateTensorName(shapeTensor: MPSGraphTensor, state: MPSGraphTensor, name: string): NSArray<MPSGraphTensor>;

	reLUGradientWithIncomingGradientSourceTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, name: string): MPSGraphTensor;

	reLUWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	readVariableName(variable: MPSGraphTensor, name: string): MPSGraphTensor;

	reciprocalWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	reductionAndWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionAndWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionArgMaximumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionArgMinimumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionMaximumPropagateNaNWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionMaximumPropagateNaNWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionMaximumWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionMaximumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionMinimumPropagateNaNWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionMinimumPropagateNaNWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionMinimumWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionMinimumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionOrWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionOrWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionProductWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionProductWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reductionSumWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reductionSumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	reshapeTensorWithShapeName(tensor: MPSGraphTensor, shape: NSArray<number> | number[], name: string): MPSGraphTensor;

	reshapeTensorWithShapeTensorName(tensor: MPSGraphTensor, shapeTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	resizeTensorSizeModeCenterResultAlignCornersLayoutName(imagesTensor: MPSGraphTensor, size: NSArray<number> | number[], mode: MPSGraphResizeMode, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string): MPSGraphTensor;

	resizeTensorSizeTensorModeCenterResultAlignCornersLayoutName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, mode: MPSGraphResizeMode, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string): MPSGraphTensor;

	resizeWithGradientTensorInputModeCenterResultAlignCornersLayoutName(gradient: MPSGraphTensor, input: MPSGraphTensor, mode: MPSGraphResizeMode, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string): MPSGraphTensor;

	reverseSquareRootWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	reverseTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	reverseTensorAxesTensorName(tensor: MPSGraphTensor, axesTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	reverseTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	rintWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	roundWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	runAsyncWithFeedsTargetTensorsTargetOperationsExecutionDescriptor(feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[], executionDescriptor: MPSGraphExecutionDescriptor): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	runAsyncWithMTLCommandQueueFeedsTargetOperationsResultsDictionaryExecutionDescriptor(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[], resultsDictionary: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, executionDescriptor: MPSGraphExecutionDescriptor): void;

	runAsyncWithMTLCommandQueueFeedsTargetTensorsTargetOperationsExecutionDescriptor(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[], executionDescriptor: MPSGraphExecutionDescriptor): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	runWithFeedsTargetTensorsTargetOperations(feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[]): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	runWithMTLCommandQueueFeedsTargetOperationsResultsDictionary(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[], resultsDictionary: NSDictionary<MPSGraphTensor, MPSGraphTensorData>): void;

	runWithMTLCommandQueueFeedsTargetTensorsTargetOperations(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[]): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	scatterAlongAxisTensorWithDataTensorUpdatesTensorIndicesTensorModeName(axisTensor: MPSGraphTensor, dataTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, mode: MPSGraphScatterMode, name: string): MPSGraphTensor;

	scatterAlongAxisTensorWithUpdatesTensorIndicesTensorShapeModeName(axisTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], mode: MPSGraphScatterMode, name: string): MPSGraphTensor;

	scatterAlongAxisWithDataTensorUpdatesTensorIndicesTensorModeName(axis: number, dataTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, mode: MPSGraphScatterMode, name: string): MPSGraphTensor;

	scatterAlongAxisWithUpdatesTensorIndicesTensorShapeModeName(axis: number, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], mode: MPSGraphScatterMode, name: string): MPSGraphTensor;

	scatterNDWithDataTensorUpdatesTensorIndicesTensorBatchDimensionsModeName(dataTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, batchDimensions: number, mode: MPSGraphScatterMode, name: string): MPSGraphTensor;

	scatterNDWithUpdatesTensorIndicesTensorShapeBatchDimensionsModeName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], batchDimensions: number, mode: MPSGraphScatterMode, name: string): MPSGraphTensor;

	scatterNDWithUpdatesTensorIndicesTensorShapeBatchDimensionsName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], batchDimensions: number, name: string): MPSGraphTensor;

	scatterWithDataTensorUpdatesTensorIndicesTensorAxisModeName(dataTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, axis: number, mode: MPSGraphScatterMode, name: string): MPSGraphTensor;

	scatterWithUpdatesTensorIndicesTensorShapeAxisModeName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], axis: number, mode: MPSGraphScatterMode, name: string): MPSGraphTensor;

	selectWithPredicateTensorTruePredicateTensorFalsePredicateTensorName(predicateTensor: MPSGraphTensor, truePredicateTensor: MPSGraphTensor, falseSelectTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	shapeOfTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	sigmoidGradientWithIncomingGradientSourceTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, name: string): MPSGraphTensor;

	sigmoidWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	signWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	signbitWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	sinWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	sinhWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	sliceGradientTensorFwdInShapeTensorStartsEndsStridesName(inputGradientTensor: MPSGraphTensor, fwdInShapeTensor: MPSGraphTensor, starts: NSArray<number> | number[], ends: NSArray<number> | number[], strides: NSArray<number> | number[], name: string): MPSGraphTensor;

	sliceGradientTensorFwdInShapeTensorStartsEndsStridesStartMaskEndMaskSqueezeMaskName(inputGradientTensor: MPSGraphTensor, fwdInShapeTensor: MPSGraphTensor, starts: NSArray<number> | number[], ends: NSArray<number> | number[], strides: NSArray<number> | number[], startMask: number, endMask: number, squeezeMask: number, name: string): MPSGraphTensor;

	sliceTensorDimensionStartLengthName(tensor: MPSGraphTensor, dimensionIndex: number, start: number, length: number, name: string): MPSGraphTensor;

	sliceTensorStartsEndsStridesName(tensor: MPSGraphTensor, starts: NSArray<number> | number[], ends: NSArray<number> | number[], strides: NSArray<number> | number[], name: string): MPSGraphTensor;

	sliceTensorStartsEndsStridesStartMaskEndMaskSqueezeMaskName(tensor: MPSGraphTensor, starts: NSArray<number> | number[], ends: NSArray<number> | number[], strides: NSArray<number> | number[], startMask: number, endMask: number, squeezeMask: number, name: string): MPSGraphTensor;

	softMaxCrossEntropyGradientWithIncomingGradientTensorSourceTensorLabelsTensorAxisReductionTypeName(gradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, labelsTensor: MPSGraphTensor, axis: number, reductionType: MPSGraphLossReductionType, name: string): MPSGraphTensor;

	softMaxCrossEntropyWithSourceTensorLabelsTensorAxisReductionTypeName(sourceTensor: MPSGraphTensor, labelsTensor: MPSGraphTensor, axis: number, reductionType: MPSGraphLossReductionType, name: string): MPSGraphTensor;

	softMaxGradientWithIncomingGradientSourceTensorAxisName(gradient: MPSGraphTensor, source: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	softMaxWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	spaceToDepth2DTensorWidthAxisHeightAxisDepthAxisBlockSizeUsePixelShuffleOrderName(tensor: MPSGraphTensor, widthAxis: number, heightAxis: number, depthAxis: number, blockSize: number, usePixelShuffleOrder: boolean, name: string): MPSGraphTensor;

	spaceToDepth2DTensorWidthAxisTensorHeightAxisTensorDepthAxisTensorBlockSizeUsePixelShuffleOrderName(tensor: MPSGraphTensor, widthAxisTensor: MPSGraphTensor, heightAxisTensor: MPSGraphTensor, depthAxisTensor: MPSGraphTensor, blockSize: number, usePixelShuffleOrder: boolean, name: string): MPSGraphTensor;

	sparseTensorWithDescriptorTensorsShapeName(sparseDescriptor: MPSGraphCreateSparseOpDescriptor, inputTensorArray: NSArray<MPSGraphTensor> | MPSGraphTensor[], shape: NSArray<number> | number[], name: string): MPSGraphTensor;

	splitTensorNumSplitsAxisName(tensor: MPSGraphTensor, numSplits: number, axis: number, name: string): NSArray<MPSGraphTensor>;

	splitTensorSplitSizesAxisName(tensor: MPSGraphTensor, splitSizes: NSArray<number> | number[], axis: number, name: string): NSArray<MPSGraphTensor>;

	splitTensorSplitSizesTensorAxisName(tensor: MPSGraphTensor, splitSizesTensor: MPSGraphTensor, axis: number, name: string): NSArray<MPSGraphTensor>;

	squareRootWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	squareWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	squeezeTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	squeezeTensorAxesTensorName(tensor: MPSGraphTensor, axesTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	squeezeTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string): MPSGraphTensor;

	squeezeTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	stackTensorsAxisName(inputTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], axis: number, name: string): MPSGraphTensor;

	stencilWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphStencilOpDescriptor, name: string): MPSGraphTensor;

	stochasticGradientDescentWithLearningRateTensorValuesTensorGradientTensorName(learningRateTensor: MPSGraphTensor, valuesTensor: MPSGraphTensor, gradientTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	subtractionWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	tanWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	tanhWithTensorName(tensor: MPSGraphTensor, name: string): MPSGraphTensor;

	tileGradientWithIncomingGradientTensorSourceTensorWithMultiplierName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, multiplier: NSArray<number> | number[], name: string): MPSGraphTensor;

	tileTensorWithMultiplierName(tensor: MPSGraphTensor, multiplier: NSArray<number> | number[], name: string): MPSGraphTensor;

	topKWithGradientTensorSourceKName(gradient: MPSGraphTensor, source: MPSGraphTensor, k: number, name: string): MPSGraphTensor;

	topKWithGradientTensorSourceKTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, kTensor: MPSGraphTensor, name: string): MPSGraphTensor;

	topKWithSourceTensorKName(source: MPSGraphTensor, k: number, name: string): NSArray<MPSGraphTensor>;

	topKWithSourceTensorKTensorName(source: MPSGraphTensor, kTensor: MPSGraphTensor, name: string): NSArray<MPSGraphTensor>;

	transposeTensorDimensionWithDimensionName(tensor: MPSGraphTensor, dimensionIndex: number, dimensionIndex2: number, name: string): MPSGraphTensor;

	varianceOfTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	varianceOfTensorMeanTensorAxesName(tensor: MPSGraphTensor, meanTensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string): MPSGraphTensor;

	whileWithInitialInputsBeforeAfterName(initialInputs: NSArray<MPSGraphTensor> | MPSGraphTensor[], before: (p1: NSArray<MPSGraphTensor>, p2: NSMutableArray<MPSGraphTensor>) => MPSGraphTensor, after: (p1: NSArray<MPSGraphTensor>) => NSArray<MPSGraphTensor>, name: string): NSArray<MPSGraphTensor>;
}

declare class MPSGraphCompilationDescriptor extends NSObject implements NSCopying {

	static alloc(): MPSGraphCompilationDescriptor; // inherited from NSObject

	static new(): MPSGraphCompilationDescriptor; // inherited from NSObject

	optimizationLevel: MPSGraphOptimization;

	optimizationProfile: MPSGraphOptimizationProfile;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	disableTypeInference(): void;
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

declare class MPSGraphCreateSparseOpDescriptor extends NSObject implements NSCopying {

	static alloc(): MPSGraphCreateSparseOpDescriptor; // inherited from NSObject

	static new(): MPSGraphCreateSparseOpDescriptor; // inherited from NSObject

	sparseStorageType: MPSGraphSparseStorageType;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
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

declare class MPSGraphDepthwiseConvolution3DOpDescriptor extends NSObject implements NSCopying {

	static alloc(): MPSGraphDepthwiseConvolution3DOpDescriptor; // inherited from NSObject

	static descriptorWithPaddingStyle(paddingStyle: MPSGraphPaddingStyle): MPSGraphDepthwiseConvolution3DOpDescriptor;

	static descriptorWithStridesDilationRatesPaddingValuesPaddingStyle(strides: NSArray<number> | number[], dilationRates: NSArray<number> | number[], paddingValues: NSArray<number> | number[], paddingStyle: MPSGraphPaddingStyle): MPSGraphDepthwiseConvolution3DOpDescriptor;

	static new(): MPSGraphDepthwiseConvolution3DOpDescriptor; // inherited from NSObject

	channelDimensionIndex: number;

	dilationRates: NSArray<number>;

	paddingStyle: MPSGraphPaddingStyle;

	paddingValues: NSArray<number>;

	strides: NSArray<number>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
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

declare class MPSGraphExecutable extends NSObject {

	static alloc(): MPSGraphExecutable; // inherited from NSObject

	static new(): MPSGraphExecutable; // inherited from NSObject

	readonly feedTensors: NSArray<MPSGraphTensor>;

	options: MPSGraphOptions;

	readonly targetTensors: NSArray<MPSGraphTensor>;

	runAsyncWithMTLCommandQueueInputsArrayResultsArrayExecutionDescriptor(commandQueue: MTLCommandQueue, inputsArray: NSArray<MPSGraphTensorData> | MPSGraphTensorData[], resultsArray: NSArray<MPSGraphTensorData> | MPSGraphTensorData[], executionDescriptor: MPSGraphExecutableExecutionDescriptor): NSArray<MPSGraphTensorData>;

	runWithMTLCommandQueueInputsArrayResultsArrayExecutionDescriptor(commandQueue: MTLCommandQueue, inputsArray: NSArray<MPSGraphTensorData> | MPSGraphTensorData[], resultsArray: NSArray<MPSGraphTensorData> | MPSGraphTensorData[], executionDescriptor: MPSGraphExecutableExecutionDescriptor): NSArray<MPSGraphTensorData>;

	specializeWithDeviceInputTypesCompilationDescriptor(device: MPSGraphDevice, inputTypes: NSArray<MPSGraphType> | MPSGraphType[], compilationDescriptor: MPSGraphCompilationDescriptor): void;
}

declare class MPSGraphExecutableExecutionDescriptor extends NSObject {

	static alloc(): MPSGraphExecutableExecutionDescriptor; // inherited from NSObject

	static new(): MPSGraphExecutableExecutionDescriptor; // inherited from NSObject

	completionHandler: (p1: NSArray<MPSGraphTensorData>, p2: NSError) => void;

	scheduledHandler: (p1: NSArray<MPSGraphTensorData>, p2: NSError) => void;

	waitUntilCompleted: boolean;
}

declare class MPSGraphExecutionDescriptor extends NSObject {

	static alloc(): MPSGraphExecutionDescriptor; // inherited from NSObject

	static new(): MPSGraphExecutionDescriptor; // inherited from NSObject

	compilationDescriptor: MPSGraphCompilationDescriptor;

	completionHandler: (p1: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, p2: NSError) => void;

	scheduledHandler: (p1: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, p2: NSError) => void;

	waitUntilCompleted: boolean;
}

declare const enum MPSGraphLossReductionType {

	Axis = 0,

	Sum = 1,

	Mean = 2
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

declare const enum MPSGraphOptimization {

	Level0 = 0,

	Level1 = 1
}

declare const enum MPSGraphOptimizationProfile {

	Performance = 0,

	PowerEfficiency = 1
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

	Symmetric = 2,

	ClampToEdge = 3,

	Zero = 4,

	Periodic = 5,

	AntiPeriodic = 6
}

declare const enum MPSGraphPaddingStyle {

	Explicit = 0,

	TF_VALID = 1,

	TF_SAME = 2,

	ExplicitOffset = 3
}

declare class MPSGraphPooling2DOpDescriptor extends NSObject implements NSCopying {

	static alloc(): MPSGraphPooling2DOpDescriptor; // inherited from NSObject

	static descriptorWithKernelWidthKernelHeightStrideInXStrideInYDilationRateInXDilationRateInYPaddingLeftPaddingRightPaddingTopPaddingBottomPaddingStyleDataLayout(kernelWidth: number, kernelHeight: number, strideInX: number, strideInY: number, dilationRateInX: number, dilationRateInY: number, paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout): MPSGraphPooling2DOpDescriptor;

	static descriptorWithKernelWidthKernelHeightStrideInXStrideInYPaddingStyleDataLayout(kernelWidth: number, kernelHeight: number, strideInX: number, strideInY: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout): MPSGraphPooling2DOpDescriptor;

	static new(): MPSGraphPooling2DOpDescriptor; // inherited from NSObject

	ceilMode: boolean;

	dataLayout: MPSGraphTensorNamedDataLayout;

	dilationRateInX: number;

	dilationRateInY: number;

	includeZeroPadToAverage: boolean;

	kernelHeight: number;

	kernelWidth: number;

	paddingBottom: number;

	paddingLeft: number;

	paddingRight: number;

	paddingStyle: MPSGraphPaddingStyle;

	paddingTop: number;

	returnIndicesMode: MPSGraphPoolingReturnIndicesMode;

	strideInX: number;

	strideInY: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	setExplicitPaddingWithPaddingLeftPaddingRightPaddingTopPaddingBottom(paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number): void;
}

declare class MPSGraphPooling4DOpDescriptor extends NSObject implements NSCopying {

	static alloc(): MPSGraphPooling4DOpDescriptor; // inherited from NSObject

	static descriptorWithKernelSizesPaddingStyle(kernelSizes: NSArray<number> | number[], paddingStyle: MPSGraphPaddingStyle): MPSGraphPooling4DOpDescriptor;

	static descriptorWithKernelSizesStridesDilationRatesPaddingValuesPaddingStyle(kernelSizes: NSArray<number> | number[], strides: NSArray<number> | number[], dilationRates: NSArray<number> | number[], paddingValues: NSArray<number> | number[], paddingStyle: MPSGraphPaddingStyle): MPSGraphPooling4DOpDescriptor;

	static new(): MPSGraphPooling4DOpDescriptor; // inherited from NSObject

	ceilMode: boolean;

	dilationRates: NSArray<number>;

	includeZeroPadToAverage: boolean;

	kernelSizes: NSArray<number>;

	paddingStyle: MPSGraphPaddingStyle;

	paddingValues: NSArray<number>;

	returnIndicesMode: MPSGraphPoolingReturnIndicesMode;

	strides: NSArray<number>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum MPSGraphPoolingReturnIndicesMode {

	None = 0,

	GlobalFlatten1D = 1,

	GlobalFlatten2D = 2,

	GlobalFlatten3D = 3,

	GlobalFlatten4D = 4,

	LocalFlatten1D = 5,

	LocalFlatten2D = 6,

	LocalFlatten3D = 7,

	LocalFlatten4D = 8
}

declare const enum MPSGraphRandomDistribution {

	Uniform = 0,

	Normal = 1,

	TruncatedNormal = 2
}

declare const enum MPSGraphRandomNormalSamplingMethod {

	InvCDF = 0,

	BoxMuller = 1
}

declare class MPSGraphRandomOpDescriptor extends NSObject implements NSCopying {

	static alloc(): MPSGraphRandomOpDescriptor; // inherited from NSObject

	static new(): MPSGraphRandomOpDescriptor; // inherited from NSObject

	distribution: MPSGraphRandomDistribution;

	max: number;

	maxInteger: number;

	mean: number;

	min: number;

	minInteger: number;

	samplingMethod: MPSGraphRandomNormalSamplingMethod;

	standardDeviation: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum MPSGraphReductionMode {

	Min = 0,

	Max = 1,

	Sum = 2,

	Product = 3,

	ArgumentMin = 4,

	ArgumentMax = 5
}

declare const enum MPSGraphResizeMode {

	Nearest = 0,

	Bilinear = 1
}

declare const enum MPSGraphScatterMode {

	Add = 0,

	Sub = 1,

	Mul = 2,

	Div = 3,

	Min = 4,

	Max = 5,

	Set = 6
}

declare class MPSGraphShapedType extends MPSGraphType {

	static alloc(): MPSGraphShapedType; // inherited from NSObject

	static new(): MPSGraphShapedType; // inherited from NSObject

	shape: NSArray<number>;

	isEqualTo(object: MPSGraphShapedType): boolean;
}

declare const enum MPSGraphSparseStorageType {

	COO = 0,

	CSC = 1,

	CSR = 2
}

declare class MPSGraphStencilOpDescriptor extends NSObject implements NSCopying {

	static alloc(): MPSGraphStencilOpDescriptor; // inherited from NSObject

	static descriptorWithExplicitPadding(explicitPadding: NSArray<number> | number[]): MPSGraphStencilOpDescriptor;

	static descriptorWithOffsetsExplicitPadding(offsets: NSArray<number> | number[], explicitPadding: NSArray<number> | number[]): MPSGraphStencilOpDescriptor;

	static descriptorWithPaddingStyle(paddingStyle: MPSGraphPaddingStyle): MPSGraphStencilOpDescriptor;

	static descriptorWithReductionModeOffsetsStridesDilationRatesExplicitPaddingBoundaryModePaddingStylePaddingConstant(reductionMode: MPSGraphReductionMode, offsets: NSArray<number> | number[], strides: NSArray<number> | number[], dilationRates: NSArray<number> | number[], explicitPadding: NSArray<number> | number[], boundaryMode: MPSGraphPaddingMode, paddingStyle: MPSGraphPaddingStyle, paddingConstant: number): MPSGraphStencilOpDescriptor;

	static new(): MPSGraphStencilOpDescriptor; // inherited from NSObject

	boundaryMode: MPSGraphPaddingMode;

	dilationRates: NSArray<number>;

	explicitPadding: NSArray<number>;

	offsets: NSArray<number>;

	paddingConstant: number;

	paddingStyle: MPSGraphPaddingStyle;

	reductionMode: MPSGraphReductionMode;

	strides: NSArray<number>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
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

declare class MPSGraphType extends NSObject implements NSCopying {

	static alloc(): MPSGraphType; // inherited from NSObject

	static new(): MPSGraphType; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class MPSGraphVariableOp extends MPSGraphOperation {

	static alloc(): MPSGraphVariableOp; // inherited from NSObject

	static new(): MPSGraphVariableOp; // inherited from NSObject

	readonly shape: NSArray<number>;
}
