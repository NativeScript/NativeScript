
interface FILE {
	_p: interop.Pointer | interop.Reference<any>;
	_r: number;
	_w: number;
	_flags: number;
	_file: number;
	_bf: __sbuf;
	_lbfsize: number;
	_cookie: interop.Pointer | interop.Reference<any>;
	_close: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	_read: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>;
	_seek: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => number>;
	_write: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>;
	_ub: __sbuf;
	_extra: interop.Pointer | interop.Reference<any>;
	_ur: number;
	_ubuf: interop.Reference<number>;
	_nbuf: interop.Reference<number>;
	_lb: __sbuf;
	_blksize: number;
	_offset: number;
}
declare var FILE: interop.StructType<FILE>;

interface __sbuf {
	_base: interop.Pointer | interop.Reference<any>;
	_size: number;
}
declare var __sbuf: interop.StructType<__sbuf>;

declare function __srget(p1: interop.Pointer | interop.Reference<FILE>): number;

declare var __stderrp: interop.Pointer | interop.Reference<FILE>;

declare var __stdinp: interop.Pointer | interop.Reference<FILE>;

declare var __stdoutp: interop.Pointer | interop.Reference<FILE>;

declare function __swbuf(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function clearerr(p1: interop.Pointer | interop.Reference<FILE>): void;

declare function ctermid(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function ctermid_r(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function fclose(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fdopen(p1: number, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<FILE>;

declare function feof(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function ferror(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fflush(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fgetc(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fgetln(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function fgetpos(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>): number;

declare function fgets(p1: string | interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<FILE>): interop.Pointer | interop.Reference<any>;

declare function fileno(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function flockfile(p1: interop.Pointer | interop.Reference<FILE>): void;

/**
 * @since 11.0
 */
declare function fmemopen(__buf: interop.Pointer | interop.Reference<any>, __size: number, __mode: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<FILE>;

declare function fmtcheck(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function fopen(__filename: string | interop.Pointer | interop.Reference<any>, __mode: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<FILE>;

declare function fpurge(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function fputc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function fputs(p1: string | interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function fread(__ptr: interop.Pointer | interop.Reference<any>, __size: number, __nitems: number, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function freopen(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<FILE>): interop.Pointer | interop.Reference<FILE>;

declare function fseek(p1: interop.Pointer | interop.Reference<FILE>, p2: number, p3: number): number;

declare function fseeko(__stream: interop.Pointer | interop.Reference<FILE>, __offset: number, __whence: number): number;

declare function fsetpos(p1: interop.Pointer | interop.Reference<FILE>, p2: interop.Pointer | interop.Reference<number>): number;

declare function ftell(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function ftello(__stream: interop.Pointer | interop.Reference<FILE>): number;

declare function ftrylockfile(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function funlockfile(p1: interop.Pointer | interop.Reference<FILE>): void;

declare function funopen(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => number>, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<FILE>;

declare function fwrite(__ptr: interop.Pointer | interop.Reference<any>, __size: number, __nitems: number, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function getc(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function getc_unlocked(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function getchar(): number;

declare function getchar_unlocked(): number;

/**
 * @since 4.3
 */
declare function getdelim(__linep: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __linecapp: interop.Pointer | interop.Reference<number>, __delimiter: number, __stream: interop.Pointer | interop.Reference<FILE>): number;

/**
 * @since 4.3
 */
declare function getline(__linep: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __linecapp: interop.Pointer | interop.Reference<number>, __stream: interop.Pointer | interop.Reference<FILE>): number;

declare function gets(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function getw(p1: interop.Pointer | interop.Reference<FILE>): number;

/**
 * @since 11.0
 */
declare function open_memstream(__bufp: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, __sizep: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<FILE>;

declare function pclose(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function perror(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function popen(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<FILE>;

declare function putc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function putc_unlocked(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function putchar(p1: number): number;

declare function putchar_unlocked(p1: number): number;

declare function puts(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function putw(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;

declare function remove(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function rename(__old: string | interop.Pointer | interop.Reference<any>, __new: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 */
declare function renameat(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 10.0
 */
declare function renameatx_np(p1: number, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: string | interop.Pointer | interop.Reference<any>, p5: number): number;

/**
 * @since 10.0
 */
declare function renamex_np(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function rewind(p1: interop.Pointer | interop.Reference<FILE>): void;

declare function setbuf(p1: interop.Pointer | interop.Reference<FILE>, p2: string | interop.Pointer | interop.Reference<any>): void;

declare function setbuffer(p1: interop.Pointer | interop.Reference<FILE>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): void;

declare function setlinebuf(p1: interop.Pointer | interop.Reference<FILE>): number;

declare function setvbuf(p1: interop.Pointer | interop.Reference<FILE>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number): number;

declare var sys_errlist: interop.Reference<interop.Pointer | interop.Reference<any>>;

declare var sys_nerr: number;

declare function tempnam(__dir: string | interop.Pointer | interop.Reference<any>, __prefix: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function tmpfile(): interop.Pointer | interop.Reference<FILE>;

declare function tmpnam(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function ungetc(p1: number, p2: interop.Pointer | interop.Reference<FILE>): number;
