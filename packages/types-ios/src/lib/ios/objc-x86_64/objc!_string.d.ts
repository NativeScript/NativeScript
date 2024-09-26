
declare function memccpy(__dst: interop.Pointer | interop.Reference<any>, __src: interop.Pointer | interop.Reference<any>, __c: number, __n: number): interop.Pointer | interop.Reference<any>;

declare function memchr(__s: interop.Pointer | interop.Reference<any>, __c: number, __n: number): interop.Pointer | interop.Reference<any>;

declare function memcmp(__s1: interop.Pointer | interop.Reference<any>, __s2: interop.Pointer | interop.Reference<any>, __n: number): number;

declare function memcpy(__dst: interop.Pointer | interop.Reference<any>, __src: interop.Pointer | interop.Reference<any>, __n: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 4.3
 */
declare function memmem(__big: interop.Pointer | interop.Reference<any>, __big_len: number, __little: interop.Pointer | interop.Reference<any>, __little_len: number): interop.Pointer | interop.Reference<any>;

declare function memmove(__dst: interop.Pointer | interop.Reference<any>, __src: interop.Pointer | interop.Reference<any>, __len: number): interop.Pointer | interop.Reference<any>;

declare function memset(__b: interop.Pointer | interop.Reference<any>, __c: number, __len: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 3.0
 */
declare function memset_pattern16(__b: interop.Pointer | interop.Reference<any>, __pattern16: interop.Pointer | interop.Reference<any>, __len: number): void;

/**
 * @since 3.0
 */
declare function memset_pattern4(__b: interop.Pointer | interop.Reference<any>, __pattern4: interop.Pointer | interop.Reference<any>, __len: number): void;

/**
 * @since 3.0
 */
declare function memset_pattern8(__b: interop.Pointer | interop.Reference<any>, __pattern8: interop.Pointer | interop.Reference<any>, __len: number): void;

/**
 * @since 7.0
 */
declare function memset_s(__s: interop.Pointer | interop.Reference<any>, __smax: number, __c: number, __n: number): number;

declare function stpcpy(__dst: string | interop.Pointer | interop.Reference<any>, __src: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 4.3
 */
declare function stpncpy(__dst: string | interop.Pointer | interop.Reference<any>, __src: string | interop.Pointer | interop.Reference<any>, __n: number): interop.Pointer | interop.Reference<any>;

declare function strcasecmp_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>): number;

declare function strcasestr(__big: string | interop.Pointer | interop.Reference<any>, __little: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function strcasestr_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function strcat(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function strchr(__s: string | interop.Pointer | interop.Reference<any>, __c: number): interop.Pointer | interop.Reference<any>;

declare function strcmp(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>): number;

declare function strcoll(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>): number;

declare function strcoll_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>): number;

declare function strcpy(__dst: string | interop.Pointer | interop.Reference<any>, __src: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function strcspn(__s: string | interop.Pointer | interop.Reference<any>, __charset: string | interop.Pointer | interop.Reference<any>): number;

declare function strdup(__s1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function strerror(__errnum: number): interop.Pointer | interop.Reference<any>;

declare function strerror_r(__errnum: number, __strerrbuf: string | interop.Pointer | interop.Reference<any>, __buflen: number): number;

declare function strlcat(__dst: string | interop.Pointer | interop.Reference<any>, __source: string | interop.Pointer | interop.Reference<any>, __size: number): number;

declare function strlcpy(__dst: string | interop.Pointer | interop.Reference<any>, __source: string | interop.Pointer | interop.Reference<any>, __size: number): number;

declare function strlen(__s: string | interop.Pointer | interop.Reference<any>): number;

declare function strmode(__mode: number, __bp: string | interop.Pointer | interop.Reference<any>): void;

declare function strncasecmp_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function strncat(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>, __n: number): interop.Pointer | interop.Reference<any>;

declare function strncmp(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>, __n: number): number;

declare function strncpy(__dst: string | interop.Pointer | interop.Reference<any>, __src: string | interop.Pointer | interop.Reference<any>, __n: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 4.3
 */
declare function strndup(__s1: string | interop.Pointer | interop.Reference<any>, __n: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 4.3
 */
declare function strnlen(__s1: string | interop.Pointer | interop.Reference<any>, __n: number): number;

declare function strnstr(__big: string | interop.Pointer | interop.Reference<any>, __little: string | interop.Pointer | interop.Reference<any>, __len: number): interop.Pointer | interop.Reference<any>;

declare function strpbrk(__s: string | interop.Pointer | interop.Reference<any>, __charset: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function strrchr(__s: string | interop.Pointer | interop.Reference<any>, __c: number): interop.Pointer | interop.Reference<any>;

declare function strsep(__stringp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __delim: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function strsignal(__sig: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 14.0
 */
declare function strsignal_r(__sig: number, __strsignalbuf: string | interop.Pointer | interop.Reference<any>, __buflen: number): number;

declare function strspn(__s: string | interop.Pointer | interop.Reference<any>, __charset: string | interop.Pointer | interop.Reference<any>): number;

declare function strstr(__big: string | interop.Pointer | interop.Reference<any>, __little: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function strtok(__str: string | interop.Pointer | interop.Reference<any>, __sep: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function strtok_r(__str: string | interop.Pointer | interop.Reference<any>, __sep: string | interop.Pointer | interop.Reference<any>, __lasts: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function strxfrm(__s1: string | interop.Pointer | interop.Reference<any>, __s2: string | interop.Pointer | interop.Reference<any>, __n: number): number;

declare function strxfrm_l(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function swab(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

/**
 * @since 10.1
 */
declare function timingsafe_bcmp(__b1: interop.Pointer | interop.Reference<any>, __b2: interop.Pointer | interop.Reference<any>, __len: number): number;
