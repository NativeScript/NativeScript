
interface OS_sec_certificate extends NSObjectProtocol {
}
declare var OS_sec_certificate: {

	prototype: OS_sec_certificate;
};

interface OS_sec_identity extends NSObjectProtocol {
}
declare var OS_sec_identity: {

	prototype: OS_sec_identity;
};

interface OS_sec_object extends NSObjectProtocol {
}
declare var OS_sec_object: {

	prototype: OS_sec_object;
};

interface OS_sec_protocol_metadata extends NSObjectProtocol {
}
declare var OS_sec_protocol_metadata: {

	prototype: OS_sec_protocol_metadata;
};

interface OS_sec_protocol_options extends NSObjectProtocol {
}
declare var OS_sec_protocol_options: {

	prototype: OS_sec_protocol_options;
};

interface OS_sec_trust extends NSObjectProtocol {
}
declare var OS_sec_trust: {

	prototype: OS_sec_trust;
};

declare function SSLAddDistinguishedName(context: any, derDN: interop.Pointer | interop.Reference<any>, derDNLen: number): number;

declare const enum SSLAuthenticate {

	kNeverAuthenticate = 0,

	kAlwaysAuthenticate = 1,

	kTryAuthenticate = 2
}

declare const enum SSLCiphersuiteGroup {

	kSSLCiphersuiteGroupDefault = 0,

	kSSLCiphersuiteGroupCompatibility = 1,

	kSSLCiphersuiteGroupLegacy = 2,

	kSSLCiphersuiteGroupATS = 3,

	kSSLCiphersuiteGroupATSCompatibility = 4
}

declare const enum SSLClientCertificateState {

	kSSLClientCertNone = 0,

	kSSLClientCertRequested = 1,

	kSSLClientCertSent = 2,

	kSSLClientCertRejected = 3
}

declare function SSLClose(context: any): number;

declare const enum SSLConnectionType {

	kSSLStreamType = 0,

	kSSLDatagramType = 1
}

declare function SSLContextGetTypeID(): number;

declare function SSLCopyALPNProtocols(context: any, protocols: interop.Pointer | interop.Reference<NSArray<any>>): number;

declare function SSLCopyDistinguishedNames(context: any, names: interop.Pointer | interop.Reference<NSArray<any>>): number;

declare function SSLCopyPeerTrust(context: any, trust: interop.Pointer | interop.Reference<any>): number;

declare function SSLCopyRequestedPeerName(context: any, peerName: string | interop.Pointer | interop.Reference<any>, peerNameLen: interop.Pointer | interop.Reference<number>): number;

declare function SSLCopyRequestedPeerNameLength(ctx: any, peerNameLen: interop.Pointer | interop.Reference<number>): number;

declare function SSLCreateContext(alloc: any, protocolSide: SSLProtocolSide, connectionType: SSLConnectionType): any;

declare function SSLGetBufferedReadSize(context: any, bufferSize: interop.Pointer | interop.Reference<number>): number;

declare function SSLGetClientCertificateState(context: any, clientState: interop.Pointer | interop.Reference<SSLClientCertificateState>): number;

declare function SSLGetConnection(context: any, connection: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function SSLGetDatagramWriteSize(dtlsContext: any, bufSize: interop.Pointer | interop.Reference<number>): number;

declare function SSLGetEnabledCiphers(context: any, ciphers: interop.Pointer | interop.Reference<number>, numCiphers: interop.Pointer | interop.Reference<number>): number;

declare function SSLGetMaxDatagramRecordSize(dtlsContext: any, maxSize: interop.Pointer | interop.Reference<number>): number;

declare function SSLGetNegotiatedCipher(context: any, cipherSuite: interop.Pointer | interop.Reference<number>): number;

declare function SSLGetNegotiatedProtocolVersion(context: any, protocol: interop.Pointer | interop.Reference<SSLProtocol>): number;

declare function SSLGetNumberEnabledCiphers(context: any, numCiphers: interop.Pointer | interop.Reference<number>): number;

declare function SSLGetNumberSupportedCiphers(context: any, numCiphers: interop.Pointer | interop.Reference<number>): number;

declare function SSLGetPeerDomainName(context: any, peerName: string | interop.Pointer | interop.Reference<any>, peerNameLen: interop.Pointer | interop.Reference<number>): number;

declare function SSLGetPeerDomainNameLength(context: any, peerNameLen: interop.Pointer | interop.Reference<number>): number;

declare function SSLGetPeerID(context: any, peerID: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, peerIDLen: interop.Pointer | interop.Reference<number>): number;

declare function SSLGetProtocolVersionMax(context: any, maxVersion: interop.Pointer | interop.Reference<SSLProtocol>): number;

declare function SSLGetProtocolVersionMin(context: any, minVersion: interop.Pointer | interop.Reference<SSLProtocol>): number;

declare function SSLGetSessionOption(context: any, option: SSLSessionOption, value: string | interop.Pointer | interop.Reference<any>): number;

declare function SSLGetSessionState(context: any, state: interop.Pointer | interop.Reference<SSLSessionState>): number;

declare function SSLGetSupportedCiphers(context: any, ciphers: interop.Pointer | interop.Reference<number>, numCiphers: interop.Pointer | interop.Reference<number>): number;

declare function SSLHandshake(context: any): number;

declare const enum SSLProtocol {

	kSSLProtocolUnknown = 0,

	kTLSProtocol1 = 4,

	kTLSProtocol11 = 7,

	kTLSProtocol12 = 8,

	kDTLSProtocol1 = 9,

	kTLSProtocol13 = 10,

	kDTLSProtocol12 = 11,

	kTLSProtocolMaxSupported = 999,

	kSSLProtocol2 = 1,

	kSSLProtocol3 = 2,

	kSSLProtocol3Only = 3,

	kTLSProtocol1Only = 5,

	kSSLProtocolAll = 6
}

declare const enum SSLProtocolSide {

	kSSLServerSide = 0,

	kSSLClientSide = 1
}

declare function SSLReHandshake(context: any): number;

declare function SSLRead(context: any, data: interop.Pointer | interop.Reference<any>, dataLength: number, processed: interop.Pointer | interop.Reference<number>): number;

declare const enum SSLSessionOption {

	kSSLSessionOptionBreakOnServerAuth = 0,

	kSSLSessionOptionBreakOnCertRequested = 1,

	kSSLSessionOptionBreakOnClientAuth = 2,

	kSSLSessionOptionFalseStart = 3,

	kSSLSessionOptionSendOneByteRecord = 4,

	kSSLSessionOptionAllowServerIdentityChange = 5,

	kSSLSessionOptionFallback = 6,

	kSSLSessionOptionBreakOnClientHello = 7,

	kSSLSessionOptionAllowRenegotiation = 8,

	kSSLSessionOptionEnableSessionTickets = 9
}

declare const enum SSLSessionState {

	kSSLIdle = 0,

	kSSLHandshake = 1,

	kSSLConnected = 2,

	kSSLClosed = 3,

	kSSLAborted = 4
}

declare function SSLSetALPNProtocols(context: any, protocols: NSArray<any> | any[]): number;

declare function SSLSetCertificate(context: any, certRefs: NSArray<any> | any[]): number;

declare function SSLSetClientSideAuthenticate(context: any, auth: SSLAuthenticate): number;

declare function SSLSetConnection(context: any, connection: interop.Pointer | interop.Reference<any>): number;

declare function SSLSetDatagramHelloCookie(dtlsContext: any, cookie: interop.Pointer | interop.Reference<any>, cookieLen: number): number;

declare function SSLSetEnabledCiphers(context: any, ciphers: interop.Pointer | interop.Reference<number>, numCiphers: number): number;

declare function SSLSetEncryptionCertificate(context: any, certRefs: NSArray<any> | any[]): number;

declare function SSLSetError(context: any, status: number): number;

declare function SSLSetIOFuncs(context: any, readFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<number>) => number>, writeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<number>) => number>): number;

declare function SSLSetMaxDatagramRecordSize(dtlsContext: any, maxSize: number): number;

declare function SSLSetOCSPResponse(context: any, response: NSData): number;

declare function SSLSetPeerDomainName(context: any, peerName: string | interop.Pointer | interop.Reference<any>, peerNameLen: number): number;

declare function SSLSetPeerID(context: any, peerID: interop.Pointer | interop.Reference<any>, peerIDLen: number): number;

declare function SSLSetProtocolVersionMax(context: any, maxVersion: SSLProtocol): number;

declare function SSLSetProtocolVersionMin(context: any, minVersion: SSLProtocol): number;

declare function SSLSetSessionConfig(context: any, config: string): number;

declare function SSLSetSessionOption(context: any, option: SSLSessionOption, value: boolean): number;

declare function SSLSetSessionTicketsEnabled(context: any, enabled: boolean): number;

declare function SSLWrite(context: any, data: interop.Pointer | interop.Reference<any>, dataLength: number, processed: interop.Pointer | interop.Reference<number>): number;

declare const SSL_DHE_DSS_EXPORT_WITH_DES40_CBC_SHA: number;

declare const SSL_DHE_DSS_WITH_3DES_EDE_CBC_SHA: number;

declare const SSL_DHE_DSS_WITH_DES_CBC_SHA: number;

declare const SSL_DHE_RSA_EXPORT_WITH_DES40_CBC_SHA: number;

declare const SSL_DHE_RSA_WITH_3DES_EDE_CBC_SHA: number;

declare const SSL_DHE_RSA_WITH_DES_CBC_SHA: number;

declare const SSL_DH_DSS_EXPORT_WITH_DES40_CBC_SHA: number;

declare const SSL_DH_DSS_WITH_3DES_EDE_CBC_SHA: number;

