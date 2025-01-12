
/**
 * @since 2.0
 */
declare function imaxabs(j: number): number;

/**
 * @since 2.0
 */
declare function imaxdiv(__numer: number, __denom: number): imaxdiv_t;

interface imaxdiv_t {
	quot: number;
	rem: number;
}
declare var imaxdiv_t: interop.StructType<imaxdiv_t>;

/**
 * @since 2.0
 */
declare function strtoimax(__nptr: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __base: number): number;

declare function strtoimax_l(nptr: string | interop.Pointer | interop.Reference<any>, endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, base: number, p4: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function strtoumax(__nptr: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __base: number): number;

declare function strtoumax_l(nptr: string | interop.Pointer | interop.Reference<any>, endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, base: number, p4: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function wcstoimax(__nptr: interop.Pointer | interop.Reference<number>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, __base: number): number;

declare function wcstoimax_l(nptr: interop.Pointer | interop.Reference<number>, endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, base: number, p4: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function wcstoumax(__nptr: interop.Pointer | interop.Reference<number>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, __base: number): number;

declare function wcstoumax_l(nptr: interop.Pointer | interop.Reference<number>, endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, base: number, p4: interop.Pointer | interop.Reference<any>): number;
