
declare const enum MPSDeviceOptions {

	Default = 0,

	LowPower = 1,

	SkipRemovable = 2
}

declare function MPSGetPreferredDevice(options: MPSDeviceOptions): MTLDevice;

declare function MPSHintTemporaryMemoryHighWaterMark(cmdBuf: MTLCommandBuffer, bytes: number): void;

declare function MPSSetHeapCacheDuration(cmdBuf: MTLCommandBuffer, seconds: number): void;

declare function MPSSupportsMTLDevice(device: MTLDevice): boolean;
