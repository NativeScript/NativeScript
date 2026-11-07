
declare const PANGO_ANALYSIS_FLAG_CENTERED_BASELINE: number;

declare const PANGO_ANALYSIS_FLAG_IS_ELLIPSIS: number;

declare const PANGO_ANALYSIS_FLAG_NEED_HYPHEN: number;

declare const PANGO_ATTR_INDEX_FROM_TEXT_BEGINNING: number;

declare const PANGO_ATTR_INDEX_TO_TEXT_END: number;

declare const PANGO_ENGINE_TYPE_LANG: string;

declare const PANGO_ENGINE_TYPE_SHAPE: string;

declare const PANGO_GLYPH_EMPTY: number;

declare const PANGO_GLYPH_INVALID_INPUT: number;

declare const PANGO_GLYPH_UNKNOWN_FLAG: number;

declare const PANGO_RENDER_TYPE_NONE: string;

declare const PANGO_SCALE: number;

declare const PANGO_SCALE_LARGE: number;

declare const PANGO_SCALE_MEDIUM: number;

declare const PANGO_SCALE_SMALL: number;

declare const PANGO_SCALE_XX_LARGE: number;

declare const PANGO_SCALE_XX_SMALL: number;

declare const PANGO_SCALE_X_LARGE: number;

declare const PANGO_SCALE_X_SMALL: number;

declare const PANGO_UNKNOWN_GLYPH_HEIGHT: number;

declare const PANGO_UNKNOWN_GLYPH_WIDTH: number;

declare const PANGO_VERSION_MAJOR: number;

declare const PANGO_VERSION_MAX_ALLOWED: number;

declare const PANGO_VERSION_MICRO: number;

declare const PANGO_VERSION_MINOR: number;

declare const PANGO_VERSION_MIN_REQUIRED: number;

declare const PANGO_VERSION_STRING: string;

declare const enum PangoAlignment {

	LEFT = 0,

	CENTER = 1,

	RIGHT = 2
}

declare const enum PangoAttrType {

	INVALID = 0,

	LANGUAGE = 1,

	FAMILY = 2,

	STYLE = 3,

	WEIGHT = 4,

	VARIANT = 5,

	STRETCH = 6,

	SIZE = 7,

	FONT_DESC = 8,

	FOREGROUND = 9,

	BACKGROUND = 10,

	UNDERLINE = 11,

	STRIKETHROUGH = 12,

	RISE = 13,

	SHAPE = 14,

	SCALE = 15,

	FALLBACK = 16,

	LETTER_SPACING = 17,

	UNDERLINE_COLOR = 18,

	STRIKETHROUGH_COLOR = 19,

	ABSOLUTE_SIZE = 20,

	GRAVITY = 21,

	GRAVITY_HINT = 22,

	FONT_FEATURES = 23,

	FOREGROUND_ALPHA = 24,

	BACKGROUND_ALPHA = 25,

	ALLOW_BREAKS = 26,

	SHOW = 27,

	INSERT_HYPHENS = 28,

	OVERLINE = 29,

	OVERLINE_COLOR = 30,

	LINE_HEIGHT = 31,

	ABSOLUTE_LINE_HEIGHT = 32,

	TEXT_TRANSFORM = 33,

	WORD = 34,

	SENTENCE = 35,

	BASELINE_SHIFT = 36,

	FONT_SCALE = 37
}

declare const enum PangoBaselineShift {

	NONE = 0,

	SUPERSCRIPT = 1,

	SUBSCRIPT = 2
}

declare const enum PangoBidiType {

	L = 0,

	LRE = 1,

	LRO = 2,

	R = 3,

	AL = 4,

	RLE = 5,

	RLO = 6,

	PDF = 7,

	EN = 8,

	ES = 9,

	ET = 10,

	AN = 11,

	CS = 12,

	NSM = 13,

	BN = 14,

	B = 15,

	S = 16,

	WS = 17,

	ON = 18,

	LRI = 19,

	RLI = 20,

	FSI = 21,

	PDI = 22
}

declare const enum PangoCoverageLevel {

	NONE = 0,

	FALLBACK = 1,

	APPROXIMATE = 2,

	EXACT = 3
}

declare const enum PangoDirection {

	LTR = 0,

	RTL = 1,

	TTB_LTR = 2,

	TTB_RTL = 3,

	WEAK_LTR = 4,

	WEAK_RTL = 5,

	NEUTRAL = 6
}

declare const enum PangoEllipsizeMode {

	NONE = 0,

	START = 1,

	MIDDLE = 2,

	END = 3
}

declare const enum PangoFontMask {

	FAMILY = 1,

	STYLE = 2,

	VARIANT = 4,

	WEIGHT = 8,

	STRETCH = 16,

	SIZE = 32,

	GRAVITY = 64,

	VARIATIONS = 128
}

declare const enum PangoFontScale {

	NONE = 0,

	SUPERSCRIPT = 1,

	SUBSCRIPT = 2,

	SMALL_CAPS = 3
}

declare const enum PangoGravity {

	SOUTH = 0,

	EAST = 1,

	NORTH = 2,

	WEST = 3,

	AUTO = 4
}

declare const enum PangoGravityHint {

	NATURAL = 0,

	STRONG = 1,

	LINE = 2
}

declare const enum PangoLayoutDeserializeError {

	INVALID = 0,

	INVALID_VALUE = 1,

	MISSING_VALUE = 2
}

declare const enum PangoLayoutDeserializeFlags {

	DEFAULT = 0,

	CONTEXT = 1
}

declare const enum PangoLayoutSerializeFlags {

	DEFAULT = 0,

	CONTEXT = 1,

	OUTPUT = 2
}

declare const enum PangoOverline {

	NONE = 0,

	SINGLE = 1
}

declare const enum PangoRenderPart {

	FOREGROUND = 0,

	BACKGROUND = 1,

	UNDERLINE = 2,

	STRIKETHROUGH = 3,

	OVERLINE = 4
}

declare const enum PangoScript {

	INVALID_CODE = -1,

	COMMON = 0,

	INHERITED = 1,

	ARABIC = 2,

	ARMENIAN = 3,

	BENGALI = 4,

	BOPOMOFO = 5,

	CHEROKEE = 6,

	COPTIC = 7,

	CYRILLIC = 8,

	DESERET = 9,

	DEVANAGARI = 10,

	ETHIOPIC = 11,

	GEORGIAN = 12,

	GOTHIC = 13,

	GREEK = 14,

	GUJARATI = 15,

	GURMUKHI = 16,

	HAN = 17,

	HANGUL = 18,

	HEBREW = 19,

	HIRAGANA = 20,

	KANNADA = 21,

	KATAKANA = 22,

	KHMER = 23,

	LAO = 24,

	LATIN = 25,

	MALAYALAM = 26,

	MONGOLIAN = 27,

	MYANMAR = 28,

	OGHAM = 29,

	OLD_ITALIC = 30,

	ORIYA = 31,

	RUNIC = 32,

	SINHALA = 33,

	SYRIAC = 34,

	TAMIL = 35,

	TELUGU = 36,

	THAANA = 37,

	THAI = 38,

	TIBETAN = 39,

	CANADIAN_ABORIGINAL = 40,

	YI = 41,

	TAGALOG = 42,

	HANUNOO = 43,

	BUHID = 44,

	TAGBANWA = 45,

	BRAILLE = 46,

	CYPRIOT = 47,

	LIMBU = 48,

	OSMANYA = 49,

	SHAVIAN = 50,

	LINEAR_B = 51,

	TAI_LE = 52,

	UGARITIC = 53,

	NEW_TAI_LUE = 54,

	BUGINESE = 55,

	GLAGOLITIC = 56,

	TIFINAGH = 57,

	SYLOTI_NAGRI = 58,

	OLD_PERSIAN = 59,

	KHAROSHTHI = 60,

	UNKNOWN = 61,

	BALINESE = 62,

	CUNEIFORM = 63,

	PHOENICIAN = 64,

	PHAGS_PA = 65,

	NKO = 66,

	KAYAH_LI = 67,

	LEPCHA = 68,

	REJANG = 69,

	SUNDANESE = 70,

	SAURASHTRA = 71,

	CHAM = 72,

	OL_CHIKI = 73,

	VAI = 74,

	CARIAN = 75,

	LYCIAN = 76,

	LYDIAN = 77,

	BATAK = 78,

	BRAHMI = 79,

	MANDAIC = 80,

	CHAKMA = 81,

	MEROITIC_CURSIVE = 82,

	MEROITIC_HIEROGLYPHS = 83,

	MIAO = 84,

	SHARADA = 85,

	SORA_SOMPENG = 86,

	TAKRI = 87,

	BASSA_VAH = 88,

	CAUCASIAN_ALBANIAN = 89,

	DUPLOYAN = 90,

	ELBASAN = 91,

	GRANTHA = 92,

	KHOJKI = 93,

	KHUDAWADI = 94,

	LINEAR_A = 95,

	MAHAJANI = 96,

	MANICHAEAN = 97,

	MENDE_KIKAKUI = 98,

	MODI = 99,

	MRO = 100,

	NABATAEAN = 101,

	OLD_NORTH_ARABIAN = 102,

	OLD_PERMIC = 103,

	PAHAWH_HMONG = 104,

	PALMYRENE = 105,

	PAU_CIN_HAU = 106,

	PSALTER_PAHLAVI = 107,

	SIDDHAM = 108,

	TIRHUTA = 109,

	WARANG_CITI = 110,

	AHOM = 111,

	ANATOLIAN_HIEROGLYPHS = 112,

	HATRAN = 113,

	MULTANI = 114,

	OLD_HUNGARIAN = 115,

	SIGNWRITING = 116
}

