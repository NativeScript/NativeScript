
declare function _Exit(p1: number): void;

declare function _ExitFunction(p1: number): void;

interface __darwin_fp_control {
	__invalid: number;
	__denorm: number;
	__zdiv: number;
	__ovrfl: number;
	__undfl: number;
	__precis: number;
	__pc: number;
	__rc: number;
}
declare var __darwin_fp_control: interop.StructType<__darwin_fp_control>;

interface __darwin_fp_status {
	__invalid: number;
	__denorm: number;
	__zdiv: number;
	__ovrfl: number;
	__undfl: number;
	__precis: number;
	__stkflt: number;
	__errsumm: number;
	__c0: number;
	__c1: number;
	__c2: number;
	__tos: number;
	__c3: number;
	__busy: number;
}
declare var __darwin_fp_status: interop.StructType<__darwin_fp_status>;

interface __darwin_i386_avx512_state {
	__fpu_reserved: interop.Reference<number>;
	__fpu_fcw: __darwin_fp_control;
	__fpu_fsw: __darwin_fp_status;
	__fpu_ftw: number;
	__fpu_rsrv1: number;
	__fpu_fop: number;
	__fpu_ip: number;
	__fpu_cs: number;
	__fpu_rsrv2: number;
	__fpu_dp: number;
	__fpu_ds: number;
	__fpu_rsrv3: number;
	__fpu_mxcsr: number;
	__fpu_mxcsrmask: number;
	__fpu_stmm0: __darwin_mmst_reg;
	__fpu_stmm1: __darwin_mmst_reg;
	__fpu_stmm2: __darwin_mmst_reg;
	__fpu_stmm3: __darwin_mmst_reg;
	__fpu_stmm4: __darwin_mmst_reg;
	__fpu_stmm5: __darwin_mmst_reg;
	__fpu_stmm6: __darwin_mmst_reg;
	__fpu_stmm7: __darwin_mmst_reg;
	__fpu_xmm0: __darwin_xmm_reg;
	__fpu_xmm1: __darwin_xmm_reg;
	__fpu_xmm2: __darwin_xmm_reg;
	__fpu_xmm3: __darwin_xmm_reg;
	__fpu_xmm4: __darwin_xmm_reg;
	__fpu_xmm5: __darwin_xmm_reg;
	__fpu_xmm6: __darwin_xmm_reg;
	__fpu_xmm7: __darwin_xmm_reg;
	__fpu_rsrv4: interop.Reference<number>;
	__fpu_reserved1: number;
	__avx_reserved1: interop.Reference<number>;
	__fpu_ymmh0: __darwin_xmm_reg;
	__fpu_ymmh1: __darwin_xmm_reg;
	__fpu_ymmh2: __darwin_xmm_reg;
	__fpu_ymmh3: __darwin_xmm_reg;
	__fpu_ymmh4: __darwin_xmm_reg;
	__fpu_ymmh5: __darwin_xmm_reg;
	__fpu_ymmh6: __darwin_xmm_reg;
	__fpu_ymmh7: __darwin_xmm_reg;
	__fpu_k0: __darwin_opmask_reg;
	__fpu_k1: __darwin_opmask_reg;
	__fpu_k2: __darwin_opmask_reg;
	__fpu_k3: __darwin_opmask_reg;
	__fpu_k4: __darwin_opmask_reg;
	__fpu_k5: __darwin_opmask_reg;
	__fpu_k6: __darwin_opmask_reg;
	__fpu_k7: __darwin_opmask_reg;
	__fpu_zmmh0: __darwin_ymm_reg;
	__fpu_zmmh1: __darwin_ymm_reg;
	__fpu_zmmh2: __darwin_ymm_reg;
	__fpu_zmmh3: __darwin_ymm_reg;
	__fpu_zmmh4: __darwin_ymm_reg;
	__fpu_zmmh5: __darwin_ymm_reg;
	__fpu_zmmh6: __darwin_ymm_reg;
	__fpu_zmmh7: __darwin_ymm_reg;
}
declare var __darwin_i386_avx512_state: interop.StructType<__darwin_i386_avx512_state>;

interface __darwin_i386_avx_state {
	__fpu_reserved: interop.Reference<number>;
	__fpu_fcw: __darwin_fp_control;
	__fpu_fsw: __darwin_fp_status;
	__fpu_ftw: number;
	__fpu_rsrv1: number;
	__fpu_fop: number;
	__fpu_ip: number;
	__fpu_cs: number;
	__fpu_rsrv2: number;
	__fpu_dp: number;
	__fpu_ds: number;
	__fpu_rsrv3: number;
	__fpu_mxcsr: number;
	__fpu_mxcsrmask: number;
	__fpu_stmm0: __darwin_mmst_reg;
	__fpu_stmm1: __darwin_mmst_reg;
	__fpu_stmm2: __darwin_mmst_reg;
	__fpu_stmm3: __darwin_mmst_reg;
	__fpu_stmm4: __darwin_mmst_reg;
	__fpu_stmm5: __darwin_mmst_reg;
	__fpu_stmm6: __darwin_mmst_reg;
	__fpu_stmm7: __darwin_mmst_reg;
	__fpu_xmm0: __darwin_xmm_reg;
	__fpu_xmm1: __darwin_xmm_reg;
	__fpu_xmm2: __darwin_xmm_reg;
	__fpu_xmm3: __darwin_xmm_reg;
	__fpu_xmm4: __darwin_xmm_reg;
	__fpu_xmm5: __darwin_xmm_reg;
	__fpu_xmm6: __darwin_xmm_reg;
	__fpu_xmm7: __darwin_xmm_reg;
	__fpu_rsrv4: interop.Reference<number>;
	__fpu_reserved1: number;
	__avx_reserved1: interop.Reference<number>;
	__fpu_ymmh0: __darwin_xmm_reg;
	__fpu_ymmh1: __darwin_xmm_reg;
	__fpu_ymmh2: __darwin_xmm_reg;
	__fpu_ymmh3: __darwin_xmm_reg;
	__fpu_ymmh4: __darwin_xmm_reg;
	__fpu_ymmh5: __darwin_xmm_reg;
	__fpu_ymmh6: __darwin_xmm_reg;
	__fpu_ymmh7: __darwin_xmm_reg;
}
declare var __darwin_i386_avx_state: interop.StructType<__darwin_i386_avx_state>;

interface __darwin_i386_exception_state {
	__trapno: number;
	__cpu: number;
	__err: number;
	__faultvaddr: number;
}
declare var __darwin_i386_exception_state: interop.StructType<__darwin_i386_exception_state>;

interface __darwin_i386_float_state {
	__fpu_reserved: interop.Reference<number>;
	__fpu_fcw: __darwin_fp_control;
	__fpu_fsw: __darwin_fp_status;
	__fpu_ftw: number;
	__fpu_rsrv1: number;
	__fpu_fop: number;
	__fpu_ip: number;
	__fpu_cs: number;
	__fpu_rsrv2: number;
	__fpu_dp: number;
	__fpu_ds: number;
	__fpu_rsrv3: number;
	__fpu_mxcsr: number;
	__fpu_mxcsrmask: number;
	__fpu_stmm0: __darwin_mmst_reg;
	__fpu_stmm1: __darwin_mmst_reg;
	__fpu_stmm2: __darwin_mmst_reg;
	__fpu_stmm3: __darwin_mmst_reg;
	__fpu_stmm4: __darwin_mmst_reg;
	__fpu_stmm5: __darwin_mmst_reg;
	__fpu_stmm6: __darwin_mmst_reg;
	__fpu_stmm7: __darwin_mmst_reg;
	__fpu_xmm0: __darwin_xmm_reg;
	__fpu_xmm1: __darwin_xmm_reg;
	__fpu_xmm2: __darwin_xmm_reg;
	__fpu_xmm3: __darwin_xmm_reg;
	__fpu_xmm4: __darwin_xmm_reg;
	__fpu_xmm5: __darwin_xmm_reg;
	__fpu_xmm6: __darwin_xmm_reg;
	__fpu_xmm7: __darwin_xmm_reg;
	__fpu_rsrv4: interop.Reference<number>;
	__fpu_reserved1: number;
}
declare var __darwin_i386_float_state: interop.StructType<__darwin_i386_float_state>;

