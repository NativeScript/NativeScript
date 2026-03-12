
interface HVFLibraryVersion {
	major: number;
	minor: number;
	patch: number;
}
declare var HVFLibraryVersion: interop.StructType<HVFLibraryVersion>;

interface HVFPartInfo {
	partId: number;
}
declare var HVFPartInfo: interop.StructType<HVFPartInfo>;

declare const enum HVFPartRenderAction {

	Continue = 0,

	Skip = 1,

	Stop = 2
}

declare const enum HVFPartRenderInstruction {

	BeginPart = 0,

	BeginPath = 1,

	AddPoint = 2,

	AddLine = 3,

	AddQuad = 4,

	AddCubic = 5,

	ClosePath = 6,

	EndPath = 7,

	EndPart = 8,

	Stop = 9
}

interface HVFPoint {
	x: number;
	y: number;
}
declare var HVFPoint: interop.StructType<HVFPoint>;

interface HVFTableVersion {
	major: number;
	minor: number;
}
declare var HVFTableVersion: interop.StructType<HVFTableVersion>;

interface HVFTranslation {
	dx: number;
	dy: number;
}
declare var HVFTranslation: interop.StructType<HVFTranslation>;

/**
 * @since 18.4
 */
declare function HVF_clear_part_cache(renderer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 18.4
 */
declare function HVF_close_part_renderer(renderer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 18.4
 */
declare function HVF_glyph_count(renderer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 18.4
 */
declare function HVF_library_version(): HVFLibraryVersion;

/**
 * @since 18.4
 */
declare function HVF_open_part_renderer(hvgl: interop.Pointer | interop.Reference<any>, hvglSize: number, hvpm: interop.Pointer | interop.Reference<any>, hvpmSize: number, storage: interop.Pointer | interop.Reference<any>, storageSize: number): number;

/**
 * @since 18.4
 */
declare function HVF_part_count(renderer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 18.4
 */
declare function HVF_part_renderer_storage_size(): number;

/**
 * @since 18.4
 */
declare function HVF_render_part_axis_count(renderer: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 18.4
 */
declare function HVF_set_axis_value(renderer: interop.Pointer | interop.Reference<any>, axis: number, value: number): number;

/**
 * @since 18.4
 */
declare function HVF_set_render_part(renderer: interop.Pointer | interop.Reference<any>, partIndex: number): number;

/**
 * @since 18.4
 */
declare function HVF_table_version(renderer: interop.Pointer | interop.Reference<any>): HVFTableVersion;
