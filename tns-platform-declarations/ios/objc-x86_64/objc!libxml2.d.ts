
declare function __xmlParserInputBufferCreateFilename(URI: string, enc: xmlCharEncodingEnum): number;

interface _xmlAttr {
	_private: interop.Pointer | interop.Reference<any>;
	type: xmlElementType;
	name: interop.Pointer | interop.Reference<number>;
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
	name: interop.Pointer | interop.Reference<number>;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlDtd>;
	next: interop.Pointer | interop.Reference<_xmlNode>;
	prev: interop.Pointer | interop.Reference<_xmlNode>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	nexth: interop.Pointer | interop.Reference<_xmlAttribute>;
	atype: xmlAttributeType;
	def: xmlAttributeDefault;
	defaultValue: interop.Pointer | interop.Reference<number>;
	tree: interop.Pointer | interop.Reference<_xmlEnumeration>;
	prefix: interop.Pointer | interop.Reference<number>;
	elem: interop.Pointer | interop.Reference<number>;
}
declare var _xmlAttribute: interop.StructType<_xmlAttribute>;

interface _xmlBuffer {
	content: interop.Pointer | interop.Reference<number>;
	use: number;
	size: number;
	alloc: number;
	contentIO: interop.Pointer | interop.Reference<number>;
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
}
declare var _xmlCharEncodingHandler: interop.StructType<_xmlCharEncodingHandler>;

interface _xmlDOMWrapCtxt {
	_private: interop.Pointer | interop.Reference<any>;
	type: number;
	namespaceMap: interop.Pointer | interop.Reference<any>;
	getNsForNodeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlDOMWrapCtxt>, p2: interop.Pointer | interop.Reference<_xmlNode>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => interop.Pointer | interop.Reference<_xmlNs>>;
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
	version: interop.Pointer | interop.Reference<number>;
	encoding: interop.Pointer | interop.Reference<number>;
	ids: interop.Pointer | interop.Reference<any>;
	refs: interop.Pointer | interop.Reference<any>;
	URL: interop.Pointer | interop.Reference<number>;
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
	name: interop.Pointer | interop.Reference<number>;
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
	ExternalID: interop.Pointer | interop.Reference<number>;
	SystemID: interop.Pointer | interop.Reference<number>;
	pentities: interop.Pointer | interop.Reference<any>;
}
declare var _xmlDtd: interop.StructType<_xmlDtd>;

interface _xmlElement {
	_private: interop.Pointer | interop.Reference<any>;
	type: xmlElementType;
	name: interop.Pointer | interop.Reference<number>;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlDtd>;
	next: interop.Pointer | interop.Reference<_xmlNode>;
	prev: interop.Pointer | interop.Reference<_xmlNode>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	etype: xmlElementTypeVal;
	content: interop.Pointer | interop.Reference<_xmlElementContent>;
	attributes: interop.Pointer | interop.Reference<_xmlAttribute>;
	prefix: interop.Pointer | interop.Reference<number>;
	contModel: interop.Pointer | interop.Reference<any>;
}
declare var _xmlElement: interop.StructType<_xmlElement>;

interface _xmlElementContent {
	type: xmlElementContentType;
	ocur: xmlElementContentOccur;
	name: interop.Pointer | interop.Reference<number>;
	c1: interop.Pointer | interop.Reference<_xmlElementContent>;
	c2: interop.Pointer | interop.Reference<_xmlElementContent>;
	parent: interop.Pointer | interop.Reference<_xmlElementContent>;
	prefix: interop.Pointer | interop.Reference<number>;
}
declare var _xmlElementContent: interop.StructType<_xmlElementContent>;

interface _xmlEntity {
	_private: interop.Pointer | interop.Reference<any>;
	type: xmlElementType;
	name: interop.Pointer | interop.Reference<number>;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlDtd>;
	next: interop.Pointer | interop.Reference<_xmlNode>;
	prev: interop.Pointer | interop.Reference<_xmlNode>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	orig: interop.Pointer | interop.Reference<number>;
	content: interop.Pointer | interop.Reference<number>;
	length: number;
	etype: xmlEntityType;
	ExternalID: interop.Pointer | interop.Reference<number>;
	SystemID: interop.Pointer | interop.Reference<number>;
	nexte: interop.Pointer | interop.Reference<_xmlEntity>;
	URI: interop.Pointer | interop.Reference<number>;
	owner: number;
	checked: number;
}
declare var _xmlEntity: interop.StructType<_xmlEntity>;

interface _xmlEnumeration {
	next: interop.Pointer | interop.Reference<_xmlEnumeration>;
	name: interop.Pointer | interop.Reference<number>;
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
	xmlDefaultSAXLocator: number;
	xmlDefaultSAXHandler: number;
	docbDefaultSAXHandler: number;
	htmlDefaultSAXHandler: number;
	xmlFree: number;
	xmlMalloc: number;
	xmlMemStrdup: number;
	xmlRealloc: number;
	xmlGenericError: number;
	xmlStructuredError: number;
	xmlGenericErrorContext: interop.Pointer | interop.Reference<any>;
	oldXMLWDcompatibility: number;
	xmlBufferAllocScheme: number;
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
	xmlRegisterNodeDefaultValue: interop.FunctionReference<(p1: number) => void>;
	xmlDeregisterNodeDefaultValue: interop.FunctionReference<(p1: number) => void>;
	xmlMallocAtomic: number;
	xmlLastError: number;
	xmlParserInputBufferCreateFilenameValue: number;
	xmlOutputBufferCreateFilenameValue: number;
	xmlStructuredErrorContext: interop.Pointer | interop.Reference<any>;
}
declare var _xmlGlobalState: interop.StructType<_xmlGlobalState>;

interface _xmlID {
	next: interop.Pointer | interop.Reference<_xmlID>;
	value: interop.Pointer | interop.Reference<number>;
	attr: interop.Pointer | interop.Reference<_xmlAttr>;
	name: interop.Pointer | interop.Reference<number>;
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
	name: interop.Pointer | interop.Reference<number>;
	children: interop.Pointer | interop.Reference<_xmlNode>;
	last: interop.Pointer | interop.Reference<_xmlNode>;
	parent: interop.Pointer | interop.Reference<_xmlNode>;
	next: interop.Pointer | interop.Reference<_xmlNode>;
	prev: interop.Pointer | interop.Reference<_xmlNode>;
	doc: interop.Pointer | interop.Reference<_xmlDoc>;
	ns: interop.Pointer | interop.Reference<_xmlNs>;
	content: interop.Pointer | interop.Reference<number>;
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
	name: interop.Pointer | interop.Reference<number>;
	PublicID: interop.Pointer | interop.Reference<number>;
	SystemID: interop.Pointer | interop.Reference<number>;
}
declare var _xmlNotation: interop.StructType<_xmlNotation>;

