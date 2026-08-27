
declare function notify_cancel(token: number): number;

declare function notify_check(token: number, check: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 2.0
 */
declare function notify_get_state(token: number, state64: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.0
 */
declare function notify_is_valid_token(val: number): boolean;

declare function notify_post(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function notify_register_check(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, out_token: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 3.2
 */
declare function notify_register_dispatch(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, out_token: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, queue: NSObject & OS_dispatch_queue, handler: (p1: number) => void): number;

declare function notify_register_file_descriptor(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, notify_fd: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, flags: number, out_token: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function notify_register_mach_port(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, notify_port: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, flags: number, out_token: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function notify_register_signal(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, sig: number, out_token: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 4.0
 */
declare function notify_resume(token: number): number;

/**
 * @since 2.0
 */
declare function notify_set_state(token: number, state64: number): number;

/**
 * @since 4.0
 */
declare function notify_suspend(token: number): number;
