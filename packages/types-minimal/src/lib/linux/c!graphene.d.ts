
interface _graphene_point3d_t {
	x: number;
	y: number;
	z: number;
}
declare var _graphene_point3d_t: interop.StructType<_graphene_point3d_t>;

interface _graphene_point_t {
	x: number;
	y: number;
}
declare var _graphene_point_t: interop.StructType<_graphene_point_t>;

interface _graphene_quad_t {
	__graphene_private_points: interop.Reference<_graphene_point_t>;
}
declare var _graphene_quad_t: interop.StructType<_graphene_quad_t>;

interface _graphene_quaternion_t {
	__graphene_private_x: number;
	__graphene_private_y: number;
	__graphene_private_z: number;
	__graphene_private_w: number;
}
declare var _graphene_quaternion_t: interop.StructType<_graphene_quaternion_t>;

interface _graphene_rect_t {
	origin: _graphene_point_t;
	size: _graphene_size_t;
}
declare var _graphene_rect_t: interop.StructType<_graphene_rect_t>;

interface _graphene_size_t {
	width: number;
	height: number;
}
declare var _graphene_size_t: interop.StructType<_graphene_size_t>;

declare const enum graphene_euler_order_t {

	DEFAULT = -1,

	XYZ = 0,

	YZX = 1,

	ZXY = 2,

	XZY = 3,

	YXZ = 4,

	ZYX = 5,

	SXYZ = 6,

	SXYX = 7,

	SXZY = 8,

	SXZX = 9,

	SYZX = 10,

	SYZY = 11,

	SYXZ = 12,

	SYXY = 13,

	SZXY = 14,

	SZXZ = 15,

	SZYX = 16,

	SZYZ = 17,

	RZYX = 18,

	RXYX = 19,

	RYZX = 20,

	RXZX = 21,

	RXZY = 22,

	RYZY = 23,

	RZXY = 24,

	RYXY = 25,

	RYXZ = 26,

	RZXZ = 27,

	RXYZ = 28,

	RZYZ = 29
}

declare function graphene_point3d_alloc(): interop.Pointer | interop.Reference<_graphene_point3d_t> | null;

