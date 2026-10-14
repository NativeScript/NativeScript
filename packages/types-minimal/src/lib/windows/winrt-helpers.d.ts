/* Auto-generated runtime helper typings for NSWinRT / interop */

export {};

declare global {
  // TypeScript @Interfaces decorator — attach WinRT interface/delegate list to a class.
  // Usage: @Interfaces([Windows.UI.Xaml.Controls.Primitives.IButtonBase])
  function Interfaces(interfaces: any[]): ClassDecorator;

  // TypeScript @CSharpProxy decorator — set an explicit managed type name.
  // Usage: @CSharpProxy('MyApp.Namespace.MyButton')
  // When present, creates a real C# subclass via the managed bridge.
  function CSharpProxy(name: string): ClassDecorator;

  type ExtendOverrides<T> = T & { interfaces?: any[]; init?(...args: any[]): void };

  interface Function {
    /** Subclass this WinRT class with JS overrides. Returns a typed constructor. */
    extend<TOverrides extends Record<string, any> = {}>(
      overrides: ExtendOverrides<TOverrides>
    ): new (...args: any[]) => Omit<TOverrides, 'interfaces' | 'init'>;
    extend<TOverrides extends Record<string, any> = {}>(
      name: string,
      overrides?: ExtendOverrides<TOverrides>
    ): new (...args: any[]) => Omit<TOverrides, 'interfaces' | 'init'>;

    /** Subclass via the managed (.NET) bridge. Returns a typed constructor. */
    extendManaged<TOverrides extends Record<string, any> = {}>(
      overrides: ExtendOverrides<TOverrides>
    ): new (...args: any[]) => Omit<TOverrides, 'interfaces' | 'init'>;
    extendManaged<TOverrides extends Record<string, any> = {}>(
      name: string,
      overrides?: ExtendOverrides<TOverrides>
    ): new (...args: any[]) => Omit<TOverrides, 'interfaces' | 'init'>;
  }

  interface NSWinRTPointer {
    handle: any | null;
    isNull(): boolean;
    unwrap(): any | null;
    toString(): string;
  }

  interface NSWinRTInterop {
    Pointer: { new(handle?: any | null): NSWinRTPointer };
    pointer(value: any): NSWinRTPointer;
    isPointer(value: any): boolean;
    handleOf(value: any): any;

    asBufferSource(value: ArrayBuffer | ArrayBufferView | null): ArrayBuffer | ArrayBufferView | null;
    asUint8View(value: ArrayBuffer | ArrayBufferView | null): Uint8Array;
    asDataView(value: ArrayBuffer | ArrayBufferView | null): DataView;
    toWinRTDateTimeTicks(input: Date | number): bigint;
    fromWinRTDateTimeTicks(value: any): Date;
    pointerKey(value: any): string | null;
    pointerFromBuffer(value: ArrayBuffer | ArrayBufferView | null): any | null;
    arrayBufferFromBuffer(buffer: any | null): ArrayBuffer | null;
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

    // Reference/value helpers
    reference(typeName: string, value: any): any | null;
    float(n: number): any;
    double(n: number): any;
    int(n: number): any;
    uint(n: number): any;
    long(n: number): any;
    ulong(n: number): any;
    short(n: number): any;
    ushort(n: number): any;
    byte(n: number): any;
    char(c: string): any;
    bool(v: boolean): any;
    timeSpan(ms: number): any;
    dateTime(msOrDate: number | Date): any;
    guid(str: string): any;
  }

  interface NSWinRTEventEmitter {
    add(listener: Function): { dispose(): void };
    emit(...args: any[]): void;
    count(): number;
  }

  interface NSWinRTDotNet {
    taskToPromise?(obj: any): Promise<any>;
    asDelegate?(typeNameOrFn: Function | string, fn?: Function): any;
  }

  interface NSWinRTWin32 {
    call(dll: string, fn_name: string, returnType: string, ...args: any[]): any;
    bind(dll: string, returnType?: string): Record<string, (...args: any[]) => any>;
    define(dll: string, signatures: Record<string, string[]>, defaultReturnType?: string): Record<string, (...args: any[]) => any>;
    import(dll: string, returnType?: string): void;
  }

  interface NSWinRTProxy {
    getExtensions(): any[];
    emit(meta: any, outDir?: string): { dir: string; csprojPath: string; csPath: string };
    compile(meta: any, outDir?: string, configuration?: string): any;
    register(meta: any, outDir?: string, configuration?: string): any;
    createManagedSubclass(assembly?: string, typeName?: string, overrides?: any): any;
    invokeById(proxyId: number, methodName: string, argsArray?: any[]): any;
    listRegisteredManifests(): any[];
  }

  interface NSWinRTGlobal {
    toPromise(op: any, options?: { timeoutMs?: number }): Promise<any>;
    wait(op: any, options?: { timeoutMs?: number }): any;
    getStatus(op: any): number;
    getResults(op: any): any;
    onCompleted(op: any, callback: (op: any, status: number) => void, options?: any): any;
    setDefaultTimeoutMs(timeoutMs: number): void;

    asDelegate(typeNameOrFn: string | Function | { invoke: Function }, fn?: Function): any;
    createEventEmitter(): NSWinRTEventEmitter;

    interop: NSWinRTInterop;

    import(path: string): any;
    dynamicImport(path: string): Promise<any>;
    proxy: NSWinRTProxy;
    win32: NSWinRTWin32;
    dotnet: NSWinRTDotNet;
    runOnUIThread?(fn: Function): any;
  }

  var NSWinRT: NSWinRTGlobal;
  var interop: NSWinRTInterop;
}
