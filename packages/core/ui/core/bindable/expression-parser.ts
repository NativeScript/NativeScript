/**
 * Parses binding expression text into the ESTree nodes that
 * `acorn.parse(text, { ecmaVersion: 2020 })` produces (script source type,
 * no locations, no preserved parens), positions and `raw` included.
 *
 * It mirrors acorn 8.15's structure (tokenizer contexts for regexp/division
 * detection, destructuring error tracking, statement-level ASI) because
 * equivalence depends on those details, not just on the grammar.
 *
 * Constructs that need statement lists or function bodies throw an
 * "Unsupported" SyntaxError where acorn would parse them: statements other
 * than expression, empty, block, labeled and `debugger` statements; function
 * and class expressions; object methods, getters and setters; arrow
 * functions with block bodies.
 */

export interface ExpressionNode {
	type: string;
	start: number;
	end: number;
	[field: string]: any;
}

const BEFORE_EXPR = 1;
const STARTS_EXPR = 2;
const IS_ASSIGN = 4;
const PREFIX = 8;
const POSTFIX = 16;

class TokenType {
	label: string;
	keyword: string;
	beforeExpr: boolean;
	startsExpr: boolean;
	isAssign: boolean;
	prefix: boolean;
	postfix: boolean;
	binop: number;

	constructor(label: string, flags: number, binop: number, keyword: string) {
		this.label = label;
		this.keyword = keyword;
		this.beforeExpr = (flags & BEFORE_EXPR) !== 0;
		this.startsExpr = (flags & STARTS_EXPR) !== 0;
		this.isAssign = (flags & IS_ASSIGN) !== 0;
		this.prefix = (flags & PREFIX) !== 0;
		this.postfix = (flags & POSTFIX) !== 0;
		this.binop = binop;
	}
}

const keywordTypes: Map<string, TokenType> = new Map<string, TokenType>();

function tok(label: string, flags: number): TokenType {
	return new TokenType(label, flags, -1, '');
}

function binop(label: string, prec: number): TokenType {
	return new TokenType(label, BEFORE_EXPR, prec, '');
}

function kw(name: string, flags: number, prec: number): TokenType {
	const type = new TokenType(name, flags, prec, name);
	keywordTypes.set(name, type);
	return type;
}

const tt = {
	num: tok('num', STARTS_EXPR),
	regexp: tok('regexp', STARTS_EXPR),
	string: tok('string', STARTS_EXPR),
	name: tok('name', STARTS_EXPR),
	privateId: tok('privateId', STARTS_EXPR),
	eof: tok('eof', 0),

	bracketL: tok('[', BEFORE_EXPR | STARTS_EXPR),
	bracketR: tok(']', 0),
	braceL: tok('{', BEFORE_EXPR | STARTS_EXPR),
	braceR: tok('}', 0),
	parenL: tok('(', BEFORE_EXPR | STARTS_EXPR),
	parenR: tok(')', 0),
	comma: tok(',', BEFORE_EXPR),
	semi: tok(';', BEFORE_EXPR),
	colon: tok(':', BEFORE_EXPR),
	dot: tok('.', 0),
	question: tok('?', BEFORE_EXPR),
	questionDot: tok('?.', 0),
	arrow: tok('=>', BEFORE_EXPR),
	template: tok('template', 0),
	invalidTemplate: tok('invalidTemplate', 0),
	ellipsis: tok('...', BEFORE_EXPR),
	backQuote: tok('`', STARTS_EXPR),
	dollarBraceL: tok('${', BEFORE_EXPR | STARTS_EXPR),

	eq: tok('=', BEFORE_EXPR | IS_ASSIGN),
	assign: tok('_=', BEFORE_EXPR | IS_ASSIGN),
	incDec: tok('++/--', PREFIX | POSTFIX | STARTS_EXPR),
	prefix: tok('!/~', BEFORE_EXPR | PREFIX | STARTS_EXPR),
	logicalOR: binop('||', 1),
	logicalAND: binop('&&', 2),
	bitwiseOR: binop('|', 3),
	bitwiseXOR: binop('^', 4),
	bitwiseAND: binop('&', 5),
	equality: binop('==/!=/===/!==', 6),
	relational: binop('</>/<=/>=', 7),
	bitShift: binop('<</>>/>>>', 8),
	plusMin: new TokenType('+/-', BEFORE_EXPR | PREFIX | STARTS_EXPR, 9, ''),
	modulo: binop('%', 10),
	star: binop('*', 10),
	slash: binop('/', 10),
	starstar: tok('**', BEFORE_EXPR),
	coalesce: binop('??', 1),

	_break: kw('break', 0, -1),
	_case: kw('case', BEFORE_EXPR, -1),
	_catch: kw('catch', 0, -1),
	_continue: kw('continue', 0, -1),
	_debugger: kw('debugger', 0, -1),
	_default: kw('default', BEFORE_EXPR, -1),
	_do: kw('do', BEFORE_EXPR, -1),
	_else: kw('else', BEFORE_EXPR, -1),
	_finally: kw('finally', 0, -1),
	_for: kw('for', 0, -1),
	_function: kw('function', STARTS_EXPR, -1),
	_if: kw('if', 0, -1),
	_return: kw('return', BEFORE_EXPR, -1),
	_switch: kw('switch', 0, -1),
	_throw: kw('throw', BEFORE_EXPR, -1),
	_try: kw('try', 0, -1),
	_var: kw('var', 0, -1),
	_const: kw('const', 0, -1),
	_while: kw('while', 0, -1),
	_with: kw('with', 0, -1),
	_new: kw('new', BEFORE_EXPR | STARTS_EXPR, -1),
	_this: kw('this', STARTS_EXPR, -1),
	_super: kw('super', STARTS_EXPR, -1),
	_class: kw('class', STARTS_EXPR, -1),
	_extends: kw('extends', BEFORE_EXPR, -1),
	_export: kw('export', 0, -1),
	_import: kw('import', STARTS_EXPR, -1),
	_null: kw('null', STARTS_EXPR, -1),
	_true: kw('true', STARTS_EXPR, -1),
	_false: kw('false', STARTS_EXPR, -1),
	_in: kw('in', BEFORE_EXPR, 7),
	_instanceof: kw('instanceof', BEFORE_EXPR, 7),
	_typeof: kw('typeof', BEFORE_EXPR | PREFIX | STARTS_EXPR, -1),
	_void: kw('void', BEFORE_EXPR | PREFIX | STARTS_EXPR, -1),
	_delete: kw('delete', BEFORE_EXPR | PREFIX | STARTS_EXPR, -1),
};

const UNSUPPORTED_STATEMENT_KEYWORDS = new Set<TokenType>([tt._break, tt._continue, tt._do, tt._for, tt._function, tt._class, tt._if, tt._switch, tt._throw, tt._try, tt._const, tt._var, tt._while, tt._with]);

class TokContext {
	token: string;
	isExpr: boolean;
	preserveSpace: boolean;
	isTemplate: boolean;

	constructor(token: string, isExpr: boolean, isTemplate: boolean) {
		this.token = token;
		this.isExpr = isExpr;
		this.preserveSpace = isTemplate;
		this.isTemplate = isTemplate;
	}
}

const ctxBStat = new TokContext('{', false, false);
const ctxBExpr = new TokContext('{', true, false);
const ctxBTmpl = new TokContext('${', false, false);
const ctxPStat = new TokContext('(', false, false);
const ctxPExpr = new TokContext('(', true, false);
const ctxQTmpl = new TokContext('`', true, true);
const ctxFStat = new TokContext('function', false, false);
const ctxFExpr = new TokContext('function', true, false);

