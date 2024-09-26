
interface __nl_cat_d {
	__data: interop.Pointer | interop.Reference<any>;
	__size: number;
}
declare var __nl_cat_d: interop.StructType<__nl_cat_d>;

declare function catclose(p1: interop.Pointer | interop.Reference<__nl_cat_d>): number;

declare function catgets(p1: interop.Pointer | interop.Reference<__nl_cat_d>, p2: number, p3: number, p4: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function catopen(p1: string | interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<__nl_cat_d>;
