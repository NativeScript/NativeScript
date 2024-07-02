
declare function ___mb_cur_max(): number;

declare function ___mb_cur_max_l(p1: interop.Pointer | interop.Reference<any>): number;

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

interface __darwin_mmst_reg {
	__mmst_reg: interop.Reference<number>;
	__mmst_rsrv: interop.Reference<number>;
}
declare var __darwin_mmst_reg: interop.StructType<__darwin_mmst_reg>;

interface __darwin_opmask_reg {
	__opmask_reg: interop.Reference<number>;
}
declare var __darwin_opmask_reg: interop.StructType<__darwin_opmask_reg>;

interface __darwin_pthread_handler_rec {
	__routine: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	__arg: interop.Pointer | interop.Reference<any>;
	__next: interop.Pointer | interop.Reference<__darwin_pthread_handler_rec>;
}
declare var __darwin_pthread_handler_rec: interop.StructType<__darwin_pthread_handler_rec>;

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

interface _opaque_pthread_attr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_attr_t: interop.StructType<_opaque_pthread_attr_t>;

interface _opaque_pthread_cond_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_cond_t: interop.StructType<_opaque_pthread_cond_t>;

interface _opaque_pthread_condattr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_condattr_t: interop.StructType<_opaque_pthread_condattr_t>;

interface _opaque_pthread_mutex_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_mutex_t: interop.StructType<_opaque_pthread_mutex_t>;

interface _opaque_pthread_mutexattr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_mutexattr_t: interop.StructType<_opaque_pthread_mutexattr_t>;

interface _opaque_pthread_once_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_once_t: interop.StructType<_opaque_pthread_once_t>;

interface _opaque_pthread_rwlock_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_rwlock_t: interop.StructType<_opaque_pthread_rwlock_t>;

interface _opaque_pthread_rwlockattr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_rwlockattr_t: interop.StructType<_opaque_pthread_rwlockattr_t>;

interface _opaque_pthread_t {
	__sig: number;
	__cleanup_stack: interop.Pointer | interop.Reference<__darwin_pthread_handler_rec>;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_t: interop.StructType<_opaque_pthread_t>;

/**
 * @since 8.0
 */
declare function qos_class_main(): qos_class_t;

/**
 * @since 8.0
 */
declare function qos_class_self(): qos_class_t;

declare const enum qos_class_t {

	QOS_CLASS_USER_INTERACTIVE = 33,

	QOS_CLASS_USER_INITIATED = 25,

	QOS_CLASS_DEFAULT = 21,

	QOS_CLASS_UTILITY = 17,

	QOS_CLASS_BACKGROUND = 9,

	QOS_CLASS_UNSPECIFIED = 0
}
