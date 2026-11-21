
declare const GDK_PIXBUF_MAJOR: number;

declare const GDK_PIXBUF_MICRO: number;

declare const GDK_PIXBUF_MINOR: number;

declare const GDK_PIXBUF_VERSION: string;

declare const GDK_PIXBUF_VERSION_MAX_ALLOWED: number;

declare const GDK_PIXBUF_VERSION_MIN_REQUIRED: number;

declare const enum GdkColorspace {

	GDK_COLORSPACE_RGB = 0
}

declare const enum GdkInterpType {

	NEAREST = 0,

	TILES = 1,

	BILINEAR = 2,

	HYPER = 3
}

declare const enum GdkPixbufAlphaMode {

	BILEVEL = 0,

	FULL = 1
}

declare const enum GdkPixbufError {

	CORRUPT_IMAGE = 0,

	INSUFFICIENT_MEMORY = 1,

	BAD_OPTION = 2,

	UNKNOWN_TYPE = 3,

	UNSUPPORTED_OPERATION = 4,

	FAILED = 5,

	INCOMPLETE_ANIMATION = 6
}

declare const enum GdkPixbufRotation {

	NONE = 0,

	COUNTERCLOCKWISE = 90,

	UPSIDEDOWN = 180,

	CLOCKWISE = 270
}

interface _GdkPixbufLoader {
	parent_instance: _GObject;
	priv: interop.Pointer | interop.Reference<any> | null;
}
declare var _GdkPixbufLoader: interop.StructType<_GdkPixbufLoader>;

interface _GdkPixbufLoaderClass {
	parent_class: _GObjectClass;
	size_prepared: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_GdkPixbufLoader> | null, p2: number, p3: number) => void>;
	area_prepared: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_GdkPixbufLoader> | null) => void>;
	area_updated: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_GdkPixbufLoader> | null, p2: number, p3: number, p4: number, p5: number) => void>;
	closed: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_GdkPixbufLoader> | null) => void>;
}
declare var _GdkPixbufLoaderClass: interop.StructType<_GdkPixbufLoaderClass>;

declare function gdk_colorspace_get_type(): number;

declare function gdk_interp_type_get_type(): number;

declare function gdk_pixbuf_add_alpha(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, substitute_color: number, r: number, g: number, b: number): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_alpha_mode_get_type(): number;

