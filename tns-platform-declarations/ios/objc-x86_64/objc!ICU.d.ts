
declare const enum UBidiPairedBracketType {

	U_BPT_NONE = 0,

	U_BPT_OPEN = 1,

	U_BPT_CLOSE = 2,

	U_BPT_COUNT = 3
}

declare const enum UBlockCode {

	LOCK_NO_BLOCK = 0,

	LOCK_BASIC_LATIN = 1,

	LOCK_LATIN_1_SUPPLEMENT = 2,

	LOCK_LATIN_EXTENDED_A = 3,

	LOCK_LATIN_EXTENDED_B = 4,

	LOCK_IPA_EXTENSIONS = 5,

	LOCK_SPACING_MODIFIER_LETTERS = 6,

	LOCK_COMBINING_DIACRITICAL_MARKS = 7,

	LOCK_GREEK = 8,

	LOCK_CYRILLIC = 9,

	LOCK_ARMENIAN = 10,

	LOCK_HEBREW = 11,

	LOCK_ARABIC = 12,

	LOCK_SYRIAC = 13,

	LOCK_THAANA = 14,

	LOCK_DEVANAGARI = 15,

	LOCK_BENGALI = 16,

	LOCK_GURMUKHI = 17,

	LOCK_GUJARATI = 18,

	LOCK_ORIYA = 19,

	LOCK_TAMIL = 20,

	LOCK_TELUGU = 21,

	LOCK_KANNADA = 22,

	LOCK_MALAYALAM = 23,

	LOCK_SINHALA = 24,

	LOCK_THAI = 25,

	LOCK_LAO = 26,

	LOCK_TIBETAN = 27,

	LOCK_MYANMAR = 28,

	LOCK_GEORGIAN = 29,

	LOCK_HANGUL_JAMO = 30,

	LOCK_ETHIOPIC = 31,

	LOCK_CHEROKEE = 32,

	LOCK_UNIFIED_CANADIAN_ABORIGINAL_SYLLABICS = 33,

	LOCK_OGHAM = 34,

	LOCK_RUNIC = 35,

	LOCK_KHMER = 36,

	LOCK_MONGOLIAN = 37,

	LOCK_LATIN_EXTENDED_ADDITIONAL = 38,

	LOCK_GREEK_EXTENDED = 39,

	LOCK_GENERAL_PUNCTUATION = 40,

	LOCK_SUPERSCRIPTS_AND_SUBSCRIPTS = 41,

	LOCK_CURRENCY_SYMBOLS = 42,

	LOCK_COMBINING_MARKS_FOR_SYMBOLS = 43,

	LOCK_LETTERLIKE_SYMBOLS = 44,

	LOCK_NUMBER_FORMS = 45,

	LOCK_ARROWS = 46,

	LOCK_MATHEMATICAL_OPERATORS = 47,

	LOCK_MISCELLANEOUS_TECHNICAL = 48,

	LOCK_CONTROL_PICTURES = 49,

	LOCK_OPTICAL_CHARACTER_RECOGNITION = 50,

	LOCK_ENCLOSED_ALPHANUMERICS = 51,

	LOCK_BOX_DRAWING = 52,

	LOCK_BLOCK_ELEMENTS = 53,

	LOCK_GEOMETRIC_SHAPES = 54,

	LOCK_MISCELLANEOUS_SYMBOLS = 55,

	LOCK_DINGBATS = 56,

	LOCK_BRAILLE_PATTERNS = 57,

	LOCK_CJK_RADICALS_SUPPLEMENT = 58,

	LOCK_KANGXI_RADICALS = 59,

	LOCK_IDEOGRAPHIC_DESCRIPTION_CHARACTERS = 60,

	LOCK_CJK_SYMBOLS_AND_PUNCTUATION = 61,

	LOCK_HIRAGANA = 62,

	LOCK_KATAKANA = 63,

	LOCK_BOPOMOFO = 64,

	LOCK_HANGUL_COMPATIBILITY_JAMO = 65,

	LOCK_KANBUN = 66,

	LOCK_BOPOMOFO_EXTENDED = 67,

	LOCK_ENCLOSED_CJK_LETTERS_AND_MONTHS = 68,

	LOCK_CJK_COMPATIBILITY = 69,

	LOCK_CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A = 70,

	LOCK_CJK_UNIFIED_IDEOGRAPHS = 71,

	LOCK_YI_SYLLABLES = 72,

	LOCK_YI_RADICALS = 73,

	LOCK_HANGUL_SYLLABLES = 74,

	LOCK_HIGH_SURROGATES = 75,

	LOCK_HIGH_PRIVATE_USE_SURROGATES = 76,

	LOCK_LOW_SURROGATES = 77,

	LOCK_PRIVATE_USE_AREA = 78,

	LOCK_PRIVATE_USE = 78,

	LOCK_CJK_COMPATIBILITY_IDEOGRAPHS = 79,

	LOCK_ALPHABETIC_PRESENTATION_FORMS = 80,

	LOCK_ARABIC_PRESENTATION_FORMS_A = 81,

	LOCK_COMBINING_HALF_MARKS = 82,

	LOCK_CJK_COMPATIBILITY_FORMS = 83,

	LOCK_SMALL_FORM_VARIANTS = 84,

	LOCK_ARABIC_PRESENTATION_FORMS_B = 85,

	LOCK_SPECIALS = 86,

	LOCK_HALFWIDTH_AND_FULLWIDTH_FORMS = 87,

	LOCK_OLD_ITALIC = 88,

	LOCK_GOTHIC = 89,

	LOCK_DESERET = 90,

	LOCK_BYZANTINE_MUSICAL_SYMBOLS = 91,

	LOCK_MUSICAL_SYMBOLS = 92,

	LOCK_MATHEMATICAL_ALPHANUMERIC_SYMBOLS = 93,

	LOCK_CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B = 94,

	LOCK_CJK_COMPATIBILITY_IDEOGRAPHS_SUPPLEMENT = 95,

	LOCK_TAGS = 96,

	LOCK_CYRILLIC_SUPPLEMENT = 97,

	LOCK_CYRILLIC_SUPPLEMENTARY = 97,

	LOCK_TAGALOG = 98,

	LOCK_HANUNOO = 99,

	LOCK_BUHID = 100,

	LOCK_TAGBANWA = 101,

	LOCK_MISCELLANEOUS_MATHEMATICAL_SYMBOLS_A = 102,

	LOCK_SUPPLEMENTAL_ARROWS_A = 103,

	LOCK_SUPPLEMENTAL_ARROWS_B = 104,

	LOCK_MISCELLANEOUS_MATHEMATICAL_SYMBOLS_B = 105,

	LOCK_SUPPLEMENTAL_MATHEMATICAL_OPERATORS = 106,

	LOCK_KATAKANA_PHONETIC_EXTENSIONS = 107,

	LOCK_VARIATION_SELECTORS = 108,

	LOCK_SUPPLEMENTARY_PRIVATE_USE_AREA_A = 109,

	LOCK_SUPPLEMENTARY_PRIVATE_USE_AREA_B = 110,

	LOCK_LIMBU = 111,

	LOCK_TAI_LE = 112,

	LOCK_KHMER_SYMBOLS = 113,

	LOCK_PHONETIC_EXTENSIONS = 114,

	LOCK_MISCELLANEOUS_SYMBOLS_AND_ARROWS = 115,

	LOCK_YIJING_HEXAGRAM_SYMBOLS = 116,

	LOCK_LINEAR_B_SYLLABARY = 117,

	LOCK_LINEAR_B_IDEOGRAMS = 118,

	LOCK_AEGEAN_NUMBERS = 119,

	LOCK_UGARITIC = 120,

	LOCK_SHAVIAN = 121,

	LOCK_OSMANYA = 122,

	LOCK_CYPRIOT_SYLLABARY = 123,

	LOCK_TAI_XUAN_JING_SYMBOLS = 124,

	LOCK_VARIATION_SELECTORS_SUPPLEMENT = 125,

	LOCK_ANCIENT_GREEK_MUSICAL_NOTATION = 126,

	LOCK_ANCIENT_GREEK_NUMBERS = 127,

	LOCK_ARABIC_SUPPLEMENT = 128,

	LOCK_BUGINESE = 129,

	LOCK_CJK_STROKES = 130,

	LOCK_COMBINING_DIACRITICAL_MARKS_SUPPLEMENT = 131,

	LOCK_COPTIC = 132,

	LOCK_ETHIOPIC_EXTENDED = 133,

	LOCK_ETHIOPIC_SUPPLEMENT = 134,

	LOCK_GEORGIAN_SUPPLEMENT = 135,

	LOCK_GLAGOLITIC = 136,

	LOCK_KHAROSHTHI = 137,

	LOCK_MODIFIER_TONE_LETTERS = 138,

	LOCK_NEW_TAI_LUE = 139,

	LOCK_OLD_PERSIAN = 140,

	LOCK_PHONETIC_EXTENSIONS_SUPPLEMENT = 141,

	LOCK_SUPPLEMENTAL_PUNCTUATION = 142,

	LOCK_SYLOTI_NAGRI = 143,

	LOCK_TIFINAGH = 144,

	LOCK_VERTICAL_FORMS = 145,

	LOCK_NKO = 146,

	LOCK_BALINESE = 147,

	LOCK_LATIN_EXTENDED_C = 148,

	LOCK_LATIN_EXTENDED_D = 149,

	LOCK_PHAGS_PA = 150,

	LOCK_PHOENICIAN = 151,

	LOCK_CUNEIFORM = 152,

	LOCK_CUNEIFORM_NUMBERS_AND_PUNCTUATION = 153,

	LOCK_COUNTING_ROD_NUMERALS = 154,

	LOCK_SUNDANESE = 155,

	LOCK_LEPCHA = 156,

	LOCK_OL_CHIKI = 157,

	LOCK_CYRILLIC_EXTENDED_A = 158,

	LOCK_VAI = 159,

	LOCK_CYRILLIC_EXTENDED_B = 160,

	LOCK_SAURASHTRA = 161,

	LOCK_KAYAH_LI = 162,

	LOCK_REJANG = 163,

	LOCK_CHAM = 164,

	LOCK_ANCIENT_SYMBOLS = 165,

	LOCK_PHAISTOS_DISC = 166,

	LOCK_LYCIAN = 167,

	LOCK_CARIAN = 168,

	LOCK_LYDIAN = 169,

	LOCK_MAHJONG_TILES = 170,

	LOCK_DOMINO_TILES = 171,

	LOCK_SAMARITAN = 172,

	LOCK_UNIFIED_CANADIAN_ABORIGINAL_SYLLABICS_EXTENDED = 173,

	LOCK_TAI_THAM = 174,

	LOCK_VEDIC_EXTENSIONS = 175,

	LOCK_LISU = 176,

	LOCK_BAMUM = 177,

	LOCK_COMMON_INDIC_NUMBER_FORMS = 178,

	LOCK_DEVANAGARI_EXTENDED = 179,

	LOCK_HANGUL_JAMO_EXTENDED_A = 180,

	LOCK_JAVANESE = 181,

	LOCK_MYANMAR_EXTENDED_A = 182,

	LOCK_TAI_VIET = 183,

	LOCK_MEETEI_MAYEK = 184,

	LOCK_HANGUL_JAMO_EXTENDED_B = 185,

	LOCK_IMPERIAL_ARAMAIC = 186,

	LOCK_OLD_SOUTH_ARABIAN = 187,

	LOCK_AVESTAN = 188,

	LOCK_INSCRIPTIONAL_PARTHIAN = 189,

	LOCK_INSCRIPTIONAL_PAHLAVI = 190,

	LOCK_OLD_TURKIC = 191,

	LOCK_RUMI_NUMERAL_SYMBOLS = 192,

	LOCK_KAITHI = 193,

	LOCK_EGYPTIAN_HIEROGLYPHS = 194,

	LOCK_ENCLOSED_ALPHANUMERIC_SUPPLEMENT = 195,

	LOCK_ENCLOSED_IDEOGRAPHIC_SUPPLEMENT = 196,

	LOCK_CJK_UNIFIED_IDEOGRAPHS_EXTENSION_C = 197,

	LOCK_MANDAIC = 198,

	LOCK_BATAK = 199,

	LOCK_ETHIOPIC_EXTENDED_A = 200,

	LOCK_BRAHMI = 201,

	LOCK_BAMUM_SUPPLEMENT = 202,

	LOCK_KANA_SUPPLEMENT = 203,

	LOCK_PLAYING_CARDS = 204,

	LOCK_MISCELLANEOUS_SYMBOLS_AND_PICTOGRAPHS = 205,

	LOCK_EMOTICONS = 206,

	LOCK_TRANSPORT_AND_MAP_SYMBOLS = 207,

	LOCK_ALCHEMICAL_SYMBOLS = 208,

	LOCK_CJK_UNIFIED_IDEOGRAPHS_EXTENSION_D = 209,

	LOCK_ARABIC_EXTENDED_A = 210,

	LOCK_ARABIC_MATHEMATICAL_ALPHABETIC_SYMBOLS = 211,

	LOCK_CHAKMA = 212,

	LOCK_MEETEI_MAYEK_EXTENSIONS = 213,

	LOCK_MEROITIC_CURSIVE = 214,

	LOCK_MEROITIC_HIEROGLYPHS = 215,

	LOCK_MIAO = 216,

	LOCK_SHARADA = 217,

	LOCK_SORA_SOMPENG = 218,

	LOCK_SUNDANESE_SUPPLEMENT = 219,

	LOCK_TAKRI = 220,

	LOCK_BASSA_VAH = 221,

	LOCK_CAUCASIAN_ALBANIAN = 222,

	LOCK_COPTIC_EPACT_NUMBERS = 223,

	LOCK_COMBINING_DIACRITICAL_MARKS_EXTENDED = 224,

	LOCK_DUPLOYAN = 225,

	LOCK_ELBASAN = 226,

	LOCK_GEOMETRIC_SHAPES_EXTENDED = 227,

	LOCK_GRANTHA = 228,

	LOCK_KHOJKI = 229,

	LOCK_KHUDAWADI = 230,

	LOCK_LATIN_EXTENDED_E = 231,

	LOCK_LINEAR_A = 232,

	LOCK_MAHAJANI = 233,

	LOCK_MANICHAEAN = 234,

	LOCK_MENDE_KIKAKUI = 235,

	LOCK_MODI = 236,

	LOCK_MRO = 237,

	LOCK_MYANMAR_EXTENDED_B = 238,

	LOCK_NABATAEAN = 239,

	LOCK_OLD_NORTH_ARABIAN = 240,

	LOCK_OLD_PERMIC = 241,

	LOCK_ORNAMENTAL_DINGBATS = 242,

	LOCK_PAHAWH_HMONG = 243,

	LOCK_PALMYRENE = 244,

	LOCK_PAU_CIN_HAU = 245,

	LOCK_PSALTER_PAHLAVI = 246,

	LOCK_SHORTHAND_FORMAT_CONTROLS = 247,

	LOCK_SIDDHAM = 248,

	LOCK_SINHALA_ARCHAIC_NUMBERS = 249,

	LOCK_SUPPLEMENTAL_ARROWS_C = 250,

	LOCK_TIRHUTA = 251,

	LOCK_WARANG_CITI = 252,

	LOCK_AHOM = 253,

	LOCK_ANATOLIAN_HIEROGLYPHS = 254,

	LOCK_CHEROKEE_SUPPLEMENT = 255,

	LOCK_CJK_UNIFIED_IDEOGRAPHS_EXTENSION_E = 256,

	LOCK_EARLY_DYNASTIC_CUNEIFORM = 257,

	LOCK_HATRAN = 258,

	LOCK_MULTANI = 259,

	LOCK_OLD_HUNGARIAN = 260,

	LOCK_SUPPLEMENTAL_SYMBOLS_AND_PICTOGRAPHS = 261,

	LOCK_SUTTON_SIGNWRITING = 262,

	LOCK_ADLAM = 263,

	LOCK_BHAIKSUKI = 264,

	LOCK_CYRILLIC_EXTENDED_C = 265,

	LOCK_GLAGOLITIC_SUPPLEMENT = 266,

	LOCK_IDEOGRAPHIC_SYMBOLS_AND_PUNCTUATION = 267,

	LOCK_MARCHEN = 268,

	LOCK_MONGOLIAN_SUPPLEMENT = 269,

	LOCK_NEWA = 270,

	LOCK_OSAGE = 271,

	LOCK_TANGUT = 272,

	LOCK_TANGUT_COMPONENTS = 273,

	LOCK_CJK_UNIFIED_IDEOGRAPHS_EXTENSION_F = 274,

	LOCK_KANA_EXTENDED_A = 275,

	LOCK_MASARAM_GONDI = 276,

	LOCK_NUSHU = 277,

	LOCK_SOYOMBO = 278,

	LOCK_SYRIAC_SUPPLEMENT = 279,

	LOCK_ZANABAZAR_SQUARE = 280,

	LOCK_CHESS_SYMBOLS = 281,

	LOCK_DOGRA = 282,

	LOCK_GEORGIAN_EXTENDED = 283,

	LOCK_GUNJALA_GONDI = 284,

	LOCK_HANIFI_ROHINGYA = 285,

	LOCK_INDIC_SIYAQ_NUMBERS = 286,

	LOCK_MAKASAR = 287,

	LOCK_MAYAN_NUMERALS = 288,

	LOCK_MEDEFAIDRIN = 289,

	LOCK_OLD_SOGDIAN = 290,

	LOCK_SOGDIAN = 291,

	LOCK_EGYPTIAN_HIEROGLYPH_FORMAT_CONTROLS = 292,

	LOCK_ELYMAIC = 293,

	LOCK_NANDINAGARI = 294,

	LOCK_NYIAKENG_PUACHUE_HMONG = 295,

	LOCK_OTTOMAN_SIYAQ_NUMBERS = 296,

	LOCK_SMALL_KANA_EXTENSION = 297,

	LOCK_SYMBOLS_AND_PICTOGRAPHS_EXTENDED_A = 298,

	LOCK_TAMIL_SUPPLEMENT = 299,

	LOCK_WANCHO = 300,

	LOCK_COUNT = 301,

	LOCK_INVALID_CODE = -1
}

