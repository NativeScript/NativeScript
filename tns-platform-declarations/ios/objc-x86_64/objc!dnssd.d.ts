
interface CompileTimeAssertionChecks_DNS_SD {
	assert0: interop.Reference<number>;
}
declare var CompileTimeAssertionChecks_DNS_SD: interop.StructType<CompileTimeAssertionChecks_DNS_SD>;

declare function DNSServiceAddRecord(sdRef: interop.Pointer | interop.Reference<any>, RecordRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, rrtype: number, rdlen: number, rdata: interop.Pointer | interop.Reference<any>, ttl: number): number;

declare function DNSServiceBrowse(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, regtype: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: string, p6: string, p7: string, p8: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceConstructFullName(fullName: string | interop.Pointer | interop.Reference<any>, service: string | interop.Pointer | interop.Reference<any>, regtype: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceCreateConnection(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function DNSServiceEnumerateDomains(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: string, p6: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceGetAddrInfo(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, protocol: number, hostname: string | interop.Pointer | interop.Reference<any>, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: string, p6: interop.Pointer | interop.Reference<sockaddr>, p7: number, p8: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceGetProperty(property: string | interop.Pointer | interop.Reference<any>, result: interop.Pointer | interop.Reference<any>, size: interop.Pointer | interop.Reference<number>): number;

declare function DNSServiceNATPortMappingCreate(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, protocol: number, internalPort: number, externalPort: number, ttl: number, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: number, p6: number, p7: number, p8: number, p9: number, p10: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceProcessResult(sdRef: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceQueryRecord(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, fullname: string | interop.Pointer | interop.Reference<any>, rrtype: number, rrclass: number, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: string, p6: number, p7: number, p8: number, p9: interop.Pointer | interop.Reference<any>, p10: number, p11: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceReconfirmRecord(flags: number, interfaceIndex: number, fullname: string | interop.Pointer | interop.Reference<any>, rrtype: number, rrclass: number, rdlen: number, rdata: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceRefDeallocate(sdRef: interop.Pointer | interop.Reference<any>): void;

declare function DNSServiceRefSockFD(sdRef: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceRegister(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, name: string | interop.Pointer | interop.Reference<any>, regtype: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>, host: string | interop.Pointer | interop.Reference<any>, port: number, txtLen: number, txtRecord: interop.Pointer | interop.Reference<any>, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: string, p5: string, p6: string, p7: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceRegisterRecord(sdRef: interop.Pointer | interop.Reference<any>, RecordRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, fullname: string | interop.Pointer | interop.Reference<any>, rrtype: number, rrclass: number, rdlen: number, rdata: interop.Pointer | interop.Reference<any>, ttl: number, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceRemoveRecord(sdRef: interop.Pointer | interop.Reference<any>, RecordRef: interop.Pointer | interop.Reference<any>, flags: number): number;

declare function DNSServiceResolve(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, name: string | interop.Pointer | interop.Reference<any>, regtype: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: string, p6: string, p7: number, p8: number, p9: string, p10: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceSetDispatchQueue(service: interop.Pointer | interop.Reference<any>, queue: NSObject): number;

declare function DNSServiceSleepKeepalive(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, fd: number, timeout: number, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceUpdateRecord(sdRef: interop.Pointer | interop.Reference<any>, RecordRef: interop.Pointer | interop.Reference<any>, flags: number, rdlen: number, rdata: interop.Pointer | interop.Reference<any>, ttl: number): number;

declare function PeerConnectionRelease(flags: number, name: string | interop.Pointer | interop.Reference<any>, regtype: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): number;

declare function TXTRecordContainsKey(txtLen: number, txtRecord: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): number;

declare function TXTRecordGetCount(txtLen: number, txtRecord: interop.Pointer | interop.Reference<any>): number;

declare function TXTRecordGetItemAtIndex(txtLen: number, txtRecord: interop.Pointer | interop.Reference<any>, itemIndex: number, keyBufLen: number, key: string | interop.Pointer | interop.Reference<any>, valueLen: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function TXTRecordGetValuePtr(txtLen: number, txtRecord: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, valueLen: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare const kDNSServiceClass_IN: number;

declare const kDNSServiceErr_AlreadyRegistered: number;

declare const kDNSServiceErr_BadFlags: number;

declare const kDNSServiceErr_BadInterfaceIndex: number;

declare const kDNSServiceErr_BadKey: number;

declare const kDNSServiceErr_BadParam: number;

declare const kDNSServiceErr_BadReference: number;

declare const kDNSServiceErr_BadSig: number;

declare const kDNSServiceErr_BadState: number;

declare const kDNSServiceErr_BadTime: number;

declare const kDNSServiceErr_DefunctConnection: number;

declare const kDNSServiceErr_DoubleNAT: number;

declare const kDNSServiceErr_Firewall: number;

declare const kDNSServiceErr_Incompatible: number;

declare const kDNSServiceErr_Invalid: number;

declare const kDNSServiceErr_NATPortMappingDisabled: number;

declare const kDNSServiceErr_NATPortMappingUnsupported: number;

declare const kDNSServiceErr_NATTraversal: number;

declare const kDNSServiceErr_NameConflict: number;

declare const kDNSServiceErr_NoAuth: number;

declare const kDNSServiceErr_NoError: number;

declare const kDNSServiceErr_NoMemory: number;

declare const kDNSServiceErr_NoRouter: number;

declare const kDNSServiceErr_NoSuchKey: number;

declare const kDNSServiceErr_NoSuchName: number;

declare const kDNSServiceErr_NoSuchRecord: number;

declare const kDNSServiceErr_NotInitialized: number;

declare const kDNSServiceErr_PollingMode: number;

declare const kDNSServiceErr_Refused: number;

declare const kDNSServiceErr_ServiceNotRunning: number;

declare const kDNSServiceErr_Timeout: number;

declare const kDNSServiceErr_Transient: number;

declare const kDNSServiceErr_Unknown: number;

declare const kDNSServiceErr_Unsupported: number;

declare const kDNSServiceFlagAnsweredFromCache: number;

declare const kDNSServiceFlagsAdd: number;

declare const kDNSServiceFlagsAllowExpiredAnswers: number;

declare const kDNSServiceFlagsAllowRemoteQuery: number;

declare const kDNSServiceFlagsAutoTrigger: number;

declare const kDNSServiceFlagsBackgroundTrafficClass: number;

declare const kDNSServiceFlagsBogus: number;

declare const kDNSServiceFlagsBrowseDomains: number;

declare const kDNSServiceFlagsDefault: number;

declare const kDNSServiceFlagsExpiredAnswer: number;

declare const kDNSServiceFlagsForce: number;

declare const kDNSServiceFlagsForceMulticast: number;

declare const kDNSServiceFlagsIncludeAWDL: number;

declare const kDNSServiceFlagsIncludeP2P: number;

declare const kDNSServiceFlagsIndeterminate: number;

declare const kDNSServiceFlagsInsecure: number;

declare const kDNSServiceFlagsKnownUnique: number;

declare const kDNSServiceFlagsLongLivedQuery: number;

declare const kDNSServiceFlagsMoreComing: number;

declare const kDNSServiceFlagsNoAutoRename: number;

declare const kDNSServiceFlagsPrivateFive: number;

declare const kDNSServiceFlagsPrivateFour: number;

declare const kDNSServiceFlagsPrivateOne: number;

declare const kDNSServiceFlagsPrivateThree: number;

declare const kDNSServiceFlagsPrivateTwo: number;

declare const kDNSServiceFlagsRegistrationDomains: number;

declare const kDNSServiceFlagsReturnIntermediates: number;

declare const kDNSServiceFlagsSecure: number;

declare const kDNSServiceFlagsShareConnection: number;

declare const kDNSServiceFlagsShared: number;

declare const kDNSServiceFlagsSuppressUnusable: number;

declare const kDNSServiceFlagsThresholdFinder: number;

declare const kDNSServiceFlagsThresholdOne: number;

declare const kDNSServiceFlagsThresholdReached: number;

declare const kDNSServiceFlagsTimeout: number;

declare const kDNSServiceFlagsUnicastResponse: number;

declare const kDNSServiceFlagsUnique: number;

declare const kDNSServiceFlagsValidate: number;

declare const kDNSServiceFlagsValidateOptional: number;

declare const kDNSServiceFlagsWakeOnResolve: number;

declare const kDNSServiceFlagsWakeOnlyService: number;

declare const kDNSServiceProtocol_IPv4: number;

declare const kDNSServiceProtocol_IPv6: number;

declare const kDNSServiceProtocol_TCP: number;

declare const kDNSServiceProtocol_UDP: number;

declare const kDNSServiceType_A: number;

declare const kDNSServiceType_A6: number;

declare const kDNSServiceType_AAAA: number;

declare const kDNSServiceType_AFSDB: number;

declare const kDNSServiceType_ANY: number;

declare const kDNSServiceType_APL: number;

declare const kDNSServiceType_ATMA: number;

declare const kDNSServiceType_AXFR: number;

declare const kDNSServiceType_CERT: number;

declare const kDNSServiceType_CNAME: number;

declare const kDNSServiceType_DHCID: number;

declare const kDNSServiceType_DNAME: number;

declare const kDNSServiceType_DNSKEY: number;

declare const kDNSServiceType_DS: number;

declare const kDNSServiceType_EID: number;

declare const kDNSServiceType_GID: number;

declare const kDNSServiceType_GPOS: number;

declare const kDNSServiceType_HINFO: number;

declare const kDNSServiceType_HIP: number;

declare const kDNSServiceType_IPSECKEY: number;

declare const kDNSServiceType_ISDN: number;

declare const kDNSServiceType_IXFR: number;

declare const kDNSServiceType_KEY: number;

declare const kDNSServiceType_KX: number;

declare const kDNSServiceType_LOC: number;

declare const kDNSServiceType_MAILA: number;

declare const kDNSServiceType_MAILB: number;

declare const kDNSServiceType_MB: number;

declare const kDNSServiceType_MD: number;

declare const kDNSServiceType_MF: number;

declare const kDNSServiceType_MG: number;

declare const kDNSServiceType_MINFO: number;

declare const kDNSServiceType_MR: number;

declare const kDNSServiceType_MX: number;

declare const kDNSServiceType_NAPTR: number;

declare const kDNSServiceType_NIMLOC: number;

declare const kDNSServiceType_NS: number;

declare const kDNSServiceType_NSAP: number;

declare const kDNSServiceType_NSAP_PTR: number;

declare const kDNSServiceType_NSEC: number;

declare const kDNSServiceType_NSEC3: number;

declare const kDNSServiceType_NSEC3PARAM: number;

declare const kDNSServiceType_NULL: number;

declare const kDNSServiceType_NXT: number;

declare const kDNSServiceType_OPT: number;

declare const kDNSServiceType_PTR: number;

declare const kDNSServiceType_PX: number;

declare const kDNSServiceType_RP: number;

declare const kDNSServiceType_RRSIG: number;

declare const kDNSServiceType_RT: number;

declare const kDNSServiceType_SIG: number;

declare const kDNSServiceType_SINK: number;

declare const kDNSServiceType_SOA: number;

declare const kDNSServiceType_SPF: number;

declare const kDNSServiceType_SRV: number;

declare const kDNSServiceType_SSHFP: number;

declare const kDNSServiceType_TKEY: number;

declare const kDNSServiceType_TSIG: number;

declare const kDNSServiceType_TXT: number;

declare const kDNSServiceType_UID: number;

declare const kDNSServiceType_UINFO: number;

declare const kDNSServiceType_UNSPEC: number;

declare const kDNSServiceType_WKS: number;

declare const kDNSServiceType_X25: number;
