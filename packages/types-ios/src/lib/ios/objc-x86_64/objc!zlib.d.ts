
declare function adler32(adler: number, buf: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function adler32_combine(p1: number, p2: number, p3: number): number;

declare function adler32_z(adler: number, buf: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function compress(dest: string | interop.Pointer | interop.Reference<any>, destLen: interop.Pointer | interop.Reference<number>, source: string | interop.Pointer | interop.Reference<any>, sourceLen: number): number;

declare function compress2(dest: string | interop.Pointer | interop.Reference<any>, destLen: interop.Pointer | interop.Reference<number>, source: string | interop.Pointer | interop.Reference<any>, sourceLen: number, level: number): number;

declare function compressBound(sourceLen: number): number;

declare function crc32(crc: number, buf: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function crc32_combine(p1: number, p2: number, p3: number): number;

declare function crc32_z(adler: number, buf: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function deflate(strm: interop.Pointer | interop.Reference<z_stream>, flush: number): number;

declare function deflateBound(strm: interop.Pointer | interop.Reference<z_stream>, sourceLen: number): number;

declare function deflateCopy(dest: interop.Pointer | interop.Reference<z_stream>, source: interop.Pointer | interop.Reference<z_stream>): number;

declare function deflateEnd(strm: interop.Pointer | interop.Reference<z_stream>): number;

declare function deflateGetDictionary(strm: interop.Pointer | interop.Reference<z_stream>, dictionary: string | interop.Pointer | interop.Reference<any>, dictLength: interop.Pointer | interop.Reference<number>): number;

declare function deflateInit2_(strm: interop.Pointer | interop.Reference<z_stream>, level: number, method: number, windowBits: number, memLevel: number, strategy: number, version: string | interop.Pointer | interop.Reference<any>, stream_size: number): number;

declare function deflateInit_(strm: interop.Pointer | interop.Reference<z_stream>, level: number, version: string | interop.Pointer | interop.Reference<any>, stream_size: number): number;

declare function deflateParams(strm: interop.Pointer | interop.Reference<z_stream>, level: number, strategy: number): number;

declare function deflatePending(strm: interop.Pointer | interop.Reference<z_stream>, pending: interop.Pointer | interop.Reference<number>, bits: interop.Pointer | interop.Reference<number>): number;

declare function deflatePrime(strm: interop.Pointer | interop.Reference<z_stream>, bits: number, value: number): number;

declare function deflateReset(strm: interop.Pointer | interop.Reference<z_stream>): number;

declare function deflateResetKeep(p1: interop.Pointer | interop.Reference<z_stream>): number;

declare function deflateSetDictionary(strm: interop.Pointer | interop.Reference<z_stream>, dictionary: string | interop.Pointer | interop.Reference<any>, dictLength: number): number;

declare function deflateSetHeader(strm: interop.Pointer | interop.Reference<z_stream>, head: interop.Pointer | interop.Reference<gz_header>): number;

declare function deflateTune(strm: interop.Pointer | interop.Reference<z_stream>, good_length: number, max_lazy: number, nice_length: number, max_chain: number): number;

declare function get_crc_table(): interop.Pointer | interop.Reference<number>;

interface gzFile_s {
	have: number;
	next: string;
	pos: number;
}
declare var gzFile_s: interop.StructType<gzFile_s>;

interface gz_header {
	text: number;
	time: number;
	xflags: number;
	os: number;
	extra: string;
	extra_len: number;
	extra_max: number;
	name: string;
	name_max: number;
	comment: string;
	comm_max: number;
	hcrc: number;
	done: number;
}
declare var gz_header: interop.StructType<gz_header>;

declare function gzbuffer(file: interop.Pointer | interop.Reference<gzFile_s>, size: number): number;

declare function gzclearerr(file: interop.Pointer | interop.Reference<gzFile_s>): void;

declare function gzclose(file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzclose_r(file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzclose_w(file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzdirect(file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzdopen(fd: number, mode: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<gzFile_s>;

declare function gzeof(file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzerror(file: interop.Pointer | interop.Reference<gzFile_s>, errnum: interop.Pointer | interop.Reference<number>): string;

declare function gzflush(file: interop.Pointer | interop.Reference<gzFile_s>, flush: number): number;

declare function gzfread(buf: interop.Pointer | interop.Reference<any>, size: number, nitems: number, file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzfwrite(buf: interop.Pointer | interop.Reference<any>, size: number, nitems: number, file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzgetc(file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzgetc_(file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzgets(file: interop.Pointer | interop.Reference<gzFile_s>, buf: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function gzoffset(p1: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzopen(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<gzFile_s>;

declare function gzputc(file: interop.Pointer | interop.Reference<gzFile_s>, c: number): number;

declare function gzputs(file: interop.Pointer | interop.Reference<gzFile_s>, s: string | interop.Pointer | interop.Reference<any>): number;

declare function gzread(file: interop.Pointer | interop.Reference<gzFile_s>, buf: interop.Pointer | interop.Reference<any>, len: number): number;

declare function gzrewind(file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzseek(p1: interop.Pointer | interop.Reference<gzFile_s>, p2: number, p3: number): number;

declare function gzsetparams(file: interop.Pointer | interop.Reference<gzFile_s>, level: number, strategy: number): number;

declare function gztell(p1: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzungetc(c: number, file: interop.Pointer | interop.Reference<gzFile_s>): number;

declare function gzwrite(file: interop.Pointer | interop.Reference<gzFile_s>, buf: interop.Pointer | interop.Reference<any>, len: number): number;

declare function inflate(strm: interop.Pointer | interop.Reference<z_stream>, flush: number): number;

declare function inflateBack(strm: interop.Pointer | interop.Reference<z_stream>, _in: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>) => number>, in_desc: interop.Pointer | interop.Reference<any>, out: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, out_desc: interop.Pointer | interop.Reference<any>): number;

declare function inflateBackEnd(strm: interop.Pointer | interop.Reference<z_stream>): number;

declare function inflateBackInit_(strm: interop.Pointer | interop.Reference<z_stream>, windowBits: number, window: string | interop.Pointer | interop.Reference<any>, version: string | interop.Pointer | interop.Reference<any>, stream_size: number): number;

declare function inflateCodesUsed(p1: interop.Pointer | interop.Reference<z_stream>): number;

declare function inflateCopy(dest: interop.Pointer | interop.Reference<z_stream>, source: interop.Pointer | interop.Reference<z_stream>): number;

declare function inflateEnd(strm: interop.Pointer | interop.Reference<z_stream>): number;

declare function inflateGetDictionary(strm: interop.Pointer | interop.Reference<z_stream>, dictionary: string | interop.Pointer | interop.Reference<any>, dictLength: interop.Pointer | interop.Reference<number>): number;

declare function inflateGetHeader(strm: interop.Pointer | interop.Reference<z_stream>, head: interop.Pointer | interop.Reference<gz_header>): number;

declare function inflateInit2_(strm: interop.Pointer | interop.Reference<z_stream>, windowBits: number, version: string | interop.Pointer | interop.Reference<any>, stream_size: number): number;

declare function inflateInit_(strm: interop.Pointer | interop.Reference<z_stream>, version: string | interop.Pointer | interop.Reference<any>, stream_size: number): number;

declare function inflateMark(strm: interop.Pointer | interop.Reference<z_stream>): number;

declare function inflatePrime(strm: interop.Pointer | interop.Reference<z_stream>, bits: number, value: number): number;

declare function inflateReset(strm: interop.Pointer | interop.Reference<z_stream>): number;

declare function inflateReset2(strm: interop.Pointer | interop.Reference<z_stream>, windowBits: number): number;

declare function inflateResetKeep(p1: interop.Pointer | interop.Reference<z_stream>): number;

declare function inflateSetDictionary(strm: interop.Pointer | interop.Reference<z_stream>, dictionary: string | interop.Pointer | interop.Reference<any>, dictLength: number): number;

declare function inflateSync(strm: interop.Pointer | interop.Reference<z_stream>): number;

declare function inflateSyncPoint(p1: interop.Pointer | interop.Reference<z_stream>): number;

declare function inflateUndermine(p1: interop.Pointer | interop.Reference<z_stream>, p2: number): number;

declare function inflateValidate(p1: interop.Pointer | interop.Reference<z_stream>, p2: number): number;

declare function uncompress(dest: string | interop.Pointer | interop.Reference<any>, destLen: interop.Pointer | interop.Reference<number>, source: string | interop.Pointer | interop.Reference<any>, sourceLen: number): number;

declare function uncompress2(dest: string | interop.Pointer | interop.Reference<any>, destLen: interop.Pointer | interop.Reference<number>, source: string | interop.Pointer | interop.Reference<any>, sourceLen: interop.Pointer | interop.Reference<number>): number;

declare function zError(p1: number): string;

interface z_stream {
	next_in: string;
	avail_in: number;
	total_in: number;
	next_out: string;
	avail_out: number;
	total_out: number;
	msg: string;
	state: interop.Pointer | interop.Reference<any>;
	zalloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => interop.Pointer | interop.Reference<any>>;
	zfree: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>;
	opaque: interop.Pointer | interop.Reference<any>;
	data_type: number;
	adler: number;
	reserved: number;
}
declare var z_stream: interop.StructType<z_stream>;

declare function zlibCompileFlags(): number;

declare function zlibVersion(): string;
