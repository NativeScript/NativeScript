
declare function _Exit(p1: number): void;

declare var __mb_cur_max: number;

declare function a64l(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function abort(): void;

declare function abs(p1: number): number;

/**
 * @since 13.0
 */
declare function aligned_alloc(__alignment: number, __size: number): interop.Pointer | interop.Reference<any>;

declare function arc4random(): number;

/**
 * @deprecated 10.0
 */
declare function arc4random_addrandom(p1: string | interop.Pointer | interop.Reference<any>, p2: number): void;

/**
 * @since 4.3
 */
declare function arc4random_buf(__buf: interop.Pointer | interop.Reference<any>, __nbytes: number): void;

declare function arc4random_stir(): void;

/**
 * @since 4.3
 */
declare function arc4random_uniform(__upper_bound: number): number;

declare function at_quick_exit(p1: interop.FunctionReference<() => void>): number;

declare function atexit(p1: interop.FunctionReference<() => void>): number;

/**
 * @since 3.2
 */
declare function atexit_b(p1: () => void): number;

declare function atof(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function atof_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function atoi(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function atoi_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function atol(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function atol_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function atoll(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function atoll_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function bsearch(__key: interop.Pointer | interop.Reference<any>, __base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<any>;

/**
 * @since 3.2
 */
declare function bsearch_b(__key: interop.Pointer | interop.Reference<any>, __base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): interop.Pointer | interop.Reference<any>;

declare function calloc(__count: number, __size: number): interop.Pointer | interop.Reference<any>;

declare function cgetcap(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): interop.Pointer | interop.Reference<any>;

declare function cgetclose(): number;

declare function cgetent(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: string | interop.Pointer | interop.Reference<any>): number;

declare function cgetfirst(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function cgetmatch(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): number;

declare function cgetnext(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function cgetnum(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<number>): number;

declare function cgetset(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function cgetstr(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function cgetustr(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 2.0
 * @deprecated 2.0
 */
declare function daemon(p1: number, p2: number): number;

declare function devname(p1: number, p2: number): interop.Pointer | interop.Reference<any>;

declare function devname_r(p1: number, p2: number, buf: string | interop.Pointer | interop.Reference<any>, len: number): interop.Pointer | interop.Reference<any>;

declare function div(p1: number, p2: number): div_t;

interface div_t {
	quot: number;
	rem: number;
}
declare var div_t: interop.StructType<div_t>;

declare function drand48(): number;

declare function ecvt(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function erand48(p1: interop.Reference<number>): number;

declare function exit(p1: number): void;

declare function fcvt(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function free(p1: interop.Pointer | interop.Reference<any>): void;

declare function gcvt(p1: number, p2: number, p3: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function getbsize(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function getenv(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function getloadavg(p1: interop.Reference<number>, p2: number): number;

declare function getprogname(): interop.Pointer | interop.Reference<any>;

declare function getsubopt(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function grantpt(p1: number): number;

declare function heapsort(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): number;

/**
 * @since 3.2
 */
declare function heapsort_b(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): number;

declare function initstate(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number): interop.Pointer | interop.Reference<any>;

declare function jrand48(p1: interop.Reference<number>): number;

declare function l64a(p1: number): interop.Pointer | interop.Reference<any>;

declare function labs(p1: number): number;

declare function lcong48(p1: interop.Reference<number>): void;

declare function ldiv(p1: number, p2: number): ldiv_t;

interface ldiv_t {
	quot: number;
	rem: number;
}
declare var ldiv_t: interop.StructType<ldiv_t>;

declare function llabs(p1: number): number;

declare function lldiv(p1: number, p2: number): lldiv_t;

interface lldiv_t {
	quot: number;
	rem: number;
}
declare var lldiv_t: interop.StructType<lldiv_t>;

declare function lrand48(): number;

declare function malloc(__size: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 17.0
 */
declare function malloc_type_aligned_alloc(alignment: number, size: number, type_id: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 17.0
 */
declare function malloc_type_calloc(count: number, size: number, type_id: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 17.0
 */
declare function malloc_type_free(ptr: interop.Pointer | interop.Reference<any>, type_id: number): void;

/**
 * @since 17.0
 */
declare function malloc_type_malloc(size: number, type_id: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 17.0
 */
declare function malloc_type_posix_memalign(memptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, alignment: number, size: number, type_id: number): number;

/**
 * @since 17.0
 */
declare function malloc_type_realloc(ptr: interop.Pointer | interop.Reference<any>, size: number, type_id: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 17.0
 */
declare function malloc_type_valloc(size: number, type_id: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 17.0
 */
declare function malloc_type_zone_calloc(zone: interop.Pointer | interop.Reference<malloc_zone_t>, count: number, size: number, type_id: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 17.0
 */
declare function malloc_type_zone_free(zone: interop.Pointer | interop.Reference<malloc_zone_t>, ptr: interop.Pointer | interop.Reference<any>, type_id: number): void;

/**
 * @since 17.0
 */
declare function malloc_type_zone_malloc(zone: interop.Pointer | interop.Reference<malloc_zone_t>, size: number, type_id: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 17.0
 */
declare function malloc_type_zone_memalign(zone: interop.Pointer | interop.Reference<malloc_zone_t>, alignment: number, size: number, type_id: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 17.0
 */
declare function malloc_type_zone_realloc(zone: interop.Pointer | interop.Reference<malloc_zone_t>, ptr: interop.Pointer | interop.Reference<any>, size: number, type_id: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 17.0
 */
declare function malloc_type_zone_valloc(zone: interop.Pointer | interop.Reference<malloc_zone_t>, size: number, type_id: number): interop.Pointer | interop.Reference<any>;

declare function mblen(__s: string | interop.Pointer | interop.Reference<any>, __n: number): number;

declare function mblen_l(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

declare function mbstowcs(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function mbstowcs_l(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function mbtowc(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function mbtowc_l(p1: interop.Pointer | interop.Reference<number>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function mergesort(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): number;

/**
 * @since 3.2
 */
declare function mergesort_b(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): number;

declare function mkstemp(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function mktemp(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function mrand48(): number;

declare function nrand48(p1: interop.Reference<number>): number;

/**
 * @since 3.0
 */
declare function posix_memalign(__memptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __alignment: number, __size: number): number;

declare function posix_openpt(p1: number): number;

/**
 * @since 3.2
 */
declare function psort(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): void;

/**
 * @since 3.2
 */
declare function psort_b(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): void;

/**
 * @since 3.2
 */
declare function psort_r(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, p4: interop.Pointer | interop.Reference<any>, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => number>): void;

declare function ptsname(p1: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 11.3
 */
declare function ptsname_r(fildes: number, buffer: string | interop.Pointer | interop.Reference<any>, buflen: number): number;

declare function putenv(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function qsort(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): void;

/**
 * @since 3.2
 */
declare function qsort_b(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, __compar: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number): void;

declare function qsort_r(__base: interop.Pointer | interop.Reference<any>, __nel: number, __width: number, p4: interop.Pointer | interop.Reference<any>, __compar: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => number>): void;

declare function quick_exit(p1: number): void;

declare function radixsort(__base: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __nel: number, __table: string | interop.Pointer | interop.Reference<any>, __endbyte: number): number;

declare function rand(): number;

declare function rand_r(p1: interop.Pointer | interop.Reference<number>): number;

declare function random(): number;

declare function realloc(__ptr: interop.Pointer | interop.Reference<any>, __size: number): interop.Pointer | interop.Reference<any>;

declare function reallocf(__ptr: interop.Pointer | interop.Reference<any>, __size: number): interop.Pointer | interop.Reference<any>;

declare function realpath(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 13.0
 */
declare function rpmatch(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function seed48(p1: interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function setenv(__name: string | interop.Pointer | interop.Reference<any>, __value: string | interop.Pointer | interop.Reference<any>, __overwrite: number): number;

declare function setkey(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function setprogname(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function setstate(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sradixsort(__base: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __nel: number, __table: string | interop.Pointer | interop.Reference<any>, __endbyte: number): number;

declare function srand(p1: number): void;

declare function srand48(p1: number): void;

declare function sranddev(): void;

declare function srandom(p1: number): void;

declare function srandomdev(): void;

declare function strtod(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function strtod_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.Pointer | interop.Reference<any>): number;

declare function strtof(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function strtof_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.Pointer | interop.Reference<any>): number;

declare function strtol(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __base: number): number;

declare function strtol_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtold(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function strtold_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.Pointer | interop.Reference<any>): number;

declare function strtoll(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __base: number): number;

declare function strtoll_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 14.0
 */
declare function strtonum(__numstr: string | interop.Pointer | interop.Reference<any>, __minval: number, __maxval: number, __errstrp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function strtoq(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __base: number): number;

declare function strtoq_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtoul(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __base: number): number;

declare function strtoul_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtoull(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __base: number): number;

declare function strtoull_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strtouq(__str: string | interop.Pointer | interop.Reference<any>, __endptr: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __base: number): number;

declare function strtouq_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare var suboptarg: interop.Pointer | interop.Reference<any>;

declare function unlockpt(p1: number): number;

declare function unsetenv(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function valloc(__size: number): interop.Pointer | interop.Reference<any>;

declare function wcstombs(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcstombs_l(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wctomb(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function wctomb_l(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>): number;
