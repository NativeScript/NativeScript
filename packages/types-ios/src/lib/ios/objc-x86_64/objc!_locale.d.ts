
interface lconv {
	decimal_point: interop.Pointer | interop.Reference<any>;
	thousands_sep: interop.Pointer | interop.Reference<any>;
	grouping: interop.Pointer | interop.Reference<any>;
	int_curr_symbol: interop.Pointer | interop.Reference<any>;
	currency_symbol: interop.Pointer | interop.Reference<any>;
	mon_decimal_point: interop.Pointer | interop.Reference<any>;
	mon_thousands_sep: interop.Pointer | interop.Reference<any>;
	mon_grouping: interop.Pointer | interop.Reference<any>;
	positive_sign: interop.Pointer | interop.Reference<any>;
	negative_sign: interop.Pointer | interop.Reference<any>;
	int_frac_digits: number;
	frac_digits: number;
	p_cs_precedes: number;
	p_sep_by_space: number;
	n_cs_precedes: number;
	n_sep_by_space: number;
	p_sign_posn: number;
	n_sign_posn: number;
	int_p_cs_precedes: number;
	int_n_cs_precedes: number;
	int_p_sep_by_space: number;
	int_n_sep_by_space: number;
	int_p_sign_posn: number;
	int_n_sign_posn: number;
}
declare var lconv: interop.StructType<lconv>;

declare function localeconv(): interop.Pointer | interop.Reference<lconv>;

declare function setlocale(p1: number, p2: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;
