
declare function hb_blob_copy_writable_or_fail(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_blob_create(data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, mode: hb_memory_mode_t, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): interop.Pointer | interop.Reference<any> | null;

declare function hb_blob_create_from_file(file_name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_blob_create_sub_blob(parent: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, offset: number, length: number): interop.Pointer | interop.Reference<any> | null;

declare function hb_blob_destroy(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_blob_get_data(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function hb_blob_get_data_writable(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_blob_get_empty(): interop.Pointer | interop.Reference<any> | null;

declare function hb_blob_get_length(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_blob_get_user_data(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_blob_is_immutable(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_blob_make_immutable(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_blob_reference(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_blob_set_user_data(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, replace: number): number;

declare function hb_buffer_add(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, codepoint: number, cluster: number): void;

declare function hb_buffer_add_codepoints(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, text_length: number, item_offset: number, item_length: number): void;

declare function hb_buffer_add_latin1(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text_length: number, item_offset: number, item_length: number): void;

declare function hb_buffer_add_utf16(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, text_length: number, item_offset: number, item_length: number): void;

declare function hb_buffer_add_utf32(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, text_length: number, item_offset: number, item_length: number): void;

declare function hb_buffer_add_utf8(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text_length: number, item_offset: number, item_length: number): void;

declare function hb_buffer_allocation_successful(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_buffer_append(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, source: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start: number, end: number): void;

declare function hb_buffer_clear_contents(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare const enum hb_buffer_cluster_level_t {

	MONOTONE_GRAPHEMES = 0,

	MONOTONE_CHARACTERS = 1,

	CHARACTERS = 2,

	DEFAULT = 0
}

declare const enum hb_buffer_content_type_t {

	INVALID = 0,

	UNICODE = 1,

	GLYPHS = 2
}

declare function hb_buffer_create(): interop.Pointer | interop.Reference<any> | null;

declare function hb_buffer_deserialize_glyphs(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf_len: number, end_ptr: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null, font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, format: hb_buffer_serialize_format_t): number;

declare function hb_buffer_deserialize_unicode(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf_len: number, end_ptr: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null, format: hb_buffer_serialize_format_t): number;

declare function hb_buffer_destroy(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_buffer_diff(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, reference: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dottedcircle_glyph: number, position_fuzz: number): hb_buffer_diff_flags_t;

declare const enum hb_buffer_diff_flags_t {

	EQUAL = 0,

	CONTENT_TYPE_MISMATCH = 1,

	LENGTH_MISMATCH = 2,

	NOTDEF_PRESENT = 4,

	DOTTED_CIRCLE_PRESENT = 8,

	CODEPOINT_MISMATCH = 16,

	CLUSTER_MISMATCH = 32,

	GLYPH_FLAGS_MISMATCH = 64,

	POSITION_MISMATCH = 128
}

declare const enum hb_buffer_flags_t {

	DEFAULT = 0,

	BOT = 1,

	EOT = 2,

	PRESERVE_DEFAULT_IGNORABLES = 4,

	REMOVE_DEFAULT_IGNORABLES = 8,

	DO_NOT_INSERT_DOTTED_CIRCLE = 16
}

declare function hb_buffer_get_cluster_level(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): hb_buffer_cluster_level_t;

declare function hb_buffer_get_content_type(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): hb_buffer_content_type_t;

declare function hb_buffer_get_direction(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): hb_direction_t;

declare function hb_buffer_get_empty(): interop.Pointer | interop.Reference<any> | null;

declare function hb_buffer_get_flags(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): hb_buffer_flags_t;

declare function hb_buffer_get_glyph_infos(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<hb_glyph_info_t> | null;

declare function hb_buffer_get_glyph_positions(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<hb_glyph_position_t> | null;

declare function hb_buffer_get_invisible_glyph(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_buffer_get_language(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_buffer_get_length(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_buffer_get_replacement_codepoint(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_buffer_get_script(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): hb_script_t;

declare function hb_buffer_get_segment_properties(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, props: interop.Pointer | interop.Reference<hb_segment_properties_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_buffer_get_unicode_funcs(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_buffer_get_user_data(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_buffer_guess_segment_properties(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_buffer_has_positions(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_buffer_normalize_glyphs(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_buffer_pre_allocate(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): number;

declare function hb_buffer_reference(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_buffer_reset(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_buffer_reverse(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_buffer_reverse_clusters(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_buffer_reverse_range(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start: number, end: number): void;

declare function hb_buffer_serialize(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start: number, end: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf_size: number, buf_consumed: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, format: hb_buffer_serialize_format_t, flags: hb_buffer_serialize_flags_t): number;

declare const enum hb_buffer_serialize_flags_t {

	DEFAULT = 0,

	NO_CLUSTERS = 1,

	NO_POSITIONS = 2,

	NO_GLYPH_NAMES = 4,

	GLYPH_EXTENTS = 8,

	GLYPH_FLAGS = 16,

	NO_ADVANCES = 32
}

declare function hb_buffer_serialize_format_from_string(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): hb_buffer_serialize_format_t;

declare const enum hb_buffer_serialize_format_t {

	TEXT = 1413830740,

	JSON = 1246973774,

	INVALID = 0
}

declare function hb_buffer_serialize_format_to_string(format: hb_buffer_serialize_format_t): string | null;

declare function hb_buffer_serialize_glyphs(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start: number, end: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf_size: number, buf_consumed: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, format: hb_buffer_serialize_format_t, flags: hb_buffer_serialize_flags_t): number;

declare function hb_buffer_serialize_list_formats(): interop.Pointer | interop.Reference<string | null> | null;

declare function hb_buffer_serialize_unicode(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start: number, end: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buf_size: number, buf_consumed: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, format: hb_buffer_serialize_format_t, flags: hb_buffer_serialize_flags_t): number;

declare function hb_buffer_set_cluster_level(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, cluster_level: hb_buffer_cluster_level_t): void;

declare function hb_buffer_set_content_type(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, content_type: hb_buffer_content_type_t): void;

declare function hb_buffer_set_direction(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, direction: hb_direction_t): void;

declare function hb_buffer_set_flags(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, flags: hb_buffer_flags_t): void;

declare function hb_buffer_set_invisible_glyph(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, invisible: number): void;

declare function hb_buffer_set_language(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_buffer_set_length(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number): number;

declare function hb_buffer_set_message_func(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: string | null, p4: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_buffer_set_replacement_codepoint(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, replacement: number): void;

declare function hb_buffer_set_script(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, script: hb_script_t): void;

declare function hb_buffer_set_segment_properties(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, props: interop.Pointer | interop.Reference<hb_segment_properties_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_buffer_set_unicode_funcs(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, unicode_funcs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_buffer_set_user_data(buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, replace: number): number;

declare function hb_color_get_alpha(color: number): number;

declare function hb_color_get_blue(color: number): number;

declare function hb_color_get_green(color: number): number;

declare function hb_color_get_red(color: number): number;

declare function hb_direction_from_string(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): hb_direction_t;

declare const enum hb_direction_t {

	INVALID = 0,

	LTR = 4,

	RTL = 5,

	TTB = 6,

	BTT = 7
}

declare function hb_direction_to_string(direction: hb_direction_t): string | null;

declare function hb_face_builder_add_table(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tag: number, blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_face_builder_create(): interop.Pointer | interop.Reference<any> | null;

declare function hb_face_collect_unicodes(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, out: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_face_collect_variation_selectors(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, out: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_face_collect_variation_unicodes(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, variation_selector: number, out: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_face_count(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_face_create(blob: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index: number): interop.Pointer | interop.Reference<any> | null;

declare function hb_face_create_for_tables(reference_table_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => interop.Pointer | interop.Reference<any> | null>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): interop.Pointer | interop.Reference<any> | null;

declare function hb_face_destroy(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_face_get_empty(): interop.Pointer | interop.Reference<any> | null;

declare function hb_face_get_glyph_count(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_face_get_index(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_face_get_table_tags(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start_offset: number, table_count: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, table_tags: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_face_get_upem(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_face_get_user_data(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_face_is_immutable(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_face_make_immutable(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_face_reference(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_face_reference_blob(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_face_reference_table(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tag: number): interop.Pointer | interop.Reference<any> | null;

declare function hb_face_set_glyph_count(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph_count: number): void;

declare function hb_face_set_index(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index: number): void;

declare function hb_face_set_upem(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, upem: number): void;

declare function hb_face_set_user_data(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, replace: number): number;

declare function hb_feature_from_string(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number, feature: interop.Pointer | interop.Reference<hb_feature_t> | ArrayBufferLike | ArrayBufferView | null): number;

interface hb_feature_t {
	tag: number;
	value: number;
	start: number;
	end: number;
}
declare var hb_feature_t: interop.StructType<hb_feature_t>;

declare function hb_feature_to_string(feature: interop.Pointer | interop.Reference<hb_feature_t> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

declare function hb_font_add_glyph_origin_for_direction(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, direction: hb_direction_t, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_create(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_create_sub_font(parent: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_destroy(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

interface hb_font_extents_t {
	ascender: number;
	descender: number;
	line_gap: number;
	reserved9: number;
	reserved8: number;
	reserved7: number;
	reserved6: number;
	reserved5: number;
	reserved4: number;
	reserved3: number;
	reserved2: number;
	reserved1: number;
}
declare var hb_font_extents_t: interop.StructType<hb_font_extents_t>;

declare function hb_font_funcs_create(): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_funcs_destroy(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_funcs_get_empty(): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_funcs_get_user_data(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_funcs_is_immutable(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_funcs_make_immutable(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_funcs_reference(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_funcs_set_font_h_extents_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<hb_font_extents_t> | null, p4: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_font_v_extents_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<hb_font_extents_t> | null, p4: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_contour_point_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number, p5: interop.Pointer | interop.Reference<number> | null, p6: interop.Pointer | interop.Reference<number> | null, p7: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_extents_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<hb_glyph_extents_t> | null, p5: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_from_name_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: string | null, p4: number, p5: interop.Pointer | interop.Reference<number> | null, p6: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number, p5: interop.Pointer | interop.Reference<number> | null, p6: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_h_advance_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_h_advances_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<number> | null, p5: number, p6: interop.Pointer | interop.Reference<number> | null, p7: number, p8: interop.Pointer | interop.Reference<any> | null) => void>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_h_kerning_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number, p5: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_h_origin_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<number> | null, p5: interop.Pointer | interop.Reference<number> | null, p6: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_name_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null, p5: number, p6: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_v_advance_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_v_advances_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<number> | null, p5: number, p6: interop.Pointer | interop.Reference<number> | null, p7: number, p8: interop.Pointer | interop.Reference<any> | null) => void>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_v_kerning_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number, p5: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_glyph_v_origin_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<number> | null, p5: interop.Pointer | interop.Reference<number> | null, p6: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_nominal_glyph_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<number> | null, p5: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_nominal_glyphs_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Pointer | interop.Reference<number> | null, p5: number, p6: interop.Pointer | interop.Reference<number> | null, p7: number, p8: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_funcs_set_user_data(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, replace: number): number;

declare function hb_font_funcs_set_variation_glyph_func(ffuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: number, p5: interop.Pointer | interop.Reference<number> | null, p6: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_get_empty(): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_get_extents_for_direction(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, direction: hb_direction_t, extents: interop.Pointer | interop.Reference<hb_font_extents_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_get_face(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_get_glyph(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, unicode: number, variation_selector: number, glyph: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_glyph_advance_for_direction(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, direction: hb_direction_t, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_get_glyph_advances_for_direction(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, direction: hb_direction_t, count: number, first_glyph: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, glyph_stride: number, first_advance: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, advance_stride: number): void;

declare function hb_font_get_glyph_contour_point(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, point_index: number, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_glyph_contour_point_for_origin(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, point_index: number, direction: hb_direction_t, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_glyph_extents(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, extents: interop.Pointer | interop.Reference<hb_glyph_extents_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_glyph_extents_for_origin(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, direction: hb_direction_t, extents: interop.Pointer | interop.Reference<hb_glyph_extents_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_glyph_from_name(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number, glyph: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_glyph_h_advance(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number): number;

declare function hb_font_get_glyph_h_advances(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, count: number, first_glyph: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, glyph_stride: number, first_advance: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, advance_stride: number): void;

declare function hb_font_get_glyph_h_kerning(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, left_glyph: number, right_glyph: number): number;

declare function hb_font_get_glyph_h_origin(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_glyph_kerning_for_direction(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, first_glyph: number, second_glyph: number, direction: hb_direction_t, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_get_glyph_name(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): number;

declare function hb_font_get_glyph_origin_for_direction(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, direction: hb_direction_t, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_get_glyph_v_advance(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number): number;

declare function hb_font_get_glyph_v_advances(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, count: number, first_glyph: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, glyph_stride: number, first_advance: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, advance_stride: number): void;

declare function hb_font_get_glyph_v_kerning(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, top_glyph: number, bottom_glyph: number): number;

declare function hb_font_get_glyph_v_origin(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_h_extents(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extents: interop.Pointer | interop.Reference<hb_font_extents_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_nominal_glyph(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, unicode: number, glyph: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_nominal_glyphs(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, count: number, first_unicode: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, unicode_stride: number, first_glyph: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, glyph_stride: number): number;

declare function hb_font_get_parent(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_get_ppem(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x_ppem: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y_ppem: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_get_ptem(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_scale(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x_scale: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y_scale: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_get_user_data(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_get_v_extents(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extents: interop.Pointer | interop.Reference<hb_font_extents_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_get_var_coords_normalized(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function hb_font_get_variation_glyph(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, unicode: number, variation_selector: number, glyph: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_glyph_from_string(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number, glyph: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_glyph_to_string(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, s: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

declare function hb_font_is_immutable(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_font_make_immutable(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_reference(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_font_set_face(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_set_funcs(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, klass: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, font_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_set_funcs_data(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, font_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_font_set_parent(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, parent: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_font_set_ppem(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x_ppem: number, y_ppem: number): void;

declare function hb_font_set_ptem(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ptem: number): void;

declare function hb_font_set_scale(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x_scale: number, y_scale: number): void;

declare function hb_font_set_user_data(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, replace: number): number;

declare function hb_font_set_var_coords_design(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, coords: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, coords_length: number): void;

declare function hb_font_set_var_coords_normalized(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, coords: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, coords_length: number): void;

declare function hb_font_set_var_named_instance(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, instance_index: number): void;

declare function hb_font_set_variations(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, variations: interop.Pointer | interop.Reference<hb_variation_t> | ArrayBufferLike | ArrayBufferView | null, variations_length: number): void;

declare function hb_font_subtract_glyph_origin_for_direction(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyph: number, direction: hb_direction_t, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

interface hb_glyph_extents_t {
	x_bearing: number;
	y_bearing: number;
	width: number;
	height: number;
}
declare var hb_glyph_extents_t: interop.StructType<hb_glyph_extents_t>;

declare const enum hb_glyph_flags_t {

	UNSAFE_TO_BREAK = 1,

	DEFINED = 1
}

declare function hb_glyph_info_get_glyph_flags(info: interop.Pointer | interop.Reference<hb_glyph_info_t> | ArrayBufferLike | ArrayBufferView | null): hb_glyph_flags_t;

interface hb_glyph_info_t {
	codepoint: number;
	mask: number;
	cluster: number;
	var1: hb_var_int_t;
	var2: hb_var_int_t;
}
declare var hb_glyph_info_t: interop.StructType<hb_glyph_info_t>;

interface hb_glyph_position_t {
	x_advance: number;
	y_advance: number;
	x_offset: number;
	y_offset: number;
	var: hb_var_int_t;
}
declare var hb_glyph_position_t: interop.StructType<hb_glyph_position_t>;

declare function hb_language_from_string(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): interop.Pointer | interop.Reference<any> | null;

declare function hb_language_get_default(): interop.Pointer | interop.Reference<any> | null;

declare function hb_language_to_string(language: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function hb_map_allocation_successful(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_map_clear(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_map_create(): interop.Pointer | interop.Reference<any> | null;

declare function hb_map_del(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: number): void;

declare function hb_map_destroy(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_map_get(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: number): number;

declare function hb_map_get_empty(): interop.Pointer | interop.Reference<any> | null;

declare function hb_map_get_population(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_map_get_user_data(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_map_has(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: number): number;

declare function hb_map_is_empty(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_map_reference(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_map_set(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: number, value: number): void;

declare function hb_map_set_user_data(map: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, replace: number): number;

declare const enum hb_memory_mode_t {

	DUPLICATE = 0,

	READONLY = 1,

	WRITABLE = 2,

	READONLY_MAY_MAKE_WRITABLE = 3
}

declare function hb_script_from_iso15924_tag(tag: number): hb_script_t;

declare function hb_script_from_string(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): hb_script_t;

declare function hb_script_get_horizontal_direction(script: hb_script_t): hb_direction_t;

declare const enum hb_script_t {

	HB_SCRIPT_COMMON = 1517910393,

	HB_SCRIPT_INHERITED = 1516858984,

	HB_SCRIPT_UNKNOWN = 1517976186,

	HB_SCRIPT_ARABIC = 1098015074,

	HB_SCRIPT_ARMENIAN = 1098018158,

	HB_SCRIPT_BENGALI = 1113943655,

	HB_SCRIPT_CYRILLIC = 1132032620,

	HB_SCRIPT_DEVANAGARI = 1147500129,

	HB_SCRIPT_GEORGIAN = 1197830002,

	HB_SCRIPT_GREEK = 1198679403,

	HB_SCRIPT_GUJARATI = 1198877298,

	HB_SCRIPT_GURMUKHI = 1198879349,

	HB_SCRIPT_HANGUL = 1214344807,

	HB_SCRIPT_HAN = 1214344809,

	HB_SCRIPT_HEBREW = 1214603890,

	HB_SCRIPT_HIRAGANA = 1214870113,

	HB_SCRIPT_KANNADA = 1265525857,

	HB_SCRIPT_KATAKANA = 1264676449,

	HB_SCRIPT_LAO = 1281453935,

	HB_SCRIPT_LATIN = 1281455214,

	HB_SCRIPT_MALAYALAM = 1298954605,

	HB_SCRIPT_ORIYA = 1332902241,

	HB_SCRIPT_TAMIL = 1415671148,

	HB_SCRIPT_TELUGU = 1415933045,

	HB_SCRIPT_THAI = 1416126825,

	HB_SCRIPT_TIBETAN = 1416192628,

	HB_SCRIPT_BOPOMOFO = 1114599535,

	HB_SCRIPT_BRAILLE = 1114792297,

	HB_SCRIPT_CANADIAN_SYLLABICS = 1130458739,

	HB_SCRIPT_CHEROKEE = 1130915186,

	HB_SCRIPT_ETHIOPIC = 1165256809,

	HB_SCRIPT_KHMER = 1265134962,

	HB_SCRIPT_MONGOLIAN = 1299148391,

	HB_SCRIPT_MYANMAR = 1299803506,

	HB_SCRIPT_OGHAM = 1332175213,

	HB_SCRIPT_RUNIC = 1383427698,

	HB_SCRIPT_SINHALA = 1399418472,

	HB_SCRIPT_SYRIAC = 1400468067,

	HB_SCRIPT_THAANA = 1416126817,

	HB_SCRIPT_YI = 1500080489,

	HB_SCRIPT_DESERET = 1148416628,

	HB_SCRIPT_GOTHIC = 1198486632,

	HB_SCRIPT_OLD_ITALIC = 1232363884,

	HB_SCRIPT_BUHID = 1114990692,

	HB_SCRIPT_HANUNOO = 1214344815,

	HB_SCRIPT_TAGALOG = 1416064103,

	HB_SCRIPT_TAGBANWA = 1415669602,

	HB_SCRIPT_CYPRIOT = 1131442804,

	HB_SCRIPT_LIMBU = 1281977698,

	HB_SCRIPT_LINEAR_B = 1281977954,

	HB_SCRIPT_OSMANYA = 1332964705,

	HB_SCRIPT_SHAVIAN = 1399349623,

	HB_SCRIPT_TAI_LE = 1415670885,

	HB_SCRIPT_UGARITIC = 1432838514,

	HB_SCRIPT_BUGINESE = 1114990441,

	HB_SCRIPT_COPTIC = 1131376756,

	HB_SCRIPT_GLAGOLITIC = 1198285159,

	HB_SCRIPT_KHAROSHTHI = 1265131890,

	HB_SCRIPT_NEW_TAI_LUE = 1415670901,

	HB_SCRIPT_OLD_PERSIAN = 1483761007,

	HB_SCRIPT_SYLOTI_NAGRI = 1400466543,

	HB_SCRIPT_TIFINAGH = 1415999079,

	HB_SCRIPT_BALINESE = 1113681001,

	HB_SCRIPT_CUNEIFORM = 1483961720,

	HB_SCRIPT_NKO = 1315663727,

	HB_SCRIPT_PHAGS_PA = 1349017959,

	HB_SCRIPT_PHOENICIAN = 1349021304,

	HB_SCRIPT_CARIAN = 1130459753,

	HB_SCRIPT_CHAM = 1130914157,

	HB_SCRIPT_KAYAH_LI = 1264675945,

	HB_SCRIPT_LEPCHA = 1281716323,

	HB_SCRIPT_LYCIAN = 1283023721,

	HB_SCRIPT_LYDIAN = 1283023977,

	HB_SCRIPT_OL_CHIKI = 1332503403,

	HB_SCRIPT_REJANG = 1382706791,

	HB_SCRIPT_SAURASHTRA = 1398895986,

	HB_SCRIPT_SUNDANESE = 1400204900,

	HB_SCRIPT_VAI = 1449224553,

	HB_SCRIPT_AVESTAN = 1098281844,

	HB_SCRIPT_BAMUM = 1113681269,

	HB_SCRIPT_EGYPTIAN_HIEROGLYPHS = 1164409200,

	HB_SCRIPT_IMPERIAL_ARAMAIC = 1098018153,

	HB_SCRIPT_INSCRIPTIONAL_PAHLAVI = 1349020777,

	HB_SCRIPT_INSCRIPTIONAL_PARTHIAN = 1349678185,

	HB_SCRIPT_JAVANESE = 1247901281,

	HB_SCRIPT_KAITHI = 1265920105,

	HB_SCRIPT_LISU = 1281979253,

	HB_SCRIPT_MEETEI_MAYEK = 1299473769,

	HB_SCRIPT_OLD_SOUTH_ARABIAN = 1398895202,

	HB_SCRIPT_OLD_TURKIC = 1332898664,

	HB_SCRIPT_SAMARITAN = 1398893938,

	HB_SCRIPT_TAI_THAM = 1281453665,

	HB_SCRIPT_TAI_VIET = 1415673460,

	HB_SCRIPT_BATAK = 1113683051,

	HB_SCRIPT_BRAHMI = 1114792296,

	HB_SCRIPT_MANDAIC = 1298230884,

	HB_SCRIPT_CHAKMA = 1130457965,

	HB_SCRIPT_MEROITIC_CURSIVE = 1298494051,

	HB_SCRIPT_MEROITIC_HIEROGLYPHS = 1298494063,

	HB_SCRIPT_MIAO = 1349284452,

	HB_SCRIPT_SHARADA = 1399353956,

	HB_SCRIPT_SORA_SOMPENG = 1399812705,

	HB_SCRIPT_TAKRI = 1415670642,

	HB_SCRIPT_BASSA_VAH = 1113682803,

	HB_SCRIPT_CAUCASIAN_ALBANIAN = 1097295970,

	HB_SCRIPT_DUPLOYAN = 1148547180,

	HB_SCRIPT_ELBASAN = 1164730977,

	HB_SCRIPT_GRANTHA = 1198678382,

	HB_SCRIPT_KHOJKI = 1265135466,

	HB_SCRIPT_KHUDAWADI = 1399418468,

	HB_SCRIPT_LINEAR_A = 1281977953,

	HB_SCRIPT_MAHAJANI = 1298229354,

	HB_SCRIPT_MANICHAEAN = 1298230889,

	HB_SCRIPT_MENDE_KIKAKUI = 1298493028,

	HB_SCRIPT_MODI = 1299145833,

	HB_SCRIPT_MRO = 1299345263,

	HB_SCRIPT_NABATAEAN = 1315070324,

	HB_SCRIPT_OLD_NORTH_ARABIAN = 1315009122,

	HB_SCRIPT_OLD_PERMIC = 1348825709,

	HB_SCRIPT_PAHAWH_HMONG = 1215131239,

	HB_SCRIPT_PALMYRENE = 1348562029,

	HB_SCRIPT_PAU_CIN_HAU = 1348564323,

	HB_SCRIPT_PSALTER_PAHLAVI = 1349020784,

	HB_SCRIPT_SIDDHAM = 1399415908,

	HB_SCRIPT_TIRHUTA = 1416196712,

	HB_SCRIPT_WARANG_CITI = 1466004065,

	HB_SCRIPT_AHOM = 1097363309,

	HB_SCRIPT_ANATOLIAN_HIEROGLYPHS = 1215067511,

	HB_SCRIPT_HATRAN = 1214346354,

	HB_SCRIPT_MULTANI = 1299541108,

	HB_SCRIPT_OLD_HUNGARIAN = 1215655527,

	HB_SCRIPT_SIGNWRITING = 1399287415,

	HB_SCRIPT_ADLAM = 1097100397,

	HB_SCRIPT_BHAIKSUKI = 1114139507,

	HB_SCRIPT_MARCHEN = 1298231907,

	HB_SCRIPT_OSAGE = 1332963173,

	HB_SCRIPT_TANGUT = 1415671399,

	HB_SCRIPT_NEWA = 1315272545,

	HB_SCRIPT_MASARAM_GONDI = 1198485101,

	HB_SCRIPT_NUSHU = 1316186229,

	HB_SCRIPT_SOYOMBO = 1399814511,

	HB_SCRIPT_ZANABAZAR_SQUARE = 1516334690,

	HB_SCRIPT_DOGRA = 1148151666,

	HB_SCRIPT_GUNJALA_GONDI = 1198485095,

	HB_SCRIPT_HANIFI_ROHINGYA = 1383032935,

	HB_SCRIPT_MAKASAR = 1298230113,

	HB_SCRIPT_MEDEFAIDRIN = 1298490470,

	HB_SCRIPT_OLD_SOGDIAN = 1399809903,

	HB_SCRIPT_SOGDIAN = 1399809892,

	HB_SCRIPT_ELYMAIC = 1164736877,

	HB_SCRIPT_NANDINAGARI = 1315008100,

	HB_SCRIPT_NYIAKENG_PUACHUE_HMONG = 1215131248,

	HB_SCRIPT_WANCHO = 1466132591,

	HB_SCRIPT_CHORASMIAN = 1130918515,

	HB_SCRIPT_DIVES_AKURU = 1147756907,

	HB_SCRIPT_KHITAN_SMALL_SCRIPT = 1265202291,

	HB_SCRIPT_YEZIDI = 1499822697,

	HB_SCRIPT_INVALID = 0,

	_HB_SCRIPT_MAX_VALUE = 2147483647,

	_HB_SCRIPT_MAX_VALUE_SIGNED = 2147483647
}

declare function hb_script_to_iso15924_tag(script: hb_script_t): number;

declare function hb_segment_properties_equal(a: interop.Pointer | interop.Reference<hb_segment_properties_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<hb_segment_properties_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_segment_properties_hash(p: interop.Pointer | interop.Reference<hb_segment_properties_t> | ArrayBufferLike | ArrayBufferView | null): number;

interface hb_segment_properties_t {
	direction: hb_direction_t;
	script: hb_script_t;
	language: interop.Pointer | interop.Reference<any> | null;
	reserved1: interop.Pointer | interop.Reference<any> | null;
	reserved2: interop.Pointer | interop.Reference<any> | null;
}
declare var hb_segment_properties_t: interop.StructType<hb_segment_properties_t>;

declare function hb_set_add(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, codepoint: number): void;

declare function hb_set_add_range(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, first: number, last: number): void;

declare function hb_set_allocation_successful(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_clear(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_set_create(): interop.Pointer | interop.Reference<any> | null;

declare function hb_set_del(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, codepoint: number): void;

declare function hb_set_del_range(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, first: number, last: number): void;

declare function hb_set_destroy(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_set_get_empty(): interop.Pointer | interop.Reference<any> | null;

declare function hb_set_get_max(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_get_min(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_get_population(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_get_user_data(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_set_has(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, codepoint: number): number;

declare function hb_set_intersect(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_set_invert(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_set_is_empty(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_is_equal(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_is_subset(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, larger_set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_next(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, codepoint: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_next_range(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, first: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, last: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_previous(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, codepoint: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_previous_range(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, first: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, last: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_set_reference(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_set_set(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_set_set_user_data(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, replace: number): number;

declare function hb_set_subtract(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_set_symmetric_difference(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_set_union(set: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_shape(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, features: interop.Pointer | interop.Reference<hb_feature_t> | ArrayBufferLike | ArrayBufferView | null, num_features: number): void;

declare function hb_shape_full(font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, features: interop.Pointer | interop.Reference<hb_feature_t> | ArrayBufferLike | ArrayBufferView | null, num_features: number, shaper_list: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_shape_list_shapers(): interop.Pointer | interop.Reference<string | null> | null;

declare function hb_shape_plan_create(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, props: interop.Pointer | interop.Reference<hb_segment_properties_t> | ArrayBufferLike | ArrayBufferView | null, user_features: interop.Pointer | interop.Reference<hb_feature_t> | ArrayBufferLike | ArrayBufferView | null, num_user_features: number, shaper_list: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_shape_plan_create2(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, props: interop.Pointer | interop.Reference<hb_segment_properties_t> | ArrayBufferLike | ArrayBufferView | null, user_features: interop.Pointer | interop.Reference<hb_feature_t> | ArrayBufferLike | ArrayBufferView | null, num_user_features: number, coords: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, num_coords: number, shaper_list: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_shape_plan_create_cached(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, props: interop.Pointer | interop.Reference<hb_segment_properties_t> | ArrayBufferLike | ArrayBufferView | null, user_features: interop.Pointer | interop.Reference<hb_feature_t> | ArrayBufferLike | ArrayBufferView | null, num_user_features: number, shaper_list: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_shape_plan_create_cached2(face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, props: interop.Pointer | interop.Reference<hb_segment_properties_t> | ArrayBufferLike | ArrayBufferView | null, user_features: interop.Pointer | interop.Reference<hb_feature_t> | ArrayBufferLike | ArrayBufferView | null, num_user_features: number, coords: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, num_coords: number, shaper_list: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_shape_plan_destroy(shape_plan: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_shape_plan_execute(shape_plan: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, features: interop.Pointer | interop.Reference<hb_feature_t> | ArrayBufferLike | ArrayBufferView | null, num_features: number): number;

declare function hb_shape_plan_get_empty(): interop.Pointer | interop.Reference<any> | null;

declare function hb_shape_plan_get_shaper(shape_plan: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function hb_shape_plan_get_user_data(shape_plan: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_shape_plan_reference(shape_plan: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_shape_plan_set_user_data(shape_plan: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, replace: number): number;

declare function hb_tag_from_string(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): number;

declare function hb_tag_to_string(tag: number, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_unicode_combining_class(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, unicode: number): hb_unicode_combining_class_t;

declare const enum hb_unicode_combining_class_t {

	NOT_REORDERED = 0,

	OVERLAY = 1,

	NUKTA = 7,

	KANA_VOICING = 8,

	VIRAMA = 9,

	CCC10 = 10,

	CCC11 = 11,

	CCC12 = 12,

	CCC13 = 13,

	CCC14 = 14,

	CCC15 = 15,

	CCC16 = 16,

	CCC17 = 17,

	CCC18 = 18,

	CCC19 = 19,

	CCC20 = 20,

	CCC21 = 21,

	CCC22 = 22,

	CCC23 = 23,

	CCC24 = 24,

	CCC25 = 25,

	CCC26 = 26,

	CCC27 = 27,

	CCC28 = 28,

	CCC29 = 29,

	CCC30 = 30,

	CCC31 = 31,

	CCC32 = 32,

	CCC33 = 33,

	CCC34 = 34,

	CCC35 = 35,

	CCC36 = 36,

	CCC84 = 84,

	CCC91 = 91,

	CCC103 = 103,

	CCC107 = 107,

	CCC118 = 118,

	CCC122 = 122,

	CCC129 = 129,

	CCC130 = 130,

	CCC133 = 132,

	ATTACHED_BELOW_LEFT = 200,

	ATTACHED_BELOW = 202,

	ATTACHED_ABOVE = 214,

	ATTACHED_ABOVE_RIGHT = 216,

	BELOW_LEFT = 218,

	BELOW = 220,

	BELOW_RIGHT = 222,

	LEFT = 224,

	RIGHT = 226,

	ABOVE_LEFT = 228,

	ABOVE = 230,

	ABOVE_RIGHT = 232,

	DOUBLE_BELOW = 233,

	DOUBLE_ABOVE = 234,

	IOTA_SUBSCRIPT = 240,

	INVALID = 255
}

declare function hb_unicode_compose(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, a: number, b: number, ab: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_unicode_decompose(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ab: number, a: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_unicode_decompose_compatibility(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, u: number, decomposed: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_unicode_eastasian_width(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, unicode: number): number;

declare function hb_unicode_funcs_create(parent: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_unicode_funcs_destroy(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_unicode_funcs_get_default(): interop.Pointer | interop.Reference<any> | null;

declare function hb_unicode_funcs_get_empty(): interop.Pointer | interop.Reference<any> | null;

declare function hb_unicode_funcs_get_parent(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_unicode_funcs_get_user_data(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_unicode_funcs_is_immutable(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function hb_unicode_funcs_make_immutable(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_unicode_funcs_reference(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function hb_unicode_funcs_set_combining_class_func(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => hb_unicode_combining_class_t>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_unicode_funcs_set_compose_func(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: number, p4: interop.Pointer | interop.Reference<number> | null, p5: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_unicode_funcs_set_decompose_compatibility_func(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<number> | null, p4: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_unicode_funcs_set_decompose_func(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<number> | null, p4: interop.Pointer | interop.Reference<number> | null, p5: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_unicode_funcs_set_eastasian_width_func(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_unicode_funcs_set_general_category_func(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => hb_unicode_general_category_t>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_unicode_funcs_set_mirroring_func(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_unicode_funcs_set_script_func(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null) => hb_script_t>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function hb_unicode_funcs_set_user_data(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<hb_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, replace: number): number;

declare function hb_unicode_general_category(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, unicode: number): hb_unicode_general_category_t;

declare const enum hb_unicode_general_category_t {

	CONTROL = 0,

	FORMAT = 1,

	UNASSIGNED = 2,

	PRIVATE_USE = 3,

	SURROGATE = 4,

	LOWERCASE_LETTER = 5,

	MODIFIER_LETTER = 6,

	OTHER_LETTER = 7,

	TITLECASE_LETTER = 8,

	UPPERCASE_LETTER = 9,

	SPACING_MARK = 10,

	ENCLOSING_MARK = 11,

	NON_SPACING_MARK = 12,

	DECIMAL_NUMBER = 13,

	LETTER_NUMBER = 14,

	OTHER_NUMBER = 15,

	CONNECT_PUNCTUATION = 16,

	DASH_PUNCTUATION = 17,

	CLOSE_PUNCTUATION = 18,

	FINAL_PUNCTUATION = 19,

	INITIAL_PUNCTUATION = 20,

	OTHER_PUNCTUATION = 21,

	OPEN_PUNCTUATION = 22,

	CURRENCY_SYMBOL = 23,

	MODIFIER_SYMBOL = 24,

	MATH_SYMBOL = 25,

	OTHER_SYMBOL = 26,

	LINE_SEPARATOR = 27,

	PARAGRAPH_SEPARATOR = 28,

	SPACE_SEPARATOR = 29
}

declare function hb_unicode_mirroring(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, unicode: number): number;

declare function hb_unicode_script(ufuncs: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, unicode: number): hb_script_t;

interface hb_user_data_key_t {
	unused: number;
}
declare var hb_user_data_key_t: interop.StructType<hb_user_data_key_t>;

interface hb_var_int_t {
	u32: number;
	i32: number;
	u16: interop.Reference<number>;
	i16: interop.Reference<number>;
	u8: interop.Reference<number>;
	i8: interop.Reference<number>;
}


declare function hb_variation_from_string(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number, variation: interop.Pointer | interop.Reference<hb_variation_t> | ArrayBufferLike | ArrayBufferView | null): number;

interface hb_variation_t {
	tag: number;
	value: number;
}
declare var hb_variation_t: interop.StructType<hb_variation_t>;

declare function hb_variation_to_string(variation: interop.Pointer | interop.Reference<hb_variation_t> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

declare function hb_version(major: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, minor: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, micro: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function hb_version_atleast(major: number, minor: number, micro: number): number;

declare function hb_version_string(): string | null;
