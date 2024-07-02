
interface SVCXPRT {
	xp_sock: number;
	xp_port: number;
	xp_ops: interop.Pointer | interop.Reference<xp_ops>;
	xp_addrlen: number;
	xp_raddr: sockaddr_in;
	xp_verf: opaque_auth;
	xp_p1: interop.Pointer | interop.Reference<any>;
	xp_p2: interop.Pointer | interop.Reference<any>;
}
declare var SVCXPRT: interop.StructType<SVCXPRT>;

interface XDR {
	x_op: xdr_op;
	x_ops: interop.Pointer | interop.Reference<xdr_ops>;
	x_public: interop.Pointer | interop.Reference<any>;
	x_private: interop.Pointer | interop.Reference<any>;
	x_base: interop.Pointer | interop.Reference<any>;
	x_handy: number;
}
declare var XDR: interop.StructType<XDR>;

declare var _null_auth: opaque_auth;

declare const enum accept_stat {

	SUCCESS = 0,

	PROG_UNAVAIL = 1,

	PROG_MISMATCH = 2,

	PROC_UNAVAIL = 3,

	GARBAGE_ARGS = 4,

	SYSTEM_ERR = 5
}

interface auth_ops {
	ah_nextverf: interop.FunctionReference<() => void>;
	ah_marshal: interop.FunctionReference<() => number>;
	ah_validate: interop.FunctionReference<() => number>;
	ah_refresh: interop.FunctionReference<() => number>;
	ah_destroy: interop.FunctionReference<() => void>;
}
declare var auth_ops: interop.StructType<auth_ops>;

declare const enum auth_stat {

	AUTH_OK = 0,

	AUTH_BADCRED = 1,

	AUTH_REJECTEDCRED = 2,

	AUTH_BADVERF = 3,

	AUTH_REJECTEDVERF = 4,

	AUTH_TOOWEAK = 5,

	AUTH_INVALIDRESP = 6,

	AUTH_FAILED = 7
}

interface authunix_parms {
	aup_time: number;
	aup_machname: interop.Pointer | interop.Reference<any>;
	aup_uid: number;
	aup_gid: number;
	aup_len: number;
	aup_gids: interop.Pointer | interop.Reference<number>;
}
declare var authunix_parms: interop.StructType<authunix_parms>;

declare function bindresvport(p1: number, p2: interop.Pointer | interop.Reference<sockaddr_in>): number;

declare function bindresvport_sa(p1: number, p2: interop.Pointer | interop.Reference<sockaddr>): number;

interface call_body {
	cb_rpcvers: number;
	cb_prog: number;
	cb_vers: number;
	cb_proc: number;
	cb_cred: opaque_auth;
	cb_verf: opaque_auth;
}
declare var call_body: interop.StructType<call_body>;

declare function clnt_pcreateerror(p1: string | interop.Pointer | interop.Reference<any>): void;

declare function clnt_perrno(p1: clnt_stat): void;

