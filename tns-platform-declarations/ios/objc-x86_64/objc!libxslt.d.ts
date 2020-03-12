
interface _xsltDecimalFormat {
	next: interop.Pointer | interop.Reference<_xsltDecimalFormat>;
	name: string;
	digit: string;
	patternSeparator: string;
	minusSign: string;
	infinity: string;
	noNumber: string;
	decimalPoint: string;
	grouping: string;
	percent: string;
	permille: string;
	zeroDigit: string;
}
declare var _xsltDecimalFormat: interop.StructType<_xsltDecimalFormat>;

interface _xsltDocument {
	next: interop.Pointer | interop.Reference<_xsltDocument>;
	main: number;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	keys: interop.Pointer | interop.Reference<any>;
	includes: interop.Pointer | interop.Reference<_xsltDocument>;
	preproc: number;
	nbKeysComputed: number;
}
declare var _xsltDocument: interop.StructType<_xsltDocument>;

interface _xsltFormatNumberInfo {
	integer_hash: number;
	integer_digits: number;
	frac_digits: number;
	frac_hash: number;
	group: number;
	multiplier: number;
	add_decimal: number;
	is_multiplier_set: number;
	is_negative_pattern: number;
}
declare var _xsltFormatNumberInfo: interop.StructType<_xsltFormatNumberInfo>;

interface _xsltKeyDef {
	next: interop.Pointer | interop.Reference<_xsltKeyDef>;
	inst: interop.Pointer | interop.Reference<_xmlNode>;
	name: string;
	nameURI: string;
	match: string;
	use: string;
	comp: interop.Pointer | interop.Reference<any>;
	usecomp: interop.Pointer | interop.Reference<any>;
	nsList: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNs>>;
	nsNr: number;
}
declare var _xsltKeyDef: interop.StructType<_xsltKeyDef>;

interface _xsltKeyTable {
	next: interop.Pointer | interop.Reference<_xsltKeyTable>;
	name: string;
	nameURI: string;
	keys: interop.Pointer | interop.Reference<any>;
}
declare var _xsltKeyTable: interop.StructType<_xsltKeyTable>;

interface _xsltNumberData {
	level: string;
	count: string;
	from: string;
	value: string;
	format: string;
	has_format: number;
	digitsPerGroup: number;
	groupingCharacter: number;
	groupingCharacterLen: number;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	countPat: interop.Pointer | interop.Reference<any>;
	fromPat: interop.Pointer | interop.Reference<any>;
}
declare var _xsltNumberData: interop.StructType<_xsltNumberData>;

declare var xslDebugStatus: number;

declare function xslDropCall(): void;

declare function xsltCalibrateAdjust(delta: number): void;

declare function xsltCleanupGlobals(): void;

declare function xsltDebugDumpExtensions(output: interop.Pointer | interop.Reference<FILE>): void;

declare function xsltDebugGetDefaultTrace(): xsltDebugTraceCodes;

declare function xsltDebugSetDefaultTrace(val: xsltDebugTraceCodes): void;

declare const enum xsltDebugStatusCodes {

	XSLT_DEBUG_NONE = 0,

	XSLT_DEBUG_INIT = 1,

	XSLT_DEBUG_STEP = 2,

	XSLT_DEBUG_STEPOUT = 3,

	XSLT_DEBUG_NEXT = 4,

	XSLT_DEBUG_STOP = 5,

	XSLT_DEBUG_CONT = 6,

	XSLT_DEBUG_RUN = 7,

	XSLT_DEBUG_RUN_RESTART = 8,

	XSLT_DEBUG_QUIT = 9
}

