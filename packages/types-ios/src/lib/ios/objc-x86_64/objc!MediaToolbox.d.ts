
interface MTAudioProcessingTapCallbacks {
	version: number;
	clientInfo: interop.Pointer | interop.Reference<any> | null;
	init: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void> | null;
	finalize: interop.FunctionReference<(p1: any) => void> | null;
	prepare: interop.FunctionReference<(p1: any, p2: number, p3: interop.Pointer | interop.Reference<AudioStreamBasicDescription> | null) => void> | null;
	unprepare: interop.FunctionReference<(p1: any) => void> | null;
	process: interop.FunctionReference<(p1: any, p2: number, p3: number, p4: interop.Pointer | interop.Reference<AudioBufferList> | null, p5: interop.Pointer | interop.Reference<number> | null, p6: interop.Pointer | interop.Reference<number> | null) => void>;
}
declare var MTAudioProcessingTapCallbacks: interop.StructType<MTAudioProcessingTapCallbacks>;

/**
 * @since 6.0
 */
declare function MTAudioProcessingTapCreate(allocator: any | null, callbacks: interop.Pointer | interop.Reference<MTAudioProcessingTapCallbacks> | ArrayBufferLike | ArrayBufferView, flags: number, tapOut: interop.Pointer | interop.Reference<any | null> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 6.0
 */
declare function MTAudioProcessingTapGetSourceAudio(tap: any, numberFrames: number, bufferListInOut: interop.Pointer | interop.Reference<AudioBufferList> | ArrayBufferLike | ArrayBufferView, flagsOut: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, timeRangeOut: interop.Pointer | interop.Reference<CMTimeRange> | ArrayBufferLike | ArrayBufferView | null, numberFramesOut: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 6.0
 */
declare function MTAudioProcessingTapGetStorage(tap: any): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 6.0
 */
declare function MTAudioProcessingTapGetTypeID(): number;

/**
 * @since 6.0
 */
declare function MTCopyLocalizedNameForMediaSubType(mediaType: number, mediaSubType: number): string | null;

/**
 * @since 6.0
 */
declare function MTCopyLocalizedNameForMediaType(mediaType: number): string | null;

declare const kMTAudioProcessingTapCallbacksVersion_0: number;

declare const kMTAudioProcessingTapCreationFlag_PostEffects: number;

declare const kMTAudioProcessingTapCreationFlag_PreEffects: number;

declare const kMTAudioProcessingTapFlag_EndOfStream: number;

declare const kMTAudioProcessingTapFlag_StartOfStream: number;
