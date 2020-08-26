
declare function sys_cache_control(_function: number, start: interop.Pointer | interop.Reference<any>, len: number): number;

declare function sys_dcache_flush(start: interop.Pointer | interop.Reference<any>, len: number): void;

declare function sys_icache_invalidate(start: interop.Pointer | interop.Reference<any>, len: number): void;
