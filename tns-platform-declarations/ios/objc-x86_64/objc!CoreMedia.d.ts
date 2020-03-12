
declare function CMAudioClockCreate(allocator: any, clockOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionCopyAsBigEndianSoundDescriptionBlockBuffer(allocator: any, audioFormatDescription: any, flavor: any, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionCreate(allocator: any, asbd: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, layoutSize: number, layout: interop.Pointer | interop.Reference<AudioChannelLayout>, magicCookieSize: number, magicCookie: interop.Pointer | interop.Reference<any>, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionCreateFromBigEndianSoundDescriptionBlockBuffer(allocator: any, soundDescriptionBlockBuffer: any, flavor: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionCreateFromBigEndianSoundDescriptionData(allocator: any, soundDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, flavor: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionCreateSummary(allocator: any, formatDescriptionArray: NSArray<any> | any[], flags: number, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionEqual(formatDescription: any, otherFormatDescription: any, equalityMask: number, equalityMaskOut: interop.Pointer | interop.Reference<number>): boolean;

declare function CMAudioFormatDescriptionGetChannelLayout(desc: any, sizeOut: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<AudioChannelLayout>;

declare function CMAudioFormatDescriptionGetFormatList(desc: any, sizeOut: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<AudioFormatListItem>;

declare function CMAudioFormatDescriptionGetMagicCookie(desc: any, sizeOut: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function CMAudioFormatDescriptionGetMostCompatibleFormat(desc: any): interop.Pointer | interop.Reference<AudioFormatListItem>;

declare function CMAudioFormatDescriptionGetRichestDecodableFormat(desc: any): interop.Pointer | interop.Reference<AudioFormatListItem>;

declare function CMAudioFormatDescriptionGetStreamBasicDescription(desc: any): interop.Pointer | interop.Reference<AudioStreamBasicDescription>;

declare function CMAudioSampleBufferCreateReadyWithPacketDescriptions(allocator: any, dataBuffer: any, formatDescription: any, numSamples: number, presentationTimeStamp: CMTime, packetDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioSampleBufferCreateWithPacketDescriptions(allocator: any, dataBuffer: any, dataReady: boolean, makeDataReadyCallback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, makeDataReadyRefcon: interop.Pointer | interop.Reference<any>, formatDescription: any, numSamples: number, presentationTimeStamp: CMTime, packetDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioSampleBufferCreateWithPacketDescriptionsAndMakeDataReadyHandler(allocator: any, dataBuffer: any, dataReady: boolean, formatDescription: any, numSamples: number, presentationTimeStamp: CMTime, packetDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, sampleBufferOut: interop.Pointer | interop.Reference<any>, makeDataReadyHandler: (p1: any) => number): number;

declare function CMBlockBufferAccessDataBytes(theBuffer: any, offset: number, length: number, temporaryBlock: interop.Pointer | interop.Reference<any>, returnedPointerOut: interop.Pointer | interop.Reference<string>): number;

declare function CMBlockBufferAppendBufferReference(theBuffer: any, targetBBuf: any, offsetToData: number, dataLength: number, flags: number): number;

declare function CMBlockBufferAppendMemoryBlock(theBuffer: any, memoryBlock: interop.Pointer | interop.Reference<any>, blockLength: number, blockAllocator: any, customBlockSource: interop.Pointer | interop.Reference<CMBlockBufferCustomBlockSource>, offsetToData: number, dataLength: number, flags: number): number;

declare function CMBlockBufferAssureBlockMemory(theBuffer: any): number;

declare function CMBlockBufferCopyDataBytes(theSourceBuffer: any, offsetToData: number, dataLength: number, destination: interop.Pointer | interop.Reference<any>): number;

declare function CMBlockBufferCreateContiguous(structureAllocator: any, sourceBuffer: any, blockAllocator: any, customBlockSource: interop.Pointer | interop.Reference<CMBlockBufferCustomBlockSource>, offsetToData: number, dataLength: number, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMBlockBufferCreateEmpty(structureAllocator: any, subBlockCapacity: number, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMBlockBufferCreateWithBufferReference(structureAllocator: any, bufferReference: any, offsetToData: number, dataLength: number, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMBlockBufferCreateWithMemoryBlock(structureAllocator: any, memoryBlock: interop.Pointer | interop.Reference<any>, blockLength: number, blockAllocator: any, customBlockSource: interop.Pointer | interop.Reference<CMBlockBufferCustomBlockSource>, offsetToData: number, dataLength: number, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

interface CMBlockBufferCustomBlockSource {
	version: number;
	AllocateBlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>;
	FreeBlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>;
	refCon: interop.Pointer | interop.Reference<any>;
}
declare var CMBlockBufferCustomBlockSource: interop.StructType<CMBlockBufferCustomBlockSource>;

declare function CMBlockBufferFillDataBytes(fillByte: number, destinationBuffer: any, offsetIntoDestination: number, dataLength: number): number;

declare function CMBlockBufferGetDataLength(theBuffer: any): number;

declare function CMBlockBufferGetDataPointer(theBuffer: any, offset: number, lengthAtOffsetOut: interop.Pointer | interop.Reference<number>, totalLengthOut: interop.Pointer | interop.Reference<number>, dataPointerOut: interop.Pointer | interop.Reference<string>): number;

declare function CMBlockBufferGetTypeID(): number;

declare function CMBlockBufferIsEmpty(theBuffer: any): boolean;

declare function CMBlockBufferIsRangeContiguous(theBuffer: any, offset: number, length: number): boolean;

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

declare function CMBufferQueueCallForEachBuffer(queue: any, callback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, refcon: interop.Pointer | interop.Reference<any>): number;

declare function CMBufferQueueContainsEndOfData(queue: any): boolean;

declare function CMBufferQueueCreate(allocator: any, capacity: number, callbacks: interop.Pointer | interop.Reference<CMBufferCallbacks>, queueOut: interop.Pointer | interop.Reference<any>): number;

declare function CMBufferQueueCreateWithHandlers(allocator: any, capacity: number, handlers: interop.Pointer | interop.Reference<CMBufferHandlers>, queueOut: interop.Pointer | interop.Reference<any>): number;

declare function CMBufferQueueDequeueAndRetain(queue: any): any;

declare function CMBufferQueueDequeueIfDataReadyAndRetain(queue: any): any;

declare function CMBufferQueueEnqueue(queue: any, buf: any): number;

declare function CMBufferQueueGetBufferCount(queue: any): number;

declare function CMBufferQueueGetCallbacksForSampleBuffersSortedByOutputPTS(): interop.Pointer | interop.Reference<CMBufferCallbacks>;

declare function CMBufferQueueGetCallbacksForUnsortedSampleBuffers(): interop.Pointer | interop.Reference<CMBufferCallbacks>;

declare function CMBufferQueueGetDuration(queue: any): CMTime;

declare function CMBufferQueueGetEndPresentationTimeStamp(queue: any): CMTime;

declare function CMBufferQueueGetFirstDecodeTimeStamp(queue: any): CMTime;

declare function CMBufferQueueGetFirstPresentationTimeStamp(queue: any): CMTime;

declare function CMBufferQueueGetHead(queue: any): any;

declare function CMBufferQueueGetMaxPresentationTimeStamp(queue: any): CMTime;

declare function CMBufferQueueGetMinDecodeTimeStamp(queue: any): CMTime;

declare function CMBufferQueueGetMinPresentationTimeStamp(queue: any): CMTime;

declare function CMBufferQueueGetTotalSize(queue: any): number;

declare function CMBufferQueueGetTypeID(): number;

declare function CMBufferQueueInstallTrigger(queue: any, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, refcon: interop.Pointer | interop.Reference<any>, condition: number, time: CMTime, triggerTokenOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function CMBufferQueueInstallTriggerHandler(queue: any, condition: number, time: CMTime, triggerTokenOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, handler: (p1: interop.Pointer | interop.Reference<any>) => void): number;

declare function CMBufferQueueInstallTriggerHandlerWithIntegerThreshold(queue: any, condition: number, threshold: number, triggerTokenOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, handler: (p1: interop.Pointer | interop.Reference<any>) => void): number;

declare function CMBufferQueueInstallTriggerWithIntegerThreshold(queue: any, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, refcon: interop.Pointer | interop.Reference<any>, condition: number, threshold: number, triggerTokenOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function CMBufferQueueIsAtEndOfData(queue: any): boolean;

declare function CMBufferQueueIsEmpty(queue: any): boolean;

declare function CMBufferQueueMarkEndOfData(queue: any): number;

declare function CMBufferQueueRemoveTrigger(queue: any, triggerToken: interop.Pointer | interop.Reference<any>): number;

declare function CMBufferQueueReset(queue: any): number;

declare function CMBufferQueueResetWithCallback(queue: any, callback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => void>, refcon: interop.Pointer | interop.Reference<any>): number;

declare function CMBufferQueueSetValidationCallback(queue: any, callback: interop.FunctionReference<(p1: any, p2: any, p3: interop.Pointer | interop.Reference<any>) => number>, refcon: interop.Pointer | interop.Reference<any>): number;

declare function CMBufferQueueSetValidationHandler(queue: any, handler: (p1: any, p2: any) => number): number;

declare function CMBufferQueueTestTrigger(queue: any, triggerToken: interop.Pointer | interop.Reference<any>): boolean;

declare function CMClockConvertHostTimeToSystemUnits(hostTime: CMTime): number;

declare function CMClockGetAnchorTime(clock: any, clockTimeOut: interop.Pointer | interop.Reference<CMTime>, referenceClockTimeOut: interop.Pointer | interop.Reference<CMTime>): number;

declare function CMClockGetHostTimeClock(): any;

declare function CMClockGetTime(clock: any): CMTime;

declare function CMClockGetTypeID(): number;

declare function CMClockInvalidate(clock: any): void;

declare function CMClockMakeHostTimeFromSystemUnits(hostTime: number): CMTime;

declare function CMClockMightDrift(clock: any, otherClock: any): boolean;

declare function CMClosedCaptionFormatDescriptionCopyAsBigEndianClosedCaptionDescriptionBlockBuffer(allocator: any, closedCaptionFormatDescription: any, flavor: any, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMClosedCaptionFormatDescriptionCreateFromBigEndianClosedCaptionDescriptionBlockBuffer(allocator: any, closedCaptionDescriptionBlockBuffer: any, flavor: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMClosedCaptionFormatDescriptionCreateFromBigEndianClosedCaptionDescriptionData(allocator: any, closedCaptionDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, flavor: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMCopyDictionaryOfAttachments(allocator: any, target: any, attachmentMode: number): NSDictionary<any, any>;

declare function CMDoesBigEndianSoundDescriptionRequireLegacyCBRSampleTableLayout(soundDescriptionBlockBuffer: any, flavor: any): boolean;

declare function CMFormatDescriptionCreate(allocator: any, mediaType: number, mediaSubType: number, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMFormatDescriptionEqual(formatDescription: any, otherFormatDescription: any): boolean;

declare function CMFormatDescriptionEqualIgnoringExtensionKeys(formatDescription: any, otherFormatDescription: any, formatDescriptionExtensionKeysToIgnore: any, sampleDescriptionExtensionAtomKeysToIgnore: any): boolean;

declare function CMFormatDescriptionGetExtension(desc: any, extensionKey: string): any;

declare function CMFormatDescriptionGetExtensions(desc: any): NSDictionary<any, any>;

declare function CMFormatDescriptionGetMediaSubType(desc: any): number;

declare function CMFormatDescriptionGetMediaType(desc: any): number;

declare function CMFormatDescriptionGetTypeID(): number;

declare function CMGetAttachment(target: any, key: string, attachmentModeOut: interop.Pointer | interop.Reference<number>): any;

declare function CMMemoryPoolCreate(options: NSDictionary<any, any>): any;

declare function CMMemoryPoolFlush(pool: any): void;

declare function CMMemoryPoolGetAllocator(pool: any): any;

declare function CMMemoryPoolGetTypeID(): number;

declare function CMMemoryPoolInvalidate(pool: any): void;

declare function CMMetadataCreateIdentifierForKeyAndKeySpace(allocator: any, key: any, keySpace: string, identifierOut: interop.Pointer | interop.Reference<string>): number;

declare function CMMetadataCreateKeyFromIdentifier(allocator: any, identifier: string, keyOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataCreateKeyFromIdentifierAsCFData(allocator: any, identifier: string, keyOut: interop.Pointer | interop.Reference<NSData>): number;

declare function CMMetadataCreateKeySpaceFromIdentifier(allocator: any, identifier: string, keySpaceOut: interop.Pointer | interop.Reference<string>): number;

declare function CMMetadataDataTypeRegistryDataTypeConformsToDataType(dataType: string, conformsToDataType: string): boolean;

declare function CMMetadataDataTypeRegistryDataTypeIsBaseDataType(dataType: string): boolean;

declare function CMMetadataDataTypeRegistryDataTypeIsRegistered(dataType: string): boolean;

declare function CMMetadataDataTypeRegistryGetBaseDataTypeForConformingDataType(dataType: string): string;

declare function CMMetadataDataTypeRegistryGetBaseDataTypes(): NSArray<any>;

declare function CMMetadataDataTypeRegistryGetConformingDataTypes(dataType: string): NSArray<any>;

declare function CMMetadataDataTypeRegistryGetDataTypeDescription(dataType: string): string;

declare function CMMetadataDataTypeRegistryRegisterDataType(dataType: string, description: string, conformingDataTypes: NSArray<any> | any[]): number;

declare function CMMetadataFormatDescriptionCopyAsBigEndianMetadataDescriptionBlockBuffer(allocator: any, metadataFormatDescription: any, flavor: any, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateByMergingMetadataFormatDescriptions(allocator: any, sourceDescription: any, otherSourceDescription: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateFromBigEndianMetadataDescriptionBlockBuffer(allocator: any, metadataDescriptionBlockBuffer: any, flavor: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateFromBigEndianMetadataDescriptionData(allocator: any, metadataDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, flavor: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateWithKeys(allocator: any, metadataType: number, keys: NSArray<any> | any[], formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateWithMetadataFormatDescriptionAndMetadataSpecifications(allocator: any, sourceDescription: any, metadataSpecifications: NSArray<any> | any[], formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateWithMetadataSpecifications(allocator: any, metadataType: number, metadataSpecifications: NSArray<any> | any[], formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionGetIdentifiers(desc: any): NSArray<any>;

declare function CMMetadataFormatDescriptionGetKeyWithLocalID(desc: any, localKeyID: number): NSDictionary<any, any>;

declare function CMMuxedFormatDescriptionCreate(allocator: any, muxType: number, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMPropagateAttachments(source: any, destination: any): void;

declare function CMRemoveAllAttachments(target: any): void;

declare function CMRemoveAttachment(target: any, key: string): void;

declare function CMSampleBufferCallBlockForEachSample(sbuf: any, handler: (p1: any, p2: number) => number): number;

declare function CMSampleBufferCallForEachSample(sbuf: any, callback: interop.FunctionReference<(p1: any, p2: number, p3: interop.Pointer | interop.Reference<any>) => number>, refcon: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCopyPCMDataIntoAudioBufferList(sbuf: any, frameOffset: number, numFrames: number, bufferList: interop.Pointer | interop.Reference<AudioBufferList>): number;

declare function CMSampleBufferCopySampleBufferForRange(allocator: any, sbuf: any, sampleRange: CFRange, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreate(allocator: any, dataBuffer: any, dataReady: boolean, makeDataReadyCallback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, makeDataReadyRefcon: interop.Pointer | interop.Reference<any>, formatDescription: any, numSamples: number, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, numSampleSizeEntries: number, sampleSizeArray: interop.Pointer | interop.Reference<number>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateCopy(allocator: any, sbuf: any, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateCopyWithNewTiming(allocator: any, originalSBuf: any, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateForImageBuffer(allocator: any, imageBuffer: any, dataReady: boolean, makeDataReadyCallback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, makeDataReadyRefcon: interop.Pointer | interop.Reference<any>, formatDescription: any, sampleTiming: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateForImageBufferWithMakeDataReadyHandler(allocator: any, imageBuffer: any, dataReady: boolean, formatDescription: any, sampleTiming: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sampleBufferOut: interop.Pointer | interop.Reference<any>, makeDataReadyHandler: (p1: any) => number): number;

declare function CMSampleBufferCreateReady(allocator: any, dataBuffer: any, formatDescription: any, numSamples: number, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, numSampleSizeEntries: number, sampleSizeArray: interop.Pointer | interop.Reference<number>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateReadyWithImageBuffer(allocator: any, imageBuffer: any, formatDescription: any, sampleTiming: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sampleBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateWithMakeDataReadyHandler(allocator: any, dataBuffer: any, dataReady: boolean, formatDescription: any, numSamples: number, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, numSampleSizeEntries: number, sampleSizeArray: interop.Pointer | interop.Reference<number>, sampleBufferOut: interop.Pointer | interop.Reference<any>, makeDataReadyHandler: (p1: any) => number): number;

declare function CMSampleBufferDataIsReady(sbuf: any): boolean;

declare function CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(sbuf: any, bufferListSizeNeededOut: interop.Pointer | interop.Reference<number>, bufferListOut: interop.Pointer | interop.Reference<AudioBufferList>, bufferListSize: number, blockBufferStructureAllocator: any, blockBufferBlockAllocator: any, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferGetAudioStreamPacketDescriptions(sbuf: any, packetDescriptionsSize: number, packetDescriptionsOut: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, packetDescriptionsSizeNeededOut: interop.Pointer | interop.Reference<number>): number;

declare function CMSampleBufferGetAudioStreamPacketDescriptionsPtr(sbuf: any, packetDescriptionsPointerOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<AudioStreamPacketDescription>>, packetDescriptionsSizeOut: interop.Pointer | interop.Reference<number>): number;

declare function CMSampleBufferGetDataBuffer(sbuf: any): any;

declare function CMSampleBufferGetDecodeTimeStamp(sbuf: any): CMTime;

declare function CMSampleBufferGetDuration(sbuf: any): CMTime;

declare function CMSampleBufferGetFormatDescription(sbuf: any): any;

declare function CMSampleBufferGetImageBuffer(sbuf: any): any;

declare function CMSampleBufferGetNumSamples(sbuf: any): number;

declare function CMSampleBufferGetOutputDecodeTimeStamp(sbuf: any): CMTime;

declare function CMSampleBufferGetOutputDuration(sbuf: any): CMTime;

declare function CMSampleBufferGetOutputPresentationTimeStamp(sbuf: any): CMTime;

declare function CMSampleBufferGetOutputSampleTimingInfoArray(sbuf: any, timingArrayEntries: number, timingArrayOut: interop.Pointer | interop.Reference<CMSampleTimingInfo>, timingArrayEntriesNeededOut: interop.Pointer | interop.Reference<number>): number;

declare function CMSampleBufferGetPresentationTimeStamp(sbuf: any): CMTime;

declare function CMSampleBufferGetSampleAttachmentsArray(sbuf: any, createIfNecessary: boolean): NSArray<any>;

declare function CMSampleBufferGetSampleSize(sbuf: any, sampleIndex: number): number;

declare function CMSampleBufferGetSampleSizeArray(sbuf: any, sizeArrayEntries: number, sizeArrayOut: interop.Pointer | interop.Reference<number>, sizeArrayEntriesNeededOut: interop.Pointer | interop.Reference<number>): number;

declare function CMSampleBufferGetSampleTimingInfo(sbuf: any, sampleIndex: number, timingInfoOut: interop.Pointer | interop.Reference<CMSampleTimingInfo>): number;

declare function CMSampleBufferGetSampleTimingInfoArray(sbuf: any, numSampleTimingEntries: number, timingArrayOut: interop.Pointer | interop.Reference<CMSampleTimingInfo>, timingArrayEntriesNeededOut: interop.Pointer | interop.Reference<number>): number;

declare function CMSampleBufferGetTotalSampleSize(sbuf: any): number;

declare function CMSampleBufferGetTypeID(): number;

declare function CMSampleBufferHasDataFailed(sbuf: any, statusOut: interop.Pointer | interop.Reference<number>): boolean;

declare function CMSampleBufferInvalidate(sbuf: any): number;

declare function CMSampleBufferIsValid(sbuf: any): boolean;

declare function CMSampleBufferMakeDataReady(sbuf: any): number;

declare function CMSampleBufferSetDataBuffer(sbuf: any, dataBuffer: any): number;

declare function CMSampleBufferSetDataBufferFromAudioBufferList(sbuf: any, blockBufferStructureAllocator: any, blockBufferBlockAllocator: any, flags: number, bufferList: interop.Pointer | interop.Reference<AudioBufferList>): number;

declare function CMSampleBufferSetDataFailed(sbuf: any, status: number): number;

declare function CMSampleBufferSetDataReady(sbuf: any): number;

declare function CMSampleBufferSetInvalidateCallback(sbuf: any, invalidateCallback: interop.FunctionReference<(p1: any, p2: number) => void>, invalidateRefCon: number): number;

declare function CMSampleBufferSetInvalidateHandler(sbuf: any, invalidateHandler: (p1: any) => void): number;

declare function CMSampleBufferSetOutputPresentationTimeStamp(sbuf: any, outputPresentationTimeStamp: CMTime): number;

declare function CMSampleBufferTrackDataReadiness(sbuf: any, sampleBufferToTrack: any): number;

interface CMSampleTimingInfo {
	duration: CMTime;
	presentationTimeStamp: CMTime;
	decodeTimeStamp: CMTime;
}
declare var CMSampleTimingInfo: interop.StructType<CMSampleTimingInfo>;

declare function CMSetAttachment(target: any, key: string, value: any, attachmentMode: number): void;

declare function CMSetAttachments(target: any, theAttachments: NSDictionary<any, any>, attachmentMode: number): void;

declare function CMSimpleQueueCreate(allocator: any, capacity: number, queueOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSimpleQueueDequeue(queue: any): interop.Pointer | interop.Reference<any>;

declare function CMSimpleQueueEnqueue(queue: any, element: interop.Pointer | interop.Reference<any>): number;

declare function CMSimpleQueueGetCapacity(queue: any): number;

declare function CMSimpleQueueGetCount(queue: any): number;

declare function CMSimpleQueueGetHead(queue: any): interop.Pointer | interop.Reference<any>;

declare function CMSimpleQueueGetTypeID(): number;

declare function CMSimpleQueueReset(queue: any): number;

declare function CMSwapBigEndianClosedCaptionDescriptionToHost(closedCaptionDescriptionData: string | interop.Pointer | interop.Reference<any>, closedCaptionDescriptionSize: number): number;

declare function CMSwapBigEndianImageDescriptionToHost(imageDescriptionData: string | interop.Pointer | interop.Reference<any>, imageDescriptionSize: number): number;

declare function CMSwapBigEndianMetadataDescriptionToHost(metadataDescriptionData: string | interop.Pointer | interop.Reference<any>, metadataDescriptionSize: number): number;

declare function CMSwapBigEndianSoundDescriptionToHost(soundDescriptionData: string | interop.Pointer | interop.Reference<any>, soundDescriptionSize: number): number;

declare function CMSwapBigEndianTextDescriptionToHost(textDescriptionData: string | interop.Pointer | interop.Reference<any>, textDescriptionSize: number): number;

declare function CMSwapBigEndianTimeCodeDescriptionToHost(timeCodeDescriptionData: string | interop.Pointer | interop.Reference<any>, timeCodeDescriptionSize: number): number;

declare function CMSwapHostEndianClosedCaptionDescriptionToBig(closedCaptionDescriptionData: string | interop.Pointer | interop.Reference<any>, closedCaptionDescriptionSize: number): number;

declare function CMSwapHostEndianImageDescriptionToBig(imageDescriptionData: string | interop.Pointer | interop.Reference<any>, imageDescriptionSize: number): number;

declare function CMSwapHostEndianMetadataDescriptionToBig(metadataDescriptionData: string | interop.Pointer | interop.Reference<any>, metadataDescriptionSize: number): number;

declare function CMSwapHostEndianSoundDescriptionToBig(soundDescriptionData: string | interop.Pointer | interop.Reference<any>, soundDescriptionSize: number): number;

declare function CMSwapHostEndianTextDescriptionToBig(textDescriptionData: string | interop.Pointer | interop.Reference<any>, textDescriptionSize: number): number;

declare function CMSwapHostEndianTimeCodeDescriptionToBig(timeCodeDescriptionData: string | interop.Pointer | interop.Reference<any>, timeCodeDescriptionSize: number): number;

declare function CMSyncConvertTime(time: CMTime, fromClockOrTimebase: any, toClockOrTimebase: any): CMTime;

declare function CMSyncGetRelativeRate(ofClockOrTimebase: any, relativeToClockOrTimebase: any): number;

declare function CMSyncGetRelativeRateAndAnchorTime(ofClockOrTimebase: any, relativeToClockOrTimebase: any, outRelativeRate: interop.Pointer | interop.Reference<number>, outOfClockOrTimebaseAnchorTime: interop.Pointer | interop.Reference<CMTime>, outRelativeToClockOrTimebaseAnchorTime: interop.Pointer | interop.Reference<CMTime>): number;

declare function CMSyncGetTime(clockOrTimebase: any): CMTime;

declare function CMSyncMightDrift(clockOrTimebase1: any, clockOrTimebase2: any): boolean;

declare function CMTextFormatDescriptionCopyAsBigEndianTextDescriptionBlockBuffer(allocator: any, textFormatDescription: any, flavor: any, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTextFormatDescriptionCreateFromBigEndianTextDescriptionBlockBuffer(allocator: any, textDescriptionBlockBuffer: any, flavor: any, mediaType: number, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTextFormatDescriptionCreateFromBigEndianTextDescriptionData(allocator: any, textDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, flavor: any, mediaType: number, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTextFormatDescriptionGetDefaultStyle(desc: any, localFontIDOut: interop.Pointer | interop.Reference<number>, boldOut: string | interop.Pointer | interop.Reference<any>, italicOut: string | interop.Pointer | interop.Reference<any>, underlineOut: string | interop.Pointer | interop.Reference<any>, fontSizeOut: interop.Pointer | interop.Reference<number>, colorComponentsOut: interop.Reference<number>): number;

declare function CMTextFormatDescriptionGetDefaultTextBox(desc: any, originIsAtTopLeft: boolean, heightOfTextTrack: number, defaultTextBoxOut: interop.Pointer | interop.Reference<CGRect>): number;

declare function CMTextFormatDescriptionGetDisplayFlags(desc: any, displayFlagsOut: interop.Pointer | interop.Reference<number>): number;

declare function CMTextFormatDescriptionGetFontName(desc: any, localFontID: number, fontNameOut: interop.Pointer | interop.Reference<string>): number;

declare function CMTextFormatDescriptionGetJustification(desc: any, horizontaJustificationlOut: interop.Pointer | interop.Reference<number>, verticalJustificationOut: interop.Pointer | interop.Reference<number>): number;

interface CMTime {
	value: number;
	timescale: number;
	flags: CMTimeFlags;
	epoch: number;
}
declare var CMTime: interop.StructType<CMTime>;

declare function CMTimeAbsoluteValue(time: CMTime): CMTime;

declare function CMTimeAdd(lhs: CMTime, rhs: CMTime): CMTime;

declare function CMTimeClampToRange(time: CMTime, range: CMTimeRange): CMTime;

declare function CMTimeCodeFormatDescriptionCopyAsBigEndianTimeCodeDescriptionBlockBuffer(allocator: any, timeCodeFormatDescription: any, flavor: any, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTimeCodeFormatDescriptionCreate(allocator: any, timeCodeFormatType: number, frameDuration: CMTime, frameQuanta: number, flags: number, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTimeCodeFormatDescriptionCreateFromBigEndianTimeCodeDescriptionBlockBuffer(allocator: any, timeCodeDescriptionBlockBuffer: any, flavor: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTimeCodeFormatDescriptionCreateFromBigEndianTimeCodeDescriptionData(allocator: any, timeCodeDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, flavor: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTimeCodeFormatDescriptionGetFrameDuration(timeCodeFormatDescription: any): CMTime;

declare function CMTimeCodeFormatDescriptionGetFrameQuanta(timeCodeFormatDescription: any): number;

declare function CMTimeCodeFormatDescriptionGetTimeCodeFlags(desc: any): number;

declare function CMTimeCompare(time1: CMTime, time2: CMTime): number;

declare function CMTimeConvertScale(time: CMTime, newTimescale: number, method: CMTimeRoundingMethod): CMTime;

declare function CMTimeCopyAsDictionary(time: CMTime, allocator: any): NSDictionary<any, any>;

declare function CMTimeCopyDescription(allocator: any, time: CMTime): string;

declare const enum CMTimeFlags {

	kCMTimeFlags_Valid = 1,

	kCMTimeFlags_HasBeenRounded = 2,

	kCMTimeFlags_PositiveInfinity = 4,

	kCMTimeFlags_NegativeInfinity = 8,

	kCMTimeFlags_Indefinite = 16,

	kCMTimeFlags_ImpliedValueFlagsMask = 28
}

declare function CMTimeFoldIntoRange(time: CMTime, foldRange: CMTimeRange): CMTime;

declare function CMTimeGetSeconds(time: CMTime): number;

declare function CMTimeMake(value: number, timescale: number): CMTime;

declare function CMTimeMakeFromDictionary(dictionaryRepresentation: NSDictionary<any, any>): CMTime;

declare function CMTimeMakeWithEpoch(value: number, timescale: number, epoch: number): CMTime;

declare function CMTimeMakeWithSeconds(seconds: number, preferredTimescale: number): CMTime;

declare function CMTimeMapDurationFromRangeToRange(dur: CMTime, fromRange: CMTimeRange, toRange: CMTimeRange): CMTime;

declare function CMTimeMapTimeFromRangeToRange(t: CMTime, fromRange: CMTimeRange, toRange: CMTimeRange): CMTime;

interface CMTimeMapping {
	source: CMTimeRange;
	target: CMTimeRange;
}
declare var CMTimeMapping: interop.StructType<CMTimeMapping>;

declare function CMTimeMappingCopyAsDictionary(mapping: CMTimeMapping, allocator: any): NSDictionary<any, any>;

declare function CMTimeMappingCopyDescription(allocator: any, mapping: CMTimeMapping): string;

declare function CMTimeMappingMake(source: CMTimeRange, target: CMTimeRange): CMTimeMapping;

declare function CMTimeMappingMakeEmpty(target: CMTimeRange): CMTimeMapping;

declare function CMTimeMappingMakeFromDictionary(dictionaryRepresentation: NSDictionary<any, any>): CMTimeMapping;

declare function CMTimeMappingShow(mapping: CMTimeMapping): void;

declare function CMTimeMaximum(time1: CMTime, time2: CMTime): CMTime;

declare function CMTimeMinimum(time1: CMTime, time2: CMTime): CMTime;

declare function CMTimeMultiply(time: CMTime, multiplier: number): CMTime;

declare function CMTimeMultiplyByFloat64(time: CMTime, multiplier: number): CMTime;

declare function CMTimeMultiplyByRatio(time: CMTime, multiplier: number, divisor: number): CMTime;

interface CMTimeRange {
	start: CMTime;
	duration: CMTime;
}
declare var CMTimeRange: interop.StructType<CMTimeRange>;

declare function CMTimeRangeContainsTime(range: CMTimeRange, time: CMTime): boolean;

declare function CMTimeRangeContainsTimeRange(range: CMTimeRange, otherRange: CMTimeRange): boolean;

declare function CMTimeRangeCopyAsDictionary(range: CMTimeRange, allocator: any): NSDictionary<any, any>;

declare function CMTimeRangeCopyDescription(allocator: any, range: CMTimeRange): string;

declare function CMTimeRangeEqual(range1: CMTimeRange, range2: CMTimeRange): boolean;

declare function CMTimeRangeFromTimeToTime(start: CMTime, end: CMTime): CMTimeRange;

declare function CMTimeRangeGetEnd(range: CMTimeRange): CMTime;

declare function CMTimeRangeGetIntersection(range: CMTimeRange, otherRange: CMTimeRange): CMTimeRange;

declare function CMTimeRangeGetUnion(range: CMTimeRange, otherRange: CMTimeRange): CMTimeRange;

declare function CMTimeRangeMake(start: CMTime, duration: CMTime): CMTimeRange;

declare function CMTimeRangeMakeFromDictionary(dictionaryRepresentation: NSDictionary<any, any>): CMTimeRange;

declare function CMTimeRangeShow(range: CMTimeRange): void;

declare const enum CMTimeRoundingMethod {

	kCMTimeRoundingMethod_RoundHalfAwayFromZero = 1,

	kCMTimeRoundingMethod_RoundTowardZero = 2,

	kCMTimeRoundingMethod_RoundAwayFromZero = 3,

	kCMTimeRoundingMethod_QuickTime = 4,

	kCMTimeRoundingMethod_RoundTowardPositiveInfinity = 5,

	kCMTimeRoundingMethod_RoundTowardNegativeInfinity = 6,

	kCMTimeRoundingMethod_Default = 1
}

declare function CMTimeShow(time: CMTime): void;

declare function CMTimeSubtract(lhs: CMTime, rhs: CMTime): CMTime;

declare function CMTimebaseAddTimer(timebase: any, timer: NSTimer, runloop: any): number;

declare function CMTimebaseAddTimerDispatchSource(timebase: any, timerSource: NSObject): number;

declare function CMTimebaseCopyMaster(timebase: any): any;

declare function CMTimebaseCopyMasterClock(timebase: any): any;

declare function CMTimebaseCopyMasterTimebase(timebase: any): any;

declare function CMTimebaseCopyUltimateMasterClock(timebase: any): any;

declare function CMTimebaseCreateWithMasterClock(allocator: any, masterClock: any, timebaseOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTimebaseCreateWithMasterTimebase(allocator: any, masterTimebase: any, timebaseOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTimebaseGetEffectiveRate(timebase: any): number;

declare function CMTimebaseGetMaster(timebase: any): any;

declare function CMTimebaseGetMasterClock(timebase: any): any;

declare function CMTimebaseGetMasterTimebase(timebase: any): any;

declare function CMTimebaseGetRate(timebase: any): number;

declare function CMTimebaseGetTime(timebase: any): CMTime;

declare function CMTimebaseGetTimeAndRate(timebase: any, timeOut: interop.Pointer | interop.Reference<CMTime>, rateOut: interop.Pointer | interop.Reference<number>): number;

declare function CMTimebaseGetTimeWithTimeScale(timebase: any, timescale: number, method: CMTimeRoundingMethod): CMTime;

declare function CMTimebaseGetTypeID(): number;

declare function CMTimebaseGetUltimateMasterClock(timebase: any): any;

declare function CMTimebaseNotificationBarrier(timebase: any): number;

declare function CMTimebaseRemoveTimer(timebase: any, timer: NSTimer): number;

declare function CMTimebaseRemoveTimerDispatchSource(timebase: any, timerSource: NSObject): number;

declare function CMTimebaseSetAnchorTime(timebase: any, timebaseTime: CMTime, immediateMasterTime: CMTime): number;

declare function CMTimebaseSetMasterClock(timebase: any, newMasterClock: any): number;

declare function CMTimebaseSetMasterTimebase(timebase: any, newMasterTimebase: any): number;

declare function CMTimebaseSetRate(timebase: any, rate: number): number;

declare function CMTimebaseSetRateAndAnchorTime(timebase: any, rate: number, timebaseTime: CMTime, immediateMasterTime: CMTime): number;

declare function CMTimebaseSetTime(timebase: any, time: CMTime): number;

declare function CMTimebaseSetTimerDispatchSourceNextFireTime(timebase: any, timerSource: NSObject, fireTime: CMTime, flags: number): number;

declare function CMTimebaseSetTimerDispatchSourceToFireImmediately(timebase: any, timerSource: NSObject): number;

declare function CMTimebaseSetTimerNextFireTime(timebase: any, timer: NSTimer, fireTime: CMTime, flags: number): number;

declare function CMTimebaseSetTimerToFireImmediately(timebase: any, timer: NSTimer): number;

interface CMVideoDimensions {
	width: number;
	height: number;
}
declare var CMVideoDimensions: interop.StructType<CMVideoDimensions>;

declare function CMVideoFormatDescriptionCopyAsBigEndianImageDescriptionBlockBuffer(allocator: any, videoFormatDescription: any, stringEncoding: number, flavor: any, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreate(allocator: any, codecType: number, width: number, height: number, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreateForImageBuffer(allocator: any, imageBuffer: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreateFromBigEndianImageDescriptionBlockBuffer(allocator: any, imageDescriptionBlockBuffer: any, stringEncoding: number, flavor: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreateFromBigEndianImageDescriptionData(allocator: any, imageDescriptionData: string | interop.Pointer | interop.Reference<any>, size: number, stringEncoding: number, flavor: any, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreateFromH264ParameterSets(allocator: any, parameterSetCount: number, parameterSetPointers: interop.Pointer | interop.Reference<string>, parameterSetSizes: interop.Pointer | interop.Reference<number>, NALUnitHeaderLength: number, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreateFromHEVCParameterSets(allocator: any, parameterSetCount: number, parameterSetPointers: interop.Pointer | interop.Reference<string>, parameterSetSizes: interop.Pointer | interop.Reference<number>, NALUnitHeaderLength: number, extensions: NSDictionary<any, any>, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionGetCleanAperture(videoDesc: any, originIsAtTopLeft: boolean): CGRect;

declare function CMVideoFormatDescriptionGetDimensions(videoDesc: any): CMVideoDimensions;

declare function CMVideoFormatDescriptionGetExtensionKeysCommonWithImageBuffers(): NSArray<any>;

declare function CMVideoFormatDescriptionGetH264ParameterSetAtIndex(videoDesc: any, parameterSetIndex: number, parameterSetPointerOut: interop.Pointer | interop.Reference<string>, parameterSetSizeOut: interop.Pointer | interop.Reference<number>, parameterSetCountOut: interop.Pointer | interop.Reference<number>, NALUnitHeaderLengthOut: interop.Pointer | interop.Reference<number>): number;

declare function CMVideoFormatDescriptionGetHEVCParameterSetAtIndex(videoDesc: any, parameterSetIndex: number, parameterSetPointerOut: interop.Pointer | interop.Reference<string>, parameterSetSizeOut: interop.Pointer | interop.Reference<number>, parameterSetCountOut: interop.Pointer | interop.Reference<number>, NALUnitHeaderLengthOut: interop.Pointer | interop.Reference<number>): number;

declare function CMVideoFormatDescriptionGetPresentationDimensions(videoDesc: any, usePixelAspectRatio: boolean, useCleanAperture: boolean): CGSize;

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

declare var kCMFormatDescriptionAlphaChannelMode_PremultipliedAlpha: string;

declare var kCMFormatDescriptionAlphaChannelMode_StraightAlpha: string;

declare const kCMFormatDescriptionBridgeError_AllocationFailed: number;

declare const kCMFormatDescriptionBridgeError_IncompatibleFormatDescription: number;

declare const kCMFormatDescriptionBridgeError_InvalidFormatDescription: number;

declare const kCMFormatDescriptionBridgeError_InvalidParameter: number;

declare const kCMFormatDescriptionBridgeError_InvalidSerializedSampleDescription: number;

declare const kCMFormatDescriptionBridgeError_InvalidSlice: number;

declare const kCMFormatDescriptionBridgeError_UnsupportedSampleDescriptionFlavor: number;

declare var kCMFormatDescriptionChromaLocation_Bottom: string;

declare var kCMFormatDescriptionChromaLocation_BottomLeft: string;

declare var kCMFormatDescriptionChromaLocation_Center: string;

declare var kCMFormatDescriptionChromaLocation_DV420: string;

declare var kCMFormatDescriptionChromaLocation_Left: string;

declare var kCMFormatDescriptionChromaLocation_Top: string;

declare var kCMFormatDescriptionChromaLocation_TopLeft: string;

declare var kCMFormatDescriptionColorPrimaries_DCI_P3: string;

declare var kCMFormatDescriptionColorPrimaries_EBU_3213: string;

declare var kCMFormatDescriptionColorPrimaries_ITU_R_2020: string;

declare var kCMFormatDescriptionColorPrimaries_ITU_R_709_2: string;

declare var kCMFormatDescriptionColorPrimaries_P22: string;

declare var kCMFormatDescriptionColorPrimaries_P3_D65: string;

declare var kCMFormatDescriptionColorPrimaries_SMPTE_C: string;

declare var kCMFormatDescriptionConformsToMPEG2VideoProfile: string;

declare const kCMFormatDescriptionError_AllocationFailed: number;

declare const kCMFormatDescriptionError_InvalidParameter: number;

declare const kCMFormatDescriptionError_ValueNotAvailable: number;

declare var kCMFormatDescriptionExtensionKey_MetadataKeyTable: string;

declare var kCMFormatDescriptionExtension_AlphaChannelMode: string;

declare var kCMFormatDescriptionExtension_AlternativeTransferCharacteristics: string;

declare var kCMFormatDescriptionExtension_AuxiliaryTypeInfo: string;

declare var kCMFormatDescriptionExtension_BytesPerRow: string;

declare var kCMFormatDescriptionExtension_ChromaLocationBottomField: string;

declare var kCMFormatDescriptionExtension_ChromaLocationTopField: string;

declare var kCMFormatDescriptionExtension_CleanAperture: string;

declare var kCMFormatDescriptionExtension_ColorPrimaries: string;

declare var kCMFormatDescriptionExtension_ContainsAlphaChannel: string;

declare var kCMFormatDescriptionExtension_ContentLightLevelInfo: string;

declare var kCMFormatDescriptionExtension_Depth: string;

declare var kCMFormatDescriptionExtension_FieldCount: string;

declare var kCMFormatDescriptionExtension_FieldDetail: string;

declare var kCMFormatDescriptionExtension_FormatName: string;

declare var kCMFormatDescriptionExtension_FullRangeVideo: string;

declare var kCMFormatDescriptionExtension_GammaLevel: string;

declare var kCMFormatDescriptionExtension_ICCProfile: string;

declare var kCMFormatDescriptionExtension_MasteringDisplayColorVolume: string;

declare var kCMFormatDescriptionExtension_OriginalCompressionSettings: string;

declare var kCMFormatDescriptionExtension_PixelAspectRatio: string;

declare var kCMFormatDescriptionExtension_RevisionLevel: string;

declare var kCMFormatDescriptionExtension_SampleDescriptionExtensionAtoms: string;

declare var kCMFormatDescriptionExtension_SpatialQuality: string;

declare var kCMFormatDescriptionExtension_TemporalQuality: string;

declare var kCMFormatDescriptionExtension_TransferFunction: string;

declare var kCMFormatDescriptionExtension_Vendor: string;

declare var kCMFormatDescriptionExtension_VerbatimISOSampleEntry: string;

declare var kCMFormatDescriptionExtension_VerbatimImageDescription: string;

declare var kCMFormatDescriptionExtension_VerbatimSampleDescription: string;

declare var kCMFormatDescriptionExtension_Version: string;

declare var kCMFormatDescriptionExtension_YCbCrMatrix: string;

declare var kCMFormatDescriptionFieldDetail_SpatialFirstLineEarly: string;

declare var kCMFormatDescriptionFieldDetail_SpatialFirstLineLate: string;

declare var kCMFormatDescriptionFieldDetail_TemporalBottomFirst: string;

declare var kCMFormatDescriptionFieldDetail_TemporalTopFirst: string;

declare var kCMFormatDescriptionKey_CleanApertureHeight: string;

declare var kCMFormatDescriptionKey_CleanApertureHeightRational: string;

declare var kCMFormatDescriptionKey_CleanApertureHorizontalOffset: string;

declare var kCMFormatDescriptionKey_CleanApertureHorizontalOffsetRational: string;

declare var kCMFormatDescriptionKey_CleanApertureVerticalOffset: string;

declare var kCMFormatDescriptionKey_CleanApertureVerticalOffsetRational: string;

declare var kCMFormatDescriptionKey_CleanApertureWidth: string;

declare var kCMFormatDescriptionKey_CleanApertureWidthRational: string;

declare var kCMFormatDescriptionKey_PixelAspectRatioHorizontalSpacing: string;

declare var kCMFormatDescriptionKey_PixelAspectRatioVerticalSpacing: string;

declare var kCMFormatDescriptionTransferFunction_ITU_R_2020: string;

declare var kCMFormatDescriptionTransferFunction_ITU_R_2100_HLG: string;

declare var kCMFormatDescriptionTransferFunction_ITU_R_709_2: string;

declare var kCMFormatDescriptionTransferFunction_Linear: string;

declare var kCMFormatDescriptionTransferFunction_SMPTE_240M_1995: string;

declare var kCMFormatDescriptionTransferFunction_SMPTE_ST_2084_PQ: string;

declare var kCMFormatDescriptionTransferFunction_SMPTE_ST_428_1: string;

declare var kCMFormatDescriptionTransferFunction_UseGamma: string;

declare var kCMFormatDescriptionTransferFunction_sRGB: string;

declare var kCMFormatDescriptionVendor_Apple: string;

declare var kCMFormatDescriptionYCbCrMatrix_ITU_R_2020: string;

declare var kCMFormatDescriptionYCbCrMatrix_ITU_R_601_4: string;

declare var kCMFormatDescriptionYCbCrMatrix_ITU_R_709_2: string;

declare var kCMFormatDescriptionYCbCrMatrix_SMPTE_240M_1995: string;

declare var kCMHEVCTemporalLevelInfoKey_ConstraintIndicatorFlags: string;

declare var kCMHEVCTemporalLevelInfoKey_LevelIndex: string;

declare var kCMHEVCTemporalLevelInfoKey_ProfileCompatibilityFlags: string;

declare var kCMHEVCTemporalLevelInfoKey_ProfileIndex: string;

declare var kCMHEVCTemporalLevelInfoKey_ProfileSpace: string;

declare var kCMHEVCTemporalLevelInfoKey_TemporalLevel: string;

declare var kCMHEVCTemporalLevelInfoKey_TierFlag: string;

declare var kCMImageDescriptionFlavor_3GPFamily: any;

declare var kCMImageDescriptionFlavor_ISOFamily: any;

declare var kCMImageDescriptionFlavor_QuickTimeMovie: any;

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

declare const kCMMediaType_ClosedCaption: number;

declare const kCMMediaType_Metadata: number;

declare const kCMMediaType_Muxed: number;

declare const kCMMediaType_Subtitle: number;

declare const kCMMediaType_Text: number;

declare const kCMMediaType_TimeCode: number;

declare const kCMMediaType_Video: number;

declare var kCMMemoryPoolOption_AgeOutPeriod: string;

declare var kCMMetadataBaseDataType_AffineTransformF64: string;

declare var kCMMetadataBaseDataType_BMP: string;

declare var kCMMetadataBaseDataType_DimensionsF32: string;

declare var kCMMetadataBaseDataType_Float32: string;

declare var kCMMetadataBaseDataType_Float64: string;

declare var kCMMetadataBaseDataType_GIF: string;

declare var kCMMetadataBaseDataType_JPEG: string;

declare var kCMMetadataBaseDataType_JSON: string;

declare var kCMMetadataBaseDataType_PNG: string;

declare var kCMMetadataBaseDataType_PerspectiveTransformF64: string;

declare var kCMMetadataBaseDataType_PointF32: string;

declare var kCMMetadataBaseDataType_PolygonF32: string;

declare var kCMMetadataBaseDataType_PolylineF32: string;

declare var kCMMetadataBaseDataType_RawData: string;

declare var kCMMetadataBaseDataType_RectF32: string;

declare var kCMMetadataBaseDataType_SInt16: string;

declare var kCMMetadataBaseDataType_SInt32: string;

declare var kCMMetadataBaseDataType_SInt64: string;

declare var kCMMetadataBaseDataType_SInt8: string;

declare var kCMMetadataBaseDataType_UInt16: string;

declare var kCMMetadataBaseDataType_UInt32: string;

declare var kCMMetadataBaseDataType_UInt64: string;

declare var kCMMetadataBaseDataType_UInt8: string;

declare var kCMMetadataBaseDataType_UTF16: string;

declare var kCMMetadataBaseDataType_UTF8: string;

declare const kCMMetadataDataTypeRegistryError_AllocationFailed: number;

declare const kCMMetadataDataTypeRegistryError_BadDataTypeIdentifier: number;

declare const kCMMetadataDataTypeRegistryError_DataTypeAlreadyRegistered: number;

declare const kCMMetadataDataTypeRegistryError_MultipleConformingBaseTypes: number;

declare const kCMMetadataDataTypeRegistryError_RequiredParameterMissing: number;

declare const kCMMetadataDataTypeRegistryError_RequiresConformingBaseType: number;

declare var kCMMetadataDataType_QuickTimeMetadataDirection: string;

declare var kCMMetadataDataType_QuickTimeMetadataLocation_ISO6709: string;

declare var kCMMetadataFormatDescriptionKey_ConformingDataTypes: string;

declare var kCMMetadataFormatDescriptionKey_DataType: string;

declare var kCMMetadataFormatDescriptionKey_DataTypeNamespace: string;

declare var kCMMetadataFormatDescriptionKey_LanguageTag: string;

declare var kCMMetadataFormatDescriptionKey_LocalID: string;

declare var kCMMetadataFormatDescriptionKey_Namespace: string;

declare var kCMMetadataFormatDescriptionKey_SetupData: string;

declare var kCMMetadataFormatDescriptionKey_StructuralDependency: string;

declare var kCMMetadataFormatDescriptionKey_Value: string;

declare var kCMMetadataFormatDescriptionMetadataSpecificationKey_DataType: string;

declare var kCMMetadataFormatDescriptionMetadataSpecificationKey_ExtendedLanguageTag: string;

declare var kCMMetadataFormatDescriptionMetadataSpecificationKey_Identifier: string;

declare var kCMMetadataFormatDescriptionMetadataSpecificationKey_SetupData: string;

declare var kCMMetadataFormatDescriptionMetadataSpecificationKey_StructuralDependency: string;

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

declare var kCMMetadataIdentifier_QuickTimeMetadataDirection_Facing: string;

declare var kCMMetadataIdentifier_QuickTimeMetadataLivePhotoStillImageTransform: string;

declare var kCMMetadataIdentifier_QuickTimeMetadataLivePhotoStillImageTransformReferenceDimensions: string;

declare var kCMMetadataIdentifier_QuickTimeMetadataLocation_ISO6709: string;

declare var kCMMetadataIdentifier_QuickTimeMetadataPreferredAffineTransform: string;

declare var kCMMetadataIdentifier_QuickTimeMetadataVideoOrientation: string;

declare var kCMMetadataKeySpace_HLSDateRange: string;

declare var kCMMetadataKeySpace_ID3: string;

declare var kCMMetadataKeySpace_ISOUserData: string;

declare var kCMMetadataKeySpace_Icy: string;

declare var kCMMetadataKeySpace_QuickTimeMetadata: string;

declare var kCMMetadataKeySpace_QuickTimeUserData: string;

declare var kCMMetadataKeySpace_iTunes: string;

declare const kCMMuxedStreamType_DV: number;

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

declare var kCMSampleAttachmentKey_AudioIndependentSampleDecoderRefreshCount: string;

declare var kCMSampleAttachmentKey_DependsOnOthers: string;

declare var kCMSampleAttachmentKey_DisplayImmediately: string;

declare var kCMSampleAttachmentKey_DoNotDisplay: string;

declare var kCMSampleAttachmentKey_EarlierDisplayTimesAllowed: string;

declare var kCMSampleAttachmentKey_HEVCStepwiseTemporalSubLayerAccess: string;

declare var kCMSampleAttachmentKey_HEVCSyncSampleNALUnitType: string;

declare var kCMSampleAttachmentKey_HEVCTemporalLevelInfo: string;

declare var kCMSampleAttachmentKey_HEVCTemporalSubLayerAccess: string;

declare var kCMSampleAttachmentKey_HasRedundantCoding: string;

declare var kCMSampleAttachmentKey_IsDependedOnByOthers: string;

declare var kCMSampleAttachmentKey_NotSync: string;

declare var kCMSampleAttachmentKey_PartialSync: string;

declare var kCMSampleBufferAttachmentKey_CameraIntrinsicMatrix: string;

declare var kCMSampleBufferAttachmentKey_DisplayEmptyMediaImmediately: string;

declare var kCMSampleBufferAttachmentKey_DrainAfterDecoding: string;

declare var kCMSampleBufferAttachmentKey_DroppedFrameReason: string;

declare var kCMSampleBufferAttachmentKey_DroppedFrameReasonInfo: string;

declare var kCMSampleBufferAttachmentKey_EmptyMedia: string;

declare var kCMSampleBufferAttachmentKey_EndsPreviousSampleDuration: string;

declare var kCMSampleBufferAttachmentKey_FillDiscontinuitiesWithSilence: string;

declare var kCMSampleBufferAttachmentKey_ForceKeyFrame: string;

declare var kCMSampleBufferAttachmentKey_GradualDecoderRefresh: string;

declare var kCMSampleBufferAttachmentKey_PermanentEmptyMedia: string;

declare var kCMSampleBufferAttachmentKey_PostNotificationWhenConsumed: string;

declare var kCMSampleBufferAttachmentKey_ResetDecoderBeforeDecoding: string;

declare var kCMSampleBufferAttachmentKey_ResumeOutput: string;

declare var kCMSampleBufferAttachmentKey_Reverse: string;

declare var kCMSampleBufferAttachmentKey_SampleReferenceByteOffset: string;

declare var kCMSampleBufferAttachmentKey_SampleReferenceURL: string;

declare var kCMSampleBufferAttachmentKey_SpeedMultiplier: string;

declare var kCMSampleBufferAttachmentKey_StillImageLensStabilizationInfo: string;

declare var kCMSampleBufferAttachmentKey_TransitionID: string;

declare var kCMSampleBufferAttachmentKey_TrimDurationAtEnd: string;

declare var kCMSampleBufferAttachmentKey_TrimDurationAtStart: string;

declare var kCMSampleBufferConduitNotificationParameter_MaxUpcomingOutputPTS: string;

declare var kCMSampleBufferConduitNotificationParameter_MinUpcomingOutputPTS: string;

declare var kCMSampleBufferConduitNotificationParameter_ResumeTag: string;

declare var kCMSampleBufferConduitNotificationParameter_UpcomingOutputPTSRangeMayOverlapQueuedOutputPTSRange: string;

declare var kCMSampleBufferConduitNotification_InhibitOutputUntil: string;

declare var kCMSampleBufferConduitNotification_ResetOutput: string;

declare var kCMSampleBufferConduitNotification_UpcomingOutputPTSRangeChanged: string;

declare var kCMSampleBufferConsumerNotification_BufferConsumed: string;

declare var kCMSampleBufferDroppedFrameReasonInfo_CameraModeSwitch: string;

declare var kCMSampleBufferDroppedFrameReason_Discontinuity: string;

declare var kCMSampleBufferDroppedFrameReason_FrameWasLate: string;

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

declare var kCMSampleBufferLensStabilizationInfo_Active: string;

declare var kCMSampleBufferLensStabilizationInfo_Off: string;

declare var kCMSampleBufferLensStabilizationInfo_OutOfRange: string;

declare var kCMSampleBufferLensStabilizationInfo_Unavailable: string;

declare var kCMSampleBufferNotificationParameter_OSStatus: string;

declare var kCMSampleBufferNotification_DataBecameReady: string;

declare var kCMSampleBufferNotification_DataFailed: string;

declare const kCMSimpleQueueError_AllocationFailed: number;

declare const kCMSimpleQueueError_ParameterOutOfRange: number;

declare const kCMSimpleQueueError_QueueIsFull: number;

declare const kCMSimpleQueueError_RequiredParameterMissing: number;

declare var kCMSoundDescriptionFlavor_3GPFamily: any;

declare var kCMSoundDescriptionFlavor_ISOFamily: any;

declare var kCMSoundDescriptionFlavor_QuickTimeMovie: any;

declare var kCMSoundDescriptionFlavor_QuickTimeMovieV2: any;

declare const kCMSubtitleFormatType_3GText: number;

declare const kCMSubtitleFormatType_WebVTT: number;

declare const kCMSyncError_AllocationFailed: number;

declare const kCMSyncError_InvalidParameter: number;

declare const kCMSyncError_MissingRequiredParameter: number;

declare const kCMSyncError_RateMustBeNonZero: number;

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

declare var kCMTextFormatDescriptionColor_Alpha: string;

declare var kCMTextFormatDescriptionColor_Blue: string;

declare var kCMTextFormatDescriptionColor_Green: string;

declare var kCMTextFormatDescriptionColor_Red: string;

declare var kCMTextFormatDescriptionExtension_BackgroundColor: string;

declare var kCMTextFormatDescriptionExtension_DefaultFontName: string;

declare var kCMTextFormatDescriptionExtension_DefaultStyle: string;

declare var kCMTextFormatDescriptionExtension_DefaultTextBox: string;

declare var kCMTextFormatDescriptionExtension_DisplayFlags: string;

declare var kCMTextFormatDescriptionExtension_FontTable: string;

declare var kCMTextFormatDescriptionExtension_HorizontalJustification: string;

declare var kCMTextFormatDescriptionExtension_TextJustification: string;

declare var kCMTextFormatDescriptionExtension_VerticalJustification: string;

declare var kCMTextFormatDescriptionRect_Bottom: string;

declare var kCMTextFormatDescriptionRect_Left: string;

declare var kCMTextFormatDescriptionRect_Right: string;

declare var kCMTextFormatDescriptionRect_Top: string;

declare var kCMTextFormatDescriptionStyle_Ascent: string;

declare var kCMTextFormatDescriptionStyle_EndChar: string;

declare var kCMTextFormatDescriptionStyle_Font: string;

declare var kCMTextFormatDescriptionStyle_FontFace: string;

declare var kCMTextFormatDescriptionStyle_FontSize: string;

declare var kCMTextFormatDescriptionStyle_ForegroundColor: string;

declare var kCMTextFormatDescriptionStyle_Height: string;

declare var kCMTextFormatDescriptionStyle_StartChar: string;

declare const kCMTextFormatType_3GText: number;

declare const kCMTextFormatType_QTText: number;

declare const kCMTextJustification_bottom_right: number;

declare const kCMTextJustification_centered: number;

declare const kCMTextJustification_left_top: number;

declare var kCMTextMarkupAlignmentType_End: string;

declare var kCMTextMarkupAlignmentType_Left: string;

declare var kCMTextMarkupAlignmentType_Middle: string;

declare var kCMTextMarkupAlignmentType_Right: string;

declare var kCMTextMarkupAlignmentType_Start: string;

declare var kCMTextMarkupAttribute_Alignment: string;

declare var kCMTextMarkupAttribute_BackgroundColorARGB: string;

declare var kCMTextMarkupAttribute_BaseFontSizePercentageRelativeToVideoHeight: string;

declare var kCMTextMarkupAttribute_BoldStyle: string;

declare var kCMTextMarkupAttribute_CharacterBackgroundColorARGB: string;

declare var kCMTextMarkupAttribute_CharacterEdgeStyle: string;

declare var kCMTextMarkupAttribute_FontFamilyName: string;

declare var kCMTextMarkupAttribute_ForegroundColorARGB: string;

declare var kCMTextMarkupAttribute_GenericFontFamilyName: string;

declare var kCMTextMarkupAttribute_ItalicStyle: string;

declare var kCMTextMarkupAttribute_OrthogonalLinePositionPercentageRelativeToWritingDirection: string;

declare var kCMTextMarkupAttribute_RelativeFontSize: string;

declare var kCMTextMarkupAttribute_TextPositionPercentageRelativeToWritingDirection: string;

declare var kCMTextMarkupAttribute_UnderlineStyle: string;

declare var kCMTextMarkupAttribute_VerticalLayout: string;

declare var kCMTextMarkupAttribute_WritingDirectionSizePercentage: string;

declare var kCMTextMarkupCharacterEdgeStyle_Depressed: string;

declare var kCMTextMarkupCharacterEdgeStyle_DropShadow: string;

declare var kCMTextMarkupCharacterEdgeStyle_None: string;

declare var kCMTextMarkupCharacterEdgeStyle_Raised: string;

declare var kCMTextMarkupCharacterEdgeStyle_Uniform: string;

declare var kCMTextMarkupGenericFontName_Casual: string;

declare var kCMTextMarkupGenericFontName_Cursive: string;

declare var kCMTextMarkupGenericFontName_Default: string;

declare var kCMTextMarkupGenericFontName_Fantasy: string;

declare var kCMTextMarkupGenericFontName_Monospace: string;

declare var kCMTextMarkupGenericFontName_MonospaceSansSerif: string;

declare var kCMTextMarkupGenericFontName_MonospaceSerif: string;

declare var kCMTextMarkupGenericFontName_ProportionalSansSerif: string;

declare var kCMTextMarkupGenericFontName_ProportionalSerif: string;

declare var kCMTextMarkupGenericFontName_SansSerif: string;

declare var kCMTextMarkupGenericFontName_Serif: string;

declare var kCMTextMarkupGenericFontName_SmallCapital: string;

declare var kCMTextVerticalLayout_LeftToRight: string;

declare var kCMTextVerticalLayout_RightToLeft: string;

declare const kCMTimeCodeFlag_24HourMax: number;

declare const kCMTimeCodeFlag_DropFrame: number;

declare const kCMTimeCodeFlag_NegTimesOK: number;

declare var kCMTimeCodeFormatDescriptionExtension_SourceReferenceName: string;

declare var kCMTimeCodeFormatDescriptionKey_LangCode: string;

declare var kCMTimeCodeFormatDescriptionKey_Value: string;

declare const kCMTimeCodeFormatType_Counter32: number;

declare const kCMTimeCodeFormatType_Counter64: number;

declare const kCMTimeCodeFormatType_TimeCode32: number;

declare const kCMTimeCodeFormatType_TimeCode64: number;

declare var kCMTimeEpochKey: string;

declare var kCMTimeFlagsKey: string;

declare var kCMTimeIndefinite: CMTime;

declare var kCMTimeInvalid: CMTime;

declare var kCMTimeMappingInvalid: CMTimeMapping;

declare var kCMTimeMappingSourceKey: string;

declare var kCMTimeMappingTargetKey: string;

declare var kCMTimeNegativeInfinity: CMTime;

declare var kCMTimePositiveInfinity: CMTime;

declare var kCMTimeRangeDurationKey: string;

declare var kCMTimeRangeInvalid: CMTimeRange;

declare var kCMTimeRangeStartKey: string;

declare var kCMTimeRangeZero: CMTimeRange;

declare var kCMTimeScaleKey: string;

declare var kCMTimeValueKey: string;

declare var kCMTimeZero: CMTime;

declare const kCMTimebaseError_AllocationFailed: number;

declare const kCMTimebaseError_InvalidParameter: number;

declare const kCMTimebaseError_MissingRequiredParameter: number;

declare const kCMTimebaseError_ReadOnly: number;

declare const kCMTimebaseError_TimerIntervalTooShort: number;

declare var kCMTimebaseNotificationKey_EventTime: string;

declare var kCMTimebaseNotification_EffectiveRateChanged: string;

declare var kCMTimebaseNotification_TimeJumped: string;

declare var kCMTimingInfoInvalid: CMSampleTimingInfo;

declare const kCMVideoCodecType_422YpCbCr8: number;

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

declare const kCMVideoCodecType_H263: number;

declare const kCMVideoCodecType_H264: number;

declare const kCMVideoCodecType_HEVC: number;

declare const kCMVideoCodecType_HEVCWithAlpha: number;

declare const kCMVideoCodecType_JPEG: number;

declare const kCMVideoCodecType_JPEG_OpenDML: number;

declare const kCMVideoCodecType_MPEG1Video: number;

declare const kCMVideoCodecType_MPEG2Video: number;

declare const kCMVideoCodecType_MPEG4Video: number;

declare const kCMVideoCodecType_SorensonVideo: number;

declare const kCMVideoCodecType_SorensonVideo3: number;
