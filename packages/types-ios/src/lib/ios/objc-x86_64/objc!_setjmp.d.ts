
declare function _longjmp(p1: interop.Reference<number>, p2: number): void;

declare function _setjmp(p1: interop.Reference<number>): number;

declare function longjmp(p1: interop.Reference<number>, p2: number): void;

declare function longjmperror(): void;

declare function setjmp(p1: interop.Reference<number>): number;

declare function siglongjmp(p1: interop.Reference<number>, p2: number): void;

declare function sigsetjmp(p1: interop.Reference<number>, p2: number): number;