interface __darwin_i386_thread_state {
	__eax: number;
	__ebx: number;
	__ecx: number;
	__edx: number;
	__edi: number;
	__esi: number;
	__ebp: number;
	__esp: number;
	__ss: number;
	__eflags: number;
	__eip: number;
	__cs: number;
	__ds: number;
	__es: number;
	__fs: number;
	__gs: number;
}
declare var __darwin_i386_thread_state: interop.StructType<__darwin_i386_thread_state>;

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

interface __darwin_mmst_reg {
	__mmst_reg: interop.Reference<number>;
	__mmst_rsrv: interop.Reference<number>;
}
declare var __darwin_mmst_reg: interop.StructType<__darwin_mmst_reg>;

interface __darwin_opmask_reg {
	__opmask_reg: interop.Reference<number>;
}
declare var __darwin_opmask_reg: interop.StructType<__darwin_opmask_reg>;

interface __darwin_sigaltstack {
	ss_sp: interop.Pointer | interop.Reference<any> | null;
	ss_size: number;
	ss_flags: number;
}
declare var __darwin_sigaltstack: interop.StructType<__darwin_sigaltstack>;

interface __darwin_ucontext {
	uc_onstack: number;
	uc_sigmask: number;
	uc_stack: __darwin_sigaltstack;
	uc_link: interop.Pointer | interop.Reference<__darwin_ucontext> | null;
	uc_mcsize: number;
	uc_mcontext: interop.Pointer | interop.Reference<__darwin_mcontext64> | null;
}
declare var __darwin_ucontext: interop.StructType<__darwin_ucontext>;

interface __darwin_x86_avx512_state64 {
	__fpu_reserved: interop.Reference<number>;
	__fpu_fcw: __darwin_fp_control;
	__fpu_fsw: __darwin_fp_status;
	__fpu_ftw: number;
	__fpu_rsrv1: number;
	__fpu_fop: number;
	__fpu_ip: number;
	__fpu_cs: number;
	__fpu_rsrv2: number;
	__fpu_dp: number;
	__fpu_ds: number;
	__fpu_rsrv3: number;
	__fpu_mxcsr: number;
	__fpu_mxcsrmask: number;
	__fpu_stmm0: __darwin_mmst_reg;
	__fpu_stmm1: __darwin_mmst_reg;
	__fpu_stmm2: __darwin_mmst_reg;
	__fpu_stmm3: __darwin_mmst_reg;
	__fpu_stmm4: __darwin_mmst_reg;
	__fpu_stmm5: __darwin_mmst_reg;
	__fpu_stmm6: __darwin_mmst_reg;
	__fpu_stmm7: __darwin_mmst_reg;
	__fpu_xmm0: __darwin_xmm_reg;
	__fpu_xmm1: __darwin_xmm_reg;
	__fpu_xmm2: __darwin_xmm_reg;
	__fpu_xmm3: __darwin_xmm_reg;
	__fpu_xmm4: __darwin_xmm_reg;
	__fpu_xmm5: __darwin_xmm_reg;
	__fpu_xmm6: __darwin_xmm_reg;
	__fpu_xmm7: __darwin_xmm_reg;
	__fpu_xmm8: __darwin_xmm_reg;
	__fpu_xmm9: __darwin_xmm_reg;
	__fpu_xmm10: __darwin_xmm_reg;
	__fpu_xmm11: __darwin_xmm_reg;
	__fpu_xmm12: __darwin_xmm_reg;
	__fpu_xmm13: __darwin_xmm_reg;
	__fpu_xmm14: __darwin_xmm_reg;
	__fpu_xmm15: __darwin_xmm_reg;
	__fpu_rsrv4: interop.Reference<number>;
	__fpu_reserved1: number;
	__avx_reserved1: interop.Reference<number>;
	__fpu_ymmh0: __darwin_xmm_reg;
	__fpu_ymmh1: __darwin_xmm_reg;
	__fpu_ymmh2: __darwin_xmm_reg;
	__fpu_ymmh3: __darwin_xmm_reg;
	__fpu_ymmh4: __darwin_xmm_reg;
	__fpu_ymmh5: __darwin_xmm_reg;
	__fpu_ymmh6: __darwin_xmm_reg;
	__fpu_ymmh7: __darwin_xmm_reg;
	__fpu_ymmh8: __darwin_xmm_reg;
	__fpu_ymmh9: __darwin_xmm_reg;
	__fpu_ymmh10: __darwin_xmm_reg;
	__fpu_ymmh11: __darwin_xmm_reg;
	__fpu_ymmh12: __darwin_xmm_reg;
	__fpu_ymmh13: __darwin_xmm_reg;
	__fpu_ymmh14: __darwin_xmm_reg;
	__fpu_ymmh15: __darwin_xmm_reg;
	__fpu_k0: __darwin_opmask_reg;
	__fpu_k1: __darwin_opmask_reg;
	__fpu_k2: __darwin_opmask_reg;
	__fpu_k3: __darwin_opmask_reg;
	__fpu_k4: __darwin_opmask_reg;
	__fpu_k5: __darwin_opmask_reg;
	__fpu_k6: __darwin_opmask_reg;
	__fpu_k7: __darwin_opmask_reg;
	__fpu_zmmh0: __darwin_ymm_reg;
	__fpu_zmmh1: __darwin_ymm_reg;
	__fpu_zmmh2: __darwin_ymm_reg;
	__fpu_zmmh3: __darwin_ymm_reg;
	__fpu_zmmh4: __darwin_ymm_reg;
	__fpu_zmmh5: __darwin_ymm_reg;
	__fpu_zmmh6: __darwin_ymm_reg;
	__fpu_zmmh7: __darwin_ymm_reg;
	__fpu_zmmh8: __darwin_ymm_reg;
	__fpu_zmmh9: __darwin_ymm_reg;
	__fpu_zmmh10: __darwin_ymm_reg;
	__fpu_zmmh11: __darwin_ymm_reg;
	__fpu_zmmh12: __darwin_ymm_reg;
	__fpu_zmmh13: __darwin_ymm_reg;
	__fpu_zmmh14: __darwin_ymm_reg;
	__fpu_zmmh15: __darwin_ymm_reg;
	__fpu_zmm16: __darwin_zmm_reg;
	__fpu_zmm17: __darwin_zmm_reg;
	__fpu_zmm18: __darwin_zmm_reg;
	__fpu_zmm19: __darwin_zmm_reg;
	__fpu_zmm20: __darwin_zmm_reg;
	__fpu_zmm21: __darwin_zmm_reg;
	__fpu_zmm22: __darwin_zmm_reg;
	__fpu_zmm23: __darwin_zmm_reg;
	__fpu_zmm24: __darwin_zmm_reg;
	__fpu_zmm25: __darwin_zmm_reg;
	__fpu_zmm26: __darwin_zmm_reg;
	__fpu_zmm27: __darwin_zmm_reg;
	__fpu_zmm28: __darwin_zmm_reg;
	__fpu_zmm29: __darwin_zmm_reg;
	__fpu_zmm30: __darwin_zmm_reg;
	__fpu_zmm31: __darwin_zmm_reg;
}
declare var __darwin_x86_avx512_state64: interop.StructType<__darwin_x86_avx512_state64>;

