
interface Fts5ExtensionApi {
	iVersion: number;
	xUserData: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<any> | null>;
	xColumnCount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xRowCount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<number> | null) => number>;
	xColumnTotalSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<number> | null) => number>;
	xTokenize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: number, p6: number) => number>) => number>;
	xPhraseCount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xPhraseSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number) => number>;
	xInstCount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<number> | null) => number>;
	xInst: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<number> | null, p4: interop.Pointer | interop.Reference<number> | null, p5: interop.Pointer | interop.Reference<number> | null) => number>;
	xRowid: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xColumnText: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p4: interop.Pointer | interop.Reference<number> | null) => number>;
	xColumnSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<number> | null) => number>;
	xQueryPhrase: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<Fts5ExtensionApi> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => number>) => number>;
	xSetAuxdata: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>) => number>;
	xGetAuxdata: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number) => interop.Pointer | interop.Reference<any> | null>;
	xPhraseFirst: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<Fts5PhraseIter> | null, p4: interop.Pointer | interop.Reference<number> | null, p5: interop.Pointer | interop.Reference<number> | null) => number>;
	xPhraseNext: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<Fts5PhraseIter> | null, p3: interop.Pointer | interop.Reference<number> | null, p4: interop.Pointer | interop.Reference<number> | null) => void>;
	xPhraseFirstColumn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<Fts5PhraseIter> | null, p4: interop.Pointer | interop.Reference<number> | null) => number>;
	xPhraseNextColumn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<Fts5PhraseIter> | null, p3: interop.Pointer | interop.Reference<number> | null) => void>;
	xQueryToken: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p5: interop.Pointer | interop.Reference<number> | null) => number>;
	xInstToken: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p5: interop.Pointer | interop.Reference<number> | null) => number>;
	xColumnLocale: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p4: interop.Pointer | interop.Reference<number> | null) => number>;
	xTokenize_v2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null, p5: number, p6: interop.Pointer | interop.Reference<any> | null, p7: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: number, p6: number) => number>) => number>;
}
declare var Fts5ExtensionApi: interop.StructType<Fts5ExtensionApi>;

interface Fts5PhraseIter {
	a: interop.Pointer | interop.Reference<any> | null;
	b: interop.Pointer | interop.Reference<any> | null;
}
declare var Fts5PhraseIter: interop.StructType<Fts5PhraseIter>;

interface fts5_api {
	iVersion: number;
	xCreateTokenizer: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<fts5_api> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<fts5_tokenizer> | null, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>) => number>;
	xFindTokenizer: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<fts5_api> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p4: interop.Pointer | interop.Reference<fts5_tokenizer> | null) => number>;
	xCreateFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<fts5_api> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<Fts5ExtensionApi> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void>, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>) => number>;
	xCreateTokenizer_v2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<fts5_api> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<fts5_tokenizer_v2> | null, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>) => number>;
	xFindTokenizer_v2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<fts5_api> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<fts5_tokenizer_v2> | null> | null) => number>;
}
declare var fts5_api: interop.StructType<fts5_api>;

interface fts5_tokenizer {
	xCreate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
	xDelete: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	xTokenize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null, p5: number, p6: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: number, p6: number) => number>) => number>;
}
declare var fts5_tokenizer: interop.StructType<fts5_tokenizer>;

interface fts5_tokenizer_v2 {
	iVersion: number;
	xCreate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
	xDelete: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	xTokenize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null, p5: number, p6: interop.Pointer | interop.Reference<any> | null, p7: number, p8: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: number, p6: number) => number>) => number>;
}
declare var fts5_tokenizer_v2: interop.StructType<fts5_tokenizer_v2>;

