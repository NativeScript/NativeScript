
/**
 * @since 7.0
 */
declare function __cospi(p1: number): number;

/**
 * @since 7.0
 */
declare function __cospif(p1: number): number;

interface __double2 {
	__sinval: number;
	__cosval: number;
}
declare var __double2: interop.StructType<__double2>;

/**
 * @since 7.0
 */
declare function __exp10(p1: number): number;

/**
 * @since 7.0
 */
declare function __exp10f(p1: number): number;

interface __float2 {
	__sinval: number;
	__cosval: number;
}
declare var __float2: interop.StructType<__float2>;

declare function __fpclassifyd(p1: number): number;

declare function __fpclassifyf(p1: number): number;

declare function __fpclassifyl(p1: number): number;

declare function __inline_isfinited(p1: number): number;

declare function __inline_isfinitef(p1: number): number;

declare function __inline_isfinitel(p1: number): number;

declare function __inline_isinfd(p1: number): number;

declare function __inline_isinff(p1: number): number;

declare function __inline_isinfl(p1: number): number;

declare function __inline_isnand(p1: number): number;

declare function __inline_isnanf(p1: number): number;

declare function __inline_isnanl(p1: number): number;

declare function __inline_isnormald(p1: number): number;

declare function __inline_isnormalf(p1: number): number;

declare function __inline_isnormall(p1: number): number;

declare function __inline_signbitd(p1: number): number;

declare function __inline_signbitf(p1: number): number;

declare function __inline_signbitl(p1: number): number;

declare function __math_errhandling(): number;

declare function __sincos(__x: number, __sinp: interop.Pointer | interop.Reference<number>, __cosp: interop.Pointer | interop.Reference<number>): void;

declare function __sincos_stret(p1: number): __double2;

declare function __sincosf(__x: number, __sinp: interop.Pointer | interop.Reference<number>, __cosp: interop.Pointer | interop.Reference<number>): void;

declare function __sincosf_stret(p1: number): __float2;

declare function __sincospi(__x: number, __sinp: interop.Pointer | interop.Reference<number>, __cosp: interop.Pointer | interop.Reference<number>): void;

declare function __sincospi_stret(p1: number): __double2;

declare function __sincospif(__x: number, __sinp: interop.Pointer | interop.Reference<number>, __cosp: interop.Pointer | interop.Reference<number>): void;

declare function __sincospif_stret(p1: number): __float2;

/**
 * @since 7.0
 */
declare function __sinpi(p1: number): number;

/**
 * @since 7.0
 */
declare function __sinpif(p1: number): number;

/**
 * @since 7.0
 */
declare function __tanpi(p1: number): number;

/**
 * @since 7.0
 */
declare function __tanpif(p1: number): number;

declare function acos(p1: number): number;

declare function acosf(p1: number): number;

declare function acosh(p1: number): number;

declare function acoshf(p1: number): number;

declare function acoshl(p1: number): number;

declare function acosl(p1: number): number;

declare function asin(p1: number): number;

declare function asinf(p1: number): number;

declare function asinh(p1: number): number;

declare function asinhf(p1: number): number;

declare function asinhl(p1: number): number;

declare function asinl(p1: number): number;

declare function atan(p1: number): number;

declare function atan2(p1: number, p2: number): number;

declare function atan2f(p1: number, p2: number): number;

declare function atan2l(p1: number, p2: number): number;

declare function atanf(p1: number): number;

declare function atanh(p1: number): number;

declare function atanhf(p1: number): number;

declare function atanhl(p1: number): number;

declare function atanl(p1: number): number;

declare function cbrt(p1: number): number;

declare function cbrtf(p1: number): number;

declare function cbrtl(p1: number): number;

declare function ceil(p1: number): number;

declare function ceilf(p1: number): number;

declare function ceill(p1: number): number;

declare function copysign(p1: number, p2: number): number;

declare function copysignf(p1: number, p2: number): number;

declare function copysignl(p1: number, p2: number): number;

declare function cos(p1: number): number;

declare function cosf(p1: number): number;

declare function cosh(p1: number): number;

declare function coshf(p1: number): number;

declare function coshl(p1: number): number;

declare function cosl(p1: number): number;

declare function erf(p1: number): number;

declare function erfc(p1: number): number;

declare function erfcf(p1: number): number;

declare function erfcl(p1: number): number;

declare function erff(p1: number): number;

declare function erfl(p1: number): number;

interface exception {
	type: number;
	name: interop.Pointer | interop.Reference<any>;
	arg1: number;
	arg2: number;
	retval: number;
}
declare var exception: interop.StructType<exception>;

declare function exp(p1: number): number;

declare function exp2(p1: number): number;

declare function exp2f(p1: number): number;

declare function exp2l(p1: number): number;

declare function expf(p1: number): number;

declare function expl(p1: number): number;

declare function expm1(p1: number): number;

declare function expm1f(p1: number): number;

declare function expm1l(p1: number): number;

declare function fabs(p1: number): number;

declare function fabsf(p1: number): number;

declare function fabsl(p1: number): number;

declare function fdim(p1: number, p2: number): number;

declare function fdimf(p1: number, p2: number): number;

declare function fdiml(p1: number, p2: number): number;

declare function floor(p1: number): number;

declare function floorf(p1: number): number;

declare function floorl(p1: number): number;

