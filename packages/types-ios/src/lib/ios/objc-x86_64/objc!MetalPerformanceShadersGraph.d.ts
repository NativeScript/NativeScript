
/**
 * @since 14.0
 */
declare class MPSGraph extends MPSGraphObject {

	static alloc(): MPSGraph; // inherited from NSObject

	static new(): MPSGraph; // inherited from NSObject

	options: MPSGraphOptions;

	readonly placeholderTensors: NSArray<MPSGraphTensor>;

	/**
	 * @since 16.0
	 */
	GRUGradientsWithSourceTensorRecurrentWeightSourceGradientZStateOutputFwdInputWeightBiasDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, outputFwd: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, descriptor: MPSGraphGRUDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 16.0
	 */
	GRUGradientsWithSourceTensorRecurrentWeightSourceGradientZStateOutputFwdInputWeightBiasInitStateDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, outputFwd: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, descriptor: MPSGraphGRUDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 16.0
	 */
	GRUGradientsWithSourceTensorRecurrentWeightSourceGradientZStateOutputFwdStateGradientInputWeightBiasInitStateMaskSecondaryBiasDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, outputFwd: MPSGraphTensor, stateGradient: MPSGraphTensor | null, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, mask: MPSGraphTensor | null, secondaryBias: MPSGraphTensor | null, descriptor: MPSGraphGRUDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 16.0
	 */
	GRUWithSourceTensorRecurrentWeightInputWeightBiasDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, descriptor: MPSGraphGRUDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 16.0
	 */
	GRUWithSourceTensorRecurrentWeightInputWeightBiasInitStateDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, descriptor: MPSGraphGRUDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 16.0
	 */
	GRUWithSourceTensorRecurrentWeightInputWeightBiasInitStateMaskSecondaryBiasDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, mask: MPSGraphTensor | null, secondaryBias: MPSGraphTensor | null, descriptor: MPSGraphGRUDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 17.0
	 */
	HermiteanToRealFFTWithTensorAxesDescriptorName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], descriptor: MPSGraphFFTDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	HermiteanToRealFFTWithTensorAxesTensorDescriptorName(tensor: MPSGraphTensor, axesTensor: MPSGraphTensor, descriptor: MPSGraphFFTDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	L2NormPooling4DGradientWithGradientTensorSourceTensorDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	L2NormPooling4DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	LSTMGradientsWithSourceTensorRecurrentWeightSourceGradientZStateCellOutputFwdDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, cellOutputFwd: MPSGraphTensor, descriptor: MPSGraphLSTMDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	LSTMGradientsWithSourceTensorRecurrentWeightSourceGradientZStateCellOutputFwdInputWeightBiasInitStateInitCellDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, cellOutputFwd: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, initCell: MPSGraphTensor | null, descriptor: MPSGraphLSTMDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	LSTMGradientsWithSourceTensorRecurrentWeightSourceGradientZStateCellOutputFwdInputWeightBiasInitStateInitCellMaskDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, cellOutputFwd: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, initCell: MPSGraphTensor | null, mask: MPSGraphTensor | null, descriptor: MPSGraphLSTMDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	LSTMGradientsWithSourceTensorRecurrentWeightSourceGradientZStateCellOutputFwdStateGradientCellGradientInputWeightBiasInitStateInitCellMaskPeepholeDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, cellOutputFwd: MPSGraphTensor, stateGradient: MPSGraphTensor | null, cellGradient: MPSGraphTensor | null, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, initCell: MPSGraphTensor | null, mask: MPSGraphTensor | null, peephole: MPSGraphTensor | null, descriptor: MPSGraphLSTMDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	LSTMWithSourceTensorRecurrentWeightInitStateInitCellDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, initState: MPSGraphTensor | null, initCell: MPSGraphTensor | null, descriptor: MPSGraphLSTMDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	LSTMWithSourceTensorRecurrentWeightInputWeightBiasInitStateInitCellDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, initCell: MPSGraphTensor | null, descriptor: MPSGraphLSTMDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	LSTMWithSourceTensorRecurrentWeightInputWeightBiasInitStateInitCellMaskPeepholeDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, initCell: MPSGraphTensor | null, mask: MPSGraphTensor | null, peephole: MPSGraphTensor | null, descriptor: MPSGraphLSTMDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 17.0
	 */
	absoluteSquareWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	absoluteWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	acosWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	acoshWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	adamWithCurrentLearningRateTensorBeta1TensorBeta2TensorEpsilonTensorValuesTensorMomentumTensorVelocityTensorMaximumVelocityTensorGradientTensorName(currentLearningRateTensor: MPSGraphTensor, beta1Tensor: MPSGraphTensor, beta2Tensor: MPSGraphTensor, epsilonTensor: MPSGraphTensor, valuesTensor: MPSGraphTensor, momentumTensor: MPSGraphTensor, velocityTensor: MPSGraphTensor, maximumVelocityTensor: MPSGraphTensor | null, gradientTensor: MPSGraphTensor, name: string | null): NSArray<MPSGraphTensor>;

	adamWithLearningRateTensorBeta1TensorBeta2TensorEpsilonTensorBeta1PowerTensorBeta2PowerTensorValuesTensorMomentumTensorVelocityTensorMaximumVelocityTensorGradientTensorName(learningRateTensor: MPSGraphTensor, beta1Tensor: MPSGraphTensor, beta2Tensor: MPSGraphTensor, epsilonTensor: MPSGraphTensor, beta1PowerTensor: MPSGraphTensor, beta2PowerTensor: MPSGraphTensor, valuesTensor: MPSGraphTensor, momentumTensor: MPSGraphTensor, velocityTensor: MPSGraphTensor, maximumVelocityTensor: MPSGraphTensor | null, gradientTensor: MPSGraphTensor, name: string | null): NSArray<MPSGraphTensor>;

	additionWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	applyStochasticGradientDescentWithLearningRateTensorVariableGradientTensorName(learningRateTensor: MPSGraphTensor, variable: MPSGraphVariableOp, gradientTensor: MPSGraphTensor, name: string | null): MPSGraphOperation;

	/**
	 * @since 16.1
	 */
	argSortWithTensorAxisDescendingName(tensor: MPSGraphTensor, axis: number, descending: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	argSortWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	argSortWithTensorAxisTensorDescendingName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, descending: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	argSortWithTensorAxisTensorName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	asinWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	asinhWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	assignVariableWithValueOfTensorName(variable: MPSGraphTensor, tensor: MPSGraphTensor, name: string | null): MPSGraphOperation;

	atan2WithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	atanWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	atanhWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	avgPooling2DGradientWithGradientTensorSourceTensorDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string | null): MPSGraphTensor;

	avgPooling2DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	avgPooling4DGradientWithGradientTensorSourceTensorDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	avgPooling4DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string | null): MPSGraphTensor;

	bandPartWithTensorNumLowerNumUpperName(inputTensor: MPSGraphTensor, numLower: number, numUpper: number, name: string | null): MPSGraphTensor;

	bandPartWithTensorNumLowerTensorNumUpperTensorName(inputTensor: MPSGraphTensor, numLowerTensor: MPSGraphTensor, numUpperTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	batchToSpaceTensorSpatialAxesBatchAxisBlockDimensionsUsePixelShuffleOrderName(tensor: MPSGraphTensor, spatialAxes: NSArray<number> | number[], batchAxis: number, blockDimensions: NSArray<number> | number[], usePixelShuffleOrder: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	batchToSpaceTensorSpatialAxesTensorBatchAxisTensorBlockDimensionsTensorUsePixelShuffleOrderName(tensor: MPSGraphTensor, spatialAxesTensor: MPSGraphTensor, batchAxisTensor: MPSGraphTensor, blockDimensionsTensor: MPSGraphTensor, usePixelShuffleOrder: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	bitwiseANDWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	bitwiseLeftShiftWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	bitwiseNOTWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	bitwiseORWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	bitwisePopulationCountWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	bitwiseRightShiftWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	bitwiseXORWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	bottomKWithGradientTensorSourceAxisKName(gradient: MPSGraphTensor, source: MPSGraphTensor, axis: number, k: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	bottomKWithGradientTensorSourceAxisTensorKTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, axisTensor: MPSGraphTensor, kTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	bottomKWithSourceTensorAxisKName(source: MPSGraphTensor, axis: number, k: number, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 17.0
	 */
	bottomKWithSourceTensorAxisTensorKTensorName(source: MPSGraphTensor, axisTensor: MPSGraphTensor, kTensor: MPSGraphTensor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.0
	 */
	broadcastTensorToShapeName(tensor: MPSGraphTensor, shape: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	broadcastTensorToShapeTensorName(tensor: MPSGraphTensor, shapeTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.0
	 */
	callSymbolNameInputTensorsOutputTypesName(symbolName: string, inputTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], outputTypes: NSArray<MPSGraphType> | MPSGraphType[], name: string | null): NSArray<MPSGraphTensor>;

	ceilWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	clampWithTensorMinValueTensorMaxValueTensorName(tensor: MPSGraphTensor, minValueTensor: MPSGraphTensor, maxValueTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	colToImWithSourceTensorOutputShapeDescriptorName(source: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphImToColOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	compileWithDeviceFeedsTargetTensorsTargetOperationsCompilationDescriptor(device: MPSGraphDevice | null, feeds: NSDictionary<MPSGraphTensor, MPSGraphShapedType>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[] | null, compilationDescriptor: MPSGraphCompilationDescriptor | null): MPSGraphExecutable;

	/**
	 * @since 17.0
	 */
	complexTensorWithRealTensorImaginaryTensorName(realTensor: MPSGraphTensor, imaginaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	concatTensorWithTensorDimensionName(tensor: MPSGraphTensor, tensor2: MPSGraphTensor, dimensionIndex: number, name: string | null): MPSGraphTensor;

	concatTensorsDimensionInterleaveName(tensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], dimensionIndex: number, interleave: boolean, name: string | null): MPSGraphTensor;

	concatTensorsDimensionName(tensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], dimensionIndex: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	conjugateWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	constantWithRealPartImaginaryPart(realPart: number, imaginaryPart: number): MPSGraphTensor;

	controlDependencyWithOperationsDependentBlockName(operations: NSArray<MPSGraphOperation> | MPSGraphOperation[], dependentBlock: () => NSArray<MPSGraphTensor>, name: string | null): NSArray<MPSGraphTensor>;

	convolution2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	convolution2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeTensorForwardConvolutionDescriptorName(gradient: MPSGraphTensor, weights: MPSGraphTensor, outputShapeTensor: MPSGraphTensor, forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	convolution2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	convolution2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeTensorForwardConvolutionDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, outputShapeTensor: MPSGraphTensor, forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	convolution2DWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.3
	 */
	convolution3DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution3DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.3
	 */
	convolution3DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeTensorForwardConvolutionDescriptorName(gradient: MPSGraphTensor, weights: MPSGraphTensor, outputShapeTensor: MPSGraphTensor, forwardConvolutionDescriptor: MPSGraphConvolution3DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.3
	 */
	convolution3DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution3DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.3
	 */
	convolution3DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeTensorForwardConvolutionDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, outputShapeTensor: MPSGraphTensor, forwardConvolutionDescriptor: MPSGraphConvolution3DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.3
	 */
	convolution3DWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphConvolution3DOpDescriptor, name: string | null): MPSGraphTensor;

	convolutionTranspose2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	convolutionTranspose2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeTensorForwardConvolutionDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: MPSGraphTensor, forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	convolutionTranspose2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeForwardConvolutionDescriptorName(incomingGradientTensor: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	convolutionTranspose2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeTensorForwardConvolutionDescriptorName(incomingGradientTensor: MPSGraphTensor, source: MPSGraphTensor, outputShape: MPSGraphTensor, forwardConvolutionDescriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	convolutionTranspose2DWithSourceTensorWeightsTensorOutputShapeDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	convolutionTranspose2DWithSourceTensorWeightsTensorOutputShapeTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, outputShape: MPSGraphTensor, descriptor: MPSGraphConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	coordinateAlongAxisTensorWithShapeName(axisTensor: MPSGraphTensor, shape: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	coordinateAlongAxisTensorWithShapeTensorName(axisTensor: MPSGraphTensor, shapeTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	coordinateAlongAxisWithShapeName(axis: number, shape: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	coordinateAlongAxisWithShapeTensorName(axis: number, shapeTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	cosWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	coshWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeMaximumWithTensorAxisExclusiveReverseName(tensor: MPSGraphTensor, axis: number, exclusive: boolean, reverse: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeMaximumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeMaximumWithTensorAxisTensorExclusiveReverseName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, exclusive: boolean, reverse: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeMaximumWithTensorAxisTensorName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeMinimumWithTensorAxisExclusiveReverseName(tensor: MPSGraphTensor, axis: number, exclusive: boolean, reverse: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeMinimumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeMinimumWithTensorAxisTensorExclusiveReverseName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, exclusive: boolean, reverse: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeMinimumWithTensorAxisTensorName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeProductWithTensorAxisExclusiveReverseName(tensor: MPSGraphTensor, axis: number, exclusive: boolean, reverse: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeProductWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeProductWithTensorAxisTensorExclusiveReverseName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, exclusive: boolean, reverse: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeProductWithTensorAxisTensorName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeSumWithTensorAxisExclusiveReverseName(tensor: MPSGraphTensor, axis: number, exclusive: boolean, reverse: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeSumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeSumWithTensorAxisTensorExclusiveReverseName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, exclusive: boolean, reverse: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	cumulativeSumWithTensorAxisTensorName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	depthToSpace2DTensorWidthAxisHeightAxisDepthAxisBlockSizeUsePixelShuffleOrderName(tensor: MPSGraphTensor, widthAxis: number, heightAxis: number, depthAxis: number, blockSize: number, usePixelShuffleOrder: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	depthToSpace2DTensorWidthAxisTensorHeightAxisTensorDepthAxisTensorBlockSizeUsePixelShuffleOrderName(tensor: MPSGraphTensor, widthAxisTensor: MPSGraphTensor, heightAxisTensor: MPSGraphTensor, depthAxisTensor: MPSGraphTensor, blockSize: number, usePixelShuffleOrder: boolean, name: string | null): MPSGraphTensor;

	depthwiseConvolution2DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphDepthwiseConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	depthwiseConvolution2DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeDescriptorName(incomingGradient: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphDepthwiseConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	depthwiseConvolution2DWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphDepthwiseConvolution2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	depthwiseConvolution3DDataGradientWithIncomingGradientTensorWeightsTensorOutputShapeDescriptorName(incomingGradient: MPSGraphTensor, weights: MPSGraphTensor, outputShape: NSArray<number> | number[] | null, descriptor: MPSGraphDepthwiseConvolution3DOpDescriptor, name: string | null): MPSGraphTensor;

	depthwiseConvolution3DWeightsGradientWithIncomingGradientTensorSourceTensorOutputShapeDescriptorName(incomingGradient: MPSGraphTensor, source: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphDepthwiseConvolution3DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	depthwiseConvolution3DWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphDepthwiseConvolution3DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.0
	 */
	dequantizeTensorLUTTensorAxisName(tensor: MPSGraphTensor, LUTTensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.0
	 */
	dequantizeTensorLUTTensorName(tensor: MPSGraphTensor, LUTTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	divisionNoNaNWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	divisionWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	dropoutTensorRateName(tensor: MPSGraphTensor, rate: number, name: string | null): MPSGraphTensor;

	dropoutTensorRateTensorName(tensor: MPSGraphTensor, rate: MPSGraphTensor, name: string | null): MPSGraphTensor;

	equalWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	erfWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	expandDimsOfTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	expandDimsOfTensorAxesTensorName(tensor: MPSGraphTensor, axesTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	expandDimsOfTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	exponentBase10WithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	exponentBase2WithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	exponentWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	fastFourierTransformWithTensorAxesDescriptorName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], descriptor: MPSGraphFFTDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	fastFourierTransformWithTensorAxesTensorDescriptorName(tensor: MPSGraphTensor, axesTensor: MPSGraphTensor, descriptor: MPSGraphFFTDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	flatten2DTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	flatten2DTensorAxisTensorName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	floorModuloWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	floorWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	forLoopWithLowerBoundUpperBoundStepInitialBodyArgumentsBodyName(lowerBound: MPSGraphTensor, upperBound: MPSGraphTensor, step: MPSGraphTensor, initialBodyArguments: NSArray<MPSGraphTensor> | MPSGraphTensor[], body: (p1: MPSGraphTensor, p2: NSArray<MPSGraphTensor>) => NSArray<MPSGraphTensor>, name: string | null): NSArray<MPSGraphTensor>;

	forLoopWithNumberOfIterationsInitialBodyArgumentsBodyName(numberOfIterations: MPSGraphTensor, initialBodyArguments: NSArray<MPSGraphTensor> | MPSGraphTensor[], body: (p1: MPSGraphTensor, p2: NSArray<MPSGraphTensor>) => NSArray<MPSGraphTensor>, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	gatherAlongAxisTensorWithUpdatesTensorIndicesTensorName(axisTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	gatherAlongAxisWithUpdatesTensorIndicesTensorName(axis: number, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	gatherNDWithUpdatesTensorIndicesTensorBatchDimensionsName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, batchDimensions: number, name: string | null): MPSGraphTensor;

	gatherWithUpdatesTensorIndicesTensorAxisBatchDimensionsName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, axis: number, batchDimensions: number, name: string | null): MPSGraphTensor;

	gradientForPrimaryTensorWithTensorsName(primaryTensor: MPSGraphTensor, tensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], name: string | null): NSDictionary<MPSGraphTensor, MPSGraphTensor>;

	greaterThanOrEqualToWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	greaterThanWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	identityWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	ifWithPredicateTensorThenBlockElseBlockName(predicateTensor: MPSGraphTensor, thenBlock: () => NSArray<MPSGraphTensor>, elseBlock: () => NSArray<MPSGraphTensor> | null, name: string | null): NSArray<MPSGraphTensor>;

	imToColWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphImToColOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	imaginaryPartOfTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	inverseOfTensorName(inputTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	isFiniteWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	isInfiniteWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	isNaNWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	leakyReLUGradientWithIncomingGradientSourceTensorAlphaTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, alphaTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	leakyReLUWithTensorAlphaName(tensor: MPSGraphTensor, alpha: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	leakyReLUWithTensorAlphaTensorName(tensor: MPSGraphTensor, alphaTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	lessThanOrEqualToWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	lessThanWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	logarithmBase10WithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	logarithmBase2WithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	logarithmWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	logicalANDWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	logicalNANDWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	logicalNORWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	logicalORWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	logicalXNORWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	logicalXORWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	matrixMultiplicationWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	maxPooling2DGradientWithGradientTensorIndicesTensorOutputShapeDescriptorName(gradient: MPSGraphTensor, indices: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphPooling2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	maxPooling2DGradientWithGradientTensorIndicesTensorOutputShapeTensorDescriptorName(gradient: MPSGraphTensor, indices: MPSGraphTensor, outputShape: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string | null): MPSGraphTensor;

	maxPooling2DGradientWithGradientTensorSourceTensorDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.3
	 */
	maxPooling2DReturnIndicesWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	maxPooling2DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling2DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	maxPooling4DGradientWithGradientTensorIndicesTensorOutputShapeDescriptorName(gradient: MPSGraphTensor, indices: MPSGraphTensor, outputShape: NSArray<number> | number[], descriptor: MPSGraphPooling4DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	maxPooling4DGradientWithGradientTensorIndicesTensorOutputShapeTensorDescriptorName(gradient: MPSGraphTensor, indices: MPSGraphTensor, outputShape: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	maxPooling4DGradientWithGradientTensorSourceTensorDescriptorName(gradient: MPSGraphTensor, source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.3
	 */
	maxPooling4DReturnIndicesWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.0
	 */
	maxPooling4DWithSourceTensorDescriptorName(source: MPSGraphTensor, descriptor: MPSGraphPooling4DOpDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	maximumWithNaNPropagationWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	maximumWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	meanOfTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	minimumWithNaNPropagationWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	minimumWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	moduloWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	multiplicationWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	negativeWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	nonMaximumSuppressionWithBoxesTensorScoresTensorClassIndicesTensorIOUThresholdScoreThresholdPerClassSuppressionCoordinateModeName(boxesTensor: MPSGraphTensor, scoresTensor: MPSGraphTensor, classIndicesTensor: MPSGraphTensor, IOUThreshold: number, scoreThreshold: number, perClassSuppression: boolean, coordinateMode: MPSGraphNonMaximumSuppressionCoordinateMode, name: string | null): MPSGraphTensor;

	nonMaximumSuppressionWithBoxesTensorScoresTensorIOUThresholdScoreThresholdPerClassSuppressionCoordinateModeName(boxesTensor: MPSGraphTensor, scoresTensor: MPSGraphTensor, IOUThreshold: number, scoreThreshold: number, perClassSuppression: boolean, coordinateMode: MPSGraphNonMaximumSuppressionCoordinateMode, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	nonZeroIndicesOfTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	normalizationBetaGradientWithIncomingGradientTensorSourceTensorReductionAxesName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	normalizationGammaGradientWithIncomingGradientTensorSourceTensorMeanTensorVarianceTensorReductionAxesEpsilonName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, meanTensor: MPSGraphTensor, varianceTensor: MPSGraphTensor, axes: NSArray<number> | number[], epsilon: number, name: string | null): MPSGraphTensor;

	normalizationGradientWithIncomingGradientTensorSourceTensorMeanTensorVarianceTensorGammaTensorGammaGradientTensorBetaGradientTensorReductionAxesEpsilonName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, meanTensor: MPSGraphTensor, varianceTensor: MPSGraphTensor, gamma: MPSGraphTensor | null, gammaGradient: MPSGraphTensor | null, betaGradient: MPSGraphTensor | null, axes: NSArray<number> | number[], epsilon: number, name: string | null): MPSGraphTensor;

	normalizationWithTensorMeanTensorVarianceTensorGammaTensorBetaTensorEpsilonName(tensor: MPSGraphTensor, mean: MPSGraphTensor, variance: MPSGraphTensor, gamma: MPSGraphTensor | null, beta: MPSGraphTensor | null, epsilon: number, name: string | null): MPSGraphTensor;

	notEqualWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	notWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	oneHotWithIndicesTensorDepthAxisName(indicesTensor: MPSGraphTensor, depth: number, axis: number, name: string | null): MPSGraphTensor;

	oneHotWithIndicesTensorDepthName(indicesTensor: MPSGraphTensor, depth: number, name: string | null): MPSGraphTensor;

	padGradientWithIncomingGradientTensorSourceTensorPaddingModeLeftPaddingRightPaddingName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, paddingMode: MPSGraphPaddingMode, leftPadding: NSArray<number> | number[], rightPadding: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	padTensorWithPaddingModeLeftPaddingRightPaddingConstantValueName(tensor: MPSGraphTensor, paddingMode: MPSGraphPaddingMode, leftPadding: NSArray<number> | number[], rightPadding: NSArray<number> | number[], constantValue: number, name: string | null): MPSGraphTensor;

	placeholderWithShapeName(shape: NSArray<number> | number[] | null, name: string | null): MPSGraphTensor;

	/**
	 * @since 26.3
	 */
	planarTensorWithComplexTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	powerWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	randomPhiloxStateTensorWithCounterLowCounterHighKeyName(counterLow: number, counterHigh: number, key: number, name: string | null): MPSGraphTensor;

	randomPhiloxStateTensorWithSeedName(seed: number, name: string | null): MPSGraphTensor;

	randomTensorWithShapeDescriptorName(shape: NSArray<number> | number[], descriptor: MPSGraphRandomOpDescriptor, name: string | null): MPSGraphTensor;

	randomTensorWithShapeDescriptorSeedName(shape: NSArray<number> | number[], descriptor: MPSGraphRandomOpDescriptor, seed: number, name: string | null): MPSGraphTensor;

	randomTensorWithShapeDescriptorStateTensorName(shape: NSArray<number> | number[], descriptor: MPSGraphRandomOpDescriptor, state: MPSGraphTensor, name: string | null): NSArray<MPSGraphTensor>;

	randomTensorWithShapeTensorDescriptorName(shapeTensor: MPSGraphTensor, descriptor: MPSGraphRandomOpDescriptor, name: string | null): MPSGraphTensor;

	randomTensorWithShapeTensorDescriptorSeedName(shapeTensor: MPSGraphTensor, descriptor: MPSGraphRandomOpDescriptor, seed: number, name: string | null): MPSGraphTensor;

	randomTensorWithShapeTensorDescriptorStateTensorName(shapeTensor: MPSGraphTensor, descriptor: MPSGraphRandomOpDescriptor, state: MPSGraphTensor, name: string | null): NSArray<MPSGraphTensor>;

	randomUniformTensorWithShapeName(shape: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	randomUniformTensorWithShapeSeedName(shape: NSArray<number> | number[], seed: number, name: string | null): MPSGraphTensor;

	randomUniformTensorWithShapeStateTensorName(shape: NSArray<number> | number[], state: MPSGraphTensor, name: string | null): NSArray<MPSGraphTensor>;

	randomUniformTensorWithShapeTensorName(shapeTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	randomUniformTensorWithShapeTensorSeedName(shapeTensor: MPSGraphTensor, seed: number, name: string | null): MPSGraphTensor;

	randomUniformTensorWithShapeTensorStateTensorName(shapeTensor: MPSGraphTensor, state: MPSGraphTensor, name: string | null): NSArray<MPSGraphTensor>;

	reLUGradientWithIncomingGradientSourceTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, name: string | null): MPSGraphTensor;

	reLUWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	readVariableName(variable: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	realPartOfTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	realToHermiteanFFTWithTensorAxesDescriptorName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], descriptor: MPSGraphFFTDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	realToHermiteanFFTWithTensorAxesTensorDescriptorName(tensor: MPSGraphTensor, axesTensor: MPSGraphTensor, descriptor: MPSGraphFFTDescriptor, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.0
	 */
	reciprocalSquareRootWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	reciprocalWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.3
	 */
	reductionAndWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[] | null, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.3
	 */
	reductionAndWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	reductionArgMaximumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	reductionArgMinimumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	reductionMaximumPropagateNaNWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[] | null, name: string | null): MPSGraphTensor;

	reductionMaximumPropagateNaNWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	reductionMaximumWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[] | null, name: string | null): MPSGraphTensor;

	reductionMaximumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	reductionMinimumPropagateNaNWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[] | null, name: string | null): MPSGraphTensor;

	reductionMinimumPropagateNaNWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	reductionMinimumWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[] | null, name: string | null): MPSGraphTensor;

	reductionMinimumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.3
	 */
	reductionOrWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[] | null, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.3
	 */
	reductionOrWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	reductionProductWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[] | null, name: string | null): MPSGraphTensor;

	reductionProductWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	reductionSumWithTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[] | null, name: string | null): MPSGraphTensor;

	reductionSumWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	reshapeTensorWithShapeName(tensor: MPSGraphTensor, shape: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	reshapeTensorWithShapeTensorName(tensor: MPSGraphTensor, shapeTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	resizeBilinearWithGradientTensorInputCenterResultAlignCornersLayoutName(gradient: MPSGraphTensor, input: MPSGraphTensor, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	resizeBilinearWithGradientTensorInputScaleOffsetTensorLayoutName(gradient: MPSGraphTensor, input: MPSGraphTensor, scaleOffset: MPSGraphTensor, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	resizeBilinearWithGradientTensorInputScaleTensorOffsetTensorName(gradient: MPSGraphTensor, input: MPSGraphTensor, scale: MPSGraphTensor, offset: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	resizeBilinearWithTensorSizeTensorCenterResultAlignCornersLayoutName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	resizeBilinearWithTensorSizeTensorCenterResultAlignCornersName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, centerResult: boolean, alignCorners: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	resizeBilinearWithTensorSizeTensorScaleOffsetTensorLayoutName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, scaleOffset: MPSGraphTensor, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	resizeBilinearWithTensorSizeTensorScaleTensorOffsetTensorName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, scale: MPSGraphTensor, offset: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	resizeNearestWithGradientTensorInputNearestRoundingModeCenterResultAlignCornersLayoutName(gradient: MPSGraphTensor, input: MPSGraphTensor, nearestRoundingMode: MPSGraphResizeNearestRoundingMode, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	resizeNearestWithGradientTensorInputScaleOffsetTensorNearestRoundingModeLayoutName(gradient: MPSGraphTensor, input: MPSGraphTensor, scaleOffset: MPSGraphTensor, nearestRoundingMode: MPSGraphResizeNearestRoundingMode, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	resizeNearestWithGradientTensorInputScaleTensorOffsetTensorNearestRoundingModeName(gradient: MPSGraphTensor, input: MPSGraphTensor, scale: MPSGraphTensor, offset: MPSGraphTensor, nearestRoundingMode: MPSGraphResizeNearestRoundingMode, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	resizeNearestWithTensorSizeTensorNearestRoundingModeCenterResultAlignCornersLayoutName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, nearestRoundingMode: MPSGraphResizeNearestRoundingMode, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	resizeNearestWithTensorSizeTensorNearestRoundingModeCenterResultAlignCornersName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, nearestRoundingMode: MPSGraphResizeNearestRoundingMode, centerResult: boolean, alignCorners: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	resizeNearestWithTensorSizeTensorScaleOffsetTensorNearestRoundingModeLayoutName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, scaleOffset: MPSGraphTensor, nearestRoundingMode: MPSGraphResizeNearestRoundingMode, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	resizeNearestWithTensorSizeTensorScaleTensorOffsetTensorNearestRoundingModeName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, scale: MPSGraphTensor, offset: MPSGraphTensor, nearestRoundingMode: MPSGraphResizeNearestRoundingMode, name: string | null): MPSGraphTensor;

	resizeTensorSizeModeCenterResultAlignCornersLayoutName(imagesTensor: MPSGraphTensor, size: NSArray<number> | number[], mode: MPSGraphResizeMode, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	resizeTensorSizeTensorModeCenterResultAlignCornersLayoutName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, mode: MPSGraphResizeMode, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	resizeTensorSizeTensorModeCenterResultAlignCornersName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, mode: MPSGraphResizeMode, centerResult: boolean, alignCorners: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	resizeTensorSizeTensorScaleOffsetTensorModeLayoutName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, scaleOffset: MPSGraphTensor, mode: MPSGraphResizeMode, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	resizeTensorSizeTensorScaleTensorOffsetTensorModeName(imagesTensor: MPSGraphTensor, size: MPSGraphTensor, scale: MPSGraphTensor, offset: MPSGraphTensor, mode: MPSGraphResizeMode, name: string | null): MPSGraphTensor;

	resizeWithGradientTensorInputModeCenterResultAlignCornersLayoutName(gradient: MPSGraphTensor, input: MPSGraphTensor, mode: MPSGraphResizeMode, centerResult: boolean, alignCorners: boolean, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	resizeWithGradientTensorInputScaleOffsetTensorModeLayoutName(gradient: MPSGraphTensor, input: MPSGraphTensor, scaleOffset: MPSGraphTensor, mode: MPSGraphResizeMode, layout: MPSGraphTensorNamedDataLayout, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	resizeWithGradientTensorInputScaleTensorOffsetTensorModeName(gradient: MPSGraphTensor, input: MPSGraphTensor, scale: MPSGraphTensor, offset: MPSGraphTensor, mode: MPSGraphResizeMode, name: string | null): MPSGraphTensor;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	reverseSquareRootWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	reverseTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	reverseTensorAxesTensorName(tensor: MPSGraphTensor, axesTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	reverseTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	rintWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	roundWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	runAsyncWithFeedsTargetTensorsTargetOperationsExecutionDescriptor(feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[] | null, executionDescriptor: MPSGraphExecutionDescriptor | null): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	runAsyncWithMTLCommandQueueFeedsTargetOperationsResultsDictionaryExecutionDescriptor(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[] | null, resultsDictionary: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, executionDescriptor: MPSGraphExecutionDescriptor | null): void;

	runAsyncWithMTLCommandQueueFeedsTargetTensorsTargetOperationsExecutionDescriptor(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[] | null, executionDescriptor: MPSGraphExecutionDescriptor | null): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	runWithFeedsTargetTensorsTargetOperations(feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[] | null): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	runWithMTLCommandQueueFeedsTargetOperationsResultsDictionary(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[] | null, resultsDictionary: NSDictionary<MPSGraphTensor, MPSGraphTensorData>): void;

	runWithMTLCommandQueueFeedsTargetTensorsTargetOperations(commandQueue: MTLCommandQueue, feeds: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, targetTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], targetOperations: NSArray<MPSGraphOperation> | MPSGraphOperation[] | null): NSDictionary<MPSGraphTensor, MPSGraphTensorData>;

	/**
	 * @since 16.2
	 */
	sampleGridWithSourceTensorCoordinateTensorLayoutNormalizeCoordinatesRelativeCoordinatesAlignCornersPaddingModeNearestRoundingModeConstantValueName(source: MPSGraphTensor, coordinates: MPSGraphTensor, layout: MPSGraphTensorNamedDataLayout, normalizeCoordinates: boolean, relativeCoordinates: boolean, alignCorners: boolean, paddingMode: MPSGraphPaddingMode, nearestRoundingMode: MPSGraphResizeNearestRoundingMode, constantValue: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.2
	 */
	sampleGridWithSourceTensorCoordinateTensorLayoutNormalizeCoordinatesRelativeCoordinatesAlignCornersPaddingModeSamplingModeConstantValueName(source: MPSGraphTensor, coordinates: MPSGraphTensor, layout: MPSGraphTensorNamedDataLayout, normalizeCoordinates: boolean, relativeCoordinates: boolean, alignCorners: boolean, paddingMode: MPSGraphPaddingMode, samplingMode: MPSGraphResizeMode, constantValue: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.0
	 */
	scaledDotProductAttentionWithQueryTensorKeyTensorValueTensorMaskTensorScaleName(queryTensor: MPSGraphTensor, keyTensor: MPSGraphTensor, valueTensor: MPSGraphTensor, maskTensor: MPSGraphTensor | null, scale: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.0
	 */
	scaledDotProductAttentionWithQueryTensorKeyTensorValueTensorScaleName(queryTensor: MPSGraphTensor, keyTensor: MPSGraphTensor, valueTensor: MPSGraphTensor, scale: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	scatterAlongAxisTensorWithDataTensorUpdatesTensorIndicesTensorModeName(axisTensor: MPSGraphTensor, dataTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, mode: MPSGraphScatterMode, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	scatterAlongAxisTensorWithUpdatesTensorIndicesTensorShapeModeName(axisTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], mode: MPSGraphScatterMode, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	scatterAlongAxisWithDataTensorUpdatesTensorIndicesTensorModeName(axis: number, dataTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, mode: MPSGraphScatterMode, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	scatterAlongAxisWithUpdatesTensorIndicesTensorShapeModeName(axis: number, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], mode: MPSGraphScatterMode, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	scatterNDWithDataTensorUpdatesTensorIndicesTensorBatchDimensionsModeName(dataTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, batchDimensions: number, mode: MPSGraphScatterMode, name: string | null): MPSGraphTensor;

	scatterNDWithUpdatesTensorIndicesTensorShapeBatchDimensionsModeName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], batchDimensions: number, mode: MPSGraphScatterMode, name: string | null): MPSGraphTensor;

	scatterNDWithUpdatesTensorIndicesTensorShapeBatchDimensionsName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], batchDimensions: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	scatterWithDataTensorUpdatesTensorIndicesTensorAxisModeName(dataTensor: MPSGraphTensor, updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, axis: number, mode: MPSGraphScatterMode, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	scatterWithUpdatesTensorIndicesTensorShapeAxisModeName(updatesTensor: MPSGraphTensor, indicesTensor: MPSGraphTensor, shape: NSArray<number> | number[], axis: number, mode: MPSGraphScatterMode, name: string | null): MPSGraphTensor;

	selectWithPredicateTensorTruePredicateTensorFalsePredicateTensorName(predicateTensor: MPSGraphTensor, truePredicateTensor: MPSGraphTensor, falseSelectTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	shapeOfTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	sigmoidGradientWithIncomingGradientSourceTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, name: string | null): MPSGraphTensor;

	sigmoidWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	signWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	signbitWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	sinWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	singleGateRNNGradientsWithSourceTensorRecurrentWeightSourceGradientZStateInitStateDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, initState: MPSGraphTensor | null, descriptor: MPSGraphSingleGateRNNDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	singleGateRNNGradientsWithSourceTensorRecurrentWeightSourceGradientZStateInputWeightBiasInitStateDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, descriptor: MPSGraphSingleGateRNNDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	singleGateRNNGradientsWithSourceTensorRecurrentWeightSourceGradientZStateInputWeightBiasInitStateMaskDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, mask: MPSGraphTensor | null, descriptor: MPSGraphSingleGateRNNDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	singleGateRNNGradientsWithSourceTensorRecurrentWeightSourceGradientZStateStateGradientInputWeightBiasInitStateMaskDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, sourceGradient: MPSGraphTensor, zState: MPSGraphTensor, stateGradient: MPSGraphTensor | null, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, mask: MPSGraphTensor | null, descriptor: MPSGraphSingleGateRNNDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	singleGateRNNWithSourceTensorRecurrentWeightInitStateDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, initState: MPSGraphTensor | null, descriptor: MPSGraphSingleGateRNNDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	singleGateRNNWithSourceTensorRecurrentWeightInputWeightBiasInitStateDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, descriptor: MPSGraphSingleGateRNNDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	singleGateRNNWithSourceTensorRecurrentWeightInputWeightBiasInitStateMaskDescriptorName(source: MPSGraphTensor, recurrentWeight: MPSGraphTensor, inputWeight: MPSGraphTensor | null, bias: MPSGraphTensor | null, initState: MPSGraphTensor | null, mask: MPSGraphTensor | null, descriptor: MPSGraphSingleGateRNNDescriptor, name: string | null): NSArray<MPSGraphTensor>;

	sinhWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.2
	 */
	sliceGradientTensorFwdInShapeTensorStartTensorEndTensorStrideTensorStartMaskEndMaskSqueezeMaskName(inputGradientTensor: MPSGraphTensor, fwdInShapeTensor: MPSGraphTensor, startTensor: MPSGraphTensor, endTensor: MPSGraphTensor, strideTensor: MPSGraphTensor, startMask: number, endMask: number, squeezeMask: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.2
	 */
	sliceGradientTensorFwdInShapeTensorStartTensorSizeTensorSqueezeMaskName(inputGradientTensor: MPSGraphTensor, fwdInShapeTensor: MPSGraphTensor, startTensor: MPSGraphTensor, sizeTensor: MPSGraphTensor, squeezeMask: number, name: string | null): MPSGraphTensor;

	sliceGradientTensorFwdInShapeTensorStartsEndsStridesName(inputGradientTensor: MPSGraphTensor, fwdInShapeTensor: MPSGraphTensor, starts: NSArray<number> | number[], ends: NSArray<number> | number[], strides: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	sliceGradientTensorFwdInShapeTensorStartsEndsStridesStartMaskEndMaskSqueezeMaskName(inputGradientTensor: MPSGraphTensor, fwdInShapeTensor: MPSGraphTensor, starts: NSArray<number> | number[], ends: NSArray<number> | number[], strides: NSArray<number> | number[], startMask: number, endMask: number, squeezeMask: number, name: string | null): MPSGraphTensor;

	sliceTensorDimensionStartLengthName(tensor: MPSGraphTensor, dimensionIndex: number, start: number, length: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.2
	 */
	sliceTensorStartTensorEndTensorStrideTensorStartMaskEndMaskSqueezeMaskName(tensor: MPSGraphTensor, startTensor: MPSGraphTensor, endTensor: MPSGraphTensor, strideTensor: MPSGraphTensor, startMask: number, endMask: number, squeezeMask: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.2
	 */
	sliceTensorStartTensorSizeTensorSqueezeMaskName(tensor: MPSGraphTensor, startTensor: MPSGraphTensor, sizeTensor: MPSGraphTensor, squeezeMask: number, name: string | null): MPSGraphTensor;

	sliceTensorStartsEndsStridesName(tensor: MPSGraphTensor, starts: NSArray<number> | number[], ends: NSArray<number> | number[], strides: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	sliceTensorStartsEndsStridesStartMaskEndMaskSqueezeMaskName(tensor: MPSGraphTensor, starts: NSArray<number> | number[], ends: NSArray<number> | number[], strides: NSArray<number> | number[], startMask: number, endMask: number, squeezeMask: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.0
	 */
	sliceUpdateDataTensorUpdateTensorStartsEndsStridesName(dataTensor: MPSGraphTensor, updateTensor: MPSGraphTensor, starts: NSArray<number> | number[], ends: NSArray<number> | number[], strides: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 17.4
	 */
	sliceUpdateDataTensorUpdateTensorStartsEndsStridesStartMaskEndMaskSqueezeMaskName(dataTensor: MPSGraphTensor, updateTensor: MPSGraphTensor, starts: NSArray<number> | number[], ends: NSArray<number> | number[], strides: NSArray<number> | number[], startMask: number, endMask: number, squeezeMask: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.0
	 */
	sliceUpdateDataTensorUpdateTensorStartsTensorEndsTensorStridesTensorName(dataTensor: MPSGraphTensor, updateTensor: MPSGraphTensor, startsTensor: MPSGraphTensor, endsTensor: MPSGraphTensor, stridesTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.4
	 */
	sliceUpdateDataTensorUpdateTensorStartsTensorEndsTensorStridesTensorStartMaskEndMaskSqueezeMaskName(dataTensor: MPSGraphTensor, updateTensor: MPSGraphTensor, startsTensor: MPSGraphTensor, endsTensor: MPSGraphTensor, stridesTensor: MPSGraphTensor, startMask: number, endMask: number, squeezeMask: number, name: string | null): MPSGraphTensor;

	softMaxCrossEntropyGradientWithIncomingGradientTensorSourceTensorLabelsTensorAxisReductionTypeName(gradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, labelsTensor: MPSGraphTensor, axis: number, reductionType: MPSGraphLossReductionType, name: string | null): MPSGraphTensor;

	softMaxCrossEntropyWithSourceTensorLabelsTensorAxisReductionTypeName(sourceTensor: MPSGraphTensor, labelsTensor: MPSGraphTensor, axis: number, reductionType: MPSGraphLossReductionType, name: string | null): MPSGraphTensor;

	softMaxGradientWithIncomingGradientSourceTensorAxisName(gradient: MPSGraphTensor, source: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	softMaxWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	sortWithTensorAxisDescendingName(tensor: MPSGraphTensor, axis: number, descending: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	sortWithTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	sortWithTensorAxisTensorDescendingName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, descending: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	sortWithTensorAxisTensorName(tensor: MPSGraphTensor, axisTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	spaceToBatchTensorSpatialAxesBatchAxisBlockDimensionsUsePixelShuffleOrderName(tensor: MPSGraphTensor, spatialAxes: NSArray<number> | number[], batchAxis: number, blockDimensions: NSArray<number> | number[], usePixelShuffleOrder: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.1
	 */
	spaceToBatchTensorSpatialAxesTensorBatchAxisTensorBlockDimensionsTensorUsePixelShuffleOrderName(tensor: MPSGraphTensor, spatialAxesTensor: MPSGraphTensor, batchAxisTensor: MPSGraphTensor, blockDimensionsTensor: MPSGraphTensor, usePixelShuffleOrder: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	spaceToDepth2DTensorWidthAxisHeightAxisDepthAxisBlockSizeUsePixelShuffleOrderName(tensor: MPSGraphTensor, widthAxis: number, heightAxis: number, depthAxis: number, blockSize: number, usePixelShuffleOrder: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	spaceToDepth2DTensorWidthAxisTensorHeightAxisTensorDepthAxisTensorBlockSizeUsePixelShuffleOrderName(tensor: MPSGraphTensor, widthAxisTensor: MPSGraphTensor, heightAxisTensor: MPSGraphTensor, depthAxisTensor: MPSGraphTensor, blockSize: number, usePixelShuffleOrder: boolean, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.0
	 */
	sparseTensorWithDescriptorTensorsShapeName(sparseDescriptor: MPSGraphCreateSparseOpDescriptor, inputTensorArray: NSArray<MPSGraphTensor> | MPSGraphTensor[], shape: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	splitTensorNumSplitsAxisName(tensor: MPSGraphTensor, numSplits: number, axis: number, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	splitTensorSplitSizesAxisName(tensor: MPSGraphTensor, splitSizes: NSArray<number> | number[], axis: number, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 15.4
	 */
	splitTensorSplitSizesTensorAxisName(tensor: MPSGraphTensor, splitSizesTensor: MPSGraphTensor, axis: number, name: string | null): NSArray<MPSGraphTensor>;

	squareRootWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	squareWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	squeezeTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	squeezeTensorAxesTensorName(tensor: MPSGraphTensor, axesTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	squeezeTensorAxisName(tensor: MPSGraphTensor, axis: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	squeezeTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 15.4
	 */
	stackTensorsAxisName(inputTensors: NSArray<MPSGraphTensor> | MPSGraphTensor[], axis: number, name: string | null): MPSGraphTensor;

	stencilWithSourceTensorWeightsTensorDescriptorName(source: MPSGraphTensor, weights: MPSGraphTensor, descriptor: MPSGraphStencilOpDescriptor, name: string | null): MPSGraphTensor;

	stochasticGradientDescentWithLearningRateTensorValuesTensorGradientTensorName(learningRateTensor: MPSGraphTensor, valuesTensor: MPSGraphTensor, gradientTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	subtractionWithPrimaryTensorSecondaryTensorName(primaryTensor: MPSGraphTensor, secondaryTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	tanWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	tanhWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	tileGradientWithIncomingGradientTensorSourceTensorWithMultiplierName(incomingGradientTensor: MPSGraphTensor, sourceTensor: MPSGraphTensor, multiplier: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	tileTensorWithMultiplierName(tensor: MPSGraphTensor, multiplier: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	topKWithGradientTensorSourceAxisKName(gradient: MPSGraphTensor, source: MPSGraphTensor, axis: number, k: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	topKWithGradientTensorSourceAxisTensorKTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, axisTensor: MPSGraphTensor, kTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	topKWithGradientTensorSourceKName(gradient: MPSGraphTensor, source: MPSGraphTensor, k: number, name: string | null): MPSGraphTensor;

	topKWithGradientTensorSourceKTensorName(gradient: MPSGraphTensor, source: MPSGraphTensor, kTensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 17.0
	 */
	topKWithSourceTensorAxisKName(source: MPSGraphTensor, axis: number, k: number, name: string | null): NSArray<MPSGraphTensor>;

	/**
	 * @since 17.0
	 */
	topKWithSourceTensorAxisTensorKTensorName(source: MPSGraphTensor, axisTensor: MPSGraphTensor, kTensor: MPSGraphTensor, name: string | null): NSArray<MPSGraphTensor>;

	topKWithSourceTensorKName(source: MPSGraphTensor, k: number, name: string | null): NSArray<MPSGraphTensor>;

	topKWithSourceTensorKTensorName(source: MPSGraphTensor, kTensor: MPSGraphTensor, name: string | null): NSArray<MPSGraphTensor>;

	transposeTensorDimensionWithDimensionName(tensor: MPSGraphTensor, dimensionIndex: number, dimensionIndex2: number, name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	transposeTensorPermutationName(tensor: MPSGraphTensor, permutation: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	/**
	 * @since 16.0
	 */
	truncateWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	/**
	 * @since 18.0
	 */
	variableFromTensorWithTensorName(tensor: MPSGraphTensor, name: string | null): MPSGraphTensor;

	varianceOfTensorAxesName(tensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	varianceOfTensorMeanTensorAxesName(tensor: MPSGraphTensor, meanTensor: MPSGraphTensor, axes: NSArray<number> | number[], name: string | null): MPSGraphTensor;

	whileWithInitialInputsBeforeAfterName(initialInputs: NSArray<MPSGraphTensor> | MPSGraphTensor[], before: (p1: NSArray<MPSGraphTensor>, p2: NSMutableArray<MPSGraphTensor>) => MPSGraphTensor, after: (p1: NSArray<MPSGraphTensor>) => NSArray<MPSGraphTensor>, name: string | null): NSArray<MPSGraphTensor>;
}

/**
 * @since 15.0
 */
declare class MPSGraphCompilationDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphCompilationDescriptor; // inherited from NSObject

	static new(): MPSGraphCompilationDescriptor; // inherited from NSObject

	/**
	 * @since 17.1
	 */
	callables: NSDictionary<string, MPSGraphExecutable> | null;

	/**
	 * @since 16.0
	 */
	compilationCompletionHandler: (p1: MPSGraphExecutable, p2: NSError | null) => void;

	/**
	 * @since 16.0
	 */
	dispatchQueue: NSObject & OS_dispatch_queue;

	/**
	 * @since 15.4
	 */
	optimizationLevel: MPSGraphOptimization;

	/**
	 * @since 15.4
	 * @deprecated 17.0
	 */
	optimizationProfile: MPSGraphOptimizationProfile;

	/**
	 * @since 26.0
	 */
	reducedPrecisionFastMath: MPSGraphReducedPrecisionFastMath;

	/**
	 * @since 16.0
	 */
	waitForCompilationCompletion: boolean;

	/**
	 * @since 26.4
	 */
	convertLayoutToNHWC(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	disableTypeInference(): void;
}

/**
 * @since 14.0
 */
declare class MPSGraphConvolution2DOpDescriptor extends MPSGraphObject implements NSCopying {

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	setExplicitPaddingWithPaddingLeftPaddingRightPaddingTopPaddingBottom(paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number): void;
}

/**
 * @since 16.3
 */
declare class MPSGraphConvolution3DOpDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphConvolution3DOpDescriptor; // inherited from NSObject

	static descriptorWithStrideInXStrideInYStrideInZDilationRateInXDilationRateInYDilationRateInZGroupsPaddingLeftPaddingRightPaddingTopPaddingBottomPaddingFrontPaddingBackPaddingStyleDataLayoutWeightsLayout(strideInX: number, strideInY: number, strideInZ: number, dilationRateInX: number, dilationRateInY: number, dilationRateInZ: number, groups: number, paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number, paddingFront: number, paddingBack: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout, weightsLayout: MPSGraphTensorNamedDataLayout): MPSGraphConvolution3DOpDescriptor;

	static descriptorWithStrideInXStrideInYStrideInZDilationRateInXDilationRateInYDilationRateInZGroupsPaddingStyleDataLayoutWeightsLayout(strideInX: number, strideInY: number, strideInZ: number, dilationRateInX: number, dilationRateInY: number, dilationRateInZ: number, groups: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout, weightsLayout: MPSGraphTensorNamedDataLayout): MPSGraphConvolution3DOpDescriptor;

	static new(): MPSGraphConvolution3DOpDescriptor; // inherited from NSObject

	dataLayout: MPSGraphTensorNamedDataLayout;

	dilationRateInX: number;

	dilationRateInY: number;

	dilationRateInZ: number;

	groups: number;

	paddingBack: number;

	paddingBottom: number;

	paddingFront: number;

	paddingLeft: number;

	paddingRight: number;

	paddingStyle: MPSGraphPaddingStyle;

	paddingTop: number;

	strideInX: number;

	strideInY: number;

	strideInZ: number;

	weightsLayout: MPSGraphTensorNamedDataLayout;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	setExplicitPaddingWithPaddingLeftPaddingRightPaddingTopPaddingBottomPaddingFrontPaddingBack(paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number, paddingFront: number, paddingBack: number): void;
}

/**
 * @since 15.0
 */
declare class MPSGraphCreateSparseOpDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphCreateSparseOpDescriptor; // inherited from NSObject

	static new(): MPSGraphCreateSparseOpDescriptor; // inherited from NSObject

	sparseStorageType: MPSGraphSparseStorageType;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

declare const enum MPSGraphDeploymentPlatform {

	MacOS = 0,

	IOS = 1,

	TvOS = 2,

	VisionOS = 3
}

/**
 * @since 14.0
 */
declare class MPSGraphDepthwiseConvolution2DOpDescriptor extends MPSGraphObject implements NSCopying {

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	setExplicitPaddingWithPaddingLeftPaddingRightPaddingTopPaddingBottom(paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number): void;
}

/**
 * @since 15.0
 */
declare class MPSGraphDepthwiseConvolution3DOpDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphDepthwiseConvolution3DOpDescriptor; // inherited from NSObject

	static descriptorWithPaddingStyle(paddingStyle: MPSGraphPaddingStyle): MPSGraphDepthwiseConvolution3DOpDescriptor;

	static descriptorWithStridesDilationRatesPaddingValuesPaddingStyle(strides: NSArray<number> | number[], dilationRates: NSArray<number> | number[], paddingValues: NSArray<number> | number[], paddingStyle: MPSGraphPaddingStyle): MPSGraphDepthwiseConvolution3DOpDescriptor;

	static new(): MPSGraphDepthwiseConvolution3DOpDescriptor; // inherited from NSObject

	channelDimensionIndex: number;

	dilationRates: NSArray<number>;

	paddingStyle: MPSGraphPaddingStyle;

	paddingValues: NSArray<number>;

	strides: NSArray<number>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 14.0
 */
declare class MPSGraphDevice extends MPSGraphObject {

	static alloc(): MPSGraphDevice; // inherited from NSObject

	static deviceWithMTLDevice(metalDevice: MTLDevice): MPSGraphDevice;

	static new(): MPSGraphDevice; // inherited from NSObject

	readonly metalDevice: MTLDevice | null;

	readonly type: MPSGraphDeviceType;
}

declare const enum MPSGraphDeviceType {

	Metal = 0
}

/**
 * @since 15.0
 */
declare class MPSGraphExecutable extends MPSGraphObject {

	static alloc(): MPSGraphExecutable; // inherited from NSObject

	static new(): MPSGraphExecutable; // inherited from NSObject

	readonly feedTensors: NSArray<MPSGraphTensor> | null;

	options: MPSGraphOptions;

	readonly targetTensors: NSArray<MPSGraphTensor> | null;

	/**
	 * @since 18.0
	 */
	constructor(o: { coreMLPackageAtURL: NSURL; compilationDescriptor: MPSGraphCompilationDescriptor | null; });

	/**
	 * @since 17.0
	 */
	constructor(o: { MPSGraphPackageAtURL: NSURL; compilationDescriptor: MPSGraphCompilationDescriptor | null; });

	/**
	 * @since 16.3
	 */
	getOutputTypesWithDeviceInputTypesCompilationDescriptor(device: MPSGraphDevice | null, inputTypes: NSArray<MPSGraphType> | MPSGraphType[], compilationDescriptor: MPSGraphCompilationDescriptor | null): NSArray<MPSGraphShapedType> | null;

	/**
	 * @since 18.0
	 */
	initWithCoreMLPackageAtURLCompilationDescriptor(coreMLPackageURL: NSURL, compilationDescriptor: MPSGraphCompilationDescriptor | null): this;

	/**
	 * @since 17.0
	 */
	initWithMPSGraphPackageAtURLCompilationDescriptor(mpsgraphPackageURL: NSURL, compilationDescriptor: MPSGraphCompilationDescriptor | null): this;

	runAsyncWithMTLCommandQueueInputsArrayResultsArrayExecutionDescriptor(commandQueue: MTLCommandQueue, inputsArray: NSArray<MPSGraphTensorData> | MPSGraphTensorData[], resultsArray: NSArray<MPSGraphTensorData> | MPSGraphTensorData[] | null, executionDescriptor: MPSGraphExecutableExecutionDescriptor | null): NSArray<MPSGraphTensorData>;

	runWithMTLCommandQueueInputsArrayResultsArrayExecutionDescriptor(commandQueue: MTLCommandQueue, inputsArray: NSArray<MPSGraphTensorData> | MPSGraphTensorData[], resultsArray: NSArray<MPSGraphTensorData> | MPSGraphTensorData[] | null, executionDescriptor: MPSGraphExecutableExecutionDescriptor | null): NSArray<MPSGraphTensorData>;

	/**
	 * @since 17.0
	 */
	serializeToMPSGraphPackageAtURLDescriptor(url: NSURL, descriptor: MPSGraphExecutableSerializationDescriptor | null): void;

	specializeWithDeviceInputTypesCompilationDescriptor(device: MPSGraphDevice | null, inputTypes: NSArray<MPSGraphType> | MPSGraphType[], compilationDescriptor: MPSGraphCompilationDescriptor | null): void;
}

/**
 * @since 15.0
 */
declare class MPSGraphExecutableExecutionDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphExecutableExecutionDescriptor; // inherited from NSObject

	static new(): MPSGraphExecutableExecutionDescriptor; // inherited from NSObject

	completionHandler: (p1: NSArray<MPSGraphTensorData>, p2: NSError | null) => void;

	scheduledHandler: (p1: NSArray<MPSGraphTensorData>, p2: NSError | null) => void;

	waitUntilCompleted: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	/**
	 * @since 16.0
	 */
	signalEventAtExecutionEventValue(event: MTLSharedEvent, executionStage: MPSGraphExecutionStage, value: number): void;

	/**
	 * @since 16.0
	 */
	waitForEventValue(event: MTLSharedEvent, value: number): void;
}

/**
 * @since 17.0
 */
declare class MPSGraphExecutableSerializationDescriptor extends MPSGraphObject {

	static alloc(): MPSGraphExecutableSerializationDescriptor; // inherited from NSObject

	static new(): MPSGraphExecutableSerializationDescriptor; // inherited from NSObject

	append: boolean;

	deploymentPlatform: MPSGraphDeploymentPlatform;

	minimumDeploymentTarget: string;
}

/**
 * @since 14.0
 */
declare class MPSGraphExecutionDescriptor extends MPSGraphObject {

	static alloc(): MPSGraphExecutionDescriptor; // inherited from NSObject

	static new(): MPSGraphExecutionDescriptor; // inherited from NSObject

	/**
	 * @since 15.4
	 */
	compilationDescriptor: MPSGraphCompilationDescriptor | null;

	completionHandler: (p1: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, p2: NSError | null) => void;

	scheduledHandler: (p1: NSDictionary<MPSGraphTensor, MPSGraphTensorData>, p2: NSError | null) => void;

	waitUntilCompleted: boolean;

	/**
	 * @since 16.0
	 */
	signalEventAtExecutionEventValue(event: MTLSharedEvent, executionStage: MPSGraphExecutionStage, value: number): void;

	/**
	 * @since 16.0
	 */
	waitForEventValue(event: MTLSharedEvent, value: number): void;
}

declare const enum MPSGraphExecutionStage {

	Completed = 0
}

/**
 * @since 17.0
 */
declare class MPSGraphFFTDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphFFTDescriptor; // inherited from NSObject

	static descriptor(): MPSGraphFFTDescriptor;

	static new(): MPSGraphFFTDescriptor; // inherited from NSObject

	inverse: boolean;

	roundToOddHermitean: boolean;

	scalingMode: MPSGraphFFTScalingMode;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

declare const enum MPSGraphFFTScalingMode {

	None = 0,

	Size = 1,

	Unitary = 2
}

/**
 * @since 16.0
 */
declare class MPSGraphGRUDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphGRUDescriptor; // inherited from NSObject

	static descriptor(): MPSGraphGRUDescriptor;

	static new(): MPSGraphGRUDescriptor; // inherited from NSObject

	bidirectional: boolean;

	flipZ: boolean;

	outputGateActivation: MPSGraphRNNActivation;

	resetAfter: boolean;

	resetGateActivation: MPSGraphRNNActivation;

	resetGateFirst: boolean;

	reverse: boolean;

	training: boolean;

	updateGateActivation: MPSGraphRNNActivation;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 17.0
 */
declare class MPSGraphImToColOpDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphImToColOpDescriptor; // inherited from NSObject

	static descriptorWithKernelWidthKernelHeightStrideInXStrideInYDilationRateInXDilationRateInYDataLayout(kernelWidth: number, kernelHeight: number, strideInX: number, strideInY: number, dilationRateInX: number, dilationRateInY: number, dataLayout: MPSGraphTensorNamedDataLayout): MPSGraphImToColOpDescriptor;

	static descriptorWithKernelWidthKernelHeightStrideInXStrideInYDilationRateInXDilationRateInYPaddingLeftPaddingRightPaddingTopPaddingBottomDataLayout(kernelWidth: number, kernelHeight: number, strideInX: number, strideInY: number, dilationRateInX: number, dilationRateInY: number, paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number, dataLayout: MPSGraphTensorNamedDataLayout): MPSGraphImToColOpDescriptor;

	static new(): MPSGraphImToColOpDescriptor; // inherited from NSObject

	dataLayout: MPSGraphTensorNamedDataLayout;

	dilationRateInX: number;

	dilationRateInY: number;

	kernelHeight: number;

	kernelWidth: number;

	paddingBottom: number;

	paddingLeft: number;

	paddingRight: number;

	paddingTop: number;

	strideInX: number;

	strideInY: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	setExplicitPaddingWithPaddingLeftPaddingRightPaddingTopPaddingBottom(paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number): void;
}

/**
 * @since 15.4
 */
declare class MPSGraphLSTMDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphLSTMDescriptor; // inherited from NSObject

	static descriptor(): MPSGraphLSTMDescriptor;

	static new(): MPSGraphLSTMDescriptor; // inherited from NSObject

	activation: MPSGraphRNNActivation;

	bidirectional: boolean;

	cellGateActivation: MPSGraphRNNActivation;

	forgetGateActivation: MPSGraphRNNActivation;

	forgetGateLast: boolean;

	inputGateActivation: MPSGraphRNNActivation;

	outputGateActivation: MPSGraphRNNActivation;

	produceCell: boolean;

	reverse: boolean;

	training: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

declare const enum MPSGraphLossReductionType {

	None = 0,

	Axis = 0,

	Sum = 1,

	Mean = 2
}

declare const enum MPSGraphNonMaximumSuppressionCoordinateMode {

	CornersHeightFirst = 0,

	CornersWidthFirst = 1,

	CentersHeightFirst = 2,

	CentersWidthFirst = 3
}

/**
 * @since 17.0
 */
declare class MPSGraphObject extends NSObject {

	static alloc(): MPSGraphObject; // inherited from NSObject

	static new(): MPSGraphObject; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class MPSGraphOperation extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphOperation; // inherited from NSObject

	static new(): MPSGraphOperation; // inherited from NSObject

	readonly controlDependencies: NSArray<MPSGraphOperation>;

	readonly graph: MPSGraph;

	readonly inputTensors: NSArray<MPSGraphTensor>;

	readonly name: string;

	readonly outputTensors: NSArray<MPSGraphTensor>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
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

	ExplicitOffset = 3,

	ONNX_SAME_LOWER = 4
}

/**
 * @since 14.0
 */
declare class MPSGraphPooling2DOpDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphPooling2DOpDescriptor; // inherited from NSObject

	static descriptorWithKernelWidthKernelHeightStrideInXStrideInYDilationRateInXDilationRateInYPaddingLeftPaddingRightPaddingTopPaddingBottomPaddingStyleDataLayout(kernelWidth: number, kernelHeight: number, strideInX: number, strideInY: number, dilationRateInX: number, dilationRateInY: number, paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout): MPSGraphPooling2DOpDescriptor;

	static descriptorWithKernelWidthKernelHeightStrideInXStrideInYPaddingStyleDataLayout(kernelWidth: number, kernelHeight: number, strideInX: number, strideInY: number, paddingStyle: MPSGraphPaddingStyle, dataLayout: MPSGraphTensorNamedDataLayout): MPSGraphPooling2DOpDescriptor;

	static new(): MPSGraphPooling2DOpDescriptor; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	ceilMode: boolean;

	dataLayout: MPSGraphTensorNamedDataLayout;

	dilationRateInX: number;

	dilationRateInY: number;

	/**
	 * @since 15.0
	 */
	includeZeroPadToAverage: boolean;

	kernelHeight: number;

	kernelWidth: number;

	paddingBottom: number;

	paddingLeft: number;

	paddingRight: number;

	paddingStyle: MPSGraphPaddingStyle;

	paddingTop: number;

	/**
	 * @since 15.3
	 */
	returnIndicesMode: MPSGraphPoolingReturnIndicesMode;

	strideInX: number;

	strideInY: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	setExplicitPaddingWithPaddingLeftPaddingRightPaddingTopPaddingBottom(paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number): void;
}

/**
 * @since 15.0
 */
declare class MPSGraphPooling4DOpDescriptor extends MPSGraphObject implements NSCopying {

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

	/**
	 * @since 15.3
	 */
	returnIndicesMode: MPSGraphPoolingReturnIndicesMode;

	strides: NSArray<number>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
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

declare const enum MPSGraphRNNActivation {

	None = 0,

	Relu = 1,

	Tanh = 2,

	Sigmoid = 3,

	HardSigmoid = 4
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

declare class MPSGraphRandomOpDescriptor extends MPSGraphObject implements NSCopying {

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 26.0
 */
declare const enum MPSGraphReducedPrecisionFastMath {

	None = 0,

	AllowFP16Conv2DWinogradTransformIntermediate = 2,

	AllowConvertingOperandsFromFP32ToFP19 = 4,

	AllowFP16Intermediates = 2,

	Default = 0
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

declare const enum MPSGraphResizeNearestRoundingMode {

	RoundPreferCeil = 0,

	RoundPreferFloor = 1,

	Ceil = 2,

	Floor = 3,

	RoundToEven = 4,

	RoundToOdd = 5
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

/**
 * @since 14.0
 */
declare class MPSGraphShapedType extends MPSGraphType {

	static alloc(): MPSGraphShapedType; // inherited from NSObject

	static new(): MPSGraphShapedType; // inherited from NSObject

	shape: NSArray<number> | null;

	isEqualTo(object: MPSGraphShapedType | null): boolean;
}

/**
 * @since 15.4
 */
declare class MPSGraphSingleGateRNNDescriptor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphSingleGateRNNDescriptor; // inherited from NSObject

	static descriptor(): MPSGraphSingleGateRNNDescriptor;

	static new(): MPSGraphSingleGateRNNDescriptor; // inherited from NSObject

	activation: MPSGraphRNNActivation;

	bidirectional: boolean;

	reverse: boolean;

	training: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

declare const enum MPSGraphSparseStorageType {

	COO = 0,

	CSC = 1,

	CSR = 2
}

/**
 * @since 15.0
 */
declare class MPSGraphStencilOpDescriptor extends MPSGraphObject implements NSCopying {

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 14.0
 */
declare class MPSGraphTensor extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphTensor; // inherited from NSObject

	static new(): MPSGraphTensor; // inherited from NSObject

	readonly operation: MPSGraphOperation;

	readonly shape: NSArray<number> | null;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 14.0
 */
declare class MPSGraphTensorData extends MPSGraphObject {

	static alloc(): MPSGraphTensorData; // inherited from NSObject

	static new(): MPSGraphTensorData; // inherited from NSObject

	readonly device: MPSGraphDevice;

	readonly shape: NSArray<number>;

	/**
	 * @since 19.0
	 */
	constructor(o: { MTLTensor: any; });

	/**
	 * @since 19.0
	 */
	initWithMTLTensor(tensor: any): this;
}

declare const enum MPSGraphTensorNamedDataLayout {

	NCHW = 0,

	NHWC = 1,

	OIHW = 2,

	HWIO = 3,

	CHW = 4,

	HWC = 5,

	HW = 6,

	NCDHW = 7,

	NDHWC = 8,

	OIDHW = 9,

	DHWIO = 10
}

/**
 * @since 15.0
 */
declare class MPSGraphType extends MPSGraphObject implements NSCopying {

	static alloc(): MPSGraphType; // inherited from NSObject

	static new(): MPSGraphType; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 14.0
 */
declare class MPSGraphVariableOp extends MPSGraphOperation {

	static alloc(): MPSGraphVariableOp; // inherited from NSObject

	static new(): MPSGraphVariableOp; // inherited from NSObject

	readonly shape: NSArray<number>;
}
