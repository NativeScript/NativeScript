
declare var _FE_DFL_DISABLE_SSE_DENORMS_ENV: fenv_t;

declare var _FE_DFL_ENV: fenv_t;

declare function feclearexcept(p1: number): number;

declare function fegetenv(p1: interop.Pointer | interop.Reference<fenv_t>): number;

declare function fegetexceptflag(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function fegetround(): number;

declare function feholdexcept(p1: interop.Pointer | interop.Reference<fenv_t>): number;

interface fenv_t {
	__control: number;
	__status: number;
	__mxcsr: number;
	__reserved: interop.Reference<number>;
}
declare var fenv_t: interop.StructType<fenv_t>;

declare function feraiseexcept(p1: number): number;

declare function fesetenv(p1: interop.Pointer | interop.Reference<fenv_t>): number;

declare function fesetexceptflag(p1: interop.Pointer | interop.Reference<number>, p2: number): number;

declare function fesetround(p1: number): number;

declare function fetestexcept(p1: number): number;

declare function feupdateenv(p1: interop.Pointer | interop.Reference<fenv_t>): number;