declare const SSL_DH_DSS_WITH_DES_CBC_SHA: number;

declare const SSL_DH_RSA_EXPORT_WITH_DES40_CBC_SHA: number;

declare const SSL_DH_RSA_WITH_3DES_EDE_CBC_SHA: number;

declare const SSL_DH_RSA_WITH_DES_CBC_SHA: number;

declare const SSL_DH_anon_EXPORT_WITH_DES40_CBC_SHA: number;

declare const SSL_DH_anon_EXPORT_WITH_RC4_40_MD5: number;

declare const SSL_DH_anon_WITH_3DES_EDE_CBC_SHA: number;

declare const SSL_DH_anon_WITH_DES_CBC_SHA: number;

declare const SSL_DH_anon_WITH_RC4_128_MD5: number;

declare const SSL_FORTEZZA_DMS_WITH_FORTEZZA_CBC_SHA: number;

declare const SSL_FORTEZZA_DMS_WITH_NULL_SHA: number;

declare const SSL_NO_SUCH_CIPHERSUITE: number;

declare const SSL_NULL_WITH_NULL_NULL: number;

declare const SSL_RSA_EXPORT_WITH_DES40_CBC_SHA: number;

declare const SSL_RSA_EXPORT_WITH_RC2_CBC_40_MD5: number;

declare const SSL_RSA_EXPORT_WITH_RC4_40_MD5: number;

declare const SSL_RSA_WITH_3DES_EDE_CBC_MD5: number;

declare const SSL_RSA_WITH_3DES_EDE_CBC_SHA: number;

declare const SSL_RSA_WITH_DES_CBC_MD5: number;

declare const SSL_RSA_WITH_DES_CBC_SHA: number;

declare const SSL_RSA_WITH_IDEA_CBC_MD5: number;

declare const SSL_RSA_WITH_IDEA_CBC_SHA: number;

declare const SSL_RSA_WITH_NULL_MD5: number;

declare const SSL_RSA_WITH_NULL_SHA: number;

declare const SSL_RSA_WITH_RC2_CBC_MD5: number;

declare const SSL_RSA_WITH_RC4_128_MD5: number;

declare const SSL_RSA_WITH_RC4_128_SHA: number;

declare const enum SecAccessControlCreateFlags {

	kSecAccessControlUserPresence = 1,

	kSecAccessControlBiometryAny = 2,

	kSecAccessControlTouchIDAny = 2,

	kSecAccessControlBiometryCurrentSet = 8,

	kSecAccessControlTouchIDCurrentSet = 8,

	kSecAccessControlDevicePasscode = 16,

	kSecAccessControlWatch = 32,

	kSecAccessControlOr = 16384,

	kSecAccessControlAnd = 32768,

	kSecAccessControlPrivateKeyUsage = 1073741824,

	kSecAccessControlApplicationPassword = 2147483648
}

declare function SecAccessControlCreateWithFlags(allocator: any, protection: any, flags: SecAccessControlCreateFlags, error: interop.Pointer | interop.Reference<NSError>): any;

declare function SecAccessControlGetTypeID(): number;

declare function SecAddSharedWebCredential(fqdn: string, account: string, password: string, completionHandler: (p1: NSError) => void): void;

declare function SecCertificateCopyCommonName(certificate: any, commonName: interop.Pointer | interop.Reference<string>): number;

declare function SecCertificateCopyData(certificate: any): NSData;

declare function SecCertificateCopyEmailAddresses(certificate: any, emailAddresses: interop.Pointer | interop.Reference<NSArray<any>>): number;

declare function SecCertificateCopyKey(certificate: any): any;

declare function SecCertificateCopyNormalizedIssuerSequence(certificate: any): NSData;

declare function SecCertificateCopyNormalizedSubjectSequence(certificate: any): NSData;

declare function SecCertificateCopyPublicKey(certificate: any): any;

declare function SecCertificateCopySerialNumber(certificate: any): NSData;

declare function SecCertificateCopySerialNumberData(certificate: any, error: interop.Pointer | interop.Reference<NSError>): NSData;

declare function SecCertificateCopySubjectSummary(certificate: any): string;

declare function SecCertificateCreateWithData(allocator: any, data: NSData): any;

declare function SecCertificateGetTypeID(): number;

declare function SecCopyErrorMessageString(status: number, reserved: interop.Pointer | interop.Reference<any>): string;

declare function SecCreateSharedWebCredentialPassword(): string;

declare function SecIdentityCopyCertificate(identityRef: any, certificateRef: interop.Pointer | interop.Reference<any>): number;

declare function SecIdentityCopyPrivateKey(identityRef: any, privateKeyRef: interop.Pointer | interop.Reference<any>): number;

declare function SecIdentityGetTypeID(): number;

declare function SecItemAdd(attributes: NSDictionary<any, any>, result: interop.Pointer | interop.Reference<any>): number;

declare function SecItemCopyMatching(query: NSDictionary<any, any>, result: interop.Pointer | interop.Reference<any>): number;

declare function SecItemDelete(query: NSDictionary<any, any>): number;

declare function SecItemUpdate(query: NSDictionary<any, any>, attributesToUpdate: NSDictionary<any, any>): number;

declare function SecKeyCopyAttributes(key: any): NSDictionary<any, any>;

declare function SecKeyCopyExternalRepresentation(key: any, error: interop.Pointer | interop.Reference<NSError>): NSData;

declare function SecKeyCopyKeyExchangeResult(privateKey: any, algorithm: any, publicKey: any, parameters: NSDictionary<any, any>, error: interop.Pointer | interop.Reference<NSError>): NSData;

declare function SecKeyCopyPublicKey(key: any): any;

declare function SecKeyCreateDecryptedData(key: any, algorithm: any, ciphertext: NSData, error: interop.Pointer | interop.Reference<NSError>): NSData;

declare function SecKeyCreateEncryptedData(key: any, algorithm: any, plaintext: NSData, error: interop.Pointer | interop.Reference<NSError>): NSData;

declare function SecKeyCreateRandomKey(parameters: NSDictionary<any, any>, error: interop.Pointer | interop.Reference<NSError>): any;

declare function SecKeyCreateSignature(key: any, algorithm: any, dataToSign: NSData, error: interop.Pointer | interop.Reference<NSError>): NSData;

declare function SecKeyCreateWithData(keyData: NSData, attributes: NSDictionary<any, any>, error: interop.Pointer | interop.Reference<NSError>): any;

declare function SecKeyDecrypt(key: any, padding: SecPadding, cipherText: string | interop.Pointer | interop.Reference<any>, cipherTextLen: number, plainText: string | interop.Pointer | interop.Reference<any>, plainTextLen: interop.Pointer | interop.Reference<number>): number;

declare function SecKeyEncrypt(key: any, padding: SecPadding, plainText: string | interop.Pointer | interop.Reference<any>, plainTextLen: number, cipherText: string | interop.Pointer | interop.Reference<any>, cipherTextLen: interop.Pointer | interop.Reference<number>): number;

declare function SecKeyGeneratePair(parameters: NSDictionary<any, any>, publicKey: interop.Pointer | interop.Reference<any>, privateKey: interop.Pointer | interop.Reference<any>): number;

declare function SecKeyGetBlockSize(key: any): number;

declare function SecKeyGetTypeID(): number;

declare function SecKeyIsAlgorithmSupported(key: any, operation: SecKeyOperationType, algorithm: any): boolean;

declare const enum SecKeyOperationType {

	kSecKeyOperationTypeSign = 0,

	kSecKeyOperationTypeVerify = 1,

	kSecKeyOperationTypeEncrypt = 2,

	kSecKeyOperationTypeDecrypt = 3,

	kSecKeyOperationTypeKeyExchange = 4
}

declare function SecKeyRawSign(key: any, padding: SecPadding, dataToSign: string | interop.Pointer | interop.Reference<any>, dataToSignLen: number, sig: string | interop.Pointer | interop.Reference<any>, sigLen: interop.Pointer | interop.Reference<number>): number;

declare function SecKeyRawVerify(key: any, padding: SecPadding, signedData: string | interop.Pointer | interop.Reference<any>, signedDataLen: number, sig: string | interop.Pointer | interop.Reference<any>, sigLen: number): number;

declare function SecKeyVerifySignature(key: any, algorithm: any, signedData: NSData, signature: NSData, error: interop.Pointer | interop.Reference<NSError>): boolean;

declare function SecPKCS12Import(pkcs12_data: NSData, options: NSDictionary<any, any>, items: interop.Pointer | interop.Reference<NSArray<any>>): number;

declare const enum SecPadding {

	kSecPaddingNone = 0,

	kSecPaddingPKCS1 = 1,

	kSecPaddingOAEP = 2,

	kSecPaddingSigRaw = 16384,

	kSecPaddingPKCS1MD2 = 32768,

	kSecPaddingPKCS1MD5 = 32769,

	kSecPaddingPKCS1SHA1 = 32770,

	kSecPaddingPKCS1SHA224 = 32771,

	kSecPaddingPKCS1SHA256 = 32772,

	kSecPaddingPKCS1SHA384 = 32773,

	kSecPaddingPKCS1SHA512 = 32774
}

declare function SecPolicyCopyProperties(policyRef: any): NSDictionary<any, any>;

declare function SecPolicyCreateBasicX509(): any;

declare function SecPolicyCreateRevocation(revocationFlags: number): any;

declare function SecPolicyCreateSSL(server: boolean, hostname: string): any;

declare function SecPolicyCreateWithProperties(policyIdentifier: any, properties: NSDictionary<any, any>): any;

declare function SecPolicyGetTypeID(): number;

declare function SecRandomCopyBytes(rnd: interop.Pointer | interop.Reference<any>, count: number, bytes: interop.Pointer | interop.Reference<any>): number;