declare const enum UCPMapRangeOption {

	AP_RANGE_NORMAL = 0,

	AP_RANGE_FIXED_LEAD_SURROGATES = 1,

	AP_RANGE_FIXED_ALL_SURROGATES = 2
}

declare const enum UCharCategory {

	U_UNASSIGNED = 0,

	U_GENERAL_OTHER_TYPES = 0,

	U_UPPERCASE_LETTER = 1,

	U_LOWERCASE_LETTER = 2,

	U_TITLECASE_LETTER = 3,

	U_MODIFIER_LETTER = 4,

	U_OTHER_LETTER = 5,

	U_NON_SPACING_MARK = 6,

	U_ENCLOSING_MARK = 7,

	U_COMBINING_SPACING_MARK = 8,

	U_DECIMAL_DIGIT_NUMBER = 9,

	U_LETTER_NUMBER = 10,

	U_OTHER_NUMBER = 11,

	U_SPACE_SEPARATOR = 12,

	U_LINE_SEPARATOR = 13,

	U_PARAGRAPH_SEPARATOR = 14,

	U_CONTROL_CHAR = 15,

	U_FORMAT_CHAR = 16,

	U_PRIVATE_USE_CHAR = 17,

	U_SURROGATE = 18,

	U_DASH_PUNCTUATION = 19,

	U_START_PUNCTUATION = 20,

	U_END_PUNCTUATION = 21,

	U_CONNECTOR_PUNCTUATION = 22,

	U_OTHER_PUNCTUATION = 23,

	U_MATH_SYMBOL = 24,

	U_CURRENCY_SYMBOL = 25,

	U_MODIFIER_SYMBOL = 26,

	U_OTHER_SYMBOL = 27,

	U_INITIAL_PUNCTUATION = 28,

	U_FINAL_PUNCTUATION = 29,

	U_CHAR_CATEGORY_COUNT = 30
}

declare const enum UCharDirection {

	U_LEFT_TO_RIGHT = 0,

	U_RIGHT_TO_LEFT = 1,

	U_EUROPEAN_NUMBER = 2,

	U_EUROPEAN_NUMBER_SEPARATOR = 3,

	U_EUROPEAN_NUMBER_TERMINATOR = 4,

	U_ARABIC_NUMBER = 5,

	U_COMMON_NUMBER_SEPARATOR = 6,

	U_BLOCK_SEPARATOR = 7,

	U_SEGMENT_SEPARATOR = 8,

	U_WHITE_SPACE_NEUTRAL = 9,

	U_OTHER_NEUTRAL = 10,

	U_LEFT_TO_RIGHT_EMBEDDING = 11,

	U_LEFT_TO_RIGHT_OVERRIDE = 12,

	U_RIGHT_TO_LEFT_ARABIC = 13,

	U_RIGHT_TO_LEFT_EMBEDDING = 14,

	U_RIGHT_TO_LEFT_OVERRIDE = 15,

	U_POP_DIRECTIONAL_FORMAT = 16,

	U_DIR_NON_SPACING_MARK = 17,

	U_BOUNDARY_NEUTRAL = 18,

	U_FIRST_STRONG_ISOLATE = 19,

	U_LEFT_TO_RIGHT_ISOLATE = 20,

	U_RIGHT_TO_LEFT_ISOLATE = 21,

	U_POP_DIRECTIONAL_ISOLATE = 22,

	U_CHAR_DIRECTION_COUNT = 23
}

