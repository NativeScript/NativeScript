
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

declare function _os_activity_create(dso: interop.Pointer | interop.Reference<any>, description: string | interop.Pointer | interop.Reference<any>, activity: NSObject, flags: os_activity_flag_t): NSObject;

declare var _os_activity_current: void;

declare function _os_activity_initiate(dso: interop.Pointer | interop.Reference<any>, description: string | interop.Pointer | interop.Reference<any>, flags: os_activity_flag_t, activity_block: () => void): void;

declare function _os_activity_initiate_f(dso: interop.Pointer | interop.Reference<any>, description: string | interop.Pointer | interop.Reference<any>, flags: os_activity_flag_t, context: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function _os_activity_label_useraction(dso: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): void;

declare var _os_activity_none: void;

declare function _os_activity_set_breadcrumb(dso: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function _os_activity_start(dso: interop.Pointer | interop.Reference<any>, description: string | interop.Pointer | interop.Reference<any>, flags: os_activity_flag_t): NSObject;

declare function _os_log_create(dso: interop.Pointer | interop.Reference<any>, subsystem: string | interop.Pointer | interop.Reference<any>, category: string | interop.Pointer | interop.Reference<any>): NSObject;

declare function _os_log_debug_impl(dso: interop.Pointer | interop.Reference<any>, log: NSObject, type: os_log_type_t, format: string | interop.Pointer | interop.Reference<any>, buf: string | interop.Pointer | interop.Reference<any>, size: number): void;

declare var _os_log_default: void;

declare var _os_log_disabled: void;

declare function _os_log_error_impl(dso: interop.Pointer | interop.Reference<any>, log: NSObject, type: os_log_type_t, format: string | interop.Pointer | interop.Reference<any>, buf: string | interop.Pointer | interop.Reference<any>, size: number): void;

declare function _os_log_fault_impl(dso: interop.Pointer | interop.Reference<any>, log: NSObject, type: os_log_type_t, format: string | interop.Pointer | interop.Reference<any>, buf: string | interop.Pointer | interop.Reference<any>, size: number): void;

declare function _os_log_impl(dso: interop.Pointer | interop.Reference<any>, log: NSObject, type: os_log_type_t, format: string | interop.Pointer | interop.Reference<any>, buf: string | interop.Pointer | interop.Reference<any>, size: number): void;

declare function _os_signpost_emit_with_name_impl(dso: interop.Pointer | interop.Reference<any>, log: NSObject, type: os_signpost_type_t, spid: number, name: string | interop.Pointer | interop.Reference<any>, format: string | interop.Pointer | interop.Reference<any>, buf: string | interop.Pointer | interop.Reference<any>, size: number): void;

declare function _os_trace_with_buffer(dso: interop.Pointer | interop.Reference<any>, message: string | interop.Pointer | interop.Reference<any>, type: number, buffer: interop.Pointer | interop.Reference<any>, buffer_size: number, payload: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function os_activity_apply(activity: NSObject, block: () => void): void;

declare function os_activity_apply_f(activity: NSObject, context: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function os_activity_end(activity: NSObject): void;

declare const enum os_activity_flag_t {

	OS_ACTIVITY_FLAG_DEFAULT = 0,

	OS_ACTIVITY_FLAG_DETACHED = 1,

	OS_ACTIVITY_FLAG_IF_NONE_PRESENT = 2
}

declare function os_activity_get_active(entries: interop.Pointer | interop.Reference<number>, count: interop.Pointer | interop.Reference<number>): number;

declare function os_activity_get_identifier(activity: NSObject, parent_id: interop.Pointer | interop.Reference<number>): number;

declare function os_activity_scope_enter(activity: NSObject, state: interop.Pointer | interop.Reference<os_activity_scope_state_s>): void;

declare function os_activity_scope_leave(state: interop.Pointer | interop.Reference<os_activity_scope_state_s>): void;

interface os_activity_scope_state_s {
	opaque: interop.Reference<number>;
}
declare var os_activity_scope_state_s: interop.StructType<os_activity_scope_state_s>;

declare function os_log_create(subsystem: string | interop.Pointer | interop.Reference<any>, category: string | interop.Pointer | interop.Reference<any>): NSObject;

declare function os_log_is_debug_enabled(log: NSObject): boolean;

declare function os_log_is_enabled(log: NSObject): boolean;

declare function os_log_type_enabled(oslog: NSObject, type: os_log_type_t): boolean;

declare const enum os_log_type_t {

	OS_LOG_TYPE_DEFAULT = 0,

	OS_LOG_TYPE_INFO = 1,

	OS_LOG_TYPE_DEBUG = 2,

	OS_LOG_TYPE_ERROR = 16,

	OS_LOG_TYPE_FAULT = 17
}

declare function os_signpost_enabled(log: NSObject): boolean;

declare function os_signpost_id_generate(log: NSObject): number;

declare function os_signpost_id_make_with_pointer(log: NSObject, ptr: interop.Pointer | interop.Reference<any>): number;

declare const enum os_signpost_type_t {

	OS_SIGNPOST_EVENT = 0,

	OS_SIGNPOST_INTERVAL_BEGIN = 1,

	OS_SIGNPOST_INTERVAL_END = 2
}

declare function os_trace_debug_enabled(): boolean;

declare function os_trace_info_enabled(): boolean;
