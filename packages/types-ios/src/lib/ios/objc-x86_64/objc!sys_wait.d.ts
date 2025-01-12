
declare const enum idtype_t {

	P_ALL = 0,

	P_PID = 1,

	P_PGID = 2
}

declare function wait(p1: interop.Pointer | interop.Reference<number>): number;

declare function wait3(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<rusage>): number;

declare function wait4(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: interop.Pointer | interop.Reference<rusage>): number;

declare function waitpid(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: number): number;
