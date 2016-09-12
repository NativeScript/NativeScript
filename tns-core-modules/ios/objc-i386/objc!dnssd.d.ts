
interface CompileTimeAssertionChecks_DNS_SD {
	assert0: interop.Reference<number>;
}
declare var CompileTimeAssertionChecks_DNS_SD: interop.StructType<CompileTimeAssertionChecks_DNS_SD>;

declare function DNSServiceAddRecord(sdRef: interop.Pointer | interop.Reference<any>, RecordRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, rrtype: number, rdlen: number, rdata: interop.Pointer | interop.Reference<any>, ttl: number): number;

declare function DNSServiceBrowse(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, regtype: string, domain: string, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: string, p6: string, p7: string, p8: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceConstructFullName(fullName: string, service: string, regtype: string, domain: string): number;

declare function DNSServiceCreateConnection(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function DNSServiceEnumerateDomains(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: string, p6: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceGetAddrInfo(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, protocol: number, hostname: string, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: string, p6: interop.Pointer | interop.Reference<sockaddr>, p7: number, p8: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceGetProperty(property: string, result: interop.Pointer | interop.Reference<any>, size: interop.Pointer | interop.Reference<number>): number;

declare function DNSServiceNATPortMappingCreate(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, protocol: number, internalPort: number, externalPort: number, ttl: number, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: number, p6: number, p7: number, p8: number, p9: number, p10: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceProcessResult(sdRef: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceQueryRecord(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, fullname: string, rrtype: number, rrclass: number, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: string, p6: number, p7: number, p8: number, p9: interop.Pointer | interop.Reference<any>, p10: number, p11: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceReconfirmRecord(flags: number, interfaceIndex: number, fullname: string, rrtype: number, rrclass: number, rdlen: number, rdata: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceRefDeallocate(sdRef: interop.Pointer | interop.Reference<any>): void;

declare function DNSServiceRefSockFD(sdRef: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceRegister(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, name: string, regtype: string, domain: string, host: string, port: number, txtLen: number, txtRecord: interop.Pointer | interop.Reference<any>, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: string, p5: string, p6: string, p7: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceRegisterRecord(sdRef: interop.Pointer | interop.Reference<any>, RecordRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, fullname: string, rrtype: number, rrclass: number, rdlen: number, rdata: interop.Pointer | interop.Reference<any>, ttl: number, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceRemoveRecord(sdRef: interop.Pointer | interop.Reference<any>, RecordRef: interop.Pointer | interop.Reference<any>, flags: number): number;

declare function DNSServiceResolve(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, interfaceIndex: number, name: string, regtype: string, domain: string, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: number, p5: string, p6: string, p7: number, p8: number, p9: string, p10: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceSetDispatchQueue(service: interop.Pointer | interop.Reference<any>, queue: NSObject): number;

declare function DNSServiceSleepKeepalive(sdRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, flags: number, fd: number, timeout: number, callBack: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): number;

declare function DNSServiceUpdateRecord(sdRef: interop.Pointer | interop.Reference<any>, RecordRef: interop.Pointer | interop.Reference<any>, flags: number, rdlen: number, rdata: interop.Pointer | interop.Reference<any>, ttl: number): number;

declare function PeerConnectionRelease(flags: number, name: string, regtype: string, domain: string): number;

declare function TXTRecordContainsKey(txtLen: number, txtRecord: interop.Pointer | interop.Reference<any>, key: string): number;

declare function TXTRecordGetCount(txtLen: number, txtRecord: interop.Pointer | interop.Reference<any>): number;

declare function TXTRecordGetItemAtIndex(txtLen: number, txtRecord: interop.Pointer | interop.Reference<any>, itemIndex: number, keyBufLen: number, key: string, valueLen: string, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function TXTRecordGetValuePtr(txtLen: number, txtRecord: interop.Pointer | interop.Reference<any>, key: string, valueLen: string): interop.Pointer | interop.Reference<any>;