declare function gdk_pixbuf_animation_get_height(animation: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_animation_get_iter(animation: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, start_time: interop.Pointer | interop.Reference<_GTimeVal> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_animation_get_static_image(animation: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_animation_get_type(): number;

declare function gdk_pixbuf_animation_get_width(animation: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_animation_is_static_image(animation: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_animation_iter_advance(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, current_time: interop.Pointer | interop.Reference<_GTimeVal> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_animation_iter_get_delay_time(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_animation_iter_get_pixbuf(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_animation_iter_get_type(): number;

declare function gdk_pixbuf_animation_iter_on_currently_loading_frame(iter: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_animation_new_from_file(filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_animation_new_from_resource(resource_path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_animation_new_from_stream(stream: interop.Pointer | interop.Reference<_GInputStream> | ArrayBufferLike | ArrayBufferView | null, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_animation_new_from_stream_async(stream: interop.Pointer | interop.Reference<_GInputStream> | ArrayBufferLike | ArrayBufferView | null, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_GObject> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function gdk_pixbuf_animation_new_from_stream_finish(async_result: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_animation_ref(animation: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_animation_unref(animation: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function gdk_pixbuf_apply_embedded_orientation(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_calculate_rowstride(colorspace: GdkColorspace, has_alpha: number, bits_per_sample: number, width: number, height: number): number;

declare function gdk_pixbuf_composite(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest_x: number, dest_y: number, dest_width: number, dest_height: number, offset_x: number, offset_y: number, scale_x: number, scale_y: number, interp_type: GdkInterpType, overall_alpha: number): void;

declare function gdk_pixbuf_composite_color(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest_x: number, dest_y: number, dest_width: number, dest_height: number, offset_x: number, offset_y: number, scale_x: number, scale_y: number, interp_type: GdkInterpType, overall_alpha: number, check_x: number, check_y: number, check_size: number, color1: number, color2: number): void;

declare function gdk_pixbuf_composite_color_simple(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest_width: number, dest_height: number, interp_type: GdkInterpType, overall_alpha: number, check_size: number, color1: number, color2: number): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_copy(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_copy_area(src_pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, src_x: number, src_y: number, width: number, height: number, dest_pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest_x: number, dest_y: number): void;

declare function gdk_pixbuf_copy_options(src_pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest_pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_error_get_type(): number;

declare function gdk_pixbuf_error_quark(): number;

declare function gdk_pixbuf_fill(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pixel: number): void;

declare function gdk_pixbuf_flip(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, horizontal: number): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_format_copy(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_format_free(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function gdk_pixbuf_format_get_description(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_format_get_extensions(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

declare function gdk_pixbuf_format_get_license(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_format_get_mime_types(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

declare function gdk_pixbuf_format_get_name(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_format_get_type(): number;

declare function gdk_pixbuf_format_is_disabled(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_format_is_save_option_supported(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, option_key: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_format_is_scalable(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_format_is_writable(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_format_set_disabled(format: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, disabled: number): void;

declare function gdk_pixbuf_get_bits_per_sample(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_get_byte_length(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_get_colorspace(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): GdkColorspace;

declare function gdk_pixbuf_get_file_info(filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, width: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, height: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_get_file_info_async(filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_GObject> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function gdk_pixbuf_get_file_info_finish(async_result: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, width: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, height: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_get_formats(): interop.Pointer | interop.Reference<_GSList> | null;

declare function gdk_pixbuf_get_has_alpha(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_get_height(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_get_n_channels(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_get_option(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function gdk_pixbuf_get_options(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_get_pixels(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_get_pixels_with_length(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, length: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_get_rowstride(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_get_type(): number;

declare function gdk_pixbuf_get_width(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_init_modules(path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_loader_close(loader: interop.Pointer | interop.Reference<_GdkPixbufLoader> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_loader_get_animation(loader: interop.Pointer | interop.Reference<_GdkPixbufLoader> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_loader_get_format(loader: interop.Pointer | interop.Reference<_GdkPixbufLoader> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_loader_get_pixbuf(loader: interop.Pointer | interop.Reference<_GdkPixbufLoader> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_loader_get_type(): number;

declare function gdk_pixbuf_loader_new(): interop.Pointer | interop.Reference<_GdkPixbufLoader> | null;

declare function gdk_pixbuf_loader_new_with_mime_type(mime_type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_GdkPixbufLoader> | null;

declare function gdk_pixbuf_loader_new_with_type(image_type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_GdkPixbufLoader> | null;

declare function gdk_pixbuf_loader_set_size(loader: interop.Pointer | interop.Reference<_GdkPixbufLoader> | ArrayBufferLike | ArrayBufferView | null, width: number, height: number): void;

declare function gdk_pixbuf_loader_write(loader: interop.Pointer | interop.Reference<_GdkPixbufLoader> | ArrayBufferLike | ArrayBufferView | null, buf: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, count: number, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_loader_write_bytes(loader: interop.Pointer | interop.Reference<_GdkPixbufLoader> | ArrayBufferLike | ArrayBufferView | null, buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare var gdk_pixbuf_major_version: number;

declare var gdk_pixbuf_micro_version: number;

declare var gdk_pixbuf_minor_version: number;

declare function gdk_pixbuf_new(colorspace: GdkColorspace, has_alpha: number, bits_per_sample: number, width: number, height: number): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_bytes(data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, colorspace: GdkColorspace, has_alpha: number, bits_per_sample: number, width: number, height: number, rowstride: number): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_data(data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, colorspace: GdkColorspace, has_alpha: number, bits_per_sample: number, width: number, height: number, rowstride: number, destroy_fn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => void>, destroy_fn_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_file(filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_file_at_scale(filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, width: number, height: number, preserve_aspect_ratio: number, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_file_at_size(filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, width: number, height: number, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_inline(data_length: number, data: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, copy_pixels: number, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_resource(resource_path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_resource_at_scale(resource_path: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, width: number, height: number, preserve_aspect_ratio: number, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_stream(stream: interop.Pointer | interop.Reference<_GInputStream> | ArrayBufferLike | ArrayBufferView | null, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_stream_async(stream: interop.Pointer | interop.Reference<_GInputStream> | ArrayBufferLike | ArrayBufferView | null, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_GObject> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function gdk_pixbuf_new_from_stream_at_scale(stream: interop.Pointer | interop.Reference<_GInputStream> | ArrayBufferLike | ArrayBufferView | null, width: number, height: number, preserve_aspect_ratio: number, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_stream_at_scale_async(stream: interop.Pointer | interop.Reference<_GInputStream> | ArrayBufferLike | ArrayBufferView | null, width: number, height: number, preserve_aspect_ratio: number, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_GObject> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function gdk_pixbuf_new_from_stream_finish(async_result: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_from_xpm_data(data: interop.Pointer | interop.Reference<string | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_new_subpixbuf(src_pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, src_x: number, src_y: number, width: number, height: number): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_read_pixel_bytes(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_read_pixels(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string | null;

declare function gdk_pixbuf_ref(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_remove_option(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_rotate_simple(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, angle: GdkPixbufRotation): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_rotation_get_type(): number;

declare function gdk_pixbuf_saturate_and_pixelate(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, saturation: number, pixelate: number): void;

declare function gdk_pixbuf_save(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null, ...args: any[]): number;

declare function gdk_pixbuf_save_to_buffer(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buffer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, buffer_size: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null, ...args: any[]): number;

declare function gdk_pixbuf_save_to_bufferv(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buffer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, buffer_size: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, option_keys: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, option_values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_save_to_callback(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, save_func: interop.FunctionReference<(p1: string | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | null, p4: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null, ...args: any[]): number;

declare function gdk_pixbuf_save_to_callbackv(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, save_func: interop.FunctionReference<(p1: string | null, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | null, p4: interop.Pointer | interop.Reference<any> | null) => number>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, option_keys: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, option_values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_save_to_stream(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stream: interop.Pointer | interop.Reference<_GOutputStream> | ArrayBufferLike | ArrayBufferView | null, type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null, ...args: any[]): number;

declare function gdk_pixbuf_save_to_stream_async(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stream: interop.Pointer | interop.Reference<_GOutputStream> | ArrayBufferLike | ArrayBufferView | null, type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_GObject> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, ...args: any[]): void;

declare function gdk_pixbuf_save_to_stream_finish(async_result: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_save_to_streamv(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stream: interop.Pointer | interop.Reference<_GOutputStream> | ArrayBufferLike | ArrayBufferView | null, type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, option_keys: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, option_values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_save_to_streamv_async(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, stream: interop.Pointer | interop.Reference<_GOutputStream> | ArrayBufferLike | ArrayBufferView | null, type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, option_keys: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, option_values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, cancellable: interop.Pointer | interop.Reference<_GCancellable> | ArrayBufferLike | ArrayBufferView | null, callback: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<_GObject> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>, user_data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function gdk_pixbuf_savev(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, filename: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, type: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, option_keys: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, option_values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, error: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<_GError> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_scale(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest_x: number, dest_y: number, dest_width: number, dest_height: number, offset_x: number, offset_y: number, scale_x: number, scale_y: number, interp_type: GdkInterpType): void;

declare function gdk_pixbuf_scale_simple(src: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dest_width: number, dest_height: number, interp_type: GdkInterpType): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_set_option(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, key: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_simple_anim_add_frame(animation: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function gdk_pixbuf_simple_anim_get_loop(animation: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function gdk_pixbuf_simple_anim_get_type(): number;

declare function gdk_pixbuf_simple_anim_iter_get_type(): number;

declare function gdk_pixbuf_simple_anim_new(width: number, height: number, rate: number): interop.Pointer | interop.Reference<any> | null;

declare function gdk_pixbuf_simple_anim_set_loop(animation: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, loop: number): void;

declare function gdk_pixbuf_unref(pixbuf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare var gdk_pixbuf_version: string | null;
