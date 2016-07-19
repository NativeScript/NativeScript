
declare function SSLAddDistinguishedName(context: any, derDN: interop.Pointer, derDNLen: number): number;

declare const enum SSLAuthenticate {

	kNeverAuthenticate = 0,

	kAlwaysAuthenticate = 1,

	kTryAuthenticate = 2
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

declare function SSLCopyDistinguishedNames(context: any, names: interop.Reference<NSArray<any>>): number;

declare function SSLCopyPeerTrust(context: any, trust: interop.Reference<any>): number;

declare function SSLCreateContext(alloc: any, protocolSide: SSLProtocolSide, connectionType: SSLConnectionType): any;

declare function SSLGetBufferedReadSize(context: any, bufSize: interop.Reference<number>): number;

declare function SSLGetClientCertificateState(context: any, clientState: interop.Reference<SSLClientCertificateState>): number;

declare function SSLGetConnection(context: any, connection: interop.Reference<interop.Pointer>): number;

declare function SSLGetDatagramWriteSize(dtlsContext: any, bufSize: interop.Reference<number>): number;

declare function SSLGetEnabledCiphers(context: any, ciphers: interop.Reference<number>, numCiphers: interop.Reference<number>): number;

declare function SSLGetMaxDatagramRecordSize(dtlsContext: any, maxSize: interop.Reference<number>): number;

declare function SSLGetNegotiatedCipher(context: any, cipherSuite: interop.Reference<number>): number;

declare function SSLGetNegotiatedProtocolVersion(context: any, protocol: interop.Reference<SSLProtocol>): number;

declare function SSLGetNumberEnabledCiphers(context: any, numCiphers: interop.Reference<number>): number;

declare function SSLGetNumberSupportedCiphers(context: any, numCiphers: interop.Reference<number>): number;

declare function SSLGetPeerDomainName(context: any, peerName: string, peerNameLen: interop.Reference<number>): number;

declare function SSLGetPeerDomainNameLength(context: any, peerNameLen: interop.Reference<number>): number;

declare function SSLGetPeerID(context: any, peerID: interop.Reference<interop.Pointer>, peerIDLen: interop.Reference<number>): number;

declare function SSLGetProtocolVersionMax(context: any, maxVersion: interop.Reference<SSLProtocol>): number;

declare function SSLGetProtocolVersionMin(context: any, minVersion: interop.Reference<SSLProtocol>): number;

declare function SSLGetSessionOption(context: any, option: SSLSessionOption, value: string): number;

declare function SSLGetSessionState(context: any, state: interop.Reference<SSLSessionState>): number;

declare function SSLGetSupportedCiphers(context: any, ciphers: interop.Reference<number>, numCiphers: interop.Reference<number>): number;

declare function SSLHandshake(context: any): number;

declare const enum SSLProtocol {

	kSSLProtocolUnknown = 0,

	kSSLProtocol3 = 2,

	kTLSProtocol1 = 4,

	kTLSProtocol11 = 7,

	kTLSProtocol12 = 8,

	kDTLSProtocol1 = 9,

	kSSLProtocol2 = 1,

	kSSLProtocol3Only = 3,

	kTLSProtocol1Only = 5,

	kSSLProtocolAll = 6
}

declare const enum SSLProtocolSide {

	kSSLServerSide = 0,

	kSSLClientSide = 1
}

declare function SSLRead(context: any, data: interop.Pointer, dataLength: number, processed: interop.Reference<number>): number;

declare const enum SSLSessionOption {

	kSSLSessionOptionBreakOnServerAuth = 0,

	kSSLSessionOptionBreakOnCertRequested = 1,

	kSSLSessionOptionBreakOnClientAuth = 2,

	kSSLSessionOptionFalseStart = 3,

	kSSLSessionOptionSendOneByteRecord = 4,

	kSSLSessionOptionAllowServerIdentityChange = 5,

	kSSLSessionOptionFallback = 6,

	kSSLSessionOptionBreakOnClientHello = 7
}

declare const enum SSLSessionState {

	kSSLIdle = 0,

	kSSLHandshake = 1,

	kSSLConnected = 2,

	kSSLClosed = 3,

	kSSLAborted = 4
}

declare const enum SSLSessionStrengthPolicy {

	kSSLSessionStrengthPolicyDefault = 0,

	kSSLSessionStrengthPolicyATSv1 = 1,

	kSSLSessionStrengthPolicyATSv1_noPFS = 2
}

declare function SSLSetCertificate(context: any, certRefs: NSArray<any>): number;

declare function SSLSetClientSideAuthenticate(context: any, auth: SSLAuthenticate): number;

declare function SSLSetConnection(context: any, connection: interop.Pointer): number;

declare function SSLSetDatagramHelloCookie(dtlsContext: any, cookie: interop.Pointer, cookieLen: number): number;

declare function SSLSetEnabledCiphers(context: any, ciphers: interop.Reference<number>, numCiphers: number): number;

declare function SSLSetEncryptionCertificate(context: any, certRefs: NSArray<any>): number;

declare function SSLSetIOFuncs(context: any, readFunc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Reference<number>) => number>, writeFunc: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Reference<number>) => number>): number;