declare const enum PangoShapeFlags {

	NONE = 0,

	ROUND_POSITIONS = 1
}

declare const enum PangoShowFlags {

	NONE = 0,

	SPACES = 1,

	LINE_BREAKS = 2,

	IGNORABLES = 4
}

declare const enum PangoStretch {

	ULTRA_CONDENSED = 0,

	EXTRA_CONDENSED = 1,

	CONDENSED = 2,

	SEMI_CONDENSED = 3,

	NORMAL = 4,

	SEMI_EXPANDED = 5,

	EXPANDED = 6,

	EXTRA_EXPANDED = 7,

	ULTRA_EXPANDED = 8
}

declare const enum PangoStyle {

	NORMAL = 0,

	OBLIQUE = 1,

	ITALIC = 2
}

declare const enum PangoTabAlign {

	LEFT = 0,

	RIGHT = 1,

	CENTER = 2,

	DECIMAL = 3
}

declare const enum PangoTextTransform {

	NONE = 0,

	LOWERCASE = 1,

	UPPERCASE = 2,

	CAPITALIZE = 3
}

declare const enum PangoUnderline {

	NONE = 0,

	SINGLE = 1,

	DOUBLE = 2,

	LOW = 3,

	ERROR = 4,

	SINGLE_LINE = 5,

	DOUBLE_LINE = 6,

	ERROR_LINE = 7
}

declare const enum PangoVariant {

	NORMAL = 0,

	SMALL_CAPS = 1,

	ALL_SMALL_CAPS = 2,

	PETITE_CAPS = 3,

	ALL_PETITE_CAPS = 4,

	UNICASE = 5,

	TITLE_CAPS = 6
}

declare const enum PangoWeight {

	THIN = 100,

	ULTRALIGHT = 200,

	LIGHT = 300,

	SEMILIGHT = 350,

	BOOK = 380,

	NORMAL = 400,

	MEDIUM = 500,

	SEMIBOLD = 600,

	BOLD = 700,

	ULTRABOLD = 800,

	HEAVY = 900,

	ULTRAHEAVY = 1000
}

declare const enum PangoWrapMode {

	WORD = 0,

	CHAR = 1,

	WORD_CHAR = 2
}

interface _PangoAnalysis {
	shape_engine: interop.Pointer | interop.Reference<_PangoEngineShape> | null;
	lang_engine: interop.Pointer | interop.Reference<_PangoEngineLang> | null;
	font: interop.Pointer | interop.Reference<_PangoFont> | null;
	level: number;
	gravity: number;
	flags: number;
	script: number;
	language: interop.Pointer | interop.Reference<any> | null;
	extra_attrs: interop.Pointer | interop.Reference<_GSList> | null;
}
declare var _PangoAnalysis: interop.StructType<_PangoAnalysis>;

interface _PangoAttrClass {
	type: PangoAttrType;
	copy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoAttribute> | null) => interop.Pointer | interop.Reference<_PangoAttribute> | null>;
	destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoAttribute> | null) => void>;
	equal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoAttribute> | null, p2: interop.Pointer | interop.Reference<_PangoAttribute> | null) => number>;
}
declare var _PangoAttrClass: interop.StructType<_PangoAttrClass>;

interface _PangoAttrColor {
	attr: _PangoAttribute;
	color: _PangoColor;
}
declare var _PangoAttrColor: interop.StructType<_PangoAttrColor>;

interface _PangoAttrFloat {
	attr: _PangoAttribute;
	value: number;
}
declare var _PangoAttrFloat: interop.StructType<_PangoAttrFloat>;

interface _PangoAttrFontDesc {
	attr: _PangoAttribute;
	desc: interop.Pointer | interop.Reference<any> | null;
}
declare var _PangoAttrFontDesc: interop.StructType<_PangoAttrFontDesc>;

interface _PangoAttrFontFeatures {
	attr: _PangoAttribute;
	features: interop.Pointer | interop.Reference<any> | null;
}
declare var _PangoAttrFontFeatures: interop.StructType<_PangoAttrFontFeatures>;

interface _PangoAttrInt {
	attr: _PangoAttribute;
	value: number;
}
declare var _PangoAttrInt: interop.StructType<_PangoAttrInt>;

interface _PangoAttrLanguage {
	attr: _PangoAttribute;
	value: interop.Pointer | interop.Reference<any> | null;
}
declare var _PangoAttrLanguage: interop.StructType<_PangoAttrLanguage>;

interface _PangoAttrShape {
	attr: _PangoAttribute;
	ink_rect: _PangoRectangle;
	logical_rect: _PangoRectangle;
	data: interop.Pointer | interop.Reference<any> | null;
	copy_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<any> | null>;
	destroy_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
}
declare var _PangoAttrShape: interop.StructType<_PangoAttrShape>;

interface _PangoAttrSize {
	attr: _PangoAttribute;
	size: number;
	absolute: number;
}
declare var _PangoAttrSize: interop.StructType<_PangoAttrSize>;

interface _PangoAttrString {
	attr: _PangoAttribute;
	value: interop.Pointer | interop.Reference<any> | null;
}
declare var _PangoAttrString: interop.StructType<_PangoAttrString>;

interface _PangoAttribute {
	klass: interop.Pointer | interop.Reference<_PangoAttrClass> | null;
	start_index: number;
	end_index: number;
}
declare var _PangoAttribute: interop.StructType<_PangoAttribute>;

interface _PangoColor {
	red: number;
	green: number;
	blue: number;
}
declare var _PangoColor: interop.StructType<_PangoColor>;

interface _PangoEngine {
	parent_instance: _GObject;
}
declare var _PangoEngine: interop.StructType<_PangoEngine>;

interface _PangoEngineClass {
	parent_class: _GObjectClass;
}
declare var _PangoEngineClass: interop.StructType<_PangoEngineClass>;

interface _PangoEngineInfo {
	id: string | null;
	engine_type: string | null;
	render_type: string | null;
	scripts: interop.Pointer | interop.Reference<_PangoEngineScriptInfo> | null;
	n_scripts: number;
}
declare var _PangoEngineInfo: interop.StructType<_PangoEngineInfo>;

interface _PangoEngineLang {
	parent_instance: _PangoEngine;
}
declare var _PangoEngineLang: interop.StructType<_PangoEngineLang>;

