
interface MTAudioProcessingTapCallbacks {
	version: number;
	clientInfo: interop.Pointer | interop.Reference<any>;
	init: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>;
	finalize: interop.FunctionReference<(p1: any) => void>;
	prepare: interop.FunctionReference<(p1: any, p2: number, p3: interop.Pointer | interop.Reference<AudioStreamBasicDescription>) => void>;
	unprepare: interop.FunctionReference<(p1: any) => void>;
	process: interop.FunctionReference<(p1: any, p2: number, p3: number, p4: interop.Pointer | interop.Reference<AudioBufferList>, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<number>) => void>;
}
declare var MTAudioProcessingTapCallbacks: interop.StructType<MTAudioProcessingTapCallbacks>;

declare function MTAudioProcessingTapCreate(allocator: any, callbacks: interop.Pointer | interop.Reference<MTAudioProcessingTapCallbacks>, flags: number, tapOut: interop.Pointer | interop.Reference<any>): number;

declare function MTAudioProcessingTapGetSourceAudio(tap: any, numberFrames: number, bufferListInOut: interop.Pointer | interop.Reference<AudioBufferList>, flagsOut: interop.Pointer | interop.Reference<number>, timeRangeOut: interop.Pointer | interop.Reference<CMTimeRange>, numberFramesOut: interop.Pointer | interop.Reference<number>): number;

declare function MTAudioProcessingTapGetStorage(tap: any): interop.Pointer | interop.Reference<any>;

declare function MTAudioProcessingTapGetTypeID(): number;

declare function MTCopyLocalizedNameForMediaSubType(mediaType: number, mediaSubType: number): string;

declare function MTCopyLocalizedNameForMediaType(mediaType: number): string;

declare const kMTAudioProcessingTapCallbacksVersion_0: number;

declare const kMTAudioProcessingTapCreationFlag_PostEffects: number;

declare const kMTAudioProcessingTapCreationFlag_PreEffects: number;

declare const kMTAudioProcessingTapFlag_EndOfStream: number;

declare const kMTAudioProcessingTapFlag_StartOfStream: number;
