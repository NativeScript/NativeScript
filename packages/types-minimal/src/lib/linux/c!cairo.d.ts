
interface _cairo_path_data_t {
	header: { type: cairo_path_data_type_t; length: number; };
	point: { x: number; y: number; };
}


declare const enum cairo_antialias_t {

	DEFAULT = 0,

	NONE = 1,

	GRAY = 2,

	SUBPIXEL = 3,

	FAST = 4,

	GOOD = 5,

	BEST = 6
}

declare function cairo_append_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, path: interop.Pointer | interop.Reference<cairo_path_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_arc(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xc: number, yc: number, radius: number, angle1: number, angle2: number): void;

declare function cairo_arc_negative(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, xc: number, yc: number, radius: number, angle1: number, angle2: number): void;

declare function cairo_clip(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_clip_extents(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, x2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_clip_preserve(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_close_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare const enum cairo_content_t {

	COLOR = 4096,

	ALPHA = 8192,

	COLOR_ALPHA = 12288
}

declare function cairo_copy_clip_rectangle_list(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<cairo_rectangle_list_t> | null;

declare function cairo_copy_page(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_copy_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<cairo_path_t> | null;

declare function cairo_copy_path_flat(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<cairo_path_t> | null;

declare function cairo_create(target: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_curve_to(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

declare function cairo_debug_reset_static_data(): void;

declare function cairo_destroy(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_device_acquire(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_device_destroy(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_device_finish(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_device_flush(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_device_get_reference_count(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_device_get_type(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_device_type_t;

declare function cairo_device_get_user_data(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_device_observer_elapsed(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_device_observer_fill_elapsed(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_device_observer_glyphs_elapsed(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_device_observer_mask_elapsed(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_device_observer_paint_elapsed(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_device_observer_print(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, write_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: string | null, p3: number) => cairo_status_t>, closure: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_device_observer_stroke_elapsed(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_device_reference(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_device_release(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_device_set_user_data(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): cairo_status_t;

declare function cairo_device_status(device: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_device_to_user(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_device_to_user_distance(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dx: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, dy: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare const enum cairo_device_type_t {

	DRM = 0,

	GL = 1,

	SCRIPT = 2,

	XCB = 3,

	XLIB = 4,

	XML = 5,

	COGL = 6,

	WIN32 = 7,

	INVALID = -1
}

declare const enum cairo_extend_t {

	NONE = 0,

	REPEAT = 1,

	REFLECT = 2,

	PAD = 3
}

declare function cairo_fill(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_fill_extents(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, x2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_fill_preserve(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare const enum cairo_fill_rule_t {

	WINDING = 0,

	EVEN_ODD = 1
}

declare const enum cairo_filter_t {

	FAST = 0,

	GOOD = 1,

	BEST = 2,

	NEAREST = 3,

	BILINEAR = 4,

	GAUSSIAN = 5
}

declare function cairo_font_extents(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extents: interop.Pointer | interop.Reference<cairo_font_extents_t> | ArrayBufferLike | ArrayBufferView | null): void;

interface cairo_font_extents_t {
	ascent: number;
	descent: number;
	height: number;
	max_x_advance: number;
	max_y_advance: number;
}
declare var cairo_font_extents_t: interop.StructType<cairo_font_extents_t>;

declare function cairo_font_face_destroy(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_font_face_get_reference_count(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_font_face_get_type(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_font_type_t;

declare function cairo_font_face_get_user_data(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_font_face_reference(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_font_face_set_user_data(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): cairo_status_t;

declare function cairo_font_face_status(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_font_options_copy(original: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_font_options_create(): interop.Pointer | interop.Reference<any> | null;

declare function cairo_font_options_destroy(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_font_options_equal(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_font_options_get_antialias(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_antialias_t;

declare function cairo_font_options_get_hint_metrics(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_hint_metrics_t;

declare function cairo_font_options_get_hint_style(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_hint_style_t;

declare function cairo_font_options_get_subpixel_order(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_subpixel_order_t;

declare function cairo_font_options_get_variations(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function cairo_font_options_hash(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_font_options_merge(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_font_options_set_antialias(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, antialias: cairo_antialias_t): void;

declare function cairo_font_options_set_hint_metrics(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, hint_metrics: cairo_hint_metrics_t): void;

declare function cairo_font_options_set_hint_style(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, hint_style: cairo_hint_style_t): void;

declare function cairo_font_options_set_subpixel_order(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, subpixel_order: cairo_subpixel_order_t): void;

declare function cairo_font_options_set_variations(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, variations: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_font_options_status(options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare const enum cairo_font_slant_t {

	NORMAL = 0,

	ITALIC = 1,

	OBLIQUE = 2
}

declare const enum cairo_font_type_t {

	TOY = 0,

	FT = 1,

	WIN32 = 2,

	QUARTZ = 3,

	USER = 4
}

declare const enum cairo_font_weight_t {

	NORMAL = 0,

	BOLD = 1
}

declare function cairo_format_stride_for_width(format: cairo_format_t, width: number): number;

declare const enum cairo_format_t {

	INVALID = -1,

	ARGB32 = 0,

	RGB24 = 1,

	A8 = 2,

	A1 = 3,

	RGB16_565 = 4,

	RGB30 = 5
}

declare function cairo_get_antialias(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_antialias_t;

declare function cairo_get_current_point(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_get_dash(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dashes: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, offset: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_get_dash_count(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_get_fill_rule(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_fill_rule_t;

declare function cairo_get_font_face(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_get_font_matrix(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_get_font_options(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_get_group_target(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_get_line_cap(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_line_cap_t;

declare function cairo_get_line_join(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_line_join_t;

declare function cairo_get_line_width(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_get_matrix(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_get_miter_limit(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_get_operator(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_operator_t;

declare function cairo_get_reference_count(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_get_scaled_font(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_get_source(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_get_target(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_get_tolerance(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_get_user_data(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_glyph_allocate(num_glyphs: number): interop.Pointer | interop.Reference<cairo_glyph_t> | null;

declare function cairo_glyph_extents(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<cairo_glyph_t> | ArrayBufferLike | ArrayBufferView | null, num_glyphs: number, extents: interop.Pointer | interop.Reference<cairo_text_extents_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_glyph_free(glyphs: interop.Pointer | interop.Reference<cairo_glyph_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_glyph_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<cairo_glyph_t> | ArrayBufferLike | ArrayBufferView | null, num_glyphs: number): void;

interface cairo_glyph_t {
	index: number;
	x: number;
	y: number;
}
declare var cairo_glyph_t: interop.StructType<cairo_glyph_t>;

declare function cairo_has_current_point(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare const enum cairo_hint_metrics_t {

	DEFAULT = 0,

	OFF = 1,

	ON = 2
}

declare const enum cairo_hint_style_t {

	DEFAULT = 0,

	NONE = 1,

	SLIGHT = 2,

	MEDIUM = 3,

	FULL = 4
}

declare function cairo_identity_matrix(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_image_surface_create(format: cairo_format_t, width: number, height: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_image_surface_create_for_data(data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, format: cairo_format_t, width: number, height: number, stride: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_image_surface_create_from_png(filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_image_surface_create_from_png_stream(read_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number) => cairo_status_t>, closure: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_image_surface_get_data(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_image_surface_get_format(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_format_t;

declare function cairo_image_surface_get_height(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_image_surface_get_stride(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_image_surface_get_width(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_in_clip(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): number;

declare function cairo_in_fill(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): number;

declare function cairo_in_stroke(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): number;

declare const enum cairo_line_cap_t {

	BUTT = 0,

	ROUND = 1,

	SQUARE = 2
}

declare const enum cairo_line_join_t {

	MITER = 0,

	ROUND = 1,

	BEVEL = 2
}

declare function cairo_line_to(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): void;

declare function cairo_mask(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_mask_surface(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, surface_x: number, surface_y: number): void;

declare function cairo_matrix_init(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, xx: number, yx: number, xy: number, yy: number, x0: number, y0: number): void;

declare function cairo_matrix_init_identity(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_matrix_init_rotate(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, radians: number): void;

declare function cairo_matrix_init_scale(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, sx: number, sy: number): void;

declare function cairo_matrix_init_translate(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, tx: number, ty: number): void;

declare function cairo_matrix_invert(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_matrix_multiply(result: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, a: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_matrix_rotate(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, radians: number): void;

declare function cairo_matrix_scale(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, sx: number, sy: number): void;

interface cairo_matrix_t {
	xx: number;
	yx: number;
	xy: number;
	yy: number;
	x0: number;
	y0: number;
}
declare var cairo_matrix_t: interop.StructType<cairo_matrix_t>;

declare function cairo_matrix_transform_distance(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, dx: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, dy: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_matrix_transform_point(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_matrix_translate(matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, tx: number, ty: number): void;

declare function cairo_mesh_pattern_begin_patch(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_mesh_pattern_curve_to(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

declare function cairo_mesh_pattern_end_patch(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_mesh_pattern_get_control_point(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, patch_num: number, point_num: number, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_mesh_pattern_get_corner_color_rgba(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, patch_num: number, corner_num: number, red: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, green: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, blue: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, alpha: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_mesh_pattern_get_patch_count(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, count: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_mesh_pattern_get_path(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, patch_num: number): interop.Pointer | interop.Reference<cairo_path_t> | null;

declare function cairo_mesh_pattern_line_to(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): void;

declare function cairo_mesh_pattern_move_to(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): void;

declare function cairo_mesh_pattern_set_control_point(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, point_num: number, x: number, y: number): void;

declare function cairo_mesh_pattern_set_corner_color_rgb(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, corner_num: number, red: number, green: number, blue: number): void;

declare function cairo_mesh_pattern_set_corner_color_rgba(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, corner_num: number, red: number, green: number, blue: number, alpha: number): void;

declare function cairo_move_to(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): void;

declare function cairo_new_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_new_sub_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare const enum cairo_operator_t {

	CLEAR = 0,

	SOURCE = 1,

	OVER = 2,

	IN = 3,

	OUT = 4,

	ATOP = 5,

	DEST = 6,

	DEST_OVER = 7,

	DEST_IN = 8,

	DEST_OUT = 9,

	DEST_ATOP = 10,

	XOR = 11,

	ADD = 12,

	SATURATE = 13,

	MULTIPLY = 14,

	SCREEN = 15,

	OVERLAY = 16,

	DARKEN = 17,

	LIGHTEN = 18,

	COLOR_DODGE = 19,

	COLOR_BURN = 20,

	HARD_LIGHT = 21,

	SOFT_LIGHT = 22,

	DIFFERENCE = 23,

	EXCLUSION = 24,

	HSL_HUE = 25,

	HSL_SATURATION = 26,

	HSL_COLOR = 27,

	HSL_LUMINOSITY = 28
}

declare function cairo_paint(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_paint_with_alpha(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, alpha: number): void;

declare const enum cairo_path_data_type_t {

	MOVE_TO = 0,

	LINE_TO = 1,

	CURVE_TO = 2,

	CLOSE_PATH = 3
}

declare function cairo_path_destroy(path: interop.Pointer | interop.Reference<cairo_path_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_path_extents(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, x2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

interface cairo_path_t {
	status: cairo_status_t;
	data: interop.Pointer | interop.Reference<_cairo_path_data_t> | null;
	num_data: number;
}
declare var cairo_path_t: interop.StructType<cairo_path_t>;

declare function cairo_pattern_add_color_stop_rgb(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, offset: number, red: number, green: number, blue: number): void;

declare function cairo_pattern_add_color_stop_rgba(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, offset: number, red: number, green: number, blue: number, alpha: number): void;

declare function cairo_pattern_create_for_surface(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_pattern_create_linear(x0: number, y0: number, x1: number, y1: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_pattern_create_mesh(): interop.Pointer | interop.Reference<any> | null;

declare function cairo_pattern_create_radial(cx0: number, cy0: number, radius0: number, cx1: number, cy1: number, radius1: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_pattern_create_raster_source(user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, content: cairo_content_t, width: number, height: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_pattern_create_rgb(red: number, green: number, blue: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_pattern_create_rgba(red: number, green: number, blue: number, alpha: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_pattern_destroy(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_pattern_get_color_stop_count(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, count: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_pattern_get_color_stop_rgba(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index: number, offset: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, red: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, green: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, blue: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, alpha: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_pattern_get_extend(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_extend_t;

declare function cairo_pattern_get_filter(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_filter_t;

declare function cairo_pattern_get_linear_points(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x0: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y0: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, x1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_pattern_get_matrix(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_pattern_get_radial_circles(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x0: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y0: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, r0: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, x1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, r1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_pattern_get_reference_count(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_pattern_get_rgba(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, red: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, green: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, blue: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, alpha: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_pattern_get_surface(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, surface: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_pattern_get_type(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_pattern_type_t;

declare function cairo_pattern_get_user_data(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_pattern_reference(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_pattern_set_extend(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extend: cairo_extend_t): void;

declare function cairo_pattern_set_filter(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, filter: cairo_filter_t): void;

declare function cairo_pattern_set_matrix(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_pattern_set_user_data(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): cairo_status_t;

declare function cairo_pattern_status(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare const enum cairo_pattern_type_t {

	SOLID = 0,

	SURFACE = 1,

	LINEAR = 2,

	RADIAL = 3,

	MESH = 4,

	RASTER_SOURCE = 5
}

declare function cairo_pop_group(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_pop_group_to_source(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_push_group(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_push_group_with_content(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, content: cairo_content_t): void;

declare function cairo_raster_source_pattern_get_acquire(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, acquire: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | null) => interop.Pointer | interop.Reference<any> | null>> | ArrayBufferLike | ArrayBufferView | null, release: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_raster_source_pattern_get_callback_data(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_raster_source_pattern_get_copy(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => cairo_status_t>;

declare function cairo_raster_source_pattern_get_finish(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => void>;

declare function cairo_raster_source_pattern_get_snapshot(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => cairo_status_t>;

declare function cairo_raster_source_pattern_set_acquire(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, acquire: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | null) => interop.Pointer | interop.Reference<any> | null>, release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function cairo_raster_source_pattern_set_callback_data(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_raster_source_pattern_set_copy(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, copy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => cairo_status_t>): void;

declare function cairo_raster_source_pattern_set_finish(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, finish: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => void>): void;

declare function cairo_raster_source_pattern_set_snapshot(pattern: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, snapshot: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => cairo_status_t>): void;

declare function cairo_recording_surface_create(content: cairo_content_t, extents: interop.Pointer | interop.Reference<cairo_rectangle_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_recording_surface_get_extents(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extents: interop.Pointer | interop.Reference<cairo_rectangle_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_recording_surface_ink_extents(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x0: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y0: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, width: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, height: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_rectangle(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, width: number, height: number): void;

interface cairo_rectangle_int_t {
	x: number;
	y: number;
	width: number;
	height: number;
}
declare var cairo_rectangle_int_t: interop.StructType<cairo_rectangle_int_t>;

declare function cairo_rectangle_list_destroy(rectangle_list: interop.Pointer | interop.Reference<cairo_rectangle_list_t> | ArrayBufferLike | ArrayBufferView | null): void;

interface cairo_rectangle_list_t {
	status: cairo_status_t;
	rectangles: interop.Pointer | interop.Reference<cairo_rectangle_t> | null;
	num_rectangles: number;
}
declare var cairo_rectangle_list_t: interop.StructType<cairo_rectangle_list_t>;

interface cairo_rectangle_t {
	x: number;
	y: number;
	width: number;
	height: number;
}
declare var cairo_rectangle_t: interop.StructType<cairo_rectangle_t>;

declare function cairo_reference(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_region_contains_point(region: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): number;

declare function cairo_region_contains_rectangle(region: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, rectangle: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | ArrayBufferLike | ArrayBufferView | null): cairo_region_overlap_t;

declare function cairo_region_copy(original: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_region_create(): interop.Pointer | interop.Reference<any> | null;

declare function cairo_region_create_rectangle(rectangle: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_region_create_rectangles(rects: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | ArrayBufferLike | ArrayBufferView | null, count: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_region_destroy(region: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_region_equal(a: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_region_get_extents(region: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extents: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_region_get_rectangle(region: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, nth: number, rectangle: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_region_intersect(dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_region_intersect_rectangle(dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, rectangle: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_region_is_empty(region: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_region_num_rectangles(region: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare const enum cairo_region_overlap_t {

	IN = 0,

	OUT = 1,

	PART = 2
}

declare function cairo_region_reference(region: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_region_status(region: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_region_subtract(dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_region_subtract_rectangle(dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, rectangle: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_region_translate(region: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dx: number, dy: number): void;

declare function cairo_region_union(dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_region_union_rectangle(dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, rectangle: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_region_xor(dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_region_xor_rectangle(dst: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, rectangle: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_rel_curve_to(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dx1: number, dy1: number, dx2: number, dy2: number, dx3: number, dy3: number): void;

declare function cairo_rel_line_to(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dx: number, dy: number): void;

declare function cairo_rel_move_to(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dx: number, dy: number): void;

declare function cairo_reset_clip(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_restore(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_rotate(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, angle: number): void;

declare function cairo_save(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_scale(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, sx: number, sy: number): void;

declare function cairo_scaled_font_create(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, font_matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, ctm: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null, options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_scaled_font_destroy(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_scaled_font_extents(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extents: interop.Pointer | interop.Reference<cairo_font_extents_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_scaled_font_get_ctm(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ctm: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_scaled_font_get_font_face(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_scaled_font_get_font_matrix(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, font_matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_scaled_font_get_font_options(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_scaled_font_get_reference_count(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_scaled_font_get_scale_matrix(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, scale_matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_scaled_font_get_type(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_font_type_t;

declare function cairo_scaled_font_get_user_data(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_scaled_font_glyph_extents(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<cairo_glyph_t> | ArrayBufferLike | ArrayBufferView | null, num_glyphs: number, extents: interop.Pointer | interop.Reference<cairo_text_extents_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_scaled_font_reference(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_scaled_font_set_user_data(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): cairo_status_t;

declare function cairo_scaled_font_status(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_scaled_font_text_extents(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, utf8: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extents: interop.Pointer | interop.Reference<cairo_text_extents_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_scaled_font_text_to_glyphs(scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, utf8: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, utf8_len: number, glyphs: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<cairo_glyph_t> | null> | ArrayBufferLike | ArrayBufferView | null, num_glyphs: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, clusters: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<cairo_text_cluster_t> | null> | ArrayBufferLike | ArrayBufferView | null, num_clusters: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, cluster_flags: interop.Pointer | interop.Reference<cairo_text_cluster_flags_t> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_select_font_face(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, family: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, slant: cairo_font_slant_t, weight: cairo_font_weight_t): void;

declare function cairo_set_antialias(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, antialias: cairo_antialias_t): void;

declare function cairo_set_dash(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dashes: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, num_dashes: number, offset: number): void;

declare function cairo_set_fill_rule(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, fill_rule: cairo_fill_rule_t): void;

declare function cairo_set_font_face(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_set_font_matrix(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_set_font_options(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_set_font_size(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number): void;

declare function cairo_set_line_cap(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, line_cap: cairo_line_cap_t): void;

declare function cairo_set_line_join(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, line_join: cairo_line_join_t): void;

declare function cairo_set_line_width(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, width: number): void;

declare function cairo_set_matrix(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_set_miter_limit(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, limit: number): void;

declare function cairo_set_operator(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, op: cairo_operator_t): void;

declare function cairo_set_scaled_font(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, scaled_font: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_set_source(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, source: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_set_source_rgb(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, red: number, green: number, blue: number): void;

declare function cairo_set_source_rgba(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, red: number, green: number, blue: number, alpha: number): void;

declare function cairo_set_source_surface(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): void;

declare function cairo_set_tolerance(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tolerance: number): void;

declare function cairo_set_user_data(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): cairo_status_t;

declare function cairo_show_glyphs(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, glyphs: interop.Pointer | interop.Reference<cairo_glyph_t> | ArrayBufferLike | ArrayBufferView | null, num_glyphs: number): void;

declare function cairo_show_page(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_show_text(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, utf8: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_show_text_glyphs(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, utf8: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, utf8_len: number, glyphs: interop.Pointer | interop.Reference<cairo_glyph_t> | ArrayBufferLike | ArrayBufferView | null, num_glyphs: number, clusters: interop.Pointer | interop.Reference<cairo_text_cluster_t> | ArrayBufferLike | ArrayBufferView | null, num_clusters: number, cluster_flags: cairo_text_cluster_flags_t): void;

declare function cairo_status(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare const enum cairo_status_t {

	SUCCESS = 0,

	NO_MEMORY = 1,

	INVALID_RESTORE = 2,

	INVALID_POP_GROUP = 3,

	NO_CURRENT_POINT = 4,

	INVALID_MATRIX = 5,

	INVALID_STATUS = 6,

	NULL_POINTER = 7,

	INVALID_STRING = 8,

	INVALID_PATH_DATA = 9,

	READ_ERROR = 10,

	WRITE_ERROR = 11,

	SURFACE_FINISHED = 12,

	SURFACE_TYPE_MISMATCH = 13,

	PATTERN_TYPE_MISMATCH = 14,

	INVALID_CONTENT = 15,

	INVALID_FORMAT = 16,

	INVALID_VISUAL = 17,

	FILE_NOT_FOUND = 18,

	INVALID_DASH = 19,

	INVALID_DSC_COMMENT = 20,

	INVALID_INDEX = 21,

	CLIP_NOT_REPRESENTABLE = 22,

	TEMP_FILE_ERROR = 23,

	INVALID_STRIDE = 24,

	FONT_TYPE_MISMATCH = 25,

	USER_FONT_IMMUTABLE = 26,

	USER_FONT_ERROR = 27,

	NEGATIVE_COUNT = 28,

	INVALID_CLUSTERS = 29,

	INVALID_SLANT = 30,

	INVALID_WEIGHT = 31,

	INVALID_SIZE = 32,

	USER_FONT_NOT_IMPLEMENTED = 33,

	DEVICE_TYPE_MISMATCH = 34,

	DEVICE_ERROR = 35,

	INVALID_MESH_CONSTRUCTION = 36,

	DEVICE_FINISHED = 37,

	JBIG2_GLOBAL_MISSING = 38,

	PNG_ERROR = 39,

	FREETYPE_ERROR = 40,

	WIN32_GDI_ERROR = 41,

	TAG_ERROR = 42,

	LAST_STATUS = 43
}

declare function cairo_status_to_string(status: cairo_status_t): string | null;

declare function cairo_stroke(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_stroke_extents(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y1: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, x2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y2: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_stroke_preserve(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare const enum cairo_subpixel_order_t {

	DEFAULT = 0,

	RGB = 1,

	BGR = 2,

	VRGB = 3,

	VBGR = 4
}

declare function cairo_surface_copy_page(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_create_for_rectangle(target: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, width: number, height: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_surface_create_observer(target: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, mode: cairo_surface_observer_mode_t): interop.Pointer | interop.Reference<any> | null;

declare function cairo_surface_create_similar(other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, content: cairo_content_t, width: number, height: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_surface_create_similar_image(other: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, format: cairo_format_t, width: number, height: number): interop.Pointer | interop.Reference<any> | null;

declare function cairo_surface_destroy(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_finish(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_flush(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_get_content(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_content_t;

declare function cairo_surface_get_device(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_surface_get_device_offset(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x_offset: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y_offset: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_get_device_scale(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x_scale: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y_scale: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_get_fallback_resolution(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x_pixels_per_inch: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y_pixels_per_inch: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_get_font_options(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, options: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_get_mime_data(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, mime_type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null, length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_get_reference_count(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_surface_get_type(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_surface_type_t;

declare function cairo_surface_get_user_data(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_surface_has_show_text_glyphs(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function cairo_surface_map_to_image(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extents: interop.Pointer | interop.Reference<cairo_rectangle_int_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_surface_mark_dirty(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_mark_dirty_rectangle(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, width: number, height: number): void;

declare function cairo_surface_observer_add_fill_callback(abstract_surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_observer_add_finish_callback(abstract_surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_observer_add_flush_callback(abstract_surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_observer_add_glyphs_callback(abstract_surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_observer_add_mask_callback(abstract_surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_observer_add_paint_callback(abstract_surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_observer_add_stroke_callback(abstract_surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_observer_elapsed(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare const enum cairo_surface_observer_mode_t {

	NORMAL = 0,

	RECORD_OPERATIONS = 1
}

declare function cairo_surface_observer_print(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, write_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: string | null, p3: number) => cairo_status_t>, closure: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_reference(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function cairo_surface_set_device_offset(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x_offset: number, y_offset: number): void;

declare function cairo_surface_set_device_scale(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x_scale: number, y_scale: number): void;

declare function cairo_surface_set_fallback_resolution(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x_pixels_per_inch: number, y_pixels_per_inch: number): void;

declare function cairo_surface_set_mime_data(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, mime_type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: number, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>, closure: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_set_user_data(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: interop.Pointer | interop.Reference<cairo_user_data_key_t> | ArrayBufferLike | ArrayBufferView | null, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>): cairo_status_t;

declare function cairo_surface_show_page(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_status(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_supports_mime_type(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, mime_type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare const enum cairo_surface_type_t {

	IMAGE = 0,

	PDF = 1,

	PS = 2,

	XLIB = 3,

	XCB = 4,

	GLITZ = 5,

	QUARTZ = 6,

	WIN32 = 7,

	BEOS = 8,

	DIRECTFB = 9,

	SVG = 10,

	OS2 = 11,

	WIN32_PRINTING = 12,

	QUARTZ_IMAGE = 13,

	SCRIPT = 14,

	QT = 15,

	RECORDING = 16,

	VG = 17,

	GL = 18,

	DRM = 19,

	TEE = 20,

	XML = 21,

	SKIA = 22,

	SUBSURFACE = 23,

	COGL = 24
}

declare function cairo_surface_unmap_image(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, image: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_surface_write_to_png(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_surface_write_to_png_stream(surface: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, write_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: string | null, p3: number) => cairo_status_t>, closure: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_status_t;

declare function cairo_tag_begin(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tag_name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attributes: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_tag_end(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tag_name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_text_cluster_allocate(num_clusters: number): interop.Pointer | interop.Reference<cairo_text_cluster_t> | null;

declare const enum cairo_text_cluster_flags_t {

	CAIRO_TEXT_CLUSTER_FLAG_BACKWARD = 1
}

declare function cairo_text_cluster_free(clusters: interop.Pointer | interop.Reference<cairo_text_cluster_t> | ArrayBufferLike | ArrayBufferView | null): void;

interface cairo_text_cluster_t {
	num_bytes: number;
	num_glyphs: number;
}
declare var cairo_text_cluster_t: interop.StructType<cairo_text_cluster_t>;

declare function cairo_text_extents(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, utf8: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extents: interop.Pointer | interop.Reference<cairo_text_extents_t> | ArrayBufferLike | ArrayBufferView | null): void;

interface cairo_text_extents_t {
	x_bearing: number;
	y_bearing: number;
	width: number;
	height: number;
	x_advance: number;
	y_advance: number;
}
declare var cairo_text_extents_t: interop.StructType<cairo_text_extents_t>;

declare function cairo_text_path(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, utf8: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_toy_font_face_create(family: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, slant: cairo_font_slant_t, weight: cairo_font_weight_t): interop.Pointer | interop.Reference<any> | null;

declare function cairo_toy_font_face_get_family(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function cairo_toy_font_face_get_slant(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_font_slant_t;

declare function cairo_toy_font_face_get_weight(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): cairo_font_weight_t;

declare function cairo_transform(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, matrix: interop.Pointer | interop.Reference<cairo_matrix_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_translate(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, tx: number, ty: number): void;

interface cairo_user_data_key_t {
	unused: number;
}
declare var cairo_user_data_key_t: interop.StructType<cairo_user_data_key_t>;

declare function cairo_user_font_face_create(): interop.Pointer | interop.Reference<any> | null;

declare function cairo_user_font_face_get_init_func(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<cairo_font_extents_t> | null) => cairo_status_t>;

declare function cairo_user_font_face_get_render_glyph_func(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<cairo_text_extents_t> | null) => cairo_status_t>;

declare function cairo_user_font_face_get_text_to_glyphs_func(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: string | null, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<cairo_glyph_t> | null> | null, p5: interop.Pointer | interop.Reference<number> | null, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<cairo_text_cluster_t> | null> | null, p7: interop.Pointer | interop.Reference<number> | null, p8: interop.Pointer | interop.Reference<cairo_text_cluster_flags_t> | null) => cairo_status_t>;

declare function cairo_user_font_face_get_unicode_to_glyph_func(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<number> | null) => cairo_status_t>;

declare function cairo_user_font_face_set_init_func(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, init_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<cairo_font_extents_t> | null) => cairo_status_t>): void;

declare function cairo_user_font_face_set_render_glyph_func(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, render_glyph_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<cairo_text_extents_t> | null) => cairo_status_t>): void;

declare function cairo_user_font_face_set_text_to_glyphs_func(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, text_to_glyphs_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: string | null, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<cairo_glyph_t> | null> | null, p5: interop.Pointer | interop.Reference<number> | null, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<cairo_text_cluster_t> | null> | null, p7: interop.Pointer | interop.Reference<number> | null, p8: interop.Pointer | interop.Reference<cairo_text_cluster_flags_t> | null) => cairo_status_t>): void;

declare function cairo_user_font_face_set_unicode_to_glyph_func(font_face: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, unicode_to_glyph_func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: number, p3: interop.Pointer | interop.Reference<number> | null) => cairo_status_t>): void;

declare function cairo_user_to_device(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_user_to_device_distance(cr: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dx: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, dy: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function cairo_version(): number;

declare function cairo_version_string(): string | null;
