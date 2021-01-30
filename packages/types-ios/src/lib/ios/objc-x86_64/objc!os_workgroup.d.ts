
declare class OS_os_workgroup extends OS_object {

	static alloc(): OS_os_workgroup; // inherited from NSObject

	static new(): OS_os_workgroup; // inherited from NSObject
}

declare class OS_os_workgroup_interval extends OS_os_workgroup implements OS_os_workgroup_intervalProtocol {

	static alloc(): OS_os_workgroup_interval; // inherited from NSObject

	static new(): OS_os_workgroup_interval; // inherited from NSObject
}

interface OS_os_workgroup_intervalProtocol {
}
declare var OS_os_workgroup_intervalProtocol: {

	prototype: OS_os_workgroup_intervalProtocol;
};

declare class OS_os_workgroup_parallel extends OS_os_workgroup implements OS_os_workgroup_parallelProtocol {

	static alloc(): OS_os_workgroup_parallel; // inherited from NSObject

	static new(): OS_os_workgroup_parallel; // inherited from NSObject
}

interface OS_os_workgroup_parallelProtocol {
}
declare var OS_os_workgroup_parallelProtocol: {

	prototype: OS_os_workgroup_parallelProtocol;
};

interface os_workgroup_attr_opaque_s {
	sig: number;
	opaque: interop.Reference<number>;
}
declare var os_workgroup_attr_opaque_s: interop.StructType<os_workgroup_attr_opaque_s>;

declare function os_workgroup_cancel(wg: OS_os_workgroup): void;

declare function os_workgroup_create_with_workgroup(name: string | interop.Pointer | interop.Reference<any>, wg: OS_os_workgroup): OS_os_workgroup;

declare function os_workgroup_get_working_arena(wg: OS_os_workgroup, index_out: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

interface os_workgroup_interval_data_opaque_s {
	sig: number;
	opaque: interop.Reference<number>;
}
declare var os_workgroup_interval_data_opaque_s: interop.StructType<os_workgroup_interval_data_opaque_s>;

declare function os_workgroup_interval_finish(wg: OS_os_workgroup, data: interop.Pointer | interop.Reference<os_workgroup_interval_data_opaque_s>): number;

declare function os_workgroup_interval_start(wg: OS_os_workgroup, start: number, deadline: number, data: interop.Pointer | interop.Reference<os_workgroup_interval_data_opaque_s>): number;

declare function os_workgroup_interval_update(wg: OS_os_workgroup, deadline: number, data: interop.Pointer | interop.Reference<os_workgroup_interval_data_opaque_s>): number;

declare function os_workgroup_join(wg: OS_os_workgroup, token_out: interop.Pointer | interop.Reference<os_workgroup_join_token_opaque_s>): number;

interface os_workgroup_join_token_opaque_s {
	sig: number;
	opaque: interop.Reference<number>;
}
declare var os_workgroup_join_token_opaque_s: interop.StructType<os_workgroup_join_token_opaque_s>;

declare function os_workgroup_leave(wg: OS_os_workgroup, token: interop.Pointer | interop.Reference<os_workgroup_join_token_opaque_s>): void;

declare function os_workgroup_max_parallel_threads(wg: OS_os_workgroup, attr: interop.Pointer | interop.Reference<any>): number;

declare function os_workgroup_parallel_create(name: string | interop.Pointer | interop.Reference<any>, attr: interop.Pointer | interop.Reference<os_workgroup_attr_opaque_s>): OS_os_workgroup;

declare function os_workgroup_set_working_arena(wg: OS_os_workgroup, arena: interop.Pointer | interop.Reference<any>, max_workers: number, destructor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function os_workgroup_testcancel(wg: OS_os_workgroup): boolean;