declare function graphene_point3d_cross(a: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_point3d_dot(a: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function graphene_point3d_equal(a: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function graphene_point3d_free(p: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_point3d_init(p: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, z: number): interop.Pointer | interop.Reference<_graphene_point3d_t> | null;

declare function graphene_point3d_init_from_point(p: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, src: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_graphene_point3d_t> | null;

declare function graphene_point3d_interpolate(a: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, factor: number, res: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_point3d_length(p: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function graphene_point3d_near(a: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, epsilon: number): boolean;

declare function graphene_point3d_normalize(p: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_point3d_normalize_viewport(p: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, viewport: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, z_near: number, z_far: number, res: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_point3d_scale(p: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null, factor: number, res: interop.Pointer | interop.Reference<_graphene_point3d_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_point3d_zero(): interop.Pointer | interop.Reference<_graphene_point3d_t> | null;

declare function graphene_point_alloc(): interop.Pointer | interop.Reference<_graphene_point_t> | null;

declare function graphene_point_distance(a: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, d_x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, d_y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): number;

declare function graphene_point_equal(a: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function graphene_point_free(p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_point_init(p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number): interop.Pointer | interop.Reference<_graphene_point_t> | null;

declare function graphene_point_init_from_point(p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, src: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_graphene_point_t> | null;

declare function graphene_point_interpolate(a: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, factor: number, res: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_point_near(a: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, epsilon: number): boolean;

declare function graphene_point_zero(): interop.Pointer | interop.Reference<_graphene_point_t> | null;

declare function graphene_quad_alloc(): interop.Pointer | interop.Reference<_graphene_quad_t> | null;

declare function graphene_quad_bounds(q: interop.Pointer | interop.Reference<_graphene_quad_t> | ArrayBufferLike | ArrayBufferView | null, r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_quad_contains(q: interop.Pointer | interop.Reference<_graphene_quad_t> | ArrayBufferLike | ArrayBufferView | null, p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function graphene_quad_free(q: interop.Pointer | interop.Reference<_graphene_quad_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_quad_get_point(q: interop.Pointer | interop.Reference<_graphene_quad_t> | ArrayBufferLike | ArrayBufferView | null, index_: number): interop.Pointer | interop.Reference<_graphene_point_t> | null;

declare function graphene_quad_init(q: interop.Pointer | interop.Reference<_graphene_quad_t> | ArrayBufferLike | ArrayBufferView | null, p1: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, p2: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, p3: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, p4: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_graphene_quad_t> | null;

declare function graphene_quad_init_from_points(q: interop.Pointer | interop.Reference<_graphene_quad_t> | ArrayBufferLike | ArrayBufferView | null, points: interop.Reference<_graphene_point_t>): interop.Pointer | interop.Reference<_graphene_quad_t> | null;

declare function graphene_quad_init_from_rect(q: interop.Pointer | interop.Reference<_graphene_quad_t> | ArrayBufferLike | ArrayBufferView | null, r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_graphene_quad_t> | null;

declare function graphene_quaternion_add(a: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_quaternion_alloc(): interop.Pointer | interop.Reference<_graphene_quaternion_t> | null;

declare function graphene_quaternion_dot(a: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function graphene_quaternion_equal(a: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function graphene_quaternion_free(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_quaternion_init(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, z: number, w: number): interop.Pointer | interop.Reference<_graphene_quaternion_t> | null;

declare function graphene_quaternion_init_from_angles(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, deg_x: number, deg_y: number, deg_z: number): interop.Pointer | interop.Reference<_graphene_quaternion_t> | null;

declare function graphene_quaternion_init_from_quaternion(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, src: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_graphene_quaternion_t> | null;

declare function graphene_quaternion_init_from_radians(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, rad_x: number, rad_y: number, rad_z: number): interop.Pointer | interop.Reference<_graphene_quaternion_t> | null;

declare function graphene_quaternion_init_identity(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_graphene_quaternion_t> | null;

declare function graphene_quaternion_invert(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_quaternion_multiply(a: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_quaternion_normalize(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_quaternion_scale(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, factor: number, res: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_quaternion_slerp(a: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, factor: number, res: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_quaternion_to_angles(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, deg_x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, deg_y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, deg_z: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_quaternion_to_radians(q: interop.Pointer | interop.Reference<_graphene_quaternion_t> | ArrayBufferLike | ArrayBufferView | null, rad_x: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, rad_y: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, rad_z: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): void;

declare const enum graphene_ray_intersection_kind_t {

	NONE = 0,

	ENTER = 1,

	LEAVE = 2
}

declare function graphene_rect_alloc(): interop.Pointer | interop.Reference<_graphene_rect_t> | null;

declare function graphene_rect_contains_point(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function graphene_rect_contains_rect(a: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function graphene_rect_equal(a: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function graphene_rect_expand(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_free(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_get_area(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function graphene_rect_get_bottom_left(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_get_bottom_right(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_get_center(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_get_height(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function graphene_rect_get_top_left(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_get_top_right(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, p: interop.Pointer | interop.Reference<_graphene_point_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_get_width(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function graphene_rect_get_x(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function graphene_rect_get_y(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): number;

declare function graphene_rect_init(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, x: number, y: number, width: number, height: number): interop.Pointer | interop.Reference<_graphene_rect_t> | null;

declare function graphene_rect_init_from_rect(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, src: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_graphene_rect_t> | null;

declare function graphene_rect_inset(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, d_x: number, d_y: number): interop.Pointer | interop.Reference<_graphene_rect_t> | null;

declare function graphene_rect_inset_r(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, d_x: number, d_y: number, res: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_interpolate(a: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, factor: number, res: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_intersection(a: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function graphene_rect_normalize(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_graphene_rect_t> | null;

declare function graphene_rect_normalize_r(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_offset(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, d_x: number, d_y: number): interop.Pointer | interop.Reference<_graphene_rect_t> | null;

declare function graphene_rect_offset_r(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, d_x: number, d_y: number, res: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_round(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_round_extents(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_round_to_pixel(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_graphene_rect_t> | null;

declare function graphene_rect_scale(r: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, s_h: number, s_v: number, res: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_union(a: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null, res: interop.Pointer | interop.Reference<_graphene_rect_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_rect_zero(): interop.Pointer | interop.Reference<_graphene_rect_t> | null;

interface graphene_simd4f_uif_t {
	ui: interop.Reference<number>;
	f: interop.Reference<number>;
}


declare function graphene_size_alloc(): interop.Pointer | interop.Reference<_graphene_size_t> | null;

declare function graphene_size_equal(a: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function graphene_size_free(s: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_size_init(s: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null, width: number, height: number): interop.Pointer | interop.Reference<_graphene_size_t> | null;

declare function graphene_size_init_from_size(s: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null, src: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<_graphene_size_t> | null;

declare function graphene_size_interpolate(a: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null, factor: number, res: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_size_scale(s: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null, factor: number, res: interop.Pointer | interop.Reference<_graphene_size_t> | ArrayBufferLike | ArrayBufferView | null): void;

declare function graphene_size_zero(): interop.Pointer | interop.Reference<_graphene_size_t> | null;
