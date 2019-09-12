
interface OS_at_encoder extends NSObjectProtocol {
}
declare var OS_at_encoder: {

	prototype: OS_at_encoder;
};

declare const enum at_alpha_t {

	at_alpha_not_premultiplied = 0,

	at_alpha_opaque = 1,

	at_alpha_premultiplied = 2,

	at_alpha_count = 3
}

interface at_block_buffer_t {
	blocks: interop.Pointer | interop.Reference<any>;
	rowBytes: number;
	sliceBytes: number;
}
declare var at_block_buffer_t: interop.StructType<at_block_buffer_t>;

declare const enum at_block_format_t {

	at_block_format_invalid = 0,

	at_block_format_astc_4x4_ldr = 1,

	at_block_format_astc_5x4_ldr = 2,

	at_block_format_astc_5x5_ldr = 3,

	at_block_format_astc_6x5_ldr = 4,

	at_block_format_astc_6x6_ldr = 5,

	at_block_format_astc_8x5_ldr = 6,

	at_block_format_astc_8x6_ldr = 7,

	at_block_format_astc_8x8_ldr = 8,

	at_block_format_astc_10x5_ldr = 9,

	at_block_format_astc_10x6_ldr = 10,

	at_block_format_astc_10x8_ldr = 11,

	at_block_format_astc_10x10_ldr = 12,

	at_block_format_astc_12x10_ldr = 13,

	at_block_format_astc_12x12_ldr = 14,

	at_block_format_astc_4x4_hdr = 17,

	at_block_format_astc_5x4_hdr = 18,

	at_block_format_astc_5x5_hdr = 19,

	at_block_format_astc_6x5_hdr = 20,

	at_block_format_astc_6x6_hdr = 21,

	at_block_format_astc_8x5_hdr = 22,

	at_block_format_astc_8x6_hdr = 23,

	at_block_format_astc_8x8_hdr = 24,

	at_block_format_astc_10x5_hdr = 25,

	at_block_format_astc_10x6_hdr = 26,

	at_block_format_astc_10x8_hdr = 27,

	at_block_format_astc_10x10_hdr = 28,

	at_block_format_astc_12x10_hdr = 29,

	at_block_format_astc_12x12_hdr = 30,

	at_block_format_bc1 = 33,

	at_block_format_bc2 = 34,

	at_block_format_bc3 = 35,

	at_block_format_bc4 = 36,

	at_block_format_bc4s = 37,

	at_block_format_bc5 = 38,

	at_block_format_bc5s = 39,

	at_block_format_bc6 = 40,

	at_block_format_bc6u = 41,

	at_block_format_bc7 = 42,

	at_block_format_count = 43
}

declare function at_block_format_to_MTLPixelFormat(p1: at_block_format_t): number;

declare function at_encoder_compress_texels(encoder: NSObject, src: interop.Pointer | interop.Reference<at_texel_region_t>, dest: interop.Pointer | interop.Reference<at_block_buffer_t>, errorThreshold: number, flags: at_flags_t): number;

declare function at_encoder_create(texelType: at_texel_format_t, texelAlphaType: at_alpha_t, blockType: at_block_format_t, blockAlphaType: at_alpha_t, backgroundColor: interop.Pointer | interop.Reference<number>): NSObject;

declare function at_encoder_decompress_texels(encoder: NSObject, src: interop.Pointer | interop.Reference<at_block_buffer_t>, dest: interop.Pointer | interop.Reference<at_texel_region_t>, flags: at_flags_t): at_error_t;

declare function at_encoder_get_block_address(encoder: NSObject, texelPosition: at_size_t, imageSize: at_size_t, blockInfo: interop.Pointer | interop.Reference<at_block_buffer_t>): interop.Pointer | interop.Reference<any>;

declare function at_encoder_get_block_alpha(encoder: NSObject): at_alpha_t;

declare function at_encoder_get_block_counts(encoder: NSObject, imageSize: at_size_t): at_size_t;

declare function at_encoder_get_block_dimensions(encoder: NSObject): at_size_t;

declare function at_encoder_get_block_format(encoder: NSObject): at_block_format_t;

declare function at_encoder_get_block_size(encoder: NSObject): number;

declare function at_encoder_get_texel_alpha(encoder: NSObject): at_alpha_t;

declare function at_encoder_get_texel_format(encoder: NSObject): at_texel_format_t;

declare function at_encoder_get_version(): number;

declare function at_encoder_is_compression_monolithic(encoder: NSObject, flags: at_flags_t): boolean;

declare function at_encoder_is_decompression_monolithic(encoder: NSObject, flags: at_flags_t): boolean;

declare const enum at_error_t {

	at_error_success = 0,

	at_error_invalid_parameter = -1,

	at_error_operation_unsupported = -2,

	at_error_invalid_source_data = -3,

	at_error_invalid_flag = -4,

	at_error_hdr_block_format_required = -5
}

declare const enum at_flags_t {

	at_flags_default = 0,

	at_flags_skip_parameter_checking = 1,

	at_flags_print_debug_info = 2,

	at_flags_disable_multithreading = 4,

	at_flags_skip_error_calculation = 8,

	at_flags_flip_texel_region_vertically = 16,

	at_flags_srgb_linear_texels = 32,

	at_flags_weight_channels_equally = 64
}

interface at_size_t {
	x: number;
	y: number;
	z: number;
}
declare var at_size_t: interop.StructType<at_size_t>;

declare const enum at_texel_format_t {

	at_texel_format_invalid = 0,

	at_texel_format_l8_unorm = 1,

	at_texel_format_l16_unorm = 2,

	at_texel_format_la8_unorm = 3,

	at_texel_format_la16_unorm = 4,

	at_texel_format_rgba8_unorm = 5,

	at_texel_format_bgra8_unorm = 6,

	at_texel_format_rgba16_unorm = 7,

	at_texel_format_l16_float = 8,

	at_texel_format_la16_float = 9,

	at_texel_format_rgba16_float = 10,

	at_texel_format_count = 11
}

declare function at_texel_format_to_MTLPixelFormat(p1: at_texel_format_t): number;

interface at_texel_region_t {
	texels: interop.Pointer | interop.Reference<any>;
	validSize: at_size_t;
	rowBytes: number;
	sliceBytes: number;
}
declare var at_texel_region_t: interop.StructType<at_texel_region_t>;
