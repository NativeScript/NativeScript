
interface Fts5ExtensionApi {
	iVersion: number;
	xUserData: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	xColumnCount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xRowCount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>) => number>;
	xColumnTotalSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<number>) => number>;
	xTokenize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: number, p5: number, p6: number) => number>) => number>;
	xPhraseCount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xPhraseSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>;
	xInstCount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>) => number>;
	xInst: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>) => number>;
	xRowid: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xColumnText: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<string>, p4: interop.Pointer | interop.Reference<number>) => number>;
	xColumnSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<number>) => number>;
	xQueryPhrase: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<Fts5ExtensionApi>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => number>) => number>;
	xSetAuxdata: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>) => number>;
	xGetAuxdata: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>;
	xPhraseFirst: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<Fts5PhraseIter>, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>) => number>;
	xPhraseNext: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<Fts5PhraseIter>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => void>;
	xPhraseFirstColumn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<Fts5PhraseIter>, p4: interop.Pointer | interop.Reference<number>) => number>;
	xPhraseNextColumn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<Fts5PhraseIter>, p3: interop.Pointer | interop.Reference<number>) => void>;
}
declare var Fts5ExtensionApi: interop.StructType<Fts5ExtensionApi>;

interface Fts5PhraseIter {
	a: string;
	b: string;
}
declare var Fts5PhraseIter: interop.StructType<Fts5PhraseIter>;

interface fts5_api {
	iVersion: number;
	xCreateTokenizer: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<fts5_api>, p2: string, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<fts5_tokenizer>, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>) => number>;
	xFindTokenizer: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<fts5_api>, p2: string, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p4: interop.Pointer | interop.Reference<fts5_tokenizer>) => number>;
	xCreateFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<fts5_api>, p2: string, p3: interop.Pointer | interop.Reference<any>, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<Fts5ExtensionApi>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>) => number>;
}
declare var fts5_api: interop.StructType<fts5_api>;

interface fts5_tokenizer {
	xCreate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>;
	xDelete: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	xTokenize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: string, p5: number, p6: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: number, p5: number, p6: number) => number>) => number>;
}
declare var fts5_tokenizer: interop.StructType<fts5_tokenizer>;