const RESERVED_WORDS = new Set<string>(['enum']);
const RESERVED_WORDS_STRICT = new Set<string>(['enum', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield']);
const RESERVED_WORDS_STRICT_BIND = new Set<string>(['enum', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield', 'eval', 'arguments']);

const SCOPE_TOP = 1;
const SCOPE_FUNCTION = 2;
const SCOPE_ASYNC = 4;
const SCOPE_ARROW = 16;
const SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION;

const BIND_NONE = 0;
const BIND_VAR = 1;

const REGEXP_FLAGS = 'gimsuy';

// Non-ASCII identifier characters as acorn 8.15 classifies them (its Unicode tables, not the
// host's): base-36 deltas of inclusive [first, last] code point pairs. Regenerate by scanning
// acorn's isIdentifierStart / isIdentifierChar over every code point.
const ID_START_RANGES =
	'4q,0,b,0,5,0,6,m,2,u,2,cp,5,b,f,4,8,0,2,0,3m,4,2,1,3,3,2,0,7,0,2,2,2,0,2,j,2,2a,2,3u,9,4l,2,11,3,0,7,14,20,q,5,3,1a,16,10,1,2,2q,2,0,g,1,8,1,b,2,3,0,h,0,2,t,u,2g,c,0,p,w,a,1,5,0,6,l,5,0,a,0,4,0,o,o,8,a,6,n,2,5,i,15,1n,1h,4,0,j,0,8,9,g,f,5,7,3,1,3,l,2,6,2,0,4,3,4,0,h,0,e,1,2,2,f,1,b,0,9,5,5,1,3,l,2,6,2,1,2,1,2,1,w,3,2,0,k,2,h,8,2,2,2,l,2,6,2,1,2,4,4,0,j,0,g,1,o,0,c,7,3,1,3,l,2,6,2,1,2,4,4,0,v,1,2,2,g,0,i,0,2,5,4,2,2,3,4,1,2,0,2,1,4,1,4,2,4,b,n,0,1h,7,2,2,2,m,2,f,4,0,r,2,3,0,3,1,v,0,5,7,2,2,2,m,2,9,2,4,4,0,w,1,2,1,g,1,i,8,2,2,2,14,3,0,h,0,6,2,9,2,p,5,6,h,4,n,2,8,2,0,3,6,1n,1b,2,1,d,6,1n,1,2,0,2,4,2,n,2,0,2,9,2,1,a,0,3,4,2,0,m,3,x,0,1s,7,2,z,s,4,38,16,l,0,h,5,5,3,4,0,4,1,8,2,5,c,d,0,i,11,2,0,6,0,3,16,2,98,2,3,3,6,2,0,2,3,3,14,2,3,3,w,2,3,3,6,2,0,2,3,3,e,2,1k,2,3,3,1u,12,f,h,2d,3,5,4,h7,3,g,2,p,6,22,4,a,8,h,e,i,f,h,f,c,2,2,g,1f,10,0,5,0,1w,2g,8,14,2,0,6,1x,b,u,1e,t,3,4,c,17,5,p,1j,m,a,1g,2b,0,2m,1a,i,7,1j,t,e,1,b,17,r,z,16,2,b,z,3,a,6,16,3,2,16,3,2,5,2,1,4,0,6,5b,1t,7p,3,5,3,11,3,5,3,7,2,0,2,0,2,0,2,u,3,1g,2,6,2,0,4,2,2,6,4,3,3,5,5,c,6,2,2,6,39,0,e,0,h,c,2u,0,5,0,3,9,2,0,3,5,7,0,2,0,2,0,2,f,3,3,6,4,5,0,i,14,22g,6c,7,3,4,1,d,11,2,0,6,0,3,1j,8,0,h,m,a,6,2,6,2,6,2,6,2,6,2,6,2,6,2,6,fb,2,q,8,8,4,3,4,5,2d,5,4,2,2h,2,3,6,16,2,2l,i,v,1d,f,e9,533,1t,h3g,1w,19,3,7g,4,f,b,1,l,1a,h,u,3,27,14,8,3,2u,3,1u,3,1,2,0,2,7,m,f,2,2,2,3,2,m,u,1f,f,1d,1r,5,4,0,2,1,c,r,b,m,q,s,8,1a,t,0,h,4,2,9,b,4,2,14,o,2,2,7,l,m,4,0,4,1d,2,0,4,1,3,4,3,0,2,0,p,2,3,a,8,2,d,5,3,5,3,5,a,6,2,6,2,16,2,d,7,36,u,8mb,d,m,5,1c,6it,a5,3,2x,13,6,d,4,6,0,2,9,2,c,2,4,2,0,2,1,2,1,2,2z,y,a2,j,1r,3,1h,15,b,39,4,2,3q,11,p,7,p,c,2g,4,5,3,5,3,5,3,2,10,b,2,p,2,i,2,1,2,e,3,d,z,3e,1y,1g,7g,s,4,1c,1c,v,e,t,6,11,b,t,3,z,5,7,2,4,17,4d,j,z,5,z,5,13,9,1f,d,a,2,e,2,6,2,1,2,a,2,e,2,6,2,1,4,1f,d,8m,a,l,b,7,p,5,2,15,2,8,1y,5,3,0,2,17,2,1,4,0,3,m,b,m,a,u,1u,i,2,1,b,l,b,p,1z,1j,7,1,1t,0,g,3,2,2,2,s,17,s,4,s,10,7,2,r,s,1h,b,l,b,i,e,h,33,20,1k,1e,e,1e,e,z,13,r,a,m,6z,15,7,1,h,2,1o,s,b,0,9,l,17,h,1b,k,s,m,d,1g,1m,1,3,0,e,18,x,o,r,z,u,0,3,0,9,y,4,0,d,1b,f,3,m,0,2,0,10,h,2,o,k,1,1s,6,2,0,2,3,2,e,2,9,8,1a,13,7,3,1,3,l,2,6,2,1,2,4,4,0,j,0,d,4,v,9,2,0,3,0,2,11,2,0,q,0,2,0,19,1g,j,3,l,2,v,1b,l,1,2,0,55,1a,16,3,11,1b,l,0,1o,16,e,0,20,q,12,6,56,17,39,1r,w,7,3,0,3,7,2,1,2,n,g,0,2,0,2n,7,3,12,h,0,2,0,t,0,b,13,8,0,m,0,c,19,k,0,j,20,5k,w,w,8,2,10,i,0,1e,t,35,6,2,1,2,11,m,0,q,5,2,1,2,v,f,0,94,i,g,0,2,c,2,x,3h,0,28,pl,2v,32,i,5f,219,2o,g,tr,i,5,q,32y,6,g6,5a2,t,1cz,fs,8,u,i,26,i,t,j,1b,h,3,w,k,6,i,c1,18,5w,1r,3l,22,6,0,1v,c,1t,1,2,0,t,4qf,9,yd,16,9,6w8,3,2,6,2,1,2,82,g,0,u,2,3,0,f,3,9,az,1s5,2y,6,c,4,8,8,9,4mf,2c,2,1y,2,1,3,0,3,1,3,3,2,b,2,0,2,6,2,1s,2,3,3,7,2,6,2,r,2,3,2,4,2,0,4,6,2,9f,3,o,2,o,2,u,2,o,2,u,2,o,2,u,2,o,2,u,2,o,2,7,1f9,u,7,5,7a,1p,43,18,b,6,h,0,8y,t,j,17,dh,r,6d,t,3,0,ds,6,2,3,2,1,2,e,2,5g,1o,1v,8,0,xh,3,2,q,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,g,6,2,2,4,2,g,3et,wyn,x,37d,7,65,3,4g1,f,5rk,g,h9,1wj,f1,15v,3t6,6,38f';
const ID_CONTINUE_ONLY_RANGES =
	'53,0,g9,33,o,0,70,4,7e,18,2,0,2,1,2,1,2,0,21,a,1d,u,7,0,2u,6,3,5,3,1,2,3,3,9,o,0,v,q,2k,a,g,9,y,8,a,0,p,3,2,8,2,2,2,4,18,2,1o,8,17,n,2,w,1j,2,2,h,2,6,b,1,3,9,i,2,1l,0,2,6,3,1,3,2,a,0,b,1,3,9,f,0,3,2,1l,0,2,4,5,1,3,2,4,0,l,b,4,0,c,2,1l,0,2,7,2,2,2,2,l,1,3,9,b,5,2,2,1l,0,2,6,3,1,3,2,8,2,b,1,3,9,j,0,1o,4,4,2,2,3,a,0,f,9,h,4,1k,0,2,6,2,2,2,3,8,1,c,1,3,9,i,2,1l,0,2,6,2,2,2,3,8,1,c,1,3,9,4,0,d,3,1k,1,2,6,2,2,2,3,a,0,b,1,3,9,i,2,1z,0,5,5,2,0,2,7,7,9,3,1,1q,0,3,6,d,7,2,9,2g,0,3,8,c,6,2,9,1r,1,7,9,c,0,2,0,2,0,5,1,1e,j,2,1,6,a,2,z,a,0,2t,j,2,9,d,3,5,2,2,2,3,6,4,3,e,b,2,e,jk,2,a,8,pt,3,t,2,u,1,v,1,1t,v,a,0,3,9,y,2,2,a,40,0,3b,b,5,b,b,9,3l,a,1p,4,1m,9,2,s,3,a,7,9,n,d,2,f,1e,4,1c,g,c,9,i,8,d,2,v,c,3,9,19,d,1d,j,9,9,7,9,3b,2,2,k,5,0,7,0,3,2,5j,1r,el,1,1e,1,k,0,3g,c,5,0,4,b,2db,2,3y,0,2p,v,ff,5,2y,1,2p,0,n51,9,1y,0,5,9,x,1,29,1,7l,0,4,0,5,0,o,4,5,0,2c,1,1f,h,b,9,7,h,e,a,t,7,q,c,19,3,1c,d,g,9,c,0,b,9,1c,d,d,0,9,1,3,9,y,2,1f,0,2,2,3,1,6,1,2,0,16,4,6,1,6l,7,2,1,3,9,fmt,0,ki,f,h,f,4,1,p,2,5d,9,12,0,12,0,ig,0,6b,0,46,4,86,9,120,2,2,1,6,3,15,2,5,0,4m,1,fy,3,9,9,7,9,w,4,8u,1,28,3,1z,a,1e,3,3f,2,1i,e,w,a,3,1,b,3,1a,a,8,0,1a,9,7,2,11,d,2,9,6,1,19,0,d,2,1d,d,9,3,2,b,2b,b,7,0,3,0,4e,b,6,9,7,3,1k,1,2,6,3,1,3,2,a,0,b,1,3,6,4,4,1w,8,2,0,3,0,2,3,2,4,2,0,f,1,2b,h,a,9,5,0,2a,j,d,9,5y,6,3,8,s,1,2b,g,g,9,2a,c,9,9,7,j,1m,e,5,9,6r,e,4m,9,1z,5,2,1,3,3,2,0,2,1,d,9,3c,6,3,6,4,0,t,9,15,6,2,3,9,0,a,a,1b,f,9j,9,1i,7,2,7,h,9,1l,l,2,d,3f,5,4,0,2,1,2,6,2,0,9,9,1d,4,2,1,2,4,9,9,96,3,a,1,2,0,1d,6,4,4,e,a,44m,0,7,e,8uh,r,1t3,9,2f,9,13,4,1o,6,q,9,ev,9,d2,0,2,1i,8,3,2a,0,c,1,f58,1,382,9,ef,19,3,m,f3,4,4,5,9,7,3,6,v,3,45,2,13e,1d,e9,1i,5,1d,9,0,f,0,n,4,2,e,11t,6,2,g,3,6,2,1,2,4,2t,0,4h,6,a,9,9x,0,1q,d,dv,d,6t,1,2,9,k6,6,32,6,6,9,3o7,9,gvt3,6n';
const STRING_LITERAL_PREFIX = /^(?:'((?:\\[\s\S]|[^'\\])*?)'|"((?:\\[\s\S]|[^"\\])*?)")/;
const DIRECTIVE_CONTINUATION = /[(`.[+\-/*%<>=,?^&]/;
const CRLF = /\r\n?/g;
const UNDERSCORES = /_/g;
const RELATIONAL_KEYWORD = /^in(stanceof)?$/;

function codePointToString(code: number): string {
	if (code <= 0xffff) {
		return String.fromCharCode(code);
	}
	const c = code - 0x10000;
	return String.fromCharCode((c >> 10) + 0xd800, (c & 1023) + 0xdc00);
}

function decodeRanges(data: string): number[] {
	const parts = data.split(',');
	const out: number[] = [];
	let value = 0;
	for (let i = 0; i < parts.length; i++) {
		value += parseInt(parts[i], 36);
		out.push(value);
	}
	return out;
}

let decodedIdStartRanges: number[] = null;
let decodedIdContinueOnlyRanges: number[] = null;

function idStartRanges(): number[] {
	if (decodedIdStartRanges == null) {
		decodedIdStartRanges = decodeRanges(ID_START_RANGES);
	}
	return decodedIdStartRanges;
}

function idContinueOnlyRanges(): number[] {
	if (decodedIdContinueOnlyRanges == null) {
		decodedIdContinueOnlyRanges = decodeRanges(ID_CONTINUE_ONLY_RANGES);
	}
	return decodedIdContinueOnlyRanges;
}

function inRanges(code: number, ranges: number[]): boolean {
	let lo = 0;
	let hi = ranges.length / 2 - 1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		if (code < ranges[mid * 2]) {
			hi = mid - 1;
		} else if (code > ranges[mid * 2 + 1]) {
			lo = mid + 1;
		} else {
			return true;
		}
	}
	return false;
}

function isIdentifierStart(code: number): boolean {
	if (code < 65) {
		return code === 36;
	}
	if (code < 91) {
		return true;
	}
	if (code < 97) {
		return code === 95;
	}
	if (code < 123) {
		return true;
	}
	return code >= 0xaa && inRanges(code, idStartRanges());
}

function isIdentifierChar(code: number): boolean {
	if (code < 48) {
		return code === 36;
	}
	if (code < 58) {
		return true;
	}
	if (code < 65) {
		return false;
	}
	if (code < 91) {
		return true;
	}
	if (code < 97) {
		return code === 95;
	}
	if (code < 123) {
		return true;
	}
	return code >= 0xaa && (inRanges(code, idStartRanges()) || inRanges(code, idContinueOnlyRanges()));
}

function isNewLine(code: number): boolean {
	return code === 10 || code === 13 || code === 0x2028 || code === 0x2029;
}

function isNonAsciiWhitespace(code: number): boolean {
	return code === 0x1680 || (code >= 0x2000 && code <= 0x200a) || code === 0x202f || code === 0x205f || code === 0x3000 || code === 0xfeff;
}

// The characters JavaScript's regexp `\s` matches.
function isRegExpWhitespace(code: number): boolean {
	return (code >= 9 && code <= 13) || code === 32 || code === 0xa0 || code === 0x2028 || code === 0x2029 || isNonAsciiWhitespace(code);
}

function stringToBigInt(str: string): any {
	if (typeof BigInt !== 'function') {
		return null;
	}
	return BigInt(str);
}

function isLocalVariableAccess(node: ExpressionNode): boolean {
	return node.type === 'Identifier';
}

class DestructuringErrors {
	shorthandAssign: number = -1;
	trailingComma: number = -1;
	parenthesizedAssign: number = -1;
	parenthesizedBind: number = -1;
	doubleProto: number = -1;
}

class ExpressionParser {
	input: string;
	pos: number = 0;

	type: TokenType = tt.eof;
	// Token text: identifier/keyword name, operator, string value or template chunk.
	value: string = '';
	numValue: any = null;
	regexPattern: string = '';
	regexFlags: string = '';
	regexValue: RegExp = null;
	start: number = 0;
	end: number = 0;
	lastTokStart: number = 0;
	lastTokEnd: number = 0;

	context: TokContext[] = [ctxBStat];
	exprAllowed: boolean = true;
	containsEsc: boolean = false;
	inTemplateElement: boolean = false;
	invalidTemplateEscape: boolean = false;

	strict: boolean;
	potentialArrowAt: number = -1;
	yieldPos: number = 0;
	awaitPos: number = 0;
	awaitIdentPos: number = 0;
	labels: string[] = [];
	scopeFlags: number[] = [SCOPE_TOP];

	constructor(input: string) {
		this.input = input;
		this.strict = this.strictDirective(0);
	}

	// ## Errors

	raise(pos: number, message: string): never {
		let line = 1;
		let lineStart = 0;
		let i = 0;
		while (i < pos && i < this.input.length) {
			const ch = this.input.charCodeAt(i);
			if (isNewLine(ch)) {
				if (ch === 13 && this.codeAt(i + 1) === 10) {
					i++;
				}
				line++;
				lineStart = i + 1;
			}
			i++;
		}
		throw new SyntaxError(message + ' (' + line + ':' + (pos - lineStart) + ')');
	}

	unexpected(pos: number): never {
		return this.raise(pos, 'Unexpected token');
	}

	unsupported(pos: number, what: string): never {
		return this.raise(pos, 'Unsupported in binding expressions: ' + what);
	}

	// ## Character helpers

	codeAt(i: number): number {
		return i < this.input.length ? this.input.charCodeAt(i) : -1;
	}

	fullCharCodeAtPos(): number {
		const code = this.codeAt(this.pos);
		if (code <= 0xd7ff || code >= 0xdc00) {
			return code;
		}
		const next = this.codeAt(this.pos + 1);
		return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00;
	}

	hasLineBreak(from: number, to: number): boolean {
		for (let i = from; i < to; i++) {
			if (isNewLine(this.input.charCodeAt(i))) {
				return true;
			}
		}
		return false;
	}

	// Equivalent of acorn's `skipWhiteSpace` regexp: whitespace, `//` and `/* */` comments.
	skipWhiteSpaceFrom(from: number): number {
		let p = from;
		const len = this.input.length;
		while (p < len) {
			const ch = this.input.charCodeAt(p);
			if (isRegExpWhitespace(ch)) {
				p++;
			} else if (ch === 47 && this.codeAt(p + 1) === 47) {
				p += 2;
				while (p < len && !isNewLine(this.input.charCodeAt(p))) {
					p++;
				}
			} else if (ch === 47 && this.codeAt(p + 1) === 42) {
				const close = this.input.indexOf('*/', p + 2);
				if (close === -1) {
					return p;
				}
				p = close + 2;
			} else {
				return p;
			}
		}
		return p;
	}

	strictDirective(from: number): boolean {
		let start = from;
		for (;;) {
			start = this.skipWhiteSpaceFrom(start);
			const match = STRING_LITERAL_PREFIX.exec(this.input.slice(start));
			if (match == null) {
				return false;
			}
			if ((match[1] || match[2]) === 'use strict') {
				const afterLiteral = start + match[0].length;
				const end = this.skipWhiteSpaceFrom(afterLiteral);
				const next = this.input.charAt(end);
				return next === ';' || next === '}' || (this.hasLineBreak(afterLiteral, end) && !(DIRECTIVE_CONTINUATION.test(next) || (next === '!' && this.input.charAt(end + 1) === '=')));
			}
			start += match[0].length;
			start = this.skipWhiteSpaceFrom(start);
			if (this.input.charAt(start) === ';') {
				start++;
			}
		}
	}

	// ## Scopes

	enterScope(flags: number): void {
		this.scopeFlags.push(flags);
	}

	exitScope(): void {
		this.scopeFlags.pop();
	}

	currentVarScopeFlags(): number {
		for (let i = this.scopeFlags.length - 1; i >= 0; i--) {
			const flags = this.scopeFlags[i];
			if ((flags & SCOPE_VAR) !== 0) {
				return flags;
			}
		}
		return 0;
	}

	inAsync(): boolean {
		return (this.currentVarScopeFlags() & SCOPE_ASYNC) !== 0;
	}

	canAwait(): boolean {
		for (let i = this.scopeFlags.length - 1; i >= 0; i--) {
			const flags = this.scopeFlags[i];
			if ((flags & SCOPE_FUNCTION) !== 0) {
				return (flags & SCOPE_ASYNC) !== 0;
			}
		}
		return false;
	}

	// ## Tokenizer

	curContext(): TokContext {
		return this.context[this.context.length - 1];
	}

	next(ignoreEscapeSequenceInKeyword: boolean): void {
		if (!ignoreEscapeSequenceInKeyword && this.type.keyword !== '' && this.containsEsc) {
			this.raise(this.start, 'Escape sequence in keyword ' + this.type.keyword);
		}
		this.lastTokEnd = this.end;
		this.lastTokStart = this.start;
		this.nextToken();
	}

	nextToken(): void {
		const curContext = this.curContext();
		if (!curContext.preserveSpace) {
			this.skipSpace();
		}
		this.start = this.pos;
		if (this.pos >= this.input.length) {
			this.finishToken(tt.eof, '');
			return;
		}
		if (curContext.isTemplate) {
			this.tryReadTemplateToken();
		} else {
			this.readToken(this.fullCharCodeAtPos());
		}
	}

	readToken(code: number): void {
		if (isIdentifierStart(code) || code === 92) {
			this.readWord();
		} else {
			this.getTokenFromCode(code);
		}
	}

	skipBlockComment(): void {
		const end = this.input.indexOf('*/', (this.pos += 2));
		if (end === -1) {
			this.raise(this.pos - 2, 'Unterminated comment');
		}
		this.pos = end + 2;
	}

	skipLineComment(startSkip: number): void {
		this.pos += startSkip;
		while (this.pos < this.input.length && !isNewLine(this.input.charCodeAt(this.pos))) {
			this.pos++;
		}
	}

	skipSpace(): void {
		while (this.pos < this.input.length) {
			const ch = this.input.charCodeAt(this.pos);
			if (ch === 32 || ch === 160) {
				this.pos++;
			} else if (ch === 13) {
				if (this.codeAt(this.pos + 1) === 10) {
					this.pos++;
				}
				this.pos++;
			} else if (ch === 10 || ch === 8232 || ch === 8233) {
				this.pos++;
			} else if (ch === 47) {
				const next = this.codeAt(this.pos + 1);
				if (next === 42) {
					this.skipBlockComment();
				} else if (next === 47) {
					this.skipLineComment(2);
				} else {
					return;
				}
			} else if ((ch > 8 && ch < 14) || (ch >= 5760 && isNonAsciiWhitespace(ch))) {
				this.pos++;
			} else {
				return;
			}
		}
	}

	finishToken(type: TokenType, value: string): void {
		this.end = this.pos;
		const prevType = this.type;
		this.type = type;
		this.value = value;
		this.updateContext(prevType);
	}

	braceIsBlock(prevType: TokenType): boolean {
		const parent = this.curContext();
		if (parent === ctxFExpr || parent === ctxFStat) {
			return true;
		}
		if (prevType === tt.colon && (parent === ctxBStat || parent === ctxBExpr)) {
			return !parent.isExpr;
		}
		if (prevType === tt._return || (prevType === tt.name && this.exprAllowed)) {
			return this.hasLineBreak(this.lastTokEnd, this.start);
		}
		if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof || prevType === tt.parenR || prevType === tt.arrow) {
			return true;
		}
		if (prevType === tt.braceL) {
			return parent === ctxBStat;
		}
		if (prevType === tt._var || prevType === tt._const || prevType === tt.name) {
			return false;
		}
		return !this.exprAllowed;
	}

	// Tracks whether a `/` starting the next token begins a regexp; acorn's token context rules.
	updateContext(prevType: TokenType): void {
		const type = this.type;
		if (type.keyword !== '' && prevType === tt.dot) {
			this.exprAllowed = false;
		} else if (type === tt.parenR || type === tt.braceR) {
			if (this.context.length === 1) {
				this.exprAllowed = true;
				return;
			}
			let out = this.context.pop();
			if (out === ctxBStat && this.curContext().token === 'function') {
				out = this.context.pop();
			}
			this.exprAllowed = !out.isExpr;
		} else if (type === tt.braceL) {
			this.context.push(this.braceIsBlock(prevType) ? ctxBStat : ctxBExpr);
			this.exprAllowed = true;
		} else if (type === tt.dollarBraceL) {
			this.context.push(ctxBTmpl);
			this.exprAllowed = true;
		} else if (type === tt.parenL) {
			const statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while;
			this.context.push(statementParens ? ctxPStat : ctxPExpr);
			this.exprAllowed = true;
		} else if (type === tt.incDec) {
			// exprAllowed stays unchanged
		} else if (type === tt._function || type === tt._class) {
			if (prevType.beforeExpr && prevType !== tt._else && !(prevType === tt.semi && this.curContext() !== ctxPStat) && !(prevType === tt._return && this.hasLineBreak(this.lastTokEnd, this.start)) && !((prevType === tt.colon || prevType === tt.braceL) && this.curContext() === ctxBStat)) {
				this.context.push(ctxFExpr);
			} else {
				this.context.push(ctxFStat);
			}
			this.exprAllowed = false;
		} else if (type === tt.colon) {
			if (this.curContext().token === 'function') {
				this.context.pop();
			}
			this.exprAllowed = true;
		} else if (type === tt.backQuote) {
			if (this.curContext() === ctxQTmpl) {
				this.context.pop();
			} else {
				this.context.push(ctxQTmpl);
			}
			this.exprAllowed = false;
		} else if (type === tt.star) {
			this.exprAllowed = true;
		} else if (type === tt.name) {
			this.exprAllowed = prevType !== tt.dot && this.value === 'of' && !this.exprAllowed;
		} else {
			this.exprAllowed = type.beforeExpr;
		}
	}

	overrideContext(tokenCtx: TokContext): void {
		if (this.curContext() !== tokenCtx) {
			this.context[this.context.length - 1] = tokenCtx;
		}
	}

	finishOp(type: TokenType, size: number): void {
		const str = this.input.slice(this.pos, this.pos + size);
		this.pos += size;
		this.finishToken(type, str);
	}

	readTokenDot(): void {
		const next = this.codeAt(this.pos + 1);
		if (next >= 48 && next <= 57) {
			this.readNumber(true);
			return;
		}
		if (next === 46 && this.codeAt(this.pos + 2) === 46) {
			this.pos += 3;
			this.finishToken(tt.ellipsis, '');
			return;
		}
		++this.pos;
		this.finishToken(tt.dot, '');
	}

	readTokenSlash(): void {
		if (this.exprAllowed) {
			++this.pos;
			this.readRegexp();
			return;
		}
		if (this.codeAt(this.pos + 1) === 61) {
			this.finishOp(tt.assign, 2);
			return;
		}
		this.finishOp(tt.slash, 1);
	}

	readTokenMultModuloExp(code: number): void {
		let next = this.codeAt(this.pos + 1);
		let size = 1;
		let tokentype = code === 42 ? tt.star : tt.modulo;
		if (code === 42 && next === 42) {
			++size;
			tokentype = tt.starstar;
			next = this.codeAt(this.pos + 2);
		}
		if (next === 61) {
			this.finishOp(tt.assign, size + 1);
			return;
		}
		this.finishOp(tokentype, size);
	}

	readTokenPipeAmp(code: number): void {
		const next = this.codeAt(this.pos + 1);
		if (next === code) {
			this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2);
			return;
		}
		if (next === 61) {
			this.finishOp(tt.assign, 2);
			return;
		}
		this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1);
	}

	readTokenCaret(): void {
		if (this.codeAt(this.pos + 1) === 61) {
			this.finishOp(tt.assign, 2);
			return;
		}
		this.finishOp(tt.bitwiseXOR, 1);
	}

	readTokenPlusMin(code: number): void {
		const next = this.codeAt(this.pos + 1);
		if (next === code) {
			if (next === 45 && this.codeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || this.hasLineBreak(this.lastTokEnd, this.pos))) {
				// `-->` at the start of a line is an HTML-style line comment in scripts.
				this.skipLineComment(3);
				this.skipSpace();
				this.nextToken();
				return;
			}
			this.finishOp(tt.incDec, 2);
			return;
		}
		if (next === 61) {
			this.finishOp(tt.assign, 2);
			return;
		}
		this.finishOp(tt.plusMin, 1);
	}

	readTokenLtGt(code: number): void {
		const next = this.codeAt(this.pos + 1);
		let size = 1;
		if (next === code) {
			size = code === 62 && this.codeAt(this.pos + 2) === 62 ? 3 : 2;
			if (this.codeAt(this.pos + size) === 61) {
				this.finishOp(tt.assign, size + 1);
				return;
			}
			this.finishOp(tt.bitShift, size);
			return;
		}
		if (next === 33 && code === 60 && this.codeAt(this.pos + 2) === 45 && this.codeAt(this.pos + 3) === 45) {
			// `<!--` is an HTML-style line comment in scripts.
			this.skipLineComment(4);
			this.skipSpace();
			this.nextToken();
			return;
		}
		if (next === 61) {
			size = 2;
		}
		this.finishOp(tt.relational, size);
	}

	readTokenEqExcl(code: number): void {
		const next = this.codeAt(this.pos + 1);
		if (next === 61) {
			this.finishOp(tt.equality, this.codeAt(this.pos + 2) === 61 ? 3 : 2);
			return;
		}
		if (code === 61 && next === 62) {
			this.pos += 2;
			this.finishToken(tt.arrow, '');
			return;
		}
		this.finishOp(code === 61 ? tt.eq : tt.prefix, 1);
	}

	readTokenQuestion(): void {
		const next = this.codeAt(this.pos + 1);
		if (next === 46) {
			const next2 = this.codeAt(this.pos + 2);
			// acorn compares NaN past the end, which makes `?.` at end of input a plain `?`.
			if (next2 !== -1 && (next2 < 48 || next2 > 57)) {
				this.finishOp(tt.questionDot, 2);
				return;
			}
		}
		if (next === 63) {
			this.finishOp(tt.coalesce, 2);
			return;
		}
		this.finishOp(tt.question, 1);
	}

	getTokenFromCode(code: number): void {
		switch (code) {
			case 46:
				this.readTokenDot();
				return;
			case 40:
				++this.pos;
				this.finishToken(tt.parenL, '');
				return;
			case 41:
				++this.pos;
				this.finishToken(tt.parenR, '');
				return;
			case 59:
				++this.pos;
				this.finishToken(tt.semi, '');
				return;
			case 44:
				++this.pos;
				this.finishToken(tt.comma, '');
				return;
			case 91:
				++this.pos;
				this.finishToken(tt.bracketL, '');
				return;
			case 93:
				++this.pos;
				this.finishToken(tt.bracketR, '');
				return;
			case 123:
				++this.pos;
				this.finishToken(tt.braceL, '');
				return;
			case 125:
				++this.pos;
				this.finishToken(tt.braceR, '');
				return;
			case 58:
				++this.pos;
				this.finishToken(tt.colon, '');
				return;
			case 96:
				++this.pos;
				this.finishToken(tt.backQuote, '');
				return;
			case 48: {
				const next = this.codeAt(this.pos + 1);
				if (next === 120 || next === 88) {
					this.readRadixNumber(16);
					return;
				}
				if (next === 111 || next === 79) {
					this.readRadixNumber(8);
					return;
				}
				if (next === 98 || next === 66) {
					this.readRadixNumber(2);
					return;
				}
				this.readNumber(false);
				return;
			}
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
			case 54:
			case 55:
			case 56:
			case 57:
				this.readNumber(false);
				return;
			case 34:
			case 39:
				this.readString(code);
				return;
			case 47:
				this.readTokenSlash();
				return;
			case 37:
			case 42:
				this.readTokenMultModuloExp(code);
				return;
			case 124:
			case 38:
				this.readTokenPipeAmp(code);
				return;
			case 94:
				this.readTokenCaret();
				return;
			case 43:
			case 45:
				this.readTokenPlusMin(code);
				return;
			case 60:
			case 62:
				this.readTokenLtGt(code);
				return;
			case 61:
			case 33:
				this.readTokenEqExcl(code);
				return;
			case 63:
				this.readTokenQuestion();
				return;
			case 126:
				this.finishOp(tt.prefix, 1);
				return;
		}
		this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
	}

	readRegexp(): void {
		let escaped = false;
		let inClass = false;
		const start = this.pos;
		for (;;) {
			if (this.pos >= this.input.length) {
				this.raise(start, 'Unterminated regular expression');
			}
			const ch = this.input.charCodeAt(this.pos);
			if (isNewLine(ch)) {
				this.raise(start, 'Unterminated regular expression');
			}
			if (!escaped) {
				if (ch === 91) {
					inClass = true;
				} else if (ch === 93 && inClass) {
					inClass = false;
				} else if (ch === 47 && !inClass) {
					break;
				}
				escaped = ch === 92;
			} else {
				escaped = false;
			}
			++this.pos;
		}
		const pattern = this.input.slice(start, this.pos);
		++this.pos;
		const flagsStart = this.pos;
		const flags = this.readWord1();
		if (this.containsEsc) {
			this.unexpected(flagsStart);
		}
		for (let i = 0; i < flags.length; i++) {
			const flag = flags.charAt(i);
			if (REGEXP_FLAGS.indexOf(flag) === -1) {
				this.raise(start, 'Invalid regular expression flag');
			}
			if (flags.indexOf(flag, i + 1) > -1) {
				this.raise(start, 'Duplicate regular expression flag');
			}
		}
		this.regexPattern = pattern;
		this.regexFlags = flags;
		this.regexValue = this.validateRegExp(start, pattern, flags);
		this.finishToken(tt.regexp, '');
	}

	// The host RegExp engine validates the pattern. It accepts syntax newer than
	// ES2020, so group modifiers and duplicate group names are rejected here first.
	validateRegExp(start: number, pattern: string, flags: string): RegExp {
		const groupNames: string[] = [];
		let inClass = false;
		let i = 0;
		while (i < pattern.length) {
			const ch = pattern.charCodeAt(i);
			if (ch === 92) {
				i += 2;
				continue;
			}
			if (inClass) {
				if (ch === 93) {
					inClass = false;
				}
			} else if (ch === 91) {
				inClass = true;
			} else if (ch === 40 && pattern.charCodeAt(i + 1) === 63) {
				const kind = pattern.charCodeAt(i + 2);
				if (kind === 60) {
					const afterLt = pattern.charCodeAt(i + 3);
					if (afterLt !== 61 && afterLt !== 33) {
						const close = pattern.indexOf('>', i + 3);
						if (close !== -1) {
							const groupName = pattern.slice(i + 3, close);
							if (groupNames.indexOf(groupName) !== -1) {
								this.raise(start, 'Invalid regular expression: /' + pattern + '/: Duplicate capture group name');
							}
							groupNames.push(groupName);
						}
					}
				} else if (kind !== 58 && kind !== 61 && kind !== 33) {
					this.raise(start, 'Invalid regular expression: /' + pattern + '/: Invalid group');
				}
			}
			i++;
		}
		let value: RegExp = null;
		try {
			value = new RegExp(pattern, flags);
		} catch (e) {
			this.raise(start, 'Invalid regular expression: /' + pattern + '/');
		}
		return value;
	}

	// Returns -1 when no digits were read (or, with `hasLen`, not exactly `len` digits).
	readInt(radix: number, len: number, hasLen: boolean): number {
		const start = this.pos;
		let total = 0;
		let i = 0;
		while (!hasLen || i < len) {
			const code = this.codeAt(this.pos);
			let val: number;
			if (code >= 97) {
				val = code - 97 + 10;
			} else if (code >= 65) {
				val = code - 65 + 10;
			} else if (code >= 48 && code <= 57) {
				val = code - 48;
			} else {
				val = Infinity;
			}
			if (val >= radix) {
				break;
			}
			total = total * radix + val;
			i++;
			this.pos++;
		}
		if (this.pos === start || (hasLen && this.pos - start !== len)) {
			return -1;
		}
		return total;
	}

	readRadixNumber(radix: number): void {
		const start = this.pos;
		this.pos += 2;
		let val: any = this.readInt(radix, 0, false);
		if (val === -1) {
			this.raise(this.start + 2, 'Expected number in radix ' + radix);
		}
		if (this.codeAt(this.pos) === 110) {
			val = stringToBigInt(this.input.slice(start, this.pos));
			++this.pos;
		} else if (isIdentifierStart(this.fullCharCodeAtPos())) {
			this.raise(this.pos, 'Identifier directly after number');
		}
		this.numValue = val;
		this.finishToken(tt.num, '');
	}

	readNumber(startsWithDot: boolean): void {
		const start = this.pos;
		if (!startsWithDot && this.readInt(10, 0, false) === -1) {
			this.raise(start, 'Invalid number');
		}
		let octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
		if (octal && this.strict) {
			this.raise(start, 'Invalid number');
		}
		let next = this.codeAt(this.pos);
		if (!octal && !startsWithDot && next === 110) {
			const bigValue = stringToBigInt(this.input.slice(start, this.pos));
			++this.pos;
			if (isIdentifierStart(this.fullCharCodeAtPos())) {
				this.raise(this.pos, 'Identifier directly after number');
			}
			this.numValue = bigValue;
			this.finishToken(tt.num, '');
			return;
		}
		if (octal) {
			for (let i = start; i < this.pos; i++) {
				const digit = this.input.charCodeAt(i);
				if (digit === 56 || digit === 57) {
					octal = false;
					break;
				}
			}
		}
		if (next === 46 && !octal) {
			++this.pos;
			this.readInt(10, 0, false);
			next = this.codeAt(this.pos);
		}
		if ((next === 69 || next === 101) && !octal) {
			next = this.codeAt(++this.pos);
			if (next === 43 || next === 45) {
				++this.pos;
			}
			if (this.readInt(10, 0, false) === -1) {
				this.raise(start, 'Invalid number');
			}
		}
		if (isIdentifierStart(this.fullCharCodeAtPos())) {
			this.raise(this.pos, 'Identifier directly after number');
		}
		const str = this.input.slice(start, this.pos);
		this.numValue = octal ? parseInt(str, 8) : parseFloat(str);
		this.finishToken(tt.num, '');
	}

	readCodePoint(): number {
		const ch = this.codeAt(this.pos);
		let code: number;
		if (ch === 123) {
			const codePos = ++this.pos;
			code = this.readHexChar(this.input.indexOf('}', this.pos) - this.pos, true);
			if (this.invalidTemplateEscape) {
				return 0;
			}
			++this.pos;
			if (code > 0x10ffff) {
				this.invalidStringToken(codePos, 'Code point out of bounds');
				return 0;
			}
		} else {
			code = this.readHexChar(4, true);
		}
		return code;
	}

	readString(quote: number): void {
		let out = '';
		let chunkStart = ++this.pos;
		for (;;) {
			if (this.pos >= this.input.length) {
				this.raise(this.start, 'Unterminated string constant');
			}
			const ch = this.input.charCodeAt(this.pos);
			if (ch === quote) {
				break;
			}
			if (ch === 92) {
				out += this.input.slice(chunkStart, this.pos);
				out += this.readEscapedChar(false);
				chunkStart = this.pos;
			} else if (ch === 0x2028 || ch === 0x2029) {
				++this.pos;
			} else {
				if (isNewLine(ch)) {
					this.raise(this.start, 'Unterminated string constant');
				}
				++this.pos;
			}
		}
		out += this.input.slice(chunkStart, this.pos++);
		this.finishToken(tt.string, out);
	}

	tryReadTemplateToken(): void {
		this.inTemplateElement = true;
		this.invalidTemplateEscape = false;
		this.readTmplToken();
		if (this.invalidTemplateEscape) {
			this.invalidTemplateEscape = false;
			this.readInvalidTemplateToken();
		}
		this.inTemplateElement = false;
	}

	// Inside a template an invalid escape is not an error yet (tagged templates allow it):
	// the scan stops where acorn's sentinel throw would and restarts as an invalid template token.
	invalidStringToken(position: number, message: string): void {
		if (this.inTemplateElement) {
			this.invalidTemplateEscape = true;
			return;
		}
		this.raise(position, message);
	}

	readTmplToken(): void {
		let out = '';
		let chunkStart = this.pos;
		for (;;) {
			if (this.pos >= this.input.length) {
				this.raise(this.start, 'Unterminated template');
			}
			const ch = this.input.charCodeAt(this.pos);
			if (ch === 96 || (ch === 36 && this.codeAt(this.pos + 1) === 123)) {
				if (this.pos === this.start && (this.type === tt.template || this.type === tt.invalidTemplate)) {
					if (ch === 36) {
						this.pos += 2;
						this.finishToken(tt.dollarBraceL, '');
					} else {
						++this.pos;
						this.finishToken(tt.backQuote, '');
					}
					return;
				}
				out += this.input.slice(chunkStart, this.pos);
				this.finishToken(tt.template, out);
				return;
			}
			if (ch === 92) {
				out += this.input.slice(chunkStart, this.pos);
				out += this.readEscapedChar(true);
				if (this.invalidTemplateEscape) {
					return;
				}
				chunkStart = this.pos;
			} else if (isNewLine(ch)) {
				out += this.input.slice(chunkStart, this.pos);
				++this.pos;
				if (ch === 13) {
					if (this.codeAt(this.pos) === 10) {
						++this.pos;
					}
					out += '\n';
				} else if (ch === 10) {
					out += '\n';
				} else {
					out += String.fromCharCode(ch);
				}
				chunkStart = this.pos;
			} else {
				++this.pos;
			}
		}
	}

	readInvalidTemplateToken(): void {
		while (this.pos < this.input.length) {
			const ch = this.input.charCodeAt(this.pos);
			if (ch === 92) {
				++this.pos;
			} else if (ch === 96 || (ch === 36 && this.codeAt(this.pos + 1) === 123)) {
				this.finishToken(tt.invalidTemplate, this.input.slice(this.start, this.pos));
				return;
			}
			this.pos++;
		}
		this.raise(this.start, 'Unterminated template');
	}

	readEscapedChar(inTemplate: boolean): string {
		const ch = this.codeAt(++this.pos);
		++this.pos;
		switch (ch) {
			case 110:
				return '\n';
			case 114:
				return '\r';
			case 120:
				return String.fromCharCode(this.readHexChar(2, true));
			case 117:
				return codePointToString(this.readCodePoint());
			case 116:
				return '\t';
			case 98:
				return '\b';
			case 118:
				return '\u000b';
			case 102:
				return '\f';
			case 13:
				if (this.codeAt(this.pos) === 10) {
					++this.pos;
				}
				return '';
			case 10:
				return '';
		}
		if (ch === 56 || ch === 57) {
			if (this.strict) {
				this.invalidStringToken(this.pos - 1, 'Invalid escape sequence');
				return '';
			}
			if (inTemplate) {
				this.invalidStringToken(this.pos - 1, 'Invalid escape sequence in template string');
				return '';
			}
		}
		if (ch >= 48 && ch <= 55) {
			let octalEnd = this.pos;
			while (octalEnd < this.pos + 2 && octalEnd < this.input.length && this.input.charCodeAt(octalEnd) >= 48 && this.input.charCodeAt(octalEnd) <= 55) {
				octalEnd++;
			}
			let octalStr = this.input.slice(this.pos - 1, octalEnd);
			let octal = parseInt(octalStr, 8);
			if (octal > 255) {
				octalStr = octalStr.slice(0, -1);
				octal = parseInt(octalStr, 8);
			}
			this.pos += octalStr.length - 1;
			const after = this.codeAt(this.pos);
			if ((octalStr !== '0' || after === 56 || after === 57) && (this.strict || inTemplate)) {
				this.invalidStringToken(this.pos - 1 - octalStr.length, inTemplate ? 'Octal literal in template string' : 'Octal literal in strict mode');
				return '';
			}
			return String.fromCharCode(octal);
		}
		if (ch === -1 || isNewLine(ch)) {
			return '';
		}
		return String.fromCharCode(ch);
	}

	readHexChar(len: number, hasLen: boolean): number {
		const codePos = this.pos;
		const n = this.readInt(16, len, hasLen);
		if (n === -1) {
			this.invalidStringToken(codePos, 'Bad character escape sequence');
			return 0;
		}
		return n;
	}

	readWord1(): string {
		this.containsEsc = false;
		let word = '';
		let first = true;
		let chunkStart = this.pos;
		while (this.pos < this.input.length) {
			const ch = this.fullCharCodeAtPos();
			if (isIdentifierChar(ch)) {
				this.pos += ch <= 0xffff ? 1 : 2;
			} else if (ch === 92) {
				this.containsEsc = true;
				word += this.input.slice(chunkStart, this.pos);
				const escStart = this.pos;
				if (this.codeAt(++this.pos) !== 117) {
					this.invalidStringToken(this.pos, 'Expecting Unicode escape sequence \\uXXXX');
				}
				++this.pos;
				const esc = this.readCodePoint();
				if (!(first ? isIdentifierStart(esc) : isIdentifierChar(esc))) {
					this.invalidStringToken(escStart, 'Invalid Unicode escape');
				}
				word += codePointToString(esc);
				chunkStart = this.pos;
			} else {
				break;
			}
			first = false;
		}
		return word + this.input.slice(chunkStart, this.pos);
	}

	readWord(): void {
		const word = this.readWord1();
		let type = tt.name;
		const keyword = keywordTypes.get(word);
		if (keyword !== undefined) {
			type = keyword;
		}
		this.finishToken(type, word);
	}

	// ## Parser utilities

	startNode(): ExpressionNode {
		return { type: '', start: this.start, end: 0 };
	}

	startNodeAt(pos: number): ExpressionNode {
		return { type: '', start: pos, end: 0 };
	}

	finishNode(node: ExpressionNode, type: string): ExpressionNode {
		node.type = type;
		node.end = this.lastTokEnd;
		return node;
	}

	finishNodeAt(node: ExpressionNode, type: string, pos: number): ExpressionNode {
		node.type = type;
		node.end = pos;
		return node;
	}

	copyIdentifier(node: ExpressionNode): ExpressionNode {
		return { type: node.type, start: node.start, end: node.end, name: node.name };
	}

	eat(type: TokenType): boolean {
		if (this.type === type) {
			this.next(false);
			return true;
		}
		return false;
	}

	isContextual(name: string): boolean {
		return this.type === tt.name && this.value === name && !this.containsEsc;
	}

	canInsertSemicolon(): boolean {
		return this.type === tt.eof || this.type === tt.braceR || this.hasLineBreak(this.lastTokEnd, this.start);
	}

	semicolon(): void {
		if (!this.eat(tt.semi) && !this.canInsertSemicolon()) {
			this.unexpected(this.start);
		}
	}

	afterTrailingComma(tokType: TokenType, notNext: boolean): boolean {
		if (this.type === tokType) {
			if (!notNext) {
				this.next(false);
			}
			return true;
		}
		return false;
	}

	expect(type: TokenType): void {
		if (!this.eat(type)) {
			this.unexpected(this.start);
		}
	}

	checkPatternErrors(refErrors: DestructuringErrors, isAssign: boolean): void {
		if (refErrors == null) {
			return;
		}
		if (refErrors.trailingComma > -1) {
			this.raise(refErrors.trailingComma, 'Comma is not permitted after the rest element');
		}
		const parens = isAssign ? refErrors.parenthesizedAssign : refErrors.parenthesizedBind;
		if (parens > -1) {
			this.raise(parens, isAssign ? 'Assigning to rvalue' : 'Parenthesized pattern');
		}
	}

	checkExpressionErrors(refErrors: DestructuringErrors, andThrow: boolean): boolean {
		if (refErrors == null) {
			return false;
		}
		if (!andThrow) {
			return refErrors.shorthandAssign >= 0 || refErrors.doubleProto >= 0;
		}
		if (refErrors.shorthandAssign >= 0) {
			this.raise(refErrors.shorthandAssign, 'Shorthand property assignments are valid only in destructuring patterns');
		}
		if (refErrors.doubleProto >= 0) {
			this.raise(refErrors.doubleProto, 'Redefinition of __proto__ property');
		}
		return false;
	}

	checkYieldAwaitInDefaultParams(): void {
		if (this.yieldPos !== 0 && (this.awaitPos === 0 || this.yieldPos < this.awaitPos)) {
			this.raise(this.yieldPos, 'Yield expression cannot be a default value');
		}
		if (this.awaitPos !== 0) {
			this.raise(this.awaitPos, 'Await expression cannot be a default value');
		}
	}

	isSimpleAssignTarget(expr: ExpressionNode): boolean {
		return expr.type === 'Identifier' || expr.type === 'MemberExpression';
	}

	// ## Statements

	parseProgram(): ExpressionNode | undefined {
		this.nextToken();
		let expression: ExpressionNode | undefined = undefined;
		while (this.type !== tt.eof) {
			const statement = this.parseStatement('', true);
			if (expression === undefined && statement.type === 'ExpressionStatement') {
				expression = statement.expression;
			}
		}
		return expression;
	}

	isLet(context: string): boolean {
		if (!this.isContextual('let')) {
			return false;
		}
		const next = this.skipWhiteSpaceFrom(this.pos);
		let nextCh = this.codeAt(next);
		if (nextCh === 91 || nextCh === 92) {
			return true;
		}
		if (context !== '') {
			return false;
		}
		if (nextCh === 123 || (nextCh > 0xd7ff && nextCh < 0xdc00)) {
			return true;
		}
		if (isIdentifierStart(nextCh)) {
			let p = next + 1;
			while (isIdentifierChar((nextCh = this.codeAt(p)))) {
				++p;
			}
			if (nextCh === 92 || (nextCh > 0xd7ff && nextCh < 0xdc00)) {
				return true;
			}
			if (!RELATIONAL_KEYWORD.test(this.input.slice(next, p))) {
				return true;
			}
		}
		return false;
	}

	isAsyncFunction(): boolean {
		if (!this.isContextual('async')) {
			return false;
		}
		const next = this.skipWhiteSpaceFrom(this.pos);
		if (this.hasLineBreak(this.pos, next) || this.input.slice(next, next + 8) !== 'function') {
			return false;
		}
		if (next + 8 === this.input.length) {
			return true;
		}
		const after = this.codeAt(next + 8);
		return !(isIdentifierChar(after) || (after > 0xd7ff && after < 0xdc00));
	}

	parseStatement(context: string, topLevel: boolean): ExpressionNode {
		const starttype = this.type;
		const node = this.startNode();

		if (this.isLet(context)) {
			this.unsupported(this.start, 'let declaration');
		}

		if (UNSUPPORTED_STATEMENT_KEYWORDS.has(starttype)) {
			return this.unsupported(this.start, starttype.keyword + ' statement');
		}
		if (starttype === tt._return) {
			return this.raise(this.start, "'return' outside of function");
		}
		if (starttype === tt._debugger) {
			this.next(false);
			this.semicolon();
			return this.finishNode(node, 'DebuggerStatement');
		}
		if (starttype === tt.braceL) {
			return this.parseBlock(node);
		}
		if (starttype === tt.semi) {
			this.next(false);
			return this.finishNode(node, 'EmptyStatement');
		}
		if (starttype === tt._import || starttype === tt._export) {
			if (starttype === tt._import) {
				const nextCh = this.codeAt(this.skipWhiteSpaceFrom(this.pos));
				if (nextCh === 40 || nextCh === 46) {
					return this.parseExpressionStatement(node, this.parseExpression(null));
				}
			}
			if (!topLevel) {
				return this.raise(this.start, "'import' and 'export' may only appear at the top level");
			}
			return this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
		}

		if (this.isAsyncFunction()) {
			return this.unsupported(this.start, 'async function');
		}
		const maybeName = this.value;
		const expr = this.parseExpression(null);
		if (starttype === tt.name && expr.type === 'Identifier' && this.eat(tt.colon)) {
			return this.parseLabeledStatement(node, maybeName, expr, context);
		}
		return this.parseExpressionStatement(node, expr);
	}

	parseLabeledStatement(node: ExpressionNode, maybeName: string, expr: ExpressionNode, context: string): ExpressionNode {
		for (let i = 0; i < this.labels.length; i++) {
			if (this.labels[i] === maybeName) {
				this.raise(expr.start, "Label '" + maybeName + "' is already declared");
			}
		}
		this.labels.push(maybeName);
		node.body = this.parseStatement(context !== '' ? (context.indexOf('label') === -1 ? context + 'label' : context) : 'label', false);
		this.labels.pop();
		node.label = expr;
		return this.finishNode(node, 'LabeledStatement');
	}

	parseExpressionStatement(node: ExpressionNode, expr: ExpressionNode): ExpressionNode {
		node.expression = expr;
		this.semicolon();
		return this.finishNode(node, 'ExpressionStatement');
	}

	parseBlock(node: ExpressionNode): ExpressionNode {
		const body: ExpressionNode[] = [];
		node.body = body;
		this.expect(tt.braceL);
		while (this.type !== tt.braceR) {
			body.push(this.parseStatement('', false));
		}
		this.next(false);
		return this.finishNode(node, 'BlockStatement');
	}

	// ## Expressions

	parseExpression(refErrors: DestructuringErrors): ExpressionNode {
		const startPos = this.start;
		const expr = this.parseMaybeAssign(refErrors);
		if (this.type === tt.comma) {
			const node = this.startNodeAt(startPos);
			const expressions: ExpressionNode[] = [expr];
			node.expressions = expressions;
			while (this.eat(tt.comma)) {
				expressions.push(this.parseMaybeAssign(refErrors));
			}
			return this.finishNode(node, 'SequenceExpression');
		}
		return expr;
	}

	parseMaybeAssign(refErrorsIn: DestructuringErrors): ExpressionNode {
		if (this.isContextual('yield')) {
			this.exprAllowed = false;
		}

		let refErrors = refErrorsIn;
		let ownDestructuringErrors = false;
		let oldParenAssign = -1;
		let oldTrailingComma = -1;
		let oldDoubleProto = -1;
		if (refErrors != null) {
			oldParenAssign = refErrors.parenthesizedAssign;
			oldTrailingComma = refErrors.trailingComma;
			oldDoubleProto = refErrors.doubleProto;
			refErrors.parenthesizedAssign = -1;
			refErrors.trailingComma = -1;
		} else {
			refErrors = new DestructuringErrors();
			ownDestructuringErrors = true;
		}

		const startPos = this.start;
		if (this.type === tt.parenL || this.type === tt.name) {
			this.potentialArrowAt = this.start;
		}
		let left = this.parseMaybeConditional(refErrors);
		if (this.type.isAssign) {
			const node = this.startNodeAt(startPos);
			node.operator = this.value;
			if (this.type === tt.eq) {
				left = this.toAssignable(left, false, refErrors);
			}
			if (!ownDestructuringErrors) {
				refErrors.parenthesizedAssign = -1;
				refErrors.trailingComma = -1;
				refErrors.doubleProto = -1;
			}
			if (refErrors.shorthandAssign >= left.start) {
				refErrors.shorthandAssign = -1;
			}
			if (this.type === tt.eq) {
				this.checkLValPattern(left, BIND_NONE, null);
			} else {
				this.checkLValSimple(left, BIND_NONE, null);
			}
			node.left = left;
			this.next(false);
			node.right = this.parseMaybeAssign(null);
			if (oldDoubleProto > -1) {
				refErrors.doubleProto = oldDoubleProto;
			}
			return this.finishNode(node, 'AssignmentExpression');
		} else if (ownDestructuringErrors) {
			this.checkExpressionErrors(refErrors, true);
		}
		if (oldParenAssign > -1) {
			refErrors.parenthesizedAssign = oldParenAssign;
		}
		if (oldTrailingComma > -1) {
			refErrors.trailingComma = oldTrailingComma;
		}
		return left;
	}

	parseMaybeConditional(refErrors: DestructuringErrors): ExpressionNode {
		const startPos = this.start;
		const expr = this.parseExprOps(refErrors);
		if (this.checkExpressionErrors(refErrors, false)) {
			return expr;
		}
		if (this.eat(tt.question)) {
			const node = this.startNodeAt(startPos);
			node.test = expr;
			node.consequent = this.parseMaybeAssign(null);
			this.expect(tt.colon);
			node.alternate = this.parseMaybeAssign(null);
			return this.finishNode(node, 'ConditionalExpression');
		}
		return expr;
	}

	parseExprOps(refErrors: DestructuringErrors): ExpressionNode {
		const startPos = this.start;
		const expr = this.parseMaybeUnary(refErrors, false, false);
		if (this.checkExpressionErrors(refErrors, false)) {
			return expr;
		}
		if (expr.start === startPos && expr.type === 'ArrowFunctionExpression') {
			return expr;
		}
		return this.parseExprOp(expr, startPos, -1);
	}

	parseExprOp(left: ExpressionNode, leftStartPos: number, minPrec: number): ExpressionNode {
		let prec = this.type.binop;
		if (prec !== -1 && prec > minPrec) {
			const logical = this.type === tt.logicalOR || this.type === tt.logicalAND;
			const coalesce = this.type === tt.coalesce;
			if (coalesce) {
				// `??` binds like `&&` so its right side cannot absorb a mixed `||`/`&&`.
				prec = tt.logicalAND.binop;
			}
			const op = this.value;
			this.next(false);
			const startPos = this.start;
			const right = this.parseExprOp(this.parseMaybeUnary(null, false, false), startPos, prec);
			const node = this.buildBinary(leftStartPos, left, right, op, logical || coalesce);
			if ((logical && this.type === tt.coalesce) || (coalesce && (this.type === tt.logicalOR || this.type === tt.logicalAND))) {
				this.raise(this.start, 'Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses');
			}
			return this.parseExprOp(node, leftStartPos, minPrec);
		}
		return left;
	}

	buildBinary(startPos: number, left: ExpressionNode, right: ExpressionNode, op: string, logical: boolean): ExpressionNode {
		const node = this.startNodeAt(startPos);
		node.left = left;
		node.operator = op;
		node.right = right;
		return this.finishNode(node, logical ? 'LogicalExpression' : 'BinaryExpression');
	}

	parseMaybeUnary(refErrors: DestructuringErrors, sawUnaryIn: boolean, incDec: boolean): ExpressionNode {
		let sawUnary = sawUnaryIn;
		const startPos = this.start;
		let expr: ExpressionNode;
		if (this.isContextual('await') && this.canAwait()) {
			expr = this.parseAwait();
			sawUnary = true;
		} else if (this.type.prefix) {
			const node = this.startNode();
			const update = this.type === tt.incDec;
			node.operator = this.value;
			node.prefix = true;
			this.next(false);
			node.argument = this.parseMaybeUnary(null, true, update);
			this.checkExpressionErrors(refErrors, true);
			if (update) {
				this.checkLValSimple(node.argument, BIND_NONE, null);
			} else if (this.strict && node.operator === 'delete' && isLocalVariableAccess(node.argument)) {
				this.raise(node.start, 'Deleting local variable in strict mode');
			} else {
				sawUnary = true;
			}
			expr = this.finishNode(node, update ? 'UpdateExpression' : 'UnaryExpression');
		} else {
			expr = this.parseExprSubscripts(refErrors);
			if (this.checkExpressionErrors(refErrors, false)) {
				return expr;
			}
			while (this.type.postfix && !this.canInsertSemicolon()) {
				const node = this.startNodeAt(startPos);
				node.operator = this.value;
				node.prefix = false;
				node.argument = expr;
				this.checkLValSimple(expr, BIND_NONE, null);
				this.next(false);
				expr = this.finishNode(node, 'UpdateExpression');
			}
		}

		if (!incDec && this.eat(tt.starstar)) {
			if (sawUnary) {
				this.unexpected(this.lastTokStart);
			}
			return this.buildBinary(startPos, expr, this.parseMaybeUnary(null, false, false), '**', false);
		}
		return expr;
	}

	parseExprSubscripts(refErrors: DestructuringErrors): ExpressionNode {
		const startPos = this.start;
		const expr = this.parseExprAtom(refErrors, false);
		if (expr.type === 'ArrowFunctionExpression' && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ')') {
			return expr;
		}
		const result = this.parseSubscripts(expr, startPos, false);
		if (refErrors != null && result.type === 'MemberExpression') {
			if (refErrors.parenthesizedAssign >= result.start) {
				refErrors.parenthesizedAssign = -1;
			}
			if (refErrors.parenthesizedBind >= result.start) {
				refErrors.parenthesizedBind = -1;
			}
			if (refErrors.trailingComma >= result.start) {
				refErrors.trailingComma = -1;
			}
		}
		return result;
	}

	parseSubscripts(baseIn: ExpressionNode, startPos: number, noCalls: boolean): ExpressionNode {
		let base = baseIn;
		const maybeAsyncArrow = base.type === 'Identifier' && base.name === 'async' && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
		let optionalChained = false;

		for (;;) {
			let element = this.parseSubscript(base, startPos, noCalls, maybeAsyncArrow, optionalChained);
			if (element.optional === true) {
				optionalChained = true;
			}
			if (element === base || element.type === 'ArrowFunctionExpression') {
				if (optionalChained) {
					const chainNode = this.startNodeAt(startPos);
					chainNode.expression = element;
					element = this.finishNode(chainNode, 'ChainExpression');
				}
				return element;
			}
			base = element;
		}
	}

	parseSubscript(base: ExpressionNode, startPos: number, noCalls: boolean, maybeAsyncArrow: boolean, optionalChained: boolean): ExpressionNode {
		const optional = this.eat(tt.questionDot);
		if (noCalls && optional) {
			this.raise(this.lastTokStart, 'Optional chaining cannot appear in the callee of new expressions');
		}

		const computed = this.eat(tt.bracketL);
		if (computed || (optional && this.type !== tt.parenL && this.type !== tt.backQuote) || this.eat(tt.dot)) {
			const node = this.startNodeAt(startPos);
			node.object = base;
			if (computed) {
				node.property = this.parseExpression(null);
				this.expect(tt.bracketR);
			} else {
				node.property = this.parseIdent(true);
			}
			node.computed = computed;
			node.optional = optional;
			return this.finishNode(node, 'MemberExpression');
		}
		if (!noCalls && this.eat(tt.parenL)) {
			const refErrors = new DestructuringErrors();
			const oldYieldPos = this.yieldPos;
			const oldAwaitPos = this.awaitPos;
			const oldAwaitIdentPos = this.awaitIdentPos;
			this.yieldPos = 0;
			this.awaitPos = 0;
			this.awaitIdentPos = 0;
			const exprList = this.parseExprList(tt.parenR, true, false, refErrors);
			if (maybeAsyncArrow && !optional && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
				this.checkPatternErrors(refErrors, false);
				this.checkYieldAwaitInDefaultParams();
				if (this.awaitIdentPos > 0) {
					this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
				}
				this.yieldPos = oldYieldPos;
				this.awaitPos = oldAwaitPos;
				this.awaitIdentPos = oldAwaitIdentPos;
				return this.parseArrowExpression(this.startNodeAt(startPos), exprList, true);
			}
			this.checkExpressionErrors(refErrors, true);
			this.yieldPos = oldYieldPos || this.yieldPos;
			this.awaitPos = oldAwaitPos || this.awaitPos;
			this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
			const node = this.startNodeAt(startPos);
			node.callee = base;
			node.arguments = exprList;
			node.optional = optional;
			return this.finishNode(node, 'CallExpression');
		}
		if (this.type === tt.backQuote) {
			if (optional || optionalChained) {
				this.raise(this.start, 'Optional chaining cannot appear in the tag of tagged template expressions');
			}
			const node = this.startNodeAt(startPos);
			node.tag = base;
			node.quasi = this.parseTemplate(true);
			return this.finishNode(node, 'TaggedTemplateExpression');
		}
		return base;
	}

	parseExprAtom(refErrors: DestructuringErrors, forNew: boolean): ExpressionNode {
		// A `/` the tokenizer read as division is a regexp when an operand is expected.
		if (this.type === tt.slash) {
			this.readRegexp();
		}

		const canBeArrow = this.potentialArrowAt === this.start;
		const type = this.type;
		if (type === tt._super) {
			return this.raise(this.start, "'super' keyword outside a method");
		}
		if (type === tt._this) {
			const node = this.startNode();
			this.next(false);
			return this.finishNode(node, 'ThisExpression');
		}
		if (type === tt.name) {
			const startPos = this.start;
			const containsEsc = this.containsEsc;
			let id = this.parseIdent(false);
			if (!containsEsc && id.name === 'async' && !this.canInsertSemicolon() && this.type === tt._function) {
				return this.unsupported(this.start, 'async function expression');
			}
			if (canBeArrow && !this.canInsertSemicolon()) {
				if (this.eat(tt.arrow)) {
					return this.parseArrowExpression(this.startNodeAt(startPos), [id], false);
				}
				if (id.name === 'async' && this.type === tt.name && !containsEsc) {
					id = this.parseIdent(false);
					if (this.canInsertSemicolon() || !this.eat(tt.arrow)) {
						this.unexpected(this.start);
					}
					return this.parseArrowExpression(this.startNodeAt(startPos), [id], true);
				}
			}
			return id;
		}
		if (type === tt.regexp) {
			const pattern = this.regexPattern;
			const flags = this.regexFlags;
			const node = this.parseLiteral(this.regexValue);
			node.regex = { pattern: pattern, flags: flags };
			return node;
		}
		if (type === tt.num) {
			return this.parseLiteral(this.numValue);
		}
		if (type === tt.string) {
			return this.parseLiteral(this.value);
		}
		if (type === tt._null || type === tt._true || type === tt._false) {
			const node = this.startNode();
			node.value = type === tt._null ? null : type === tt._true;
			node.raw = type.keyword;
			this.next(false);
			return this.finishNode(node, 'Literal');
		}
		if (type === tt.parenL) {
			const start = this.start;
			const expr = this.parseParenAndDistinguishExpression(canBeArrow);
			if (refErrors != null) {
				if (refErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
					refErrors.parenthesizedAssign = start;
				}
				if (refErrors.parenthesizedBind < 0) {
					refErrors.parenthesizedBind = start;
				}
			}
			return expr;
		}
		if (type === tt.bracketL) {
			const node = this.startNode();
			this.next(false);
			node.elements = this.parseExprList(tt.bracketR, true, true, refErrors);
			return this.finishNode(node, 'ArrayExpression');
		}
		if (type === tt.braceL) {
			this.overrideContext(ctxBExpr);
			return this.parseObj(false, refErrors);
		}
		if (type === tt._function) {
			return this.unsupported(this.start, 'function expression');
		}
		if (type === tt._class) {
			return this.unsupported(this.start, 'class expression');
		}
		if (type === tt._new) {
			return this.parseNew();
		}
		if (type === tt.backQuote) {
			return this.parseTemplate(false);
		}
		if (type === tt._import) {
			return this.parseExprImport(forNew);
		}
		return this.unexpected(this.start);
	}

	parseExprImport(forNew: boolean): ExpressionNode {
		const node = this.startNode();
		if (this.containsEsc) {
			this.raise(this.start, 'Escape sequence in keyword import');
		}
		this.next(false);
		if (this.type === tt.parenL && !forNew) {
			this.next(false);
			node.source = this.parseMaybeAssign(null);
			if (!this.eat(tt.parenR)) {
				const errorPos = this.start;
				if (this.eat(tt.comma) && this.eat(tt.parenR)) {
					this.raise(errorPos, 'Trailing comma is not allowed in import()');
				}
				this.unexpected(errorPos);
			}
			return this.finishNode(node, 'ImportExpression');
		}
		if (this.type === tt.dot) {
			return this.raise(node.start, "Cannot use 'import.meta' outside a module");
		}
		return this.unexpected(this.start);
	}

	parseLiteral(value: any): ExpressionNode {
		const node = this.startNode();
		node.value = value;
		const raw = this.input.slice(this.start, this.end);
		node.raw = raw;
		if (raw.charCodeAt(raw.length - 1) === 110) {
			node.bigint = value != null ? value.toString() : raw.slice(0, -1).replace(UNDERSCORES, '');
		}
		this.next(false);
		return this.finishNode(node, 'Literal');
	}

	parseParenAndDistinguishExpression(canBeArrow: boolean): ExpressionNode {
		const startPos = this.start;
		this.next(false);

		const innerStartPos = this.start;
		const exprList: ExpressionNode[] = [];
		let first = true;
		let lastIsComma = false;
		const refErrors = new DestructuringErrors();
		const oldYieldPos = this.yieldPos;
		const oldAwaitPos = this.awaitPos;
		let spreadStart = 0;
		this.yieldPos = 0;
		this.awaitPos = 0;
		while (this.type !== tt.parenR) {
			if (first) {
				first = false;
			} else {
				this.expect(tt.comma);
			}
			if (this.afterTrailingComma(tt.parenR, true)) {
				lastIsComma = true;
				break;
			} else if (this.type === tt.ellipsis) {
				spreadStart = this.start;
				exprList.push(this.parseRestBinding());
				if (this.type === tt.comma) {
					this.raise(this.start, 'Comma is not permitted after the rest element');
				}
				break;
			} else {
				exprList.push(this.parseMaybeAssign(refErrors));
			}
		}
		const innerEndPos = this.lastTokEnd;
		this.expect(tt.parenR);

		if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
			this.checkPatternErrors(refErrors, false);
			this.checkYieldAwaitInDefaultParams();
			this.yieldPos = oldYieldPos;
			this.awaitPos = oldAwaitPos;
			return this.parseArrowExpression(this.startNodeAt(startPos), exprList, false);
		}

		if (exprList.length === 0 || lastIsComma) {
			this.unexpected(this.lastTokStart);
		}
		if (spreadStart !== 0) {
			this.unexpected(spreadStart);
		}
		this.checkExpressionErrors(refErrors, true);
		this.yieldPos = oldYieldPos || this.yieldPos;
		this.awaitPos = oldAwaitPos || this.awaitPos;

		if (exprList.length > 1) {
			const val = this.startNodeAt(innerStartPos);
			val.expressions = exprList;
			return this.finishNodeAt(val, 'SequenceExpression', innerEndPos);
		}
		return exprList[0];
	}

	parseNew(): ExpressionNode {
		if (this.containsEsc) {
			this.raise(this.start, 'Escape sequence in keyword new');
		}
		const node = this.startNode();
		this.next(false);
		if (this.type === tt.dot) {
			return this.raise(node.start, "'new.target' can only be used in functions and class static block");
		}
		const startPos = this.start;
		node.callee = this.parseSubscripts(this.parseExprAtom(null, true), startPos, true);
		if (this.eat(tt.parenL)) {
			node.arguments = this.parseExprList(tt.parenR, true, false, null);
		} else {
			node.arguments = [];
		}
		return this.finishNode(node, 'NewExpression');
	}

	parseTemplateElement(isTagged: boolean): ExpressionNode {
		const elem = this.startNode();
		if (this.type === tt.invalidTemplate) {
			if (!isTagged) {
				this.raise(this.start, 'Bad escape sequence in untagged template literal');
			}
			elem.value = { raw: this.value.replace(CRLF, '\n'), cooked: null };
		} else {
			elem.value = { raw: this.input.slice(this.start, this.end).replace(CRLF, '\n'), cooked: this.value };
		}
		this.next(false);
		elem.tail = this.type === tt.backQuote;
		return this.finishNode(elem, 'TemplateElement');
	}

	parseTemplate(isTagged: boolean): ExpressionNode {
		const node = this.startNode();
		this.next(false);
		const expressions: ExpressionNode[] = [];
		node.expressions = expressions;
		let curElt = this.parseTemplateElement(isTagged);
		const quasis: ExpressionNode[] = [curElt];
		node.quasis = quasis;
		while (!curElt.tail) {
			if (this.type === tt.eof) {
				this.raise(this.pos, 'Unterminated template literal');
			}
			this.expect(tt.dollarBraceL);
			expressions.push(this.parseExpression(null));
			this.expect(tt.braceR);
			curElt = this.parseTemplateElement(isTagged);
			quasis.push(curElt);
		}
		this.next(false);
		return this.finishNode(node, 'TemplateLiteral');
	}

	isAsyncProp(prop: ExpressionNode): boolean {
		return !prop.computed && prop.key.type === 'Identifier' && prop.key.name === 'async' && (this.type === tt.name || this.type === tt.num || this.type === tt.string || this.type === tt.bracketL || this.type.keyword !== '' || this.type === tt.star) && !this.hasLineBreak(this.lastTokEnd, this.start);
	}

	parseObj(isPattern: boolean, refErrors: DestructuringErrors): ExpressionNode {
		const node = this.startNode();
		let first = true;
		let sawProto = false;
		const properties: ExpressionNode[] = [];
		node.properties = properties;
		this.next(false);
		while (!this.eat(tt.braceR)) {
			if (!first) {
				this.expect(tt.comma);
				if (this.afterTrailingComma(tt.braceR, false)) {
					break;
				}
			} else {
				first = false;
			}
			const prop = this.parseProperty(isPattern, refErrors);
			if (!isPattern && this.isProtoInit(prop)) {
				if (sawProto) {
					if (refErrors != null) {
						if (refErrors.doubleProto < 0) {
							refErrors.doubleProto = prop.key.start;
						}
					} else {
						this.raise(prop.key.start, 'Redefinition of __proto__ property');
					}
				}
				sawProto = true;
			}
			properties.push(prop);
		}
		return this.finishNode(node, isPattern ? 'ObjectPattern' : 'ObjectExpression');
	}

	isProtoInit(prop: ExpressionNode): boolean {
		if (prop.type === 'SpreadElement' || prop.computed || prop.method || prop.shorthand) {
			return false;
		}
		const key = prop.key;
		let name: string;
		if (key.type === 'Identifier') {
			name = key.name;
		} else if (key.type === 'Literal') {
			name = String(key.value);
		} else {
			return false;
		}
		return name === '__proto__' && prop.kind === 'init';
	}

	parseProperty(isPattern: boolean, refErrors: DestructuringErrors): ExpressionNode {
		const prop = this.startNode();
		if (this.eat(tt.ellipsis)) {
			if (isPattern) {
				prop.argument = this.parseIdent(false);
				if (this.type === tt.comma) {
					this.raise(this.start, 'Comma is not permitted after the rest element');
				}
				return this.finishNode(prop, 'RestElement');
			}
			prop.argument = this.parseMaybeAssign(refErrors);
			if (this.type === tt.comma && refErrors != null && refErrors.trailingComma < 0) {
				refErrors.trailingComma = this.start;
			}
			return this.finishNode(prop, 'SpreadElement');
		}
		prop.method = false;
		prop.shorthand = false;
		let startPos = 0;
		if (isPattern || refErrors != null) {
			startPos = this.start;
		}
		if (!isPattern && this.type === tt.star) {
			this.unsupported(this.start, 'generator method');
		}
		const containsEsc = this.containsEsc;
		this.parsePropertyName(prop);
		if (!isPattern && !containsEsc && this.isAsyncProp(prop)) {
			this.unsupported(prop.start, 'async method');
		}
		this.parsePropertyValue(prop, isPattern, startPos, refErrors, containsEsc);
		return this.finishNode(prop, 'Property');
	}

	parsePropertyValue(prop: ExpressionNode, isPattern: boolean, startPos: number, refErrors: DestructuringErrors, containsEsc: boolean): void {
		if (this.eat(tt.colon)) {
			prop.value = isPattern ? this.parseMaybeDefault(this.start, null) : this.parseMaybeAssign(refErrors);
			prop.kind = 'init';
			return;
		}
		if (this.type === tt.parenL) {
			if (isPattern) {
				this.unexpected(this.start);
			}
			this.unsupported(prop.start, 'object method');
		}
		const key = prop.key;
		if (!isPattern && !containsEsc && !prop.computed && key.type === 'Identifier' && (key.name === 'get' || key.name === 'set') && this.type !== tt.comma && this.type !== tt.braceR && this.type !== tt.eq) {
			this.unsupported(prop.start, 'getter or setter');
		}
		if (!prop.computed && key.type === 'Identifier') {
			this.checkUnreserved(key);
			if (key.name === 'await' && this.awaitIdentPos === 0) {
				this.awaitIdentPos = startPos;
			}
			if (isPattern) {
				prop.value = this.parseMaybeDefault(startPos, this.copyIdentifier(key));
			} else if (this.type === tt.eq && refErrors != null) {
				if (refErrors.shorthandAssign < 0) {
					refErrors.shorthandAssign = this.start;
				}
				prop.value = this.parseMaybeDefault(startPos, this.copyIdentifier(key));
			} else {
				prop.value = this.copyIdentifier(key);
			}
			prop.kind = 'init';
			prop.shorthand = true;
			return;
		}
		this.unexpected(this.start);
	}

	parsePropertyName(prop: ExpressionNode): void {
		if (this.eat(tt.bracketL)) {
			prop.computed = true;
			prop.key = this.parseMaybeAssign(null);
			this.expect(tt.bracketR);
			return;
		}
		prop.computed = false;
		prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom(null, false) : this.parseIdent(true);
	}

	parseArrowExpression(node: ExpressionNode, params: ExpressionNode[], isAsync: boolean): ExpressionNode {
		const oldYieldPos = this.yieldPos;
		const oldAwaitPos = this.awaitPos;
		const oldAwaitIdentPos = this.awaitIdentPos;

		this.enterScope(SCOPE_FUNCTION | (isAsync ? SCOPE_ASYNC : 0) | SCOPE_ARROW);
		node.id = null;
		node.expression = false;
		node.generator = false;
		node.async = isAsync;

		this.yieldPos = 0;
		this.awaitPos = 0;
		this.awaitIdentPos = 0;

		node.params = this.toAssignableList(params, true);
		if (this.type === tt.braceL) {
			this.unsupported(this.start, 'arrow function block body');
		}
		node.body = this.parseMaybeAssign(null);
		node.expression = true;
		const nameHash = new Set<string>();
		const paramList: ExpressionNode[] = node.params;
		for (let i = 0; i < paramList.length; i++) {
			this.checkLValInnerPattern(paramList[i], BIND_VAR, nameHash);
		}
		this.exitScope();

		this.yieldPos = oldYieldPos;
		this.awaitPos = oldAwaitPos;
		this.awaitIdentPos = oldAwaitIdentPos;
		return this.finishNode(node, 'ArrowFunctionExpression');
	}

	parseExprList(close: TokenType, allowTrailingComma: boolean, allowEmpty: boolean, refErrors: DestructuringErrors): ExpressionNode[] {
		const elts: ExpressionNode[] = [];
		let first = true;
		while (!this.eat(close)) {
			if (!first) {
				this.expect(tt.comma);
				if (allowTrailingComma && this.afterTrailingComma(close, false)) {
					break;
				}
			} else {
				first = false;
			}

			let elt: ExpressionNode;
			if (allowEmpty && this.type === tt.comma) {
				elt = null;
			} else if (this.type === tt.ellipsis) {
				elt = this.parseSpread(refErrors);
				if (refErrors != null && this.type === tt.comma && refErrors.trailingComma < 0) {
					refErrors.trailingComma = this.start;
				}
			} else {
				elt = this.parseMaybeAssign(refErrors);
			}
			elts.push(elt);
		}
		return elts;
	}

	parseSpread(refErrors: DestructuringErrors): ExpressionNode {
		const node = this.startNode();
		this.next(false);
		node.argument = this.parseMaybeAssign(refErrors);
		return this.finishNode(node, 'SpreadElement');
	}

	checkUnreserved(node: ExpressionNode): void {
		const name: string = node.name;
		if (this.inAsync() && name === 'await') {
			this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
		}
		if (keywordTypes.has(name)) {
			this.raise(node.start, "Unexpected keyword '" + name + "'");
		}
		const reserved = this.strict ? RESERVED_WORDS_STRICT : RESERVED_WORDS;
		if (reserved.has(name)) {
			this.raise(node.start, "The keyword '" + name + "' is reserved");
		}
	}

	parseIdent(liberal: boolean): ExpressionNode {
		const node = this.parseIdentNode();
		this.next(liberal);
		this.finishNode(node, 'Identifier');
		if (!liberal) {
			this.checkUnreserved(node);
			if (node.name === 'await' && this.awaitIdentPos === 0) {
				this.awaitIdentPos = node.start;
			}
		}
		return node;
	}

	parseIdentNode(): ExpressionNode {
		const node = this.startNode();
		if (this.type === tt.name) {
			node.name = this.value;
		} else if (this.type.keyword !== '') {
			node.name = this.type.keyword;
			// `class`/`function` pushed a function context that a property name never closes.
			if ((node.name === 'class' || node.name === 'function') && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
				this.context.pop();
			}
			this.type = tt.name;
		} else {
			this.unexpected(this.start);
		}
		return node;
	}

	parseAwait(): ExpressionNode {
		if (this.awaitPos === 0) {
			this.awaitPos = this.start;
		}
		const node = this.startNode();
		this.next(false);
		node.argument = this.parseMaybeUnary(null, true, false);
		return this.finishNode(node, 'AwaitExpression');
	}

	// ## Patterns

	parseRestBinding(): ExpressionNode {
		const node = this.startNode();
		this.next(false);
		node.argument = this.parseBindingAtom();
		return this.finishNode(node, 'RestElement');
	}

	parseBindingAtom(): ExpressionNode {
		if (this.type === tt.bracketL) {
			const node = this.startNode();
			this.next(false);
			node.elements = this.parseBindingList(tt.bracketR);
			return this.finishNode(node, 'ArrayPattern');
		}
		if (this.type === tt.braceL) {
			return this.parseObj(true, null);
		}
		return this.parseIdent(false);
	}

	parseBindingList(close: TokenType): ExpressionNode[] {
		const elts: ExpressionNode[] = [];
		let first = true;
		while (!this.eat(close)) {
			if (first) {
				first = false;
			} else {
				this.expect(tt.comma);
			}
			if (this.type === tt.comma) {
				elts.push(null);
			} else if (this.afterTrailingComma(close, false)) {
				break;
			} else if (this.type === tt.ellipsis) {
				elts.push(this.parseRestBinding());
				if (this.type === tt.comma) {
					this.raise(this.start, 'Comma is not permitted after the rest element');
				}
				this.expect(close);
				break;
			} else {
				elts.push(this.parseMaybeDefault(this.start, null));
			}
		}
		return elts;
	}

	parseMaybeDefault(startPos: number, leftIn: ExpressionNode): ExpressionNode {
		const left = leftIn != null ? leftIn : this.parseBindingAtom();
		if (!this.eat(tt.eq)) {
			return left;
		}
		const node = this.startNodeAt(startPos);
		node.left = left;
		node.right = this.parseMaybeAssign(null);
		return this.finishNode(node, 'AssignmentPattern');
	}

	// Converts an expression to a pattern in place where acorn mutates `type`;
	// an AssignmentExpression becomes a new AssignmentPattern node, so callers store the result.
	toAssignable(node: ExpressionNode, isBinding: boolean, refErrors: DestructuringErrors): ExpressionNode {
		if (node == null) {
			if (refErrors != null) {
				this.checkPatternErrors(refErrors, true);
			}
			return node;
		}
		switch (node.type) {
			case 'Identifier':
				if (this.inAsync() && node.name === 'await') {
					this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
				}
				return node;
			case 'ObjectPattern':
			case 'ArrayPattern':
			case 'AssignmentPattern':
			case 'RestElement':
				return node;
			case 'ObjectExpression': {
				node.type = 'ObjectPattern';
				if (refErrors != null) {
					this.checkPatternErrors(refErrors, true);
				}
				const properties: ExpressionNode[] = node.properties;
				for (let i = 0; i < properties.length; i++) {
					const prop = this.toAssignable(properties[i], isBinding, null);
					properties[i] = prop;
					if (prop.type === 'RestElement' && (prop.argument.type === 'ArrayPattern' || prop.argument.type === 'ObjectPattern')) {
						this.raise(prop.argument.start, 'Unexpected token');
					}
				}
				return node;
			}
			case 'Property':
				if (node.kind !== 'init') {
					this.raise(node.key.start, "Object pattern can't contain getter or setter");
				}
				node.value = this.toAssignable(node.value, isBinding, null);
				return node;
			case 'ArrayExpression':
				node.type = 'ArrayPattern';
				if (refErrors != null) {
					this.checkPatternErrors(refErrors, true);
				}
				this.toAssignableList(node.elements, isBinding);
				return node;
			case 'SpreadElement':
				node.type = 'RestElement';
				node.argument = this.toAssignable(node.argument, isBinding, null);
				if (node.argument.type === 'AssignmentPattern') {
					this.raise(node.argument.start, 'Rest elements cannot have a default value');
				}
				return node;
			case 'AssignmentExpression': {
				if (node.operator !== '=') {
					this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
				}
				const pattern: ExpressionNode = { type: 'AssignmentPattern', start: node.start, end: node.end, left: node.left, right: node.right };
				pattern.left = this.toAssignable(node.left, isBinding, null);
				return pattern;
			}
			case 'ChainExpression':
				return this.raise(node.start, 'Optional chaining cannot appear in left-hand side');
			case 'MemberExpression':
				if (!isBinding) {
					return node;
				}
				return this.raise(node.start, 'Assigning to rvalue');
		}
		return this.raise(node.start, 'Assigning to rvalue');
	}

	toAssignableList(exprList: ExpressionNode[], isBinding: boolean): ExpressionNode[] {
		for (let i = 0; i < exprList.length; i++) {
			const elt = exprList[i];
			if (elt != null) {
				exprList[i] = this.toAssignable(elt, isBinding, null);
			}
		}
		return exprList;
	}

	checkLValSimple(expr: ExpressionNode, bindingType: number, checkClashes: Set<string>): void {
		const isBind = bindingType !== BIND_NONE;
		switch (expr.type) {
			case 'Identifier':
				if (this.strict && RESERVED_WORDS_STRICT_BIND.has(expr.name)) {
					this.raise(expr.start, (isBind ? 'Binding ' : 'Assigning to ') + expr.name + ' in strict mode');
				}
				if (isBind && checkClashes != null) {
					if (checkClashes.has(expr.name)) {
						this.raise(expr.start, 'Argument name clash');
					}
					checkClashes.add(expr.name);
				}
				return;
			case 'ChainExpression':
				this.raise(expr.start, 'Optional chaining cannot appear in left-hand side');
				return;
			case 'MemberExpression':
				if (isBind) {
					this.raise(expr.start, 'Binding member expression');
				}
				return;
		}
		this.raise(expr.start, (isBind ? 'Binding' : 'Assigning to') + ' rvalue');
	}

	checkLValPattern(expr: ExpressionNode, bindingType: number, checkClashes: Set<string>): void {
		if (expr.type === 'ObjectPattern') {
			const properties: ExpressionNode[] = expr.properties;
			for (let i = 0; i < properties.length; i++) {
				this.checkLValInnerPattern(properties[i], bindingType, checkClashes);
			}
			return;
		}
		if (expr.type === 'ArrayPattern') {
			const elements: ExpressionNode[] = expr.elements;
			for (let i = 0; i < elements.length; i++) {
				if (elements[i] != null) {
					this.checkLValInnerPattern(elements[i], bindingType, checkClashes);
				}
			}
			return;
		}
		this.checkLValSimple(expr, bindingType, checkClashes);
	}

	checkLValInnerPattern(expr: ExpressionNode, bindingType: number, checkClashes: Set<string>): void {
		if (expr.type === 'Property') {
			this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
		} else if (expr.type === 'AssignmentPattern') {
			this.checkLValPattern(expr.left, bindingType, checkClashes);
		} else if (expr.type === 'RestElement') {
			this.checkLValPattern(expr.argument, bindingType, checkClashes);
		} else {
			this.checkLValPattern(expr, bindingType, checkClashes);
		}
	}
}

/**
 * Returns the expression of the first top-level ExpressionStatement in `text`,
 * the node `acorn.parse(text, { ecmaVersion: 2020 })` yields there, or
 * `undefined` when the text holds no such statement (e.g. `{ a: 1 }` is a block).
 * Throws a SyntaxError for invalid input and for the unsupported constructs
 * listed at the top of this file.
 */
export function parseExpressionNode(text: string): ExpressionNode | undefined {
	return new ExpressionParser(text).parseProgram();
}
