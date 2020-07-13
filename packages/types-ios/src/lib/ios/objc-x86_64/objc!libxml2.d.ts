
declare function UTF8ToHtml(out: string | interop.Pointer | interop.Reference<any>, outlen: interop.Pointer | interop.Reference<number>, _in: string | interop.Pointer | interop.Reference<any>, inlen: interop.Pointer | interop.Reference<number>): number;

declare function UTF8Toisolat1(out: string | interop.Pointer | interop.Reference<any>, outlen: interop.Pointer | interop.Reference<number>, _in: string | interop.Pointer | interop.Reference<any>, inlen: interop.Pointer | interop.Reference<number>): number;

declare function __docbDefaultSAXHandler(): interop.Pointer | interop.Reference<_xmlSAXHandlerV1>;

declare function __htmlDefaultSAXHandler(): interop.Pointer | interop.Reference<_xmlSAXHandlerV1>;

declare function __oldXMLWDcompatibility(): interop.Pointer | interop.Reference<number>;

declare function __xmlBufferAllocScheme(): interop.Pointer | interop.Reference<xmlBufferAllocationScheme>;

declare function __xmlDefaultBufferSize(): interop.Pointer | interop.Reference<number>;

declare function __xmlDefaultSAXHandler(): interop.Pointer | interop.Reference<_xmlSAXHandlerV1>;

declare function __xmlDefaultSAXLocator(): interop.Pointer | interop.Reference<_xmlSAXLocator>;

declare function __xmlDeregisterNodeDefaultValue(): interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>>;

declare function __xmlDoValidityCheckingDefaultValue(): interop.Pointer | interop.Reference<number>;

declare function __xmlGenericError(): interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>>;

declare function __xmlGenericErrorContext(): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>;

declare function __xmlGetWarningsDefaultValue(): interop.Pointer | interop.Reference<number>;

declare function __xmlIndentTreeOutput(): interop.Pointer | interop.Reference<number>;

declare function __xmlKeepBlanksDefaultValue(): interop.Pointer | interop.Reference<number>;

declare function __xmlLastError(): interop.Pointer | interop.Reference<_xmlError>;

declare function __xmlLineNumbersDefaultValue(): interop.Pointer | interop.Reference<number>;

declare function __xmlLoadExtDtdDefaultValue(): interop.Pointer | interop.Reference<number>;

declare function __xmlOutputBufferCreateFilename(URI: string | interop.Pointer | interop.Reference<any>, encoder: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, compression: number): interop.Pointer | interop.Reference<_xmlOutputBuffer>;

declare function __xmlOutputBufferCreateFilenameValue(): interop.Pointer | interop.Reference<interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, p3: number) => interop.Pointer | interop.Reference<_xmlOutputBuffer>>>;

declare function __xmlParserDebugEntities(): interop.Pointer | interop.Reference<number>;

declare function __xmlParserInputBufferCreateFilename(URI: string | interop.Pointer | interop.Reference<any>, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserInputBuffer>;

declare function __xmlParserInputBufferCreateFilenameValue(): interop.Pointer | interop.Reference<interop.FunctionReference<(p1: string, p2: xmlCharEncoding) => interop.Pointer | interop.Reference<_xmlParserInputBuffer>>>;

declare function __xmlParserVersion(): interop.Pointer | interop.Reference<string>;

declare function __xmlPedanticParserDefaultValue(): interop.Pointer | interop.Reference<number>;

declare function __xmlRegisterNodeDefaultValue(): interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>>;

declare function __xmlSaveNoEmptyTags(): interop.Pointer | interop.Reference<number>;

declare function __xmlStructuredError(): interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>>;

declare function __xmlStructuredErrorContext(): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>;

declare function __xmlSubstituteEntitiesDefaultValue(): interop.Pointer | interop.Reference<number>;

declare function __xmlTreeIndentString(): interop.Pointer | interop.Reference<string>;

interface _htmlElemDesc {
	name: string;
	startTag: number;
	endTag: number;
	saveEndTag: number;
	empty: number;
	depr: number;
	dtd: number;
	isinline: number;
	desc: string;
	subelts: interop.Pointer | interop.Reference<string>;
	defaultsubelt: string;
	attrs_opt: interop.Pointer | interop.Reference<string>;
	attrs_depr: interop.Pointer | interop.Reference<string>;
	attrs_req: interop.Pointer | interop.Reference<string>;
}
declare var _htmlElemDesc: interop.StructType<_htmlElemDesc>;

interface _htmlEntityDesc {
	value: number;
	name: string;
	desc: string;
}
declare var _htmlEntityDesc: interop.StructType<_htmlEntityDesc>;

interface _uconv_t {
	uconv: interop.Pointer | interop.Reference<any>;
	utf8: interop.Pointer | interop.Reference<any>;
}
declare var _uconv_t: interop.StructType<_uconv_t>;

interface _xlinkHandler {
	simple: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlNode>, p3: string, p4: string, p5: string) => void>;
	extended: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlNode>, p3: number, p4: interop.Pointer | interop.Reference<string>, p5: interop.Pointer | interop.Reference<string>, p6: number, p7: interop.Pointer | interop.Reference<string>, p8: interop.Pointer | interop.Reference<string>, p9: interop.Pointer | interop.Reference<xlinkShow>, p10: interop.Pointer | interop.Reference<xlinkActuate>, p11: number, p12: interop.Pointer | interop.Reference<string>, p13: interop.Pointer | interop.Reference<string>) => void>;
	set: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlNode>, p3: number, p4: interop.Pointer | interop.Reference<string>, p5: interop.Pointer | interop.Reference<string>, p6: number, p7: interop.Pointer | interop.Reference<string>, p8: interop.Pointer | interop.Reference<string>) => void>;
}
declare var _xlinkHandler: interop.StructType<_xlinkHandler>;

interface _xmlAttr {
	_private: interop.Pointer | interop.Reference<any>;
	type: xmlElementType;
	name: string;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlNode>;
	next: interop.Pointer | interop.Reference<_xmlAttr>;
	prev: interop.Pointer | interop.Reference<_xmlAttr>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	ns: interop.Pointer | interop.Reference<_xmlNs>;
	atype: xmlAttributeType;
	psvi: interop.Pointer | interop.Reference<any>;
}
declare var _xmlAttr: interop.StructType<_xmlAttr>;

interface _xmlAttribute {
	_private: interop.Pointer | interop.Reference<any>;
	type: xmlElementType;
	name: string;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlDtd>;
	next: interop.Pointer | interop.Reference<_xmlNode>;
	prev: interop.Pointer | interop.Reference<_xmlNode>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	nexth: interop.Pointer | interop.Reference<_xmlAttribute>;
	atype: xmlAttributeType;
	def: xmlAttributeDefault;
	defaultValue: string;
	tree: interop.Pointer | interop.Reference<_xmlEnumeration>;
	prefix: string;
	elem: string;
}
declare var _xmlAttribute: interop.StructType<_xmlAttribute>;

interface _xmlBuffer {
	content: string;
	use: number;
	size: number;
	alloc: xmlBufferAllocationScheme;
	contentIO: string;
}
declare var _xmlBuffer: interop.StructType<_xmlBuffer>;

interface _xmlChLRange {
	low: number;
	high: number;
}
declare var _xmlChLRange: interop.StructType<_xmlChLRange>;

interface _xmlChRangeGroup {
	nbShortRange: number;
	nbLongRange: number;
	shortRange: interop.Pointer | interop.Reference<_xmlChSRange>;
	longRange: interop.Pointer | interop.Reference<_xmlChLRange>;
}
declare var _xmlChRangeGroup: interop.StructType<_xmlChRangeGroup>;

interface _xmlChSRange {
	low: number;
	high: number;
}
declare var _xmlChSRange: interop.StructType<_xmlChSRange>;

interface _xmlCharEncodingHandler {
	name: string;
	input: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<number>, p3: string, p4: interop.Pointer | interop.Reference<number>) => number>;
	output: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<number>, p3: string, p4: interop.Pointer | interop.Reference<number>) => number>;
	uconv_in: interop.Pointer | interop.Reference<_uconv_t>;
	uconv_out: interop.Pointer | interop.Reference<_uconv_t>;
}
declare var _xmlCharEncodingHandler: interop.StructType<_xmlCharEncodingHandler>;

interface _xmlDOMWrapCtxt {
	_private: interop.Pointer | interop.Reference<any>;
	type: number;
	namespaceMap: interop.Pointer | interop.Reference<any>;
	getNsForNodeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlDOMWrapCtxt>, p2: interop.Pointer | interop.Reference<_xmlNode>, p3: string, p4: string) => interop.Pointer | interop.Reference<_xmlNs>>;
}
declare var _xmlDOMWrapCtxt: interop.StructType<_xmlDOMWrapCtxt>;

interface _xmlDoc {
	_private: interop.Pointer | interop.Reference<any>;
	type: xmlElementType;
	name: string;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlNode>;
	next: interop.Pointer | interop.Reference<_xmlNode>;
	prev: interop.Pointer | interop.Reference<_xmlNode>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	compression: number;
	standalone: number;
	intSubset: interop.Pointer | interop.Reference<_xmlDtd>;
	extSubset: interop.Pointer | interop.Reference<_xmlDtd>;
	oldNs: interop.Pointer | interop.Reference<_xmlNs>;
	version: string;
	encoding: string;
	ids: interop.Pointer | interop.Reference<any>;
	refs: interop.Pointer | interop.Reference<any>;
	URL: string;
	charset: number;
	dict: interop.Pointer | interop.Reference<any>;
	psvi: interop.Pointer | interop.Reference<any>;
	parseFlags: number;
	properties: number;
}
declare var _xmlDoc: interop.StructType<_xmlDoc>;

interface _xmlDtd {
	_private: interop.Pointer | interop.Reference<any>;
	type: xmlElementType;
	name: string;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlDoc>;
	next: interop.Pointer | interop.Reference<_xmlNode>;
	prev: interop.Pointer | interop.Reference<_xmlNode>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	notations: interop.Pointer | interop.Reference<any>;
	elements: interop.Pointer | interop.Reference<any>;
	attributes: interop.Pointer | interop.Reference<any>;
	entities: interop.Pointer | interop.Reference<any>;
	ExternalID: string;
	SystemID: string;
	pentities: interop.Pointer | interop.Reference<any>;
}
declare var _xmlDtd: interop.StructType<_xmlDtd>;

interface _xmlElement {
	_private: interop.Pointer | interop.Reference<any>;
	type: xmlElementType;
	name: string;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlDtd>;
	next: interop.Pointer | interop.Reference<_xmlNode>;
	prev: interop.Pointer | interop.Reference<_xmlNode>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	etype: xmlElementTypeVal;
	content: interop.Pointer | interop.Reference<_xmlElementContent>;
	attributes: interop.Pointer | interop.Reference<_xmlAttribute>;
	prefix: string;
	contModel: interop.Pointer | interop.Reference<any>;
}
declare var _xmlElement: interop.StructType<_xmlElement>;

interface _xmlElementContent {
	type: xmlElementContentType;
	ocur: xmlElementContentOccur;
	name: string;
	c1: interop.Pointer | interop.Reference<_xmlElementContent>;
	c2: interop.Pointer | interop.Reference<_xmlElementContent>;
	parent: interop.Pointer | interop.Reference<_xmlElementContent>;
	prefix: string;
}
declare var _xmlElementContent: interop.StructType<_xmlElementContent>;

interface _xmlEntity {
	_private: interop.Pointer | interop.Reference<any>;
	type: xmlElementType;
	name: string;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlDtd>;
	next: interop.Pointer | interop.Reference<_xmlNode>;
	prev: interop.Pointer | interop.Reference<_xmlNode>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	orig: string;
	content: string;
	length: number;
	etype: xmlEntityType;
	ExternalID: string;
	SystemID: string;
	nexte: interop.Pointer | interop.Reference<_xmlEntity>;
	URI: string;
	owner: number;
	checked: number;
}
declare var _xmlEntity: interop.StructType<_xmlEntity>;

interface _xmlEnumeration {
	next: interop.Pointer | interop.Reference<_xmlEnumeration>;
	name: string;
}
declare var _xmlEnumeration: interop.StructType<_xmlEnumeration>;

interface _xmlError {
	domain: number;
	code: number;
	message: string;
	level: xmlErrorLevel;
	file: string;
	line: number;
	str1: string;
	str2: string;
	str3: string;
	int1: number;
	int2: number;
	ctxt: interop.Pointer | interop.Reference<any>;
	node: interop.Pointer | interop.Reference<any>;
}
declare var _xmlError: interop.StructType<_xmlError>;

interface _xmlGlobalState {
	xmlParserVersion: string;
	xmlDefaultSAXLocator: _xmlSAXLocator;
	xmlDefaultSAXHandler: _xmlSAXHandlerV1;
	docbDefaultSAXHandler: _xmlSAXHandlerV1;
	htmlDefaultSAXHandler: _xmlSAXHandlerV1;
	xmlFree: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	xmlMalloc: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>;
	xmlMemStrdup: interop.FunctionReference<(p1: string) => string>;
	xmlRealloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>;
	xmlGenericError: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	xmlStructuredError: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>;
	xmlGenericErrorContext: interop.Pointer | interop.Reference<any>;
	oldXMLWDcompatibility: number;
	xmlBufferAllocScheme: xmlBufferAllocationScheme;
	xmlDefaultBufferSize: number;
	xmlSubstituteEntitiesDefaultValue: number;
	xmlDoValidityCheckingDefaultValue: number;
	xmlGetWarningsDefaultValue: number;
	xmlKeepBlanksDefaultValue: number;
	xmlLineNumbersDefaultValue: number;
	xmlLoadExtDtdDefaultValue: number;
	xmlParserDebugEntities: number;
	xmlPedanticParserDefaultValue: number;
	xmlSaveNoEmptyTags: number;
	xmlIndentTreeOutput: number;
	xmlTreeIndentString: string;
	xmlRegisterNodeDefaultValue: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>;
	xmlDeregisterNodeDefaultValue: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>;
	xmlMallocAtomic: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>;
	xmlLastError: _xmlError;
	xmlParserInputBufferCreateFilenameValue: interop.FunctionReference<(p1: string, p2: xmlCharEncoding) => interop.Pointer | interop.Reference<_xmlParserInputBuffer>>;
	xmlOutputBufferCreateFilenameValue: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, p3: number) => interop.Pointer | interop.Reference<_xmlOutputBuffer>>;
	xmlStructuredErrorContext: interop.Pointer | interop.Reference<any>;
}
declare var _xmlGlobalState: interop.StructType<_xmlGlobalState>;

interface _xmlID {
	next: interop.Pointer | interop.Reference<_xmlID>;
	value: string;
	attr: interop.Pointer | interop.Reference<_xmlAttr>;
	name: string;
	lineno: number;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
}
declare var _xmlID: interop.StructType<_xmlID>;

interface _xmlLocationSet {
	locNr: number;
	locMax: number;
	locTab: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlXPathObject>>;
}
declare var _xmlLocationSet: interop.StructType<_xmlLocationSet>;

interface _xmlNode {
	_private: interop.Pointer | interop.Reference<any>;
	type: xmlElementType;
	name: string;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlNode>;
	next: interop.Pointer | interop.Reference<_xmlNode>;
	prev: interop.Pointer | interop.Reference<_xmlNode>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	ns: interop.Pointer | interop.Reference<_xmlNs>;
	content: string;
	properties: interop.Pointer | interop.Reference<_xmlAttr>;
	nsDef: interop.Pointer | interop.Reference<_xmlNs>;
	psvi: interop.Pointer | interop.Reference<any>;
	line: number;
	extra: number;
}
declare var _xmlNode: interop.StructType<_xmlNode>;

interface _xmlNodeSet {
	nodeNr: number;
	nodeMax: number;
	nodeTab: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNode>>;
}
declare var _xmlNodeSet: interop.StructType<_xmlNodeSet>;

interface _xmlNotation {
	name: string;
	PublicID: string;
	SystemID: string;
}
declare var _xmlNotation: interop.StructType<_xmlNotation>;

interface _xmlNs {
	next: interop.Pointer | interop.Reference<_xmlNs>;
	type: xmlElementType;
	href: string;
	prefix: string;
	_private: interop.Pointer | interop.Reference<any>;
	context: interop.Pointer | interop.Reference<_xmlDoc>;
}
declare var _xmlNs: interop.StructType<_xmlNs>;

interface _xmlOutputBuffer {
	context: interop.Pointer | interop.Reference<any>;
	writecallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>;
	closecallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	encoder: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>;
	buffer: interop.Pointer | interop.Reference<any>;
	conv: interop.Pointer | interop.Reference<any>;
	written: number;
	error: number;
}
declare var _xmlOutputBuffer: interop.StructType<_xmlOutputBuffer>;

interface _xmlParserCtxt {
	sax: interop.Pointer | interop.Reference<_xmlSAXHandler>;
	userData: interop.Pointer | interop.Reference<any>;
	myDoc: interop.Pointer | interop.Reference<_xmlDoc>;
	wellFormed: number;
	replaceEntities: number;
	version: string;
	encoding: string;
	standalone: number;
	html: number;
	input: interop.Pointer | interop.Reference<_xmlParserInput>;
	inputNr: number;
	inputMax: number;
	inputTab: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlParserInput>>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	nodeNr: number;
	nodeMax: number;
	nodeTab: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNode>>;
	record_info: number;
	node_seq: _xmlParserNodeInfoSeq;
	errNo: number;
	hasExternalSubset: number;
	hasPErefs: number;
	external: number;
	valid: number;
	validate: number;
	vctxt: _xmlValidCtxt;
	instate: xmlParserInputState;
	token: number;
	directory: string;
	name: string;
	nameNr: number;
	nameMax: number;
	nameTab: interop.Pointer | interop.Reference<string>;
	nbChars: number;
	checkIndex: number;
	keepBlanks: number;
	disableSAX: number;
	inSubset: number;
	intSubName: string;
	extSubURI: string;
	extSubSystem: string;
	space: interop.Pointer | interop.Reference<number>;
	spaceNr: number;
	spaceMax: number;
	spaceTab: interop.Pointer | interop.Reference<number>;
	depth: number;
	entity: interop.Pointer | interop.Reference<_xmlParserInput>;
	charset: number;
	nodelen: number;
	nodemem: number;
	pedantic: number;
	_private: interop.Pointer | interop.Reference<any>;
	loadsubset: number;
	linenumbers: number;
	catalogs: interop.Pointer | interop.Reference<any>;
	recovery: number;
	progressive: number;
	dict: interop.Pointer | interop.Reference<any>;
	atts: interop.Pointer | interop.Reference<string>;
	maxatts: number;
	docdict: number;
	str_xml: string;
	str_xmlns: string;
	str_xml_ns: string;
	sax2: number;
	nsNr: number;
	nsMax: number;
	nsTab: interop.Pointer | interop.Reference<string>;
	attallocs: interop.Pointer | interop.Reference<number>;
	pushTab: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>;
	attsDefault: interop.Pointer | interop.Reference<any>;
	attsSpecial: interop.Pointer | interop.Reference<any>;
	nsWellFormed: number;
	options: number;
	dictNames: number;
	freeElemsNr: number;
	freeElems: interop.Pointer | interop.Reference<_xmlNode>;
	freeAttrsNr: number;
	freeAttrs: interop.Pointer | interop.Reference<_xmlAttr>;
	lastError: _xmlError;
	parseMode: xmlParserMode;
	nbentities: number;
	sizeentities: number;
	nodeInfo: interop.Pointer | interop.Reference<_xmlParserNodeInfo>;
	nodeInfoNr: number;
	nodeInfoMax: number;
	nodeInfoTab: interop.Pointer | interop.Reference<_xmlParserNodeInfo>;
	input_id: number;
	sizeentcopy: number;
}
declare var _xmlParserCtxt: interop.StructType<_xmlParserCtxt>;

interface _xmlParserInput {
	buf: interop.Pointer | interop.Reference<_xmlParserInputBuffer>;
	filename: string;
	directory: string;
	base: string;
	cur: string;
	end: string;
	length: number;
	line: number;
	col: number;
	consumed: number;
	free: interop.FunctionReference<(p1: string) => void>;
	encoding: string;
	version: string;
	standalone: number;
	id: number;
}
declare var _xmlParserInput: interop.StructType<_xmlParserInput>;

interface _xmlParserInputBuffer {
	context: interop.Pointer | interop.Reference<any>;
	readcallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>;
	closecallback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	encoder: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>;
	buffer: interop.Pointer | interop.Reference<any>;
	raw: interop.Pointer | interop.Reference<any>;
	compressed: number;
	error: number;
	rawconsumed: number;
}
declare var _xmlParserInputBuffer: interop.StructType<_xmlParserInputBuffer>;

interface _xmlParserNodeInfo {
	node: interop.Pointer | interop.Reference<_xmlNode>;
	begin_pos: number;
	begin_line: number;
	end_pos: number;
	end_line: number;
}
declare var _xmlParserNodeInfo: interop.StructType<_xmlParserNodeInfo>;

interface _xmlParserNodeInfoSeq {
	maximum: number;
	length: number;
	buffer: interop.Pointer | interop.Reference<_xmlParserNodeInfo>;
}
declare var _xmlParserNodeInfoSeq: interop.StructType<_xmlParserNodeInfoSeq>;

interface _xmlRef {
	next: interop.Pointer | interop.Reference<_xmlRef>;
	value: string;
	attr: interop.Pointer | interop.Reference<_xmlAttr>;
	name: string;
	lineno: number;
}
declare var _xmlRef: interop.StructType<_xmlRef>;

interface _xmlSAXHandler {
	internalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string) => void>;
	isStandalone: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	hasInternalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	hasExternalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	resolveEntity: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string) => interop.Pointer | interop.Reference<_xmlParserInput>>;
	getEntity: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => interop.Pointer | interop.Reference<_xmlEntity>>;
	entityDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number, p4: string, p5: string, p6: string) => void>;
	notationDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string) => void>;
	attributeDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: number, p5: number, p6: string, p7: interop.Pointer | interop.Reference<_xmlEnumeration>) => void>;
	elementDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number, p4: interop.Pointer | interop.Reference<_xmlElementContent>) => void>;
	unparsedEntityDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string, p5: string) => void>;
	setDocumentLocator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlSAXLocator>) => void>;
	startDocument: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	endDocument: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	startElement: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: interop.Pointer | interop.Reference<string>) => void>;
	endElement: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	reference: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	characters: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => void>;
	ignorableWhitespace: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => void>;
	processingInstruction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string) => void>;
	comment: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	warning: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	error: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	fatalError: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	getParameterEntity: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => interop.Pointer | interop.Reference<_xmlEntity>>;
	cdataBlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => void>;
	externalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string) => void>;
	initialized: number;
	_private: interop.Pointer | interop.Reference<any>;
	startElementNs: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string, p5: number, p6: interop.Pointer | interop.Reference<string>, p7: number, p8: number, p9: interop.Pointer | interop.Reference<string>) => void>;
	endElementNs: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string) => void>;
	serror: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>;
}
declare var _xmlSAXHandler: interop.StructType<_xmlSAXHandler>;

interface _xmlSAXHandlerV1 {
	internalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string) => void>;
	isStandalone: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	hasInternalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	hasExternalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	resolveEntity: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string) => interop.Pointer | interop.Reference<_xmlParserInput>>;
	getEntity: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => interop.Pointer | interop.Reference<_xmlEntity>>;
	entityDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number, p4: string, p5: string, p6: string) => void>;
	notationDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string) => void>;
	attributeDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: number, p5: number, p6: string, p7: interop.Pointer | interop.Reference<_xmlEnumeration>) => void>;
	elementDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number, p4: interop.Pointer | interop.Reference<_xmlElementContent>) => void>;
	unparsedEntityDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string, p5: string) => void>;
	setDocumentLocator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlSAXLocator>) => void>;
	startDocument: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	endDocument: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	startElement: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: interop.Pointer | interop.Reference<string>) => void>;
	endElement: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	reference: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	characters: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => void>;
	ignorableWhitespace: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => void>;
	processingInstruction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string) => void>;
	comment: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	warning: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	error: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	fatalError: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	getParameterEntity: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => interop.Pointer | interop.Reference<_xmlEntity>>;
	cdataBlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => void>;
	externalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string) => void>;
	initialized: number;
}
declare var _xmlSAXHandlerV1: interop.StructType<_xmlSAXHandlerV1>;

interface _xmlSAXLocator {
	getPublicId: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	getSystemId: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	getLineNumber: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	getColumnNumber: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
}
declare var _xmlSAXLocator: interop.StructType<_xmlSAXLocator>;

interface _xmlSchema {
	name: string;
	targetNamespace: string;
	version: string;
	id: string;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	annot: interop.Pointer | interop.Reference<_xmlSchemaAnnot>;
	flags: number;
	typeDecl: interop.Pointer | interop.Reference<any>;
	attrDecl: interop.Pointer | interop.Reference<any>;
	attrgrpDecl: interop.Pointer | interop.Reference<any>;
	elemDecl: interop.Pointer | interop.Reference<any>;
	notaDecl: interop.Pointer | interop.Reference<any>;
	schemasImports: interop.Pointer | interop.Reference<any>;
	_private: interop.Pointer | interop.Reference<any>;
	groupDecl: interop.Pointer | interop.Reference<any>;
	dict: interop.Pointer | interop.Reference<any>;
	includes: interop.Pointer | interop.Reference<any>;
	preserve: number;
	counter: number;
	idcDef: interop.Pointer | interop.Reference<any>;
	volatiles: interop.Pointer | interop.Reference<any>;
}
declare var _xmlSchema: interop.StructType<_xmlSchema>;

interface _xmlSchemaAnnot {
	next: interop.Pointer | interop.Reference<_xmlSchemaAnnot>;
	content: interop.Pointer | interop.Reference<_xmlNode>;
}
declare var _xmlSchemaAnnot: interop.StructType<_xmlSchemaAnnot>;

interface _xmlSchemaAttribute {
	type: xmlSchemaTypeType;
	next: interop.Pointer | interop.Reference<_xmlSchemaAttribute>;
	name: string;
	id: string;
	ref: string;
	refNs: string;
	typeName: string;
	typeNs: string;
	annot: interop.Pointer | interop.Reference<_xmlSchemaAnnot>;
	base: interop.Pointer | interop.Reference<_xmlSchemaType>;
	occurs: number;
	defValue: string;
	subtypes: interop.Pointer | interop.Reference<_xmlSchemaType>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	targetNamespace: string;
	flags: number;
	refPrefix: string;
	defVal: interop.Pointer | interop.Reference<any>;
	refDecl: interop.Pointer | interop.Reference<_xmlSchemaAttribute>;
}
declare var _xmlSchemaAttribute: interop.StructType<_xmlSchemaAttribute>;

interface _xmlSchemaAttributeGroup {
	type: xmlSchemaTypeType;
	next: interop.Pointer | interop.Reference<_xmlSchemaAttribute>;
	name: string;
	id: string;
	ref: string;
	refNs: string;
	annot: interop.Pointer | interop.Reference<_xmlSchemaAnnot>;
	attributes: interop.Pointer | interop.Reference<_xmlSchemaAttribute>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	flags: number;
	attributeWildcard: interop.Pointer | interop.Reference<_xmlSchemaWildcard>;
	refPrefix: string;
	refItem: interop.Pointer | interop.Reference<_xmlSchemaAttributeGroup>;
	targetNamespace: string;
	attrUses: interop.Pointer | interop.Reference<any>;
}
declare var _xmlSchemaAttributeGroup: interop.StructType<_xmlSchemaAttributeGroup>;

interface _xmlSchemaAttributeLink {
	next: interop.Pointer | interop.Reference<_xmlSchemaAttributeLink>;
	attr: interop.Pointer | interop.Reference<_xmlSchemaAttribute>;
}
declare var _xmlSchemaAttributeLink: interop.StructType<_xmlSchemaAttributeLink>;

interface _xmlSchemaElement {
	type: xmlSchemaTypeType;
	next: interop.Pointer | interop.Reference<_xmlSchemaType>;
	name: string;
	id: string;
	ref: string;
	refNs: string;
	annot: interop.Pointer | interop.Reference<_xmlSchemaAnnot>;
	subtypes: interop.Pointer | interop.Reference<_xmlSchemaType>;
	attributes: interop.Pointer | interop.Reference<_xmlSchemaAttribute>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	minOccurs: number;
	maxOccurs: number;
	flags: number;
	targetNamespace: string;
	namedType: string;
	namedTypeNs: string;
	substGroup: string;
	substGroupNs: string;
	scope: string;
	value: string;
	refDecl: interop.Pointer | interop.Reference<_xmlSchemaElement>;
	contModel: interop.Pointer | interop.Reference<any>;
	contentType: xmlSchemaContentType;
	refPrefix: string;
	defVal: interop.Pointer | interop.Reference<any>;
	idcs: interop.Pointer | interop.Reference<any>;
}
declare var _xmlSchemaElement: interop.StructType<_xmlSchemaElement>;

interface _xmlSchemaFacet {
	type: xmlSchemaTypeType;
	next: interop.Pointer | interop.Reference<_xmlSchemaFacet>;
	value: string;
	id: string;
	annot: interop.Pointer | interop.Reference<_xmlSchemaAnnot>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	fixed: number;
	whitespace: number;
	val: interop.Pointer | interop.Reference<any>;
	regexp: interop.Pointer | interop.Reference<any>;
}
declare var _xmlSchemaFacet: interop.StructType<_xmlSchemaFacet>;

interface _xmlSchemaFacetLink {
	next: interop.Pointer | interop.Reference<_xmlSchemaFacetLink>;
	facet: interop.Pointer | interop.Reference<_xmlSchemaFacet>;
}
declare var _xmlSchemaFacetLink: interop.StructType<_xmlSchemaFacetLink>;

interface _xmlSchemaNotation {
	type: xmlSchemaTypeType;
	name: string;
	annot: interop.Pointer | interop.Reference<_xmlSchemaAnnot>;
	identifier: string;
	targetNamespace: string;
}
declare var _xmlSchemaNotation: interop.StructType<_xmlSchemaNotation>;

interface _xmlSchemaType {
	type: xmlSchemaTypeType;
	next: interop.Pointer | interop.Reference<_xmlSchemaType>;
	name: string;
	id: string;
	ref: string;
	refNs: string;
	annot: interop.Pointer | interop.Reference<_xmlSchemaAnnot>;
	subtypes: interop.Pointer | interop.Reference<_xmlSchemaType>;
	attributes: interop.Pointer | interop.Reference<_xmlSchemaAttribute>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	minOccurs: number;
	maxOccurs: number;
	flags: number;
	contentType: xmlSchemaContentType;
	base: string;
	baseNs: string;
	baseType: interop.Pointer | interop.Reference<_xmlSchemaType>;
	facets: interop.Pointer | interop.Reference<_xmlSchemaFacet>;
	redef: interop.Pointer | interop.Reference<_xmlSchemaType>;
	recurse: number;
	attributeUses: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlSchemaAttributeLink>>;
	attributeWildcard: interop.Pointer | interop.Reference<_xmlSchemaWildcard>;
	builtInType: number;
	memberTypes: interop.Pointer | interop.Reference<_xmlSchemaTypeLink>;
	facetSet: interop.Pointer | interop.Reference<_xmlSchemaFacetLink>;
	refPrefix: string;
	contentTypeDef: interop.Pointer | interop.Reference<_xmlSchemaType>;
	contModel: interop.Pointer | interop.Reference<any>;
	targetNamespace: string;
	attrUses: interop.Pointer | interop.Reference<any>;
}
declare var _xmlSchemaType: interop.StructType<_xmlSchemaType>;

interface _xmlSchemaTypeLink {
	next: interop.Pointer | interop.Reference<_xmlSchemaTypeLink>;
	type: interop.Pointer | interop.Reference<_xmlSchemaType>;
}
declare var _xmlSchemaTypeLink: interop.StructType<_xmlSchemaTypeLink>;

interface _xmlSchemaWildcard {
	type: xmlSchemaTypeType;
	id: string;
	annot: interop.Pointer | interop.Reference<_xmlSchemaAnnot>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	minOccurs: number;
	maxOccurs: number;
	processContents: number;
	any: number;
	nsSet: interop.Pointer | interop.Reference<_xmlSchemaWildcardNs>;
	negNsSet: interop.Pointer | interop.Reference<_xmlSchemaWildcardNs>;
	flags: number;
}
declare var _xmlSchemaWildcard: interop.StructType<_xmlSchemaWildcard>;

