
declare function CFFTPCreateParsedResourceListing(alloc: any, buffer: string | interop.Pointer | interop.Reference<any>, bufferLength: number, parsed: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

declare function CFHTTPAuthenticationAppliesToRequest(auth: any, request: any): boolean;

declare function CFHTTPAuthenticationCopyDomains(auth: any): interop.Unmanaged<NSArray<any>>;

declare function CFHTTPAuthenticationCopyMethod(auth: any): interop.Unmanaged<string>;

declare function CFHTTPAuthenticationCopyRealm(auth: any): interop.Unmanaged<string>;

declare function CFHTTPAuthenticationCreateFromResponse(alloc: any, response: any): interop.Unmanaged<any>;

declare function CFHTTPAuthenticationGetTypeID(): number;

declare function CFHTTPAuthenticationIsValid(auth: any, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

declare function CFHTTPAuthenticationRequiresAccountDomain(auth: any): boolean;

declare function CFHTTPAuthenticationRequiresOrderedRequests(auth: any): boolean;

declare function CFHTTPAuthenticationRequiresUserNameAndPassword(auth: any): boolean;

declare function CFHTTPMessageAddAuthentication(request: any, authenticationFailureResponse: any, username: string, password: string, authenticationScheme: string, forProxy: boolean): boolean;

declare function CFHTTPMessageAppendBytes(message: any, newBytes: string | interop.Pointer | interop.Reference<any>, numBytes: number): boolean;

declare function CFHTTPMessageApplyCredentialDictionary(request: any, auth: any, dict: NSDictionary<any, any>, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

declare function CFHTTPMessageApplyCredentials(request: any, auth: any, username: string, password: string, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

declare function CFHTTPMessageCopyAllHeaderFields(message: any): interop.Unmanaged<NSDictionary<any, any>>;

declare function CFHTTPMessageCopyBody(message: any): interop.Unmanaged<NSData>;

declare function CFHTTPMessageCopyHeaderFieldValue(message: any, headerField: string): interop.Unmanaged<string>;

declare function CFHTTPMessageCopyRequestMethod(request: any): interop.Unmanaged<string>;

declare function CFHTTPMessageCopyRequestURL(request: any): interop.Unmanaged<NSURL>;

declare function CFHTTPMessageCopyResponseStatusLine(response: any): interop.Unmanaged<string>;

declare function CFHTTPMessageCopySerializedMessage(message: any): interop.Unmanaged<NSData>;

declare function CFHTTPMessageCopyVersion(message: any): interop.Unmanaged<string>;

declare function CFHTTPMessageCreateCopy(alloc: any, message: any): interop.Unmanaged<any>;

declare function CFHTTPMessageCreateEmpty(alloc: any, isRequest: boolean): interop.Unmanaged<any>;

declare function CFHTTPMessageCreateRequest(alloc: any, requestMethod: string, url: NSURL, httpVersion: string): interop.Unmanaged<any>;

declare function CFHTTPMessageCreateResponse(alloc: any, statusCode: number, statusDescription: string, httpVersion: string): interop.Unmanaged<any>;

declare function CFHTTPMessageGetResponseStatusCode(response: any): number;

declare function CFHTTPMessageGetTypeID(): number;

declare function CFHTTPMessageIsHeaderComplete(message: any): boolean;

declare function CFHTTPMessageIsRequest(message: any): boolean;

declare function CFHTTPMessageSetBody(message: any, bodyData: NSData): void;

declare function CFHTTPMessageSetHeaderFieldValue(message: any, headerField: string, value: string): void;

declare function CFHostCancelInfoResolution(theHost: any, info: CFHostInfoType): void;

interface CFHostClientContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFHostClientContext: interop.StructType<CFHostClientContext>;

declare function CFHostCreateCopy(alloc: any, host: any): interop.Unmanaged<any>;

declare function CFHostCreateWithAddress(allocator: any, addr: NSData): interop.Unmanaged<any>;

declare function CFHostCreateWithName(allocator: any, hostname: string): interop.Unmanaged<any>;

declare function CFHostGetAddressing(theHost: any, hasBeenResolved: string | interop.Pointer | interop.Reference<any>): interop.Unmanaged<NSArray<any>>;

declare function CFHostGetNames(theHost: any, hasBeenResolved: string | interop.Pointer | interop.Reference<any>): interop.Unmanaged<NSArray<any>>;

declare function CFHostGetReachability(theHost: any, hasBeenResolved: string | interop.Pointer | interop.Reference<any>): interop.Unmanaged<NSData>;

declare function CFHostGetTypeID(): number;

declare const enum CFHostInfoType {

	kCFHostAddresses = 0,

	kCFHostNames = 1,

	kCFHostReachability = 2
}

declare function CFHostScheduleWithRunLoop(theHost: any, runLoop: any, runLoopMode: string): void;

declare function CFHostSetClient(theHost: any, clientCB: interop.FunctionReference<(p1: any, p2: CFHostInfoType, p3: interop.Pointer | interop.Reference<CFStreamError>, p4: interop.Pointer | interop.Reference<any>) => void>, clientContext: interop.Pointer | interop.Reference<CFHostClientContext>): boolean;

declare function CFHostStartInfoResolution(theHost: any, info: CFHostInfoType, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

declare function CFHostUnscheduleFromRunLoop(theHost: any, runLoop: any, runLoopMode: string): void;

declare function CFNetDiagnosticCopyNetworkStatusPassively(details: any, description: interop.Pointer | interop.Reference<string>): number;

declare function CFNetDiagnosticCreateWithStreams(alloc: any, readStream: NSInputStream, writeStream: NSOutputStream): interop.Unmanaged<any>;

declare function CFNetDiagnosticCreateWithURL(alloc: any, url: NSURL): interop.Unmanaged<any>;

declare function CFNetDiagnosticDiagnoseProblemInteractively(details: any): number;

declare function CFNetDiagnosticSetName(details: any, name: string): void;

declare const enum CFNetDiagnosticStatusValues {

	kCFNetDiagnosticNoErr = 0,

	kCFNetDiagnosticErr = -66560,

	kCFNetDiagnosticConnectionUp = -66559,

	kCFNetDiagnosticConnectionIndeterminate = -66558,

	kCFNetDiagnosticConnectionDown = -66557
}

declare function CFNetServiceBrowserCreate(alloc: any, clientCB: interop.FunctionReference<(p1: any, p2: number, p3: any, p4: interop.Pointer | interop.Reference<CFStreamError>, p5: interop.Pointer | interop.Reference<any>) => void>, clientContext: interop.Pointer | interop.Reference<CFNetServiceClientContext>): interop.Unmanaged<any>;

declare const enum CFNetServiceBrowserFlags {

	kCFNetServiceFlagMoreComing = 1,

	kCFNetServiceFlagIsDomain = 2,

	kCFNetServiceFlagIsDefault = 4,

	kCFNetServiceFlagIsRegistrationDomain = 4,

	kCFNetServiceFlagRemove = 8
}

declare function CFNetServiceBrowserGetTypeID(): number;

declare function CFNetServiceBrowserInvalidate(browser: any): void;

declare function CFNetServiceBrowserScheduleWithRunLoop(browser: any, runLoop: any, runLoopMode: string): void;

declare function CFNetServiceBrowserSearchForDomains(browser: any, registrationDomains: boolean, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

declare function CFNetServiceBrowserSearchForServices(browser: any, domain: string, serviceType: string, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

declare function CFNetServiceBrowserStopSearch(browser: any, error: interop.Pointer | interop.Reference<CFStreamError>): void;

declare function CFNetServiceBrowserUnscheduleFromRunLoop(browser: any, runLoop: any, runLoopMode: string): void;

declare function CFNetServiceCancel(theService: any): void;

interface CFNetServiceClientContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFNetServiceClientContext: interop.StructType<CFNetServiceClientContext>;

declare function CFNetServiceCreate(alloc: any, domain: string, serviceType: string, name: string, port: number): interop.Unmanaged<any>;

declare function CFNetServiceCreateCopy(alloc: any, service: any): interop.Unmanaged<any>;

declare function CFNetServiceCreateDictionaryWithTXTData(alloc: any, txtRecord: NSData): interop.Unmanaged<NSDictionary<any, any>>;

declare function CFNetServiceCreateTXTDataWithDictionary(alloc: any, keyValuePairs: NSDictionary<any, any>): interop.Unmanaged<NSData>;

declare function CFNetServiceGetAddressing(theService: any): interop.Unmanaged<NSArray<any>>;

declare function CFNetServiceGetDomain(theService: any): interop.Unmanaged<string>;

declare function CFNetServiceGetName(theService: any): interop.Unmanaged<string>;

declare function CFNetServiceGetPortNumber(theService: any): number;

declare function CFNetServiceGetTXTData(theService: any): interop.Unmanaged<NSData>;

declare function CFNetServiceGetTargetHost(theService: any): interop.Unmanaged<string>;

declare function CFNetServiceGetType(theService: any): interop.Unmanaged<string>;

declare function CFNetServiceGetTypeID(): number;

declare function CFNetServiceMonitorCreate(alloc: any, theService: any, clientCB: interop.FunctionReference<(p1: any, p2: any, p3: CFNetServiceMonitorType, p4: NSData, p5: interop.Pointer | interop.Reference<CFStreamError>, p6: interop.Pointer | interop.Reference<any>) => void>, clientContext: interop.Pointer | interop.Reference<CFNetServiceClientContext>): interop.Unmanaged<any>;

declare function CFNetServiceMonitorGetTypeID(): number;

declare function CFNetServiceMonitorInvalidate(monitor: any): void;

declare function CFNetServiceMonitorScheduleWithRunLoop(monitor: any, runLoop: any, runLoopMode: string): void;

declare function CFNetServiceMonitorStart(monitor: any, recordType: CFNetServiceMonitorType, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

declare function CFNetServiceMonitorStop(monitor: any, error: interop.Pointer | interop.Reference<CFStreamError>): void;

declare const enum CFNetServiceMonitorType {

	kCFNetServiceMonitorTXT = 1
}

declare function CFNetServiceMonitorUnscheduleFromRunLoop(monitor: any, runLoop: any, runLoopMode: string): void;

declare const enum CFNetServiceRegisterFlags {

	kCFNetServiceFlagNoAutoRename = 1
}

declare function CFNetServiceRegisterWithOptions(theService: any, options: number, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

declare function CFNetServiceResolveWithTimeout(theService: any, timeout: number, error: interop.Pointer | interop.Reference<CFStreamError>): boolean;

declare function CFNetServiceScheduleWithRunLoop(theService: any, runLoop: any, runLoopMode: string): void;

declare function CFNetServiceSetClient(theService: any, clientCB: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<CFStreamError>, p3: interop.Pointer | interop.Reference<any>) => void>, clientContext: interop.Pointer | interop.Reference<CFNetServiceClientContext>): boolean;

declare function CFNetServiceSetTXTData(theService: any, txtRecord: NSData): boolean;

declare function CFNetServiceUnscheduleFromRunLoop(theService: any, runLoop: any, runLoopMode: string): void;

declare const enum CFNetServicesError {

	kCFNetServicesErrorUnknown = -72000,

	kCFNetServicesErrorCollision = -72001,

	kCFNetServicesErrorNotFound = -72002,

	kCFNetServicesErrorInProgress = -72003,

	kCFNetServicesErrorBadArgument = -72004,

	kCFNetServicesErrorCancel = -72005,

	kCFNetServicesErrorInvalid = -72006,

	kCFNetServicesErrorTimeout = -72007
}

declare function CFNetworkCopyProxiesForAutoConfigurationScript(proxyAutoConfigurationScript: string, targetURL: NSURL, error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<NSArray<any>>;

declare function CFNetworkCopyProxiesForURL(url: NSURL, proxySettings: NSDictionary<any, any>): interop.Unmanaged<NSArray<any>>;

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

declare function CFNetworkExecuteProxyAutoConfigurationScript(proxyAutoConfigurationScript: string, targetURL: NSURL, cb: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: NSArray<any>, p3: NSError) => void>, clientContext: interop.Pointer | interop.Reference<CFStreamClientContext>): interop.Unmanaged<any>;

declare function CFNetworkExecuteProxyAutoConfigurationURL(proxyAutoConfigURL: NSURL, targetURL: NSURL, cb: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: NSArray<any>, p3: NSError) => void>, clientContext: interop.Pointer | interop.Reference<CFStreamClientContext>): interop.Unmanaged<any>;

declare function CFReadStreamCreateForHTTPRequest(alloc: any, request: any): interop.Unmanaged<NSInputStream>;

declare function CFReadStreamCreateForStreamedHTTPRequest(alloc: any, requestHeaders: any, requestBody: NSInputStream): interop.Unmanaged<NSInputStream>;

declare function CFReadStreamCreateWithFTPURL(alloc: any, ftpURL: NSURL): interop.Unmanaged<NSInputStream>;

declare function CFStreamCreatePairWithSocketToCFHost(alloc: any, host: any, port: number, readStream: interop.Pointer | interop.Reference<NSInputStream>, writeStream: interop.Pointer | interop.Reference<NSOutputStream>): void;

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

declare function CFWriteStreamCreateWithFTPURL(alloc: any, ftpURL: NSURL): interop.Unmanaged<NSOutputStream>;

declare var kCFDNSServiceFailureKey: string;

declare var kCFErrorDomainCFNetwork: string;

declare var kCFErrorDomainWinSock: string;

declare var kCFFTPResourceGroup: string;

declare var kCFFTPResourceLink: string;

declare var kCFFTPResourceModDate: string;

declare var kCFFTPResourceMode: string;

declare var kCFFTPResourceName: string;

declare var kCFFTPResourceOwner: string;

declare var kCFFTPResourceSize: string;

declare var kCFFTPResourceType: string;

declare var kCFFTPStatusCodeKey: string;

declare var kCFGetAddrInfoFailureKey: string;

declare var kCFHTTPAuthenticationAccountDomain: string;

declare var kCFHTTPAuthenticationPassword: string;

declare var kCFHTTPAuthenticationSchemeBasic: string;

declare var kCFHTTPAuthenticationSchemeDigest: string;

declare var kCFHTTPAuthenticationSchemeKerberos: string;

declare var kCFHTTPAuthenticationSchemeNTLM: string;

declare var kCFHTTPAuthenticationSchemeNegotiate: string;

declare var kCFHTTPAuthenticationSchemeNegotiate2: string;

declare var kCFHTTPAuthenticationSchemeXMobileMeAuthToken: string;

declare var kCFHTTPAuthenticationUsername: string;

declare var kCFHTTPVersion1_0: string;

declare var kCFHTTPVersion1_1: string;

declare var kCFHTTPVersion2_0: string;

declare var kCFNetworkProxiesHTTPEnable: string;

declare var kCFNetworkProxiesHTTPPort: string;

declare var kCFNetworkProxiesHTTPProxy: string;

declare var kCFNetworkProxiesProxyAutoConfigEnable: string;

declare var kCFNetworkProxiesProxyAutoConfigJavaScript: string;

declare var kCFNetworkProxiesProxyAutoConfigURLString: string;

declare var kCFProxyAutoConfigurationHTTPResponseKey: string;

declare var kCFProxyAutoConfigurationJavaScriptKey: string;

declare var kCFProxyAutoConfigurationURLKey: string;

declare var kCFProxyHostNameKey: string;

declare var kCFProxyPasswordKey: string;

declare var kCFProxyPortNumberKey: string;

declare var kCFProxyTypeAutoConfigurationJavaScript: string;

declare var kCFProxyTypeAutoConfigurationURL: string;

declare var kCFProxyTypeFTP: string;

declare var kCFProxyTypeHTTP: string;

declare var kCFProxyTypeHTTPS: string;

declare var kCFProxyTypeKey: string;

declare var kCFProxyTypeNone: string;

declare var kCFProxyTypeSOCKS: string;

declare var kCFProxyUsernameKey: string;

declare var kCFSOCKSNegotiationMethodKey: string;

declare var kCFSOCKSStatusCodeKey: string;

declare var kCFSOCKSVersionKey: string;

declare var kCFStreamErrorDomainFTP: number;

declare var kCFStreamErrorDomainHTTP: number;

declare var kCFStreamErrorDomainMach: number;

declare var kCFStreamErrorDomainNetDB: number;

declare var kCFStreamErrorDomainNetServices: number;

declare var kCFStreamErrorDomainSystemConfiguration: number;

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

declare var kCFStreamNetworkServiceType: string;

declare var kCFStreamNetworkServiceTypeAVStreaming: string;

declare var kCFStreamNetworkServiceTypeBackground: string;

declare var kCFStreamNetworkServiceTypeCallSignaling: string;

declare var kCFStreamNetworkServiceTypeResponsiveAV: string;

declare var kCFStreamNetworkServiceTypeResponsiveData: string;

declare var kCFStreamNetworkServiceTypeVideo: string;

declare var kCFStreamNetworkServiceTypeVoIP: string;

declare var kCFStreamNetworkServiceTypeVoice: string;

declare var kCFStreamPropertyAllowConstrainedNetworkAccess: string;

declare var kCFStreamPropertyAllowExpensiveNetworkAccess: string;

declare var kCFStreamPropertyConnectionIsCellular: string;

declare var kCFStreamPropertyConnectionIsExpensive: string;

declare var kCFStreamPropertyFTPAttemptPersistentConnection: string;

declare var kCFStreamPropertyFTPFetchResourceInfo: string;

declare var kCFStreamPropertyFTPFileTransferOffset: string;

declare var kCFStreamPropertyFTPPassword: string;

declare var kCFStreamPropertyFTPProxy: string;

declare var kCFStreamPropertyFTPProxyHost: string;

declare var kCFStreamPropertyFTPProxyPassword: string;

declare var kCFStreamPropertyFTPProxyPort: string;

declare var kCFStreamPropertyFTPProxyUser: string;

declare var kCFStreamPropertyFTPResourceSize: string;

declare var kCFStreamPropertyFTPUsePassiveMode: string;

declare var kCFStreamPropertyFTPUserName: string;

declare var kCFStreamPropertyHTTPAttemptPersistentConnection: string;

declare var kCFStreamPropertyHTTPFinalRequest: string;

declare var kCFStreamPropertyHTTPFinalURL: string;

declare var kCFStreamPropertyHTTPProxy: string;

declare var kCFStreamPropertyHTTPProxyHost: string;

declare var kCFStreamPropertyHTTPProxyPort: string;

declare var kCFStreamPropertyHTTPRequestBytesWrittenCount: string;

declare var kCFStreamPropertyHTTPResponseHeader: string;

declare var kCFStreamPropertyHTTPSProxyHost: string;

declare var kCFStreamPropertyHTTPSProxyPort: string;

declare var kCFStreamPropertyHTTPShouldAutoredirect: string;

declare var kCFStreamPropertyNoCellular: string;

declare var kCFStreamPropertyProxyLocalBypass: string;

declare var kCFStreamPropertySSLContext: string;

declare var kCFStreamPropertySSLPeerCertificates: string;

declare var kCFStreamPropertySSLPeerTrust: string;

declare var kCFStreamPropertySSLSettings: string;

declare var kCFStreamPropertySocketExtendedBackgroundIdleMode: string;

declare var kCFStreamPropertySocketRemoteHost: string;

declare var kCFStreamPropertySocketRemoteNetService: string;

declare var kCFStreamSSLAllowsAnyRoot: string;

declare var kCFStreamSSLAllowsExpiredCertificates: string;

declare var kCFStreamSSLAllowsExpiredRoots: string;

declare var kCFStreamSSLCertificates: string;

declare var kCFStreamSSLIsServer: string;

declare var kCFStreamSSLLevel: string;

declare var kCFStreamSSLPeerName: string;

declare var kCFStreamSSLValidatesCertificateChain: string;

declare var kCFURLErrorFailingURLErrorKey: string;

declare var kCFURLErrorFailingURLStringErrorKey: string;

declare const kSOCKS5NoAcceptableMethod: number;
