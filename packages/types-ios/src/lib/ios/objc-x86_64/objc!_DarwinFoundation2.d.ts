
interface FILE {
	_p: interop.Pointer | interop.Reference<any> | null;
	_r: number;
	_w: number;
	_flags: number;
	_file: number;
	_bf: __sbuf;
	_lbfsize: number;
	_cookie: interop.Pointer | interop.Reference<any> | null;
	_close: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number> | null;
	_read: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => number> | null;
	_seek: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: number) => number> | null;
	_write: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => number> | null;
	_ub: __sbuf;
	_extra: interop.Pointer | interop.Reference<any> | null;
	_ur: number;
	_ubuf: interop.Reference<number>;
	_nbuf: interop.Reference<number>;
	_lb: __sbuf;
	_blksize: number;
	_offset: number;
}
declare var FILE: interop.StructType<FILE>;

declare var _CurrentRuneLocale: interop.Pointer | interop.Reference<_RuneLocale> | null;

declare var _DefaultRuneLocale: _RuneLocale;

interface _RuneCharClass {
	__name: interop.Reference<number>;
	__mask: number;
}
declare var _RuneCharClass: interop.StructType<_RuneCharClass>;

interface _RuneEntry {
	__min: number;
	__max: number;
	__map: number;
	__types: interop.Pointer | interop.Reference<number> | null;
}
declare var _RuneEntry: interop.StructType<_RuneEntry>;

interface _RuneLocale {
	__magic: interop.Reference<number>;
	__encoding: interop.Reference<number>;
	__sgetrune: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
	__sputrune: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
	__invalid_rune: number;
	__runetype: interop.Reference<number>;
	__maplower: interop.Reference<number>;
	__mapupper: interop.Reference<number>;
	__runetype_ext: _RuneRange;
	__maplower_ext: _RuneRange;
	__mapupper_ext: _RuneRange;
	__variable: interop.Pointer | interop.Reference<any> | null;
	__variable_len: number;
	__ncharclasses: number;
	__charclasses: interop.Pointer | interop.Reference<_RuneCharClass> | null;
}
declare var _RuneLocale: interop.StructType<_RuneLocale>;

interface _RuneRange {
	__nranges: number;
	__ranges: interop.Pointer | interop.Reference<_RuneEntry> | null;
}
declare var _RuneRange: interop.StructType<_RuneRange>;

declare function ___runetype(p1: number): number;

