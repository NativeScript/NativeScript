
interface __darwin_mcontext32 {
	__es: __darwin_i386_exception_state;
	__ss: __darwin_i386_thread_state;
	__fs: __darwin_i386_float_state;
}
declare var __darwin_mcontext32: interop.StructType<__darwin_mcontext32>;

interface __darwin_mcontext64 {
	__es: __darwin_x86_exception_state64;
	__ss: __darwin_x86_thread_state64;
	__fs: __darwin_x86_float_state64;
}
declare var __darwin_mcontext64: interop.StructType<__darwin_mcontext64>;

interface __darwin_mcontext64_full {
	__es: __darwin_x86_exception_state64;
	__ss: __darwin_x86_thread_full_state64;
	__fs: __darwin_x86_float_state64;
}
declare var __darwin_mcontext64_full: interop.StructType<__darwin_mcontext64_full>;

interface __darwin_mcontext_avx32 {
	__es: __darwin_i386_exception_state;
	__ss: __darwin_i386_thread_state;
	__fs: __darwin_i386_avx_state;
}
declare var __darwin_mcontext_avx32: interop.StructType<__darwin_mcontext_avx32>;

interface __darwin_mcontext_avx512_32 {
	__es: __darwin_i386_exception_state;
	__ss: __darwin_i386_thread_state;
	__fs: __darwin_i386_avx512_state;
}
declare var __darwin_mcontext_avx512_32: interop.StructType<__darwin_mcontext_avx512_32>;

interface __darwin_mcontext_avx512_64 {
	__es: __darwin_x86_exception_state64;
	__ss: __darwin_x86_thread_state64;
	__fs: __darwin_x86_avx512_state64;
}
declare var __darwin_mcontext_avx512_64: interop.StructType<__darwin_mcontext_avx512_64>;

interface __darwin_mcontext_avx512_64_full {
	__es: __darwin_x86_exception_state64;
	__ss: __darwin_x86_thread_full_state64;
	__fs: __darwin_x86_avx512_state64;
}
declare var __darwin_mcontext_avx512_64_full: interop.StructType<__darwin_mcontext_avx512_64_full>;

interface __darwin_mcontext_avx64 {
	__es: __darwin_x86_exception_state64;
	__ss: __darwin_x86_thread_state64;
	__fs: __darwin_x86_avx_state64;
}
declare var __darwin_mcontext_avx64: interop.StructType<__darwin_mcontext_avx64>;

interface __darwin_mcontext_avx64_full {
	__es: __darwin_x86_exception_state64;
	__ss: __darwin_x86_thread_full_state64;
	__fs: __darwin_x86_avx_state64;
}
declare var __darwin_mcontext_avx64_full: interop.StructType<__darwin_mcontext_avx64_full>;

interface __darwin_sigaltstack {
	ss_sp: interop.Pointer | interop.Reference<any>;
	ss_size: number;
	ss_flags: number;
}
declare var __darwin_sigaltstack: interop.StructType<__darwin_sigaltstack>;

interface __darwin_ucontext {
	uc_onstack: number;
	uc_sigmask: number;
	uc_stack: __darwin_sigaltstack;
	uc_link: interop.Pointer | interop.Reference<__darwin_ucontext>;
	uc_mcsize: number;
	uc_mcontext: interop.Pointer | interop.Reference<__darwin_mcontext64>;
}
declare var __darwin_ucontext: interop.StructType<__darwin_ucontext>;

declare function bsd_signal(p1: number, p2: interop.FunctionReference<(p1: number) => void>): interop.FunctionReference<(p1: number) => void>;

declare function kill(p1: number, p2: number): number;

declare function killpg(p1: number, p2: number): number;

declare function psignal(p1: number, p2: string | interop.Pointer | interop.Reference<any>): void;

declare function pthread_kill(p1: interop.Pointer | interop.Reference<_opaque_pthread_t>, p2: number): number;

declare function pthread_sigmask(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function raise(p1: number): number;

declare function sigaddset(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function sigaltstack(p1: interop.Pointer | interop.Reference<__darwin_sigaltstack>, p2: interop.Pointer | interop.Reference<__darwin_sigaltstack>): number;

declare function sigblock(p1: number): number;

declare function sigdelset(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function sigemptyset(p1: interop.Pointer | interop.Reference<number>): number;

declare function sigfillset(p1: interop.Pointer | interop.Reference<number>): number;

declare function sighold(p1: number): number;

declare function sigignore(p1: number): number;

declare function siginterrupt(p1: number, p2: number): number;

declare function sigismember(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function signal(p1: number, p2: interop.FunctionReference<(p1: number) => void>): interop.FunctionReference<(p1: number) => void>;

declare function sigpause(p1: number): number;

declare function sigpending(p1: interop.Pointer | interop.Reference<number>): number;

declare function sigprocmask(p1: number, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>): number;

declare function sigrelse(p1: number): number;

declare function sigset(p1: number, p2: interop.FunctionReference<(p1: number) => void>): interop.FunctionReference<(p1: number) => void>;

declare function sigsetmask(p1: number): number;

interface sigstack {
	ss_sp: interop.Pointer | interop.Reference<any>;
	ss_onstack: number;
}
declare var sigstack: interop.StructType<sigstack>;

declare function sigsuspend(p1: interop.Pointer | interop.Reference<number>): number;

declare function sigvec(p1: number, p2: interop.Pointer | interop.Reference<sigvecStruct>, p3: interop.Pointer | interop.Reference<sigvecStruct>): number;

interface sigvecStruct {
	sv_handler: interop.FunctionReference<(p1: number) => void>;
	sv_mask: number;
	sv_flags: number;
}
declare var sigvecStruct: interop.StructType<sigvecStruct>;

declare function sigwait(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare var sys_siglist: interop.Reference<interop.Pointer | interop.Reference<any>>;

declare var sys_signame: interop.Reference<interop.Pointer | interop.Reference<any>>;