interface _xmlNs {
	next: interop.Pointer | interop.Reference<_xmlNs>;
	type: xmlElementType;
	href: interop.Pointer | interop.Reference<number>;
	prefix: interop.Pointer | interop.Reference<number>;
	_private: interop.Pointer | interop.Reference<any>;
	context: interop.Pointer | interop.Reference<_xmlDoc>;
}
declare var _xmlNs: interop.StructType<_xmlNs>;

interface _xmlParserCtxt {
	sax: interop.Pointer | interop.Reference<_xmlSAXHandler>;
	userData: interop.Pointer | interop.Reference<any>;
	myDoc: number;
	wellFormed: number;
	replaceEntities: number;
	version: interop.Pointer | interop.Reference<number>;
	encoding: interop.Pointer | interop.Reference<number>;
	standalone: number;
	html: number;
	input: number;
	inputNr: number;
	inputMax: number;
	inputTab: interop.Pointer | interop.Reference<number>;
	node: number;
	nodeNr: number;
	nodeMax: number;
	nodeTab: interop.Pointer | interop.Reference<number>;
	record_info: number;
	node_seq: _xmlParserNodeInfoSeq;
	errNo: number;
	hasExternalSubset: number;
	hasPErefs: number;
	external: number;
	valid: number;
	validate: number;
	vctxt: number;
	instate: xmlParserInputState;
	token: number;
	directory: string;
	name: interop.Pointer | interop.Reference<number>;
	nameNr: number;
	nameMax: number;
	nameTab: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;
	nbChars: number;
	checkIndex: number;
	keepBlanks: number;
	disableSAX: number;
	inSubset: number;
	intSubName: interop.Pointer | interop.Reference<number>;
	extSubURI: interop.Pointer | interop.Reference<number>;
	extSubSystem: interop.Pointer | interop.Reference<number>;
	space: interop.Pointer | interop.Reference<number>;
	spaceNr: number;
	spaceMax: number;
	spaceTab: interop.Pointer | interop.Reference<number>;
	depth: number;
	entity: number;
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
	dict: number;
	atts: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;
	maxatts: number;
	docdict: number;
	str_xml: interop.Pointer | interop.Reference<number>;
	str_xmlns: interop.Pointer | interop.Reference<number>;
	str_xml_ns: interop.Pointer | interop.Reference<number>;
	sax2: number;
	nsNr: number;
	nsMax: number;
	nsTab: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;
	attallocs: interop.Pointer | interop.Reference<number>;
	pushTab: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>;
	attsDefault: number;
	attsSpecial: number;
	nsWellFormed: number;
	options: number;
	dictNames: number;
	freeElemsNr: number;
	freeElems: number;
	freeAttrsNr: number;
	freeAttrs: number;
	lastError: number;
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
	buf: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<number>) => number>;
	filename: string;
	directory: string;
	base: interop.Pointer | interop.Reference<number>;
	cur: interop.Pointer | interop.Reference<number>;
	end: interop.Pointer | interop.Reference<number>;
	length: number;
	line: number;
	col: number;
	consumed: number;
	free: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<number>) => void>;
	encoding: interop.Pointer | interop.Reference<number>;
	version: interop.Pointer | interop.Reference<number>;
	standalone: number;
	id: number;
}
declare var _xmlParserInput: interop.StructType<_xmlParserInput>;

interface _xmlParserInputBuffer {
	context: interop.Pointer | interop.Reference<any>;
	readcallback: number;
	closecallback: number;
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
	value: interop.Pointer | interop.Reference<number>;
	attr: interop.Pointer | interop.Reference<_xmlAttr>;
	name: interop.Pointer | interop.Reference<number>;
	lineno: number;
}
declare var _xmlRef: interop.StructType<_xmlRef>;

interface _xmlSAXHandler {
	internalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => void>;
	isStandalone: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	hasInternalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	hasExternalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	resolveEntity: number;
	getEntity: number;
	entityDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<number>) => void>;
	notationDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => void>;
	attributeDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<number>, p7: number) => void>;
	elementDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: number) => void>;
	unparsedEntityDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>) => void>;
	setDocumentLocator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => void>;
	startDocument: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	endDocument: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	startElement: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>) => void>;
	endElement: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>) => void>;
	reference: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>) => void>;
	characters: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number) => void>;
	ignorableWhitespace: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number) => void>;
	processingInstruction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>) => void>;
	comment: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>) => void>;
	warning: number;
	error: number;
	fatalError: number;
	getParameterEntity: number;
	cdataBlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number) => void>;
	externalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => void>;
	initialized: number;
	_private: interop.Pointer | interop.Reference<any>;
	startElementNs: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>, p5: number, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, p7: number, p8: number, p9: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>) => void>;
	endElementNs: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => void>;
	serror: number;
}
declare var _xmlSAXHandler: interop.StructType<_xmlSAXHandler>;

interface _xmlSAXHandlerV1 {
	internalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => void>;
	isStandalone: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	hasInternalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	hasExternalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	resolveEntity: number;
	getEntity: number;
	entityDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>, p6: interop.Pointer | interop.Reference<number>) => void>;
	notationDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => void>;
	attributeDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: number, p5: number, p6: interop.Pointer | interop.Reference<number>, p7: number) => void>;
	elementDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: number) => void>;
	unparsedEntityDecl: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>, p5: interop.Pointer | interop.Reference<number>) => void>;
	setDocumentLocator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => void>;
	startDocument: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	endDocument: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	startElement: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>) => void>;
	endElement: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>) => void>;
	reference: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>) => void>;
	characters: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number) => void>;
	ignorableWhitespace: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number) => void>;
	processingInstruction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>) => void>;
	comment: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>) => void>;
	warning: number;
	error: number;
	fatalError: number;
	getParameterEntity: number;
	cdataBlock: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: number) => void>;
	externalSubset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: interop.Pointer | interop.Reference<number>) => void>;
	initialized: number;
}
declare var _xmlSAXHandlerV1: interop.StructType<_xmlSAXHandlerV1>;