declare function ___runetype_l(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function ___tolower(p1: number): number;

declare function ___tolower_l(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function ___toupper(p1: number): number;

declare function ___toupper_l(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function __darwin_check_fd_set_overflow(p1: number, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

interface __darwin_pthread_handler_rec {
	__routine: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	__arg: interop.Pointer | interop.Reference<any> | null;
	__next: interop.Pointer | interop.Reference<__darwin_pthread_handler_rec> | null;
}
declare var __darwin_pthread_handler_rec: interop.StructType<__darwin_pthread_handler_rec>;

declare function __maskrune(p1: number, p2: number): number;

declare function __maskrune_l(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

interface __nl_cat_d {
	__data: interop.Pointer | interop.Reference<any> | null;
	__size: number;
}
declare var __nl_cat_d: interop.StructType<__nl_cat_d>;

interface __sbuf {
	_base: interop.Pointer | interop.Reference<any> | null;
	_size: number;
}
declare var __sbuf: interop.StructType<__sbuf>;

declare function __srget(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare var __stderrp: interop.Pointer | interop.Reference<FILE> | null;

declare var __stdinp: interop.Pointer | interop.Reference<FILE> | null;

declare var __stdoutp: interop.Pointer | interop.Reference<FILE> | null;

declare function __swbuf(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function __tg_promote(p1: number): number;

declare function __tg_promoteFunction(p1: number): number;

declare function __tg_promoteFunction2(p1: number): number;

declare function __tg_promoteFunction3(p1: number): number;

declare function __tg_promoteFunction4(p1: number): number;

declare function __tg_promoteFunction5(p1: number): number;

declare function __tg_promoteFunction6(p1: number): number;

declare function __tg_promoteFunction7(p1: number): number;

declare function __tg_promoteFunction8(p1: number): number;

declare function __tolower(p1: number): number;

declare function __toupper(p1: number): number;

interface _opaque_pthread_attr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_attr_t: interop.StructType<_opaque_pthread_attr_t>;

interface _opaque_pthread_cond_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_cond_t: interop.StructType<_opaque_pthread_cond_t>;

interface _opaque_pthread_condattr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_condattr_t: interop.StructType<_opaque_pthread_condattr_t>;

interface _opaque_pthread_mutex_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_mutex_t: interop.StructType<_opaque_pthread_mutex_t>;

interface _opaque_pthread_mutexattr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_mutexattr_t: interop.StructType<_opaque_pthread_mutexattr_t>;

interface _opaque_pthread_once_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_once_t: interop.StructType<_opaque_pthread_once_t>;

interface _opaque_pthread_rwlock_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_rwlock_t: interop.StructType<_opaque_pthread_rwlock_t>;

interface _opaque_pthread_rwlockattr_t {
	__sig: number;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_rwlockattr_t: interop.StructType<_opaque_pthread_rwlockattr_t>;

interface _opaque_pthread_t {
	__sig: number;
	__cleanup_stack: interop.Pointer | interop.Reference<__darwin_pthread_handler_rec> | null;
	__opaque: interop.Reference<number>;
}
declare var _opaque_pthread_t: interop.StructType<_opaque_pthread_t>;

declare function alloca(__size: number): interop.Pointer | interop.Reference<any> | null;

declare function asctime(p1: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function asctime_r(p1: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function bcmp(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function bcopy(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): void;

declare function bzero(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): void;

declare function catclose(p1: interop.Pointer | interop.Reference<__nl_cat_d> | ArrayBufferLike | ArrayBufferView | null): number;

declare function catgets(p1: interop.Pointer | interop.Reference<__nl_cat_d> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number, p4: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function catopen(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<__nl_cat_d> | null;

declare function clearerr(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): void;

declare function clock(): number;

/**
 * @since 10.0
 */
declare function clock_getres(__clock_id: clockid_t, __res: interop.Pointer | interop.Reference<timespec> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function clock_gettime(__clock_id: clockid_t, __tp: interop.Pointer | interop.Reference<timespec> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function clock_gettime_nsec_np(__clock_id: clockid_t): number;

declare const enum clockid_t {

	_CLOCK_REALTIME = 0,

	_CLOCK_MONOTONIC = 6,

	_CLOCK_MONOTONIC_RAW = 4,

	_CLOCK_MONOTONIC_RAW_APPROX = 5,

	_CLOCK_UPTIME_RAW = 8,

	_CLOCK_UPTIME_RAW_APPROX = 9,

	_CLOCK_PROCESS_CPUTIME_ID = 12,

	_CLOCK_THREAD_CPUTIME_ID = 16
}

declare function ctermid(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function ctermid_r(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function ctime(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function ctime_r(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare var daylight: number;

declare function difftime(p1: number, p2: number): number;

declare function duplocale(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function fclose(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

interface fd_set {
	fds_bits: interop.Reference<number>;
}
declare var fd_set: interop.StructType<fd_set>;

declare function fdopen(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<FILE> | null;

declare function feof(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function ferror(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function fflush(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function ffs(p1: number): number;

/**
 * @since 2.0
 */
declare function ffsl(p1: number): number;

/**
 * @since 7.0
 */
declare function ffsll(p1: number): number;

declare function fgetc(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function fgetln(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, __len: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function fgetpos(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function fgets(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number, p3: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function fileno(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function flockfile(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): void;

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

/**
 * @since 11.0
 */
declare function fmemopen(__buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number, __mode: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<FILE> | null;

declare function fmtcheck(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function fopen(__filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __mode: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<FILE> | null;

declare function fpurge(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function fputc(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function fputs(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function fread(__ptr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number, __nitems: number, __stream: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function freelocale(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function freopen(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<FILE> | null;

declare function fseek(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number): number;

declare function fseeko(__stream: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, __offset: number, __whence: number): number;

declare function fsetpos(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function ftell(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function ftello(__stream: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function ftrylockfile(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function funlockfile(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): void;

declare function funopen(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => number> | null, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => number> | null, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: number) => number> | null, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number> | null): interop.Pointer | interop.Reference<FILE> | null;

declare function fwrite(__ptr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number, __nitems: number, __stream: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getc(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getc_unlocked(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function getchar(): number;

declare function getchar_unlocked(): number;

declare function getdate(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<tm> | null;

declare var getdate_err: number;

/**
 * @since 4.3
 */
declare function getdelim(__linep: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __linecapp: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __delimiter: number, __stream: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 4.3
 */
declare function getline(__linep: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __linecapp: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, __stream: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gets(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function getw(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gmtime(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<tm> | null;

declare function gmtime_r(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<tm> | null;

declare function index(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

interface lconv {
	decimal_point: interop.Pointer | interop.Reference<any> | null;
	thousands_sep: interop.Pointer | interop.Reference<any> | null;
	grouping: interop.Pointer | interop.Reference<any> | null;
	int_curr_symbol: interop.Pointer | interop.Reference<any> | null;
	currency_symbol: interop.Pointer | interop.Reference<any> | null;
	mon_decimal_point: interop.Pointer | interop.Reference<any> | null;
	mon_thousands_sep: interop.Pointer | interop.Reference<any> | null;
	mon_grouping: interop.Pointer | interop.Reference<any> | null;
	positive_sign: interop.Pointer | interop.Reference<any> | null;
	negative_sign: interop.Pointer | interop.Reference<any> | null;
	int_frac_digits: number;
	frac_digits: number;
	p_cs_precedes: number;
	p_sep_by_space: number;
	n_cs_precedes: number;
	n_sep_by_space: number;
	p_sign_posn: number;
	n_sign_posn: number;
	int_p_cs_precedes: number;
	int_n_cs_precedes: number;
	int_p_sep_by_space: number;
	int_n_sep_by_space: number;
	int_p_sign_posn: number;
	int_n_sign_posn: number;
}
declare var lconv: interop.StructType<lconv>;

declare function localeconv(): interop.Pointer | interop.Reference<lconv> | null;

declare function localtime(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<tm> | null;

declare function localtime_r(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<tm> | null;

declare function memccpy(__dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __c: number, __n: number): interop.Pointer | interop.Reference<any> | null;

declare function memchr(__s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __c: number, __n: number): interop.Pointer | interop.Reference<any> | null;

declare function memcmp(__s1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __s2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function memcpy(__dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 4.3
 */
declare function memmem(__big: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __big_len: number, __little: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __little_len: number): interop.Pointer | interop.Reference<any> | null;

declare function memmove(__dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __len: number): interop.Pointer | interop.Reference<any> | null;

declare function memset(__b: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __c: number, __len: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 3.0
 */
declare function memset_pattern16(__b: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __pattern16: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __len: number): void;

/**
 * @since 3.0
 */
declare function memset_pattern4(__b: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __pattern4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __len: number): void;

/**
 * @since 3.0
 */
declare function memset_pattern8(__b: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __pattern8: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __len: number): void;

/**
 * @since 7.0
 */
declare function memset_s(__s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __smax: number, __c: number, __n: number): number;

declare function mktime(p1: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null): number;

declare function nanosleep(__rqtp: interop.Pointer | interop.Reference<timespec> | ArrayBufferLike | ArrayBufferView | null, __rmtp: interop.Pointer | interop.Reference<timespec> | ArrayBufferLike | ArrayBufferView | null): number;

declare function newlocale(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 11.0
 */
declare function open_memstream(__bufp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __sizep: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<FILE> | null;

declare function pclose(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function perror(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function popen(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<FILE> | null;

declare function posix2time(p1: number): number;

declare function putc(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function putc_unlocked(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function putchar(p1: number): number;

declare function putchar_unlocked(p1: number): number;

declare function puts(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function putw(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function remove(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function rename(__old: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __new: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.0
 */
declare function renameat(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function renameatx_np(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p5: number): number;

/**
 * @since 10.0
 */
declare function renamex_np(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function rewind(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): void;

declare function rindex(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

declare function setbuf(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function setbuffer(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number): void;

declare function setlinebuf(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function setlocale(p1: number, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function setvbuf(p1: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, __size: number): number;

declare function stpcpy(__dst: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __src: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 4.3
 */
declare function stpncpy(__dst: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __src: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): interop.Pointer | interop.Reference<any> | null;

declare function strcasecmp(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strcasecmp_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strcasestr(__big: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __little: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strcasestr_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strcat(__s1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __s2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strchr(__s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __c: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 18.4
 */
declare function strchrnul(__s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __c: number): interop.Pointer | interop.Reference<any> | null;

declare function strcmp(__s1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __s2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strcoll(__s1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __s2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strcoll_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strcpy(__dst: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __src: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strcspn(__s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __charset: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strdup(__s1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strerror(__errnum: number): interop.Pointer | interop.Reference<any> | null;

declare function strerror_r(__errnum: number, __strerrbuf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __buflen: number): number;

declare function strftime(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __maxsize: number, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strftime_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null, p5: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strlcat(__dst: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __source: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number): number;

declare function strlcpy(__dst: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __source: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __size: number): number;

declare function strlen(__s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strmode(__mode: number, __bp: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function strncasecmp(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function strncasecmp_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strncat(__s1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __s2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): interop.Pointer | interop.Reference<any> | null;

declare function strncmp(__s1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __s2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function strncpy(__dst: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __src: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 4.3
 */
declare function strndup(__s1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 4.3
 */
declare function strnlen(__s1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function strnstr(__big: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __little: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __len: number): interop.Pointer | interop.Reference<any> | null;

declare function strpbrk(__s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __charset: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strptime(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strptime_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strrchr(__s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __c: number): interop.Pointer | interop.Reference<any> | null;

declare function strsep(__stringp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, __delim: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strsignal(__sig: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function strsignal_r(__sig: number, __strsignalbuf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __buflen: number): number;

declare function strspn(__s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __charset: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function strstr(__big: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __little: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strtok(__str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __sep: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strtok_r(__str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __sep: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __lasts: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function strxfrm(__s1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __s2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number): number;

declare function strxfrm_l(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __n: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function swab(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __len: number): void;

declare var sys_errlist: interop.Reference<interop.Pointer | interop.Reference<any> | null>;

declare var sys_nerr: number;

declare function tempnam(__dir: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __prefix: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function time(p1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function time2posix(p1: number): number;

declare function timegm(p1: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null): number;

declare function timelocal(p1: interop.Pointer | interop.Reference<tm> | ArrayBufferLike | ArrayBufferView | null): number;

interface timespec {
	tv_sec: number;
	tv_nsec: number;
}
declare var timespec: interop.StructType<timespec>;

/**
 * @since 13.0
 */
declare function timespec_get(ts: interop.Pointer | interop.Reference<timespec> | ArrayBufferLike | ArrayBufferView | null, base: number): number;

interface timeval {
	tv_sec: number;
	tv_usec: number;
}
declare var timeval: interop.StructType<timeval>;

/**
 * @since 10.1
 */
declare function timingsafe_bcmp(__b1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __b2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, __len: number): number;

interface tm {
	tm_sec: number;
	tm_min: number;
	tm_hour: number;
	tm_mday: number;
	tm_mon: number;
	tm_year: number;
	tm_wday: number;
	tm_yday: number;
	tm_isdst: number;
	tm_gmtoff: number;
	tm_zone: interop.Pointer | interop.Reference<any> | null;
}
declare var tm: interop.StructType<tm>;

declare function tmpfile(): interop.Pointer | interop.Reference<FILE> | null;

declare function tmpnam(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare var tzname: interop.Reference<interop.Pointer | interop.Reference<any> | null>;

declare function tzset(): void;

declare function tzsetwall(): void;

declare function ungetc(p1: number, p2: interop.Pointer | interop.Reference<FILE> | ArrayBufferLike | ArrayBufferView | null): number;

declare function uselocale(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;
