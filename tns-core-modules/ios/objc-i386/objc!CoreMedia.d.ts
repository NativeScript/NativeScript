
declare function CMAudioClockCreate(allocator: any, clockOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionCopyAsBigEndianSoundDescriptionBlockBuffer(allocator: any, audioFormatDescription: any, soundDescriptionFlavor: string, soundDescriptionBlockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionCreate(allocator: any, asbd: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, layoutSize: number, layout: interop.Pointer | interop.Reference<AudioChannelLayout>, magicCookieSize: number, magicCookie: interop.Pointer | interop.Reference<any>, extensions: NSDictionary<any, any>, outDesc: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionCreateFromBigEndianSoundDescriptionBlockBuffer(allocator: any, soundDescriptionBlockBuffer: any, soundDescriptionFlavor: string, audioFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionCreateFromBigEndianSoundDescriptionData(allocator: any, soundDescriptionData: string, soundDescriptionSize: number, soundDescriptionFlavor: string, audioFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionCreateSummary(allocator: any, formatDescriptionArray: NSArray<any>, flags: number, summaryFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioFormatDescriptionEqual(desc1: any, desc2: any, equalityMask: number, equalityMaskOut: interop.Pointer | interop.Reference<number>): boolean;

declare function CMAudioFormatDescriptionGetChannelLayout(desc: any, layoutSize: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<AudioChannelLayout>;

declare function CMAudioFormatDescriptionGetFormatList(desc: any, formatListSize: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<AudioFormatListItem>;

declare function CMAudioFormatDescriptionGetMagicCookie(desc: any, cookieSizeOut: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function CMAudioFormatDescriptionGetMostCompatibleFormat(desc: any): interop.Pointer | interop.Reference<AudioFormatListItem>;

declare function CMAudioFormatDescriptionGetRichestDecodableFormat(desc: any): interop.Pointer | interop.Reference<AudioFormatListItem>;

declare function CMAudioFormatDescriptionGetStreamBasicDescription(desc: any): interop.Pointer | interop.Reference<AudioStreamBasicDescription>;

declare function CMAudioSampleBufferCreateReadyWithPacketDescriptions(allocator: any, dataBuffer: any, formatDescription: any, numSamples: number, sbufPTS: CMTime, packetDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, sBufOut: interop.Pointer | interop.Reference<any>): number;

declare function CMAudioSampleBufferCreateWithPacketDescriptions(allocator: any, dataBuffer: any, dataReady: boolean, makeDataReadyCallback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, makeDataReadyRefcon: interop.Pointer | interop.Reference<any>, formatDescription: any, numSamples: number, sbufPTS: CMTime, packetDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, sBufOut: interop.Pointer | interop.Reference<any>): number;

declare function CMBlockBufferAccessDataBytes(theBuffer: any, offset: number, length: number, temporaryBlock: interop.Pointer | interop.Reference<any>, returnedPointer: interop.Pointer | interop.Reference<string>): number;

declare function CMBlockBufferAppendBufferReference(theBuffer: any, targetBBuf: any, offsetToData: number, dataLength: number, flags: number): number;

declare function CMBlockBufferAppendMemoryBlock(theBuffer: any, memoryBlock: interop.Pointer | interop.Reference<any>, blockLength: number, blockAllocator: any, customBlockSource: interop.Pointer | interop.Reference<CMBlockBufferCustomBlockSource>, offsetToData: number, dataLength: number, flags: number): number;

declare function CMBlockBufferAssureBlockMemory(theBuffer: any): number;

declare function CMBlockBufferCopyDataBytes(theSourceBuffer: any, offsetToData: number, dataLength: number, destination: interop.Pointer | interop.Reference<any>): number;

declare function CMBlockBufferCreateContiguous(structureAllocator: any, sourceBuffer: any, blockAllocator: any, customBlockSource: interop.Pointer | interop.Reference<CMBlockBufferCustomBlockSource>, offsetToData: number, dataLength: number, flags: number, newBBufOut: interop.Pointer | interop.Reference<any>): number;

declare function CMBlockBufferCreateEmpty(structureAllocator: any, subBlockCapacity: number, flags: number, newBBufOut: interop.Pointer | interop.Reference<any>): number;

declare function CMBlockBufferCreateWithBufferReference(structureAllocator: any, targetBuffer: any, offsetToData: number, dataLength: number, flags: number, newBBufOut: interop.Pointer | interop.Reference<any>): number;

declare function CMBlockBufferCreateWithMemoryBlock(structureAllocator: any, memoryBlock: interop.Pointer | interop.Reference<any>, blockLength: number, blockAllocator: any, customBlockSource: interop.Pointer | interop.Reference<CMBlockBufferCustomBlockSource>, offsetToData: number, dataLength: number, flags: number, newBBufOut: interop.Pointer | interop.Reference<any>): number;

interface CMBlockBufferCustomBlockSource {
	version: number;
	AllocateBlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>;
	FreeBlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>;
	refCon: interop.Pointer | interop.Reference<any>;
}
declare var CMBlockBufferCustomBlockSource: interop.StructType<CMBlockBufferCustomBlockSource>;

declare function CMBlockBufferFillDataBytes(fillByte: number, destinationBuffer: any, offsetIntoDestination: number, dataLength: number): number;

declare function CMBlockBufferGetDataLength(theBuffer: any): number;

declare function CMBlockBufferGetDataPointer(theBuffer: any, offset: number, lengthAtOffset: interop.Pointer | interop.Reference<number>, totalLength: interop.Pointer | interop.Reference<number>, dataPointer: interop.Pointer | interop.Reference<string>): number;

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

declare function CMBufferQueueCallForEachBuffer(queue: any, callback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, refcon: interop.Pointer | interop.Reference<any>): number;

declare function CMBufferQueueContainsEndOfData(queue: any): boolean;

declare function CMBufferQueueCreate(allocator: any, capacity: number, callbacks: interop.Pointer | interop.Reference<CMBufferCallbacks>, queueOut: interop.Pointer | interop.Reference<any>): number;

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

declare function CMBufferQueueInstallTrigger(queue: any, triggerCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, triggerRefcon: interop.Pointer | interop.Reference<any>, triggerCondition: number, triggerTime: CMTime, triggerTokenOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function CMBufferQueueInstallTriggerWithIntegerThreshold(queue: any, triggerCallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, triggerRefcon: interop.Pointer | interop.Reference<any>, triggerCondition: number, triggerThreshold: number, triggerTokenOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function CMBufferQueueIsAtEndOfData(queue: any): boolean;

declare function CMBufferQueueIsEmpty(queue: any): boolean;

declare function CMBufferQueueMarkEndOfData(queue: any): number;

declare function CMBufferQueueRemoveTrigger(queue: any, triggerToken: interop.Pointer | interop.Reference<any>): number;

declare function CMBufferQueueReset(queue: any): number;

declare function CMBufferQueueResetWithCallback(queue: any, callback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => void>, refcon: interop.Pointer | interop.Reference<any>): number;

declare function CMBufferQueueSetValidationCallback(queue: any, validationCallback: interop.FunctionReference<(p1: any, p2: any, p3: interop.Pointer | interop.Reference<any>) => number>, validationRefCon: interop.Pointer | interop.Reference<any>): number;

declare function CMBufferQueueTestTrigger(queue: any, triggerToken: interop.Pointer | interop.Reference<any>): boolean;

declare function CMClockConvertHostTimeToSystemUnits(hostTime: CMTime): number;

declare function CMClockGetAnchorTime(clock: any, outClockTime: interop.Pointer | interop.Reference<CMTime>, outReferenceClockTime: interop.Pointer | interop.Reference<CMTime>): number;

declare function CMClockGetHostTimeClock(): any;

declare function CMClockGetTime(clock: any): CMTime;

declare function CMClockGetTypeID(): number;

declare function CMClockInvalidate(clock: any): void;

declare function CMClockMakeHostTimeFromSystemUnits(hostTime: number): CMTime;

declare function CMClockMightDrift(clock: any, otherClock: any): boolean;

declare function CMClosedCaptionFormatDescriptionCopyAsBigEndianClosedCaptionDescriptionBlockBuffer(allocator: any, closedCaptionFormatDescription: any, closedCaptionDescriptionFlavor: string, closedCaptionDescriptionBlockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMClosedCaptionFormatDescriptionCreateFromBigEndianClosedCaptionDescriptionBlockBuffer(allocator: any, closedCaptionDescriptionBlockBuffer: any, closedCaptionDescriptionFlavor: string, closedCaptionFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMClosedCaptionFormatDescriptionCreateFromBigEndianClosedCaptionDescriptionData(allocator: any, closedCaptionDescriptionData: string, closedCaptionDescriptionSize: number, closedCaptionDescriptionFlavor: string, closedCaptionFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMCopyDictionaryOfAttachments(allocator: any, target: any, attachmentMode: number): NSDictionary<any, any>;

declare function CMDoesBigEndianSoundDescriptionRequireLegacyCBRSampleTableLayout(soundDescriptionBlockBuffer: any, soundDescriptionFlavor: string): boolean;

declare function CMFormatDescriptionCreate(allocator: any, mediaType: number, mediaSubtype: number, extensions: NSDictionary<any, any>, descOut: interop.Pointer | interop.Reference<any>): number;

declare function CMFormatDescriptionEqual(desc1: any, desc2: any): boolean;

declare function CMFormatDescriptionEqualIgnoringExtensionKeys(desc1: any, desc2: any, formatDescriptionExtensionKeysToIgnore: any, sampleDescriptionExtensionAtomKeysToIgnore: any): boolean;

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

declare function CMMetadataDataTypeRegistryRegisterDataType(dataType: string, description: string, conformingDataTypes: NSArray<any>): number;

declare function CMMetadataFormatDescriptionCopyAsBigEndianMetadataDescriptionBlockBuffer(allocator: any, metadataFormatDescription: any, metadataDescriptionFlavor: string, metadataDescriptionBlockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateByMergingMetadataFormatDescriptions(allocator: any, srcDesc1: any, srcDesc2: any, outDesc: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateFromBigEndianMetadataDescriptionBlockBuffer(allocator: any, metadataDescriptionBlockBuffer: any, metadataDescriptionFlavor: string, metadataFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateFromBigEndianMetadataDescriptionData(allocator: any, metadataDescriptionData: string, metadataDescriptionSize: number, metadataDescriptionFlavor: string, metadataFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateWithKeys(allocator: any, metadataType: number, keys: NSArray<any>, outDesc: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateWithMetadataFormatDescriptionAndMetadataSpecifications(allocator: any, srcDesc: any, metadataSpecifications: NSArray<any>, outDesc: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionCreateWithMetadataSpecifications(allocator: any, metadataType: number, metadataSpecifications: NSArray<any>, outDesc: interop.Pointer | interop.Reference<any>): number;

declare function CMMetadataFormatDescriptionGetIdentifiers(desc: any): NSArray<any>;

declare function CMMetadataFormatDescriptionGetKeyWithLocalID(desc: any, localKeyID: number): NSDictionary<any, any>;

declare function CMMuxedFormatDescriptionCreate(allocator: any, muxType: number, extensions: NSDictionary<any, any>, outDesc: interop.Pointer | interop.Reference<any>): number;

declare function CMPropagateAttachments(source: any, destination: any): void;

declare function CMRemoveAllAttachments(target: any): void;

declare function CMRemoveAttachment(target: any, key: string): void;

declare function CMSampleBufferCallBlockForEachSample(sbuf: any, handler: (p1: any, p2: number) => number): number;

declare function CMSampleBufferCallForEachSample(sbuf: any, callback: interop.FunctionReference<(p1: any, p2: number, p3: interop.Pointer | interop.Reference<any>) => number>, refcon: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCopyPCMDataIntoAudioBufferList(sbuf: any, frameOffset: number, numFrames: number, bufferList: interop.Pointer | interop.Reference<AudioBufferList>): number;

declare function CMSampleBufferCopySampleBufferForRange(allocator: any, sbuf: any, sampleRange: CFRange, sBufOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreate(allocator: any, dataBuffer: any, dataReady: boolean, makeDataReadyCallback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, makeDataReadyRefcon: interop.Pointer | interop.Reference<any>, formatDescription: any, numSamples: number, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, numSampleSizeEntries: number, sampleSizeArray: interop.Pointer | interop.Reference<number>, sBufOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateCopy(allocator: any, sbuf: any, sbufCopyOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateCopyWithNewTiming(allocator: any, originalSBuf: any, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sBufCopyOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateForImageBuffer(allocator: any, imageBuffer: any, dataReady: boolean, makeDataReadyCallback: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => number>, makeDataReadyRefcon: interop.Pointer | interop.Reference<any>, formatDescription: any, sampleTiming: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sBufOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateReady(allocator: any, dataBuffer: any, formatDescription: any, numSamples: number, numSampleTimingEntries: number, sampleTimingArray: interop.Pointer | interop.Reference<CMSampleTimingInfo>, numSampleSizeEntries: number, sampleSizeArray: interop.Pointer | interop.Reference<number>, sBufOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferCreateReadyWithImageBuffer(allocator: any, imageBuffer: any, formatDescription: any, sampleTiming: interop.Pointer | interop.Reference<CMSampleTimingInfo>, sBufOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferDataIsReady(sbuf: any): boolean;

declare function CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(sbuf: any, bufferListSizeNeededOut: interop.Pointer | interop.Reference<number>, bufferListOut: interop.Pointer | interop.Reference<AudioBufferList>, bufferListSize: number, bbufStructAllocator: any, bbufMemoryAllocator: any, flags: number, blockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMSampleBufferGetAudioStreamPacketDescriptions(sbuf: any, packetDescriptionsSize: number, packetDescriptionsOut: interop.Pointer | interop.Reference<AudioStreamPacketDescription>, packetDescriptionsSizeNeededOut: interop.Pointer | interop.Reference<number>): number;

declare function CMSampleBufferGetAudioStreamPacketDescriptionsPtr(sbuf: any, packetDescriptionsPtrOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<AudioStreamPacketDescription>>, packetDescriptionsSizeOut: interop.Pointer | interop.Reference<number>): number;

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

declare function CMSampleBufferGetSampleTimingInfoArray(sbuf: any, timingArrayEntries: number, timingArrayOut: interop.Pointer | interop.Reference<CMSampleTimingInfo>, timingArrayEntriesNeededOut: interop.Pointer | interop.Reference<number>): number;

declare function CMSampleBufferGetTotalSampleSize(sbuf: any): number;

declare function CMSampleBufferGetTypeID(): number;

declare function CMSampleBufferHasDataFailed(sbuf: any, statusOut: interop.Pointer | interop.Reference<number>): boolean;

declare function CMSampleBufferInvalidate(sbuf: any): number;

declare function CMSampleBufferIsValid(sbuf: any): boolean;

declare function CMSampleBufferMakeDataReady(sbuf: any): number;

declare function CMSampleBufferSetDataBuffer(sbuf: any, dataBuffer: any): number;

declare function CMSampleBufferSetDataBufferFromAudioBufferList(sbuf: any, bbufStructAllocator: any, bbufMemoryAllocator: any, flags: number, bufferList: interop.Pointer | interop.Reference<AudioBufferList>): number;

declare function CMSampleBufferSetDataFailed(sbuf: any, status: number): number;

declare function CMSampleBufferSetDataReady(sbuf: any): number;

declare function CMSampleBufferSetInvalidateCallback(sbuf: any, invalidateCallback: interop.FunctionReference<(p1: any, p2: number) => void>, invalidateRefCon: number): number;

declare function CMSampleBufferSetInvalidateHandler(sbuf: any, invalidateHandler: (p1: any) => void): number;

declare function CMSampleBufferSetOutputPresentationTimeStamp(sbuf: any, outputPresentationTimeStamp: CMTime): number;

declare function CMSampleBufferTrackDataReadiness(sbuf: any, sbufToTrack: any): number;

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

declare function CMSwapBigEndianClosedCaptionDescriptionToHost(closedCaptionDescriptionData: string, closedCaptionDescriptionSize: number): number;

declare function CMSwapBigEndianImageDescriptionToHost(imageDescriptionData: string, imageDescriptionSize: number): number;

declare function CMSwapBigEndianMetadataDescriptionToHost(metadataDescriptionData: string, metadataDescriptionSize: number): number;

declare function CMSwapBigEndianSoundDescriptionToHost(soundDescriptionData: string, soundDescriptionSize: number): number;

declare function CMSwapBigEndianTextDescriptionToHost(textDescriptionData: string, textDescriptionSize: number): number;

declare function CMSwapBigEndianTimeCodeDescriptionToHost(timeCodeDescriptionData: string, timeCodeDescriptionSize: number): number;

declare function CMSwapHostEndianClosedCaptionDescriptionToBig(closedCaptionDescriptionData: string, closedCaptionDescriptionSize: number): number;

declare function CMSwapHostEndianImageDescriptionToBig(imageDescriptionData: string, imageDescriptionSize: number): number;

declare function CMSwapHostEndianMetadataDescriptionToBig(metadataDescriptionData: string, metadataDescriptionSize: number): number;

declare function CMSwapHostEndianSoundDescriptionToBig(soundDescriptionData: string, soundDescriptionSize: number): number;

declare function CMSwapHostEndianTextDescriptionToBig(textDescriptionData: string, textDescriptionSize: number): number;

declare function CMSwapHostEndianTimeCodeDescriptionToBig(timeCodeDescriptionData: string, timeCodeDescriptionSize: number): number;

declare function CMSyncConvertTime(time: CMTime, fromClockOrTimebase: any, toClockOrTimebase: any): CMTime;

declare function CMSyncGetRelativeRate(ofClockOrTimebase: any, relativeToClockOrTimebase: any): number;

declare function CMSyncGetRelativeRateAndAnchorTime(ofClockOrTimebase: any, relativeToClockOrTimebase: any, outRelativeRate: interop.Pointer | interop.Reference<number>, outOfClockOrTimebaseAnchorTime: interop.Pointer | interop.Reference<CMTime>, outRelativeToClockOrTimebaseAnchorTime: interop.Pointer | interop.Reference<CMTime>): number;

declare function CMSyncGetTime(clockOrTimebase: any): CMTime;

declare function CMSyncMightDrift(clockOrTimebase1: any, clockOrTimebase2: any): boolean;

declare function CMTextFormatDescriptionCopyAsBigEndianTextDescriptionBlockBuffer(allocator: any, textFormatDescription: any, textDescriptionFlavor: string, textDescriptionBlockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTextFormatDescriptionCreateFromBigEndianTextDescriptionBlockBuffer(allocator: any, textDescriptionBlockBuffer: any, textDescriptionFlavor: string, mediaType: number, textFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTextFormatDescriptionCreateFromBigEndianTextDescriptionData(allocator: any, textDescriptionData: string, textDescriptionSize: number, textDescriptionFlavor: string, mediaType: number, textFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTextFormatDescriptionGetDefaultStyle(desc: any, outLocalFontID: interop.Pointer | interop.Reference<number>, outBold: string, outItalic: string, outUnderline: string, outFontSize: interop.Pointer | interop.Reference<number>, outColorComponents: interop.Reference<number>): number;

declare function CMTextFormatDescriptionGetDefaultTextBox(desc: any, originIsAtTopLeft: boolean, heightOfTextTrack: number, outDefaultTextBox: interop.Pointer | interop.Reference<CGRect>): number;

declare function CMTextFormatDescriptionGetDisplayFlags(desc: any, outDisplayFlags: interop.Pointer | interop.Reference<number>): number;

declare function CMTextFormatDescriptionGetFontName(desc: any, localFontID: number, outFontName: interop.Pointer | interop.Reference<string>): number;

declare function CMTextFormatDescriptionGetJustification(desc: any, outHorizontalJust: interop.Pointer | interop.Reference<number>, outVerticalJust: interop.Pointer | interop.Reference<number>): number;

interface CMTime {
	value: number;
	timescale: number;
	flags: CMTimeFlags;
	epoch: number;
}
declare var CMTime: interop.StructType<CMTime>;

declare function CMTimeAbsoluteValue(time: CMTime): CMTime;

declare function CMTimeAdd(addend1: CMTime, addend2: CMTime): CMTime;

declare function CMTimeClampToRange(time: CMTime, range: CMTimeRange): CMTime;

declare function CMTimeCodeFormatDescriptionCopyAsBigEndianTimeCodeDescriptionBlockBuffer(allocator: any, timeCodeFormatDescription: any, timeCodeDescriptionFlavor: string, timeCodeDescriptionBlockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTimeCodeFormatDescriptionCreate(allocator: any, timeCodeFormatType: number, frameDuration: CMTime, frameQuanta: number, tcFlags: number, extensions: NSDictionary<any, any>, descOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTimeCodeFormatDescriptionCreateFromBigEndianTimeCodeDescriptionBlockBuffer(allocator: any, timeCodeDescriptionBlockBuffer: any, timeCodeDescriptionFlavor: string, timeCodeFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMTimeCodeFormatDescriptionCreateFromBigEndianTimeCodeDescriptionData(allocator: any, timeCodeDescriptionData: string, timeCodeDescriptionSize: number, timeCodeDescriptionFlavor: string, timeCodeFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

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

declare function CMTimeGetSeconds(time: CMTime): number;

declare function CMTimeMake(value: number, timescale: number): CMTime;

declare function CMTimeMakeFromDictionary(dict: NSDictionary<any, any>): CMTime;

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

declare function CMTimeMappingMakeFromDictionary(dict: NSDictionary<any, any>): CMTimeMapping;

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

declare function CMTimeRangeContainsTimeRange(range1: CMTimeRange, range2: CMTimeRange): boolean;

declare function CMTimeRangeCopyAsDictionary(range: CMTimeRange, allocator: any): NSDictionary<any, any>;

declare function CMTimeRangeCopyDescription(allocator: any, range: CMTimeRange): string;

declare function CMTimeRangeEqual(range1: CMTimeRange, range2: CMTimeRange): boolean;

declare function CMTimeRangeFromTimeToTime(start: CMTime, end: CMTime): CMTimeRange;

declare function CMTimeRangeGetEnd(range: CMTimeRange): CMTime;

declare function CMTimeRangeGetIntersection(range1: CMTimeRange, range2: CMTimeRange): CMTimeRange;

declare function CMTimeRangeGetUnion(range1: CMTimeRange, range2: CMTimeRange): CMTimeRange;

declare function CMTimeRangeMake(start: CMTime, duration: CMTime): CMTimeRange;

declare function CMTimeRangeMakeFromDictionary(dict: NSDictionary<any, any>): CMTimeRange;

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

declare function CMTimeSubtract(minuend: CMTime, subtrahend: CMTime): CMTime;

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

declare function CMTimebaseGetTimeAndRate(timebase: any, outTime: interop.Pointer | interop.Reference<CMTime>, outRate: interop.Pointer | interop.Reference<number>): number;

declare function CMTimebaseGetTimeWithTimeScale(timebase: any, timescale: number, method: CMTimeRoundingMethod): CMTime;

declare function CMTimebaseGetTypeID(): number;

declare function CMTimebaseGetUltimateMasterClock(timebase: any): any;

declare function CMTimebaseNotificationBarrier(timebase: any): number;

declare function CMTimebaseRemoveTimer(timebase: any, timer: NSTimer): number;

declare function CMTimebaseRemoveTimerDispatchSource(timebase: any, timerSource: NSObject): number;

declare function CMTimebaseSetAnchorTime(timebase: any, timebaseTime: CMTime, immediateMasterTime: CMTime): number;

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

declare function CMVideoFormatDescriptionCopyAsBigEndianImageDescriptionBlockBuffer(allocator: any, videoFormatDescription: any, imageDescriptionStringEncoding: number, imageDescriptionFlavor: string, imageDescriptionBlockBufferOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreate(allocator: any, codecType: number, width: number, height: number, extensions: NSDictionary<any, any>, outDesc: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreateForImageBuffer(allocator: any, imageBuffer: any, outDesc: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreateFromBigEndianImageDescriptionBlockBuffer(allocator: any, imageDescriptionBlockBuffer: any, imageDescriptionStringEncoding: number, imageDescriptionFlavor: string, videoFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreateFromBigEndianImageDescriptionData(allocator: any, imageDescriptionData: string, imageDescriptionSize: number, imageDescriptionStringEncoding: number, imageDescriptionFlavor: string, videoFormatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionCreateFromH264ParameterSets(allocator: any, parameterSetCount: number, parameterSetPointers: interop.Pointer | interop.Reference<string>, parameterSetSizes: interop.Pointer | interop.Reference<number>, NALUnitHeaderLength: number, formatDescriptionOut: interop.Pointer | interop.Reference<any>): number;

declare function CMVideoFormatDescriptionGetCleanAperture(videoDesc: any, originIsAtTopLeft: boolean): CGRect;

declare function CMVideoFormatDescriptionGetDimensions(videoDesc: any): CMVideoDimensions;

declare function CMVideoFormatDescriptionGetExtensionKeysCommonWithImageBuffers(): NSArray<any>;

declare function CMVideoFormatDescriptionGetH264ParameterSetAtIndex(videoDesc: any, parameterSetIndex: number, parameterSetPointerOut: interop.Pointer | interop.Reference<string>, parameterSetSizeOut: interop.Pointer | interop.Reference<number>, parameterSetCountOut: interop.Pointer | interop.Reference<number>, NALUnitHeaderLengthOut: interop.Pointer | interop.Reference<number>): number;

declare function CMVideoFormatDescriptionGetPresentationDimensions(videoDesc: any, usePixelAspectRatio: boolean, useCleanAperture: boolean): CGSize;

declare function CMVideoFormatDescriptionMatchesImageBuffer(desc: any, imageBuffer: any): boolean;

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

declare var kCMFormatDescriptionExtensionKey_MetadataKeyTable: string;

declare var kCMFormatDescriptionExtension_BytesPerRow: string;

declare var kCMFormatDescriptionExtension_ChromaLocationBottomField: string;

declare var kCMFormatDescriptionExtension_ChromaLocationTopField: string;

declare var kCMFormatDescriptionExtension_CleanAperture: string;

declare var kCMFormatDescriptionExtension_ColorPrimaries: string;

declare var kCMFormatDescriptionExtension_Depth: string;

declare var kCMFormatDescriptionExtension_FieldCount: string;

declare var kCMFormatDescriptionExtension_FieldDetail: string;

declare var kCMFormatDescriptionExtension_FormatName: string;

declare var kCMFormatDescriptionExtension_FullRangeVideo: string;

declare var kCMFormatDescriptionExtension_GammaLevel: string;

declare var kCMFormatDescriptionExtension_ICCProfile: string;

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

declare var kCMFormatDescriptionTransferFunction_ITU_R_709_2: string;

declare var kCMFormatDescriptionTransferFunction_SMPTE_240M_1995: string;

declare var kCMFormatDescriptionTransferFunction_SMPTE_ST_428_1: string;

declare var kCMFormatDescriptionTransferFunction_UseGamma: string;

declare var kCMFormatDescriptionVendor_Apple: string;

declare var kCMFormatDescriptionYCbCrMatrix_ITU_R_2020: string;

declare var kCMFormatDescriptionYCbCrMatrix_ITU_R_601_4: string;

declare var kCMFormatDescriptionYCbCrMatrix_ITU_R_709_2: string;

declare var kCMFormatDescriptionYCbCrMatrix_SMPTE_240M_1995: string;

declare var kCMImageDescriptionFlavor_3GPFamily: string;

declare var kCMImageDescriptionFlavor_ISOFamily: string;

declare var kCMImageDescriptionFlavor_QuickTimeMovie: string;

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

declare var kCMMetadataIdentifier_QuickTimeMetadataDirection_Facing: string;

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

declare var kCMSampleAttachmentKey_DependsOnOthers: string;

declare var kCMSampleAttachmentKey_DisplayImmediately: string;

declare var kCMSampleAttachmentKey_DoNotDisplay: string;

declare var kCMSampleAttachmentKey_EarlierDisplayTimesAllowed: string;

declare var kCMSampleAttachmentKey_HasRedundantCoding: string;

declare var kCMSampleAttachmentKey_IsDependedOnByOthers: string;

declare var kCMSampleAttachmentKey_NotSync: string;

declare var kCMSampleAttachmentKey_PartialSync: string;

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

declare var kCMSampleBufferLensStabilizationInfo_Active: string;

declare var kCMSampleBufferLensStabilizationInfo_Off: string;

declare var kCMSampleBufferLensStabilizationInfo_OutOfRange: string;

declare var kCMSampleBufferLensStabilizationInfo_Unavailable: string;

declare var kCMSampleBufferNotificationParameter_OSStatus: string;

declare var kCMSampleBufferNotification_DataBecameReady: string;

declare var kCMSampleBufferNotification_DataFailed: string;

declare var kCMSoundDescriptionFlavor_3GPFamily: string;

declare var kCMSoundDescriptionFlavor_ISOFamily: string;

declare var kCMSoundDescriptionFlavor_QuickTimeMovie: string;

declare var kCMSoundDescriptionFlavor_QuickTimeMovieV2: string;

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

declare var kCMTimeCodeFormatDescriptionExtension_SourceReferenceName: string;

declare var kCMTimeCodeFormatDescriptionKey_LangCode: string;

declare var kCMTimeCodeFormatDescriptionKey_Value: string;

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

declare var kCMTimebaseNotificationKey_EventTime: string;

declare var kCMTimebaseNotification_EffectiveRateChanged: string;

declare var kCMTimebaseNotification_TimeJumped: string;

declare var kCMTimingInfoInvalid: CMSampleTimingInfo;