interface _xmlSAXLocator {
	getPublicId: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<number>>;
	getSystemId: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<number>>;
	getLineNumber: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	getColumnNumber: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
}
declare var _xmlSAXLocator: interop.StructType<_xmlSAXLocator>;

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
	error: number;
	warning: number;
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
	name: interop.Pointer | interop.Reference<number>;
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
	varLookupFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>) => interop.Pointer | interop.Reference<_xmlXPathObject>>;
	varLookupData: interop.Pointer | interop.Reference<any>;
	extra: interop.Pointer | interop.Reference<any>;
	function: interop.Pointer | interop.Reference<number>;
	functionURI: interop.Pointer | interop.Reference<number>;
	funcLookupFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>) => interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>>;
	funcLookupData: interop.Pointer | interop.Reference<any>;
	tmpNsList: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlNs>>;
	tmpNsNr: number;
	userData: interop.Pointer | interop.Reference<any>;
	error: number;
	lastError: number;
	debugNode: interop.Pointer | interop.Reference<_xmlNode>;
	dict: interop.Pointer | interop.Reference<any>;
	flags: number;
	cache: interop.Pointer | interop.Reference<any>;
}
declare var _xmlXPathContext: interop.StructType<_xmlXPathContext>;

interface _xmlXPathFunct {
	name: interop.Pointer | interop.Reference<number>;
	func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>;
}
declare var _xmlXPathFunct: interop.StructType<_xmlXPathFunct>;

interface _xmlXPathObject {
	type: xmlXPathObjectType;
	nodesetval: interop.Pointer | interop.Reference<_xmlNodeSet>;
	boolval: number;
	floatval: number;
	stringval: interop.Pointer | interop.Reference<number>;
	user: interop.Pointer | interop.Reference<any>;
	index: number;
	user2: interop.Pointer | interop.Reference<any>;
	index2: number;
}
declare var _xmlXPathObject: interop.StructType<_xmlXPathObject>;

interface _xmlXPathParserContext {
	cur: interop.Pointer | interop.Reference<number>;
	base: interop.Pointer | interop.Reference<number>;
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
	name: interop.Pointer | interop.Reference<number>;
	func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathObject>, p2: number) => number>;
}
declare var _xmlXPathType: interop.StructType<_xmlXPathType>;

interface _xmlXPathVariable {
	name: interop.Pointer | interop.Reference<number>;
	value: interop.Pointer | interop.Reference<_xmlXPathObject>;
}
declare var _xmlXPathVariable: interop.StructType<_xmlXPathVariable>;

declare function inputPop(ctxt: number): number;

declare function nodePop(ctxt: number): number;

declare var size_t: number;

declare var size_tVar: number;

declare var size_tVar2: number;

declare var size_tVar3: number;