interface UCharIterator {
	context: interop.Pointer | interop.Reference<any>;
	length: number;
	start: number;
	index: number;
	limit: number;
	reservedField: number;
	getIndex: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UCharIterator>, p2: UCharIteratorOrigin) => number>>;
	move: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UCharIterator>, p2: number, p3: UCharIteratorOrigin) => number>>;
	hasNext: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UCharIterator>) => number>>;
	hasPrevious: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UCharIterator>) => number>>;
	current: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UCharIterator>) => number>>;
	next: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UCharIterator>) => number>>;
	previous: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UCharIterator>) => number>>;
	reservedFn: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UCharIterator>, p2: number) => number>>;
	getState: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UCharIterator>) => number>>;
	setState: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UCharIterator>, p2: number, p3: interop.Pointer | interop.Reference<UErrorCode>) => void>>;
}
declare var UCharIterator: interop.StructType<UCharIterator>;

declare const enum UCharIteratorOrigin {

	ITER_START = 0,

	ITER_CURRENT = 1,

	ITER_LIMIT = 2,

	ITER_ZERO = 3,

	ITER_LENGTH = 4
}

declare const enum UCharNameChoice {

	U_UNICODE_CHAR_NAME = 0,

	U_UNICODE_10_CHAR_NAME = 1,

	U_EXTENDED_CHAR_NAME = 2,

	U_CHAR_NAME_ALIAS = 3,

	U_CHAR_NAME_CHOICE_COUNT = 4
}

declare const enum UDecompositionType {

	U_DT_NONE = 0,

	U_DT_CANONICAL = 1,

	U_DT_COMPAT = 2,

	U_DT_CIRCLE = 3,

	U_DT_FINAL = 4,

	U_DT_FONT = 5,

	U_DT_FRACTION = 6,

	U_DT_INITIAL = 7,

	U_DT_ISOLATED = 8,

	U_DT_MEDIAL = 9,

	U_DT_NARROW = 10,

	U_DT_NOBREAK = 11,

	U_DT_SMALL = 12,

	U_DT_SQUARE = 13,

	U_DT_SUB = 14,

	U_DT_SUPER = 15,

	U_DT_VERTICAL = 16,

	U_DT_WIDE = 17,

	U_DT_COUNT = 18
}

declare const enum UEastAsianWidth {

	U_EA_NEUTRAL = 0,

	U_EA_AMBIGUOUS = 1,

	U_EA_HALFWIDTH = 2,

	U_EA_FULLWIDTH = 3,

	U_EA_NARROW = 4,

	U_EA_WIDE = 5,

	U_EA_COUNT = 6
}

declare const enum UErrorCode {

	U_USING_FALLBACK_WARNING = -128,

	U_ERROR_WARNING_START = -128,

	U_USING_DEFAULT_WARNING = -127,

	U_SAFECLONE_ALLOCATED_WARNING = -126,

	U_STATE_OLD_WARNING = -125,

	U_STRING_NOT_TERMINATED_WARNING = -124,

	U_SORT_KEY_TOO_SHORT_WARNING = -123,

	U_AMBIGUOUS_ALIAS_WARNING = -122,

	U_DIFFERENT_UCA_VERSION = -121,

	U_PLUGIN_CHANGED_LEVEL_WARNING = -120,

	U_ERROR_WARNING_LIMIT = -119,

	U_ZERO_ERROR = 0,

	U_ILLEGAL_ARGUMENT_ERROR = 1,

	U_MISSING_RESOURCE_ERROR = 2,

	U_INVALID_FORMAT_ERROR = 3,

	U_FILE_ACCESS_ERROR = 4,

	U_INTERNAL_PROGRAM_ERROR = 5,

	U_MESSAGE_PARSE_ERROR = 6,

	U_MEMORY_ALLOCATION_ERROR = 7,

	U_INDEX_OUTOFBOUNDS_ERROR = 8,

	U_PARSE_ERROR = 9,

	U_INVALID_CHAR_FOUND = 10,

	U_TRUNCATED_CHAR_FOUND = 11,

	U_ILLEGAL_CHAR_FOUND = 12,

	U_INVALID_TABLE_FORMAT = 13,

	U_INVALID_TABLE_FILE = 14,

	U_BUFFER_OVERFLOW_ERROR = 15,

	U_UNSUPPORTED_ERROR = 16,

	U_RESOURCE_TYPE_MISMATCH = 17,

	U_ILLEGAL_ESCAPE_SEQUENCE = 18,

	U_UNSUPPORTED_ESCAPE_SEQUENCE = 19,

	U_NO_SPACE_AVAILABLE = 20,

	U_CE_NOT_FOUND_ERROR = 21,

	U_PRIMARY_TOO_LONG_ERROR = 22,

	U_STATE_TOO_OLD_ERROR = 23,

	U_TOO_MANY_ALIASES_ERROR = 24,

	U_ENUM_OUT_OF_SYNC_ERROR = 25,

	U_INVARIANT_CONVERSION_ERROR = 26,

	U_INVALID_STATE_ERROR = 27,

	U_COLLATOR_VERSION_MISMATCH = 28,

	U_USELESS_COLLATOR_ERROR = 29,

	U_NO_WRITE_PERMISSION = 30,

	U_STANDARD_ERROR_LIMIT = 31,

	U_BAD_VARIABLE_DEFINITION = 65536,

	U_PARSE_ERROR_START = 65536,

	U_MALFORMED_RULE = 65537,

	U_MALFORMED_SET = 65538,

	U_MALFORMED_SYMBOL_REFERENCE = 65539,

	U_MALFORMED_UNICODE_ESCAPE = 65540,

	U_MALFORMED_VARIABLE_DEFINITION = 65541,

	U_MALFORMED_VARIABLE_REFERENCE = 65542,

	U_MISMATCHED_SEGMENT_DELIMITERS = 65543,

	U_MISPLACED_ANCHOR_START = 65544,

	U_MISPLACED_CURSOR_OFFSET = 65545,

	U_MISPLACED_QUANTIFIER = 65546,

	U_MISSING_OPERATOR = 65547,

	U_MISSING_SEGMENT_CLOSE = 65548,

	U_MULTIPLE_ANTE_CONTEXTS = 65549,

	U_MULTIPLE_CURSORS = 65550,

	U_MULTIPLE_POST_CONTEXTS = 65551,

	U_TRAILING_BACKSLASH = 65552,

	U_UNDEFINED_SEGMENT_REFERENCE = 65553,

	U_UNDEFINED_VARIABLE = 65554,

	U_UNQUOTED_SPECIAL = 65555,

	U_UNTERMINATED_QUOTE = 65556,

	U_RULE_MASK_ERROR = 65557,

	U_MISPLACED_COMPOUND_FILTER = 65558,

	U_MULTIPLE_COMPOUND_FILTERS = 65559,

	U_INVALID_RBT_SYNTAX = 65560,

	U_INVALID_PROPERTY_PATTERN = 65561,

	U_MALFORMED_PRAGMA = 65562,

	U_UNCLOSED_SEGMENT = 65563,

	U_ILLEGAL_CHAR_IN_SEGMENT = 65564,

	U_VARIABLE_RANGE_EXHAUSTED = 65565,

	U_VARIABLE_RANGE_OVERLAP = 65566,

	U_ILLEGAL_CHARACTER = 65567,

	U_INTERNAL_TRANSLITERATOR_ERROR = 65568,

	U_INVALID_ID = 65569,

	U_INVALID_FUNCTION = 65570,

	U_PARSE_ERROR_LIMIT = 65571,

	U_UNEXPECTED_TOKEN = 65792,

	U_FMT_PARSE_ERROR_START = 65792,

	U_MULTIPLE_DECIMAL_SEPARATORS = 65793,

	U_MULTIPLE_DECIMAL_SEPERATORS = 65793,

	U_MULTIPLE_EXPONENTIAL_SYMBOLS = 65794,

	U_MALFORMED_EXPONENTIAL_PATTERN = 65795,

	U_MULTIPLE_PERCENT_SYMBOLS = 65796,

	U_MULTIPLE_PERMILL_SYMBOLS = 65797,

	U_MULTIPLE_PAD_SPECIFIERS = 65798,

	U_PATTERN_SYNTAX_ERROR = 65799,

	U_ILLEGAL_PAD_POSITION = 65800,

	U_UNMATCHED_BRACES = 65801,

	U_UNSUPPORTED_PROPERTY = 65802,

	U_UNSUPPORTED_ATTRIBUTE = 65803,

	U_ARGUMENT_TYPE_MISMATCH = 65804,

	U_DUPLICATE_KEYWORD = 65805,

	U_UNDEFINED_KEYWORD = 65806,

	U_DEFAULT_KEYWORD_MISSING = 65807,

	U_DECIMAL_NUMBER_SYNTAX_ERROR = 65808,

	U_FORMAT_INEXACT_ERROR = 65809,

	U_NUMBER_ARG_OUTOFBOUNDS_ERROR = 65810,

	U_NUMBER_SKELETON_SYNTAX_ERROR = 65811,

	U_FMT_PARSE_ERROR_LIMIT = 65812,

	U_BRK_INTERNAL_ERROR = 66048,

	U_BRK_ERROR_START = 66048,

	U_BRK_HEX_DIGITS_EXPECTED = 66049,

	U_BRK_SEMICOLON_EXPECTED = 66050,

	U_BRK_RULE_SYNTAX = 66051,

	U_BRK_UNCLOSED_SET = 66052,

	U_BRK_ASSIGN_ERROR = 66053,

	U_BRK_VARIABLE_REDFINITION = 66054,

	U_BRK_MISMATCHED_PAREN = 66055,

	U_BRK_NEW_LINE_IN_QUOTED_STRING = 66056,

	U_BRK_UNDEFINED_VARIABLE = 66057,

	U_BRK_INIT_ERROR = 66058,

	U_BRK_RULE_EMPTY_SET = 66059,

	U_BRK_UNRECOGNIZED_OPTION = 66060,

	U_BRK_MALFORMED_RULE_TAG = 66061,

	U_BRK_ERROR_LIMIT = 66062,

	U_REGEX_INTERNAL_ERROR = 66304,

	U_REGEX_ERROR_START = 66304,

	U_REGEX_RULE_SYNTAX = 66305,

	U_REGEX_INVALID_STATE = 66306,

	U_REGEX_BAD_ESCAPE_SEQUENCE = 66307,

	U_REGEX_PROPERTY_SYNTAX = 66308,

	U_REGEX_UNIMPLEMENTED = 66309,

	U_REGEX_MISMATCHED_PAREN = 66310,

	U_REGEX_NUMBER_TOO_BIG = 66311,

	U_REGEX_BAD_INTERVAL = 66312,

	U_REGEX_MAX_LT_MIN = 66313,

	U_REGEX_INVALID_BACK_REF = 66314,

	U_REGEX_INVALID_FLAG = 66315,

	U_REGEX_LOOK_BEHIND_LIMIT = 66316,

	U_REGEX_SET_CONTAINS_STRING = 66317,

	U_REGEX_OCTAL_TOO_BIG = 66318,

	U_REGEX_MISSING_CLOSE_BRACKET = 66319,

	U_REGEX_INVALID_RANGE = 66320,

	U_REGEX_STACK_OVERFLOW = 66321,

	U_REGEX_TIME_OUT = 66322,

	U_REGEX_STOPPED_BY_CALLER = 66323,

	U_REGEX_PATTERN_TOO_BIG = 66324,

	U_REGEX_INVALID_CAPTURE_GROUP_NAME = 66325,

	U_REGEX_ERROR_LIMIT = 66326,

	U_IDNA_PROHIBITED_ERROR = 66560,

	U_IDNA_ERROR_START = 66560,

	U_IDNA_UNASSIGNED_ERROR = 66561,

	U_IDNA_CHECK_BIDI_ERROR = 66562,

	U_IDNA_STD3_ASCII_RULES_ERROR = 66563,

	U_IDNA_ACE_PREFIX_ERROR = 66564,

	U_IDNA_VERIFICATION_ERROR = 66565,

	U_IDNA_LABEL_TOO_LONG_ERROR = 66566,

	U_IDNA_ZERO_LENGTH_LABEL_ERROR = 66567,

	U_IDNA_DOMAIN_NAME_TOO_LONG_ERROR = 66568,

	U_IDNA_ERROR_LIMIT = 66569,

	U_STRINGPREP_PROHIBITED_ERROR = 66560,

	U_STRINGPREP_UNASSIGNED_ERROR = 66561,

	U_STRINGPREP_CHECK_BIDI_ERROR = 66562,

	U_PLUGIN_ERROR_START = 66816,

	U_PLUGIN_TOO_HIGH = 66816,

	U_PLUGIN_DIDNT_SET_LEVEL = 66817,

	U_PLUGIN_ERROR_LIMIT = 66818,

	U_ERROR_LIMIT = 66818
}

