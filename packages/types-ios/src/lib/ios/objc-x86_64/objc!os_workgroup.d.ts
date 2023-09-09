
interface os_workgroup_attr_opaque_s {
	sig: number;
	opaque: interop.Reference<number>;
}
declare var os_workgroup_attr_opaque_s: interop.StructType<os_workgroup_attr_opaque_s>;

declare function os_workgroup_cancel(wg: interop.Pointer | interop.Reference<any>): void;

declare function os_workgroup_create_with_workgroup(name: string | interop.Pointer | interop.Reference<any>, wg: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function os_workgroup_get_working_arena(wg: interop.Pointer | interop.Reference<any>, index_out: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

interface os_workgroup_interval_data_opaque_s {
	sig: number;
	opaque: interop.Reference<number>;
}
declare var os_workgroup_interval_data_opaque_s: interop.StructType<os_workgroup_interval_data_opaque_s>;

declare function os_workgroup_interval_finish(wg: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<os_workgroup_interval_data_opaque_s>): number;

declare function os_workgroup_interval_start(wg: interop.Pointer | interop.Reference<any>, start: number, deadline: number, data: interop.Pointer | interop.Reference<os_workgroup_interval_data_opaque_s>): number;

declare function os_workgroup_interval_update(wg: interop.Pointer | interop.Reference<any>, deadline: number, data: interop.Pointer | interop.Reference<os_workgroup_interval_data_opaque_s>): number;

declare function os_workgroup_join(wg: interop.Pointer | interop.Reference<any>, token_out: interop.Pointer | interop.Reference<os_workgroup_join_token_opaque_s>): number;

interface os_workgroup_join_token_opaque_s {
	sig: number;
	opaque: interop.Reference<number>;
}
declare var os_workgroup_join_token_opaque_s: interop.StructType<os_workgroup_join_token_opaque_s>;

declare function os_workgroup_leave(wg: interop.Pointer | interop.Reference<any>, token: interop.Pointer | interop.Reference<os_workgroup_join_token_opaque_s>): void;

declare function os_workgroup_max_parallel_threads(wg: interop.Pointer | interop.Reference<any>, attr: interop.Pointer | interop.Reference<any>): number;

declare function os_workgroup_parallel_create(name: string | interop.Pointer | interop.Reference<any>, attr: interop.Pointer | interop.Reference<os_workgroup_attr_opaque_s>): interop.Pointer | interop.Reference<any>;

declare function os_workgroup_set_working_arena(wg: interop.Pointer | interop.Reference<any>, arena: interop.Pointer | interop.Reference<any>, max_workers: number, destructor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function os_workgroup_testcancel(wg: interop.Pointer | interop.Reference<any>): boolean;
