
declare var XPC_ACTIVITY_REQUIRE_BATTERY_LEVEL: string;

declare var XPC_ACTIVITY_REQUIRE_HDD_SPINNING: string;

declare const XPC_ACTIVITY_STATE_CHECK_IN: number;

declare const XPC_ACTIVITY_STATE_CONTINUE: number;

declare const XPC_ACTIVITY_STATE_DEFER: number;

declare const XPC_ACTIVITY_STATE_DONE: number;

declare const XPC_ACTIVITY_STATE_RUN: number;

declare const XPC_ACTIVITY_STATE_WAIT: number;

declare var _xpc_bool_false: void;

declare var _xpc_bool_true: void;

declare var _xpc_error_connection_interrupted: void;

declare var _xpc_error_connection_invalid: void;

declare var _xpc_error_key_description: string;

declare var _xpc_error_peer_code_signing_requirement: void;

declare var _xpc_error_termination_imminent: void;

declare var _xpc_event_key_name: string;

declare var _xpc_type_array: void;

declare var _xpc_type_bool: void;

declare var _xpc_type_connection: void;

declare var _xpc_type_data: void;

declare var _xpc_type_date: void;

declare var _xpc_type_dictionary: void;

declare var _xpc_type_double: void;

declare var _xpc_type_endpoint: void;

declare var _xpc_type_error: void;

declare var _xpc_type_fd: void;

declare var _xpc_type_int64: void;

declare var _xpc_type_null: void;

declare var _xpc_type_rich_error: void;

declare var _xpc_type_shmem: void;

declare var _xpc_type_string: void;

declare var _xpc_type_uint64: void;

declare var _xpc_type_uuid: void;