declare const enum UGraphemeClusterBreak {

	U_GCB_OTHER = 0,

	U_GCB_CONTROL = 1,

	U_GCB_CR = 2,

	U_GCB_EXTEND = 3,

	U_GCB_L = 4,

	U_GCB_LF = 5,

	U_GCB_LV = 6,

	U_GCB_LVT = 7,

	U_GCB_T = 8,

	U_GCB_V = 9,

	U_GCB_SPACING_MARK = 10,

	U_GCB_PREPEND = 11,

	U_GCB_REGIONAL_INDICATOR = 12,

	U_GCB_E_BASE = 13,

	U_GCB_E_BASE_GAZ = 14,

	U_GCB_E_MODIFIER = 15,

	U_GCB_GLUE_AFTER_ZWJ = 16,

	U_GCB_ZWJ = 17,

	U_GCB_COUNT = 18
}

declare const enum UHangulSyllableType {

	U_HST_NOT_APPLICABLE = 0,

	U_HST_LEADING_JAMO = 1,

	U_HST_VOWEL_JAMO = 2,

	U_HST_TRAILING_JAMO = 3,

	U_HST_LV_SYLLABLE = 4,

	U_HST_LVT_SYLLABLE = 5,

	U_HST_COUNT = 6
}

declare const UITER_UNKNOWN_INDEX: number;

declare const enum UIndicPositionalCategory {

	U_INPC_NA = 0,

	U_INPC_BOTTOM = 1,

	U_INPC_BOTTOM_AND_LEFT = 2,

	U_INPC_BOTTOM_AND_RIGHT = 3,

	U_INPC_LEFT = 4,

	U_INPC_LEFT_AND_RIGHT = 5,

	U_INPC_OVERSTRUCK = 6,

	U_INPC_RIGHT = 7,

	U_INPC_TOP = 8,

	U_INPC_TOP_AND_BOTTOM = 9,

	U_INPC_TOP_AND_BOTTOM_AND_RIGHT = 10,

	U_INPC_TOP_AND_LEFT = 11,

	U_INPC_TOP_AND_LEFT_AND_RIGHT = 12,

	U_INPC_TOP_AND_RIGHT = 13,

	U_INPC_VISUAL_ORDER_LEFT = 14
}

declare const enum UIndicSyllabicCategory {

	U_INSC_OTHER = 0,

	U_INSC_AVAGRAHA = 1,

	U_INSC_BINDU = 2,

	U_INSC_BRAHMI_JOINING_NUMBER = 3,

	U_INSC_CANTILLATION_MARK = 4,

	U_INSC_CONSONANT = 5,

	U_INSC_CONSONANT_DEAD = 6,

	U_INSC_CONSONANT_FINAL = 7,

	U_INSC_CONSONANT_HEAD_LETTER = 8,

	U_INSC_CONSONANT_INITIAL_POSTFIXED = 9,

	U_INSC_CONSONANT_KILLER = 10,

	U_INSC_CONSONANT_MEDIAL = 11,

	U_INSC_CONSONANT_PLACEHOLDER = 12,

	U_INSC_CONSONANT_PRECEDING_REPHA = 13,

	U_INSC_CONSONANT_PREFIXED = 14,

	U_INSC_CONSONANT_SUBJOINED = 15,

	U_INSC_CONSONANT_SUCCEEDING_REPHA = 16,

	U_INSC_CONSONANT_WITH_STACKER = 17,

	U_INSC_GEMINATION_MARK = 18,

	U_INSC_INVISIBLE_STACKER = 19,

	U_INSC_JOINER = 20,

	U_INSC_MODIFYING_LETTER = 21,

	U_INSC_NON_JOINER = 22,

	U_INSC_NUKTA = 23,

	U_INSC_NUMBER = 24,

	U_INSC_NUMBER_JOINER = 25,

	U_INSC_PURE_KILLER = 26,

	U_INSC_REGISTER_SHIFTER = 27,

	U_INSC_SYLLABLE_MODIFIER = 28,

	U_INSC_TONE_LETTER = 29,

	U_INSC_TONE_MARK = 30,

	U_INSC_VIRAMA = 31,

	U_INSC_VISARGA = 32,

	U_INSC_VOWEL = 33,

	U_INSC_VOWEL_DEPENDENT = 34,

	U_INSC_VOWEL_INDEPENDENT = 35
}

declare const enum UJoiningGroup {

	U_JG_NO_JOINING_GROUP = 0,

	U_JG_AIN = 1,

	U_JG_ALAPH = 2,

	U_JG_ALEF = 3,

	U_JG_BEH = 4,

	U_JG_BETH = 5,

	U_JG_DAL = 6,

	U_JG_DALATH_RISH = 7,

	U_JG_E = 8,

	U_JG_FEH = 9,

	U_JG_FINAL_SEMKATH = 10,

	U_JG_GAF = 11,

	U_JG_GAMAL = 12,

	U_JG_HAH = 13,

	U_JG_TEH_MARBUTA_GOAL = 14,

	U_JG_HAMZA_ON_HEH_GOAL = 14,

	U_JG_HE = 15,

	U_JG_HEH = 16,

	U_JG_HEH_GOAL = 17,

	U_JG_HETH = 18,

	U_JG_KAF = 19,

	U_JG_KAPH = 20,

	U_JG_KNOTTED_HEH = 21,

	U_JG_LAM = 22,

	U_JG_LAMADH = 23,

	U_JG_MEEM = 24,

	U_JG_MIM = 25,

	U_JG_NOON = 26,

	U_JG_NUN = 27,

	U_JG_PE = 28,

	U_JG_QAF = 29,

	U_JG_QAPH = 30,

	U_JG_REH = 31,

	U_JG_REVERSED_PE = 32,

	U_JG_SAD = 33,

	U_JG_SADHE = 34,

	U_JG_SEEN = 35,

	U_JG_SEMKATH = 36,

	U_JG_SHIN = 37,

	U_JG_SWASH_KAF = 38,

	U_JG_SYRIAC_WAW = 39,

	U_JG_TAH = 40,

	U_JG_TAW = 41,

	U_JG_TEH_MARBUTA = 42,

	U_JG_TETH = 43,

	U_JG_WAW = 44,

	U_JG_YEH = 45,

	U_JG_YEH_BARREE = 46,

	U_JG_YEH_WITH_TAIL = 47,

	U_JG_YUDH = 48,

	U_JG_YUDH_HE = 49,

	U_JG_ZAIN = 50,

	U_JG_FE = 51,

	U_JG_KHAPH = 52,

	U_JG_ZHAIN = 53,

	U_JG_BURUSHASKI_YEH_BARREE = 54,

	U_JG_FARSI_YEH = 55,

	U_JG_NYA = 56,

	U_JG_ROHINGYA_YEH = 57,

	U_JG_MANICHAEAN_ALEPH = 58,

	U_JG_MANICHAEAN_AYIN = 59,

	U_JG_MANICHAEAN_BETH = 60,

	U_JG_MANICHAEAN_DALETH = 61,

	U_JG_MANICHAEAN_DHAMEDH = 62,

	U_JG_MANICHAEAN_FIVE = 63,

	U_JG_MANICHAEAN_GIMEL = 64,

	U_JG_MANICHAEAN_HETH = 65,

	U_JG_MANICHAEAN_HUNDRED = 66,

	U_JG_MANICHAEAN_KAPH = 67,

	U_JG_MANICHAEAN_LAMEDH = 68,

	U_JG_MANICHAEAN_MEM = 69,

	U_JG_MANICHAEAN_NUN = 70,

	U_JG_MANICHAEAN_ONE = 71,

	U_JG_MANICHAEAN_PE = 72,

	U_JG_MANICHAEAN_QOPH = 73,

	U_JG_MANICHAEAN_RESH = 74,

	U_JG_MANICHAEAN_SADHE = 75,

	U_JG_MANICHAEAN_SAMEKH = 76,

	U_JG_MANICHAEAN_TAW = 77,

	U_JG_MANICHAEAN_TEN = 78,

	U_JG_MANICHAEAN_TETH = 79,

	U_JG_MANICHAEAN_THAMEDH = 80,

	U_JG_MANICHAEAN_TWENTY = 81,

	U_JG_MANICHAEAN_WAW = 82,

	U_JG_MANICHAEAN_YODH = 83,

	U_JG_MANICHAEAN_ZAYIN = 84,

	U_JG_STRAIGHT_WAW = 85,

	U_JG_AFRICAN_FEH = 86,

	U_JG_AFRICAN_NOON = 87,

	U_JG_AFRICAN_QAF = 88,

	U_JG_MALAYALAM_BHA = 89,

	U_JG_MALAYALAM_JA = 90,

	U_JG_MALAYALAM_LLA = 91,

	U_JG_MALAYALAM_LLLA = 92,

	U_JG_MALAYALAM_NGA = 93,

	U_JG_MALAYALAM_NNA = 94,

	U_JG_MALAYALAM_NNNA = 95,

	U_JG_MALAYALAM_NYA = 96,

	U_JG_MALAYALAM_RA = 97,

	U_JG_MALAYALAM_SSA = 98,

	U_JG_MALAYALAM_TTA = 99,

	U_JG_HANIFI_ROHINGYA_KINNA_YA = 100,

	U_JG_HANIFI_ROHINGYA_PA = 101,

	U_JG_COUNT = 102
}

