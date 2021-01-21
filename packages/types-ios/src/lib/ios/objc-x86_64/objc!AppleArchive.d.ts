
declare const enum AAACEQualifierTypes {

	A_ACE_QUALIFIER_TYPE_USER = 85,

	A_ACE_QUALIFIER_TYPE_GROUP = 71,

	A_ACE_QUALIFIER_TYPE_SID = 83,

	A_ACE_QUALIFIER_TYPE_UUID = 73
}

interface AAAccessControlEntry {
	tag: acl_tag_t;
	perms: number;
	flags: number;
	qualifier_type: number;
}
declare var AAAccessControlEntry: interop.StructType<AAAccessControlEntry>;

declare function AAArchiveStreamCancel(s: interop.Pointer | interop.Reference<any>): void;

declare function AAArchiveStreamClose(s: interop.Pointer | interop.Reference<any>): number;

declare function AAArchiveStreamProcess(istream: interop.Pointer | interop.Reference<any>, ostream: interop.Pointer | interop.Reference<any>, msg_data: interop.Pointer | interop.Reference<any>, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: interop.Pointer | interop.Reference<any>) => number>, flags: number, n_threads: number): number;

declare function AAArchiveStreamReadHeader(s: interop.Pointer | interop.Reference<any>, header: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function AAArchiveStreamWriteHeader(s: interop.Pointer | interop.Reference<any>, header: interop.Pointer | interop.Reference<any>): number;

declare function AAArchiveStreamWritePathList(s: interop.Pointer | interop.Reference<any>, path_list: interop.Pointer | interop.Reference<any>, key_set: interop.Pointer | interop.Reference<any>, dir: string | interop.Pointer | interop.Reference<any>, msg_data: interop.Pointer | interop.Reference<any>, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: interop.Pointer | interop.Reference<any>) => number>, flags: number, n_threads: number): number;

declare function AAByteStreamCancel(s: interop.Pointer | interop.Reference<any>): void;

declare function AAByteStreamClose(s: interop.Pointer | interop.Reference<any>): number;

declare function AAByteStreamPRead(s: interop.Pointer | interop.Reference<any>, buf: interop.Pointer | interop.Reference<any>, nbyte: number, offset: number): number;

declare function AAByteStreamPWrite(s: interop.Pointer | interop.Reference<any>, buf: interop.Pointer | interop.Reference<any>, nbyte: number, offset: number): number;

declare function AAByteStreamProcess(istream: interop.Pointer | interop.Reference<any>, ostream: interop.Pointer | interop.Reference<any>): number;

declare function AAByteStreamRead(s: interop.Pointer | interop.Reference<any>, buf: interop.Pointer | interop.Reference<any>, nbyte: number): number;

declare function AAByteStreamSeek(s: interop.Pointer | interop.Reference<any>, offset: number, whence: number): number;

declare function AAByteStreamWrite(s: interop.Pointer | interop.Reference<any>, buf: interop.Pointer | interop.Reference<any>, nbyte: number): number;

declare const enum AACompressionAlgorithms {

	A_COMPRESSION_ALGORITHM_NONE = 0,

	A_COMPRESSION_ALGORITHM_LZ4 = 256,

	A_COMPRESSION_ALGORITHM_ZLIB = 1285,

	A_COMPRESSION_ALGORITHM_LZMA = 774,

	A_COMPRESSION_ALGORITHM_LZFSE = 2049
}

declare function AACompressionOutputStreamOpen(compressed_stream: interop.Pointer | interop.Reference<any>, compression_algorithm: number, block_size: number, flags: number, n_threads: number): interop.Pointer | interop.Reference<any>;

declare function AACompressionOutputStreamOpenExisting(compressed_stream: interop.Pointer | interop.Reference<any>, flags: number, n_threads: number): interop.Pointer | interop.Reference<any>;

declare function AAConvertArchiveOutputStreamOpen(stream: interop.Pointer | interop.Reference<any>, insert_key_set: interop.Pointer | interop.Reference<any>, remove_key_set: interop.Pointer | interop.Reference<any>, msg_data: interop.Pointer | interop.Reference<any>, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: interop.Pointer | interop.Reference<any>) => number>, flags: number, n_threads: number): interop.Pointer | interop.Reference<any>;

