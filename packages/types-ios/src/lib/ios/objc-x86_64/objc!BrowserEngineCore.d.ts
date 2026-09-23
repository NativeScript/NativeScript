
/**
 * @since 26.0
 */
declare class BEAudioSession extends NSObject {

	static alloc(): BEAudioSession; // inherited from NSObject

	static new(): BEAudioSession; // inherited from NSObject

	readonly availableOutputs: NSArray<AVAudioSessionPortDescription> | null;

	readonly preferredOutput: AVAudioSessionPortDescription | null;

	constructor(o: { audioSession: AVAudioSession; });

	initWithAudioSession(audioSession: AVAudioSession): this;

	setPreferredOutputError(outPort: AVAudioSessionPortDescription | null, error?: interop.Reference<NSError>): boolean;
}

/**
 * @since 18.4
 */
declare function be_kevent(kq: number, changelist: interop.Pointer | interop.Reference<keventStruct> | ArrayBufferLike | ArrayBufferView | null, nchanges: number, eventlist: interop.Pointer | interop.Reference<keventStruct> | ArrayBufferLike | ArrayBufferView | null, nevents: number, be_flags: number): number;

/**
 * @since 18.4
 */
declare function be_kevent64(kq: number, changelist: interop.Pointer | interop.Reference<kevent64_s> | ArrayBufferLike | ArrayBufferView | null, nchanges: number, eventlist: interop.Pointer | interop.Reference<kevent64_s> | ArrayBufferLike | ArrayBufferView | null, nevents: number, flags: number): number;