declare function sqlite3_aggregate_context(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nBytes: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 3.0
 * @deprecated 3.0
 */
declare function sqlite3_aggregate_count(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.2
 * @deprecated 8.2
 */
declare function sqlite3_auto_extension(xEntryPoint: interop.FunctionReference<() => void>): number;

/**
 * @since 15.4
 */
declare function sqlite3_autovacuum_pages(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number, p5: number) => number>, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_backup_finish(p: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_backup_init(pDest: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zDestName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pSource: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSourceName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_backup_pagecount(p: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_backup_remaining(p: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_backup_step(p: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nPage: number): number;

declare function sqlite3_bind_blob(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, n: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_bind_blob64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_bind_double(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number): number;

declare function sqlite3_bind_int(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number): number;

declare function sqlite3_bind_int64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number): number;

declare function sqlite3_bind_null(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function sqlite3_bind_parameter_count(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_bind_parameter_index(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_bind_parameter_name(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 12.0
 */
declare function sqlite3_bind_pointer(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_bind_text(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_bind_text16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_bind_text64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, encoding: number): number;

declare function sqlite3_bind_value(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_bind_zeroblob(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, n: number): number;

/**
 * @since 10.0
 */
declare function sqlite3_bind_zeroblob64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: number): number;

declare function sqlite3_blob_bytes(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_blob_close(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_blob_open(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zDb: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zTable: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zColumn: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iRow: number, flags: number, ppBlob: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_blob_read(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, Z: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, N: number, iOffset: number): number;

/**
 * @since 5.0
 */
declare function sqlite3_blob_reopen(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

declare function sqlite3_blob_write(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, z: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, n: number, iOffset: number): number;

declare function sqlite3_busy_handler(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number) => number>, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_busy_timeout(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ms: number): number;

/**
 * @since 12.0
 * @deprecated 12.0
 */
declare function sqlite3_cancel_auto_extension(xEntryPoint: interop.FunctionReference<() => void>): number;

declare function sqlite3_changes(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 15.4
 */
declare function sqlite3_changes64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_clear_bindings(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_close(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.2
 */
declare function sqlite3_close_v2(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_collation_needed(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_collation_needed16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_column_blob(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iCol: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_bytes(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iCol: number): number;

declare function sqlite3_column_bytes16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iCol: number): number;

declare function sqlite3_column_count(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_column_database_name(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_database_name16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_decltype(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_decltype16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_double(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iCol: number): number;

declare function sqlite3_column_int(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iCol: number): number;

declare function sqlite3_column_int64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iCol: number): number;

declare function sqlite3_column_name(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, N: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_name16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, N: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_origin_name(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_origin_name16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_table_name(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_table_name16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_text(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iCol: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_text16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iCol: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_column_type(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iCol: number): number;

declare function sqlite3_column_value(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, iCol: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_commit_hook(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 5.0
 */
declare function sqlite3_compileoption_get(N: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 5.0
 */
declare function sqlite3_compileoption_used(zOptName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_complete(sql: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_complete16(sql: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_context_db_handle(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_create_collation(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, eTextRep: number, pArg: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xCompare: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: interop.Pointer | interop.Reference<any> | null) => number>): number;

declare function sqlite3_create_collation16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zName: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, eTextRep: number, pArg: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xCompare: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: interop.Pointer | interop.Reference<any> | null) => number>): number;

declare function sqlite3_create_collation_v2(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, eTextRep: number, pArg: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xCompare: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: interop.Pointer | interop.Reference<any> | null) => number>, xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

/**
 * @since 14.0
 */
declare function sqlite3_create_filename(zDatabase: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zJournal: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zWal: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nParam: number, azParam: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_create_function(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zFunctionName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nArg: number, eTextRep: number, pApp: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void>, xStep: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void>, xFinal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_create_function16(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zFunctionName: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nArg: number, eTextRep: number, pApp: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void>, xStep: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void>, xFinal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

/**
 * @since 5.0
 */
declare function sqlite3_create_function_v2(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zFunctionName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nArg: number, eTextRep: number, pApp: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void>, xStep: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void>, xFinal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_create_module(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p: interop.Pointer | interop.Reference<sqlite3_module> | ArrayBufferLike | ArrayBufferView | null, pClientData: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_create_module_v2(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p: interop.Pointer | interop.Reference<sqlite3_module> | ArrayBufferLike | ArrayBufferView | null, pClientData: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

/**
 * @since 13.0
 */
declare function sqlite3_create_window_function(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zFunctionName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nArg: number, eTextRep: number, pApp: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xStep: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void>, xFinal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, xValue: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, xInverse: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void>, xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_data_count(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 6.0
 */
declare var sqlite3_data_directory: interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function sqlite3_database_file_object(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<sqlite3_file> | null;

/**
 * @since 10.0
 */
declare function sqlite3_db_cacheflush(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 6.0
 */
declare function sqlite3_db_filename(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zDbName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_db_handle(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_db_mutex(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 16.0
 */
declare function sqlite3_db_name(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, N: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 6.0
 */
declare function sqlite3_db_readonly(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zDbName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_db_release_memory(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_db_status(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, op: number, pCur: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, pHiwtr: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, resetFlg: number): number;

declare function sqlite3_declare_vtab(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSQL: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 12.0
 */
declare function sqlite3_deserialize(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSchema: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pData: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, szDb: number, szBuf: number, mFlags: number): number;

declare function sqlite3_drop_modules(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, azKeep: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 3.0
 * @deprecated 5.0
 */
declare function sqlite3_enable_shared_cache(p1: number): number;

declare function sqlite3_errcode(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_errmsg(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_errmsg16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 16.0
 */
declare function sqlite3_error_offset(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.2
 */
declare function sqlite3_errstr(p1: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_exec(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, sql: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, errmsg: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function sqlite3_expanded_sql(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 3.0
 * @deprecated 3.0
 */
declare function sqlite3_expired(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_extended_errcode(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_extended_result_codes(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, onoff: number): number;

interface sqlite3_file {
	pMethods: interop.Pointer | interop.Reference<sqlite3_io_methods> | null;
}
declare var sqlite3_file: interop.StructType<sqlite3_file>;

declare function sqlite3_file_control(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zDbName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, op: number, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function sqlite3_filename_database(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function sqlite3_filename_journal(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 14.0
 */
declare function sqlite3_filename_wal(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_finalize(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_free(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 14.0
 */
declare function sqlite3_free_filename(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function sqlite3_free_table(result: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): void;

declare function sqlite3_get_autocommit(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_get_auxdata(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, N: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 26.0
 */
declare function sqlite3_get_clientdata(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_get_table(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSql: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pazResult: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null> | ArrayBufferLike | ArrayBufferView | null, pnRow: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, pnColumn: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, pzErrmsg: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 3.0
 * @deprecated 3.0
 */
declare function sqlite3_global_recover(): number;

interface sqlite3_index_constraint {
	iColumn: number;
	op: number;
	usable: number;
	iTermOffset: number;
}
declare var sqlite3_index_constraint: interop.StructType<sqlite3_index_constraint>;

interface sqlite3_index_constraint_usage {
	argvIndex: number;
	omit: number;
}
declare var sqlite3_index_constraint_usage: interop.StructType<sqlite3_index_constraint_usage>;

interface sqlite3_index_info {
	nConstraint: number;
	aConstraint: interop.Pointer | interop.Reference<sqlite3_index_constraint> | null;
	nOrderBy: number;
	aOrderBy: interop.Pointer | interop.Reference<sqlite3_index_orderby> | null;
	aConstraintUsage: interop.Pointer | interop.Reference<sqlite3_index_constraint_usage> | null;
	idxNum: number;
	idxStr: interop.Pointer | interop.Reference<any> | null;
	needToFreeIdxStr: number;
	orderByConsumed: number;
	estimatedCost: number;
	estimatedRows: number;
	idxFlags: number;
	colUsed: number;
}
declare var sqlite3_index_info: interop.StructType<sqlite3_index_info>;

interface sqlite3_index_orderby {
	iColumn: number;
	desc: number;
}
declare var sqlite3_index_orderby: interop.StructType<sqlite3_index_orderby>;

declare function sqlite3_initialize(): number;

declare function sqlite3_interrupt(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

interface sqlite3_io_methods {
	iVersion: number;
	xClose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null) => number>;
	xRead: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number) => number>;
	xWrite: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number) => number>;
	xTruncate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: number) => number>;
	xSync: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: number) => number>;
	xFileSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: interop.Pointer | interop.Reference<number> | null) => number>;
	xLock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: number) => number>;
	xUnlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: number) => number>;
	xCheckReservedLock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: interop.Pointer | interop.Reference<number> | null) => number>;
	xFileControl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => number>;
	xSectorSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null) => number>;
	xDeviceCharacteristics: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null) => number>;
	xShmMap: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: number, p3: number, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
	xShmLock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: number, p3: number, p4: number) => number>;
	xShmBarrier: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null) => void>;
	xShmUnmap: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: number) => number>;
	xFetch: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: number, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
	xUnfetch: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => number>;
}
declare var sqlite3_io_methods: interop.StructType<sqlite3_io_methods>;

/**
 * @since 17.2
 */
declare function sqlite3_is_interrupted(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 12.0
 */
declare function sqlite3_keyword_check(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): number;

/**
 * @since 12.0
 */
declare function sqlite3_keyword_count(): number;

/**
 * @since 12.0
 */
declare function sqlite3_keyword_name(p1: number, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_last_insert_rowid(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_libversion(): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_libversion_number(): number;

declare function sqlite3_limit(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, id: number, newVal: number): number;

declare function sqlite3_malloc(p1: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 9.0
 */
declare function sqlite3_malloc64(p1: number): interop.Pointer | interop.Reference<any> | null;

interface sqlite3_mem_methods {
	xMalloc: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any> | null>;
	xFree: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	xRealloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number) => interop.Pointer | interop.Reference<any> | null>;
	xSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xRoundup: interop.FunctionReference<(p1: number) => number>;
	xInit: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xShutdown: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	pAppData: interop.Pointer | interop.Reference<any> | null;
}
declare var sqlite3_mem_methods: interop.StructType<sqlite3_mem_methods>;

/**
 * @since 3.0
 * @deprecated 3.0
 */
declare function sqlite3_memory_alarm(p1: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: number) => void>, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

declare function sqlite3_memory_highwater(resetFlag: number): number;

declare function sqlite3_memory_used(): number;

interface sqlite3_module {
	iVersion: number;
	xCreate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<sqlite3_vtab> | null> | null, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
	xConnect: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<sqlite3_vtab> | null> | null, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
	xBestIndex: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null, p2: interop.Pointer | interop.Reference<sqlite3_index_info> | null) => number>;
	xDisconnect: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null) => number>;
	xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null) => number>;
	xOpen: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<sqlite3_vtab_cursor> | null> | null) => number>;
	xClose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor> | null) => number>;
	xFilter: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
	xNext: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor> | null) => number>;
	xEof: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor> | null) => number>;
	xColumn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => number>;
	xRowid: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor> | null, p2: interop.Pointer | interop.Reference<number> | null) => number>;
	xUpdate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null, p4: interop.Pointer | interop.Reference<number> | null) => number>;
	xBegin: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null) => number>;
	xSync: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null) => number>;
	xCommit: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null) => number>;
	xRollback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null) => number>;
	xFindFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => void>> | null, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
	xRename: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null, p2: interop.Pointer | interop.Reference<any> | null) => number>;
	xSavepoint: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null, p2: number) => number>;
	xRelease: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null, p2: number) => number>;
	xRollbackTo: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null, p2: number) => number>;
	xShadowName: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xIntegrity: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => number>;
}
declare var sqlite3_module: interop.StructType<sqlite3_module>;

/**
 * @since 9.0
 */
declare function sqlite3_msize(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_mutex_alloc(p1: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_mutex_enter(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function sqlite3_mutex_free(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function sqlite3_mutex_leave(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

interface sqlite3_mutex_methods {
	xMutexInit: interop.FunctionReference<() => number>;
	xMutexEnd: interop.FunctionReference<() => number>;
	xMutexAlloc: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any> | null>;
	xMutexFree: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	xMutexEnter: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	xMutexTry: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xMutexLeave: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	xMutexHeld: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xMutexNotheld: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
}
declare var sqlite3_mutex_methods: interop.StructType<sqlite3_mutex_methods>;

declare function sqlite3_mutex_try(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_next_stmt(pDb: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 15.0
 */
declare function sqlite3_normalized_sql(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_open(filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ppDb: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_open16(filename: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ppDb: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_open_v2(filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ppDb: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, flags: number, zVfs: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_os_end(): number;

declare function sqlite3_os_init(): number;

declare function sqlite3_overload_function(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zFuncName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nArg: number): number;

interface sqlite3_pcache_methods {
	pArg: interop.Pointer | interop.Reference<any> | null;
	xInit: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xShutdown: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	xCreate: interop.FunctionReference<(p1: number, p2: number) => interop.Pointer | interop.Reference<any> | null>;
	xCachesize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number) => void>;
	xPagecount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xFetch: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: number) => interop.Pointer | interop.Reference<any> | null>;
	xUnpin: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => void>;
	xRekey: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number) => void>;
	xTruncate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number) => void>;
	xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
}
declare var sqlite3_pcache_methods: interop.StructType<sqlite3_pcache_methods>;

interface sqlite3_pcache_methods2 {
	iVersion: number;
	pArg: interop.Pointer | interop.Reference<any> | null;
	xInit: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xShutdown: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	xCreate: interop.FunctionReference<(p1: number, p2: number, p3: number) => interop.Pointer | interop.Reference<any> | null>;
	xCachesize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number) => void>;
	xPagecount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>;
	xFetch: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: number) => interop.Pointer | interop.Reference<sqlite3_pcache_page> | null>;
	xUnpin: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<sqlite3_pcache_page> | null, p3: number) => void>;
	xRekey: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<sqlite3_pcache_page> | null, p3: number, p4: number) => void>;
	xTruncate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number) => void>;
	xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	xShrink: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
}
declare var sqlite3_pcache_methods2: interop.StructType<sqlite3_pcache_methods2>;

interface sqlite3_pcache_page {
	pBuf: interop.Pointer | interop.Reference<any> | null;
	pExtra: interop.Pointer | interop.Reference<any> | null;
}
declare var sqlite3_pcache_page: interop.StructType<sqlite3_pcache_page>;

declare function sqlite3_prepare(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSql: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nByte: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, pzTail: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_prepare16(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSql: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nByte: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, pzTail: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_prepare16_v2(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSql: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nByte: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, pzTail: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 12.0
 */
declare function sqlite3_prepare16_v3(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSql: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nByte: number, prepFlags: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, pzTail: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_prepare_v2(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSql: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nByte: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, pzTail: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 12.0
 */
declare function sqlite3_prepare_v3(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSql: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nByte: number, prepFlags: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, pzTail: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 3.0
 * @deprecated 10.0
 */
declare function sqlite3_profile(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xProfile: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => void>, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_progress_handler(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => number>, p4: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function sqlite3_randomness(N: number, P: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function sqlite3_realloc(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 9.0
 */
declare function sqlite3_realloc64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 6.0
 */
declare function sqlite3_release_memory(p1: number): number;

declare function sqlite3_reset(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 12.0
 * @deprecated 12.0
 */
declare function sqlite3_reset_auto_extension(): void;

declare function sqlite3_result_blob(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function sqlite3_result_blob64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function sqlite3_result_double(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): void;

declare function sqlite3_result_error(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): void;

declare function sqlite3_result_error16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): void;

declare function sqlite3_result_error_code(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): void;

declare function sqlite3_result_error_nomem(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function sqlite3_result_error_toobig(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function sqlite3_result_int(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): void;

declare function sqlite3_result_int64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): void;

declare function sqlite3_result_null(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 12.0
 */
declare function sqlite3_result_pointer(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

/**
 * @since 10.0
 */
declare function sqlite3_result_subtype(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): void;

declare function sqlite3_result_text(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function sqlite3_result_text16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function sqlite3_result_text16be(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function sqlite3_result_text16le(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function sqlite3_result_text64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, encoding: number): void;

declare function sqlite3_result_value(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function sqlite3_result_zeroblob(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, n: number): void;

/**
 * @since 10.0
 */
declare function sqlite3_result_zeroblob64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, n: number): number;

declare function sqlite3_rollback_hook(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

interface sqlite3_rtree_geometry {
	pContext: interop.Pointer | interop.Reference<any> | null;
	nParam: number;
	aParam: interop.Pointer | interop.Reference<number> | null;
	pUser: interop.Pointer | interop.Reference<any> | null;
	xDelUser: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
}
declare var sqlite3_rtree_geometry: interop.StructType<sqlite3_rtree_geometry>;

/**
 * @since 5.0
 */
declare function sqlite3_rtree_geometry_callback(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zGeom: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xGeom: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_rtree_geometry> | null, p2: number, p3: interop.Pointer | interop.Reference<number> | null, p4: interop.Pointer | interop.Reference<number> | null) => number>, pContext: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 8.2
 */
declare function sqlite3_rtree_query_callback(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zQueryFunc: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xQueryFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_rtree_query_info> | null) => number>, pContext: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xDestructor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

interface sqlite3_rtree_query_info {
	pContext: interop.Pointer | interop.Reference<any> | null;
	nParam: number;
	aParam: interop.Pointer | interop.Reference<number> | null;
	pUser: interop.Pointer | interop.Reference<any> | null;
	xDelUser: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	aCoord: interop.Pointer | interop.Reference<number> | null;
	anQueue: interop.Pointer | interop.Reference<number> | null;
	nCoord: number;
	iLevel: number;
	mxLevel: number;
	iRowid: number;
	rParentScore: number;
	eParentWithin: number;
	eWithin: number;
	rScore: number;
	apSqlParam: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;
}
declare var sqlite3_rtree_query_info: interop.StructType<sqlite3_rtree_query_info>;

/**
 * @since 12.0
 */
declare function sqlite3_serialize(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSchema: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, piSize: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, mFlags: number): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_set_authorizer(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xAuth: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null, p5: interop.Pointer | interop.Reference<any> | null, p6: interop.Pointer | interop.Reference<any> | null) => number>, pUserData: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_set_auxdata(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, N: number, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

/**
 * @since 26.0
 */
declare function sqlite3_set_clientdata(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): number;

declare function sqlite3_set_last_insert_rowid(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: number): void;

declare function sqlite3_setlk_timeout(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ms: number, flags: number): number;

declare function sqlite3_shutdown(): number;

declare function sqlite3_sleep(p1: number): number;

interface sqlite3_snapshot {
	hidden: interop.Reference<number>;
}
declare var sqlite3_snapshot: interop.StructType<sqlite3_snapshot>;

/**
 * @since 10.0
 */
declare function sqlite3_snapshot_cmp(p1: interop.Pointer | interop.Reference<sqlite3_snapshot> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<sqlite3_snapshot> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function sqlite3_snapshot_free(p1: interop.Pointer | interop.Reference<sqlite3_snapshot> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 10.0
 */
declare function sqlite3_snapshot_get(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSchema: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ppSnapshot: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<sqlite3_snapshot> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function sqlite3_snapshot_open(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSchema: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pSnapshot: interop.Pointer | interop.Reference<sqlite3_snapshot> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 11.0
 */
declare function sqlite3_snapshot_recover(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zDb: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 3.0
 * @deprecated 5.0
 */
declare function sqlite3_soft_heap_limit(N: number): void;

/**
 * @since 5.0
 */
declare function sqlite3_soft_heap_limit64(N: number): number;

/**
 * @since 4.0
 */
declare function sqlite3_sourceid(): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_sql(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_status(op: number, pCurrent: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, pHighwater: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, resetFlag: number): number;

/**
 * @since 9.0
 */
declare function sqlite3_status64(op: number, pCurrent: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, pHighwater: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, resetFlag: number): number;

declare function sqlite3_step(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 6.0
 */
declare function sqlite3_stmt_busy(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 17.2
 */
declare function sqlite3_stmt_explain(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, eMode: number): number;

/**
 * @since 13.0
 */
declare function sqlite3_stmt_isexplain(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 5.0
 */
declare function sqlite3_stmt_readonly(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function sqlite3_stmt_scanstatus(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, idx: number, iScanStatusOp: number, pOut: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 14.0
 */
declare function sqlite3_stmt_scanstatus_reset(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 17.2
 */
declare function sqlite3_stmt_scanstatus_v2(pStmt: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, idx: number, iScanStatusOp: number, flags: number, pOut: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_stmt_status(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, op: number, resetFlg: number): number;

/**
 * @since 12.0
 */
declare function sqlite3_str_append(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zIn: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, N: number): void;

/**
 * @since 12.0
 */
declare function sqlite3_str_appendall(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zIn: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 12.0
 */
declare function sqlite3_str_appendchar(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, N: number, C: number): void;

/**
 * @since 12.0
 */
declare function sqlite3_str_errcode(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 12.0
 */
declare function sqlite3_str_finish(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 12.0
 */
declare function sqlite3_str_length(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 12.0
 */
declare function sqlite3_str_new(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 12.0
 */
declare function sqlite3_str_reset(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 12.0
 */
declare function sqlite3_str_value(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 8.2
 */
declare function sqlite3_strglob(zGlob: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zStr: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 6.0
 */
declare function sqlite3_stricmp(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function sqlite3_strlike(zGlob: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zStr: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, cEsc: number): number;

/**
 * @since 4.0
 */
declare function sqlite3_strnicmp(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

/**
 * @since 10.0
 */
declare function sqlite3_system_errno(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_table_column_metadata(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zDbName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zTableName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zColumnName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pzDataType: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, pzCollSeq: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, pNotNull: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, pPrimaryKey: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, pAutoinc: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare var sqlite3_temp_directory: interop.Pointer | interop.Reference<any> | null;

/**
 * @since 3.0
 * @deprecated 3.0
 */
declare function sqlite3_thread_cleanup(): void;

declare function sqlite3_threadsafe(): number;

declare function sqlite3_total_changes(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 15.4
 */
declare function sqlite3_total_changes64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 5.0
 * @deprecated 10.0
 */
declare function sqlite3_trace(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xTrace: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => void>, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function sqlite3_trace_v2(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, uMask: number, xCallback: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null) => number>, pCtx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 3.0
 * @deprecated 3.0
 */
declare function sqlite3_transfer_bindings(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 15.0
 */
declare function sqlite3_txn_state(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zSchema: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_update_hook(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null, p5: number) => void>, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 6.0
 */
declare function sqlite3_uri_boolean(z: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zParam: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, bDefault: number): number;

/**
 * @since 6.0
 */
declare function sqlite3_uri_int64(p1: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p3: number): number;

/**
 * @since 14.0
 */
declare function sqlite3_uri_key(z: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, N: number): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 5.0
 */
declare function sqlite3_uri_parameter(z: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zParam: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_user_data(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_value_blob(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_value_bytes(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_value_bytes16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_value_double(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function sqlite3_value_dup(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 17.2
 */
declare function sqlite3_value_encoding(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function sqlite3_value_free(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 13.0
 */
declare function sqlite3_value_frombind(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_value_int(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_value_int64(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 12.0
 */
declare function sqlite3_value_nochange(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_value_numeric_type(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 12.0
 */
declare function sqlite3_value_pointer(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function sqlite3_value_subtype(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function sqlite3_value_text(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_value_text16(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_value_text16be(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_value_text16le(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function sqlite3_value_type(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare var sqlite3_version: interop.Reference<number>;

interface sqlite3_vfs {
	iVersion: number;
	szOsFile: number;
	mxPathname: number;
	pNext: interop.Pointer | interop.Reference<sqlite3_vfs> | null;
	zName: interop.Pointer | interop.Reference<any> | null;
	pAppData: interop.Pointer | interop.Reference<any> | null;
	xOpen: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<sqlite3_file> | null, p4: number, p5: interop.Pointer | interop.Reference<number> | null) => number>;
	xDelete: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => number>;
	xAccess: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<number> | null) => number>;
	xFullPathname: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null) => number>;
	xDlOpen: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<any> | null>;
	xDlError: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => void>;
	xDlSym: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => interop.FunctionReference<() => void>>;
	xDlClose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<any> | null) => void>;
	xRandomness: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => number>;
	xSleep: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: number) => number>;
	xCurrentTime: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<number> | null) => number>;
	xGetLastError: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => number>;
	xCurrentTimeInt64: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<number> | null) => number>;
	xSetSystemCall: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.FunctionReference<() => void>) => number>;
	xGetSystemCall: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<any> | null) => interop.FunctionReference<() => void>>;
	xNextSystemCall: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | null, p2: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<any> | null>;
}
declare var sqlite3_vfs: interop.StructType<sqlite3_vfs>;

declare function sqlite3_vfs_find(zVfsName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<sqlite3_vfs> | null;

declare function sqlite3_vfs_register(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | ArrayBufferLike | ArrayBufferView | null, makeDflt: number): number;

declare function sqlite3_vfs_unregister(p1: interop.Pointer | interop.Reference<sqlite3_vfs> | ArrayBufferLike | ArrayBufferView | null): number;

interface sqlite3_vtab {
	pModule: interop.Pointer | interop.Reference<sqlite3_module> | null;
	nRef: number;
	zErrMsg: interop.Pointer | interop.Reference<any> | null;
}
declare var sqlite3_vtab: interop.StructType<sqlite3_vtab>;

/**
 * @since 12.0
 */
declare function sqlite3_vtab_collation(p1: interop.Pointer | interop.Reference<sqlite3_index_info> | ArrayBufferLike | ArrayBufferView | null, p2: number): interop.Pointer | interop.Reference<any> | null;

interface sqlite3_vtab_cursor {
	pVtab: interop.Pointer | interop.Reference<sqlite3_vtab> | null;
}
declare var sqlite3_vtab_cursor: interop.StructType<sqlite3_vtab_cursor>;

/**
 * @since 16.0
 */
declare function sqlite3_vtab_distinct(p1: interop.Pointer | interop.Reference<sqlite3_index_info> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 16.0
 */
declare function sqlite3_vtab_in(p1: interop.Pointer | interop.Reference<sqlite3_index_info> | ArrayBufferLike | ArrayBufferView | null, iCons: number, bHandle: number): number;

/**
 * @since 16.0
 */
declare function sqlite3_vtab_in_first(pVal: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ppOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 16.0
 */
declare function sqlite3_vtab_in_next(pVal: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ppOut: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 12.0
 */
declare function sqlite3_vtab_nochange(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 5.0
 */
declare function sqlite3_vtab_on_conflict(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 16.0
 */
declare function sqlite3_vtab_rhs_value(p1: interop.Pointer | interop.Reference<sqlite3_index_info> | ArrayBufferLike | ArrayBufferView | null, p2: number, ppVal: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 5.0
 */
declare function sqlite3_wal_autocheckpoint(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, N: number): number;

/**
 * @since 5.0
 */
declare function sqlite3_wal_checkpoint(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zDb: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 5.0
 */
declare function sqlite3_wal_checkpoint_v2(db: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, zDb: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, eMode: number, pnLog: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, pnCkpt: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 5.0
 */
declare function sqlite3_wal_hook(p1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: number) => number>, p3: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;
