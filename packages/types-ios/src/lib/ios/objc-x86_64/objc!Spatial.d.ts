
interface SPAffineTransform3D {
	matrix: simd_double4x3;
}
declare var SPAffineTransform3D: interop.StructType<SPAffineTransform3D>;

declare function SPAffineTransform3DAlmostEqualToTransform(t1: SPAffineTransform3D, t2: SPAffineTransform3D): boolean;

declare function SPAffineTransform3DAlmostEqualToTransformFunction(t1: SPAffineTransform3D, t2: SPAffineTransform3D, tolerance: number): boolean;

declare function SPAffineTransform3DConcatenation(t1: SPAffineTransform3D, t2: SPAffineTransform3D): SPAffineTransform3D;

declare function SPAffineTransform3DFlip(transform: SPAffineTransform3D, flipAxis: SPAxis): SPAffineTransform3D;

declare function SPAffineTransform3DGet3x3Matrix(transform: SPAffineTransform3D): simd_double3x3;

declare function SPAffineTransform3DGet4x4Matrix(transform: SPAffineTransform3D): simd_double4x4;

declare function SPAffineTransform3DInverted(transform: SPAffineTransform3D): SPAffineTransform3D;

declare function SPAffineTransform3DIsIdentity(transform: SPAffineTransform3D): boolean;

declare function SPAffineTransform3DIsInvertible(transform: SPAffineTransform3D): boolean;

declare function SPAffineTransform3DIsRectilinear(transform: SPAffineTransform3D): boolean;

declare function SPAffineTransform3DIsTranslation(transform: SPAffineTransform3D): boolean;

declare function SPAffineTransform3DIsUniform(transform: SPAffineTransform3D): boolean;

declare function SPAffineTransform3DIsUniformOverDimensions(transform: SPAffineTransform3D, dimensionFlags: SPAxis): boolean;

declare function SPAffineTransform3DIsValid(transform: SPAffineTransform3D): boolean;

declare function SPAffineTransform3DMakeShear(shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPAffineTransform3D;

declare function SPAffineTransform3DMakeWith4x3Matrix(matrix: simd_double4x3): SPAffineTransform3D;

declare function SPAffineTransform3DMakeWith4x4Matrix(matrix: simd_double4x4): SPAffineTransform3D;

declare function SPAffineTransform3DMakeWithProjective(transform: SPProjectiveTransform3D): SPAffineTransform3D;

declare function SPAffineTransform3DRotateByQuaternion(transform: SPAffineTransform3D, quaternion: simd_quatd): SPAffineTransform3D;

declare function SPAffineTransform3DScaleBy(transform: SPAffineTransform3D, x: number, y: number, z: number): SPAffineTransform3D;

declare function SPAffineTransform3DScaleUniform(transform: SPAffineTransform3D, scale: number): SPAffineTransform3D;

declare function SPAffineTransform3DShear(transform: SPAffineTransform3D, shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPAffineTransform3D;

interface SPAngle {
	radians: number;
}
declare var SPAngle: interop.StructType<SPAngle>;

declare function SPAngleEqualToAngle(angle1: SPAngle, angle2: SPAngle): boolean;

declare function SPAngleGetDegrees(angle: SPAngle): number;

declare function SPAngleMakeWithDegrees(degrees: number): SPAngle;

declare function SPAngleMakeWithRadians(radians: number): SPAngle;

declare const enum SPAxis {

	X = 1,

	Y = 2,

	Z = 4
}

declare const enum SPEulerAngleOrder {

	PitchYawRoll = 1
}

interface SPEulerAngles {
	angles: interop.Reference<number>;
	order: SPEulerAngleOrder;
}
declare var SPEulerAngles: interop.StructType<SPEulerAngles>;

interface SPProjectiveTransform3D {
	matrix: simd_double4x4;
}
declare var SPProjectiveTransform3D: interop.StructType<SPProjectiveTransform3D>;

declare function SPProjectiveTransform3DAlmostEqualToTransform(t1: SPProjectiveTransform3D, t2: SPProjectiveTransform3D): boolean;

declare function SPProjectiveTransform3DAlmostEqualToTransformFunction(t1: SPProjectiveTransform3D, t2: SPProjectiveTransform3D, tolerance: number): boolean;

declare function SPProjectiveTransform3DConcatenation(t1: SPProjectiveTransform3D, t2: SPProjectiveTransform3D): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DFlip(transform: SPProjectiveTransform3D, flipAxis: SPAxis): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DInverted(transform: SPProjectiveTransform3D): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DIs3DProjection(transform: SPProjectiveTransform3D): boolean;

declare function SPProjectiveTransform3DIsAffine(transform: SPProjectiveTransform3D): boolean;

declare function SPProjectiveTransform3DIsIdentity(transform: SPProjectiveTransform3D): boolean;

declare function SPProjectiveTransform3DIsInvertible(transform: SPProjectiveTransform3D): boolean;

declare function SPProjectiveTransform3DIsRectilinear(transform: SPProjectiveTransform3D): boolean;

declare function SPProjectiveTransform3DIsTranslation(transform: SPProjectiveTransform3D): boolean;

declare function SPProjectiveTransform3DIsUniform(transform: SPProjectiveTransform3D): boolean;

declare function SPProjectiveTransform3DIsUniformOverDimensions(transform: SPProjectiveTransform3D, dimensionFlags: SPAxis): boolean;

declare function SPProjectiveTransform3DIsValid(transform: SPProjectiveTransform3D): boolean;

declare function SPProjectiveTransform3DMakeFromTangents(leftTangent: number, rightTangent: number, topTangent: number, bottomTangent: number, nearZ: number, farZ: number, reverseZ: boolean): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DMakeShear(shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DMakeWith4x4Matrix(matrix: simd_double4x4): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DMakeWithAffine(transform: SPAffineTransform3D): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DMakeWithRHPerspective(fovyRadians: number, aspectRatio: number, nearZ: number, farZ: number): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DMakeWithRHPerspectiveFunction(fovyRadians: number, aspectRatio: number, nearZ: number, farZ: number, reverseZ: boolean): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DMakeWithRightHandPerspective(fovyRadians: number, aspectRatio: number, nearZ: number, farZ: number): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DMakeWithRightHandPerspectiveFunction(fovyRadians: number, aspectRatio: number, nearZ: number, farZ: number, reverseZ: boolean): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DRotateByQuaternion(transform: SPProjectiveTransform3D, quaternion: simd_quatd): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DScaleBy(transform: SPProjectiveTransform3D, x: number, y: number, z: number): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DScaleUniform(transform: SPProjectiveTransform3D, scale: number): SPProjectiveTransform3D;

declare function SPProjectiveTransform3DShear(transform: SPProjectiveTransform3D, shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPProjectiveTransform3D;

declare var SpatialVersionNumber: number;

declare var SpatialVersionString: number;
