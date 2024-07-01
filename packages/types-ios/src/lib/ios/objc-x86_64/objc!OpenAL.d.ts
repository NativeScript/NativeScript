
/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alBuffer3f(bid: number, param: number, value1: number, value2: number, value3: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alBuffer3i(bid: number, param: number, value1: number, value2: number, value3: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alBufferData(bid: number, format: number, data: interop.Pointer | interop.Reference<any>, size: number, freq: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alBufferf(bid: number, param: number, value: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alBufferfv(bid: number, param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alBufferi(bid: number, param: number, value: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alBufferiv(bid: number, param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alDeleteBuffers(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alDeleteSources(n: number, sources: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alDisable(capability: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alDistanceModel(distanceModel: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alDopplerFactor(value: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alDopplerVelocity(value: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alEnable(capability: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGenBuffers(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGenSources(n: number, sources: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetBoolean(param: number): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetBooleanv(param: number, data: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetBuffer3f(bid: number, param: number, value1: interop.Pointer | interop.Reference<number>, value2: interop.Pointer | interop.Reference<number>, value3: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetBuffer3i(bid: number, param: number, value1: interop.Pointer | interop.Reference<number>, value2: interop.Pointer | interop.Reference<number>, value3: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetBufferf(bid: number, param: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetBufferfv(bid: number, param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetBufferi(bid: number, param: number, value: interop.Pointer | interop.Reference<number>): void;

declare function alGetBufferiv(bid: number, param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetDouble(param: number): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetDoublev(param: number, data: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetEnumValue(ename: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetError(): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetFloat(param: number): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetFloatv(param: number, data: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetInteger(param: number): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetIntegerv(param: number, data: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetListener3f(param: number, value1: interop.Pointer | interop.Reference<number>, value2: interop.Pointer | interop.Reference<number>, value3: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetListener3i(param: number, value1: interop.Pointer | interop.Reference<number>, value2: interop.Pointer | interop.Reference<number>, value3: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetListenerf(param: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetListenerfv(param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetListeneri(param: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetListeneriv(param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetProcAddress(fname: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetSource3f(sid: number, param: number, value1: interop.Pointer | interop.Reference<number>, value2: interop.Pointer | interop.Reference<number>, value3: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetSource3i(sid: number, param: number, value1: interop.Pointer | interop.Reference<number>, value2: interop.Pointer | interop.Reference<number>, value3: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetSourcef(sid: number, param: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetSourcefv(sid: number, param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetSourcei(sid: number, param: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetSourceiv(sid: number, param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alGetString(param: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alIsBuffer(bid: number): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alIsEnabled(capability: number): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alIsExtensionPresent(extname: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alIsSource(sid: number): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alListener3f(param: number, value1: number, value2: number, value3: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alListener3i(param: number, value1: number, value2: number, value3: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alListenerf(param: number, value: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alListenerfv(param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alListeneri(param: number, value: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alListeneriv(param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSource3f(sid: number, param: number, value1: number, value2: number, value3: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSource3i(sid: number, param: number, value1: number, value2: number, value3: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourcePause(sid: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourcePausev(ns: number, sids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourcePlay(sid: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourcePlayv(ns: number, sids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourceQueueBuffers(sid: number, numEntries: number, bids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourceRewind(sid: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourceRewindv(ns: number, sids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourceStop(sid: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourceStopv(ns: number, sids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourceUnqueueBuffers(sid: number, numEntries: number, bids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourcef(sid: number, param: number, value: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourcefv(sid: number, param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourcei(sid: number, param: number, value: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSourceiv(sid: number, param: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alSpeedOfSound(value: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcCaptureCloseDevice(device: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcCaptureOpenDevice(devicename: string | interop.Pointer | interop.Reference<any>, frequency: number, format: number, buffersize: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcCaptureSamples(device: interop.Pointer | interop.Reference<any>, buffer: interop.Pointer | interop.Reference<any>, samples: number): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcCaptureStart(device: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcCaptureStop(device: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcCloseDevice(device: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcCreateContext(device: interop.Pointer | interop.Reference<any>, attrlist: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcDestroyContext(context: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcGetContextsDevice(context: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcGetCurrentContext(): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcGetEnumValue(device: interop.Pointer | interop.Reference<any>, enumname: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcGetError(device: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcGetIntegerv(device: interop.Pointer | interop.Reference<any>, param: number, size: number, data: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcGetProcAddress(device: interop.Pointer | interop.Reference<any>, funcname: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcGetString(device: interop.Pointer | interop.Reference<any>, param: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcIsExtensionPresent(device: interop.Pointer | interop.Reference<any>, extname: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcMakeContextCurrent(context: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcOpenDevice(devicename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcProcessContext(context: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function alcSuspendContext(context: interop.Pointer | interop.Reference<any>): void;
