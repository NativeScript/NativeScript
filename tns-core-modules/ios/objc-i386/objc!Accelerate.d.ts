
declare function ATLU_DestroyThreadMemory(): void;

declare const enum CBLAS_DIAG {

	CblasNonUnit = 131,

	CblasUnit = 132
}

declare const enum CBLAS_ORDER {

	CblasRowMajor = 101,

	CblasColMajor = 102
}

declare const enum CBLAS_SIDE {

	CblasLeft = 141,

	CblasRight = 142
}

declare const enum CBLAS_TRANSPOSE {

	CblasNoTrans = 111,

	CblasTrans = 112,

	CblasConjTrans = 113,

	AtlasConj = 114
}

declare const enum CBLAS_UPLO {

	CblasUpper = 121,

	CblasLower = 122
}

interface DSPComplex {
	real: number;
	imag: number;
}
declare var DSPComplex: interop.StructType<DSPComplex>;

interface DSPDoubleComplex {
	real: number;
	imag: number;
}
declare var DSPDoubleComplex: interop.StructType<DSPDoubleComplex>;

interface DSPDoubleSplitComplex {
	realp: interop.Reference<number>;
	imagp: interop.Reference<number>;
}
declare var DSPDoubleSplitComplex: interop.StructType<DSPDoubleSplitComplex>;

interface DSPSplitComplex {
	realp: interop.Reference<number>;
	imagp: interop.Reference<number>;
}
declare var DSPSplitComplex: interop.StructType<DSPSplitComplex>;

interface OS_la_object extends NSObjectProtocol {
}
declare var OS_la_object: {

	prototype: OS_la_object;
};

declare function SetBLASParamErrorProc(__ErrorProc: interop.FunctionReference<(p1: string, p2: string, p3: interop.Reference<number>, p4: interop.Reference<number>) => void>): void;

interface __CLPK_complex {
	r: number;
	i: number;
}
declare var __CLPK_complex: interop.StructType<__CLPK_complex>;

interface __CLPK_doublecomplex {
	r: number;
	i: number;
}
declare var __CLPK_doublecomplex: interop.StructType<__CLPK_doublecomplex>;

declare function appleblas_dgeadd(__order: CBLAS_ORDER, __transA: CBLAS_TRANSPOSE, __transB: CBLAS_TRANSPOSE, __m: number, __n: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __beta: number, __B: interop.Reference<number>, __ldb: number, __C: interop.Reference<number>, __ldc: number): void;

declare function appleblas_sgeadd(__order: CBLAS_ORDER, __transA: CBLAS_TRANSPOSE, __transB: CBLAS_TRANSPOSE, __m: number, __n: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __beta: number, __B: interop.Reference<number>, __ldb: number, __C: interop.Reference<number>, __ldc: number): void;

declare function catlas_caxpby(__N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function catlas_cset(__N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number): void;

declare function catlas_daxpby(__N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function catlas_dset(__N: number, __alpha: number, __X: interop.Reference<number>, __incX: number): void;

declare function catlas_saxpby(__N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function catlas_sset(__N: number, __alpha: number, __X: interop.Reference<number>, __incX: number): void;

declare function catlas_zaxpby(__N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function catlas_zset(__N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number): void;

declare function cbdsqr_(__uplo: string, __n: interop.Reference<number>, __ncvt: interop.Reference<number>, __nru: interop.Reference<number>, __ncc: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vt: interop.Reference<__CLPK_complex>, __ldvt: interop.Reference<number>, __u: interop.Reference<__CLPK_complex>, __ldu: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cblas_caxpy(__N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number): void;

declare function cblas_ccopy(__N: number, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number): void;

declare function cblas_cdotc_sub(__N: number, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __dotc: interop.Pointer): void;

declare function cblas_cdotu_sub(__N: number, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __dotu: interop.Pointer): void;

declare function cblas_cgbmv(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __M: number, __N: number, __KL: number, __KU: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function cblas_cgemm(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __TransB: CBLAS_TRANSPOSE, __M: number, __N: number, __K: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number, __beta: interop.Pointer, __C: interop.Pointer, __ldc: number): void;

declare function cblas_cgemv(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __M: number, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function cblas_cgerc(__Order: CBLAS_ORDER, __M: number, __N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __A: interop.Pointer, __lda: number): void;

declare function cblas_cgeru(__Order: CBLAS_ORDER, __M: number, __N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __A: interop.Pointer, __lda: number): void;

declare function cblas_chbmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __K: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function cblas_chemm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __M: number, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number, __beta: interop.Pointer, __C: interop.Pointer, __ldc: number): void;

declare function cblas_chemv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function cblas_cher(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Pointer, __incX: number, __A: interop.Pointer, __lda: number): void;

declare function cblas_cher2(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __A: interop.Pointer, __lda: number): void;

declare function cblas_cher2k(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number, __beta: number, __C: interop.Pointer, __ldc: number): void;

declare function cblas_cherk(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: number, __A: interop.Pointer, __lda: number, __beta: number, __C: interop.Pointer, __ldc: number): void;

declare function cblas_chpmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: interop.Pointer, __Ap: interop.Pointer, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function cblas_chpr(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Pointer, __incX: number, __A: interop.Pointer): void;

declare function cblas_chpr2(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __Ap: interop.Pointer): void;

declare function cblas_crotg(__a: interop.Pointer, __b: interop.Pointer, __c: interop.Pointer, __s: interop.Pointer): void;

declare function cblas_cscal(__N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number): void;

declare function cblas_csrot(__N: number, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __c: number, __s: number): void;

declare function cblas_csscal(__N: number, __alpha: number, __X: interop.Pointer, __incX: number): void;

declare function cblas_cswap(__N: number, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number): void;

declare function cblas_csymm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __M: number, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number, __beta: interop.Pointer, __C: interop.Pointer, __ldc: number): void;

declare function cblas_csyr2k(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number, __beta: interop.Pointer, __C: interop.Pointer, __ldc: number): void;

declare function cblas_csyrk(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __beta: interop.Pointer, __C: interop.Pointer, __ldc: number): void;

declare function cblas_ctbmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __K: number, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number): void;

declare function cblas_ctbsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __K: number, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number): void;

declare function cblas_ctpmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __Ap: interop.Pointer, __X: interop.Pointer, __incX: number): void;

declare function cblas_ctpsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __Ap: interop.Pointer, __X: interop.Pointer, __incX: number): void;

declare function cblas_ctrmm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __M: number, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number): void;

declare function cblas_ctrmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number): void;

declare function cblas_ctrsm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __M: number, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number): void;

declare function cblas_ctrsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number): void;

declare function cblas_dasum(__N: number, __X: interop.Reference<number>, __incX: number): number;

declare function cblas_daxpy(__N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_dcopy(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_ddot(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number): number;

declare function cblas_dgbmv(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __M: number, __N: number, __KL: number, __KU: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_dgemm(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __TransB: CBLAS_TRANSPOSE, __M: number, __N: number, __K: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __B: interop.Reference<number>, __ldb: number, __beta: number, __C: interop.Reference<number>, __ldc: number): void;

declare function cblas_dgemv(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __M: number, __N: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_dger(__Order: CBLAS_ORDER, __M: number, __N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number, __A: interop.Reference<number>, __lda: number): void;

declare function cblas_dnrm2(__N: number, __X: interop.Reference<number>, __incX: number): number;

declare function cblas_drot(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number, __c: number, __s: number): void;

declare function cblas_drotg(__a: interop.Reference<number>, __b: interop.Reference<number>, __c: interop.Reference<number>, __s: interop.Reference<number>): void;

declare function cblas_drotm(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number, __P: interop.Reference<number>): void;

declare function cblas_drotmg(__d1: interop.Reference<number>, __d2: interop.Reference<number>, __b1: interop.Reference<number>, __b2: number, __P: interop.Reference<number>): void;

declare function cblas_dsbmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __K: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_dscal(__N: number, __alpha: number, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_dsdot(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number): number;

declare function cblas_dspmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __Ap: interop.Reference<number>, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_dspr(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Ap: interop.Reference<number>): void;

declare function cblas_dspr2(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number, __A: interop.Reference<number>): void;

declare function cblas_dswap(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_dsymm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __M: number, __N: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __B: interop.Reference<number>, __ldb: number, __beta: number, __C: interop.Reference<number>, __ldc: number): void;

declare function cblas_dsymv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_dsyr(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __A: interop.Reference<number>, __lda: number): void;

declare function cblas_dsyr2(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number, __A: interop.Reference<number>, __lda: number): void;

declare function cblas_dsyr2k(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __B: interop.Reference<number>, __ldb: number, __beta: number, __C: interop.Reference<number>, __ldc: number): void;

declare function cblas_dsyrk(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __beta: number, __C: interop.Reference<number>, __ldc: number): void;

declare function cblas_dtbmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __K: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_dtbsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __K: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_dtpmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __Ap: interop.Reference<number>, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_dtpsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __Ap: interop.Reference<number>, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_dtrmm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __M: number, __N: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __B: interop.Reference<number>, __ldb: number): void;

declare function cblas_dtrmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_dtrsm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __M: number, __N: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __B: interop.Reference<number>, __ldb: number): void;

declare function cblas_dtrsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_dzasum(__N: number, __X: interop.Pointer, __incX: number): number;

declare function cblas_dznrm2(__N: number, __X: interop.Pointer, __incX: number): number;

declare function cblas_icamax(__N: number, __X: interop.Pointer, __incX: number): number;

declare function cblas_idamax(__N: number, __X: interop.Reference<number>, __incX: number): number;

declare function cblas_isamax(__N: number, __X: interop.Reference<number>, __incX: number): number;

declare function cblas_izamax(__N: number, __X: interop.Pointer, __incX: number): number;

declare function cblas_sasum(__N: number, __X: interop.Reference<number>, __incX: number): number;

declare function cblas_saxpy(__N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_scasum(__N: number, __X: interop.Pointer, __incX: number): number;

declare function cblas_scnrm2(__N: number, __X: interop.Pointer, __incX: number): number;

declare function cblas_scopy(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_sdot(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number): number;

declare function cblas_sdsdot(__N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number): number;

declare function cblas_sgbmv(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __M: number, __N: number, __KL: number, __KU: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_sgemm(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __TransB: CBLAS_TRANSPOSE, __M: number, __N: number, __K: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __B: interop.Reference<number>, __ldb: number, __beta: number, __C: interop.Reference<number>, __ldc: number): void;

declare function cblas_sgemv(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __M: number, __N: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_sger(__Order: CBLAS_ORDER, __M: number, __N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number, __A: interop.Reference<number>, __lda: number): void;

declare function cblas_snrm2(__N: number, __X: interop.Reference<number>, __incX: number): number;

declare function cblas_srot(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number, __c: number, __s: number): void;

declare function cblas_srotg(__a: interop.Reference<number>, __b: interop.Reference<number>, __c: interop.Reference<number>, __s: interop.Reference<number>): void;

declare function cblas_srotm(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number, __P: interop.Reference<number>): void;

declare function cblas_srotmg(__d1: interop.Reference<number>, __d2: interop.Reference<number>, __b1: interop.Reference<number>, __b2: number, __P: interop.Reference<number>): void;

declare function cblas_ssbmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __K: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_sscal(__N: number, __alpha: number, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_sspmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __Ap: interop.Reference<number>, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_sspr(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Ap: interop.Reference<number>): void;

declare function cblas_sspr2(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number, __A: interop.Reference<number>): void;

declare function cblas_sswap(__N: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_ssymm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __M: number, __N: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __B: interop.Reference<number>, __ldb: number, __beta: number, __C: interop.Reference<number>, __ldc: number): void;

declare function cblas_ssymv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number, __beta: number, __Y: interop.Reference<number>, __incY: number): void;

declare function cblas_ssyr(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __A: interop.Reference<number>, __lda: number): void;

declare function cblas_ssyr2(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Reference<number>, __incX: number, __Y: interop.Reference<number>, __incY: number, __A: interop.Reference<number>, __lda: number): void;

declare function cblas_ssyr2k(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __B: interop.Reference<number>, __ldb: number, __beta: number, __C: interop.Reference<number>, __ldc: number): void;

declare function cblas_ssyrk(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __beta: number, __C: interop.Reference<number>, __ldc: number): void;

declare function cblas_stbmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __K: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_stbsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __K: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_stpmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __Ap: interop.Reference<number>, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_stpsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __Ap: interop.Reference<number>, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_strmm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __M: number, __N: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __B: interop.Reference<number>, __ldb: number): void;

declare function cblas_strmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_strsm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __M: number, __N: number, __alpha: number, __A: interop.Reference<number>, __lda: number, __B: interop.Reference<number>, __ldb: number): void;

declare function cblas_strsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __A: interop.Reference<number>, __lda: number, __X: interop.Reference<number>, __incX: number): void;

declare function cblas_zaxpy(__N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number): void;

declare function cblas_zcopy(__N: number, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number): void;

declare function cblas_zdotc_sub(__N: number, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __dotc: interop.Pointer): void;

declare function cblas_zdotu_sub(__N: number, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __dotu: interop.Pointer): void;

declare function cblas_zdrot(__N: number, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __c: number, __s: number): void;

declare function cblas_zdscal(__N: number, __alpha: number, __X: interop.Pointer, __incX: number): void;

declare function cblas_zgbmv(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __M: number, __N: number, __KL: number, __KU: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function cblas_zgemm(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __TransB: CBLAS_TRANSPOSE, __M: number, __N: number, __K: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number, __beta: interop.Pointer, __C: interop.Pointer, __ldc: number): void;

declare function cblas_zgemv(__Order: CBLAS_ORDER, __TransA: CBLAS_TRANSPOSE, __M: number, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function cblas_zgerc(__Order: CBLAS_ORDER, __M: number, __N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __A: interop.Pointer, __lda: number): void;

declare function cblas_zgeru(__Order: CBLAS_ORDER, __M: number, __N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __A: interop.Pointer, __lda: number): void;

declare function cblas_zhbmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __K: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function cblas_zhemm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __M: number, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number, __beta: interop.Pointer, __C: interop.Pointer, __ldc: number): void;

declare function cblas_zhemv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function cblas_zher(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Pointer, __incX: number, __A: interop.Pointer, __lda: number): void;

declare function cblas_zher2(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __A: interop.Pointer, __lda: number): void;

declare function cblas_zher2k(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number, __beta: number, __C: interop.Pointer, __ldc: number): void;

declare function cblas_zherk(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: number, __A: interop.Pointer, __lda: number, __beta: number, __C: interop.Pointer, __ldc: number): void;

declare function cblas_zhpmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: interop.Pointer, __Ap: interop.Pointer, __X: interop.Pointer, __incX: number, __beta: interop.Pointer, __Y: interop.Pointer, __incY: number): void;

declare function cblas_zhpr(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: number, __X: interop.Pointer, __incX: number, __A: interop.Pointer): void;

declare function cblas_zhpr2(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number, __Ap: interop.Pointer): void;

declare function cblas_zrotg(__a: interop.Pointer, __b: interop.Pointer, __c: interop.Pointer, __s: interop.Pointer): void;

declare function cblas_zscal(__N: number, __alpha: interop.Pointer, __X: interop.Pointer, __incX: number): void;

declare function cblas_zswap(__N: number, __X: interop.Pointer, __incX: number, __Y: interop.Pointer, __incY: number): void;

declare function cblas_zsymm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __M: number, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number, __beta: interop.Pointer, __C: interop.Pointer, __ldc: number): void;

declare function cblas_zsyr2k(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number, __beta: interop.Pointer, __C: interop.Pointer, __ldc: number): void;

declare function cblas_zsyrk(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __Trans: CBLAS_TRANSPOSE, __N: number, __K: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __beta: interop.Pointer, __C: interop.Pointer, __ldc: number): void;

declare function cblas_ztbmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __K: number, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number): void;

declare function cblas_ztbsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __K: number, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number): void;

declare function cblas_ztpmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __Ap: interop.Pointer, __X: interop.Pointer, __incX: number): void;

declare function cblas_ztpsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __Ap: interop.Pointer, __X: interop.Pointer, __incX: number): void;

declare function cblas_ztrmm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __M: number, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number): void;

declare function cblas_ztrmv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number): void;

declare function cblas_ztrsm(__Order: CBLAS_ORDER, __Side: CBLAS_SIDE, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __M: number, __N: number, __alpha: interop.Pointer, __A: interop.Pointer, __lda: number, __B: interop.Pointer, __ldb: number): void;

declare function cblas_ztrsv(__Order: CBLAS_ORDER, __Uplo: CBLAS_UPLO, __TransA: CBLAS_TRANSPOSE, __Diag: CBLAS_DIAG, __N: number, __A: interop.Pointer, __lda: number, __X: interop.Pointer, __incX: number): void;

