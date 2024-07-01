
declare const DISPATCH_WALLTIME_NOW: number;

interface OS_dispatch_data extends OS_dispatch_object {
}
declare var OS_dispatch_data: {

	prototype: OS_dispatch_data;
};

interface OS_dispatch_group extends OS_dispatch_object {
}
declare var OS_dispatch_group: {

	prototype: OS_dispatch_group;
};

interface OS_dispatch_io extends OS_dispatch_object {
}
declare var OS_dispatch_io: {

	prototype: OS_dispatch_io;
};

interface OS_dispatch_object extends NSObjectProtocol {
}
declare var OS_dispatch_object: {

	prototype: OS_dispatch_object;
};

interface OS_dispatch_queue extends OS_dispatch_object {
}
declare var OS_dispatch_queue: {

	prototype: OS_dispatch_queue;
};

interface OS_dispatch_queue_attr extends OS_dispatch_object {
}
declare var OS_dispatch_queue_attr: {

	prototype: OS_dispatch_queue_attr;
};

/**
 * @since 12.0
 */
interface OS_dispatch_queue_concurrent extends OS_dispatch_queue {
}
declare var OS_dispatch_queue_concurrent: {

	prototype: OS_dispatch_queue_concurrent;
};

interface OS_dispatch_queue_global extends OS_dispatch_queue {
}
declare var OS_dispatch_queue_global: {

	prototype: OS_dispatch_queue_global;
};

interface OS_dispatch_queue_main extends OS_dispatch_queue_serial {
}
declare var OS_dispatch_queue_main: {

	prototype: OS_dispatch_queue_main;
};

/**
 * @since 12.0
 */
interface OS_dispatch_queue_serial extends OS_dispatch_queue {
}
declare var OS_dispatch_queue_serial: {

	prototype: OS_dispatch_queue_serial;
};

/**
 * @since 17.0
 */
interface OS_dispatch_queue_serial_executor extends OS_dispatch_queue {
}
declare var OS_dispatch_queue_serial_executor: {

	prototype: OS_dispatch_queue_serial_executor;
};

interface OS_dispatch_semaphore extends OS_dispatch_object {
}
declare var OS_dispatch_semaphore: {

	prototype: OS_dispatch_semaphore;
};

interface OS_dispatch_source extends OS_dispatch_object {
}
declare var OS_dispatch_source: {

	prototype: OS_dispatch_source;
};

/**
 * @since 12.0
 */
interface OS_dispatch_workloop extends OS_dispatch_queue {
}
declare var OS_dispatch_workloop: {

	prototype: OS_dispatch_workloop;
};

/**
 * @since 5.0
 */
declare var _dispatch_data_destructor_free: () => void;

/**
 * @since 7.0
 */
declare var _dispatch_data_destructor_munmap: () => void;

/**
 * @since 5.0
 */
declare var _dispatch_data_empty: void;

/**
 * @since 4.0
 */
declare var _dispatch_main_q: void;

/**
 * @since 4.3
 */
declare var _dispatch_queue_attr_concurrent: void;

/**
 * @since 4.0
 */
declare var _dispatch_source_type_data_add: void;

/**
 * @since 4.0
 */
declare var _dispatch_source_type_data_or: void;

/**
 * @since 11.0
 */
declare var _dispatch_source_type_data_replace: void;

/**
 * @since 4.0
 */
declare var _dispatch_source_type_mach_recv: void;

/**
 * @since 4.0
 */
declare var _dispatch_source_type_mach_send: void;

/**
 * @since 8.0
 */
declare var _dispatch_source_type_memorypressure: void;

/**
 * @since 4.0
 */
declare var _dispatch_source_type_proc: void;

/**
 * @since 4.0
 */
declare var _dispatch_source_type_read: void;

/**
 * @since 4.0
 */
declare var _dispatch_source_type_signal: void;

/**
 * @since 4.0
 */
declare var _dispatch_source_type_timer: void;

/**
 * @since 4.0
 */
declare var _dispatch_source_type_vnode: void;

/**
 * @since 4.0
 */