declare function fma(p1: number, p2: number, p3: number): number;

declare function fmaf(p1: number, p2: number, p3: number): number;

declare function fmal(p1: number, p2: number, p3: number): number;

declare function fmax(p1: number, p2: number): number;

declare function fmaxf(p1: number, p2: number): number;

declare function fmaxl(p1: number, p2: number): number;

declare function fmin(p1: number, p2: number): number;

declare function fminf(p1: number, p2: number): number;

declare function fminl(p1: number, p2: number): number;

declare function fmod(p1: number, p2: number): number;

declare function fmodf(p1: number, p2: number): number;

declare function fmodl(p1: number, p2: number): number;

declare function frexp(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function frexpf(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function frexpl(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function hypot(p1: number, p2: number): number;

declare function hypotf(p1: number, p2: number): number;

declare function hypotl(p1: number, p2: number): number;

declare function ilogb(p1: number): number;

declare function ilogbf(p1: number): number;

declare function ilogbl(p1: number): number;

/**
 * @since 3.2
 */
declare function j0(p1: number): number;

/**
 * @since 3.2
 */
declare function j1(p1: number): number;

/**
 * @since 3.2
 */
declare function jn(p1: number, p2: number): number;

declare function ldexp(p1: number, p2: number): number;

declare function ldexpf(p1: number, p2: number): number;

declare function ldexpl(p1: number, p2: number): number;

declare function lgamma(p1: number): number;

declare function lgammaf(p1: number): number;

declare function lgammal(p1: number): number;

declare function llrint(p1: number): number;

declare function llrintf(p1: number): number;

declare function llrintl(p1: number): number;

declare function llround(p1: number): number;

declare function llroundf(p1: number): number;

declare function llroundl(p1: number): number;

declare function log(p1: number): number;

declare function log10(p1: number): number;

declare function log10f(p1: number): number;

declare function log10l(p1: number): number;

declare function log1p(p1: number): number;

declare function log1pf(p1: number): number;

declare function log1pl(p1: number): number;

declare function log2(p1: number): number;

declare function log2f(p1: number): number;

declare function log2l(p1: number): number;

declare function logb(p1: number): number;

declare function logbf(p1: number): number;

declare function logbl(p1: number): number;

declare function logf(p1: number): number;

declare function logl(p1: number): number;

declare function lrint(p1: number): number;

declare function lrintf(p1: number): number;

declare function lrintl(p1: number): number;

declare function lround(p1: number): number;

declare function lroundf(p1: number): number;

declare function lroundl(p1: number): number;

declare function modf(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function modff(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function modfl(p1: number, p2: interop.Pointer | interop.Reference<number>): number;

declare function nan(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function nanf(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function nanl(p1: string | interop.Pointer | interop.Reference<any>): number;

declare function nearbyint(p1: number): number;

declare function nearbyintf(p1: number): number;

declare function nearbyintl(p1: number): number;

declare function nextafter(p1: number, p2: number): number;

declare function nextafterf(p1: number, p2: number): number;

declare function nextafterl(p1: number, p2: number): number;

declare function nexttoward(p1: number, p2: number): number;

declare function nexttowardf(p1: number, p2: number): number;

declare function nexttowardl(p1: number, p2: number): number;

declare function pow(p1: number, p2: number): number;

declare function powf(p1: number, p2: number): number;

declare function powl(p1: number, p2: number): number;

declare function remainder(p1: number, p2: number): number;

declare function remainderf(p1: number, p2: number): number;

declare function remainderl(p1: number, p2: number): number;

declare function remquo(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function remquof(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function remquol(p1: number, p2: number, p3: interop.Pointer | interop.Reference<number>): number;

declare function rint(p1: number): number;

declare function rintf(p1: number): number;

declare function rintl(p1: number): number;

declare function round(p1: number): number;

declare function roundf(p1: number): number;

declare function roundl(p1: number): number;

declare function scalb(p1: number, p2: number): number;

declare function scalbln(p1: number, p2: number): number;

declare function scalblnf(p1: number, p2: number): number;

declare function scalblnl(p1: number, p2: number): number;

declare function scalbn(p1: number, p2: number): number;

declare function scalbnf(p1: number, p2: number): number;

declare function scalbnl(p1: number, p2: number): number;

declare var signgam: number;

declare function sin(p1: number): number;

declare function sinf(p1: number): number;

declare function sinh(p1: number): number;

declare function sinhf(p1: number): number;

declare function sinhl(p1: number): number;

declare function sinl(p1: number): number;

declare function sqrt(p1: number): number;

declare function sqrtf(p1: number): number;

declare function sqrtl(p1: number): number;

declare function tan(p1: number): number;

declare function tanf(p1: number): number;

declare function tanh(p1: number): number;

declare function tanhf(p1: number): number;

declare function tanhl(p1: number): number;

declare function tanl(p1: number): number;

declare function tgamma(p1: number): number;

declare function tgammaf(p1: number): number;

declare function tgammal(p1: number): number;

declare function trunc(p1: number): number;

declare function truncf(p1: number): number;

declare function truncl(p1: number): number;

/**
 * @since 3.2
 */
declare function y0(p1: number): number;

/**
 * @since 3.2
 */
declare function y1(p1: number): number;

/**
 * @since 3.2
 */
declare function yn(p1: number, p2: number): number;
