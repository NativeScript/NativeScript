
declare var OS_ACTIVITY_FLAG_DEFAULT: number;

declare var OS_ACTIVITY_FLAG_DETACHED: number;

declare var __dso_handle: interop.Pointer;

declare function _os_activity_initiate(dso: interop.Pointer, description: string, flags: number, activity_block: () => void): void;

declare function _os_activity_initiate_f(dso: interop.Pointer, description: string, flags: number, context: interop.Pointer, activity_func: interop.FunctionReference<(p1: interop.Pointer) => void>): void;

declare function _os_activity_set_breadcrumb(dso: interop.Pointer, name: string): void;

declare function _os_activity_start(dso: interop.Pointer, description: string, flags: number): number;

declare function os_activity_end(activity_id: number): void;

declare function os_activity_get_active(entries: interop.Reference<number>, count: interop.Reference<number>): number;

declare function os_release(object: interop.Pointer): void;

declare function os_retain(object: interop.Pointer): interop.Pointer;
