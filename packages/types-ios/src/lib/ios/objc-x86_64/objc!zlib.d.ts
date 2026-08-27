
declare function adler32(adler: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): number;

declare function adler32_combine(p1: number, p2: number, p3: number): number;

/**
 * @since 11.0
 */
declare function adler32_z(adler: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): number;

declare function compress(dest: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destLen: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, source: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, sourceLen: number): number;

declare function compress2(dest: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destLen: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, source: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, sourceLen: number, level: number): number;

declare function compressBound(sourceLen: number): number;

declare function crc32(crc: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): number;

declare function crc32_combine(p1: number, p2: number, p3: number): number;

/**
 * @since 17.0
 */
declare function crc32_combine_gen(p1: number): number;

/**
 * @since 17.0
 */
declare function crc32_combine_op(crc1: number, crc2: number, op: number): number;

/**
 * @since 11.0
 */
declare function crc32_z(crc: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): number;

declare function deflate(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, flush: number): number;

declare function deflateBound(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, sourceLen: number): number;

declare function deflateCopy(dest: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, source: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

declare function deflateEnd(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 11.0
 */
declare function deflateGetDictionary(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, dictionary: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dictLength: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function deflateInit2_(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, level: number, method: number, windowBits: number, memLevel: number, strategy: number, version: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stream_size: number): number;

declare function deflateInit_(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, level: number, version: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stream_size: number): number;

declare function deflateParams(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, level: number, strategy: number): number;

/**
 * @since 8.0
 */
declare function deflatePending(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, pending: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, bits: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function deflatePrime(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, bits: number, value: number): number;

declare function deflateReset(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.0
 */
declare function deflateResetKeep(p1: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

declare function deflateSetDictionary(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, dictionary: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dictLength: number): number;

declare function deflateSetHeader(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, head: interop.Pointer | interop.Reference<gz_header> | ArrayBufferLike | ArrayBufferView | null): number;

declare function deflateTune(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, good_length: number, max_lazy: number, nice_length: number, max_chain: number): number;

declare function get_crc_table(): interop.Pointer | interop.Reference<number> | null;

interface gzFile_s {
	have: number;
	next: interop.Pointer | interop.Reference<any> | null;
	pos: number;
}
declare var gzFile_s: interop.StructType<gzFile_s>;

interface gz_header {
	text: number;
	time: number;
	xflags: number;
	os: number;
	extra: interop.Pointer | interop.Reference<any> | null;
	extra_len: number;
	extra_max: number;
	name: interop.Pointer | interop.Reference<any> | null;
	name_max: number;
	comment: interop.Pointer | interop.Reference<any> | null;
	comm_max: number;
	hcrc: number;
	done: number;
}
declare var gz_header: interop.StructType<gz_header>;

/**
 * @since 5.0
 */
declare function gzbuffer(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null, size: number): number;

declare function gzclearerr(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): void;

declare function gzclose(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 5.0
 */
declare function gzclose_r(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 5.0
 */
declare function gzclose_w(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gzdirect(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gzdopen(fd: number, mode: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<gzFile_s> | null;

declare function gzeof(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gzerror(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null, errnum: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gzflush(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null, flush: number): number;

/**
 * @since 11.0
 */
declare function gzfread(buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number, nitems: number, file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 11.0
 */
declare function gzfwrite(buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number, nitems: number, file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gzgetc(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.0
 */
declare function gzgetc_(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gzgets(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 5.0
 */
declare function gzoffset(p1: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gzopen(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<gzFile_s> | null;

declare function gzputc(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null, c: number): number;

declare function gzputs(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null, s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gzread(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null, buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): number;

declare function gzrewind(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gzseek(p1: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number): number;

declare function gzsetparams(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null, level: number, strategy: number): number;

declare function gztell(p1: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gzungetc(c: number, file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gzwrite(file: interop.Pointer | interop.Reference<gzFile_s> | ArrayBufferLike | ArrayBufferView | null, buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): number;

declare function inflate(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, flush: number): number;

declare function inflateBack(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, _in: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>, in_desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, out: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => number>, out_desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function inflateBackEnd(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

declare function inflateBackInit_(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, windowBits: number, window: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, version: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stream_size: number): number;

/**
 * @since 11.0
 */
declare function inflateCodesUsed(p1: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

declare function inflateCopy(dest: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, source: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

declare function inflateEnd(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.0
 */
declare function inflateGetDictionary(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, dictionary: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dictLength: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function inflateGetHeader(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, head: interop.Pointer | interop.Reference<gz_header> | ArrayBufferLike | ArrayBufferView | null): number;

declare function inflateInit2_(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, windowBits: number, version: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stream_size: number): number;

declare function inflateInit_(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, version: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stream_size: number): number;

/**
 * @since 5.0
 */
declare function inflateMark(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

declare function inflatePrime(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, bits: number, value: number): number;

declare function inflateReset(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 5.0
 */
declare function inflateReset2(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, windowBits: number): number;

/**
 * @since 8.0
 */
declare function inflateResetKeep(p1: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

declare function inflateSetDictionary(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, dictionary: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dictLength: number): number;

declare function inflateSync(strm: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

declare function inflateSyncPoint(p1: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 5.0
 */
declare function inflateUndermine(p1: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

/**
 * @since 11.0
 */
declare function inflateValidate(p1: interop.Pointer | interop.Reference<z_stream> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function uncompress(dest: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destLen: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, source: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, sourceLen: number): number;

/**
 * @since 11.0
 */
declare function uncompress2(dest: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destLen: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, source: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, sourceLen: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function zError(p1: number): interop.Pointer | interop.Reference<any> | null;

interface z_stream {
	next_in: interop.Pointer | interop.Reference<any> | null;
	avail_in: number;
	total_in: number;
	next_out: interop.Pointer | interop.Reference<any> | null;
	avail_out: number;
	total_out: number;
	msg: interop.Pointer | interop.Reference<any> | null;
	state: interop.Pointer | interop.Reference<any> | null;
	zalloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: number) => interop.Pointer | interop.Reference<any> | null>;
	zfree: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => void>;
	opaque: interop.Pointer | interop.Reference<any> | null;
	data_type: number;
	adler: number;
	reserved: number;
}
declare var z_stream: interop.StructType<z_stream>;

declare function zlibCompileFlags(): number;

declare function zlibVersion(): interop.Pointer | interop.Reference<any> | null;
