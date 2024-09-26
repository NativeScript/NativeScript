
declare var _c_locale: interop.Pointer | interop.Reference<any>;

declare function duplocale(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function freelocale(p1: interop.Pointer | interop.Reference<any>): number;

declare function localeconv_l(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<lconv>;

declare function newlocale(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function querylocale(p1: number, p2: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function uselocale(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;
