
declare function alBuffer3f(bid: number, param: number, value1: number, value2: number, value3: number): void;

declare function alBuffer3i(bid: number, param: number, value1: number, value2: number, value3: number): void;

declare function alBufferData(bid: number, format: number, data: interop.Pointer, size: number, freq: number): void;

declare function alBufferf(bid: number, param: number, value: number): void;

declare function alBufferfv(bid: number, param: number, values: interop.Reference<number>): void;

declare function alBufferi(bid: number, param: number, value: number): void;

declare function alBufferiv(bid: number, param: number, values: interop.Reference<number>): void;

declare function alDeleteBuffers(n: number, buffers: interop.Reference<number>): void;

declare function alDeleteSources(n: number, sources: interop.Reference<number>): void;

declare function alDisable(capability: number): void;

declare function alDistanceModel(distanceModel: number): void;

declare function alDopplerFactor(value: number): void;

declare function alDopplerVelocity(value: number): void;

declare function alEnable(capability: number): void;

declare function alGenBuffers(n: number, buffers: interop.Reference<number>): void;

declare function alGenSources(n: number, sources: interop.Reference<number>): void;

declare function alGetBoolean(param: number): number;

declare function alGetBooleanv(param: number, data: string): void;

declare function alGetBuffer3f(bid: number, param: number, value1: interop.Reference<number>, value2: interop.Reference<number>, value3: interop.Reference<number>): void;

declare function alGetBuffer3i(bid: number, param: number, value1: interop.Reference<number>, value2: interop.Reference<number>, value3: interop.Reference<number>): void;

declare function alGetBufferf(bid: number, param: number, value: interop.Reference<number>): void;

declare function alGetBufferfv(bid: number, param: number, values: interop.Reference<number>): void;

declare function alGetBufferi(bid: number, param: number, value: interop.Reference<number>): void;

declare function alGetBufferiv(bid: number, param: number, values: interop.Reference<number>): void;

declare function alGetDouble(param: number): number;

declare function alGetDoublev(param: number, data: interop.Reference<number>): void;

declare function alGetEnumValue(ename: string): number;

declare function alGetError(): number;

declare function alGetFloat(param: number): number;

declare function alGetFloatv(param: number, data: interop.Reference<number>): void;

declare function alGetInteger(param: number): number;

declare function alGetIntegerv(param: number, data: interop.Reference<number>): void;

declare function alGetListener3f(param: number, value1: interop.Reference<number>, value2: interop.Reference<number>, value3: interop.Reference<number>): void;

declare function alGetListener3i(param: number, value1: interop.Reference<number>, value2: interop.Reference<number>, value3: interop.Reference<number>): void;

declare function alGetListenerf(param: number, value: interop.Reference<number>): void;

declare function alGetListenerfv(param: number, values: interop.Reference<number>): void;

declare function alGetListeneri(param: number, value: interop.Reference<number>): void;

declare function alGetListeneriv(param: number, values: interop.Reference<number>): void;

declare function alGetProcAddress(fname: string): interop.Pointer;

declare function alGetSource3f(sid: number, param: number, value1: interop.Reference<number>, value2: interop.Reference<number>, value3: interop.Reference<number>): void;

declare function alGetSource3i(sid: number, param: number, value1: interop.Reference<number>, value2: interop.Reference<number>, value3: interop.Reference<number>): void;

declare function alGetSourcef(sid: number, param: number, value: interop.Reference<number>): void;

declare function alGetSourcefv(sid: number, param: number, values: interop.Reference<number>): void;

declare function alGetSourcei(sid: number, param: number, value: interop.Reference<number>): void;

declare function alGetSourceiv(sid: number, param: number, values: interop.Reference<number>): void;

declare function alGetString(param: number): string;

declare function alIsBuffer(bid: number): number;

declare function alIsEnabled(capability: number): number;

declare function alIsExtensionPresent(extname: string): number;

declare function alIsSource(sid: number): number;

declare function alListener3f(param: number, value1: number, value2: number, value3: number): void;

declare function alListener3i(param: number, value1: number, value2: number, value3: number): void;

declare function alListenerf(param: number, value: number): void;

declare function alListenerfv(param: number, values: interop.Reference<number>): void;

declare function alListeneri(param: number, value: number): void;

declare function alListeneriv(param: number, values: interop.Reference<number>): void;

declare function alSource3f(sid: number, param: number, value1: number, value2: number, value3: number): void;

declare function alSource3i(sid: number, param: number, value1: number, value2: number, value3: number): void;

declare function alSourcePause(sid: number): void;

declare function alSourcePausev(ns: number, sids: interop.Reference<number>): void;

declare function alSourcePlay(sid: number): void;

declare function alSourcePlayv(ns: number, sids: interop.Reference<number>): void;

declare function alSourceQueueBuffers(sid: number, numEntries: number, bids: interop.Reference<number>): void;

declare function alSourceRewind(sid: number): void;

declare function alSourceRewindv(ns: number, sids: interop.Reference<number>): void;

declare function alSourceStop(sid: number): void;

declare function alSourceStopv(ns: number, sids: interop.Reference<number>): void;

declare function alSourceUnqueueBuffers(sid: number, numEntries: number, bids: interop.Reference<number>): void;

declare function alSourcef(sid: number, param: number, value: number): void;

declare function alSourcefv(sid: number, param: number, values: interop.Reference<number>): void;

declare function alSourcei(sid: number, param: number, value: number): void;

declare function alSourceiv(sid: number, param: number, values: interop.Reference<number>): void;

declare function alSpeedOfSound(value: number): void;

declare function alcCaptureCloseDevice(device: interop.Pointer): number;

declare function alcCaptureOpenDevice(devicename: string, frequency: number, format: number, buffersize: number): interop.Pointer;

declare function alcCaptureSamples(device: interop.Pointer, buffer: interop.Pointer, samples: number): void;

declare function alcCaptureStart(device: interop.Pointer): void;

declare function alcCaptureStop(device: interop.Pointer): void;

declare function alcCloseDevice(device: interop.Pointer): number;

declare function alcCreateContext(device: interop.Pointer, attrlist: interop.Reference<number>): interop.Pointer;

declare function alcDestroyContext(context: interop.Pointer): void;

declare function alcGetContextsDevice(context: interop.Pointer): interop.Pointer;

declare function alcGetCurrentContext(): interop.Pointer;

declare function alcGetEnumValue(device: interop.Pointer, enumname: string): number;

declare function alcGetError(device: interop.Pointer): number;

declare function alcGetIntegerv(device: interop.Pointer, param: number, size: number, data: interop.Reference<number>): void;

declare function alcGetProcAddress(device: interop.Pointer, funcname: string): interop.Pointer;

declare function alcGetString(device: interop.Pointer, param: number): string;

declare function alcIsExtensionPresent(device: interop.Pointer, extname: string): number;

declare function alcMakeContextCurrent(context: interop.Pointer): number;

declare function alcOpenDevice(devicename: string): interop.Pointer;

declare function alcProcessContext(context: interop.Pointer): void;

declare function alcSuspendContext(context: interop.Pointer): void;