interface _xmlSchemaWildcardNs {
	next: interop.Pointer | interop.Reference<_xmlSchemaWildcardNs>;
	value: string;
}
declare var _xmlSchemaWildcardNs: interop.StructType<_xmlSchemaWildcardNs>;

interface _xmlShellCtxt {
	filename: string;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	pctxt: interop.Pointer | interop.Reference<_xmlXPathContext>;
	loaded: number;
	output: interop.Pointer | interop.Reference<FILE>;
	input: interop.FunctionReference<(p1: string) => string>;
}
declare var _xmlShellCtxt: interop.StructType<_xmlShellCtxt>;

interface _xmlURI {
	scheme: string;
	opaque: string;
	authority: string;
	server: string;
	user: string;
	port: number;
	path: string;
	query: string;
	fragment: string;
	cleanup: number;
	query_raw: string;
}
declare var _xmlURI: interop.StructType<_xmlURI>;

interface _xmlValidCtxt {
	userData: interop.Pointer | interop.Reference<any>;
	error: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	warning: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	nodeNr: number;
	nodeMax: number;
	nodeTab: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNode>>;
	finishDtd: number;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	valid: number;
	vstate: interop.Pointer | interop.Reference<any>;
	vstateNr: number;
	vstateMax: number;
	vstateTab: interop.Pointer | interop.Reference<any>;
	am: interop.Pointer | interop.Reference<any>;
	state: interop.Pointer | interop.Reference<any>;
}
declare var _xmlValidCtxt: interop.StructType<_xmlValidCtxt>;

interface _xmlXPathAxis {
	name: string;
	func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: interop.Pointer | interop.Reference<_xmlXPathObject>) => interop.Pointer | interop.Reference<_xmlXPathObject>>;
}
declare var _xmlXPathAxis: interop.StructType<_xmlXPathAxis>;

interface _xmlXPathContext {
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	node: interop.Pointer | interop.Reference<_xmlNode>;
	nb_variables_unused: number;
	max_variables_unused: number;
	varHash: interop.Pointer | interop.Reference<any>;
	nb_types: number;
	max_types: number;
	types: interop.Pointer | interop.Reference<_xmlXPathType>;
	nb_funcs_unused: number;
	max_funcs_unused: number;
	funcHash: interop.Pointer | interop.Reference<any>;
	nb_axis: number;
	max_axis: number;
	axis: interop.Pointer | interop.Reference<_xmlXPathAxis>;
	namespaces: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNs>>;
	nsNr: number;
	user: interop.Pointer | interop.Reference<any>;
	contextSize: number;
	proximityPosition: number;
	xptr: number;
	here: interop.Pointer | interop.Reference<_xmlNode>;
	origin: interop.Pointer | interop.Reference<_xmlNode>;
	nsHash: interop.Pointer | interop.Reference<any>;
	varLookupFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string) => interop.Pointer | interop.Reference<_xmlXPathObject>>;
	varLookupData: interop.Pointer | interop.Reference<any>;
	extra: interop.Pointer | interop.Reference<any>;
	function: string;
	functionURI: string;
	funcLookupFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string) => interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>>;
	funcLookupData: interop.Pointer | interop.Reference<any>;
	tmpNsList: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNs>>;
	tmpNsNr: number;
	userData: interop.Pointer | interop.Reference<any>;
	error: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>;
	lastError: _xmlError;
	debugNode: interop.Pointer | interop.Reference<_xmlNode>;
	dict: interop.Pointer | interop.Reference<any>;
	flags: number;
	cache: interop.Pointer | interop.Reference<any>;
}
declare var _xmlXPathContext: interop.StructType<_xmlXPathContext>;

interface _xmlXPathFunct {
	name: string;
	func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>;
}
declare var _xmlXPathFunct: interop.StructType<_xmlXPathFunct>;

interface _xmlXPathObject {
	type: xmlXPathObjectType;
	nodesetval: interop.Pointer | interop.Reference<_xmlNodeSet>;
	boolval: number;
	floatval: number;
	stringval: string;
	user: interop.Pointer | interop.Reference<any>;
	index: number;
	user2: interop.Pointer | interop.Reference<any>;
	index2: number;
}
declare var _xmlXPathObject: interop.StructType<_xmlXPathObject>;

interface _xmlXPathParserContext {
	cur: string;
	base: string;
	error: number;
	context: interop.Pointer | interop.Reference<_xmlXPathContext>;
	value: interop.Pointer | interop.Reference<_xmlXPathObject>;
	valueNr: number;
	valueMax: number;
	valueTab: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlXPathObject>>;
	comp: interop.Pointer | interop.Reference<any>;
	xptr: number;
	ancestor: interop.Pointer | interop.Reference<_xmlNode>;
	valueFrame: number;
}
declare var _xmlXPathParserContext: interop.StructType<_xmlXPathParserContext>;

interface _xmlXPathType {
	name: string;
	func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathObject>, p2: number) => number>;
}
declare var _xmlXPathType: interop.StructType<_xmlXPathType>;

interface _xmlXPathVariable {
	name: string;
	value: interop.Pointer | interop.Reference<_xmlXPathObject>;
}
declare var _xmlXPathVariable: interop.StructType<_xmlXPathVariable>;

declare function attribute(ctx: interop.Pointer | interop.Reference<any>, fullname: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): void;

declare function attributeDecl(ctx: interop.Pointer | interop.Reference<any>, elem: string | interop.Pointer | interop.Reference<any>, fullname: string | interop.Pointer | interop.Reference<any>, type: number, def: number, defaultValue: string | interop.Pointer | interop.Reference<any>, tree: interop.Pointer | interop.Reference<_xmlEnumeration>): void;

declare function cdataBlock(ctx: interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>, len: number): void;

declare function characters(ctx: interop.Pointer | interop.Reference<any>, ch: string | interop.Pointer | interop.Reference<any>, len: number): void;

declare function checkNamespace(ctx: interop.Pointer | interop.Reference<any>, nameSpace: string | interop.Pointer | interop.Reference<any>): number;

declare function comment(ctx: interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): void;

declare function docbDefaultSAXHandlerInit(): void;

declare function elementDecl(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, type: number, content: interop.Pointer | interop.Reference<_xmlElementContent>): void;

declare var emptyExp: interop.Pointer | interop.Reference<any>;

declare function endDocument(ctx: interop.Pointer | interop.Reference<any>): void;