declare function AACustomArchiveStreamOpen(): interop.Pointer | interop.Reference<any>;

declare function AACustomArchiveStreamSetCancelProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function AACustomArchiveStreamSetCloseProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>): void;

declare function AACustomArchiveStreamSetData(s: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): void;

declare function AACustomArchiveStreamSetReadHeaderProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>): void;

declare function AACustomArchiveStreamSetWriteHeaderProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): void;

declare function AACustomByteStreamOpen(): interop.Pointer | interop.Reference<any>;

declare function AACustomByteStreamSetCancelProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function AACustomByteStreamSetCloseProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>): void;

declare function AACustomByteStreamSetData(s: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): void;

declare function AACustomByteStreamSetPReadProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number) => number>): void;

declare function AACustomByteStreamSetPWriteProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number) => number>): void;

declare function AACustomByteStreamSetReadProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>): void;

declare function AACustomByteStreamSetSeekProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => number>): void;

declare function AACustomByteStreamSetWriteProc(s: interop.Pointer | interop.Reference<any>, proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>): void;

declare function AADecodeArchiveInputStreamOpen(stream: interop.Pointer | interop.Reference<any>, msg_data: interop.Pointer | interop.Reference<any>, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: interop.Pointer | interop.Reference<any>) => number>, flags: number, n_threads: number): interop.Pointer | interop.Reference<any>;

declare function AADecompressionInputStreamOpen(compressed_stream: interop.Pointer | interop.Reference<any>, flags: number, n_threads: number): interop.Pointer | interop.Reference<any>;

declare function AADecompressionRandomAccessInputStreamOpen(compressed_stream: interop.Pointer | interop.Reference<any>, alloc_limit: number, flags: number, n_threads: number): interop.Pointer | interop.Reference<any>;

declare function AAEncodeArchiveOutputStreamOpen(stream: interop.Pointer | interop.Reference<any>, msg_data: interop.Pointer | interop.Reference<any>, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: interop.Pointer | interop.Reference<any>) => number>, flags: number, n_threads: number): interop.Pointer | interop.Reference<any>;

declare function AAEntryACLBlobAppendEntry(acl: interop.Pointer | interop.Reference<any>, ace: interop.Pointer | interop.Reference<AAAccessControlEntry>, qualifier_value: string | interop.Pointer | interop.Reference<any>, qualifier_size: number): number;

declare function AAEntryACLBlobApplyToPath(acl: interop.Pointer | interop.Reference<any>, dir: string | interop.Pointer | interop.Reference<any>, path: string | interop.Pointer | interop.Reference<any>, flags: number): number;

declare function AAEntryACLBlobClear(acl: interop.Pointer | interop.Reference<any>): number;

declare function AAEntryACLBlobCreate(): interop.Pointer | interop.Reference<any>;

declare function AAEntryACLBlobCreateWithEncodedData(data: string | interop.Pointer | interop.Reference<any>, data_size: number): interop.Pointer | interop.Reference<any>;

declare function AAEntryACLBlobCreateWithPath(dir: string | interop.Pointer | interop.Reference<any>, path: string | interop.Pointer | interop.Reference<any>, flags: number): interop.Pointer | interop.Reference<any>;

declare function AAEntryACLBlobDestroy(acl: interop.Pointer | interop.Reference<any>): void;

declare function AAEntryACLBlobGetEncodedData(acl: interop.Pointer | interop.Reference<any>): string;

declare function AAEntryACLBlobGetEncodedSize(acl: interop.Pointer | interop.Reference<any>): number;

declare function AAEntryACLBlobGetEntry(acl: interop.Pointer | interop.Reference<any>, i: number, ace: interop.Pointer | interop.Reference<AAAccessControlEntry>, qualifier_capacity: number, qualifier_value: string | interop.Pointer | interop.Reference<any>, qualifier_size: interop.Pointer | interop.Reference<number>): number;

declare function AAEntryACLBlobGetEntryCount(acl: interop.Pointer | interop.Reference<any>): number;