declare const enum UJoiningType {

	U_JT_NON_JOINING = 0,

	U_JT_JOIN_CAUSING = 1,

	U_JT_DUAL_JOINING = 2,

	U_JT_LEFT_JOINING = 3,

	U_JT_RIGHT_JOINING = 4,

	U_JT_TRANSPARENT = 5,

	U_JT_COUNT = 6
}

declare const enum ULineBreak {

	U_LB_UNKNOWN = 0,

	U_LB_AMBIGUOUS = 1,

	U_LB_ALPHABETIC = 2,

	U_LB_BREAK_BOTH = 3,

	U_LB_BREAK_AFTER = 4,

	U_LB_BREAK_BEFORE = 5,

	U_LB_MANDATORY_BREAK = 6,

	U_LB_CONTINGENT_BREAK = 7,

	U_LB_CLOSE_PUNCTUATION = 8,

	U_LB_COMBINING_MARK = 9,

	U_LB_CARRIAGE_RETURN = 10,

	U_LB_EXCLAMATION = 11,

	U_LB_GLUE = 12,

	U_LB_HYPHEN = 13,

	U_LB_IDEOGRAPHIC = 14,

	U_LB_INSEPARABLE = 15,

	U_LB_INSEPERABLE = 15,

	U_LB_INFIX_NUMERIC = 16,

	U_LB_LINE_FEED = 17,

	U_LB_NONSTARTER = 18,

	U_LB_NUMERIC = 19,

	U_LB_OPEN_PUNCTUATION = 20,

	U_LB_POSTFIX_NUMERIC = 21,

	U_LB_PREFIX_NUMERIC = 22,

	U_LB_QUOTATION = 23,

	U_LB_COMPLEX_CONTEXT = 24,

	U_LB_SURROGATE = 25,

	U_LB_SPACE = 26,

	U_LB_BREAK_SYMBOLS = 27,

	U_LB_ZWSPACE = 28,

	U_LB_NEXT_LINE = 29,

	U_LB_WORD_JOINER = 30,

	U_LB_H2 = 31,

	U_LB_H3 = 32,

	U_LB_JL = 33,

	U_LB_JT = 34,

	U_LB_JV = 35,

	U_LB_CLOSE_PARENTHESIS = 36,

	U_LB_CONDITIONAL_JAPANESE_STARTER = 37,

	U_LB_HEBREW_LETTER = 38,

	U_LB_REGIONAL_INDICATOR = 39,

	U_LB_E_BASE = 40,

	U_LB_E_MODIFIER = 41,

	U_LB_ZWJ = 42,

	U_LB_COUNT = 43
}

declare const enum UNumericType {

	U_NT_NONE = 0,

	U_NT_DECIMAL = 1,

	U_NT_DIGIT = 2,

	U_NT_NUMERIC = 3,

	U_NT_COUNT = 4
}

interface UParseError {
	line: number;
	offset: number;
	preContext: interop.Reference<number>;
	postContext: interop.Reference<number>;
}
declare var UParseError: interop.StructType<UParseError>;

declare const enum UProperty {

	CHAR_ALPHABETIC = 0,

	CHAR_BINARY_START = 0,

	CHAR_ASCII_HEX_DIGIT = 1,

	CHAR_BIDI_CONTROL = 2,

	CHAR_BIDI_MIRRORED = 3,

	CHAR_DASH = 4,

	CHAR_DEFAULT_IGNORABLE_CODE_POINT = 5,

	CHAR_DEPRECATED = 6,

	CHAR_DIACRITIC = 7,

	CHAR_EXTENDER = 8,

	CHAR_FULL_COMPOSITION_EXCLUSION = 9,

	CHAR_GRAPHEME_BASE = 10,

	CHAR_GRAPHEME_EXTEND = 11,

	CHAR_GRAPHEME_LINK = 12,

	CHAR_HEX_DIGIT = 13,

	CHAR_HYPHEN = 14,

	CHAR_ID_CONTINUE = 15,

	CHAR_ID_START = 16,

	CHAR_IDEOGRAPHIC = 17,

	CHAR_IDS_BINARY_OPERATOR = 18,

	CHAR_IDS_TRINARY_OPERATOR = 19,

	CHAR_JOIN_CONTROL = 20,

	CHAR_LOGICAL_ORDER_EXCEPTION = 21,

	CHAR_LOWERCASE = 22,

	CHAR_MATH = 23,

	CHAR_NONCHARACTER_CODE_POINT = 24,

	CHAR_QUOTATION_MARK = 25,

	CHAR_RADICAL = 26,

	CHAR_SOFT_DOTTED = 27,

	CHAR_TERMINAL_PUNCTUATION = 28,

	CHAR_UNIFIED_IDEOGRAPH = 29,

	CHAR_UPPERCASE = 30,

	CHAR_WHITE_SPACE = 31,

	CHAR_XID_CONTINUE = 32,

	CHAR_XID_START = 33,

	CHAR_CASE_SENSITIVE = 34,

	CHAR_S_TERM = 35,

	CHAR_VARIATION_SELECTOR = 36,

	CHAR_NFD_INERT = 37,

	CHAR_NFKD_INERT = 38,

	CHAR_NFC_INERT = 39,

	CHAR_NFKC_INERT = 40,

	CHAR_SEGMENT_STARTER = 41,

	CHAR_PATTERN_SYNTAX = 42,

	CHAR_PATTERN_WHITE_SPACE = 43,

	CHAR_POSIX_ALNUM = 44,

	CHAR_POSIX_BLANK = 45,

	CHAR_POSIX_GRAPH = 46,

	CHAR_POSIX_PRINT = 47,

	CHAR_POSIX_XDIGIT = 48,

	CHAR_CASED = 49,

	CHAR_CASE_IGNORABLE = 50,

	CHAR_CHANGES_WHEN_LOWERCASED = 51,

	CHAR_CHANGES_WHEN_UPPERCASED = 52,

	CHAR_CHANGES_WHEN_TITLECASED = 53,

	CHAR_CHANGES_WHEN_CASEFOLDED = 54,

	CHAR_CHANGES_WHEN_CASEMAPPED = 55,

	CHAR_CHANGES_WHEN_NFKC_CASEFOLDED = 56,

	CHAR_EMOJI = 57,

	CHAR_EMOJI_PRESENTATION = 58,

	CHAR_EMOJI_MODIFIER = 59,

	CHAR_EMOJI_MODIFIER_BASE = 60,

	CHAR_EMOJI_COMPONENT = 61,

	CHAR_REGIONAL_INDICATOR = 62,

	CHAR_PREPENDED_CONCATENATION_MARK = 63,

	CHAR_EXTENDED_PICTOGRAPHIC = 64,

	CHAR_BINARY_LIMIT = 65,

	CHAR_BIDI_CLASS = 4096,

	CHAR_INT_START = 4096,

	CHAR_BLOCK = 4097,

	CHAR_CANONICAL_COMBINING_CLASS = 4098,

	CHAR_DECOMPOSITION_TYPE = 4099,

	CHAR_EAST_ASIAN_WIDTH = 4100,

	CHAR_GENERAL_CATEGORY = 4101,

	CHAR_JOINING_GROUP = 4102,

	CHAR_JOINING_TYPE = 4103,

	CHAR_LINE_BREAK = 4104,

	CHAR_NUMERIC_TYPE = 4105,

	CHAR_SCRIPT = 4106,

	CHAR_HANGUL_SYLLABLE_TYPE = 4107,

	CHAR_NFD_QUICK_CHECK = 4108,

	CHAR_NFKD_QUICK_CHECK = 4109,

	CHAR_NFC_QUICK_CHECK = 4110,

	CHAR_NFKC_QUICK_CHECK = 4111,

	CHAR_LEAD_CANONICAL_COMBINING_CLASS = 4112,

	CHAR_TRAIL_CANONICAL_COMBINING_CLASS = 4113,

	CHAR_GRAPHEME_CLUSTER_BREAK = 4114,

	CHAR_SENTENCE_BREAK = 4115,

	CHAR_WORD_BREAK = 4116,

	CHAR_BIDI_PAIRED_BRACKET_TYPE = 4117,

	CHAR_INDIC_POSITIONAL_CATEGORY = 4118,

	CHAR_INDIC_SYLLABIC_CATEGORY = 4119,

	CHAR_VERTICAL_ORIENTATION = 4120,

	CHAR_INT_LIMIT = 4121,

	CHAR_GENERAL_CATEGORY_MASK = 8192,

	CHAR_MASK_START = 8192,

	CHAR_MASK_LIMIT = 8193,

	CHAR_NUMERIC_VALUE = 12288,

	CHAR_DOUBLE_START = 12288,

	CHAR_DOUBLE_LIMIT = 12289,

	CHAR_AGE = 16384,

	CHAR_STRING_START = 16384,

	CHAR_BIDI_MIRRORING_GLYPH = 16385,

	CHAR_CASE_FOLDING = 16386,

	CHAR_ISO_COMMENT = 16387,

	CHAR_LOWERCASE_MAPPING = 16388,

	CHAR_NAME = 16389,

	CHAR_SIMPLE_CASE_FOLDING = 16390,

	CHAR_SIMPLE_LOWERCASE_MAPPING = 16391,

	CHAR_SIMPLE_TITLECASE_MAPPING = 16392,

	CHAR_SIMPLE_UPPERCASE_MAPPING = 16393,

	CHAR_TITLECASE_MAPPING = 16394,

	CHAR_UNICODE_1_NAME = 16395,

	CHAR_UPPERCASE_MAPPING = 16396,

	CHAR_BIDI_PAIRED_BRACKET = 16397,

	CHAR_STRING_LIMIT = 16398,

	CHAR_SCRIPT_EXTENSIONS = 28672,

	CHAR_OTHER_PROPERTY_START = 28672,

	CHAR_OTHER_PROPERTY_LIMIT = 28673,

	CHAR_INVALID_CODE = -1
}

