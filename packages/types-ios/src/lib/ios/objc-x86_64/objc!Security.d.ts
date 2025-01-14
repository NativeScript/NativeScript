
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

/**
 * @since 5.0
 * @deprecated 13.0
 */
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

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLClose(context: any): number;

declare const enum SSLConnectionType {

	kSSLStreamType = 0,

	kSSLDatagramType = 1
}

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLContextGetTypeID(): number;

/**
 * @since 11.0
 * @deprecated 13.0
 */
declare function SSLCopyALPNProtocols(context: any, protocols: interop.Pointer | interop.Reference<NSArray<any>>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLCopyDistinguishedNames(context: any, names: interop.Pointer | interop.Reference<NSArray<any>>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLCopyPeerTrust(context: any, trust: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare function SSLCopyRequestedPeerName(context: any, peerName: string | interop.Pointer | interop.Reference<any>, peerNameLen: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare function SSLCopyRequestedPeerNameLength(ctx: any, peerNameLen: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLCreateContext(alloc: any, protocolSide: SSLProtocolSide, connectionType: SSLConnectionType): any;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetBufferedReadSize(context: any, bufferSize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetClientCertificateState(context: any, clientState: interop.Pointer | interop.Reference<SSLClientCertificateState>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetConnection(context: any, connection: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetDatagramWriteSize(dtlsContext: any, bufSize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetEnabledCiphers(context: any, ciphers: interop.Pointer | interop.Reference<number>, numCiphers: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetMaxDatagramRecordSize(dtlsContext: any, maxSize: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetNegotiatedCipher(context: any, cipherSuite: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetNegotiatedProtocolVersion(context: any, protocol: interop.Pointer | interop.Reference<SSLProtocol>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetNumberEnabledCiphers(context: any, numCiphers: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetNumberSupportedCiphers(context: any, numCiphers: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetPeerDomainName(context: any, peerName: string | interop.Pointer | interop.Reference<any>, peerNameLen: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetPeerDomainNameLength(context: any, peerNameLen: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetPeerID(context: any, peerID: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, peerIDLen: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetProtocolVersionMax(context: any, maxVersion: interop.Pointer | interop.Reference<SSLProtocol>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetProtocolVersionMin(context: any, minVersion: interop.Pointer | interop.Reference<SSLProtocol>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetSessionOption(context: any, option: SSLSessionOption, value: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetSessionState(context: any, state: interop.Pointer | interop.Reference<SSLSessionState>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLGetSupportedCiphers(context: any, ciphers: interop.Pointer | interop.Reference<number>, numCiphers: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
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

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare function SSLReHandshake(context: any): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
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

/**
 * @since 11.0
 * @deprecated 13.0
 */
declare function SSLSetALPNProtocols(context: any, protocols: NSArray<any> | any[]): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetCertificate(context: any, certRefs: NSArray<any> | any[]): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetClientSideAuthenticate(context: any, auth: SSLAuthenticate): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetConnection(context: any, connection: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetDatagramHelloCookie(dtlsContext: any, cookie: interop.Pointer | interop.Reference<any>, cookieLen: number): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetEnabledCiphers(context: any, ciphers: interop.Pointer | interop.Reference<number>, numCiphers: number): number;

/**
 * @since 5.0
 * @deprecated 9.0
 */
declare function SSLSetEncryptionCertificate(context: any, certRefs: NSArray<any> | any[]): number;

/**
 * @since 11.0
 * @deprecated 13.0
 */
declare function SSLSetError(context: any, status: number): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetIOFuncs(context: any, readFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<number>) => number>, writeFunc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<number>) => number>): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetMaxDatagramRecordSize(dtlsContext: any, maxSize: number): number;

/**
 * @since 11.0
 * @deprecated 13.0
 */
declare function SSLSetOCSPResponse(context: any, response: NSData): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetPeerDomainName(context: any, peerName: string | interop.Pointer | interop.Reference<any>, peerNameLen: number): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetPeerID(context: any, peerID: interop.Pointer | interop.Reference<any>, peerIDLen: number): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetProtocolVersionMax(context: any, maxVersion: SSLProtocol): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetProtocolVersionMin(context: any, minVersion: SSLProtocol): number;

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare function SSLSetSessionConfig(context: any, config: string): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare function SSLSetSessionOption(context: any, option: SSLSessionOption, value: boolean): number;

/**
 * @since 11.0
 * @deprecated 13.0
 */
declare function SSLSetSessionTicketsEnabled(context: any, enabled: boolean): number;

/**
 * @since 5.0
 * @deprecated 13.0
 */
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

/**
 * @since 8.0
 */
declare const enum SecAccessControlCreateFlags {

	kSecAccessControlUserPresence = 1,

	kSecAccessControlBiometryAny = 2,

	kSecAccessControlTouchIDAny = 2,

	kSecAccessControlBiometryCurrentSet = 8,

	kSecAccessControlTouchIDCurrentSet = 8,

	kSecAccessControlDevicePasscode = 16,

	kSecAccessControlWatch = 32,

	kSecAccessControlCompanion = 32,

	kSecAccessControlOr = 16384,

	kSecAccessControlAnd = 32768,

	kSecAccessControlPrivateKeyUsage = 1073741824,

	kSecAccessControlApplicationPassword = 2147483648
}

/**
 * @since 8.0
 */
declare function SecAccessControlCreateWithFlags(allocator: any, protection: any, flags: SecAccessControlCreateFlags, error: interop.Pointer | interop.Reference<NSError>): any;

/**
 * @since 8.0
 */
declare function SecAccessControlGetTypeID(): number;

/**
 * @since 8.0
 */
declare function SecAddSharedWebCredential(fqdn: string, account: string, password: string, completionHandler: (p1: NSError) => void): void;

/**
 * @since 10.3
 */
declare function SecCertificateCopyCommonName(certificate: any, commonName: interop.Pointer | interop.Reference<string>): number;

/**
 * @since 2.0
 */
declare function SecCertificateCopyData(certificate: any): NSData;

/**
 * @since 10.3
 */
declare function SecCertificateCopyEmailAddresses(certificate: any, emailAddresses: interop.Pointer | interop.Reference<NSArray<any>>): number;

/**
 * @since 12.0
 */
declare function SecCertificateCopyKey(certificate: any): any;

/**
 * @since 10.3
 */
declare function SecCertificateCopyNormalizedIssuerSequence(certificate: any): NSData;

/**
 * @since 10.3
 */
declare function SecCertificateCopyNormalizedSubjectSequence(certificate: any): NSData;

/**
 * @since 18.0
 */
declare function SecCertificateCopyNotValidAfterDate(certificate: any): Date;

/**
 * @since 18.0
 */
declare function SecCertificateCopyNotValidBeforeDate(certificate: any): Date;

/**
 * @since 10.3
 * @deprecated 12.0
 */
declare function SecCertificateCopyPublicKey(certificate: any): any;

/**
 * @since 10.3
 * @deprecated 11.0
 */
declare function SecCertificateCopySerialNumber(certificate: any): NSData;

/**
 * @since 11.0
 */
declare function SecCertificateCopySerialNumberData(certificate: any, error: interop.Pointer | interop.Reference<NSError>): NSData;

/**
 * @since 2.0
 */
declare function SecCertificateCopySubjectSummary(certificate: any): string;

/**
 * @since 2.0
 */
declare function SecCertificateCreateWithData(allocator: any, data: NSData): any;

/**
 * @since 2.0
 */
declare function SecCertificateGetTypeID(): number;

/**
 * @since 11.3
 */
declare function SecCopyErrorMessageString(status: number, reserved: interop.Pointer | interop.Reference<any>): string;

/**
 * @since 8.0
 */
declare function SecCreateSharedWebCredentialPassword(): string;

/**
 * @since 2.0
 */
declare function SecIdentityCopyCertificate(identityRef: any, certificateRef: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function SecIdentityCopyPrivateKey(identityRef: any, privateKeyRef: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function SecIdentityGetTypeID(): number;

/**
 * @since 2.0
 */
declare function SecItemAdd(attributes: NSDictionary<any, any>, result: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function SecItemCopyMatching(query: NSDictionary<any, any>, result: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function SecItemDelete(query: NSDictionary<any, any>): number;

/**
 * @since 2.0
 */
declare function SecItemUpdate(query: NSDictionary<any, any>, attributesToUpdate: NSDictionary<any, any>): number;

/**
 * @since 10.0
 */
declare function SecKeyCopyAttributes(key: any): NSDictionary<any, any>;

/**
 * @since 10.0
 */
declare function SecKeyCopyExternalRepresentation(key: any, error: interop.Pointer | interop.Reference<NSError>): NSData;

/**
 * @since 10.0
 */
declare function SecKeyCopyKeyExchangeResult(privateKey: any, algorithm: string, publicKey: any, parameters: NSDictionary<any, any>, error: interop.Pointer | interop.Reference<NSError>): NSData;

/**
 * @since 10.0
 */
declare function SecKeyCopyPublicKey(key: any): any;

/**
 * @since 10.0
 */
declare function SecKeyCreateDecryptedData(key: any, algorithm: string, ciphertext: NSData, error: interop.Pointer | interop.Reference<NSError>): NSData;

/**
 * @since 10.0
 */
declare function SecKeyCreateEncryptedData(key: any, algorithm: string, plaintext: NSData, error: interop.Pointer | interop.Reference<NSError>): NSData;

/**
 * @since 10.0
 */
declare function SecKeyCreateRandomKey(parameters: NSDictionary<any, any>, error: interop.Pointer | interop.Reference<NSError>): any;

/**
 * @since 10.0
 */
declare function SecKeyCreateSignature(key: any, algorithm: string, dataToSign: NSData, error: interop.Pointer | interop.Reference<NSError>): NSData;

/**
 * @since 10.0
 */
declare function SecKeyCreateWithData(keyData: NSData, attributes: NSDictionary<any, any>, error: interop.Pointer | interop.Reference<NSError>): any;

/**
 * @since 2.0
 * @deprecated 15.0
 */
declare function SecKeyDecrypt(key: any, padding: SecPadding, cipherText: string | interop.Pointer | interop.Reference<any>, cipherTextLen: number, plainText: string | interop.Pointer | interop.Reference<any>, plainTextLen: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 15.0
 */
declare function SecKeyEncrypt(key: any, padding: SecPadding, plainText: string | interop.Pointer | interop.Reference<any>, plainTextLen: number, cipherText: string | interop.Pointer | interop.Reference<any>, cipherTextLen: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 15.0
 */
declare function SecKeyGeneratePair(parameters: NSDictionary<any, any>, publicKey: interop.Pointer | interop.Reference<any>, privateKey: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 */
declare function SecKeyGetBlockSize(key: any): number;

/**
 * @since 2.0
 */
declare function SecKeyGetTypeID(): number;

/**
 * @since 10.0
 */
declare function SecKeyIsAlgorithmSupported(key: any, operation: SecKeyOperationType, algorithm: string): boolean;

/**
 * @since 10.0
 */
declare const enum SecKeyOperationType {

	kSecKeyOperationTypeSign = 0,

	kSecKeyOperationTypeVerify = 1,

	kSecKeyOperationTypeEncrypt = 2,

	kSecKeyOperationTypeDecrypt = 3,

	kSecKeyOperationTypeKeyExchange = 4
}

/**
 * @since 2.0
 * @deprecated 15.0
 */
declare function SecKeyRawSign(key: any, padding: SecPadding, dataToSign: string | interop.Pointer | interop.Reference<any>, dataToSignLen: number, sig: string | interop.Pointer | interop.Reference<any>, sigLen: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 2.0
 * @deprecated 15.0
 */
declare function SecKeyRawVerify(key: any, padding: SecPadding, signedData: string | interop.Pointer | interop.Reference<any>, signedDataLen: number, sig: string | interop.Pointer | interop.Reference<any>, sigLen: number): number;

/**
 * @since 10.0
 */
declare function SecKeyVerifySignature(key: any, algorithm: string, signedData: NSData, signature: NSData, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 */
declare function SecPKCS12Import(pkcs12_data: NSData, options: NSDictionary<any, any>, items: interop.Pointer | interop.Reference<NSArray<any>>): number;

/**
 * @since 2.0
 * @deprecated 15.0
 */
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

/**
 * @since 7.0
 */
declare function SecPolicyCopyProperties(policyRef: any): NSDictionary<any, any>;

/**
 * @since 2.0
 */
declare function SecPolicyCreateBasicX509(): any;

/**
 * @since 7.0
 */
declare function SecPolicyCreateRevocation(revocationFlags: number): any;

/**
 * @since 2.0
 */
declare function SecPolicyCreateSSL(server: boolean, hostname: string): any;

/**
 * @since 7.0
 */
declare function SecPolicyCreateWithProperties(policyIdentifier: any, properties: NSDictionary<any, any>): any;

/**
 * @since 2.0
 */
declare function SecPolicyGetTypeID(): number;

/**
 * @since 2.0
 */
declare function SecRandomCopyBytes(rnd: interop.Pointer | interop.Reference<any>, count: number, bytes: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 8.0
 * @deprecated 14.0
 */
declare function SecRequestSharedWebCredential(fqdn: string, account: string, completionHandler: (p1: NSArray<any>, p2: NSError) => void): void;

/**
 * @since 15.0
 */
declare function SecTrustCopyCertificateChain(trust: any): NSArray<any>;

/**
 * @since 7.0
 */
declare function SecTrustCopyCustomAnchorCertificates(trust: any, anchors: interop.Pointer | interop.Reference<NSArray<any>>): number;

/**
 * @since 4.0
 */
declare function SecTrustCopyExceptions(trust: any): NSData;

/**
 * @since 14.0
 */
declare function SecTrustCopyKey(trust: any): any;

/**
 * @since 7.0
 */
declare function SecTrustCopyPolicies(trust: any, policies: interop.Pointer | interop.Reference<NSArray<any>>): number;

/**
 * @since 2.0
 * @deprecated 15.0
 */
declare function SecTrustCopyProperties(trust: any): NSArray<any>;

/**
 * @since 2.0
 * @deprecated 14.0
 */
declare function SecTrustCopyPublicKey(trust: any): any;

/**
 * @since 7.0
 */
declare function SecTrustCopyResult(trust: any): NSDictionary<any, any>;

/**
 * @since 2.0
 */
declare function SecTrustCreateWithCertificates(certificates: any, policies: any, trust: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function SecTrustEvaluate(trust: any, result: interop.Pointer | interop.Reference<SecTrustResultType>): number;

/**
 * @since 7.0
 * @deprecated 13.0
 */
declare function SecTrustEvaluateAsync(trust: any, queue: NSObject & OS_dispatch_queue, result: (p1: any, p2: SecTrustResultType) => void): number;

/**
 * @since 13.0
 */
declare function SecTrustEvaluateAsyncWithError(trust: any, queue: NSObject & OS_dispatch_queue, result: (p1: any, p2: boolean, p3: NSError) => void): number;

/**
 * @since 12.0
 */
declare function SecTrustEvaluateWithError(trust: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 * @deprecated 15.0
 */
declare function SecTrustGetCertificateAtIndex(trust: any, ix: number): any;

/**
 * @since 2.0
 */
declare function SecTrustGetCertificateCount(trust: any): number;

/**
 * @since 7.0
 */
declare function SecTrustGetNetworkFetchAllowed(trust: any, allowFetch: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 7.0
 */
declare function SecTrustGetTrustResult(trust: any, result: interop.Pointer | interop.Reference<SecTrustResultType>): number;

/**
 * @since 2.0
 */
declare function SecTrustGetTypeID(): number;

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
declare function SecTrustSetAnchorCertificates(trust: any, anchorCertificates: NSArray<any> | any[]): number;

/**
 * @since 2.0
 */
declare function SecTrustSetAnchorCertificatesOnly(trust: any, anchorCertificatesOnly: boolean): number;

/**
 * @since 4.0
 */
declare function SecTrustSetExceptions(trust: any, exceptions: NSData): boolean;

/**
 * @since 7.0
 */
declare function SecTrustSetNetworkFetchAllowed(trust: any, allowFetch: boolean): number;

/**
 * @since 7.0
 */
declare function SecTrustSetOCSPResponse(trust: any, responseData: any): number;

/**
 * @since 6.0
 */
declare function SecTrustSetPolicies(trust: any, policies: any): number;

/**
 * @since 12.1.1
 */
declare function SecTrustSetSignedCertificateTimestamps(trust: any, sctArray: NSArray<any> | any[]): number;

/**
 * @since 2.0
 */
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

declare const TLS_ECDHE_PSK_WITH_CHACHA20_POLY1305_SHA256: number;

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

declare const errSSLEarlyDataRejected: number;

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

declare const errSecCertificateDuplicateExtension: number;

declare const errSecCertificateExpired: number;

declare const errSecCertificateIsCA: number;

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

declare const errSecInvalidCRLAuthority: number;

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

declare const errSecInvalidTupleCredentials: number;

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

declare const errSecRestrictedAPI: number;

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

/**
 * @since 5.0
 * @deprecated 11.0
 */
declare var kSSLSessionConfig_3DES_fallback: string;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare var kSSLSessionConfig_ATSv1: string;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare var kSSLSessionConfig_ATSv1_noPFS: string;

/**
 * @since 5.0
 * @deprecated 11.0
 */
declare var kSSLSessionConfig_RC4_fallback: string;

/**
 * @since 5.0
 * @deprecated 11.0
 */
declare var kSSLSessionConfig_TLSv1_3DES_fallback: string;

/**
 * @since 5.0
 * @deprecated 11.0
 */
declare var kSSLSessionConfig_TLSv1_RC4_fallback: string;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare var kSSLSessionConfig_TLSv1_fallback: string;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare var kSSLSessionConfig_anonymous: string;

/**
 * @since 5.0
 * @deprecated 11.0
 */
declare var kSSLSessionConfig_default: string;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare var kSSLSessionConfig_legacy: string;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare var kSSLSessionConfig_legacy_DHE: string;

/**
 * @since 5.0
 * @deprecated 13.0
 */
declare var kSSLSessionConfig_standard: string;

/**
 * @since 8.0
 */
declare var kSecAttrAccessControl: string;

/**
 * @since 3.0
 */
declare var kSecAttrAccessGroup: string;

/**
 * @since 10.0
 */
declare var kSecAttrAccessGroupToken: string;

/**
 * @since 4.0
 */
declare var kSecAttrAccessible: string;

/**
 * @since 4.0
 */
declare var kSecAttrAccessibleAfterFirstUnlock: string;

/**
 * @since 4.0
 */
declare var kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly: string;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare var kSecAttrAccessibleAlways: string;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare var kSecAttrAccessibleAlwaysThisDeviceOnly: string;

/**
 * @since 8.0
 */
declare var kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly: string;

/**
 * @since 4.0
 */
declare var kSecAttrAccessibleWhenUnlocked: string;

/**
 * @since 4.0
 */
declare var kSecAttrAccessibleWhenUnlockedThisDeviceOnly: string;

/**
 * @since 2.0
 */
declare var kSecAttrAccount: string;

/**
 * @since 2.0
 */
declare var kSecAttrApplicationLabel: string;

/**
 * @since 2.0
 */
declare var kSecAttrApplicationTag: string;

/**
 * @since 2.0
 */
declare var kSecAttrAuthenticationType: string;

/**
 * @since 2.0
 */
declare var kSecAttrAuthenticationTypeDPA: string;

/**
 * @since 2.0
 */
declare var kSecAttrAuthenticationTypeDefault: string;

/**
 * @since 2.0
 */
declare var kSecAttrAuthenticationTypeHTMLForm: string;

/**
 * @since 2.0
 */
declare var kSecAttrAuthenticationTypeHTTPBasic: string;

/**
 * @since 2.0
 */
declare var kSecAttrAuthenticationTypeHTTPDigest: string;

/**
 * @since 2.0
 */
declare var kSecAttrAuthenticationTypeMSN: string;

/**
 * @since 2.0
 */
declare var kSecAttrAuthenticationTypeNTLM: string;

/**
 * @since 2.0
 */
declare var kSecAttrAuthenticationTypeRPA: string;

/**
 * @since 2.0
 */
declare var kSecAttrCanDecrypt: string;

/**
 * @since 2.0
 */
declare var kSecAttrCanDerive: string;

/**
 * @since 2.0
 */
declare var kSecAttrCanEncrypt: string;

/**
 * @since 2.0
 */
declare var kSecAttrCanSign: string;

/**
 * @since 2.0
 */
declare var kSecAttrCanUnwrap: string;

/**
 * @since 2.0
 */
declare var kSecAttrCanVerify: string;

/**
 * @since 2.0
 */
declare var kSecAttrCanWrap: string;

/**
 * @since 2.0
 */
declare var kSecAttrCertificateEncoding: string;

/**
 * @since 2.0
 */
declare var kSecAttrCertificateType: string;

/**
 * @since 2.0
 */
declare var kSecAttrComment: string;

/**
 * @since 2.0
 */
declare var kSecAttrCreationDate: string;

/**
 * @since 2.0
 */
declare var kSecAttrCreator: string;

/**
 * @since 2.0
 */
declare var kSecAttrDescription: string;

/**
 * @since 2.0
 */
declare var kSecAttrEffectiveKeySize: string;

/**
 * @since 2.0
 */
declare var kSecAttrGeneric: string;

/**
 * @since 2.0
 */
declare var kSecAttrIsExtractable: string;

/**
 * @since 2.0
 */
declare var kSecAttrIsInvisible: string;

/**
 * @since 2.0
 */
declare var kSecAttrIsNegative: string;

/**
 * @since 2.0
 */
declare var kSecAttrIsPermanent: string;

/**
 * @since 2.0
 */
declare var kSecAttrIsSensitive: string;

/**
 * @since 2.0
 */
declare var kSecAttrIssuer: string;

/**
 * @since 2.0
 */
declare var kSecAttrKeyClass: string;

/**
 * @since 2.0
 */
declare var kSecAttrKeyClassPrivate: string;

/**
 * @since 2.0
 */
declare var kSecAttrKeyClassPublic: string;

/**
 * @since 2.0
 */
declare var kSecAttrKeyClassSymmetric: string;

/**
 * @since 2.0
 */
declare var kSecAttrKeySizeInBits: string;

/**
 * @since 2.0
 */
declare var kSecAttrKeyType: string;

/**
 * @since 4.0
 */
declare var kSecAttrKeyTypeEC: string;

/**
 * @since 10.0
 */
declare var kSecAttrKeyTypeECSECPrimeRandom: string;

/**
 * @since 2.0
 */
declare var kSecAttrKeyTypeRSA: string;

/**
 * @since 2.0
 */
declare var kSecAttrLabel: string;

/**
 * @since 2.0
 */
declare var kSecAttrModificationDate: string;

/**
 * @since 2.0
 */
declare var kSecAttrPath: string;

/**
 * @since 11.0
 */
declare var kSecAttrPersistantReference: string;

/**
 * @since 11.0
 */
declare var kSecAttrPersistentReference: string;

/**
 * @since 2.0
 */
declare var kSecAttrPort: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocol: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolAFP: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolAppleTalk: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolDAAP: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolEPPC: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolFTP: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolFTPAccount: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolFTPProxy: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolFTPS: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolHTTP: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolHTTPProxy: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolHTTPS: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolHTTPSProxy: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolIMAP: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolIMAPS: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolIPP: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolIRC: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolIRCS: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolLDAP: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolLDAPS: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolNNTP: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolNNTPS: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolPOP3: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolPOP3S: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolRTSP: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolRTSPProxy: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolSMB: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolSMTP: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolSOCKS: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolSSH: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolTelnet: string;

/**
 * @since 2.0
 */
declare var kSecAttrProtocolTelnetS: string;

/**
 * @since 2.0
 */
declare var kSecAttrPublicKeyHash: string;

/**
 * @since 2.0
 */
declare var kSecAttrSecurityDomain: string;

/**
 * @since 2.0
 */
declare var kSecAttrSerialNumber: string;

/**
 * @since 2.0
 */
declare var kSecAttrServer: string;

/**
 * @since 2.0
 */
declare var kSecAttrService: string;

/**
 * @since 2.0
 */
declare var kSecAttrSubject: string;

/**
 * @since 2.0
 */
declare var kSecAttrSubjectKeyID: string;

/**
 * @since 9.0
 */
declare var kSecAttrSyncViewHint: string;

/**
 * @since 7.0
 */
declare var kSecAttrSynchronizable: string;

/**
 * @since 7.0
 */
declare var kSecAttrSynchronizableAny: string;

/**
 * @since 9.0
 */
declare var kSecAttrTokenID: string;

/**
 * @since 9.0
 */
declare var kSecAttrTokenIDSecureEnclave: string;

/**
 * @since 2.0
 */
declare var kSecAttrType: string;

/**
 * @since 2.0
 */
declare var kSecClass: string;

/**
 * @since 2.0
 */
declare var kSecClassCertificate: string;

/**
 * @since 2.0
 */
declare var kSecClassGenericPassword: string;

/**
 * @since 2.0
 */
declare var kSecClassIdentity: string;

/**
 * @since 2.0
 */
declare var kSecClassInternetPassword: string;

/**
 * @since 2.0
 */
declare var kSecClassKey: string;

/**
 * @since 2.0
 */
declare var kSecImportExportPassphrase: string;

/**
 * @since 2.0
 */
declare var kSecImportItemCertChain: string;

/**
 * @since 2.0
 */
declare var kSecImportItemIdentity: string;

/**
 * @since 2.0
 */
declare var kSecImportItemKeyID: string;

/**
 * @since 2.0
 */
declare var kSecImportItemLabel: string;

/**
 * @since 2.0
 */
declare var kSecImportItemTrust: string;

/**
 * @since 18.0
 */
declare var kSecImportToMemoryOnly: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeCofactor: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeCofactorX963SHA1: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeCofactorX963SHA224: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeCofactorX963SHA256: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeCofactorX963SHA384: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeCofactorX963SHA512: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeStandard: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeStandardX963SHA1: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeStandardX963SHA224: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeStandardX963SHA256: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeStandardX963SHA384: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDHKeyExchangeStandardX963SHA512: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestRFC4754: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestRFC4754SHA1: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestRFC4754SHA224: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestRFC4754SHA256: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestRFC4754SHA384: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestRFC4754SHA512: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestX962: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestX962SHA1: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestX962SHA224: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestX962SHA256: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestX962SHA384: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureDigestX962SHA512: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureMessageRFC4754SHA1: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureMessageRFC4754SHA224: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureMessageRFC4754SHA256: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureMessageRFC4754SHA384: string;

/**
 * @since 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureMessageRFC4754SHA512: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureMessageX962SHA1: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureMessageX962SHA224: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureMessageX962SHA256: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureMessageX962SHA384: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECDSASignatureMessageX962SHA512: string;

/**
 * @since 10.0
 * @deprecated 17.0
 */
declare var kSecKeyAlgorithmECDSASignatureRFC4754: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmECIESEncryptionCofactorVariableIVX963SHA224AESGCM: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmECIESEncryptionCofactorVariableIVX963SHA256AESGCM: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmECIESEncryptionCofactorVariableIVX963SHA384AESGCM: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmECIESEncryptionCofactorVariableIVX963SHA512AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECIESEncryptionCofactorX963SHA1AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECIESEncryptionCofactorX963SHA224AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECIESEncryptionCofactorX963SHA256AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECIESEncryptionCofactorX963SHA384AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECIESEncryptionCofactorX963SHA512AESGCM: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmECIESEncryptionStandardVariableIVX963SHA224AESGCM: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmECIESEncryptionStandardVariableIVX963SHA256AESGCM: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmECIESEncryptionStandardVariableIVX963SHA384AESGCM: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmECIESEncryptionStandardVariableIVX963SHA512AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECIESEncryptionStandardX963SHA1AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECIESEncryptionStandardX963SHA224AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECIESEncryptionStandardX963SHA256AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECIESEncryptionStandardX963SHA384AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmECIESEncryptionStandardX963SHA512AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA1: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA1AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA224: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA224AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA256: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA256AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA384: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA384AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA512: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionOAEPSHA512AESGCM: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionPKCS1: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSAEncryptionRaw: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15Raw: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15SHA1: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15SHA224: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15SHA256: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15SHA384: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPKCS1v15SHA512: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPSSSHA1: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPSSSHA224: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPSSSHA256: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPSSSHA384: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmRSASignatureDigestPSSSHA512: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureMessagePKCS1v15SHA1: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureMessagePKCS1v15SHA224: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureMessagePKCS1v15SHA256: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureMessagePKCS1v15SHA384: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureMessagePKCS1v15SHA512: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmRSASignatureMessagePSSSHA1: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmRSASignatureMessagePSSSHA224: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmRSASignatureMessagePSSSHA256: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmRSASignatureMessagePSSSHA384: string;

/**
 * @since 11.0
 */
declare var kSecKeyAlgorithmRSASignatureMessagePSSSHA512: string;

/**
 * @since 10.0
 */
declare var kSecKeyAlgorithmRSASignatureRaw: string;

/**
 * @since 10.0
 */
declare var kSecKeyKeyExchangeParameterRequestedSize: string;

/**
 * @since 10.0
 */
declare var kSecKeyKeyExchangeParameterSharedInfo: string;

/**
 * @since 2.0
 */
declare var kSecMatchCaseInsensitive: string;

/**
 * @since 2.0
 */
declare var kSecMatchEmailAddressIfPresent: string;

/**
 * @since 18.0
 */
declare var kSecMatchHostOrSubdomainOfHost: string;

/**
 * @since 2.0
 */
declare var kSecMatchIssuers: string;

/**
 * @since 2.0
 */
declare var kSecMatchItemList: string;

/**
 * @since 2.0
 */
declare var kSecMatchLimit: string;

/**
 * @since 2.0
 */
declare var kSecMatchLimitAll: string;

/**
 * @since 2.0
 */
declare var kSecMatchLimitOne: string;

/**
 * @since 2.0
 */
declare var kSecMatchPolicy: string;

/**
 * @since 2.0
 */
declare var kSecMatchSearchList: string;

/**
 * @since 2.0
 */
declare var kSecMatchSubjectContains: string;

/**
 * @since 2.0
 */
declare var kSecMatchTrustedOnly: string;

/**
 * @since 2.0
 */
declare var kSecMatchValidOnDate: string;

/**
 * @since 7.0
 */
declare var kSecPolicyAppleCodeSigning: string;

/**
 * @since 7.0
 */
declare var kSecPolicyAppleEAP: string;

/**
 * @since 7.0
 */
declare var kSecPolicyAppleIDValidation: string;

/**
 * @since 7.0
 */
declare var kSecPolicyAppleIPsec: string;

/**
 * @since 7.0
 */
declare var kSecPolicyApplePassbookSigning: string;

/**
 * @since 9.0
 */
declare var kSecPolicyApplePayIssuerEncryption: string;

/**
 * @since 7.0
 */
declare var kSecPolicyAppleRevocation: string;

/**
 * @since 7.0
 */
declare var kSecPolicyAppleSMIME: string;

/**
 * @since 7.0
 */
declare var kSecPolicyAppleSSL: string;

/**
 * @since 7.0
 */
declare var kSecPolicyAppleTimeStamping: string;

/**
 * @since 7.0
 */
declare var kSecPolicyAppleX509Basic: string;

/**
 * @since 7.0
 */
declare var kSecPolicyClient: string;

/**
 * @since 9.0
 */
declare var kSecPolicyMacAppStoreReceipt: string;

/**
 * @since 7.0
 */
declare var kSecPolicyName: string;

/**
 * @since 7.0
 */
declare var kSecPolicyOid: string;

/**
 * @since 7.0
 */
declare var kSecPolicyRevocationFlags: string;

/**
 * @since 7.0
 */
declare var kSecPolicyTeamIdentifier: string;

/**
 * @since 2.0
 */
declare var kSecPrivateKeyAttrs: string;

/**
 * @since 7.0
 */
declare var kSecPropertyTypeError: string;

/**
 * @since 7.0
 */
declare var kSecPropertyTypeTitle: string;

/**
 * @since 2.0
 */
declare var kSecPublicKeyAttrs: string;

/**
 * @since 2.0
 */
declare var kSecRandomDefault: interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare var kSecReturnAttributes: string;

/**
 * @since 2.0
 */
declare var kSecReturnData: string;

/**
 * @since 2.0
 */
declare var kSecReturnPersistentRef: string;

/**
 * @since 2.0
 */
declare var kSecReturnRef: string;

declare const kSecRevocationCRLMethod: number;

declare const kSecRevocationNetworkAccessDisabled: number;

declare const kSecRevocationOCSPMethod: number;

declare const kSecRevocationPreferCRL: number;

declare const kSecRevocationRequirePositiveResponse: number;

declare const kSecRevocationUseAnyAvailableMethod: number;

/**
 * @since 8.0
 */
declare var kSecSharedPassword: string;

/**
 * @since 9.0
 */
declare var kSecTrustCertificateTransparency: string;

/**
 * @since 10.0
 * @deprecated 11.0
 */
declare var kSecTrustCertificateTransparencyWhiteList: string;

/**
 * @since 7.0
 */
declare var kSecTrustEvaluationDate: string;

/**
 * @since 7.0
 */
declare var kSecTrustExtendedValidation: string;

/**
 * @since 7.0
 */
declare var kSecTrustOrganizationName: string;

/**
 * @since 7.0
 */
declare var kSecTrustResultValue: string;

/**
 * @since 7.0
 */
declare var kSecTrustRevocationChecked: string;

/**
 * @since 7.0
 */
declare var kSecTrustRevocationValidUntilDate: string;

/**
 * @since 9.0
 */
declare var kSecUseAuthenticationContext: string;

/**
 * @since 9.0
 */
declare var kSecUseAuthenticationUI: string;

/**
 * @since 9.0
 * @deprecated 14.0
 */
declare var kSecUseAuthenticationUIAllow: string;

/**
 * @since 9.0
 * @deprecated 14.0
 */
declare var kSecUseAuthenticationUIFail: string;

/**
 * @since 9.0
 */
declare var kSecUseAuthenticationUISkip: string;

/**
 * @since 13.0
 */
declare var kSecUseDataProtectionKeychain: string;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare var kSecUseItemList: string;

/**
 * @since 8.0
 * @deprecated 9.0
 */
declare var kSecUseNoAuthenticationUI: string;

/**
 * @since 8.0
 * @deprecated 14.0
 */
declare var kSecUseOperationPrompt: string;

/**
 * @since 2.0
 */
declare var kSecValueData: string;

/**
 * @since 2.0
 */
declare var kSecValuePersistentRef: string;

/**
 * @since 2.0
 */
declare var kSecValueRef: string;

/**
 * @since 12.0
 */
declare function sec_certificate_copy_ref(certificate: NSObject & OS_sec_certificate): interop.Unmanaged<any>;

/**
 * @since 12.0
 */
declare function sec_certificate_create(certificate: any): NSObject & OS_sec_certificate;

/**
 * @since 13.0
 */
declare function sec_identity_access_certificates(identity: NSObject & OS_sec_identity, handler: (p1: NSObject & OS_sec_certificate) => void): boolean;

/**
 * @since 12.0
 */
declare function sec_identity_copy_certificates_ref(identity: NSObject & OS_sec_identity): interop.Unmanaged<NSArray<any>>;

/**
 * @since 12.0
 */
declare function sec_identity_copy_ref(identity: NSObject & OS_sec_identity): interop.Unmanaged<any>;

/**
 * @since 12.0
 */
declare function sec_identity_create(identity: any): NSObject & OS_sec_identity;

/**
 * @since 12.0
 */
declare function sec_identity_create_with_certificates(identity: any, certificates: NSArray<any> | any[]): NSObject & OS_sec_identity;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_access_distinguished_names(metadata: NSObject & OS_sec_protocol_metadata, handler: (p1: NSObject & OS_dispatch_data) => void): boolean;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_access_ocsp_response(metadata: NSObject & OS_sec_protocol_metadata, handler: (p1: NSObject & OS_dispatch_data) => void): boolean;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_access_peer_certificate_chain(metadata: NSObject & OS_sec_protocol_metadata, handler: (p1: NSObject & OS_sec_certificate) => void): boolean;

/**
 * @since 13.0
 */
declare function sec_protocol_metadata_access_pre_shared_keys(metadata: NSObject & OS_sec_protocol_metadata, handler: (p1: NSObject & OS_dispatch_data, p2: NSObject & OS_dispatch_data) => void): boolean;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_access_supported_signature_algorithms(metadata: NSObject & OS_sec_protocol_metadata, handler: (p1: number) => void): boolean;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_challenge_parameters_are_equal(metadataA: NSObject & OS_sec_protocol_metadata, metadataB: NSObject & OS_sec_protocol_metadata): boolean;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_copy_peer_public_key(metadata: NSObject & OS_sec_protocol_metadata): NSObject & OS_dispatch_data;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_create_secret(metadata: NSObject & OS_sec_protocol_metadata, label_len: number, label: string | interop.Pointer | interop.Reference<any>, exporter_length: number): NSObject & OS_dispatch_data;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_create_secret_with_context(metadata: NSObject & OS_sec_protocol_metadata, label_len: number, label: string | interop.Pointer | interop.Reference<any>, context_len: number, context: string | interop.Pointer | interop.Reference<any>, exporter_length: number): NSObject & OS_dispatch_data;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_get_early_data_accepted(metadata: NSObject & OS_sec_protocol_metadata): boolean;

/**
 * @since 12.0
 * @deprecated 13.0
 */
declare function sec_protocol_metadata_get_negotiated_ciphersuite(metadata: NSObject & OS_sec_protocol_metadata): number;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_get_negotiated_protocol(metadata: NSObject & OS_sec_protocol_metadata): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 * @deprecated 13.0
 */
declare function sec_protocol_metadata_get_negotiated_protocol_version(metadata: NSObject & OS_sec_protocol_metadata): SSLProtocol;

/**
 * @since 13.0
 */
declare function sec_protocol_metadata_get_negotiated_tls_ciphersuite(metadata: NSObject & OS_sec_protocol_metadata): tls_ciphersuite_t;

/**
 * @since 13.0
 */
declare function sec_protocol_metadata_get_negotiated_tls_protocol_version(metadata: NSObject & OS_sec_protocol_metadata): tls_protocol_version_t;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_get_server_name(metadata: NSObject & OS_sec_protocol_metadata): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function sec_protocol_metadata_peers_are_equal(metadataA: NSObject & OS_sec_protocol_metadata, metadataB: NSObject & OS_sec_protocol_metadata): boolean;

/**
 * @since 12.0
 */
declare function sec_protocol_options_add_pre_shared_key(options: NSObject & OS_sec_protocol_options, psk: NSObject & OS_dispatch_data, psk_identity: NSObject & OS_dispatch_data): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_add_tls_application_protocol(options: NSObject & OS_sec_protocol_options, application_protocol: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 12.0
 * @deprecated 13.0
 */
declare function sec_protocol_options_add_tls_ciphersuite(options: NSObject & OS_sec_protocol_options, ciphersuite: number): void;

/**
 * @since 12.0
 * @deprecated 13.0
 */
declare function sec_protocol_options_add_tls_ciphersuite_group(options: NSObject & OS_sec_protocol_options, group: SSLCiphersuiteGroup): void;

/**
 * @since 13.0
 */
declare function sec_protocol_options_append_tls_ciphersuite(options: NSObject & OS_sec_protocol_options, ciphersuite: tls_ciphersuite_t): void;

/**
 * @since 13.0
 */
declare function sec_protocol_options_append_tls_ciphersuite_group(options: NSObject & OS_sec_protocol_options, group: tls_ciphersuite_group_t): void;

/**
 * @since 13.0
 */
declare function sec_protocol_options_are_equal(optionsA: NSObject & OS_sec_protocol_options, optionsB: NSObject & OS_sec_protocol_options): boolean;

/**
 * @since 13.0
 */
declare function sec_protocol_options_get_default_max_dtls_protocol_version(): tls_protocol_version_t;

/**
 * @since 13.0
 */
declare function sec_protocol_options_get_default_max_tls_protocol_version(): tls_protocol_version_t;

/**
 * @since 13.0
 */
declare function sec_protocol_options_get_default_min_dtls_protocol_version(): tls_protocol_version_t;

/**
 * @since 13.0
 */
declare function sec_protocol_options_get_default_min_tls_protocol_version(): tls_protocol_version_t;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_challenge_block(options: NSObject & OS_sec_protocol_options, challenge_block: (p1: NSObject & OS_sec_protocol_metadata, p2: (p1: NSObject & OS_sec_identity) => void) => void, challenge_queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_key_update_block(options: NSObject & OS_sec_protocol_options, key_update_block: (p1: NSObject & OS_sec_protocol_metadata, p2: () => void) => void, key_update_queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_local_identity(options: NSObject & OS_sec_protocol_options, identity: NSObject & OS_sec_identity): void;

/**
 * @since 13.0
 */
declare function sec_protocol_options_set_max_tls_protocol_version(options: NSObject & OS_sec_protocol_options, version: tls_protocol_version_t): void;

/**
 * @since 13.0
 */
declare function sec_protocol_options_set_min_tls_protocol_version(options: NSObject & OS_sec_protocol_options, version: tls_protocol_version_t): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_peer_authentication_required(options: NSObject & OS_sec_protocol_options, peer_authentication_required: boolean): void;

/**
 * @since 13.0
 */
declare function sec_protocol_options_set_pre_shared_key_selection_block(options: NSObject & OS_sec_protocol_options, psk_selection_block: (p1: NSObject & OS_sec_protocol_metadata, p2: NSObject & OS_dispatch_data, p3: (p1: NSObject & OS_dispatch_data) => void) => void, psk_selection_queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 12.0
 * @deprecated 13.0
 */
declare function sec_protocol_options_set_tls_diffie_hellman_parameters(options: NSObject & OS_sec_protocol_options, params: NSObject & OS_dispatch_data): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_tls_false_start_enabled(options: NSObject & OS_sec_protocol_options, false_start_enabled: boolean): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_tls_is_fallback_attempt(options: NSObject & OS_sec_protocol_options, is_fallback_attempt: boolean): void;

/**
 * @since 12.0
 * @deprecated 13.0
 */
declare function sec_protocol_options_set_tls_max_version(options: NSObject & OS_sec_protocol_options, version: SSLProtocol): void;

/**
 * @since 12.0
 * @deprecated 13.0
 */
declare function sec_protocol_options_set_tls_min_version(options: NSObject & OS_sec_protocol_options, version: SSLProtocol): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_tls_ocsp_enabled(options: NSObject & OS_sec_protocol_options, ocsp_enabled: boolean): void;

/**
 * @since 13.0
 */
declare function sec_protocol_options_set_tls_pre_shared_key_identity_hint(options: NSObject & OS_sec_protocol_options, psk_identity_hint: NSObject & OS_dispatch_data): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_tls_renegotiation_enabled(options: NSObject & OS_sec_protocol_options, renegotiation_enabled: boolean): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_tls_resumption_enabled(options: NSObject & OS_sec_protocol_options, resumption_enabled: boolean): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_tls_sct_enabled(options: NSObject & OS_sec_protocol_options, sct_enabled: boolean): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_tls_server_name(options: NSObject & OS_sec_protocol_options, server_name: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_tls_tickets_enabled(options: NSObject & OS_sec_protocol_options, tickets_enabled: boolean): void;

/**
 * @since 12.0
 */
declare function sec_protocol_options_set_verify_block(options: NSObject & OS_sec_protocol_options, verify_block: (p1: NSObject & OS_sec_protocol_metadata, p2: NSObject & OS_sec_trust, p3: (p1: boolean) => void) => void, verify_block_queue: NSObject & OS_dispatch_queue): void;

declare function sec_release(obj: interop.Pointer | interop.Reference<any>): void;

declare function sec_retain(obj: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function sec_trust_copy_ref(trust: NSObject & OS_sec_trust): interop.Unmanaged<any>;

/**
 * @since 12.0
 */
declare function sec_trust_create(trust: any): NSObject & OS_sec_trust;

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
