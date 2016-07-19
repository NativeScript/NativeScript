
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

interface __mm_store1_pd_struct {
	__u: interop.Reference<number>;
}
declare var __mm_store1_pd_struct: interop.StructType<__mm_store1_pd_struct>;

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

declare function posix_memalign(__memptr: interop.Reference<interop.Pointer>, __alignment: number, __size: number): number;
