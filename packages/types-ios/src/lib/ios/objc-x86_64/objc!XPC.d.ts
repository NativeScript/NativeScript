
interface OS_xpc_listener extends NSObjectProtocol {
}
declare var OS_xpc_listener: {

	prototype: OS_xpc_listener;
};

interface OS_xpc_object extends NSObjectProtocol {
}
declare var OS_xpc_object: {

	prototype: OS_xpc_object;
};

interface OS_xpc_session extends NSObjectProtocol {
}
declare var OS_xpc_session: {

	prototype: OS_xpc_session;
};

/**
 * @since 7.0
 * @deprecated 7.0
 */
declare var XPC_ACTIVITY_REQUIRE_BATTERY_LEVEL: interop.Pointer | interop.Reference<any>;

/**
 * @since 7.0
 * @deprecated 7.0
 */
declare var XPC_ACTIVITY_REQUIRE_HDD_SPINNING: interop.Pointer | interop.Reference<any>;

declare const XPC_ACTIVITY_STATE_CHECK_IN: number;

declare const XPC_ACTIVITY_STATE_CONTINUE: number;

declare const XPC_ACTIVITY_STATE_DEFER: number;

declare const XPC_ACTIVITY_STATE_DONE: number;

declare const XPC_ACTIVITY_STATE_RUN: number;

declare const XPC_ACTIVITY_STATE_WAIT: number;

/**
 * @since 5.0
 */
declare var _xpc_bool_false: void;

/**
 * @since 5.0
 */
declare var _xpc_bool_true: void;

/**
 * @since 5.0
 */
declare var _xpc_error_connection_interrupted: void;

/**
 * @since 5.0
 */
declare var _xpc_error_connection_invalid: void;

/**
 * @since 5.0
 */
declare var _xpc_error_key_description: interop.Pointer | interop.Reference<any>;

declare var _xpc_error_peer_code_signing_requirement: void;

/**
 * @since 5.0
 */
declare var _xpc_error_termination_imminent: void;

/**
 * @since 5.0
 */
declare var _xpc_event_key_name: interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare var _xpc_type_array: void;

/**
 * @since 5.0
 */
declare var _xpc_type_bool: void;

/**
 * @since 5.0
 */
declare var _xpc_type_connection: void;

/**
 * @since 5.0
 */
declare var _xpc_type_data: void;

/**
 * @since 5.0
 */
declare var _xpc_type_date: void;

/**
 * @since 5.0
 */
declare var _xpc_type_dictionary: void;

/**
 * @since 5.0
 */
declare var _xpc_type_double: void;

/**
 * @since 5.0
 */
declare var _xpc_type_endpoint: void;

/**
 * @since 5.0
 */
declare var _xpc_type_error: void;

/**
 * @since 5.0
 */
declare var _xpc_type_fd: void;

/**
 * @since 5.0
 */
declare var _xpc_type_int64: void;

/**
 * @since 5.0
 */
declare var _xpc_type_null: void;

declare var _xpc_type_rich_error: void;

declare var _xpc_type_session: void;

/**
 * @since 5.0
 */
declare var _xpc_type_shmem: void;

/**
 * @since 5.0
 */
declare var _xpc_type_string: void;

/**
 * @since 5.0
 */
declare var _xpc_type_uint64: void;

/**
 * @since 5.0
 */
declare var _xpc_type_uuid: void;

/**
 * @since 5.0
 */
declare function xpc_array_append_value(xarray: NSObject & OS_xpc_object, value: NSObject & OS_xpc_object): void;

/**
 * @since 5.0
 */
declare function xpc_array_apply(xarray: NSObject & OS_xpc_object, applier: (p1: number, p2: NSObject & OS_xpc_object) => boolean): boolean;

/**
 * @since 5.0
 */
