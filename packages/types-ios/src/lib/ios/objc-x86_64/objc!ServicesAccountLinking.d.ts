
declare const enum SALRegistrationError {

	NotEligible = 0,

	Failed = 1,

	RateLimited = 2
}

interface SALResellerAccount {
	_reserved: interop.Pointer | interop.Reference<any> | null;
}
declare var SALResellerAccount: interop.StructType<SALResellerAccount>;

declare var ServicesAccountLinkingVersionNumber: number;

declare var ServicesAccountLinkingVersionString: interop.Reference<number>;
