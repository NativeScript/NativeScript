
declare function MCPPABIGetPreprocFunc(): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>) => void>;

declare function MCPPABISetPreprocFunc(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>) => void>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>) => void>;
