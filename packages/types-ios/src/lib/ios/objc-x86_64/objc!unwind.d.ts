
declare const enum _Unwind_Action {

	A_SEARCH_PHASE = 1,

	A_CLEANUP_PHASE = 2,

	A_HANDLER_FRAME = 4,

	A_FORCE_UNWIND = 8,

	A_END_OF_STACK = 16
}

declare function _Unwind_Backtrace(p1: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => _Unwind_Reason_Code>, p2: interop.Pointer | interop.Reference<any>): _Unwind_Reason_Code;

declare function _Unwind_FindEnclosingFunction(pc: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function _Unwind_Find_FDE(pc: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<dwarf_eh_bases>): interop.Pointer | interop.Reference<any>;

declare function _Unwind_GetCFA(p1: interop.Pointer | interop.Reference<any>): number;

declare function _Unwind_GetIPInfo(context: interop.Pointer | interop.Reference<any>, ipBefore: interop.Pointer | interop.Reference<number>): number;

declare function _Unwind_GetLanguageSpecificData(context: interop.Pointer | interop.Reference<any>): number;

declare function _Unwind_GetRegionStart(context: interop.Pointer | interop.Reference<any>): number;

declare const enum _Unwind_Reason_Code {

	RC_NO_REASON = 0,

	RC_OK = 0,

	RC_FOREIGN_EXCEPTION_CAUGHT = 1,

	RC_FATAL_PHASE2_ERROR = 2,

	RC_FATAL_PHASE1_ERROR = 3,

	RC_NORMAL_STOP = 4,

	RC_END_OF_STACK = 5,

	RC_HANDLER_FOUND = 6,

	RC_INSTALL_CONTEXT = 7,

	RC_CONTINUE_UNWIND = 8
}

declare function __deregister_frame(fde: interop.Pointer | interop.Reference<any>): void;

declare function __register_frame(fde: interop.Pointer | interop.Reference<any>): void;

interface dwarf_eh_bases {
	tbase: number;
	dbase: number;
	func: number;
}
declare var dwarf_eh_bases: interop.StructType<dwarf_eh_bases>;
