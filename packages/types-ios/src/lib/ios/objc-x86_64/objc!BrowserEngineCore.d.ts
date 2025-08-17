
/**
 * @since 26.0
 */
declare class BEAudioSession extends NSObject {

	static alloc(): BEAudioSession; // inherited from NSObject

	static new(): BEAudioSession; // inherited from NSObject

	readonly availableOutputs: NSArray<AVAudioSessionPortDescription>;

	readonly preferredOutput: AVAudioSessionPortDescription;

	constructor(o: { audioSession: AVAudioSession; });

	initWithAudioSession(audioSession: AVAudioSession): this;

	setPreferredOutputError(outPort: AVAudioSessionPortDescription): boolean;
}

/**
 * @since 18.4
 */
declare function be_kevent(kq: number, changelist: interop.Pointer | interop.Reference<keventStruct>, nchanges: number, eventlist: interop.Pointer | interop.Reference<keventStruct>, nevents: number, be_flags: number): number;

/**
 * @since 18.4
 */
declare function be_kevent64(kq: number, changelist: interop.Pointer | interop.Reference<kevent64_s>, nchanges: number, eventlist: interop.Pointer | interop.Reference<kevent64_s>, nevents: number, flags: number): number;
