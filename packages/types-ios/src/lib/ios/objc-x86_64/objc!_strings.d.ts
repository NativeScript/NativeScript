
declare function bcmp(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

declare function bcopy(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

declare function bzero(p1: interop.Pointer | interop.Reference<any>, p2: number): void;

declare function ffs(p1: number): number;

/**
 * @since 2.0
 */
declare function ffsl(p1: number): number;

/**
 * @since 7.0
 */
declare function ffsll(p1: number): number;

/**
 * @since 2.0
 */
declare function fls(p1: number): number;

/**
 * @since 2.0
 */
declare function flsl(p1: number): number;

/**
 * @since 7.0
 */
declare function flsll(p1: number): number;

declare function index(p1: string | interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<any>;

declare function rindex(p1: string | interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<any>;

declare function strcasecmp(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): number;

declare function strncasecmp(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;
