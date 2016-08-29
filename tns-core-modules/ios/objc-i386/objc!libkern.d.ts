
declare function OSBacktrace(bt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, maxAddrs: number): number;

declare function OSKernelStackRemaining(): number;

declare function OSPrintBacktrace(): void;

declare var log_leaks: number;

declare function sys_cache_control(_function: number, start: interop.Pointer | interop.Reference<any>, len: number): number;

declare function sys_dcache_flush(start: interop.Pointer | interop.Reference<any>, len: number): void;

declare function sys_icache_invalidate(start: interop.Pointer | interop.Reference<any>, len: number): void;

declare function trace_backtrace(debugid: number, debugid2: number, size: number, data: number): void;