declare function SSLSetMaxDatagramRecordSize(dtlsContext: any, maxSize: number): number;

declare function SSLSetPeerDomainName(context: any, peerName: string, peerNameLen: number): number;

declare function SSLSetPeerID(context: any, peerID: interop.Pointer, peerIDLen: number): number;

declare function SSLSetProtocolVersionMax(context: any, maxVersion: SSLProtocol): number;

declare function SSLSetProtocolVersionMin(context: any, minVersion: SSLProtocol): number;

declare function SSLSetSessionOption(context: any, option: SSLSessionOption, value: boolean): number;

declare function SSLSetSessionStrengthPolicy(context: any, policyStrength: SSLSessionStrengthPolicy): number;

declare function SSLWrite(context: any, data: interop.Pointer, dataLength: number, processed: interop.Reference<number>): number;

declare const enum SecAccessControlCreateFlags {

	kSecAccessControlUserPresence = 1,

	kSecAccessControlTouchIDAny = 2,

	kSecAccessControlTouchIDCurrentSet = 8,

	kSecAccessControlDevicePasscode = 16,

	kSecAccessControlOr = 16384,

	kSecAccessControlAnd = 32768,

	kSecAccessControlPrivateKeyUsage = 1073741824,

	kSecAccessControlApplicationPassword = -2147483648
}

declare function SecAccessControlCreateWithFlags(allocator: any, protection: any, flags: SecAccessControlCreateFlags, error: interop.Reference<NSError>): any;

declare function SecAccessControlGetTypeID(): number;

declare function SecAddSharedWebCredential(fqdn: string, account: string, password: string, completionHandler: (p1: NSError) => void): void;

declare function SecCertificateCopyData(certificate: any): NSData;

declare function SecCertificateCopySubjectSummary(certificate: any): string;

declare function SecCertificateCreateWithData(allocator: any, data: NSData): any;

declare function SecCertificateGetTypeID(): number;

declare function SecCreateSharedWebCredentialPassword(): string;

declare function SecIdentityCopyCertificate(identityRef: any, certificateRef: interop.Reference<any>): number;

declare function SecIdentityCopyPrivateKey(identityRef: any, privateKeyRef: interop.Reference<any>): number;

declare function SecIdentityGetTypeID(): number;

declare function SecItemAdd(attributes: NSDictionary<any, any>, result: interop.Reference<any>): number;

declare function SecItemCopyMatching(query: NSDictionary<any, any>, result: interop.Reference<any>): number;

declare function SecItemDelete(query: NSDictionary<any, any>): number;

declare function SecItemUpdate(query: NSDictionary<any, any>, attributesToUpdate: NSDictionary<any, any>): number;

declare function SecKeyDecrypt(key: any, padding: SecPadding, cipherText: string, cipherTextLen: number, plainText: string, plainTextLen: interop.Reference<number>): number;

declare function SecKeyEncrypt(key: any, padding: SecPadding, plainText: string, plainTextLen: number, cipherText: string, cipherTextLen: interop.Reference<number>): number;

declare function SecKeyGeneratePair(parameters: NSDictionary<any, any>, publicKey: interop.Reference<any>, privateKey: interop.Reference<any>): number;

declare function SecKeyGetBlockSize(key: any): number;

declare function SecKeyGetTypeID(): number;