interface __darwin_x86_avx_state64 {
	__fpu_reserved: interop.Reference<number>;
	__fpu_fcw: __darwin_fp_control;
	__fpu_fsw: __darwin_fp_status;
	__fpu_ftw: number;
	__fpu_rsrv1: number;
	__fpu_fop: number;
	__fpu_ip: number;
	__fpu_cs: number;
	__fpu_rsrv2: number;
	__fpu_dp: number;
	__fpu_ds: number;
	__fpu_rsrv3: number;
	__fpu_mxcsr: number;
	__fpu_mxcsrmask: number;
	__fpu_stmm0: __darwin_mmst_reg;
	__fpu_stmm1: __darwin_mmst_reg;
	__fpu_stmm2: __darwin_mmst_reg;
	__fpu_stmm3: __darwin_mmst_reg;
	__fpu_stmm4: __darwin_mmst_reg;
	__fpu_stmm5: __darwin_mmst_reg;
	__fpu_stmm6: __darwin_mmst_reg;
	__fpu_stmm7: __darwin_mmst_reg;
	__fpu_xmm0: __darwin_xmm_reg;
	__fpu_xmm1: __darwin_xmm_reg;
	__fpu_xmm2: __darwin_xmm_reg;
	__fpu_xmm3: __darwin_xmm_reg;
	__fpu_xmm4: __darwin_xmm_reg;
	__fpu_xmm5: __darwin_xmm_reg;
	__fpu_xmm6: __darwin_xmm_reg;
	__fpu_xmm7: __darwin_xmm_reg;
	__fpu_xmm8: __darwin_xmm_reg;
	__fpu_xmm9: __darwin_xmm_reg;
	__fpu_xmm10: __darwin_xmm_reg;
	__fpu_xmm11: __darwin_xmm_reg;
	__fpu_xmm12: __darwin_xmm_reg;
	__fpu_xmm13: __darwin_xmm_reg;
	__fpu_xmm14: __darwin_xmm_reg;
	__fpu_xmm15: __darwin_xmm_reg;
	__fpu_rsrv4: interop.Reference<number>;
	__fpu_reserved1: number;
	__avx_reserved1: interop.Reference<number>;
	__fpu_ymmh0: __darwin_xmm_reg;
	__fpu_ymmh1: __darwin_xmm_reg;
	__fpu_ymmh2: __darwin_xmm_reg;
	__fpu_ymmh3: __darwin_xmm_reg;
	__fpu_ymmh4: __darwin_xmm_reg;
	__fpu_ymmh5: __darwin_xmm_reg;
	__fpu_ymmh6: __darwin_xmm_reg;
	__fpu_ymmh7: __darwin_xmm_reg;
	__fpu_ymmh8: __darwin_xmm_reg;
	__fpu_ymmh9: __darwin_xmm_reg;
	__fpu_ymmh10: __darwin_xmm_reg;
	__fpu_ymmh11: __darwin_xmm_reg;
	__fpu_ymmh12: __darwin_xmm_reg;
	__fpu_ymmh13: __darwin_xmm_reg;
	__fpu_ymmh14: __darwin_xmm_reg;
	__fpu_ymmh15: __darwin_xmm_reg;
}
declare var __darwin_x86_avx_state64: interop.StructType<__darwin_x86_avx_state64>;

interface __darwin_x86_cpmu_state64 {
	__ctrs: interop.Reference<number>;
}
declare var __darwin_x86_cpmu_state64: interop.StructType<__darwin_x86_cpmu_state64>;

interface __darwin_x86_debug_state32 {
	__dr0: number;
	__dr1: number;
	__dr2: number;
	__dr3: number;
	__dr4: number;
	__dr5: number;
	__dr6: number;
	__dr7: number;
}
declare var __darwin_x86_debug_state32: interop.StructType<__darwin_x86_debug_state32>;

interface __darwin_x86_debug_state64 {
	__dr0: number;
	__dr1: number;
	__dr2: number;
	__dr3: number;
	__dr4: number;
	__dr5: number;
	__dr6: number;
	__dr7: number;
}
declare var __darwin_x86_debug_state64: interop.StructType<__darwin_x86_debug_state64>;

interface __darwin_x86_exception_state64 {
	__trapno: number;
	__cpu: number;
	__err: number;
	__faultvaddr: number;
}
declare var __darwin_x86_exception_state64: interop.StructType<__darwin_x86_exception_state64>;

interface __darwin_x86_float_state64 {
	__fpu_reserved: interop.Reference<number>;
	__fpu_fcw: __darwin_fp_control;
	__fpu_fsw: __darwin_fp_status;
	__fpu_ftw: number;
	__fpu_rsrv1: number;
	__fpu_fop: number;
	__fpu_ip: number;
	__fpu_cs: number;
	__fpu_rsrv2: number;
	__fpu_dp: number;
	__fpu_ds: number;
	__fpu_rsrv3: number;
	__fpu_mxcsr: number;
	__fpu_mxcsrmask: number;
	__fpu_stmm0: __darwin_mmst_reg;
	__fpu_stmm1: __darwin_mmst_reg;
	__fpu_stmm2: __darwin_mmst_reg;
	__fpu_stmm3: __darwin_mmst_reg;
	__fpu_stmm4: __darwin_mmst_reg;
	__fpu_stmm5: __darwin_mmst_reg;
	__fpu_stmm6: __darwin_mmst_reg;
	__fpu_stmm7: __darwin_mmst_reg;
	__fpu_xmm0: __darwin_xmm_reg;
	__fpu_xmm1: __darwin_xmm_reg;
	__fpu_xmm2: __darwin_xmm_reg;
	__fpu_xmm3: __darwin_xmm_reg;
	__fpu_xmm4: __darwin_xmm_reg;
	__fpu_xmm5: __darwin_xmm_reg;
	__fpu_xmm6: __darwin_xmm_reg;
	__fpu_xmm7: __darwin_xmm_reg;
	__fpu_xmm8: __darwin_xmm_reg;
	__fpu_xmm9: __darwin_xmm_reg;
	__fpu_xmm10: __darwin_xmm_reg;
	__fpu_xmm11: __darwin_xmm_reg;
	__fpu_xmm12: __darwin_xmm_reg;
	__fpu_xmm13: __darwin_xmm_reg;
	__fpu_xmm14: __darwin_xmm_reg;
	__fpu_xmm15: __darwin_xmm_reg;
	__fpu_rsrv4: interop.Reference<number>;
	__fpu_reserved1: number;
}
declare var __darwin_x86_float_state64: interop.StructType<__darwin_x86_float_state64>;

interface __darwin_x86_thread_full_state64 {
	__ss64: __darwin_x86_thread_state64;
	__ds: number;
	__es: number;
	__ss: number;
	__gsbase: number;
}
declare var __darwin_x86_thread_full_state64: interop.StructType<__darwin_x86_thread_full_state64>;

interface __darwin_x86_thread_state64 {
	__rax: number;
	__rbx: number;
	__rcx: number;
	__rdx: number;
	__rdi: number;
	__rsi: number;
	__rbp: number;
	__rsp: number;
	__r8: number;
	__r9: number;
	__r10: number;
	__r11: number;
	__r12: number;
	__r13: number;
	__r14: number;
	__r15: number;
	__rip: number;
	__rflags: number;
	__cs: number;
	__fs: number;
	__gs: number;
}
declare var __darwin_x86_thread_state64: interop.StructType<__darwin_x86_thread_state64>;

