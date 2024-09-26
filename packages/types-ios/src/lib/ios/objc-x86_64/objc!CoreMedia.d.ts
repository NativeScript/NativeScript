
/**
 * @since 6.0
 */
declare function CMAudioClockCreate(allocator: any, clockOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMAudioFormatDescriptionCopyAsBigEndianSoundDescriptionBlockBuffer(allocator: any, audioFormatDescription: any, flavor: string, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMAudioFormatDescriptionCreate(allocator: any, asbd: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, layoutSize: number, layout: interop.Pointer | interop.Reference<AudioChannelLayout>, magicCookieSize: number, magicCookie: interop.Pointer | interop.Reference<any>, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMAudioFormatDescriptionCreateFromBigEndianSoundDescriptionBlockBuffer(allocator: any, soundDescriptionBlockBuffer: any, flavor: string, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMAudioFormatDescriptionCreateFromBigEndianSoundDescriptionData(allocator: any, soundDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, flavor: string, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMAudioFormatDescriptionCreateSummary(allocator: any, formatDescriptionArray: NSArray<any> | any[], flags: number, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMAudioFormatDescriptionEqual(formatDescription: any, otherFormatDescription: any, equalityMask: number, equalityMaskOut: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 4.0
 */
declare function CMAudioFormatDescriptionGetChannelLayout(desc: any, sizeOut: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<AudioChannelLayout>;

/**
 * @since 4.0
 */
declare function CMAudioFormatDescriptionGetFormatList(desc: any, sizeOut: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<AudioFormatListItem>;

/**
 * @since 4.0
 */
declare function CMAudioFormatDescriptionGetMagicCookie(desc: any, sizeOut: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

/**
 * @since 4.0
 */
declare function CMAudioFormatDescriptionGetMostCompatibleFormat(desc: any): interop.Pointer | interop.Reference<AudioFormatListItem>;

/**
 * @since 4.0
 */
declare function CMAudioFormatDescriptionGetRichestDecodableFormat(desc: any): interop.Pointer | interop.Reference<AudioFormatListItem>;

/**
 * @since 4.0
 */
declare function CMAudioFormatDescriptionGetStreamBasicDescription(desc: any): interop.Pointer | interop.Reference<AudioStreamBasicDescription>;

/**
 * @since 8.0
 */
declare function CMAudioSampleBufferCreateReadyWithPacketDescriptions(allocator: any, dataBuffer: any, formatDescription: any, numSamples: number, presentationTimeStamp: CMTime, packetDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMAudioSampleBufferCreateWithPacketDescriptions(allocator: any, dataBuffer: any, dataReady: boolean, makeDataReadyCallback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, makeDataReadyRefcon: interop.Pointer | interop.Reference<any>, formatDescription: any, numSamples: number, presentationTimeStamp: CMTime, packetDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 12.2
 */
declare function CMAudioSampleBufferCreateWithPacketDescriptionsAndMakeDataReadyHandler(allocator: any, dataBuffer: any, dataReady: boolean, formatDescription: any, numSamples: number, presentationTimeStamp: CMTime, packetDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, sampleBufferOut: interop.Pointer | interop.Reference<any>, makeDataReadyHandler: (p1: any) => number): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferAccessDataBytes(theBuffer: any, offset: number, length: number, temporaryBlock: interop.Pointer | interop.Reference<any>, returnedPointerOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferAppendBufferReference(theBuffer: any, targetBBuf: any, offsetToData: number, dataLength: number, flags: number): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferAppendMemoryBlock(theBuffer: any, memoryBlock: interop.Pointer | interop.Reference<any>, blockLength: number, blockAllocator: any, customBlockSource: interop.Pointer | interop.Reference<CMBlockBufferCustomBlockSource>, offsetToData: number, dataLength: number, flags: number): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferAssureBlockMemory(theBuffer: any): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferCopyDataBytes(theSourceBuffer: any, offsetToData: number, dataLength: number, destination: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferCreateContiguous(structureAllocator: any, sourceBuffer: any, blockAllocator: any, customBlockSource: interop.Pointer | interop.Reference<CMBlockBufferCustomBlockSource>, offsetToData: number, dataLength: number, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferCreateEmpty(structureAllocator: any, subBlockCapacity: number, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferCreateWithBufferReference(structureAllocator: any, bufferReference: any, offsetToData: number, dataLength: number, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferCreateWithMemoryBlock(structureAllocator: any, memoryBlock: interop.Pointer | interop.Reference<any>, blockLength: number, blockAllocator: any, customBlockSource: interop.Pointer | interop.Reference<CMBlockBufferCustomBlockSource>, offsetToData: number, dataLength: number, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

interface CMBlockBufferCustomBlockSource {
	version: number;
	AllocateBlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>;
	FreeBlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>;
	refCon: interop.Pointer | interop.Reference<any>;
}
declare var CMBlockBufferCustomBlockSource: interop.StructType<CMBlockBufferCustomBlockSource>;

/**
 * @since 4.0
 */
declare function CMBlockBufferFillDataBytes(fillByte: number, destinationBuffer: any, offsetIntoDestination: number, dataLength: number): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferGetDataLength(theBuffer: any): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferGetDataPointer(theBuffer: any, offset: number, lengthAtOffsetOut: interop.Pointer | interop.Reference<number>, totalLengthOut: interop.Pointer | interop.Reference<number>, dataPointerOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferGetTypeID(): number;

/**
 * @since 4.0
 */
declare function CMBlockBufferIsEmpty(theBuffer: any): boolean;

/**
 * @since 4.0
 */
declare function CMBlockBufferIsRangeContiguous(theBuffer: any, offset: number, length: number): boolean;

/**
 * @since 4.0
 */
declare function CMBlockBufferReplaceDataBytes(sourceBytes: interop.Pointer | interop.Reference<any>, destinationBuffer: any, offsetIntoDestination: number, dataLength: number): number;

interface CMBufferCallbacks {
	version: number;
	refcon: interop.Pointer | interop.Reference<any>;
	getDecodeTimeStamp: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => CMTime>;
	getPresentationTimeStamp: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => CMTime>;
	getDuration: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => CMTime>;
	isDataReady: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => boolean>;
	compare: interop.FunctionReference<(p1: any, p2: any, p3: interop.Pointer | interop.Reference<any>) => CFComparisonResult>;
	dataBecameReadyNotification: string;
	getSize: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>;
}
declare var CMBufferCallbacks: interop.StructType<CMBufferCallbacks>;

interface CMBufferHandlers {
	version: number;
	getDecodeTimeStamp: (p1: any) => CMTime;
	getPresentationTimeStamp: (p1: any) => CMTime;
	getDuration: (p1: any) => CMTime;
	isDataReady: (p1: any) => boolean;
	compare: (p1: any, p2: any) => CFComparisonResult;
	dataBecameReadyNotification: string;
	getSize: (p1: any) => number;
}
declare var CMBufferHandlers: interop.StructType<CMBufferHandlers>;

/**
 * @since 4.0
 */
declare function CMBufferQueueCallForEachBuffer(queue: any, callback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, refcon: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueContainsEndOfData(queue: any): boolean;

/**
 * @since 17.0
 */
declare function CMBufferQueueCopyHead(queue: any): any;

/**
 * @since 4.0
 */
declare function CMBufferQueueCreate(allocator: any, capacity: number, callbacks: interop.Pointer | interop.Reference<CMBufferCallbacks>, queueOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 12.2
 */
declare function CMBufferQueueCreateWithHandlers(allocator: any, capacity: number, handlers: interop.Pointer | interop.Reference<CMBufferHandlers>, queueOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueDequeueAndRetain(queue: any): any;

/**
 * @since 4.0
 */
declare function CMBufferQueueDequeueIfDataReadyAndRetain(queue: any): any;

/**
 * @since 4.0
 */
declare function CMBufferQueueEnqueue(queue: any, buf: any): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueGetBufferCount(queue: any): number;

/**
 * @since 4.3
 */
declare function CMBufferQueueGetCallbacksForSampleBuffersSortedByOutputPTS(): interop.Pointer | interop.Reference<CMBufferCallbacks>;

/**
 * @since 4.0
 */
declare function CMBufferQueueGetCallbacksForUnsortedSampleBuffers(): interop.Pointer | interop.Reference<CMBufferCallbacks>;

/**
 * @since 4.0
 */
declare function CMBufferQueueGetDuration(queue: any): CMTime;

/**
 * @since 4.0
 */
declare function CMBufferQueueGetEndPresentationTimeStamp(queue: any): CMTime;

/**
 * @since 4.0
 */
declare function CMBufferQueueGetFirstDecodeTimeStamp(queue: any): CMTime;

/**
 * @since 4.0
 */
declare function CMBufferQueueGetFirstPresentationTimeStamp(queue: any): CMTime;

/**
 * @since 4.0
 * @deprecated 18.0
 */
declare function CMBufferQueueGetHead(queue: any): any;

/**
 * @since 4.0
 */
declare function CMBufferQueueGetMaxPresentationTimeStamp(queue: any): CMTime;

/**
 * @since 4.0
 */
declare function CMBufferQueueGetMinDecodeTimeStamp(queue: any): CMTime;

/**
 * @since 4.0
 */
declare function CMBufferQueueGetMinPresentationTimeStamp(queue: any): CMTime;

/**
 * @since 7.1
 */
declare function CMBufferQueueGetTotalSize(queue: any): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueGetTypeID(): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueInstallTrigger(queue: any, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, refcon: interop.Pointer | interop.Reference<any>, condition: number, time: CMTime, triggerTokenOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 12.2
 */
declare function CMBufferQueueInstallTriggerHandler(queue: any, condition: number, time: CMTime, triggerTokenOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, handler: (p1: interop.Pointer | interop.Reference<any>) => void): number;

/**
 * @since 12.2
 */
declare function CMBufferQueueInstallTriggerHandlerWithIntegerThreshold(queue: any, condition: number, threshold: number, triggerTokenOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, handler: (p1: interop.Pointer | interop.Reference<any>) => void): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueInstallTriggerWithIntegerThreshold(queue: any, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, refcon: interop.Pointer | interop.Reference<any>, condition: number, threshold: number, triggerTokenOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueIsAtEndOfData(queue: any): boolean;

/**
 * @since 4.0
 */
declare function CMBufferQueueIsEmpty(queue: any): boolean;

/**
 * @since 4.0
 */
declare function CMBufferQueueMarkEndOfData(queue: any): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueRemoveTrigger(queue: any, triggerToken: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueReset(queue: any): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueResetWithCallback(queue: any, callback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => void>, refcon: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueSetValidationCallback(queue: any, callback: interop.FunctionReference<(p1: any, p2: any, p3: interop.Pointer | interop.Reference<any>) => number>, refcon: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 12.2
 */
declare function CMBufferQueueSetValidationHandler(queue: any, handler: (p1: any, p2: any) => number): number;

/**
 * @since 4.0
 */
declare function CMBufferQueueTestTrigger(queue: any, triggerToken: interop.Pointer | interop.Reference<any>): boolean;

/**
 * @since 6.0
 */
declare function CMClockConvertHostTimeToSystemUnits(hostTime: CMTime): number;

/**
 * @since 6.0
 */
declare function CMClockGetAnchorTime(clock: any, clockTimeOut: interop.Pointer | interop.Reference<CMTime>, referenceClockTimeOut: interop.Pointer | interop.Reference<CMTime>): number;

/**
 * @since 6.0
 */
declare function CMClockGetHostTimeClock(): any;

/**
 * @since 6.0
 */
declare function CMClockGetTime(clock: any): CMTime;

/**
 * @since 6.0
 */
declare function CMClockGetTypeID(): number;

/**
 * @since 6.0
 */
declare function CMClockInvalidate(clock: any): void;

/**
 * @since 6.0
 */
declare function CMClockMakeHostTimeFromSystemUnits(hostTime: number): CMTime;

/**
 * @since 6.0
 */
declare function CMClockMightDrift(clock: any, otherClock: any): boolean;

/**
 * @since 8.0
 */
declare function CMClosedCaptionFormatDescriptionCopyAsBigEndianClosedCaptionDescriptionBlockBuffer(allocator: any, closedCaptionFormatDescription: any, flavor: string, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMClosedCaptionFormatDescriptionCreateFromBigEndianClosedCaptionDescriptionBlockBuffer(allocator: any, closedCaptionDescriptionBlockBuffer: any, flavor: string, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMClosedCaptionFormatDescriptionCreateFromBigEndianClosedCaptionDescriptionData(allocator: any, closedCaptionDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, flavor: string, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMCopyDictionaryOfAttachments(allocator: any, target: any, attachmentMode: number): NSDictionary<any, any>;

/**
 * @since 8.0
 */
declare function CMDoesBigEndianSoundDescriptionRequireLegacyCBRSampleTableLayout(soundDescriptionBlockBuffer: any, flavor: string): boolean;

/**
 * @since 4.0
 */
declare function CMFormatDescriptionCreate(allocator: any, mediaType: number, mediaSubType: number, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMFormatDescriptionEqual(formatDescription: any, otherFormatDescription: any): boolean;

/**
 * @since 4.3
 */
declare function CMFormatDescriptionEqualIgnoringExtensionKeys(formatDescription: any, otherFormatDescription: any, formatDescriptionExtensionKeysToIgnore: any, sampleDescriptionExtensionAtomKeysToIgnore: any): boolean;

/**
 * @since 4.0
 */
declare function CMFormatDescriptionGetExtension(desc: any, extensionKey: string): any;

/**
 * @since 4.0
 */
declare function CMFormatDescriptionGetExtensions(desc: any): NSDictionary<any, any>;

/**
 * @since 4.0
 */
declare function CMFormatDescriptionGetMediaSubType(desc: any): number;

/**
 * @since 4.0
 */
declare function CMFormatDescriptionGetMediaType(desc: any): number;

/**
 * @since 4.0
 */
declare function CMFormatDescriptionGetTypeID(): number;

/**
 * @since 4.0
 */
declare function CMGetAttachment(target: any, key: string, attachmentModeOut: interop.Pointer | interop.Reference<number>): any;

/**
 * @since 6.0
 */
declare function CMMemoryPoolCreate(options: NSDictionary<any, any>): any;

/**
 * @since 6.0
 */
declare function CMMemoryPoolFlush(pool: any): void;

/**
 * @since 6.0
 */
declare function CMMemoryPoolGetAllocator(pool: any): any;

/**
 * @since 6.0
 */
declare function CMMemoryPoolGetTypeID(): number;

/**
 * @since 6.0
 */
declare function CMMemoryPoolInvalidate(pool: any): void;

/**
 * @since 8.0
 */
declare function CMMetadataCreateIdentifierForKeyAndKeySpace(allocator: any, key: any, keySpace: string, identifierOut: interop.Pointer | interop.Reference<string>): number;

/**
 * @since 8.0
 */
declare function CMMetadataCreateKeyFromIdentifier(allocator: any, identifier: string, keyOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMMetadataCreateKeyFromIdentifierAsCFData(allocator: any, identifier: string, keyOut: interop.Pointer | interop.Reference<NSData>): number;

/**
 * @since 8.0
 */
declare function CMMetadataCreateKeySpaceFromIdentifier(allocator: any, identifier: string, keySpaceOut: interop.Pointer | interop.Reference<string>): number;

/**
 * @since 8.0
 */
declare function CMMetadataDataTypeRegistryDataTypeConformsToDataType(dataType: string, conformsToDataType: string): boolean;

/**
 * @since 8.0
 */
declare function CMMetadataDataTypeRegistryDataTypeIsBaseDataType(dataType: string): boolean;

/**
 * @since 8.0
 */
declare function CMMetadataDataTypeRegistryDataTypeIsRegistered(dataType: string): boolean;

/**
 * @since 8.0
 */
declare function CMMetadataDataTypeRegistryGetBaseDataTypeForConformingDataType(dataType: string): string;

/**
 * @since 8.0
 */
declare function CMMetadataDataTypeRegistryGetBaseDataTypes(): NSArray<any>;

/**
 * @since 8.0
 */
declare function CMMetadataDataTypeRegistryGetConformingDataTypes(dataType: string): NSArray<any>;

/**
 * @since 8.0
 */
declare function CMMetadataDataTypeRegistryGetDataTypeDescription(dataType: string): string;

/**
 * @since 8.0
 */
declare function CMMetadataDataTypeRegistryRegisterDataType(dataType: string, description: string, conformingDataTypes: NSArray<any> | any[]): number;

/**
 * @since 8.0
 */
declare function CMMetadataFormatDescriptionCopyAsBigEndianMetadataDescriptionBlockBuffer(allocator: any, metadataFormatDescription: any, flavor: string, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMMetadataFormatDescriptionCreateByMergingMetadataFormatDescriptions(allocator: any, sourceDescription: any, otherSourceDescription: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMMetadataFormatDescriptionCreateFromBigEndianMetadataDescriptionBlockBuffer(allocator: any, metadataDescriptionBlockBuffer: any, flavor: string, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMMetadataFormatDescriptionCreateFromBigEndianMetadataDescriptionData(allocator: any, metadataDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, flavor: string, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMMetadataFormatDescriptionCreateWithKeys(allocator: any, metadataType: number, keys: NSArray<any> | any[], formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMMetadataFormatDescriptionCreateWithMetadataFormatDescriptionAndMetadataSpecifications(allocator: any, sourceDescription: any, metadataSpecifications: NSArray<any> | any[], formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMMetadataFormatDescriptionCreateWithMetadataSpecifications(allocator: any, metadataType: number, metadataSpecifications: NSArray<any> | any[], formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMMetadataFormatDescriptionGetIdentifiers(desc: any): NSArray<any>;

/**
 * @since 4.0
 */
declare function CMMetadataFormatDescriptionGetKeyWithLocalID(desc: any, localKeyID: number): NSDictionary<any, any>;

/**
 * @since 4.0
 */
declare function CMMuxedFormatDescriptionCreate(allocator: any, muxType: number, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare const enum CMPackingType {

	kCMPackingType_None = 1852796517,

	kCMPackingType_SideBySide = 1936286821,

	kCMPackingType_OverUnder = 1870030194
}

/**
 * @since 17.0
 */
declare const enum CMProjectionType {

	kCMProjectionType_Rectangular = 1919247220,

	kCMProjectionType_Equirectangular = 1701934441,

	kCMProjectionType_HalfEquirectangular = 1751478645,

	kCMProjectionType_Fisheye = 1718186856
}

/**
 * @since 4.0
 */
declare function CMPropagateAttachments(source: any, destination: any): void;

/**
 * @since 4.0
 */
declare function CMRemoveAllAttachments(target: any): void;

/**
 * @since 4.0
 */
declare function CMRemoveAttachment(target: any, key: string): void;

/**
 * @since 8.0
 */
declare function CMSampleBufferCallBlockForEachSample(sbuf: any, handler: (p1: any, p2: number) => number): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferCallForEachSample(sbuf: any, callback: interop.FunctionReference<(p1: any, p2: number, p3: interop.Pointer | interop.Reference<any>) => number>, refcon: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 7.0
 */
declare function CMSampleBufferCopyPCMDataIntoAudioBufferList(sbuf: any, frameOffset: number, numFrames: number, bufferList: interop.Pointer | interop.Reference<AudioBufferList>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferCopySampleBufferForRange(allocator: any, sbuf: any, sampleRange: CFRange, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferCreate(allocator: any, dataBuffer: any, dataReady: boolean, makeDataReadyCallback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, makeDataReadyRefcon: interop.Pointer | interop.Reference<any>, formatDescription: any, numSamples: number, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, numSampleSizeEntries: number, sampleSizeArray: interop.Pointer | interop.Reference<number>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferCreateCopy(allocator: any, sbuf: any, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferCreateCopyWithNewTiming(allocator: any, originalSBuf: any, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferCreateForImageBuffer(allocator: any, imageBuffer: any, dataReady: boolean, makeDataReadyCallback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, makeDataReadyRefcon: interop.Pointer | interop.Reference<any>, formatDescription: any, sampleTiming: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 12.2
 */
declare function CMSampleBufferCreateForImageBufferWithMakeDataReadyHandler(allocator: any, imageBuffer: any, dataReady: boolean, formatDescription: any, sampleTiming: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sampleBufferOut: interop.Pointer | interop.Reference<any>, makeDataReadyHandler: (p1: any) => number): number;

/**
 * @since 17.0
 */
declare function CMSampleBufferCreateForTaggedBufferGroup(allocator: any, taggedBufferGroup: any, sbufPTS: CMTime, sbufDuration: CMTime, formatDescription: any, sBufOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMSampleBufferCreateReady(allocator: any, dataBuffer: any, formatDescription: any, numSamples: number, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, numSampleSizeEntries: number, sampleSizeArray: interop.Pointer | interop.Reference<number>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMSampleBufferCreateReadyWithImageBuffer(allocator: any, imageBuffer: any, formatDescription: any, sampleTiming: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 12.2
 */
declare function CMSampleBufferCreateWithMakeDataReadyHandler(allocator: any, dataBuffer: any, dataReady: boolean, formatDescription: any, numSamples: number, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, numSampleSizeEntries: number, sampleSizeArray: interop.Pointer | interop.Reference<number>, sampleBufferOut: interop.Pointer | interop.Reference<any>, makeDataReadyHandler: (p1: any) => number): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferDataIsReady(sbuf: any): boolean;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(sbuf: any, bufferListSizeNeededOut: interop.Pointer | interop.Reference<number>, bufferListOut: interop.Pointer | interop.Reference<AudioBufferList>, bufferListSize: number, blockBufferStructureAllocator: any, blockBufferBlockAllocator: any, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetAudioStreamPacketDescriptions(sbuf: any, packetDescriptionsSize: number, packetDescriptionsOut: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, packetDescriptionsSizeNeededOut: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetAudioStreamPacketDescriptionsPtr(sbuf: any, packetDescriptionsPointerOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<AudioStreamPacketDescription>>, packetDescriptionsSizeOut: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetDataBuffer(sbuf: any): any;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetDecodeTimeStamp(sbuf: any): CMTime;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetDuration(sbuf: any): CMTime;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetFormatDescription(sbuf: any): any;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetImageBuffer(sbuf: any): any;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetNumSamples(sbuf: any): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetOutputDecodeTimeStamp(sbuf: any): CMTime;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetOutputDuration(sbuf: any): CMTime;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetOutputPresentationTimeStamp(sbuf: any): CMTime;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetOutputSampleTimingInfoArray(sbuf: any, timingArrayEntries: number, timingArrayOut: interop.Pointer | interop.Reference<CMSampleTimingInfo>, timingArrayEntriesNeededOut: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetPresentationTimeStamp(sbuf: any): CMTime;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetSampleAttachmentsArray(sbuf: any, createIfNecessary: boolean): NSArray<any>;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetSampleSize(sbuf: any, sampleIndex: number): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetSampleSizeArray(sbuf: any, sizeArrayEntries: number, sizeArrayOut: interop.Pointer | interop.Reference<number>, sizeArrayEntriesNeededOut: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetSampleTimingInfo(sbuf: any, sampleIndex: number, timingInfoOut: interop.Pointer | interop.Reference<CMSampleTimingInfo>): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetSampleTimingInfoArray(sbuf: any, numSampleTimingEntries: number, timingArrayOut: interop.Pointer | interop.Reference<CMSampleTimingInfo>, timingArrayEntriesNeededOut: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 17.0
 */
declare function CMSampleBufferGetTaggedBufferGroup(sbuf: any): any;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetTotalSampleSize(sbuf: any): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferGetTypeID(): number;

/**
 * @since 8.0
 */
declare function CMSampleBufferHasDataFailed(sbuf: any, statusOut: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 4.0
 */
declare function CMSampleBufferInvalidate(sbuf: any): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferIsValid(sbuf: any): boolean;

/**
 * @since 4.0
 */
declare function CMSampleBufferMakeDataReady(sbuf: any): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferSetDataBuffer(sbuf: any, dataBuffer: any): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferSetDataBufferFromAudioBufferList(sbuf: any, blockBufferStructureAllocator: any, blockBufferBlockAllocator: any, flags: number, bufferList: interop.Pointer | interop.Reference<AudioBufferList>): number;

/**
 * @since 8.0
 */
declare function CMSampleBufferSetDataFailed(sbuf: any, status: number): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferSetDataReady(sbuf: any): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferSetInvalidateCallback(sbuf: any, invalidateCallback: interop.FunctionReference<(p1: any, p2: number) => void>, invalidateRefCon: number): number;

/**
 * @since 8.0
 */
declare function CMSampleBufferSetInvalidateHandler(sbuf: any, invalidateHandler: (p1: any) => void): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferSetOutputPresentationTimeStamp(sbuf: any, outputPresentationTimeStamp: CMTime): number;

/**
 * @since 4.0
 */
declare function CMSampleBufferTrackDataReadiness(sbuf: any, sampleBufferToTrack: any): number;

interface CMSampleTimingInfo {
	duration: CMTime;
	presentationTimeStamp: CMTime;
	decodeTimeStamp: CMTime;
}
declare var CMSampleTimingInfo: interop.StructType<CMSampleTimingInfo>;

/**
 * @since 4.0
 */
declare function CMSetAttachment(target: any, key: string, value: any, attachmentMode: number): void;

/**
 * @since 4.0
 */
declare function CMSetAttachments(target: any, theAttachments: NSDictionary<any, any>, attachmentMode: number): void;

/**
 * @since 5.0
 */
declare function CMSimpleQueueCreate(allocator: any, capacity: number, queueOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function CMSimpleQueueDequeue(queue: any): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function CMSimpleQueueEnqueue(queue: any, element: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function CMSimpleQueueGetCapacity(queue: any): number;

/**
 * @since 5.0
 */
declare function CMSimpleQueueGetCount(queue: any): number;

/**
 * @since 5.0
 */
declare function CMSimpleQueueGetHead(queue: any): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function CMSimpleQueueGetTypeID(): number;

/**
 * @since 5.0
 */
declare function CMSimpleQueueReset(queue: any): number;

/**
 * @since 17.0
 */
declare const enum CMStereoViewComponents {

	kCMStereoView_None = 0,

	kCMStereoView_LeftEye = 1,

	kCMStereoView_RightEye = 2
}

/**
 * @since 17.0
 */
declare const enum CMStereoViewInterpretationOptions {

	kCMStereoViewInterpretation_Default = 0,

	kCMStereoViewInterpretation_StereoOrderReversed = 1,

	kCMStereoViewInterpretation_AdditionalViews = 2
}

/**
 * @since 8.0
 */
declare function CMSwapBigEndianClosedCaptionDescriptionToHost(closedCaptionDescriptionData: string | interop.Pointer | interop.Reference<any>, closedCaptionDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapBigEndianImageDescriptionToHost(imageDescriptionData: string | interop.Pointer | interop.Reference<any>, imageDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapBigEndianMetadataDescriptionToHost(metadataDescriptionData: string | interop.Pointer | interop.Reference<any>, metadataDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapBigEndianSoundDescriptionToHost(soundDescriptionData: string | interop.Pointer | interop.Reference<any>, soundDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapBigEndianTextDescriptionToHost(textDescriptionData: string | interop.Pointer | interop.Reference<any>, textDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapBigEndianTimeCodeDescriptionToHost(timeCodeDescriptionData: string | interop.Pointer | interop.Reference<any>, timeCodeDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapHostEndianClosedCaptionDescriptionToBig(closedCaptionDescriptionData: string | interop.Pointer | interop.Reference<any>, closedCaptionDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapHostEndianImageDescriptionToBig(imageDescriptionData: string | interop.Pointer | interop.Reference<any>, imageDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapHostEndianMetadataDescriptionToBig(metadataDescriptionData: string | interop.Pointer | interop.Reference<any>, metadataDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapHostEndianSoundDescriptionToBig(soundDescriptionData: string | interop.Pointer | interop.Reference<any>, soundDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapHostEndianTextDescriptionToBig(textDescriptionData: string | interop.Pointer | interop.Reference<any>, textDescriptionSize: number): number;

/**
 * @since 8.0
 */
declare function CMSwapHostEndianTimeCodeDescriptionToBig(timeCodeDescriptionData: string | interop.Pointer | interop.Reference<any>, timeCodeDescriptionSize: number): number;

/**
 * @since 6.0
 */
declare function CMSyncConvertTime(time: CMTime, fromClockOrTimebase: any, toClockOrTimebase: any): CMTime;

/**
 * @since 6.0
 */
declare function CMSyncGetRelativeRate(ofClockOrTimebase: any, relativeToClockOrTimebase: any): number;

/**
 * @since 6.0
 */
declare function CMSyncGetRelativeRateAndAnchorTime(ofClockOrTimebase: any, relativeToClockOrTimebase: any, outRelativeRate: interop.Pointer | interop.Reference<number>, outOfClockOrTimebaseAnchorTime: interop.Pointer | interop.Reference<CMTime>, outRelativeToClockOrTimebaseAnchorTime: interop.Pointer | interop.Reference<CMTime>): number;

/**
 * @since 6.0
 */
declare function CMSyncGetTime(clockOrTimebase: any): CMTime;

/**
 * @since 6.0
 */
declare function CMSyncMightDrift(clockOrTimebase1: any, clockOrTimebase2: any): boolean;

/**
 * @since 17.0
 */
interface CMTag {
	category: CMTagCategory;
	dataType: CMTagDataType;
	value: number;
}
declare var CMTag: interop.StructType<CMTag>;

/**
 * @since 17.0
 */
declare const enum CMTagCategory {

	kCMTagCategory_Undefined = 0,

	kCMTagCategory_MediaType = 1835297121,

	kCMTagCategory_MediaSubType = 1836283234,

	kCMTagCategory_TrackID = 1953653099,

	kCMTagCategory_ChannelID = 1986226286,

	kCMTagCategory_VideoLayerID = 1986814329,

	kCMTagCategory_PixelFormat = 1885960294,

	kCMTagCategory_PackingType = 1885430635,

	kCMTagCategory_ProjectionType = 1886547818,

	kCMTagCategory_StereoView = 1702454643,

	kCMTagCategory_StereoViewInterpretation = 1702455664
}

/**
 * @since 17.0
 */
declare function CMTagCategoryEqualToTagCategory(tag1: CMTag, tag2: CMTag): boolean;

/**
 * @since 17.0
 */
declare function CMTagCategoryValueEqualToValue(tag1: CMTag, tag2: CMTag): boolean;

/**
 * @since 17.0
 */
declare function CMTagCollectionAddTag(tagCollection: any, tagToAdd: CMTag): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionAddTagsFromArray(tagCollection: any, tags: interop.Pointer | interop.Reference<CMTag>, tagCount: number): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionAddTagsFromCollection(tagCollection: any, collectionWithTagsToAdd: any): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionApply(tagCollection: any, applier: interop.FunctionReference<(p1: CMTag, p2: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 17.0
 */
declare function CMTagCollectionApplyUntil(tagCollection: any, applier: interop.FunctionReference<(p1: CMTag, p2: interop.Pointer | interop.Reference<any>) => boolean>, context: interop.Pointer | interop.Reference<any>): CMTag;

/**
 * @since 17.0
 */
declare function CMTagCollectionContainsCategory(tagCollection: any, category: CMTagCategory): boolean;

/**
 * @since 17.0
 */
declare function CMTagCollectionContainsSpecifiedTags(tagCollection: any, containedTags: interop.Pointer | interop.Reference<CMTag>, containedTagCount: number): boolean;

/**
 * @since 17.0
 */
declare function CMTagCollectionContainsTag(tagCollection: any, tag: CMTag): boolean;

/**
 * @since 17.0
 */
declare function CMTagCollectionContainsTagsOfCollection(tagCollection: any, containedTagCollection: any): boolean;

/**
 * @since 17.0
 */
declare function CMTagCollectionCopyAsData(tagCollection: any, allocator: any): NSData;

/**
 * @since 17.0
 */
declare function CMTagCollectionCopyAsDictionary(tagCollection: any, allocator: any): NSDictionary<any, any>;

/**
 * @since 17.0
 */
declare function CMTagCollectionCopyDescription(allocator: any, tagCollection: any): string;

/**
 * @since 17.0
 */
declare function CMTagCollectionCopyTagsOfCategories(allocator: any, tagCollection: any, categories: interop.Pointer | interop.Reference<CMTagCategory>, categoriesCount: number, collectionWithTagsOfCategories: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCountTagsWithFilterFunction(tagCollection: any, filterApplier: interop.FunctionReference<(p1: CMTag, p2: interop.Pointer | interop.Reference<any>) => boolean>, context: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCreate(allocator: any, tags: interop.Pointer | interop.Reference<CMTag>, tagCount: number, newCollectionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCreateCopy(tagCollection: any, allocator: any, newCollectionCopyOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCreateDifference(tagCollectionMinuend: any, tagCollectionSubtrahend: any, tagCollectionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCreateExclusiveOr(tagCollection1: any, tagCollection2: any, tagCollectionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCreateFromData(data: NSData, allocator: any, newCollectionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCreateFromDictionary(dict: NSDictionary<any, any>, allocator: any, newCollectionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCreateIntersection(tagCollection1: any, tagCollection2: any, tagCollectionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCreateMutable(allocator: any, capacity: number, newMutableCollectionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCreateMutableCopy(tagCollection: any, allocator: any, newMutableCollectionCopyOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionCreateUnion(tagCollection1: any, tagCollection2: any, tagCollectionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare const enum CMTagCollectionError {

	kCMTagCollectionError_ParamErr = -15740,

	kCMTagCollectionError_AllocationFailed = -15741,

	kCMTagCollectionError_InternalError = -15742,

	kCMTagCollectionError_InvalidTag = -15743,

	kCMTagCollectionError_InvalidTagCollectionDictionary = -15744,

	kCMTagCollectionError_InvalidTagCollectionData = -15745,

	kCMTagCollectionError_TagNotFound = -15746,

	kCMTagCollectionError_InvalidTagCollectionDataVersion = -15747,

	kCMTagCollectionError_ExhaustedBufferSize = -15748,

	kCMTagCollectionError_NotYetImplemented = -15749
}

/**
 * @since 17.0
 */
declare function CMTagCollectionGetCount(tagCollection: any): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionGetCountOfCategory(tagCollection: any, category: CMTagCategory): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionGetTags(tagCollection: any, tagBuffer: interop.Pointer | interop.Reference<CMTag>, tagBufferCount: number, numberOfTagsCopied: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionGetTagsWithCategory(tagCollection: any, category: CMTagCategory, tagBuffer: interop.Pointer | interop.Reference<CMTag>, tagBufferCount: number, numberOfTagsCopied: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionGetTagsWithFilterFunction(tagCollection: any, tagBuffer: interop.Pointer | interop.Reference<CMTag>, tagBufferCount: number, numberOfTagsCopied: interop.Pointer | interop.Reference<number>, filter: interop.FunctionReference<(p1: CMTag, p2: interop.Pointer | interop.Reference<any>) => boolean>, context: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionGetTypeID(): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionIsEmpty(tagCollection: any): boolean;

/**
 * @since 17.0
 */
declare function CMTagCollectionRemoveAllTags(tagCollection: any): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionRemoveAllTagsOfCategory(tagCollection: any, category: CMTagCategory): number;

/**
 * @since 17.0
 */
declare function CMTagCollectionRemoveTag(tagCollection: any, tagToRemove: CMTag): number;

/**
 * @since 17.0
 */
declare function CMTagCompare(tag1: CMTag, tag2: CMTag): CFComparisonResult;

/**
 * @since 17.0
 */
declare function CMTagCopyAsDictionary(tag: CMTag, allocator: any): NSDictionary<any, any>;

/**
 * @since 17.0
 */
declare function CMTagCopyDescription(allocator: any, tag: CMTag): string;

/**
 * @since 17.0
 */
declare const enum CMTagDataType {

	kCMTagDataType_Invalid = 0,

	kCMTagDataType_SInt64 = 2,

	kCMTagDataType_Float64 = 3,

	kCMTagDataType_OSType = 5,

	kCMTagDataType_Flags = 7
}

/**
 * @since 17.0
 */
declare function CMTagEqualToTag(tag1: CMTag, tag2: CMTag): boolean;

/**
 * @since 17.0
 */
declare const enum CMTagError {

	kCMTagError_ParamErr = -15730,

	kCMTagError_AllocationFailed = -15731
}

/**
 * @since 17.0
 */
declare function CMTagGetCategory(tag: CMTag): CMTagCategory;

/**
 * @since 17.0
 */
declare function CMTagGetFlagsValue(tag: CMTag): number;

/**
 * @since 17.0
 */
declare function CMTagGetFloat64Value(tag: CMTag): number;

/**
 * @since 17.0
 */
declare function CMTagGetOSTypeValue(tag: CMTag): number;

/**
 * @since 17.0
 */
declare function CMTagGetSInt64Value(tag: CMTag): number;

/**
 * @since 17.0
 */
declare function CMTagGetValue(tag: CMTag): number;

/**
 * @since 17.0
 */
declare function CMTagGetValueDataType(tag: CMTag): CMTagDataType;

/**
 * @since 17.0
 */
declare function CMTagHasCategory(tag: CMTag, category: CMTagCategory): boolean;

/**
 * @since 17.0
 */
declare function CMTagHasFlagsValue(tag: CMTag): boolean;

/**
 * @since 17.0
 */
declare function CMTagHasFloat64Value(tag: CMTag): boolean;

/**
 * @since 17.0
 */
declare function CMTagHasOSTypeValue(tag: CMTag): boolean;

/**
 * @since 17.0
 */
declare function CMTagHasSInt64Value(tag: CMTag): boolean;

/**
 * @since 17.0
 */
declare function CMTagHash(tag: CMTag): number;

/**
 * @since 17.0
 */
declare function CMTagIsValid(tag: CMTag): boolean;

/**
 * @since 17.0
 */
declare function CMTagMakeFromDictionary(dict: NSDictionary<any, any>): CMTag;

/**
 * @since 17.0
 */
declare function CMTagMakeWithFlagsValue(category: CMTagCategory, flagsForTag: number): CMTag;

/**
 * @since 17.0
 */
declare function CMTagMakeWithFloat64Value(category: CMTagCategory, value: number): CMTag;

/**
 * @since 17.0
 */
declare function CMTagMakeWithOSTypeValue(category: CMTagCategory, value: number): CMTag;

/**
 * @since 17.0
 */
declare function CMTagMakeWithSInt64Value(category: CMTagCategory, value: number): CMTag;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupCreate(allocator: any, tagCollections: NSArray<any> | any[], buffers: NSArray<any> | any[], groupOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupCreateCombined(allocator: any, taggedBufferGroups: NSArray<any> | any[], groupOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare const enum CMTaggedBufferGroupError {

	kCMTaggedBufferGroupError_ParamErr = -15780,

	kCMTaggedBufferGroupError_AllocationFailed = -15781,

	kCMTaggedBufferGroupError_InternalError = -15782
}

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupFormatDescriptionCreateForTaggedBufferGroup(allocator: any, taggedBufferGroup: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupFormatDescriptionMatchesTaggedBufferGroup(desc: any, taggedBufferGroup: any): boolean;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupGetCMSampleBufferAtIndex(group: any, index: number): any;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupGetCMSampleBufferForTag(group: any, tag: CMTag, indexOut: interop.Pointer | interop.Reference<number>): any;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupGetCMSampleBufferForTagCollection(group: any, tagCollection: any, indexOut: interop.Pointer | interop.Reference<number>): any;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupGetCVPixelBufferAtIndex(group: any, index: number): any;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupGetCVPixelBufferForTag(group: any, tag: CMTag, indexOut: interop.Pointer | interop.Reference<number>): any;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupGetCVPixelBufferForTagCollection(group: any, tagCollection: any, indexOut: interop.Pointer | interop.Reference<number>): any;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupGetCount(group: any): number;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupGetNumberOfMatchesForTagCollection(group: any, tagCollection: any): number;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupGetTagCollectionAtIndex(group: any, index: number): any;

/**
 * @since 17.0
 */
declare function CMTaggedBufferGroupGetTypeID(): number;

/**
 * @since 8.0
 */
declare function CMTextFormatDescriptionCopyAsBigEndianTextDescriptionBlockBuffer(allocator: any, textFormatDescription: any, flavor: string, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMTextFormatDescriptionCreateFromBigEndianTextDescriptionBlockBuffer(allocator: any, textDescriptionBlockBuffer: any, flavor: string, mediaType: number, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMTextFormatDescriptionCreateFromBigEndianTextDescriptionData(allocator: any, textDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, flavor: string, mediaType: number, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMTextFormatDescriptionGetDefaultStyle(desc: any, localFontIDOut: interop.Pointer | interop.Reference<number>, boldOut: string | interop.Pointer | interop.Reference<any>, italicOut: string | interop.Pointer | interop.Reference<any>, underlineOut: string | interop.Pointer | interop.Reference<any>, fontSizeOut: interop.Pointer | interop.Reference<number>, colorComponentsOut: interop.Reference<number>): number;

/**
 * @since 4.0
 */
declare function CMTextFormatDescriptionGetDefaultTextBox(desc: any, originIsAtTopLeft: boolean, heightOfTextTrack: number, defaultTextBoxOut: interop.Pointer | interop.Reference<CGRect>): number;

/**
 * @since 4.0
 */
declare function CMTextFormatDescriptionGetDisplayFlags(desc: any, displayFlagsOut: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.0
 */
declare function CMTextFormatDescriptionGetFontName(desc: any, localFontID: number, fontNameOut: interop.Pointer | interop.Reference<string>): number;

/**
 * @since 4.0
 */
declare function CMTextFormatDescriptionGetJustification(desc: any, horizontaJustificationlOut: interop.Pointer | interop.Reference<number>, verticalJustificationOut: interop.Pointer | interop.Reference<number>): number;

interface CMTime {
	value: number;
	timescale: number;
	flags: CMTimeFlags;
	epoch: number;
}
declare var CMTime: interop.StructType<CMTime>;

/**
 * @since 4.0
 */
declare function CMTimeAbsoluteValue(time: CMTime): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeAdd(lhs: CMTime, rhs: CMTime): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeClampToRange(time: CMTime, range: CMTimeRange): CMTime;

/**
 * @since 8.0
 */
declare function CMTimeCodeFormatDescriptionCopyAsBigEndianTimeCodeDescriptionBlockBuffer(allocator: any, timeCodeFormatDescription: any, flavor: string, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMTimeCodeFormatDescriptionCreate(allocator: any, timeCodeFormatType: number, frameDuration: CMTime, frameQuanta: number, flags: number, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMTimeCodeFormatDescriptionCreateFromBigEndianTimeCodeDescriptionBlockBuffer(allocator: any, timeCodeDescriptionBlockBuffer: any, flavor: string, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMTimeCodeFormatDescriptionCreateFromBigEndianTimeCodeDescriptionData(allocator: any, timeCodeDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, flavor: string, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMTimeCodeFormatDescriptionGetFrameDuration(timeCodeFormatDescription: any): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeCodeFormatDescriptionGetFrameQuanta(timeCodeFormatDescription: any): number;

/**
 * @since 4.0
 */
declare function CMTimeCodeFormatDescriptionGetTimeCodeFlags(desc: any): number;

/**
 * @since 4.0
 */
declare function CMTimeCompare(time1: CMTime, time2: CMTime): number;

/**
 * @since 4.0
 */
declare function CMTimeConvertScale(time: CMTime, newTimescale: number, method: CMTimeRoundingMethod): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeCopyAsDictionary(time: CMTime, allocator: any): NSDictionary<any, any>;

/**
 * @since 4.0
 */
declare function CMTimeCopyDescription(allocator: any, time: CMTime): string;

/**
 * @since 4.0
 */
declare const enum CMTimeFlags {

	kCMTimeFlags_Valid = 1,

	kCMTimeFlags_HasBeenRounded = 2,

	kCMTimeFlags_PositiveInfinity = 4,

	kCMTimeFlags_NegativeInfinity = 8,

	kCMTimeFlags_Indefinite = 16,

	kCMTimeFlags_ImpliedValueFlagsMask = 28
}

/**
 * @since 12.0
 */
declare function CMTimeFoldIntoRange(time: CMTime, foldRange: CMTimeRange): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeGetSeconds(time: CMTime): number;

/**
 * @since 4.0
 */
declare function CMTimeMake(value: number, timescale: number): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeMakeFromDictionary(dictionaryRepresentation: NSDictionary<any, any>): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeMakeWithEpoch(value: number, timescale: number, epoch: number): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeMakeWithSeconds(seconds: number, preferredTimescale: number): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeMapDurationFromRangeToRange(dur: CMTime, fromRange: CMTimeRange, toRange: CMTimeRange): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeMapTimeFromRangeToRange(t: CMTime, fromRange: CMTimeRange, toRange: CMTimeRange): CMTime;

interface CMTimeMapping {
	source: CMTimeRange;
	target: CMTimeRange;
}
declare var CMTimeMapping: interop.StructType<CMTimeMapping>;

/**
 * @since 9.0
 */
declare function CMTimeMappingCopyAsDictionary(mapping: CMTimeMapping, allocator: any): NSDictionary<any, any>;

/**
 * @since 9.0
 */
declare function CMTimeMappingCopyDescription(allocator: any, mapping: CMTimeMapping): string;

/**
 * @since 9.0
 */
declare function CMTimeMappingMake(source: CMTimeRange, target: CMTimeRange): CMTimeMapping;

/**
 * @since 9.0
 */
declare function CMTimeMappingMakeEmpty(target: CMTimeRange): CMTimeMapping;

/**
 * @since 9.0
 */
declare function CMTimeMappingMakeFromDictionary(dictionaryRepresentation: NSDictionary<any, any>): CMTimeMapping;

/**
 * @since 9.0
 */
declare function CMTimeMappingShow(mapping: CMTimeMapping): void;

/**
 * @since 4.0
 */
declare function CMTimeMaximum(time1: CMTime, time2: CMTime): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeMinimum(time1: CMTime, time2: CMTime): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeMultiply(time: CMTime, multiplier: number): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeMultiplyByFloat64(time: CMTime, multiplier: number): CMTime;

/**
 * @since 7.1
 */
declare function CMTimeMultiplyByRatio(time: CMTime, multiplier: number, divisor: number): CMTime;

interface CMTimeRange {
	start: CMTime;
	duration: CMTime;
}
declare var CMTimeRange: interop.StructType<CMTimeRange>;

/**
 * @since 4.0
 */
declare function CMTimeRangeContainsTime(range: CMTimeRange, time: CMTime): boolean;

/**
 * @since 4.0
 */
declare function CMTimeRangeContainsTimeRange(range: CMTimeRange, otherRange: CMTimeRange): boolean;

/**
 * @since 4.0
 */
declare function CMTimeRangeCopyAsDictionary(range: CMTimeRange, allocator: any): NSDictionary<any, any>;

/**
 * @since 4.0
 */
declare function CMTimeRangeCopyDescription(allocator: any, range: CMTimeRange): string;

/**
 * @since 4.0
 */
declare function CMTimeRangeEqual(range1: CMTimeRange, range2: CMTimeRange): boolean;

/**
 * @since 4.0
 */
declare function CMTimeRangeFromTimeToTime(start: CMTime, end: CMTime): CMTimeRange;

/**
 * @since 4.0
 */
declare function CMTimeRangeGetEnd(range: CMTimeRange): CMTime;

/**
 * @since 4.0
 */
declare function CMTimeRangeGetIntersection(range: CMTimeRange, otherRange: CMTimeRange): CMTimeRange;

/**
 * @since 4.0
 */
declare function CMTimeRangeGetUnion(range: CMTimeRange, otherRange: CMTimeRange): CMTimeRange;

/**
 * @since 4.0
 */
declare function CMTimeRangeMake(start: CMTime, duration: CMTime): CMTimeRange;

/**
 * @since 4.0
 */
declare function CMTimeRangeMakeFromDictionary(dictionaryRepresentation: NSDictionary<any, any>): CMTimeRange;

/**
 * @since 4.0
 */
declare function CMTimeRangeShow(range: CMTimeRange): void;

/**
 * @since 4.0
 */
declare const enum CMTimeRoundingMethod {

	kCMTimeRoundingMethod_RoundHalfAwayFromZero = 1,

	kCMTimeRoundingMethod_RoundTowardZero = 2,

	kCMTimeRoundingMethod_RoundAwayFromZero = 3,

	kCMTimeRoundingMethod_QuickTime = 4,

	kCMTimeRoundingMethod_RoundTowardPositiveInfinity = 5,

	kCMTimeRoundingMethod_RoundTowardNegativeInfinity = 6,

	kCMTimeRoundingMethod_Default = 1
}

/**
 * @since 4.0
 */
declare function CMTimeShow(time: CMTime): void;

/**
 * @since 4.0
 */
declare function CMTimeSubtract(lhs: CMTime, rhs: CMTime): CMTime;

/**
 * @since 6.0
 */
declare function CMTimebaseAddTimer(timebase: any, timer: NSTimer, runloop: any): number;

/**
 * @since 6.0
 */
declare function CMTimebaseAddTimerDispatchSource(timebase: any, timerSource: NSObject & OS_dispatch_source): number;

/**
 * @since 9.0
 */
declare function CMTimebaseCopySource(timebase: any): any;

/**
 * @since 9.0
 */
declare function CMTimebaseCopySourceClock(timebase: any): any;

/**
 * @since 9.0
 */
declare function CMTimebaseCopySourceTimebase(timebase: any): any;

/**
 * @since 9.0
 */
declare function CMTimebaseCopyUltimateSourceClock(timebase: any): any;

/**
 * @since 6.0
 */
declare function CMTimebaseCreateWithSourceClock(allocator: any, sourceClock: any, timebaseOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 6.0
 */
declare function CMTimebaseCreateWithSourceTimebase(allocator: any, sourceTimebase: any, timebaseOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 6.0
 */
declare function CMTimebaseGetEffectiveRate(timebase: any): number;

/**
 * @since 6.0
 * @deprecated 9.0
 */
declare function CMTimebaseGetMaster(timebase: any): any;

/**
 * @since 6.0
 * @deprecated 9.0
 */
declare function CMTimebaseGetMasterClock(timebase: any): any;

/**
 * @since 6.0
 * @deprecated 9.0
 */
declare function CMTimebaseGetMasterTimebase(timebase: any): any;

/**
 * @since 6.0
 */
declare function CMTimebaseGetRate(timebase: any): number;

/**
 * @since 6.0
 */
declare function CMTimebaseGetTime(timebase: any): CMTime;

/**
 * @since 6.0
 */
declare function CMTimebaseGetTimeAndRate(timebase: any, timeOut: interop.Pointer | interop.Reference<CMTime>, rateOut: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 6.0
 */
declare function CMTimebaseGetTimeWithTimeScale(timebase: any, timescale: number, method: CMTimeRoundingMethod): CMTime;

/**
 * @since 6.0
 */
declare function CMTimebaseGetTypeID(): number;

/**
 * @since 6.0
 * @deprecated 9.0
 */
declare function CMTimebaseGetUltimateMasterClock(timebase: any): any;

/**
 * @since 6.0
 */
declare function CMTimebaseNotificationBarrier(timebase: any): number;

/**
 * @since 6.0
 */
declare function CMTimebaseRemoveTimer(timebase: any, timer: NSTimer): number;

/**
 * @since 6.0
 */
declare function CMTimebaseRemoveTimerDispatchSource(timebase: any, timerSource: NSObject & OS_dispatch_source): number;

/**
 * @since 6.0
 */
declare function CMTimebaseSetAnchorTime(timebase: any, timebaseTime: CMTime, immediateSourceTime: CMTime): number;

/**
 * @since 6.0
 */
declare function CMTimebaseSetRate(timebase: any, rate: number): number;

/**
 * @since 6.0
 */
declare function CMTimebaseSetRateAndAnchorTime(timebase: any, rate: number, timebaseTime: CMTime, immediateSourceTime: CMTime): number;

/**
 * @since 6.0
 */
declare function CMTimebaseSetSourceClock(timebase: any, newSourceClock: any): number;

/**
 * @since 6.0
 */
declare function CMTimebaseSetSourceTimebase(timebase: any, newSourceTimebase: any): number;

/**
 * @since 6.0
 */
declare function CMTimebaseSetTime(timebase: any, time: CMTime): number;

/**
 * @since 6.0
 */
declare function CMTimebaseSetTimerDispatchSourceNextFireTime(timebase: any, timerSource: NSObject & OS_dispatch_source, fireTime: CMTime, flags: number): number;

/**
 * @since 6.0
 */
declare function CMTimebaseSetTimerDispatchSourceToFireImmediately(timebase: any, timerSource: NSObject & OS_dispatch_source): number;

/**
 * @since 6.0
 */
declare function CMTimebaseSetTimerNextFireTime(timebase: any, timer: NSTimer, fireTime: CMTime, flags: number): number;

/**
 * @since 6.0
 */
declare function CMTimebaseSetTimerToFireImmediately(timebase: any, timer: NSTimer): number;

interface CMVideoDimensions {
	width: number;
	height: number;
}
declare var CMVideoDimensions: interop.StructType<CMVideoDimensions>;

/**
 * @since 8.0
 */
declare function CMVideoFormatDescriptionCopyAsBigEndianImageDescriptionBlockBuffer(allocator: any, videoFormatDescription: any, stringEncoding: number, flavor: string, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.0
 */
declare function CMVideoFormatDescriptionCopyTagCollectionArray(formatDescription: any, tagCollectionsOut: interop.Pointer | interop.Reference<NSArray<any>>): number;

/**
 * @since 4.0
 */
declare function CMVideoFormatDescriptionCreate(allocator: any, codecType: number, width: number, height: number, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMVideoFormatDescriptionCreateForImageBuffer(allocator: any, imageBuffer: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMVideoFormatDescriptionCreateFromBigEndianImageDescriptionBlockBuffer(allocator: any, imageDescriptionBlockBuffer: any, stringEncoding: number, flavor: string, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function CMVideoFormatDescriptionCreateFromBigEndianImageDescriptionData(allocator: any, imageDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, stringEncoding: number, flavor: string, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 7.0
 */
declare function CMVideoFormatDescriptionCreateFromH264ParameterSets(allocator: any, parameterSetCount: number, parameterSetPointers: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, parameterSetSizes: interop.Pointer | interop.Reference<number>, NALUnitHeaderLength: number, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 11.0
 */
declare function CMVideoFormatDescriptionCreateFromHEVCParameterSets(allocator: any, parameterSetCount: number, parameterSetPointers: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, parameterSetSizes: interop.Pointer | interop.Reference<number>, NALUnitHeaderLength: number, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.0
 */
declare function CMVideoFormatDescriptionGetCleanAperture(videoDesc: any, originIsAtTopLeft: boolean): CGRect;

/**
 * @since 4.0
 */
declare function CMVideoFormatDescriptionGetDimensions(videoDesc: any): CMVideoDimensions;

/**
 * @since 4.0
 */
declare function CMVideoFormatDescriptionGetExtensionKeysCommonWithImageBuffers(): NSArray<any>;

/**
 * @since 7.0
 */
declare function CMVideoFormatDescriptionGetH264ParameterSetAtIndex(videoDesc: any, parameterSetIndex: number, parameterSetPointerOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, parameterSetSizeOut: interop.Pointer | interop.Reference<number>, parameterSetCountOut: interop.Pointer | interop.Reference<number>, NALUnitHeaderLengthOut: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 11.0
 */
declare function CMVideoFormatDescriptionGetHEVCParameterSetAtIndex(videoDesc: any, parameterSetIndex: number, parameterSetPointerOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, parameterSetSizeOut: interop.Pointer | interop.Reference<number>, parameterSetCountOut: interop.Pointer | interop.Reference<number>, NALUnitHeaderLengthOut: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.0
 */
declare function CMVideoFormatDescriptionGetPresentationDimensions(videoDesc: any, usePixelAspectRatio: boolean, useCleanAperture: boolean): CGSize;

/**
 * @since 4.0
 */
declare function CMVideoFormatDescriptionMatchesImageBuffer(desc: any, imageBuffer: any): boolean;

declare const kCMAttachmentMode_ShouldNotPropagate: number;

declare const kCMAttachmentMode_ShouldPropagate: number;

declare const kCMAudioCodecType_AAC_AudibleProtected: number;

declare const kCMAudioCodecType_AAC_LCProtected: number;

declare const kCMAudioFormatDescriptionMask_All: number;

declare const kCMAudioFormatDescriptionMask_ChannelLayout: number;

declare const kCMAudioFormatDescriptionMask_Extensions: number;

declare const kCMAudioFormatDescriptionMask_MagicCookie: number;

declare const kCMAudioFormatDescriptionMask_StreamBasicDescription: number;

declare const kCMBlockBufferAlwaysCopyDataFlag: number;

declare const kCMBlockBufferAssureMemoryNowFlag: number;

declare const kCMBlockBufferBadCustomBlockSourceErr: number;

declare const kCMBlockBufferBadLengthParameterErr: number;

declare const kCMBlockBufferBadOffsetParameterErr: number;

declare const kCMBlockBufferBadPointerParameterErr: number;

declare const kCMBlockBufferBlockAllocationFailedErr: number;

declare const kCMBlockBufferCustomBlockSourceVersion: number;

declare const kCMBlockBufferDontOptimizeDepthFlag: number;

declare const kCMBlockBufferEmptyBBufErr: number;

declare const kCMBlockBufferInsufficientSpaceErr: number;

declare const kCMBlockBufferNoErr: number;

declare const kCMBlockBufferPermitEmptyReferenceFlag: number;

declare const kCMBlockBufferStructureAllocationFailedErr: number;

declare const kCMBlockBufferUnallocatedBlockErr: number;

declare const kCMBufferQueueError_AllocationFailed: number;

declare const kCMBufferQueueError_BadTriggerDuration: number;

declare const kCMBufferQueueError_CannotModifyQueueFromTriggerCallback: number;

declare const kCMBufferQueueError_EnqueueAfterEndOfData: number;

declare const kCMBufferQueueError_InvalidBuffer: number;

declare const kCMBufferQueueError_InvalidCMBufferCallbacksStruct: number;

declare const kCMBufferQueueError_InvalidTriggerCondition: number;

declare const kCMBufferQueueError_InvalidTriggerToken: number;

declare const kCMBufferQueueError_QueueIsFull: number;

declare const kCMBufferQueueError_RequiredParameterMissing: number;

declare const kCMBufferQueueTrigger_WhenBufferCountBecomesGreaterThan: number;

declare const kCMBufferQueueTrigger_WhenBufferCountBecomesLessThan: number;

declare const kCMBufferQueueTrigger_WhenDataBecomesReady: number;

declare const kCMBufferQueueTrigger_WhenDurationBecomesGreaterThan: number;

declare const kCMBufferQueueTrigger_WhenDurationBecomesGreaterThanOrEqualTo: number;

declare const kCMBufferQueueTrigger_WhenDurationBecomesGreaterThanOrEqualToAndBufferCountBecomesGreaterThan: number;

declare const kCMBufferQueueTrigger_WhenDurationBecomesLessThan: number;

declare const kCMBufferQueueTrigger_WhenDurationBecomesLessThanOrEqualTo: number;

declare const kCMBufferQueueTrigger_WhenEndOfDataReached: number;

declare const kCMBufferQueueTrigger_WhenMaxPresentationTimeStampChanges: number;

declare const kCMBufferQueueTrigger_WhenMinPresentationTimeStampChanges: number;

declare const kCMBufferQueueTrigger_WhenReset: number;

declare const kCMClockError_AllocationFailed: number;

declare const kCMClockError_InvalidParameter: number;

declare const kCMClockError_MissingRequiredParameter: number;

declare const kCMClockError_UnsupportedOperation: number;

declare const kCMClosedCaptionFormatType_ATSC: number;

declare const kCMClosedCaptionFormatType_CEA608: number;

declare const kCMClosedCaptionFormatType_CEA708: number;

/**
 * @since 13.0
 */
declare var kCMFormatDescriptionAlphaChannelMode_PremultipliedAlpha: string;

/**
 * @since 13.0
 */
declare var kCMFormatDescriptionAlphaChannelMode_StraightAlpha: string;

declare const kCMFormatDescriptionBridgeError_AllocationFailed: number;

declare const kCMFormatDescriptionBridgeError_IncompatibleFormatDescription: number;

declare const kCMFormatDescriptionBridgeError_InvalidFormatDescription: number;

declare const kCMFormatDescriptionBridgeError_InvalidParameter: number;

declare const kCMFormatDescriptionBridgeError_InvalidSerializedSampleDescription: number;

declare const kCMFormatDescriptionBridgeError_InvalidSlice: number;

declare const kCMFormatDescriptionBridgeError_UnsupportedSampleDescriptionFlavor: number;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionChromaLocation_Bottom: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionChromaLocation_BottomLeft: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionChromaLocation_Center: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionChromaLocation_DV420: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionChromaLocation_Left: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionChromaLocation_Top: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionChromaLocation_TopLeft: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionColorPrimaries_DCI_P3: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionColorPrimaries_EBU_3213: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionColorPrimaries_ITU_R_2020: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionColorPrimaries_ITU_R_709_2: string;

/**
 * @since 6.0
 */
declare var kCMFormatDescriptionColorPrimaries_P22: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionColorPrimaries_P3_D65: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionColorPrimaries_SMPTE_C: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionConformsToMPEG2VideoProfile: string;

declare const kCMFormatDescriptionError_AllocationFailed: number;

declare const kCMFormatDescriptionError_InvalidParameter: number;

declare const kCMFormatDescriptionError_ValueNotAvailable: number;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtensionKey_MetadataKeyTable: string;

/**
 * @since 13.0
 */
declare var kCMFormatDescriptionExtension_AlphaChannelMode: string;

/**
 * @since 12.0
 */
declare var kCMFormatDescriptionExtension_AlternativeTransferCharacteristics: string;

/**
 * @since 15.0
 */
declare var kCMFormatDescriptionExtension_AmbientViewingEnvironment: string;

/**
 * @since 13.0
 */
declare var kCMFormatDescriptionExtension_AuxiliaryTypeInfo: string;

/**
 * @since 15.0
 */
declare var kCMFormatDescriptionExtension_BitsPerComponent: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_BytesPerRow: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_ChromaLocationBottomField: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_ChromaLocationTopField: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_CleanAperture: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_ColorPrimaries: string;

/**
 * @since 13.0
 */
declare var kCMFormatDescriptionExtension_ContainsAlphaChannel: string;

/**
 * @since 17.0
 */
declare var kCMFormatDescriptionExtension_ContentColorVolume: string;

/**
 * @since 11.0
 */
declare var kCMFormatDescriptionExtension_ContentLightLevelInfo: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_Depth: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_FieldCount: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_FieldDetail: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_FormatName: string;

/**
 * @since 4.3
 */
declare var kCMFormatDescriptionExtension_FullRangeVideo: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_GammaLevel: string;

/**
 * @since 17.0
 */
declare var kCMFormatDescriptionExtension_HasAdditionalViews: string;

/**
 * @since 17.0
 */
declare var kCMFormatDescriptionExtension_HasLeftStereoEyeView: string;

/**
 * @since 17.0
 */
declare var kCMFormatDescriptionExtension_HasRightStereoEyeView: string;

/**
 * @since 17.0
 */
declare var kCMFormatDescriptionExtension_HeroEye: string;

/**
 * @since 17.0
 */
declare var kCMFormatDescriptionExtension_HorizontalDisparityAdjustment: string;

/**
 * @since 15.0
 */
declare var kCMFormatDescriptionExtension_HorizontalFieldOfView: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_ICCProfile: string;

/**
 * @since 17.2
 */
declare var kCMFormatDescriptionExtension_LogTransferFunction: string;

/**
 * @since 11.0
 */
declare var kCMFormatDescriptionExtension_MasteringDisplayColorVolume: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_OriginalCompressionSettings: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_PixelAspectRatio: string;

/**
 * @since 18.0
 */
declare var kCMFormatDescriptionExtension_ProjectionKind: string;

/**
 * @since 14.0
 */
declare var kCMFormatDescriptionExtension_ProtectedContentOriginalFormat: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_RevisionLevel: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_SampleDescriptionExtensionAtoms: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_SpatialQuality: string;

/**
 * @since 17.0
 */
declare var kCMFormatDescriptionExtension_StereoCameraBaseline: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_TemporalQuality: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_TransferFunction: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_Vendor: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_VerbatimISOSampleEntry: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_VerbatimImageDescription: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_VerbatimSampleDescription: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionExtension_Version: string;

/**
 * @since 18.0
 */
declare var kCMFormatDescriptionExtension_ViewPackingKind: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionExtension_YCbCrMatrix: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionFieldDetail_SpatialFirstLineEarly: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionFieldDetail_SpatialFirstLineLate: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionFieldDetail_TemporalBottomFirst: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionFieldDetail_TemporalTopFirst: string;

/**
 * @since 17.0
 */
declare var kCMFormatDescriptionHeroEye_Left: string;

/**
 * @since 17.0
 */
declare var kCMFormatDescriptionHeroEye_Right: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionKey_CleanApertureHeight: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionKey_CleanApertureHeightRational: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionKey_CleanApertureHorizontalOffset: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionKey_CleanApertureHorizontalOffsetRational: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionKey_CleanApertureVerticalOffset: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionKey_CleanApertureVerticalOffsetRational: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionKey_CleanApertureWidth: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionKey_CleanApertureWidthRational: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionKey_PixelAspectRatioHorizontalSpacing: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionKey_PixelAspectRatioVerticalSpacing: string;

/**
 * @since 17.2
 */
declare var kCMFormatDescriptionLogTransferFunction_AppleLog: string;

/**
 * @since 18.0
 */
declare var kCMFormatDescriptionProjectionKind_Rectilinear: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionTransferFunction_ITU_R_2020: string;

/**
 * @since 11.0
 */
declare var kCMFormatDescriptionTransferFunction_ITU_R_2100_HLG: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionTransferFunction_ITU_R_709_2: string;

/**
 * @since 12.0
 */
declare var kCMFormatDescriptionTransferFunction_Linear: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionTransferFunction_SMPTE_240M_1995: string;

/**
 * @since 11.0
 */
declare var kCMFormatDescriptionTransferFunction_SMPTE_ST_2084_PQ: string;

/**
 * @since 10.0
 */
declare var kCMFormatDescriptionTransferFunction_SMPTE_ST_428_1: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionTransferFunction_UseGamma: string;

/**
 * @since 13.0
 */
declare var kCMFormatDescriptionTransferFunction_sRGB: string;

/**
 * @since 4.0
 */
declare var kCMFormatDescriptionVendor_Apple: string;

/**
 * @since 18.0
 */
declare var kCMFormatDescriptionViewPackingKind_OverUnder: string;

/**
 * @since 18.0
 */
declare var kCMFormatDescriptionViewPackingKind_SideBySide: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionYCbCrMatrix_ITU_R_2020: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionYCbCrMatrix_ITU_R_601_4: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionYCbCrMatrix_ITU_R_709_2: string;

/**
 * @since 9.0
 */
declare var kCMFormatDescriptionYCbCrMatrix_SMPTE_240M_1995: string;

/**
 * @since 11.0
 */
declare var kCMHEVCTemporalLevelInfoKey_ConstraintIndicatorFlags: string;

/**
 * @since 11.0
 */
declare var kCMHEVCTemporalLevelInfoKey_LevelIndex: string;

/**
 * @since 11.0
 */
declare var kCMHEVCTemporalLevelInfoKey_ProfileCompatibilityFlags: string;

/**
 * @since 11.0
 */
declare var kCMHEVCTemporalLevelInfoKey_ProfileIndex: string;

/**
 * @since 11.0
 */
declare var kCMHEVCTemporalLevelInfoKey_ProfileSpace: string;

/**
 * @since 11.0
 */
declare var kCMHEVCTemporalLevelInfoKey_TemporalLevel: string;

/**
 * @since 11.0
 */
declare var kCMHEVCTemporalLevelInfoKey_TierFlag: string;

/**
 * @since 8.0
 */
declare var kCMImageDescriptionFlavor_3GPFamily: string;

/**
 * @since 8.0
 */
declare var kCMImageDescriptionFlavor_ISOFamily: string;

/**
 * @since 16.0
 */
declare var kCMImageDescriptionFlavor_ISOFamilyWithAppleExtensions: string;

/**
 * @since 8.0
 */
declare var kCMImageDescriptionFlavor_QuickTimeMovie: string;

declare const kCMMPEG2VideoProfile_HDV_1080i50: number;

declare const kCMMPEG2VideoProfile_HDV_1080i60: number;

declare const kCMMPEG2VideoProfile_HDV_1080p24: number;

declare const kCMMPEG2VideoProfile_HDV_1080p25: number;

declare const kCMMPEG2VideoProfile_HDV_1080p30: number;

declare const kCMMPEG2VideoProfile_HDV_720p24: number;

declare const kCMMPEG2VideoProfile_HDV_720p25: number;

declare const kCMMPEG2VideoProfile_HDV_720p30: number;

declare const kCMMPEG2VideoProfile_HDV_720p50: number;

declare const kCMMPEG2VideoProfile_HDV_720p60: number;

declare const kCMMPEG2VideoProfile_XDCAM_EX_1080i50_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_EX_1080i60_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_EX_1080p24_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_EX_1080p25_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_EX_1080p30_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_EX_720p24_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_EX_720p25_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_EX_720p30_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_EX_720p50_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_EX_720p60_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_1080i50_CBR50: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_1080i60_CBR50: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_1080p24_CBR50: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_1080p25_CBR50: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_1080p30_CBR50: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_540p: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_720p24_CBR50: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_720p25_CBR50: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_720p30_CBR50: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_720p50_CBR50: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD422_720p60_CBR50: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD_1080i50_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD_1080i60_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD_1080p24_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD_1080p25_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD_1080p30_VBR35: number;

declare const kCMMPEG2VideoProfile_XDCAM_HD_540p: number;

declare const kCMMPEG2VideoProfile_XF: number;

declare const kCMMediaType_Audio: number;

declare const kCMMediaType_AuxiliaryPicture: number;

declare const kCMMediaType_ClosedCaption: number;

declare const kCMMediaType_Metadata: number;

declare const kCMMediaType_Muxed: number;

declare const kCMMediaType_Subtitle: number;

declare const kCMMediaType_TaggedBufferGroup: number;

declare const kCMMediaType_Text: number;

declare const kCMMediaType_TimeCode: number;

declare const kCMMediaType_Video: number;

declare const kCMMemoryPoolError_AllocationFailed: number;

declare const kCMMemoryPoolError_InvalidParameter: number;

/**
 * @since 6.0
 */
declare var kCMMemoryPoolOption_AgeOutPeriod: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_AffineTransformF64: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_BMP: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_DimensionsF32: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_Float32: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_Float64: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_GIF: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_JPEG: string;

/**
 * @since 9.0
 */
declare var kCMMetadataBaseDataType_JSON: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_PNG: string;

/**
 * @since 13.0
 */
declare var kCMMetadataBaseDataType_PerspectiveTransformF64: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_PointF32: string;

/**
 * @since 9.0
 */
declare var kCMMetadataBaseDataType_PolygonF32: string;

/**
 * @since 9.0
 */
declare var kCMMetadataBaseDataType_PolylineF32: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_RawData: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_RectF32: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_SInt16: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_SInt32: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_SInt64: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_SInt8: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_UInt16: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_UInt32: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_UInt64: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_UInt8: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_UTF16: string;

/**
 * @since 8.0
 */
declare var kCMMetadataBaseDataType_UTF8: string;

declare const kCMMetadataDataTypeRegistryError_AllocationFailed: number;

declare const kCMMetadataDataTypeRegistryError_BadDataTypeIdentifier: number;

declare const kCMMetadataDataTypeRegistryError_DataTypeAlreadyRegistered: number;

declare const kCMMetadataDataTypeRegistryError_MultipleConformingBaseTypes: number;

declare const kCMMetadataDataTypeRegistryError_RequiredParameterMissing: number;

declare const kCMMetadataDataTypeRegistryError_RequiresConformingBaseType: number;

/**
 * @since 8.0
 */
declare var kCMMetadataDataType_QuickTimeMetadataDirection: string;

/**
 * @since 8.0
 */
declare var kCMMetadataDataType_QuickTimeMetadataLocation_ISO6709: string;

/**
 * @since 18.0
 */
declare var kCMMetadataDataType_QuickTimeMetadataMilliLux: string;

/**
 * @since 18.0
 */
declare var kCMMetadataDataType_QuickTimeMetadataUUID: string;

/**
 * @since 8.0
 */
declare var kCMMetadataFormatDescriptionKey_ConformingDataTypes: string;

/**
 * @since 8.0
 */
declare var kCMMetadataFormatDescriptionKey_DataType: string;

/**
 * @since 8.0
 */
declare var kCMMetadataFormatDescriptionKey_DataTypeNamespace: string;

/**
 * @since 8.0
 */
declare var kCMMetadataFormatDescriptionKey_LanguageTag: string;

/**
 * @since 4.0
 */
declare var kCMMetadataFormatDescriptionKey_LocalID: string;

/**
 * @since 4.0
 */
declare var kCMMetadataFormatDescriptionKey_Namespace: string;

/**
 * @since 9.0
 */
declare var kCMMetadataFormatDescriptionKey_SetupData: string;

/**
 * @since 9.0
 */
declare var kCMMetadataFormatDescriptionKey_StructuralDependency: string;

/**
 * @since 4.0
 */
declare var kCMMetadataFormatDescriptionKey_Value: string;

/**
 * @since 8.0
 */
declare var kCMMetadataFormatDescriptionMetadataSpecificationKey_DataType: string;

/**
 * @since 8.0
 */
declare var kCMMetadataFormatDescriptionMetadataSpecificationKey_ExtendedLanguageTag: string;

/**
 * @since 8.0
 */
declare var kCMMetadataFormatDescriptionMetadataSpecificationKey_Identifier: string;

/**
 * @since 9.0
 */
declare var kCMMetadataFormatDescriptionMetadataSpecificationKey_SetupData: string;

/**
 * @since 9.0
 */
declare var kCMMetadataFormatDescriptionMetadataSpecificationKey_StructuralDependency: string;

/**
 * @since 9.0
 */
declare var kCMMetadataFormatDescription_StructuralDependencyKey_DependencyIsInvalidFlag: string;

declare const kCMMetadataFormatType_Boxed: number;

declare const kCMMetadataFormatType_EMSG: number;

declare const kCMMetadataFormatType_ICY: number;

declare const kCMMetadataFormatType_ID3: number;

declare const kCMMetadataIdentifierError_AllocationFailed: number;

declare const kCMMetadataIdentifierError_BadIdentifier: number;

declare const kCMMetadataIdentifierError_BadKey: number;

declare const kCMMetadataIdentifierError_BadKeyLength: number;

declare const kCMMetadataIdentifierError_BadKeySpace: number;

declare const kCMMetadataIdentifierError_BadKeyType: number;

declare const kCMMetadataIdentifierError_BadNumberKey: number;

declare const kCMMetadataIdentifierError_NoKeyValueAvailable: number;

declare const kCMMetadataIdentifierError_RequiredParameterMissing: number;

/**
 * @since 8.0
 */
declare var kCMMetadataIdentifier_QuickTimeMetadataDirection_Facing: string;

/**
 * @since 13.0
 */
declare var kCMMetadataIdentifier_QuickTimeMetadataLivePhotoStillImageTransform: string;

/**
 * @since 13.2
 */
declare var kCMMetadataIdentifier_QuickTimeMetadataLivePhotoStillImageTransformReferenceDimensions: string;

/**
 * @since 8.0
 */
declare var kCMMetadataIdentifier_QuickTimeMetadataLocation_ISO6709: string;

/**
 * @since 8.0
 */
declare var kCMMetadataIdentifier_QuickTimeMetadataPreferredAffineTransform: string;

/**
 * @since 18.0
 */
declare var kCMMetadataIdentifier_QuickTimeMetadataSceneIlluminance: string;

/**
 * @since 18.0
 */
declare var kCMMetadataIdentifier_QuickTimeMetadataSegmentIdentifier: string;

/**
 * @since 9.0
 */
declare var kCMMetadataIdentifier_QuickTimeMetadataVideoOrientation: string;

/**
 * @since 9.3
 */
declare var kCMMetadataKeySpace_HLSDateRange: string;

/**
 * @since 8.0
 */
declare var kCMMetadataKeySpace_ID3: string;

/**
 * @since 8.0
 */
declare var kCMMetadataKeySpace_ISOUserData: string;

/**
 * @since 8.0
 */
declare var kCMMetadataKeySpace_Icy: string;

/**
 * @since 8.0
 */
declare var kCMMetadataKeySpace_QuickTimeMetadata: string;

/**
 * @since 8.0
 */
declare var kCMMetadataKeySpace_QuickTimeUserData: string;

/**
 * @since 8.0
 */
declare var kCMMetadataKeySpace_iTunes: string;

declare const kCMMuxedStreamType_DV: number;

declare const kCMMuxedStreamType_EmbeddedDeviceScreenRecording: number;

declare const kCMMuxedStreamType_MPEG1System: number;

declare const kCMMuxedStreamType_MPEG2Program: number;

declare const kCMMuxedStreamType_MPEG2Transport: number;

declare const kCMPersistentTrackID_Invalid: number;

declare const kCMPixelFormat_16BE555: number;

declare const kCMPixelFormat_16BE565: number;

declare const kCMPixelFormat_16LE555: number;

declare const kCMPixelFormat_16LE5551: number;

declare const kCMPixelFormat_16LE565: number;

declare const kCMPixelFormat_24RGB: number;

declare const kCMPixelFormat_32ARGB: number;

declare const kCMPixelFormat_32BGRA: number;

declare const kCMPixelFormat_422YpCbCr10: number;

declare const kCMPixelFormat_422YpCbCr16: number;

declare const kCMPixelFormat_422YpCbCr8: number;

declare const kCMPixelFormat_422YpCbCr8_yuvs: number;

declare const kCMPixelFormat_4444YpCbCrA8: number;

declare const kCMPixelFormat_444YpCbCr10: number;

declare const kCMPixelFormat_444YpCbCr8: number;

declare const kCMPixelFormat_8IndexedGray_WhiteIsZero: number;

/**
 * @since 13.0
 */
declare var kCMSampleAttachmentKey_AudioIndependentSampleDecoderRefreshCount: string;

/**
 * @since 15.0
 */
declare var kCMSampleAttachmentKey_CryptorSubsampleAuxiliaryData: string;

/**
 * @since 4.0
 */
declare var kCMSampleAttachmentKey_DependsOnOthers: string;

/**
 * @since 4.0
 */
declare var kCMSampleAttachmentKey_DisplayImmediately: string;

/**
 * @since 4.0
 */
declare var kCMSampleAttachmentKey_DoNotDisplay: string;

/**
 * @since 4.0
 */
declare var kCMSampleAttachmentKey_EarlierDisplayTimesAllowed: string;

/**
 * @since 16.0
 */
declare var kCMSampleAttachmentKey_HDR10PlusPerFrameData: string;

/**
 * @since 11.0
 */
declare var kCMSampleAttachmentKey_HEVCStepwiseTemporalSubLayerAccess: string;

/**
 * @since 11.0
 */
declare var kCMSampleAttachmentKey_HEVCSyncSampleNALUnitType: string;

/**
 * @since 11.0
 */
declare var kCMSampleAttachmentKey_HEVCTemporalLevelInfo: string;

/**
 * @since 11.0
 */
declare var kCMSampleAttachmentKey_HEVCTemporalSubLayerAccess: string;

/**
 * @since 4.0
 */
declare var kCMSampleAttachmentKey_HasRedundantCoding: string;

/**
 * @since 4.0
 */
declare var kCMSampleAttachmentKey_IsDependedOnByOthers: string;

/**
 * @since 4.0
 */
declare var kCMSampleAttachmentKey_NotSync: string;

/**
 * @since 4.0
 */
declare var kCMSampleAttachmentKey_PartialSync: string;

/**
 * @since 11.0
 */
declare var kCMSampleBufferAttachmentKey_CameraIntrinsicMatrix: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_DisplayEmptyMediaImmediately: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_DrainAfterDecoding: string;

/**
 * @since 6.0
 */
declare var kCMSampleBufferAttachmentKey_DroppedFrameReason: string;

/**
 * @since 7.0
 */
declare var kCMSampleBufferAttachmentKey_DroppedFrameReasonInfo: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_EmptyMedia: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_EndsPreviousSampleDuration: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_FillDiscontinuitiesWithSilence: string;

/**
 * @since 8.0
 */
declare var kCMSampleBufferAttachmentKey_ForceKeyFrame: string;

/**
 * @since 4.3
 */
declare var kCMSampleBufferAttachmentKey_GradualDecoderRefresh: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_PermanentEmptyMedia: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_PostNotificationWhenConsumed: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_ResetDecoderBeforeDecoding: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_ResumeOutput: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_Reverse: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_SampleReferenceByteOffset: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_SampleReferenceURL: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_SpeedMultiplier: string;

/**
 * @since 9.0
 */
declare var kCMSampleBufferAttachmentKey_StillImageLensStabilizationInfo: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_TransitionID: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_TrimDurationAtEnd: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferAttachmentKey_TrimDurationAtStart: string;

/**
 * @since 5.0
 */
declare var kCMSampleBufferConduitNotificationParameter_MaxUpcomingOutputPTS: string;

/**
 * @since 4.3
 */
declare var kCMSampleBufferConduitNotificationParameter_MinUpcomingOutputPTS: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferConduitNotificationParameter_ResumeTag: string;

/**
 * @since 4.3
 */
declare var kCMSampleBufferConduitNotificationParameter_UpcomingOutputPTSRangeMayOverlapQueuedOutputPTSRange: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferConduitNotification_InhibitOutputUntil: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferConduitNotification_ResetOutput: string;

/**
 * @since 4.3
 */
declare var kCMSampleBufferConduitNotification_UpcomingOutputPTSRangeChanged: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferConsumerNotification_BufferConsumed: string;

/**
 * @since 7.0
 */
declare var kCMSampleBufferDroppedFrameReasonInfo_CameraModeSwitch: string;

/**
 * @since 6.0
 */
declare var kCMSampleBufferDroppedFrameReason_Discontinuity: string;

/**
 * @since 6.0
 */
declare var kCMSampleBufferDroppedFrameReason_FrameWasLate: string;

/**
 * @since 6.0
 */
declare var kCMSampleBufferDroppedFrameReason_OutOfBuffers: string;

declare const kCMSampleBufferError_AllocationFailed: number;

declare const kCMSampleBufferError_AlreadyHasDataBuffer: number;

declare const kCMSampleBufferError_ArrayTooSmall: number;

declare const kCMSampleBufferError_BufferHasNoSampleSizes: number;

declare const kCMSampleBufferError_BufferHasNoSampleTimingInfo: number;

declare const kCMSampleBufferError_BufferNotReady: number;

declare const kCMSampleBufferError_CannotSubdivide: number;

declare const kCMSampleBufferError_DataCanceled: number;

declare const kCMSampleBufferError_DataFailed: number;

declare const kCMSampleBufferError_InvalidEntryCount: number;

declare const kCMSampleBufferError_InvalidMediaFormat: number;

declare const kCMSampleBufferError_InvalidMediaTypeForOperation: number;

declare const kCMSampleBufferError_InvalidSampleData: number;

declare const kCMSampleBufferError_Invalidated: number;

declare const kCMSampleBufferError_RequiredParameterMissing: number;

declare const kCMSampleBufferError_SampleIndexOutOfRange: number;

declare const kCMSampleBufferError_SampleTimingInfoInvalid: number;

declare const kCMSampleBufferFlag_AudioBufferList_Assure16ByteAlignment: number;

/**
 * @since 9.0
 */
declare var kCMSampleBufferLensStabilizationInfo_Active: string;

/**
 * @since 9.0
 */
declare var kCMSampleBufferLensStabilizationInfo_Off: string;

/**
 * @since 9.0
 */
declare var kCMSampleBufferLensStabilizationInfo_OutOfRange: string;

/**
 * @since 9.0
 */
declare var kCMSampleBufferLensStabilizationInfo_Unavailable: string;

/**
 * @since 8.0
 */
declare var kCMSampleBufferNotificationParameter_OSStatus: string;

/**
 * @since 4.0
 */
declare var kCMSampleBufferNotification_DataBecameReady: string;

/**
 * @since 8.0
 */
declare var kCMSampleBufferNotification_DataFailed: string;

declare const kCMSimpleQueueError_AllocationFailed: number;

declare const kCMSimpleQueueError_ParameterOutOfRange: number;

declare const kCMSimpleQueueError_QueueIsFull: number;

declare const kCMSimpleQueueError_RequiredParameterMissing: number;

/**
 * @since 8.0
 */
declare var kCMSoundDescriptionFlavor_3GPFamily: string;

/**
 * @since 8.0
 */
declare var kCMSoundDescriptionFlavor_ISOFamily: string;

/**
 * @since 8.0
 */
declare var kCMSoundDescriptionFlavor_QuickTimeMovie: string;

/**
 * @since 8.0
 */
declare var kCMSoundDescriptionFlavor_QuickTimeMovieV2: string;

declare const kCMSubtitleFormatType_3GText: number;

declare const kCMSubtitleFormatType_WebVTT: number;

declare const kCMSyncError_AllocationFailed: number;

declare const kCMSyncError_InvalidParameter: number;

declare const kCMSyncError_MissingRequiredParameter: number;

declare const kCMSyncError_RateMustBeNonZero: number;

/**
 * @since 17.0
 */
declare var kCMTagCategoryKey: string;

/**
 * @since 17.0
 */
declare var kCMTagCollectionTagsArrayKey: string;

/**
 * @since 17.0
 */
declare var kCMTagDataTypeKey: string;

/**
 * @since 17.0
 */
declare var kCMTagInvalid: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagMediaSubTypeMebx: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagMediaTypeAudio: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagMediaTypeMetadata: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagMediaTypeVideo: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagPackingTypeNone: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagPackingTypeOverUnder: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagPackingTypeSideBySide: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagProjectionTypeEquirectangular: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagProjectionTypeFisheye: CMTag;

/**
 * @since 18.0
 */
declare var kCMTagProjectionTypeHalfEquirectangular: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagProjectionTypeRectangular: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagStereoInterpretationOrderReversed: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagStereoLeftAndRightEye: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagStereoLeftEye: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagStereoNone: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagStereoRightEye: CMTag;

/**
 * @since 17.0
 */
declare var kCMTagValueKey: string;

declare const kCMTaggedBufferGroupFormatType_TaggedBufferGroup: number;

declare const kCMTextDisplayFlag_allSubtitlesForced: number;

declare const kCMTextDisplayFlag_continuousKaraoke: number;

declare const kCMTextDisplayFlag_fillTextRegion: number;

declare const kCMTextDisplayFlag_forcedSubtitlesPresent: number;

declare const kCMTextDisplayFlag_obeySubtitleFormatting: number;

declare const kCMTextDisplayFlag_scrollDirectionMask: number;

declare const kCMTextDisplayFlag_scrollDirection_bottomToTop: number;

declare const kCMTextDisplayFlag_scrollDirection_leftToRight: number;

declare const kCMTextDisplayFlag_scrollDirection_rightToLeft: number;

declare const kCMTextDisplayFlag_scrollDirection_topToBottom: number;

declare const kCMTextDisplayFlag_scrollIn: number;

declare const kCMTextDisplayFlag_scrollOut: number;

declare const kCMTextDisplayFlag_writeTextVertically: number;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionColor_Alpha: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionColor_Blue: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionColor_Green: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionColor_Red: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionExtension_BackgroundColor: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionExtension_DefaultFontName: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionExtension_DefaultStyle: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionExtension_DefaultTextBox: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionExtension_DisplayFlags: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionExtension_FontTable: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionExtension_HorizontalJustification: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionExtension_TextJustification: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionExtension_VerticalJustification: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionRect_Bottom: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionRect_Left: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionRect_Right: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionRect_Top: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionStyle_Ascent: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionStyle_EndChar: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionStyle_Font: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionStyle_FontFace: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionStyle_FontSize: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionStyle_ForegroundColor: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionStyle_Height: string;

/**
 * @since 4.0
 */
declare var kCMTextFormatDescriptionStyle_StartChar: string;

declare const kCMTextFormatType_3GText: number;

declare const kCMTextFormatType_QTText: number;

declare const kCMTextJustification_bottom_right: number;

declare const kCMTextJustification_centered: number;

declare const kCMTextJustification_left_top: number;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAlignmentType_End: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAlignmentType_Left: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAlignmentType_Middle: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAlignmentType_Right: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAlignmentType_Start: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAttribute_Alignment: string;

/**
 * @since 6.0
 */
declare var kCMTextMarkupAttribute_BackgroundColorARGB: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAttribute_BaseFontSizePercentageRelativeToVideoHeight: string;

/**
 * @since 6.0
 */
declare var kCMTextMarkupAttribute_BoldStyle: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAttribute_CharacterBackgroundColorARGB: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAttribute_CharacterEdgeStyle: string;

/**
 * @since 6.0
 */
declare var kCMTextMarkupAttribute_FontFamilyName: string;

/**
 * @since 16.0
 */
declare var kCMTextMarkupAttribute_FontFamilyNameList: string;

/**
 * @since 6.0
 */
declare var kCMTextMarkupAttribute_ForegroundColorARGB: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAttribute_GenericFontFamilyName: string;

/**
 * @since 6.0
 */
declare var kCMTextMarkupAttribute_ItalicStyle: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAttribute_OrthogonalLinePositionPercentageRelativeToWritingDirection: string;

/**
 * @since 6.0
 */
declare var kCMTextMarkupAttribute_RelativeFontSize: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAttribute_TextPositionPercentageRelativeToWritingDirection: string;

/**
 * @since 6.0
 */
declare var kCMTextMarkupAttribute_UnderlineStyle: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAttribute_VerticalLayout: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupAttribute_WritingDirectionSizePercentage: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupCharacterEdgeStyle_Depressed: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupCharacterEdgeStyle_DropShadow: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupCharacterEdgeStyle_None: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupCharacterEdgeStyle_Raised: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupCharacterEdgeStyle_Uniform: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_Casual: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_Cursive: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_Default: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_Fantasy: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_Monospace: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_MonospaceSansSerif: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_MonospaceSerif: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_ProportionalSansSerif: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_ProportionalSerif: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_SansSerif: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_Serif: string;

/**
 * @since 7.0
 */
declare var kCMTextMarkupGenericFontName_SmallCapital: string;

/**
 * @since 7.0
 */
declare var kCMTextVerticalLayout_LeftToRight: string;

/**
 * @since 7.0
 */
declare var kCMTextVerticalLayout_RightToLeft: string;

declare const kCMTimeCodeFlag_24HourMax: number;

declare const kCMTimeCodeFlag_DropFrame: number;

declare const kCMTimeCodeFlag_NegTimesOK: number;

/**
 * @since 4.0
 */
declare var kCMTimeCodeFormatDescriptionExtension_SourceReferenceName: string;

/**
 * @since 4.0
 */
declare var kCMTimeCodeFormatDescriptionKey_LangCode: string;

/**
 * @since 4.0
 */
declare var kCMTimeCodeFormatDescriptionKey_Value: string;

declare const kCMTimeCodeFormatType_Counter32: number;

declare const kCMTimeCodeFormatType_Counter64: number;

declare const kCMTimeCodeFormatType_TimeCode32: number;

declare const kCMTimeCodeFormatType_TimeCode64: number;

/**
 * @since 4.0
 */
declare var kCMTimeEpochKey: string;

/**
 * @since 4.0
 */
declare var kCMTimeFlagsKey: string;

/**
 * @since 4.0
 */
declare var kCMTimeIndefinite: CMTime;

/**
 * @since 4.0
 */
declare var kCMTimeInvalid: CMTime;

/**
 * @since 9.0
 */
declare var kCMTimeMappingInvalid: CMTimeMapping;

/**
 * @since 9.0
 */
declare var kCMTimeMappingSourceKey: string;

/**
 * @since 9.0
 */
declare var kCMTimeMappingTargetKey: string;

/**
 * @since 4.0
 */
declare var kCMTimeNegativeInfinity: CMTime;

/**
 * @since 4.0
 */
declare var kCMTimePositiveInfinity: CMTime;

/**
 * @since 4.0
 */
declare var kCMTimeRangeDurationKey: string;

/**
 * @since 4.0
 */
declare var kCMTimeRangeInvalid: CMTimeRange;

/**
 * @since 4.0
 */
declare var kCMTimeRangeStartKey: string;

/**
 * @since 4.0
 */
declare var kCMTimeRangeZero: CMTimeRange;

/**
 * @since 4.0
 */
declare var kCMTimeScaleKey: string;

/**
 * @since 4.0
 */
declare var kCMTimeValueKey: string;

/**
 * @since 4.0
 */
declare var kCMTimeZero: CMTime;

declare const kCMTimebaseError_AllocationFailed: number;

declare const kCMTimebaseError_InvalidParameter: number;

declare const kCMTimebaseError_MissingRequiredParameter: number;

declare const kCMTimebaseError_ReadOnly: number;

declare const kCMTimebaseError_TimerIntervalTooShort: number;

/**
 * @since 7.0
 */
declare var kCMTimebaseNotificationKey_EventTime: string;

/**
 * @since 6.0
 */
declare var kCMTimebaseNotification_EffectiveRateChanged: string;

/**
 * @since 6.0
 */
declare var kCMTimebaseNotification_TimeJumped: string;

/**
 * @since 4.0
 */
declare var kCMTimingInfoInvalid: CMSampleTimingInfo;

declare const kCMVideoCodecType_422YpCbCr8: number;

declare const kCMVideoCodecType_AV1: number;

declare const kCMVideoCodecType_Animation: number;

declare const kCMVideoCodecType_AppleProRes422: number;

declare const kCMVideoCodecType_AppleProRes422HQ: number;

declare const kCMVideoCodecType_AppleProRes422LT: number;

declare const kCMVideoCodecType_AppleProRes422Proxy: number;

declare const kCMVideoCodecType_AppleProRes4444: number;

declare const kCMVideoCodecType_AppleProRes4444XQ: number;

declare const kCMVideoCodecType_AppleProResRAW: number;

declare const kCMVideoCodecType_AppleProResRAWHQ: number;

declare const kCMVideoCodecType_Cinepak: number;

declare const kCMVideoCodecType_DVCNTSC: number;

declare const kCMVideoCodecType_DVCPAL: number;

declare const kCMVideoCodecType_DVCPROHD1080i50: number;

declare const kCMVideoCodecType_DVCPROHD1080i60: number;

declare const kCMVideoCodecType_DVCPROHD1080p25: number;

declare const kCMVideoCodecType_DVCPROHD1080p30: number;

declare const kCMVideoCodecType_DVCPROHD720p50: number;

declare const kCMVideoCodecType_DVCPROHD720p60: number;

declare const kCMVideoCodecType_DVCPro50NTSC: number;

declare const kCMVideoCodecType_DVCPro50PAL: number;

declare const kCMVideoCodecType_DVCProPAL: number;

declare const kCMVideoCodecType_DepthHEVC: number;

declare const kCMVideoCodecType_DisparityHEVC: number;

declare const kCMVideoCodecType_DolbyVisionHEVC: number;

declare const kCMVideoCodecType_H263: number;

declare const kCMVideoCodecType_H264: number;

declare const kCMVideoCodecType_HEVC: number;

declare const kCMVideoCodecType_HEVCWithAlpha: number;

declare const kCMVideoCodecType_JPEG: number;

declare const kCMVideoCodecType_JPEG_OpenDML: number;

declare const kCMVideoCodecType_JPEG_XL: number;

declare const kCMVideoCodecType_MPEG1Video: number;

declare const kCMVideoCodecType_MPEG2Video: number;

declare const kCMVideoCodecType_MPEG4Video: number;

declare const kCMVideoCodecType_SorensonVideo: number;

declare const kCMVideoCodecType_SorensonVideo3: number;

declare const kCMVideoCodecType_VP9: number;
