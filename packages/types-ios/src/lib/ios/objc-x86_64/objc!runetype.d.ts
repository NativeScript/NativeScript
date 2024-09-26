
declare var _CurrentRuneLocale: interop.Pointer | interop.Reference<_RuneLocale>;

declare var _DefaultRuneLocale: _RuneLocale;

interface _RuneCharClass {
	__name: interop.Reference<number>;
	__mask: number;
}
declare var _RuneCharClass: interop.StructType<_RuneCharClass>;

interface _RuneEntry {
	__min: number;
	__max: number;
	__map: number;
	__types: interop.Pointer | interop.Reference<number>;
}
declare var _RuneEntry: interop.StructType<_RuneEntry>;

interface _RuneLocale {
	__magic: interop.Reference<number>;
	__encoding: interop.Reference<number>;
	__sgetrune: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>;
	__sputrune: interop.FunctionReference<(p1: number, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>;
	__invalid_rune: number;
	__runetype: interop.Reference<number>;
	__maplower: interop.Reference<number>;
	__mapupper: interop.Reference<number>;
	__runetype_ext: _RuneRange;
	__maplower_ext: _RuneRange;
	__mapupper_ext: _RuneRange;
	__variable: interop.Pointer | interop.Reference<any>;
	__variable_len: number;
	__ncharclasses: number;
	__charclasses: interop.Pointer | interop.Reference<_RuneCharClass>;
}
declare var _RuneLocale: interop.StructType<_RuneLocale>;

interface _RuneRange {
	__nranges: number;
	__ranges: interop.Pointer | interop.Reference<_RuneEntry>;
}
declare var _RuneRange: interop.StructType<_RuneRange>;
