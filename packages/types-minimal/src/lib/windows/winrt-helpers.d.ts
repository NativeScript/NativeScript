/* Auto-generated runtime helper typings for NSWinRT / interop */

export {};

declare global {
  interface NSWinRTPointer {
    handle: any | null;
    isNull(): boolean;
    unwrap(): any | null;
    toString(): string;
  }

  interface NSWinRTInterop {
    // Pointer wrapper
    Pointer: { new(handle?: any | null): NSWinRTPointer };
    pointer(value: any): NSWinRTPointer;
    isPointer(value: any): boolean;
    handleOf(value: any): any;
    // Buffer helpers
    asBufferSource(value: ArrayBuffer | ArrayBufferView | null): ArrayBuffer | ArrayBufferView | null;
    asUint8View(value: ArrayBuffer | ArrayBufferView | null): Uint8Array;
    asDataView(value: ArrayBuffer | ArrayBufferView | null): DataView;
    toWinRTDateTimeTicks(input: Date | number): bigint;
    fromWinRTDateTimeTicks(value: any): Date;
    pointerKey(value: any): string | null;
    pointerFromBuffer(value: ArrayBuffer | ArrayBufferView | null): any | null;
    trackBufferSource(value: ArrayBuffer | ArrayBufferView | null): any | null;
    resolveTrackedBuffer(pointerLike: any): ArrayBuffer | ArrayBufferView | undefined;
    byteLengthOf(value: ArrayBuffer | ArrayBufferView | null): number;
    byteOffsetOf(value: ArrayBuffer | ArrayBufferView | null): number;
    readU8(value: ArrayBuffer | ArrayBufferView, offset: number): number;
    writeU8(value: ArrayBuffer | ArrayBufferView, offset: number, input: number): ArrayBuffer | ArrayBufferView;
    readI32(value: ArrayBuffer | ArrayBufferView, offset: number, littleEndian?: boolean): number;
    writeI32(value: ArrayBuffer | ArrayBufferView, offset: number, input: number, littleEndian?: boolean): ArrayBuffer | ArrayBufferView;
    readF32(value: ArrayBuffer | ArrayBufferView, offset: number, littleEndian?: boolean): number;
    writeF32(value: ArrayBuffer | ArrayBufferView, offset: number, input: number, littleEndian?: boolean): ArrayBuffer | ArrayBufferView;
    readF64(value: ArrayBuffer | ArrayBufferView, offset: number, littleEndian?: boolean): number;
    writeF64(value: ArrayBuffer | ArrayBufferView, offset: number, input: number, littleEndian?: boolean): ArrayBuffer | ArrayBufferView;
  }

  interface NSWinRTEventEmitter {
    add(listener: Function): void;
    remove(listener: Function): void;
    emit(...args: any[]): void;
  }

  interface NSWinRTGlobal {
    // Async helpers
    toPromise(op: any, options?: { timeoutMs?: number }): Promise<any>;
    wait(op: any, options?: { timeoutMs?: number }): any;
    getStatus(op: any): number;
    getResults(op: any): any;
    onCompleted(op: any, callback: (op: any, status: number) => void, options?: any): any;
    setDefaultTimeoutMs(timeoutMs: number): void;

    // Delegate / events / proxy helpers
    asDelegate(handler: Function | { invoke: Function }): any;
    asDelegate(type: string, handler: Function | { invoke: Function }): any;
    createEventEmitter(): NSWinRTEventEmitter;

    // Interop sub-object (binary helpers)
    interop: NSWinRTInterop;

    // Runtime helpers
    import(path: string): any;
    dynamicImport(path: string): Promise<any>;
    proxy: any;
    win32: any;
    dotnet: any;
  }

  var NSWinRT: NSWinRTGlobal;
  var interop: NSWinRTInterop;
}
