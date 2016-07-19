
interface MTAudioProcessingTapCallbacks {
	version: number;
	clientInfo: interop.Pointer;
	init: interop.FunctionReference<(p1: any, p2: interop.Pointer, p3: interop.Reference<interop.Pointer>) => void>;
	finalize: interop.FunctionReference<(p1: any) => void>;
	prepare: interop.FunctionReference<(p1: any, p2: number, p3: interop.Reference<AudioStreamBasicDescription>) => void>;
	unprepare: interop.FunctionReference<(p1: any) => void>;
	process: interop.FunctionReference<(p1: any, p2: number, p3: number, p4: interop.Reference<AudioBufferList>, p5: interop.Reference<number>, p6: interop.Reference<number>) => void>;
}
declare var MTAudioProcessingTapCallbacks: interop.StructType<MTAudioProcessingTapCallbacks>;

declare function MTAudioProcessingTapCreate(allocator: any, callbacks: interop.Reference<MTAudioProcessingTapCallbacks>, flags: number, tapOut: interop.Reference<any>): number;

declare function MTAudioProcessingTapGetSourceAudio(tap: any, numberFrames: number, bufferListInOut: interop.Reference<AudioBufferList>, flagsOut: interop.Reference<number>, timeRangeOut: interop.Reference<CMTimeRange>, numberFramesOut: interop.Reference<number>): number;

declare function MTAudioProcessingTapGetStorage(tap: any): interop.Pointer;

declare function MTAudioProcessingTapGetTypeID(): number;

declare function MTCopyLocalizedNameForMediaSubType(mediaType: number, mediaSubType: number): interop.Unmanaged<string>;

declare function MTCopyLocalizedNameForMediaType(mediaType: number): interop.Unmanaged<string>;