declare function xpc_array_append_value(xarray: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function xpc_array_apply(xarray: interop.Pointer | interop.Reference<any>, applier: (p1: number, p2: interop.Pointer | interop.Reference<any>) => boolean): boolean;

declare function xpc_array_create(objects: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, count: number): interop.Pointer | interop.Reference<any>;

declare function xpc_array_create_connection(xarray: interop.Pointer | interop.Reference<any>, index: number): interop.Pointer | interop.Reference<any>;

declare function xpc_array_create_empty(): interop.Pointer | interop.Reference<any>;

declare function xpc_array_dup_fd(xarray: interop.Pointer | interop.Reference<any>, index: number): number;

declare function xpc_array_get_array(xarray: interop.Pointer | interop.Reference<any>, index: number): interop.Pointer | interop.Reference<any>;

declare function xpc_array_get_bool(xarray: interop.Pointer | interop.Reference<any>, index: number): boolean;

declare function xpc_array_get_count(xarray: interop.Pointer | interop.Reference<any>): number;

declare function xpc_array_get_data(xarray: interop.Pointer | interop.Reference<any>, index: number, length: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function xpc_array_get_date(xarray: interop.Pointer | interop.Reference<any>, index: number): number;

declare function xpc_array_get_dictionary(xarray: interop.Pointer | interop.Reference<any>, index: number): interop.Pointer | interop.Reference<any>;

declare function xpc_array_get_double(xarray: interop.Pointer | interop.Reference<any>, index: number): number;

declare function xpc_array_get_int64(xarray: interop.Pointer | interop.Reference<any>, index: number): number;

declare function xpc_array_get_string(xarray: interop.Pointer | interop.Reference<any>, index: number): string;

declare function xpc_array_get_uint64(xarray: interop.Pointer | interop.Reference<any>, index: number): number;

declare function xpc_array_get_uuid(xarray: interop.Pointer | interop.Reference<any>, index: number): string;

declare function xpc_array_get_value(xarray: interop.Pointer | interop.Reference<any>, index: number): interop.Pointer | interop.Reference<any>;

declare function xpc_array_set_bool(xarray: interop.Pointer | interop.Reference<any>, index: number, value: boolean): void;

declare function xpc_array_set_connection(xarray: interop.Pointer | interop.Reference<any>, index: number, connection: interop.Pointer | interop.Reference<any>): void;

declare function xpc_array_set_data(xarray: interop.Pointer | interop.Reference<any>, index: number, bytes: interop.Pointer | interop.Reference<any>, length: number): void;

declare function xpc_array_set_date(xarray: interop.Pointer | interop.Reference<any>, index: number, value: number): void;

declare function xpc_array_set_double(xarray: interop.Pointer | interop.Reference<any>, index: number, value: number): void;

declare function xpc_array_set_fd(xarray: interop.Pointer | interop.Reference<any>, index: number, fd: number): void;

declare function xpc_array_set_int64(xarray: interop.Pointer | interop.Reference<any>, index: number, value: number): void;

declare function xpc_array_set_string(xarray: interop.Pointer | interop.Reference<any>, index: number, string: string | interop.Pointer | interop.Reference<any>): void;

declare function xpc_array_set_uint64(xarray: interop.Pointer | interop.Reference<any>, index: number, value: number): void;

declare function xpc_array_set_uuid(xarray: interop.Pointer | interop.Reference<any>, index: number, uuid: interop.Reference<number>): void;

declare function xpc_array_set_value(xarray: interop.Pointer | interop.Reference<any>, index: number, value: interop.Pointer | interop.Reference<any>): void;

declare function xpc_bool_create(value: boolean): interop.Pointer | interop.Reference<any>;

declare function xpc_bool_get_value(xbool: interop.Pointer | interop.Reference<any>): boolean;

declare function xpc_connection_activate(connection: interop.Pointer | interop.Reference<any>): void;

declare function xpc_connection_cancel(connection: interop.Pointer | interop.Reference<any>): void;

declare function xpc_connection_copy_invalidation_reason(connection: interop.Pointer | interop.Reference<any>): string;

declare function xpc_connection_create(name: string | interop.Pointer | interop.Reference<any>, targetq: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_connection_create_from_endpoint(endpoint: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_connection_get_context(connection: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_connection_get_egid(connection: interop.Pointer | interop.Reference<any>): number;

declare function xpc_connection_get_euid(connection: interop.Pointer | interop.Reference<any>): number;

declare function xpc_connection_get_name(connection: interop.Pointer | interop.Reference<any>): string;

declare function xpc_connection_resume(connection: interop.Pointer | interop.Reference<any>): void;

declare function xpc_connection_send_barrier(connection: interop.Pointer | interop.Reference<any>, barrier: () => void): void;

declare function xpc_connection_send_message(connection: interop.Pointer | interop.Reference<any>, message: interop.Pointer | interop.Reference<any>): void;

declare function xpc_connection_send_message_with_reply(connection: interop.Pointer | interop.Reference<any>, message: interop.Pointer | interop.Reference<any>, replyq: interop.Pointer | interop.Reference<any>, handler: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function xpc_connection_send_message_with_reply_sync(connection: interop.Pointer | interop.Reference<any>, message: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_connection_set_context(connection: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>): void;

declare function xpc_connection_set_event_handler(connection: interop.Pointer | interop.Reference<any>, handler: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function xpc_connection_set_finalizer_f(connection: interop.Pointer | interop.Reference<any>, finalizer: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function xpc_connection_set_peer_entitlement_exists_requirement(connection: interop.Pointer | interop.Reference<any>, entitlement: string | interop.Pointer | interop.Reference<any>): number;

declare function xpc_connection_set_peer_entitlement_matches_value_requirement(connection: interop.Pointer | interop.Reference<any>, entitlement: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): number;

declare function xpc_connection_set_peer_lightweight_code_requirement(connection: interop.Pointer | interop.Reference<any>, lwcr: interop.Pointer | interop.Reference<any>): number;

declare function xpc_connection_set_peer_platform_identity_requirement(connection: interop.Pointer | interop.Reference<any>, signing_identifier: string | interop.Pointer | interop.Reference<any>): number;

declare function xpc_connection_set_peer_team_identity_requirement(connection: interop.Pointer | interop.Reference<any>, signing_identifier: string | interop.Pointer | interop.Reference<any>): number;

declare function xpc_connection_set_target_queue(connection: interop.Pointer | interop.Reference<any>, targetq: interop.Pointer | interop.Reference<any>): void;

declare function xpc_connection_suspend(connection: interop.Pointer | interop.Reference<any>): void;

declare function xpc_copy(object: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_copy_description(object: interop.Pointer | interop.Reference<any>): string;

declare function xpc_data_create(bytes: interop.Pointer | interop.Reference<any>, length: number): interop.Pointer | interop.Reference<any>;

declare function xpc_data_create_with_dispatch_data(ddata: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_data_get_bytes(xdata: interop.Pointer | interop.Reference<any>, buffer: interop.Pointer | interop.Reference<any>, off: number, length: number): number;

declare function xpc_data_get_bytes_ptr(xdata: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_data_get_length(xdata: interop.Pointer | interop.Reference<any>): number;

declare function xpc_date_create(interval: number): interop.Pointer | interop.Reference<any>;

declare function xpc_date_create_from_current(): interop.Pointer | interop.Reference<any>;

declare function xpc_date_get_value(xdate: interop.Pointer | interop.Reference<any>): number;

declare function xpc_debugger_api_misuse_info(): string;

declare function xpc_dictionary_apply(xdict: interop.Pointer | interop.Reference<any>, applier: (p1: string, p2: interop.Pointer | interop.Reference<any>) => boolean): boolean;

declare function xpc_dictionary_copy_mach_send(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): number;

declare function xpc_dictionary_create(keys: interop.Pointer | interop.Reference<string>, values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, count: number): interop.Pointer | interop.Reference<any>;

declare function xpc_dictionary_create_connection(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_dictionary_create_empty(): interop.Pointer | interop.Reference<any>;

declare function xpc_dictionary_create_reply(original: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_dictionary_dup_fd(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): number;

declare function xpc_dictionary_get_array(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_dictionary_get_bool(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): boolean;

declare function xpc_dictionary_get_count(xdict: interop.Pointer | interop.Reference<any>): number;

declare function xpc_dictionary_get_data(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, length: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function xpc_dictionary_get_date(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): number;

declare function xpc_dictionary_get_dictionary(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_dictionary_get_double(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): number;

declare function xpc_dictionary_get_int64(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): number;

declare function xpc_dictionary_get_remote_connection(xdict: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_dictionary_get_string(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): string;

declare function xpc_dictionary_get_uint64(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): number;

declare function xpc_dictionary_get_uuid(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): string;

declare function xpc_dictionary_get_value(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_dictionary_set_bool(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: boolean): void;

declare function xpc_dictionary_set_connection(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, connection: interop.Pointer | interop.Reference<any>): void;

declare function xpc_dictionary_set_data(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, bytes: interop.Pointer | interop.Reference<any>, length: number): void;

declare function xpc_dictionary_set_date(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: number): void;

declare function xpc_dictionary_set_double(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: number): void;

declare function xpc_dictionary_set_fd(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, fd: number): void;

declare function xpc_dictionary_set_int64(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: number): void;

declare function xpc_dictionary_set_mach_send(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, p: number): void;

declare function xpc_dictionary_set_string(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, string: string | interop.Pointer | interop.Reference<any>): void;

declare function xpc_dictionary_set_uint64(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: number): void;

declare function xpc_dictionary_set_uuid(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, uuid: interop.Reference<number>): void;

declare function xpc_dictionary_set_value(xdict: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function xpc_double_create(value: number): interop.Pointer | interop.Reference<any>;

declare function xpc_double_get_value(xdouble: interop.Pointer | interop.Reference<any>): number;

declare function xpc_endpoint_create(connection: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_equal(object1: interop.Pointer | interop.Reference<any>, object2: interop.Pointer | interop.Reference<any>): boolean;

declare function xpc_fd_create(fd: number): interop.Pointer | interop.Reference<any>;

declare function xpc_fd_dup(xfd: interop.Pointer | interop.Reference<any>): number;

declare function xpc_get_type(object: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_hash(object: interop.Pointer | interop.Reference<any>): number;

declare function xpc_int64_create(value: number): interop.Pointer | interop.Reference<any>;

declare function xpc_int64_get_value(xint: interop.Pointer | interop.Reference<any>): number;

declare function xpc_null_create(): interop.Pointer | interop.Reference<any>;

declare function xpc_release(object: interop.Pointer | interop.Reference<any>): void;

declare function xpc_retain(object: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_shmem_create(region: interop.Pointer | interop.Reference<any>, length: number): interop.Pointer | interop.Reference<any>;

declare function xpc_shmem_map(xshmem: interop.Pointer | interop.Reference<any>, region: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function xpc_string_create(string: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xpc_string_get_length(xstring: interop.Pointer | interop.Reference<any>): number;

declare function xpc_string_get_string_ptr(xstring: interop.Pointer | interop.Reference<any>): string;

declare function xpc_type_get_name(type: interop.Pointer | interop.Reference<any>): string;

declare function xpc_uint64_create(value: number): interop.Pointer | interop.Reference<any>;

declare function xpc_uint64_get_value(xuint: interop.Pointer | interop.Reference<any>): number;

declare function xpc_uuid_create(uuid: interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function xpc_uuid_get_bytes(xuuid: interop.Pointer | interop.Reference<any>): string;