declare const enum xsltDebugTraceCodes {

	XSLT_TRACE_ALL = -1,

	XSLT_TRACE_NONE = 0,

	XSLT_TRACE_COPY_TEXT = 1,

	XSLT_TRACE_PROCESS_NODE = 2,

	XSLT_TRACE_APPLY_TEMPLATE = 4,

	XSLT_TRACE_COPY = 8,

	XSLT_TRACE_COMMENT = 16,

	XSLT_TRACE_PI = 32,

	XSLT_TRACE_COPY_OF = 64,

	XSLT_TRACE_VALUE_OF = 128,

	XSLT_TRACE_CALL_TEMPLATE = 256,

	XSLT_TRACE_APPLY_TEMPLATES = 512,

	XSLT_TRACE_CHOOSE = 1024,

	XSLT_TRACE_IF = 2048,

	XSLT_TRACE_FOR_EACH = 4096,

	XSLT_TRACE_STRIP_SPACES = 8192,

	XSLT_TRACE_TEMPLATES = 16384,

	XSLT_TRACE_KEYS = 32768,

	XSLT_TRACE_VARIABLES = 65536
}

declare var xsltDocDefaultLoader: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: xsltLoadType) => interop.Pointer | interop.Reference<_xmlDoc>>;

declare function xsltDocumentFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xsltDocumentSortFunction(list: interop.Pointer | interop.Reference<_xmlNodeSet>): void;

declare function xsltElementAvailableFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare var xsltEngineVersion: string;

declare var xsltExtMarker: string;