interface _PangoEngineLangClass {
	parent_class: _PangoEngineClass;
	script_break: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoEngineLang> | null, p2: string | null, p3: number, p4: interop.Pointer | interop.Reference<_PangoAnalysis> | null, p5: interop.Pointer | interop.Reference<_PangoLogAttr> | null, p6: number) => void>;
}
declare var _PangoEngineLangClass: interop.StructType<_PangoEngineLangClass>;

interface _PangoEngineScriptInfo {
	script: PangoScript;
	langs: string | null;
}
declare var _PangoEngineScriptInfo: interop.StructType<_PangoEngineScriptInfo>;

interface _PangoEngineShape {
	parent_instance: _PangoEngine;
}
declare var _PangoEngineShape: interop.StructType<_PangoEngineShape>;

interface _PangoEngineShapeClass {
	parent_class: _PangoEngineClass;
	script_shape: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoEngineShape> | null, p2: interop.Pointer | interop.Reference<_PangoFont> | null, p3: string | null, p4: number, p5: interop.Pointer | interop.Reference<_PangoAnalysis> | null, p6: interop.Pointer | interop.Reference<_PangoGlyphString> | null, p7: string | null, p8: number) => void>;
	covers: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoEngineShape> | null, p2: interop.Pointer | interop.Reference<_PangoFont> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: number) => PangoCoverageLevel>;
}
declare var _PangoEngineShapeClass: interop.StructType<_PangoEngineShapeClass>;

interface _PangoFont {
	parent_instance: _GObject;
}
declare var _PangoFont: interop.StructType<_PangoFont>;

interface _PangoFontClass {
	parent_class: _GObjectClass;
	describe: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFont> | null) => interop.Pointer | interop.Reference<any> | null>;
	get_coverage: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFont> | null, p2: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<any> | null>;
	get_glyph_extents: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFont> | null, p2: number, p3: interop.Pointer | interop.Reference<_PangoRectangle> | null, p4: interop.Pointer | interop.Reference<_PangoRectangle> | null) => void>;
	get_metrics: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFont> | null, p2: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<_PangoFontMetrics> | null>;
	get_font_map: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFont> | null) => interop.Pointer | interop.Reference<_PangoFontMap> | null>;
	describe_absolute: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFont> | null) => interop.Pointer | interop.Reference<any> | null>;
	get_features: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFont> | null, p2: interop.Pointer | interop.Reference<hb_feature_t> | null, p3: number, p4: interop.Pointer | interop.Reference<number> | null) => void>;
	create_hb_font: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFont> | null) => interop.Pointer | interop.Reference<any> | null>;
}
declare var _PangoFontClass: interop.StructType<_PangoFontClass>;

interface _PangoFontFace {
	parent_instance: _GObject;
}
declare var _PangoFontFace: interop.StructType<_PangoFontFace>;

interface _PangoFontFaceClass {
	parent_class: _GObjectClass;
	get_face_name: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontFace> | null) => string | null>;
	describe: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontFace> | null) => interop.Pointer | interop.Reference<any> | null>;
	list_sizes: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontFace> | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | null, p3: interop.Pointer | interop.Reference<number> | null) => void>;
	is_synthesized: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontFace> | null) => number>;
	get_family: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontFace> | null) => interop.Pointer | interop.Reference<_PangoFontFamily> | null>;
	_pango_reserved3: interop.FunctionReference<() => void>;
	_pango_reserved4: interop.FunctionReference<() => void>;
}
declare var _PangoFontFaceClass: interop.StructType<_PangoFontFaceClass>;

interface _PangoFontFamily {
	parent_instance: _GObject;
}
declare var _PangoFontFamily: interop.StructType<_PangoFontFamily>;

interface _PangoFontFamilyClass {
	parent_class: _GObjectClass;
	list_faces: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontFamily> | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_PangoFontFace> | null> | null> | null, p3: interop.Pointer | interop.Reference<number> | null) => void>;
	get_name: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontFamily> | null) => string | null>;
	is_monospace: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontFamily> | null) => number>;
	is_variable: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontFamily> | null) => number>;
	get_face: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontFamily> | null, p2: string | null) => interop.Pointer | interop.Reference<_PangoFontFace> | null>;
	_pango_reserved2: interop.FunctionReference<() => void>;
}
declare var _PangoFontFamilyClass: interop.StructType<_PangoFontFamilyClass>;

interface _PangoFontMap {
	parent_instance: _GObject;
}
declare var _PangoFontMap: interop.StructType<_PangoFontMap>;

interface _PangoFontMapClass {
	parent_class: _GObjectClass;
	load_font: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontMap> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<_PangoFont> | null>;
	list_families: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontMap> | null, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_PangoFontFamily> | null> | null> | null, p3: interop.Pointer | interop.Reference<number> | null) => void>;
	load_fontset: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontMap> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<_PangoFontset> | null>;
	shape_engine_type: string | null;
	get_serial: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontMap> | null) => number>;
	changed: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontMap> | null) => void>;
	get_family: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontMap> | null, p2: string | null) => interop.Pointer | interop.Reference<_PangoFontFamily> | null>;
	get_face: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontMap> | null, p2: interop.Pointer | interop.Reference<_PangoFont> | null) => interop.Pointer | interop.Reference<_PangoFontFace> | null>;
}
declare var _PangoFontMapClass: interop.StructType<_PangoFontMapClass>;

interface _PangoFontMetrics {
	ref_count: number;
	ascent: number;
	descent: number;
	height: number;
	approximate_char_width: number;
	approximate_digit_width: number;
	underline_position: number;
	underline_thickness: number;
	strikethrough_position: number;
	strikethrough_thickness: number;
}
declare var _PangoFontMetrics: interop.StructType<_PangoFontMetrics>;

interface _PangoFontset {
	parent_instance: _GObject;
}
declare var _PangoFontset: interop.StructType<_PangoFontset>;

interface _PangoFontsetClass {
	parent_class: _GObjectClass;
	get_font: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontset> | null, p2: number) => interop.Pointer | interop.Reference<_PangoFont> | null>;
	get_metrics: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontset> | null) => interop.Pointer | interop.Reference<_PangoFontMetrics> | null>;
	get_language: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontset> | null) => interop.Pointer | interop.Reference<any> | null>;
	foreach: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontset> | null, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontset> | null, p2: interop.Pointer | interop.Reference<_PangoFont> | null, p3: interop.Pointer | interop.Reference<any> | null) => number>, p3: interop.Pointer | interop.Reference<any> | null) => void>;
	_pango_reserved1: interop.FunctionReference<() => void>;
	_pango_reserved2: interop.FunctionReference<() => void>;
	_pango_reserved3: interop.FunctionReference<() => void>;
	_pango_reserved4: interop.FunctionReference<() => void>;
}
declare var _PangoFontsetClass: interop.StructType<_PangoFontsetClass>;

interface _PangoGlyphGeometry {
	width: number;
	x_offset: number;
	y_offset: number;
}
declare var _PangoGlyphGeometry: interop.StructType<_PangoGlyphGeometry>;

interface _PangoGlyphInfo {
	glyph: number;
	geometry: _PangoGlyphGeometry;
	attr: _PangoGlyphVisAttr;
}
declare var _PangoGlyphInfo: interop.StructType<_PangoGlyphInfo>;

interface _PangoGlyphItem {
	item: interop.Pointer | interop.Reference<_PangoItem> | null;
	glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | null;
	y_offset: number;
	start_x_offset: number;
	end_x_offset: number;
}
declare var _PangoGlyphItem: interop.StructType<_PangoGlyphItem>;

interface _PangoGlyphItemIter {
	glyph_item: interop.Pointer | interop.Reference<_PangoGlyphItem> | null;
	text: string | null;
	start_glyph: number;
	start_index: number;
	start_char: number;
	end_glyph: number;
	end_index: number;
	end_char: number;
}
declare var _PangoGlyphItemIter: interop.StructType<_PangoGlyphItemIter>;

