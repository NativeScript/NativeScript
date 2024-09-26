
/**
 * @since 14.0
 */
interface MTLAccelerationStructure extends MTLResource {

	/**
	 * @since 16.0
	 */
	gpuResourceID: MTLResourceID;

	size: number;
}
declare var MTLAccelerationStructure: {

	prototype: MTLAccelerationStructure;
};

/**
 * @since 14.0
 */
declare class MTLAccelerationStructureBoundingBoxGeometryDescriptor extends MTLAccelerationStructureGeometryDescriptor {

	static alloc(): MTLAccelerationStructureBoundingBoxGeometryDescriptor; // inherited from NSObject

	static descriptor(): MTLAccelerationStructureBoundingBoxGeometryDescriptor;

	static new(): MTLAccelerationStructureBoundingBoxGeometryDescriptor; // inherited from NSObject

	boundingBoxBuffer: MTLBuffer;

	boundingBoxBufferOffset: number;

	boundingBoxCount: number;

	boundingBoxStride: number;
}

/**
 * @since 14.0
 */
interface MTLAccelerationStructureCommandEncoder extends MTLCommandEncoder {

	buildAccelerationStructureDescriptorScratchBufferScratchBufferOffset(accelerationStructure: MTLAccelerationStructure, descriptor: MTLAccelerationStructureDescriptor, scratchBuffer: MTLBuffer, scratchBufferOffset: number): void;

	copyAccelerationStructureToAccelerationStructure(sourceAccelerationStructure: MTLAccelerationStructure, destinationAccelerationStructure: MTLAccelerationStructure): void;

	copyAndCompactAccelerationStructureToAccelerationStructure(sourceAccelerationStructure: MTLAccelerationStructure, destinationAccelerationStructure: MTLAccelerationStructure): void;

	refitAccelerationStructureDescriptorDestinationScratchBufferScratchBufferOffset(sourceAccelerationStructure: MTLAccelerationStructure, descriptor: MTLAccelerationStructureDescriptor, destinationAccelerationStructure: MTLAccelerationStructure, scratchBuffer: MTLBuffer, scratchBufferOffset: number): void;

	/**
	 * @since 16.0
	 */
	refitAccelerationStructureDescriptorDestinationScratchBufferScratchBufferOffsetOptions(sourceAccelerationStructure: MTLAccelerationStructure, descriptor: MTLAccelerationStructureDescriptor, destinationAccelerationStructure: MTLAccelerationStructure, scratchBuffer: MTLBuffer, scratchBufferOffset: number, options: MTLAccelerationStructureRefitOptions): void;

	/**
	 * @since 14.0
	 */
	sampleCountersInBufferAtSampleIndexWithBarrier(sampleBuffer: MTLCounterSampleBuffer, sampleIndex: number, barrier: boolean): void;

	updateFence(fence: MTLFence): void;

	useHeap(heap: MTLHeap): void;

	useHeapsCount(heaps: interop.Reference<MTLHeap>, count: number): void;

	useResourceUsage(resource: MTLResource, usage: MTLResourceUsage): void;

	useResourcesCountUsage(resources: interop.Reference<MTLResource>, count: number, usage: MTLResourceUsage): void;

	waitForFence(fence: MTLFence): void;

	writeCompactedAccelerationStructureSizeToBufferOffset(accelerationStructure: MTLAccelerationStructure, buffer: MTLBuffer, offset: number): void;

	/**
	 * @since 15.0
	 */
	writeCompactedAccelerationStructureSizeToBufferOffsetSizeDataType(accelerationStructure: MTLAccelerationStructure, buffer: MTLBuffer, offset: number, sizeDataType: MTLDataType): void;
}
declare var MTLAccelerationStructureCommandEncoder: {

	prototype: MTLAccelerationStructureCommandEncoder;
};

/**
 * @since 17.0
 */
declare class MTLAccelerationStructureCurveGeometryDescriptor extends MTLAccelerationStructureGeometryDescriptor {

	static alloc(): MTLAccelerationStructureCurveGeometryDescriptor; // inherited from NSObject

	static descriptor(): MTLAccelerationStructureCurveGeometryDescriptor;

	static new(): MTLAccelerationStructureCurveGeometryDescriptor; // inherited from NSObject

	controlPointBuffer: MTLBuffer;

	controlPointBufferOffset: number;

	controlPointCount: number;

	controlPointFormat: MTLAttributeFormat;

	controlPointStride: number;

	curveBasis: MTLCurveBasis;

	curveEndCaps: MTLCurveEndCaps;

	curveType: MTLCurveType;

	indexBuffer: MTLBuffer;

	indexBufferOffset: number;

	indexType: MTLIndexType;

	radiusBuffer: MTLBuffer;

	radiusBufferOffset: number;

	radiusFormat: MTLAttributeFormat;

	radiusStride: number;

	segmentControlPointCount: number;

	segmentCount: number;
}

/**
 * @since 14.0
 */
declare class MTLAccelerationStructureDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLAccelerationStructureDescriptor; // inherited from NSObject

	static new(): MTLAccelerationStructureDescriptor; // inherited from NSObject

	usage: MTLAccelerationStructureUsage;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class MTLAccelerationStructureGeometryDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLAccelerationStructureGeometryDescriptor; // inherited from NSObject

	static new(): MTLAccelerationStructureGeometryDescriptor; // inherited from NSObject

	allowDuplicateIntersectionFunctionInvocation: boolean;

	intersectionFunctionTableOffset: number;

	/**
	 * @since 15.0
	 */
	label: string;

	opaque: boolean;

	/**
	 * @since 16.0
	 */
	primitiveDataBuffer: MTLBuffer;

	/**
	 * @since 16.0
	 */
	primitiveDataBufferOffset: number;

	/**
	 * @since 16.0
	 */
	primitiveDataElementSize: number;

	/**
	 * @since 16.0
	 */
	primitiveDataStride: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 15.0
 */
declare const enum MTLAccelerationStructureInstanceDescriptorType {

	Default = 0,

	UserID = 1,

	Motion = 2,

	Indirect = 3,

	IndirectMotion = 4
}

/**
 * @since 14.0
 */
declare const enum MTLAccelerationStructureInstanceOptions {

	None = 0,

	DisableTriangleCulling = 1,

	TriangleFrontFacingWindingCounterClockwise = 2,

	Opaque = 4,

	NonOpaque = 8
}

/**
 * @since 15.0
 */
declare class MTLAccelerationStructureMotionBoundingBoxGeometryDescriptor extends MTLAccelerationStructureGeometryDescriptor {

	static alloc(): MTLAccelerationStructureMotionBoundingBoxGeometryDescriptor; // inherited from NSObject

	static descriptor(): MTLAccelerationStructureMotionBoundingBoxGeometryDescriptor;

	static new(): MTLAccelerationStructureMotionBoundingBoxGeometryDescriptor; // inherited from NSObject

	boundingBoxBuffers: NSArray<MTLMotionKeyframeData>;

	boundingBoxCount: number;

	boundingBoxStride: number;
}

/**
 * @since 17.0
 */
declare class MTLAccelerationStructureMotionCurveGeometryDescriptor extends MTLAccelerationStructureGeometryDescriptor {

	static alloc(): MTLAccelerationStructureMotionCurveGeometryDescriptor; // inherited from NSObject

	static descriptor(): MTLAccelerationStructureMotionCurveGeometryDescriptor;

	static new(): MTLAccelerationStructureMotionCurveGeometryDescriptor; // inherited from NSObject

	controlPointBuffers: NSArray<MTLMotionKeyframeData>;

	controlPointCount: number;

	controlPointFormat: MTLAttributeFormat;

	controlPointStride: number;

	curveBasis: MTLCurveBasis;

	curveEndCaps: MTLCurveEndCaps;

	curveType: MTLCurveType;

	indexBuffer: MTLBuffer;

	indexBufferOffset: number;

	indexType: MTLIndexType;

	radiusBuffers: NSArray<MTLMotionKeyframeData>;

	radiusFormat: MTLAttributeFormat;

	radiusStride: number;

	segmentControlPointCount: number;

	segmentCount: number;
}

interface MTLAccelerationStructureMotionInstanceDescriptor {
	options: MTLAccelerationStructureInstanceOptions;
	mask: number;
	intersectionFunctionTableOffset: number;
	accelerationStructureIndex: number;
	userID: number;
	motionTransformsStartIndex: number;
	motionTransformsCount: number;
	motionStartBorderMode: MTLMotionBorderMode;
	motionEndBorderMode: MTLMotionBorderMode;
	motionStartTime: number;
	motionEndTime: number;
}
declare var MTLAccelerationStructureMotionInstanceDescriptor: interop.StructType<MTLAccelerationStructureMotionInstanceDescriptor>;

/**
 * @since 15.0
 */
declare class MTLAccelerationStructureMotionTriangleGeometryDescriptor extends MTLAccelerationStructureGeometryDescriptor {

	static alloc(): MTLAccelerationStructureMotionTriangleGeometryDescriptor; // inherited from NSObject

	static descriptor(): MTLAccelerationStructureMotionTriangleGeometryDescriptor;

	static new(): MTLAccelerationStructureMotionTriangleGeometryDescriptor; // inherited from NSObject

	indexBuffer: MTLBuffer;

	indexBufferOffset: number;

	indexType: MTLIndexType;

	/**
	 * @since 16.0
	 */
	transformationMatrixBuffer: MTLBuffer;

	/**
	 * @since 16.0
	 */
	transformationMatrixBufferOffset: number;

	/**
	 * @since 18.0
	 */
	transformationMatrixLayout: MTLMatrixLayout;

	triangleCount: number;

	vertexBuffers: NSArray<MTLMotionKeyframeData>;

	/**
	 * @since 16.0
	 */
	vertexFormat: MTLAttributeFormat;

	vertexStride: number;
}

/**
 * @since 16.0
 */
declare class MTLAccelerationStructurePassDescriptor extends NSObject implements NSCopying {

	static accelerationStructurePassDescriptor(): MTLAccelerationStructurePassDescriptor;

	static alloc(): MTLAccelerationStructurePassDescriptor; // inherited from NSObject

	static new(): MTLAccelerationStructurePassDescriptor; // inherited from NSObject

	readonly sampleBufferAttachments: MTLAccelerationStructurePassSampleBufferAttachmentDescriptorArray;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 16.0
 */
declare class MTLAccelerationStructurePassSampleBufferAttachmentDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLAccelerationStructurePassSampleBufferAttachmentDescriptor; // inherited from NSObject

	static new(): MTLAccelerationStructurePassSampleBufferAttachmentDescriptor; // inherited from NSObject

	endOfEncoderSampleIndex: number;

	sampleBuffer: MTLCounterSampleBuffer;

	startOfEncoderSampleIndex: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 16.0
 */
declare class MTLAccelerationStructurePassSampleBufferAttachmentDescriptorArray extends NSObject {

	static alloc(): MTLAccelerationStructurePassSampleBufferAttachmentDescriptorArray; // inherited from NSObject

	static new(): MTLAccelerationStructurePassSampleBufferAttachmentDescriptorArray; // inherited from NSObject
	[index: number]: MTLAccelerationStructurePassSampleBufferAttachmentDescriptor;

	objectAtIndexedSubscript(attachmentIndex: number): MTLAccelerationStructurePassSampleBufferAttachmentDescriptor;

	setObjectAtIndexedSubscript(attachment: MTLAccelerationStructurePassSampleBufferAttachmentDescriptor, attachmentIndex: number): void;
}

/**
 * @since 16.0
 */
declare const enum MTLAccelerationStructureRefitOptions {

	VertexData = 1,

	PerPrimitiveData = 2
}

interface MTLAccelerationStructureSizes {
	accelerationStructureSize: number;
	buildScratchBufferSize: number;
	refitScratchBufferSize: number;
}
declare var MTLAccelerationStructureSizes: interop.StructType<MTLAccelerationStructureSizes>;

/**
 * @since 14.0
 */
declare class MTLAccelerationStructureTriangleGeometryDescriptor extends MTLAccelerationStructureGeometryDescriptor {

	static alloc(): MTLAccelerationStructureTriangleGeometryDescriptor; // inherited from NSObject

	static descriptor(): MTLAccelerationStructureTriangleGeometryDescriptor;

	static new(): MTLAccelerationStructureTriangleGeometryDescriptor; // inherited from NSObject

	indexBuffer: MTLBuffer;

	indexBufferOffset: number;

	indexType: MTLIndexType;

	/**
	 * @since 16.0
	 */
	transformationMatrixBuffer: MTLBuffer;

	/**
	 * @since 16.0
	 */
	transformationMatrixBufferOffset: number;

	/**
	 * @since 18.0
	 */
	transformationMatrixLayout: MTLMatrixLayout;

	triangleCount: number;

	vertexBuffer: MTLBuffer;

	vertexBufferOffset: number;

	/**
	 * @since 16.0
	 */
	vertexFormat: MTLAttributeFormat;

	vertexStride: number;
}

/**
 * @since 14.0
 */
declare const enum MTLAccelerationStructureUsage {

	None = 0,

	Refit = 1,

	PreferFastBuild = 2,

	ExtendedLimits = 4
}

/**
 * @since 18.0
 */
interface MTLAllocation extends NSObjectProtocol {

	/**
	 * @since 18.0
	 */
	allocatedSize: number;
}
declare var MTLAllocation: {

	prototype: MTLAllocation;
};

/**
 * @since 17.0
 */
declare class MTLArchitecture extends NSObject implements NSCopying {

	static alloc(): MTLArchitecture; // inherited from NSObject

	static new(): MTLArchitecture; // inherited from NSObject

	readonly name: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 * @deprecated 16.0
 */
declare class MTLArgument extends NSObject {

	static alloc(): MTLArgument; // inherited from NSObject

	static new(): MTLArgument; // inherited from NSObject

	readonly access: MTLBindingAccess;

	readonly active: boolean;

	/**
	 * @since 10.0
	 */
	readonly arrayLength: number;

	readonly bufferAlignment: number;

	readonly bufferDataSize: number;

	readonly bufferDataType: MTLDataType;

	/**
	 * @since 11.0
	 */
	readonly bufferPointerType: MTLPointerType;

	readonly bufferStructType: MTLStructType;

	readonly index: number;

	/**
	 * @since 10.0
	 */
	readonly isDepthTexture: boolean;

	readonly name: string;

	readonly textureDataType: MTLDataType;

	readonly textureType: MTLTextureType;

	readonly threadgroupMemoryAlignment: number;

	readonly threadgroupMemoryDataSize: number;

	readonly type: MTLArgumentType;
}

/**
 * @since 11.0
 */
declare const enum MTLArgumentBuffersTier {

	Tier1 = 0,

	Tier2 = 1
}

/**
 * @since 11.0
 */
declare class MTLArgumentDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLArgumentDescriptor; // inherited from NSObject

	static argumentDescriptor(): MTLArgumentDescriptor;

	static new(): MTLArgumentDescriptor; // inherited from NSObject

	access: MTLBindingAccess;

	arrayLength: number;

	constantBlockAlignment: number;

	dataType: MTLDataType;

	index: number;

	textureType: MTLTextureType;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
interface MTLArgumentEncoder extends NSObjectProtocol {

	alignment: number;

	device: MTLDevice;

	encodedLength: number;

	label: string;

	constantDataAtIndex(index: number): interop.Pointer | interop.Reference<any>;

	/**
	 * @since 11.0
	 */
	newArgumentEncoderForBufferAtIndex(index: number): MTLArgumentEncoder;

	/**
	 * @since 14.0
	 */
	setAccelerationStructureAtIndex(accelerationStructure: MTLAccelerationStructure, index: number): void;

	setArgumentBufferOffset(argumentBuffer: MTLBuffer, offset: number): void;

	setArgumentBufferStartOffsetArrayElement(argumentBuffer: MTLBuffer, startOffset: number, arrayElement: number): void;

	setBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	setBuffersOffsetsWithRange(buffers: interop.Reference<MTLBuffer>, offsets: interop.Reference<number>, range: NSRange): void;

	/**
	 * @since 13.0
	 */
	setComputePipelineStateAtIndex(pipeline: MTLComputePipelineState, index: number): void;

	/**
	 * @since 13.0
	 */
	setComputePipelineStatesWithRange(pipelines: interop.Reference<MTLComputePipelineState>, range: NSRange): void;

	/**
	 * @since 12.0
	 */
	setIndirectCommandBufferAtIndex(indirectCommandBuffer: MTLIndirectCommandBuffer, index: number): void;

	/**
	 * @since 12.0
	 */
	setIndirectCommandBuffersWithRange(buffers: interop.Reference<MTLIndirectCommandBuffer>, range: NSRange): void;

	/**
	 * @since 14.0
	 */
	setIntersectionFunctionTableAtIndex(intersectionFunctionTable: MTLIntersectionFunctionTable, index: number): void;

	/**
	 * @since 14.0
	 */
	setIntersectionFunctionTablesWithRange(intersectionFunctionTables: interop.Reference<MTLIntersectionFunctionTable>, range: NSRange): void;

	/**
	 * @since 13.0
	 */
	setRenderPipelineStateAtIndex(pipeline: MTLRenderPipelineState, index: number): void;

	/**
	 * @since 13.0
	 */
	setRenderPipelineStatesWithRange(pipelines: interop.Reference<MTLRenderPipelineState>, range: NSRange): void;

	setSamplerStateAtIndex(sampler: MTLSamplerState, index: number): void;

	setSamplerStatesWithRange(samplers: interop.Reference<MTLSamplerState>, range: NSRange): void;

	setTextureAtIndex(texture: MTLTexture, index: number): void;

	setTexturesWithRange(textures: interop.Reference<MTLTexture>, range: NSRange): void;

	/**
	 * @since 14.0
	 */
	setVisibleFunctionTableAtIndex(visibleFunctionTable: MTLVisibleFunctionTable, index: number): void;

	/**
	 * @since 14.0
	 */
	setVisibleFunctionTablesWithRange(visibleFunctionTables: interop.Reference<MTLVisibleFunctionTable>, range: NSRange): void;
}
declare var MTLArgumentEncoder: {

	prototype: MTLArgumentEncoder;
};

/**
 * @since 8.0
 * @deprecated 16.0
 */
declare const enum MTLArgumentType {

	Buffer = 0,

	ThreadgroupMemory = 1,

	Texture = 2,

	Sampler = 3,

	ImageblockData = 16,

	Imageblock = 17,

	VisibleFunctionTable = 24,

	PrimitiveAccelerationStructure = 25,

	InstanceAccelerationStructure = 26,

	IntersectionFunctionTable = 27
}

/**
 * @since 8.0
 */
declare class MTLArrayType extends MTLType {

	static alloc(): MTLArrayType; // inherited from NSObject

	static new(): MTLArrayType; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly argumentIndexStride: number;

	readonly arrayLength: number;

	readonly elementType: MTLDataType;

	readonly stride: number;

	elementArrayType(): MTLArrayType;

	/**
	 * @since 11.0
	 */
	elementPointerType(): MTLPointerType;

	elementStructType(): MTLStructType;

	/**
	 * @since 11.0
	 */
	elementTextureReferenceType(): MTLTextureReferenceType;
}

/**
 * @since 10.0
 */
declare class MTLAttribute extends NSObject {

	static alloc(): MTLAttribute; // inherited from NSObject

	static new(): MTLAttribute; // inherited from NSObject

	readonly active: boolean;

	readonly attributeIndex: number;

	readonly attributeType: MTLDataType;

	readonly name: string;

	/**
	 * @since 10.0
	 */
	readonly patchControlPointData: boolean;

	/**
	 * @since 10.0
	 */
	readonly patchData: boolean;
}

/**
 * @since 10.0
 */
declare class MTLAttributeDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLAttributeDescriptor; // inherited from NSObject

	static new(): MTLAttributeDescriptor; // inherited from NSObject

	bufferIndex: number;

	format: MTLAttributeFormat;

	offset: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 10.0
 */
declare class MTLAttributeDescriptorArray extends NSObject {

	static alloc(): MTLAttributeDescriptorArray; // inherited from NSObject

	static new(): MTLAttributeDescriptorArray; // inherited from NSObject
	[index: number]: MTLAttributeDescriptor;

	objectAtIndexedSubscript(index: number): MTLAttributeDescriptor;

	setObjectAtIndexedSubscript(attributeDesc: MTLAttributeDescriptor, index: number): void;
}

/**
 * @since 10.0
 */
declare const enum MTLAttributeFormat {

	Invalid = 0,

	UChar2 = 1,

	UChar3 = 2,

	UChar4 = 3,

	Char2 = 4,

	Char3 = 5,

	Char4 = 6,

	UChar2Normalized = 7,

	UChar3Normalized = 8,

	UChar4Normalized = 9,

	Char2Normalized = 10,

	Char3Normalized = 11,

	Char4Normalized = 12,

	UShort2 = 13,

	UShort3 = 14,

	UShort4 = 15,

	Short2 = 16,

	Short3 = 17,

	Short4 = 18,

	UShort2Normalized = 19,

	UShort3Normalized = 20,

	UShort4Normalized = 21,

	Short2Normalized = 22,

	Short3Normalized = 23,

	Short4Normalized = 24,

	Half2 = 25,

	Half3 = 26,

	Half4 = 27,

	Float = 28,

	Float2 = 29,

	Float3 = 30,

	Float4 = 31,

	Int = 32,

	Int2 = 33,

	Int3 = 34,

	Int4 = 35,

	UInt = 36,

	UInt2 = 37,

	UInt3 = 38,

	UInt4 = 39,

	Int1010102Normalized = 40,

	UInt1010102Normalized = 41,

	UChar4Normalized_BGRA = 42,

	UChar = 45,

	Char = 46,

	UCharNormalized = 47,

	CharNormalized = 48,

	UShort = 49,

	Short = 50,

	UShortNormalized = 51,

	ShortNormalized = 52,

	Half = 53,

	FloatRG11B10 = 54,

	FloatRGB9E5 = 55
}

/**
 * @since 17.0
 */
declare var MTLAttributeStrideStatic: number;

/**
 * @since 12.0
 */
declare const enum MTLBarrierScope {

	Buffers = 1,

	Textures = 2,

	RenderTargets = 4
}

/**
 * @since 14.0
 */
interface MTLBinaryArchive extends NSObjectProtocol {

	device: MTLDevice;

	label: string;

	addComputePipelineFunctionsWithDescriptorError(descriptor: MTLComputePipelineDescriptor): boolean;

	/**
	 * @since 15.0
	 */
	addFunctionWithDescriptorLibraryError(descriptor: MTLFunctionDescriptor, library: MTLLibrary): boolean;

	/**
	 * @since 18.0
	 */
	addLibraryWithDescriptorError(descriptor: MTLStitchedLibraryDescriptor): boolean;

	/**
	 * @since 18.0
	 */
	addMeshRenderPipelineFunctionsWithDescriptorError(descriptor: MTLMeshRenderPipelineDescriptor): boolean;

	addRenderPipelineFunctionsWithDescriptorError(descriptor: MTLRenderPipelineDescriptor): boolean;

	addTileRenderPipelineFunctionsWithDescriptorError(descriptor: MTLTileRenderPipelineDescriptor): boolean;

	serializeToURLError(url: NSURL): boolean;
}
declare var MTLBinaryArchive: {

	prototype: MTLBinaryArchive;
};

/**
 * @since 14.0
 */
declare class MTLBinaryArchiveDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLBinaryArchiveDescriptor; // inherited from NSObject

	static new(): MTLBinaryArchiveDescriptor; // inherited from NSObject

	url: NSURL;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare var MTLBinaryArchiveDomain: string;

/**
 * @since 14.0
 */
declare const enum MTLBinaryArchiveError {

	None = 0,

	InvalidFile = 1,

	UnexpectedElement = 2,

	CompilationFailure = 3,

	InternalError = 4
}

/**
 * @since 16.0
 */
interface MTLBinding extends NSObjectProtocol {

	access: MTLBindingAccess;

	argument: boolean;

	index: number;

	name: string;

	type: MTLBindingType;