declare function SecRequestSharedWebCredential(fqdn: string, account: string, completionHandler: (p1: NSArray<any>, p2: NSError) => void): void;

declare function SecTrustCopyCustomAnchorCertificates(trust: any, anchors: interop.Pointer | interop.Reference<NSArray<any>>): number;

declare function SecTrustCopyExceptions(trust: any): NSData;

declare function SecTrustCopyPolicies(trust: any, policies: interop.Pointer | interop.Reference<NSArray<any>>): number;

declare function SecTrustCopyProperties(trust: any): NSArray<any>;

declare function SecTrustCopyPublicKey(trust: any): any;

declare function SecTrustCopyResult(trust: any): NSDictionary<any, any>;

declare function SecTrustCreateWithCertificates(certificates: any, policies: any, trust: interop.Pointer | interop.Reference<any>): number;

declare function SecTrustEvaluate(trust: any, result: interop.Pointer | interop.Reference<SecTrustResultType>): number;

declare function SecTrustEvaluateAsync(trust: any, queue: NSObject, result: (p1: any, p2: SecTrustResultType) => void): number;

declare function SecTrustEvaluateAsyncWithError(trust: any, queue: NSObject, result: (p1: any, p2: boolean, p3: NSError) => void): number;

declare function SecTrustEvaluateWithError(trust: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

declare function SecTrustGetCertificateAtIndex(trust: any, ix: number): any;

declare function SecTrustGetCertificateCount(trust: any): number;

declare function SecTrustGetNetworkFetchAllowed(trust: any, allowFetch: string | interop.Pointer | interop.Reference<any>): number;

declare function SecTrustGetTrustResult(trust: any, result: interop.Pointer | interop.Reference<SecTrustResultType>): number;

declare function SecTrustGetTypeID(): number;

declare function SecTrustGetVerifyTime(trust: any): number;

declare const enum SecTrustResultType {

	kSecTrustResultInvalid = 0,

	kSecTrustResultProceed = 1,

	kSecTrustResultConfirm = 2,

	kSecTrustResultDeny = 3,

	kSecTrustResultUnspecified = 4,

	kSecTrustResultRecoverableTrustFailure = 5,

	kSecTrustResultFatalTrustFailure = 6,

	kSecTrustResultOtherError = 7
}

declare function SecTrustSetAnchorCertificates(trust: any, anchorCertificates: NSArray<any> | any[]): number;

declare function SecTrustSetAnchorCertificatesOnly(trust: any, anchorCertificatesOnly: boolean): number;

declare function SecTrustSetExceptions(trust: any, exceptions: NSData): boolean;

declare function SecTrustSetNetworkFetchAllowed(trust: any, allowFetch: boolean): number;

declare function SecTrustSetOCSPResponse(trust: any, responseData: any): number;

declare function SecTrustSetPolicies(trust: any, policies: any): number;

declare function SecTrustSetSignedCertificateTimestamps(trust: any, sctArray: NSArray<any> | any[]): number;

declare function SecTrustSetVerifyDate(trust: any, verifyDate: Date): number;

declare const TLS_AES_128_CCM_8_SHA256: number;

declare const TLS_AES_128_CCM_SHA256: number;

declare const TLS_AES_128_GCM_SHA256: number;

declare const TLS_AES_256_GCM_SHA384: number;

declare const TLS_CHACHA20_POLY1305_SHA256: number;

declare const TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_DHE_DSS_WITH_AES_128_CBC_SHA: number;

declare const TLS_DHE_DSS_WITH_AES_128_CBC_SHA256: number;

declare const TLS_DHE_DSS_WITH_AES_128_GCM_SHA256: number;

declare const TLS_DHE_DSS_WITH_AES_256_CBC_SHA: number;

declare const TLS_DHE_DSS_WITH_AES_256_CBC_SHA256: number;

declare const TLS_DHE_DSS_WITH_AES_256_GCM_SHA384: number;

declare const TLS_DHE_PSK_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_DHE_PSK_WITH_AES_128_CBC_SHA: number;

declare const TLS_DHE_PSK_WITH_AES_128_CBC_SHA256: number;

declare const TLS_DHE_PSK_WITH_AES_128_GCM_SHA256: number;

declare const TLS_DHE_PSK_WITH_AES_256_CBC_SHA: number;

declare const TLS_DHE_PSK_WITH_AES_256_CBC_SHA384: number;

declare const TLS_DHE_PSK_WITH_AES_256_GCM_SHA384: number;

declare const TLS_DHE_PSK_WITH_NULL_SHA: number;

declare const TLS_DHE_PSK_WITH_NULL_SHA256: number;

declare const TLS_DHE_PSK_WITH_NULL_SHA384: number;

declare const TLS_DHE_PSK_WITH_RC4_128_SHA: number;

declare const TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_DHE_RSA_WITH_AES_128_CBC_SHA: number;

declare const TLS_DHE_RSA_WITH_AES_128_CBC_SHA256: number;

declare const TLS_DHE_RSA_WITH_AES_128_GCM_SHA256: number;

declare const TLS_DHE_RSA_WITH_AES_256_CBC_SHA: number;

declare const TLS_DHE_RSA_WITH_AES_256_CBC_SHA256: number;

declare const TLS_DHE_RSA_WITH_AES_256_GCM_SHA384: number;

declare const TLS_DH_DSS_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_DH_DSS_WITH_AES_128_CBC_SHA: number;

declare const TLS_DH_DSS_WITH_AES_128_CBC_SHA256: number;

declare const TLS_DH_DSS_WITH_AES_128_GCM_SHA256: number;

declare const TLS_DH_DSS_WITH_AES_256_CBC_SHA: number;

declare const TLS_DH_DSS_WITH_AES_256_CBC_SHA256: number;

declare const TLS_DH_DSS_WITH_AES_256_GCM_SHA384: number;

declare const TLS_DH_RSA_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_DH_RSA_WITH_AES_128_CBC_SHA: number;

declare const TLS_DH_RSA_WITH_AES_128_CBC_SHA256: number;

declare const TLS_DH_RSA_WITH_AES_128_GCM_SHA256: number;

declare const TLS_DH_RSA_WITH_AES_256_CBC_SHA: number;

declare const TLS_DH_RSA_WITH_AES_256_CBC_SHA256: number;

declare const TLS_DH_RSA_WITH_AES_256_GCM_SHA384: number;

declare const TLS_DH_anon_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_DH_anon_WITH_AES_128_CBC_SHA: number;

declare const TLS_DH_anon_WITH_AES_128_CBC_SHA256: number;

declare const TLS_DH_anon_WITH_AES_128_GCM_SHA256: number;

declare const TLS_DH_anon_WITH_AES_256_CBC_SHA: number;

declare const TLS_DH_anon_WITH_AES_256_CBC_SHA256: number;

declare const TLS_DH_anon_WITH_AES_256_GCM_SHA384: number;

declare const TLS_DH_anon_WITH_RC4_128_MD5: number;

declare const TLS_ECDHE_ECDSA_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA: number;

declare const TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256: number;

declare const TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256: number;

declare const TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA: number;

declare const TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384: number;

declare const TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384: number;

declare const TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256: number;

declare const TLS_ECDHE_ECDSA_WITH_NULL_SHA: number;

declare const TLS_ECDHE_ECDSA_WITH_RC4_128_SHA: number;

declare const TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA: number;

declare const TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA: number;

declare const TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA: number;

declare const TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256: number;

declare const TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256: number;

declare const TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA: number;

declare const TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384: number;

declare const TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384: number;

declare const TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256: number;

declare const TLS_ECDHE_RSA_WITH_NULL_SHA: number;

declare const TLS_ECDHE_RSA_WITH_RC4_128_SHA: number;

declare const TLS_ECDH_ECDSA_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA: number;

declare const TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA256: number;

declare const TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256: number;

declare const TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA: number;

declare const TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA384: number;

declare const TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384: number;

declare const TLS_ECDH_ECDSA_WITH_NULL_SHA: number;

declare const TLS_ECDH_ECDSA_WITH_RC4_128_SHA: number;

declare const TLS_ECDH_RSA_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_ECDH_RSA_WITH_AES_128_CBC_SHA: number;

declare const TLS_ECDH_RSA_WITH_AES_128_CBC_SHA256: number;

declare const TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256: number;

declare const TLS_ECDH_RSA_WITH_AES_256_CBC_SHA: number;

declare const TLS_ECDH_RSA_WITH_AES_256_CBC_SHA384: number;

declare const TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384: number;

declare const TLS_ECDH_RSA_WITH_NULL_SHA: number;

declare const TLS_ECDH_RSA_WITH_RC4_128_SHA: number;

declare const TLS_ECDH_anon_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_ECDH_anon_WITH_AES_128_CBC_SHA: number;

declare const TLS_ECDH_anon_WITH_AES_256_CBC_SHA: number;

declare const TLS_ECDH_anon_WITH_NULL_SHA: number;

declare const TLS_ECDH_anon_WITH_RC4_128_SHA: number;

declare const TLS_EMPTY_RENEGOTIATION_INFO_SCSV: number;

declare const TLS_NULL_WITH_NULL_NULL: number;

declare const TLS_PSK_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_PSK_WITH_AES_128_CBC_SHA: number;

declare const TLS_PSK_WITH_AES_128_CBC_SHA256: number;

declare const TLS_PSK_WITH_AES_128_GCM_SHA256: number;

declare const TLS_PSK_WITH_AES_256_CBC_SHA: number;

declare const TLS_PSK_WITH_AES_256_CBC_SHA384: number;

declare const TLS_PSK_WITH_AES_256_GCM_SHA384: number;

declare const TLS_PSK_WITH_CHACHA20_POLY1305_SHA256: number;

declare const TLS_PSK_WITH_NULL_SHA: number;

declare const TLS_PSK_WITH_NULL_SHA256: number;

declare const TLS_PSK_WITH_NULL_SHA384: number;

declare const TLS_PSK_WITH_RC4_128_SHA: number;

declare const TLS_RSA_PSK_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_RSA_PSK_WITH_AES_128_CBC_SHA: number;

declare const TLS_RSA_PSK_WITH_AES_128_CBC_SHA256: number;

declare const TLS_RSA_PSK_WITH_AES_128_GCM_SHA256: number;

declare const TLS_RSA_PSK_WITH_AES_256_CBC_SHA: number;

declare const TLS_RSA_PSK_WITH_AES_256_CBC_SHA384: number;

declare const TLS_RSA_PSK_WITH_AES_256_GCM_SHA384: number;

declare const TLS_RSA_PSK_WITH_NULL_SHA: number;

declare const TLS_RSA_PSK_WITH_NULL_SHA256: number;

declare const TLS_RSA_PSK_WITH_NULL_SHA384: number;

declare const TLS_RSA_PSK_WITH_RC4_128_SHA: number;

declare const TLS_RSA_WITH_3DES_EDE_CBC_SHA: number;

declare const TLS_RSA_WITH_AES_128_CBC_SHA: number;

declare const TLS_RSA_WITH_AES_128_CBC_SHA256: number;

declare const TLS_RSA_WITH_AES_128_GCM_SHA256: number;

declare const TLS_RSA_WITH_AES_256_CBC_SHA: number;

declare const TLS_RSA_WITH_AES_256_CBC_SHA256: number;

declare const TLS_RSA_WITH_AES_256_GCM_SHA384: number;

declare const TLS_RSA_WITH_NULL_MD5: number;

declare const TLS_RSA_WITH_NULL_SHA: number;

declare const TLS_RSA_WITH_NULL_SHA256: number;

declare const TLS_RSA_WITH_RC4_128_MD5: number;

declare const TLS_RSA_WITH_RC4_128_SHA: number;

declare const errSSLATSCertificateHashAlgorithmViolation: number;

declare const errSSLATSCertificateTrustViolation: number;

declare const errSSLATSCiphersuiteViolation: number;

declare const errSSLATSLeafCertificateHashAlgorithmViolation: number;

declare const errSSLATSMinimumKeySizeViolation: number;

declare const errSSLATSMinimumVersionViolation: number;

declare const errSSLATSViolation: number;

declare const errSSLBadCert: number;

declare const errSSLBadCertificateStatusResponse: number;

declare const errSSLBadCipherSuite: number;

declare const errSSLBadConfiguration: number;

declare const errSSLBadRecordMac: number;

declare const errSSLBufferOverflow: number;

declare const errSSLCertExpired: number;

declare const errSSLCertNotYetValid: number;

declare const errSSLCertificateRequired: number;

declare const errSSLClientCertRequested: number;

declare const errSSLClientHelloReceived: number;

declare const errSSLClosedAbort: number;

declare const errSSLClosedGraceful: number;

declare const errSSLClosedNoNotify: number;

declare const errSSLConfigurationFailed: number;

declare const errSSLConnectionRefused: number;

declare const errSSLCrypto: number;

declare const errSSLDecodeError: number;

declare const errSSLDecompressFail: number;

declare const errSSLDecryptionFail: number;

declare const errSSLFatalAlert: number;

declare const errSSLHandshakeFail: number;

declare const errSSLHostNameMismatch: number;

declare const errSSLIllegalParam: number;

declare const errSSLInappropriateFallback: number;

declare const errSSLInternal: number;

declare const errSSLMissingExtension: number;

declare const errSSLModuleAttach: number;

declare const errSSLNegotiation: number;

declare const errSSLNetworkTimeout: number;

declare const errSSLNoRootCert: number;

declare const errSSLPeerAccessDenied: number;

declare const errSSLPeerAuthCompleted: number;

declare const errSSLPeerBadCert: number;

declare const errSSLPeerBadRecordMac: number;

declare const errSSLPeerCertExpired: number;

declare const errSSLPeerCertRevoked: number;

declare const errSSLPeerCertUnknown: number;

declare const errSSLPeerDecodeError: number;

declare const errSSLPeerDecompressFail: number;

declare const errSSLPeerDecryptError: number;

declare const errSSLPeerDecryptionFail: number;

declare const errSSLPeerExportRestriction: number;

declare const errSSLPeerHandshakeFail: number;

declare const errSSLPeerInsufficientSecurity: number;

declare const errSSLPeerInternalError: number;

declare const errSSLPeerNoRenegotiation: number;

declare const errSSLPeerProtocolVersion: number;

declare const errSSLPeerRecordOverflow: number;

declare const errSSLPeerUnexpectedMsg: number;

declare const errSSLPeerUnknownCA: number;

declare const errSSLPeerUnsupportedCert: number;

declare const errSSLPeerUserCancelled: number;

declare const errSSLProtocol: number;

declare const errSSLRecordOverflow: number;

declare const errSSLSessionNotFound: number;

declare const errSSLTransportReset: number;

declare const errSSLUnexpectedMessage: number;

declare const errSSLUnexpectedRecord: number;

declare const errSSLUnknownPSKIdentity: number;

declare const errSSLUnknownRootCert: number;

declare const errSSLUnrecognizedName: number;

declare const errSSLUnsupportedExtension: number;

declare const errSSLWeakPeerEphemeralDHKey: number;

declare const errSSLWouldBlock: number;

declare const errSSLXCertChainInvalid: number;

declare const errSecACLAddFailed: number;

declare const errSecACLChangeFailed: number;

declare const errSecACLDeleteFailed: number;

declare const errSecACLNotSimple: number;

declare const errSecACLReplaceFailed: number;

declare const errSecAddinLoadFailed: number;

declare const errSecAddinUnloadFailed: number;

declare const errSecAlgorithmMismatch: number;

declare const errSecAllocate: number;

declare const errSecAlreadyLoggedIn: number;

declare const errSecAppleAddAppACLSubject: number;

declare const errSecAppleInvalidKeyEndDate: number;

declare const errSecAppleInvalidKeyStartDate: number;

declare const errSecApplePublicKeyIncomplete: number;

declare const errSecAppleSSLv2Rollback: number;

declare const errSecAppleSignatureMismatch: number;

declare const errSecAttachHandleBusy: number;

declare const errSecAttributeNotInContext: number;

declare const errSecAuthFailed: number;

declare const errSecBadReq: number;

declare const errSecBlockSizeMismatch: number;

declare const errSecBufferTooSmall: number;

declare const errSecCRLAlreadySigned: number;

declare const errSecCRLBadURI: number;

declare const errSecCRLExpired: number;

declare const errSecCRLNotFound: number;

declare const errSecCRLNotTrusted: number;

declare const errSecCRLNotValidYet: number;

declare const errSecCRLPolicyFailed: number;

declare const errSecCRLServerDown: number;

declare const errSecCallbackFailed: number;

declare const errSecCertificateCannotOperate: number;

declare const errSecCertificateExpired: number;

declare const errSecCertificateNameNotAllowed: number;

declare const errSecCertificateNotValidYet: number;

declare const errSecCertificatePolicyNotAllowed: number;

declare const errSecCertificateRevoked: number;

declare const errSecCertificateSuspended: number;

declare const errSecCertificateValidityPeriodTooLong: number;

declare const errSecCodeSigningBadCertChainLength: number;

declare const errSecCodeSigningBadPathLengthConstraint: number;

declare const errSecCodeSigningDevelopment: number;

declare const errSecCodeSigningNoBasicConstraints: number;

declare const errSecCodeSigningNoExtendedKeyUsage: number;

declare const errSecConversionError: number;

declare const errSecCoreFoundationUnknown: number;

declare const errSecCreateChainFailed: number;

declare const errSecDataNotAvailable: number;

declare const errSecDataNotModifiable: number;

declare const errSecDataTooLarge: number;

declare const errSecDatabaseLocked: number;

declare const errSecDatastoreIsOpen: number;

declare const errSecDecode: number;

declare const errSecDeviceError: number;

declare const errSecDeviceFailed: number;

declare const errSecDeviceReset: number;

declare const errSecDeviceVerifyFailed: number;

declare const errSecDiskFull: number;

declare const errSecDskFull: number;

declare const errSecDuplicateCallback: number;

declare const errSecDuplicateItem: number;

declare const errSecDuplicateKeychain: number;

declare const errSecEMMLoadFailed: number;

declare const errSecEMMUnloadFailed: number;

declare const errSecEndOfData: number;

declare const errSecEventNotificationCallbackNotFound: number;

declare const errSecExtendedKeyUsageNotCritical: number;

declare const errSecFieldSpecifiedMultiple: number;

declare const errSecFileTooBig: number;

declare const errSecFunctionFailed: number;

declare const errSecFunctionIntegrityFail: number;

declare const errSecHostNameMismatch: number;

declare const errSecIDPFailure: number;

declare const errSecIO: number;

declare const errSecInDarkWake: number;

declare const errSecIncompatibleDatabaseBlob: number;

declare const errSecIncompatibleFieldFormat: number;

declare const errSecIncompatibleKeyBlob: number;

declare const errSecIncompatibleVersion: number;

declare const errSecIncompleteCertRevocationCheck: number;

declare const errSecInputLengthError: number;

declare const errSecInsufficientClientID: number;

declare const errSecInsufficientCredentials: number;

declare const errSecInteractionNotAllowed: number;

declare const errSecInteractionRequired: number;

declare const errSecInternalComponent: number;

declare const errSecInternalError: number;

declare const errSecInvaldCRLAuthority: number;

declare const errSecInvalidACL: number;

declare const errSecInvalidAccessCredentials: number;

declare const errSecInvalidAccessRequest: number;

declare const errSecInvalidAction: number;

declare const errSecInvalidAddinFunctionTable: number;

declare const errSecInvalidAlgorithm: number;

declare const errSecInvalidAlgorithmParms: number;

declare const errSecInvalidAttributeAccessCredentials: number;

declare const errSecInvalidAttributeBase: number;

declare const errSecInvalidAttributeBlockSize: number;

declare const errSecInvalidAttributeDLDBHandle: number;

declare const errSecInvalidAttributeEffectiveBits: number;

declare const errSecInvalidAttributeEndDate: number;

declare const errSecInvalidAttributeInitVector: number;

declare const errSecInvalidAttributeIterationCount: number;

declare const errSecInvalidAttributeKey: number;

declare const errSecInvalidAttributeKeyLength: number;

declare const errSecInvalidAttributeKeyType: number;

declare const errSecInvalidAttributeLabel: number;

declare const errSecInvalidAttributeMode: number;

declare const errSecInvalidAttributeOutputSize: number;

declare const errSecInvalidAttributePadding: number;

declare const errSecInvalidAttributePassphrase: number;

declare const errSecInvalidAttributePrime: number;

declare const errSecInvalidAttributePrivateKeyFormat: number;

declare const errSecInvalidAttributePublicKeyFormat: number;

declare const errSecInvalidAttributeRandom: number;

declare const errSecInvalidAttributeRounds: number;

declare const errSecInvalidAttributeSalt: number;

declare const errSecInvalidAttributeSeed: number;

declare const errSecInvalidAttributeStartDate: number;

declare const errSecInvalidAttributeSubprime: number;

declare const errSecInvalidAttributeSymmetricKeyFormat: number;

declare const errSecInvalidAttributeVersion: number;

declare const errSecInvalidAttributeWrappedKeyFormat: number;

declare const errSecInvalidAuthority: number;

declare const errSecInvalidAuthorityKeyID: number;

declare const errSecInvalidBaseACLs: number;

declare const errSecInvalidBundleInfo: number;

declare const errSecInvalidCRL: number;

declare const errSecInvalidCRLEncoding: number;

declare const errSecInvalidCRLGroup: number;

declare const errSecInvalidCRLIndex: number;

declare const errSecInvalidCRLType: number;

declare const errSecInvalidCallback: number;

declare const errSecInvalidCertAuthority: number;

declare const errSecInvalidCertificateGroup: number;

declare const errSecInvalidCertificateRef: number;

declare const errSecInvalidContext: number;

declare const errSecInvalidDBList: number;

declare const errSecInvalidDBLocation: number;

declare const errSecInvalidData: number;

declare const errSecInvalidDatabaseBlob: number;

declare const errSecInvalidDigestAlgorithm: number;

declare const errSecInvalidEncoding: number;

declare const errSecInvalidExtendedKeyUsage: number;

declare const errSecInvalidFormType: number;

declare const errSecInvalidGUID: number;

declare const errSecInvalidHandle: number;

declare const errSecInvalidHandleUsage: number;

declare const errSecInvalidID: number;

declare const errSecInvalidIDLinkage: number;

declare const errSecInvalidIdentifier: number;

declare const errSecInvalidIndex: number;

declare const errSecInvalidIndexInfo: number;

declare const errSecInvalidInputVector: number;

declare const errSecInvalidItemRef: number;

declare const errSecInvalidKeyAttributeMask: number;

declare const errSecInvalidKeyBlob: number;

declare const errSecInvalidKeyFormat: number;

declare const errSecInvalidKeyHierarchy: number;

declare const errSecInvalidKeyLabel: number;

declare const errSecInvalidKeyRef: number;

declare const errSecInvalidKeyUsageForPolicy: number;

declare const errSecInvalidKeyUsageMask: number;

declare const errSecInvalidKeychain: number;

declare const errSecInvalidLoginName: number;

declare const errSecInvalidModifyMode: number;

declare const errSecInvalidName: number;

declare const errSecInvalidNetworkAddress: number;

declare const errSecInvalidNewOwner: number;

declare const errSecInvalidNumberOfFields: number;

declare const errSecInvalidOutputVector: number;

declare const errSecInvalidOwnerEdit: number;

declare const errSecInvalidPVC: number;

declare const errSecInvalidParsingModule: number;

declare const errSecInvalidPassthroughID: number;

declare const errSecInvalidPasswordRef: number;

declare const errSecInvalidPointer: number;

declare const errSecInvalidPolicyIdentifiers: number;

declare const errSecInvalidPrefsDomain: number;

declare const errSecInvalidQuery: number;

declare const errSecInvalidReason: number;

declare const errSecInvalidRecord: number;

declare const errSecInvalidRequestInputs: number;

declare const errSecInvalidRequestor: number;

declare const errSecInvalidResponseVector: number;

declare const errSecInvalidRoot: number;

declare const errSecInvalidSampleValue: number;

declare const errSecInvalidScope: number;

declare const errSecInvalidSearchRef: number;

declare const errSecInvalidServiceMask: number;

declare const errSecInvalidSignature: number;

declare const errSecInvalidStopOnPolicy: number;

declare const errSecInvalidSubServiceID: number;

declare const errSecInvalidSubjectKeyID: number;

declare const errSecInvalidSubjectName: number;

declare const errSecInvalidTimeString: number;

declare const errSecInvalidTrustSetting: number;

declare const errSecInvalidTrustSettings: number;

declare const errSecInvalidTuple: number;

declare const errSecInvalidTupleCredendtials: number;

declare const errSecInvalidTupleGroup: number;

declare const errSecInvalidValidityPeriod: number;

declare const errSecInvalidValue: number;

declare const errSecItemNotFound: number;

declare const errSecKeyBlobTypeIncorrect: number;

declare const errSecKeyHeaderInconsistent: number;

declare const errSecKeyIsSensitive: number;

declare const errSecKeySizeNotAllowed: number;

declare const errSecKeyUsageIncorrect: number;

declare const errSecLibraryReferenceNotFound: number;

declare const errSecMDSError: number;

declare const errSecMemoryError: number;

declare const errSecMissingAlgorithmParms: number;

declare const errSecMissingAttributeAccessCredentials: number;

declare const errSecMissingAttributeBase: number;

declare const errSecMissingAttributeBlockSize: number;

declare const errSecMissingAttributeDLDBHandle: number;

declare const errSecMissingAttributeEffectiveBits: number;

declare const errSecMissingAttributeEndDate: number;

declare const errSecMissingAttributeInitVector: number;

declare const errSecMissingAttributeIterationCount: number;

declare const errSecMissingAttributeKey: number;

declare const errSecMissingAttributeKeyLength: number;

declare const errSecMissingAttributeKeyType: number;

declare const errSecMissingAttributeLabel: number;

declare const errSecMissingAttributeMode: number;

declare const errSecMissingAttributeOutputSize: number;

declare const errSecMissingAttributePadding: number;

declare const errSecMissingAttributePassphrase: number;

declare const errSecMissingAttributePrime: number;

declare const errSecMissingAttributePrivateKeyFormat: number;

declare const errSecMissingAttributePublicKeyFormat: number;

declare const errSecMissingAttributeRandom: number;

declare const errSecMissingAttributeRounds: number;

declare const errSecMissingAttributeSalt: number;

declare const errSecMissingAttributeSeed: number;

declare const errSecMissingAttributeStartDate: number;

declare const errSecMissingAttributeSubprime: number;

declare const errSecMissingAttributeSymmetricKeyFormat: number;

declare const errSecMissingAttributeVersion: number;

declare const errSecMissingAttributeWrappedKeyFormat: number;

declare const errSecMissingEntitlement: number;

declare const errSecMissingRequiredExtension: number;

declare const errSecMissingValue: number;

declare const errSecMobileMeCSRVerifyFailure: number;

declare const errSecMobileMeFailedConsistencyCheck: number;

declare const errSecMobileMeNoRequestPending: number;

declare const errSecMobileMeRequestAlreadyPending: number;

declare const errSecMobileMeRequestQueued: number;

declare const errSecMobileMeRequestRedirected: number;

declare const errSecMobileMeServerAlreadyExists: number;

declare const errSecMobileMeServerError: number;

declare const errSecMobileMeServerNotAvailable: number;

declare const errSecMobileMeServerServiceErr: number;

declare const errSecModuleManagerInitializeFailed: number;

declare const errSecModuleManagerNotFound: number;

declare const errSecModuleManifestVerifyFailed: number;

declare const errSecModuleNotLoaded: number;

declare const errSecMultiplePrivKeys: number;

declare const errSecMultipleValuesUnsupported: number;

declare const errSecNetworkFailure: number;

declare const errSecNoAccessForItem: number;

declare const errSecNoBasicConstraints: number;

declare const errSecNoBasicConstraintsCA: number;

declare const errSecNoCertificateModule: number;

declare const errSecNoDefaultAuthority: number;

declare const errSecNoDefaultKeychain: number;

declare const errSecNoFieldValues: number;

declare const errSecNoPolicyModule: number;

declare const errSecNoStorageModule: number;

declare const errSecNoSuchAttr: number;

declare const errSecNoSuchClass: number;

declare const errSecNoSuchKeychain: number;

declare const errSecNoTrustSettings: number;

declare const errSecNotAvailable: number;

declare const errSecNotInitialized: number;

declare const errSecNotLoggedIn: number;

declare const errSecNotSigner: number;

declare const errSecNotTrusted: number;

declare const errSecOCSPBadRequest: number;

declare const errSecOCSPBadResponse: number;

declare const errSecOCSPNoSigner: number;

declare const errSecOCSPNotTrustedToAnchor: number;

declare const errSecOCSPResponderInternalError: number;

declare const errSecOCSPResponderMalformedReq: number;

declare const errSecOCSPResponderSignatureRequired: number;

declare const errSecOCSPResponderTryLater: number;

declare const errSecOCSPResponderUnauthorized: number;

declare const errSecOCSPResponseNonceMismatch: number;

declare const errSecOCSPSignatureError: number;

declare const errSecOCSPStatusUnrecognized: number;

declare const errSecOCSPUnavailable: number;

declare const errSecOpWr: number;

declare const errSecOutputLengthError: number;

declare const errSecPVCAlreadyConfigured: number;

declare const errSecPVCReferentNotFound: number;

declare const errSecParam: number;

declare const errSecPassphraseRequired: number;

declare const errSecPathLengthConstraintExceeded: number;

declare const errSecPkcs12VerifyFailure: number;

declare const errSecPolicyNotFound: number;

declare const errSecPrivilegeNotGranted: number;

declare const errSecPrivilegeNotSupported: number;

declare const errSecPublicKeyInconsistent: number;

declare const errSecQuerySizeUnknown: number;

declare const errSecQuotaExceeded: number;

declare const errSecReadOnly: number;

declare const errSecReadOnlyAttr: number;

declare const errSecRecordModified: number;

declare const errSecRejectedForm: number;

declare const errSecRequestDescriptor: number;

declare const errSecRequestLost: number;

declare const errSecRequestRejected: number;

declare const errSecResourceSignBadCertChainLength: number;

declare const errSecResourceSignBadExtKeyUsage: number;

declare const errSecSMIMEBadExtendedKeyUsage: number;

declare const errSecSMIMEBadKeyUsage: number;

declare const errSecSMIMEEmailAddressesNotFound: number;

declare const errSecSMIMEKeyUsageNotCritical: number;

declare const errSecSMIMENoEmailAddress: number;

declare const errSecSMIMESubjAltNameNotCritical: number;

declare const errSecSSLBadExtendedKeyUsage: number;

declare const errSecSelfCheckFailed: number;

declare const errSecServiceNotAvailable: number;

declare const errSecSigningTimeMissing: number;

declare const errSecStagedOperationInProgress: number;

declare const errSecStagedOperationNotStarted: number;

declare const errSecSuccess: number;

declare const errSecTagNotFound: number;

declare const errSecTimestampAddInfoNotAvailable: number;

declare const errSecTimestampBadAlg: number;

declare const errSecTimestampBadDataFormat: number;

declare const errSecTimestampBadRequest: number;

declare const errSecTimestampInvalid: number;

declare const errSecTimestampMissing: number;

declare const errSecTimestampNotTrusted: number;

declare const errSecTimestampRejection: number;

declare const errSecTimestampRevocationNotification: number;

declare const errSecTimestampRevocationWarning: number;

declare const errSecTimestampServiceNotAvailable: number;

declare const errSecTimestampSystemFailure: number;

declare const errSecTimestampTimeNotAvailable: number;

declare const errSecTimestampUnacceptedExtension: number;

declare const errSecTimestampUnacceptedPolicy: number;

declare const errSecTimestampWaiting: number;

declare const errSecTrustNotAvailable: number;

declare const errSecTrustSettingDeny: number;

declare const errSecUnimplemented: number;

declare const errSecUnknownCRLExtension: number;

declare const errSecUnknownCertExtension: number;

declare const errSecUnknownCriticalExtensionFlag: number;

declare const errSecUnknownFormat: number;

declare const errSecUnknownQualifiedCertStatement: number;

declare const errSecUnknownTag: number;

declare const errSecUnsupportedAddressType: number;

declare const errSecUnsupportedFieldFormat: number;

declare const errSecUnsupportedFormat: number;

declare const errSecUnsupportedIndexInfo: number;

declare const errSecUnsupportedKeyAttributeMask: number;

declare const errSecUnsupportedKeyFormat: number;

declare const errSecUnsupportedKeyLabel: number;

declare const errSecUnsupportedKeySize: number;

declare const errSecUnsupportedKeyUsageMask: number;

declare const errSecUnsupportedLocality: number;

declare const errSecUnsupportedNumAttributes: number;

declare const errSecUnsupportedNumIndexes: number;

declare const errSecUnsupportedNumRecordTypes: number;

declare const errSecUnsupportedNumSelectionPreds: number;

declare const errSecUnsupportedOperator: number;

declare const errSecUnsupportedQueryLimits: number;

declare const errSecUnsupportedService: number;

declare const errSecUnsupportedVectorOfBuffers: number;

declare const errSecUserCanceled: number;

declare const errSecVerificationFailure: number;

declare const errSecVerifyActionFailed: number;

declare const errSecVerifyFailed: number;

declare const errSecWrPerm: number;

declare const errSecWrongSecVersion: number;

declare var kSSLSessionConfig_3DES_fallback: string;

declare var kSSLSessionConfig_ATSv1: string;

declare var kSSLSessionConfig_ATSv1_noPFS: string;

declare var kSSLSessionConfig_RC4_fallback: string;

declare var kSSLSessionConfig_TLSv1_3DES_fallback: string;

declare var kSSLSessionConfig_TLSv1_RC4_fallback: string;

declare var kSSLSessionConfig_TLSv1_fallback: string;

declare var kSSLSessionConfig_anonymous: string;

declare var kSSLSessionConfig_default: string;

declare var kSSLSessionConfig_legacy: string;

declare var kSSLSessionConfig_legacy_DHE: string;

declare var kSSLSessionConfig_standard: string;

declare var kSecAttrAccessControl: string;

declare var kSecAttrAccessGroup: string;

declare var kSecAttrAccessGroupToken: string;

declare var kSecAttrAccessible: string;

declare var kSecAttrAccessibleAfterFirstUnlock: string;

declare var kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly: string;

declare var kSecAttrAccessibleAlways: string;

declare var kSecAttrAccessibleAlwaysThisDeviceOnly: string;

declare var kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly: string;

declare var kSecAttrAccessibleWhenUnlocked: string;

declare var kSecAttrAccessibleWhenUnlockedThisDeviceOnly: string;

declare var kSecAttrAccount: string;

declare var kSecAttrApplicationLabel: string;

declare var kSecAttrApplicationTag: string;

declare var kSecAttrAuthenticationType: string;

declare var kSecAttrAuthenticationTypeDPA: string;

declare var kSecAttrAuthenticationTypeDefault: string;

declare var kSecAttrAuthenticationTypeHTMLForm: string;

declare var kSecAttrAuthenticationTypeHTTPBasic: string;

declare var kSecAttrAuthenticationTypeHTTPDigest: string;

declare var kSecAttrAuthenticationTypeMSN: string;

declare var kSecAttrAuthenticationTypeNTLM: string;

declare var kSecAttrAuthenticationTypeRPA: string;

declare var kSecAttrCanDecrypt: string;

declare var kSecAttrCanDerive: string;

declare var kSecAttrCanEncrypt: string;

declare var kSecAttrCanSign: string;

declare var kSecAttrCanUnwrap: string;

declare var kSecAttrCanVerify: string;

declare var kSecAttrCanWrap: string;

declare var kSecAttrCertificateEncoding: string;

declare var kSecAttrCertificateType: string;

declare var kSecAttrComment: string;

declare var kSecAttrCreationDate: string;

declare var kSecAttrCreator: string;

declare var kSecAttrDescription: string;

declare var kSecAttrEffectiveKeySize: string;

declare var kSecAttrGeneric: string;

declare var kSecAttrIsExtractable: string;

declare var kSecAttrIsInvisible: string;

declare var kSecAttrIsNegative: string;

declare var kSecAttrIsPermanent: string;

declare var kSecAttrIsSensitive: string;

declare var kSecAttrIssuer: string;

declare var kSecAttrKeyClass: string;

declare var kSecAttrKeyClassPrivate: string;

declare var kSecAttrKeyClassPublic: string;

declare var kSecAttrKeyClassSymmetric: string;

declare var kSecAttrKeySizeInBits: string;

declare var kSecAttrKeyType: string;

declare var kSecAttrKeyTypeEC: string;

declare var kSecAttrKeyTypeECSECPrimeRandom: string;

declare var kSecAttrKeyTypeRSA: string;

declare var kSecAttrLabel: string;

declare var kSecAttrModificationDate: string;

declare var kSecAttrPath: string;

declare var kSecAttrPersistantReference: string;

declare var kSecAttrPersistentReference: string;

declare var kSecAttrPort: string;

declare var kSecAttrProtocol: string;

declare var kSecAttrProtocolAFP: string;

declare var kSecAttrProtocolAppleTalk: string;

declare var kSecAttrProtocolDAAP: string;

declare var kSecAttrProtocolEPPC: string;

declare var kSecAttrProtocolFTP: string;

declare var kSecAttrProtocolFTPAccount: string;

declare var kSecAttrProtocolFTPProxy: string;

declare var kSecAttrProtocolFTPS: string;

declare var kSecAttrProtocolHTTP: string;

declare var kSecAttrProtocolHTTPProxy: string;

declare var kSecAttrProtocolHTTPS: string;

declare var kSecAttrProtocolHTTPSProxy: string;

declare var kSecAttrProtocolIMAP: string;

declare var kSecAttrProtocolIMAPS: string;

declare var kSecAttrProtocolIPP: string;

declare var kSecAttrProtocolIRC: string;

declare var kSecAttrProtocolIRCS: string;

declare var kSecAttrProtocolLDAP: string;

declare var kSecAttrProtocolLDAPS: string;

declare var kSecAttrProtocolNNTP: string;

declare var kSecAttrProtocolNNTPS: string;

declare var kSecAttrProtocolPOP3: string;

declare var kSecAttrProtocolPOP3S: string;

declare var kSecAttrProtocolRTSP: string;

declare var kSecAttrProtocolRTSPProxy: string;

declare var kSecAttrProtocolSMB: string;

declare var kSecAttrProtocolSMTP: string;

declare var kSecAttrProtocolSOCKS: string;

declare var kSecAttrProtocolSSH: string;

declare var kSecAttrProtocolTelnet: string;

declare var kSecAttrProtocolTelnetS: string;

declare var kSecAttrPublicKeyHash: string;

declare var kSecAttrSecurityDomain: string;

declare var kSecAttrSerialNumber: string;

declare var kSecAttrServer: string;

declare var kSecAttrService: string;

declare var kSecAttrSubject: string;

declare var kSecAttrSubjectKeyID: string;

declare var kSecAttrSyncViewHint: string;

declare var kSecAttrSynchronizable: string;

declare var kSecAttrSynchronizableAny: string;

declare var kSecAttrTokenID: string;

declare var kSecAttrTokenIDSecureEnclave: string;

declare var kSecAttrType: string;

declare var kSecClass: string;

declare var kSecClassCertificate: string;

declare var kSecClassGenericPassword: string;

declare var kSecClassIdentity: string;

declare var kSecClassInternetPassword: string;

declare var kSecClassKey: string;

declare var kSecImportExportPassphrase: string;

declare var kSecImportItemCertChain: string;

declare var kSecImportItemIdentity: string;

declare var kSecImportItemKeyID: string;

declare var kSecImportItemLabel: string;

declare var kSecImportItemTrust: string;

declare var kSecKeyAlgorithmECDHKeyExchangeCofactor: any;

declare var kSecKeyAlgorithmECDHKeyExchangeCofactorX963SHA1: any;

declare var kSecKeyAlgorithmECDHKeyExchangeCofactorX963SHA224: any;

declare var kSecKeyAlgorithmECDHKeyExchangeCofactorX963SHA256: any;

declare var kSecKeyAlgorithmECDHKeyExchangeCofactorX963SHA384: any;

declare var kSecKeyAlgorithmECDHKeyExchangeCofactorX963SHA512: any;

declare var kSecKeyAlgorithmECDHKeyExchangeStandard: any;

declare var kSecKeyAlgorithmECDHKeyExchangeStandardX963SHA1: any;

declare var kSecKeyAlgorithmECDHKeyExchangeStandardX963SHA224: any;

declare var kSecKeyAlgorithmECDHKeyExchangeStandardX963SHA256: any;

declare var kSecKeyAlgorithmECDHKeyExchangeStandardX963SHA384: any;

declare var kSecKeyAlgorithmECDHKeyExchangeStandardX963SHA512: any;

declare var kSecKeyAlgorithmECDSASignatureDigestX962: any;

declare var kSecKeyAlgorithmECDSASignatureDigestX962SHA1: any;

declare var kSecKeyAlgorithmECDSASignatureDigestX962SHA224: any;

declare var kSecKeyAlgorithmECDSASignatureDigestX962SHA256: any;

declare var kSecKeyAlgorithmECDSASignatureDigestX962SHA384: any;

declare var kSecKeyAlgorithmECDSASignatureDigestX962SHA512: any;

declare var kSecKeyAlgorithmECDSASignatureMessageX962SHA1: any;

declare var kSecKeyAlgorithmECDSASignatureMessageX962SHA224: any;

declare var kSecKeyAlgorithmECDSASignatureMessageX962SHA256: any;

declare var kSecKeyAlgorithmECDSASignatureMessageX962SHA384: any;

declare var kSecKeyAlgorithmECDSASignatureMessageX962SHA512: any;

declare var kSecKeyAlgorithmECDSASignatureRFC4754: any;

declare var kSecKeyAlgorithmECIESEncryptionCofactorVariableIVX963SHA224AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionCofactorVariableIVX963SHA256AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionCofactorVariableIVX963SHA384AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionCofactorVariableIVX963SHA512AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionCofactorX963SHA1AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionCofactorX963SHA224AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionCofactorX963SHA256AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionCofactorX963SHA384AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionCofactorX963SHA512AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionStandardVariableIVX963SHA224AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionStandardVariableIVX963SHA256AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionStandardVariableIVX963SHA384AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionStandardVariableIVX963SHA512AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionStandardX963SHA1AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionStandardX963SHA224AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionStandardX963SHA256AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionStandardX963SHA384AESGCM: any;

declare var kSecKeyAlgorithmECIESEncryptionStandardX963SHA512AESGCM: any;

declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA1: any;

declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA1AESGCM: any;

declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA224: any;

declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA224AESGCM: any;

declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA256: any;

declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA256AESGCM: any;

declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA384: any;

declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA384AESGCM: any;

declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA512: any;

declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA512AESGCM: any;

declare var kSecKeyAlgorithmRSAEncryptionPKCS1: any;

declare var kSecKeyAlgorithmRSAEncryptionRaw: any;

declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15Raw: any;

declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15SHA1: any;

declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15SHA224: any;

declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15SHA256: any;

declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15SHA384: any;

declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15SHA512: any;

declare var kSecKeyAlgorithmRSASignatureDigestPSSSHA1: any;

declare var kSecKeyAlgorithmRSASignatureDigestPSSSHA224: any;

declare var kSecKeyAlgorithmRSASignatureDigestPSSSHA256: any;

declare var kSecKeyAlgorithmRSASignatureDigestPSSSHA384: any;

declare var kSecKeyAlgorithmRSASignatureDigestPSSSHA512: any;

declare var kSecKeyAlgorithmRSASignatureMessagePKCS1v15SHA1: any;

declare var kSecKeyAlgorithmRSASignatureMessagePKCS1v15SHA224: any;

declare var kSecKeyAlgorithmRSASignatureMessagePKCS1v15SHA256: any;

declare var kSecKeyAlgorithmRSASignatureMessagePKCS1v15SHA384: any;

declare var kSecKeyAlgorithmRSASignatureMessagePKCS1v15SHA512: any;

declare var kSecKeyAlgorithmRSASignatureMessagePSSSHA1: any;

declare var kSecKeyAlgorithmRSASignatureMessagePSSSHA224: any;

declare var kSecKeyAlgorithmRSASignatureMessagePSSSHA256: any;

declare var kSecKeyAlgorithmRSASignatureMessagePSSSHA384: any;

declare var kSecKeyAlgorithmRSASignatureMessagePSSSHA512: any;

declare var kSecKeyAlgorithmRSASignatureRaw: any;

declare var kSecKeyKeyExchangeParameterRequestedSize: any;

declare var kSecKeyKeyExchangeParameterSharedInfo: any;

declare var kSecMatchCaseInsensitive: string;

declare var kSecMatchEmailAddressIfPresent: string;

declare var kSecMatchIssuers: string;

declare var kSecMatchItemList: string;

declare var kSecMatchLimit: string;

declare var kSecMatchLimitAll: string;

declare var kSecMatchLimitOne: string;

declare var kSecMatchPolicy: string;

declare var kSecMatchSearchList: string;

declare var kSecMatchSubjectContains: string;

declare var kSecMatchTrustedOnly: string;

declare var kSecMatchValidOnDate: string;

declare var kSecPolicyAppleCodeSigning: string;

declare var kSecPolicyAppleEAP: string;

declare var kSecPolicyAppleIDValidation: string;

declare var kSecPolicyAppleIPsec: string;

declare var kSecPolicyApplePassbookSigning: string;

declare var kSecPolicyApplePayIssuerEncryption: string;

declare var kSecPolicyAppleRevocation: string;

declare var kSecPolicyAppleSMIME: string;

declare var kSecPolicyAppleSSL: string;

declare var kSecPolicyAppleTimeStamping: string;

declare var kSecPolicyAppleX509Basic: string;

declare var kSecPolicyClient: string;

declare var kSecPolicyMacAppStoreReceipt: string;

declare var kSecPolicyName: string;

declare var kSecPolicyOid: string;

declare var kSecPolicyRevocationFlags: string;

declare var kSecPolicyTeamIdentifier: string;

declare var kSecPrivateKeyAttrs: string;

declare var kSecPropertyTypeError: string;

declare var kSecPropertyTypeTitle: string;

declare var kSecPublicKeyAttrs: string;

declare var kSecRandomDefault: interop.Pointer | interop.Reference<any>;

declare var kSecReturnAttributes: string;

declare var kSecReturnData: string;

declare var kSecReturnPersistentRef: string;

declare var kSecReturnRef: string;

declare const kSecRevocationCRLMethod: number;

declare const kSecRevocationNetworkAccessDisabled: number;

declare const kSecRevocationOCSPMethod: number;

declare const kSecRevocationPreferCRL: number;

declare const kSecRevocationRequirePositiveResponse: number;

declare const kSecRevocationUseAnyAvailableMethod: number;

declare var kSecSharedPassword: string;

declare var kSecTrustCertificateTransparency: string;

declare var kSecTrustCertificateTransparencyWhiteList: string;

declare var kSecTrustEvaluationDate: string;

declare var kSecTrustExtendedValidation: string;

declare var kSecTrustOrganizationName: string;

declare var kSecTrustResultValue: string;

declare var kSecTrustRevocationChecked: string;

declare var kSecTrustRevocationValidUntilDate: string;

declare var kSecUseAuthenticationContext: string;

declare var kSecUseAuthenticationUI: string;

declare var kSecUseAuthenticationUIAllow: string;

declare var kSecUseAuthenticationUIFail: string;

declare var kSecUseAuthenticationUISkip: string;

declare var kSecUseDataProtectionKeychain: string;

declare var kSecUseItemList: string;

declare var kSecUseNoAuthenticationUI: string;

declare var kSecUseOperationPrompt: string;

declare var kSecValueData: string;

declare var kSecValuePersistentRef: string;

declare var kSecValueRef: string;

declare function sec_certificate_copy_ref(certificate: NSObject): interop.Unmanaged<any>;

declare function sec_certificate_create(certificate: any): NSObject;

declare function sec_identity_access_certificates(identity: NSObject, handler: (p1: NSObject) => void): boolean;

declare function sec_identity_copy_certificates_ref(identity: NSObject): interop.Unmanaged<NSArray<any>>;

declare function sec_identity_copy_ref(identity: NSObject): interop.Unmanaged<any>;

declare function sec_identity_create(identity: any): NSObject;

declare function sec_identity_create_with_certificates(identity: any, certificates: NSArray<any> | any[]): NSObject;

declare function sec_protocol_metadata_access_distinguished_names(metadata: NSObject, handler: (p1: NSObject) => void): boolean;

declare function sec_protocol_metadata_access_ocsp_response(metadata: NSObject, handler: (p1: NSObject) => void): boolean;

declare function sec_protocol_metadata_access_peer_certificate_chain(metadata: NSObject, handler: (p1: NSObject) => void): boolean;

declare function sec_protocol_metadata_access_pre_shared_keys(metadata: NSObject, handler: (p1: NSObject, p2: NSObject) => void): boolean;

declare function sec_protocol_metadata_access_supported_signature_algorithms(metadata: NSObject, handler: (p1: number) => void): boolean;

declare function sec_protocol_metadata_challenge_parameters_are_equal(metadataA: NSObject, metadataB: NSObject): boolean;

declare function sec_protocol_metadata_copy_peer_public_key(metadata: NSObject): NSObject;

declare function sec_protocol_metadata_create_secret(metadata: NSObject, label_len: number, label: string | interop.Pointer | interop.Reference<any>, exporter_length: number): NSObject;

declare function sec_protocol_metadata_create_secret_with_context(metadata: NSObject, label_len: number, label: string | interop.Pointer | interop.Reference<any>, context_len: number, context: string | interop.Pointer | interop.Reference<any>, exporter_length: number): NSObject;

declare function sec_protocol_metadata_get_early_data_accepted(metadata: NSObject): boolean;

declare function sec_protocol_metadata_get_negotiated_ciphersuite(metadata: NSObject): number;

declare function sec_protocol_metadata_get_negotiated_protocol(metadata: NSObject): string;

declare function sec_protocol_metadata_get_negotiated_protocol_version(metadata: NSObject): SSLProtocol;

declare function sec_protocol_metadata_get_negotiated_tls_ciphersuite(metadata: NSObject): tls_ciphersuite_t;

declare function sec_protocol_metadata_get_negotiated_tls_protocol_version(metadata: NSObject): tls_protocol_version_t;

declare function sec_protocol_metadata_get_server_name(metadata: NSObject): string;

declare function sec_protocol_metadata_peers_are_equal(metadataA: NSObject, metadataB: NSObject): boolean;

declare function sec_protocol_options_add_pre_shared_key(options: NSObject, psk: NSObject, psk_identity: NSObject): void;

declare function sec_protocol_options_add_tls_application_protocol(options: NSObject, application_protocol: string | interop.Pointer | interop.Reference<any>): void;

declare function sec_protocol_options_add_tls_ciphersuite(options: NSObject, ciphersuite: number): void;

declare function sec_protocol_options_add_tls_ciphersuite_group(options: NSObject, group: SSLCiphersuiteGroup): void;

declare function sec_protocol_options_append_tls_ciphersuite(options: NSObject, ciphersuite: tls_ciphersuite_t): void;

declare function sec_protocol_options_append_tls_ciphersuite_group(options: NSObject, group: tls_ciphersuite_group_t): void;

declare function sec_protocol_options_are_equal(optionsA: NSObject, optionsB: NSObject): boolean;

declare function sec_protocol_options_get_default_max_dtls_protocol_version(): tls_protocol_version_t;

declare function sec_protocol_options_get_default_max_tls_protocol_version(): tls_protocol_version_t;

declare function sec_protocol_options_get_default_min_dtls_protocol_version(): tls_protocol_version_t;

declare function sec_protocol_options_get_default_min_tls_protocol_version(): tls_protocol_version_t;

declare function sec_protocol_options_set_challenge_block(options: NSObject, challenge_block: (p1: NSObject, p2: (p1: NSObject) => void) => void, challenge_queue: NSObject): void;

declare function sec_protocol_options_set_key_update_block(options: NSObject, key_update_block: (p1: NSObject, p2: () => void) => void, key_update_queue: NSObject): void;

declare function sec_protocol_options_set_local_identity(options: NSObject, identity: NSObject): void;

declare function sec_protocol_options_set_max_tls_protocol_version(options: NSObject, version: tls_protocol_version_t): void;

declare function sec_protocol_options_set_min_tls_protocol_version(options: NSObject, version: tls_protocol_version_t): void;

declare function sec_protocol_options_set_peer_authentication_required(options: NSObject, peer_authentication_required: boolean): void;

declare function sec_protocol_options_set_pre_shared_key_selection_block(options: NSObject, psk_selection_block: (p1: NSObject, p2: NSObject, p3: (p1: NSObject) => void) => void, psk_selection_queue: NSObject): void;

declare function sec_protocol_options_set_tls_diffie_hellman_parameters(options: NSObject, params: NSObject): void;

declare function sec_protocol_options_set_tls_false_start_enabled(options: NSObject, false_start_enabled: boolean): void;

declare function sec_protocol_options_set_tls_is_fallback_attempt(options: NSObject, is_fallback_attempt: boolean): void;

declare function sec_protocol_options_set_tls_max_version(options: NSObject, version: SSLProtocol): void;

declare function sec_protocol_options_set_tls_min_version(options: NSObject, version: SSLProtocol): void;

declare function sec_protocol_options_set_tls_ocsp_enabled(options: NSObject, ocsp_enabled: boolean): void;

declare function sec_protocol_options_set_tls_pre_shared_key_identity_hint(options: NSObject, psk_identity_hint: NSObject): void;

declare function sec_protocol_options_set_tls_renegotiation_enabled(options: NSObject, renegotiation_enabled: boolean): void;

declare function sec_protocol_options_set_tls_resumption_enabled(options: NSObject, resumption_enabled: boolean): void;

declare function sec_protocol_options_set_tls_sct_enabled(options: NSObject, sct_enabled: boolean): void;

declare function sec_protocol_options_set_tls_server_name(options: NSObject, server_name: string | interop.Pointer | interop.Reference<any>): void;

declare function sec_protocol_options_set_tls_tickets_enabled(options: NSObject, tickets_enabled: boolean): void;

declare function sec_protocol_options_set_verify_block(options: NSObject, verify_block: (p1: NSObject, p2: NSObject, p3: (p1: boolean) => void) => void, verify_block_queue: NSObject): void;

declare function sec_release(obj: interop.Pointer | interop.Reference<any>): void;

declare function sec_retain(obj: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function sec_trust_copy_ref(trust: NSObject): interop.Unmanaged<any>;

declare function sec_trust_create(trust: any): NSObject;

declare const enum tls_ciphersuite_group_t {

	tls_ciphersuite_group_default = 0,

	tls_ciphersuite_group_compatibility = 1,

	tls_ciphersuite_group_legacy = 2,

	tls_ciphersuite_group_ats = 3,

	tls_ciphersuite_group_ats_compatibility = 4
}

declare const enum tls_ciphersuite_t {

	RSA_WITH_3DES_EDE_CBC_SHA = 10,

	RSA_WITH_AES_128_CBC_SHA = 47,

	RSA_WITH_AES_256_CBC_SHA = 53,

	RSA_WITH_AES_128_GCM_SHA256 = 156,

	RSA_WITH_AES_256_GCM_SHA384 = 157,

	RSA_WITH_AES_128_CBC_SHA256 = 60,

	RSA_WITH_AES_256_CBC_SHA256 = 61,

	ECDHE_ECDSA_WITH_3DES_EDE_CBC_SHA = 49160,

	ECDHE_ECDSA_WITH_AES_128_CBC_SHA = 49161,

	ECDHE_ECDSA_WITH_AES_256_CBC_SHA = 49162,

	ECDHE_RSA_WITH_3DES_EDE_CBC_SHA = 49170,

	ECDHE_RSA_WITH_AES_128_CBC_SHA = 49171,

	ECDHE_RSA_WITH_AES_256_CBC_SHA = 49172,

	ECDHE_ECDSA_WITH_AES_128_CBC_SHA256 = 49187,

	ECDHE_ECDSA_WITH_AES_256_CBC_SHA384 = 49188,

	ECDHE_RSA_WITH_AES_128_CBC_SHA256 = 49191,

	ECDHE_RSA_WITH_AES_256_CBC_SHA384 = 49192,

	ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 = 49195,

	ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 = 49196,

	ECDHE_RSA_WITH_AES_128_GCM_SHA256 = 49199,

	ECDHE_RSA_WITH_AES_256_GCM_SHA384 = 49200,

	ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 = 52392,

	ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256 = 52393,

	AES_128_GCM_SHA256 = 4865,

	AES_256_GCM_SHA384 = 4866,

	CHACHA20_POLY1305_SHA256 = 4867
}

declare const enum tls_protocol_version_t {

	TLSv10 = 769,

	TLSv11 = 770,

	TLSv12 = 771,

	TLSv13 = 772,

	DTLSv10 = 65279,

	DTLSv12 = 65277
}
