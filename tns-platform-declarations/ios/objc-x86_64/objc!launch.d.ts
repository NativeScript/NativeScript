
declare function launch_activate_socket(name: string | interop.Pointer | interop.Reference<any>, fds: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, cnt: interop.Pointer | interop.Reference<number>): number;

declare function launch_data_alloc(type: launch_data_type_t): interop.Pointer | interop.Reference<any>;

declare function launch_data_array_get_count(larray: interop.Pointer | interop.Reference<any>): number;

declare function launch_data_array_get_index(larray: interop.Pointer | interop.Reference<any>, idx: number): interop.Pointer | interop.Reference<any>;

declare function launch_data_array_set_index(larray: interop.Pointer | interop.Reference<any>, lval: interop.Pointer | interop.Reference<any>, idx: number): boolean;

declare function launch_data_copy(ld: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function launch_data_dict_get_count(ldict: interop.Pointer | interop.Reference<any>): number;

declare function launch_data_dict_insert(ldict: interop.Pointer | interop.Reference<any>, lval: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): boolean;

declare function launch_data_dict_iterate(ldict: interop.Pointer | interop.Reference<any>, iterator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: interop.Pointer | interop.Reference<any>) => void>, ctx: interop.Pointer | interop.Reference<any>): void;

declare function launch_data_dict_lookup(ldict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function launch_data_dict_remove(ldict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): boolean;

declare function launch_data_free(ld: interop.Pointer | interop.Reference<any>): void;

declare function launch_data_get_bool(ld: interop.Pointer | interop.Reference<any>): boolean;

declare function launch_data_get_errno(ld: interop.Pointer | interop.Reference<any>): number;

declare function launch_data_get_fd(ld: interop.Pointer | interop.Reference<any>): number;

declare function launch_data_get_integer(ld: interop.Pointer | interop.Reference<any>): number;

declare function launch_data_get_machport(ld: interop.Pointer | interop.Reference<any>): number;

declare function launch_data_get_opaque(ld: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function launch_data_get_opaque_size(ld: interop.Pointer | interop.Reference<any>): number;

declare function launch_data_get_real(ld: interop.Pointer | interop.Reference<any>): number;

declare function launch_data_get_string(ld: interop.Pointer | interop.Reference<any>): string;

declare function launch_data_get_type(ld: interop.Pointer | interop.Reference<any>): launch_data_type_t;

declare function launch_data_new_bool(val: boolean): interop.Pointer | interop.Reference<any>;

declare function launch_data_new_fd(fd: number): interop.Pointer | interop.Reference<any>;

declare function launch_data_new_integer(val: number): interop.Pointer | interop.Reference<any>;

declare function launch_data_new_machport(val: number): interop.Pointer | interop.Reference<any>;

declare function launch_data_new_opaque(bytes: interop.Pointer | interop.Reference<any>, sz: number): interop.Pointer | interop.Reference<any>;

declare function launch_data_new_real(val: number): interop.Pointer | interop.Reference<any>;

declare function launch_data_new_string(val: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function launch_data_set_bool(ld: interop.Pointer | interop.Reference<any>, val: boolean): boolean;

declare function launch_data_set_fd(ld: interop.Pointer | interop.Reference<any>, fd: number): boolean;

declare function launch_data_set_integer(ld: interop.Pointer | interop.Reference<any>, val: number): boolean;

declare function launch_data_set_machport(ld: interop.Pointer | interop.Reference<any>, mp: number): boolean;

declare function launch_data_set_opaque(ld: interop.Pointer | interop.Reference<any>, bytes: interop.Pointer | interop.Reference<any>, sz: number): boolean;

declare function launch_data_set_real(ld: interop.Pointer | interop.Reference<any>, val: number): boolean;

declare function launch_data_set_string(ld: interop.Pointer | interop.Reference<any>, val: string | interop.Pointer | interop.Reference<any>): boolean;

declare const enum launch_data_type_t {

	LAUNCH_DATA_DICTIONARY = 1,

	LAUNCH_DATA_ARRAY = 2,

	LAUNCH_DATA_FD = 3,

	LAUNCH_DATA_INTEGER = 4,

	LAUNCH_DATA_REAL = 5,

	LAUNCH_DATA_BOOL = 6,

	LAUNCH_DATA_STRING = 7,

	LAUNCH_DATA_OPAQUE = 8,

	LAUNCH_DATA_ERRNO = 9,

	LAUNCH_DATA_MACHPORT = 10
}

declare function launch_get_fd(): number;

declare function launch_msg(request: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;