declare function sqlite3_aggregate_context(p1: interop.Pointer | interop.Reference<any>, nBytes: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_aggregate_count(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_auto_extension(xEntryPoint: interop.FunctionReference<() => void>): number;

declare function sqlite3_backup_finish(p: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_backup_init(pDest: interop.Pointer | interop.Reference<any>, zDestName: string | interop.Pointer | interop.Reference<any>, pSource: interop.Pointer | interop.Reference<any>, zSourceName: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_backup_pagecount(p: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_backup_remaining(p: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_backup_step(p: interop.Pointer | interop.Reference<any>, nPage: number): number;

declare function sqlite3_bind_blob(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, n: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_bind_blob64(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_bind_double(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function sqlite3_bind_int(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function sqlite3_bind_int64(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function sqlite3_bind_null(p1: interop.Pointer | interop.Reference<any>, p2: number): number;

declare function sqlite3_bind_parameter_count(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_bind_parameter_index(p1: interop.Pointer | interop.Reference<any>, zName: string | interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_bind_parameter_name(p1: interop.Pointer | interop.Reference<any>, p2: number): string;

declare function sqlite3_bind_pointer(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: string | interop.Pointer | interop.Reference<any>, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_bind_text(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_bind_text16(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_bind_text64(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string | interop.Pointer | interop.Reference<any>, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, encoding: number): number;

declare function sqlite3_bind_value(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_bind_zeroblob(p1: interop.Pointer | interop.Reference<any>, p2: number, n: number): number;

declare function sqlite3_bind_zeroblob64(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number): number;

declare function sqlite3_blob_bytes(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_blob_close(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_blob_open(p1: interop.Pointer | interop.Reference<any>, zDb: string | interop.Pointer | interop.Reference<any>, zTable: string | interop.Pointer | interop.Reference<any>, zColumn: string | interop.Pointer | interop.Reference<any>, iRow: number, flags: number, ppBlob: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function sqlite3_blob_read(p1: interop.Pointer | interop.Reference<any>, Z: interop.Pointer | interop.Reference<any>, N: number, iOffset: number): number;

declare function sqlite3_blob_reopen(p1: interop.Pointer | interop.Reference<any>, p2: number): number;

declare function sqlite3_blob_write(p1: interop.Pointer | interop.Reference<any>, z: interop.Pointer | interop.Reference<any>, n: number, iOffset: number): number;

declare function sqlite3_busy_handler(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>, p3: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_busy_timeout(p1: interop.Pointer | interop.Reference<any>, ms: number): number;

declare function sqlite3_cancel_auto_extension(xEntryPoint: interop.FunctionReference<() => void>): number;

declare function sqlite3_changes(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_clear_bindings(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_close(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_close_v2(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_collation_needed(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: string) => void>): number;

declare function sqlite3_collation_needed16(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_column_blob(p1: interop.Pointer | interop.Reference<any>, iCol: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_column_bytes(p1: interop.Pointer | interop.Reference<any>, iCol: number): number;

declare function sqlite3_column_bytes16(p1: interop.Pointer | interop.Reference<any>, iCol: number): number;

declare function sqlite3_column_count(pStmt: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_column_database_name(p1: interop.Pointer | interop.Reference<any>, p2: number): string;

declare function sqlite3_column_database_name16(p1: interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_column_decltype(p1: interop.Pointer | interop.Reference<any>, p2: number): string;

declare function sqlite3_column_decltype16(p1: interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_column_double(p1: interop.Pointer | interop.Reference<any>, iCol: number): number;

declare function sqlite3_column_int(p1: interop.Pointer | interop.Reference<any>, iCol: number): number;

declare function sqlite3_column_int64(p1: interop.Pointer | interop.Reference<any>, iCol: number): number;

declare function sqlite3_column_name(p1: interop.Pointer | interop.Reference<any>, N: number): string;

declare function sqlite3_column_name16(p1: interop.Pointer | interop.Reference<any>, N: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_column_origin_name(p1: interop.Pointer | interop.Reference<any>, p2: number): string;

declare function sqlite3_column_origin_name16(p1: interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_column_table_name(p1: interop.Pointer | interop.Reference<any>, p2: number): string;

declare function sqlite3_column_table_name16(p1: interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_column_text(p1: interop.Pointer | interop.Reference<any>, iCol: number): string;

declare function sqlite3_column_text16(p1: interop.Pointer | interop.Reference<any>, iCol: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_column_type(p1: interop.Pointer | interop.Reference<any>, iCol: number): number;

declare function sqlite3_column_value(p1: interop.Pointer | interop.Reference<any>, iCol: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_commit_hook(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, p3: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_compileoption_get(N: number): string;

declare function sqlite3_compileoption_used(zOptName: string | interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_complete(sql: string | interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_complete16(sql: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_context_db_handle(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_create_collation(p1: interop.Pointer | interop.Reference<any>, zName: string | interop.Pointer | interop.Reference<any>, eTextRep: number, pArg: interop.Pointer | interop.Reference<any>, xCompare: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<any>) => number>): number;

declare function sqlite3_create_collation16(p1: interop.Pointer | interop.Reference<any>, zName: interop.Pointer | interop.Reference<any>, eTextRep: number, pArg: interop.Pointer | interop.Reference<any>, xCompare: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<any>) => number>): number;

declare function sqlite3_create_collation_v2(p1: interop.Pointer | interop.Reference<any>, zName: string | interop.Pointer | interop.Reference<any>, eTextRep: number, pArg: interop.Pointer | interop.Reference<any>, xCompare: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Pointer | interop.Reference<any>) => number>, xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_create_function(db: interop.Pointer | interop.Reference<any>, zFunctionName: string | interop.Pointer | interop.Reference<any>, nArg: number, eTextRep: number, pApp: interop.Pointer | interop.Reference<any>, xFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, xStep: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, xFinal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_create_function16(db: interop.Pointer | interop.Reference<any>, zFunctionName: interop.Pointer | interop.Reference<any>, nArg: number, eTextRep: number, pApp: interop.Pointer | interop.Reference<any>, xFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, xStep: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, xFinal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_create_function_v2(db: interop.Pointer | interop.Reference<any>, zFunctionName: string | interop.Pointer | interop.Reference<any>, nArg: number, eTextRep: number, pApp: interop.Pointer | interop.Reference<any>, xFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, xStep: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, xFinal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_create_module(db: interop.Pointer | interop.Reference<any>, zName: string | interop.Pointer | interop.Reference<any>, p: interop.Pointer | interop.Reference<sqlite3_module>, pClientData: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_create_module_v2(db: interop.Pointer | interop.Reference<any>, zName: string | interop.Pointer | interop.Reference<any>, p: interop.Pointer | interop.Reference<sqlite3_module>, pClientData: interop.Pointer | interop.Reference<any>, xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_create_window_function(db: interop.Pointer | interop.Reference<any>, zFunctionName: string | interop.Pointer | interop.Reference<any>, nArg: number, eTextRep: number, pApp: interop.Pointer | interop.Reference<any>, xStep: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, xFinal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, xValue: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, xInverse: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>, xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

declare function sqlite3_data_count(pStmt: interop.Pointer | interop.Reference<any>): number;

declare var sqlite3_data_directory: string;

declare function sqlite3_db_cacheflush(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_db_filename(db: interop.Pointer | interop.Reference<any>, zDbName: string | interop.Pointer | interop.Reference<any>): string;

declare function sqlite3_db_handle(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_db_mutex(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_db_readonly(db: interop.Pointer | interop.Reference<any>, zDbName: string | interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_db_release_memory(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_db_status(p1: interop.Pointer | interop.Reference<any>, op: number, pCur: interop.Pointer | interop.Reference<number>, pHiwtr: interop.Pointer | interop.Reference<number>, resetFlg: number): number;

declare function sqlite3_declare_vtab(p1: interop.Pointer | interop.Reference<any>, zSQL: string | interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_deserialize(db: interop.Pointer | interop.Reference<any>, zSchema: string | interop.Pointer | interop.Reference<any>, pData: string | interop.Pointer | interop.Reference<any>, szDb: number, szBuf: number, mFlags: number): number;

declare function sqlite3_enable_shared_cache(p1: number): number;

declare function sqlite3_errcode(db: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_errmsg(p1: interop.Pointer | interop.Reference<any>): string;

declare function sqlite3_errmsg16(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_errstr(p1: number): string;

declare function sqlite3_exec(p1: interop.Pointer | interop.Reference<any>, sql: string | interop.Pointer | interop.Reference<any>, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<string>, p4: interop.Pointer | interop.Reference<string>) => number>, p4: interop.Pointer | interop.Reference<any>, errmsg: interop.Pointer | interop.Reference<string>): number;

declare function sqlite3_expanded_sql(pStmt: interop.Pointer | interop.Reference<any>): string;

declare function sqlite3_expired(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_extended_errcode(db: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_extended_result_codes(p1: interop.Pointer | interop.Reference<any>, onoff: number): number;

interface sqlite3_file {
	pMethods: interop.Pointer | interop.Reference<sqlite3_io_methods>;
}
declare var sqlite3_file: interop.StructType<sqlite3_file>;

declare function sqlite3_file_control(p1: interop.Pointer | interop.Reference<any>, zDbName: string | interop.Pointer | interop.Reference<any>, op: number, p4: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_finalize(pStmt: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_free(p1: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_free_table(result: interop.Pointer | interop.Reference<string>): void;

declare function sqlite3_get_autocommit(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_get_auxdata(p1: interop.Pointer | interop.Reference<any>, N: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_get_table(db: interop.Pointer | interop.Reference<any>, zSql: string | interop.Pointer | interop.Reference<any>, pazResult: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<string>>, pnRow: interop.Pointer | interop.Reference<number>, pnColumn: interop.Pointer | interop.Reference<number>, pzErrmsg: interop.Pointer | interop.Reference<string>): number;

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
	aConstraint: interop.Pointer | interop.Reference<sqlite3_index_constraint>;
	nOrderBy: number;
	aOrderBy: interop.Pointer | interop.Reference<sqlite3_index_orderby>;
	aConstraintUsage: interop.Pointer | interop.Reference<sqlite3_index_constraint_usage>;
	idxNum: number;
	idxStr: string;
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

declare function sqlite3_interrupt(p1: interop.Pointer | interop.Reference<any>): void;

interface sqlite3_io_methods {
	iVersion: number;
	xClose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>) => number>;
	xRead: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number) => number>;
	xWrite: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number) => number>;
	xTruncate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: number) => number>;
	xSync: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: number) => number>;
	xFileSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: interop.Pointer | interop.Reference<number>) => number>;
	xLock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: number) => number>;
	xUnlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: number) => number>;
	xCheckReservedLock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: interop.Pointer | interop.Reference<number>) => number>;
	xFileControl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: number, p3: interop.Pointer | interop.Reference<any>) => number>;
	xSectorSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>) => number>;
	xDeviceCharacteristics: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>) => number>;
	xShmMap: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: number, p3: number, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>;
	xShmLock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: number, p3: number, p4: number) => number>;
	xShmBarrier: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>) => void>;
	xShmUnmap: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: number) => number>;
	xFetch: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>;
	xUnfetch: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_file>, p2: number, p3: interop.Pointer | interop.Reference<any>) => number>;
}
declare var sqlite3_io_methods: interop.StructType<sqlite3_io_methods>;

declare function sqlite3_keyword_check(p1: string | interop.Pointer | interop.Reference<any>, p2: number): number;

declare function sqlite3_keyword_count(): number;

declare function sqlite3_keyword_name(p1: number, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<number>): number;

declare function sqlite3_last_insert_rowid(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_libversion(): string;

declare function sqlite3_libversion_number(): number;

declare function sqlite3_limit(p1: interop.Pointer | interop.Reference<any>, id: number, newVal: number): number;

declare function sqlite3_malloc(p1: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_malloc64(p1: number): interop.Pointer | interop.Reference<any>;

interface sqlite3_mem_methods {
	xMalloc: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>;
	xFree: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	xRealloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>;
	xSize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xRoundup: interop.FunctionReference<(p1: number) => number>;
	xInit: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xShutdown: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	pAppData: interop.Pointer | interop.Reference<any>;
}
declare var sqlite3_mem_methods: interop.StructType<sqlite3_mem_methods>;

declare function sqlite3_memory_alarm(p1: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => void>, p2: interop.Pointer | interop.Reference<any>, p3: number): number;

declare function sqlite3_memory_highwater(resetFlag: number): number;

declare function sqlite3_memory_used(): number;

interface sqlite3_module {
	iVersion: number;
	xCreate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<string>, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<sqlite3_vtab>>, p6: interop.Pointer | interop.Reference<string>) => number>;
	xConnect: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<string>, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<sqlite3_vtab>>, p6: interop.Pointer | interop.Reference<string>) => number>;
	xBestIndex: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>, p2: interop.Pointer | interop.Reference<sqlite3_index_info>) => number>;
	xDisconnect: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>) => number>;
	xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>) => number>;
	xOpen: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<sqlite3_vtab_cursor>>) => number>;
	xClose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor>) => number>;
	xFilter: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor>, p2: number, p3: string, p4: number, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>;
	xNext: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor>) => number>;
	xEof: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor>) => number>;
	xColumn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>;
	xRowid: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab_cursor>, p2: interop.Pointer | interop.Reference<number>) => number>;
	xUpdate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p4: interop.Pointer | interop.Reference<number>) => number>;
	xBegin: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>) => number>;
	xSync: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>) => number>;
	xCommit: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>) => number>;
	xRollback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>) => number>;
	xFindFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>, p2: number, p3: string, p4: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => void>>, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>;
	xRename: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>, p2: string) => number>;
	xSavepoint: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>, p2: number) => number>;
	xRelease: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>, p2: number) => number>;
	xRollbackTo: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vtab>, p2: number) => number>;
	xShadowName: interop.FunctionReference<(p1: string) => number>;
}
declare var sqlite3_module: interop.StructType<sqlite3_module>;

declare function sqlite3_msize(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_mutex_alloc(p1: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_mutex_enter(p1: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_mutex_free(p1: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_mutex_leave(p1: interop.Pointer | interop.Reference<any>): void;

interface sqlite3_mutex_methods {
	xMutexInit: interop.FunctionReference<() => number>;
	xMutexEnd: interop.FunctionReference<() => number>;
	xMutexAlloc: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>;
	xMutexFree: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	xMutexEnter: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	xMutexTry: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xMutexLeave: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	xMutexHeld: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xMutexNotheld: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
}
declare var sqlite3_mutex_methods: interop.StructType<sqlite3_mutex_methods>;

declare function sqlite3_mutex_try(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_next_stmt(pDb: interop.Pointer | interop.Reference<any>, pStmt: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_open(filename: string | interop.Pointer | interop.Reference<any>, ppDb: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function sqlite3_open16(filename: interop.Pointer | interop.Reference<any>, ppDb: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function sqlite3_open_v2(filename: string | interop.Pointer | interop.Reference<any>, ppDb: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, zVfs: string | interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_os_end(): number;

declare function sqlite3_os_init(): number;

declare function sqlite3_overload_function(p1: interop.Pointer | interop.Reference<any>, zFuncName: string | interop.Pointer | interop.Reference<any>, nArg: number): number;

interface sqlite3_pcache_methods {
	pArg: interop.Pointer | interop.Reference<any>;
	xInit: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xShutdown: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	xCreate: interop.FunctionReference<(p1: number, p2: number) => interop.Pointer | interop.Reference<any>>;
	xCachesize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => void>;
	xPagecount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xFetch: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => interop.Pointer | interop.Reference<any>>;
	xUnpin: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => void>;
	xRekey: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number) => void>;
	xTruncate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => void>;
	xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
}
declare var sqlite3_pcache_methods: interop.StructType<sqlite3_pcache_methods>;

interface sqlite3_pcache_methods2 {
	iVersion: number;
	pArg: interop.Pointer | interop.Reference<any>;
	xInit: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xShutdown: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	xCreate: interop.FunctionReference<(p1: number, p2: number, p3: number) => interop.Pointer | interop.Reference<any>>;
	xCachesize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => void>;
	xPagecount: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	xFetch: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => interop.Pointer | interop.Reference<sqlite3_pcache_page>>;
	xUnpin: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<sqlite3_pcache_page>, p3: number) => void>;
	xRekey: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<sqlite3_pcache_page>, p3: number, p4: number) => void>;
	xTruncate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => void>;
	xDestroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	xShrink: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
}
declare var sqlite3_pcache_methods2: interop.StructType<sqlite3_pcache_methods2>;

interface sqlite3_pcache_page {
	pBuf: interop.Pointer | interop.Reference<any>;
	pExtra: interop.Pointer | interop.Reference<any>;
}
declare var sqlite3_pcache_page: interop.StructType<sqlite3_pcache_page>;

declare function sqlite3_prepare(db: interop.Pointer | interop.Reference<any>, zSql: string | interop.Pointer | interop.Reference<any>, nByte: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, pzTail: interop.Pointer | interop.Reference<string>): number;

declare function sqlite3_prepare16(db: interop.Pointer | interop.Reference<any>, zSql: interop.Pointer | interop.Reference<any>, nByte: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, pzTail: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function sqlite3_prepare16_v2(db: interop.Pointer | interop.Reference<any>, zSql: interop.Pointer | interop.Reference<any>, nByte: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, pzTail: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function sqlite3_prepare16_v3(db: interop.Pointer | interop.Reference<any>, zSql: interop.Pointer | interop.Reference<any>, nByte: number, prepFlags: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, pzTail: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function sqlite3_prepare_v2(db: interop.Pointer | interop.Reference<any>, zSql: string | interop.Pointer | interop.Reference<any>, nByte: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, pzTail: interop.Pointer | interop.Reference<string>): number;

declare function sqlite3_prepare_v3(db: interop.Pointer | interop.Reference<any>, zSql: string | interop.Pointer | interop.Reference<any>, nByte: number, prepFlags: number, ppStmt: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, pzTail: interop.Pointer | interop.Reference<string>): number;

declare function sqlite3_profile(p1: interop.Pointer | interop.Reference<any>, xProfile: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => void>, p3: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_progress_handler(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, p4: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_randomness(N: number, P: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_realloc(p1: interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_realloc64(p1: interop.Pointer | interop.Reference<any>, p2: number): interop.Pointer | interop.Reference<any>;

declare function sqlite3_release_memory(p1: number): number;

declare function sqlite3_reset(pStmt: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_reset_auto_extension(): void;

declare function sqlite3_result_blob(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function sqlite3_result_blob64(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function sqlite3_result_double(p1: interop.Pointer | interop.Reference<any>, p2: number): void;

declare function sqlite3_result_error(p1: interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): void;

declare function sqlite3_result_error16(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number): void;

declare function sqlite3_result_error_code(p1: interop.Pointer | interop.Reference<any>, p2: number): void;

declare function sqlite3_result_error_nomem(p1: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_result_error_toobig(p1: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_result_int(p1: interop.Pointer | interop.Reference<any>, p2: number): void;

declare function sqlite3_result_int64(p1: interop.Pointer | interop.Reference<any>, p2: number): void;

declare function sqlite3_result_null(p1: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_result_pointer(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: string | interop.Pointer | interop.Reference<any>, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function sqlite3_result_subtype(p1: interop.Pointer | interop.Reference<any>, p2: number): void;

declare function sqlite3_result_text(p1: interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function sqlite3_result_text16(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function sqlite3_result_text16be(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function sqlite3_result_text16le(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function sqlite3_result_text64(p1: interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, encoding: number): void;

declare function sqlite3_result_value(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_result_zeroblob(p1: interop.Pointer | interop.Reference<any>, n: number): void;

declare function sqlite3_result_zeroblob64(p1: interop.Pointer | interop.Reference<any>, n: number): number;

declare function sqlite3_rollback_hook(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, p3: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

interface sqlite3_rtree_geometry {
	pContext: interop.Pointer | interop.Reference<any>;
	nParam: number;
	aParam: interop.Pointer | interop.Reference<number>;
	pUser: interop.Pointer | interop.Reference<any>;
	xDelUser: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
}
declare var sqlite3_rtree_geometry: interop.StructType<sqlite3_rtree_geometry>;

declare function sqlite3_rtree_geometry_callback(db: interop.Pointer | interop.Reference<any>, zGeom: string | interop.Pointer | interop.Reference<any>, xGeom: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_rtree_geometry>, p2: number, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => number>, pContext: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_rtree_query_callback(db: interop.Pointer | interop.Reference<any>, zQueryFunc: string | interop.Pointer | interop.Reference<any>, xQueryFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_rtree_query_info>) => number>, pContext: interop.Pointer | interop.Reference<any>, xDestructor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): number;

interface sqlite3_rtree_query_info {
	pContext: interop.Pointer | interop.Reference<any>;
	nParam: number;
	aParam: interop.Pointer | interop.Reference<number>;
	pUser: interop.Pointer | interop.Reference<any>;
	xDelUser: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	aCoord: interop.Pointer | interop.Reference<number>;
	anQueue: interop.Pointer | interop.Reference<number>;
	nCoord: number;
	iLevel: number;
	mxLevel: number;
	iRowid: number;
	rParentScore: number;
	eParentWithin: number;
	eWithin: number;
	rScore: number;
	apSqlParam: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>;
}
declare var sqlite3_rtree_query_info: interop.StructType<sqlite3_rtree_query_info>;

declare function sqlite3_serialize(db: interop.Pointer | interop.Reference<any>, zSchema: string | interop.Pointer | interop.Reference<any>, piSize: interop.Pointer | interop.Reference<number>, mFlags: number): string;

declare function sqlite3_set_authorizer(p1: interop.Pointer | interop.Reference<any>, xAuth: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: string, p5: string, p6: string) => number>, pUserData: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_set_auxdata(p1: interop.Pointer | interop.Reference<any>, N: number, p3: interop.Pointer | interop.Reference<any>, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>): void;

declare function sqlite3_set_last_insert_rowid(p1: interop.Pointer | interop.Reference<any>, p2: number): void;

declare function sqlite3_shutdown(): number;

declare function sqlite3_sleep(p1: number): number;

declare function sqlite3_soft_heap_limit(N: number): void;

declare function sqlite3_soft_heap_limit64(N: number): number;

declare function sqlite3_sourceid(): string;

declare function sqlite3_sql(pStmt: interop.Pointer | interop.Reference<any>): string;

declare function sqlite3_status(op: number, pCurrent: interop.Pointer | interop.Reference<number>, pHighwater: interop.Pointer | interop.Reference<number>, resetFlag: number): number;

declare function sqlite3_status64(op: number, pCurrent: interop.Pointer | interop.Reference<number>, pHighwater: interop.Pointer | interop.Reference<number>, resetFlag: number): number;

declare function sqlite3_step(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_stmt_busy(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_stmt_isexplain(pStmt: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_stmt_readonly(pStmt: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_stmt_status(p1: interop.Pointer | interop.Reference<any>, op: number, resetFlg: number): number;

declare function sqlite3_str_append(p1: interop.Pointer | interop.Reference<any>, zIn: string | interop.Pointer | interop.Reference<any>, N: number): void;

declare function sqlite3_str_appendall(p1: interop.Pointer | interop.Reference<any>, zIn: string | interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_str_appendchar(p1: interop.Pointer | interop.Reference<any>, N: number, C: number): void;

declare function sqlite3_str_errcode(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_str_finish(p1: interop.Pointer | interop.Reference<any>): string;

declare function sqlite3_str_length(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_str_new(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_str_reset(p1: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_str_value(p1: interop.Pointer | interop.Reference<any>): string;

declare function sqlite3_strglob(zGlob: string | interop.Pointer | interop.Reference<any>, zStr: string | interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_stricmp(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_strlike(zGlob: string | interop.Pointer | interop.Reference<any>, zStr: string | interop.Pointer | interop.Reference<any>, cEsc: number): number;

declare function sqlite3_strnicmp(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function sqlite3_system_errno(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_table_column_metadata(db: interop.Pointer | interop.Reference<any>, zDbName: string | interop.Pointer | interop.Reference<any>, zTableName: string | interop.Pointer | interop.Reference<any>, zColumnName: string | interop.Pointer | interop.Reference<any>, pzDataType: interop.Pointer | interop.Reference<string>, pzCollSeq: interop.Pointer | interop.Reference<string>, pNotNull: interop.Pointer | interop.Reference<number>, pPrimaryKey: interop.Pointer | interop.Reference<number>, pAutoinc: interop.Pointer | interop.Reference<number>): number;

declare var sqlite3_temp_directory: string;

declare function sqlite3_thread_cleanup(): void;

declare function sqlite3_threadsafe(): number;

declare function sqlite3_total_changes(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_trace(p1: interop.Pointer | interop.Reference<any>, xTrace: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>, p3: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_trace_v2(p1: interop.Pointer | interop.Reference<any>, uMask: number, xCallback: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>) => number>, pCtx: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_transfer_bindings(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_update_hook(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: string, p4: string, p5: number) => void>, p3: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_uri_boolean(zFile: string | interop.Pointer | interop.Reference<any>, zParam: string | interop.Pointer | interop.Reference<any>, bDefault: number): number;

declare function sqlite3_uri_int64(p1: string | interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function sqlite3_uri_parameter(zFilename: string | interop.Pointer | interop.Reference<any>, zParam: string | interop.Pointer | interop.Reference<any>): string;

declare function sqlite3_user_data(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_value_blob(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_value_bytes(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_value_bytes16(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_value_double(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_value_dup(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_value_free(p1: interop.Pointer | interop.Reference<any>): void;

declare function sqlite3_value_frombind(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_value_int(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_value_int64(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_value_nochange(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_value_numeric_type(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_value_pointer(p1: interop.Pointer | interop.Reference<any>, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_value_subtype(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_value_text(p1: interop.Pointer | interop.Reference<any>): string;

declare function sqlite3_value_text16(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_value_text16be(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_value_text16le(p1: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sqlite3_value_type(p1: interop.Pointer | interop.Reference<any>): number;

declare var sqlite3_version: interop.Reference<number>;

interface sqlite3_vfs {
	iVersion: number;
	szOsFile: number;
	mxPathname: number;
	pNext: interop.Pointer | interop.Reference<sqlite3_vfs>;
	zName: string;
	pAppData: interop.Pointer | interop.Reference<any>;
	xOpen: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: string, p3: interop.Pointer | interop.Reference<sqlite3_file>, p4: number, p5: interop.Pointer | interop.Reference<number>) => number>;
	xDelete: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: string, p3: number) => number>;
	xAccess: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: string, p3: number, p4: interop.Pointer | interop.Reference<number>) => number>;
	xFullPathname: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: string, p3: number, p4: string) => number>;
	xDlOpen: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: string) => interop.Pointer | interop.Reference<any>>;
	xDlError: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: number, p3: string) => void>;
	xDlSym: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: interop.Pointer | interop.Reference<any>, p3: string) => interop.FunctionReference<() => void>>;
	xDlClose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: interop.Pointer | interop.Reference<any>) => void>;
	xRandomness: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: number, p3: string) => number>;
	xSleep: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: number) => number>;
	xCurrentTime: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: interop.Pointer | interop.Reference<number>) => number>;
	xGetLastError: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: number, p3: string) => number>;
	xCurrentTimeInt64: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: interop.Pointer | interop.Reference<number>) => number>;
	xSetSystemCall: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: string, p3: interop.FunctionReference<() => void>) => number>;
	xGetSystemCall: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: string) => interop.FunctionReference<() => void>>;
	xNextSystemCall: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, p2: string) => string>;
}
declare var sqlite3_vfs: interop.StructType<sqlite3_vfs>;

declare function sqlite3_vfs_find(zVfsName: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<sqlite3_vfs>;

declare function sqlite3_vfs_register(p1: interop.Pointer | interop.Reference<sqlite3_vfs>, makeDflt: number): number;

declare function sqlite3_vfs_unregister(p1: interop.Pointer | interop.Reference<sqlite3_vfs>): number;

interface sqlite3_vtab {
	pModule: interop.Pointer | interop.Reference<sqlite3_module>;
	nRef: number;
	zErrMsg: string;
}
declare var sqlite3_vtab: interop.StructType<sqlite3_vtab>;

interface sqlite3_vtab_cursor {
	pVtab: interop.Pointer | interop.Reference<sqlite3_vtab>;
}
declare var sqlite3_vtab_cursor: interop.StructType<sqlite3_vtab_cursor>;

declare function sqlite3_vtab_nochange(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_vtab_on_conflict(p1: interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_wal_autocheckpoint(db: interop.Pointer | interop.Reference<any>, N: number): number;

declare function sqlite3_wal_checkpoint(db: interop.Pointer | interop.Reference<any>, zDb: string | interop.Pointer | interop.Reference<any>): number;

declare function sqlite3_wal_checkpoint_v2(db: interop.Pointer | interop.Reference<any>, zDb: string | interop.Pointer | interop.Reference<any>, eMode: number, pnLog: interop.Pointer | interop.Reference<number>, pnCkpt: interop.Pointer | interop.Reference<number>): number;

declare function sqlite3_wal_hook(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: string, p4: number) => number>, p3: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;
