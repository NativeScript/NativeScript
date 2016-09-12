
declare function dispatch_introspection_hook_queue_callout_begin(queue: NSObject, context: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_introspection_hook_queue_callout_end(queue: NSObject, context: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_introspection_hook_queue_create(queue: NSObject): void;

declare function dispatch_introspection_hook_queue_destroy(queue: NSObject): void;

declare function dispatch_introspection_hook_queue_item_complete(item: NSObject): void;

declare function dispatch_introspection_hook_queue_item_dequeue(queue: NSObject, item: NSObject): void;

declare function dispatch_introspection_hook_queue_item_enqueue(queue: NSObject, item: NSObject): void;
