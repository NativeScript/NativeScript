
interface SPAffineTransform3D {
	matrix: simd_double4x3;
}
declare var SPAffineTransform3D: interop.StructType<SPAffineTransform3D>;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DAlmostEqualToTransform(t1: SPAffineTransform3D, t2: SPAffineTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DAlmostEqualToTransformFunction(t1: SPAffineTransform3D, t2: SPAffineTransform3D, tolerance: number): boolean;

/**
 * @since 18.0
 */
declare function SPAffineTransform3DChangeBasis(transform: SPAffineTransform3D, from: SPAffineTransform3D, to: SPAffineTransform3D): SPAffineTransform3D;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DConcatenation(t1: SPAffineTransform3D, t2: SPAffineTransform3D): SPAffineTransform3D;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DFlip(transform: SPAffineTransform3D, flipAxis: SPAxis): SPAffineTransform3D;

interface SPAffineTransform3DFloat {
	matrix: simd_float4x3;
}
declare var SPAffineTransform3DFloat: interop.StructType<SPAffineTransform3DFloat>;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatAlmostEqualToTransform(t1: SPAffineTransform3DFloat, t2: SPAffineTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatAlmostEqualToTransformFunction(t1: SPAffineTransform3DFloat, t2: SPAffineTransform3DFloat, tolerance: number): boolean;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatChangeBasis(transform: SPAffineTransform3DFloat, from: SPAffineTransform3DFloat, to: SPAffineTransform3DFloat): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatConcatenation(t1: SPAffineTransform3DFloat, t2: SPAffineTransform3DFloat): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatFlip(transform: SPAffineTransform3DFloat, flipAxis: SPAxis): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatGet3x3Matrix(transform: SPAffineTransform3DFloat): simd_float3x3;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatGet4x4Matrix(transform: SPAffineTransform3DFloat): simd_float4x4;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatInverted(transform: SPAffineTransform3DFloat): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatIsIdentity(transform: SPAffineTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatIsInvertible(transform: SPAffineTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatIsRectilinear(transform: SPAffineTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatIsTranslation(transform: SPAffineTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatIsUniform(transform: SPAffineTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatIsUniformOverDimensions(transform: SPAffineTransform3DFloat, dimensionFlags: SPAxis): boolean;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatIsValid(transform: SPAffineTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatMake(transform: SPAffineTransform3D): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatMakeShear(shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatMakeWith4x3Matrix(matrix: simd_float4x3): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatMakeWithTruncated4x4Matrix(matrix: simd_float4x4): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatMakeWithTruncatedProjective(transform: SPProjectiveTransform3DFloat): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatRotateByQuaternion(transform: SPAffineTransform3DFloat, quaternion: simd_quatf): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatScaleBy(transform: SPAffineTransform3DFloat, x: number, y: number, z: number): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatScaleUniform(transform: SPAffineTransform3DFloat, scale: number): SPAffineTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DFloatShear(transform: SPAffineTransform3DFloat, shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPAffineTransform3DFloat;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DGet3x3Matrix(transform: SPAffineTransform3D): simd_double3x3;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DGet4x4Matrix(transform: SPAffineTransform3D): simd_double4x4;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DInverted(transform: SPAffineTransform3D): SPAffineTransform3D;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DIsIdentity(transform: SPAffineTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DIsInvertible(transform: SPAffineTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DIsRectilinear(transform: SPAffineTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DIsTranslation(transform: SPAffineTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DIsUniform(transform: SPAffineTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DIsUniformOverDimensions(transform: SPAffineTransform3D, dimensionFlags: SPAxis): boolean;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DIsValid(transform: SPAffineTransform3D): boolean;

/**
 * @since 26.0
 */
declare function SPAffineTransform3DMake(transform: SPAffineTransform3DFloat): SPAffineTransform3D;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DMakeShear(shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPAffineTransform3D;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DMakeWith4x3Matrix(matrix: simd_double4x3): SPAffineTransform3D;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DMakeWith4x4Matrix(matrix: simd_double4x4): SPAffineTransform3D;

/**
 * @since 16.0
 * @deprecated 18.0
 */
declare function SPAffineTransform3DMakeWithProjective(transform: SPProjectiveTransform3D): SPAffineTransform3D;

/**
 * @since 18.0
 */
declare function SPAffineTransform3DMakeWithTruncated4x4Matrix(matrix: simd_double4x4): SPAffineTransform3D;

/**
 * @since 17.0
 */
declare function SPAffineTransform3DMakeWithTruncatedProjective(transform: SPProjectiveTransform3D): SPAffineTransform3D;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DRotateByQuaternion(transform: SPAffineTransform3D, quaternion: simd_quatd): SPAffineTransform3D;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DScaleBy(transform: SPAffineTransform3D, x: number, y: number, z: number): SPAffineTransform3D;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DScaleUniform(transform: SPAffineTransform3D, scale: number): SPAffineTransform3D;

/**
 * @since 16.0
 */
declare function SPAffineTransform3DShear(transform: SPAffineTransform3D, shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPAffineTransform3D;

interface SPAngle {
	radians: number;
}
declare var SPAngle: interop.StructType<SPAngle>;

/**
 * @since 17.0
 */
declare function SPAngleAcos(x: number): SPAngle;

/**
 * @since 17.0
 */
declare function SPAngleAcosh(x: number): SPAngle;

/**
 * @since 17.0
 */
declare function SPAngleAsin(x: number): SPAngle;

/**
 * @since 17.0
 */
declare function SPAngleAsinh(x: number): SPAngle;

/**
 * @since 17.0
 */
declare function SPAngleAtan(x: number): SPAngle;

/**
 * @since 17.0
 */
declare function SPAngleAtan2(y: number, x: number): SPAngle;

/**
 * @since 17.0
 */
declare function SPAngleAtanh(x: number): SPAngle;

/**
 * @since 17.0
 */
declare function SPAngleCos(angle: SPAngle): number;

/**
 * @since 17.0
 */
declare function SPAngleCosh(angle: SPAngle): number;

/**
 * @since 16.0
 */
declare function SPAngleEqualToAngle(angle1: SPAngle, angle2: SPAngle): boolean;

interface SPAngleFloat {
	radians: number;
}
declare var SPAngleFloat: interop.StructType<SPAngleFloat>;

/**
 * @since 26.0
 */
declare function SPAngleFloatAcos(x: number): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatAcosh(x: number): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatAsin(x: number): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatAsinh(x: number): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatAtan(x: number): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatAtan2(y: number, x: number): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatAtanh(x: number): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatCos(angle: SPAngleFloat): number;

/**
 * @since 26.0
 */
declare function SPAngleFloatCosh(angle: SPAngleFloat): number;

/**
 * @since 26.0
 */
declare function SPAngleFloatEqualToAngle(angle1: SPAngleFloat, angle2: SPAngleFloat): boolean;

/**
 * @since 26.0
 */
declare function SPAngleFloatGetDegrees(angle: SPAngleFloat): number;

/**
 * @since 26.0
 */
declare function SPAngleFloatMake(angle: SPAngle): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatMakeWithDegrees(degrees: number): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatMakeWithRadians(radians: number): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatNegate(angle: SPAngleFloat): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatNormalize(angle: SPAngleFloat): SPAngleFloat;

/**
 * @since 26.0
 */
declare function SPAngleFloatSin(angle: SPAngleFloat): number;

/**
 * @since 26.0
 */
declare function SPAngleFloatSinh(angle: SPAngleFloat): number;

/**
 * @since 26.0
 */
declare function SPAngleFloatTan(angle: SPAngleFloat): number;

/**
 * @since 26.0
 */
declare function SPAngleFloatTanh(angle: SPAngleFloat): number;

/**
 * @since 16.0
 */
declare function SPAngleGetDegrees(angle: SPAngle): number;

/**
 * @since 26.0
 */
declare function SPAngleMake(angle: SPAngleFloat): SPAngle;

/**
 * @since 16.0
 */
declare function SPAngleMakeWithDegrees(degrees: number): SPAngle;

/**
 * @since 16.0
 */
declare function SPAngleMakeWithRadians(radians: number): SPAngle;

/**
 * @since 17.0
 */
declare function SPAngleNegate(angle: SPAngle): SPAngle;

/**
 * @since 17.0
 */
declare function SPAngleNormalize(angle: SPAngle): SPAngle;

/**
 * @since 17.0
 */
declare function SPAngleSin(angle: SPAngle): number;

/**
 * @since 17.0
 */
declare function SPAngleSinh(angle: SPAngle): number;

/**
 * @since 17.0
 */
declare function SPAngleTan(angle: SPAngle): number;

/**
 * @since 17.0
 */
declare function SPAngleTanh(angle: SPAngle): number;

declare const enum SPAxis {

	X = 1,

	Y = 2,

	Z = 4
}

declare const enum SPEulerAngleOrder {

	PitchYawRoll = 1,

	XYZ = 1,

	ZXY = 2
}

interface SPEulerAngles {
	angles: interop.Reference<number>;
	order: SPEulerAngleOrder;
}
declare var SPEulerAngles: interop.StructType<SPEulerAngles>;

interface SPEulerAnglesFloat {
	angles: interop.Reference<number>;
	order: SPEulerAngleOrder;
}
declare var SPEulerAnglesFloat: interop.StructType<SPEulerAnglesFloat>;

interface SPProjectiveTransform3D {
	matrix: simd_double4x4;
}
declare var SPProjectiveTransform3D: interop.StructType<SPProjectiveTransform3D>;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DAlmostEqualToTransform(t1: SPProjectiveTransform3D, t2: SPProjectiveTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DAlmostEqualToTransformFunction(t1: SPProjectiveTransform3D, t2: SPProjectiveTransform3D, tolerance: number): boolean;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DConcatenation(t1: SPProjectiveTransform3D, t2: SPProjectiveTransform3D): SPProjectiveTransform3D;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DFlip(transform: SPProjectiveTransform3D, flipAxis: SPAxis): SPProjectiveTransform3D;

interface SPProjectiveTransform3DFloat {
	matrix: simd_float4x4;
}
declare var SPProjectiveTransform3DFloat: interop.StructType<SPProjectiveTransform3DFloat>;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatAlmostEqualToTransform(t1: SPProjectiveTransform3DFloat, t2: SPProjectiveTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatAlmostEqualToTransformFunction(t1: SPProjectiveTransform3DFloat, t2: SPProjectiveTransform3DFloat, tolerance: number): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatConcatenation(t1: SPProjectiveTransform3DFloat, t2: SPProjectiveTransform3DFloat): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatFlip(transform: SPProjectiveTransform3DFloat, flipAxis: SPAxis): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatInverted(transform: SPProjectiveTransform3DFloat): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatIs3DFloatProjection(transform: SPProjectiveTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatIsAffine(transform: SPProjectiveTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatIsIdentity(transform: SPProjectiveTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatIsInvertible(transform: SPProjectiveTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatIsRectilinear(transform: SPProjectiveTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatIsTranslation(transform: SPProjectiveTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatIsUniform(transform: SPProjectiveTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatIsUniformOverDimensions(transform: SPProjectiveTransform3DFloat, dimensionFlags: SPAxis): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatIsValid(transform: SPProjectiveTransform3DFloat): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatMake(transform: SPProjectiveTransform3D): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatMakeFromTangents(leftTangent: number, rightTangent: number, topTangent: number, bottomTangent: number, nearZ: number, farZ: number, reverseZ: boolean): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatMakeShear(shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatMakeWith4x4Matrix(matrix: simd_float4x4): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatMakeWithAffine(transform: SPAffineTransform3DFloat): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatMakeWithRightHandPerspective(fovY: SPAngleFloat, aspectRatio: number, nearZ: number, farZ: number): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatMakeWithRightHandPerspectiveFunction(fovY: SPAngleFloat, aspectRatio: number, nearZ: number, farZ: number, reverseZ: boolean): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatRotateByQuaternion(transform: SPProjectiveTransform3DFloat, quaternion: simd_quatf): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatScaleBy(transform: SPProjectiveTransform3DFloat, x: number, y: number, z: number): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatScaleUniform(transform: SPProjectiveTransform3DFloat, scale: number): SPProjectiveTransform3DFloat;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DFloatShear(transform: SPProjectiveTransform3DFloat, shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPProjectiveTransform3DFloat;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DInverted(transform: SPProjectiveTransform3D): SPProjectiveTransform3D;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DIs3DProjection(transform: SPProjectiveTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DIsAffine(transform: SPProjectiveTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DIsIdentity(transform: SPProjectiveTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DIsInvertible(transform: SPProjectiveTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DIsRectilinear(transform: SPProjectiveTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DIsTranslation(transform: SPProjectiveTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DIsUniform(transform: SPProjectiveTransform3D): boolean;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DIsUniformOverDimensions(transform: SPProjectiveTransform3D, dimensionFlags: SPAxis): boolean;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DIsValid(transform: SPProjectiveTransform3D): boolean;

/**
 * @since 26.0
 */
declare function SPProjectiveTransform3DMake(transform: SPProjectiveTransform3DFloat): SPProjectiveTransform3D;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DMakeFromTangents(leftTangent: number, rightTangent: number, topTangent: number, bottomTangent: number, nearZ: number, farZ: number, reverseZ: boolean): SPProjectiveTransform3D;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DMakeShear(shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPProjectiveTransform3D;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DMakeWith4x4Matrix(matrix: simd_double4x4): SPProjectiveTransform3D;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DMakeWithAffine(transform: SPAffineTransform3D): SPProjectiveTransform3D;

/**
 * @since 16.0
 * @deprecated 16.0
 */
declare function SPProjectiveTransform3DMakeWithRHPerspective(fovyRadians: number, aspectRatio: number, nearZ: number, farZ: number): SPProjectiveTransform3D;

/**
 * @since 16.0
 * @deprecated 16.0
 */
declare function SPProjectiveTransform3DMakeWithRHPerspectiveFunction(fovyRadians: number, aspectRatio: number, nearZ: number, farZ: number, reverseZ: boolean): SPProjectiveTransform3D;

/**
 * @since 16.0
 * @deprecated 18.0
 */
declare function SPProjectiveTransform3DMakeWithRightHandPerspective(fovyRadians: number, aspectRatio: number, nearZ: number, farZ: number): SPProjectiveTransform3D;

/**
 * @since 18.0
 */
declare function SPProjectiveTransform3DMakeWithRightHandPerspectiveFunction(fovY: SPAngle, aspectRatio: number, nearZ: number, farZ: number): SPProjectiveTransform3D;

/**
 * @since 16.0
 * @deprecated 18.0
 */
declare function SPProjectiveTransform3DMakeWithRightHandPerspectiveFunction2(fovyRadians: number, aspectRatio: number, nearZ: number, farZ: number, reverseZ: boolean): SPProjectiveTransform3D;

/**
 * @since 18.0
 */
declare function SPProjectiveTransform3DMakeWithRightHandPerspectiveFunction3(fovY: SPAngle, aspectRatio: number, nearZ: number, farZ: number, reverseZ: boolean): SPProjectiveTransform3D;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DRotateByQuaternion(transform: SPProjectiveTransform3D, quaternion: simd_quatd): SPProjectiveTransform3D;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DScaleBy(transform: SPProjectiveTransform3D, x: number, y: number, z: number): SPProjectiveTransform3D;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DScaleUniform(transform: SPProjectiveTransform3D, scale: number): SPProjectiveTransform3D;

/**
 * @since 16.0
 */
declare function SPProjectiveTransform3DShear(transform: SPProjectiveTransform3D, shearAxis: SPAxis, shearFactor0: number, shearFactor1: number): SPProjectiveTransform3D;
