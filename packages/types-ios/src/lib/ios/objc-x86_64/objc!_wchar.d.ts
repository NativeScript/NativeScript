
declare function btowc(p1: number): number;

declare function btowc_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function fgetwc(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fgetwc_l(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.3
 */
declare function fgetwln(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

/**
 * @since 4.3
 */
declare function fgetwln_l(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<number>;

declare function fgetws(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<FILE>): interop.Pointer | interop.Reference<number>;

declare function fgetws_l(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<FILE>, p4: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<number>;

declare function fputwc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function fputwc_l(p1: number, p2: interop.Pointer | interop.Reference<FILE>, p3: interop.Pointer | interop.Reference<any>): number;

declare function fputws(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function fputws_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<FILE>, p3: interop.Pointer | interop.Reference<any>): number;

declare function fwide(p1: interop.Pointer | interop.Reference<FILE>, p2: number): number;

declare function getwc(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function getwc_l(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<any>): number;

declare function getwchar(): number;

declare function getwchar_l(p1: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 11.0
 */
declare function open_wmemstream(__bufp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, __sizep: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<FILE>;

declare function putwc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function putwc_l(p1: number, p2: interop.Pointer | interop.Reference<FILE>, p3: interop.Pointer | interop.Reference<any>): number;

declare function putwchar(p1: number): number;

declare function putwchar_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function ungetwc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function ungetwc_l(p1: number, p2: interop.Pointer | interop.Reference<FILE>, p3: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.3
 */
declare function wcpcpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

/**
 * @since 4.3
 */
declare function wcpncpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): interop.Pointer | interop.Reference<number>;

/**
 * @since 4.3
 */
declare function wcscasecmp(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.3
 */
declare function wcscasecmp_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcscat(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcschr(p1: interop.Pointer | interop.Reference<number>, p2: number): interop.Pointer | interop.Reference<number>;

declare function wcscmp(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function wcscoll(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function wcscoll_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcscpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcscspn(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.3
 */
declare function wcsdup(p1: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcsftime(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<tm>): number;

declare function wcsftime_l(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<tm>, p5: interop.Pointer | interop.Reference<any>): number;

declare function wcslcat(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcslcpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcslen(p1: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.3
 */
declare function wcsncasecmp(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, n: number): number;

/**
 * @since 4.3
 */
declare function wcsncasecmp_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, n: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcsncat(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): interop.Pointer | interop.Reference<number>;

declare function wcsncmp(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcsncpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): interop.Pointer | interop.Reference<number>;

/**
 * @since 4.3
 */
declare function wcsnlen(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function wcspbrk(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcsrchr(p1: interop.Pointer | interop.Reference<number>, p2: number): interop.Pointer | interop.Reference<number>;

declare function wcsspn(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): number;

declare function wcsstr(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function wcstod(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>): number;

declare function wcstod_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcstof(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>): number;

declare function wcstof_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcstok(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>): interop.Pointer | interop.Reference<number>;

declare function wcstol(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number): number;

declare function wcstol_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcstold(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>): number;

declare function wcstold_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcstoll(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number): number;

declare function wcstoll_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcstoul(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number): number;

declare function wcstoul_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcstoull(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number): number;

declare function wcstoull_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wcswidth(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function wcswidth_l(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

declare function wcsxfrm(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wcsxfrm_l(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function wctob(p1: number): number;

declare function wctob_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function wcwidth(p1: number): number;

declare function wcwidth_l(p1: number, p2: interop.Pointer | interop.Reference<any>): number;

declare function wmemchr(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: number): interop.Pointer | interop.Reference<number>;

declare function wmemcmp(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): number;

declare function wmemcpy(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): interop.Pointer | interop.Reference<number>;

declare function wmemmove(p1: interop.Pointer | interop.Reference<number>, p2: interop.Pointer | interop.Reference<number>, p3: number): interop.Pointer | interop.Reference<number>;

declare function wmemset(p1: interop.Pointer | interop.Reference<number>, p2: number, p3: number): interop.Pointer | interop.Reference<number>;