declare function AAEntryACLBlobRemoveEntry(acl: interop.Pointer | interop.Reference<any>, i: number): number;

declare function AAEntryACLBlobSetEntry(acl: interop.Pointer | interop.Reference<any>, i: number, ace: interop.Pointer | interop.Reference<AAAccessControlEntry>, qualifier_value: string | interop.Pointer | interop.Reference<any>, qualifier_size: number): number;

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

declare function AAEntryXATBlobAppendEntry(xat: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, data: string | interop.Pointer | interop.Reference<any>, data_size: number): number;

declare function AAEntryXATBlobApplyToPath(xat: interop.Pointer | interop.Reference<any>, dir: string | interop.Pointer | interop.Reference<any>, path: string | interop.Pointer | interop.Reference<any>, flags: number): number;

declare function AAEntryXATBlobClear(xat: interop.Pointer | interop.Reference<any>): number;

declare function AAEntryXATBlobCreate(): interop.Pointer | interop.Reference<any>;

declare function AAEntryXATBlobCreateWithEncodedData(data: string | interop.Pointer | interop.Reference<any>, data_size: number): interop.Pointer | interop.Reference<any>;

declare function AAEntryXATBlobCreateWithPath(dir: string | interop.Pointer | interop.Reference<any>, path: string | interop.Pointer | interop.Reference<any>, flags: number): interop.Pointer | interop.Reference<any>;

declare function AAEntryXATBlobDestroy(xat: interop.Pointer | interop.Reference<any>): void;

declare function AAEntryXATBlobGetEncodedData(xat: interop.Pointer | interop.Reference<any>): string;

declare function AAEntryXATBlobGetEncodedSize(xat: interop.Pointer | interop.Reference<any>): number;

declare function AAEntryXATBlobGetEntry(xat: interop.Pointer | interop.Reference<any>, i: number, key_capacity: number, key: string | interop.Pointer | interop.Reference<any>, key_length: interop.Pointer | interop.Reference<number>, data_capacity: number, data: string | interop.Pointer | interop.Reference<any>, data_size: interop.Pointer | interop.Reference<number>): number;

declare function AAEntryXATBlobGetEntryCount(xat: interop.Pointer | interop.Reference<any>): number;

declare function AAEntryXATBlobRemoveEntry(xat: interop.Pointer | interop.Reference<any>, i: number): number;

declare function AAEntryXATBlobSetEntry(xat: interop.Pointer | interop.Reference<any>, i: number, key: string | interop.Pointer | interop.Reference<any>, data: string | interop.Pointer | interop.Reference<any>, data_size: number): number;

declare function AAExtractArchiveOutputStreamOpen(dir: string | interop.Pointer | interop.Reference<any>, msg_data: interop.Pointer | interop.Reference<any>, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: interop.Pointer | interop.Reference<any>) => number>, flags: number, n_threads: number): interop.Pointer | interop.Reference<any>;

declare function AAFieldKeySetClear(key_set: interop.Pointer | interop.Reference<any>): number;

