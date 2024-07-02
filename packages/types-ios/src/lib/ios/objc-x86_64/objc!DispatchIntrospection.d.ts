
/**
 * @since 7.0
 */
declare function dispatch_introspection_hook_queue_callout_begin(queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 7.0
 */
declare function dispatch_introspection_hook_queue_callout_end(queue: NSObject & OS_dispatch_queue, context: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

/**
 * @since 7.0
 */
declare function dispatch_introspection_hook_queue_create(queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 7.0
 */
declare function dispatch_introspection_hook_queue_destroy(queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 7.1
 */
declare function dispatch_introspection_hook_queue_item_complete(item: NSObject & OS_dispatch_object): void;

/**
 * @since 7.0
 */
declare function dispatch_introspection_hook_queue_item_dequeue(queue: NSObject & OS_dispatch_queue, item: NSObject & OS_dispatch_object): void;

/**
 * @since 7.0
 */
declare function dispatch_introspection_hook_queue_item_enqueue(queue: NSObject & OS_dispatch_queue, item: NSObject & OS_dispatch_object): void;