declare function cgbbrd_(__vect: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ncc: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __pt: interop.Reference<__CLPK_complex>, __ldpt: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgbcon_(__norm: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgbequ_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgbequb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgbrfs_(__trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __afb: interop.Reference<__CLPK_complex>, __ldafb: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgbsv_(__n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgbsvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __afb: interop.Reference<__CLPK_complex>, __ldafb: interop.Reference<number>, __ipiv: interop.Reference<number>, __equed: string, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgbtf2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgbtrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgbtrs_(__trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgebak_(__job: string, __side: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __m: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgebal_(__job: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgebd2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<__CLPK_complex>, __taup: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cgebrd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<__CLPK_complex>, __taup: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgecon_(__norm: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgeequ_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgeequb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgees_(__jobvs: string, __sort: string, __select: interop.FunctionReference<() => number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __sdim: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __vs: interop.Reference<__CLPK_complex>, __ldvs: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgeesx_(__jobvs: string, __sort: string, __select: interop.FunctionReference<() => number>, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __sdim: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __vs: interop.Reference<__CLPK_complex>, __ldvs: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgeev_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __vl: interop.Reference<__CLPK_complex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_complex>, __ldvr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgeevx_(__balanc: string, __jobvl: string, __jobvr: string, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __vl: interop.Reference<__CLPK_complex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_complex>, __ldvr: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __abnrm: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgegs_(__jobvsl: string, __jobvsr: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __beta: interop.Reference<__CLPK_complex>, __vsl: interop.Reference<__CLPK_complex>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<__CLPK_complex>, __ldvsr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgegv_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __beta: interop.Reference<__CLPK_complex>, __vl: interop.Reference<__CLPK_complex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_complex>, __ldvr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgehd2_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cgehrd_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgelq2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cgelqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgels_(__trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgelsd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __s: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgelss_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __s: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgelsx_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __jpvt: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgelsy_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __jpvt: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgeql2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cgeqlf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgeqp3_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgeqpf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgeqr2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cgeqrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgerfs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_complex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgerq2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cgerqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgesc2_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __rhs: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>, __scale: interop.Reference<number>): number;

declare function cgesdd_(__jobz: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __u: interop.Reference<__CLPK_complex>, __ldu: interop.Reference<number>, __vt: interop.Reference<__CLPK_complex>, __ldvt: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgesv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgesvd_(__jobu: string, __jobvt: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __u: interop.Reference<__CLPK_complex>, __ldu: interop.Reference<number>, __vt: interop.Reference<__CLPK_complex>, __ldvt: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgesvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_complex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __equed: string, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgetc2_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgetf2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgetrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgetri_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgetrs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cggbak_(__job: string, __side: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __m: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cggbal_(__job: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgges_(__jobvsl: string, __jobvsr: string, __sort: string, __selctg: interop.FunctionReference<() => number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __sdim: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __beta: interop.Reference<__CLPK_complex>, __vsl: interop.Reference<__CLPK_complex>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<__CLPK_complex>, __ldvsr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cggesx_(__jobvsl: string, __jobvsr: string, __sort: string, __selctg: interop.FunctionReference<() => number>, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __sdim: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __beta: interop.Reference<__CLPK_complex>, __vsl: interop.Reference<__CLPK_complex>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<__CLPK_complex>, __ldvsr: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cggev_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __beta: interop.Reference<__CLPK_complex>, __vl: interop.Reference<__CLPK_complex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_complex>, __ldvr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cggevx_(__balanc: string, __jobvl: string, __jobvr: string, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __beta: interop.Reference<__CLPK_complex>, __vl: interop.Reference<__CLPK_complex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_complex>, __ldvr: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __abnrm: interop.Reference<number>, __bbnrm: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cggglm_(__n: interop.Reference<number>, __m: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __d__: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __y: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgghrd_(__compq: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgglse_(__m: interop.Reference<number>, __n: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __d__: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cggqrf_(__n: interop.Reference<number>, __m: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __taua: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __taub: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cggrqf_(__m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __taua: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __taub: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cggsvd_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __p: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<__CLPK_complex>, __ldu: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cggsvp_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __tola: interop.Reference<number>, __tolb: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __u: interop.Reference<__CLPK_complex>, __ldu: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __iwork: interop.Reference<number>, __rwork: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cgtcon_(__norm: string, __n: interop.Reference<number>, __dl: interop.Reference<__CLPK_complex>, __d__: interop.Reference<__CLPK_complex>, __du: interop.Reference<__CLPK_complex>, __du2: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cgtrfs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<__CLPK_complex>, __d__: interop.Reference<__CLPK_complex>, __du: interop.Reference<__CLPK_complex>, __dlf: interop.Reference<__CLPK_complex>, __df: interop.Reference<__CLPK_complex>, __duf: interop.Reference<__CLPK_complex>, __du2: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgtsv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<__CLPK_complex>, __d__: interop.Reference<__CLPK_complex>, __du: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgtsvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<__CLPK_complex>, __d__: interop.Reference<__CLPK_complex>, __du: interop.Reference<__CLPK_complex>, __dlf: interop.Reference<__CLPK_complex>, __df: interop.Reference<__CLPK_complex>, __duf: interop.Reference<__CLPK_complex>, __du2: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgttrf_(__n: interop.Reference<number>, __dl: interop.Reference<__CLPK_complex>, __d__: interop.Reference<__CLPK_complex>, __du: interop.Reference<__CLPK_complex>, __du2: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgttrs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<__CLPK_complex>, __d__: interop.Reference<__CLPK_complex>, __du: interop.Reference<__CLPK_complex>, __du2: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cgtts2_(__itrans: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<__CLPK_complex>, __d__: interop.Reference<__CLPK_complex>, __du: interop.Reference<__CLPK_complex>, __du2: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>): number;

declare function chbev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chbevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chbevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chbgst_(__vect: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __bb: interop.Reference<__CLPK_complex>, __ldbb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chbgv_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __bb: interop.Reference<__CLPK_complex>, __ldbb: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chbgvd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __bb: interop.Reference<__CLPK_complex>, __ldbb: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chbgvx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __bb: interop.Reference<__CLPK_complex>, __ldbb: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chbtrd_(__vect: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function checon_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cheequb_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cheev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cheevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cheevr_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cheevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chegs2_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chegst_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chegv_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chegvd_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chegvx_(__itype: interop.Reference<number>, __jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cherfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_complex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chesv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chesvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_complex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chetd2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function chetf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chetrd_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chetrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chetri_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function chetrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chfrk_(__transr: string, __uplo: string, __trans: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __alpha: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __beta: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>): number;

declare function chgeqz_(__job: string, __compq: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __beta: interop.Reference<__CLPK_complex>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chla_transtype__(__ret_val: string, __ret_val_len: number, __trans: interop.Reference<number>): void;

declare function chpcon_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function chpev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chpevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chpevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chpgst_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __bp: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function chpgv_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __bp: interop.Reference<__CLPK_complex>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chpgvd_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __bp: interop.Reference<__CLPK_complex>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chpgvx_(__itype: interop.Reference<number>, __jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __bp: interop.Reference<__CLPK_complex>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chprfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __afp: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chpsv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chpsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __afp: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chptrd_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function chptrf_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chptri_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function chptrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chsein_(__side: string, __eigsrc: string, __initv: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __vl: interop.Reference<__CLPK_complex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_complex>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __ifaill: interop.Reference<number>, __ifailr: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function chseqr_(__job: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clabrd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<__CLPK_complex>, __taup: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __y: interop.Reference<__CLPK_complex>, __ldy: interop.Reference<number>): number;

declare function clacgv_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>): number;

declare function clacn2_(__n: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __est: interop.Reference<number>, __kase: interop.Reference<number>, __isave: interop.Reference<number>): number;

declare function clacon_(__n: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __est: interop.Reference<number>, __kase: interop.Reference<number>): number;

declare function clacp2_(__uplo: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>): number;

declare function clacpy_(__uplo: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>): number;

declare function clacrm_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __rwork: interop.Reference<number>): number;

declare function clacrt_(__n: interop.Reference<number>, __cx: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __cy: interop.Reference<__CLPK_complex>, __incy: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __s: interop.Reference<__CLPK_complex>): number;

declare function cladiv_(__ret_val: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __y: interop.Reference<__CLPK_complex>): void;

declare function claed0_(__qsiz: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __qstore: interop.Reference<__CLPK_complex>, __ldqs: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function claed7_(__n: interop.Reference<number>, __cutpnt: interop.Reference<number>, __qsiz: interop.Reference<number>, __tlvls: interop.Reference<number>, __curlvl: interop.Reference<number>, __curpbm: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __rho: interop.Reference<number>, __indxq: interop.Reference<number>, __qstore: interop.Reference<number>, __qptr: interop.Reference<number>, __prmptr: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __givnum: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function claed8_(__k: interop.Reference<number>, __n: interop.Reference<number>, __qsiz: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __d__: interop.Reference<number>, __rho: interop.Reference<number>, __cutpnt: interop.Reference<number>, __z__: interop.Reference<number>, __dlamda: interop.Reference<number>, __q2: interop.Reference<__CLPK_complex>, __ldq2: interop.Reference<number>, __w: interop.Reference<number>, __indxp: interop.Reference<number>, __indx: interop.Reference<number>, __indxq: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __givnum: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function claein_(__rightv: interop.Reference<number>, __noinit: interop.Reference<number>, __n: interop.Reference<number>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __v: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __rwork: interop.Reference<number>, __eps3: interop.Reference<number>, __smlnum: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function claesy_(__a: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __rt1: interop.Reference<__CLPK_complex>, __rt2: interop.Reference<__CLPK_complex>, __evscal: interop.Reference<__CLPK_complex>, __cs1: interop.Reference<__CLPK_complex>, __sn1: interop.Reference<__CLPK_complex>): number;

declare function claev2_(__a: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __rt1: interop.Reference<number>, __rt2: interop.Reference<number>, __cs1: interop.Reference<number>, __sn1: interop.Reference<__CLPK_complex>): number;

declare function clag2z_(__m: interop.Reference<number>, __n: interop.Reference<number>, __sa: interop.Reference<__CLPK_complex>, __ldsa: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clags2_(__upper: interop.Reference<number>, __a1: interop.Reference<number>, __a2: interop.Reference<__CLPK_complex>, __a3: interop.Reference<number>, __b1: interop.Reference<number>, __b2: interop.Reference<__CLPK_complex>, __b3: interop.Reference<number>, __csu: interop.Reference<number>, __snu: interop.Reference<__CLPK_complex>, __csv: interop.Reference<number>, __snv: interop.Reference<__CLPK_complex>, __csq: interop.Reference<number>, __snq: interop.Reference<__CLPK_complex>): number;

declare function clagtm_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __alpha: interop.Reference<number>, __dl: interop.Reference<__CLPK_complex>, __d__: interop.Reference<__CLPK_complex>, __du: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __beta: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>): number;

declare function clahef_(__uplo: string, __n: interop.Reference<number>, __nb: interop.Reference<number>, __kb: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __ldw: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clahqr_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clahr2_(__n: interop.Reference<number>, __k: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __y: interop.Reference<__CLPK_complex>, __ldy: interop.Reference<number>): number;

declare function clahrd_(__n: interop.Reference<number>, __k: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __y: interop.Reference<__CLPK_complex>, __ldy: interop.Reference<number>): number;

declare function claic1_(__job: interop.Reference<number>, __j: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __sest: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __gamma: interop.Reference<__CLPK_complex>, __sestpr: interop.Reference<number>, __s: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>): number;

declare function clals0_(__icompq: interop.Reference<number>, __nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __nrhs: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __bx: interop.Reference<__CLPK_complex>, __ldbx: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __givnum: interop.Reference<number>, __ldgnum: interop.Reference<number>, __poles: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __k: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clalsa_(__icompq: interop.Reference<number>, __smlsiz: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __bx: interop.Reference<__CLPK_complex>, __ldbx: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __k: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __poles: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __perm: interop.Reference<number>, __givnum: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clalsd_(__uplo: string, __smlsiz: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clangb_(__norm: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function clange_(__norm: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function clangt_(__norm: string, __n: interop.Reference<number>, __dl: interop.Reference<__CLPK_complex>, __d__: interop.Reference<__CLPK_complex>, __du: interop.Reference<__CLPK_complex>): number;

declare function clanhb_(__norm: string, __uplo: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function clanhe_(__norm: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function clanhf_(__norm: string, __transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __work: interop.Reference<number>): number;

declare function clanhp_(__norm: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __work: interop.Reference<number>): number;

declare function clanhs_(__norm: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function clanht_(__norm: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_complex>): number;

declare function clansb_(__norm: string, __uplo: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function clansp_(__norm: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __work: interop.Reference<number>): number;

declare function clansy_(__norm: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function clantb_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function clantp_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __work: interop.Reference<number>): number;

declare function clantr_(__norm: string, __uplo: string, __diag: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function clapll_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __y: interop.Reference<__CLPK_complex>, __incy: interop.Reference<number>, __ssmin: interop.Reference<number>): number;

declare function clapmt_(__forwrd: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __k: interop.Reference<number>): number;

declare function claqgb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function claqge_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function claqhb_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function claqhe_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function claqhp_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function claqp2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __offset: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __vn1: interop.Reference<number>, __vn2: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>): number;

declare function claqps_(__m: interop.Reference<number>, __n: interop.Reference<number>, __offset: interop.Reference<number>, __nb: interop.Reference<number>, __kb: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __vn1: interop.Reference<number>, __vn2: interop.Reference<number>, __auxv: interop.Reference<__CLPK_complex>, __f: interop.Reference<__CLPK_complex>, __ldf: interop.Reference<number>): number;

declare function claqr0_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function claqr1_(__n: interop.Reference<number>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __s1: interop.Reference<__CLPK_complex>, __s2: interop.Reference<__CLPK_complex>, __v: interop.Reference<__CLPK_complex>): number;

declare function claqr2_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nw: interop.Reference<number>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __ns: interop.Reference<number>, __nd: interop.Reference<number>, __sh: interop.Reference<__CLPK_complex>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __nh: interop.Reference<number>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<__CLPK_complex>, __ldwv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>): number;

declare function claqr3_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nw: interop.Reference<number>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __ns: interop.Reference<number>, __nd: interop.Reference<number>, __sh: interop.Reference<__CLPK_complex>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __nh: interop.Reference<number>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<__CLPK_complex>, __ldwv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>): number;

declare function claqr4_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function claqr5_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __kacc22: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nshfts: interop.Reference<number>, __s: interop.Reference<__CLPK_complex>, __h__: interop.Reference<__CLPK_complex>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __u: interop.Reference<__CLPK_complex>, __ldu: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<__CLPK_complex>, __ldwv: interop.Reference<number>, __nh: interop.Reference<number>, __wh: interop.Reference<__CLPK_complex>, __ldwh: interop.Reference<number>): number;

declare function claqsb_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function claqsp_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function claqsy_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function clar1v_(__n: interop.Reference<number>, __b1: interop.Reference<number>, __bn: interop.Reference<number>, __lambda: interop.Reference<number>, __d__: interop.Reference<number>, __l: interop.Reference<number>, __ld: interop.Reference<number>, __lld: interop.Reference<number>, __pivmin: interop.Reference<number>, __gaptol: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __wantnc: interop.Reference<number>, __negcnt: interop.Reference<number>, __ztz: interop.Reference<number>, __mingma: interop.Reference<number>, __r__: interop.Reference<number>, __isuppz: interop.Reference<number>, __nrminv: interop.Reference<number>, __resid: interop.Reference<number>, __rqcorr: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function clar2v_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __y: interop.Reference<__CLPK_complex>, __z__: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<__CLPK_complex>, __incc: interop.Reference<number>): number;

declare function clarcm_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __rwork: interop.Reference<number>): number;

declare function clarf_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __incv: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>): number;

declare function clarfb_(__side: string, __trans: string, __direct: string, __storev: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __ldwork: interop.Reference<number>): number;

declare function clarfg_(__n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>): number;

declare function clarfp_(__n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>): number;

declare function clarft_(__direct: string, __storev: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>): number;

declare function clarfx_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>): number;

declare function clargv_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __y: interop.Reference<__CLPK_complex>, __incy: interop.Reference<number>, __c__: interop.Reference<number>, __incc: interop.Reference<number>): number;

declare function clarnv_(__idist: interop.Reference<number>, __iseed: interop.Reference<number>, __n: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>): number;

declare function clarrv_(__n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __d__: interop.Reference<number>, __l: interop.Reference<number>, __pivmin: interop.Reference<number>, __isplit: interop.Reference<number>, __m: interop.Reference<number>, __dol: interop.Reference<number>, __dou: interop.Reference<number>, __minrgp: interop.Reference<number>, __rtol1: interop.Reference<number>, __rtol2: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __wgap: interop.Reference<number>, __iblock: interop.Reference<number>, __indexw: interop.Reference<number>, __gers: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clarscl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>): number;

declare function clartg_(__f: interop.Reference<__CLPK_complex>, __g: interop.Reference<__CLPK_complex>, __cs: interop.Reference<number>, __sn: interop.Reference<__CLPK_complex>, __r__: interop.Reference<__CLPK_complex>): number;

declare function clartv_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __y: interop.Reference<__CLPK_complex>, __incy: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<__CLPK_complex>, __incc: interop.Reference<number>): number;

declare function clarz_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __l: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __incv: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>): number;

declare function clarzb_(__side: string, __trans: string, __direct: string, __storev: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __ldwork: interop.Reference<number>): number;

declare function clarzt_(__direct: string, __storev: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>): number;

declare function clascl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>): number;

declare function clascl_(__type__: string, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __cfrom: interop.Reference<number>, __cto: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function claset_(__uplo: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __beta: interop.Reference<__CLPK_complex>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>): number;

declare function clasr_(__side: string, __pivot: string, __direct: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>): number;

declare function classq_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __scale: interop.Reference<number>, __sumsq: interop.Reference<number>): number;

declare function claswp_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __k1: interop.Reference<number>, __k2: interop.Reference<number>, __ipiv: interop.Reference<number>, __incx: interop.Reference<number>): number;

declare function clasyf_(__uplo: string, __n: interop.Reference<number>, __nb: interop.Reference<number>, __kb: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __ldw: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clatbs_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clatdf_(__ijob: interop.Reference<number>, __n: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __rhs: interop.Reference<__CLPK_complex>, __rdsum: interop.Reference<number>, __rdscal: interop.Reference<number>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>): number;

declare function clatps_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clatrd_(__uplo: string, __n: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __w: interop.Reference<__CLPK_complex>, __ldw: interop.Reference<number>): number;

declare function clatrs_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clatrz_(__m: interop.Reference<number>, __n: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>): number;

declare function clatzm_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __incv: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c1: interop.Reference<__CLPK_complex>, __c2: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>): number;

declare function clauu2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function clauum_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function conv(__A: interop.Reference<number>, __IA: number, __F: interop.Reference<number>, __IF: number, __C: interop.Reference<number>, __IC: number, __N: number, __P: number): void;

declare function convD(__A: interop.Reference<number>, __IA: number, __F: interop.Reference<number>, __IF: number, __C: interop.Reference<number>, __IC: number, __N: number, __P: number): void;

declare function cpbcon_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpbequ_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpbrfs_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __afb: interop.Reference<__CLPK_complex>, __ldafb: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpbstf_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpbsv_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpbsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __afb: interop.Reference<__CLPK_complex>, __ldafb: interop.Reference<number>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpbtf2_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpbtrf_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpbtrs_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpftrf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cpftri_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cpftrs_(__transr: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpocon_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpoequ_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpoequb_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cporfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_complex>, __ldaf: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cposv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cposvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_complex>, __ldaf: interop.Reference<number>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpotf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpotrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpotri_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpotrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cppcon_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cppequ_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpprfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __afp: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cppsv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cppsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __afp: interop.Reference<__CLPK_complex>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpptrf_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cpptri_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cpptrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpstf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __piv: interop.Reference<number>, __rank: interop.Reference<number>, __tol: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpstrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __piv: interop.Reference<number>, __rank: interop.Reference<number>, __tol: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cptcon_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_complex>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpteqr_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cptrfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_complex>, __df: interop.Reference<number>, __ef: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cptsv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cptsvx_(__fact: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_complex>, __df: interop.Reference<number>, __ef: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cpttrf_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cpttrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cptts2_(__iuplo: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>): number;

declare function create_fftsetup(__Log2n: number, __Radix: number): interop.Pointer;

declare function create_fftsetupD(__Log2n: number, __Radix: number): interop.Pointer;

declare function crot_(__n: interop.Reference<number>, __cx: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __cy: interop.Reference<__CLPK_complex>, __incy: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<__CLPK_complex>): number;

declare function cspcon_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cspmv_(__uplo: string, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __ap: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __beta: interop.Reference<__CLPK_complex>, __y: interop.Reference<__CLPK_complex>, __incy: interop.Reference<number>): number;

declare function cspr_(__uplo: string, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>): number;

declare function csprfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __afp: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cspsv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cspsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __afp: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function csptrf_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function csptri_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function csptrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function csrscl_(__n: interop.Reference<number>, __sa: interop.Reference<number>, __sx: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>): number;

declare function cstedc_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cstegr_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cstein_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __iblock: interop.Reference<number>, __isplit: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cstemr_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __nzc: interop.Reference<number>, __isuppz: interop.Reference<number>, __tryrac: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function csteqr_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function csycon_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function csyequb_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function csymv_(__uplo: string, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __beta: interop.Reference<__CLPK_complex>, __y: interop.Reference<__CLPK_complex>, __incy: interop.Reference<number>): number;

declare function csyr_(__uplo: string, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __x: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>): number;

declare function csyrfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_complex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function csysv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function csysvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_complex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function csytf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function csytrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function csytri_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function csytrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctbcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctbrfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctbtrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_complex>, __ldab: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctfsm_(__transr: string, __side: string, __uplo: string, __trans: string, __diag: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __a: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>): number;

declare function ctftri_(__transr: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function ctfttp_(__transr: string, __uplo: string, __n: interop.Reference<number>, __arf: interop.Reference<__CLPK_complex>, __ap: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function ctfttr_(__transr: string, __uplo: string, __n: interop.Reference<number>, __arf: interop.Reference<__CLPK_complex>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctgevc_(__side: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __s: interop.Reference<__CLPK_complex>, __lds: interop.Reference<number>, __p: interop.Reference<__CLPK_complex>, __ldp: interop.Reference<number>, __vl: interop.Reference<__CLPK_complex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_complex>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctgex2_(__wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __j1: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctgexc_(__wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __ifst: interop.Reference<number>, __ilst: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctgsen_(__ijob: interop.Reference<number>, __wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __select: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<__CLPK_complex>, __beta: interop.Reference<__CLPK_complex>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __z__: interop.Reference<__CLPK_complex>, __ldz: interop.Reference<number>, __m: interop.Reference<number>, __pl: interop.Reference<number>, __pr: interop.Reference<number>, __dif: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctgsja_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __tola: interop.Reference<number>, __tolb: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<__CLPK_complex>, __ldu: interop.Reference<number>, __v: interop.Reference<__CLPK_complex>, __ldv: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __ncycle: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctgsna_(__job: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __vl: interop.Reference<__CLPK_complex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_complex>, __ldvr: interop.Reference<number>, __s: interop.Reference<number>, __dif: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctgsy2_(__trans: string, __ijob: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __d__: interop.Reference<__CLPK_complex>, __ldd: interop.Reference<number>, __e: interop.Reference<__CLPK_complex>, __lde: interop.Reference<number>, __f: interop.Reference<__CLPK_complex>, __ldf: interop.Reference<number>, __scale: interop.Reference<number>, __rdsum: interop.Reference<number>, __rdscal: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctgsyl_(__trans: string, __ijob: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __d__: interop.Reference<__CLPK_complex>, __ldd: interop.Reference<number>, __e: interop.Reference<__CLPK_complex>, __lde: interop.Reference<number>, __f: interop.Reference<__CLPK_complex>, __ldf: interop.Reference<number>, __scale: interop.Reference<number>, __dif: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctoz(__C: interop.Reference<DSPComplex>, __IC: number, __Z: interop.Reference<DSPSplitComplex>, __IZ: number, __N: number): void;

declare function ctozD(__C: interop.Reference<DSPDoubleComplex>, __IC: number, __Z: interop.Reference<DSPDoubleSplitComplex>, __IZ: number, __N: number): void;

declare function ctpcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctprfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctptri_(__uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function ctptrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctpttf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __arf: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function ctpttr_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrevc_(__side: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __vl: interop.Reference<__CLPK_complex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_complex>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrexc_(__compq: string, __n: interop.Reference<number>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __ifst: interop.Reference<number>, __ilst: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrrfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_complex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrsen_(__job: string, __compq: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __w: interop.Reference<__CLPK_complex>, __m: interop.Reference<number>, __s: interop.Reference<number>, __sep: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrsna_(__job: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<__CLPK_complex>, __ldt: interop.Reference<number>, __vl: interop.Reference<__CLPK_complex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_complex>, __ldvr: interop.Reference<number>, __s: interop.Reference<number>, __sep: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __ldwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrsyl_(__trana: string, __tranb: string, __isgn: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __scale: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrti2_(__uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrtri_(__uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrtrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_complex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ctrttf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __arf: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function ctrttp_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function ctzrqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function ctzrzf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cung2l_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cung2r_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cungbr_(__vect: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cunghr_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cungl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cunglq_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cungql_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cungqr_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cungr2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cungrq_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cungtr_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cunm2l_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cunm2r_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cunmbr_(__vect: string, __side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cunmhr_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cunml2_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cunmlq_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cunmql_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cunmqr_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cunmr2_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cunmr3_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cunmrq_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cunmrz_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cunmtr_(__side: string, __uplo: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function cupgtr_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __tau: interop.Reference<__CLPK_complex>, __q: interop.Reference<__CLPK_complex>, __ldq: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function cupmtr_(__side: string, __uplo: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_complex>, __tau: interop.Reference<__CLPK_complex>, __c__: interop.Reference<__CLPK_complex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_complex>, __info: interop.Reference<number>): number;

declare function dbdsdc_(__uplo: string, __compq: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __q: interop.Reference<number>, __iq: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dbdsqr_(__uplo: string, __n: interop.Reference<number>, __ncvt: interop.Reference<number>, __nru: interop.Reference<number>, __ncc: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ddisna_(__job: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __sep: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function destroy_fftsetup(__setup: interop.Pointer): void;

declare function destroy_fftsetupD(__setup: interop.Pointer): void;

declare function dgbbrd_(__vect: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ncc: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __pt: interop.Reference<number>, __ldpt: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgbcon_(__norm: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgbequ_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgbequb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgbrfs_(__trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __afb: interop.Reference<number>, __ldafb: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgbsv_(__n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgbsvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __afb: interop.Reference<number>, __ldafb: interop.Reference<number>, __ipiv: interop.Reference<number>, __equed: string, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgbtf2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgbtrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgbtrs_(__trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgebak_(__job: string, __side: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __m: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgebal_(__job: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgebd2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<number>, __taup: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgebrd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<number>, __taup: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgecon_(__norm: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeequ_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeequb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgees_(__jobvs: string, __sort: string, __select: interop.FunctionReference<() => number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __sdim: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vs: interop.Reference<number>, __ldvs: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeesx_(__jobvs: string, __sort: string, __select: interop.FunctionReference<() => number>, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __sdim: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vs: interop.Reference<number>, __ldvs: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeev_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeevx_(__balanc: string, __jobvl: string, __jobvr: string, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __abnrm: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgegs_(__jobvsl: string, __jobvsr: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vsl: interop.Reference<number>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<number>, __ldvsr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgegv_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgehd2_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgehrd_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgejsv_(__joba: string, __jobu: string, __jobv: string, __jobr: string, __jobt: string, __jobp: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __sva: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgelq2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgelqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgels_(__trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgelsd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __s: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgelss_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __s: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgelsx_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __jpvt: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgelsy_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __jpvt: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeql2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeqlf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeqp3_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeqpf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeqr2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgeqrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgerfs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgerq2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgerqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgesc2_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __rhs: interop.Reference<number>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>, __scale: interop.Reference<number>): number;

declare function dgesdd_(__jobz: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgesv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgesvd_(__jobu: string, __jobvt: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgesvj_(__joba: string, __jobu: string, __jobv: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __sva: interop.Reference<number>, __mv: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgesvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __equed: string, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgetc2_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgetf2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgetrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgetri_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgetrs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dggbak_(__job: string, __side: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __m: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dggbal_(__job: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgges_(__jobvsl: string, __jobvsr: string, __sort: string, __selctg: interop.FunctionReference<() => number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __sdim: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vsl: interop.Reference<number>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<number>, __ldvsr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dggesx_(__jobvsl: string, __jobvsr: string, __sort: string, __selctg: interop.FunctionReference<() => number>, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __sdim: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vsl: interop.Reference<number>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<number>, __ldvsr: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dggev_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dggevx_(__balanc: string, __jobvl: string, __jobvr: string, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __abnrm: interop.Reference<number>, __bbnrm: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dggglm_(__n: interop.Reference<number>, __m: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<number>, __y: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgghrd_(__compq: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgglse_(__m: interop.Reference<number>, __n: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __c__: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dggqrf_(__n: interop.Reference<number>, __m: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __taua: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __taub: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dggrqf_(__m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __taua: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __taub: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dggsvd_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __p: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dggsvp_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __tola: interop.Reference<number>, __tolb: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __iwork: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgsvj0_(__jobv: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __sva: interop.Reference<number>, __mv: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __eps: interop.Reference<number>, __sfmin: interop.Reference<number>, __tol: interop.Reference<number>, __nsweep: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgsvj1_(__jobv: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __n1: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __sva: interop.Reference<number>, __mv: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __eps: interop.Reference<number>, __sfmin: interop.Reference<number>, __tol: interop.Reference<number>, __nsweep: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgtcon_(__norm: string, __n: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgtrfs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __dlf: interop.Reference<number>, __df: interop.Reference<number>, __duf: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgtsv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgtsvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __dlf: interop.Reference<number>, __df: interop.Reference<number>, __duf: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgttrf_(__n: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgttrs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dgtts2_(__itrans: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>): number;

declare function dhgeqz_(__job: string, __compq: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dhsein_(__side: string, __eigsrc: string, __initv: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<number>, __ifaill: interop.Reference<number>, __ifailr: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dhseqr_(__job: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function disnan_(__din: interop.Reference<number>): number;

declare function dlabad_(__small: interop.Reference<number>, __large: interop.Reference<number>): number;

declare function dlabrd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<number>, __taup: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __y: interop.Reference<number>, __ldy: interop.Reference<number>): number;

declare function dlacn2_(__n: interop.Reference<number>, __v: interop.Reference<number>, __x: interop.Reference<number>, __isgn: interop.Reference<number>, __est: interop.Reference<number>, __kase: interop.Reference<number>, __isave: interop.Reference<number>): number;

declare function dlacon_(__n: interop.Reference<number>, __v: interop.Reference<number>, __x: interop.Reference<number>, __isgn: interop.Reference<number>, __est: interop.Reference<number>, __kase: interop.Reference<number>): number;

declare function dlacpy_(__uplo: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>): number;

declare function dladiv_(__a: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __d__: interop.Reference<number>, __p: interop.Reference<number>, __q: interop.Reference<number>): number;

declare function dlae2_(__a: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __rt1: interop.Reference<number>, __rt2: interop.Reference<number>): number;

declare function dlaebz_(__ijob: interop.Reference<number>, __nitmax: interop.Reference<number>, __n: interop.Reference<number>, __mmax: interop.Reference<number>, __minp: interop.Reference<number>, __nbmin: interop.Reference<number>, __abstol: interop.Reference<number>, __reltol: interop.Reference<number>, __pivmin: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __e2: interop.Reference<number>, __nval: interop.Reference<number>, __ab: interop.Reference<number>, __c__: interop.Reference<number>, __mout: interop.Reference<number>, __nab: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaed0_(__icompq: interop.Reference<number>, __qsiz: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __qstore: interop.Reference<number>, __ldqs: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaed1_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __indxq: interop.Reference<number>, __rho: interop.Reference<number>, __cutpnt: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaed2_(__k: interop.Reference<number>, __n: interop.Reference<number>, __n1: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __indxq: interop.Reference<number>, __rho: interop.Reference<number>, __z__: interop.Reference<number>, __dlamda: interop.Reference<number>, __w: interop.Reference<number>, __q2: interop.Reference<number>, __indx: interop.Reference<number>, __indxc: interop.Reference<number>, __indxp: interop.Reference<number>, __coltyp: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaed3_(__k: interop.Reference<number>, __n: interop.Reference<number>, __n1: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __rho: interop.Reference<number>, __dlamda: interop.Reference<number>, __q2: interop.Reference<number>, __indx: interop.Reference<number>, __ctot: interop.Reference<number>, __w: interop.Reference<number>, __s: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaed4_(__n: interop.Reference<number>, __i__: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __delta: interop.Reference<number>, __rho: interop.Reference<number>, __dlam: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaed5_(__i__: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __delta: interop.Reference<number>, __rho: interop.Reference<number>, __dlam: interop.Reference<number>): number;

declare function dlaed6_(__kniter: interop.Reference<number>, __orgati: interop.Reference<number>, __rho: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __finit: interop.Reference<number>, __tau: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaed7_(__icompq: interop.Reference<number>, __n: interop.Reference<number>, __qsiz: interop.Reference<number>, __tlvls: interop.Reference<number>, __curlvl: interop.Reference<number>, __curpbm: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __indxq: interop.Reference<number>, __rho: interop.Reference<number>, __cutpnt: interop.Reference<number>, __qstore: interop.Reference<number>, __qptr: interop.Reference<number>, __prmptr: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __givnum: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaed8_(__icompq: interop.Reference<number>, __k: interop.Reference<number>, __n: interop.Reference<number>, __qsiz: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __indxq: interop.Reference<number>, __rho: interop.Reference<number>, __cutpnt: interop.Reference<number>, __z__: interop.Reference<number>, __dlamda: interop.Reference<number>, __q2: interop.Reference<number>, __ldq2: interop.Reference<number>, __w: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __givnum: interop.Reference<number>, __indxp: interop.Reference<number>, __indx: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaed9_(__k: interop.Reference<number>, __kstart: interop.Reference<number>, __kstop: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __rho: interop.Reference<number>, __dlamda: interop.Reference<number>, __w: interop.Reference<number>, __s: interop.Reference<number>, __lds: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaeda_(__n: interop.Reference<number>, __tlvls: interop.Reference<number>, __curlvl: interop.Reference<number>, __curpbm: interop.Reference<number>, __prmptr: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __givnum: interop.Reference<number>, __q: interop.Reference<number>, __qptr: interop.Reference<number>, __z__: interop.Reference<number>, __ztemp: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaein_(__rightv: interop.Reference<number>, __noinit: interop.Reference<number>, __n: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vr: interop.Reference<number>, __vi: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __work: interop.Reference<number>, __eps3: interop.Reference<number>, __smlnum: interop.Reference<number>, __bignum: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaev2_(__a: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __rt1: interop.Reference<number>, __rt2: interop.Reference<number>, __cs1: interop.Reference<number>, __sn1: interop.Reference<number>): number;

declare function dlaexc_(__wantq: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __j1: interop.Reference<number>, __n1: interop.Reference<number>, __n2: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlag2_(__a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __safmin: interop.Reference<number>, __scale1: interop.Reference<number>, __scale2: interop.Reference<number>, __wr1: interop.Reference<number>, __wr2: interop.Reference<number>, __wi: interop.Reference<number>): number;

declare function dlag2s_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __sa: interop.Reference<number>, __ldsa: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlags2_(__upper: interop.Reference<number>, __a1: interop.Reference<number>, __a2: interop.Reference<number>, __a3: interop.Reference<number>, __b1: interop.Reference<number>, __b2: interop.Reference<number>, __b3: interop.Reference<number>, __csu: interop.Reference<number>, __snu: interop.Reference<number>, __csv: interop.Reference<number>, __snv: interop.Reference<number>, __csq: interop.Reference<number>, __snq: interop.Reference<number>): number;

declare function dlagtf_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lambda: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __tol: interop.Reference<number>, __d__: interop.Reference<number>, __in: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlagtm_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __alpha: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __beta: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>): number;

declare function dlagts_(__job: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __d__: interop.Reference<number>, __in: interop.Reference<number>, __y: interop.Reference<number>, __tol: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlagv2_(__a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __csl: interop.Reference<number>, __snl: interop.Reference<number>, __csr: interop.Reference<number>, __snr: interop.Reference<number>): number;

declare function dlahqr_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlahr2_(__n: interop.Reference<number>, __k: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __y: interop.Reference<number>, __ldy: interop.Reference<number>): number;

declare function dlahrd_(__n: interop.Reference<number>, __k: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __y: interop.Reference<number>, __ldy: interop.Reference<number>): number;

declare function dlaic1_(__job: interop.Reference<number>, __j: interop.Reference<number>, __x: interop.Reference<number>, __sest: interop.Reference<number>, __w: interop.Reference<number>, __gamma: interop.Reference<number>, __sestpr: interop.Reference<number>, __s: interop.Reference<number>, __c__: interop.Reference<number>): number;

declare function dlaisnan_(__din1: interop.Reference<number>, __din2: interop.Reference<number>): number;

declare function dlaln2_(__ltrans: interop.Reference<number>, __na: interop.Reference<number>, __nw: interop.Reference<number>, __smin: interop.Reference<number>, __ca: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d1: interop.Reference<number>, __d2: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __scale: interop.Reference<number>, __xnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlals0_(__icompq: interop.Reference<number>, __nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __nrhs: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __bx: interop.Reference<number>, __ldbx: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __givnum: interop.Reference<number>, __ldgnum: interop.Reference<number>, __poles: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __k: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlalsa_(__icompq: interop.Reference<number>, __smlsiz: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __bx: interop.Reference<number>, __ldbx: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __k: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __poles: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __perm: interop.Reference<number>, __givnum: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlalsd_(__uplo: string, __smlsiz: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlamc1_(__beta: interop.Reference<number>, __t: interop.Reference<number>, __rnd: interop.Reference<number>, __ieee1: interop.Reference<number>): number;

declare function dlamc1_Function(__beta: interop.Reference<number>, __t: interop.Reference<number>, __rnd: interop.Reference<number>, __ieee1: interop.Reference<number>): number;

declare function dlamc2_(__beta: interop.Reference<number>, __t: interop.Reference<number>, __rnd: interop.Reference<number>, __eps: interop.Reference<number>, __emin: interop.Reference<number>, __rmin: interop.Reference<number>, __emax: interop.Reference<number>, __rmax: interop.Reference<number>): number;

declare function dlamc3_(__a: interop.Reference<number>, __b: interop.Reference<number>): number;

declare function dlamc4_(__emin: interop.Reference<number>, __start: interop.Reference<number>, __base: interop.Reference<number>): number;

declare function dlamc5_(__beta: interop.Reference<number>, __p: interop.Reference<number>, __emin: interop.Reference<number>, __ieee: interop.Reference<number>, __emax: interop.Reference<number>, __rmax: interop.Reference<number>): number;

declare function dlamch_(__cmach: string): number;

declare function dlamrg_(__n1: interop.Reference<number>, __n2: interop.Reference<number>, __a: interop.Reference<number>, __dtrd1: interop.Reference<number>, __dtrd2: interop.Reference<number>, __index: interop.Reference<number>): number;

declare function dlaneg_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __lld: interop.Reference<number>, __sigma: interop.Reference<number>, __pivmin: interop.Reference<number>, __r__: interop.Reference<number>): number;

declare function dlangb_(__norm: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlange_(__norm: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlangt_(__norm: string, __n: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>): number;

declare function dlanhs_(__norm: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlansb_(__norm: string, __uplo: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlansf_(__norm: string, __transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlansp_(__norm: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlanst_(__norm: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>): number;

declare function dlansy_(__norm: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlantb_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlantp_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlantr_(__norm: string, __uplo: string, __diag: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlanv2_(__a: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __d__: interop.Reference<number>, __rt1r: interop.Reference<number>, __rt1i: interop.Reference<number>, __rt2r: interop.Reference<number>, __rt2i: interop.Reference<number>, __cs: interop.Reference<number>, __sn: interop.Reference<number>): number;

declare function dlapll_(__n: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __y: interop.Reference<number>, __incy: interop.Reference<number>, __ssmin: interop.Reference<number>): number;

declare function dlapmt_(__forwrd: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __k: interop.Reference<number>): number;

declare function dlapy2_(__x: interop.Reference<number>, __y: interop.Reference<number>): number;

declare function dlapy3_(__x: interop.Reference<number>, __y: interop.Reference<number>, __z__: interop.Reference<number>): number;

declare function dlaqgb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function dlaqge_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function dlaqp2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __offset: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<number>, __vn1: interop.Reference<number>, __vn2: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlaqps_(__m: interop.Reference<number>, __n: interop.Reference<number>, __offset: interop.Reference<number>, __nb: interop.Reference<number>, __kb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<number>, __vn1: interop.Reference<number>, __vn2: interop.Reference<number>, __auxv: interop.Reference<number>, __f: interop.Reference<number>, __ldf: interop.Reference<number>): number;

declare function dlaqr0_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaqr1_(__n: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __sr1: interop.Reference<number>, __si1: interop.Reference<number>, __sr2: interop.Reference<number>, __si2: interop.Reference<number>, __v: interop.Reference<number>): number;

declare function dlaqr2_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nw: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __ns: interop.Reference<number>, __nd: interop.Reference<number>, __sr: interop.Reference<number>, __si: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __nh: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<number>, __ldwv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>): number;

declare function dlaqr3_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nw: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __ns: interop.Reference<number>, __nd: interop.Reference<number>, __sr: interop.Reference<number>, __si: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __nh: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<number>, __ldwv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>): number;

declare function dlaqr4_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlaqr5_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __kacc22: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nshfts: interop.Reference<number>, __sr: interop.Reference<number>, __si: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<number>, __ldwv: interop.Reference<number>, __nh: interop.Reference<number>, __wh: interop.Reference<number>, __ldwh: interop.Reference<number>): number;

declare function dlaqsb_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function dlaqsp_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function dlaqsy_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function dlaqtr_(__ltran: interop.Reference<number>, __l__CLPK_real: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __b: interop.Reference<number>, __w: interop.Reference<number>, __scale: interop.Reference<number>, __x: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlar1v_(__n: interop.Reference<number>, __b1: interop.Reference<number>, __bn: interop.Reference<number>, __lambda: interop.Reference<number>, __d__: interop.Reference<number>, __l: interop.Reference<number>, __ld: interop.Reference<number>, __lld: interop.Reference<number>, __pivmin: interop.Reference<number>, __gaptol: interop.Reference<number>, __z__: interop.Reference<number>, __wantnc: interop.Reference<number>, __negcnt: interop.Reference<number>, __ztz: interop.Reference<number>, __mingma: interop.Reference<number>, __r__: interop.Reference<number>, __isuppz: interop.Reference<number>, __nrminv: interop.Reference<number>, __resid: interop.Reference<number>, __rqcorr: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlar2v_(__n: interop.Reference<number>, __x: interop.Reference<number>, __y: interop.Reference<number>, __z__: interop.Reference<number>, __incx: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __incc: interop.Reference<number>): number;

declare function dlarf_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<number>, __incv: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlarfb_(__side: string, __trans: string, __direct: string, __storev: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __ldwork: interop.Reference<number>): number;

declare function dlarfg_(__n: interop.Reference<number>, __alpha: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __tau: interop.Reference<number>): number;

declare function dlarfp_(__n: interop.Reference<number>, __alpha: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __tau: interop.Reference<number>): number;

declare function dlarft_(__direct: string, __storev: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __tau: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>): number;

declare function dlarfx_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlargv_(__n: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __y: interop.Reference<number>, __incy: interop.Reference<number>, __c__: interop.Reference<number>, __incc: interop.Reference<number>): number;

declare function dlarnv_(__idist: interop.Reference<number>, __iseed: interop.Reference<number>, __n: interop.Reference<number>, __x: interop.Reference<number>): number;

declare function dlarra_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __e2: interop.Reference<number>, __spltol: interop.Reference<number>, __tnrm: interop.Reference<number>, __nsplit: interop.Reference<number>, __isplit: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlarrb_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __lld: interop.Reference<number>, __ifirst: interop.Reference<number>, __ilast: interop.Reference<number>, __rtol1: interop.Reference<number>, __rtol2: interop.Reference<number>, __offset: interop.Reference<number>, __w: interop.Reference<number>, __wgap: interop.Reference<number>, __werr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __pivmin: interop.Reference<number>, __spdiam: interop.Reference<number>, __twist: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlarrc_(__jobt: string, __n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __pivmin: interop.Reference<number>, __eigcnt: interop.Reference<number>, __lcnt: interop.Reference<number>, __rcnt: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlarrd_(__range: string, __order: string, __n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __gers: interop.Reference<number>, __reltol: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __e2: interop.Reference<number>, __pivmin: interop.Reference<number>, __nsplit: interop.Reference<number>, __isplit: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __wl: interop.Reference<number>, __wu: interop.Reference<number>, __iblock: interop.Reference<number>, __indexw: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlarre_(__range: string, __n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __e2: interop.Reference<number>, __rtol1: interop.Reference<number>, __rtol2: interop.Reference<number>, __spltol: interop.Reference<number>, __nsplit: interop.Reference<number>, __isplit: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __wgap: interop.Reference<number>, __iblock: interop.Reference<number>, __indexw: interop.Reference<number>, __gers: interop.Reference<number>, __pivmin: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlarrf_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __l: interop.Reference<number>, __ld: interop.Reference<number>, __clstrt: interop.Reference<number>, __clend: interop.Reference<number>, __w: interop.Reference<number>, __wgap: interop.Reference<number>, __werr: interop.Reference<number>, __spdiam: interop.Reference<number>, __clgapl: interop.Reference<number>, __clgapr: interop.Reference<number>, __pivmin: interop.Reference<number>, __sigma: interop.Reference<number>, __dplus: interop.Reference<number>, __lplus: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlarrj_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e2: interop.Reference<number>, __ifirst: interop.Reference<number>, __ilast: interop.Reference<number>, __rtol: interop.Reference<number>, __offset: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __pivmin: interop.Reference<number>, __spdiam: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlarrk_(__n: interop.Reference<number>, __iw: interop.Reference<number>, __gl: interop.Reference<number>, __gu: interop.Reference<number>, __d__: interop.Reference<number>, __e2: interop.Reference<number>, __pivmin: interop.Reference<number>, __reltol: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlarrr_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlarrv_(__n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __d__: interop.Reference<number>, __l: interop.Reference<number>, __pivmin: interop.Reference<number>, __isplit: interop.Reference<number>, __m: interop.Reference<number>, __dol: interop.Reference<number>, __dou: interop.Reference<number>, __minrgp: interop.Reference<number>, __rtol1: interop.Reference<number>, __rtol2: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __wgap: interop.Reference<number>, __iblock: interop.Reference<number>, __indexw: interop.Reference<number>, __gers: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlarscl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>): number;

declare function dlartg_(__f: interop.Reference<number>, __g: interop.Reference<number>, __cs: interop.Reference<number>, __sn: interop.Reference<number>, __r__: interop.Reference<number>): number;

declare function dlartv_(__n: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __y: interop.Reference<number>, __incy: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __incc: interop.Reference<number>): number;

declare function dlaruv_(__iseed: interop.Reference<number>, __n: interop.Reference<number>, __x: interop.Reference<number>): number;

declare function dlarz_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __l: interop.Reference<number>, __v: interop.Reference<number>, __incv: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlarzb_(__side: string, __trans: string, __direct: string, __storev: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __ldwork: interop.Reference<number>): number;

declare function dlarzt_(__direct: string, __storev: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __tau: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>): number;

declare function dlas2_(__f: interop.Reference<number>, __g: interop.Reference<number>, __h__: interop.Reference<number>, __ssmin: interop.Reference<number>, __ssmax: interop.Reference<number>): number;

declare function dlascl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>): number;

declare function dlascl_(__type__: string, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __cfrom: interop.Reference<number>, __cto: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasd0_(__n: interop.Reference<number>, __sqre: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __smlsiz: interop.Reference<number>, __iwork: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasd1_(__nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __d__: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __idxq: interop.Reference<number>, __iwork: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasd2_(__nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __k: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __dsigma: interop.Reference<number>, __u2: interop.Reference<number>, __ldu2: interop.Reference<number>, __vt2: interop.Reference<number>, __ldvt2: interop.Reference<number>, __idxp: interop.Reference<number>, __idx: interop.Reference<number>, __idxc: interop.Reference<number>, __idxq: interop.Reference<number>, __coltyp: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasd3_(__nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __k: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __dsigma: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __u2: interop.Reference<number>, __ldu2: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __vt2: interop.Reference<number>, __ldvt2: interop.Reference<number>, __idxc: interop.Reference<number>, __ctot: interop.Reference<number>, __z__: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasd4_(__n: interop.Reference<number>, __i__: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __delta: interop.Reference<number>, __rho: interop.Reference<number>, __sigma: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasd5_(__i__: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __delta: interop.Reference<number>, __rho: interop.Reference<number>, __dsigma: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlasd6_(__icompq: interop.Reference<number>, __nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __d__: interop.Reference<number>, __vf: interop.Reference<number>, __vl: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __idxq: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __givnum: interop.Reference<number>, __ldgnum: interop.Reference<number>, __poles: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __k: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasd7_(__icompq: interop.Reference<number>, __nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __k: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __zw: interop.Reference<number>, __vf: interop.Reference<number>, __vfw: interop.Reference<number>, __vl: interop.Reference<number>, __vlw: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __dsigma: interop.Reference<number>, __idx: interop.Reference<number>, __idxp: interop.Reference<number>, __idxq: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __givnum: interop.Reference<number>, __ldgnum: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasd8_(__icompq: interop.Reference<number>, __k: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __vf: interop.Reference<number>, __vl: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __lddifr: interop.Reference<number>, __dsigma: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasda_(__icompq: interop.Reference<number>, __smlsiz: interop.Reference<number>, __n: interop.Reference<number>, __sqre: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __k: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __poles: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __perm: interop.Reference<number>, __givnum: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasdq_(__uplo: string, __sqre: interop.Reference<number>, __n: interop.Reference<number>, __ncvt: interop.Reference<number>, __nru: interop.Reference<number>, __ncc: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasdt_(__n: interop.Reference<number>, __lvl: interop.Reference<number>, __nd: interop.Reference<number>, __inode: interop.Reference<number>, __ndiml: interop.Reference<number>, __ndimr: interop.Reference<number>, __msub: interop.Reference<number>): number;

declare function dlaset_(__uplo: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>): number;

declare function dlasq1_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasq2_(__n: interop.Reference<number>, __z__: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasq3_(__i0: interop.Reference<number>, __n0: interop.Reference<number>, __z__: interop.Reference<number>, __pp: interop.Reference<number>, __dmin__: interop.Reference<number>, __sigma: interop.Reference<number>, __desig: interop.Reference<number>, __qmax: interop.Reference<number>, __nfail: interop.Reference<number>, __iter: interop.Reference<number>, __ndiv: interop.Reference<number>, __ieee: interop.Reference<number>, __ttype: interop.Reference<number>, __dmin1: interop.Reference<number>, __dmin2: interop.Reference<number>, __dn: interop.Reference<number>, __dn1: interop.Reference<number>, __dn2: interop.Reference<number>, __g: interop.Reference<number>, __tau: interop.Reference<number>): number;

declare function dlasq4_(__i0: interop.Reference<number>, __n0: interop.Reference<number>, __z__: interop.Reference<number>, __pp: interop.Reference<number>, __n0in: interop.Reference<number>, __dmin__: interop.Reference<number>, __dmin1: interop.Reference<number>, __dmin2: interop.Reference<number>, __dn: interop.Reference<number>, __dn1: interop.Reference<number>, __dn2: interop.Reference<number>, __tau: interop.Reference<number>, __ttype: interop.Reference<number>, __g: interop.Reference<number>): number;

declare function dlasq5_(__i0: interop.Reference<number>, __n0: interop.Reference<number>, __z__: interop.Reference<number>, __pp: interop.Reference<number>, __tau: interop.Reference<number>, __dmin__: interop.Reference<number>, __dmin1: interop.Reference<number>, __dmin2: interop.Reference<number>, __dn: interop.Reference<number>, __dnm1: interop.Reference<number>, __dnm2: interop.Reference<number>, __ieee: interop.Reference<number>): number;

declare function dlasq6_(__i0: interop.Reference<number>, __n0: interop.Reference<number>, __z__: interop.Reference<number>, __pp: interop.Reference<number>, __dmin__: interop.Reference<number>, __dmin1: interop.Reference<number>, __dmin2: interop.Reference<number>, __dn: interop.Reference<number>, __dnm1: interop.Reference<number>, __dnm2: interop.Reference<number>): number;

declare function dlasr_(__side: string, __pivot: string, __direct: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>): number;

declare function dlasrt_(__id: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlassq_(__n: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __scale: interop.Reference<number>, __sumsq: interop.Reference<number>): number;

declare function dlasv2_(__f: interop.Reference<number>, __g: interop.Reference<number>, __h__: interop.Reference<number>, __ssmin: interop.Reference<number>, __ssmax: interop.Reference<number>, __snr: interop.Reference<number>, __csr: interop.Reference<number>, __snl: interop.Reference<number>, __csl: interop.Reference<number>): number;

declare function dlaswp_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __k1: interop.Reference<number>, __k2: interop.Reference<number>, __ipiv: interop.Reference<number>, __incx: interop.Reference<number>): number;

declare function dlasy2_(__ltranl: interop.Reference<number>, __ltranr: interop.Reference<number>, __isgn: interop.Reference<number>, __n1: interop.Reference<number>, __n2: interop.Reference<number>, __tl: interop.Reference<number>, __ldtl: interop.Reference<number>, __tr: interop.Reference<number>, __ldtr: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __scale: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __xnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlasyf_(__uplo: string, __n: interop.Reference<number>, __nb: interop.Reference<number>, __kb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __w: interop.Reference<number>, __ldw: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlat2s_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __sa: interop.Reference<number>, __ldsa: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlatbs_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __x: interop.Reference<number>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlatdf_(__ijob: interop.Reference<number>, __n: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __rhs: interop.Reference<number>, __rdsum: interop.Reference<number>, __rdscal: interop.Reference<number>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>): number;

declare function dlatps_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __x: interop.Reference<number>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlatrd_(__uplo: string, __n: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<number>, __w: interop.Reference<number>, __ldw: interop.Reference<number>): number;

declare function dlatrs_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __x: interop.Reference<number>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlatrz_(__m: interop.Reference<number>, __n: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlatzm_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<number>, __incv: interop.Reference<number>, __tau: interop.Reference<number>, __c1: interop.Reference<number>, __c2: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function dlauu2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dlauum_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dopgtr_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __tau: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dopmtr_(__side: string, __uplo: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ap: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorg2l_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorg2r_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorgbr_(__vect: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorghr_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorgl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorglq_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorgql_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorgqr_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorgr2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorgrq_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorgtr_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorm2l_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorm2r_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dormbr_(__vect: string, __side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dormhr_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dorml2_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dormlq_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dormql_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dormqr_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dormr2_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dormr3_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dormrq_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dormrz_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dormtr_(__side: string, __uplo: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dotpr(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __N: number): void;

declare function dotprD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __N: number): void;

declare function dpbcon_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpbequ_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpbrfs_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __afb: interop.Reference<number>, __ldafb: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpbstf_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpbsv_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpbsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __afb: interop.Reference<number>, __ldafb: interop.Reference<number>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpbtf2_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpbtrf_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpbtrs_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpftrf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpftri_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpftrs_(__transr: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpocon_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpoequ_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpoequb_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dporfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dposv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dposvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpotf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpotrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpotri_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpotrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dppcon_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dppequ_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpprfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __afp: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dppsv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dppsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __afp: interop.Reference<number>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpptrf_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpptri_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpptrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpstf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __piv: interop.Reference<number>, __rank: interop.Reference<number>, __tol: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpstrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __piv: interop.Reference<number>, __rank: interop.Reference<number>, __tol: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dptcon_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpteqr_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dptrfs_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __df: interop.Reference<number>, __ef: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dptsv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dptsvx_(__fact: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __df: interop.Reference<number>, __ef: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpttrf_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dpttrs_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dptts2_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>): number;

declare function drscl_(__n: interop.Reference<number>, __sa: interop.Reference<number>, __sx: interop.Reference<number>, __incx: interop.Reference<number>): number;

declare function dsbev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsbevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsbevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsbgst_(__vect: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __bb: interop.Reference<number>, __ldbb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsbgv_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __bb: interop.Reference<number>, __ldbb: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsbgvd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __bb: interop.Reference<number>, __ldbb: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsbgvx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __bb: interop.Reference<number>, __ldbb: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsbtrd_(__vect: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsfrk_(__transr: string, __uplo: string, __trans: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __alpha: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __beta: interop.Reference<number>, __c__: interop.Reference<number>): number;

declare function dsgesv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __work: interop.Reference<number>, __swork: interop.Reference<number>, __iter: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dspcon_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dspev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dspevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dspevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dspgst_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __bp: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dspgv_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __bp: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dspgvd_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __bp: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dspgvx_(__itype: interop.Reference<number>, __jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __bp: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsposv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __work: interop.Reference<number>, __swork: interop.Reference<number>, __iter: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsprfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __afp: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dspsv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dspsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __afp: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsptrd_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsptrf_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsptri_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsptrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dstebz_(__range: string, __order: string, __n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __m: interop.Reference<number>, __nsplit: interop.Reference<number>, __w: interop.Reference<number>, __iblock: interop.Reference<number>, __isplit: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dstedc_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dstegr_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dstein_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __iblock: interop.Reference<number>, __isplit: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dstemr_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __nzc: interop.Reference<number>, __isuppz: interop.Reference<number>, __tryrac: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsteqr_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsterf_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dstev_(__jobz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dstevd_(__jobz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dstevr_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dstevx_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsycon_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsyequb_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsyev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsyevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsyevr_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsyevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsygs2_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsygst_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsygv_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsygvd_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsygvx_(__itype: interop.Reference<number>, __jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsyrfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsysv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsysvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsytd2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsytf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsytrd_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsytrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsytri_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dsytrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtbcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtbrfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtbtrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtfsm_(__transr: string, __side: string, __uplo: string, __trans: string, __diag: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __alpha: interop.Reference<number>, __a: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>): number;

declare function dtftri_(__transr: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtfttp_(__transr: string, __uplo: string, __n: interop.Reference<number>, __arf: interop.Reference<number>, __ap: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtfttr_(__transr: string, __uplo: string, __n: interop.Reference<number>, __arf: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtgevc_(__side: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __s: interop.Reference<number>, __lds: interop.Reference<number>, __p: interop.Reference<number>, __ldp: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtgex2_(__wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __j1: interop.Reference<number>, __n1: interop.Reference<number>, __n2: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtgexc_(__wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __ifst: interop.Reference<number>, __ilst: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtgsen_(__ijob: interop.Reference<number>, __wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __select: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __m: interop.Reference<number>, __pl: interop.Reference<number>, __pr: interop.Reference<number>, __dif: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtgsja_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __tola: interop.Reference<number>, __tolb: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __work: interop.Reference<number>, __ncycle: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtgsna_(__job: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __s: interop.Reference<number>, __dif: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtgsy2_(__trans: string, __ijob: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __d__: interop.Reference<number>, __ldd: interop.Reference<number>, __e: interop.Reference<number>, __lde: interop.Reference<number>, __f: interop.Reference<number>, __ldf: interop.Reference<number>, __scale: interop.Reference<number>, __rdsum: interop.Reference<number>, __rdscal: interop.Reference<number>, __iwork: interop.Reference<number>, __pq: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtgsyl_(__trans: string, __ijob: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __d__: interop.Reference<number>, __ldd: interop.Reference<number>, __e: interop.Reference<number>, __lde: interop.Reference<number>, __f: interop.Reference<number>, __ldf: interop.Reference<number>, __scale: interop.Reference<number>, __dif: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtpcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtprfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtptri_(__uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtptrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtpttf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __arf: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtpttr_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrevc_(__side: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrexc_(__compq: string, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __ifst: interop.Reference<number>, __ilst: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrrfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrsen_(__job: string, __compq: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __m: interop.Reference<number>, __s: interop.Reference<number>, __sep: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrsna_(__job: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __s: interop.Reference<number>, __sep: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<number>, __ldwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrsyl_(__trana: string, __tranb: string, __isgn: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __scale: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrti2_(__uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrtri_(__uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrtrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrttf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __arf: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtrttp_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ap: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtzrqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dtzrzf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function dzsum1_(__n: interop.Reference<number>, __cx: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>): number;

declare function f3x3(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>): void;

declare function f3x3D(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>): void;

declare function f5x5(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>): void;

declare function f5x5D(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>): void;

declare function fft2d_zip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zipD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zipt(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC1: number, __IC0: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_ziptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zopD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zopt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zoptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zrip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zripD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __flag: number): void;

declare function fft2d_zript(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zriptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N0: number, __Log2N1: number, __flag: number): void;

declare function fft2d_zrop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zropD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zropt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft2d_zroptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function fft3_zop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft3_zopD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft5_zop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft5_zopD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft_zip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft_zipD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft_zipt(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __Direction: number): void;

declare function fft_ziptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __Direction: number): void;

declare function fft_zop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft_zopD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft_zopt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __Direction: number): void;

declare function fft_zoptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __Direction: number): void;

declare function fft_zrip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft_zripD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft_zript(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __Direction: number): void;

declare function fft_zriptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __Direction: number): void;

declare function fft_zrop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft_zropD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function fft_zropt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __Direction: number): void;

declare function fft_zroptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __Direction: number): void;

declare function fftm_zip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IM: number, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zipD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IM: number, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zipt(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IM: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_ziptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IM: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IMC: number, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zopD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IMC: number, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zopt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IMC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zoptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IMC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zrip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IM: number, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zripD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IM: number, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zript(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IM: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zriptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IM: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zrop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IMC: number, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zropD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IMC: number, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zropt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IMC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function fftm_zroptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IMC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function icmax1_(__n: interop.Reference<number>, __cx: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>): number;

declare function ieeeck_(__ispec: interop.Reference<number>, __zero: interop.Reference<number>, __one: interop.Reference<number>): number;

declare function ilaclc_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>): number;

declare function ilaclr_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_complex>, __lda: interop.Reference<number>): number;

declare function iladiag_(__diag: string): number;

declare function iladlc_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>): number;

declare function iladlr_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>): number;

declare function ilaenv_(__ispec: interop.Reference<number>, __name__: string, __opts: string, __n1: interop.Reference<number>, __n2: interop.Reference<number>, __n3: interop.Reference<number>, __n4: interop.Reference<number>): number;

declare function ilaenv_Function(__ispec: interop.Reference<number>, __name__: string, __opts: string, __n1: interop.Reference<number>, __n2: interop.Reference<number>, __n3: interop.Reference<number>, __n4: interop.Reference<number>): number;

declare function ilaprec_(__prec: string): number;

declare function ilaslc_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>): number;

declare function ilaslr_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>): number;

declare function ilatrans_(__trans: string): number;

declare function ilauplo_(__uplo: string): number;

declare function ilaver_(__vers_major__: interop.Reference<number>, __vers_minor__: interop.Reference<number>, __vers_patch__: interop.Reference<number>): number;

declare function ilaver_Function(__vers_major__: interop.Reference<number>, __vers_minor__: interop.Reference<number>, __vers_patch__: interop.Reference<number>): number;

declare function ilazlc_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>): number;

declare function ilazlr_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>): number;

declare function imgfir(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>, __P: number, __Q: number): void;

declare function imgfirD(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>, __P: number, __Q: number): void;

declare function iparmq_(__ispec: interop.Reference<number>, __name__: string, __opts: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lwork: interop.Reference<number>): number;

declare function izmax1_(__n: interop.Reference<number>, __cx: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>): number;

declare var kvImageDecodeArray_16Q12Format: interop.Reference<number>;

declare var kvImage_ARGBToYpCbCrMatrix_ITU_R_601_4: interop.Reference<vImage_ARGBToYpCbCrMatrix>;

declare var kvImage_ARGBToYpCbCrMatrix_ITU_R_709_2: interop.Reference<vImage_ARGBToYpCbCrMatrix>;

declare var kvImage_YpCbCrToARGBMatrix_ITU_R_601_4: interop.Reference<vImage_YpCbCrToARGBMatrix>;

declare var kvImage_YpCbCrToARGBMatrix_ITU_R_709_2: interop.Reference<vImage_YpCbCrToARGBMatrix>;

declare function la_add_attributes(object: NSObject, attributes: number): void;

declare function la_diagonal_matrix_from_vector(vector: NSObject, matrix_diagonal: number): NSObject;

declare function la_difference(obj_left: NSObject, obj_right: NSObject): NSObject;

declare function la_elementwise_product(obj_left: NSObject, obj_right: NSObject): NSObject;

declare function la_identity_matrix(matrix_size: number, scalar_type: number, attributes: number): NSObject;

declare function la_inner_product(vector_left: NSObject, vector_right: NSObject): NSObject;

declare function la_matrix_cols(matrix: NSObject): number;

declare function la_matrix_from_double_buffer(buffer: interop.Reference<number>, matrix_rows: number, matrix_cols: number, matrix_row_stride: number, matrix_hint: number, attributes: number): NSObject;

declare function la_matrix_from_double_buffer_nocopy(buffer: interop.Reference<number>, matrix_rows: number, matrix_cols: number, matrix_row_stride: number, matrix_hint: number, deallocator: interop.FunctionReference<(p1: interop.Pointer) => void>, attributes: number): NSObject;

declare function la_matrix_from_float_buffer(buffer: interop.Reference<number>, matrix_rows: number, matrix_cols: number, matrix_row_stride: number, matrix_hint: number, attributes: number): NSObject;

declare function la_matrix_from_float_buffer_nocopy(buffer: interop.Reference<number>, matrix_rows: number, matrix_cols: number, matrix_row_stride: number, matrix_hint: number, deallocator: interop.FunctionReference<(p1: interop.Pointer) => void>, attributes: number): NSObject;

declare function la_matrix_from_splat(splat: NSObject, matrix_rows: number, matrix_cols: number): NSObject;

declare function la_matrix_product(matrix_left: NSObject, matrix_right: NSObject): NSObject;

declare function la_matrix_rows(matrix: NSObject): number;

declare function la_matrix_slice(matrix: NSObject, matrix_first_row: number, matrix_first_col: number, matrix_row_stride: number, matrix_col_stride: number, slice_rows: number, slice_cols: number): NSObject;

declare function la_matrix_to_double_buffer(buffer: interop.Reference<number>, buffer_row_stride: number, matrix: NSObject): number;

declare function la_matrix_to_float_buffer(buffer: interop.Reference<number>, buffer_row_stride: number, matrix: NSObject): number;

declare function la_norm_as_double(vector: NSObject, vector_norm: number): number;

declare function la_norm_as_float(vector: NSObject, vector_norm: number): number;

declare function la_normalized_vector(vector: NSObject, vector_norm: number): NSObject;

declare function la_outer_product(vector_left: NSObject, vector_right: NSObject): NSObject;

declare function la_release(object: NSObject): void;

declare function la_remove_attributes(object: NSObject, attributes: number): void;

declare function la_retain(object: NSObject): NSObject;

declare function la_scale_with_double(matrix: NSObject, scalar: number): NSObject;

declare function la_scale_with_float(matrix: NSObject, scalar: number): NSObject;

declare function la_solve(matrix_system: NSObject, obj_rhs: NSObject): NSObject;

declare function la_splat_from_double(scalar_value: number, attributes: number): NSObject;

declare function la_splat_from_float(scalar_value: number, attributes: number): NSObject;

declare function la_splat_from_matrix_element(matrix: NSObject, matrix_row: number, matrix_col: number): NSObject;

declare function la_splat_from_vector_element(vector: NSObject, vector_index: number): NSObject;

declare function la_status(object: NSObject): number;

declare function la_sum(obj_left: NSObject, obj_right: NSObject): NSObject;

declare function la_transpose(matrix: NSObject): NSObject;

declare function la_vector_from_matrix_col(matrix: NSObject, matrix_col: number): NSObject;

declare function la_vector_from_matrix_diagonal(matrix: NSObject, matrix_diagonal: number): NSObject;

declare function la_vector_from_matrix_row(matrix: NSObject, matrix_row: number): NSObject;

declare function la_vector_from_splat(splat: NSObject, vector_length: number): NSObject;

declare function la_vector_length(vector: NSObject): number;

declare function la_vector_slice(vector: NSObject, vector_first: number, vector_stride: number, slice_length: number): NSObject;

declare function la_vector_to_double_buffer(buffer: interop.Reference<number>, buffer_stride: number, vector: NSObject): number;

declare function la_vector_to_float_buffer(buffer: interop.Reference<number>, buffer_stride: number, vector: NSObject): number;

declare function lsamen_(__n: interop.Reference<number>, __ca: string, __cb: string): number;

declare function mmul(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __M: number, __N: number, __P: number): void;

declare function mmulD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __M: number, __N: number, __P: number): void;

declare function mtrans(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __M: number, __N: number): void;

declare function mtransD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __M: number, __N: number): void;

declare function sbdsdc_(__uplo: string, __compq: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __q: interop.Reference<number>, __iq: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sbdsqr_(__uplo: string, __n: interop.Reference<number>, __ncvt: interop.Reference<number>, __nru: interop.Reference<number>, __ncc: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function scsum1_(__n: interop.Reference<number>, __cx: interop.Reference<__CLPK_complex>, __incx: interop.Reference<number>): number;

declare function sdisna_(__job: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __sep: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgbbrd_(__vect: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ncc: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __pt: interop.Reference<number>, __ldpt: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgbcon_(__norm: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgbequ_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgbequb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgbrfs_(__trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __afb: interop.Reference<number>, __ldafb: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgbsv_(__n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgbsvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __afb: interop.Reference<number>, __ldafb: interop.Reference<number>, __ipiv: interop.Reference<number>, __equed: string, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgbtf2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgbtrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgbtrs_(__trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgebak_(__job: string, __side: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __m: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgebal_(__job: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgebd2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<number>, __taup: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgebrd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<number>, __taup: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgecon_(__norm: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeequ_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeequb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgees_(__jobvs: string, __sort: string, __select: interop.FunctionReference<() => number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __sdim: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vs: interop.Reference<number>, __ldvs: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeesx_(__jobvs: string, __sort: string, __select: interop.FunctionReference<() => number>, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __sdim: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vs: interop.Reference<number>, __ldvs: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeev_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeevx_(__balanc: string, __jobvl: string, __jobvr: string, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __abnrm: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgegs_(__jobvsl: string, __jobvsr: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vsl: interop.Reference<number>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<number>, __ldvsr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgegv_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgehd2_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgehrd_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgejsv_(__joba: string, __jobu: string, __jobv: string, __jobr: string, __jobt: string, __jobp: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __sva: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgelq2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgelqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgels_(__trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgelsd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __s: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgelss_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __s: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgelsx_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __jpvt: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgelsy_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __jpvt: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeql2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeqlf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeqp3_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeqpf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeqr2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgeqrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgerfs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgerq2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgerqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgesc2_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __rhs: interop.Reference<number>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>, __scale: interop.Reference<number>): number;

declare function sgesdd_(__jobz: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgesv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgesvd_(__jobu: string, __jobvt: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgesvj_(__joba: string, __jobu: string, __jobv: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __sva: interop.Reference<number>, __mv: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgesvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __equed: string, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgetc2_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgetf2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgetrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgetri_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgetrs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sggbak_(__job: string, __side: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __m: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sggbal_(__job: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgges_(__jobvsl: string, __jobvsr: string, __sort: string, __selctg: interop.FunctionReference<() => number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __sdim: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vsl: interop.Reference<number>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<number>, __ldvsr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sggesx_(__jobvsl: string, __jobvsr: string, __sort: string, __selctg: interop.FunctionReference<() => number>, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __sdim: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vsl: interop.Reference<number>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<number>, __ldvsr: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sggev_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sggevx_(__balanc: string, __jobvl: string, __jobvr: string, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __abnrm: interop.Reference<number>, __bbnrm: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sggglm_(__n: interop.Reference<number>, __m: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<number>, __y: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgghrd_(__compq: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgglse_(__m: interop.Reference<number>, __n: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __c__: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sggqrf_(__n: interop.Reference<number>, __m: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __taua: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __taub: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sggrqf_(__m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __taua: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __taub: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sggsvd_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __p: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sggsvp_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __tola: interop.Reference<number>, __tolb: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __iwork: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgsvj0_(__jobv: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __sva: interop.Reference<number>, __mv: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __eps: interop.Reference<number>, __sfmin: interop.Reference<number>, __tol: interop.Reference<number>, __nsweep: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgsvj1_(__jobv: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __n1: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __sva: interop.Reference<number>, __mv: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __eps: interop.Reference<number>, __sfmin: interop.Reference<number>, __tol: interop.Reference<number>, __nsweep: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgtcon_(__norm: string, __n: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgtrfs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __dlf: interop.Reference<number>, __df: interop.Reference<number>, __duf: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgtsv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgtsvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __dlf: interop.Reference<number>, __df: interop.Reference<number>, __duf: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgttrf_(__n: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgttrs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sgtts2_(__itrans: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __du2: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>): number;

declare function shgeqz_(__job: string, __compq: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function shsein_(__side: string, __eigsrc: string, __initv: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<number>, __ifaill: interop.Reference<number>, __ifailr: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function shseqr_(__job: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sisnan_(__sin__: interop.Reference<number>): number;

declare function slabad_(__small: interop.Reference<number>, __large: interop.Reference<number>): number;

declare function slabrd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<number>, __taup: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __y: interop.Reference<number>, __ldy: interop.Reference<number>): number;

declare function slacn2_(__n: interop.Reference<number>, __v: interop.Reference<number>, __x: interop.Reference<number>, __isgn: interop.Reference<number>, __est: interop.Reference<number>, __kase: interop.Reference<number>, __isave: interop.Reference<number>): number;

declare function slacon_(__n: interop.Reference<number>, __v: interop.Reference<number>, __x: interop.Reference<number>, __isgn: interop.Reference<number>, __est: interop.Reference<number>, __kase: interop.Reference<number>): number;

declare function slacpy_(__uplo: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>): number;

declare function sladiv_(__a: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __d__: interop.Reference<number>, __p: interop.Reference<number>, __q: interop.Reference<number>): number;

declare function slae2_(__a: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __rt1: interop.Reference<number>, __rt2: interop.Reference<number>): number;

declare function slaebz_(__ijob: interop.Reference<number>, __nitmax: interop.Reference<number>, __n: interop.Reference<number>, __mmax: interop.Reference<number>, __minp: interop.Reference<number>, __nbmin: interop.Reference<number>, __abstol: interop.Reference<number>, __reltol: interop.Reference<number>, __pivmin: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __e2: interop.Reference<number>, __nval: interop.Reference<number>, __ab: interop.Reference<number>, __c__: interop.Reference<number>, __mout: interop.Reference<number>, __nab: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaed0_(__icompq: interop.Reference<number>, __qsiz: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __qstore: interop.Reference<number>, __ldqs: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaed1_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __indxq: interop.Reference<number>, __rho: interop.Reference<number>, __cutpnt: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaed2_(__k: interop.Reference<number>, __n: interop.Reference<number>, __n1: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __indxq: interop.Reference<number>, __rho: interop.Reference<number>, __z__: interop.Reference<number>, __dlamda: interop.Reference<number>, __w: interop.Reference<number>, __q2: interop.Reference<number>, __indx: interop.Reference<number>, __indxc: interop.Reference<number>, __indxp: interop.Reference<number>, __coltyp: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaed3_(__k: interop.Reference<number>, __n: interop.Reference<number>, __n1: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __rho: interop.Reference<number>, __dlamda: interop.Reference<number>, __q2: interop.Reference<number>, __indx: interop.Reference<number>, __ctot: interop.Reference<number>, __w: interop.Reference<number>, __s: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaed4_(__n: interop.Reference<number>, __i__: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __delta: interop.Reference<number>, __rho: interop.Reference<number>, __dlam: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaed5_(__i__: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __delta: interop.Reference<number>, __rho: interop.Reference<number>, __dlam: interop.Reference<number>): number;

declare function slaed6_(__kniter: interop.Reference<number>, __orgati: interop.Reference<number>, __rho: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __finit: interop.Reference<number>, __tau: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaed7_(__icompq: interop.Reference<number>, __n: interop.Reference<number>, __qsiz: interop.Reference<number>, __tlvls: interop.Reference<number>, __curlvl: interop.Reference<number>, __curpbm: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __indxq: interop.Reference<number>, __rho: interop.Reference<number>, __cutpnt: interop.Reference<number>, __qstore: interop.Reference<number>, __qptr: interop.Reference<number>, __prmptr: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __givnum: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaed8_(__icompq: interop.Reference<number>, __k: interop.Reference<number>, __n: interop.Reference<number>, __qsiz: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __indxq: interop.Reference<number>, __rho: interop.Reference<number>, __cutpnt: interop.Reference<number>, __z__: interop.Reference<number>, __dlamda: interop.Reference<number>, __q2: interop.Reference<number>, __ldq2: interop.Reference<number>, __w: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __givnum: interop.Reference<number>, __indxp: interop.Reference<number>, __indx: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaed9_(__k: interop.Reference<number>, __kstart: interop.Reference<number>, __kstop: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __rho: interop.Reference<number>, __dlamda: interop.Reference<number>, __w: interop.Reference<number>, __s: interop.Reference<number>, __lds: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaeda_(__n: interop.Reference<number>, __tlvls: interop.Reference<number>, __curlvl: interop.Reference<number>, __curpbm: interop.Reference<number>, __prmptr: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __givnum: interop.Reference<number>, __q: interop.Reference<number>, __qptr: interop.Reference<number>, __z__: interop.Reference<number>, __ztemp: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaein_(__rightv: interop.Reference<number>, __noinit: interop.Reference<number>, __n: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __vr: interop.Reference<number>, __vi: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __work: interop.Reference<number>, __eps3: interop.Reference<number>, __smlnum: interop.Reference<number>, __bignum: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaev2_(__a: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __rt1: interop.Reference<number>, __rt2: interop.Reference<number>, __cs1: interop.Reference<number>, __sn1: interop.Reference<number>): number;

declare function slaexc_(__wantq: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __j1: interop.Reference<number>, __n1: interop.Reference<number>, __n2: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slag2_(__a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __safmin: interop.Reference<number>, __scale1: interop.Reference<number>, __scale2: interop.Reference<number>, __wr1: interop.Reference<number>, __wr2: interop.Reference<number>, __wi: interop.Reference<number>): number;

declare function slag2d_(__m: interop.Reference<number>, __n: interop.Reference<number>, __sa: interop.Reference<number>, __ldsa: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slags2_(__upper: interop.Reference<number>, __a1: interop.Reference<number>, __a2: interop.Reference<number>, __a3: interop.Reference<number>, __b1: interop.Reference<number>, __b2: interop.Reference<number>, __b3: interop.Reference<number>, __csu: interop.Reference<number>, __snu: interop.Reference<number>, __csv: interop.Reference<number>, __snv: interop.Reference<number>, __csq: interop.Reference<number>, __snq: interop.Reference<number>): number;

declare function slagtf_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lambda: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __tol: interop.Reference<number>, __d__: interop.Reference<number>, __in: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slagtm_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __alpha: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __beta: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>): number;

declare function slagts_(__job: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __d__: interop.Reference<number>, __in: interop.Reference<number>, __y: interop.Reference<number>, __tol: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slagv2_(__a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __csl: interop.Reference<number>, __snl: interop.Reference<number>, __csr: interop.Reference<number>, __snr: interop.Reference<number>): number;

declare function slahqr_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slahr2_(__n: interop.Reference<number>, __k: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __y: interop.Reference<number>, __ldy: interop.Reference<number>): number;

declare function slahrd_(__n: interop.Reference<number>, __k: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __y: interop.Reference<number>, __ldy: interop.Reference<number>): number;

declare function slaic1_(__job: interop.Reference<number>, __j: interop.Reference<number>, __x: interop.Reference<number>, __sest: interop.Reference<number>, __w: interop.Reference<number>, __gamma: interop.Reference<number>, __sestpr: interop.Reference<number>, __s: interop.Reference<number>, __c__: interop.Reference<number>): number;

declare function slaisnan_(__sin1: interop.Reference<number>, __sin2: interop.Reference<number>): number;

declare function slaln2_(__ltrans: interop.Reference<number>, __na: interop.Reference<number>, __nw: interop.Reference<number>, __smin: interop.Reference<number>, __ca: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d1: interop.Reference<number>, __d2: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __scale: interop.Reference<number>, __xnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slals0_(__icompq: interop.Reference<number>, __nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __nrhs: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __bx: interop.Reference<number>, __ldbx: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __givnum: interop.Reference<number>, __ldgnum: interop.Reference<number>, __poles: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __k: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slalsa_(__icompq: interop.Reference<number>, __smlsiz: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __bx: interop.Reference<number>, __ldbx: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __k: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __poles: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __perm: interop.Reference<number>, __givnum: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slalsd_(__uplo: string, __smlsiz: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slamc1_(__beta: interop.Reference<number>, __t: interop.Reference<number>, __rnd: interop.Reference<number>, __ieee1: interop.Reference<number>): number;

declare function slamc2_(__beta: interop.Reference<number>, __t: interop.Reference<number>, __rnd: interop.Reference<number>, __eps: interop.Reference<number>, __emin: interop.Reference<number>, __rmin: interop.Reference<number>, __emax: interop.Reference<number>, __rmax: interop.Reference<number>): number;

declare function slamc3_(__a: interop.Reference<number>, __b: interop.Reference<number>): number;

declare function slamc4_(__emin: interop.Reference<number>, __start: interop.Reference<number>, __base: interop.Reference<number>): number;

declare function slamc5_(__beta: interop.Reference<number>, __p: interop.Reference<number>, __emin: interop.Reference<number>, __ieee: interop.Reference<number>, __emax: interop.Reference<number>, __rmax: interop.Reference<number>): number;

declare function slamch_(__cmach: string): number;

declare function slamrg_(__n1: interop.Reference<number>, __n2: interop.Reference<number>, __a: interop.Reference<number>, __strd1: interop.Reference<number>, __strd2: interop.Reference<number>, __index: interop.Reference<number>): number;

declare function slaneg_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __lld: interop.Reference<number>, __sigma: interop.Reference<number>, __pivmin: interop.Reference<number>, __r__: interop.Reference<number>): number;

declare function slangb_(__norm: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slange_(__norm: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slangt_(__norm: string, __n: interop.Reference<number>, __dl: interop.Reference<number>, __d__: interop.Reference<number>, __du: interop.Reference<number>): number;

declare function slanhs_(__norm: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slansb_(__norm: string, __uplo: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slansf_(__norm: string, __transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slansp_(__norm: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slanst_(__norm: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>): number;

declare function slansy_(__norm: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slantb_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slantp_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slantr_(__norm: string, __uplo: string, __diag: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slanv2_(__a: interop.Reference<number>, __b: interop.Reference<number>, __c__: interop.Reference<number>, __d__: interop.Reference<number>, __rt1r: interop.Reference<number>, __rt1i: interop.Reference<number>, __rt2r: interop.Reference<number>, __rt2i: interop.Reference<number>, __cs: interop.Reference<number>, __sn: interop.Reference<number>): number;

declare function slapll_(__n: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __y: interop.Reference<number>, __incy: interop.Reference<number>, __ssmin: interop.Reference<number>): number;

declare function slapmt_(__forwrd: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __k: interop.Reference<number>): number;

declare function slapy2_(__x: interop.Reference<number>, __y: interop.Reference<number>): number;

declare function slapy3_(__x: interop.Reference<number>, __y: interop.Reference<number>, __z__: interop.Reference<number>): number;

declare function slaqgb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function slaqge_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function slaqp2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __offset: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<number>, __vn1: interop.Reference<number>, __vn2: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slaqps_(__m: interop.Reference<number>, __n: interop.Reference<number>, __offset: interop.Reference<number>, __nb: interop.Reference<number>, __kb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<number>, __vn1: interop.Reference<number>, __vn2: interop.Reference<number>, __auxv: interop.Reference<number>, __f: interop.Reference<number>, __ldf: interop.Reference<number>): number;

declare function slaqr0_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaqr1_(__n: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __sr1: interop.Reference<number>, __si1: interop.Reference<number>, __sr2: interop.Reference<number>, __si2: interop.Reference<number>, __v: interop.Reference<number>): number;

declare function slaqr2_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nw: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __ns: interop.Reference<number>, __nd: interop.Reference<number>, __sr: interop.Reference<number>, __si: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __nh: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<number>, __ldwv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>): number;

declare function slaqr3_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nw: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __ns: interop.Reference<number>, __nd: interop.Reference<number>, __sr: interop.Reference<number>, __si: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __nh: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<number>, __ldwv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>): number;

declare function slaqr4_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slaqr5_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __kacc22: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nshfts: interop.Reference<number>, __sr: interop.Reference<number>, __si: interop.Reference<number>, __h__: interop.Reference<number>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<number>, __ldwv: interop.Reference<number>, __nh: interop.Reference<number>, __wh: interop.Reference<number>, __ldwh: interop.Reference<number>): number;

declare function slaqsb_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function slaqsp_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function slaqsy_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function slaqtr_(__ltran: interop.Reference<number>, __l__CLPK_real: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __b: interop.Reference<number>, __w: interop.Reference<number>, __scale: interop.Reference<number>, __x: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slar1v_(__n: interop.Reference<number>, __b1: interop.Reference<number>, __bn: interop.Reference<number>, __lambda: interop.Reference<number>, __d__: interop.Reference<number>, __l: interop.Reference<number>, __ld: interop.Reference<number>, __lld: interop.Reference<number>, __pivmin: interop.Reference<number>, __gaptol: interop.Reference<number>, __z__: interop.Reference<number>, __wantnc: interop.Reference<number>, __negcnt: interop.Reference<number>, __ztz: interop.Reference<number>, __mingma: interop.Reference<number>, __r__: interop.Reference<number>, __isuppz: interop.Reference<number>, __nrminv: interop.Reference<number>, __resid: interop.Reference<number>, __rqcorr: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slar2v_(__n: interop.Reference<number>, __x: interop.Reference<number>, __y: interop.Reference<number>, __z__: interop.Reference<number>, __incx: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __incc: interop.Reference<number>): number;

declare function slarf_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<number>, __incv: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slarfb_(__side: string, __trans: string, __direct: string, __storev: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __ldwork: interop.Reference<number>): number;

declare function slarfg_(__n: interop.Reference<number>, __alpha: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __tau: interop.Reference<number>): number;

declare function slarfp_(__n: interop.Reference<number>, __alpha: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __tau: interop.Reference<number>): number;

declare function slarft_(__direct: string, __storev: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __tau: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>): number;

declare function slarfx_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slargv_(__n: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __y: interop.Reference<number>, __incy: interop.Reference<number>, __c__: interop.Reference<number>, __incc: interop.Reference<number>): number;

declare function slarnv_(__idist: interop.Reference<number>, __iseed: interop.Reference<number>, __n: interop.Reference<number>, __x: interop.Reference<number>): number;

declare function slarra_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __e2: interop.Reference<number>, __spltol: interop.Reference<number>, __tnrm: interop.Reference<number>, __nsplit: interop.Reference<number>, __isplit: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slarrb_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __lld: interop.Reference<number>, __ifirst: interop.Reference<number>, __ilast: interop.Reference<number>, __rtol1: interop.Reference<number>, __rtol2: interop.Reference<number>, __offset: interop.Reference<number>, __w: interop.Reference<number>, __wgap: interop.Reference<number>, __werr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __pivmin: interop.Reference<number>, __spdiam: interop.Reference<number>, __twist: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slarrc_(__jobt: string, __n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __pivmin: interop.Reference<number>, __eigcnt: interop.Reference<number>, __lcnt: interop.Reference<number>, __rcnt: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slarrd_(__range: string, __order: string, __n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __gers: interop.Reference<number>, __reltol: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __e2: interop.Reference<number>, __pivmin: interop.Reference<number>, __nsplit: interop.Reference<number>, __isplit: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __wl: interop.Reference<number>, __wu: interop.Reference<number>, __iblock: interop.Reference<number>, __indexw: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slarre_(__range: string, __n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __e2: interop.Reference<number>, __rtol1: interop.Reference<number>, __rtol2: interop.Reference<number>, __spltol: interop.Reference<number>, __nsplit: interop.Reference<number>, __isplit: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __wgap: interop.Reference<number>, __iblock: interop.Reference<number>, __indexw: interop.Reference<number>, __gers: interop.Reference<number>, __pivmin: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slarrf_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __l: interop.Reference<number>, __ld: interop.Reference<number>, __clstrt: interop.Reference<number>, __clend: interop.Reference<number>, __w: interop.Reference<number>, __wgap: interop.Reference<number>, __werr: interop.Reference<number>, __spdiam: interop.Reference<number>, __clgapl: interop.Reference<number>, __clgapr: interop.Reference<number>, __pivmin: interop.Reference<number>, __sigma: interop.Reference<number>, __dplus: interop.Reference<number>, __lplus: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slarrj_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e2: interop.Reference<number>, __ifirst: interop.Reference<number>, __ilast: interop.Reference<number>, __rtol: interop.Reference<number>, __offset: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __pivmin: interop.Reference<number>, __spdiam: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slarrk_(__n: interop.Reference<number>, __iw: interop.Reference<number>, __gl: interop.Reference<number>, __gu: interop.Reference<number>, __d__: interop.Reference<number>, __e2: interop.Reference<number>, __pivmin: interop.Reference<number>, __reltol: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slarrr_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slarrv_(__n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __d__: interop.Reference<number>, __l: interop.Reference<number>, __pivmin: interop.Reference<number>, __isplit: interop.Reference<number>, __m: interop.Reference<number>, __dol: interop.Reference<number>, __dou: interop.Reference<number>, __minrgp: interop.Reference<number>, __rtol1: interop.Reference<number>, __rtol2: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __wgap: interop.Reference<number>, __iblock: interop.Reference<number>, __indexw: interop.Reference<number>, __gers: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slarscl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>): number;

declare function slartg_(__f: interop.Reference<number>, __g: interop.Reference<number>, __cs: interop.Reference<number>, __sn: interop.Reference<number>, __r__: interop.Reference<number>): number;

declare function slartv_(__n: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __y: interop.Reference<number>, __incy: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __incc: interop.Reference<number>): number;

declare function slaruv_(__iseed: interop.Reference<number>, __n: interop.Reference<number>, __x: interop.Reference<number>): number;

declare function slarz_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __l: interop.Reference<number>, __v: interop.Reference<number>, __incv: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slarzb_(__side: string, __trans: string, __direct: string, __storev: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __ldwork: interop.Reference<number>): number;

declare function slarzt_(__direct: string, __storev: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __tau: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>): number;

declare function slas2_(__f: interop.Reference<number>, __g: interop.Reference<number>, __h__: interop.Reference<number>, __ssmin: interop.Reference<number>, __ssmax: interop.Reference<number>): number;

declare function slascl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>): number;

declare function slascl_(__type__: string, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __cfrom: interop.Reference<number>, __cto: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasd0_(__n: interop.Reference<number>, __sqre: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __smlsiz: interop.Reference<number>, __iwork: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasd1_(__nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __d__: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __idxq: interop.Reference<number>, __iwork: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasd2_(__nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __k: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __dsigma: interop.Reference<number>, __u2: interop.Reference<number>, __ldu2: interop.Reference<number>, __vt2: interop.Reference<number>, __ldvt2: interop.Reference<number>, __idxp: interop.Reference<number>, __idx: interop.Reference<number>, __idxc: interop.Reference<number>, __idxq: interop.Reference<number>, __coltyp: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasd3_(__nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __k: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __dsigma: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __u2: interop.Reference<number>, __ldu2: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __vt2: interop.Reference<number>, __ldvt2: interop.Reference<number>, __idxc: interop.Reference<number>, __ctot: interop.Reference<number>, __z__: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasd4_(__n: interop.Reference<number>, __i__: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __delta: interop.Reference<number>, __rho: interop.Reference<number>, __sigma: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasd5_(__i__: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __delta: interop.Reference<number>, __rho: interop.Reference<number>, __dsigma: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slasd6_(__icompq: interop.Reference<number>, __nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __d__: interop.Reference<number>, __vf: interop.Reference<number>, __vl: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __idxq: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __givnum: interop.Reference<number>, __ldgnum: interop.Reference<number>, __poles: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __k: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasd7_(__icompq: interop.Reference<number>, __nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __k: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __zw: interop.Reference<number>, __vf: interop.Reference<number>, __vfw: interop.Reference<number>, __vl: interop.Reference<number>, __vlw: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __dsigma: interop.Reference<number>, __idx: interop.Reference<number>, __idxp: interop.Reference<number>, __idxq: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __givnum: interop.Reference<number>, __ldgnum: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasd8_(__icompq: interop.Reference<number>, __k: interop.Reference<number>, __d__: interop.Reference<number>, __z__: interop.Reference<number>, __vf: interop.Reference<number>, __vl: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __lddifr: interop.Reference<number>, __dsigma: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasda_(__icompq: interop.Reference<number>, __smlsiz: interop.Reference<number>, __n: interop.Reference<number>, __sqre: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __k: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __poles: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __perm: interop.Reference<number>, __givnum: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasdq_(__uplo: string, __sqre: interop.Reference<number>, __n: interop.Reference<number>, __ncvt: interop.Reference<number>, __nru: interop.Reference<number>, __ncc: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vt: interop.Reference<number>, __ldvt: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasdt_(__n: interop.Reference<number>, __lvl: interop.Reference<number>, __nd: interop.Reference<number>, __inode: interop.Reference<number>, __ndiml: interop.Reference<number>, __ndimr: interop.Reference<number>, __msub: interop.Reference<number>): number;

declare function slaset_(__uplo: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>): number;

declare function slasq1_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasq2_(__n: interop.Reference<number>, __z__: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasq3_(__i0: interop.Reference<number>, __n0: interop.Reference<number>, __z__: interop.Reference<number>, __pp: interop.Reference<number>, __dmin__: interop.Reference<number>, __sigma: interop.Reference<number>, __desig: interop.Reference<number>, __qmax: interop.Reference<number>, __nfail: interop.Reference<number>, __iter: interop.Reference<number>, __ndiv: interop.Reference<number>, __ieee: interop.Reference<number>, __ttype: interop.Reference<number>, __dmin1: interop.Reference<number>, __dmin2: interop.Reference<number>, __dn: interop.Reference<number>, __dn1: interop.Reference<number>, __dn2: interop.Reference<number>, __g: interop.Reference<number>, __tau: interop.Reference<number>): number;

declare function slasq4_(__i0: interop.Reference<number>, __n0: interop.Reference<number>, __z__: interop.Reference<number>, __pp: interop.Reference<number>, __n0in: interop.Reference<number>, __dmin__: interop.Reference<number>, __dmin1: interop.Reference<number>, __dmin2: interop.Reference<number>, __dn: interop.Reference<number>, __dn1: interop.Reference<number>, __dn2: interop.Reference<number>, __tau: interop.Reference<number>, __ttype: interop.Reference<number>, __g: interop.Reference<number>): number;

declare function slasq5_(__i0: interop.Reference<number>, __n0: interop.Reference<number>, __z__: interop.Reference<number>, __pp: interop.Reference<number>, __tau: interop.Reference<number>, __dmin__: interop.Reference<number>, __dmin1: interop.Reference<number>, __dmin2: interop.Reference<number>, __dn: interop.Reference<number>, __dnm1: interop.Reference<number>, __dnm2: interop.Reference<number>, __ieee: interop.Reference<number>): number;

declare function slasq6_(__i0: interop.Reference<number>, __n0: interop.Reference<number>, __z__: interop.Reference<number>, __pp: interop.Reference<number>, __dmin__: interop.Reference<number>, __dmin1: interop.Reference<number>, __dmin2: interop.Reference<number>, __dn: interop.Reference<number>, __dnm1: interop.Reference<number>, __dnm2: interop.Reference<number>): number;

declare function slasr_(__side: string, __pivot: string, __direct: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>): number;

declare function slasrt_(__id: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slassq_(__n: interop.Reference<number>, __x: interop.Reference<number>, __incx: interop.Reference<number>, __scale: interop.Reference<number>, __sumsq: interop.Reference<number>): number;

declare function slasv2_(__f: interop.Reference<number>, __g: interop.Reference<number>, __h__: interop.Reference<number>, __ssmin: interop.Reference<number>, __ssmax: interop.Reference<number>, __snr: interop.Reference<number>, __csr: interop.Reference<number>, __snl: interop.Reference<number>, __csl: interop.Reference<number>): number;

declare function slaswp_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __k1: interop.Reference<number>, __k2: interop.Reference<number>, __ipiv: interop.Reference<number>, __incx: interop.Reference<number>): number;

declare function slasy2_(__ltranl: interop.Reference<number>, __ltranr: interop.Reference<number>, __isgn: interop.Reference<number>, __n1: interop.Reference<number>, __n2: interop.Reference<number>, __tl: interop.Reference<number>, __ldtl: interop.Reference<number>, __tr: interop.Reference<number>, __ldtr: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __scale: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __xnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slasyf_(__uplo: string, __n: interop.Reference<number>, __nb: interop.Reference<number>, __kb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __w: interop.Reference<number>, __ldw: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slatbs_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __x: interop.Reference<number>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slatdf_(__ijob: interop.Reference<number>, __n: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __rhs: interop.Reference<number>, __rdsum: interop.Reference<number>, __rdscal: interop.Reference<number>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>): number;

declare function slatps_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __x: interop.Reference<number>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slatrd_(__uplo: string, __n: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<number>, __w: interop.Reference<number>, __ldw: interop.Reference<number>): number;

declare function slatrs_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __x: interop.Reference<number>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slatrz_(__m: interop.Reference<number>, __n: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slatzm_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<number>, __incv: interop.Reference<number>, __tau: interop.Reference<number>, __c1: interop.Reference<number>, __c2: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function slauu2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function slauum_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function smaxloc_(__a: interop.Reference<number>, __dimm: interop.Reference<number>): number;

declare function sopgtr_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __tau: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sopmtr_(__side: string, __uplo: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ap: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorg2l_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorg2r_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorgbr_(__vect: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorghr_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorgl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorglq_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorgql_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorgqr_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorgr2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorgrq_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorgtr_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorm2l_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorm2r_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sormbr_(__vect: string, __side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sormhr_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sorml2_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sormlq_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sormql_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sormqr_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sormr2_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sormr3_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sormrq_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sormrz_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sormtr_(__side: string, __uplo: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sparse_commit(A: interop.Pointer): sparse_status;

declare function sparse_elementwise_norm_double(A: interop.Pointer, norm: sparse_norm): number;

declare function sparse_elementwise_norm_float(A: interop.Pointer, norm: sparse_norm): number;

declare function sparse_extract_block_double(A: interop.Pointer, bi: number, bj: number, row_stride: number, col_stride: number, val: interop.Reference<number>): sparse_status;

declare function sparse_extract_block_float(A: interop.Pointer, bi: number, bj: number, row_stride: number, col_stride: number, val: interop.Reference<number>): sparse_status;

declare function sparse_extract_sparse_column_double(A: interop.Pointer, column: number, row_start: number, row_end: interop.Reference<number>, nz: number, val: interop.Reference<number>, indx: interop.Reference<number>): sparse_status;

declare function sparse_extract_sparse_column_float(A: interop.Pointer, column: number, row_start: number, row_end: interop.Reference<number>, nz: number, val: interop.Reference<number>, indx: interop.Reference<number>): sparse_status;

declare function sparse_extract_sparse_row_double(A: interop.Pointer, row: number, column_start: number, column_end: interop.Reference<number>, nz: number, val: interop.Reference<number>, jndx: interop.Reference<number>): sparse_status;

declare function sparse_extract_sparse_row_float(A: interop.Pointer, row: number, column_start: number, column_end: interop.Reference<number>, nz: number, val: interop.Reference<number>, jndx: interop.Reference<number>): sparse_status;

declare function sparse_get_block_dimension_for_col(A: interop.Pointer, j: number): number;

declare function sparse_get_block_dimension_for_row(A: interop.Pointer, i: number): number;

declare function sparse_get_matrix_nonzero_count(A: interop.Pointer): number;

declare function sparse_get_matrix_nonzero_count_for_column(A: interop.Pointer, j: number): number;

declare function sparse_get_matrix_nonzero_count_for_row(A: interop.Pointer, i: number): number;

declare function sparse_get_matrix_number_of_columns(A: interop.Pointer): number;

declare function sparse_get_matrix_number_of_rows(A: interop.Pointer): number;

declare function sparse_get_matrix_property(A: interop.Pointer, pname: sparse_matrix_property): number;

declare function sparse_get_vector_nonzero_count_double(N: number, x: interop.Reference<number>, incx: number): number;

declare function sparse_get_vector_nonzero_count_float(N: number, x: interop.Reference<number>, incx: number): number;

declare function sparse_inner_product_dense_double(nz: number, x: interop.Reference<number>, indx: interop.Reference<number>, y: interop.Reference<number>, incy: number): number;

declare function sparse_inner_product_dense_float(nz: number, x: interop.Reference<number>, indx: interop.Reference<number>, y: interop.Reference<number>, incy: number): number;

declare function sparse_inner_product_sparse_double(nzx: number, nzy: number, x: interop.Reference<number>, indx: interop.Reference<number>, y: interop.Reference<number>, indy: interop.Reference<number>): number;

declare function sparse_inner_product_sparse_float(nzx: number, nzy: number, x: interop.Reference<number>, indx: interop.Reference<number>, y: interop.Reference<number>, indy: interop.Reference<number>): number;

declare function sparse_insert_block_double(A: interop.Pointer, val: interop.Reference<number>, row_stride: number, col_stride: number, bi: number, bj: number): sparse_status;

declare function sparse_insert_block_float(A: interop.Pointer, val: interop.Reference<number>, row_stride: number, col_stride: number, bi: number, bj: number): sparse_status;

declare function sparse_insert_col_double(A: interop.Pointer, j: number, nz: number, val: interop.Reference<number>, indx: interop.Reference<number>): sparse_status;

declare function sparse_insert_col_float(A: interop.Pointer, j: number, nz: number, val: interop.Reference<number>, indx: interop.Reference<number>): sparse_status;

declare function sparse_insert_entries_double(A: interop.Pointer, N: number, val: interop.Reference<number>, indx: interop.Reference<number>, jndx: interop.Reference<number>): sparse_status;

declare function sparse_insert_entries_float(A: interop.Pointer, N: number, val: interop.Reference<number>, indx: interop.Reference<number>, jndx: interop.Reference<number>): sparse_status;

declare function sparse_insert_entry_double(A: interop.Pointer, val: number, i: number, j: number): sparse_status;

declare function sparse_insert_entry_float(A: interop.Pointer, val: number, i: number, j: number): sparse_status;

declare function sparse_insert_row_double(A: interop.Pointer, i: number, nz: number, val: interop.Reference<number>, jndx: interop.Reference<number>): sparse_status;

declare function sparse_insert_row_float(A: interop.Pointer, i: number, nz: number, val: interop.Reference<number>, jndx: interop.Reference<number>): sparse_status;

declare function sparse_matrix_block_create_double(Mb: number, Nb: number, k: number, l: number): interop.Pointer;

declare function sparse_matrix_block_create_float(Mb: number, Nb: number, k: number, l: number): interop.Pointer;

declare function sparse_matrix_create_double(M: number, N: number): interop.Pointer;

declare function sparse_matrix_create_float(M: number, N: number): interop.Pointer;

declare function sparse_matrix_destroy(A: interop.Pointer): sparse_status;

declare function sparse_matrix_product_dense_double(order: CBLAS_ORDER, transa: CBLAS_TRANSPOSE, n: number, alpha: number, A: interop.Pointer, B: interop.Reference<number>, ldb: number, C: interop.Reference<number>, ldc: number): sparse_status;

declare function sparse_matrix_product_dense_float(order: CBLAS_ORDER, transa: CBLAS_TRANSPOSE, n: number, alpha: number, A: interop.Pointer, B: interop.Reference<number>, ldb: number, C: interop.Reference<number>, ldc: number): sparse_status;

declare const enum sparse_matrix_property {

	SPARSE_UPPER_TRIANGULAR = 1,

	SPARSE_LOWER_TRIANGULAR = 2,

	SPARSE_UPPER_SYMMETRIC = 4,

	SPARSE_LOWER_SYMMETRIC = 8
}

declare function sparse_matrix_trace_double(A: interop.Pointer, offset: number): number;

declare function sparse_matrix_trace_float(A: interop.Pointer, offset: number): number;

declare function sparse_matrix_triangular_solve_dense_double(order: CBLAS_ORDER, transt: CBLAS_TRANSPOSE, nrhs: number, alpha: number, T: interop.Pointer, B: interop.Reference<number>, ldb: number): sparse_status;

declare function sparse_matrix_triangular_solve_dense_float(order: CBLAS_ORDER, transt: CBLAS_TRANSPOSE, nrhs: number, alpha: number, T: interop.Pointer, B: interop.Reference<number>, ldb: number): sparse_status;

declare function sparse_matrix_variable_block_create_double(Mb: number, Nb: number, K: interop.Reference<number>, L: interop.Reference<number>): interop.Pointer;

declare function sparse_matrix_variable_block_create_float(Mb: number, Nb: number, K: interop.Reference<number>, L: interop.Reference<number>): interop.Pointer;

declare function sparse_matrix_vector_product_dense_double(transa: CBLAS_TRANSPOSE, alpha: number, A: interop.Pointer, x: interop.Reference<number>, incx: number, y: interop.Reference<number>, incy: number): sparse_status;

declare function sparse_matrix_vector_product_dense_float(transa: CBLAS_TRANSPOSE, alpha: number, A: interop.Pointer, x: interop.Reference<number>, incx: number, y: interop.Reference<number>, incy: number): sparse_status;

declare const enum sparse_norm {

	SPARSE_NORM_ONE = 171,

	SPARSE_NORM_TWO = 173,

	SPARSE_NORM_INF = 175,

	SPARSE_NORM_R1 = 179
}

declare function sparse_operator_norm_double(A: interop.Pointer, norm: sparse_norm): number;

declare function sparse_operator_norm_float(A: interop.Pointer, norm: sparse_norm): number;

declare function sparse_outer_product_dense_double(M: number, N: number, nz: number, alpha: number, x: interop.Reference<number>, incx: number, y: interop.Reference<number>, indy: interop.Reference<number>, C: interop.Reference<interop.Pointer>): sparse_status;

declare function sparse_outer_product_dense_float(M: number, N: number, nz: number, alpha: number, x: interop.Reference<number>, incx: number, y: interop.Reference<number>, indy: interop.Reference<number>, C: interop.Reference<interop.Pointer>): sparse_status;

declare function sparse_pack_vector_double(N: number, nz: number, x: interop.Reference<number>, incx: number, y: interop.Reference<number>, indy: interop.Reference<number>): number;

declare function sparse_pack_vector_float(N: number, nz: number, x: interop.Reference<number>, incx: number, y: interop.Reference<number>, indy: interop.Reference<number>): number;

declare function sparse_permute_cols_double(A: interop.Pointer, perm: interop.Reference<number>): sparse_status;

declare function sparse_permute_cols_float(A: interop.Pointer, perm: interop.Reference<number>): sparse_status;

declare function sparse_permute_rows_double(A: interop.Pointer, perm: interop.Reference<number>): sparse_status;

declare function sparse_permute_rows_float(A: interop.Pointer, perm: interop.Reference<number>): sparse_status;

declare function sparse_set_matrix_property(A: interop.Pointer, pname: sparse_matrix_property): sparse_status;

declare const enum sparse_status {

	SPARSE_SUCCESS = 0,

	SPARSE_ILLEGAL_PARAMETER = -1000,

	SPARSE_CANNOT_SET_PROPERTY = -1001,

	SPARSE_SYSTEM_ERROR = -1002
}

declare function sparse_unpack_vector_double(N: number, nz: number, zero: boolean, x: interop.Reference<number>, indx: interop.Reference<number>, y: interop.Reference<number>, incy: number): void;

declare function sparse_unpack_vector_float(N: number, nz: number, zero: boolean, x: interop.Reference<number>, indx: interop.Reference<number>, y: interop.Reference<number>, incy: number): void;

declare function sparse_vector_add_with_scale_dense_double(nz: number, alpha: number, x: interop.Reference<number>, indx: interop.Reference<number>, y: interop.Reference<number>, incy: number): void;

declare function sparse_vector_add_with_scale_dense_float(nz: number, alpha: number, x: interop.Reference<number>, indx: interop.Reference<number>, y: interop.Reference<number>, incy: number): void;

declare function sparse_vector_norm_double(nz: number, x: interop.Reference<number>, indx: interop.Reference<number>, norm: sparse_norm): number;

declare function sparse_vector_norm_float(nz: number, x: interop.Reference<number>, indx: interop.Reference<number>, norm: sparse_norm): number;

declare function sparse_vector_triangular_solve_dense_double(transt: CBLAS_TRANSPOSE, alpha: number, T: interop.Pointer, x: interop.Reference<number>, incx: number): sparse_status;

declare function sparse_vector_triangular_solve_dense_float(transt: CBLAS_TRANSPOSE, alpha: number, T: interop.Pointer, x: interop.Reference<number>, incx: number): sparse_status;

declare function spbcon_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spbequ_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spbrfs_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __afb: interop.Reference<number>, __ldafb: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spbstf_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spbsv_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spbsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __afb: interop.Reference<number>, __ldafb: interop.Reference<number>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spbtf2_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spbtrf_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spbtrs_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spftrf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spftri_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spftrs_(__transr: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spocon_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spoequ_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spoequb_(__n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sporfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sposv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sposvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spotf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spotrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spotri_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spotrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sppcon_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sppequ_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spprfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __afp: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sppsv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sppsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __afp: interop.Reference<number>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spptrf_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spptri_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spptrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spstf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __piv: interop.Reference<number>, __rank: interop.Reference<number>, __tol: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spstrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __piv: interop.Reference<number>, __rank: interop.Reference<number>, __tol: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sptcon_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spteqr_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sptrfs_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __df: interop.Reference<number>, __ef: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sptsv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sptsvx_(__fact: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __df: interop.Reference<number>, __ef: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spttrf_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function spttrs_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sptts2_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>): number;

declare function srscl_(__n: interop.Reference<number>, __sa: interop.Reference<number>, __sx: interop.Reference<number>, __incx: interop.Reference<number>): number;

declare function ssbev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssbevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssbevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssbgst_(__vect: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __bb: interop.Reference<number>, __ldbb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssbgv_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __bb: interop.Reference<number>, __ldbb: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssbgvd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __bb: interop.Reference<number>, __ldbb: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssbgvx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __bb: interop.Reference<number>, __ldbb: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssbtrd_(__vect: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssfrk_(__transr: string, __uplo: string, __trans: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __alpha: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __beta: interop.Reference<number>, __c__: interop.Reference<number>): number;

declare function sspcon_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sspev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sspevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sspevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sspgst_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __bp: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sspgv_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __bp: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sspgvd_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __bp: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sspgvx_(__itype: interop.Reference<number>, __jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __bp: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssprfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __afp: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sspsv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sspsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __afp: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssptrd_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssptrf_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssptri_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssptrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sstebz_(__range: string, __order: string, __n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __m: interop.Reference<number>, __nsplit: interop.Reference<number>, __w: interop.Reference<number>, __iblock: interop.Reference<number>, __isplit: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sstedc_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sstegr_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sstein_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __iblock: interop.Reference<number>, __isplit: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sstemr_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __nzc: interop.Reference<number>, __isuppz: interop.Reference<number>, __tryrac: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssteqr_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssterf_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sstev_(__jobz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sstevd_(__jobz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sstevr_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function sstevx_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssycon_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssyequb_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssyev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssyevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssyevr_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssyevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssygs2_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssygst_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssygv_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssygvd_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssygvx_(__itype: interop.Reference<number>, __jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssyrfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssysv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssysvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __af: interop.Reference<number>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssytd2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssytf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssytrd_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssytrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssytri_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ssytrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stbcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stbrfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stbtrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<number>, __ldab: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stfsm_(__transr: string, __side: string, __uplo: string, __trans: string, __diag: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __alpha: interop.Reference<number>, __a: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>): number;

declare function stftri_(__transr: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stfttp_(__transr: string, __uplo: string, __n: interop.Reference<number>, __arf: interop.Reference<number>, __ap: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stfttr_(__transr: string, __uplo: string, __n: interop.Reference<number>, __arf: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stgevc_(__side: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __s: interop.Reference<number>, __lds: interop.Reference<number>, __p: interop.Reference<number>, __ldp: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stgex2_(__wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __j1: interop.Reference<number>, __n1: interop.Reference<number>, __n2: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stgexc_(__wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __ifst: interop.Reference<number>, __ilst: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stgsen_(__ijob: interop.Reference<number>, __wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __select: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __alphar: interop.Reference<number>, __alphai: interop.Reference<number>, __beta: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __z__: interop.Reference<number>, __ldz: interop.Reference<number>, __m: interop.Reference<number>, __pl: interop.Reference<number>, __pr: interop.Reference<number>, __dif: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stgsja_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __tola: interop.Reference<number>, __tolb: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __v: interop.Reference<number>, __ldv: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __work: interop.Reference<number>, __ncycle: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stgsna_(__job: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __s: interop.Reference<number>, __dif: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stgsy2_(__trans: string, __ijob: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __d__: interop.Reference<number>, __ldd: interop.Reference<number>, __e: interop.Reference<number>, __lde: interop.Reference<number>, __f: interop.Reference<number>, __ldf: interop.Reference<number>, __scale: interop.Reference<number>, __rdsum: interop.Reference<number>, __rdscal: interop.Reference<number>, __iwork: interop.Reference<number>, __pq: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stgsyl_(__trans: string, __ijob: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __d__: interop.Reference<number>, __ldd: interop.Reference<number>, __e: interop.Reference<number>, __lde: interop.Reference<number>, __f: interop.Reference<number>, __ldf: interop.Reference<number>, __scale: interop.Reference<number>, __dif: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stpcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stprfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stptri_(__uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stptrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stpttf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __arf: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stpttr_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strevc_(__side: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strexc_(__compq: string, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __ifst: interop.Reference<number>, __ilst: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strrfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __x: interop.Reference<number>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strsen_(__job: string, __compq: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __q: interop.Reference<number>, __ldq: interop.Reference<number>, __wr: interop.Reference<number>, __wi: interop.Reference<number>, __m: interop.Reference<number>, __s: interop.Reference<number>, __sep: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strsna_(__job: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<number>, __ldt: interop.Reference<number>, __vl: interop.Reference<number>, __ldvl: interop.Reference<number>, __vr: interop.Reference<number>, __ldvr: interop.Reference<number>, __s: interop.Reference<number>, __sep: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<number>, __ldwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strsyl_(__trana: string, __tranb: string, __isgn: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __c__: interop.Reference<number>, __ldc: interop.Reference<number>, __scale: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strti2_(__uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strtri_(__uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strtrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strttf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __arf: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function strttp_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __ap: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stzrqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function stzrzf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __tau: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function vDSP_DCT_CreateSetup(__Previous: interop.Pointer, __Length: number, __Type: vDSP_DCT_Type): interop.Pointer;

declare function vDSP_DCT_Execute(__Setup: interop.Pointer, __Input: interop.Reference<number>, __Output: interop.Reference<number>): void;

declare const enum vDSP_DCT_Type {

	II = 2,

	III = 3,

	IV = 4
}

declare function vDSP_DFT_CreateSetup(__Previous: interop.Pointer, __Length: number): interop.Pointer;

declare function vDSP_DFT_DestroySetup(__Setup: interop.Pointer): void;

declare function vDSP_DFT_DestroySetupD(__Setup: interop.Pointer): void;

declare const enum vDSP_DFT_Direction {

	FORWARD = 1,

	INVERSE = -1
}

declare function vDSP_DFT_Execute(__Setup: interop.Pointer, __Ir: interop.Reference<number>, __Ii: interop.Reference<number>, __Or: interop.Reference<number>, __Oi: interop.Reference<number>): void;

declare function vDSP_DFT_ExecuteD(__Setup: interop.Pointer, __Ir: interop.Reference<number>, __Ii: interop.Reference<number>, __Or: interop.Reference<number>, __Oi: interop.Reference<number>): void;

declare function vDSP_DFT_zop(__Setup: interop.Pointer, __Ir: interop.Reference<number>, __Ii: interop.Reference<number>, __Is: number, __Or: interop.Reference<number>, __Oi: interop.Reference<number>, __Os: number, __Direction: vDSP_DFT_Direction): void;

declare function vDSP_DFT_zop_CreateSetup(__Previous: interop.Pointer, __Length: number, __Direction: vDSP_DFT_Direction): interop.Pointer;

declare function vDSP_DFT_zop_CreateSetupD(__Previous: interop.Pointer, __Length: number, __Direction: vDSP_DFT_Direction): interop.Pointer;

declare function vDSP_DFT_zrop_CreateSetup(__Previous: interop.Pointer, __Length: number, __Direction: vDSP_DFT_Direction): interop.Pointer;

declare function vDSP_DFT_zrop_CreateSetupD(__Previous: interop.Pointer, __Length: number, __Direction: vDSP_DFT_Direction): interop.Pointer;

declare function vDSP_FFT16_copv(__Output: interop.Reference<number>, __Input: interop.Reference<number>, __Direction: number): void;

declare function vDSP_FFT16_zopv(__Or: interop.Reference<number>, __Oi: interop.Reference<number>, __Ir: interop.Reference<number>, __Ii: interop.Reference<number>, __Direction: number): void;

declare function vDSP_FFT32_copv(__Output: interop.Reference<number>, __Input: interop.Reference<number>, __Direction: number): void;

declare function vDSP_FFT32_zopv(__Or: interop.Reference<number>, __Oi: interop.Reference<number>, __Ir: interop.Reference<number>, __Ii: interop.Reference<number>, __Direction: number): void;

declare function vDSP_biquad(__Setup: interop.Pointer, __Delay: interop.Reference<number>, __X: interop.Reference<number>, __IX: number, __Y: interop.Reference<number>, __IY: number, __N: number): void;

declare function vDSP_biquadD(__Setup: interop.Pointer, __Delay: interop.Reference<number>, __X: interop.Reference<number>, __IX: number, __Y: interop.Reference<number>, __IY: number, __N: number): void;

declare function vDSP_biquad_CreateSetup(__Coefficients: interop.Reference<number>, __M: number): interop.Pointer;

declare function vDSP_biquad_CreateSetupD(__Coefficients: interop.Reference<number>, __M: number): interop.Pointer;

declare function vDSP_biquad_DestroySetup(__setup: interop.Pointer): void;

declare function vDSP_biquad_DestroySetupD(__setup: interop.Pointer): void;

declare function vDSP_biquadm(__Setup: interop.Pointer, __X: interop.Reference<interop.Reference<number>>, __IX: number, __Y: interop.Reference<interop.Reference<number>>, __IY: number, __N: number): void;

declare function vDSP_biquadmD(__Setup: interop.Pointer, __X: interop.Reference<interop.Reference<number>>, __IX: number, __Y: interop.Reference<interop.Reference<number>>, __IY: number, __N: number): void;

declare function vDSP_biquadm_CopyState(__dest: interop.Pointer, __src: interop.Pointer): void;

declare function vDSP_biquadm_CopyStateD(__dest: interop.Pointer, __src: interop.Pointer): void;

declare function vDSP_biquadm_CreateSetup(__coeffs: interop.Reference<number>, __M: number, __N: number): interop.Pointer;

declare function vDSP_biquadm_CreateSetupD(__coeffs: interop.Reference<number>, __M: number, __N: number): interop.Pointer;

declare function vDSP_biquadm_DestroySetup(__setup: interop.Pointer): void;

declare function vDSP_biquadm_DestroySetupD(__setup: interop.Pointer): void;

declare function vDSP_biquadm_ResetState(__setup: interop.Pointer): void;

declare function vDSP_biquadm_ResetStateD(__setup: interop.Pointer): void;

declare function vDSP_biquadm_SetActiveFilters(__setup: interop.Pointer, __filter_states: interop.Reference<boolean>): void;

declare function vDSP_biquadm_SetCoefficientsDouble(__setup: interop.Pointer, __coeffs: interop.Reference<number>, __start_sec: number, __start_chn: number, __nsec: number, __nchn: number): void;

declare function vDSP_biquadm_SetCoefficientsSingle(__setup: interop.Pointer, __coeffs: interop.Reference<number>, __start_sec: number, __start_chn: number, __nsec: number, __nchn: number): void;

declare function vDSP_biquadm_SetTargetsDouble(__setup: interop.Pointer, __targets: interop.Reference<number>, __interp_rate: number, __interp_threshold: number, __start_sec: number, __start_chn: number, __nsec: number, __nchn: number): void;

declare function vDSP_biquadm_SetTargetsSingle(__setup: interop.Pointer, __targets: interop.Reference<number>, __interp_rate: number, __interp_threshold: number, __start_sec: number, __start_chn: number, __nsec: number, __nchn: number): void;

declare function vDSP_blkman_window(__C: interop.Reference<number>, __N: number, __Flag: number): void;

declare function vDSP_blkman_windowD(__C: interop.Reference<number>, __N: number, __Flag: number): void;

declare function vDSP_conv(__A: interop.Reference<number>, __IA: number, __F: interop.Reference<number>, __IF: number, __C: interop.Reference<number>, __IC: number, __N: number, __P: number): void;

declare function vDSP_convD(__A: interop.Reference<number>, __IA: number, __F: interop.Reference<number>, __IF: number, __C: interop.Reference<number>, __IC: number, __N: number, __P: number): void;

declare function vDSP_create_fftsetup(__Log2n: number, __Radix: number): interop.Pointer;

declare function vDSP_create_fftsetupD(__Log2n: number, __Radix: number): interop.Pointer;

declare function vDSP_ctoz(__C: interop.Reference<DSPComplex>, __IC: number, __Z: interop.Reference<DSPSplitComplex>, __IZ: number, __N: number): void;

declare function vDSP_ctozD(__C: interop.Reference<DSPDoubleComplex>, __IC: number, __Z: interop.Reference<DSPDoubleSplitComplex>, __IZ: number, __N: number): void;

declare function vDSP_deq22(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_deq22D(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_desamp(__A: interop.Reference<number>, __DF: number, __F: interop.Reference<number>, __C: interop.Reference<number>, __N: number, __P: number): void;

declare function vDSP_desampD(__A: interop.Reference<number>, __DF: number, __F: interop.Reference<number>, __C: interop.Reference<number>, __N: number, __P: number): void;

declare function vDSP_destroy_fftsetup(__setup: interop.Pointer): void;

declare function vDSP_destroy_fftsetupD(__setup: interop.Pointer): void;

declare function vDSP_distancesq(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_distancesqD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_dotpr(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_dotpr2(__A0: interop.Reference<number>, __A0Stride: number, __A1: interop.Reference<number>, __A1Stride: number, __B: interop.Reference<number>, __BStride: number, __C0: interop.Reference<number>, __C1: interop.Reference<number>, __Length: number): void;

declare function vDSP_dotpr2D(__A0: interop.Reference<number>, __A0Stride: number, __A1: interop.Reference<number>, __A1Stride: number, __B: interop.Reference<number>, __BStride: number, __C0: interop.Reference<number>, __C1: interop.Reference<number>, __Length: number): void;

declare function vDSP_dotpr2_s1_15(__A0: interop.Reference<number>, __A0Stride: number, __A1: interop.Reference<number>, __A1Stride: number, __B: interop.Reference<number>, __BStride: number, __C0: interop.Reference<number>, __C1: interop.Reference<number>, __N: number): void;

declare function vDSP_dotpr2_s8_24(__A0: interop.Reference<number>, __A0Stride: number, __A1: interop.Reference<number>, __A1Stride: number, __B: interop.Reference<number>, __BStride: number, __C0: interop.Reference<number>, __C1: interop.Reference<number>, __N: number): void;

declare function vDSP_dotprD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_dotpr_s1_15(__A: interop.Reference<number>, __AStride: number, __B: interop.Reference<number>, __BStride: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_dotpr_s8_24(__A: interop.Reference<number>, __AStride: number, __B: interop.Reference<number>, __BStride: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_f3x3(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>): void;

declare function vDSP_f3x3D(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>): void;

declare function vDSP_f5x5(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>): void;

declare function vDSP_f5x5D(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>): void;

declare function vDSP_fft2d_zip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zipD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zipt(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC1: number, __IC0: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_ziptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zopD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zopt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zoptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zrip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zripD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __flag: number): void;

declare function vDSP_fft2d_zript(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zriptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N0: number, __Log2N1: number, __flag: number): void;

declare function vDSP_fft2d_zrop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zropD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zropt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft2d_zroptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA0: number, __IA1: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC0: number, __IC1: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N0: number, __Log2N1: number, __Direction: number): void;

declare function vDSP_fft3_zop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft3_zopD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft5_zop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft5_zopD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zipD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zipt(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_ziptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zopD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zopt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zoptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zrip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zripD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zript(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zriptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zrop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zropD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zropt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __Direction: number): void;

declare function vDSP_fft_zroptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __Direction: number): void;

declare function vDSP_fftm_zip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IM: number, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zipD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IM: number, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zipt(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IM: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_ziptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IM: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IMC: number, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zopD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IMC: number, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zopt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IMC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zoptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IMC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zrip(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IM: number, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zripD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IM: number, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zript(__Setup: interop.Pointer, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IM: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zriptD(__Setup: interop.Pointer, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IM: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zrop(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IMC: number, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zropD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IMC: number, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zropt(__Setup: interop.Pointer, __A: interop.Reference<DSPSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __IMC: number, __Buffer: interop.Reference<DSPSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_fftm_zroptD(__Setup: interop.Pointer, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __IMA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __IMC: number, __Buffer: interop.Reference<DSPDoubleSplitComplex>, __Log2N: number, __M: number, __Direction: number): void;

declare function vDSP_hamm_window(__C: interop.Reference<number>, __N: number, __Flag: number): void;

declare function vDSP_hamm_windowD(__C: interop.Reference<number>, __N: number, __Flag: number): void;

declare function vDSP_hann_window(__C: interop.Reference<number>, __N: number, __Flag: number): void;

declare function vDSP_hann_windowD(__C: interop.Reference<number>, __N: number, __Flag: number): void;

declare function vDSP_imgfir(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>, __P: number, __Q: number): void;

declare function vDSP_imgfirD(__A: interop.Reference<number>, __NR: number, __NC: number, __F: interop.Reference<number>, __C: interop.Reference<number>, __P: number, __Q: number): void;

interface vDSP_int24 {
	bytes: interop.Reference<number>;
}
declare var vDSP_int24: interop.StructType<vDSP_int24>;

declare function vDSP_maxmgv(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_maxmgvD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_maxmgvi(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __I: interop.Reference<number>, __N: number): void;

declare function vDSP_maxmgviD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __I: interop.Reference<number>, __N: number): void;

declare function vDSP_maxv(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_maxvD(__A: interop.Reference<number>, __I: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_maxvi(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __I: interop.Reference<number>, __N: number): void;

declare function vDSP_maxviD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __I: interop.Reference<number>, __N: number): void;

declare function vDSP_meamgv(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_meamgvD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_meanv(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_meanvD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_measqv(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_measqvD(__A: interop.Reference<number>, __I: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_minmgv(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_minmgvD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_minmgvi(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __I: interop.Reference<number>, __N: number): void;

declare function vDSP_minmgviD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __I: interop.Reference<number>, __N: number): void;

declare function vDSP_minv(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_minvD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_minvi(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __I: interop.Reference<number>, __N: number): void;

declare function vDSP_minviD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __I: interop.Reference<number>, __N: number): void;

declare function vDSP_mmov(__A: interop.Reference<number>, __C: interop.Reference<number>, __M: number, __N: number, __TA: number, __TC: number): void;

declare function vDSP_mmovD(__A: interop.Reference<number>, __C: interop.Reference<number>, __M: number, __N: number, __TA: number, __TC: number): void;

declare function vDSP_mmul(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __M: number, __N: number, __P: number): void;

declare function vDSP_mmulD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __M: number, __N: number, __P: number): void;

declare function vDSP_mtrans(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __M: number, __N: number): void;

declare function vDSP_mtransD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __M: number, __N: number): void;

declare function vDSP_mvessq(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_mvessqD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_normalize(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __Mean: interop.Reference<number>, __StandardDeviation: interop.Reference<number>, __N: number): void;

declare function vDSP_normalizeD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __Mean: interop.Reference<number>, __StandardDeviation: interop.Reference<number>, __N: number): void;

declare function vDSP_nzcros(__A: interop.Reference<number>, __IA: number, __B: number, __C: interop.Reference<number>, __D: interop.Reference<number>, __N: number): void;

declare function vDSP_nzcrosD(__A: interop.Reference<number>, __IA: number, __B: number, __C: interop.Reference<number>, __D: interop.Reference<number>, __N: number): void;

declare function vDSP_polar(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_polarD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_rect(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_rectD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_rmsqv(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_rmsqvD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_svdiv(__A: interop.Reference<number>, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_svdivD(__A: interop.Reference<number>, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_sve(__A: interop.Reference<number>, __I: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_sveD(__A: interop.Reference<number>, __I: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_sve_svesq(__A: interop.Reference<number>, __IA: number, __Sum: interop.Reference<number>, __SumOfSquares: interop.Reference<number>, __N: number): void;

declare function vDSP_sve_svesqD(__A: interop.Reference<number>, __IA: number, __Sum: interop.Reference<number>, __SumOfSquares: interop.Reference<number>, __N: number): void;

declare function vDSP_svemg(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_svemgD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_svesq(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_svesqD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_svs(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_svsD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __N: number): void;

interface vDSP_uint24 {
	bytes: interop.Reference<number>;
}
declare var vDSP_uint24: interop.StructType<vDSP_uint24>;

declare function vDSP_vaam(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vaamD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vabs(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vabsD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vabsi(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vadd(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vaddD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vaddi(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vaddsub(__I0: interop.Reference<number>, __I0S: number, __I1: interop.Reference<number>, __I1S: number, __O0: interop.Reference<number>, __O0S: number, __O1: interop.Reference<number>, __O1S: number, __N: number): void;

declare function vDSP_vaddsubD(__I0: interop.Reference<number>, __I0S: number, __I1: interop.Reference<number>, __I1S: number, __O0: interop.Reference<number>, __O0S: number, __O1: interop.Reference<number>, __O1S: number, __N: number): void;

declare function vDSP_vam(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vamD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __IDD: number, __N: number): void;

declare function vDSP_vasbm(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vasbmD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vasm(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vasmD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vavlin(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vavlinD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vclip(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vclipD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vclipc(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number, __NLow: interop.Reference<number>, __NHigh: interop.Reference<number>): void;

declare function vDSP_vclipcD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number, __NLow: interop.Reference<number>, __NHigh: interop.Reference<number>): void;

declare function vDSP_vclr(__C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vclrD(__C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vcmprs(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vcmprsD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vdbcon(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number, __F: number): void;

declare function vDSP_vdbconD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number, __F: number): void;

declare function vDSP_vdist(__A: interop.Reference<number>, __I: number, __B: interop.Reference<number>, __J: number, __C: interop.Reference<number>, __K: number, __N: number): void;

declare function vDSP_vdistD(__A: interop.Reference<number>, __I: number, __B: interop.Reference<number>, __J: number, __C: interop.Reference<number>, __K: number, __N: number): void;

declare function vDSP_vdiv(__B: interop.Reference<number>, __IB: number, __A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vdivD(__B: interop.Reference<number>, __IB: number, __A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vdivi(__B: interop.Reference<number>, __IB: number, __A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vdpsp(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_venvlp(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_venvlpD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_veqvi(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfill(__A: interop.Reference<number>, __C: interop.Reference<number>, __IA: number, __N: number): void;

declare function vDSP_vfillD(__A: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfilli(__A: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfix16(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfix16D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfix32(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfix32D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfix8(__A: interop.Reference<number>, __IA: number, __C: string, __IC: number, __N: number): void;

declare function vDSP_vfix8D(__A: interop.Reference<number>, __IA: number, __C: string, __IC: number, __N: number): void;

declare function vDSP_vfixr16(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixr16D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixr32(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixr32D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixr8(__A: interop.Reference<number>, __IA: number, __C: string, __IC: number, __N: number): void;

declare function vDSP_vfixr8D(__A: interop.Reference<number>, __IA: number, __C: string, __IC: number, __N: number): void;

declare function vDSP_vfixru16(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixru16D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixru32(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixru32D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixru8(__A: interop.Reference<number>, __IA: number, __C: string, __IC: number, __N: number): void;

declare function vDSP_vfixru8D(__A: interop.Reference<number>, __IA: number, __C: string, __IC: number, __N: number): void;

declare function vDSP_vfixu16(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixu16D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixu32(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixu32D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfixu8(__A: interop.Reference<number>, __IA: number, __C: string, __IC: number, __N: number): void;

declare function vDSP_vfixu8D(__A: interop.Reference<number>, __IA: number, __C: string, __IC: number, __N: number): void;

declare function vDSP_vflt16(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vflt16D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vflt24(__A: interop.Reference<vDSP_int24>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vflt32(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vflt32D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vflt8(__A: string, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vflt8D(__A: string, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfltsm24(__A: interop.Reference<vDSP_int24>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfltsmu24(__A: interop.Reference<vDSP_uint24>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfltu16(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfltu16D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfltu24(__A: interop.Reference<vDSP_uint24>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfltu32(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfltu32D(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfltu8(__A: string, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfltu8D(__A: string, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfrac(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vfracD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vgathr(__A: interop.Reference<number>, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vgathrD(__A: interop.Reference<number>, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vgathra(__A: interop.Reference<interop.Reference<number>>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vgathraD(__A: interop.Reference<interop.Reference<number>>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vgen(__A: interop.Reference<number>, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vgenD(__A: interop.Reference<number>, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vgenp(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number, __M: number): void;

declare function vDSP_vgenpD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number, __M: number): void;

declare function vDSP_viclip(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_viclipD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vindex(__A: interop.Reference<number>, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vindexD(__A: interop.Reference<number>, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vintb(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vintbD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vlim(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vlimD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vlint(__A: interop.Reference<number>, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number, __M: number): void;

declare function vDSP_vlintD(__A: interop.Reference<number>, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number, __M: number): void;

declare function vDSP_vma(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vmaD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vmax(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vmaxD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vmaxmg(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vmaxmgD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vmin(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vminD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vminmg(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vminmgD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vmma(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vmmaD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vmmsb(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vmmsbD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vmsa(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vmsaD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vmsb(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vmsbD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vmul(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vmulD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vnabs(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vnabsD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vneg(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vnegD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vpoly(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number, __P: number): void;

declare function vDSP_vpolyD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number, __P: number): void;

declare function vDSP_vpythg(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vpythgD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vqint(__A: interop.Reference<number>, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number, __M: number): void;

declare function vDSP_vqintD(__A: interop.Reference<number>, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number, __M: number): void;

declare function vDSP_vramp(__A: interop.Reference<number>, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vrampD(__A: interop.Reference<number>, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vrampmul(__I: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmul2(__I0: interop.Reference<number>, __I1: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O0: interop.Reference<number>, __O1: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmul2D(__I0: interop.Reference<number>, __I1: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O0: interop.Reference<number>, __O1: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmul2_s1_15(__I0: interop.Reference<number>, __I1: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O0: interop.Reference<number>, __O1: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmul2_s8_24(__I0: interop.Reference<number>, __I1: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O0: interop.Reference<number>, __O1: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmulD(__I: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmul_s1_15(__I: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmul_s8_24(__I: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmuladd(__I: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmuladd2(__I0: interop.Reference<number>, __I1: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O0: interop.Reference<number>, __O1: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmuladd2D(__I0: interop.Reference<number>, __I1: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O0: interop.Reference<number>, __O1: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmuladd2_s1_15(__I0: interop.Reference<number>, __I1: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O0: interop.Reference<number>, __O1: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmuladd2_s8_24(__I0: interop.Reference<number>, __I1: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O0: interop.Reference<number>, __O1: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmuladdD(__I: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmuladd_s1_15(__I: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrampmuladd_s8_24(__I: interop.Reference<number>, __IS: number, __Start: interop.Reference<number>, __Step: interop.Reference<number>, __O: interop.Reference<number>, __OS: number, __N: number): void;

declare function vDSP_vrsum(__A: interop.Reference<number>, __IA: number, __S: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vrsumD(__A: interop.Reference<number>, __IA: number, __S: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vrvrs(__C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vrvrsD(__C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsadd(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsaddD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsaddi(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsbm(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vsbmD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vsbsbm(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vsbsbmD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vsbsm(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vsbsmD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vsdiv(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsdivD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsdivi(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsimps(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsimpsD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsma(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vsmaD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vsmfix24(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<vDSP_int24>, __IC: number, __N: number): void;

declare function vDSP_vsmfixu24(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<vDSP_uint24>, __IC: number, __N: number): void;

declare function vDSP_vsmsa(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vsmsaD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __ID: interop.Reference<number>, __L: number, __N: number): void;

declare function vDSP_vsmsb(__A: interop.Reference<number>, __I: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __K: number, __D: interop.Reference<number>, __L: number, __N: number): void;

declare function vDSP_vsmsbD(__A: interop.Reference<number>, __I: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __K: number, __D: interop.Reference<number>, __L: number, __N: number): void;

declare function vDSP_vsmsma(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vsmsmaD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __E: interop.Reference<number>, __IE: number, __N: number): void;

declare function vDSP_vsmul(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsmulD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsort(__C: interop.Reference<number>, __N: number, __Order: number): void;

declare function vDSP_vsortD(__C: interop.Reference<number>, __N: number, __Order: number): void;

declare function vDSP_vsorti(__C: interop.Reference<number>, __I: interop.Reference<number>, __Temporary: interop.Reference<number>, __N: number, __Order: number): void;

declare function vDSP_vsortiD(__C: interop.Reference<number>, __I: interop.Reference<number>, __Temporary: interop.Reference<number>, __N: number, __Order: number): void;

declare function vDSP_vspdp(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsq(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsqD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vssq(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vssqD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsub(__B: interop.Reference<number>, __IB: number, __A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vsubD(__B: interop.Reference<number>, __IB: number, __A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vswap(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __N: number): void;

declare function vDSP_vswapD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __N: number): void;

declare function vDSP_vswmax(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number, __WindowLength: number): void;

declare function vDSP_vswmaxD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number, __WindowLength: number): void;

declare function vDSP_vswsum(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number, __P: number): void;

declare function vDSP_vswsumD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number, __P: number): void;

declare function vDSP_vtabi(__A: interop.Reference<number>, __IA: number, __S1: interop.Reference<number>, __S2: interop.Reference<number>, __C: interop.Reference<number>, __M: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vtabiD(__A: interop.Reference<number>, __IA: number, __S1: interop.Reference<number>, __S2: interop.Reference<number>, __C: interop.Reference<number>, __M: number, __ID: interop.Reference<number>, __L: number, __N: number): void;

declare function vDSP_vthr(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vthrD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vthres(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vthresD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vthrsc(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vthrscD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vDSP_vtmerg(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vtmergD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vtrapz(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_vtrapzD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_wiener(__L: number, __A: interop.Reference<number>, __C: interop.Reference<number>, __F: interop.Reference<number>, __P: interop.Reference<number>, __Flag: number, __Error: interop.Reference<number>): void;

declare function vDSP_wienerD(__L: number, __A: interop.Reference<number>, __C: interop.Reference<number>, __F: interop.Reference<number>, __P: interop.Reference<number>, __Flag: number, __Error: interop.Reference<number>): void;

declare function vDSP_zaspec(__A: interop.Reference<DSPSplitComplex>, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_zaspecD(__A: interop.Reference<DSPDoubleSplitComplex>, __C: interop.Reference<number>, __N: number): void;

declare function vDSP_zcoher(__A: interop.Reference<number>, __B: interop.Reference<number>, __C: interop.Reference<DSPSplitComplex>, __D: interop.Reference<number>, __N: number): void;

declare function vDSP_zcoherD(__A: interop.Reference<number>, __B: interop.Reference<number>, __C: interop.Reference<DSPDoubleSplitComplex>, __D: interop.Reference<number>, __N: number): void;

declare function vDSP_zconv(__A: interop.Reference<DSPSplitComplex>, __IA: number, __F: interop.Reference<DSPSplitComplex>, __IF: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number, __P: number): void;

declare function vDSP_zconvD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __F: interop.Reference<DSPDoubleSplitComplex>, __IF: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number, __P: number): void;

declare function vDSP_zcspec(__A: interop.Reference<DSPSplitComplex>, __B: interop.Reference<DSPSplitComplex>, __C: interop.Reference<DSPSplitComplex>, __N: number): void;

declare function vDSP_zcspecD(__A: interop.Reference<DSPDoubleSplitComplex>, __B: interop.Reference<DSPDoubleSplitComplex>, __C: interop.Reference<DSPDoubleSplitComplex>, __N: number): void;

declare function vDSP_zdotpr(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __N: number): void;

declare function vDSP_zdotprD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __N: number): void;

declare function vDSP_zidotpr(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __N: number): void;

declare function vDSP_zidotprD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __N: number): void;

declare function vDSP_zmma(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function vDSP_zmmaD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function vDSP_zmms(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function vDSP_zmmsD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function vDSP_zmmul(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __M: number, __N: number, __P: number): void;

declare function vDSP_zmmulD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __M: number, __N: number, __P: number): void;

declare function vDSP_zmsm(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function vDSP_zmsmD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function vDSP_zrdesamp(__A: interop.Reference<DSPSplitComplex>, __DF: number, __F: interop.Reference<number>, __C: interop.Reference<DSPSplitComplex>, __N: number, __P: number): void;

declare function vDSP_zrdesampD(__A: interop.Reference<DSPDoubleSplitComplex>, __DF: number, __F: interop.Reference<number>, __C: interop.Reference<DSPDoubleSplitComplex>, __N: number, __P: number): void;

declare function vDSP_zrdotpr(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __N: number): void;

declare function vDSP_zrdotprD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __N: number): void;

declare function vDSP_zrvadd(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zrvaddD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zrvdiv(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zrvdivD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zrvmul(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zrvmulD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zrvsub(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zrvsubD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_ztoc(__Z: interop.Reference<DSPSplitComplex>, __IZ: number, __C: interop.Reference<DSPComplex>, __IC: number, __N: number): void;

declare function vDSP_ztocD(__Z: interop.Reference<DSPDoubleSplitComplex>, __IZ: number, __C: interop.Reference<DSPDoubleComplex>, __IC: number, __N: number): void;

declare function vDSP_ztrans(__A: interop.Reference<number>, __B: interop.Reference<DSPSplitComplex>, __C: interop.Reference<DSPSplitComplex>, __N: number): void;

declare function vDSP_ztransD(__A: interop.Reference<number>, __B: interop.Reference<DSPDoubleSplitComplex>, __C: interop.Reference<DSPDoubleSplitComplex>, __N: number): void;

declare function vDSP_zvabs(__A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_zvabsD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_zvadd(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvaddD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvcma(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __N: number): void;

declare function vDSP_zvcmaD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __N: number): void;

declare function vDSP_zvcmul(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvcmulD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __iC: number, __N: number): void;

declare function vDSP_zvconj(__A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvconjD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvdiv(__B: interop.Reference<DSPSplitComplex>, __IB: number, __A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvdivD(__B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvfill(__A: interop.Reference<DSPSplitComplex>, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvfillD(__A: interop.Reference<DSPDoubleSplitComplex>, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvma(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __N: number): void;

declare function vDSP_zvmaD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __N: number): void;

declare function vDSP_zvmags(__A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_zvmagsD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_zvmgsa(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_zvmgsaD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_zvmmaa(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __E: interop.Reference<DSPSplitComplex>, __IE: number, __F: interop.Reference<DSPSplitComplex>, __IF: number, __N: number): void;

declare function vDSP_zvmmaaD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __E: interop.Reference<DSPDoubleSplitComplex>, __IE: number, __F: interop.Reference<DSPDoubleSplitComplex>, __IF: number, __N: number): void;

declare function vDSP_zvmov(__A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvmovD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvmul(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number, __Conjugate: number): void;

declare function vDSP_zvmulD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number, __Conjugate: number): void;

declare function vDSP_zvneg(__A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvnegD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvphas(__A: interop.Reference<DSPSplitComplex>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_zvphasD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vDSP_zvsma(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __N: number): void;

declare function vDSP_zvsmaD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __N: number): void;

declare function vDSP_zvsub(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvsubD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvzsml(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function vDSP_zvzsmlD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare const enum vImageARGBType {

	kvImageARGB8888 = 0,

	kvImageARGB16U = 1,

	kvImageARGB16Q12 = 2
}

declare function vImageAffineWarpCG_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarpCG_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarpCG_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarpCG_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarpCG_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: number, flags: number): number;

declare function vImageAffineWarpCG_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: number, flags: number): number;

declare function vImageAffineWarpD_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform_Double>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarpD_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform_Double>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarpD_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform_Double>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarpD_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform_Double>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarpD_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform_Double>, backColor: number, flags: number): number;

declare function vImageAffineWarpD_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform_Double>, backColor: number, flags: number): number;

declare function vImageAffineWarp_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarp_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarp_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarp_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: interop.Reference<number>, flags: number): number;

declare function vImageAffineWarp_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: number, flags: number): number;

declare function vImageAffineWarp_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, transform: interop.Reference<vImage_AffineTransform>, backColor: number, flags: number): number;

declare function vImageAlphaBlend_ARGB8888(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageAlphaBlend_ARGBFFFF(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageAlphaBlend_NonpremultipliedToPremultiplied_ARGB8888(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageAlphaBlend_NonpremultipliedToPremultiplied_ARGBFFFF(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageAlphaBlend_NonpremultipliedToPremultiplied_Planar8(srcTop: interop.Reference<vImage_Buffer>, srcTopAlpha: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageAlphaBlend_NonpremultipliedToPremultiplied_PlanarF(srcTop: interop.Reference<vImage_Buffer>, srcTopAlpha: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageAlphaBlend_Planar8(srcTop: interop.Reference<vImage_Buffer>, srcTopAlpha: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, srcBottomAlpha: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageAlphaBlend_PlanarF(srcTop: interop.Reference<vImage_Buffer>, srcTopAlpha: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, srcBottomAlpha: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageBoxConvolve_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageBoxConvolve_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, backgroundColor: number, flags: number): number;

declare function vImageBufferFill_ARGB16S(dest: interop.Reference<vImage_Buffer>, color: interop.Reference<number>, flags: number): number;

declare function vImageBufferFill_ARGB16U(dest: interop.Reference<vImage_Buffer>, color: interop.Reference<number>, flags: number): number;

declare function vImageBufferFill_ARGB8888(dest: interop.Reference<vImage_Buffer>, color: interop.Reference<number>, flags: number): number;

declare function vImageBufferFill_ARGBFFFF(dest: interop.Reference<vImage_Buffer>, color: interop.Reference<number>, flags: number): number;

declare function vImageBuffer_CopyToCVPixelBuffer(buffer: interop.Reference<vImage_Buffer>, bufferFormat: interop.Reference<vImage_CGImageFormat>, cvPixelBuffer: any, cvImageFormat: any, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageBuffer_GetSize(buf: interop.Reference<vImage_Buffer>): CGSize;

declare function vImageBuffer_Init(buf: interop.Reference<vImage_Buffer>, height: number, width: number, pixelBits: number, flags: number): number;

declare function vImageBuffer_InitForCopyFromCVPixelBuffer(buffers: interop.Reference<vImage_Buffer>, converter: any, pixelBuffer: any, flags: number): number;

declare function vImageBuffer_InitForCopyToCVPixelBuffer(buffers: interop.Reference<vImage_Buffer>, converter: any, pixelBuffer: any, flags: number): number;

declare function vImageBuffer_InitWithCGImage(buf: interop.Reference<vImage_Buffer>, format: interop.Reference<vImage_CGImageFormat>, backgroundColor: interop.Reference<number>, image: any, flags: number): number;

declare function vImageBuffer_InitWithCVPixelBuffer(buffer: interop.Reference<vImage_Buffer>, desiredFormat: interop.Reference<vImage_CGImageFormat>, cvPixelBuffer: any, cvImageFormat: any, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageByteSwap_Planar16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageCGImageFormat_GetComponentCount(format: interop.Reference<vImage_CGImageFormat>): number;

declare function vImageCGImageFormat_IsEqual(f1: interop.Reference<vImage_CGImageFormat>, f2: interop.Reference<vImage_CGImageFormat>): boolean;

declare function vImageCVImageFormat_Copy(format: any): interop.Unmanaged<any>;

declare function vImageCVImageFormat_CopyChannelDescription(format: any, desc: interop.Reference<vImageChannelDescription>, type: number): number;

declare function vImageCVImageFormat_CopyConversionMatrix(format: any, matrix: interop.Pointer, inType: number): number;

declare function vImageCVImageFormat_Create(imageFormatType: number, matrix: interop.Reference<vImage_ARGBToYpCbCrMatrix>, cvImageBufferChromaLocation: string, baseColorspace: any, alphaIsOneHint: number): interop.Unmanaged<any>;

declare function vImageCVImageFormat_CreateWithCVPixelBuffer(buffer: any): interop.Unmanaged<any>;

declare function vImageCVImageFormat_GetAlphaHint(format: any): number;

declare function vImageCVImageFormat_GetChannelCount(format: any): number;

declare function vImageCVImageFormat_GetChannelDescription(format: any, type: number): interop.Reference<vImageChannelDescription>;

declare function vImageCVImageFormat_GetChannelNames(format: any): interop.Reference<number>;

declare function vImageCVImageFormat_GetChromaSiting(format: any): interop.Unmanaged<string>;

declare function vImageCVImageFormat_GetColorSpace(format: any): interop.Unmanaged<any>;

declare function vImageCVImageFormat_GetConversionMatrix(format: any, outType: interop.Reference<number>): interop.Pointer;

declare function vImageCVImageFormat_GetFormatCode(format: any): number;

declare function vImageCVImageFormat_GetUserData(format: any): interop.Pointer;

declare function vImageCVImageFormat_Release(fmt: any): void;

declare function vImageCVImageFormat_Retain(fmt: any): void;

declare function vImageCVImageFormat_SetAlphaHint(format: any, alphaIsOne: number): number;

declare function vImageCVImageFormat_SetChromaSiting(format: any, siting: string): number;

declare function vImageCVImageFormat_SetColorSpace(format: any, colorspace: any): number;

declare function vImageCVImageFormat_SetUserData(format: any, userData: interop.Pointer, userDataReleaseCallback: interop.FunctionReference<(p1: any, p2: interop.Pointer) => void>): number;

interface vImageChannelDescription {
	min: number;
	zero: number;
	full: number;
	max: number;
}
declare var vImageChannelDescription: interop.StructType<vImageChannelDescription>;

declare function vImageClipToAlpha_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageClipToAlpha_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageClipToAlpha_Planar8(src: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageClipToAlpha_PlanarF(src: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageClipToAlpha_RGBA8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageClipToAlpha_RGBAFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageClip_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, maxFloat: number, minFloat: number, flags: number): number;

declare function vImageContrastStretch_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageContrastStretch_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, histogram_entries: number, minVal: number, maxVal: number, flags: number): number;

declare function vImageContrastStretch_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageContrastStretch_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, histogram_entries: number, minVal: number, maxVal: number, flags: number): number;

declare function vImageConvert_16Fto16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_16Q12to16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_16Q12to8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_16Q12toF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_16SToF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, offset: number, scale: number, flags: number): number;

declare function vImageConvert_16UToF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, offset: number, scale: number, flags: number): number;

declare function vImageConvert_16UToPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_16Uto16F(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_16Uto16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_420Yp8_Cb8_Cr8ToARGB8888(srcYp: interop.Reference<vImage_Buffer>, srcCb: interop.Reference<vImage_Buffer>, srcCr: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_420Yp8_CbCr8ToARGB8888(srcYp: interop.Reference<vImage_Buffer>, srcCbCr: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_422CbYpCrYp16ToARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_422CbYpCrYp16ToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_422CbYpCrYp8ToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_422CbYpCrYp8_AA8ToARGB8888(src: interop.Reference<vImage_Buffer>, srcA: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_422CrYpCbYpCbYpCbYpCrYpCrYp10ToARGB16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_422CrYpCbYpCbYpCbYpCrYpCrYp10ToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_422YpCbYpCr8ToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_444AYpCbCr16ToARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_444AYpCbCr16ToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_444AYpCbCr8ToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_444CbYpCrA8ToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_444CrYpCb10ToARGB16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_444CrYpCb10ToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_444CrYpCb8ToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_YpCbCrToARGB>, permuteMap: interop.Reference<number>, alpha: number, flags: number): number;

declare function vImageConvert_8to16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGB1555toARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGB1555toPlanar8(src: interop.Reference<vImage_Buffer>, destA: interop.Reference<vImage_Buffer>, destR: interop.Reference<vImage_Buffer>, destG: interop.Reference<vImage_Buffer>, destB: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGB1555toRGB565(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGB16Q12To422CrYpCbYpCbYpCbYpCrYpCrYp10(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB16Q12To444CrYpCb10(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB16Q12ToRGBA1010102(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, RGB101010RangeMin: number, RGB101010RangeMax: number, RGB101010Min: number, RGB101010Max: number, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB16UTo422CbYpCrYp16(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB16UTo444AYpCbCr16(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB16UToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, copyMask: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB16UToRGBA1010102(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, RGB101010RangeMin: number, RGB101010RangeMax: number, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB16UtoPlanar16U(argbSrc: interop.Reference<vImage_Buffer>, aDest: interop.Reference<vImage_Buffer>, rDest: interop.Reference<vImage_Buffer>, gDest: interop.Reference<vImage_Buffer>, bDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGB16UtoRGB16U(argbSrc: interop.Reference<vImage_Buffer>, rgbDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGB8888To420Yp8_Cb8_Cr8(src: interop.Reference<vImage_Buffer>, destYp: interop.Reference<vImage_Buffer>, destCb: interop.Reference<vImage_Buffer>, destCr: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To420Yp8_CbCr8(src: interop.Reference<vImage_Buffer>, destYp: interop.Reference<vImage_Buffer>, destCbCr: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To422CbYpCrYp16(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To422CbYpCrYp8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To422CbYpCrYp8_AA8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, destA: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To422CrYpCbYpCbYpCbYpCrYpCrYp10(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To422YpCbYpCr8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To444AYpCbCr16(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To444AYpCbCr8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To444CbYpCrA8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To444CrYpCb10(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888To444CrYpCb8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, info: interop.Reference<vImage_ARGBToYpCbCr>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888ToARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, copyMask: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888ToRGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, copyMask: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888ToRGBA1010102(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, RGB101010RangeMin: number, RGB101010RangeMax: number, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888toARGB1555(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGB8888toPlanar16Q12(src: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGB8888toPlanar8(srcARGB: interop.Reference<vImage_Buffer>, destA: interop.Reference<vImage_Buffer>, destR: interop.Reference<vImage_Buffer>, destG: interop.Reference<vImage_Buffer>, destB: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGB8888toPlanarF(src: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, maxFloat: interop.Reference<number>, minFloat: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGB8888toRGB565(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGB8888toRGB888(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: number): number;

declare function vImageConvert_ARGBFFFFtoARGB8888_dithered(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, maxFloat: interop.Reference<number>, minFloat: interop.Reference<number>, dither: number, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGBFFFFtoPlanar8(src: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, maxFloat: interop.Reference<number>, minFloat: interop.Reference<number>, flags: number): number;

declare function vImageConvert_ARGBFFFFtoPlanarF(srcARGB: interop.Reference<vImage_Buffer>, destA: interop.Reference<vImage_Buffer>, destR: interop.Reference<vImage_Buffer>, destG: interop.Reference<vImage_Buffer>, destB: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGBFFFFtoRGBFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ARGBToYpCbCr_GenerateConversion(matrix: interop.Reference<vImage_ARGBToYpCbCrMatrix>, pixelRange: interop.Reference<vImage_YpCbCrPixelRange>, outInfo: interop.Reference<vImage_ARGBToYpCbCr>, inARGBType: vImageARGBType, outYpCbCrType: vImageYpCbCrType, flags: number): number;

declare function vImageConvert_AnyToAny(converter: any, srcs: interop.Reference<vImage_Buffer>, dests: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, flags: number): number;

declare function vImageConvert_BGRA16UtoRGB16U(bgraSrc: interop.Reference<vImage_Buffer>, rgbDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_BGRA8888toRGB565(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_BGRA8888toRGB888(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: number): number;

declare function vImageConvert_BGRAFFFFtoRGBFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_BGRX8888ToPlanar8(src: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_BGRXFFFFToPlanarF(src: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_ChunkyToPlanar8(srcChannels: interop.Reference<interop.Pointer>, destPlanarBuffers: interop.Reference<interop.Reference<vImage_Buffer>>, channelCount: number, srcStrideBytes: number, srcWidth: number, srcHeight: number, srcRowBytes: number, flags: number): number;

declare function vImageConvert_ChunkyToPlanarF(srcChannels: interop.Reference<interop.Pointer>, destPlanarBuffers: interop.Reference<interop.Reference<vImage_Buffer>>, channelCount: number, srcStrideBytes: number, srcWidth: number, srcHeight: number, srcRowBytes: number, flags: number): number;

declare function vImageConvert_FTo16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, offset: number, scale: number, flags: number): number;

declare function vImageConvert_FTo16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, offset: number, scale: number, flags: number): number;

declare function vImageConvert_Fto16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Indexed1toPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, colors: interop.Reference<number>, flags: number): number;

declare function vImageConvert_Indexed2toPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, colors: interop.Reference<number>, flags: number): number;

declare function vImageConvert_Indexed4toPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, colors: interop.Reference<number>, flags: number): number;

declare function vImageConvert_Planar16FtoPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar16FtoPlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar16Q12toARGB8888(alpha: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar16Q12toRGB888(red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar16UtoARGB16U(aSrc: interop.Reference<vImage_Buffer>, rSrc: interop.Reference<vImage_Buffer>, gSrc: interop.Reference<vImage_Buffer>, bSrc: interop.Reference<vImage_Buffer>, argbDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar16UtoRGB16U(rSrc: interop.Reference<vImage_Buffer>, gSrc: interop.Reference<vImage_Buffer>, bSrc: interop.Reference<vImage_Buffer>, rgbDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar1toPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar2toPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar4toPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar8To16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar8ToARGBFFFF(alpha: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, maxFloat: interop.Reference<number>, minFloat: interop.Reference<number>, flags: number): number;

declare function vImageConvert_Planar8ToBGRX8888(blue: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, alpha: number, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar8ToBGRXFFFF(blue: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, alpha: number, dest: interop.Reference<vImage_Buffer>, maxFloat: interop.Reference<number>, minFloat: interop.Reference<number>, flags: number): number;

declare function vImageConvert_Planar8ToXRGB8888(alpha: number, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar8ToXRGBFFFF(alpha: number, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, maxFloat: interop.Reference<number>, minFloat: interop.Reference<number>, flags: number): number;

declare function vImageConvert_Planar8toARGB1555(srcA: interop.Reference<vImage_Buffer>, srcR: interop.Reference<vImage_Buffer>, srcG: interop.Reference<vImage_Buffer>, srcB: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar8toARGB8888(srcA: interop.Reference<vImage_Buffer>, srcR: interop.Reference<vImage_Buffer>, srcG: interop.Reference<vImage_Buffer>, srcB: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar8toIndexed1(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, colors: interop.Reference<number>, dither: number, flags: number): number;

declare function vImageConvert_Planar8toIndexed2(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, colors: interop.Reference<number>, dither: number, flags: number): number;

declare function vImageConvert_Planar8toIndexed4(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, colors: interop.Reference<number>, dither: number, flags: number): number;

declare function vImageConvert_Planar8toPlanar1(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, dither: number, flags: number): number;

declare function vImageConvert_Planar8toPlanar16F(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar8toPlanar2(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, dither: number, flags: number): number;

declare function vImageConvert_Planar8toPlanar4(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, dither: number, flags: number): number;

declare function vImageConvert_Planar8toPlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, maxFloat: number, minFloat: number, flags: number): number;

declare function vImageConvert_Planar8toRGB565(srcR: interop.Reference<vImage_Buffer>, srcG: interop.Reference<vImage_Buffer>, srcB: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_Planar8toRGB888(planarRed: interop.Reference<vImage_Buffer>, planarGreen: interop.Reference<vImage_Buffer>, planarBlue: interop.Reference<vImage_Buffer>, rgbDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_PlanarFToARGB8888(alpha: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, maxFloat: interop.Reference<number>, minFloat: interop.Reference<number>, flags: number): number;

declare function vImageConvert_PlanarFToBGRX8888(blue: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, alpha: number, dest: interop.Reference<vImage_Buffer>, maxFloat: interop.Reference<number>, minFloat: interop.Reference<number>, flags: number): number;

declare function vImageConvert_PlanarFToBGRXFFFF(blue: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, alpha: number, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_PlanarFToXRGB8888(alpha: number, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, maxFloat: interop.Reference<number>, minFloat: interop.Reference<number>, flags: number): number;

declare function vImageConvert_PlanarFToXRGBFFFF(alpha: number, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_PlanarFtoARGBFFFF(srcA: interop.Reference<vImage_Buffer>, srcR: interop.Reference<vImage_Buffer>, srcG: interop.Reference<vImage_Buffer>, srcB: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_PlanarFtoPlanar16F(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_PlanarFtoPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, maxFloat: number, minFloat: number, flags: number): number;

declare function vImageConvert_PlanarFtoPlanar8_dithered(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, maxFloat: number, minFloat: number, dither: number, flags: number): number;

declare function vImageConvert_PlanarFtoRGBFFF(planarRed: interop.Reference<vImage_Buffer>, planarGreen: interop.Reference<vImage_Buffer>, planarBlue: interop.Reference<vImage_Buffer>, rgbDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_PlanarToChunky8(srcPlanarBuffers: interop.Reference<interop.Reference<vImage_Buffer>>, destChannels: interop.Reference<interop.Pointer>, channelCount: number, destStrideBytes: number, destWidth: number, destHeight: number, destRowBytes: number, flags: number): number;

declare function vImageConvert_PlanarToChunkyF(srcPlanarBuffers: interop.Reference<interop.Reference<vImage_Buffer>>, destChannels: interop.Reference<interop.Pointer>, channelCount: number, destStrideBytes: number, destWidth: number, destHeight: number, destRowBytes: number, flags: number): number;

declare function vImageConvert_RGB16UToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, copyMask: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageConvert_RGB16UtoARGB16U(rgbSrc: interop.Reference<vImage_Buffer>, aSrc: interop.Reference<vImage_Buffer>, alpha: number, argbDest: interop.Reference<vImage_Buffer>, premultiply: boolean, flags: number): number;

declare function vImageConvert_RGB16UtoBGRA16U(rgbSrc: interop.Reference<vImage_Buffer>, aSrc: interop.Reference<vImage_Buffer>, alpha: number, bgraDest: interop.Reference<vImage_Buffer>, premultiply: boolean, flags: number): number;

declare function vImageConvert_RGB16UtoPlanar16U(rgbSrc: interop.Reference<vImage_Buffer>, rDest: interop.Reference<vImage_Buffer>, gDest: interop.Reference<vImage_Buffer>, bDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGB16UtoRGBA16U(rgbSrc: interop.Reference<vImage_Buffer>, aSrc: interop.Reference<vImage_Buffer>, alpha: number, rgbaDest: interop.Reference<vImage_Buffer>, premultiply: boolean, flags: number): number;

declare function vImageConvert_RGB565toARGB1555(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, dither: number, flags: number): number;

declare function vImageConvert_RGB565toARGB8888(alpha: number, src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGB565toBGRA8888(alpha: number, src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGB565toPlanar8(src: interop.Reference<vImage_Buffer>, destR: interop.Reference<vImage_Buffer>, destG: interop.Reference<vImage_Buffer>, destB: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGB565toRGB888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGB565toRGBA5551(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, dither: number, flags: number): number;

declare function vImageConvert_RGB565toRGBA8888(alpha: number, src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGB888toARGB8888(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: number, p4: interop.Reference<vImage_Buffer>, p5: boolean, p6: number): number;

declare function vImageConvert_RGB888toBGRA8888(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: number, p4: interop.Reference<vImage_Buffer>, p5: boolean, p6: number): number;

declare function vImageConvert_RGB888toPlanar16Q12(src: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGB888toPlanar8(rgbSrc: interop.Reference<vImage_Buffer>, redDest: interop.Reference<vImage_Buffer>, greenDest: interop.Reference<vImage_Buffer>, blueDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGB888toRGBA8888(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: number, p4: interop.Reference<vImage_Buffer>, p5: boolean, p6: number): number;

declare function vImageConvert_RGBA1010102ToARGB16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, RGB101010RangeMin: number, RGB101010RangeMax: number, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_RGBA1010102ToARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, RGB101010RangeMin: number, RGB101010RangeMax: number, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_RGBA1010102ToARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, RGB101010RangeMin: number, RGB101010RangeMax: number, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImageConvert_RGBA16UtoRGB16U(rgbaSrc: interop.Reference<vImage_Buffer>, rgbDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGBA5551toRGB565(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGBA8888toRGB565(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGBA8888toRGB888(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: number): number;

declare function vImageConvert_RGBAFFFFtoRGBFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGBFFFtoARGBFFFF(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: number, p4: interop.Reference<vImage_Buffer>, p5: boolean, flags: number): number;

declare function vImageConvert_RGBFFFtoBGRAFFFF(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: number, p4: interop.Reference<vImage_Buffer>, p5: boolean, flags: number): number;

declare function vImageConvert_RGBFFFtoPlanarF(rgbSrc: interop.Reference<vImage_Buffer>, redDest: interop.Reference<vImage_Buffer>, greenDest: interop.Reference<vImage_Buffer>, blueDest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_RGBFFFtoRGB888_dithered(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, maxFloat: interop.Reference<number>, minFloat: interop.Reference<number>, dither: number, flags: number): number;

declare function vImageConvert_RGBFFFtoRGBAFFFF(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: number, p4: interop.Reference<vImage_Buffer>, p5: boolean, flags: number): number;

declare function vImageConvert_XRGB8888ToPlanar8(src: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_XRGBFFFFToPlanarF(src: interop.Reference<vImage_Buffer>, red: interop.Reference<vImage_Buffer>, green: interop.Reference<vImage_Buffer>, blue: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConvert_YpCbCrToARGB_GenerateConversion(matrix: interop.Reference<vImage_YpCbCrToARGBMatrix>, pixelRange: interop.Reference<vImage_YpCbCrPixelRange>, outInfo: interop.Reference<vImage_YpCbCrToARGB>, inYpCbCrType: vImageYpCbCrType, outARGBType: vImageARGBType, flags: number): number;

declare function vImageConverter_CreateForCGToCVImageFormat(srcFormat: interop.Reference<vImage_CGImageFormat>, destFormat: any, backgroundColor: interop.Reference<number>, flags: number, error: interop.Reference<number>): interop.Unmanaged<any>;

declare function vImageConverter_CreateForCVToCGImageFormat(srcFormat: any, destFormat: interop.Reference<vImage_CGImageFormat>, backgroundColor: interop.Reference<number>, flags: number, error: interop.Reference<number>): interop.Unmanaged<any>;

declare function vImageConverter_CreateWithCGImageFormat(srcFormat: interop.Reference<vImage_CGImageFormat>, destFormat: interop.Reference<vImage_CGImageFormat>, backgroundColor: interop.Reference<number>, flags: number, error: interop.Reference<number>): interop.Unmanaged<any>;

declare function vImageConverter_CreateWithColorSyncCodeFragment(codeFragment: any, srcFormat: interop.Reference<vImage_CGImageFormat>, destFormat: interop.Reference<vImage_CGImageFormat>, backgroundColor: interop.Reference<number>, flags: number, error: interop.Reference<number>): interop.Unmanaged<any>;

declare function vImageConverter_GetDestinationBufferOrder(converter: any): interop.Reference<number>;

declare function vImageConverter_GetNumberOfDestinationBuffers(converter: any): number;

declare function vImageConverter_GetNumberOfSourceBuffers(converter: any): number;

declare function vImageConverter_GetSourceBufferOrder(converter: any): interop.Reference<number>;

declare function vImageConverter_MustOperateOutOfPlace(converter: any, srcs: interop.Reference<vImage_Buffer>, dests: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageConverter_Release(converter: any): void;

declare function vImageConverter_Retain(converter: any): void;

declare function vImageConvolveMultiKernel_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernels: interop.Reference<interop.Reference<number>>, kernel_height: number, kernel_width: number, divisors: interop.Reference<number>, biases: interop.Reference<number>, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageConvolveMultiKernel_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernels: interop.Reference<interop.Reference<number>>, kernel_height: number, kernel_width: number, biases: interop.Reference<number>, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageConvolveWithBias_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, divisor: number, bias: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageConvolveWithBias_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, bias: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageConvolveWithBias_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, divisor: number, bias: number, backgroundColor: number, flags: number): number;

declare function vImageConvolveWithBias_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, bias: number, backgroundColor: number, flags: number): number;

declare function vImageConvolve_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, divisor: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageConvolve_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageConvolve_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, divisor: number, backgroundColor: number, flags: number): number;

declare function vImageConvolve_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, backgroundColor: number, flags: number): number;

declare function vImageCopyBuffer(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, pixelSize: number, flags: number): number;

declare function vImageCreateCGImageFromBuffer(buf: interop.Reference<vImage_Buffer>, format: interop.Reference<vImage_CGImageFormat>, callback: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>, userData: interop.Pointer, flags: number, error: interop.Reference<number>): interop.Unmanaged<any>;

declare function vImageCreateGammaFunction(gamma: number, gamma_type: number, flags: number): interop.Pointer;

declare function vImageCreateMonochromeColorSpaceWithWhitePointAndTransferFunction(whitePoint: interop.Reference<vImageWhitePoint>, tf: interop.Reference<vImageTransferFunction>, intent: CGColorRenderingIntent, flags: number, error: interop.Reference<number>): interop.Unmanaged<any>;

declare function vImageCreateRGBColorSpaceWithPrimariesAndTransferFunction(primaries: interop.Reference<vImageRGBPrimaries>, tf: interop.Reference<vImageTransferFunction>, intent: CGColorRenderingIntent, flags: number, error: interop.Reference<number>): interop.Unmanaged<any>;

declare function vImageDestroyGammaFunction(f: interop.Pointer): void;

declare function vImageDestroyResamplingFilter(filter: interop.Pointer): void;

declare function vImageDilate_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: string, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageDilate_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageDilate_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: string, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageDilate_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageEndsInContrastStretch_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, percent_low: interop.Reference<number>, percent_high: interop.Reference<number>, flags: number): number;

declare function vImageEndsInContrastStretch_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, percent_low: interop.Reference<number>, percent_high: interop.Reference<number>, histogram_entries: number, minVal: number, maxVal: number, flags: number): number;

declare function vImageEndsInContrastStretch_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, percent_low: number, percent_high: number, flags: number): number;

declare function vImageEndsInContrastStretch_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, percent_low: number, percent_high: number, histogram_entries: number, minVal: number, maxVal: number, flags: number): number;

declare function vImageEqualization_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageEqualization_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, histogram_entries: number, minVal: number, maxVal: number, flags: number): number;

declare function vImageEqualization_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageEqualization_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, histogram_entries: number, minVal: number, maxVal: number, flags: number): number;

declare function vImageErode_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: string, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageErode_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageErode_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: string, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageErode_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageExtractChannel_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, channelIndex: number, flags: number): number;

declare function vImageExtractChannel_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, channelIndex: number, flags: number): number;

declare function vImageExtractChannel_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, channelIndex: number, flags: number): number;

declare function vImageFlatten_ARGB16Q12(argbSrc: interop.Reference<vImage_Buffer>, argbDst: interop.Reference<vImage_Buffer>, argbBackgroundColorPtr: interop.Reference<number>, isImagePremultiplied: boolean, flags: number): number;

declare function vImageFlatten_ARGB16U(argbSrc: interop.Reference<vImage_Buffer>, argbDst: interop.Reference<vImage_Buffer>, argbBackgroundColorPtr: interop.Reference<number>, isImagePremultiplied: boolean, flags: number): number;

declare function vImageFlatten_ARGB8888(argbSrc: interop.Reference<vImage_Buffer>, argbDst: interop.Reference<vImage_Buffer>, argbBackgroundColorPtr: interop.Reference<number>, isImagePremultiplied: boolean, flags: number): number;

declare function vImageFlatten_ARGB8888ToRGB888(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: interop.Reference<number>, p4: boolean, p5: number): number;

declare function vImageFlatten_ARGBFFFF(argbSrc: interop.Reference<vImage_Buffer>, argbDst: interop.Reference<vImage_Buffer>, argbBackgroundColorPtr: interop.Reference<number>, isImagePremultiplied: boolean, flags: number): number;

declare function vImageFlatten_ARGBFFFFToRGBFFF(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: interop.Reference<number>, p4: boolean, p5: number): number;

declare function vImageFlatten_BGRA8888ToRGB888(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: interop.Reference<number>, p4: boolean, p5: number): number;

declare function vImageFlatten_BGRAFFFFToRGBFFF(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: interop.Reference<number>, p4: boolean, p5: number): number;

declare function vImageFlatten_RGBA16Q12(argbSrc: interop.Reference<vImage_Buffer>, argbDst: interop.Reference<vImage_Buffer>, argbBackgroundColorPtr: interop.Reference<number>, isImagePremultiplied: boolean, flags: number): number;

declare function vImageFlatten_RGBA16U(rgbaSrc: interop.Reference<vImage_Buffer>, rgbaDst: interop.Reference<vImage_Buffer>, rgbaBackgroundColorPtr: interop.Reference<number>, isImagePremultiplied: boolean, flags: number): number;

declare function vImageFlatten_RGBA8888(rgbaSrc: interop.Reference<vImage_Buffer>, rgbaDst: interop.Reference<vImage_Buffer>, rgbaBackgroundColorPtr: interop.Reference<number>, isImagePremultiplied: boolean, flags: number): number;

declare function vImageFlatten_RGBA8888ToRGB888(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: interop.Reference<number>, p4: boolean, p5: number): number;

declare function vImageFlatten_RGBAFFFF(rgbaSrc: interop.Reference<vImage_Buffer>, rgbaDst: interop.Reference<vImage_Buffer>, rgbaBackgroundColorPtr: interop.Reference<number>, isImagePremultiplied: boolean, flags: number): number;

declare function vImageFlatten_RGBAFFFFToRGBFFF(p1: interop.Reference<vImage_Buffer>, p2: interop.Reference<vImage_Buffer>, p3: interop.Reference<number>, p4: boolean, p5: number): number;

declare function vImageGamma_Planar8toPlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, gamma: interop.Pointer, flags: number): number;

declare function vImageGamma_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, gamma: interop.Pointer, flags: number): number;

declare function vImageGamma_PlanarFtoPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, gamma: interop.Pointer, flags: number): number;

declare function vImageGetResamplingFilterExtent(filter: interop.Pointer, flags: number): number;

declare function vImageGetResamplingFilterSize(scale: number, kernelFunc: interop.FunctionReference<(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: number, p4: interop.Pointer) => void>, kernelWidth: number, flags: number): number;

declare function vImageHistogramCalculation_ARGB8888(src: interop.Reference<vImage_Buffer>, histogram: interop.Reference<interop.Reference<number>>, flags: number): number;

declare function vImageHistogramCalculation_ARGBFFFF(src: interop.Reference<vImage_Buffer>, histogram: interop.Reference<interop.Reference<number>>, histogram_entries: number, minVal: number, maxVal: number, flags: number): number;

declare function vImageHistogramCalculation_Planar8(src: interop.Reference<vImage_Buffer>, histogram: interop.Reference<number>, flags: number): number;

declare function vImageHistogramCalculation_PlanarF(src: interop.Reference<vImage_Buffer>, histogram: interop.Reference<number>, histogram_entries: number, minVal: number, maxVal: number, flags: number): number;

declare function vImageHistogramSpecification_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, desired_histogram: interop.Reference<interop.Reference<number>>, flags: number): number;

declare function vImageHistogramSpecification_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, desired_histogram: interop.Reference<interop.Reference<number>>, histogram_entries: number, minVal: number, maxVal: number, flags: number): number;

declare function vImageHistogramSpecification_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, desired_histogram: interop.Reference<number>, flags: number): number;

declare function vImageHistogramSpecification_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, desired_histogram: interop.Reference<number>, histogram_entries: number, minVal: number, maxVal: number, flags: number): number;

declare function vImageHorizontalReflect_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageHorizontalReflect_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageHorizontalReflect_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageHorizontalReflect_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageHorizontalReflect_Planar16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageHorizontalReflect_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageHorizontalReflect_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageHorizontalShearD_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageHorizontalShearD_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageHorizontalShearD_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageHorizontalShearD_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageHorizontalShearD_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageHorizontalShearD_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageHorizontalShear_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageHorizontalShear_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageHorizontalShear_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageHorizontalShear_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageHorizontalShear_Planar16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageHorizontalShear_Planar16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageHorizontalShear_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageHorizontalShear_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, xTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageInterpolatedLookupTable_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, table: interop.Reference<number>, tableEntries: number, maxFloat: number, minFloat: number, flags: number): number;

declare function vImageLookupTable_8to64U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, LUT: interop.Reference<number>, flags: number): number;

declare function vImageLookupTable_Planar8toPlanar16(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, table: interop.Reference<number>, flags: number): number;

declare function vImageLookupTable_Planar8toPlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, table: interop.Reference<number>, flags: number): number;

declare function vImageLookupTable_PlanarFtoPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, table: interop.Reference<number>, flags: number): number;

declare const enum vImageMDTableUsageHint {

	kvImageMDTableHint_16Q12 = 1,

	kvImageMDTableHint_Float = 2
}

declare function vImageMatrixMultiply_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, matrix: interop.Reference<number>, divisor: number, pre_bias: interop.Reference<number>, post_bias: interop.Reference<number>, flags: number): number;

declare function vImageMatrixMultiply_ARGB8888ToPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, matrix: interop.Reference<number>, divisor: number, pre_bias: interop.Reference<number>, post_bias: number, flags: number): number;

declare function vImageMatrixMultiply_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, matrix: interop.Reference<number>, pre_bias: interop.Reference<number>, post_bias: interop.Reference<number>, flags: number): number;

declare function vImageMatrixMultiply_ARGBFFFFToPlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, matrix: interop.Reference<number>, pre_bias: interop.Reference<number>, post_bias: number, flags: number): number;

declare function vImageMatrixMultiply_Planar16S(srcs: interop.Reference<interop.Reference<vImage_Buffer>>, dests: interop.Reference<interop.Reference<vImage_Buffer>>, src_planes: number, dest_planes: number, matrix: interop.Reference<number>, divisor: number, pre_bias: interop.Reference<number>, post_bias: interop.Reference<number>, flags: number): number;

declare function vImageMatrixMultiply_Planar8(srcs: interop.Reference<interop.Reference<vImage_Buffer>>, dests: interop.Reference<interop.Reference<vImage_Buffer>>, src_planes: number, dest_planes: number, matrix: interop.Reference<number>, divisor: number, pre_bias: interop.Reference<number>, post_bias: interop.Reference<number>, flags: number): number;

declare function vImageMatrixMultiply_PlanarF(srcs: interop.Reference<interop.Reference<vImage_Buffer>>, dests: interop.Reference<interop.Reference<vImage_Buffer>>, src_planes: number, dest_planes: number, matrix: interop.Reference<number>, pre_bias: interop.Reference<number>, post_bias: interop.Reference<number>, flags: number): number;

declare function vImageMax_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageMax_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageMax_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageMax_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageMin_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageMin_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageMin_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageMin_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, flags: number): number;

declare function vImageMultiDimensionalInterpolatedLookupTable_Planar16Q12(srcs: interop.Reference<vImage_Buffer>, dests: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, table: interop.Pointer, method: vImage_InterpolationMethod, flags: number): number;

declare function vImageMultiDimensionalInterpolatedLookupTable_PlanarF(srcs: interop.Reference<vImage_Buffer>, dests: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, table: interop.Pointer, method: vImage_InterpolationMethod, flags: number): number;

declare function vImageMultidimensionalTable_Create(tableData: interop.Reference<number>, numSrcChannels: number, numDestChannels: number, table_entries_per_dimension: interop.Reference<number>, hint: vImageMDTableUsageHint, flags: number, err: interop.Reference<number>): interop.Pointer;

declare function vImageMultidimensionalTable_Release(table: interop.Pointer): number;

declare function vImageMultidimensionalTable_Retain(table: interop.Pointer): number;

declare function vImageNewResamplingFilter(scale: number, flags: number): interop.Pointer;

declare function vImageNewResamplingFilterForFunctionUsingBuffer(filter: interop.Pointer, scale: number, kernelFunc: interop.FunctionReference<(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: number, p4: interop.Pointer) => void>, kernelWidth: number, userData: interop.Pointer, flags: number): number;

declare function vImageOverwriteChannelsWithPixel_ARGB16U(the_pixel: interop.Reference<number>, src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, copyMask: number, flags: number): number;

declare function vImageOverwriteChannelsWithPixel_ARGB8888(the_pixel: interop.Reference<number>, src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, copyMask: number, flags: number): number;

declare function vImageOverwriteChannelsWithPixel_ARGBFFFF(the_pixel: interop.Reference<number>, src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, copyMask: number, flags: number): number;

declare function vImageOverwriteChannelsWithScalar_ARGB8888(scalar: number, src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, copyMask: number, flags: number): number;

declare function vImageOverwriteChannelsWithScalar_ARGBFFFF(scalar: number, src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, copyMask: number, flags: number): number;

declare function vImageOverwriteChannelsWithScalar_Planar16S(scalar: number, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageOverwriteChannelsWithScalar_Planar16U(scalar: number, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageOverwriteChannelsWithScalar_Planar8(scalar: number, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageOverwriteChannelsWithScalar_PlanarF(scalar: number, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageOverwriteChannels_ARGB8888(newSrc: interop.Reference<vImage_Buffer>, origSrc: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, copyMask: number, flags: number): number;

declare function vImageOverwriteChannels_ARGBFFFF(newSrc: interop.Reference<vImage_Buffer>, origSrc: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, copyMask: number, flags: number): number;

declare function vImagePNGDecompressionFilter(buffer: interop.Reference<vImage_Buffer>, startScanline: number, scanlineCount: number, bitsPerPixel: number, filterMethodNumber: number, filterType: number, flags: number): number;

declare function vImagePermuteChannelsWithMaskedInsert_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, copyMask: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImagePermuteChannelsWithMaskedInsert_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, copyMask: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImagePermuteChannels_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImagePermuteChannels_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImagePermuteChannels_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImagePermuteChannels_RGB888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, flags: number): number;

declare function vImagePiecewiseGamma_Planar16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, exponentialCoeffs: interop.Reference<number>, gamma: number, linearCoeffs: interop.Reference<number>, boundary: number, flags: number): number;

declare function vImagePiecewiseGamma_Planar16Q12toPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, exponentialCoeffs: interop.Reference<number>, gamma: number, linearCoeffs: interop.Reference<number>, boundary: number, flags: number): number;

declare function vImagePiecewiseGamma_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, exponentialCoeffs: interop.Reference<number>, gamma: number, linearCoeffs: interop.Reference<number>, boundary: number, flags: number): number;

declare function vImagePiecewiseGamma_Planar8toPlanar16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, exponentialCoeffs: interop.Reference<number>, gamma: number, linearCoeffs: interop.Reference<number>, boundary: number, flags: number): number;

declare function vImagePiecewiseGamma_Planar8toPlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, exponentialCoeffs: interop.Reference<number>, gamma: number, linearCoeffs: interop.Reference<number>, boundary: number, flags: number): number;

declare function vImagePiecewiseGamma_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, exponentialCoeffs: interop.Reference<number>, gamma: number, linearCoeffs: interop.Reference<number>, boundary: number, flags: number): number;

declare function vImagePiecewiseGamma_PlanarFtoPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, exponentialCoeffs: interop.Reference<number>, gamma: number, linearCoeffs: interop.Reference<number>, boundary: number, flags: number): number;

declare function vImagePiecewisePolynomial_Planar8toPlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, coefficients: interop.Reference<interop.Reference<number>>, boundaries: interop.Reference<number>, order: number, log2segments: number, flags: number): number;

declare function vImagePiecewisePolynomial_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, coefficients: interop.Reference<interop.Reference<number>>, boundaries: interop.Reference<number>, order: number, log2segments: number, flags: number): number;

declare function vImagePiecewisePolynomial_PlanarFtoPlanar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, coefficients: interop.Reference<interop.Reference<number>>, boundaries: interop.Reference<number>, order: number, log2segments: number, flags: number): number;

declare function vImagePiecewiseRational_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, topCoefficients: interop.Reference<interop.Reference<number>>, bottomCoefficients: interop.Reference<interop.Reference<number>>, boundaries: interop.Reference<number>, topOrder: number, bottomOrder: number, log2segments: number, flags: number): number;

declare function vImagePremultipliedAlphaBlendDarken_RGBA8888(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedAlphaBlendLighten_RGBA8888(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedAlphaBlendMultiply_RGBA8888(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedAlphaBlendScreen_RGBA8888(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedAlphaBlendWithPermute_ARGB8888(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, makeDestAlphaOpaque: boolean, flags: number): number;

declare function vImagePremultipliedAlphaBlendWithPermute_RGBA8888(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, permuteMap: interop.Reference<number>, makeDestAlphaOpaque: boolean, flags: number): number;

declare function vImagePremultipliedAlphaBlend_ARGB8888(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedAlphaBlend_ARGBFFFF(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedAlphaBlend_BGRA8888(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedAlphaBlend_BGRAFFFF(srcTop: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedAlphaBlend_Planar8(srcTop: interop.Reference<vImage_Buffer>, srcTopAlpha: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedAlphaBlend_PlanarF(srcTop: interop.Reference<vImage_Buffer>, srcTopAlpha: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedConstAlphaBlend_ARGB8888(srcTop: interop.Reference<vImage_Buffer>, constAlpha: number, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedConstAlphaBlend_ARGBFFFF(srcTop: interop.Reference<vImage_Buffer>, constAlpha: number, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedConstAlphaBlend_Planar8(srcTop: interop.Reference<vImage_Buffer>, constAlpha: number, srcTopAlpha: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultipliedConstAlphaBlend_PlanarF(srcTop: interop.Reference<vImage_Buffer>, constAlpha: number, srcTopAlpha: interop.Reference<vImage_Buffer>, srcBottom: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultiplyData_ARGB16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultiplyData_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultiplyData_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultiplyData_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultiplyData_Planar8(src: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultiplyData_PlanarF(src: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultiplyData_RGBA16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultiplyData_RGBA16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultiplyData_RGBA8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImagePremultiplyData_RGBAFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

interface vImageRGBPrimaries {
	red_x: number;
	green_x: number;
	blue_x: number;
	white_x: number;
	red_y: number;
	green_y: number;
	blue_y: number;
	white_y: number;
}
declare var vImageRGBPrimaries: interop.StructType<vImageRGBPrimaries>;

declare function vImageRichardsonLucyDeConvolve_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel2: interop.Reference<number>, kernel_height: number, kernel_width: number, kernel_height2: number, kernel_width2: number, divisor: number, divisor2: number, backgroundColor: interop.Reference<number>, iterationCount: number, flags: number): number;

declare function vImageRichardsonLucyDeConvolve_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel2: interop.Reference<number>, kernel_height: number, kernel_width: number, kernel_height2: number, kernel_width2: number, backgroundColor: interop.Reference<number>, iterationCount: number, flags: number): number;

declare function vImageRichardsonLucyDeConvolve_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel2: interop.Reference<number>, kernel_height: number, kernel_width: number, kernel_height2: number, kernel_width2: number, divisor: number, divisor2: number, backgroundColor: number, iterationCount: number, flags: number): number;

declare function vImageRichardsonLucyDeConvolve_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel: interop.Reference<number>, kernel2: interop.Reference<number>, kernel_height: number, kernel_width: number, kernel_height2: number, kernel_width2: number, backgroundColor: number, iterationCount: number, flags: number): number;

declare function vImageRotate90_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, rotationConstant: number, backColor: interop.Reference<number>, flags: number): number;

declare function vImageRotate90_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, rotationConstant: number, backColor: interop.Reference<number>, flags: number): number;

declare function vImageRotate90_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, rotationConstant: number, backColor: interop.Reference<number>, flags: number): number;

declare function vImageRotate90_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, rotationConstant: number, backColor: interop.Reference<number>, flags: number): number;

declare function vImageRotate90_Planar16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, rotationConstant: number, backColor: number, flags: number): number;

declare function vImageRotate90_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, rotationConstant: number, backColor: number, flags: number): number;

declare function vImageRotate90_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, rotationConstant: number, backColor: number, flags: number): number;

declare function vImageRotate_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, angleInRadians: number, backColor: interop.Reference<number>, flags: number): number;

declare function vImageRotate_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, angleInRadians: number, backColor: interop.Reference<number>, flags: number): number;

declare function vImageRotate_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, angleInRadians: number, backColor: interop.Reference<number>, flags: number): number;

declare function vImageRotate_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, angleInRadians: number, backColor: interop.Reference<number>, flags: number): number;

declare function vImageRotate_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, angleInRadians: number, backColor: number, flags: number): number;

declare function vImageRotate_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, angleInRadians: number, backColor: number, flags: number): number;

declare function vImageScale_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, flags: number): number;

declare function vImageScale_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, flags: number): number;

declare function vImageScale_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, flags: number): number;

declare function vImageScale_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, flags: number): number;

declare function vImageScale_Planar16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, flags: number): number;

declare function vImageScale_Planar16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, flags: number): number;

declare function vImageScale_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, flags: number): number;

declare function vImageScale_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, flags: number): number;

declare function vImageSelectChannels_ARGB8888(newSrc: interop.Reference<vImage_Buffer>, origSrc: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, copyMask: number, flags: number): number;

declare function vImageSelectChannels_ARGBFFFF(newSrc: interop.Reference<vImage_Buffer>, origSrc: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, copyMask: number, flags: number): number;

declare function vImageSymmetricPiecewisePolynomial_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, coefficients: interop.Reference<interop.Reference<number>>, boundaries: interop.Reference<number>, order: number, log2segments: number, flags: number): number;

declare function vImageTableLookUp_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, alphaTable: interop.Reference<number>, redTable: interop.Reference<number>, greenTable: interop.Reference<number>, blueTable: interop.Reference<number>, flags: number): number;

declare function vImageTableLookUp_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, table: interop.Reference<number>, flags: number): number;

declare function vImageTentConvolve_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, backgroundColor: interop.Reference<number>, flags: number): number;

declare function vImageTentConvolve_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, tempBuffer: interop.Pointer, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, kernel_height: number, kernel_width: number, backgroundColor: number, flags: number): number;

interface vImageTransferFunction {
	c0: number;
	c1: number;
	c2: number;
	c3: number;
	gamma: number;
	cutoff: number;
	c4: number;
	c5: number;
}
declare var vImageTransferFunction: interop.StructType<vImageTransferFunction>;

declare function vImageUnpremultiplyData_ARGB16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageUnpremultiplyData_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageUnpremultiplyData_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageUnpremultiplyData_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageUnpremultiplyData_Planar8(src: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageUnpremultiplyData_PlanarF(src: interop.Reference<vImage_Buffer>, alpha: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageUnpremultiplyData_RGBA16Q12(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageUnpremultiplyData_RGBA16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageUnpremultiplyData_RGBA8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageUnpremultiplyData_RGBAFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageVerticalReflect_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageVerticalReflect_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageVerticalReflect_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageVerticalReflect_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageVerticalReflect_Planar16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageVerticalReflect_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageVerticalReflect_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, flags: number): number;

declare function vImageVerticalShearD_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageVerticalShearD_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageVerticalShearD_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageVerticalShearD_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageVerticalShearD_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageVerticalShearD_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageVerticalShear_ARGB16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageVerticalShear_ARGB16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageVerticalShear_ARGB8888(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageVerticalShear_ARGBFFFF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: interop.Reference<number>, flags: number): number;

declare function vImageVerticalShear_Planar16S(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageVerticalShear_Planar16U(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageVerticalShear_Planar8(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

declare function vImageVerticalShear_PlanarF(src: interop.Reference<vImage_Buffer>, dest: interop.Reference<vImage_Buffer>, srcOffsetToROI_X: number, srcOffsetToROI_Y: number, yTranslate: number, shearSlope: number, filter: interop.Pointer, backColor: number, flags: number): number;

interface vImageWhitePoint {
	white_x: number;
	white_y: number;
}
declare var vImageWhitePoint: interop.StructType<vImageWhitePoint>;

declare const enum vImageYpCbCrType {

	kvImage422CbYpCrYp8 = 0,

	kvImage422YpCbYpCr8 = 1,

	kvImage422CbYpCrYp8_AA8 = 2,

	kvImage420Yp8_Cb8_Cr8 = 3,

	kvImage420Yp8_CbCr8 = 4,

	kvImage444AYpCbCr8 = 5,

	kvImage444CrYpCb8 = 6,

	kvImage444CbYpCrA8 = 7,

	kvImage444CrYpCb10 = 8,

	kvImage422CrYpCbYpCbYpCbYpCrYpCrYp10 = 9,

	kvImage422CbYpCrYp16 = 13,

	kvImage444AYpCbCr16 = 14
}

interface vImage_ARGBToYpCbCr {
	opaque: interop.Reference<number>;
}
declare var vImage_ARGBToYpCbCr: interop.StructType<vImage_ARGBToYpCbCr>;

interface vImage_ARGBToYpCbCrMatrix {
	R_Yp: number;
	G_Yp: number;
	B_Yp: number;
	R_Cb: number;
	G_Cb: number;
	B_Cb_R_Cr: number;
	G_Cr: number;
	B_Cr: number;
}
declare var vImage_ARGBToYpCbCrMatrix: interop.StructType<vImage_ARGBToYpCbCrMatrix>;

interface vImage_AffineTransform {
	a: number;
	b: number;
	c: number;
	d: number;
	tx: number;
	ty: number;
}
declare var vImage_AffineTransform: interop.StructType<vImage_AffineTransform>;

interface vImage_AffineTransform_Double {
	a: number;
	b: number;
	c: number;
	d: number;
	tx: number;
	ty: number;
}
declare var vImage_AffineTransform_Double: interop.StructType<vImage_AffineTransform_Double>;

interface vImage_Buffer {
	data: interop.Pointer;
	height: number;
	width: number;
	rowBytes: number;
}
declare var vImage_Buffer: interop.StructType<vImage_Buffer>;

interface vImage_CGImageFormat {
	bitsPerComponent: number;
	bitsPerPixel: number;
	colorSpace: any;
	bitmapInfo: CGBitmapInfo;
	version: number;
	decode: interop.Reference<number>;
	renderingIntent: CGColorRenderingIntent;
}
declare var vImage_CGImageFormat: interop.StructType<vImage_CGImageFormat>;

declare const enum vImage_InterpolationMethod {

	kvImageNoInterpolation = 0,

	kvImageFullInterpolation = 1,

	kvImageHalfInterpolation = 2
}

interface vImage_YpCbCrPixelRange {
	Yp_bias: number;
	CbCr_bias: number;
	YpRangeMax: number;
	CbCrRangeMax: number;
	YpMax: number;
	YpMin: number;
	CbCrMax: number;
	CbCrMin: number;
}
declare var vImage_YpCbCrPixelRange: interop.StructType<vImage_YpCbCrPixelRange>;

interface vImage_YpCbCrToARGB {
	opaque: interop.Reference<number>;
}
declare var vImage_YpCbCrToARGB: interop.StructType<vImage_YpCbCrToARGB>;

interface vImage_YpCbCrToARGBMatrix {
	Yp: number;
	Cr_R: number;
	Cr_G: number;
	Cb_G: number;
	Cb_B: number;
}
declare var vImage_YpCbCrToARGBMatrix: interop.StructType<vImage_YpCbCrToARGBMatrix>;

declare function vadd(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vaddD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vam(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __ID: number, __N: number): void;

declare function vamD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __D: interop.Reference<number>, __IDD: number, __N: number): void;

declare function vmul(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vmulD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vsmul(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vsmulD(__A: interop.Reference<number>, __IA: number, __B: interop.Reference<number>, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vsq(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vsqD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vssq(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vssqD(__A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vsub(__B: interop.Reference<number>, __IB: number, __A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vsubD(__B: interop.Reference<number>, __IB: number, __A: interop.Reference<number>, __IA: number, __C: interop.Reference<number>, __IC: number, __N: number): void;

declare function vvacos(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvacosf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvacosh(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvacoshf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvasin(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvasinf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvasinh(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvasinhf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvatan(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvatan2(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvatan2f(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvatanf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvatanh(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvatanhf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvcbrt(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvcbrtf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvceil(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvceilf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvcopysign(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvcopysignf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvcos(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvcosf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvcosh(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvcoshf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvcospi(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvcospif(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvdiv(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvdivf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvexp(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvexp2(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvexp2f(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvexpf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvexpm1(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvexpm1f(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvfabs(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvfabsf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvfloor(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvfloorf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvfmod(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvfmodf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvint(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvintf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvlog(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvlog10(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvlog10f(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvlog1p(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvlog1pf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvlog2(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvlog2f(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvlogb(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvlogbf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvlogf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvnextafter(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvnextafterf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvnint(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvnintf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvpow(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvpowf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvpows(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvpowsf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvrec(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvrecf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvremainder(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvremainderf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvrsqrt(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvrsqrtf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvsin(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvsincos(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvsincosf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>, p4: interop.Reference<number>): void;

declare function vvsinf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvsinh(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvsinhf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvsinpi(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvsinpif(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvsqrt(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvsqrtf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvtan(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvtanf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvtanh(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvtanhf(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvtanpi(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function vvtanpif(p1: interop.Reference<number>, p2: interop.Reference<number>, p3: interop.Reference<number>): void;

declare function zbdsqr_(__uplo: string, __n: interop.Reference<number>, __ncvt: interop.Reference<number>, __nru: interop.Reference<number>, __ncc: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vt: interop.Reference<__CLPK_doublecomplex>, __ldvt: interop.Reference<number>, __u: interop.Reference<__CLPK_doublecomplex>, __ldu: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zcgesv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __swork: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __iter: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zconv(__A: interop.Reference<DSPSplitComplex>, __IA: number, __F: interop.Reference<DSPSplitComplex>, __IF: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number, __P: number): void;

declare function zconvD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __F: interop.Reference<DSPDoubleSplitComplex>, __IF: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number, __P: number): void;

declare function zcposv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __swork: interop.Reference<__CLPK_complex>, __rwork: interop.Reference<number>, __iter: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zdotpr(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __N: number): void;

declare function zdotprD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __N: number): void;

declare function zdrscl_(__n: interop.Reference<number>, __sa: interop.Reference<number>, __sx: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>): number;

declare function zgbbrd_(__vect: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ncc: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __pt: interop.Reference<__CLPK_doublecomplex>, __ldpt: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgbcon_(__norm: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgbequ_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgbequb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgbrfs_(__trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __afb: interop.Reference<__CLPK_doublecomplex>, __ldafb: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgbsv_(__n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgbsvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __afb: interop.Reference<__CLPK_doublecomplex>, __ldafb: interop.Reference<number>, __ipiv: interop.Reference<number>, __equed: string, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgbtf2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgbtrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgbtrs_(__trans: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgebak_(__job: string, __side: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __m: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgebal_(__job: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgebd2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<__CLPK_doublecomplex>, __taup: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zgebrd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<__CLPK_doublecomplex>, __taup: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgecon_(__norm: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgeequ_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgeequb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgees_(__jobvs: string, __sort: string, __select: interop.FunctionReference<() => number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __sdim: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __vs: interop.Reference<__CLPK_doublecomplex>, __ldvs: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgeesx_(__jobvs: string, __sort: string, __select: interop.FunctionReference<() => number>, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __sdim: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __vs: interop.Reference<__CLPK_doublecomplex>, __ldvs: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgeev_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __vl: interop.Reference<__CLPK_doublecomplex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_doublecomplex>, __ldvr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgeevx_(__balanc: string, __jobvl: string, __jobvr: string, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __vl: interop.Reference<__CLPK_doublecomplex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_doublecomplex>, __ldvr: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __scale: interop.Reference<number>, __abnrm: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgegs_(__jobvsl: string, __jobvsr: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __beta: interop.Reference<__CLPK_doublecomplex>, __vsl: interop.Reference<__CLPK_doublecomplex>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<__CLPK_doublecomplex>, __ldvsr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgegv_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __beta: interop.Reference<__CLPK_doublecomplex>, __vl: interop.Reference<__CLPK_doublecomplex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_doublecomplex>, __ldvr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgehd2_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zgehrd_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgelq2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zgelqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgels_(__trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgelsd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __s: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgelss_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __s: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgelsx_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __jpvt: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgelsy_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __jpvt: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgeql2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zgeqlf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgeqp3_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgeqpf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgeqr2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zgeqrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgerfs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_doublecomplex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgerq2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zgerqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgesc2_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __rhs: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>, __scale: interop.Reference<number>): number;

declare function zgesdd_(__jobz: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __u: interop.Reference<__CLPK_doublecomplex>, __ldu: interop.Reference<number>, __vt: interop.Reference<__CLPK_doublecomplex>, __ldvt: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgesv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgesvd_(__jobu: string, __jobvt: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __u: interop.Reference<__CLPK_doublecomplex>, __ldu: interop.Reference<number>, __vt: interop.Reference<__CLPK_doublecomplex>, __ldvt: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgesvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_doublecomplex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __equed: string, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgetc2_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgetf2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgetrf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgetri_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgetrs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zggbak_(__job: string, __side: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __m: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zggbal_(__job: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgges_(__jobvsl: string, __jobvsr: string, __sort: string, __selctg: interop.FunctionReference<() => number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __sdim: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __beta: interop.Reference<__CLPK_doublecomplex>, __vsl: interop.Reference<__CLPK_doublecomplex>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<__CLPK_doublecomplex>, __ldvsr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zggesx_(__jobvsl: string, __jobvsr: string, __sort: string, __selctg: interop.FunctionReference<() => number>, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __sdim: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __beta: interop.Reference<__CLPK_doublecomplex>, __vsl: interop.Reference<__CLPK_doublecomplex>, __ldvsl: interop.Reference<number>, __vsr: interop.Reference<__CLPK_doublecomplex>, __ldvsr: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zggev_(__jobvl: string, __jobvr: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __beta: interop.Reference<__CLPK_doublecomplex>, __vl: interop.Reference<__CLPK_doublecomplex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_doublecomplex>, __ldvr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zggevx_(__balanc: string, __jobvl: string, __jobvr: string, __sense: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __beta: interop.Reference<__CLPK_doublecomplex>, __vl: interop.Reference<__CLPK_doublecomplex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_doublecomplex>, __ldvr: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __lscale: interop.Reference<number>, __rscale: interop.Reference<number>, __abnrm: interop.Reference<number>, __bbnrm: interop.Reference<number>, __rconde: interop.Reference<number>, __rcondv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __bwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zggglm_(__n: interop.Reference<number>, __m: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __d__: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __y: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgghrd_(__compq: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgglse_(__m: interop.Reference<number>, __n: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zggqrf_(__n: interop.Reference<number>, __m: interop.Reference<number>, __p: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __taua: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __taub: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zggrqf_(__m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __taua: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __taub: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zggsvd_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __p: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<__CLPK_doublecomplex>, __ldu: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zggsvp_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __tola: interop.Reference<number>, __tolb: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __u: interop.Reference<__CLPK_doublecomplex>, __ldu: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __iwork: interop.Reference<number>, __rwork: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zgtcon_(__norm: string, __n: interop.Reference<number>, __dl: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<__CLPK_doublecomplex>, __du: interop.Reference<__CLPK_doublecomplex>, __du2: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zgtrfs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<__CLPK_doublecomplex>, __du: interop.Reference<__CLPK_doublecomplex>, __dlf: interop.Reference<__CLPK_doublecomplex>, __df: interop.Reference<__CLPK_doublecomplex>, __duf: interop.Reference<__CLPK_doublecomplex>, __du2: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgtsv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<__CLPK_doublecomplex>, __du: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgtsvx_(__fact: string, __trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<__CLPK_doublecomplex>, __du: interop.Reference<__CLPK_doublecomplex>, __dlf: interop.Reference<__CLPK_doublecomplex>, __df: interop.Reference<__CLPK_doublecomplex>, __duf: interop.Reference<__CLPK_doublecomplex>, __du2: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgttrf_(__n: interop.Reference<number>, __dl: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<__CLPK_doublecomplex>, __du: interop.Reference<__CLPK_doublecomplex>, __du2: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgttrs_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<__CLPK_doublecomplex>, __du: interop.Reference<__CLPK_doublecomplex>, __du2: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zgtts2_(__itrans: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __dl: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<__CLPK_doublecomplex>, __du: interop.Reference<__CLPK_doublecomplex>, __du2: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>): number;

declare function zhbev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhbevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhbevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhbgst_(__vect: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __bb: interop.Reference<__CLPK_doublecomplex>, __ldbb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhbgv_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __bb: interop.Reference<__CLPK_doublecomplex>, __ldbb: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhbgvd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __bb: interop.Reference<__CLPK_doublecomplex>, __ldbb: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhbgvx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ka: interop.Reference<number>, __kb: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __bb: interop.Reference<__CLPK_doublecomplex>, __ldbb: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhbtrd_(__vect: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zhecon_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zheequb_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zheev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zheevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zheevr_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zheevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhegs2_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhegst_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhegv_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhegvd_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __w: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhegvx_(__itype: interop.Reference<number>, __jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zherfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_doublecomplex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhesv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhesvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_doublecomplex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhetd2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zhetf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhetrd_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhetrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhetri_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zhetrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhfrk_(__transr: string, __uplo: string, __trans: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __alpha: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __beta: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>): number;

declare function zhgeqz_(__job: string, __compq: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __beta: interop.Reference<__CLPK_doublecomplex>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhpcon_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zhpev_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhpevd_(__jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhpevx_(__jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhpgst_(__itype: interop.Reference<number>, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __bp: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zhpgv_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __bp: interop.Reference<__CLPK_doublecomplex>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhpgvd_(__itype: interop.Reference<number>, __jobz: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __bp: interop.Reference<__CLPK_doublecomplex>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhpgvx_(__itype: interop.Reference<number>, __jobz: string, __range: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __bp: interop.Reference<__CLPK_doublecomplex>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhprfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __afp: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhpsv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhpsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __afp: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhptrd_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zhptrf_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhptri_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zhptrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhsein_(__side: string, __eigsrc: string, __initv: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __vl: interop.Reference<__CLPK_doublecomplex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_doublecomplex>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __ifaill: interop.Reference<number>, __ifailr: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zhseqr_(__job: string, __compz: string, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zidotpr(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __N: number): void;

declare function zidotprD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __N: number): void;

declare function zlabrd_(__m: interop.Reference<number>, __n: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __tauq: interop.Reference<__CLPK_doublecomplex>, __taup: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __y: interop.Reference<__CLPK_doublecomplex>, __ldy: interop.Reference<number>): number;

declare function zlacgv_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>): number;

declare function zlacn2_(__n: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __est: interop.Reference<number>, __kase: interop.Reference<number>, __isave: interop.Reference<number>): number;

declare function zlacon_(__n: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __est: interop.Reference<number>, __kase: interop.Reference<number>): number;

declare function zlacp2_(__uplo: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>): number;

declare function zlacpy_(__uplo: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>): number;

declare function zlacrm_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<number>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __rwork: interop.Reference<number>): number;

declare function zlacrt_(__n: interop.Reference<number>, __cx: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __cy: interop.Reference<__CLPK_doublecomplex>, __incy: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __s: interop.Reference<__CLPK_doublecomplex>): number;

declare function zladiv_(__ret_val: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __y: interop.Reference<__CLPK_doublecomplex>): void;

declare function zlaed0_(__qsiz: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __qstore: interop.Reference<__CLPK_doublecomplex>, __ldqs: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlaed7_(__n: interop.Reference<number>, __cutpnt: interop.Reference<number>, __qsiz: interop.Reference<number>, __tlvls: interop.Reference<number>, __curlvl: interop.Reference<number>, __curpbm: interop.Reference<number>, __d__: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __rho: interop.Reference<number>, __indxq: interop.Reference<number>, __qstore: interop.Reference<number>, __qptr: interop.Reference<number>, __prmptr: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __givnum: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlaed8_(__k: interop.Reference<number>, __n: interop.Reference<number>, __qsiz: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __d__: interop.Reference<number>, __rho: interop.Reference<number>, __cutpnt: interop.Reference<number>, __z__: interop.Reference<number>, __dlamda: interop.Reference<number>, __q2: interop.Reference<__CLPK_doublecomplex>, __ldq2: interop.Reference<number>, __w: interop.Reference<number>, __indxp: interop.Reference<number>, __indx: interop.Reference<number>, __indxq: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __givnum: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlaein_(__rightv: interop.Reference<number>, __noinit: interop.Reference<number>, __n: interop.Reference<number>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __v: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __rwork: interop.Reference<number>, __eps3: interop.Reference<number>, __smlnum: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlaesy_(__a: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __rt1: interop.Reference<__CLPK_doublecomplex>, __rt2: interop.Reference<__CLPK_doublecomplex>, __evscal: interop.Reference<__CLPK_doublecomplex>, __cs1: interop.Reference<__CLPK_doublecomplex>, __sn1: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlaev2_(__a: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __rt1: interop.Reference<number>, __rt2: interop.Reference<number>, __cs1: interop.Reference<number>, __sn1: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlag2c_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __sa: interop.Reference<__CLPK_complex>, __ldsa: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlags2_(__upper: interop.Reference<number>, __a1: interop.Reference<number>, __a2: interop.Reference<__CLPK_doublecomplex>, __a3: interop.Reference<number>, __b1: interop.Reference<number>, __b2: interop.Reference<__CLPK_doublecomplex>, __b3: interop.Reference<number>, __csu: interop.Reference<number>, __snu: interop.Reference<__CLPK_doublecomplex>, __csv: interop.Reference<number>, __snv: interop.Reference<__CLPK_doublecomplex>, __csq: interop.Reference<number>, __snq: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlagtm_(__trans: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __alpha: interop.Reference<number>, __dl: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<__CLPK_doublecomplex>, __du: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __beta: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>): number;

declare function zlahef_(__uplo: string, __n: interop.Reference<number>, __nb: interop.Reference<number>, __kb: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __ldw: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlahqr_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlahr2_(__n: interop.Reference<number>, __k: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __y: interop.Reference<__CLPK_doublecomplex>, __ldy: interop.Reference<number>): number;

declare function zlahrd_(__n: interop.Reference<number>, __k: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __y: interop.Reference<__CLPK_doublecomplex>, __ldy: interop.Reference<number>): number;

declare function zlaic1_(__job: interop.Reference<number>, __j: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __sest: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __gamma: interop.Reference<__CLPK_doublecomplex>, __sestpr: interop.Reference<number>, __s: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlals0_(__icompq: interop.Reference<number>, __nl: interop.Reference<number>, __nr: interop.Reference<number>, __sqre: interop.Reference<number>, __nrhs: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __bx: interop.Reference<__CLPK_doublecomplex>, __ldbx: interop.Reference<number>, __perm: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __givnum: interop.Reference<number>, __ldgnum: interop.Reference<number>, __poles: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __k: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlalsa_(__icompq: interop.Reference<number>, __smlsiz: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __bx: interop.Reference<__CLPK_doublecomplex>, __ldbx: interop.Reference<number>, __u: interop.Reference<number>, __ldu: interop.Reference<number>, __vt: interop.Reference<number>, __k: interop.Reference<number>, __difl: interop.Reference<number>, __difr: interop.Reference<number>, __z__: interop.Reference<number>, __poles: interop.Reference<number>, __givptr: interop.Reference<number>, __givcol: interop.Reference<number>, __ldgcol: interop.Reference<number>, __perm: interop.Reference<number>, __givnum: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlalsd_(__uplo: string, __smlsiz: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __rcond: interop.Reference<number>, __rank: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlangb_(__norm: string, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function zlange_(__norm: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function zlangt_(__norm: string, __n: interop.Reference<number>, __dl: interop.Reference<__CLPK_doublecomplex>, __d__: interop.Reference<__CLPK_doublecomplex>, __du: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlanhb_(__norm: string, __uplo: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function zlanhe_(__norm: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function zlanhf_(__norm: string, __transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<number>): number;

declare function zlanhp_(__norm: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<number>): number;

declare function zlanhs_(__norm: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function zlanht_(__norm: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlansb_(__norm: string, __uplo: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function zlansp_(__norm: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<number>): number;

declare function zlansy_(__norm: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function zlantb_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function zlantp_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<number>): number;

declare function zlantr_(__norm: string, __uplo: string, __diag: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function zlapll_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __y: interop.Reference<__CLPK_doublecomplex>, __incy: interop.Reference<number>, __ssmin: interop.Reference<number>): number;

declare function zlapmt_(__forwrd: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __k: interop.Reference<number>): number;

declare function zlaqgb_(__m: interop.Reference<number>, __n: interop.Reference<number>, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function zlaqge_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __r__: interop.Reference<number>, __c__: interop.Reference<number>, __rowcnd: interop.Reference<number>, __colcnd: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function zlaqhb_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function zlaqhe_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function zlaqhp_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function zlaqp2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __offset: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __vn1: interop.Reference<number>, __vn2: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlaqps_(__m: interop.Reference<number>, __n: interop.Reference<number>, __offset: interop.Reference<number>, __nb: interop.Reference<number>, __kb: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __jpvt: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __vn1: interop.Reference<number>, __vn2: interop.Reference<number>, __auxv: interop.Reference<__CLPK_doublecomplex>, __f: interop.Reference<__CLPK_doublecomplex>, __ldf: interop.Reference<number>): number;

declare function zlaqr0_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlaqr1_(__n: interop.Reference<number>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __s1: interop.Reference<__CLPK_doublecomplex>, __s2: interop.Reference<__CLPK_doublecomplex>, __v: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlaqr2_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nw: interop.Reference<number>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __ns: interop.Reference<number>, __nd: interop.Reference<number>, __sh: interop.Reference<__CLPK_doublecomplex>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __nh: interop.Reference<number>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<__CLPK_doublecomplex>, __ldwv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>): number;

declare function zlaqr3_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nw: interop.Reference<number>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __ns: interop.Reference<number>, __nd: interop.Reference<number>, __sh: interop.Reference<__CLPK_doublecomplex>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __nh: interop.Reference<number>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<__CLPK_doublecomplex>, __ldwv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>): number;

declare function zlaqr4_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlaqr5_(__wantt: interop.Reference<number>, __wantz: interop.Reference<number>, __kacc22: interop.Reference<number>, __n: interop.Reference<number>, __ktop: interop.Reference<number>, __kbot: interop.Reference<number>, __nshfts: interop.Reference<number>, __s: interop.Reference<__CLPK_doublecomplex>, __h__: interop.Reference<__CLPK_doublecomplex>, __ldh: interop.Reference<number>, __iloz: interop.Reference<number>, __ihiz: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __u: interop.Reference<__CLPK_doublecomplex>, __ldu: interop.Reference<number>, __nv: interop.Reference<number>, __wv: interop.Reference<__CLPK_doublecomplex>, __ldwv: interop.Reference<number>, __nh: interop.Reference<number>, __wh: interop.Reference<__CLPK_doublecomplex>, __ldwh: interop.Reference<number>): number;

declare function zlaqsb_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function zlaqsp_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function zlaqsy_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __equed: string): number;

declare function zlar1v_(__n: interop.Reference<number>, __b1: interop.Reference<number>, __bn: interop.Reference<number>, __lambda: interop.Reference<number>, __d__: interop.Reference<number>, __l: interop.Reference<number>, __ld: interop.Reference<number>, __lld: interop.Reference<number>, __pivmin: interop.Reference<number>, __gaptol: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __wantnc: interop.Reference<number>, __negcnt: interop.Reference<number>, __ztz: interop.Reference<number>, __mingma: interop.Reference<number>, __r__: interop.Reference<number>, __isuppz: interop.Reference<number>, __nrminv: interop.Reference<number>, __resid: interop.Reference<number>, __rqcorr: interop.Reference<number>, __work: interop.Reference<number>): number;

declare function zlar2v_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __y: interop.Reference<__CLPK_doublecomplex>, __z__: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<__CLPK_doublecomplex>, __incc: interop.Reference<number>): number;

declare function zlarcm_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<number>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __rwork: interop.Reference<number>): number;

declare function zlarf_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __incv: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlarfb_(__side: string, __trans: string, __direct: string, __storev: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __ldwork: interop.Reference<number>): number;

declare function zlarfg_(__n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlarfp_(__n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlarft_(__direct: string, __storev: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>): number;

declare function zlarfx_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlargv_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __y: interop.Reference<__CLPK_doublecomplex>, __incy: interop.Reference<number>, __c__: interop.Reference<number>, __incc: interop.Reference<number>): number;

declare function zlarnv_(__idist: interop.Reference<number>, __iseed: interop.Reference<number>, __n: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlarrv_(__n: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __d__: interop.Reference<number>, __l: interop.Reference<number>, __pivmin: interop.Reference<number>, __isplit: interop.Reference<number>, __m: interop.Reference<number>, __dol: interop.Reference<number>, __dou: interop.Reference<number>, __minrgp: interop.Reference<number>, __rtol1: interop.Reference<number>, __rtol2: interop.Reference<number>, __w: interop.Reference<number>, __werr: interop.Reference<number>, __wgap: interop.Reference<number>, __iblock: interop.Reference<number>, __indexw: interop.Reference<number>, __gers: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlarscl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>): number;

declare function zlartg_(__f: interop.Reference<__CLPK_doublecomplex>, __g: interop.Reference<__CLPK_doublecomplex>, __cs: interop.Reference<number>, __sn: interop.Reference<__CLPK_doublecomplex>, __r__: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlartv_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __y: interop.Reference<__CLPK_doublecomplex>, __incy: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<__CLPK_doublecomplex>, __incc: interop.Reference<number>): number;

declare function zlarz_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __l: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __incv: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlarzb_(__side: string, __trans: string, __direct: string, __storev: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __ldwork: interop.Reference<number>): number;

declare function zlarzt_(__direct: string, __storev: string, __n: interop.Reference<number>, __k: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>): number;

declare function zlascl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __d__: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>): number;

declare function zlascl_(__type__: string, __kl: interop.Reference<number>, __ku: interop.Reference<number>, __cfrom: interop.Reference<number>, __cto: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlaset_(__uplo: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __beta: interop.Reference<__CLPK_doublecomplex>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>): number;

declare function zlasr_(__side: string, __pivot: string, __direct: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>): number;

declare function zlassq_(__n: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __scale: interop.Reference<number>, __sumsq: interop.Reference<number>): number;

declare function zlaswp_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __k1: interop.Reference<number>, __k2: interop.Reference<number>, __ipiv: interop.Reference<number>, __incx: interop.Reference<number>): number;

declare function zlasyf_(__uplo: string, __n: interop.Reference<number>, __nb: interop.Reference<number>, __kb: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __ldw: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlat2c_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __sa: interop.Reference<__CLPK_complex>, __ldsa: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlatbs_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlatdf_(__ijob: interop.Reference<number>, __n: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __rhs: interop.Reference<__CLPK_doublecomplex>, __rdsum: interop.Reference<number>, __rdscal: interop.Reference<number>, __ipiv: interop.Reference<number>, __jpiv: interop.Reference<number>): number;

declare function zlatps_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlatrd_(__uplo: string, __n: interop.Reference<number>, __nb: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __e: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __w: interop.Reference<__CLPK_doublecomplex>, __ldw: interop.Reference<number>): number;

declare function zlatrs_(__uplo: string, __trans: string, __diag: string, __normin: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __scale: interop.Reference<number>, __cnorm: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlatrz_(__m: interop.Reference<number>, __n: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlatzm_(__side: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __incv: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c1: interop.Reference<__CLPK_doublecomplex>, __c2: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>): number;

declare function zlauu2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zlauum_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zmma(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function zmmaD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function zmms(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function zmmsD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function zmmul(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __M: number, __N: number, __P: number): void;

declare function zmmulD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __M: number, __N: number, __P: number): void;

declare function zmsm(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function zmsmD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __M: number, __N: number, __P: number): void;

declare function zpbcon_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpbequ_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpbrfs_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __afb: interop.Reference<__CLPK_doublecomplex>, __ldafb: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpbstf_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpbsv_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpbsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __afb: interop.Reference<__CLPK_doublecomplex>, __ldafb: interop.Reference<number>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpbtf2_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpbtrf_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpbtrs_(__uplo: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpftrf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zpftri_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zpftrs_(__transr: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpocon_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpoequ_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpoequb_(__n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zporfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_doublecomplex>, __ldaf: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zposv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zposvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_doublecomplex>, __ldaf: interop.Reference<number>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpotf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpotrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpotri_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpotrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zppcon_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zppequ_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpprfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __afp: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zppsv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zppsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __afp: interop.Reference<__CLPK_doublecomplex>, __equed: string, __s: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpptrf_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zpptri_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zpptrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpstf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __piv: interop.Reference<number>, __rank: interop.Reference<number>, __tol: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpstrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __piv: interop.Reference<number>, __rank: interop.Reference<number>, __tol: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zptcon_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_doublecomplex>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpteqr_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zptrfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_doublecomplex>, __df: interop.Reference<number>, __ef: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zptsv_(__n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zptsvx_(__fact: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_doublecomplex>, __df: interop.Reference<number>, __ef: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zpttrf_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zpttrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zptts2_(__iuplo: interop.Reference<number>, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>): number;

declare function zrdotpr(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __N: number): void;

declare function zrdotprD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __N: number): void;

declare function zrot_(__n: interop.Reference<number>, __cx: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __cy: interop.Reference<__CLPK_doublecomplex>, __incy: interop.Reference<number>, __c__: interop.Reference<number>, __s: interop.Reference<__CLPK_doublecomplex>): number;

declare function zrvadd(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function zrvaddD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function zrvmul(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function zrvmulD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function zrvsub(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function zrvsubD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<number>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function zspcon_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zspmv_(__uplo: string, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __ap: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __beta: interop.Reference<__CLPK_doublecomplex>, __y: interop.Reference<__CLPK_doublecomplex>, __incy: interop.Reference<number>): number;

declare function zspr_(__uplo: string, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>): number;

declare function zsprfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __afp: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zspsv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zspsvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __afp: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zsptrf_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zsptri_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zsptrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zstedc_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __lrwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zstegr_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __abstol: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __isuppz: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zstein_(__n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __iblock: interop.Reference<number>, __isplit: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __iwork: interop.Reference<number>, __ifail: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zstemr_(__jobz: string, __range: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __vl: interop.Reference<number>, __vu: interop.Reference<number>, __il: interop.Reference<number>, __iu: interop.Reference<number>, __m: interop.Reference<number>, __w: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __nzc: interop.Reference<number>, __isuppz: interop.Reference<number>, __tryrac: interop.Reference<number>, __work: interop.Reference<number>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zsteqr_(__compz: string, __n: interop.Reference<number>, __d__: interop.Reference<number>, __e: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __work: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zsycon_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __anorm: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zsyequb_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __s: interop.Reference<number>, __scond: interop.Reference<number>, __amax: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zsymv_(__uplo: string, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __beta: interop.Reference<__CLPK_doublecomplex>, __y: interop.Reference<__CLPK_doublecomplex>, __incy: interop.Reference<number>): number;

declare function zsyr_(__uplo: string, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __x: interop.Reference<__CLPK_doublecomplex>, __incx: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>): number;

declare function zsyrfs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_doublecomplex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zsysv_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zsysvx_(__fact: string, __uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __af: interop.Reference<__CLPK_doublecomplex>, __ldaf: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __rcond: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zsytf2_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zsytrf_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zsytri_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zsytrs_(__uplo: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ipiv: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztbcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztbrfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztbtrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __kd: interop.Reference<number>, __nrhs: interop.Reference<number>, __ab: interop.Reference<__CLPK_doublecomplex>, __ldab: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztfsm_(__transr: string, __side: string, __uplo: string, __trans: string, __diag: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __a: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>): number;

declare function ztftri_(__transr: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function ztfttp_(__transr: string, __uplo: string, __n: interop.Reference<number>, __arf: interop.Reference<__CLPK_doublecomplex>, __ap: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function ztfttr_(__transr: string, __uplo: string, __n: interop.Reference<number>, __arf: interop.Reference<__CLPK_doublecomplex>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztgevc_(__side: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __s: interop.Reference<__CLPK_doublecomplex>, __lds: interop.Reference<number>, __p: interop.Reference<__CLPK_doublecomplex>, __ldp: interop.Reference<number>, __vl: interop.Reference<__CLPK_doublecomplex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_doublecomplex>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztgex2_(__wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __j1: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztgexc_(__wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __ifst: interop.Reference<number>, __ilst: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztgsen_(__ijob: interop.Reference<number>, __wantq: interop.Reference<number>, __wantz: interop.Reference<number>, __select: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __alpha: interop.Reference<__CLPK_doublecomplex>, __beta: interop.Reference<__CLPK_doublecomplex>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __z__: interop.Reference<__CLPK_doublecomplex>, __ldz: interop.Reference<number>, __m: interop.Reference<number>, __pl: interop.Reference<number>, __pr: interop.Reference<number>, __dif: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __liwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztgsja_(__jobu: string, __jobv: string, __jobq: string, __m: interop.Reference<number>, __p: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __tola: interop.Reference<number>, __tolb: interop.Reference<number>, __alpha: interop.Reference<number>, __beta: interop.Reference<number>, __u: interop.Reference<__CLPK_doublecomplex>, __ldu: interop.Reference<number>, __v: interop.Reference<__CLPK_doublecomplex>, __ldv: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __ncycle: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztgsna_(__job: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __vl: interop.Reference<__CLPK_doublecomplex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_doublecomplex>, __ldvr: interop.Reference<number>, __s: interop.Reference<number>, __dif: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztgsy2_(__trans: string, __ijob: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __d__: interop.Reference<__CLPK_doublecomplex>, __ldd: interop.Reference<number>, __e: interop.Reference<__CLPK_doublecomplex>, __lde: interop.Reference<number>, __f: interop.Reference<__CLPK_doublecomplex>, __ldf: interop.Reference<number>, __scale: interop.Reference<number>, __rdsum: interop.Reference<number>, __rdscal: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztgsyl_(__trans: string, __ijob: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __d__: interop.Reference<__CLPK_doublecomplex>, __ldd: interop.Reference<number>, __e: interop.Reference<__CLPK_doublecomplex>, __lde: interop.Reference<number>, __f: interop.Reference<__CLPK_doublecomplex>, __ldf: interop.Reference<number>, __scale: interop.Reference<number>, __dif: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __iwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztoc(__Z: interop.Reference<DSPSplitComplex>, __IZ: number, __C: interop.Reference<DSPComplex>, __IC: number, __N: number): void;

declare function ztocD(__Z: interop.Reference<DSPDoubleSplitComplex>, __IZ: number, __C: interop.Reference<DSPDoubleComplex>, __IC: number, __N: number): void;

declare function ztpcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztprfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztptri_(__uplo: string, __diag: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function ztptrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztpttf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __arf: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function ztpttr_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrcon_(__norm: string, __uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __rcond: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrevc_(__side: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __vl: interop.Reference<__CLPK_doublecomplex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_doublecomplex>, __ldvr: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrexc_(__compq: string, __n: interop.Reference<number>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __ifst: interop.Reference<number>, __ilst: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrrfs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __x: interop.Reference<__CLPK_doublecomplex>, __ldx: interop.Reference<number>, __ferr: interop.Reference<number>, __berr: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrsen_(__job: string, __compq: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __w: interop.Reference<__CLPK_doublecomplex>, __m: interop.Reference<number>, __s: interop.Reference<number>, __sep: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrsna_(__job: string, __howmny: string, __select: interop.Reference<number>, __n: interop.Reference<number>, __t: interop.Reference<__CLPK_doublecomplex>, __ldt: interop.Reference<number>, __vl: interop.Reference<__CLPK_doublecomplex>, __ldvl: interop.Reference<number>, __vr: interop.Reference<__CLPK_doublecomplex>, __ldvr: interop.Reference<number>, __s: interop.Reference<number>, __sep: interop.Reference<number>, __mm: interop.Reference<number>, __m: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __ldwork: interop.Reference<number>, __rwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrsyl_(__trana: string, __tranb: string, __isgn: interop.Reference<number>, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __scale: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrti2_(__uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrtri_(__uplo: string, __diag: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrtrs_(__uplo: string, __trans: string, __diag: string, __n: interop.Reference<number>, __nrhs: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __b: interop.Reference<__CLPK_doublecomplex>, __ldb: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function ztrttf_(__transr: string, __uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __arf: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function ztrttp_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function ztzrqf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function ztzrzf_(__m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zung2l_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zung2r_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zungbr_(__vect: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zunghr_(__n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zungl2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zunglq_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zungql_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zungqr_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zungr2_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zungrq_(__m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zungtr_(__uplo: string, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zunm2l_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zunm2r_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zunmbr_(__vect: string, __side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zunmhr_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ilo: interop.Reference<number>, __ihi: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zunml2_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zunmlq_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zunmql_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zunmqr_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zunmr2_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zunmr3_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zunmrq_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zunmrz_(__side: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __k: interop.Reference<number>, __l: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zunmtr_(__side: string, __uplo: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __a: interop.Reference<__CLPK_doublecomplex>, __lda: interop.Reference<number>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __lwork: interop.Reference<number>, __info: interop.Reference<number>): number;

declare function zupgtr_(__uplo: string, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __tau: interop.Reference<__CLPK_doublecomplex>, __q: interop.Reference<__CLPK_doublecomplex>, __ldq: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zupmtr_(__side: string, __uplo: string, __trans: string, __m: interop.Reference<number>, __n: interop.Reference<number>, __ap: interop.Reference<__CLPK_doublecomplex>, __tau: interop.Reference<__CLPK_doublecomplex>, __c__: interop.Reference<__CLPK_doublecomplex>, __ldc: interop.Reference<number>, __work: interop.Reference<__CLPK_doublecomplex>, __info: interop.Reference<number>): number;

declare function zvadd(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function zvaddD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;

declare function zvcma(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __D: interop.Reference<DSPSplitComplex>, __ID: number, __N: number): void;

declare function zvcmaD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __D: interop.Reference<DSPDoubleSplitComplex>, __ID: number, __N: number): void;

declare function zvmul(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number, __Conjugate: number): void;

declare function zvmulD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number, __Conjugate: number): void;

declare function zvsub(__A: interop.Reference<DSPSplitComplex>, __IA: number, __B: interop.Reference<DSPSplitComplex>, __IB: number, __C: interop.Reference<DSPSplitComplex>, __IC: number, __N: number): void;

declare function zvsubD(__A: interop.Reference<DSPDoubleSplitComplex>, __IA: number, __B: interop.Reference<DSPDoubleSplitComplex>, __IB: number, __C: interop.Reference<DSPDoubleSplitComplex>, __IC: number, __N: number): void;