declare function endElement(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function entityDecl(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, type: number, publicId: string | interop.Pointer | interop.Reference<any>, systemId: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): void;

declare function externalSubset(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>): void;

declare var forbiddenExp: interop.Pointer | interop.Reference<any>;

declare function getColumnNumber(ctx: interop.Pointer | interop.Reference<any>): number;

declare function getEntity(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function getLineNumber(ctx: interop.Pointer | interop.Reference<any>): number;

declare function getNamespace(ctx: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNs>;

declare function getParameterEntity(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function getPublicId(ctx: interop.Pointer | interop.Reference<any>): string;

declare function getSystemId(ctx: interop.Pointer | interop.Reference<any>): string;

declare function globalNamespace(ctx: interop.Pointer | interop.Reference<any>, href: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>): void;

declare function hasExternalSubset(ctx: interop.Pointer | interop.Reference<any>): number;

declare function hasInternalSubset(ctx: interop.Pointer | interop.Reference<any>): number;

declare function htmlAttrAllowed(p1: interop.Pointer | interop.Reference<_htmlElemDesc>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): htmlStatus;

declare function htmlAutoCloseTag(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>, elem: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function htmlCreateFileParserCtxt(filename: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function htmlCreateMemoryParserCtxt(buffer: string | interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function htmlCreatePushParserCtxt(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, user_data: interop.Pointer | interop.Reference<any>, chunk: string | interop.Pointer | interop.Reference<any>, size: number, filename: string | interop.Pointer | interop.Reference<any>, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function htmlCtxtReadDoc(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, cur: string | interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlCtxtReadFd(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, fd: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlCtxtReadFile(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, filename: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlCtxtReadIO(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, ioread: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, ioclose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ioctx: interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlCtxtReadMemory(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, buffer: string | interop.Pointer | interop.Reference<any>, size: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlCtxtReset(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function htmlCtxtUseOptions(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, options: number): number;

declare function htmlDefaultSAXHandlerInit(): void;

declare function htmlDocContentDumpFormatOutput(buf: interop.Pointer | interop.Reference<_xmlOutputBuffer>, cur: interop.Pointer | interop.Reference<_xmlDoc>, encoding: string | interop.Pointer | interop.Reference<any>, format: number): void;

declare function htmlDocContentDumpOutput(buf: interop.Pointer | interop.Reference<_xmlOutputBuffer>, cur: interop.Pointer | interop.Reference<_xmlDoc>, encoding: string | interop.Pointer | interop.Reference<any>): void;

declare function htmlDocDump(f: interop.Pointer | interop.Reference<FILE>, cur: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function htmlDocDumpMemory(cur: interop.Pointer | interop.Reference<_xmlDoc>, mem: interop.Pointer | interop.Reference<string>, size: interop.Pointer | interop.Reference<number>): void;

declare function htmlDocDumpMemoryFormat(cur: interop.Pointer | interop.Reference<_xmlDoc>, mem: interop.Pointer | interop.Reference<string>, size: interop.Pointer | interop.Reference<number>, format: number): void;

declare function htmlElementAllowedHere(p1: interop.Pointer | interop.Reference<_htmlElemDesc>, p2: string | interop.Pointer | interop.Reference<any>): number;

declare function htmlElementStatusHere(p1: interop.Pointer | interop.Reference<_htmlElemDesc>, p2: interop.Pointer | interop.Reference<_htmlElemDesc>): htmlStatus;

declare function htmlEncodeEntities(out: string | interop.Pointer | interop.Reference<any>, outlen: interop.Pointer | interop.Reference<number>, _in: string | interop.Pointer | interop.Reference<any>, inlen: interop.Pointer | interop.Reference<number>, quoteChar: number): number;

declare function htmlEntityLookup(name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_htmlEntityDesc>;

declare function htmlEntityValueLookup(value: number): interop.Pointer | interop.Reference<_htmlEntityDesc>;

declare function htmlFreeParserCtxt(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function htmlGetMetaEncoding(doc: interop.Pointer | interop.Reference<_xmlDoc>): string;

declare function htmlHandleOmittedElem(val: number): number;

declare function htmlInitAutoClose(): void;

declare function htmlIsAutoClosed(doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function htmlIsBooleanAttr(name: string | interop.Pointer | interop.Reference<any>): number;

declare function htmlIsScriptAttribute(name: string | interop.Pointer | interop.Reference<any>): number;

declare function htmlNewDoc(URI: string | interop.Pointer | interop.Reference<any>, ExternalID: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlNewDocNoDtD(URI: string | interop.Pointer | interop.Reference<any>, ExternalID: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlNewParserCtxt(): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function htmlNodeDump(buf: interop.Pointer | interop.Reference<_xmlBuffer>, doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function htmlNodeDumpFile(out: interop.Pointer | interop.Reference<FILE>, doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlNode>): void;

declare function htmlNodeDumpFileFormat(out: interop.Pointer | interop.Reference<FILE>, doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlNode>, encoding: string | interop.Pointer | interop.Reference<any>, format: number): number;

declare function htmlNodeDumpFormatOutput(buf: interop.Pointer | interop.Reference<_xmlOutputBuffer>, doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlNode>, encoding: string | interop.Pointer | interop.Reference<any>, format: number): void;

declare function htmlNodeDumpOutput(buf: interop.Pointer | interop.Reference<_xmlOutputBuffer>, doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlNode>, encoding: string | interop.Pointer | interop.Reference<any>): void;

declare function htmlNodeStatus(p1: interop.Pointer | interop.Reference<_xmlNode>, p2: number): htmlStatus;

declare function htmlParseCharRef(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function htmlParseChunk(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, chunk: string | interop.Pointer | interop.Reference<any>, size: number, terminate: number): number;

declare function htmlParseDoc(cur: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlParseDocument(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function htmlParseElement(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function htmlParseEntityRef(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, str: interop.Pointer | interop.Reference<string>): interop.Pointer | interop.Reference<_htmlEntityDesc>;

declare function htmlParseFile(filename: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare const enum htmlParserOption {

	HTML_PARSE_RECOVER = 1,

	HTML_PARSE_NODEFDTD = 4,

	HTML_PARSE_NOERROR = 32,

	HTML_PARSE_NOWARNING = 64,

	HTML_PARSE_PEDANTIC = 128,

	HTML_PARSE_NOBLANKS = 256,

	HTML_PARSE_NONET = 2048,

	HTML_PARSE_NOIMPLIED = 8192,

	HTML_PARSE_COMPACT = 65536,

	HTML_PARSE_IGNORE_ENC = 2097152
}

declare function htmlReadDoc(cur: string | interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlReadFd(fd: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlReadFile(URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlReadIO(ioread: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, ioclose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ioctx: interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlReadMemory(buffer: string | interop.Pointer | interop.Reference<any>, size: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlSAXParseDoc(cur: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, userData: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlSAXParseFile(filename: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, userData: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function htmlSaveFile(filename: string | interop.Pointer | interop.Reference<any>, cur: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function htmlSaveFileEnc(filename: string | interop.Pointer | interop.Reference<any>, cur: interop.Pointer | interop.Reference<_xmlDoc>, encoding: string | interop.Pointer | interop.Reference<any>): number;

declare function htmlSaveFileFormat(filename: string | interop.Pointer | interop.Reference<any>, cur: interop.Pointer | interop.Reference<_xmlDoc>, encoding: string | interop.Pointer | interop.Reference<any>, format: number): number;

declare function htmlSetMetaEncoding(doc: interop.Pointer | interop.Reference<_xmlDoc>, encoding: string | interop.Pointer | interop.Reference<any>): number;

declare const enum htmlStatus {

	HTML_NA = 0,

	HTML_INVALID = 1,

	HTML_DEPRECATED = 2,

	HTML_VALID = 4,

	HTML_REQUIRED = 12
}

declare function htmlTagLookup(tag: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_htmlElemDesc>;

declare function ignorableWhitespace(ctx: interop.Pointer | interop.Reference<any>, ch: string | interop.Pointer | interop.Reference<any>, len: number): void;

declare function initGenericErrorDefaultFunc(handler: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>>): void;

declare function initdocbDefaultSAXHandler(hdlr: interop.Pointer | interop.Reference<_xmlSAXHandlerV1>): void;

declare function inithtmlDefaultSAXHandler(hdlr: interop.Pointer | interop.Reference<_xmlSAXHandlerV1>): void;

declare function initxmlDefaultSAXHandler(hdlr: interop.Pointer | interop.Reference<_xmlSAXHandlerV1>, warning: number): void;

declare function inputPop(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function inputPush(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, value: interop.Pointer | interop.Reference<_xmlParserInput>): number;

declare function internalSubset(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>): void;

declare function isStandalone(ctx: interop.Pointer | interop.Reference<any>): number;

declare function isolat1ToUTF8(out: string | interop.Pointer | interop.Reference<any>, outlen: interop.Pointer | interop.Reference<number>, _in: string | interop.Pointer | interop.Reference<any>, inlen: interop.Pointer | interop.Reference<number>): number;

declare function namePop(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function namePush(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, value: string | interop.Pointer | interop.Reference<any>): number;

declare function namespaceDecl(ctx: interop.Pointer | interop.Reference<any>, href: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>): void;

declare function nodePop(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): interop.Pointer | interop.Reference<_xmlNode>;

declare function nodePush(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, value: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function notationDecl(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, publicId: string | interop.Pointer | interop.Reference<any>, systemId: string | interop.Pointer | interop.Reference<any>): void;

declare function processingInstruction(ctx: interop.Pointer | interop.Reference<any>, target: string | interop.Pointer | interop.Reference<any>, data: string | interop.Pointer | interop.Reference<any>): void;

declare function reference(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function resolveEntity(ctx: interop.Pointer | interop.Reference<any>, publicId: string | interop.Pointer | interop.Reference<any>, systemId: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function setDocumentLocator(ctx: interop.Pointer | interop.Reference<any>, loc: interop.Pointer | interop.Reference<_xmlSAXLocator>): void;

declare function setNamespace(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function startDocument(ctx: interop.Pointer | interop.Reference<any>): void;

declare function startElement(ctx: interop.Pointer | interop.Reference<any>, fullname: string | interop.Pointer | interop.Reference<any>, atts: interop.Pointer | interop.Reference<string>): void;

declare function unparsedEntityDecl(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, publicId: string | interop.Pointer | interop.Reference<any>, systemId: string | interop.Pointer | interop.Reference<any>, notationName: string | interop.Pointer | interop.Reference<any>): void;

declare function valuePop(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function valuePush(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, value: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare const enum xlinkActuate {

	XLINK_ACTUATE_NONE = 0,

	XLINK_ACTUATE_AUTO = 1,

	XLINK_ACTUATE_ONREQUEST = 2
}

declare function xlinkGetDefaultDetect(): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlNode>) => void>;

declare function xlinkGetDefaultHandler(): interop.Pointer | interop.Reference<_xlinkHandler>;

declare function xlinkIsLink(doc: interop.Pointer | interop.Reference<_xmlDoc>, node: interop.Pointer | interop.Reference<_xmlNode>): xlinkType;

declare function xlinkSetDefaultDetect(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlNode>) => void>): void;

declare function xlinkSetDefaultHandler(handler: interop.Pointer | interop.Reference<_xlinkHandler>): void;

declare const enum xlinkShow {

	XLINK_SHOW_NONE = 0,

	XLINK_SHOW_NEW = 1,

	XLINK_SHOW_EMBED = 2,

	XLINK_SHOW_REPLACE = 3
}

declare const enum xlinkType {

	XLINK_TYPE_NONE = 0,

	XLINK_TYPE_SIMPLE = 1,

	XLINK_TYPE_EXTENDED = 2,

	XLINK_TYPE_EXTENDED_SET = 3
}

declare function xmlACatalogAdd(catal: interop.Pointer | interop.Reference<any>, type: string | interop.Pointer | interop.Reference<any>, orig: string | interop.Pointer | interop.Reference<any>, replace: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlACatalogDump(catal: interop.Pointer | interop.Reference<any>, out: interop.Pointer | interop.Reference<FILE>): void;

declare function xmlACatalogRemove(catal: interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlACatalogResolve(catal: interop.Pointer | interop.Reference<any>, pubID: string | interop.Pointer | interop.Reference<any>, sysID: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlACatalogResolvePublic(catal: interop.Pointer | interop.Reference<any>, pubID: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlACatalogResolveSystem(catal: interop.Pointer | interop.Reference<any>, sysID: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlACatalogResolveURI(catal: interop.Pointer | interop.Reference<any>, URI: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlAddAttributeDecl(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, dtd: interop.Pointer | interop.Reference<_xmlDtd>, elem: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, ns: string | interop.Pointer | interop.Reference<any>, type: xmlAttributeType, def: xmlAttributeDefault, defaultValue: string | interop.Pointer | interop.Reference<any>, tree: interop.Pointer | interop.Reference<_xmlEnumeration>): interop.Pointer | interop.Reference<_xmlAttribute>;

declare function xmlAddChild(parent: interop.Pointer | interop.Reference<_xmlNode>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlAddChildList(parent: interop.Pointer | interop.Reference<_xmlNode>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlAddDocEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>, type: number, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function xmlAddDtdEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>, type: number, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function xmlAddElementDecl(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, dtd: interop.Pointer | interop.Reference<_xmlDtd>, name: string | interop.Pointer | interop.Reference<any>, type: xmlElementTypeVal, content: interop.Pointer | interop.Reference<_xmlElementContent>): interop.Pointer | interop.Reference<_xmlElement>;

declare function xmlAddEncodingAlias(name: string | interop.Pointer | interop.Reference<any>, alias: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlAddID(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, value: string | interop.Pointer | interop.Reference<any>, attr: interop.Pointer | interop.Reference<_xmlAttr>): interop.Pointer | interop.Reference<_xmlID>;

declare function xmlAddNextSibling(cur: interop.Pointer | interop.Reference<_xmlNode>, elem: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlAddNotationDecl(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, dtd: interop.Pointer | interop.Reference<_xmlDtd>, name: string | interop.Pointer | interop.Reference<any>, PublicID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNotation>;

declare function xmlAddPrevSibling(cur: interop.Pointer | interop.Reference<_xmlNode>, elem: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlAddRef(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, value: string | interop.Pointer | interop.Reference<any>, attr: interop.Pointer | interop.Reference<_xmlAttr>): interop.Pointer | interop.Reference<_xmlRef>;

declare function xmlAddSibling(cur: interop.Pointer | interop.Reference<_xmlNode>, elem: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlAllocOutputBuffer(encoder: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>): interop.Pointer | interop.Reference<_xmlOutputBuffer>;

declare function xmlAllocParserInputBuffer(enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserInputBuffer>;

declare function xmlAttrSerializeTxtContent(buf: interop.Pointer | interop.Reference<_xmlBuffer>, doc: interop.Pointer | interop.Reference<_xmlDoc>, attr: interop.Pointer | interop.Reference<_xmlAttr>, string: string | interop.Pointer | interop.Reference<any>): void;

declare const enum xmlAttributeDefault {

	XML_ATTRIBUTE_NONE = 1,

	XML_ATTRIBUTE_REQUIRED = 2,

	XML_ATTRIBUTE_IMPLIED = 3,

	XML_ATTRIBUTE_FIXED = 4
}

declare const enum xmlAttributeType {

	XML_ATTRIBUTE_CDATA = 1,

	XML_ATTRIBUTE_ID = 2,

	XML_ATTRIBUTE_IDREF = 3,

	XML_ATTRIBUTE_IDREFS = 4,

	XML_ATTRIBUTE_ENTITY = 5,

	XML_ATTRIBUTE_ENTITIES = 6,

	XML_ATTRIBUTE_NMTOKEN = 7,

	XML_ATTRIBUTE_NMTOKENS = 8,

	XML_ATTRIBUTE_ENUMERATION = 9,

	XML_ATTRIBUTE_NOTATION = 10
}

declare function xmlAutomataCompile(am: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataGetInitState(am: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataIsDeterminist(am: interop.Pointer | interop.Reference<any>): number;

declare function xmlAutomataNewAllTrans(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>, lax: number): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewCountTrans(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>, token: string | interop.Pointer | interop.Reference<any>, min: number, max: number, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewCountTrans2(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>, token: string | interop.Pointer | interop.Reference<any>, token2: string | interop.Pointer | interop.Reference<any>, min: number, max: number, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewCountedTrans(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>, counter: number): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewCounter(am: interop.Pointer | interop.Reference<any>, min: number, max: number): number;

declare function xmlAutomataNewCounterTrans(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>, counter: number): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewEpsilon(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewNegTrans(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>, token: string | interop.Pointer | interop.Reference<any>, token2: string | interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewOnceTrans(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>, token: string | interop.Pointer | interop.Reference<any>, min: number, max: number, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewOnceTrans2(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>, token: string | interop.Pointer | interop.Reference<any>, token2: string | interop.Pointer | interop.Reference<any>, min: number, max: number, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewState(am: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewTransition(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>, token: string | interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataNewTransition2(am: interop.Pointer | interop.Reference<any>, from: interop.Pointer | interop.Reference<any>, to: interop.Pointer | interop.Reference<any>, token: string | interop.Pointer | interop.Reference<any>, token2: string | interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlAutomataSetFinalState(am: interop.Pointer | interop.Reference<any>, state: interop.Pointer | interop.Reference<any>): number;

declare function xmlBoolToText(boolval: number): string;

declare function xmlBufContent(buf: interop.Pointer | interop.Reference<any>): string;

declare function xmlBufEnd(buf: interop.Pointer | interop.Reference<any>): string;

declare function xmlBufGetNodeContent(buf: interop.Pointer | interop.Reference<any>, cur: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlBufNodeDump(buf: interop.Pointer | interop.Reference<any>, doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlNode>, level: number, format: number): number;

declare function xmlBufShrink(buf: interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlBufUse(buf: interop.Pointer | interop.Reference<any>): number;

declare function xmlBufferAdd(buf: interop.Pointer | interop.Reference<_xmlBuffer>, str: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlBufferAddHead(buf: interop.Pointer | interop.Reference<_xmlBuffer>, str: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare const enum xmlBufferAllocationScheme {

	XML_BUFFER_ALLOC_DOUBLEIT = 0,

	XML_BUFFER_ALLOC_EXACT = 1,

	XML_BUFFER_ALLOC_IMMUTABLE = 2,

	XML_BUFFER_ALLOC_IO = 3,

	XML_BUFFER_ALLOC_HYBRID = 4,

	XML_BUFFER_ALLOC_BOUNDED = 5
}

declare function xmlBufferCCat(buf: interop.Pointer | interop.Reference<_xmlBuffer>, str: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlBufferCat(buf: interop.Pointer | interop.Reference<_xmlBuffer>, str: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlBufferContent(buf: interop.Pointer | interop.Reference<_xmlBuffer>): string;

declare function xmlBufferCreate(): interop.Pointer | interop.Reference<_xmlBuffer>;

declare function xmlBufferCreateSize(size: number): interop.Pointer | interop.Reference<_xmlBuffer>;

declare function xmlBufferCreateStatic(mem: interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<_xmlBuffer>;

declare function xmlBufferDetach(buf: interop.Pointer | interop.Reference<_xmlBuffer>): string;

declare function xmlBufferDump(file: interop.Pointer | interop.Reference<FILE>, buf: interop.Pointer | interop.Reference<_xmlBuffer>): number;

declare function xmlBufferEmpty(buf: interop.Pointer | interop.Reference<_xmlBuffer>): void;

declare function xmlBufferFree(buf: interop.Pointer | interop.Reference<_xmlBuffer>): void;

declare function xmlBufferGrow(buf: interop.Pointer | interop.Reference<_xmlBuffer>, len: number): number;

declare function xmlBufferLength(buf: interop.Pointer | interop.Reference<_xmlBuffer>): number;

declare function xmlBufferResize(buf: interop.Pointer | interop.Reference<_xmlBuffer>, size: number): number;

declare function xmlBufferSetAllocationScheme(buf: interop.Pointer | interop.Reference<_xmlBuffer>, scheme: xmlBufferAllocationScheme): void;

declare function xmlBufferShrink(buf: interop.Pointer | interop.Reference<_xmlBuffer>, len: number): number;

declare function xmlBufferWriteCHAR(buf: interop.Pointer | interop.Reference<_xmlBuffer>, string: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlBufferWriteChar(buf: interop.Pointer | interop.Reference<_xmlBuffer>, string: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlBufferWriteQuotedString(buf: interop.Pointer | interop.Reference<_xmlBuffer>, string: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlBuildQName(ncname: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>, memory: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function xmlBuildRelativeURI(URI: string | interop.Pointer | interop.Reference<any>, base: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlBuildURI(URI: string | interop.Pointer | interop.Reference<any>, base: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlByteConsumed(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function xmlC14NDocDumpMemory(doc: interop.Pointer | interop.Reference<_xmlDoc>, nodes: interop.Pointer | interop.Reference<_xmlNodeSet>, mode: number, inclusive_ns_prefixes: interop.Pointer | interop.Reference<string>, with_comments: number, doc_txt_ptr: interop.Pointer | interop.Reference<string>): number;

declare function xmlC14NDocSave(doc: interop.Pointer | interop.Reference<_xmlDoc>, nodes: interop.Pointer | interop.Reference<_xmlNodeSet>, mode: number, inclusive_ns_prefixes: interop.Pointer | interop.Reference<string>, with_comments: number, filename: string | interop.Pointer | interop.Reference<any>, compression: number): number;

declare function xmlC14NDocSaveTo(doc: interop.Pointer | interop.Reference<_xmlDoc>, nodes: interop.Pointer | interop.Reference<_xmlNodeSet>, mode: number, inclusive_ns_prefixes: interop.Pointer | interop.Reference<string>, with_comments: number, buf: interop.Pointer | interop.Reference<_xmlOutputBuffer>): number;

declare function xmlC14NExecute(doc: interop.Pointer | interop.Reference<_xmlDoc>, is_visible_callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlNode>, p3: interop.Pointer | interop.Reference<_xmlNode>) => number>, user_data: interop.Pointer | interop.Reference<any>, mode: number, inclusive_ns_prefixes: interop.Pointer | interop.Reference<string>, with_comments: number, buf: interop.Pointer | interop.Reference<_xmlOutputBuffer>): number;

declare const enum xmlC14NMode {

	XML_C14N_1_0 = 0,

	XML_C14N_EXCLUSIVE_1_0 = 1,

	XML_C14N_1_1 = 2
}

declare function xmlCanonicPath(path: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlCatalogAdd(type: string | interop.Pointer | interop.Reference<any>, orig: string | interop.Pointer | interop.Reference<any>, replace: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlCatalogAddLocal(catalogs: interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare const enum xmlCatalogAllow {

	XML_CATA_ALLOW_NONE = 0,

	XML_CATA_ALLOW_GLOBAL = 1,

	XML_CATA_ALLOW_DOCUMENT = 2,

	XML_CATA_ALLOW_ALL = 3
}

declare function xmlCatalogCleanup(): void;

declare function xmlCatalogConvert(): number;

declare function xmlCatalogDump(out: interop.Pointer | interop.Reference<FILE>): void;

declare function xmlCatalogFreeLocal(catalogs: interop.Pointer | interop.Reference<any>): void;

declare function xmlCatalogGetDefaults(): xmlCatalogAllow;

declare function xmlCatalogGetPublic(pubID: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlCatalogGetSystem(sysID: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlCatalogIsEmpty(catal: interop.Pointer | interop.Reference<any>): number;

declare function xmlCatalogLocalResolve(catalogs: interop.Pointer | interop.Reference<any>, pubID: string | interop.Pointer | interop.Reference<any>, sysID: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlCatalogLocalResolveURI(catalogs: interop.Pointer | interop.Reference<any>, URI: string | interop.Pointer | interop.Reference<any>): string;

declare const enum xmlCatalogPrefer {

	XML_CATA_PREFER_NONE = 0,

	XML_CATA_PREFER_PUBLIC = 1,

	XML_CATA_PREFER_SYSTEM = 2
}

declare function xmlCatalogRemove(value: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlCatalogResolve(pubID: string | interop.Pointer | interop.Reference<any>, sysID: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlCatalogResolvePublic(pubID: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlCatalogResolveSystem(sysID: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlCatalogResolveURI(URI: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlCatalogSetDebug(level: number): number;

declare function xmlCatalogSetDefaultPrefer(prefer: xmlCatalogPrefer): xmlCatalogPrefer;

declare function xmlCatalogSetDefaults(allow: xmlCatalogAllow): void;

declare function xmlCharEncCloseFunc(handler: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>): number;

declare function xmlCharEncFirstLine(handler: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, out: interop.Pointer | interop.Reference<_xmlBuffer>, _in: interop.Pointer | interop.Reference<_xmlBuffer>): number;

declare function xmlCharEncInFunc(handler: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, out: interop.Pointer | interop.Reference<_xmlBuffer>, _in: interop.Pointer | interop.Reference<_xmlBuffer>): number;

declare function xmlCharEncOutFunc(handler: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, out: interop.Pointer | interop.Reference<_xmlBuffer>, _in: interop.Pointer | interop.Reference<_xmlBuffer>): number;

declare const enum xmlCharEncoding {

	XML_CHAR_ENCODING_ERROR = -1,

	XML_CHAR_ENCODING_NONE = 0,

	XML_CHAR_ENCODING_UTF8 = 1,

	XML_CHAR_ENCODING_UTF16LE = 2,

	XML_CHAR_ENCODING_UTF16BE = 3,

	XML_CHAR_ENCODING_UCS4LE = 4,

	XML_CHAR_ENCODING_UCS4BE = 5,

	XML_CHAR_ENCODING_EBCDIC = 6,

	XML_CHAR_ENCODING_UCS4_2143 = 7,

	XML_CHAR_ENCODING_UCS4_3412 = 8,

	XML_CHAR_ENCODING_UCS2 = 9,

	XML_CHAR_ENCODING_8859_1 = 10,

	XML_CHAR_ENCODING_8859_2 = 11,

	XML_CHAR_ENCODING_8859_3 = 12,

	XML_CHAR_ENCODING_8859_4 = 13,

	XML_CHAR_ENCODING_8859_5 = 14,

	XML_CHAR_ENCODING_8859_6 = 15,

	XML_CHAR_ENCODING_8859_7 = 16,

	XML_CHAR_ENCODING_8859_8 = 17,

	XML_CHAR_ENCODING_8859_9 = 18,

	XML_CHAR_ENCODING_2022_JP = 19,

	XML_CHAR_ENCODING_SHIFT_JIS = 20,

	XML_CHAR_ENCODING_EUC_JP = 21,

	XML_CHAR_ENCODING_ASCII = 22
}

declare function xmlCharInRange(val: number, group: interop.Pointer | interop.Reference<_xmlChRangeGroup>): number;

declare function xmlCharStrdup(cur: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlCharStrndup(cur: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function xmlCheckFilename(path: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlCheckHTTPInput(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, ret: interop.Pointer | interop.Reference<_xmlParserInput>): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function xmlCheckLanguageID(lang: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlCheckUTF8(utf: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlCheckVersion(version: number): void;

declare function xmlChildElementCount(parent: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlCleanupCharEncodingHandlers(): void;

declare function xmlCleanupEncodingAliases(): void;

declare function xmlCleanupGlobals(): void;

declare function xmlCleanupInputCallbacks(): void;

declare function xmlCleanupMemory(): void;

declare function xmlCleanupOutputCallbacks(): void;

declare function xmlCleanupParser(): void;

declare function xmlCleanupPredefinedEntities(): void;

declare function xmlCleanupThreads(): void;

declare function xmlClearNodeInfoSeq(seq: interop.Pointer | interop.Reference<_xmlParserNodeInfoSeq>): void;

declare function xmlClearParserCtxt(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlConvertSGMLCatalog(catal: interop.Pointer | interop.Reference<any>): number;

declare function xmlCopyAttributeTable(table: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlCopyChar(len: number, out: string | interop.Pointer | interop.Reference<any>, val: number): number;

declare function xmlCopyCharMultiByte(out: string | interop.Pointer | interop.Reference<any>, val: number): number;

declare function xmlCopyDoc(doc: interop.Pointer | interop.Reference<_xmlDoc>, recursive: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlCopyDocElementContent(doc: interop.Pointer | interop.Reference<_xmlDoc>, content: interop.Pointer | interop.Reference<_xmlElementContent>): interop.Pointer | interop.Reference<_xmlElementContent>;

declare function xmlCopyDtd(dtd: interop.Pointer | interop.Reference<_xmlDtd>): interop.Pointer | interop.Reference<_xmlDtd>;

declare function xmlCopyElementContent(content: interop.Pointer | interop.Reference<_xmlElementContent>): interop.Pointer | interop.Reference<_xmlElementContent>;

declare function xmlCopyElementTable(table: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlCopyEntitiesTable(table: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlCopyEnumeration(cur: interop.Pointer | interop.Reference<_xmlEnumeration>): interop.Pointer | interop.Reference<_xmlEnumeration>;

declare function xmlCopyError(from: interop.Pointer | interop.Reference<_xmlError>, to: interop.Pointer | interop.Reference<_xmlError>): number;

declare function xmlCopyNamespace(cur: interop.Pointer | interop.Reference<_xmlNs>): interop.Pointer | interop.Reference<_xmlNs>;

declare function xmlCopyNamespaceList(cur: interop.Pointer | interop.Reference<_xmlNs>): interop.Pointer | interop.Reference<_xmlNs>;

declare function xmlCopyNode(node: interop.Pointer | interop.Reference<_xmlNode>, recursive: number): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlCopyNodeList(node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlCopyNotationTable(table: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlCopyProp(target: interop.Pointer | interop.Reference<_xmlNode>, cur: interop.Pointer | interop.Reference<_xmlAttr>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlCopyPropList(target: interop.Pointer | interop.Reference<_xmlNode>, cur: interop.Pointer | interop.Reference<_xmlAttr>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlCreateDocParserCtxt(cur: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function xmlCreateEntitiesTable(): interop.Pointer | interop.Reference<any>;

declare function xmlCreateEntityParserCtxt(URL: string | interop.Pointer | interop.Reference<any>, ID: string | interop.Pointer | interop.Reference<any>, base: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function xmlCreateEnumeration(name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEnumeration>;

declare function xmlCreateFileParserCtxt(filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function xmlCreateIOParserCtxt(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, user_data: interop.Pointer | interop.Reference<any>, ioread: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, ioclose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ioctx: interop.Pointer | interop.Reference<any>, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function xmlCreateIntSubset(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDtd>;

declare function xmlCreateMemoryParserCtxt(buffer: string | interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function xmlCreatePushParserCtxt(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, user_data: interop.Pointer | interop.Reference<any>, chunk: string | interop.Pointer | interop.Reference<any>, size: number, filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function xmlCreateURI(): interop.Pointer | interop.Reference<_xmlURI>;

declare function xmlCreateURLParserCtxt(filename: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function xmlCtxtGetLastError(ctx: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlError>;

declare function xmlCtxtReadDoc(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, cur: string | interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlCtxtReadFd(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, fd: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlCtxtReadFile(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, filename: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlCtxtReadIO(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, ioread: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, ioclose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ioctx: interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlCtxtReadMemory(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, buffer: string | interop.Pointer | interop.Reference<any>, size: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlCtxtReset(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlCtxtResetLastError(ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlCtxtResetPush(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, chunk: string | interop.Pointer | interop.Reference<any>, size: number, filename: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlCtxtUseOptions(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, options: number): number;

declare function xmlCurrentChar(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, len: interop.Pointer | interop.Reference<number>): number;

declare function xmlDOMWrapAdoptNode(ctxt: interop.Pointer | interop.Reference<_xmlDOMWrapCtxt>, sourceDoc: interop.Pointer | interop.Reference<_xmlDoc>, node: interop.Pointer | interop.Reference<_xmlNode>, destDoc: interop.Pointer | interop.Reference<_xmlDoc>, destParent: interop.Pointer | interop.Reference<_xmlNode>, options: number): number;

declare function xmlDOMWrapCloneNode(ctxt: interop.Pointer | interop.Reference<_xmlDOMWrapCtxt>, sourceDoc: interop.Pointer | interop.Reference<_xmlDoc>, node: interop.Pointer | interop.Reference<_xmlNode>, clonedNode: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNode>>, destDoc: interop.Pointer | interop.Reference<_xmlDoc>, destParent: interop.Pointer | interop.Reference<_xmlNode>, deep: number, options: number): number;

declare function xmlDOMWrapFreeCtxt(ctxt: interop.Pointer | interop.Reference<_xmlDOMWrapCtxt>): void;

declare function xmlDOMWrapNewCtxt(): interop.Pointer | interop.Reference<_xmlDOMWrapCtxt>;

declare function xmlDOMWrapReconcileNamespaces(ctxt: interop.Pointer | interop.Reference<_xmlDOMWrapCtxt>, elem: interop.Pointer | interop.Reference<_xmlNode>, options: number): number;

declare function xmlDOMWrapRemoveNode(ctxt: interop.Pointer | interop.Reference<_xmlDOMWrapCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, node: interop.Pointer | interop.Reference<_xmlNode>, options: number): number;

declare function xmlDebugCheckDocument(output: interop.Pointer | interop.Reference<FILE>, doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlDebugDumpAttr(output: interop.Pointer | interop.Reference<FILE>, attr: interop.Pointer | interop.Reference<_xmlAttr>, depth: number): void;

declare function xmlDebugDumpAttrList(output: interop.Pointer | interop.Reference<FILE>, attr: interop.Pointer | interop.Reference<_xmlAttr>, depth: number): void;

declare function xmlDebugDumpDTD(output: interop.Pointer | interop.Reference<FILE>, dtd: interop.Pointer | interop.Reference<_xmlDtd>): void;

declare function xmlDebugDumpDocument(output: interop.Pointer | interop.Reference<FILE>, doc: interop.Pointer | interop.Reference<_xmlDoc>): void;

declare function xmlDebugDumpDocumentHead(output: interop.Pointer | interop.Reference<FILE>, doc: interop.Pointer | interop.Reference<_xmlDoc>): void;

declare function xmlDebugDumpEntities(output: interop.Pointer | interop.Reference<FILE>, doc: interop.Pointer | interop.Reference<_xmlDoc>): void;

declare function xmlDebugDumpNode(output: interop.Pointer | interop.Reference<FILE>, node: interop.Pointer | interop.Reference<_xmlNode>, depth: number): void;

declare function xmlDebugDumpNodeList(output: interop.Pointer | interop.Reference<FILE>, node: interop.Pointer | interop.Reference<_xmlNode>, depth: number): void;

declare function xmlDebugDumpOneNode(output: interop.Pointer | interop.Reference<FILE>, node: interop.Pointer | interop.Reference<_xmlNode>, depth: number): void;

declare function xmlDebugDumpString(output: interop.Pointer | interop.Reference<FILE>, str: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlDecodeEntities(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, len: number, what: number, end: number, end2: number, end3: number): string;

declare function xmlDefaultSAXHandlerInit(): void;

declare function xmlDelEncodingAlias(alias: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlDeregisterNodeDefault(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>;

declare function xmlDetectCharEncoding(_in: string | interop.Pointer | interop.Reference<any>, len: number): xmlCharEncoding;

declare function xmlDictCleanup(): void;

declare function xmlDictCreate(): interop.Pointer | interop.Reference<any>;

declare function xmlDictCreateSub(sub: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlDictExists(dict: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function xmlDictFree(dict: interop.Pointer | interop.Reference<any>): void;

declare function xmlDictGetUsage(dict: interop.Pointer | interop.Reference<any>): number;

declare function xmlDictLookup(dict: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function xmlDictOwns(dict: interop.Pointer | interop.Reference<any>, str: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlDictQLookup(dict: interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlDictReference(dict: interop.Pointer | interop.Reference<any>): number;

declare function xmlDictSetLimit(dict: interop.Pointer | interop.Reference<any>, limit: number): number;

declare function xmlDictSize(dict: interop.Pointer | interop.Reference<any>): number;

declare function xmlDocCopyNode(node: interop.Pointer | interop.Reference<_xmlNode>, doc: interop.Pointer | interop.Reference<_xmlDoc>, recursive: number): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlDocCopyNodeList(doc: interop.Pointer | interop.Reference<_xmlDoc>, node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlDocDump(f: interop.Pointer | interop.Reference<FILE>, cur: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlDocDumpFormatMemory(cur: interop.Pointer | interop.Reference<_xmlDoc>, mem: interop.Pointer | interop.Reference<string>, size: interop.Pointer | interop.Reference<number>, format: number): void;

declare function xmlDocDumpFormatMemoryEnc(out_doc: interop.Pointer | interop.Reference<_xmlDoc>, doc_txt_ptr: interop.Pointer | interop.Reference<string>, doc_txt_len: interop.Pointer | interop.Reference<number>, txt_encoding: string | interop.Pointer | interop.Reference<any>, format: number): void;

declare function xmlDocDumpMemory(cur: interop.Pointer | interop.Reference<_xmlDoc>, mem: interop.Pointer | interop.Reference<string>, size: interop.Pointer | interop.Reference<number>): void;

declare function xmlDocDumpMemoryEnc(out_doc: interop.Pointer | interop.Reference<_xmlDoc>, doc_txt_ptr: interop.Pointer | interop.Reference<string>, doc_txt_len: interop.Pointer | interop.Reference<number>, txt_encoding: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlDocFormatDump(f: interop.Pointer | interop.Reference<FILE>, cur: interop.Pointer | interop.Reference<_xmlDoc>, format: number): number;

declare function xmlDocGetRootElement(doc: interop.Pointer | interop.Reference<_xmlDoc>): interop.Pointer | interop.Reference<_xmlNode>;

declare const enum xmlDocProperties {

	XML_DOC_WELLFORMED = 1,

	XML_DOC_NSVALID = 2,

	XML_DOC_OLD10 = 4,

	XML_DOC_DTDVALID = 8,

	XML_DOC_XINCLUDE = 16,

	XML_DOC_USERBUILT = 32,

	XML_DOC_INTERNAL = 64,

	XML_DOC_HTML = 128
}

declare function xmlDocSetRootElement(doc: interop.Pointer | interop.Reference<_xmlDoc>, root: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlDumpAttributeDecl(buf: interop.Pointer | interop.Reference<_xmlBuffer>, attr: interop.Pointer | interop.Reference<_xmlAttribute>): void;

declare function xmlDumpAttributeTable(buf: interop.Pointer | interop.Reference<_xmlBuffer>, table: interop.Pointer | interop.Reference<any>): void;

declare function xmlDumpElementDecl(buf: interop.Pointer | interop.Reference<_xmlBuffer>, elem: interop.Pointer | interop.Reference<_xmlElement>): void;

declare function xmlDumpElementTable(buf: interop.Pointer | interop.Reference<_xmlBuffer>, table: interop.Pointer | interop.Reference<any>): void;

declare function xmlDumpEntitiesTable(buf: interop.Pointer | interop.Reference<_xmlBuffer>, table: interop.Pointer | interop.Reference<any>): void;

declare function xmlDumpEntityDecl(buf: interop.Pointer | interop.Reference<_xmlBuffer>, ent: interop.Pointer | interop.Reference<_xmlEntity>): void;

declare function xmlDumpNotationDecl(buf: interop.Pointer | interop.Reference<_xmlBuffer>, nota: interop.Pointer | interop.Reference<_xmlNotation>): void;

declare function xmlDumpNotationTable(buf: interop.Pointer | interop.Reference<_xmlBuffer>, table: interop.Pointer | interop.Reference<any>): void;

declare function xmlElemDump(f: interop.Pointer | interop.Reference<FILE>, doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlNode>): void;

declare const enum xmlElementContentOccur {

	XML_ELEMENT_CONTENT_ONCE = 1,

	XML_ELEMENT_CONTENT_OPT = 2,

	XML_ELEMENT_CONTENT_MULT = 3,

	XML_ELEMENT_CONTENT_PLUS = 4
}

declare const enum xmlElementContentType {

	XML_ELEMENT_CONTENT_PCDATA = 1,

	XML_ELEMENT_CONTENT_ELEMENT = 2,

	XML_ELEMENT_CONTENT_SEQ = 3,

	XML_ELEMENT_CONTENT_OR = 4
}

declare const enum xmlElementType {

	XML_ELEMENT_NODE = 1,

	XML_ATTRIBUTE_NODE = 2,

	XML_TEXT_NODE = 3,

	XML_CDATA_SECTION_NODE = 4,

	XML_ENTITY_REF_NODE = 5,

	XML_ENTITY_NODE = 6,

	XML_PI_NODE = 7,

	XML_COMMENT_NODE = 8,

	XML_DOCUMENT_NODE = 9,

	XML_DOCUMENT_TYPE_NODE = 10,

	XML_DOCUMENT_FRAG_NODE = 11,

	XML_NOTATION_NODE = 12,

	XML_HTML_DOCUMENT_NODE = 13,

	XML_DTD_NODE = 14,

	XML_ELEMENT_DECL = 15,

	XML_ATTRIBUTE_DECL = 16,

	XML_ENTITY_DECL = 17,

	XML_NAMESPACE_DECL = 18,

	XML_XINCLUDE_START = 19,

	XML_XINCLUDE_END = 20,

	XML_DOCB_DOCUMENT_NODE = 21
}

declare const enum xmlElementTypeVal {

	XML_ELEMENT_TYPE_UNDEFINED = 0,

	XML_ELEMENT_TYPE_EMPTY = 1,

	XML_ELEMENT_TYPE_ANY = 2,

	XML_ELEMENT_TYPE_MIXED = 3,

	XML_ELEMENT_TYPE_ELEMENT = 4
}

declare function xmlEncodeEntities(doc: interop.Pointer | interop.Reference<_xmlDoc>, input: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlEncodeEntitiesReentrant(doc: interop.Pointer | interop.Reference<_xmlDoc>, input: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlEncodeSpecialChars(doc: interop.Pointer | interop.Reference<_xmlDoc>, input: string | interop.Pointer | interop.Reference<any>): string;

declare const enum xmlEntityType {

	XML_INTERNAL_GENERAL_ENTITY = 1,

	XML_EXTERNAL_GENERAL_PARSED_ENTITY = 2,

	XML_EXTERNAL_GENERAL_UNPARSED_ENTITY = 3,

	XML_INTERNAL_PARAMETER_ENTITY = 4,

	XML_EXTERNAL_PARAMETER_ENTITY = 5,

	XML_INTERNAL_PREDEFINED_ENTITY = 6
}

declare const enum xmlErrorDomain {

	XML_FROM_NONE = 0,

	XML_FROM_PARSER = 1,

	XML_FROM_TREE = 2,

	XML_FROM_NAMESPACE = 3,

	XML_FROM_DTD = 4,

	XML_FROM_HTML = 5,

	XML_FROM_MEMORY = 6,

	XML_FROM_OUTPUT = 7,

	XML_FROM_IO = 8,

	XML_FROM_FTP = 9,

	XML_FROM_HTTP = 10,

	XML_FROM_XINCLUDE = 11,

	XML_FROM_XPATH = 12,

	XML_FROM_XPOINTER = 13,

	XML_FROM_REGEXP = 14,

	XML_FROM_DATATYPE = 15,

	XML_FROM_SCHEMASP = 16,

	XML_FROM_SCHEMASV = 17,

	XML_FROM_RELAXNGP = 18,

	XML_FROM_RELAXNGV = 19,

	XML_FROM_CATALOG = 20,

	XML_FROM_C14N = 21,

	XML_FROM_XSLT = 22,

	XML_FROM_VALID = 23,

	XML_FROM_CHECK = 24,

	XML_FROM_WRITER = 25,

	XML_FROM_MODULE = 26,

	XML_FROM_I18N = 27,

	XML_FROM_SCHEMATRONV = 28,

	XML_FROM_BUFFER = 29,

	XML_FROM_URI = 30
}

declare const enum xmlErrorLevel {

	XML_ERR_NONE = 0,

	XML_ERR_WARNING = 1,

	XML_ERR_ERROR = 2,

	XML_ERR_FATAL = 3
}

declare function xmlExpCtxtNbCons(ctxt: interop.Pointer | interop.Reference<any>): number;

declare function xmlExpCtxtNbNodes(ctxt: interop.Pointer | interop.Reference<any>): number;

declare function xmlExpDump(buf: interop.Pointer | interop.Reference<_xmlBuffer>, expr: interop.Pointer | interop.Reference<any>): void;

declare function xmlExpExpDerive(ctxt: interop.Pointer | interop.Reference<any>, expr: interop.Pointer | interop.Reference<any>, sub: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlExpFree(ctxt: interop.Pointer | interop.Reference<any>, expr: interop.Pointer | interop.Reference<any>): void;

declare function xmlExpFreeCtxt(ctxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlExpGetLanguage(ctxt: interop.Pointer | interop.Reference<any>, expr: interop.Pointer | interop.Reference<any>, langList: interop.Pointer | interop.Reference<string>, len: number): number;

declare function xmlExpGetStart(ctxt: interop.Pointer | interop.Reference<any>, expr: interop.Pointer | interop.Reference<any>, tokList: interop.Pointer | interop.Reference<string>, len: number): number;

declare function xmlExpIsNillable(expr: interop.Pointer | interop.Reference<any>): number;

declare function xmlExpMaxToken(expr: interop.Pointer | interop.Reference<any>): number;

declare function xmlExpNewAtom(ctxt: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, len: number): interop.Pointer | interop.Reference<any>;

declare function xmlExpNewCtxt(maxNodes: number, dict: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlExpNewOr(ctxt: interop.Pointer | interop.Reference<any>, left: interop.Pointer | interop.Reference<any>, right: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlExpNewRange(ctxt: interop.Pointer | interop.Reference<any>, subset: interop.Pointer | interop.Reference<any>, min: number, max: number): interop.Pointer | interop.Reference<any>;

declare function xmlExpNewSeq(ctxt: interop.Pointer | interop.Reference<any>, left: interop.Pointer | interop.Reference<any>, right: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare const enum xmlExpNodeType {

	XML_EXP_EMPTY = 0,

	XML_EXP_FORBID = 1,

	XML_EXP_ATOM = 2,

	XML_EXP_SEQ = 3,

	XML_EXP_OR = 4,

	XML_EXP_COUNT = 5
}

declare function xmlExpParse(ctxt: interop.Pointer | interop.Reference<any>, expr: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlExpRef(expr: interop.Pointer | interop.Reference<any>): void;

declare function xmlExpStringDerive(ctxt: interop.Pointer | interop.Reference<any>, expr: interop.Pointer | interop.Reference<any>, str: string | interop.Pointer | interop.Reference<any>, len: number): interop.Pointer | interop.Reference<any>;

declare function xmlExpSubsume(ctxt: interop.Pointer | interop.Reference<any>, expr: interop.Pointer | interop.Reference<any>, sub: interop.Pointer | interop.Reference<any>): number;

declare const enum xmlFeature {

	XML_WITH_THREAD = 1,

	XML_WITH_TREE = 2,

	XML_WITH_OUTPUT = 3,

	XML_WITH_PUSH = 4,

	XML_WITH_READER = 5,

	XML_WITH_PATTERN = 6,

	XML_WITH_WRITER = 7,

	XML_WITH_SAX1 = 8,

	XML_WITH_FTP = 9,

	XML_WITH_HTTP = 10,

	XML_WITH_VALID = 11,

	XML_WITH_HTML = 12,

	XML_WITH_LEGACY = 13,

	XML_WITH_C14N = 14,

	XML_WITH_CATALOG = 15,

	XML_WITH_XPATH = 16,

	XML_WITH_XPTR = 17,

	XML_WITH_XINCLUDE = 18,

	XML_WITH_ICONV = 19,

	XML_WITH_ISO8859X = 20,

	XML_WITH_UNICODE = 21,

	XML_WITH_REGEXP = 22,

	XML_WITH_AUTOMATA = 23,

	XML_WITH_EXPR = 24,

	XML_WITH_SCHEMAS = 25,

	XML_WITH_SCHEMATRON = 26,

	XML_WITH_MODULES = 27,

	XML_WITH_DEBUG = 28,

	XML_WITH_DEBUG_MEM = 29,

	XML_WITH_DEBUG_RUN = 30,

	XML_WITH_ZLIB = 31,

	XML_WITH_ICU = 32,

	XML_WITH_LZMA = 33,

	XML_WITH_NONE = 99999
}

declare function xmlFileClose(context: interop.Pointer | interop.Reference<any>): number;

declare function xmlFileMatch(filename: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlFileOpen(filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlFileRead(context: interop.Pointer | interop.Reference<any>, buffer: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlFindCharEncodingHandler(name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlCharEncodingHandler>;

declare function xmlFirstElementChild(parent: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare var xmlFree: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;

declare function xmlFreeAttributeTable(table: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeAutomata(am: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeCatalog(catal: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeDoc(cur: interop.Pointer | interop.Reference<_xmlDoc>): void;

declare function xmlFreeDocElementContent(doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlElementContent>): void;

declare function xmlFreeDtd(cur: interop.Pointer | interop.Reference<_xmlDtd>): void;

declare function xmlFreeElementContent(cur: interop.Pointer | interop.Reference<_xmlElementContent>): void;

declare function xmlFreeElementTable(table: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeEntitiesTable(table: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeEnumeration(cur: interop.Pointer | interop.Reference<_xmlEnumeration>): void;

declare function xmlFreeIDTable(table: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeInputStream(input: interop.Pointer | interop.Reference<_xmlParserInput>): void;

declare function xmlFreeMutex(tok: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeNode(cur: interop.Pointer | interop.Reference<_xmlNode>): void;

declare function xmlFreeNodeList(cur: interop.Pointer | interop.Reference<_xmlNode>): void;

declare function xmlFreeNotationTable(table: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeNs(cur: interop.Pointer | interop.Reference<_xmlNs>): void;

declare function xmlFreeNsList(cur: interop.Pointer | interop.Reference<_xmlNs>): void;

declare function xmlFreeParserCtxt(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlFreeParserInputBuffer(_in: interop.Pointer | interop.Reference<_xmlParserInputBuffer>): void;

declare function xmlFreePattern(comp: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreePatternList(comp: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeProp(cur: interop.Pointer | interop.Reference<_xmlAttr>): void;

declare function xmlFreePropList(cur: interop.Pointer | interop.Reference<_xmlAttr>): void;

declare function xmlFreeRMutex(tok: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeRefTable(table: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeStreamCtxt(stream: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeTextReader(reader: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeTextWriter(writer: interop.Pointer | interop.Reference<any>): void;

declare function xmlFreeURI(uri: interop.Pointer | interop.Reference<_xmlURI>): void;

declare function xmlFreeValidCtxt(p1: interop.Pointer | interop.Reference<_xmlValidCtxt>): void;

declare function xmlGcMemGet(freeFunc: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>>, mallocFunc: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>>, mallocAtomicFunc: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>>, reallocFunc: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>>, strdupFunc: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: string) => string>>): number;

declare function xmlGcMemSetup(freeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, mallocFunc: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>, mallocAtomicFunc: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>, reallocFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>, strdupFunc: interop.FunctionReference<(p1: string) => string>): number;

declare function xmlGetBufferAllocationScheme(): xmlBufferAllocationScheme;

declare function xmlGetCharEncodingHandler(enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlCharEncodingHandler>;

declare function xmlGetCharEncodingName(enc: xmlCharEncoding): string;

declare function xmlGetCompressMode(): number;

declare function xmlGetDocCompressMode(doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlGetDocEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function xmlGetDtdAttrDesc(dtd: interop.Pointer | interop.Reference<_xmlDtd>, elem: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttribute>;

declare function xmlGetDtdElementDesc(dtd: interop.Pointer | interop.Reference<_xmlDtd>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlElement>;

declare function xmlGetDtdEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function xmlGetDtdNotationDesc(dtd: interop.Pointer | interop.Reference<_xmlDtd>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNotation>;

declare function xmlGetDtdQAttrDesc(dtd: interop.Pointer | interop.Reference<_xmlDtd>, elem: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttribute>;

declare function xmlGetDtdQElementDesc(dtd: interop.Pointer | interop.Reference<_xmlDtd>, name: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlElement>;

declare function xmlGetEncodingAlias(alias: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlGetExternalEntityLoader(): interop.FunctionReference<(p1: string, p2: string, p3: interop.Pointer | interop.Reference<_xmlParserCtxt>) => interop.Pointer | interop.Reference<_xmlParserInput>>;

declare function xmlGetFeature(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, name: string | interop.Pointer | interop.Reference<any>, result: interop.Pointer | interop.Reference<any>): number;

declare function xmlGetFeaturesList(len: interop.Pointer | interop.Reference<number>, result: interop.Pointer | interop.Reference<string>): number;

declare function xmlGetGlobalState(): interop.Pointer | interop.Reference<_xmlGlobalState>;

declare function xmlGetID(doc: interop.Pointer | interop.Reference<_xmlDoc>, ID: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlGetIntSubset(doc: interop.Pointer | interop.Reference<_xmlDoc>): interop.Pointer | interop.Reference<_xmlDtd>;

declare function xmlGetLastChild(parent: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlGetLastError(): interop.Pointer | interop.Reference<_xmlError>;

declare function xmlGetLineNo(node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlGetNoNsProp(node: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlGetNodePath(node: interop.Pointer | interop.Reference<_xmlNode>): string;

declare function xmlGetNsList(doc: interop.Pointer | interop.Reference<_xmlDoc>, node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNs>>;

declare function xmlGetNsProp(node: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>, nameSpace: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlGetParameterEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function xmlGetPredefinedEntity(name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function xmlGetProp(node: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlGetRefs(doc: interop.Pointer | interop.Reference<_xmlDoc>, ID: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlGetThreadId(): number;

declare function xmlGetUTF8Char(utf: string | interop.Pointer | interop.Reference<any>, len: interop.Pointer | interop.Reference<number>): number;

declare function xmlHandleEntity(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, entity: interop.Pointer | interop.Reference<_xmlEntity>): void;

declare function xmlHasFeature(feature: xmlFeature): number;

declare function xmlHasNsProp(node: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>, nameSpace: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlHasProp(node: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlHashAddEntry(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, userdata: interop.Pointer | interop.Reference<any>): number;

declare function xmlHashAddEntry2(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, userdata: interop.Pointer | interop.Reference<any>): number;

declare function xmlHashAddEntry3(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, name3: string | interop.Pointer | interop.Reference<any>, userdata: interop.Pointer | interop.Reference<any>): number;

declare function xmlHashCopy(table: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function xmlHashCreate(size: number): interop.Pointer | interop.Reference<any>;

declare function xmlHashCreateDict(size: number, dict: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlHashFree(table: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): void;

declare function xmlHashLookup(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlHashLookup2(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlHashLookup3(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, name3: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlHashQLookup(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlHashQLookup2(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, prefix2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlHashQLookup3(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, prefix2: string | interop.Pointer | interop.Reference<any>, name3: string | interop.Pointer | interop.Reference<any>, prefix3: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlHashRemoveEntry(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): number;

declare function xmlHashRemoveEntry2(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): number;

declare function xmlHashRemoveEntry3(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, name3: string | interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): number;

declare function xmlHashScan(table: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: string) => void>, data: interop.Pointer | interop.Reference<any>): void;

declare function xmlHashScan3(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, name3: string | interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: string) => void>, data: interop.Pointer | interop.Reference<any>): void;

declare function xmlHashScanFull(table: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: string, p4: string, p5: string) => void>, data: interop.Pointer | interop.Reference<any>): void;

declare function xmlHashScanFull3(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, name3: string | interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: string, p4: string, p5: string) => void>, data: interop.Pointer | interop.Reference<any>): void;

declare function xmlHashSize(table: interop.Pointer | interop.Reference<any>): number;

declare function xmlHashUpdateEntry(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, userdata: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): number;

declare function xmlHashUpdateEntry2(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, userdata: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): number;

declare function xmlHashUpdateEntry3(table: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, name2: string | interop.Pointer | interop.Reference<any>, name3: string | interop.Pointer | interop.Reference<any>, userdata: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): number;

declare function xmlIOFTPClose(context: interop.Pointer | interop.Reference<any>): number;

declare function xmlIOFTPMatch(filename: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlIOFTPOpen(filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlIOFTPRead(context: interop.Pointer | interop.Reference<any>, buffer: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlIOHTTPClose(context: interop.Pointer | interop.Reference<any>): number;

declare function xmlIOHTTPMatch(filename: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlIOHTTPOpen(filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlIOHTTPOpenW(post_uri: string | interop.Pointer | interop.Reference<any>, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlIOHTTPRead(context: interop.Pointer | interop.Reference<any>, buffer: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlIOParseDTD(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, input: interop.Pointer | interop.Reference<_xmlParserInputBuffer>, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlDtd>;

declare function xmlInitCharEncodingHandlers(): void;

declare function xmlInitGlobals(): void;

declare function xmlInitMemory(): number;

declare function xmlInitNodeInfoSeq(seq: interop.Pointer | interop.Reference<_xmlParserNodeInfoSeq>): void;

declare function xmlInitParser(): void;

declare function xmlInitParserCtxt(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function xmlInitThreads(): void;

declare function xmlInitializeCatalog(): void;

declare function xmlInitializeDict(): number;

declare function xmlInitializeGlobalState(gs: interop.Pointer | interop.Reference<_xmlGlobalState>): void;

declare function xmlInitializePredefinedEntities(): void;

declare function xmlIsBaseChar(ch: number): number;

declare var xmlIsBaseCharGroup: _xmlChRangeGroup;

declare function xmlIsBlank(ch: number): number;

declare function xmlIsBlankNode(node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlIsChar(ch: number): number;

declare var xmlIsCharGroup: _xmlChRangeGroup;

declare function xmlIsCombining(ch: number): number;

declare var xmlIsCombiningGroup: _xmlChRangeGroup;

declare function xmlIsDigit(ch: number): number;

declare var xmlIsDigitGroup: _xmlChRangeGroup;

declare function xmlIsExtender(ch: number): number;

declare var xmlIsExtenderGroup: _xmlChRangeGroup;

declare function xmlIsID(doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>, attr: interop.Pointer | interop.Reference<_xmlAttr>): number;

declare function xmlIsIdeographic(ch: number): number;

declare var xmlIsIdeographicGroup: _xmlChRangeGroup;

declare function xmlIsLetter(c: number): number;

declare function xmlIsMainThread(): number;

declare function xmlIsMixedElement(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlIsPubidChar(ch: number): number;

declare var xmlIsPubidChar_tab: interop.Reference<number>;

declare function xmlIsRef(doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>, attr: interop.Pointer | interop.Reference<_xmlAttr>): number;

declare function xmlIsXHTML(systemID: string | interop.Pointer | interop.Reference<any>, publicID: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlKeepBlanksDefault(val: number): number;

declare function xmlLastElementChild(parent: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlLineNumbersDefault(val: number): number;

declare function xmlLinkGetData(lk: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlListAppend(l: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlListClear(l: interop.Pointer | interop.Reference<any>): void;

declare function xmlListCopy(cur: interop.Pointer | interop.Reference<any>, old: interop.Pointer | interop.Reference<any>): number;

declare function xmlListCreate(deallocator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, compare: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): interop.Pointer | interop.Reference<any>;

declare function xmlListDelete(l: interop.Pointer | interop.Reference<any>): void;

declare function xmlListDup(old: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlListEmpty(l: interop.Pointer | interop.Reference<any>): number;

declare function xmlListEnd(l: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlListFront(l: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlListInsert(l: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlListMerge(l1: interop.Pointer | interop.Reference<any>, l2: interop.Pointer | interop.Reference<any>): void;

declare function xmlListPopBack(l: interop.Pointer | interop.Reference<any>): void;

declare function xmlListPopFront(l: interop.Pointer | interop.Reference<any>): void;

declare function xmlListPushBack(l: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlListPushFront(l: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlListRemoveAll(l: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlListRemoveFirst(l: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlListRemoveLast(l: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlListReverse(l: interop.Pointer | interop.Reference<any>): void;

declare function xmlListReverseSearch(l: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlListReverseWalk(l: interop.Pointer | interop.Reference<any>, walker: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>, user: interop.Pointer | interop.Reference<any>): void;

declare function xmlListSearch(l: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlListSize(l: interop.Pointer | interop.Reference<any>): number;

declare function xmlListSort(l: interop.Pointer | interop.Reference<any>): void;

declare function xmlListWalk(l: interop.Pointer | interop.Reference<any>, walker: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>, user: interop.Pointer | interop.Reference<any>): void;

declare function xmlLoadACatalog(filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlLoadCatalog(filename: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlLoadCatalogs(paths: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlLoadExternalEntity(URL: string | interop.Pointer | interop.Reference<any>, ID: string | interop.Pointer | interop.Reference<any>, ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function xmlLoadSGMLSuperCatalog(filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlLockLibrary(): void;

declare function xmlLsCountNode(node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlLsOneNode(output: interop.Pointer | interop.Reference<FILE>, node: interop.Pointer | interop.Reference<_xmlNode>): void;

declare var xmlMalloc: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>;

declare var xmlMallocAtomic: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>;

declare function xmlMallocAtomicLoc(size: number, file: string | interop.Pointer | interop.Reference<any>, line: number): interop.Pointer | interop.Reference<any>;

declare function xmlMallocLoc(size: number, file: string | interop.Pointer | interop.Reference<any>, line: number): interop.Pointer | interop.Reference<any>;

declare function xmlMemBlocks(): number;

declare function xmlMemDisplay(fp: interop.Pointer | interop.Reference<FILE>): void;

declare function xmlMemDisplayLast(fp: interop.Pointer | interop.Reference<FILE>, nbBytes: number): void;

declare function xmlMemFree(ptr: interop.Pointer | interop.Reference<any>): void;

declare function xmlMemGet(freeFunc: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>>, mallocFunc: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>>, reallocFunc: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>>, strdupFunc: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: string) => string>>): number;

declare function xmlMemMalloc(size: number): interop.Pointer | interop.Reference<any>;

declare function xmlMemRealloc(ptr: interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<any>;

declare function xmlMemSetup(freeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, mallocFunc: interop.FunctionReference<(p1: number) => interop.Pointer | interop.Reference<any>>, reallocFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>, strdupFunc: interop.FunctionReference<(p1: string) => string>): number;

declare function xmlMemShow(fp: interop.Pointer | interop.Reference<FILE>, nr: number): void;

declare var xmlMemStrdup: interop.FunctionReference<(p1: string) => string>;

declare function xmlMemStrdupLoc(str: string | interop.Pointer | interop.Reference<any>, file: string | interop.Pointer | interop.Reference<any>, line: number): string;

declare function xmlMemUsed(): number;

declare function xmlMemoryDump(): void;

declare function xmlMemoryStrdup(str: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlModuleClose(module: interop.Pointer | interop.Reference<any>): number;

declare function xmlModuleFree(module: interop.Pointer | interop.Reference<any>): number;

declare function xmlModuleOpen(filename: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare const enum xmlModuleOption {

	XML_MODULE_LAZY = 1,

	XML_MODULE_LOCAL = 2
}

declare function xmlModuleSymbol(module: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, result: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function xmlMutexLock(tok: interop.Pointer | interop.Reference<any>): void;

declare function xmlMutexUnlock(tok: interop.Pointer | interop.Reference<any>): void;

declare function xmlNamespaceParseNCName(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlNamespaceParseNSDef(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlNamespaceParseQName(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, prefix: interop.Pointer | interop.Reference<string>): string;

declare function xmlNanoFTPCheckResponse(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPCleanup(): void;

declare function xmlNanoFTPClose(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPCloseConnection(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPConnect(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPConnectTo(server: string | interop.Pointer | interop.Reference<any>, port: number): interop.Pointer | interop.Reference<any>;

declare function xmlNanoFTPCwd(ctx: interop.Pointer | interop.Reference<any>, directory: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPDele(ctx: interop.Pointer | interop.Reference<any>, file: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPFreeCtxt(ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlNanoFTPGet(ctx: interop.Pointer | interop.Reference<any>, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => void>, userData: interop.Pointer | interop.Reference<any>, filename: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPGetConnection(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPGetResponse(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPGetSocket(ctx: interop.Pointer | interop.Reference<any>, filename: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPInit(): void;

declare function xmlNanoFTPList(ctx: interop.Pointer | interop.Reference<any>, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string, p4: string, p5: string, p6: number, p7: number, p8: number, p9: string, p10: number, p11: number, p12: number) => void>, userData: interop.Pointer | interop.Reference<any>, filename: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPNewCtxt(URL: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlNanoFTPOpen(URL: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlNanoFTPProxy(host: string | interop.Pointer | interop.Reference<any>, port: number, user: string | interop.Pointer | interop.Reference<any>, passwd: string | interop.Pointer | interop.Reference<any>, type: number): void;

declare function xmlNanoFTPQuit(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoFTPRead(ctx: interop.Pointer | interop.Reference<any>, dest: interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlNanoFTPScanProxy(URL: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlNanoFTPUpdateURL(ctx: interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoHTTPAuthHeader(ctx: interop.Pointer | interop.Reference<any>): string;

declare function xmlNanoHTTPCleanup(): void;

declare function xmlNanoHTTPClose(ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlNanoHTTPContentLength(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoHTTPEncoding(ctx: interop.Pointer | interop.Reference<any>): string;

declare function xmlNanoHTTPFetch(URL: string | interop.Pointer | interop.Reference<any>, filename: string | interop.Pointer | interop.Reference<any>, contentType: interop.Pointer | interop.Reference<string>): number;

declare function xmlNanoHTTPInit(): void;

declare function xmlNanoHTTPMethod(URL: string | interop.Pointer | interop.Reference<any>, method: string | interop.Pointer | interop.Reference<any>, input: string | interop.Pointer | interop.Reference<any>, contentType: interop.Pointer | interop.Reference<string>, headers: string | interop.Pointer | interop.Reference<any>, ilen: number): interop.Pointer | interop.Reference<any>;

declare function xmlNanoHTTPMethodRedir(URL: string | interop.Pointer | interop.Reference<any>, method: string | interop.Pointer | interop.Reference<any>, input: string | interop.Pointer | interop.Reference<any>, contentType: interop.Pointer | interop.Reference<string>, redir: interop.Pointer | interop.Reference<string>, headers: string | interop.Pointer | interop.Reference<any>, ilen: number): interop.Pointer | interop.Reference<any>;

declare function xmlNanoHTTPMimeType(ctx: interop.Pointer | interop.Reference<any>): string;

declare function xmlNanoHTTPOpen(URL: string | interop.Pointer | interop.Reference<any>, contentType: interop.Pointer | interop.Reference<string>): interop.Pointer | interop.Reference<any>;

declare function xmlNanoHTTPOpenRedir(URL: string | interop.Pointer | interop.Reference<any>, contentType: interop.Pointer | interop.Reference<string>, redir: interop.Pointer | interop.Reference<string>): interop.Pointer | interop.Reference<any>;

declare function xmlNanoHTTPRead(ctx: interop.Pointer | interop.Reference<any>, dest: interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlNanoHTTPRedir(ctx: interop.Pointer | interop.Reference<any>): string;

declare function xmlNanoHTTPReturnCode(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoHTTPSave(ctxt: interop.Pointer | interop.Reference<any>, filename: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlNanoHTTPScanProxy(URL: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlNewAutomata(): interop.Pointer | interop.Reference<any>;

declare function xmlNewCDataBlock(doc: interop.Pointer | interop.Reference<_xmlDoc>, content: string | interop.Pointer | interop.Reference<any>, len: number): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewCatalog(sgml: number): interop.Pointer | interop.Reference<any>;

declare function xmlNewCharEncodingHandler(name: string | interop.Pointer | interop.Reference<any>, input: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<number>, p3: string, p4: interop.Pointer | interop.Reference<number>) => number>, output: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<number>, p3: string, p4: interop.Pointer | interop.Reference<number>) => number>): interop.Pointer | interop.Reference<_xmlCharEncodingHandler>;

declare function xmlNewCharRef(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewChild(parent: interop.Pointer | interop.Reference<_xmlNode>, ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewComment(content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewDoc(version: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlNewDocComment(doc: interop.Pointer | interop.Reference<_xmlDoc>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewDocElementContent(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>, type: xmlElementContentType): interop.Pointer | interop.Reference<_xmlElementContent>;

declare function xmlNewDocFragment(doc: interop.Pointer | interop.Reference<_xmlDoc>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewDocNode(doc: interop.Pointer | interop.Reference<_xmlDoc>, ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewDocNodeEatName(doc: interop.Pointer | interop.Reference<_xmlDoc>, ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewDocPI(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewDocProp(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlNewDocRawNode(doc: interop.Pointer | interop.Reference<_xmlDoc>, ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewDocText(doc: interop.Pointer | interop.Reference<_xmlDoc>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewDocTextLen(doc: interop.Pointer | interop.Reference<_xmlDoc>, content: string | interop.Pointer | interop.Reference<any>, len: number): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewDtd(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDtd>;

declare function xmlNewElementContent(name: string | interop.Pointer | interop.Reference<any>, type: xmlElementContentType): interop.Pointer | interop.Reference<_xmlElementContent>;

declare function xmlNewEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>, type: number, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function xmlNewEntityInputStream(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, entity: interop.Pointer | interop.Reference<_xmlEntity>): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function xmlNewGlobalNs(doc: interop.Pointer | interop.Reference<_xmlDoc>, href: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNs>;

declare function xmlNewIOInputStream(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, input: interop.Pointer | interop.Reference<_xmlParserInputBuffer>, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function xmlNewInputFromFile(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function xmlNewInputStream(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function xmlNewMutex(): interop.Pointer | interop.Reference<any>;

declare function xmlNewNode(ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewNodeEatName(ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewNs(node: interop.Pointer | interop.Reference<_xmlNode>, href: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNs>;

declare function xmlNewNsProp(node: interop.Pointer | interop.Reference<_xmlNode>, ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlNewNsPropEatName(node: interop.Pointer | interop.Reference<_xmlNode>, ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlNewPI(name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewParserCtxt(): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare function xmlNewProp(node: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlNewRMutex(): interop.Pointer | interop.Reference<any>;

declare function xmlNewReference(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewStringInputStream(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, buffer: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function xmlNewText(content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewTextChild(parent: interop.Pointer | interop.Reference<_xmlNode>, ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewTextLen(content: string | interop.Pointer | interop.Reference<any>, len: number): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNewTextReader(input: interop.Pointer | interop.Reference<_xmlParserInputBuffer>, URI: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextReaderFilename(URI: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriter(out: interop.Pointer | interop.Reference<_xmlOutputBuffer>): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriterDoc(doc: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlDoc>>, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriterFilename(uri: string | interop.Pointer | interop.Reference<any>, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriterMemory(buf: interop.Pointer | interop.Reference<_xmlBuffer>, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriterPushParser(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriterTree(doc: interop.Pointer | interop.Reference<_xmlDoc>, node: interop.Pointer | interop.Reference<_xmlNode>, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlNewValidCtxt(): interop.Pointer | interop.Reference<_xmlValidCtxt>;

declare function xmlNextChar(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlNextElementSibling(node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlNoNetExternalEntityLoader(URL: string | interop.Pointer | interop.Reference<any>, ID: string | interop.Pointer | interop.Reference<any>, ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function xmlNodeAddContent(cur: interop.Pointer | interop.Reference<_xmlNode>, content: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlNodeAddContentLen(cur: interop.Pointer | interop.Reference<_xmlNode>, content: string | interop.Pointer | interop.Reference<any>, len: number): void;

declare function xmlNodeBufGetContent(buffer: interop.Pointer | interop.Reference<_xmlBuffer>, cur: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlNodeDump(buf: interop.Pointer | interop.Reference<_xmlBuffer>, doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlNode>, level: number, format: number): number;

declare function xmlNodeDumpOutput(buf: interop.Pointer | interop.Reference<_xmlOutputBuffer>, doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlNode>, level: number, format: number, encoding: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlNodeGetBase(doc: interop.Pointer | interop.Reference<_xmlDoc>, cur: interop.Pointer | interop.Reference<_xmlNode>): string;

declare function xmlNodeGetContent(cur: interop.Pointer | interop.Reference<_xmlNode>): string;

declare function xmlNodeGetLang(cur: interop.Pointer | interop.Reference<_xmlNode>): string;

declare function xmlNodeGetSpacePreserve(cur: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlNodeIsText(node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlNodeListGetRawString(doc: interop.Pointer | interop.Reference<_xmlDoc>, list: interop.Pointer | interop.Reference<_xmlNode>, inLine: number): string;

declare function xmlNodeListGetString(doc: interop.Pointer | interop.Reference<_xmlDoc>, list: interop.Pointer | interop.Reference<_xmlNode>, inLine: number): string;

declare function xmlNodeSetBase(cur: interop.Pointer | interop.Reference<_xmlNode>, uri: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlNodeSetContent(cur: interop.Pointer | interop.Reference<_xmlNode>, content: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlNodeSetContentLen(cur: interop.Pointer | interop.Reference<_xmlNode>, content: string | interop.Pointer | interop.Reference<any>, len: number): void;

declare function xmlNodeSetLang(cur: interop.Pointer | interop.Reference<_xmlNode>, lang: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlNodeSetName(cur: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlNodeSetSpacePreserve(cur: interop.Pointer | interop.Reference<_xmlNode>, val: number): void;

declare function xmlNormalizeURIPath(path: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlNormalizeWindowsPath(path: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlOutputBufferClose(out: interop.Pointer | interop.Reference<_xmlOutputBuffer>): number;

declare function xmlOutputBufferCreateBuffer(buffer: interop.Pointer | interop.Reference<_xmlBuffer>, encoder: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>): interop.Pointer | interop.Reference<_xmlOutputBuffer>;

declare function xmlOutputBufferCreateFd(fd: number, encoder: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>): interop.Pointer | interop.Reference<_xmlOutputBuffer>;

declare function xmlOutputBufferCreateFile(file: interop.Pointer | interop.Reference<FILE>, encoder: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>): interop.Pointer | interop.Reference<_xmlOutputBuffer>;

declare function xmlOutputBufferCreateFilename(URI: string | interop.Pointer | interop.Reference<any>, encoder: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, compression: number): interop.Pointer | interop.Reference<_xmlOutputBuffer>;

declare function xmlOutputBufferCreateFilenameDefault(func: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, p3: number) => interop.Pointer | interop.Reference<_xmlOutputBuffer>>): interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, p3: number) => interop.Pointer | interop.Reference<_xmlOutputBuffer>>;

declare function xmlOutputBufferCreateIO(iowrite: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, ioclose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ioctx: interop.Pointer | interop.Reference<any>, encoder: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>): interop.Pointer | interop.Reference<_xmlOutputBuffer>;

declare function xmlOutputBufferFlush(out: interop.Pointer | interop.Reference<_xmlOutputBuffer>): number;

declare function xmlOutputBufferGetContent(out: interop.Pointer | interop.Reference<_xmlOutputBuffer>): string;

declare function xmlOutputBufferGetSize(out: interop.Pointer | interop.Reference<_xmlOutputBuffer>): number;

declare function xmlOutputBufferWrite(out: interop.Pointer | interop.Reference<_xmlOutputBuffer>, len: number, buf: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlOutputBufferWriteEscape(out: interop.Pointer | interop.Reference<_xmlOutputBuffer>, str: string | interop.Pointer | interop.Reference<any>, escaping: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<number>, p3: string, p4: interop.Pointer | interop.Reference<number>) => number>): number;

declare function xmlOutputBufferWriteString(out: interop.Pointer | interop.Reference<_xmlOutputBuffer>, str: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlParseAttValue(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseAttribute(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, value: interop.Pointer | interop.Reference<string>): string;

declare function xmlParseAttributeListDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseAttributeType(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, tree: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlEnumeration>>): number;

declare function xmlParseBalancedChunkMemory(doc: interop.Pointer | interop.Reference<_xmlDoc>, sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, user_data: interop.Pointer | interop.Reference<any>, depth: number, string: string | interop.Pointer | interop.Reference<any>, lst: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNode>>): number;

declare function xmlParseBalancedChunkMemoryRecover(doc: interop.Pointer | interop.Reference<_xmlDoc>, sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, user_data: interop.Pointer | interop.Reference<any>, depth: number, string: string | interop.Pointer | interop.Reference<any>, lst: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNode>>, recover: number): number;

declare function xmlParseCDSect(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseCatalogFile(filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlParseCharData(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, cdata: number): void;

declare function xmlParseCharEncoding(name: string | interop.Pointer | interop.Reference<any>): xmlCharEncoding;

declare function xmlParseCharRef(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function xmlParseChunk(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, chunk: string | interop.Pointer | interop.Reference<any>, size: number, terminate: number): number;

declare function xmlParseComment(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseContent(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseCtxtExternalEntity(ctx: interop.Pointer | interop.Reference<_xmlParserCtxt>, URL: string | interop.Pointer | interop.Reference<any>, ID: string | interop.Pointer | interop.Reference<any>, lst: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNode>>): number;

declare function xmlParseDTD(ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDtd>;

declare function xmlParseDefaultDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, value: interop.Pointer | interop.Reference<string>): number;

declare function xmlParseDoc(cur: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlParseDocTypeDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseDocument(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function xmlParseElement(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseElementChildrenContentDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, inputchk: number): interop.Pointer | interop.Reference<_xmlElementContent>;

declare function xmlParseElementContentDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, name: string | interop.Pointer | interop.Reference<any>, result: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlElementContent>>): number;

declare function xmlParseElementDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function xmlParseElementMixedContentDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, inputchk: number): interop.Pointer | interop.Reference<_xmlElementContent>;

declare function xmlParseEncName(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseEncodingDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseEndTag(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseEntity(filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlParseEntityDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseEntityRef(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function xmlParseEntityValue(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, orig: interop.Pointer | interop.Reference<string>): string;

declare function xmlParseEnumeratedType(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, tree: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlEnumeration>>): number;

declare function xmlParseEnumerationType(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): interop.Pointer | interop.Reference<_xmlEnumeration>;

declare function xmlParseExtParsedEnt(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function xmlParseExternalEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, user_data: interop.Pointer | interop.Reference<any>, depth: number, URL: string | interop.Pointer | interop.Reference<any>, ID: string | interop.Pointer | interop.Reference<any>, lst: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNode>>): number;

declare function xmlParseExternalID(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, publicID: interop.Pointer | interop.Reference<string>, strict: number): string;

declare function xmlParseExternalSubset(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlParseFile(filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlParseInNodeContext(node: interop.Pointer | interop.Reference<_xmlNode>, data: string | interop.Pointer | interop.Reference<any>, datalen: number, options: number, lst: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNode>>): xmlParserErrors;

declare function xmlParseMarkupDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseMemory(buffer: string | interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlParseMisc(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseName(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseNamespace(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseNmtoken(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseNotationDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseNotationType(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): interop.Pointer | interop.Reference<_xmlEnumeration>;

declare function xmlParsePEReference(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParsePI(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParsePITarget(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParsePubidLiteral(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseQuotedString(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseReference(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseSDDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function xmlParseStartTag(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseSystemLiteral(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseTextDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParseURI(str: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlURI>;

declare function xmlParseURIRaw(str: string | interop.Pointer | interop.Reference<any>, raw: number): interop.Pointer | interop.Reference<_xmlURI>;

declare function xmlParseURIReference(uri: interop.Pointer | interop.Reference<_xmlURI>, str: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlParseVersionInfo(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseVersionNum(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlParseXMLDecl(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParserAddNodeInfo(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, info: interop.Pointer | interop.Reference<_xmlParserNodeInfo>): void;

declare const enum xmlParserErrors {

	XML_ERR_OK = 0,

	XML_ERR_INTERNAL_ERROR = 1,

	XML_ERR_NO_MEMORY = 2,

	XML_ERR_DOCUMENT_START = 3,

	XML_ERR_DOCUMENT_EMPTY = 4,

	XML_ERR_DOCUMENT_END = 5,

	XML_ERR_INVALID_HEX_CHARREF = 6,

	XML_ERR_INVALID_DEC_CHARREF = 7,

	XML_ERR_INVALID_CHARREF = 8,

	XML_ERR_INVALID_CHAR = 9,

	XML_ERR_CHARREF_AT_EOF = 10,

	XML_ERR_CHARREF_IN_PROLOG = 11,

	XML_ERR_CHARREF_IN_EPILOG = 12,

	XML_ERR_CHARREF_IN_DTD = 13,

	XML_ERR_ENTITYREF_AT_EOF = 14,

	XML_ERR_ENTITYREF_IN_PROLOG = 15,

	XML_ERR_ENTITYREF_IN_EPILOG = 16,

	XML_ERR_ENTITYREF_IN_DTD = 17,

	XML_ERR_PEREF_AT_EOF = 18,

	XML_ERR_PEREF_IN_PROLOG = 19,

	XML_ERR_PEREF_IN_EPILOG = 20,

	XML_ERR_PEREF_IN_INT_SUBSET = 21,

	XML_ERR_ENTITYREF_NO_NAME = 22,

	XML_ERR_ENTITYREF_SEMICOL_MISSING = 23,

	XML_ERR_PEREF_NO_NAME = 24,

	XML_ERR_PEREF_SEMICOL_MISSING = 25,

	XML_ERR_UNDECLARED_ENTITY = 26,

	XML_WAR_UNDECLARED_ENTITY = 27,

	XML_ERR_UNPARSED_ENTITY = 28,

	XML_ERR_ENTITY_IS_EXTERNAL = 29,

	XML_ERR_ENTITY_IS_PARAMETER = 30,

	XML_ERR_UNKNOWN_ENCODING = 31,

	XML_ERR_UNSUPPORTED_ENCODING = 32,

	XML_ERR_STRING_NOT_STARTED = 33,

	XML_ERR_STRING_NOT_CLOSED = 34,

	XML_ERR_NS_DECL_ERROR = 35,

	XML_ERR_ENTITY_NOT_STARTED = 36,

	XML_ERR_ENTITY_NOT_FINISHED = 37,

	XML_ERR_LT_IN_ATTRIBUTE = 38,

	XML_ERR_ATTRIBUTE_NOT_STARTED = 39,

	XML_ERR_ATTRIBUTE_NOT_FINISHED = 40,

	XML_ERR_ATTRIBUTE_WITHOUT_VALUE = 41,

	XML_ERR_ATTRIBUTE_REDEFINED = 42,

	XML_ERR_LITERAL_NOT_STARTED = 43,

	XML_ERR_LITERAL_NOT_FINISHED = 44,

	XML_ERR_COMMENT_NOT_FINISHED = 45,

	XML_ERR_PI_NOT_STARTED = 46,

	XML_ERR_PI_NOT_FINISHED = 47,

	XML_ERR_NOTATION_NOT_STARTED = 48,

	XML_ERR_NOTATION_NOT_FINISHED = 49,

	XML_ERR_ATTLIST_NOT_STARTED = 50,

	XML_ERR_ATTLIST_NOT_FINISHED = 51,

	XML_ERR_MIXED_NOT_STARTED = 52,

	XML_ERR_MIXED_NOT_FINISHED = 53,

	XML_ERR_ELEMCONTENT_NOT_STARTED = 54,

	XML_ERR_ELEMCONTENT_NOT_FINISHED = 55,

	XML_ERR_XMLDECL_NOT_STARTED = 56,

	XML_ERR_XMLDECL_NOT_FINISHED = 57,

	XML_ERR_CONDSEC_NOT_STARTED = 58,

	XML_ERR_CONDSEC_NOT_FINISHED = 59,

	XML_ERR_EXT_SUBSET_NOT_FINISHED = 60,

	XML_ERR_DOCTYPE_NOT_FINISHED = 61,

	XML_ERR_MISPLACED_CDATA_END = 62,

	XML_ERR_CDATA_NOT_FINISHED = 63,

	XML_ERR_RESERVED_XML_NAME = 64,

	XML_ERR_SPACE_REQUIRED = 65,

	XML_ERR_SEPARATOR_REQUIRED = 66,

	XML_ERR_NMTOKEN_REQUIRED = 67,

	XML_ERR_NAME_REQUIRED = 68,

	XML_ERR_PCDATA_REQUIRED = 69,

	XML_ERR_URI_REQUIRED = 70,

	XML_ERR_PUBID_REQUIRED = 71,

	XML_ERR_LT_REQUIRED = 72,

	XML_ERR_GT_REQUIRED = 73,

	XML_ERR_LTSLASH_REQUIRED = 74,

	XML_ERR_EQUAL_REQUIRED = 75,

	XML_ERR_TAG_NAME_MISMATCH = 76,

	XML_ERR_TAG_NOT_FINISHED = 77,

	XML_ERR_STANDALONE_VALUE = 78,

	XML_ERR_ENCODING_NAME = 79,

	XML_ERR_HYPHEN_IN_COMMENT = 80,

	XML_ERR_INVALID_ENCODING = 81,

	XML_ERR_EXT_ENTITY_STANDALONE = 82,

	XML_ERR_CONDSEC_INVALID = 83,

	XML_ERR_VALUE_REQUIRED = 84,

	XML_ERR_NOT_WELL_BALANCED = 85,

	XML_ERR_EXTRA_CONTENT = 86,

	XML_ERR_ENTITY_CHAR_ERROR = 87,

	XML_ERR_ENTITY_PE_INTERNAL = 88,

	XML_ERR_ENTITY_LOOP = 89,

	XML_ERR_ENTITY_BOUNDARY = 90,

	XML_ERR_INVALID_URI = 91,

	XML_ERR_URI_FRAGMENT = 92,

	XML_WAR_CATALOG_PI = 93,

	XML_ERR_NO_DTD = 94,

	XML_ERR_CONDSEC_INVALID_KEYWORD = 95,

	XML_ERR_VERSION_MISSING = 96,

	XML_WAR_UNKNOWN_VERSION = 97,

	XML_WAR_LANG_VALUE = 98,

	XML_WAR_NS_URI = 99,

	XML_WAR_NS_URI_RELATIVE = 100,

	XML_ERR_MISSING_ENCODING = 101,

	XML_WAR_SPACE_VALUE = 102,

	XML_ERR_NOT_STANDALONE = 103,

	XML_ERR_ENTITY_PROCESSING = 104,

	XML_ERR_NOTATION_PROCESSING = 105,

	XML_WAR_NS_COLUMN = 106,

	XML_WAR_ENTITY_REDEFINED = 107,

	XML_ERR_UNKNOWN_VERSION = 108,

	XML_ERR_VERSION_MISMATCH = 109,

	XML_ERR_NAME_TOO_LONG = 110,

	XML_ERR_USER_STOP = 111,

	XML_NS_ERR_XML_NAMESPACE = 200,

	XML_NS_ERR_UNDEFINED_NAMESPACE = 201,

	XML_NS_ERR_QNAME = 202,

	XML_NS_ERR_ATTRIBUTE_REDEFINED = 203,

	XML_NS_ERR_EMPTY = 204,

	XML_NS_ERR_COLON = 205,

	XML_DTD_ATTRIBUTE_DEFAULT = 500,

	XML_DTD_ATTRIBUTE_REDEFINED = 501,

	XML_DTD_ATTRIBUTE_VALUE = 502,

	XML_DTD_CONTENT_ERROR = 503,

	XML_DTD_CONTENT_MODEL = 504,

	XML_DTD_CONTENT_NOT_DETERMINIST = 505,

	XML_DTD_DIFFERENT_PREFIX = 506,

	XML_DTD_ELEM_DEFAULT_NAMESPACE = 507,

	XML_DTD_ELEM_NAMESPACE = 508,

	XML_DTD_ELEM_REDEFINED = 509,

	XML_DTD_EMPTY_NOTATION = 510,

	XML_DTD_ENTITY_TYPE = 511,

	XML_DTD_ID_FIXED = 512,

	XML_DTD_ID_REDEFINED = 513,

	XML_DTD_ID_SUBSET = 514,

	XML_DTD_INVALID_CHILD = 515,

	XML_DTD_INVALID_DEFAULT = 516,

	XML_DTD_LOAD_ERROR = 517,

	XML_DTD_MISSING_ATTRIBUTE = 518,

	XML_DTD_MIXED_CORRUPT = 519,

	XML_DTD_MULTIPLE_ID = 520,

	XML_DTD_NO_DOC = 521,

	XML_DTD_NO_DTD = 522,

	XML_DTD_NO_ELEM_NAME = 523,

	XML_DTD_NO_PREFIX = 524,

	XML_DTD_NO_ROOT = 525,

	XML_DTD_NOTATION_REDEFINED = 526,

	XML_DTD_NOTATION_VALUE = 527,

	XML_DTD_NOT_EMPTY = 528,

	XML_DTD_NOT_PCDATA = 529,

	XML_DTD_NOT_STANDALONE = 530,

	XML_DTD_ROOT_NAME = 531,

	XML_DTD_STANDALONE_WHITE_SPACE = 532,

	XML_DTD_UNKNOWN_ATTRIBUTE = 533,

	XML_DTD_UNKNOWN_ELEM = 534,

	XML_DTD_UNKNOWN_ENTITY = 535,

	XML_DTD_UNKNOWN_ID = 536,

	XML_DTD_UNKNOWN_NOTATION = 537,

	XML_DTD_STANDALONE_DEFAULTED = 538,

	XML_DTD_XMLID_VALUE = 539,

	XML_DTD_XMLID_TYPE = 540,

	XML_DTD_DUP_TOKEN = 541,

	XML_HTML_STRUCURE_ERROR = 800,

	XML_HTML_UNKNOWN_TAG = 801,

	XML_RNGP_ANYNAME_ATTR_ANCESTOR = 1000,

	XML_RNGP_ATTR_CONFLICT = 1001,

	XML_RNGP_ATTRIBUTE_CHILDREN = 1002,

	XML_RNGP_ATTRIBUTE_CONTENT = 1003,

	XML_RNGP_ATTRIBUTE_EMPTY = 1004,

	XML_RNGP_ATTRIBUTE_NOOP = 1005,

	XML_RNGP_CHOICE_CONTENT = 1006,

	XML_RNGP_CHOICE_EMPTY = 1007,

	XML_RNGP_CREATE_FAILURE = 1008,

	XML_RNGP_DATA_CONTENT = 1009,

	XML_RNGP_DEF_CHOICE_AND_INTERLEAVE = 1010,

	XML_RNGP_DEFINE_CREATE_FAILED = 1011,

	XML_RNGP_DEFINE_EMPTY = 1012,

	XML_RNGP_DEFINE_MISSING = 1013,

	XML_RNGP_DEFINE_NAME_MISSING = 1014,

	XML_RNGP_ELEM_CONTENT_EMPTY = 1015,

	XML_RNGP_ELEM_CONTENT_ERROR = 1016,

	XML_RNGP_ELEMENT_EMPTY = 1017,

	XML_RNGP_ELEMENT_CONTENT = 1018,

	XML_RNGP_ELEMENT_NAME = 1019,

	XML_RNGP_ELEMENT_NO_CONTENT = 1020,

	XML_RNGP_ELEM_TEXT_CONFLICT = 1021,

	XML_RNGP_EMPTY = 1022,

	XML_RNGP_EMPTY_CONSTRUCT = 1023,

	XML_RNGP_EMPTY_CONTENT = 1024,

	XML_RNGP_EMPTY_NOT_EMPTY = 1025,

	XML_RNGP_ERROR_TYPE_LIB = 1026,

	XML_RNGP_EXCEPT_EMPTY = 1027,

	XML_RNGP_EXCEPT_MISSING = 1028,

	XML_RNGP_EXCEPT_MULTIPLE = 1029,

	XML_RNGP_EXCEPT_NO_CONTENT = 1030,

	XML_RNGP_EXTERNALREF_EMTPY = 1031,

	XML_RNGP_EXTERNAL_REF_FAILURE = 1032,

	XML_RNGP_EXTERNALREF_RECURSE = 1033,

	XML_RNGP_FORBIDDEN_ATTRIBUTE = 1034,

	XML_RNGP_FOREIGN_ELEMENT = 1035,

	XML_RNGP_GRAMMAR_CONTENT = 1036,

	XML_RNGP_GRAMMAR_EMPTY = 1037,

	XML_RNGP_GRAMMAR_MISSING = 1038,

	XML_RNGP_GRAMMAR_NO_START = 1039,

	XML_RNGP_GROUP_ATTR_CONFLICT = 1040,

	XML_RNGP_HREF_ERROR = 1041,

	XML_RNGP_INCLUDE_EMPTY = 1042,

	XML_RNGP_INCLUDE_FAILURE = 1043,

	XML_RNGP_INCLUDE_RECURSE = 1044,

	XML_RNGP_INTERLEAVE_ADD = 1045,

	XML_RNGP_INTERLEAVE_CREATE_FAILED = 1046,

	XML_RNGP_INTERLEAVE_EMPTY = 1047,

	XML_RNGP_INTERLEAVE_NO_CONTENT = 1048,

	XML_RNGP_INVALID_DEFINE_NAME = 1049,

	XML_RNGP_INVALID_URI = 1050,

	XML_RNGP_INVALID_VALUE = 1051,

	XML_RNGP_MISSING_HREF = 1052,

	XML_RNGP_NAME_MISSING = 1053,

	XML_RNGP_NEED_COMBINE = 1054,

	XML_RNGP_NOTALLOWED_NOT_EMPTY = 1055,

	XML_RNGP_NSNAME_ATTR_ANCESTOR = 1056,

	XML_RNGP_NSNAME_NO_NS = 1057,

	XML_RNGP_PARAM_FORBIDDEN = 1058,

	XML_RNGP_PARAM_NAME_MISSING = 1059,

	XML_RNGP_PARENTREF_CREATE_FAILED = 1060,

	XML_RNGP_PARENTREF_NAME_INVALID = 1061,

	XML_RNGP_PARENTREF_NO_NAME = 1062,

	XML_RNGP_PARENTREF_NO_PARENT = 1063,

	XML_RNGP_PARENTREF_NOT_EMPTY = 1064,

	XML_RNGP_PARSE_ERROR = 1065,

	XML_RNGP_PAT_ANYNAME_EXCEPT_ANYNAME = 1066,

	XML_RNGP_PAT_ATTR_ATTR = 1067,

	XML_RNGP_PAT_ATTR_ELEM = 1068,

	XML_RNGP_PAT_DATA_EXCEPT_ATTR = 1069,

	XML_RNGP_PAT_DATA_EXCEPT_ELEM = 1070,

	XML_RNGP_PAT_DATA_EXCEPT_EMPTY = 1071,

	XML_RNGP_PAT_DATA_EXCEPT_GROUP = 1072,

	XML_RNGP_PAT_DATA_EXCEPT_INTERLEAVE = 1073,

	XML_RNGP_PAT_DATA_EXCEPT_LIST = 1074,

	XML_RNGP_PAT_DATA_EXCEPT_ONEMORE = 1075,

	XML_RNGP_PAT_DATA_EXCEPT_REF = 1076,

	XML_RNGP_PAT_DATA_EXCEPT_TEXT = 1077,

	XML_RNGP_PAT_LIST_ATTR = 1078,

	XML_RNGP_PAT_LIST_ELEM = 1079,

	XML_RNGP_PAT_LIST_INTERLEAVE = 1080,

	XML_RNGP_PAT_LIST_LIST = 1081,

	XML_RNGP_PAT_LIST_REF = 1082,

	XML_RNGP_PAT_LIST_TEXT = 1083,

	XML_RNGP_PAT_NSNAME_EXCEPT_ANYNAME = 1084,

	XML_RNGP_PAT_NSNAME_EXCEPT_NSNAME = 1085,

	XML_RNGP_PAT_ONEMORE_GROUP_ATTR = 1086,

	XML_RNGP_PAT_ONEMORE_INTERLEAVE_ATTR = 1087,

	XML_RNGP_PAT_START_ATTR = 1088,

	XML_RNGP_PAT_START_DATA = 1089,

	XML_RNGP_PAT_START_EMPTY = 1090,

	XML_RNGP_PAT_START_GROUP = 1091,

	XML_RNGP_PAT_START_INTERLEAVE = 1092,

	XML_RNGP_PAT_START_LIST = 1093,

	XML_RNGP_PAT_START_ONEMORE = 1094,

	XML_RNGP_PAT_START_TEXT = 1095,

	XML_RNGP_PAT_START_VALUE = 1096,

	XML_RNGP_PREFIX_UNDEFINED = 1097,

	XML_RNGP_REF_CREATE_FAILED = 1098,

	XML_RNGP_REF_CYCLE = 1099,

	XML_RNGP_REF_NAME_INVALID = 1100,

	XML_RNGP_REF_NO_DEF = 1101,

	XML_RNGP_REF_NO_NAME = 1102,

	XML_RNGP_REF_NOT_EMPTY = 1103,

	XML_RNGP_START_CHOICE_AND_INTERLEAVE = 1104,

	XML_RNGP_START_CONTENT = 1105,

	XML_RNGP_START_EMPTY = 1106,

	XML_RNGP_START_MISSING = 1107,

	XML_RNGP_TEXT_EXPECTED = 1108,

	XML_RNGP_TEXT_HAS_CHILD = 1109,

	XML_RNGP_TYPE_MISSING = 1110,

	XML_RNGP_TYPE_NOT_FOUND = 1111,

	XML_RNGP_TYPE_VALUE = 1112,

	XML_RNGP_UNKNOWN_ATTRIBUTE = 1113,

	XML_RNGP_UNKNOWN_COMBINE = 1114,

	XML_RNGP_UNKNOWN_CONSTRUCT = 1115,

	XML_RNGP_UNKNOWN_TYPE_LIB = 1116,

	XML_RNGP_URI_FRAGMENT = 1117,

	XML_RNGP_URI_NOT_ABSOLUTE = 1118,

	XML_RNGP_VALUE_EMPTY = 1119,

	XML_RNGP_VALUE_NO_CONTENT = 1120,

	XML_RNGP_XMLNS_NAME = 1121,

	XML_RNGP_XML_NS = 1122,

	XML_XPATH_EXPRESSION_OK = 1200,

	XML_XPATH_NUMBER_ERROR = 1201,

	XML_XPATH_UNFINISHED_LITERAL_ERROR = 1202,

	XML_XPATH_START_LITERAL_ERROR = 1203,

	XML_XPATH_VARIABLE_REF_ERROR = 1204,

	XML_XPATH_UNDEF_VARIABLE_ERROR = 1205,

	XML_XPATH_INVALID_PREDICATE_ERROR = 1206,

	XML_XPATH_EXPR_ERROR = 1207,

	XML_XPATH_UNCLOSED_ERROR = 1208,

	XML_XPATH_UNKNOWN_FUNC_ERROR = 1209,

	XML_XPATH_INVALID_OPERAND = 1210,

	XML_XPATH_INVALID_TYPE = 1211,

	XML_XPATH_INVALID_ARITY = 1212,

	XML_XPATH_INVALID_CTXT_SIZE = 1213,

	XML_XPATH_INVALID_CTXT_POSITION = 1214,

	XML_XPATH_MEMORY_ERROR = 1215,

	XML_XPTR_SYNTAX_ERROR = 1216,

	XML_XPTR_RESOURCE_ERROR = 1217,

	XML_XPTR_SUB_RESOURCE_ERROR = 1218,

	XML_XPATH_UNDEF_PREFIX_ERROR = 1219,

	XML_XPATH_ENCODING_ERROR = 1220,

	XML_XPATH_INVALID_CHAR_ERROR = 1221,

	XML_TREE_INVALID_HEX = 1300,

	XML_TREE_INVALID_DEC = 1301,

	XML_TREE_UNTERMINATED_ENTITY = 1302,

	XML_TREE_NOT_UTF8 = 1303,

	XML_SAVE_NOT_UTF8 = 1400,

	XML_SAVE_CHAR_INVALID = 1401,

	XML_SAVE_NO_DOCTYPE = 1402,

	XML_SAVE_UNKNOWN_ENCODING = 1403,

	XML_REGEXP_COMPILE_ERROR = 1450,

	XML_IO_UNKNOWN = 1500,

	XML_IO_EACCES = 1501,

	XML_IO_EAGAIN = 1502,

	XML_IO_EBADF = 1503,

	XML_IO_EBADMSG = 1504,

	XML_IO_EBUSY = 1505,

	XML_IO_ECANCELED = 1506,

	XML_IO_ECHILD = 1507,

	XML_IO_EDEADLK = 1508,

	XML_IO_EDOM = 1509,

	XML_IO_EEXIST = 1510,

	XML_IO_EFAULT = 1511,

	XML_IO_EFBIG = 1512,

	XML_IO_EINPROGRESS = 1513,

	XML_IO_EINTR = 1514,

	XML_IO_EINVAL = 1515,

	XML_IO_EIO = 1516,

	XML_IO_EISDIR = 1517,

	XML_IO_EMFILE = 1518,

	XML_IO_EMLINK = 1519,

	XML_IO_EMSGSIZE = 1520,

	XML_IO_ENAMETOOLONG = 1521,

	XML_IO_ENFILE = 1522,

	XML_IO_ENODEV = 1523,

	XML_IO_ENOENT = 1524,

	XML_IO_ENOEXEC = 1525,

	XML_IO_ENOLCK = 1526,

	XML_IO_ENOMEM = 1527,

	XML_IO_ENOSPC = 1528,

	XML_IO_ENOSYS = 1529,

	XML_IO_ENOTDIR = 1530,

	XML_IO_ENOTEMPTY = 1531,

	XML_IO_ENOTSUP = 1532,

	XML_IO_ENOTTY = 1533,

	XML_IO_ENXIO = 1534,

	XML_IO_EPERM = 1535,

	XML_IO_EPIPE = 1536,

	XML_IO_ERANGE = 1537,

	XML_IO_EROFS = 1538,

	XML_IO_ESPIPE = 1539,

	XML_IO_ESRCH = 1540,

	XML_IO_ETIMEDOUT = 1541,

	XML_IO_EXDEV = 1542,

	XML_IO_NETWORK_ATTEMPT = 1543,

	XML_IO_ENCODER = 1544,

	XML_IO_FLUSH = 1545,

	XML_IO_WRITE = 1546,

	XML_IO_NO_INPUT = 1547,

	XML_IO_BUFFER_FULL = 1548,

	XML_IO_LOAD_ERROR = 1549,

	XML_IO_ENOTSOCK = 1550,

	XML_IO_EISCONN = 1551,

	XML_IO_ECONNREFUSED = 1552,

	XML_IO_ENETUNREACH = 1553,

	XML_IO_EADDRINUSE = 1554,

	XML_IO_EALREADY = 1555,

	XML_IO_EAFNOSUPPORT = 1556,

	XML_XINCLUDE_RECURSION = 1600,

	XML_XINCLUDE_PARSE_VALUE = 1601,

	XML_XINCLUDE_ENTITY_DEF_MISMATCH = 1602,

	XML_XINCLUDE_NO_HREF = 1603,

	XML_XINCLUDE_NO_FALLBACK = 1604,

	XML_XINCLUDE_HREF_URI = 1605,

	XML_XINCLUDE_TEXT_FRAGMENT = 1606,

	XML_XINCLUDE_TEXT_DOCUMENT = 1607,

	XML_XINCLUDE_INVALID_CHAR = 1608,

	XML_XINCLUDE_BUILD_FAILED = 1609,

	XML_XINCLUDE_UNKNOWN_ENCODING = 1610,

	XML_XINCLUDE_MULTIPLE_ROOT = 1611,

	XML_XINCLUDE_XPTR_FAILED = 1612,

	XML_XINCLUDE_XPTR_RESULT = 1613,

	XML_XINCLUDE_INCLUDE_IN_INCLUDE = 1614,

	XML_XINCLUDE_FALLBACKS_IN_INCLUDE = 1615,

	XML_XINCLUDE_FALLBACK_NOT_IN_INCLUDE = 1616,

	XML_XINCLUDE_DEPRECATED_NS = 1617,

	XML_XINCLUDE_FRAGMENT_ID = 1618,

	XML_CATALOG_MISSING_ATTR = 1650,

	XML_CATALOG_ENTRY_BROKEN = 1651,

	XML_CATALOG_PREFER_VALUE = 1652,

	XML_CATALOG_NOT_CATALOG = 1653,

	XML_CATALOG_RECURSION = 1654,

	XML_SCHEMAP_PREFIX_UNDEFINED = 1700,

	XML_SCHEMAP_ATTRFORMDEFAULT_VALUE = 1701,

	XML_SCHEMAP_ATTRGRP_NONAME_NOREF = 1702,

	XML_SCHEMAP_ATTR_NONAME_NOREF = 1703,

	XML_SCHEMAP_COMPLEXTYPE_NONAME_NOREF = 1704,

	XML_SCHEMAP_ELEMFORMDEFAULT_VALUE = 1705,

	XML_SCHEMAP_ELEM_NONAME_NOREF = 1706,

	XML_SCHEMAP_EXTENSION_NO_BASE = 1707,

	XML_SCHEMAP_FACET_NO_VALUE = 1708,

	XML_SCHEMAP_FAILED_BUILD_IMPORT = 1709,

	XML_SCHEMAP_GROUP_NONAME_NOREF = 1710,

	XML_SCHEMAP_IMPORT_NAMESPACE_NOT_URI = 1711,

	XML_SCHEMAP_IMPORT_REDEFINE_NSNAME = 1712,

	XML_SCHEMAP_IMPORT_SCHEMA_NOT_URI = 1713,

	XML_SCHEMAP_INVALID_BOOLEAN = 1714,

	XML_SCHEMAP_INVALID_ENUM = 1715,

	XML_SCHEMAP_INVALID_FACET = 1716,

	XML_SCHEMAP_INVALID_FACET_VALUE = 1717,

	XML_SCHEMAP_INVALID_MAXOCCURS = 1718,

	XML_SCHEMAP_INVALID_MINOCCURS = 1719,

	XML_SCHEMAP_INVALID_REF_AND_SUBTYPE = 1720,

	XML_SCHEMAP_INVALID_WHITE_SPACE = 1721,

	XML_SCHEMAP_NOATTR_NOREF = 1722,

	XML_SCHEMAP_NOTATION_NO_NAME = 1723,

	XML_SCHEMAP_NOTYPE_NOREF = 1724,

	XML_SCHEMAP_REF_AND_SUBTYPE = 1725,

	XML_SCHEMAP_RESTRICTION_NONAME_NOREF = 1726,

	XML_SCHEMAP_SIMPLETYPE_NONAME = 1727,

	XML_SCHEMAP_TYPE_AND_SUBTYPE = 1728,

	XML_SCHEMAP_UNKNOWN_ALL_CHILD = 1729,

	XML_SCHEMAP_UNKNOWN_ANYATTRIBUTE_CHILD = 1730,

	XML_SCHEMAP_UNKNOWN_ATTR_CHILD = 1731,

	XML_SCHEMAP_UNKNOWN_ATTRGRP_CHILD = 1732,

	XML_SCHEMAP_UNKNOWN_ATTRIBUTE_GROUP = 1733,

	XML_SCHEMAP_UNKNOWN_BASE_TYPE = 1734,

	XML_SCHEMAP_UNKNOWN_CHOICE_CHILD = 1735,

	XML_SCHEMAP_UNKNOWN_COMPLEXCONTENT_CHILD = 1736,

	XML_SCHEMAP_UNKNOWN_COMPLEXTYPE_CHILD = 1737,

	XML_SCHEMAP_UNKNOWN_ELEM_CHILD = 1738,

	XML_SCHEMAP_UNKNOWN_EXTENSION_CHILD = 1739,

	XML_SCHEMAP_UNKNOWN_FACET_CHILD = 1740,

	XML_SCHEMAP_UNKNOWN_FACET_TYPE = 1741,

	XML_SCHEMAP_UNKNOWN_GROUP_CHILD = 1742,

	XML_SCHEMAP_UNKNOWN_IMPORT_CHILD = 1743,

	XML_SCHEMAP_UNKNOWN_LIST_CHILD = 1744,

	XML_SCHEMAP_UNKNOWN_NOTATION_CHILD = 1745,

	XML_SCHEMAP_UNKNOWN_PROCESSCONTENT_CHILD = 1746,

	XML_SCHEMAP_UNKNOWN_REF = 1747,

	XML_SCHEMAP_UNKNOWN_RESTRICTION_CHILD = 1748,

	XML_SCHEMAP_UNKNOWN_SCHEMAS_CHILD = 1749,

	XML_SCHEMAP_UNKNOWN_SEQUENCE_CHILD = 1750,

	XML_SCHEMAP_UNKNOWN_SIMPLECONTENT_CHILD = 1751,

	XML_SCHEMAP_UNKNOWN_SIMPLETYPE_CHILD = 1752,

	XML_SCHEMAP_UNKNOWN_TYPE = 1753,

	XML_SCHEMAP_UNKNOWN_UNION_CHILD = 1754,

	XML_SCHEMAP_ELEM_DEFAULT_FIXED = 1755,

	XML_SCHEMAP_REGEXP_INVALID = 1756,

	XML_SCHEMAP_FAILED_LOAD = 1757,

	XML_SCHEMAP_NOTHING_TO_PARSE = 1758,

	XML_SCHEMAP_NOROOT = 1759,

	XML_SCHEMAP_REDEFINED_GROUP = 1760,

	XML_SCHEMAP_REDEFINED_TYPE = 1761,

	XML_SCHEMAP_REDEFINED_ELEMENT = 1762,

	XML_SCHEMAP_REDEFINED_ATTRGROUP = 1763,

	XML_SCHEMAP_REDEFINED_ATTR = 1764,

	XML_SCHEMAP_REDEFINED_NOTATION = 1765,

	XML_SCHEMAP_FAILED_PARSE = 1766,

	XML_SCHEMAP_UNKNOWN_PREFIX = 1767,

	XML_SCHEMAP_DEF_AND_PREFIX = 1768,

	XML_SCHEMAP_UNKNOWN_INCLUDE_CHILD = 1769,

	XML_SCHEMAP_INCLUDE_SCHEMA_NOT_URI = 1770,

	XML_SCHEMAP_INCLUDE_SCHEMA_NO_URI = 1771,

	XML_SCHEMAP_NOT_SCHEMA = 1772,

	XML_SCHEMAP_UNKNOWN_MEMBER_TYPE = 1773,

	XML_SCHEMAP_INVALID_ATTR_USE = 1774,

	XML_SCHEMAP_RECURSIVE = 1775,

	XML_SCHEMAP_SUPERNUMEROUS_LIST_ITEM_TYPE = 1776,

	XML_SCHEMAP_INVALID_ATTR_COMBINATION = 1777,

	XML_SCHEMAP_INVALID_ATTR_INLINE_COMBINATION = 1778,

	XML_SCHEMAP_MISSING_SIMPLETYPE_CHILD = 1779,

	XML_SCHEMAP_INVALID_ATTR_NAME = 1780,

	XML_SCHEMAP_REF_AND_CONTENT = 1781,

	XML_SCHEMAP_CT_PROPS_CORRECT_1 = 1782,

	XML_SCHEMAP_CT_PROPS_CORRECT_2 = 1783,

	XML_SCHEMAP_CT_PROPS_CORRECT_3 = 1784,

	XML_SCHEMAP_CT_PROPS_CORRECT_4 = 1785,

	XML_SCHEMAP_CT_PROPS_CORRECT_5 = 1786,

	XML_SCHEMAP_DERIVATION_OK_RESTRICTION_1 = 1787,

	XML_SCHEMAP_DERIVATION_OK_RESTRICTION_2_1_1 = 1788,

	XML_SCHEMAP_DERIVATION_OK_RESTRICTION_2_1_2 = 1789,

	XML_SCHEMAP_DERIVATION_OK_RESTRICTION_2_2 = 1790,

	XML_SCHEMAP_DERIVATION_OK_RESTRICTION_3 = 1791,

	XML_SCHEMAP_WILDCARD_INVALID_NS_MEMBER = 1792,

	XML_SCHEMAP_INTERSECTION_NOT_EXPRESSIBLE = 1793,

	XML_SCHEMAP_UNION_NOT_EXPRESSIBLE = 1794,

	XML_SCHEMAP_SRC_IMPORT_3_1 = 1795,

	XML_SCHEMAP_SRC_IMPORT_3_2 = 1796,

	XML_SCHEMAP_DERIVATION_OK_RESTRICTION_4_1 = 1797,

	XML_SCHEMAP_DERIVATION_OK_RESTRICTION_4_2 = 1798,

	XML_SCHEMAP_DERIVATION_OK_RESTRICTION_4_3 = 1799,

	XML_SCHEMAP_COS_CT_EXTENDS_1_3 = 1800,

	XML_SCHEMAV_NOROOT = 1801,

	XML_SCHEMAV_UNDECLAREDELEM = 1802,

	XML_SCHEMAV_NOTTOPLEVEL = 1803,

	XML_SCHEMAV_MISSING = 1804,

	XML_SCHEMAV_WRONGELEM = 1805,

	XML_SCHEMAV_NOTYPE = 1806,

	XML_SCHEMAV_NOROLLBACK = 1807,

	XML_SCHEMAV_ISABSTRACT = 1808,

	XML_SCHEMAV_NOTEMPTY = 1809,

	XML_SCHEMAV_ELEMCONT = 1810,

	XML_SCHEMAV_HAVEDEFAULT = 1811,

	XML_SCHEMAV_NOTNILLABLE = 1812,

	XML_SCHEMAV_EXTRACONTENT = 1813,

	XML_SCHEMAV_INVALIDATTR = 1814,

	XML_SCHEMAV_INVALIDELEM = 1815,

	XML_SCHEMAV_NOTDETERMINIST = 1816,

	XML_SCHEMAV_CONSTRUCT = 1817,

	XML_SCHEMAV_INTERNAL = 1818,

	XML_SCHEMAV_NOTSIMPLE = 1819,

	XML_SCHEMAV_ATTRUNKNOWN = 1820,

	XML_SCHEMAV_ATTRINVALID = 1821,

	XML_SCHEMAV_VALUE = 1822,

	XML_SCHEMAV_FACET = 1823,

	XML_SCHEMAV_CVC_DATATYPE_VALID_1_2_1 = 1824,

	XML_SCHEMAV_CVC_DATATYPE_VALID_1_2_2 = 1825,

	XML_SCHEMAV_CVC_DATATYPE_VALID_1_2_3 = 1826,

	XML_SCHEMAV_CVC_TYPE_3_1_1 = 1827,

	XML_SCHEMAV_CVC_TYPE_3_1_2 = 1828,

	XML_SCHEMAV_CVC_FACET_VALID = 1829,

	XML_SCHEMAV_CVC_LENGTH_VALID = 1830,

	XML_SCHEMAV_CVC_MINLENGTH_VALID = 1831,

	XML_SCHEMAV_CVC_MAXLENGTH_VALID = 1832,

	XML_SCHEMAV_CVC_MININCLUSIVE_VALID = 1833,

	XML_SCHEMAV_CVC_MAXINCLUSIVE_VALID = 1834,

	XML_SCHEMAV_CVC_MINEXCLUSIVE_VALID = 1835,

	XML_SCHEMAV_CVC_MAXEXCLUSIVE_VALID = 1836,

	XML_SCHEMAV_CVC_TOTALDIGITS_VALID = 1837,

	XML_SCHEMAV_CVC_FRACTIONDIGITS_VALID = 1838,

	XML_SCHEMAV_CVC_PATTERN_VALID = 1839,

	XML_SCHEMAV_CVC_ENUMERATION_VALID = 1840,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_2_1 = 1841,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_2_2 = 1842,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_2_3 = 1843,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_2_4 = 1844,

	XML_SCHEMAV_CVC_ELT_1 = 1845,

	XML_SCHEMAV_CVC_ELT_2 = 1846,

	XML_SCHEMAV_CVC_ELT_3_1 = 1847,

	XML_SCHEMAV_CVC_ELT_3_2_1 = 1848,

	XML_SCHEMAV_CVC_ELT_3_2_2 = 1849,

	XML_SCHEMAV_CVC_ELT_4_1 = 1850,

	XML_SCHEMAV_CVC_ELT_4_2 = 1851,

	XML_SCHEMAV_CVC_ELT_4_3 = 1852,

	XML_SCHEMAV_CVC_ELT_5_1_1 = 1853,

	XML_SCHEMAV_CVC_ELT_5_1_2 = 1854,

	XML_SCHEMAV_CVC_ELT_5_2_1 = 1855,

	XML_SCHEMAV_CVC_ELT_5_2_2_1 = 1856,

	XML_SCHEMAV_CVC_ELT_5_2_2_2_1 = 1857,

	XML_SCHEMAV_CVC_ELT_5_2_2_2_2 = 1858,

	XML_SCHEMAV_CVC_ELT_6 = 1859,

	XML_SCHEMAV_CVC_ELT_7 = 1860,

	XML_SCHEMAV_CVC_ATTRIBUTE_1 = 1861,

	XML_SCHEMAV_CVC_ATTRIBUTE_2 = 1862,

	XML_SCHEMAV_CVC_ATTRIBUTE_3 = 1863,

	XML_SCHEMAV_CVC_ATTRIBUTE_4 = 1864,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_3_1 = 1865,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_3_2_1 = 1866,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_3_2_2 = 1867,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_4 = 1868,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_5_1 = 1869,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_5_2 = 1870,

	XML_SCHEMAV_ELEMENT_CONTENT = 1871,

	XML_SCHEMAV_DOCUMENT_ELEMENT_MISSING = 1872,

	XML_SCHEMAV_CVC_COMPLEX_TYPE_1 = 1873,

	XML_SCHEMAV_CVC_AU = 1874,

	XML_SCHEMAV_CVC_TYPE_1 = 1875,

	XML_SCHEMAV_CVC_TYPE_2 = 1876,

	XML_SCHEMAV_CVC_IDC = 1877,

	XML_SCHEMAV_CVC_WILDCARD = 1878,

	XML_SCHEMAV_MISC = 1879,

	XML_XPTR_UNKNOWN_SCHEME = 1900,

	XML_XPTR_CHILDSEQ_START = 1901,

	XML_XPTR_EVAL_FAILED = 1902,

	XML_XPTR_EXTRA_OBJECTS = 1903,

	XML_C14N_CREATE_CTXT = 1950,

	XML_C14N_REQUIRES_UTF8 = 1951,

	XML_C14N_CREATE_STACK = 1952,

	XML_C14N_INVALID_NODE = 1953,

	XML_C14N_UNKNOW_NODE = 1954,

	XML_C14N_RELATIVE_NAMESPACE = 1955,

	XML_FTP_PASV_ANSWER = 2000,

	XML_FTP_EPSV_ANSWER = 2001,

	XML_FTP_ACCNT = 2002,

	XML_FTP_URL_SYNTAX = 2003,

	XML_HTTP_URL_SYNTAX = 2020,

	XML_HTTP_USE_IP = 2021,

	XML_HTTP_UNKNOWN_HOST = 2022,

	XML_SCHEMAP_SRC_SIMPLE_TYPE_1 = 3000,

	XML_SCHEMAP_SRC_SIMPLE_TYPE_2 = 3001,

	XML_SCHEMAP_SRC_SIMPLE_TYPE_3 = 3002,

	XML_SCHEMAP_SRC_SIMPLE_TYPE_4 = 3003,

	XML_SCHEMAP_SRC_RESOLVE = 3004,

	XML_SCHEMAP_SRC_RESTRICTION_BASE_OR_SIMPLETYPE = 3005,

	XML_SCHEMAP_SRC_LIST_ITEMTYPE_OR_SIMPLETYPE = 3006,

	XML_SCHEMAP_SRC_UNION_MEMBERTYPES_OR_SIMPLETYPES = 3007,

	XML_SCHEMAP_ST_PROPS_CORRECT_1 = 3008,

	XML_SCHEMAP_ST_PROPS_CORRECT_2 = 3009,

	XML_SCHEMAP_ST_PROPS_CORRECT_3 = 3010,

	XML_SCHEMAP_COS_ST_RESTRICTS_1_1 = 3011,

	XML_SCHEMAP_COS_ST_RESTRICTS_1_2 = 3012,

	XML_SCHEMAP_COS_ST_RESTRICTS_1_3_1 = 3013,

	XML_SCHEMAP_COS_ST_RESTRICTS_1_3_2 = 3014,

	XML_SCHEMAP_COS_ST_RESTRICTS_2_1 = 3015,

	XML_SCHEMAP_COS_ST_RESTRICTS_2_3_1_1 = 3016,

	XML_SCHEMAP_COS_ST_RESTRICTS_2_3_1_2 = 3017,

	XML_SCHEMAP_COS_ST_RESTRICTS_2_3_2_1 = 3018,

	XML_SCHEMAP_COS_ST_RESTRICTS_2_3_2_2 = 3019,

	XML_SCHEMAP_COS_ST_RESTRICTS_2_3_2_3 = 3020,

	XML_SCHEMAP_COS_ST_RESTRICTS_2_3_2_4 = 3021,

	XML_SCHEMAP_COS_ST_RESTRICTS_2_3_2_5 = 3022,

	XML_SCHEMAP_COS_ST_RESTRICTS_3_1 = 3023,

	XML_SCHEMAP_COS_ST_RESTRICTS_3_3_1 = 3024,

	XML_SCHEMAP_COS_ST_RESTRICTS_3_3_1_2 = 3025,

	XML_SCHEMAP_COS_ST_RESTRICTS_3_3_2_2 = 3026,

	XML_SCHEMAP_COS_ST_RESTRICTS_3_3_2_1 = 3027,

	XML_SCHEMAP_COS_ST_RESTRICTS_3_3_2_3 = 3028,

	XML_SCHEMAP_COS_ST_RESTRICTS_3_3_2_4 = 3029,

	XML_SCHEMAP_COS_ST_RESTRICTS_3_3_2_5 = 3030,

	XML_SCHEMAP_COS_ST_DERIVED_OK_2_1 = 3031,

	XML_SCHEMAP_COS_ST_DERIVED_OK_2_2 = 3032,

	XML_SCHEMAP_S4S_ELEM_NOT_ALLOWED = 3033,

	XML_SCHEMAP_S4S_ELEM_MISSING = 3034,

	XML_SCHEMAP_S4S_ATTR_NOT_ALLOWED = 3035,

	XML_SCHEMAP_S4S_ATTR_MISSING = 3036,

	XML_SCHEMAP_S4S_ATTR_INVALID_VALUE = 3037,

	XML_SCHEMAP_SRC_ELEMENT_1 = 3038,

	XML_SCHEMAP_SRC_ELEMENT_2_1 = 3039,

	XML_SCHEMAP_SRC_ELEMENT_2_2 = 3040,

	XML_SCHEMAP_SRC_ELEMENT_3 = 3041,

	XML_SCHEMAP_P_PROPS_CORRECT_1 = 3042,

	XML_SCHEMAP_P_PROPS_CORRECT_2_1 = 3043,

	XML_SCHEMAP_P_PROPS_CORRECT_2_2 = 3044,

	XML_SCHEMAP_E_PROPS_CORRECT_2 = 3045,

	XML_SCHEMAP_E_PROPS_CORRECT_3 = 3046,

	XML_SCHEMAP_E_PROPS_CORRECT_4 = 3047,

	XML_SCHEMAP_E_PROPS_CORRECT_5 = 3048,

	XML_SCHEMAP_E_PROPS_CORRECT_6 = 3049,

	XML_SCHEMAP_SRC_INCLUDE = 3050,

	XML_SCHEMAP_SRC_ATTRIBUTE_1 = 3051,

	XML_SCHEMAP_SRC_ATTRIBUTE_2 = 3052,

	XML_SCHEMAP_SRC_ATTRIBUTE_3_1 = 3053,

	XML_SCHEMAP_SRC_ATTRIBUTE_3_2 = 3054,

	XML_SCHEMAP_SRC_ATTRIBUTE_4 = 3055,

	XML_SCHEMAP_NO_XMLNS = 3056,

	XML_SCHEMAP_NO_XSI = 3057,

	XML_SCHEMAP_COS_VALID_DEFAULT_1 = 3058,

	XML_SCHEMAP_COS_VALID_DEFAULT_2_1 = 3059,

	XML_SCHEMAP_COS_VALID_DEFAULT_2_2_1 = 3060,

	XML_SCHEMAP_COS_VALID_DEFAULT_2_2_2 = 3061,

	XML_SCHEMAP_CVC_SIMPLE_TYPE = 3062,

	XML_SCHEMAP_COS_CT_EXTENDS_1_1 = 3063,

	XML_SCHEMAP_SRC_IMPORT_1_1 = 3064,

	XML_SCHEMAP_SRC_IMPORT_1_2 = 3065,

	XML_SCHEMAP_SRC_IMPORT_2 = 3066,

	XML_SCHEMAP_SRC_IMPORT_2_1 = 3067,

	XML_SCHEMAP_SRC_IMPORT_2_2 = 3068,

	XML_SCHEMAP_INTERNAL = 3069,

	XML_SCHEMAP_NOT_DETERMINISTIC = 3070,

	XML_SCHEMAP_SRC_ATTRIBUTE_GROUP_1 = 3071,

	XML_SCHEMAP_SRC_ATTRIBUTE_GROUP_2 = 3072,

	XML_SCHEMAP_SRC_ATTRIBUTE_GROUP_3 = 3073,

	XML_SCHEMAP_MG_PROPS_CORRECT_1 = 3074,

	XML_SCHEMAP_MG_PROPS_CORRECT_2 = 3075,

	XML_SCHEMAP_SRC_CT_1 = 3076,

	XML_SCHEMAP_DERIVATION_OK_RESTRICTION_2_1_3 = 3077,

	XML_SCHEMAP_AU_PROPS_CORRECT_2 = 3078,

	XML_SCHEMAP_A_PROPS_CORRECT_2 = 3079,

	XML_SCHEMAP_C_PROPS_CORRECT = 3080,

	XML_SCHEMAP_SRC_REDEFINE = 3081,

	XML_SCHEMAP_SRC_IMPORT = 3082,

	XML_SCHEMAP_WARN_SKIP_SCHEMA = 3083,

	XML_SCHEMAP_WARN_UNLOCATED_SCHEMA = 3084,

	XML_SCHEMAP_WARN_ATTR_REDECL_PROH = 3085,

	XML_SCHEMAP_WARN_ATTR_POINTLESS_PROH = 3086,

	XML_SCHEMAP_AG_PROPS_CORRECT = 3087,

	XML_SCHEMAP_COS_CT_EXTENDS_1_2 = 3088,

	XML_SCHEMAP_AU_PROPS_CORRECT = 3089,

	XML_SCHEMAP_A_PROPS_CORRECT_3 = 3090,

	XML_SCHEMAP_COS_ALL_LIMITED = 3091,

	XML_SCHEMATRONV_ASSERT = 4000,

	XML_SCHEMATRONV_REPORT = 4001,

	XML_MODULE_OPEN = 4900,

	XML_MODULE_CLOSE = 4901,

	XML_CHECK_FOUND_ELEMENT = 5000,

	XML_CHECK_FOUND_ATTRIBUTE = 5001,

	XML_CHECK_FOUND_TEXT = 5002,

	XML_CHECK_FOUND_CDATA = 5003,

	XML_CHECK_FOUND_ENTITYREF = 5004,

	XML_CHECK_FOUND_ENTITY = 5005,

	XML_CHECK_FOUND_PI = 5006,

	XML_CHECK_FOUND_COMMENT = 5007,

	XML_CHECK_FOUND_DOCTYPE = 5008,

	XML_CHECK_FOUND_FRAGMENT = 5009,

	XML_CHECK_FOUND_NOTATION = 5010,

	XML_CHECK_UNKNOWN_NODE = 5011,

	XML_CHECK_ENTITY_TYPE = 5012,

	XML_CHECK_NO_PARENT = 5013,

	XML_CHECK_NO_DOC = 5014,

	XML_CHECK_NO_NAME = 5015,

	XML_CHECK_NO_ELEM = 5016,

	XML_CHECK_WRONG_DOC = 5017,

	XML_CHECK_NO_PREV = 5018,

	XML_CHECK_WRONG_PREV = 5019,

	XML_CHECK_NO_NEXT = 5020,

	XML_CHECK_WRONG_NEXT = 5021,

	XML_CHECK_NOT_DTD = 5022,

	XML_CHECK_NOT_ATTR = 5023,

	XML_CHECK_NOT_ATTR_DECL = 5024,

	XML_CHECK_NOT_ELEM_DECL = 5025,

	XML_CHECK_NOT_ENTITY_DECL = 5026,

	XML_CHECK_NOT_NS_DECL = 5027,

	XML_CHECK_NO_HREF = 5028,

	XML_CHECK_WRONG_PARENT = 5029,

	XML_CHECK_NS_SCOPE = 5030,

	XML_CHECK_NS_ANCESTOR = 5031,

	XML_CHECK_NOT_UTF8 = 5032,

	XML_CHECK_NO_DICT = 5033,

	XML_CHECK_NOT_NCNAME = 5034,

	XML_CHECK_OUTSIDE_DICT = 5035,

	XML_CHECK_WRONG_NAME = 5036,

	XML_CHECK_NAME_NOT_NULL = 5037,

	XML_I18N_NO_NAME = 6000,

	XML_I18N_NO_HANDLER = 6001,

	XML_I18N_EXCESS_HANDLER = 6002,

	XML_I18N_CONV_FAILED = 6003,

	XML_I18N_NO_OUTPUT = 6004,

	XML_BUF_OVERFLOW = 7000
}

declare function xmlParserFindNodeInfo(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlParserNodeInfo>;

declare function xmlParserFindNodeInfoIndex(seq: interop.Pointer | interop.Reference<_xmlParserNodeInfoSeq>, node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlParserGetDirectory(filename: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlParserHandlePEReference(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParserHandleReference(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlParserInputBufferCreateFd(fd: number, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserInputBuffer>;

declare function xmlParserInputBufferCreateFile(file: interop.Pointer | interop.Reference<FILE>, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserInputBuffer>;

declare function xmlParserInputBufferCreateFilename(URI: string | interop.Pointer | interop.Reference<any>, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserInputBuffer>;

declare function xmlParserInputBufferCreateFilenameDefault(func: interop.FunctionReference<(p1: string, p2: xmlCharEncoding) => interop.Pointer | interop.Reference<_xmlParserInputBuffer>>): interop.FunctionReference<(p1: string, p2: xmlCharEncoding) => interop.Pointer | interop.Reference<_xmlParserInputBuffer>>;

declare function xmlParserInputBufferCreateIO(ioread: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, ioclose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ioctx: interop.Pointer | interop.Reference<any>, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserInputBuffer>;

declare function xmlParserInputBufferCreateMem(mem: string | interop.Pointer | interop.Reference<any>, size: number, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserInputBuffer>;

declare function xmlParserInputBufferCreateStatic(mem: string | interop.Pointer | interop.Reference<any>, size: number, enc: xmlCharEncoding): interop.Pointer | interop.Reference<_xmlParserInputBuffer>;

declare function xmlParserInputBufferGrow(_in: interop.Pointer | interop.Reference<_xmlParserInputBuffer>, len: number): number;

declare function xmlParserInputBufferPush(_in: interop.Pointer | interop.Reference<_xmlParserInputBuffer>, len: number, buf: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlParserInputBufferRead(_in: interop.Pointer | interop.Reference<_xmlParserInputBuffer>, len: number): number;

declare function xmlParserInputGrow(_in: interop.Pointer | interop.Reference<_xmlParserInput>, len: number): number;

declare function xmlParserInputRead(_in: interop.Pointer | interop.Reference<_xmlParserInput>, len: number): number;

declare function xmlParserInputShrink(_in: interop.Pointer | interop.Reference<_xmlParserInput>): void;

declare const enum xmlParserInputState {

	XML_PARSER_EOF = -1,

	XML_PARSER_START = 0,

	XML_PARSER_MISC = 1,

	XML_PARSER_PI = 2,

	XML_PARSER_DTD = 3,

	XML_PARSER_PROLOG = 4,

	XML_PARSER_COMMENT = 5,

	XML_PARSER_START_TAG = 6,

	XML_PARSER_CONTENT = 7,

	XML_PARSER_CDATA_SECTION = 8,

	XML_PARSER_END_TAG = 9,

	XML_PARSER_ENTITY_DECL = 10,

	XML_PARSER_ENTITY_VALUE = 11,

	XML_PARSER_ATTRIBUTE_VALUE = 12,

	XML_PARSER_SYSTEM_LITERAL = 13,

	XML_PARSER_EPILOG = 14,

	XML_PARSER_IGNORE = 15,

	XML_PARSER_PUBLIC_LITERAL = 16
}

declare var xmlParserMaxDepth: number;

declare const enum xmlParserMode {

	XML_PARSE_UNKNOWN = 0,

	XML_PARSE_DOM = 1,

	XML_PARSE_SAX = 2,

	XML_PARSE_PUSH_DOM = 3,

	XML_PARSE_PUSH_SAX = 4,

	XML_PARSE_READER = 5
}

declare const enum xmlParserOption {

	XML_PARSE_RECOVER = 1,

	XML_PARSE_NOENT = 2,

	XML_PARSE_DTDLOAD = 4,

	XML_PARSE_DTDATTR = 8,

	XML_PARSE_DTDVALID = 16,

	XML_PARSE_NOERROR = 32,

	XML_PARSE_NOWARNING = 64,

	XML_PARSE_PEDANTIC = 128,

	XML_PARSE_NOBLANKS = 256,

	XML_PARSE_SAX1 = 512,

	XML_PARSE_XINCLUDE = 1024,

	XML_PARSE_NONET = 2048,

	XML_PARSE_NODICT = 4096,

	XML_PARSE_NSCLEAN = 8192,

	XML_PARSE_NOCDATA = 16384,

	XML_PARSE_NOXINCNODE = 32768,

	XML_PARSE_COMPACT = 65536,

	XML_PARSE_OLD10 = 131072,

	XML_PARSE_NOBASEFIX = 262144,

	XML_PARSE_HUGE = 524288,

	XML_PARSE_OLDSAX = 1048576,

	XML_PARSE_IGNORE_ENC = 2097152,

	XML_PARSE_BIG_LINES = 4194304
}

declare function xmlParserPrintFileContext(input: interop.Pointer | interop.Reference<_xmlParserInput>): void;

declare function xmlParserPrintFileInfo(input: interop.Pointer | interop.Reference<_xmlParserInput>): void;

declare const enum xmlParserProperties {

	XML_PARSER_LOADDTD = 1,

	XML_PARSER_DEFAULTATTRS = 2,

	XML_PARSER_VALIDATE = 3,

	XML_PARSER_SUBST_ENTITIES = 4
}

declare const enum xmlParserSeverities {

	XML_PARSER_SEVERITY_VALIDITY_WARNING = 1,

	XML_PARSER_SEVERITY_VALIDITY_ERROR = 2,

	XML_PARSER_SEVERITY_WARNING = 3,

	XML_PARSER_SEVERITY_ERROR = 4
}

declare function xmlPathToURI(path: string | interop.Pointer | interop.Reference<any>): string;

declare const enum xmlPatternFlags {

	XML_PATTERN_DEFAULT = 0,

	XML_PATTERN_XPATH = 1,

	XML_PATTERN_XSSEL = 2,

	XML_PATTERN_XSFIELD = 4
}

declare function xmlPatternFromRoot(comp: interop.Pointer | interop.Reference<any>): number;

declare function xmlPatternGetStreamCtxt(comp: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlPatternMatch(comp: interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlPatternMaxDepth(comp: interop.Pointer | interop.Reference<any>): number;

declare function xmlPatternMinDepth(comp: interop.Pointer | interop.Reference<any>): number;

declare function xmlPatternStreamable(comp: interop.Pointer | interop.Reference<any>): number;

declare function xmlPatterncompile(pattern: string | interop.Pointer | interop.Reference<any>, dict: interop.Pointer | interop.Reference<any>, flags: number, namespaces: interop.Pointer | interop.Reference<string>): interop.Pointer | interop.Reference<any>;

declare function xmlPedanticParserDefault(val: number): number;

declare function xmlPopInput(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function xmlPopInputCallbacks(): number;

declare function xmlPreviousElementSibling(node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlPrintURI(stream: interop.Pointer | interop.Reference<FILE>, uri: interop.Pointer | interop.Reference<_xmlURI>): void;

declare function xmlPushInput(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, input: interop.Pointer | interop.Reference<_xmlParserInput>): number;

declare function xmlRMutexLock(tok: interop.Pointer | interop.Reference<any>): void;

declare function xmlRMutexUnlock(tok: interop.Pointer | interop.Reference<any>): void;

declare function xmlReadDoc(cur: string | interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlReadFd(fd: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlReadFile(URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlReadIO(ioread: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, ioclose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ioctx: interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlReadMemory(buffer: string | interop.Pointer | interop.Reference<any>, size: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlReaderForDoc(cur: string | interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare function xmlReaderForFd(fd: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare function xmlReaderForFile(filename: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare function xmlReaderForIO(ioread: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, ioclose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ioctx: interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare function xmlReaderForMemory(buffer: string | interop.Pointer | interop.Reference<any>, size: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare function xmlReaderNewDoc(reader: interop.Pointer | interop.Reference<any>, cur: string | interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): number;

declare function xmlReaderNewFd(reader: interop.Pointer | interop.Reference<any>, fd: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): number;

declare function xmlReaderNewFile(reader: interop.Pointer | interop.Reference<any>, filename: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): number;

declare function xmlReaderNewIO(reader: interop.Pointer | interop.Reference<any>, ioread: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, ioclose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ioctx: interop.Pointer | interop.Reference<any>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): number;

declare function xmlReaderNewMemory(reader: interop.Pointer | interop.Reference<any>, buffer: string | interop.Pointer | interop.Reference<any>, size: number, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): number;

declare function xmlReaderNewWalker(reader: interop.Pointer | interop.Reference<any>, doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare const enum xmlReaderTypes {

	XML_READER_TYPE_NONE = 0,

	XML_READER_TYPE_ELEMENT = 1,

	XML_READER_TYPE_ATTRIBUTE = 2,

	XML_READER_TYPE_TEXT = 3,

	XML_READER_TYPE_CDATA = 4,

	XML_READER_TYPE_ENTITY_REFERENCE = 5,

	XML_READER_TYPE_ENTITY = 6,

	XML_READER_TYPE_PROCESSING_INSTRUCTION = 7,

	XML_READER_TYPE_COMMENT = 8,

	XML_READER_TYPE_DOCUMENT = 9,

	XML_READER_TYPE_DOCUMENT_TYPE = 10,

	XML_READER_TYPE_DOCUMENT_FRAGMENT = 11,

	XML_READER_TYPE_NOTATION = 12,

	XML_READER_TYPE_WHITESPACE = 13,

	XML_READER_TYPE_SIGNIFICANT_WHITESPACE = 14,

	XML_READER_TYPE_END_ELEMENT = 15,

	XML_READER_TYPE_END_ENTITY = 16,

	XML_READER_TYPE_XML_DECLARATION = 17
}

declare function xmlReaderWalker(doc: interop.Pointer | interop.Reference<_xmlDoc>): interop.Pointer | interop.Reference<any>;

declare var xmlRealloc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => interop.Pointer | interop.Reference<any>>;

declare function xmlReallocLoc(ptr: interop.Pointer | interop.Reference<any>, size: number, file: string | interop.Pointer | interop.Reference<any>, line: number): interop.Pointer | interop.Reference<any>;

declare function xmlReconciliateNs(doc: interop.Pointer | interop.Reference<_xmlDoc>, tree: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlRecoverDoc(cur: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlRecoverFile(filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlRecoverMemory(buffer: string | interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlRegExecErrInfo(exec: interop.Pointer | interop.Reference<any>, string: interop.Pointer | interop.Reference<string>, nbval: interop.Pointer | interop.Reference<number>, nbneg: interop.Pointer | interop.Reference<number>, values: interop.Pointer | interop.Reference<string>, terminal: interop.Pointer | interop.Reference<number>): number;

declare function xmlRegExecNextValues(exec: interop.Pointer | interop.Reference<any>, nbval: interop.Pointer | interop.Reference<number>, nbneg: interop.Pointer | interop.Reference<number>, values: interop.Pointer | interop.Reference<string>, terminal: interop.Pointer | interop.Reference<number>): number;

declare function xmlRegExecPushString(exec: interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlRegExecPushString2(exec: interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>, value2: string | interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlRegFreeExecCtxt(exec: interop.Pointer | interop.Reference<any>): void;

declare function xmlRegFreeRegexp(regexp: interop.Pointer | interop.Reference<any>): void;

declare function xmlRegNewExecCtxt(comp: interop.Pointer | interop.Reference<any>, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>) => void>, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlRegexpCompile(regexp: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlRegexpExec(comp: interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlRegexpIsDeterminist(comp: interop.Pointer | interop.Reference<any>): number;

declare function xmlRegexpPrint(output: interop.Pointer | interop.Reference<FILE>, regexp: interop.Pointer | interop.Reference<any>): void;

declare function xmlRegisterCharEncodingHandler(handler: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>): void;

declare function xmlRegisterDefaultInputCallbacks(): void;

declare function xmlRegisterDefaultOutputCallbacks(): void;

declare function xmlRegisterHTTPPostCallbacks(): void;

declare function xmlRegisterInputCallbacks(matchFunc: interop.FunctionReference<(p1: string) => number>, openFunc: interop.FunctionReference<(p1: string) => interop.Pointer | interop.Reference<any>>, readFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, closeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>): number;

declare function xmlRegisterNodeDefault(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>;

declare function xmlRegisterOutputCallbacks(matchFunc: interop.FunctionReference<(p1: string) => number>, openFunc: interop.FunctionReference<(p1: string) => interop.Pointer | interop.Reference<any>>, writeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, closeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>): number;

declare function xmlRelaxNGCleanupTypes(): void;

declare function xmlRelaxNGDump(output: interop.Pointer | interop.Reference<FILE>, schema: interop.Pointer | interop.Reference<any>): void;

declare function xmlRelaxNGDumpTree(output: interop.Pointer | interop.Reference<FILE>, schema: interop.Pointer | interop.Reference<any>): void;

declare function xmlRelaxNGFree(schema: interop.Pointer | interop.Reference<any>): void;

declare function xmlRelaxNGFreeParserCtxt(ctxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlRelaxNGFreeValidCtxt(ctxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlRelaxNGGetParserErrors(ctxt: interop.Pointer | interop.Reference<any>, err: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>>, warn: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>>, ctx: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function xmlRelaxNGGetValidErrors(ctxt: interop.Pointer | interop.Reference<any>, err: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>>, warn: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>>, ctx: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function xmlRelaxNGInitTypes(): number;

declare function xmlRelaxNGNewDocParserCtxt(doc: interop.Pointer | interop.Reference<_xmlDoc>): interop.Pointer | interop.Reference<any>;

declare function xmlRelaxNGNewMemParserCtxt(buffer: string | interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<any>;

declare function xmlRelaxNGNewParserCtxt(URL: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlRelaxNGNewValidCtxt(schema: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlRelaxNGParse(ctxt: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare const enum xmlRelaxNGParserFlag {

	XML_RELAXNGP_NONE = 0,

	XML_RELAXNGP_FREE_DOC = 1,

	XML_RELAXNGP_CRNG = 2
}

declare function xmlRelaxNGSetParserErrors(ctxt: interop.Pointer | interop.Reference<any>, err: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>, warn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>, ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlRelaxNGSetParserStructuredErrors(ctxt: interop.Pointer | interop.Reference<any>, serror: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>, ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlRelaxNGSetValidErrors(ctxt: interop.Pointer | interop.Reference<any>, err: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>, warn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>, ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlRelaxNGSetValidStructuredErrors(ctxt: interop.Pointer | interop.Reference<any>, serror: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>, ctx: interop.Pointer | interop.Reference<any>): void;

declare const enum xmlRelaxNGValidErr {

	XML_RELAXNG_OK = 0,

	XML_RELAXNG_ERR_MEMORY = 1,

	XML_RELAXNG_ERR_TYPE = 2,

	XML_RELAXNG_ERR_TYPEVAL = 3,

	XML_RELAXNG_ERR_DUPID = 4,

	XML_RELAXNG_ERR_TYPECMP = 5,

	XML_RELAXNG_ERR_NOSTATE = 6,

	XML_RELAXNG_ERR_NODEFINE = 7,

	XML_RELAXNG_ERR_LISTEXTRA = 8,

	XML_RELAXNG_ERR_LISTEMPTY = 9,

	XML_RELAXNG_ERR_INTERNODATA = 10,

	XML_RELAXNG_ERR_INTERSEQ = 11,

	XML_RELAXNG_ERR_INTEREXTRA = 12,

	XML_RELAXNG_ERR_ELEMNAME = 13,

	XML_RELAXNG_ERR_ATTRNAME = 14,

	XML_RELAXNG_ERR_ELEMNONS = 15,

	XML_RELAXNG_ERR_ATTRNONS = 16,

	XML_RELAXNG_ERR_ELEMWRONGNS = 17,

	XML_RELAXNG_ERR_ATTRWRONGNS = 18,

	XML_RELAXNG_ERR_ELEMEXTRANS = 19,

	XML_RELAXNG_ERR_ATTREXTRANS = 20,

	XML_RELAXNG_ERR_ELEMNOTEMPTY = 21,

	XML_RELAXNG_ERR_NOELEM = 22,

	XML_RELAXNG_ERR_NOTELEM = 23,

	XML_RELAXNG_ERR_ATTRVALID = 24,

	XML_RELAXNG_ERR_CONTENTVALID = 25,

	XML_RELAXNG_ERR_EXTRACONTENT = 26,

	XML_RELAXNG_ERR_INVALIDATTR = 27,

	XML_RELAXNG_ERR_DATAELEM = 28,

	XML_RELAXNG_ERR_VALELEM = 29,

	XML_RELAXNG_ERR_LISTELEM = 30,

	XML_RELAXNG_ERR_DATATYPE = 31,

	XML_RELAXNG_ERR_VALUE = 32,

	XML_RELAXNG_ERR_LIST = 33,

	XML_RELAXNG_ERR_NOGRAMMAR = 34,

	XML_RELAXNG_ERR_EXTRADATA = 35,

	XML_RELAXNG_ERR_LACKDATA = 36,

	XML_RELAXNG_ERR_INTERNAL = 37,

	XML_RELAXNG_ERR_ELEMWRONG = 38,

	XML_RELAXNG_ERR_TEXTWRONG = 39
}

declare function xmlRelaxNGValidateDoc(ctxt: interop.Pointer | interop.Reference<any>, doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlRelaxNGValidateFullElement(ctxt: interop.Pointer | interop.Reference<any>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlRelaxNGValidatePopElement(ctxt: interop.Pointer | interop.Reference<any>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlRelaxNGValidatePushCData(ctxt: interop.Pointer | interop.Reference<any>, data: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlRelaxNGValidatePushElement(ctxt: interop.Pointer | interop.Reference<any>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlRelaxParserSetFlag(ctxt: interop.Pointer | interop.Reference<any>, flag: number): number;

declare function xmlRemoveID(doc: interop.Pointer | interop.Reference<_xmlDoc>, attr: interop.Pointer | interop.Reference<_xmlAttr>): number;

declare function xmlRemoveProp(cur: interop.Pointer | interop.Reference<_xmlAttr>): number;

declare function xmlRemoveRef(doc: interop.Pointer | interop.Reference<_xmlDoc>, attr: interop.Pointer | interop.Reference<_xmlAttr>): number;

declare function xmlReplaceNode(old: interop.Pointer | interop.Reference<_xmlNode>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlResetError(err: interop.Pointer | interop.Reference<_xmlError>): void;

declare function xmlResetLastError(): void;

declare function xmlSAX2AttributeDecl(ctx: interop.Pointer | interop.Reference<any>, elem: string | interop.Pointer | interop.Reference<any>, fullname: string | interop.Pointer | interop.Reference<any>, type: number, def: number, defaultValue: string | interop.Pointer | interop.Reference<any>, tree: interop.Pointer | interop.Reference<_xmlEnumeration>): void;

declare function xmlSAX2CDataBlock(ctx: interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>, len: number): void;

declare function xmlSAX2Characters(ctx: interop.Pointer | interop.Reference<any>, ch: string | interop.Pointer | interop.Reference<any>, len: number): void;

declare function xmlSAX2Comment(ctx: interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2ElementDecl(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, type: number, content: interop.Pointer | interop.Reference<_xmlElementContent>): void;

declare function xmlSAX2EndDocument(ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2EndElement(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2EndElementNs(ctx: interop.Pointer | interop.Reference<any>, localname: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>, URI: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2EntityDecl(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, type: number, publicId: string | interop.Pointer | interop.Reference<any>, systemId: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2ExternalSubset(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2GetColumnNumber(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlSAX2GetEntity(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function xmlSAX2GetLineNumber(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlSAX2GetParameterEntity(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlEntity>;

declare function xmlSAX2GetPublicId(ctx: interop.Pointer | interop.Reference<any>): string;

declare function xmlSAX2GetSystemId(ctx: interop.Pointer | interop.Reference<any>): string;

declare function xmlSAX2HasExternalSubset(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlSAX2HasInternalSubset(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlSAX2IgnorableWhitespace(ctx: interop.Pointer | interop.Reference<any>, ch: string | interop.Pointer | interop.Reference<any>, len: number): void;

declare function xmlSAX2InitDefaultSAXHandler(hdlr: interop.Pointer | interop.Reference<_xmlSAXHandler>, warning: number): void;

declare function xmlSAX2InitDocbDefaultSAXHandler(hdlr: interop.Pointer | interop.Reference<_xmlSAXHandler>): void;

declare function xmlSAX2InitHtmlDefaultSAXHandler(hdlr: interop.Pointer | interop.Reference<_xmlSAXHandler>): void;

declare function xmlSAX2InternalSubset(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2IsStandalone(ctx: interop.Pointer | interop.Reference<any>): number;

declare function xmlSAX2NotationDecl(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, publicId: string | interop.Pointer | interop.Reference<any>, systemId: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2ProcessingInstruction(ctx: interop.Pointer | interop.Reference<any>, target: string | interop.Pointer | interop.Reference<any>, data: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2Reference(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2ResolveEntity(ctx: interop.Pointer | interop.Reference<any>, publicId: string | interop.Pointer | interop.Reference<any>, systemId: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserInput>;

declare function xmlSAX2SetDocumentLocator(ctx: interop.Pointer | interop.Reference<any>, loc: interop.Pointer | interop.Reference<_xmlSAXLocator>): void;

declare function xmlSAX2StartDocument(ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlSAX2StartElement(ctx: interop.Pointer | interop.Reference<any>, fullname: string | interop.Pointer | interop.Reference<any>, atts: interop.Pointer | interop.Reference<string>): void;

declare function xmlSAX2StartElementNs(ctx: interop.Pointer | interop.Reference<any>, localname: string | interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>, URI: string | interop.Pointer | interop.Reference<any>, nb_namespaces: number, namespaces: interop.Pointer | interop.Reference<string>, nb_attributes: number, nb_defaulted: number, attributes: interop.Pointer | interop.Reference<string>): void;

declare function xmlSAX2UnparsedEntityDecl(ctx: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, publicId: string | interop.Pointer | interop.Reference<any>, systemId: string | interop.Pointer | interop.Reference<any>, notationName: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSAXDefaultVersion(version: number): number;

declare function xmlSAXParseDTD(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, ExternalID: string | interop.Pointer | interop.Reference<any>, SystemID: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDtd>;

declare function xmlSAXParseDoc(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, cur: string | interop.Pointer | interop.Reference<any>, recovery: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlSAXParseEntity(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, filename: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlSAXParseFile(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, filename: string | interop.Pointer | interop.Reference<any>, recovery: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlSAXParseFileWithData(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, filename: string | interop.Pointer | interop.Reference<any>, recovery: number, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlSAXParseMemory(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, buffer: string | interop.Pointer | interop.Reference<any>, size: number, recovery: number): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlSAXParseMemoryWithData(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, buffer: string | interop.Pointer | interop.Reference<any>, size: number, recovery: number, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlSAXUserParseFile(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, user_data: interop.Pointer | interop.Reference<any>, filename: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlSAXUserParseMemory(sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, user_data: interop.Pointer | interop.Reference<any>, buffer: string | interop.Pointer | interop.Reference<any>, size: number): number;

declare function xmlSAXVersion(hdlr: interop.Pointer | interop.Reference<_xmlSAXHandler>, version: number): number;

declare function xmlSaveClose(ctxt: interop.Pointer | interop.Reference<any>): number;

declare function xmlSaveDoc(ctxt: interop.Pointer | interop.Reference<any>, doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlSaveFile(filename: string | interop.Pointer | interop.Reference<any>, cur: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlSaveFileEnc(filename: string | interop.Pointer | interop.Reference<any>, cur: interop.Pointer | interop.Reference<_xmlDoc>, encoding: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlSaveFileTo(buf: interop.Pointer | interop.Reference<_xmlOutputBuffer>, cur: interop.Pointer | interop.Reference<_xmlDoc>, encoding: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlSaveFlush(ctxt: interop.Pointer | interop.Reference<any>): number;

declare function xmlSaveFormatFile(filename: string | interop.Pointer | interop.Reference<any>, cur: interop.Pointer | interop.Reference<_xmlDoc>, format: number): number;

declare function xmlSaveFormatFileEnc(filename: string | interop.Pointer | interop.Reference<any>, cur: interop.Pointer | interop.Reference<_xmlDoc>, encoding: string | interop.Pointer | interop.Reference<any>, format: number): number;

declare function xmlSaveFormatFileTo(buf: interop.Pointer | interop.Reference<_xmlOutputBuffer>, cur: interop.Pointer | interop.Reference<_xmlDoc>, encoding: string | interop.Pointer | interop.Reference<any>, format: number): number;

declare const enum xmlSaveOption {

	XML_SAVE_FORMAT = 1,

	XML_SAVE_NO_DECL = 2,

	XML_SAVE_NO_EMPTY = 4,

	XML_SAVE_NO_XHTML = 8,

	XML_SAVE_XHTML = 16,

	XML_SAVE_AS_XML = 32,

	XML_SAVE_AS_HTML = 64,

	XML_SAVE_WSNONSIG = 128
}

declare function xmlSaveSetAttrEscape(ctxt: interop.Pointer | interop.Reference<any>, escape: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<number>, p3: string, p4: interop.Pointer | interop.Reference<number>) => number>): number;

declare function xmlSaveSetEscape(ctxt: interop.Pointer | interop.Reference<any>, escape: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<number>, p3: string, p4: interop.Pointer | interop.Reference<number>) => number>): number;

declare function xmlSaveToBuffer(buffer: interop.Pointer | interop.Reference<_xmlBuffer>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare function xmlSaveToFd(fd: number, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare function xmlSaveToFilename(filename: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare function xmlSaveToIO(iowrite: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: number) => number>, ioclose: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, ioctx: interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare function xmlSaveTree(ctxt: interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlSaveUri(uri: interop.Pointer | interop.Reference<_xmlURI>): string;

declare function xmlScanName(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): string;

declare function xmlSchemaCheckFacet(facet: interop.Pointer | interop.Reference<_xmlSchemaFacet>, typeDecl: interop.Pointer | interop.Reference<_xmlSchemaType>, ctxt: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlSchemaCleanupTypes(): void;

declare function xmlSchemaCollapseString(value: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlSchemaCompareValues(x: interop.Pointer | interop.Reference<any>, y: interop.Pointer | interop.Reference<any>): number;

declare function xmlSchemaCompareValuesWhtsp(x: interop.Pointer | interop.Reference<any>, xws: xmlSchemaWhitespaceValueType, y: interop.Pointer | interop.Reference<any>, yws: xmlSchemaWhitespaceValueType): number;

declare const enum xmlSchemaContentType {

	XML_SCHEMA_CONTENT_UNKNOWN = 0,

	XML_SCHEMA_CONTENT_EMPTY = 1,

	XML_SCHEMA_CONTENT_ELEMENTS = 2,

	XML_SCHEMA_CONTENT_MIXED = 3,

	XML_SCHEMA_CONTENT_SIMPLE = 4,

	XML_SCHEMA_CONTENT_MIXED_OR_ELEMENTS = 5,

	XML_SCHEMA_CONTENT_BASIC = 6,

	XML_SCHEMA_CONTENT_ANY = 7
}

declare function xmlSchemaCopyValue(val: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlSchemaDump(output: interop.Pointer | interop.Reference<FILE>, schema: interop.Pointer | interop.Reference<_xmlSchema>): void;

declare function xmlSchemaFree(schema: interop.Pointer | interop.Reference<_xmlSchema>): void;

declare function xmlSchemaFreeFacet(facet: interop.Pointer | interop.Reference<_xmlSchemaFacet>): void;

declare function xmlSchemaFreeParserCtxt(ctxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlSchemaFreeType(type: interop.Pointer | interop.Reference<_xmlSchemaType>): void;

declare function xmlSchemaFreeValidCtxt(ctxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlSchemaFreeValue(val: interop.Pointer | interop.Reference<any>): void;

declare function xmlSchemaFreeWildcard(wildcard: interop.Pointer | interop.Reference<_xmlSchemaWildcard>): void;

declare function xmlSchemaGetBuiltInListSimpleTypeItemType(type: interop.Pointer | interop.Reference<_xmlSchemaType>): interop.Pointer | interop.Reference<_xmlSchemaType>;

declare function xmlSchemaGetBuiltInType(type: xmlSchemaValType): interop.Pointer | interop.Reference<_xmlSchemaType>;

declare function xmlSchemaGetCanonValue(val: interop.Pointer | interop.Reference<any>, retValue: interop.Pointer | interop.Reference<string>): number;

declare function xmlSchemaGetCanonValueWhtsp(val: interop.Pointer | interop.Reference<any>, retValue: interop.Pointer | interop.Reference<string>, ws: xmlSchemaWhitespaceValueType): number;

declare function xmlSchemaGetFacetValueAsULong(facet: interop.Pointer | interop.Reference<_xmlSchemaFacet>): number;

declare function xmlSchemaGetParserErrors(ctxt: interop.Pointer | interop.Reference<any>, err: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>>, warn: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>>, ctx: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function xmlSchemaGetPredefinedType(name: string | interop.Pointer | interop.Reference<any>, ns: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlSchemaType>;

declare function xmlSchemaGetValType(val: interop.Pointer | interop.Reference<any>): xmlSchemaValType;

declare function xmlSchemaGetValidErrors(ctxt: interop.Pointer | interop.Reference<any>, err: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>>, warn: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>>, ctx: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function xmlSchemaInitTypes(): void;

declare function xmlSchemaIsBuiltInTypeFacet(type: interop.Pointer | interop.Reference<_xmlSchemaType>, facetType: number): number;

declare function xmlSchemaIsValid(ctxt: interop.Pointer | interop.Reference<any>): number;

declare function xmlSchemaNewDocParserCtxt(doc: interop.Pointer | interop.Reference<_xmlDoc>): interop.Pointer | interop.Reference<any>;

declare function xmlSchemaNewFacet(): interop.Pointer | interop.Reference<_xmlSchemaFacet>;

declare function xmlSchemaNewMemParserCtxt(buffer: string | interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<any>;

declare function xmlSchemaNewNOTATIONValue(name: string | interop.Pointer | interop.Reference<any>, ns: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlSchemaNewParserCtxt(URL: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlSchemaNewQNameValue(namespaceName: string | interop.Pointer | interop.Reference<any>, localName: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlSchemaNewStringValue(type: xmlSchemaValType, value: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlSchemaNewValidCtxt(schema: interop.Pointer | interop.Reference<_xmlSchema>): interop.Pointer | interop.Reference<any>;

declare function xmlSchemaParse(ctxt: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlSchema>;

declare function xmlSchemaSAXPlug(ctxt: interop.Pointer | interop.Reference<any>, sax: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlSAXHandler>>, user_data: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function xmlSchemaSAXUnplug(plug: interop.Pointer | interop.Reference<any>): number;

declare function xmlSchemaSetParserErrors(ctxt: interop.Pointer | interop.Reference<any>, err: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>, warn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>, ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlSchemaSetParserStructuredErrors(ctxt: interop.Pointer | interop.Reference<any>, serror: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>, ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlSchemaSetValidErrors(ctxt: interop.Pointer | interop.Reference<any>, err: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>, warn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>, ctx: interop.Pointer | interop.Reference<any>): void;

declare function xmlSchemaSetValidOptions(ctxt: interop.Pointer | interop.Reference<any>, options: number): number;

declare function xmlSchemaSetValidStructuredErrors(ctxt: interop.Pointer | interop.Reference<any>, serror: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>, ctx: interop.Pointer | interop.Reference<any>): void;

declare const enum xmlSchemaTypeType {

	XML_SCHEMA_TYPE_BASIC = 1,

	XML_SCHEMA_TYPE_ANY = 2,

	XML_SCHEMA_TYPE_FACET = 3,

	XML_SCHEMA_TYPE_SIMPLE = 4,

	XML_SCHEMA_TYPE_COMPLEX = 5,

	XML_SCHEMA_TYPE_SEQUENCE = 6,

	XML_SCHEMA_TYPE_CHOICE = 7,

	XML_SCHEMA_TYPE_ALL = 8,

	XML_SCHEMA_TYPE_SIMPLE_CONTENT = 9,

	XML_SCHEMA_TYPE_COMPLEX_CONTENT = 10,

	XML_SCHEMA_TYPE_UR = 11,

	XML_SCHEMA_TYPE_RESTRICTION = 12,

	XML_SCHEMA_TYPE_EXTENSION = 13,

	XML_SCHEMA_TYPE_ELEMENT = 14,

	XML_SCHEMA_TYPE_ATTRIBUTE = 15,

	XML_SCHEMA_TYPE_ATTRIBUTEGROUP = 16,

	XML_SCHEMA_TYPE_GROUP = 17,

	XML_SCHEMA_TYPE_NOTATION = 18,

	XML_SCHEMA_TYPE_LIST = 19,

	XML_SCHEMA_TYPE_UNION = 20,

	XML_SCHEMA_TYPE_ANY_ATTRIBUTE = 21,

	XML_SCHEMA_TYPE_IDC_UNIQUE = 22,

	XML_SCHEMA_TYPE_IDC_KEY = 23,

	XML_SCHEMA_TYPE_IDC_KEYREF = 24,

	XML_SCHEMA_TYPE_PARTICLE = 25,

	XML_SCHEMA_TYPE_ATTRIBUTE_USE = 26,

	XML_SCHEMA_FACET_MININCLUSIVE = 1000,

	XML_SCHEMA_FACET_MINEXCLUSIVE = 1001,

	XML_SCHEMA_FACET_MAXINCLUSIVE = 1002,

	XML_SCHEMA_FACET_MAXEXCLUSIVE = 1003,

	XML_SCHEMA_FACET_TOTALDIGITS = 1004,

	XML_SCHEMA_FACET_FRACTIONDIGITS = 1005,

	XML_SCHEMA_FACET_PATTERN = 1006,

	XML_SCHEMA_FACET_ENUMERATION = 1007,

	XML_SCHEMA_FACET_WHITESPACE = 1008,

	XML_SCHEMA_FACET_LENGTH = 1009,

	XML_SCHEMA_FACET_MAXLENGTH = 1010,

	XML_SCHEMA_FACET_MINLENGTH = 1011,

	XML_SCHEMA_EXTRA_QNAMEREF = 2000,

	XML_SCHEMA_EXTRA_ATTR_USE_PROHIB = 2001
}

declare function xmlSchemaValPredefTypeNode(type: interop.Pointer | interop.Reference<_xmlSchemaType>, value: string | interop.Pointer | interop.Reference<any>, val: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlSchemaValPredefTypeNodeNoNorm(type: interop.Pointer | interop.Reference<_xmlSchemaType>, value: string | interop.Pointer | interop.Reference<any>, val: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare const enum xmlSchemaValType {

	XML_SCHEMAS_UNKNOWN = 0,

	XML_SCHEMAS_STRING = 1,

	XML_SCHEMAS_NORMSTRING = 2,

	XML_SCHEMAS_DECIMAL = 3,

	XML_SCHEMAS_TIME = 4,

	XML_SCHEMAS_GDAY = 5,

	XML_SCHEMAS_GMONTH = 6,

	XML_SCHEMAS_GMONTHDAY = 7,

	XML_SCHEMAS_GYEAR = 8,

	XML_SCHEMAS_GYEARMONTH = 9,

	XML_SCHEMAS_DATE = 10,

	XML_SCHEMAS_DATETIME = 11,

	XML_SCHEMAS_DURATION = 12,

	XML_SCHEMAS_FLOAT = 13,

	XML_SCHEMAS_DOUBLE = 14,

	XML_SCHEMAS_BOOLEAN = 15,

	XML_SCHEMAS_TOKEN = 16,

	XML_SCHEMAS_LANGUAGE = 17,

	XML_SCHEMAS_NMTOKEN = 18,

	XML_SCHEMAS_NMTOKENS = 19,

	XML_SCHEMAS_NAME = 20,

	XML_SCHEMAS_QNAME = 21,

	XML_SCHEMAS_NCNAME = 22,

	XML_SCHEMAS_ID = 23,

	XML_SCHEMAS_IDREF = 24,

	XML_SCHEMAS_IDREFS = 25,

	XML_SCHEMAS_ENTITY = 26,

	XML_SCHEMAS_ENTITIES = 27,

	XML_SCHEMAS_NOTATION = 28,

	XML_SCHEMAS_ANYURI = 29,

	XML_SCHEMAS_INTEGER = 30,

	XML_SCHEMAS_NPINTEGER = 31,

	XML_SCHEMAS_NINTEGER = 32,

	XML_SCHEMAS_NNINTEGER = 33,

	XML_SCHEMAS_PINTEGER = 34,

	XML_SCHEMAS_INT = 35,

	XML_SCHEMAS_UINT = 36,

	XML_SCHEMAS_LONG = 37,

	XML_SCHEMAS_ULONG = 38,

	XML_SCHEMAS_SHORT = 39,

	XML_SCHEMAS_USHORT = 40,

	XML_SCHEMAS_BYTE = 41,

	XML_SCHEMAS_UBYTE = 42,

	XML_SCHEMAS_HEXBINARY = 43,

	XML_SCHEMAS_BASE64BINARY = 44,

	XML_SCHEMAS_ANYTYPE = 45,

	XML_SCHEMAS_ANYSIMPLETYPE = 46
}

declare function xmlSchemaValidCtxtGetOptions(ctxt: interop.Pointer | interop.Reference<any>): number;

declare function xmlSchemaValidCtxtGetParserCtxt(ctxt: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserCtxt>;

declare const enum xmlSchemaValidError {

	XML_SCHEMAS_ERR_OK = 0,

	XML_SCHEMAS_ERR_NOROOT = 1,

	XML_SCHEMAS_ERR_UNDECLAREDELEM = 2,

	XML_SCHEMAS_ERR_NOTTOPLEVEL = 3,

	XML_SCHEMAS_ERR_MISSING = 4,

	XML_SCHEMAS_ERR_WRONGELEM = 5,

	XML_SCHEMAS_ERR_NOTYPE = 6,

	XML_SCHEMAS_ERR_NOROLLBACK = 7,

	XML_SCHEMAS_ERR_ISABSTRACT = 8,

	XML_SCHEMAS_ERR_NOTEMPTY = 9,

	XML_SCHEMAS_ERR_ELEMCONT = 10,

	XML_SCHEMAS_ERR_HAVEDEFAULT = 11,

	XML_SCHEMAS_ERR_NOTNILLABLE = 12,

	XML_SCHEMAS_ERR_EXTRACONTENT = 13,

	XML_SCHEMAS_ERR_INVALIDATTR = 14,

	XML_SCHEMAS_ERR_INVALIDELEM = 15,

	XML_SCHEMAS_ERR_NOTDETERMINIST = 16,

	XML_SCHEMAS_ERR_CONSTRUCT = 17,

	XML_SCHEMAS_ERR_INTERNAL = 18,

	XML_SCHEMAS_ERR_NOTSIMPLE = 19,

	XML_SCHEMAS_ERR_ATTRUNKNOWN = 20,

	XML_SCHEMAS_ERR_ATTRINVALID = 21,

	XML_SCHEMAS_ERR_VALUE = 22,

	XML_SCHEMAS_ERR_FACET = 23,

	XML_SCHEMAS_ERR_ = 24,

	XML_SCHEMAS_ERR_XXX = 25
}

declare const enum xmlSchemaValidOption {

	XML_SCHEMA_VAL_VC_I_CREATE = 1
}

declare function xmlSchemaValidateDoc(ctxt: interop.Pointer | interop.Reference<any>, instance: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlSchemaValidateFacet(base: interop.Pointer | interop.Reference<_xmlSchemaType>, facet: interop.Pointer | interop.Reference<_xmlSchemaFacet>, value: string | interop.Pointer | interop.Reference<any>, val: interop.Pointer | interop.Reference<any>): number;

declare function xmlSchemaValidateFacetWhtsp(facet: interop.Pointer | interop.Reference<_xmlSchemaFacet>, fws: xmlSchemaWhitespaceValueType, valType: xmlSchemaValType, value: string | interop.Pointer | interop.Reference<any>, val: interop.Pointer | interop.Reference<any>, ws: xmlSchemaWhitespaceValueType): number;

declare function xmlSchemaValidateFile(ctxt: interop.Pointer | interop.Reference<any>, filename: string | interop.Pointer | interop.Reference<any>, options: number): number;

declare function xmlSchemaValidateLengthFacet(type: interop.Pointer | interop.Reference<_xmlSchemaType>, facet: interop.Pointer | interop.Reference<_xmlSchemaFacet>, value: string | interop.Pointer | interop.Reference<any>, val: interop.Pointer | interop.Reference<any>, length: interop.Pointer | interop.Reference<number>): number;

declare function xmlSchemaValidateLengthFacetWhtsp(facet: interop.Pointer | interop.Reference<_xmlSchemaFacet>, valType: xmlSchemaValType, value: string | interop.Pointer | interop.Reference<any>, val: interop.Pointer | interop.Reference<any>, length: interop.Pointer | interop.Reference<number>, ws: xmlSchemaWhitespaceValueType): number;

declare function xmlSchemaValidateListSimpleTypeFacet(facet: interop.Pointer | interop.Reference<_xmlSchemaFacet>, value: string | interop.Pointer | interop.Reference<any>, actualLen: number, expectedLen: interop.Pointer | interop.Reference<number>): number;

declare function xmlSchemaValidateOneElement(ctxt: interop.Pointer | interop.Reference<any>, elem: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlSchemaValidatePredefinedType(type: interop.Pointer | interop.Reference<_xmlSchemaType>, value: string | interop.Pointer | interop.Reference<any>, val: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function xmlSchemaValidateSetFilename(vctxt: interop.Pointer | interop.Reference<any>, filename: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlSchemaValidateSetLocator(vctxt: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<string>, p3: interop.Pointer | interop.Reference<number>) => number>, ctxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlSchemaValidateStream(ctxt: interop.Pointer | interop.Reference<any>, input: interop.Pointer | interop.Reference<_xmlParserInputBuffer>, enc: xmlCharEncoding, sax: interop.Pointer | interop.Reference<_xmlSAXHandler>, user_data: interop.Pointer | interop.Reference<any>): number;

declare function xmlSchemaValueAppend(prev: interop.Pointer | interop.Reference<any>, cur: interop.Pointer | interop.Reference<any>): number;

declare function xmlSchemaValueGetAsBoolean(val: interop.Pointer | interop.Reference<any>): number;

declare function xmlSchemaValueGetAsString(val: interop.Pointer | interop.Reference<any>): string;

declare function xmlSchemaValueGetNext(cur: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlSchemaWhiteSpaceReplace(value: string | interop.Pointer | interop.Reference<any>): string;

declare const enum xmlSchemaWhitespaceValueType {

	XML_SCHEMA_WHITESPACE_UNKNOWN = 0,

	XML_SCHEMA_WHITESPACE_PRESERVE = 1,

	XML_SCHEMA_WHITESPACE_REPLACE = 2,

	XML_SCHEMA_WHITESPACE_COLLAPSE = 3
}

declare function xmlSchematronFree(schema: interop.Pointer | interop.Reference<any>): void;

declare function xmlSchematronFreeParserCtxt(ctxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlSchematronFreeValidCtxt(ctxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlSchematronNewDocParserCtxt(doc: interop.Pointer | interop.Reference<_xmlDoc>): interop.Pointer | interop.Reference<any>;

declare function xmlSchematronNewMemParserCtxt(buffer: string | interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<any>;

declare function xmlSchematronNewParserCtxt(URL: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlSchematronNewValidCtxt(schema: interop.Pointer | interop.Reference<any>, options: number): interop.Pointer | interop.Reference<any>;

declare function xmlSchematronParse(ctxt: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlSchematronSetValidStructuredErrors(ctxt: interop.Pointer | interop.Reference<any>, serror: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>, ctx: interop.Pointer | interop.Reference<any>): void;

declare const enum xmlSchematronValidOptions {

	XML_SCHEMATRON_OUT_QUIET = 1,

	XML_SCHEMATRON_OUT_TEXT = 2,

	XML_SCHEMATRON_OUT_XML = 4,

	XML_SCHEMATRON_OUT_ERROR = 8,

	XML_SCHEMATRON_OUT_FILE = 256,

	XML_SCHEMATRON_OUT_BUFFER = 512,

	XML_SCHEMATRON_OUT_IO = 1024
}

declare function xmlSchematronValidateDoc(ctxt: interop.Pointer | interop.Reference<any>, instance: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlSearchNs(doc: interop.Pointer | interop.Reference<_xmlDoc>, node: interop.Pointer | interop.Reference<_xmlNode>, nameSpace: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNs>;

declare function xmlSearchNsByHref(doc: interop.Pointer | interop.Reference<_xmlDoc>, node: interop.Pointer | interop.Reference<_xmlNode>, href: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNs>;

declare function xmlSetBufferAllocationScheme(scheme: xmlBufferAllocationScheme): void;

declare function xmlSetCompressMode(mode: number): void;

declare function xmlSetDocCompressMode(doc: interop.Pointer | interop.Reference<_xmlDoc>, mode: number): void;

declare function xmlSetEntityReferenceFunc(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlEntity>, p2: interop.Pointer | interop.Reference<_xmlNode>, p3: interop.Pointer | interop.Reference<_xmlNode>) => void>): void;

declare function xmlSetExternalEntityLoader(f: interop.FunctionReference<(p1: string, p2: string, p3: interop.Pointer | interop.Reference<_xmlParserCtxt>) => interop.Pointer | interop.Reference<_xmlParserInput>>): void;

declare function xmlSetFeature(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, name: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): number;

declare function xmlSetGenericErrorFunc(ctx: interop.Pointer | interop.Reference<any>, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): void;

declare function xmlSetListDoc(list: interop.Pointer | interop.Reference<_xmlNode>, doc: interop.Pointer | interop.Reference<_xmlDoc>): void;

declare function xmlSetNs(node: interop.Pointer | interop.Reference<_xmlNode>, ns: interop.Pointer | interop.Reference<_xmlNs>): void;

declare function xmlSetNsProp(node: interop.Pointer | interop.Reference<_xmlNode>, ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlSetProp(node: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlAttr>;

declare function xmlSetStructuredErrorFunc(ctx: interop.Pointer | interop.Reference<any>, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>): void;

declare function xmlSetTreeDoc(tree: interop.Pointer | interop.Reference<_xmlNode>, doc: interop.Pointer | interop.Reference<_xmlDoc>): void;

declare function xmlSetupParserForBuffer(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, buffer: string | interop.Pointer | interop.Reference<any>, filename: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlShell(doc: interop.Pointer | interop.Reference<_xmlDoc>, filename: string | interop.Pointer | interop.Reference<any>, input: interop.FunctionReference<(p1: string) => string>, output: interop.Pointer | interop.Reference<FILE>): void;

declare function xmlShellBase(ctxt: interop.Pointer | interop.Reference<_xmlShellCtxt>, arg: string | interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlShellCat(ctxt: interop.Pointer | interop.Reference<_xmlShellCtxt>, arg: string | interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlShellDir(ctxt: interop.Pointer | interop.Reference<_xmlShellCtxt>, arg: string | interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlShellDu(ctxt: interop.Pointer | interop.Reference<_xmlShellCtxt>, arg: string | interop.Pointer | interop.Reference<any>, tree: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlShellList(ctxt: interop.Pointer | interop.Reference<_xmlShellCtxt>, arg: string | interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlShellLoad(ctxt: interop.Pointer | interop.Reference<_xmlShellCtxt>, filename: string | interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlShellPrintNode(node: interop.Pointer | interop.Reference<_xmlNode>): void;

declare function xmlShellPrintXPathError(errorType: number, arg: string | interop.Pointer | interop.Reference<any>): void;

declare function xmlShellPrintXPathResult(list: interop.Pointer | interop.Reference<_xmlXPathObject>): void;

declare function xmlShellPwd(ctxt: interop.Pointer | interop.Reference<_xmlShellCtxt>, buffer: string | interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlShellSave(ctxt: interop.Pointer | interop.Reference<_xmlShellCtxt>, filename: string | interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlShellValidate(ctxt: interop.Pointer | interop.Reference<_xmlShellCtxt>, dtd: string | interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlShellWrite(ctxt: interop.Pointer | interop.Reference<_xmlShellCtxt>, filename: string | interop.Pointer | interop.Reference<any>, node: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlSkipBlankChars(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): number;

declare function xmlSnprintfElementContent(buf: string | interop.Pointer | interop.Reference<any>, size: number, content: interop.Pointer | interop.Reference<_xmlElementContent>, englob: number): void;

declare function xmlSplitQName(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, name: string | interop.Pointer | interop.Reference<any>, prefix: interop.Pointer | interop.Reference<string>): string;

declare function xmlSplitQName2(name: string | interop.Pointer | interop.Reference<any>, prefix: interop.Pointer | interop.Reference<string>): string;

declare function xmlSplitQName3(name: string | interop.Pointer | interop.Reference<any>, len: interop.Pointer | interop.Reference<number>): string;

declare function xmlSprintfElementContent(buf: string | interop.Pointer | interop.Reference<any>, content: interop.Pointer | interop.Reference<_xmlElementContent>, englob: number): void;

declare function xmlStopParser(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>): void;

declare function xmlStrEqual(str1: string | interop.Pointer | interop.Reference<any>, str2: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlStrQEqual(pref: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, str: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlStrcasecmp(str1: string | interop.Pointer | interop.Reference<any>, str2: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlStrcasestr(str: string | interop.Pointer | interop.Reference<any>, val: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlStrcat(cur: string | interop.Pointer | interop.Reference<any>, add: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlStrchr(str: string | interop.Pointer | interop.Reference<any>, val: number): string;

declare function xmlStrcmp(str1: string | interop.Pointer | interop.Reference<any>, str2: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlStrdup(cur: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlStreamPop(stream: interop.Pointer | interop.Reference<any>): number;

declare function xmlStreamPush(stream: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, ns: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlStreamPushAttr(stream: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, ns: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlStreamPushNode(stream: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, ns: string | interop.Pointer | interop.Reference<any>, nodeType: number): number;

declare function xmlStreamWantsAnyNode(stream: interop.Pointer | interop.Reference<any>): number;

declare var xmlStringComment: interop.Reference<number>;

declare function xmlStringCurrentChar(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, cur: string | interop.Pointer | interop.Reference<any>, len: interop.Pointer | interop.Reference<number>): number;

declare function xmlStringDecodeEntities(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, str: string | interop.Pointer | interop.Reference<any>, what: number, end: number, end2: number, end3: number): string;

declare function xmlStringGetNodeList(doc: interop.Pointer | interop.Reference<_xmlDoc>, value: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlStringLenDecodeEntities(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, str: string | interop.Pointer | interop.Reference<any>, len: number, what: number, end: number, end2: number, end3: number): string;

declare function xmlStringLenGetNodeList(doc: interop.Pointer | interop.Reference<_xmlDoc>, value: string | interop.Pointer | interop.Reference<any>, len: number): interop.Pointer | interop.Reference<_xmlNode>;

declare var xmlStringText: interop.Reference<number>;

declare var xmlStringTextNoenc: interop.Reference<number>;

declare function xmlStrlen(str: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlStrncasecmp(str1: string | interop.Pointer | interop.Reference<any>, str2: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlStrncat(cur: string | interop.Pointer | interop.Reference<any>, add: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function xmlStrncatNew(str1: string | interop.Pointer | interop.Reference<any>, str2: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function xmlStrncmp(str1: string | interop.Pointer | interop.Reference<any>, str2: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlStrndup(cur: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function xmlStrstr(str: string | interop.Pointer | interop.Reference<any>, val: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlStrsub(str: string | interop.Pointer | interop.Reference<any>, start: number, len: number): string;

declare function xmlSubstituteEntitiesDefault(val: number): number;

declare function xmlSwitchEncoding(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, enc: xmlCharEncoding): number;

declare function xmlSwitchInputEncoding(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, input: interop.Pointer | interop.Reference<_xmlParserInput>, handler: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>): number;

declare function xmlSwitchToEncoding(ctxt: interop.Pointer | interop.Reference<_xmlParserCtxt>, handler: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>): number;

declare function xmlTextConcat(node: interop.Pointer | interop.Reference<_xmlNode>, content: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlTextMerge(first: interop.Pointer | interop.Reference<_xmlNode>, second: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlTextReaderAttributeCount(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderBaseUri(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderByteConsumed(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderClose(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderConstBaseUri(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderConstEncoding(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderConstLocalName(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderConstName(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderConstNamespaceUri(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderConstPrefix(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderConstString(reader: interop.Pointer | interop.Reference<any>, str: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderConstValue(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderConstXmlLang(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderConstXmlVersion(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderCurrentDoc(reader: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlDoc>;

declare function xmlTextReaderCurrentNode(reader: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlTextReaderDepth(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderExpand(reader: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlTextReaderGetAttribute(reader: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderGetAttributeNo(reader: interop.Pointer | interop.Reference<any>, no: number): string;

declare function xmlTextReaderGetAttributeNs(reader: interop.Pointer | interop.Reference<any>, localName: string | interop.Pointer | interop.Reference<any>, namespaceURI: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderGetErrorHandler(reader: interop.Pointer | interop.Reference<any>, f: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: xmlParserSeverities, p4: interop.Pointer | interop.Reference<any>) => void>>, arg: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function xmlTextReaderGetParserColumnNumber(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderGetParserLineNumber(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderGetParserProp(reader: interop.Pointer | interop.Reference<any>, prop: number): number;

declare function xmlTextReaderGetRemainder(reader: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlParserInputBuffer>;

declare function xmlTextReaderHasAttributes(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderHasValue(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderIsDefault(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderIsEmptyElement(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderIsNamespaceDecl(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderIsValid(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderLocalName(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderLocatorBaseURI(locator: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderLocatorLineNumber(locator: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderLookupNamespace(reader: interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>): string;

declare const enum xmlTextReaderMode {

	XML_TEXTREADER_MODE_INITIAL = 0,

	XML_TEXTREADER_MODE_INTERACTIVE = 1,

	XML_TEXTREADER_MODE_ERROR = 2,

	XML_TEXTREADER_MODE_EOF = 3,

	XML_TEXTREADER_MODE_CLOSED = 4,

	XML_TEXTREADER_MODE_READING = 5
}

declare function xmlTextReaderMoveToAttribute(reader: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderMoveToAttributeNo(reader: interop.Pointer | interop.Reference<any>, no: number): number;

declare function xmlTextReaderMoveToAttributeNs(reader: interop.Pointer | interop.Reference<any>, localName: string | interop.Pointer | interop.Reference<any>, namespaceURI: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderMoveToElement(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderMoveToFirstAttribute(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderMoveToNextAttribute(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderName(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderNamespaceUri(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderNext(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderNextSibling(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderNodeType(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderNormalization(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderPrefix(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderPreserve(reader: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlTextReaderPreservePattern(reader: interop.Pointer | interop.Reference<any>, pattern: string | interop.Pointer | interop.Reference<any>, namespaces: interop.Pointer | interop.Reference<string>): number;

declare function xmlTextReaderQuoteChar(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderRead(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderReadAttributeValue(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderReadInnerXml(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderReadOuterXml(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderReadState(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderReadString(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderRelaxNGSetSchema(reader: interop.Pointer | interop.Reference<any>, schema: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderRelaxNGValidate(reader: interop.Pointer | interop.Reference<any>, rng: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderRelaxNGValidateCtxt(reader: interop.Pointer | interop.Reference<any>, ctxt: interop.Pointer | interop.Reference<any>, options: number): number;

declare function xmlTextReaderSchemaValidate(reader: interop.Pointer | interop.Reference<any>, xsd: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderSchemaValidateCtxt(reader: interop.Pointer | interop.Reference<any>, ctxt: interop.Pointer | interop.Reference<any>, options: number): number;

declare function xmlTextReaderSetErrorHandler(reader: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: xmlParserSeverities, p4: interop.Pointer | interop.Reference<any>) => void>, arg: interop.Pointer | interop.Reference<any>): void;

declare function xmlTextReaderSetParserProp(reader: interop.Pointer | interop.Reference<any>, prop: number, value: number): number;

declare function xmlTextReaderSetSchema(reader: interop.Pointer | interop.Reference<any>, schema: interop.Pointer | interop.Reference<_xmlSchema>): number;

declare function xmlTextReaderSetStructuredErrorHandler(reader: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>, arg: interop.Pointer | interop.Reference<any>): void;

declare function xmlTextReaderSetup(reader: interop.Pointer | interop.Reference<any>, input: interop.Pointer | interop.Reference<_xmlParserInputBuffer>, URL: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, options: number): number;

declare function xmlTextReaderStandalone(reader: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextReaderValue(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextReaderXmlLang(reader: interop.Pointer | interop.Reference<any>): string;

declare function xmlTextWriterEndAttribute(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterEndCDATA(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterEndComment(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterEndDTD(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterEndDTDAttlist(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterEndDTDElement(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterEndDTDEntity(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterEndDocument(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterEndElement(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterEndPI(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterFlush(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterFullEndElement(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterSetIndent(writer: interop.Pointer | interop.Reference<any>, indent: number): number;

declare function xmlTextWriterSetIndentString(writer: interop.Pointer | interop.Reference<any>, str: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterSetQuoteChar(writer: interop.Pointer | interop.Reference<any>, quotechar: number): number;

declare function xmlTextWriterStartAttribute(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartAttributeNS(writer: interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, namespaceURI: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartCDATA(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartComment(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartDTD(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, pubid: string | interop.Pointer | interop.Reference<any>, sysid: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartDTDAttlist(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartDTDElement(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartDTDEntity(writer: interop.Pointer | interop.Reference<any>, pe: number, name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartDocument(writer: interop.Pointer | interop.Reference<any>, version: string | interop.Pointer | interop.Reference<any>, encoding: string | interop.Pointer | interop.Reference<any>, standalone: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartElement(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartElementNS(writer: interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, namespaceURI: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartPI(writer: interop.Pointer | interop.Reference<any>, target: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteAttribute(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteAttributeNS(writer: interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, namespaceURI: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteBase64(writer: interop.Pointer | interop.Reference<any>, data: string | interop.Pointer | interop.Reference<any>, start: number, len: number): number;

declare function xmlTextWriterWriteBinHex(writer: interop.Pointer | interop.Reference<any>, data: string | interop.Pointer | interop.Reference<any>, start: number, len: number): number;

declare function xmlTextWriterWriteCDATA(writer: interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteComment(writer: interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteDTD(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, pubid: string | interop.Pointer | interop.Reference<any>, sysid: string | interop.Pointer | interop.Reference<any>, subset: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteDTDAttlist(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteDTDElement(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteDTDEntity(writer: interop.Pointer | interop.Reference<any>, pe: number, name: string | interop.Pointer | interop.Reference<any>, pubid: string | interop.Pointer | interop.Reference<any>, sysid: string | interop.Pointer | interop.Reference<any>, ndataid: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteDTDExternalEntity(writer: interop.Pointer | interop.Reference<any>, pe: number, name: string | interop.Pointer | interop.Reference<any>, pubid: string | interop.Pointer | interop.Reference<any>, sysid: string | interop.Pointer | interop.Reference<any>, ndataid: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteDTDExternalEntityContents(writer: interop.Pointer | interop.Reference<any>, pubid: string | interop.Pointer | interop.Reference<any>, sysid: string | interop.Pointer | interop.Reference<any>, ndataid: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteDTDInternalEntity(writer: interop.Pointer | interop.Reference<any>, pe: number, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteDTDNotation(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, pubid: string | interop.Pointer | interop.Reference<any>, sysid: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteElement(writer: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteElementNS(writer: interop.Pointer | interop.Reference<any>, prefix: string | interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, namespaceURI: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWritePI(writer: interop.Pointer | interop.Reference<any>, target: string | interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteRaw(writer: interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterWriteRawLen(writer: interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlTextWriterWriteString(writer: interop.Pointer | interop.Reference<any>, content: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlThrDefBufferAllocScheme(v: xmlBufferAllocationScheme): xmlBufferAllocationScheme;

declare function xmlThrDefDefaultBufferSize(v: number): number;

declare function xmlThrDefDeregisterNodeDefault(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>;

declare function xmlThrDefDoValidityCheckingDefaultValue(v: number): number;

declare function xmlThrDefGetWarningsDefaultValue(v: number): number;

declare function xmlThrDefIndentTreeOutput(v: number): number;

declare function xmlThrDefKeepBlanksDefaultValue(v: number): number;

declare function xmlThrDefLineNumbersDefaultValue(v: number): number;

declare function xmlThrDefLoadExtDtdDefaultValue(v: number): number;

declare function xmlThrDefOutputBufferCreateFilenameDefault(func: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, p3: number) => interop.Pointer | interop.Reference<_xmlOutputBuffer>>): interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<_xmlCharEncodingHandler>, p3: number) => interop.Pointer | interop.Reference<_xmlOutputBuffer>>;

declare function xmlThrDefParserDebugEntities(v: number): number;

declare function xmlThrDefParserInputBufferCreateFilenameDefault(func: interop.FunctionReference<(p1: string, p2: xmlCharEncoding) => interop.Pointer | interop.Reference<_xmlParserInputBuffer>>): interop.FunctionReference<(p1: string, p2: xmlCharEncoding) => interop.Pointer | interop.Reference<_xmlParserInputBuffer>>;

declare function xmlThrDefPedanticParserDefaultValue(v: number): number;

declare function xmlThrDefRegisterNodeDefault(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlNode>) => void>;

declare function xmlThrDefSaveNoEmptyTags(v: number): number;

declare function xmlThrDefSetGenericErrorFunc(ctx: interop.Pointer | interop.Reference<any>, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string) => void>): void;

declare function xmlThrDefSetStructuredErrorFunc(ctx: interop.Pointer | interop.Reference<any>, handler: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<_xmlError>) => void>): void;

declare function xmlThrDefSubstituteEntitiesDefaultValue(v: number): number;

declare function xmlThrDefTreeIndentString(v: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlUCSIsAegeanNumbers(code: number): number;

declare function xmlUCSIsAlphabeticPresentationForms(code: number): number;

declare function xmlUCSIsArabic(code: number): number;

declare function xmlUCSIsArabicPresentationFormsA(code: number): number;

declare function xmlUCSIsArabicPresentationFormsB(code: number): number;

declare function xmlUCSIsArmenian(code: number): number;

declare function xmlUCSIsArrows(code: number): number;

declare function xmlUCSIsBasicLatin(code: number): number;

declare function xmlUCSIsBengali(code: number): number;

declare function xmlUCSIsBlock(code: number, block: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlUCSIsBlockElements(code: number): number;

declare function xmlUCSIsBopomofo(code: number): number;

declare function xmlUCSIsBopomofoExtended(code: number): number;

declare function xmlUCSIsBoxDrawing(code: number): number;

declare function xmlUCSIsBraillePatterns(code: number): number;

declare function xmlUCSIsBuhid(code: number): number;

declare function xmlUCSIsByzantineMusicalSymbols(code: number): number;

declare function xmlUCSIsCJKCompatibility(code: number): number;

declare function xmlUCSIsCJKCompatibilityForms(code: number): number;

declare function xmlUCSIsCJKCompatibilityIdeographs(code: number): number;

declare function xmlUCSIsCJKCompatibilityIdeographsSupplement(code: number): number;

declare function xmlUCSIsCJKRadicalsSupplement(code: number): number;

declare function xmlUCSIsCJKSymbolsandPunctuation(code: number): number;

declare function xmlUCSIsCJKUnifiedIdeographs(code: number): number;

declare function xmlUCSIsCJKUnifiedIdeographsExtensionA(code: number): number;

declare function xmlUCSIsCJKUnifiedIdeographsExtensionB(code: number): number;

declare function xmlUCSIsCat(code: number, cat: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlUCSIsCatC(code: number): number;

declare function xmlUCSIsCatCc(code: number): number;

declare function xmlUCSIsCatCf(code: number): number;

declare function xmlUCSIsCatCo(code: number): number;

declare function xmlUCSIsCatCs(code: number): number;

declare function xmlUCSIsCatL(code: number): number;

declare function xmlUCSIsCatLl(code: number): number;

declare function xmlUCSIsCatLm(code: number): number;

declare function xmlUCSIsCatLo(code: number): number;

declare function xmlUCSIsCatLt(code: number): number;

declare function xmlUCSIsCatLu(code: number): number;

declare function xmlUCSIsCatM(code: number): number;

declare function xmlUCSIsCatMc(code: number): number;

declare function xmlUCSIsCatMe(code: number): number;

declare function xmlUCSIsCatMn(code: number): number;

declare function xmlUCSIsCatN(code: number): number;

declare function xmlUCSIsCatNd(code: number): number;

declare function xmlUCSIsCatNl(code: number): number;

declare function xmlUCSIsCatNo(code: number): number;

declare function xmlUCSIsCatP(code: number): number;

declare function xmlUCSIsCatPc(code: number): number;

declare function xmlUCSIsCatPd(code: number): number;

declare function xmlUCSIsCatPe(code: number): number;

declare function xmlUCSIsCatPf(code: number): number;

declare function xmlUCSIsCatPi(code: number): number;

declare function xmlUCSIsCatPo(code: number): number;

declare function xmlUCSIsCatPs(code: number): number;

declare function xmlUCSIsCatS(code: number): number;

declare function xmlUCSIsCatSc(code: number): number;

declare function xmlUCSIsCatSk(code: number): number;

declare function xmlUCSIsCatSm(code: number): number;

declare function xmlUCSIsCatSo(code: number): number;

declare function xmlUCSIsCatZ(code: number): number;

declare function xmlUCSIsCatZl(code: number): number;

declare function xmlUCSIsCatZp(code: number): number;

declare function xmlUCSIsCatZs(code: number): number;

declare function xmlUCSIsCherokee(code: number): number;

declare function xmlUCSIsCombiningDiacriticalMarks(code: number): number;

declare function xmlUCSIsCombiningDiacriticalMarksforSymbols(code: number): number;

declare function xmlUCSIsCombiningHalfMarks(code: number): number;

declare function xmlUCSIsCombiningMarksforSymbols(code: number): number;

declare function xmlUCSIsControlPictures(code: number): number;

declare function xmlUCSIsCurrencySymbols(code: number): number;

declare function xmlUCSIsCypriotSyllabary(code: number): number;

declare function xmlUCSIsCyrillic(code: number): number;

declare function xmlUCSIsCyrillicSupplement(code: number): number;

declare function xmlUCSIsDeseret(code: number): number;

declare function xmlUCSIsDevanagari(code: number): number;

declare function xmlUCSIsDingbats(code: number): number;

declare function xmlUCSIsEnclosedAlphanumerics(code: number): number;

declare function xmlUCSIsEnclosedCJKLettersandMonths(code: number): number;

declare function xmlUCSIsEthiopic(code: number): number;

declare function xmlUCSIsGeneralPunctuation(code: number): number;

declare function xmlUCSIsGeometricShapes(code: number): number;

declare function xmlUCSIsGeorgian(code: number): number;

declare function xmlUCSIsGothic(code: number): number;

declare function xmlUCSIsGreek(code: number): number;

declare function xmlUCSIsGreekExtended(code: number): number;

declare function xmlUCSIsGreekandCoptic(code: number): number;

declare function xmlUCSIsGujarati(code: number): number;

declare function xmlUCSIsGurmukhi(code: number): number;

declare function xmlUCSIsHalfwidthandFullwidthForms(code: number): number;

declare function xmlUCSIsHangulCompatibilityJamo(code: number): number;

declare function xmlUCSIsHangulJamo(code: number): number;

declare function xmlUCSIsHangulSyllables(code: number): number;

declare function xmlUCSIsHanunoo(code: number): number;

declare function xmlUCSIsHebrew(code: number): number;

declare function xmlUCSIsHighPrivateUseSurrogates(code: number): number;

declare function xmlUCSIsHighSurrogates(code: number): number;

declare function xmlUCSIsHiragana(code: number): number;

declare function xmlUCSIsIPAExtensions(code: number): number;

declare function xmlUCSIsIdeographicDescriptionCharacters(code: number): number;

declare function xmlUCSIsKanbun(code: number): number;

declare function xmlUCSIsKangxiRadicals(code: number): number;

declare function xmlUCSIsKannada(code: number): number;

declare function xmlUCSIsKatakana(code: number): number;

declare function xmlUCSIsKatakanaPhoneticExtensions(code: number): number;

declare function xmlUCSIsKhmer(code: number): number;

declare function xmlUCSIsKhmerSymbols(code: number): number;

declare function xmlUCSIsLao(code: number): number;

declare function xmlUCSIsLatin1Supplement(code: number): number;

declare function xmlUCSIsLatinExtendedA(code: number): number;

declare function xmlUCSIsLatinExtendedAdditional(code: number): number;

declare function xmlUCSIsLatinExtendedB(code: number): number;

declare function xmlUCSIsLetterlikeSymbols(code: number): number;

declare function xmlUCSIsLimbu(code: number): number;

declare function xmlUCSIsLinearBIdeograms(code: number): number;

declare function xmlUCSIsLinearBSyllabary(code: number): number;

declare function xmlUCSIsLowSurrogates(code: number): number;

declare function xmlUCSIsMalayalam(code: number): number;

declare function xmlUCSIsMathematicalAlphanumericSymbols(code: number): number;

declare function xmlUCSIsMathematicalOperators(code: number): number;

declare function xmlUCSIsMiscellaneousMathematicalSymbolsA(code: number): number;

declare function xmlUCSIsMiscellaneousMathematicalSymbolsB(code: number): number;

declare function xmlUCSIsMiscellaneousSymbols(code: number): number;

declare function xmlUCSIsMiscellaneousSymbolsandArrows(code: number): number;

declare function xmlUCSIsMiscellaneousTechnical(code: number): number;

declare function xmlUCSIsMongolian(code: number): number;

declare function xmlUCSIsMusicalSymbols(code: number): number;

declare function xmlUCSIsMyanmar(code: number): number;

declare function xmlUCSIsNumberForms(code: number): number;

declare function xmlUCSIsOgham(code: number): number;

declare function xmlUCSIsOldItalic(code: number): number;

declare function xmlUCSIsOpticalCharacterRecognition(code: number): number;

declare function xmlUCSIsOriya(code: number): number;

declare function xmlUCSIsOsmanya(code: number): number;

declare function xmlUCSIsPhoneticExtensions(code: number): number;

declare function xmlUCSIsPrivateUse(code: number): number;

declare function xmlUCSIsPrivateUseArea(code: number): number;

declare function xmlUCSIsRunic(code: number): number;

declare function xmlUCSIsShavian(code: number): number;

declare function xmlUCSIsSinhala(code: number): number;

declare function xmlUCSIsSmallFormVariants(code: number): number;

declare function xmlUCSIsSpacingModifierLetters(code: number): number;

declare function xmlUCSIsSpecials(code: number): number;

declare function xmlUCSIsSuperscriptsandSubscripts(code: number): number;

declare function xmlUCSIsSupplementalArrowsA(code: number): number;

declare function xmlUCSIsSupplementalArrowsB(code: number): number;

declare function xmlUCSIsSupplementalMathematicalOperators(code: number): number;

declare function xmlUCSIsSupplementaryPrivateUseAreaA(code: number): number;

declare function xmlUCSIsSupplementaryPrivateUseAreaB(code: number): number;

declare function xmlUCSIsSyriac(code: number): number;

declare function xmlUCSIsTagalog(code: number): number;

declare function xmlUCSIsTagbanwa(code: number): number;

declare function xmlUCSIsTags(code: number): number;

declare function xmlUCSIsTaiLe(code: number): number;

declare function xmlUCSIsTaiXuanJingSymbols(code: number): number;

declare function xmlUCSIsTamil(code: number): number;

declare function xmlUCSIsTelugu(code: number): number;

declare function xmlUCSIsThaana(code: number): number;

declare function xmlUCSIsThai(code: number): number;

declare function xmlUCSIsTibetan(code: number): number;

declare function xmlUCSIsUgaritic(code: number): number;

declare function xmlUCSIsUnifiedCanadianAboriginalSyllabics(code: number): number;

declare function xmlUCSIsVariationSelectors(code: number): number;

declare function xmlUCSIsVariationSelectorsSupplement(code: number): number;

declare function xmlUCSIsYiRadicals(code: number): number;

declare function xmlUCSIsYiSyllables(code: number): number;

declare function xmlUCSIsYijingHexagramSymbols(code: number): number;

declare function xmlURIEscape(str: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlURIEscapeStr(str: string | interop.Pointer | interop.Reference<any>, list: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlURIUnescapeString(str: string | interop.Pointer | interop.Reference<any>, len: number, target: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlUTF8Charcmp(utf1: string | interop.Pointer | interop.Reference<any>, utf2: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlUTF8Size(utf: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlUTF8Strlen(utf: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlUTF8Strloc(utf: string | interop.Pointer | interop.Reference<any>, utfchar: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlUTF8Strndup(utf: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function xmlUTF8Strpos(utf: string | interop.Pointer | interop.Reference<any>, pos: number): string;

declare function xmlUTF8Strsize(utf: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlUTF8Strsub(utf: string | interop.Pointer | interop.Reference<any>, start: number, len: number): string;

declare function xmlUnlinkNode(cur: interop.Pointer | interop.Reference<_xmlNode>): void;

declare function xmlUnlockLibrary(): void;

declare function xmlUnsetNsProp(node: interop.Pointer | interop.Reference<_xmlNode>, ns: interop.Pointer | interop.Reference<_xmlNs>, name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlUnsetProp(node: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidBuildContentModel(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, elem: interop.Pointer | interop.Reference<_xmlElement>): number;

declare function xmlValidCtxtNormalizeAttributeValue(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlValidGetPotentialChildren(ctree: interop.Pointer | interop.Reference<_xmlElementContent>, names: interop.Pointer | interop.Reference<string>, len: interop.Pointer | interop.Reference<number>, max: number): number;

declare function xmlValidGetValidElements(prev: interop.Pointer | interop.Reference<_xmlNode>, next: interop.Pointer | interop.Reference<_xmlNode>, names: interop.Pointer | interop.Reference<string>, max: number): number;

declare function xmlValidNormalizeAttributeValue(doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlValidateAttributeDecl(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, attr: interop.Pointer | interop.Reference<_xmlAttribute>): number;

declare function xmlValidateAttributeValue(type: xmlAttributeType, value: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidateDocument(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlValidateDocumentFinal(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlValidateDtd(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, dtd: interop.Pointer | interop.Reference<_xmlDtd>): number;

declare function xmlValidateDtdFinal(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlValidateElement(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlValidateElementDecl(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlElement>): number;

declare function xmlValidateNCName(value: string | interop.Pointer | interop.Reference<any>, space: number): number;

declare function xmlValidateNMToken(value: string | interop.Pointer | interop.Reference<any>, space: number): number;

declare function xmlValidateName(value: string | interop.Pointer | interop.Reference<any>, space: number): number;

declare function xmlValidateNameValue(value: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidateNamesValue(value: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidateNmtokenValue(value: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidateNmtokensValue(value: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidateNotationDecl(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, nota: interop.Pointer | interop.Reference<_xmlNotation>): number;

declare function xmlValidateNotationUse(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, notationName: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidateOneAttribute(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>, attr: interop.Pointer | interop.Reference<_xmlAttr>, value: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidateOneElement(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlValidateOneNamespace(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>, prefix: string | interop.Pointer | interop.Reference<any>, ns: interop.Pointer | interop.Reference<_xmlNs>, value: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidatePopElement(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>, qname: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidatePushCData(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, data: string | interop.Pointer | interop.Reference<any>, len: number): number;

declare function xmlValidatePushElement(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, elem: interop.Pointer | interop.Reference<_xmlNode>, qname: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlValidateQName(value: string | interop.Pointer | interop.Reference<any>, space: number): number;

declare function xmlValidateRoot(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlXIncludeFreeContext(ctxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlXIncludeNewContext(doc: interop.Pointer | interop.Reference<_xmlDoc>): interop.Pointer | interop.Reference<any>;

declare function xmlXIncludeProcess(doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare function xmlXIncludeProcessFlags(doc: interop.Pointer | interop.Reference<_xmlDoc>, flags: number): number;

declare function xmlXIncludeProcessFlagsData(doc: interop.Pointer | interop.Reference<_xmlDoc>, flags: number, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlXIncludeProcessNode(ctxt: interop.Pointer | interop.Reference<any>, tree: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlXIncludeProcessTree(tree: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlXIncludeProcessTreeFlags(tree: interop.Pointer | interop.Reference<_xmlNode>, flags: number): number;

declare function xmlXIncludeProcessTreeFlagsData(tree: interop.Pointer | interop.Reference<_xmlNode>, flags: number, data: interop.Pointer | interop.Reference<any>): number;

declare function xmlXIncludeSetFlags(ctxt: interop.Pointer | interop.Reference<any>, flags: number): number;

declare function xmlXPathAddValues(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathBooleanFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathCastBooleanToNumber(val: number): number;

declare function xmlXPathCastBooleanToString(val: number): string;

declare function xmlXPathCastNodeSetToBoolean(ns: interop.Pointer | interop.Reference<_xmlNodeSet>): number;

declare function xmlXPathCastNodeSetToNumber(ns: interop.Pointer | interop.Reference<_xmlNodeSet>): number;

declare function xmlXPathCastNodeSetToString(ns: interop.Pointer | interop.Reference<_xmlNodeSet>): string;

declare function xmlXPathCastNodeToNumber(node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlXPathCastNodeToString(node: interop.Pointer | interop.Reference<_xmlNode>): string;

declare function xmlXPathCastNumberToBoolean(val: number): number;

declare function xmlXPathCastNumberToString(val: number): string;

declare function xmlXPathCastStringToBoolean(val: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlXPathCastStringToNumber(val: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlXPathCastToBoolean(val: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlXPathCastToNumber(val: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlXPathCastToString(val: interop.Pointer | interop.Reference<_xmlXPathObject>): string;

declare function xmlXPathCeilingFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathCmpNodes(node1: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlXPathCompareValues(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, inf: number, strict: number): number;

declare function xmlXPathCompile(str: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlXPathCompiledEval(comp: interop.Pointer | interop.Reference<any>, ctx: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathCompiledEvalToBoolean(comp: interop.Pointer | interop.Reference<any>, ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): number;

declare function xmlXPathConcatFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathContainsFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathContextSetCache(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, active: number, value: number, options: number): number;

declare function xmlXPathConvertBoolean(val: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathConvertNumber(val: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathConvertString(val: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathCountFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathCtxtCompile(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, str: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function xmlXPathDebugDumpCompExpr(output: interop.Pointer | interop.Reference<FILE>, comp: interop.Pointer | interop.Reference<any>, depth: number): void;

declare function xmlXPathDebugDumpObject(output: interop.Pointer | interop.Reference<FILE>, cur: interop.Pointer | interop.Reference<_xmlXPathObject>, depth: number): void;

declare function xmlXPathDifference(nodes1: interop.Pointer | interop.Reference<_xmlNodeSet>, nodes2: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathDistinct(nodes: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathDistinctSorted(nodes: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathDivValues(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathEqualValues(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): number;

declare function xmlXPathErr(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, error: number): void;

declare const enum xmlXPathError {

	XPATH_EXPRESSION_OK = 0,

	XPATH_NUMBER_ERROR = 1,

	XPATH_UNFINISHED_LITERAL_ERROR = 2,

	XPATH_START_LITERAL_ERROR = 3,

	XPATH_VARIABLE_REF_ERROR = 4,

	XPATH_UNDEF_VARIABLE_ERROR = 5,

	XPATH_INVALID_PREDICATE_ERROR = 6,

	XPATH_EXPR_ERROR = 7,

	XPATH_UNCLOSED_ERROR = 8,

	XPATH_UNKNOWN_FUNC_ERROR = 9,

	XPATH_INVALID_OPERAND = 10,

	XPATH_INVALID_TYPE = 11,

	XPATH_INVALID_ARITY = 12,

	XPATH_INVALID_CTXT_SIZE = 13,

	XPATH_INVALID_CTXT_POSITION = 14,

	XPATH_MEMORY_ERROR = 15,

	XPTR_SYNTAX_ERROR = 16,

	XPTR_RESOURCE_ERROR = 17,

	XPTR_SUB_RESOURCE_ERROR = 18,

	XPATH_UNDEF_PREFIX_ERROR = 19,

	XPATH_ENCODING_ERROR = 20,

	XPATH_INVALID_CHAR_ERROR = 21,

	XPATH_INVALID_CTXT = 22,

	XPATH_STACK_ERROR = 23,

	XPATH_FORBID_VARIABLE_ERROR = 24
}

declare function xmlXPathEval(str: string | interop.Pointer | interop.Reference<any>, ctx: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathEvalExpr(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathEvalExpression(str: string | interop.Pointer | interop.Reference<any>, ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathEvalPredicate(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, res: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlXPathEvaluatePredicateResult(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, res: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlXPathFalseFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathFloorFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathFreeCompExpr(comp: interop.Pointer | interop.Reference<any>): void;

declare function xmlXPathFreeContext(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): void;

declare function xmlXPathFreeNodeSet(obj: interop.Pointer | interop.Reference<_xmlNodeSet>): void;

declare function xmlXPathFreeNodeSetList(obj: interop.Pointer | interop.Reference<_xmlXPathObject>): void;

declare function xmlXPathFreeObject(obj: interop.Pointer | interop.Reference<_xmlXPathObject>): void;

declare function xmlXPathFreeParserContext(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathFunctionLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: string | interop.Pointer | interop.Reference<any>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>;

declare function xmlXPathFunctionLookupNS(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: string | interop.Pointer | interop.Reference<any>, ns_uri: string | interop.Pointer | interop.Reference<any>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>;

declare function xmlXPathHasSameNodes(nodes1: interop.Pointer | interop.Reference<_xmlNodeSet>, nodes2: interop.Pointer | interop.Reference<_xmlNodeSet>): number;

declare function xmlXPathIdFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathInit(): void;

declare function xmlXPathIntersection(nodes1: interop.Pointer | interop.Reference<_xmlNodeSet>, nodes2: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathIsInf(val: number): number;

declare function xmlXPathIsNaN(val: number): number;

declare function xmlXPathIsNodeType(name: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlXPathLangFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathLastFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathLeading(nodes1: interop.Pointer | interop.Reference<_xmlNodeSet>, nodes2: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathLeadingSorted(nodes1: interop.Pointer | interop.Reference<_xmlNodeSet>, nodes2: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathLocalNameFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathModValues(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathMultValues(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare var xmlXPathNAN: number;

declare var xmlXPathNINF: number;

declare function xmlXPathNamespaceURIFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathNewBoolean(val: number): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNewCString(val: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNewContext(doc: interop.Pointer | interop.Reference<_xmlDoc>): interop.Pointer | interop.Reference<_xmlXPathContext>;

declare function xmlXPathNewFloat(val: number): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNewNodeSet(val: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNewNodeSetList(val: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNewParserContext(str: string | interop.Pointer | interop.Reference<any>, ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathParserContext>;

declare function xmlXPathNewString(val: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNewValueTree(val: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNextAncestor(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextAncestorOrSelf(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextAttribute(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextChild(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextDescendant(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextDescendantOrSelf(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextFollowing(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextFollowingSibling(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextNamespace(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextParent(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextPreceding(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextPrecedingSibling(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNextSelf(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, cur: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPathNodeEval(node: interop.Pointer | interop.Reference<_xmlNode>, str: string | interop.Pointer | interop.Reference<any>, ctx: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNodeLeading(nodes: interop.Pointer | interop.Reference<_xmlNodeSet>, node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathNodeLeadingSorted(nodes: interop.Pointer | interop.Reference<_xmlNodeSet>, node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathNodeSetAdd(cur: interop.Pointer | interop.Reference<_xmlNodeSet>, val: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlXPathNodeSetAddNs(cur: interop.Pointer | interop.Reference<_xmlNodeSet>, node: interop.Pointer | interop.Reference<_xmlNode>, ns: interop.Pointer | interop.Reference<_xmlNs>): number;

declare function xmlXPathNodeSetAddUnique(cur: interop.Pointer | interop.Reference<_xmlNodeSet>, val: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlXPathNodeSetContains(cur: interop.Pointer | interop.Reference<_xmlNodeSet>, val: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlXPathNodeSetCreate(val: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathNodeSetDel(cur: interop.Pointer | interop.Reference<_xmlNodeSet>, val: interop.Pointer | interop.Reference<_xmlNode>): void;

declare function xmlXPathNodeSetFreeNs(ns: interop.Pointer | interop.Reference<_xmlNs>): void;

declare function xmlXPathNodeSetMerge(val1: interop.Pointer | interop.Reference<_xmlNodeSet>, val2: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathNodeSetRemove(cur: interop.Pointer | interop.Reference<_xmlNodeSet>, val: number): void;

declare function xmlXPathNodeSetSort(set: interop.Pointer | interop.Reference<_xmlNodeSet>): void;

declare function xmlXPathNodeTrailing(nodes: interop.Pointer | interop.Reference<_xmlNodeSet>, node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathNodeTrailingSorted(nodes: interop.Pointer | interop.Reference<_xmlNodeSet>, node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathNormalizeFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathNotEqualValues(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): number;

declare function xmlXPathNotFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathNsLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, prefix: string | interop.Pointer | interop.Reference<any>): string;

declare function xmlXPathNumberFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathObjectCopy(val: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare const enum xmlXPathObjectType {

	XPATH_UNDEFINED = 0,

	XPATH_NODESET = 1,

	XPATH_BOOLEAN = 2,

	XPATH_NUMBER = 3,

	XPATH_STRING = 4,

	XPATH_POINT = 5,

	XPATH_RANGE = 6,

	XPATH_LOCATIONSET = 7,

	XPATH_USERS = 8,

	XPATH_XSLT_TREE = 9
}

declare function xmlXPathOrderDocElems(doc: interop.Pointer | interop.Reference<_xmlDoc>): number;

declare var xmlXPathPINF: number;

declare function xmlXPathParseNCName(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): string;

declare function xmlXPathParseName(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): string;

declare function xmlXPathPopBoolean(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): number;

declare function xmlXPathPopExternal(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): interop.Pointer | interop.Reference<any>;

declare function xmlXPathPopNodeSet(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathPopNumber(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): number;

declare function xmlXPathPopString(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): string;

declare function xmlXPathPositionFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathRegisterAllFunctions(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): void;

declare function xmlXPathRegisterFunc(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: string | interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>): number;

declare function xmlXPathRegisterFuncLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string) => interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>>, funcCtxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlXPathRegisterFuncNS(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: string | interop.Pointer | interop.Reference<any>, ns_uri: string | interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>): number;

declare function xmlXPathRegisterNs(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, prefix: string | interop.Pointer | interop.Reference<any>, ns_uri: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlXPathRegisterVariable(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlXPathRegisterVariableLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: string, p3: string) => interop.Pointer | interop.Reference<_xmlXPathObject>>, data: interop.Pointer | interop.Reference<any>): void;

declare function xmlXPathRegisterVariableNS(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: string | interop.Pointer | interop.Reference<any>, ns_uri: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlXPathRegisteredFuncsCleanup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): void;

declare function xmlXPathRegisteredNsCleanup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): void;

declare function xmlXPathRegisteredVariablesCleanup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): void;

declare function xmlXPathRoot(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathRoundFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathSetContextNode(node: interop.Pointer | interop.Reference<_xmlNode>, ctx: interop.Pointer | interop.Reference<_xmlXPathContext>): number;

declare function xmlXPathStartsWithFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathStringEvalNumber(str: string | interop.Pointer | interop.Reference<any>): number;

declare function xmlXPathStringFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathStringLengthFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathSubValues(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathSubstringAfterFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathSubstringBeforeFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathSubstringFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathSumFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathTrailing(nodes1: interop.Pointer | interop.Reference<_xmlNodeSet>, nodes2: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathTrailingSorted(nodes1: interop.Pointer | interop.Reference<_xmlNodeSet>, nodes2: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathTranslateFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathTrueFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathValueFlipSign(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathVariableLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathVariableLookupNS(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: string | interop.Pointer | interop.Reference<any>, ns_uri: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathWrapCString(val: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathWrapExternal(val: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathWrapNodeSet(val: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathWrapString(val: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPatherror(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, file: string | interop.Pointer | interop.Reference<any>, line: number, no: number): void;

declare function xmlXPtrBuildNodeList(obj: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPtrEval(str: string | interop.Pointer | interop.Reference<any>, ctx: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPtrEvalRangePredicate(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPtrFreeLocationSet(obj: interop.Pointer | interop.Reference<_xmlLocationSet>): void;

declare function xmlXPtrLocationSetAdd(cur: interop.Pointer | interop.Reference<_xmlLocationSet>, val: interop.Pointer | interop.Reference<_xmlXPathObject>): void;

declare function xmlXPtrLocationSetCreate(val: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlLocationSet>;

declare function xmlXPtrLocationSetDel(cur: interop.Pointer | interop.Reference<_xmlLocationSet>, val: interop.Pointer | interop.Reference<_xmlXPathObject>): void;

declare function xmlXPtrLocationSetMerge(val1: interop.Pointer | interop.Reference<_xmlLocationSet>, val2: interop.Pointer | interop.Reference<_xmlLocationSet>): interop.Pointer | interop.Reference<_xmlLocationSet>;

declare function xmlXPtrLocationSetRemove(cur: interop.Pointer | interop.Reference<_xmlLocationSet>, val: number): void;

declare function xmlXPtrNewCollapsedRange(start: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPtrNewContext(doc: interop.Pointer | interop.Reference<_xmlDoc>, here: interop.Pointer | interop.Reference<_xmlNode>, origin: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlXPathContext>;

declare function xmlXPtrNewLocationSetNodeSet(set: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPtrNewLocationSetNodes(start: interop.Pointer | interop.Reference<_xmlNode>, end: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPtrNewRange(start: interop.Pointer | interop.Reference<_xmlNode>, startindex: number, end: interop.Pointer | interop.Reference<_xmlNode>, endindex: number): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPtrNewRangeNodeObject(start: interop.Pointer | interop.Reference<_xmlNode>, end: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPtrNewRangeNodePoint(start: interop.Pointer | interop.Reference<_xmlNode>, end: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPtrNewRangeNodes(start: interop.Pointer | interop.Reference<_xmlNode>, end: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPtrNewRangePointNode(start: interop.Pointer | interop.Reference<_xmlXPathObject>, end: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPtrNewRangePoints(start: interop.Pointer | interop.Reference<_xmlXPathObject>, end: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPtrRangeToFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPtrWrapLocationSet(val: interop.Pointer | interop.Reference<_xmlLocationSet>): interop.Pointer | interop.Reference<_xmlXPathObject>;