declare var _dispatch_source_type_write: void;

/**
 * @since 10.0
 */
declare function dispatch_activate(object: NSObject & OS_dispatch_object): void;

/**
 * @since 4.0
 */
declare function dispatch_after(when: number, queue: NSObject & OS_dispatch_queue, block: () => void): void;

/**
 * @since 4.0
 */
declare function dispatch_after_f(when: number, queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 17.4
 */
declare function dispatch_allow_send_signals(preserve_signum: number): number;

/**
 * @since 4.0
 */
declare function dispatch_apply(iterations: number, queue: NSObject & OS_dispatch_queue, block: (p1: number) => void): void;

/**
 * @since 4.0
 */
declare function dispatch_apply_f(iterations: number, queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => void>): void;

/**
 * @since 10.0
 */
declare function dispatch_assert_queue(queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 10.0
 */
declare function dispatch_assert_queue_barrier(queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 10.0
 */
declare function dispatch_assert_queue_not(queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 4.0
 */
declare function dispatch_async(queue: NSObject & OS_dispatch_queue, block: () => void): void;

/**
 * @since 12.0
 */
declare function dispatch_async_and_wait(queue: NSObject & OS_dispatch_queue, block: () => void): void;

/**
 * @since 12.0
 */
declare function dispatch_async_and_wait_f(queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 4.0
 */
declare function dispatch_async_f(queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare const enum dispatch_autorelease_frequency_t {

	DISPATCH_AUTORELEASE_FREQUENCY_INHERIT = 0,

	DISPATCH_AUTORELEASE_FREQUENCY_WORK_ITEM = 1,

	DISPATCH_AUTORELEASE_FREQUENCY_NEVER = 2
}

/**
 * @since 4.3
 */
declare function dispatch_barrier_async(queue: NSObject & OS_dispatch_queue, block: () => void): void;

/**
 * @since 12.0
 */
declare function dispatch_barrier_async_and_wait(queue: NSObject & OS_dispatch_queue, block: () => void): void;

/**
 * @since 12.0
 */
declare function dispatch_barrier_async_and_wait_f(queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 4.3
 */
declare function dispatch_barrier_async_f(queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 4.3
 */
declare function dispatch_barrier_sync(queue: NSObject & OS_dispatch_queue, block: () => void): void;

/**
 * @since 4.3
 */
declare function dispatch_barrier_sync_f(queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 8.0
 */
declare function dispatch_block_cancel(block: () => void): void;

/**
 * @since 8.0
 */
declare function dispatch_block_create(flags: dispatch_block_flags_t, block: () => void): () => void;

/**
 * @since 8.0
 */
declare function dispatch_block_create_with_qos_class(flags: dispatch_block_flags_t, qos_class: qos_class_t, relative_priority: number, block: () => void): () => void;

declare const enum dispatch_block_flags_t {

	DISPATCH_BLOCK_BARRIER = 1,

	DISPATCH_BLOCK_DETACHED = 2,

	DISPATCH_BLOCK_ASSIGN_CURRENT = 4,

	DISPATCH_BLOCK_NO_QOS_CLASS = 8,

	DISPATCH_BLOCK_INHERIT_QOS_CLASS = 16,

	DISPATCH_BLOCK_ENFORCE_QOS_CLASS = 32
}

/**
 * @since 8.0
 */
declare function dispatch_block_notify(block: () => void, queue: NSObject & OS_dispatch_queue, notification_block: () => void): void;

/**
 * @since 8.0
 */
declare function dispatch_block_perform(flags: dispatch_block_flags_t, block: () => void): void;

/**
 * @since 8.0
 */
declare function dispatch_block_testcancel(block: () => void): number;

/**
 * @since 8.0
 */
declare function dispatch_block_wait(block: () => void, timeout: number): number;

/**
 * @since 5.0
 */
declare function dispatch_data_apply(data: NSObject & OS_dispatch_data, applier: (p1: NSObject & OS_dispatch_data, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number) => boolean): boolean;

/**
 * @since 5.0
 */
declare function dispatch_data_copy_region(data: NSObject & OS_dispatch_data, location: number, offset_ptr: interop.Pointer | interop.Reference<number>): NSObject & OS_dispatch_data;

/**
 * @since 5.0
 */
declare function dispatch_data_create(buffer: interop.Pointer | interop.Reference<any>, size: number, queue: NSObject & OS_dispatch_queue, destructor: () => void): NSObject & OS_dispatch_data;

/**
 * @since 5.0
 */
declare function dispatch_data_create_concat(data1: NSObject & OS_dispatch_data, data2: NSObject & OS_dispatch_data): NSObject & OS_dispatch_data;

/**
 * @since 5.0
 */
declare function dispatch_data_create_map(data: NSObject & OS_dispatch_data, buffer_ptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, size_ptr: interop.Pointer | interop.Reference<number>): NSObject & OS_dispatch_data;

/**
 * @since 5.0
 */
declare function dispatch_data_create_subrange(data: NSObject & OS_dispatch_data, offset: number, length: number): NSObject & OS_dispatch_data;

/**
 * @since 5.0
 */
declare function dispatch_data_get_size(data: NSObject & OS_dispatch_data): number;

/**
 * @since 4.0
 */
declare function dispatch_get_context(object: NSObject & OS_dispatch_object): interop.Pointer | interop.Reference<any>;

/**
 * @since 4.0
 * @deprecated 6.0
 */
declare function dispatch_get_current_queue(): NSObject & OS_dispatch_queue;

/**
 * @since 4.0
 */
declare function dispatch_get_global_queue(identifier: number, flags: number): NSObject & OS_dispatch_queue_global;

/**
 * @since 5.0
 */
declare function dispatch_get_specific(key: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 4.0
 */
declare function dispatch_group_async(group: NSObject & OS_dispatch_group, queue: NSObject & OS_dispatch_queue, block: () => void): void;

/**
 * @since 4.0
 */
declare function dispatch_group_async_f(group: NSObject & OS_dispatch_group, queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 4.0
 */
declare function dispatch_group_create(): NSObject & OS_dispatch_group;

/**
 * @since 4.0
 */
declare function dispatch_group_enter(group: NSObject & OS_dispatch_group): void;

/**
 * @since 4.0
 */
declare function dispatch_group_leave(group: NSObject & OS_dispatch_group): void;

/**
 * @since 4.0
 */
declare function dispatch_group_notify(group: NSObject & OS_dispatch_group, queue: NSObject & OS_dispatch_queue, block: () => void): void;

/**
 * @since 4.0
 */
declare function dispatch_group_notify_f(group: NSObject & OS_dispatch_group, queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 4.0
 */
declare function dispatch_group_wait(group: NSObject & OS_dispatch_group, timeout: number): number;

/**
 * @since 5.0
 */
declare function dispatch_io_barrier(channel: NSObject & OS_dispatch_io, barrier: () => void): void;

/**
 * @since 5.0
 */
declare function dispatch_io_close(channel: NSObject & OS_dispatch_io, flags: number): void;

/**
 * @since 5.0
 */
declare function dispatch_io_create(type: number, fd: number, queue: NSObject & OS_dispatch_queue, cleanup_handler: (p1: number) => void): NSObject & OS_dispatch_io;

/**
 * @since 5.0
 */
declare function dispatch_io_create_with_io(type: number, io: NSObject & OS_dispatch_io, queue: NSObject & OS_dispatch_queue, cleanup_handler: (p1: number) => void): NSObject & OS_dispatch_io;

/**
 * @since 5.0
 */
declare function dispatch_io_create_with_path(type: number, path: string | interop.Pointer | interop.Reference<any>, oflag: number, mode: number, queue: NSObject & OS_dispatch_queue, cleanup_handler: (p1: number) => void): NSObject & OS_dispatch_io;

/**
 * @since 5.0
 */
declare function dispatch_io_get_descriptor(channel: NSObject & OS_dispatch_io): number;

/**
 * @since 5.0
 */
declare function dispatch_io_read(channel: NSObject & OS_dispatch_io, offset: number, length: number, queue: NSObject & OS_dispatch_queue, io_handler: (p1: boolean, p2: NSObject & OS_dispatch_data, p3: number) => void): void;

/**
 * @since 5.0
 */
declare function dispatch_io_set_high_water(channel: NSObject & OS_dispatch_io, high_water: number): void;

/**
 * @since 5.0
 */
declare function dispatch_io_set_interval(channel: NSObject & OS_dispatch_io, interval: number, flags: number): void;

/**
 * @since 5.0
 */
declare function dispatch_io_set_low_water(channel: NSObject & OS_dispatch_io, low_water: number): void;

/**
 * @since 5.0
 */
declare function dispatch_io_write(channel: NSObject & OS_dispatch_io, offset: number, data: NSObject & OS_dispatch_data, queue: NSObject & OS_dispatch_queue, io_handler: (p1: boolean, p2: NSObject & OS_dispatch_data, p3: number) => void): void;

/**
 * @since 4.0
 */
declare function dispatch_main(): never;

/**
 * @since 4.0
 */
declare function dispatch_once(predicate: interop.Pointer | interop.Reference<number>, block: () => void): void;

/**
 * @since 4.0
 */
declare function dispatch_once_f(predicate: interop.Pointer | interop.Reference<number>, context: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 10.0
 */
declare function dispatch_queue_attr_make_initially_inactive(attr: NSObject & OS_dispatch_queue_attr): NSObject & OS_dispatch_queue_attr;

/**
 * @since 10.0
 */
declare function dispatch_queue_attr_make_with_autorelease_frequency(attr: NSObject & OS_dispatch_queue_attr, frequency: dispatch_autorelease_frequency_t): NSObject & OS_dispatch_queue_attr;

/**
 * @since 8.0
 */
declare function dispatch_queue_attr_make_with_qos_class(attr: NSObject & OS_dispatch_queue_attr, qos_class: qos_class_t, relative_priority: number): NSObject & OS_dispatch_queue_attr;

/**
 * @since 4.0
 */
declare function dispatch_queue_create(label: string | interop.Pointer | interop.Reference<any>, attr: NSObject & OS_dispatch_queue_attr): NSObject & OS_dispatch_queue;

/**
 * @since 10.0
 */
declare function dispatch_queue_create_with_target(label: string | interop.Pointer | interop.Reference<any>, attr: NSObject & OS_dispatch_queue_attr, target: NSObject & OS_dispatch_queue): NSObject & OS_dispatch_queue;

/**
 * @since 4.0
 */
declare function dispatch_queue_get_label(queue: NSObject & OS_dispatch_queue): interop.Pointer | interop.Reference<any>;

/**
 * @since 8.0
 */
declare function dispatch_queue_get_qos_class(queue: NSObject & OS_dispatch_queue, relative_priority_ptr: interop.Pointer | interop.Reference<number>): qos_class_t;

/**
 * @since 5.0
 */
declare function dispatch_queue_get_specific(queue: NSObject & OS_dispatch_queue, key: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 5.0
 */
declare function dispatch_queue_set_specific(queue: NSObject & OS_dispatch_queue, key: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, destructor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 5.0
 */
declare function dispatch_read(fd: number, length: number, queue: NSObject & OS_dispatch_queue, handler: (p1: NSObject & OS_dispatch_data, p2: number) => void): void;

/**
 * @since 4.0
 */
declare function dispatch_release(object: NSObject & OS_dispatch_object): void;

/**
 * @since 4.0
 */
declare function dispatch_resume(object: NSObject & OS_dispatch_object): void;

/**
 * @since 4.0
 */
declare function dispatch_retain(object: NSObject & OS_dispatch_object): void;

/**
 * @since 4.0
 */
declare function dispatch_semaphore_create(value: number): NSObject & OS_dispatch_semaphore;

/**
 * @since 4.0
 */
declare function dispatch_semaphore_signal(dsema: NSObject & OS_dispatch_semaphore): number;

/**
 * @since 4.0
 */
declare function dispatch_semaphore_wait(dsema: NSObject & OS_dispatch_semaphore, timeout: number): number;

/**
 * @since 4.0
 */
declare function dispatch_set_context(object: NSObject & OS_dispatch_object, context: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 4.0
 */
declare function dispatch_set_finalizer_f(object: NSObject & OS_dispatch_object, finalizer: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 12.0
 */
declare function dispatch_set_qos_class_floor(object: NSObject & OS_dispatch_object, qos_class: qos_class_t, relative_priority: number): void;

/**
 * @since 4.0
 */
declare function dispatch_set_target_queue(object: NSObject & OS_dispatch_object, queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 4.0
 */
declare function dispatch_source_cancel(source: NSObject & OS_dispatch_source): void;

/**
 * @since 4.0
 */
declare function dispatch_source_create(type: interop.Pointer | interop.Reference<any>, handle: number, mask: number, queue: NSObject & OS_dispatch_queue): NSObject & OS_dispatch_source;

/**
 * @since 4.0
 */
declare function dispatch_source_get_data(source: NSObject & OS_dispatch_source): number;

/**
 * @since 4.0
 */
declare function dispatch_source_get_handle(source: NSObject & OS_dispatch_source): number;

/**
 * @since 4.0
 */
declare function dispatch_source_get_mask(source: NSObject & OS_dispatch_source): number;

/**
 * @since 4.0
 */
declare function dispatch_source_merge_data(source: NSObject & OS_dispatch_source, value: number): void;

/**
 * @since 4.0
 */
declare function dispatch_source_set_cancel_handler(source: NSObject & OS_dispatch_source, handler: () => void): void;

/**
 * @since 4.0
 */
declare function dispatch_source_set_cancel_handler_f(source: NSObject & OS_dispatch_source, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 4.0
 */
declare function dispatch_source_set_event_handler(source: NSObject & OS_dispatch_source, handler: () => void): void;

/**
 * @since 4.0
 */
declare function dispatch_source_set_event_handler_f(source: NSObject & OS_dispatch_source, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 4.3
 */
declare function dispatch_source_set_registration_handler(source: NSObject & OS_dispatch_source, handler: () => void): void;

/**
 * @since 4.3
 */
declare function dispatch_source_set_registration_handler_f(source: NSObject & OS_dispatch_source, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 4.0
 */
declare function dispatch_source_set_timer(source: NSObject & OS_dispatch_source, start: number, interval: number, leeway: number): void;

/**
 * @since 4.0
 */
declare function dispatch_source_testcancel(source: NSObject & OS_dispatch_source): number;

/**
 * @since 4.0
 */
declare function dispatch_suspend(object: NSObject & OS_dispatch_object): void;

/**
 * @since 4.0
 */
declare function dispatch_sync(queue: NSObject & OS_dispatch_queue, block: () => void): void;

/**
 * @since 4.0
 */
declare function dispatch_sync_f(queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 4.0
 */
declare function dispatch_time(when: number, delta: number): number;

/**
 * @since 4.0
 */
declare function dispatch_walltime(when: interop.Pointer | interop.Reference<timespec>, delta: number): number;

/**
 * @since 12.0
 */
declare function dispatch_workloop_create(label: string | interop.Pointer | interop.Reference<any>): NSObject & OS_dispatch_workloop;

/**
 * @since 12.0
 */
declare function dispatch_workloop_create_inactive(label: string | interop.Pointer | interop.Reference<any>): NSObject & OS_dispatch_workloop;

/**
 * @since 12.0
 */
declare function dispatch_workloop_set_autorelease_frequency(workloop: NSObject & OS_dispatch_workloop, frequency: dispatch_autorelease_frequency_t): void;

/**
 * @since 14.0
 */
declare function dispatch_workloop_set_os_workgroup(workloop: NSObject & OS_dispatch_workloop, workgroup: OS_os_workgroup): void;

/**
 * @since 5.0
 */
declare function dispatch_write(fd: number, data: NSObject & OS_dispatch_data, queue: NSObject & OS_dispatch_queue, handler: (p1: NSObject & OS_dispatch_data, p2: number) => void): void;
