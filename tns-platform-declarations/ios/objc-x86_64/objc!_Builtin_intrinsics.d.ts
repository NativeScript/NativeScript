
interface __loadu_si64 {
	__v: number;
}
declare var __loadu_si64: interop.StructType<__loadu_si64>;

interface __mm_load1_pd_struct {
	__u: number;
}
declare var __mm_load1_pd_struct: interop.StructType<__mm_load1_pd_struct>;

interface __mm_load1_ps_struct {
	__u: number;
}
declare var __mm_load1_ps_struct: interop.StructType<__mm_load1_ps_struct>;

interface __mm_load_sd_struct {
	__u: number;
}
declare var __mm_load_sd_struct: interop.StructType<__mm_load_sd_struct>;

interface __mm_load_ss_struct {
	__u: number;
}
declare var __mm_load_ss_struct: interop.StructType<__mm_load_ss_struct>;

interface __mm_loadh_pd_struct {
	__u: number;
}
declare var __mm_loadh_pd_struct: interop.StructType<__mm_loadh_pd_struct>;

interface __mm_loadl_epi64_struct {
	__u: number;
}
declare var __mm_loadl_epi64_struct: interop.StructType<__mm_loadl_epi64_struct>;

interface __mm_loadl_pd_struct {
	__u: number;
}
declare var __mm_loadl_pd_struct: interop.StructType<__mm_loadl_pd_struct>;

interface __mm_store_sd_struct {
	__u: number;
}
declare var __mm_store_sd_struct: interop.StructType<__mm_store_sd_struct>;

interface __mm_store_ss_struct {
	__u: number;
}
declare var __mm_store_ss_struct: interop.StructType<__mm_store_ss_struct>;

interface __mm_storeh_pd_struct {
	__u: number;
}
declare var __mm_storeh_pd_struct: interop.StructType<__mm_storeh_pd_struct>;

interface __mm_storeh_pd_structStruct {
	__u: number;
}
declare var __mm_storeh_pd_structStruct: interop.StructType<__mm_storeh_pd_structStruct>;

interface __mm_storel_epi64_struct {
	__u: number;
}
declare var __mm_storel_epi64_struct: interop.StructType<__mm_storel_epi64_struct>;

declare function _mm_clflush(p1: interop.Pointer | interop.Reference<any>): void;

declare function _mm_getcsr(): number;

declare function _mm_lfence(): void;

declare function _mm_mfence(): void;

declare function _mm_pause(): void;

declare function _mm_setcsr(p1: number): void;

declare function _mm_sfence(): void;

declare function posix_memalign(__memptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __alignment: number, __size: number): number;