declare const enum UPropertyNameChoice {

	U_SHORT_PROPERTY_NAME = 0,

	U_LONG_PROPERTY_NAME = 1,

	U_PROPERTY_NAME_CHOICE_COUNT = 2
}

declare const enum URegexpFlag {

	EGEX_CANON_EQ = 128,

	EGEX_CASE_INSENSITIVE = 2,

	EGEX_COMMENTS = 4,

	EGEX_DOTALL = 32,

	EGEX_LITERAL = 16,

	EGEX_MULTILINE = 8,

	EGEX_UNIX_LINES = 1,

	EGEX_UWORD = 256,

	EGEX_ERROR_ON_UNKNOWN_ESCAPES = 512
}

declare const enum USentenceBreak {

	U_SB_OTHER = 0,

	U_SB_ATERM = 1,

	U_SB_CLOSE = 2,

	U_SB_FORMAT = 3,

	U_SB_LOWER = 4,

	U_SB_NUMERIC = 5,

	U_SB_OLETTER = 6,

	U_SB_SEP = 7,

	U_SB_SP = 8,

	U_SB_STERM = 9,

	U_SB_UPPER = 10,

	U_SB_CR = 11,

	U_SB_EXTEND = 12,

	U_SB_LF = 13,

	U_SB_SCONTINUE = 14,

	U_SB_COUNT = 15
}

declare const UTEXT_MAGIC: number;

declare const UTEXT_PROVIDER_HAS_META_DATA: number;

declare const UTEXT_PROVIDER_LENGTH_IS_EXPENSIVE: number;

declare const UTEXT_PROVIDER_OWNS_TEXT: number;

declare const UTEXT_PROVIDER_STABLE_CHUNKS: number;

declare const UTEXT_PROVIDER_WRITABLE: number;

interface UText {
	magic: number;
	flags: number;
	providerProperties: number;
	sizeOfStruct: number;
	chunkNativeLimit: number;
	extraSize: number;
	nativeIndexingLimit: number;
	chunkNativeStart: number;
	chunkOffset: number;
	chunkLength: number;
	chunkContents: interop.Pointer | interop.Reference<number>;
	pFuncs: interop.Pointer | interop.Reference<UTextFuncs>;
	pExtra: interop.Pointer | interop.Reference<any>;
	context: interop.Pointer | interop.Reference<any>;
	p: interop.Pointer | interop.Reference<any>;
	q: interop.Pointer | interop.Reference<any>;
	r: interop.Pointer | interop.Reference<any>;
	privP: interop.Pointer | interop.Reference<any>;
	a: number;
	b: number;
	c: number;
	privA: number;
	privB: number;
	privC: number;
}
declare var UText: interop.StructType<UText>;

interface UTextFuncs {
	tableSize: number;
	reserved1: number;
	reserved2: number;
	reserved3: number;
	clone: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>, p2: interop.Pointer | interop.Reference<UText>, p3: number, p4: interop.Pointer | interop.Reference<UErrorCode>) => interop.Pointer | interop.Reference<UText>>>;
	nativeLength: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>) => number>>;
	access: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>, p2: number, p3: number) => number>>;
	extract: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<number>, p5: number, p6: interop.Pointer | interop.Reference<UErrorCode>) => number>>;
	replace: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<number>, p5: number, p6: interop.Pointer | interop.Reference<UErrorCode>) => number>>;
	copy: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>, p2: number, p3: number, p4: number, p5: number, p6: interop.Pointer | interop.Reference<UErrorCode>) => void>>;
	mapOffsetToNative: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>) => number>>;
	mapNativeIndexToUTF16: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>, p2: number) => number>>;
	close: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>) => void>>;
	spare1: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>) => void>>;
	spare2: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>) => void>>;
	spare3: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<UText>) => void>>;
}
declare var UTextFuncs: interop.StructType<UTextFuncs>;

declare const enum UVerticalOrientation {

	U_VO_ROTATED = 0,

	U_VO_TRANSFORMED_ROTATED = 1,

	U_VO_TRANSFORMED_UPRIGHT = 2,

	U_VO_UPRIGHT = 3
}

declare const enum UWordBreakValues {

	U_WB_OTHER = 0,

	U_WB_ALETTER = 1,

	U_WB_FORMAT = 2,

	U_WB_KATAKANA = 3,

	U_WB_MIDLETTER = 4,

	U_WB_MIDNUM = 5,

	U_WB_NUMERIC = 6,

	U_WB_EXTENDNUMLET = 7,

	U_WB_CR = 8,

	U_WB_EXTEND = 9,

	U_WB_LF = 10,

	U_WB_MIDNUMLET = 11,

	U_WB_NEWLINE = 12,

	U_WB_REGIONAL_INDICATOR = 13,

	U_WB_HEBREW_LETTER = 14,

	U_WB_SINGLE_QUOTE = 15,

	U_WB_DOUBLE_QUOTE = 16,

	U_WB_E_BASE = 17,

	U_WB_E_BASE_GAZ = 18,

	U_WB_E_MODIFIER = 19,

	U_WB_GLUE_AFTER_ZWJ = 20,

	U_WB_ZWJ = 21,

	U_WB_WSEGSPACE = 22,

	U_WB_COUNT = 23
}

declare const U_PARSE_CONTEXT_LEN: number;

declare function u_UCharsToChars(us: interop.Pointer | interop.Reference<number>, cs: string | interop.Pointer | interop.Reference<any>, length: number): void;

declare function u_austrcpy(dst: string | interop.Pointer | interop.Reference<any>, src: interop.Pointer | interop.Reference<number>): string;

declare function u_austrncpy(dst: string | interop.Pointer | interop.Reference<any>, src: interop.Pointer | interop.Reference<number>, n: number): string;

declare function u_charAge(c: number, versionArray: interop.Reference<number>): void;

declare function u_charDigitValue(c: number): number;

declare function u_charDirection(c: number): UCharDirection;