interface _PangoGlyphString {
	num_glyphs: number;
	glyphs: interop.Pointer | interop.Reference<_PangoGlyphInfo> | null;
	log_clusters: interop.Pointer | interop.Reference<number> | null;
	space: number;
}
declare var _PangoGlyphString: interop.StructType<_PangoGlyphString>;

interface _PangoGlyphVisAttr {
	is_cluster_start: number;
	is_color: number;
}
declare var _PangoGlyphVisAttr: interop.StructType<_PangoGlyphVisAttr>;

interface _PangoItem {
	offset: number;
	length: number;
	num_chars: number;
	analysis: _PangoAnalysis;
}
declare var _PangoItem: interop.StructType<_PangoItem>;

interface _PangoLayoutLine {
	layout: interop.Pointer | interop.Reference<any> | null;
	start_index: number;
	length: number;
	runs: interop.Pointer | interop.Reference<_GSList> | null;
	is_paragraph_start: number;
	resolved_dir: number;
}
declare var _PangoLayoutLine: interop.StructType<_PangoLayoutLine>;

interface _PangoLogAttr {
	is_line_break: number;
	is_mandatory_break: number;
	is_char_break: number;
	is_white: number;
	is_cursor_position: number;
	is_word_start: number;
	is_word_end: number;
	is_sentence_boundary: number;
	is_sentence_start: number;
	is_sentence_end: number;
	backspace_deletes_character: number;
	is_expandable_space: number;
	is_word_boundary: number;
	break_inserts_hyphen: number;
	break_removes_preceding: number;
	reserved: number;
}
declare var _PangoLogAttr: interop.StructType<_PangoLogAttr>;

interface _PangoMatrix {
	xx: number;
	xy: number;
	yx: number;
	yy: number;
	x0: number;
	y0: number;
}
declare var _PangoMatrix: interop.StructType<_PangoMatrix>;

interface _PangoRectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}
declare var _PangoRectangle: interop.StructType<_PangoRectangle>;

interface _PangoRenderer {
	parent_instance: _GObject;
	underline: PangoUnderline;
	strikethrough: number;
	active_count: number;
	matrix: interop.Pointer | interop.Reference<_PangoMatrix> | null;
	priv: interop.Pointer | interop.Reference<any> | null;
}
declare var _PangoRenderer: interop.StructType<_PangoRenderer>;

interface _PangoRendererClass {
	parent_class: _GObjectClass;
	draw_glyphs: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null, p2: interop.Pointer | interop.Reference<_PangoFont> | null, p3: interop.Pointer | interop.Reference<_PangoGlyphString> | null, p4: number, p5: number) => void>;
	draw_rectangle: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null, p2: PangoRenderPart, p3: number, p4: number, p5: number, p6: number) => void>;
	draw_error_underline: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null, p2: number, p3: number, p4: number, p5: number) => void>;
	draw_shape: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null, p2: interop.Pointer | interop.Reference<_PangoAttrShape> | null, p3: number, p4: number) => void>;
	draw_trapezoid: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null, p2: PangoRenderPart, p3: number, p4: number, p5: number, p6: number, p7: number, p8: number) => void>;
	draw_glyph: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null, p2: interop.Pointer | interop.Reference<_PangoFont> | null, p3: number, p4: number, p5: number) => void>;
	part_changed: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null, p2: PangoRenderPart) => void>;
	begin: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null) => void>;
	end: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null) => void>;
	prepare_run: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null, p2: interop.Pointer | interop.Reference<_PangoGlyphItem> | null) => void>;
	draw_glyph_item: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoRenderer> | null, p2: string | null, p3: interop.Pointer | interop.Reference<_PangoGlyphItem> | null, p4: number, p5: number) => void>;
	_pango_reserved2: interop.FunctionReference<() => void>;
	_pango_reserved3: interop.FunctionReference<() => void>;
	_pango_reserved4: interop.FunctionReference<() => void>;
}
declare var _PangoRendererClass: interop.StructType<_PangoRendererClass>;

declare function pango_alignment_get_type(): number;