declare function clnt_spcreateerror(p1: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function clnt_sperrno(p1: clnt_stat): interop.Pointer | interop.Reference<any>;

declare const enum clnt_stat {

	RPC_SUCCESS = 0,

	RPC_CANTENCODEARGS = 1,

	RPC_CANTDECODERES = 2,

	RPC_CANTSEND = 3,

	RPC_CANTRECV = 4,

	RPC_TIMEDOUT = 5,

	RPC_VERSMISMATCH = 6,

	RPC_AUTHERROR = 7,

	RPC_PROGUNAVAIL = 8,

	RPC_PROGVERSMISMATCH = 9,

	RPC_PROCUNAVAIL = 10,

	RPC_CANTDECODEARGS = 11,

	RPC_SYSTEMERROR = 12,

	RPC_UNKNOWNHOST = 13,

	RPC_UNKNOWNPROTO = 17,

	RPC_PMAPFAILURE = 14,

	RPC_PROGNOTREGISTERED = 15,

	RPC_FAILED = 16
}

declare const enum msg_type {

	CALL = 0,

	REPLY = 1
}

interface netobj {
	n_len: number;
	n_bytes: interop.Pointer | interop.Reference<any>;
}
declare var netobj: interop.StructType<netobj>;

interface opaque_auth {
	oa_flavor: number;
	oa_base: interop.Pointer | interop.Reference<any>;
	oa_length: number;
}
declare var opaque_auth: interop.StructType<opaque_auth>;

declare const enum reject_stat {

	RPC_MISMATCH = 0,

	AUTH_ERROR = 1
}

declare const enum reply_stat {

	MSG_ACCEPTED = 0,

	MSG_DENIED = 1
}

declare function rpctest_service(): void;

interface short_hand_verf {
	new_cred: opaque_auth;
}
declare var short_hand_verf: interop.StructType<short_hand_verf>;

declare var svc_fdset: fd_set;

declare function svc_getreq(p1: number): void;

declare function svc_getreqset(p1: interop.Pointer | interop.Reference<fd_set>): void;

declare function svc_register(p1: interop.Pointer | interop.Reference<SVCXPRT>, p2: number, p3: number, p4: interop.FunctionReference<() => void>, p5: number): number;

interface svc_req {
	rq_prog: number;
	rq_vers: number;
	rq_proc: number;
	rq_cred: opaque_auth;
	rq_clntcred: interop.Pointer | interop.Reference<any>;
	rq_xprt: interop.Pointer | interop.Reference<SVCXPRT>;
}
declare var svc_req: interop.StructType<svc_req>;

declare function svc_run(): void;

declare function svc_sendreply(p1: interop.Pointer | interop.Reference<SVCXPRT>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>, p3: string | interop.Pointer | interop.Reference<any>): number;

declare function svc_unregister(p1: number, p2: number): void;

declare function svcerr_auth(p1: interop.Pointer | interop.Reference<SVCXPRT>, p2: auth_stat): void;

declare function svcerr_decode(p1: interop.Pointer | interop.Reference<SVCXPRT>): void;

declare function svcerr_noproc(p1: interop.Pointer | interop.Reference<SVCXPRT>): void;

declare function svcerr_noprog(p1: interop.Pointer | interop.Reference<SVCXPRT>): void;

declare function svcerr_progvers(p1: interop.Pointer | interop.Reference<SVCXPRT>, p2: number, p3: number): void;

declare function svcerr_systemerr(p1: interop.Pointer | interop.Reference<SVCXPRT>): void;

declare function svcerr_weakauth(p1: interop.Pointer | interop.Reference<SVCXPRT>): void;

declare function svcfd_create(p1: number, p2: number, p3: number): interop.Pointer | interop.Reference<SVCXPRT>;

declare function svcraw_create(): interop.Pointer | interop.Reference<SVCXPRT>;

declare function svctcp_create(p1: number, p2: number, p3: number): interop.Pointer | interop.Reference<SVCXPRT>;

declare function svcudp_bufcreate(p1: number, p2: number, p3: number): interop.Pointer | interop.Reference<SVCXPRT>;

declare function svcudp_create(p1: number): interop.Pointer | interop.Reference<SVCXPRT>;

declare function xdr_array(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.Pointer | interop.Reference<number>, p4: number, p5: number, p6: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>): number;

declare function xdr_authunix_parms(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<authunix_parms>): number;

declare function xdr_bool(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_bytes(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: interop.Pointer | interop.Reference<number>, p4: number): number;

declare function xdr_char(p1: interop.Pointer | interop.Reference<XDR>, p2: string | interop.Pointer | interop.Reference<any>): number;

interface xdr_discrim {
	value: number;
	proc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>;
}
declare var xdr_discrim: interop.StructType<xdr_discrim>;

declare function xdr_double(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_enum(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_float(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_free(p1: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>, p2: interop.Pointer | interop.Reference<any>): void;

declare function xdr_hyper(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_int(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_int16_t(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_int32_t(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_int64_t(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_long(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_longlong_t(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_netobj(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<netobj>): number;

declare const enum xdr_op {

	XDR_ENCODE = 0,

	XDR_DECODE = 1,

	XDR_FREE = 2
}

declare function xdr_opaque(p1: interop.Pointer | interop.Reference<XDR>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

interface xdr_ops {
	x_getlong: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>) => number>;
	x_putlong: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>) => number>;
	x_getbytes: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>;
	x_putbytes: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>;
	x_getpostn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>) => number>;
	x_setpostn: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: number) => number>;
	x_inline: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: number) => interop.Pointer | interop.Reference<number>>;
	x_destroy: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>) => void>;
	x_control: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: number, p3: interop.Pointer | interop.Reference<any>) => number>;
}
declare var xdr_ops: interop.StructType<xdr_ops>;

declare function xdr_pointer(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>): number;

declare function xdr_quadruple(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_reference(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: number, p4: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>): number;

declare function xdr_short(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_string(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p3: number): number;

declare function xdr_u_char(p1: interop.Pointer | interop.Reference<XDR>, p2: string | interop.Pointer | interop.Reference<any>): number;

declare function xdr_u_hyper(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_u_int(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_u_int16_t(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_u_int32_t(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_u_int64_t(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_u_long(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_u_longlong_t(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_u_short(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>): number;

declare function xdr_union(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<number>, p3: string | interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<xdr_discrim>, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>): number;

declare function xdr_vector(p1: interop.Pointer | interop.Reference<XDR>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: number, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>): number;

declare function xdr_void(): number;

declare function xdr_wrapstring(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function xdrmem_create(p1: interop.Pointer | interop.Reference<XDR>, p2: string | interop.Pointer | interop.Reference<any>, p3: number, p4: xdr_op): void;

declare function xdrrec_create(p1: interop.Pointer | interop.Reference<XDR>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>, p6: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number) => number>): void;

declare function xdrrec_endofrecord(p1: interop.Pointer | interop.Reference<XDR>, p2: number): number;

declare function xdrrec_eof(p1: interop.Pointer | interop.Reference<XDR>): number;

declare function xdrrec_readbytes(p1: interop.Pointer | interop.Reference<XDR>, p2: string | interop.Pointer | interop.Reference<any>, p3: number): number;

declare function xdrrec_skiprecord(p1: interop.Pointer | interop.Reference<XDR>): number;

declare function xdrstdio_create(p1: interop.Pointer | interop.Reference<XDR>, p2: interop.Pointer | interop.Reference<FILE>, p3: xdr_op): void;

interface xp_ops {
	xp_recv: interop.FunctionReference<() => number>;
	xp_stat: interop.FunctionReference<() => xprt_stat>;
	xp_getargs: interop.FunctionReference<() => number>;
	xp_reply: interop.FunctionReference<() => number>;
	xp_freeargs: interop.FunctionReference<() => number>;
	xp_destroy: interop.FunctionReference<() => void>;
}
declare var xp_ops: interop.StructType<xp_ops>;

declare function xprt_register(p1: interop.Pointer | interop.Reference<SVCXPRT>): void;

declare const enum xprt_stat {

	XPRT_DIED = 0,

	XPRT_MOREREQS = 1,

	XPRT_IDLE = 2
}

declare function xprt_unregister(p1: interop.Pointer | interop.Reference<SVCXPRT>): void;
