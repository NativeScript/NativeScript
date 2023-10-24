
declare function dispatch_introspection_hook_queue_callout_begin(queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_introspection_hook_queue_callout_end(queue: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function dispatch_introspection_hook_queue_create(queue: interop.Pointer | interop.Reference<any>): void;

declare function dispatch_introspection_hook_queue_destroy(queue: interop.Pointer | interop.Reference<any>): void;
