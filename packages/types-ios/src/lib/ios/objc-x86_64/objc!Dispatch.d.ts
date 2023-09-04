
declare const DISPATCH_WALLTIME_NOW: number;

declare var _dispatch_data_destructor_free: () => void;

declare var _dispatch_data_destructor_munmap: () => void;

declare var _dispatch_data_empty: void;

declare var _dispatch_main_q: void;

declare var _dispatch_queue_attr_concurrent: void;

declare var _dispatch_source_type_data_add: void;

declare var _dispatch_source_type_data_or: void;

declare var _dispatch_source_type_data_replace: void;

declare var _dispatch_source_type_mach_recv: void;

declare var _dispatch_source_type_mach_send: void;

declare var _dispatch_source_type_memorypressure: void;

declare var _dispatch_source_type_proc: void;

declare var _dispatch_source_type_read: void;

declare var _dispatch_source_type_signal: void;

declare var _dispatch_source_type_timer: void;

declare var _dispatch_source_type_vnode: void;

declare var _dispatch_source_type_write: void;

declare function dispatch_after(when: number, queue: interop.Pointer | interop.Reference<any>, block: () => void): void;

declare function dispatch_after_f(when: number, queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_apply(iterations: number, queue: interop.Pointer | interop.Reference<any>, block: (p1: number) => void): void;

declare function dispatch_apply_f(iterations: number, queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => void>): void;

declare function dispatch_assert_queue(queue: interop.Pointer | interop.Reference<any>): void;

declare function dispatch_assert_queue_barrier(queue: interop.Pointer | interop.Reference<any>): void;

declare function dispatch_assert_queue_not(queue: interop.Pointer | interop.Reference<any>): void;

declare function dispatch_async(queue: interop.Pointer | interop.Reference<any>, block: () => void): void;

declare function dispatch_async_and_wait(queue: interop.Pointer | interop.Reference<any>, block: () => void): void;

declare function dispatch_async_and_wait_f(queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_async_f(queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare const enum dispatch_autorelease_frequency_t {

	DISPATCH_AUTORELEASE_FREQUENCY_INHERIT = 0,

	DISPATCH_AUTORELEASE_FREQUENCY_WORK_ITEM = 1,

	DISPATCH_AUTORELEASE_FREQUENCY_NEVER = 2
}

declare function dispatch_barrier_async(queue: interop.Pointer | interop.Reference<any>, block: () => void): void;

declare function dispatch_barrier_async_and_wait(queue: interop.Pointer | interop.Reference<any>, block: () => void): void;

declare function dispatch_barrier_async_and_wait_f(queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_barrier_async_f(queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_barrier_sync(queue: interop.Pointer | interop.Reference<any>, block: () => void): void;

declare function dispatch_barrier_sync_f(queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_block_cancel(block: () => void): void;

declare function dispatch_block_create(flags: dispatch_block_flags_t, block: () => void): () => void;

declare function dispatch_block_create_with_qos_class(flags: dispatch_block_flags_t, qos_class: qos_class_t, relative_priority: number, block: () => void): () => void;

declare const enum dispatch_block_flags_t {

	DISPATCH_BLOCK_BARRIER = 1,

	DISPATCH_BLOCK_DETACHED = 2,

	DISPATCH_BLOCK_ASSIGN_CURRENT = 4,

	DISPATCH_BLOCK_NO_QOS_CLASS = 8,

	DISPATCH_BLOCK_INHERIT_QOS_CLASS = 16,

	DISPATCH_BLOCK_ENFORCE_QOS_CLASS = 32
}

declare function dispatch_block_notify(block: () => void, queue: interop.Pointer | interop.Reference<any>, notification_block: () => void): void;

declare function dispatch_block_perform(flags: dispatch_block_flags_t, block: () => void): void;

declare function dispatch_block_testcancel(block: () => void): number;

declare function dispatch_block_wait(block: () => void, timeout: number): number;

declare function dispatch_data_apply(data: interop.Pointer | interop.Reference<any>, applier: (p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number) => boolean): boolean;

declare function dispatch_data_copy_region(data: interop.Pointer | interop.Reference<any>, location: number, offset_ptr: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function dispatch_data_create(buffer: interop.Pointer | interop.Reference<any>, size: number, queue: interop.Pointer | interop.Reference<any>, destructor: () => void): interop.Pointer | interop.Reference<any>;

declare function dispatch_data_create_concat(data1: interop.Pointer | interop.Reference<any>, data2: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function dispatch_data_create_map(data: interop.Pointer | interop.Reference<any>, buffer_ptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, size_ptr: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function dispatch_data_create_subrange(data: interop.Pointer | interop.Reference<any>, offset: number, length: number): interop.Pointer | interop.Reference<any>;

declare function dispatch_data_get_size(data: interop.Pointer | interop.Reference<any>): number;

declare function dispatch_get_current_queue(): interop.Pointer | interop.Reference<any>;

declare function dispatch_get_global_queue(identifier: number, flags: number): interop.Pointer | interop.Reference<any>;

declare function dispatch_get_specific(key: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function dispatch_group_async(group: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>, block: () => void): void;

declare function dispatch_group_async_f(group: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_group_create(): interop.Pointer | interop.Reference<any>;

declare function dispatch_group_enter(group: interop.Pointer | interop.Reference<any>): void;

declare function dispatch_group_leave(group: interop.Pointer | interop.Reference<any>): void;

declare function dispatch_group_notify(group: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>, block: () => void): void;

declare function dispatch_group_notify_f(group: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_group_wait(group: interop.Pointer | interop.Reference<any>, timeout: number): number;

declare function dispatch_io_barrier(channel: interop.Pointer | interop.Reference<any>, barrier: () => void): void;

declare function dispatch_io_close(channel: interop.Pointer | interop.Reference<any>, flags: number): void;

declare function dispatch_io_create(type: number, fd: number, queue: interop.Pointer | interop.Reference<any>, cleanup_handler: (p1: number) => void): interop.Pointer | interop.Reference<any>;

declare function dispatch_io_create_with_io(type: number, io: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>, cleanup_handler: (p1: number) => void): interop.Pointer | interop.Reference<any>;

declare function dispatch_io_create_with_path(type: number, path: string | interop.Pointer | interop.Reference<any>, oflag: number, mode: number, queue: interop.Pointer | interop.Reference<any>, cleanup_handler: (p1: number) => void): interop.Pointer | interop.Reference<any>;

declare function dispatch_io_get_descriptor(channel: interop.Pointer | interop.Reference<any>): number;

declare function dispatch_io_read(channel: interop.Pointer | interop.Reference<any>, offset: number, length: number, queue: interop.Pointer | interop.Reference<any>, io_handler: (p1: boolean, p2: interop.Pointer | interop.Reference<any>, p3: number) => void): void;

declare function dispatch_io_set_high_water(channel: interop.Pointer | interop.Reference<any>, high_water: number): void;

declare function dispatch_io_set_interval(channel: interop.Pointer | interop.Reference<any>, interval: number, flags: number): void;

declare function dispatch_io_set_low_water(channel: interop.Pointer | interop.Reference<any>, low_water: number): void;

declare function dispatch_io_write(channel: interop.Pointer | interop.Reference<any>, offset: number, data: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>, io_handler: (p1: boolean, p2: interop.Pointer | interop.Reference<any>, p3: number) => void): void;

declare function dispatch_main(): never;

declare function dispatch_once(predicate: interop.Pointer | interop.Reference<number>, block: () => void): void;

declare function dispatch_once_f(predicate: interop.Pointer | interop.Reference<number>, context: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_queue_attr_make_initially_inactive(attr: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function dispatch_queue_attr_make_with_autorelease_frequency(attr: interop.Pointer | interop.Reference<any>, frequency: dispatch_autorelease_frequency_t): interop.Pointer | interop.Reference<any>;

declare function dispatch_queue_attr_make_with_qos_class(attr: interop.Pointer | interop.Reference<any>, qos_class: qos_class_t, relative_priority: number): interop.Pointer | interop.Reference<any>;

declare function dispatch_queue_create(label: string | interop.Pointer | interop.Reference<any>, attr: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function dispatch_queue_create_with_target(label: string | interop.Pointer | interop.Reference<any>, attr: interop.Pointer | interop.Reference<any>, target: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function dispatch_queue_get_label(queue: interop.Pointer | interop.Reference<any>): string;

declare function dispatch_queue_get_qos_class(queue: interop.Pointer | interop.Reference<any>, relative_priority_ptr: interop.Pointer | interop.Reference<number>): qos_class_t;

declare function dispatch_queue_get_specific(queue: interop.Pointer | interop.Reference<any>, key: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function dispatch_queue_set_specific(queue: interop.Pointer | interop.Reference<any>, key: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, destructor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_read(fd: number, length: number, queue: interop.Pointer | interop.Reference<any>, handler: (p1: interop.Pointer | interop.Reference<any>, p2: number) => void): void;

declare function dispatch_semaphore_create(value: number): interop.Pointer | interop.Reference<any>;

declare function dispatch_semaphore_signal(dsema: interop.Pointer | interop.Reference<any>): number;

declare function dispatch_semaphore_wait(dsema: interop.Pointer | interop.Reference<any>, timeout: number): number;

declare function dispatch_source_cancel(source: interop.Pointer | interop.Reference<any>): void;

declare function dispatch_source_create(type: interop.Pointer | interop.Reference<any>, handle: number, mask: number, queue: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function dispatch_source_get_data(source: interop.Pointer | interop.Reference<any>): number;

declare function dispatch_source_get_handle(source: interop.Pointer | interop.Reference<any>): number;

declare function dispatch_source_get_mask(source: interop.Pointer | interop.Reference<any>): number;

declare function dispatch_source_merge_data(source: interop.Pointer | interop.Reference<any>, value: number): void;

declare function dispatch_source_set_cancel_handler(source: interop.Pointer | interop.Reference<any>, handler: () => void): void;

declare function dispatch_source_set_cancel_handler_f(source: interop.Pointer | interop.Reference<any>, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_source_set_event_handler(source: interop.Pointer | interop.Reference<any>, handler: () => void): void;

declare function dispatch_source_set_event_handler_f(source: interop.Pointer | interop.Reference<any>, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_source_set_registration_handler(source: interop.Pointer | interop.Reference<any>, handler: () => void): void;

declare function dispatch_source_set_registration_handler_f(source: interop.Pointer | interop.Reference<any>, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_source_set_timer(source: interop.Pointer | interop.Reference<any>, start: number, interval: number, leeway: number): void;

declare function dispatch_source_testcancel(source: interop.Pointer | interop.Reference<any>): number;

declare function dispatch_sync(queue: interop.Pointer | interop.Reference<any>, block: () => void): void;

declare function dispatch_sync_f(queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, work: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_time(when: number, delta: number): number;

declare function dispatch_walltime(when: interop.Pointer | interop.Reference<timespec>, delta: number): number;

declare function dispatch_workloop_create(label: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function dispatch_workloop_create_inactive(label: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function dispatch_workloop_set_autorelease_frequency(workloop: interop.Pointer | interop.Reference<any>, frequency: dispatch_autorelease_frequency_t): void;

declare function dispatch_workloop_set_os_workgroup(workloop: interop.Pointer | interop.Reference<any>, workgroup: interop.Pointer | interop.Reference<any>): void;

declare function dispatch_write(fd: number, data: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>, handler: (p1: interop.Pointer | interop.Reference<any>, p2: number) => void): void;
