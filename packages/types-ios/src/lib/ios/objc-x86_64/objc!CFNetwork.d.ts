
/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function CFFTPCreateParsedResourceListing(alloc: any, buffer: string | interop.Pointer | interop.Reference<any>, bufferLength: number, parsed: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

/**
 * @since 2.0
 */
declare function CFHTTPAuthenticationAppliesToRequest(auth: any, request: any): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPAuthenticationCopyDomains(auth: any): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 */
declare function CFHTTPAuthenticationCopyMethod(auth: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 */
declare function CFHTTPAuthenticationCopyRealm(auth: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 */
declare function CFHTTPAuthenticationCreateFromResponse(alloc: any, response: any): interop.Unmanaged<any>;

/**
 * @since 2.0
 */
declare function CFHTTPAuthenticationGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CFHTTPAuthenticationIsValid(auth: any, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPAuthenticationRequiresAccountDomain(auth: any): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPAuthenticationRequiresOrderedRequests(auth: any): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPAuthenticationRequiresUserNameAndPassword(auth: any): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPMessageAddAuthentication(request: any, authenticationFailureResponse: any, username: string, password: string, authenticationScheme: string, forProxy: boolean): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPMessageAppendBytes(message: any, newBytes: string | interop.Pointer | interop.Reference<any>, numBytes: number): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPMessageApplyCredentialDictionary(request: any, auth: any, dict: NSDictionary<any, any>, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPMessageApplyCredentials(request: any, auth: any, username: string, password: string, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCopyAllHeaderFields(message: any): interop.Unmanaged<NSDictionary<any, any>>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCopyBody(message: any): interop.Unmanaged<NSData>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCopyHeaderFieldValue(message: any, headerField: string): interop.Unmanaged<string>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCopyRequestMethod(request: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCopyRequestURL(request: any): interop.Unmanaged<NSURL>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCopyResponseStatusLine(response: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCopySerializedMessage(message: any): interop.Unmanaged<NSData>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCopyVersion(message: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCreateCopy(alloc: any, message: any): interop.Unmanaged<any>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCreateEmpty(alloc: any, isRequest: boolean): interop.Unmanaged<any>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCreateRequest(alloc: any, requestMethod: string, url: NSURL, httpVersion: string): interop.Unmanaged<any>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageCreateResponse(alloc: any, statusCode: number, statusDescription: string, httpVersion: string): interop.Unmanaged<any>;

/**
 * @since 2.0
 */
declare function CFHTTPMessageGetResponseStatusCode(response: any): number;

/**
 * @since 2.0
 */
declare function CFHTTPMessageGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CFHTTPMessageIsHeaderComplete(message: any): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPMessageIsRequest(message: any): boolean;

/**
 * @since 2.0
 */
declare function CFHTTPMessageSetBody(message: any, bodyData: NSData): void;

/**
 * @since 2.0
 */
declare function CFHTTPMessageSetHeaderFieldValue(message: any, headerField: string, value: string): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostCancelInfoResolution(theHost: any, info: CFHostInfoType): void;

interface CFHostClientContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFHostClientContext: interop.StructType<CFHostClientContext>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostCreateCopy(alloc: any, host: any): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostCreateWithAddress(allocator: any, addr: NSData): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostCreateWithName(allocator: any, hostname: string): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostGetAddressing(theHost: any, hasBeenResolved: string | interop.Pointer | interop.Reference<any>): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostGetNames(theHost: any, hasBeenResolved: string | interop.Pointer | interop.Reference<any>): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostGetReachability(theHost: any, hasBeenResolved: string | interop.Pointer | interop.Reference<any>): interop.Unmanaged<NSData>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostGetTypeID(): number;

declare const enum CFHostInfoType {

	kCFHostAddresses = 0,

	kCFHostNames = 1,

	kCFHostReachability = 2
}

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostScheduleWithRunLoop(theHost: any, runLoop: any, runLoopMode: string): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostSetClient(theHost: any, clientCB: interop.FunctionReference<(p1: any, p2: CFHostInfoType, p3: interop.Pointer | interop.Reference<CFStreamError>, p4: interop.Pointer | interop.Reference<any>) => void>, clientContext: interop.Pointer | interop.Reference<CFHostClientContext>): boolean;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostStartInfoResolution(theHost: any, info: CFHostInfoType, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFHostUnscheduleFromRunLoop(theHost: any, runLoop: any, runLoopMode: string): void;

/**
 * @since 2.0
 * @deprecated 11.0
 */
declare function CFNetDiagnosticCopyNetworkStatusPassively(details: any, description: interop.Pointer | interop.Reference<string>): number;

/**
 * @since 2.0
 * @deprecated 11.0
 */
declare function CFNetDiagnosticCreateWithStreams(alloc: any, readStream: NSInputStream, writeStream: NSOutputStream): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 11.0
 */
declare function CFNetDiagnosticCreateWithURL(alloc: any, url: NSURL): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 11.0
 */
declare function CFNetDiagnosticDiagnoseProblemInteractively(details: any): number;

/**
 * @since 2.0
 * @deprecated 11.0
 */
declare function CFNetDiagnosticSetName(details: any, name: string): void;

/**
 * @since 2.0
 * @deprecated 11.0
 */
declare const enum CFNetDiagnosticStatusValues {

	kCFNetDiagnosticNoErr = 0,

	kCFNetDiagnosticErr = -66560,

	kCFNetDiagnosticConnectionUp = -66559,

	kCFNetDiagnosticConnectionIndeterminate = -66558,

	kCFNetDiagnosticConnectionDown = -66557
}

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceBrowserCreate(alloc: any, clientCB: interop.FunctionReference<(p1: any, p2: number, p3: any, p4: interop.Pointer | interop.Reference<CFStreamError>, p5: interop.Pointer | interop.Reference<any>) => void>, clientContext: interop.Pointer | interop.Reference<CFNetServiceClientContext>): interop.Unmanaged<any>;

declare const enum CFNetServiceBrowserFlags {

	kCFNetServiceFlagMoreComing = 1,

	kCFNetServiceFlagIsDomain = 2,

	kCFNetServiceFlagIsDefault = 4,

	kCFNetServiceFlagIsRegistrationDomain = 4,

	kCFNetServiceFlagRemove = 8
}

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceBrowserGetTypeID(): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceBrowserInvalidate(browser: any): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceBrowserScheduleWithRunLoop(browser: any, runLoop: any, runLoopMode: string): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceBrowserSearchForDomains(browser: any, registrationDomains: boolean, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceBrowserSearchForServices(browser: any, domain: string, serviceType: string, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceBrowserStopSearch(browser: any, error: interop.Pointer | interop.Reference<CFStreamError>): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceBrowserUnscheduleFromRunLoop(browser: any, runLoop: any, runLoopMode: string): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceCancel(theService: any): void;

interface CFNetServiceClientContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFNetServiceClientContext: interop.StructType<CFNetServiceClientContext>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceCreate(alloc: any, domain: string, serviceType: string, name: string, port: number): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceCreateCopy(alloc: any, service: any): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceCreateDictionaryWithTXTData(alloc: any, txtRecord: NSData): interop.Unmanaged<NSDictionary<any, any>>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceCreateTXTDataWithDictionary(alloc: any, keyValuePairs: NSDictionary<any, any>): interop.Unmanaged<NSData>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceGetAddressing(theService: any): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceGetDomain(theService: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceGetName(theService: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceGetPortNumber(theService: any): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceGetTXTData(theService: any): interop.Unmanaged<NSData>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceGetTargetHost(theService: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceGetType(theService: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceGetTypeID(): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceMonitorCreate(alloc: any, theService: any, clientCB: interop.FunctionReference<(p1: any, p2: any, p3: CFNetServiceMonitorType, p4: NSData, p5: interop.Pointer | interop.Reference<CFStreamError>, p6: interop.Pointer | interop.Reference<any>) => void>, clientContext: interop.Pointer | interop.Reference<CFNetServiceClientContext>): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceMonitorGetTypeID(): number;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceMonitorInvalidate(monitor: any): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceMonitorScheduleWithRunLoop(monitor: any, runLoop: any, runLoopMode: string): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceMonitorStart(monitor: any, recordType: CFNetServiceMonitorType, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceMonitorStop(monitor: any, error: interop.Pointer | interop.Reference<CFStreamError>): void;

declare const enum CFNetServiceMonitorType {

	kCFNetServiceMonitorTXT = 1
}

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceMonitorUnscheduleFromRunLoop(monitor: any, runLoop: any, runLoopMode: string): void;

declare const enum CFNetServiceRegisterFlags {

	kCFNetServiceFlagNoAutoRename = 1
}

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceRegisterWithOptions(theService: any, options: number, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceResolveWithTimeout(theService: any, timeout: number, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceScheduleWithRunLoop(theService: any, runLoop: any, runLoopMode: string): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceSetClient(theService: any, clientCB: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<CFStreamError>, p3: interop.Pointer | interop.Reference<any>) => void>, clientContext: interop.Pointer | interop.Reference<CFNetServiceClientContext>): boolean;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceSetTXTData(theService: any, txtRecord: NSData): boolean;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFNetServiceUnscheduleFromRunLoop(theService: any, runLoop: any, runLoopMode: string): void;

declare const enum CFNetServicesError {

	kCFNetServicesErrorUnknown = -72000,

	kCFNetServicesErrorCollision = -72001,

	kCFNetServicesErrorNotFound = -72002,

	kCFNetServicesErrorInProgress = -72003,

	kCFNetServicesErrorBadArgument = -72004,

	kCFNetServicesErrorCancel = -72005,

	kCFNetServicesErrorInvalid = -72006,

	kCFNetServicesErrorTimeout = -72007,

	kCFNetServicesErrorMissingRequiredConfiguration = -72008
}

/**
 * @since 2.0
 */
declare function CFNetworkCopyProxiesForAutoConfigurationScript(proxyAutoConfigurationScript: string, targetURL: NSURL, error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 */
declare function CFNetworkCopyProxiesForURL(url: NSURL, proxySettings: NSDictionary<any, any>): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 */
declare function CFNetworkCopySystemProxySettings(): interop.Unmanaged<NSDictionary<any, any>>;

declare const enum CFNetworkErrors {

	kCFHostErrorHostNotFound = 1,

	kCFHostErrorUnknown = 2,

	kCFSOCKSErrorUnknownClientVersion = 100,

	kCFSOCKSErrorUnsupportedServerVersion = 101,

	kCFSOCKS4ErrorRequestFailed = 110,

	kCFSOCKS4ErrorIdentdFailed = 111,

	kCFSOCKS4ErrorIdConflict = 112,

	kCFSOCKS4ErrorUnknownStatusCode = 113,

	kCFSOCKS5ErrorBadState = 120,

	kCFSOCKS5ErrorBadResponseAddr = 121,

	kCFSOCKS5ErrorBadCredentials = 122,

	kCFSOCKS5ErrorUnsupportedNegotiationMethod = 123,

	kCFSOCKS5ErrorNoAcceptableMethod = 124,

	kCFFTPErrorUnexpectedStatusCode = 200,

	kCFErrorHTTPAuthenticationTypeUnsupported = 300,

	kCFErrorHTTPBadCredentials = 301,

	kCFErrorHTTPConnectionLost = 302,

	kCFErrorHTTPParseFailure = 303,

	kCFErrorHTTPRedirectionLoopDetected = 304,

	kCFErrorHTTPBadURL = 305,

	kCFErrorHTTPProxyConnectionFailure = 306,

	kCFErrorHTTPBadProxyCredentials = 307,

	kCFErrorPACFileError = 308,

	kCFErrorPACFileAuth = 309,

	kCFErrorHTTPSProxyConnectionFailure = 310,

	kCFStreamErrorHTTPSProxyFailureUnexpectedResponseToCONNECTMethod = 311,

	kCFURLErrorBackgroundSessionInUseByAnotherProcess = -996,

	kCFURLErrorBackgroundSessionWasDisconnected = -997,

	kCFURLErrorUnknown = -998,

	kCFURLErrorCancelled = -999,

	kCFURLErrorBadURL = -1000,

	kCFURLErrorTimedOut = -1001,

	kCFURLErrorUnsupportedURL = -1002,

	kCFURLErrorCannotFindHost = -1003,

	kCFURLErrorCannotConnectToHost = -1004,

	kCFURLErrorNetworkConnectionLost = -1005,

	kCFURLErrorDNSLookupFailed = -1006,

	kCFURLErrorHTTPTooManyRedirects = -1007,

	kCFURLErrorResourceUnavailable = -1008,

	kCFURLErrorNotConnectedToInternet = -1009,

	kCFURLErrorRedirectToNonExistentLocation = -1010,

	kCFURLErrorBadServerResponse = -1011,

	kCFURLErrorUserCancelledAuthentication = -1012,

	kCFURLErrorUserAuthenticationRequired = -1013,

	kCFURLErrorZeroByteResource = -1014,

	kCFURLErrorCannotDecodeRawData = -1015,

	kCFURLErrorCannotDecodeContentData = -1016,

	kCFURLErrorCannotParseResponse = -1017,

	kCFURLErrorInternationalRoamingOff = -1018,

	kCFURLErrorCallIsActive = -1019,

	kCFURLErrorDataNotAllowed = -1020,

	kCFURLErrorRequestBodyStreamExhausted = -1021,

	kCFURLErrorAppTransportSecurityRequiresSecureConnection = -1022,

	kCFURLErrorFileDoesNotExist = -1100,

	kCFURLErrorFileIsDirectory = -1101,

	kCFURLErrorNoPermissionsToReadFile = -1102,

	kCFURLErrorDataLengthExceedsMaximum = -1103,

	kCFURLErrorFileOutsideSafeArea = -1104,

	kCFURLErrorSecureConnectionFailed = -1200,

	kCFURLErrorServerCertificateHasBadDate = -1201,

	kCFURLErrorServerCertificateUntrusted = -1202,

	kCFURLErrorServerCertificateHasUnknownRoot = -1203,

	kCFURLErrorServerCertificateNotYetValid = -1204,

	kCFURLErrorClientCertificateRejected = -1205,

	kCFURLErrorClientCertificateRequired = -1206,

	kCFURLErrorCannotLoadFromNetwork = -2000,

	kCFURLErrorCannotCreateFile = -3000,

	kCFURLErrorCannotOpenFile = -3001,

	kCFURLErrorCannotCloseFile = -3002,

	kCFURLErrorCannotWriteToFile = -3003,

	kCFURLErrorCannotRemoveFile = -3004,

	kCFURLErrorCannotMoveFile = -3005,

	kCFURLErrorDownloadDecodingFailedMidStream = -3006,

	kCFURLErrorDownloadDecodingFailedToComplete = -3007,

	kCFHTTPCookieCannotParseCookieFile = -4000,

	kCFNetServiceErrorUnknown = -72000,

	kCFNetServiceErrorCollision = -72001,

	kCFNetServiceErrorNotFound = -72002,

	kCFNetServiceErrorInProgress = -72003,

	kCFNetServiceErrorBadArgument = -72004,

	kCFNetServiceErrorCancel = -72005,

	kCFNetServiceErrorInvalid = -72006,

	kCFNetServiceErrorTimeout = -72007,

	kCFNetServiceErrorDNSServiceFailure = -73000
}

/**
 * @since 2.0
 */
declare function CFNetworkExecuteProxyAutoConfigurationScript(proxyAutoConfigurationScript: string, targetURL: NSURL, cb: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: NSArray<any>, p3: NSError) => void>, clientContext: interop.Pointer | interop.Reference<CFStreamClientContext>): any;

/**
 * @since 2.0
 */
declare function CFNetworkExecuteProxyAutoConfigurationURL(proxyAutoConfigURL: NSURL, targetURL: NSURL, cb: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: NSArray<any>, p3: NSError) => void>, clientContext: interop.Pointer | interop.Reference<CFStreamClientContext>): any;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function CFReadStreamCreateForHTTPRequest(alloc: any, request: any): interop.Unmanaged<NSInputStream>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function CFReadStreamCreateForStreamedHTTPRequest(alloc: any, requestHeaders: any, requestBody: NSInputStream): interop.Unmanaged<NSInputStream>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function CFReadStreamCreateWithFTPURL(alloc: any, ftpURL: NSURL): interop.Unmanaged<NSInputStream>;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFStreamCreatePairWithSocketToCFHost(alloc: any, host: any, port: number, readStream: interop.Pointer | interop.Reference<NSInputStream>, writeStream: interop.Pointer | interop.Reference<NSOutputStream>): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFStreamCreatePairWithSocketToNetService(alloc: any, service: any, readStream: interop.Pointer | interop.Reference<NSInputStream>, writeStream: interop.Pointer | interop.Reference<NSOutputStream>): void;

declare const enum CFStreamErrorHTTP {

	kCFStreamErrorHTTPParseFailure = -1,

	kCFStreamErrorHTTPRedirectionLoop = -2,

	kCFStreamErrorHTTPBadURL = -3
}

declare const enum CFStreamErrorHTTPAuthentication {

	kCFStreamErrorHTTPAuthenticationTypeUnsupported = -1000,

	kCFStreamErrorHTTPAuthenticationBadUserName = -1001,

	kCFStreamErrorHTTPAuthenticationBadPassword = -1002
}

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function CFWriteStreamCreateWithFTPURL(alloc: any, ftpURL: NSURL): interop.Unmanaged<NSOutputStream>;

/**
 * @since 2.0
 */
declare var kCFDNSServiceFailureKey: string;

/**
 * @since 2.0
 */
declare var kCFErrorDomainCFNetwork: string;

/**
 * @since 2.0
 */
declare var kCFErrorDomainWinSock: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFFTPResourceGroup: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFFTPResourceLink: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFFTPResourceModDate: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFFTPResourceMode: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFFTPResourceName: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFFTPResourceOwner: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFFTPResourceSize: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFFTPResourceType: string;

/**
 * @since 2.0
 */
declare var kCFFTPStatusCodeKey: string;

/**
 * @since 2.0
 */
declare var kCFGetAddrInfoFailureKey: string;

/**
 * @since 2.0
 */
declare var kCFHTTPAuthenticationAccountDomain: string;

/**
 * @since 2.0
 */
declare var kCFHTTPAuthenticationPassword: string;

/**
 * @since 2.0
 */
declare var kCFHTTPAuthenticationSchemeBasic: string;

/**
 * @since 2.0
 */
declare var kCFHTTPAuthenticationSchemeDigest: string;

/**
 * @since 2.0
 */
declare var kCFHTTPAuthenticationSchemeKerberos: string;

/**
 * @since 2.0
 */
declare var kCFHTTPAuthenticationSchemeNTLM: string;

/**
 * @since 2.0
 */
declare var kCFHTTPAuthenticationSchemeNegotiate: string;

/**
 * @since 3.0
 */
declare var kCFHTTPAuthenticationSchemeNegotiate2: string;

/**
 * @since 4.3
 */
declare var kCFHTTPAuthenticationSchemeXMobileMeAuthToken: string;

/**
 * @since 2.0
 */
declare var kCFHTTPAuthenticationUsername: string;

/**
 * @since 2.0
 */
declare var kCFHTTPVersion1_0: string;

/**
 * @since 2.0
 */
declare var kCFHTTPVersion1_1: string;

/**
 * @since 8.0
 */
declare var kCFHTTPVersion2_0: string;

/**
 * @since 13.0
 */
declare var kCFHTTPVersion3_0: string;

/**
 * @since 2.0
 */
declare var kCFNetworkProxiesHTTPEnable: string;

/**
 * @since 2.0
 */
declare var kCFNetworkProxiesHTTPPort: string;

/**
 * @since 2.0
 */
declare var kCFNetworkProxiesHTTPProxy: string;

/**
 * @since 2.0
 */
declare var kCFNetworkProxiesProxyAutoConfigEnable: string;

/**
 * @since 3.0
 */
declare var kCFNetworkProxiesProxyAutoConfigJavaScript: string;

/**
 * @since 2.0
 */
declare var kCFNetworkProxiesProxyAutoConfigURLString: string;

/**
 * @since 2.0
 */
declare var kCFProxyAutoConfigurationHTTPResponseKey: string;

/**
 * @since 3.0
 */
declare var kCFProxyAutoConfigurationJavaScriptKey: string;

/**
 * @since 2.0
 */
declare var kCFProxyAutoConfigurationURLKey: string;

/**
 * @since 2.0
 */
declare var kCFProxyHostNameKey: string;

/**
 * @since 2.0
 */
declare var kCFProxyPasswordKey: string;

/**
 * @since 2.0
 */
declare var kCFProxyPortNumberKey: string;

/**
 * @since 3.0
 */
declare var kCFProxyTypeAutoConfigurationJavaScript: string;

/**
 * @since 2.0
 */
declare var kCFProxyTypeAutoConfigurationURL: string;

/**
 * @since 2.0
 */
declare var kCFProxyTypeFTP: string;

/**
 * @since 2.0
 */
declare var kCFProxyTypeHTTP: string;

/**
 * @since 2.0
 */
declare var kCFProxyTypeHTTPS: string;

/**
 * @since 2.0
 */
declare var kCFProxyTypeKey: string;

/**
 * @since 2.0
 */
declare var kCFProxyTypeNone: string;

/**
 * @since 2.0
 */
declare var kCFProxyTypeSOCKS: string;

/**
 * @since 2.0
 */
declare var kCFProxyUsernameKey: string;

/**
 * @since 2.0
 */
declare var kCFSOCKSNegotiationMethodKey: string;

/**
 * @since 2.0
 */
declare var kCFSOCKSStatusCodeKey: string;

/**
 * @since 2.0
 */
declare var kCFSOCKSVersionKey: string;

/**
 * @since 2.0
 */
declare var kCFStreamErrorDomainFTP: number;

/**
 * @since 2.0
 */
declare var kCFStreamErrorDomainHTTP: number;

/**
 * @since 2.0
 */
declare var kCFStreamErrorDomainMach: number;

/**
 * @since 2.0
 */
declare var kCFStreamErrorDomainNetDB: number;

/**
 * @since 2.0
 */
declare var kCFStreamErrorDomainNetServices: number;

/**
 * @since 2.0
 */
declare var kCFStreamErrorDomainSystemConfiguration: number;

/**
 * @since 2.0
 */
declare var kCFStreamErrorDomainWinSock: number;

declare const kCFStreamErrorSOCKS4IdConflict: number;

declare const kCFStreamErrorSOCKS4IdentdFailed: number;

declare const kCFStreamErrorSOCKS4RequestFailed: number;

declare const kCFStreamErrorSOCKS4SubDomainResponse: number;

declare const kCFStreamErrorSOCKS5BadResponseAddr: number;

declare const kCFStreamErrorSOCKS5BadState: number;

declare const kCFStreamErrorSOCKS5SubDomainMethod: number;

declare const kCFStreamErrorSOCKS5SubDomainResponse: number;

declare const kCFStreamErrorSOCKS5SubDomainUserPass: number;

declare const kCFStreamErrorSOCKSSubDomainNone: number;

declare const kCFStreamErrorSOCKSSubDomainVersionCode: number;

declare const kCFStreamErrorSOCKSUnknownClientVersion: number;

/**
 * @since 4.0
 */
declare var kCFStreamNetworkServiceType: string;

/**
 * @since 6.0
 */
declare var kCFStreamNetworkServiceTypeAVStreaming: string;

/**
 * @since 5.0
 */
declare var kCFStreamNetworkServiceTypeBackground: string;

/**
 * @since 10.0
 */
declare var kCFStreamNetworkServiceTypeCallSignaling: string;

/**
 * @since 6.0
 */
declare var kCFStreamNetworkServiceTypeResponsiveAV: string;

/**
 * @since 6.0
 */
declare var kCFStreamNetworkServiceTypeResponsiveData: string;

/**
 * @since 5.0
 */
declare var kCFStreamNetworkServiceTypeVideo: string;

/**
 * @since 4.0
 * @deprecated 9.0
 */
declare var kCFStreamNetworkServiceTypeVoIP: string;

/**
 * @since 5.0
 */
declare var kCFStreamNetworkServiceTypeVoice: string;

/**
 * @since 13.0
 */
declare var kCFStreamPropertyAllowConstrainedNetworkAccess: string;

/**
 * @since 13.0
 */
declare var kCFStreamPropertyAllowExpensiveNetworkAccess: string;

/**
 * @since 6.0
 */
declare var kCFStreamPropertyConnectionIsCellular: string;

/**
 * @since 13.0
 */
declare var kCFStreamPropertyConnectionIsExpensive: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPAttemptPersistentConnection: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPFetchResourceInfo: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPFileTransferOffset: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPPassword: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPProxy: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPProxyHost: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPProxyPassword: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPProxyPort: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPProxyUser: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPResourceSize: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPUsePassiveMode: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyFTPUserName: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPAttemptPersistentConnection: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPFinalRequest: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPFinalURL: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPProxy: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPProxyHost: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPProxyPort: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPRequestBytesWrittenCount: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPResponseHeader: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPSProxyHost: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPSProxyPort: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kCFStreamPropertyHTTPShouldAutoredirect: string;

/**
 * @since 5.0
 */
declare var kCFStreamPropertyNoCellular: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertyProxyLocalBypass: string;

/**
 * @since 5.0
 */
declare var kCFStreamPropertySSLContext: string;

/**
 * @since 2.0
 * @deprecated 4.0
 */
declare var kCFStreamPropertySSLPeerCertificates: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySSLPeerTrust: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySSLSettings: string;

/**
 * @since 9.0
 */
declare var kCFStreamPropertySocketExtendedBackgroundIdleMode: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySocketRemoteHost: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySocketRemoteNetService: string;

/**
 * @since 2.0
 * @deprecated 4.0
 */
declare var kCFStreamSSLAllowsAnyRoot: string;

/**
 * @since 2.0
 * @deprecated 4.0
 */
declare var kCFStreamSSLAllowsExpiredCertificates: string;

/**
 * @since 2.0
 * @deprecated 4.0
 */
declare var kCFStreamSSLAllowsExpiredRoots: string;

/**
 * @since 2.0
 */
declare var kCFStreamSSLCertificates: string;

/**
 * @since 2.0
 */
declare var kCFStreamSSLIsServer: string;

/**
 * @since 2.0
 */
declare var kCFStreamSSLLevel: string;

/**
 * @since 2.0
 */
declare var kCFStreamSSLPeerName: string;

/**
 * @since 2.0
 */
declare var kCFStreamSSLValidatesCertificateChain: string;

/**
 * @since 2.2
 */
declare var kCFURLErrorFailingURLErrorKey: string;

/**
 * @since 2.2
 */
declare var kCFURLErrorFailingURLStringErrorKey: string;

declare const kSOCKS5NoAcceptableMethod: number;