interface __darwin_xmm_reg {
	__xmm_reg: interop.Reference<number>;
}
declare var __darwin_xmm_reg: interop.StructType<__darwin_xmm_reg>;

interface __darwin_ymm_reg {
	__ymm_reg: interop.Reference<number>;
}
declare var __darwin_ymm_reg: interop.StructType<__darwin_ymm_reg>;

interface __darwin_zmm_reg {
	__zmm_reg: interop.Reference<number>;
}
declare var __darwin_zmm_reg: interop.StructType<__darwin_zmm_reg>;

interface __last_branch_record {
	__from_ip: number;
	__to_ip: number;
	__mispredict: number;
	__tsx_abort: number;
	__in_tsx: number;
	__cycle_count: number;
	__reserved: number;
}
declare var __last_branch_record: interop.StructType<__last_branch_record>;

interface __last_branch_state {
	__lbr_count: number;
	__lbr_supported_tsx: number;
	__lbr_supported_cycle_count: number;
	__reserved: number;
	__lbrs: interop.Reference<__last_branch_record>;
}
declare var __last_branch_state: interop.StructType<__last_branch_state>;

declare var __mb_cur_max: number;

interface __x86_instruction_state {
	__insn_stream_valid_bytes: number;
	__insn_offset: number;
	__out_of_synch: number;
	__insn_bytes: interop.Reference<number>;
	__insn_cacheline: interop.Reference<number>;
}
declare var __x86_instruction_state: interop.StructType<__x86_instruction_state>;

interface __x86_pagein_state {
	__pagein_error: number;
}
declare var __x86_pagein_state: interop.StructType<__x86_pagein_state>;

declare function _exit(p1: number): void;

declare function a64l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function abort(): void;

declare function abs(p1: number): number;

