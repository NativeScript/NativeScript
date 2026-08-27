
/**
 * @since 10.0
 */
interface OS_os_activity extends NSObjectProtocol {
}
declare var OS_os_activity: {

	prototype: OS_os_activity;
};

interface OS_os_log extends NSObjectProtocol {
}
declare var OS_os_log: {

	prototype: OS_os_log;
};

declare var __dso_handle: mach_header;

/**
 * @since 10.0
 */
declare function _os_activity_create(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, description: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, activity: NSObject & OS_os_activity, flags: os_activity_flag_t): NSObject & OS_os_activity;

/**
 * @since 10.0
 */
declare var _os_activity_current: void;

/**
 * @since 8.0
 */
declare function _os_activity_initiate(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, description: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: os_activity_flag_t, activity_block: () => void): void;

/**
 * @since 8.0
 */
declare function _os_activity_initiate_f(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, description: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: os_activity_flag_t, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

/**
 * @since 10.0
 */
declare function _os_activity_label_useraction(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 10.0
 */
declare var _os_activity_none: void;

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare function _os_activity_set_breadcrumb(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare function _os_activity_start(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, description: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: os_activity_flag_t): NSObject & OS_os_activity;

/**
 * @since 9.0
 */
declare function _os_log_create(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, subsystem: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, category: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): NSObject & OS_os_log;

/**
 * @since 13.0
 */
declare function _os_log_debug_impl(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, log: NSObject & OS_os_log, type: os_log_type_t, format: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

/**
 * @since 9.0
 */
declare var _os_log_default: void;

/**
 * @since 11.0
 */
declare var _os_log_disabled: void;

/**
 * @since 11.0
 */
declare function _os_log_error_impl(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, log: NSObject & OS_os_log, type: os_log_type_t, format: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

/**
 * @since 11.0
 */
declare function _os_log_fault_impl(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, log: NSObject & OS_os_log, type: os_log_type_t, format: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

/**
 * @since 10.0
 */
declare function _os_log_impl(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, log: NSObject & OS_os_log, type: os_log_type_t, format: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

/**
 * @since 12.0
 */
declare function _os_signpost_emit_with_name_impl(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, log: NSObject & OS_os_log, type: os_signpost_type_t, spid: number, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, format: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

/**
 * @since 8.0
 * @deprecated 11.0
 */
declare function _os_trace_with_buffer(dso: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, message: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, type: number, buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buffer_size: number, payload: (p1: NSObject & OS_xpc_object) => void): void;

/**
 * @since 10.0
 */
declare function os_activity_apply(activity: NSObject & OS_os_activity, block: () => void): void;

/**
 * @since 10.0
 */
declare function os_activity_apply_f(activity: NSObject & OS_os_activity, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare function os_activity_end(activity: NSObject & OS_os_activity): void;

declare const enum os_activity_flag_t {

	OS_ACTIVITY_FLAG_DEFAULT = 0,

	OS_ACTIVITY_FLAG_DETACHED = 1,

	OS_ACTIVITY_FLAG_IF_NONE_PRESENT = 2
}

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare function os_activity_get_active(entries: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView, count: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 10.0
 */
declare function os_activity_get_identifier(activity: NSObject & OS_os_activity, parent_id: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function os_activity_scope_enter(activity: NSObject & OS_os_activity, state: interop.Pointer | interop.Reference<os_activity_scope_state_s> | ArrayBufferLike | ArrayBufferView): void;

/**
 * @since 10.0
 */
declare function os_activity_scope_leave(state: interop.Pointer | interop.Reference<os_activity_scope_state_s> | ArrayBufferLike | ArrayBufferView): void;

interface os_activity_scope_state_s {
	opaque: interop.Reference<number>;
}
declare var os_activity_scope_state_s: interop.StructType<os_activity_scope_state_s>;

/**
 * @since 10.0
 */
declare function os_log_create(subsystem: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, category: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): NSObject & OS_os_log;

/**
 * @since 9.0
 * @deprecated 10.0
 */
declare function os_log_is_debug_enabled(log: NSObject & OS_os_log): boolean;

/**
 * @since 9.0
 * @deprecated 10.0
 */
declare function os_log_is_enabled(log: NSObject & OS_os_log): boolean;

/**
 * @since 10.0
 */
declare function os_log_type_enabled(oslog: NSObject & OS_os_log, type: os_log_type_t): boolean;

declare const enum os_log_type_t {

	OS_LOG_TYPE_DEFAULT = 0,

	OS_LOG_TYPE_INFO = 1,

	OS_LOG_TYPE_DEBUG = 2,

	OS_LOG_TYPE_ERROR = 16,

	OS_LOG_TYPE_FAULT = 17
}

/**
 * @since 12.0
 */
declare function os_signpost_enabled(log: NSObject & OS_os_log): boolean;

/**
 * @since 12.0
 */
declare function os_signpost_id_generate(log: NSObject & OS_os_log): number;

/**
 * @since 12.0
 */
declare function os_signpost_id_make_with_pointer(log: NSObject & OS_os_log, ptr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare const enum os_signpost_type_t {

	OS_SIGNPOST_EVENT = 0,

	OS_SIGNPOST_INTERVAL_BEGIN = 1,

	OS_SIGNPOST_INTERVAL_END = 2
}

/**
 * @since 8.0
 * @deprecated 11.0
 */
declare function os_trace_debug_enabled(): boolean;

/**
 * @since 10.0
 * @deprecated 11.0
 */
declare function os_trace_info_enabled(): boolean;
