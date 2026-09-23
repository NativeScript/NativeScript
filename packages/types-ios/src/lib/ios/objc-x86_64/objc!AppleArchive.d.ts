
declare const enum AAACEQualifierTypes {

	A_ACE_QUALIFIER_TYPE_USER = 85,

	A_ACE_QUALIFIER_TYPE_GROUP = 71,

	A_ACE_QUALIFIER_TYPE_SID = 83,

	A_ACE_QUALIFIER_TYPE_UUID = 73
}

interface AAAccessControlEntry {
	tag: number;
	perms: number;
	flags: number;
	qualifier_type: number;
}
declare var AAAccessControlEntry: interop.StructType<AAAccessControlEntry>;

/**
 * @since 14.0
 */
declare function AAArchiveStreamCancel(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): void;

/**
 * @since 14.0
 */
declare function AAArchiveStreamClose(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function AAArchiveStreamProcess(istream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, ostream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, msg_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null) => number> | null, flags: number, n_threads: number): number;

/**
 * @since 14.0
 */
declare function AAArchiveStreamReadHeader(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, header: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAArchiveStreamWriteHeader(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAArchiveStreamWritePathList(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, path_list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, dir: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, msg_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null) => number> | null, flags: number, n_threads: number): number;

/**
 * @since 14.0
 */
declare function AAByteStreamCancel(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): void;

/**
 * @since 14.0
 */
declare function AAByteStreamClose(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function AAByteStreamPRead(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, nbyte: number, offset: number): number;

/**
 * @since 14.0
 */
declare function AAByteStreamPWrite(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, nbyte: number, offset: number): number;

/**
 * @since 14.0
 */
declare function AAByteStreamProcess(istream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, ostream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAByteStreamRead(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, nbyte: number): number;

/**
 * @since 14.0
 */
declare function AAByteStreamSeek(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, offset: number, whence: number): number;

/**
 * @since 14.0
 */
declare function AAByteStreamWrite(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, nbyte: number): number;

declare const enum AACompressionAlgorithms {

	A_COMPRESSION_ALGORITHM_NONE = 0,

	A_COMPRESSION_ALGORITHM_LZ4 = 256,

	A_COMPRESSION_ALGORITHM_ZLIB = 1285,

	A_COMPRESSION_ALGORITHM_LZMA = 774,

	A_COMPRESSION_ALGORITHM_LZFSE = 2049,

	A_COMPRESSION_ALGORITHM_LZBITMAP = 1794
}

/**
 * @since 14.0
 */
declare function AACompressionOutputStreamOpen(compressed_stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, compression_algorithm: number, block_size: number, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AACompressionOutputStreamOpenExisting(compressed_stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAConvertArchiveOutputStreamOpen(stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, insert_key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, remove_key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, msg_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null) => number> | null, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AACustomArchiveStreamOpen(): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AACustomArchiveStreamSetCancelProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void> | null): void;

/**
 * @since 14.0
 */
declare function AACustomArchiveStreamSetCloseProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number> | null): void;

/**
 * @since 14.0
 */
declare function AACustomArchiveStreamSetData(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 14.0
 */
declare function AACustomArchiveStreamSetReadHeaderProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number> | null): void;

/**
 * @since 14.0
 */
declare function AACustomArchiveStreamSetWriteHeaderProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => number> | null): void;

/**
 * @since 14.0
 */
declare function AACustomByteStreamOpen(): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AACustomByteStreamSetCancelProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void> | null): void;

/**
 * @since 14.0
 */
declare function AACustomByteStreamSetCloseProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number> | null): void;

/**
 * @since 14.0
 */
declare function AACustomByteStreamSetData(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 14.0
 */
declare function AACustomByteStreamSetPReadProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number) => number> | null): void;

/**
 * @since 14.0
 */
declare function AACustomByteStreamSetPWriteProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number) => number> | null): void;

/**
 * @since 14.0
 */
declare function AACustomByteStreamSetReadProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => number> | null): void;

/**
 * @since 14.0
 */
declare function AACustomByteStreamSetSeekProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: number) => number> | null): void;

/**
 * @since 14.0
 */
declare function AACustomByteStreamSetWriteProc(s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => number> | null): void;

/**
 * @since 14.0
 */