declare function SecKeyRawSign(key: any, padding: SecPadding, dataToSign: string, dataToSignLen: number, sig: string, sigLen: interop.Reference<number>): number;

declare function SecKeyRawVerify(key: any, padding: SecPadding, signedData: string, signedDataLen: number, sig: string, sigLen: number): number;

declare function SecPKCS12Import(pkcs12_data: NSData, options: NSDictionary<any, any>, items: interop.Reference<NSArray<any>>): number;

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

declare function SecRandomCopyBytes(rnd: interop.Pointer, count: number, bytes: string): number;

declare function SecRequestSharedWebCredential(fqdn: string, account: string, completionHandler: (p1: NSArray<any>, p2: NSError) => void): void;

declare function SecTrustCopyCustomAnchorCertificates(trust: any, anchors: interop.Reference<NSArray<any>>): number;

declare function SecTrustCopyExceptions(trust: any): NSData;

declare function SecTrustCopyPolicies(trust: any, policies: interop.Reference<NSArray<any>>): number;

declare function SecTrustCopyProperties(trust: any): NSArray<any>;

declare function SecTrustCopyPublicKey(trust: any): any;

declare function SecTrustCopyResult(trust: any): NSDictionary<any, any>;

declare function SecTrustCreateWithCertificates(certificates: any, policies: any, trust: interop.Reference<any>): number;

declare function SecTrustEvaluate(trust: any, result: interop.Reference<number>): number;

declare function SecTrustEvaluateAsync(trust: any, queue: NSObject, result: (p1: any, p2: number) => void): number;

declare function SecTrustGetCertificateAtIndex(trust: any, ix: number): any;

declare function SecTrustGetCertificateCount(trust: any): number;

declare function SecTrustGetNetworkFetchAllowed(trust: any, allowFetch: string): number;

declare function SecTrustGetTrustResult(trust: any, result: interop.Reference<number>): number;

declare function SecTrustGetTypeID(): number;

declare function SecTrustGetVerifyTime(trust: any): number;

declare function SecTrustSetAnchorCertificates(trust: any, anchorCertificates: NSArray<any>): number;

declare function SecTrustSetAnchorCertificatesOnly(trust: any, anchorCertificatesOnly: boolean): number;

declare function SecTrustSetExceptions(trust: any, exceptions: NSData): boolean;

declare function SecTrustSetNetworkFetchAllowed(trust: any, allowFetch: boolean): number;

declare function SecTrustSetOCSPResponse(trust: any, responseData: any): number;

declare function SecTrustSetPolicies(trust: any, policies: any): number;

declare function SecTrustSetVerifyDate(trust: any, verifyDate: Date): number;

declare var kSecAttrAccessControl: string;

declare var kSecAttrAccessGroup: string;

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

declare var kSecAttrIsInvisible: string;

declare var kSecAttrIsNegative: string;

declare var kSecAttrIsPermanent: string;

declare var kSecAttrIssuer: string;

declare var kSecAttrKeyClass: string;

declare var kSecAttrKeyClassPrivate: string;

declare var kSecAttrKeyClassPublic: string;

declare var kSecAttrKeyClassSymmetric: string;

declare var kSecAttrKeySizeInBits: string;

declare var kSecAttrKeyType: string;

declare var kSecAttrKeyTypeEC: string;

declare var kSecAttrKeyTypeRSA: string;

declare var kSecAttrLabel: string;

declare var kSecAttrModificationDate: string;

declare var kSecAttrPath: string;

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

declare var kSecPrivateKeyAttrs: string;

declare var kSecPropertyTypeError: string;

declare var kSecPropertyTypeTitle: string;

declare var kSecPublicKeyAttrs: string;

declare var kSecRandomDefault: interop.Pointer;

declare var kSecReturnAttributes: string;

declare var kSecReturnData: string;

declare var kSecReturnPersistentRef: string;

declare var kSecReturnRef: string;

declare var kSecSharedPassword: string;

declare var kSecTrustCertificateTransparency: string;

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

declare var kSecUseItemList: string;

declare var kSecUseNoAuthenticationUI: string;

declare var kSecUseOperationPrompt: string;

declare var kSecValueData: string;

declare var kSecValuePersistentRef: string;

declare var kSecValueRef: string;