declare function access(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

interface accessx_descriptor {
	ad_name_offset: number;
	ad_flags: number;
	ad_pad: interop.Reference<number>;
}
declare var accessx_descriptor: interop.StructType<accessx_descriptor>;

declare function accessx_np(p1: interop.Pointer | interop.Reference<accessx_descriptor> | ArrayBufferLike | ArrayBufferView | null, __sz: number, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p4: number): number;

declare function acct(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function add_profil(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __bufsiz: number, p3: number, p4: number): number;

declare function alarm(p1: number): number;

/**
 * @since 13.0
 */
declare function aligned_alloc(__alignment: number, __size: number): interop.Pointer | interop.Reference<any> | null;

declare function arc4random(): number;

/**
 * @deprecated 10.0
 */
declare function arc4random_addrandom(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __datlen: number): void;

/**
 * @since 4.3
 */
declare function arc4random_buf(__buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nbytes: number): void;

declare function arc4random_stir(): void;

/**
 * @since 4.3
 */
declare function arc4random_uniform(__upper_bound: number): number;

declare function at_quick_exit(p1: interop.FunctionReference<() => void>): number;

declare function atexit(p1: interop.FunctionReference<() => void>): number;

/**
 * @since 3.2
 */
declare function atexit_b(p1: () => void): number;

declare function atof(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function atof_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function atoi(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function atoi_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function atol(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function atol_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function atoll(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function atoll_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function brk(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function bsd_signal(p1: number, p2: interop.FunctionReference<(p1: number) => void> | null): interop.FunctionReference<(p1: number) => void> | null;

declare function bsearch(__key: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number>): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 3.2
 */
declare function bsearch_b(__key: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number): interop.Pointer | interop.Reference<any> | null;

declare function btowc(p1: number): number;

declare function btowc_l(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function calloc(__count: number, __size: number): interop.Pointer | interop.Reference<any> | null;

declare function cgetcap(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): interop.Pointer | interop.Reference<any> | null;

declare function cgetclose(): number;

declare function cgetent(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cgetfirst(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cgetmatch(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cgetnext(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cgetnum(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cgetset(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cgetstr(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cgetustr(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function chdir(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function chown(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number): number;

declare function chroot(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function close(p1: number): number;

declare function confstr(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __len: number): number;

declare function crypt(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 * @deprecated 2.0
 */
declare function daemon(p1: number, p2: number): number;

declare function devname(p1: number, p2: number): interop.Pointer | interop.Reference<any> | null;

declare function devname_r(p1: number, p2: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): interop.Pointer | interop.Reference<any> | null;

declare function div(p1: number, p2: number): div_t;

interface div_t {
	quot: number;
	rem: number;
}
declare var div_t: interop.StructType<div_t>;

declare function drand48(): number;

declare function dup(p1: number): number;

declare function dup2(p1: number, p2: number): number;

declare function ecvt(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function encrypt(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): void;

declare function endusershell(): void;

declare function erand48(p1: interop.Reference<number>): number;

declare function exchangedata(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function execv(__path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __argv: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function execvP(__file: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __searchpath: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __argv: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function execve(__file: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __argv: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __envp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function execvp(__file: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __argv: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function exit(p1: number): void;

/**
 * @since 8.0
 */
declare function faccessat(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: number): number;

declare function fchdir(p1: number): number;

declare function fchown(p1: number, p2: number, p3: number): number;

/**
 * @since 8.0
 */
declare function fchownat(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: number, p5: number): number;

declare function fcvt(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function fflagstostr(p1: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 3.0
 */
declare function ffsctl(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: number): number;

/**
 * @since 3.0
 */
declare function fgetattrlist(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __attrBufSize: number, p5: number): number;

declare function fgetwc(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function fgetwc_l(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 4.3
 */
declare function fgetwln(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, __len: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

/**
 * @since 4.3
 */
declare function fgetwln_l(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function fgetws(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number, p3: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function fgetws_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number, p3: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function fork(): number;

declare function fpathconf(p1: number, p2: number): number;

declare function fputwc(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function fputwc_l(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function fputws(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function fputws_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 16.0
 */
declare function freadlink(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function free(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function fsctl(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: number): number;

/**
 * @since 3.0
 */
declare function fsetattrlist(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __attrBufSize: number, p5: number): number;

declare function fsync(p1: number): number;

/**
 * @since 6.0
 */
declare function fsync_volume_np(p1: number, p2: number): number;

declare function ftruncate(p1: number, p2: number): number;

declare function fwide(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function gcvt(p1: number, p2: number, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function getattrlist(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __attrBufSize: number, p5: number): number;

/**
 * @since 8.0
 */
declare function getattrlistat(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p5: number, p6: number): number;

/**
 * @since 8.0
 */
declare function getattrlistbulk(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: number, p5: number): number;

declare function getbsize(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function getcwd(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number): interop.Pointer | interop.Reference<any> | null;

declare function getdirentriesattr(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __attrBufSize: number, p5: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p6: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p7: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p8: number): number;

declare function getdomainname(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __namelen: number): number;

declare function getdtablesize(): number;

declare function getegid(): number;

declare function getenv(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function geteuid(): number;

declare function getgid(): number;

declare function getgrouplist(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __ngroups: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getgroups(__gidsetsize: number, p2: interop.Reference<number>): number;

declare function gethostid(): number;

declare function gethostname(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __namelen: number): number;

/**
 * @since 2.0
 */
declare function getiopolicy_np(p1: number, p2: number): number;

declare function getloadavg(p1: interop.Reference<number>, __nelem: number): number;

declare function getlogin(): interop.Pointer | interop.Reference<any> | null;

declare function getlogin_r(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __namelen: number): number;

declare function getmode(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function getopt(__argc: number, p2: interop.Reference<interop.Pointer | interop.Reference<any> | null>, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getpagesize(): number;

declare function getpass(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function getpeereid(p1: number, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getpgid(p1: number): number;

declare function getpgrp(): number;

declare function getpid(): number;

declare function getppid(): number;

declare function getpriority(p1: number, p2: number): number;

declare function getprogname(): interop.Pointer | interop.Reference<any> | null;

declare function getrlimit(p1: number, p2: interop.Pointer | interop.Reference<rlimit> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getrusage(p1: number, p2: interop.Pointer | interop.Reference<rusage> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getsgroups_np(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Reference<number>): number;

declare function getsid(p1: number): number;

declare function getsubopt(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getsuboptFunction(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getuid(): number;

declare function getusershell(): interop.Pointer | interop.Reference<any> | null;

declare function getwc(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getwc_l(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getwchar(): number;

declare function getwchar_l(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getwd(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function getwgroups_np(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Reference<number>): number;

declare function grantpt(p1: number): number;

declare function heapsort(__base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number>): number;

/**
 * @since 3.2
 */
declare function heapsort_b(__base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number): number;

declare const enum idtype_t {

	P_ALL = 0,

	P_PID = 1,

	P_PGID = 2
}

/**
 * @since 2.0
 */
declare function imaxabs(j: number): number;

/**
 * @since 2.0
 */
declare function imaxdiv(__numer: number, __denom: number): imaxdiv_t;

interface imaxdiv_t {
	quot: number;
	rem: number;
}
declare var imaxdiv_t: interop.StructType<imaxdiv_t>;

declare function initgroups(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function initstate(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number): interop.Pointer | interop.Reference<any> | null;

declare function iruserok(p1: number, p2: number, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function iruserok_sa(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number, p4: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p5: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function isatty(p1: number): number;

declare function issetugid(): number;

declare function jrand48(p1: interop.Reference<number>): number;

declare function kill(p1: number, p2: number): number;

declare function killpg(p1: number, p2: number): number;

declare function l64a(p1: number): interop.Pointer | interop.Reference<any> | null;

declare function labs(p1: number): number;

declare function lchown(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number): number;

declare function lcong48(p1: interop.Reference<number>): void;

declare function ldiv(p1: number, p2: number): ldiv_t;

interface ldiv_t {
	quot: number;
	rem: number;
}
declare var ldiv_t: interop.StructType<ldiv_t>;

declare function link(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.0
 */
declare function linkat(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p5: number): number;

declare function llabs(p1: number): number;

declare function lldiv(p1: number, p2: number): lldiv_t;

interface lldiv_t {
	quot: number;
	rem: number;
}
declare var lldiv_t: interop.StructType<lldiv_t>;

declare function lockf(p1: number, p2: number, p3: number): number;

declare function lrand48(): number;

declare function lseek(p1: number, p2: number, p3: number): number;

declare function malloc(__size: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.0
 */
declare function malloc_type_aligned_alloc(alignment: number, size: number, type_id: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.0
 */
declare function malloc_type_calloc(count: number, size: number, type_id: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.0
 */
declare function malloc_type_free(ptr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, type_id: number): void;

/**
 * @since 17.0
 */
declare function malloc_type_malloc(size: number, type_id: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.0
 */
declare function malloc_type_posix_memalign(memptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, alignment: number, size: number, type_id: number): number;

/**
 * @since 17.0
 */
declare function malloc_type_realloc(ptr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number, type_id: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.0
 */
declare function malloc_type_valloc(size: number, type_id: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.0
 */
declare function malloc_type_zone_calloc(zone: interop.Pointer | interop.Reference<malloc_zone_t> | ArrayBufferLike | ArrayBufferView | null, count: number, size: number, type_id: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.0
 */
declare function malloc_type_zone_free(zone: interop.Pointer | interop.Reference<malloc_zone_t> | ArrayBufferLike | ArrayBufferView | null, ptr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, type_id: number): void;

/**
 * @since 17.0
 */
declare function malloc_type_zone_malloc(zone: interop.Pointer | interop.Reference<malloc_zone_t> | ArrayBufferLike | ArrayBufferView | null, size: number, type_id: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.0
 */
declare function malloc_type_zone_memalign(zone: interop.Pointer | interop.Reference<malloc_zone_t> | ArrayBufferLike | ArrayBufferView | null, alignment: number, size: number, type_id: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.0
 */
declare function malloc_type_zone_realloc(zone: interop.Pointer | interop.Reference<malloc_zone_t> | ArrayBufferLike | ArrayBufferView | null, ptr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number, type_id: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.0
 */
declare function malloc_type_zone_valloc(zone: interop.Pointer | interop.Reference<malloc_zone_t> | ArrayBufferLike | ArrayBufferView | null, size: number, type_id: number): interop.Pointer | interop.Reference<any> | null;

declare function mblen(__s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function mblen_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function mbstowcs(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function mbstowcs_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function mbtowc(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function mbtowc_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function mergesort(__base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number>): number;

/**
 * @since 3.2
 */
declare function mergesort_b(__base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number): number;

declare function mkdtemp(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 11.0
 */
declare function mkdtempat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function mknod(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number): number;

/**
 * @since 10.0
 */
declare function mkostemp(path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, oflags: number): number;

/**
 * @since 10.0
 */
declare function mkostemps(path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, slen: number, oflags: number): number;

/**
 * @since 11.0
 */
declare function mkostempsat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, slen: number, oflags: number): number;

/**
 * @since 5.0
 */
declare function mkpath_np(path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, omode: number): number;

/**
 * @since 10.0
 */
declare function mkpathat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, omode: number): number;

declare function mkstemp(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function mkstempFunction(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function mkstemp_dprotected_np(path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dpclass: number, dpflags: number): number;

declare function mkstemps(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

/**
 * @since 11.0
 */
declare function mkstempsat_np(dfd: number, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, slen: number): number;

declare function mktemp(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function mktempFunction(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function mrand48(): number;

declare function nextwctype(p1: number, p2: number): number;

declare function nextwctype_l(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function nfssvc(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function nice(p1: number): number;

declare function nrand48(p1: interop.Reference<number>): number;

/**
 * @since 11.0
 */
declare function open_wmemstream(__bufp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, __sizep: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<FILE> | null;

declare var optarg: interop.Pointer | interop.Reference<any> | null;

declare var opterr: number;

declare var optind: number;

declare var optopt: number;

declare var optreset: number;

declare function pathconf(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function pause(): number;

declare function pipe(p1: interop.Reference<number>): number;

/**
 * @since 3.0
 */
declare function posix_memalign(__memptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __alignment: number, __size: number): number;

declare function posix_openpt(p1: number): number;

declare function pread(__fd: number, __buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nbyte: number, __offset: number): number;

interface proc_rlimit_control_wakeupmon {
	wm_flags: number;
	wm_rate: number;
}
declare var proc_rlimit_control_wakeupmon: interop.StructType<proc_rlimit_control_wakeupmon>;

declare function profil(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __bufsiz: number, p3: number, p4: number): number;

declare function pselect(p1: number, p2: interop.Pointer | interop.Reference<fd_set> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<fd_set> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<fd_set> | ArrayBufferLike | ArrayBufferView | null, p5: interop.Pointer | interop.Reference<timespec> | ArrayBufferLike | ArrayBufferView | null, p6: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function psignal(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 3.2
 */
declare function psort(__base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number>): void;

/**
 * @since 3.2
 */
declare function psort_b(__base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number): void;

/**
 * @since 3.2
 */
declare function psort_r(__base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => number>): void;

/**
 * @since 2.0
 */
declare function pthread_atfork(p1: interop.FunctionReference<() => void> | null, p2: interop.FunctionReference<() => void> | null, p3: interop.FunctionReference<() => void> | null): number;

/**
 * @since 2.0
 */
declare function pthread_attr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 8.0
 */
declare function pthread_attr_get_qos_class_np(__attr: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, __qos_class: interop.Pointer | interop.Reference<qos_class_t> | ArrayBufferLike | ArrayBufferView | null, __relative_priority: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getdetachstate(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getguardsize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getinheritsched(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<sched_param> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getschedpolicy(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getscope(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getstack(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getstackaddr(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_getstacksize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 8.0
 */
declare function pthread_attr_set_qos_class_np(__attr: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, __qos_class: qos_class_t, __relative_priority: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setdetachstate(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setguardsize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setinheritsched(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<sched_param> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setschedpolicy(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setscope(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setstack(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, p3: number): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setstackaddr(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_attr_setstacksize(p1: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_cancel(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_cond_broadcast(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_cond_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_cond_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_cond_signal(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_cond_signal_thread_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_cond_timedwait(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t> | ArrayBufferLike | ArrayBufferView, p3: interop.Pointer | interop.Reference<timespec> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_cond_timedwait_relative_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t> | ArrayBufferLike | ArrayBufferView, p3: interop.Pointer | interop.Reference<timespec> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_cond_wait(p1: interop.Pointer | interop.Reference<_opaque_pthread_cond_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_condattr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_condattr_getpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_condattr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_condattr_setpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_condattr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 14.2
 */
declare function pthread_cpu_number_np(cpu_number_out: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_create(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_opaque_pthread_t> | null> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView | null, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<any> | null>, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_create_suspended_np(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_opaque_pthread_t> | null> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<_opaque_pthread_attr_t> | ArrayBufferLike | ArrayBufferView | null, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<any> | null>, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_detach(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_equal(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_exit(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 2.0
 */
declare function pthread_from_mach_thread_np(p1: number): interop.Pointer | interop.Reference<_opaque_pthread_t> | null;

/**
 * @since 8.0
 */
declare function pthread_get_qos_class_np(__pthread: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView, __qos_class: interop.Pointer | interop.Reference<qos_class_t> | ArrayBufferLike | ArrayBufferView | null, __relative_priority: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_get_stackaddr_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function pthread_get_stacksize_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_getconcurrency(): number;

/**
 * @since 3.2
 */
declare function pthread_getname_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

/**
 * @since 2.0
 */
declare function pthread_getschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<sched_param> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_getspecific(p1: number): interop.Pointer | interop.Reference<any> | null;

declare function pthread_getugid_np(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_is_threaded_np(): number;

/**
 * @since 17.4
 */
declare function pthread_jit_write_freeze_callbacks_np(): void;

/**
 * @since 17.4
 */
declare function pthread_jit_write_protect_supported_np(): number;

/**
 * @since 17.4
 */
declare function pthread_jit_write_with_callback_np(callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>, ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_join(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_key_create(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void> | null): number;

/**
 * @since 2.0
 */
declare function pthread_key_delete(p1: number): number;

declare function pthread_kill(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_killFunction(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_mach_thread_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_main_np(): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_getprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_lock(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_setprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t> | ArrayBufferLike | ArrayBufferView, p2: number, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_trylock(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutex_unlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutex_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 11.3
 */
declare function pthread_mutexattr_getpolicy_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_getprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_getprotocol(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_getpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_gettype(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 5.0
 */
declare function pthread_mutexattr_setpolicy_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_setprioceiling(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_setprotocol(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_setpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_mutexattr_settype(p1: interop.Pointer | interop.Reference<_opaque_pthread_mutexattr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_once(p1: interop.Pointer | interop.Reference<_opaque_pthread_once_t> | ArrayBufferLike | ArrayBufferView, p2: interop.FunctionReference<() => void>): number;

/**
 * @since 8.0
 */
declare function pthread_override_qos_class_end_np(__override: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 8.0
 */
declare function pthread_override_qos_class_start_np(__pthread: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView, __qos_class: qos_class_t, __relative_priority: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function pthread_rwlock_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_rdlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_tryrdlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_trywrlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_unlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_rwlock_wrlock(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlock_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_rwlockattr_destroy(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_rwlockattr_getpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t> | ArrayBufferLike | ArrayBufferView, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_rwlockattr_init(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_rwlockattr_setpshared(p1: interop.Pointer | interop.Reference<_opaque_pthread_rwlockattr_t> | ArrayBufferLike | ArrayBufferView, p2: number): number;

/**
 * @since 2.0
 */
declare function pthread_self(): interop.Pointer | interop.Reference<_opaque_pthread_t> | null;

/**
 * @since 8.0
 */
declare function pthread_set_qos_class_self_np(__qos_class: qos_class_t, __relative_priority: number): number;

/**
 * @since 2.0
 */
declare function pthread_setcancelstate(p1: number, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_setcanceltype(p1: number, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_setconcurrency(p1: number): number;

/**
 * @since 3.2
 */
declare function pthread_setname_np(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_setschedparam(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView, p2: number, p3: interop.Pointer | interop.Reference<sched_param> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function pthread_setspecific(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pthread_setugid_np(p1: number, p2: number): number;

declare function pthread_sigmask(p1: number, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_sigmaskFunction(p1: number, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_testcancel(): void;

/**
 * @since 3.2
 */
declare function pthread_threadid_np(p1: interop.Pointer | interop.Reference<_opaque_pthread_t> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function pthread_yield_np(): void;

declare function ptsname(p1: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 11.3
 */
declare function ptsname_r(fildes: number, buffer: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buflen: number): number;

declare function putenv(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function putwc(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function putwc_l(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function putwchar(p1: number): number;

declare function putwchar_l(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pwrite(__fd: number, __buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nbyte: number, __offset: number): number;

declare function qsort(__base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number>): void;

/**
 * @since 3.2
 */
declare function qsort_b(__base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number): void;

declare function qsort_r(__base: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __width: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => number>): void;

declare function quick_exit(p1: number): void;

declare function radixsort(__base: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __table: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __endbyte: number): number;

declare function raise(p1: number): number;

declare function rand(): number;

declare function rand_r(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function random(): number;

declare function rcmd(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p5: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p6: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function rcmd_af(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p5: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p6: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p7: number): number;

declare function read(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nbyte: number): number;

declare function readlink(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __bufsize: number): number;

/**
 * @since 8.0
 */
declare function readlinkat(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: number): number;

declare function realloc(__ptr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number): interop.Pointer | interop.Reference<any> | null;

declare function reallocf(__ptr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number): interop.Pointer | interop.Reference<any> | null;

declare function realpath(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function reboot(p1: number): number;

declare function revoke(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

interface rlimit {
	rlim_cur: number;
	rlim_max: number;
}
declare var rlimit: interop.StructType<rlimit>;

declare function rmdir(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 13.0
 */
declare function rpmatch(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function rresvport(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function rresvport_af(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

interface rusage {
	ru_utime: timeval;
	ru_stime: timeval;
	ru_maxrss: number;
	ru_ixrss: number;
	ru_idrss: number;
	ru_isrss: number;
	ru_minflt: number;
	ru_majflt: number;
	ru_nswap: number;
	ru_inblock: number;
	ru_oublock: number;
	ru_msgsnd: number;
	ru_msgrcv: number;
	ru_nsignals: number;
	ru_nvcsw: number;
	ru_nivcsw: number;
}
declare var rusage: interop.StructType<rusage>;

interface rusage_info_v0 {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
}
declare var rusage_info_v0: interop.StructType<rusage_info_v0>;

interface rusage_info_v1 {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
	ri_child_user_time: number;
	ri_child_system_time: number;
	ri_child_pkg_idle_wkups: number;
	ri_child_interrupt_wkups: number;
	ri_child_pageins: number;
	ri_child_elapsed_abstime: number;
}
declare var rusage_info_v1: interop.StructType<rusage_info_v1>;

interface rusage_info_v2 {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
	ri_child_user_time: number;
	ri_child_system_time: number;
	ri_child_pkg_idle_wkups: number;
	ri_child_interrupt_wkups: number;
	ri_child_pageins: number;
	ri_child_elapsed_abstime: number;
	ri_diskio_bytesread: number;
	ri_diskio_byteswritten: number;
}
declare var rusage_info_v2: interop.StructType<rusage_info_v2>;

interface rusage_info_v3 {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
	ri_child_user_time: number;
	ri_child_system_time: number;
	ri_child_pkg_idle_wkups: number;
	ri_child_interrupt_wkups: number;
	ri_child_pageins: number;
	ri_child_elapsed_abstime: number;
	ri_diskio_bytesread: number;
	ri_diskio_byteswritten: number;
	ri_cpu_time_qos_default: number;
	ri_cpu_time_qos_maintenance: number;
	ri_cpu_time_qos_background: number;
	ri_cpu_time_qos_utility: number;
	ri_cpu_time_qos_legacy: number;
	ri_cpu_time_qos_user_initiated: number;
	ri_cpu_time_qos_user_interactive: number;
	ri_billed_system_time: number;
	ri_serviced_system_time: number;
}
declare var rusage_info_v3: interop.StructType<rusage_info_v3>;

interface rusage_info_v4 {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
	ri_child_user_time: number;
	ri_child_system_time: number;
	ri_child_pkg_idle_wkups: number;
	ri_child_interrupt_wkups: number;
	ri_child_pageins: number;
	ri_child_elapsed_abstime: number;
	ri_diskio_bytesread: number;
	ri_diskio_byteswritten: number;
	ri_cpu_time_qos_default: number;
	ri_cpu_time_qos_maintenance: number;
	ri_cpu_time_qos_background: number;
	ri_cpu_time_qos_utility: number;
	ri_cpu_time_qos_legacy: number;
	ri_cpu_time_qos_user_initiated: number;
	ri_cpu_time_qos_user_interactive: number;
	ri_billed_system_time: number;
	ri_serviced_system_time: number;
	ri_logical_writes: number;
	ri_lifetime_max_phys_footprint: number;
	ri_instructions: number;
	ri_cycles: number;
	ri_billed_energy: number;
	ri_serviced_energy: number;
	ri_interval_max_phys_footprint: number;
	ri_runnable_time: number;
}
declare var rusage_info_v4: interop.StructType<rusage_info_v4>;

interface rusage_info_v5 {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
	ri_child_user_time: number;
	ri_child_system_time: number;
	ri_child_pkg_idle_wkups: number;
	ri_child_interrupt_wkups: number;
	ri_child_pageins: number;
	ri_child_elapsed_abstime: number;
	ri_diskio_bytesread: number;
	ri_diskio_byteswritten: number;
	ri_cpu_time_qos_default: number;
	ri_cpu_time_qos_maintenance: number;
	ri_cpu_time_qos_background: number;
	ri_cpu_time_qos_utility: number;
	ri_cpu_time_qos_legacy: number;
	ri_cpu_time_qos_user_initiated: number;
	ri_cpu_time_qos_user_interactive: number;
	ri_billed_system_time: number;
	ri_serviced_system_time: number;
	ri_logical_writes: number;
	ri_lifetime_max_phys_footprint: number;
	ri_instructions: number;
	ri_cycles: number;
	ri_billed_energy: number;
	ri_serviced_energy: number;
	ri_interval_max_phys_footprint: number;
	ri_runnable_time: number;
	ri_flags: number;
}
declare var rusage_info_v5: interop.StructType<rusage_info_v5>;

interface rusage_info_v6 {
	ri_uuid: interop.Reference<number>;
	ri_user_time: number;
	ri_system_time: number;
	ri_pkg_idle_wkups: number;
	ri_interrupt_wkups: number;
	ri_pageins: number;
	ri_wired_size: number;
	ri_resident_size: number;
	ri_phys_footprint: number;
	ri_proc_start_abstime: number;
	ri_proc_exit_abstime: number;
	ri_child_user_time: number;
	ri_child_system_time: number;
	ri_child_pkg_idle_wkups: number;
	ri_child_interrupt_wkups: number;
	ri_child_pageins: number;
	ri_child_elapsed_abstime: number;
	ri_diskio_bytesread: number;
	ri_diskio_byteswritten: number;
	ri_cpu_time_qos_default: number;
	ri_cpu_time_qos_maintenance: number;
	ri_cpu_time_qos_background: number;
	ri_cpu_time_qos_utility: number;
	ri_cpu_time_qos_legacy: number;
	ri_cpu_time_qos_user_initiated: number;
	ri_cpu_time_qos_user_interactive: number;
	ri_billed_system_time: number;
	ri_serviced_system_time: number;
	ri_logical_writes: number;
	ri_lifetime_max_phys_footprint: number;
	ri_instructions: number;
	ri_cycles: number;
	ri_billed_energy: number;
	ri_serviced_energy: number;
	ri_interval_max_phys_footprint: number;
	ri_runnable_time: number;
	ri_flags: number;
	ri_user_ptime: number;
	ri_system_ptime: number;
	ri_pinstructions: number;
	ri_pcycles: number;
	ri_energy_nj: number;
	ri_penergy_nj: number;
	ri_secure_time_in_system: number;
	ri_secure_ptime_in_system: number;
	ri_neural_footprint: number;
	ri_lifetime_max_neural_footprint: number;
	ri_interval_max_neural_footprint: number;
	ri_reserved: interop.Reference<number>;
}
declare var rusage_info_v6: interop.StructType<rusage_info_v6>;

declare function ruserok(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sbrk(p1: number): interop.Pointer | interop.Reference<any> | null;

declare function sched_get_priority_max(p1: number): number;

declare function sched_get_priority_min(p1: number): number;

interface sched_param {
	sched_priority: number;
	__opaque: interop.Reference<number>;
}
declare var sched_param: interop.StructType<sched_param>;

declare function sched_yield(): number;

declare function searchfs(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<fssearchblock> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p4: number, p5: number, p6: interop.Pointer | interop.Reference<searchstate> | ArrayBufferLike | ArrayBufferView | null): number;

declare function seed48(p1: interop.Reference<number>): interop.Pointer | interop.Reference<number> | null;

declare function select(p1: number, p2: interop.Pointer | interop.Reference<fd_set> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<fd_set> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<fd_set> | ArrayBufferLike | ArrayBufferView | null, p5: interop.Pointer | interop.Reference<timeval> | ArrayBufferLike | ArrayBufferView | null): number;

declare function setattrlist(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __attrBufSize: number, p5: number): number;

/**
 * @since 11.0
 */
declare function setattrlistat(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p5: number, p6: number): number;

declare function setdomainname(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __namelen: number): number;

declare function setegid(p1: number): number;

declare function setenv(__name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __value: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __overwrite: number): number;

declare function seteuid(p1: number): number;

declare function setgid(p1: number): number;

declare function setgroups(p1: number, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sethostid(p1: number): void;

declare function sethostname(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __namelen: number): number;

/**
 * @since 2.0
 */
declare function setiopolicy_np(p1: number, p2: number, p3: number): number;

declare function setkey(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function setkeyFunction(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function setlogin(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function setmode(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function setpgid(p1: number, p2: number): number;

declare function setpgrp(): number;

declare function setpriority(p1: number, p2: number, p3: number): number;

declare function setprogname(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function setregid(p1: number, p2: number): number;

declare function setreuid(p1: number, p2: number): number;

declare function setrgid(p1: number): number;

declare function setrlimit(p1: number, p2: interop.Pointer | interop.Reference<rlimit> | ArrayBufferLike | ArrayBufferView | null): number;

declare function setruid(p1: number): number;

declare function setsgroups_np(p1: number, p2: interop.Reference<number>): number;

declare function setsid(): number;

declare function setstate(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function setuid(p1: number): number;

declare function setusershell(): void;

declare function setwgroups_np(p1: number, p2: interop.Reference<number>): number;

declare function sigaddset(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function sigaltstack(p1: interop.Pointer | interop.Reference<__darwin_sigaltstack> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<__darwin_sigaltstack> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sigblock(p1: number): number;

declare function sigdelset(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function sigemptyset(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sigfillset(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sighold(p1: number): number;

declare function sigignore(p1: number): number;

declare function siginterrupt(p1: number, p2: number): number;

declare function sigismember(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function signal(p1: number, p2: interop.FunctionReference<(p1: number) => void>): interop.FunctionReference<(p1: number) => void>;

declare function sigpause(p1: number): number;

declare function sigpending(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sigprocmask(p1: number, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sigrelse(p1: number): number;

declare function sigset(p1: number, p2: interop.FunctionReference<(p1: number) => void> | null): interop.FunctionReference<(p1: number) => void> | null;

declare function sigsetmask(p1: number): number;

interface sigstack {
	ss_sp: interop.Pointer | interop.Reference<any> | null;
	ss_onstack: number;
}
declare var sigstack: interop.StructType<sigstack>;

declare function sigsuspend(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sigvec(p1: number, p2: interop.Pointer | interop.Reference<sigvecStruct> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<sigvecStruct> | ArrayBufferLike | ArrayBufferView | null): number;

interface sigvecStruct {
	sv_handler: interop.FunctionReference<(p1: number) => void>;
	sv_mask: number;
	sv_flags: number;
}
declare var sigvecStruct: interop.StructType<sigvecStruct>;

declare function sigwait(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sleep(p1: number): number;

declare function sradixsort(__base: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __nel: number, __table: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __endbyte: number): number;

declare function srand(p1: number): void;

declare function srand48(p1: number): void;

declare function sranddev(): void;

declare function srandom(p1: number): void;

declare function srandomdev(): void;

declare function strtod(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtod_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtof(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtof_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtofflags(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function strtoimax(__nptr: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __base: number): number;

declare function strtoimax_l(nptr: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, base: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtol(__str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __base: number): number;

declare function strtol_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtold(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtold_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtoll(__str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __base: number): number;

declare function strtoll_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function strtonum(__numstr: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __minval: number, __maxval: number, __errstrp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtoq(__str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __base: number): number;

declare function strtoq_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtoul(__str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __base: number): number;

declare function strtoul_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtoull(__str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __base: number): number;

declare function strtoull_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function strtoumax(__nptr: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __base: number): number;

declare function strtoumax_l(nptr: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, base: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strtouq(__str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __base: number): number;

declare function strtouq_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare var suboptarg: interop.Pointer | interop.Reference<any> | null;

declare var suboptargVar: interop.Pointer | interop.Reference<any> | null;

declare function swab(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nbytes: number): void;

declare function swapon(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function symlink(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.0
 */
declare function symlinkat(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sync(): void;

/**
 * @since 6.0
 */
declare function sync_volume_np(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare var sys_siglist: interop.Reference<interop.Pointer | interop.Reference<any> | null>;

declare var sys_signame: interop.Reference<interop.Pointer | interop.Reference<any> | null>;

declare function sysconf(p1: number): number;

declare function tcgetpgrp(p1: number): number;

declare function tcsetpgrp(p1: number, p2: number): number;

declare function towctrans(p1: number, p2: number): number;

declare function towctrans_l(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function truncate(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function ttyname(p1: number): interop.Pointer | interop.Reference<any> | null;

declare function ttyname_r(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __len: number): number;

declare function ttyslot(): number;

declare function ualarm(p1: number, p2: number): number;

declare function undelete(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function ungetwc(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function ungetwc_l(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function unlink(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.0
 */
declare function unlinkat(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function unlockpt(p1: number): number;

declare function unsetenv(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function unwhiteout(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function usleep(p1: number): number;

declare function valloc(__size: number): interop.Pointer | interop.Reference<any> | null;

declare function vallocFunction(__size: number): interop.Pointer | interop.Reference<any> | null;

declare function vfork(): number;

declare function wait(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wait3(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: interop.Pointer | interop.Reference<rusage> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wait4(p1: number, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<rusage> | ArrayBufferLike | ArrayBufferView | null): number;

declare function waitpid(p1: number, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

/**
 * @since 4.3
 */
declare function wcpcpy(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

/**
 * @since 4.3
 */
declare function wcpncpy(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number): interop.Pointer | interop.Reference<number> | null;

/**
 * @since 4.3
 */
declare function wcscasecmp(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 4.3
 */
declare function wcscasecmp_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcscat(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function wcschr(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<number> | null;

declare function wcscmp(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcscoll(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcscoll_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcscpy(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function wcscspn(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 4.3
 */
declare function wcsdup(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function wcsftime(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __maxlen: number, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcsftime_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null, p5: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcslcat(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __len: number): number;

declare function wcslcpy(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __len: number): number;

declare function wcslen(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 4.3
 */
declare function wcsncasecmp(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, n: number): number;

/**
 * @since 4.3
 */
declare function wcsncasecmp_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, n: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcsncat(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number): interop.Pointer | interop.Reference<number> | null;

declare function wcsncmp(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function wcsncpy(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number): interop.Pointer | interop.Reference<number> | null;

/**
 * @since 4.3
 */
declare function wcsnlen(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function wcspbrk(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function wcsrchr(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<number> | null;

declare function wcsspn(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcsstr(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function wcstod(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcstod_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcstof(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcstof_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function wcstoimax(__nptr: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, __base: number): number;

declare function wcstoimax_l(nptr: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, base: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcstok(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function wcstol(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function wcstol_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcstold(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcstold_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcstoll(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function wcstoll_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcstombs(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function wcstombs_l(__restric: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcstoul(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function wcstoul_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcstoull(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function wcstoull_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function wcstoumax(__nptr: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, __base: number): number;

declare function wcstoumax_l(nptr: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, base: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcswidth(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function wcswidth_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcsxfrm(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function wcsxfrm_l(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wctob(p1: number): number;

declare function wctob_l(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wctomb(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function wctomb_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wctrans(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wctrans_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wctype(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wctype_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wcwidth(p1: number): number;

declare function wcwidth_l(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function wmemchr(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: number, __n: number): interop.Pointer | interop.Reference<number> | null;

declare function wmemcmp(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function wmemcpy(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number): interop.Pointer | interop.Reference<number> | null;

declare function wmemmove(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __n: number): interop.Pointer | interop.Reference<number> | null;

declare function wmemset(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: number, __n: number): interop.Pointer | interop.Reference<number> | null;

declare function write(__fd: number, __buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __nbyte: number): number;
