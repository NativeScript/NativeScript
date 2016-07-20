
declare var OS_ACTIVITY_FLAG_DEFAULT: number;

declare var OS_ACTIVITY_FLAG_DETACHED: number;

declare var __dso_handle: interop.Pointer | interop.Reference<any>;

declare function _os_activity_initiate(dso: interop.Pointer | interop.Reference<any>, description: string, flags: number, activity_block: () => void): void;

declare function _os_activity_initiate_f(dso: interop.Pointer | interop.Reference<any>, description: string, flags: number, context: interop.Pointer | interop.Reference<any>, activity_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function _os_activity_set_breadcrumb(dso: interop.Pointer | interop.Reference<any>, name: string): void;

declare function _os_activity_start(dso: interop.Pointer | interop.Reference<any>, description: string, flags: number): number;

declare function os_activity_end(activity_id: number): void;

declare function os_activity_get_active(entries: interop.Pointer | interop.Reference<number>, count: interop.Pointer | interop.Reference<number>): number;

declare function os_release(object: interop.Pointer | interop.Reference<any>): void;

declare function os_retain(object: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;