declare function xpc_array_create(objects: interop.Pointer | interop.Reference<NSObject & OS_xpc_object>, count: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_array_create_connection(xarray: NSObject & OS_xpc_object, index: number): NSObject & OS_xpc_object;

/**
 * @since 14.0
 */
declare function xpc_array_create_empty(): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_array_dup_fd(xarray: NSObject & OS_xpc_object, index: number): number;

/**
 * @since 9.0
 */
declare function xpc_array_get_array(xarray: NSObject & OS_xpc_object, index: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_array_get_bool(xarray: NSObject & OS_xpc_object, index: number): boolean;

/**
 * @since 5.0
 */
declare function xpc_array_get_count(xarray: NSObject & OS_xpc_object): number;

/**
 * @since 5.0
 */
declare function xpc_array_get_data(xarray: NSObject & OS_xpc_object, index: number, length: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_array_get_date(xarray: NSObject & OS_xpc_object, index: number): number;

/**
 * @since 9.0
 */
declare function xpc_array_get_dictionary(xarray: NSObject & OS_xpc_object, index: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_array_get_double(xarray: NSObject & OS_xpc_object, index: number): number;

/**
 * @since 5.0
 */
declare function xpc_array_get_int64(xarray: NSObject & OS_xpc_object, index: number): number;

/**
 * @since 5.0
 */
declare function xpc_array_get_string(xarray: NSObject & OS_xpc_object, index: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_array_get_uint64(xarray: NSObject & OS_xpc_object, index: number): number;

/**
 * @since 5.0
 */
declare function xpc_array_get_uuid(xarray: NSObject & OS_xpc_object, index: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_array_get_value(xarray: NSObject & OS_xpc_object, index: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_array_set_bool(xarray: NSObject & OS_xpc_object, index: number, value: boolean): void;

/**
 * @since 5.0
 */
declare function xpc_array_set_connection(xarray: NSObject & OS_xpc_object, index: number, connection: NSObject & OS_xpc_object): void;

/**
 * @since 5.0
 */
declare function xpc_array_set_data(xarray: NSObject & OS_xpc_object, index: number, bytes: interop.Pointer | interop.Reference<any>, length: number): void;

/**
 * @since 5.0
 */
declare function xpc_array_set_date(xarray: NSObject & OS_xpc_object, index: number, value: number): void;

/**
 * @since 5.0
 */
declare function xpc_array_set_double(xarray: NSObject & OS_xpc_object, index: number, value: number): void;

/**
 * @since 5.0
 */
declare function xpc_array_set_fd(xarray: NSObject & OS_xpc_object, index: number, fd: number): void;

/**
 * @since 5.0
 */
declare function xpc_array_set_int64(xarray: NSObject & OS_xpc_object, index: number, value: number): void;

/**
 * @since 5.0
 */
declare function xpc_array_set_string(xarray: NSObject & OS_xpc_object, index: number, string: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 */
declare function xpc_array_set_uint64(xarray: NSObject & OS_xpc_object, index: number, value: number): void;

/**
 * @since 5.0
 */
declare function xpc_array_set_uuid(xarray: NSObject & OS_xpc_object, index: number, uuid: interop.Reference<number>): void;

/**
 * @since 5.0
 */
declare function xpc_array_set_value(xarray: NSObject & OS_xpc_object, index: number, value: NSObject & OS_xpc_object): void;

/**
 * @since 5.0
 */
declare function xpc_bool_create(value: boolean): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_bool_get_value(xbool: NSObject & OS_xpc_object): boolean;

/**
 * @since 10.0
 */
declare function xpc_connection_activate(connection: NSObject & OS_xpc_object): void;

/**
 * @since 5.0
 */
declare function xpc_connection_cancel(connection: NSObject & OS_xpc_object): void;

/**
 * @since 15.0
 */
declare function xpc_connection_copy_invalidation_reason(connection: NSObject & OS_xpc_object): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_connection_create(name: string | interop.Pointer | interop.Reference<any>, targetq: NSObject & OS_dispatch_queue): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_connection_create_from_endpoint(endpoint: NSObject & OS_xpc_object): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_connection_get_context(connection: NSObject & OS_xpc_object): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_connection_get_egid(connection: NSObject & OS_xpc_object): number;

/**
 * @since 5.0
 */
declare function xpc_connection_get_euid(connection: NSObject & OS_xpc_object): number;

/**
 * @since 5.0
 */
declare function xpc_connection_get_name(connection: NSObject & OS_xpc_object): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_connection_resume(connection: NSObject & OS_xpc_object): void;

/**
 * @since 5.0
 */
declare function xpc_connection_send_barrier(connection: NSObject & OS_xpc_object, barrier: () => void): void;

/**
 * @since 5.0
 */
declare function xpc_connection_send_message(connection: NSObject & OS_xpc_object, message: NSObject & OS_xpc_object): void;

/**
 * @since 5.0
 */
declare function xpc_connection_send_message_with_reply(connection: NSObject & OS_xpc_object, message: NSObject & OS_xpc_object, replyq: NSObject & OS_dispatch_queue, handler: (p1: NSObject & OS_xpc_object) => void): void;

/**
 * @since 5.0
 */
declare function xpc_connection_send_message_with_reply_sync(connection: NSObject & OS_xpc_object, message: NSObject & OS_xpc_object): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_connection_set_context(connection: NSObject & OS_xpc_object, context: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 */
declare function xpc_connection_set_event_handler(connection: NSObject & OS_xpc_object, handler: (p1: NSObject & OS_xpc_object) => void): void;

/**
 * @since 5.0
 */
declare function xpc_connection_set_finalizer_f(connection: NSObject & OS_xpc_object, finalizer: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 17.4
 */
declare function xpc_connection_set_peer_entitlement_exists_requirement(connection: NSObject & OS_xpc_object, entitlement: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.4
 */
declare function xpc_connection_set_peer_entitlement_matches_value_requirement(connection: NSObject & OS_xpc_object, entitlement: string | interop.Pointer | interop.Reference<any>, value: NSObject & OS_xpc_object): number;

/**
 * @since 17.4
 */
declare function xpc_connection_set_peer_lightweight_code_requirement(connection: NSObject & OS_xpc_object, lwcr: NSObject & OS_xpc_object): number;

/**
 * @since 17.4
 */
declare function xpc_connection_set_peer_platform_identity_requirement(connection: NSObject & OS_xpc_object, signing_identifier: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.4
 */
declare function xpc_connection_set_peer_team_identity_requirement(connection: NSObject & OS_xpc_object, signing_identifier: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function xpc_connection_set_target_queue(connection: NSObject & OS_xpc_object, targetq: NSObject & OS_dispatch_queue): void;

/**
 * @since 5.0
 */
declare function xpc_connection_suspend(connection: NSObject & OS_xpc_object): void;

/**
 * @since 5.0
 */
declare function xpc_copy(object: NSObject & OS_xpc_object): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_copy_description(object: NSObject & OS_xpc_object): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_data_create(bytes: interop.Pointer | interop.Reference<any>, length: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_data_create_with_dispatch_data(ddata: NSObject & OS_dispatch_data): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_data_get_bytes(xdata: NSObject & OS_xpc_object, buffer: interop.Pointer | interop.Reference<any>, off: number, length: number): number;

/**
 * @since 5.0
 */
declare function xpc_data_get_bytes_ptr(xdata: NSObject & OS_xpc_object): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_data_get_length(xdata: NSObject & OS_xpc_object): number;

/**
 * @since 5.0
 */
declare function xpc_date_create(interval: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_date_create_from_current(): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_date_get_value(xdate: NSObject & OS_xpc_object): number;

declare function xpc_debugger_api_misuse_info(): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_dictionary_apply(xdict: NSObject & OS_xpc_object, applier: (p1: interop.Pointer | interop.Reference<any>, p2: NSObject & OS_xpc_object) => boolean): boolean;

/**
 * @since 5.0
 */
declare function xpc_dictionary_copy_mach_send(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function xpc_dictionary_create(keys: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, values: interop.Pointer | interop.Reference<NSObject & OS_xpc_object>, count: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_dictionary_create_connection(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): NSObject & OS_xpc_object;

/**
 * @since 14.0
 */
declare function xpc_dictionary_create_empty(): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_dictionary_create_reply(original: NSObject & OS_xpc_object): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_dictionary_dup_fd(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 9.0
 */
declare function xpc_dictionary_get_array(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_bool(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): boolean;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_count(xdict: NSObject & OS_xpc_object): number;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_data(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, length: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_date(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 9.0
 */
declare function xpc_dictionary_get_dictionary(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_double(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_int64(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_remote_connection(xdict: NSObject & OS_xpc_object): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_string(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_uint64(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_uuid(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_dictionary_get_value(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_bool(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, value: boolean): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_connection(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, connection: NSObject & OS_xpc_object): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_data(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, bytes: interop.Pointer | interop.Reference<any>, length: number): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_date(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, value: number): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_double(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, value: number): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_fd(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, fd: number): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_int64(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, value: number): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_mach_send(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, p: number): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_string(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, string: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_uint64(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, value: number): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_uuid(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, uuid: interop.Reference<number>): void;

/**
 * @since 5.0
 */
declare function xpc_dictionary_set_value(xdict: NSObject & OS_xpc_object, key: string | interop.Pointer | interop.Reference<any>, value: NSObject & OS_xpc_object): void;

/**
 * @since 5.0
 */
declare function xpc_double_create(value: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_double_get_value(xdouble: NSObject & OS_xpc_object): number;

/**
 * @since 5.0
 */
declare function xpc_endpoint_create(connection: NSObject & OS_xpc_object): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_equal(object1: NSObject & OS_xpc_object, object2: NSObject & OS_xpc_object): boolean;

/**
 * @since 5.0
 */
declare function xpc_fd_create(fd: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_fd_dup(xfd: NSObject & OS_xpc_object): number;

/**
 * @since 5.0
 */
declare function xpc_get_type(object: NSObject & OS_xpc_object): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_hash(object: NSObject & OS_xpc_object): number;

/**
 * @since 5.0
 */
declare function xpc_int64_create(value: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_int64_get_value(xint: NSObject & OS_xpc_object): number;

declare const enum xpc_listener_create_flags_t {

	XPC_LISTENER_CREATE_NONE = 0,

	XPC_LISTENER_CREATE_INACTIVE = 1,

	XPC_LISTENER_CREATE_FORCE_MACH = 2,

	XPC_LISTENER_CREATE_FORCE_XPCSERVICE = 4
}

/**
 * @since 5.0
 */
declare function xpc_null_create(): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_release(object: NSObject & OS_xpc_object): void;

/**
 * @since 5.0
 */
declare function xpc_retain(object: NSObject & OS_xpc_object): NSObject & OS_xpc_object;

declare function xpc_rich_error_can_retry(error: NSObject & OS_xpc_object): boolean;

declare function xpc_rich_error_copy_description(error: NSObject & OS_xpc_object): interop.Pointer | interop.Reference<any>;

/**
 * @since 16.0
 */
declare function xpc_session_activate(session: NSObject & OS_xpc_session, error_out: interop.Pointer | interop.Reference<NSObject & OS_xpc_object>): boolean;

/**
 * @since 16.0
 */
declare function xpc_session_cancel(session: NSObject & OS_xpc_session): void;

/**
 * @since 16.0
 */
declare function xpc_session_copy_description(session: NSObject & OS_xpc_session): interop.Pointer | interop.Reference<any>;

declare const enum xpc_session_create_flags_t {

	XPC_SESSION_CREATE_NONE = 0,

	XPC_SESSION_CREATE_INACTIVE = 1,

	XPC_SESSION_CREATE_MACH_PRIVILEGED = 2
}

/**
 * @since 16.0
 */
declare function xpc_session_send_message(session: NSObject & OS_xpc_session, message: NSObject & OS_xpc_object): NSObject & OS_xpc_object;

/**
 * @since 16.0
 */
declare function xpc_session_send_message_with_reply_async(session: NSObject & OS_xpc_session, message: NSObject & OS_xpc_object, reply_handler: (p1: NSObject & OS_xpc_object, p2: NSObject & OS_xpc_object) => void): void;

/**
 * @since 16.0
 */
declare function xpc_session_send_message_with_reply_sync(session: NSObject & OS_xpc_session, message: NSObject & OS_xpc_object, error_out: interop.Pointer | interop.Reference<NSObject & OS_xpc_object>): NSObject & OS_xpc_object;

/**
 * @since 16.0
 */
declare function xpc_session_set_cancel_handler(session: NSObject & OS_xpc_session, cancel_handler: (p1: NSObject & OS_xpc_object) => void): void;

/**
 * @since 16.0
 */
declare function xpc_session_set_incoming_message_handler(session: NSObject & OS_xpc_session, handler: (p1: NSObject & OS_xpc_object) => void): void;

/**
 * @since 17.0
 */
declare function xpc_session_set_target_queue(session: NSObject & OS_xpc_session, target_queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 5.0
 */
declare function xpc_shmem_create(region: interop.Pointer | interop.Reference<any>, length: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_shmem_map(xshmem: NSObject & OS_xpc_object, region: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 */
declare function xpc_string_create(string: string | interop.Pointer | interop.Reference<any>): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_string_get_length(xstring: NSObject & OS_xpc_object): number;

/**
 * @since 5.0
 */
declare function xpc_string_get_string_ptr(xstring: NSObject & OS_xpc_object): interop.Pointer | interop.Reference<any>;

/**
 * @since 13.0
 */
declare function xpc_type_get_name(type: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function xpc_uint64_create(value: number): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_uint64_get_value(xuint: NSObject & OS_xpc_object): number;

/**
 * @since 5.0
 */
declare function xpc_uuid_create(uuid: interop.Reference<number>): NSObject & OS_xpc_object;

/**
 * @since 5.0
 */
declare function xpc_uuid_get_bytes(xuuid: NSObject & OS_xpc_object): interop.Pointer | interop.Reference<any>;