declare function xsltExtModuleFunctionLookup(name: string | interop.Pointer | interop.Reference<any>, URI: string | interop.Pointer | interop.Reference<any>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>;

declare function xsltFormatNumberConversion(self: interop.Pointer | interop.Reference<_xsltDecimalFormat>, format: string | interop.Pointer | interop.Reference<any>, number: number, result: interop.Pointer | interop.Reference<string>): xmlXPathError;

declare function xsltFormatNumberFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xsltFreeAVTList(avt: interop.Pointer | interop.Reference<any>): void;

declare function xsltFreeCompMatchList(comp: interop.Pointer | interop.Reference<any>): void;

declare function xsltFreeDocumentKeys(doc: interop.Pointer | interop.Reference<_xsltDocument>): void;

declare function xsltFreeLocale(locale: interop.Pointer | interop.Reference<any>): void;

declare function xsltFreeLocales(): void;

declare function xsltFreeSecurityPrefs(sec: interop.Pointer | interop.Reference<any>): void;

declare function xsltFunctionAvailableFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xsltFunctionNodeSet(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xsltGenerateIdFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare var xsltGenericDebug: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;

declare var xsltGenericDebugContext: interop.Pointer | interop.Reference<any>;

declare var xsltGenericError: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;

declare var xsltGenericErrorContext: interop.Pointer | interop.Reference<any>;

declare function xsltGetDebuggerStatus(): number;

declare function xsltGetDefaultSecurityPrefs(): interop.Pointer | interop.Reference<any>;

declare function xsltGetNsProp(node: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>, nameSpace: string | interop.Pointer | interop.Reference<any>): string;

declare function xsltGetQNameURI(node: interop.Pointer | interop.Reference<_xmlNode>, name: interop.Pointer | interop.Reference<string>): string;

declare function xsltGetUTF8Char(utf: string | interop.Pointer | interop.Reference<any>, len: interop.Pointer | interop.Reference<number>): number;

declare function xsltGetXIncludeDefault(): number;

declare function xsltInit(): void;

declare function xsltInitGlobals(): void;

declare function xsltIsBlank(str: string | interop.Pointer | interop.Reference<any>): number;

declare function xsltKeyFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare var xsltLibxmlVersion: number;

declare var xsltLibxsltVersion: number;

declare const enum xsltLoadType {

	XSLT_LOAD_START = 0,

	XSLT_LOAD_STYLESHEET = 1,

	XSLT_LOAD_DOCUMENT = 2
}

declare function xsltLocaleStrcmp(locale: interop.Pointer | interop.Reference<any>, str1: string | interop.Pointer | interop.Reference<any>, str2: string | interop.Pointer | interop.Reference<any>): number;

declare var xsltMaxDepth: number;

declare var xsltMaxVars: number;

declare function xsltNewLocale(langName: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xsltNewSecurityPrefs(): interop.Pointer | interop.Reference<any>;

declare function xsltNormalizeCompSteps(payload: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): void;

declare const enum xsltOutputType {

	XSLT_OUTPUT_XML = 0,

	XSLT_OUTPUT_HTML = 1,

	XSLT_OUTPUT_TEXT = 2
}

declare function xsltRegisterAllExtras(): void;

declare function xsltRegisterAllFunctions(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): void;

declare function xsltRegisterExtModuleFunction(name: string | interop.Pointer | interop.Reference<any>, URI: string | interop.Pointer | interop.Reference<any>, _function: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>): number;

declare function xsltRegisterTestModule(): void;

declare const enum xsltSecurityOption {

	XSLT_SECPREF_READ_FILE = 1,

	XSLT_SECPREF_WRITE_FILE = 2,

	XSLT_SECPREF_CREATE_DIRECTORY = 3,

	XSLT_SECPREF_READ_NETWORK = 4,

	XSLT_SECPREF_WRITE_NETWORK = 5
}

declare function xsltSetDebuggerCallbacks(no: number, block: interop.Pointer | interop.Reference<any>): number;

declare function xsltSetDebuggerStatus(value: number): void;

declare function xsltSetDefaultSecurityPrefs(sec: interop.Pointer | interop.Reference<any>): void;

declare function xsltSetGenericDebugFunc(ctx: interop.Pointer | interop.Reference<any>, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): void;

declare function xsltSetGenericErrorFunc(ctx: interop.Pointer | interop.Reference<any>, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): void;

declare function xsltSetLoaderFunc(f: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: xsltLoadType) => interop.Pointer | interop.Reference<_xmlDoc>>): void;

declare function xsltSetXIncludeDefault(xinclude: number): void;

declare function xsltSplitQName(dict: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, prefix: interop.Pointer | interop.Reference<string>): string;

declare function xsltStrxfrm(locale: interop.Pointer | interop.Reference<any>, string: string | interop.Pointer | interop.Reference<any>): string;

declare const enum xsltStyleType {

	XSLT_FUNC_COPY = 1,

	XSLT_FUNC_SORT = 2,

	XSLT_FUNC_TEXT = 3,

	XSLT_FUNC_ELEMENT = 4,

	XSLT_FUNC_ATTRIBUTE = 5,

	XSLT_FUNC_COMMENT = 6,

	XSLT_FUNC_PI = 7,

	XSLT_FUNC_COPYOF = 8,

	XSLT_FUNC_VALUEOF = 9,

	XSLT_FUNC_NUMBER = 10,

	XSLT_FUNC_APPLYIMPORTS = 11,

	XSLT_FUNC_CALLTEMPLATE = 12,

	XSLT_FUNC_APPLYTEMPLATES = 13,

	XSLT_FUNC_CHOOSE = 14,

	XSLT_FUNC_IF = 15,

	XSLT_FUNC_FOREACH = 16,

	XSLT_FUNC_DOCUMENT = 17,

	XSLT_FUNC_WITHPARAM = 18,

	XSLT_FUNC_PARAM = 19,

	XSLT_FUNC_VARIABLE = 20,

	XSLT_FUNC_WHEN = 21,

	XSLT_FUNC_EXTENSION = 22
}

declare function xsltSystemPropertyFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xsltTimestamp(): number;

declare const enum xsltTransformState {

	XSLT_STATE_OK = 0,

	XSLT_STATE_ERROR = 1,

	XSLT_STATE_STOPPED = 2
}

declare function xsltUninit(): void;

declare function xsltUnparsedEntityURIFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xsltUnregisterExtModule(URI: string | interop.Pointer | interop.Reference<any>): number;

declare function xsltUnregisterExtModuleElement(name: string | interop.Pointer | interop.Reference<any>, URI: string | interop.Pointer | interop.Reference<any>): number;

declare function xsltUnregisterExtModuleFunction(name: string | interop.Pointer | interop.Reference<any>, URI: string | interop.Pointer | interop.Reference<any>): number;

declare function xsltUnregisterExtModuleTopLevel(name: string | interop.Pointer | interop.Reference<any>, URI: string | interop.Pointer | interop.Reference<any>): number;

declare function xsltXPathFunctionLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: string | interop.Pointer | interop.Reference<any>, ns_uri: string | interop.Pointer | interop.Reference<any>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>;

declare function xsltXPathVariableLookup(ctxt: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, ns_uri: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlXPathObject>;