declare function u_charFromName(nameChoice: UCharNameChoice, name: string | interop.Pointer | interop.Reference<any>, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function u_charMirror(c: number): number;

declare function u_charName(code: number, nameChoice: UCharNameChoice, buffer: string | interop.Pointer | interop.Reference<any>, bufferLength: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function u_charType(c: number): number;

declare function u_charsToUChars(cs: string | interop.Pointer | interop.Reference<any>, us: interop.Pointer | interop.Reference<number>, length: number): void;

declare function u_countChar32(s: interop.Pointer | interop.Reference<number>, length: number): number;

declare function u_digit(ch: number, radix: number): number;

declare function u_enumCharNames(start: number, limit: number, fn: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: UCharNameChoice, p4: string, p5: number) => number>>, context: interop.Pointer | interop.Reference<any>, nameChoice: UCharNameChoice, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function u_enumCharTypes(enumRange: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: UCharCategory) => number>>, context: interop.Pointer | interop.Reference<any>): void;

declare function u_errorName(code: UErrorCode): string;

declare function u_foldCase(c: number, options: number): number;

declare function u_forDigit(digit: number, radix: number): number;

declare function u_getBidiPairedBracket(c: number): number;

declare function u_getBinaryPropertySet(property: UProperty, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<any>;

declare function u_getCombiningClass(c: number): number;

declare function u_getDataDirectory(): string;

declare function u_getFC_NFKC_Closure(c: number, dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function u_getISOComment(c: number, dest: string | interop.Pointer | interop.Reference<any>, destCapacity: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function u_getIntPropertyMap(property: UProperty, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<any>;

declare function u_getIntPropertyMaxValue(which: UProperty): number;

declare function u_getIntPropertyMinValue(which: UProperty): number;

declare function u_getIntPropertyValue(c: number, which: UProperty): number;

declare function u_getNumericValue(c: number): number;

declare function u_getPropertyEnum(alias: string | interop.Pointer | interop.Reference<any>): UProperty;

declare function u_getPropertyName(property: UProperty, nameChoice: UPropertyNameChoice): string;

declare function u_getPropertyValueEnum(property: UProperty, alias: string | interop.Pointer | interop.Reference<any>): number;

declare function u_getPropertyValueName(property: UProperty, value: number, nameChoice: UPropertyNameChoice): string;

declare function u_getTimeZoneFilesDirectory(status: interop.Pointer | interop.Reference<UErrorCode>): string;

declare function u_getUnicodeVersion(versionArray: interop.Reference<number>): void;

declare function u_getVersion(versionArray: interop.Reference<number>): void;

declare function u_hasBinaryProperty(c: number, which: UProperty): number;

declare function u_isIDIgnorable(c: number): number;

declare function u_isIDPart(c: number): number;

declare function u_isIDStart(c: number): number;

declare function u_isISOControl(c: number): number;

declare function u_isJavaIDPart(c: number): number;

declare function u_isJavaIDStart(c: number): number;

declare function u_isJavaSpaceChar(c: number): number;

declare function u_isMirrored(c: number): number;

declare function u_isUAlphabetic(c: number): number;

declare function u_isULowercase(c: number): number;

declare function u_isUUppercase(c: number): number;

declare function u_isUWhiteSpace(c: number): number;

declare function u_isWhitespace(c: number): number;

declare function u_isalnum(c: number): number;

declare function u_isalpha(c: number): number;

declare function u_isbase(c: number): number;

declare function u_isblank(c: number): number;

declare function u_iscntrl(c: number): number;

declare function u_isdefined(c: number): number;

declare function u_isdigit(c: number): number;

declare function u_isgraph(c: number): number;

declare function u_islower(c: number): number;

declare function u_isprint(c: number): number;

declare function u_ispunct(c: number): number;

declare function u_isspace(c: number): number;

declare function u_istitle(c: number): number;

declare function u_isupper(c: number): number;

declare function u_isxdigit(c: number): number;

declare function u_memcasecmp(s1: interop.Pointer | interop.Reference<number>, s2: interop.Pointer | interop.Reference<number>, length: number, options: number): number;

declare function u_memchr(s: interop.Pointer | interop.Reference<number>, c: number, count: number): interop.Pointer | interop.Reference<number>;

declare function u_memchr32(s: interop.Pointer | interop.Reference<number>, c: number, count: number): interop.Pointer | interop.Reference<number>;

declare function u_memcmp(buf1: interop.Pointer | interop.Reference<number>, buf2: interop.Pointer | interop.Reference<number>, count: number): number;

declare function u_memcmpCodePointOrder(s1: interop.Pointer | interop.Reference<number>, s2: interop.Pointer | interop.Reference<number>, count: number): number;

declare function u_memcpy(dest: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, count: number): interop.Pointer | interop.Reference<number>;

declare function u_memmove(dest: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, count: number): interop.Pointer | interop.Reference<number>;

declare function u_memrchr(s: interop.Pointer | interop.Reference<number>, c: number, count: number): interop.Pointer | interop.Reference<number>;

declare function u_memrchr32(s: interop.Pointer | interop.Reference<number>, c: number, count: number): interop.Pointer | interop.Reference<number>;

declare function u_memset(dest: interop.Pointer | interop.Reference<number>, c: number, count: number): interop.Pointer | interop.Reference<number>;

declare function u_setDataDirectory(directory: string | interop.Pointer | interop.Reference<any>): void;

declare function u_setTimeZoneFilesDirectory(path: string | interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function u_strCaseCompare(s1: interop.Pointer | interop.Reference<number>, length1: number, s2: interop.Pointer | interop.Reference<number>, length2: number, options: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function u_strCompare(s1: interop.Pointer | interop.Reference<number>, length1: number, s2: interop.Pointer | interop.Reference<number>, length2: number, codePointOrder: number): number;

declare function u_strCompareIter(iter1: interop.Pointer | interop.Reference<UCharIterator>, iter2: interop.Pointer | interop.Reference<UCharIterator>, codePointOrder: number): number;

declare function u_strFindFirst(s: interop.Pointer | interop.Reference<number>, length: number, substring: interop.Pointer | interop.Reference<number>, subLength: number): interop.Pointer | interop.Reference<number>;

declare function u_strFindLast(s: interop.Pointer | interop.Reference<number>, length: number, substring: interop.Pointer | interop.Reference<number>, subLength: number): interop.Pointer | interop.Reference<number>;

declare function u_strFoldCase(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, src: interop.Pointer | interop.Reference<number>, srcLength: number, options: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function u_strFromJavaModifiedUTF8WithSub(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: string | interop.Pointer | interop.Reference<any>, srcLength: number, subchar: number, pNumSubstitutions: interop.Pointer | interop.Reference<number>, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function u_strFromUTF32(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, srcLength: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function u_strFromUTF32WithSub(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, srcLength: number, subchar: number, pNumSubstitutions: interop.Pointer | interop.Reference<number>, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function u_strFromUTF8(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: string | interop.Pointer | interop.Reference<any>, srcLength: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function u_strFromUTF8Lenient(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: string | interop.Pointer | interop.Reference<any>, srcLength: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function u_strFromUTF8WithSub(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: string | interop.Pointer | interop.Reference<any>, srcLength: number, subchar: number, pNumSubstitutions: interop.Pointer | interop.Reference<number>, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function u_strFromWCS(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, srcLength: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function u_strHasMoreChar32Than(s: interop.Pointer | interop.Reference<number>, length: number, number: number): number;

declare function u_strIsWellFormed(s: interop.Pointer | interop.Reference<number>, length: number): number;

declare function u_strToJavaModifiedUTF8(dest: string | interop.Pointer | interop.Reference<any>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, srcLength: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): string;

declare function u_strToLower(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, src: interop.Pointer | interop.Reference<number>, srcLength: number, locale: string | interop.Pointer | interop.Reference<any>, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function u_strToTitle(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, src: interop.Pointer | interop.Reference<number>, srcLength: number, titleIter: interop.Pointer | interop.Reference<any>, locale: string | interop.Pointer | interop.Reference<any>, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function u_strToUTF32(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, srcLength: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function u_strToUTF32WithSub(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, srcLength: number, subchar: number, pNumSubstitutions: interop.Pointer | interop.Reference<number>, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function u_strToUTF8(dest: string | interop.Pointer | interop.Reference<any>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, srcLength: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): string;

declare function u_strToUTF8WithSub(dest: string | interop.Pointer | interop.Reference<any>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, srcLength: number, subchar: number, pNumSubstitutions: interop.Pointer | interop.Reference<number>, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): string;

declare function u_strToUpper(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, src: interop.Pointer | interop.Reference<number>, srcLength: number, locale: string | interop.Pointer | interop.Reference<any>, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function u_strToWCS(dest: interop.Pointer | interop.Reference<number>, destCapacity: number, pDestLength: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, srcLength: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function u_strcasecmp(s1: interop.Pointer | interop.Reference<number>, s2: interop.Pointer | interop.Reference<number>, options: number): number;

declare function u_strcat(dst: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function u_strchr(s: interop.Pointer | interop.Reference<number>, c: number): interop.Pointer | interop.Reference<number>;

declare function u_strchr32(s: interop.Pointer | interop.Reference<number>, c: number): interop.Pointer | interop.Reference<number>;

declare function u_strcmp(s1: interop.Pointer | interop.Reference<number>, s2: interop.Pointer | interop.Reference<number>): number;

declare function u_strcmpCodePointOrder(s1: interop.Pointer | interop.Reference<number>, s2: interop.Pointer | interop.Reference<number>): number;

declare function u_strcpy(dst: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function u_strcspn(string: interop.Pointer | interop.Reference<number>, matchSet: interop.Pointer | interop.Reference<number>): number;

declare function u_strlen(s: interop.Pointer | interop.Reference<number>): number;

declare function u_strncasecmp(s1: interop.Pointer | interop.Reference<number>, s2: interop.Pointer | interop.Reference<number>, n: number, options: number): number;

declare function u_strncat(dst: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, n: number): interop.Pointer | interop.Reference<number>;

declare function u_strncmp(ucs1: interop.Pointer | interop.Reference<number>, ucs2: interop.Pointer | interop.Reference<number>, n: number): number;

declare function u_strncmpCodePointOrder(s1: interop.Pointer | interop.Reference<number>, s2: interop.Pointer | interop.Reference<number>, n: number): number;

declare function u_strncpy(dst: interop.Pointer | interop.Reference<number>, src: interop.Pointer | interop.Reference<number>, n: number): interop.Pointer | interop.Reference<number>;

declare function u_strpbrk(string: interop.Pointer | interop.Reference<number>, matchSet: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function u_strrchr(s: interop.Pointer | interop.Reference<number>, c: number): interop.Pointer | interop.Reference<number>;

declare function u_strrchr32(s: interop.Pointer | interop.Reference<number>, c: number): interop.Pointer | interop.Reference<number>;

declare function u_strrstr(s: interop.Pointer | interop.Reference<number>, substring: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function u_strspn(string: interop.Pointer | interop.Reference<number>, matchSet: interop.Pointer | interop.Reference<number>): number;

declare function u_strstr(s: interop.Pointer | interop.Reference<number>, substring: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<number>;

declare function u_strtok_r(src: interop.Pointer | interop.Reference<number>, delim: interop.Pointer | interop.Reference<number>, saveState: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>): interop.Pointer | interop.Reference<number>;

declare function u_tolower(c: number): number;

declare function u_totitle(c: number): number;

declare function u_toupper(c: number): number;

declare function u_uastrcpy(dst: interop.Pointer | interop.Reference<number>, src: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<number>;

declare function u_uastrncpy(dst: interop.Pointer | interop.Reference<number>, src: string | interop.Pointer | interop.Reference<any>, n: number): interop.Pointer | interop.Reference<number>;

declare function u_unescape(src: string | interop.Pointer | interop.Reference<any>, dest: interop.Pointer | interop.Reference<number>, destCapacity: number): number;

declare function u_unescapeAt(charAt: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any>) => number>, offset: interop.Pointer | interop.Reference<number>, length: number, context: interop.Pointer | interop.Reference<any>): number;

declare function u_versionFromString(versionArray: interop.Reference<number>, versionString: string | interop.Pointer | interop.Reference<any>): void;

declare function u_versionFromUString(versionArray: interop.Reference<number>, versionString: interop.Pointer | interop.Reference<number>): void;

declare function u_versionToString(versionArray: interop.Reference<number>, versionString: string | interop.Pointer | interop.Reference<any>): void;

declare function ublock_getCode(c: number): UBlockCode;

declare function ucpmap_get(map: interop.Pointer | interop.Reference<any>, c: number): number;

declare function ucpmap_getRange(map: interop.Pointer | interop.Reference<any>, start: number, option: UCPMapRangeOption, surrogateValue: number, filter: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>>, context: interop.Pointer | interop.Reference<any>, pValue: interop.Pointer | interop.Reference<number>): number;

declare function uiter_current32(iter: interop.Pointer | interop.Reference<UCharIterator>): number;

declare function uiter_getState(iter: interop.Pointer | interop.Reference<UCharIterator>): number;

declare function uiter_next32(iter: interop.Pointer | interop.Reference<UCharIterator>): number;

declare function uiter_previous32(iter: interop.Pointer | interop.Reference<UCharIterator>): number;

declare function uiter_setState(iter: interop.Pointer | interop.Reference<UCharIterator>, state: number, pErrorCode: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uiter_setString(iter: interop.Pointer | interop.Reference<UCharIterator>, s: interop.Pointer | interop.Reference<number>, length: number): void;

declare function uiter_setUTF16BE(iter: interop.Pointer | interop.Reference<UCharIterator>, s: string | interop.Pointer | interop.Reference<any>, length: number): void;

declare function uiter_setUTF8(iter: interop.Pointer | interop.Reference<UCharIterator>, s: string | interop.Pointer | interop.Reference<any>, length: number): void;

declare function uregex_appendReplacement(regexp: interop.Pointer | interop.Reference<any>, replacementText: interop.Pointer | interop.Reference<number>, replacementLength: number, destBuf: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, destCapacity: interop.Pointer | interop.Reference<number>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_appendReplacementUText(regexp: interop.Pointer | interop.Reference<any>, replacementText: interop.Pointer | interop.Reference<UText>, dest: interop.Pointer | interop.Reference<UText>, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_appendTail(regexp: interop.Pointer | interop.Reference<any>, destBuf: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>, destCapacity: interop.Pointer | interop.Reference<number>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_appendTailUText(regexp: interop.Pointer | interop.Reference<any>, dest: interop.Pointer | interop.Reference<UText>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<UText>;

declare function uregex_clone(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<any>;

declare function uregex_close(regexp: interop.Pointer | interop.Reference<any>): void;

declare function uregex_end(regexp: interop.Pointer | interop.Reference<any>, groupNum: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_end64(regexp: interop.Pointer | interop.Reference<any>, groupNum: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_find(regexp: interop.Pointer | interop.Reference<any>, startIndex: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_find64(regexp: interop.Pointer | interop.Reference<any>, startIndex: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_findNext(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_flags(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_getFindProgressCallback(regexp: interop.Pointer | interop.Reference<any>, callback: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>>>, context: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_getMatchCallback(regexp: interop.Pointer | interop.Reference<any>, callback: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>>>, context: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_getStackLimit(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_getText(regexp: interop.Pointer | interop.Reference<any>, textLength: interop.Pointer | interop.Reference<number>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function uregex_getTimeLimit(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_getUText(regexp: interop.Pointer | interop.Reference<any>, dest: interop.Pointer | interop.Reference<UText>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<UText>;

declare function uregex_group(regexp: interop.Pointer | interop.Reference<any>, groupNum: number, dest: interop.Pointer | interop.Reference<number>, destCapacity: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_groupCount(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_groupNumberFromCName(regexp: interop.Pointer | interop.Reference<any>, groupName: string | interop.Pointer | interop.Reference<any>, nameLength: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_groupNumberFromName(regexp: interop.Pointer | interop.Reference<any>, groupName: interop.Pointer | interop.Reference<number>, nameLength: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_groupUText(regexp: interop.Pointer | interop.Reference<any>, groupNum: number, dest: interop.Pointer | interop.Reference<UText>, groupLength: interop.Pointer | interop.Reference<number>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<UText>;

declare function uregex_hasAnchoringBounds(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_hasTransparentBounds(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_hitEnd(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_lookingAt(regexp: interop.Pointer | interop.Reference<any>, startIndex: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_lookingAt64(regexp: interop.Pointer | interop.Reference<any>, startIndex: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_matches(regexp: interop.Pointer | interop.Reference<any>, startIndex: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_matches64(regexp: interop.Pointer | interop.Reference<any>, startIndex: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_open(pattern: interop.Pointer | interop.Reference<number>, patternLength: number, flags: number, pe: interop.Pointer | interop.Reference<UParseError>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<any>;

declare function uregex_openC(pattern: string | interop.Pointer | interop.Reference<any>, flags: number, pe: interop.Pointer | interop.Reference<UParseError>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<any>;

declare function uregex_openUText(pattern: interop.Pointer | interop.Reference<UText>, flags: number, pe: interop.Pointer | interop.Reference<UParseError>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<any>;

declare function uregex_pattern(regexp: interop.Pointer | interop.Reference<any>, patLength: interop.Pointer | interop.Reference<number>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<number>;

declare function uregex_patternUText(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<UText>;

declare function uregex_refreshUText(regexp: interop.Pointer | interop.Reference<any>, text: interop.Pointer | interop.Reference<UText>, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_regionEnd(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_regionEnd64(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_regionStart(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_regionStart64(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_replaceAll(regexp: interop.Pointer | interop.Reference<any>, replacementText: interop.Pointer | interop.Reference<number>, replacementLength: number, destBuf: interop.Pointer | interop.Reference<number>, destCapacity: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_replaceAllUText(regexp: interop.Pointer | interop.Reference<any>, replacement: interop.Pointer | interop.Reference<UText>, dest: interop.Pointer | interop.Reference<UText>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<UText>;

declare function uregex_replaceFirst(regexp: interop.Pointer | interop.Reference<any>, replacementText: interop.Pointer | interop.Reference<number>, replacementLength: number, destBuf: interop.Pointer | interop.Reference<number>, destCapacity: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_replaceFirstUText(regexp: interop.Pointer | interop.Reference<any>, replacement: interop.Pointer | interop.Reference<UText>, dest: interop.Pointer | interop.Reference<UText>, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<UText>;

declare function uregex_requireEnd(regexp: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_reset(regexp: interop.Pointer | interop.Reference<any>, index: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_reset64(regexp: interop.Pointer | interop.Reference<any>, index: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_setFindProgressCallback(regexp: interop.Pointer | interop.Reference<any>, callback: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>>, context: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_setMatchCallback(regexp: interop.Pointer | interop.Reference<any>, callback: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number) => number>>, context: interop.Pointer | interop.Reference<any>, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_setRegion(regexp: interop.Pointer | interop.Reference<any>, regionStart: number, regionLimit: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_setRegion64(regexp: interop.Pointer | interop.Reference<any>, regionStart: number, regionLimit: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_setRegionAndStart(regexp: interop.Pointer | interop.Reference<any>, regionStart: number, regionLimit: number, startIndex: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_setStackLimit(regexp: interop.Pointer | interop.Reference<any>, limit: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_setText(regexp: interop.Pointer | interop.Reference<any>, text: interop.Pointer | interop.Reference<number>, textLength: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_setTimeLimit(regexp: interop.Pointer | interop.Reference<any>, limit: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_setUText(regexp: interop.Pointer | interop.Reference<any>, text: interop.Pointer | interop.Reference<UText>, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_split(regexp: interop.Pointer | interop.Reference<any>, destBuf: interop.Pointer | interop.Reference<number>, destCapacity: number, requiredCapacity: interop.Pointer | interop.Reference<number>, destFields: interop.Reference<interop.Pointer | interop.Reference<number>>, destFieldsCapacity: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_splitUText(regexp: interop.Pointer | interop.Reference<any>, destFields: interop.Reference<interop.Pointer | interop.Reference<UText>>, destFieldsCapacity: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_start(regexp: interop.Pointer | interop.Reference<any>, groupNum: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_start64(regexp: interop.Pointer | interop.Reference<any>, groupNum: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function uregex_useAnchoringBounds(regexp: interop.Pointer | interop.Reference<any>, b: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function uregex_useTransparentBounds(regexp: interop.Pointer | interop.Reference<any>, b: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function utext_char32At(ut: interop.Pointer | interop.Reference<UText>, nativeIndex: number): number;

declare function utext_clone(dest: interop.Pointer | interop.Reference<UText>, src: interop.Pointer | interop.Reference<UText>, deep: number, readOnly: number, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<UText>;

declare function utext_close(ut: interop.Pointer | interop.Reference<UText>): interop.Pointer | interop.Reference<UText>;

declare function utext_copy(ut: interop.Pointer | interop.Reference<UText>, nativeStart: number, nativeLimit: number, destIndex: number, move: number, status: interop.Pointer | interop.Reference<UErrorCode>): void;

declare function utext_current32(ut: interop.Pointer | interop.Reference<UText>): number;

declare function utext_equals(a: interop.Pointer | interop.Reference<UText>, b: interop.Pointer | interop.Reference<UText>): number;

declare function utext_extract(ut: interop.Pointer | interop.Reference<UText>, nativeStart: number, nativeLimit: number, dest: interop.Pointer | interop.Reference<number>, destCapacity: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function utext_freeze(ut: interop.Pointer | interop.Reference<UText>): void;

declare function utext_getNativeIndex(ut: interop.Pointer | interop.Reference<UText>): number;

declare function utext_getPreviousNativeIndex(ut: interop.Pointer | interop.Reference<UText>): number;

declare function utext_hasMetaData(ut: interop.Pointer | interop.Reference<UText>): number;

declare function utext_isLengthExpensive(ut: interop.Pointer | interop.Reference<UText>): number;

declare function utext_isWritable(ut: interop.Pointer | interop.Reference<UText>): number;

declare function utext_moveIndex32(ut: interop.Pointer | interop.Reference<UText>, delta: number): number;

declare function utext_nativeLength(ut: interop.Pointer | interop.Reference<UText>): number;

declare function utext_next32(ut: interop.Pointer | interop.Reference<UText>): number;

declare function utext_next32From(ut: interop.Pointer | interop.Reference<UText>, nativeIndex: number): number;

declare function utext_openUChars(ut: interop.Pointer | interop.Reference<UText>, s: interop.Pointer | interop.Reference<number>, length: number, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<UText>;

declare function utext_openUTF8(ut: interop.Pointer | interop.Reference<UText>, s: string | interop.Pointer | interop.Reference<any>, length: number, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<UText>;

declare function utext_previous32(ut: interop.Pointer | interop.Reference<UText>): number;

declare function utext_previous32From(ut: interop.Pointer | interop.Reference<UText>, nativeIndex: number): number;

declare function utext_replace(ut: interop.Pointer | interop.Reference<UText>, nativeStart: number, nativeLimit: number, replacementText: interop.Pointer | interop.Reference<number>, replacementLength: number, status: interop.Pointer | interop.Reference<UErrorCode>): number;

declare function utext_setNativeIndex(ut: interop.Pointer | interop.Reference<UText>, nativeIndex: number): void;

declare function utext_setup(ut: interop.Pointer | interop.Reference<UText>, extraSpace: number, status: interop.Pointer | interop.Reference<UErrorCode>): interop.Pointer | interop.Reference<UText>;

declare function utf8_appendCharSafeBody(s: string | interop.Pointer | interop.Reference<any>, i: number, length: number, c: number, pIsError: interop.Pointer | interop.Reference<number>): number;

declare function utf8_back1SafeBody(s: string | interop.Pointer | interop.Reference<any>, start: number, i: number): number;

declare var utf8_countTrailBytes: interop.Reference<number>;

declare function utf8_nextCharSafeBody(s: string | interop.Pointer | interop.Reference<any>, pi: interop.Pointer | interop.Reference<number>, length: number, c: number, strict: number): number;

declare function utf8_prevCharSafeBody(s: string | interop.Pointer | interop.Reference<any>, start: number, pi: interop.Pointer | interop.Reference<number>, c: number, strict: number): number;