declare function pango_attr_allow_breaks_new(allow_breaks: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_background_alpha_new(alpha: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_background_new(red: number, green: number, blue: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_baseline_shift_new(shift: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_break(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, attr_list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, offset: number, attrs: interop.Pointer | interop.Reference<_PangoLogAttr> | ArrayBufferLike | ArrayBufferView | null, attrs_len: number): void;

declare function pango_attr_fallback_new(enable_fallback: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_family_new(family: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_font_desc_new(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_font_features_new(features: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_font_scale_new(scale: PangoFontScale): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_foreground_alpha_new(alpha: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_foreground_new(red: number, green: number, blue: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_gravity_hint_new(hint: PangoGravityHint): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_gravity_new(gravity: PangoGravity): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_insert_hyphens_new(insert_hyphens: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_iterator_copy(iterator: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_attr_iterator_destroy(iterator: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_attr_iterator_get(iterator: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, type: PangoAttrType): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_iterator_get_attrs(iterator: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_GSList> | null;

declare function pango_attr_iterator_get_font(iterator: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, language: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, extra_attrs: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GSList> | null> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_attr_iterator_get_type(): number;

declare function pango_attr_iterator_next(iterator: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_attr_iterator_range(iterator: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, end: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_attr_language_new(language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_letter_spacing_new(letter_spacing: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_line_height_new(factor: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_line_height_new_absolute(height: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_list_change(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_attr_list_copy(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_attr_list_equal(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other_list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_attr_list_filter(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoAttribute> | null, p2: interop.Pointer | interop.Reference<any> | null) => number>, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_attr_list_from_string(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_attr_list_get_attributes(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_GSList> | null;

declare function pango_attr_list_get_iterator(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_attr_list_get_type(): number;

declare function pango_attr_list_insert(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_attr_list_insert_before(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_attr_list_new(): interop.Pointer | interop.Reference<any> | null;

declare function pango_attr_list_ref(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_attr_list_splice(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pos: number, len: number): void;

declare function pango_attr_list_to_string(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_attr_list_unref(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_attr_list_update(list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pos: number, remove: number, add: number): void;

declare function pango_attr_overline_color_new(red: number, green: number, blue: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_overline_new(overline: PangoOverline): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_rise_new(rise: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_scale_new(scale_factor: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_sentence_new(): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_shape_new(ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_shape_new_with_data(ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, copy_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<any> | null>, destroy_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_show_new(flags: PangoShowFlags): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_size_new(size: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_size_new_absolute(size: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_stretch_new(stretch: PangoStretch): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_strikethrough_color_new(red: number, green: number, blue: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_strikethrough_new(strikethrough: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_style_new(style: PangoStyle): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_text_transform_new(transform: PangoTextTransform): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_type_get_name(type: PangoAttrType): string | null;

declare function pango_attr_type_get_type(): number;

declare function pango_attr_type_register(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoAttrType;

declare function pango_attr_underline_color_new(red: number, green: number, blue: number): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_underline_new(underline: PangoUnderline): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_variant_new(variant: PangoVariant): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_weight_new(weight: PangoWeight): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attr_word_new(): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attribute_as_color(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttrColor> | null;

declare function pango_attribute_as_float(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttrFloat> | null;

declare function pango_attribute_as_font_desc(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttrFontDesc> | null;

declare function pango_attribute_as_font_features(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttrFontFeatures> | null;

declare function pango_attribute_as_int(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttrInt> | null;

declare function pango_attribute_as_language(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttrLanguage> | null;

declare function pango_attribute_as_shape(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttrShape> | null;

declare function pango_attribute_as_size(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttrSize> | null;

declare function pango_attribute_as_string(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttrString> | null;

declare function pango_attribute_copy(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoAttribute> | null;

declare function pango_attribute_destroy(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_attribute_equal(attr1: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null, attr2: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_attribute_get_type(): number;

declare function pango_attribute_init(attr: interop.Pointer | interop.Reference<_PangoAttribute> | ArrayBufferLike | ArrayBufferView | null, klass: interop.Pointer | interop.Reference<_PangoAttrClass> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_baseline_shift_get_type(): number;

declare function pango_bidi_type_for_unichar(ch: number): PangoBidiType;

declare function pango_bidi_type_get_type(): number;

declare function pango_break(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, analysis: interop.Pointer | interop.Reference<_PangoAnalysis> | ArrayBufferLike | ArrayBufferView | null, attrs: interop.Pointer | interop.Reference<_PangoLogAttr> | ArrayBufferLike | ArrayBufferView | null, attrs_len: number): void;

declare function pango_cairo_context_get_font_options(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_cairo_context_get_resolution(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_cairo_context_get_shape_renderer(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<_PangoAttrShape> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null) => void>;

declare function pango_cairo_context_set_font_options(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_cairo_context_set_resolution(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dpi: number): void;

declare function pango_cairo_context_set_shape_renderer(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<_PangoAttrShape> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null) => void>, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dnotify: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function pango_cairo_create_context(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_cairo_create_layout(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_cairo_error_underline_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, width: number, height: number): void;

declare function pango_cairo_font_get_scaled_font(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_cairo_font_get_type(): number;

declare function pango_cairo_font_map_create_context(fontmap: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_cairo_font_map_get_default(): interop.Pointer | interop.Reference<_PangoFontMap> | null;

declare function pango_cairo_font_map_get_font_type(fontmap: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_font_type_t;

declare function pango_cairo_font_map_get_resolution(fontmap: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_cairo_font_map_get_type(): number;

declare function pango_cairo_font_map_new(): interop.Pointer | interop.Reference<_PangoFontMap> | null;

declare function pango_cairo_font_map_new_for_font_type(fonttype: cairo_font_type_t): interop.Pointer | interop.Reference<_PangoFontMap> | null;

declare function pango_cairo_font_map_set_default(fontmap: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_cairo_font_map_set_resolution(fontmap: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dpi: number): void;

declare function pango_cairo_glyph_string_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_cairo_layout_line_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_cairo_layout_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_cairo_show_error_underline(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, width: number, height: number): void;

declare function pango_cairo_show_glyph_item(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph_item: interop.Pointer | interop.Reference<_PangoGlyphItem> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_cairo_show_glyph_string(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_cairo_show_layout(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_cairo_show_layout_line(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_cairo_update_context(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_cairo_update_layout(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_color_copy(src: interop.Pointer | interop.Reference<_PangoColor> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoColor> | null;

declare function pango_color_free(color: interop.Pointer | interop.Reference<_PangoColor> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_color_get_type(): number;

declare function pango_color_parse(color: interop.Pointer | interop.Reference<_PangoColor> | ArrayBufferLike | ArrayBufferView | null, spec: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_color_parse_with_alpha(color: interop.Pointer | interop.Reference<_PangoColor> | ArrayBufferLike | ArrayBufferView | null, alpha: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, spec: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_color_to_string(color: interop.Pointer | interop.Reference<_PangoColor> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_context_changed(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_context_get_base_dir(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoDirection;

declare function pango_context_get_base_gravity(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoGravity;

declare function pango_context_get_font_description(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_context_get_font_map(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontMap> | null;

declare function pango_context_get_gravity(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoGravity;

declare function pango_context_get_gravity_hint(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoGravityHint;

declare function pango_context_get_language(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_context_get_matrix(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoMatrix> | null;

declare function pango_context_get_metrics(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontMetrics> | null;

declare function pango_context_get_round_glyph_positions(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_context_get_serial(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_context_get_type(): number;

declare function pango_context_list_families(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, families: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_PangoFontFamily> | null> | null> | ArrayBufferLike | ArrayBufferView | null, n_families: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_context_load_font(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFont> | null;

declare function pango_context_load_fontset(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontset> | null;

declare function pango_context_new(): interop.Pointer | interop.Reference<any> | null;

declare function pango_context_set_base_dir(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, direction: PangoDirection): void;

declare function pango_context_set_base_gravity(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, gravity: PangoGravity): void;

declare function pango_context_set_font_description(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_context_set_font_map(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, font_map: interop.Pointer | interop.Reference<_PangoFontMap> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_context_set_gravity_hint(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, hint: PangoGravityHint): void;

declare function pango_context_set_language(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_context_set_matrix(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_context_set_round_glyph_positions(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, round_positions: number): void;

declare function pango_coverage_copy(coverage: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_coverage_from_bytes(bytes: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, n_bytes: number): interop.Pointer | interop.Reference<any> | null;

declare function pango_coverage_get(coverage: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index_: number): PangoCoverageLevel;

declare function pango_coverage_get_type(): number;

declare function pango_coverage_level_get_type(): number;

declare function pango_coverage_max(coverage: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_coverage_new(): interop.Pointer | interop.Reference<any> | null;

declare function pango_coverage_ref(coverage: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_coverage_set(coverage: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index_: number, level: PangoCoverageLevel): void;

declare function pango_coverage_to_bytes(coverage: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, bytes: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, n_bytes: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_coverage_unref(coverage: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_default_break(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, analysis: interop.Pointer | interop.Reference<_PangoAnalysis> | ArrayBufferLike | ArrayBufferView | null, attrs: interop.Pointer | interop.Reference<_PangoLogAttr> | ArrayBufferLike | ArrayBufferView | null, attrs_len: number): void;

declare function pango_direction_get_type(): number;

declare function pango_ellipsize_mode_get_type(): number;

declare function pango_engine_get_type(): number;

declare function pango_engine_lang_get_type(): number;

declare function pango_engine_shape_get_type(): number;

declare function pango_extents_to_pixels(inclusive: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, nearest: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_find_base_dir(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number): PangoDirection;

declare function pango_find_paragraph_boundary(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, paragraph_delimiter_index: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, next_paragraph_start: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_describe(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_describe_with_absolute_size(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_description_better_match(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, old_match: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, new_match: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_description_copy(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_description_copy_static(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_description_equal(desc1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_description_free(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_description_from_string(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_description_get_family(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function pango_font_description_get_gravity(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoGravity;

declare function pango_font_description_get_set_fields(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoFontMask;

declare function pango_font_description_get_size(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_description_get_size_is_absolute(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_description_get_stretch(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoStretch;

declare function pango_font_description_get_style(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoStyle;

declare function pango_font_description_get_type(): number;

declare function pango_font_description_get_variant(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoVariant;

declare function pango_font_description_get_variations(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function pango_font_description_get_weight(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoWeight;

declare function pango_font_description_hash(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_description_merge(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc_to_merge: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, replace_existing: number): void;

declare function pango_font_description_merge_static(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc_to_merge: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, replace_existing: number): void;

declare function pango_font_description_new(): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_description_set_absolute_size(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

declare function pango_font_description_set_family(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, family: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_description_set_family_static(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, family: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_description_set_gravity(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, gravity: PangoGravity): void;

declare function pango_font_description_set_size(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

declare function pango_font_description_set_stretch(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stretch: PangoStretch): void;

declare function pango_font_description_set_style(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, style: PangoStyle): void;

declare function pango_font_description_set_variant(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, variant: PangoVariant): void;

declare function pango_font_description_set_variations(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, variations: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_description_set_variations_static(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, variations: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_description_set_weight(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, weight: PangoWeight): void;

declare function pango_font_description_to_filename(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_description_to_string(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_description_unset_fields(desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, to_unset: PangoFontMask): void;

declare function pango_font_descriptions_free(descs: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, n_descs: number): void;

declare function pango_font_deserialize(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, bytes: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFont> | null;

declare function pango_font_face_describe(face: interop.Pointer | interop.Reference<_PangoFontFace> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_face_get_face_name(face: interop.Pointer | interop.Reference<_PangoFontFace> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function pango_font_face_get_family(face: interop.Pointer | interop.Reference<_PangoFontFace> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontFamily> | null;

declare function pango_font_face_get_type(): number;

declare function pango_font_face_is_synthesized(face: interop.Pointer | interop.Reference<_PangoFontFace> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_face_list_sizes(face: interop.Pointer | interop.Reference<_PangoFontFace> | ArrayBufferLike | ArrayBufferView | null, sizes: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, n_sizes: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_family_get_face(family: interop.Pointer | interop.Reference<_PangoFontFamily> | ArrayBufferLike | ArrayBufferView | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontFace> | null;

declare function pango_font_family_get_name(family: interop.Pointer | interop.Reference<_PangoFontFamily> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function pango_font_family_get_type(): number;

declare function pango_font_family_is_monospace(family: interop.Pointer | interop.Reference<_PangoFontFamily> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_family_is_variable(family: interop.Pointer | interop.Reference<_PangoFontFamily> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_family_list_faces(family: interop.Pointer | interop.Reference<_PangoFontFamily> | ArrayBufferLike | ArrayBufferView | null, faces: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_PangoFontFace> | null> | null> | ArrayBufferLike | ArrayBufferView | null, n_faces: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_find_shaper(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ch: number): interop.Pointer | interop.Reference<_PangoEngineShape> | null;

declare function pango_font_get_coverage(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_get_face(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontFace> | null;

declare function pango_font_get_features(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, features: interop.Pointer | interop.Reference<hb_feature_t> | ArrayBufferLike | ArrayBufferView | null, len: number, num_features: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_get_font_map(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontMap> | null;

declare function pango_font_get_glyph_extents(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, glyph: number, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_get_hb_font(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_get_languages(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

declare function pango_font_get_metrics(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontMetrics> | null;

declare function pango_font_get_type(): number;

declare function pango_font_has_char(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, wc: number): number;

declare function pango_font_map_changed(fontmap: interop.Pointer | interop.Reference<_PangoFontMap> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_map_create_context(fontmap: interop.Pointer | interop.Reference<_PangoFontMap> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_font_map_get_family(fontmap: interop.Pointer | interop.Reference<_PangoFontMap> | ArrayBufferLike | ArrayBufferView | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontFamily> | null;

declare function pango_font_map_get_serial(fontmap: interop.Pointer | interop.Reference<_PangoFontMap> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_map_get_type(): number;

declare function pango_font_map_list_families(fontmap: interop.Pointer | interop.Reference<_PangoFontMap> | ArrayBufferLike | ArrayBufferView | null, families: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_PangoFontFamily> | null> | null> | ArrayBufferLike | ArrayBufferView | null, n_families: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_map_load_font(fontmap: interop.Pointer | interop.Reference<_PangoFontMap> | ArrayBufferLike | ArrayBufferView | null, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFont> | null;

declare function pango_font_map_load_fontset(fontmap: interop.Pointer | interop.Reference<_PangoFontMap> | ArrayBufferLike | ArrayBufferView | null, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontset> | null;

declare function pango_font_mask_get_type(): number;

declare function pango_font_metrics_get_approximate_char_width(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_metrics_get_approximate_digit_width(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_metrics_get_ascent(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_metrics_get_descent(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_metrics_get_height(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_metrics_get_strikethrough_position(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_metrics_get_strikethrough_thickness(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_metrics_get_type(): number;

declare function pango_font_metrics_get_underline_position(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_metrics_get_underline_thickness(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_font_metrics_ref(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontMetrics> | null;

declare function pango_font_metrics_unref(metrics: interop.Pointer | interop.Reference<_PangoFontMetrics> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_font_scale_get_type(): number;

declare function pango_font_serialize(font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_fontset_foreach(fontset: interop.Pointer | interop.Reference<_PangoFontset> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_PangoFontset> | null, p2: interop.Pointer | interop.Reference<_PangoFont> | null, p3: interop.Pointer | interop.Reference<any> | null) => number>, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_fontset_get_font(fontset: interop.Pointer | interop.Reference<_PangoFontset> | ArrayBufferLike | ArrayBufferView | null, wc: number): interop.Pointer | interop.Reference<_PangoFont> | null;

declare function pango_fontset_get_metrics(fontset: interop.Pointer | interop.Reference<_PangoFontset> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoFontMetrics> | null;

declare function pango_fontset_get_type(): number;

declare function pango_fontset_simple_append(fontset: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_fontset_simple_get_type(): number;

declare function pango_fontset_simple_new(language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_fontset_simple_size(fontset: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_get_log_attrs(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, level: number, language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attrs: interop.Pointer | interop.Reference<_PangoLogAttr> | ArrayBufferLike | ArrayBufferView | null, attrs_len: number): void;

declare function pango_get_mirror_char(ch: number, mirrored_ch: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_glyph_item_apply_attrs(glyph_item: interop.Pointer | interop.Reference<_PangoGlyphItem> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, list: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_GSList> | null;

declare function pango_glyph_item_copy(orig: interop.Pointer | interop.Reference<_PangoGlyphItem> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoGlyphItem> | null;

declare function pango_glyph_item_free(glyph_item: interop.Pointer | interop.Reference<_PangoGlyphItem> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_glyph_item_get_logical_widths(glyph_item: interop.Pointer | interop.Reference<_PangoGlyphItem> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, logical_widths: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_glyph_item_get_type(): number;

declare function pango_glyph_item_iter_copy(orig: interop.Pointer | interop.Reference<_PangoGlyphItemIter> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoGlyphItemIter> | null;

declare function pango_glyph_item_iter_free(iter: interop.Pointer | interop.Reference<_PangoGlyphItemIter> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_glyph_item_iter_get_type(): number;

declare function pango_glyph_item_iter_init_end(iter: interop.Pointer | interop.Reference<_PangoGlyphItemIter> | ArrayBufferLike | ArrayBufferView | null, glyph_item: interop.Pointer | interop.Reference<_PangoGlyphItem> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_glyph_item_iter_init_start(iter: interop.Pointer | interop.Reference<_PangoGlyphItemIter> | ArrayBufferLike | ArrayBufferView | null, glyph_item: interop.Pointer | interop.Reference<_PangoGlyphItem> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_glyph_item_iter_next_cluster(iter: interop.Pointer | interop.Reference<_PangoGlyphItemIter> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_glyph_item_iter_prev_cluster(iter: interop.Pointer | interop.Reference<_PangoGlyphItemIter> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_glyph_item_letter_space(glyph_item: interop.Pointer | interop.Reference<_PangoGlyphItem> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, log_attrs: interop.Pointer | interop.Reference<_PangoLogAttr> | ArrayBufferLike | ArrayBufferView | null, letter_spacing: number): void;

declare function pango_glyph_item_split(orig: interop.Pointer | interop.Reference<_PangoGlyphItem> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, split_index: number): interop.Pointer | interop.Reference<_PangoGlyphItem> | null;

declare function pango_glyph_string_copy(string: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoGlyphString> | null;

declare function pango_glyph_string_extents(glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null, font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_glyph_string_extents_range(glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null, start: number, end: number, font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_glyph_string_free(string: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_glyph_string_get_logical_widths(glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, embedding_level: number, logical_widths: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_glyph_string_get_type(): number;

declare function pango_glyph_string_get_width(glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_glyph_string_index_to_x(glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, analysis: interop.Pointer | interop.Reference<_PangoAnalysis> | ArrayBufferLike | ArrayBufferView | null, index_: number, trailing: number, x_pos: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_glyph_string_index_to_x_full(glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, analysis: interop.Pointer | interop.Reference<_PangoAnalysis> | ArrayBufferLike | ArrayBufferView | null, attrs: interop.Pointer | interop.Reference<_PangoLogAttr> | ArrayBufferLike | ArrayBufferView | null, index_: number, trailing: number, x_pos: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_glyph_string_new(): interop.Pointer | interop.Reference<_PangoGlyphString> | null;

declare function pango_glyph_string_set_size(string: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null, new_len: number): void;

declare function pango_glyph_string_x_to_index(glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, analysis: interop.Pointer | interop.Reference<_PangoAnalysis> | ArrayBufferLike | ArrayBufferView | null, x_pos: number, index_: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, trailing: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_gravity_get_for_matrix(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null): PangoGravity;

declare function pango_gravity_get_for_script(script: PangoScript, base_gravity: PangoGravity, hint: PangoGravityHint): PangoGravity;

declare function pango_gravity_get_for_script_and_width(script: PangoScript, wide: number, base_gravity: PangoGravity, hint: PangoGravityHint): PangoGravity;

declare function pango_gravity_get_type(): number;

declare function pango_gravity_hint_get_type(): number;

declare function pango_gravity_to_rotation(gravity: PangoGravity): number;

declare function pango_is_zero_width(ch: number): number;

declare function pango_item_apply_attrs(item: interop.Pointer | interop.Reference<_PangoItem> | ArrayBufferLike | ArrayBufferView | null, iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_item_copy(item: interop.Pointer | interop.Reference<_PangoItem> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoItem> | null;

declare function pango_item_free(item: interop.Pointer | interop.Reference<_PangoItem> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_item_get_type(): number;

declare function pango_item_new(): interop.Pointer | interop.Reference<_PangoItem> | null;

declare function pango_item_split(orig: interop.Pointer | interop.Reference<_PangoItem> | ArrayBufferLike | ArrayBufferView | null, split_index: number, split_offset: number): interop.Pointer | interop.Reference<_PangoItem> | null;

declare function pango_itemize(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start_index: number, length: number, attrs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, cached_iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_GList> | null;

declare function pango_itemize_with_base_dir(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, base_dir: PangoDirection, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start_index: number, length: number, attrs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, cached_iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_GList> | null;

declare function pango_language_from_string(language: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_language_get_default(): interop.Pointer | interop.Reference<any> | null;

declare function pango_language_get_preferred(): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

declare function pango_language_get_sample_string(language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function pango_language_get_scripts(language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, num_scripts: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<PangoScript> | null;

declare function pango_language_get_type(): number;

declare function pango_language_includes_script(language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, script: PangoScript): number;

declare function pango_language_matches(language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, range_list: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_language_to_string(language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function pango_layout_context_changed(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_copy(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_deserialize(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, bytes: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: PangoLayoutDeserializeFlags, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_deserialize_error_get_type(): number;

declare function pango_layout_deserialize_error_quark(): number;

declare function pango_layout_deserialize_flags_get_type(): number;

declare function pango_layout_get_alignment(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoAlignment;

declare function pango_layout_get_attributes(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_get_auto_dir(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_baseline(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_caret_pos(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index_: number, strong_pos: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, weak_pos: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_get_character_count(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_context(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_get_cursor_pos(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index_: number, strong_pos: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, weak_pos: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_get_direction(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index: number): PangoDirection;

declare function pango_layout_get_ellipsize(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoEllipsizeMode;

declare function pango_layout_get_extents(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_get_font_description(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_get_height(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_indent(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_iter(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_get_justify(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_justify_last_line(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_line(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, line: number): interop.Pointer | interop.Reference<_PangoLayoutLine> | null;

declare function pango_layout_get_line_count(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_line_readonly(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, line: number): interop.Pointer | interop.Reference<_PangoLayoutLine> | null;

declare function pango_layout_get_line_spacing(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_lines(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_GSList> | null;

declare function pango_layout_get_lines_readonly(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_GSList> | null;

declare function pango_layout_get_log_attrs(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attrs: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_PangoLogAttr> | null> | ArrayBufferLike | ArrayBufferView | null, n_attrs: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_get_log_attrs_readonly(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, n_attrs: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoLogAttr> | null;

declare function pango_layout_get_pixel_extents(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_get_pixel_size(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, width: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, height: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_get_serial(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_single_paragraph_mode(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_size(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, width: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, height: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_get_spacing(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_tabs(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_get_text(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function pango_layout_get_type(): number;

declare function pango_layout_get_unknown_glyphs_count(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_width(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_get_wrap(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): PangoWrapMode;

declare function pango_layout_index_to_line_x(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index_: number, trailing: number, line: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, x_pos: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_index_to_pos(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index_: number, pos: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_is_ellipsized(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_is_wrapped(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_iter_at_last_line(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_iter_copy(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_iter_free(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_iter_get_baseline(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_iter_get_char_extents(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_iter_get_cluster_extents(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_iter_get_index(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_iter_get_layout(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_iter_get_layout_extents(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_iter_get_line(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoLayoutLine> | null;

declare function pango_layout_iter_get_line_extents(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_iter_get_line_readonly(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoLayoutLine> | null;

declare function pango_layout_iter_get_line_yrange(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, y0_: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y1_: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_iter_get_run(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoGlyphItem> | null;

declare function pango_layout_iter_get_run_baseline(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_iter_get_run_extents(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_iter_get_run_readonly(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoGlyphItem> | null;

declare function pango_layout_iter_get_type(): number;

declare function pango_layout_iter_next_char(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_iter_next_cluster(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_iter_next_line(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_iter_next_run(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_line_get_extents(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_line_get_height(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null, height: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_line_get_length(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_line_get_pixel_extents(layout_line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null, ink_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null, logical_rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_line_get_resolved_direction(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null): PangoDirection;

declare function pango_layout_line_get_start_index(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_line_get_type(): number;

declare function pango_layout_line_get_x_ranges(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null, start_index: number, end_index: number, ranges: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null, n_ranges: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_line_index_to_x(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null, index_: number, trailing: number, x_pos: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_line_is_paragraph_start(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_line_ref(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoLayoutLine> | null;

declare function pango_layout_line_unref(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_line_x_to_index(line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null, x_pos: number, index_: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, trailing: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_move_cursor_visually(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, strong: number, old_index: number, old_trailing: number, direction: number, new_index: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, new_trailing: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_new(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_serialize(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: PangoLayoutSerializeFlags): interop.Pointer | interop.Reference<any> | null;

declare function pango_layout_serialize_flags_get_type(): number;

declare function pango_layout_set_alignment(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, alignment: PangoAlignment): void;

declare function pango_layout_set_attributes(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attrs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_set_auto_dir(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, auto_dir: number): void;

declare function pango_layout_set_ellipsize(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ellipsize: PangoEllipsizeMode): void;

declare function pango_layout_set_font_description(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, desc: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_set_height(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, height: number): void;

declare function pango_layout_set_indent(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, indent: number): void;

declare function pango_layout_set_justify(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, justify: number): void;

declare function pango_layout_set_justify_last_line(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, justify: number): void;

declare function pango_layout_set_line_spacing(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, factor: number): void;

declare function pango_layout_set_markup(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, markup: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number): void;

declare function pango_layout_set_markup_with_accel(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, markup: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, accel_marker: number, accel_char: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_set_single_paragraph_mode(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, setting: number): void;

declare function pango_layout_set_spacing(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, spacing: number): void;

declare function pango_layout_set_tabs(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tabs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_layout_set_text(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number): void;

declare function pango_layout_set_width(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, width: number): void;

declare function pango_layout_set_wrap(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, wrap: PangoWrapMode): void;

declare function pango_layout_write_to_file(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: PangoLayoutSerializeFlags, filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_layout_xy_to_index(layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, index_: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, trailing: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_log2vis_get_embedding_levels(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, pbase_dir: interop.Pointer | interop.Reference<PangoDirection> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_markup_parser_finish(context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attr_list: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, text: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, accel_char: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_markup_parser_new(accel_marker: number): interop.Pointer | interop.Reference<any> | null;

declare function pango_matrix_concat(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null, new_matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_matrix_copy(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoMatrix> | null;

declare function pango_matrix_free(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_matrix_get_font_scale_factor(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_matrix_get_font_scale_factors(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null, xscale: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, yscale: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_matrix_get_slant_ratio(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_matrix_get_type(): number;

declare function pango_matrix_rotate(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null, degrees: number): void;

declare function pango_matrix_scale(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null, scale_x: number, scale_y: number): void;

declare function pango_matrix_transform_distance(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null, dx: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, dy: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_matrix_transform_pixel_rectangle(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null, rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_matrix_transform_point(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_matrix_transform_rectangle(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null, rect: interop.Pointer | interop.Reference<_PangoRectangle> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_matrix_translate(matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null, tx: number, ty: number): void;

declare function pango_overline_get_type(): number;

declare function pango_parse_enum(type: number, str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, warn: number, possible_values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_parse_markup(markup_text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, accel_marker: number, attr_list: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, text: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, accel_char: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_parse_stretch(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stretch: interop.Pointer | interop.Reference<PangoStretch> | ArrayBufferLike | ArrayBufferView | null, warn: number): number;

declare function pango_parse_style(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, style: interop.Pointer | interop.Reference<PangoStyle> | ArrayBufferLike | ArrayBufferView | null, warn: number): number;

declare function pango_parse_variant(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, variant: interop.Pointer | interop.Reference<PangoVariant> | ArrayBufferLike | ArrayBufferView | null, warn: number): number;

declare function pango_parse_weight(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, weight: interop.Pointer | interop.Reference<PangoWeight> | ArrayBufferLike | ArrayBufferView | null, warn: number): number;

declare function pango_quantize_line_geometry(thickness: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, position: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_read_line(stream: interop.Pointer | interop.Reference<_IO_FILE> | ArrayBufferLike | ArrayBufferView | null, str: interop.Pointer | interop.Reference<_GString> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_render_part_get_type(): number;

declare function pango_renderer_activate(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_renderer_deactivate(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_renderer_draw_error_underline(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, width: number, height: number): void;

declare function pango_renderer_draw_glyph(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, glyph: number, x: number, y: number): void;

declare function pango_renderer_draw_glyph_item(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph_item: interop.Pointer | interop.Reference<_PangoGlyphItem> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): void;

declare function pango_renderer_draw_glyphs(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, font: interop.Pointer | interop.Reference<_PangoFont> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): void;

declare function pango_renderer_draw_layout(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, layout: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): void;

declare function pango_renderer_draw_layout_line(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, line: interop.Pointer | interop.Reference<_PangoLayoutLine> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): void;

declare function pango_renderer_draw_rectangle(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, part: PangoRenderPart, x: number, y: number, width: number, height: number): void;

declare function pango_renderer_draw_trapezoid(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, part: PangoRenderPart, y1_: number, x11: number, x21: number, y2: number, x12: number, x22: number): void;

declare function pango_renderer_get_alpha(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, part: PangoRenderPart): number;

declare function pango_renderer_get_color(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, part: PangoRenderPart): interop.Pointer | interop.Reference<_PangoColor> | null;

declare function pango_renderer_get_layout(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_renderer_get_layout_line(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoLayoutLine> | null;

declare function pango_renderer_get_matrix(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoMatrix> | null;

declare function pango_renderer_get_type(): number;

declare function pango_renderer_part_changed(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, part: PangoRenderPart): void;

declare function pango_renderer_set_alpha(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, part: PangoRenderPart, alpha: number): void;

declare function pango_renderer_set_color(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, part: PangoRenderPart, color: interop.Pointer | interop.Reference<_PangoColor> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_renderer_set_matrix(renderer: interop.Pointer | interop.Reference<_PangoRenderer> | ArrayBufferLike | ArrayBufferView | null, matrix: interop.Pointer | interop.Reference<_PangoMatrix> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_reorder_items(items: interop.Pointer | interop.Reference<_GList> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_GList> | null;

declare function pango_scan_int(pos: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null, out: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_scan_string(pos: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null, out: interop.Pointer | interop.Reference<_GString> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_scan_word(pos: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null, out: interop.Pointer | interop.Reference<_GString> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_script_for_unichar(ch: number): PangoScript;

declare function pango_script_get_sample_language(script: PangoScript): interop.Pointer | interop.Reference<any> | null;

declare function pango_script_get_type(): number;

declare function pango_script_iter_free(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_script_iter_get_range(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null, end: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null, script: interop.Pointer | interop.Reference<PangoScript> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_script_iter_get_type(): number;

declare function pango_script_iter_new(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number): interop.Pointer | interop.Reference<any> | null;

declare function pango_script_iter_next(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_shape(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, analysis: interop.Pointer | interop.Reference<_PangoAnalysis> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_shape_flags_get_type(): number;

declare function pango_shape_full(item_text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, item_length: number, paragraph_text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, paragraph_length: number, analysis: interop.Pointer | interop.Reference<_PangoAnalysis> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_shape_item(item: interop.Pointer | interop.Reference<_PangoItem> | ArrayBufferLike | ArrayBufferView | null, paragraph_text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, paragraph_length: number, log_attrs: interop.Pointer | interop.Reference<_PangoLogAttr> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null, flags: PangoShapeFlags): void;

declare function pango_shape_with_flags(item_text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, item_length: number, paragraph_text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, paragraph_length: number, analysis: interop.Pointer | interop.Reference<_PangoAnalysis> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<_PangoGlyphString> | ArrayBufferLike | ArrayBufferView | null, flags: PangoShapeFlags): void;

declare function pango_show_flags_get_type(): number;

declare function pango_skip_space(pos: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_split_file_list(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

declare function pango_stretch_get_type(): number;

declare function pango_style_get_type(): number;

declare function pango_tab_align_get_type(): number;

declare function pango_tab_array_copy(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_tab_array_free(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_tab_array_from_string(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_tab_array_get_decimal_point(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tab_index: number): number;

declare function pango_tab_array_get_positions_in_pixels(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_tab_array_get_size(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function pango_tab_array_get_tab(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tab_index: number, alignment: interop.Pointer | interop.Reference<PangoTabAlign> | ArrayBufferLike | ArrayBufferView | null, location: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_tab_array_get_tabs(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, alignments: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<PangoTabAlign> | null> | ArrayBufferLike | ArrayBufferView | null, locations: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number> | null> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_tab_array_get_type(): number;

declare function pango_tab_array_new(initial_size: number, positions_in_pixels: number): interop.Pointer | interop.Reference<any> | null;

declare function pango_tab_array_new_with_positions(size: number, positions_in_pixels: number, first_alignment: PangoTabAlign, first_position: number, ...args: any[]): interop.Pointer | interop.Reference<any> | null;

declare function pango_tab_array_resize(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, new_size: number): void;

declare function pango_tab_array_set_decimal_point(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tab_index: number, decimal_point: number): void;

declare function pango_tab_array_set_positions_in_pixels(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, positions_in_pixels: number): void;

declare function pango_tab_array_set_tab(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tab_index: number, alignment: PangoTabAlign, location: number): void;

declare function pango_tab_array_sort(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function pango_tab_array_to_string(tab_array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_tailor_break(text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, analysis: interop.Pointer | interop.Reference<_PangoAnalysis> | ArrayBufferLike | ArrayBufferView | null, offset: number, attrs: interop.Pointer | interop.Reference<_PangoLogAttr> | ArrayBufferLike | ArrayBufferView | null, attrs_len: number): void;

declare function pango_text_transform_get_type(): number;

declare function pango_trim_string(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function pango_underline_get_type(): number;

declare function pango_unichar_direction(ch: number): PangoDirection;

declare function pango_units_from_double(d: number): number;

declare function pango_units_to_double(i: number): number;

declare function pango_variant_get_type(): number;

declare function pango_version(): number;

declare function pango_version_check(required_major: number, required_minor: number, required_micro: number): string | null;

declare function pango_version_string(): string | null;

declare function pango_weight_get_type(): number;

declare function pango_wrap_mode_get_type(): number;

declare function script_engine_create(id: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_PangoEngine> | null;

declare function script_engine_exit(): void;

declare function script_engine_init(module: interop.Pointer | interop.Reference<_GTypeModule> | ArrayBufferLike | ArrayBufferView | null): void;

declare function script_engine_list(engines: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_PangoEngineInfo> | null> | ArrayBufferLike | ArrayBufferView | null, n_engines: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;