declare function AAFieldKeySetClone(key_set: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function AAFieldKeySetCreate(): interop.Pointer | interop.Reference<any>;

declare function AAFieldKeySetCreateWithString(s: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function AAFieldKeySetDestroy(key_set: interop.Pointer | interop.Reference<any>): void;

declare function AAFieldKeySetGetKeyCount(key_set: interop.Pointer | interop.Reference<any>): number;

declare function AAFieldKeySetInsertKeySet(key_set: interop.Pointer | interop.Reference<any>, s: interop.Pointer | interop.Reference<any>): number;

declare function AAFieldKeySetRemoveKeySet(key_set: interop.Pointer | interop.Reference<any>, s: interop.Pointer | interop.Reference<any>): number;

declare function AAFieldKeySetSelectKeySet(key_set: interop.Pointer | interop.Reference<any>, s: interop.Pointer | interop.Reference<any>): number;

declare function AAFieldKeySetSerialize(key_set: interop.Pointer | interop.Reference<any>, capacity: number, s: string | interop.Pointer | interop.Reference<any>): number;

declare const enum AAFieldTypes {

	A_FIELD_TYPE_FLAG = 0,

	A_FIELD_TYPE_UINT = 1,

	A_FIELD_TYPE_STRING = 2,

	A_FIELD_TYPE_HASH = 3,

	A_FIELD_TYPE_TIMESPEC = 4,

	A_FIELD_TYPE_BLOB = 5
}

declare function AAFileStreamOpenWithFD(fd: number, automatic_close: number): interop.Pointer | interop.Reference<any>;

declare function AAFileStreamOpenWithPath(path: string | interop.Pointer | interop.Reference<any>, open_flags: number, open_mode: number): interop.Pointer | interop.Reference<any>;

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

declare function AAHeaderAssign(header: interop.Pointer | interop.Reference<any>, from_header: interop.Pointer | interop.Reference<any>): number;

declare function AAHeaderClear(header: interop.Pointer | interop.Reference<any>): number;

declare function AAHeaderClone(header: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function AAHeaderCreate(): interop.Pointer | interop.Reference<any>;

declare function AAHeaderCreateWithEncodedData(data_size: number, data: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function AAHeaderCreateWithPath(key_set: interop.Pointer | interop.Reference<any>, dir: string | interop.Pointer | interop.Reference<any>, path: string | interop.Pointer | interop.Reference<any>, flags: number): interop.Pointer | interop.Reference<any>;

declare function AAHeaderDestroy(header: interop.Pointer | interop.Reference<any>): void;

declare function AAHeaderGetEncodedData(header: interop.Pointer | interop.Reference<any>): string;

declare function AAHeaderGetEncodedSize(header: interop.Pointer | interop.Reference<any>): number;

declare function AAHeaderGetFieldBlob(header: interop.Pointer | interop.Reference<any>, i: number, size: interop.Pointer | interop.Reference<number>, offset: interop.Pointer | interop.Reference<number>): number;

declare function AAHeaderGetFieldCount(header: interop.Pointer | interop.Reference<any>): number;

declare function AAHeaderGetFieldHash(header: interop.Pointer | interop.Reference<any>, i: number, capacity: number, hash_function: interop.Pointer | interop.Reference<number>, value: string | interop.Pointer | interop.Reference<any>): number;

declare function AAHeaderGetFieldString(header: interop.Pointer | interop.Reference<any>, i: number, capacity: number, value: string | interop.Pointer | interop.Reference<any>, length: interop.Pointer | interop.Reference<number>): number;

declare function AAHeaderGetFieldTimespec(header: interop.Pointer | interop.Reference<any>, i: number, value: interop.Pointer | interop.Reference<timespec>): number;

declare function AAHeaderGetFieldType(header: interop.Pointer | interop.Reference<any>, i: number): number;

declare function AAHeaderGetFieldUInt(header: interop.Pointer | interop.Reference<any>, i: number, value: interop.Pointer | interop.Reference<number>): number;

declare function AAHeaderGetPayloadSize(header: interop.Pointer | interop.Reference<any>): number;

declare function AAHeaderRemoveField(header: interop.Pointer | interop.Reference<any>, i: number): number;

declare function AAPathListCreateWithDirectoryContents(dir: string | interop.Pointer | interop.Reference<any>, path: string | interop.Pointer | interop.Reference<any>, msg_data: interop.Pointer | interop.Reference<any>, msg_proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: interop.Pointer | interop.Reference<any>) => number>, flags: number, n_threads: number): interop.Pointer | interop.Reference<any>;

declare function AAPathListDestroy(path_list: interop.Pointer | interop.Reference<any>): void;

declare function AAPathListNodeFirst(path_list: interop.Pointer | interop.Reference<any>): number;

declare function AAPathListNodeGetPath(path_list: interop.Pointer | interop.Reference<any>, node: number, path_capacity: number, path: string | interop.Pointer | interop.Reference<any>, path_length: interop.Pointer | interop.Reference<number>): number;

declare function AAPathListNodeNext(path_list: interop.Pointer | interop.Reference<any>, node: number): number;

declare function AASharedBufferPipeOpen(ostream: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, istream: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, buffer_capacity: number): number;

declare function AATempFileStreamOpen(): interop.Pointer | interop.Reference<any>;