declare function valuePop(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function valuePush(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, value: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlAddAttributeDecl(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, dtd: interop.Pointer | interop.Reference<_xmlDtd>, elem: interop.Pointer | interop.Reference<number>, name: interop.Pointer | interop.Reference<number>, ns: interop.Pointer | interop.Reference<number>, type: xmlAttributeType, def: xmlAttributeDefault, defaultValue: interop.Pointer | interop.Reference<number>, tree: interop.Pointer | interop.Reference<_xmlEnumeration>): number;

declare function xmlAddDocEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: interop.Pointer | interop.Reference<number>, type: number, ExternalID: interop.Pointer | interop.Reference<number>, SystemID: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlAddDtdEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: interop.Pointer | interop.Reference<number>, type: number, ExternalID: interop.Pointer | interop.Reference<number>, SystemID: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlAddElementDecl(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, dtd: interop.Pointer | interop.Reference<_xmlDtd>, name: interop.Pointer | interop.Reference<number>, type: xmlElementTypeVal, content: interop.Pointer | interop.Reference<_xmlElementContent>): number;

declare function xmlAddID(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, value: interop.Pointer | interop.Reference<number>, attr: interop.Pointer | interop.Reference<_xmlAttr>): number;

declare function xmlAddNotationDecl(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, dtd: interop.Pointer | interop.Reference<_xmlDtd>, name: interop.Pointer | interop.Reference<number>, PublicID: interop.Pointer | interop.Reference<number>, SystemID: interop.Pointer | interop.Reference<number>): number;

declare function xmlAddRef(ctxt: interop.Pointer | interop.Reference<_xmlValidCtxt>, doc: interop.Pointer | interop.Reference<_xmlDoc>, value: interop.Pointer | interop.Reference<number>, attr: interop.Pointer | interop.Reference<_xmlAttr>): number;

declare function xmlAllocParserInputBuffer(enc: xmlCharEncodingEnum): number;

declare var xmlAttrPtr: number;

declare var xmlAttrPtrVar: number;

declare var xmlAttrPtrVar2: number;

declare var xmlAttrPtrVar3: number;

declare var xmlAttrPtrVar4: number;

declare var xmlAttrPtrVar5: number;

declare var xmlAttrPtrVar6: number;

declare var xmlAttrPtrVar7: number;

declare const enum xmlAttributeDefault {

	XML_ATTRIBUTE_NONE = 1,

	XML_ATTRIBUTE_REQUIRED = 2,

	XML_ATTRIBUTE_IMPLIED = 3,

	XML_ATTRIBUTE_FIXED = 4
}

declare var xmlAttributePtr: number;

declare var xmlAttributePtrVar: number;

declare var xmlAttributePtrVar2: number;

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

declare var xmlBufferAllocationScheme: number;

declare const enum xmlBufferAllocationSchemeEnum {

	XML_BUFFER_ALLOC_DOUBLEIT = 0,

	XML_BUFFER_ALLOC_EXACT = 1,

	XML_BUFFER_ALLOC_IMMUTABLE = 2,

	XML_BUFFER_ALLOC_IO = 3,

	XML_BUFFER_ALLOC_HYBRID = 4,

	XML_BUFFER_ALLOC_BOUNDED = 5
}

declare var xmlBufferAllocationSchemeVar: number;

declare var xmlBufferAllocationSchemeVar2: number;

declare var xmlBufferAllocationSchemeVar3: number;

declare var xmlBufferPtr: number;

declare var xmlBufferPtrVar: number;

declare var xmlBufferPtrVar2: number;

declare var xmlChar: number;

declare var xmlCharEncoding: number;

declare const enum xmlCharEncodingEnum {

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

declare var xmlCharEncodingHandlerPtr: number;

declare var xmlCharEncodingHandlerPtrVar: number;

declare var xmlCharEncodingHandlerPtrVar2: number;

declare var xmlCharEncodingVar: number;

declare function xmlCharStrdup(cur: string): interop.Pointer | interop.Reference<number>;

declare function xmlCharStrndup(cur: string, len: number): interop.Pointer | interop.Reference<number>;

declare var xmlCharVar: number;

declare var xmlCharVar10: number;

declare var xmlCharVar11: number;

declare var xmlCharVar12: number;

declare var xmlCharVar13: number;

declare var xmlCharVar14: number;

declare var xmlCharVar15: number;

declare var xmlCharVar16: number;

declare var xmlCharVar17: number;

declare var xmlCharVar18: number;

declare var xmlCharVar19: number;

declare var xmlCharVar2: number;

declare var xmlCharVar20: number;

declare var xmlCharVar21: number;

declare var xmlCharVar22: number;

declare var xmlCharVar23: number;

declare var xmlCharVar24: number;

declare var xmlCharVar25: number;

declare var xmlCharVar26: number;

declare var xmlCharVar27: number;

declare var xmlCharVar28: number;

declare var xmlCharVar29: number;

declare var xmlCharVar3: number;

declare var xmlCharVar30: number;

declare var xmlCharVar31: number;

declare var xmlCharVar32: number;

declare var xmlCharVar33: number;

declare var xmlCharVar34: number;

declare var xmlCharVar4: number;

declare var xmlCharVar5: number;

declare var xmlCharVar6: number;

declare var xmlCharVar7: number;

declare var xmlCharVar8: number;

declare var xmlCharVar9: number;

declare function xmlCheckHTTPInput(ctxt: number, ret: number): number;

declare function xmlCheckUTF8(utf: string): number;

declare function xmlCheckVersion(version: number): void;

declare function xmlCopyDocElementContent(doc: interop.Pointer | interop.Reference<_xmlDoc>, content: interop.Pointer | interop.Reference<_xmlElementContent>): number;

declare function xmlCopyElementContent(content: interop.Pointer | interop.Reference<_xmlElementContent>): number;

declare function xmlCreateEntitiesTable(): number;

declare function xmlCreateEntityParserCtxt(URL: interop.Pointer | interop.Reference<number>, ID: interop.Pointer | interop.Reference<number>, base: interop.Pointer | interop.Reference<number>): number;

declare function xmlCreateEnumeration(name: interop.Pointer | interop.Reference<number>): number;

declare function xmlCreateFileParserCtxt(filename: string): number;

declare function xmlCreateMemoryParserCtxt(buffer: string, size: number): number;

declare function xmlCreateURI(): number;

declare function xmlCreateURLParserCtxt(filename: string, options: number): number;

declare function xmlCtxtGetLastError(ctx: interop.Pointer | interop.Reference<any>): number;

declare var xmlDOMWrapCtxtPtr: number;

declare var xmlDeregisterNodeFunc: number;

declare var xmlDeregisterNodeFuncVar: number;

declare var xmlDeregisterNodeFuncVar2: number;

declare var xmlDeregisterNodeFuncVar3: number;

declare function xmlDetectCharEncoding(_in: string, len: number): number;

declare function xmlDictCreate(): number;

declare function xmlDictCreateSub(sub: interop.Pointer | interop.Reference<any>): number;

declare function xmlDictGetUsage(dict: interop.Pointer | interop.Reference<any>): number;

declare var xmlDictPtr: number;

declare var xmlDictPtrVar: number;

declare function xmlDictSetLimit(dict: interop.Pointer | interop.Reference<any>, limit: number): number;

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

declare var xmlDocPtr: number;

declare var xmlDocPtrVar: number;

declare var xmlDocPtrVar10: number;

declare var xmlDocPtrVar2: number;

declare var xmlDocPtrVar3: number;

declare var xmlDocPtrVar4: number;

declare var xmlDocPtrVar5: number;

declare var xmlDocPtrVar6: number;

declare var xmlDocPtrVar7: number;

declare var xmlDocPtrVar8: number;

declare var xmlDocPtrVar9: number;

declare var xmlDtdPtr: number;

declare var xmlDtdPtrVar: number;

declare var xmlDtdPtrVar2: number;

declare const enum xmlElementContentOccur {

	XML_ELEMENT_CONTENT_ONCE = 1,

	XML_ELEMENT_CONTENT_OPT = 2,

	XML_ELEMENT_CONTENT_MULT = 3,

	XML_ELEMENT_CONTENT_PLUS = 4
}

declare var xmlElementContentPtr: number;

declare var xmlElementContentPtrVar: number;

declare var xmlElementContentPtrVar2: number;

declare var xmlElementContentPtrVar3: number;

declare var xmlElementContentPtrVar4: number;

declare var xmlElementContentPtrVar5: number;

declare const enum xmlElementContentType {

	XML_ELEMENT_CONTENT_PCDATA = 1,

	XML_ELEMENT_CONTENT_ELEMENT = 2,

	XML_ELEMENT_CONTENT_SEQ = 3,

	XML_ELEMENT_CONTENT_OR = 4
}

declare var xmlElementPtr: number;

declare var xmlElementPtrVar: number;

declare var xmlElementPtrVar2: number;

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

	XML_XINCLUDE_END = 20
}

declare const enum xmlElementTypeVal {

	XML_ELEMENT_TYPE_UNDEFINED = 0,

	XML_ELEMENT_TYPE_EMPTY = 1,

	XML_ELEMENT_TYPE_ANY = 2,

	XML_ELEMENT_TYPE_MIXED = 3,

	XML_ELEMENT_TYPE_ELEMENT = 4
}

declare var xmlEntitiesTablePtr: number;

declare var xmlEntityPtr: number;

declare var xmlEntityPtrVar: number;

declare var xmlEntityPtrVar2: number;

declare var xmlEntityPtrVar3: number;

declare var xmlEntityPtrVar4: number;

declare var xmlEntityPtrVar5: number;

declare var xmlEntityPtrVar6: number;

declare var xmlEntityPtrVar7: number;

declare var xmlEntityPtrVar8: number;

declare var xmlEntityPtrVar9: number;

declare const enum xmlEntityType {

	XML_INTERNAL_GENERAL_ENTITY = 1,

	XML_EXTERNAL_GENERAL_PARSED_ENTITY = 2,

	XML_EXTERNAL_GENERAL_UNPARSED_ENTITY = 3,

	XML_INTERNAL_PARAMETER_ENTITY = 4,

	XML_EXTERNAL_PARAMETER_ENTITY = 5,

	XML_INTERNAL_PREDEFINED_ENTITY = 6
}

declare var xmlEnumerationPtr: number;

declare var xmlEnumerationPtrVar: number;

declare var xmlEnumerationPtrVar2: number;

declare var xmlError: number;

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

declare var xmlErrorPtr: number;

declare var xmlErrorPtrVar: number;

declare var xmlErrorVar: number;

declare var xmlExternalEntityLoader: number;

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

declare function xmlFindCharEncodingHandler(name: string): number;

declare var xmlFreeFunc: number;

declare function xmlFreeTextWriter(writer: interop.Pointer | interop.Reference<any>): void;

declare var xmlGenericErrorFunc: number;

declare var xmlGenericErrorFuncVar: number;

declare function xmlGetCharEncodingHandler(enc: xmlCharEncodingEnum): number;

declare function xmlGetDocEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetDtdAttrDesc(dtd: interop.Pointer | interop.Reference<_xmlDtd>, elem: interop.Pointer | interop.Reference<number>, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetDtdElementDesc(dtd: interop.Pointer | interop.Reference<_xmlDtd>, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetDtdEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetDtdNotationDesc(dtd: interop.Pointer | interop.Reference<_xmlDtd>, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetDtdQAttrDesc(dtd: interop.Pointer | interop.Reference<_xmlDtd>, elem: interop.Pointer | interop.Reference<number>, name: interop.Pointer | interop.Reference<number>, prefix: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetDtdQElementDesc(dtd: interop.Pointer | interop.Reference<_xmlDtd>, name: interop.Pointer | interop.Reference<number>, prefix: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetID(doc: interop.Pointer | interop.Reference<_xmlDoc>, ID: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetLastError(): number;

declare function xmlGetParameterEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetPredefinedEntity(name: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetRefs(doc: interop.Pointer | interop.Reference<_xmlDoc>, ID: interop.Pointer | interop.Reference<number>): number;

declare function xmlGetUTF8Char(utf: string, len: interop.Pointer | interop.Reference<number>): number;

declare var xmlGlobalStatePtr: number;

declare function xmlHashCopy(table: interop.Pointer | interop.Reference<any>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>) => interop.Pointer | interop.Reference<any>>): number;

declare function xmlHashCreate(size: number): number;

declare function xmlHashCreateDict(size: number, dict: interop.Pointer | interop.Reference<any>): number;

declare var xmlHashTablePtr: number;

declare var xmlHashTablePtrVar: number;

declare var xmlHashTablePtrVar2: number;

declare var xmlIDPtr: number;

declare var xmlLinkPtr: number;

declare var xmlLinkPtrVar: number;

declare function xmlListCreate(deallocator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, compare: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => number>): number;

declare function xmlListDup(old: interop.Pointer | interop.Reference<any>): number;

declare function xmlListEnd(l: interop.Pointer | interop.Reference<any>): number;

declare function xmlListFront(l: interop.Pointer | interop.Reference<any>): number;

declare var xmlListPtr: number;

declare var xmlListPtrVar: number;

declare var xmlListPtrVar2: number;

declare var xmlMallocFunc: number;

declare var xmlMallocFuncVar: number;

declare var xmlMutexPtr: number;

declare function xmlNewCharEncodingHandler(name: string, input: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<number>, p3: string, p4: interop.Pointer | interop.Reference<number>) => number>, output: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<number>, p3: string, p4: interop.Pointer | interop.Reference<number>) => number>): number;

declare function xmlNewDocElementContent(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: interop.Pointer | interop.Reference<number>, type: xmlElementContentType): number;

declare function xmlNewElementContent(name: interop.Pointer | interop.Reference<number>, type: xmlElementContentType): number;

declare function xmlNewEntity(doc: interop.Pointer | interop.Reference<_xmlDoc>, name: interop.Pointer | interop.Reference<number>, type: number, ExternalID: interop.Pointer | interop.Reference<number>, SystemID: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlNewEntityInputStream(ctxt: number, entity: number): number;

declare function xmlNewInputFromFile(ctxt: number, filename: string): number;

declare function xmlNewInputStream(ctxt: number): number;

declare function xmlNewStringInputStream(ctxt: number, buffer: interop.Pointer | interop.Reference<number>): number;

declare function xmlNewTextWriter(out: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<number>) => number>): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriterDoc(doc: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_xmlDoc>>, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriterFilename(uri: string, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriterMemory(buf: interop.Pointer | interop.Reference<_xmlBuffer>, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriterPushParser(ctxt: number, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlNewTextWriterTree(doc: interop.Pointer | interop.Reference<_xmlDoc>, node: interop.Pointer | interop.Reference<_xmlNode>, compression: number): interop.Pointer | interop.Reference<any>;

declare function xmlNoNetExternalEntityLoader(URL: string, ID: string, ctxt: number): number;

declare var xmlNodePtr: number;

declare var xmlNodePtrVar: number;

declare var xmlNodePtrVar10: number;

declare var xmlNodePtrVar11: number;

declare var xmlNodePtrVar12: number;

declare var xmlNodePtrVar13: number;

declare var xmlNodePtrVar14: number;

declare var xmlNodePtrVar15: number;

declare var xmlNodePtrVar16: number;

declare var xmlNodePtrVar17: number;

declare var xmlNodePtrVar18: number;

declare var xmlNodePtrVar19: number;

declare var xmlNodePtrVar2: number;

declare var xmlNodePtrVar20: number;

declare var xmlNodePtrVar21: number;

declare var xmlNodePtrVar22: number;

declare var xmlNodePtrVar23: number;

declare var xmlNodePtrVar24: number;

declare var xmlNodePtrVar25: number;

declare var xmlNodePtrVar26: number;

declare var xmlNodePtrVar27: number;

declare var xmlNodePtrVar28: number;

declare var xmlNodePtrVar3: number;

declare var xmlNodePtrVar4: number;

declare var xmlNodePtrVar5: number;

declare var xmlNodePtrVar6: number;

declare var xmlNodePtrVar7: number;

declare var xmlNodePtrVar8: number;

declare var xmlNodePtrVar9: number;

declare var xmlNotationPtr: number;

declare var xmlNotationPtrVar: number;

declare var xmlNsPtr: number;

declare var xmlNsPtrVar: number;

declare var xmlNsPtrVar2: number;

declare var xmlNsPtrVar3: number;

declare var xmlNsPtrVar4: number;

declare var xmlOutputBufferCreateFilenameFunc: number;

declare var xmlOutputBufferCreateFilenameFuncVar: number;

declare var xmlOutputBufferCreateFilenameFuncVar2: number;

declare var xmlOutputBufferCreateFilenameFuncVar3: number;

declare function xmlParseCharEncoding(name: string): number;

declare function xmlParseElementChildrenContentDecl(ctxt: number, inputchk: number): number;

declare function xmlParseElementMixedContentDecl(ctxt: number, inputchk: number): number;

declare function xmlParseEntityRef(ctxt: number): number;

declare function xmlParseEnumerationType(ctxt: number): number;

declare function xmlParseNotationType(ctxt: number): number;

declare function xmlParseURI(str: string): number;

declare function xmlParseURIRaw(str: string, raw: number): number;

declare var xmlParserCtxtPtr: number;

declare var xmlParserCtxtPtrVar: number;

declare var xmlParserCtxtPtrVar2: number;

declare var xmlParserCtxtPtrVar3: number;

declare var xmlParserCtxtPtrVar4: number;

declare var xmlParserCtxtPtrVar5: number;

declare var xmlParserCtxtPtrVar6: number;

declare var xmlParserErrors: number;

declare const enum xmlParserErrorsEnum {

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

declare function xmlParserInputBufferCreateFd(fd: number, enc: xmlCharEncodingEnum): number;

declare function xmlParserInputBufferCreateFile(file: interop.Pointer | interop.Reference<FILE>, enc: xmlCharEncodingEnum): number;

declare function xmlParserInputBufferCreateFilename(URI: string, enc: xmlCharEncodingEnum): number;

declare var xmlParserInputBufferCreateFilenameFunc: number;

declare var xmlParserInputBufferCreateFilenameFuncVar: number;

declare var xmlParserInputBufferCreateFilenameFuncVar2: number;

declare var xmlParserInputBufferCreateFilenameFuncVar3: number;

declare function xmlParserInputBufferCreateIO(ioread: number, ioclose: number, ioctx: interop.Pointer | interop.Reference<any>, enc: xmlCharEncodingEnum): number;

declare function xmlParserInputBufferCreateMem(mem: string, size: number, enc: xmlCharEncodingEnum): number;

declare function xmlParserInputBufferCreateStatic(mem: string, size: number, enc: xmlCharEncodingEnum): number;

declare var xmlParserInputBufferPtr: number;

declare var xmlParserInputBufferPtrVar: number;

declare var xmlParserInputBufferPtrVar2: number;

declare var xmlParserInputBufferPtrVar3: number;

declare var xmlParserInputBufferPtrVar4: number;

declare var xmlParserInputBufferPtrVar5: number;

declare var xmlParserInputBufferPtrVar6: number;

declare var xmlParserInputPtr: number;

declare var xmlParserInputPtrVar: number;

declare var xmlParserInputPtrVar2: number;

declare var xmlParserInputPtrVar3: number;

declare var xmlParserInputPtrVar4: number;

declare var xmlParserInputPtrVar5: number;

declare var xmlParserInputPtrVar6: number;

declare var xmlParserInputPtrVar7: number;

declare var xmlParserInputPtrVar8: number;

declare var xmlParserInputPtrVar9: number;

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

declare const enum xmlParserSeverities {

	XML_PARSER_SEVERITY_VALIDITY_WARNING = 1,

	XML_PARSER_SEVERITY_VALIDITY_ERROR = 2,

	XML_PARSER_SEVERITY_WARNING = 3,

	XML_PARSER_SEVERITY_ERROR = 4
}

declare function xmlPopInput(ctxt: number): number;

declare var xmlRMutexPtr: number;

declare var xmlReallocFunc: number;

declare var xmlRefPtr: number;

declare var xmlRegisterNodeFunc: number;

declare var xmlRegisterNodeFuncVar: number;

declare var xmlRegisterNodeFuncVar2: number;

declare var xmlRegisterNodeFuncVar3: number;

declare var xmlSAXHandlerV1: number;

declare var xmlSAXHandlerV1Var: number;

declare var xmlSAXLocator: number;

declare var xmlSAXLocatorVar: number;

declare function xmlStrEqual(str1: interop.Pointer | interop.Reference<number>, str2: interop.Pointer | interop.Reference<number>): number;

declare function xmlStrQEqual(pref: interop.Pointer | interop.Reference<number>, name: interop.Pointer | interop.Reference<number>, str: interop.Pointer | interop.Reference<number>): number;

declare function xmlStrcasecmp(str1: interop.Pointer | interop.Reference<number>, str2: interop.Pointer | interop.Reference<number>): number;

declare function xmlStrcasestr(str: interop.Pointer | interop.Reference<number>, val: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function xmlStrcat(cur: interop.Pointer | interop.Reference<number>, add: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function xmlStrchr(str: interop.Pointer | interop.Reference<number>, val: number): interop.Pointer | interop.Reference<number>;

declare function xmlStrcmp(str1: interop.Pointer | interop.Reference<number>, str2: interop.Pointer | interop.Reference<number>): number;

declare function xmlStrdup(cur: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare var xmlStrdupFunc: number;

declare function xmlStrlen(str: interop.Pointer | interop.Reference<number>): number;

declare function xmlStrncasecmp(str1: interop.Pointer | interop.Reference<number>, str2: interop.Pointer | interop.Reference<number>, len: number): number;

declare function xmlStrncat(cur: interop.Pointer | interop.Reference<number>, add: interop.Pointer | interop.Reference<number>, len: number): interop.Pointer | interop.Reference<number>;

declare function xmlStrncatNew(str1: interop.Pointer | interop.Reference<number>, str2: interop.Pointer | interop.Reference<number>, len: number): interop.Pointer | interop.Reference<number>;

declare function xmlStrncmp(str1: interop.Pointer | interop.Reference<number>, str2: interop.Pointer | interop.Reference<number>, len: number): number;

declare function xmlStrndup(cur: interop.Pointer | interop.Reference<number>, len: number): interop.Pointer | interop.Reference<number>;

declare function xmlStrstr(str: interop.Pointer | interop.Reference<number>, val: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function xmlStrsub(str: interop.Pointer | interop.Reference<number>, start: number, len: number): interop.Pointer | interop.Reference<number>;

declare var xmlStructuredErrorFunc: number;

declare var xmlStructuredErrorFuncVar: number;

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

declare function xmlTextWriterSetIndentString(writer: interop.Pointer | interop.Reference<any>, str: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterSetQuoteChar(writer: interop.Pointer | interop.Reference<any>, quotechar: number): number;

declare function xmlTextWriterStartAttribute(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterStartAttributeNS(writer: interop.Pointer | interop.Reference<any>, prefix: interop.Pointer | interop.Reference<number>, name: interop.Pointer | interop.Reference<number>, namespaceURI: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterStartCDATA(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartComment(writer: interop.Pointer | interop.Reference<any>): number;

declare function xmlTextWriterStartDTD(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>, pubid: interop.Pointer | interop.Reference<number>, sysid: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterStartDTDAttlist(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterStartDTDElement(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterStartDTDEntity(writer: interop.Pointer | interop.Reference<any>, pe: number, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterStartDocument(writer: interop.Pointer | interop.Reference<any>, version: string, encoding: string, standalone: string): number;

declare function xmlTextWriterStartElement(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterStartElementNS(writer: interop.Pointer | interop.Reference<any>, prefix: interop.Pointer | interop.Reference<number>, name: interop.Pointer | interop.Reference<number>, namespaceURI: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterStartPI(writer: interop.Pointer | interop.Reference<any>, target: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteAttribute(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteAttributeNS(writer: interop.Pointer | interop.Reference<any>, prefix: interop.Pointer | interop.Reference<number>, name: interop.Pointer | interop.Reference<number>, namespaceURI: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteBase64(writer: interop.Pointer | interop.Reference<any>, data: string, start: number, len: number): number;

declare function xmlTextWriterWriteBinHex(writer: interop.Pointer | interop.Reference<any>, data: string, start: number, len: number): number;

declare function xmlTextWriterWriteCDATA(writer: interop.Pointer | interop.Reference<any>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteComment(writer: interop.Pointer | interop.Reference<any>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteDTD(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>, pubid: interop.Pointer | interop.Reference<number>, sysid: interop.Pointer | interop.Reference<number>, subset: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteDTDAttlist(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteDTDElement(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteDTDEntity(writer: interop.Pointer | interop.Reference<any>, pe: number, name: interop.Pointer | interop.Reference<number>, pubid: interop.Pointer | interop.Reference<number>, sysid: interop.Pointer | interop.Reference<number>, ndataid: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteDTDExternalEntity(writer: interop.Pointer | interop.Reference<any>, pe: number, name: interop.Pointer | interop.Reference<number>, pubid: interop.Pointer | interop.Reference<number>, sysid: interop.Pointer | interop.Reference<number>, ndataid: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteDTDExternalEntityContents(writer: interop.Pointer | interop.Reference<any>, pubid: interop.Pointer | interop.Reference<number>, sysid: interop.Pointer | interop.Reference<number>, ndataid: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteDTDInternalEntity(writer: interop.Pointer | interop.Reference<any>, pe: number, name: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteDTDNotation(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>, pubid: interop.Pointer | interop.Reference<number>, sysid: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteElement(writer: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteElementNS(writer: interop.Pointer | interop.Reference<any>, prefix: interop.Pointer | interop.Reference<number>, name: interop.Pointer | interop.Reference<number>, namespaceURI: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWritePI(writer: interop.Pointer | interop.Reference<any>, target: interop.Pointer | interop.Reference<number>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteRaw(writer: interop.Pointer | interop.Reference<any>, content: interop.Pointer | interop.Reference<number>): number;

declare function xmlTextWriterWriteRawLen(writer: interop.Pointer | interop.Reference<any>, content: interop.Pointer | interop.Reference<number>, len: number): number;

declare function xmlTextWriterWriteString(writer: interop.Pointer | interop.Reference<any>, content: interop.Pointer | interop.Reference<number>): number;

declare var xmlURIPtr: number;

declare var xmlURIPtrVar: number;

declare var xmlURIPtrVar2: number;

declare function xmlUTF8Charcmp(utf1: interop.Pointer | interop.Reference<number>, utf2: interop.Pointer | interop.Reference<number>): number;

declare function xmlUTF8Size(utf: interop.Pointer | interop.Reference<number>): number;

declare function xmlUTF8Strlen(utf: interop.Pointer | interop.Reference<number>): number;

declare function xmlUTF8Strloc(utf: interop.Pointer | interop.Reference<number>, utfchar: interop.Pointer | interop.Reference<number>): number;

declare function xmlUTF8Strndup(utf: interop.Pointer | interop.Reference<number>, len: number): interop.Pointer | interop.Reference<number>;

declare function xmlUTF8Strpos(utf: interop.Pointer | interop.Reference<number>, pos: number): interop.Pointer | interop.Reference<number>;

declare function xmlUTF8Strsize(utf: interop.Pointer | interop.Reference<number>, len: number): number;

declare function xmlUTF8Strsub(utf: interop.Pointer | interop.Reference<number>, start: number, len: number): interop.Pointer | interop.Reference<number>;

declare function xmlXPathAddValues(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathBooleanFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathCastBooleanToNumber(val: number): number;

declare function xmlXPathCastBooleanToString(val: number): interop.Pointer | interop.Reference<number>;

declare function xmlXPathCastNodeSetToBoolean(ns: interop.Pointer | interop.Reference<_xmlNodeSet>): number;

declare function xmlXPathCastNodeSetToNumber(ns: interop.Pointer | interop.Reference<_xmlNodeSet>): number;

declare function xmlXPathCastNodeSetToString(ns: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<number>;

declare function xmlXPathCastNodeToNumber(node: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlXPathCastNodeToString(node: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<number>;

declare function xmlXPathCastNumberToBoolean(val: number): number;

declare function xmlXPathCastNumberToString(val: number): interop.Pointer | interop.Reference<number>;

declare function xmlXPathCastStringToBoolean(val: interop.Pointer | interop.Reference<number>): number;

declare function xmlXPathCastStringToNumber(val: interop.Pointer | interop.Reference<number>): number;

declare function xmlXPathCastToBoolean(val: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlXPathCastToNumber(val: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlXPathCastToString(val: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<number>;

declare function xmlXPathCeilingFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathCmpNodes(node1: interop.Pointer | interop.Reference<_xmlNode>, node2: interop.Pointer | interop.Reference<_xmlNode>): number;

declare function xmlXPathCompareValues(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, inf: number, strict: number): number;

declare function xmlXPathCompile(str: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function xmlXPathCompiledEval(comp: interop.Pointer | interop.Reference<any>, ctx: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathCompiledEvalToBoolean(comp: interop.Pointer | interop.Reference<any>, ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): number;

declare function xmlXPathConcatFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathContainsFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathContextSetCache(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, active: number, value: number, options: number): number;

declare function xmlXPathConvertBoolean(val: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathConvertNumber(val: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathConvertString(val: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathCountFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathCtxtCompile(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, str: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

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

declare function xmlXPathEval(str: interop.Pointer | interop.Reference<number>, ctx: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathEvalExpr(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathEvalExpression(str: interop.Pointer | interop.Reference<number>, ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

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

declare function xmlXPathFunctionLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: interop.Pointer | interop.Reference<number>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>;

declare function xmlXPathFunctionLookupNS(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: interop.Pointer | interop.Reference<number>, ns_uri: interop.Pointer | interop.Reference<number>): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>;

declare function xmlXPathHasSameNodes(nodes1: interop.Pointer | interop.Reference<_xmlNodeSet>, nodes2: interop.Pointer | interop.Reference<_xmlNodeSet>): number;

declare function xmlXPathIdFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathInit(): void;

declare function xmlXPathIntersection(nodes1: interop.Pointer | interop.Reference<_xmlNodeSet>, nodes2: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathIsInf(val: number): number;

declare function xmlXPathIsNaN(val: number): number;

declare function xmlXPathIsNodeType(name: interop.Pointer | interop.Reference<number>): number;

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

declare function xmlXPathNewCString(val: string): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNewContext(doc: interop.Pointer | interop.Reference<_xmlDoc>): interop.Pointer | interop.Reference<_xmlXPathContext>;

declare function xmlXPathNewFloat(val: number): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNewNodeSet(val: interop.Pointer | interop.Reference<_xmlNode>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNewNodeSetList(val: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathNewParserContext(str: interop.Pointer | interop.Reference<number>, ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathParserContext>;

declare function xmlXPathNewString(val: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<_xmlXPathObject>;

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

declare function xmlXPathNodeEval(node: interop.Pointer | interop.Reference<_xmlNode>, str: interop.Pointer | interop.Reference<number>, ctx: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

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

declare function xmlXPathNsLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, prefix: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

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

declare function xmlXPathParseNCName(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): interop.Pointer | interop.Reference<number>;

declare function xmlXPathParseName(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): interop.Pointer | interop.Reference<number>;

declare function xmlXPathPopBoolean(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): number;

declare function xmlXPathPopExternal(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): interop.Pointer | interop.Reference<any>;

declare function xmlXPathPopNodeSet(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): interop.Pointer | interop.Reference<_xmlNodeSet>;

declare function xmlXPathPopNumber(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): number;

declare function xmlXPathPopString(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): interop.Pointer | interop.Reference<number>;

declare function xmlXPathPositionFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathRegisterAllFunctions(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): void;

declare function xmlXPathRegisterFunc(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: interop.Pointer | interop.Reference<number>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>): number;

declare function xmlXPathRegisterFuncLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>) => interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>>, funcCtxt: interop.Pointer | interop.Reference<any>): void;

declare function xmlXPathRegisterFuncNS(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: interop.Pointer | interop.Reference<number>, ns_uri: interop.Pointer | interop.Reference<number>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_xmlXPathParserContext>, p2: number) => void>): number;

declare function xmlXPathRegisterNs(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, prefix: interop.Pointer | interop.Reference<number>, ns_uri: interop.Pointer | interop.Reference<number>): number;

declare function xmlXPathRegisterVariable(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: interop.Pointer | interop.Reference<number>, value: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlXPathRegisterVariableLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, f: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>) => interop.Pointer | interop.Reference<_xmlXPathObject>>, data: interop.Pointer | interop.Reference<any>): void;

declare function xmlXPathRegisterVariableNS(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: interop.Pointer | interop.Reference<number>, ns_uri: interop.Pointer | interop.Reference<number>, value: interop.Pointer | interop.Reference<_xmlXPathObject>): number;

declare function xmlXPathRegisteredFuncsCleanup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): void;

declare function xmlXPathRegisteredNsCleanup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): void;

declare function xmlXPathRegisteredVariablesCleanup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>): void;

declare function xmlXPathRoot(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>): void;

declare function xmlXPathRoundFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathSetContextNode(node: interop.Pointer | interop.Reference<_xmlNode>, ctx: interop.Pointer | interop.Reference<_xmlXPathContext>): number;

declare function xmlXPathStartsWithFunction(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, nargs: number): void;

declare function xmlXPathStringEvalNumber(str: interop.Pointer | interop.Reference<number>): number;

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

declare function xmlXPathVariableLookup(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathVariableLookupNS(ctxt: interop.Pointer | interop.Reference<_xmlXPathContext>, name: interop.Pointer | interop.Reference<number>, ns_uri: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathWrapCString(val: string): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathWrapExternal(val: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathWrapNodeSet(val: interop.Pointer | interop.Reference<_xmlNodeSet>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPathWrapString(val: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<_xmlXPathObject>;

declare function xmlXPatherror(ctxt: interop.Pointer | interop.Reference<_xmlXPathParserContext>, file: string, line: number, no: number): void;

declare function xmlXPtrBuildNodeList(obj: interop.Pointer | interop.Reference<_xmlXPathObject>): interop.Pointer | interop.Reference<_xmlNode>;

declare function xmlXPtrEval(str: interop.Pointer | interop.Reference<number>, ctx: interop.Pointer | interop.Reference<_xmlXPathContext>): interop.Pointer | interop.Reference<_xmlXPathObject>;

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
