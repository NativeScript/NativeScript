/**
 * Additions of the NativeScript Linux runtime (github.com/NativeScript/linux)
 * to the shared `interop` API. C declarations come from the c!*.d.ts files,
 * generated from the runtime's metadata.
 */
declare module interop {
	/**
	 * Zero-copy view of native memory. `free` (e.g. `g_free`) runs when the buffer is collected.
	 */
	function bufferFromData(data: Pointer, length: number, free?: Function): ArrayBuffer;

	/**
	 * C function pointer that calls `func`, cached until `release(func)`.
	 */
	function callback(func: Function, signature: { returns: Type<any>; args: Type<any>[] }): Pointer;

	/**
	 * NUL-terminated copy of `value`, garbage collected with the returned Pointer.
	 */
	function cstring(value: string): Pointer;

	/**
	 * Frees the C function pointers made for `func`; returns how many were freed.
	 */
	function release(func: Function): number;
}

declare namespace nativescript {
	/** Keeps the event loop alive (e.g. while waiting on callbacks from other threads). */
	function ref(): void;
	function unref(): void;
}
