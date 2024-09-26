
declare function pselect(p1: number, p2: interop.Pointer | interop.Reference<fd_set>, p3: interop.Pointer | interop.Reference<fd_set>, p4: interop.Pointer | interop.Reference<fd_set>, p5: interop.Pointer | interop.Reference<timespec>, p6: interop.Pointer | interop.Reference<number>): number;

declare function select(p1: number, p2: interop.Pointer | interop.Reference<fd_set>, p3: interop.Pointer | interop.Reference<fd_set>, p4: interop.Pointer | interop.Reference<fd_set>, p5: interop.Pointer | interop.Reference<timeval>): number;