	used: boolean;
}
declare var MTLBinding: {

	prototype: MTLBinding;
};

declare const enum MTLBindingAccess {

	BindingAccessReadOnly = 0,

	BindingAccessReadWrite = 1,

	BindingAccessWriteOnly = 2,

	ArgumentAccessReadOnly = 0,

	ArgumentAccessReadWrite = 1,

	ArgumentAccessWriteOnly = 2
}

/**
 * @since 14.0
 */
declare const enum MTLBindingType {

	Buffer = 0,

	ThreadgroupMemory = 1,

	Texture = 2,

	Sampler = 3,

	ImageblockData = 16,

	Imageblock = 17,

	VisibleFunctionTable = 24,

	PrimitiveAccelerationStructure = 25,

	InstanceAccelerationStructure = 26,

	IntersectionFunctionTable = 27,

	ObjectPayload = 34
}

/**
 * @since 8.0
 */
declare const enum MTLBlendFactor {

	Zero = 0,

	One = 1,

	SourceColor = 2,

	OneMinusSourceColor = 3,

	SourceAlpha = 4,

	OneMinusSourceAlpha = 5,

	DestinationColor = 6,

	OneMinusDestinationColor = 7,

	DestinationAlpha = 8,

	OneMinusDestinationAlpha = 9,

	SourceAlphaSaturated = 10,

	BlendColor = 11,

	OneMinusBlendColor = 12,

	BlendAlpha = 13,

	OneMinusBlendAlpha = 14,

	Source1Color = 15,

	OneMinusSource1Color = 16,

	Source1Alpha = 17,

	OneMinusSource1Alpha = 18
}

/**
 * @since 8.0
 */
declare const enum MTLBlendOperation {

	Add = 0,

	Subtract = 1,

	ReverseSubtract = 2,

	Min = 3,

	Max = 4
}

/**
 * @since 8.0
 */
interface MTLBlitCommandEncoder extends MTLCommandEncoder {

	copyFromBufferSourceOffsetSourceBytesPerRowSourceBytesPerImageSourceSizeToTextureDestinationSliceDestinationLevelDestinationOrigin(sourceBuffer: MTLBuffer, sourceOffset: number, sourceBytesPerRow: number, sourceBytesPerImage: number, sourceSize: MTLSize, destinationTexture: MTLTexture, destinationSlice: number, destinationLevel: number, destinationOrigin: MTLOrigin): void;

	/**
	 * @since 9.0
	 */
	copyFromBufferSourceOffsetSourceBytesPerRowSourceBytesPerImageSourceSizeToTextureDestinationSliceDestinationLevelDestinationOriginOptions(sourceBuffer: MTLBuffer, sourceOffset: number, sourceBytesPerRow: number, sourceBytesPerImage: number, sourceSize: MTLSize, destinationTexture: MTLTexture, destinationSlice: number, destinationLevel: number, destinationOrigin: MTLOrigin, options: MTLBlitOption): void;

	copyFromBufferSourceOffsetToBufferDestinationOffsetSize(sourceBuffer: MTLBuffer, sourceOffset: number, destinationBuffer: MTLBuffer, destinationOffset: number, size: number): void;

	copyFromTextureSourceSliceSourceLevelSourceOriginSourceSizeToBufferDestinationOffsetDestinationBytesPerRowDestinationBytesPerImage(sourceTexture: MTLTexture, sourceSlice: number, sourceLevel: number, sourceOrigin: MTLOrigin, sourceSize: MTLSize, destinationBuffer: MTLBuffer, destinationOffset: number, destinationBytesPerRow: number, destinationBytesPerImage: number): void;

	/**
	 * @since 9.0
	 */
	copyFromTextureSourceSliceSourceLevelSourceOriginSourceSizeToBufferDestinationOffsetDestinationBytesPerRowDestinationBytesPerImageOptions(sourceTexture: MTLTexture, sourceSlice: number, sourceLevel: number, sourceOrigin: MTLOrigin, sourceSize: MTLSize, destinationBuffer: MTLBuffer, destinationOffset: number, destinationBytesPerRow: number, destinationBytesPerImage: number, options: MTLBlitOption): void;

	copyFromTextureSourceSliceSourceLevelSourceOriginSourceSizeToTextureDestinationSliceDestinationLevelDestinationOrigin(sourceTexture: MTLTexture, sourceSlice: number, sourceLevel: number, sourceOrigin: MTLOrigin, sourceSize: MTLSize, destinationTexture: MTLTexture, destinationSlice: number, destinationLevel: number, destinationOrigin: MTLOrigin): void;

	/**
	 * @since 13.0
	 */
	copyFromTextureSourceSliceSourceLevelToTextureDestinationSliceDestinationLevelSliceCountLevelCount(sourceTexture: MTLTexture, sourceSlice: number, sourceLevel: number, destinationTexture: MTLTexture, destinationSlice: number, destinationLevel: number, sliceCount: number, levelCount: number): void;

	/**
	 * @since 13.0
	 */
	copyFromTextureToTexture(sourceTexture: MTLTexture, destinationTexture: MTLTexture): void;

	/**
	 * @since 12.0
	 */
	copyIndirectCommandBufferSourceRangeDestinationDestinationIndex(source: MTLIndirectCommandBuffer, sourceRange: NSRange, destination: MTLIndirectCommandBuffer, destinationIndex: number): void;

	fillBufferRangeValue(buffer: MTLBuffer, range: NSRange, value: number): void;

	generateMipmapsForTexture(texture: MTLTexture): void;

	/**
	 * @since 13.0
	 */
	getTextureAccessCountersRegionMipLevelSliceResetCountersCountersBufferCountersBufferOffset(texture: MTLTexture, region: MTLRegion, mipLevel: number, slice: number, resetCounters: boolean, countersBuffer: MTLBuffer, countersBufferOffset: number): void;

	/**
	 * @since 12.0
	 */
	optimizeContentsForCPUAccess(texture: MTLTexture): void;

	/**
	 * @since 12.0
	 */
	optimizeContentsForCPUAccessSliceLevel(texture: MTLTexture, slice: number, level: number): void;

	/**
	 * @since 12.0
	 */
	optimizeContentsForGPUAccess(texture: MTLTexture): void;

	/**
	 * @since 12.0
	 */
	optimizeContentsForGPUAccessSliceLevel(texture: MTLTexture, slice: number, level: number): void;

	/**
	 * @since 12.0
	 */
	optimizeIndirectCommandBufferWithRange(indirectCommandBuffer: MTLIndirectCommandBuffer, range: NSRange): void;

	/**
	 * @since 12.0
	 */
	resetCommandsInBufferWithRange(buffer: MTLIndirectCommandBuffer, range: NSRange): void;

	/**
	 * @since 13.0
	 */
	resetTextureAccessCountersRegionMipLevelSlice(texture: MTLTexture, region: MTLRegion, mipLevel: number, slice: number): void;

	/**
	 * @since 14.0
	 */
	resolveCountersInRangeDestinationBufferDestinationOffset(sampleBuffer: MTLCounterSampleBuffer, range: NSRange, destinationBuffer: MTLBuffer, destinationOffset: number): void;

	/**
	 * @since 14.0
	 */
	sampleCountersInBufferAtSampleIndexWithBarrier(sampleBuffer: MTLCounterSampleBuffer, sampleIndex: number, barrier: boolean): void;

	/**
	 * @since 10.0
	 */
	updateFence(fence: MTLFence): void;

	/**
	 * @since 10.0
	 */
	waitForFence(fence: MTLFence): void;
}
declare var MTLBlitCommandEncoder: {

	prototype: MTLBlitCommandEncoder;
};

/**
 * @since 9.0
 */
declare const enum MTLBlitOption {

	None = 0,

	DepthFromDepthStencil = 1,

	StencilFromDepthStencil = 2,

	RowLinearPVRTC = 4
}

/**
 * @since 14.0
 */
declare class MTLBlitPassDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLBlitPassDescriptor; // inherited from NSObject

	static blitPassDescriptor(): MTLBlitPassDescriptor;

	static new(): MTLBlitPassDescriptor; // inherited from NSObject

	readonly sampleBufferAttachments: MTLBlitPassSampleBufferAttachmentDescriptorArray;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class MTLBlitPassSampleBufferAttachmentDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLBlitPassSampleBufferAttachmentDescriptor; // inherited from NSObject

	static new(): MTLBlitPassSampleBufferAttachmentDescriptor; // inherited from NSObject

	endOfEncoderSampleIndex: number;

	sampleBuffer: MTLCounterSampleBuffer;

	startOfEncoderSampleIndex: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class MTLBlitPassSampleBufferAttachmentDescriptorArray extends NSObject {

	static alloc(): MTLBlitPassSampleBufferAttachmentDescriptorArray; // inherited from NSObject

	static new(): MTLBlitPassSampleBufferAttachmentDescriptorArray; // inherited from NSObject
	[index: number]: MTLBlitPassSampleBufferAttachmentDescriptor;

	objectAtIndexedSubscript(attachmentIndex: number): MTLBlitPassSampleBufferAttachmentDescriptor;

	setObjectAtIndexedSubscript(attachment: MTLBlitPassSampleBufferAttachmentDescriptor, attachmentIndex: number): void;
}

/**
 * @since 8.0
 */
interface MTLBuffer extends MTLResource {

	/**
	 * @since 16.0
	 */
	gpuAddress: number;

	length: number;

	/**
	 * @since 10.0
	 */
	addDebugMarkerRange(marker: string, range: NSRange): void;

	contents(): interop.Pointer | interop.Reference<any>;

	/**
	 * @since 8.0
	 */
	newTextureWithDescriptorOffsetBytesPerRow(descriptor: MTLTextureDescriptor, offset: number, bytesPerRow: number): MTLTexture;

	/**
	 * @since 10.0
	 */
	removeAllDebugMarkers(): void;
}
declare var MTLBuffer: {

	prototype: MTLBuffer;
};

/**
 * @since 16.0
 */
interface MTLBufferBinding extends MTLBinding {

	bufferAlignment: number;

	bufferDataSize: number;

	bufferDataType: MTLDataType;

	bufferPointerType: MTLPointerType;

	bufferStructType: MTLStructType;
}
declare var MTLBufferBinding: {

	prototype: MTLBufferBinding;
};

/**
 * @since 10.0
 */
declare class MTLBufferLayoutDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLBufferLayoutDescriptor; // inherited from NSObject

	static new(): MTLBufferLayoutDescriptor; // inherited from NSObject

	stepFunction: MTLStepFunction;

	stepRate: number;

	stride: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 10.0
 */
declare class MTLBufferLayoutDescriptorArray extends NSObject {

	static alloc(): MTLBufferLayoutDescriptorArray; // inherited from NSObject

	static new(): MTLBufferLayoutDescriptorArray; // inherited from NSObject
	[index: number]: MTLBufferLayoutDescriptor;

	objectAtIndexedSubscript(index: number): MTLBufferLayoutDescriptor;

	setObjectAtIndexedSubscript(bufferDesc: MTLBufferLayoutDescriptor, index: number): void;
}

/**
 * @since 17.0
 */
declare var MTLBufferLayoutStrideDynamic: number;

/**
 * @since 8.0
 */
declare const enum MTLCPUCacheMode {

	DefaultCache = 0,

	WriteCombined = 1
}

/**
 * @since 13.0
 */
declare class MTLCaptureDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLCaptureDescriptor; // inherited from NSObject

	static new(): MTLCaptureDescriptor; // inherited from NSObject

	captureObject: any;

	destination: MTLCaptureDestination;

	outputURL: NSURL;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare const enum MTLCaptureDestination {

	DeveloperTools = 1,

	GPUTraceDocument = 2
}

/**
 * @since 13.0
 */
declare const enum MTLCaptureError {

	NotSupported = 1,

	AlreadyCapturing = 2,

	InvalidDescriptor = 3
}

/**
 * @since 13.0
 */
declare var MTLCaptureErrorDomain: string;

/**
 * @since 11.0
 */
declare class MTLCaptureManager extends NSObject {

	static alloc(): MTLCaptureManager; // inherited from NSObject

	static new(): MTLCaptureManager; // inherited from NSObject

	static sharedCaptureManager(): MTLCaptureManager;

	defaultCaptureScope: MTLCaptureScope;

	readonly isCapturing: boolean;

	newCaptureScopeWithCommandQueue(commandQueue: MTLCommandQueue): MTLCaptureScope;

	newCaptureScopeWithDevice(device: MTLDevice): MTLCaptureScope;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	startCaptureWithCommandQueue(commandQueue: MTLCommandQueue): void;

	/**
	 * @since 13.0
	 */
	startCaptureWithDescriptorError(descriptor: MTLCaptureDescriptor): boolean;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	startCaptureWithDevice(device: MTLDevice): void;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	startCaptureWithScope(captureScope: MTLCaptureScope): void;

	stopCapture(): void;

	/**
	 * @since 13.0
	 */
	supportsDestination(destination: MTLCaptureDestination): boolean;
}

/**
 * @since 11.0
 */
interface MTLCaptureScope extends NSObjectProtocol {

	commandQueue: MTLCommandQueue;

	device: MTLDevice;

	label: string;

	beginScope(): void;

	endScope(): void;
}
declare var MTLCaptureScope: {

	prototype: MTLCaptureScope;
};

interface MTLClearColor {
	red: number;
	green: number;
	blue: number;
	alpha: number;
}
declare var MTLClearColor: interop.StructType<MTLClearColor>;

declare function MTLClearColorMake(red: number, green: number, blue: number, alpha: number): MTLClearColor;

/**
 * @since 8.0
 */
declare const enum MTLColorWriteMask {

	None = 0,

	Red = 8,

	Green = 4,

	Blue = 2,

	Alpha = 1,

	All = 15
}

/**
 * @since 8.0
 */
interface MTLCommandBuffer extends NSObjectProtocol {

	/**
	 * @since 10.3
	 */
	GPUEndTime: number;

	/**
	 * @since 10.3
	 */
	GPUStartTime: number;

	commandQueue: MTLCommandQueue;

	device: MTLDevice;

	error: NSError;

	/**
	 * @since 14.0
	 */
	errorOptions: MTLCommandBufferErrorOption;

	/**
	 * @since 10.3
	 */
	kernelEndTime: number;

	/**
	 * @since 10.3
	 */
	kernelStartTime: number;

	label: string;

	/**
	 * @since 14.0
	 */
	logs: MTLLogContainer;

	retainedReferences: boolean;

	status: MTLCommandBufferStatus;

	/**
	 * @since 14.0
	 */
	accelerationStructureCommandEncoder(): MTLAccelerationStructureCommandEncoder;

	/**
	 * @since 16.0
	 */
	accelerationStructureCommandEncoderWithDescriptor(descriptor: MTLAccelerationStructurePassDescriptor): MTLAccelerationStructureCommandEncoder;

	addCompletedHandler(block: (p1: MTLCommandBuffer) => void): void;

	addScheduledHandler(block: (p1: MTLCommandBuffer) => void): void;

	blitCommandEncoder(): MTLBlitCommandEncoder;

	/**
	 * @since 14.0
	 */
	blitCommandEncoderWithDescriptor(blitPassDescriptor: MTLBlitPassDescriptor): MTLBlitCommandEncoder;

	commit(): void;

	computeCommandEncoder(): MTLComputeCommandEncoder;

	/**
	 * @since 14.0
	 */
	computeCommandEncoderWithDescriptor(computePassDescriptor: MTLComputePassDescriptor): MTLComputeCommandEncoder;

	/**
	 * @since 12.0
	 */
	computeCommandEncoderWithDispatchType(dispatchType: MTLDispatchType): MTLComputeCommandEncoder;

	/**
	 * @since 12.0
	 */
	encodeSignalEventValue(event: MTLEvent, value: number): void;

	/**
	 * @since 12.0
	 */
	encodeWaitForEventValue(event: MTLEvent, value: number): void;

	enqueue(): void;

	parallelRenderCommandEncoderWithDescriptor(renderPassDescriptor: MTLRenderPassDescriptor): MTLParallelRenderCommandEncoder;

	/**
	 * @since 11.0
	 */
	popDebugGroup(): void;

	presentDrawable(drawable: MTLDrawable): void;

	presentDrawableAtTime(drawable: MTLDrawable, presentationTime: number): void;

	/**
	 * @since 11.0
	 */
	pushDebugGroup(string: string): void;

	renderCommandEncoderWithDescriptor(renderPassDescriptor: MTLRenderPassDescriptor): MTLRenderCommandEncoder;

	/**
	 * @since 13.0
	 */
	resourceStateCommandEncoder(): MTLResourceStateCommandEncoder;

	/**
	 * @since 14.0
	 */
	resourceStateCommandEncoderWithDescriptor(resourceStatePassDescriptor: MTLResourceStatePassDescriptor): MTLResourceStateCommandEncoder;

	/**
	 * @since 18.0
	 */
	useResidencySet(residencySet: MTLResidencySet): void;

	/**
	 * @since 18.0
	 */
	useResidencySetsCount(residencySets: interop.Reference<MTLResidencySet>, count: number): void;

	waitUntilCompleted(): void;

	waitUntilScheduled(): void;
}
declare var MTLCommandBuffer: {

	prototype: MTLCommandBuffer;
};

/**
 * @since 14.0
 */
declare class MTLCommandBufferDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLCommandBufferDescriptor; // inherited from NSObject

	static new(): MTLCommandBufferDescriptor; // inherited from NSObject

	errorOptions: MTLCommandBufferErrorOption;

	/**
	 * @since 18.0
	 */
	logState: MTLLogState;

	retainedReferences: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
interface MTLCommandBufferEncoderInfo extends NSObjectProtocol {

	debugSignposts: NSArray<string>;

	errorState: MTLCommandEncoderErrorState;

	label: string;
}
declare var MTLCommandBufferEncoderInfo: {

	prototype: MTLCommandBufferEncoderInfo;
};

/**
 * @since 14.0
 */
declare var MTLCommandBufferEncoderInfoErrorKey: string;

/**
 * @since 8.0
 */
declare const enum MTLCommandBufferError {

	None = 0,

	Internal = 1,

	Timeout = 2,

	PageFault = 3,

	Blacklisted = 4,

	AccessRevoked = 4,

	NotPermitted = 7,

	OutOfMemory = 8,

	InvalidResource = 9,

	Memoryless = 10,

	DeviceRemoved = 11,

	StackOverflow = 12
}

/**
 * @since 8.0
 */
declare var MTLCommandBufferErrorDomain: string;

/**
 * @since 14.0
 */
declare const enum MTLCommandBufferErrorOption {

	None = 0,

	EncoderExecutionStatus = 1
}

/**
 * @since 8.0
 */
declare const enum MTLCommandBufferStatus {

	NotEnqueued = 0,

	Enqueued = 1,

	Committed = 2,

	Scheduled = 3,

	Completed = 4,

	Error = 5
}

/**
 * @since 8.0
 */
interface MTLCommandEncoder extends NSObjectProtocol {

	device: MTLDevice;

	label: string;

	endEncoding(): void;

	insertDebugSignpost(string: string): void;

	popDebugGroup(): void;

	pushDebugGroup(string: string): void;
}
declare var MTLCommandEncoder: {

	prototype: MTLCommandEncoder;
};

/**
 * @since 14.0
 */
declare const enum MTLCommandEncoderErrorState {

	Unknown = 0,

	Completed = 1,

	Affected = 2,

	Pending = 3,

	Faulted = 4
}

/**
 * @since 8.0
 */
interface MTLCommandQueue extends NSObjectProtocol {

	device: MTLDevice;

	label: string;

	/**
	 * @since 18.0
	 */
	addResidencySet(residencySet: MTLResidencySet): void;

	/**
	 * @since 18.0
	 */
	addResidencySetsCount(residencySets: interop.Reference<MTLResidencySet>, count: number): void;

	commandBuffer(): MTLCommandBuffer;

	/**
	 * @since 14.0
	 */
	commandBufferWithDescriptor(descriptor: MTLCommandBufferDescriptor): MTLCommandBuffer;

	commandBufferWithUnretainedReferences(): MTLCommandBuffer;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	insertDebugCaptureBoundary(): void;

	/**
	 * @since 18.0
	 */
	removeResidencySet(residencySet: MTLResidencySet): void;

	/**
	 * @since 18.0
	 */
	removeResidencySetsCount(residencySets: interop.Reference<MTLResidencySet>, count: number): void;
}
declare var MTLCommandQueue: {

	prototype: MTLCommandQueue;
};

/**
 * @since 18.0
 */
declare class MTLCommandQueueDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLCommandQueueDescriptor; // inherited from NSObject

	static new(): MTLCommandQueueDescriptor; // inherited from NSObject

	logState: MTLLogState;

	maxCommandBufferCount: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare var MTLCommonCounterClipperInvocations: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterClipperPrimitivesOut: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterComputeKernelInvocations: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterFragmentCycles: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterFragmentInvocations: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterFragmentsPassed: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterPostTessellationVertexCycles: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterPostTessellationVertexInvocations: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterRenderTargetWriteCycles: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterSetStageUtilization: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterSetStatistic: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterSetTimestamp: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterTessellationCycles: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterTessellationInputPatches: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterTimestamp: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterTotalCycles: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterVertexCycles: string;

/**
 * @since 14.0
 */
declare var MTLCommonCounterVertexInvocations: string;

/**
 * @since 8.0
 */
declare const enum MTLCompareFunction {

	Never = 0,

	Less = 1,

	Equal = 2,

	LessEqual = 3,

	Greater = 4,

	NotEqual = 5,

	GreaterEqual = 6,

	Always = 7
}

/**
 * @since 8.0
 */
declare class MTLCompileOptions extends NSObject implements NSCopying {

	static alloc(): MTLCompileOptions; // inherited from NSObject

	static new(): MTLCompileOptions; // inherited from NSObject

	/**
	 * @since 16.4
	 */
	allowReferencingUndefinedSymbols: boolean;

	/**
	 * @since 16.4
	 */
	compileSymbolVisibility: MTLCompileSymbolVisibility;

	/**
	 * @since 18.0
	 */
	enableLogging: boolean;

	/**
	 * @since 8.0
	 * @deprecated 18.0
	 */
	fastMathEnabled: boolean;

	/**
	 * @since 14.0
	 */
	installName: string;

	/**
	 * @since 9.0
	 */
	languageVersion: MTLLanguageVersion;

	/**
	 * @since 14.0
	 */
	libraries: NSArray<MTLDynamicLibrary>;

	/**
	 * @since 14.0
	 */
	libraryType: MTLLibraryType;

	/**
	 * @since 18.0
	 */
	mathFloatingPointFunctions: MTLMathFloatingPointFunctions;

	/**
	 * @since 18.0
	 */
	mathMode: MTLMathMode;

	/**
	 * @since 16.4
	 */
	maxTotalThreadsPerThreadgroup: number;

	/**
	 * @since 16.0
	 */
	optimizationLevel: MTLLibraryOptimizationLevel;

	preprocessorMacros: NSDictionary<string, NSObject>;

	/**
	 * @since 14.0
	 */
	preserveInvariance: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 16.4
 */
declare const enum MTLCompileSymbolVisibility {

	Default = 0,

	Hidden = 1
}

/**
 * @since 8.0
 */
interface MTLComputeCommandEncoder extends MTLCommandEncoder {

	/**
	 * @since 12.0
	 */
	dispatchType: MTLDispatchType;

	dispatchThreadgroupsThreadsPerThreadgroup(threadgroupsPerGrid: MTLSize, threadsPerThreadgroup: MTLSize): void;

	/**
	 * @since 9.0
	 */
	dispatchThreadgroupsWithIndirectBufferIndirectBufferOffsetThreadsPerThreadgroup(indirectBuffer: MTLBuffer, indirectBufferOffset: number, threadsPerThreadgroup: MTLSize): void;

	/**
	 * @since 11.0
	 */
	dispatchThreadsThreadsPerThreadgroup(threadsPerGrid: MTLSize, threadsPerThreadgroup: MTLSize): void;

	/**
	 * @since 13.0
	 */
	executeCommandsInBufferIndirectBufferIndirectBufferOffset(indirectCommandbuffer: MTLIndirectCommandBuffer, indirectRangeBuffer: MTLBuffer, indirectBufferOffset: number): void;

	/**
	 * @since 13.0
	 */
	executeCommandsInBufferWithRange(indirectCommandBuffer: MTLIndirectCommandBuffer, executionRange: NSRange): void;

	/**
	 * @since 12.0
	 */
	memoryBarrierWithResourcesCount(resources: interop.Reference<MTLResource>, count: number): void;

	/**
	 * @since 12.0
	 */
	memoryBarrierWithScope(scope: MTLBarrierScope): void;

	/**
	 * @since 14.0
	 */
	sampleCountersInBufferAtSampleIndexWithBarrier(sampleBuffer: MTLCounterSampleBuffer, sampleIndex: number, barrier: boolean): void;

	/**
	 * @since 14.0
	 */
	setAccelerationStructureAtBufferIndex(accelerationStructure: MTLAccelerationStructure, bufferIndex: number): void;

	setBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 8.3
	 */
	setBufferOffsetAtIndex(offset: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setBufferOffsetAttributeStrideAtIndex(buffer: MTLBuffer, offset: number, stride: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setBufferOffsetAttributeStrideAtIndex(offset: number, stride: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setBuffersOffsetsAttributeStridesWithRange(buffers: interop.Reference<MTLBuffer>, offsets: interop.Reference<number>, strides: interop.Reference<number>, range: NSRange): void;

	setBuffersOffsetsWithRange(buffers: interop.Reference<MTLBuffer>, offsets: interop.Reference<number>, range: NSRange): void;

	/**
	 * @since 8.3
	 */
	setBytesLengthAtIndex(bytes: interop.Pointer | interop.Reference<any>, length: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setBytesLengthAttributeStrideAtIndex(bytes: interop.Pointer | interop.Reference<any>, length: number, stride: number, index: number): void;

	setComputePipelineState(state: MTLComputePipelineState): void;

	/**
	 * @since 11.0
	 */
	setImageblockWidthHeight(width: number, height: number): void;

	/**
	 * @since 14.0
	 */
	setIntersectionFunctionTableAtBufferIndex(intersectionFunctionTable: MTLIntersectionFunctionTable, bufferIndex: number): void;

	/**
	 * @since 14.0
	 */
	setIntersectionFunctionTablesWithBufferRange(intersectionFunctionTables: interop.Reference<MTLIntersectionFunctionTable>, range: NSRange): void;

	setSamplerStateAtIndex(sampler: MTLSamplerState, index: number): void;

	setSamplerStateLodMinClampLodMaxClampAtIndex(sampler: MTLSamplerState, lodMinClamp: number, lodMaxClamp: number, index: number): void;

	setSamplerStatesLodMinClampsLodMaxClampsWithRange(samplers: interop.Reference<MTLSamplerState>, lodMinClamps: interop.Reference<number>, lodMaxClamps: interop.Reference<number>, range: NSRange): void;

	setSamplerStatesWithRange(samplers: interop.Reference<MTLSamplerState>, range: NSRange): void;

	/**
	 * @since 10.0
	 */
	setStageInRegion(region: MTLRegion): void;

	/**
	 * @since 12.0
	 */
	setStageInRegionWithIndirectBufferIndirectBufferOffset(indirectBuffer: MTLBuffer, indirectBufferOffset: number): void;

	setTextureAtIndex(texture: MTLTexture, index: number): void;

	setTexturesWithRange(textures: interop.Reference<MTLTexture>, range: NSRange): void;

	setThreadgroupMemoryLengthAtIndex(length: number, index: number): void;

	/**
	 * @since 14.0
	 */
	setVisibleFunctionTableAtBufferIndex(visibleFunctionTable: MTLVisibleFunctionTable, bufferIndex: number): void;

	/**
	 * @since 14.0
	 */
	setVisibleFunctionTablesWithBufferRange(visibleFunctionTables: interop.Reference<MTLVisibleFunctionTable>, range: NSRange): void;

	/**
	 * @since 10.0
	 */
	updateFence(fence: MTLFence): void;

	/**
	 * @since 11.0
	 */
	useHeap(heap: MTLHeap): void;

	/**
	 * @since 11.0
	 */
	useHeapsCount(heaps: interop.Reference<MTLHeap>, count: number): void;

	/**
	 * @since 11.0
	 */
	useResourceUsage(resource: MTLResource, usage: MTLResourceUsage): void;

	/**
	 * @since 11.0
	 */
	useResourcesCountUsage(resources: interop.Reference<MTLResource>, count: number, usage: MTLResourceUsage): void;

	/**
	 * @since 10.0
	 */
	waitForFence(fence: MTLFence): void;
}
declare var MTLComputeCommandEncoder: {

	prototype: MTLComputeCommandEncoder;
};

/**
 * @since 14.0
 */
declare class MTLComputePassDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLComputePassDescriptor; // inherited from NSObject

	static computePassDescriptor(): MTLComputePassDescriptor;

	static new(): MTLComputePassDescriptor; // inherited from NSObject

	dispatchType: MTLDispatchType;

	readonly sampleBufferAttachments: MTLComputePassSampleBufferAttachmentDescriptorArray;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class MTLComputePassSampleBufferAttachmentDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLComputePassSampleBufferAttachmentDescriptor; // inherited from NSObject

	static new(): MTLComputePassSampleBufferAttachmentDescriptor; // inherited from NSObject

	endOfEncoderSampleIndex: number;

	sampleBuffer: MTLCounterSampleBuffer;

	startOfEncoderSampleIndex: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class MTLComputePassSampleBufferAttachmentDescriptorArray extends NSObject {

	static alloc(): MTLComputePassSampleBufferAttachmentDescriptorArray; // inherited from NSObject

	static new(): MTLComputePassSampleBufferAttachmentDescriptorArray; // inherited from NSObject
	[index: number]: MTLComputePassSampleBufferAttachmentDescriptor;

	objectAtIndexedSubscript(attachmentIndex: number): MTLComputePassSampleBufferAttachmentDescriptor;

	setObjectAtIndexedSubscript(attachment: MTLComputePassSampleBufferAttachmentDescriptor, attachmentIndex: number): void;
}

/**
 * @since 9.0
 */
declare class MTLComputePipelineDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLComputePipelineDescriptor; // inherited from NSObject

	static new(): MTLComputePipelineDescriptor; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	binaryArchives: NSArray<MTLBinaryArchive>;

	/**
	 * @since 11.0
	 */
	readonly buffers: MTLPipelineBufferDescriptorArray;

	computeFunction: MTLFunction;

	/**
	 * @since 14.0
	 * @deprecated 15.0
	 */
	insertLibraries: NSArray<MTLDynamicLibrary>;

	label: string;

	/**
	 * @since 14.0
	 */
	linkedFunctions: MTLLinkedFunctions;

	/**
	 * @since 14.0
	 */
	maxCallStackDepth: number;

	/**
	 * @since 12.0
	 */
	maxTotalThreadsPerThreadgroup: number;

	/**
	 * @since 15.0
	 */
	preloadedLibraries: NSArray<MTLDynamicLibrary>;

	/**
	 * @since 18.0
	 */
	shaderValidation: MTLShaderValidation;

	/**
	 * @since 10.0
	 */
	stageInputDescriptor: MTLStageInputOutputDescriptor;

	/**
	 * @since 14.0
	 */
	supportAddingBinaryFunctions: boolean;

	/**
	 * @since 13.0
	 */
	supportIndirectCommandBuffers: boolean;

	threadGroupSizeIsMultipleOfThreadExecutionWidth: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	reset(): void;
}

/**
 * @since 8.0
 */
declare class MTLComputePipelineReflection extends NSObject {

	static alloc(): MTLComputePipelineReflection; // inherited from NSObject

	static new(): MTLComputePipelineReflection; // inherited from NSObject

	/**
	 * @since 8.0
	 * @deprecated 16.0
	 */
	readonly arguments: NSArray<MTLArgument>;

	/**
	 * @since 16.0
	 */
	readonly bindings: NSArray<MTLBinding>;
}

/**
 * @since 8.0
 */
interface MTLComputePipelineState extends NSObjectProtocol {

	device: MTLDevice;

	/**
	 * @since 16.0
	 */
	gpuResourceID: MTLResourceID;

	/**
	 * @since 11.0
	 */
	label: string;

	maxTotalThreadsPerThreadgroup: number;

	/**
	 * @since 18.0
	 */
	shaderValidation: MTLShaderValidation;

	/**
	 * @since 11.0
	 */
	staticThreadgroupMemoryLength: number;

	/**
	 * @since 13.0
	 */
	supportIndirectCommandBuffers: boolean;

	threadExecutionWidth: number;

	/**
	 * @since 14.0
	 */
	functionHandleWithFunction(_function: MTLFunction): MTLFunctionHandle;

	/**
	 * @since 11.0
	 */
	imageblockMemoryLengthForDimensions(imageblockDimensions: MTLSize): number;

	/**
	 * @since 14.0
	 */
	newComputePipelineStateWithAdditionalBinaryFunctionsError(functions: NSArray<MTLFunction> | MTLFunction[]): MTLComputePipelineState;

	/**
	 * @since 14.0
	 */
	newIntersectionFunctionTableWithDescriptor(descriptor: MTLIntersectionFunctionTableDescriptor): MTLIntersectionFunctionTable;

	/**
	 * @since 14.0
	 */
	newVisibleFunctionTableWithDescriptor(descriptor: MTLVisibleFunctionTableDescriptor): MTLVisibleFunctionTable;
}
declare var MTLComputePipelineState: {

	prototype: MTLComputePipelineState;
};

/**
 * @since 18.0
 */
declare function MTLCopyAllDevices(): NSArray<MTLDevice>;

/**
 * @since 14.0
 */
interface MTLCounter extends NSObjectProtocol {

	/**
	 * @since 14.0
	 */
	name: string;
}
declare var MTLCounter: {

	prototype: MTLCounter;
};

/**
 * @since 14.0
 */
declare var MTLCounterErrorDomain: string;

interface MTLCounterResultStageUtilization {
	totalCycles: number;
	vertexCycles: number;
	tessellationCycles: number;
	postTessellationVertexCycles: number;
	fragmentCycles: number;
	renderTargetCycles: number;
}
declare var MTLCounterResultStageUtilization: interop.StructType<MTLCounterResultStageUtilization>;

interface MTLCounterResultStatistic {
	tessellationInputPatches: number;
	vertexInvocations: number;
	postTessellationVertexInvocations: number;
	clipperInvocations: number;
	clipperPrimitivesOut: number;
	fragmentInvocations: number;
	fragmentsPassed: number;
	computeKernelInvocations: number;
}
declare var MTLCounterResultStatistic: interop.StructType<MTLCounterResultStatistic>;

interface MTLCounterResultTimestamp {
	timestamp: number;
}
declare var MTLCounterResultTimestamp: interop.StructType<MTLCounterResultTimestamp>;

/**
 * @since 14.0
 */
interface MTLCounterSampleBuffer extends NSObjectProtocol {

	/**
	 * @since 14.0
	 */
	device: MTLDevice;

	/**
	 * @since 14.0
	 */
	label: string;

	/**
	 * @since 14.0
	 */
	sampleCount: number;

	/**
	 * @since 14.0
	 */
	resolveCounterRange(range: NSRange): NSData;
}
declare var MTLCounterSampleBuffer: {

	prototype: MTLCounterSampleBuffer;
};

/**
 * @since 14.0
 */
declare class MTLCounterSampleBufferDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLCounterSampleBufferDescriptor; // inherited from NSObject

	static new(): MTLCounterSampleBufferDescriptor; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	counterSet: MTLCounterSet;

	/**
	 * @since 14.0
	 */
	label: string;

	/**
	 * @since 14.0
	 */
	sampleCount: number;

	/**
	 * @since 14.0
	 */
	storageMode: MTLStorageMode;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare const enum MTLCounterSampleBufferError {

	OutOfMemory = 0,

	Invalid = 1,

	Internal = 2
}

/**
 * @since 14.0
 */
declare const enum MTLCounterSamplingPoint {

	AtStageBoundary = 0,

	AtDrawBoundary = 1,

	AtDispatchBoundary = 2,

	AtTileDispatchBoundary = 3,

	AtBlitBoundary = 4
}

/**
 * @since 14.0
 */
interface MTLCounterSet extends NSObjectProtocol {

	/**
	 * @since 14.0
	 */
	counters: NSArray<MTLCounter>;

	/**
	 * @since 14.0
	 */
	name: string;
}
declare var MTLCounterSet: {

	prototype: MTLCounterSet;
};

/**
 * @since 8.0
 */
declare function MTLCreateSystemDefaultDevice(): MTLDevice;

/**
 * @since 8.0
 */
declare const enum MTLCullMode {

	None = 0,

	Front = 1,

	Back = 2
}

/**
 * @since 17.0
 */
declare const enum MTLCurveBasis {

	BSpline = 0,

	CatmullRom = 1,

	Linear = 2,

	Bezier = 3
}

/**
 * @since 17.0
 */
declare const enum MTLCurveEndCaps {

	None = 0,

	Disk = 1,

	Sphere = 2
}

/**
 * @since 17.0
 */
declare const enum MTLCurveType {

	Round = 0,

	Flat = 1
}

/**
 * @since 8.0
 */
declare const enum MTLDataType {

	None = 0,

	Struct = 1,

	Array = 2,

	Float = 3,

	Float2 = 4,

	Float3 = 5,

	Float4 = 6,

	Float2x2 = 7,

	Float2x3 = 8,

	Float2x4 = 9,

	Float3x2 = 10,

	Float3x3 = 11,

	Float3x4 = 12,

	Float4x2 = 13,

	Float4x3 = 14,

	Float4x4 = 15,

	Half = 16,

	Half2 = 17,

	Half3 = 18,

	Half4 = 19,

	Half2x2 = 20,

	Half2x3 = 21,

	Half2x4 = 22,

	Half3x2 = 23,

	Half3x3 = 24,

	Half3x4 = 25,

	Half4x2 = 26,

	Half4x3 = 27,

	Half4x4 = 28,

	Int = 29,

	Int2 = 30,

	Int3 = 31,

	Int4 = 32,

	UInt = 33,

	UInt2 = 34,

	UInt3 = 35,

	UInt4 = 36,

	Short = 37,

	Short2 = 38,

	Short3 = 39,

	Short4 = 40,

	UShort = 41,

	UShort2 = 42,

	UShort3 = 43,

	UShort4 = 44,

	Char = 45,

	Char2 = 46,

	Char3 = 47,

	Char4 = 48,

	UChar = 49,

	UChar2 = 50,

	UChar3 = 51,

	UChar4 = 52,

	Bool = 53,

	Bool2 = 54,

	Bool3 = 55,

	Bool4 = 56,

	Texture = 58,

	Sampler = 59,

	Pointer = 60,

	R8Unorm = 62,

	R8Snorm = 63,

	R16Unorm = 64,

	R16Snorm = 65,

	RG8Unorm = 66,

	RG8Snorm = 67,

	RG16Unorm = 68,

	RG16Snorm = 69,

	RGBA8Unorm = 70,

	RGBA8Unorm_sRGB = 71,

	RGBA8Snorm = 72,

	RGBA16Unorm = 73,

	RGBA16Snorm = 74,

	RGB10A2Unorm = 75,

	RG11B10Float = 76,

	RGB9E5Float = 77,

	RenderPipeline = 78,

	ComputePipeline = 79,

	IndirectCommandBuffer = 80,

	Long = 81,

	Long2 = 82,

	Long3 = 83,

	Long4 = 84,

	ULong = 85,

	ULong2 = 86,

	ULong3 = 87,

	ULong4 = 88,

	VisibleFunctionTable = 115,

	IntersectionFunctionTable = 116,

	PrimitiveAccelerationStructure = 117,

	InstanceAccelerationStructure = 118,

	BFloat = 121,

	BFloat2 = 122,

	BFloat3 = 123,

	BFloat4 = 124
}

/**
 * @since 9.0
 */
declare const enum MTLDepthClipMode {

	Clip = 0,

	Clamp = 1
}

/**
 * @since 8.0
 */
declare class MTLDepthStencilDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLDepthStencilDescriptor; // inherited from NSObject

	static new(): MTLDepthStencilDescriptor; // inherited from NSObject

	backFaceStencil: MTLStencilDescriptor;

	depthCompareFunction: MTLCompareFunction;

	depthWriteEnabled: boolean;

	frontFaceStencil: MTLStencilDescriptor;

	label: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
interface MTLDepthStencilState extends NSObjectProtocol {

	device: MTLDevice;

	label: string;
}
declare var MTLDepthStencilState: {

	prototype: MTLDepthStencilState;
};

/**
 * @since 8.0
 */
interface MTLDevice extends NSObjectProtocol {

	/**
	 * @since 17.0
	 */
	architecture: MTLArchitecture;

	/**
	 * @since 11.0
	 */
	argumentBuffersSupport: MTLArgumentBuffersTier;

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	barycentricCoordsSupported: boolean;

	/**
	 * @since 14.0
	 */
	counterSets: NSArray<MTLCounterSet>;

	/**
	 * @since 11.0
	 */
	currentAllocatedSize: number;

	/**
	 * @since 13.0
	 */
	hasUnifiedMemory: boolean;

	/**
	 * @since 12.0
	 */
	maxArgumentBufferSamplerCount: number;

	/**
	 * @since 12.0
	 */
	maxBufferLength: number;

	/**
	 * @since 11.0
	 */
	maxThreadgroupMemoryLength: number;

	/**
	 * @since 9.0
	 */
	maxThreadsPerThreadgroup: MTLSize;

	name: string;

	/**
	 * @since 11.0
	 */
	programmableSamplePositionsSupported: boolean;

	/**
	 * @since 11.0
	 */
	rasterOrderGroupsSupported: boolean;

	/**
	 * @since 11.0
	 */
	readWriteTextureSupport: MTLReadWriteTextureTier;

	/**
	 * @since 16.0
	 */
	recommendedMaxWorkingSetSize: number;

	/**
	 * @since 11.0
	 */
	registryID: number;

	/**
	 * @since 13.0
	 */
	sparseTileSizeInBytes: number;

	/**
	 * @since 14.0
	 */
	supports32BitFloatFiltering: boolean;

	/**
	 * @since 14.0
	 */
	supports32BitMSAA: boolean;

	/**
	 * @since 16.4
	 */
	supportsBCTextureCompression: boolean;

	/**
	 * @since 14.0
	 */
	supportsDynamicLibraries: boolean;

	/**
	 * @since 14.0
	 */
	supportsFunctionPointers: boolean;

	/**
	 * @since 15.0
	 */
	supportsFunctionPointersFromRender: boolean;

	/**
	 * @since 14.0
	 */
	supportsPrimitiveMotionBlur: boolean;

	/**
	 * @since 14.0
	 */
	supportsPullModelInterpolation: boolean;

	/**
	 * @since 14.0
	 */
	supportsQueryTextureLOD: boolean;

	/**
	 * @since 14.0
	 */
	supportsRaytracing: boolean;

	/**
	 * @since 15.0
	 */
	supportsRaytracingFromRender: boolean;

	/**
	 * @since 15.0
	 */
	supportsRenderDynamicLibraries: boolean;

	/**
	 * @since 14.0
	 */
	supportsShaderBarycentricCoordinates: boolean;

	/**
	 * @since 14.0
	 */
	accelerationStructureSizesWithDescriptor(descriptor: MTLAccelerationStructureDescriptor): MTLAccelerationStructureSizes;

	/**
	 * @since 13.0
	 */
	convertSparsePixelRegionsToTileRegionsWithTileSizeAlignmentModeNumRegions?(pixelRegions: interop.Reference<MTLRegion>, tileRegions: interop.Reference<MTLRegion>, tileSize: MTLSize, mode: MTLSparseTextureRegionAlignmentMode, numRegions: number): void;

	/**
	 * @since 13.0
	 */
	convertSparseTileRegionsToPixelRegionsWithTileSizeNumRegions?(tileRegions: interop.Reference<MTLRegion>, pixelRegions: interop.Reference<MTLRegion>, tileSize: MTLSize, numRegions: number): void;

	/**
	 * @since 11.0
	 */
	getDefaultSamplePositionsCount(positions: interop.Pointer | interop.Reference<MTLSamplePosition>, count: number): void;

	/**
	 * @since 16.0
	 */
	heapAccelerationStructureSizeAndAlignWithDescriptor(descriptor: MTLAccelerationStructureDescriptor): MTLSizeAndAlign;

	/**
	 * @since 16.0
	 */
	heapAccelerationStructureSizeAndAlignWithSize(size: number): MTLSizeAndAlign;

	/**
	 * @since 10.0
	 */
	heapBufferSizeAndAlignWithLengthOptions(length: number, options: MTLResourceOptions): MTLSizeAndAlign;

	/**
	 * @since 10.0
	 */
	heapTextureSizeAndAlignWithDescriptor(desc: MTLTextureDescriptor): MTLSizeAndAlign;

	/**
	 * @since 11.0
	 */
	minimumLinearTextureAlignmentForPixelFormat(format: MTLPixelFormat): number;

	/**
	 * @since 12.0
	 */
	minimumTextureBufferAlignmentForPixelFormat(format: MTLPixelFormat): number;

	/**
	 * @since 14.0
	 */
	newAccelerationStructureWithDescriptor(descriptor: MTLAccelerationStructureDescriptor): MTLAccelerationStructure;

	/**
	 * @since 14.0
	 */
	newAccelerationStructureWithSize(size: number): MTLAccelerationStructure;

	/**
	 * @since 11.0
	 */
	newArgumentEncoderWithArguments(_arguments: NSArray<MTLArgumentDescriptor> | MTLArgumentDescriptor[]): MTLArgumentEncoder;

	/**
	 * @since 16.0
	 */
	newArgumentEncoderWithBufferBinding(bufferBinding: MTLBufferBinding): MTLArgumentEncoder;

	/**
	 * @since 14.0
	 */
	newBinaryArchiveWithDescriptorError(descriptor: MTLBinaryArchiveDescriptor): MTLBinaryArchive;

	newBufferWithBytesLengthOptions(pointer: interop.Pointer | interop.Reference<any>, length: number, options: MTLResourceOptions): MTLBuffer;

	newBufferWithBytesNoCopyLengthOptionsDeallocator(pointer: interop.Pointer | interop.Reference<any>, length: number, options: MTLResourceOptions, deallocator: (p1: interop.Pointer | interop.Reference<any>, p2: number) => void): MTLBuffer;

	newBufferWithLengthOptions(length: number, options: MTLResourceOptions): MTLBuffer;

	newCommandQueue(): MTLCommandQueue;

	/**
	 * @since 18.0
	 */
	newCommandQueueWithDescriptor(descriptor: MTLCommandQueueDescriptor): MTLCommandQueue;

	newCommandQueueWithMaxCommandBufferCount(maxCommandBufferCount: number): MTLCommandQueue;

	/**
	 * @since 9.0
	 */
	newComputePipelineStateWithDescriptorOptionsCompletionHandler(descriptor: MTLComputePipelineDescriptor, options: MTLPipelineOption, completionHandler: (p1: MTLComputePipelineState, p2: MTLComputePipelineReflection, p3: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	newComputePipelineStateWithDescriptorOptionsReflectionError(descriptor: MTLComputePipelineDescriptor, options: MTLPipelineOption, reflection: interop.Pointer | interop.Reference<MTLComputePipelineReflection>): MTLComputePipelineState;

	newComputePipelineStateWithFunctionCompletionHandler(computeFunction: MTLFunction, completionHandler: (p1: MTLComputePipelineState, p2: NSError) => void): void;

	newComputePipelineStateWithFunctionError(computeFunction: MTLFunction): MTLComputePipelineState;

	newComputePipelineStateWithFunctionOptionsCompletionHandler(computeFunction: MTLFunction, options: MTLPipelineOption, completionHandler: (p1: MTLComputePipelineState, p2: MTLComputePipelineReflection, p3: NSError) => void): void;

	newComputePipelineStateWithFunctionOptionsReflectionError(computeFunction: MTLFunction, options: MTLPipelineOption, reflection: interop.Pointer | interop.Reference<MTLComputePipelineReflection>): MTLComputePipelineState;

	/**
	 * @since 14.0
	 */
	newCounterSampleBufferWithDescriptorError(descriptor: MTLCounterSampleBufferDescriptor): MTLCounterSampleBuffer;

	newDefaultLibrary(): MTLLibrary;

	/**
	 * @since 10.0
	 */
	newDefaultLibraryWithBundleError(bundle: NSBundle): MTLLibrary;

	newDepthStencilStateWithDescriptor(descriptor: MTLDepthStencilDescriptor): MTLDepthStencilState;

	/**
	 * @since 14.0
	 */
	newDynamicLibraryError(library: MTLLibrary): MTLDynamicLibrary;

	/**
	 * @since 14.0
	 */
	newDynamicLibraryWithURLError(url: NSURL): MTLDynamicLibrary;

	/**
	 * @since 12.0
	 */
	newEvent(): MTLEvent;

	/**
	 * @since 10.0
	 */
	newFence(): MTLFence;

	/**
	 * @since 10.0
	 */
	newHeapWithDescriptor(descriptor: MTLHeapDescriptor): MTLHeap;

	/**
	 * @since 12.0
	 */
	newIndirectCommandBufferWithDescriptorMaxCommandCountOptions(descriptor: MTLIndirectCommandBufferDescriptor, maxCount: number, options: MTLResourceOptions): MTLIndirectCommandBuffer;

	newLibraryWithDataError(data: NSObject & OS_dispatch_data): MTLLibrary;

	/**
	 * @since 8.0
	 * @deprecated 16.0
	 */
	newLibraryWithFileError(filepath: string): MTLLibrary;

	newLibraryWithSourceOptionsCompletionHandler(source: string, options: MTLCompileOptions, completionHandler: (p1: MTLLibrary, p2: NSError) => void): void;

	newLibraryWithSourceOptionsError(source: string, options: MTLCompileOptions): MTLLibrary;

	/**
	 * @since 15.0
	 */
	newLibraryWithStitchedDescriptorCompletionHandler(descriptor: MTLStitchedLibraryDescriptor, completionHandler: (p1: MTLLibrary, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	newLibraryWithStitchedDescriptorError(descriptor: MTLStitchedLibraryDescriptor): MTLLibrary;

	/**
	 * @since 11.0
	 */
	newLibraryWithURLError(url: NSURL): MTLLibrary;

	/**
	 * @since 18.0
	 */
	newLogStateWithDescriptorError(descriptor: MTLLogStateDescriptor): MTLLogState;

	/**
	 * @since 13.0
	 */
	newRasterizationRateMapWithDescriptor(descriptor: MTLRasterizationRateMapDescriptor): MTLRasterizationRateMap;

	newRenderPipelineStateWithDescriptorCompletionHandler(descriptor: MTLRenderPipelineDescriptor, completionHandler: (p1: MTLRenderPipelineState, p2: NSError) => void): void;

	newRenderPipelineStateWithDescriptorError(descriptor: MTLRenderPipelineDescriptor): MTLRenderPipelineState;

	newRenderPipelineStateWithDescriptorOptionsCompletionHandler(descriptor: MTLRenderPipelineDescriptor, options: MTLPipelineOption, completionHandler: (p1: MTLRenderPipelineState, p2: MTLRenderPipelineReflection, p3: NSError) => void): void;

	newRenderPipelineStateWithDescriptorOptionsReflectionError(descriptor: MTLRenderPipelineDescriptor, options: MTLPipelineOption, reflection: interop.Pointer | interop.Reference<MTLRenderPipelineReflection>): MTLRenderPipelineState;

	/**
	 * @since 16.0
	 */
	newRenderPipelineStateWithMeshDescriptorOptionsCompletionHandler(descriptor: MTLMeshRenderPipelineDescriptor, options: MTLPipelineOption, completionHandler: (p1: MTLRenderPipelineState, p2: MTLRenderPipelineReflection, p3: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	newRenderPipelineStateWithMeshDescriptorOptionsReflectionError(descriptor: MTLMeshRenderPipelineDescriptor, options: MTLPipelineOption, reflection: interop.Pointer | interop.Reference<MTLRenderPipelineReflection>): MTLRenderPipelineState;

	/**
	 * @since 11.0
	 */
	newRenderPipelineStateWithTileDescriptorOptionsCompletionHandler(descriptor: MTLTileRenderPipelineDescriptor, options: MTLPipelineOption, completionHandler: (p1: MTLRenderPipelineState, p2: MTLRenderPipelineReflection, p3: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	newRenderPipelineStateWithTileDescriptorOptionsReflectionError(descriptor: MTLTileRenderPipelineDescriptor, options: MTLPipelineOption, reflection: interop.Pointer | interop.Reference<MTLRenderPipelineReflection>): MTLRenderPipelineState;

	/**
	 * @since 18.0
	 */
	newResidencySetWithDescriptorError(desc: MTLResidencySetDescriptor): MTLResidencySet;

	newSamplerStateWithDescriptor(descriptor: MTLSamplerDescriptor): MTLSamplerState;

	/**
	 * @since 12.0
	 */
	newSharedEvent(): MTLSharedEvent;

	/**
	 * @since 12.0
	 */
	newSharedEventWithHandle(sharedEventHandle: MTLSharedEventHandle): MTLSharedEvent;

	newTextureWithDescriptor(descriptor: MTLTextureDescriptor): MTLTexture;

	/**
	 * @since 11.0
	 */
	newTextureWithDescriptorIosurfacePlane(descriptor: MTLTextureDescriptor, iosurface: IOSurface, plane: number): MTLTexture;

	/**
	 * @since 14.0
	 */
	sampleTimestampsGpuTimestamp(cpuTimestamp: interop.Pointer | interop.Reference<number>, gpuTimestamp: interop.Pointer | interop.Reference<number>): void;

	/**
	 * @since 16.0
	 */
	sparseTileSizeInBytesForSparsePageSize(sparsePageSize: MTLSparsePageSize): number;

	/**
	 * @since 13.0
	 */
	sparseTileSizeWithTextureTypePixelFormatSampleCount(textureType: MTLTextureType, pixelFormat: MTLPixelFormat, sampleCount: number): MTLSize;

	/**
	 * @since 16.0
	 */
	sparseTileSizeWithTextureTypePixelFormatSampleCountSparsePageSize(textureType: MTLTextureType, pixelFormat: MTLPixelFormat, sampleCount: number, sparsePageSize: MTLSparsePageSize): MTLSize;

	/**
	 * @since 14.0
	 */
	supportsCounterSampling(samplingPoint: MTLCounterSamplingPoint): boolean;

	/**
	 * @since 13.0
	 */
	supportsFamily(gpuFamily: MTLGPUFamily): boolean;

	/**
	 * @since 8.0
	 * @deprecated 16.0
	 */
	supportsFeatureSet(featureSet: MTLFeatureSet): boolean;

	/**
	 * @since 13.0
	 */
	supportsRasterizationRateMapWithLayerCount(layerCount: number): boolean;

	/**
	 * @since 9.0
	 */
	supportsTextureSampleCount(sampleCount: number): boolean;

	/**
	 * @since 13.0
	 */
	supportsVertexAmplificationCount(count: number): boolean;
}
declare var MTLDevice: {

	prototype: MTLDevice;
};

interface MTLDispatchThreadgroupsIndirectArguments {
	threadgroupsPerGrid: interop.Reference<number>;
}
declare var MTLDispatchThreadgroupsIndirectArguments: interop.StructType<MTLDispatchThreadgroupsIndirectArguments>;

/**
 * @since 12.0
 */
declare const enum MTLDispatchType {

	Serial = 0,

	Concurrent = 1
}

interface MTLDrawIndexedPrimitivesIndirectArguments {
	indexCount: number;
	instanceCount: number;
	indexStart: number;
	baseVertex: number;
	baseInstance: number;
}
declare var MTLDrawIndexedPrimitivesIndirectArguments: interop.StructType<MTLDrawIndexedPrimitivesIndirectArguments>;

interface MTLDrawPatchIndirectArguments {
	patchCount: number;
	instanceCount: number;
	patchStart: number;
	baseInstance: number;
}
declare var MTLDrawPatchIndirectArguments: interop.StructType<MTLDrawPatchIndirectArguments>;

interface MTLDrawPrimitivesIndirectArguments {
	vertexCount: number;
	instanceCount: number;
	vertexStart: number;
	baseInstance: number;
}
declare var MTLDrawPrimitivesIndirectArguments: interop.StructType<MTLDrawPrimitivesIndirectArguments>;

/**
 * @since 8.0
 */
interface MTLDrawable extends NSObjectProtocol {

	present(): void;

	presentAtTime(presentationTime: number): void;
}
declare var MTLDrawable: {

	prototype: MTLDrawable;
};

/**
 * @since 14.0
 */
interface MTLDynamicLibrary extends NSObjectProtocol {

	device: MTLDevice;

	installName: string;

	label: string;

	serializeToURLError(url: NSURL): boolean;
}
declare var MTLDynamicLibrary: {

	prototype: MTLDynamicLibrary;
};

/**
 * @since 14.0
 */
declare var MTLDynamicLibraryDomain: string;

/**
 * @since 14.0
 */
declare const enum MTLDynamicLibraryError {

	None = 0,

	InvalidFile = 1,

	CompilationFailure = 2,

	UnresolvedInstallName = 3,

	DependencyLoadFailure = 4,

	Unsupported = 5
}

/**
 * @since 12.0
 */
interface MTLEvent extends NSObjectProtocol {

	device: MTLDevice;

	label: string;
}
declare var MTLEvent: {

	prototype: MTLEvent;
};

/**
 * @since 8.0
 * @deprecated 16.0
 */
declare const enum MTLFeatureSet {

	iOS_GPUFamily1_v1 = 0,

	iOS_GPUFamily2_v1 = 1,

	iOS_GPUFamily1_v2 = 2,

	iOS_GPUFamily2_v2 = 3,

	iOS_GPUFamily3_v1 = 4,

	iOS_GPUFamily1_v3 = 5,

	iOS_GPUFamily2_v3 = 6,

	iOS_GPUFamily3_v2 = 7,

	iOS_GPUFamily1_v4 = 8,

	iOS_GPUFamily2_v4 = 9,

	iOS_GPUFamily3_v3 = 10,

	iOS_GPUFamily4_v1 = 11,

	iOS_GPUFamily1_v5 = 12,

	iOS_GPUFamily2_v5 = 13,

	iOS_GPUFamily3_v4 = 14,

	iOS_GPUFamily4_v2 = 15,

	iOS_GPUFamily5_v1 = 16,

	macOS_GPUFamily1_v1 = 10000,

	OSX_GPUFamily1_v1 = 10000,

	macOS_GPUFamily1_v2 = 10001,

	OSX_GPUFamily1_v2 = 10001,

	macOS_ReadWriteTextureTier2 = 10002,

	OSX_ReadWriteTextureTier2 = 10002,

	macOS_GPUFamily1_v3 = 10003,

	macOS_GPUFamily1_v4 = 10004,

	macOS_GPUFamily2_v1 = 10005,

	tvOS_GPUFamily1_v1 = 30000,

	TVOS_GPUFamily1_v1 = 30000,

	tvOS_GPUFamily1_v2 = 30001,

	tvOS_GPUFamily1_v3 = 30002,

	tvOS_GPUFamily1_v4 = 30004
}

/**
 * @since 10.0
 */
interface MTLFence extends NSObjectProtocol {

	device: MTLDevice;

	label: string;
}
declare var MTLFence: {

	prototype: MTLFence;
};

/**
 * @since 8.0
 */
interface MTLFunction extends NSObjectProtocol {

	device: MTLDevice;

	/**
	 * @since 10.0
	 */
	functionConstantsDictionary: NSDictionary<string, MTLFunctionConstant>;

	functionType: MTLFunctionType;

	/**
	 * @since 10.0
	 */
	label: string;

	name: string;

	/**
	 * @since 14.0
	 */
	options: MTLFunctionOptions;

	/**
	 * @since 10.0
	 */
	patchControlPointCount: number;

	/**
	 * @since 10.0
	 */
	patchType: MTLPatchType;

	/**
	 * @since 10.0
	 */
	stageInputAttributes: NSArray<MTLAttribute>;

	vertexAttributes: NSArray<MTLVertexAttribute>;

	/**
	 * @since 11.0
	 */
	newArgumentEncoderWithBufferIndex(bufferIndex: number): MTLArgumentEncoder;

	/**
	 * @since 11.0
	 * @deprecated 16.0
	 */
	newArgumentEncoderWithBufferIndexReflection(bufferIndex: number, reflection: interop.Pointer | interop.Reference<MTLArgument>): MTLArgumentEncoder;
}
declare var MTLFunction: {

	prototype: MTLFunction;
};

/**
 * @since 10.0
 */
declare class MTLFunctionConstant extends NSObject {

	static alloc(): MTLFunctionConstant; // inherited from NSObject

	static new(): MTLFunctionConstant; // inherited from NSObject

	readonly index: number;

	readonly name: string;

	readonly required: boolean;

	readonly type: MTLDataType;
}

/**
 * @since 10.0
 */
declare class MTLFunctionConstantValues extends NSObject implements NSCopying {

	static alloc(): MTLFunctionConstantValues; // inherited from NSObject

	static new(): MTLFunctionConstantValues; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	reset(): void;

	setConstantValueTypeAtIndex(value: interop.Pointer | interop.Reference<any>, type: MTLDataType, index: number): void;

	setConstantValueTypeWithName(value: interop.Pointer | interop.Reference<any>, type: MTLDataType, name: string): void;

	setConstantValuesTypeWithRange(values: interop.Pointer | interop.Reference<any>, type: MTLDataType, range: NSRange): void;
}

/**
 * @since 14.0
 */
declare class MTLFunctionDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLFunctionDescriptor; // inherited from NSObject

	static functionDescriptor(): MTLFunctionDescriptor;

	static new(): MTLFunctionDescriptor; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	binaryArchives: NSArray<MTLBinaryArchive>;

	constantValues: MTLFunctionConstantValues;

	name: string;

	options: MTLFunctionOptions;

	specializedName: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
interface MTLFunctionHandle extends NSObjectProtocol {

	device: MTLDevice;

	functionType: MTLFunctionType;

	name: string;
}
declare var MTLFunctionHandle: {

	prototype: MTLFunctionHandle;
};

/**
 * @since 14.0
 */
interface MTLFunctionLog extends NSObjectProtocol {

	debugLocation: MTLFunctionLogDebugLocation;

	encoderLabel: string;

	function: MTLFunction;

	type: MTLFunctionLogType;
}
declare var MTLFunctionLog: {

	prototype: MTLFunctionLog;
};

/**
 * @since 14.0
 */
interface MTLFunctionLogDebugLocation extends NSObjectProtocol {

	URL: NSURL;

	column: number;

	functionName: string;

	line: number;
}
declare var MTLFunctionLogDebugLocation: {

	prototype: MTLFunctionLogDebugLocation;
};

declare const enum MTLFunctionLogType {

	Validation = 0
}

/**
 * @since 14.0
 */
declare const enum MTLFunctionOptions {

	None = 0,

	CompileToBinary = 1,

	StoreFunctionInMetalPipelinesScript = 2,

	StoreFunctionInMetalScript = 2,

	FailOnBinaryArchiveMiss = 4
}

/**
 * @since 15.0
 */
interface MTLFunctionStitchingAttribute extends NSObjectProtocol {
}
declare var MTLFunctionStitchingAttribute: {

	prototype: MTLFunctionStitchingAttribute;
};

/**
 * @since 15.0
 */
declare class MTLFunctionStitchingAttributeAlwaysInline extends NSObject implements MTLFunctionStitchingAttribute {

	static alloc(): MTLFunctionStitchingAttributeAlwaysInline; // inherited from NSObject

	static new(): MTLFunctionStitchingAttributeAlwaysInline; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

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

/**
 * @since 15.0
 */
declare class MTLFunctionStitchingFunctionNode extends NSObject implements MTLFunctionStitchingNode {

	static alloc(): MTLFunctionStitchingFunctionNode; // inherited from NSObject

	static new(): MTLFunctionStitchingFunctionNode; // inherited from NSObject

	arguments: NSArray<MTLFunctionStitchingNode>;

	controlDependencies: NSArray<MTLFunctionStitchingFunctionNode>;

	name: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { name: string; arguments: NSArray<MTLFunctionStitchingNode> | MTLFunctionStitchingNode[]; controlDependencies: NSArray<MTLFunctionStitchingFunctionNode> | MTLFunctionStitchingFunctionNode[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithNameArgumentsControlDependencies(name: string, _arguments: NSArray<MTLFunctionStitchingNode> | MTLFunctionStitchingNode[], controlDependencies: NSArray<MTLFunctionStitchingFunctionNode> | MTLFunctionStitchingFunctionNode[]): this;

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

/**
 * @since 15.0
 */
declare class MTLFunctionStitchingGraph extends NSObject implements NSCopying {

	static alloc(): MTLFunctionStitchingGraph; // inherited from NSObject

	static new(): MTLFunctionStitchingGraph; // inherited from NSObject

	attributes: NSArray<MTLFunctionStitchingAttribute>;

	functionName: string;

	nodes: NSArray<MTLFunctionStitchingFunctionNode>;

	outputNode: MTLFunctionStitchingFunctionNode;

	constructor(o: { functionName: string; nodes: NSArray<MTLFunctionStitchingFunctionNode> | MTLFunctionStitchingFunctionNode[]; outputNode: MTLFunctionStitchingFunctionNode; attributes: NSArray<MTLFunctionStitchingAttribute> | MTLFunctionStitchingAttribute[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithFunctionNameNodesOutputNodeAttributes(functionName: string, nodes: NSArray<MTLFunctionStitchingFunctionNode> | MTLFunctionStitchingFunctionNode[], outputNode: MTLFunctionStitchingFunctionNode, attributes: NSArray<MTLFunctionStitchingAttribute> | MTLFunctionStitchingAttribute[]): this;
}

/**
 * @since 15.0
 */
declare class MTLFunctionStitchingInputNode extends NSObject implements MTLFunctionStitchingNode {

	static alloc(): MTLFunctionStitchingInputNode; // inherited from NSObject

	static new(): MTLFunctionStitchingInputNode; // inherited from NSObject

	argumentIndex: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { argumentIndex: number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithArgumentIndex(argument: number): this;

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

/**
 * @since 15.0
 */
interface MTLFunctionStitchingNode extends NSCopying, NSObjectProtocol {
}
declare var MTLFunctionStitchingNode: {

	prototype: MTLFunctionStitchingNode;
};

/**
 * @since 8.0
 */
declare const enum MTLFunctionType {

	Vertex = 1,

	Fragment = 2,

	Kernel = 3,

	Visible = 5,

	Intersection = 6,

	Mesh = 7,

	Object = 8
}

/**
 * @since 13.0
 */
declare const enum MTLGPUFamily {

	Apple1 = 1001,

	Apple2 = 1002,

	Apple3 = 1003,

	Apple4 = 1004,

	Apple5 = 1005,

	Apple6 = 1006,

	Apple7 = 1007,

	Apple8 = 1008,

	Apple9 = 1009,

	Mac1 = 2001,

	Mac2 = 2002,

	Common1 = 3001,

	Common2 = 3002,

	Common3 = 3003,

	MacCatalyst1 = 4001,

	MacCatalyst2 = 4002,

	Metal3 = 5001
}

/**
 * @since 13.0
 */
declare const enum MTLHazardTrackingMode {

	Default = 0,

	Untracked = 1,

	Tracked = 2
}

/**
 * @since 10.0
 */
interface MTLHeap extends MTLAllocation {

	cpuCacheMode: MTLCPUCacheMode;

	/**
	 * @since 11.0
	 */
	currentAllocatedSize: number;

	device: MTLDevice;

	/**
	 * @since 13.0
	 */
	hazardTrackingMode: MTLHazardTrackingMode;

	label: string;

	/**
	 * @since 13.0
	 */
	resourceOptions: MTLResourceOptions;

	size: number;

	storageMode: MTLStorageMode;

	/**
	 * @since 13.0
	 */
	type: MTLHeapType;

	usedSize: number;

	maxAvailableSizeWithAlignment(alignment: number): number;

	/**
	 * @since 16.0
	 */
	newAccelerationStructureWithDescriptor(descriptor: MTLAccelerationStructureDescriptor): MTLAccelerationStructure;

	/**
	 * @since 16.0
	 */
	newAccelerationStructureWithDescriptorOffset(descriptor: MTLAccelerationStructureDescriptor, offset: number): MTLAccelerationStructure;

	/**
	 * @since 16.0
	 */
	newAccelerationStructureWithSize(size: number): MTLAccelerationStructure;

	/**
	 * @since 16.0
	 */
	newAccelerationStructureWithSizeOffset(size: number, offset: number): MTLAccelerationStructure;

	newBufferWithLengthOptions(length: number, options: MTLResourceOptions): MTLBuffer;

	/**
	 * @since 13.0
	 */
	newBufferWithLengthOptionsOffset(length: number, options: MTLResourceOptions, offset: number): MTLBuffer;

	newTextureWithDescriptor(descriptor: MTLTextureDescriptor): MTLTexture;

	/**
	 * @since 13.0
	 */
	newTextureWithDescriptorOffset(descriptor: MTLTextureDescriptor, offset: number): MTLTexture;

	setPurgeableState(state: MTLPurgeableState): MTLPurgeableState;
}
declare var MTLHeap: {

	prototype: MTLHeap;
};

/**
 * @since 10.0
 */
declare class MTLHeapDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLHeapDescriptor; // inherited from NSObject

	static new(): MTLHeapDescriptor; // inherited from NSObject

	cpuCacheMode: MTLCPUCacheMode;

	/**
	 * @since 13.0
	 */
	hazardTrackingMode: MTLHazardTrackingMode;

	/**
	 * @since 13.0
	 */
	resourceOptions: MTLResourceOptions;

	size: number;

	/**
	 * @since 16.0
	 */
	sparsePageSize: MTLSparsePageSize;

	storageMode: MTLStorageMode;

	/**
	 * @since 13.0
	 */
	type: MTLHeapType;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare const enum MTLHeapType {

	Automatic = 0,

	Placement = 1,

	Sparse = 2
}

/**
 * @since 8.0
 */
declare const enum MTLIndexType {

	UInt16 = 0,

	UInt32 = 1
}

interface MTLIndirectAccelerationStructureMotionInstanceDescriptor {
	options: MTLAccelerationStructureInstanceOptions;
	mask: number;
	intersectionFunctionTableOffset: number;
	userID: number;
	accelerationStructureID: MTLResourceID;
	motionTransformsStartIndex: number;
	motionTransformsCount: number;
	motionStartBorderMode: MTLMotionBorderMode;
	motionEndBorderMode: MTLMotionBorderMode;
	motionStartTime: number;
	motionEndTime: number;
}
declare var MTLIndirectAccelerationStructureMotionInstanceDescriptor: interop.StructType<MTLIndirectAccelerationStructureMotionInstanceDescriptor>;

/**
 * @since 12.0
 */
interface MTLIndirectCommandBuffer extends MTLResource {

	/**
	 * @since 16.0
	 */
	gpuResourceID: MTLResourceID;

	size: number;

	/**
	 * @since 13.0
	 */
	indirectComputeCommandAtIndex(commandIndex: number): MTLIndirectComputeCommand;

	indirectRenderCommandAtIndex(commandIndex: number): MTLIndirectRenderCommand;

	resetWithRange(range: NSRange): void;
}
declare var MTLIndirectCommandBuffer: {

	prototype: MTLIndirectCommandBuffer;
};

/**
 * @since 12.0
 */
declare class MTLIndirectCommandBufferDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLIndirectCommandBufferDescriptor; // inherited from NSObject

	static new(): MTLIndirectCommandBufferDescriptor; // inherited from NSObject

	commandTypes: MTLIndirectCommandType;

	inheritBuffers: boolean;

	/**
	 * @since 13.0
	 */
	inheritPipelineState: boolean;

	maxFragmentBufferBindCount: number;

	/**
	 * @since 13.0
	 */
	maxKernelBufferBindCount: number;

	/**
	 * @since 17.0
	 */
	maxKernelThreadgroupMemoryBindCount: number;

	/**
	 * @since 17.0
	 */
	maxMeshBufferBindCount: number;

	/**
	 * @since 17.0
	 */
	maxObjectBufferBindCount: number;

	/**
	 * @since 17.0
	 */
	maxObjectThreadgroupMemoryBindCount: number;

	maxVertexBufferBindCount: number;

	/**
	 * @since 17.0
	 */
	supportDynamicAttributeStride: boolean;

	/**
	 * @since 16.0
	 */
	supportRayTracing: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

interface MTLIndirectCommandBufferExecutionRange {
	location: number;
	length: number;
}
declare var MTLIndirectCommandBufferExecutionRange: interop.StructType<MTLIndirectCommandBufferExecutionRange>;

/**
 * @since 12.0
 */
declare const enum MTLIndirectCommandType {

	Draw = 1,

	DrawIndexed = 2,

	DrawPatches = 4,

	DrawIndexedPatches = 8,

	ConcurrentDispatch = 32,

	ConcurrentDispatchThreads = 64,

	DrawMeshThreadgroups = 128,

	DrawMeshThreads = 256
}

/**
 * @since 13.0
 */
interface MTLIndirectComputeCommand extends NSObjectProtocol {

	clearBarrier(): void;

	concurrentDispatchThreadgroupsThreadsPerThreadgroup(threadgroupsPerGrid: MTLSize, threadsPerThreadgroup: MTLSize): void;

	concurrentDispatchThreadsThreadsPerThreadgroup(threadsPerGrid: MTLSize, threadsPerThreadgroup: MTLSize): void;

	reset(): void;

	setBarrier(): void;

	/**
	 * @since 13.0
	 */
	setComputePipelineState(pipelineState: MTLComputePipelineState): void;

	/**
	 * @since 14.0
	 */
	setImageblockWidthHeight(width: number, height: number): void;

	setKernelBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setKernelBufferOffsetAttributeStrideAtIndex(buffer: MTLBuffer, offset: number, stride: number, index: number): void;

	setStageInRegion(region: MTLRegion): void;

	setThreadgroupMemoryLengthAtIndex(length: number, index: number): void;
}
declare var MTLIndirectComputeCommand: {

	prototype: MTLIndirectComputeCommand;
};

/**
 * @since 17.0
 */
declare class MTLIndirectInstanceAccelerationStructureDescriptor extends MTLAccelerationStructureDescriptor {

	static alloc(): MTLIndirectInstanceAccelerationStructureDescriptor; // inherited from NSObject

	static descriptor(): MTLIndirectInstanceAccelerationStructureDescriptor;

	static new(): MTLIndirectInstanceAccelerationStructureDescriptor; // inherited from NSObject

	instanceCountBuffer: MTLBuffer;

	instanceCountBufferOffset: number;

	instanceDescriptorBuffer: MTLBuffer;

	instanceDescriptorBufferOffset: number;

	instanceDescriptorStride: number;

	instanceDescriptorType: MTLAccelerationStructureInstanceDescriptorType;

	/**
	 * @since 18.0
	 */
	instanceTransformationMatrixLayout: MTLMatrixLayout;

	maxInstanceCount: number;

	maxMotionTransformCount: number;

	motionTransformBuffer: MTLBuffer;

	motionTransformBufferOffset: number;

	motionTransformCountBuffer: MTLBuffer;

	motionTransformCountBufferOffset: number;

	/**
	 * @since 18.0
	 */
	motionTransformStride: number;

	/**
	 * @since 18.0
	 */
	motionTransformType: MTLTransformType;
}

/**
 * @since 12.0
 */
interface MTLIndirectRenderCommand extends NSObjectProtocol {

	/**
	 * @since 17.0
	 */
	clearBarrier(): void;

	drawIndexedPatchesPatchStartPatchCountPatchIndexBufferPatchIndexBufferOffsetControlPointIndexBufferControlPointIndexBufferOffsetInstanceCountBaseInstanceTessellationFactorBufferTessellationFactorBufferOffsetTessellationFactorBufferInstanceStride(numberOfPatchControlPoints: number, patchStart: number, patchCount: number, patchIndexBuffer: MTLBuffer, patchIndexBufferOffset: number, controlPointIndexBuffer: MTLBuffer, controlPointIndexBufferOffset: number, instanceCount: number, baseInstance: number, buffer: MTLBuffer, offset: number, instanceStride: number): void;

	drawIndexedPrimitivesIndexCountIndexTypeIndexBufferIndexBufferOffsetInstanceCountBaseVertexBaseInstance(primitiveType: MTLPrimitiveType, indexCount: number, indexType: MTLIndexType, indexBuffer: MTLBuffer, indexBufferOffset: number, instanceCount: number, baseVertex: number, baseInstance: number): void;

	/**
	 * @since 17.0
	 */
	drawMeshThreadgroupsThreadsPerObjectThreadgroupThreadsPerMeshThreadgroup(threadgroupsPerGrid: MTLSize, threadsPerObjectThreadgroup: MTLSize, threadsPerMeshThreadgroup: MTLSize): void;

	/**
	 * @since 17.0
	 */
	drawMeshThreadsThreadsPerObjectThreadgroupThreadsPerMeshThreadgroup(threadsPerGrid: MTLSize, threadsPerObjectThreadgroup: MTLSize, threadsPerMeshThreadgroup: MTLSize): void;

	drawPatchesPatchStartPatchCountPatchIndexBufferPatchIndexBufferOffsetInstanceCountBaseInstanceTessellationFactorBufferTessellationFactorBufferOffsetTessellationFactorBufferInstanceStride(numberOfPatchControlPoints: number, patchStart: number, patchCount: number, patchIndexBuffer: MTLBuffer, patchIndexBufferOffset: number, instanceCount: number, baseInstance: number, buffer: MTLBuffer, offset: number, instanceStride: number): void;

	drawPrimitivesVertexStartVertexCountInstanceCountBaseInstance(primitiveType: MTLPrimitiveType, vertexStart: number, vertexCount: number, instanceCount: number, baseInstance: number): void;

	reset(): void;

	/**
	 * @since 17.0
	 */
	setBarrier(): void;

	setFragmentBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setMeshBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setObjectBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setObjectThreadgroupMemoryLengthAtIndex(length: number, index: number): void;

	/**
	 * @since 13.0
	 */
	setRenderPipelineState(pipelineState: MTLRenderPipelineState): void;

	setVertexBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setVertexBufferOffsetAttributeStrideAtIndex(buffer: MTLBuffer, offset: number, stride: number, index: number): void;
}
declare var MTLIndirectRenderCommand: {

	prototype: MTLIndirectRenderCommand;
};

/**
 * @since 14.0
 */
declare class MTLInstanceAccelerationStructureDescriptor extends MTLAccelerationStructureDescriptor {

	static alloc(): MTLInstanceAccelerationStructureDescriptor; // inherited from NSObject

	static descriptor(): MTLInstanceAccelerationStructureDescriptor;

	static new(): MTLInstanceAccelerationStructureDescriptor; // inherited from NSObject

	instanceCount: number;

	instanceDescriptorBuffer: MTLBuffer;

	instanceDescriptorBufferOffset: number;

	instanceDescriptorStride: number;

	/**
	 * @since 15.0
	 */
	instanceDescriptorType: MTLAccelerationStructureInstanceDescriptorType;

	/**
	 * @since 18.0
	 */
	instanceTransformationMatrixLayout: MTLMatrixLayout;

	instancedAccelerationStructures: NSArray<MTLAccelerationStructure>;

	/**
	 * @since 15.0
	 */
	motionTransformBuffer: MTLBuffer;

	/**
	 * @since 15.0
	 */
	motionTransformBufferOffset: number;

	/**
	 * @since 15.0
	 */
	motionTransformCount: number;

	/**
	 * @since 18.0
	 */
	motionTransformStride: number;

	/**
	 * @since 18.0
	 */
	motionTransformType: MTLTransformType;
}

/**
 * @since 14.0
 */
declare class MTLIntersectionFunctionDescriptor extends MTLFunctionDescriptor implements NSCopying {

	static alloc(): MTLIntersectionFunctionDescriptor; // inherited from NSObject

	static new(): MTLIntersectionFunctionDescriptor; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare const enum MTLIntersectionFunctionSignature {

	None = 0,

	Instancing = 1,

	TriangleData = 2,

	WorldSpaceData = 4,

	InstanceMotion = 8,

	PrimitiveMotion = 16,

	ExtendedLimits = 32,

	MaxLevels = 64,

	CurveData = 128
}

/**
 * @since 14.0
 */
interface MTLIntersectionFunctionTable extends MTLResource {

	/**
	 * @since 16.0
	 */
	gpuResourceID: MTLResourceID;

	setBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	setBuffersOffsetsWithRange(buffers: interop.Reference<MTLBuffer>, offsets: interop.Reference<number>, range: NSRange): void;

	setFunctionAtIndex(_function: MTLFunctionHandle, index: number): void;

	setFunctionsWithRange(functions: interop.Reference<MTLFunctionHandle>, range: NSRange): void;

	setOpaqueCurveIntersectionFunctionWithSignatureAtIndex(signature: MTLIntersectionFunctionSignature, index: number): void;

	setOpaqueCurveIntersectionFunctionWithSignatureWithRange(signature: MTLIntersectionFunctionSignature, range: NSRange): void;

	setOpaqueTriangleIntersectionFunctionWithSignatureAtIndex(signature: MTLIntersectionFunctionSignature, index: number): void;

	setOpaqueTriangleIntersectionFunctionWithSignatureWithRange(signature: MTLIntersectionFunctionSignature, range: NSRange): void;

	setVisibleFunctionTableAtBufferIndex(functionTable: MTLVisibleFunctionTable, bufferIndex: number): void;

	setVisibleFunctionTablesWithBufferRange(functionTables: interop.Reference<MTLVisibleFunctionTable>, bufferRange: NSRange): void;
}
declare var MTLIntersectionFunctionTable: {

	prototype: MTLIntersectionFunctionTable;
};

/**
 * @since 14.0
 */
declare class MTLIntersectionFunctionTableDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLIntersectionFunctionTableDescriptor; // inherited from NSObject

	static intersectionFunctionTableDescriptor(): MTLIntersectionFunctionTableDescriptor;

	static new(): MTLIntersectionFunctionTableDescriptor; // inherited from NSObject

	functionCount: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 9.0
 */
declare const enum MTLLanguageVersion {

	Version1_0 = 65536,

	Version1_1 = 65537,

	Version1_2 = 65538,

	Version2_0 = 131072,

	Version2_1 = 131073,

	Version2_2 = 131074,

	Version2_3 = 131075,

	Version2_4 = 131076,

	Version3_0 = 196608,

	Version3_1 = 196609,

	Version3_2 = 196610
}

/**
 * @since 8.0
 */
interface MTLLibrary extends NSObjectProtocol {

	device: MTLDevice;

	functionNames: NSArray<string>;

	/**
	 * @since 14.0
	 */
	installName: string;

	label: string;

	/**
	 * @since 14.0
	 */
	type: MTLLibraryType;

	/**
	 * @since 14.0
	 */
	newFunctionWithDescriptorCompletionHandler(descriptor: MTLFunctionDescriptor, completionHandler: (p1: MTLFunction, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	newFunctionWithDescriptorError(descriptor: MTLFunctionDescriptor): MTLFunction;

	newFunctionWithName(functionName: string): MTLFunction;

	/**
	 * @since 10.0
	 */
	newFunctionWithNameConstantValuesCompletionHandler(name: string, constantValues: MTLFunctionConstantValues, completionHandler: (p1: MTLFunction, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	newFunctionWithNameConstantValuesError(name: string, constantValues: MTLFunctionConstantValues): MTLFunction;

	/**
	 * @since 14.0
	 */
	newIntersectionFunctionWithDescriptorCompletionHandler(descriptor: MTLIntersectionFunctionDescriptor, completionHandler: (p1: MTLFunction, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	newIntersectionFunctionWithDescriptorError(descriptor: MTLIntersectionFunctionDescriptor): MTLFunction;
}
declare var MTLLibrary: {

	prototype: MTLLibrary;
};

/**
 * @since 8.0
 */
declare const enum MTLLibraryError {

	Unsupported = 1,

	Internal = 2,

	CompileFailure = 3,

	CompileWarning = 4,

	FunctionNotFound = 5,

	FileNotFound = 6
}

/**
 * @since 8.0
 */
declare var MTLLibraryErrorDomain: string;

/**
 * @since 16.0
 */
declare const enum MTLLibraryOptimizationLevel {

	Default = 0,

	Size = 1
}

/**
 * @since 14.0
 */
declare const enum MTLLibraryType {

	Executable = 0,

	Dynamic = 1
}

/**
 * @since 14.0
 */
declare class MTLLinkedFunctions extends NSObject implements NSCopying {

	static alloc(): MTLLinkedFunctions; // inherited from NSObject

	static linkedFunctions(): MTLLinkedFunctions;

	static new(): MTLLinkedFunctions; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	binaryFunctions: NSArray<MTLFunction>;

	functions: NSArray<MTLFunction>;

	groups: NSDictionary<string, NSArray<MTLFunction>>;

	/**
	 * @since 15.0
	 */
	privateFunctions: NSArray<MTLFunction>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare const enum MTLLoadAction {

	DontCare = 0,

	Load = 1,

	Clear = 2
}

/**
 * @since 14.0
 */
interface MTLLogContainer extends NSFastEnumeration, NSObjectProtocol {
}
declare var MTLLogContainer: {

	prototype: MTLLogContainer;
};

/**
 * @since 18.0
 */
declare const enum MTLLogLevel {

	Undefined = 0,

	Debug = 1,

	Info = 2,

	Notice = 3,

	Error = 4,

	Fault = 5
}

/**
 * @since 18.0
 */
interface MTLLogState extends NSObjectProtocol {

	addLogHandler(block: (p1: string, p2: string, p3: MTLLogLevel, p4: string) => void): void;
}
declare var MTLLogState: {

	prototype: MTLLogState;
};

/**
 * @since 18.0
 */
declare class MTLLogStateDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLLogStateDescriptor; // inherited from NSObject

	static new(): MTLLogStateDescriptor; // inherited from NSObject

	bufferSize: number;

	level: MTLLogLevel;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 18.0
 */
declare const enum MTLLogStateError {

	InvalidSize = 1,

	Invalid = 2
}

/**
 * @since 18.0
 */
declare var MTLLogStateErrorDomain: string;

interface MTLMapIndirectArguments {
	regionOriginX: number;
	regionOriginY: number;
	regionOriginZ: number;
	regionSizeWidth: number;
	regionSizeHeight: number;
	regionSizeDepth: number;
	mipMapLevel: number;
	sliceId: number;
}
declare var MTLMapIndirectArguments: interop.StructType<MTLMapIndirectArguments>;

declare const enum MTLMathFloatingPointFunctions {

	Fast = 0,

	Precise = 1
}

declare const enum MTLMathMode {

	Safe = 0,

	Relaxed = 1,

	Fast = 2
}

/**
 * @since 18.0
 */
declare const enum MTLMatrixLayout {

	ColumnMajor = 0,

	RowMajor = 1
}

/**
 * @since 16.0
 */
declare class MTLMeshRenderPipelineDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLMeshRenderPipelineDescriptor; // inherited from NSObject

	static new(): MTLMeshRenderPipelineDescriptor; // inherited from NSObject

	alphaToCoverageEnabled: boolean;

	alphaToOneEnabled: boolean;

	/**
	 * @since 18.0
	 */
	binaryArchives: NSArray<MTLBinaryArchive>;

	readonly colorAttachments: MTLRenderPipelineColorAttachmentDescriptorArray;

	depthAttachmentPixelFormat: MTLPixelFormat;

	readonly fragmentBuffers: MTLPipelineBufferDescriptorArray;

	fragmentFunction: MTLFunction;

	/**
	 * @since 17.0
	 */
	fragmentLinkedFunctions: MTLLinkedFunctions;

	label: string;

	maxTotalThreadgroupsPerMeshGrid: number;

	maxTotalThreadsPerMeshThreadgroup: number;

	maxTotalThreadsPerObjectThreadgroup: number;

	maxVertexAmplificationCount: number;

	readonly meshBuffers: MTLPipelineBufferDescriptorArray;

	meshFunction: MTLFunction;

	/**
	 * @since 17.0
	 */
	meshLinkedFunctions: MTLLinkedFunctions;

	meshThreadgroupSizeIsMultipleOfThreadExecutionWidth: boolean;

	readonly objectBuffers: MTLPipelineBufferDescriptorArray;

	objectFunction: MTLFunction;

	/**
	 * @since 17.0
	 */
	objectLinkedFunctions: MTLLinkedFunctions;

	objectThreadgroupSizeIsMultipleOfThreadExecutionWidth: boolean;

	payloadMemoryLength: number;

	rasterSampleCount: number;

	rasterizationEnabled: boolean;

	/**
	 * @since 18.0
	 */
	shaderValidation: MTLShaderValidation;

	stencilAttachmentPixelFormat: MTLPixelFormat;

	/**
	 * @since 17.0
	 */
	supportIndirectCommandBuffers: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	reset(): void;
}

/**
 * @since 15.0
 */
declare const enum MTLMotionBorderMode {

	Clamp = 0,

	Vanish = 1
}

/**
 * @since 15.0
 */
declare class MTLMotionKeyframeData extends NSObject {

	static alloc(): MTLMotionKeyframeData; // inherited from NSObject

	static data(): MTLMotionKeyframeData;

	static new(): MTLMotionKeyframeData; // inherited from NSObject

	buffer: MTLBuffer;

	offset: number;
}

/**
 * @since 9.0
 */
declare const enum MTLMultisampleDepthResolveFilter {

	Sample0 = 0,

	Min = 1,

	Max = 2
}

/**
 * @since 12.0
 */
declare const enum MTLMultisampleStencilResolveFilter {

	Sample0 = 0,

	DepthResolvedSample = 1
}

/**
 * @since 11.0
 */
declare const enum MTLMutability {

	Default = 0,

	Mutable = 1,

	Immutable = 2
}

/**
 * @since 16.0
 */
interface MTLObjectPayloadBinding extends MTLBinding {

	objectPayloadAlignment: number;

	objectPayloadDataSize: number;
}
declare var MTLObjectPayloadBinding: {

	prototype: MTLObjectPayloadBinding;
};

interface MTLOrigin {
	x: number;
	y: number;
	z: number;
}
declare var MTLOrigin: interop.StructType<MTLOrigin>;

interface MTLPackedFloatQuaternion {
	x: number;
	y: number;
	z: number;
	w: number;
}
declare var MTLPackedFloatQuaternion: interop.StructType<MTLPackedFloatQuaternion>;

/**
 * @since 8.0
 */
interface MTLParallelRenderCommandEncoder extends MTLCommandEncoder {

	renderCommandEncoder(): MTLRenderCommandEncoder;

	/**
	 * @since 10.0
	 */
	setColorStoreActionAtIndex(storeAction: MTLStoreAction, colorAttachmentIndex: number): void;

	/**
	 * @since 11.0
	 */
	setColorStoreActionOptionsAtIndex(storeActionOptions: MTLStoreActionOptions, colorAttachmentIndex: number): void;

	/**
	 * @since 10.0
	 */
	setDepthStoreAction(storeAction: MTLStoreAction): void;

	/**
	 * @since 11.0
	 */
	setDepthStoreActionOptions(storeActionOptions: MTLStoreActionOptions): void;

	/**
	 * @since 10.0
	 */
	setStencilStoreAction(storeAction: MTLStoreAction): void;

	/**
	 * @since 11.0
	 */
	setStencilStoreActionOptions(storeActionOptions: MTLStoreActionOptions): void;
}
declare var MTLParallelRenderCommandEncoder: {

	prototype: MTLParallelRenderCommandEncoder;
};

/**
 * @since 10.0
 */
declare const enum MTLPatchType {

	None = 0,

	Triangle = 1,

	Quad = 2
}

/**
 * @since 11.0
 */
declare class MTLPipelineBufferDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLPipelineBufferDescriptor; // inherited from NSObject

	static new(): MTLPipelineBufferDescriptor; // inherited from NSObject

	mutability: MTLMutability;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
declare class MTLPipelineBufferDescriptorArray extends NSObject {

	static alloc(): MTLPipelineBufferDescriptorArray; // inherited from NSObject

	static new(): MTLPipelineBufferDescriptorArray; // inherited from NSObject
	[index: number]: MTLPipelineBufferDescriptor;

	objectAtIndexedSubscript(bufferIndex: number): MTLPipelineBufferDescriptor;

	setObjectAtIndexedSubscript(buffer: MTLPipelineBufferDescriptor, bufferIndex: number): void;
}

/**
 * @since 8.0
 */
declare const enum MTLPipelineOption {

	None = 0,

	ArgumentInfo = 1,

	BindingInfo = 1,

	BufferTypeInfo = 2,

	FailOnBinaryArchiveMiss = 4
}

/**
 * @since 8.0
 */
declare const enum MTLPixelFormat {

	Invalid = 0,

	A8Unorm = 1,

	R8Unorm = 10,

	R8Unorm_sRGB = 11,

	R8Snorm = 12,

	R8Uint = 13,

	R8Sint = 14,

	R16Unorm = 20,

	R16Snorm = 22,

	R16Uint = 23,

	R16Sint = 24,

	R16Float = 25,

	RG8Unorm = 30,

	RG8Unorm_sRGB = 31,

	RG8Snorm = 32,

	RG8Uint = 33,

	RG8Sint = 34,

	B5G6R5Unorm = 40,

	A1BGR5Unorm = 41,

	ABGR4Unorm = 42,

	BGR5A1Unorm = 43,

	R32Uint = 53,

	R32Sint = 54,

	R32Float = 55,

	RG16Unorm = 60,

	RG16Snorm = 62,

	RG16Uint = 63,

	RG16Sint = 64,

	RG16Float = 65,

	RGBA8Unorm = 70,

	RGBA8Unorm_sRGB = 71,

	RGBA8Snorm = 72,

	RGBA8Uint = 73,

	RGBA8Sint = 74,

	BGRA8Unorm = 80,

	BGRA8Unorm_sRGB = 81,

	RGB10A2Unorm = 90,

	RGB10A2Uint = 91,

	RG11B10Float = 92,

	RGB9E5Float = 93,

	BGR10A2Unorm = 94,

	BGR10_XR = 554,

	BGR10_XR_sRGB = 555,

	RG32Uint = 103,

	RG32Sint = 104,

	RG32Float = 105,

	RGBA16Unorm = 110,

	RGBA16Snorm = 112,

	RGBA16Uint = 113,

	RGBA16Sint = 114,

	RGBA16Float = 115,

	BGRA10_XR = 552,

	BGRA10_XR_sRGB = 553,

	RGBA32Uint = 123,

	RGBA32Sint = 124,

	RGBA32Float = 125,

	BC1_RGBA = 130,

	BC1_RGBA_sRGB = 131,

	BC2_RGBA = 132,

	BC2_RGBA_sRGB = 133,

	BC3_RGBA = 134,

	BC3_RGBA_sRGB = 135,

	BC4_RUnorm = 140,

	BC4_RSnorm = 141,

	BC5_RGUnorm = 142,

	BC5_RGSnorm = 143,

	BC6H_RGBFloat = 150,

	BC6H_RGBUfloat = 151,

	BC7_RGBAUnorm = 152,

	BC7_RGBAUnorm_sRGB = 153,

	PVRTC_RGB_2BPP = 160,

	PVRTC_RGB_2BPP_sRGB = 161,

	PVRTC_RGB_4BPP = 162,

	PVRTC_RGB_4BPP_sRGB = 163,

	PVRTC_RGBA_2BPP = 164,

	PVRTC_RGBA_2BPP_sRGB = 165,

	PVRTC_RGBA_4BPP = 166,

	PVRTC_RGBA_4BPP_sRGB = 167,

	EAC_R11Unorm = 170,

	EAC_R11Snorm = 172,

	EAC_RG11Unorm = 174,

	EAC_RG11Snorm = 176,

	EAC_RGBA8 = 178,

	EAC_RGBA8_sRGB = 179,

	ETC2_RGB8 = 180,

	ETC2_RGB8_sRGB = 181,

	ETC2_RGB8A1 = 182,

	ETC2_RGB8A1_sRGB = 183,

	ASTC_4x4_sRGB = 186,

	ASTC_5x4_sRGB = 187,

	ASTC_5x5_sRGB = 188,

	ASTC_6x5_sRGB = 189,

	ASTC_6x6_sRGB = 190,

	ASTC_8x5_sRGB = 192,

	ASTC_8x6_sRGB = 193,

	ASTC_8x8_sRGB = 194,

	ASTC_10x5_sRGB = 195,

	ASTC_10x6_sRGB = 196,

	ASTC_10x8_sRGB = 197,

	ASTC_10x10_sRGB = 198,

	ASTC_12x10_sRGB = 199,

	ASTC_12x12_sRGB = 200,

	ASTC_4x4_LDR = 204,

	ASTC_5x4_LDR = 205,

	ASTC_5x5_LDR = 206,

	ASTC_6x5_LDR = 207,

	ASTC_6x6_LDR = 208,

	ASTC_8x5_LDR = 210,

	ASTC_8x6_LDR = 211,

	ASTC_8x8_LDR = 212,

	ASTC_10x5_LDR = 213,

	ASTC_10x6_LDR = 214,

	ASTC_10x8_LDR = 215,

	ASTC_10x10_LDR = 216,

	ASTC_12x10_LDR = 217,

	ASTC_12x12_LDR = 218,

	ASTC_4x4_HDR = 222,

	ASTC_5x4_HDR = 223,

	ASTC_5x5_HDR = 224,

	ASTC_6x5_HDR = 225,

	ASTC_6x6_HDR = 226,

	ASTC_8x5_HDR = 228,

	ASTC_8x6_HDR = 229,

	ASTC_8x8_HDR = 230,

	ASTC_10x5_HDR = 231,

	ASTC_10x6_HDR = 232,

	ASTC_10x8_HDR = 233,

	ASTC_10x10_HDR = 234,

	ASTC_12x10_HDR = 235,

	ASTC_12x12_HDR = 236,

	GBGR422 = 240,

	BGRG422 = 241,

	Depth16Unorm = 250,

	Depth32Float = 252,

	Stencil8 = 253,

	Depth24Unorm_Stencil8 = 255,

	Depth32Float_Stencil8 = 260,

	X32_Stencil8 = 261,

	X24_Stencil8 = 262
}

/**
 * @since 11.0
 */
declare class MTLPointerType extends MTLType {

	static alloc(): MTLPointerType; // inherited from NSObject

	static new(): MTLPointerType; // inherited from NSObject

	readonly access: MTLBindingAccess;

	readonly alignment: number;

	readonly dataSize: number;

	/**
	 * @since 11.0
	 */
	readonly elementIsArgumentBuffer: boolean;

	readonly elementType: MTLDataType;

	/**
	 * @since 11.0
	 */
	elementArrayType(): MTLArrayType;

	/**
	 * @since 11.0
	 */
	elementStructType(): MTLStructType;
}

/**
 * @since 14.0
 */
declare class MTLPrimitiveAccelerationStructureDescriptor extends MTLAccelerationStructureDescriptor {

	static alloc(): MTLPrimitiveAccelerationStructureDescriptor; // inherited from NSObject

	static descriptor(): MTLPrimitiveAccelerationStructureDescriptor;

	static new(): MTLPrimitiveAccelerationStructureDescriptor; // inherited from NSObject

	geometryDescriptors: NSArray<MTLAccelerationStructureGeometryDescriptor>;

	/**
	 * @since 15.0
	 */
	motionEndBorderMode: MTLMotionBorderMode;

	/**
	 * @since 15.0
	 */
	motionEndTime: number;

	/**
	 * @since 15.0
	 */
	motionKeyframeCount: number;

	/**
	 * @since 15.0
	 */
	motionStartBorderMode: MTLMotionBorderMode;

	/**
	 * @since 15.0
	 */
	motionStartTime: number;
}

/**
 * @since 12.0
 */
declare const enum MTLPrimitiveTopologyClass {

	Unspecified = 0,

	Point = 1,

	Line = 2,

	Triangle = 3
}

/**
 * @since 8.0
 */
declare const enum MTLPrimitiveType {

	Point = 0,

	Line = 1,

	LineStrip = 2,

	Triangle = 3,

	TriangleStrip = 4
}

/**
 * @since 8.0
 */
declare const enum MTLPurgeableState {

	KeepCurrent = 1,

	NonVolatile = 2,

	Volatile = 3,

	Empty = 4
}

interface MTLQuadTessellationFactorsHalf {
	edgeTessellationFactor: interop.Reference<number>;
	insideTessellationFactor: interop.Reference<number>;
}
declare var MTLQuadTessellationFactorsHalf: interop.StructType<MTLQuadTessellationFactorsHalf>;

/**
 * @since 13.0
 */
declare class MTLRasterizationRateLayerArray extends NSObject {

	static alloc(): MTLRasterizationRateLayerArray; // inherited from NSObject

	static new(): MTLRasterizationRateLayerArray; // inherited from NSObject
	[index: number]: MTLRasterizationRateLayerDescriptor;

	objectAtIndexedSubscript(layerIndex: number): MTLRasterizationRateLayerDescriptor;

	setObjectAtIndexedSubscript(layer: MTLRasterizationRateLayerDescriptor, layerIndex: number): void;
}

/**
 * @since 13.0
 */
declare class MTLRasterizationRateLayerDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLRasterizationRateLayerDescriptor; // inherited from NSObject

	static new(): MTLRasterizationRateLayerDescriptor; // inherited from NSObject

	readonly horizontal: MTLRasterizationRateSampleArray;

	readonly horizontalSampleStorage: interop.Pointer | interop.Reference<number>;

	/**
	 * @since 15.0
	 */
	readonly maxSampleCount: MTLSize;

	/**
	 * @since 15.0
	 */
	sampleCount: MTLSize;

	readonly vertical: MTLRasterizationRateSampleArray;

	readonly verticalSampleStorage: interop.Pointer | interop.Reference<number>;

	constructor(o: { sampleCount: MTLSize; });

	constructor(o: { sampleCount: MTLSize; horizontal: interop.Pointer | interop.Reference<number>; vertical: interop.Pointer | interop.Reference<number>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithSampleCount(sampleCount: MTLSize): this;

	initWithSampleCountHorizontalVertical(sampleCount: MTLSize, horizontal: interop.Pointer | interop.Reference<number>, vertical: interop.Pointer | interop.Reference<number>): this;
}

/**
 * @since 13.0
 */
interface MTLRasterizationRateMap extends NSObjectProtocol {

	device: MTLDevice;

	label: string;

	layerCount: number;

	parameterBufferSizeAndAlign: MTLSizeAndAlign;

	physicalGranularity: MTLSize;

	screenSize: MTLSize;

	copyParameterDataToBufferOffset(buffer: MTLBuffer, offset: number): void;

	mapPhysicalToScreenCoordinatesForLayer(physicalCoordinates: MTLSamplePosition, layerIndex: number): MTLSamplePosition;

	mapScreenToPhysicalCoordinatesForLayer(screenCoordinates: MTLSamplePosition, layerIndex: number): MTLSamplePosition;

	physicalSizeForLayer(layerIndex: number): MTLSize;
}
declare var MTLRasterizationRateMap: {

	prototype: MTLRasterizationRateMap;
};

/**
 * @since 13.0
 */
declare class MTLRasterizationRateMapDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLRasterizationRateMapDescriptor; // inherited from NSObject

	static new(): MTLRasterizationRateMapDescriptor; // inherited from NSObject

	static rasterizationRateMapDescriptorWithScreenSize(screenSize: MTLSize): MTLRasterizationRateMapDescriptor;

	static rasterizationRateMapDescriptorWithScreenSizeLayer(screenSize: MTLSize, layer: MTLRasterizationRateLayerDescriptor): MTLRasterizationRateMapDescriptor;

	static rasterizationRateMapDescriptorWithScreenSizeLayerCountLayers(screenSize: MTLSize, layerCount: number, layers: interop.Pointer | interop.Reference<MTLRasterizationRateLayerDescriptor>): MTLRasterizationRateMapDescriptor;

	label: string;

	readonly layerCount: number;

	readonly layers: MTLRasterizationRateLayerArray;

	screenSize: MTLSize;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	layerAtIndex(layerIndex: number): MTLRasterizationRateLayerDescriptor;

	setLayerAtIndex(layer: MTLRasterizationRateLayerDescriptor, layerIndex: number): void;
}

/**
 * @since 13.0
 */
declare class MTLRasterizationRateSampleArray extends NSObject {

	static alloc(): MTLRasterizationRateSampleArray; // inherited from NSObject

	static new(): MTLRasterizationRateSampleArray; // inherited from NSObject
	[index: number]: number;

	objectAtIndexedSubscript(index: number): number;

	setObjectAtIndexedSubscript(value: number, index: number): void;
}

/**
 * @since 11.0
 */
declare const enum MTLReadWriteTextureTier {

	TierNone = 0,

	Tier1 = 1,

	Tier2 = 2
}

interface MTLRegion {
	origin: MTLOrigin;
	size: MTLSize;
}
declare var MTLRegion: interop.StructType<MTLRegion>;

/**
 * @since 8.0
 */
interface MTLRenderCommandEncoder extends MTLCommandEncoder {

	/**
	 * @since 11.0
	 */
	tileHeight: number;

	/**
	 * @since 11.0
	 */
	tileWidth: number;

	/**
	 * @since 11.0
	 */
	dispatchThreadsPerTile(threadsPerTile: MTLSize): void;

	/**
	 * @since 12.0
	 */
	drawIndexedPatchesPatchIndexBufferPatchIndexBufferOffsetControlPointIndexBufferControlPointIndexBufferOffsetIndirectBufferIndirectBufferOffset(numberOfPatchControlPoints: number, patchIndexBuffer: MTLBuffer, patchIndexBufferOffset: number, controlPointIndexBuffer: MTLBuffer, controlPointIndexBufferOffset: number, indirectBuffer: MTLBuffer, indirectBufferOffset: number): void;

	/**
	 * @since 10.0
	 */
	drawIndexedPatchesPatchStartPatchCountPatchIndexBufferPatchIndexBufferOffsetControlPointIndexBufferControlPointIndexBufferOffsetInstanceCountBaseInstance(numberOfPatchControlPoints: number, patchStart: number, patchCount: number, patchIndexBuffer: MTLBuffer, patchIndexBufferOffset: number, controlPointIndexBuffer: MTLBuffer, controlPointIndexBufferOffset: number, instanceCount: number, baseInstance: number): void;

	drawIndexedPrimitivesIndexCountIndexTypeIndexBufferIndexBufferOffset(primitiveType: MTLPrimitiveType, indexCount: number, indexType: MTLIndexType, indexBuffer: MTLBuffer, indexBufferOffset: number): void;

	drawIndexedPrimitivesIndexCountIndexTypeIndexBufferIndexBufferOffsetInstanceCount(primitiveType: MTLPrimitiveType, indexCount: number, indexType: MTLIndexType, indexBuffer: MTLBuffer, indexBufferOffset: number, instanceCount: number): void;

	/**
	 * @since 9.0
	 */
	drawIndexedPrimitivesIndexCountIndexTypeIndexBufferIndexBufferOffsetInstanceCountBaseVertexBaseInstance(primitiveType: MTLPrimitiveType, indexCount: number, indexType: MTLIndexType, indexBuffer: MTLBuffer, indexBufferOffset: number, instanceCount: number, baseVertex: number, baseInstance: number): void;

	/**
	 * @since 9.0
	 */
	drawIndexedPrimitivesIndexTypeIndexBufferIndexBufferOffsetIndirectBufferIndirectBufferOffset(primitiveType: MTLPrimitiveType, indexType: MTLIndexType, indexBuffer: MTLBuffer, indexBufferOffset: number, indirectBuffer: MTLBuffer, indirectBufferOffset: number): void;

	/**
	 * @since 16.0
	 */
	drawMeshThreadgroupsThreadsPerObjectThreadgroupThreadsPerMeshThreadgroup(threadgroupsPerGrid: MTLSize, threadsPerObjectThreadgroup: MTLSize, threadsPerMeshThreadgroup: MTLSize): void;

	/**
	 * @since 16.0
	 */
	drawMeshThreadgroupsWithIndirectBufferIndirectBufferOffsetThreadsPerObjectThreadgroupThreadsPerMeshThreadgroup(indirectBuffer: MTLBuffer, indirectBufferOffset: number, threadsPerObjectThreadgroup: MTLSize, threadsPerMeshThreadgroup: MTLSize): void;

	/**
	 * @since 16.0
	 */
	drawMeshThreadsThreadsPerObjectThreadgroupThreadsPerMeshThreadgroup(threadsPerGrid: MTLSize, threadsPerObjectThreadgroup: MTLSize, threadsPerMeshThreadgroup: MTLSize): void;

	/**
	 * @since 12.0
	 */
	drawPatchesPatchIndexBufferPatchIndexBufferOffsetIndirectBufferIndirectBufferOffset(numberOfPatchControlPoints: number, patchIndexBuffer: MTLBuffer, patchIndexBufferOffset: number, indirectBuffer: MTLBuffer, indirectBufferOffset: number): void;

	/**
	 * @since 10.0
	 */
	drawPatchesPatchStartPatchCountPatchIndexBufferPatchIndexBufferOffsetInstanceCountBaseInstance(numberOfPatchControlPoints: number, patchStart: number, patchCount: number, patchIndexBuffer: MTLBuffer, patchIndexBufferOffset: number, instanceCount: number, baseInstance: number): void;

	/**
	 * @since 9.0
	 */
	drawPrimitivesIndirectBufferIndirectBufferOffset(primitiveType: MTLPrimitiveType, indirectBuffer: MTLBuffer, indirectBufferOffset: number): void;

	drawPrimitivesVertexStartVertexCount(primitiveType: MTLPrimitiveType, vertexStart: number, vertexCount: number): void;

	drawPrimitivesVertexStartVertexCountInstanceCount(primitiveType: MTLPrimitiveType, vertexStart: number, vertexCount: number, instanceCount: number): void;

	/**
	 * @since 9.0
	 */
	drawPrimitivesVertexStartVertexCountInstanceCountBaseInstance(primitiveType: MTLPrimitiveType, vertexStart: number, vertexCount: number, instanceCount: number, baseInstance: number): void;

	/**
	 * @since 13.0
	 */
	executeCommandsInBufferIndirectBufferIndirectBufferOffset(indirectCommandbuffer: MTLIndirectCommandBuffer, indirectRangeBuffer: MTLBuffer, indirectBufferOffset: number): void;

	/**
	 * @since 12.0
	 */
	executeCommandsInBufferWithRange(indirectCommandBuffer: MTLIndirectCommandBuffer, executionRange: NSRange): void;

	/**
	 * @since 16.0
	 */
	memoryBarrierWithResourcesCountAfterStagesBeforeStages(resources: interop.Reference<MTLResource>, count: number, after: MTLRenderStages, before: MTLRenderStages): void;

	/**
	 * @since 16.0
	 */
	memoryBarrierWithScopeAfterStagesBeforeStages(scope: MTLBarrierScope, after: MTLRenderStages, before: MTLRenderStages): void;

	/**
	 * @since 14.0
	 */
	sampleCountersInBufferAtSampleIndexWithBarrier(sampleBuffer: MTLCounterSampleBuffer, sampleIndex: number, barrier: boolean): void;

	setBlendColorRedGreenBlueAlpha(red: number, green: number, blue: number, alpha: number): void;

	/**
	 * @since 10.0
	 */
	setColorStoreActionAtIndex(storeAction: MTLStoreAction, colorAttachmentIndex: number): void;

	/**
	 * @since 11.0
	 */
	setColorStoreActionOptionsAtIndex(storeActionOptions: MTLStoreActionOptions, colorAttachmentIndex: number): void;

	setCullMode(cullMode: MTLCullMode): void;

	setDepthBiasSlopeScaleClamp(depthBias: number, slopeScale: number, clamp: number): void;

	/**
	 * @since 11.0
	 */
	setDepthClipMode(depthClipMode: MTLDepthClipMode): void;

	setDepthStencilState(depthStencilState: MTLDepthStencilState): void;

	/**
	 * @since 10.0
	 */
	setDepthStoreAction(storeAction: MTLStoreAction): void;

	/**
	 * @since 11.0
	 */
	setDepthStoreActionOptions(storeActionOptions: MTLStoreActionOptions): void;

	/**
	 * @since 15.0
	 */
	setFragmentAccelerationStructureAtBufferIndex(accelerationStructure: MTLAccelerationStructure, bufferIndex: number): void;

	setFragmentBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 8.3
	 */
	setFragmentBufferOffsetAtIndex(offset: number, index: number): void;

	setFragmentBuffersOffsetsWithRange(buffers: interop.Reference<MTLBuffer>, offsets: interop.Reference<number>, range: NSRange): void;

	/**
	 * @since 8.3
	 */
	setFragmentBytesLengthAtIndex(bytes: interop.Pointer | interop.Reference<any>, length: number, index: number): void;

	/**
	 * @since 15.0
	 */
	setFragmentIntersectionFunctionTableAtBufferIndex(intersectionFunctionTable: MTLIntersectionFunctionTable, bufferIndex: number): void;

	/**
	 * @since 15.0
	 */
	setFragmentIntersectionFunctionTablesWithBufferRange(intersectionFunctionTables: interop.Reference<MTLIntersectionFunctionTable>, range: NSRange): void;

	setFragmentSamplerStateAtIndex(sampler: MTLSamplerState, index: number): void;

	setFragmentSamplerStateLodMinClampLodMaxClampAtIndex(sampler: MTLSamplerState, lodMinClamp: number, lodMaxClamp: number, index: number): void;

	setFragmentSamplerStatesLodMinClampsLodMaxClampsWithRange(samplers: interop.Reference<MTLSamplerState>, lodMinClamps: interop.Reference<number>, lodMaxClamps: interop.Reference<number>, range: NSRange): void;

	setFragmentSamplerStatesWithRange(samplers: interop.Reference<MTLSamplerState>, range: NSRange): void;

	setFragmentTextureAtIndex(texture: MTLTexture, index: number): void;

	setFragmentTexturesWithRange(textures: interop.Reference<MTLTexture>, range: NSRange): void;

	/**
	 * @since 15.0
	 */
	setFragmentVisibleFunctionTableAtBufferIndex(functionTable: MTLVisibleFunctionTable, bufferIndex: number): void;

	/**
	 * @since 15.0
	 */
	setFragmentVisibleFunctionTablesWithBufferRange(functionTables: interop.Reference<MTLVisibleFunctionTable>, range: NSRange): void;

	setFrontFacingWinding(frontFacingWinding: MTLWinding): void;

	/**
	 * @since 16.0
	 */
	setMeshBufferOffsetAtIndex(offset: number, index: number): void;

	/**
	 * @since 16.0
	 */
	setMeshBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 16.0
	 */
	setMeshBuffersOffsetsWithRange(buffers: interop.Reference<MTLBuffer>, offsets: interop.Reference<number>, range: NSRange): void;

	/**
	 * @since 16.0
	 */
	setMeshBytesLengthAtIndex(bytes: interop.Pointer | interop.Reference<any>, length: number, index: number): void;

	/**
	 * @since 16.0
	 */
	setMeshSamplerStateAtIndex(sampler: MTLSamplerState, index: number): void;

	/**
	 * @since 16.0
	 */
	setMeshSamplerStateLodMinClampLodMaxClampAtIndex(sampler: MTLSamplerState, lodMinClamp: number, lodMaxClamp: number, index: number): void;

	/**
	 * @since 16.0
	 */
	setMeshSamplerStatesLodMinClampsLodMaxClampsWithRange(samplers: interop.Reference<MTLSamplerState>, lodMinClamps: interop.Reference<number>, lodMaxClamps: interop.Reference<number>, range: NSRange): void;

	/**
	 * @since 16.0
	 */
	setMeshSamplerStatesWithRange(samplers: interop.Reference<MTLSamplerState>, range: NSRange): void;

	/**
	 * @since 16.0
	 */
	setMeshTextureAtIndex(texture: MTLTexture, index: number): void;

	/**
	 * @since 16.0
	 */
	setMeshTexturesWithRange(textures: interop.Reference<MTLTexture>, range: NSRange): void;

	/**
	 * @since 16.0
	 */
	setObjectBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 16.0
	 */
	setObjectBufferOffsetAtIndex(offset: number, index: number): void;

	/**
	 * @since 16.0
	 */
	setObjectBuffersOffsetsWithRange(buffers: interop.Reference<MTLBuffer>, offsets: interop.Reference<number>, range: NSRange): void;

	/**
	 * @since 16.0
	 */
	setObjectBytesLengthAtIndex(bytes: interop.Pointer | interop.Reference<any>, length: number, index: number): void;

	/**
	 * @since 16.0
	 */
	setObjectSamplerStateAtIndex(sampler: MTLSamplerState, index: number): void;

	/**
	 * @since 16.0
	 */
	setObjectSamplerStateLodMinClampLodMaxClampAtIndex(sampler: MTLSamplerState, lodMinClamp: number, lodMaxClamp: number, index: number): void;

	/**
	 * @since 16.0
	 */
	setObjectSamplerStatesLodMinClampsLodMaxClampsWithRange(samplers: interop.Reference<MTLSamplerState>, lodMinClamps: interop.Reference<number>, lodMaxClamps: interop.Reference<number>, range: NSRange): void;

	/**
	 * @since 16.0
	 */
	setObjectSamplerStatesWithRange(samplers: interop.Reference<MTLSamplerState>, range: NSRange): void;

	/**
	 * @since 16.0
	 */
	setObjectTextureAtIndex(texture: MTLTexture, index: number): void;

	/**
	 * @since 16.0
	 */
	setObjectTexturesWithRange(textures: interop.Reference<MTLTexture>, range: NSRange): void;

	/**
	 * @since 16.0
	 */
	setObjectThreadgroupMemoryLengthAtIndex(length: number, index: number): void;

	setRenderPipelineState(pipelineState: MTLRenderPipelineState): void;

	setScissorRect(rect: MTLScissorRect): void;

	/**
	 * @since 12.0
	 */
	setScissorRectsCount(scissorRects: interop.Reference<MTLScissorRect>, count: number): void;

	/**
	 * @since 9.0
	 */
	setStencilFrontReferenceValueBackReferenceValue(frontReferenceValue: number, backReferenceValue: number): void;

	setStencilReferenceValue(referenceValue: number): void;

	/**
	 * @since 10.0
	 */
	setStencilStoreAction(storeAction: MTLStoreAction): void;

	/**
	 * @since 11.0
	 */
	setStencilStoreActionOptions(storeActionOptions: MTLStoreActionOptions): void;

	/**
	 * @since 10.0
	 */
	setTessellationFactorBufferOffsetInstanceStride(buffer: MTLBuffer, offset: number, instanceStride: number): void;

	/**
	 * @since 10.0
	 */
	setTessellationFactorScale(scale: number): void;

	/**
	 * @since 11.0
	 */
	setThreadgroupMemoryLengthOffsetAtIndex(length: number, offset: number, index: number): void;

	/**
	 * @since 15.0
	 */
	setTileAccelerationStructureAtBufferIndex(accelerationStructure: MTLAccelerationStructure, bufferIndex: number): void;

	/**
	 * @since 11.0
	 */
	setTileBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 11.0
	 */
	setTileBufferOffsetAtIndex(offset: number, index: number): void;

	/**
	 * @since 11.0
	 */
	setTileBuffersOffsetsWithRange(buffers: interop.Reference<MTLBuffer>, offsets: interop.Reference<number>, range: NSRange): void;

	/**
	 * @since 11.0
	 */
	setTileBytesLengthAtIndex(bytes: interop.Pointer | interop.Reference<any>, length: number, index: number): void;

	/**
	 * @since 15.0
	 */
	setTileIntersectionFunctionTableAtBufferIndex(intersectionFunctionTable: MTLIntersectionFunctionTable, bufferIndex: number): void;

	/**
	 * @since 15.0
	 */
	setTileIntersectionFunctionTablesWithBufferRange(intersectionFunctionTables: interop.Reference<MTLIntersectionFunctionTable>, range: NSRange): void;

	/**
	 * @since 11.0
	 */
	setTileSamplerStateAtIndex(sampler: MTLSamplerState, index: number): void;

	/**
	 * @since 11.0
	 */
	setTileSamplerStateLodMinClampLodMaxClampAtIndex(sampler: MTLSamplerState, lodMinClamp: number, lodMaxClamp: number, index: number): void;

	/**
	 * @since 11.0
	 */
	setTileSamplerStatesLodMinClampsLodMaxClampsWithRange(samplers: interop.Reference<MTLSamplerState>, lodMinClamps: interop.Reference<number>, lodMaxClamps: interop.Reference<number>, range: NSRange): void;

	/**
	 * @since 11.0
	 */
	setTileSamplerStatesWithRange(samplers: interop.Reference<MTLSamplerState>, range: NSRange): void;

	/**
	 * @since 11.0
	 */
	setTileTextureAtIndex(texture: MTLTexture, index: number): void;

	/**
	 * @since 11.0
	 */
	setTileTexturesWithRange(textures: interop.Reference<MTLTexture>, range: NSRange): void;

	/**
	 * @since 15.0
	 */
	setTileVisibleFunctionTableAtBufferIndex(functionTable: MTLVisibleFunctionTable, bufferIndex: number): void;

	/**
	 * @since 15.0
	 */
	setTileVisibleFunctionTablesWithBufferRange(functionTables: interop.Reference<MTLVisibleFunctionTable>, range: NSRange): void;

	setTriangleFillMode(fillMode: MTLTriangleFillMode): void;

	/**
	 * @since 15.0
	 */
	setVertexAccelerationStructureAtBufferIndex(accelerationStructure: MTLAccelerationStructure, bufferIndex: number): void;

	/**
	 * @since 13.0
	 */
	setVertexAmplificationCountViewMappings(count: number, viewMappings: interop.Pointer | interop.Reference<MTLVertexAmplificationViewMapping>): void;

	setVertexBufferOffsetAtIndex(buffer: MTLBuffer, offset: number, index: number): void;

	/**
	 * @since 8.3
	 */
	setVertexBufferOffsetAtIndex(offset: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setVertexBufferOffsetAttributeStrideAtIndex(buffer: MTLBuffer, offset: number, stride: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setVertexBufferOffsetAttributeStrideAtIndex(offset: number, stride: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setVertexBuffersOffsetsAttributeStridesWithRange(buffers: interop.Reference<MTLBuffer>, offsets: interop.Reference<number>, strides: interop.Reference<number>, range: NSRange): void;

	setVertexBuffersOffsetsWithRange(buffers: interop.Reference<MTLBuffer>, offsets: interop.Reference<number>, range: NSRange): void;

	/**
	 * @since 8.3
	 */
	setVertexBytesLengthAtIndex(bytes: interop.Pointer | interop.Reference<any>, length: number, index: number): void;

	/**
	 * @since 17.0
	 */
	setVertexBytesLengthAttributeStrideAtIndex(bytes: interop.Pointer | interop.Reference<any>, length: number, stride: number, index: number): void;

	/**
	 * @since 15.0
	 */
	setVertexIntersectionFunctionTableAtBufferIndex(intersectionFunctionTable: MTLIntersectionFunctionTable, bufferIndex: number): void;

	/**
	 * @since 15.0
	 */
	setVertexIntersectionFunctionTablesWithBufferRange(intersectionFunctionTables: interop.Reference<MTLIntersectionFunctionTable>, range: NSRange): void;

	setVertexSamplerStateAtIndex(sampler: MTLSamplerState, index: number): void;

	setVertexSamplerStateLodMinClampLodMaxClampAtIndex(sampler: MTLSamplerState, lodMinClamp: number, lodMaxClamp: number, index: number): void;

	setVertexSamplerStatesLodMinClampsLodMaxClampsWithRange(samplers: interop.Reference<MTLSamplerState>, lodMinClamps: interop.Reference<number>, lodMaxClamps: interop.Reference<number>, range: NSRange): void;

	setVertexSamplerStatesWithRange(samplers: interop.Reference<MTLSamplerState>, range: NSRange): void;

	setVertexTextureAtIndex(texture: MTLTexture, index: number): void;

	setVertexTexturesWithRange(textures: interop.Reference<MTLTexture>, range: NSRange): void;

	/**
	 * @since 15.0
	 */
	setVertexVisibleFunctionTableAtBufferIndex(functionTable: MTLVisibleFunctionTable, bufferIndex: number): void;

	/**
	 * @since 15.0
	 */
	setVertexVisibleFunctionTablesWithBufferRange(functionTables: interop.Reference<MTLVisibleFunctionTable>, range: NSRange): void;

	setViewport(viewport: MTLViewport): void;

	/**
	 * @since 12.0
	 */
	setViewportsCount(viewports: interop.Reference<MTLViewport>, count: number): void;

	setVisibilityResultModeOffset(mode: MTLVisibilityResultMode, offset: number): void;

	/**
	 * @since 10.0
	 */
	updateFenceAfterStages(fence: MTLFence, stages: MTLRenderStages): void;

	/**
	 * @since 11.0
	 * @deprecated 16.0
	 */
	useHeap(heap: MTLHeap): void;

	/**
	 * @since 13.0
	 */
	useHeapStages(heap: MTLHeap, stages: MTLRenderStages): void;

	/**
	 * @since 11.0
	 * @deprecated 16.0
	 */
	useHeapsCount(heaps: interop.Reference<MTLHeap>, count: number): void;

	/**
	 * @since 13.0
	 */
	useHeapsCountStages(heaps: interop.Reference<MTLHeap>, count: number, stages: MTLRenderStages): void;

	/**
	 * @since 11.0
	 * @deprecated 16.0
	 */
	useResourceUsage(resource: MTLResource, usage: MTLResourceUsage): void;

	/**
	 * @since 13.0
	 */
	useResourceUsageStages(resource: MTLResource, usage: MTLResourceUsage, stages: MTLRenderStages): void;

	/**
	 * @since 11.0
	 * @deprecated 16.0
	 */
	useResourcesCountUsage(resources: interop.Reference<MTLResource>, count: number, usage: MTLResourceUsage): void;

	/**
	 * @since 13.0
	 */
	useResourcesCountUsageStages(resources: interop.Reference<MTLResource>, count: number, usage: MTLResourceUsage, stages: MTLRenderStages): void;

	/**
	 * @since 10.0
	 */
	waitForFenceBeforeStages(fence: MTLFence, stages: MTLRenderStages): void;
}
declare var MTLRenderCommandEncoder: {

	prototype: MTLRenderCommandEncoder;
};

/**
 * @since 8.0
 */
declare class MTLRenderPassAttachmentDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLRenderPassAttachmentDescriptor; // inherited from NSObject

	static new(): MTLRenderPassAttachmentDescriptor; // inherited from NSObject

	depthPlane: number;

	level: number;

	loadAction: MTLLoadAction;

	resolveDepthPlane: number;

	resolveLevel: number;

	resolveSlice: number;

	resolveTexture: MTLTexture;

	slice: number;

	storeAction: MTLStoreAction;

	/**
	 * @since 11.0
	 */
	storeActionOptions: MTLStoreActionOptions;

	texture: MTLTexture;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare class MTLRenderPassColorAttachmentDescriptor extends MTLRenderPassAttachmentDescriptor {

	static alloc(): MTLRenderPassColorAttachmentDescriptor; // inherited from NSObject

	static new(): MTLRenderPassColorAttachmentDescriptor; // inherited from NSObject

	clearColor: MTLClearColor;
}

/**
 * @since 8.0
 */
declare class MTLRenderPassColorAttachmentDescriptorArray extends NSObject {

	static alloc(): MTLRenderPassColorAttachmentDescriptorArray; // inherited from NSObject

	static new(): MTLRenderPassColorAttachmentDescriptorArray; // inherited from NSObject
	[index: number]: MTLRenderPassColorAttachmentDescriptor;

	objectAtIndexedSubscript(attachmentIndex: number): MTLRenderPassColorAttachmentDescriptor;

	setObjectAtIndexedSubscript(attachment: MTLRenderPassColorAttachmentDescriptor, attachmentIndex: number): void;
}

/**
 * @since 8.0
 */
declare class MTLRenderPassDepthAttachmentDescriptor extends MTLRenderPassAttachmentDescriptor {

	static alloc(): MTLRenderPassDepthAttachmentDescriptor; // inherited from NSObject

	static new(): MTLRenderPassDepthAttachmentDescriptor; // inherited from NSObject

	clearDepth: number;

	/**
	 * @since 9.0
	 */
	depthResolveFilter: MTLMultisampleDepthResolveFilter;
}

/**
 * @since 8.0
 */
declare class MTLRenderPassDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLRenderPassDescriptor; // inherited from NSObject

	static new(): MTLRenderPassDescriptor; // inherited from NSObject

	static renderPassDescriptor(): MTLRenderPassDescriptor;

	readonly colorAttachments: MTLRenderPassColorAttachmentDescriptorArray;

	/**
	 * @since 11.0
	 */
	defaultRasterSampleCount: number;

	depthAttachment: MTLRenderPassDepthAttachmentDescriptor;

	/**
	 * @since 11.0
	 */
	imageblockSampleLength: number;

	/**
	 * @since 13.0
	 */
	rasterizationRateMap: MTLRasterizationRateMap;

	/**
	 * @since 12.0
	 */
	renderTargetArrayLength: number;

	/**
	 * @since 11.0
	 */
	renderTargetHeight: number;

	/**
	 * @since 11.0
	 */
	renderTargetWidth: number;

	/**
	 * @since 14.0
	 */
	readonly sampleBufferAttachments: MTLRenderPassSampleBufferAttachmentDescriptorArray;

	stencilAttachment: MTLRenderPassStencilAttachmentDescriptor;

	/**
	 * @since 11.0
	 */
	threadgroupMemoryLength: number;

	/**
	 * @since 11.0
	 */
	tileHeight: number;

	/**
	 * @since 11.0
	 */
	tileWidth: number;

	visibilityResultBuffer: MTLBuffer;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 11.0
	 */
	getSamplePositionsCount(positions: interop.Pointer | interop.Reference<MTLSamplePosition>, count: number): number;

	/**
	 * @since 11.0
	 */
	setSamplePositionsCount(positions: interop.Pointer | interop.Reference<MTLSamplePosition>, count: number): void;
}

/**
 * @since 14.0
 */
declare class MTLRenderPassSampleBufferAttachmentDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLRenderPassSampleBufferAttachmentDescriptor; // inherited from NSObject

	static new(): MTLRenderPassSampleBufferAttachmentDescriptor; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	endOfFragmentSampleIndex: number;

	/**
	 * @since 14.0
	 */
	endOfVertexSampleIndex: number;

	/**
	 * @since 14.0
	 */
	sampleBuffer: MTLCounterSampleBuffer;

	/**
	 * @since 14.0
	 */
	startOfFragmentSampleIndex: number;

	/**
	 * @since 14.0
	 */
	startOfVertexSampleIndex: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class MTLRenderPassSampleBufferAttachmentDescriptorArray extends NSObject {

	static alloc(): MTLRenderPassSampleBufferAttachmentDescriptorArray; // inherited from NSObject

	static new(): MTLRenderPassSampleBufferAttachmentDescriptorArray; // inherited from NSObject
	[index: number]: MTLRenderPassSampleBufferAttachmentDescriptor;

	objectAtIndexedSubscript(attachmentIndex: number): MTLRenderPassSampleBufferAttachmentDescriptor;

	setObjectAtIndexedSubscript(attachment: MTLRenderPassSampleBufferAttachmentDescriptor, attachmentIndex: number): void;
}

/**
 * @since 8.0
 */
declare class MTLRenderPassStencilAttachmentDescriptor extends MTLRenderPassAttachmentDescriptor {

	static alloc(): MTLRenderPassStencilAttachmentDescriptor; // inherited from NSObject

	static new(): MTLRenderPassStencilAttachmentDescriptor; // inherited from NSObject

	clearStencil: number;

	/**
	 * @since 12.0
	 */
	stencilResolveFilter: MTLMultisampleStencilResolveFilter;
}

/**
 * @since 8.0
 */
declare class MTLRenderPipelineColorAttachmentDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLRenderPipelineColorAttachmentDescriptor; // inherited from NSObject

	static new(): MTLRenderPipelineColorAttachmentDescriptor; // inherited from NSObject

	alphaBlendOperation: MTLBlendOperation;

	blendingEnabled: boolean;

	destinationAlphaBlendFactor: MTLBlendFactor;

	destinationRGBBlendFactor: MTLBlendFactor;

	pixelFormat: MTLPixelFormat;

	rgbBlendOperation: MTLBlendOperation;

	sourceAlphaBlendFactor: MTLBlendFactor;

	sourceRGBBlendFactor: MTLBlendFactor;

	writeMask: MTLColorWriteMask;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare class MTLRenderPipelineColorAttachmentDescriptorArray extends NSObject {

	static alloc(): MTLRenderPipelineColorAttachmentDescriptorArray; // inherited from NSObject

	static new(): MTLRenderPipelineColorAttachmentDescriptorArray; // inherited from NSObject
	[index: number]: MTLRenderPipelineColorAttachmentDescriptor;

	objectAtIndexedSubscript(attachmentIndex: number): MTLRenderPipelineColorAttachmentDescriptor;

	setObjectAtIndexedSubscript(attachment: MTLRenderPipelineColorAttachmentDescriptor, attachmentIndex: number): void;
}

/**
 * @since 8.0
 */
declare class MTLRenderPipelineDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLRenderPipelineDescriptor; // inherited from NSObject

	static new(): MTLRenderPipelineDescriptor; // inherited from NSObject

	alphaToCoverageEnabled: boolean;

	alphaToOneEnabled: boolean;

	/**
	 * @since 14.0
	 */
	binaryArchives: NSArray<MTLBinaryArchive>;

	readonly colorAttachments: MTLRenderPipelineColorAttachmentDescriptorArray;

	depthAttachmentPixelFormat: MTLPixelFormat;

	/**
	 * @since 11.0
	 */
	readonly fragmentBuffers: MTLPipelineBufferDescriptorArray;

	fragmentFunction: MTLFunction;

	/**
	 * @since 15.0
	 */
	fragmentLinkedFunctions: MTLLinkedFunctions;

	/**
	 * @since 15.0
	 */
	fragmentPreloadedLibraries: NSArray<MTLDynamicLibrary>;

	/**
	 * @since 12.0
	 */
	inputPrimitiveTopology: MTLPrimitiveTopologyClass;

	label: string;

	/**
	 * @since 15.0
	 */
	maxFragmentCallStackDepth: number;

	/**
	 * @since 10.0
	 */
	maxTessellationFactor: number;

	/**
	 * @since 13.0
	 */
	maxVertexAmplificationCount: number;

	/**
	 * @since 15.0
	 */
	maxVertexCallStackDepth: number;

	rasterSampleCount: number;

	rasterizationEnabled: boolean;

	/**
	 * @since 8.0
	 * @deprecated 16.0
	 */
	sampleCount: number;

	/**
	 * @since 18.0
	 */
	shaderValidation: MTLShaderValidation;

	stencilAttachmentPixelFormat: MTLPixelFormat;

	/**
	 * @since 15.0
	 */
	supportAddingFragmentBinaryFunctions: boolean;

	/**
	 * @since 15.0
	 */
	supportAddingVertexBinaryFunctions: boolean;

	/**
	 * @since 12.0
	 */
	supportIndirectCommandBuffers: boolean;

	/**
	 * @since 10.0
	 */
	tessellationControlPointIndexType: MTLTessellationControlPointIndexType;

	/**
	 * @since 10.0
	 */
	tessellationFactorFormat: MTLTessellationFactorFormat;

	/**
	 * @since 10.0
	 */
	tessellationFactorScaleEnabled: boolean;

	/**
	 * @since 10.0
	 */
	tessellationFactorStepFunction: MTLTessellationFactorStepFunction;

	/**
	 * @since 10.0
	 */
	tessellationOutputWindingOrder: MTLWinding;

	/**
	 * @since 10.0
	 */
	tessellationPartitionMode: MTLTessellationPartitionMode;

	/**
	 * @since 11.0
	 */
	readonly vertexBuffers: MTLPipelineBufferDescriptorArray;

	vertexDescriptor: MTLVertexDescriptor;

	vertexFunction: MTLFunction;

	/**
	 * @since 15.0
	 */
	vertexLinkedFunctions: MTLLinkedFunctions;

	/**
	 * @since 15.0
	 */
	vertexPreloadedLibraries: NSArray<MTLDynamicLibrary>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	reset(): void;
}

/**
 * @since 15.0
 */
declare class MTLRenderPipelineFunctionsDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLRenderPipelineFunctionsDescriptor; // inherited from NSObject

	static new(): MTLRenderPipelineFunctionsDescriptor; // inherited from NSObject

	fragmentAdditionalBinaryFunctions: NSArray<MTLFunction>;

	tileAdditionalBinaryFunctions: NSArray<MTLFunction>;

	vertexAdditionalBinaryFunctions: NSArray<MTLFunction>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare class MTLRenderPipelineReflection extends NSObject {

	static alloc(): MTLRenderPipelineReflection; // inherited from NSObject

	static new(): MTLRenderPipelineReflection; // inherited from NSObject

	/**
	 * @since 8.0
	 * @deprecated 16.0
	 */
	readonly fragmentArguments: NSArray<MTLArgument>;

	/**
	 * @since 16.0
	 */
	readonly fragmentBindings: NSArray<MTLBinding>;

	/**
	 * @since 16.0
	 */
	readonly meshBindings: NSArray<MTLBinding>;

	/**
	 * @since 16.0
	 */
	readonly objectBindings: NSArray<MTLBinding>;

	/**
	 * @since 11.0
	 * @deprecated 16.0
	 */
	readonly tileArguments: NSArray<MTLArgument>;

	/**
	 * @since 16.0
	 */
	readonly tileBindings: NSArray<MTLBinding>;

	/**
	 * @since 8.0
	 * @deprecated 16.0
	 */
	readonly vertexArguments: NSArray<MTLArgument>;

	/**
	 * @since 16.0
	 */
	readonly vertexBindings: NSArray<MTLBinding>;
}

/**
 * @since 8.0
 */
interface MTLRenderPipelineState extends NSObjectProtocol {

	device: MTLDevice;

	/**
	 * @since 16.0
	 */
	gpuResourceID: MTLResourceID;

	/**
	 * @since 11.0
	 */
	imageblockSampleLength: number;

	label: string;

	/**
	 * @since 16.0
	 */
	maxTotalThreadgroupsPerMeshGrid: number;

	/**
	 * @since 16.0
	 */
	maxTotalThreadsPerMeshThreadgroup: number;

	/**
	 * @since 16.0
	 */
	maxTotalThreadsPerObjectThreadgroup: number;

	/**
	 * @since 11.0
	 */
	maxTotalThreadsPerThreadgroup: number;

	/**
	 * @since 16.0
	 */
	meshThreadExecutionWidth: number;

	/**
	 * @since 16.0
	 */
	objectThreadExecutionWidth: number;

	/**
	 * @since 18.0
	 */
	shaderValidation: MTLShaderValidation;

	/**
	 * @since 12.0
	 */
	supportIndirectCommandBuffers: boolean;

	/**
	 * @since 11.0
	 */
	threadgroupSizeMatchesTileSize: boolean;

	/**
	 * @since 15.0
	 */
	functionHandleWithFunctionStage(_function: MTLFunction, stage: MTLRenderStages): MTLFunctionHandle;

	/**
	 * @since 11.0
	 */
	imageblockMemoryLengthForDimensions(imageblockDimensions: MTLSize): number;

	/**
	 * @since 15.0
	 */
	newIntersectionFunctionTableWithDescriptorStage(descriptor: MTLIntersectionFunctionTableDescriptor, stage: MTLRenderStages): MTLIntersectionFunctionTable;

	/**
	 * @since 15.0
	 */
	newRenderPipelineStateWithAdditionalBinaryFunctionsError(additionalBinaryFunctions: MTLRenderPipelineFunctionsDescriptor): MTLRenderPipelineState;

	/**
	 * @since 15.0
	 */
	newVisibleFunctionTableWithDescriptorStage(descriptor: MTLVisibleFunctionTableDescriptor, stage: MTLRenderStages): MTLVisibleFunctionTable;
}
declare var MTLRenderPipelineState: {

	prototype: MTLRenderPipelineState;
};

/**
 * @since 10.0
 */
declare const enum MTLRenderStages {

	Vertex = 1,

	Fragment = 2,

	Tile = 4,

	Object = 8,

	Mesh = 16
}

/**
 * @since 18.0
 */
interface MTLResidencySet extends NSObjectProtocol {

	allAllocations: NSArray<MTLAllocation>;

	allocatedSize: number;

	allocationCount: number;

	device: MTLDevice;

	label: string;

	addAllocation(allocation: MTLAllocation): void;

	addAllocationsCount(allocations: interop.Reference<MTLAllocation>, count: number): void;

	commit(): void;

	containsAllocation(anAllocation: MTLAllocation): boolean;

	endResidency(): void;

	removeAllAllocations(): void;

	removeAllocation(allocation: MTLAllocation): void;

	removeAllocationsCount(allocations: interop.Reference<MTLAllocation>, count: number): void;

	requestResidency(): void;
}
declare var MTLResidencySet: {

	prototype: MTLResidencySet;
};

/**
 * @since 18.0
 */
declare class MTLResidencySetDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLResidencySetDescriptor; // inherited from NSObject

	static new(): MTLResidencySetDescriptor; // inherited from NSObject

	initialCapacity: number;

	label: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
interface MTLResource extends MTLAllocation {

	cpuCacheMode: MTLCPUCacheMode;

	device: MTLDevice;

	/**
	 * @since 13.0
	 */
	hazardTrackingMode: MTLHazardTrackingMode;

	/**
	 * @since 10.0
	 */
	heap: MTLHeap;

	/**
	 * @since 13.0
	 */
	heapOffset: number;

	label: string;

	/**
	 * @since 13.0
	 */
	resourceOptions: MTLResourceOptions;

	/**
	 * @since 9.0
	 */
	storageMode: MTLStorageMode;

	/**
	 * @since 10.0
	 */
	isAliasable(): boolean;

	/**
	 * @since 10.0
	 */
	makeAliasable(): void;

	/**
	 * @since 17.4
	 */
	setOwnerWithIdentity(task_id_token: number): number;

	setPurgeableState(state: MTLPurgeableState): MTLPurgeableState;
}
declare var MTLResource: {

	prototype: MTLResource;
};

interface MTLResourceID {
	_impl: number;
}
declare var MTLResourceID: interop.StructType<MTLResourceID>;

/**
 * @since 8.0
 */
declare const enum MTLResourceOptions {

	CPUCacheModeDefaultCache = 0,

	CPUCacheModeWriteCombined = 1,

	StorageModeShared = 0,

	StorageModeManaged = 16,

	StorageModePrivate = 32,

	StorageModeMemoryless = 48,

	HazardTrackingModeDefault = 0,

	HazardTrackingModeUntracked = 256,

	HazardTrackingModeTracked = 512,

	OptionCPUCacheModeDefault = 0,

	OptionCPUCacheModeWriteCombined = 1
}

/**
 * @since 13.0
 */
interface MTLResourceStateCommandEncoder extends MTLCommandEncoder {

	/**
	 * @since 16.0
	 */
	moveTextureMappingsFromTextureSourceSliceSourceLevelSourceOriginSourceSizeToTextureDestinationSliceDestinationLevelDestinationOrigin(sourceTexture: MTLTexture, sourceSlice: number, sourceLevel: number, sourceOrigin: MTLOrigin, sourceSize: MTLSize, destinationTexture: MTLTexture, destinationSlice: number, destinationLevel: number, destinationOrigin: MTLOrigin): void;

	/**
	 * @since 13.0
	 */
	updateFence(fence: MTLFence): void;

	/**
	 * @since 13.0
	 */
	updateTextureMappingModeIndirectBufferIndirectBufferOffset(texture: MTLTexture, mode: MTLSparseTextureMappingMode, indirectBuffer: MTLBuffer, indirectBufferOffset: number): void;

	/**
	 * @since 13.0
	 */
	updateTextureMappingModeRegionMipLevelSlice(texture: MTLTexture, mode: MTLSparseTextureMappingMode, region: MTLRegion, mipLevel: number, slice: number): void;

	/**
	 * @since 13.0
	 */
	updateTextureMappingsModeRegionsMipLevelsSlicesNumRegions(texture: MTLTexture, mode: MTLSparseTextureMappingMode, regions: interop.Reference<MTLRegion>, mipLevels: interop.Reference<number>, slices: interop.Reference<number>, numRegions: number): void;

	/**
	 * @since 13.0
	 */
	waitForFence(fence: MTLFence): void;
}
declare var MTLResourceStateCommandEncoder: {

	prototype: MTLResourceStateCommandEncoder;
};

/**
 * @since 14.0
 */
declare class MTLResourceStatePassDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLResourceStatePassDescriptor; // inherited from NSObject

	static new(): MTLResourceStatePassDescriptor; // inherited from NSObject

	static resourceStatePassDescriptor(): MTLResourceStatePassDescriptor;

	/**
	 * @since 14.0
	 */
	readonly sampleBufferAttachments: MTLResourceStatePassSampleBufferAttachmentDescriptorArray;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class MTLResourceStatePassSampleBufferAttachmentDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLResourceStatePassSampleBufferAttachmentDescriptor; // inherited from NSObject

	static new(): MTLResourceStatePassSampleBufferAttachmentDescriptor; // inherited from NSObject

	endOfEncoderSampleIndex: number;

	sampleBuffer: MTLCounterSampleBuffer;

	startOfEncoderSampleIndex: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class MTLResourceStatePassSampleBufferAttachmentDescriptorArray extends NSObject {

	static alloc(): MTLResourceStatePassSampleBufferAttachmentDescriptorArray; // inherited from NSObject

	static new(): MTLResourceStatePassSampleBufferAttachmentDescriptorArray; // inherited from NSObject
	[index: number]: MTLResourceStatePassSampleBufferAttachmentDescriptor;

	objectAtIndexedSubscript(attachmentIndex: number): MTLResourceStatePassSampleBufferAttachmentDescriptor;

	setObjectAtIndexedSubscript(attachment: MTLResourceStatePassSampleBufferAttachmentDescriptor, attachmentIndex: number): void;
}

/**
 * @since 11.0
 */
declare const enum MTLResourceUsage {

	Read = 1,

	Write = 2,

	Sample = 4
}

interface MTLSamplePosition {
	x: number;
	y: number;
}
declare var MTLSamplePosition: interop.StructType<MTLSamplePosition>;

/**
 * @since 8.0
 */
declare const enum MTLSamplerAddressMode {

	ClampToEdge = 0,

	MirrorClampToEdge = 1,

	Repeat = 2,

	MirrorRepeat = 3,

	ClampToZero = 4,

	ClampToBorderColor = 5
}

/**
 * @since 14.0
 */
declare const enum MTLSamplerBorderColor {

	TransparentBlack = 0,

	OpaqueBlack = 1,

	OpaqueWhite = 2
}

/**
 * @since 8.0
 */
declare class MTLSamplerDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLSamplerDescriptor; // inherited from NSObject

	static new(): MTLSamplerDescriptor; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	borderColor: MTLSamplerBorderColor;

	/**
	 * @since 9.0
	 */
	compareFunction: MTLCompareFunction;

	label: string;

	/**
	 * @since 9.0
	 */
	lodAverage: boolean;

	lodMaxClamp: number;

	lodMinClamp: number;

	magFilter: MTLSamplerMinMagFilter;

	maxAnisotropy: number;

	minFilter: MTLSamplerMinMagFilter;

	mipFilter: MTLSamplerMipFilter;

	normalizedCoordinates: boolean;

	rAddressMode: MTLSamplerAddressMode;

	sAddressMode: MTLSamplerAddressMode;

	/**
	 * @since 11.0
	 */
	supportArgumentBuffers: boolean;

	tAddressMode: MTLSamplerAddressMode;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare const enum MTLSamplerMinMagFilter {

	Nearest = 0,

	Linear = 1
}

/**
 * @since 8.0
 */
declare const enum MTLSamplerMipFilter {

	NotMipmapped = 0,

	Nearest = 1,

	Linear = 2
}

/**
 * @since 8.0
 */
interface MTLSamplerState extends NSObjectProtocol {

	device: MTLDevice;

	/**
	 * @since 16.0
	 */
	gpuResourceID: MTLResourceID;

	label: string;
}
declare var MTLSamplerState: {

	prototype: MTLSamplerState;
};

interface MTLScissorRect {
	x: number;
	y: number;
	width: number;
	height: number;
}
declare var MTLScissorRect: interop.StructType<MTLScissorRect>;

/**
 * @since 18.0
 */
declare const enum MTLShaderValidation {

	Default = 0,

	Enabled = 1,

	Disabled = 2
}

/**
 * @since 12.0
 */
interface MTLSharedEvent extends MTLEvent {

	signaledValue: number;

	newSharedEventHandle(): MTLSharedEventHandle;

	notifyListenerAtValueBlock(listener: MTLSharedEventListener, value: number, block: (p1: MTLSharedEvent, p2: number) => void): void;

	/**
	 * @since 15.0
	 */
	waitUntilSignaledValueTimeoutMS(value: number, milliseconds: number): boolean;
}
declare var MTLSharedEvent: {

	prototype: MTLSharedEvent;
};

/**
 * @since 12.0
 */
declare class MTLSharedEventHandle extends NSObject implements NSSecureCoding {

	static alloc(): MTLSharedEventHandle; // inherited from NSObject

	static new(): MTLSharedEventHandle; // inherited from NSObject

	readonly label: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 12.0
 */
declare class MTLSharedEventListener extends NSObject {

	static alloc(): MTLSharedEventListener; // inherited from NSObject

	static new(): MTLSharedEventListener; // inherited from NSObject

	readonly dispatchQueue: NSObject & OS_dispatch_queue;

	constructor(o: { dispatchQueue: NSObject & OS_dispatch_queue; });

	initWithDispatchQueue(dispatchQueue: NSObject & OS_dispatch_queue): this;
}

interface MTLSize {
	width: number;
	height: number;
	depth: number;
}
declare var MTLSize: interop.StructType<MTLSize>;

interface MTLSizeAndAlign {
	size: number;
	align: number;
}
declare var MTLSizeAndAlign: interop.StructType<MTLSizeAndAlign>;

/**
 * @since 16.0
 */
declare const enum MTLSparsePageSize {

	Size16 = 101,

	Size64 = 102,

	Size256 = 103
}

/**
 * @since 13.0
 */
declare const enum MTLSparseTextureMappingMode {

	Map = 0,

	Unmap = 1
}

/**
 * @since 13.0
 */
declare const enum MTLSparseTextureRegionAlignmentMode {

	Outward = 0,

	Inward = 1
}

interface MTLStageInRegionIndirectArguments {
	stageInOrigin: interop.Reference<number>;
	stageInSize: interop.Reference<number>;
}
declare var MTLStageInRegionIndirectArguments: interop.StructType<MTLStageInRegionIndirectArguments>;

/**
 * @since 10.0
 */
declare class MTLStageInputOutputDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLStageInputOutputDescriptor; // inherited from NSObject

	static new(): MTLStageInputOutputDescriptor; // inherited from NSObject

	static stageInputOutputDescriptor(): MTLStageInputOutputDescriptor;

	readonly attributes: MTLAttributeDescriptorArray;

	indexBufferIndex: number;

	indexType: MTLIndexType;

	readonly layouts: MTLBufferLayoutDescriptorArray;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	reset(): void;
}

/**
 * @since 8.0
 */
declare class MTLStencilDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLStencilDescriptor; // inherited from NSObject

	static new(): MTLStencilDescriptor; // inherited from NSObject

	depthFailureOperation: MTLStencilOperation;

	depthStencilPassOperation: MTLStencilOperation;

	readMask: number;

	stencilCompareFunction: MTLCompareFunction;

	stencilFailureOperation: MTLStencilOperation;

	writeMask: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare const enum MTLStencilOperation {

	Keep = 0,

	Zero = 1,

	Replace = 2,

	IncrementClamp = 3,

	DecrementClamp = 4,

	Invert = 5,

	IncrementWrap = 6,

	DecrementWrap = 7
}

/**
 * @since 10.0
 */
declare const enum MTLStepFunction {

	Constant = 0,

	PerVertex = 1,

	PerInstance = 2,

	PerPatch = 3,

	PerPatchControlPoint = 4,

	ThreadPositionInGridX = 5,

	ThreadPositionInGridY = 6,

	ThreadPositionInGridXIndexed = 7,

	ThreadPositionInGridYIndexed = 8
}

/**
 * @since 15.0
 */
declare class MTLStitchedLibraryDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLStitchedLibraryDescriptor; // inherited from NSObject

	static new(): MTLStitchedLibraryDescriptor; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	binaryArchives: NSArray<MTLBinaryArchive>;

	functionGraphs: NSArray<MTLFunctionStitchingGraph>;

	functions: NSArray<MTLFunction>;

	/**
	 * @since 18.0
	 */
	options: MTLStitchedLibraryOptions;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 18.0
 */
declare const enum MTLStitchedLibraryOptions {

	None = 0,

	FailOnBinaryArchiveMiss = 1,

	StoreLibraryInMetalPipelinesScript = 2
}

/**
 * @since 9.0
 */
declare const enum MTLStorageMode {

	Shared = 0,

	Managed = 1,

	Private = 2,

	Memoryless = 3
}

/**
 * @since 8.0
 */
declare const enum MTLStoreAction {

	DontCare = 0,

	Store = 1,

	MultisampleResolve = 2,

	StoreAndMultisampleResolve = 3,

	Unknown = 4,

	CustomSampleDepthStore = 5
}

/**
 * @since 11.0
 */
declare const enum MTLStoreActionOptions {

	None = 0,

	CustomSamplePositions = 1
}

/**
 * @since 8.0
 */
declare class MTLStructMember extends NSObject {

	static alloc(): MTLStructMember; // inherited from NSObject

	static new(): MTLStructMember; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly argumentIndex: number;

	readonly dataType: MTLDataType;

	readonly name: string;

	readonly offset: number;

	arrayType(): MTLArrayType;

	/**
	 * @since 11.0
	 */
	pointerType(): MTLPointerType;

	structType(): MTLStructType;

	/**
	 * @since 11.0
	 */
	textureReferenceType(): MTLTextureReferenceType;
}

/**
 * @since 8.0
 */
declare class MTLStructType extends MTLType {

	static alloc(): MTLStructType; // inherited from NSObject

	static new(): MTLStructType; // inherited from NSObject

	readonly members: NSArray<MTLStructMember>;

	memberByName(name: string): MTLStructMember;
}

/**
 * @since 10.0
 */
declare const enum MTLTessellationControlPointIndexType {

	None = 0,

	UInt16 = 1,

	UInt32 = 2
}

/**
 * @since 10.0
 */
declare const enum MTLTessellationFactorFormat {

	Half = 0
}

/**
 * @since 10.0
 */
declare const enum MTLTessellationFactorStepFunction {

	Constant = 0,

	PerPatch = 1,

	PerInstance = 2,

	PerPatchAndPerInstance = 3
}

/**
 * @since 10.0
 */
declare const enum MTLTessellationPartitionMode {

	Pow2 = 0,

	Integer = 1,

	FractionalOdd = 2,

	FractionalEven = 3
}

/**
 * @since 8.0
 */
interface MTLTexture extends MTLResource {

	/**
	 * @since 12.0
	 */
	allowGPUOptimizedContents: boolean;

	arrayLength: number;

	/**
	 * @since 9.0
	 */
	buffer: MTLBuffer;

	/**
	 * @since 9.0
	 */
	bufferBytesPerRow: number;

	/**
	 * @since 9.0
	 */
	bufferOffset: number;

	/**
	 * @since 15.0
	 */
	compressionType: MTLTextureCompressionType;

	depth: number;

	/**
	 * @since 13.0
	 */
	firstMipmapInTail: number;

	framebufferOnly: boolean;

	/**
	 * @since 16.0
	 */
	gpuResourceID: MTLResourceID;

	height: number;

	/**
	 * @since 11.0
	 */
	iosurface: IOSurface;

	/**
	 * @since 11.0
	 */
	iosurfacePlane: number;

	/**
	 * @since 13.0
	 */
	isSparse: boolean;

	mipmapLevelCount: number;

	/**
	 * @since 9.0
	 */
	parentRelativeLevel: number;

	/**
	 * @since 9.0
	 */
	parentRelativeSlice: number;

	/**
	 * @since 9.0
	 */
	parentTexture: MTLTexture;

	pixelFormat: MTLPixelFormat;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	rootResource: MTLResource;

	sampleCount: number;

	/**
	 * @since 13.0
	 */
	swizzle: MTLTextureSwizzleChannels;

	/**
	 * @since 13.0
	 */
	tailSizeInBytes: number;

	textureType: MTLTextureType;

	usage: MTLTextureUsage;

	width: number;

	getBytesBytesPerRowBytesPerImageFromRegionMipmapLevelSlice(pixelBytes: interop.Pointer | interop.Reference<any>, bytesPerRow: number, bytesPerImage: number, region: MTLRegion, level: number, slice: number): void;

	getBytesBytesPerRowFromRegionMipmapLevel(pixelBytes: interop.Pointer | interop.Reference<any>, bytesPerRow: number, region: MTLRegion, level: number): void;

	newTextureViewWithPixelFormat(pixelFormat: MTLPixelFormat): MTLTexture;

	/**
	 * @since 9.0
	 */
	newTextureViewWithPixelFormatTextureTypeLevelsSlices(pixelFormat: MTLPixelFormat, textureType: MTLTextureType, levelRange: NSRange, sliceRange: NSRange): MTLTexture;

	/**
	 * @since 13.0
	 */
	newTextureViewWithPixelFormatTextureTypeLevelsSlicesSwizzle(pixelFormat: MTLPixelFormat, textureType: MTLTextureType, levelRange: NSRange, sliceRange: NSRange, swizzle: MTLTextureSwizzleChannels): MTLTexture;

	replaceRegionMipmapLevelSliceWithBytesBytesPerRowBytesPerImage(region: MTLRegion, level: number, slice: number, pixelBytes: interop.Pointer | interop.Reference<any>, bytesPerRow: number, bytesPerImage: number): void;

	replaceRegionMipmapLevelWithBytesBytesPerRow(region: MTLRegion, level: number, pixelBytes: interop.Pointer | interop.Reference<any>, bytesPerRow: number): void;
}
declare var MTLTexture: {

	prototype: MTLTexture;
};

/**
 * @since 16.0
 */
interface MTLTextureBinding extends MTLBinding {

	arrayLength: number;

	depthTexture: boolean;

	textureDataType: MTLDataType;

	textureType: MTLTextureType;
}
declare var MTLTextureBinding: {

	prototype: MTLTextureBinding;
};

/**
 * @since 15.0
 */
declare const enum MTLTextureCompressionType {

	Lossless = 0,

	Lossy = 1
}

/**
 * @since 8.0
 */
declare class MTLTextureDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLTextureDescriptor; // inherited from NSObject

	static new(): MTLTextureDescriptor; // inherited from NSObject

	static texture2DDescriptorWithPixelFormatWidthHeightMipmapped(pixelFormat: MTLPixelFormat, width: number, height: number, mipmapped: boolean): MTLTextureDescriptor;

	/**
	 * @since 12.0
	 */
	static textureBufferDescriptorWithPixelFormatWidthResourceOptionsUsage(pixelFormat: MTLPixelFormat, width: number, resourceOptions: MTLResourceOptions, usage: MTLTextureUsage): MTLTextureDescriptor;

	static textureCubeDescriptorWithPixelFormatSizeMipmapped(pixelFormat: MTLPixelFormat, size: number, mipmapped: boolean): MTLTextureDescriptor;

	/**
	 * @since 12.0
	 */
	allowGPUOptimizedContents: boolean;

	arrayLength: number;

	/**
	 * @since 15.0
	 */
	compressionType: MTLTextureCompressionType;

	/**
	 * @since 9.0
	 */
	cpuCacheMode: MTLCPUCacheMode;

	depth: number;

	/**
	 * @since 13.0
	 */
	hazardTrackingMode: MTLHazardTrackingMode;

	height: number;

	mipmapLevelCount: number;

	pixelFormat: MTLPixelFormat;

	resourceOptions: MTLResourceOptions;

	sampleCount: number;

	/**
	 * @since 9.0
	 */
	storageMode: MTLStorageMode;

	/**
	 * @since 13.0
	 */
	swizzle: MTLTextureSwizzleChannels;

	textureType: MTLTextureType;

	/**
	 * @since 9.0
	 */
	usage: MTLTextureUsage;

	width: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
declare class MTLTextureReferenceType extends MTLType {

	static alloc(): MTLTextureReferenceType; // inherited from NSObject

	static new(): MTLTextureReferenceType; // inherited from NSObject

	readonly access: MTLBindingAccess;

	readonly isDepthTexture: boolean;

	readonly textureDataType: MTLDataType;

	readonly textureType: MTLTextureType;
}

/**
 * @since 13.0
 */
declare const enum MTLTextureSwizzle {

	Zero = 0,

	One = 1,

	Red = 2,

	Green = 3,

	Blue = 4,

	Alpha = 5
}

interface MTLTextureSwizzleChannels {
	red: MTLTextureSwizzle;
	green: MTLTextureSwizzle;
	blue: MTLTextureSwizzle;
	alpha: MTLTextureSwizzle;
}
declare var MTLTextureSwizzleChannels: interop.StructType<MTLTextureSwizzleChannels>;

/**
 * @since 8.0
 */
declare const enum MTLTextureType {

	Type1D = 0,

	Type1DArray = 1,

	Type2D = 2,

	Type2DArray = 3,

	Type2DMultisample = 4,

	TypeCube = 5,

	TypeCubeArray = 6,

	Type3D = 7,

	Type2DMultisampleArray = 8,

	TypeTextureBuffer = 9
}

/**
 * @since 9.0
 */
declare const enum MTLTextureUsage {

	Unknown = 0,

	ShaderRead = 1,

	ShaderWrite = 2,

	RenderTarget = 4,

	PixelFormatView = 16,

	ShaderAtomic = 32
}

/**
 * @since 16.0
 */
interface MTLThreadgroupBinding extends MTLBinding {

	threadgroupMemoryAlignment: number;

	threadgroupMemoryDataSize: number;
}
declare var MTLThreadgroupBinding: {

	prototype: MTLThreadgroupBinding;
};

/**
 * @since 11.0
 */
declare class MTLTileRenderPipelineColorAttachmentDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLTileRenderPipelineColorAttachmentDescriptor; // inherited from NSObject

	static new(): MTLTileRenderPipelineColorAttachmentDescriptor; // inherited from NSObject

	pixelFormat: MTLPixelFormat;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
declare class MTLTileRenderPipelineColorAttachmentDescriptorArray extends NSObject {

	static alloc(): MTLTileRenderPipelineColorAttachmentDescriptorArray; // inherited from NSObject

	static new(): MTLTileRenderPipelineColorAttachmentDescriptorArray; // inherited from NSObject
	[index: number]: MTLTileRenderPipelineColorAttachmentDescriptor;

	objectAtIndexedSubscript(attachmentIndex: number): MTLTileRenderPipelineColorAttachmentDescriptor;

	setObjectAtIndexedSubscript(attachment: MTLTileRenderPipelineColorAttachmentDescriptor, attachmentIndex: number): void;
}

/**
 * @since 11.0
 */
declare class MTLTileRenderPipelineDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLTileRenderPipelineDescriptor; // inherited from NSObject

	static new(): MTLTileRenderPipelineDescriptor; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	binaryArchives: NSArray<MTLBinaryArchive>;

	readonly colorAttachments: MTLTileRenderPipelineColorAttachmentDescriptorArray;

	label: string;

	/**
	 * @since 15.0
	 */
	linkedFunctions: MTLLinkedFunctions;

	/**
	 * @since 15.0
	 */
	maxCallStackDepth: number;

	/**
	 * @since 12.0
	 */
	maxTotalThreadsPerThreadgroup: number;

	/**
	 * @since 15.0
	 */
	preloadedLibraries: NSArray<MTLDynamicLibrary>;

	rasterSampleCount: number;

	/**
	 * @since 18.0
	 */
	shaderValidation: MTLShaderValidation;

	/**
	 * @since 15.0
	 */
	supportAddingBinaryFunctions: boolean;

	threadgroupSizeMatchesTileSize: boolean;

	/**
	 * @since 11.0
	 */
	readonly tileBuffers: MTLPipelineBufferDescriptorArray;

	tileFunction: MTLFunction;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	reset(): void;
}

/**
 * @since 18.0
 */
declare const enum MTLTransformType {

	PackedFloat4x3 = 0,

	Component = 1
}

/**
 * @since 8.0
 */
declare const enum MTLTriangleFillMode {

	Fill = 0,

	Lines = 1
}

interface MTLTriangleTessellationFactorsHalf {
	edgeTessellationFactor: interop.Reference<number>;
	insideTessellationFactor: number;
}
declare var MTLTriangleTessellationFactorsHalf: interop.StructType<MTLTriangleTessellationFactorsHalf>;

/**
 * @since 11.0
 */
declare class MTLType extends NSObject {

	static alloc(): MTLType; // inherited from NSObject

	static new(): MTLType; // inherited from NSObject

	readonly dataType: MTLDataType;
}

interface MTLVertexAmplificationViewMapping {
	viewportArrayIndexOffset: number;
	renderTargetArrayIndexOffset: number;
}
declare var MTLVertexAmplificationViewMapping: interop.StructType<MTLVertexAmplificationViewMapping>;

/**
 * @since 8.0
 */
declare class MTLVertexAttribute extends NSObject {

	static alloc(): MTLVertexAttribute; // inherited from NSObject

	static new(): MTLVertexAttribute; // inherited from NSObject

	readonly active: boolean;

	readonly attributeIndex: number;

	/**
	 * @since 8.3
	 */
	readonly attributeType: MTLDataType;

	readonly name: string;

	/**
	 * @since 10.0
	 */
	readonly patchControlPointData: boolean;

	/**
	 * @since 10.0
	 */
	readonly patchData: boolean;
}

/**
 * @since 8.0
 */
declare class MTLVertexAttributeDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLVertexAttributeDescriptor; // inherited from NSObject

	static new(): MTLVertexAttributeDescriptor; // inherited from NSObject

	bufferIndex: number;

	format: MTLVertexFormat;

	offset: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare class MTLVertexAttributeDescriptorArray extends NSObject {

	static alloc(): MTLVertexAttributeDescriptorArray; // inherited from NSObject

	static new(): MTLVertexAttributeDescriptorArray; // inherited from NSObject
	[index: number]: MTLVertexAttributeDescriptor;

	objectAtIndexedSubscript(index: number): MTLVertexAttributeDescriptor;

	setObjectAtIndexedSubscript(attributeDesc: MTLVertexAttributeDescriptor, index: number): void;
}

/**
 * @since 8.0
 */
declare class MTLVertexBufferLayoutDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLVertexBufferLayoutDescriptor; // inherited from NSObject

	static new(): MTLVertexBufferLayoutDescriptor; // inherited from NSObject

	stepFunction: MTLVertexStepFunction;

	stepRate: number;

	stride: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare class MTLVertexBufferLayoutDescriptorArray extends NSObject {

	static alloc(): MTLVertexBufferLayoutDescriptorArray; // inherited from NSObject

	static new(): MTLVertexBufferLayoutDescriptorArray; // inherited from NSObject
	[index: number]: MTLVertexBufferLayoutDescriptor;

	objectAtIndexedSubscript(index: number): MTLVertexBufferLayoutDescriptor;

	setObjectAtIndexedSubscript(bufferDesc: MTLVertexBufferLayoutDescriptor, index: number): void;
}

/**
 * @since 8.0
 */
declare class MTLVertexDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLVertexDescriptor; // inherited from NSObject

	static new(): MTLVertexDescriptor; // inherited from NSObject

	static vertexDescriptor(): MTLVertexDescriptor;

	readonly attributes: MTLVertexAttributeDescriptorArray;

	readonly layouts: MTLVertexBufferLayoutDescriptorArray;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	reset(): void;
}

/**
 * @since 8.0
 */
declare const enum MTLVertexFormat {

	Invalid = 0,

	UChar2 = 1,

	UChar3 = 2,

	UChar4 = 3,

	Char2 = 4,

	Char3 = 5,

	Char4 = 6,

	UChar2Normalized = 7,

	UChar3Normalized = 8,

	UChar4Normalized = 9,

	Char2Normalized = 10,

	Char3Normalized = 11,

	Char4Normalized = 12,

	UShort2 = 13,

	UShort3 = 14,

	UShort4 = 15,

	Short2 = 16,

	Short3 = 17,

	Short4 = 18,

	UShort2Normalized = 19,

	UShort3Normalized = 20,

	UShort4Normalized = 21,

	Short2Normalized = 22,

	Short3Normalized = 23,

	Short4Normalized = 24,

	Half2 = 25,

	Half3 = 26,

	Half4 = 27,

	Float = 28,

	Float2 = 29,

	Float3 = 30,

	Float4 = 31,

	Int = 32,

	Int2 = 33,

	Int3 = 34,

	Int4 = 35,

	UInt = 36,

	UInt2 = 37,

	UInt3 = 38,

	UInt4 = 39,

	Int1010102Normalized = 40,

	UInt1010102Normalized = 41,

	UChar4Normalized_BGRA = 42,

	UChar = 45,

	Char = 46,

	UCharNormalized = 47,

	CharNormalized = 48,

	UShort = 49,

	Short = 50,

	UShortNormalized = 51,

	ShortNormalized = 52,

	Half = 53,

	FloatRG11B10 = 54,

	FloatRGB9E5 = 55
}

/**
 * @since 8.0
 */
declare const enum MTLVertexStepFunction {

	Constant = 0,

	PerVertex = 1,

	PerInstance = 2,

	PerPatch = 3,

	PerPatchControlPoint = 4
}

interface MTLViewport {
	originX: number;
	originY: number;
	width: number;
	height: number;
	znear: number;
	zfar: number;
}
declare var MTLViewport: interop.StructType<MTLViewport>;

/**
 * @since 8.0
 */
declare const enum MTLVisibilityResultMode {

	Disabled = 0,

	Boolean = 1,

	Counting = 2
}

/**
 * @since 14.0
 */
interface MTLVisibleFunctionTable extends MTLResource {

	/**
	 * @since 16.0
	 */
	gpuResourceID: MTLResourceID;

	setFunctionAtIndex(_function: MTLFunctionHandle, index: number): void;

	setFunctionsWithRange(functions: interop.Reference<MTLFunctionHandle>, range: NSRange): void;
}
declare var MTLVisibleFunctionTable: {

	prototype: MTLVisibleFunctionTable;
};

/**
 * @since 14.0
 */
declare class MTLVisibleFunctionTableDescriptor extends NSObject implements NSCopying {

	static alloc(): MTLVisibleFunctionTableDescriptor; // inherited from NSObject

	static new(): MTLVisibleFunctionTableDescriptor; // inherited from NSObject

	static visibleFunctionTableDescriptor(): MTLVisibleFunctionTableDescriptor;

	functionCount: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare const enum MTLWinding {

	Clockwise = 0,

	CounterClockwise = 1
}

/**
 * @since 18.0
 */
declare var NSDeviceCertificationiPhonePerformanceGaming: number;

/**
 * @since 18.0
 */
declare var NSProcessInfoPerformanceProfileDidChangeNotification: string;

/**
 * @since 18.0
 */
declare var NSProcessPerformanceProfileDefault: number;

/**
 * @since 18.0
 */
declare var NSProcessPerformanceProfileSustained: number;