declare function AADecodeArchiveInputStreamOpen(stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, msg_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null) => number> | null, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AADecompressionInputStreamOpen(compressed_stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AADecompressionRandomAccessInputStreamOpen(compressed_stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, alloc_limit: number, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAEncodeArchiveOutputStreamOpen(stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, msg_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null) => number> | null, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobAppendEntry(acl: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, ace: interop.Pointer | interop.Reference<AAAccessControlEntry> | ArrayBufferLike | ArrayBufferView, qualifier_value: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, qualifier_size: number): number;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobApplyToPath(acl: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, dir: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: number): number;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobClear(acl: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobCreate(): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobCreateWithEncodedData(data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data_size: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobCreateWithPath(dir: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobDestroy(acl: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobGetEncodedData(acl: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobGetEncodedSize(acl: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobGetEntry(acl: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, ace: interop.Pointer | interop.Reference<AAAccessControlEntry> | ArrayBufferLike | ArrayBufferView, qualifier_capacity: number, qualifier_value: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, qualifier_size: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobGetEntryCount(acl: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobRemoveEntry(acl: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number): number;

/**
 * @since 14.0
 */
declare function AAEntryACLBlobSetEntry(acl: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, ace: interop.Pointer | interop.Reference<AAAccessControlEntry> | ArrayBufferLike | ArrayBufferView, qualifier_value: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, qualifier_size: number): number;

declare const enum AAEntryMessages {

	A_ENTRY_MESSAGE_SEARCH_PRUNE_DIR = 10,

	A_ENTRY_MESSAGE_SEARCH_EXCLUDE = 11,

	A_ENTRY_MESSAGE_SEARCH_FAIL = 12,

	A_ENTRY_MESSAGE_EXTRACT_BEGIN = 20,

	A_ENTRY_MESSAGE_EXTRACT_END = 21,

	A_ENTRY_MESSAGE_EXTRACT_FAIL = 22,

	A_ENTRY_MESSAGE_EXTRACT_ATTRIBUTES = 23,

	A_ENTRY_MESSAGE_EXTRACT_XAT = 24,

	A_ENTRY_MESSAGE_EXTRACT_ACL = 25,

	A_ENTRY_MESSAGE_ENCODE_SCANNING = 30,

	A_ENTRY_MESSAGE_ENCODE_WRITING = 31,

	A_ENTRY_MESSAGE_CONVERT_EXCLUDE = 40,

	A_ENTRY_MESSAGE_PROCESS_EXCLUDE = 50,

	A_ENTRY_MESSAGE_DECODE_READING = 60
}

declare const enum AAEntryTypes {

	A_ENTRY_TYPE_REG = 70,

	A_ENTRY_TYPE_DIR = 68,

	A_ENTRY_TYPE_LNK = 76,

	A_ENTRY_TYPE_FIFO = 80,

	A_ENTRY_TYPE_CHR = 67,

	A_ENTRY_TYPE_BLK = 66,

	A_ENTRY_TYPE_SOCK = 83,

	A_ENTRY_TYPE_WHT = 87,

	A_ENTRY_TYPE_DOOR = 82,

	A_ENTRY_TYPE_PORT = 84,

	A_ENTRY_TYPE_METADATA = 77
}

/**
 * @since 14.0
 */
declare function AAEntryXATBlobAppendEntry(xat: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, key: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, data_size: number): number;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobApplyToPath(xat: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, dir: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: number): number;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobClear(xat: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobCreate(): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobCreateWithEncodedData(data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, data_size: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobCreateWithPath(dir: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobDestroy(xat: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobGetEncodedData(xat: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobGetEncodedSize(xat: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobGetEntry(xat: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, key_capacity: number, key: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, key_length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, data_capacity: number, data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, data_size: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobGetEntryCount(xat: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobRemoveEntry(xat: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number): number;

/**
 * @since 14.0
 */
declare function AAEntryXATBlobSetEntry(xat: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, key: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, data_size: number): number;

/**
 * @since 14.0
 */
declare function AAExtractArchiveOutputStreamOpen(dir: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, msg_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null) => number> | null, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAFieldKeySetClear(key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAFieldKeySetClone(key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAFieldKeySetCreate(): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAFieldKeySetCreateWithString(s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAFieldKeySetDestroy(key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 14.0
 */
declare function AAFieldKeySetGetKeyCount(key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAFieldKeySetInsertKeySet(key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAFieldKeySetRemoveKeySet(key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAFieldKeySetSelectKeySet(key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, s: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAFieldKeySetSerialize(key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, capacity: number, s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare const enum AAFieldTypes {

	A_FIELD_TYPE_FLAG = 0,

	A_FIELD_TYPE_UINT = 1,

	A_FIELD_TYPE_STRING = 2,

	A_FIELD_TYPE_HASH = 3,

	A_FIELD_TYPE_TIMESPEC = 4,

	A_FIELD_TYPE_BLOB = 5
}

/**
 * @since 14.0
 */
declare function AAFileStreamOpenWithFD(fd: number, automatic_close: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAFileStreamOpenWithPath(path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, open_flags: number, open_mode: number): interop.Pointer | interop.Reference<any> | null;

declare const enum AAFlags {

	A_FLAG_IGNORE_EPERM = 1,

	A_FLAG_ARCHIVE_DEDUPLICATE_DAT = 2,

	A_FLAG_ARCHIVE_NO_RESOLVE_ACL_QUALIFIERS = 4,

	A_FLAG_REPLACE_ATTRIBUTES = 8,

	A_FLAG_EXTRACT_NO_AUTO_DEDUP = 16,

	A_FLAG_EXTRACT_NO_AUTO_SPARSE = 32,

	A_FLAG_CROSS_VOLUME_BOUNDARIES = 64,

	A_FLAG_EXTRACT_AUTO_DEDUP_AS_HARD_LINKS = 128,

	A_FLAG_DECODE_INSERT_IDX = 256,

	A_FLAG_EXCLUDE_METADATA_ENTRIES = 512,

	A_FLAG_PROCESS_RANDOM_ACCESS_OUTPUT = 1024,

	A_FLAG_VERBOSITY_0 = 0,

	A_FLAG_VERBOSITY_1 = 4611686018427387904,

	A_FLAG_VERBOSITY_2 = -9223372036854775808,

	A_FLAG_VERBOSITY_3 = -4611686018427387904
}

declare const enum AAHashFunctions {

	A_HASH_FUNCTION_CRC32 = 1,

	A_HASH_FUNCTION_SHA1 = 2,

	A_HASH_FUNCTION_SHA256 = 3,

	A_HASH_FUNCTION_SHA384 = 4,

	A_HASH_FUNCTION_SHA512 = 5
}

/**
 * @since 14.0
 */
declare function AAHeaderAssign(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, from_header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAHeaderClear(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAHeaderClone(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAHeaderCreate(): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAHeaderCreateWithEncodedData(data_size: number, data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAHeaderCreateWithPath(key_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, dir: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAHeaderDestroy(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 14.0
 */
declare function AAHeaderGetEncodedData(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 14.0
 */
declare function AAHeaderGetEncodedSize(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAHeaderGetFieldBlob(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, size: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView, offset: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAHeaderGetFieldCount(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAHeaderGetFieldHash(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, capacity: number, hash_function: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, value: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null): number;

/**
 * @since 14.0
 */
declare function AAHeaderGetFieldString(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, capacity: number, value: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function AAHeaderGetFieldTimespec(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, value: interop.Pointer | interop.Reference<timespec> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAHeaderGetFieldType(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number): number;

/**
 * @since 14.0
 */
declare function AAHeaderGetFieldUInt(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, value: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAHeaderGetPayloadSize(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAHeaderRemoveField(header: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number): number;

/**
 * @since 14.0
 */
declare function AAPathListCreateWithDirectoryContents(dir: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, msg_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null) => number> | null, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 15.0
 */
declare function AAPathListCreateWithPath(dir: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AAPathListDestroy(path_list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 14.0
 */
declare function AAPathListNodeFirst(path_list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AAPathListNodeGetPath(path_list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, node: number, path_capacity: number, path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, path_length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function AAPathListNodeNext(path_list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, node: number): number;

/**
 * @since 15.0
 */
declare function AARandomAccessByteStreamProcess(istream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, ostream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, max_offset: number, block_size: number, flags: number, n_threads: number): number;

/**
 * @since 14.0
 */
declare function AASharedBufferPipeOpen(ostream: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, istream: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, buffer_capacity: number): number;

/**
 * @since 14.0
 */
declare function AATempFileStreamOpen(): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.5
 */
declare function AEAAuthDataAppendEntry(auth_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, key: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, data_size: number): number;

/**
 * @since 14.5
 */
declare function AEAAuthDataClear(auth_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.5
 */
declare function AEAAuthDataCreate(): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.5
 */
declare function AEAAuthDataCreateWithContext(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.5
 */
declare function AEAAuthDataDestroy(auth_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 14.5
 */
declare function AEAAuthDataGetEncodedData(auth_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 14.5
 */
declare function AEAAuthDataGetEncodedSize(auth_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.5
 */
declare function AEAAuthDataGetEntry(auth_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, key_capacity: number, key: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, key_length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, data_capacity: number, data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, data_size: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.5
 */
declare function AEAAuthDataGetEntryCount(auth_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.5
 */
declare function AEAAuthDataRemoveEntry(auth_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number): number;

/**
 * @since 14.5
 */
declare function AEAAuthDataSetEntry(auth_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, i: number, key: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, data_size: number): number;

/**
 * @since 14.0
 */
declare function AEAContextCreateWithEncryptedStream(encrypted_stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AEAContextCreateWithProfile(profile: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 16.0
 */
declare function AEAContextDecryptAttributes(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AEAContextDestroy(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare const enum AEAContextFieldRepresentations {

	A_CONTEXT_FIELD_REPRESENTATION_RAW = 0,

	A_CONTEXT_FIELD_REPRESENTATION_X963 = 1,

	A_CONTEXT_FIELD_REPRESENTATION_GENERATE = 2
}

declare const enum AEAContextFieldValues {

	A_CONTEXT_CIPHERSUITE_HKDF_SHA256_HMAC = 0,

	A_CONTEXT_CIPHERSUITE_HKDF_SHA256_AESCTR_HMAC = 1,

	A_CONTEXT_SIGNATURE_NONE = 0,

	A_CONTEXT_SIGNATURE_ECDSA_P256 = 1,

	A_CONTEXT_ENCRYPTION_NONE = 0,

	A_CONTEXT_ENCRYPTION_SYMMETRIC = 1,

	A_CONTEXT_ENCRYPTION_ECDHE_P256 = 2,

	A_CONTEXT_ENCRYPTION_SCRYPT = 3,

	A_CONTEXT_CHECKSUM_NONE = 0,

	A_CONTEXT_CHECKSUM_MURMURHASH64 = 1,

	A_CONTEXT_CHECKSUM_SHA256 = 2,

	A_CONTEXT_PADDING_NONE = 0,

	A_CONTEXT_PADDING_ADAPTIVE = 1,

	A_CONTEXT_PADDING_MIN_SIZE = 16
}

declare const enum AEAContextFields {

	A_CONTEXT_FIELD_PROFILE = 0,

	A_CONTEXT_FIELD_PADDING_SIZE = 1,

	A_CONTEXT_FIELD_CHECKSUM_MODE = 2,

	A_CONTEXT_FIELD_COMPRESSION_ALGORITHM = 3,

	A_CONTEXT_FIELD_COMPRESSION_BLOCK_SIZE = 4,

	A_CONTEXT_FIELD_AUTH_DATA = 5,

	A_CONTEXT_FIELD_MAIN_KEY = 6,

	A_CONTEXT_FIELD_SIGNING_PUBLIC_KEY = 7,

	A_CONTEXT_FIELD_SIGNING_PRIVATE_KEY = 8,

	A_CONTEXT_FIELD_SYMMETRIC_KEY = 9,

	A_CONTEXT_FIELD_RECIPIENT_PUBLIC_KEY = 10,

	A_CONTEXT_FIELD_RECIPIENT_PRIVATE_KEY = 11,

	A_CONTEXT_FIELD_SIGNATURE_ENCRYPTION_KEY = 12,

	A_CONTEXT_FIELD_RAW_SIZE = 13,

	A_CONTEXT_FIELD_CONTAINER_SIZE = 14,

	A_CONTEXT_FIELD_BLOCKS_PER_CLUSTER = 17,

	A_CONTEXT_FIELD_ARCHIVE_IDENTIFIER = 18,

	A_CONTEXT_FIELD_PASSWORD = 19
}

/**
 * @since 15.0
 */
declare function AEAContextGenerateFieldBlob(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, field: number): number;

/**
 * @since 14.0
 */
declare function AEAContextGetFieldBlob(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, field: number, representation: number, buf_capacity: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, buf_size: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function AEAContextGetFieldUInt(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, field: number): number;

/**
 * @since 14.0
 */
declare function AEAContextSetFieldBlob(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, field: number, representation: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, buf_size: number): number;

/**
 * @since 14.0
 */
declare function AEAContextSetFieldUInt(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, field: number, value: number): number;

/**
 * @since 14.0
 */
declare function AEADecryptionInputStreamOpen(encrypted_stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AEADecryptionRandomAccessInputStreamOpen(encrypted_stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, alloc_limit: number, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.5
 */
declare function AEAEncryptionOutputStreamCloseAndUpdateContext(stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 14.0
 */
declare function AEAEncryptionOutputStreamOpen(encrypted_stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function AEAEncryptionOutputStreamOpenExisting(encrypted_stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, flags: number, n_threads: number): interop.Pointer | interop.Reference<any> | null;

declare const enum AEAProfiles {

	A_PROFILE__HKDF_SHA256_HMAC__NONE__ECDSA_P256 = 0,

	A_PROFILE__HKDF_SHA256_AESCTR_HMAC__SYMMETRIC__NONE = 1,

	A_PROFILE__HKDF_SHA256_AESCTR_HMAC__SYMMETRIC__ECDSA_P256 = 2,

	A_PROFILE__HKDF_SHA256_AESCTR_HMAC__ECDHE_P256__NONE = 3,

	A_PROFILE__HKDF_SHA256_AESCTR_HMAC__ECDHE_P256__ECDSA_P256 = 4,

	A_PROFILE__HKDF_SHA256_AESCTR_HMAC__SCRYPT__NONE = 5
}

/**
 * @since 14.0
 */
declare function AEAStreamSign(encrypted_stream: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;
